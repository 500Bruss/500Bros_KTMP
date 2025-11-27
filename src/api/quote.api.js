// src/api/quote.api.js
import api from "./axiosClient";

export const quoteApi = {
    create: (payload) => api.post("/api/quotations", payload),
    getById: (id) => api.get(`/api/quotations/${id}`),
    getList: (params) => api.get("/api/quotations", { params }),
};
