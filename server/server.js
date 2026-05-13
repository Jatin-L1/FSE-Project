// Use Google DNS to avoid ISP blocking MongoDB SRV lookups
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const passport = require("./config/passport");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const communityRoutes = require("./routes/community");

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps, curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.some((allowed) => origin === allowed || origin.endsWith(".vercel.app"))) {
                return callback(null, true);
            }
            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Session (required for Passport Google OAuth)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "fallback-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/community", communityRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error." });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 AI Ads Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google\n`);
});
