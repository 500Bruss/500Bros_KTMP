// src/api/product.api.js getByCategory: (catId) =>
// api.get(`/api/products?all=true&filter=category.id==${catId}`),


import api from "./axiosClient";

export const productApi = {
    getByCategory: (categoryId) =>
        api.get("/api/products", {
            params: {
                all: true,
                filter: `category.id==${categoryId}`,
                sort: "createdAt,desc",
            },
        }),
};