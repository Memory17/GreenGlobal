import React from 'react';
import { Typography, Button, Row, Col, Rate, Tooltip } from 'antd';
import {ShoppingCartOutlined, ArrowLeftOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import '../style/Wishlist.css';

const { Title, Text } = Typography;

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty-container">
        <div className="wishlist-empty-content">
            <HeartFilled className="empty-heart-icon" />
            <Title level={3}>{t('wishlist_empty') || "Danh sách yêu thích trống"}</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                {t('wishlist_empty_hint') || "Hãy thêm những món đồ bạn yêu thích vào đây nhé!"}
            </Text>
            <Button type="primary" size="large" shape="round" onClick={() => navigate('/products')}>
                {t('continue_shopping') || "Tiếp tục mua sắm"}
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-wrapper">
      <div className="wishlist-header-section">
        <div className="wishlist-header-content">
            <Button 
                className="back-btn" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} 
            />
            <div>
                <Title level={2} className="wishlist-main-title">
                    {t('wishlist_title') || "Danh sách yêu thích"} 
                    <span className="wishlist-count">({wishlistItems.length})</span>
                </Title>
                <Text className="wishlist-subtitle">{t('wishlist_subtitle') || "Lưu giữ những sản phẩm bạn quan tâm"}</Text>
            </div>
        </div>
      </div>

      <div className="wishlist-grid-container">
        <Row gutter={[24, 24]}>
            {wishlistItems.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product.id}>
                <div className="wishlist-card">
                    <div className="wishlist-card-image-wrapper" onClick={() => navigate(`/product/${product.id}`)}>
                        <img
                            alt={product.title}
                            src={product.thumbnail}
                            className="wishlist-card-img"
                        />
                        <div className="wishlist-remove-btn-wrapper">
                             <Tooltip title={t('remove_from_wishlist') || "Bỏ yêu thích"}>
                                <Button 
                                    shape="circle"
                                    className="wishlist-remove-btn"
                                    icon={<HeartFilled style={{ fontSize: '20px' }} />} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromWishlist(product.id);
                                    }} 
                                />
                            </Tooltip>
                        </div>
                        {product.discountPercentage > 0 && (
                            <div className="wishlist-discount-badge">
                                -{Math.round(product.discountPercentage)}%
                            </div>
                        )}
                    </div>
                    
                    <div className="wishlist-card-content">
                        <div className="wishlist-card-info" onClick={() => navigate(`/product/${product.id}`)}>
                            <h3 className="wishlist-card-title" title={product.title}>{product.title}</h3>
                            <div className="wishlist-card-meta">
                                <div className="wishlist-price-box">
                                    <span className="current-price">
                                        ${typeof product.price === 'number' ? product.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : product.price}
                                    </span>
                                    {product.discountPercentage > 0 && (
                                        <span className="original-price">
                                            ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <Rate disabled allowHalf defaultValue={product.rating} className="wishlist-rate" />
                            </div>
                        </div>

                        <Button 
                            type="primary" 
                            block
                            className="wishlist-add-cart-btn"
                            icon={<ShoppingCartOutlined />} 
                            onClick={() => addToCart(product)} 
                        >
                            {t('add_to_cart') || "Thêm vào giỏ"}
                        </Button>
                    </div>
                </div>
            </Col>
            ))}
        </Row>
      </div>
    </div>
  );
};

export default Wishlist;
