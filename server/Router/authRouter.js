const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../Models/User");

const router = express.Router();

// =====================================
// REGISTER API
// =====================================

router.post("/register", async (req, res) => {
    try {
        const { name, usn, email, password } = req.body;

        // Check required fields
        if (!name || !usn || !email || !password) {
            return res.status(400).json({
                message: "Name, USN, email and password are required"
            });
        }

        // Normalize input
        const normalizedName = name.trim();
        const normalizedUSN = usn.trim().toUpperCase();
        const normalizedEmail = email.trim().toLowerCase();

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing email
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Check existing USN
        const existingUSN = await User.findOne({
            usn: normalizedUSN
        });

        if (existingUSN) {
            return res.status(409).json({
                message: "USN already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in MongoDB
        const newUser = await User.create({
            name: normalizedName,
            usn: normalizedUSN,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: newUser._id,
                name: newUser.name,
                usn: newUser.usn,
                email: newUser.email,
                phone: newUser.phone,
                college: newUser.college,
                course: newUser.course,
                semester: newUser.semester,
                year: newUser.year,
                dateOfBirth: newUser.dateOfBirth
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate-key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            if (field === "usn") {
                return res.status(409).json({
                    message: "This USN is already registered"
                });
            }

            if (field === "email") {
                return res.status(409).json({
                    message: "This email is already registered"
                });
            }

            return res.status(409).json({
                message: "A record with these details already exists"
            });
        }

        return res.status(500).json({
            message: "Server error during registration"
        });
    }
});


// =====================================
// LOGIN API
// =====================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Successful login
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                usn: user.usn,
                email: user.email,
                phone: user.phone,
                college: user.college,
                course: user.course,
                semester: user.semester,
                year: user.year,
                dateOfBirth: user.dateOfBirth
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
});

module.exports = router;
