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

    // =======================
    // LOAD CATEGORIES
    // =======================
    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories", {
                params: { all: true, sort: "createdAt,desc" },
            });

            const list = res.data.data.items || [];

            // BE trả category như:
            // { id, code, name, ... }
            setCategories(list);
        } catch (err) {
            console.log("Load categories failed", err);
        }
    };

    // =======================
    // LOAD PRODUCTS
    // =======================
    const loadProducts = async () => {
        try {
            if (selectedCategory === "all") {
                const res = await api.get("/api/products", {
                    params: { all: true, sort: "createdAt,desc" },
                });
                setProducts(res.data.data.items || []);
                return;
            }

            // lấy sản phẩm theo categoryId
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
        <div className="showcase-wrapper">

            {/* =================== SIDEBAR =================== */}
            <aside className="showcase-sidebar">
                <h3 className="sidebar-title">Danh mục</h3>

                <div
                    className={`sidebar-item ${selectedCategory === "all" ? "active" : ""
                        }`}
                    onClick={() => setSelectedCategory("all")}
                >
                    Tất cả sản phẩm
                </div>

                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`sidebar-item ${selectedCategory === String(cat.id) ? "active" : ""
                            }`}
                        onClick={() => setSelectedCategory(String(cat.id))}
                    >
                        {cat.name}
                    </div>
                ))}
            </aside>

            {/* =================== MAIN =================== */}
            <main className="showcase-main">
                <h2 className="main-title">
                    {selectedCategory === "all"
                        ? "Tất cả sản phẩm"
                        : ` ${categories.find((c) => String(c.id) === selectedCategory)?.name || ""}`}
                </h2>

                {/* =================== PRODUCT LIST =================== */}
                <div className="product-grid-new">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="product-card-new"
                            onClick={() => navigate(`/Product-Detail/${p.id}`)}
                        >
                            {/* ICON đại diện */}
                            <div className="product-thumb">🛡️</div>

                            {/* INFO */}
                            <div className="product-info">
                                <div className="product-title">{p.name}</div>

                                <div className="product-description">
                                    {p.description?.length > 80
                                        ? p.description.slice(0, 80) + "..."
                                        : p.description || "Không có mô tả"}
                                </div>
                            </div>

                            <button className="btn-detail">Xem chi tiết</button>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <p className="empty-text">Không có sản phẩm trong danh mục này.</p>
                )}
            </main>
        </div>
    );
}
