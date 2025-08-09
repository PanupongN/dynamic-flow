# 🚀 Quick Start Guide - Dynamic Flow

## การสร้าง Flow ใหม่ (ง่ายมาก!)

### 1. เปิดแอปพลิเคชัน
```bash
npm run dev
```
- เปิด browser ไปที่: `http://localhost:3000`

### 2. สร้าง Flow ใหม่
คลิคปุ่ม **"Create New Flow"** (สีน้ำเงิน) จะเจอใน:
- 🏠 **Dashboard** - ด้านบนขวา
- 🧭 **Navbar** - ทุกหน้า

### 3. เลือก Template
เมื่อคลิค "Create New Flow" จะเปิด **Quick Start Modal** ให้เลือก:

#### 📝 **Ready-to-Use Templates:**
1. **Contact Form** 
   - ✅ Name, Email, Message
   - ✅ 4 steps พร้อมใช้

2. **Event Registration** (เหมือน Registration Mhai)
   - ✅ Contact info → Guest count → Guest details
   - ✅ Conditional logic
   - ✅ Repeatable sections

3. **Customer Feedback**
   - ✅ Rating → Comments → Recommend
   - ✅ Star ratings

4. **Start from Scratch**
   - ✅ Blank canvas

### 4. Template Categories
- 🏢 **Business**: Contact, Registration, Feedback
- 👤 **Personal**: Custom forms
- 📢 **Marketing**: Lead generation

### 5. Create Flow
1. **เลือก Template** → คลิค "Use Template"
2. **หรือ** เลือกแล้วคลิค "Create Flow" ด้านล่าง
3. **รอ 2-3 วินาที** → Auto redirect ไป Builder

## 🎨 การใช้งาน Flow Builder

### เมื่อเข้า Builder แล้ว:

#### **Canvas (กลาง)**
- ✅ ดู flow structure
- ✅ คลิค node เพื่อ select
- ✅ แสดง connections

#### **Node Palette (ซ้าย)**
- ✅ คลิคเพื่อเพิ่ม components:
  - 📝 Text Input
  - 📧 Email
  - 🔢 Number
  - ⭕ Single Choice
  - 📅 Date Picker
  - 📎 File Upload

#### **Property Panel (ขวา)**
- ✅ แก้ไข selected node
- ✅ เปลี่ยน label/description
- ✅ ตั้งค่า required

#### **Header Controls**
- 💾 **Save** - บันทึก (auto-save ทุก 2 วิ)
- 🚀 **Publish** - เปิดใช้งาน
- 👁️ **Preview** - ดู form จริง

## 📱 การใช้งานง่าย ๆ

### สร้าง Contact Form ใน 1 นาที:
1. คลิค "Create New Flow"
2. เลือก "Contact Form" template
3. คลิค "Use Template"
4. ✅ **เสร็จแล้ว!** - Form พร้อมใช้

### แก้ไข Form:
1. **คลิค node** ที่ต้องการแก้
2. **แก้ใน Property Panel** (ขวา)
   - เปลี่ยน question
   - เพิ่ม description
   - ตั้ง required
3. **กด Save** หรือรอ auto-save

### เพิ่ม Questions:
1. **คลิค component** จาก palette (ซ้าย)
2. **Component ปรากฏใน canvas**
3. **คลิค และแก้ไข** ใน property panel
4. **Done!**

## 🔄 Flow พิเศษ - Registration Mhai Style

### Template: "Event Registration"
- ✅ **Step 1**: Contact Information (4 fields)
- ✅ **Step 2**: Number of guests 
- ✅ **Step 3**: Guest details (แสดงถ้า > 0 guests)
- ✅ **Auto-repeat**: Guest form ตามจำนวนที่ระบุ

### วิธีใช้:
1. เลือก "Event Registration" template
2. **เสร็จเลย!** - Conditional logic ตั้งค่าแล้ว
3. ทดสอบใน Preview

## 💡 Tips เพื่อใช้งานง่าย

### ⚡ **Super Quick Start**
- ใช้ templates แทนการสร้างใหม่
- Templates มี logic ครบแล้ว

### 📱 **UI Flow**
```
Dashboard → "Create Flow" → Select Template → ✅ Ready!
```

### 💾 **Auto-Save**
- บันทึกอัตโนมัติทุก 2 วินาที
- ไม่ต้องกด Save บ่อย ๆ

### 🎯 **Preview Often**
- คลิค "Preview" เพื่อดู form จริง
- ทดสอบ flow logic

### 🚀 **Publishing**
1. กด "Publish" เมื่อพร้อม
2. Form พร้อมใช้งานทันที
3. ดู analytics ใน Dashboard

## 🛠️ Troubleshooting

### ❓ **ปัญหาที่อาจเจอ**

**Q: กด Create Flow แล้วไม่เกิดอะไร?**
- ✅ ตรวจสอบ API status (สีเขียวใน navbar)
- ✅ ดู console ใน browser (F12)

**Q: Save ไม่ได้?**  
- ✅ ตรวจ API connection
- ✅ รอ auto-save 2 วินาที

**Q: Template ไม่โหลด?**
- ✅ Refresh browser
- ✅ ตรวจ network connection

### 🔧 **Debug Mode**
```bash
# Enable debug logging  
VITE_DEBUG=true npm run dev
```

## 📊 ตัวอย่างการใช้งานจริง

### ✅ **Contact Form** (1 นาที)
1. Create → Contact Form template → Done!
2. Publish → แชร์ URL

### ✅ **Event Registration** (2 นาที)  
1. Create → Event Registration template
2. ปรับแต่ง questions (optional)
3. Preview → Test → Publish

### ✅ **Custom Survey** (5 นาที)
1. Create → Start from Scratch
2. เพิ่ม components ตามต้องการ
3. ตั้งค่า connections
4. Preview → Publish

## 🎯 **สรุป**

Dynamic Flow ออกแบบให้:
- ✅ **ใช้งานง่าย** - คลิค 2-3 ครั้งก็เสร็จ
- ✅ **Templates พร้อม** - ไม่ต้องเริ่มจากศูนย์  
- ✅ **Auto-save** - ไม่หลงลืมบันทึก
- ✅ **Real-time Preview** - เห็นผลทันที
- ✅ **Multi-step Support** - ซับซ้อนได้

**การสร้าง flow ควรใช้เวลาแค่ 1-2 นาที!** 🚀

หากยังสร้างยาก ให้ดู console หรือ API status ใน navbar ครับ
