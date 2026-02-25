"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    fullWidth?: boolean;
}

export function Button({
    variant = "primary",
    size = "md",
    children,
    fullWidth = false,
    className = "",
    ...props
}: ButtonProps) {
    const baseClasses =
        "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer overflow-hidden";

    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const variantClasses = {
        primary:
            "bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] active:scale-[0.98]",
        secondary:
            "bg-surface-light text-text-primary border border-border hover:border-accent-purple/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]",
        outline:
            "bg-transparent text-text-primary border border-border hover:border-accent-purple/50 hover:bg-accent-purple/5",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            {variant === "primary" && (
                <span className="absolute inset-0 bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-purple bg-[length:200%_100%] animate-shimmer opacity-0 hover:opacity-30 transition-opacity" />
            )}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
}
