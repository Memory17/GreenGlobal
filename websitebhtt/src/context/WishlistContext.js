import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext'; // <-- Import useAuth

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth(); // <-- Lấy currentUser
  const { t } = useTranslation();

  // Hàm helper lấy key theo user
  const getWishlistKey = (user) => {
    const userId = user ? (user.username || user.email) : 'guest';
    return `wishlist_items_${userId}`;
  };

  const [wishlistItems, setWishlistItems] = useState(() => {
    const key = getWishlistKey(currentUser);
    const savedItems = localStorage.getItem(key);
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // Effect 1: Tải lại wishlist khi user thay đổi
  useEffect(() => {
    const key = getWishlistKey(currentUser);
    const savedItems = localStorage.getItem(key);
    setWishlistItems(savedItems ? JSON.parse(savedItems) : []);
  }, [currentUser]);

  // Effect 2: Lưu wishlist khi thay đổi
  useEffect(() => {
    const key = getWishlistKey(currentUser);
    localStorage.setItem(key, JSON.stringify(wishlistItems));
  }, [wishlistItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      message.info(t('removed_from_wishlist') || 'Đã xóa khỏi danh sách yêu thích');
    } else {
      setWishlistItems((prevItems) => [...prevItems, product]);
      message.success(t('added_to_wishlist') || 'Đã thêm vào danh sách yêu thích');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
