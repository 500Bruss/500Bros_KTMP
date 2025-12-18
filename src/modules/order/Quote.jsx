import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/hook/useAuth";
import { applicationApi } from "../../api/application.api";
import "./Quote.css";

const safeJsonParse = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function Quote() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [quote, setQuote] = useState(null);

  // message box giống ApplicationForm
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loadingApp, setLoadingApp] = useState(false);

  useEffect(() => {
    // 1) Check login
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // 2) Load createdQuote (đã tạo ở ApplicationForm)
    const raw = localStorage.getItem("createdQuote");
    if (!raw) {
      // chưa tạo quote => quay lại form nhập
      navigate("/ApplicationForm");
      return;
    }

    try {
      const q = JSON.parse(raw);

      // ép string cho chắc giống bản cũ bạn làm
      const safeQuote = {
        ...q,
        id: q.id?.toString(),
        productId: q.productId?.toString(),
        userId: q.userId?.toString(),
      };

      setQuote(safeQuote);
    } catch (err) {
      console.error("Parse createdQuote error:", err);
      navigate("/ApplicationForm");
    }
  }, [currentUser, navigate]);

  const handleCreateApplication = async () => {
    if (!quote?.id) return;

    setMessage({ text: "", type: "" });

    // lấy dữ liệu nhập từ ApplicationForm (form nhập trước Quote)
    const applicantRaw = localStorage.getItem("draftApplicantData");
    const insuredRaw = localStorage.getItem("draftInsuredData");

    if (!applicantRaw || !insuredRaw) {
      setMessage({
        text: "Thiếu dữ liệu form. Vui lòng quay lại nhập lại thông tin.",
        type: "error",
      });
      window.scrollTo(0, 0);
      return;
    }

    const applicantData = safeJsonParse(applicantRaw);
    const insuredData = safeJsonParse(insuredRaw);

    // validation giống file ApplicationForm bạn gửi
    if (parseInt(applicantData?.age || "0") < 18) {
      setMessage({ text: "Người yêu cầu phải từ 18 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0);
      return;
    }
    if (parseInt(insuredData?.age || "0") < 1) {
      setMessage({ text: "Người được bảo hiểm phải từ 1 tuổi trở lên!", type: "error" });
      window.scrollTo(0, 0);
      return;
    }

    try {
      setLoadingApp(true);

      const body = { applicantData, insuredData };

      const res = await applicationApi.create(quote.id, body);
      const app = res.data?.data ?? res.data;

      localStorage.setItem("createdApplication", JSON.stringify(app));

      setMessage({ text: "Tạo hồ sơ thành công!", type: "success" });
      window.scrollTo(0, 0);

      // giữ y như bạn làm cho selenium
      setTimeout(() => {
        navigate(`/application/${app.id}`);

      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Không thể tạo hồ sơ. Vui lòng thử lại.";
      setMessage({ text: msg, type: "error" });
      window.scrollTo(0, 0);
    } finally {
      setLoadingApp(false);
    }
  };

  if (!quote) return <p>Đang tải báo giá...</p>;

  const inputDataObj = safeJsonParse(quote.inputData) || {};

  return (
    <div className="quote-container">
      <h2 className="quote-title">Báo giá bảo hiểm</h2>

      {/* message box */}
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

      {/* ===== THÔNG TIN QUOTE ===== */}
      <div className="quote-card">
        <div className="info-horizontal-box">
          <h3>Mã báo giá</h3>
          <p className="quote-code">{quote.id}</p>
        </div>

        <div className="info-horizontal-box">
          <table className="quote-table">
            <tbody>
              <tr>
                <td>Người yêu cầu</td>
                <td>{quote.userId}</td>
              </tr>
              <tr>
                <td>Gói bảo hiểm</td>
                <td>{quote.productId}</td>
              </tr>
              <tr>
                <td>Sản phẩm</td>
                <td>{quote.productName}</td>
              </tr>
              <tr>
                <td>Giá trị báo giá</td>
                <td>{quote.premium?.toLocaleString()} VND</td>
              </tr>
              <tr>
                <td>Trạng thái</td>
                <td className={`status-badge ${quote.status}`}>{quote.status}</td>
              </tr>
              <tr>
                <td>Hiệu lực đến</td>
                <td>{quote.validUntil}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== QUYỀN LỢI BỔ SUNG ĐÃ CHỌN ===== */}
      {quote.selectedAddons && quote.selectedAddons.length > 0 && (
        <div className="quote-card">
          <h3>Quyền lợi bổ sung đã chọn</h3>

          {quote.selectedAddons.map((a) => {
            const metaObj = safeJsonParse(a.metaData);
            return (
              <div key={a.id} className="json-box" style={{ marginBottom: 12 }}>
                <div className="json-row">
                  <span className="json-key">Tên:</span>
                  <span className="json-value">{a.name}</span>
                </div>

                <div className="json-row">
                  <span className="json-key">Giá:</span>
                  <span className="json-value">{a.price?.toLocaleString()} VND</span>
                </div>

                {a.description && (
                  <div className="json-row">
                    <span className="json-key">Mô tả:</span>
                    <span className="json-value">{a.description}</span>
                  </div>
                )}

                {metaObj &&
                  Object.entries(metaObj).map(([k, v]) => (
                    <div key={k} className="json-row">
                      <span className="json-key">{k}:</span>
                      <span className="json-value">{String(v)}</span>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== THÔNG TIN TÍNH PHÍ ===== */}
      <div className="quote-card">
        <h3>Thông tin tính phí</h3>

        <div className="json-box">
          {Object.entries(inputDataObj).map(([key, val]) => (
            <div key={key} className="json-row">
              <span className="json-key">{key}:</span>
              <span className="json-value">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="confirm-btn" onClick={handleCreateApplication} disabled={loadingApp}>
        {loadingApp ? "Đang tạo hồ sơ..." : "Tiếp tục tạo hồ sơ"}
      </button>
    </div>
  );
}
