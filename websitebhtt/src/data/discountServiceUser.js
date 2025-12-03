import moment from 'moment';

// Đường dẫn API - PHẢI GIỐNG VỚI ADMIN
const COUPONS_API_BASE_URL = "https://690aba261a446bb9cc239656.mockapi.io/api/v1";

// Hàm chuẩn hóa dữ liệu coupon từ API (giống admin)
const normalizeCouponData = (coupon) => {
    return {
        ...coupon,
        key: coupon.id, 
        code: coupon.code || 'N/A',
        value: coupon.value || 'N/A', 
        limit: parseInt(coupon.limit) || 0, 
        used: parseInt(coupon.used) || 0,
        expireDate: coupon.expireDate ? moment(coupon.expireDate).format('YYYY-MM-DD') : 'N/A',
        status: coupon.status || 'active',
        name: coupon.name || coupon.code, // Thêm name để hiển thị
        description: coupon.description || '', // Thêm description nếu có
        discount: coupon.value, // Alias cho value
    };
};

/**
 * Lấy danh sách tất cả các coupons từ API.
 * @returns {Promise<Array<Object>>} Danh sách coupons nếu thành công.
 * @returns {Promise<Error>} Lỗi nếu có vấn đề xảy ra.
 */
export const getAllCoupons = async () => {
    try {
        // Thực hiện yêu cầu GET đến API - GIỐNG VỚI ADMIN
        const response = await fetch(`${COUPONS_API_BASE_URL}/coupons`);

        // Kiểm tra xem request có thành công không (status code 200-299)
        if (!response.ok) {
            // Ném ra lỗi nếu request không thành công
            throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        // Chuyển đổi response thành JSON
        const data = await response.json();
        
        // Chuẩn hóa dữ liệu trước khi trả về
        return Array.isArray(data) ? data.map(normalizeCouponData) : [];

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