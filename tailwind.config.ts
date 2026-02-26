import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F0F14",
                surface: "#16161D",
                "surface-light": "#1E1E28",
                border: "#2A2A36",
                accent: {
                    purple: "#7C3AED",
                    indigo: "#6366F1",
                    gold: "#F59E0B",
                },
                text: {
                    primary: "#FFFFFF",
                    secondary: "#A1A1AA",
                    muted: "#71717A",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                display: ["var(--font-playfair)", "Georgia", "serif"],
            },
            animation: {
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "particle-rise": "particle-rise 8s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
            },
            keyframes: {
                "glow-pulse": {
                    "0%, 100%": { opacity: "0.4" },
                    "50%": { opacity: "1" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "particle-rise": {
                    "0%": { transform: "translateY(100%) scale(0)", opacity: "0" },
                    "20%": { opacity: "1" },
                    "100%": { transform: "translateY(-100vh) scale(1)", opacity: "0" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-primary": "linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #7C3AED 100%)",
                "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
