import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Header.css";

export default function Header({ currentUser, setCurrentUser }) {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (!currentUser) return;    // ← Chỉ load khi đã login
        loadCategories();
    }, [currentUser]);

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
        navigate("/");
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <img
                    src="/Images/Logo.png"
                    alt="Logo"
                    className="header-logo"
                    onClick={() => navigate("/")}
                />
            </div>

            <nav className="header-menu">
                <button onClick={() => navigate("/")}>Trang chủ</button>

                <div
                    className="menu-dropdown"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button>Bảo hiểm ▾</button>

                    {showDropdown && (
                        <div className="ins-mega-menu">
                            <div className="ins-mega-left">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`ins-mega-cat ${hoverCat === cat.id ? "active" : ""}`}
                                        onMouseEnter={() => setHoverCat(cat.id)}
                                        onClick={() => navigate(`/menu/${cat.id}`)}

                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>

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

                                {productsByCat[hoverCat]?.length === 0 && (
                                    <div className="ins-mega-empty">Chưa có sản phẩm</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={() => navigate("/")}>Tin tức</button>
                <button onClick={() => navigate("/")}>Chi nhánh</button>
                <button onClick={() => navigate("/")}>Về chúng tôi</button>

                {currentUser?.role === "admin" && (
                    <>
                        <button onClick={() => navigate("/claim-list")}>
                            Quản lý bồi thường
                        </button>
                        <button onClick={() => navigate("/seller-orders")}>
                            Quản lý hợp đồng
                        </button>
                        <button onClick={() => navigate("/manage-products")}>
                            Quản lí bảo hiểm
                        </button>
                    </>
                )}
            </nav>

            <div className="header-user">
                {currentUser ? (
                    <div
                        className="user-box"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <FaUserCircle size={24} />
                        <span>{currentUser.username}</span>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <button onClick={() => navigate("/order-history")}>
                                    Lịch sử bảo hiểm
                                </button>
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link className="login-btn" to="/Login">
                        Đăng nhập
                    </Link>
                )}
            </div>
        </header>
    );
}
