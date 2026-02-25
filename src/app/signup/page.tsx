"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signup, googleLogin, loading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/generator");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup(name, email, password);
            router.push("/generator");
        } catch {
            // Error is already set in context
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
                {/* Animated gradient background */}
                <div className="absolute inset-0">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-accent-indigo/30 via-background to-accent-purple/20"
                        animate={{
                            background: [
                                "radial-gradient(circle at 80% 30%, rgba(99,102,241,0.3) 0%, rgba(15,15,20,1) 50%)",
                                "radial-gradient(circle at 20% 70%, rgba(124,58,237,0.3) 0%, rgba(15,15,20,1) 50%)",
                                "radial-gradient(circle at 60% 80%, rgba(245,158,11,0.15) 0%, rgba(15,15,20,1) 50%)",
                                "radial-gradient(circle at 80% 30%, rgba(99,102,241,0.3) 0%, rgba(15,15,20,1) 50%)",
                            ],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }} />

                {/* Content */}
                <div className="relative z-10 max-w-md px-12">
                    <Link href="/" className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            AI<span className="text-accent-purple">Ads</span>
                        </span>
                    </Link>

                    <h2 className="font-display text-4xl font-bold text-gradient leading-tight mb-4">
                        Start creating ads that captivate audiences
                    </h2>
                    <p className="text-text-secondary leading-relaxed">
                        Join thousands of creators, brands, and agencies using AI to generate scroll-stopping video ads.
                    </p>

                    {/* Features list */}
                    <div className="mt-10 space-y-4">
                        {[
                            "50 free credits to get started",
                            "No credit card required",
                            "Export in multiple formats",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span className="text-text-secondary text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-20 relative">
                {/* Subtle bg gradient */}
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-indigo/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            AI<span className="text-accent-purple">Ads</span>
                        </span>
                    </Link>

                    <h1 className="text-3xl font-display font-bold text-gradient mb-2">
                        Create Account
                    </h1>
                    <p className="text-text-secondary mb-8">
                        Start generating AI-powered ads today
                    </p>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={clearError}
                                    className="text-red-400 hover:text-red-300 text-xs ml-4"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Google SSO */}
                    <button
                        onClick={googleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-surface-light border border-border hover:border-accent-purple/30 transition-all duration-300 mb-6 cursor-pointer group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-text-secondary group-hover:text-text-primary transition-colors text-sm font-medium">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-text-muted text-xs uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Form */}
                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            label="Full name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <p className="text-xs text-text-muted">
                            By signing up, you agree to our{" "}
                            <a href="#" className="text-accent-purple hover:underline">Terms</a>
                            {" "}and{" "}
                            <a href="#" className="text-accent-purple hover:underline">Privacy Policy</a>
                        </p>

                        <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-text-muted text-sm">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-accent-purple hover:text-accent-indigo transition-colors font-medium">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
