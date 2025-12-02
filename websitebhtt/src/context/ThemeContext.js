import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  
  // Initialize state from localStorage to avoid overwriting on initial render
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('app_dark_mode');
    return savedMode === 'true';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('app_accent_color') || '#1890ff';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('app_font_size') || 'medium';
  });

  useEffect(() => {
    // Removed initial localStorage reading since it's done in useState
  }, []);

  useEffect(() => {
    localStorage.setItem('app_dark_mode', isDarkMode);
    
    // Chỉ áp dụng dark mode nếu KHÔNG phải là trang admin
    const isAdminPage = location.pathname.startsWith('/admin');
    
    if (isDarkMode && !isAdminPage) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode, location.pathname]);

  useEffect(() => {
    localStorage.setItem('app_accent_color', accentColor);
    document.documentElement.style.setProperty('--primary-color', accentColor);
    // You might need to update Ant Design theme token here if using ConfigProvider
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('app_font_size', fontSize);
    
    // Áp dụng Zoom cho toàn bộ giao diện
    if (fontSize === 'small') {
      document.body.style.zoom = "90%";
    } else if (fontSize === 'large') {
      document.body.style.zoom = "110%";
    } else {
      document.body.style.zoom = "100%";
    }

    // Cập nhật biến CSS (cho các thành phần dùng rem/em)
    let size = '16px';
    if (fontSize === 'small') size = '14px';
    if (fontSize === 'large') size = '18px';
    document.documentElement.style.setProperty('--base-font-size', size);
  }, [fontSize]);

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode, 
      accentColor, 
      changeAccentColor,
      fontSize,
      changeFontSize
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
