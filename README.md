# คู่มือการใช้งานและการติดตั้ง Google Sheets กับเว็บไซต์แบบสอบถาม

โปรเจกต์นี้ได้รับการพัฒนาขึ้นโดยเน้นการใช้เทคโนโลยีฝั่งไคลเอนต์ (HTML/CSS/JS) ทั้งหมด เพื่อให้คุณสามารถนำไปเปิดใช้งานได้ง่าย ๆ บน **GitHub Pages** หรือโฮสติ้งฟรีอื่น ๆ โดยสามารถส่งข้อมูลเข้าสู่ **Google Sheets** ของคุณได้โดยตรงผ่าน **Google Apps Script**

---

## 📋 ขั้นตอนการตั้งค่า Google Sheets

ในการเปิดใช้งานระบบบันทึกข้อมูลไปยัง Google Sheets คุณสามารถตั้งค่าได้ง่าย ๆ ใน 5 นาทีตามขั้นตอนด้านล่างนี้ครับ:

### ขั้นตอนที่ 1: สร้าง Google Sheets และเตรียมคอลัมน์
1. เข้าไปที่ [Google Sheets](https://sheets.google.com) และสร้างตารางใหม่ (Blank spreadsheet)
2. ตั้งชื่อแผ่นงาน (Sheet) เช่น "แบบสอบถามข้อมูลส่วนตัว"
3. ในแถวแรก (แถวที่ 1) ให้คัดลอกชื่อคอลัมน์เหล่านี้ไปวางในแต่ละคอลัมน์ (เรียงจาก A ถึง M):
   - **A1:** `Timestamp`
   - **B1:** `Fullname`
   - **C1:** `Nickname`
   - **D1:** `Birthdate`
   - **E1:** `Age`
   - **F1:** `Gender`
   - **G1:** `Email`
   - **H1:** `Phone`
   - **I1:** `Social`
   - **J1:** `Address`
   - **K1:** `Hobbies`
   - **L1:** `ContactMethod`
   - **M1:** `Bio`

---

### ขั้นตอนที่ 2: ติดตั้ง Google Apps Script
1. ที่เมนูด้านบนของ Google Sheet ให้คลิกที่ **ส่วนขยาย (Extensions)** -> **Apps Script**
2. ลบโค้ดเดิมทั้งหมดในโปรแกรมแก้ไขโค้ดออก
3. คัดลอกโค้ดด้านล่างนี้ไปวางแทนที่:

```javascript
function doPost(e) {
  try {
    // กำหนดแผ่นงานที่ใช้งานอยู่
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // ดึงข้อมูล JSON ที่ส่งมาจากหน้าเว็บไซต์
    var data = JSON.parse(e.postData.contents);
    
    // จัดเตรียมข้อมูลแถวใหม่ให้ตรงกับหัวข้อคอลัมน์ที่เราตั้งไว้
    var newRow = [
      data.timestamp,
      data.fullname,
      data.nickname,
      data.birthdate,
      data.age,
      data.gender,
      data.email,
      data.phone,
      data.social,
      data.address,
      data.hobbies,
      data.contactMethod,
      data.bio
    ];
    
    // เพิ่มแถวข้อมูลลงในชีท
    sheet.appendRow(newRow);
    
    // ตอบกลับเพื่อส่งสัญญาณว่าบันทึกสำเร็จ
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกข้อมูลเรียบร้อย" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. กดปุ่ม 💾 **บันทึกโครงการ (Save project)** (รูปไอคอนแผ่นดิสก์ด้านบน)

---

### ขั้นตอนที่ 3: เผยแพร่ Apps Script เป็น Web App
1. คลิกปุ่ม **การทำให้ใช้งานได้ (Deploy)** ที่มุมขวาบน -> เลือก **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกที่รูปเฟืองข้างข้อความ "เลือกประเภท" แล้วเลือก **เว็บแอป (Web app)**
3. ตั้งค่ารายละเอียดดังนี้:
   - **คำอธิบาย (Description):** `Personal Info Survey API`
   - **เรียกใช้งานในฐานะ (Execute as):** เลือก **ฉัน (อีเมลของคุณ)**
   - **ผู้ที่มีสิทธิ์เข้าถึง (Who has access):** เลือก **ทุกคน (Anyone)** *(สำคัญมาก! เพื่อให้หน้าเว็บส่งข้อมูลเข้าชีทได้โดยไม่ต้องลงชื่อเข้าใช้)*
4. คลิกปุ่ม **การทำให้ใช้งานได้ (Deploy)**
5. ในครั้งแรก ระบบจะขึ้นเตือนให้ขออนุมัติสิทธิ์การเข้าถึง (Authorize access):
   - คลิก **ให้สิทธิ์การเข้าถึง (Authorize access)**
   - เลือกบัญชี Google ของคุณ
   - ระบบจะเตือนว่า "Google ยังไม่ได้ตรวจสอบแอปนี้" ให้คลิก **ขั้นสูง (Advanced)** ที่อยู่ด้านล่างซ้าย
   - คลิก **ไปที่ [ชื่อโครงการของคุณ] (ไม่ปลอดภัย)** หรือ **Go to Untitled project (unsafe)**
   - คลิก **อนุญาต (Allow)**
6. เมื่อทำเสร็จแล้ว ระบบจะแสดง URL ของเว็บแอป (Web app URL) ให้คุณกด **คัดลอก (Copy)** ลิงก์เก็บไว้ (ตัวอย่างลิงก์: `https://script.google.com/macros/s/.../exec`)

---

### ขั้นตอนที่ 4: นำ URL ไปเชื่อมต่อในหน้าเว็บไซต์
เมื่อคุณเปิดหน้าเว็บแบบสอบถามข้อมูลขึ้นมา ใน **ขั้นตอนที่ 4 (หน้าตรวจสอบและยืนยันข้อมูล)** จะมีช่องให้ใส่ **Google Apps Script Web App URL**:
1. นำลิงก์ที่คัดลอกมาวางลงในช่องดังกล่าว
2. แถบสถานะด้านล่างช่องจะเปลี่ยนเป็นสีเขียวระบุ **"เชื่อมต่อ Google Sheets API แล้ว (โหมดใช้งานจริง)"**
3. กดยืนยันการส่งข้อมูล ข้อมูลทั้งหมดจะวิ่งเข้าไปปรากฏบนหน้า Google Sheet ของคุณแบบเรียลไทม์ทันที!

*หมายเหตุ: หากเว้นว่างช่อง URL นี้ไว้ ระบบจะทำงานใน **โหมดสาธิต (Demo Mode)** บันทึกข้อมูลจำลองเก็บไว้ในบราวเซอร์ของคุณเองโดยไม่ได้ส่งออกไปยังภายนอก เพื่อให้สะดวกแก่การทดลองระบบก่อน*

---

## 🚀 การนำขึ้นเผยแพร่บน GitHub Pages
1. อัปโหลดไฟล์ทั้งหมดขึ้นสู่คลังรหัส (Repository) บน GitHub
2. ไปที่การตั้งค่าของคลังรหัสของคุณ (**Settings**) -> ไปที่แถบเมนู **Pages** ด้านซ้าย
3. ในส่วนของ **Build and deployment** ให้เลือก Source เป็น **Deploy from a branch**
4. เลือก Branch เป็น `main` หรือ `master` และโฟลเดอร์เป็น `/ (root)` จากนั้นกด **Save**
5. รอสักครู่ GitHub จะทำหน้าที่เผยแพร่หน้าเว็บสอบถามข้อมูลของคุณแบบออนไลน์ผ่าน URL ส่วนตัว เช่น `https://[ชื่อผู้ใช้].github.io/[ชื่อโปรเจกต์]/` ทันที!
