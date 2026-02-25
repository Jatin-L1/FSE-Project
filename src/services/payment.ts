import api from "./api";

export const paymentService = {
    async initiateUpgrade(): Promise<{ redirectUrl: string }> {
        const { data } = await api.post("/payment/upgrade");
        return data;
    },

    async verifyPayment(transactionId: string): Promise<{ success: boolean }> {
        const { data } = await api.get(`/payment/verify/${transactionId}`);
        return data;
    },
};
