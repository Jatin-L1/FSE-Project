"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
            {/* Header */}
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => router.push("/")}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
                        Pay only for what you use. No subscriptions, no hidden fees.
                    </p>
                    <p className="text-lg text-purple-400 font-semibold">
                        First ad generation is FREE! 🎉
                    </p>
                </motion.div>
            </div>

            {/* Pricing Card */}
            <div className="container mx-auto px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 md:p-12">
                        <div className="text-center mb-8">
                            <div className="inline-block bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-2 mb-4">
                                <span className="text-purple-400 font-semibold">Pay Per Generation</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                ₹1 <span className="text-2xl text-gray-400">per ad</span>
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Generate as many ads as you need, when you need them
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">First Ad Free</h3>
                                    <p className="text-gray-400 text-sm">Try our service with your first ad generation completely free</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">AI-Powered Generation</h3>
                                    <p className="text-gray-400 text-sm">High-quality images using Flux AI model via Pollinations.ai</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Multiple Aspect Ratios</h3>
                                    <p className="text-gray-400 text-sm">16:9, 9:16, 1:1, 4:3, 3:4 - perfect for any platform</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">6 Style Options</h3>
                                    <p className="text-gray-400 text-sm">Cinematic, Minimal, Bold, Corporate, Playful, Luxury</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Instant Payment</h3>
                                    <p className="text-gray-400 text-sm">Secure payment via PhonePe - UPI, Cards, Wallets supported</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">No Expiry</h3>
                                    <p className="text-gray-400 text-sm">Your generated ads are yours forever - download anytime</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center">
                            <button
                                onClick={() => router.push(user ? "/generator" : "/auth/login")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                            >
                                {user ? "Start Generating" : "Get Started Free"}
                            </button>
                            <p className="text-gray-500 text-sm mt-4">
                                {user ? "Your first ad is free!" : "Sign up and get your first ad free!"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* How It Works */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-400">1</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Sign Up</h3>
                            <p className="text-gray-400 text-sm">
                                Create your free account in seconds
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-400">2</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Generate Free Ad</h3>
                            <p className="text-gray-400 text-sm">
                                Your first ad generation is completely free
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-400">3</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Pay ₹1 Per Ad</h3>
                            <p className="text-gray-400 text-sm">
                                For additional ads, pay just ₹1 each via PhonePe
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-400">4</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Download & Use</h3>
                            <p className="text-gray-400 text-sm">
                                Download your ad and use it anywhere
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* FAQ */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">Is the first ad really free?</h3>
                            <p className="text-gray-400">
                                Yes! Your first ad generation is completely free. No credit card required. Try our service risk-free.
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">How does the payment work?</h3>
                            <p className="text-gray-400">
                                After your first free ad, each additional ad costs ₹1. When you click generate, you'll be redirected to PhonePe for secure payment. After payment, you'll be brought back to generate your ad.
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">What payment methods are accepted?</h3>
                            <p className="text-gray-400">
                                We use PhonePe for payments, which supports UPI, Credit/Debit Cards, Net Banking, and all major wallets.
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">Can I generate multiple ads at once?</h3>
                            <p className="text-gray-400">
                                Each ad is generated individually. You pay ₹1 per ad, so if you need 5 ads, you'll pay ₹5 total (plus your first free one).
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">Do my ads expire?</h3>
                            <p className="text-gray-400">
                                No! Once generated, your ads are yours forever. You can download them anytime from your dashboard.
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">What if I'm not satisfied with my ad?</h3>
                            <p className="text-gray-400">
                                At ₹1 per ad, you can generate multiple variations until you find the perfect one. Each generation is a new ad with different creative output.
                            </p>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">Is there a subscription option?</h3>
                            <p className="text-gray-400">
                                Currently, we only offer pay-per-generation pricing. This gives you maximum flexibility - pay only for what you use, no monthly commitments.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Final CTA */}
            <div className="container mx-auto px-4 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="max-w-2xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Create Amazing Ads?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Start with your free ad today. No credit card required.
                    </p>
                    <button
                        onClick={() => router.push(user ? "/generator" : "/auth/login")}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                    >
                        {user ? "Go to Generator" : "Sign Up Free"}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
