// src/data/productService.js

const API_BASE_URL = 'https://dummyjson.com';

/**
 * Lấy danh sách danh mục sản phẩm (GIỮ NGUYÊN).
 * @returns {Promise<object[]>} Một Promise resolve với mảng các đối tượng danh mục.
 */
export const getProductCategories = async () => {
    // ... (logic fetch /products/categories) ...
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`); 

        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const categories = await response.json();
        return categories; 
    } catch (error) {
        console.error("Không thể fetch danh mục sản phẩm:", error);
        throw error; 
    }
};
/**
 * LẤY DANH SÁCH SẢN PHẨM SỬ DỤNG URL ĐẦY ĐỦ VÀ THÊM LIMIT=0 ĐỂ HIỂN THỊ TẤT CẢ.
 * @param {string} url - URL đầy đủ để fetch danh sách sản phẩm theo danh mục (ví dụ: https://dummyjson.com/products/category/mens-shoes).
 * @returns {Promise<object[]>} Một Promise resolve với mảng các đối tượng sản phẩm.
 */
export const getProductsByFullUrl = async (url) => {
    try {
        // Thêm tham số ?limit=0 vào cuối URL để yêu cầu API trả về TẤT CẢ sản phẩm.
        const fullUrl = `${url}?limit=0`; 
        
        console.log("Fetching data from:", fullUrl); // Kiểm tra URL đã được thêm limit
        
        const response = await fetch(fullUrl); 

        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const data = await response.json();
        // API của dummyjson trả về object { products: [...] }
        return data.products; 

    } catch (error) {
        console.error(`Không thể fetch sản phẩm từ URL ${url}:`, error);
        throw error;
    }
};
export const searchProducts = async (query) => {
  if (!query) {
    return []; // Trả về mảng rỗng nếu không có query
  }
  try {
    // Thêm limit=5 để chỉ lấy 5 gợi ý hàng đầu
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=5`);

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }

    const data = await response.json();
    return data.products; // Trả về mảng sản phẩm

  } catch (error) {
    console.error("Không thể fetch gợi ý sản phẩm:", error);
    throw error;
  }
};
// Bạn có thể xóa hàm getProductsByCategory trước đó nếu không dùng.
// export const getProductsByCategory = async (categorySlug) => { ... }