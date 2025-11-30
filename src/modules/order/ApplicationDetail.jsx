import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import "./ApplicationDetail.css";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);

  useEffect(() => {
    applicationApi
      .getById(id)
      .then((res) => setApp(res.data.data))
      .catch((err) => console.error("Lỗi load Application:", err));
  }, [id]);

  if (!app) return <p>Đang tải hồ sơ...</p>;

  // Parse JSON người yêu cầu & người được bảo hiểm
  const applicant = JSON.parse(app.applicantData);
  const insured = JSON.parse(app.insuredData);

  const renderInfoBox = (obj) => {
    return (
      <div className="json-info-grid">
        {Object.entries(obj).map(([key, val]) => (
          <div key={key} className="json-info-card">
            <div className="json-label">{key}</div>
            <div className="json-value">{String(val)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="detail-container">
      <h2 className="title">Chi tiết hồ sơ bảo hiểm #{app.id}</h2>

      {/* ===== THÔNG TIN CHUNG ===== */}
      <div className="detail-card">
        <h3>Thông tin hồ sơ</h3>
        <p><b>Trạng thái:</b> {app.status}</p>
        <p><b>Phí premium:</b> {app.totalPremium?.toLocaleString()} VND</p>
        <p><b>Ngày tạo:</b> {app.createdAt}</p>
        <p><b>Cập nhật:</b> {app.updatedAt}</p>

        {app.status === "SUBMITTED" && (
          <button
            className="btn-primary mt-3"
            onClick={() => navigate(`/payment/${app.id}`)}
          >
            Thanh toán VNPay
          </button>
        )}
      </div>

      {/* ===== NGƯỜI YÊU CẦU ===== */}
      <div className="detail-card">
        <h3>Người yêu cầu bảo hiểm</h3>
        {renderInfoBox(applicant)}
      </div>

      {/* ===== NGƯỜI ĐƯỢC BẢO HIỂM ===== */}
      <div className="detail-card">
        <h3>Người được bảo hiểm</h3>
        {renderInfoBox(insured)}
      </div>

      {/* ===== SẢN PHẨM ===== */}
      <div className="detail-card">
        <h3>Sản phẩm</h3>
        <p><b>ID:</b> {app.productId}</p>
        <p><b>Tên:</b> {app.productName}</p>
      </div>
    </div>
  );
}
