"use client";

import { motion } from "framer-motion";
import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: "purple" | "gold" | "none";
}

export function GlassCard({
    children,
    className = "",
    hover = true,
    glow = "none",
}: GlassCardProps) {
    const glowClasses = {
        purple: "hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]",
        gold: "hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
        none: "",
    };

    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
        relative rounded-2xl overflow-hidden
        bg-surface/60 backdrop-blur-xl
        border border-white/[0.06]
        ${glowClasses[glow]}
        transition-shadow duration-500
        ${className}
      `}
        >
            {/* Gradient border overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-gold/5 pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
