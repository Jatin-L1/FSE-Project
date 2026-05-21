"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user";
import { communityService } from "@/services/community";
import { paymentService } from "@/services/payment";
import { useSearchParams } from "next/navigation";



interface GenerationResult {
    success: boolean;
    videoUrl: string;
    generationId: string;
    cloudinaryPublicId: string | null;
}

function GeneratorPageInner() {
    const { user, updateCredits, updateGenerationCount } = useAuth();
    const searchParams = useSearchParams();

    // Form state
    const [brandName, setBrandName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [generationType] = useState<"image" | "video">("image");
    const [selectedStyle] = useState("cinematic");
    const [selectedRatio] = useState("16:9");
    const [selectedDuration] = useState(6);
    const [productPhoto, setProductPhoto] = useState<File | null>(null);
    const [productPreview, setProductPreview] = useState<string | null>(null);

    const [uploadError, setUploadError] = useState<string | null>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const isFreeUser = !user?.role || user.role === "free";

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Payment state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [justPaid, setJustPaid] = useState(false); // Track if user just completed payment

    // Share to community state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareTitle, setShareTitle] = useState("");
    const [shareDesc, setShareDesc] = useState("");
    const [shareLink, setShareLink] = useState("");
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);

    const productInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasCredits = (user?.credits ?? 0) > 0;
    const isFirstGeneration = (user?.generationCount ?? 0) === 0;

    // Check if user returned from payment
    useEffect(() => {
        const paid = searchParams.get("paid");
        if (paid === "true") {
            // User just paid successfully
            setJustPaid(true);
            console.log("User returned from successful payment");
            
            // Clear the parameter from URL
            const url = new URL(window.location.href);
            url.searchParams.delete("paid");
            window.history.replaceState({}, "", url.toString());
        }
    }, [searchParams]);

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

    const handleGenerate = async () => {
        if (!productDescription.trim() || !productPhoto) return;
        if (!hasCredits) return;

        // Check if user just paid (tracked in state)
        if (justPaid) {
            // User just completed payment, allow generation
            setJustPaid(false); // Clear the flag after using it
            await executeGeneration(false);
            return;
        }

        // Check if this is the first generation (free)
        if (isFirstGeneration) {
            // First generation is free — proceed directly
            await executeGeneration(true);
            return;
        }

        // For subsequent generations, show payment modal
        setShowPaymentModal(true);
    };

    const handlePayAndGenerate = async () => {
        setIsInitiatingPayment(true);
        setPaymentError(null);

        try {
            const result = await paymentService.initiateGeneration();

            if (result.free) {
                // Shouldn't happen here but handle gracefully
                setShowPaymentModal(false);
                await executeGeneration(true);
                return;
            }

            if (result.redirectUrl) {
                // Redirect to PhonePe payment page
                window.location.href = result.redirectUrl;
            } else {
                setPaymentError("Could not initiate payment. Please try again.");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Payment initiation failed.";
            setPaymentError(message);
        } finally {
            setIsInitiatingPayment(false);
        }
    };

    const executeGeneration = async (isFree: boolean) => {
        setIsGenerating(true);
        setGenError(null);
        setGenerationResult(null);
        setShowPaymentModal(false);

        try {
            const formData = new FormData();
            formData.append("brandName", brandName.trim());
            formData.append("productDescription", productDescription.trim());
            formData.append("productPhoto", productPhoto!);
            formData.append("style", selectedStyle);
            formData.append("aspectRatio", selectedRatio);
            formData.append("duration", String(selectedDuration));


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
                cloudinaryPublicId: data.cloudinaryPublicId ?? null,
            });

            // Record the generation
            if (isFree) {
                // Record free generation on backend
                try {
                    const result = await paymentService.recordFreeGeneration();
                    updateGenerationCount(result.generationCount);
                } catch {
                    // Optimistic update
                    updateGenerationCount(1);
                }
            }
            // Note: For paid generations, the count was already incremented during payment verification
            // So we don't increment it again here

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

    const canGenerate = productDescription.trim() && productPhoto && hasCredits && !isGenerating;

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
        setShareError(null);
        try {
            // Determine the correct media type based on what was generated
            const isVideo = generationType === "video";
            await communityService.shareFromGenerator({
                title: shareTitle.trim(),
                description: shareDesc.trim(),
                link: shareLink.trim(),
                videoUrl: generationResult.videoUrl,
                cloudinaryPublicId: generationResult.cloudinaryPublicId,
                mediaType: isVideo ? "video" : "image",
            });
            setShared(true);
            setTimeout(() => setShowShareModal(false), 1500);
        } catch (err: unknown) {
            console.error("Share failed:", err);
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to share. Please try again.");
            setShareError(message);
        } finally {
            setSharing(false);
        }
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
                                    AI Ad Generator
                                </h1>
                                <p className="text-text-secondary mt-2">
                                    Upload your product — AI creates a {generationType === "video" ? "video" : "image"} ad with Freepik
                                </p>
                            </div>
                            {/* Credits & Generation Info */}
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${hasCredits ? "bg-surface-light border-border" : "bg-red-500/10 border-red-500/20"}`}>
                                    <svg className={`w-4 h-4 ${hasCredits ? "text-accent-gold" : "text-red-400"}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.89-8.9c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67c-.15-.45-.82-1.92-2.54-2.24V5h-2v1.26c-2.48.56-2.49 2.86-2.49 2.96 0 2.27 2.25 2.91 3.35 3.31 1.58.56 2.28 1.07 2.28 2.03 0 1.13-1.05 1.61-1.98 1.61-1.82 0-2.34-1.87-2.4-2.09l-1.66.67c.63 2.19 2.28 2.78 2.9 2.96V19h2v-1.24c.4-.09 2.9-.59 2.9-3.22 0-1.39-.61-2.61-3.01-3.44z" />
                                    </svg>
                                    <span className={`text-sm font-semibold ${hasCredits ? "text-text-primary" : "text-red-400"}`}>
                                        {user?.credits ?? 0} credits
                                    </span>
                                </div>
                                {isFirstGeneration ? (
                                    <span className="text-xs text-green-400 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                                        🎁 1st Ad Free
                                    </span>
                                ) : (
                                    <span className="text-xs text-accent-gold px-2 py-1 rounded-md bg-accent-gold/10 border border-accent-gold/20">
                                        ₹1/generation
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
                                            Generating {generationType === "video" ? "Video" : "Image"}... {formatTime(elapsedTime)}
                                        </>
                                    ) : !hasCredits ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                            No Credits Remaining
                                        </>
                                    ) : isFirstGeneration ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                            </svg>
                                            Generate {generationType === "video" ? "Video" : "Image"} Ad — Free 🎁
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                            </svg>
                                            Generate {generationType === "video" ? "Video" : "Image"} Ad — ₹1
                                        </>
                                    )}
                                </Button>
                                {!hasCredits && (
                                    <p className="text-center text-xs text-red-400 mt-2">
                                        No credits remaining. Contact support to get more credits.
                                    </p>
                                )}
                                {uploadError && (
                                    <p className="text-center text-xs text-red-400 mt-2">
                                        {uploadError}
                                    </p>
                                )}
                                {isGenerating && (
                                    <p className="text-center text-xs text-text-muted mt-2 animate-pulse">
                                        {generationType === "video" ? "Video generation takes 1-3 minutes." : "Image generation takes 10-30 seconds."} Please wait...
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Panel — Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-7 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto"
                        >
                            <div className="glass rounded-2xl p-6 min-h-[600px] flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                        Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-accent-gold animate-pulse" : generationResult ? "bg-green-400" : "bg-text-muted"}`} />
                                        <span className="text-xs text-text-muted">
                                            {isGenerating ? `Generating... ${formatTime(elapsedTime)}` : generationResult ? "Video Ready" : "Waiting"}
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

                                        ) : generationResult ? (
                                            <motion.div
                                                key="generated"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-full flex flex-col"
                                            >
                                                {/* Video Player — CDN URL */}
                                                <div className="flex-1 flex items-center justify-center p-4 bg-black/40">
                                                    {generationResult.videoUrl.endsWith('.mp4') || generationResult.videoUrl.includes('/video/upload/') ? (
                                                        <video
                                                            ref={videoRef}
                                                            src={generationResult.videoUrl}
                                                            controls
                                                            autoPlay
                                                            loop
                                                            playsInline
                                                            className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
                                                        />
                                                    ) : (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={generationResult.videoUrl}
                                                            alt="Generated Ad"
                                                            className="max-w-full max-h-[500px] rounded-xl shadow-2xl object-contain"
                                                        />
                                                    )}
                                                </div>

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
                                                                {selectedDuration}s
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                                                                🎬 Video Ready
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const link = document.createElement("a");
                                                                    link.href = generationResult.videoUrl;
                                                                    const isVideo = generationResult.videoUrl.endsWith('.mp4') || generationResult.videoUrl.includes('/video/upload/');
                                                                    const ext = isVideo ? "mp4" : "jpg";
                                                                    link.download = `${(brandName || "ad").replace(/\s+/g, "-")}-${generationResult.generationId.slice(0, 8)}.${ext}`;
                                                                    link.target = "_blank";
                                                                    link.click();
                                                                }}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                                </svg>
                                                                Download
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={openShareModal}>
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                                                </svg>
                                                                Share to Community
                                                            </Button>
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

            {/* ═══════════════════════════════════════════════════════════
                 PAYMENT MODAL — PhonePe ₹1 per generation
                 ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => !isInitiatingPayment && setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass rounded-2xl p-8 max-w-md w-full border border-border relative overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-purple" />

                            {/* PhonePe Logo Area */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center mb-4 border border-purple-500/20">
                                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">
                                    Pay to Generate
                                </h2>
                                <p className="text-text-secondary mt-2 text-sm">
                                    Your free generation has been used. Each additional ad costs just ₹1.
                                </p>
                            </div>

                            {/* Price Display */}
                            <div className="bg-surface-light/80 rounded-xl p-5 mb-6 border border-border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary">AI Ad Generation</p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {generationType === "video" ? "Video" : "Image"} • {selectedStyle} • {selectedRatio}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-text-primary">₹1</p>
                                        <p className="text-xs text-text-muted">via PhonePe</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex items-start gap-3 mb-6 p-3 rounded-xl bg-accent-purple/5 border border-accent-purple/10">
                                <svg className="w-5 h-5 text-accent-purple flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    You&apos;ll be redirected to PhonePe to complete the payment. After payment, you&apos;ll be brought back to generate your ad automatically.
                                </p>
                            </div>

                            {/* Error */}
                            {paymentError && (
                                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">{paymentError}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={isInitiatingPayment}
                                    fullWidth
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handlePayAndGenerate}
                                    disabled={isInitiatingPayment}
                                    fullWidth
                                >
                                    {isInitiatingPayment ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Connecting to PhonePe...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                            </svg>
                                            Pay ₹1 with PhonePe
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Security Note */}
                            <p className="text-center text-xs text-text-muted mt-4 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Secured by PhonePe Payment Gateway
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════
                 SHARE TO COMMUNITY MODAL
                 ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !sharing && setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass rounded-2xl p-6 max-w-md w-full border border-border"
                        >
                            {shared ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-text-primary">Shared to Community! 🎉</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-display font-bold text-text-primary mb-6">
                                        Share to Community
                                    </h2>
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Title *</label>
                                        <input
                                            type="text"
                                            value={shareTitle}
                                            onChange={(e) => setShareTitle(e.target.value)}
                                            maxLength={100}
                                            className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Description</label>
                                        <textarea
                                            value={shareDesc}
                                            onChange={(e) => setShareDesc(e.target.value)}
                                            rows={2}
                                            maxLength={500}
                                            className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Website / Product Link</label>
                                        <input
                                            type="url"
                                            value={shareLink}
                                            onChange={(e) => setShareLink(e.target.value)}
                                            placeholder="https://your-brand.com"
                                            className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                        />
                                    </div>
                                    {shareError && (
                                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <p className="text-sm text-red-400">{shareError}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setShowShareModal(false)} disabled={sharing} fullWidth>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={handleShare} disabled={!shareTitle.trim() || sharing} fullWidth>
                                            {sharing ? "Sharing..." : "Share"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
}

export default function GeneratorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <GeneratorPageInner />
        </Suspense>
    );
}
