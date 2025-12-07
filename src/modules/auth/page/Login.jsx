import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.username, form.password);
      if (user.roles?.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">Meowchick Insurance</div>


        <h2 className="login-title">Đăng nhập</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">Tên đăng nhập</label>
          <input
            className="login-input"
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Nhập tên đăng nhập"
          />

          <label className="login-label">Mật khẩu</label>
          <input
            className="login-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Nhập mật khẩu"
          />

          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>

        <div className="login-extra">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  );
}
