import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import { productApi } from "../../api/product.api";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

export default function ProductList() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories", {
                params: { all: true, sort: "createdAt,desc" },
            });
            setCategories(res.data.data.items || []);
        } catch (err) {
            console.log("Load categories failed", err);
        }
    };

    const loadProducts = async () => {
        try {
            if (selectedCategory === "all") {
                const res = await api.get("/api/products", {
                    params: { all: true, sort: "createdAt,desc" },
                });
                setProducts(res.data.data.items || []);
                return;
            }

            const res = await productApi.getByCategory(selectedCategory);
            setProducts(res.data.data.items || []);
        } catch (err) {
            console.log("Load products failed", err);
        }
    };

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    return (
        <div className="product-container">

            {/* Sidebar Categories */}
            <aside className="filter-box">
                <h3 className="filter-title">Danh mục</h3>

                <div
                    className={`category-item ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                >
                    Tất cả sản phẩm
                </div>

                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`category-item ${selectedCategory == cat.id ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.name}
                    </div>
                ))}
            </aside>

            {/* Product List */}
            <main className="product-list">
                <h2 className="list-title">
                    {selectedCategory === "all"
                        ? "Tất cả sản phẩm"
                        : `Sản phẩm thuộc danh mục #${selectedCategory}`}
                </h2>

                <div className="product-grid">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="product-card"
                            onClick={() => navigate(`/Product-Detail/${p.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="product-img">🛡️</div>

                            <div className="product-name">{p.name}</div>

                            <div className="product-desc">
                                {p.description?.slice(0, 80) || "Không có mô tả"}
                            </div>

                            <button className="btn-row">
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <p className="empty">Không có sản phẩm trong danh mục này.</p>
                )}
            </main>

        </div>
    );
}
