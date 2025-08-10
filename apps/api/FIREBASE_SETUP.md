# Firebase Admin SDK Setup Guide

## การติดตั้ง Firebase Admin SDK

### 1. ติดตั้ง Dependencies
```bash
npm install firebase-admin
```

### 2. การตั้งค่า Firebase Admin SDK

#### วิธีที่ 1: ใช้ Service Account File (แนะนำสำหรับ Production)

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจคของคุณ
3. ไปที่ Project Settings > Service Accounts
4. คลิก "Generate New Private Key"
5. ดาวน์โหลดไฟล์ JSON
6. เปลี่ยนชื่อไฟล์เป็น `firebase-service-account.json`
7. วางไฟล์ไว้ใน `apps/api/` directory

#### วิธีที่ 2: ใช้ Environment Variables

สร้างไฟล์ `.env` ใน `apps/api/` directory:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 3. การใช้งาน

#### Authentication Middleware

```typescript
import { authenticateToken, optionalAuth } from './middleware/authMiddleware.js';

// ต้องมี authentication
app.get('/protected', authenticateToken, (req, res) => {
  // req.user จะมีข้อมูล user
  res.json({ user: req.user });
});

// ไม่บังคับ authentication
app.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    // มี user login
  } else {
    // ไม่มี user login
  }
});
```

#### Auth Routes

- `GET /api/auth/me` - ข้อมูล user ปัจจุบัน
- `POST /api/auth/verify` - ตรวจสอบ token
- `POST /api/auth/refresh` - refresh session
- `DELETE /api/auth/logout` - logout
- `GET /api/auth/status` - สถานะ authentication

### 4. การเรียกใช้จาก Client

```typescript
// ตัวอย่างการเรียกใช้ API
const token = await auth.currentUser?.getIdToken();

const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const userData = await response.json();
```

### 5. Security Notes

- เก็บไฟล์ `firebase-service-account.json` ไว้ใน `.gitignore`
- ใช้ environment variables สำหรับ production
- ตรวจสอบ CORS settings ให้เหมาะสม
- ใช้ HTTPS ใน production

### 6. Troubleshooting

#### Error: "Firebase Admin not initialized"
- ตรวจสอบว่าไฟล์ service account ถูกต้อง
- ตรวจสอบ environment variables
- ตรวจสอบ console logs

#### Error: "Invalid token"
- ตรวจสอบว่า token ถูกส่งมาในรูปแบบ `Bearer <token>`
- ตรวจสอบว่า token ไม่หมดอายุ
- ตรวจสอบ Firebase project configuration
