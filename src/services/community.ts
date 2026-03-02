import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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
        const { data } = await axios.get(`${API_URL}/community`, {
            params: { page, limit },
        });
        return data;
    },

    getMyPosts: async (): Promise<{ posts: CommunityPost[] }> => {
        const { data } = await axios.get(`${API_URL}/community/my`, {
            headers: getAuthHeaders(),
        });
        return data;
    },

    createPost: async (formData: FormData): Promise<CommunityPost> => {
        const { data } = await axios.post(`${API_URL}/community`, formData, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "multipart/form-data",
            },
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
        const { data } = await axios.post(`${API_URL}/community/share`, payload, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
        });
        return data;
    },

    deletePost: async (postId: string): Promise<void> => {
        await axios.delete(`${API_URL}/community/${postId}`, {
            headers: getAuthHeaders(),
        });
    },

    toggleLike: async (postId: string): Promise<{ liked: boolean; likeCount: number }> => {
        const { data } = await axios.post(
            `${API_URL}/community/${postId}/like`,
            {},
            { headers: getAuthHeaders() }
        );
        return data;
    },
};
