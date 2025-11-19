import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        fullname: "",
        email: "",
        phone: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username || !form.password || !form.fullname) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        try {
            await authApi.register(form);

            alert("Đăng ký thành công!");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert("Đăng ký thất bại, vui lòng thử lại.");
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Đăng ký tài khoản</h2>

                <form onSubmit={handleSubmit} className="register-form">

                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        placeholder="Nhập họ tên"
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                    />

                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                    />

                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Nhập username"
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                    />

                    <button className="register-button" type="submit">
                        Đăng ký
                    </button>
                </form>

                <p className="register-extra">
                    Đã có tài khoản?{" "}
                    <span onClick={() => navigate("/login")}>Đăng nhập</span>
                </p>
            </div>
        </div>
    );
}
