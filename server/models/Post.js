const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        imageUrl: {
            type: String,
            required: true,
        },
        cloudinaryId: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image",
        },
        link: {
            type: String,
            trim: true,
            default: "",
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Virtual for like count
postSchema.virtual("likeCount").get(function () {
    return this.likes.length;
});

// Ensure virtuals are included in JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
