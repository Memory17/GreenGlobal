// src/context/OrderHistoryContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; 

const OrderHistoryContext = createContext();

export const useOrderHistory = () => useContext(OrderHistoryContext);

const ALL_ORDERS_KEY = 'allUserOrders'; 

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

  // 1. Tải lịch sử đơn hàng KHI NGƯỜI DÙNG THAY ĐỔI
  useEffect(() => {
    const userKey = getUserKey(currentUser);
    if (userKey) { 
      try {
        const allOrders = JSON.parse(localStorage.getItem(ALL_ORDERS_KEY)) || {};
        const userOrders = allOrders[userKey] || []; 
        setOrderHistory(userOrders);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        setOrderHistory([]);
      }
    } else {
      setOrderHistory([]);
    }
  }, [currentUser]); 

  // =======================================================
  // === BỘ LẮNG NGHE ĐÃ SỬA LỖI (QUAN TRỌNG) ===
  // =======================================================
  useEffect(() => {
    
    // Hàm này sẽ chạy khi Admin phát tín hiệu 'admin_order_status_updated'
    const handleAdminStatusUpdate = (event) => {
        const { orderId, newStatus } = event.detail;
        if (!orderId) return;

        try {
            // 1. Tải TOÀN BỘ đơn hàng của TẤT CẢ user
            const allOrders = JSON.parse(localStorage.getItem(ALL_ORDERS_KEY)) || {};
            let foundUserKey = null;
            let updatedUserOrders = null;

            // 2. Lặp qua từng user (ví dụ: 'luc@local', 'test@gmail.com')
            for (const userKey in allOrders) {
                if (Object.hasOwnProperty.call(allOrders, userKey)) {
                    const userOrders = allOrders[userKey] || [];
                    let orderFound = false;

                    // 3. Tìm đơn hàng có ID khớp trong danh sách của user này
                    const newOrderList = userOrders.map(o => {
                        if (o.id === orderId) {
                            orderFound = true;
                            // Cập nhật trạng thái bằng newStatus (đã chuẩn hóa) từ Admin
                            return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
                        }
                        return o;
                    });

                    // 4. Nếu tìm thấy, lưu lại kết quả và thoát
                    if (orderFound) {
                        foundUserKey = userKey; // user sở hữu đơn hàng này
                        updatedUserOrders = newOrderList; // danh sách đơn hàng mới
                        allOrders[userKey] = newOrderList; // cập nhật vào object tổng
                        break; 
                    }
                }
            }

            // 5. Nếu đã tìm thấy và cập nhật...
            if (foundUserKey) {
                // 6. Lưu toàn bộ object tổng trở lại localStorage
                localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrders));
                console.log(`Context: Đã cập nhật đơn ${orderId} cho user ${foundUserKey} thành ${newStatus}.`);

                // 7. KIỂM TRA: User đang đăng nhập CÓ PHẢI là user vừa được cập nhật?
                const loggedInUserKey = getUserKey(currentUser);
                if (loggedInUserKey === foundUserKey) {
                    // 8. Nếu đúng, cập nhật React state để refresh giao diện
                    setOrderHistory(updatedUserOrders);
                }
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái từ Admin (listener):', error);
        }
    };

    // 9. Đăng ký lắng nghe
    window.addEventListener('admin_order_status_updated', handleAdminStatusUpdate);

    // 10. Dọn dẹp
    return () => {
        window.removeEventListener('admin_order_status_updated', handleAdminStatusUpdate);
    };
  }, [currentUser]); // Phụ thuộc vào currentUser để biết có nên cập nhật state (bước 7-8)
  // =======================================================
  // === KẾT THÚC SỬA LỖI ===
  // =======================================================

  // 2. Hàm để THÊM đơn hàng mới vào lịch sử
  const addOrderToHistory = (newOrderData) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) { 
      console.error('Không thể lưu đơn hàng: Người dùng không hợp lệ hoặc thiếu key (email/username/id).');
      return; 
    }

    const newOrder = {
      ...newOrderData,
      id: `ORDER-${new Date().getTime()}`, 
      orderDate: new Date().toISOString(),
      status: 'Processing', // Mặc định luôn là 'Processing'
    };

    try {
      // --- Phần code LƯU CHO USER ---
      const allOrders = JSON.parse(localStorage.getItem(ALL_ORDERS_KEY)) || {};
      const oldUserOrders = allOrders[userKey] || [];
      const newUserOrders = [newOrder, ...oldUserOrders];
      const updatedAllOrders = {
        ...allOrders,
        [userKey]: newUserOrders, 
      };
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(updatedAllOrders));
      setOrderHistory(newUserOrders);

      // --- Phần code LƯU CHO ADMIN ---
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
            (currentUser?.email || currentUser?.username) || 
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
          status: newOrder.status, // Lưu 'Processing'
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
      } catch (adminError) {
        console.error("Lỗi khi đồng bộ đơn hàng sang cho Admin:", adminError);
      }
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng mới (cho user):", error);
    }
  };

  // 3. Hàm để CẬP NHẬT trạng thái đơn hàng (ví dụ: User tự hủy đơn)
  const updateOrderStatus = (orderId, newStatus) => {
    const userKey = getUserKey(currentUser);
    if (!userKey) {
      console.error('Không thể cập nhật đơn hàng: Người dùng không hợp lệ hoặc thiếu key.');
      return false;
    }

    try {
      // Cập nhật cho User
      const allOrders = JSON.parse(localStorage.getItem(ALL_ORDERS_KEY)) || {};
      const userOrders = allOrders[userKey] || [];
      const updatedUserOrders = userOrders.map((o) => {
        if (o.id === orderId) {
          // newStatus ở đây sẽ là 'Cancelled' (đã chuẩn hóa)
          return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return o;
      });
      const updatedAllOrders = { ...allOrders, [userKey]: updatedUserOrders };
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(updatedAllOrders));
      setOrderHistory(updatedUserOrders);

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

  const value = {
    orderHistory,     
    addOrderToHistory,   
    updateOrderStatus,
    cancelOrder,
  };

  return (
    <OrderHistoryContext.Provider value={value}>{children}</OrderHistoryContext.Provider>
  );
};