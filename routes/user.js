import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Toggle ghost mode for a user
router.put("/:id/ghost", async (req, res) => {
    try {
        const { enabled } = req.body; // true/false
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.ghostMode = Boolean(enabled);
        await user.save();

        res.json({ message: "Ghost mode updated", ghostMode: user.ghostMode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile (includes ghostMode)
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("username email ghostMode");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;