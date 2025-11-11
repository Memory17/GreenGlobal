// Đường dẫn API Mockup cho Coupons
const API_URL = 'https://690aba261a446bb9cc239656.mockapi.io/api/v1/coupons';

/**
 * Lấy danh sách tất cả các coupons từ API.
 * @returns {Promise<Array<Object>>} Danh sách coupons nếu thành công.
 * @returns {Promise<Error>} Lỗi nếu có vấn đề xảy ra.
 */
export const getAllCoupons = async () => {
    try {
        // Thực hiện yêu cầu GET đến API
        const response = await fetch(API_URL);

        // Kiểm tra xem request có thành công không (status code 200-299)
        if (!response.ok) {
            // Ném ra lỗi nếu request không thành công
            throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        // Chuyển đổi response thành JSON
        const data = await response.json();
        
        // Trả về dữ liệu coupons
        return data;

    } catch (error) {
        // Ghi log lỗi và ném lại lỗi để nơi gọi hàm có thể xử lý
        console.error("Lỗi khi lấy danh sách coupons:", error);
        throw error;
    }
};

// Bạn có thể thêm các hàm service khác tại đây nếu cần (ví dụ: getCouponById, applyCoupon...)

// Ví dụ về cách sử dụng (thường dùng trong file khác như component React/Vue hoặc trang HTML):
/*
import { getAllCoupons } from './discountServiceUser.js';

// ... trong một hàm async khác
const loadCoupons = async () => {
    try {
        const coupons = await getAllCoupons();
        console.log("Danh sách Coupons:", coupons);
    } catch (error) {
        console.error("Không thể tải coupons:", error);
    }
};

// loadCoupons(); // Bỏ comment để chạy thử
*/