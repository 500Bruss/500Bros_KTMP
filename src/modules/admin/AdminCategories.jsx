import React, { useEffect, useState } from "react";
import { categoryApi } from "../../api/category.api"; // Sử dụng API chuẩn
import AdminLayout from "./AdminLayout";
import "./AdminCategories.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State <button className="text-btn delete-btn" onClick={() => handleDelete(c.id)}>Xóa</button>
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form Data
  const [form, setForm] = useState({
    code: "", name: "", description: "", status: "ACTIVE", metaData: "{}"
  });

  // Filter State
  const [filters, setFilters] = useState({ status: "all", search: "" });

  // --- LOAD DATA ---
  const load = async () => {
    setLoading(true);
    try {
      // Dùng categoryApi.getAll() thay vì gọi trực tiếp axios
      const res = await categoryApi.getAll();
      const items = res.data?.data?.items || [];
      const mapped = items.map((c) => ({
        ...c,
        status: c.status || "ACTIVE",
      }));
      setCategories(mapped);
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // --- HANDLERS FORM ---
  const handleOpenAdd = () => {
    setForm({ code: "", name: "", description: "", status: "ACTIVE", metaData: "{}" });
    setIsEditMode(false);
    setCurrentId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (c) => {
    setForm({
      code: c.code || "",
      name: c.name || "",
      description: c.description || "",
      status: c.status || "ACTIVE",
      metaData: c.metaData || "{}",
    });
    setIsEditMode(true);
    setCurrentId(c.id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditMode(false);
    setCurrentId(null);
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!form.code || !form.name) {
      alert("Vui lòng nhập Mã và Tên danh mục!");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, status: form.status };

      if (isEditMode) {
        // Dùng categoryApi.update
        await categoryApi.update(currentId, payload);
        alert("Cập nhật thành công!");
      } else {
        // Dùng categoryApi.create
        await categoryApi.create(payload);
        alert("Tạo mới thành công!");
      }
      handleCloseForm();
      load();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Thao tác thất bại! Có thể mã code đã tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
    try {
      // Dùng categoryApi.delete
      await categoryApi.delete(id);
      alert("Đã xóa!");
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại!");
    }
  };

  // --- TOGGLE STATUS ---
  const toggleStatus = async (category) => {
    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      // Dùng categoryApi.update
      await categoryApi.update(category.id, {
        ...category,
        status: newStatus
      });

      // Update UI ngay lập tức
      setCategories(prev =>
        prev.map(c => c.id === category.id ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      console.error(err);
      alert("Đổi trạng thái thất bại");
      load();
    }
  };

  // --- FILTER ---
  const filtered = categories.filter((c) => {
    const status = c.status || "ACTIVE";
    const matchStatus = filters.status === "all" || status === filters.status;
    const searchKey = filters.search.toLowerCase();
    const matchSearch =
      !filters.search ||
      c.name?.toLowerCase().includes(searchKey) ||
      c.code?.toLowerCase().includes(searchKey);

    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout title="Danh mục">
      <div className="admin-page category-page">
        {/* HEADER */}
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý danh mục</div>
            <button className="primary-btn" onClick={handleOpenAdd}>+ Thêm danh mục</button>
          </div>
          {/* FILTER */}
          <div className="filter-bar">
            <div className="filter-item wide-search">
              <label>Tìm kiếm</label>
              <input
                className="filter-input"
                placeholder="Tên hoặc mã..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>Trạng thái</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center", padding: 20 }}>Không có dữ liệu</td></tr>}
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontWeight: 'bold', color: '#2980b9' }}>{c.code}</td>
                  <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                  <td>{c.description}</td>
                  <td>
                    <span className={`status-chip ${c.status === "ACTIVE" ? "success" : "warning"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="text-btn toggle-btn"
                      onClick={() => toggleStatus(c)}
                      style={{ color: c.status === "ACTIVE" ? '#e67e22' : '#27ae60' }}
                    >
                      {c.status === "ACTIVE" ? "Inactive" : "Active"}
                    </button>
                    <button className="text-btn edit-btn" onClick={() => handleOpenEdit(c)}>Sửa</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content admin-form-modal">
              <div className="modal-header">
                <h3>{isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
                <button className="close-btn" onClick={handleCloseForm}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mã danh mục (Code) *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="VD: CAR"
                    disabled={isEditMode}
                  />
                </div>
                <div className="form-group">
                  <label>Tên danh mục *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Bảo hiểm Xe"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseForm}>Hủy bỏ</button>
                <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}