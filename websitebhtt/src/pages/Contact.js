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
    { icon: MailOutlined, label: 'Email', value: 'hello@company.com', href: 'mailto:hello@company.com' },
    { icon: PhoneOutlined, label: 'Điện thoại', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: EnvironmentOutlined, label: 'Địa chỉ', value: '279 Mai Dang Chon, Hoa Quy, Da Nang City', href: null }
  ];

  const socialLinks = [
    { icon: LinkedinOutlined, href: '#', label: 'LinkedIn' },
    { icon: TwitterOutlined, href: '#', label: 'Twitter' },
    { icon: GithubOutlined, href: '#', label: 'Github' },
    { icon: FacebookOutlined, href: '#', label: 'Facebook' }
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
            <Title level={3}>Gửi tin nhắn cho chúng tôi</Title>
            <Form layout="vertical" className="contact-form" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                    <Input placeholder="Nguyễn Văn A" prefix={<UserOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="john@example.com" prefix={<MailOutlined />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input placeholder="0912 345 678" prefix={<PhoneOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="subject" label="Chủ đề" rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}>
                    <Input placeholder="Chúng tôi có thể giúp gì cho bạn?" prefix={<MessageOutlined />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="message" label="Tin nhắn" rules={[{ required: true, message: 'Vui lòng nhập tin nhắn' }]}>
                <Input.TextArea rows={6} placeholder="Hãy cho chúng tôi biết thêm về yêu cầu của bạn..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" className="contact-submit-btn">Gửi Tin Nhắn</Button>
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
                      <div className="contact-info-item-icon-wrapper"><Icon className="anticon" /></div>
                      <div className="contact-info-item-content">
                        <Text strong>{item.label}</Text>
                        {item.href ? <a href={item.href}>{item.value}</a> : <p style={{ margin: 0 }}>{item.value}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="contact-card contact-social-card">
              <Title level={4}>Theo dõi chúng tôi</Title>
              <Text>Giữ kết nối và theo dõi chúng tôi trên mạng xã hội để nhận các bản cập nhật mới nhất.</Text>
              <div className="contact-social-links" style={{ marginTop: 12 }}>
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a key={index} href={social.href} aria-label={social.label} style={{ marginRight: 12 }}>
                      <Icon className="anticon" />
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

        <div style={{ marginTop: 32 }}>
          <div className="map-container">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9315079324944!2d105.81296347596015!3d21.036952280613947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab1dbf34b2bb%3A0x4c3d2c6b5d6a10c3!2zMjY2IMSQ4buZaSBD4bqlbiwgTGl4YSBHaWFpLCBCw6AgxJDhuqFpLCBIw6AgTuG7mWkgMTAwMDA!5e0!3m2!1svi!2s!4v1695200100123!5m2!1svi!2s"
              loading="lazy"
              className="contact-map-iframe"
              style={{ width: '100%', height: 360, border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;