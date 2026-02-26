"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    hue: number;
}

export function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const scrollOpacityRef = useRef(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        // Track scroll to fade particles out
        const handleScroll = () => {
            const vh = window.innerHeight;
            const scrollY = window.scrollY;
            // Fade from 1→0 between 0.6vh and 1.8vh of scroll
            const fadeStart = vh * 0.6;
            const fadeEnd = vh * 1.8;
            if (scrollY <= fadeStart) {
                scrollOpacityRef.current = 1;
            } else if (scrollY >= fadeEnd) {
                scrollOpacityRef.current = 0;
            } else {
                scrollOpacityRef.current = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Create particles
        const PARTICLE_COUNT = 60;
        const particles: Particle[] = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 200,
                size: Math.random() * 3 + 1,
                speedY: -(Math.random() * 0.8 + 0.2),
                speedX: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.6 + 0.1,
                hue: Math.random() > 0.7 ? 38 : 268, // Gold or Purple
            });
        }
        particlesRef.current = particles;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const globalOpacity = scrollOpacityRef.current;
            if (globalOpacity <= 0.01) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            particles.forEach((p) => {
                // Anti-gravity float upward
                p.y += p.speedY;
                p.x += p.speedX + Math.sin(p.y * 0.01) * 0.2;

                // Reset particle when off screen
                if (p.y < -20) {
                    p.y = canvas.height + 20;
                    p.x = Math.random() * canvas.width;
                    p.opacity = Math.random() * 0.6 + 0.1;
                }

                // Fade based on position
                const fadeRange = canvas.height * 0.2;
                let alpha = p.opacity * globalOpacity;
                if (p.y > canvas.height - fadeRange) {
                    alpha *= (canvas.height - p.y) / fadeRange;
                }
                if (p.y < fadeRange) {
                    alpha *= p.y / fadeRange;
                }

                // Draw particle with glow
                ctx.save();
                ctx.globalAlpha = alpha;

                // Outer glow
                const gradient = ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.size * 4
                );
                if (p.hue === 38) {
                    gradient.addColorStop(0, "rgba(245, 158, 11, 0.8)");
                    gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.2)");
                    gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
                } else {
                    gradient.addColorStop(0, "rgba(124, 58, 237, 0.8)");
                    gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.2)");
                    gradient.addColorStop(1, "rgba(124, 58, 237, 0)");
                }

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.fillStyle = p.hue === 38
                    ? "rgba(245, 158, 11, 1)"
                    : "rgba(124, 58, 237, 1)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[5] pointer-events-none"
            aria-hidden="true"
        />
    );
}
