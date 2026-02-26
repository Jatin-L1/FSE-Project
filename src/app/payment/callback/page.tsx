"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentService } from "@/services/payment";
import { useAuth } from "@/hooks/useAuth";

type Status = "verifying" | "success" | "failed";

function PaymentCallbackInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const txnId = searchParams.get("txnId");
        if (!txnId) {
            setStatus("failed");
            setMessage("Invalid payment session. No transaction ID found.");
            return;
        }

        (async () => {
            try {
                const result = await paymentService.verifyPayment(txnId);
                if (result.success) {
                    await refreshUser();
                    setStatus("success");
                    setMessage(result.message || "Payment successful! You are now a Pro user.");
                } else {
                    setStatus("failed");
                    setMessage(result.message || "Payment could not be verified. Please contact support.");
                }
            } catch {
                setStatus("failed");
                setMessage("An error occurred while verifying your payment. Please contact support.");
            }
        })();
    }, [searchParams, refreshUser]);

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

                {status === "success" && (
                    <div>
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <p className="text-purple-400 font-semibold mb-8">You now have 400 credits to use.</p>
                        <button
                            onClick={() => router.push("/generator")}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Start Generating
                        </button>
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
                                Go Back
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
