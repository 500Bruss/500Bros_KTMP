import api from "./axiosClient";

export const authApi = {
    login: (data) => api.post("/auth/login", data),
    register: (data) => api.post("/auth/register", data),
    refresh: (token) => api.post("/auth/refresh", { token }),
    introspect: (token) => api.post("/auth/introspect", { token }),
};
