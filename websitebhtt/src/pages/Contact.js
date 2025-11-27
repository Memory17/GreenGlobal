import React from "react";
import "../style/Contact.css"; // Đảm bảo đã import file CSS
import {
  Typography,
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
} from "antd";
import { saveSupportTicket } from "../API";

import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  MessageOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
  FacebookOutlined,
  SendOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

const Contact = () => {
  // Extracted submit handler to preserve original functionality
  const handleSubmit = async (values) => {
    try {
      // Build ticket payload
      // Use the user's message as the ticket title (trimmed) so admin sees the content at-a-glance.
      const rawMsg = (values.message || '').trim();
      const firstLine = rawMsg.split(/\r?\n/)[0] || '';
      const MAX_TITLE = 80;
      const titleForTicket = firstLine.length > MAX_TITLE ? firstLine.slice(0, MAX_TITLE - 3) + '...' : firstLine || `Liên hệ: ${values.name}`;

      const payload = {
        // title is the message content (first line, trimmed)
        title: titleForTicket,
        customer: values.name,
        email: values.email,
        message: values.message,
        description: `Email: ${values.email}\n\n${values.message}`,
        source: 'Contact Form',
        priority: 'TRUNG BÌNH',
      };
      const saved = saveSupportTicket(payload);
      if (saved) {
        message.success('Message sent successfully! Support team has received your ticket.');
      } else {
        message.error('Failed to submit message. Please try again later.');
      }
    } catch (e) {
      console.error('Contact form submit failed', e);
      message.error('Failed to send message.');
    }
  };

  // Contact info and social links for the redesigned UI
  const contactInfo = [
    { 
      icon: MailOutlined, 
      label: 'Email Hỗ Trợ', 
      value: 'hello@company.com', 
      href: 'mailto:hello@company.com',
      description: 'Gửi email cho chúng tôi bất cứ lúc nào!',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    { 
      icon: PhoneOutlined, 
      label: 'Hotline Tư Vấn', 
      value: '+1 (555) 123-4567', 
      href: 'tel:+15551234567',
      description: 'Hỗ trợ 24/7 từ thứ 2 đến thứ 6',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    { 
      icon: EnvironmentOutlined, 
      label: 'Văn Phòng Chính', 
      value: '279 Mai Dang Chon, Hoa Quy, Da Nang City', 
      href: null,
      description: 'Ghé thăm văn phòng của chúng tôi',
      color: '#f43f5e',
      bgColor: '#fff1f2'
    }
  ];

  const socialLinks = [
    { icon: FacebookOutlined, href: '#', label: 'Facebook', color: '#1877F2', shadow: 'rgba(24, 119, 242, 0.5)' },
    { icon: TwitterOutlined, href: '#', label: 'Twitter', color: '#1DA1F2', shadow: 'rgba(29, 161, 242, 0.5)' },
    { icon: LinkedinOutlined, href: '#', label: 'LinkedIn', color: '#0A66C2', shadow: 'rgba(10, 102, 194, 0.5)' },
    { icon: GithubOutlined, href: '#', label: 'Github', color: '#333333', shadow: 'rgba(51, 51, 51, 0.5)' },
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        <div className="contact-header">
          <Title level={1}>Liên Hệ</Title>
          <Text>Bạn có câu hỏi hoặc muốn hợp tác? Chúng tôi rất mong nhận được phản hồi từ bạn.</Text>
        </div>

        <div className="contact-main-grid">
          <div className="contact-card contact-form-card">
            <div className="form-header">
              <Title level={3}>Gửi tin nhắn cho chúng tôi</Title>
              <Text type="secondary">Chúng tôi sẽ phản hồi sớm nhất có thể</Text>
            </div>
            <Form layout="vertical" className="contact-form" onFinish={handleSubmit} requiredMark={false}>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                    <Input placeholder="Nguyễn Văn A" prefix={<UserOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="john@example.com" prefix={<MailOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input placeholder="0912 345 678" prefix={<PhoneOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="subject" label="Chủ đề" rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}>
                    <Input placeholder="Chúng tôi có thể giúp gì cho bạn?" prefix={<MessageOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="message" label="Tin nhắn" rules={[{ required: true, message: 'Vui lòng nhập tin nhắn' }]}>
                <Input.TextArea rows={6} placeholder="Hãy cho chúng tôi biết thêm về yêu cầu của bạn..." showCount maxLength={500} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" className="contact-submit-btn" icon={<SendOutlined />}>
                  Gửi Tin Nhắn
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="contact-info-column">
            <div className="contact-card contact-info-card">
              <Title level={4}>Thông tin liên hệ</Title>
              <div className="space-y-6">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="contact-info-item">
                      <div 
                        className="contact-info-item-icon-wrapper"
                        style={{ color: item.color, backgroundColor: item.bgColor }}
                      >
                        <Icon className="anticon" />
                      </div>
                      <div className="contact-info-item-content">
                        <Text className="contact-label" style={{ color: item.color }}>{item.label}</Text>
                        {item.href ? (
                          <a href={item.href} className="contact-value">{item.value}</a>
                        ) : (
                          <p className="contact-value">{item.value}</p>
                        )}
                        <p className="contact-desc">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="contact-card contact-social-card">
              <div className="social-header">
                <Title level={4}>Kết nối với chúng tôi</Title>
                <Text>Theo dõi để không bỏ lỡ những ưu đãi hấp dẫn nhất</Text>
              </div>
              <div className="contact-social-grid">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={index} 
                      href={social.href} 
                      className="social-link-item"
                      style={{ 
                        '--social-color': social.color,
                        '--social-shadow': social.shadow
                      }}
                    >
                      <div className="social-icon-wrapper">
                        <Icon />
                      </div>
                      <span className="social-name">{social.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="contact-card contact-hours-card">
              <Title level={5}>Giờ làm việc</Title>
              <div>
                <p><b>Thứ Hai - Thứ Sáu:</b> 9:00 SÁNG - 6:00 TỐI</p>
                <p><b>Thứ Bảy:</b> 10:00 SÁNG - 4:00 CHIỀU</p>
                <p><b>Chủ Nhật:</b> Đóng cửa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-map-section">
          <div className="contact-map-wrapper">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9315079324944!2d105.81296347596015!3d21.036952280613947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab1dbf34b2bb%3A0x4c3d2c6b5d6a10c3!2zMjY2IMSQ4buZaSBD4bqlbiwgTGl4YSBHaWFpLCBCw6AgxJDhuqFpLCBIw6AgTuG7mWkgMTAwMDA!5e0!3m2!1svi!2s!4v1695200100123!5m2!1svi!2s"
              loading="lazy"
              className="contact-map-iframe"
              allowFullScreen
            />
            <div className="contact-map-overlay">
              <EnvironmentOutlined className="map-icon" />
              <div className="map-text">
                <h3>Trụ sở chính</h3>
                <p>279 Mai Dang Chon, Hoa Quy, Da Nang City</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;