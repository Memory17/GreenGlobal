// src/pages/Profile.js

import React, { useEffect, useState } from "react";
import "../style/Profile.css";
import {
  Typography,
  Button,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Avatar,
  Divider,
  message,
  Upload,
  Modal,
  Select, // <-- THÊM IMPORT SELECT
  Tabs,

  ColorPicker,
  Switch,
  Table, // <-- THÊM IMPORT TABLE
  Tag,   // <-- THÊM IMPORT TAG

} from "antd";
import {
  EditOutlined,
  CameraOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined, // <-- THÊM
  StarFilled,       // <-- THÊM
  LikeOutlined,     // <-- THÊM
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  BgColorsOutlined,

} from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext"; // <-- THÊM IMPORT THEME
import dayjs from "dayjs";
// Đưa tất cả các import lên trên cùng
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAuth } from "../context/AuthContext"; // <-- THÊM IMPORT AUTH
import { useOrderHistory } from "../context/OrderHistoryContext"; // <-- THÊM IMPORT ORDER HISTORY
import { getAllCoupons } from "../data/discountServiceUser"; // <-- THÊM IMPORT COUPONS
import { changePassword } from "../data/authService"; // <-- THÊM IMPORT CHANGE PASSWORD
import { useNavigate } from "react-router-dom";
import BankLinkModal from "../components/BankLinkModal"; // Import BankLinkModal
import { Statistic, Card, Image, Empty} from "antd"; // <-- THÊM IMPORT STATISTIC, CARD, IMAGE, EMPTY, RATE
import { ShoppingOutlined, GiftOutlined, TagsOutlined, HeartOutlined } from "@ant-design/icons"; // <-- THÊM ICONS
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2'; // <-- THÊM IMPORT BAR

// === CẤU HÌNH CHARTJS ===
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle
);
// ========================

// === CẤU HÌNH DAYJS SAU CÁC IMPORT ===
dayjs.extend(customParseFormat);
// ===================================

const { Title, Text } = Typography;

// --- BỘ LƯU TRỮ PROFILE LOCAL (GIỮ NGUYÊN) ---
const PROFILES_STORAGE_KEY = 'user_profiles';

const getAllProfiles = () => {
  const profiles = localStorage.getItem(PROFILES_STORAGE_KEY);
  return profiles ? JSON.parse(profiles) : {};
};

const getProfileByUsername = (username) => {
  if (!username) return null;
  const allProfiles = getAllProfiles();
  return allProfiles[username] || null;
};

const saveProfileByUsername = (username, data) => {
  if (!username) return;
  const allProfiles = getAllProfiles();

  const oldProfile = allProfiles[username] || {};
  allProfiles[username] = { ...oldProfile, ...data };

  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
};
// --- KẾT THÚC BỘ LƯU TRỮ (GIỮ NGUYÊN) ---


const Profile = () => {
  const [form] = Form.useForm();
  // === THAY ĐỔI: Lấy thêm updateUser từ context ===
  const { currentUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [avatarSrc, setAvatarSrc] = useState(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false); // State for Bank Modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // State for Stats Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for Settings Modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false); // State for Change Password Modal
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false); // State for Login History Modal
  const [passwordForm] = Form.useForm();

  const { isDarkMode, toggleDarkMode, accentColor, changeAccentColor, fontSize, changeFontSize } = useTheme();

  // === DUMMY DATA FOR LOGIN HISTORY ===
  const loginHistoryData = [
    {
      key: '1',
      device: 'Windows PC - Chrome',
      location: 'Ho Chi Minh City, Vietnam',
      time: 'Vừa xong',
      status: 'Thành công',
      ip: '192.168.1.1'
    },
    {
      key: '2',
      device: 'iPhone 14 Pro - Safari',
      location: 'Da Nang, Vietnam',
      time: '2 giờ trước',
      status: 'Thành công',
      ip: '14.161.22.10'
    },
    {
      key: '3',
      device: 'MacBook Pro - Chrome',
      location: 'Hanoi, Vietnam',
      time: '1 ngày trước',
      status: 'Thành công',
      ip: '113.160.12.5'
    },
    {
      key: '4',
      device: 'Unknown Device',
      location: 'Unknown',
      time: '3 ngày trước',
      status: 'Thất bại',
      ip: '10.0.0.1'
    },
  ];

  const loginHistoryColumns = [
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'], // Hide on small screens
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Thành công' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
  ];

  // === THỐNG KÊ NHANH ===
  const { orderHistory } = useOrderHistory();
  const [voucherCount, setVoucherCount] = useState(0);

  // === CHANGE PASSWORD LOGIC ===
  const handleChangePassword = async (values) => {
    try {
      message.loading({ content: 'Đang xử lý...', key: 'changePass' });
      
      // Gọi hàm changePassword từ authService
      await changePassword(currentUser.username, values.oldPassword, values.newPassword);
      
      message.success({ content: 'Đổi mật khẩu thành công! Mật khẩu mới sẽ được áp dụng cho lần đăng nhập sau.', key: 'changePass' });
      setIsChangePasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error({ content: error.message || 'Đổi mật khẩu thất bại.', key: 'changePass' });
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const coupons = await getAllCoupons();
        setVoucherCount(coupons ? coupons.length : 0);
      } catch (error) {
        console.log("Error fetching coupons", error);
      }
    };
    fetchCoupons();
  }, []);

  const pendingOrdersCount = orderHistory ? orderHistory.filter(order => 
    order.status === 'Pending' || order.status === 'pending' || order.status === 'Đang chờ'
  ).length : 0;

  const points = currentUser?.points || 0;
  const wishlistCount = currentUser?.wishlist?.length || 0;

  // === SHOPPING INSIGHTS LOGIC ===
  // Filter valid orders (not cancelled)
  const validOrders = orderHistory?.filter(o => o.status !== 'Cancelled' && o.status !== 'Đã hủy') || [];

  // 1. Spending by Category
  const categorySpending = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      const cat = item.product?.category || 'Khác';
      const cost = (item.product?.price || 0) * (item.quantity || 1);
      categorySpending[cat] = (categorySpending[cat] || 0) + cost;
    });
  });

  const chartData = {
    labels: Object.keys(categorySpending),
    datasets: [
      {
        label: 'Chi tiêu (VNĐ)',
        data: Object.values(categorySpending),
        backgroundColor: [
          '#1890ff', // Blue
          '#52c41a', // Green
          '#faad14', // Gold
          '#ff4d4f', // Red
          '#722ed1', // Purple
          '#13c2c2', // Cyan
          '#eb2f96', // Magenta
          '#2f54eb', // Geek Blue
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // 2. Fun Facts
  const totalProductsBought = validOrders.reduce((acc, order) => 
    acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0
  );

  const mostExpensiveOrder = validOrders.reduce((max, order) => 
    (order.totals?.total > (max?.totals?.total || 0)) ? order : max
  , null);

  // Favorite Product
  const productCounts = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      const name = item.product?.title || 'Sản phẩm';
      productCounts[name] = (productCounts[name] || 0) + item.quantity;
    });
  });
  const favoriteProductEntry = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
  const favoriteProduct = favoriteProductEntry ? favoriteProductEntry[0] : "Chưa có";

  // === REVIEW STATISTICS (THỐNG KÊ ĐÁNH GIÁ) ===
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    totalLikes: 0,
    images: []
  });

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchReviews = () => {
      try {
        const storedReviews = localStorage.getItem('app_reviews_v1');
        if (storedReviews) {
          const allReviews = JSON.parse(storedReviews);
          // Lọc đánh giá của user hiện tại (dựa trên username)
          // Lưu ý: Cần đảm bảo logic lưu review lưu đúng username
          const userReviews = allReviews.filter(r => r.user === currentUser.username);
          
          const totalReviews = userReviews.length;
          const totalRating = userReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
          // Giả sử có trường 'likes' trong review, nếu chưa có thì mặc định 0 hoặc random để demo
          const totalLikes = userReviews.reduce((acc, r) => acc + (r.likes || 0), 0); 
          
          // Gom tất cả hình ảnh từ các review
          const images = userReviews.reduce((acc, r) => {
             if (r.images && Array.isArray(r.images)) {
               return [...acc, ...r.images];
             }
             return acc;
          }, []);

          setReviewStats({
            totalReviews,
            avgRating,
            totalLikes,
            images
          });
        }
      } catch (error) {
        console.error("Error loading reviews", error);
      }
    };
    
    if (isStatsModalOpen) {
        fetchReviews();
    }
  }, [currentUser, isStatsModalOpen]);

  // === MONTHLY SPENDING CHART LOGIC ===
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get available years from orders
  const availableYears = [...new Set(validOrders.map(order => new Date(order.orderDate).getFullYear()))].sort((a, b) => b - a);
  // Ensure current year is in the list if not present (e.g. no orders yet)
  if (availableYears.length === 0 || !availableYears.includes(new Date().getFullYear())) {
     if (!availableYears.includes(new Date().getFullYear())) {
        availableYears.unshift(new Date().getFullYear());
     }
  }

  // Calculate monthly spending for selected year
  const monthlySpending = Array(12).fill(0);
  const monthlyOrderCounts = Array(12).fill(0);

  validOrders.forEach(order => {
    const date = new Date(order.orderDate);
    if (date.getFullYear() === selectedYear) {
      const month = date.getMonth(); // 0-11
      monthlySpending[month] += (order.totals?.total || 0);
      monthlyOrderCounts[month] += 1;
    }
  });

  const barChartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        label: 'Chi tiêu (VNĐ)',
        data: monthlySpending,
        backgroundColor: monthlySpending.map((val, index) => {
            const currentMonth = new Date().getMonth();
            const isCurrentMonth = index === currentMonth && selectedYear === new Date().getFullYear();
            const isMax = val === Math.max(...monthlySpending) && val > 0;
            
            if (isCurrentMonth) return '#1890ff'; // Blue for current month
            if (isMax) return '#ff4d4f'; // Red for max spending
            return 'rgba(24, 144, 255, 0.3)'; // Lighter blue for others
        }),
        borderColor: monthlySpending.map((val, index) => {
            const currentMonth = new Date().getMonth();
            const isCurrentMonth = index === currentMonth && selectedYear === new Date().getFullYear();
            const isMax = val === Math.max(...monthlySpending) && val > 0;
            
            if (isCurrentMonth) return '#096dd9';
            if (isMax) return '#cf1322';
            return '#1890ff';
        }),
        borderWidth: 1,
        borderRadius: 6, // Rounded corners
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      title: {
        display: false, // We use custom title in JSX
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const count = monthlyOrderCounts[context.dataIndex];
            return [`💰 Chi tiêu: ${value.toLocaleString()} đ`, `📦 Số đơn hàng: ${count}`];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x grid
        },
        ticks: {
          font: { size: 11 },
          color: '#999' // Neutral color for visibility in both modes
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e0e0e0', // Slightly visible grid
          borderDash: [5, 5],
        },
        ticks: {
          callback: (value) => value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value.toLocaleString(),
          font: { size: 11 },
          color: '#999' // Neutral color
        },
        border: {
          display: false // Hide y axis line
        }
      }
    }
  };
  // ===============================

  // 4. TẢI DỮ LIỆU (GIỮ NGUYÊN LOGIC)
  useEffect(() => {
    if (!form || !currentUser) return;

    const username = currentUser.username;
    // Thử lấy profile đã chỉnh sửa từ "user_profiles"
    const localProfile = getProfileByUsername(username);

    const apiAddress = currentUser.address?.address || '';
    const apiBirthDate = currentUser.birthDate || null;
    // Lấy avatar từ "userData" (có thể là API hoặc là cái đã được updateUser)
    const apiImage = currentUser.image || null;

    let initialValues;
    let currentAvatarSrc;


    if (localProfile) {
      // 4a. TẢI TỪ LOCALSTORAGE ("user_profiles")
      initialValues = {
        ...localProfile,
        birth: localProfile.birth ? dayjs(localProfile.birth, "YYYY-MM-DD") : null,
      };
      // Ưu tiên avatar từ "user_profiles"
      currentAvatarSrc = localProfile.avatar || apiImage || null;

    } else {
      // 4b. TẢI TỪ API/MẶC ĐỊNH ("userData")
      initialValues = {
        name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username,
        email: currentUser.email,
        firstname: currentUser.firstName || '',
        lastname: currentUser.lastName || '',
        phone: currentUser.phone || '',
        birth: apiBirthDate ? dayjs(apiBirthDate) : null,
        address: apiAddress,
        'citizen identification card': null,
      };
      // Dùng avatar từ "userData"
      currentAvatarSrc = apiImage;
    }

    form.setFieldsValue(initialValues);
    setAvatarSrc(currentAvatarSrc);

  }, [currentUser, form]);

  // 5. LƯU DỮ LIỆU VĂN BẢN (Text)
  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error("Lỗi: Không tìm thấy người dùng!");
      return;
    }

    const username = currentUser.username;

    const dataToSave = {
      ...values,
      // Lưu ngày sinh dưới dạng YYYY-MM-DD
      birth: values.birth ? values.birth.format("YYYY-MM-DD") : null, 
      // Cập nhật lại 'name' để hiển thị trên form
      name: `${values.firstname || ''} ${values.lastname || ''}`.trim() || username
    };

    try {
      // 1. Lưu vào "user_profiles"
      saveProfileByUsername(username, dataToSave);

      // 2. Đồng bộ hóa với "userData" qua context
      updateUser(dataToSave);

      message.success("Cập nhật thông tin thành công!");

      // Cập nhật lại tên trên form
      form.setFieldsValue({ name: dataToSave.name });

    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      message.error("Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  // Helper function to compress image
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; // Resize to max 300px width
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 6. HÀM XỬ LÝ UPLOAD AVATAR
  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    if (!currentUser) {
      message.error("Vui lòng đăng nhập để thực hiện chức năng này!");
      onError("User not logged in");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      message.error('Bạn chỉ có thể tải lên file ảnh!');
      onError("Invalid file type");
      return;
    }

    try {
      // Compress the image before saving
      const compressedBase64 = await compressImage(file);

      // 1. Lưu vào "user_profiles" với key là 'avatar'
      saveProfileByUsername(currentUser.username, { avatar: compressedBase64 });

      // 2. Đồng bộ hóa với "userData" (dùng key 'image' cho nhất quán)
      updateUser({ image: compressedBase64 });

      setAvatarSrc(compressedBase64); // Cập nhật UI ngay lập tức
      message.success("Cập nhật ảnh đại diện thành công!");
      onSuccess("ok");
    } catch (error) {
      console.error("Lỗi khi lưu ảnh đại diện:", error);
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        message.error("Bộ nhớ trình duyệt đầy. Vui lòng xóa bớt dữ liệu duyệt web hoặc thử ảnh khác.");
      } else {
        message.error("Lỗi khi xử lý ảnh: " + (error.message || "Lỗi không xác định"));
      }
      onError(error);
    }
  };

  // HÀM LOGOUT (GIỮ NGUYÊN)
  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất");
    // (Bạn có thể thêm navigate("/") hoặc navigate("/login") ở đây nếu muốn)
  };

  // === SETTINGS MODAL CONTENT ===
  const settingsItems = [
    {
      key: '1',
      label: (<span className="setting-tab-label"><BgColorsOutlined /> Giao diện</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">Tùy chỉnh Giao diện</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Chế độ Tối (Dark Mode)</div>
              <div className="setting-desc">Chuyển đổi giao diện tối để bảo vệ mắt</div>
            </div>
            <div className="setting-action">
              <Switch checked={isDarkMode} onChange={toggleDarkMode} />
            </div>
          </div>
          
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Màu chủ đạo</div>
              <div className="setting-desc">Chọn màu sắc nhấn cho giao diện</div>
            </div>
            <div className="setting-action">
              <ColorPicker value={accentColor} onChange={(c) => changeAccentColor(c.toHexString())} showText />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Kích thước chữ</div>
              <div className="setting-desc">Điều chỉnh kích thước chữ hiển thị</div>
            </div>
            <div className="setting-action">
              <Select value={fontSize} onChange={changeFontSize} style={{ width: 120 }}>
                <Select.Option value="small">Nhỏ</Select.Option>
                <Select.Option value="medium">Mặc định</Select.Option>
                <Select.Option value="large">Lớn</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (<span className="setting-tab-label"><SecurityScanOutlined /> Bảo mật</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">Bảo mật & Đăng nhập</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Xác minh 2 bước (2FA)</div>
              <div className="setting-desc">Tăng cường bảo mật cho tài khoản</div>
            </div>
            <div className="setting-action">
              <Switch />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Đổi mật khẩu</div>
              <div className="setting-desc">Cập nhật mật khẩu mới thường xuyên</div>
            </div>
            <div className="setting-action">
              <Button type="primary" ghost onClick={() => setIsChangePasswordModalOpen(true)}>Đổi mật khẩu</Button>
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Lịch sử đăng nhập</div>
              <div className="setting-desc">Kiểm tra các thiết bị đã đăng nhập</div>
            </div>
            <div className="setting-action">
              <Button onClick={() => setIsLoginHistoryModalOpen(true)}>Xem lịch sử</Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (<span className="setting-tab-label"><BellOutlined /> Thông báo</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">Cài đặt Thông báo</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Email khuyến mãi</div>
              <div className="setting-desc">Nhận thông tin ưu đãi qua email</div>
            </div>
            <div className="setting-action">
              <Switch defaultChecked />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Thông báo đơn hàng</div>
              <div className="setting-desc">Cập nhật trạng thái đơn hàng</div>
            </div>
            <div className="setting-action">
              <Switch defaultChecked />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Thông báo đánh giá</div>
              <div className="setting-desc">Khi có phản hồi về đánh giá của bạn</div>
            </div>
            <div className="setting-action">
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (<span className="setting-tab-label"><SafetyCertificateOutlined /> Quyền riêng tư</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">Quyền riêng tư & Dữ liệu</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">Tải xuống dữ liệu</div>
              <div className="setting-desc">Nhận bản sao dữ liệu cá nhân của bạn</div>
            </div>
            <div className="setting-action">
              <Button>Yêu cầu xuất dữ liệu</Button>
            </div>
          </div>

          <div className="setting-item-card danger-zone">
            <div className="setting-info">
              <div className="setting-title danger-text">Xóa tài khoản</div>
              <div className="setting-desc">Hành động này không thể hoàn tác</div>
            </div>
            <div className="setting-action">
              <Button danger type="primary">Xóa tài khoản</Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // 7. RENDER COMPONENT (CHUYỂN SANG TIẾNG VIỆT)
  return (
    <div className="profile-page">
      <div className="profile-page-title">
        <Title className="title-profile" level={1}>
          XIN CHÀO, <span className="greeting-highlight">{currentUser ? currentUser.firstName || currentUser.username : "NGƯỜI DÙNG"}</span>
        </Title>
        <div className="text-profile">
          "Xin chào và chào mừng đến với trang web của chúng tôi! Chúng tôi rất vui được chia sẻ thế giới của mình với bạn, 
          để bạn khám phá mọi thứ chúng tôi đã xây dựng bằng <strong>đam mê</strong> và <strong>sự quan tâm</strong>."
        </div>
        <Button 
          className="edit-profile-button" 
          type="primary"
          onClick={() => setIsStatsModalOpen(true)}
        >
          Thống kê chi tiêu
        </Button>
      </div>
      <div className="page-content">
        <div className="profile-grid">
          {/* Form Cập nhật */}
          <div className="profile-form-card">
            <Row className="my-account-header">
              <Col className="my-account-title" span={12}>
                <Text strong>Tài Khoản Của Tôi</Text>
              </Col>
              <Col className="setting-button" span={12}>
                <Button type="primary" onClick={() => setIsSettingsModalOpen(true)}>Cài đặt</Button>
              </Col>
            </Row>

            {/* --- DASHBOARD SUMMARY (THỐNG KÊ NHANH) --- */}
            {/* ĐÃ CHUYỂN VÀO MODAL THỐNG KÊ */}
            {/* ------------------------------------------ */}

            <Title className="user-info-title" level={5}>
              THÔNG TIN NGƯỜI DÙNG
            </Title>
            <Form
              className="my-account-form"
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row className="username-email" gutter={32}>
                <Col className="username-col" span={12}>
                  <Form.Item name="name" label="Tên Đầy Đủ">
                    <Input placeholder="Nhập tên đầy đủ của bạn" />
                  </Form.Item>
                </Col>
                <Col className="email-col" span={12}>
                  <Form.Item name="email" label="Địa chỉ Email">
                    <Input placeholder="Nhập email của bạn" />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="first-last-name" gutter={32}>
                <Col className="first-name-col" span={12}>
                  <Form.Item name="firstname" label="Tên (First Name)">
                    <Input placeholder="Nhập Tên của bạn" />
                  </Form.Item>
                </Col>
                <Col className="last-name-col" span={12}>
                  <Form.Item name="lastname" label="Họ (Last Name)">
                    <Input placeholder="Nhập Họ của bạn" />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="phone" label="Điện thoại">
                    <Input placeholder="Nhập số điện thoại của bạn" />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item name="birth" label="Ngày sinh">
                    {/* Format hiển thị: DD/MM/YYYY */}
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Nhập địa chỉ của bạn" />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item
                    name="citizen identification card"
                    label="CMND/CCCD"
                  >
                    <Input placeholder="Nhập số CMND/CCCD của bạn" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  className="save-change-button"
                  type="primary"
                  htmlType="submit"
                >
                  Lưu Thay Đổi
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Thẻ Hồ sơ */}
          <div className="profile-card">

            <Upload
              name="avatar"
              accept="image/*"
              showUploadList={false}
              customRequest={handleAvatarUpload}
            >
              <div className="profile-avatar">
                <Avatar
                  size={180}
                  src={avatarSrc}
                  icon={<UserOutlined />}
                />
                <div className="avatar-overlay">
                  <CameraOutlined className="camera-icon" />
                </div>
              </div>
            </Upload>

            <div className="profile-name">
              {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username : "Người Dùng"}{" "}
              <EditOutlined />
              <br />
              <text className="doanluc197">
                {currentUser ? currentUser.email : "email@example.com"}
              </text>
            </div>

            <Divider />

            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={() => setIsBankModalOpen(true)} // Open modal on click
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={12}>
                Liên kết ngân hàng
              </Col>
              <Col className="icon-bank-col" span={12}>
                <CreditCardOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={() => navigate('/vip-packages')}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={12}>
                Kho gói V.I.P
              </Col>
              <Col className="icon-bank-col" span={12}>
                <DollarOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={() => navigate('/terms-and-policies')}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={15}>
                Điều khoản và chính sách
              </Col>
              <Col className="icon-bank-col" span={9}>
                <LockOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={() => navigate('/contact')}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={15}>
                Liên hệ với chúng tôi
              </Col>
              <Col className="icon-bank-col" span={9}>
                <CustomerServiceOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={15}>
                Đăng xuất
              </Col>
              <Col className="icon-bank-col" span={9}>
                <LogoutOutlined />
              </Col>
            </Row>
          </div>
        </div>
      </div>
      
      {/* Bank Link Modal */}
      <BankLinkModal 
        visible={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
      />

      {/* Change Password Modal */}
      <Modal
        title="Đổi Mật Khẩu"
        open={isChangePasswordModalOpen}
        onCancel={() => {
          setIsChangePasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        centered
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Login History Modal */}
      <Modal
        title="Lịch sử đăng nhập"
        open={isLoginHistoryModalOpen}
        onCancel={() => setIsLoginHistoryModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <Table 
          columns={loginHistoryColumns} 
          dataSource={loginHistoryData} 
          pagination={false} 
          style={{ marginTop: 20 }}
        />
      </Modal>

      {/* Stats Modal */}
      <Modal
        title={<span className="stats-modal-title">Thống kê chi tiêu & Mua sắm</span>}
        open={isStatsModalOpen}
        onCancel={() => setIsStatsModalOpen(false)}
        footer={null}
        width={900}
        centered
        className="stats-modal-container"
      >
        <div className="shopping-insights-modal">
          {/* --- DASHBOARD SUMMARY (THỐNG KÊ NHANH) --- */}
          <div className="dashboard-summary">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} className="stat-summary-card">
                  <Statistic
                    title={<span className="stat-label">Đơn chờ</span>}
                    value={pendingOrdersCount}
                    prefix={<ShoppingOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ fontWeight: 'bold' }}
                    className="stat-value-text"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} className="stat-summary-card">
                  <Statistic
                    title={<span className="stat-label">Điểm thưởng</span>}
                    value={points}
                    prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ fontWeight: 'bold' }}
                    className="stat-value-text"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} className="stat-summary-card">
                  <Statistic
                    title={<span className="stat-label">Voucher</span>}
                    value={voucherCount}
                    prefix={<TagsOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ fontWeight: 'bold' }}
                    className="stat-value-text"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} className="stat-summary-card">
                  <Statistic
                    title={<span className="stat-label">Yêu thích</span>}
                    value={wishlistCount}
                    prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
                    valueStyle={{ fontWeight: 'bold' }}
                    className="stat-value-text"
                  />
                </Card>
              </Col>
            </Row>
          </div>
          {/* ------------------------------------------ */}

          {validOrders.length > 0 ? (
            <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={10}>
                <div className="chart-section-card">
                  <div style={{ width: '100%', maxWidth: '300px' }}>
                    <Doughnut 
                      data={chartData} 
                      options={{ 
                        plugins: { 
                          legend: { 
                            position: 'bottom',
                            labels: { color: '#999', font: { size: 12 } } 
                          },
                          title: {
                            display: true,
                            text: 'Phân bổ chi tiêu',
                            color: '#999',
                            font: { size: 16 }
                          }
                        },
                        maintainAspectRatio: true
                      }} 
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <div className="fun-facts-card">
                  <Title level={4} className="section-title-blue">SỐ LIỆU THÚ VỊ</Title>
                  <ul className="fun-facts-list">
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">🛍️</span>
                      <span>Bạn đã mua tổng cộng <strong style={{ color: '#52c41a', fontSize: '18px' }}>{totalProductsBought}</strong> sản phẩm.</span>
                    </li>
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">💎</span>
                      <span>Đơn hàng "khủng" nhất: <strong style={{ color: '#ff4d4f', fontSize: '18px' }}>{mostExpensiveOrder?.totals?.total?.toLocaleString()} đ</strong></span>
                    </li>
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">❤️</span>
                      <span>Sản phẩm yêu thích nhất: <strong style={{ color: '#eb2f96', fontSize: '18px' }}>{favoriteProduct}</strong></span>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>

            {/* --- MONTHLY SPENDING CHART --- */}
            <div className="monthly-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} className="section-title-dark">Biểu đồ chi tiêu theo tháng</Title>
                <Select 
                  defaultValue={selectedYear} 
                  style={{ width: 120 }} 
                  onChange={setSelectedYear}
                  options={availableYears.map(year => ({ value: year, label: `Năm ${year}` }))}
                  className="year-select"
                />
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button type="link" onClick={() => {
                    setIsStatsModalOpen(false);
                    navigate('/order-history');
                }}>
                  Xem chi tiết Lịch sử Đơn hàng
                </Button>
              </div>
            </div>

            {/* --- REVIEW STATISTICS (THỐNG KÊ ĐÁNH GIÁ) --- */}
            <div className="review-stats-card">
                <Title level={4} className="section-title-blue">Thống kê Đánh giá</Title>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card size="small" bordered={false} className="review-stat-item-card bg-blue-light">
                      <Statistic 
                        title={<span className="stat-label">Đánh giá đã viết</span>}
                        value={reviewStats.totalReviews} 
                        prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} 
                        valueStyle={{ fontWeight: 'bold', color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" bordered={false} className="review-stat-item-card bg-orange-light">
                      <Statistic 
                        title={<span className="stat-label">Điểm đánh giá trung bình</span>}
                        value={reviewStats.avgRating} 
                        precision={1}
                        suffix="/ 5" 
                        prefix={<StarFilled style={{ color: '#faad14' }} />} 
                        valueStyle={{ fontWeight: 'bold', color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" bordered={false} className="review-stat-item-card bg-red-light">
                      <Statistic 
                        title={<span className="stat-label">Lượt thích nhận được</span>}
                        value={reviewStats.totalLikes} 
                        prefix={<LikeOutlined style={{ color: '#ff4d4f' }} />} 
                        valueStyle={{ fontWeight: 'bold', color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider orientation="left" className="review-divider">Thư viện ảnh đánh giá</Divider>
                
                {reviewStats.images.length > 0 ? (
                  <div className="review-images-grid">
                    {reviewStats.images.map((img, idx) => (
                      <Image 
                        key={idx} 
                        src={img} 
                        className="review-image-item"
                        preview={{ mask: <div style={{ fontSize: 12 }}>Xem</div> }}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty 
                    description={<span className="empty-text">Bạn chưa tải lên hình ảnh nào trong các đánh giá.</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    style={{ margin: '20px 0' }}
                  />
                )}
            </div>
            {/* --------------------------------------------- */}

            {/* ------------------------------ */}
          </>
          ) : (
            <div className="empty-stats-container">
              <ShoppingOutlined style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }} />
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>Bạn chưa có dữ liệu mua sắm để thống kê.</p>
              <Button type="primary" size="large" onClick={() => {
                setIsStatsModalOpen(false);
                navigate('/products');
              }}>
                Mua sắm ngay
              </Button>
            </div>
          )}
        </div>
      </Modal>
      
      {/* SETTINGS MODAL */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><SettingOutlined /> Cài đặt Tài khoản</div>}
        open={isSettingsModalOpen}
        onCancel={() => setIsSettingsModalOpen(false)}
        footer={null}
        width={700}
        className="settings-modal"
      >
        <Tabs defaultActiveKey="1" items={settingsItems} tabPosition="left" />
      </Modal>

      {/* <div className="banner-footer"></div> */}
    </div>
  );
};

export default Profile;