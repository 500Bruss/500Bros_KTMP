import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import { useAuth } from "../auth/hook/useAuth";
import "./ApplicationForm.css";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quote, setQuote] = useState(null);

  const [applicantData, setApplicantData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
  });

  const [insuredData, setInsuredData] = useState({
    fullName: "",
    age: "",
    relationship: "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const raw = localStorage.getItem("createdQuote");
    if (!raw) {
      alert("Chưa có báo giá!");
      navigate("/");
      return;
    }
    const q = JSON.parse(raw);
    setQuote(q);
  }, [currentUser, navigate]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!quote) return;

    // ===== VALIDATION TUỔI =====
    if (parseInt(applicantData.age) < 18) {
      alert("Người yêu cầu phải từ 18 tuổi trở lên!");
      return;
    }
    if (parseInt(insuredData.age) < 1) {
      alert("Người được bảo hiểm phải từ 1 tuổi trở lên!");
      return;
    }

    const body = { applicantData, insuredData };

    try {
      const res = await applicationApi.create(quote.id, body);
      const app = res.data.data;
      localStorage.setItem("createdApplication", JSON.stringify(app));
      alert("Tạo hồ sơ thành công!");
      navigate(`/application/${app.id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tạo hồ sơ. Vui lòng thử lại.";
      alert(msg);
    }
  };

  if (!quote) return <p>Đang tải báo giá...</p>;

  return (
    <div className="application-wrapper">

      {/* === KHUNG BÁO GIÁ === */}
      <div className="form-section-box">
        <h2 className="section-title">Thông tin báo giá</h2>

        <div className="info-row"><span className="label">Mã báo giá:</span> {quote.id}</div>
        <div className="info-row"><span className="label">Sản phẩm:</span> {quote.productName}</div>
        <div className="info-row">
          <span className="label">Premium:</span> {quote.premium?.toLocaleString()} VND
        </div>
      </div>

      {/* === FORM === */}
      <form onSubmit={submitForm}>

        {/* ===== KHUNG 1: Người yêu cầu ===== */}
        <div className="form-section-box">
          <h2 className="section-title">Thông tin người yêu cầu</h2>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={applicantData.fullName}
                onChange={(e) =>
                  setApplicantData({ ...applicantData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Tuổi</label>
              <input
                type="number"
                min="18"
                value={applicantData.age}
                onChange={(e) =>
                  setApplicantData({ ...applicantData, age: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Giới tính</label>
              <select
                value={applicantData.gender}
                onChange={(e) =>
                  setApplicantData({ ...applicantData, gender: e.target.value })
                }
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
                onChange={(e) =>
                  setApplicantData({ ...applicantData, phone: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* ===== KHUNG 2: Người được bảo hiểm ===== */}
        <div className="form-section-box">
          <h2 className="section-title">Thông tin người được bảo hiểm</h2>

          <div className="form-group-inline">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={insuredData.fullName}
                onChange={(e) =>
                  setInsuredData({ ...insuredData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Tuổi</label>
              <input
                type="number"
                min="1"
                value={insuredData.age}
                onChange={(e) =>
                  setInsuredData({ ...insuredData, age: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mối quan hệ</label>
            <input
              type="text"
              value={insuredData.relationship}
              onChange={(e) =>
                setInsuredData({ ...insuredData, relationship: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button className="checkout-btn">Gửi hồ sơ</button>
      </form>
    </div>
  );
}
