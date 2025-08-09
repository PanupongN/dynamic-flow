import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '@dynamic-flow/types';

interface ThemeContextType {
  theme: ThemeConfig | null;
  setTheme: (theme: ThemeConfig) => void;
  applyTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  enableWhiteLabel?: boolean;
}

const defaultThemeConfig: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    },
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
  },
  borderRadius: '0.5rem',
};

export function ThemeProvider({ 
  children, 
  defaultTheme = defaultThemeConfig,
  enableWhiteLabel = false 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const applyTheme = (newTheme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', newTheme.colors.primary);
    root.style.setProperty('--color-secondary', newTheme.colors.secondary);
    root.style.setProperty('--color-background', newTheme.colors.background);
    root.style.setProperty('--color-text', newTheme.colors.text);
    root.style.setProperty('--color-border', newTheme.colors.border);
    
    root.style.setProperty('--font-family', newTheme.typography.fontFamily);
    root.style.setProperty('--font-size-small', newTheme.typography.fontSize.small);
    root.style.setProperty('--font-size-medium', newTheme.typography.fontSize.medium);
    root.style.setProperty('--font-size-large', newTheme.typography.fontSize.large);
    
    root.style.setProperty('--spacing-small', newTheme.spacing.small);
    root.style.setProperty('--spacing-medium', newTheme.spacing.medium);
    root.style.setProperty('--spacing-large', newTheme.spacing.large);
    
    root.style.setProperty('--border-radius', newTheme.borderRadius);
    
    // Apply custom CSS if provided
    if (newTheme.customCSS && enableWhiteLabel) {
      let customStyleElement = document.getElementById('dynamic-flow-custom-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'dynamic-flow-custom-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = newTheme.customCSS;
    }
    
    setTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const value = {
    theme,
    setTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className="min-h-screen transition-colors duration-200"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
