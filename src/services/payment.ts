import api from "./api";

interface GenerationCheckResponse {
    generationCount: number;
    needsPayment: boolean;
    amount: number;
}

interface InitiateGenerationResponse {
    free: boolean;
    message?: string;
    redirectUrl?: string;
    orderId?: string;
    amount?: number;
    generationCount?: number;
}

interface VerifyGenerationResponse {
    success: boolean;
    message: string;
    orderId?: string;
    state?: string;
}

export const paymentService = {
    /** Check if the user needs to pay for the next generation */
    async checkGeneration(): Promise<GenerationCheckResponse> {
        const { data } = await api.get("/payment/check-generation");
        return data;
    },

    /** Initiate a generation — returns free:true or a PhonePe redirectUrl */
    async initiateGeneration(): Promise<InitiateGenerationResponse> {
        const { data } = await api.post("/payment/initiate-generation");
        return data;
    },

    /** Verify a PhonePe payment after redirect */
    async verifyGeneration(orderId: string): Promise<VerifyGenerationResponse> {
        const { data } = await api.get(`/payment/verify-generation/${orderId}`);
        return data;
    },

    /** Record that the user used their free generation */
    async recordFreeGeneration(): Promise<{ success: boolean; generationCount: number }> {
        const { data } = await api.post("/payment/record-free-generation");
        return data;
    },
};
