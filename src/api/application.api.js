// src/api/application.api.js
import api from "./axiosClient";

export const applicationApi = {
    create: (quoteId, payload) => api.post(`/api/applications/${quoteId}`, payload),
    getById: (id) => api.get(`/api/applications/${id}`)
};
