// src/context/OrderHistoryContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const OrderHistoryContext = createContext();

export const useOrderHistory = () => useContext(OrderHistoryContext);

const ALL_ORDERS_KEY = 'allUserOrders'; // Lưu đơn hàng của TẤT CẢ user
const GLOBAL_REVIEWS_KEY = 'app_reviews_v1'; // Key riêng cho Admin đọc đánh giá

const getUserKey = (user) => {
  if (!user) {
    return null;
  }
  const key = user.email || user.username || user.id;
  if (!key) {
    console.error(
      "LỖI: OrderHistoryContext không tìm thấy key (email, username, hoặc id)",
      user
    );
    return null;
  }
  return String(key);
};


export const OrderHistoryProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải lịch sử đơn hàng KHI NGƯỜI DÙNG THAY ĐỔI
  const loadOrderHistory = useCallback(() => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
        setOrderHistory([]);
        return;
    }

    setLoading(true);
    try {
        // --- PHẦN 1: ĐỌC DỮ LIỆU TỪ CẢ HAI NGUỒN ---
        const storedUserData = localStorage.getItem(ALL_ORDERS_KEY);
        const allUserOrdersData = storedUserData ? JSON.parse(storedUserData) : {};
        const userOrders = allUserOrdersData[userKey] || [];

        // Đọc cả dữ liệu từ sổ của Admin
        const storedAdminData = localStorage.getItem('app_orders_v1');
        const adminOrders = storedAdminData ? JSON.parse(storedAdminData) : [];

        // Nếu không có đơn hàng nào của user thì không cần làm gì thêm
        if (!userOrders.length) {
            setOrderHistory([]);
            return;
        }

        // --- PHẦN 2: ĐỒNG BỘ TRẠNG THÁI ---
        let hasChanges = false;
        const syncedUserOrders = userOrders.map(userOrder => {
            // Tìm đơn hàng tương ứng trong sổ của Admin
            const matchingAdminOrder = adminOrders.find(
                adminOrder => adminOrder.id === userOrder.id || adminOrder.key === userOrder.id
            );

            // Nếu tìm thấy và trạng thái khác nhau -> Ưu tiên trạng thái từ Admin
            if (matchingAdminOrder && matchingAdminOrder.status !== userOrder.status) {
                hasChanges = true;
                return { ...userOrder, status: matchingAdminOrder.status };
            }
            
            // Nếu không, giữ nguyên
            return userOrder;
        });

        // --- PHẦN 3: CẬP NHẬT LẠI LOCALSTORAGE CỦA USER NẾU CÓ THAY ĐỔI ---
        if (hasChanges) {
            allUserOrdersData[userKey] = syncedUserOrders;
            localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allUserOrdersData));
        }

        // Cập nhật state để giao diện hiển thị trạng thái mới nhất
        setOrderHistory(syncedUserOrders);

    } catch (error) {
        console.error('Lỗi khi tải và đồng bộ lịch sử đơn hàng:', error);
        setOrderHistory([]);
    } finally {
        setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadOrderHistory();
  }, [loadOrderHistory]); // Tải khi hàm load thay đổi (tức là khi user thay đổi)

  // 2. Thêm đơn hàng mới
// Thay thế hàm addOrderToHistory cũ bằng hàm mới này

  const addOrderToHistory = (newOrderData) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
      console.error('Không thể lưu đơn hàng: Người dùng không hợp lệ hoặc thiếu key (email/username/id).');
      return;
    }

    // Tạo một đối tượng đơn hàng hoàn chỉnh cho user
    const newOrder = {
      ...newOrderData,
      id: `ORDER-${new Date().getTime()}`,
      orderDate: new Date().toISOString(),
      status: 'Processing',
    };

    try {
      // --- PHẦN 1: LƯU CHO USER (Giữ nguyên) ---
      const storedData = localStorage.getItem(ALL_ORDERS_KEY);
      const allOrdersData = storedData ? JSON.parse(storedData) : {};
      const userOrders = allOrdersData[userKey] || [];
      const updatedUserOrders = [newOrder, ...userOrders];
      allOrdersData[userKey] = updatedUserOrders;
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      setOrderHistory(updatedUserOrders);
      // --- KẾT THÚC PHẦN 1 ---


      // ========================================================
      // === PHẦN 2: ĐỒNG BỘ CHO ADMIN (ĐÃ SỬA LỖI) ===
      // ========================================================
      try {
        const ADMIN_ORDERS_KEY = 'app_orders_v1';

        // 1. "Dịch" cấu trúc item:
        //    Từ: [{ product: { title, thumbnail, ... } }]
        //    Sang: [{ title, thumbnail, price, quantity }] (như Admin mong đợi)
        const adminItems = newOrder.items.map(item => ({
            title: item.product.title,
            thumbnail: item.product.thumbnail,
            price: item.product.price,
            quantity: item.quantity,
        }));

        // 2. Lấy tên khách hàng từ form (newOrder.delivery.name)
        //    Nếu không có, mới lấy email/username người dùng
        const customerName = 
            newOrder.delivery?.name || 
            (currentUser?.email || currentUser?.username) || 
            'Khách Lẻ';

        // 3. Tạo đối tượng đơn hàng chuẩn cho Admin
        const adminOrder = {
          id: newOrder.id,
          key: newOrder.id, // Trang Admin dùng 'key'
          
          // SỬA LỖI SẢN PHẨM: Dùng adminItems đã được "dịch"
          items: adminItems, 
          
          // SỬA LỖI "NaN": Lấy newOrder.totals.total
          totals: {
            total: newOrder.totals.total,
          },

          // SỬA LỖI TÊN KHÁCH HÀNG: Lấy tên từ form và các thông tin khác
          customer: {
            name: customerName,
            email: newOrder.delivery?.email,
            phone: newOrder.delivery?.phone,
          }, 

          status: newOrder.status,
          createdAt: newOrder.orderDate,
        };

        // 4. Lấy danh sách admin cũ
        let globalOrders = [];
        try {
          const storedAdminOrders = localStorage.getItem(ADMIN_ORDERS_KEY);
          globalOrders = storedAdminOrders ? JSON.parse(storedAdminOrders) : [];
          if (!Array.isArray(globalOrders)) {
            globalOrders = [];
          }
        } catch (e) {
          console.warn("Lỗi parse admin orders, tạo mảng mới.", e);
          globalOrders = [];
        }

        // 5. Thêm đơn hàng mới vào đầu và lưu lại
        const updatedGlobalOrders = [adminOrder, ...globalOrders];
        localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(updatedGlobalOrders));

        // 6. Phát tín hiệu để trang Admin tự cập nhật
        window.dispatchEvent(new Event('orders_updated'));

      } catch (adminError) {
        console.error("Lỗi khi đồng bộ đơn hàng sang cho Admin:", adminError, "Dữ liệu đơn hàng:", newOrder);
      }
      // --- KẾT THÚC PHẦN 2 ---

    } catch (error) {
      console.error('Lỗi khi thêm đơn hàng mới:', error);
    }
  };

  // 3. Cập nhật trạng thái đơn hàng (ví dụ: hủy đơn)
  const updateOrderStatus = (orderId, newStatus) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) return false;

    try {
      const storedData = localStorage.getItem(ALL_ORDERS_KEY);
      const allOrdersData = storedData ? JSON.parse(storedData) : {};
      let userOrders = allOrdersData[userKey] || [];
      
      let orderFound = false;
      const updatedUserOrders = userOrders.map(order => {
        if (order.id === orderId) {
          orderFound = true;
          return { ...order, status: newStatus };
        }
        return order;
      });

      if (!orderFound) {
        console.warn('Không tìm thấy đơn hàng để cập nhật');
        return false;
      }

      // Cập nhật cho User
      allOrdersData[userKey] = updatedUserOrders;
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      setOrderHistory(updatedUserOrders); // Cập nhật state

      // Cập nhật cho Admin (khi User tự hủy)
      try {
        const ADMIN_ORDERS_KEY = 'app_orders_v1';
        const storedAdminOrders = localStorage.getItem(ADMIN_ORDERS_KEY);
        let globalOrders = storedAdminOrders ? JSON.parse(storedAdminOrders) : [];
        if (Array.isArray(globalOrders)) {
          let orderFound = false;
          const updatedGlobalOrders = globalOrders.map(order => {
            if (order.id === orderId || order.key === orderId) {
              orderFound = true;
              return { ...order, status: newStatus }; // newStatus là 'Cancelled'
            }
            return order;
          });
          if (orderFound) {
            localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(updatedGlobalOrders));
            window.dispatchEvent(new Event('orders_updated')); 
          }
        }
      } catch (adminError) {
        console.error("Lỗi khi cập nhật trạng thái cho Admin:", adminError);
      }
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
      return false;
    }
  };

  // 4. Tiện ích: hủy đơn hàng (Dùng tên chuẩn hóa 'Cancelled')
  const cancelOrder = (orderId) => updateOrderStatus(orderId, 'Cancelled');
  
  // =================================================================
  // ⭐️ BẮT ĐẦU CHỨC NĂNG MỚI: THÊM ĐÁNH GIÁ (ĐÃ SỬA LỖI SO SÁNH ID) ⭐️
  // =================================================================
  const addReview = async (orderId, productId, reviewData) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
        console.error("Không thể thêm đánh giá: người dùng chưa đăng nhập.");
        return false;
    }

    try {
        // --- PHẦN 1: CẬP NHẬT CHO USER ---
        
        let orderFound = false;
        let productFound = false;
        let reviewedProductTitle = ''; // Lấy tên SP để gửi cho Admin
        let reviewedProductImage = ''; // 👈 THÊM: Lấy ảnh SP để gửi cho Admin

        // Tạo một bản sao mới của array từ state
        const updatedUserOrders = orderHistory.map(order => {
            if (order.id === orderId) {
                orderFound = true;
                
                if (!order.items || typeof order.items.map !== 'function') {
                    console.error("Lỗi dữ liệu: Đơn hàng tìm thấy nhưng không có 'items' array.", order);
                    return order; 
                }

                // Bây giờ 'map' mới an toàn
                const updatedItems = order.items.map(item => { // 👈 SỬA: Đổi 'product' thành 'item'
                    
                    // === SỬA LỖI CUỐI CÙNG: ÉP KIỂU VỀ STRING ĐỂ SO SÁNH ===
                    if (String(item.product.id) === String(productId)) { // 👈 SỬA: Truy cập vào item.product.id
                    // === KẾT THÚC SỬA LỖI ===
                        
                        productFound = true;
                        reviewedProductTitle = item.product.title; // Lấy tên SP
                        reviewedProductImage = item.product.thumbnail; // 👈 THÊM: Lấy ảnh SP
                        // Thêm review vào sản phẩm
                        item.review = {
                            rating: reviewData.rating,
                            comment: reviewData.comment,
                            date: new Date().toISOString()
                        };
                    }
                    return item;
                });
                
                // Trả về 'items' đã được cập nhật
                return { ...order, items: updatedItems };
            }
            return order;
        });

        // Lỗi này (orderFound: true, productFound: false) sẽ biến mất
        if (!orderFound || !productFound) {
            console.error("Lỗi: Không tìm thấy đơn hàng hoặc sản phẩm để đánh giá.", { orderFound, productFound, checkingProductId: productId });
            if (!productFound) return false;
        }

        // 1. Cập nhật state trước
        setOrderHistory(updatedUserOrders); 

        // 2. Cập nhật localStorage với dữ liệu đã được cập nhật
        const storedData = localStorage.getItem(ALL_ORDERS_KEY);
        const allOrdersData = storedData ? JSON.parse(storedData) : {};
        allOrdersData[userKey] = updatedUserOrders; // Ghi đè array của user
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));

        // --- PHẦN 2: THÔNG BÁO CHO ADMIN (Giữ nguyên) ---
        const storedAdminReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
        const globalReviews = storedAdminReviews ? JSON.parse(storedAdminReviews) : [];

        const adminReview = {
            id: `rev_${new Date().getTime()}`,
            user: currentUser.username || currentUser.email,
            userAvatar: currentUser.image || null, // 👈 THÊM MỚI: Lấy avatar của người dùng
            productTitle: reviewedProductTitle,
            productImage: reviewedProductImage, // 👈 THÊM: Thêm ảnh vào đối tượng review
            productId: productId,
            orderId: orderId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date().toISOString(),
            read: false 
        };

        globalReviews.unshift(adminReview);
        // Dòng này sẽ kích hoạt sự kiện 'storage' mà AppHeader đang lắng nghe
        localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(globalReviews));
        
        return true; // Thành công

    } catch (error) {
        console.error('Lỗi nghiêm trọng khi thêm đánh giá (v4):', error);
        return false;
    }
  };
  // =================================================================
  // ⭐️ KẾT THÚC CHỨC NĂNG MỚI ⭐️
  // =================================================================

  // ⭐️ BẮT ĐẦU: CHỨC NĂNG ADMIN XÓA ĐÁNH GIÁ ⭐️
  const deleteReview = async (reviewId) => {
    // Chỉ admin mới có quyền xóa
    if (!currentUser || currentUser.role !== 'admin') {
      console.error("Hành động bị từ chối: Chỉ admin mới có thể xóa đánh giá.");
      return false;
    }

    try {
      // --- PHẦN 1: XÓA KHỎI DANH SÁCH REVIEW TOÀN CỤC (của Admin) ---
      const storedGlobalReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      let globalReviews = storedGlobalReviews ? JSON.parse(storedGlobalReviews) : [];
      
      const reviewToDelete = globalReviews.find(r => r.id === reviewId);
      if (!reviewToDelete) {
        console.warn("Không tìm thấy đánh giá để xóa trong danh sách toàn cục.");
        // Vẫn tiếp tục để thử xóa trong đơn hàng của user
      }

      const updatedGlobalReviews = globalReviews.filter(r => r.id !== reviewId);
      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(updatedGlobalReviews));

      // --- PHẦN 2: TÌM VÀ XÓA REVIEW TRONG LỊCH SỬ ĐƠN HÀNG CỦA USER ---
      // Cần có orderId và productId từ review đã bị xóa
      if (reviewToDelete && reviewToDelete.orderId && reviewToDelete.productId) {
        const { orderId, productId } = reviewToDelete;
        
        // Tải tất cả đơn hàng của tất cả user
        const storedAllOrders = localStorage.getItem(ALL_ORDERS_KEY);
        const allOrdersData = storedAllOrders ? JSON.parse(storedAllOrders) : {};

        // Duyệt qua tất cả các user để tìm đúng đơn hàng
        for (const userKey in allOrdersData) {
          let userOrders = allOrdersData[userKey];
          
          allOrdersData[userKey] = userOrders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                if (String(item.product.id) === String(productId)) {
                  // Xóa trường 'review' khỏi item
                  delete item.review;
                }
                return item;
              });
              return { ...order, items: updatedItems };
            }
            return order;
          });
        }
        // Lưu lại toàn bộ dữ liệu đơn hàng đã được cập nhật
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      }

      window.dispatchEvent(new Event('reviews_updated')); // Phát tín hiệu cập nhật
      return true;
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi xóa đánh giá:", error);
      return false;
    }
  };
  // =================================================================

  // ⭐️ BẮT ĐẦU: CHỨC NĂNG ADMIN TRẢ LỜI ĐÁNH GIÁ ⭐️
  // Hàm này tìm một đánh giá trong danh sách global và thêm một đối tượng `adminReply` vào đó.
  const addAdminReply = async (reviewId, replyText, adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
        console.error("Chỉ admin mới có thể trả lời đánh giá.");
        return false;
    }

    try {
        const storedAdminReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
        let globalReviews = storedAdminReviews ? JSON.parse(storedAdminReviews) : [];

        let reviewFound = false;
        const updatedReviews = globalReviews.map(review => {
            if (review.id === reviewId) {
                reviewFound = true;
                // ⭐ THAY ĐỔI: Chuyển từ một object sang một mảng các object
                // Khởi tạo mảng nếu chưa có
                if (!Array.isArray(review.adminReplies)) {
                    review.adminReplies = [];
                }
                // Thêm phản hồi mới vào mảng
                review.adminReplies.push({
                    id: `rep_${new Date().getTime()}`, // ⭐️ THÊM: ID duy nhất cho mỗi câu trả lời
                    user: adminUser.username || 'Admin', // Giữ nguyên cấu trúc cũ cho đơn giản
                    comment: replyText,
                    date: new Date().toISOString()
                });
            }
            return review;
        });

        if (!reviewFound) throw new Error("Không tìm thấy đánh giá để trả lời.");

        localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(updatedReviews));

        // ⭐ SỬA LỖI: Phát tín hiệu với tên sự kiện ĐÚNG
        window.dispatchEvent(new Event('reviews_updated')); // Giữ nguyên tên này

        return true;

    } catch (error) {
        console.error("Lỗi khi thêm câu trả lời của admin:", error);
        return false;
    }
  };

  // 5. XÓA MỘT SẢN PHẨM KHỎI ĐƠN HÀNG (CHO MỤC ĐÍCH DỌN DẸP)
  const removeProductFromOrder = async (orderId, productId) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
        console.error("Không thể xóa sản phẩm: người dùng chưa đăng nhập.");
        return false;
    }

    try {
        let orderFound = false;
        const updatedUserOrders = orderHistory.map(order => {
            if (order.id === orderId) {
                orderFound = true;
                // Lọc ra những sản phẩm không bị xóa
                const updatedItems = order.items.filter(
                    item => String(item.product.id) !== String(productId)
                );
                return { ...order, items: updatedItems };
            }
            return order;
        }).filter(order => order.items.length > 0); // Xóa luôn đơn hàng nếu không còn sản phẩm nào

        if (!orderFound) {
            console.warn("Không tìm thấy đơn hàng để xóa sản phẩm.");
            return false;
        }

        // Cập nhật state và localStorage
        setOrderHistory(updatedUserOrders);
        const storedData = localStorage.getItem(ALL_ORDERS_KEY);
        const allOrdersData = storedData ? JSON.parse(storedData) : {};
        allOrdersData[userKey] = updatedUserOrders;
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));

        return true;
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi đơn hàng:', error);
        return false;
    }
  };

  // Tải lại lịch sử khi có sự kiện từ Admin (ví dụ: Admin duyệt đơn)
  useEffect(() => {
    const handleGlobalOrderUpdate = () => {
      console.log("OrderHistoryContext: Nhận được tín hiệu cập nhật, tải lại...");
      loadOrderHistory();
    };

    window.addEventListener('orders_updated_by_admin', handleGlobalOrderUpdate);

    return () => {
      window.removeEventListener('orders_updated_by_admin', handleGlobalOrderUpdate);
    };
  }, [loadOrderHistory]); // Phụ thuộc vào loadOrderHistory

  // ⭐ THÊM MỚI: Lắng nghe sự kiện cập nhật review từ bất kỳ đâu
  useEffect(() => {
    const handleReviewUpdate = () => {
      console.log("OrderHistoryContext: Nhận được tín hiệu 'reviews_updated', tải lại lịch sử đơn hàng...");
      loadOrderHistory();
    };

    window.addEventListener('reviews_updated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviews_updated', handleReviewUpdate);
    };
  }, [loadOrderHistory]); // Phụ thuộc vào hàm loadOrderHistory


  const value = {
    orderHistory,
    loading,
    addOrderToHistory, // VÀ XUẤT RA VỚI TÊN ĐÚNG
    cancelOrder,
    updateOrderStatus,
    addReview, // 👈 Hàm đã được sửa
    addAdminReply, // 👈 THÊM HÀM MỚI
    deleteReview, // 👈 THÊM HÀM MỚI
    removeProductFromOrder, // 👈 THÊM HÀM MỚI
  };

  return (
    <OrderHistoryContext.Provider value={value}>
      {children}
    </OrderHistoryContext.Provider>
  );
};