import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";

export default function PaymentResult() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(search), [search]);

  const [statusMessage, setStatusMessage] = useState("Đang xác nhận giao dịch...");
  const [loading, setLoading] = useState(true);

  const responseCode = query.get("vnp_ResponseCode");
  const success = responseCode === "00";

  useEffect(() => {
    if (!search) {
      setStatusMessage("Thiếu tham số phản hồi từ VNPay.");
      setLoading(false);
      return;
    }

    const forwardToBackend = async () => {
      try {
        const res = await api.get(`/api/payments/vnpay/return${search}`);
        const msg = res.data?.message || res.data?.data || "Đã tiếp nhận kết quả thanh toán.";
        setStatusMessage(msg);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Không xác nhận được giao dịch, vui lòng liên hệ hỗ trợ.";
        setStatusMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    forwardToBackend();
  }, [search]);

  const applicationId =
    localStorage.getItem("last_payment_application") || query.get("appId");

  return (
    <div className="payment-result-page">
      <div className={`result-card ${success ? "success" : "failed"}`}>
        <h2>{success ? "Thanh toán thành công" : "Thanh toán thất bại"}</h2>
        <p className="message">{statusMessage}</p>
        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
          {applicationId && (
            <button
              className="btn-secondary"
              onClick={() => navigate("/application/" + applicationId)}
            >
              Xem hồ sơ
            </button>
          )}
        </div>
        {loading && <p className="note">Đang đồng bộ trạng thái thanh toán...</p>}
      </div>
    </div>
  );
}
