# 🧠 Logic & Conditions Guide

## 🎯 **Conditional Logic ใน Dynamic Flow**

เพิ่ม Smart Logic เพื่อสร้าง Dynamic Forms ที่ตอบสนองต่อ user input แบบ real-time

## 🎨 **UI Layout**

### **Builder Layout:**
```
┌─────────────┬──────────────────────────┬─────────────────────┐
│  Steps      │  Tabs: Fields | Logic    │  Preview            │
│  (ซ้าย)      │  (กลาง)                   │  (ขวา)              │
│             │                          │                     │
│ - Step 1    │ Fields Tab:              │ Live form preview   │
│ - Step 2    │ - Add/Edit Fields        │ with conditions     │
│ - Step 3    │                          │                     │
│             │ Logic Tab:               │                     │
│             │ - Add Conditions         │                     │
│             │ - Set Actions            │                     │
│             │ - Preview Rules          │                     │
└─────────────┴──────────────────────────┴─────────────────────┘
```

### **Logic Tab Components:**
```
┌─ Logic & Conditions ────────────────┐
│ Step: Contact Information           │
│                         [Add Logic] │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Rule 1 ──────────────────────┐   │
│ │ IF email "contains" "@gmail"   │   │
│ │ THEN show "Gmail User Step"    │   │
│ └────────────────────────────────┘   │
│                                     │
│ ┌─ Rule 2 ──────────────────────┐   │
│ │ IF age "greater_than" 18       │   │
│ │ AND country "equals" "Thailand"│   │
│ │ THEN jump to "Adult Form"      │   │
│ └────────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🔧 **วิธีการใช้งาน**

### **1. เพิ่ม Logic Rule**

#### **Step 1: เลือก Step**
```
1. เลือก step ที่ต้องการเพิ่ม logic (ซ้าย)
2. คลิค tab "Logic & Conditions" (กลาง)
3. คลิค "Add Logic" button
```

#### **Step 2: ตั้งค่า Conditions**
```
1. เลือก Field ที่ต้องการเช็ค
2. เลือก Operator (equals, greater_than, etc.)
3. ใส่ Value ที่ต้องการเปรียบเทียบ
4. เพิ่ม Condition เพิ่มเติม (AND/OR)
```

#### **Step 3: กำหนด Actions**
```
1. เลือก Action ที่ต้องการให้เกิดขึ้น
2. ตั้งค่า parameters สำหรับ action
3. Save Logic Rule
```

### **2. Types of Conditions**

#### **Field Operators:**
```
📝 equals          → Field value equals specific value
❌ not_equals      → Field value does not equal
📈 greater_than    → Field value is greater than (numbers)
📉 less_than       → Field value is less than (numbers)
🔍 contains        → Field value contains text
✅ not_empty       → Field has any value
⭕ is_empty        → Field is empty/not filled
```

#### **Logic Operators:**
```
🔗 AND → All conditions must be true
🔀 OR  → Any condition can be true
```

### **3. Types of Actions**

#### **Flow Control:**
```
👁️ Show Step      → Show another step conditionally
👻 Hide Step      → Hide a step from the flow
🚀 Jump to Step   → Skip to a specific step
📝 Set Field Value → Auto-fill a field in another step
💬 Show Message   → Display a custom message
```

## 📝 **ตัวอย่างการใช้งาน**

### **Example 1: Registration Mhai (Guest Logic)**
```yaml
Step: Contact Information
Fields:
  - First Name (text)
  - Last Name (text)
  - Number of Guests (number)

Logic Rule 1:
  Conditions:
    - Number of Guests > 0
  Actions:
    - Show Step: "Guest Details"

Logic Rule 2:
  Conditions:
    - Number of Guests = 0
  Actions:
    - Jump to Step: "Thank You"
```

### **Example 2: Age-based Form**
```yaml
Step: Personal Info
Fields:
  - Age (number)
  - Country (single_choice)

Logic Rule:
  Conditions:
    - Age >= 18
    AND Country = "Thailand"
  Actions:
    - Show Step: "Adult Services"
    - Set Field Value: { step: "Services", field: "category", value: "adult" }
```

### **Example 3: Email Provider Logic**
```yaml
Step: Contact Details
Fields:
  - Email (email)

Logic Rule 1:
  Conditions:
    - Email contains "@gmail"
  Actions:
    - Show Message: "Gmail users get special discounts!"
    - Show Step: "Gmail Promotion"

Logic Rule 2:
  Conditions:
    - Email contains "@company.com"
  Actions:
    - Jump to Step: "Business Account Setup"
```

### **Example 4: Multi-condition Logic**
```yaml
Step: Product Selection
Fields:
  - Product Type (single_choice: Premium/Basic)
  - Budget (number)
  - Company Size (single_choice)

Logic Rule:
  Conditions:
    - Product Type = "Premium"
    AND Budget > 10000
    OR Company Size = "Enterprise"
  Actions:
    - Show Step: "Enterprise Features"
    - Set Field Value: { step: "Pricing", field: "discount", value: "20%" }
    - Show Message: "You qualify for enterprise pricing!"
```

## 🎮 **Advanced Logic Patterns**

### **Pattern 1: Progressive Disclosure**
```yaml
# แสดงข้อมูลเพิ่มเติมตามความต้องการ
Step 1: Basic Info → Always shown
Step 2: Advanced Options → Show if "Advanced User" = Yes
Step 3: Expert Settings → Show if "Experience Level" = "Expert"
```

### **Pattern 2: Smart Routing**
```yaml
# นำทางไปยัง flow ที่เหมาะสม
Registration Type = "Individual" → Personal Flow
Registration Type = "Business" → Business Flow  
Registration Type = "Student" → Student Discount Flow
```

### **Pattern 3: Dynamic Validation**
```yaml
# แก้ไขข้อมูลตามเงื่อนไข
Country = "Thailand" → Show Thai ID field
Country = "USA" → Show SSN field
Country = "Other" → Show Passport field
```

### **Pattern 4: Auto-completion**
```yaml
# กรอกข้อมูลอัตโนมัติ
Email contains "@company.com" → Set Company = "ABC Corp"
Phone starts with "+66" → Set Country = "Thailand"
```

## 🔧 **Technical Implementation**

### **Logic Data Structure:**
```typescript
interface StepLogic {
  id: string;
  stepId: string;
  conditions: Condition[];
  actions: {
    showStep?: string;
    hideStep?: string;
    jumpToStep?: string;
    setFieldValue?: { fieldId: string; value: any };
    showMessage?: string;
  };
}

interface Condition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_empty' | 'is_empty';
  value: string | number;
  logicOperator?: 'AND' | 'OR';
}
```

### **Logic Evaluation:**
```typescript
// Logic ประมวลผลแบบ real-time
const evaluateLogic = (stepLogic: StepLogic[], formData: any) => {
  return stepLogic.map(rule => {
    const conditionResults = rule.conditions.map(condition => {
      const fieldValue = formData[condition.fieldId];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        // ... other operators
      }
    });
    
    // Combine with AND/OR logic
    const finalResult = combineConditions(conditionResults, rule.conditions);
    
    if (finalResult) {
      executeActions(rule.actions);
    }
  });
};
```

## 🎨 **UI/UX Best Practices**

### **Logic Builder Interface:**
```
✅ Visual Logic Rules:
- Clear IF/THEN statements
- Color-coded conditions (blue)
- Action arrows (green)
- Easy edit/delete buttons

✅ Field Selection:
- Grouped by steps
- Clear field labels
- Type-appropriate operators

✅ Value Input:
- Auto-complete for choice fields
- Type validation (numbers, text)
- Smart suggestions
```

### **Preview Integration:**
```
✅ Live Preview:
- Shows logic effects in real-time
- Highlights conditional steps
- Demonstrates flow changes
- Interactive testing
```

## 🧪 **Testing Logic Rules**

### **Test Cases:**

#### **Test 1: Basic Condition**
```
1. เพิ่ม logic: "Age > 18" → "Show Adult Form"
2. ใน Preview: ใส่ Age = 20
3. ✅ ต้องเห็น "Adult Form" step ปรากฏ
```

#### **Test 2: Multiple Conditions (AND)**
```
1. Logic: "Age > 18 AND Country = Thailand" → "Show Thai Adult Form"
2. Test: Age = 20, Country = Thailand → ✅ แสดง step
3. Test: Age = 16, Country = Thailand → ❌ ไม่แสดง step
```

#### **Test 3: Multiple Conditions (OR)**
```
1. Logic: "Premium = Yes OR Budget > 10000" → "Show Premium Features"
2. Test: Premium = Yes, Budget = 5000 → ✅ แสดง
3. Test: Premium = No, Budget = 15000 → ✅ แสดง
4. Test: Premium = No, Budget = 5000 → ❌ ไม่แสดง
```

## 🎯 **Common Use Cases**

### **1. E-commerce Forms:**
```
Product Interest → Show relevant products
Budget Range → Show appropriate pricing tiers
Company Size → Show business vs individual options
```

### **2. Survey Forms:**
```
Demographics → Customize subsequent questions
Previous experience → Skip basic questions
Interests → Show relevant follow-up sections
```

### **3. Registration Forms:**
```
Account Type → Show relevant features
Location → Show local options/pricing
Experience Level → Customize onboarding flow
```

### **4. Contact Forms:**
```
Inquiry Type → Show relevant contact info
Urgency Level → Route to appropriate team
Customer Type → Show account-specific options
```

## 🚀 **Benefits**

### **For Users:**
- ✅ **Personalized Experience**: เห็นเฉพาะสิ่งที่เกี่ยวข้อง
- ✅ **Shorter Forms**: ข้าม steps ที่ไม่จำเป็น
- ✅ **Smart Defaults**: ข้อมูลกรอกอัตโนมัติ
- ✅ **Clear Flow**: ทิศทางชัดเจน

### **For Form Creators:**
- ✅ **Higher Completion**: form สั้นและเกี่ยวข้อง
- ✅ **Better Data**: ข้อมูลมีคุณภาพสูง
- ✅ **Reduced Abandonment**: ไม่ซับซ้อนเกินไป
- ✅ **Flexible Logic**: ปรับเปลี่ยนง่าย

---

## 🎉 **สรุป**

**Logic & Conditions ทำให้ forms ของคุณฉลาดขึ้น!**

### **วิธีใช้งาน:**
1. 🏗️ **สร้าง Steps** ปกติ
2. 🧠 **เพิ่ม Logic** ในแต่ละ step
3. 🎯 **ตั้งค่า Conditions** และ Actions
4. 👁️ **Preview** เพื่อทดสอบ logic
5. 🚀 **Publish** form พร้อม smart behavior

### **ความสามารถ:**
- ✅ **Conditional Show/Hide**: แสดง/ซ่อน steps
- ✅ **Smart Routing**: กระโดดไป steps ที่เหมาะสม
- ✅ **Auto-fill**: กรอกข้อมูลอัตโนมัติ
- ✅ **Custom Messages**: แสดงข้อความพิเศษ
- ✅ **Complex Logic**: AND/OR conditions

**ลองสร้าง Dynamic Form ที่ตอบสนองต่อ user ดูครับ!** 🚀
