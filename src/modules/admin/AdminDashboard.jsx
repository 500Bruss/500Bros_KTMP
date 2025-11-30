import React from "react";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaTags,
  FaBoxOpen,
  FaPlug,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";

const FEATURE_CARDS = [
  {
    icon: FaTags,
    title: "Danh mục",
    desc: "Cấu trúc taxonomy, bật/tắt hiển thị sản phẩm theo nhóm.",
    to: "/admin/categories",
    accent: "blue",
  },
  {
    icon: FaBoxOpen,
    title: "Sản phẩm",
    desc: "Quản lý thông tin, giá và metadata bảo hiểm.",
    to: "/admin/products",
    accent: "orange",
  },
  {
    icon: FaPlug,
    title: "Add-on",
    desc: "Bổ sung quyền lợi, bán chéo gói mở rộng.",
    to: "/admin/addons",
    accent: "purple",
  },
  {
    icon: FaFileAlt,
    title: "Hồ sơ",
    desc: "Duyệt và thay đổi trạng thái hồ sơ người dùng.",
    to: "/admin/applications",
    accent: "teal",
  },
  {
    icon: FaShieldAlt,
    title: "Hợp đồng",
    desc: "Cập nhật hiệu lực và kiểm soát chu kỳ hợp đồng.",
    to: "/admin/policies",
    accent: "green",
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Bảng điều khiển">
      <div className="admin-page dashboard-page">
        <div className="page-header dashboard-header">
          <div className="dashboard-title">
            <div className="icon-pill">
              <FaRocket />
            </div>
            <div>
              <p className="eyebrow">Giao diện kiểu CNPM</p>
              <h2>Quản trị bảo hiểm</h2>
              <p className="muted">
                Giữ nguyên logic backend, làm mới trải nghiệm quản trị theo layout
                CNPM.
              </p>
            </div>
          </div>
          <Link className="primary-btn" to="/admin/applications">
            Xem hồ sơ
          </Link>
        </div>

        <div className="stat-grid">
          {FEATURE_CARDS.map(({ icon: Icon, title, desc, to, accent }) => (
            <Link key={title} to={to} className={`stat-card accent-${accent}`}>
              <div className="stat-icon">
                <Icon />
              </div>
              <div className="stat-content">
                <p className="stat-label">{title}</p>
                <p className="stat-desc">{desc}</p>
                <span className="pill">Đi tới</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="admin-card quick-links">
          <div className="page-header">
            <div className="page-title">Lối tắt thao tác</div>
            <span className="pill">Luồng quản lý</span>
          </div>
          <div className="link-grid">
            <Link to="/admin/categories">Thiết lập danh mục</Link>
            <Link to="/admin/products">Thêm sản phẩm mới</Link>
            <Link to="/admin/addons">Tạo add-on</Link>
            <Link to="/admin/applications">Duyệt hồ sơ</Link>
            <Link to="/admin/policies">Điều chỉnh hợp đồng</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
