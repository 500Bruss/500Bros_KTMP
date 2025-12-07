import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import { paymentApi } from "../../api/payment.api";
import { useAuth } from "../auth/hook/useAuth";

const formatVnd = (value) =>
  Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setLoading(true);
    applicationApi
      .getById(applicationId)
      .then((res) => setApplication(res.data.data))
      .catch(() => setError("Không tải được hồ sơ, vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, [applicationId, currentUser, navigate]);

  const isPayable = useMemo(
    () => application?.status === "SUBMITTED",
    [application?.status]
  );

  const startPayment = async () => {
    if (!application) return;
    setError("");
    setPaying(true);
    try {
      const res = await paymentApi.create(application.id, "VNPAY");

      const url = res.data?.data?.paymentUrl;
      if (!url) throw new Error("Không nhận được link thanh toán");
      localStorage.setItem("last_payment_application", application.id);
      window.location.href = url;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Thanh toán thất bại, vui lòng thử lại.";
      setError(msg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p className="text-center mt-6">Đang tải thông tin hồ sơ...</p>;
  if (error && !application) return <p className="text-center mt-6 text-red-500">{error}</p>;

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Thanh toán VNPay</h2>
        <p className="subtitle">Hồ sơ #{application?.id}</p>

        <div className="payment-summary">
          <div>
            <span>Trạng thái hồ sơ</span>
            <strong>{application?.status}</strong>
          </div>
          <div>
            <span>Phí bảo hiểm</span>
            <strong>{formatVnd(application?.totalPremium)}</strong>
          </div>
          <div>
            <span>Sản phẩm</span>
            <strong>{application?.productName}</strong>
          </div>
        </div>

        {!isPayable && (
          <p className="note">
            Hồ sơ không ở trạng thái SUBMITTED, không thể thanh toán. Vui lòng kiểm tra lại.
          </p>
        )}

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate(-1)} disabled={paying}>
            Quay lại
          </button>
          <button
            className="btn-primary"
            onClick={startPayment}
            disabled={!isPayable || paying}
          >
            {paying ? "Đang chuyển hướng..." : "Thanh toán qua VNPay"}
          </button>
        </div>
      </div>
    </div>
  );
}
