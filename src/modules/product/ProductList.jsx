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
    const [searchText, setSearchText] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // LOAD CATEGORIES
    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories", {
                params: { all: true, sort: "createdAt,desc" },
            });
            setCategories(res.data.data.items || []);
        } catch (err) {
            console.error(err);
        }
    };

    // LOAD PRODUCTS (WITH PAGINATION)
    const loadProducts = async () => {
        try {
            let res;

            if (selectedCategory === "all") {
                res = await productApi.searchAll(searchText, page, 3);
            } else {
                res = await productApi.getByCategory(selectedCategory, searchText, page, 4);
            }

            const data = res.data.data;
            setProducts(data.items || []);
            setTotalPages(data.totalPages || 1);

        } catch (err) {
            console.error("Load products failed:", err);
        }
    };

    // Khi đổi danh mục → reset page
    useEffect(() => {
        setPage(1);
        loadProducts();
    }, [selectedCategory]);

    // Tìm kiếm → reset page
    useEffect(() => {
        setPage(1);
        loadProducts();
    }, [searchText]);

    // Đổi page
    useEffect(() => {
        loadProducts();
    }, [page]);

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    return (
        <div className="showcase-wrapper">

            {/* SIDEBAR */}
            <aside className="showcase-sidebar">

                {/* 🔍 SEARCH BOX */}
                <input
                    type="text"
                    className="sidebar-search"
                    placeholder=" Tìm sản phẩm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <h3 className="sidebar-title">Danh mục</h3>

                <div
                    className={`sidebar-item ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                >
                    Tất cả sản phẩm
                </div>

                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`sidebar-item ${selectedCategory === String(cat.id) ? "active" : ""}`}
                        onClick={() => setSelectedCategory(String(cat.id))}
                    >
                        {cat.name}
                    </div>
                ))}

            </aside>

            {/* MAIN CONTENT */}
            <main className="showcase-main">
                <h2 className="main-title">
                    {selectedCategory === "all"
                        ? "Tất cả sản phẩm"
                        : categories.find((c) => String(c.id) === selectedCategory)?.name}
                </h2>

                {/* PRODUCT GRID */}
                <div className="product-grid-new">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="product-card-new"
                            onClick={() => navigate(`/Product-Detail/${p.id}`)}
                        >
                            <div className="product-thumb">🛡️</div>

                            <div className="product-info">
                                <div className="product-title">{p.name}</div>
                                <div className="product-description">
                                    {p.description?.length > 80
                                        ? p.description.slice(0, 80) + "..."
                                        : p.description}
                                </div>
                            </div>

                            <button className="btn-detail">Xem chi tiết</button>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <p className="empty-text">Không có sản phẩm phù hợp.</p>
                )}

                {/* PAGINATION */}
                {/* PAGINATION */}
                <div className="pagination-wrapper">
                    <button
                        className={`pagination-btn ${page === 1 ? "disabled" : ""}`}
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        ◀
                    </button>

                    <span className="pagination-info">
                        {page} / {totalPages}
                    </span>

                    <button
                        className={`pagination-btn ${page === totalPages ? "disabled" : ""}`}
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        ▶
                    </button>
                </div>

            </main>
        </div>
    );
}
