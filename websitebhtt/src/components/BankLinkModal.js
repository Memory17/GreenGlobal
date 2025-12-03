import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography, Space } from 'antd';
import { BankOutlined, CreditCardOutlined, UserOutlined, SafetyCertificateOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../style/BankLinkModal.css';

const { Option } = Select;
const { Title, Text } = Typography;

const banks = [
  { id: 'vcb', name: 'Vietcombank', shortName: 'VCB', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-Vietcombank.png', color: 'linear-gradient(135deg, #004d26 0%, #00c055 100%)' },
  { id: 'tcb', name: 'Techcombank', shortName: 'TCB', logo: 'https://api.vietqr.io/img/TCB.png', color: 'linear-gradient(135deg, #c90000 0%, #ff4d4f 100%)' },
  { id: 'mb', name: 'MB Bank', shortName: 'MB', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-MB-Bank-MBB.png', color: 'linear-gradient(135deg, #1200D5 0%, #3b82f6 100%)' },
  { id: 'acb', name: 'ACB', shortName: 'ACB', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-ACB.png', color: 'linear-gradient(135deg, #0067AC 0%, #40a9ff 100%)' },
  { id: 'bidv', name: 'BIDV', shortName: 'BIDV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Logo_BIDV.svg/512px-Logo_BIDV.svg.png', color: 'linear-gradient(135deg, #209F84 0%, #52c41a 100%)' },
  { id: 'vtb', name: 'VietinBank', shortName: 'VietinBank', logo: 'https://api.vietqr.io/img/ICB.png', color: 'linear-gradient(135deg, #005BAA 0%, #1890ff 100%)' },
  { id: 'tp', name: 'TPBank', shortName: 'TPBank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-TPBank.png', color: 'linear-gradient(135deg, #6F2C91 0%, #b37feb 100%)' },
];

const BankLinkModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        message.success(t('bank_link_success'));
        form.resetFields();
        setSelectedBank(null);
        setCardNumber('');
        setCardName('');
        onClose();
      }, 1500);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedBank(null);
    setCardNumber('');
    setCardName('');
    onClose();
  };

  const handleBankChange = (value) => {
    const bank = banks.find(b => b.id === value);
    setSelectedBank(bank);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SafetyCertificateOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
          <span>{t('bank_link_title')}</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      centered
      width={500}
      className="bank-link-modal"
    >
      {/* Virtual Card Preview */}
      <div className="virtual-card-container">
        <div 
          className="virtual-card"
          style={{ background: selectedBank ? selectedBank.color : 'linear-gradient(135deg, #333 0%, #555 100%)' }}
        >
          <div className="card-top">
            <div className="card-chip"></div>
            {selectedBank && (
              <img src={selectedBank.logo} alt="Bank Logo" className="card-bank-logo" />
            )}
          </div>
          <div className="card-number">
            {cardNumber ? cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
          </div>
          <div className="card-bottom">
            <div className="card-holder">
              <div className="card-holder-label">{t('card_holder_label')}</div>
              <div className="card-holder-name">{cardName || t('card_holder_placeholder')}</div>
            </div>
            <div className="card-brand">
              {selectedBank ? selectedBank.shortName : 'BANK'}
            </div>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        name="bank_link_form"
        initialValues={{}}
        className="modern-form"
      >
        <Form.Item
          name="bankId"
          label={t('select_bank_label')}
          rules={[{ required: true, message: t('select_bank_required') }]}
        >
          <Select 
            placeholder={t('select_bank_placeholder')} 
            onChange={handleBankChange}
            size="large"
            suffixIcon={<BankOutlined />}
            getPopupContainer={(trigger) => trigger.parentNode}
            className="modern-select"
          >
            {banks.map(bank => (
              <Option key={bank.id} value={bank.id}>
                <Space align="center">
                  <img 
                    src={bank.logo} 
                    alt={bank.shortName} 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      objectFit: 'contain',
                      borderRadius: '4px',
                      display: 'block'
                    }} 
                  />
                  <span style={{ fontWeight: 500 }}>{bank.name}</span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="accountNumber"
          label={t('account_number_label')}
          rules={[
            { required: true, message: t('account_number_required') },
            { pattern: /^[0-9]+$/, message: t('account_number_numeric') },
            { min: 6, message: t('account_number_min') }
          ]}
        >
          <Input 
            prefix={<CreditCardOutlined style={{ color: '#1890ff' }} />} 
            placeholder={t('account_number_placeholder')} 
            size="large"
            className="modern-input"
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
          />
        </Form.Item>

        <Form.Item
          name="accountName"
          label={t('account_name_label')}
          rules={[
            { required: true, message: t('account_name_required') },
            { pattern: /^[a-zA-Z\s]+$/, message: t('account_name_pattern') }
          ]}
        >
          <Input 
            prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
            placeholder={t('account_name_placeholder')} 
            style={{ textTransform: 'uppercase' }}
            size="large"
            className="modern-input"
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
          />
        </Form.Item>

        <div className="security-note">
          <LockOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <Text style={{ fontSize: '13px', color: '#555' }}>
            {t('security_note')}
          </Text>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            onClick={handleOk}
            className="submit-btn-gradient"
          >
            {t('link_now_button')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BankLinkModal;
