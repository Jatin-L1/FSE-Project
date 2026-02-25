import api from "./api";

export interface AuthResponse {
    token: string;
    user: {
        name: string;
        email: string;
        role: "free" | "pro";
        credits: number;
    };
}

export const authService = {
    async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post("/auth/login", { email, password });
        return data;
    },

    async signupWithEmail(name: string, email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post("/auth/signup", { name, email, password });
        return data;
    },

    getGoogleOAuthUrl(): string {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        return `${baseUrl}/auth/google`;
    },

    async getMe(): Promise<AuthResponse["user"]> {
        const { data } = await api.get("/auth/me");
        return data.user;
    },
};
