import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminAddons.css";

export default function AdminAddons() {
  const [products, setProducts] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    code: "", name: "", description: "", price: "", productId: "", status: "ACTIVE"
  });

  // [SỬA] State cho Metadata: Chỉ giữ Duration và Type
  const [metaFields, setMetaFields] = useState({
    duration: "",
    type: ""
  });

  const [filters, setFilters] = useState({
    search: "", status: "all", productId: "all",
  });

  // --- LOAD DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Lấy sản phẩm trước
      const resProducts = await api.get("/api/products", { params: { all: true } });
      const productList = resProducts.data.data.items || [];
      setProducts(productList);

      // 2. Lấy Addons (Tối ưu: Nếu không có API get all addons, ta phải chấp nhận loop)
      // Lưu ý: Nếu productList quá lớn (>50), cách này sẽ gây lag.
      const requests = productList.map(p =>
        api.get("/api/addons", { params: { productId: p.id } })
          .then(res => {
            const items = res.data.data.items || [];
            return items.map(a => ({ ...a, productName: p.name, productId: p.id }));
          })
          .catch(() => [])
      );

      const results = await Promise.all(requests);
      setAddons(results.flat());
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setForm({ code: "", name: "", description: "", price: "", productId: "", status: "ACTIVE" });
    // Mặc định chọn cái đầu tiên
    setMetaFields({ duration: "1 Năm", type: "Tiêu chuẩn" });
    setIsEditMode(false);
    setShowPopup(true);
  };

  const handleOpenEdit = (item) => {
    setForm({
      code: item.code, name: item.name, description: item.description || "",
      price: item.price, productId: item.productId, status: item.status
    });

    // Parse JSON từ server ra 2 ô Select
    let meta = {};
    try { meta = JSON.parse(item.metaData || "{}"); } catch (e) { }

    setMetaFields({
      duration: meta.duration || "1 Năm",
      type: meta.condition_type || "Tiêu chuẩn"
    });

    setIsEditMode(true);
    setCurrentId(item.id);
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    if (!form.productId) return alert("Vui lòng chọn Sản phẩm");
    if (!form.code || !form.name || !form.price) return alert("Vui lòng nhập đủ thông tin");

    try {
      // Đóng gói 2 trường Select thành JSON
      const finalMetaData = JSON.stringify({
        duration: metaFields.duration,
        condition_type: metaFields.type
      });

      const payload = {
        code: form.code, name: form.name, description: form.description,
        price: Number(form.price),
        metaData: finalMetaData,
        status: form.status
      };

      if (isEditMode) {
        await api.put(`/api/addons/${currentId}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await api.post(`/api/addons/${form.productId}`, payload);
        alert("Thêm mới thành công!");
      }
      setShowPopup(false);
      loadData();
    } catch (err) {
      alert("Thao tác thất bại!");
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.get(`/api/addons/${item.id}/status/${newStatus}`);
      setAddons(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
    } catch (err) { alert("Lỗi cập nhật trạng thái"); }
  };

  const filtered = addons.filter((a) => {
    const s = filters.search.toLowerCase();
    const matchSearch = !s || a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s);
    const matchStatus = filters.status === "all" || a.status === filters.status;
    const matchProduct = filters.productId === "all" || a.productId == filters.productId;
    return matchSearch && matchStatus && matchProduct;
  });

  return (
    <AdminLayout title="Quản lý Add-ons">
      <div className="admin-page addons-page">
        {/* HEADER */}
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Danh sách gói bổ trợ (Add-ons)</div>
            <button className="primary-btn" onClick={handleOpenAdd}>+ Thêm Addon</button>
          </div>
          <div className="filter-bar">
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input placeholder="Tên hoặc mã..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div className="filter-item">
              <label>Lọc theo Sản phẩm</label>
              <select value={filters.productId} onChange={(e) => setFilters({ ...filters, productId: e.target.value })}>
                <option value="all">-- Tất cả sản phẩm --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Trạng thái</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">Tất cả</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-card table-card">
          {loading ? <p style={{ padding: 20, textAlign: 'center' }}>Đang tải dữ liệu...</p> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th><th>Tên gói</th><th>Thuộc Sản phẩm</th><th>Giá tiền</th><th>Mô tả</th><th>Trạng thái</th><th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><span className="code-badge">{item.code}</span></td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ color: '#4e73df' }}>{item.productName}</td>
                    <td style={{ fontWeight: 'bold', color: '#e67e22' }}>{item.price?.toLocaleString('vi-VN')} đ</td>
                    <td className="desc-cell">{item.description}</td>
                    <td><span className={`status-chip ${item.status === "ACTIVE" ? "success" : "warning"}`}>{item.status}</span></td>
                    <td className="action-cell">
                      <button className="text-btn toggle-btn" onClick={() => handleToggleStatus(item)}>{item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}</button>
                      <button className="text-btn edit-btn" onClick={() => handleOpenEdit(item)}>Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* --- POPUP FORM --- */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>{isEditMode ? "Cập nhật Addon" : "Thêm Addon mới"}</h3>

              <label>Thuộc sản phẩm</label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                disabled={isEditMode}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label>Mã (Code) *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: ADD_01" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                </div>
              </div>

              <label>Tên gói *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <label>Mô tả</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              {/* [ĐÚNG Ý BẠN] Metadata: 2 ô Select (Thời hạn & Loại) */}
              <label style={{ marginTop: 15, display: 'block', fontWeight: 'bold', color: '#2c3e50' }}>Thông tin bổ sung</label>

              <div className="meta-grid-two">

                {/* Ô 1: Thời hạn */}
                <div className="meta-card">
                  <span className="meta-label">Thời hạn hiệu lực</span>
                  <select
                    className="meta-select"
                    value={metaFields.duration}
                    onChange={(e) => setMetaFields({ ...metaFields, duration: e.target.value })}
                  >
                    <option value="6 Tháng">6 Tháng</option>
                    <option value="1 Năm">1 Năm</option>
                    <option value="2 Năm">2 Năm</option>
                    <option value="3 Năm">3 Năm</option>
                    <option value="Vĩnh viễn">Vĩnh viễn</option>
                  </select>
                </div>

                {/* Ô 2: Loại */}
                <div className="meta-card">
                  <span className="meta-label">Loại điều kiện</span>
                  <select
                    className="meta-select"
                    value={metaFields.type}
                    onChange={(e) => setMetaFields({ ...metaFields, type: e.target.value })}
                  >
                    <option value="Tiêu chuẩn">Tiêu chuẩn (Standard)</option>
                    <option value="Cơ bản">Cơ bản (Basic)</option>
                    <option value="Cao cấp">Cao cấp (Premium)</option>
                    <option value="Toàn diện">Toàn diện (Comprehensive)</option>
                  </select>
                </div>

              </div>

              <div className="popup-actions">
                <button className="ghost-btn" onClick={() => setShowPopup(false)}>Hủy</button>
                <button className="primary-btn" onClick={handleSubmit}>
                  {isEditMode ? "Lưu cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}