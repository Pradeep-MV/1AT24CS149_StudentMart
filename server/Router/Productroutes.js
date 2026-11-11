const express = require("express");
const Product = require("../Models/Product");

const router = express.Router();

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

// ADD a product
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

module.exports = router;