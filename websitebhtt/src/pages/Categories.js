// src/pages/Categories.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
  getProductCategories,
  getProductsByFullUrl, // Import hàm lấy sản phẩm
} from "../data/productService";
import "../style/Categories.css";

/**
 * Component con:
 * Tự chịu trách nhiệm hiển thị 1 cột danh mục
 * và tải sản phẩm con khi được hover
 */
const CategoryColumnItem = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Tránh gọi API liên tục
  const navigate = useNavigate();

  // Hàm này sẽ được gọi khi di chuột VÀO cột
  const handleMouseEnter = async () => {
    if (isLoading || hasFetched) return;

    setIsLoading(true);
    try {
      // ⭐ SỬA LỖI Ở ĐÂY ⭐
      // `productsArray` bây giờ chính là mảng [...]
      const productsArray = await getProductsByFullUrl(
        `https://dummyjson.com/products/category/${category.slug}`
      );

      // Kiểm tra xem có đúng là mảng không
      if (Array.isArray(productsArray)) {
        // Chúng ta gọi .slice() trực tiếp trên mảng productsArray
        setProducts(productsArray.slice(0, 4));
      } else {
        // Fallback nếu API trả về gì đó lạ
        console.error("Dữ liệu sản phẩm trả về không phải là một mảng:", productsArray);
        setProducts([]); // Đặt là mảng rỗng để tránh lỗi
      }
      
      setHasFetched(true);
    } catch (error) {
      // Báo lỗi gốc mà bạn thấy trong console
      console.error(`Không thể tải sản phẩm cho ${category.name}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Chúng ta sử dụng className="category-item" từ file CSS của bạn
    <div className="category-item" onMouseEnter={handleMouseEnter}>
      {/* Sử dụng className="category-title" từ file CSS của bạn */}
      <div className="category-title">{category.name}</div>

      {/* Sử dụng className="category-products" (sẽ thêm CSS ở bước 3) */}
      <ul className="category-products">
        {isLoading && <Spin size="small" />}
        {products.map((product) => (
          // Sử dụng className="category-product" (sẽ thêm CSS ở bước 3)
          <li 
            key={product.id} 
            className="category-product"
            onClick={() => navigate(`/product/${product.id}`, { state: product })}
          >
            {product.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Component cha:
 * Tải danh sách các danh mục chính
 */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tải danh sách danh mục (giống code cũ của bạn)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getProductCategories();
        setCategories(data);
      } catch (error) {
        console.error("Không thể tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Hiển thị loading (giống code cũ của bạn)
  if (loading) {
    return (
      <div
        className="categories-dropdown"
        style={{ display: "flex", justifyContent: "center", padding: "20px" }}
      >
        <Spin />
      </div>
    );
  }

  // Render danh sách
  return (
    // Sử dụng className="categories-dropdown" từ file CSS của bạn
    <div className="categories-dropdown">
      {categories.map((cat) => (
        // Render component con cho mỗi danh mục
        <CategoryColumnItem key={cat.slug} category={cat} />
      ))}
    </div>
  );
};

export default Categories;