// Tên file: src/pages/Login.js
// ĐÃ CẬP NHẬT: Lưu currentUser vào localStorage

import React, { useState, useEffect } from "react";
import {
  Typography, Form, Input, Button, Row, Col, message,
} from "antd";
import {
  GoogleOutlined, LoginOutlined, FacebookFilled,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser } from "../data/authService";
import "../style/Login.css"; 
import { useAuth } from "../context/AuthContext";

// --- HELPER ĐỂ ĐỌC PROFILE TÙY CHỈNH ---
// Logic này được sao chép từ Profile.js để đảm bảo tính nhất quán
const PROFILES_STORAGE_KEY = 'user_profiles';
const getProfileByUsername = (username) => {
  if (!username) return null;
  try {
    const profiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    const allProfiles = profiles ? JSON.parse(profiles) : {};
    return allProfiles[username] || null;
  } catch {
    return null;
  }
};

const { Title, Text, Link } = Typography;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If redirected here because admin required, show a warning
    if (location.state?.reason === 'admin_required') {
      message.warning(t('admin_required_msg'));
    }
  }, [location.state, t]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); 

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      console.log('📝 Login attempt with:', { username, password });
      const userData = await loginUser(username, password);
      console.log('📝 Login response:', userData);
      
      // ⭐ BƯỚC 1: KIỂM TRA AVATAR TÙY CHỈNH ĐÃ LƯU
      // Sau khi có userData từ API, kiểm tra xem có profile tùy chỉnh trong localStorage không.
      const localProfile = getProfileByUsername(userData.username);
      if (localProfile && localProfile.avatar) {
        // Nếu có, hợp nhất avatar đó vào userData.
        // AuthContext dùng key 'image', nên ta gán vào 'image'.
        userData.image = localProfile.avatar;
        console.log('🎨 Found and merged custom avatar from local profile.');
      }

      message.success(t('login_success_msg', { name: userData.firstName || userData.username }));
      
      // Dispatch event để các component khác biết user đã login
      window.dispatchEvent(new Event('user_logged_in'));

      // Gửi cả token và userData vào hàm login của Context
      // userData lúc này đã chứa avatar tùy chỉnh (nếu có)
      login(userData.token, userData); 

      // If location.state.from exists, redirect there (e.g. admin path)
      const redirectTo = location.state?.from || (userData.role === 'admin' ? '/admin' : '/');
      navigate(redirectTo);

    } catch (error) {
      message.error(error.message || t('login_failed_msg'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Row className="login-row">
        {/* --- CỘT BÊN TRÁI (HÌNH ẢNH VÀ TEXT) --- */}
        <Col xs={0} md={12} lg={15} className="login-col-left">
          <div>
            <Title level={1} className="title-left">
              {t('welcome_title')}
            </Title>
            <Text className="text-left">
              {t('login_intro')}
            </Text>
          </div>
        </Col>

        {/* --- CỘT BÊN PHẢI (FORM ĐĂNG NHẬP) --- */}
        <Col xs={24} md={12} lg={9} className="login-col-right">
          <div className="login-form-container">
            <Title level={2} className="login-title">
              {t('login')}
            </Title>
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="login-form"
            >
              <Form.Item
                name="username"
                label={t('username')}
                rules={[
                  { required: true, message: t('username_required') },
                ]}
              >
                <Input placeholder={t('username_placeholder')} className="custom-input" />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('password')}
                rules={[
                  { required: true, message: t('password_required') },
                ]}
              >
                <Input.Password placeholder={t('password_placeholder')} />
              </Form.Item>

              <Form.Item className="form-item-no-style" style={{ marginBottom: '24px' }}>
                <Link href="/forgot-password" style={{ float: "right" }}>
                  {t('forgot_password')}
                </Link>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  <LoginOutlined />
                  {t('login_button')}
                </Button>
              </Form.Item>

              <Form.Item className="or-login-with-form-item form-item-no-style" style={{ marginTop: '10px' }}>
                <Text className="or-login">{t('or_login_with')}</Text>
              </Form.Item>

              <Row className="login-with" justify="center" gutter={16}>
                <Col>
                  <Button className="btn-login-google">
                    <GoogleOutlined />
                    Google
                  </Button>
                </Col>
                <Col>
                  <Button className="btn-login-facebook">
                    <FacebookFilled />
                    Facebook
                  </Button>
                </Col>
              </Row>

              <Form.Item className="dont-have form-item-no-style" style={{ marginTop: '20px' }}>
                <Text className="dont-have-account">
                  {t('dont_have_account')}{" "}
                  <Link href="/register">{t('register_now')}</Link>
                </Text>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;