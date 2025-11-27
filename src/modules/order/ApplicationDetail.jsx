import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { applicationApi } from "../../api/application.api";
import "./ApplicationDetail.css";

export default function ApplicationDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);

    useEffect(() => {
        applicationApi.getById(id)
            .then(res => {
                setApp(res.data.data);
            })
            .catch(err => {
                console.error("Lỗi load Application:", err);
            });
    }, []);

    if (!app) return <p>Đang tải hồ sơ...</p>;

    return (
        <div className="detail-container">
            <h2 className="title">📄 Chi tiết hồ sơ bảo hiểm #{app.id}</h2>

            <div className="detail-card">
                <h3>Thông tin hồ sơ</h3>
                <p><b>Trạng thái:</b> {app.status}</p>
                <p><b>Phí premium:</b> {app.totalPremium?.toLocaleString()} VND</p>
                <p><b>Ngày tạo:</b> {app.createdAt}</p>
                <p><b>Cập nhật:</b> {app.updatedAt}</p>
            </div>

            <div className="detail-card">
                <h3>Người yêu cầu bảo hiểm</h3>
                <pre>{JSON.stringify(JSON.parse(app.applicantData), null, 2)}</pre>
            </div>

            <div className="detail-card">
                <h3>Người được bảo hiểm</h3>
                <pre>{JSON.stringify(JSON.parse(app.insuredData), null, 2)}</pre>
            </div>

            <div className="detail-card">
                <h3>Sản phẩm</h3>
                <p><b>ID:</b> {app.productId}</p>
                <p><b>Tên:</b> {app.productName}</p>
            </div>
        </div>
    );
}
