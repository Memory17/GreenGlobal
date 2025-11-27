import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Radio,
  Button,
  Row,
  Col,
  Card,
  List,
  Avatar,
  Typography,
  Divider,
  Space,
  Result,
  Descriptions,
  message,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ScheduleOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  WalletOutlined
} from '@ant-design/icons';
import '../style/Checkout.css'; // Sử dụng file CSS

import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // <-- THÊM MỚI
import { useOrder } from '../context/OrderContext'; // <-- THÊM MỚI (Context đếm count)
import { useOrderHistory } from '../context/OrderHistoryContext'; // <-- THÊM MỚI (Context lưu lịch sử)

const { Title, Text } = Typography;
const { TextArea } = Input;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();

  // --- Lấy Contexts ---
  const { currentUser } = useAuth(); // <-- THÊM MỚI
  const { addConfirmingOrder } = useOrder(); // <-- THÊM MỚI
  const { addOrderToHistory } = useOrderHistory(); // <-- THÊM MỚI

  // --- States (giữ nguyên) ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderTotals, setOrderTotals] = useState({
    total: 0,
    discount: 0,
    shipping: 0,
    subtotal: 0,
  });
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const [form] = Form.useForm();
  const passedState = location.state || {};

  // Support both normal cart checkout and "Buy Now" flow where caller passes buyNowItems
  const buyNowItems = Array.isArray(passedState.buyNowItems) ? passedState.buyNowItems : [];
  const effectiveItems = buyNowItems.length > 0 ? buyNowItems : cartItems;

  // --- Tính toán giá (bảo vệ khi giá trị bị thiếu) ---
  const subtotal = Array.isArray(effectiveItems)
    ? effectiveItems.reduce((acc, item) => acc + ((item?.product?.price || 0) * (item?.quantity || 0)), 0)
    : 0;

  const discount = passedState.discountAmount ?? 0; // default 0 if undefined
  const luckyDiscount = passedState.luckyDiscountAmount ?? 0;
  const defaultBaseDeliveryFee = subtotal > 0 ? 20 : 0;
  const deliveryFee = (passedState.finalDeliveryFee ?? defaultBaseDeliveryFee);
  const total = Math.max(0, subtotal + deliveryFee - discount - luckyDiscount);

  const discountLabel = passedState.appliedCouponName
    ? `Giảm giá (${passedState.appliedCouponName})`
    : "Giảm giá";
  const shippingLabel = passedState.appliedShippingRuleName
    ? `Phí Vận chuyển (${passedState.appliedShippingRuleName})`
    : "Phí Vận chuyển";

  // --- Xử lý xác nhận đơn hàng (ĐÃ CẬP NHẬT) ---
  const handleConfirmOrder = async () => {
    // 1. Kiểm tra giỏ hàng / buy-now items
    if (effectiveItems.length === 0) {
      message.warning("Không có sản phẩm để thanh toán.");
      return;
    }

    // 2. KIỂM TRA ĐĂNG NHẬP (THÊM MỚI)
    if (!currentUser) {
      message.error("Vui lòng đăng nhập để hoàn tất đơn hàng.");
      navigate('/login'); // Chuyển đến trang đăng nhập
      return;
    }

    // 3. Validate form và xử lý đơn hàng
    try {
      // Validate MỘT form duy nhất (giữ nguyên)
      const allFormInfo = await form.validateFields();

      if (allFormInfo.date) {
        allFormInfo.date = allFormInfo.date.toISOString();
      }

      // 5. GỌI CẢ HAI CONTEXT (THÊM MỚI)
      addOrderToHistory(effectiveItems, { total, discount, shipping: deliveryFee, subtotal }, allFormInfo); // ⭐ SỬA: Gọi với 3 tham số
      addConfirmingOrder();           // Tăng số đếm (badge)

      // 6. Lưu state tạm thời để hiển thị popup (giữ nguyên)
      setOrderedItems(Array.isArray(effectiveItems) ? [...effectiveItems] : []);
      setOrderTotals({
        total: total,
        discount: discount,
        shipping: deliveryFee,
        subtotal: subtotal,
        luckyDiscount: luckyDiscount, // <-- THÊM MỚI
        appliedLuckyCoupon: passedState.appliedLuckyCoupon,
        useLuckyCoins: passedState.useLuckyCoins
      });
      setDeliveryInfo(allFormInfo);

      setShowSuccess(true); // Hiển thị popup thành công
      // Nếu đây là checkout từ giỏ hàng, xóa giỏ; nếu là Buy Now, giữ giỏ hàng
      if (!buyNowItems.length) {
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
      }

    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      }
    }
  };

  // --- Hàm đóng Popup (giữ nguyên) ---
  const handleClosePopup = () => {
    setShowSuccess(false);
    navigate("/"); // Chuyển về trang chủ
  };

  /*
  useEffect(() => {
    if (cartItems.length === 0 && !showSuccess) {
      navigate('/cart');
    }
  }, [cartItems.length, showSuccess, navigate]);
  */

  // --- PHẦN RENDER JSX (giữ nguyên) ---
  return (
    <div className="checkout-page-container">
      <Title level={2} className="checkout-title">Hoàn Tất Thanh Toán</Title>

      <Row gutter={[32, 32]}>
        {/* Cột bên trái: Thông tin và Thanh toán */}
        <Col xs={24} lg={16}>

          <Form form={form} layout="vertical" className="checkout-form">

            {/* 1. Thông tin Giao Hàng */}
            <Card title="1. Thông Tin Giao Hàng" className="checkout-card">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Họ và Tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Số Điện Thoại" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Địa chỉ (Số nhà, Tên đường, Phường/Xã)" />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="city"
                    rules={[{ required: true, message: 'Vui lòng nhập Tỉnh/Thành phố!' }]}
                  >
                    <Input prefix={<EnvironmentOutlined />} placeholder="Tỉnh / Thành phố" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="state"
                    rules={[{ required: true, message: 'Vui lòng nhập Quận/Huyện!' }]}
                  >
                    <Input prefix={<EnvironmentOutlined />} placeholder="Quận / Huyện" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="zip" >
                <Input prefix={<EnvironmentOutlined />} placeholder="Mã Zip/Bưu điện (Không bắt buộc)" />
              </Form.Item>
            </Card>

            {/* 2. Lịch Giao Hàng */}
            <Card title="2. Lịch Hẹn Giao Hàng" className="checkout-card">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="date"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày giao!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày giao"
                      format="DD/MM/YYYY"
                      suffixIcon={<ScheduleOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="note">
                    <TextArea rows={1} placeholder="Ghi chú cho người giao hàng..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. Phương Thức Thanh Toán */}
            <Card title="3. Phương Thức Thanh Toán" className="checkout-card">
              <Form.Item
                name="payment"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                className="payment-form-item"
              >
                <Radio.Group style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="Online Payment" className="payment-radio">
                      <CreditCardOutlined /> Thanh toán Online (Thẻ Tín dụng/Ghi nợ)
                    </Radio>
                    <Radio value="Card on Delivery" className="payment-radio">
                      <WalletOutlined /> Quẹt Thẻ khi Nhận hàng (POS)
                    </Radio>
                    <Radio value="Cash on Delivery" className="payment-radio">
                      <DollarCircleOutlined /> Thanh toán bằng Tiền mặt (COD)
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Card>

          </Form>

        </Col>

        {/* Cột bên phải: Tóm Tắt Đơn Hàng */}
        <Col xs={24} lg={8}>
          <Card title="Tóm Tắt Đơn Hàng" className="order-summary-card">
            <List
              itemLayout="horizontal"
              dataSource={effectiveItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.product.thumbnail} shape="square" size={64} />}
                    title={<Text strong>{item.product?.title || 'Untitled'} (x{item.quantity || 0})</Text>}
                    description={`$${((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2)}`}
                  />
                </List.Item>
              )}
            />
            <Divider className="summary-divider" />

            <div className="summary-row">
              <Text>Tạm tính</Text>
              <Text strong>${subtotal.toFixed(2)}</Text>
            </div>
            <div className="summary-row">
              <Text>{shippingLabel}</Text>
              <Text strong>${deliveryFee.toFixed(2)}</Text>
            </div>
            <div className="summary-row discount">
              <Text>{discountLabel}</Text>
              <Text strong>- ${discount.toFixed(2)}</Text>
            </div>
            {luckyDiscount > 0 && (
              <div className="summary-row discount">
                <Text style={{ color: '#fa8c16' }}>
                  Phần thưởng vòng quay
                  {passedState.appliedLuckyCoupon ? ` (${passedState.appliedLuckyCoupon.label})` : ''}
                  {passedState.useLuckyCoins && passedState.appliedLuckyCoupon ? ' + Xu' : (passedState.useLuckyCoins ? ' (Xu)' : '')}
                </Text>
                <Text strong style={{ color: '#fa8c16' }}>- ${luckyDiscount.toFixed(2)}</Text>
              </div>
            )}

            <Divider className="summary-divider" />
            <div className="summary-row total">
              <Title level={4}>Tổng Cộng</Title>
              <Title level={4} className="total-price">
                ${total.toFixed(2)}
              </Title>
            </div>
            <Button
              type="primary"
              size="large"
              block
              className="confirm-order-btn"
              onClick={handleConfirmOrder}
              disabled={cartItems.length === 0}
            >
              Xác Nhận Đơn Hàng
            </Button>
          </Card>
        </Col>
      </Row>

      {/* POPUP Đặt hàng thành công */}
      {showSuccess && (
        <div className="order-success-overlay">
          <div className="order-success-div">
            <Result
              status="success"
              title="Cảm ơn bạn đã đặt hàng!"
              subTitle={
                <>
                  <Text className="text-success">Mã đơn hàng của bạn: </Text>
                  {/* Bạn có thể lấy ID đơn hàng thật từ Context nếu muốn,
                      nhưng làm vậy sẽ phức tạp hơn. Giữ tạm mã giả: */}
                  <div className="id-order-succcess">#LM20251027</div>
                </>
              }
              extra={
                <div className="order-success-details">
                  <Descriptions column={1} size="default" bordered>
                    <Descriptions.Item label="Giao hàng dự kiến">
                      {/* TODO: Tính ngày giao dựa trên ngày đặt */}
                      <b>Thứ Sáu, 30/10/2025</b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email xác nhận gửi tới">
                      <b>{deliveryInfo?.email || "N/A"}</b>
                    </Descriptions.Item>
                  </Descriptions>

                  <Text className="spam-warning">
                    Vui lòng kiểm tra thư mục <b>Spam</b> nếu bạn không thấy
                    email.
                  </Text>

                  <Text
                    className="review-your-order"
                    onClick={() =>
                      navigate("/revieworder", { // Chức năng review này vẫn hoạt động
                        state: {
                          items: orderedItems,
                          totals: orderTotals,
                          delivery: deliveryInfo,
                        },
                      })
                    }
                  >
                    Xem lại đơn hàng
                  </Text>

                  <Button
                    type="primary"
                    onClick={handleClosePopup}
                    size="large"
                    style={{ marginTop: 24, width: "100%" }}
                    className="confirm-order-btn"
                  >
                    Tiếp Tục Mua Sắm
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;