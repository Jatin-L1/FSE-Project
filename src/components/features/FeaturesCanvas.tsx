"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 40;
const SCROLL_HEIGHT_MULTIPLIER = 8; // 8x viewport for generous scroll range

function getFramePath(index: number): string {
    const num = String(index).padStart(3, "0");
    return `/frames/features-frames/ezgif-frame-${num}.jpg`;
}

// Feature definitions with their scroll ranges (0–1 across the section)
const features = [
    {
        id: "script",
        title: "AI Script Generation",
        description:
            "Our AI analyzes your product and generates compelling, conversion-optimized ad scripts tailored to your audience.",
        icon: "✦",
        range: [0.0, 0.2] as [number, number],
        align: "left" as const,
    },
    {
        id: "scene",
        title: "Auto Scene Composition",
        description:
            "Intelligent scene arrangement powered by computer vision. Automatically frames your product with cinematic compositions.",
        icon: "◈",
        range: [0.18, 0.4] as [number, number],
        align: "right" as const,
    },
    {
        id: "music",
        title: "Smart Music Sync",
        description:
            "AI-driven audio matching that selects and syncs the perfect soundtrack to your ad's tempo, mood, and personality.",
        icon: "♪",
        range: [0.38, 0.6] as [number, number],
        align: "left" as const,
    },
    {
        id: "analytics",
        title: "Performance Analytics",
        description:
            "Track engagement predictions, click-through estimates, and conversion potential before you even publish.",
        icon: "◉",
        range: [0.58, 0.8] as [number, number],
        align: "right" as const,
    },
    {
        id: "export",
        title: "Multi-Format Export",
        description:
            "Export your ads in 9:16, 1:1, or 16:9 — all optimized for platform-specific performance on every channel.",
        icon: "⬡",
        range: [0.78, 1.0] as [number, number],
        align: "left" as const,
    },
];

export function FeaturesCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(0);
    const targetFrameRef = useRef(0);
    const rafRef = useRef<number>(0);

    const [activeFeature, setActiveFeature] = useState(0);

    // Use scroll progress tied to this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Track which feature is active based on scroll
    useMotionValueEvent(scrollYProgress, "change", (progress) => {
        // Map scroll progress to frame
        targetFrameRef.current = progress * (FRAME_COUNT - 1);

        // Map to active feature
        for (let i = features.length - 1; i >= 0; i--) {
            const mid = (features[i].range[0] + features[i].range[1]) / 2;
            if (progress >= mid - 0.1) {
                setActiveFeature(i);
                break;
            }
        }
    });

    // Preload frames
    useEffect(() => {
        const images: HTMLImageElement[] = [];
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                if (i === 1) renderFrame(0);
            };
            images.push(img);
        }
        imagesRef.current = images;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imagesRef.current[frameIndex];
        if (!canvas || !ctx || !img || !img.complete) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cover scaling
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Dark overlay for text readability
        ctx.fillStyle = "rgba(15, 15, 20, 0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vignette
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.75
        );
        gradient.addColorStop(0, "rgba(15, 15, 20, 0)");
        gradient.addColorStop(1, "rgba(15, 15, 20, 0.5)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Smooth animation loop
    useEffect(() => {
        const ease = 0.1;
        const animate = () => {
            const diff = targetFrameRef.current - currentFrameRef.current;
            if (Math.abs(diff) > 0.05) {
                currentFrameRef.current += diff * ease;
                const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(currentFrameRef.current)));
                renderFrame(idx);
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [renderFrame]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const idx = Math.round(currentFrameRef.current);
            renderFrame(Math.min(FRAME_COUNT - 1, Math.max(0, idx)));
        };
        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, [renderFrame]);

    return (
        <section id="features" ref={containerRef} style={{ height: `${100 * SCROLL_HEIGHT_MULTIPLIER}vh` }} className="relative">
            <div className="sticky top-0 w-full h-screen overflow-hidden">
                {/* Canvas */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

                {/* Section label */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-text-secondary"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-glow-pulse" />
                        Features
                    </motion.div>
                </div>

                {/* Feature text overlays */}
                <div className="absolute inset-0 z-10 flex items-center">
                    <div className="w-full max-w-7xl mx-auto px-8 md:px-16">
                        {features.map((feature, i) => {
                            const isActive = activeFeature === i;
                            return (
                                <FeatureLabel key={feature.id} feature={feature} isActive={isActive} scrollProgress={scrollYProgress} />
                            );
                        })}
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-3">
                    {features.map((feature, i) => (
                        <div
                            key={feature.id}
                            className={`w-2 rounded-full transition-all duration-500 ${activeFeature === i
                                    ? "h-8 bg-gradient-to-b from-accent-purple to-accent-gold"
                                    : "h-2 bg-white/20"
                                }`}
                        />
                    ))}
                </div>

                {/* Bottom gradient to next section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
                {/* Top gradient from hero */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
            </div>
        </section>
    );
}

// Separate component for each feature label
function FeatureLabel({
    feature,
    isActive,
    scrollProgress,
}: {
    feature: (typeof features)[number];
    isActive: boolean;
    scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
    const opacity = useTransform(
        scrollProgress,
        [
            feature.range[0] - 0.02,
            feature.range[0] + 0.05,
            feature.range[1] - 0.05,
            feature.range[1] + 0.02,
        ],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollProgress,
        [feature.range[0] - 0.02, feature.range[0] + 0.05, feature.range[1] - 0.05, feature.range[1] + 0.02],
        [40, 0, 0, -40]
    );

    const x = useTransform(
        scrollProgress,
        [feature.range[0] - 0.02, feature.range[0] + 0.05],
        [feature.align === "left" ? -30 : 30, 0]
    );

    return (
        <motion.div
            style={{ opacity, y, x }}
            className={`absolute max-w-lg ${feature.align === "left" ? "left-8 md:left-16" : "right-8 md:right-16 text-right"
                }`}
        >
            {/* Icon badge */}
            <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border border-accent-purple/30 text-2xl
        ${isActive ? "bg-accent-purple/20 shadow-[0_0_30px_rgba(124,58,237,0.3)]" : "bg-surface/60"}
        transition-all duration-500`}
            >
                {feature.icon}
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-gradient mb-4 leading-tight">
                {feature.title}
            </h3>

            {/* Description */}
            <p className="text-base md:text-lg text-text-secondary leading-relaxed">
                {feature.description}
            </p>

            {/* Accent line */}
            <div
                className={`mt-6 h-1 rounded-full bg-gradient-to-r from-accent-purple to-accent-gold transition-all duration-700 ${isActive ? "w-20 opacity-100" : "w-0 opacity-0"
                    } ${feature.align === "right" ? "ml-auto" : ""}`}
            />
        </motion.div>
    );
}
