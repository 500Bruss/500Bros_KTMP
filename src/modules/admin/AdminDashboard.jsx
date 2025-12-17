import React, { useEffect, useState, useMemo } from "react";
import {
  FaRocket, FaShieldAlt, FaFileAlt, FaMoneyBill, FaChartPie, FaExclamationTriangle
} from "react-icons/fa";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

import AdminLayout from "./AdminLayout";
import { policyApi } from "../../api/policyApi";
import { claimApi } from "../../api/claimApi";
// Nếu bạn có applicationApi thì import, nếu không dùng axios trực tiếp
import api from "../../api/axiosClient";
import "./AdminDashboard.css";

// Màu sắc cho biểu đồ tròn
const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

export default function AdminDashboard() {
  const [data, setData] = useState({
    policies: [],
    claims: [],
    applications: []
  });
  const [loading, setLoading] = useState(true);

  // ================= 1. LOAD DỮ LIỆU =================
  useEffect(() => {
    async function load() {
      try {
        // Gọi song song 3 API có thật
        const [polRes, claimRes, appRes] = await Promise.all([
          // Lấy hết policy để tính tiền
          policyApi.getPolicies({ page: 1, size: 2000, sort: "createdAt,desc" }),
          // Lấy hết claim để thống kê
          claimApi.getClaims({ page: 1, size: 2000, sort: "createdAt,desc" }),
          // Lấy applications (nếu chưa có api riêng thì gọi axios thường)
          api.get("/api/applications", { params: { size: 2000 } }).catch(() => ({ data: { data: { items: [] } } }))
        ]);

        setData({
          policies: polRes.data?.data?.items || [],
          claims: claimRes.data?.data?.items || [],
          applications: appRes.data?.data?.items || [] // Tuỳ cấu trúc response của bạn
        });
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ================= 2. XỬ LÝ SỐ LIỆU (Calculate) =================

  // A. Tính Doanh thu theo tháng (Dựa vào Policy)
  const revenueData = useMemo(() => {
    const monthlyStats = {}; // { "T1": 500000, "T2": 1000000 ... }

    data.policies.forEach(p => {
      if (!p.createdAt) return;
      const date = new Date(p.createdAt);
      const monthKey = `T${date.getMonth() + 1}`; // Ví dụ: T1, T2

      // Cộng dồn tiền phí bảo hiểm (premiumTotal)
      const amount = Number(p.premiumTotal) || 0;
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + amount;
    });

    // Chuyển object thành mảng cho Recharts
    return Object.keys(monthlyStats).map(key => ({
      name: key,
      total: monthlyStats[key]
    }));
  }, [data.policies]);

  // B. Thống kê Sản phẩm (Dựa vào productId trong Policy)
  const productDistData = useMemo(() => {
    const dist = {};
    data.policies.forEach(p => {
      const prodName = p.productId || "Khác";
      dist[prodName] = (dist[prodName] || 0) + 1;
    });
    return Object.keys(dist).map(key => ({ name: key, value: dist[key] }));
  }, [data.policies]);

  // C. Thống kê Trạng thái Bồi thường (Claims)
  const claimStatusData = useMemo(() => {
    const stats = { APPROVED: 0, REJECTED: 0, SUBMITTED: 0, PAID: 0 };
    data.claims.forEach(c => {
      // Nếu status lạ thì tính vào SUBMITTED
      const st = stats[c.status] !== undefined ? c.status : "SUBMITTED";
      stats[st]++;
    });

    return [
      { name: "Đã duyệt", value: stats.APPROVED, color: "#1cc88a" }, // Xanh lá
      { name: "Từ chối", value: stats.REJECTED, color: "#e74a3b" },  // Đỏ
      { name: "Chờ xử lý", value: stats.SUBMITTED, color: "#f6c23e" }, // Vàng
      { name: "Đã chi trả", value: stats.PAID, color: "#36b9cc" },    // Xanh dương
    ].filter(item => item.value > 0); // Chỉ hiện cái nào có dữ liệu
  }, [data.claims]);

  // D. Hoạt động gần đây (Gộp Policy mới & Claim mới)
  const recentActivities = useMemo(() => {
    const policyList = data.policies.map(p => ({
      type: 'POLICY',
      id: p.policyNumber,
      date: p.createdAt,
      status: 'MỚI',
      amount: p.premiumTotal
    }));

    const claimList = data.claims.map(c => ({
      type: 'CLAIM',
      id: c.id,
      date: c.createdAt,
      status: c.status,
      amount: c.amountClaimed
    }));

    // Gộp lại và sort theo ngày giảm dần, lấy 5 cái đầu
    return [...policyList, ...claimList]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [data.policies, data.claims]);

  // KPI Tổng
  const totalRevenue = data.policies.reduce((sum, p) => sum + (Number(p.premiumTotal) || 0), 0);
  const totalClaims = data.claims.length;
  const totalPolicies = data.policies.length;

  if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;

  return (
    <AdminLayout title="Dashboard Tổng quan">
      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dash-header">
          <div>
            <h2>Dashboard Quản trị</h2>
            <p>Tổng quan tình hình kinh doanh & bồi thường bảo hiểm.</p>
          </div>
          <div className="date-badge">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="kpi-grid">
          <KpiCard
            title="Tổng Doanh thu"
            value={totalRevenue.toLocaleString() + " đ"}
            icon={<FaMoneyBill />}
            color="blue"
            subText="Tính từ tổng HĐ"
          />
          <KpiCard
            title="Hợp đồng đã bán"
            value={totalPolicies}
            icon={<FaShieldAlt />}
            color="green"
            subText="Hợp đồng hiệu lực"
          />
          <KpiCard
            title="Yêu cầu bồi thường"
            value={totalClaims}
            icon={<FaExclamationTriangle />}
            color="orange"
            subText="Cần xử lý"
          />
          <KpiCard
            title="Hồ sơ đăng ký"
            value={data.applications.length}
            icon={<FaFileAlt />}
            color="purple"
            subText="Applications"
          />
        </div>

        {/* BIỂU ĐỒ CHÍNH */}
        <div className="charts-grid-main">
          {/* Biểu đồ Doanh thu (Area Chart) */}
          <div className="chart-card big-chart">
            <div className="card-header">
              <h3>Biểu đồ doanh thu (Theo tháng)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4e73df" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4e73df" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={val => `${(val / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
                <Area type="monotone" dataKey="total" stroke="#4e73df" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ Tròn (Claims) */}
          <div className="chart-card small-chart">
            <div className="card-header">
              <h3>Tỷ lệ Bồi thường</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={claimStatusData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {claimStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DANH SÁCH HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="charts-grid-sub">
          <div className="chart-card full-width">
            <div className="card-header">
              <h3>Hoạt động gần đây (Hợp đồng & Bồi thường)</h3>
            </div>
            <div className="recent-list">
              {recentActivities.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>Chưa có hoạt động nào.</p>}

              {recentActivities.map((item, idx) => (
                <div key={idx} className="recent-item">
                  <div className={`icon-box ${item.type === 'POLICY' ? 'bg-blue' : 'bg-orange'}`}>
                    {item.type === 'POLICY' ? <FaShieldAlt /> : <FaExclamationTriangle />}
                  </div>
                  <div className="recent-info">
                    <p className="recent-text">
                      {item.type === 'POLICY' ? `Hợp đồng mới` : `Yêu cầu bồi thường`}
                      <span style={{ fontWeight: 'normal', color: '#666' }}> - ID: {item.id}</span>
                    </p>
                    <span className="recent-date">{new Date(item.date).toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 'bold', color: item.type === 'POLICY' ? '#1cc88a' : '#e74a3b' }}>
                      {Number(item.amount).toLocaleString()} đ
                    </span>
                    <span className={`status-tag ${item.status}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

// Component thẻ KPI
function KpiCard({ title, value, icon, color, subText }) {
  return (
    <div className={`kpi-card border-${color}`}>
      <div className="kpi-content">
        <div>
          <span className="kpi-title">{title}</span>
          <h3 className="kpi-value">{value}</h3>
          <p className="kpi-sub">{subText}</p>
        </div>
        <div className={`kpi-icon-box bg-${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}