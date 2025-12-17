import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaHome, FaHistory, FaReceipt } from "react-icons/fa";
import "./PaymentResult.css"; // Nhớ import file CSS vừa tạo

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Lấy dữ liệu từ URL
  const responseCode = searchParams.get("vnp_ResponseCode");
  const amount = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode");
  const orderId = searchParams.get("vnp_TxnRef");
  const transactionNo = searchParams.get("vnp_TransactionNo");
  const payDate = searchParams.get("vnp_PayDate");

  // 2. Logic kiểm tra
  const isSuccess = responseCode === "00";

  // Hàm format tiền
  const formatMoney = (value) => {
    if (!value) return "0 đ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value / 100);
  };

  // Hàm format ngày giờ
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 14) return "";
    const yyyy = dateString.substring(0, 4);
    const MM = dateString.substring(4, 6);
    const dd = dateString.substring(6, 8);
    const HH = dateString.substring(8, 10);
    const mm = dateString.substring(10, 12);
    const ss = dateString.substring(12, 14);
    return `${HH}:${mm}:${ss} - ${dd}/${MM}/${yyyy}`;
  };

  return (
    <div className="payment-result-container">
      {/* Thêm class success/failed để đổi màu viền trên cùng */}
      <div className={`payment-card ${isSuccess ? 'success' : 'failed'}`}>

        {/* ICON TRẠNG THÁI */}
        <div className="status-icon">
          {isSuccess ? (
            <FaCheckCircle size={80} color="#27ae60" />
          ) : (
            <FaTimesCircle size={80} color="#e74c3c" />
          )}
        </div>

        <h2 className="result-title">
          {isSuccess ? "THANH TOÁN THÀNH CÔNG!" : "GIAO DỊCH THẤT BẠI"}
        </h2>

        <p className="result-message">
          {isSuccess
            ? "Cảm ơn bạn! Giao dịch đã được ghi nhận vào hệ thống."
            : `Lỗi giao dịch (Mã lỗi: ${responseCode || 'N/A'}). Vui lòng thử lại.`}
        </p>

        {/* BẢNG CHI TIẾT HÓA ĐƠN (Chỉ hiện khi có dữ liệu amount) */}
        {amount && (
          <div className="invoice-box">
            <h4 className="invoice-title">
              <FaReceipt style={{ marginRight: 8 }} /> Chi tiết giao dịch
            </h4>

            <div className="detail-row">
              <span>Mã hồ sơ:</span>
              <span className="value">#{orderId}</span>
            </div>

            <div className="detail-row">
              <span>Số tiền:</span>
              <span className="value amount">
                {formatMoney(amount)}
              </span>
            </div>

            <div className="detail-row">
              <span>Ngân hàng:</span>
              <span className="value">{bankCode || "VNPAY"}</span>
            </div>

            <div className="detail-row">
              <span>Mã GD VNPay:</span>
              <span className="value">{transactionNo}</span>
            </div>

            <div className="detail-row">
              <span>Thời gian:</span>
              <span className="value">{formatDate(payDate)}</span>
            </div>
          </div>
        )}

        {/* CÁC NÚT BẤM */}
        <div className="action-buttons">
          <button
            className="btn-action btn-home"
            onClick={() => navigate("/")}
          >
            <FaHome style={{ marginRight: 8 }} /> Trang chủ
          </button>

          <button
            className="btn-action btn-history"
            onClick={() => navigate("/order-history")}
          >
            <FaHistory style={{ marginRight: 8 }} /> Lịch sử
          </button>
        </div>

      </div>
    </div>
  );
}