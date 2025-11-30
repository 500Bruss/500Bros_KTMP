import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminPolicies.css";

const STATUSES = ["ALL", "ACTIVE", "EXPIRED", "CANCELLED"];

export default function AdminPolicies() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const load = async () => {
    const res = await api.get("/api/policies", {
      params: { all: true, sort: "createdAt,desc" },
    });
    setItems(res.data.data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((p) => {
    const matchStatus = filters.status === "ALL" || p.status === filters.status;
    const matchSearch =
      !filters.search ||
      p.policyNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.productName?.toLowerCase().includes(filters.search.toLowerCase());

    const start = p.startDate ? new Date(p.startDate) : null;
    const fromOk = !filters.dateFrom || (start && start >= new Date(filters.dateFrom));
    const toOk = !filters.dateTo || (start && start <= new Date(filters.dateTo));

    return matchStatus && matchSearch && fromOk && toOk;
  });

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/policies/${id}/status/${status}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <AdminLayout title="Hợp đồng">
      <div className="admin-page policies-page">
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý hợp đồng</div>
            <span className="pill">Hiệu lực & trạng thái</span>
          </div>

          <div className="filter-bar">
            <div className="filter-item">
              <label>Tìm kiếm</label>
              <input
                placeholder="Policy/user/sản phẩm"
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
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Từ ngày</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>Đến ngày</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Policy No</th>
                <th>User</th>
                <th>Product</th>
                <th>Premium</th>
                <th>Trạng thái</th>
                <th>Hiệu lực</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.policyNumber}</td>
                  <td>{p.userName}</td>
                  <td>{p.productName}</td>
                  <td>{p.premiumTotal?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`status-chip ${
                        p.status === "ACTIVE"
                          ? "success"
                          : p.status === "EXPIRED"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.startDate} → {p.endDate}
                  </td>
                  <td>
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                      {STATUSES.filter((s) => s !== "ALL").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
