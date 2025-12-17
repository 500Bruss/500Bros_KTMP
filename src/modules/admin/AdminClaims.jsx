import { useEffect, useState } from "react";
import { claimApi } from "../../api/claimApi";
import AdminLayout from "./AdminLayout";
import "./AdminClaims.css";

export default function AdminClaims() {
    const [claims, setClaims] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const fetchData = () => {
        claimApi.getClaims({ page: 1, size: 1000, sort: "createdAt,desc" })
            .then((res) => {
                const items = res.data?.data?.items || [];
                setClaims(items);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (id, status) => {
        // Hỏi xác nhận hành động cụ thể
        const actionName = status === "APPROVED" ? "DUYỆT" : status === "REJECTED" ? "TỪ CHỐI" : "THANH TOÁN";
        if (!window.confirm(`Bạn chắc chắn muốn ${actionName} yêu cầu này?`)) return;

        try {
            await claimApi.update(id, { status });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật!");
        }
    };

    // [MỚI] Hàm Reset bộ lọc
    const resetFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setFromDate("");
        setToDate("");
    };

    const filteredClaims = claims.filter((c) => {
        const uName = c.userName || "";
        const pId = c.policyId || "";
        const cId = c.id ? c.id.toString() : "";
        const searchKey = search.toLowerCase();

        if (search &&
            !uName.toLowerCase().includes(searchKey) &&
            !pId.toLowerCase().includes(searchKey) &&
            !cId.includes(searchKey)) return false;

        if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
        if (fromDate && new Date(c.incidentDate) < new Date(fromDate)) return false;
        if (toDate && new Date(c.incidentDate) > new Date(toDate)) return false;

        return true;
    });

    return (
        <AdminLayout title="Bồi thường">
            <div className="claims-filter-card">
                <h3 className="filter-title">Bộ lọc tìm kiếm</h3>
                <div className="filter-grid">
                    <input type="text" placeholder="Tìm theo user/policy..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-input" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="PAID">PAID</option>
                    </select>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="filter-input" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="filter-input" />

                    {/* [MỚI] Nút Reset */}
                    <button className="reset-btn" onClick={resetFilters} title="Làm mới bộ lọc">
                        ↺
                    </button>
                </div>
            </div>

            <div className="claims-table-card">
                <table className="claims-table">
                    <thead>
                        <tr>
                            <th>Mã bồi thường</th>
                            <th>Người dùng</th>
                            <th>Mã hợp đồng</th>
                            <th>Số tiền</th>
                            <th>Ngày sự cố</th>
                            <th>Lí do</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClaims.length === 0 && (
                            <tr><td colSpan="8" className="empty-row">Không tìm thấy dữ liệu</td></tr>
                        )}
                        {filteredClaims.map((c) => (
                            <tr key={c.id}>
                                <td><b>{c.id}</b></td>
                                <td>{c.userName}</td>
                                <td style={{ color: '#4e73df', fontWeight: 'bold' }}>{c.policyId}</td>
                                <td style={{ color: '#e74a3b', fontWeight: 'bold' }}>
                                    {c.amountClaimed ? Number(c.amountClaimed).toLocaleString('vi-VN') + ' đ' : '0 đ'}
                                </td>
                                <td>{new Date(c.incidentDate).toLocaleDateString('vi-VN')}</td>
                                <td>{c.resolutionNote}</td>
                                <td>
                                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                                </td>

                                <td>
                                    {c.status === "SUBMITTED" && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                className="btn-action btn-approve"
                                                onClick={() => handleUpdate(c.id, "APPROVED")}
                                                title="Duyệt"
                                            >
                                                Duyệt
                                            </button>
                                            <button
                                                className="btn-action btn-reject"
                                                onClick={() => handleUpdate(c.id, "REJECTED")}
                                                title="Từ chối"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    )}

                                    {c.status === "APPROVED" && (
                                        <button
                                            className="btn-action btn-pay"
                                            onClick={() => handleUpdate(c.id, "PAID")}
                                        >
                                            Chi trả
                                        </button>
                                    )}

                                    {(c.status === "REJECTED" || c.status === "PAID") && (
                                        <span style={{ color: '#999', fontStyle: 'italic' }}>Hoàn tất</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}