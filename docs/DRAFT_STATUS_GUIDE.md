# Draft Status & Diff System Guide

## ภาพรวม

ระบบ Draft Status และ Diff ช่วยให้ผู้ใช้เห็นการเปลี่ยนแปลงระหว่าง draft version และ published version ของ flow แบบ real-time

## คุณสมบัติหลัก

### 1. Draft Status Indicator
แสดงสถานะและการเปลี่ยนแปลงในหน้า FlowBuilder:

**สำหรับ Flow ใหม่ที่ยังไม่ publish:**
- แสดงข้อความ "Flow ใหม่ที่ยังไม่ได้ Publish"
- ไอคอน AlertCircle สีเหลือง
- ไม่มีปุ่มดูรายละเอียด

**สำหรับ Flow ที่มีการแก้ไข:**
- แสดงข้อความ "มีการเปลี่ยนแปลงที่ยังไม่ได้ Publish"
- ไอคอน GitBranch สีเหลือง
- สรุปการเปลี่ยนแปลง เช่น "แก้ไข 2 รายการ, เพิ่ม 1 รายการ"
- ปุ่ม "ดูรายละเอียด" เพื่อดู diff แบบละเอียด

### 2. Detailed Diff View
เมื่อคลิก "ดูรายละเอียด" จะแสดง:

**ประเภทการเปลี่ยนแปลง:**
- 🟢 **เพิ่ม** - เนื้อหาใหม่ที่ยังไม่มีใน published version
- 🔵 **แก้ไข** - เนื้อหาที่มีการเปลี่ยนแปลงจาก published version  
- 🔴 **ลบ** - เนื้อหาที่ถูกลบออกจาก published version

**สิ่งที่ตรวจสอบ:**
- ชื่อ Flow (title)
- คำอธิบาย (description)
- จำนวน steps และชื่อของแต่ละ step
- จำนวนคำถามในแต่ละ step
- ธีม (theme)
- การตั้งค่าต่างๆ (settings)

### 3. Draft Status Badge
แสดงใน Dashboard บนรายการ flows:

- Badge สีเหลือง "ยังไม่ publish" สำหรับ flow ใหม่
- Badge สีเหลือง "มีการแก้ไข" สำหรับ flow ที่มีการเปลี่ยนแปลง
- ไม่แสดงอะไรถ้าไม่มีการเปลี่ยนแปลง

## การทำงานภายใน

### Data Structure
ระบบใช้ข้อมูลจาก API ที่ส่งมาในรูปแบบ:

```typescript
{
  id: "flow-id",
  title: "ชื่อปัจจุบัน",
  // ... ข้อมูล draft อื่นๆ
  versions: {
    draft: { /* ข้อมูล draft */ },
    published: { /* ข้อมูล published หรือ null */ }
  }
}
```

### Components

**1. `DraftStatusIndicator`**
- ใช้ในหน้า FlowBuilder
- รับ `currentFlow` เป็น props
- แสดง warning banner พร้อมรายละเอียด

**2. `DraftStatusBadge`**  
- ใช้ใน Dashboard
- แสดง badge เล็กๆ บอกสถานะ
- รองรับ size `small` และ `medium`

**3. `diffUtils.ts`**
- `compareFlowVersions()` - เปรียบเทียบ 2 versions
- `getDiffSummary()` - สร้างข้อความสรุป
- ส่งคืน `DiffResult` พร้อม array ของ `Difference`

### Difference Types

```typescript
interface Difference {
  type: 'added' | 'modified' | 'removed';
  section: 'title' | 'description' | 'steps' | 'settings' | 'theme';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string; // ข้อความภาษาไทย
}
```

## การใช้งาน

### สำหรับผู้ใช้:

1. **สร้าง Flow ใหม่:**
   - จะเห็น warning "Flow ใหม่ที่ยังไม่ได้ Publish"
   - กด "Publish" เพื่อเผยแพร่

2. **แก้ไข Flow ที่ publish แล้ว:**
   - ทำการแก้ไข (เช่น เปลี่ยนชื่อ, เพิ่ม step)
   - จะเห็น warning "มีการเปลี่ยนแปลงที่ยังไม่ได้ Publish"
   - คลิก "ดูรายละเอียด" เพื่อดู diff
   - กด "Update Published" เพื่อ update

3. **ใน Dashboard:**
   - ดู badge สถานะของแต่ละ flow
   - เข้าไปแก้ไขเมื่อต้องการ

### สำหรับ Developer:

**เพิ่ม DraftStatusIndicator:**
```tsx
import { DraftStatusIndicator } from '../components/DraftStatusIndicator';

<DraftStatusIndicator currentFlow={currentFlow} />
```

**เพิ่ม DraftStatusBadge:**
```tsx
import { DraftStatusBadge } from '../components/DraftStatusIndicator';

<DraftStatusBadge currentFlow={flow} size="small" />
```

**ใช้ diff utilities:**
```tsx
import { compareFlowVersions, getDiffSummary } from '../utils/diffUtils';

const diffResult = compareFlowVersions(draftData, publishedData);
const summary = getDiffSummary(diffResult);
```

## Styling

ใช้ Tailwind CSS classes:
- สีเหลือง (`amber-*`) สำหรับ warning/draft status
- สีเขียว (`green-*`) สำหรับ added items
- สีน้ำเงิน (`blue-*`) สำหรับ modified items  
- สีแดง (`red-*`) สำหรับ removed items

## ข้อจำกัด

1. **การเปรียบเทียบแบบ Shallow:** ตอนนี้เปรียบเทียบแค่ level แรกของ objects
2. **ไม่มี Visual Diff:** ยังไม่มี side-by-side comparison
3. **ไม่ Persist Expand State:** สถานะ expand/collapse จะ reset เมื่อ re-render

## การพัฒนาต่อ

1. **Deep Object Comparison:** เพิ่มการเปรียบเทียบ field validation, logic conditions
2. **Visual Diff Component:** แสดง before/after แบบ side-by-side
3. **Diff History:** เก็บประวัติการเปลี่ยนแปลง
4. **Collaborative Editing:** แสดงการเปลี่ยนแปลงจากหลายคน
