const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            // Not required for Google OAuth users
            select: false,
        },
        googleId: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["free", "pro"],
            default: "free",
        },
        credits: {
            type: Number,
            default: 50,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Return user data without sensitive fields
userSchema.methods.toProfile = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        credits: this.credits,
        avatar: this.avatar,
    };
};

module.exports = mongoose.model("User", userSchema);
