import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'blue' | 'purple' | 'pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';
    setThemeState(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const themeColors = {
  dark: {
    bg: '#0f172a',
    bgDarker: '#0a0e27',
    card: '#1e293b',
    textPrimary: '#e5e7eb',
    textSecondary: '#9ca3af',
    border: '#334155',
  },
  light: {
    bg: '#f8fafc',
    bgDarker: '#f1f5f9',
    card: '#ffffff',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  blue: {
    bg: '#eff6ff',
    bgDarker: '#dbeafe',
    card: '#ffffff',
    textPrimary: '#0c4a6e',
    textSecondary: '#0369a1',
    border: '#bfdbfe',
  },
  purple: {
    bg: '#faf5ff',
    bgDarker: '#f3e8ff',
    card: '#ffffff',
    textPrimary: '#5b21b6',
    textSecondary: '#7c3aed',
    border: '#e9d5ff',
  },
  pink: {
    bg: '#fff7ed',
    bgDarker: '#fee2e2',
    card: '#ffffff',
    textPrimary: '#831843',
    textSecondary: '#be185d',
    border: '#fbcfe8',
  },
};
