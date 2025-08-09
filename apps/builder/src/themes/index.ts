// Copy of themes from packages/ui for development
// This is a temporary solution until package builds are working properly

export interface ColorPalette {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
    accent: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
}

export interface CompanyTheme {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  typography: {
    fontFamily: string;
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Pre-defined color palettes based on your specifications
export const colorPalettes = {
  // Golden Brown Theme (based on your Pantone colors)
  goldenBrown: {
    primary: {
      main: '#8A6E4B',        // Golden Brown - PMS 873C
      light: '#B68400',       // Golden - PMS 125C
      dark: '#6B5538',        // Darker shade of golden brown
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#7A7F34',        // Olive Green - PMS 7748C
      light: '#9BA355',       // Lighter olive
      dark: '#5A5F28',        // Darker olive
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FDFCFA',     // Off-white with warm undertone
      paper: '#FFFFFF',       // Pure white (60-70% as specified)
      accent: '#FAF7F2'       // Very light golden tint
    },
    text: {
      primary: '#5A656F',     // Dark Grey - PMS 431C
      secondary: '#8C9D9C',   // Light Grey - PMS 443C
      disabled: '#B8C5C4'     // Lighter version of light grey
    },
    border: {
      light: '#E8EBE8',       // Very light grey-green
      main: '#D1D5D3',        // Light border
      dark: '#8C9D9C'         // Light Grey for prominent borders
    }
  },

  // Mustard Yellow Theme
  mustardYellow: {
    primary: {
      main: '#DAA900',        // Mustard Yellow - PMS 110C
      light: '#F4C430',       // Lighter mustard
      dark: '#B8900D',        // Darker mustard
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#8A6E4B',        // Golden Brown as secondary
      light: '#A08560',       // Lighter brown
      dark: '#6B5538',        // Darker brown
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FEFDF9',     // Very light yellow-white
      paper: '#FFFFFF',       // Pure white
      accent: '#FDF8E7'       // Light mustard tint
    },
    text: {
      primary: '#5A656F',     // Dark Grey
      secondary: '#7A7F34',   // Olive Green
      disabled: '#B8C5C4'
    },
    border: {
      light: '#F2EFE0',       // Light mustard border
      main: '#E6D9B8',        // Medium border
      dark: '#DAA900'         // Mustard for emphasis
    }
  },

  // Professional Blue (default)
  professionalBlue: {
    primary: {
      main: '#3B82F6',        // Blue 500
      light: '#60A5FA',       // Blue 400
      dark: '#2563EB',        // Blue 600
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#64748B',        // Slate 500
      light: '#94A3B8',       // Slate 400
      dark: '#475569',        // Slate 600
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8FAFC',     // Slate 50
      paper: '#FFFFFF',       // White
      accent: '#F1F5F9'       // Slate 100
    },
    text: {
      primary: '#0F172A',     // Slate 900
      secondary: '#64748B',   // Slate 500
      disabled: '#CBD5E1'     // Slate 300
    },
    border: {
      light: '#F1F5F9',       // Slate 100
      main: '#E2E8F0',        // Slate 200
      dark: '#CBD5E1'         // Slate 300
    }
  },

  // Nature Green
  natureGreen: {
    primary: {
      main: '#16A34A',        // Green 600
      light: '#22C55E',       // Green 500
      dark: '#15803D',        // Green 700
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#7A7F34',        // Olive Green
      light: '#9BA355',       // Lighter olive
      dark: '#5A5F28',        // Darker olive
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F6FDF7',     // Very light green
      paper: '#FFFFFF',       // White
      accent: '#ECFDF5'       // Green 50
    },
    text: {
      primary: '#14532D',     // Green 900
      secondary: '#16A34A',   // Green 600
      disabled: '#BBF7D0'     // Green 200
    },
    border: {
      light: '#DCFCE7',       // Green 100
      main: '#BBF7D0',        // Green 200
      dark: '#86EFAC'         // Green 300
    }
  }
} satisfies Record<string, ColorPalette>;

// Pre-defined company themes
export const companyThemes: Record<string, CompanyTheme> = {
  default: {
    id: 'default',
    name: 'Professional Blue',
    description: 'Clean and professional theme suitable for business forms',
    colors: colorPalettes.professionalBlue,
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
  },

  goldenBrown: {
    id: 'goldenBrown',
    name: 'Golden Brown',
    description: 'Warm, earthy theme with golden brown and olive accents',
    colors: colorPalettes.goldenBrown,
    typography: {
      fontFamily: 'Georgia, serif',
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(138 110 75 / 0.1)',
      md: '0 4px 6px -1px rgb(138 110 75 / 0.15), 0 2px 4px -2px rgb(138 110 75 / 0.1)',
      lg: '0 10px 15px -3px rgb(138 110 75 / 0.2), 0 4px 6px -4px rgb(138 110 75 / 0.1)'
    }
  },

  mustardYellow: {
    id: 'mustardYellow',
    name: 'Mustard Yellow',
    description: 'Vibrant and energetic theme with mustard yellow highlights',
    colors: colorPalettes.mustardYellow,
    typography: {
      fontFamily: 'Poppins, sans-serif',
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(218 169 0 / 0.1)',
      md: '0 4px 6px -1px rgb(218 169 0 / 0.15), 0 2px 4px -2px rgb(218 169 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(218 169 0 / 0.2), 0 4px 6px -4px rgb(218 169 0 / 0.1)'
    }
  },

  natureGreen: {
    id: 'natureGreen',
    name: 'Nature Green',
    description: 'Fresh and natural theme with green earth tones',
    colors: colorPalettes.natureGreen,
    typography: {
      fontFamily: 'Nunito, sans-serif',
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(22 163 74 / 0.1)',
      md: '0 4px 6px -1px rgb(22 163 74 / 0.15), 0 2px 4px -2px rgb(22 163 74 / 0.1)',
      lg: '0 10px 15px -3px rgb(22 163 74 / 0.2), 0 4px 6px -4px rgb(22 163 74 / 0.1)'
    }
  }
};

// Utility functions
export function getTheme(themeId: string): CompanyTheme {
  return companyThemes[themeId] || companyThemes.default;
}

export function getAllThemes(): CompanyTheme[] {
  const themes = Object.values(companyThemes);
  return themes;
}

export function createCustomTheme(
  id: string,
  name: string,
  description: string,
  colors: ColorPalette,
  overrides?: Partial<Omit<CompanyTheme, 'id' | 'name' | 'description' | 'colors'>>
): CompanyTheme {
  return {
    id,
    name,
    description,
    colors,
    typography: overrides?.typography || companyThemes.default.typography,
    spacing: overrides?.spacing || companyThemes.default.spacing,
    borderRadius: overrides?.borderRadius || companyThemes.default.borderRadius,
    shadows: overrides?.shadows || companyThemes.default.shadows
  };
}

// CSS Variable generator
export function generateCSSVariables(theme: CompanyTheme): string {
  return `
    :root {
      /* Colors */
      --color-primary: ${theme.colors.primary.main};
      --color-primary-light: ${theme.colors.primary.light};
      --color-primary-dark: ${theme.colors.primary.dark};
      --color-primary-contrast: ${theme.colors.primary.contrastText};
      
      --color-secondary: ${theme.colors.secondary.main};
      --color-secondary-light: ${theme.colors.secondary.light};
      --color-secondary-dark: ${theme.colors.secondary.dark};
      --color-secondary-contrast: ${theme.colors.secondary.contrastText};
      
      --color-background: ${theme.colors.background.default};
      --color-background-paper: ${theme.colors.background.paper};
      --color-background-accent: ${theme.colors.background.accent};
      
      --color-text-primary: ${theme.colors.text.primary};
      --color-text-secondary: ${theme.colors.text.secondary};
      --color-text-disabled: ${theme.colors.text.disabled};
      
      --color-border-light: ${theme.colors.border.light};
      --color-border-main: ${theme.colors.border.main};
      --color-border-dark: ${theme.colors.border.dark};
      
      /* Semantic Colors - Default values */
      --color-primary-120: #6E583C;
      --color-primary-100: #8A6E4B;
      --color-primary-60: #B9A893;
      --color-primary-20: #E8E2DB;
      
      --color-warning-120: #CC8925;
      --color-warning-100: #FFAB2E;
      --color-warning-60: #FFCD82;
      
      --color-negative-120: #BC133E;
      --color-negative-100: #EB184E;
      --color-negative-60: #F37495;
      
      --color-information-120: #2E7FBA;
      --color-information-100: #3A9FE8;
      --color-information-60: #89C5F1;
      
      --color-success-120: #1C8A3B;
      --color-success-100: #00BD70;
      --color-success-60: #66D7A9;
      
      /* Neutral Colors */
      --color-white: #FFFFFF;
      --color-black: #000000;
      --color-gray-50: #F9FAFB;
      --color-gray-100: #F3F4F6;
      --color-gray-200: #E5E7EB;
      --color-gray-300: #D1D5DB;
      --color-gray-400: #9CA3AF;
      --color-gray-500: #6B7280;
      --color-gray-600: #4B5563;
      --color-gray-700: #374151;
      --color-gray-800: #1F2937;
      --color-gray-900: #111827;
      
      /* Semantic Aliases */
      --color-error: var(--color-negative-100);
      --color-error-light: var(--color-negative-60);
      --color-success: var(--color-success-100);
      --color-success-light: var(--color-success-60);
      --color-warning: var(--color-warning-100);
      --color-warning-light: var(--color-warning-60);
      --color-info: var(--color-information-100);
      --color-info-light: var(--color-information-60);
      
      /* Typography */
      --font-family: ${theme.typography.fontFamily};
      --font-size-xs: ${theme.typography.fontSizes.xs};
      --font-size-sm: ${theme.typography.fontSizes.sm};
      --font-size-base: ${theme.typography.fontSizes.base};
      --font-size-lg: ${theme.typography.fontSizes.lg};
      --font-size-xl: ${theme.typography.fontSizes.xl};
      --font-size-2xl: ${theme.typography.fontSizes['2xl']};
      --font-size-3xl: ${theme.typography.fontSizes['3xl']};
      
      --font-weight-normal: ${theme.typography.fontWeights.normal};
      --font-weight-medium: ${theme.typography.fontWeights.medium};
      --font-weight-semibold: ${theme.typography.fontWeights.semibold};
      --font-weight-bold: ${theme.typography.fontWeights.bold};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      --spacing-2xl: ${theme.spacing['2xl']};
      
      /* Border Radius */
      --border-radius-sm: ${theme.borderRadius.sm};
      --border-radius-md: ${theme.borderRadius.md};
      --border-radius-lg: ${theme.borderRadius.lg};
      --border-radius-xl: ${theme.borderRadius.xl};
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
    }
  `;
}
