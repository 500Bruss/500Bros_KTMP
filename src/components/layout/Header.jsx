import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import "./Header.css";
import { useAuth } from "../../modules/auth/context/AuthContext";

import { categoryApi } from "../../api/category.api";
import { productApi } from "../../api/product.api";

export default function Header() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const [categories, setCategories] = useState([]);
    const [productsByCat, setProductsByCat] = useState({});
    const [hoverCat, setHoverCat] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userHover, setUserHover] = useState(false);

    // -----------------------------
    // LOAD CATEGORIES (PUBLIC)
    // -----------------------------
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await categoryApi.getAll();
            const list = res.data.data.items || [];
            setCategories(list);

            // preload product for each category
            list.forEach(cat => loadProducts(cat.id));
        } catch (err) {
            console.error("Category load failed", err);
        }
    };

    const loadProducts = async (categoryId) => {
        try {
            const res = await productApi.getByCategory(categoryId);
            const list = res.data.data.items || [];

            setProductsByCat(prev => ({
                ...prev,
                [categoryId]: list,
            }));
        } catch (err) {
            console.error("Product load failed", err);
        }
    };

    const navigateCategory = (id) => {
        navigate(`/menu/${id}`);
    };

    return (
        <header className="header-container">

            {/* Logo */}
            <div className="header-left">
                <img
                    src="/Images/Logo.png"
                    className="header-logo"
                    onClick={() => navigate("/")}
                />
            </div>

            {/* Menu */}
            <nav className="header-menu">
                <button onClick={() => navigate("/")}>Trang chủ</button>

                {/* Dropdown Insurance */}
                <div
                    className="ins-menu-group"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button>Bảo hiểm ▾</button>

                    {showDropdown && (
                        <div className="ins-mega-menu">

                            {/* Left - categories */}
                            <div className="ins-mega-left">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`ins-mega-cat ${hoverCat === cat.id ? "active" : ""}`}
                                        onMouseEnter={() => setHoverCat(cat.id)}
                                        onClick={() => navigateCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>

                            {/* Right - products */}
                            <div className="ins-mega-right">
                                {(productsByCat[hoverCat] || []).slice(0, 6).map(p => (
                                    <div
                                        key={p.id}
                                        className="ins-mega-product"
                                        onClick={() => navigate(`/Product-Detail/${p.id}`)}
                                    >
                                        <div className="ins-mega-info">
                                            <h4>{p.name}</h4>
                                            <p>{p.description?.slice(0, 50)}...</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty */}
                                {productsByCat[hoverCat]?.length === 0 && (
                                    <div className="ins-mega-empty">Chưa có sản phẩm</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button>Tin tức</button>
                <button>Chi nhánh</button>
                <button>Về chúng tôi</button>

                {/* Admin menu */}
                {currentUser?.role === "admin" && (
                    <>
                        <button onClick={() => navigate("/claim-list")}>Quản lý bồi thường</button>
                        <button onClick={() => navigate("/seller-orders")}>Quản lý hợp đồng</button>
                        <button onClick={() => navigate("/manage-products")}>Quản lý bảo hiểm</button>
                    </>
                )}
            </nav>

            {/* User area */}
            <div
                className="header-user"
                onMouseEnter={() => setUserHover(true)}
                onMouseLeave={() => setUserHover(false)}
            >
                {currentUser ? (
                    <div className="user-area">
                        <FaUserCircle size={24} />
                        <span>{currentUser.fullname || currentUser.username}</span>

                        {userHover && (
                            <div className="ins-user-dropdown">
                                <button onClick={() => navigate("/order-history")}>Lịch sử bảo hiểm</button>
                                <button onClick={logout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link className="login-btn" to="/Login">Đăng nhập</Link>
                )}
            </div>

        </header>
    );
}
