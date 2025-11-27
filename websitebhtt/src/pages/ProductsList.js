import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Spin,
  message,
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
  Pagination, // Import Pagination
  Popover, // Import Popover
} from "antd";
import { 
  ShoppingCartOutlined, 
  ThunderboltOutlined,
  ThunderboltFilled,
  FireFilled,
  ArrowRightOutlined,
  SearchOutlined,
  DollarOutlined,
  StarOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Đảm bảo các đường dẫn này chính xác
import "../style/ProductList.css"; 
import "../style/Pagination.css"; // Import Pagination CSS
import HotDeal from "../components/HotDeal"; // Import HotDeal component
import BestSellers from "../components/BestSellers"; // Import BestSellers component
import TopRated from "../components/TopRated"; // Import TopRated component
import ProductCatalog from "../components/ProductCatalog"; // Import ProductCatalog component
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
  
  // --- STATE CHO PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Số sản phẩm mỗi trang

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
      setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
    }
  }, [filteredProducts, priceRange, minRating, loading, searchQuery]);

  // --- TÍNH TOÁN SẢN PHẨM CHO TRANG HIỆN TẠI ---
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = displayProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang khi chuyển trang
  };

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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
           <Title level={3} style={{ color: '#333', margin: 0 }}>☀️ Danh Mục Nổi Bật</Title>
        </div>
        
        <Row gutter={[24, 24]}>
          {[
            { key: 'smartphones', title: 'Điện Thoại', img: 'https://tinyurl.com/y3nm9j8x' },
            { key: 'laptops', title: 'Laptop', img: 'https://tinyurl.com/bhndmjk2' },
            { key: 'skincare', title: 'Chăm Sóc Da', img: 'https://tinyurl.com/yjrzc3fu' },
            { key: 'groceries', title: 'Hàng Tạp Hóa', img: 'https://tinyurl.com/2y3kznyc' },
            { key: 'home-decoration', title: 'Nội thất', img: 'https://tinyurl.com/msrmhyry' },
            { key: 'fragrances', title: 'Nước Hoa', img: 'https://tinyurl.com/nhkc6wve' }
          ].map((cat) => (
            <Col xs={24} sm={12} md={8} key={cat.key}>
              <div
                className="category-overlay-card"
                onClick={() => handleCategoryClick(cat.key)}
              >
                <div className="category-image-wrapper">
                  <img
                    alt={cat.title}
                    src={cat.img}
                    className="category-overlay-image"
                  />
                </div>
                <div className="category-overlay-content">
                  <h3 className="featured-category-title">{cat.title}</h3>
                  <span className="category-product-count">
                    {categoryCounts[cat.key] || 0} Sản phẩm
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ------------------------------------------- */}
      {/* --------- KHÁM PHÁ DANH MỤC (BUTTONS) -------- */}
      {/* ------------------------------------------- */}
      <div className="category-section-header">
        <Title level={4} style={{ margin: 0 }}>
          <span role="img" aria-label="tag" style={{ marginRight: 8 }}>🏷️</span> 
          Bạn muốn mua gì ?
        </Title>
      </div>
      
      {/* Container Grid hiện đại (Wrap Layout) */}
      <div className="category-filter-container">
        <div className="category-filter-wrapper">
          <Button
            key="all"
            type={selectedCategorySlug === null ? "primary" : "default"}
            onClick={() => handleCategoryClick(null)}
            className={`category-pill ${selectedCategorySlug === null ? 'active' : ''}`}
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
              className={`category-pill ${selectedCategorySlug === category.slug ? 'active' : ''}`}
            >
              {category.name || category.slug.replace(/-/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      


      
      {/* ========= KHU VỰC BỘ LỌC HIỆN ĐẠI (REDESIGNED) ========= */}
      <div className="modern-filter-bar">
        <div className="filter-search-wrapper">
            <SearchOutlined className="search-icon" />
            <Input 
                placeholder="Tìm kiếm sản phẩm..." 
                bordered={false} 
                className="modern-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <CloseCircleFilled 
                    className="clear-search-icon" 
                    onClick={() => setSearchQuery("")}
                />
            )}
        </div>

        <div className="filter-actions">
            {/* PRICE FILTER POPOVER */}
            <Popover
                trigger="click"
                placement="bottomRight"
                content={
                    <div className="filter-popup-content">
                        <div className="filter-popup-header">
                            <span>Khoảng giá</span>
                            <span className="price-values">${priceRange[0]} - ${priceRange[1]}</span>
                        </div>
                        <Slider
                            range
                            min={0}
                            max={maxPrice}
                            value={priceRange}
                            onChange={setPriceRange}
                            tooltip={{ formatter: (value) => `$${value}` }}
                            className="modern-slider"
                        />
                    </div>
                }
            >
                <Button 
                    className={`filter-pill-btn ${priceRange[0] > 0 || priceRange[1] < maxPrice ? 'active' : ''}`}
                    icon={<DollarOutlined />}
                >
                    Giá bán
                    {(priceRange[0] > 0 || priceRange[1] < maxPrice) && <span className="filter-dot"></span>}
                </Button>
            </Popover>

            {/* RATING FILTER POPOVER */}
            <Popover
                trigger="click"
                placement="bottomRight"
                content={
                    <div className="filter-popup-content">
                        <div className="filter-popup-header">
                            <span>Đánh giá tối thiểu</span>
                            <span>{minRating} sao</span>
                        </div>
                        <Rate 
                            value={minRating} 
                            onChange={setMinRating} 
                            className="modern-rate"
                        />
                    </div>
                }
            >
                <Button 
                    className={`filter-pill-btn ${minRating > 0 ? 'active' : ''}`}
                    icon={<StarOutlined />}
                >
                    Đánh giá
                    {minRating > 0 && <span className="filter-dot"></span>}
                </Button>
            </Popover>

            {/* RESET BUTTON */}
            {(searchQuery || minRating > 0 || (priceRange[0] > 0 || priceRange[1] < maxPrice)) && (
                <Button 
                    type="text" 
                    danger 
                    className="reset-filter-btn"
                    onClick={() => {
                        setSearchQuery("");
                        setMinRating(0);
                        setPriceRange([0, maxPrice]);
                    }}
                >
                    Xóa lọc
                </Button>
            )}
        </div>
      </div>
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
          currentProducts.map((product) => ( // <-- Lặp qua CURRENT PRODUCTS (đã phân trang)
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

      {/* --- PAGINATION --- */}
      {displayProducts.length > 0 && (
        <div className="custom-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={displayProducts.length}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['4', '8', '12', '24', '48']}
            onShowSizeChange={handlePageChange}
          />
        </div>
      )}

      {/* ------------------------------------------- */}
      {/* --------- FLASH SALE SECTION (REDESIGNED) -------- */}
      {/* ------------------------------------------- */}
      <div className="flash-sale-container">
        <div className="flash-sale-sidebar">
            <div className="flash-sale-brand">
                <ThunderboltFilled className="flash-icon" />
                <h2>FLASH<br/>SALE</h2>
            </div>
            
            <div className="flash-countdown">
                <p>Kết thúc trong</p>
                <div className="timer-display">
                    {formatTime(timeLeft).split(":").map((t, i) => (
                        <React.Fragment key={i}>
                            <div className="time-unit">{t}</div>
                            {i < 2 && <span className="colon">:</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <Button type="primary" size="large" className="view-all-flash-btn">
                Xem Tất Cả <ArrowRightOutlined />
            </Button>
        </div>

        <div className="flash-sale-content">
            {products.length > 0 ? (
            <Carousel
                dots={false}
                arrows={true}
                slidesToShow={4}
                slidesToScroll={1}
                autoplay
                autoplaySpeed={3000}
                className="flash-product-carousel"
                responsive={[
                { breakpoint: 1400, settings: { slidesToShow: 3 } },
                { breakpoint: 992, settings: { slidesToShow: 2 } },
                { breakpoint: 576, settings: { slidesToShow: 1 } },
                ]}
            >
                {(products.filter((p) => p.discountPercentage > 5).length > 0 
                    ? products.filter((p) => p.discountPercentage > 5) 
                    : products.slice(0, 10))
                .map((product) => {
                    const discount = product.discountPercentage || Math.floor(Math.random() * 20 + 10); // Fallback discount if 0
                    const originalPrice = product.price;
                    const salePrice = (product.price * (1 - discount / 100)).toFixed(2);
                    const soldPercent = Math.min(100, (product.stock / 50) * 100);

                    return (
                    <div key={product.id} className="flash-card-wrapper">
                        <div className="flash-card">
                            <div className="flash-badge">
                                <FireFilled /> -{Math.round(discount)}%
                            </div>
                            
                            <div className="flash-img-box" onClick={() => handleProductClick(product)}>
                                <img src={product.thumbnail} alt={product.title} />
                            </div>

                            <div className="flash-info">
                                <div className="flash-price">
                                    <span className="current">${salePrice}</span>
                                    <span className="original">${originalPrice}</span>
                                </div>
                                
                                <div className="flash-progress">
                                    <div className="progress-track">
                                        <div className="progress-bar-fire" style={{ width: `${soldPercent}%` }}></div>
                                    </div>
                                    <span className="sold-text">Đã bán {Math.floor(Math.random() * 40 + 1)}</span>
                                </div>

                                <div className="flash-action-group">
                                    <Button 
                                        type="primary" 
                                        danger 
                                        className="flash-buy-btn"
                                        onClick={(e) => handleBuyNow(e, product)}
                                    >
                                        Mua Ngay
                                    </Button>
                                    <Tooltip title="Thêm vào giỏ hàng">
                                        <div className="flash-cart-icon-wrapper" onClick={(e) => handleAddToCartClick(e, product)}>
                                            <ShoppingCartOutlined />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </Carousel>
            ) : (
                <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 10, color: '#999' }}>Đang tải ưu đãi...</p>
                </div>
            )}
        </div>
      </div>
      {/* ------------------------------------------- */}

      {/* ------------------------------------------- */}
      {/* --------- BEST SELLERS SECTION -------- */}
      {/* ------------------------------------------- */}
      <BestSellers 
        products={products} 
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCartClick}
      />
      {/* ------------------------------------------- */}

      {/* ------------------------------------------- */}
      {/* --------- HOT DEAL SECTION -------- */}
      {/* ------------------------------------------- */}
      <HotDeal 
        products={products} 
        onProductClick={handleProductClick}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCartClick}
      />
      {/* ------------------------------------------- */}

      {/* ------------------------------------------- */}
      {/* --------- TOP RATED SECTION -------- */}
      {/* ------------------------------------------- */}
      <TopRated 
        products={products} 
        onProductClick={handleProductClick}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCartClick}
      />
      {/* ------------------------------------------- */}

      {/* ------------------------------------------- */}
      {/* --------- PRODUCT CATALOG SECTION -------- */}
      {/* ------------------------------------------- */}
      <ProductCatalog />
      {/* ------------------------------------------- */}

    </div>
  );
}

export default Product;