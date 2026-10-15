const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// ==============================
// REGISTER
// ==============================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Check empty fields

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // Validate email

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            return res.status(400).json({
                message: "Please enter a valid email"
            });

        }


        // Validate password

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });

        }


        // Check existing user

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });


        // Send response

        res.status(201).json({
            message: "Registration successful"
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==============================
// LOGIN
// ==============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check fields

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        // Find user

        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }


        // Compare password

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({
                message:
                    "Invalid email or password"
            });

        }


        // Login successful

        res.json({

            message: "Login successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


module.exports = router;