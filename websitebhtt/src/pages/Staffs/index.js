import React, { useEffect, useState, useCallback } from "react";
import {
    Avatar,
    Space,
    Table,
    Typography,
    Card,
    Tag,
    Input,
    Select,
    Badge,
    Modal,
    Form,
    Button,
    Popconfirm,
    Switch,
    message,
    Tooltip,
    
    notification,
    Flex,
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    KeyOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// 🔥 THAY ĐỔI: Đã xoá 'Title' vì nó không được sử dụng
const { Text } = Typography;
const { Option } = Select;

const STORAGE_KEY = "app_staffs_v1";

// ... (seedStaffs, uid, readStorage, writeStorage giữ nguyên) ...
const seedStaffs = [
    {
        id: "u1",
        fullName: "Doãn Bá Min",
        email: "min@example.com",
        phone: "0912345678",
        role: "admin",
        status: "active",
        avatar: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    },
    {
        id: "u2",
        fullName: "Doãn Bá Lực",
        email: "a@example.com",
        phone: "0987654321",
        role: "admin",
        status: "active",
        avatar: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
        id: "u3",
        fullName: "Doãn Chí Bình",
        email: "a@example.com",
        phone: "0987654321",
        role: "staff",
        status: "active",
        avatar: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
        id: "u4",
        fullName: "Doãn Chí Hiền",
        email: "a@example.com",
        phone: "0987654321",
        role: "staff",
        status: "active",
        avatar: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
];

function uid(prefix = "id") {
    return prefix + Math.random().toString(36).slice(2, 9);
}

function readStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStaffs));
        return [...seedStaffs];
    }
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStaffs));
        return [...seedStaffs];
    }
}

function writeStorage(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Staffs() {
    const { t } = useTranslation();
    const [screenSize, setScreenSize] = useState('lg');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 576) setScreenSize('xs');
            else if (window.innerWidth < 768) setScreenSize('sm');
            else if (window.innerWidth < 992) setScreenSize('md');
            else setScreenSize('lg');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const openNotificationWithIcon = (type, messageKey, descriptionKey, options = {}) => {
        notification[type]({
            message: t(messageKey, options),
            description: t(descriptionKey, options),
            placement: screenSize === 'xs' ? "topCenter" : "topRight",
        });
    };

    const [loading, setLoading] = useState(false);
    const [staffs, setStaffs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadStaffs();
    }, []);

    const loadStaffs = () => {
        setLoading(true);
        setTimeout(() => {
            const list = readStorage().filter((u) => u.status !== "deleted");
            // Sắp xếp các bản ghi mới nhất lên đầu
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setStaffs(list);
            setLoading(false);
        }, 250);
    };

    const applyFilter = useCallback(() => {
        const term = q.trim().toLowerCase();
        let list = [...staffs];
        if (term) {
            list = list.filter(
                (u) =>
                    (u.fullName || "").toLowerCase().includes(term) ||
                    (u.email || "").toLowerCase().includes(term) ||
                    (u.phone || "").includes(term)
            );
        }
        if (roleFilter !== "all") {
            list = list.filter((u) => u.role === roleFilter);
        }
        setFiltered(list);
    }, [q, roleFilter, staffs]);

    useEffect(() => {
        applyFilter();
    }, [q, roleFilter, staffs, applyFilter]);

    // ... (Tất cả các hàm handle... của bạn giữ nguyên) ...
    const handleAdd = () => {
        setEditing(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
            role: record.role,
            status: record.status === "active",
        });
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        const list = readStorage();
        const idx = list.findIndex((u) => u.id === id);
        if (idx === -1) {
            message.error("Không tìm thấy tài khoản");
            return;
        }
        list[idx].status = "deleted";
        writeStorage(list);
        openNotificationWithIcon("success", "staffs_msg_delete_title", "staffs_msg_delete_success");
        loadStaffs();
    };

    const handleToggleStatus = (id) => {
        const list = readStorage();
        const idx = list.findIndex((u) => u.id === id);
        if (idx === -1) return;
        const newStatus = list[idx].status === "active" ? "inactive" : "active";
        list[idx].status = newStatus;
        writeStorage(list);

        const statusText = newStatus === "active" ? t("staffs_status_active") : t("staffs_status_inactive");

        openNotificationWithIcon(
            "success",
            "staffs_msg_status_update",
            "staffs_msg_status_success",
            { name: list[idx].fullName, status: statusText }
        );
        loadStaffs();
    };

    const handleResetPassword = (id) => {
        const newPwd = Math.random().toString(36).slice(2, 10);
        openNotificationWithIcon(
            "info",
            "staffs_msg_reset_pwd",
            "staffs_msg_reset_pwd_detail",
            { password: newPwd }
        );
    };

    const handleSubmitForm = async () => {
        try {
            const values = await form.validateFields();
            const list = readStorage();
            if (editing) {
                const idx = list.findIndex((u) => u.id === editing.id);
                if (idx === -1) throw new Error("Tài khoản không tồn tại");
                list[idx] = {
                    ...list[idx],
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    role: values.role,
                    status: values.status ? "active" : "inactive",
                };
                writeStorage(list);
                openNotificationWithIcon("success", "staffs_msg_update", "staffs_msg_update_success");
            } else {
                const newUser = {
                    id: uid("u"),
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    role: values.role,
                    avatar: null,
                    status: values.status ? "active" : "inactive",
                    createdAt: Date.now(),
                };
                list.push(newUser);
                writeStorage(list);
                openNotificationWithIcon("success", "staffs_msg_add", "staffs_msg_add_success");
            }
            setModalVisible(false);
            setEditing(null);
            form.resetFields();
            loadStaffs();
        } catch (err) {
            // Xử lý lỗi form validation
        }
    };

    const columns = [
        // ... (Định nghĩa columns của bạn giữ nguyên) ...
        {
            title: t("staffs_col_staff"),
            dataIndex: "fullName",
            key: "fullName",
            width: screenSize === 'xs' ? "100%" : screenSize === 'sm' ? "50%" : "35%",
            render: (text, record) => (
                <Space direction={screenSize === 'xs' ? "vertical" : "horizontal"}>
                    <Badge
                        dot
                        color={record.status === "active" ? "#52c41a" : "#d9d9d9"}
                        offset={[-6, 40]}
                    >
                        <Avatar
                            size={screenSize === 'xs' ? 36 : 48}
                            src={record.avatar}
                            style={{
                                backgroundColor: record.role === "admin" ? "#ffc069" : "#87d068",
                                color: "#fff",
                                border: "2px solid #fff",
                                fontWeight: 600,
                                flexShrink: 0
                            }}
                        >
                            {!record.avatar && record.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Badge>
                    <div>
                        <Text strong style={{ color: "#262626", fontSize: screenSize === 'xs' ? 12 : 14 }}>
                            {record.fullName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <MailOutlined /> {record.email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        ...(screenSize !== 'xs' && screenSize !== 'sm' ? [{
            title: t("staffs_col_phone"),
            dataIndex: "phone",
            key: "phone",
            width: "15%",
            render: (phone) => (
                <Tag
                    icon={<PhoneOutlined />}
                    color="processing"
                    style={{ borderRadius: 6, fontSize: 12 }}
                >
                    {phone || "-"}
                </Tag>
            ),
        }] : []),
        ...(screenSize === 'lg' || screenSize === 'md' ? [{
            title: t("staffs_col_role"),
            dataIndex: "role",
            key: "role",
            width: screenSize === 'md' ? "20%" : "15%",
            render: (role) =>
                role === "admin" ? (
                    <Tag
                        color="gold"
                        style={{ fontWeight: 600, fontSize: 12, borderRadius: 4 }}
                        icon={<TeamOutlined />}
                    >
                        {t("staffs_filter_admin")}
                    </Tag>
                ) : (
                    <Tag
                        color="cyan"
                        style={{ fontWeight: 600, fontSize: 12, borderRadius: 4 }}
                        icon={<TeamOutlined />}
                    >
                        {t("staffs_filter_staff")}
                    </Tag>
                ),
        }] : []),
        {
            title: t("staffs_col_status"),
            dataIndex: "status",
            key: "status",
            width: screenSize === 'xs' ? "auto" : screenSize === 'sm' ? "25%" : "18%",
            render: (status, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Switch
                        size={screenSize === 'xs' ? 'small' : 'default'}
                        checkedChildren={screenSize !== 'xs' ? <CheckCircleOutlined /> : null}
                        unCheckedChildren={screenSize !== 'xs' ? <StopOutlined /> : null}
                        checked={status === "active"}
                        onChange={() => handleToggleStatus(record.id)}
                    />
                    {screenSize !== 'xs' && (
                        <Text type={status === "active" ? "success" : "secondary"} style={{ fontSize: 12 }}>
                            {status === "active" ? t("staffs_status_active") : t("staffs_status_inactive")}
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: t("staffs_col_actions"),
            key: "action",
            width: screenSize === 'xs' ? "auto" : screenSize === 'sm' ? "25%" : "17%",
            render: (_, record) => (
                <Space size={screenSize === 'xs' ? "small" : "small"} wrap>
                    <Tooltip title={t("staffs_tip_edit")}>
                        <Button
                            icon={<EditOutlined />}
                            type="primary"
                            ghost
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    {screenSize !== 'xs' && (
                        <Tooltip title={t("staffs_tip_reset_pwd")}>
                            <Button
                                icon={<KeyOutlined />}
                                type="default"
                                size="small"
                                onClick={() => handleResetPassword(record.id)}
                            />
                        </Tooltip>
                    )}

                    <Popconfirm
                        title={t("staffs_confirm_delete")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("delete")}
                        cancelText={t("cancel")}
                    >
                        <Tooltip title={t("staffs_tip_delete")}>
                            <Button icon={<DeleteOutlined />} type="primary" danger size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const roles = ["all", "admin", "staff"];

    return (
        <Space
            size={24}
            direction="vertical"
            style={{
                width: "100%",
                padding: "24px",
                background: "#f5f7fa",
                borderRadius: "12px",
            }}
        >
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", padding: "0" }}>
                {/* Header Section (Phần này giữ nguyên) */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    padding: "20px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(245, 87, 108, 0.25)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* ... (Toàn bộ nội dung Header) ... */}
                    <div style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 120,
                        height: 120,
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        backdropFilter: "blur(10px)"
                    }}></div>
                    <div style={{
                        position: "absolute",
                        bottom: -20,
                        left: 50,
                        width: 80,
                        height: 80,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "50%",
                        backdropFilter: "blur(10px)"
                    }}></div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(245, 87, 108, 0.37)",
                        position: "relative",
                        zIndex: 2,
                        fontSize: 24,
                    }}>
                        <TeamOutlined style={{ color: "#fff" }} />
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        position: "relative",
                        zIndex: 2
                    }}>
                        <div style={{
                            fontSize: "28px",
                            fontWeight: 800,
                            color: "#fff",
                            background: "linear-gradient(90deg, #fff 0%, #f0f0f0 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            letterSpacing: "-0.5px"
                        }}>
                            {t("staffs_title")}
                        </div>
                    </div>
                    <div style={{
                        marginLeft: "auto",
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        backdropFilter: "blur(10px)",
                        position: "relative",
                        zIndex: 2
                    }}>
                        <div style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                            textAlign: "center"
                        }}>
                            👔
                        </div>
                        <div style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: "2px"
                        }}>
                            {filtered.length}
                        </div>
                    </div>
                </div>

                {/* Search & Filter Section (Đã áp dụng className) */}
                <div style={{ padding: "20px 24px" }}>
                    <Flex justify="flex-start" align="center" gap={12} style={{ width: "100%" }} wrap="wrap">
                        <Input
                            className="staff-search-input"
                            prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                            placeholder={t("staffs_search_placeholder")}
                            size="middle"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            allowClear
                        />

                        <Select
                            className="staff-role-select"
                            value={roleFilter}
                            onChange={(val) => setRoleFilter(val)}
                            size="middle"
                            popupClassName="staff-role-select-dropdown"
                        >
                            {roles.map((r) => (
                                <Option key={r} value={r}>
                                    {r === "all" ? t("staffs_filter_all") : r === "admin" ? t("staffs_filter_admin") : t("staffs_filter_staff")}
                                </Option>
                            ))}
                        </Select>

                        <Button
                            className="staff-add-button"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            size="middle"
                        >
                            {screenSize === 'xs' || screenSize === 'sm' ? null : t("staffs_btn_add")}
                        </Button>
                    </Flex>
                </div>
            </Card>

            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    background: "#fff",
                }}
                bodyStyle={{ padding: 16 }}
            >
                <Table
                    // ClassName cho hiệu ứng hover (giữ nguyên)
                    className="staff-table"
                    loading={loading}
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    size={screenSize === 'xs' ? 'small' : 'middle'}
                    pagination={{
                        position: ["bottomCenter"],
                        pageSize: screenSize === 'xs' ? 3 : screenSize === 'sm' ? 4 : 6,
                        showSizeChanger: false,
                    }}
                    scroll={{ x: screenSize === 'xs' ? 360 : screenSize === 'sm' ? 600 : undefined }}
                />
            </Card>

            <Modal
                // ... (Modal giữ nguyên) ...
                title={editing ? t("staffs_modal_edit") : t("staffs_modal_add")}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditing(null);
                    form.resetFields();
                }}
                onOk={handleSubmitForm}
                okText={editing ? t("update") : t("add")}
                cancelText={t("cancel")}
                maskClosable={false}
                destroyOnClose
                width={screenSize === 'xs' ? '95%' : 500}
                style={{ top: screenSize === 'xs' ? 20 : undefined }}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    {/* ... (Các Form.Item giữ nguyên) ... */}
                    <Form.Item
                        label={t("staffs_label_name")}
                        name="fullName"
                        rules={[{ required: true, message: t("staffs_msg_name_required") }]}
                    >
                        <Input placeholder={t("staffs_label_name")} />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: t("staffs_msg_email_invalid") },
                        ]}
                    >
                        <Input placeholder="email@domain.com" />
                    </Form.Item>
                    <Form.Item label={t("staffs_col_phone")} name="phone">
                        <Input placeholder={t("staffs_placeholder_phone")} />
                    </Form.Item>
                    <Form.Item
                        label={t("staffs_col_role")}
                        name="role"
                        rules={[{ required: true, message: t("staffs_msg_role_required") }]}
                    >
                        <Select 
                            placeholder="Chọn vai trò"
                            getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        >
                            <Option value="admin">Admin</Option>
                            <Option value="staff">Nhân viên</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("staffs_col_status")} name="status" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* CSS với chiều cao 36px đã được áp dụng */}
            <style>{`
                /* CSS responsive cũ */
                @media (max-width: 768px) {
                    .ant-table {
                        font-size: 12px;
                    }
                    .ant-table-cell {
                        padding: 8px 12px;
                    }
                }
                
                @media (max-width: 576px) {
                    .ant-table {
                        font-size: 11px;
                    }
                    .ant-table-cell {
                        padding: 6px 8px;
                    }
                    .ant-btn {
                        padding: 4px 8px;
                    }
                }

                /* CSS cho hiệu ứng hover table (giữ nguyên) */
                .staff-table .ant-table-thead > tr > th {
                    background: #fafbfe !important;
                    color: #595959;
                    font-weight: 600;
                }
                .staff-table .ant-table-tbody > tr {
                    transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
                    background: #fff;
                }
                .staff-table .ant-table-tbody > tr:hover {
                    transform: scale(1.01);
                    box-shadow: 0 6px 16px rgba(118, 75, 162, 0.15);
                    z-index: 2;
                    position: relative;
                }
                .staff-table .ant-table-tbody > tr:hover > td {
                    background: #fff !important; 
                }

                /* CSS CHO THANH TÌM KIẾM / LỌC */

                /* Style chung cho Input và Select */
                .staff-search-input,
                .staff-role-select .ant-select-selector {
                    flex: 1 !important;
                    min-width: 150px !important;
                    border-radius: 12px !important; 
                    border: 1px solid #f0f0f0 !important; 
                    background: #fafbfe !important; 
                    box-shadow: none !important; 
                    transition: all 0.3s ease !important;
                    height: 36px !important; /* Đã giảm (từ 40px) */
                    padding: 0 11px !important;
                }
                
                .staff-search-input .ant-input {
                     background: #fafbfe !important;
                }
                
                .staff-role-select .ant-select-selector {
                    align-items: center; /* Căn giữa text cho Select */
                }

                .staff-search-input {
                    min-width: 200px !important;
                }
                
                .staff-role-select {
                     flex: 1 !important;
                     min-width: 150px !important;
                     border-radius: 12px !important;
                     height: 36px !important; /* Đã giảm (từ 40px) */
                }

                .staff-search-input .ant-input,
                .staff-role-select .ant-select-selection-item,
                .staff-role-select .ant-select-selection-placeholder {
                    color: #595959; /* Màu chữ */
                    font-size: 14px;
                }

                /* Hiệu ứng khi Focus/Hover */
                .staff-search-input:focus-within,
                .staff-search-input:hover,
                .staff-role-select.ant-select-focused .ant-select-selector,
                .staff-role-select:hover .ant-select-selector {
                    border-color: #764ba2 !important; /* Màu border (từ nút bấm) */
                    background: #fff !important;
                    /* Đổ bóng nhẹ */
                    box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.1) !important;
                }
                
                .staff-search-input:focus-within .ant-input,
                .staff-search-input:hover .ant-input {
                    background: #fff !important;
                }

                /* Style cho Nút "Thêm nhân viên" */
                .staff-add-button {
                    border-radius: 12px !important; /* Đồng bộ bo góc 12px */
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    border: none !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 15px rgba(118, 75, 162, 0.2) !important; /* Đổ bóng */
                    transition: all 0.3s ease !important;
                    height: 36px !important; /* Đã giảm (từ 40px) */
                }

                .staff-add-button:hover {
                    transform: translateY(-2px); /* Hiệu ứng "nâng" */
                    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.3) !important; /* Shadow đậm hơn */
                }

                /* Style cho dropdown của Select */
                .staff-role-select-dropdown .ant-select-item {
                    border-radius: 8px !important;
                    margin: 0 4px;
                }
                .staff-role-select-dropdown .ant-select-item-option-selected {
                    background-color: #f0f5ff !important;
                    font-weight: 600;
                    color: #667eea;
                }
            `}</style>
        </Space>
    );
}