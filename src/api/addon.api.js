import api from "./axiosClient";

export const addonApi = {
    getByProduct: (productId) =>
        api.get("/api/addons", {
            params: {
                productId: productId,
            },
        }),

    create: (productId, data) =>
        api.post(`/api/addons/${productId}`, data),

    update: (id, data) =>
        api.put(`/api/addons/${id}`, data),

    updateStatus: (addonId, status) =>
        api.get(`/api/addons/${addonId}/status/${status}`),
};
