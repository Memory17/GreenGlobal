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

// Hàm helper để format ngày (Từ ISO string sang dd/MM/yyyy, HH:mm)
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
    return 'Ngày không hợp lệ';
  }
};

// === COMPONENT CHÍNH ===

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { orderHistory } = useOrderHistory(); // Lấy mảng lịch sử từ context

  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
  if (!currentUser) {
    return (
      <div style={{ padding: '2rem', minHeight: '60vh' }}>
        <Card>
          <Empty description="Vui lòng đăng nhập để xem lịch sử đơn hàng." />
        </Card>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP, KHÔNG CÓ ĐƠN HÀNG
  // (Context đã khởi tạo orderHistory là [], nên không cần check loading/spin)
  if (orderHistory.length === 0) {
    return (
      <div style={{ padding: '2rem', minHeight: '60vh' }}>
        <Title level={2}>Lịch sử Đơn hàng</Title>
        <Text>
          Xin chào <Text strong>{currentUser.email}</Text>, bạn chưa có đơn hàng nào.
        </Text>
        <Divider />
        <Card>
          <Empty description="Bạn chưa có đơn hàng nào." />
        </Card>
      </div>
    );
  }

  // TRƯỜNG HỢP 3: ĐÃ ĐĂNG NHẬP VÀ CÓ ĐƠN HÀNG
  // (Context của chúng ta đã lưu đơn hàng mới nhất lên đầu, không cần sort)
  return (
    <div className="order-history-container" style={{ padding: '2rem' }}>
      <Title level={2}>Lịch sử Đơn hàng</Title>
      <Text>
        Xin chào <Text strong>{currentUser.email}</Text>, bạn có tổng cộng{' '}
        <Text strong>{orderHistory.length}</Text> đơn hàng.
      </Text>
      
      <Divider />

      <Collapse accordion defaultActiveKey={[orderHistory[0]?.id]}>
        {orderHistory.map((order) => (
          <Panel
            key={order.id}
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                <Text strong>Đơn hàng: {order.id}</Text>
                <Text>Ngày đặt: {formatDate(order.orderDate)}</Text>
                <Tag color={order.status === 'Processing' ? 'blue' : 'green'}>
                  {order.status || 'Processing'}
                </Tag>
              </div>
            }
          >
            {/* 1. Chi tiết sản phẩm */}
            <Title level={5} style={{ marginTop: 0 }}>Chi tiết sản phẩm</Title>
            <List
              itemLayout="horizontal"
              dataSource={order.items || []} // Đảm bảo items là mảng
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.product?.thumbnail} shape="square" />}
                    title={`${item.product?.title || 'Sản phẩm không rõ'} (x${item.quantity})`}
                    description={`Đơn giá: ${formatCurrency(item.product?.price)}`}
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
            <Title level={5}>Chi tiết Thanh toán</Title>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Tạm tính">
                {formatCurrency(order.totals?.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí Vận chuyển">
                {formatCurrency(order.totals?.shipping)}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <Text type="danger">
                  - {formatCurrency(order.totals?.discount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Cộng">
                <Text strong style={{ fontSize: '1.1rem' }}>
                  {formatCurrency(order.totals?.total)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.delivery?.payment || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />

            {/* 3. Thông tin người nhận */}
            <Title level={5}>Thông tin người nhận</Title>
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
                Ngày giao mong muốn: {formatDate(order.delivery?.date)}
              </Descriptions.Item>
              {order.delivery?.note && (
                <Descriptions.Item label="Ghi chú">
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