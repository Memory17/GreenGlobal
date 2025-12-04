import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext"; // <-- Import useAuth

// --- KEY ĐỂ LƯU TRỮ TRONG LOCALSTORAGE ---
// const CART_STORAGE_KEY = 'shopping_cart_items'; // <-- BỎ KEY TĨNH

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo Provider Component
export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth(); // <-- Lấy currentUser

  // Hàm helper lấy key theo user
  const getCartKey = (user) => {
    const userId = user ? (user.username || user.email) : 'guest';
    return `shopping_cart_items_${userId}`;
  };

  // Khởi tạo state
  const [cartItems, setCartItems] = useState(() => {
    const key = getCartKey(currentUser);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  // Effect 1: Tải lại giỏ hàng khi user thay đổi
  useEffect(() => {
    const key = getCartKey(currentUser);
    const stored = localStorage.getItem(key);
    setCartItems(stored ? JSON.parse(stored) : []);
  }, [currentUser]);

  // Effect 2: Lưu giỏ hàng khi cartItems thay đổi
  // LƯU Ý: Không thêm currentUser vào dependency để tránh lưu đè dữ liệu cũ sang user mới khi chuyển đổi
  useEffect(() => {
    const key = getCartKey(currentUser);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems]); // eslint-disable-line react-hooks/exhaustive-deps
  // Hàm thêm sản phẩm vào giỏ (hỗ trợ quantity tuỳ chọn)
  const addToCart = (product, qty = 1) => {
    const quantityToAdd = Math.max(1, Number(qty) || 1);
    setCartItems((prevItems) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Nếu đã có, tăng số lượng lên 'quantityToAdd'
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        // Nếu chưa có, thêm vào giỏ với số lượng là quantityToAdd
        return [...prevItems, { product: product, quantity: quantityToAdd }];
      }
    });
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  // Hàm cập nhật số lượng
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // Nếu số lượng < 1, xóa luôn sản phẩm
      removeFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  // Hàm xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart, // <-- Xuất hàm này ra
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Tạo custom hook để dễ dàng sử dụng context
export const useCart = () => {
  return useContext(CartContext);
};
