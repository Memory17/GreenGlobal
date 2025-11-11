// src/data/shippingServiceUser.js

// API endpoint bạn đã cung cấp
const API_URL = 'https://690ac3221a446bb9cc23bde9.mockapi.io/shippingDiscounts';

/**
 * Lấy tất cả các quy tắc giảm giá vận chuyển từ API
 * @returns {Promise<Array<Object>>} Một promise trả về mảng các đối tượng shipping discount
 */
export const getAllShippingDiscounts = async () => {
  try {
    // Gọi API bằng fetch
    const response = await fetch(API_URL);

    // Kiểm tra xem response có thành công không (status code 200-299)
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
    }

    // Parse dữ liệu JSON từ response
    const data = await response.json();
    return data;

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