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
        const { data } = await api.get("/community", {
            params: { page, limit },
        });
        return data;
    },

    getMyPosts: async (): Promise<{ posts: CommunityPost[] }> => {
        const { data } = await api.get("/community/my");
        return data;
    },

    createPost: async (formData: FormData): Promise<CommunityPost> => {
        const { data } = await api.post("/community", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    },

    shareFromGenerator: async (payload: {
        title: string;
        description: string;
        link: string;
        videoUrl: string;
        cloudinaryPublicId: string | null;
        mediaType: "image" | "video";
    }): Promise<CommunityPost> => {
        const { data } = await api.post("/community/share", payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 120000, // 2 minute timeout for large base64 uploads
        });
        return data;
    },

    deletePost: async (postId: string): Promise<void> => {
        await api.delete(`/community/${postId}`);
    },

    toggleLike: async (postId: string): Promise<{ liked: boolean; likeCount: number }> => {
        const { data } = await api.post(
            `/community/${postId}/like`,
            {}
        );
        return data;
    },
};
