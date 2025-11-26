import React, { useState, useEffect } from "react";
import { Typography, Rate, Button } from "antd";
import { TrophyOutlined, ShoppingCartOutlined, ArrowRightOutlined, CrownFilled, LeftOutlined, RightOutlined } from "@ant-design/icons";
import "../style/BestSellers.css";

const { Title, } = Typography;

const BestSellers = ({ products, onProductClick, onAddToCart }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Logic to select "Best Sellers"
  const bestSellers = products
    ? [...products]
        .sort((a, b) => b.rating - a.rating || b.price - a.price)
        .slice(0, 9) // Take top 9 for the slider
    : [];

  useEffect(() => {
    if (bestSellers.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % bestSellers.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [bestSellers.length]);

  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + bestSellers.length) % bestSellers.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % bestSellers.length);
  };

  if (!bestSellers || bestSellers.length === 0) {
    return null;
  }

  // We render all items but only style the visible ones based on their distance from activeIndex
  // Actually, to support infinite loop with smooth transition, it's better to map the visible window
  // But for a simple 3-item focus, we can just assign classes based on index relative to active.
  
  return (
    <div className="best-sellers-section">
      <div className="best-sellers-header">
        <div className="header-left">
            <div className="icon-box">
                <TrophyOutlined />
            </div>
            <Title level={3} className="best-sellers-title">
            BẢNG XẾP HẠNG BÁN CHẠY
            </Title>
        </div>
        <Button type="link" className="view-all-link">
          Xem tất cả <ArrowRightOutlined />
        </Button>
      </div>

      <div className="best-sellers-carousel">
        <Button 
            className="carousel-nav-btn prev" 
            shape="circle" 
            icon={<LeftOutlined />} 
            onClick={handlePrev} 
        />
        <Button 
            className="carousel-nav-btn next" 
            shape="circle" 
            icon={<RightOutlined />} 
            onClick={handleNext} 
        />
        <div className="carousel-track">
            {bestSellers.map((product, index) => {
                // Calculate position relative to active index
                // We need to handle the wrap-around logic for "distance"
                let offset = (index - activeIndex);
                if (offset > bestSellers.length / 2) offset -= bestSellers.length;
                if (offset < -bestSellers.length / 2) offset += bestSellers.length;

                let positionClass = "hidden";
                if (offset === 0) positionClass = "center";
                else if (offset === -1) positionClass = "left";
                else if (offset === 1) positionClass = "right";
                else if (offset === -2) positionClass = "far-left"; // Optional for smoother exit
                else if (offset === 2) positionClass = "far-right"; // Optional for smoother entry

                // Only render if visible or close to visible
                if (!['center', 'left', 'right', 'far-left', 'far-right'].includes(positionClass)) return null;

                const isCenter = positionClass === "center";

                return (
                    <div 
                        key={product.id} 
                        className={`carousel-item ${positionClass}`}
                        onClick={() => isCenter ? onProductClick(product) : setActiveIndex(index)}
                    >
                        {/* Rank Badge - Show actual rank in list */}
                        <div className={`carousel-rank-badge ${isCenter ? 'rank-center' : ''}`}>
                            {index + 1}
                        </div>

                        {isCenter && (
                            <div className="crown-icon-floating"><CrownFilled /></div>
                        )}

                        <div className="carousel-card">
                            <div className="carousel-img-wrapper">
                                <img src={product.thumbnail} alt={product.title} />
                                {isCenter && <div className="champion-badge">#1 Champion</div>}
                            </div>
                            
                            <div className="carousel-info">
                                {isCenter && (
                                    <Rate disabled defaultValue={product.rating} style={{ fontSize: 14, color: '#faad14', marginBottom: 8 }} />
                                )}
                                <div className="carousel-name" title={product.title}>{product.title}</div>
                                <div className="carousel-price">${product.price.toLocaleString()}</div>
                                
                                {isCenter ? (
                                    <Button 
                                        type="primary"
                                        shape="round" 
                                        icon={<ShoppingCartOutlined />} 
                                        className="carousel-btn-main"
                                        onClick={(e) => { e.stopPropagation(); onAddToCart(e, product); }}
                                    >
                                        Mua Ngay
                                    </Button>
                                ) : (
                                    <Button 
                                        shape="circle" 
                                        icon={<ShoppingCartOutlined />} 
                                        className="carousel-btn-side"
                                        onClick={(e) => { e.stopPropagation(); onAddToCart(e, product); }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
