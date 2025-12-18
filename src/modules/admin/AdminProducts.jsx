import React, { useEffect, useState } from "react";
import { productApi } from "../../api/product.api";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- FORM DATA ---
  const [form, setForm] = useState({
    name: "", categoryId: "", price: "", description: "",

    // Base Cover (Quyền lợi chính)
    bc_coverage: "",
    bc_limit: "",
    bc_details: "",

    // Metadata (Thông tin bổ sung - Style thẻ bài)
    md_duration: "",   // Thời hạn (Ví dụ: 1 Năm)
    md_type: "",       // Loại điều kiện (Ví dụ: Cao cấp / Cơ bản)
    md_value: ""       // Hạn mức bồi thường (Thay cho Hospital Limit)
  });

  const [filters, setFilters] = useState({ status: "all", category: "all", search: "" });

  // --- LOAD DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productApi.getAll({ all: true, sort: "createdAt,desc" }),
        api.get("/api/categories", { params: { all: true, sort: "createdAt,desc" } }),
      ]);

      const mappedProducts = (pRes.data?.data?.items || []).map((p) => ({
        ...p,
        status: p.status || "ACTIVE",
        categoryId: p.category?.id?.toString() || p.categoryId?.toString(),
      }));

      setProducts(mappedProducts);
      setCategories(cRes.data?.data?.items || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLERS FORM ---
  const handleOpenAdd = () => {
    setForm({
      name: "", categoryId: "", price: "", description: "",
      bc_coverage: "", bc_limit: 0, bc_details: "",
      // Mặc định
      md_duration: "1 Năm",
      md_type: "Tiêu chuẩn",
      md_value: "50,000,000"
    });
    setIsEditMode(false);
    setCurrentId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    // 1. Parse Base Cover
    let bc = {};
    try { bc = JSON.parse(product.baseCover || "{}"); } catch { }

    // 2. Parse Metadata
    let md = {};
    try { md = JSON.parse(product.metaData || "{}"); } catch { }

    setForm({
      name: product.name || "",
      categoryId: product.categoryId || "",
      price: product.price || 0,
      description: product.description || "",

      bc_coverage: bc.coverage || "",
      bc_limit: bc.limit || 0,
      bc_details: bc.details || "",

      // Map dữ liệu vào 3 ô thẻ bài
      md_duration: md.duration || "",
      md_type: md.condition_type || "",
      md_value: md.insurance_value || ""
    });

    setIsEditMode(true);
    setCurrentId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.price) {
      alert("Vui lòng nhập tên, danh mục và giá sản phẩm!");
      return;
    }

    setLoading(true);
    try {
      // 1. Đóng gói Base Cover
      const finalBaseCover = JSON.stringify({
        coverage: form.bc_coverage,
        limit: Number(form.bc_limit),
        details: form.bc_details
      });

      // 2. Đóng gói Metadata (Tự động gom 3 ô thẻ bài thành JSON)
      const finalMetaData = JSON.stringify({
        duration: form.md_duration,       // Thời hạn
        condition_type: form.md_type,     // Loại điều kiện
        insurance_value: form.md_value    // Giá trị bảo vệ
      });

      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        description: form.description || "",
        baseCover: finalBaseCover,
        metaData: finalMetaData,
        listAddOns: []
      };

      if (isEditMode) {
        await productApi.update(currentId, payload);
        alert("Cập nhật thành công!");
      } else {
        await productApi.create(payload);
        alert("Tạo mới thành công!");
      }

      setShowForm(false);
      loadData();
    } catch (err) {
      alert("Thao tác thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await productApi.updateStatus(product.id, newStatus);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch (err) { alert("Lỗi cập nhật trạng thái"); }
  };

  const filtered = products.filter((p) => {
    const searchKey = filters.search.toLowerCase();
    const matchSearch = !filters.search || p.name?.toLowerCase().includes(searchKey);
    const matchCat = filters.category === "all" || p.categoryId === filters.category;
    const matchStatus = filters.status === "all" || p.status === filters.status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <AdminLayout title="Sản phẩm">
      <div className="admin-page product-page">
        {/* HEADER & TABLE (Giữ nguyên) */}
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý sản phẩm</div>
            <button className="primary-btn" onClick={handleOpenAdd}>+ Thêm sản phẩm</button>
          </div>
          <div className="filter-bar">
            <div className="filter-item search-box">
              <label>Tìm kiếm</label>
              <input placeholder="Nhập tên..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div className="filter-item">
              <label>Danh mục</label>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="all">Tất cả</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Trạng thái</label>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">Tất cả</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                  <td>{categories.find(c => c.id.toString() === p.categoryId)?.name}</td>
                  <td style={{ color: '#e67e22', fontWeight: 'bold' }}>{Number(p.price).toLocaleString()} đ</td>
                  <td><span className={`status-chip ${p.status === "ACTIVE" ? "success" : "warning"}`}>{p.status}</span></td>
                  <td className="action-cell">
                    <button className="text-btn toggle-btn" onClick={() => handleToggleStatus(p)}>{p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}</button>
                    <button className="text-btn edit-btn" onClick={() => handleOpenEdit(p)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* POPUP MODAL FORM */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content admin-form-modal">
              <div className="modal-header">
                <h3>{isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
                <span className="close-btn" onClick={() => setShowForm(false)}>&times;</span>
              </div>

              <div className="modal-body">
                {/* 1. THÔNG TIN CHUNG */}
                <h4 className="section-title">Thông tin chung</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Tên sản phẩm </label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bảo hiểm xe máy" />
                  </div>
                  <div className="form-group">
                    <label>Danh mục </label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">-- Chọn --</option>
                      {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giá (VNĐ) </label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group full-width">
                    <label>Mô tả</label>
                    <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>

                <hr className="divider" />

                {/* 2. BASE COVER */}
                <h5 className="section-title">Quyền lợi cơ bản</h5>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Tên quyền lợi (Coverage)</label>
                    <input value={form.bc_coverage} onChange={(e) => setForm({ ...form, bc_coverage: e.target.value })} placeholder="VD: Bồi thường tai nạn" />
                  </div>
                  <div className="form-group">
                    <label>Hạn mức tối đa</label>
                    <input type="number" value={form.bc_limit} onChange={(e) => setForm({ ...form, bc_limit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú thêm</label>
                    <input value={form.bc_details} onChange={(e) => setForm({ ...form, bc_details: e.target.value })} placeholder="VD: Không áp dụng..." />
                  </div>
                </div>

                <hr className="divider" />
                <h4 className="section-title">Thông tin bổ sung</h4>

                {/* Container viền nhẹ để gom nhóm */}
                <div className="meta-standard-container">

                  {/* Dòng 1: Thời hạn */}
                  <div className="form-group">
                    <label>Thời hạn hiệu lực</label>
                    <select
                      value={form.md_duration}
                      onChange={(e) => setForm({ ...form, md_duration: e.target.value })}
                    >
                      <option value="">-- Chọn thời hạn --</option>
                      <option value="6 Tháng">6 Tháng</option>
                      <option value="1 Năm">1 Năm</option>
                      <option value="2 Năm">2 Năm</option>
                      <option value="Vĩnh viễn">Vĩnh viễn</option>
                    </select>
                  </div>

                  {/* Dòng 2: Loại điều kiện */}
                  <div className="form-group">
                    <label>Loại gói / Điều kiện</label>
                    <select
                      value={form.md_type}
                      onChange={(e) => setForm({ ...form, md_type: e.target.value })}
                    >
                      <option value="">-- Chọn loại --</option>
                      <option value="Cơ bản (Basic)">Cơ bản (Basic)</option>
                      <option value="Tiêu chuẩn (Standard)">Tiêu chuẩn (Standard)</option>
                      <option value="Cao cấp (Premium)">Cao cấp (Premium)</option>
                      <option value="Toàn diện (Comprehensive)">Toàn diện (Comprehensive)</option>
                    </select>
                  </div>

                  {/* Dòng 3: Hạn mức */}
                  <div className="form-group">
                    <label>Hạn mức bồi thường</label>
                    <select
                      value={form.md_value}
                      onChange={(e) => setForm({ ...form, md_value: e.target.value })}
                    >
                      <option value="">-- Chọn hạn mức --</option>
                      <option value="10,000,000">10,000,000 đ</option>
                      <option value="50,000,000">50,000,000 đ</option>
                      <option value="100,000,000">100,000,000 đ</option>
                      <option value="500,000,000">500,000,000 đ</option>
                      <option value="Không giới hạn">Không giới hạn</option>
                    </select>
                  </div>

                </div>

              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Hủy bỏ</button>
                <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Đang lưu..." : (isEditMode ? "Lưu thay đổi" : "Tạo mới")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}