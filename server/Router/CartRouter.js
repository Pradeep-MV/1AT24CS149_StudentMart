
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Cart = require("../Models/Cart");
const Product = require("../Models/Product");

// Middleware: Get user ID from request header
// Replace this with proper authentication middleware
// if your project already uses JWT authentication.
const getUserId = (req, res, next) => {
    const userId = req.headers["x-user-id"];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({
            message: "Please login to access your cart"
        });
    }

    req.userId = userId;
    next();
};

// GET: View user's cart
router.get("/", getUserId, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId })
            .populate("items.product");

        if (!cart) {
            return res.status(200).json({
                user: req.userId,
                items: []
            });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch cart",
            error: error.message
        });
    }
});

// POST: Add product to cart
router.post("/add", getUserId, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Not enough stock available"
            });
        }

        let cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            cart = new Cart({
                user: req.userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({
                    message: "Requested quantity exceeds available stock"
                });
            }

            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.save();

        await cart.populate("items.product");

        res.status(200).json({
            message: "Product added to cart successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to add product to cart",
            error: error.message
        });
    }
});

// PUT: Update product quantity
router.put("/update/:productId", getUserId, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        const cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();
        await cart.populate("items.product");

        res.status(200).json({
            message: "Cart quantity updated successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to update cart",
            error: error.message
        });
    }
});

// DELETE: Remove one product from cart
router.delete("/remove/:productId", getUserId, async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cart.save();
        await cart.populate("items.product");

        res.status(200).json({
            message: "Product removed from cart",
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to remove product",
            error: error.message
        });
    }
});

// DELETE: Clear entire cart
router.delete("/clear", getUserId, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });

        if (!cart) {
            return res.status(200).json({
                message: "Cart is already empty",
                items: []
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to clear cart",
            error: error.message
        });
    }
});

module.exports = router;
