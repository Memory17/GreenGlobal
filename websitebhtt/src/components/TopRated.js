import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Row, Col } from "antd";
import { StarFilled, ShoppingCartOutlined, ThunderboltOutlined, TrophyOutlined, CrownFilled, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "../style/TopRated.css";

const { Meta } = Card;
const { Title, Text } = Typography;

const TopRated = ({ products, onProductClick, onBuyNow, onAddToCart }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter products with rating >= 4.5
  const topRatedProducts = products
    ? products.filter((p) => p.rating >= 4.5)
    : [];

  const itemsPerPage = 5; // 1 Highlight + 4 Grid
  const maxIndex = topRatedProducts.length;

  // Auto-rotate effect
  useEffect(() => {
    if (maxIndex <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + itemsPerPage >= maxIndex ? 0 : prev + itemsPerPage));
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [maxIndex, itemsPerPage]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage >= maxIndex ? 0 : prev + itemsPerPage));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
        const newIndex = prev - itemsPerPage;
        return newIndex < 0 ? Math.max(0, maxIndex - (maxIndex % itemsPerPage || itemsPerPage)) : newIndex;
    });
  };

  if (!topRatedProducts || topRatedProducts.length === 0) {
    return null;
  }

  const currentBatch = topRatedProducts.slice(currentIndex, currentIndex + itemsPerPage);
  
  // If we don't have enough items for a full batch at the end, wrap around to fill
  let displayItems = currentBatch;
  if (currentBatch.length < itemsPerPage && topRatedProducts.length > itemsPerPage) {
      const remaining = itemsPerPage - currentBatch.length;
      displayItems = [...currentBatch, ...topRatedProducts.slice(0, remaining)];
  }

  const highlightProduct = displayItems[0];
  const gridProducts = displayItems.slice(1);

  return (
    <div className="top-rated-section-wrapper">
      <Row gutter={[24, 24]} className="top-rated-main-row">
        {/* Left Side: Title & Banner */}
        <Col xs={24} md={6} lg={6} className="top-rated-banner-col">
            <div className="top-rated-banner-content">
                <div className="icon-wrapper">
                    <TrophyOutlined className="top-rated-main-icon" />
                </div>
                <Title level={2} className="top-rated-title">{t('top_rated_title')}</Title>
                <div className="divider-line"></div>
                <Text className="top-rated-subtitle">{t('top_rated_subtitle')}</Text>
                
                <div className="nav-buttons">
                    <Button shape="circle" icon={<LeftOutlined />} onClick={handlePrev} className="nav-btn" />
                    <Button shape="circle" icon={<RightOutlined />} onClick={handleNext} className="nav-btn" />
                </div>
            </div>
        </Col>

        {/* Right Side: Creative Layout */}
        <Col xs={24} md={18} lg={18}>
            <div key={currentIndex} className="animate-fade-slide top-rated-content-container">
                <Row gutter={[16, 16]} className="top-rated-inner-row">
                    {/* Highlight Product (Champion) */}
                    {highlightProduct && (
                        <Col xs={24} md={10} lg={10} className="highlight-col">
                            <div className="highlight-card-wrapper">
                                <div className="crown-badge"><CrownFilled /> {t('top_rated_choice')}</div>
                                <Card
                                    hoverable
                                    onClick={() => onProductClick(highlightProduct)}
                                    cover={
                                        <div className="highlight-image-container">
                                            <img alt={highlightProduct.title} src={highlightProduct.thumbnail} className="highlight-image" />
                                        </div>
                                    }
                                    className="highlight-product-card"
                                >
                                    <div className="highlight-info">
                                        <Title level={4} className="highlight-title">{highlightProduct.title}</Title>
                                        <div className="highlight-rating">
                                            <StarFilled style={{ color: '#faad14' }} /> {highlightProduct.rating} / 5.0
                                        </div>
                                        <div className="highlight-price">${highlightProduct.price}</div>
                                        <Text type="secondary" className="highlight-desc">{highlightProduct.description}</Text>
                                        
                                        <div className="highlight-actions">
                                            <Button type="primary" size="large" icon={<ThunderboltOutlined />} className="highlight-buy-btn" onClick={(e) => onBuyNow(e, highlightProduct)}>
                                                {t('buy_now')}
                                            </Button>
                                            <Button size="large" icon={<ShoppingCartOutlined />} className="highlight-cart-btn" onClick={(e) => onAddToCart(e, highlightProduct)} />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    )}

                    {/* Grid Products (Challengers) */}
                    <Col xs={24} md={14} lg={14}>
                        <Row gutter={[12, 12]}>
                            {gridProducts.map((product) => (
                                <Col xs={12} sm={12} md={12} key={product.id}>
                                    <Card
                                        hoverable
                                        onClick={() => onProductClick(product)}
                                        className="grid-product-card"
                                        cover={
                                            <div className="grid-image-container">
                                                <img alt={product.title} src={product.thumbnail} className="grid-image" />
                                                <div className="grid-rating-badge"><StarFilled /> {product.rating}</div>
                                            </div>
                                        }
                                    >
                                        <Meta
                                            title={<div className="grid-title">{product.title}</div>}
                                            description={
                                                <div className="grid-price-row">
                                                    <span className="grid-price">${product.price}</span>
                                                    <Button 
                                                        size="small" 
                                                        shape="circle" 
                                                        icon={<ShoppingCartOutlined />} 
                                                        className="grid-cart-btn"
                                                        onClick={(e) => onAddToCart(e, product)}
                                                    />
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>
        </Col>
      </Row>
    </div>
  );
};

export default TopRated;
