const express = require("express");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ─── PhonePe V2 Configuration ───────────────────────────────────
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_CLIENT_VERSION = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1");
const PHONEPE_ENV = process.env.PHONEPE_ENV || "SANDBOX";

// API base URLs
const BASE_URL =
    PHONEPE_ENV === "PRODUCTION"
        ? "https://api.phonepe.com/apis/hermes"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const GENERATION_AMOUNT_PAISE = 100; // ₹1 = 100 paise

// ─── Token cache ────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAuthToken() {
    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
        return cachedToken;
    }

    const response = await fetch(`${BASE_URL}/v1/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: PHONEPE_CLIENT_ID,
            client_secret: PHONEPE_CLIENT_SECRET,
            client_version: String(PHONEPE_CLIENT_VERSION),
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("PhonePe token error:", data);
        throw new Error("Failed to obtain PhonePe auth token");
    }

    // PhonePe returns access_token (with underscore) directly in response
    const token = data.access_token || data.data?.accessToken;
    const expiresAt = data.expires_at || data.data?.expiresAt;

    if (!token) {
        console.error("PhonePe token error - no access_token in response:", data);
        throw new Error("Failed to obtain PhonePe auth token");
    }

    cachedToken = token;
    tokenExpiresAt = expiresAt ? expiresAt * 1000 : Date.now() + 15 * 60 * 1000;
    return cachedToken;
}

// ─── POST /api/payment/initiate-generation ──────────────────────
// Checks if user needs to pay. First generation is free, subsequent ones cost ₹1.
router.post("/initiate-generation", auth, async (req, res) => {
    try {
        // Check credentials FIRST before doing anything else
        const isPhonePeConfigured = PHONEPE_CLIENT_ID && 
            PHONEPE_CLIENT_SECRET && 
            PHONEPE_CLIENT_ID !== 'your_client_id_here' && 
            PHONEPE_CLIENT_SECRET !== 'your_client_secret_here';

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        // First generation is free
        if (user.generationCount === 0) {
            return res.json({
                free: true,
                message: "First generation is free! Enjoy.",
                generationCount: user.generationCount,
            });
        }

        // If PhonePe not configured, allow free generations
        if (!isPhonePeConfigured) {
            console.log("PhonePe not configured - allowing free generation");
            return res.json({
                free: true,
                message: "Payment gateway not configured. Generation is free!",
                generationCount: user.generationCount,
            });
        }

        const merchantOrderId = `GEN_${user._id}_${Date.now()}`;
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";

        // Get auth token (only if PhonePe is configured)
        const token = await getAuthToken();

        // Create payment request via V2 Standard Checkout
        const payload = {
            merchantOrderId,
            amount: GENERATION_AMOUNT_PAISE,
            expireAfter: 1200, // 20 minutes
            metaInfo: {
                udf1: user._id.toString(),
                udf2: "ad-generation",
            },
            paymentFlow: {
                type: "PG_CHECKOUT",
                merchantUrls: {
                    redirectUrl: `${frontendUrl}/payment/callback?orderId=${merchantOrderId}`,
                },
            },
        };

        const response = await fetch(`${BASE_URL}/checkout/v2/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `O-Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.redirectUrl) {
            res.json({
                free: false,
                redirectUrl: data.redirectUrl,
                orderId: merchantOrderId,
                amount: GENERATION_AMOUNT_PAISE / 100,
            });
        } else {
            console.error("PhonePe payment initiation failed:", data);
            res.status(400).json({
                success: false,
                message: data.message || "Payment initiation failed.",
                error: data,
            });
        }
    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(500).json({ message: "Server error during payment initiation." });
    }
});

// ─── GET /api/payment/verify-generation/:orderId ────────────────
// Called by the frontend after PhonePe redirects back.
router.get("/verify-generation/:orderId", auth, async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET || 
            PHONEPE_CLIENT_ID === 'your_client_id_here' || 
            PHONEPE_CLIENT_SECRET === 'your_client_secret_here') {
            // PhonePe not configured - just mark as successful
            await incrementGenerationCount(orderId);
            return res.json({
                success: true,
                message: "Payment gateway not configured. Generation allowed!",
                orderId,
            });
        }

        const token = await getAuthToken();

        const response = await fetch(
            `${BASE_URL}/checkout/v2/order/${orderId}/status`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `O-Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (data.state === "COMPLETED") {
            // Payment successful — increment generation count
            await incrementGenerationCount(orderId);
            res.json({
                success: true,
                message: "Payment verified! You can now generate your ad.",
                orderId,
            });
        } else {
            res.json({
                success: false,
                state: data.state,
                message:
                    data.state === "PENDING"
                        ? "Payment is still being processed. Please wait."
                        : "Payment was not completed.",
            });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error during verification." });
    }
});

// ─── GET /api/payment/check-generation ──────────────────────────
// Quick check: does the user need to pay for the next generation?
router.get("/check-generation", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        res.json({
            generationCount: user.generationCount,
            needsPayment: user.generationCount > 0,
            amount: user.generationCount > 0 ? 1 : 0, // ₹1 or free
        });
    } catch (error) {
        console.error("Check generation error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── POST /api/payment/record-free-generation ───────────────────
// Called after the first (free) generation completes successfully.
router.post("/record-free-generation", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.generationCount !== 0) {
            return res
                .status(400)
                .json({ message: "Free generation already used." });
        }

        user.generationCount = 1;
        await user.save();

        res.json({
            success: true,
            generationCount: user.generationCount,
            message: "Free generation recorded.",
        });
    } catch (error) {
        console.error("Record free generation error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── POST /api/payment/webhook ──────────────────────────────────
// PhonePe calls this after a transaction completes (server-to-server).
router.post("/webhook", async (req, res) => {
    try {
        const { type, payload } = req.body;

        console.log("PhonePe webhook received:", type);

        if (type === "PG_ORDER_COMPLETED" && payload) {
            const orderId = payload.merchantOrderId;
            const state = payload.state;

            if (state === "COMPLETED" && orderId) {
                await incrementGenerationCount(orderId);
                console.log(`Webhook: Order ${orderId} completed successfully.`);
            }
        }

        // Always respond 200 to acknowledge the webhook
        res.status(200).json({ message: "Webhook processed." });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(200).json({ message: "Webhook received with errors." });
    }
});

// ─── Helper: parse orderId and increment generation count ───────
// orderId format: GEN_{userId}_{timestamp}
async function incrementGenerationCount(orderId) {
    const parts = orderId.split("_");
    if (parts.length < 2) return;
    const userId = parts[1];
    try {
        const user = await User.findById(userId);
        if (user) {
            user.generationCount += 1;
            await user.save();
        }
    } catch (err) {
        console.error("Failed to increment generation count:", err);
    }
}

// ─── Legacy: Keep old initiate and verify for backward compat ───
// POST /api/payment/initiate (old Pro upgrade — kept for reference)
router.post("/initiate", auth, async (req, res) => {
    res.status(410).json({
        message: "Pro upgrade has been replaced with pay-per-generation. Use /initiate-generation instead.",
    });
});

// GET /api/payment/verify/:transactionId (old)
router.get("/verify/:transactionId", auth, async (req, res) => {
    res.status(410).json({
        message: "Old verification endpoint deprecated. Use /verify-generation/:orderId instead.",
    });
});

module.exports = router;
