import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryApi } from "../../api/category.api";
import "./Home.css";
import Banner from "../../components/layout/Banner";

export default function Home() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            // 2. Gọi hàm mới getActive() thay vì gọi api.get thủ công
            const res = await categoryApi.getActive();

            setCategories(res.data.data.items || []);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="home-container">
            <Banner images={["/Images/1.jpg", "/Images/2.jpg"]} />

            <section className="category-section">
                <h2 className="section-title">Danh mục bảo hiểm phổ biến</h2>

                <div className="category-grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="category-card shadow-soft"
                        >
                            <img src="/Images/Logo.png" className="category-img" />

                            <div className="card-content">
                                <h3>{cat.name}</h3>
                                <p>{cat.description || "Không có mô tả"}</p>

                                <button
                                    className="btn-detail"
                                    onClick={() => navigate(`/menu/${cat.id}`)}
                                >
                                    Xem chi tiết
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
