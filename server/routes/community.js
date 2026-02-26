const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

// Multer: store in memory for Cloudinary upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image/video files are allowed"), false);
        }
    },
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, resourceType = "image", folder = "ai-ads-community") => {
    return new Promise((resolve, reject) => {
        const options = {
            folder,
            resource_type: resourceType,
        };
        if (resourceType === "image") {
            options.transformation = [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto", fetch_format: "auto" },
            ];
        }
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        stream.end(buffer);
    });
};

// ──────────────────────────────────────────────────────
// GET /api/community — List all posts (PUBLIC, no auth)
// ──────────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "name avatar email"),
            Post.countDocuments(),
        ]);

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Get posts error:", err);
        res.status(500).json({ message: "Failed to fetch posts." });
    }
});

// ──────────────────────────────────────────────────────
// POST /api/community — Create post via file upload (auth)
// ──────────────────────────────────────────────────────
router.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image is required." });
        }

        const { title, description, link, mediaType } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }

        const resType = mediaType === "video" ? "video" : "image";
        const result = await uploadToCloudinary(req.file.buffer, resType);

        const post = await Post.create({
            user: req.user.id,
            title: title.trim(),
            description: (description || "").trim(),
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            mediaType: resType,
            link: (link || "").trim(),
        });

        await post.populate("user", "name avatar email");
        res.status(201).json(post);
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Failed to create post." });
    }
});

// ──────────────────────────────────────────────────────
// POST /api/community/share — Share generated ad (base64)
// Called from the generator page after generating an ad
// ──────────────────────────────────────────────────────
router.post("/share", auth, express.json({ limit: "20mb" }), async (req, res) => {
    try {
        const { title, description, link, imageBase64, mimeType, mediaType } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }
        if (!imageBase64) {
            return res.status(400).json({ message: "Image/video data is required." });
        }

        // Convert base64 to buffer and upload to Cloudinary
        const buffer = Buffer.from(imageBase64, "base64");
        const resType = mediaType === "video" ? "video" : "image";
        const result = await uploadToCloudinary(buffer, resType);

        const post = await Post.create({
            user: req.user.id,
            title: title.trim(),
            description: (description || "").trim(),
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            mediaType: resType,
            link: (link || "").trim(),
        });

        await post.populate("user", "name avatar email");
        res.status(201).json(post);
    } catch (err) {
        console.error("Share post error:", err);
        res.status(500).json({ message: "Failed to share to community." });
    }
});

// ──────────────────────────────────────────────────────
// GET /api/community/my — Get current user's posts
// ──────────────────────────────────────────────────────
router.get("/my", auth, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate("user", "name avatar email");
        res.json({ posts });
    } catch (err) {
        console.error("Get my posts error:", err);
        res.status(500).json({ message: "Failed to fetch your posts." });
    }
});

// ──────────────────────────────────────────────────────
// DELETE /api/community/:id — Delete own post (auth)
// ──────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this post." });
        }

        try {
            await cloudinary.uploader.destroy(post.cloudinaryId, {
                resource_type: post.mediaType === "video" ? "video" : "image",
            });
        } catch (cloudErr) {
            console.error("Cloudinary delete error:", cloudErr);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted." });
    } catch (err) {
        console.error("Delete post error:", err);
        res.status(500).json({ message: "Failed to delete post." });
    }
});

// ──────────────────────────────────────────────────────
// POST /api/community/:id/like — Toggle like (auth)
// ──────────────────────────────────────────────────────
router.post("/:id/like", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const userId = req.user.id;
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ liked: !alreadyLiked, likeCount: post.likes.length });
    } catch (err) {
        console.error("Like post error:", err);
        res.status(500).json({ message: "Failed to toggle like." });
    }
});

module.exports = router;
