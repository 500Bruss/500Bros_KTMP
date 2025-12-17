// src/api/policyApi.js
import api from "./axiosClient";

export const policyApi = {
    // Lấy danh sách policy
    getPolicies: ({ page = 1, size = 10, sort = "createdAt,desc", filter = "", search = "", all = false } = {}) => {
        return api.get("/api/policies", {
            params: {
                page,
                size,
                sort,
                filter: buildFilter(filter, search),
                all,
            },
        });
    },

    // [ĐÃ SỬA] Gửi yêu cầu claim với dữ liệu từ Form nhập
    createClaim: (policyId, requestData) => {
        // requestData này chính là object bạn đã build trong handleClaimSubmit ở file PolicyList.js
        // Nó khớp với DTO ClaimCreationRequest bên Java
        return api.post(`/api/claims/${policyId}`, requestData);
    },
};

// Hàm helper build filter (giữ nguyên)
function buildFilter(filter, searchText) {
    let filters = [];
    if (filter && filter.trim() !== "") filters.push(filter);
    if (searchText && searchText.trim() !== "") {
        let key = searchText
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "*");
        filters.push(`name==*${key}*`); // Lưu ý: Backend phải hỗ trợ search field "name"
    }
    return filters.join(";");
}