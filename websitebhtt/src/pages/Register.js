import React, { useState } from "react";
import {
  Typography, Form, Input, Button, Row, Col, Space, message,
} from "antd";
import {
  GoogleOutlined, LoginOutlined, FacebookFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../data/authService"; // Import hàm đã cập nhật
import { useAuth } from "../context/AuthContext";
import "../style/Login.css"; // Đảm bảo bạn có import CSS

const { Title, Text, Link } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const onFinish = async (values) => {
    const { username, password, phone } = values;
    setLoading(true);

    try {
      const payload = {
        username,
        password,
        phone: phone || '',
      };

      // Gọi hàm register (lưu vào localStorage)
      const newUserData = await registerUser(payload);
      console.log("User mới đã được lưu vào localStorage:", newUserData);

      // Tự động đăng nhập sau khi đăng ký: dùng loginUser để xác thực từ nguồn localStorage
      try {
        const logged = await loginUser(username, password);
        // Tạo token giả cho local login
        const fakeToken = `local-token-${Date.now()}`;
        // Gọi hàm login từ AuthContext
        auth.login(fakeToken, logged);
        message.success("Đăng ký thành công! Bạn đã được đăng nhập tự động.");
        navigate('/');
        return;
      } catch (loginErr) {
        // Nếu có lỗi khi tự động login, chuyển về trang login như fallback
        console.warn('Auto-login failed after register', loginErr);
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (error) {
      message.error(error.message);
      setLoading(false); // Chỉ set false khi lỗi
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // ... (Toàn bộ phần JSX return của bạn giữ nguyên, không cần thay đổi)
  return (
    <div className="login-page">
      <div className="login">
        <Row className="login-row">
          <Col xs={0} md={12} lg={14} className="login-col-left">
            <Space direction="vertical" size="small">
              <Title className="title-left" level={1}>
                Welcome !!
              </Title>
              <Text className="text-left">
                Please log in to your account to enjoy a more personalized
                experience, access exclusive deals, track your orders easily,
                and receive the latest updates tailored just for you.
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={12} lg={10} className="login-col-right">
            <div>
              <Title className="login-title" level={2}>
                Register
              </Title>
              <Form
                className="form-login"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
                autoComplete="off"
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                >
                  <Input placeholder="Username" />
                </Form.Item>

                <Form.Item label="Phone" name="phone">
                  <Input placeholder="Phone number (optional)" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                  >
                    <LoginOutlined />
                    Register
                  </Button>
                </Form.Item>
                 <Form.Item className="or-login-with-form-item">
                   <Text className="or-login">Or register with</Text>
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
                 <Form.Item className="dont-have">
                   <Text className="dont-have-account">
                     Already have an account?{" "}
                     <Link href="/login">Login now</Link>
                   </Text>
                 </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Register;