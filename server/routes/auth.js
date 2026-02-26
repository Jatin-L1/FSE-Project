const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ─── POST /api/auth/signup ────────────────────────────────────
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        // Create user (password is hashed by the pre-save hook)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: "free",
            credits: 50,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: user.toProfile(),
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password." });
        }

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!user.password) {
            return res.status(401).json({
                message: "This account uses Google Sign-In. Please sign in with Google.",
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: user.toProfile(),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
    try {
        res.json({
            user: req.user.toProfile(),
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── Google OAuth ─────────────────────────────────────────────

// Check if Google OAuth is configured
const isGoogleConfigured = () => {
    const id = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.GOOGLE_CLIENT_SECRET;
    return id && secret && !id.startsWith("YOUR_") && !secret.startsWith("YOUR_");
};

// GET /api/auth/google — initiate Google login
router.get("/google", (req, res, next) => {
    if (!isGoogleConfigured()) {
        return res.status(503).json({
            message: "Google Sign-In is not configured yet. Please use email/password login.",
        });
    }
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })(req, res, next);
});

// GET /api/auth/google/callback — Google redirects here
router.get("/google/callback", (req, res, next) => {
    if (!isGoogleConfigured()) {
        return res.redirect(`${process.env.CLIENT_URL}/signin?error=google_not_configured`);
    }
    passport.authenticate("google", {
        failureRedirect: `${process.env.CLIENT_URL}/signin?error=google_failed`,
    })(req, res, (err) => {
        if (err) {
            return res.redirect(`${process.env.CLIENT_URL}/signin?error=google_failed`);
        }
        // Generate JWT for the authenticated user
        const token = generateToken(req.user._id);
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    });
});

module.exports = router;
