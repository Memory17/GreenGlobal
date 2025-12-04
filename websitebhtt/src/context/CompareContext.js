import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const { t } = useTranslation();
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('compare_items');
    if (storedItems) {
      try {
        setCompareItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Failed to parse compare items from local storage", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compare_items', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product) => {
    if (compareItems.find(item => item.id === product.id)) {
      message.warning(t('product_already_in_compare') || "Sản phẩm đã có trong danh sách so sánh");
      return;
    }
    if (compareItems.length >= 3) {
      message.warning(t('compare_limit_reached') || "Chỉ có thể so sánh tối đa 3 sản phẩm");
      return;
    }
    setCompareItems([...compareItems, product]);
    message.success(t('added_to_compare') || "Đã thêm vào danh sách so sánh");
  };

  const removeFromCompare = (productId) => {
    setCompareItems(compareItems.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
