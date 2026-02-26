"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}

export function FeatureCard({
    icon,
    title,
    description,
    index,
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
            }}
        >
            <GlassCard hover glow="purple" className="p-8 h-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-indigo/10 flex items-center justify-center mb-6 border border-accent-purple/20">
                    <div className="text-accent-purple">{icon}</div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-text-primary mb-3 tracking-tight">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed">
                    {description}
                </p>

                {/* Bottom accent line */}
                <div className="mt-6 h-px w-full bg-gradient-to-r from-accent-purple/20 via-accent-indigo/10 to-transparent" />
            </GlassCard>
        </motion.div>
    );
}
