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
    if (!data.product) {
      navigate("/");
      return;
    }

    const inputObject = {
      age: data.age || 30,
      gender: data.gender || "male",
      ...(data.product.metadataParsed || {}),
    };

    const payload = {
      productId: data.product.id,
      inputData: JSON.stringify(inputObject),
    };

    quoteApi
      .create(payload)
      .then((res) => {
        const q = res.data.data;
        const safeQuote = {
          ...q,
          id: q.id,
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

      <div className="quote-card">
        <h3>Thông tin tính phí</h3>

        <div className="json-box">
          {Object.entries(JSON.parse(quote.inputData)).map(([key, val]) => (
            <div key={key} className="json-row">
              <span className="json-key">{key}:</span>
              <span className="json-value">{String(val.toLocaleString())}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="confirm-btn" onClick={() => navigate("/ApplicationForm")}>
        Tiếp tục tạo hồ sơ
      </button>
    </div>
  );
}
