"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user";

const adStyles = [
    { id: "luxury", label: "Luxury", icon: "✨" },
    { id: "bold", label: "Bold", icon: "🔥" },
    { id: "minimal", label: "Minimal", icon: "◯" },
    { id: "viral", label: "Viral", icon: "⚡" },
];

const aspectRatios = ["9:16", "16:9"];
const durations = [
    { value: "4", label: "4s" },
    { value: "6", label: "6s" },
    { value: "8", label: "8s" },
];

interface AdCopy {
    headline: string;
    subheadline: string;
    cta: string;
    bodyText: string;
    colorScheme: string;
    mood: string;
    targetAudience: string;
    videoDescription?: string;
}

interface GeneratedAd {
    adCopy: AdCopy;
    generatedVideo: {
        data: string;
        mimeType: string;
    } | null;
    generatedImage: {
        data: string;
        mimeType: string;
    } | null;
}

export default function GeneratorPage() {
    const { user, updateCredits } = useAuth();

    // Form state
    const [brandName, setBrandName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("luxury");
    const [selectedRatio, setSelectedRatio] = useState("9:16");
    const [selectedDuration, setSelectedDuration] = useState("6");
    const [productPhoto, setProductPhoto] = useState<File | null>(null);
    const [productPreview, setProductPreview] = useState<string | null>(null);
    const [modelPhoto, setModelPhoto] = useState<File | null>(null);
    const [modelPreview, setModelPreview] = useState<string | null>(null);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const productInputRef = useRef<HTMLInputElement>(null);
    const modelInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasCredits = (user?.credits ?? 0) > 0;

    // Timer for generation progress
    useEffect(() => {
        if (isGenerating) {
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isGenerating]);

    const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProductPhoto(file);
        setProductPreview(URL.createObjectURL(file));
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setModelPhoto(file);
        setModelPreview(URL.createObjectURL(file));
    };

    const handleGenerate = async () => {
        if (!brandName.trim() || !productPhoto) return;
        if (!hasCredits) return;

        setIsGenerating(true);
        setGenError(null);
        setGeneratedAd(null);

        try {
            const formData = new FormData();
            formData.append("brandName", brandName.trim());
            formData.append("productDescription", productDescription.trim());
            formData.append("productPhoto", productPhoto);
            formData.append("adStyle", selectedStyle);
            formData.append("aspectRatio", selectedRatio);
            formData.append("duration", selectedDuration);
            if (modelPhoto) {
                formData.append("modelPhoto", modelPhoto);
            }

            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            setGeneratedAd({
                adCopy: data.adCopy,
                generatedVideo: data.generatedVideo,
                generatedImage: data.generatedImage,
            });

            // Deduct credit after successful generation
            try {
                const result = await userService.deductCredits(1);
                updateCredits(result.credits);
            } catch {
                updateCredits((user?.credits ?? 1) - 1);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate ad";
            setGenError(message);
        } finally {
            setIsGenerating(false);
        }
    };

    const canGenerate = brandName.trim() && productDescription.trim() && productPhoto && hasCredits && !isGenerating;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background pt-24 pb-12">
                {/* Background effects */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-accent-purple/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-indigo/5 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient tracking-tight">
                                    AI Video Ad Generator
                                </h1>
                                <p className="text-text-secondary mt-2">
                                    Upload your product & model — AI creates a video ad with Veo 3.1
                                </p>
                            </div>
                            {/* Credits indicator */}
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${hasCredits ? "bg-surface-light border-border" : "bg-red-500/10 border-red-500/20"}`}>
                                    <svg className={`w-4 h-4 ${hasCredits ? "text-accent-gold" : "text-red-400"}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.89-8.9c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67c-.15-.45-.82-1.92-2.54-2.24V5h-2v1.26c-2.48.56-2.49 2.86-2.49 2.96 0 2.27 2.25 2.91 3.35 3.31 1.58.56 2.28 1.07 2.28 2.03 0 1.13-1.05 1.61-1.98 1.61-1.82 0-2.34-1.87-2.4-2.09l-1.66.67c.63 2.19 2.28 2.78 2.9 2.96V19h2v-1.24c.4-.09 2.9-.59 2.9-3.22 0-1.39-.61-2.61-3.01-3.44z" />
                                    </svg>
                                    <span className={`text-sm font-semibold ${hasCredits ? "text-text-primary" : "text-red-400"}`}>
                                        {user?.credits ?? 0} credits
                                    </span>
                                </div>
                                {user?.role === "free" && (
                                    <span className="text-xs text-text-muted px-2 py-1 rounded-md bg-accent-purple/10 border border-accent-purple/20">
                                        Free Plan
                                    </span>
                                )}
                                {user?.role === "pro" && (
                                    <span className="text-xs text-accent-gold px-2 py-1 rounded-md bg-accent-gold/10 border border-accent-gold/20">
                                        ⭐ Pro
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Panel — Controls */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-5 space-y-6"
                        >
                            {/* Brand Name */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                    Brand Name
                                </h3>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="Enter your brand name..."
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                    aria-label="Brand name"
                                />
                            </div>

                            {/* Product Description */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
                                    Product Description <span className="text-red-400">*</span>
                                </h3>
                                <p className="text-xs text-text-muted mb-3">Describe your product so the AI knows what to feature in the ad</p>
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    placeholder="e.g. White and gold sneakers with chunky sole, leather handbag, gold hoop earrings, organic face cream jar..."
                                    rows={3}
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all resize-none"
                                    aria-label="Product description"
                                />
                            </div>

                            {/* Product Photo Upload */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                    Product Photo <span className="text-red-400">*</span>
                                </h3>
                                <div
                                    onClick={() => productInputRef.current?.click()}
                                    className="border-2 border-dashed border-border hover:border-accent-purple/40 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group"
                                >
                                    <input
                                        ref={productInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleProductUpload}
                                        aria-label="Upload product photo"
                                    />
                                    {productPreview ? (
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={productPreview} alt="Product" className="w-full h-40 object-contain rounded-lg" />
                                            <p className="text-xs text-text-muted mt-2">Click to change</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-light flex items-center justify-center mb-3 group-hover:bg-accent-purple/10 transition-colors">
                                                <svg className="w-6 h-6 text-text-muted group-hover:text-accent-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5l.75-.75a3 3 0 014.24 0l.75.75" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                Drop product image or <span className="text-accent-purple">browse</span>
                                            </p>
                                            <p className="text-xs text-text-muted mt-1">PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Model Photo Upload (Optional) */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                    Model Photo <span className="text-text-muted text-xs font-normal normal-case">(optional)</span>
                                </h3>
                                <div
                                    onClick={() => modelInputRef.current?.click()}
                                    className="border-2 border-dashed border-border hover:border-accent-indigo/40 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group"
                                >
                                    <input
                                        ref={modelInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleModelUpload}
                                        aria-label="Upload model photo"
                                    />
                                    {modelPreview ? (
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={modelPreview} alt="Model" className="w-full h-40 object-contain rounded-lg" />
                                            <div className="flex justify-center gap-2 mt-2">
                                                <p className="text-xs text-text-muted">Click to change</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setModelPhoto(null); setModelPreview(null); }}
                                                    className="text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-light flex items-center justify-center mb-3 group-hover:bg-accent-indigo/10 transition-colors">
                                                <svg className="w-6 h-6 text-text-muted group-hover:text-accent-indigo transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                Drop model image or <span className="text-accent-indigo">browse</span>
                                            </p>
                                            <p className="text-xs text-text-muted mt-1">For ads with a human model</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Style Selector */}
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                                    Ad Style
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {adStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-medium cursor-pointer
                                                ${selectedStyle === style.id
                                                    ? "border-accent-purple/60 bg-accent-purple/10 text-text-primary shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                                                    : "border-border bg-surface-light/50 text-text-secondary hover:border-accent-purple/30"
                                                }
                                            `}
                                        >
                                            <span className="text-lg">{style.icon}</span>
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format & Duration */}
                            <div className="glass rounded-2xl p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                                            Format
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {aspectRatios.map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setSelectedRatio(r)}
                                                    className={`
                                                        px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                                        ${selectedRatio === r
                                                            ? "bg-accent-purple text-white"
                                                            : "bg-surface-light text-text-muted hover:text-text-secondary"
                                                        }
                                                    `}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                                            Duration
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {durations.map((d) => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setSelectedDuration(d.value)}
                                                    className={`
                                                        px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                                        ${selectedDuration === d.value
                                                            ? "bg-accent-purple text-white"
                                                            : "bg-surface-light text-text-muted hover:text-text-secondary"
                                                        }
                                                    `}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="relative">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating Video... {formatTime(elapsedTime)}
                                        </>
                                    ) : !hasCredits ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                            No Credits Remaining
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                            </svg>
                                            Generate Video Ad — 1 Credit
                                        </>
                                    )}
                                </Button>
                                {!hasCredits && (
                                    <p className="text-center text-xs text-red-400 mt-2">
                                        Upgrade to Pro for 400 credits
                                    </p>
                                )}
                                {isGenerating && (
                                    <p className="text-center text-xs text-text-muted mt-2 animate-pulse">
                                        Video generation takes 1-3 minutes. Please wait...
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Panel — Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-7"
                        >
                            <div className="glass rounded-2xl p-6 min-h-[600px] flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                        Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-accent-gold animate-pulse" : generatedAd ? "bg-green-400" : "bg-text-muted"}`} />
                                        <span className="text-xs text-text-muted">
                                            {isGenerating ? `Generating... ${formatTime(elapsedTime)}` : generatedAd ? (generatedAd.generatedVideo ? "Video Ready" : "Ad Copy Ready") : "Waiting"}
                                        </span>
                                    </div>
                                </div>

                                {/* Preview Canvas Area */}
                                <div className="flex-1 rounded-xl overflow-hidden bg-surface-light/50 border border-border flex items-center justify-center relative">
                                    <AnimatePresence mode="wait">
                                        {isGenerating ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-center"
                                            >
                                                {/* Loading Animation */}
                                                <div className="relative w-32 h-32 mx-auto mb-8">
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border-2 border-accent-purple/30"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-3 rounded-full border-2 border-accent-indigo/40"
                                                        animate={{ rotate: -360 }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        {/* Play icon */}
                                                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </motion.div>
                                                </div>
                                                <p className="text-text-secondary font-medium">
                                                    AI is creating your {brandName || "brand"} video ad...
                                                </p>
                                                <p className="text-text-muted text-sm mt-2">
                                                    {elapsedTime < 15
                                                        ? "Analyzing product • Writing ad copy"
                                                        : elapsedTime < 60
                                                            ? "Composing video scenes • Generating with Veo 3.1"
                                                            : "Rendering final video • Almost there..."
                                                    }
                                                </p>
                                                <div className="mt-6 w-48 mx-auto">
                                                    <div className="h-1 bg-surface-light rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-accent-purple to-accent-indigo rounded-full"
                                                            animate={{ width: ["0%", "100%"] }}
                                                            transition={{ duration: 90, ease: "linear" }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>

                                        ) : genError ? (
                                            <motion.div
                                                key="error"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-center p-8 max-w-sm"
                                            >
                                                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                    </svg>
                                                </div>
                                                <p className="text-red-400 font-medium mb-2">Generation Failed</p>
                                                <p className="text-text-muted text-sm">{genError}</p>
                                                <button
                                                    onClick={() => setGenError(null)}
                                                    className="mt-4 text-accent-purple text-sm hover:text-accent-indigo transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                            </motion.div>

                                        ) : generatedAd ? (
                                            <motion.div
                                                key="generated"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full flex flex-col"
                                            >
                                                {/* Video Player, AI Image, or CSS Fallback */}
                                                {generatedAd.generatedVideo ? (
                                                    <div className="flex-1 flex items-center justify-center p-4 bg-black/40">
                                                        <video
                                                            ref={videoRef}
                                                            src={`data:${generatedAd.generatedVideo.mimeType};base64,${generatedAd.generatedVideo.data}`}
                                                            controls
                                                            autoPlay
                                                            loop
                                                            playsInline
                                                            className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
                                                        />
                                                    </div>
                                                ) : generatedAd.generatedImage ? (
                                                    <div className="flex-1 flex items-center justify-center p-4 bg-black/20">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={`data:${generatedAd.generatedImage.mimeType};base64,${generatedAd.generatedImage.data}`}
                                                            alt="AI Generated Ad"
                                                            className="max-w-full max-h-[500px] rounded-xl shadow-2xl object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    /* Visual Ad Card with Product Photo — CSS fallback */
                                                    <div className="flex-1 flex items-center justify-center p-4">
                                                        <div
                                                            id="ad-canvas"
                                                            className="w-full max-w-sm rounded-2xl overflow-hidden relative shadow-2xl"
                                                            style={{
                                                                aspectRatio: selectedRatio === "9:16" ? "9/16" : "16/9",
                                                                maxHeight: "500px",
                                                            }}
                                                        >
                                                            {/* Gradient background */}
                                                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0f0f14] to-[#0a1628]" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                                                            {/* Decorative glow */}
                                                            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/20 rounded-full blur-[80px]" />
                                                            <div className="absolute bottom-20 left-0 w-32 h-32 bg-accent-indigo/15 rounded-full blur-[60px]" />

                                                            {/* Product image */}
                                                            {productPreview && (
                                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img
                                                                        src={productPreview}
                                                                        alt="Product"
                                                                        className="w-3/5 max-h-[45%] object-contain"
                                                                        style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5)) drop-shadow(0 20px 40px rgba(124,58,237,0.3))" }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Brand badge at top */}
                                                            <div className="absolute top-6 left-0 right-0 z-20 text-center">
                                                                <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold border border-white/10">
                                                                    {brandName}
                                                                </span>
                                                            </div>

                                                            {/* Text overlay at bottom */}
                                                            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16">
                                                                <h2 className="text-xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
                                                                    {generatedAd.adCopy.headline}
                                                                </h2>
                                                                <p className="text-white/60 text-xs mb-4 leading-relaxed">
                                                                    {generatedAd.adCopy.subheadline}
                                                                </p>
                                                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/25">
                                                                    {generatedAd.adCopy.cta}
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                                    </svg>
                                                                </div>
                                                            </div>

                                                            {/* "Video not available" badge */}
                                                            <div className="absolute top-6 right-4 z-20">
                                                                <span className="text-[9px] px-2 py-1 rounded-md bg-accent-gold/20 text-accent-gold border border-accent-gold/20">
                                                                    Preview Only
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Ad Details & Actions */}
                                                <div className="p-4 border-t border-border">
                                                    <div className="flex flex-wrap gap-4 items-center justify-between">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-xs px-2 py-1 rounded-md bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                                                                {selectedStyle}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-md bg-surface-light text-text-muted border border-border">
                                                                {selectedRatio}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-md bg-surface-light text-text-muted border border-border">
                                                                {generatedAd.generatedVideo ? "🎬 Video" : generatedAd.generatedImage ? "🖼️ AI Image" : "✨ Preview"}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-md bg-surface-light text-text-muted border border-border">
                                                                🎯 {generatedAd.adCopy.targetAudience}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {generatedAd.generatedVideo && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const link = document.createElement("a");
                                                                        link.href = `data:${generatedAd.generatedVideo!.mimeType};base64,${generatedAd.generatedVideo!.data}`;
                                                                        link.download = `${brandName.replace(/\s+/g, "-")}-ad.mp4`;
                                                                        link.click();
                                                                    }}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                                    </svg>
                                                                    Download MP4
                                                                </Button>
                                                            )}
                                                            {generatedAd.generatedImage && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const link = document.createElement("a");
                                                                        link.href = `data:${generatedAd.generatedImage!.mimeType};base64,${generatedAd.generatedImage!.data}`;
                                                                        link.download = `${brandName.replace(/\s+/g, "-")}-ad.png`;
                                                                        link.click();
                                                                    }}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                                    </svg>
                                                                    Download Image
                                                                </Button>
                                                            )}
                                                            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={!hasCredits}>
                                                                Regenerate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-center p-8"
                                            >
                                                <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-light flex items-center justify-center mb-4 border border-border">
                                                    <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                                    </svg>
                                                </div>
                                                <p className="text-text-secondary font-medium">Your AI-generated video ad will appear here</p>
                                                <p className="text-text-muted text-sm mt-2">Upload product photo, enter brand name, and generate</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
