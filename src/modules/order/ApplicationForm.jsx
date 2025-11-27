import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import "./ApplicationForm.css";

export default function ApplicationForm() {
    const fixedId = 1;

    const navigate = useNavigate();
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
        const raw = localStorage.getItem("createdQuote");
        if (!raw) {
            alert("Chưa có báo giá!");
            navigate("/");
            return;
        }

        const q = JSON.parse(raw);
        setQuote(q);
    }, []);

    const submitForm = async (e) => {
        e.preventDefault();

        if (!quote) return;

        // ⭐ HARD CODE QUOTE ID LUÔN = 1
        const hardQuoteId = 1;

        console.log("⚠ HARD QUOTE ID gửi BE:", hardQuoteId);

        const body = {
            applicantData,
            insuredData
        };

        try {
            const res = await applicationApi.create(hardQuoteId, body);
            const app = res.data.data;

            localStorage.setItem("createdApplication", JSON.stringify(app));

            alert("Tạo hồ sơ thành công!");
            navigate(`/application/${app.id}`);

        } catch (err) {
            console.error("Application create failed:", err);
            alert("Không thể tạo Application");
        }
    };

    if (!quote) return <p>Đang tải báo giá...</p>;

    return (
        <div className="application-container">
            <h2 className="title">📝 Tạo hồ sơ yêu cầu bảo hiểm</h2>

            <div className="quote-summary">
                <p><b>Mã báo giá:</b> {quote.id}</p>
                <p><b>Sản phẩm:</b> {quote.productName}</p>
                <p><b>Phí premium:</b> {quote.premium.toLocaleString()} VND</p>
            </div>

            <form className="app-form" onSubmit={submitForm}>
                <h3>Thông tin người yêu cầu</h3>

                <input
                    type="text"
                    placeholder="Họ tên"
                    value={applicantData.fullName}
                    onChange={(e) =>
                        setApplicantData({ ...applicantData, fullName: e.target.value })
                    }
                    required
                />

                <input
                    type="number"
                    placeholder="Tuổi"
                    value={applicantData.age}
                    onChange={(e) =>
                        setApplicantData({ ...applicantData, age: e.target.value })
                    }
                    required
                />

                <select
                    value={applicantData.gender}
                    onChange={(e) =>
                        setApplicantData({ ...applicantData, gender: e.target.value })
                    }
                    required
                >
                    <option value="">Giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                </select>

                <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={applicantData.phone}
                    onChange={(e) =>
                        setApplicantData({ ...applicantData, phone: e.target.value })
                    }
                    required
                />

                <h3>Thông tin người được bảo hiểm</h3>

                <input
                    type="text"
                    placeholder="Họ tên"
                    value={insuredData.fullName}
                    onChange={(e) =>
                        setInsuredData({ ...insuredData, fullName: e.target.value })
                    }
                    required
                />

                <input
                    type="number"
                    placeholder="Tuổi"
                    value={insuredData.age}
                    onChange={(e) =>
                        setInsuredData({ ...insuredData, age: e.target.value })
                    }
                    required
                />

                <input
                    type="text"
                    placeholder="Mối quan hệ"
                    value={insuredData.relationship}
                    onChange={(e) =>
                        setInsuredData({ ...insuredData, relationship: e.target.value })
                    }
                    required
                />

                <button className="submit-btn" type="submit">
                    Gửi hồ sơ →
                </button>
            </form>
        </div>
    );
}
