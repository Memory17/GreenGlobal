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

const { Title, Text } = Typography;
const { Option } = Select;

const ReviewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận dữ liệu BAN ĐẦU từ location.state
  const initialDelivery = location.state?.delivery || {
    name: "Chưa xác định",
    phone: "Chưa xác định",
    email: "Chưa xác định",
    address: "Chưa xác định",
    city: "Chưa xác định",
    state: "Chưa xác định",
    zip: "Chưa xác định",
    date: null,
    note: "Không có",
    payment: "Chưa chỉ định",
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
      title: "Sản phẩm",
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
      title: "Kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Text type={stock > 0 ? "success" : "danger"}>
          {stock > 0 ? "Còn hàng" : "Hết hàng"}
        </Text>
      ),
    },
    {
      title: "SL",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Thành tiền",
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
    : "Chưa chỉ định";

  return (
    <div className="review-order">
      <Text className="big-title">
        ✅️ Bạn gần hoàn tất rồi. Vui lòng xem lại thông tin bên dưới và đặt
        hàng.
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
              Giao hàng đến
            </span>
            <Text
              strong
              className="change-info-text"
              onClick={showShipToModal}
            >
              THAY ĐỔI
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
                      <UserOutlined /> Tên
                    </>
                  }
                >
                  {currentDelivery.name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> SĐT
                    </>
                  }
                >
                  {currentDelivery.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> Email
                    </>
                  }
                >
                  {currentDelivery.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <HomeOutlined /> Địa chỉ
                    </>
                  }
                >
                  {`${currentDelivery.address}, ${currentDelivery.city}, ${currentDelivery.state} ${
                    currentDelivery.zip || ""
                  }`}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao">
                  {formattedDate}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <ProfileOutlined /> Ghi chú
                    </>
                  }
                >
                  {currentDelivery.note || "Không có"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text>Không có thông tin giao hàng.</Text>
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
              Thanh toán
            </span>
            <Text
              strong
              className="change-info-text"
              onClick={() => showPaymentModal()}
            >
              THAY ĐỔI
              <EditOutlined style={{ marginLeft: 5, color: "#1890ff" }} />
            </Text>
          </Title>
          <br />
          <div className="payment-review-div">
            <div className="payment-review-parent">
            </div>
            <div className="visa-title">
              <Title className="visa-name" level={3}>
                {paymentMethod}
              </Title>
            </div>
            <div className="billing-address">
              <Text className="billing-address-title" strong>
                Địa chỉ Thanh toán:{" "}
              </Text>
              <Text className="billing-address-detail">
                {currentDelivery?.address || "Chưa xác định"}
              </Text>
            </div>
            <Divider dashed />
            <div className="add-gift">
              <Text className="apply-gift">{paymentMethod}</Text>
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
              Tóm Tắt
            </span>
          </Title>
          <div className="summary-review-div">
            <div className="subtotal">
              <Text className="subtotal-text">Tạm tính</Text>
              <Text className="subtotal-value">
                ${totals.subtotal.toFixed(2)}
              </Text>
            </div>
            <div className="shipping">
              <Text className="shipping-text" style={{ color: "red" }}>
                Giảm giá
              </Text>
              <Text className="shipping-value" style={{ color: "red" }}>
                -${totals.discount.toFixed(2)}
              </Text>
            </div>
            {(luckyDiscountValue > 0) && (
                <div className="shipping">
                  <Text className="shipping-text" style={{ color: "#fa8c16" }}>
                    Phần thưởng vòng quay
                    {totals.appliedLuckyCoupon ? ` (${totals.appliedLuckyCoupon.label})` : ''}
                    {totals.useLuckyCoins && totals.appliedLuckyCoupon ? ' + Xu' : (totals.useLuckyCoins ? ' (Xu)' : '')}
                  </Text>
                  <Text className="shipping-value" style={{ color: "#fa8c16" }}>
                    -${luckyDiscountValue.toFixed(2)}
                  </Text>
                </div>
            )}
            <div className="shipping">
              <Text className="shipping-text">Phí vận chuyển</Text>
              <Text className="shipping-value">
                ${totals.shipping.toFixed(2)}
              </Text>
            </div>
            <Divider />
            <div className="total">
              <Text className="total-text">Tổng cộng</Text>
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
                Quay lại Trang chủ
              </Button>
              <Button
                className="cancel-order"
                type="secondary"
                onClick={() => navigate("/contact")}
              >
                Liên hệ Hỗ trợ
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* --- HÀNG 2: CHI TIẾT ĐƠN HÀNG --- */}
      <div className="order-detail-review">
        <EnvironmentFilled className="icon-order-detail" /> <br />
        <Title level={3}>Chi Tiết Đơn Hàng</Title>
      </div>

      <Row className="order-detail-and-method" gutter={16}>
        <Col className="order-detail-and-method-left" span={24}>
          <div className="order-detail-and-method-content">
            <div className="order-detail-content">
              <div className="shipping-from">
                <EnvironmentFilled className="icon-shipping-from" />
                <Text className="text-shipping-from">
                  GIAO HÀNG TỪ{" "}
                  <b>586 Nguyễn Hữu Thọ, Sơn Trà, TP Đà Nẵng</b>
                </Text>
                <br />
                <Text className="note-text">
                  Cần có chữ ký khi nhận hàng.
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
        title="Thay Đổi Phương Thức Thanh Toán"
        visible={isPaymentModalVisible}
        onOk={() => handlePaymentOk(paymentMethod)}
        onCancel={handlePaymentCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Radio.Group
          onChange={(e) => setPaymentMethod(e.target.value)}
          value={paymentMethod}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Radio value="Online Payment">Thanh toán Online</Radio>
          <Radio value="Card on Delivery">Thanh toán bằng Thẻ khi nhận hàng</Radio>
          <Radio value="POS on Delivery">Thanh toán qua POS khi nhận hàng</Radio>
        </Radio.Group>
      </Modal>

      {/* --- MODAL CHỈNH SỬA THÔNG TIN GIAO HÀNG --- */}
      <Modal
        title="Chỉnh Sửa Thông Tin Giao Hàng"
        visible={isShipToModalVisible}
        onOk={handleShipToOk}
        onCancel={handleShipToCancel}
        okText="Lưu Thay Đổi"
        cancelText="Hủy"
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
                label="Họ và Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ và Tên đầy đủ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số Điện Thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập SĐT!" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số Điện Thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Địa chỉ Email" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ Đường/Số nhà" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}
              >
                <Input placeholder="Thành phố" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="Quận/Tỉnh"
                rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Quận!" }]}
              >
                <Select placeholder="Chọn Tỉnh/Quận">
                  <Option value="Việt Nam">Việt Nam</Option>
                  <Option value="Bồ Đào Nha">Bồ Đào Nha</Option>
                  <Option value="Thái Lan">Thái Lan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="zip"
                label="Mã Bưu điện (ZIP Code)"
                rules={[{ required: true, message: "Vui lòng nhập mã ZIP!" }]}
              >
                <Input placeholder="Mã ZIP" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="date"
            label="Ngày Giao hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngày giao!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú Giao hàng">
            <Input.TextArea
              prefix={<ProfileOutlined />}
              placeholder="Thêm ghi chú cho người giao hàng"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewOrder;