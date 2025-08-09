# 🎨 Theme System Guide - Dynamic Flow

## Overview

ระบบ Theme Management ใหม่ช่วยให้คุณสามารถปรับแต่งลุคและฟีลของ forms ให้เข้ากับแบรนด์ของแต่ละบริษัทได้

## ✨ Features

### 🎯 **Multi-Company Theming**
- แยก theme ตาม company/organization
- รองรับหลาย color palettes 
- ระบบ CSS variables ที่ยืดหยุ่น

### 🎨 **Pre-built Color Palettes**

#### 1. **Golden Brown Theme**
```
Primary: #8A6E4B (Golden Brown - PMS 873C)
Light: #B68400 (Golden - PMS 125C) 
Secondary: #7A7F34 (Olive Green - PMS 7748C)
Background: 60-70% white + warm undertones
```

#### 2. **Mustard Yellow Theme** 
```
Primary: #DAA900 (Mustard Yellow - PMS 110C)
Secondary: #8A6E4B (Golden Brown)
Background: Light mustard tints
```

#### 3. **Professional Blue** (Default)
```
Primary: #3B82F6 (Blue 500)
Secondary: #64748B (Slate 500)
Background: Clean slate tones
```

#### 4. **Nature Green**
```
Primary: #16A34A (Green 600) 
Secondary: #7A7F34 (Olive Green)
Background: Fresh green tints
```

## 🚀 การใช้งาน

### 1. **เลือก Theme ใน Flow Builder**

```typescript
// ใน Flow Settings Panel
1. คลิกปุ่ม ⚙️ Settings ใน Flow Builder
2. เลื่อนลงมาที่ "Theme & Appearance"
3. เลือก theme จาก dropdown
4. ดู preview ของ color palette
5. บันทึกอัตโนมัติ
```

### 2. **สร้าง Custom Theme**

```typescript
import { createCustomTheme, colorPalettes } from '@dynamic-flow/ui/themes';

const myCompanyTheme = createCustomTheme(
  'myCompany',
  'My Company Brand',
  'Corporate theme with our brand colors',
  {
    primary: {
      main: '#8A6E4B',    // Your brand color
      light: '#B68400',
      dark: '#6B5538',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#7A7F34',
      light: '#9BA355',
      dark: '#5A5F28', 
      contrastText: '#FFFFFF'
    },
    // ... more colors
  }
);
```

### 3. **ใช้ ThemeProvider**

```typescript
import { ThemeProvider } from '@dynamic-flow/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="goldenBrown">
      <YourFormComponents />
    </ThemeProvider>
  );
}
```

### 4. **ใช้ Theme Hooks**

```typescript
import { useTheme, useThemedStyles } from '@dynamic-flow/ui';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  const styles = useThemedStyles();
  
  return (
    <div style={styles.card}>
      <button style={styles.buttonPrimary}>
        Themed Button
      </button>
    </div>
  );
}
```

## 🎨 Color Palette Specifications

### Golden Brown Palette
```css
/* Primary Colors */
--color-primary: #8A6E4B;        /* PMS 873C - Golden Brown */
--color-primary-light: #B68400;   /* PMS 125C - Golden */
--color-primary-dark: #6B5538;    /* Darker Golden Brown */

/* Secondary Colors */  
--color-secondary: #7A7F34;       /* PMS 7748C - Olive Green */
--color-secondary-light: #9BA355; /* Lighter Olive */
--color-secondary-dark: #5A5F28;  /* Darker Olive */

/* Neutral Colors */
--color-text-primary: #5A656F;    /* PMS 431C - Dark Grey */
--color-text-secondary: #8C9D9C;  /* PMS 443C - Light Grey */
--color-background: #FDFCFA;      /* Off-white with warm undertone */
--color-background-paper: #FFFFFF; /* Pure white (60-70% as specified) */
```

### CSS Variables Structure
```css
:root {
  /* Colors */
  --color-primary: [theme.colors.primary.main];
  --color-secondary: [theme.colors.secondary.main];
  --color-background: [theme.colors.background.default];
  
  /* Typography */
  --font-family: [theme.typography.fontFamily];
  --font-size-base: [theme.typography.fontSizes.base];
  
  /* Spacing */
  --spacing-sm: [theme.spacing.sm];
  --spacing-md: [theme.spacing.md];
  
  /* Border Radius */
  --border-radius-md: [theme.borderRadius.md];
  
  /* Shadows */
  --shadow-md: [theme.shadows.md];
}
```

## 📱 Form Styling

### Automatic Theme Application
- **Public Forms**: อัตโนมัติใช้ theme ที่เลือกไว้ใน flow
- **Form Elements**: input, button, การ์ด ปรับตาม theme
- **Typography**: font family และ sizes ตาม theme
- **Colors**: primary, secondary, background ปรับตาม palette

### CSS Classes ที่ใช้ได้
```css
.form-container    /* Container หลักของ form */
.form-field        /* แต่ละ field */
.form-step         /* แต่ละ step ของ form */
.btn-primary       /* ปุ่มหลัก */
.btn-secondary     /* ปุ่มรอง */
.choice-option     /* ตัวเลือก radio/checkbox */
.progress-bar      /* แถบ progress */
```

## 🔧 Advanced Usage

### Custom CSS Override
```typescript
// เพิ่ม custom CSS ใน flow theme
flow.theme.customCSS = `
  .form-step {
    background: linear-gradient(135deg, #8A6E4B, #B68400);
    color: white;
  }
  
  .btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(138, 110, 75, 0.3);
  }
`;
```

### Company-Specific Branding
```typescript
// สำหรับ company ที่มีสี specific
const brandColors = {
  companyA: 'goldenBrown',
  companyB: 'mustardYellow', 
  companyC: 'natureGreen',
  default: 'professionalBlue'
};

function getCompanyTheme(companyId: string) {
  return brandColors[companyId] || brandColors.default;
}
```

## 📏 Design Guidelines

### Color Usage (60-30-10 Rule)
- **60%**: Background colors (white + tints)
- **30%**: Secondary colors (grey, olive)
- **10%**: Primary accent colors (golden brown, mustard)

### Typography Hierarchy
```css
H1: font-size-3xl, font-weight-bold
H2: font-size-2xl, font-weight-semibold  
H3: font-size-xl, font-weight-medium
Body: font-size-base, font-weight-normal
Caption: font-size-sm, font-weight-normal
```

### Spacing Scale
```css
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)
```

## 🧪 Testing Themes

### Preview ใน Builder
1. เปิด Flow Settings
2. เลือก theme จาก dropdown
3. ดู color palette preview
4. ทดสอบใน Preview mode

### ตรวจสอบ Public Form
1. Publish flow ด้วย theme ที่เลือก
2. เปิด public form URL
3. ตรวจสอบ styling ทั้งหมด
4. ทดสอบบน device ต่างๆ

## 🚨 Best Practices

### Theme Selection
- **Golden Brown**: เหมาะกับธุรกิจ luxury, organic, artisanal
- **Mustard Yellow**: เหมาะกับ creative, energetic brands  
- **Professional Blue**: เหมาะกับ corporate, tech, finance
- **Nature Green**: เหมาะกับ eco-friendly, health, wellness

### Performance Tips
- Theme CSS variables ถูก inject แค่ครั้งเดียว
- ใช้ CSS custom properties แทน inline styles
- Cache theme data ใน localStorage

### Accessibility
- ทุก theme ผ่าน contrast ratio standards
- รองรับ high contrast mode
- Keyboard navigation เข้ากันได้กับทุก theme

## 🔗 API Reference

### Theme Functions
```typescript
getTheme(themeId: string): CompanyTheme
getAllThemes(): CompanyTheme[]
createCustomTheme(...): CompanyTheme  
generateCSSVariables(theme): string
```

### React Hooks
```typescript
useTheme(): ThemeContextValue
useThemedStyles(): ThemedStyles
```

### Components
```typescript
<ThemeProvider defaultTheme="goldenBrown">
<ThemeSelector onThemeChange={...} />
<ColorPaletteDisplay themeId="..." />
<Themed className="...">
```

---

## 📞 Support

หากมีคำถามเกี่ยวกับ theme system:
- ดูตัวอย่างใน `/packages/ui/src/themes/`
- ทดสอบใน Flow Builder Settings
- ตรวจสอบ CSS variables ใน DevTools
