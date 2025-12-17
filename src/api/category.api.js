import api from "./axiosClient";

export const categoryApi = {
    // --- LẤY DANH SÁCH ---
    getAll: () =>
        api.get("/api/categories", {
            params: {
                all: true,
                sort: "createdAt,desc" // Sửa thành desc để cái mới nhất lên đầu
            }
        }),

    getActive: () =>
        api.get("/api/categories", {
            params: {
                all: true,
                sort: "createdAt,desc",
                filter: "status=='ACTIVE'" // Thêm bộ lọc này
            }
        }),
    // --- TẠO MỚI ---
    create: (data) => api.post("/api/categories", data),

    // --- CẬP NHẬT ---
    update: (id, data) => api.put(`/api/categories/${id}`, data),

    // --- XÓA ---
    // (Lưu ý: Backend Controller phải có @DeleteMapping thì cái này mới chạy)
    delete: (id) => api.delete(`/api/categories/${id}`),
};