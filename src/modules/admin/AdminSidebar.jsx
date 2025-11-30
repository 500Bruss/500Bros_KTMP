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
  { to: "/admin", label: "Dashboard", icon: FaHome },
  { to: "/admin/categories", label: "Danh mục", icon: FaTags },
  { to: "/admin/products", label: "Sản phẩm", icon: FaBoxOpen },
  { to: "/admin/addons", label: "Add-on", icon: FaPlug },
  { to: "/admin/applications", label: "Hồ sơ", icon: FaFileAlt },
  { to: "/admin/policies", label: "Hợp đồng", icon: FaShieldAlt },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-title">Bảo hiểm Admin</div>
        <div className="brand-subtitle">Quản trị bảo hiểm</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
