import api from "./axiosClient";

export const paymentApi = {
  create: (applicationId, method = "VNPAY") =>
    api.post("/api/payments", {
      applicationId: String(applicationId),  // ⭐ FIX QUAN TRỌNG
      method: method,
    }),
};
