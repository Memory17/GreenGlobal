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
  List, 
  Typography,
  Popover, // MỚI: Thêm Popover
} from "antd";
import {
  UserOutlined,
  DownOutlined,
  LoginOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined, // ⭐️ THÊM: Icon chuông
  SearchOutlined,
  ArrowRightOutlined, // MỚI: Icon mũi tên
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom"; // MỚI: Thêm useLocation
import logo from "../assets/images/logo2.jpg";
import "../App.css";
import React, { useState, useEffect, useCallback } from "react"; // MỚI: Thêm useEffect
import Categories from "../pages/Categories";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { searchProducts } from "../data/productService"; // MỚI: Import hàm search
import "../style/Header.css";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation(); // MỚI: Hook location
  const [showCategories, setShowCategories] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // MỚI: State cho gợi ý và giá trị debounce
  // ⭐️ BẮT ĐẦU: State cho thông báo
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // ⭐️ KẾT THÚC: State cho thông báo

  // ⭐️ MỚI: State cho nhắc nhở giỏ hàng
  const [cartPopoverOpen, setCartPopoverOpen] = useState(false);

  const [options, setOptions] = useState([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  const { cartItems } = useCart();
  const { isLoggedIn, logout, currentUser } = useAuth();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // ⭐️ MỚI: Effect nhắc nhở giỏ hàng bị bỏ quên
  useEffect(() => {
    let showTimer;
    let hideTimer;

    // Chỉ hiện nhắc nhở nếu có sản phẩm và không ở trang giỏ hàng/thanh toán
    if (totalItems > 0 && location.pathname !== '/cart' && location.pathname !== '/checkout') {
      // Yêu cầu: Vào trang 5-7 giây mới hiện
      showTimer = setTimeout(() => {
        setCartPopoverOpen(true);
        
        // Hiện xong thì 7 giây sau tự tắt (để không che màn hình mãi)
        hideTimer = setTimeout(() => {
          setCartPopoverOpen(false);
        }, 7000);
      }, 5000); // Đợi 5 giây
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      setCartPopoverOpen(false); // Reset trạng thái khi rời trang hoặc dependencies thay đổi
    };
  }, [totalItems, location.pathname]); // Chạy khi số lượng item thay đổi hoặc chuyển trang

  // ⭐️ BẮT ĐẦU: Logic tải và quản lý thông báo
  const loadUserNotifications = useCallback(() => {
      if (!currentUser) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
  
      const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';
      const NOTIFICATION_READ_KEY = `user_notifications_read_${currentUser.username || currentUser.email}`;
  
      const storedReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      const allReviews = storedReviews ? JSON.parse(storedReviews) : [];
  
      const lastReadTimestamp = localStorage.getItem(NOTIFICATION_READ_KEY) || 0;
  
      const userNotifications = allReviews
        .filter(review => (review.user === currentUser.username || review.user === currentUser.email) && Array.isArray(review.adminReplies))
        .flatMap(review => 
          review.adminReplies
            // ⭐️ SỬA: Lọc bỏ các phản hồi do chính người dùng tạo ra
            .filter(reply => reply.user !== (currentUser.username || currentUser.email))
            .map(reply => ({
              ...reply,
              productTitle: review.productTitle,
              productImage: review.productImage,
              productId: review.productId,
              reviewId: review.id,
              isNew: new Date(reply.date).getTime() > lastReadTimestamp,
            }))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp mới nhất lên đầu
  
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => n.isNew).length);
    }, [currentUser]);

  useEffect(() => {
    loadUserNotifications();

    const handleReviewUpdate = () => {
      loadUserNotifications();
    };

    window.addEventListener('reviews_updated', handleReviewUpdate);
    return () => window.removeEventListener('reviews_updated', handleReviewUpdate);
  }, [currentUser, loadUserNotifications]);

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setUnreadCount(0);
    // Chỉ cập nhật nếu có currentUser
    if (currentUser) {
      const NOTIFICATION_READ_KEY = `user_notifications_read_${currentUser.username || currentUser.email}`;
      localStorage.setItem(NOTIFICATION_READ_KEY, new Date().getTime());
    }
  };
  // ⭐️ KẾT THÚC: Logic tải và quản lý thông báo

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
          
          {/* --- PHẦN THANH TÌM KIẾM MỚI (MODERN UI) --- */}
<div className="modern-search-wrapper">
  <AutoComplete
    options={options}
    onSelect={onSelectSuggestion}
    onChange={setSearchValue}
    value={searchValue}
    popupClassName="modern-search-dropdown" // Class CSS cho menu gợi ý
    style={{ width: "100%", bottom:"5px" }}
    backfill
  >
    <Input
      className="modern-search-input"
      placeholder="Tìm kiếm sản phẩm..."
      // Icon kính lúp nằm bên trái
      
      // Nút tìm kiếm tùy chỉnh nằm bên phải
      suffix={
        <div 
          className="search-btn-custom"
          onClick={() => handleSearch(searchValue)}
        >
          <SearchOutlined /> 
        </div>
      }
      allowClear
      onPressEnter={(e) => handleSearch(e.target.value)} // Giữ logic Enter
    />
  </AutoComplete>
</div>
{/* --- HẾT PHẦN TÌM KIẾM --- */}
          
          {/* ⭐️ THÊM: Icon chuông thông báo */}
          {isLoggedIn && (
            <Badge count={unreadCount} style={{ cursor: "pointer" }} onClick={handleOpenNotifications}>
              <BellOutlined
                style={{ fontSize: "24px", color: "black", cursor: "pointer" }}
                onClick={handleOpenNotifications}
                className="header-notification-icon"
              />
            </Badge>
          )}

          <Popover
            content={
              <div style={{ maxWidth: '320px', padding: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ 
                      backgroundColor: '#fff1f0', 
                      padding: '12px', 
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(255, 77, 79, 0.15)'
                  }}>
                    <ShoppingCartOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px', color: '#262626' }}>
                      Đừng quên giỏ hàng!
                    </Text>
                    <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Bạn đang có <Text strong type="danger" style={{ fontSize: '15px' }}>{totalItems}</Text> sản phẩm đang chờ thanh toán.
                    </Text>
                  </div>
                </div>
                
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '42px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    setCartPopoverOpen(false);
                    navigate("/cart");
                  }}
                >
                  Thanh toán ngay
                </Button>
              </div>
            }
            title={null}
            trigger="hover"
            open={cartPopoverOpen && totalItems > 0}
            onOpenChange={(visible) => {
              if (totalItems > 0) {
                setCartPopoverOpen(visible);
              }
            }}
            placement="bottomRight"
            overlayStyle={{ paddingTop: '8px' }}
          >
            <Badge
              count={totalItems}
              showZero
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/cart")}
              className="header-cart-badge"
            >
              <ShoppingCartOutlined style={{ fontSize: "24px" }} />
            </Badge>
          </Popover>

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
              className="header-logout-btn" // THÊM MỚI
            >
              Đăng xuất
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              type="primary"
              icon={<LoginOutlined />}
              className="header-login-btn" // THÊM MỚI
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

      {/* ⭐️ THÊM: Drawer hiển thị thông báo */}
      <Drawer
        title={`Thông báo (${notifications.length})`}
        placement="right"
        onClose={() => setIsNotificationsOpen(false)}
        open={isNotificationsOpen}
        width={400}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          locale={{ emptyText: "Bạn chưa có thông báo nào." }}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: item.isNew ? '#e6f7ff' : 'transparent',
                borderLeft: item.isNew ? '3px solid #1890ff' : 'none',
                padding: '12px 16px',
                transition: 'background-color 0.3s'
              }}
              onClick={() => {
                navigate(`/product/${item.productId}`, { state: { reviewToFocus: item.reviewId } });
                setIsNotificationsOpen(false);
              }}
            >
              <List.Item.Meta
                avatar={<Avatar src="https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" />}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Admin đã trả lời bạn</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                }
                description={
                  <>
                    <Text>về đánh giá cho sản phẩm <b>{item.productTitle}</b></Text>
                    <p style={{ fontStyle: 'italic', marginTop: 4, color: '#555' }}>
                      "{item.comment}"
                    </p>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

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