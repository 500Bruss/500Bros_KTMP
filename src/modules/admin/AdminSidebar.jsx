import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaTags,
  FaBoxOpen,
  FaPlug,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";

const NAV_ITEMS = [
  // [QUAN TRỌNG] Thêm end: true cho Dashboard
  { to: "/admin", label: "Dashboard", icon: FaHome, end: true },
  { to: "/admin/categories", label: "Danh mục", icon: FaTags },
  { to: "/admin/products", label: "Sản phẩm", icon: FaBoxOpen },
  { to: "/admin/addons", label: "Add-on", icon: FaPlug },
  { to: "/admin/applications", label: "Hồ sơ", icon: FaFileAlt },
  { to: "/admin/policies", label: "Hợp đồng", icon: FaShieldAlt },
  { to: "/admin/claims", label: "Bồi thường", icon: FaShieldAlt }, // Bạn đang dùng icon giống Hợp đồng, có thể đổi sang FaMoneyBillWave hoặc FaHandHoldingUsd nếu thích
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-title">Bảo hiểm Admin</div>
        <div className="brand-subtitle">Quản trị bảo hiểm</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end} // [QUAN TRỌNG] Truyền thuộc tính end vào đây
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}