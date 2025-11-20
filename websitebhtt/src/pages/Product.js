import React, { useState, useEffect, useCallback } from "react";
import { 
    Typography, 
    Spin, 
    message, 
    Space, 
    Button, 
    Divider,
    Row,       
    Col,        
    Card,      
    Rate,
    Tooltip,    
    Carousel    
} from "antd";
import { ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons'; 
import { useNavigate } from "react-router-dom"; 

import '../style/Product.css'; 
import { getProductCategories } from "../data/productService"; //
import { getMergedProducts } from "../API";
import { useCart } from "../context/CartContext"; //

const { Title } = Typography;
const { Meta } = Card;

function Product() {
    const { addToCart } = useCart(); 
    const navigate = useNavigate(); 

    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [products, setProducts] = useState([]); 
    const [filteredProducts, setFilteredProducts] = useState([]); 
    const [selectedCategorySlug, setSelectedCategorySlug] = useState(null); 
    const [timeLeft, setTimeLeft] = useState(3600); 
    
    const fetchAllProducts = useCallback(async () => {
        setLoading(true);
        setSelectedCategorySlug(null); 
        try {
            const merged = await getMergedProducts();
            setProducts(merged);
            setFilteredProducts(merged);
        } catch (err) {
            console.error("Lỗi khi tải tất cả sản phẩm:", err);
            message.error("Không thể tải danh sách sản phẩm.");
            setProducts([]);
        } 
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const categoryData = await getProductCategories(); //
                setCategories(categoryData); 
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
            } 
            await fetchAllProducts(); 
            setLoading(false); 
        };
        fetchInitialData();
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchAllProducts]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };
    
    const handleCategoryClick = async (categorySlug, categoryUrl) => {
        if (categorySlug === null) {
            if (selectedCategorySlug !== null) {
                 message.info("Đang hiển thị tất cả sản phẩm.");
            }
            setSelectedCategorySlug(null);
            setFilteredProducts(products); 
            return;
        }
        if (selectedCategorySlug === categorySlug) {
            return; 
        }

        setLoading(true);
        setSelectedCategorySlug(categorySlug);
        setFilteredProducts([]); 

        try {
            const data = await getMergedProducts({ category: categorySlug });
            setFilteredProducts(data);
            message.success(`Đã tải ${data.length} sản phẩm từ danh mục ${categorySlug}.`);
        } catch (err) {
            console.error(`Lỗi khi tải sản phẩm của danh mục ${categorySlug}:`, err);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`, { state: product });
    };

    // ⭐ CẬP NHẬT: HÀM XỬ LÝ MUA NGAY (KHÔNG XÓA GIỎ HÀNG) ⭐
    const handleBuyNow = (e, product) => {
        e.stopPropagation(); // 1. Ngăn Card click
        
        // 2. Tạo một đối tượng item "Mua Ngay" (số lượng là 1)
        const buyNowItem = { product: product, quantity: 1 };

        // 3. Thông báo và chuyển hướng
        message.loading('Đang chuyển đến trang thanh toán...', 0.5);
        
        // 4. Chuyển hướng đến /checkout và gửi item Mua Ngay qua 'state'
        navigate('/checkout', { state: { buyNowItems: [buyNowItem] } });
    };

    // --- HÀM XỬ LÝ THÊM VÀO GIỎ (ICON) ---
    const handleAddToCartClick = (e, product) => {
        e.stopPropagation(); // Ngăn Card click
        addToCart(product); //
        message.success(`Đã thêm sản phẩm "${product.title}" vào giỏ hàng.`);
    };

    if (loading && products.length === 0 && categories.length === 0) {
        return (
            <Spin 
                tip="Đang tải dữ liệu..." 
                style={{ display: "block", margin: "50px auto" }} 
            />
        );
    }
    
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center' }}>
                🛒 Danh Sách Sản Phẩm
            </Title>
            
            <Divider orientation="left">
                <Title level={4}>🏷️ Khám Phá Danh Mục</Title>
            </Divider>
            
            {/* KHU VỰC DANH MỤC */}
            <div style={{ textAlign: "center", marginBottom: '40px' }}>
                <Space size={[12, 16]} wrap>
                    <Button
                        key="all"
                        type={selectedCategorySlug === null ? "primary" : "default"}
                        onClick={() => handleCategoryClick(null, null)} 
                        style={{ textTransform: 'capitalize', minWidth: '150px' }}
                    >
                        Tất Cả Sản Phẩm
                    </Button>

                    {categories.map((category) => (
                        <Button
                            key={category.slug} 
                            type={selectedCategorySlug === category.slug ? "primary" : "default"}
                            onClick={() => handleCategoryClick(category.slug, category.url)} 
                            style={{ 
                                textTransform: 'capitalize', 
                                minWidth: '150px' 
                            }}
                        >
                            {category.name || category.slug.replace(/-/g, ' ')} 
                        </Button>
                    ))}
                </Space>
            </div>
            
            {/* ------------------------------------------- */}
            {/* --------- FLASH SALE SECTION -------- */}
            {/* ------------------------------------------- */}
            <div className="flash-sale-section-wrapper">
                <div className="flash-sale-banner">
                    <Title className="flash-sale-title" level={2} style={{ color: 'white', margin: 0 }}>
                        <ThunderboltOutlined style={{ marginRight: 8, color: 'yellow' }} /> Flash Sale Hôm Nay
                    </Title>
                    <div className="flash-sale-timer">
                        Thời gian còn lại: 
                        {formatTime(timeLeft)
                            .split(":")
                            .map((t, i) => (
                                <div key={i} className="time-box">{t}</div>
                            ))}
                    </div>

                    <Row gutter={10} justify="center" className="flash-sale-row">
                        <Col flex="1" span={8}><img src="https://cdn.hstatic.net/files/1000003969/file/img_2197_c22e8ec7f8624198b610bfdd4c36654c.jpeg" alt="Deal Sốc 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Col>
                        <Col flex="1" span={8}><img src="https://cdn.hstatic.net/files/1000003969/file/img_2198_9bed97b1dffd4949b7c6803fcf6e5e99.jpeg" alt="Deal Sốc 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Col>
                        <Col flex="1" span={8}><img src="https://cdn.hstatic.net/files/1000003969/file/img_2199_aeb9ad30d0cf4d2c8cf765cca6798035.jpeg" alt="Deal Sốc 3" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Col>
                    </Row>
                </div>

                {/* Flash Sale Products Carousel */}
                <div className="flash-sale-products" style={{ marginTop: 20 }}>
                    <Carousel
                        dots={false}
                        slidesToShow={5}
                        slidesToScroll={1}
                        autoplay
                        autoplaySpeed={3000}
                        responsive={[
                            { breakpoint: 1200, settings: { slidesToShow: 4 } },
                            { breakpoint: 992, settings: { slidesToShow: 3 } },
                            { breakpoint: 768, settings: { slidesToShow: 2 } },
                            { breakpoint: 576, settings: { slidesToShow: 1 } },
                        ]}
                    >
                        {products
                            .filter((p) => p.discountPercentage > 15)
                            .map((product) => {
                                const originalPrice = product.price;
                                const salePrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
                                
                                return (
                                    <div key={product.id} className="flash-sale-card-wrapper">
                                        <div className="flash-sale-label">SỐC</div>
                                        <Card
                                            hoverable
                                            onClick={() => handleProductClick(product)} 
                                            cover={<img src={product.thumbnail} alt={product.title} style={{ height: 160, objectFit: 'cover' }} />}
                                            className="flash-sale-product-card" 
                                        >
                                            <Meta title={<div className="flash-sale-title-text">{product.title}</div>} />
                                            <div style={{ marginTop: 8, textAlign: "left" }}>
                                                <div className="flash-sale-price-group">
                                                    <div className="flash-sale-current-price">${salePrice}</div>
                                                    <div className="flash-sale-original-price">${originalPrice}</div>
                                                </div>
                                                <div className="flash-sale-sold">
                                                    <div className="progress-bar-container">
                                                        <div className="progress-bar" style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}></div>
                                                    </div>
                                                    <span className="sold-text">
                                                        Đã bán {Math.floor(Math.random() * 40 + 1)} sản phẩm
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flash-sale-actions">
                                                <Button 
                                                    type="primary" 
                                                    size="small" 
                                                    style={{ flexGrow: 1 }}
                                                    // ⭐ GẮN HÀM MUA NGAY (ĐÃ CẬP NHẬT) ⭐
                                                    onClick={(e) => handleBuyNow(e, product)}
                                                >
                                                    Mua ngay
                                                </Button>
                                                <Tooltip title="Thêm vào giỏ hàng">
                                                    <ShoppingCartOutlined 
                                                        className="add-to-cart-icon"
                                                        onClick={(e) => handleAddToCartClick(e, product)} 
                                                        style={{ marginLeft: 8 }}
                                                    />
                                                </Tooltip>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                    </Carousel>
                </div>
            </div>
            {/* ------------------------------------------- */}
            
            <Divider>
                {selectedCategorySlug 
                    ? `Sản phẩm trong danh mục: ${selectedCategorySlug.toUpperCase().replace(/-/g, ' ')}`
                    : "Tất Cả Sản Phẩm"}
            </Divider>
            
            {/* HIỂN THỊ DANH SÁCH SẢN PHẨM CHUNG */}
            <Row gutter={[16, 16]}>
                {loading && filteredProducts.length === 0 ? (
                    <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
                         <Spin tip={`Đang tải sản phẩm ${selectedCategorySlug ? `của ${selectedCategorySlug}` : '...'}`} />
                    </Col>
                ) : (
                    filteredProducts.length === 0 ? (
                        <Col span={24} style={{ textAlign: 'center', padding: '50px' }}>
                            <p>
                                {selectedCategorySlug 
                                    ? "Không có sản phẩm nào trong danh mục này." 
                                    : "Vui lòng chọn một danh mục ở trên."}
                            </p>
                        </Col>
                    ) : (
                        filteredProducts.map((product) => (
                            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    onClick={() => handleProductClick(product)} 
                                    className="product-card" 
                                    cover={<img alt={product.title} src={product.thumbnail} style={{ height: 200, objectFit: 'cover' }} />}
                                >
                                    <Meta 
                                        title={product.title} 
                                        description={
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ color: '#1890ff', fontWeight: 'bold', margin: 0 }}>${product.price}</p>
                                                <div style={{ marginTop: 4 }}>
                                                    <Rate disabled defaultValue={Math.round(product.rating)} />
                                                </div>
                                            </div>
                                        }
                                    />
                                    
                                    <p className="product-description">
                                        {product.description}
                                    </p>

                                    <div className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                                        Tồn kho: {product.stock || '??'} sản phẩm
                                    </div>

                                    <div className="product-actions">
                                        <Button 
                                            type="primary" 
                                            icon={<ThunderboltOutlined />}
                                            className="buy-now-button"
                                            // ⭐ GẮN HÀM MUA NGAY (ĐÃ CẬP NHẬT) ⭐
                                            onClick={(e) => handleBuyNow(e, product)}
                                            disabled={product.stock === 0}
                                        >
                                            Mua Ngay
                                        </Button>

                                        <Tooltip title="Thêm vào giỏ hàng">
                                            <ShoppingCartOutlined 
                                                className="add-to-cart-icon"
                                                onClick={(e) => handleAddToCartClick(e, product)} 
                                            />
                                        </Tooltip>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    )
                )}
            </Row>
        </div>
    );
}

export default Product;