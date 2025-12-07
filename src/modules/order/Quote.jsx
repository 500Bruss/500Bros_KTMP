import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { quoteApi } from "../../api/quote.api";
import "./Quote.css";
import { useAuth } from "../auth/hook/useAuth";

export default function Quote() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quote, setQuote] = useState(null);
  const createdRef = useRef(false);

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const raw = localStorage.getItem("quoteData");
    if (!raw) {
      navigate("/");
      return;
    }

    const data = JSON.parse(raw);

    if (!data.productId) {
      navigate("/");
      return;
    }

    const inputObject = {
      age: data.age || 30,
      gender: data.gender || "male",
    };

    const payload = {
      productId: data.productId,
      selectedAddons: data.selectedAddons || [],
      inputData: JSON.stringify(inputObject),
    };

    quoteApi
      .create(payload)
      .then((res) => {
        const q = res.data.data;

        const safeQuote = {
          ...q,
          id: q.id?.toString(),
          productId: q.productId?.toString(),
          userId: q.userId?.toString(),
        };

        localStorage.setItem("createdQuote", JSON.stringify(safeQuote));
        setQuote(safeQuote);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        alert("Tạo báo giá thất bại. Vui lòng thử lại.");
        navigate("/");
      });
  }, [currentUser, navigate]);

  if (!quote) return <p>Đang tạo báo giá...</p>;

  return (
    <div className="quote-container">
      <h2 className="quote-title">Báo giá bảo hiểm</h2>

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
                <td className={`status-badge ${quote.status}`}>
                  {quote.status}
                </td>
              </tr>
              <tr>
                <td>Hiệu lực đến</td>
                <td>{quote.validUntil}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DANH SÁCH ADDON ĐÃ CHỌN ===== */}
      {/* ===== QUYỀN LỢI BỔ SUNG ĐÃ CHỌN ===== */}
      {quote.selectedAddons && quote.selectedAddons.length > 0 && (
        <div className="quote-card">
          <h3>Quyền lợi bổ sung đã chọn</h3>

          {quote.selectedAddons.map((a) => (
            <div key={a.id} className="json-box" style={{ marginBottom: 12 }}>

              {/* NAME + PRICE */}
              <div className="json-row">
                <span className="json-key">Tên:</span>
                <span className="json-value">{a.name}</span>
              </div>

              <div className="json-row">
                <span className="json-key">Giá:</span>
                <span className="json-value">
                  {a.price?.toLocaleString()} VND
                </span>
              </div>

              {/* DESCRIPTION */}
              {a.description && (
                <div className="json-row">
                  <span className="json-key">Mô tả:</span>
                  <span className="json-value">{a.description}</span>
                </div>
              )}

              {/* METADATA: DẠNG JSON-ROW NHƯ THÔNG TIN TÍNH PHÍ */}
              {a.metaData &&
                Object.entries(JSON.parse(a.metaData)).map(([k, v]) => (
                  <div key={k} className="json-row">
                    <span className="json-key">{k}:</span>
                    <span className="json-value">{String(v)}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* ===== THÔNG TIN TÍNH PHÍ ===== */}
      <div className="quote-card">
        <h3>Thông tin tính phí</h3>

        <div className="json-box">
          {Object.entries(JSON.parse(quote.inputData)).map(([key, val]) => (
            <div key={key} className="json-row">
              <span className="json-key">{key}:</span>
              <span className="json-value">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="confirm-btn"
        onClick={() => navigate("/ApplicationForm")}
      >
        Tiếp tục tạo hồ sơ
      </button>
    </div>
  );
}
