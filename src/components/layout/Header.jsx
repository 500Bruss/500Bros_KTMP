import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import "./Header.css";
import { useAuth } from "../../modules/auth/context/AuthContext";

export default function Header() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const [showDropdown, setShowDropdown] = useState(false);
    const [userHover, setUserHover] = useState(false);

    // 🔥 Không còn categories + products

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

                {/* Bạn muốn bỏ lọc theo thể loại → dropdown này giữ nút nhưng KHÔNG load dữ liệu */}
                <div
                    className="ins-menu-group"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button>Bảo hiểm ▾</button>

                    {showDropdown && (
                        <div className="ins-mega-menu">
                            <div className="ins-mega-empty">
                                Không có dữ liệu
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
            <div className="header-user">
                {currentUser ? (
                    <div
                        className="user-area"
                        onClick={() => setUserHover(prev => !prev)}
                        style={{ cursor: "pointer" }}
                    >
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
                    <Link className="login-btn" to="/login">Đăng nhập</Link>
                )}
            </div>

        </header>
    );
}
