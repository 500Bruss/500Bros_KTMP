import api from "./axiosClient";

export const productApi = {
    getByCategory: (categoryId, searchText = "", page = 1, size = 6) =>
        api.get("/api/products", {
            params: {
                all: false,
                page,
                size,
                sort: "createdAt,desc",
                filter: buildFilter(categoryId, searchText),
            },
        }),

    searchAll: (searchText = "", page = 1, size = 6) =>
        api.get("/api/products", {
            params: {
                all: false,
                page,
                size,
                sort: "createdAt,desc",
                filter: buildFilter(null, searchText),
            },
        }),
};

function buildFilter(categoryId, searchText) {
    let filters = [];

    if (categoryId && categoryId !== "all") {
        filters.push(`category.id==${categoryId}`);
    }

    if (searchText && searchText.trim() !== "") {
        let key = searchText.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "*");

        filters.push(`name==*${key}*`);
    }

    return filters.join(";");
}
