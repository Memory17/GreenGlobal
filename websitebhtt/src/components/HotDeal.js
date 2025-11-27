import React, { useState } from "react";
import { Button, Rate, Tag } from "antd";
import { FireFilled, ShoppingCartOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import "../style/HotDeal.css";

const HotDeal = ({ products, onProductClick, onBuyNow, onAddToCart }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter products: High discount (> 10%) and good rating
  const allHotProducts = products
    ? products.filter((p) => p.discountPercentage >= 10).sort((a, b) => b.discountPercentage - a.discountPercentage)
    : [];

  if (!allHotProducts || allHotProducts.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStartIndex((prev) => (prev + 1) % allHotProducts.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStartIndex((prev) => (prev - 1 + allHotProducts.length) % allHotProducts.length);
      setIsAnimating(false);
    }, 300);
  };

  // Get current 5 products (circular)
  const getVisibleProducts = () => {
    if (allHotProducts.length < 5) return allHotProducts; // Handle edge case
    const visible = [];
    for (let i = 0; i < 5; i++) {
        const index = (startIndex + i) % allHotProducts.length;
        visible.push(allHotProducts[index]);
    }
    return visible;
  };

  const visibleProducts = getVisibleProducts();
  // If less than 5 products, we might have issues with destructuring if we expect 5.
  // But the layout handles subProducts map safely.
  // However, if only 1 product, subProducts is empty.
  if (visibleProducts.length === 0) return null;
  
  const [heroProduct, ...subProducts] = visibleProducts;

  const renderPrice = (product) => {
    const salePrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
    return (
      <div className="price-tag">
        <span className="current">${salePrice}</span>
        <span className="original">${product.price}</span>
      </div>
    );
  };

  return (
    <div className="hot-deal-container">
      <div className="hot-deal-header-simple">
        <h2><FireFilled style={{color: '#ff4d4f'}} /> HOT DEALS</h2>
        <p>Săn deal hời - Giá cực sốc</p>
      </div>

      <div className="hot-deal-content-wrapper">
        <Button 
            className="hot-deal-nav-btn prev" 
            shape="circle" 
            icon={<LeftOutlined />} 
            onClick={handlePrev} 
        />
        <Button 
            className="hot-deal-nav-btn next" 
            shape="circle" 
            icon={<RightOutlined />} 
            onClick={handleNext} 
        />

        <div className={`hot-deal-layout ${isAnimating ? 'animating' : ''}`}>
            {/* HERO PRODUCT (Left Side) */}
            <div className="deal-hero-card" onClick={() => onProductClick(heroProduct)}>
            <div className="hero-badge">-{Math.round(heroProduct.discountPercentage)}%</div>
            <div className="hero-image-wrapper">
                <img src={heroProduct.thumbnail} alt={heroProduct.title} />
            </div>
            <div className="hero-content">
                <div className="hero-meta">
                    <Tag color="#f50">#1 Best Price</Tag>
                    <Rate disabled defaultValue={heroProduct.rating} style={{ fontSize: 14 }} />
                </div>
                <h3 className="hero-title">{heroProduct.title}</h3>
                <p className="hero-desc">{heroProduct.description}</p>
                {renderPrice(heroProduct)}
                
                <div className="hero-actions">
                    <Button type="primary" size="large" className="buy-now-btn" onClick={(e) => { e.stopPropagation(); onBuyNow(e, heroProduct); }}>
                        Mua Ngay
                    </Button>
                    <Button size="large" icon={<ShoppingCartOutlined />} onClick={(e) => { e.stopPropagation(); onAddToCart(e, heroProduct); }} />
                </div>
            </div>
            </div>

            {/* SUB PRODUCTS (Right Side - Grid) */}
            <div className="deal-sub-grid">
            {subProducts.map((product) => (
                <div key={product.id} className="deal-sub-card" onClick={() => onProductClick(product)}>
                <div className="sub-badge">-{Math.round(product.discountPercentage)}%</div>
                <div className="sub-image">
                    <img src={product.thumbnail} alt={product.title} />
                </div>
                <div className="sub-info">
                    <h4 className="sub-title" title={product.title}>{product.title}</h4>
                    {renderPrice(product)}
                    <div className="sub-actions">
                        <Button 
                            className="outline-cart-btn"
                            shape="circle" 
                            icon={<ShoppingCartOutlined />} 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(e, product); }} 
                        />
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HotDeal;
