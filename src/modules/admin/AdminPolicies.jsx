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

  // [MỚI] Hàm reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      status: "ALL",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const load = async () => {
    try {
      const res = await api.get("/api/policies", {
        params: { all: true, sort: "createdAt,desc" },
      });
      const items = res.data.data.items || [];
      const mapped = items.map((p) => ({
        ...p,
        status: p.status || "ACTIVE",
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((p) => {
    const matchStatus =
      filters.status === "ALL" || p.status === filters.status;

    const matchSearch =
      !filters.search ||
      p.policyNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.productName?.toLowerCase().includes(filters.search.toLowerCase());

    const start = p.startDate ? new Date(p.startDate) : null;
    const fromOk =
      !filters.dateFrom || (start && start >= new Date(filters.dateFrom));
    const toOk =
      !filters.dateTo || (start && start <= new Date(filters.dateTo));

    return matchStatus && matchSearch && fromOk && toOk;
  });

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Xác nhận đổi trạng thái sang ${status}?`)) return;
    try {
      // Lưu ý: Đảm bảo backend có endpoint PUT này
      await api.put(`/api/policies/${id}/status/${status}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  // Helper format
  const formatMoney = (v) => v ? Number(v).toLocaleString('vi-VN') + ' đ' : '0 đ';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';

  return (
    <AdminLayout title="Hợp đồng">
      <div className="admin-page policies-page">
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Quản lý hợp đồng</div>
            <span className="pill">Hiệu lực & trạng thái</span>
          </div>

          <div className="filter-bar">
            <div className="filter-item wide-search">
              <label>Tìm kiếm</label>
              <input
                className="filter-input"
                placeholder="Policy No, User, Sản phẩm..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <div className="filter-item">
              <label>Trạng thái</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
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
                className="filter-input"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>

            <div className="filter-item">
              <label>Đến ngày</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>

            {/* [MỚI] Nút Reset */}
            <div className="filter-item reset-box">
              <label>&nbsp;</label>
              <button
                className="reset-btn"
                onClick={handleResetFilters}
                title="Xóa bộ lọc"
              >
                ↺
              </button>
            </div>
          </div>
        </div>

        <div className="admin-card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Số Policy</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Phí BH</th>
                <th>Trạng thái</th>
                <th>Thời hạn</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 20, color: '#888' }}>
                    Không tìm thấy hợp đồng nào
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: 'bold', color: '#2980b9' }}>{p.policyNumber}</td>
                  <td>{p.userName || p.userId}</td>
                  <td>{p.productName || p.productId}</td>
                  <td style={{ fontWeight: 'bold', color: '#d35400' }}>{formatMoney(p.premiumTotal)}</td>

                  <td>
                    <span
                      className={`status-chip ${p.status === "ACTIVE"
                        ? "success"
                        : p.status === "EXPIRED"
                          ? "danger"
                          : "warning"
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.85rem', color: '#555' }}>
                    {p.startDate} → {p.endDate}
                  </td>

                  <td>
                    <select
                      className="action-select" // Class style đẹp
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value)}
                      style={{
                        borderColor: p.status === 'ACTIVE' ? '#27ae60' :
                          p.status === 'EXPIRED' ? '#e74a3b' : '#f39c12'
                      }}
                    >
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