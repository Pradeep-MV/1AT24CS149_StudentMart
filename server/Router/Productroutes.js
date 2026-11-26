const express = require("express");
const Product = require("../Models/Product");
const Cart = require("../Models/Cart");

const router = express.Router();

// GET all products (with optional search, filter, sort)
router.get("/", async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const filter = {};

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category && category !== "All") {
            filter.category = category;
        }

        let query = Product.find(filter);

        if (sort === "lowToHigh") {
            query = query.sort({ price: 1 });
        } else if (sort === "highToLow") {
            query = query.sort({ price: -1 });
        }

        const products = await query.exec();

        res.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({
            message: "Unable to fetch products"
        });
    }
});

// GET a single product
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        console.error("Fetch product error:", error);
        res.status(500).json({
            message: "Unable to fetch product"
        });
    }
});

// ADD a product (Admin capability)
router.post("/", async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof category !== "string" || !category.trim()
        ) {
            return res.status(400).json({
                message: "Name, description and category are required"
            });
        }

        const parsedPrice = Number(price);
        const parsedStock = stock === undefined || stock === ""
            ? 0
            : Number(stock);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                message: "Price must be a non-negative number"
            });
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative whole number"
            });
        }

        if (image !== undefined && typeof image !== "string") {
            return res.status(400).json({
                message: "Image must be a URL string"
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            image: image?.trim() || "",
            stock: parsedStock
        });

        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({
            message: "Unable to add product"
        });
    }
});

// UPDATE / MODIFY a product (Admin capability)
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category !== undefined) updateData.category = category.trim();
        if (image !== undefined) updateData.image = image.trim();

        if (price !== undefined && price !== "") {
            const parsedPrice = Number(price);
            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    message: "Price must be a non-negative number"
                });
            }
            updateData.price = parsedPrice;
        }

        if (stock !== undefined && stock !== "") {
            const parsedStock = Number(stock);
            if (!Number.isInteger(parsedStock) || parsedStock < 0) {
                return res.status(400).json({
                    message: "Stock must be a non-negative whole number"
                });
            }
            updateData.stock = parsedStock;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            message: "Unable to update product"
        });
    }
});

// DELETE a product (Admin capability)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Remove this product from all user carts
        try {
            await Cart.updateMany(
                {},
                { $pull: { items: { product: id } } }
            );
        } catch (cartErr) {
            console.error("Cart cleanup error on product deletion:", cartErr);
        }

        res.json({
            message: "Product deleted successfully",
            deletedId: id
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            message: "Unable to delete product"
        });
    }
});

module.exports = router;