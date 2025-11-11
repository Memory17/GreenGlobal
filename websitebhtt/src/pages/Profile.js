// src/pages/Profile.js

import React, { useEffect, useState } from "react";
import "../style/Profile.css";
import {
  Typography,
  Button,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Avatar,
  Divider,
  message,
  Upload,
} from "antd";
import {
  EditOutlined,
  CameraOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// Đưa tất cả các import lên trên cùng
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAuth } from "../context/AuthContext"; // <-- THÊM IMPORT AUTH

// === CẤU HÌNH DAYJS SAU CÁC IMPORT ===
dayjs.extend(customParseFormat);
// ===================================

const { Title, Text } = Typography;

// --- BỘ LƯU TRỮ PROFILE LOCAL (GIỮ NGUYÊN) ---
const PROFILES_STORAGE_KEY = 'user_profiles';

const getAllProfiles = () => {
  const profiles = localStorage.getItem(PROFILES_STORAGE_KEY);
  return profiles ? JSON.parse(profiles) : {};
};

const getProfileByUsername = (username) => {
  if (!username) return null;
  const allProfiles = getAllProfiles();
  return allProfiles[username] || null;
};

const saveProfileByUsername = (username, data) => {
  if (!username) return;
  const allProfiles = getAllProfiles();

  const oldProfile = allProfiles[username] || {};
  allProfiles[username] = { ...oldProfile, ...data };

  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles));
};
// --- KẾT THÚC BỘ LƯU TRỮ (GIỮ NGUYÊN) ---


const Profile = () => {
  const [form] = Form.useForm();
  // === THAY ĐỔI: Lấy thêm updateUser từ context ===
  const { currentUser, logout, updateUser } = useAuth();

  const [avatarSrc, setAvatarSrc] = useState(null);

  // 4. TẢI DỮ LIỆU (GIỮ NGUYÊN LOGIC)
  useEffect(() => {
    if (!form || !currentUser) return;

    const username = currentUser.username;
    // Thử lấy profile đã chỉnh sửa từ "user_profiles"
    const localProfile = getProfileByUsername(username);

    const apiAddress = currentUser.address?.address || '';
    const apiBirthDate = currentUser.birthDate || null;
    // Lấy avatar từ "userData" (có thể là API hoặc là cái đã được updateUser)
    const apiImage = currentUser.image || null;

    let initialValues;
    let currentAvatarSrc;


    if (localProfile) {
      // 4a. TẢI TỪ LOCALSTORAGE ("user_profiles")
      initialValues = {
        ...localProfile,
        birth: localProfile.birth ? dayjs(localProfile.birth, "YYYY-MM-DD") : null,
      };
      // Ưu tiên avatar từ "user_profiles"
      currentAvatarSrc = localProfile.avatar || apiImage || null;

    } else {
      // 4b. TẢI TỪ API/MẶC ĐỊNH ("userData")
      initialValues = {
        name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username,
        email: currentUser.email,
        firstname: currentUser.firstName || '',
        lastname: currentUser.lastName || '',
        phone: currentUser.phone || '',
        birth: apiBirthDate ? dayjs(apiBirthDate) : null,
        address: apiAddress,
        'citizen identification card': null,
      };
      // Dùng avatar từ "userData"
      currentAvatarSrc = apiImage;
    }

    form.setFieldsValue(initialValues);
    setAvatarSrc(currentAvatarSrc);

  }, [currentUser, form]);

  // 5. LƯU DỮ LIỆU VĂN BẢN (Text)
  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error("Lỗi: Không tìm thấy người dùng!");
      return;
    }

    const username = currentUser.username;

    const dataToSave = {
      ...values,
      // Lưu ngày sinh dưới dạng YYYY-MM-DD
      birth: values.birth ? values.birth.format("YYYY-MM-DD") : null, 
      // Cập nhật lại 'name' để hiển thị trên form
      name: `${values.firstname || ''} ${values.lastname || ''}`.trim() || username
    };

    try {
      // 1. Lưu vào "user_profiles"
      saveProfileByUsername(username, dataToSave);

      // 2. Đồng bộ hóa với "userData" qua context
      updateUser(dataToSave);

      message.success("Cập nhật thông tin thành công!");

      // Cập nhật lại tên trên form
      form.setFieldsValue({ name: dataToSave.name });

    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
      message.error("Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  // 6. HÀM XỬ LÝ UPLOAD AVATAR
  const handleAvatarUpload = ({ file, onSuccess, onError }) => {
    const reader = new FileReader();
    if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
      message.error('Kích thước ảnh không được vượt quá 5MB!');
      onError("File size too large");
      return;
    }

    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = reader.result;

      try {
        // 1. Lưu vào "user_profiles" với key là 'avatar'
        saveProfileByUsername(currentUser.username, { avatar: base64String });

        // 2. Đồng bộ hóa với "userData" (dùng key 'image' cho nhất quán)
        updateUser({ image: base64String });

        setAvatarSrc(base64String); // Cập nhật UI ngay lập tức
        message.success("Cập nhật ảnh đại diện thành công!");
        onSuccess("ok");
      } catch (error) {
        message.error("Lỗi khi lưu ảnh đại diện!");
        onError(error);
      }
    };

    reader.onerror = (error) => {
      message.error("Lỗi khi đọc file ảnh!");
      onError(error);
    };
  };

  // HÀM LOGOUT (GIỮ NGUYÊN)
  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất");
    // (Bạn có thể thêm navigate("/") hoặc navigate("/login") ở đây nếu muốn)
  };

  // 7. RENDER COMPONENT (CHUYỂN SANG TIẾNG VIỆT)
  return (
    <div className="profile-page">
      <div className="profile-page-title">
        <Title className="title-profile" level={1}>
          Xin chào {currentUser ? currentUser.firstName || currentUser.username : "Người dùng"}
        </Title>
        <Text className="text-profile">
          Xin chào và chào mừng đến với trang web của chúng tôi! Chúng tôi rất vui được chia sẻ thế giới của mình với bạn,
          <br /> để bạn khám phá mọi thứ chúng tôi đã xây dựng bằng đam mê và sự quan tâm.
        </Text>
        <br />
        <Button className="edit-profile-button" type="primary">
          Chỉnh sửa Hồ sơ
        </Button>
      </div>
      <div className="page-content">
        <div className="profile-grid">
          {/* Form Cập nhật */}
          <div className="profile-form-card">
            <Row className="my-account-header">
              <Col className="my-account-title" span={12}>
                <Text strong>Tài Khoản Của Tôi</Text>
              </Col>
              <Col className="setting-button" span={12}>
                <Button type="primary">Cài đặt</Button>
              </Col>
            </Row>
            <Title className="user-info-title" level={5}>
              THÔNG TIN NGƯỜI DÙNG
            </Title>
            <Form
              className="my-account-form"
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row className="username-email" gutter={32}>
                <Col className="username-col" span={12}>
                  <Form.Item name="name" label="Tên Đầy Đủ">
                    <Input placeholder="Nhập tên đầy đủ của bạn" />
                  </Form.Item>
                </Col>
                <Col className="email-col" span={12}>
                  <Form.Item name="email" label="Địa chỉ Email">
                    <Input placeholder="Nhập email của bạn" />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="first-last-name" gutter={32}>
                <Col className="first-name-col" span={12}>
                  <Form.Item name="firstname" label="Tên (First Name)">
                    <Input placeholder="Nhập Tên của bạn" />
                  </Form.Item>
                </Col>
                <Col className="last-name-col" span={12}>
                  <Form.Item name="lastname" label="Họ (Last Name)">
                    <Input placeholder="Nhập Họ của bạn" />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="phone" label="Điện thoại">
                    <Input placeholder="Nhập số điện thoại của bạn" />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item name="birth" label="Ngày sinh">
                    {/* Format hiển thị: DD/MM/YYYY */}
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="phone-birth" gutter={32}>
                <Col className="phone-col" span={12}>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Nhập địa chỉ của bạn" />
                  </Form.Item>
                </Col>
                <Col className="birth-col" span={12}>
                  <Form.Item
                    name="citizen identification card"
                    label="CMND/CCCD"
                  >
                    <Input placeholder="Nhập số CMND/CCCD của bạn" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  className="save-change-button"
                  type="primary"
                  htmlType="submit"
                >
                  Lưu Thay Đổi
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Thẻ Hồ sơ */}
          <div className="profile-card">

            <Upload
              name="avatar"
              accept="image/*"
              showUploadList={false}
              customRequest={handleAvatarUpload}
            >
              <div className="profile-avatar">
                <Avatar
                  size={180}
                  src={avatarSrc}
                  icon={<UserOutlined />}
                />
                <div className="avatar-overlay">
                  <CameraOutlined className="camera-icon" />
                </div>
              </div>
            </Upload>

            <div className="profile-name">
              {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username : "Người Dùng"}{" "}
              <EditOutlined />
              <br />
              <text className="doanluc197">
                {currentUser ? currentUser.email : "email@example.com"}
              </text>
            </div>

            <Divider />

            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
            >
              <Col className="connect-bank-col" span={12}>
                Liên kết ngân hàng
              </Col>
              <Col className="icon-bank-col" span={12}>
                <CreditCardOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
            >
              <Col className="connect-bank-col" span={12}>
                Kho gói V.I.P
              </Col>
              <Col className="icon-bank-col" span={12}>
                <DollarOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
            >
              <Col className="connect-bank-col" span={15}>
                Điều khoản và chính sách
              </Col>
              <Col className="icon-bank-col" span={9}>
                <LockOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
            >
              <Col className="connect-bank-col" span={15}>
                Liên hệ với chúng tôi
              </Col>
              <Col className="icon-bank-col" span={9}>
                <CustomerServiceOutlined />
              </Col>
            </Row>
            <Divider />
            <Row
              className="connect-bank-row"
              gutter={16}
              justify="space-between"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <Col className="connect-bank-col" span={15}>
                Đăng xuất
              </Col>
              <Col className="icon-bank-col" span={9}>
                <LogoutOutlined />
              </Col>
            </Row>
          </div>
        </div>
      </div>
      {/* <div className="banner-footer"></div> */}
    </div>
  );
};

export default Profile;