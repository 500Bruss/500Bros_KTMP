import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminAddons.css";

export default function AdminAddons() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [addons, setAddons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    metaData: "{}",
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [showForm, setShowForm] = useState(false);

  const loadProducts = async () => {
    const res = await api.get("/api/products", { params: { all: true } });
    setProducts(res.data.data.items || []);
  };

  const loadAddons = async (productId) => {
    if (!productId) {
      setAddons([]);
      return;
    }
    const res = await api.get(`/api/products/${productId}`);
    setAddons(res.data.data.addonsList || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadAddons(selectedProduct);
  }, [selectedProduct]);

  const filtered = addons.filter((a) => {
    const matchStatus = filters.status === "all" || a.status === filters.status;
    const matchSearch =
      !filters.search ||
      a.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.code?.toLowerCase().includes(filters.search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const createAddon = async () => {
    if (!selectedProduct) {
      alert("Chọn sản phẩm");
      return;
    }
    if (!form.code || !form.name || !form.price) {
      alert("Nhập code, tên, giá");
      return;
    }
    try {
      await api.post(`/api/addons/${selectedProduct}`, {
        code: form.code,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        metaData: form.metaData,
      });
      setForm({ code: "", name: "", description: "", price: "", metaData: "{}" });
      await loadAddons(selectedProduct);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Tạo addon thất bại");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.get(`/api/addons/${id}/status/${status}`);
      await loadAddons(selectedProduct);
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <AdminLayout title="Add-on">
      <div className="admin-page addons-page">
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý add-on</div>
            <button className="primary-btn" onClick={() => setShowForm((p) => !p)}>
              {showForm ? "Ẩn form" : "+ Thêm addon"}
            </button>
          </div>

          <div className="filter-bar">
            <div className="filter-item">
              <label>Chọn sản phẩm</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                placeholder="Tên hoặc code"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>Trạng thái</label>
              <select
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

        {showForm && (
          <div className="admin-card admin-form">
            <input
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Giá"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <textarea
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <textarea
              placeholder="Metadata (JSON)"
              value={form.metaData}
              onChange={(e) => setForm({ ...form, metaData: e.target.value })}
            />
            <button onClick={createAddon}>Thêm addon</button>
          </div>
        )}

        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.code}</td>
                  <td>{a.name}</td>
                  <td>{a.price?.toLocaleString()}</td>
                  <td>
                    <span className={`status-chip ${a.status === "ACTIVE" ? "success" : "warning"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="ghost-btn" onClick={() => updateStatus(a.id, "ACTIVE")}>
                      Active
                    </button>
                    <button className="danger-btn" onClick={() => updateStatus(a.id, "INACTIVE")}>
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
