import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    return saved || 'system';
  });

  const applyTheme = useCallback((targetTheme) => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Determine the actual mode to apply
    let actualMode = targetTheme;
    if (targetTheme === 'system') {
      actualMode = mediaQuery.matches ? 'dark' : 'light';
    }

    // Apply classes
    root.classList.remove('light', 'dark');
    root.classList.add(actualMode);
    
    // Optional: Also set data-theme attribute
    root.setAttribute('data-theme', actualMode);
  }, []);

  useEffect(() => {
    applyTheme(theme);

    // Watch for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, applyTheme]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
     throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
