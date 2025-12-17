import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Import Icon (Cần cài: npm install react-icons)
import { FaArrowLeft, FaCreditCard, FaFileInvoiceDollar, FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";
import { applicationApi } from "../../api/application.api";
import { paymentApi } from "../../api/payment.api";
import { useAuth } from "../auth/hook/useAuth";

// Import CSS Mới
import "./PaymentPage.css";

const formatVnd = (value) =>
  Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setLoading(true);
    applicationApi
      .getById(applicationId)
      .then((res) => setApplication(res.data.data))
      .catch(() => setError("Không tải được hồ sơ, vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, [applicationId, currentUser, navigate]);

  const isPayable = useMemo(
    () => application?.status === "SUBMITTED",
    [application?.status]
  );

  const startPayment = async () => {
    if (!application) return;
    setError("");
    setPaying(true);
    try {
      const res = await paymentApi.create(application.id, "VNPAY");
      const url = res.data?.data?.paymentUrl;

      if (!url) throw new Error("Không nhận được link thanh toán");

      localStorage.setItem("current_payment_id", application.id);
      window.location.href = url;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Thanh toán thất bại.";
      setError(msg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="pay-container">
      <div className="pay-card" style={{ padding: 60 }}>
        <p style={{ color: '#64748b' }}>Đang tải thông tin hồ sơ...</p>
      </div>
    </div>
  );

  if (error && !application) return (
    <div className="pay-container">
      <div className="pay-card">
        <div className="pay-alert error">
          <FaExclamationTriangle /> {error}
        </div>
        <button className="pay-btn pay-btn-back" onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    </div>
  );

  return (
    <div className="pay-container">
      <div className="pay-card">



        <h2 className="pay-title">Xác nhận thanh toán</h2>
        <p className="pay-subtitle">Mã hồ sơ: #{application?.id}</p>

        {/* Khung Hóa Đơn */}
        <div className="pay-invoice-box">

          <div className="pay-row">
            <span className="pay-label">Sản phẩm</span>
            <span className="pay-value">{application?.productName}</span>
          </div>

          <div className="pay-row">
            <span className="pay-label">Khách hàng</span>
            <span className="pay-value">{currentUser?.username}</span>
          </div>

          <div className="pay-row">
            <span className="pay-label">Trạng thái</span>
            <span className={`pay-status ${application?.status === 'SUBMITTED' ? 'submitted' : ''}`}>
              {application?.status}
            </span>
          </div>

          {/* Dòng Tổng Tiền */}
          <div className="pay-row total">
            <span className="pay-label">Tổng thanh toán</span>
            <span className="pay-value">{formatVnd(application?.totalPremium)}</span>
          </div>
        </div>

        {/* Cảnh báo Logic */}
        {!isPayable && (
          <div className="pay-alert warning">
            <FaExclamationTriangle style={{ marginTop: 2, flexShrink: 0 }} />
            <span>Hồ sơ chưa sẵn sàng để thanh toán. Vui lòng kiểm tra lại trạng thái.</span>
          </div>
        )}

        {/* Lỗi API */}
        {error && (
          <div className="pay-alert error">
            <FaExclamationTriangle style={{ marginTop: 2 }} /> {error}
          </div>
        )}

        {/* Nút Bấm */}
        <div className="pay-actions">
          <button
            className="pay-btn pay-btn-back"
            onClick={() => navigate(-1)}
            disabled={paying}
          >
            <FaArrowLeft /> Quay lại
          </button>

          <button
            className="pay-btn pay-btn-submit"
            onClick={startPayment}
            disabled={!isPayable || paying}
          >
            {paying ? (
              "Đang xử lý..."
            ) : (
              <>
                <FaCreditCard /> Thanh toán ngay
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="pay-footer">
          <FaShieldAlt /> Giao dịch được bảo mật bởi VNPay
        </div>

      </div>
    </div>
  );
}