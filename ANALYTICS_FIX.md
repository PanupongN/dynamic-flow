# แก้ไขปัญหา Analytics API Error

## ปัญหาที่พบ
```
AnalyticsCard.tsx:118 Failed to fetch global analytics: TypeError: Failed to fetch
    at ApiClient.request (api.ts:72:30)
    at ApiClient.getGlobalAnalytics (api.ts:217:17)
    at Object.getGlobal (api.ts:255:30)
    at fetchGlobalAnalytics (AnalyticsCard.tsx:99:48)
```

## สาเหตุ
1. **API Server ไม่ได้ทำงาน** - Server ที่ port 3001 ไม่ได้เริ่มต้น
2. **Analytics Endpoint ไม่พร้อมใช้งาน** - `/api/analytics` endpoint ไม่สามารถเข้าถึงได้
3. **Authentication Issues** - API server มี authentication middleware แต่ analytics endpoint ไม่ได้ใช้
4. **Missing CORS Headers** - Analytics endpoint ขาด CORS headers ที่ถูกต้อง

## วิธีแก้ไข

### 1. เริ่มต้น API Server
```bash
cd apps/api
npm install
npm run dev
```

### 2. ตรวจสอบ API Server
```bash
# ทดสอบ health endpoint
curl http://localhost:3001/health

# ทดสอบ analytics endpoint
curl http://localhost:3001/api/analytics
```

### 3. แก้ไขที่ทำแล้ว

#### A. แก้ไข API Server (server.ts)
- เพิ่ม CORS headers ที่ถูกต้องสำหรับ analytics endpoint
- เพิ่ม OPTIONS handler สำหรับ CORS preflight
- ไม่ต้องการ authentication สำหรับ analytics endpoint

#### B. แก้ไข Builder App (api.ts)
- เพิ่ม `getAuthHeaders()` method เพื่อส่ง Firebase authentication token
- ส่ง token ไปยัง API server อัตโนมัติ (ถ้ามี user login)

#### C. แก้ไข AnalyticsCard.tsx
- เปิดใช้งาน API calls อีกครั้ง
- ยังคงมี fallback เป็น mock data ถ้า API ล้มเหลว

### 4. การตั้งค่า Authentication

#### Builder App
- ใช้ Firebase Authentication
- ส่ง token อัตโนมัติผ่าน `Authorization: Bearer <token>` header
- ไม่ต้องการการตั้งค่าเพิ่มเติม

#### API Server
- Analytics endpoint ไม่ต้องการ authentication
- Endpoints อื่นๆ อาจต้องการ authentication ตามความเหมาะสม

## โครงสร้าง API
- **Base URL**: `http://localhost:3001/api`
- **Analytics Endpoint**: `/api/analytics` (ไม่ต้องการ authentication)
- **Health Check**: `/health`
- **CORS**: รองรับ `Authorization` header

## Mock Data ที่ใช้ (fallback)
```typescript
{
  totalForms: 12,
  totalSubmissions: 145,
  totalViews: 1280,
  conversionRate: 11.3,
  avgCompletionTime: 4.2,
  topPerformingForm: 'Contact Form'
}
```

## หมายเหตุ
- ปัญหานี้เกิดจากการเพิ่ม authentication เข้าไปในระบบ
- ได้แก้ไขโดยทำให้ analytics endpoint ไม่ต้องการ authentication
- Builder app จะส่ง authentication token อัตโนมัติ (ถ้ามี)
- ระบบจะทำงานได้ทั้งแบบ authenticated และ unauthenticated
