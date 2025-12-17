import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import AdminLayout from "./AdminLayout";
import "./AdminApplications.css";

const STATUSES = ["ALL", "SUBMITTED", "APPROVED", "CANCELLED"];

export default function AdminApplications() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    startDate: "",
    endDate: "",
  });

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    try {
      const res = await api.get("/api/applications", {
        params: {
          all: true,
          sort: "createdAt,desc",
        },
      });

      const items = res.data.data.items || [];
      const mapped = items.map((a) => ({
        ...a,
        status: a.status || "SUBMITTED",
      }));

      setItems(mapped);
    } catch (error) {
      console.error("Lỗi load dữ liệu:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Hàm reset bộ lọc
  const handleReset = () => {
    setFilters({ status: "ALL", search: "", startDate: "", endDate: "" });
    setPage(1);
  };

  // =====================
  // FILTERING
  // =====================
  const filtered = items.filter((a) => {
    const matchStatus =
      filters.status === "ALL" || a.status === filters.status;

    const matchSearch =
      !filters.search ||
      a.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(filters.search.toLowerCase());

    const created = a.createdAt ? new Date(a.createdAt) : null;
    const fromOk =
      !filters.startDate || (created && created >= new Date(filters.startDate));
    const toOk =
      !filters.endDate || (created && created <= new Date(filters.endDate));

    return matchStatus && matchSearch && fromOk && toOk;
  });

  // =====================
  // PAGINATION LOGIC
  // =====================
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/applications/${id}/status`, { status });
      await load();
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <AdminLayout title="Hồ sơ">
      <div className="admin-page applications-page">
        <div className="admin-card">
          <div className="page-header">
            <div className="page-title">Danh sách hồ sơ</div>
            <span className="pill">Luồng xét duyệt</span>
          </div>

          <div className="filter-bar">
            {/* [ĐỔI TÊN CLASS] apps-filter-wide */}
            <div className="filter-item apps-filter-wide">
              <label>Tìm kiếm</label>
              <input
                className="filter-input"
                placeholder="Tìm theo user hoặc sản phẩm..."
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
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div className="filter-item">
              <label>Đến ngày</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            {/* [ĐỔI TÊN CLASS] apps-reset-box & apps-reset-btn */}
            <div className="filter-item apps-reset-box">
              <label>&nbsp;</label>
              <button
                className="apps-reset-btn"
                onClick={handleReset}
                title="Đặt lại bộ lọc"
              >
                ↺
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã tạo</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}

              {paginated.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.userName}</td>
                  <td>{a.productName}</td>
                  <td>{a.totalPremium?.toLocaleString()}</td>

                  <td>
                    {/* [ĐỔI TÊN CLASS] apps-status-chip */}
                    <span
                      className={`apps-status-chip ${a.status === "APPROVED"
                          ? "approved"
                          : a.status === "CANCELLED" || a.status === "REJECTED"
                            ? "cancelled"
                            : "submitted"
                        }`}
                    >
                      {a.status === "CANCELLED" ? "REJECTED" : a.status}
                    </span>
                  </td>

                  <td>{a.createdAt}</td>

                  <td>
                    {/* [ĐỔI TÊN CLASS] apps-action-select */}
                    <select
                      className="apps-action-select"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
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

          {/* PAGINATION UI */}
          {/* [ĐỔI TÊN CLASS] apps-pagination-bar & apps-pagination-btn */}
          <div className="apps-pagination-bar">
            <button
              className="apps-pagination-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  className={`apps-pagination-btn ${page === pageNumber ? "active" : ""}`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              className="apps-pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}