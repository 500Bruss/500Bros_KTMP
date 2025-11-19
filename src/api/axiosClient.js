import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080", // <-- đúng prefix BE của bạn
    headers: {
        "Content-Type": "application/json",
    },
});

// ==============================
// REQUEST INTERCEPTOR
// Gắn access_token vào header
// ==============================
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==============================
// RESPONSE INTERCEPTOR
// Tự refresh token khi 401
// ==============================
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Nếu là lỗi 401 & chưa retry
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const refresh_token = localStorage.getItem("refresh_token");
                if (!refresh_token) throw new Error("NO_REFRESH_TOKEN");

                // ⚡ Gọi đúng API của backend
                const res = await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    { token: refresh_token }
                );

                // Lưu token mới
                localStorage.setItem("access_token", res.data.access_token);

                // Gắn vào request cũ
                original.headers.Authorization = `Bearer ${res.data.access_token}`;

                // Gọi lại request ban đầu
                return api(original);
            } catch (err) {
                // Refresh token hết hạn → logout
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
