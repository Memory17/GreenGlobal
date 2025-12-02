// src/pages/ProductDetail.js
import "../style/ProductDetail.css";

import {
  Layout,
  Row,
  Col,
  Image,
  Typography,
  Space,
  Button,
  Rate,
  Empty,
  message, 
  Divider,
  List,
  Avatar,
  Form,      // 👈 THÊM
  Input,     // 👈 THÊM
  Spin,      // 👈 THÊM
  Select,    // 👈 THÊM
} from "antd";
import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingCartOutlined, 
  MoneyCollectOutlined,
  UserOutlined,
  SendOutlined, // 👈 THÊM
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext"; 
import { useAuth } from "../context/AuthContext"; // 👈 THÊM
// import { useOrderHistory } from "../context/OrderHistoryContext"; // 👈 BỎ: Không dùng nữa

// 🐞 FIX: getProductById was not found in '../API'. Adding a mock implementation here.
// You can replace this with your actual API call.
import { getMergedProducts } from "../API";
const getProductById = (id) => getMergedProducts().then(products => products.find(p => String(p.id) === String(id)));


const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductDetail = () => {
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { id: productId } = useParams(); // 👈 Lấy ID từ URL
  const { currentUser } = useAuth(); // 👈 Lấy thông tin user
  // const { addAdminReply } = useOrderHistory(); // 👈 BỎ: Tự xử lý reply tại đây để hỗ trợ cả user thường
  
  const [product, setProduct] = useState(null); // ⭐️ SỬA: Luôn bắt đầu với null
  const [loading, setLoading] = useState(true); // ⭐️ SỬA: Luôn bắt đầu với loading

  const [value, setValue] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [reviews, setReviews] = useState([]);

  // State cho việc trả lời (chung cho cả admin và user)
  const [replyingTo, setReplyingTo] = useState(null); // 👈 State cho form trả lời
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [filterRating, setFilterRating] = useState('all'); // 👈 State lọc đánh giá
  
  // State cho đánh giá mới
  const [newRating, setNewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewRefs = useRef({}); // 👈 Ref để cuộn đến bình luận
  
  const { addToCart } = useCart(); 

  const availableStock = product ? (product.stock || 50) : 0; 

  // ⭐️ HÀM MỚI: Tải đánh giá
  const loadReviews = (currentProductId) => {
    const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';
    try {
      const storedData = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      const allReviews = storedData ? JSON.parse(storedData) : [];
      const productReviews = allReviews.filter(
        review => String(review.productId) === String(currentProductId)
      );
      setReviews(productReviews);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá sản phẩm:", error);
      setReviews([]);
    }
  };

  // ⭐️ HÀM MỚI: Lắng nghe sự kiện cập nhật review từ nơi khác (ví dụ: AppHeader)
  useEffect(() => {
    const handleReviewUpdate = () => {
      console.log("ProductDetail: Nhận tín hiệu 'reviews_updated', tải lại đánh giá...");
      if (product?.id) {
        loadReviews(product.id);
      }
    };

    window.addEventListener('reviews_updated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviews_updated', handleReviewUpdate);
    };
  }, [product]); // Phụ thuộc vào product để có ID

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      // ⭐️ SỬA: Luôn tải sản phẩm dựa trên productId từ URL, không dùng location.state nữa
      if (productId) {
        setLoading(true);
        let fetchedProduct = null;
        try {
          fetchedProduct = await getProductById(productId);
          setProduct(fetchedProduct);
        } catch (error) {
          message.error("Không tìm thấy sản phẩm.");
          navigate("/products");
          return;
        } finally {
          setLoading(false);
        }

        if (fetchedProduct) {
          setMainImage(fetchedProduct.thumbnail);
          setThumbnails(fetchedProduct.images || [fetchedProduct.thumbnail]);
          loadReviews(fetchedProduct.id);
        }
      }
    };

    fetchProductAndReviews();

    // Cuộn đến bình luận nếu có
    if (location.state?.reviewToFocus && reviewRefs.current[location.state.reviewToFocus]) {
      setTimeout(() => {
        reviewRefs.current[location.state.reviewToFocus].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    } // ⭐️ SỬA: Bỏ 'product' khỏi dependency array để useEffect này chỉ chạy khi URL thay đổi
  }, [productId, navigate, location.state]);

  // Cập nhật ảnh khi sản phẩm thay đổi (trường hợp dữ liệu đến từ state)
  useEffect(() => {
     if (product) {
      setMainImage(product.thumbnail);
      setThumbnails(product.images || [product.thumbnail]);
    }
  }, [product]); // Chạy lại khi sản phẩm thay đổi

  // ⭐️ HÀM MỚI: Xử lý gửi trả lời (Admin & User)
  const handleReplySubmit = async (reviewId) => {
    if (!currentUser) {
      message.warning("Vui lòng đăng nhập để trả lời.");
      navigate('/login');
      return;
    }
    if (!replyContent.trim()) {
      message.warning("Vui lòng nhập nội dung trả lời.");
      return;
    }
    
    setSubmittingReply(true);
    try {
      const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';
      const storedReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      let allReviews = storedReviews ? JSON.parse(storedReviews) : [];

      const updatedReviews = allReviews.map(review => {
        if (String(review.id) === String(reviewId)) {
          const newReply = {
            id: `rep_${new Date().getTime()}`,
            user: currentUser.username || currentUser.email || 'User',
            userAvatar: currentUser.image || null, // Lưu avatar nếu có
            comment: replyContent,
            date: new Date().toISOString(),
            role: currentUser.role // Lưu role để hiển thị (nếu cần)
          };
          
          const currentReplies = Array.isArray(review.adminReplies) ? review.adminReplies : [];
          return { ...review, adminReplies: [...currentReplies, newReply] };
        }
        return review;
      });

      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(updatedReviews));
      message.success("Đã gửi câu trả lời.");
      loadReviews(productId); // Tải lại danh sách
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Lỗi khi trả lời:", error);
      message.error("Có lỗi xảy ra.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // ⭐️ HÀM MỚI: Xử lý gửi đánh giá mới
  const handleReviewSubmit = async () => {
    if (!currentUser) {
      message.warning("Vui lòng đăng nhập để viết đánh giá.");
      navigate('/login');
      return;
    }
    if (!newReviewContent.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmittingReview(true);
    try {
      const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';
      const storedReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      const allReviews = storedReviews ? JSON.parse(storedReviews) : [];

      const newReview = {
        id: `rev_${new Date().getTime()}`,
        productId: productId,
        productTitle: product.title, // 👈 THÊM: Tên sản phẩm
        productImage: product.thumbnail, // 👈 THÊM: Ảnh sản phẩm
        user: currentUser.username || currentUser.email || 'User',
        userAvatar: currentUser.image || null,
        rating: newRating,
        comment: newReviewContent,
        date: new Date().toISOString(),
        read: false, // 👈 THÊM: Trạng thái chưa đọc (cho thông báo)
        adminReplies: []
      };

      allReviews.unshift(newReview); // Thêm vào đầu danh sách
      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(allReviews));
      
      message.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      loadReviews(productId);
      setNewReviewContent("");
      setNewRating(5);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      message.error("Có lỗi xảy ra.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "100px", textAlign: "center" }}><Spin size="large" /></div>;
  }

  if (!product && !loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Empty description="Không tìm thấy sản phẩm. Đang quay về trang sản phẩm...">
          {setTimeout(() => navigate("/products"), 2000)}
        </Empty>
      </div>
    );
  }

  const handleIncrease = () => {
    setValue((prev) => Math.min(prev + 1, availableStock));
  };

  const handleDecrease = () => {
    setValue((prev) => Math.max(prev - 1, 1));
  };

  const checkValidity = () => {
    if (!product || value <= 0 || availableStock === 0 || value > availableStock) {
        message.warning('Vui lòng chọn số lượng hợp lệ.');
        return false;
    }
    return true;
  };

  // HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG
  const handleAddToCart = () => {
    if (!checkValidity()) return;
    
    addToCart(product, value);
    message.success(`Đã thêm ${value} sản phẩm "${product.title}" vào giỏ hàng!`);
  };
  
  // HÀM XỬ LÝ MUA NGAY
  const handleBuyNow = () => {
    if (!checkValidity()) return;

    addToCart(product, value);
    
    message.info('Đang chuyển hướng đến trang thanh toán...');
    navigate('/checkout'); 
  };

  // Lọc danh sách đánh giá
  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return Number(review.rating) === Number(filterRating);
  });

  // Tính số lượng đánh giá cho từng mức sao
  const reviewCounts = reviews.reduce((acc, review) => {
    const rating = Number(review.rating);
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  // ==========================================


  return (
    <Layout className="product-detail-page" style={{ padding: "40px 20px" }}>
      <Row gutter={[32, 32]}>
        {/* === CỘT BÊN TRÁI (HÌNH ẢNH) === */}
        <Col xs={24} md={12}>
          <div 
            className="product-images" 
            style={{ 
              display: 'flex', 
              gap: '16px' 
            }}
          >
            <Space
              direction="vertical"
              className="thumbnail-images"
              style={{ flexShrink: 0 }}
            >
              {thumbnails.map((img, index) => ( 
                <Image
                  key={index}
                  src={img} 
                  alt={`ảnh nhỏ ${index + 1}`}
                  preview={false}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: "4px",
                    cursor: "pointer",
                    border:
                      mainImage === img
                        ? "2px solid #1890ff"
                        : "1px solid #f0f0f0",
                  }}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </Space>

            <Image
              className="main-product-image"
              src={mainImage} 
              alt={product.title} 
              style={{
                width: "100%",
                flexGrow: 1,
                minWidth: 0,
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
                height: 400, 
                objectFit: 'cover', 
              }}
            />
          </div>
        </Col>

        {/* === CỘT BÊN PHẢI (THÔNG TIN) === */}
        <Col xs={24} md={12}>
          <Title level={3}>{product.title}</Title>
          <Text type="secondary" style={{ textTransform: 'capitalize' }}>
            Thương hiệu: {product.brand || 'Không có thông tin'}
          </Text>

          <div style={{ margin: "16px 0" }}>
            <Text strong className="product-price" style={{ fontSize: 24, color: '#d0021b' }}>
              {product.price?.toFixed(2) || '0.00'}₫
            </Text>
            {product.price && product.discountPercentage > 0 && (
              <Text delete style={{ marginLeft: 12, fontSize: 16 }}>
                {(product.price / (1 - product.discountPercentage / 100))?.toFixed(2)}₫
              </Text>
            )}
          </div>

          <Rate
            disabled
            allowHalf
            defaultValue={product.rating}
            style={{ marginBottom: 16 }}
          />

          {/* === HIỂN THỊ SỐ LƯỢNG TỒN KHO === */}
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Tồn kho: 
            <Text style={{ marginLeft: 8, color: availableStock > 10 ? '#389e0d' : availableStock > 0 ? '#faad14' : '#cf1322' }}>
                {availableStock > 0 ? `${availableStock} sản phẩm` : 'Hết hàng'}
            </Text>
          </Text>

          {/* === CHỌN SỐ LƯỢNG === */}
          <div className="select-quantity">
            <Text strong>
              Số lượng mua
            </Text>
            <Space className="quantity-product-cart" style={{ marginBottom: 0 }}> 
              <Button 
                  onClick={handleDecrease}
                  disabled={value === 1}
              >
                -
              </Button>
              <Text className="ant-typography" style={{ margin: '0 10px' }}>{value}</Text>
              <Button 
                  onClick={handleIncrease}
                  disabled={value >= availableStock || availableStock === 0}
              >
                  +
              </Button>
            </Space>
          </div>

          {/* === NÚT MUA === */}
          <Row className="primary-buy" gutter={16} style={{ marginTop: '24px' }}>
            <Col span={12} className="add-to-cart">
              <Button 
                className="add-to-cart-button"
                style={{ width: '100%', height: 48, fontSize: 16 }}
                icon={<ShoppingCartOutlined />}
                disabled={availableStock === 0} 
                onClick={handleAddToCart} 
              >
                Thêm vào giỏ hàng
              </Button>
            </Col>
            <Col span={12} className="buy-now">
              <Button
                className="buy-now-button"
                type="primary"
                style={{ width: '100%', height: 48, fontSize: 16 }}
                icon={<MoneyCollectOutlined />}
                disabled={availableStock === 0} 
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
            </Col>
          </Row>
          
          <div style={{ marginTop: 24 }}>
            <Text className="text-product-info">{product.description}</Text>
          </div>
        </Col>
      </Row>

      {/* ⭐️ BẮT ĐẦU: PHẦN HIỂN THỊ ĐÁNH GIÁ (ĐÃ NÂNG CẤP) ⭐️ */}
      <Row style={{ marginTop: '40px' }}>
        <Col span={24}>
          <Divider />
          
          {/* FORM VIẾT ĐÁNH GIÁ */}
          <div className="review-form-container">
            <Title level={4}>Viết đánh giá của bạn</Title>
            {currentUser ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Text>Đánh giá:</Text>
                  <Rate value={newRating} onChange={setNewRating} />
                </Space>
                <TextArea 
                  rows={4} 
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                />
                <Button 
                  type="primary" 
                  onClick={handleReviewSubmit}
                  loading={submittingReview}
                  icon={<SendOutlined />}
                >
                  Gửi đánh giá
                </Button>
              </Space>
            ) : (
              <Space>
                <Text>Vui lòng <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>đăng nhập</Button> để viết đánh giá.</Text>
              </Space>
            )}
          </div>

          <Title level={4}>Đánh giá từ khách hàng ({reviews.length})</Title>
          
          {/* Bộ lọc đánh giá */}
          <div style={{ marginBottom: 20 }}>
            <Space>
              <span style={{ fontWeight: 500 }}>Lọc theo:</span>
              <Select
                value={filterRating}
                bordered={false}
                style={{ width: 150, backgroundColor: 'transparent' }}
                onChange={(value) => setFilterRating(value)}
                options={[
                  { value: 'all', label: `Tất cả (${reviews.length})` },
                  { value: 5, label: `5 Sao (${reviewCounts[5] || 0})` },
                  { value: 4, label: `4 Sao (${reviewCounts[4] || 0})` },
                  { value: 3, label: `3 Sao (${reviewCounts[3] || 0})` },
                  { value: 2, label: `2 Sao (${reviewCounts[2] || 0})` },
                  { value: 1, label: `1 Sao (${reviewCounts[1] || 0})` },
                ]}
              />
            </Space>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={filteredReviews}
            locale={{ emptyText: "Chưa có đánh giá nào phù hợp." }}
            renderItem={(review) => {
              const isFocus = location.state?.reviewToFocus === review.id;
              return (
              <div 
                key={review.id} 
                ref={el => reviewRefs.current[review.id] = el} 
                style={{ 
                  background: isFocus ? '#fffbe6' : 'transparent',
                  border: isFocus ? '1px solid #ffe58f' : 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  marginBottom: '8px',
                  transition: 'all 0.3s'
                }}
              >
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      // ⭐ THAY ĐỔI: Ưu tiên hiển thị avatar thật của người dùng
                      // Nếu review.userAvatar có giá trị (là chuỗi base64), dùng nó làm src.
                      // Nếu không, hiển thị icon UserOutlined mặc định.
                      <Avatar src={review.userAvatar} icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        <Text strong>{review.user || 'Người dùng ẩn danh'}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(review.date).toLocaleDateString('vi-VN')}
                        </Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Rate 
                          disabled 
                          value={review.rating} 
                          style={{ fontSize: 14, marginBottom: 8 }} 
                        />
                        <Text>{review.comment}</Text>
                      </div>
                    }
                  />
                </List.Item>

                {/* PHẦN TRẢ LỜI (ADMIN & USER) */}
                {/* ⭐ THAY ĐỔI: Lặp qua mảng adminReplies để hiển thị tất cả phản hồi */}
                {Array.isArray(review.adminReplies) && review.adminReplies.map((reply, index) => (
                  <div key={index} style={{ marginLeft: 54, paddingBottom: 16, paddingTop: index > 0 ? 10 : 0 }}>
                     <List.Item.Meta
                       avatar={<Avatar src={reply.userAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=User"} icon={<UserOutlined />} />}
                       title={
                        <Space>
                           <Text strong>{reply.user || 'Người dùng'}</Text>
                           {reply.role === 'admin' && <Text type="secondary" style={{ fontSize: 12, border: '1px solid #ccc', padding: '0 4px', borderRadius: 4 }}>QTV</Text>}
                           <Text type="secondary" style={{ fontSize: 12 }}>
                             {new Date(reply.date).toLocaleString('vi-VN')}
                           </Text>
                        </Space>
                       }
                       description={<Text>{reply.comment}</Text>}
                     />
                   </div>
                ))}

                {/* NÚT VÀ FORM TRẢ LỜI CHO TẤT CẢ USER */}
                {/* ⭐ THAY ĐỔI: Cho phép mọi user đã đăng nhập trả lời */}
                {currentUser && (
                  <div style={{ marginLeft: 54, paddingBottom: 16 }}>
                    {replyingTo !== review.id ? (
                      <Button type="link" onClick={() => {
                        setReplyingTo(review.id);
                        setReplyContent(""); // Đảm bảo ô input luôn trống khi bắt đầu
                      }}>
                        Trả lời
                      </Button>
                    ) : (
                      <Form onFinish={() => handleReplySubmit(review.id)}>
                        <Space.Compact style={{ width: '100%' }}>
                          <TextArea
                            rows={2}
                            placeholder={`Trả lời ${review.user}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SendOutlined />} 
                            loading={submittingReply}
                          />
                        </Space.Compact>
                      </Form>
                    )}
                  </div>
                )}
              </div>
            )}}
          />
        </Col>
      </Row>
      {/* ⭐️ KẾT THÚC: PHẦN HIỂN THỊ ĐÁNH GIÁ ⭐️ */}
    </Layout>
  );
};

export default ProductDetail;
