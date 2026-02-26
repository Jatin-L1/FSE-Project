import api from "./api";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "free" | "pro";
    credits: number;
}

export const userService = {
    async getProfile(): Promise<UserProfile> {
        const { data } = await api.get("/user/profile");
        return data.user;
    },

    async deductCredits(amount: number = 1): Promise<{ credits: number }> {
        const { data } = await api.post("/user/credits/deduct", { amount });
        return data;
    },
};
