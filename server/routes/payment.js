const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ─── POST /api/payment/upgrade ────────────────────────────────
// This is a placeholder. In production, integrate PhonePe SDK here.
router.post("/upgrade", auth, async (req, res) => {
    try {
        // TODO: Integrate PhonePe payment gateway
        // For now, simulate upgrade for testing
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.role === "pro") {
            return res.status(400).json({ message: "Already a Pro user." });
        }

        // In production, this would return a PhonePe redirect URL
        // For now, directly upgrade the user (for testing)
        user.role = "pro";
        user.credits = 400;
        await user.save();

        res.json({
            success: true,
            message: "Upgraded to Pro!",
            user: user.toProfile(),
            // redirectUrl: "https://phonepe.com/pay/..." // In production
        });
    } catch (error) {
        console.error("Upgrade error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── GET /api/payment/verify/:transactionId ───────────────────
router.get("/verify/:transactionId", auth, async (req, res) => {
    try {
        // TODO: Verify PhonePe transaction
        res.json({ success: true });
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
