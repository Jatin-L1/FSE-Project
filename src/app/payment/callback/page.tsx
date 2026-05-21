"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentService } from "@/services/payment";
import { useAuth } from "@/hooks/useAuth";

type Status = "verifying" | "success" | "failed" | "pending";

function PaymentCallbackInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const orderId = searchParams.get("orderId");
        if (!orderId) {
            setStatus("failed");
            setMessage("Invalid payment session. No order ID found.");
            return;
        }

        (async () => {
            try {
                const result = await paymentService.verifyGeneration(orderId);
                if (result.success) {
                    await refreshUser();
                    setStatus("success");
                    setMessage(result.message || "Payment successful! Redirecting to generate your ad...");
                    // Auto-redirect to generator after 2 seconds
                    setTimeout(() => {
                        router.push("/generator?paid=true");
                    }, 2000);
                } else if (result.state === "PENDING") {
                    setStatus("pending");
                    setMessage("Your payment is being processed. This may take a moment...");
                    // Retry verification after 5 seconds
                    setTimeout(async () => {
                        try {
                            const retry = await paymentService.verifyGeneration(orderId);
                            if (retry.success) {
                                await refreshUser();
                                setStatus("success");
                                setMessage("Payment confirmed! Redirecting...");
                                setTimeout(() => router.push("/generator?paid=true"), 2000);
                            } else {
                                setStatus("failed");
                                setMessage(retry.message || "Payment could not be verified. Please contact support.");
                            }
                        } catch {
                            setStatus("failed");
                            setMessage("Verification timed out. If you were charged, please contact support.");
                        }
                    }, 5000);
                } else {
                    setStatus("failed");
                    setMessage(result.message || "Payment could not be verified. Please contact support.");
                }
            } catch {
                setStatus("failed");
                setMessage("An error occurred while verifying your payment. Please contact support.");
            }
        })();
    }, [searchParams, refreshUser, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="max-w-md w-full text-center">
                {status === "verifying" && (
                    <div>
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment</h1>
                        <p className="text-gray-400">Please wait while we confirm your payment...</p>
                    </div>
                )}

                {status === "pending" && (
                    <div>
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Processing</h1>
                        <p className="text-gray-400">{message}</p>
                        <p className="text-yellow-400 text-sm mt-4">Please don&apos;t close this page...</p>
                    </div>
                )}

                {status === "success" && (
                    <div>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                        <p className="text-gray-400 mb-4">{message}</p>
                        <p className="text-purple-400 font-semibold mb-6">₹1 payment confirmed. Your ad is ready to generate!</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            Redirecting to generator...
                        </div>
                    </div>
                )}

                {status === "failed" && (
                    <div>
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
                        <p className="text-gray-400 mb-8">{message}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.push("/generator")}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PaymentCallbackInner />
        </Suspense>
    );
}
