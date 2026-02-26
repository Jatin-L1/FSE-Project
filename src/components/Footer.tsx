"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "Generator", href: "/generator" },
        { label: "Pricing", href: "#pricing" },
        { label: "API", href: "#" },
    ],
    Company: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
    ],
    Legal: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
    ],
};

export function Footer() {
    return (
        <footer className="relative border-t border-white/[0.06] bg-background">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <Logo size={34} />
                            <span className="text-lg font-bold tracking-tight">
                                AI<span className="text-accent-purple">Ads</span>
                            </span>
                        </Link>
                        <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                            Generate cinematic short-form ads with AI. Built for the next generation of creators.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-text-primary font-semibold text-sm mb-4 tracking-wide uppercase">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-text-muted hover:text-text-primary text-sm transition-colors duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <p className="text-text-muted text-sm">
                        © {new Date().getFullYear()} AIAds. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Social Icons */}
                        {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="text-text-muted hover:text-accent-purple transition-colors duration-300 text-sm"
                                aria-label={social}
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
