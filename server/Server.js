const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
const authRoutes = require("./Router/authRouter");
const productRoutes = require("./Router/Productroutes");
const cartRoutes = require("./Router/CartRouter");
const userRoutes = require("./Router/userRouter");
const orderRoutes = require("./Router/OrderRouter");

// Home API
app.get("/", (req, res) => {
    res.json({
        message: "StudentMart API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        const PORT = process.env.PORT || 5002;

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });