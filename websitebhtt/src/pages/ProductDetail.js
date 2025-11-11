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
} from "antd";
import React, { useState, useEffect } from "react";
import { ShoppingCartOutlined, MoneyCollectOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom"; 
import { useCart } from "../context/CartContext"; 

const { Title, Text } = Typography;

const ProductDetail = () => {
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const product = location.state; 

  const [value, setValue] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  
  const { addToCart } = useCart(); 

  const availableStock = product ? (product.stock || 50) : 0; 

  useEffect(() => {
    if (product) {
      setMainImage(product.thumbnail);
      setThumbnails(product.images || [product.thumbnail]);
    }
  }, [product]);

  if (!product) {
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
              {product.price.toFixed(2)}₫
            </Text>
            {product.discountPercentage > 0 && (
              <Text delete style={{ marginLeft: 12, fontSize: 16 }}>
                {(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}₫
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
    </Layout>
  );
};

export default ProductDetail;
