// Tên file: src/pages/Login.js
// ĐÃ CẬP NHẬT: Lưu currentUser vào localStorage

import React, { useState } from "react";
import {
  Typography, Form, Input, Button, Row, Col, message,
} from "antd";
import {
  GoogleOutlined, LoginOutlined, FacebookFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../data/authService";
import "../style/Login.css"; 
import { useAuth } from "../context/AuthContext"; 

const { Title, Text, Link } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); 

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      console.log('📝 Login attempt with:', { username, password });
      const userData = await loginUser(username, password);
      console.log('📝 Login response:', userData);
      
      message.success(`Chào mừng trở lại, ${userData.firstName || userData.username}!`);
      
      // ✅ LƯU CURRENTUSER VÀO LOCALSTORAGE
      const currentUserInfo = {
        id: userData.id || Date.now(),
        name: userData.firstName || userData.fullName || userData.username || 'User',
        email: userData.email || `${userData.username}@example.com`,
        phone: userData.phone || 'N/A',
        username: userData.username,
        role: userData.role || 'user',
      };

      console.log('🔍 About to save user info:', currentUserInfo);
      localStorage.setItem('currentUser', JSON.stringify(currentUserInfo));
      localStorage.setItem('authToken', userData.token);

      // Verify saved
      const checkSaved = localStorage.getItem('currentUser');
      console.log('✅ Verified saved in localStorage:', checkSaved);

      // Dispatch event để các component khác biết user đã login
      window.dispatchEvent(new Event('user_logged_in'));

      console.log('✅ Saved User Info:', currentUserInfo);
      console.log('📦 All localStorage:', Object.keys(localStorage).map(k => `${k}: ${localStorage.getItem(k)}`));
      // =======================================

      // Gửi cả token và userData vào hàm login của Context
      login(userData.token, userData); 

      if (userData.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Row className="login-row">
        {/* --- CỘT BÊN TRÁI (HÌNH ẢNH VÀ TEXT) --- */}
        <Col span={15} className="login-col-left">
          <div>
            <Title level={1} className="title-left">
              Chào mừng đến với L-M Fashion
            </Title>
            <Text className="text-left">
              Vui lòng đăng nhập để truy cập tài khoản của bạn và bắt đầu mua sắm.
            </Text>
          </div>
        </Col>

        {/* --- CỘT BÊN PHẢI (FORM ĐĂNG NHẬP) --- */}
        <Col span={9} className="login-col-right">
          <div className="login-form-container">
            <Title level={2} className="login-title">
              Đăng nhập
            </Title>
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="login-form"
            >
              <Form.Item
                name="username"
                label="Tên người dùng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                ]}
              >
                <Input placeholder="Nhập tên người dùng của bạn" className="custom-input" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu của bạn" />
              </Form.Item>

              <Form.Item className="form-item-no-style" style={{ marginBottom: '24px' }}>
                <Link href="/forgot-password" style={{ float: "right" }}>
                  Quên mật khẩu?
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
                  Đăng nhập
                </Button>
              </Form.Item>

              <Form.Item className="or-login-with-form-item form-item-no-style" style={{ marginTop: '10px' }}>
                <Text className="or-login">Hoặc đăng nhập bằng</Text>
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
                  Bạn chưa có tài khoản?{" "}
                  <Link href="/register">Đăng ký ngay</Link>
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