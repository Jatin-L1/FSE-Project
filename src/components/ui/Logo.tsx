import React from "react";

export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="AIAds logo"
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <filter id="logo-glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background rounded square */}
            <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logo-gradient)" />

            {/* Inner dark area */}
            <rect x="6" y="6" width="36" height="36" rx="10" fill="#0F0F14" fillOpacity="0.4" />

            {/* AI lightning bolt / spark symbol */}
            <g filter="url(#logo-glow)">
                {/* Main "A" shape formed by lightning */}
                <path
                    d="M24 8L14 28h7l-3 12 12-18h-7l5-14z"
                    fill="white"
                    fillOpacity="0.95"
                />
                {/* Gold accent spark */}
                <circle cx="33" cy="14" r="3" fill="url(#logo-gold)" fillOpacity="0.9" />
                <circle cx="35" cy="12" r="1.5" fill="url(#logo-gold)" fillOpacity="0.6" />
            </g>
        </svg>
    );
}
