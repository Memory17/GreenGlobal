// src/pages/Orders/index.js
import {
    Space,
    Table,
    Typography,
    Tag,
    Input,
    Select,
    Card,
    Flex,
    Button,
    Modal,
    Form,
    InputNumber,
    message,
    Drawer,
    Tooltip,
    Image,
    Badge,
} from "antd";
import { useEffect, useState, useCallback } from "react";
// Đảm bảo bạn có file API này
import { getStoredOrders } from '../../API'; 

import {
    ShoppingCartOutlined,
    SearchOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    EditOutlined,
    SaveOutlined,
    CarOutlined, // Thêm icon
    StarOutlined, // Thêm icon
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { Option } = Select;

// ... (Các hàm getOrders, fetchCustomers, generateRandomDate giữ nguyên) ...
const getOrders = async () => {
    try {
        const productsRes = await fetch("https://dummyjson.com/products");
        if (!productsRes.ok) {
            throw new Error(`HTTP error! status: ${productsRes.status}`);
        }
        const productsData = await productsRes.json();
        const products = productsData.products;
        const orders = products.slice(0, 15).map((p, i) => ({
            id: p.id,
            title: p.title,
            title_vi: p.title,
            price: p.price * 23500,
            quantity: Math.floor(Math.random() * 4) + 1,
            thumbnail: p.thumbnail,
        }));
        return { products: orders };
    } catch (error) {
        console.error("Error fetching products for orders:", error);
        return { products: [] };
    }
};
const fetchCustomers = async () => {
    try {
        const response = await fetch("https://dummyjson.com/users");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.users.map(user => ({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
        }));
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
};
const generateRandomDate = (i18n) => {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString(i18n.language); 
};
const formatCurrencyOrders = (amount, i18n) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      const fallbackAmount = 0;
      const isVietnamese = i18n.language === 'vi';
      const formatter = new Intl.NumberFormat(isVietnamese ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: isVietnamese ? 'VND' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return formatter.format(fallbackAmount);
    }
    const isVietnamese = i18n.language === 'vi';
    const formatter = new Intl.NumberFormat(isVietnamese ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: isVietnamese ? 'VND' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    const displayAmount = isVietnamese ? amount : amount / 23500;
    return formatter.format(displayAmount);
};
// ... (Kết thúc các hàm helper) ...


function Orders() {
    const { t, i18n } = useTranslation(); 
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [customerOptions, setCustomerOptions] = useState([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [quickViewOrder, setQuickViewOrder] = useState(null);
    const [editingKey, setEditingKey] = useState('');
    const [inlineForm] = Form.useForm();
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

    // Load orders (bao gồm cả local storage)
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersRes, customers] = await Promise.all([getOrders(), fetchCustomers()]);
            setCustomerOptions(customers.map(c => ({ value: c.fullName, label: c.fullName, detail: c })));
            const customerCount = customers.length;
  
            // Dữ liệu giả (dummy)
            const ordersWithCustomers = (ordersRes.products || []).map((item, index) => {
                const total = item.price * item.quantity;
                let status;
  
                // Sử dụng tên chuẩn (viết hoa chữ cái đầu)
                if (item.id % 3 === 0) status = "Delivered";
                else if (item.id % 3 === 1) status = "Processing";
                else status = "Cancelled";
  
                const customerIndex = customerCount > 0 ? index % customerCount : -1;
                const customerInfo = customerIndex !== -1 ? customers[customerIndex] : {
                    fullName: "Khách Lẻ",
                    email: "guest@example.com",
                    phone: "N/A"
                };
  
                return {
                    ...item,
                   total: total,
                    status: status,
                    date: generateRandomDate(i18n),
                    customer: customerInfo.fullName,
                    customerDetail: customerInfo,
                    key: item.id.toString(),
                    items: [ { ...item } ], 
                };
            });
  
            // Dữ liệu thật (từ localStorage)
            const stored = (getStoredOrders && getStoredOrders()) || [];
            
            const storedMapped = (stored || []).map((s, idx) => ({
                id: s.id || `stored-${idx}`,
                title: s.items && s.items[0] ? s.items[0].title : 'Đơn hàng mới',
                title_vi: s.items && s.items[0] ? s.items[0].title : 'Đơn hàng mới',
                price: s.items && s.items[0] ? s.items[0].price : 0,
                quantity: s.items ? s.items.reduce((a,b)=>a + (b.quantity || 1), 0) : 1,
                thumbnail: s.items && s.items[0] ? s.items[0].thumbnail || 'https://via.placeholder.com/60' : 'https://via.placeholder.com/60',
                total: s.totals ? s.totals.total : 0, 
                status: s.status || 'Processing', // Mặc định là 'Processing'
                date: new Date(s.createdAt || Date.now()).toLocaleDateString(i18n.language),
                customer: s.customer ? s.customer.name : 'Khách Lẻ', 
                customerDetail: s.customer || {},
                key: s.key || s.id || (`stored-${idx}`),
                items: s.items || [], 
            }));
  
            // Gộp cả thật và giả
            const merged = [...storedMapped, ...ordersWithCustomers];
  
            setDataSource(merged);
            setFilteredData(merged); 
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    }, [i18n]); 

    useEffect(() => {
        loadOrders();
    }, [loadOrders]); 

    // Lắng nghe sự kiện
    useEffect(() => {
        const onOrdersUpdated = () => {
            loadOrders(); 
        };
        const onStorage = (e) => {
            if (!e) return;
            if (e.key === 'app_orders_v1') { 
              loadOrders();
          }
       };
        window.addEventListener('orders_updated', onOrdersUpdated);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('orders_updated', onOrdersUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, [loadOrders]); 
    
    // Hàm này lấy bản dịch, nếu không có, trả về key (ví dụ: "Shipping")
    // const getTranslatedStatus = (statusKey) => {
    //     return t(`orders_tag_${statusKey}`, statusKey); // Dùng statusKey làm giá trị dự phòng
    // };

    useEffect(() => {
        const q = (searchValue || '').toString().toLowerCase();
        const filtered = dataSource.filter((item) => {
            const productTitle = i18n.language === 'vi' ? item.title_vi : item.title;
            const titleStr = (productTitle || '').toString().toLowerCase();
            const customerStr = (item?.customer || '').toString().toLowerCase();
            const keyStr = (item?.key || item?.id || '').toString(); 
            const matchName = titleStr.includes(q) || 
                              customerStr.includes(q) || 
                              keyStr.includes(searchValue || ''); 
            const matchStatus = filterStatus === "all" || item?.status === filterStatus;
            return matchName && matchStatus;
        });
        setFilteredData(filtered);
    }, [searchValue, filterStatus, dataSource, i18n.language]);

    // =======================================================
    // === CẬP NHẬT 1: CHUẨN HÓA MÀU SẮC ===
    // =======================================================
    const getStatusColor = (status) => {
        switch (status) {
            case "Processing": return "gold";
            case "Confirmed": return "cyan";
            case "Shipping": return "blue";
            case "Delivered": return "green";
            case "AwaitingReview": return "purple";
            case "Cancelled": return "volcano";
            // Hỗ trợ tên cũ (nếu có)
            case "delivered": return "green";
            case "processing": return "gold";
            case "cancelled": return "volcano";
            default: return "default";
        }
    };

    // =======================================================
    // === CẬP NHẬT 2: CHUẨN HÓA ICON ===
    // =======================================================
    const getStatusIcon = (status) => {
        switch (status) {
            case "Processing": return <ClockCircleOutlined />;
            case "Confirmed": return <CheckCircleOutlined />;
            case "Shipping": return <CarOutlined />;
            case "Delivered": return <CheckCircleOutlined />;
            case "AwaitingReview": return <StarOutlined />;
            case "Cancelled": return <CloseCircleOutlined />;
            // Hỗ trợ tên cũ (nếu có)
            case "delivered": return <CheckCircleOutlined />;
            case "processing": return <ClockCircleOutlined />;
            case "cancelled": return <CloseCircleOutlined />;
            default: return null;
        }
    };

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };
    
    const handleAddOrder = async (values) => {
        // ... (Hàm này giữ nguyên) ...
        const customerOption = customerOptions.find(c => c.value === values.customer);
        const customerDetail = customerOption?.detail || {
            fullName: values.customer,
            email: "manual@example.com",
            phone: "N/A"
        };
        const total = values.price * values.quantity;
        const newOrder = {
            id: `manual-${dataSource.length + 100}`,
            title: values.title,
            title_vi: values.title,
            price: values.price,
            customer: customerDetail.fullName,
            customerDetail: customerDetail,
            quantity: values.quantity,
            total,
            status: values.status, // Lấy status từ form (đã được chuẩn hóa)
            date: new Date().toLocaleDateString(i18n.language),
            key: `manual-${dataSource.length + 100}`,
            thumbnail: "https://via.placeholder.com/60?text=Product",
            items: [{ title: values.title, price: values.price, quantity: values.quantity, thumbnail: "https://via.placeholder.com/60?text=Product" }]
        };
        setDataSource([newOrder, ...dataSource]);
        message.success(t("orders_msg_add_success")); 
        handleCancel();
    };

    const handleQuickView = (record) => {
        setQuickViewOrder(record);
        setIsDrawerVisible(true);
    };

    const isEditing = (record) => (record.key || record.id) === editingKey;

    // Gỡ bỏ check để cho phép sửa mọi trạng thái
    const edit = (record) => {
        // Không cho phép admin chỉnh sửa khi đơn đã ở trạng thái Đã Giao/Completed
        const nonEditableStatuses = ["Delivered", "Completed"];
        if (nonEditableStatuses.includes(record.status)) {
            message.warning(t('orders_msg_cannot_edit_delivered', 'Không thể cập nhật trạng thái đã giao.'));
            return;
        }
        inlineForm.setFieldsValue({ status: record.status, ...record });
        setEditingKey(record.key || record.id); // Dùng key hoặc id
    };

    // Hàm save - phát tín hiệu (Đã đúng, giữ nguyên)
    const save = async (key) => {
        try {
            const row = await inlineForm.validateFields();
            const newData = [...dataSource];
            const index = newData.findIndex((item) => (item.key || item.id) === key); 

            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setDataSource(newData);
                setEditingKey('');
                message.success(t('orders_msg_update_success', { key: key }));

                // LOGIC LƯU VÀO LOCALSTORAGE (cho Admin)
                try {
                    const stored = (getStoredOrders && getStoredOrders()) || [];
                    const matchedKey = (s) => {
                        const sKey = s && (s.key || s.id);
                        return sKey && sKey.toString() === key.toString();
                    };
                    let orderFound = false;
                    let updatedStored = stored.map((s) => {
                        if (matchedKey(s)) {
                            orderFound = true;
                            return { ...s, status: row.status }; // row.status giờ đã chuẩn
                        }
                        return s;
                    });
                    
                    if (orderFound) {
                        try {
                            localStorage.setItem('app_orders_v1', JSON.stringify(updatedStored || []));
    
                            // === PHÁT TÍN HIỆU CHO USER ===
                            try {
                                const eventData = {
                                    orderId: key, 
                                    newStatus: row.status // Gửi đi tên trạng thái đã chuẩn hóa
                                };
                                const statusUpdateEvent = new CustomEvent('admin_order_status_updated', {
                                    detail: eventData
                                });
                                window.dispatchEvent(statusUpdateEvent);
                            } catch (eventError) {
                                console.error("Lỗi khi phát sự kiện cập nhật trạng thái:", eventError);
                            }
                            // === KẾT THÚC PHÁT TÍN HIỆU ===

                        } catch (e) {
                            console.error('Failed to persist order status', e); 
                        }
                    }
                } catch (e) {
                    console.error('Error while saving status to stored orders', e);
                }
            } else {
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };
    
    // =======================================================
    // === CẬP NHẬT 3: CHUẨN HÓA DROPDOWN CỦA ADMIN ===
    // =======================================================
    const EditableStatusColumn = ({ record }) => {
        const editable = isEditing(record);
        
        if (editable) {
            return (
                <Form.Item
                    name="status"
                    style={{ margin: 0 }}
                    rules={[{ required: true, message: t('orders_msg_status_required') }]}
                >
                    {/* Sử dụng tên chuẩn hóa (value) khớp với STATUS_MAP của CartProducts.js */}
                    <Select size="small" placeholder={t('orders_col_status')}>
                        <Option value="Processing">{t('orders_tag_Processing', 'Đang Xác nhận')}</Option>
                        <Option value="Confirmed">{t('orders_tag_Confirmed', 'Đã Xác nhận')}</Option> 
                        <Option value="Shipping">{t('orders_tag_Shipping', 'Đang Giao hàng')}</Option> 
                        <Option value="Delivered">{t('orders_tag_Delivered', 'Đã Giao')}</Option> 
                        <Option value="AwaitingReview">{t('orders_tag_AwaitingReview', 'Chờ Đánh giá')}</Option> 
                        <Option value="Cancelled">{t('orders_tag_Cancelled', 'Đã Hủy')}</Option> 
                    </Select>
                </Form.Item>
            );
        }
        
        return (
            <Tag
                color={getStatusColor(record.status)}
                icon={getStatusIcon(record.status)}
                style={{ fontWeight: 600, borderRadius: 4, fontSize: 13, padding: "4px 10px", marginRight: 0 }}
            >
                {/* Dùng key làm giá trị dự phòng nếu không có bản dịch */}
                {t(`orders_tag_${record.status}`, record.status)} 
            </Tag>
        );
    };

    // ... (Hàm getColumns giữ nguyên) ...
    const getColumns = () => {
        const baseColumns = [
            {
                title: "STT",
                align: "center",
                width: 55,
                render: (_, __, index) => <Text strong style={{ fontSize: 14 }}>{index + 1}</Text>,
            },
            {
                title: t("orders_col_product"), 
                dataIndex: i18n.language === 'vi' ? "title_vi" : "title", 
                width: screenSize === 'xs' ? 150 : screenSize === 'sm' ? 180 : 240,
                render: (text, record) => ( 
                    <Flex gap={10} align="flex-start" onClick={() => handleQuickView(record)} style={{ cursor: 'pointer' }}>
                        <Badge.Ribbon text={`#${record.id.toString().substring(0, 10)}`} color="cyan">
                            <Image
                                src={record.thumbnail}
                                alt={text}
                                width={screenSize === 'xs' ? 45 : 65}
                                height={screenSize === 'xs' ? 45 : 65}
                                style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0', flexShrink: 0 }}
                                preview={{ mask: "Xem" }}
                            />
                        </Badge.Ribbon>
                        <Text 
                            style={{ 
                                fontSize: screenSize === 'xs' ? 11 : 13,
                                lineHeight: 1.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                flex: 1,
                                marginTop: '4px',
                                fontWeight: 500
                            }}
                            className="product-name-hover"
                        >
                            {text}
                        </Text>
                    </Flex>
                ),
            },
            {
                title: t("orders_col_customer"), 
                dataIndex: "customer",
                width: screenSize === 'xs' ? 100 : screenSize === 'sm' ? 120 : 140,
                render: (text) => <Text style={{ fontSize: screenSize === 'xs' ? 11 : 13 }}>{text}</Text>
            },
            {
                title: t("orders_col_date"), 
                dataIndex: "date",
                width: screenSize === 'xs' ? 90 : 120,
                render: (text) => <Text style={{ fontSize: screenSize === 'xs' ? 11 : 13 }}>{text}</Text>
            },
        ];

        if (screenSize !== 'xs') {
            baseColumns.push(
                {
                    title: t("orders_col_qty"), 
                    dataIndex: "quantity",
                    align: "center",
                    width: 75,
                    render: (qty) => (
                        <Badge count={qty} showZero style={{ backgroundColor: qty > 2 ? '#1677ff' : '#722ed1', fontSize: 13 }} />
                    ),
                },
                {
                    title: t("orders_col_total"), 
                    dataIndex: "total",
                    align: "right",
                    width: 120,
                    render: (value) => (
                        <Text strong style={{ color: "#1677ff", fontSize: 13 }}>
                            {formatCurrencyOrders(value, i18n)} 
                        </Text>
                    ),
                }
            );
        }

        baseColumns.push(
            {
                title: t("orders_col_status"), 
                dataIndex: "status",
                align: "center",
                width: screenSize === 'xs' ? 90 : 140,
                render: (_, record) => (
                    <EditableStatusColumn record={record} />
                )
            },
            {
                title: t("orders_col_actions"), 
                dataIndex: "operation",
                align: "center",
                width: screenSize === 'xs' ? 60 : 80,
                render: (_, record) => {
                    const editable = isEditing(record);
                    const currentKey = record.key || record.id; 
                    return editable ? (
                        <Tooltip title={t("orders_tip_save_changes")}> 
                            <Button
                                onClick={() => save(currentKey)} 
                                icon={<SaveOutlined />}
                                type="text"
                                size="small"
                                style={{ color: '#27ae60', padding: 4 }}
                            />
                        </Tooltip>
                    ) : (
                        <Space size={screenSize === 'xs' ? 0 : 2}>
                            <Tooltip title={t("orders_tip_view_detail")}> 
                                <Button 
                                    onClick={() => handleQuickView(record)}
                                    icon={<EyeOutlined />}
                                    type="text"
                                    size={screenSize === 'xs' ? 'small' : 'small'}
                                    style={{ color: '#3498db', padding: 4 }}
                                />
                            </Tooltip>
                            {screenSize !== 'xs' && (
                                    <Tooltip title={t("orders_tip_edit_status")}> 
                                    <Button
                                        disabled={editingKey !== '' || ['Delivered','Completed'].includes(record.status)}
                                        onClick={() => edit(record)}
                                        icon={<EditOutlined />}
                                        type="text"
                                        size="small"
                                        style={{ color: '#f39c12', padding: 4 }}
                                    />
                                </Tooltip>
                            )}
                        </Space>
                    );
                },
            }
        );

        return baseColumns;
    };

    const columns = getColumns();
    return (
        <Space
            size={16}
            direction="vertical"
            style={{
                width: "100%",
                padding: screenSize === 'xs' ? "12px" : "20px",
                background: "#f5f7fa",
                borderRadius: "12px",
            }}
        >
           <Flex 
               justify="space-between" 
               align={screenSize === 'xs' ? 'flex-start' : 'center'} 
               gap={16} 
               style={{ width: "100%" }}
               wrap={screenSize === 'xs' ? 'wrap' : 'nowrap'}
           >
                <Title
                    level={3}
                    style={{
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        color: "#262626",
                        marginBottom: 0, 
                        fontWeight: 600, 
                        fontSize: screenSize === 'xs' ? 18 : 25, 
                        flexShrink: 0
                    }}
                >
                    <ShoppingCartOutlined
                        style={{
                            color: "#fff", 
                            backgroundColor: "#e74c3c", 
                            borderRadius: "50%", 
                            padding: screenSize === 'xs' ? 6 : 8,
                            fontSize: screenSize === 'xs' ? 16 : 20, 
                            boxShadow: "0 2px 4px rgba(231, 76, 60, 0.3)",
                        }}
                    />
                    <span>{t("orders_title")}</span> 
                </Title>

                <Flex 
                    gap={10} 
                    align="center"
                    style={{ width: screenSize === 'xs' ? '100%' : 'auto' }}
                    wrap={screenSize === 'xs' ? 'wrap' : 'nowrap'}
                >
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder={t("orders_search_placeholder")} 
                        style={{ borderRadius: 6, width: screenSize === 'xs' ? '100%' : 280 }}
                        size={screenSize === 'xs' ? 'small' : 'middle'}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    {/* Cập nhật bộ lọc của Admin để dùng tên chuẩn */}
                    <Select
                        value={filterStatus}
                        style={{ width: screenSize === 'xs' ? '48%' : 120, borderRadius: 6 }}
                        size={screenSize === 'xs' ? 'small' : 'middle'}
                        onChange={(value) => setFilterStatus(value)}
                    >
                        <Option value="all">{t("orders_filter_all")}</Option> 
                        <Option value="Delivered">{t("orders_filter_delivered")}</Option> 
                        <Option value="Processing">{t("orders_filter_processing")}</Option> 
                        <Option value="Cancelled">{t("orders_filter_cancelled")}</Option> 
                        <Option value="Shipping">{t('orders_tag_Shipping', 'Đang Giao')}</Option> 
                    </Select>
                    
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                        size={screenSize === 'xs' ? 'small' : 'middle'}
                        style={{
                            borderRadius: 6,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontWeight: 500,
                            flexShrink: 0,
                            width: screenSize === 'xs' ? '48%' : 'auto'
                        }}
                    >
                        {screenSize === 'xs' ? '+' : t("orders_btn_create")} 
                    </Button>
                </Flex>
            </Flex>

            <Card
                variant="borderless"
                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", background: "#fff", overflow: 'hidden' }}
                bodyStyle={{ padding: "0" }}
            >
                <Form form={inlineForm} component={false}>
                    <Table
                        loading={loading}
                        size={screenSize === 'xs' ? 'small' : 'middle'}
                        columns={columns}
                        dataSource={filteredData}
                        rowKey={(record) => record.key || record.id}
                        pagination={{ 
                            position: ["bottomCenter"], 
                            pageSize: screenSize === 'xs' ? 3 : 5, 
                            showSizeChanger: false, 
                            size: "default" 
                        }}
                        style={{ width: "100%", marginBottom: 0 }}
                        rowClassName="order-row"
                        scroll={{ x: screenSize === 'xs' ? 600 : undefined }}
                    />
                </Form>
            </Card>

            <Modal
                title={t("orders_modal_title")} 
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={screenSize === 'xs' ? '95%' : 500}
                style={{ top: screenSize === 'xs' ? 20 : undefined }}
            >
                <Form layout="vertical" onFinish={handleAddOrder} form={form}>
                    <Form.Item name="title" label={t("product_name")} rules={[{ required: true }]}><Input placeholder={t("orders_placeholder_product_name")} /></Form.Item>
                    <Form.Item name="customer" label={t("orders_col_customer")} rules={[{ required: true }]}>
                        <Select 
                            placeholder={t("orders_placeholder_select_customer")}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label?.toLowerCase() ?? '').includes(input.toLowerCase())
                            }
                            options={customerOptions}
                        >
                        </Select>
                    </Form.Item>
                    <Form.Item name="price" label={t("orders_label_price")} rules={[{ required: true }]}>
                        <InputNumber 
                            min={1} 
                            style={{ width: "100%" }} 
                            formatter={(value) => formatCurrencyOrders(value, i18n)}
                            parser={(value) => value.replace(/[^0-9]/g, '')} 
                        />
                    </Form.Item>
                    <Form.Item name="quantity" label={t("orders_col_qty")} rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder={t("orders_placeholder_qty")} />
                    </Form.Item>
                    {/* Cập nhật cả modal tạo mới */}
                    <Form.Item name="status" label={t("orders_col_status")} rules={[{ required: true, message: t('orders_msg_status_required') }]}>
                        <Select placeholder={t("orders_placeholder_select_status")}>
                            <Option value="Processing">{t('orders_tag_Processing', 'Đang Xác nhận')}</Option>
                            <Option value="Confirmed">{t('orders_tag_Confirmed', 'Đã Xác nhận')}</Option> 
                            <Option value="Shipping">{t('orders_tag_Shipping', 'Đang Giao hàng')}</Option> 
                            <Option value="Delivered">{t('orders_tag_Delivered', 'Đã Giao')}</Option> 
                            <Option value="AwaitingReview">{t('orders_tag_AwaitingReview', 'Chờ Đánh giá')}</Option> 
                            <Option value="Cancelled">{t('orders_tag_Cancelled', 'Đã Hủy')}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            style={{ backgroundColor: "#8e44ad", borderRadius: 6, fontWeight: 500 }}
                        >
                            {t("orders_modal_btn_confirm")} 
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            
            <Drawer
                title={<Space><EyeOutlined /> {t("orders_tip_view_detail")} #{quickViewOrder?.id.toString().substring(0, 10)}</Space>}
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={screenSize === 'xs' ? '100%' : 380}
            >
                {quickViewOrder && (
                    <Space direction="vertical" size={14} style={{ width: '100%' }}>
                        <Image
                            src={quickViewOrder.thumbnail}
                            alt={quickViewOrder.title}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                maxHeight: '250px'
                            }}
                        />
                        
                        <Card size="small" bordered={false} style={{ background: '#f8f8f8' }}>
                            <Text strong>{t("orders_col_customer")}:</Text> <Text>{quickViewOrder.customer}</Text><br/>
                            <Text strong>Email:</Text> <Text>{quickViewOrder.customerDetail?.email || 'N/A'}</Text><br/>
                            <Text strong>Phone:</Text> <Text>{quickViewOrder.customerDetail?.phone || 'N/A'}</Text><br/>
                            <Text strong>{t("orders_col_date")}:</Text> <Text>{quickViewOrder.date}</Text><br/>
                            <Text strong>{t("orders_col_status")}:</Text> <Tag color={getStatusColor(quickViewOrder.status)}>{t(`orders_tag_${quickViewOrder.status}`, quickViewOrder.status)}</Tag>
                        </Card>

                        <Title level={5}>{t("orders_product_info")}:</Title>
                        <Table
                            dataSource={quickViewOrder.items || []} 
                            columns={[
                                { title: t("product_name"), dataIndex: i18n.language === 'vi' ? 'title_vi' : 'title' },
                                { 
                                    title: t("unit_price"), 
                                    dataIndex: 'price',
                                    render: (price) => formatCurrencyOrders(price, i18n)
                                },
                                { title: t("orders_col_qty"), dataIndex: 'quantity', align: 'center' },
                            ]}
                            pagination={false}
                            size={screenSize === 'xs' ? 'small' : 'middle'}
                            rowKey={(record) => record.id || record.title} 
                        />

                        <Card bordered={true} style={{ borderLeft: '5px solid #1677ff' }}>
                            <Title level={4} style={{ margin: 0, fontSize: screenSize === 'xs' ? 16 : 18 }}>
                                {t("orders_payment_total")}: {formatCurrencyOrders(quickViewOrder.total, i18n)}
                            </Title>
                        </Card>
                    </Space>
                )}
            </Drawer>

            <style>{`
                .product-name-hover:hover {
                    color: #1677ff;
                }
                .order-row:hover {
                    background-color: #fafafa;
                }
                @media (max-width: 768px) { .ant-table { font-size: 12px; } }
                @media (max-width: 576px) { .ant-table { font-size: 11px; } .ant-btn { padding: 4px 8px; } }
            `}</style>
        </Space>
    );
}

export default Orders;