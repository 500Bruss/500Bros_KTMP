// src/api/category.api.js
import api from "./axiosClient";

export const categoryApi = {
    getAll: () =>
        api.get("/api/categories", {
            params: {
                all: true,
                sort: "createdAt,asc"
            }
        }),
};
