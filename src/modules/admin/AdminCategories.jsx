import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminCategories.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [showForm, setShowForm] = useState(false);

  // ==========================
  // LOAD CATEGORY
  // ==========================
  const load = async () => {
    const res = await api.get("/api/categories", {
      params: { all: true, sort: "createdAt,desc" },
    });

    const items = res.data.data.items || [];

    // Vì BE trả productStatus = null => FE fallback ACTIVE
    const mapped = items.map((c) => ({
      ...c,
      status: c.productStatus || "ACTIVE",
    }));

    setCategories(mapped);
  };

  useEffect(() => {
    load();
  }, []);

  // ==========================
  // CREATE
  // ==========================
  const createCategory = async () => {
    if (!form.code || !form.name) {
      alert("Nhập mã và tên danh mục");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/categories", form);
      setForm({ code: "", name: "", description: "" });
      await load();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Tạo danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // UPDATE STATUS
  // ==========================
  const toggleStatus = async (id, status) => {
    try {
      await api.get(`/api/categories/${id}/status/${status}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  // ==========================
  // FILTER
  // ==========================
  const filtered = categories.filter((c) => {
    const status = c.status || "ACTIVE";

    const matchStatus =
      filters.status === "all" || status === filters.status;

    const matchSearch =
      !filters.search ||
      c.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.code?.toLowerCase().includes(filters.search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout title="Danh mục">
      <div className="admin-page category-page">

        {/* HEADER */}
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý danh mục</div>
            <button className="primary-btn" onClick={() => setShowForm((p) => !p)}>
              {showForm ? "Ẩn form" : "+ Thêm danh mục"}
            </button>
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                placeholder="Tên hoặc mã"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <div className="filter-item">
              <label>Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">Tất cả</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="admin-card admin-form">
            <input
              placeholder="Mã (code)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            <input
              placeholder="Tên danh mục"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <button onClick={createCategory} disabled={loading}>
              {loading ? "Đang lưu..." : "Tạo mới"}
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>

                  <td>
                    <span
                      className={`status-chip ${c.status === "ACTIVE" ? "success" : "warning"
                        }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="action-cell">

                    {/* Nút ACTIVE */}
                    <button
                      className={`ghost-btn ${c.status === "ACTIVE" ? "btn-active-selected" : ""
                        }`}
                      onClick={() => toggleStatus(c.id, "ACTIVE")}
                    >
                      Active
                    </button>

                    {/* Nút INACTIVE */}
                    <button
                      className={`danger-btn ${c.status === "INACTIVE" ? "btn-inactive-selected" : ""
                        }`}
                      onClick={() => toggleStatus(c.id, "INACTIVE")}
                    >
                      Inactive
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
