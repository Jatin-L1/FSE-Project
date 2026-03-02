import api from "./api";

export const paymentService = {
    async initiateUpgrade(): Promise<{ redirectUrl: string; transactionId: string }> {
        const { data } = await api.post("/payment/initiate");
        return data;
    },

    async verifyPayment(transactionId: string): Promise<{ success: boolean; message: string; code?: string }> {
        const { data } = await api.get(`/payment/verify/${transactionId}`);
        return data;
    },
};
