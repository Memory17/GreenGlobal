// src/data/shippingServiceUser.js

// API endpoint - GIỐNG VỚI ADMIN
const SHIPPING_API_BASE_URL = "https://690ac3221a446bb9cc23bde9.mockapi.io";

// Hàm chuẩn hóa dữ liệu shipping rule
const normalizeShippingRuleData = (rule) => {
    return {
        ...rule,
        key: rule.id,
        id: rule.id,
        ruleName: rule.ruleName || 'N/A',
        minOrderValue: rule.minOrderValue || 0,
        minOrderValueDisplay: rule.minOrderValue ? parseInt(rule.minOrderValue).toLocaleString('vi-VN') + 'đ' : '0đ',
        discountType: rule.discountType || 'FREE',
        discountValue: rule.discountValue || 0,
        description: rule.description || '',
        isActive: rule.isActive !== false, // Mặc định true nếu không có
    };
};

/**
 * Lấy tất cả các quy tắc giảm giá vận chuyển từ API
 * @returns {Promise<Array<Object>>} Một promise trả về mảng các đối tượng shipping discount
 */
export const getAllShippingDiscounts = async () => {
  try {
    // Gọi API bằng fetch - GIỐNG VỚI ADMIN
    const response = await fetch(`${SHIPPING_API_BASE_URL}/shippingDiscounts`);

    // Kiểm tra xem response có thành công không (status code 200-299)
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
    }

    // Parse dữ liệu JSON từ response
    const data = await response.json();
    
    // Chuẩn hóa dữ liệu trước khi trả về
    return Array.isArray(data) ? data.map(normalizeShippingRuleData) : [];

  } catch (error) {
    // Xử lý nếu có lỗi (lỗi mạng, lỗi parse JSON,...)
    console.error("Không thể lấy dữ liệu shipping discounts:", error);
    // Ném lỗi ra ngoài để component gọi nó (ví dụ: CartProducts.js) có thể bắt và xử lý
    throw error;
  }
};

// Bạn có thể thêm các hàm khác tại đây nếu cần, ví dụ:
/*
export const getShippingDiscountById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Lỗi khi lấy chi tiết discount');
    }
    return await response.json();
  } catch (error) {
    console.error(`Không thể lấy dữ liệu cho id ${id}:`, error);
    throw error;
  }
};
*/