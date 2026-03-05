"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { communityService, CommunityPost } from "@/services/community";

// ── Filter config ─────────────────────────────────────────────────────────────
const FILTERS = [
    { id: "all",    label: "All" },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
    { id: "mine",   label: "My Ads" },
] as const;
type FilterId = typeof FILTERS[number]["id"];

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({
    post, index, isOwn, isLiked, isAuthenticated, togglingVisibility,
    onLike, onDelete, onOpen, onToggleVisibility, timeAgo,
}: {
    post: CommunityPost; index: number; isOwn: boolean; isLiked: boolean;
    isAuthenticated: boolean; togglingVisibility: boolean;
    onLike: () => void; onDelete: () => void; onOpen: () => void;
    onToggleVisibility: () => void; timeAgo: (d: string) => string;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (post.mediaType === "video" && videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    };
    const handleMouseLeave = () => {
        if (post.mediaType === "video" && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4) }}
            className="glass rounded-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.12)] transition-all duration-300 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onOpen}
        >
            {/* Media */}
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-light">
                {post.mediaType === "video" ? (
                    <video
                        ref={videoRef}
                        src={post.imageUrl}
                        className="w-full h-full object-cover"
                        muted loop playsInline preload="metadata"
                    />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Private badge */}
                {isOwn && !post.isPublic && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white/80 text-xs font-medium">
                        Private
                    </span>
                )}

                {/* Owner controls */}
                {isOwn && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        {/* Visibility toggle */}
                        <button
                            onClick={onToggleVisibility}
                            disabled={togglingVisibility}
                            title={post.isPublic ? "Make private" : "Make public"}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all"
                        >
                            {togglingVisibility ? (
                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : post.isPublic ? (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </button>
                        {/* Delete */}
                        <button
                            onClick={onDelete}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Card footer */}
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                            {post.user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.user.avatar} alt="" className="w-6 h-6 object-cover" />
                            ) : (
                                post.user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">{post.user.name}</p>
                            <p className="text-[10px] text-text-muted">{timeAgo(post.createdAt)}</p>
                        </div>
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onLike(); }}
                        disabled={!isAuthenticated}
                        className={`flex items-center gap-1 text-xs shrink-0 transition-colors ${
                            isLiked ? "text-red-400" : isAuthenticated ? "text-text-muted hover:text-red-400" : "text-text-muted/40 cursor-default"
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {post.likeCount || 0}
                    </button>
                </div>
                {post.title && (
                    <p className="text-xs text-text-secondary mt-1.5 truncate">{post.title}</p>
                )}
            </div>
        </motion.div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CommunityPage() {
    const { user, isAuthenticated } = useAuth();

    const [posts,       setPosts]       = useState<CommunityPost[]>([]);
    const [myPosts,     setMyPosts]     = useState<CommunityPost[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [myLoading,   setMyLoading]   = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterId>("all");
    const [sortBy,      setSortBy]      = useState<"latest" | "popular">("latest");
    const [lightboxPost, setLightboxPost] = useState<CommunityPost | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // form
    const [title,        setTitle]        = useState("");
    const [description,  setDescription]  = useState("");
    const [link,         setLink]         = useState("");
    const [image,        setImage]        = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading,    setUploading]    = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Data loading ──────────────────────────────────────────────────────────
    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await communityService.getPosts(1, 50);
            setPosts(data.posts);
        } catch (err) {
            console.error("Failed to load posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadMyPosts = async () => {
        try {
            setMyLoading(true);
            const data = await communityService.getMyPosts();
            setMyPosts(data.posts);
        } catch (err) {
            console.error("Failed to load my posts:", err);
        } finally {
            setMyLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);
    useEffect(() => { if (isAuthenticated) loadMyPosts(); }, [isAuthenticated]);

    // ── Derived lists ─────────────────────────────────────────────────────────
    const filteredPosts = useMemo(() => {
        let base: CommunityPost[];
        if (activeFilter === "mine") {
            base = myPosts; // includes private — owner sees all their own
        } else if (activeFilter === "images") {
            base = posts.filter(p => p.isPublic && p.mediaType !== "video");
        } else if (activeFilter === "videos") {
            base = posts.filter(p => p.isPublic && p.mediaType === "video");
        } else {
            base = posts.filter(p => p.isPublic); // guard: never leak private into All
        }
        if (sortBy === "popular") {
            return [...base].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        }
        return [...base].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [posts, myPosts, activeFilter, sortBy]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const timeAgo = (iso: string) => {
        const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
        if (s < 60)  return "just now";
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };
    const isMyPost  = (p: CommunityPost) => user?.id === p.user._id;
    const isLikedFn = (p: CommunityPost) => p.likes.includes(user?.id || "");
    const isListLoading = loading || (activeFilter === "mine" && myLoading);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.onload = ev => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const resetForm = () => {
        setTitle(""); setDescription(""); setLink("");
        setImage(null); setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreatePost = async () => {
        if (!title.trim() || !image) return;
        try {
            setUploading(true);
            const fd = new FormData();
            fd.append("title", title);
            fd.append("description", description);
            fd.append("link", link);
            fd.append("image", image);
            await communityService.createPost(fd);
            setShowCreateModal(false);
            resetForm();
            await Promise.all([loadPosts(), loadMyPosts()]);
        } catch (err) {
            console.error("Failed to create post:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await communityService.deletePost(id);
            setPosts(prev => prev.filter(p => p._id !== id));
            setMyPosts(prev => prev.filter(p => p._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const applyLike = (id: string, liked: boolean) => {
        const update = (arr: CommunityPost[]) =>
            arr.map(p => p._id !== id ? p : {
                ...p,
                likeCount: liked ? (p.likeCount || 0) + 1 : Math.max((p.likeCount || 0) - 1, 0),
                likes: liked ? [...p.likes, user!.id] : p.likes.filter(uid => uid !== user!.id),
            });
        setPosts(update); setMyPosts(update);
        if (lightboxPost?._id === id) {
            setLightboxPost(prev => prev ? update([prev])[0] : null);
        }
    };

    const handleLike = async (id: string) => {
        if (!user) return;
        const post = [...posts, ...myPosts].find(p => p._id === id);
        if (!post) return;
        const isLiked = post.likes.includes(user.id);
        applyLike(id, !isLiked);
        try {
            await communityService.toggleLike(id);
        } catch {
            applyLike(id, isLiked);
        }
    };

    const handleToggleVisibility = async (id: string) => {
        // Capture the post data synchronously before any state changes
        const sourcePost = myPosts.find(p => p._id === id);
        try {
            setTogglingVisibility(id);
            const { isPublic } = await communityService.toggleVisibility(id);

            // Update myPosts (owner sees all their own)
            setMyPosts(prev => prev.map(p => p._id === id ? { ...p, isPublic } : p));

            // Sync public feed independently
            if (isPublic && sourcePost) {
                setPosts(prev => {
                    if (prev.some(p => p._id === id)) {
                        // Already present — just update flag
                        return prev.map(p => p._id === id ? { ...p, isPublic: true } : p);
                    }
                    // Was private so it was absent from public feed — inject at top
                    return [{ ...sourcePost, isPublic: true }, ...prev];
                });
            } else if (!isPublic) {
                // Made private — remove from public feed
                setPosts(prev => prev.filter(p => p._id !== id));
            }
        } catch (err) {
            console.error("Failed to toggle visibility:", err);
        } finally {
            setTogglingVisibility(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-accent-purple/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-indigo/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between flex-wrap gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient tracking-tight">Community</h1>
                        <p className="text-text-secondary mt-1.5 text-sm">AI-generated ads from creators around the world</p>
                    </div>
                    {isAuthenticated && (
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Share Ad
                        </Button>
                    )}
                </motion.div>

                {/* ── Filter + Sort bar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="flex items-center justify-between flex-wrap gap-3 mb-7"
                >
                    <div className="flex items-center gap-1 p-1 bg-surface/60 border border-border/50 rounded-xl">
                        {FILTERS.map(f => {
                            const disabled = f.id === "mine" && !isAuthenticated;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => !disabled && setActiveFilter(f.id)}
                                    disabled={disabled}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        activeFilter === f.id
                                            ? "bg-accent-purple text-white shadow-sm"
                                            : disabled
                                                ? "text-text-muted/40 cursor-not-allowed"
                                                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-surface/60 border border-border/50 rounded-xl">
                        {(["latest", "popular"] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setSortBy(s)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                                    sortBy === s ? "bg-surface-light text-text-primary" : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                {s === "latest" ? (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Latest</>
                                ) : (
                                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>Popular</>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Grid ── */}
                {isListLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-[4/5] bg-surface-light" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-surface-light rounded w-3/4" />
                                    <div className="h-2.5 bg-surface-light rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-light flex items-center justify-center mb-5 border border-border">
                            <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {activeFilter === "mine" ? "You haven't shared any ads yet" : "Nothing here yet"}
                        </h3>
                        <p className="text-text-muted text-sm mb-6">
                            {activeFilter === "mine" ? "Generate an ad and share it to the community." : "Be the first to share an AI-generated ad."}
                        </p>
                        {isAuthenticated && (
                            <Button variant="primary" onClick={() => setShowCreateModal(true)}>Share Your Ad</Button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredPosts.map((post, index) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                index={index}
                                isOwn={isMyPost(post)}
                                isLiked={isLikedFn(post)}
                                isAuthenticated={isAuthenticated}
                                togglingVisibility={togglingVisibility === post._id}
                                onLike={() => handleLike(post._id)}
                                onDelete={() => setDeleteConfirm(post._id)}
                                onOpen={() => setLightboxPost(post)}
                                onToggleVisibility={() => handleToggleVisibility(post._id)}
                                timeAgo={timeAgo}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            <AnimatePresence>
                {lightboxPost && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setLightboxPost(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            onClick={e => e.stopPropagation()}
                            className="glass rounded-2xl overflow-hidden border border-border/60 max-w-4xl w-full flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Media panel */}
                            <div className="md:w-[62%] bg-black flex items-center justify-center shrink-0 overflow-hidden">
                                {lightboxPost.mediaType === "video" ? (
                                    <video src={lightboxPost.imageUrl} className="w-full h-full object-contain max-h-[88vh]" controls autoPlay muted loop />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={lightboxPost.imageUrl} alt={lightboxPost.title} className="w-full h-full object-contain max-h-[88vh]" />
                                )}
                            </div>
                            {/* Details panel */}
                            <div className="flex flex-col p-6 md:w-[38%] overflow-y-auto">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                                            {lightboxPost.user.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={lightboxPost.user.avatar} alt="" className="w-9 h-9 object-cover" />
                                            ) : (
                                                lightboxPost.user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary leading-tight">{lightboxPost.user.name}</p>
                                            <p className="text-xs text-text-muted">{timeAgo(lightboxPost.createdAt)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLightboxPost(null)}
                                        className="w-8 h-8 rounded-xl bg-surface-light flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <h2 className="text-lg font-bold text-text-primary mb-2 leading-snug">{lightboxPost.title}</h2>
                                {lightboxPost.description && (
                                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">{lightboxPost.description}</p>
                                )}
                                {lightboxPost.link && (
                                    <a
                                        href={lightboxPost.link.startsWith("http") ? lightboxPost.link : `https://${lightboxPost.link}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-accent-purple hover:text-accent-indigo transition-colors mb-5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.43a4.5 4.5 0 00-6.364-6.364L4.5 8.25l4.5 4.5" />
                                        </svg>
                                        Visit Website
                                    </a>
                                )}
                                <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-3">
                                    <button
                                        onClick={() => handleLike(lightboxPost._id)}
                                        disabled={!isAuthenticated}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                            isLikedFn(lightboxPost)
                                                ? "bg-red-500/15 border-red-500/30 text-red-400"
                                                : isAuthenticated
                                                    ? "border-border text-text-muted hover:border-red-400/40 hover:text-red-400"
                                                    : "border-border text-text-muted/40 cursor-default"
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill={isLikedFn(lightboxPost) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        {lightboxPost.likeCount || 0}
                                    </button>
                                    {isMyPost(lightboxPost) && (
                                        <button
                                            onClick={() => { setLightboxPost(null); setDeleteConfirm(lightboxPost._id); }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Create Modal ── */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !uploading && setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass rounded-2xl p-6 max-w-md w-full border border-border"
                        >
                            <h2 className="text-xl font-display font-bold text-text-primary mb-6">Share Your Ad</h2>
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Title *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My awesome sneaker ad" maxLength={100}
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all" />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell the community about this ad..." rows={2} maxLength={500}
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all resize-none" />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Website Link</label>
                                <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://your-brand.com"
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all" />
                            </div>
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Media *</label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border hover:border-accent-purple/40 rounded-xl p-4 text-center cursor-pointer transition-all">
                                    <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageSelect} />
                                    {imagePreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                                    ) : (
                                        <div className="py-6">
                                            <svg className="w-8 h-8 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                            <p className="text-sm text-text-muted">Click to upload image or video</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} disabled={uploading} fullWidth>Cancel</Button>
                                <Button variant="primary" onClick={handleCreatePost} disabled={!title.trim() || !image || uploading} fullWidth>
                                    {uploading ? (
                                        <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Uploading...</>
                                    ) : "Post"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirm ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/20"
                        >
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Post?</h3>
                            <p className="text-sm text-text-muted mb-6">Permanently removes the post and its media. Cannot be undone.</p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
