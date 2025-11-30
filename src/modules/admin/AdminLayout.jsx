import React from "react";
import { useAuth } from "../auth/context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children, title }) {
  const { currentUser, logout } = useAuth();

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="topbar-eyebrow">Bảo hiểm Admin</p>
            <h1 className="admin-title">{title || "Bảng điều khiển"}</h1>
          </div>
          <div className="admin-actions">
            <div className="admin-user">
              <span className="user-name">
                {currentUser?.username || "Admin"}
              </span>
              <span className="user-role">
                {currentUser?.roles?.includes("ADMIN") ? "ADMIN" : "USER"}
              </span>
            </div>
            <button className="admin-logout" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="admin-body">{children}</div>
      </section>
    </div>
  );
}
