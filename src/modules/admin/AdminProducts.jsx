import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    description: "",
    baseCover: "{}",
    metaData: "{}",
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      api.get("/api/products", { params: { all: true, sort: "createdAt,desc" } }),
      api.get("/api/categories", { params: { all: true, sort: "createdAt,desc" } }),
    ]);
    setProducts(pRes.data.data.items || []);
    setCategories(cRes.data.data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchStatus = filters.status === "all" || p.status === filters.status;
    const matchCat =
      filters.category === "all" || p.categoryId?.toString() === filters.category;
    const matchSearch =
      !filters.search ||
      p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description?.toLowerCase().includes(filters.search.toLowerCase());
    const priceNum = Number(p.price || 0);
    const matchMin = !filters.minPrice || priceNum >= Number(filters.minPrice);
    const matchMax = !filters.maxPrice || priceNum <= Number(filters.maxPrice);
    return matchStatus && matchCat && matchSearch && matchMin && matchMax;
  });

  const createProduct = async () => {
    if (!form.name || !form.categoryId || !form.price) {
      alert("Nhập đầy đủ tên, danh mục, giá");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/products", {
        name: form.name,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        description: form.description,
        baseCover: form.baseCover,
        metaData: form.metaData,
      });
      setForm({
        name: "",
        categoryId: "",
        price: "",
        description: "",
        baseCover: "{}",
        metaData: "{}",
      });
      await load();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Tạo sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Sản phẩm">
      <div className="admin-page product-page">
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý sản phẩm</div>
            <button className="primary-btn" onClick={() => setShowForm((p) => !p)}>
              {showForm ? "Ẩn form" : "+ Thêm sản phẩm"}
            </button>
          </div>

          <div className="filter-bar">
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                placeholder="Tên hoặc mô tả"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>Danh mục</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="all">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
            <div className="filter-item">
              <label>Giá từ</label>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>Giá đến</label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="admin-card admin-form">
            <input
              placeholder="Tên sản phẩm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              placeholder="Base cover (JSON)"
              value={form.baseCover}
              onChange={(e) => setForm({ ...form, baseCover: e.target.value })}
            />
            <textarea
              placeholder="Metadata (JSON)"
              value={form.metaData}
              onChange={(e) => setForm({ ...form, metaData: e.target.value })}
            />
            <button onClick={createProduct} disabled={loading}>
              {loading ? "Đang lưu..." : "Tạo sản phẩm"}
            </button>
          </div>
        )}

        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hiển thị</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.categoryId}</td>
                  <td>{p.price?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`status-chip ${
                        p.status === "ACTIVE" ? "success" : "warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.visible ? "Yes" : "No"}</td>
                  <td className="action-cell">
                    <button className="ghost-btn">Sửa</button>
                    <button className="danger-btn">Xóa</button>
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
