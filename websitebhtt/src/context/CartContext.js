import React, { createContext, useState, useContext, useEffect } from "react";

// --- KEY ĐỂ LƯU TRỮ TRONG LOCALSTORAGE ---
const CART_STORAGE_KEY = 'shopping_cart_items';

// --- HÀM HELPER ĐỂ LẤY GIỎ HÀNG TỪ LOCALSTORAGE ---
const getInitialCartState = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    // Nếu có dữ liệu trong localStorage, parse nó, nếu không, trả về mảng rỗng
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
    // Nếu có lỗi (ví dụ dữ liệu bị hỏng), trả về mảng rỗng để tránh crash
    return [];
  }
};

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo Provider Component
export const CartProvider = ({ children }) => {
  // ⭐ THAY ĐỔI 1: Khởi tạo state từ localStorage thay vì mảng rỗng
  const [cartItems, setCartItems] = useState(getInitialCartState);

  // ⭐ THAY ĐỔI 2: Sử dụng useEffect để lưu vào localStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]); // Hook này sẽ chạy mỗi khi `cartItems` có sự thay đổi
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
