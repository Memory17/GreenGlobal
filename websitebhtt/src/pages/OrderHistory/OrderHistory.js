import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrderHistory } from '../../context/OrderHistoryContext'; // Dùng context lịch sử
import {
  Typography,
  Collapse,
  List,
  Avatar,
  Descriptions,
  Empty,
 
  Tag,
  Divider,
  Card,
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  ScheduleOutlined // Thêm icon cho ngày
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
 import '../../pages/OrderHistory/OrderHistory.css'; // Bạn có thể tạo file này để style thêm

const { Title, Text } = Typography;
const { Panel } = Collapse;

// === HÀM HỖ TRỢ ===

// Hàm helper để format tiền tệ (Giả định là $ theo Checkout.js)
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    amount = 0;
  }
  return `$${amount.toFixed(2)}`;
};

// === COMPONENT CHÍNH ===

const OrderHistory = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { orderHistory } = useOrderHistory(); // Lấy mảng lịch sử từ context

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return t('invalid_date');
    }
  };

  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
  if (!currentUser) {
    return (
      <div style={{ padding: '2rem', minHeight: '60vh' }}>
        <Card>
          <Empty description={t('login_to_view_history')} />
        </Card>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP, KHÔNG CÓ ĐƠN HÀNG
  // (Context đã khởi tạo orderHistory là [], nên không cần check loading/spin)
  if (orderHistory.length === 0) {
    return (
      <div style={{ padding: '2rem', minHeight: '60vh' }}>
        <Title level={2}>{t('order_history_page_title')}</Title>
        <Text>
          {t('hello')} <Text strong>{currentUser.email}</Text>, {t('no_orders_yet')}
        </Text>
        <Divider />
        <Card>
          <Empty description={t('empty_orders_description')} />
        </Card>
      </div>
    );
  }

  // TRƯỜNG HỢP 3: ĐÃ ĐĂNG NHẬP VÀ CÓ ĐƠN HÀNG
  // (Context của chúng ta đã lưu đơn hàng mới nhất lên đầu, không cần sort)
  return (
    <div className="order-history-container" style={{ padding: '2rem' }}>
      <Title level={2}>{t('order_history_page_title')}</Title>
      <Text>
        {t('hello')} <Text strong>{currentUser.email}</Text>, {t('you_have_total')}{' '}
        <Text strong>{orderHistory.length}</Text> {t('orders_count_suffix')}
      </Text>
      
      <Divider />

      <Collapse accordion defaultActiveKey={[orderHistory[0]?.id]}>
        {orderHistory.map((order) => (
          <Panel
            key={order.id}
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                <Text strong>{t('order_label')} {order.id}</Text>
                <Text>{t('order_date_label')} {formatDate(order.orderDate)}</Text>
                <Tag color={order.status === 'Processing' ? 'blue' : 'green'}>
                  {order.status === 'Processing' ? t('status_processing') : order.status}
                </Tag>
              </div>
            }
          >
            {/* 1. Chi tiết sản phẩm */}
            <Title level={5} style={{ marginTop: 0 }}>{t('product_details')}</Title>
            <List
              itemLayout="horizontal"
              dataSource={order.items || []} // Đảm bảo items là mảng
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.product?.thumbnail} shape="square" />}
                    title={`${item.product?.title || t('unknown_product')} (x${item.quantity})`}
                    description={`${t('unit_price')} ${formatCurrency(item.product?.price)}`}
                  />
                  <div>
                    <Text strong>
                      {formatCurrency((item.product?.price || 0) * item.quantity)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            
            <Divider />

            {/* 2. Chi tiết thanh toán */}
            <Title level={5}>{t('payment_details')}</Title>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('subtotal')}>
                {formatCurrency(order.totals?.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label={t('shipping_fee')}>
                {formatCurrency(order.totals?.shipping)}
              </Descriptions.Item>
              <Descriptions.Item label={t('discount')}>
                <Text type="danger">
                  - {formatCurrency(order.totals?.discount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('total_label')}>
                <Text strong style={{ fontSize: '1.1rem' }}>
                  {formatCurrency(order.totals?.total)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('payment_method_label')}>
                {order.delivery?.payment || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />

            {/* 3. Thông tin người nhận */}
            <Title level={5}>{t('recipient_info')}</Title>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={<UserOutlined />}>
                {order.delivery?.name}
              </Descriptions.Item>
              <Descriptions.Item label={<PhoneOutlined />}>
                {order.delivery?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<MailOutlined />}>
                {order.delivery?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<HomeOutlined />}>
                {`${order.delivery?.address || ''}, ${order.delivery?.state || ''}, ${order.delivery?.city || ''}`}
                {order.delivery?.zip ? `, ${order.delivery.zip}` : ''}
              </Descriptions.Item>
               <Descriptions.Item label={<ScheduleOutlined />}>
                {t('delivery_date_label')} {formatDate(order.delivery?.date)}
              </Descriptions.Item>
              {order.delivery?.note && (
                <Descriptions.Item label={t('note_label')}>
                  {order.delivery.note}
                </Descriptions.Item>
              )}
            </Descriptions>
            
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default OrderHistory;