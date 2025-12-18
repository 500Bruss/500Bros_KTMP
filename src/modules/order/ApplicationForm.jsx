import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quoteApi } from "../../api/quote.api";
import { useAuth } from "../auth/hook/useAuth";
import "./ApplicationForm.css";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // draft từ ProductDetail
  const [draft, setDraft] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" }); // success | error
  const [loading, setLoading] = useState(false);

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
    // 1) Check login
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // 2) Load draft từ ProductDetail
    const raw = localStorage.getItem("quoteData");
    if (!raw) {
      navigate("/");
      return;
    }
    const d = JSON.parse(raw);
    if (!d?.productId) {
      navigate("/");
      return;
    }
    setDraft(d);

    // 3) Pre-fill Applicant Data từ currentUser
    setApplicantData((prev) => ({
      ...prev,
      fullName: currentUser.fullName || currentUser.username || "",
      phone: currentUser.phone || "",
      gender: currentUser.gender || "",
      age: currentUser.age || "",
    }));
  }, [currentUser, navigate]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!draft) return;

    setMessage({ text: "", type: "" });

    // Validation giống bạn
    if (parseInt(applicantData.age || "0") < 18) {
      setMessage({ text: "Người yêu cầu phải từ 18 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0);
      return;
    }
    if (parseInt(insuredData.age || "0") < 1) {
      setMessage({ text: "Người được bảo hiểm phải từ 1 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0);
      return;
    }

    // ✅ Payload đúng QuoteCreationRequest
    // BE của bạn đọc age từ inputData => dùng insuredData.age
    const payload = {
      productId: String(draft.productId),
      selectedAddons: draft.selectedAddons || [],
      inputData: JSON.stringify({
        age: Number(insuredData.age),
        // các field khác nếu cần thì thêm sau, hiện BE bạn gửi chỉ cần age cho nhiều loại
      }),
    };

    try {
      setLoading(true);

      const res = await quoteApi.create(payload);
      const q = res.data?.data ?? res.data;

      // Lưu quote để Quote page hiển thị
      localStorage.setItem("createdQuote", JSON.stringify(q));

      // Lưu form để lát ở Quote bấm “tạo hồ sơ” (ApplicationDetail)
      localStorage.setItem("draftApplicantData", JSON.stringify(applicantData));
      localStorage.setItem("draftInsuredData", JSON.stringify(insuredData));

      setMessage({ text: "Tạo báo giá thành công!", type: "success" });
      window.scrollTo(0, 0);

      // qua Quote
      navigate(`/quote?quoteId=${q.id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tạo báo giá. Vui lòng thử lại.";
      setMessage({ text: msg, type: "error" });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (!draft) return <p style={{ textAlign: "center", padding: 20 }}>Đang tải...</p>;

  return (
    <div className="application-wrapper">
      {message.text && (
        <div
          className="msg-box"
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            color: "#fff",
            backgroundColor: message.type === "success" ? "#27ae60" : "#e74c3c",
            textAlign: "center",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          {message.text}
        </div>
      )}

      {/* === THÔNG TIN ĐANG CHỌN (không gọi API, chỉ show draft) === */}
      <div className="form-section-box">
        <h2 className="section-title">Thông tin lựa chọn</h2>
        <div className="info-row">
          <span className="label">Mã sản phẩm:</span> <strong>{draft.productId}</strong>
        </div>
        <div className="info-row">
          <span className="label">Số quyền lợi bổ sung:</span>{" "}
          {draft.selectedAddons?.length || 0}
        </div>
        <div className="info-row">
          <span className="label">Ghi chú:</span> Phí sẽ được tính ở bước Báo giá theo tuổi người được BH
        </div>
      </div>

      {/* === FORM (y nguyên layout) === */}
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
                type="number"
                min="18"
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
                type="number"
                min="1"
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
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value="">-- Chọn quan hệ --</option>
              <option value="SELF">Bản thân</option>
              <option value="SPOUSE">Vợ/Chồng</option>
              <option value="CHILD">Con cái</option>
              <option value="PARENT">Cha/Mẹ</option>
            </select>
          </div>
        </div>

        <button className="checkout-btn" disabled={loading}>
          {loading ? "Đang tạo báo giá..." : "Tiếp tục báo giá →"}
        </button>
      </form>
    </div>
  );
}
