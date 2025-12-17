import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import { useAuth } from "../auth/hook/useAuth";
import "./ApplicationForm.css";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quote, setQuote] = useState(null);

  // 1. THÊM STATE ĐỂ QUẢN LÝ THÔNG BÁO (Thay vì dùng alert)
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  // State for Applicant
  const [applicantData, setApplicantData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
  });

  // State for Insured Person
  const [insuredData, setInsuredData] = useState({
    fullName: "",
    age: "",
    relationship: "",
  });

  useEffect(() => {
    // 1. Check Login
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // 2. Load Quote
    const raw = localStorage.getItem("createdQuote");
    if (!raw) {
      // Chỗ này redirect ngay nên không cần set message
      navigate("/");
      return;
    }
    const q = JSON.parse(raw);
    setQuote(q);

    // 3. Pre-fill Applicant Data
    if (currentUser) {
      setApplicantData((prev) => ({
        ...prev,
        fullName: currentUser.fullName || currentUser.username || "",
        phone: currentUser.phone || "",
        gender: currentUser.gender || "",
        age: currentUser.age || "",
      }));
    }
  }, [currentUser, navigate]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!quote) return;

    // Reset thông báo cũ
    setMessage({ text: "", type: "" });

    // Validation
    // 2. THAY ALERT BẰNG SET MESSAGE (LỖI)
    if (parseInt(applicantData.age) < 18) {
      setMessage({ text: "Người yêu cầu phải từ 18 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0); // Cuộn lên đầu trang để xem lỗi
      return;
    }
    if (parseInt(insuredData.age) < 1) {
      setMessage({ text: "Người được bảo hiểm phải từ 1 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0);
      return;
    }

    const body = { applicantData, insuredData };

    try {
      const res = await applicationApi.create(quote.id, body);
      const app = res.data.data;
      localStorage.setItem("createdApplication", JSON.stringify(app));

      // 3. THAY ALERT BẰNG SET MESSAGE (THÀNH CÔNG)
      setMessage({ text: "Tạo hồ sơ thành công!", type: "success" });
      window.scrollTo(0, 0);

      // Đợi 1.5 giây để Selenium kịp kiểm tra và người dùng kịp đọc
      setTimeout(() => {
        navigate(`/application/${app.id}`);
      }, 1500);

    } catch (err) {
      // 4. THAY ALERT BẰNG SET MESSAGE (LỖI API)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tạo hồ sơ. Vui lòng thử lại.";
      setMessage({ text: msg, type: "error" });
      window.scrollTo(0, 0);
    }
  };

  if (!quote) return <p style={{ textAlign: 'center', padding: 20 }}>Đang tải báo giá...</p>;

  return (
    <div className="application-wrapper">

      {/* 5. HIỂN THỊ HỘP THÔNG BÁO Ở ĐÂY */}
      {message.text && (
        <div
          className="msg-box"
          style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            color: '#fff',
            backgroundColor: message.type === 'success' ? '#27ae60' : '#e74c3c', // Xanh lá hoặc Đỏ
            textAlign: 'center',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          {message.text}
        </div>
      )}

      {/* === QUOTE INFO === */}
      <div className="form-section-box">
        <h2 className="section-title">Thông tin báo giá</h2>
        <div className="info-row"><span className="label">Mã báo giá:</span> <strong>{quote.id}</strong></div>
        <div className="info-row"><span className="label">Sản phẩm:</span> {quote.productName}</div>
        <div className="info-row">
          <span className="label">Phí bảo hiểm:</span> <span style={{ color: '#d35400', fontWeight: 'bold' }}>{quote.premium?.toLocaleString()} VND</span>
        </div>
      </div>

      {/* === FORM === */}
      <form onSubmit={submitForm}>

        {/* ===== APPLICANT INFO ===== */}
        <div className="form-section-box">
          <h2 className="section-title">Thông tin người yêu cầu</h2>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={applicantData.fullName}
                onChange={(e) => setApplicantData({ ...applicantData, fullName: e.target.value })}
                required
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>

            <div className="form-group">
              <label>Tuổi</label>
              <input
                type="number" min="18"
                value={applicantData.age}
                onChange={(e) => setApplicantData({ ...applicantData, age: e.target.value })}
                required
                placeholder="Ví dụ: 25"
              />
            </div>
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Giới tính</label>
              <select
                value={applicantData.gender}
                onChange={(e) => setApplicantData({ ...applicantData, gender: e.target.value })}
                required
              >
                <option value="">-- Chọn --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={applicantData.phone}
                onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                required
                placeholder="Ví dụ: 0901234567"
              />
            </div>
          </div>
        </div>

        {/* ===== INSURED PERSON INFO ===== */}
        <div className="form-section-box">
          <h2 className="section-title">Thông tin người được bảo hiểm</h2>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={insuredData.fullName}
                onChange={(e) => setInsuredData({ ...insuredData, fullName: e.target.value })}
                required
                placeholder="Họ tên người được bảo hiểm"
              />
            </div>

            <div className="form-group">
              <label>Tuổi</label>
              <input
                type="number" min="1"
                value={insuredData.age}
                onChange={(e) => setInsuredData({ ...insuredData, age: e.target.value })}
                required
                placeholder="Ví dụ: 5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mối quan hệ với người yêu cầu</label>
            <select
              value={insuredData.relationship}
              onChange={(e) => setInsuredData({ ...insuredData, relationship: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">-- Chọn quan hệ --</option>
              <option value="SELF">Bản thân</option>
              <option value="SPOUSE">Vợ/Chồng</option>
              <option value="CHILD">Con cái</option>
              <option value="PARENT">Cha/Mẹ</option>
            </select>
          </div>
        </div>

        <button className="checkout-btn">Tiếp tục thanh toán →</button>
      </form>
    </div>
  );
}