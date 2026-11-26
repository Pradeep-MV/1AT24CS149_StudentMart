const express = require("express");
const User = require("../Models/User");
const Cart = require("../Models/Cart");

const router = express.Router();

// GET all users (Admin only)
router.get("/", async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({
            message: "Unable to fetch users",
            error: error.message
        });
    }
});

// UPDATE user role (Admin only)
router.put("/:id/role", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["student", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Role must be either 'student' or 'admin'"
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({
            message: "Unable to update user role",
            error: error.message
        });
    }
});

// DELETE user (Admin only)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent deleting the main system admin
        if (user.email === "admin@studentmart.com") {
            return res.status(403).json({
                message: "Cannot delete the default system administrator account"
            });
        }

        await User.findByIdAndDelete(id);

        // Also clean up user's cart
        try {
            await Cart.findOneAndDelete({ user: id });
        } catch (cartErr) {
            console.error("User cart cleanup error:", cartErr);
        }

        res.status(200).json({
            message: `User ${user.name} (${user.email}) deleted successfully`,
            deletedId: id
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            message: "Unable to delete user",
            error: error.message
        });
    }
});

module.exports = router;