"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { communityService, CommunityPost } from "@/services/community";

export default function CommunityPage() {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await communityService.getPosts();
            setPosts(data.posts);
        } catch (err) {
            console.error("Failed to load posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleCreatePost = async () => {
        if (!title.trim() || !image) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("link", link.trim());
            formData.append("image", image);

            const newPost = await communityService.createPost(formData);
            setPosts((prev) => [newPost, ...prev]);
            setShowCreateModal(false);
            setTitle("");
            setDescription("");
            setLink("");
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            console.error("Failed to create post:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        try {
            await communityService.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const handleLike = async (postId: string) => {
        if (!isAuthenticated) return;
        try {
            const result = await communityService.toggleLike(postId);
            setPosts((prev) =>
                prev.map((p) => {
                    if (p._id !== postId) return p;
                    return {
                        ...p,
                        likeCount: result.likeCount,
                        likes: result.liked
                            ? [...p.likes, user?.id || ""]
                            : p.likes.filter((id) => id !== user?.id),
                    };
                })
            );
        } catch (err) {
            console.error("Failed to toggle like:", err);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
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
                                Community
                            </h1>
                            <p className="text-text-secondary mt-2">
                                Discover AI-generated ads from creators around the world
                            </p>
                        </div>
                        {isAuthenticated && (
                            <Button
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Post Your Ad
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-surface-light" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-surface-light rounded w-3/4" />
                                    <div className="h-3 bg-surface-light rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 mx-auto rounded-full bg-surface-light flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5l.75-.75a3 3 0 014.24 0l.75.75" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h3>
                        <p className="text-text-muted mb-6">Be the first to share your AI-generated ad!</p>
                        {isAuthenticated && (
                            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                Post Your Ad
                            </Button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.1)] transition-all duration-300"
                            >
                                {/* Media */}
                                <div className="relative aspect-square overflow-hidden">
                                    {post.mediaType === "video" ? (
                                        <video
                                            src={post.imageUrl}
                                            className="w-full h-full object-cover"
                                            controls
                                            muted
                                            preload="metadata"
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    {/* Media type badge */}
                                    {post.mediaType === "video" && (
                                        <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                                            🎬 Video
                                        </span>
                                    )}
                                    {/* Delete button (own posts only) */}
                                    {user?.id === post.user._id && (
                                        <button
                                            onClick={() => setDeleteConfirm(post._id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">
                                        {post.title}
                                    </h3>
                                    {post.description && (
                                        <p className="text-xs text-text-muted line-clamp-2 mb-2">
                                            {post.description}
                                        </p>
                                    )}

                                    {/* Website link */}
                                    {post.link && (
                                        <a
                                            href={post.link.startsWith("http") ? post.link : `https://${post.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-accent-purple hover:text-accent-indigo transition-colors mb-3"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.43a4.5 4.5 0 00-6.364-6.364L4.5 8.25l4.5 4.5" />
                                            </svg>
                                            Visit Website
                                        </a>
                                    )}

                                    <div className="flex items-center justify-between">
                                        {/* User info */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                                {post.user.avatar ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={post.user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    post.user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-xs text-text-muted">{post.user.name}</span>
                                            <span className="text-xs text-text-muted">·</span>
                                            <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
                                        </div>

                                        {/* Like button */}
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            disabled={!isAuthenticated}
                                            className={`flex items-center gap-1 text-sm transition-all ${!isAuthenticated
                                                    ? "text-text-muted/50 cursor-default"
                                                    : post.likes.includes(user?.id || "")
                                                        ? "text-red-400"
                                                        : "text-text-muted hover:text-red-400"
                                                }`}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill={post.likes.includes(user?.id || "") ? "currentColor" : "none"}
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                            </svg>
                                            <span className="text-xs">{post.likeCount || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !uploading && setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass rounded-2xl p-6 max-w-md w-full border border-border"
                        >
                            <h2 className="text-xl font-display font-bold text-text-primary mb-6">
                                Share Your Ad
                            </h2>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="My awesome sneaker ad"
                                    maxLength={100}
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell the community about this ad..."
                                    rows={2}
                                    maxLength={500}
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all resize-none"
                                />
                            </div>

                            {/* Website Link */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                                    Website Link
                                </label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://your-brand.com"
                                    className="w-full bg-surface-light/80 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm outline-none focus:border-accent-purple/50 transition-all"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                                    Image *
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border hover:border-accent-purple/40 rounded-xl p-4 text-center cursor-pointer transition-all"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
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

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={uploading}
                                    fullWidth
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleCreatePost}
                                    disabled={!title.trim() || !image || uploading}
                                    fullWidth
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        "Post"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/20"
                        >
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Post?</h3>
                            <p className="text-sm text-text-muted mb-6">
                                This will permanently remove the post and its media. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setDeleteConfirm(null)} fullWidth>
                                    Cancel
                                </Button>
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
