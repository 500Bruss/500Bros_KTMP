import api from "./axiosClient";

export const addonApi = {
    getByProduct: (productId) =>
        api.get("/api/addons", {
            params: {
                all: true,
                filter: `product.id==${productId}`,
                sort: "createdAt,asc",
            },
        }),
};
