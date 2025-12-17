import React, { useEffect, useState } from "react";
import { claimApi } from "../../api/claimApi";
import "./ClaimHistory.css";

// 1. HÀM DECODE JWT (Giữ nguyên)
function decodeJWT(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default function ClaimHistory() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(false);

    // 2. LẤY USER TỪ TOKEN
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const decoded = decodeJWT(token);
    const rawId = decoded?.id || decoded?.userId || decoded?.sub;
    const currentUserId = rawId;
    const currentRole = decoded?.role || "USER";

    // 3. GỌI API
    const fetchData = async () => {
        setLoading(true);
        try {
            let params = { page: 1, size: 100, sort: "createdAt,desc" };
            if (currentRole !== "ADMIN") {
                if (!currentUserId) { setClaims([]); setLoading(false); return; }
                params.filter = `user.id==${currentUserId}`;
            }
            const res = await claimApi.getClaims(params);
            const items = res?.data?.data?.items || [];
            setClaims(items);
        } catch (err) {
            console.error("Lỗi tải lịch sử:", err);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 4. HELPER FORMAT
    const renderDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";
    const renderDateTime = (d) => d ? new Date(d).toLocaleString("vi-VN") : "-";
    const formatCurrency = (val) => val ? Number(val).toLocaleString("vi-VN") + " đ" : "0 đ";

    // Style cho từng trạng thái
    const getStatusClass = (status) => {
        switch (status) {
            case "APPROVED": return "status-approved";
            case "PAID": return "status-paid";
            case "REJECTED": return "status-rejected";
            case "SUBMITTED": return "status-submitted";
            default: return "status-default";
        }
    };

    // 5. GIAO DIỆN
    return (
        <div className="claim-history-container">
            <h2>Lịch sử yêu cầu bồi thường</h2>

            {loading ? (
                <div style={{ textAlign: "center", marginTop: "20px", color: '#666' }}>Đang tải dữ liệu...</div>
            ) : (
                <div className="claim-history-table-wrapper">
                    <table className="claim-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Hợp đồng (Policy ID)</th>
                                <th>Ngày sự cố</th>
                                <th>Số tiền yêu cầu</th>
                                <th style={{ width: '25%' }}>Ghi chú / Lý do</th> {/* Cột này rộng hơn chút */}
                                <th>Trạng thái</th>
                                <th>Ngày gửi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#666" }}>Bạn chưa có yêu cầu nào.</td></tr>
                            ) : (
                                claims.map((c) => {
                                    const statusClass = getStatusClass(c.status);
                                    return (
                                        <tr key={c.id}>
                                            <td className="col-id"><b>{c.id}</b></td>
                                            <td className="col-policy">{c.policyId}</td>
                                            <td>{renderDate(c.incidentDate)}</td>
                                            <td className="col-money">{formatCurrency(c.amountClaimed)}</td>

                                            {/* Cột Ghi chú thông minh */}
                                            <td className="col-note" title={c.resolutionNote}>
                                                <div className="note-content">
                                                    {c.resolutionNote || "-"}
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`status-badge ${statusClass}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="col-date">{renderDateTime(c.reportedAt)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}