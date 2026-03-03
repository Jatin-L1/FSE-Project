import api from "./api";

export interface CommunityPost {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
        email: string;
    };
    title: string;
    description: string;
    imageUrl: string;
    mediaType: "image" | "video";
    link: string;
    likes: string[];
    likeCount: number;
    isPublic: boolean;
    createdAt: string;
}

export interface CommunityResponse {
    posts: CommunityPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const communityService = {
    getPosts: async (page = 1, limit = 20): Promise<CommunityResponse> => {
        const { data } = await api.get("/community", { params: { page, limit } });
        return data;
    },

    getMyPosts: async (): Promise<{ posts: CommunityPost[] }> => {
        const { data } = await api.get("/community/my");
        return data;
    },

    createPost: async (formData: FormData): Promise<CommunityPost> => {
        // Pass Content-Type: undefined so axios/browser auto-sets multipart boundary
        const { data } = await api.post("/community", formData, {
            headers: { "Content-Type": undefined },
        });
        return data;
    },

    shareFromGenerator: async (payload: {
        title: string;
        description: string;
        link: string;
        imageBase64: string;
        mimeType: string;
        mediaType: "image" | "video";
    }): Promise<CommunityPost> => {
        const { data } = await api.post("/community/share", payload);
        return data;
    },

    // ─── Auto-save generated ad using its existing Cloudinary URL ───────────
    // No re-upload — video is already on Cloudinary from the generate pipeline
    autoSave: async (payload: {
        title: string;
        description: string;
        videoUrl: string;
        cloudinaryId: string;
        mediaType: "image" | "video";
        link?: string;
    }): Promise<CommunityPost> => {
        const { data } = await api.post("/community/share-url", payload);
        return data;
    },

    deletePost: async (postId: string): Promise<void> => {
        await api.delete(`/community/${postId}`);
    },

    toggleLike: async (postId: string): Promise<{ liked: boolean; likeCount: number }> => {
        const { data } = await api.post(`/community/${postId}/like`);
        return data;
    },

    toggleVisibility: async (postId: string): Promise<{ isPublic: boolean }> => {
        const { data } = await api.patch(`/community/${postId}/visibility`);
        return data;
    },
};
