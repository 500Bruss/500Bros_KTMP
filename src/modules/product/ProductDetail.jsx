import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import { addonApi } from "../../api/addon.api";
import "./ProductDetail.css";

// =====================================
// Helper: convert object → table
// =====================================
const renderJsonTable = (obj) => {
    if (!obj || typeof obj !== "object") {
        return <p className="json-empty">Không có dữ liệu</p>;
    }

    return (
        <table className="json-table">
            <tbody>
                {Object.entries(obj).map(([key, val]) => (
                    <tr key={key}>
                        <td className="json-key">{key}</td>
                        <td className="json-value">{String(val)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const navigate = useNavigate();

    // ============================
    // LOAD PRODUCT
    // ============================
    useEffect(() => {
        api.get(`/api/products/${id}`)
            .then((res) => {
                const p = res.data.data;

                p.baseCoverParsed =
                    typeof p.baseCover === "string"
                        ? JSON.parse(p.baseCover)
                        : p.baseCover;

                p.metadataParsed =
                    typeof p.metadata === "string"
                        ? JSON.parse(p.metadata)
                        : p.metadata;

                setProduct(p);
            })
            .catch((err) => console.error("Lỗi khi fetch sản phẩm:", err));
    }, [id]);

    // ============================
    // LOAD ADDONS
    // ============================
    useEffect(() => {
        if (!product) return;

        addonApi
            .getByProduct(product.id)
            .then((res) => {
                const arr = (res.data.data.items || []).map((a) => ({
                    ...a,
                    metaParsed:
                        typeof a.metaData === "string"
                            ? JSON.parse(a.metaData)
                            : a.metaData,
                }));

                setAddons(arr);
            })
            .catch((err) => console.error("Lỗi load addons:", err));
    }, [product]);

    if (!product) return <p>Đang tải...</p>;

    // ============================
    // CHỌN ADDON
    // ============================
    const toggleAddon = (addonId) => {
        setSelectedAddons((prev) =>
            prev.includes(addonId)
                ? prev.filter((x) => x !== addonId)
                : [...prev, addonId]
        );
    };

    // ============================
    // BÁO GIÁ
    // ============================
    const handleContinueQuote = () => {
        const payload = {
            product,
            addons: addons.filter((a) => selectedAddons.includes(a.id)),
        };

        localStorage.setItem("quoteData", JSON.stringify(payload));
        navigate("/quote");
    };

    return (
        <div className="product-detail-container">
            <Link to="/" className="back-link">⬅ Quay lại danh sách</Link>

            {/* ======================= */}
            {/* THÔNG TIN SẢN PHẨM */}
            {/* ======================= */}
            <section className="info-section">
                <h3>Thông tin sản phẩm</h3>

                <table className="info-table">
                    <tbody>
                        <tr><td>Mã sản phẩm</td><td>{product.id}</td></tr>
                        <tr><td>Tên</td><td>{product.name}</td></tr>
                        <tr><td>Mô tả</td><td>{product.description}</td></tr>
                        <tr><td>Giá cơ bản</td><td>{product.price.toLocaleString()} VND</td></tr>

                        <tr>
                            <td>Base Cover</td>
                            <td>{renderJsonTable(product.baseCoverParsed)}</td>
                        </tr>

                        <tr>
                            <td>Metadata</td>
                            <td>{renderJsonTable(product.metadataParsed)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ======================= */}
            {/* QUYỀN LỢI BỔ SUNG */}
            {/* ======================= */}
            {addons.length > 0 && (
                <section className="bonus-section">
                    <h3>Quyền lợi bổ sung</h3>

                    {addons.map((a) => {
                        const isSelected = selectedAddons.includes(a.id);

                        return (
                            <div
                                key={a.id}
                                className={`addon-card ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleAddon(a.id)}
                            >
                                <div className="addon-header">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                    />
                                    <span className="addon-title">{a.name}</span>
                                </div>

                                <p className="addon-description">{a.description}</p>

                                <div className="addon-meta">
                                    {renderJsonTable(a.metaParsed)}
                                </div>

                                <div className="addon-price">
                                    Giá: {a.price.toLocaleString()} VND
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* ======================= */}
            {/* TỔNG GIÁ */}
            {/* ======================= */}
            <section className="price-section">
                <h3>Tổng giá</h3>

                <p className="price">
                    {(
                        product.price +
                        addons
                            .filter((a) => selectedAddons.includes(a.id))
                            .reduce((sum, a) => sum + a.price, 0)
                    ).toLocaleString()} VND
                </p>

                <button onClick={handleContinueQuote} className="buy-button">
                    ➡ Tiếp tục báo giá
                </button>
            </section>
        </div>
    );
}

export default ProductDetail;
