import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import "./ProductDetail.css";

/* ================================
    MAP KEY → LABEL ĐẸP
================================ */
const fieldNameMap = {
  validity: "Thời hạn hiệu lực",
  age: "Độ tuổi áp dụng",
  limit: "Giới hạn bồi thường",
  maxCompensation: "Số tiền bồi thường tối đa",
  condition: "Điều kiện áp dụng",
  requirement: "Yêu cầu bổ sung",
  benefit: "Quyền lợi bảo hiểm",
  coverage: "Phạm vi bảo hiểm",
  insuredAmount: "Số tiền bảo hiểm",
  waitingPeriod: "Thời gian chờ",
  hospitalCash: "Trợ cấp nằm viện",
  deductible: "Mức khấu trừ",
  premiumRate: "Tỷ lệ phí bảo hiểm",
  addonType: "Loại điều kiện",
};

/* Auto format key nếu không có trong map */
const formatKey = (key) => {
  if (fieldNameMap[key]) return fieldNameMap[key];

  const spaced = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    api
      .get(`/api/products/${id}`)
      .then((res) => {
        const p = res.data.data;
        if (!p) return;

        p.baseCoverParsed =
          typeof p.baseCover === "string" ? JSON.parse(p.baseCover) : p.baseCover;

        const metaRaw = p.metaData ?? p.metadata;
        p.metadataParsed = typeof metaRaw === "string" ? JSON.parse(metaRaw) : metaRaw;

        const addonArr = (p.addonsList || []).map((a) => ({
          ...a,
          metaParsed:
            typeof a.metaData === "string" ? JSON.parse(a.metaData) : a.metaData,
        }));

        setProduct(p);
        setAddons(addonArr);
      })
      .catch((err) => console.error("Lỗi load sản phẩm:", err));
  }, [id]);

  if (!product) return <p className="loading-text-new">Đang tải...</p>;

  /* ===== toggle addon: click chọn → click lại bỏ ===== */
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? [] : [addonId]
    );
  };

  const handleContinueQuote = () => {
    const payload = {
      product,
      addons: addons.filter((a) => selectedAddons.includes(a.id)),
    };

    localStorage.setItem("quoteData", JSON.stringify(payload));
    navigate("/quote");
  };

  const totalPrice =
    product.price +
    addons
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="detail-wrapper-new">

      <Link to="/" className="back-link-new">
        ← Quay lại danh sách
      </Link>

      {/* ===== THÔNG TIN SẢN PHẨM ===== */}
      <section className="section-box-new">
        <h3 className="section-title-new">Thông tin sản phẩm</h3>

        {/* ===== SIMPLE & CLEAN INFO BOX ===== */}
        {/* THÔNG TIN SẢN PHẨM — DẠNG DÒNG NGANG */}
        <div className="info-horizontal-box">

          <div className="info-line">
            <span className="info-line-label">Mã sản phẩm:</span>
            <span className="info-line-value">{product.id}</span>
          </div>

          <div className="info-line">
            <span className="info-line-label">Tên sản phẩm:</span>
            <span className="info-line-value">{product.name}</span>
          </div>

          <div className="info-line">
            <span className="info-line-label">Mô tả:</span>
            <span className="info-line-value">{product.description}</span>
          </div>

          <div className="info-line">
            <span className="info-line-label">Giá cơ bản:</span>
            <span className="info-line-value">
              {product.price.toLocaleString()} VND
            </span>
          </div>

        </div>

        <div className="info-horizontal-box">
          {/* ===== QUYỀN LỢI CƠ BẢN ===== */}
          <div className="pretty-row">Quyền lợi cơ bản</div>
          <div className="json-card-grid">
            {Object.entries(product.baseCoverParsed || {}).map(([key, val]) => (
              <div className="json-chip-card" key={key}>
                <div className="chip-label">{formatKey(key)}</div>
                <div className="chip-value">{String(val.toLocaleString())} VND</div>
              </div>
            ))}
          </div>
        </div>
        <div className="info-horizontal-box">
          {/* ===== THÔNG TIN BỔ SUNG ===== */}
          <div className="pretty-row">Thông tin bổ sung</div>
          <div className="json-card-grid">
            {Object.entries(product.metadataParsed || {}).map(([key, val]) => (
              <div className="json-chip-card" key={key}>
                <div className="chip-label">{formatKey(key)}</div>
                <div className="chip-value">{String(val.toLocaleString())}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADDONS ===== */}
      {addons.length > 0 && (
        <section className="section-box-new">
          <h3 className="section-title-new">Quyền lợi bổ sung</h3>

          <div className="addon-list-new">
            {addons.map((a) => {
              const isSelected = selectedAddons.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`addon-card-new ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleAddon(a.id)}
                >
                  <div className="addon-header-new">
                    <input type="radio" name="addon" checked={isSelected} readOnly />
                    <span>{a.name}</span>
                  </div>

                  <p className="addon-desc-new">{a.description}</p>

                  <div className="addon-meta-new">
                    {Object.entries(a.metaParsed || {}).map(([key, val]) => (
                      <div className="json-chip-card" key={key}>
                        <div className="chip-label">{formatKey(key)}</div>
                        <div className="chip-value">{String(val)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="addon-price-new">
                    Giá: {a.price.toLocaleString()} VND
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== TOTAL ===== */}
      <section className="section-box-new">
        <h3 className="section-title-new">Tổng giá</h3>

        <p className="total-price-new">{totalPrice.toLocaleString()} VND</p>

        <button className="continue-btn-new" onClick={handleContinueQuote}>
          Tiếp tục báo giá
        </button>
      </section>

    </div>
  );
}
