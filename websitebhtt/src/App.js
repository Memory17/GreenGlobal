// App.js
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import "./i18n";
import "antd/dist/reset.css"; // cần cho Ant Design v5

// --- IMPORT CONTEXT ---
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext"; // Context (đếm count) CÓ SẴN
import { OrderHistoryProvider } from "./context/OrderHistoryContext"; // <-- THÊM MỚI (để lưu lịch sử)
import { Web3Provider } from "./context/Web3Context"; // <-- THÊM: Web3/MetaMask Context
import { ThemeProvider } from "./context/ThemeContext"; // <-- THÊM: Theme Context
import { CompareProvider } from "./context/CompareContext"; // <-- THÊM: Compare Context
import { WishlistProvider } from "./context/WishlistContext"; // <-- THÊM: Wishlist Context

// 🏠 --- USER COMPONENTS ---
// (import Header, Footer, ... giữ nguyên)
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBubble from "./components/ChatBubble";
import LuckyWheel from "./components/LuckyWheel";
import Banner from "./components/Banner";
import CompareFloatingBar from "./components/CompareFloatingBar"; // <-- THÊM: Compare Floating Bar

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
import ForgotPassword from "./pages/ForgotPassword"; // <-- THÊM: Forgot Password Page
import Profile from "./pages/Profile";
import CartProducts from "./pages/CartProducts";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Product from "./pages/Product";
import ShoppingCart from "./pages/ShoppingCart";
import ReviewOrder from "./pages/ReviewOrder";
import Blog from "./pages/Blog";
import OrderHistory from "./pages/OrderHistory/OrderHistory"; // <-- THÊM MỚI (trang lịch sử)
import TermsAndPolicies from "./pages/TermsAndPolicies/TermsAndPolicies";
import VipPackages from "./pages/VipPackages/VipPackages";
import CompareProducts from "./pages/CompareProducts"; // <-- THÊM: Compare Page
import Wishlist from "./pages/Wishlist"; // <-- THÊM: Wishlist Page


const ADMIN_DARK_MODE_KEY = "admin_dark_mode"; // Key riêng cho Admin

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
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <-- THÊM: Route Forgot Password */}
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
        <Route path="/terms-and-policies" element={<TermsAndPolicies />} />
        <Route path="/vip-packages" element={<VipPackages />} />
        <Route path="/compare" element={<CompareProducts />} /> {/* <-- THÊM: Route so sánh */}
        <Route path="/wishlist" element={<Wishlist />} /> {/* <-- THÊM: Route Wishlist */}
      </Routes>
      <ChatBubble />
      <LuckyWheel />
      <CompareFloatingBar /> {/* <-- THÊM: Thanh so sánh nổi */}
      <Footer />
    </>
  );
}

// ========== GIAO DIỆN ADMIN ==========
function AdminLayout() {
  // (Giữ nguyên code)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(ADMIN_DARK_MODE_KEY);
    if (savedMode !== null) {
      setIsDarkMode(savedMode === "true");
    }
  }, []);

  const handleToggleDarkMode = useCallback((newMode) => {
    setIsDarkMode(newMode);
    localStorage.setItem(ADMIN_DARK_MODE_KEY, newMode.toString());
  }, []);

  const toggleSideMenu = () => setIsSideMenuOpen((prev) => !prev);
  const toggleCollapse = () => setIsSideMenuCollapsed((prev) => !prev);

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <AppHeader
        toggleSideMenu={toggleSideMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <div className={`SideMenuAndPageContent ${isSideMenuOpen ? 'mobile-open' : ''} ${isSideMenuCollapsed ? 'collapsed' : ''}`}>
        <SideMenu
          isSideMenuOpen={isSideMenuOpen}
          toggleSideMenu={toggleSideMenu}
          collapsed={isSideMenuCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <PageContent />
      </div>
      <AppFooter />
      <div className={`menu-overlay ${isSideMenuOpen ? 'open' : ''}`} onClick={toggleSideMenu} />
    </div>
  );
}

// ========== Admin Guard ==========
function RequireAdminAuth({ children }) {
  const { isLoggedIn, currentUser } = useAuth();
  const location = useLocation();
  // Redirect to /login if not authenticated or not admin
  if (!isLoggedIn || currentUser?.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'admin_required' }} />;
  }
  return children;
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
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <OrderProvider> {/* Context (đếm count) CÓ SẴN */}
                <OrderHistoryProvider> {/* <-- THÊM MỚI (Context để lưu lịch sử) */}
                  <Web3Provider> {/* <-- THÊM: Web3/MetaMask Provider */}
                    <CompareProvider> {/* <-- THÊM: Compare Provider */}
                      <WishlistProvider> {/* <-- THÊM: Wishlist Provider */}
                        <Routes>
                          <Route
                            path="/admin/*"
                            element={
                              <RequireAdminAuth>
                                <AdminLayout />
                              </RequireAdminAuth>
                            }
                          />
                          <Route path="/*" element={<UserLayout />} />
                        </Routes>
                      </WishlistProvider> {/* <-- THÊM: Đóng WishlistProvider */}
                    </CompareProvider> {/* <-- THÊM: Đóng CompareProvider */}
                  </Web3Provider> {/* <-- THÊM: Đóng Web3Provider */}
                </OrderHistoryProvider> {/* <-- THÊM MỚI (Đóng) */}
              </OrderProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;