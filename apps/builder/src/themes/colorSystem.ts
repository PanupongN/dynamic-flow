// Advanced Color System with Accessibility Compliance
// Based on WCAG 2.1 guidelines for AA and AAA compliance

export interface ColorVariation {
  name: string;
  percentage: number; // Darker (-) or Lighter (+) percentage from base
  hex: string;
  rgba: [number, number, number, number];
  contrastRatio?: number;
  accessibilityLevel?: 'AA' | 'AAA' | 'Fail';
}

export interface SemanticColor {
  name: string;
  purpose: string;
  baseColor: ColorVariation;
  variations: {
    120: ColorVariation; // 20% darker
    100: ColorVariation; // base color (0%)
    60: ColorVariation;  // 40% lighter
    20?: ColorVariation; // 80% lighter (if applicable)
  };
  mostUsed: '120' | '100' | '60' | '20';
  accessibilityNotes?: string;
}

// Color manipulation utilities
export class ColorUtils {
  static hexToRgba(hex: string, alpha: number = 1): [number, number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) throw new Error('Invalid hex color');
    
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      alpha
    ];
  }

  static rgbaToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static adjustBrightness(hex: string, percentage: number): string {
    const [r, g, b] = this.hexToRgba(hex);
    
    const adjust = (color: number) => {
      if (percentage > 0) {
        // Lighter: move towards white
        return Math.round(color + (255 - color) * (percentage / 100));
      } else {
        // Darker: move towards black
        return Math.round(color * (1 + percentage / 100));
      }
    };

    const newR = Math.max(0, Math.min(255, adjust(r)));
    const newG = Math.max(0, Math.min(255, adjust(g)));
    const newB = Math.max(0, Math.min(255, adjust(b)));

    return this.rgbaToHex(newR, newG, newB);
  }

  static getRelativeLuminance(hex: string): number {
    const [r, g, b] = this.hexToRgba(hex);
    
    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  static getAccessibilityLevel(contrastRatio: number, isLargeText: boolean = false): 'AA' | 'AAA' | 'Fail' {
    if (isLargeText) {
      if (contrastRatio >= 4.5) return 'AAA';
      if (contrastRatio >= 3) return 'AA';
    } else {
      if (contrastRatio >= 7) return 'AAA';
      if (contrastRatio >= 4.5) return 'AA';
    }
    return 'Fail';
  }

  static generateColorVariations(baseHex: string, baseName: string): SemanticColor['variations'] {
    const base = this.hexToRgba(baseHex);
    
    return {
      120: {
        name: `${baseName}-120`,
        percentage: -20,
        hex: this.adjustBrightness(baseHex, -20),
        rgba: this.hexToRgba(this.adjustBrightness(baseHex, -20)),
        contrastRatio: this.getContrastRatio(this.adjustBrightness(baseHex, -20), '#FFFFFF'),
        accessibilityLevel: this.getAccessibilityLevel(this.getContrastRatio(this.adjustBrightness(baseHex, -20), '#FFFFFF'))
      },
      100: {
        name: `${baseName}-100`,
        percentage: 0,
        hex: baseHex,
        rgba: base,
        contrastRatio: this.getContrastRatio(baseHex, '#FFFFFF'),
        accessibilityLevel: this.getAccessibilityLevel(this.getContrastRatio(baseHex, '#FFFFFF'))
      },
      60: {
        name: `${baseName}-60`,
        percentage: 40,
        hex: this.adjustBrightness(baseHex, 40),
        rgba: this.hexToRgba(this.adjustBrightness(baseHex, 40)),
        contrastRatio: this.getContrastRatio(this.adjustBrightness(baseHex, 40), '#FFFFFF'),
        accessibilityLevel: this.getAccessibilityLevel(this.getContrastRatio(this.adjustBrightness(baseHex, 40), '#FFFFFF'))
      },
      20: {
        name: `${baseName}-20`,
        percentage: 80,
        hex: this.adjustBrightness(baseHex, 80),
        rgba: this.hexToRgba(this.adjustBrightness(baseHex, 80)),
        contrastRatio: this.getContrastRatio(this.adjustBrightness(baseHex, 80), '#000000'),
        accessibilityLevel: this.getAccessibilityLevel(this.getContrastRatio(this.adjustBrightness(baseHex, 80), '#000000'))
      }
    };
  }
}

// Pre-defined semantic color system based on your specifications
export const semanticColors: Record<string, SemanticColor> = {
  primary: {
    name: 'Primary',
    purpose: 'Brand color, main actions, primary buttons',
    baseColor: {
      name: 'primary-100',
      percentage: 0,
      hex: '#8A6E4B',
      rgba: [138, 110, 75, 1],
      contrastRatio: 6.72,
      accessibilityLevel: 'AA'
    },
    variations: {
      120: {
        name: 'primary-120',
        percentage: -20,
        hex: '#6E583C',
        rgba: [110, 88, 60, 1],
        contrastRatio: 6.72,
        accessibilityLevel: 'AA'
      },
      100: {
        name: 'primary-100',
        percentage: 0,
        hex: '#8A6E4B',
        rgba: [138, 110, 75, 1],
        contrastRatio: 4.75,
        accessibilityLevel: 'AA'
      },
      60: {
        name: 'primary-60',
        percentage: 40,
        hex: '#B9A893',
        rgba: [185, 168, 147, 1],
        contrastRatio: 2.1,
        accessibilityLevel: 'Fail'
      },
      20: {
        name: 'primary-20',
        percentage: 80,
        hex: '#E8E2DB',
        rgba: [232, 226, 219, 1],
        contrastRatio: 1.2,
        accessibilityLevel: 'Fail'
      }
    },
    mostUsed: '100',
    accessibilityNotes: 'Use 120 or 100 for text on light backgrounds. 60 and 20 for backgrounds only.'
  },

  warning: {
    name: 'Warning',
    purpose: 'Warnings, alerts, caution states',
    baseColor: {
      name: 'warning-100',
      percentage: 0,
      hex: '#FFAB2E',
      rgba: [255, 171, 46, 1],
      contrastRatio: 2.92,
      accessibilityLevel: 'Fail'
    },
    variations: {
      120: {
        name: 'warning-120',
        percentage: -20,
        hex: '#CC8925',
        rgba: [204, 137, 37, 1],
        contrastRatio: 1.88,
        accessibilityLevel: 'Fail'
      },
      100: {
        name: 'warning-100',
        percentage: 0,
        hex: '#FFAB2E',
        rgba: [255, 171, 46, 1],
        contrastRatio: 2.92,
        accessibilityLevel: 'Fail'
      },
      60: {
        name: 'warning-60',
        percentage: 40,
        hex: '#FFCD82',
        rgba: [255, 205, 130, 1],
        contrastRatio: 1.5,
        accessibilityLevel: 'Fail'
      }
    },
    mostUsed: '100',
    accessibilityNotes: 'Warning colors have low contrast. Use with dark text or as background with high contrast content.'
  },

  negative: {
    name: 'Negative',
    purpose: 'Errors, destructive actions, danger states',
    baseColor: {
      name: 'negative-100',
      percentage: 0,
      hex: '#EB184E',
      rgba: [235, 24, 78, 1],
      contrastRatio: 6.36,
      accessibilityLevel: 'AA'
    },
    variations: {
      120: {
        name: 'negative-120',
        percentage: -20,
        hex: '#BC133E',
        rgba: [188, 19, 62, 1],
        contrastRatio: 4.39,
        accessibilityLevel: 'AA'
      },
      100: {
        name: 'negative-100',
        percentage: 0,
        hex: '#EB184E',
        rgba: [235, 24, 78, 1],
        contrastRatio: 6.36,
        accessibilityLevel: 'AA'
      },
      60: {
        name: 'negative-60',
        percentage: 40,
        hex: '#F37495',
        rgba: [243, 116, 149, 1],
        contrastRatio: 3.2,
        accessibilityLevel: 'Fail'
      }
    },
    mostUsed: '100',
    accessibilityNotes: 'Use 120 or 100 for text. 60 for backgrounds or non-critical elements.'
  },

  information: {
    name: 'Information',
    purpose: 'Informational content, help text, neutral actions',
    baseColor: {
      name: 'information-100',
      percentage: 0,
      hex: '#3A9FE8',
      rgba: [58, 159, 232, 1],
      contrastRatio: 4.32,
      accessibilityLevel: 'AA'
    },
    variations: {
      120: {
        name: 'information-120',
        percentage: -20,
        hex: '#2E7FBA',
        rgba: [46, 127, 186, 1],
        contrastRatio: 2.87,
        accessibilityLevel: 'Fail'
      },
      100: {
        name: 'information-100',
        percentage: 0,
        hex: '#3A9FE8',
        rgba: [58, 159, 232, 1],
        contrastRatio: 4.32,
        accessibilityLevel: 'AA'
      },
      60: {
        name: 'information-60',
        percentage: 40,
        hex: '#89C5F1',
        rgba: [137, 197, 241, 1],
        contrastRatio: 2.1,
        accessibilityLevel: 'Fail'
      }
    },
    mostUsed: '100',
    accessibilityNotes: 'Use 100 for text on light backgrounds. 60 for subtle backgrounds.'
  },

  success: {
    name: 'Success',
    purpose: 'Success states, confirmations, positive feedback',
    baseColor: {
      name: 'success-100',
      percentage: 0,
      hex: '#00BD70',
      rgba: [0, 189, 112, 1],
      contrastRatio: 3.41,
      accessibilityLevel: 'AA'
    },
    variations: {
      120: {
        name: 'success-120',
        percentage: -20,
        hex: '#1C8A3B',
        rgba: [28, 138, 59, 1],
        contrastRatio: 2.46,
        accessibilityLevel: 'Fail'
      },
      100: {
        name: 'success-100',
        percentage: 0,
        hex: '#00BD70',
        rgba: [0, 189, 112, 1],
        contrastRatio: 3.41,
        accessibilityLevel: 'AA'
      },
      60: {
        name: 'success-60',
        percentage: 40,
        hex: '#66D7A9',
        rgba: [102, 215, 169, 1],
        contrastRatio: 1.8,
        accessibilityLevel: 'Fail'
      }
    },
    mostUsed: '100',
    accessibilityNotes: 'Use 100 for success messages and confirmations. 120 and 60 for backgrounds or non-critical elements.'
  }
};

// Neutral colors for backgrounds and text
export const neutralColors = {
  white: { hex: '#FFFFFF', rgba: [255, 255, 255, 1] },
  gray: {
    50: { hex: '#F9FAFB', rgba: [249, 250, 251, 1] },
    100: { hex: '#F3F4F6', rgba: [243, 244, 246, 1] },
    200: { hex: '#E5E7EB', rgba: [229, 231, 235, 1] },
    300: { hex: '#D1D5DB', rgba: [209, 213, 219, 1] },
    400: { hex: '#9CA3AF', rgba: [156, 163, 175, 1] },
    500: { hex: '#6B7280', rgba: [107, 114, 128, 1] },
    600: { hex: '#4B5563', rgba: [75, 85, 99, 1] },
    700: { hex: '#374151', rgba: [55, 65, 81, 1] },
    800: { hex: '#1F2937', rgba: [31, 41, 55, 1] },
    900: { hex: '#111827', rgba: [17, 24, 39, 1] }
  },
  black: { hex: '#000000', rgba: [0, 0, 0, 1] }
};

// Advanced theme configuration
export interface AdvancedThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: SemanticColor;
    warning: SemanticColor;
    negative: SemanticColor;
    information: SemanticColor;
    success: SemanticColor;
    neutral: typeof neutralColors;
  };
  typography: {
    fontFamily: string;
  };
  accessibility: {
    aaCompliance: boolean;
    aaaCompliance: boolean;
    minContrastRatio: number;
  };
}

// Function to create advanced theme from base colors
export function createAdvancedTheme(
  id: string,
  name: string,
  primaryHex: string,
  warningHex?: string,
  negativeHex?: string,
  informationHex?: string,
  successHex?: string,
  fontFamily?: string
): AdvancedThemeConfig {
  return {
    id,
    name,
    description: `Advanced theme with ${name} color palette`,
    colors: {
      primary: {
        ...semanticColors.primary,
        variations: ColorUtils.generateColorVariations(primaryHex, 'primary'),
        baseColor: {
          name: 'primary-100',
          percentage: 0,
          hex: primaryHex,
          rgba: ColorUtils.hexToRgba(primaryHex),
          contrastRatio: ColorUtils.getContrastRatio(primaryHex, '#FFFFFF'),
          accessibilityLevel: ColorUtils.getAccessibilityLevel(ColorUtils.getContrastRatio(primaryHex, '#FFFFFF'))
        }
      },
      warning: warningHex ? {
        ...semanticColors.warning,
        variations: ColorUtils.generateColorVariations(warningHex, 'warning'),
        baseColor: {
          name: 'warning-100',
          percentage: 0,
          hex: warningHex,
          rgba: ColorUtils.hexToRgba(warningHex),
          contrastRatio: ColorUtils.getContrastRatio(warningHex, '#FFFFFF'),
          accessibilityLevel: ColorUtils.getAccessibilityLevel(ColorUtils.getContrastRatio(warningHex, '#FFFFFF'))
        }
      } : semanticColors.warning,
      negative: negativeHex ? {
        ...semanticColors.negative,
        variations: ColorUtils.generateColorVariations(negativeHex, 'negative'),
        baseColor: {
          name: 'negative-100',
          percentage: 0,
          hex: negativeHex,
          rgba: ColorUtils.hexToRgba(negativeHex),
          contrastRatio: ColorUtils.getContrastRatio(negativeHex, '#FFFFFF'),
          accessibilityLevel: ColorUtils.getAccessibilityLevel(ColorUtils.getContrastRatio(negativeHex, '#FFFFFF'))
        }
      } : semanticColors.negative,
      information: informationHex ? {
        ...semanticColors.information,
        variations: ColorUtils.generateColorVariations(informationHex, 'information'),
        baseColor: {
          name: 'information-100',
          percentage: 0,
          hex: informationHex,
          rgba: ColorUtils.hexToRgba(informationHex),
          contrastRatio: ColorUtils.getContrastRatio(informationHex, '#FFFFFF'),
          accessibilityLevel: ColorUtils.getAccessibilityLevel(ColorUtils.getContrastRatio(informationHex, '#FFFFFF'))
        }
      } : semanticColors.information,
      success: successHex ? {
        ...semanticColors.success,
        variations: ColorUtils.generateColorVariations(successHex, 'success'),
        baseColor: {
          name: 'success-100',
          percentage: 0,
          hex: successHex,
          rgba: ColorUtils.hexToRgba(successHex),
          contrastRatio: ColorUtils.getContrastRatio(successHex, '#FFFFFF'),
          accessibilityLevel: ColorUtils.getAccessibilityLevel(ColorUtils.getContrastRatio(successHex, '#FFFFFF'))
        }
      } : semanticColors.success,
      neutral: neutralColors
    },
    typography: {
      fontFamily: fontFamily || 'Inter, system-ui, sans-serif'
    },
    accessibility: {
      aaCompliance: ColorUtils.getContrastRatio(primaryHex, '#FFFFFF') >= 4.5,
      aaaCompliance: ColorUtils.getContrastRatio(primaryHex, '#FFFFFF') >= 7,
      minContrastRatio: ColorUtils.getContrastRatio(primaryHex, '#FFFFFF')
    }
  };
}

// Generate CSS variables for advanced theme
export function generateAdvancedCSSVariables(theme: AdvancedThemeConfig): string {
  const { colors } = theme;
  
  return `
    :root {
      /* Primary Color System */
      --color-primary-120: ${colors.primary.variations[120].hex};
      --color-primary-100: ${colors.primary.variations[100].hex};
      --color-primary-60: ${colors.primary.variations[60].hex};
      --color-primary-20: ${colors.primary.variations[20]?.hex || colors.primary.variations[60].hex};
      
      /* Warning Color System */
      --color-warning-120: ${colors.warning.variations[120].hex};
      --color-warning-100: ${colors.warning.variations[100].hex};
      --color-warning-60: ${colors.warning.variations[60].hex};
      
      /* Negative Color System */
      --color-negative-120: ${colors.negative.variations[120].hex};
      --color-negative-100: ${colors.negative.variations[100].hex};
      --color-negative-60: ${colors.negative.variations[60].hex};
      
      /* Information Color System */
      --color-information-120: ${colors.information.variations[120].hex};
      --color-information-100: ${colors.information.variations[100].hex};
      --color-information-60: ${colors.information.variations[60].hex};
      
      /* Success Color System */
      --color-success-120: ${colors.success.variations[120].hex};
      --color-success-100: ${colors.success.variations[100].hex};
      --color-success-60: ${colors.success.variations[60].hex};
      
      /* Neutral Colors */
      --color-white: ${colors.neutral.white.hex};
      --color-black: ${colors.neutral.black.hex};
      --color-gray-50: ${colors.neutral.gray[50].hex};
      --color-gray-100: ${colors.neutral.gray[100].hex};
      --color-gray-200: ${colors.neutral.gray[200].hex};
      --color-gray-300: ${colors.neutral.gray[300].hex};
      --color-gray-400: ${colors.neutral.gray[400].hex};
      --color-gray-500: ${colors.neutral.gray[500].hex};
      --color-gray-600: ${colors.neutral.gray[600].hex};
      --color-gray-700: ${colors.neutral.gray[700].hex};
      --color-gray-800: ${colors.neutral.gray[800].hex};
      --color-gray-900: ${colors.neutral.gray[900].hex};
      
      /* Semantic Mapping (Legacy Support) */
      --color-primary: var(--color-primary-${colors.primary.mostUsed});
      --color-primary-dark: var(--color-primary-120);
      --color-primary-light: var(--color-primary-60);
      --color-primary-contrast: var(--color-white);
      
      --color-secondary: var(--color-information-100);
      --color-secondary-dark: var(--color-information-120);
      --color-secondary-light: var(--color-information-60);
      --color-secondary-contrast: var(--color-white);
      
      --color-background: var(--color-gray-50);
      --color-background-paper: var(--color-white);
      --color-background-accent: var(--color-primary-20);
      
      --color-text-primary: var(--color-gray-900);
      --color-text-secondary: var(--color-gray-600);
      --color-text-disabled: var(--color-gray-400);
      
      --color-border-light: var(--color-gray-200);
      --color-border-main: var(--color-gray-300);
      --color-border-dark: var(--color-gray-400);
      
      /* Error/Success/Warning States */
      --color-error: var(--color-negative-100);
      --color-error-light: var(--color-negative-60);
      --color-success: var(--color-success-100);
      --color-success-light: var(--color-success-60);
      --color-warning: var(--color-warning-100);
      --color-warning-light: var(--color-warning-60);
      
      /* Typography */
      --font-family: ${theme.typography.fontFamily};
    }
  `;
}
