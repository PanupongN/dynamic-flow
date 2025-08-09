import React, { createContext, useContext, useEffect, useState } from 'react';
import { CompanyTheme, getTheme, generateCSSVariables } from '../themes';

interface ThemeContextValue {
  theme: CompanyTheme;
  themeId: string;
  setTheme: (themeId: string) => void;
  applyTheme: (theme: CompanyTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  customTheme?: CompanyTheme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'default',
  customTheme 
}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState(defaultTheme);
  const [theme, setTheme] = useState<CompanyTheme>(() => 
    customTheme || getTheme(defaultTheme)
  );

  // Apply theme CSS variables to the document
  useEffect(() => {
    const styleElement = document.getElementById('dynamic-theme-vars') || 
      document.createElement('style');
    
    if (!styleElement.id) {
      styleElement.id = 'dynamic-theme-vars';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = generateCSSVariables(theme);
  }, [theme]);

  const handleSetTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
    setTheme(getTheme(newThemeId));
  };

  const applyTheme = (newTheme: CompanyTheme) => {
    setTheme(newTheme);
    setThemeId(newTheme.id);
  };

  const value: ThemeContextValue = {
    theme,
    themeId,
    setTheme: handleSetTheme,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware component wrapper
interface ThemedProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Themed({ children, className = '', style = {} }: ThemedProps) {
  const { theme } = useTheme();
  
  const themedStyle = {
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.background.default,
    color: theme.colors.text.primary,
    ...style
  };

  return (
    <div className={className} style={themedStyle}>
      {children}
    </div>
  );
}

// Utility hook for getting theme-aware styles
export function useThemedStyles() {
  const { theme } = useTheme();

  return {
    // Background styles
    backgroundPrimary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrastText
    },
    backgroundSecondary: {
      backgroundColor: theme.colors.secondary.main,
      color: theme.colors.secondary.contrastText
    },
    backgroundPaper: {
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.primary
    },
    backgroundAccent: {
      backgroundColor: theme.colors.background.accent,
      color: theme.colors.text.primary
    },

    // Button styles
    buttonPrimary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrastText,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.medium,
      fontSize: theme.typography.fontSizes.base,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: theme.shadows.sm
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.colors.primary.main,
      border: `1px solid ${theme.colors.primary.main}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.medium,
      fontSize: theme.typography.fontSizes.base,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },

    // Input styles
    input: {
      backgroundColor: theme.colors.background.paper,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.main}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSizes.base,
      transition: 'border-color 0.2s ease',
      width: '100%'
    },

    // Text styles
    heading: {
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md
    },
    body: {
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.normal,
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSizes.base,
      lineHeight: '1.6'
    },
    caption: {
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.normal,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSizes.sm
    },

    // Card styles
    card: {
      backgroundColor: theme.colors.background.paper,
      border: `1px solid ${theme.colors.border.light}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.md,
      color: theme.colors.text.primary
    }
  };
}