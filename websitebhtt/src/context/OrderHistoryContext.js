// src/context/OrderHistoryContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const OrderHistoryContext = createContext();

export const useOrderHistory = () => useContext(OrderHistoryContext);

const ALL_ORDERS_KEY = 'allUserOrders';
const GLOBAL_REVIEWS_KEY = 'app_reviews_v1';

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
      const storedUserData = localStorage.getItem(ALL_ORDERS_KEY);
      const allUserOrdersData = storedUserData ? JSON.parse(storedUserData) : {};
      const userOrders = allUserOrdersData[userKey] || [];

      const storedAdminData = localStorage.getItem('app_orders_v1');
      const adminOrders = storedAdminData ? JSON.parse(storedAdminData) : [];

      if (!userOrders.length) {
        setOrderHistory([]);
        return;
      }

      let hasChanges = false;
      const syncedUserOrders = userOrders.map(userOrder => {
        const matchingAdminOrder = adminOrders.find(
          adminOrder => adminOrder.id === userOrder.id || adminOrder.key === userOrder.id
        );

        if (matchingAdminOrder && matchingAdminOrder.status !== userOrder.status) {
          hasChanges = true;
          return { ...userOrder, status: matchingAdminOrder.status };
        }

        return userOrder;
      });

      if (hasChanges) {
        allUserOrdersData[userKey] = syncedUserOrders;
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allUserOrdersData));
      }

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
  }, [loadOrderHistory]);

  // 2. Thêm đơn hàng mới
  const addOrderToHistory = (itemsToOrder, totals, delivery) => {
    let activeUser = null;
    try {
      const storedUser = localStorage.getItem("userData");
      activeUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Lỗi khi đọc user từ localStorage trong addOrderToHistory", e);
    }

    const userKey = getUserKey(activeUser);

    if (!userKey || !activeUser) {
      console.error('Không thể lưu đơn hàng: Người dùng không hợp lệ hoặc thiếu key (email/username/id).');
      return;
    }

    const newOrder = {
      items: itemsToOrder,
      totals: totals,
      delivery: delivery,
      id: `ORDER-${new Date().getTime()}`,
      orderDate: new Date().toISOString(),
      status: 'Processing',
    };

    try {
      // PHẦN 1: LƯU CHO USER
      const storedData = localStorage.getItem(ALL_ORDERS_KEY);
      const allOrdersData = storedData ? JSON.parse(storedData) : {};
      const userOrders = allOrdersData[userKey] || [];
      const updatedUserOrders = [newOrder, ...userOrders];
      allOrdersData[userKey] = updatedUserOrders;
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      setOrderHistory(updatedUserOrders);

      // PHẦN 2: ĐỒ DỊ CHO ADMIN
      try {
        const ADMIN_ORDERS_KEY = 'app_orders_v1';

        const adminItems = newOrder.items.map(item => ({
          title: item.product.title,
          thumbnail: item.product.thumbnail,
          price: item.product.price,
          quantity: item.quantity,
        }));

        const customerName =
          newOrder.delivery?.name ||
          (activeUser?.email || activeUser?.username) ||
          'Khách Lẻ';

        const adminOrder = {
          id: newOrder.id,
          key: newOrder.id,
          items: adminItems,
          totals: {
            total: newOrder.totals.total,
          },
          customer: {
            name: customerName,
            email: newOrder.delivery?.email,
            phone: newOrder.delivery?.phone,
          },
          status: newOrder.status,
          createdAt: newOrder.orderDate,
        };

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

        const updatedGlobalOrders = [adminOrder, ...globalOrders];
        localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(updatedGlobalOrders));
        window.dispatchEvent(new Event('orders_updated'));

        // Tạo thông báo cho Admin
        try {
          const NOTIFICATIONS_KEY = 'app_order_notifications_v1';
          const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
          const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];

          const hasItems = newOrder.items && newOrder.items.length > 0;
          const firstItem = hasItems ? newOrder.items[0] : {};
          const productDetails = firstItem.product || {};

          const safeProductImage = productDetails.thumbnail || productDetails.image || null;
          const safeProductName = productDetails.title || productDetails.name || 'Sản phẩm';
          const safeUserAvatar = activeUser?.image || newOrder.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${customerName}&backgroundColor=1890ff`;

          const newNotification = {
            id: `noti_${newOrder.id}_${Date.now()}`,
            orderId: newOrder.id,
            customerName: customerName,
            total: newOrder.totals?.total || 0,
            date: newOrder.orderDate || new Date().toISOString(),
            read: false,
            details: {
              userAvatar: safeUserAvatar,
              productImage: safeProductImage,
              productName: safeProductName,
              otherItemsCount: hasItems ? newOrder.items.length - 1 : 0
            }
          };

          console.log("Đang tạo thông báo mới:", newNotification);
          notifications.unshift(newNotification);
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
          window.dispatchEvent(new Event('orders_updated'));

        } catch (notificationError) {
          console.error("Lỗi khi tạo thông báo đơn hàng:", notificationError);
        }

      } catch (adminError) {
        console.error("Lỗi khi đồng bộ đơn hàng sang cho Admin:", adminError, "Dữ liệu đơn hàng:", newOrder);
      }

    } catch (error) {
      console.error('Lỗi khi thêm đơn hàng mới:', error);
    }
  };

  // 3. Cập nhật trạng thái đơn hàng
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

      allOrdersData[userKey] = updatedUserOrders;
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      setOrderHistory(updatedUserOrders);

      // Cập nhật cho Admin
      try {
        const ADMIN_ORDERS_KEY = 'app_orders_v1';
        const storedAdminOrders = localStorage.getItem(ADMIN_ORDERS_KEY);
        let globalOrders = storedAdminOrders ? JSON.parse(storedAdminOrders) : [];
        if (Array.isArray(globalOrders)) {
          let orderFound = false;
          const updatedGlobalOrders = globalOrders.map(order => {
            if (order.id === orderId || order.key === orderId) {
              orderFound = true;
              return { ...order, status: newStatus };
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

  // 4. Hủy đơn hàng
  const cancelOrder = (orderId) => updateOrderStatus(orderId, 'Cancelled');

  // 5. Thêm đánh giá
  const addReview = async (orderId, productId, reviewData) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
      console.error("Không thể thêm đánh giá: người dùng chưa đăng nhập.");
      return false;
    }

    try {
      let orderFound = false;
      let productFound = false;
      let reviewedProductTitle = '';
      let reviewedProductImage = '';

      const updatedUserOrders = orderHistory.map(order => {
        if (order.id === orderId) {
          orderFound = true;

          if (!order.items || typeof order.items.map !== 'function') {
            console.error("Lỗi dữ liệu: Đơn hàng tìm thấy nhưng không có 'items' array.", order);
            return order;
          }

          const updatedItems = order.items.map(item => {
            if (String(item.product.id) === String(productId)) {
              productFound = true;
              reviewedProductTitle = item.product.title;
              reviewedProductImage = item.product.thumbnail;
              item.review = {
                rating: reviewData.rating,
                comment: reviewData.comment,
                date: new Date().toISOString()
              };
            }
            return item;
          });

          return { ...order, items: updatedItems };
        }
        return order;
      });

      if (!orderFound || !productFound) {
        console.error("Lỗi: Không tìm thấy đơn hàng hoặc sản phẩm để đánh giá.", { orderFound, productFound, checkingProductId: productId });
        if (!productFound) return false;
      }

      setOrderHistory(updatedUserOrders);

      const storedData = localStorage.getItem(ALL_ORDERS_KEY);
      const allOrdersData = storedData ? JSON.parse(storedData) : {};
      allOrdersData[userKey] = updatedUserOrders;
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));

      // Thông báo cho Admin
      const storedAdminReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      const globalReviews = storedAdminReviews ? JSON.parse(storedAdminReviews) : [];

      const adminReview = {
        id: `rev_${new Date().getTime()}`,
        user: currentUser.username || currentUser.email,
        userAvatar: currentUser.image || null,
        productTitle: reviewedProductTitle,
        productImage: reviewedProductImage,
        productId: productId,
        orderId: orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: new Date().toISOString(),
        read: false
      };

      globalReviews.unshift(adminReview);
      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(globalReviews));

      return true;

    } catch (error) {
      console.error('Lỗi nghiêm trọng khi thêm đánh giá:', error);
      return false;
    }
  };

  // 6. Xóa đánh giá
  const deleteReview = async (reviewId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      console.error("Hành động bị từ chối: Chỉ admin mới có thể xóa đánh giá.");
      return false;
    }

    try {
      const storedGlobalReviews = localStorage.getItem(GLOBAL_REVIEWS_KEY);
      let globalReviews = storedGlobalReviews ? JSON.parse(storedGlobalReviews) : [];

      const reviewToDelete = globalReviews.find(r => r.id === reviewId);
      if (!reviewToDelete) {
        console.warn("Không tìm thấy đánh giá để xóa trong danh sách toàn cục.");
      }

      const updatedGlobalReviews = globalReviews.filter(r => r.id !== reviewId);
      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(updatedGlobalReviews));

      if (reviewToDelete && reviewToDelete.orderId && reviewToDelete.productId) {
        const { orderId, productId } = reviewToDelete;

        const storedAllOrders = localStorage.getItem(ALL_ORDERS_KEY);
        const allOrdersData = storedAllOrders ? JSON.parse(storedAllOrders) : {};

        for (const userKey in allOrdersData) {
          let userOrders = allOrdersData[userKey];

          allOrdersData[userKey] = userOrders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                if (String(item.product.id) === String(productId)) {
                  delete item.review;
                }
                return item;
              });
              return { ...order, items: updatedItems };
            }
            return order;
          });
        }
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrdersData));
      }

      window.dispatchEvent(new Event('reviews_updated'));
      return true;
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi xóa đánh giá:", error);
      return false;
    }
  };

  // 7. Admin trả lời đánh giá
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
          if (!Array.isArray(review.adminReplies)) {
            review.adminReplies = [];
          }
          review.adminReplies.push({
            id: `rep_${new Date().getTime()}`,
            user: adminUser.username || 'Admin',
            comment: replyText,
            date: new Date().toISOString()
          });
        }
        return review;
      });

      if (!reviewFound) throw new Error("Không tìm thấy đánh giá để trả lời.");

      localStorage.setItem(GLOBAL_REVIEWS_KEY, JSON.stringify(updatedReviews));
      window.dispatchEvent(new Event('reviews_updated'));

      return true;

    } catch (error) {
      console.error("Lỗi khi thêm câu trả lời của admin:", error);
      return false;
    }
  };

  // 8. Xóa sản phẩm khỏi đơn hàng
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
          const updatedItems = order.items.filter(
            item => String(item.product.id) !== String(productId)
          );
          return { ...order, items: updatedItems };
        }
        return order;
      }).filter(order => order.items.length > 0);

      if (!orderFound) {
        console.warn("Không tìm thấy đơn hàng để xóa sản phẩm.");
        return false;
      }

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

  // Lắng nghe sự kiện cập nhật từ Admin
  useEffect(() => {
    const handleGlobalOrderUpdate = () => {
      console.log("OrderHistoryContext: Nhận được tín hiệu cập nhật, tải lại...");
      loadOrderHistory();
    };

    window.addEventListener('orders_updated_by_admin', handleGlobalOrderUpdate);

    return () => {
      window.removeEventListener('orders_updated_by_admin', handleGlobalOrderUpdate);
    };
  }, [loadOrderHistory]);

  // Lắng nghe sự kiện cập nhật review
  useEffect(() => {
    const handleReviewUpdate = () => {
      console.log("OrderHistoryContext: Nhận được tín hiệu 'reviews_updated', tải lại lịch sử đơn hàng...");
      loadOrderHistory();
    };

    window.addEventListener('reviews_updated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviews_updated', handleReviewUpdate);
    };
  }, [loadOrderHistory]);

  const value = {
    orderHistory,
    loading,
    addOrderToHistory,
    cancelOrder,
    updateOrderStatus,
    addReview,
    addAdminReply,
    deleteReview,
    removeProductFromOrder,
  };

  return (
    <OrderHistoryContext.Provider value={value}>
      {children}
    </OrderHistoryContext.Provider>
  );
};