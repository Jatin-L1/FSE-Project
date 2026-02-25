"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface GlassPanelData {
    label: string;
    value: string;
    icon: string;
    position: string;
    delay: number;
}

const panels: GlassPanelData[] = [
    {
        label: "Processing",
        value: "Neural Engine Active",
        icon: "⚡",
        position: "top-[20%] left-[5%] md:left-[8%]",
        delay: 0.5,
    },
    {
        label: "Rendering",
        value: "4K @ 60fps",
        icon: "🎬",
        position: "top-[35%] right-[5%] md:right-[8%]",
        delay: 0.8,
    },
    {
        label: "Ad Score",
        value: "98/100",
        icon: "📊",
        position: "bottom-[30%] left-[5%] md:left-[12%]",
        delay: 1.1,
    },
    {
        label: "Export",
        value: "Ready",
        icon: "✨",
        position: "bottom-[20%] right-[5%] md:right-[10%]",
        delay: 1.4,
    },
];

function GlassPanelItem({ panel, index }: { panel: GlassPanelData; index: number }) {
    const { scrollY } = useScroll();
    const [viewH, setViewH] = useState(1000);

    useEffect(() => {
        setViewH(window.innerHeight);
        const onResize = () => setViewH(window.innerHeight);
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const y = useTransform(
        scrollY,
        [0, viewH * 2],
        [0, index % 2 === 0 ? -40 : 40]
    );

    const opacity = useTransform(
        scrollY,
        [viewH * 0.5, viewH * 1.5],
        [1, 0]
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: panel.delay }}
            style={{ y, opacity }}
            className={`absolute ${panel.position} hidden md:block`}
        >
            <div className="glass rounded-2xl px-5 py-4 min-w-[180px]">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{panel.icon}</span>
                    <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">
                            {panel.label}
                        </p>
                        <p className="text-sm font-semibold text-text-primary">
                            {panel.value}
                        </p>
                    </div>
                </div>
                {/* Subtle progress bar */}
                <div className="mt-3 h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-accent-purple to-accent-gold rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2,
                            delay: panel.delay + 0.5,
                            ease: "easeOut",
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export function GlassPanels() {
    return (
        <div className="fixed inset-0 z-[8] pointer-events-none">
            {panels.map((panel, i) => (
                <GlassPanelItem key={panel.label} panel={panel} index={i} />
            ))}
        </div>
    );
}
