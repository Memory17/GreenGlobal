import React from 'react';
import { Button, Space, Typography, Avatar } from 'antd';
import { CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useTranslation } from 'react-i18next';
import '../style/CompareFloatingBar.css';

const { Text } = Typography;

const CompareFloatingBar = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (compareItems.length === 0 || location.pathname === '/compare') {
    return null;
  }

  return (
    <div className="compare-floating-bar">
      <div className="compare-bar-content">
        <div className="compare-info">
          <Text strong style={{ color: '#fff', marginRight: 16 }}>
            {t('compare_products', { count: compareItems.length }) || `So sánh (${compareItems.length})`}
          </Text>
          <Space>
            {compareItems.map(item => (
              <div key={item.id} className="compare-item-preview">
                <Avatar shape="square" src={item.thumbnail} size="large" />
                <Button 
                  type="text" 
                  icon={<CloseOutlined style={{ fontSize: 10, color: '#fff' }} />} 
                  className="remove-btn"
                  onClick={() => removeFromCompare(item.id)}
                />
              </div>
            ))}
          </Space>
        </div>
        <Space>
          <Button onClick={clearCompare} ghost size="small">
            {t('clear_all') || "Xóa tất cả"}
          </Button>
          <Button 
            type="primary" 
            icon={<SwapOutlined />} 
            onClick={() => navigate('/compare')}
          >
            {t('compare_now') || "So sánh ngay"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CompareFloatingBar;
