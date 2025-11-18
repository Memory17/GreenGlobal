// src/pages/CartProducts.js
import "../style/CartProducts.css";
import React, { useState, useEffect, useCallback } from "react";
import cartImg from "../assets/images/cart-icon.png";
import cartGif from "../assets/images/cart.gif";
import { useNavigate } from "react-router-dom";
import {
    Row,
    Col,
    Typography,
    Button,
    Image,
    Badge,
    Checkbox,
    Space,
    Divider,
    Input,
    Empty,
    Rate,
    Modal,
    List,
    Avatar,
    Tag,
    message,
} from "antd";
import {
    TagsOutlined,
    CheckCircleOutlined,
    ShoppingCartOutlined,
    SmileOutlined,
    StarOutlined,
    Loading3QuartersOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    CarOutlined,
} from "@ant-design/icons";
import { useCart } from "../context/CartContext";
import { useOrderHistory } from "../context/OrderHistoryContext";

import { getAllCoupons } from "../data/discountServiceUser.js";
import { getAllShippingDiscounts } from "../data/shippingServiceUser.js";

const { Title, Text } = Typography;
const { TextArea } = Input; // Thêm TextArea

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
        return new Date(isoString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return "Invalid Date";
    }
};

const parseCurrency = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const cleaned = value.replace("$", "").replace(/,/g, ".").trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const CartProducts = () => {
    const navigate = useNavigate();
    const [selectAll, setSelectAll] = useState(false);
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    // Thêm 'addReview' từ context (Giả định context của bạn cung cấp hàm này)
    const { orderHistory, cancelOrder, addReview, removeProductFromOrder } = useOrderHistory();

    const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
    const [activeProductCoupons, setActiveProductCoupons] = useState([]);
    const [loadingProductCoupons, setLoadingProductCoupons] = useState(false);
    const [activeShippingCoupons, setActiveShippingCoupons] = useState([]);
    const [loadingShippingCoupons, setLoadingShippingCoupons] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedShippingRule, setAppliedShippingRule] = useState(null);
    const [shippingDiscountValue, setShippingDiscountValue] = useState(0);

    // --- State cho Modal Đánh giá ---
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [reviewingItem, setReviewingItem] = useState(null); // Sẽ lưu { orderId, product }
    const [currentRating, setCurrentRating] = useState(5);
    const [currentComment, setCurrentComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    // -------------------------------

    const subtotal = cartItems.reduce(
        (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
        0
    );

    const baseDeliveryFee = subtotal > 0 ? 20 : 0;
    const finalDeliveryFee = Math.max(0, baseDeliveryFee - shippingDiscountValue);
    const total = subtotal - discountAmount + finalDeliveryFee;

    const calculateProductDiscount = useCallback((coupon, currentSubtotal) => {
        if (!coupon || !coupon.discount) return 0;
        const discountString = String(coupon.discount);
        try {
            if (discountString.includes("%")) {
                const value = parseFloat(discountString.replace("%", ""));
                if (isNaN(value)) return 0;
                return Math.min((currentSubtotal * value) / 100, currentSubtotal);
            } else if (discountString.includes("$")) {
                const value = parseFloat(discountString.replace("$", ""));
                if (isNaN(value)) return 0;
                return Math.min(value, currentSubtotal);
            } else {
                const value = parseFloat(discountString);
                if (isNaN(value)) return 0;
                return Math.min(value, currentSubtotal);
            }
        } catch (error) {
            console.error("Lỗi khi phân tích chuỗi discount:", error);
            return 0;
        }
    }, []);

    const calculateShippingDiscount = useCallback((rule, currentSubtotal, currentBaseDeliveryFee) => {
        if (!rule || !rule.isActive) return 0;
        const minOrder = parseCurrency(rule.minOrderValue);
        if (currentSubtotal < minOrder) return 0;
        if (rule.discountType === "FREE") return currentBaseDeliveryFee;
        if (rule.discountType === "FIXED") {
            const discountVal = parseCurrency(rule.discountValue);
            return Math.min(discountVal, currentBaseDeliveryFee);
        }
        return 0;
    }, []);

    useEffect(() => {
        if (appliedCoupon) {
            const newDiscount = calculateProductDiscount(appliedCoupon, subtotal);
            setDiscountAmount(newDiscount);
        } else {
            setDiscountAmount(0);
        }
    }, [subtotal, appliedCoupon, calculateProductDiscount]);

    useEffect(() => {
        if (appliedShippingRule) {
            const newShippingDiscount = calculateShippingDiscount(appliedShippingRule, subtotal, baseDeliveryFee);
            setShippingDiscountValue(newShippingDiscount);
        } else {
            setShippingDiscountValue(0);
        }
    }, [subtotal, appliedShippingRule, baseDeliveryFee, calculateShippingDiscount]);

    const handleDeleteClick = () => {
        if (selectAll && cartItems.length > 0) {
            Modal.confirm({
                title: "Xác nhận xóa sản phẩm",
                content: "Bạn có chắc chắn muốn xóa tất cả sản phẩm?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: () => {
                    clearCart();
                    setSelectAll(false);
                    setAppliedCoupon(null);
                    setAppliedShippingRule(null);
                },
            });
        }
    };

    const handleShowCouponModal = async () => {
        setIsCouponModalVisible(true);

        const fetchProductCoupons = async () => {
            setLoadingProductCoupons(true);
            try {
                const allCoupons = await getAllCoupons();
                return allCoupons.filter((c) => c.status === "active");
            } catch (error) {
                console.error("Lỗi khi tải mã giảm giá sản phẩm:", error);
                message.error("Không thể tải mã giảm giá sản phẩm!");
                return [];
            } finally {
                setLoadingProductCoupons(false);
            }
        };

        const fetchShippingCoupons = async () => {
            setLoadingShippingCoupons(true);
            try {
                const allShipping = await getAllShippingDiscounts();
                return allShipping.filter((s) => s.isActive === true);
            } catch (error) {
                console.error("Lỗi khi tải chiết khấu vận chuyển:", error);
                message.error("Không thể tải mã giảm giá vận chuyển!");
                return [];
            } finally {
                setLoadingShippingCoupons(false);
            }
        };

        const [productResults, shippingResults] = await Promise.all([
            fetchProductCoupons(),
            fetchShippingCoupons(),
        ]);

        setActiveProductCoupons(productResults);
        setActiveShippingCoupons(shippingResults);
    };

    const handleCloseCouponModal = () => setIsCouponModalVisible(false);

    const handleApplyCouponFromModal = (item, type) => {
        if (type === "product") {
            setCouponCode(item.code);
            setAppliedCoupon(item);
            setDiscountAmount(calculateProductDiscount(item, subtotal));
            message.success(`Đã áp dụng mã sản phẩm: ${item.name}`);
        } else if (type === "shipping") {
            setAppliedShippingRule(item);
            const newShippingDiscount = calculateShippingDiscount(item, subtotal, baseDeliveryFee);
            if (newShippingDiscount === 0 && subtotal < parseCurrency(item.minOrderValue)) {
                message.warning(
                    `Cần mua thêm ${(parseCurrency(item.minOrderValue) - subtotal).toFixed(2)}$ để áp dụng mã này.`
                );
            } else {
                message.success(`Đã áp dụng mã vận chuyển: ${item.ruleName}`);
            }
            setShippingDiscountValue(newShippingDiscount);
        }
        handleCloseCouponModal();
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            message.warning("Vui lòng nhập mã giảm giá sản phẩm.");
            return;
        }
        setIsApplyingCoupon(true);
        try {
            let couponsToSearch = activeProductCoupons;
            if (couponsToSearch.length === 0) {
                const allCoupons = await getAllCoupons();
                couponsToSearch = allCoupons.filter((c) => c.status === "active");
                setActiveProductCoupons(couponsToSearch);
            }
            const foundCoupon = couponsToSearch.find(
                (c) => c.code.toLowerCase() === couponCode.toLowerCase().trim()
            );
            if (foundCoupon) {
                setAppliedCoupon(foundCoupon);
                setDiscountAmount(calculateProductDiscount(foundCoupon, subtotal));
                message.success(`Đã áp dụng mã: ${foundCoupon.name}`);
            } else {
                setAppliedCoupon(null);
                setDiscountAmount(0);
                message.error("Mã giảm giá sản phẩm không hợp lệ hoặc đã hết hạn.");
            }
        } catch (error) {
            console.error("Lỗi khi áp dụng coupon:", error);
            message.error("Đã xảy ra lỗi khi áp dụng mã.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleGoToCheckout = () => {
        if (cartItems.length === 0) {
            message.warning("Giỏ hàng của bạn đang trống!");
            return;
        }
        navigate("/checkout", {
            state: {
                subtotal,
                discountAmount,
                shippingDiscountValue,
                finalDeliveryFee,
                total,
                appliedCouponName: appliedCoupon ? appliedCoupon.name : null,
                appliedShippingRuleName: appliedShippingRule ? appliedShippingRule.ruleName : null,
            },
        });
    };

    // Generic modal for showing orders by status
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusModalTitle, setStatusModalTitle] = useState("");
    const [statusModalOrders, setStatusModalOrders] = useState([]);

    // Close helper
    const closeStatusModal = () => {
        setStatusModalVisible(false);
        setStatusModalTitle("");
        setStatusModalOrders([]);
    };

    // Mapping of UI keys to status matchers and titles. Add common synonyms to be resilient.
    const STATUS_MAP = {
        confirming: { title: "Đang Xác nhận", match: (s) => s === "Processing" || s === "Pending" },
        confirmed: { title: "Đã Xác nhận", match: (s) => s === "Confirmed" || s === "Processed" },
        delivering: { title: "Đang Giao hàng", match: (s) => s === "Shipping" || s === "Delivering" || s === "Shipped" },
        delivered: { title: "Đã Giao", match: (s) => s === "Delivered" || s === "Completed" },
    // Include delivered/completed orders in the review bucket so they appear in both lists
    review: { title: "Chờ Đánh giá", match: (s) => s === "AwaitingReview" || s === "PendingReview" || s === "Review" || s === "Delivered" || s === "Completed" },
        cancelled: { title: "Đã Hủy", match: (s) => s === "Cancelled" || s === "Canceled" },
    };

    // Open modal for a given status key
    const [statusModalKey, setStatusModalKey] = useState(null);
    const openStatusModal = (key) => {
        const def = STATUS_MAP[key];
        if (!def) return;
        const filtered = Array.isArray(orderHistory) ? orderHistory.filter((order) => def.match(order.status)) : [];
        setStatusModalKey(key);
        setStatusModalTitle(def.title);
        setStatusModalOrders(filtered);
        setStatusModalVisible(true);
    };

    // Handler to cancel a confirming order (asks for confirmation then calls context)
    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
            okText: 'Hủy đơn',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                const ok = cancelOrder ? cancelOrder(orderId) : false;
                if (ok) {
                    message.success('Đã hủy đơn hàng.');
                    // refresh modal list from updated orderHistory (orderHistory state from context should update)
                    const def = STATUS_MAP[statusModalKey];
                    const filtered = Array.isArray(orderHistory) ? orderHistory.filter((order) => def.match(order.status)) : [];
                    setStatusModalOrders(filtered);
                } else {
                    message.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
                }
            }
        });
    };

    // --- HÀM XỬ LÝ MODAL ĐÁNH GIÁ ---
    const handleOpenReviewModal = (orderId, product) => {
        setReviewingItem({ orderId, product });

        // Tìm kiếm đánh giá hiện có (nếu có) để điền vào modal
        const order = orderHistory.find(o => o.id === orderId);
        const productInOrder = order?.items.find(i => i.product.id === product.id);

        if (productInOrder?.review) {
            setCurrentRating(productInOrder.review.rating || 5);
            setCurrentComment(productInOrder.review.comment || "");
        } else {
            setCurrentRating(5); // Đặt lại về mặc định
            setCurrentComment("");
        }
        setIsReviewModalVisible(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalVisible(false);
        setReviewingItem(null);
        setCurrentRating(5);
        setCurrentComment("");
        setSubmittingReview(false);
    };

    const handleSubmitReview = async () => {
        if (!reviewingItem) return;

        if (currentRating === 0) {
            message.warning("Vui lòng chọn số sao đánh giá.");
            return;
        }
        if (!currentComment.trim()) {
            message.warning("Vui lòng nhập nhận xét của bạn.");
            return;
        }

        setSubmittingReview(true);

        const reviewData = {
            rating: currentRating,
            comment: currentComment,
            date: new Date().toISOString(),
        };

        // Giả định `addReview` là một hàm async từ context
        // addReview(orderId, productId, reviewData)
        if (addReview) {
            try {
                await addReview(reviewingItem.orderId, reviewingItem.product.id, reviewData);
                message.success("Cảm ơn bạn đã đánh giá sản phẩm!");
                handleCloseReviewModal();
                // Context nên tự động cập nhật orderHistory, làm cho modal "Chờ Đánh giá"
                // tự động cập nhật khi mở lại.
                // Ta cũng có thể cập nhật lại danh sách modal đang hiển thị:
                const def = STATUS_MAP[statusModalKey];
                const filtered = Array.isArray(orderHistory) ? orderHistory.filter((order) => def.match(order.status)) : [];
                setStatusModalOrders(filtered);

            } catch (error) {
                message.error("Không thể gửi đánh giá. Vui lòng thử lại.");
            }
        } else {
            // Hành vi giả lập nếu `addReview` không tồn tại
            console.error("Hàm 'addReview' không được cung cấp từ OrderHistoryContext.");
            message.warning("Chức năng đánh giá chưa được kết nối (thiếu addReview).");
            // Tạm thời đóng modal
            handleCloseReviewModal();
        }

        setSubmittingReview(false);
    };
    // ------------------------------------

    // --- HÀM MỚI: XỬ LÝ XÓA SẢN PHẨM KHỎI LỊCH SỬ ---
    const handleRemoveProduct = (orderId, product) => {
        Modal.confirm({
            title: 'Xác nhận xóa sản phẩm',
            content: `Bạn có chắc muốn xóa sản phẩm "${product.title}" khỏi lịch sử đơn hàng này không? Hành động này chỉ để dọn dẹp và không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                if (removeProductFromOrder) {
                    const success = await removeProductFromOrder(orderId, product.id);
                    if (success) {
                        message.success('Đã xóa sản phẩm khỏi lịch sử.');
                        // Tải lại danh sách trong modal đang mở
                        openStatusModal(statusModalKey);
                    } else {
                        message.error('Không thể xóa sản phẩm.');
                    }
                }
            },
        });
    };

    // ⭐️ HÀM MỚI: Đếm số sản phẩm chưa được đánh giá trong các đơn hàng
    const countUnreviewedProducts = (orders) => {
        if (!Array.isArray(orders)) return 0;

        return orders.reduce((total, order) => {
            const unreviewedItems = Array.isArray(order.items)
                ? order.items.filter(item => !item.review).length
                : 0;
            return total + unreviewedItems;
        }, 0);
    };

    return (
        <div className="shopping-card-page">
            <div className="cart-gif-container">
                <Image className="cart-gif" src={cartGif} preview={false} />
                <Title className="shopping-cart-title" level={2}>
                    GIỎ HÀNG CỦA BẠN
                </Title>
            </div>

            {/* Trạng thái Đơn hàng (giả định) */}
            <Row gutter={16} className="order-status-shopping">
                <Col className="order-confirm" span={3}>
                    <Text className="order-status-title">Trạng thái Đơn hàng: </Text>
                </Col>
                <Col className="order-confirm" span={3}>
                    <div
                        className="checkpoint-col"
                        onClick={() => openStatusModal('confirming')}
                        style={{ cursor: "pointer" }}
                    >
                        <Badge count={Array.isArray(orderHistory) ? orderHistory.filter(o => STATUS_MAP.confirming.match(o.status)).length : 0} color="red" offset={[-2, 5]} showZero>
                            <Loading3QuartersOutlined style={{ fontSize: 24 }} />
                        </Badge>
                        <Text>Đang Xác nhận</Text>
                        <span className="checkpoint" />
                    </div>
                </Col>
                    <Col className="order-confirm" span={3}>
                        <div className="checkpoint-col" onClick={() => openStatusModal('confirmed')} style={{ cursor: 'pointer' }}>
                            <Badge count={Array.isArray(orderHistory) ? orderHistory.filter(o => STATUS_MAP.confirmed.match(o.status)).length : 0} color="green" offset={[-2, 5]} showZero>
                                <CheckCircleOutlined style={{ fontSize: 24 }} />
                            </Badge>
                            <Text>Đã Xác nhận</Text>
                            <span className="checkpoint" />
                        </div>
                    </Col>
                    <Col className="order-confirm" span={3}>
                        <div className="checkpoint-col" onClick={() => openStatusModal('delivering')} style={{ cursor: 'pointer' }}>
                            <Badge count={Array.isArray(orderHistory) ? orderHistory.filter(o => STATUS_MAP.delivering.match(o.status)).length : 0} color="blue" offset={[-2, 5]} showZero>
                                <ShoppingCartOutlined style={{ fontSize: 24 }} />
                            </Badge>
                            <Text>Đang Giao hàng</Text>
                            <span className="checkpoint" />
                        </div>
                    </Col>
                    <Col className="order-confirm" span={3}>
                        <div className="checkpoint-col" onClick={() => openStatusModal('delivered')} style={{ cursor: 'pointer' }}>
                            {/* ⭐️ THAY ĐỔI: Quay lại logic đếm số ĐƠN HÀNG cho trạng thái "Đã Giao" */}
                            <Badge 
                                count={
                                    Array.isArray(orderHistory) 
                                    ? orderHistory.filter(o => STATUS_MAP.delivered.match(o.status)).length 
                                    : 0} 
                                color="purple" offset={[-2, 5]} showZero>
                                <SmileOutlined style={{ fontSize: 24 }} />
                            </Badge>
                            <Text>Đã Giao</Text>
                            <span className="checkpoint" />
                        </div>
                    </Col>
                    <Col className="order-confirm" span={3}>
                        <div className="checkpoint-col" onClick={() => openStatusModal('review')} style={{ cursor: 'pointer' }}>
                            {/* Giữ nguyên logic đếm SẢN PHẨM cho trạng thái "Chờ Đánh giá" */}
                            <Badge 
                                count={countUnreviewedProducts(orderHistory.filter(o => STATUS_MAP.review.match(o.status)))} 
                                color="gold" offset={[-2, 5]} showZero>
                                <StarOutlined style={{ fontSize: 24 }} />
                            </Badge>
                            <Text>Chờ Đánh giá</Text>
                            <span className="checkpoint" />
                        </div>
                    </Col>
                    <Col className="order-confirm" span={3}>
                        <div className="checkpoint-col" onClick={() => openStatusModal('cancelled')} style={{ cursor: 'pointer' }}>
                            <Badge count={Array.isArray(orderHistory) ? orderHistory.filter(o => STATUS_MAP.cancelled.match(o.status)).length : 0} color="gray" offset={[-2, 5]} showZero>
                                <CloseCircleOutlined style={{ fontSize: 24, color: '#888' }} />
                            </Badge>
                            <Text>Đã Hủy</Text>
                            <span className="checkpoint" />
                        </div>
                    </Col>
            </Row>

            <div>
                <img className="cart-img" src={cartImg} alt="Giỏ hàng" style={{ width: "35px", height: "35px" }} />
                <Title className="cart-title-shopping" level={3}>
                    Giỏ Hàng
                </Title>
            </div>

            <div className="shopping-cart-content">
                <Row className="shopping-cart-content" gutter={32}>
                    <Col span={15} className="shopping-col-left">
                        <div className="select-card">
                            <div className="select-card-item">
                                <Checkbox className="select-checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)}>
                                    Chọn Tất cả
                                </Checkbox>
                                <Button type="primary" className="delete-cart-button" onClick={handleDeleteClick} disabled={!selectAll || cartItems.length === 0}>
                                    Xóa
                                </Button>
                            </div>
                        </div>

                        <div className="product-card-shopping">
                            <div className="product-card-shopping-item">
                                {cartItems.length === 0 ? (
                                    <Empty description="Giỏ hàng của bạn trống" />
                                ) : (
                                    cartItems.map((item) => (
                                        <React.Fragment key={item.product.id}>
                                            <Row className="item-cart">
                                                <Col span={5} className="item-cart-col">
                                                    <img src={item.product.thumbnail} alt={item.product.title} />
                                                </Col>
                                                <Col span={10} className="item-cart-col">
                                                    <Text className="item-text">{item.product.title}</Text>
                                                    <br />
                                                    <Text className="item-attribute" ellipsis={{ tooltip: item.product.description }}>
                                                        {item.product.description}
                                                    </Text>
                                                    <br />
                                                    <Rate disabled defaultValue={Math.round(item.product.rating)} style={{ fontSize: 14 }} />
                                                    <br />
                                                    <Text className="item-price">${item.product.price}</Text>
                                                </Col>
                                                <Col span={9} className="action-cart">
                                                    <DeleteOutlined className="delete-icon" style={{ fontSize: "24px" }} onClick={() => removeFromCart(item.product.id)} />
                                                    <Space className="quantity-product-cart">
                                                        <Button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</Button>
                                                        <Text>{item.quantity}</Text>
                                                        <Button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                            <Divider />
                                        </React.Fragment>
                                    ))
                                )}
                            </div>
                        </div>
                    </Col>

                    <Col span={9} className="shopping-col-right">
                        <div className="sumary-card">
                            <div className="sumary-item">
                                <Title level={5} className="order-sumary">
                                    Tóm Tắt Đơn Hàng
                                </Title>

                                <div className="coupon-apply">
                                    <div className="coupon-left">
                                        <TagsOutlined style={{ fontSize: "20px" }} />
                                        <Input className="coupoint-text" placeholder="Mã Giảm giá Sản phẩm" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                    </div>
                                    <Button className="apply-button" type="primary" onClick={handleApplyCoupon} loading={isApplyingCoupon}>
                                        Áp dụng
                                    </Button>
                                </div>

                                <div style={{ width: "100%", textAlign: "right",  }}>
                                    <Button type="link" onClick={handleShowCouponModal} icon={<TagsOutlined />} style={{ paddingRight: "0" }}>
                                        Xem tất cả mã giảm giá
                                    </Button>
                                </div>

                                <Row className="price-summary">
                                    <Col span={12} className="price-summary-col">
                                        <Text className="title-price-summary">Tổng phụ</Text>
                                        <br />
                                        <Text className="title-price-summary">{appliedCoupon ? `Giảm giá (${appliedCoupon.name})` : "Giảm giá"}</Text>
                                        <br />
                                        <Text className="title-price-summary">{appliedShippingRule ? `Phí Giao hàng (${appliedShippingRule.ruleName})` : "Phí Giao hàng"}</Text>
                                    </Col>
                                    <Col span={12} className="value-price-summary">
                                        <Text className="text-price-summary">${subtotal.toFixed(2)}</Text>
                                        <br />
                                        <Text className="text-discount">-${discountAmount.toFixed(2)}</Text>
                                        <br />
                                        <Text className="text-price-summary">
                                            {shippingDiscountValue > 0 && baseDeliveryFee > 0 ? (
                                                <>
                                                    <Text delete style={{ color: "#8c8c8c", marginRight: "5px" }}>${baseDeliveryFee.toFixed(2)}</Text>
                                                    <Text style={{ color: "#52c41a" }}>${finalDeliveryFee.toFixed(2)}</Text>
                                                </>
                                            ) : (
                                                `$${finalDeliveryFee.toFixed(2)}`
                                            )}
                                        </Text>
                                        <br />
                                    </Col>
                                </Row>

                                <Divider style={{ marginTop: "8px" }} />

                                <Row className="price-summary">
                                    <Col className="total-title" span={12}>
                                        Tổng cộng
                                    </Col>
                                    <Col className="total-value" span={12}>
                                        ${total.toFixed(2)}
                                    </Col>
                                </Row>

                                <Button className="go-to-checkout" type="primary" onClick={handleGoToCheckout}>
                                    Tiến hành Thanh toán →
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal title="Mã giảm giá có sẵn" open={isCouponModalVisible} onCancel={handleCloseCouponModal} footer={[<Button key="close" onClick={handleCloseCouponModal}>Đóng</Button>]} width={700}>
                <Title level={5}>
                    <TagsOutlined /> Mã giảm giá sản phẩm
                </Title>
                <List loading={loadingProductCoupons} itemLayout="horizontal" dataSource={activeProductCoupons} renderItem={(item) => (
                    <List.Item className="coupon-list-item" actions={[<Button type="primary" className="coupon-item-apply-btn" onClick={() => handleApplyCouponFromModal(item, "product")} disabled={appliedCoupon && appliedCoupon.code === item.code}>{appliedCoupon && appliedCoupon.code === item.code ? "Đã áp dụng" : "Áp dụng"}</Button>] }>
                        <List.Item.Meta avatar={<Avatar src={item.avatar} icon={<TagsOutlined />} />} title={<span className="coupon-item-name">{item.name}</span>} description={<span className="coupon-item-desc">{item.description}</span>} />
                        <div className="coupon-item-action"><Text className="coupon-item-discount">{item.discount}</Text><Tag className="coupon-item-code">{item.code}</Tag></div>
                    </List.Item>
                )} />

                <Divider />

                <Title level={5}><CarOutlined /> Hỗ trợ vận chuyển</Title>
                <List loading={loadingShippingCoupons} itemLayout="horizontal" dataSource={activeShippingCoupons} renderItem={(item) => (
                    <List.Item className="coupon-list-item" actions={[<Button type="primary" className="coupon-item-apply-btn" onClick={() => handleApplyCouponFromModal(item, "shipping")} disabled={appliedShippingRule && appliedShippingRule.id === item.id}>{appliedShippingRule && appliedShippingRule.id === item.id ? "Đã áp dụng" : "Áp dụng"}</Button>] }>
                        <List.Item.Meta avatar={<Avatar style={{ backgroundColor: "#1890ff" }} icon={<CarOutlined />} />} title={<span className="coupon-item-name">{item.ruleName}</span>} description={<span className="coupon-item-desc">{item.description}</span>} />
                        <div className="coupon-item-action"><Text className="coupon-item-discount">{item.discountType === "FREE" ? "MIỄN PHÍ SHIP" : item.discountValue}</Text><Tag className="coupon-item-code" color="green">{`Đơn hàng từ ${item.minOrderValue}`}</Tag></div>
                    </List.Item>
                )} />
            </Modal>
            
            {/* === MODAL TRẠNG THÁI ĐƠN HÀNG (ĐÃ CHỈNH SỬA) === */}
            <Modal title={`${statusModalTitle} (${statusModalOrders.length})`} open={statusModalVisible} onCancel={closeStatusModal} footer={[<Button key="close" onClick={closeStatusModal}>Đóng</Button>]} width={800}>
                <List
                    itemLayout="vertical" // Thay đổi layout để hiển thị sản phẩm bên dưới
                    dataSource={statusModalOrders}
                    locale={{ emptyText: "Không có đơn hàng." }}
                    renderItem={(order) => {                        
                        // ⭐️ THAY ĐỔI: Tách biệt logic cho từng modal
                        const isReviewModal = (statusModalKey === 'review');
                        const isDeliveredModal = (statusModalKey === 'delivered');
                        const isCancelledModal = (statusModalKey === 'cancelled');
                        
                        // Lọc sản phẩm cho modal "Chờ đánh giá"
                        const itemsToReview = (isReviewModal && Array.isArray(order.items))
                            ? order.items.filter(item => !item.review)
                            : [];
                        
                        if (isReviewModal && itemsToReview.length > 0) {
                            // --- GIAO DIỆN MỚI CHO MODAL "ĐÃ GIAO" / "CHỜ ĐÁNH GIÁ" ---
                            return (
                                <List.Item key={order.id} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <List.Item.Meta
                                        title={<Text strong>Mã đơn hàng: {order.id}</Text>}
                                        description={
                                            <>
                                                <Text>Đặt lúc: {formatDate(order.orderDate)} | Giao tới: {order.delivery?.name || "-"} | </Text>
                                                <Text strong>Tổng: {formatCurrency(order.totals?.total || order.totals)}</Text>
                                                <br/>
                                                <Tag color="green">{order.status}</Tag>
                                            </>
                                        }
                                    />
                                    <Text strong style={{display: 'block', marginTop: '12px'}}>Sản phẩm trong đơn:</Text>
                                    <List
                                        // ⭐️ SỬ DỤNG DATASOURCE ĐÃ LỌC
                                        dataSource={itemsToReview}
                                        renderItem={(item) => {
                                            // 'item' là { product: {...}, quantity: X, review: {...} }
                                            const reviewData = item.review; // Giả định cấu trúc này
                                            const hasReviewed = !!reviewData;

                                            return (
                                                <List.Item
                                                    key={item.product.id}
                                                    actions={[
                                                        <Button
                                                            type="primary"
                                                            onClick={() => handleOpenReviewModal(order.id, item.product)}
                                                            disabled={hasReviewed}
                                                        >
                                                            {hasReviewed ? "Đã đánh giá" : "Viết đánh giá"}
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={item.product.thumbnail} />}
                                                        title={item.product.title}
                                                        description={`Số lượng: ${item.quantity}`}
                                                    />
                                                    {/* Hiển thị đánh giá hiện có nếu có */}
                                                    {hasReviewed && (
                                                        <div style={{maxWidth: '300px', textAlign: 'right'}}>
                                                            <Rate disabled value={reviewData.rating} style={{ fontSize: 14 }} />
                                                            <br/>
                                                            <Text type="secondary" italic ellipsis={{ tooltip: reviewData.comment }}>
                                                                "{reviewData.comment}"
                                                            </Text>
                                                        </div>
                                                    )}
                                                </List.Item>
                                            )
                                        }}
                                    />
                                </List.Item>
                            );
                        } else if (isReviewModal) {
                            // Nếu là modal đánh giá nhưng không còn sản phẩm nào, ẩn luôn đơn hàng
                            return null;
                        }

                        // ⭐️ LOGIC MỚI CHO MODAL "ĐÃ GIAO"
                        if (isDeliveredModal && Array.isArray(order.items)) {
                            return (
                                <List.Item key={order.id} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <List.Item.Meta
                                        title={<Text strong>Mã đơn hàng: {order.id}</Text>}
                                        description={
                                            <>
                                                <Text>Đặt lúc: {formatDate(order.orderDate)} | Giao tới: {order.delivery?.name || "-"} | </Text>
                                                <Text strong>Tổng: {formatCurrency(order.totals?.total || order.totals)}</Text>
                                                <br/>
                                                <Tag color="green">{order.status}</Tag>
                                            </>
                                        }
                                    />
                                    <Text strong style={{display: 'block', marginTop: '12px'}}>Sản phẩm trong đơn:</Text>
                                    <List
                                        // Hiển thị TẤT CẢ sản phẩm
                                        dataSource={order.items}
                                        renderItem={(item) => {
                                            const hasReviewed = !!item.review;
                                            return (
                                                <List.Item
                                                    key={item.product.id} 
                                                    actions={[ // ⭐️ THÊM THÙNG RÁC
                                                        <Button type="primary" onClick={() => handleOpenReviewModal(order.id, item.product)} disabled={hasReviewed}>
                                                            {hasReviewed ? "Đã đánh giá" : "Viết đánh giá"}
                                                        </Button>,
                                                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(order.id, item.product)} />
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={item.product.thumbnail} />}
                                                        title={item.product.title}
                                                        description={`Số lượng: ${item.quantity}`}
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </List.Item>
                            );
                        }

                        // ⭐️ LOGIC MỚI CHO MODAL "ĐÃ HỦY"
                        if (isCancelledModal && Array.isArray(order.items) && order.items.length > 0) {
                            return (
                                <List.Item key={order.id} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                    <List.Item.Meta
                                        title={<Text strong>Mã đơn hàng: {order.id}</Text>}
                                        description={
                                            <>
                                                <Text>Đặt lúc: {formatDate(order.orderDate)} | </Text>
                                                <Text strong>Tổng: {formatCurrency(order.totals?.total || order.totals)}</Text>
                                                <br/>
                                                <Tag color="gray">{order.status}</Tag>
                                            </>
                                        }
                                    />
                                    <Text strong style={{display: 'block', marginTop: '12px'}}>Sản phẩm trong đơn:</Text>
                                    <List
                                        dataSource={order.items}
                                        renderItem={(item) => {
                                            return (
                                                <List.Item
                                                    key={item.product.id}
                                                    actions={[ // ⭐️ THÊM THÙNG RÁC
                                                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(order.id, item.product)} />
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={item.product.thumbnail} />}
                                                        title={item.product.title}
                                                        description={`Số lượng: ${item.quantity}`}
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </List.Item>
                            );
                        }

                        // --- GIAO DIỆN CŨ CHO CÁC MODAL KHÁC (Đang xác nhận, Đã hủy, v.v.) ---
                        return (
                            <List.Item
                                key={order.id}
                                extra={<div style={{ textAlign: "right", minWidth: "100px" }}><Text strong>{formatCurrency(order.totals?.total || order.totals)}</Text><br/><Tag color="blue">{order.status}</Tag></div>}
                                actions={statusModalKey === 'confirming' ? [<Button danger onClick={() => handleCancelOrder(order.id)} key="cancel" className="cart-order-cancel-button">Hủy đơn hàng</Button>] : []}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={order.items?.[0]?.product?.thumbnail} icon={<ShoppingCartOutlined />} />}
                                    title={<Text strong>{order.id}</Text>}
                                    description={`Đặt lúc: ${formatDate(order.orderDate)} - Giao tới: ${order.delivery?.name || "-"}`}
                                />
                            </List.Item>
                        );
                    }}
                />
            </Modal>

            {/* === MODAL ĐÁNH GIÁ SẢN PHẨM MỚI === */}
            <Modal
                title="Đánh giá sản phẩm"
                open={isReviewModalVisible}
                onCancel={handleCloseReviewModal}
                footer={[
                    <Button key="back" onClick={handleCloseReviewModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={submittingReview} onClick={handleSubmitReview}>
                        Gửi Đánh giá
                    </Button>,
                ]}
            >
                {reviewingItem && (
                    <div style={{ textAlign: 'center' }}>
                        <Image
                            src={reviewingItem.product.thumbnail}
                            alt={reviewingItem.product.title}
                            width={120}
                            style={{ marginBottom: 16, borderRadius: 8 }}
                            preview={false}
                        />
                        <Title level={5}>{reviewingItem.product.title}</Title>
                        <div style={{ margin: "24px 0" }}>
                            <Text>Bạn cảm thấy sản phẩm này thế nào?</Text>
                            <br />
                            <Rate
                                value={currentRating}
                                onChange={setCurrentRating}
                                style={{ fontSize: 32, marginTop: 8 }}
                                allowHalf={false} // Bạn có thể đổi thành true nếu muốn
                            />
                        </div>
                        <TextArea
                            rows={4}
                            placeholder="Vui lòng chia sẻ nhận xét của bạn về sản phẩm (tối thiểu 10 ký tự)..."
                            value={currentComment}
                            onChange={(e) => setCurrentComment(e.target.value)}
                        />
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default CartProducts;