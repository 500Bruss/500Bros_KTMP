// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import LoginPage from "./modules/auth/page/Login";
import Register from "./modules/auth/page/Register";

import ProductList from "./modules/product/ProductList";
import ProductDetail from "./modules/product/ProductDetail";
import Cart from "./modules/payment/Cart";
import SellerOrders from "./modules/order/SellerOrders";
import OrderHistory from "./modules/order/OrderHistory";
import Checkout from "./modules/order/Checkout";
import Home from "./modules/product/Home";

import { useAuth } from "./modules/auth/hook/useAuth"; // 🔥 lấy user từ AuthContext

import "./App.css";

function App() {
  const auth = useAuth();

  if (!auth) return null;   // tránh lỗi khi context chưa loaded

  const { currentUser, login, logout } = auth;
  // 🔥 LẤY currentUser từ AuthContext

  const [searchTerm, setSearchTerm] = useState("");

  // ==========================
  // 🛒 QUẢN LÝ GIỎ HÀNG
  // ==========================
  const [cart, setCart] = useState([]);

  // Load cart theo user
  useEffect(() => {
    if (currentUser) {
      const key = `cart_${encodeURIComponent(currentUser.username)}`;
      const raw = localStorage.getItem(key);
      setCart(raw ? JSON.parse(raw) : []);
    } else {
      setCart([]);
    }
  }, [currentUser]);

  // Save cart
  useEffect(() => {
    if (currentUser) {
      const key = `cart_${encodeURIComponent(currentUser.username)}`;
      localStorage.setItem(key, JSON.stringify(cart));
    } else {
      localStorage.setItem("my_cart", JSON.stringify(cart));
    }
  }, [cart, currentUser]);


  // Cart Actions
  const handleAdd = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [...prev, { ...product, quantity: 1 }];
      return prev.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      );
    });
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChangeQuantity = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((p) => p.id !== id));
    } else {
      setCart((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p))
      );
    }
  };


  // Wrapper để nhận category từ URL
  function MenuWrapper({ onAdd }) {
    const { category } = useParams();
    return <ProductList onAdd={onAdd} defaultCategory={category} />;
  }

  return (
    <div className="app">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main className="routes-container">
        <Routes>
          {/* 🏠 HOME */}
          <Route path="/" element={<Home />} />

          {/* 📦 PRODUCT */}
          <Route path="/productlist" element={<ProductList onAdd={handleAdd} searchTerm={searchTerm} />} />

          <Route path="/menu" element={<ProductList onAdd={handleAdd} />} />
          <Route path="/Product-Detail/:id" element={<ProductDetail onAdd={handleAdd} />} />
          <Route path="/menu/:categoryId" element={<ProductList />} />


          {/* 👤 AUTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />

          {/* 📑 ORDER */}
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/seller-orders" element={<SellerOrders />} />

          {/* 🛒 CART / CHECKOUT  <Route path="/menu/:category" element={<MenuWrapper onAdd={handleAdd} />} />*/}
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                onRemove={handleRemove}
                onChangeQuantity={handleChangeQuantity}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                setCart={setCart}
              />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
