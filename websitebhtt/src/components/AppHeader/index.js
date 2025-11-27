import {
    BellOutlined,
    MailOutlined,
    UserOutlined,
    EditOutlined,
    LogoutOutlined,
    SearchOutlined,    
    ShoppingCartOutlined,
    BulbOutlined,
    SettingOutlined,    
    CloseOutlined,
    MenuOutlined,
    MoreOutlined,
    PhoneOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Drawer,
    List,
    Space,
    Typography, 
    Input,
    Button,
    Avatar,
    Form,
    Modal,
    message,
    Popover,
    Flex,
    AutoComplete,
    Switch,
    Divider,
    Select,
    Rate, 
    Empty, 
    Descriptions,
    Tooltip,
} from "antd";
// ✅ SỬA LỖI WARNING: Xóa 'useContext' vì không dùng
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import { useAuth } from "../../context/AuthContext";

// ✅ THÊM: Import context để có thể trả lời đánh giá
import { useOrderHistory } from "../../context/OrderHistoryContext";

// =================================================================
// --- MOCK API DATA (Giữ lại getOrders) ---
// =================================================================

const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';
const NOTIFICATIONS_KEY = 'app_order_notifications_v1';

const mockSearchData = [
    // Thêm trường dịch cho dữ liệu mock
    { type: "keyword", label_vi: "Áo", label_en: "Shirt", value: "Áo", count: 120 },
    {
        type: "product",
        label_vi: "Áo Guci",
        label_en: "Gucci Shirt",
        value: "Áo Guci",
        price: "1.200.000 VNĐ",
        price_en: "$52.00",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTGDgEMu7ST1RvBPSE4njZHX_ikMLy34RWNg&s",
    },
    {
        type: "keyword",
        label_vi: "Túi xách nữ cao cấp",
        label_en: "Premium Handbag",
        value: "Túi xách nữ cao cấp",
        count: 45,
    },
    {
        type: "product",
        label_vi: "Túi xách rách",
        label_en: "Distressed Bag",
        value: "Túi xách rách",
        price: "450.000 VNĐ",
        price_en: "$20.00",
        img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTL5ZhH3_MIKtBqKLxMkXYyIrq5USZR5JO--tMllPP3FPIqkBazD7VYRS_zFr55d2koMQ2Ksjn_Qb2OB4WweThTgPrM0wPJrPJBFY5irjcXsOwQqLuhg3-xn7m0gK3ka4PhzopKisiONCgZ&usqp=CAc",
    },
];

// =================================================================
// --- MAIN COMPONENT: APPHEADER ---
// =================================================================

// 👈 Thêm Typography.Text và Typography.Paragraph
const { Text, Paragraph } = Typography; const { TextArea } = Input;

function AppHeader({ toggleSideMenu, isDarkMode, onToggleDarkMode }) { 
    
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [comments, setComments] = useState([]); // 👈 State này bây giờ sẽ chứa ĐÁNH GIÁ
    const [orderNotifications, setOrderNotifications] = useState([]); // ⭐ STATE MỚI CHO THÔNG BÁO ĐƠN HÀNG
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [notificationsOpen, setNotifications] = useState(false); // Đổi tên để tránh conflict
    const [adminOpen, setAdminOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [systemSettings, setSystemSettings] = useState({
        notifications: true,
        autoUpdate: false,
    });
    
    // ✅ THÊM: State cho modal trả lời đánh giá
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    // const [replyContent, setReplyContent] = useState(""); // <-- ĐÃ XÓA (ĐÚNG)
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [formReply] = Form.useForm();

    const PRIMARY_COLOR = "#1677ff";
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // State cho avatar admin
    const [adminAvatar, setAdminAvatar] = useState(
        localStorage.getItem('adminAvatar') || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"
    );
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // ✅ (MỚI) Hàm tải đánh giá thật từ localStorage
    const loadAdminReviews = useCallback(() => {
        try {
            const storedReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
            const reviews = storedReviews ? JSON.parse(storedReviews) : [];
            setComments(reviews); 
            console.log("Admin Header: Đã tải đánh giá", reviews);
        } catch (e) {
            console.error("Lỗi khi tải đánh giá cho admin:", e);
            setComments([]);
        }
    }, []); // Không có dependency, chỉ định nghĩa hàm

    // ⭐ HÀM MỚI: Tải thông báo đơn hàng từ localStorage
    const loadOrderNotifications = useCallback(() => {
        try {
            const stored = localStorage.getItem(NOTIFICATIONS_KEY);
            const notifications = stored ? JSON.parse(stored) : [];
            // Chỉ lấy 20 thông báo gần nhất để tránh quá tải
            setOrderNotifications(notifications.slice(0, 20));
        } catch (e) {
            console.error("Lỗi khi tải thông báo đơn hàng:", e);
            setOrderNotifications([]);
        }
    }, []);

    // ⭐ HÀM MỚI: Xóa một thông báo khỏi danh sách chuông
    const handleDeleteNotification = (notificationId, event) => {
        event.stopPropagation(); // Ngăn không cho sự kiện click vào List.Item chạy

        try {
            const stored = localStorage.getItem(NOTIFICATIONS_KEY);
            const notifications = stored ? JSON.parse(stored) : [];
            const updatedNotifications = notifications.filter(n => n.id !== notificationId);

            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
            setOrderNotifications(updatedNotifications); // Cập nhật UI ngay lập tức
            message.info("Đã ẩn thông báo.");
        } catch (e) {
            console.error("Lỗi khi xóa thông báo:", e);
            message.error("Không thể ẩn thông báo.");
        }
    };
    // ✅ (QUAN TRỌNG) Lấy hàm trả lời và currentUser từ context
    const { addAdminReply, deleteReview } = useOrderHistory();
    const { currentUser } = useAuth(); // <--- ĐẢM BẢO DÒNG NÀY ĐÚNG
    

    useEffect(() => {
        // ✅ (MỚI) Tải đánh giá thật khi component mount
        loadAdminReviews(); 
        loadOrderNotifications(); // ⭐ Tải thông báo đơn hàng
    }, [i18n.language, loadAdminReviews, loadOrderNotifications]); // Thêm loadAdminReviews

// ✅ THÊM ĐOẠN MỚI NÀY (Đồng bộ 2 tab)
    useEffect(() => {
        const handleStorageUpdate = (event) => {
            // Chỉ chạy khi 'app_reviews_v1' bị thay đổi ở tab khác
            if (event.key === GLOBAL_REVIEWS_KEY) { 
                console.log("Admin Header: Nhận được tín hiệu 'storage' (cross-tab), tải lại đánh giá...");
                loadAdminReviews();
            }
            // ⭐ THÊM: Lắng nghe sự kiện cập nhật đơn hàng
            if (event.key === NOTIFICATIONS_KEY || event.type === 'orders_updated') {
                console.log("Admin Header: Nhận được tín hiệu 'orders_updated', tải lại thông báo...");
                loadOrderNotifications();
            }
        };

        // Lắng nghe sự kiện 'storage' (hoạt động cross-tab)
        window.addEventListener('storage', handleStorageUpdate);
        window.addEventListener('orders_updated', handleStorageUpdate); // ⭐ Lắng nghe sự kiện tùy chỉnh

        // Dọn dẹp
        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener('orders_updated', handleStorageUpdate);
        };
    }, [loadAdminReviews, loadOrderNotifications]); // Phụ thuộc vào hàm loadAdminReviews

    const handleChangeLanguage = useCallback(
        (newLang) => {
            localStorage.setItem("appLanguage", newLang);
            i18n.changeLanguage(newLang);
        },
        [i18n]
    );

    const handleSaveSettings = useCallback(() => {
        message.success(t("setting_saved_success"));
        setSettingsOpen(false);
    }, [t]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("adminLogin");
        message.success(t("logout_success")); 
        setAdminOpen(false);
        navigate("/");
    }, [t, navigate]);

    // Hàm xử lý upload avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn file ảnh!');
            return;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            message.error('Ảnh không được vượt quá 5MB!');
            return;
        }

        setIsUploadingAvatar(true);

        // Đọc file và chuyển thành base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setAdminAvatar(base64String);
            localStorage.setItem('adminAvatar', base64String);
            setIsUploadingAvatar(false);
            message.success('Cập nhật ảnh đại diện thành công!');
        };
        reader.onerror = () => {
            setIsUploadingAvatar(false);
            message.error('Lỗi khi tải ảnh lên!');
        };
        reader.readAsDataURL(file);
    };

    const onSearch = useCallback(
        (value) => {
            if (value) {
                message.info(t("searching_for", { term: value }));
            }
        },
        [t]
    );

    const handleToggleDarkMode = useCallback(() => {
        const newDarkMode = !isDarkMode; 
        onToggleDarkMode(newDarkMode); 
        message.info(
            t("dark_mode_status", {
                status: newDarkMode ? t("switch_to_dark") : t("switch_to_light"),
            })
        );
    }, [isDarkMode, onToggleDarkMode, t]); 

    // ✅ THÊM: Hàm mở modal chi tiết đánh giá
    const handleOpenReviewModal = (review) => {
        setSelectedReview(review);
        setIsReviewModalVisible(true);
        setCommentsOpen(false); // Đóng drawer danh sách
    };

    // ✅ (SỬA LỖI BIÊN DỊCH) Hàm đóng modal
    const handleCloseReviewModal = () => {
        setIsReviewModalVisible(false);
        setSelectedReview(null);
        // setReplyContent(""); // <--- ❌ XÓA DÒNG NÀY (Đây là lỗi compile cũ)
        formReply.resetFields(); // ✅ Chỉ cần dòng này
    };

    // ✅ (SỬA LỖI RUNTIME) Hàm gửi trả lời của admin
    const handleReplySubmit = async (values) => {
        
        // Lấy nội dung từ 'values' do AntD Form cung cấp
        const replyContent = values.replyContent;

        // Kiểm tra
        if (!selectedReview || !replyContent || !replyContent.trim()) {
            message.warning("Vui lòng nhập nội dung trả lời.");
            return; 
        }

        setIsSubmittingReply(true);

        try {
            // ✅ SỬA LỖI RUNTIME:
            // Đảm bảo 'currentUser' (lấy từ useAuth ở dòng 116) 
            // được truyền vào làm đối số thứ 3
            const success = await addAdminReply(
                selectedReview.id,
                replyContent,
                currentUser // <--- Đây là mấu chốt của lỗi F12
            );

            if (success) {
                message.success("Đã gửi câu trả lời thành công!");

                // ✅ Đồng bộ 2 tab
                window.dispatchEvent(new Event('reviews_updated'));

                // Tải lại danh sách đánh giá ngay trên tab admin này
                loadAdminReviews(); 
                handleCloseReviewModal();
                
                // Xóa nội dung form
                // formReply.resetFields(); // Đã gọi trong handleCloseReviewModal

            } else {
                // Lỗi ("Chỉ admin...") đã được 'addAdminReply' xử lý và hiển thị
            }

        } catch (error) {
            // Bắt các lỗi không mong muốn (ví dụ: lỗi mạng)
            console.error("Lỗi nghiêm trọng khi gửi trả lời:", error);
            message.error("Đã xảy ra lỗi hệ thống khi gửi trả lời.");

        } finally {
            // Luôn tắt loading dù thành công hay thất bại
            setIsSubmittingReply(false);
        }
    };

    // ⭐ HÀM MỚI: Xử lý xóa đánh giá
    const handleDeleteReview = (reviewId, event) => {
        event.stopPropagation(); // Ngăn không cho modal chi tiết mở ra

        Modal.confirm({
            title: 'Xác nhận xóa đánh giá',
            content: 'Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                const success = await deleteReview(reviewId);
                if (success) {
                    message.success('Đã xóa đánh giá thành công.');
                    loadAdminReviews(); // Tải lại danh sách ngay lập tức
                } else {
                    message.error('Không thể xóa đánh giá. Vui lòng thử lại.');
                }
            },
        });
    };
    // =================================================================
    // 🔍 LOGIC RENDER ITEM & SEARCH OPTIONS
    // =================================================================

    const renderItem = useCallback((item) => {
        const label =
            i18n.language === "en" ? item.label_en || item.label : item.label_vi || item.label;
        const price =
            i18n.language === "en" ? item.price_en || item.price : item.price;

        if (item.type === "product") {
            return {
                value: item.value,
                label: (
                    <Flex justify="space-between" align="center" style={{ padding: "4px 0" }}>
                        <Flex gap={10} align="center">
                            <Avatar size={40} src={item.img} />
                            <div>
                                <Typography.Text strong>{label}</Typography.Text>
                                <Typography.Paragraph
                                    style={{ margin: 0, fontSize: 12, color: "#f00" }}
                                >
                                    {price}
                                </Typography.Paragraph>
                            </div>
                        </Flex>
                        <SearchOutlined style={{ color: "#ccc" }} />
                    </Flex>
                ),
            };
        }
        return {
            value: item.value,
            label: (
                <Flex justify="space-between" align="center" style={{ padding: "4px 0" }}>
                    <Typography.Text>
                        <SearchOutlined style={{ marginRight: 8, color: "#999" }} />
                        {label}
                    </Typography.Text>
                    {item.count && (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            ({item.count} {t("search_results")})
                        </Typography.Text>
                    )}
                </Flex>
            ),
        };
    }, [i18n.language, t]); 

    const currentSearchOptions = useMemo(() => mockSearchData.map(renderItem), [renderItem]); 
    
    const handleIconHover = useCallback((e, isEntering, iconColor = "#555") => {
        const target = e.currentTarget;
        const icon = target.querySelector(".anticon");
        if (isEntering) {
            target.style.backgroundColor = PRIMARY_COLOR;
            if (icon) icon.style.color = "white";
        } else {
            target.style.backgroundColor = isDarkMode ? '#1e1e1e' : "#f5f5f5"; 
            if (icon) icon.style.color = iconColor;
        }
    }, [isDarkMode, PRIMARY_COLOR]); 

    // =================================================================
    // 🧑‍💼 ADMIN POPOVER CONTENT (Không thay đổi)
    // =================================================================
    const adminPopoverContent = useMemo(
        () => (
            <div style={{ width: 250 }}>
                <Flex
                    gap={10}
                    align="center"
                    style={{
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                        marginBottom: 10,
                    }}
                >
                    <Avatar
                        size={48}
                        src={adminAvatar}
                    />
                    <div>
                        <Typography.Text strong>Doãn Bá Min</Typography.Text>
                        <Typography.Paragraph
                            type="secondary"
                            style={{ margin: 0, fontSize: 12 }}
                        >
                            admin@lmcompany.com
                        </Typography.Paragraph>
                    </div>
                </Flex>

                <List size="small" style={{ cursor: "pointer" }}>
                    <List.Item onClick={() => setAdminOpen(true)}>
                        <UserOutlined style={{ marginRight: 8 }} /> {t("personal_info")}
                    </List.Item>
                    <List.Item onClick={() => setSettingsOpen(true)}>
                        <SettingOutlined style={{ marginRight: 8 }} /> {t("system_settings")}
                    </List.Item>
                    <List.Item onClick={handleLogout} style={{ color: "red" }}>
                        <LogoutOutlined style={{ marginRight: 8 }} /> {t("logout")}
                    </List.Item>
                </List>
            </div>
        ),
        [t, handleLogout, adminAvatar]
    );

    // =================================================================
    // 🧱 RENDER UI (Không thay đổi)
    // =================================================================
    return (
        <div
            className="AppHeader header-visible"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: isDarkMode ? '#1e1e1e' : "#fff", // 👈 Áp dụng Dark Mode
                padding: "10px 25px",
            }}
        >
            {/* MENU TOGGLE (MOBILE) */}
            <div className="header-left">
                <Button
                    className="header-menu-toggle"
                    type="default"
                    shape="circle"
                    icon={<MenuOutlined />}
                    onClick={() => toggleSideMenu && toggleSideMenu()}
                />
                {/* LOGO */}
                <Flex
                    align="center"
                    gap={10}
                    style={{ cursor: "pointer", marginLeft: 8 }}
                    onClick={() => navigate("/dashboard")}
                >
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        <img
                            src="https://i.imgur.com/WadTB6X.png" 
                            alt="Logo"
                            style={{ height: 40, objectFit: "contain" }}
                        />
                    </Typography.Title>
                </Flex>
            </div>

            {/* SEARCH (wrap for responsive hide/show) */}
            <div className="header-center-search" style={{ flex: '1 1 auto' }}>
            <AutoComplete
                dropdownMatchSelectWidth={true}
                options={currentSearchOptions}
                style={{ 
                    width: '100%',
                    maxWidth: 450,
                    marginRight: 48,
                    flex: '1 1 auto'
                }} 
                onSelect={onSearch}
            >
                <Input
                    prefix={<SearchOutlined style={{ color: isDarkMode ? '#888' : "#aaa" }} />}
                    placeholder={t("search_placeholder")}
                    allowClear
                    onPressEnter={(e) => onSearch(e.target.value)}
                    style={{ 
                        borderRadius: 8, 
                        height: 40,
                        backgroundColor: isDarkMode ? '#333' : '#fff', 
                        color: isDarkMode ? '#fff' : '#000', 
                        borderColor: isDarkMode ? '#444' : '#d9d9d9', 
                    }}
                />
            </AutoComplete>
            </div>

            {/* ICONS & LANGUAGE SELECTOR */}
            <Space size={16} align="center"> 
                <Select
                    className="header-hide-on-mobile"
                    value={i18n.language}
                    onChange={handleChangeLanguage}
                    style={{ 
                        width: 140, 
                        height: 40, 
                        lineHeight: '40px', 
                        verticalAlign: 'middle', 
                        backgroundColor: isDarkMode ? '#333' : 'transparent', 
                        color: isDarkMode ? '#fff' : '#000', 
                    }} 
                    bordered={false}
                    dropdownStyle={{ minWidth: 150 }}
                    optionLabelProp="label"
                    options={[
                        {
                            value: "vi",
                            label: (
                                <Flex align="center" gap={8}> 
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                                        alt="Vietnamese Flag"
                                        style={{ width: 20, height: 15, borderRadius: 2 }}
                                    />
                                    {t("vietnamese_language")}
                                </Flex>
                            ),
                        },
                        {
                            value: "en",
                            label: (
                                <Flex align="center" gap={8}> 
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
                                        alt="English Flag"
                                        style={{ width: 20, height: 15, borderRadius: 2 }}
                                    />
                                    {t("english_language")}
                                </Flex>
                            ),
                        },
                    ]}
                />

                <Button
                    className="header-hide-on-mobile"
                    type="default"
                    shape="circle"
                    icon={
                        <BulbOutlined
                            style={{
                                fontSize: 22,
                                color: isDarkMode ? "#ffc53d" : "#FFD700", 
                                filter: isDarkMode ? "drop-shadow(0 0 4px #ffc53d)" : "drop-shadow(0 0 4px #FFD700)",
                            }}
                        />
                    }
                    onClick={handleToggleDarkMode} 
                    style={{
                        backgroundColor: isDarkMode ? "#3e3e1e" : "#fff7e6", 
                        borderColor: "transparent",
                        boxShadow: isDarkMode ? "0 0 6px rgba(255, 197, 61, 0.4)" : "0 0 6px rgba(255, 215, 0, 0.4)",
                        width: 40, 
                        height: 40,
                    }}
                    onMouseEnter={(e) => handleIconHover(e, true, isDarkMode ? "#ffc53d" : "#FFD700")}
                    onMouseLeave={(e) => handleIconHover(e, false, isDarkMode ? "#ffc53d" : "#FFD700")}
                />

                <Badge className="header-hide-on-mobile" count={comments.length}> 
                    <Button
                        type="default"
                        shape="circle"
                        icon={<MailOutlined style={{ fontSize: 20, color: isDarkMode ? '#ccc' : "#555" }} />}
                        onClick={() => setCommentsOpen(true)}
                        style={{ 
                            backgroundColor: isDarkMode ? '#333' : "#f5f5f5", 
                            borderColor: "transparent",
                            width: 40, 
                            height: 40,
                        }}
                        onMouseEnter={(e) => handleIconHover(e, true)}
                        onMouseLeave={(e) => handleIconHover(e, false)}
                    />
                </Badge>

                <Badge className="header-hide-on-mobile" count={orderNotifications.length}>
                    <Button
                        type="default"
                        shape="circle"
                        icon={<BellOutlined style={{ fontSize: 20, color: isDarkMode ? '#ccc' : "#555" }} />}
                        onClick={() => setNotifications(true)}
                        style={{ 
                            backgroundColor: isDarkMode ? '#333' : "#f5f5f5", 
                            borderColor: "transparent",
                            width: 40, 
                            height: 40,
                        }}
                        onMouseEnter={(e) => handleIconHover(e, true)}
                        onMouseLeave={(e) => handleIconHover(e, false)}
                    />
                </Badge>

                <Popover placement="bottomRight" content={adminPopoverContent} trigger="click">
                    <Space className="header-avatar"
                        style={{
                            cursor: "pointer",
                            padding: "4px 4px",
                            background: isDarkMode ? '#333' : "#f5f7fa", 
                            borderRadius: 25,
                            transition: "all 0.2s ease",
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 40, 
                            width: 40,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isDarkMode ? "#444" : "#e6f4ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isDarkMode ? "#333" : "#f5f7fa")}
                    >
                        <Avatar
                            src={adminAvatar}
                            size="default" 
                            icon={<UserOutlined />}
                        />
                    </Space>
                </Popover>
                <Button
                    className="header-more-toggle"
                    type="default"
                    shape="circle"
                    icon={<MoreOutlined />}
                    onClick={() => setIsMoreOpen(true)}
                />
                <Button
                    className="header-search-toggle"
                    type="default"
                    shape="circle"
                    icon={<SearchOutlined />}
                    onClick={() => setIsSearchOpen(true)}
                />
            </Space>

            {/* ========================================================== */}
            {/* ⭐️ DRAWER ĐÁNH GIÁ (MAIL) ĐÃ ĐƯỢC CẬP NHẬT ⭐️ */}
            {/* ========================================================== */}
            <Drawer
                title={`${t("new_review")} (${comments.length})`}
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                mask={false}
                maskClosable={false}
                width={400} 
                style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }} 
                bodyStyle={{ padding: 0 }}
                zIndex={1000}
            >
                <List 
                    dataSource={comments}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                            color: isDarkMode ? '#ccc' : '#000',
                            borderBottom: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`,
                            padding: '12px 24px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            }}
                            onClick={() => handleOpenReviewModal(item)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f9f9f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            actions={currentUser?.role === 'admin' ? [
                                <Button type="text" danger shape="circle" icon={<CloseOutlined />} onClick={(e) => handleDeleteReview(item.id, e)} />
                            ] : []}
                        >
                            <List.Item.Meta
                                // ⭐ THAY ĐỔI: Ưu tiên avatar thật, nếu không có mới dùng avatar mặc định
                                avatar={
                                    <Avatar 
                                        src={item.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.user || 'User'}`} 
                                    />
                                }
                                title={
                                    <Flex justify="space-between">
                                        <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                            {item.user || t('anonymous_user')}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.date).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Flex>
                                }
                                description={
                                    <div>
                                        <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                                            <Avatar 
                                                shape="square" 
                                                size={32} 
                                                src={item.productImage} 
                                                alt={item.productTitle} 
                                            />
                                            <Text style={{ color: isDarkMode ? '#ccc' : '#000', fontSize: 12 }}>
                                                {t('product')}: <Text strong style={{ color: isDarkMode ? '#eee' : '#000' }}>{item.productTitle}</Text>
                                            </Text>
                                        </Flex>
                                        <div style={{ margin: '8px 0' }}>
                                            <Rate disabled value={item.rating} style={{ fontSize: 16 }} />
                                        </div>
                                        <Paragraph 
                                            style={{ color: isDarkMode ? '#bbb' : '#333', margin: 0 }}
                                            ellipsis={{ rows: 3, expandable: true, symbol: t('see_more') }}
                                        >
                                            {item.comment}
                                        </Paragraph>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: (
                        <div style={{ padding: '20px 0', color: isDarkMode ? '#888' : '#aaa' }}>
                            <Empty description={t('no_new_reviews', { ns: 'translation' })} /> 
                        </div>
                    )}}
                />
            </Drawer>
            {/* DRAWER MORE (MOBILE) - Compact actions for small screens */}
            <Drawer
                title={t('menu')}
                open={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                mask={false}
                maskClosable={false}
                width={320}
                placement="right"
                bodyStyle={{ padding: 12 }}
                zIndex={1000}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Text strong>{t('language')}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Select
                                value={i18n.language}
                                onChange={handleChangeLanguage}
                                style={{ width: '100%' }}
                                bordered
                                getPopupContainer={(trigger) => trigger.parentElement}
                                dropdownStyle={{ zIndex: 1050 }}
                            >
                                <Select.Option value="vi">
                                    <Flex align="center" gap={8}>
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                                            alt="Vietnamese Flag"
                                            style={{ width: 20, height: 15, borderRadius: 2 }}
                                        />
                                        {t('vietnamese_language')}
                                    </Flex>
                                </Select.Option>
                                <Select.Option value="en">
                                    <Flex align="center" gap={8}>
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
                                            alt="English Flag"
                                            style={{ width: 20, height: 15, borderRadius: 2 }}
                                        />
                                        {t('english_language')}
                                    </Flex>
                                </Select.Option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Button block onClick={handleToggleDarkMode} icon={<BulbOutlined />}>
                            {isDarkMode ? t('switch_to_light') : t('switch_to_dark')}
                        </Button>
                    </div>
                    <div>
                        <Button block onClick={() => { setCommentsOpen(true); setIsMoreOpen(false); }}>
                            {t('new_review')} ({comments.length})
                        </Button>
                    </div>
                    <div>
                        <Button block onClick={() => { setNotifications(true); setIsMoreOpen(false); }}>
                            {t('order_notification')} ({orderNotifications.length})
                        </Button>
                    </div>
                </div>
            </Drawer>

            {/* DRAWER SEARCH (MOBILE) */}
            <Drawer
                title={t('search')}
                open={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                mask={false}
                maskClosable={false}
                height={120} /* increase height so input + button not clipped */
                placement="top"
                bodyStyle={{ padding: 12 }}
                zIndex={1000}
            >
                <AutoComplete
                    dropdownMatchSelectWidth={true}
                    options={currentSearchOptions}
                    style={{ width: '100%' }}
                    onSelect={(value)=>{ onSearch(value); setIsSearchOpen(false); }}
                >
                    {/* Use Input.Search to provide a visible search button that's easier to click on mobile */}
                    <Input.Search
                        prefix={<SearchOutlined />}
                        placeholder={t('search_placeholder')}
                        allowClear
                        enterButton
                        onSearch={(value) => { onSearch(value); setIsSearchOpen(false); }}
                        onPressEnter={(e) => { onSearch(e.target.value); setIsSearchOpen(false);} }
                        className="drawer-search"
                        style={{ borderRadius: 8 }}
                    />
                </AutoComplete>
            </Drawer>
            
            {/* DRAWER NOTIFICATIONS (Không thay đổi) */}
            {/* ⭐ DRAWER THÔNG BÁO ĐƠN HÀNG (BELL) - ĐÃ THIẾT KẾ LẠI HOÀN TOÀN ⭐ */}
            <Drawer
                title={`${t("order_notification")} (${orderNotifications.length})`}
                open={notificationsOpen}
                onClose={() => setNotifications(false)}
                mask={false}
                maskClosable={false}
                width={450}
                style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }}
                bodyStyle={{ padding: 0 }}
                zIndex={1000}
            >
                <List
                    dataSource={orderNotifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '16px 24px',
                                borderBottom: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            // ⭐ THÊM: Nút xóa (action)
                            actions={[
                                <Tooltip title="Ẩn thông báo này">
                                    <Button 
                                        type="text" 
                                        shape="circle" 
                                        icon={<CloseOutlined style={{ fontSize: 14 }} />} 
                                        onClick={(e) => handleDeleteNotification(item.id, e)} />
                                </Tooltip>
                            ]}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f9f9f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => navigate(`/admin/orders`)} // Chuyển đến trang quản lý đơn hàng
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={item.details?.userAvatar} icon={<UserOutlined />} size={48} />}
                                title={
                                    <Flex justify="space-between" align="center">
                                        <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                            {item.customerName} <Text type="secondary">vừa đặt hàng</Text>
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </Flex>
                                }
                                description={
                                    <div style={{ marginTop: 8 }}>
                                        <Flex gap={12} align="center">
                                            <Avatar shape="square" size={48} src={item.details?.productImage} icon={<ShoppingCartOutlined />} />
                                            <div>
                                                <Text style={{ color: isDarkMode ? '#ccc' : '#555' }}>{item.details?.productName}</Text>
                                                {item.details?.otherItemsCount > 0 && <Text type="secondary"> và {item.details.otherItemsCount} sản phẩm khác</Text>}
                                                <Text strong style={{ display: 'block', color: '#1677ff', fontSize: 16, marginTop: 4 }}>${item.total?.toFixed(2)}</Text>
                                            </div>
                                        </Flex>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
            {/* MODAL ADMIN PROFILE - REDESIGNED */}
            <Modal
                title={null}
                open={adminOpen}
                onCancel={() => setAdminOpen(false)}
                footer={null}
                centered
                width={600}
                bodyStyle={{ padding: 0 }}
                closeIcon={
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    >
                        <CloseOutlined style={{ fontSize: 14, color: '#fff' }} />
                    </div>
                }
            >
                {/* Header Section with Gradient Background */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px 30px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px 8px 0 0'
                }}>
                    {/* Avatar Section */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <Avatar
                                size={120}
                                src={adminAvatar}
                                icon={<UserOutlined />}
                                style={{
                                    border: '4px solid rgba(255,255,255,0.9)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                    cursor: 'pointer'
                                }}
                            />
                            {/* Upload Button Overlay */}
                            <label
                                htmlFor="avatar-upload"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: '#1677ff',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '3px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.background = '#4096ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.background = '#1677ff';
                                }}
                            >
                                <EditOutlined style={{ color: '#fff', fontSize: 18 }} />
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                                disabled={isUploadingAvatar}
                            />
                        </div>
                        <Typography.Title
                            level={3}
                            style={{
                                marginTop: 16,
                                marginBottom: 4,
                                color: '#fff',
                                fontWeight: 700
                            }}
                        >
                            Doãn Bá Min
                        </Typography.Title>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 16px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 20,
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Typography.Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                                👑 {t("system_admin")}
                            </Typography.Text>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div style={{
                    padding: '30px',
                    background: isDarkMode ? '#1e1e1e' : '#fff'
                }}>
                    <Form layout="vertical">
                        <Flex gap={16} wrap="wrap">
                            <Form.Item
                                label={<Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{t("username")}</Text>}
                                style={{ flex: '1 1 45%', minWidth: 200 }}
                            >
                                <Input
                                    value="admin_lm"
                                    disabled
                                    prefix={<UserOutlined style={{ color: '#999' }} />}
                                    style={{
                                        backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
                                        color: isDarkMode ? '#ccc' : '#000',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>Email</Text>}
                                style={{ flex: '1 1 45%', minWidth: 200 }}
                            >
                                <Input
                                    value="admin@lmcompany.com"
                                    prefix={<MailOutlined style={{ color: '#999' }} />}
                                    style={{
                                        backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                                        color: isDarkMode ? '#fff' : '#000',
                                        borderRadius: 8,
                                        borderColor: isDarkMode ? '#444' : '#d9d9d9'
                                    }}
                                />
                            </Form.Item>
                        </Flex>
                        <Flex gap={16} wrap="wrap">
                            <Form.Item
                                label={<Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{t("phone_number")}</Text>}
                                style={{ flex: '1 1 45%', minWidth: 200 }}
                            >
                                <Input
                                    value="0909 999 999"
                                    prefix={<PhoneOutlined style={{ color: '#999' }} />}
                                    style={{
                                        backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
                                        color: isDarkMode ? '#fff' : '#000',
                                        borderRadius: 8,
                                        borderColor: isDarkMode ? '#444' : '#d9d9d9'
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>{t("role")}</Text>}
                                style={{ flex: '1 1 45%', minWidth: 200 }}
                            >
                                <Input
                                    value={t("system_admin")}
                                    disabled
                                    prefix={<UserOutlined style={{ color: '#999' }} />}
                                    style={{
                                        backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5',
                                        color: isDarkMode ? '#ccc' : '#000',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}
                                />
                            </Form.Item>
                        </Flex>

                        <Divider style={{ margin: '24px 0', borderColor: isDarkMode ? '#444' : '#f0f0f0' }} />

                        {/* Action Buttons */}
                        <Flex gap={12} justify="space-between" wrap="wrap">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="large"
                                style={{
                                    flex: '1 1 auto',
                                    minWidth: 140,
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 44,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none'
                                }}
                            >
                                {t("update_info")}
                            </Button>
                            <Button
                                danger
                                icon={<LogoutOutlined />}
                                size="large"
                                onClick={handleLogout}
                                style={{
                                    flex: '1 1 auto',
                                    minWidth: 140,
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 44
                                }}
                            >
                                {t("logout")}
                            </Button>
                        </Flex>
                    </Form>
                </div>
            </Modal>
            {/* SYSTEM SETTINGS MODAL (Không thay đổi) */}
            <Modal
                title={`⚙️ ${t("system_settings")}`}
                open={settingsOpen}
                onCancel={() => setSettingsOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setSettingsOpen(false)}>
                        {t("cancel")}
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSaveSettings}>
                        {t("save_changes")}
                    </Button>,
                ]}
                centered
                bodyStyle={{ backgroundColor: isDarkMode ? '#2c2c2c' : '#fff' }} 
            >
                <Form layout="vertical">
                    <Form.Item label={t("notifications_mode")} style={{ color: isDarkMode ? '#fff' : '#000' }}>
                        <Switch
                            checked={systemSettings.notifications}
                            onChange={(checked) =>
                                setSystemSettings({ ...systemSettings, notifications: checked })
                            }
                            checkedChildren={t("on")}
                            unCheckedChildren={t("off")}
                        />
                    </Form.Item>
                    <Form.Item label={t("auto_update")} style={{ color: isDarkMode ? '#fff' : '#000' }}>
                        <Switch
                            checked={systemSettings.autoUpdate}
                            onChange={(checked) =>
                                setSystemSettings({ ...systemSettings, autoUpdate: checked })
                            }
                            checkedChildren={t("on")}
                            unCheckedChildren={t("off")}
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item label={t("interface")} style={{ color: isDarkMode ? '#fff' : '#000' }}>
                        <Button
                            type={isDarkMode ? "default" : "primary"}
                            icon={<BulbOutlined />}
                            onClick={handleToggleDarkMode} 
                            style={{
                                width: "100%",
                                background: isDarkMode ? "#333" : "#fff",
                                color: isDarkMode ? "#fff" : "#000",
                                borderColor: isDarkMode ? '#555' : '#1677ff',
                            }}
                        >
                            {isDarkMode ? t("switch_to_light") : t("switch_to_dark")}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ========================================================== */}
            {/* ⭐️ MODAL CHI TIẾT & TRẢ LỜI ĐÁNH GIÁ (ĐÃ CHUẨN) ⭐️ */}
            {/* ========================================================== */}
            {selectedReview && (
                <Modal
                    title={`Chi tiết đánh giá #${selectedReview.id.slice(-6)}`}
                    open={isReviewModalVisible}
                    onCancel={handleCloseReviewModal}
                    width={600}
                    footer={[
                        <Button key="back" onClick={handleCloseReviewModal}>
                            {t('cancel')}
                        </Button>,
                        <Button 
                            key="submit" 
                            type="primary" 
                            loading={isSubmittingReply} 
                            onClick={() => formReply.submit()} // ✅ Đã sửa (gọi submit của form)
                            // ⭐ THAY ĐỔI: Luôn cho phép admin gửi trả lời mới
                        >
                            Gửi trả lời
                        </Button>,
                    ]}
                >
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar size={48} src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedReview.user || 'User'}`} />}
                            title={<Text strong>{selectedReview.user || t('anonymous_user')}</Text>}
                            description={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(selectedReview.date).toLocaleString('vi-VN')}
                                </Text>
                            }
                        />
                    </List.Item>
                    <Divider style={{ margin: '12px 0' }} />
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Sản phẩm">
                            <Flex align="center" gap={8}>
                                <Avatar shape="square" src={selectedReview.productImage} />
                                <Text strong>{selectedReview.productTitle}</Text>
                            </Flex>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                            <Rate disabled value={selectedReview.rating} style={{ fontSize: 16 }} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            {selectedReview.comment}
                        </Descriptions.Item>
                    </Descriptions>
                    <Divider>Phản hồi của Admin</Divider>

                    {/* ⭐ THAY ĐỔI: Hiển thị danh sách các phản hồi cũ */}
                    {Array.isArray(selectedReview.adminReplies) && selectedReview.adminReplies.length > 0 && (
                        <List
                            size="small"
                            dataSource={selectedReview.adminReplies}
                            renderItem={reply => (
                                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                                    <List.Item.Meta
                                        avatar={<Avatar src="https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" />}
                                        title={<Text strong>Doãn Bá Min</Text>}
                                        description={
                                            <>
                                                <Text>{reply.comment}</Text>
                                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>{new Date(reply.date).toLocaleString('vi-VN')}</Text>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                            style={{ marginBottom: 16, background: '#fafafa', padding: '8px 12px', borderRadius: 8 }}
                        />
                    )}

                    {/* ⭐ THAY ĐỔI: Form trả lời luôn hiển thị */}
                    <Form form={formReply} onFinish={handleReplySubmit}>
                        <Form.Item name="replyContent" noStyle>
                            <TextArea
                                rows={4}
                                placeholder={`Nhập câu trả lời mới cho ${selectedReview.user}...`}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </div>
    );
}

export default AppHeader;