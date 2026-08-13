// ⚠️ อย่าลืมใส่ URL ของ Web App ใหม่ (หากได้ลิงก์ใหม่จากขั้นตอนที่ 1)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTHX3xJ3INCV2EcMg53Zf4LYaZ9HI7k2SvFxzZBeKstU9etSAY_yeIuNCKlZZ5gw2R/exec';

// ฟังก์ชันสลับหน้า
function showSection(sectionId) {
  // ซ่อนทุกหน้า
  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('vanSection').classList.add('hidden');
  document.getElementById('motoSection').classList.add('hidden');
  
  // แสดงเฉพาะหน้าที่เลือก
  document.getElementById(sectionId).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ป้องกันพิมพ์อักษรในช่องเบอร์โทร (เฉพาะรถตู้)
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
    color: document.getElementById('color').value
  });
});

// ================= จัดการฟอร์มวินมอเตอร์ไซค์ =================
document.getElementById('motoForm').addEventListener('submit', function(event) {
  event.preventDefault(); 
  submitData('moto', {
    winLocation: document.getElementById('winLocation').value,
    riderName: document.getElementById('riderName').value,
    motoModel: document.getElementById('motoModel').value,
    motoColor: document.getElementById('motoColor').value,
    licensePlate: document.getElementById('motoLicensePlate').value
  });
});

// ================= ฟังก์ชันหลักในการส่งข้อมูลไป Google Sheets =================
function submitData(formType, data) {
  // ระบุ ID ของปุ่มและสถานะตามประเภทฟอร์ม
  const prefix = formType === 'van' ? 'van' : 'moto';
  const btn = document.getElementById(prefix + 'SubmitBtn');
  const spinner = document.getElementById(prefix + 'Spinner');
  const btnText = document.getElementById(prefix + 'BtnText');
  const statusMsg = document.getElementById(prefix + 'StatusMessage');
  
  // แนบประเภทฟอร์มเข้าไปในข้อมูลด้วย
  data.formType = formType;
  
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.innerText = 'กำลังส่งข้อมูล...';
  statusMsg.style.display = 'none';

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(res => {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.innerText = formType === 'van' ? 'บันทึกข้อมูลรถตู้' : 'บันทึกข้อมูลรถจักรยานยนต์';
    
    statusMsg.style.display = 'block';
    
    if (res.status === 'success') {
      statusMsg.className = 'status-msg status-success';
      statusMsg.innerHTML = '✅ บันทึกข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว';
      
      document.getElementById(prefix + 'Form').reset();
      
      setTimeout(() => { statusMsg.style.display = 'none'; }, 5000);
    } else {
      throw new Error(res.message || 'Unknown error');
    }
  })
  .catch(error => {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.innerText = formType === 'van' ? 'บันทึกข้อมูลรถตู้' : 'บันทึกข้อมูลรถจักรยานยนต์';
    
    statusMsg.style.display = 'block';
    statusMsg.className = 'status-msg status-error';
    statusMsg.innerHTML = '❌ การเชื่อมต่อล้มเหลว โปรดลองใหม่อีกครั้ง';
  });
}