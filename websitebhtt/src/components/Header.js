// Tên file: src/components/Header.js

import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Button,
  Badge,
  Input,
  message,
  Drawer,
  Divider,
  AutoComplete, // MỚI: Thêm AutoComplete
} from "antd";
import {
  UserOutlined,
  DownOutlined,
  LoginOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo2.jpg";
import "../App.css";
import React, { useState, useEffect } from "react"; // MỚI: Thêm useEffect
import Categories from "../pages/Categories";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { searchProducts } from "../data/productService"; // MỚI: Import hàm search
import "../style/Header.css";

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // MỚI: State cho gợi ý và giá trị debounce
  const [options, setOptions] = useState([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  const { cartItems } = useCart();
  const { isLoggedIn, logout, currentUser } = useAuth();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // MỚI: Effect (1) để debounce giá trị tìm kiếm
  // Chỉ cập nhật giá trị debounce sau 300ms người dùng ngừng gõ
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => {
      clearTimeout(timerId); // Cleanup timeout
    };
  }, [searchValue]);

  // MỚI: Effect (2) để gọi API khi giá trị debounce thay đổi
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchValue) {
        try {
          const products = await searchProducts(debouncedSearchValue);
          const formattedOptions = products.map((product) => ({
            value: product.title, // Giá trị sẽ điền vào input
            label: (
              // JSX hiển thị trong dropdown
              <div style={{ display: "flex", alignItems: "center", padding: "5px 0" }}>
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  style={{ width: 40, height: 40, marginRight: 10, objectFit: "cover" }}
                />
                <span>{product.title} - ${product.price}</span>
              </div>
            ),
            key: product.id, // Lưu ID sản phẩm để điều hướng
            data: product, // Đính kèm toàn bộ object sản phẩm để dễ điều hướng với location.state
          }));
          setOptions(formattedOptions);
        } catch (error) {
          console.error("Lỗi khi tìm gợi ý:", error);
          setOptions([]);
        }
      } else {
        setOptions([]); // Xóa gợi ý nếu input rỗng
      }
    };

    fetchSuggestions();
  }, [debouncedSearchValue]); // Chỉ chạy khi giá trị debounce thay đổi

  // Hàm này xử lý khi nhấn Enter hoặc nút Search (GIỮ NGUYÊN)
  const handleSearch = (val) => {
    const q = (val || searchValue || "").trim();
    if (!q) {
      navigate("/products");
    } else {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
    setOptions([]); // Ẩn gợi ý
  };

  const handleDrawerSearch = (val) => {
    handleSearch(val);
    closeDrawer();
  };

  const handleLogout = () => {
    logout();
    message.success("Bạn đã đăng xuất.");
    navigate("/login");
  };

  // MỚI: Hàm xử lý khi chọn một mục từ gợi ý
  const onSelectSuggestion = (value, option) => {
    // option có thể chứa trường `data` (product) do chúng ta gán khi tạo options
    // nếu có, dùng product đó và truyền qua location.state để `ProductDetail` nhận được
    const selectedProduct = (option && option.data) || options.find((o) => o.value === value)?.data;

    if (selectedProduct) {
      // Ứng với route ở App.js: /product/:id
      navigate(`/product/${selectedProduct.id}`, { state: selectedProduct });
    } else if (option && option.key) {
      // Fallback: chỉ điều hướng theo id nếu product object không có
      navigate(`/product/${option.key}`);
    } else {
      // Nếu không rõ, chuyển về trang products
      navigate('/products');
    }

    setSearchValue(value); // Cập nhật giá trị input
    setOptions([]); // Ẩn gợi ý
  };

  // ... (menuItems, userMenu, showDrawer, closeDrawer, handleDrawerNavigate giữ nguyên) ...
  // Menu cho desktop
// Menu cho desktop
  const menuItems = [
    { key: "home", label: "Trang Chủ", onClick: () => navigate("/") },
    {
      key: "product",
      // SỬA: Label giờ chỉ còn là văn bản
      label: "Sản Phẩm", 
      
      // SỬA: Chuyển các sự kiện ra ngoài làm thuộc tính của Menu.Item
      onClick: () => navigate("/products"),
      onMouseEnter: () => setShowCategories(true),
      onMouseLeave: () => setShowCategories(false),
    },
    { key: "about", label: "Giới Thiệu", onClick: () => navigate("/about") },
    { key: "contact", label: "Liên Hệ", onClick: () => navigate("/contact") },
    { key: "blog", label: "Blog", onClick: () => navigate("/blog") },
  
    
  ];

  // Dropdown cho user (dùng chung)
  const userMenu = {
    items: [
      { key: "1", label: "Hồ Sơ", onClick: () => navigate("/profile") },
      { key: "2", label: "Đăng xuất", onClick: handleLogout },
      { key: "3", label: "Lịch sử mua sắm", onClick: () => navigate("/order-history") },
    ],
  };

  // Hàm xử lý đóng/mở Drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Hàm xử lý điều hướng từ Drawer (để đóng Drawer sau khi click)
  const handleDrawerNavigate = (path) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <>
      <Header>
        {/* --- LOGO --- */}
        <div className="header-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" />
        </div>

        {/* --- MENU DESKTOP --- */}
        <div className="desktop-menu-container">
          <Menu mode="horizontal" items={menuItems} />
        </div>

        {/* --- RIGHT SIDE DESKTOP --- */}
        <div className="header-right-desktop">
          
          {/* MỚI: Bọc Input.Search bằng AutoComplete */}
          <AutoComplete
            options={options} // Danh sách gợi ý
            style={{ width: 220 }} // match CSS width to avoid pushing layout
            onSelect={onSelectSuggestion} // Khi chọn gợi ý
            onChange={setSearchValue} // Khi gõ chữ
            value={searchValue} // Giá trị đang gõ
            popupClassName="search-autocomplete-popup" // Class để CSS nếu cần
          >
            <Input.Search
              placeholder="Tìm sản phẩm..."
              allowClear
              onSearch={handleSearch} // Xử lý khi nhấn Enter/nút Search
              className="header-search"
              enterButton
            />
          </AutoComplete>
          
          <Badge
            count={totalItems}
            showZero
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/cart")}
            className="header-cart-badge"
          >
            <ShoppingCartOutlined style={{ fontSize: "24px" }} />
          </Badge>

          <Dropdown menu={userMenu} trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                src={isLoggedIn && currentUser ? currentUser.image : null}
                icon={<UserOutlined />}
              />
              <DownOutlined />
            </Space>
          </Dropdown>

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              type="primary"
              icon={<LogoutOutlined />}
            >
              Đăng xuất
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              type="primary"
              icon={<LoginOutlined />}
            >
              Đăng nhập
            </Button>
          )}
        </div>

        {/* --- CATEGORIES DROPDOWN (DESKTOP) --- */}
        <div className="desktop-categories-dropdown">
          {showCategories && (
            <div
              className="categories-full-width-dropdown"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Categories />
            </div>
          )}
        </div>

        {/* --- BURGER ICON MOBILE --- */}
        <Button
          className="mobile-burger"
          type="primary"
          icon={<MenuOutlined />}
          onClick={showDrawer}
        />
      </Header>

      {/* --- DRAWER CHO MOBILE --- */}
      {/* Lưu ý: Chức năng gợi ý chưa được thêm cho thanh search trong Drawer */}
      {/* Bạn có thể áp dụng logic tương tự nếu muốn */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '12px 16px' }}>
          <Input.Search 
            placeholder="Tìm sản phẩm..." 
            allowClear 
            onSearch={handleDrawerSearch} 
            className="drawer-search" 
          />
        </div>
        <Menu mode="vertical" style={{ borderRight: 0 }}>
          <Menu.Item key="home" onClick={() => handleDrawerNavigate("/")}>
            Trang Chủ
          </Menu.Item>
          <Menu.Item key="product" onClick={() => handleDrawerNavigate("/products")}>
            Sản Phẩm
          </Menu.Item>
          <Menu.Item key="about" onClick={() => handleDrawerNavigate("/about")}>
            Giới Thiệu
          </Menu.Item>
          <Menu.Item key="contact" onClick={() => handleDrawerNavigate("/contact")}>
            Liên Hệ
          </Menu.Item>
          <Menu.Item key="blog" onClick={() => handleDrawerNavigate("/blog")}>
            Blog
          </Menu.Item>
        </Menu>
        
        <Divider style={{ margin: "16px 0" }} />

        <Space direction="vertical" style={{ width: "100%", padding: "0 24px" }}>
          <Button
            icon={<ShoppingCartOutlined />}
            onClick={() => handleDrawerNavigate("/cart")}
            block
          >
            Giỏ hàng ({totalItems})
          </Button>

          {isLoggedIn ? (
            <>
              <Button
                icon={<UserOutlined />}
                onClick={() => handleDrawerNavigate("/profile")}
                block
              >
                Hồ Sơ ({currentUser?.username || "User"})
              </Button>
              <Button
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout();
                  closeDrawer();
                }}
                type="primary"
                danger
                block
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button
              icon={<LoginOutlined />}
              onClick={() => handleDrawerNavigate("/login")}
              type="primary"
              block
            >
              Đăng nhập
            </Button>
          )}
        </Space>
      </Drawer>
    </>
  );
};

export default AppHeader;