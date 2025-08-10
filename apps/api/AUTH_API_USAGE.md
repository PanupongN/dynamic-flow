# Authentication API Usage Guide

## การใช้งาน Firebase Authentication API

### 1. การตั้งค่า Firebase

ก่อนใช้งาน Authentication API คุณต้องตั้งค่า Firebase Admin SDK ตามคู่มือใน `FIREBASE_SETUP.md`

### 2. Authentication Endpoints

#### 2.1 ตรวจสอบสถานะ Authentication
```http
GET /api/auth/status
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

#### 2.2 ข้อมูล User ปัจจุบัน
```http
GET /api/auth/me
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "emailVerified": true,
    "disabled": false,
    "metadata": {
      "creationTime": "2024-01-01T00:00:00.000Z",
      "lastSignInTime": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### 2.3 ตรวจสอบ Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "firebase-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "emailVerified": true,
    "name": "John Doe",
    "picture": "https://example.com/photo.jpg"
  }
}
```

#### 2.4 Refresh Session
```http
POST /api/auth/refresh
Authorization: Bearer <firebase-id-token>
```

#### 2.5 Logout
```http
DELETE /api/auth/logout
Authorization: Bearer <firebase-id-token>
```

### 3. การใช้งานกับ Flows API

#### 3.1 สร้าง Flow ใหม่ (ต้องมี Authentication)
```http
POST /api/flows
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "My Flow",
  "description": "Flow description",
  "nodes": [],
  "settings": {},
  "theme": {}
}
```

**Response จะรวม user information:**
```json
{
  "id": "flow-uuid",
  "title": "My Flow",
  "description": "Flow description",
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "user123",
  "updatedBy": "user123",
  "draft": {
    "nodes": [],
    "settings": {},
    "theme": {}
  }
}
```

#### 3.2 อัปเดต Flow (ต้องมี Authentication)
```http
PUT /api/flows/:id
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Updated Flow Title",
  "nodes": [...]
}
```

#### 3.3 ลบ Flow (ต้องมี Authentication)
```http
DELETE /api/flows/:id
Authorization: Bearer <firebase-id-token>
```

#### 3.4 Publish/Unpublish Flow (ต้องมี Authentication)
```http
POST /api/flows/:id/publish
Authorization: Bearer <firebase-id-token>
```

```http
POST /api/flows/:id/unpublish
Authorization: Bearer <firebase-id-token>
```

### 4. การใช้งานจาก Client

#### 4.1 React/TypeScript Example
```typescript
import { auth } from './firebaseConfig';

// ฟังก์ชันสำหรับเรียกใช้ API ที่ต้องการ authentication
async function callAuthenticatedAPI(endpoint: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// ตัวอย่างการใช้งาน
async function createFlow(flowData: any) {
  try {
    const newFlow = await callAuthenticatedAPI('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
    console.log('Flow created:', newFlow);
    return newFlow;
  } catch (error) {
    console.error('Failed to create flow:', error);
    throw error;
  }
}

async function getCurrentUser() {
  try {
    const userData = await callAuthenticatedAPI('/auth/me');
    console.log('Current user:', userData);
    return userData;
  } catch (error) {
    console.error('Failed to get user data:', error);
    throw error;
  }
}
```

#### 4.2 JavaScript Example
```javascript
// ฟังก์ชันสำหรับเรียกใช้ API ที่ต้องการ authentication
async function callAuthenticatedAPI(endpoint, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// ตัวอย่างการใช้งาน
async function createFlow(flowData) {
  try {
    const newFlow = await callAuthenticatedAPI('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
    console.log('Flow created:', newFlow);
    return newFlow;
  } catch (error) {
    console.error('Failed to create flow:', error);
    throw error;
  }
}
```

### 5. Error Handling

#### 5.1 Authentication Errors
```json
{
  "error": "Unauthorized",
  "message": "No token provided or invalid format"
}
```

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### 5.2 Validation Errors
```json
{
  "error": "Validation error",
  "details": [
    "title is required",
    "nodes must be an array"
  ]
}
```

### 6. Security Best Practices

1. **Token Management**: เก็บ Firebase ID token ไว้ใน memory หรือ secure storage
2. **Token Refresh**: Firebase SDK จะจัดการ token refresh อัตโนมัติ
3. **HTTPS**: ใช้ HTTPS ใน production environment
4. **CORS**: ตั้งค่า CORS ให้เหมาะสมกับ domain ที่ใช้งาน
5. **Rate Limiting**: พิจารณาเพิ่ม rate limiting สำหรับ API endpoints

### 7. Testing

#### 7.1 Test Authentication
```bash
# Test with valid token
curl -H "Authorization: Bearer <valid-token>" \
     http://localhost:3001/api/auth/me

# Test without token
curl http://localhost:3001/api/auth/me
```

#### 7.2 Test Protected Endpoints
```bash
# Create flow (requires auth)
curl -X POST \
     -H "Authorization: Bearer <valid-token>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Flow"}' \
     http://localhost:3001/api/flows
```
