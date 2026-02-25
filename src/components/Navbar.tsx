"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/payment";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Generator", href: "/generator" },
    { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user, loading, logout, refreshUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleUpgrade = async () => {
        try {
            await paymentService.initiateUpgrade();
            // Refetch user profile to get updated role and credits
            await refreshUser();
        } catch {
            router.push("/#pricing");
        }
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                    : "bg-transparent"
                }
      `}
        >
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <Logo size={38} />
                    <span className="text-xl font-bold tracking-tight">
                        AI<span className="text-accent-purple">Ads</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-text-secondary hover:text-text-primary transition-colors duration-300 text-sm font-medium relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-accent-purple to-accent-indigo group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </div>

                {/* Desktop CTAs */}
                <div className="hidden md:flex items-center gap-3">
                    {!loading && isAuthenticated && user ? (
                        <>
                            {/* Credits Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light border border-border text-sm">
                                <svg className="w-4 h-4 text-accent-gold" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.89-8.9c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67c-.15-.45-.82-1.92-2.54-2.24V5h-2v1.26c-2.48.56-2.49 2.86-2.49 2.96 0 2.27 2.25 2.91 3.35 3.31 1.58.56 2.28 1.07 2.28 2.03 0 1.13-1.05 1.61-1.98 1.61-1.82 0-2.34-1.87-2.4-2.09l-1.66.67c.63 2.19 2.28 2.78 2.9 2.96V19h2v-1.24c.4-.09 2.9-.59 2.9-3.22 0-1.39-.61-2.61-3.01-3.44z" />
                                </svg>
                                <span className="text-text-secondary font-medium">{user.credits}</span>
                            </div>

                            {/* Upgrade Button (free users only) */}
                            {user.role === "free" && (
                                <Button variant="outline" size="sm" onClick={handleUpgrade}>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Upgrade to Pro
                                </Button>
                            )}

                            {/* User Menu */}
                            <div className="flex items-center gap-2 pl-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center text-white text-xs font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : !loading ? (
                        <>
                            <Link href="/signin">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    ) : null}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                    <motion.span
                        animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                        className="w-6 h-0.5 bg-text-primary rounded-full block transition-transform"
                    />
                    <motion.span
                        animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                        className="w-6 h-0.5 bg-text-primary rounded-full block"
                    />
                    <motion.span
                        animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                        className="w-6 h-0.5 bg-text-primary rounded-full block transition-transform"
                    />
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-text-secondary hover:text-text-primary transition-colors py-2 text-lg"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 pt-4 border-t border-border">
                                {isAuthenticated && user ? (
                                    <>
                                        {/* Mobile: user info */}
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center text-white font-bold">
                                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="text-text-primary text-sm font-medium">{user.name}</p>
                                                <p className="text-text-muted text-xs">
                                                    {user.credits} credits • {user.role === "pro" ? "Pro" : "Free"}
                                                </p>
                                            </div>
                                        </div>
                                        {user.role === "free" && (
                                            <Button variant="primary" fullWidth onClick={() => { setMobileOpen(false); handleUpgrade(); }}>
                                                Upgrade to Pro
                                            </Button>
                                        )}
                                        <Button variant="outline" fullWidth onClick={() => { setMobileOpen(false); logout(); }}>
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/signin" onClick={() => setMobileOpen(false)}>
                                            <Button variant="outline" fullWidth>
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setMobileOpen(false)}>
                                            <Button variant="primary" fullWidth>
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
