import React, { useState } from 'react';
import { Form, Input, Button, Typography, Steps, message, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../data/authService';
import '../style/ForgotPassword.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Mock verification code
  const MOCK_CODE = '123456';

  const onFinishEmail = (values) => {
    setLoading(true);
    // Simulate API call to send code
    setTimeout(() => {
      setLoading(false);
      setEmail(values.email);
      setCurrentStep(1);
      message.success(t('verification_code_sent') || 'Mã xác nhận đã được gửi đến email của bạn (Mã giả lập: 123456)');
    }, 1000);
  };

  const onFinishVerification = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.code === MOCK_CODE) {
        setCurrentStep(2);
        message.success(t('verification_success') || 'Xác thực thành công');
      } else {
        message.error(t('invalid_code') || 'Mã xác nhận không đúng');
      }
    }, 1000);
  };

  const onFinishReset = async (values) => {
    setLoading(true);
    try {
      await resetPassword(email, values.newPassword);
      message.success(t('password_reset_success') || 'Đặt lại mật khẩu thành công');
      navigate('/login');
    } catch (error) {
      message.error(error.message || t('error_occurred') || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            className="back-to-login-btn"
            onClick={() => navigate('/login')}
        >
            {t('back_to_login') || 'Quay lại đăng nhập'}
        </Button>

        <div className="forgot-password-header">
            <Title level={2}>{t('forgot_password') || 'Quên Mật Khẩu'}</Title>
            <Text type="secondary">
                {currentStep === 0 && (t('enter_email_desc') || 'Nhập email để nhận mã xác nhận')}
                {currentStep === 1 && (t('enter_code_desc') || 'Nhập mã xác nhận đã gửi tới email')}
                {currentStep === 2 && (t('enter_new_password_desc') || 'Thiết lập mật khẩu mới')}
            </Text>
        </div>

        <Steps current={currentStep} className="forgot-password-steps">
          <Step title={t('email') || 'Email'} icon={<MailOutlined />} />
          <Step title={t('verification') || 'Xác thực'} icon={<SafetyCertificateOutlined />} />
          <Step title={t('reset') || 'Đặt lại'} icon={<LockOutlined />} />
        </Steps>

        <div className="forgot-password-content">
          {currentStep === 0 && (
            <Form name="email-form" onFinish={onFinishEmail} layout="vertical">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: t('email_required') || 'Vui lòng nhập email' },
                  { type: 'email', message: t('email_invalid') || 'Email không hợp lệ' }
                ]}
              >
                <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Email" 
                    size="large" 
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  {t('send_code') || 'Gửi mã xác nhận'}
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <Form name="verification-form" onFinish={onFinishVerification} layout="vertical">
              <Form.Item
                name="code"
                rules={[{ required: true, message: t('code_required') || 'Vui lòng nhập mã xác nhận' }]}
              >
                <Input 
                    prefix={<SafetyCertificateOutlined />} 
                    placeholder={t('verification_code') || 'Mã xác nhận'} 
                    size="large" 
                    maxLength={6}
                    style={{ letterSpacing: '4px', textAlign: 'center' }}
                />
              </Form.Item>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Text type="secondary">{t('did_not_receive_code') || 'Không nhận được mã?'} </Text>
                <Button type="link" onClick={() => message.info('Mã giả lập là: 123456')}>
                    {t('resend') || 'Gửi lại'}
                </Button>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  {t('verify') || 'Xác thực'}
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 2 && (
            <Form name="reset-form" onFinish={onFinishReset} layout="vertical">
              <Form.Item
                name="newPassword"
                rules={[
                    { required: true, message: t('password_required') || 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: t('password_min_length') || 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder={t('new_password') || 'Mật khẩu mới'} 
                    size="large" 
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('confirm_password_required') || 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('passwords_do_not_match') || 'Mật khẩu không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder={t('confirm_new_password') || 'Xác nhận mật khẩu mới'} 
                    size="large" 
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  {t('reset_password') || 'Đặt lại mật khẩu'}
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
