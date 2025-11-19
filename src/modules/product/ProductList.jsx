import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../../api/product.api";
import "./ProductList.css";

export default function ProductList() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const id = parseInt(categoryId);
        if (!id || isNaN(id)) return; // tránh lỗi undefined

        load(id);
    }, [categoryId]);

    const load = async (id) => {
        try {
            const res = await productApi.getByCategory(id);
            setProducts(res.data.data.items || []);
        } catch (err) {
            console.log("Load products failed", err);
        }
    };

    return (
        <div className="product-container">

            {/* Sidebar Filter */}
            <aside className="filter-box">
                <h3 className="filter-title">Bộ lọc</h3>

                <div className="filter-group">
                    <label>Giá</label>
                    <select>
                        <option>Tất cả</option>
                        <option>Dưới 1 triệu</option>
                        <option>1 - 5 triệu</option>
                        <option>Trên 5 triệu</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sắp xếp</label>
                    <select>
                        <option>Mới nhất</option>
                        <option>Giá tăng dần</option>
                        <option>Giá giảm dần</option>
                    </select>
                </div>
            </aside>

            {/* Product List */}
            <main className="product-list">
                <h2 className="list-title">
                    Sản phẩm thuộc danh mục #{categoryId}
                </h2>

                {products.map((p) => (
                    <div key={p.id} className="product-row">
                        <div className="product-row-img"></div>

                        <div className="product-row-info">
                            <h3>{p.name}</h3>
                            <p>{p.description?.slice(0, 100) || "Không có mô tả"}...</p>

                            <button
                                className="btn-row"
                                onClick={() => navigate(`/Product-Detail/${p.id}`)}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <p className="empty">Không có sản phẩm trong danh mục này.</p>
                )}
            </main>
        </div>
    );
}
