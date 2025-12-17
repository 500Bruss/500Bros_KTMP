import api from "./axiosClient";

export const productApi = {
    // 1. Lấy danh sách theo danh mục (Dành cho khách hàng -> Chỉ lấy ACTIVE)
    getByCategory: (categoryId, searchText = "", page = 1, size = 6) =>
        api.get("/api/products", {
            params: {
                all: false,
                page,
                size,
                sort: "createdAt,desc",
                // Truyền true vào tham số cuối để bật chế độ chỉ lấy ACTIVE
                filter: buildFilter(categoryId, searchText, true),
            },
        }),

    // 2. Tìm kiếm tất cả (Dành cho khách hàng -> Chỉ lấy ACTIVE)
    searchAll: (searchText = "", page = 1, size = 6) =>
        api.get("/api/products", {
            params: {
                all: false,
                page,
                size,
                sort: "createdAt,desc",
                // Truyền true vào tham số cuối
                filter: buildFilter(null, searchText, true),
            },
        }),

    // --- Các hàm Admin giữ nguyên ---
    getAll: (params) => api.get("/api/products", { params }),
    create: (data) => api.post("/api/products", data),
    update: (id, data) => api.put(`/api/products/${id}`, data),
    updateStatus: (id, status) => api.put(`/api/products/${id}/status/${status}`),
    delete: (id) => api.delete(`/api/products/${id}`),
};

// --- HÀM HELPER (ĐÃ CẬP NHẬT) ---
// Thêm tham số onlyActive (mặc định false để không ảnh hưởng Admin nếu dùng chung)
function buildFilter(categoryId, searchText, onlyActive = false) {
    let filters = [];

    // [MỚI] Nếu là khách xem, chỉ lấy status ACTIVE
    if (onlyActive) {
        filters.push("status=='ACTIVE'");
    }

    if (categoryId && categoryId !== "all") {
        filters.push(`category.id==${categoryId}`);
    }

    if (searchText && searchText.trim() !== "") {
        let key = searchText.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "*");

        // Tìm theo tên HOẶC mô tả (bọc trong ngoặc đơn để logic đúng)
        // Cú pháp RSQL: (name==*key*,description==*key*)
        filters.push(`(name==*${key}*,description==*${key}*)`);
    }

    return filters.join(";"); // RSQL dùng dấu ; cho AND
}