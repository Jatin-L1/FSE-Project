const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ─── GET /api/user/profile ────────────────────────────────────
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ user: user.toProfile() });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── POST /api/user/credits/deduct ───────────────────────────
router.post("/credits/deduct", auth, async (req, res) => {
    try {
        const { amount = 1 } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.credits < amount) {
            return res.status(400).json({ message: "Insufficient credits." });
        }

        user.credits -= amount;
        await user.save();

        res.json({
            credits: user.credits,
            message: `${amount} credit(s) deducted. ${user.credits} remaining.`,
        });
    } catch (error) {
        console.error("Deduct credits error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
