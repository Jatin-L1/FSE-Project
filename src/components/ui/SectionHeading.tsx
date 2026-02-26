"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}

export function SectionHeading({
    title,
    subtitle,
    centered = true,
    className = "",
}: SectionHeadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`${centered ? "text-center" : ""} ${className}`}
        >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
            <div className="mt-6 mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-accent-purple to-accent-indigo" />
        </motion.div>
    );
}
