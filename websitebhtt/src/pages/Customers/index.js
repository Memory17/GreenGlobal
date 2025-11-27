import React, { useEffect, useState } from "react";
import {
    UserOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    CloudDownloadOutlined, 
    PhoneOutlined,
    EditOutlined, 
    HistoryOutlined, 
    DollarCircleOutlined, 
    CommentOutlined,
    MailOutlined,
    UserSwitchOutlined, 
    CheckCircleOutlined,
    ShoppingCartOutlined,
    LockOutlined,
    UnlockOutlined
} from "@ant-design/icons";
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
    Flex,
    Button,
    Tooltip,
    message,
    Modal,
    Form,
    Drawer, 
    Timeline 
} from "antd";
import { useTranslation } from "react-i18next";
import { getStoredUsers, setUserDisabled, updateStoredUser } from "../../data/authService";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// --- 1. HÀM FETCH DỮ LIỆU THỰC TẾ TỪ DUMMYJSON ---
/**
 * Lấy danh sách người dùng từ DummyJSON API.
 * @returns {Promise<object>} Dữ liệu JSON từ API.
 */
const getCustomers = async () => {
    try {
        // Sử dụng API thật
        const response = await fetch("https://dummyjson.com/users");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error fetching customers:", error);
        // Trả về cấu trúc rỗng nếu lỗi
        return { users: [] };
    }
};

// --- ÁNH XẠ THÀNH PHỐ (Mô phỏng VN city từ US/Global city) ---
const cityMap = {
    "New York": { vi: "Hà Nội", en: "Hanoi" },
    "Los Angeles": { vi: "Hồ Chí Minh", en: "Ho Chi Minh" },
    "Chicago": { vi: "Đà Nẵng", en: "Da Nang" },
    "Houston": { vi: "Hải Phòng", en: "Hai Phong" },
};


const getAvgOrderValue = () => {
    // Giá trị ngẫu nhiên (VND)
    const value = Math.floor(Math.random() * (1500000 - 50000) + 50000);
    return value;
};

const getStatus = () => (Math.random() > 0.65 ? "online" : "offline");


const generateTimelineData = (customer, t, i18n) => {
    const ordersCount = customer.totalOrders || 0;
    let events = [];

    const isVietnamese = i18n.language === 'vi';

    // Hàm định dạng tiền tệ đơn giản cho timeline
    const formatPrice = (amount) => {
        const locale = isVietnamese ? 'vi-VN' : 'en-US';
        const currencySymbol = isVietnamese ? 'đ' : '$';
        // Giả lập tỉ giá 23000 VND/USD
        const displayAmount = isVietnamese ? amount : amount / 23000; 

        return `${displayAmount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
    };

    // Kiểm tra và xử lý joinDate có thể ở định dạng string hoặc Date object
    let joinDateObj;
    try {
         // Thử phân tích cú pháp joinDate theo định dạng từ useEffect (locale string)
         const dateParts = customer.joinDate.split('/');
         if (dateParts.length === 3) {
            const [day, month, year] = dateParts.map(Number);
            joinDateObj = new Date(year, month - 1, day);
         } else {
             // Thử parse như Date string (phòng trường hợp format locale khác)
             joinDateObj = new Date(customer.joinDate);
         }
    } catch (e) {
        // Fallback nếu parse lỗi
        joinDateObj = new Date();
    }
    
    // Đảm bảo joinDateObj là một Date hợp lệ
    if (isNaN(joinDateObj.getTime())) {
        joinDateObj = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // Ngày ngẫu nhiên nếu lỗi
    }


    // 1. Sự kiện Đăng ký
    events.push({
        date: joinDateObj,
        label: `${customer.joinDate}`,
        children: <Text strong>{t("cus_timeline_account_registered")}</Text>, 
        color: "green",
        dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
    });

    // 2. Sự kiện Đặt hàng
    for (let i = 1; i <= ordersCount; i++) {
        // Tạo ngày đặt hàng ngẫu nhiên giữa ngày đăng ký và hiện tại
        const timeDiff = Date.now() - joinDateObj.getTime();
        const randomTime = Math.random() * timeDiff;
        const orderDateObj = new Date(joinDateObj.getTime() + randomTime);

        const orderDateStr = orderDateObj.toLocaleDateString(i18n.language);
        const orderAmount = (Math.random() * 500000 + 100000);
        
        events.push({
            date: orderDateObj,
            label: `${orderDateStr}`,
            children: (
                <div>
                    <Text strong>{t("cus_timeline_order_success")}</Text> <Tag color="blue">#ORD{customer.id * 100 + i}</Tag> 
                    <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>{t("cus_timeline_value")}: {formatPrice(orderAmount)}</Text> 
                </div>
            ),
            color: "blue",
            dot: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
        });
    }

    // 3. Sự kiện Live Chat
    if (Math.random() > 0.5) {
        // Sử dụng một ngày giả lập gần hiện tại
        events.push({
            date: new Date(Date.now() + 1000), 
            label: t("today"), 
            children: <Text type="warning">{t("cus_timeline_live_chat_request")}</Text>, 
            color: "red",
            dot: <CommentOutlined style={{ fontSize: '16px' }} />,
        });
    }

    // Sắp xếp các sự kiện theo thứ tự thời gian giảm dần
    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return events.map(({ date, ...rest }) => rest);
};


function Customers() {
    const { t, i18n } = useTranslation();
    
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [selectedCity, setSelectedCity] = useState("all"); 

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isActivityDrawerVisible, setIsActivityDrawerVisible] = useState(false);
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editForm] = Form.useForm();
    const [contactForm] = Form.useForm();
    
    // --- 2. LOGIC FETCH VÀ ÁNH XẠ DỮ LIỆU TRONG useEffect ---
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await getCustomers();
                const usersData = (res.users || []).map((user) => {
                    const apiCity = user.address?.city || "Unknown";
                    const mappedCity = cityMap[apiCity] || { vi: apiCity, en: apiCity };

                    return {
                        ...user,
                        totalOrders: Math.floor(Math.random() * 8) + 1,
                        joinDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString(i18n.language),
                        key: user.id,
                        address: {
                            city: mappedCity.vi,
                            city_en: mappedCity.en,
                            ...user.address,
                        },
                    };
                });

                // Merge local registered users (from registerUser -> localStorage)
                const localUsersRaw = getStoredUsers();
                const localMapped = (localUsersRaw || []).map((u) => ({
                    id: u.id,
                    key: u.id,
                    firstName: u.firstName || u.username || 'User',
                    lastName: u.lastName || '',
                    email: u.email || `${u.username}@local`,
                    phone: u.phone || '',
                    image: u.image || null,
                    totalOrders: 0,
                    joinDate: new Date().toLocaleDateString(i18n.language),
                    address: { city: 'Local', city_en: 'Local' },
                    _isLocal: true,
                    disabled: !!u.disabled,
                }));

                const merged = [...localMapped, ...usersData];

                if (mounted) {
                    setDataSource(merged);
                    setFilteredData(merged);
                }
            } catch (e) {
                console.error('Failed to load customers', e);
                if (mounted) {
                    setDataSource([]);
                    setFilteredData([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        // Listen to registration updates from other parts of app and storage events (cross-tab)
        const onUsersUpdated = () => {
            load();
        };
        window.addEventListener('my_app_users_updated', onUsersUpdated);

        const onStorage = (ev) => {
            try {
                if (ev.key === 'my_app_users') {
                    // another tab changed stored users, reload
                    load();
                }
            } catch (err) {
                // ignore
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            mounted = false;
            window.removeEventListener('my_app_users_updated', onUsersUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, [i18n.language]);

    useEffect(() => {
        let filtered = dataSource.filter((item) => {
            // Lọc theo tên/email/phone
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            const contactInfo = `${item.email} ${item.phone}`.toLowerCase();
            // Lọc theo thành phố dựa trên ngôn ngữ
            const cityToCheck = i18n.language === 'en' ? item.address.city_en : item.address.city;

            const matchesSearch = fullName.includes(searchValue.toLowerCase()) || contactInfo.includes(searchValue.toLowerCase());
            // Lọc theo thành phố
            const matchesCity = selectedCity === "all" || cityToCheck === selectedCity; 
            return matchesSearch && matchesCity;
        });
        setFilteredData(filtered);
    }, [searchValue, selectedCity, dataSource, i18n.language]);

    // Danh sách thành phố
    const cities = [
        "all", 
        ...new Set(dataSource.map((item) => i18n.language === 'en' ? item.address.city_en : item.address.city)),
    ].filter(city => city !== undefined); 

    const showEditModal = (record) => {
        setSelectedCustomer(record);
        setIsEditModalVisible(true);
        // Thiết lập giá trị cho Form Edit
        editForm.setFieldsValue({
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email,
            phone: record.phone,
            city: record.address.city, // Giả sử select box dùng tên tiếng Việt (tên city)
        });
    };

    const handleEditCustomer = (values) => {
        // Cần tìm lại city_en từ city khi update (logic đơn giản)
        const cityKey = Object.keys(cityMap).find(key => cityMap[key].vi === values.city);
        const updatedCityEn = cityKey ? cityMap[cityKey].en : values.city; // Fallback nếu không tìm thấy

        const updatedData = dataSource.map(item => {
            if (item.id === selectedCustomer.id) {
                return {
                    ...item,
                    ...values,
                    address: { 
                        city: values.city,
                        city_en: updatedCityEn 
                    } 
                };
            }
            return item;
        });

        setDataSource(updatedData);

        // Nếu là user local (được đăng ký trong app) thì persist thay đổi vào localStorage
        if (selectedCustomer && selectedCustomer._isLocal) {
            try {
                const payload = {
                    id: selectedCustomer.id,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phone: values.phone,
                };
                updateStoredUser(payload);
            } catch (err) {
                console.error('Failed to persist edited user', err);
            }
        }

        setIsEditModalVisible(false);
        message.success(`✅ ${t("cus_msg_update_success", { name: values.firstName })}`);
    };

    const showActivityDrawer = (record) => {
        setSelectedCustomer(record);
        setIsActivityDrawerVisible(true);
    };

    const onCloseActivityDrawer = () => {
        setIsActivityDrawerVisible(false);
        setSelectedCustomer(null);
    };

    const showContactModal = (record) => {
        setSelectedCustomer(record);
        setIsContactModalVisible(true);
        contactForm.resetFields();
    };

    const handleContactAction = (values) => {
        setIsContactModalVisible(false);
        message.success(`✅ ${t("cus_msg_contact_logged", { method: t(values.method), name: selectedCustomer.firstName })}`);
    };


    const handleExportCSV = () => {
        if (filteredData.length === 0) {
            message.warning(t('cus_msg_no_data_export')); 
            return;
        }
        const headers = ["ID", t("cus_col_name"), "Email", t("cus_col_phone"), t("cus_col_city"), t("cus_col_total_orders"), t("cus_col_join_date")]; 
        const csvContent = filteredData.map(row => 
            `"${row.id}"` +
            `,"${row.firstName} ${row.lastName.replace(/"/g, '""')}"` + 
            `,"${row.email}"` +
            `,"${row.phone}"` + 
            `,"${i18n.language === 'en' ? row.address.city_en : row.address.city}"` + // Xuất theo ngôn ngữ hiển thị
            `,"${row.totalOrders}"` +
            `,"${row.joinDate}"`
        );
        const csvString = [
            headers.join(","),
            ...csvContent
        ].join("\n");
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${t('cus_report_filename')}_${new Date().toLocaleDateString(i18n.language).replace(/\//g, '-')}.csv`); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(`✅ ${t('cus_msg_export_success', { count: filteredData.length })}`); 
    };

    // Hàm định dạng tiền tệ cho cột AVG Order Value
    const formatAvgOrderPrice = (value, i18n) => {
        const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
        const currency = i18n.language === 'vi' ? 'VND' : 'USD';
        // Giả lập tỉ giá
        const displayValue = i18n.language === 'vi' ? value : value / 23000; 

        return new Intl.NumberFormat(locale, { 
            style: 'currency', 
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(displayValue);
    }


    const columns = [
        {
            title: t("cus_col_customer"), 
            dataIndex: "firstName",
            key: "name",
            width: '24%', 
            render: (text, record) => (
                <Space size={12}>
                    <Badge
                        dot
                        color={getStatus() === "online" ? "#2ecc71" : "#bdc3c7"}
                        offset={[-4, 48]}
                    >
                        <Avatar
                            src={record.image}
                            size={52}
                            icon={<UserOutlined />}
                            style={{ border: "1px solid #ddd" }}
                        />
                    </Badge>
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: "#2c3e50" }}>
                            {record.firstName} {record.lastName}
                            {record.disabled && (
                                <Tag color="error" style={{ marginLeft: 8, fontSize: 11 }}>
                                    Tài khoản bị khoá
                                </Tag>
                            )}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {record.email}
                        </Text>
                        <Tag 
                            size="small"
                            color={getStatus() === "online" ? "processing" : "default"}
                            style={{ marginTop: 4, width: 'fit-content', fontWeight: 500 }}
                        >
                            {getStatus() === "online" ? t("cus_status_online") : t("cus_status_offline")} 
                        </Tag>
                    </Space>
                </Space>
            ),
        },
        {
            title: t("cus_col_contact_info"), 
            dataIndex: "phone",
            key: "contact",
            width: '16%', 
            render: (phone, record) => (
                <Space direction="vertical" size={4}>
                    <Tag
                        color="geekblue"
                        icon={<PhoneOutlined />}
                        style={{ fontWeight: 600, borderRadius: 6, fontSize: 13, padding: "2px 8px" }}
                    >
                        {phone}
                    </Tag>
                    <Space size={4}>
                        <EnvironmentOutlined style={{ color: "#1677ff" }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {i18n.language === 'en' ? record.address.city_en : record.address.city} 
                        </Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: t("cus_col_avg_order_value"), 
            dataIndex: "avgOrderValue", 
            key: "avgOrderValue",
            align: 'center',
            width: '12%', 
            render: () => {
                const value = getAvgOrderValue();
                
                return (
                    <Space direction="vertical" size={4}>
                        <Text strong style={{ color: '#e67e22', fontSize: 15 }}>
                            {formatAvgOrderPrice(value, i18n)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            <DollarCircleOutlined /> {t("cus_text_avg_value")} 
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: t("cus_col_total_orders"), 
            dataIndex: "totalOrders",
            key: "orders",
            align: 'center',
            width: '10%', 
            render: (orders) => (
                <Text strong style={{ color: orders > 15 ? '#27ae60' : '#333', fontSize: 16 }}>{orders}</Text>
            )
        },
        {
            title: t("cus_col_join_date"), 
            dataIndex: "joinDate",
            key: "joinDate",
            width: '14%', 
            render: (date) => (
                <Text type="secondary" style={{ fontSize: 13 }}>{date}</Text>
            )
        },
        {
            title: t("cus_col_actions"), 
            key: "action",
            align: 'center',
            width: '8%', 
            render: (record) => (
                <Space size="small">
                    <Tooltip title={t("cus_tip_edit_profile")}> 
                        <Button 
                            icon={<EditOutlined />} 
                            type="text" 
                            size="middle" 
                            style={{ color: '#2980b9' }}
                            onClick={() => showEditModal(record)} 
                        />
                    </Tooltip>
                    <Tooltip title={t("cus_tip_view_activity")}> 
                        <Button 
                            icon={<HistoryOutlined />} 
                            type="text" 
                            size="middle" 
                            style={{ color: '#8e44ad' }}
                            onClick={() => showActivityDrawer(record)}
                        />
                    </Tooltip>
                    <Tooltip title={t("cus_tip_log_interaction")}> 
                        <Button 
                            icon={<PhoneOutlined />} 
                            type="text" 
                            size="middle" 
                            style={{ color: '#2ecc71' }} 
                            onClick={() => showContactModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.disabled ? 'Kích hoạt tài khoản' : 'Vô hiệu hoá tài khoản'}>
                        <Button
                            icon={record.disabled ? <UnlockOutlined /> : <LockOutlined />}
                            type="text"
                            size="middle"
                            style={{ color: record.disabled ? '#27ae60' : '#e74c3c' }}
                            onClick={async () => {
                                try {
                                    if (!record._isLocal) {
                                        message.warning('Chỉ có thể vô hiệu hoá tài khoản đã đăng ký trong hệ thống này.');
                                        return;
                                    }
                                    setUserDisabled(record.id, !record.disabled);
                                    message.success(record.disabled ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị vô hiệu hoá');
                                } catch (err) {
                                    message.error('Không thể thay đổi trạng thái tài khoản.');
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <>
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
                    <div className="customers-header" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "20px 24px",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.25)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Background decoration */}
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

                        {/* Icon container */}
                        <div className="customers-header-icon" style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
                            position: "relative",
                            zIndex: 2,
                            fontSize: 24,
                        }}>
                            <UserOutlined style={{ color: "#fff" }} />
                        </div>

                        {/* Text container */}
                        <div className="customers-header-title" style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            position: "relative",
                            zIndex: 2,
                            flex: 1
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
                                {t("cus_title_customer_management")}
                            </div>
                        </div>

                        {/* Badge */}
                        <div className="customers-header-badge" style={{
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
                                👥
                            </div>
                            <div style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#fff",
                                marginTop: "2px"
                            }}>
                                {filteredData.length}
                            </div>
                        </div>
                    </div>
                    
                    <div className="customers-filters" style={{ padding: "20px 24px" }}>
                        <Flex className="customers-filters-row" justify="space-between" align="center" gap={12} style={{ width: "100%", flexWrap: "wrap" }}>
                            <Search
                                className="customers-search"
                                placeholder={t("cus_placeholder_search")} 
                                style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "100%" }}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                enterButton={<SearchOutlined />}
                            />
                            
                            <Select
                                className="customers-city-filter"
                                value={selectedCity}
                                onChange={(value) => setSelectedCity(value)}
                                style={{ flex: "1 1 150px", minWidth: "150px", maxWidth: "100%" }}
                                placeholder={t("cus_placeholder_filter_city")} 
                            >
                                {cities.map((city) => (
                                    <Option key={city} value={city}>
                                        {city === 'all' ? t("cus_filter_all") : city} 
                                    </Option>
                                ))}
                            </Select>
                            
                            <Button 
                                className="customers-activity-btn"
                                type="default" 
                                icon={<HistoryOutlined />} 
                                style={{ fontWeight: 600, flex: "1 1 auto", minWidth: "120px" }}
                                onClick={() => message.info(t('cus_msg_open_activity_page'))} 
                            >
                                <span className="customers-btn-text">{t("cus_button_activity")}</span>
                            </Button>
                            <Button 
                                className="customers-export-btn"
                                type="primary" 
                                icon={<CloudDownloadOutlined />} 
                                style={{ fontWeight: 600, backgroundColor: '#2ecc71', flex: "1 1 auto", minWidth: "120px" }} 
                                onClick={handleExportCSV}
                            >
                                <span className="customers-btn-text">{t("cus_button_export_report")}</span>
                            </Button>
                        </Flex>
                    </div>
                </Card>
                
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                    bodyStyle={{ padding: "0" }}
                >
                    <div className="customers-table-wrapper" style={{ overflowX: "auto" }}>
                        <Table
                            loading={loading}
                            size="large"
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="id"
                            scroll={{ x: 1200 }}
                            pagination={{
                                position: ["bottomCenter"],
                                pageSize: 8,
                                showSizeChanger: false,
                                responsive: true,
                                showTotal: (total, range) => (
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        {t("cus_pagination_total", { start: range[0], end: range[1], total })}
                                    </Text>
                                ),
                            }}
                        />
                    </div>
                </Card>
            </Space>

            <style>{`
                /* Mobile Responsive Styles */
                @media (max-width: 768px) {
                    .customers-header {
                        flex-direction: column !important;
                        padding: 16px !important;
                        gap: 12px !important;
                    }

                    .customers-header-icon {
                        width: 48px !important;
                        height: 48px !important;
                        font-size: 20px !important;
                    }

                    .customers-header-title > div {
                        font-size: 20px !important;
                        text-align: center;
                    }

                    .customers-header-badge {
                        position: absolute !important;
                        top: 16px !important;
                        right: 16px !important;
                        margin-left: 0 !important;
                        padding: 6px 12px !important;
                    }

                    .customers-header-badge > div:first-child {
                        font-size: 10px !important;
                    }

                    .customers-header-badge > div:last-child {
                        font-size: 16px !important;
                    }

                    .customers-filters {
                        padding: 16px !important;
                    }

                    .customers-filters-row {
                        flex-direction: column !important;
                        gap: 10px !important;
                    }

                    .customers-search,
                    .customers-city-filter,
                    .customers-activity-btn,
                    .customers-export-btn {
                        width: 100% !important;
                        flex: 1 1 100% !important;
                        max-width: 100% !important;
                    }

                    .customers-btn-text {
                        display: inline;
                    }

                    .customers-table-wrapper {
                        margin: 0 -16px;
                    }

                    .ant-table {
                        font-size: 13px !important;
                    }

                    .ant-table-thead > tr > th {
                        padding: 12px 8px !important;
                        font-size: 12px !important;
                    }

                    .ant-table-tbody > tr > td {
                        padding: 10px 8px !important;
                    }

                    .ant-pagination {
                        margin: 16px 0 !important;
                    }

                    .ant-pagination-item,
                    .ant-pagination-prev,
                    .ant-pagination-next {
                        min-width: 28px !important;
                        height: 28px !important;
                        line-height: 26px !important;
                        font-size: 12px !important;
                    }
                }

                /* Tablet Responsive */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .customers-header-title > div {
                        font-size: 24px !important;
                    }

                    .customers-filters-row {
                        gap: 10px !important;
                    }

                    .customers-search {
                        flex: 2 1 250px !important;
                    }

                    .customers-city-filter {
                        flex: 1 1 150px !important;
                    }

                    .customers-activity-btn,
                    .customers-export-btn {
                        flex: 1 1 140px !important;
                    }
                }

                /* Small mobile devices */
                @media (max-width: 480px) {
                    .customers-header-title > div {
                        font-size: 18px !important;
                    }

                    .ant-space {
                        padding: 16px !important;
                    }

                    .customers-activity-btn .customers-btn-text,
                    .customers-export-btn .customers-btn-text {
                        font-size: 13px !important;
                    }
                }
            `}</style>

            <Modal
                title={<Space><UserSwitchOutlined style={{color: '#2980b9'}} /> {t("cus_modal_edit_profile_title")}</Space>} 
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleEditCustomer} form={editForm} initialValues={selectedCustomer}>
                    <Form.Item name="lastName" label={t("cus_label_last_name")} rules={[{ required: true, message: t("cus_msg_last_name_required") }]}><Input /></Form.Item> 
                    <Form.Item name="firstName" label={t("cus_label_first_name")} rules={[{ required: true, message: t("cus_msg_first_name_required") }]}><Input /></Form.Item> 
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item name="phone" label={t("cus_label_phone")} rules={[{ required: true }]}><Input /></Form.Item> 
                    <Form.Item name="city" label={t("cus_label_city")} rules={[{ required: true }]}> 
                        <Select>
                             {/* Lấy danh sách thành phố từ map để đảm bảo tính nhất quán khi edit */}
                            {Object.values(cityMap).map(city => (
                                <Option key={city.vi} value={city.vi}>{city.vi}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ marginTop: 10, fontWeight: 600, backgroundColor: '#2980b9' }}>
                            {t("cus_button_save_changes")} 
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>


            <Drawer
                title={
                    <Space size={12}>
                        <HistoryOutlined style={{ color: '#8e44ad' }} />
                        <span style={{ fontWeight: 700 }}>{t("cus_drawer_activity_title", { name: selectedCustomer?.firstName })}</span> 
                    </Space>
                }
                placement="right"
                onClose={onCloseActivityDrawer}
                open={isActivityDrawerVisible} 
                width={500} 
                maskClosable={true}
            >
                {selectedCustomer && (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                        <Card size="small" bordered={false} style={{ background: '#f8f8f8', borderLeft: '3px solid #8e44ad' }}>
                            <Text strong>{t("cus_text_total_orders")}:</Text> <Tag color="purple">{selectedCustomer.totalOrders}</Tag> 
                            <Text strong style={{ marginLeft: 15 }}>{t("cus_text_joined")}:</Text> <Text type="secondary">{selectedCustomer.joinDate}</Text> 
                        </Card>

                        <Title level={5} style={{ marginTop: 10, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                            {t("cus_text_interaction_timeline")}: 
                        </Title>
                        
                        <Timeline
                            mode="left"
                            items={generateTimelineData(selectedCustomer, t, i18n)} 
                        />
                    </Space>
                )}
            </Drawer>


            <Modal
                title={<Space><PhoneOutlined style={{color: '#2ecc71'}} /> {t("cus_modal_log_interaction_title", { name: selectedCustomer?.firstName })}</Space>} 
                open={isContactModalVisible}
                onCancel={() => setIsContactModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleContactAction} form={contactForm}>
                    <Form.Item
                        name="method"
                        label={t("cus_label_contact_method")} 
                        rules={[{ required: true, message: t("cus_msg_contact_method_required") }]} 
                    >
                        <Select placeholder={t("cus_placeholder_select_action")}> 
                            <Option value="cus_method_phone"> 
                                <Space><PhoneOutlined style={{color: '#2ecc71'}}/> {t("cus_method_phone")}</Space>
                            </Option>
                            <Option value="cus_method_email"> 
                                <Space><MailOutlined style={{color: '#3498db'}}/> {t("cus_method_email")}</Space>
                            </Option>
                            <Option value="cus_method_chat"> 
                                <Space><CommentOutlined style={{color: '#f39c12'}}/> {t("cus_method_chat")}</Space>
                            </Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="note" label={t("cus_label_interaction_note")}> 
                        <Input.TextArea rows={3} placeholder={t("cus_placeholder_interaction_note")} /> 
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ marginTop: 10, fontWeight: 600, backgroundColor: '#2ecc71' }}>
                            {t("cus_button_log_action")} 
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default Customers;