import api from "./axiosClient";

export const claimApi = {
    // 1. Lấy danh sách (Dùng chung cho cả Admin và User History)
    // Cho phép truyền params (page, size, filter, sort) từ bên ngoài vào
    getClaims: (params = {}) => {
        return api.get("/api/claims", {
            params: {
                page: 1,
                size: 10,
                sort: "createdAt,desc", // Mặc định sắp xếp mới nhất
                all: false,             // Mặc định có phân trang
                ...params               // Ghi đè các tham số truyền vào
            }
        });
    },

    // 2. Lấy chi tiết 1 claim
    getById: (id) => api.get(`/api/claims/${id}`),

    // 3. Tạo mới claim (Cần biết tạo cho hợp đồng nào)
    // URL này dựa trên logic cũ của bạn: /api/claims/{policyId}
    createClaim: (policyId, data) => {
        return api.post(`/api/claims/${policyId}`, data);
    },

    // 4. Cập nhật / Duyệt claim (Dành cho Admin)
    update: (id, data) => api.put(`/api/claims/${id}`, data),

    // 5. Xóa claim
    delete: (id) => api.delete(`/api/claims/${id}`)
};