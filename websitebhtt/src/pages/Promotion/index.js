import React, { useState, useEffect } from 'react';
import {
    Tabs, Layout, Typography, Space, Button, Table, Tag,
    Modal, Form, Input, DatePicker, Select, Switch, Card,
    Divider, Slider, List, Descriptions, Progress, Upload, message,
    Tooltip
} from 'antd';
import {
    GiftOutlined, TagOutlined, CrownOutlined, CarOutlined, // Giữ CarOutlined cho icon sub-tab
    PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined,
    UploadOutlined,
    FireOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from "react-i18next";

// CHỈ IMPORT MỘT FILE SERVICE CHUNG: discountService
import { 
    fetchCoupons, createCoupon, deleteCoupon, updateCoupon,
    fetchShippingRules, createShippingRule,
} from '../../data/discountService'; 
import { getStoredOrders } from '../../API'; 

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

// ======================================================================
// 1. Dữ liệu mẫu & Utils (Giữ nguyên)
// ======================================================================

const mockCampaigns = [
    { key: '1', name: 'Sale Hè Siêu Tốc', name_en: 'Summer Super Sale', type: 'discount_percent', type_vi: 'Giảm giá %', time: ['2025-06-01', '2025-06-30'], status: 'active', performance: '150 đơn (120M VNĐ)' },
    { key: '2', name: 'Miễn Phí Vận Chuyển Toàn Quốc', name_en: 'National Free Shipping', type: 'free_shipping', type_vi: 'Miễn phí ship', time: ['2025-05-01', '2025-12-31'], status: 'scheduled', performance: 'N/A' },
];

const formatLoyaltyCurrency = (amount, i18n, t) => {
    const isVietnamese = i18n.language === 'vi';
    const unit = isVietnamese ? 'đ' : '$';
    const locale = isVietnamese ? 'vi-VN' : 'en-US';
    const factor = isVietnamese ? 1 : 23000;
    
    if (amount === Infinity) return t('promo_loyalty_unlimited');

    const displayAmount = isVietnamese ? amount : amount / factor;

    return displayAmount.toLocaleString(locale, { minimumFractionDigits: 0 }) + unit;
};

// ======================================================================
// 2. Component Con
// ======================================================================

// --- 2.1. Quản lý Chiến dịch Khuyến mãi (Tab 1) (Giữ nguyên) ---
// (Component CampaignsManagement giữ nguyên)

const useWindowWidth = () => {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
};

const CampaignsManagement = () => {
    const { t, i18n } = useTranslation();
    const width = useWindowWidth();
    const isMobile = width < 768;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [data, setData] = useState(mockCampaigns);

    const handleCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            time: [moment(record.time[0]), moment(record.time[1])],
            type: record.type === 'discount_percent' ? 'discount_percent' :
                  record.type === 'discount_fixed' ? 'discount_fixed' :
                  'free_shipping',
        });
        setIsModalVisible(true);
    };

    const handleSave = (values) => {
        const typeValue = values.type;
        const typeVi = t(`promo_type_${values.type}`, { lng: 'vi' });
        
        const newRecord = {
            ...values,
            key: editingRecord ? editingRecord.key : Date.now().toString(),
            name_en: values.name,
            name: values.name,
            time: values.time.map(date => date.format('YYYY-MM-DD')),
            performance: editingRecord ? editingRecord.performance : '0 đơn (0 VNĐ)',
            status: editingRecord ? editingRecord.status : 'active',
            type: typeValue,
            type_vi: typeVi,
        };
        
        if (editingRecord) {
            setData(data.map(item => item.key === editingRecord.key ? newRecord : item));
        } else {
            setData([...data, newRecord]);
        }
        
        message.success(t('promo_msg_campaign_saved'));
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: t('promo_col_name'),
            dataIndex: i18n.language === 'en' ? 'name_en' : 'name',
            key: 'name',
            width: 200
        },
        {
            title: t('promo_col_type'),
            dataIndex: i18n.language === 'en' ? 'type' : 'type_vi',
            key: 'type',
            render: (type) => <Tag color={type.includes('Giảm giá') || type.includes('discount') ? 'geekblue' : 'green'}>{type}</Tag>
        },
        {
            title: t('promo_col_time'),
            dataIndex: 'time',
            key: 'time',
            render: (time) => `${time[0]} ${t('promo_text_to')} ${time[1]}`
        },
        {
            title: t('promo_col_status'),
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Switch
                    checked={status === 'active'}
                    checkedChildren={t('promo_status_running')}
                    unCheckedChildren={t('promo_status_paused')}
                    onChange={(checked) => {
                        const newStatus = checked ? 'active' : 'paused';
                        setData(data.map(item => item.key === record.key ? { ...item, status: newStatus } : item));
                    }}
                />
            )
        },
        { title: t('promo_col_performance'), dataIndex: 'performance', key: 'performance' },
        {
            title: t('promo_col_actions'),
            key: 'action',
            width: 100, 
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('promo_btn_edit')}>
                        <Button 
                            type="text" 
                            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                            size="small" 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            onClick={() => { /* Xử lý Xóa Campaign */ }}
                        />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <Card
            title={t('promo_campaigns_title')}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }} 
            extra={
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleCreate}
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 600,
                    }}
                >
                    {t('promo_btn_create_campaign')}
                </Button>
            }
        >
            {isMobile ? (
                <List
                    dataSource={data}
                    split={false}
                    renderItem={(item) => (
                        <List.Item>
                            <Card className="promo-card-mobile" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{i18n.language === 'en' ? item.name_en : item.name}</div>
                                        <div style={{ color: '#888', fontSize: 12 }}>{item.type_vi || item.type}</div>
                                        <div style={{ color: '#aaa', fontSize: 12 }}>{item.time[0]} {t('promo_text_to')} {item.time[1]}</div>
                                    </div>
                                    <div style={{ marginLeft: 12, textAlign: 'right' }}>
                                        <Space direction="vertical" size={6}>
                                            <Switch checked={item.status === 'active'} checkedChildren={t('promo_status_running')} unCheckedChildren={t('promo_status_paused')} />
                                            <Space>
                                                <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(item)} />
                                                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                            </Space>
                                        </Space>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    rowKey="key" 
                    pagination={{ pageSize: 5 }} 
                    className="professional-coupon-table" 
                />
            )}
            
            <Modal
                title={editingRecord ? t('promo_modal_edit') : t('promo_modal_create')}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item label={t('promo_label_campaign_name')} name="name" rules={[{ required: true, message: t('promo_msg_name_required') }]}>
                        <Input placeholder={t('promo_placeholder_campaign_name')} />
                    </Form.Item>
                    <Form.Item label={t('promo_label_time')} name="time" rules={[{ required: true, message: t('promo_msg_time_required') }]}>
                        <RangePicker showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
                    </Form.Item>
                    <Space size="large">
                        <Form.Item label={t('promo_label_type')} name="type" rules={[{ required: true, message: t('promo_msg_type_required') }]}>
                            <Select placeholder={t('promo_placeholder_type')} style={{ width: 250 }}>
                                <Select.Option value="discount_percent">{t('promo_type_discount_percent')}</Select.Option>
                                <Select.Option value="discount_fixed">{t('promo_type_discount_fixed')}</Select.Option>
                                <Select.Option value="free_shipping">{t('promo_type_free_shipping')}</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label={t('promo_label_value')} name="value" rules={[{ required: true }]}>
                             <Input placeholder={t('promo_placeholder_value')} type="number" style={{ width: 250 }} />
                        </Form.Item>
                    </Space>
                    <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>{t('cancel')}</Button>
                            <Button type="primary" htmlType="submit">
                                {editingRecord ? t('promo_btn_save_changes') : t('promo_btn_create_campaign_short')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};


// --- 2.2. Logic Bảng Coupons (Tách ra để dùng trong CouponsManagement) ---

const CouponsTableLogic = ({ t, coupons, loading, handleEdit, handleDelete }) => {
    const columns = [
        { title: t('promo_col_coupon_code'), dataIndex: 'code', key: 'code', render: (code) => <Tag color="orange" style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>{code}</Tag> },
        { title: t('promo_col_coupon_value'), dataIndex: 'value', key: 'value', render: (value) => <span style={{ fontWeight: 600, color: '#3f3f3f' }}>{value}</span> },
        {
            title: t('promo_col_expiry_date'), dataIndex: 'expireDate', key: 'expireDate', render: (date) => {
                const daysUntilExpiry = moment(date).diff(moment(), 'days');
                let tagColor = 'blue';
                let tagText = date;
                if (daysUntilExpiry < 0) { tagColor = 'default'; tagText = `Hết hạn (${date})`; } else if (daysUntilExpiry <= 30) { tagColor = 'red'; tagText = `${date} (${daysUntilExpiry} ngày)`; }
                return <Tag color={tagColor} bordered={tagColor === 'default'}>{tagText}</Tag>
            }
        },
        {
            title: t('promo_col_usage_count'), dataIndex: 'used', key: 'used', width: 200, render: (used, record) => {
                const percent = Math.floor(((used || 0) / (record.limit || 1)) * 100);
                return (
                    <Progress percent={percent} size="small" strokeColor={percent > 90 ? '#ff4d4f' : '#52c41a'} format={() => `${used || 0}/${record.limit || '∞'}`} />
                );
            }
        },
        { 
            title: t('promo_col_actions'), key: 'action', width: 100, render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('promo_btn_edit')}><Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} size="small" onClick={() => handleEdit(record, 'coupon')} /></Tooltip>
                    <Tooltip title={t('delete')}><Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.key, 'coupon')} /></Tooltip>
                </Space>
            )
        },
    ];

    const width = useWindowWidth();
    const isMobile = width < 768;

    if (isMobile) {
        return (
            <List
                dataSource={coupons}
                split={false}
                renderItem={(record) => (
                    <List.Item>
                        <Card className="promo-card-mobile" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}><Tag color="orange">{record.code}</Tag></div>
                                    <div style={{ color: '#888', fontSize: 12 }}>{record.value}</div>
                                    <div style={{ color: '#aaa', fontSize: 12 }}>{record.expireDate}</div>
                                </div>
                                <div>
                                    <Space direction="vertical">
                                        <Progress percent={Math.floor(((record.used || 0) / (record.limit || 1)) * 100)} size="small" />
                                        <Space>
                                            <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record, 'coupon')} />
                                            <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.key, 'coupon')} />
                                        </Space>
                                    </Space>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        );
    }

    return (
        <Table 
            columns={columns} 
            dataSource={coupons} 
            rowKey="key" 
            pagination={{ pageSize: 5 }} 
            loading={loading}
            className="professional-coupon-table" 
        />
    );
};

// --- 2.3. Logic Bảng Shipping Rules (Tách ra để dùng trong CouponsManagement) ---

const ShippingTableLogic = ({ t, rules, loading, handleEdit, handleDelete }) => {
    const columns = [
        { title: 'Tên Quy tắc', dataIndex: 'ruleName', key: 'ruleName', width: 200 },
        { 
            title: 'Đơn hàng tối thiểu', dataIndex: 'minOrderValueDisplay', key: 'minOrderValue', width: 150,
            render: (value) => <span style={{ fontWeight: 600, color: '#096dd9' }}>{value}</span>
        },
        { 
            title: 'Loại Giảm giá', dataIndex: 'discountType', key: 'discountType', width: 150, 
            render: (type, record) => {
                if (type === 'FREE') { return <Tag color="green">Miễn phí Ship</Tag>; } 
                if (type === 'FIXED') { return <Tag color="blue">Giảm {record.discountValue ? record.discountValue.toLocaleString('vi-VN') + 'đ' : 'N/A'}</Tag>; }
                return <Tag>Không áp dụng</Tag>;
            }
        },
        { 
            title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 120,
            render: (isActive, record) => (
                <Switch checked={isActive} checkedChildren="Active" unCheckedChildren="Paused" onChange={(checked) => {
                    // Logic update status 
                }} />
            )
        },
        { 
            title: t('promo_col_actions'), key: 'action', width: 100, render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('promo_btn_edit')}><Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} size="small" onClick={() => handleEdit(record, 'shipping')} /></Tooltip>
                    <Tooltip title={t('delete')}><Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.key, 'shipping')} /></Tooltip>
                </Space>
            )
        },
    ];
    const width = useWindowWidth();
    const isMobile = width < 768;
    if (isMobile) {
        return (
            <List
                dataSource={rules}
                split={false}
                renderItem={(record) => (
                    <List.Item>
                        <Card className="promo-card-mobile" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700 }}>{record.ruleName}</div>
                                    <div style={{ color: '#888', fontSize: 12 }}>{'Đơn hàng tối thiểu'} : {record.minOrderValueDisplay || record.minOrderValue}</div>
                                    <div style={{ color: '#aaa', fontSize: 12 }}>{record.discountType}</div>
                                </div>
                                <div>
                                    <Space>
                                        <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record, 'shipping')} />
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.key, 'shipping')} />
                                    </Space>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        );
    }

    return (
        <Table 
            columns={columns} 
            dataSource={rules} 
            rowKey="key" 
            pagination={{ pageSize: 5 }} 
            loading={loading}
            className="professional-coupon-table" 
        />
    );
};


// --- 2.4. Quản lý Mã giảm giá (Coupons Management) (CONTAINER CHÍNH) ---

const CouponsManagement = () => {
    const { t } = useTranslation();
    const [activeSubTab, setActiveSubTab] = useState('coupons'); 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [coupons, setCoupons] = useState([]); 
    const [rules, setRules] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [editingRecord, setEditingRecord] = useState(null); 
    const [editingType, setEditingType] = useState(null); 
    const [form] = Form.useForm();

    const loadData = async () => {
        setLoading(true);
        try {
            // Lấy dữ liệu từ cả hai API endpoint
            const [couponData, ruleData] = await Promise.all([fetchCoupons(), fetchShippingRules()]);
            setCoupons(couponData);
            setRules(ruleData);
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu khuyến mãi. Vui lòng kiểm tra console.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []); 

    const handleSave = async (values) => {
        setLoading(true);
        try {
            if (editingType === 'coupon') {
                const expiryDate = values.expiry.format('YYYY-MM-DD');
                if (editingRecord) {
                    // Cập nhật Coupon
                    const updatedData = { value: values.value, limit: values.limit, expireDate: expiryDate };
                    await updateCoupon(editingRecord.key, updatedData);
                    message.success("Đã cập nhật Mã giảm giá thành công.");
                } else {
                    // Tạo mới Coupon
                    const newCouponData = { code: values.code, value: values.value, limit: values.limit || 9999, used: 0, expireDate: expiryDate };
                    await createCoupon(newCouponData);
                    message.success(`Đã tạo ${values.count} Mã giảm giá thành công.`);
                }
            } else if (editingType === 'shipping') {
                // Tạo/Cập nhật Shipping Rule
                const ruleData = {
                    ruleName: values.ruleName,
                    minOrderValue: parseInt(values.minOrderValue),
                    discountType: values.discountType,
                    discountValue: values.discountType === 'FIXED' ? parseInt(values.discountValue) : undefined,
                    description: values.description,
                    isActive: values.isActive,
                };
                
                if (editingRecord) {
                    // Cần triển khai hàm updateShippingRule
                    // await updateShippingRule(editingRecord.key, ruleData); 
                    message.success(`Đã cập nhật Quy tắc Ship thành công.`);
                } else {
                    await createShippingRule(ruleData);
                    message.success(`Đã tạo Quy tắc Ship "${values.ruleName}" thành công.`);
                }
            }
            
            setIsModalVisible(false);
            setEditingRecord(null);
            setEditingType(null);
            form.resetFields();
            loadData();
        } catch (error) {
            message.error("Lỗi khi lưu dữ liệu. Vui lòng kiểm tra console.");
            console.error(error);
        } finally {
             setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        setLoading(true);
        try {
            if (type === 'coupon') {
                await deleteCoupon(id);
            } else if (type === 'shipping') {
                // Cần triển khai hàm deleteShippingRule
                // await deleteShippingRule(id);
                message.success("Đã xóa Quy tắc Ship thành công.");
            }
            message.success("Đã xóa thành công.");
            loadData();
        } catch (error) {
            message.error("Lỗi khi xóa. Vui lòng kiểm tra console.");
        } finally {
             setLoading(false);
        }
    };

    const handleEdit = (record, type) => {
        setEditingRecord(record);
        setEditingType(type);
        form.resetFields();
        
        if (type === 'coupon') {
            form.setFieldsValue({
                code: record.code,
                value: record.value.replace('%', '').replace('Freeship', '0'), 
                limit: record.limit,
                expiry: moment(record.expireDate, 'YYYY-MM-DD')
            });
        } else if (type === 'shipping') {
            form.setFieldsValue({
                ruleName: record.ruleName,
                minOrderValue: record.minOrderValue,
                discountType: record.discountType,
                discountValue: record.discountType === 'FIXED' ? record.discountValue : undefined,
                description: record.description,
                isActive: record.isActive,
            });
        }
        setIsModalVisible(true);
    };

    const handleCreate = (type) => {
        setEditingRecord(null);
        setEditingType(type);
        form.resetFields();
        setIsModalVisible(true);
    };
    
    // Nút TẠO LÔ/TẠO MỚI dựa trên sub-tab đang chọn
    const getExtraButton = () => (
        <Space>
            {activeSubTab === 'coupons' && (
                <Upload showUploadList={false} beforeUpload={() => { message.info(t('promo_msg_import_start')); return false; }}>
                    <Button icon={<UploadOutlined />}>Import (CSV)</Button>
                </Upload>
            )}
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => handleCreate(activeSubTab === 'coupons' ? 'coupon' : 'shipping')}
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                }}
            >
                {activeSubTab === 'coupons' ? t('promo_btn_create_batch') : 'Tạo Quy tắc mới'}
            </Button>
        </Space>
    );

    return (
        <>
            <Card
                title={t('promo_coupons_title')}
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                extra={getExtraButton()}
            >
                <Tabs
                    defaultActiveKey="coupons"
                    size="large"
                    onChange={setActiveSubTab}
                    items={[
                        {
                            key: 'coupons',
                            label: <Space><TagOutlined /> Mã Coupon ({coupons.length})</Space>,
                            children: <CouponsTableLogic t={t} coupons={coupons} loading={loading} handleEdit={handleEdit} handleDelete={handleDelete} />,
                        },
                        {
                            key: 'shipping',
                            label: <Space><CarOutlined /> Giảm Phí Ship ({rules.length})</Space>,
                            children: <ShippingTableLogic t={t} rules={rules} loading={loading} handleEdit={handleEdit} handleDelete={handleDelete} />,
                        },
                    ]}
                />
            </Card>

            {/* Modal dùng chung cho cả Coupon và Shipping Rule */}
            <Modal
                title={editingRecord ? `Chỉnh sửa ${editingType === 'coupon' ? 'Mã giảm giá' : 'Quy tắc Ship'}` : `Tạo ${editingType === 'coupon' ? 'Mã giảm giá mới' : 'Quy tắc Ship mới'}`}
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setEditingRecord(null); setEditingType(null); form.resetFields(); }}
                footer={null}
                width={editingType === 'shipping' ? 600 : 700} // Thay đổi kích thước modal nếu là Shipping
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    {editingType === 'coupon' ? (
                        <>
                            {/* Form Fields cho Coupon */}
                            <Form.Item label={t('promo_label_coupon_code')} name="code" rules={[{ required: true, message: "Vui lòng nhập mã coupon!" }]}>
                                <Input disabled={!!editingRecord} placeholder="Ví dụ: SALE10" /> 
                            </Form.Item>
                            <Form.Item label={t('promo_label_value')} name="value" rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}>
                                <Input type="text" placeholder="Ví dụ: 10% hoặc 50000 VNĐ" />
                            </Form.Item>
                            <Form.Item label={t('promo_label_limit')} name="limit" rules={[{ required: true, message: "Vui lòng nhập giới hạn sử dụng!" }]}>
                                <Input type="number" placeholder="Số lượng tối đa có thể sử dụng (Ví dụ: 1000)" />
                            </Form.Item>
                            <Form.Item label={t('promo_label_expiry')} name="expiry" rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn!" }]}>
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD"/>
                            </Form.Item>
                            {!editingRecord && (
                                <Form.Item label={t('promo_label_batch_count')} name="count" rules={[{ required: true, message: "Vui lòng nhập số lượng tạo!" }]} initialValue={1}>
                                    <Input type="number" min={1} />
                                </Form.Item>
                            )}
                        </>
                    ) : editingType === 'shipping' ? (
                        <>
                            {/* Form Fields cho Shipping Rule */}
                            <Form.Item label="Tên Quy tắc" name="ruleName" rules={[{ required: true }]}>
                                <Input placeholder="Ví dụ: Miễn phí Ship cho đơn hàng lớn" />
                            </Form.Item>
                            <Form.Item label="Giá trị Đơn hàng Tối thiểu (VNĐ)" name="minOrderValue" rules={[{ required: true }]}>
                                <Input type="number" min={0} />
                            </Form.Item>
                            <Form.Item label="Loại Giảm giá" name="discountType" rules={[{ required: true }]}>
                                <Select placeholder="Chọn loại giảm giá">
                                    <Select.Option value="FREE">Miễn phí Ship (Freeship)</Select.Option>
                                    <Select.Option value="FIXED">Giảm giá cố định (Số tiền)</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item 
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.discountType !== currentValues.discountType}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('discountType') === 'FIXED' ? (
                                        <Form.Item label="Giá trị giảm (VNĐ)" name="discountValue" rules={[{ required: true }]}>
                                            <Input type="number" min={1000} />
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>
                            <Form.Item label="Mô tả" name="description">
                                <Input.TextArea rows={2} />
                            </Form.Item>
                            <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked" initialValue={true}>
                                <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tạm dừng" />
                            </Form.Item>
                        </>
                    ) : null}
                    
                    <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button onClick={() => { setIsModalVisible(false); setEditingRecord(null); setEditingType(null); form.resetFields(); }}>{t('cancel')}</Button>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginLeft: 8 }}>
                            {editingRecord ? t('promo_btn_save_changes') : t('promo_btn_create_coupon')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// --- 2.5. Khách hàng Thân thiết (Loyalty Program) ---

const LoyaltyManagement = () => {
    const { t, i18n } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loyaltyTiers = [
        { name: t('promo_loyalty_tier_silver'), color: 'silver', level: 'silver', level_vi: 'Bạc', minSpent: 0, maxSpent: 10000000, benefit: t('promo_loyalty_silver_benefit') },
        { name: t('promo_loyalty_tier_gold'), color: 'gold', level: 'gold', level_vi: 'Vàng', minSpent: 10000001, maxSpent: 50000000, benefit: t('promo_loyalty_gold_benefit') },
        { name: t('promo_loyalty_tier_diamond'), color: 'blue', level: 'diamond', level_vi: 'Kim Cương', minSpent: 50000001, maxSpent: Infinity, benefit: t('promo_loyalty_diamond_benefit') },
    ];

    // Tính level dựa trên tổng chi tiêu
    const calculateLevel = (totalSpent) => {
        if (totalSpent >= 50000001) return { level: 'diamond', level_vi: 'Kim Cương' };
        if (totalSpent >= 10000001) return { level: 'gold', level_vi: 'Vàng' };
        return { level: 'silver', level_vi: 'Bạc' };
    };

    // Tính điểm tích lũy (1 điểm = 20.000 VNĐ chi tiêu)
    const calculatePoints = (totalSpent) => {
        return Math.floor(totalSpent / 20000);
    };

    useEffect(() => {
        const loadCustomersFromOrders = () => {
            setLoading(true);
            try {
                const orders = getStoredOrders();
                const customerMap = new Map();

                orders.forEach(order => {
                    const customer = order.customer || {};
                    const identifier = customer.email || customer.name || customer.phone;
                    
                    if (!identifier) return;

                    if (!customerMap.has(identifier)) {
                        customerMap.set(identifier, {
                            key: identifier,
                            name: customer.name || customer.email || 'Khách hàng',
                            email: customer.email || '',
                            phone: customer.phone || '',
                            totalSpent: 0,
                            orderCount: 0,
                        });
                    }

                    const c = customerMap.get(identifier);
                    c.totalSpent += order.totals?.total || order.totals?.subtotal || 0;
                    c.orderCount += 1;
                });

                // Chuyển đổi sang mảng và thêm level, points
                const customersArray = Array.from(customerMap.values())
                    .map(c => {
                        const levelInfo = calculateLevel(c.totalSpent);
                        return {
                            ...c,
                            ...levelInfo,
                            points: calculatePoints(c.totalSpent),
                        };
                    })
                    .sort((a, b) => b.totalSpent - a.totalSpent); // Sắp xếp theo chi tiêu

                setCustomers(customersArray);
            } catch (error) {
                console.error('Error loading customers:', error);
                setCustomers([]);
            }
            setLoading(false);
        };

        loadCustomersFromOrders();

        // Lắng nghe sự kiện cập nhật orders
        const handleOrdersUpdated = () => loadCustomersFromOrders();
        window.addEventListener('orders_updated', handleOrdersUpdated);
        window.addEventListener('storage', (e) => {
            if (e.key === 'app_orders_v1') {
                loadCustomersFromOrders();
            }
        });

        return () => {
            window.removeEventListener('orders_updated', handleOrdersUpdated);
        };
    }, []);

    const getTierBorderStyle = (level) => {
        switch(level) {
            case 'silver':
                return { border: '3px solid #c0c0c0', borderRadius: '8px' };
            case 'gold':
                return { border: '3px solid #ffc069', borderRadius: '8px' };
            case 'diamond':
                return { border: '3px solid #1890ff', borderRadius: '8px' };
            default:
                return {};
        }
    };

    const columns = [
        { title: t('promo_col_customer'), dataIndex: 'name', key: 'name' },
        {
            title: t('promo_col_level'),
            dataIndex: 'level',
            key: 'level',
            render: (level) => {
                const color = level === 'gold' ? 'gold' : level === 'silver' ? 'default' : 'blue';
                // Sử dụng key dịch cho các cấp độ
                const displayName = t(`promo_loyalty_tier_${level}`);
                return <Tag color={color}>{displayName}</Tag>
            }
        },
        {
            title: t('promo_col_total_spent'),
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            render: (amount) => formatLoyaltyCurrency(amount, i18n, t)
        },
        { title: t('promo_col_current_points'), dataIndex: 'points', key: 'points', sorter: (a, b) => a.points - b.points },
        { title: t('promo_col_actions'), key: 'action', render: () => (
            <Button type="link" icon={<SettingOutlined />}>{t('promo_btn_manage_points')}</Button>
        )},
    ];

    const width = useWindowWidth();
    const isMobile = width < 768;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={t('promo_card_loyalty_config')}>
                <List
                    grid={{ gutter: 16, column: isMobile ? 1 : 3 }}
                    dataSource={loyaltyTiers}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                title={t(`promo_loyalty_tier_${item.level}`)}
                                headStyle={{ color: item.color === 'gold' ? 'orange' : item.color, fontWeight: 'bold' }}
                                style={getTierBorderStyle(item.level)}
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label={t('promo_label_spending_threshold')}>
                                        {`${formatLoyaltyCurrency(item.minSpent, i18n, t)} - ${item.maxSpent === Infinity ? t('promo_loyalty_unlimited') : formatLoyaltyCurrency(item.maxSpent, i18n, t)}`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t('promo_label_benefits')}>{item.benefit}</Descriptions.Item>
                                </Descriptions>
                                <Divider style={{ margin: '12px 0' }} />
                                <Slider
                                    range
                                    step={1000000}
                                    defaultValue={[item.minSpent / 1000000, item.maxSpent === Infinity ? 100 : item.maxSpent / 1000000]}
                                    max={100}
                                    disabled
                                    tooltip={{ formatter: (value) => `${formatLoyaltyCurrency(value * 1000000, i18n, t)}` }}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
            <Card title={t('promo_card_member_list')}>
                <Table 
                    columns={columns} 
                    dataSource={customers} 
                    rowKey="key" 
                    pagination={{ pageSize: 5 }} 
                    loading={loading}
                    locale={{ emptyText: t('promo_no_customers_yet') || 'Chưa có khách hàng nào' }}
                />
            </Card>
        </Space>
    );
};

// ======================================================================
// 3. Component Chính: PromotionPage (Component Export)
// ======================================================================

const PromotionPage = () => {
    const { t } = useTranslation();
    
    const promotionItems = [
        {
            key: 'campaigns',
            label: <Space><GiftOutlined /> {t('promo_tab_campaigns')}</Space>,
            children: <CampaignsManagement />,
        },
        { // Tab Mã giảm giá lớn chứa cả Coupons và Shipping Rules
            key: 'coupons',
            label: <Space><TagOutlined /> Mã giảm giá (Coupons)</Space>,
            children: <CouponsManagement />,
        },
        {
            key: 'loyalty',
            label: <Space><CrownOutlined /> {t('promo_tab_loyalty')}</Space>,
            children: <LoyaltyManagement />,
        },
    ];

    return (
        <Layout style={{ padding: 24 }}>
            <style>
                {`
                /* CSS TÙY CHỈNH CHUNG */
                @keyframes promotion-blink {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                @keyframes title-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }

                .promotion-alert-icon {
                    color: #ff4d4f;
                    font-size: 28px;
                    margin-left: 8px;
                    animation: promotion-blink 1.5s infinite alternate;
                    vertical-align: middle;
                }
                .promotion-title {
                    animation: title-bounce 1s infinite alternate;
                    display: inline-block;
                    margin-bottom: 0 !important;
                }
                /* smaller title and icon hidden on mobile for better layout */
                @media (max-width: 576px) {
                    .promotion-title { font-size: 18px !important; font-weight: 700; }
                    .promotion-alert-icon { display: none !important; }
                    .promotion-card-title { font-size: 14px !important; }
                    .ant-card .ant-card-meta-title { font-size: 14px !important; }
                    .ant-card .ant-card-meta-description { font-size: 12px !important; }
                }

                /* Tabs: use horizontal scrolling nav on small screens */
                .ant-tabs-nav-list { gap: 8px; }
                .ant-tabs-nav-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .ant-tabs-tab {
                    min-width: 72px;
                    padding: 6px 10px;
                    border-radius: 10px;
                }

                /* Adjust card and table spacing */
                .ant-card { margin-bottom: 12px; }
                .ant-table-wrapper { width: 100%; }
                
                /* CSS TÙY CHỈNH CHO BẢNG (áp dụng cho tất cả bảng) */
                .professional-coupon-table .ant-table-thead > tr > th {
                    background-color: #f0f2f5 !important; 
                    color: #434343 !important; 
                    font-weight: 700 !important; 
                    border-bottom: 2px solid #e8e8e8; 
                }
                .professional-coupon-table .ant-table-thead th:last-child {
                    text-align: center !important;
                }
                .professional-coupon-table .ant-table-tbody td:last-child {
                    text-align: center !important;
                }
                .professional-coupon-table {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                /* Make the table responsive: allow horizontal scroll but keep neat visual */
                .professional-coupon-table .ant-table {
                    min-width: 560px; /* allow comfortable mobile view but still can scroll */
                }
                /* Mobile card used when we switch to List view */
                .promo-card-mobile {
                    border-radius: 10px;
                    padding: 10px;
                    box-shadow: 0 6px 16px rgba(15, 23, 36, 0.06);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid rgba(0,0,0,0.04);
                }
                .promo-card-mobile:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(15, 23, 36, 0.08); }
                @media (max-width: 768px) {
                    .PageContent .ant-card { margin: 0 8px; }
                    .promo-card-mobile { padding: 10px; }
                }
                `}
            </style>

            <Space align="center" style={{ marginBottom: 16 }}>
                <Title level={3} className="promotion-title" style={{color:"#e12828"}}>{t("promo_title")}</Title>
                <FireOutlined className="promotion-alert-icon" />
            </Space>

            <Content
                style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    background: '#fff',
                    borderRadius: 8,
                }}
            >
                <Tabs
                    defaultActiveKey="coupons" 
                    size="large"
                    items={promotionItems}
                />
            </Content>
        </Layout>
    );
};

export default PromotionPage;