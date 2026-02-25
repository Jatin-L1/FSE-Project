"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className={`relative ${className}`}>
            <input
                id={inputId}
                className={`
          w-full px-4 pt-6 pb-2 rounded-xl
          bg-surface-light/80 backdrop-blur-sm
          border transition-all duration-300
          text-text-primary placeholder-transparent
          outline-none
          ${focused
                        ? "border-accent-purple/60 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                        : error
                            ? "border-red-500/50"
                            : "border-border"
                    }
          hover:border-accent-purple/30
        `}
                placeholder={label}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                    setFocused(false);
                    setHasValue(e.target.value.length > 0);
                }}
                onChange={(e) => setHasValue(e.target.value.length > 0)}
                aria-label={label}
                aria-invalid={!!error}
                {...props}
            />
            <label
                htmlFor={inputId}
                className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${focused || hasValue
                        ? "top-2 text-xs text-accent-purple"
                        : "top-1/2 -translate-y-1/2 text-sm text-text-muted"
                    }
        `}
            >
                {label}
            </label>

            {/* Focus glow line */}
            <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-accent-purple to-accent-indigo rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: focused ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
            />

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-1 text-xs text-red-400"
                        role="alert"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
