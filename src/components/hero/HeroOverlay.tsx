"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export function HeroOverlay() {
    const { scrollY } = useScroll();
    const [viewH, setViewH] = useState(1000);

    useEffect(() => {
        setViewH(window.innerHeight);
        const onResize = () => setViewH(window.innerHeight);
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Fade out the overlay as user scrolls through the hero (start fading at 0.8vh, fully gone at 2vh)
    const opacity = useTransform(scrollY, [viewH * 0.6, viewH * 1.8], [1, 0]);
    // Slight upward drift as it fades
    const y = useTransform(scrollY, [viewH * 0.6, viewH * 1.8], [0, -80]);

    return (
        <motion.div
            style={{ opacity, y }}
            className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
            <div className="max-w-5xl mx-auto px-6 text-center pointer-events-auto">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-text-secondary mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-accent-gold animate-glow-pulse" />
                    AI-Powered Video Generation
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl sm:text-7xl md:text-8xl font-display font-bold leading-[0.95] tracking-tight mb-6"
                >
                    <span className="text-gradient">Create Ads</span>
                    <br />
                    <span className="text-gradient-accent">That Convert</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed"
                >
                    Upload your product. Let AI craft cinematic short-form video ads in
                    seconds. No editing skills needed.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/generator">
                        <Button variant="primary" size="lg">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            Generate Your First Ad
                        </Button>
                    </Link>
                    <Button variant="secondary" size="lg">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Watch Demo
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-16 flex items-center justify-center gap-8 md:gap-16"
                >
                    {[
                        { value: "10K+", label: "Ads Generated" },
                        { value: "50+", label: "Templates" },
                        { value: "4.9★", label: "User Rating" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-gradient-accent">
                                {stat.value}
                            </p>
                            <p className="text-xs md:text-sm text-text-muted mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
