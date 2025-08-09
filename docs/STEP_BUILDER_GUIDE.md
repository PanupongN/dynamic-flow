# 🎯 Step-Based Builder Guide

## 🚀 **New Simple Builder - No Drag & Drop!**

เปลี่ยนจาก drag & drop ที่ซับซ้อน เป็น **Step-Based Builder** ที่ง่ายและเข้าใจง่าย

## 🎨 **Builder Layout**

### **3-Panel Layout:**
```
┌─────────────┬──────────────────┬─────────────┐
│  Steps      │  Field Builder   │  Preview    │
│  (ซ้าย)      │  (กลาง)           │  (ขวา)      │
│             │                  │ (optional)  │
│ - Step 1    │ - Add Fields     │ Live form   │
│ - Step 2    │ - Edit Fields    │ preview     │
│ - Step 3    │ - Field Settings │             │
└─────────────┴──────────────────┴─────────────┘
```

## 📋 **วิธีการใช้งาน**

### **1. สร้าง Steps (ซ้าย)**

#### **Add Step:**
1. คลิค **"Add Step"** 
2. ใส่ชื่อ step (เช่น "Contact Information")
3. กด **"Create Step"**

#### **Manage Steps:**
- ✅ **Edit**: คลิกที่ step → แก้ title/description
- ✅ **Reorder**: ใช้ arrow buttons เพื่อเลื่อนขึ้น/ลง
- ✅ **Delete**: กด trash icon

#### **Step Example:**
```
Step 1: Contact Information
└── Description: Please provide your details
└── 3 fields
```

### **2. สร้าง Fields (กลาง)**

#### **เลือก Step แล้วเพิ่ม Fields:**

**Available Field Types:**
- 📝 **Text Input**: Single line text
- 📝 **Text Area**: Multi-line text  
- 📧 **Email**: Email validation
- 🔢 **Number**: Numeric input
- 📅 **Date**: Date picker
- ⭕ **Single Choice**: Radio buttons
- ☑️ **Multiple Choice**: Checkboxes
- 📎 **File Upload**: File selection

#### **Add Field Process:**
1. เลือก Step (ซ้าย)
2. คลิค **"Add Field"** (กลาง)
3. เลือก field type จาก popup
4. แก้ไข field settings (ขวาของกลาง)

### **3. Edit Field Properties**

#### **Basic Settings:**
- ✅ **Label**: คำถาม/ชื่อ field  
- ✅ **Placeholder**: ข้อความใน input
- ✅ **Required**: บังคับกรอก

#### **Advanced Settings:**

**For Choice Fields:**
- ✅ **Options**: เพิ่ม/ลบ/แก้ไข choices
- ✅ **Option Labels**: ชื่อที่แสดง
- ✅ **Values**: ค่าที่บันทึก

**For Number Fields:**
- ✅ **Min/Max Values**: ขอบเขตตัวเลข
- ✅ **Validation**: กฎการตรวจสอบ

## 🎯 **Example Workflow**

### **สร้าง Contact Form:**

#### **Step 1: สร้าง Steps**
```
1. "Contact Information"
2. "Your Message" 
3. "Thank You"
```

#### **Step 2: เพิ่ม Fields**

**Contact Information Step:**
- Name (Text Input, Required)
- Email (Email Input, Required)  
- Phone (Text Input, Optional)

**Your Message Step:**
- Subject (Text Input, Required)
- Message (Text Area, Required)
- Priority (Single Choice: Low/Medium/High)

**Thank You Step:**
- (No fields - just thank you message)

#### **Step 3: Test & Publish**
- กด **"Preview"** เพื่อดู form
- กด **"Save"** เพื่อบันทึก
- กด **"Publish"** เพื่อเปิดใช้งาน

## 🔧 **Features**

### **✅ Step Management**
- **Add/Delete Steps**: ง่ายและรวดเร็ว
- **Reorder Steps**: เลื่อนขึ้น/ลงได้
- **Step Preview**: ดูจำนวน fields ใน step
- **Quick Edit**: แก้ชื่อ step ได้ทันที

### **✅ Field Management** 
- **8 Field Types**: ครอบคลุมใช้งานทั่วไป
- **Visual Editor**: แก้ไข properties ง่าย
- **Field Reordering**: จัดลำดับ fields
- **Live Validation**: ตรวจสอบทันที

### **✅ Real-time Preview**
- **Live Form Preview**: เห็นผลทันที
- **Multi-step Navigation**: ทดสอบ flow
- **Responsive Design**: ดูใน mobile/desktop

### **✅ Auto-save**
- **Background Saving**: บันทึกทุก 2 วิ
- **Manual Save**: กด Save button
- **API Integration**: ข้อมูลปลอดภัย

## 💡 **Best Practices**

### **📋 Step Organization**
```
✅ Good:
Step 1: Basic Info (name, email)
Step 2: Details (address, phone) 
Step 3: Preferences (choices)
Step 4: Confirmation

❌ Avoid:
Step 1: Everything (20+ fields)
```

### **📝 Field Naming**
```
✅ Good:
- "What is your full name?"
- "Enter your email address"
- "Choose your preferred contact method"

❌ Avoid:  
- "Name"
- "Email"
- "Contact"
```

### **🎯 Field Validation**
```
✅ Use Required for:
- Essential information
- Contact details
- Key decisions

✅ Keep Optional:
- Additional details
- Preferences
- Comments
```

## 🚨 **Common Issues & Solutions**

### **Q: Step ไม่ปรากฏใน preview?**
A: ✅ ตรวจสอบว่า step มี fields อย่างน้อย 1 field

### **Q: Field options ไม่แสดง?**  
A: ✅ กด "Add Option" ใน Choice fields และใส่ label

### **Q: Auto-save ไม่ทำงาน?**
A: ✅ ตรวจสอบ API status ใน navbar (สีเขียว = OK)

### **Q: Preview ไม่อัปเดต?**
A: ✅ กด "Preview" อีกครั้งหรือรอ auto-save

## 🎉 **Advantages**

### **vs. Drag & Drop Builder:**

| Feature | Step Builder | Drag & Drop |
|---------|-------------|------------|
| **Learning Curve** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Complex |
| **Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Medium |
| **Mobile Friendly** | ⭐⭐⭐⭐⭐ Yes | ⭐⭐ Limited |
| **Accuracy** | ⭐⭐⭐⭐⭐ Precise | ⭐⭐⭐ Variable |
| **Form Logic** | ⭐⭐⭐⭐⭐ Clear | ⭐⭐⭐ Complex |

### **Key Benefits:**
- ✅ **Faster Development**: สร้าง form ได้ใน 2-3 นาที
- ✅ **Better UX**: ไม่ต้องลาก component
- ✅ **Mobile Compatible**: ใช้งานบน tablet/phone ได้
- ✅ **Less Errors**: ไม่มีปัญหาการวาง component ผิด
- ✅ **Cleaner Code**: Structure ชัดเจน

## 🚀 **Quick Start**

### **Create Your First Form (2 minutes):**

1. **Dashboard** → "Create New Flow"
2. **Choose Template** หรือ "Start from Scratch"  
3. **Add Step** → "Contact Info"
4. **Add Fields** → Text Input (Name), Email Input (Email)
5. **Add Step** → "Thank You"
6. **Preview** → ทดสอบ form
7. **Publish** → เปิดใช้งาน

**🎯 เสร็จแล้ว! Form พร้อมใช้งาน**

---

**Step-Based Builder ทำให้การสร้าง form ง่ายและรวดเร็วขึ้นมาก!** 

ไม่ต้องลากวาง ไม่ต้องคิดซับซ้อน แค่:
1. สร้าง Steps
2. เพิ่ม Fields  
3. Publish

**Done!** 🎉
