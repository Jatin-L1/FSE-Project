"use client";

import { useEffect, useRef, useCallback } from "react";

const FRAME_COUNT = 40;
const SCROLL_HEIGHT_MULTIPLIER = 5; // 5x viewport height for scroll range

function getFramePath(index: number): string {
    const num = String(index).padStart(3, "0");
    return `/frames/ezgif-frame-${num}.jpg`;
}

export function HeroCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(0);
    const targetFrameRef = useRef(0);
    const rafRef = useRef<number>(0);
    const loadedCountRef = useRef(0);

    // Preload all frames
    useEffect(() => {
        const images: HTMLImageElement[] = [];

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                loadedCountRef.current++;
                if (loadedCountRef.current === 1) {
                    renderFrame(0);
                }
            };
            images.push(img);
        }

        imagesRef.current = images;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render a specific frame to canvas
    const renderFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imagesRef.current[frameIndex];

        if (!canvas || !ctx || !img || !img.complete) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cover scaling (like background-size: cover)
        const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Dark vignette overlay
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.2,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.8
        );
        gradient.addColorStop(0, "rgba(15, 15, 20, 0)");
        gradient.addColorStop(1, "rgba(15, 15, 20, 0.6)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Smooth animation loop
    useEffect(() => {
        const ease = 0.08;

        const animate = () => {
            const diff = targetFrameRef.current - currentFrameRef.current;
            if (Math.abs(diff) > 0.1) {
                currentFrameRef.current += diff * ease;
                const frameIndex = Math.min(
                    FRAME_COUNT - 1,
                    Math.max(0, Math.round(currentFrameRef.current))
                );
                renderFrame(frameIndex);
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [renderFrame]);

    // Scroll handler — maps scroll position to frame index
    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const scrollProgress = Math.max(
                0,
                Math.min(1, -rect.top / (rect.height - window.innerHeight))
            );

            targetFrameRef.current = scrollProgress * (FRAME_COUNT - 1);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Canvas resize handler
    useEffect(() => {
        const handleResize = () => {
            const frameIndex = Math.round(currentFrameRef.current);
            renderFrame(Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex)));
        };

        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, [renderFrame]);

    return (
        <div
            ref={containerRef}
            style={{ height: `${100 * SCROLL_HEIGHT_MULTIPLIER}vh` }}
            className="relative"
        >
            <div className="sticky top-0 w-full h-screen overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    aria-hidden="true"
                />
                {/* Deep bottom gradient for flawless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
