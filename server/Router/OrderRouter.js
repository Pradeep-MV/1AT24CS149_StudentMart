const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Order = require("../Models/Orders");
const Cart = require("../Models/Cart");
const User = require("../Models/User");

// Middleware: Get user info from request header
const authUser = async (req, res, next) => {
    const userId = req.headers["x-user-id"];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({
            message: "Authentication required. Please login."
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }
        req.userId = userId;
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Authentication error",
            error: error.message
        });
    }
};

// Generate human-friendly order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SM-${timestamp}${random}`;
};

// POST: Place a new order
router.post("/", authUser, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Cannot place an order with an empty cart."
            });
        }

        // Validate shipping address
        if (!shippingAddress) {
            return res.status(400).json({
                message: "Delivery address details are required."
            });
        }

        const { fullName, phone, address, city, postalCode, latitude, longitude } = shippingAddress;
        if (!fullName || !phone || !address || !city || !postalCode) {
            return res.status(400).json({
                message: "Please fill in all delivery address fields (Name, Phone, Address, City, Postal Code)."
            });
        }

        // Validate payment method
        const validMethods = ["COD", "UPI", "CARD"];
        const selectedMethod = (paymentMethod || "COD").toUpperCase();
        if (!validMethods.includes(selectedMethod)) {
            return res.status(400).json({
                message: "Invalid payment method selected."
            });
        }

        // Clean & sanitize items
        const sanitizedItems = items.map((item) => ({
            product: item.product?._id || item.product || item._id,
            name: item.product?.name || item.name || "Product Item",
            price: Number(item.product?.price || item.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.product?.image || item.image || ""
        }));

        const calculatedTotal = totalAmount !== undefined
            ? Number(totalAmount)
            : sanitizedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

        const orderId = generateOrderId();

        const newOrder = new Order({
            orderId,
            user: req.userId,
            items: sanitizedItems,
            totalAmount: calculatedTotal,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
                postalCode: postalCode.trim(),
                ...(typeof latitude === "number" && typeof longitude === "number"
                    ? { latitude, longitude }
                    : {})
            },
            paymentMethod: selectedMethod,
            paymentStatus: selectedMethod === "COD" ? "Pending" : "Completed",
            orderStatus: "Placed"
        });

        await newOrder.save();

        // Automatically empty the user's cart in DB
        await Cart.findOneAndUpdate(
            { user: req.userId },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder
        });
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({
            message: "Failed to place order.",
            error: error.message
        });
    }
});

// GET: Fetch orders (Student gets own orders; Admin gets all orders)
router.get("/", authUser, async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";
        let query = {};

        if (!isAdmin) {
            query.user = req.userId;
        }

        const orders = await Order.find(query)
            .populate("user", "name email usn phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Fetch orders failed:", error);
        res.status(500).json({
            message: "Failed to retrieve orders.",
            error: error.message
        });
    }
});

// GET: Fetch single order by ID
router.get("/:id", authUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email usn phone");

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        if (order.user._id.toString() !== req.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to view this order."
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve order details.",
            error: error.message
        });
    }
});

// PUT: Update order status (Admin or Student cancellation)
router.put("/:id/status", authUser, async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        const isAdmin = req.user.role === "admin";
        const isOwner = order.user.toString() === req.userId;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Not authorized to update this order."
            });
        }

        // Student can only cancel if it's currently "Placed"
        if (!isAdmin && isOwner) {
            if (orderStatus !== "Cancelled") {
                return res.status(403).json({
                    message: "Students can only cancel placed orders."
                });
            }
            if (order.orderStatus !== "Placed") {
                return res.status(400).json({
                    message: `Cannot cancel order that is already ${order.orderStatus}.`
                });
            }
            order.orderStatus = "Cancelled";
        }

        // Admin can update any status
        if (isAdmin) {
            if (orderStatus) {
                const validStatuses = ["Placed", "Processing", "Delivered", "Cancelled"];
                if (!validStatuses.includes(orderStatus)) {
                    return res.status(400).json({
                        message: "Invalid status value."
                    });
                }
                order.orderStatus = orderStatus;
            }
            if (paymentStatus) {
                order.paymentStatus = paymentStatus;
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${order.orderStatus}`,
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update order status.",
            error: error.message
        });
    }
});

module.exports = router;