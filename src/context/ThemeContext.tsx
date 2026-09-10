/**
 * Theme Context for Niche Research Department
 * Provides light/dark theme state with CSS variable bindings and persistence.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { electronBridge } from '../services/electronBridge';
import type { ThemeMode } from '../types/electron';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load persisted theme on startup
  useEffect(() => {
    async function loadTheme() {
      try {
        const settings = await electronBridge.database.getSettings();
        if (settings && (settings.theme === 'light' || settings.theme === 'dark')) {
          setThemeState(settings.theme);
        }
      } catch (err) {
        console.error('Failed to load theme setting:', err);
      } finally {
        setInitialized(true);
      }
    }
    loadTheme();
  }, []);

  // Synchronize CSS class and document properties
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    if (initialized) {
      electronBridge.database.saveSetting('theme', theme).catch(err => {
        console.error('Failed to persist theme:', err);
      });
    }
  }, [theme, initialized]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
