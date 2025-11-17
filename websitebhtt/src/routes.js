import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AppHeader from "./components/Header";
import AppFooter from "./components/Footer";
import ProductsList from "./pages/ProductsList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CartProducts from "./pages/CartProducts";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import ChatBubble from "./components/ChatBubble";
import Banner from "./components/Banner";
import Product from "./pages/Product";
import ShoppingCart from "./pages/ShoppingCart";
import ReviewOrder from "./pages/ReviewOrder";
import Dashboard from "./pages/Dashbaord";
import Inventory from "./pages/Inventory";
import Messages from "./pages/Messages";
import AdminHeader from "./components/AppHeader";
import AdminFooter from "./components/AdminFooter";

// ============ Layout người dùng ============
function UserLayout({ children }) {
  const location = useLocation();
  const showBanner =
    location.pathname === "/" ||
    location.pathname === "/products" ||
    location.pathname === "/about";

  return (
    <>
      <AppHeader />
      {showBanner && <Banner />}
      <main>{children}</main>
      <ChatBubble />
      <AppFooter />
    </>
  );
}

// ============ Layout admin ============
function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader />
      <main style={{ padding: "24px" }}>{children}</main>
      <AdminFooter />
    </>
  );
}

// ============ Định tuyến ============
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout người dùng */}
        <Route
          path="/*"
          element={
            <UserLayout>
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
              </Routes>
            </UserLayout>
          }
        />

        {/* Layout admin */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="products" element={<Inventory />} />
                <Route path="messages" element={<Messages />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
