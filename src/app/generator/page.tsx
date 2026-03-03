"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user";
import { communityService } from "@/services/community";

const adStyles = [
    { id: "luxury",    label: "Luxury",    icon: "✨", color: "#F59E0B", desc: "Premium & refined" },
    { id: "bold",      label: "Bold",      icon: "🔥", color: "#EF4444", desc: "High-impact energy" },
    { id: "minimal",   label: "Minimal",   icon: "◯",  color: "#A1A1AA", desc: "Clean & modern" },
    { id: "cinematic", label: "Cinematic", icon: "🎬", color: "#818CF8", desc: "Film-quality drama" },
    { id: "playful",   label: "Playful",   icon: "🎨", color: "#34D399", desc: "Fun & vibrant" },
    { id: "corporate", label: "Corporate", icon: "💼", color: "#60A5FA", desc: "Professional trust" },
];

const imageRatios = [
    { id: "16:9", label: "16:9", desc: "Landscape", sub: "1920×1080" },
    { id: "9:16", label: "9:16", desc: "Portrait", sub: "1080×1920" },
    { id: "1:1",  label: "1:1",  desc: "Square",   sub: "1080×1080" },
    { id: "4:5",  label: "4:5",  desc: "Vertical",  sub: "1080×1350" },
];
const videoRatios = [
    { id: "16:9", label: "16:9", desc: "Landscape", sub: "1920×1080" },
    { id: "9:16", label: "9:16", desc: "Portrait", sub: "1080×1920" },
];

interface GenerationResult {
    success: boolean;
    videoUrl: string;
    generationId: string;
    cloudinaryPublicId: string;
    mediaType: "image" | "video";
    enhancedPrompt: string;
}

export default function GeneratorPage() {
    const { user, updateCredits } = useAuth();

    // Form state
    const [brandName, setBrandName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [generationType, setGenerationType] = useState<"image" | "video">("image");
    const [selectedStyle, setSelectedStyle] = useState("luxury");
    const [selectedRatio, setSelectedRatio] = useState("16:9");
    const [selectedDuration, setSelectedDuration] = useState(6);
    const [productPhoto, setProductPhoto] = useState<File | null>(null);
    const [productPreview, setProductPreview] = useState<string | null>(null);
    const [modelPhoto, setModelPhoto] = useState<File | null>(null);
    const [modelPreview, setModelPreview] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const isFreeUser = !user?.role || user.role === "free";

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [autoSaved, setAutoSaved] = useState(false);
    const [showBrief, setShowBrief] = useState(false);

    // Brief preview state (Phase 3)
    const [isBriefing, setIsBriefing] = useState(false);
    const [briefPreview, setBriefPreview] = useState<string | null>(null);
    const [briefError, setBriefError] = useState<string | null>(null);
    const [editedBrief, setEditedBrief] = useState("");

    // Share to community state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareTitle, setShareTitle] = useState("");
    const [shareDesc, setShareDesc] = useState("");
    const [shareLink, setShareLink] = useState("");
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);

    const productInputRef = useRef<HTMLInputElement>(null);
    const modelInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const creditCost = generationType === "video" ? 2 : 1;
    const hasCredits = (user?.credits ?? 0) >= creditCost;

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
        if (isFreeUser && file.size > MAX_FILE_SIZE) {
            setUploadError("Image exceeds 10 MB. Upgrade to Pro for larger uploads.");
            e.target.value = "";
            return;
        }
        setUploadError(null);
        setProductPhoto(file);
        setProductPreview(URL.createObjectURL(file));
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isFreeUser && file.size > MAX_FILE_SIZE) {
            setUploadError("Image exceeds 10 MB. Upgrade to Pro for larger uploads.");
            e.target.value = "";
            return;
        }
        setUploadError(null);
        setModelPhoto(file);
        setModelPreview(URL.createObjectURL(file));
    };

    const handleGenerate = async () => {
        if (!productDescription.trim() || !productPhoto) return;
        if (!hasCredits) return;

        setIsGenerating(true);
        setGenError(null);
        setGenerationResult(null);
        setAutoSaved(false);
        setShowBrief(false);

        try {
            const formData = new FormData();
            formData.append("brandName", brandName.trim());
            formData.append("productDescription", productDescription.trim());
            formData.append("productPhoto", productPhoto);
            formData.append("style", selectedStyle);
            formData.append("aspectRatio", selectedRatio);
            formData.append("duration", String(selectedDuration));
            formData.append("generationType", generationType);
            if (modelPhoto) {
                formData.append("modelPhoto", modelPhoto);
            }
            if (editedBrief) {
                formData.append("overridePrompt", editedBrief);
            }

            const response = await fetch("/api/v1/generate-ad", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            setGenerationResult({
                success: data.success,
                videoUrl: data.videoUrl,
                generationId: data.generationId,
                cloudinaryPublicId: data.cloudinaryPublicId,
                mediaType: data.mediaType ?? generationType,
                enhancedPrompt: data.enhancedPrompt ?? "",
            });

            // Clear the brief preview after successful generation
            setBriefPreview(null);
            setEditedBrief("");

            // Auto-save to community feed
            try {
                await communityService.autoSave({
                    title: `${brandName || "AI Ad"} — ${selectedStyle} ${generationType === "video" ? "Video" : "Image"}`,
                    description: productDescription.trim(),
                    videoUrl: data.videoUrl,
                    cloudinaryId: data.cloudinaryPublicId,
                    mediaType: generationType,
                });
                setAutoSaved(true);
            } catch (shareErr) {
                // Non-blocking — generation still succeeded
                console.warn("Auto-save to community failed:", shareErr);
            }

            // Deduct credits after successful generation
            try {
                const result = await userService.deductCredits(creditCost);
                updateCredits(result.credits);
            } catch {
                updateCredits((user?.credits ?? creditCost) - creditCost);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to generate ad";
            setGenError(message);
        } finally {
            setIsGenerating(false);
        }
    };

    const canGenerate = !!(productDescription.trim() && productPhoto && hasCredits && !isGenerating && !isBriefing);
    const canBrief = !!(productDescription.trim() && productPhoto && !isGenerating && !isBriefing);

    const handlePreviewBrief = async () => {
        if (!productDescription.trim() || !productPhoto) return;
        setIsBriefing(true);
        setBriefError(null);
        setGenError(null);
        try {
            const formData = new FormData();
            formData.append("brandName", brandName.trim());
            formData.append("productDescription", productDescription.trim());
            formData.append("style", selectedStyle);
            formData.append("duration", String(selectedDuration));
            formData.append("productPhoto", productPhoto);
            if (modelPhoto) formData.append("modelPhoto", modelPhoto);
            const response = await fetch("/api/v1/enhance-prompt", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to generate brief");
            setBriefPreview(data.enhancedPrompt);
            setEditedBrief(data.enhancedPrompt);
        } catch (err: unknown) {
            setBriefError(err instanceof Error ? err.message : "Failed to preview brief");
        } finally {
            setIsBriefing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
    };

    const openShareModal = () => {
        setShareTitle(`${brandName} - ${selectedStyle} Ad`);
        setShareDesc(productDescription);
        setShareLink("");
        setShared(false);
        setShareError(null);
        setShowShareModal(true);
    };

    const handleShare = async () => {
        if (!generationResult || !shareTitle.trim()) return;
        setSharing(true);
        try {
            // Fetch the Cloudinary video and convert to base64 for community sharing
            const res = await fetch(generationResult.videoUrl);
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            await communityService.shareFromGenerator({
                title: shareTitle.trim(),
                description: shareDesc.trim(),
                link: shareLink.trim(),
                imageBase64: base64,
                mimeType: "video/mp4",
                mediaType: "video",
            });
            setShared(true);
            setTimeout(() => setShowShareModal(false), 1500);
        } catch (err) {
            console.error("Share failed:", err);
            setShareError(err instanceof Error ? err.message : "Failed to share. Please try again.");
        } finally {
            setSharing(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background pt-20 pb-16">
                {/* Ambient background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-purple/4 rounded-full blur-[200px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/4 rounded-full blur-[200px]" />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">

                    {/* ── Page Header + Workflow ───────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between flex-wrap gap-4 mb-7"
                    >
                        {/* Left: title + subtitle */}
                        <div>
                            <div className="flex items-center gap-3 mb-0.5">
                                <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                                    <span className="text-gradient">Ad Generator</span>
                                </h1>
                                {user?.role === "pro" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-accent-gold/10 text-accent-gold border border-accent-gold/25">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Pro
                                    </span>
                                )}
                                {(!user?.role || user.role === "free") && (
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-light border border-border text-text-muted">
                                        Free
                                    </span>
                                )}
                            </div>
                            <p className="text-text-muted text-sm">
                                Turn any product photo into a studio-quality ad — powered by Gemini
                            </p>
                        </div>

                        {/* Right: workflow steps */}
                        <div className="flex items-center gap-1 bg-surface/60 border border-border/50 rounded-xl p-1">
                            {[
                                { n: 1, label: "Product",  done: !!(productPhoto && productDescription.trim()) },
                                { n: 2, label: "Style",    done: true },
                                { n: 3, label: "Generate", done: !!generationResult },
                            ].map((s, i) => (
                                <div key={s.n} className="flex items-center">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                        s.done ? "bg-accent-purple/10 text-text-primary" : "text-text-muted"
                                    }`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-all ${
                                            s.done ? "bg-accent-purple text-white" : "bg-surface-light border border-border text-text-muted"
                                        }`}>
                                            {s.done ? (
                                                <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            ) : s.n}
                                        </div>
                                        <span className="text-[11px] font-medium">{s.label}</span>
                                    </div>
                                    {i < 2 && <span className="text-border text-xs px-0.5">›</span>}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Main Grid ───────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-6 xl:gap-8">

                        {/* ── LEFT: Configuration Panel ───────────── */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 }}
                            className="space-y-4"
                        >
                            {/* ── STEP 1: Your Product ──────────────── */}
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                                        productPhoto && productDescription.trim()
                                            ? "bg-green-500 text-white"
                                            : "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
                                    }`}>
                                        {productPhoto && productDescription.trim() ? (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        ) : "1"}
                                    </div>
                                    <h3 className="text-sm font-semibold text-text-primary">Product Details</h3>
                                    {(!productPhoto || !productDescription.trim()) && (
                                        <span className="ml-auto text-xs text-text-muted/70 italic">Required to continue</span>
                                    )}
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Brand Name */}
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                                            Brand Name
                                        </label>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="e.g. Nike, Glow Skincare, UrbanKick"
                                            className="w-full bg-surface-light/60 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 focus:bg-surface-light transition-all"
                                        />
                                    </div>

                                    {/* Product Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-medium text-text-secondary">
                                                Product Description <span className="text-accent-purple">*</span>
                                            </label>
                                            <span className="text-xs text-text-muted">{productDescription.length}/500</span>
                                        </div>
                                        <textarea
                                            value={productDescription}
                                            onChange={(e) => setProductDescription(e.target.value)}
                                            placeholder="Describe what makes your product exceptional — material, color, texture, key benefit, target audience..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full bg-surface-light/60 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 focus:bg-surface-light transition-all resize-none"
                                        />
                                    </div>

                                    {/* Photo Uploads — side by side */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Product Photo */}
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                                                Product Photo <span className="text-accent-purple">*</span>
                                            </label>
                                            <div
                                                onClick={() => productInputRef.current?.click()}
                                                className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 group min-h-[110px] flex flex-col items-center justify-center ${
                                                    productPreview
                                                        ? "border-accent-purple/40 bg-accent-purple/5"
                                                        : "border-border hover:border-accent-purple/40 hover:bg-accent-purple/3"
                                                }`}
                                            >
                                                <input ref={productInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductUpload} />
                                                {productPreview ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={productPreview} alt="Product" className="w-full h-20 object-contain rounded-lg" />
                                                        <p className="text-xs text-text-muted mt-1.5">Click to change</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-9 h-9 rounded-xl bg-surface-light flex items-center justify-center mb-2 group-hover:bg-accent-purple/10 transition-colors">
                                                            <svg className="w-5 h-5 text-text-muted group-hover:text-accent-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs text-text-secondary">Product</p>
                                                        <p className="text-xs text-text-muted mt-0.5">PNG, JPG · 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Model Photo */}
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5 block">
                                                Model Photo
                                                <span className="text-text-muted font-normal">(optional)</span>
                                            </label>
                                            <div
                                                onClick={() => modelInputRef.current?.click()}
                                                className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 group min-h-[110px] flex flex-col items-center justify-center ${
                                                    modelPreview
                                                        ? "border-accent-indigo/40 bg-accent-indigo/5"
                                                        : "border-border hover:border-accent-indigo/40 hover:bg-accent-indigo/3"
                                                }`}
                                            >
                                                <input ref={modelInputRef} type="file" accept="image/*" className="hidden" onChange={handleModelUpload} />
                                                {modelPreview ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={modelPreview} alt="Model" className="w-full h-20 object-contain rounded-lg" />
                                                        <div className="flex justify-center gap-2 mt-1.5">
                                                            <p className="text-xs text-text-muted">Change</p>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setModelPhoto(null); setModelPreview(null); }}
                                                                className="text-xs text-red-400 hover:text-red-300"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-9 h-9 rounded-xl bg-surface-light flex items-center justify-center mb-2 group-hover:bg-accent-indigo/10 transition-colors">
                                                            <svg className="w-5 h-5 text-text-muted group-hover:text-accent-indigo transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs text-text-secondary">Model / Person</p>
                                                        <p className="text-xs text-text-muted mt-0.5">For human ads</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {uploadError && (
                                        <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">{uploadError}</p>
                                    )}
                                </div>
                            </div>

                            {/* ── STEP 2: Creative Direction ─────────── */}
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                                    <div className="w-6 h-6 rounded-full bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 flex items-center justify-center text-xs font-bold shrink-0">
                                        2
                                    </div>
                                    <h3 className="text-sm font-semibold text-text-primary">Creative Direction</h3>
                                </div>

                                <div className="p-5 space-y-5">
                                    {/* Output Type — pick this first */}
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-2.5 block">Output Type</label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { id: "image" as const, label: "Image Ad", time: "~15 sec", icon: (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5l.75-.75a3 3 0 014.24 0l.75.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )},
                                                { id: "video" as const, label: "Video Ad", time: "~2-3 min", icon: (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                                    </svg>
                                                )},
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => {
                                                        setGenerationType(type.id);
                                                        if (type.id === "video" && (selectedRatio === "1:1" || selectedRatio === "4:5")) {
                                                            setSelectedRatio("16:9");
                                                        }
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 text-sm font-medium cursor-pointer ${
                                                        generationType === type.id
                                                            ? "border-accent-purple/60 bg-accent-purple/10 text-text-primary shadow-[0_0_16px_rgba(124,58,237,0.12)]"
                                                            : "border-border bg-surface-light/40 text-text-secondary hover:border-border/80 hover:bg-surface-light/60"
                                                    }`}
                                                >
                                                    <span className={`shrink-0 ${generationType === type.id ? "text-accent-purple" : "text-text-muted"}`}>
                                                        {type.icon}
                                                    </span>
                                                    <div>
                                                        <div>{type.label}</div>
                                                        <div className="text-xs text-text-muted font-normal">{type.time}</div>
                                                    </div>
                                                    {generationType === type.id && (
                                                        <svg className="w-4 h-4 text-accent-purple ml-auto shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                            <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ad Style */}
                                    <div>
                                        <label className="text-xs font-medium text-text-secondary mb-2.5 block">Ad Style</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {adStyles.map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setSelectedStyle(style.id)}
                                                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer text-center ${
                                                        selectedStyle === style.id
                                                            ? "border-accent-purple/60 bg-accent-purple/10 text-text-primary"
                                                            : "border-border bg-surface-light/40 text-text-muted hover:text-text-secondary hover:border-border/80"
                                                    }`}
                                                >
                                                    <div className="text-base mb-0.5">{style.icon}</div>
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Format + Duration */}
                                    <div className={`grid gap-4 ${generationType === "video" ? "grid-cols-2" : "grid-cols-1"}`}>
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-2 block">Format</label>
                                            <div className={`grid gap-2 ${
                                                generationType === "image" ? "grid-cols-2" : "grid-cols-1"
                                            }`}>
                                                {(generationType === "image" ? imageRatios : videoRatios).map((r) => {
                                                    const [rw, rh] = r.id.split(":").map(Number);
                                                    const boxH = 22;
                                                    const rawW = Math.round((rw / rh) * boxH);
                                                    const boxW = Math.min(Math.max(rawW, 13), 38);
                                                    const isSelected = selectedRatio === r.id;
                                                    return (
                                                        <button
                                                            key={r.id}
                                                            onClick={() => setSelectedRatio(r.id)}
                                                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all cursor-pointer border text-left ${
                                                                isSelected
                                                                    ? "bg-accent-purple/10 border-accent-purple/50 text-text-primary"
                                                                    : "bg-surface-light/40 text-text-muted border-border hover:border-border/80 hover:text-text-secondary"
                                                            }`}
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-surface/70 border border-border/60 flex items-center justify-center shrink-0">
                                                                <div
                                                                    className={`rounded-[2px] border-2 ${
                                                                        isSelected ? "border-accent-purple" : "border-current opacity-40"
                                                                    }`}
                                                                    style={{ width: `${boxW}px`, height: `${boxH}px` }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-[12px] font-semibold leading-tight">{r.label}</div>
                                                                <div className="text-[10px] opacity-55 leading-tight mt-0.5">{r.desc}</div>
                                                            </div>
                                                            {isSelected && (
                                                                <svg className="w-3.5 h-3.5 text-accent-purple shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {generationType === "video" && (
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-2.5 flex items-center justify-between">
                                                    <span>Duration</span>
                                                    <span className="text-accent-purple font-semibold">{selectedDuration}s</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min={4}
                                                    max={12}
                                                    step={1}
                                                    value={selectedDuration}
                                                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                                    className="duration-slider w-full"
                                                    style={{
                                                        background: `linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-indigo) ${((selectedDuration - 4) / 8) * 100}%, var(--surface-light) ${((selectedDuration - 4) / 8) * 100}%)`,
                                                    }}
                                                />
                                                <div className="flex justify-between text-xs text-text-muted mt-1">
                                                    <span>4s</span>
                                                    <span>12s</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── STEP 3: Launch ─────────────────────── */}
                            <div className="gradient-border">
                                <div className="rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30 flex items-center justify-center text-xs font-bold shrink-0">
                                            3
                                        </div>
                                        <h3 className="text-sm font-semibold text-text-primary">Generate</h3>
                                    </div>

                                    {/* Readiness checklist */}
                                    <div className="space-y-1.5">
                                        {[
                                            { label: "Product description added", done: !!productDescription.trim() },
                                            { label: "Product photo attached", done: !!productPhoto },
                                            { label: `${creditCost} credit${creditCost > 1 ? "s" : ""} available`, done: hasCredits },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-2.5 text-xs">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                    item.done ? "bg-green-500/20 text-green-400" : "bg-surface-light text-text-muted"
                                                }`}>
                                                    {item.done ? (
                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <span className={item.done ? "text-text-secondary" : "text-text-muted"}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Preview Brief + Generate buttons */}
                                    <div className="flex gap-2.5">
                                        {/* Preview Brief */}
                                        <button
                                            onClick={handlePreviewBrief}
                                            disabled={!canBrief}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                                canBrief
                                                    ? briefPreview
                                                        ? "border-accent-indigo/40 bg-accent-indigo/8 text-accent-indigo hover:bg-accent-indigo/15"
                                                        : "border-border bg-surface-light/60 text-text-secondary hover:border-accent-purple/40 hover:text-text-primary"
                                                    : "border-border bg-surface-light/30 text-text-muted cursor-not-allowed opacity-50"
                                            }`}
                                        >
                                            {isBriefing ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Crafting brief...
                                                </>
                                            ) : briefPreview ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    Brief Ready
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Preview Brief
                                                </>
                                            )}
                                        </button>

                                        {/* Generate */}
                                        <button
                                            onClick={handleGenerate}
                                            disabled={!canGenerate}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                                canGenerate
                                                    ? "bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                                                    : isGenerating
                                                        ? "bg-gradient-to-r from-accent-purple/80 to-accent-indigo/80 text-white cursor-wait"
                                                        : "bg-surface-light text-text-muted cursor-not-allowed border border-border"
                                            }`}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    {formatTime(elapsedTime)}
                                                </>
                                            ) : briefPreview ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                    </svg>
                                                    Approve &amp; Generate
                                                </>
                                            ) : !hasCredits ? (
                                                "Insufficient Credits"
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                    </svg>
                                                    Generate — {creditCost} Credit{creditCost > 1 ? "s" : ""}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {briefError && (
                                        <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">{briefError}</p>
                                    )}

                                    {!hasCredits && (
                                        <p className="text-center text-xs text-red-400/90">
                                            {generationType === "video" ? "Video ads require 2 credits. " : ""}
                                            <a href="/pricing" className="underline underline-offset-2 hover:text-red-300 transition-colors font-medium">
                                                Upgrade to Pro
                                            </a>
                                            {" "}for 400 credits.
                                        </p>
                                    )}
                                    {isGenerating && (
                                        <p className="text-center text-xs text-text-muted animate-pulse">
                                            {generationType === "video" ? "Video rendering takes 1–3 min — please keep this tab open" : "Generating your image — usually ready in under 20 seconds"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* ── RIGHT: Output Workspace ─────────────── */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="lg:sticky lg:top-6 lg:self-start"
                        >
                            <div className="glass rounded-2xl overflow-hidden" style={{ minHeight: "640px" }}>

                                {/* Workspace top bar */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-accent-gold/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <span className="text-xs text-text-muted font-medium">Output Workspace</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full transition-all ${
                                            isGenerating || isBriefing
                                                ? "bg-accent-gold animate-pulse"
                                                : generationResult
                                                    ? "bg-green-400"
                                                    : briefPreview
                                                        ? "bg-accent-indigo"
                                                        : "bg-surface-light border border-border"
                                        }`} />
                                        <span className="text-xs text-text-muted">
                                            {isGenerating
                                                ? `Processing... ${formatTime(elapsedTime)}`
                                                : isBriefing
                                                    ? "Generating brief..."
                                                    : generationResult
                                                        ? `${generationResult.mediaType === "video" ? "Video" : "Image"} ready`
                                                        : briefPreview
                                                            ? "Brief ready — review & approve"
                                                            : "Idle"
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Canvas */}
                                <div className="flex flex-col" style={{ minHeight: "580px" }}>
                                    <AnimatePresence mode="wait">

                                        {/* ── GENERATING STATE ─────────── */}
                                        {isGenerating && (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center p-10"
                                            >
                                                {/* Animated orb */}
                                                <div className="relative w-28 h-28 mb-8">
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full"
                                                        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
                                                        animate={{ scale: [1, 1.4, 1] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border border-accent-purple/20"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    <motion.div
                                                        className="absolute inset-4 rounded-full border border-accent-indigo/30"
                                                        animate={{ rotate: -360 }}
                                                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-text-primary font-semibold text-lg mb-1">
                                                    {brandName ? `Crafting your ${brandName} ad...` : `Generating your ${generationType} ad...`}
                                                </p>
                                                <p className="text-text-muted text-sm mb-8 text-center max-w-xs">
                                                    {generationType === "image"
                                                        ? elapsedTime < 8 ? "Analysing product details & composing creative brief" : elapsedTime < 18 ? "Rendering image with Gemini Flash" : "Finalising and uploading your image ad..."
                                                        : elapsedTime < 15 ? "Analysing product details & composing creative brief" : elapsedTime < 70 ? "Directing video scenes with Veo 3.1" : "Encoding and uploading final video..."
                                                    }
                                                </p>

                                                {/* Progress bar */}
                                                <div className="w-64">
                                                    <div className="flex justify-between text-xs text-text-muted mb-1.5">
                                                        <span>Progress</span>
                                                        <span>{formatTime(elapsedTime)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-purple rounded-full"
                                                            animate={{ width: ["0%", "92%"] }}
                                                            transition={{ duration: generationType === "image" ? 22 : 170, ease: [0.16, 1, 0.3, 1] }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Steps */}
                                                <div className="mt-8 flex items-center gap-2 text-xs text-text-muted">
                                                    {["Brief", "Generate", "Upload"].map((step, i) => {
                                                        const thresholds = generationType === "image" ? [0, 8, 20] : [0, 15, 160];
                                                        const active = elapsedTime >= thresholds[i];
                                                        const done = i < 2 ? elapsedTime >= thresholds[i + 1] : false;
                                                        return (
                                                            <div key={step} className="flex items-center gap-2">
                                                                <span className={`transition-colors ${done ? "text-green-400" : active ? "text-accent-purple" : "text-text-muted"}`}>
                                                                    {done ? "✓ " : active ? "● " : "○ "}{step}
                                                                </span>
                                                                {i < 2 && <span className="text-border">→</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ── ERROR STATE ───────────────── */}
                                        {!isGenerating && genError && (
                                            <motion.div
                                                key="error"
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center p-10 text-center"
                                            >
                                                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                    </svg>
                                                </div>
                                                <p className="text-red-400 font-semibold mb-2">Generation Failed</p>
                                                <p className="text-text-muted text-sm max-w-xs mb-5">{genError}</p>
                                                <button
                                                    onClick={() => setGenError(null)}
                                                    className="text-sm text-accent-purple hover:text-accent-indigo transition-colors underline underline-offset-2"
                                                >
                                                    Dismiss & try again
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* ── RESULT STATE ─────────────── */}
                                        {!isGenerating && !genError && generationResult && (
                                            <motion.div
                                                key="result"
                                                initial={{ opacity: 0, scale: 0.97 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col flex-1"
                                            >
                                                {/* Media — full bleed */}
                                                <div className="flex-1 flex items-center justify-center bg-black/50 min-h-[380px]">
                                                    {generationResult.mediaType === "image" ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={generationResult.videoUrl}
                                                            alt="Generated ad"
                                                            className="max-w-full max-h-[500px] object-contain"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={generationResult.videoUrl}
                                                            controls
                                                            autoPlay
                                                            loop
                                                            playsInline
                                                            className="max-w-full max-h-[500px]"
                                                        />
                                                    )}
                                                </div>

                                                {/* AI Creative Brief — collapsible */}
                                                {generationResult.enhancedPrompt && (
                                                    <div className="border-t border-border/60 px-5 py-3">
                                                        <button
                                                            onClick={() => setShowBrief(prev => !prev)}
                                                            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors w-full text-left group"
                                                        >
                                                            <svg
                                                                className={`w-3.5 h-3.5 transition-transform shrink-0 ${showBrief ? "rotate-90" : ""}`}
                                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                            </svg>
                                                            <span className="font-semibold uppercase tracking-widest text-[10px]">AI Creative Brief</span>
                                                            <span className="text-accent-purple/50 ml-auto text-[10px] group-hover:text-accent-purple/80 transition-colors">
                                                                {showBrief ? "Collapse" : "Expand"}
                                                            </span>
                                                        </button>
                                                        <AnimatePresence>
                                                            {showBrief && (
                                                                <motion.p
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="overflow-hidden text-xs text-text-muted leading-relaxed bg-surface-light/40 rounded-lg px-3 py-2.5 border border-border/40 italic mt-2"
                                                                >
                                                                    {generationResult.enhancedPrompt}
                                                                </motion.p>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}

                                                {/* Action bar */}
                                                <div className="border-t border-border/60 px-5 py-4">
                                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                                        {/* Metadata pills */}
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs px-2 py-1 rounded-md bg-accent-purple/10 text-accent-purple border border-accent-purple/20 capitalize">
                                                                {selectedStyle}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-md bg-surface-light text-text-muted border border-border">
                                                                {selectedRatio}
                                                            </span>
                                                            {generationResult.mediaType === "video" && (
                                                                <span className="text-xs px-2 py-1 rounded-md bg-surface-light text-text-muted border border-border">
                                                                    {selectedDuration}s
                                                                </span>
                                                            )}
                                                            {autoSaved ? (
                                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                    </svg>
                                                                    In Community
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                                                                    {generationResult.mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const ext = generationResult.mediaType === "image" ? "jpg" : "mp4";
                                                                    const link = document.createElement("a");
                                                                    link.href = generationResult.videoUrl;
                                                                    link.download = `${(brandName || "ad").replace(/\s+/g, "-")}-${generationResult.generationId.slice(0, 8)}.${ext}`;
                                                                    link.target = "_blank";
                                                                    link.click();
                                                                }}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                                </svg>
                                                                Download
                                                            </Button>
                                                            {!autoSaved && (
                                                                <Button variant="outline" size="sm" onClick={openShareModal}>
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                                                    </svg>
                                                                    Share
                                                                </Button>
                                                            )}
                                                            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={!hasCredits}>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                </svg>
                                                                Regenerate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ── BRIEF PREVIEW STATE ─────── */}
                                        {!isGenerating && !genError && !generationResult && briefPreview && (
                                            <motion.div
                                                key="brief"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col p-6"
                                            >
                                                {/* Header */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 border border-accent-indigo/20 flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5 text-accent-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 3.75 3.75 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-accent-indigo/70">AI Creative Brief</p>
                                                        <p className="text-sm font-semibold text-text-primary">Review &amp; edit before generating</p>
                                                    </div>
                                                    <span className="flex items-center gap-1 text-xs text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-lg shrink-0">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                                                        </svg>
                                                        Gemini
                                                    </span>
                                                </div>

                                                <p className="text-xs text-text-muted mb-2.5">Review and refine your AI-generated creative direction before committing a generation:</p>

                                                {/* Editable textarea */}
                                                <textarea
                                                    value={editedBrief}
                                                    onChange={(e) => setEditedBrief(e.target.value)}
                                                    rows={10}
                                                    className="flex-1 w-full bg-surface-light/40 border border-border/60 rounded-xl px-4 py-3 text-xs text-text-secondary leading-relaxed outline-none focus:border-accent-indigo/50 focus:bg-surface-light/60 transition-all resize-none font-mono"
                                                />

                                                {/* Actions */}
                                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40">
                                                    <button
                                                        onClick={() => { setBriefPreview(null); setEditedBrief(""); }}
                                                        className="text-xs text-text-muted hover:text-text-secondary transition-colors underline underline-offset-2"
                                                    >
                                                        Discard
                                                    </button>
                                                    <button
                                                        onClick={handleGenerate}
                                                        disabled={!canGenerate}
                                                        className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                                            canGenerate
                                                                ? "bg-gradient-to-r from-accent-purple to-accent-indigo text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-[1.01]"
                                                                : "bg-surface-light text-text-muted cursor-not-allowed border border-border"
                                                        }`}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                        </svg>
                                                        Approve &amp; Generate — {creditCost} Credit{creditCost > 1 ? "s" : ""}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ── EMPTY STATE ───────────────── */}
                                        {!isGenerating && !genError && !generationResult && !briefPreview && (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
                                            >
                                                {/* Ambient background */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/3 via-transparent to-accent-indigo/3 pointer-events-none" />
                                                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-purple/4 rounded-full blur-3xl pointer-events-none" />

                                                {/* Ad format mockups */}
                                                <div className="flex items-end justify-center gap-4 mb-8 relative">
                                                    {/* Story/Reel — 9:16 */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 0.45, y: 0 }}
                                                        transition={{ delay: 0.15 }}
                                                        className="w-14 h-24 rounded-xl bg-surface-light border border-border/60 flex flex-col overflow-hidden"
                                                    >
                                                        <div className="flex-1 bg-gradient-to-b from-accent-indigo/10 to-transparent" />
                                                        <div className="px-2 py-1.5 space-y-1">
                                                            <div className="h-1 rounded-full bg-border/80 w-3/4" />
                                                            <div className="h-1 rounded-full bg-border/50 w-1/2" />
                                                        </div>
                                                    </motion.div>

                                                    {/* Square feed — 1:1, hero */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                        className="w-32 h-32 rounded-2xl bg-surface-light border border-accent-purple/25 flex flex-col overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.1)]"
                                                    >
                                                        <div className="flex-1 bg-gradient-to-br from-accent-purple/15 to-accent-indigo/10 flex items-center justify-center">
                                                            <motion.div
                                                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                                className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-indigo/20 border border-accent-purple/20 flex items-center justify-center"
                                                            >
                                                                <svg className="w-7 h-7 text-accent-purple/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                                </svg>
                                                            </motion.div>
                                                        </div>
                                                        <div className="px-2.5 py-2 space-y-1.5 border-t border-border/40">
                                                            <div className="h-1 rounded-full bg-accent-purple/25 w-3/4" />
                                                            <div className="h-1 rounded-full bg-border/50 w-1/2" />
                                                        </div>
                                                    </motion.div>

                                                    {/* Landscape — 16:9 */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 0.45, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="w-24 h-14 rounded-xl bg-surface-light border border-border/60 flex flex-col overflow-hidden"
                                                    >
                                                        <div className="flex-1 bg-gradient-to-br from-accent-gold/8 to-transparent" />
                                                        <div className="px-2 py-1 flex gap-1">
                                                            <div className="h-1 rounded-full bg-border/80 flex-1" />
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <p className="text-sm font-semibold text-text-secondary mb-1.5 relative">Your ad appears here</p>
                                                <p className="text-xs text-text-muted text-center max-w-[220px] mb-8 leading-relaxed relative">
                                                    Fill in your product on the left,<br />then click Generate to create your ad.
                                                </p>

                                                {/* Platform badges */}
                                                <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
                                                    {[
                                                        { icon: "📸", label: "Upload",  hint: "Product photo" },
                                                        { icon: "✨", label: "Style",   hint: "Pick your vibe" },
                                                        { icon: "⚡", label: "Generate", hint: "AI makes the ad" },
                                                    ].map((item) => (
                                                        <div key={item.label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-surface-light/40 border border-border/50">
                                                            <span className="text-lg leading-none">{item.icon}</span>
                                                            <span className="text-[10px] font-semibold text-text-secondary">{item.label}</span>
                                                            <span className="text-[9px] text-text-muted text-center leading-snug">{item.hint}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>

            {/* ── Share Modal ─────────────────────────────────── */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => !sharing && setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-strong rounded-2xl p-6 max-w-md w-full"
                        >
                            {shared ? (
                                <div className="text-center py-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4"
                                    >
                                        <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </motion.div>
                                    <p className="text-lg font-semibold text-text-primary">Shared to Community!</p>
                                    <p className="text-sm text-text-muted mt-1">Your ad is now visible in the community feed.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-5">
                                        <h2 className="text-lg font-display font-bold text-text-primary">Share to Community</h2>
                                        <p className="text-xs text-text-muted mt-1">Make your ad visible to everyone in the community feed</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Title <span className="text-accent-purple">*</span></label>
                                            <input
                                                type="text"
                                                value={shareTitle}
                                                onChange={(e) => setShareTitle(e.target.value)}
                                                maxLength={100}
                                                className="w-full bg-surface-light/60 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Description</label>
                                            <textarea
                                                value={shareDesc}
                                                onChange={(e) => setShareDesc(e.target.value)}
                                                rows={2}
                                                maxLength={500}
                                                className="w-full bg-surface-light/60 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Website / Product Link</label>
                                            <input
                                                type="url"
                                                value={shareLink}
                                                onChange={(e) => setShareLink(e.target.value)}
                                                placeholder="https://your-brand.com"
                                                className="w-full bg-surface-light/60 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-5">
                                        <Button variant="outline" onClick={() => setShowShareModal(false)} disabled={sharing} fullWidth>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={handleShare} disabled={!shareTitle.trim() || sharing} fullWidth>
                                            {sharing ? "Sharing..." : "Post to Community"}
                                        </Button>
                                    </div>
                                    {shareError && (
                                        <p className="text-red-400 text-xs text-center mt-3 bg-red-500/8 rounded-lg py-2 px-3">{shareError}</p>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}
