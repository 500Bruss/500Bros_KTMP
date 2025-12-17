import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import "./ApplicationDetail.css";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationApi.getById(id)
      .then(res => {
        setApp(res.data.data);
      })
      .catch(err => {
        console.error("Lỗi load Application:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-state">Đang tải hồ sơ...</div>;
  if (!app) return <div className="error-state">Không tìm thấy hồ sơ!</div>;

  // --- XỬ LÝ DỮ LIỆU JSON ---
  let applicant = {};
  let insured = {};
  try {
    applicant = app.applicantData ? JSON.parse(app.applicantData) : {};
    insured = app.insuredData ? JSON.parse(app.insuredData) : {};
  } catch (e) {
    console.error("Lỗi parse JSON:", e);
  }

  // --- HELPER HIỂN THỊ ---
  const formatMoney = (v) => v ? Number(v).toLocaleString('vi-VN') + ' VND' : '0 VND';
  const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '-';

  const renderGender = (g) => (g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Khác");

  const renderRel = (r) => {
    const map = { SELF: "Bản thân", SPOUSE: "Vợ/Chồng", CHILD: "Con cái", PARENT: "Cha/Mẹ" };
    return map[r] || r;
  };

  // --- HÀM CHUYỂN TRANG THANH TOÁN (Logic của bạn) ---
  const handlePayment = () => {
    navigate(`/payment/${app.id}`);
  };

  return (
    <div className="detail-container">
      {/* HEADER */}

      <div className="detail-card">
        <h3>  Chi tiết hồ sơ bảo hiểm   <span className="app-id-pill">#{app.id}</span></h3>

      </div>
      <div className="detail-grid">

        {/* 1. THÔNG TIN CHUNG */}
        <div className="detail-card">
          <h3> Thông tin bảo hiểm </h3>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Trạng thái:</span>
              <div className={`status-badge ${app.status}`}>
                {app.status}
              </div>
            </div>
            <div className="info-row">
              <span className="label">Sản phẩm:</span>
              <span className="value highlight">{app.productName}</span>
            </div>
            <div className="info-row">
              <span className="label">Mã sản phẩm:</span>
              <span className="value">{app.productId}</span>
            </div>


            <div className="info-row">
              <span className="label">Phí bảo hiểm:</span>
              <span className="value money">{formatMoney(app.totalPremium)}</span>
            </div>
            <div className="info-row">
              <span className="label">Ngày tạo:</span>
              <span className="value">{formatDate(app.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 2. NGƯỜI YÊU CẦU */}
        <div className="detail-card">
          <h3> Người yêu cầu bảo hiểm</h3>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Họ tên:</span>
              <span className="value bold">{applicant.fullName}</span>
            </div>
            <div className="info-row">
              <span className="label">Tuổi:</span>
              <span className="value">{applicant.age}</span>
            </div>
            <div className="info-row">
              <span className="label">Giới tính:</span>
              <span className="value">{renderGender(applicant.gender)}</span>
            </div>
            <div className="info-row">
              <span className="label">Số điện thoại:</span>
              <span className="value">{applicant.phone}</span>
            </div>
          </div>
        </div>

        {/* 3. NGƯỜI ĐƯỢC BẢO HIỂM */}
        <div className="detail-card">
          <h3> Người được bảo hiểm</h3>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Họ tên:</span>
              <span className="value bold">{insured.fullName}</span>
            </div>
            <div className="info-row">
              <span className="label">Tuổi:</span>
              <span className="value">{insured.age}</span>
            </div>
            <div className="info-row">
              <span className="label">Mối quan hệ:</span>
              <span className="value tag">{renderRel(insured.relationship)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="detail-actions">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        {/* Nút thanh toán VNPay (Chỉ hiện khi SUBMITTED) */}
        {app.status === 'SUBMITTED' && (
          <button className="btn-primary" onClick={handlePayment}>
            Thanh toán VNPay
          </button>
        )}
      </div>
    </div>
  );
}