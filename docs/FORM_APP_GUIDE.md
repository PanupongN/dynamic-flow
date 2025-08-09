# Form App Guide

## Overview

เราได้แยก form functionality ออกมาเป็น app ใหม่ที่ชื่อ `form` เพื่อให้ end user สามารถเข้าถึงและกรอกข้อมูลในฟอร์มได้โดยตรง แยกต่างหากจาก builder app

## ประโยชน์ของการแยก Form App

1. **การแยกความรับผิดชอบ (Separation of Concerns)**
   - Builder App: สำหรับสร้างและจัดการฟอร์ม
   - Form App: สำหรับ end user ใช้งานฟอร์มจริง

2. **ประสิทธิภาพที่ดีขึ้น**
   - Bundle size เล็กลงสำหรับ end user
   - โหลดเร็วขึ้น เนื่องจากไม่มี builder components

3. **ความปลอดภัย**
   - แยก environment การใช้งาน
   - End user ไม่เข้าถึง builder features

4. **การ Deploy แยกกัน**
   - สามารถ deploy แยกกันได้
   - Scale แยกกันตามการใช้งาน

## โครงสร้าง Apps

### Builder App (Port 3000)
```
apps/builder/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # จัดการฟอร์ม + ลิงก์ไป Preview
│   │   ├── FlowBuilder.tsx    # สร้างฟอร์ม + ปุ่ม Preview
│   │   └── ...
│   └── ...
```

### Form App (Port 3003)
```
apps/form/
├── src/
│   ├── pages/
│   │   ├── FormView.tsx           # สำหรับ end user กรอกฟอร์ม (/form/:flowId)
│   │   ├── PublicFormView.tsx     # สำหรับ end user กรอกฟอร์ม (/public/:flowId)
│   │   └── PreviewFormView.tsx    # สำหรับ builder ดูตัวอย่าง
│   ├── components/
│   │   ├── FormRenderer.tsx       # คัดลอกมาจาก builder
│   │   ├── PhoneInputField.tsx    # คัดลอกมาจาก builder
│   │   └── ErrorBoundary.tsx      # คัดลอกมาจาก builder
│   ├── utils/                     # utilities ที่จำเป็น
│   ├── themes/                    # theme system
│   └── services/                  # API services (เฉพาะที่จำเป็น)
```

## URL Structure

### Builder App (http://localhost:3000)
- `/` - Dashboard
- `/builder/:flowId` - Form Builder
- `/settings` - Settings
- เมื่อกดปุ่ม Preview → เปิด `http://localhost:3003/preview/:flowId` ใน tab ใหม่

### Form App (http://localhost:3003)
- `/form/:flowId` - ฟอร์มสำหรับ end user (published forms)
- `/public/:flowId` - ฟอร์มสาธารณะสำหรับ end user (alias สำหรับ published forms)
- `/preview/:flowId` - ตัวอย่างฟอร์มสำหรับ builder (draft forms)

## การทำงาน

### 1. Form Building Process
1. สร้างฟอร์มใน Builder App
2. กด "Preview" → เปิด Form App ใน tab ใหม่
3. ดูตัวอย่างฟอร์มใน Form App
4. กลับไปแก้ไขใน Builder App
5. Publish ฟอร์ม

### 2. End User Experience
1. รับ link ฟอร์ม: `http://localhost:3003/form/:flowId` หรือ `http://localhost:3003/public/:flowId`
2. เปิดลิงก์และกรอกข้อมูล
3. Submit ฟอร์ม
4. รับ confirmation หรือ redirect

## API Integration

Form App ใช้ API endpoints เดียวกันกับ Builder App:
- `GET /api/flows/:id/draft` - สำหรับ preview mode
- `GET /api/flows/:id/published` - สำหรับ production form
- `POST /api/responses` - สำหรับ submit ข้อมูล

## Theme System

Form App รองรับ theme system แบบเดียวกับ Builder App:
- CSS Variables สำหรับ theming
- Support สำหรับ custom themes
- Responsive design

## Development

### การรัน Development Environment
```bash
npm run dev  # รัน API, Builder และ Form Apps พร้อมกัน
```

หรือรัน individual apps:
```bash
npm run api      # API Server (port 3001)
npm run builder  # Builder App (port 3000)
npm run form     # Form App (port 3003)
```

### การทดสอบ
1. สร้างฟอร์มใน Builder App
2. กด Preview เพื่อทดสอบใน Form App
3. Publish ฟอร์มแล้วทดสอบ end user flow

## ข้อควรระวัง

1. **CORS Settings**: ต้องตั้งค่า CORS ให้ Form App สามารถเรียก API ได้
2. **Environment Variables**: ต้องตั้งค่า VITE_API_URL ใน Form App
3. **Production Deployment**: ต้อง deploy แยกกันและตั้งค่า URL ให้ถูกต้อง

## การ Deploy

### Development
- Builder App: `http://localhost:3000`
- Form App: `http://localhost:3003`

### Production (ตัวอย่าง)
- Builder App: `https://builder.yourdomain.com`
- Form App: `https://forms.yourdomain.com`

ต้องอัปเดต hardcoded URLs ใน Dashboard.tsx และ FlowBuilder.tsx สำหรับ production:
```typescript
// Development
window.open(`http://localhost:3003/preview/${flowId}`, '_blank')

// Production
window.open(`https://forms.yourdomain.com/preview/${flowId}`, '_blank')
```

## Troubleshooting

### ปัญหาที่อาจพบ
1. **API Connection Error**: ตรวจสอบว่า API server รันอยู่และ URL ถูกต้อง
2. **Theme ไม่แสดงผล**: ตรวจสอบ theme configuration และ CSS variables
3. **Form ไม่ submit ได้**: ตรวจสอบ CORS และ API endpoints

### Debug Mode
เปิด Debug theme information ใน PreviewFormView.tsx:
```typescript
console.log('PreviewFormView - Flow theme data:', {
  flowTheme: flow.theme,
  themeId,
  themeName: theme.name,
  primaryColor: theme.colors.primary.main,
});
```
