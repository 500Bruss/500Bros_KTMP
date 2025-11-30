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

  return (
    <header className="header-container">
      <div className="header-left">
        <img
          src="/Images/Logo.png"
          className="header-logo"
          onClick={() => navigate("/")}
          alt="Logo"
        />
      </div>

      <nav className="header-menu">
        <button onClick={() => navigate("/")}>Trang chủ</button>

        <div
          className="ins-menu-group"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button>Bảo hiểm</button>
          {showDropdown && (
            <div className="ins-mega-menu">
              <div className="ins-mega-empty">Đang cập nhật</div>
            </div>
          )}
        </div>

        <button onClick={() => navigate("/productlist")}>Sản phẩm</button>
        <button>Về chúng tôi</button>

        {currentUser?.roles?.includes("ADMIN") && (
          <>
            <button onClick={() => navigate("/admin")}>Admin</button>
            <button onClick={() => navigate("/admin/categories")}>Danh mục</button>
            <button onClick={() => navigate("/admin/products")}>Sản phẩm</button>
            <button onClick={() => navigate("/admin/addons")}>Addons</button>
            <button onClick={() => navigate("/admin/applications")}>Hồ sơ</button>
            <button onClick={() => navigate("/admin/policies")}>Hợp đồng</button>
          </>
        )}
      </nav>

      <div className="header-user">
        {currentUser ? (
          <div
            className="user-area"
            onClick={() => setUserHover((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <FaUserCircle size={24} />
            <span>{currentUser.username || "Tài khoản"}</span>

            {userHover && (
              <div className="ins-user-dropdown">
                <button onClick={() => navigate("/order-history")}>
                  Lịch sử bảo hiểm
                </button>
                <button onClick={logout}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <Link className="login-btn" to="/login">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
