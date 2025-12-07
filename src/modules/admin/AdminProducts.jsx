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
  const [showForm, setShowForm] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
    priceRange: "all",
  });

  // ======================
  // LOAD DATA
  // ======================
  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      api.get("/api/products", { params: { all: true, sort: "createdAt,desc" } }),
      api.get("/api/categories", { params: { all: true, sort: "createdAt,desc" } }),
    ]);

    const mappedProducts = (pRes.data.data.items || []).map((p) => ({
      ...p,
      status: p.status || "ACTIVE",
      categoryId: p.categoryId?.toString(),
    }));

    setProducts(mappedProducts);
    setCategories(cRes.data.data.items || []);
  };

  useEffect(() => { load(); }, []);

  // ======================
  // FILTER DATA
  // ======================
  const filtered = products.filter((p) => {
    const price = Number(p.price || 0);

    // Search
    const matchSearch =
      !filters.search ||
      p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description?.toLowerCase().includes(filters.search.toLowerCase());

    // Category
    const matchCat =
      filters.category === "all" || p.categoryId === filters.category;

    // Status
    const matchStatus =
      filters.status === "all" || p.status === filters.status;

    // Price range
    let matchPrice = true;
    switch (filters.priceRange) {
      case "<1m": matchPrice = price < 1_000_000; break;
      case "1-5m": matchPrice = price >= 1_000_000 && price <= 5_000_000; break;
      case "5-10m": matchPrice = price >= 5_000_000 && price <= 10_000_000; break;
      case ">10m": matchPrice = price > 10_000_000; break;
      default: matchPrice = true;
    }

    return matchSearch && matchCat && matchStatus && matchPrice;
  });

  // ======================
  // CREATE PRODUCT
  // ======================
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

  // ======================
  // RENDER
  // ======================
  return (
    <AdminLayout title="Sản phẩm">
      <div className="admin-page product-page">

        {/* HEADER + FILTER */}
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý sản phẩm</div>
            <button className="primary-btn" onClick={() => setShowForm((p) => !p)}>
              {showForm ? "Ẩn form" : "+ Thêm sản phẩm"}
            </button>
          </div>

          <div className="filter-bar">

            {/* SEARCH */}
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                placeholder="Tên hoặc mô tả"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            {/* CATEGORY */}
            <div className="filter-item">
              <label>Danh mục</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="all">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
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

            {/* PRICE RANGE */}
            <div className="filter-item">
              <label>Khoảng giá</label>
              <select
                value={filters.priceRange}
                onChange={(e) =>
                  setFilters({ ...filters, priceRange: e.target.value })
                }
              >
                <option value="all">Tất cả</option>
                <option value="<1m">Dưới 1 triệu</option>
                <option value="1-5m">1 – 5 triệu</option>
                <option value="5-10m">5 – 10 triệu</option>
                <option value=">10m">Trên 10 triệu</option>
              </select>
            </div>

          </div>
        </div>

        {/* FORM */}
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
                <option key={c.id} value={c.id.toString()}>
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

        {/* TABLE */}
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
                      className={`status-chip ${p.status === "ACTIVE" ? "success" : "warning"
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

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 16 }}>
                    Không có sản phẩm nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
