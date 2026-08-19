// ====== อย่าลืมนำ URL จาก Apps Script (ที่ Deploy ใหม่) มาใส่ตรงนี้นะครับ ======
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOl7uq2rPfB67j7aPfmNJ9GOQdLRdE6TgO6kNi7zrpaJLzDefi0pM6RcK-_kqKx1-P/exec';

let userPdpaConsent = ''; // ตัวแปรเก็บค่าการยินยอม PDPA

// ฟังก์ชันสลับหน้า
function showSection(sectionId) {
  document.getElementById('pdpaSection').classList.add('hidden');
  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('vanSection').classList.add('hidden');
  document.getElementById('motoSection').classList.add('hidden');
  
  document.getElementById(sectionId).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ฟังก์ชันตรวจสอบ PDPA และเก็บค่าไว้
function handlePdpaNext() {
  const selected = document.querySelector('input[name="pdpaConsent"]:checked');
  if (!selected) {
    alert('กรุณาเลือกข้อตกลงยอมรับข้อมูลก่อนดำเนินการ');
    return;
  }
  
  // บันทึกค่าที่เลือกว่า 'ยินยอม' หรือ 'ไม่ยินยอม'
  userPdpaConsent = selected.value === 'agree' ? 'ยินยอม' : 'ไม่ยินยอม';
  
  showSection('mainMenu');
}

// ป้องกันพิมพ์อักษรในช่องเบอร์โทร
['dormPhone', 'driverPhone'].forEach(id => {
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, ''));
});

// ================= จัดการฟอร์มรถตู้ =================
document.getElementById('vanForm').addEventListener('submit', function(event) {
  event.preventDefault(); 
  submitData('van', {
    dormName: document.getElementById('dormName').value,
    dormPhone: document.getElementById('dormPhone').value,
    driverName: document.getElementById('driverName').value,
    driverPhone: document.getElementById('driverPhone').value,
    licensePlate: document.getElementById('licensePlate').value,
    province: document.getElementById('province').value,
    brand: document.getElementById('brand').value,
    color: document.getElementById('color').value,
    meeting: document.querySelector('input[name="vanMeeting"]:checked').value
  });
});

// ================= จัดการฟอร์มวินมอเตอร์ไซค์ =================
document.getElementById('motoForm').addEventListener('submit', function(event) {
  event.preventDefault(); 
  submitData('moto', {
    winLocation: document.getElementById('winLocation').value,
    riderName: document.getElementById('riderName').value,
    winNumber: document.getElementById('winNumber').value,
    winColor: document.getElementById('winColor').value,
    motoModel: document.getElementById('motoModel').value,
    motoColor: document.getElementById('motoColor').value,
    licensePlate: document.getElementById('motoLicensePlate').value,
    meeting: document.querySelector('input[name="motoMeeting"]:checked').value
  });
});

// ================= ฟังก์ชันหลักส่งข้อมูลไป Google Sheets (กดแล้วส่งเลยไม่ต้องรอ) =================
function submitData(formType, data) {
  const prefix = formType === 'van' ? 'van' : 'moto';
  const btn = document.getElementById(prefix + 'SubmitBtn');
  const spinner = document.getElementById(prefix + 'Spinner');
  const btnText = document.getElementById(prefix + 'BtnText');
  const statusMsg = document.getElementById(prefix + 'StatusMessage');
  
  data.formType = formType;
  data.pdpa = userPdpaConsent; // แนบข้อมูล PDPA ไปด้วย
  
  // เปลี่ยนสถานะปุ่มตอนกด
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.innerText = 'กำลังส่งข้อมูล...';
  statusMsg.style.display = 'none';

  // 1. ยิงข้อมูลไปหา Apps Script โดยปล่อยให้มันทำงานอยู่เบื้องหลัง (ไม่ต้องรอรับค่า)
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  }).catch(error => console.error('Error in background sync:', error));

  // 2. ไม่ต้องรอให้โหลดเสร็จ ให้ UI แสดงว่าสำเร็จทันที (หน่วงเวลาเนียนๆ 0.5 วินาที)
  setTimeout(() => {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.innerText = formType === 'van' ? 'บันทึกข้อมูลรถตู้' : 'บันทึกข้อมูลรถจักรยานยนต์';
    
    // โชว์กล่องสำเร็จ
    statusMsg.className = 'status-msg status-success';
    statusMsg.innerHTML = '✅ บันทึกข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว';
    statusMsg.style.display = 'block';
    
    // รีเซ็ตฟอร์ม
    document.getElementById(prefix + 'Form').reset();
    
    // ซ่อนกล่องข้อความสำเร็จใน 5 วินาที
    setTimeout(() => { statusMsg.style.display = 'none'; }, 5000);
  }, 500);
}