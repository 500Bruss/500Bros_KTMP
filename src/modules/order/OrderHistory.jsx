import React, { useEffect, useState } from "react";
import { policyApi } from "../../api/policyApi";
import "./OrderHistory.css"; // Đảm bảo import đúng file CSS vừa sửa

// 1. HÀM DECODE JWT
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

export default function PolicyList() {
    // State danh sách
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // --- STATE CHO MODAL CLAIM ---
    const [showModal, setShowModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [claimForm, setClaimForm] = useState({
        incidentDate: "",
        amountClaimed: "",
        resolutionNote: ""
    });
    const [errorMsg, setErrorMsg] = useState("");

    // Lấy thông tin User
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const decoded = decodeJWT(token);
    const rawId = decoded?.id || decoded?.userId || decoded?.sub;
    const currentUserId = rawId;
    const currentRole = decoded?.role || "USER";

    // --- GỌI API ---
    const fetchPolicies = async () => {
        setLoading(true);
        try {
            let params = { page, size, sort: "createdAt,desc", all: false };
            if (currentRole !== "ADMIN") {
                if (!currentUserId) { setPolicies([]); setLoading(false); return; }
                params.filter = `user.id==${currentUserId}`;
            }
            const res = await policyApi.getPolicies(params);
            const data = res?.data?.data || {};
            setPolicies(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            console.error("Lỗi:", e);
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPolicies(); }, [page]);

    // --- CÁC HÀM XỬ LÝ MODAL ---
    const handleOpenModal = (policy) => {
        setSelectedPolicy(policy);
        setClaimForm({
            incidentDate: new Date().toISOString().split("T")[0],
            amountClaimed: "",
            resolutionNote: ""
        });
        setErrorMsg("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPolicy(null);
    };

    // --- LOGIC GỬI YÊU CẦU ---
    const handleSubmitClaim = async () => {
        if (!claimForm.incidentDate || !claimForm.amountClaimed) {
            setErrorMsg("Vui lòng nhập đầy đủ ngày và số tiền.");
            return;
        }

        const amount = Number(claimForm.amountClaimed);
        const maxAmount = Number(selectedPolicy.premiumTotal) * 0.9;

        if (amount <= 0) {
            setErrorMsg("Số tiền phải lớn hơn 0.");
            return;
        }
        if (amount > maxAmount) {
            setErrorMsg(`Số tiền vượt quá giới hạn 90% (Tối đa: ${maxAmount.toLocaleString()} đ)`);
            return;
        }

        try {
            const requestData = {
                incidentDate: claimForm.incidentDate,
                amountClaimed: amount,
                resolutionNote: claimForm.resolutionNote,
                claimData: {
                    policyNumber: selectedPolicy.policyNumber,
                    description: "Yêu cầu từ Web App"
                }
            };

            await policyApi.createClaim(selectedPolicy.id, requestData);
            alert("Gửi yêu cầu bồi thường thành công!");
            handleCloseModal();
        } catch (error) {
            console.error("Lỗi gửi:", error);
            alert("Gửi thất bại. Vui lòng thử lại sau.");
        }
    };

    // --- FORMATTERS ---
    const renderDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";
    const renderDateTime = (d) => d ? new Date(d).toLocaleString("vi-VN") : "-";
    const formatCurrency = (val) => val ? Number(val).toLocaleString("vi-VN") + " đ" : "0 đ";

    return (
        // Dùng class mới: policy-history-container
        <div className="policy-history-container" style={{ padding: "20px", position: "relative" }}>
            <h2>{currentRole === "ADMIN" ? "Quản lý toàn bộ hợp đồng" : "Danh sách hợp đồng bảo hiểm của bạn"}</h2>

            {loading ? <div style={{ textAlign: "center" }}>Đang tải...</div> : policies.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}><h3>Hiện tại bạn chưa có hợp đồng nào.</h3></div>
            ) : (
                <>
                    {/* Dùng class mới: policy-table-wrapper */}
                    <div className="policy-table-wrapper">
                        {/* Dùng class mới: policy-list-table */}
                        <table className="policy-list-table">
                            <thead>
                                <tr>
                                    <th>Số hợp đồng</th>
                                    <th>Sản phẩm</th>
                                    <th>Ngày hiệu lực</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Phí bảo hiểm</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: "bold", color: "#2980b9" }}>{p.policyNumber}</td>
                                        <td>{p.productId}</td>
                                        <td>{renderDate(p.startDate)}</td>
                                        <td>{renderDate(p.endDate)}</td>
                                        <td style={{ fontWeight: "bold", color: "#d35400" }}>{formatCurrency(p.premiumTotal)}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "4px", fontSize: "12px",
                                                background: p.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                                color: p.status === 'ACTIVE' ? '#166534' : '#991b1b',
                                                fontWeight: 'bold'
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            {p.status === 'ACTIVE' ? (
                                                <button onClick={() => handleOpenModal(p)}>
                                                    Yêu cầu bồi thường
                                                </button>
                                            ) : p.status === 'EXPIRED' ? (
                                                <span style={{ color: "gray", fontStyle: "italic", fontSize: "13px" }}>
                                                    Đã hết hạn
                                                </span>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: "0.9em", color: "#666" }}>{renderDateTime(p.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Dùng class mới: policy-paging */}
                    {totalPages > 1 && (
                        <div className="policy-paging">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
                            <span style={{ margin: '0 10px', alignSelf: 'center' }}>{page} / {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                        </div>
                    )}
                </>
            )}

            {/* --- MODAL FORM ĐẸP (Giữ nguyên Inline Style cho Modal để tránh xung đột) --- */}
            {showModal && selectedPolicy && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '12px',
                        width: '500px', maxWidth: '95%',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.25rem' }}>Tạo yêu cầu bồi thường</h3>
                            <p style={{ margin: '5px 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                                Hợp đồng số: <strong style={{ color: '#2980b9' }}>{selectedPolicy.policyNumber}</strong>
                            </p>
                        </div>

                        {errorMsg && (
                            <div style={{
                                backgroundColor: '#fdecea', color: '#c0392b', padding: '10px',
                                borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #fadbd8'
                            }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#34495e' }}>
                                Ngày xảy ra sự cố <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="date"
                                style={{
                                    width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px',
                                    fontSize: '1rem', outline: 'none'
                                }}
                                value={claimForm.incidentDate}
                                onChange={(e) => setClaimForm({ ...claimForm, incidentDate: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#34495e' }}>
                                Số tiền yêu cầu (VNĐ) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Nhập số tiền..."
                                style={{
                                    width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px',
                                    fontSize: '1rem', outline: 'none'
                                }}
                                value={claimForm.amountClaimed}
                                onChange={(e) => {
                                    setClaimForm({ ...claimForm, amountClaimed: e.target.value });
                                    setErrorMsg("");
                                }}
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#7f8c8d' }}>
                                Tối đa cho phép (90%): <strong style={{ color: '#27ae60' }}>{(selectedPolicy.premiumTotal * 0.9).toLocaleString()} đ</strong>
                            </small>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#34495e' }}>
                                Ghi chú / Lý do:
                            </label>
                            <textarea
                                rows="4"
                                placeholder="Mô tả chi tiết về sự cố..."
                                style={{
                                    width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px',
                                    fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit'
                                }}
                                value={claimForm.resolutionNote}
                                onChange={(e) => setClaimForm({ ...claimForm, resolutionNote: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '10px 20px', border: '1px solid #bdc3c7', background: 'white',
                                    color: '#7f8c8d', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmitClaim}
                                style={{
                                    padding: '10px 25px', border: 'none', background: '#2980b9',
                                    color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                                    boxShadow: '0 2px 5px rgba(41, 128, 185, 0.3)'
                                }}
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}