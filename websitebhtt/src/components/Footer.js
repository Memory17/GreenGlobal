import React from "react";
import { Typography, Row, Col, Input, Button } from "antd";
import "../style/AppFooter.css";

// Import images (giữ nguyên như của bạn)
import footerLogo from "../assets/images/logo2.jpg";
import redbullLogo from "../assets/images/redbull.png";
import cr7Logo from "../assets/images/cr7logo.png";
import vietnamLogo from "../assets/images/vietnamlogo.png";
import idealLogo from "../assets/images/ideal.png";
import visaLogo from "../assets/images/visa.png";
import MastercardLogo from "../assets/images/mastercard.png";
import giropay from "../assets/images/giropay.png";
import GooglePay from "../assets/images/gpay.png";
import PayPal from "../assets/images/paypal.png";
import KCB from "../assets/images/kcb.png";
import CBC from "../assets/images/cbc.png";
import KLARNA from "../assets/images/klarna.png";
import APAY from "../assets/images/apay.png";
import {
  FacebookFilled,
  TwitterSquareFilled,
  CloseCircleFilled,
  SendOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const AppFooter = () => {
  return (
    <div className="footer">
      <div className="footer-overlay"></div> {/* Lớp phủ tạo hiệu ứng nền */}
      <Row gutter={[32, 32]} className="footer-row">
        
        {/* --- COLUMN 1: LOGO & SUBSCRIBE --- */}
        <Col xs={24} md={8} className="footer-col-logo">
          <div className="logo-wrapper">
            <img src={footerLogo} alt="Brand Logo" className="main-logo" />
          </div>
          <div className="subscribe-section">
            <Text className="subscribe-title">Subscribe to our news</Text>
            <div className="subscribe-input-group">
              <Input
                className="footer-input"
                placeholder="Enter your Email..."
                prefix={<SendOutlined className="input-icon"/>}
              />
              <Button className="footer-button" type="primary">
                Join Now
              </Button>
            </div>
          </div>
          <Text className="footer-copyright">
            © Gaith 2025. All Rights Reserved.
          </Text>
        </Col>

        {/* --- COLUMN 2: QUICK LINKS --- */}
        <Col xs={12} md={3} className="footer-col-links">
          <Title level={5} className="footer-heading">Quick Links</Title>
          <div className="link-list">
            <Text className="link-item">Shop</Text>
            <Text className="link-item">About Us</Text>
            <Text className="link-item">Blogs</Text>
            <Text className="link-item">FAQ</Text>
            <Text className="link-item">Customer Service</Text>
            <Text className="link-item">Contact Us</Text>
          </div>
        </Col>

        {/* --- COLUMN 3: LEGAL LINKS --- */}
        <Col xs={12} md={3} className="footer-col-links">
          <Title level={5} className="footer-heading">Legal</Title>
          <div className="link-list">
            <Text className="link-item">Privacy Policy</Text>
            <Text className="link-item">Terms & Conditions</Text>
            <Text className="link-item">Imprint</Text>
            <Text className="link-item">Cookie Policy</Text>
            <Text className="link-item">Refund Policy</Text>
            <Text className="link-item">Shipping Policy</Text>
            <Text className="link-item">Compliance Info</Text>
          </div>
          <div className="social-icons">
            <FacebookFilled className="icon facebook" />
            <TwitterSquareFilled className="icon twitter" />
            <CloseCircleFilled className="icon xicon" />
          </div>
        </Col>

        {/* --- COLUMN 4: CONTACT --- */}
        <Col xs={12} md={3} className="footer-col-links">
          <Title level={5} className="footer-heading">Contact</Title>
          <div className="link-list">
            <Text className="link-item">support@gaith.com</Text>
            <Text className="link-item">+84 909 000 111</Text>
            <Text className="link-item">123 Street, City</Text>
          </div>
        </Col>

        {/* --- COLUMN 5: PARTNERS & PAYMENTS --- */}
        <Col xs={24} md={7} className="footer-col-payment">
          <div className="logo-connect">
            <img className="partner-logo" src={vietnamLogo} alt="VN" />
            <img className="partner-logo" src={redbullLogo} alt="RB" />
            <img className="partner-logo" src={cr7Logo} alt="CR7" />
          </div>
          
          <div className="payment-grid">
             {/* Gom tất cả logo thanh toán vào một grid để dễ style */}
             {[idealLogo, visaLogo, MastercardLogo, giropay, GooglePay, PayPal, KCB, CBC, KLARNA, APAY].map((logo, index) => (
                <div className="card-glass" key={index}>
                  <img src={logo} alt="payment" />
                </div>
             ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AppFooter;