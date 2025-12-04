import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button } from 'antd';
import { ArrowRightOutlined, LeftOutlined, RightOutlined, SwapOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { getProductsByFullUrl } from '../data/productService';
import { useTranslation } from "react-i18next";
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext'; // <-- THÊM
import '../style/ProductCatalog.css';

const ProductCatalog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCompare } = useCompare();
  const { addToWishlist, isInWishlist } = useWishlist(); // <-- THÊM
  
  // Store full lists of products
  const [productsMap, setProductsMap] = useState({
    fashion: [],
    furniture: [],
    tech: []
  });
  
  // Store current index for each category
  const [indices, setIndices] = useState({
    fashion: 0,
    furniture: 0,
    tech: 0
  });

  // Store animation state for smooth transition
  const [animatingKeys, setAnimatingKeys] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fashionData, furnitureData, techData] = await Promise.all([
          getProductsByFullUrl('https://dummyjson.com/products/category/womens-dresses'),
          getProductsByFullUrl('https://dummyjson.com/products/category/furniture'),
          getProductsByFullUrl('https://dummyjson.com/products/category/smartphones')
        ]);

        setProductsMap({
          fashion: fashionData || [],
          furniture: furnitureData || [],
          tech: techData || []
        });
      } catch (error) {
        console.error("Error fetching catalog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNext = (e, key) => {
    e.stopPropagation();
    if (animatingKeys[key]) return;

    triggerAnimation(key, () => {
      setIndices(prev => ({
        ...prev,
        [key]: (prev[key] + 1) % productsMap[key].length
      }));
    });
  };

  const handlePrev = (e, key) => {
    e.stopPropagation();
    if (animatingKeys[key]) return;

    triggerAnimation(key, () => {
      setIndices(prev => ({
        ...prev,
        [key]: (prev[key] - 1 + productsMap[key].length) % productsMap[key].length
      }));
    });
  };

  const triggerAnimation = (key, callback) => {
    setAnimatingKeys(prev => ({ ...prev, [key]: true }));
    
    // Wait for fade out
    setTimeout(() => {
      callback();
      // Wait for state update then fade in
      setTimeout(() => {
        setAnimatingKeys(prev => ({ ...prev, [key]: false }));
      }, 50); 
    }, 300); // Match CSS transition duration
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
  }

  const handleItemClick = (product) => {
    navigate(`/product/${product.id}`, { state: product });
  };

  const renderCatalogItem = (categoryKey, categoryName, index) => {
    const products = productsMap[categoryKey];
    if (!products || products.length === 0) return null;

    const currentIndex = indices[categoryKey];
    const product = products[currentIndex];
    const isAnimating = animatingKeys[categoryKey];

    // Use high-res image if available, fallback to thumbnail
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : product.thumbnail;
    const isReverse = index % 2 !== 0; 

    return (
      <div className={`catalog-list-item ${isReverse ? 'reverse' : ''}`} onClick={() => handleItemClick(product)}>
        <div className="catalog-list-image-wrapper">
          {/* Navigation Buttons */}
          <div className="catalog-nav-btn prev" onClick={(e) => handlePrev(e, categoryKey)}>
            <LeftOutlined />
          </div>
          <div className="catalog-nav-btn next" onClick={(e) => handleNext(e, categoryKey)}>
            <RightOutlined />
          </div>

          <img 
            src={imageUrl} 
            alt={product.title} 
            className={`catalog-list-image ${isAnimating ? 'fade-out' : 'fade-in'}`} 
          />
          <div className={`catalog-list-price-badge ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            ${product.price}
          </div>
        </div>
        
        <div className="catalog-list-content">
          <span className="catalog-category-label">{categoryName}</span>
          
          <div className={`catalog-content-inner ${isAnimating ? 'fade-out' : 'fade-in'}`}>
            <h3 className="catalog-list-title">{product.title}</h3>
            <p className="catalog-list-desc">{product.description}</p>
            
            <div className="catalog-specs">
              <div className="spec-item">
                  <span className="spec-label">{t('brand')}</span>
                  <span className="spec-value">{product.brand || 'N/A'}</span>
              </div>
              <div className="spec-item">
                  <span className="spec-label">{t('rating_btn')}</span>
                  <span className="spec-value">{product.rating} ⭐</span>
              </div>
            </div>
          </div>

          <div className="catalog-list-action">
            <Button type="primary" shape="round" size="large" className="catalog-action-btn">
               {t('view_details')} <ArrowRightOutlined />
            </Button>
            <Button 
              shape="circle" 
              size="large" 
              className="catalog-compare-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToCompare(product);
              }}
              style={{ marginLeft: 8 }}
              icon={<SwapOutlined />}
              title={t('add_to_compare') || "So sánh"}
            />
            <Button 
              shape="circle" 
              size="large" 
              className="catalog-wishlist-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToWishlist(product);
              }}
              style={{ marginLeft: 8, color: isInWishlist(product.id) ? '#ff4d4f' : 'inherit' }}
              icon={isInWishlist(product.id) ? <HeartFilled /> : <HeartOutlined />}
              title={isInWishlist(product.id) ? (t('remove_from_wishlist') || "Bỏ yêu thích") : (t('add_to_wishlist') || "Yêu thích")}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <h2 className="catalog-title">{t('catalog_title')}</h2>
        <p className="catalog-subtitle">{t('catalog_subtitle')}</p>
      </div>

      <div className="catalog-list-container">
        {renderCatalogItem('fashion', t('catalog_fashion'), 0)}
        {renderCatalogItem('furniture', t('catalog_furniture'), 1)}
        {renderCatalogItem('tech', t('catalog_tech'), 2)}
      </div>
    </section>
  );
};

export default ProductCatalog;
