import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Quote.css";

export default function Quote() {
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);

    useEffect(() => {
        const raw = localStorage.getItem("quoteData");
        if (!raw) {
            navigate("/");
            return;
        }

        const data = JSON.parse(raw);

        // Tạo quote_code giả lập
        const quote_code = "QT-" + Date.now();

        setQuote({
            quote_code,
            user_id: 12345, // giả lập
            product_id: data.product.id,
            input_data: {
                age: 30,
                gender: "male",
                coverage: "full",
                ...data.product.metadataParsed // merge metadata vào input luôn
            },
            addons: data.addons || [],
            premium: Number(data.product.price),
            currency: "VND",
            status: "CALCULATED",
            valid_until: "2025-12-31T23:59:59.999",
            created_at: new Date().toISOString(),
        });
    }, []);

    if (!quote) return <p>Đang tải báo giá...</p>;

    return (
        <div className="quote-container">

            <h2 className="quote-title">📄 Báo giá bảo hiểm</h2>

            {/* ===== Quote Info ===== */}
            <div className="quote-card">
                <h3>Mã báo giá</h3>
                <p className="quote-code">{quote.quote_code}</p>

                <table className="quote-table">
                    <tbody>
                        <tr><td>Người yêu cầu</td><td>{quote.user_id}</td></tr>
                        <tr><td>Gói bảo hiểm</td><td>{quote.product_id}</td></tr>
                        <tr><td>Trạng thái</td><td>{quote.status}</td></tr>
                        <tr><td>Loại tiền</td><td>{quote.currency}</td></tr>
                        <tr><td>Giá trị báo giá</td><td>{quote.premium.toLocaleString()} VND</td></tr>
                        <tr><td>Hạn hiệu lực</td><td>{quote.valid_until}</td></tr>
                    </tbody>
                </table>
            </div>

            {/* ===== Input Data JSON_render ===== */}
            <div className="quote-card">
                <h3>Thông tin tính phí</h3>
                <div className="json-box">
                    {Object.entries(quote.input_data).map(([key, val]) => (
                        <div key={key} className="json-row">
                            <span className="json-key">{key}</span>
                            <span className="json-value">{String(val)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== Addons ===== */}
            {quote.addons.length > 0 && (
                <div className="quote-card">
                    <h3>Quyền lợi bổ sung đã chọn</h3>

                    {quote.addons.map((a) => (
                        <div key={a.id} className="addon-box">
                            <p className="addon-title">⭐ {a.name}</p>
                            <p className="addon-desc">{a.description}</p>

                            {/* Addon metadata */}
                            {a.metaParsed && (
                                <div className="json-box small">
                                    {Object.entries(a.metaParsed).map(([k, v]) => (
                                        <div key={k} className="json-row">
                                            <span className="json-key">{k}</span>
                                            <span className="json-value">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="addon-price">
                                Giá: <strong>{a.price.toLocaleString()} VND</strong>
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <button className="confirm-btn" onClick={() => navigate("/checkout")}>
                Tiếp tục thanh toán →
            </button>

        </div>
    );
}
