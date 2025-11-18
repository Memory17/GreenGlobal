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
  Carousel,
  Slider, 
  Input, 
} from "antd";
import { 
  ShoppingCartOutlined, 
  ThunderboltOutlined,
  FilterOutlined, // Đã thêm icon Filter
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Đảm bảo các đường dẫn này chính xác
import "../style/ProductList.css"; 
import {
  getProductCategories,
  // getProductsByFullUrl, // Không cần dùng hàm này nữa nếu lọc trên client
} from "../data/productService";
// ⭐ BƯỚC 1: Import hàm getMergedProducts
import { getMergedProducts } from "../API";
import { useCart } from "../context/CartContext"; 

const { Title } = Typography;
const { Meta } = Card;

function Product() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // Master list
  const [filteredProducts, setFilteredProducts] = useState([]); // List sau khi lọc category
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600);

  // --- STATE CHO BỘ LỌC ---
  const [priceRange, setPriceRange] = useState([0, 2000]); 
  const [maxPrice, setMaxPrice] = useState(2000); 
  const [minRating, setMinRating] = useState(0); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [displayProducts, setDisplayProducts] = useState([]); // List cuối cùng để render
  
  // --- STATE ĐỂ BẬT/TẮT BỘ LỌC ---
  const [showFilters, setShowFilters] = useState(false); // Mặc định là ẩn
  
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setSelectedCategorySlug(null);
    try {
      // ⭐ BƯỚC 2: Sử dụng getMergedProducts thay vì fetch API
      const mergedProducts = await getMergedProducts();
      setProducts(mergedProducts);
      setFilteredProducts(mergedProducts);

      if (mergedProducts && mergedProducts.length > 0) {
        const max = Math.ceil(Math.max(...mergedProducts.map((p) => p.price)));
        setMaxPrice(max);
        setPriceRange([0, max]); 
      } else {
        setMaxPrice(0);
        setPriceRange([0, 0]);
      }

    } catch (err) {
      console.error("Lỗi khi tải tất cả sản phẩm:", err);
      message.error("Không thể tải danh sách sản phẩm.");
      setProducts([]);
      setFilteredProducts([]);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const categoryData = await getProductCategories(); 
        setCategories(categoryData);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
      await fetchAllProducts();
      setLoading(false); // Set false sau khi MỌI thứ đã tải xong
    };
    fetchInitialData();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAllProducts]);

  // --- USEEFFECT ĐỂ LỌC SẢN PHẨM ---
  useEffect(() => {
    if (!loading) {
      let productsToFilter = [...filteredProducts];

      // 1. Lọc theo Tên (Search Query)
      if (searchQuery) {
        productsToFilter = productsToFilter.filter((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // 2. Lọc theo giá
      productsToFilter = productsToFilter.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

      // 3. Lọc theo rate
      productsToFilter = productsToFilter.filter((p) => p.rating >= minRating);

      // 4. Cập nhật danh sách hiển thị
      setDisplayProducts(productsToFilter);
    }
  }, [filteredProducts, priceRange, minRating, loading, searchQuery]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ⭐ BƯỚC 3: Tối ưu hóa việc lọc danh mục trên client-side
  //    Hàm này sẽ không gọi API nữa mà lọc trực tiếp từ state `products` đã được gộp.
  const handleCategoryClick = (categorySlug) => {
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

    setSelectedCategorySlug(categorySlug);
    const categoryProducts = products.filter(p => p.category === categorySlug);
    setFilteredProducts(categoryProducts);
    message.success(`Đang hiển thị sản phẩm từ danh mục ${categorySlug}.`);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: product });
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation(); 
    const buyNowItem = { product: product, quantity: 1 };
    message.loading("Đang chuyển đến trang thanh toán...", 0.5);
    navigate("/checkout", { state: { buyNowItems: [buyNowItem] } });
  };

  const handleAddToCartClick = (e, product) => {
    e.stopPropagation(); 
    addToCart(product); 
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

  const categoryCounts = {
    smartphones: products.filter((p) => p.category === "smartphones").length,
    laptops: products.filter((p) => p.category === "laptops").length,
    skincare: products.filter((p) => p.category === "skin-care").length,
    groceries: products.filter((p) => p.category === "groceries").length,
    "home-decoration": products.filter((p) => p.category === "home-decoration")
      .length,
    fragrances: products.filter((p) => p.category === "fragrances").length,
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* ------------------------------------------- */}
      {/* --------- DANH MỤC NỔI BẬT -------- */}
      {/* ------------------------------------------- */}
      <div style={{ marginBottom: "40px" }}>
        <Divider>
          <Title level={4}>🌟 Danh Mục Nổi Bật</Title>
        </Divider>
        <Row gutter={[16, 16]}>
          {/* Hàng 1 */}
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("smartphones")}
            >
              <img
                alt="Điện Thoại"
                src="https://tinyurl.com/y3nm9j8x"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Điện Thoại
                <span className="category-product-count">
                  {categoryCounts.smartphones} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("laptops")}
            >
              <img
                alt="Laptop"
                src="https://tinyurl.com/bhndmjk2"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Laptop
                <span className="category-product-count">
                  {categoryCounts.laptops} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("skincare")}
            >
              <img
                alt="Chăm Sóc Da"
                src="https://tinyurl.com/yjrzc3fu"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Chăm Sóc Da
                <span className="category-product-count">
                  {categoryCounts.skincare} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* Hàng 2 */}
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("groceries")}
            >
              <img
                alt="Hàng Tạp Hóa"
                src="https://tinyurl.com/2y3kznyc"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Hàng Tạp Hóa
                <span className="category-product-count">
                  {categoryCounts.groceries} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("home-decoration")}
            >
              <img
                alt="Trang Trí Nhà Cửa"
                src="https://tinyurl.com/msrmhyry"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Nội thất
                <span className="category-product-count">
                  {categoryCounts["home-decoration"]} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div
              className="category-overlay-card"
              onClick={() => handleCategoryClick("fragrances")}
            >
              <img
                alt="Nước Hoa"
                src="https://tinyurl.com/nhkc6wve"
                className="category-overlay-image"
              />
              <div className="category-overlay-text">
                Nước Hoa
                <span className="category-product-count">
                  {categoryCounts.fragrances} Sản phẩm
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ------------------------------------------- */}
      {/* --------- KHÁM PHÁ DANH MỤC (BUTTONS) -------- */}
      {/* ------------------------------------------- */}
      <Divider orientation="left">
        <Title level={4}>🏷️ Bạn muốn mua gì ?</Title>
      </Divider>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Space size={[12, 16]} wrap>
          <Button
            key="all"
            type={selectedCategorySlug === null ? "primary" : "default"}
            onClick={() => handleCategoryClick(null)}
            style={{ textTransform: "capitalize", minWidth: "150px" }}
          >
            Tất Cả Sản Phẩm
          </Button>

          {categories.map((category) => (
            <Button
              key={category.slug}
              type={
                selectedCategorySlug === category.slug ? "primary" : "default"
              }
              onClick={() => handleCategoryClick(category.slug)}
              style={{
                textTransform: "capitalize",
                minWidth: "150px",
              }}
            >
              {category.name || category.slug.replace(/-/g, " ")}
            </Button>
          ))}
        </Space>
      </div>

      
      {/* ------------------------------------------- */}
      {/* --------- FLASH SALE SECTION -------- */}
      {/* ------------------------------------------- */}
      <div className="flash-sale-section-wrapper">
        <div className="flash-sale-banner">
          <Title
            className="flash-sale-title"
            level={2}
            style={{ color: "white", margin: 0 }}
          >
            <ThunderboltOutlined style={{ marginRight: 8, color: "yellow" }} />{" "}
            Flash Sale Hôm Nay
          </Title>
          <div className="flash-sale-timer">
            Thời gian còn lại:
            {formatTime(timeLeft)
              .split(":")
              .map((t, i) => (
                <div key={i} className="time-box">
                  {t}
                </div>
              ))}
          </div>

          <Row gutter={10} justify="center" className="flash-sale-row">
            <Col xs={24} md={8}>
              <img
                src="https://cdn.hstatic.net/files/1000003969/file/img_2197_c22e8ec7f8624198b610bfdd4c36654c.jpeg"
                alt="Deal Sốc 1"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Col>
            <Col xs={24} md={8}>
              <img
                src="https://cdn.hstatic.net/files/1000003969/file/img_2198_9bed97b1dffd4949b7c6803fcf6e5e99.jpeg"
                alt="Deal Sốc 2"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Col>
            <Col xs={24} md={8}>
              <img
                src="https://cdn.hstatic.net/files/1000003969/file/img_2199_aeb9ad30d0cf4d2c8cf765cca6798035.jpeg"
                alt="Deal Sốc 3"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Col>
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
                const salePrice = (
                  product.price *
                  (1 - product.discountPercentage / 100)
                ).toFixed(2);

                return (
                  <div key={product.id} className="flash-sale-card-wrapper">
                    <div className="flash-sale-label">SỐC</div>
                    <Card
                      hoverable
                      onClick={() => handleProductClick(product)}
                      cover={
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          style={{ height: 160, objectFit: "cover" }}
                        />
                      }
                      className="flash-sale-product-card"
                    >
                      <Meta
                        title={
                          <div className="flash-sale-title-text">
                            {product.title}
                          </div>
                        }
                      />
                      <div style={{ marginTop: 8, textAlign: "left" }}>
                        <div className="flash-sale-price-group">
                          <div className="flash-sale-current-price">
                            ${salePrice}
                          </div>
                          <div className="flash-sale-original-price">
                            ${originalPrice}
                          </div>
                        </div>
                        <div className="flash-sale-sold">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.stock / 50) * 100
                                )}%`,
                              }}
                            ></div>
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

      
      {/* ========= KHU VỰC BỘ LỌC (CÓ HIỆU ỨNG) ========= */}
      
      {/* --- NÚT BẬT/TẮT BỘ LỌC --- */}
      <div style={{ margin: "20px 0", textAlign: "right" }}>
        <Button
          type={showFilters ? "primary" : "default"} // Đổi màu khi đang bật
          icon={<FilterOutlined />}
          onClick={() => setShowFilters(!showFilters)} // Hàm bật/tắt
        >
          {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
        </Button>
      </div>

      {/* --- THAY ĐỔI LOGIC: ---
        Sử dụng className 'expanded' để CSS kích hoạt hiệu ứng
      */}
      <Card className={`filter-bar-card ${showFilters ? 'expanded' : ''}`}> 
        <Row gutter={[24, 20]} align="middle">
          
          {/* --- CỘT TÌM KIẾM --- */}
          <Col xs={24} md={8} className="filter-col">
            <Typography.Text strong className="filter-label">
              Tìm theo tên:
            </Typography.Text>
            <Input.Search
              placeholder="Nhập tên sản phẩm..."
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              style={{ width: "100%" }} 
            />
          </Col>

          {/* --- CỘT LỌC GIÁ --- */}
          <Col xs={24} md={8} className="filter-col">
            <Typography.Text strong className="filter-label">
              Lọc theo giá ($):
            </Typography.Text>
            <Slider
              range
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={setPriceRange} 
              tipFormatter={(value) => `$${value}`}
              disabled={loading}
            />
            <div className="price-range-display">
              Từ: <strong>${priceRange[0]}</strong> - Đến:{" "}
              <strong>${priceRange[1]}</strong>
            </div>
          </Col>

          {/* --- CỘT LỌC RATING --- */}
          <Col xs={24} md={8} className="filter-col">
            <Typography.Text strong className="filter-label">
              Lọc theo đánh giá (từ):
            </Typography.Text>
            <Rate
              allowClear={true} 
              value={minRating}
              onChange={setMinRating} 
              disabled={loading}
              style={{ marginTop: "4px" }} 
            />
            {minRating > 0 && (
              <span className="rating-display-text">
                (từ {minRating} sao trở lên)
              </span>
            )}
          </Col>
        </Row>
      </Card>
      {/* ========= KẾT THÚC BỘ LỌC ========= */}


      {/* ------------------------------------------- */}
      {/* --------- DANH SÁCH SẢN PHẨM CHÍNH -------- */}
      {/* ------------------------------------------- */}
      <Divider>
        {selectedCategorySlug
          ? ` ${selectedCategorySlug.toUpperCase().replace(/-/g, " ")}`
          : "Tất Cả Sản Phẩm"}
      </Divider>

      <Row gutter={[16, 16]}>
        {loading ? ( 
          <Col span={24} style={{ textAlign: "center", padding: "50px" }}>
            <Spin
              tip={`Đang tải sản phẩm ${
                selectedCategorySlug ? `của ${selectedCategorySlug}` : "..."
              }`}
            />
          </Col>
        ) : !loading && filteredProducts.length === 0 && selectedCategorySlug ? ( 
          <Col span={24} style={{ textAlign: "center", padding: "50px" }}>
            <p>
              Không có sản phẩm nào trong danh mục "
              {selectedCategorySlug.replace(/-/g, " ")}".
            </p>
          </Col>
        ) : !loading && displayProducts.length === 0 ? ( 
          <Col span={24} style={{ textAlign: "center", padding: "50px" }}>
            <Title level={5} type="secondary">
              Không tìm thấy sản phẩm nào phù hợp
            </Title>
            <p>
              Vui lòng thử điều chỉnh bộ lọc tìm kiếm, giá, hoặc đánh giá của bạn.
            </p>
          </Col>
        ) : (
          // Case 4: Có sản phẩm để hiển thị
          displayProducts.map((product) => ( // <-- Lặp qua DISPLAY PRODUCTS
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => handleProductClick(product)}
                className="product-card"
                cover={
                  <img
                    alt={product.title}
                    src={product.thumbnail}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                }
              >
                <Meta
                  title={product.title}
                  description={
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          color: "#1890ff",
                          fontWeight: "bold",
                          margin: 0,
                          fontSize: "1.1em",
                        }}
                      >
                        ${product.price}
                      </p>
                      <div style={{ marginTop: 4 }}>
                        <Rate
                          disabled
                          allowHalf 
                          value={product.rating} 
                        />
                      </div>
                    </div>
                  }
                />

                <p className="product-description">{product.description}</p>

                <div
                  className={`product-stock ${
                    product.stock < 10 ? "low-stock" : ""
                  }`}
                >
                  In Stock: {product.stock || "??"}
                </div>

                <div className="product-actions">
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    className="buy-now-button"
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
        )}
      </Row>
    </div>
  );
}

export default Product;