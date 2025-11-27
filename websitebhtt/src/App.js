// App.js
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./i18n";
import "antd/dist/reset.css"; // cần cho Ant Design v5

// --- IMPORT CONTEXT ---
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext"; // Context (đếm count) CÓ SẴN
import { OrderHistoryProvider } from "./context/OrderHistoryContext"; // <-- THÊM MỚI (để lưu lịch sử)

// 🏠 --- USER COMPONENTS ---
// (import Header, Footer, ... giữ nguyên)
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBubble from "./components/ChatBubble";
import LuckyWheel from "./components/LuckyWheel";
import Banner from "./components/Banner";

// 🧩 --- ADMIN COMPONENTS ---
// (import AppHeader, AppFooter, ... giữ nguyên)
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import PageContent from "./components/PageContent";
import SideMenu from "./components/SideMenu";

// 🏠 --- USER PAGES ---
// (import Home, About, ... giữ nguyên)
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductsList from "./pages/ProductsList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CartProducts from "./pages/CartProducts";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Product from "./pages/Product";
import ShoppingCart from "./pages/ShoppingCart";
import ReviewOrder from "./pages/ReviewOrder";
import Blog from "./pages/Blog";
import OrderHistory from "./pages/OrderHistory/OrderHistory"; // <-- THÊM MỚI (trang lịch sử)

const DARK_MODE_KEY = "app_dark_mode";

// ========== GIAO DIỆN USER ==========
function UserLayout() {
  // (Giữ nguyên code)
  const location = useLocation();
  const showBannerPaths = ["/", "/products", "/about"];
  const showBanner = showBannerPaths.includes(location.pathname);

  return (
    <>
      <Header />
      {showBanner && <Banner />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<ProductsList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartProducts />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product" element={<Product />} />
        <Route path="/shoppingcart" element={<ShoppingCart />} />
        <Route path="/revieworder" element={<ReviewOrder />} />
        <Route path="/blog" element={<Blog />} /> 
        <Route path="/order-history" element={<OrderHistory />} /> {/* <-- THÊM MỚI (route cho trang lịch sử) */}
      </Routes>
      <ChatBubble />
      <LuckyWheel />
      <Footer />
    </>
  );
}

// ========== GIAO DIỆN ADMIN ==========
function AdminLayout() {
  // (Giữ nguyên code)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedMode !== null) {
      setIsDarkMode(savedMode === "true");
    }
  }, []);

  const handleToggleDarkMode = useCallback((newMode) => {
    setIsDarkMode(newMode);
    localStorage.setItem(DARK_MODE_KEY, newMode.toString());
  }, []);

  const toggleSideMenu = () => setIsSideMenuOpen((prev) => !prev);

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <AppHeader
        toggleSideMenu={toggleSideMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <div className="SideMenuAndPageContent">
        <SideMenu
          isSideMenuOpen={isSideMenuOpen}
          toggleSideMenu={toggleSideMenu}
        />
        <PageContent />
      </div>
      <ChatBubble />
      <AppFooter />
      {isSideMenuOpen && (
        <div className="menu-overlay" onClick={toggleSideMenu} />
      )}
    </div>
  );
}

// ========== APP CHÍNH (ĐÃ CẬP NHẬT) ==========
function App() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 50, textAlign: "center", fontSize: 20 }}>
          Đang tải... (Loading...)
        </div>
      }
    >
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <OrderProvider> {/* Context (đếm count) CÓ SẴN */}
              <OrderHistoryProvider> {/* <-- THÊM MỚI (Context để lưu lịch sử) */}
                <Routes>
                  <Route path="/admin/*" element={<AdminLayout />} />
                  <Route path="/*" element={<UserLayout />} />
                </Routes>
              </OrderHistoryProvider> {/* <-- THÊM MỚI (Đóng) */}
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;