const express = require("express");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const PHONEPE_API_URL =
    process.env.PHONEPE_API_URL ||
    "https://api-preprod.phonepe.com/apis/pg-sandbox"; // Use sandbox for testing; switch to https://api.phonepe.com/apis/hermes for production
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PRO_AMOUNT_PAISA = 99900; // ₹999 in paisa

// ─── Helper: compute PhonePe checksum ───────────────────────────
function computeChecksum(payload, endpoint) {
    return (
        crypto
            .createHash("sha256")
            .update(payload + endpoint + SALT_KEY)
            .digest("hex") +
        "###" +
        SALT_INDEX
    );
}

// ─── POST /api/payment/initiate ──────────────────────────────────
// Creates a PhonePe payment request and returns the redirect URL.
router.post("/initiate", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });
        if (user.role === "pro")
            return res.status(400).json({ message: "Already a Pro user." });

        if (!MERCHANT_ID || !SALT_KEY) {
            return res
                .status(500)
                .json({ message: "Payment gateway not configured." });
        }

        const transactionId = `TXN_${user._id}_${Date.now()}`;
        const frontendUrl =
            process.env.CLIENT_URL || "http://localhost:3000";
        const serverUrl =
            process.env.SERVER_URL || "http://localhost:5000";

        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: `USER_${user._id}`,
            amount: PRO_AMOUNT_PAISA,
            redirectUrl: `${frontendUrl}/payment/callback?txnId=${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: `${serverUrl}/api/payment/webhook`,
            mobileNumber: user.phone || undefined,
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
            "base64"
        );
        const checksum = computeChecksum(base64Payload, "/pg/v1/pay");

        const response = await fetch(`${PHONEPE_API_URL}/pg/v1/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
            },
            body: JSON.stringify({ request: base64Payload }),
        });

        const data = await response.json();

        if (data.success) {
            res.json({
                success: true,
                redirectUrl:
                    data.data.instrumentResponse.redirectInfo.url,
                transactionId,
            });
        } else {
            res.status(400).json({
                success: false,
                message: data.message || "Payment initiation failed.",
            });
        }
    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── GET /api/payment/verify/:transactionId ──────────────────────
// Called by the frontend after PhonePe redirects back.
router.get("/verify/:transactionId", auth, async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!MERCHANT_ID || !SALT_KEY) {
            return res
                .status(500)
                .json({ message: "Payment gateway not configured." });
        }

        const endpoint = `/pg/v1/status/${MERCHANT_ID}/${transactionId}`;
        const checksum = computeChecksum("", endpoint);

        const response = await fetch(
            `${PHONEPE_API_URL}${endpoint}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": checksum,
                    "X-MERCHANT-ID": MERCHANT_ID,
                },
            }
        );

        const data = await response.json();

        if (data.success && data.code === "PAYMENT_SUCCESS") {
            await upgradeUserFromTransaction(transactionId);
            res.json({
                success: true,
                message: "Payment verified. Upgraded to Pro!",
            });
        } else {
            res.json({
                success: false,
                code: data.code,
                message: data.message || "Payment not completed.",
            });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── POST /api/payment/webhook ───────────────────────────────────
// PhonePe calls this after a transaction completes (server-to-server).
router.post("/webhook", async (req, res) => {
    try {
        const { response: encodedResponse } = req.body;
        const xVerify = req.headers["x-verify"];

        if (!encodedResponse || !xVerify) {
            return res
                .status(400)
                .json({ message: "Invalid webhook payload." });
        }

        // Verify webhook signature
        const [receivedHash] = xVerify.split("###");
        const expectedHash = crypto
            .createHash("sha256")
            .update(encodedResponse + SALT_KEY)
            .digest("hex");

        if (receivedHash !== expectedHash) {
            return res
                .status(401)
                .json({ message: "Webhook verification failed." });
        }

        const decoded = JSON.parse(
            Buffer.from(encodedResponse, "base64").toString("utf-8")
        );

        if (decoded.code === "PAYMENT_SUCCESS") {
            const transactionId = decoded.data.merchantTransactionId;
            await upgradeUserFromTransaction(transactionId);
        }

        res.status(200).json({ message: "Webhook processed." });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ─── Helper: parse transactionId and upgrade user ───────────────
// transactionId format: TXN_{userId}_{timestamp}
async function upgradeUserFromTransaction(transactionId) {
    const parts = transactionId.split("_");
    if (parts.length < 2) return;
    const userId = parts[1];
    const user = await User.findById(userId);
    if (user && user.role !== "pro") {
        user.role = "pro";
        user.credits = 400;
        await user.save();
    }
}

module.exports = router;
