import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LoginPage from "./modules/auth/page/Login";
import Register from "./modules/auth/page/Register";

import Quote from "./modules/order/Quote";
import ApplicationDetail from "./modules/order/ApplicationDetail";
import ApplicationForm from "./modules/order/ApplicationForm";
import ProductList from "./modules/product/ProductList";
import ProductDetail from "./modules/product/ProductDetail";
import ClaimHistory from "./modules/claim/ClaimHistory";
import PaymentPage from "./modules/payment/PaymentPage";
import PaymentResult from "./modules/payment/PaymentResult";
import SellerOrders from "./modules/order/SellerOrders";
import OrderHistory from "./modules/order/OrderHistory";
import Checkout from "./modules/order/Checkout";
import Home from "./modules/product/Home";

import AdminDashboard from "./modules/admin/AdminDashboard";
import AdminCategories from "./modules/admin/AdminCategories";
import AdminProducts from "./modules/admin/AdminProducts";
import AdminAddons from "./modules/admin/AdminAddons";
import AdminApplications from "./modules/admin/AdminApplications";
import AdminPolicies from "./modules/admin/AdminPolicies";
import AdminClaims from "./modules/admin/AdminClaims";

import { useAuth } from "./modules/auth/hook/useAuth";

import "./App.css";

function App() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser === undefined) return null;

  const [searchTerm, setSearchTerm] = useState("");
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

  const RequireAdmin = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" />;
    if (!currentUser.roles?.includes("ADMIN")) return <Navigate to="/" />;
    return children;
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {!isAdminRoute && (
        <Header
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      <main className="routes-container">
        <Routes>
          <Route
            path="/"
            element={
              currentUser?.roles?.includes("ADMIN") ? (
                <Navigate to="/admin" />
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/productlist"
            element={<ProductList onAdd={handleAdd} searchTerm={searchTerm} />}
          />
          <Route path="/menu" element={<ProductList onAdd={handleAdd} />} />
          <Route path="/menu/:categoryId" element={<ProductList />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/Product-Detail/:id"
            element={<ProductDetail onAdd={handleAdd} />}
          />
          <Route path="/claim-history" element={<ClaimHistory />} />
          <Route path="/ApplicationForm" element={<ApplicationForm />} />
          <Route path="/application/:id" element={<ApplicationDetail />} />
          <Route path="/payment/:applicationId" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResult />} />

          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/seller-orders" element={<SellerOrders />} />

          <Route
            path="/checkout"
            element={<Checkout cart={cart} setCart={setCart} currentUser={currentUser} />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAdmin>
                <AdminCategories />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequireAdmin>
                <AdminProducts />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/addons"
            element={
              <RequireAdmin>
                <AdminAddons />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <RequireAdmin>
                <AdminApplications />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/policies"
            element={
              <RequireAdmin>
                <AdminPolicies />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/claims"
            element={
              <RequireAdmin>
                <AdminClaims />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
