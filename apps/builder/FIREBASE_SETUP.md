# Firebase Auth Setup สำหรับ Dynamic Flow Builder

## ขั้นตอนการตั้งค่า

### 1. สร้างโปรเจค Firebase

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Create a project" หรือ "Add project"
3. ตั้งชื่อโปรเจค (เช่น "dynamic-flow-builder")
4. เลือก "Enable Google Analytics" (ไม่บังคับ)
5. คลิก "Create project"

### 2. เพิ่มแอปพลิเคชัน

1. คลิกไอคอนเว็บ (</>) เพื่อเพิ่มแอปเว็บ
2. ตั้งชื่อแอป (เช่น "dynamic-flow-builder-web")
3. เลือก "Also set up Firebase Hosting" (ไม่บังคับ)
4. คลิก "Register app"
5. คัดลอก Firebase config object

### 3. เปิดใช้งาน Authentication

1. ในเมนูด้านซ้าย คลิก "Authentication"
2. คลิก "Get started"
3. ไปที่แท็บ "Sign-in method"
4. เปิดใช้งาน "Google" provider:
   - คลิก "Google"
   - เปิด "Enable"
   - ตั้งค่า "Project support email"
   - คลิก "Save"
5. เปิดใช้งาน "Email/Password" provider:
   - คลิก "Email/Password"
   - เปิด "Enable"
   - **หมายเหตุ**: ไม่ต้องเปิด "Allow users to sign up" เพราะเราไม่ต้องการให้ผู้ใช้สมัครสมาชิกใหม่
   - คลิก "Save"

### 4. ตั้งค่า Environment Variables

1. สร้างไฟล์ `.env` ในโฟลเดอร์ `apps/builder/`
2. เพิ่ม Firebase config ดังนี้:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 5. ตั้งค่า Authorized Domains

1. ใน Firebase Console > Authentication > Settings
2. ไปที่แท็บ "Authorized domains"
3. เพิ่มโดเมนที่อนุญาต:
   - `localhost` (สำหรับ development)
   - โดเมนจริงของคุณ (สำหรับ production)

### 6. ตั้งค่า Google OAuth (ถ้าใช้ Google Sign-in)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจค Firebase ของคุณ
3. ไปที่ "APIs & Services" > "Credentials"
4. คลิก "Create Credentials" > "OAuth 2.0 Client IDs"
5. เลือก "Web application"
6. ตั้งชื่อและเพิ่ม Authorized JavaScript origins:
   - `http://localhost:5173` (สำหรับ development)
   - `https://your-domain.com` (สำหรับ production)
7. คัดลอก Client ID และ Client Secret
8. กลับไปที่ Firebase Console > Authentication > Sign-in method > Google
9. ใส่ Client ID และ Client Secret

## การทดสอบ

1. รันแอป: `npm run dev`
2. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
3. ทดสอบการเข้าสู่ระบบด้วย Google
4. ทดสอบการเข้าสู่ระบบด้วยอีเมล (ต้องมีบัญชีอยู่แล้วในระบบ)

## ฟีเจอร์ที่รองรับ

- ✅ Google Sign-in
- ✅ Email/Password Sign-in (สำหรับผู้ใช้ที่มีบัญชีอยู่แล้ว)
- ✅ Password Reset
- ✅ User Profile Display
- ✅ Protected Routes
- ✅ Thai Language Support
- ✅ Error Handling

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **"Firebase App named '[DEFAULT]' already exists"**
   - ตรวจสอบว่าไม่ได้ import Firebase หลายครั้ง

2. **"auth/unauthorized-domain"**
   - เพิ่มโดเมนใน Firebase Console > Authentication > Settings > Authorized domains

3. **"auth/popup-closed-by-user"**
   - ผู้ใช้ปิด popup ก่อนการยืนยันเสร็จสิ้น

4. **"auth/network-request-failed"**
   - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
   - ตรวจสอบ firewall settings

5. **"auth/user-not-found" หรือ "auth/wrong-password"**
   - ผู้ใช้ไม่มีบัญชีในระบบ (ต้องสร้างบัญชีผ่าน Firebase Console หรือ Google Sign-in ก่อน)

### การ Debug

1. เปิด Developer Tools > Console
2. ตรวจสอบ error messages
3. ตรวจสอบ Firebase config ใน Network tab
4. ใช้ Firebase Emulator สำหรับ development

## การ Deploy

1. ตั้งค่า environment variables ใน hosting platform
2. อัปเดต authorized domains ใน Firebase Console
3. ตรวจสอบ CORS settings
4. ทดสอบการทำงานใน production environment

## หมายเหตุสำคัญ

**ระบบนี้ไม่รองรับการสมัครสมาชิกใหม่ผ่าน UI** ผู้ใช้ต้องมีบัญชีอยู่แล้วในระบบ Firebase หรือต้องใช้ Google Sign-in เพื่อสร้างบัญชีใหม่
