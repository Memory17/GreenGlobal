import {
    Avatar,
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Rate,
    Space,
    Table,
    Tag,
    Typography,
    message,
    Select,
    Popconfirm,
    Row,
    Col,
    Card,
    Progress,
    Badge,
    Tooltip,
    Flex,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DatabaseOutlined,
    SearchOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getMergedProducts, saveLocalProduct, updateLocalProduct, removeLocalProduct } from "../../API";

const formatInventoryPrice = (value, i18n) => {
    if (value === undefined || value === null) return '-';
    const isVietnamese = i18n.language === 'vi';
    const currency = isVietnamese ? 'VNĐ' : 'USD';
    const locale = isVietnamese ? 'vi-VN' : 'en-US';
    const displayValue = isVietnamese ? value : value / 23500;
    return `${displayValue.toLocaleString(locale, { minimumFractionDigits: 0 })} ${currency}`;
};

const LOCAL_PRODUCTS_KEY = "local_products";

function persistLocalProductsFromState(list) {
    try {
        const locals = (list || []).filter((p) => p && p._isLocal);
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(locals));
    } catch (e) {
        console.error("Failed to persist local products from state", e);
    }
}

function Inventory() {
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortOption, setSortOption] = useState("none");
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [i18n.language]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const merged = await getMergedProducts();
            setDataSource(merged);
        } catch (e) {
            console.error("Error loading merged products", e);
            setDataSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value?.trim?.() ?? "");
    };

    const handleFilterCategory = (value) => {
        setFilterCategory(value);
    };

    const handleSort = (value) => {
        setSortOption(value);
    };

    const filterLowStock = () => {
        setFilterCategory("low_stock");
    };

    const processedData = useMemo(() => {
        let ds = [...dataSource];
        if (searchText) {
            const q = searchText.toLowerCase();
            ds = ds.filter((p) => {
                const name = (i18n.language === "en" ? p.title_en : p.title) || "";
                return (
                    name.toLowerCase().includes(q) ||
                    (p.brand || "").toLowerCase().includes(q)
                );
            });
        }
        if (filterCategory && filterCategory !== "all") {
            if (filterCategory === "low_stock") {
                ds = ds.filter((p) => p.stock <= 20);
            } else {
                ds = ds.filter((p) => p.category === filterCategory);
            }
        }
        if (sortOption === "price_asc") ds.sort((a, b) => a.price - b.price);
        if (sortOption === "price_desc") ds.sort((a, b) => b.price - a.price);
        if (sortOption === "stock_desc") ds.sort((a, b) => b.stock - a.stock);
        if (sortOption === "stock_asc") ds.sort((a, b) => a.stock - b.stock);
        return ds;
    }, [dataSource, searchText, filterCategory, sortOption, i18n.language]);

    const openModal = (record = null) => {
        setEditingProduct(record);
        if (record) {
            form.setFieldsValue(record);
            setThumbnailPreview(record.thumbnail || "");
        } else {
            form.resetFields();
            setThumbnailPreview("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
        setThumbnailPreview("");
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            if (editingProduct) {
                const updated = { ...editingProduct, ...values };
                updateLocalProduct(updated);
                const updatedList = dataSource.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
                setDataSource(updatedList);
                persistLocalProductsFromState(updatedList);
                message.success(t("inventory_update_success") || "Cập nhật sản phẩm thành công");
            } else {
                const newProduct = {
                    ...values,
                    id: Date.now(),
                    title_en: values.title,
                    _isLocal: true,
                };
                saveLocalProduct(newProduct);
                const newList = [newProduct, ...dataSource];
                setDataSource(newList);
                persistLocalProductsFromState(newList);
                message.success(t("inventory_add_success") || "Thêm sản phẩm thành công");
            }
            closeModal();
        });
    };

    const handleDelete = (id) => {
        removeLocalProduct(id);
        const newList = dataSource.filter((item) => item.id !== id);
        setDataSource(newList);
        persistLocalProductsFromState(newList);
        message.success(t("inventory_delete_success") || "Xóa sản phẩm thành công");
    };

    const calcDiscountPercent = (record) => {
        if (!record.price || !record.discountedPrice) return 0;
        if (record.discountedPrice >= record.price) return 0;
        return Math.round(100 - (record.discountedPrice / record.price) * 100);
    };

    const getStockStatus = (stock) => {
        if (stock > 50) return { color: "success", label: "Kho đủ", percentage: 100 };
        if (stock > 20) return { color: "warning", label: "Cảnh báo", percentage: 60 };
        return { color: "error", label: "Sắp hết", percentage: 30 };
    };

    const columns = [
        {
            title: <PictureOutlined style={{ fontSize: 20, color: "#03501fff" }} />,
            dataIndex: "thumbnail",
            render: (link, record) => (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Badge 
                        count={record._isLocal ? "Mới" : ""} 
                        style={{ backgroundColor: '#5104ecff', boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)" }}
                    >
                        <Avatar
                            src={link}
                            shape="square"
                            size={64}
                            style={{ 
                                borderRadius: 12, 
                                objectFit: "cover",
                                border: "2px solid #f0f0f0",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}
                            icon={!link && <PictureOutlined style={{ fontSize: 28 }} />}
                        />
                    </Badge>
                </div>
            ),
            width: 100,
            align: "center",
        },
        {
            title: t("inventory_col_name") || "Sản phẩm",
            dataIndex: i18n.language === 'en' ? "title_en" : "title",
            width: 200,
            render: (text, record) => (
                <div>
                    <Typography.Text strong style={{ color: "#1f1f1f", fontSize: 14 }}>
                        {text}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {record.brand || "N/A"}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: t("inventory_col_price") || "Giá",
            dataIndex: "price",
            render: (value) => (
                <Typography.Text strong style={{ color: "#ff4d4f", fontSize: 14 }}>
                    {formatInventoryPrice(value, i18n)}
                </Typography.Text>
            ),
            width: 130,
            align: "right",
        },
        {
            title: "Khuyến mãi",
            dataIndex: "discountedPrice",
            render: (discounted, record) => {
                const p = calcDiscountPercent(record);
                if (p > 0) {
                    return (
                        <Tag 
                            color="green" 
                            style={{ 
                                borderRadius: 20, 
                                padding: "4px 12px",
                                fontWeight: 600
                            }}
                        >
                            -<span style={{ marginLeft: 2 }}>{p}%</span>
                        </Tag>
                    );
                }
                return <Tag style={{ borderRadius: 20, padding: "4px 12px" }}>-</Tag>;
            },
            width: 100,
            align: "center",
        },
        {
            title: t("inventory_col_rating") || "Đánh giá",
            dataIndex: "rating",
            render: (rating) => (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Rate value={rating} allowHalf disabled style={{ fontSize: 14 }} />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {rating}/5
                    </Typography.Text>
                </div>
            ),
            width: 140,
        },
        {
            title: t("inventory_col_stock") || "Tồn kho",
            dataIndex: "stock",
            width: 180,
            render: (stock) => {
                const status = getStockStatus(stock);
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                            <Progress 
                                percent={Math.min((stock / 100) * 100, 100)} 
                                strokeColor={
                                    status.color === "success" ? "#52c41a" :
                                    status.color === "warning" ? "#faad14" : "#ff4d4f"
                                }
                                size="small"
                                format={() => stock}
                                style={{ width: "100%" }}
                            />
                        </div>
                        <Tag color={status.color} style={{ borderRadius: 4, minWidth: 60 }}>
                            {stock}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: t("inventory_col_category") || "Danh mục",
            dataIndex: "category",
            width: 130,
            render: (text) => (
                <Tag color="blue" style={{ borderRadius: 4 }}>
                    {t(text) || text}
                </Tag>
            ),
        },
        {
            title: t("inventory_col_actions") || "Hành động",
            key: "actions",
            width: 120,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size={6}>
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            type="text" 
                            size="small"
                            icon={<EyeOutlined />} 
                            onClick={() => openModal(record)}
                            style={{ color: "#667eea" }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="text" 
                            size="small"
                            icon={<EditOutlined />} 
                            onClick={() => openModal(record)}
                            style={{ color: "#1890ff" }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title={t("inventory_confirm_delete") || "Xóa sản phẩm?"}
                            description="Hành động này không thể hoàn tác"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                        >
                            <Button 
                                type="text" 
                                size="small"
                                danger 
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const onRow = (record) => {
        return {
            onMouseEnter: () => setHoveredRow(record.id),
            onMouseLeave: () => setHoveredRow(null),
            style: {
                background: hoveredRow === record.id ? "#fafafa" : undefined,
                transition: "background 0.2s ease",
                cursor: "pointer",
            },
        };
    };

    const totalProducts = processedData.length;
    const totalStock = processedData.reduce((s, p) => s + (p.stock || 0), 0);

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
            {/* Header Card */}
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", padding: "0" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: "linear-gradient(135deg, #ffa500 0%, #ff8c42 100%)",
                    padding: "20px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(255, 133, 66, 0.25)",
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
                        boxShadow: "0 8px 32px rgba(255, 133, 66, 0.37)",
                        position: "relative",
                        zIndex: 2,
                        fontSize: 24,
                    }}>
                        <DatabaseOutlined style={{ color: "#fff" }} />
                    </div>

                    {/* Text container */}
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
                            {t("inventory") || "Quản lý kho"}
                        </div>
                    </div>

                    {/* Badge */}
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
                            📊
                        </div>
                        <div style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: "2px"
                        }}>
                            {totalProducts}
                        </div>
                    </div>
                </div>

                {/* Toolbar Section */}
                <div style={{ padding: "20px 24px" }}>
                    <Row gutter={[12, 12]} align="middle">
                        <Col xs={24} sm={12} md={10} lg={8}>
                            <Input.Search
                                placeholder={t("search_placeholder") || "🔍 Tìm kiếm sản phẩm..."}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                value={searchText}
                                style={{ borderRadius: 8 }}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                style={{ width: "100%", borderRadius: 8 }}
                                value={filterCategory}
                                onChange={handleFilterCategory}
                                suffixIcon={<FilterOutlined />}
                                options={[
                                    { value: "all", label: t("all_categories") || "Tất cả danh mục" },
                                    { value: "clothing", label: t("clothing") || "Quần áo" }, 
                                    { value: "footwear", label: t("footwear") || "Giày dép" },
                                    { value: "electronics", label: t("electronics") || "Điện tử" },
                                    { value: "furniture", label: t("furniture") || "Nội thất" },
                                    { value: "accessories", label: t("accessories") || "Phụ kiện" },
                                    { value: "low_stock", label: t("low_stock") || "Sắp hết hàng" },
                                ]}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Select
                                style={{ width: "100%", borderRadius: 8 }}
                                value={sortOption}
                                onChange={handleSort}
                                suffixIcon={<SortAscendingOutlined />}
                                options={[
                                    { value: "none", label: t("sort_default") || "Mặc định" },
                                    { value: "price_asc", label: t("price_asc") || "Giá tăng" },
                                    { value: "price_desc", label: t("price_desc") || "Giá giảm" },
                                    { value: "stock_desc", label: t("stock_desc") || "Tồn kho cao" },
                                ]}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={24} lg={6} style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => openModal()}
                                style={{
                                    borderRadius: 8,
                                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    border: "none",
                                    fontWeight: 600,
                                    flex: 1
                                }}
                            >
                                {t("inventory_add_product") || "Thêm sản phẩm"}
                            </Button>
                        </Col>

                        <Col span={24} style={{ marginTop: 6 }}>
                            <Flex gap={12}>
                                <Tag color="blue" style={{ padding: "4px 12px", borderRadius: 6 }}>📦 Tổng SP: {totalProducts}</Tag>
                                <Tag color="green" style={{ padding: "4px 12px", borderRadius: 6 }}>📊 Tồn kho: {totalStock}</Tag>
                            </Flex>
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Table */}
            <div style={{ 
                width: "100%", 
                background: "#fff", 
                padding: "0px", 
                borderRadius: "12px", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                overflow: "hidden"
            }}>
                <Table
                    loading={loading}
                    rowKey="id"
                    columns={columns}
                    dataSource={processedData}
                    pagination={{ 
                        position: ["bottomCenter"], 
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                    }}
                    style={{ width: "100%" }}
                    scroll={{ x: "100%" }}
                    onRow={onRow}
                />
            </div>

            {/* Modal */}
            <Modal
                title={editingProduct ? `📝 Cập nhật sản phẩm` : `➕ Thêm sản phẩm`}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText={editingProduct ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                centered
                width={640}
                okButtonProps={{ style: { background: "#667eea" } }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ rating: 4, stock: 50 }}
                    onValuesChange={(changed) => {
                        if (changed.thumbnail !== undefined) setThumbnailPreview(changed.thumbnail || "");
                    }}
                >
                    <Form.Item name="title" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập giá" />
                    </Form.Item>
                    <Form.Item name="discountedPrice" label="Giá khuyến mãi">
                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập giá khuyến mãi (nếu có)" />
                    </Form.Item>
                    <Form.Item name="rating" label="Đánh giá">
                        <Rate allowHalf />
                    </Form.Item>
                    <Form.Item name="stock" label="Tồn kho">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="brand" label="Thương hiệu">
                        <Input placeholder="Nhập thương hiệu" />
                    </Form.Item>
                    <Form.Item name="category" label="Danh mục">
                        <Select
                            placeholder="Chọn danh mục"
                            options={[
                                { value: "electronics", label: "Điện tử" },
                                { value: "clothing", label: "Quần áo" },
                                { value: "footwear", label: "Giày dép" },
                                { value: "furniture", label: "Nội thất" },
                                { value: "accessories", label: "Phụ kiện" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="thumbnail" label="Link ảnh">
                        <Input placeholder="Dán link ảnh sản phẩm" />
                    </Form.Item>

                    {thumbnailPreview ? (
                        <div style={{ marginTop: 8 }}>
                            <Typography.Text strong>Xem trước ảnh</Typography.Text>
                            <div style={{ marginTop: 8 }}>
                                <img src={thumbnailPreview} alt="preview" style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                            </div>
                        </div>
                    ) : null}
                </Form>
            </Modal>
        </Space>
    );
}

export default Inventory;