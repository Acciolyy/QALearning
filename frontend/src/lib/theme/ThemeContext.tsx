'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'qalearning-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light') {
        setIsDarkMode(false);
        document.documentElement.setAttribute('data-mode', 'light');
      } else if (saved === 'dark') {
        setIsDarkMode(true);
        document.documentElement.setAttribute('data-mode', 'dark');
      } else {
        const currentAttr = document.documentElement.getAttribute('data-mode');
        if (currentAttr === 'light') {
          setIsDarkMode(false);
        } else {
          document.documentElement.setAttribute('data-mode', 'dark');
        }
      }
    } catch (e) {
      // Ignora erro de acesso a localStorage em ambientes restritos
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      const mode: ThemeMode = next ? 'dark' : 'light';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (e) {
        // Ignora erro de acesso a localStorage
      }
      document.documentElement.setAttribute('data-mode', mode);
      return next;
    });
  };

  const setTheme = (mode: ThemeMode) => {
    setIsDarkMode(mode === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      // Ignora erro de acesso a localStorage
    }
    document.documentElement.setAttribute('data-mode', mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme: isDarkMode ? 'dark' : 'light',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
