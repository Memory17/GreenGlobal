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
  Select,
  Tabs,
  ColorPicker,
  Switch,
  Table,
  Tag,
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
  FileTextOutlined,
  StarFilled,
  LikeOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";
import { useTranslation, Trans } from "react-i18next";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAuth } from "../context/AuthContext";
import { useOrderHistory } from "../context/OrderHistoryContext";
import { getAllCoupons } from "../data/discountServiceUser";
import { changePassword } from "../data/authService";
import { useNavigate } from "react-router-dom";
import BankLinkModal from "../components/BankLinkModal";
import { Statistic, Card, Image, Empty} from "antd";
import { ShoppingOutlined, GiftOutlined, TagsOutlined, HeartOutlined } from "@ant-design/icons";
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
import { Doughnut, Bar } from 'react-chartjs-2';

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
  const { currentUser, logout, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [avatarSrc, setAvatarSrc] = useState(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();

  const { isDarkMode, toggleDarkMode, accentColor, changeAccentColor, fontSize, changeFontSize } = useTheme();

  // === DUMMY DATA FOR LOGIN HISTORY ===
  const loginHistoryData = [
    {
      key: '1',
      device: 'Windows PC - Chrome',
      location: 'Ho Chi Minh City, Vietnam',
      time: 'Vừa xong',
      status: t('success'),
      ip: '192.168.1.1'
    },
    {
      key: '2',
      device: 'iPhone 14 Pro - Safari',
      location: 'Da Nang, Vietnam',
      time: '2 giờ trước',
      status: t('success'),
      ip: '14.161.22.10'
    },
    {
      key: '3',
      device: 'MacBook Pro - Chrome',
      location: 'Hanoi, Vietnam',
      time: '1 ngày trước',
      status: t('success'),
      ip: '113.160.12.5'
    },
    {
      key: '4',
      device: 'Unknown Device',
      location: 'Unknown',
      time: '3 ngày trước',
      status: t('failed'),
      ip: '10.0.0.1'
    },
  ];

  const loginHistoryColumns = [
    {
      title: t('device_col'),
      dataIndex: 'device',
      key: 'device',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: t('location_col'),
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'],
    },
    {
      title: t('time_col'),
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: t('status_col'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === t('success') ? 'success' : 'error'}>
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
      message.loading({ content: t('processing'), key: 'changePass' });
      
      await changePassword(currentUser.username, values.oldPassword, values.newPassword);
      
      message.success({ content: t('change_password_success'), key: 'changePass' });
      setIsChangePasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error({ content: error.message || t('change_password_failed'), key: 'changePass' });
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
  const validOrders = orderHistory?.filter(o => o.status !== 'Cancelled' && o.status !== 'Đã hủy') || [];

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
        label: t('spending_vnd'),
        data: Object.values(categorySpending),
        backgroundColor: [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#ff4d4f',
          '#722ed1',
          '#13c2c2',
          '#eb2f96',
          '#2f54eb',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const totalProductsBought = validOrders.reduce((acc, order) => 
    acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0
  );

  const mostExpensiveOrder = validOrders.reduce((max, order) => 
    (order.totals?.total > (max?.totals?.total || 0)) ? order : max
  , null);

  const productCounts = {};
  validOrders.forEach(order => {
    order.items.forEach(item => {
      const name = item.product?.title || 'Sản phẩm';
      productCounts[name] = (productCounts[name] || 0) + item.quantity;
    });
  });
  const favoriteProductEntry = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
  const favoriteProduct = favoriteProductEntry ? favoriteProductEntry[0] : "Chưa có";

  // === REVIEW STATISTICS ===
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
          const userReviews = allReviews.filter(r => r.user === currentUser.username);
          
          const totalReviews = userReviews.length;
          const totalRating = userReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
          const totalLikes = userReviews.reduce((acc, r) => acc + (r.likes || 0), 0); 
          
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

  const availableYears = [...new Set(validOrders.map(order => new Date(order.orderDate).getFullYear()))].sort((a, b) => b - a);
  if (availableYears.length === 0 || !availableYears.includes(new Date().getFullYear())) {
     if (!availableYears.includes(new Date().getFullYear())) {
        availableYears.unshift(new Date().getFullYear());
     }
  }

  const monthlySpending = Array(12).fill(0);
  const monthlyOrderCounts = Array(12).fill(0);

  validOrders.forEach(order => {
    const date = new Date(order.orderDate);
    if (date.getFullYear() === selectedYear) {
      const month = date.getMonth();
      monthlySpending[month] += (order.totals?.total || 0);
      monthlyOrderCounts[month] += 1;
    }
  });

  const barChartData = {
    labels: [
      t('month_1', { defaultValue: 'Tháng 1' }), 
      t('month_2', { defaultValue: 'Tháng 2' }), 
      t('month_3', { defaultValue: 'Tháng 3' }), 
      t('month_4', { defaultValue: 'Tháng 4' }), 
      t('month_5', { defaultValue: 'Tháng 5' }), 
      t('month_6', { defaultValue: 'Tháng 6' }), 
      t('month_7', { defaultValue: 'Tháng 7' }), 
      t('month_8', { defaultValue: 'Tháng 8' }), 
      t('month_9', { defaultValue: 'Tháng 9' }), 
      t('month_10', { defaultValue: 'Tháng 10' }), 
      t('month_11', { defaultValue: 'Tháng 11' }), 
      t('month_12', { defaultValue: 'Tháng 12' })
    ],
    datasets: [
      {
        label: t('spending_vnd'),
        data: monthlySpending,
        backgroundColor: monthlySpending.map((val, index) => {
            const currentMonth = new Date().getMonth();
            const isCurrentMonth = index === currentMonth && selectedYear === new Date().getFullYear();
            const isMax = val === Math.max(...monthlySpending) && val > 0;
            
            if (isCurrentMonth) return '#1890ff';
            if (isMax) return '#ff4d4f';
            return 'rgba(24, 144, 255, 0.3)';
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
        borderRadius: 6,
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
        display: false,
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
            return [`💰 ${t('spending_vnd')}: ${value.toLocaleString()} đ`, `📦 ${t('orders_count_suffix')}: ${count}`];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#999'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e0e0e0',
          borderDash: [5, 5],
        },
        ticks: {
          callback: (value) => value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value.toLocaleString(),
          font: { size: 11 },
          color: '#999'
        },
        border: {
          display: false
        }
      }
    }
  };

  useEffect(() => {
    if (!form || !currentUser) return;

    const username = currentUser.username;
    const localProfile = getProfileByUsername(username);

    const apiAddress = currentUser.address?.address || '';
    const apiBirthDate = currentUser.birthDate || null;
    const apiImage = currentUser.image || null;

    let initialValues;
    let currentAvatarSrc;


    if (localProfile) {
      initialValues = {
        ...localProfile,
        birth: localProfile.birth ? dayjs(localProfile.birth, "YYYY-MM-DD") : null,
      };
      currentAvatarSrc = localProfile.avatar || apiImage || null;

    } else {
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
      currentAvatarSrc = apiImage;
    }

    form.setFieldsValue(initialValues);
    setAvatarSrc(currentAvatarSrc);

  }, [currentUser, form]);

  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error(t('error_user_not_found'));
      return;
    }

    const username = currentUser.username;

    const dataToSave = {
      ...values,
      birth: values.birth ? values.birth.format("YYYY-MM-DD") : null, 
      name: `${values.firstname || ''} ${values.lastname || ''}`.trim() || username
    };

    try {
      saveProfileByUsername(username, dataToSave);
      updateUser(dataToSave);
      message.success(t('update_info_success'));
      form.setFieldsValue({ name: dataToSave.name });

    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      message.error(t('update_info_error'));
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
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
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    if (!currentUser) {
      message.error(t('login_required_action'));
      onError("User not logged in");
      return;
    }

    if (!file.type.startsWith('image/')) {
      message.error(t('upload_image_only'));
      onError("Invalid file type");
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      saveProfileByUsername(currentUser.username, { avatar: compressedBase64 });
      updateUser({ image: compressedBase64 });

      setAvatarSrc(compressedBase64);
      message.success(t('update_avatar_success'));
      onSuccess("ok");
    } catch (error) {
      console.error("Lỗi khi lưu ảnh đại diện:", error);
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        message.error(t('browser_storage_full'));
      } else {
        message.error(t('image_processing_error') + (error.message || "Lỗi không xác định"));
      }
      onError(error);
    }
  };

  const handleLogout = () => {
    logout();
    message.success(t('logout_success'));
  };

  const settingsItems = [
    {
      key: '1',
      label: (<span className="setting-tab-label"><BgColorsOutlined /> {t('interface')}</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">{t('interface')}</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('dark_mode')}</div>
              <div className="setting-desc">{t('dark_mode_desc')}</div>
            </div>
            <div className="setting-action">
              <Switch checked={isDarkMode} onChange={toggleDarkMode} />
            </div>
          </div>
          
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('accent_color')}</div>
              <div className="setting-desc">{t('accent_color_desc')}</div>
            </div>
            <div className="setting-action">
              <ColorPicker value={accentColor} onChange={(c) => changeAccentColor(c.toHexString())} showText />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('font_size')}</div>
              <div className="setting-desc">{t('font_size_desc')}</div>
            </div>
            <div className="setting-action">
              <Select value={fontSize} onChange={changeFontSize} style={{ width: 120 }}>
                <Select.Option value="small">{t('font_small')}</Select.Option>
                <Select.Option value="medium">{t('font_medium')}</Select.Option>
                <Select.Option value="large">{t('font_large')}</Select.Option>
              </Select>
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('display_language')}</div>
              <div className="setting-desc">{t('language_desc')}</div>
            </div>
            <div className="setting-action">
              <Select 
                value={i18n.language} 
                onChange={(value) => i18n.changeLanguage(value)} 
                style={{ width: 120 }}
              >
                <Select.Option value="vi">Tiếng Việt</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (<span className="setting-tab-label"><SecurityScanOutlined /> {t('security')}</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">{t('security_login')}</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('two_factor_auth')}</div>
              <div className="setting-desc">{t('two_factor_desc')}</div>
            </div>
            <div className="setting-action">
              <Switch />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('change_password')}</div>
              <div className="setting-desc">{t('change_password_desc')}</div>
            </div>
            <div className="setting-action">
              <Button type="primary" ghost onClick={() => setIsChangePasswordModalOpen(true)}>{t('change_password')}</Button>
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('login_history')}</div>
              <div className="setting-desc">{t('login_history_desc')}</div>
            </div>
            <div className="setting-action">
              <Button onClick={() => setIsLoginHistoryModalOpen(true)}>{t('view_history')}</Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (<span className="setting-tab-label"><BellOutlined /> {t('notifications')}</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">{t('notification_settings')}</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('promo_email')}</div>
              <div className="setting-desc">{t('promo_email_desc')}</div>
            </div>
            <div className="setting-action">
              <Switch defaultChecked />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('order_updates')}</div>
              <div className="setting-desc">{t('order_updates_desc')}</div>
            </div>
            <div className="setting-action">
              <Switch defaultChecked />
            </div>
          </div>

          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('review_updates')}</div>
              <div className="setting-desc">{t('review_updates_desc')}</div>
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
      label: (<span className="setting-tab-label"><SafetyCertificateOutlined /> {t('privacy')}</span>),
      children: (
        <div className="settings-tab-content">
          <div className="setting-section-title">{t('privacy_data')}</div>
          <div className="setting-item-card">
            <div className="setting-info">
              <div className="setting-title">{t('download_data')}</div>
              <div className="setting-desc">{t('download_data_desc')}</div>
            </div>
            <div className="setting-action">
              <Button>{t('request_data')}</Button>
            </div>
          </div>

          <div className="setting-item-card danger-zone">
            <div className="setting-info">
              <div className="setting-title danger-text">{t('delete_account')}</div>
              <div className="setting-desc">{t('delete_account_desc')}</div>
            </div>
            <div className="setting-action">
              <Button danger type="primary">{t('delete_account')}</Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-page-title">
        <Title className="title-profile" level={1}>
          {t('hello').toUpperCase()}, <span className="greeting-highlight">{currentUser ? currentUser.firstName || currentUser.username : t('user_default').toUpperCase()}</span>
        </Title>
        <div className="text-profile">
          <Trans i18nKey="profile_welcome_message" />
        </div>
        <Button 
          className="edit-profile-button" 
          type="primary"
          onClick={() => setIsStatsModalOpen(true)}
        >
          {t('spending_statistics')}
        </Button>
      </div>
      <div className="page-content">
        <div className="profile-grid">
          <div className="profile-form-card">
            <Row className="my-account-header">
              <Col className="my-account-title" span={12}>
                <Text strong>{t('my_account_title')}</Text>
              </Col>
              <Col className="setting-button" span={12}>
                <Button type="primary" onClick={() => setIsSettingsModalOpen(true)}>{t('settings')}</Button>
              </Col>
            </Row>

            <Title className="user-info-title" level={5}>
              {t('user_info_title')}
            </Title>
            <Form
              className="my-account-form"
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row className="username-email" gutter={32}>
                <Col className="username-col" span={12}>
                  <Form.Item name="name" label={t('full_name_label')}>
                    <Input placeholder={t('full_name_placeholder')} />
                  </Form.Item>
                </Col>
                <Col className="email-col" span={12}>
                  <Form.Item name="email" label={t('email_label')}>
                    <Input placeholder={t('email_placeholder')} />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="first-last-name" gutter={32}>
                <Col className="first-name-col" span={12}>
                  <Form.Item name="firstname" label={t('firstname_label')}>
                    <Input placeholder={t('firstname_placeholder')} />
                  </Form.Item>
                </Col>
                <Col className="last-name-col" span={12}>
                  <Form.Item name="lastname" label={t('lastname_label')}>
                    <Input placeholder={t('lastname_placeholder')} />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="phone" label={t('phone_label')}>
                    <Input placeholder={t('phone_placeholder')} />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item name="birth" label={t('birth_date_label')}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="address" label={t('address_label')}>
                    <Input placeholder={t('address_placeholder')} />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item
                    name="citizen identification card"
                    label={t('id_card_label')}
                  >
                    <Input placeholder={t('id_card_placeholder')} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  className="save-change-button"
                  type="primary"
                  htmlType="submit"
                >
                  {t('save_changes_button')}
                </Button>
              </Form.Item>
            </Form>
          </div>

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
              {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username : t('user_default')}{" "}
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
              onClick={() => setIsBankModalOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={12}>
                {t('link_bank')}
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
                {t('vip_packages_store')}
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
                {t('terms_and_policies')}
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
                {t('contact_us')}
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
                {t('logout')}
              </Col>
              <Col className="icon-bank-col" span={9}>
                <LogoutOutlined />
              </Col>
            </Row>
          </div>
        </div>
      </div>
      
      <BankLinkModal 
        visible={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
      />

      <Modal
        title={t('change_password_title')}
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
            label={t('current_password_label')}
            rules={[{ required: true, message: t('current_password_required') }]}
          >
            <Input.Password placeholder={t('current_password_placeholder')} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={t('new_password_label')}
            rules={[
              { required: true, message: t('new_password_required') },
              { min: 6, message: t('password_min_length') }
            ]}
          >
            <Input.Password placeholder={t('new_password_placeholder')} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('confirm_new_password_label')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('confirm_new_password_required') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('password_mismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('confirm_new_password_placeholder')} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              {t('update_password_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('login_history_title')}
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

      <Modal
        title={<span className="stats-modal-title">{t('spending_shopping_stats_title')}</span>}
        open={isStatsModalOpen}
        onCancel={() => setIsStatsModalOpen(false)}
        footer={null}
        width={900}
        centered
        className="stats-modal-container"
      >
        <div className="shopping-insights-modal">
          <div className="dashboard-summary">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} className="stat-summary-card">
                  <Statistic
                    title={<span className="stat-label">{t('pending_orders')}</span>}
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
                    title={<span className="stat-label">{t('reward_points')}</span>}
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
                    title={<span className="stat-label">{t('voucher')}</span>}
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
                    title={<span className="stat-label">{t('wishlist')}</span>}
                    value={wishlistCount}
                    prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
                    valueStyle={{ fontWeight: 'bold' }}
                    className="stat-value-text"
                  />
                </Card>
              </Col>
            </Row>
          </div>

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
                            text: t('spending_allocation'),
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
                  <Title level={4} className="section-title-blue">{t('fun_facts_title')}</Title>
                  <ul className="fun-facts-list">
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">🛍️</span>
                      <span>{t('total_products_bought_prefix')} <strong style={{ color: '#52c41a', fontSize: '18px' }}>{totalProductsBought}</strong> {t('products_suffix')}</span>
                    </li>
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">💎</span>
                      <span>{t('most_expensive_order')} <strong style={{ color: '#ff4d4f', fontSize: '18px' }}>{mostExpensiveOrder?.totals?.total?.toLocaleString()} đ</strong></span>
                    </li>
                    <li className="fun-fact-item">
                      <span className="fun-fact-icon">❤️</span>
                      <span>{t('favorite_product')} <strong style={{ color: '#eb2f96', fontSize: '18px' }}>{favoriteProduct}</strong></span>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>

            <div className="monthly-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} className="section-title-dark">{t('monthly_spending_chart_title')}</Title>
                <Select 
                  defaultValue={selectedYear} 
                  style={{ width: 120 }} 
                  onChange={setSelectedYear}
                  options={availableYears.map(year => ({ value: year, label: `${t('year')} ${year}` }))}
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
                  {t('view_order_history_detail')}
                </Button>
              </div>
            </div>

            <div className="review-stats-card">
                <Title level={4} className="section-title-blue">{t('review_stats_title')}</Title>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card size="small" bordered={false} className="review-stat-item-card bg-blue-light">
                      <Statistic 
                        title={<span className="stat-label">{t('reviews_written')}</span>}
                        value={reviewStats.totalReviews} 
                        prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} 
                        valueStyle={{ fontWeight: 'bold', color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" bordered={false} className="review-stat-item-card bg-orange-light">
                      <Statistic 
                        title={<span className="stat-label">{t('avg_rating')}</span>}
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
                        title={<span className="stat-label">{t('likes_received')}</span>}
                        value={reviewStats.totalLikes} 
                        prefix={<LikeOutlined style={{ color: '#ff4d4f' }} />} 
                        valueStyle={{ fontWeight: 'bold', color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider orientation="left" className="review-divider">{t('review_image_gallery')}</Divider>
                
                {reviewStats.images.length > 0 ? (
                  <div className="review-images-grid">
                    {reviewStats.images.map((img, idx) => (
                      <Image 
                        key={idx} 
                        src={img} 
                        className="review-image-item"
                        preview={{ mask: <div style={{ fontSize: 12 }}>{t('view')}</div> }}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty 
                    description={<span className="empty-text">{t('no_review_images')}</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    style={{ margin: '20px 0' }}
                  />
                )}
            </div>
          </>
          ) : (
            <div className="empty-stats-container">
              <ShoppingOutlined style={{ fontSize: '50px', marginBottom: '15px', color: '#ccc' }} />
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>{t('no_shopping_data')}</p>
              <Button type="primary" size="large" onClick={() => {
                setIsStatsModalOpen(false);
                navigate('/products');
              }}>
                {t('shop_now')}
              </Button>
            </div>
          )}
        </div>
      </Modal>
      
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><SettingOutlined /> {t('account_settings')}</div>}
        open={isSettingsModalOpen}
        onCancel={() => setIsSettingsModalOpen(false)}
        footer={null}
        width={700}
        className="settings-modal"
      >
        <Tabs defaultActiveKey="1" items={settingsItems} tabPosition="left" />
      </Modal>
    </div>
  );
};

export default Profile;