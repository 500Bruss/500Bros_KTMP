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
  };

  useEffect(() => {
    load();
  }, []);

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
            <div className="filter-item wide">
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
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Premium</th>
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
                    <span
                      className={`status-chip ${a.status === "APPROVED"
                        ? "success"
                        : a.status === "SUBMITTED"
                          ? "warning"
                          : "danger"
                        }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td>{a.createdAt}</td>

                  <td>
                    <select
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
          <div className="pagination-bar">
            <button
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
                  className={page === pageNumber ? "active" : ""}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
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
