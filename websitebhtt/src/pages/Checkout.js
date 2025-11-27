import React, { useState, useEffect } from 'react';
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
  Tag,
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
  WalletOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import '../style/Checkout.css'; // Sử dụng file CSS

import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // <-- THÊM MỚI
import { useOrder } from '../context/OrderContext'; // <-- THÊM MỚI (Context đếm count)
import { useOrderHistory } from '../context/OrderHistoryContext'; // <-- THÊM MỚI (Context lưu lịch sử)
import { useWeb3 } from '../context/Web3Context'; // <-- THÊM: Web3 Context
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper function to format wallet address
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();

  // --- Lấy Contexts ---
  const { currentUser } = useAuth(); // <-- THÊM MỚI
  const { addConfirmingOrder } = useOrder(); // <-- THÊM MỚI
  const { addOrderToHistory } = useOrderHistory(); // <-- THÊM MỚI
  
  // --- Web3 Context cho MetaMask ---
  const { 
    account, 
    balance, 
    chainId,
    isConnecting, 
    isProcessingPayment,
    connectWallet, 
    disconnectWallet, 
    payWithETH,
    convertUSDtoETH,
    convertVNDtoETH,
    getNetworkName,
    isUserDisconnected,
    isMetaMaskInstalled,
  } = useWeb3();
  const { i18n } = useTranslation();
  const currency = i18n.language === 'vi' ? 'VND' : 'USD';

  // --- States (giữ nguyên) ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [walletStatus, setWalletStatus] = useState(Boolean(account && !isUserDisconnected)); // Track wallet status
  const [orderTotals, setOrderTotals] = useState({
    total: 0,
    discount: 0,
    shipping: 0,
    subtotal: 0,
  });
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [cryptoTxInfo, setCryptoTxInfo] = useState(null); // Thông tin giao dịch crypto

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
  const defaultBaseDeliveryFee = subtotal > 0 ? 20 : 0;
  const deliveryFee = (passedState.finalDeliveryFee ?? defaultBaseDeliveryFee);
  const total = subtotal + deliveryFee - discount;

  const discountLabel = passedState.appliedCouponName
    ? `Giảm giá (${passedState.appliedCouponName})`
    : "Giảm giá";
  const shippingLabel = passedState.appliedShippingRuleName
    ? `Phí Vận chuyển (${passedState.appliedShippingRuleName})`
    : "Phí Vận chuyển";

  // Track account changes to trigger component re-render

  // --- Estimate gas for payment ---
  const estimateGasForPayment = async (amount, currency) => {
    try {
      if (!account) {
        return null;
      }
      
      // Convert amount to ETH
      const ethAmountStr = currency === 'VND' ? convertVNDtoETH(amount) : convertUSDtoETH(amount);
      const ethAmount = parseFloat(ethAmountStr || '0');
      
      // Simple gas estimation (you can enhance this with actual web3 gas estimation)
      const estimatedGasPrice = 0.00001; // Example gas price in ETH
      const estimatedGasLimit = 21000; // Standard ETH transfer gas limit
      const estimatedGasFee = (estimatedGasPrice * estimatedGasLimit);
      
      return {
        ethAmount,
        gasPrice: estimatedGasPrice,
        gasLimit: estimatedGasLimit,
        gasFee: estimatedGasFee,
        totalCost: ethAmount + estimatedGasFee,
      };
    } catch (error) {
      console.error('[Checkout] Gas estimation error:', error);
      return null;
    }
  };

  // --- Xử lý thanh toán bằng MetaMask (tách ra thành hàm) ---
  const handleCryptoPayment = async (formValues) => {
    // Kiểm tra kết nối ví
    if (!account) {
      const connected = await connectWallet();
      if (!connected) return false;
    }

    // Determine currency (VND if vi, else USD)
    const currency = i18n.language === 'vi' ? 'VND' : 'USD';
    // Convert to ETH for pre-check
    const ethAmountStr = currency === 'VND' ? convertVNDtoETH(total) : convertUSDtoETH(total);
    const ethAmountNum = parseFloat(ethAmountStr || '0');
    const walletBalanceNum = parseFloat(balance || '0');

    // If balance insufficient, show a warning
    if (walletBalanceNum < ethAmountNum) {
      message.error('Số dư ví không đủ để thanh toán. Vui lòng kiểm tra ví.');
      return false;
    }

    // Thực hiện thanh toán
    const result = await payWithETH(total, currency, {
      orderId: Date.now(),
      items: effectiveItems,
    });

    if (result.success) {
      setCryptoTxInfo(result);
      return true;
    }
    console.debug('[Checkout] Crypto payment failed ->', result);
    message.error(result?.error || 'Thanh toán bằng Crypto thất bại.');
    return false;
  };

  // --- Finalize order after successful payment or for non-crypto payment ---
  const finalizeOrder = (allFormInfo) => {
    addOrderToHistory(effectiveItems, { total, discount, shipping: deliveryFee, subtotal }, allFormInfo); // ⭐ SỬA: Gọi với 3 tham số
    addConfirmingOrder();           // Tăng số đếm (badge)

    setOrderedItems(Array.isArray(effectiveItems) ? [...effectiveItems] : []);
    setOrderTotals({
      total: total,
      discount: discount,
      shipping: deliveryFee,
      subtotal: subtotal,
    });
    setDeliveryInfo(allFormInfo);
    setShowSuccess(true);
    if (!buyNowItems.length) {
      clearCart();
    }
  };

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

      // 4. NẾU CHỌN THANH TOÁN CRYPTO (MetaMask)
      if (allFormInfo.payment === 'Crypto Payment') {
        console.log('[Checkout] Processing crypto payment...');
        const cryptoSuccess = await handleCryptoPayment(allFormInfo);
        
        if (cryptoSuccess) {
          console.log('[Checkout] Crypto payment successful, finalizing order...');
          finalizeOrder(allFormInfo);
        } else {
          console.log('[Checkout] Crypto payment failed or cancelled');
          return; // Don't finalize if payment failed
        }
      } else {
        // If not crypto, finalize order directly
        finalizeOrder(allFormInfo);
      }
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

  // Compute ETH requirement / balance check for UI disabling
  const getSelectedPayment = () => {
    try {
      return form.getFieldValue('payment');
    } catch (e) {
      return null;
    }
  };
  const selectedPayment = getSelectedPayment();
  const requiredEthStr = currency === 'VND' ? convertVNDtoETH(total) : convertUSDtoETH(total);
  const requiredEth = parseFloat(requiredEthStr || '0');
  const walletEth = parseFloat(balance || '0');
  const isBalanceSufficient = walletStatus ? walletEth >= requiredEth : true;

  // Update walletStatus when account or disconnect state changes
  useEffect(() => {
    setWalletStatus(Boolean(account && !isUserDisconnected));
  }, [account, isUserDisconnected]);

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
                    
                    {/* 🔥 THANH TOÁN CRYPTO - MetaMask */}
                    <Radio value="Crypto Payment" className="payment-radio crypto-payment-option">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                          alt="MetaMask" 
                          style={{ width: 24, height: 24 }} 
                        />
                        <span>Thanh toán bằng Crypto (MetaMask)</span>
                        {walletStatus ? (
                          <Tag color="green" style={{ marginLeft: 'auto' }}>
                            <CheckCircleOutlined /> Đã kết nối
                          </Tag>
                        ) : (
                          <Tag color="orange" style={{ marginLeft: 'auto' }}>
                            Chưa kết nối
                          </Tag>
                        )}
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              {/* Hiển thị thông tin ví khi chọn Crypto */}
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.payment !== curr.payment}>
                {({ getFieldValue }) => 
                  getFieldValue('payment') === 'Crypto Payment' && (
                    <Card 
                      className="crypto-payment-card"
                      size="small" 
                      style={{ 
                        marginTop: 16, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 12,
                        border: 'none',
                      }}
                    >
                      <div style={{ color: 'white' }}>
                        <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                            alt="MetaMask" 
                            style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} 
                          />
                          Thanh toán Blockchain
                        </div>
                        
                        {!walletStatus ? (
                          <Button 
                            type="default"
                            size="large"
                            onClick={connectWallet}
                            loading={isConnecting}
                            icon={<WalletOutlined />}
                            style={{ 
                              width: '100%', 
                              borderRadius: 8,
                              fontWeight: 600,
                              height: 48,
                            }}
                          >
                            {isConnecting ? 'Đang kết nối...' : 'Kết nối ví MetaMask'}
                          </Button>
                        ) : (
                            <div>
                            {console.debug('[Checkout] Rendering wallet card. account=', account, 'walletStatus=', walletStatus)}
                            <div style={{ 
                              background: 'rgba(255,255,255,0.15)', 
                              padding: 12, 
                              borderRadius: 8,
                              marginBottom: 12,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ opacity: 0.8 }}>Địa chỉ ví:</span>
                                <span style={{ fontFamily: 'monospace' }}>
                                  {formatAddress(account)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ opacity: 0.8 }}>Số dư:</span>
                                <span style={{ fontWeight: 600 }}>{parseFloat(balance).toFixed(4)} ETH</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.8 }}>Mạng:</span>
                                <Tag color="blue">{getNetworkName(chainId)}</Tag>
                              </div>
                            </div>
                            
                            <div style={{ 
                              background: total > 0 ? 'rgba(0,255,0,0.15)' : 'rgba(255,193,7,0.2)', 
                              padding: 12, 
                              borderRadius: 8,
                              marginBottom: 12,
                              textAlign: 'center',
                            }}>
                              <div style={{ opacity: 0.8, marginBottom: 4 }}>Số tiền thanh toán:</div>
                              {walletStatus && total > 0 ? (
                                <>
                                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                                      ≈ {currency === 'VND' ? convertVNDtoETH(total) : convertUSDtoETH(total)} ETH
                                  </div>
                                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                                    ({currency === 'VND' ? total.toLocaleString('vi-VN') + ' VNĐ' : `$${total.toFixed(2)} USD`})
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize: 14, color: '#ffc107' }}>
                                  ⚠️ Giỏ hàng trống - Vui lòng thêm sản phẩm
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              type="default"
                              size="small"
                              onClick={() => {
                                console.debug('[Checkout] disconnect button clicked');
                                disconnectWallet();
                              }}
                              icon={<DisconnectOutlined />}
                              style={{ width: '100%', borderRadius: 6 }}
                            >
                              Ngắt kết nối ví
                            </Button>
                          </div>
                        )}
                        
                        {!isMetaMaskInstalled() && (
                          <div style={{ 
                            marginTop: 12, 
                            textAlign: 'center',
                            padding: 12,
                            background: 'rgba(255,193,7,0.2)',
                            borderRadius: 8,
                          }}>
                            <span>⚠️ Chưa cài đặt MetaMask. </span>
                            <a 
                              href="https://metamask.io/download/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#ffd700', textDecoration: 'underline' }}
                            >
                              Tải về tại đây
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                }
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

            <Divider className="summary-divider" />
            <div className="summary-row total">
              <Title level={4}>Tổng Cộng</Title>
              <Title level={4} className="total-price">
                ${total.toFixed(2)}
              </Title>
            </div>
            
            {/* Hiển thị giá ETH nếu có ví kết nối */}
            {/* Hiển thị giá ETH khi có ví kết nối */}
                        {walletStatus && total > 0 && (
              <div style={{ 
                textAlign: 'center', 
                marginBottom: 12, 
                padding: 8, 
                background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                borderRadius: 8,
              }}>
                <Text type="secondary">≈ {currency === 'VND' ? convertVNDtoETH(total) : convertUSDtoETH(total)} ETH</Text>
              </div>
            )}
            
            {selectedPayment === 'Crypto Payment' && !isBalanceSufficient && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(255,82,82,0.06)', color: '#ff4d4f', fontWeight: 600 }}>
                ⚠️ Số dư ví của bạn ({walletEth.toFixed(4)} ETH) không đủ để thanh toán ({requiredEth.toFixed(4)} ETH). Vui lòng nạp thêm hoặc chọn phương thức khác.
              </div>
            )}

            <Button
              type="primary"
              size="large"
              block
              className="confirm-order-btn"
              onClick={handleConfirmOrder}
              disabled={effectiveItems.length === 0 || isProcessingPayment || (selectedPayment === 'Crypto Payment' && !isBalanceSufficient)}
              loading={isProcessingPayment}
            >
              {isProcessingPayment ? 'Đang xử lý thanh toán...' : 'Xác Nhận Đơn Hàng'}
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
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Giao hàng dự kiến">
                      <b>Thứ Sáu, 30/10/2025</b>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email xác nhận gửi tới">
                      <b>{deliveryInfo?.email || "N/A"}</b>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 🔗 THÔNG TIN GIAO DỊCH BLOCKCHAIN */}
                            {cryptoTxInfo && cryptoTxInfo.transactionHash && (
                    <div style={{ 
                      marginTop: 12, 
                      padding: 12, 
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                      borderRadius: 8,
                      border: '1px solid #667eea40',
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        marginBottom: 8,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#667eea',
                      }}>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                          alt="MetaMask" 
                          style={{ width: 20, height: 20 }} 
                        />
                        Thanh toán Blockchain thành công!
                      </div>
                      
                      <Descriptions column={1} size="small" style={{ fontSize: '0.85rem' }}>
                        <Descriptions.Item label="Số tiền">
                          <b>{cryptoTxInfo.amountETH} ETH</b> (~${cryptoTxInfo.amountUSD})
                        </Descriptions.Item>
                        <Descriptions.Item label="Transaction Hash">
                          <a 
                            href={`https://etherscan.io/tx/${cryptoTxInfo.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontFamily: 'monospace', 
                              fontSize: 10,
                              wordBreak: 'break-all',
                            }}
                          >
                            {cryptoTxInfo.transactionHash.substring(0, 16)}...
                          </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Block">
                          #{cryptoTxInfo.blockNumber}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}

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
                          cryptoTx: cryptoTxInfo,
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