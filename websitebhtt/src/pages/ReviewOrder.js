import React, { useState, useEffect } from "react";
import {
  Typography,
  Row,
  Col,
  Divider,
  Button,
  Table,
  Image,
  Descriptions,
  Modal,
  Radio,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import "../style/ReviewOrder.css";
import {
  EnvironmentFilled,
  TruckFilled,
  CreditCardOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ProfileOutlined,
  FileDoneOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // <-- Nhớ cài đặt dayjs
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const ReviewOrder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận dữ liệu BAN ĐẦU từ location.state
  const initialDelivery = location.state?.delivery || {
    name: t('not_specified') || "Chưa xác định",
    phone: t('not_specified') || "Chưa xác định",
    email: t('not_specified') || "Chưa xác định",
    address: t('not_specified') || "Chưa xác định",
    city: t('not_specified') || "Chưa xác định",
    state: t('not_specified') || "Chưa xác định",
    zip: t('not_specified') || "Chưa xác định",
    date: null,
    note: t('none') || "Không có",
    payment: t('not_specified') || "Chưa chỉ định",
  };
  const { items, totals } = location.state || {
    items: [],
    totals: { subtotal: 0, discount: 0, shipping: 0, total: 0 },
  };

  // Fallback calculation for lucky discount if missing
  const luckyDiscountValue = totals.luckyDiscount !== undefined 
      ? totals.luckyDiscount 
      : Math.max(0, totals.subtotal + totals.shipping - totals.discount - totals.total);

  // State cho Thông tin Giao hàng
  const [currentDelivery, setCurrentDelivery] = useState(initialDelivery);
  const [isShipToModalVisible, setIsShipToModalVisible] = useState(false);
  const [shipToForm] = Form.useForm();

  const showShipToModal = () => {
    shipToForm.setFieldsValue({
      ...currentDelivery,
      // Chuyển chuỗi ngày thành đối tượng dayjs để hiển thị trong DatePicker
      date: currentDelivery.date ? dayjs(currentDelivery.date) : null,
    });
    setIsShipToModalVisible(true);
  };

  const handleShipToOk = async () => {
    try {
      const values = await shipToForm.validateFields();
      const updatedDelivery = {
        ...values,
        // Chuyển đối tượng dayjs trở lại thành chuỗi (hoặc định dạng mong muốn)
        date: values.date ? values.date.format("YYYY-MM-DD") : null,
      };
      setCurrentDelivery((prev) => ({
        ...prev,
        ...updatedDelivery,
      }));
      setIsShipToModalVisible(false);
    } catch (errorInfo) {
      console.log("Xác thực thất bại:", errorInfo);
    }
  };

  const handleShipToCancel = () => {
    setIsShipToModalVisible(false);
  };

  // State cho Thanh toán
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(initialDelivery.payment);

  useEffect(() => {
    setPaymentMethod(initialDelivery.payment);
  }, [initialDelivery.payment]);

  const showPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handlePaymentOk = (newMethod) => {
    setPaymentMethod(newMethod);
    setCurrentDelivery((prev) => ({
      ...prev,
      payment: newMethod,
    }));
    setIsPaymentModalVisible(false);
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalVisible(false);
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: t('products'),
      dataIndex: "name",
      key: "product",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="product-image-wrapper">
            <Image src={record.image} preview={false} />
          </div>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">${record.price.toFixed(2)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: t('stock'),
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Text type={stock > 0 ? "success" : "danger"}>
          {stock > 0 ? t('in_stock') : t('out_of_stock')}
        </Text>
      ),
    },
    {
      title: t('qty'),
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: t('amount'),
      dataIndex: "subtotal",
      key: "subtotal",
      render: (val) => <Text strong>${val}</Text>,
    },
  ];

  // Xử lý dữ liệu sản phẩm
  const processedData = items.map((item) => ({
    key: item.product.id,
    image: item.product.thumbnail,
    name: item.product.title,
    price: item.product.price,
    stock: item.product.stock,
    qty: item.quantity,
    subtotal: (item.product.price * item.quantity).toFixed(2),
  }));

  // Helper format ngày
  const formattedDate = currentDelivery.date
    ? new Date(currentDelivery.date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t('not_specified') || "Chưa chỉ định";

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "Online Payment": return t('payment_online_short');
      case "Card on Delivery": return t('payment_card_on_delivery');
      case "POS on Delivery": return t('payment_pos_on_delivery');
      default: return method;
    }
  };

  return (
    <div className="review-order">
      <Text className="big-title">
        {t('review_order_message')}
      </Text>
      <br />
      <EnvironmentFilled style={{ color: "green" }} /> <br />

      {/* --- HÀNG 1: SHIP TO, PAYMENT, SUMMARY --- */}
      <Row className="ship-to-payment" gutter={[16, 24]}>
        {/* "GIAO HÀNG ĐẾN" */}
        <Col className="ship-to" xs={24} md={12} lg={8}>
          <Title level={3} className="ship-to-title">
            <span className="title-content-wrapper">
              <TruckFilled style={{ color: "green", marginRight: "10px" }} />
              {t('ship_to')}
            </span>
            <Text
              strong
              className="change-info-text"
              onClick={showShipToModal}
            >
              {t('change')}
              <EditOutlined style={{ marginLeft: 5, color: "#1890ff" }} />
            </Text>
          </Title>
          <br />
          <div className="ship-to-div">
            {currentDelivery ? (
              <Descriptions
                column={1}
                bordered
                size="small"
                className="delivery-descriptions"
              >
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> {t('full_name')}
                    </>
                  }
                >
                  {currentDelivery.name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> {t('phone_number')}
                    </>
                  }
                >
                  {currentDelivery.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> {t('email')}
                    </>
                  }
                >
                  {currentDelivery.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <HomeOutlined /> {t('address')}
                    </>
                  }
                >
                  {`${currentDelivery.address}, ${currentDelivery.city}, ${currentDelivery.state} ${
                    currentDelivery.zip || ""
                  }`}
                </Descriptions.Item>
                <Descriptions.Item label={t('delivery_date_label')}>
                  {formattedDate}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <ProfileOutlined /> {t('note')}
                    </>
                  }
                >
                  {currentDelivery.note || t('none')}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text>{t('no_delivery_info')}</Text>
            )}
          </div>
        </Col>

        {/* "THANH TOÁN" */}
        <Col className="payment-review" xs={24} md={12} lg={9}>
          <Title level={3} className="ship-to-title">
            <span className="title-content-wrapper">
              <CreditCardOutlined
                style={{ color: "green", marginRight: "10px" }}
              />
              {t('payment_method')}
            </span>
            <Text
              strong
              className="change-info-text"
              onClick={() => showPaymentModal()}
            >
              {t('change')}
              <EditOutlined style={{ marginLeft: 5, color: "#1890ff" }} />
            </Text>
          </Title>
          <br />
          <div className="payment-review-div">
            <div className="payment-review-parent">
            </div>
            <div className="visa-title">
              <Title className="visa-name" level={3}>
                {getPaymentMethodLabel(paymentMethod)}
              </Title>
            </div>
            <div className="billing-address">
              <Text className="billing-address-title" strong>
                {t('billing_address')}{" "}
              </Text>
              <Text className="billing-address-detail">
                {currentDelivery?.address || t('not_specified')}
              </Text>
            </div>
            <Divider dashed />
            <div className="add-gift">
              <Text className="apply-gift">{getPaymentMethodLabel(paymentMethod)}</Text>
            </div>
          </div>
        </Col>

        {/* "TÓM TẮT" */}
        <Col className="summary-review" xs={24} md={24} lg={7}>
          <Title level={3} className="ship-to-title">
            <span className="title-content-wrapper">
              <FileDoneOutlined
                style={{ color: "green", marginRight: "10px" }}
              />
              {t('summary')}
            </span>
          </Title>
          <div className="summary-review-div">
            <div className="subtotal">
              <Text className="subtotal-text">{t('subtotal')}</Text>
              <Text className="subtotal-value">
                ${totals.subtotal.toFixed(2)}
              </Text>
            </div>
            <div className="shipping">
              <Text className="shipping-text" style={{ color: "red" }}>
                {t('discount')}
              </Text>
              <Text className="shipping-value" style={{ color: "red" }}>
                -${totals.discount.toFixed(2)}
              </Text>
            </div>
            {(luckyDiscountValue > 0) && (
                <div className="shipping">
                  <Text className="shipping-text" style={{ color: "#fa8c16" }}>
                    {t('lucky_wheel_reward')}
                    {totals.appliedLuckyCoupon ? ` (${totals.appliedLuckyCoupon.label})` : ''}
                    {totals.useLuckyCoins && totals.appliedLuckyCoupon ? ` + ${t('lucky_coins')}` : (totals.useLuckyCoins ? ` (${t('lucky_coins')})` : '')}
                  </Text>
                  <Text className="shipping-value" style={{ color: "#fa8c16" }}>
                    -${luckyDiscountValue.toFixed(2)}
                  </Text>
                </div>
            )}
            <div className="shipping">
              <Text className="shipping-text">{t('shipping_fee')}</Text>
              <Text className="shipping-value">
                ${totals.shipping.toFixed(2)}
              </Text>
            </div>
            <Divider />
            <div className="total">
              <Text className="total-text">{t('total')}</Text>
              <Text className="total-value-review">
                ${totals.total.toFixed(2)}
              </Text>
            </div>
            <div className="button-review-order">
              <Button
                className="save-order"
                type="primary"
                onClick={() => navigate("/")}
              >
                {t('back_to_home')}
              </Button>
              <Button
                className="cancel-order"
                type="secondary"
                onClick={() => navigate("/contact")}
              >
                {t('contact_support')}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* --- HÀNG 2: CHI TIẾT ĐƠN HÀNG --- */}
      <div className="order-detail-review">
        <EnvironmentFilled className="icon-order-detail" /> <br />
        <Title level={3}>{t('order_details')}</Title>
      </div>

      <Row className="order-detail-and-method" gutter={16}>
        <Col className="order-detail-and-method-left" span={24}>
          <div className="order-detail-and-method-content">
            <div className="order-detail-content">
              <div className="shipping-from">
                <EnvironmentFilled className="icon-shipping-from" />
                <Text className="text-shipping-from">
                  {t('shipping_from')}{" "}
                  <b>586 Nguyễn Hữu Thọ, Sơn Trà, TP Đà Nẵng</b>
                </Text>
                <br />
                <Text className="note-text">
                  {t('signature_required')}
                </Text>
                <Divider dashed style={{ borderWidth: "1px" }} />

                {/* BẢNG SẢN PHẨM */}
                <Table
                  columns={columns}
                  dataSource={processedData}
                  pagination={false}
                  className="product-table"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* --- MODAL THAY ĐỔI PHƯƠNG THỨC THANH TOÁN --- */}
      <Modal
        title={t('change_payment_method_title')}
        visible={isPaymentModalVisible}
        onOk={() => handlePaymentOk(paymentMethod)}
        onCancel={handlePaymentCancel}
        okText={t('confirm')}
        cancelText={t('cancel_btn')}
      >
        <Radio.Group
          onChange={(e) => setPaymentMethod(e.target.value)}
          value={paymentMethod}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Radio value="Online Payment">{t('payment_online_short')}</Radio>
          <Radio value="Card on Delivery">{t('payment_card_on_delivery')}</Radio>
          <Radio value="POS on Delivery">{t('payment_pos_on_delivery')}</Radio>
        </Radio.Group>
      </Modal>

      {/* --- MODAL CHỈNH SỬA THÔNG TIN GIAO HÀNG --- */}
      <Modal
        title={t('edit_shipping_info_title')}
        visible={isShipToModalVisible}
        onOk={handleShipToOk}
        onCancel={handleShipToCancel}
        okText={t('save_changes')}
        cancelText={t('cancel_btn')}
        width={600}
      >
        <Form
          form={shipToForm}
          layout="vertical"
          name="ship_to_form"
          initialValues={{
            ...currentDelivery,
            date: currentDelivery.date ? dayjs(currentDelivery.date) : null,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t('full_name')}
                rules={[{ required: true, message: t('validate_name') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('full_name_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label={t('phone_number')}
                rules={[
                  { required: true, message: t('validate_phone') },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder={t('phone_number')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label={t('email')}
            rules={[
              { required: true, message: t('validate_email') },
              { type: "email", message: t('validate_email_invalid') },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder={t('email_placeholder')} />
          </Form.Item>
          <Form.Item
            name="address"
            label={t('detailed_address')}
            rules={[{ required: true, message: t('validate_address') }]}
          >
            <Input prefix={<HomeOutlined />} placeholder={t('address_placeholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label={t('city')}
                rules={[{ required: true, message: t('validate_city') }]}
              >
                <Input placeholder={t('city')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label={t('state_province')}
                rules={[{ required: true, message: t('validate_state') }]}
              >
                <Select placeholder={t('select_state')}>
                  <Option value="Việt Nam">Việt Nam</Option>
                  <Option value="Bồ Đào Nha">Bồ Đào Nha</Option>
                  <Option value="Thái Lan">Thái Lan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="zip"
                label={t('zip_code')}
                rules={[{ required: true, message: t('validate_zip') }]}
              >
                <Input placeholder={t('zip_placeholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="date"
            label={t('delivery_date_label')}
            rules={[{ required: true, message: t('validate_date') }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="note" label={t('delivery_note_label')}>
            <Input.TextArea
              prefix={<ProfileOutlined />}
              placeholder={t('delivery_note_placeholder')}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewOrder;