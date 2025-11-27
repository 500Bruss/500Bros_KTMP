import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { quoteApi } from "../../api/quote.api";
import "./Quote.css";

export default function Quote() {
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);

    const createdRef = useRef(false);

    useEffect(() => {
        if (createdRef.current) return;
        createdRef.current = true;

        const raw = localStorage.getItem("quoteData");
        if (!raw) {
            navigate("/");
            return;
        }

        const data = JSON.parse(raw);

        // inputData sẽ lấy từ metadataParsed
        const inputObject = {
            age: data.age || 30,
            gender: data.gender || "male",
            ...(data.product.metadataParsed || {})
        };

        const payload = {
            productId: data.product.id,      // để nguyên number cũng ok
            inputData: JSON.stringify(inputObject)
        };

        console.log("Payload gửi BE:", payload);

        quoteApi.create(payload)
            .then((res) => {
                const q = res.data.data;

                console.log("Quote từ BE:", q);

                // ✔ KHÔNG ép id = "1"
                // ✔ ID trả từ BE đã là String (backend sửa rồi)
                const safeQuote = {
                    ...q,
                    id: q.id,                         // luôn là String
                    productId: q.productId?.toString(),
                    userId: q.userId?.toString()
                };

                console.log("SAFE QUOTE FE:", safeQuote);

                localStorage.setItem("createdQuote", JSON.stringify(safeQuote));
                setQuote(safeQuote);
            })
            .catch((err) => console.error("ERROR:", err));
    }, []);

    if (!quote) return <p>Đang tạo báo giá...</p>;

    return (
        <div className="quote-container">
            <h2 className="quote-title">📄 Báo giá bảo hiểm</h2>

            <div className="quote-card">
                <h3>Mã báo giá</h3>
                {/* Hiển thị chuẩn ID lớn */}
                <p className="quote-code">{quote.id}</p>

                <table className="quote-table">
                    <tbody>
                        <tr><td>Người yêu cầu</td><td>{quote.userId}</td></tr>
                        <tr><td>Gói bảo hiểm</td><td>{quote.productId}</td></tr>
                        <tr><td>Sản phẩm</td><td>{quote.productName}</td></tr>
                        <tr><td>Giá trị báo giá</td><td>{quote.premium?.toLocaleString()} VND</td></tr>
                        <tr><td>Trạng thái</td><td>{quote.status}</td></tr>
                        <tr><td>Hiệu lực đến</td><td>{quote.validUntil}</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="quote-card">
                <h3>Thông tin tính phí</h3>

                <div className="json-box">
                    {Object.entries(JSON.parse(quote.inputData)).map(([key, val]) => (
                        <div key={key} className="json-row">
                            <span className="json-key">{key}</span>
                            <span className="json-value">{String(val)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="confirm-btn"
                onClick={() => navigate("/ApplicationForm")}
            >
                Tiếp tục tạo hồ sơ →
            </button>
        </div>
    );
}
