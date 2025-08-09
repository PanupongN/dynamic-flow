# Form Frontend Implementation Guide

ระบบนี้ได้สร้าง frontend สำหรับการ render และ submit form แบบ dynamic แล้ว โดยมีคุณสมบัติดังนี้:

## คุณสมบัติหลัก

### 1. Dynamic Form Rendering
- รองรับ field types ต่างๆ: text, email, number, single choice, multiple choice, rating, date picker
- การแสดงผลแบบ step-by-step พร้อม progress bar
- Conditional logic สำหรับการแสดง/ซ่อน field ตาม condition

### 2. Form Validation
- Field validation ตาม rules ที่กำหนด (required, min/max length, email, regex, URL)
- Real-time validation feedback
- Custom error messages

### 3. Form Submission
- Integration กับ API backend
- Error handling ที่ครอบคลุม
- Support สำหรับ redirect และ webhook
- Analytics tracking

### 4. Theme Support
- Custom CSS injection
- Color theming
- Responsive design

## Routes และ Pages

### 1. `/form/:flowId` - Form Preview (มี Navbar)
ใช้สำหรับ preview form ใน admin panel

### 2. `/public/:flowId` - Public Form (ไม่มี Navbar)
ใช้สำหรับ public form ที่ share ให้ผู้ใช้ทั่วไป

### 3. Dashboard Enhancement
- แสดง public form URL สำหรับ published forms
- ปุ่ม copy URL และ open in new tab
- Status indicator และ response count

## Components

### 1. FormRenderer
Component หลักสำหรับการ render form dynamically

```tsx
<FormRenderer
  flow={flow}
  onSubmit={handleSubmitSuccess}
  onError={handleSubmitError}
/>
```

**Props:**
- `flow`: Flow object ที่มี nodes และ settings
- `onSubmit`: Callback เมื่อ submit สำเร็จ
- `onError`: Callback เมื่อเกิด error

### 2. ErrorBoundary
Component สำหรับจัดการ JavaScript errors

### 3. FormView & PublicFormView
Pages สำหรับแสดง form ในรูปแบบต่างๆ

## API Integration

### Form Submission Endpoint
```
POST /api/responses
```

**Request Body:**
```json
{
  "flowId": "uuid",
  "responses": [
    {
      "nodeId": "field-id",
      "questionId": "field-id",
      "value": "user-input",
      "type": "field-type"
    }
  ],
  "metadata": {
    "completionTime": 120,
    "deviceType": "desktop",
    "startedAt": "2024-01-01T00:00:00Z",
    "submittedAt": "2024-01-01T00:02:00Z"
  }
}
```

## การใช้งาน

### 1. สร้าง Flow ใน Builder
1. ไปที่ Dashboard (`/`)
2. คลิก "Create New Flow"
3. เพิ่ม fields และกำหนด settings
4. Publish flow

### 2. Share Form
1. เมื่อ flow ถูก publish จะมี Public Form URL แสดงใน Dashboard
2. Copy URL และแชร์ให้ผู้ใช้
3. ผู้ใช้สามารถเข้าถึงผ่าน `/public/:flowId`

### 3. ดู Responses
- ใช้ API endpoint `/api/responses?flowId=xxx` เพื่อดู responses
- Export ข้อมูลเป็น JSON หรือ CSV

## Field Types ที่รองรับ

### Input Fields
- **text_input**: Text input field
- **email_input**: Email input with validation
- **number_input**: Number input field
- **date_picker**: Date picker field

### Choice Fields
- **single_choice**: Radio buttons
- **multiple_choice**: Checkboxes
- **rating**: Star rating (1-5)

### Special Fields
- **thank_you**: Thank you message
- **conditional**: Logic branches (ไม่แสดงใน form)
- **calculation**: คำนวณค่า (ไม่แสดงใน form)

## Validation Rules

### Built-in Validators
- `required`: Field ต้องมีค่า
- `min_length`: ความยาวขั้นต่ำ
- `max_length`: ความยาวสูงสุด
- `email`: Format email ที่ถูกต้อง
- `url`: Format URL ที่ถูกต้อง
- `regex`: Custom regex pattern

### Custom Messages
กำหนด error message ได้ใน validation rule:

```json
{
  "type": "min_length",
  "value": 5,
  "message": "กรุณากรอกอย่างน้อย 5 ตัวอักษร"
}
```

## Conditional Logic

### Operators ที่รองรับ
- `equals`: เท่ากับ
- `not_equals`: ไม่เท่ากับ
- `contains`: มีข้อความ
- `greater_than`: มากกว่า
- `less_than`: น้อยกว่า

### Example
```json
{
  "condition": {
    "field": "age-field",
    "operator": "greater_than",
    "value": 18
  }
}
```

## Theme Customization

### Color Theme
```json
{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#6B7280",
    "background": "#F9FAFB",
    "text": "#111827",
    "border": "#D1D5DB"
  }
}
```

### Custom CSS
สามารถเพิ่ม custom CSS ได้ผ่าน `theme.customCSS`

## Error Handling

### Client-side Errors
- Network errors
- Validation errors
- JavaScript runtime errors

### Server-side Errors
- 404: Form not found
- 400: Invalid data
- 500: Server error

### User Experience
- Error messages แสดงชัดเจน
- Retry mechanisms
- Fallback UI

## Performance Considerations

### Optimizations
- Lazy loading สำหรับ large forms
- Debounced validation
- Efficient re-rendering

### Analytics
- Form view tracking
- Completion time measurement
- Device type detection
- Conversion rate analytics

## ขั้นตอนถัดไป

1. **Embed Widget**: สร้าง embeddable widget สำหรับเว็บไซต์อื่น
2. **Advanced Validation**: เพิ่ม validation rules ที่ซับซ้อนขึ้น
3. **File Upload**: รองรับการอัพโหลดไฟล์
4. **Multi-language**: รองรับหลายภาษา
5. **Offline Support**: ทำงานแบบ offline ได้

## Troubleshooting

### Common Issues

1. **Form ไม่แสดง**
   - ตรวจสอบว่า flow status เป็น 'published'
   - ตรวจสอบ API connection

2. **Submit ไม่สำเร็จ**
   - ตรวจสอบ validation errors
   - ตรวจสอบ network connection
   - ดู browser console สำหรับ errors

3. **Theme ไม่ทำงาน**
   - ตรวจสอบ CSS syntax
   - ตรวจสอบ color values

### Debug Mode
เปิด browser console เพื่อดู debug logs:
- Form data structure
- Submission payload
- API responses
- Error details
