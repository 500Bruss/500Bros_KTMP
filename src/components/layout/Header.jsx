import React, { useState, useEffect } from "react";
// 1. [SỬA] Thêm useLocation vào đây
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../modules/auth/context/AuthContext";

import { productApi } from "../../api/product.api";
import { categoryApi } from "../../api/category.api";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  // 2. [SỬA] Khai báo location để biết đang đứng ở trang nào
  const location = useLocation();

  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userHover, setUserHover] = useState(false);
  const [menuData, setMenuData] = useState([]);

  // --- LOAD DATA MENU ---
  useEffect(() => {
    // 3. [QUAN TRỌNG NHẤT] CHẶN GỌI API NẾU ĐANG Ở TRANG LOGIN
    // Dòng này giúp phá vỡ vòng lặp vô tận
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    const fetchMenuData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getActive(),
          productApi.getAll({
            all: false,
            size: 100,
            sort: "createdAt,desc",
            filter: "status=='ACTIVE'"
          })
        ]);

        const categories = catRes.data?.data?.items || [];
        const products = prodRes.data?.data?.items || [];

        const groupedMenu = categories.map((cat) => ({
          ...cat,
          products: products.filter((p) =>
            p.categoryId === cat.id || p.category?.id === cat.id
          ),
        }));

        setMenuData(groupedMenu);
      } catch (err) {
        console.error("Lỗi tải menu header:", err);
      }
    };

    fetchMenuData();

    // 4. [SỬA] Thêm location.pathname vào đây để khi đổi trang nó tự chạy lại
  }, [location.pathname]);

  return (
    <header className="header-container">
      {/* --- LOGO --- */}
      <div className="header-left">
        <Link to="/">
          <img src="/Images/Logo.png" className="header-logo" alt="Logo" />
        </Link>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="header-menu">
        <button onClick={() => navigate("/")}>Trang chủ</button>

        {/* --- MENU BẢO HIỂM --- */}
        <div
          className="ins-menu-group"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button
            className="menu-btn-trigger"
            onClick={() => navigate("/productlist")}
          >
            Bảo hiểm <FaChevronDown size={12} style={{ marginLeft: 5 }} />
          </button>

          {showDropdown && (
            <div className="ins-mega-menu">
              {menuData.length === 0 ? (
                <div className="ins-mega-empty">Đang tải danh mục...</div>
              ) : (
                <div className="mega-menu-grid">
                  {menuData.map((cat) => (
                    <div key={cat.id} className="mega-column">
                      <h4
                        className="mega-cat-title"
                        onClick={() => navigate(`/menu/${cat.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {cat.name}
                      </h4>

                      <ul className="mega-prod-list">
                        {cat.products.length > 0 ? (
                          cat.products.slice(0, 5).map((prod) => (
                            <li
                              key={prod.id}
                              onClick={() => navigate(`/Product-Detail/${prod.id}`)}
                            >
                              <FaChevronRight size={10} color="#4e73df" />
                              <span>{prod.name}</span>
                            </li>
                          ))
                        ) : (
                          <li className="empty-prod">Đang cập nhật...</li>
                        )}
                        {cat.products.length > 5 && (
                          <li className="more-prod" onClick={() => navigate(`/menu/${cat.id}`)}>
                            Xem thêm...
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => navigate("/productlist")}>Sản phẩm</button>
        <button onClick={() => navigate("/about-us")}>Về chúng tôi</button>

        {currentUser?.roles?.includes("ADMIN") && (
          <div className="admin-quick-links">
            <button
              onClick={() => navigate("/admin")}
              style={{ color: "#d9534f", fontWeight: "bold" }}
            >
              Admin
            </button>
          </div>
        )}
      </nav>

      {/* --- USER AREA --- */}
      <div className="header-user">
        {currentUser ? (
          <div
            className="user-area"
            onMouseEnter={() => setUserHover(true)}
            onMouseLeave={() => setUserHover(false)}
          >
            <FaUserCircle size={28} color="#4e73df" />
            <span className="user-name">
              {currentUser.username || "Tài khoản"}
            </span>

            {userHover && (
              <div className="ins-user-dropdown">
                <div className="dropdown-arrow"></div>
                <button onClick={() => navigate("/order-history")}>
                  Lịch sử đơn hàng
                </button>
                <button onClick={() => navigate("/claim-history")}>
                  Yêu cầu bồi thường
                </button>
                <div className="divider"></div>
                <button onClick={logout} className="logout-btn">
                  Đăng xuất
                </button>
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