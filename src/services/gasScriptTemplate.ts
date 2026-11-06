/**
 * Full Google Apps Script (Code.gs) source code template for SI-PAB Workshop PTKI Medan.
 * Includes complete Authentication, Single Admin Account, Student Registration, 
 * Login History, and Relational Sheets management with LockService.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SI-PAB WORKSHOP PTKI MEDAN - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Sistem Informasi Peminjaman Alat dan Pemakaian Bahan Workshop PTKI Medan
 * =========================================================================
 * 
 * STRUKTUR DATABASE GOOGLE SHEETS (10 TABEL):
 * 1. Admin              - Akun tunggal Administrator Workshop
 * 2. Users              - Data Mahasiswa terdaftar (NIM, Prodi, Kelas, Password_Hash)
 * 3. Login_History      - Log audit login akun
 * 4. Equipment          - Inventaris alat & mesin workshop
 * 5. Materials          - Inventaris bahan habis pakai & reagen
 * 6. Borrowing_Transactions - Peminjaman alat & status serah terima
 * 7. Return_Transactions    - Pengembalian alat & verifikasi kondisi fisik
 * 8. Material_Usage         - Permohonan & pengeluaran bahan fisik
 * 9. Transaction_History    - Log audit terpadu seluruh aktivitas
 * 10. Settings              - Konfigurasi nama kepala lab, NIP, parameter
 */

const SHEET_NAMES = {
  ADMIN: 'Admin',
  USERS: 'Users',
  LOGIN_HISTORY: 'Login_History',
  EQUIPMENT: 'Equipment',
  MATERIALS: 'Materials',
  BORROWING: 'Borrowing_Transactions',
  RETURNS: 'Return_Transactions',
  USAGE: 'Material_Usage',
  HISTORY: 'Transaction_History',
  SETTINGS: 'Settings'
};

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const action = (e && e.parameter && e.parameter.action) || 'GET_ALL_DATA';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndInitSheets(ss);

    let result = {};

    if (action === 'PING') {
      result = {
        status: 'success',
        message: 'Koneksi SI-PAB PTKI Medan ke Google Apps Script Berhasil Aktif!',
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        timestamp: new Date().toISOString()
      };
    } else if (action === 'GET_ALL_DATA') {
      result = {
        status: 'success',
        admin: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.ADMIN))[0] || null,
        users: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.USERS)),
        loginHistory: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.LOGIN_HISTORY)),
        equipment: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.EQUIPMENT)),
        materials: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.MATERIALS)),
        borrowings: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.BORROWING)),
        returns: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.RETURNS)),
        materialUsages: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.USAGE)),
        history: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.HISTORY)),
        settings: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.SETTINGS))[0] || {}
      };
    } else {
      result = { status: 'error', message: 'Aksi GET tidak valid: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(30000);

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Server sibuk memproses transaksi lain. Silakan coba sesaat lagi.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndInitSheets(ss);

    let response = { status: 'success' };

    switch (action) {
      case 'REGISTER_STUDENT':
        response = handleRegisterStudent(ss, payload.data);
        break;

      case 'BORROW_EQUIPMENT':
        response = appendRecordToSheet(ss.getSheetByName(SHEET_NAMES.BORROWING), payload.data);
        break;

      case 'APPROVE_BORROW':
        response = handleApproveBorrow(ss, payload.data);
        break;

      case 'RETURN_EQUIPMENT':
        response = handleReturnEquipment(ss, payload.data);
        break;

      case 'USE_MATERIAL':
        response = appendRecordToSheet(ss.getSheetByName(SHEET_NAMES.USAGE), payload.data);
        break;

      case 'APPROVE_MATERIAL':
        // Material stock only deducted when officially approved and issued
        response = handleDeductMaterial(ss, payload.data);
        break;

      case 'LOG_LOGIN':
        response = appendRecordToSheet(ss.getSheetByName(SHEET_NAMES.LOGIN_HISTORY), payload.data);
        break;

      default:
        response = { status: 'error', message: 'Aksi POST tidak dikenali: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function checkAndInitSheets(ss) {
  const schemas = {
    [SHEET_NAMES.ADMIN]: ['Admin_ID', 'Username', 'Email', 'Full_Name', 'Password_Hash', 'Role', 'Created_At'],
    [SHEET_NAMES.USERS]: ['User_ID', 'Full_Name', 'NIM', 'Study_Program', 'Class', 'Email', 'WhatsApp', 'Password_Hash', 'Role', 'Account_Status', 'Created_At', 'Last_Login'],
    [SHEET_NAMES.LOGIN_HISTORY]: ['Login_ID', 'User_ID', 'User_Name', 'Role', 'Login_Date', 'Login_Status', 'Device'],
    [SHEET_NAMES.EQUIPMENT]: ['id', 'code', 'name', 'category', 'totalQty', 'availableQty', 'condition', 'location', 'description', 'lastMaintenance'],
    [SHEET_NAMES.MATERIALS]: ['id', 'code', 'name', 'category', 'stock', 'unit', 'minStock', 'location', 'description'],
    [SHEET_NAMES.BORROWING]: ['id', 'transactionCode', 'borrowerName', 'borrowerId', 'department', 'equipmentId', 'equipmentName', 'quantity', 'borrowDate', 'expectedReturnDate', 'status', 'approvedBy', 'createdAt'],
    [SHEET_NAMES.RETURNS]: ['id', 'returnCode', 'borrowingTransactionId', 'transactionCode', 'borrowerName', 'equipmentName', 'quantity', 'actualReturnDate', 'conditionUponReturn', 'notes', 'penalty', 'confirmedBy', 'createdAt'],
    [SHEET_NAMES.USAGE]: ['id', 'usageCode', 'userName', 'userId', 'department', 'materialName', 'category', 'quantityUsed', 'unit', 'usageDate', 'purpose', 'status', 'approvedBy', 'createdAt'],
    [SHEET_NAMES.HISTORY]: ['id', 'referenceCode', 'type', 'timestamp', 'actorName', 'actorId', 'department', 'itemType', 'itemName', 'quantity', 'unit', 'status', 'details', 'operator'],
    [SHEET_NAMES.SETTINGS]: ['workshopName', 'institutionName', 'labHeadName', 'labHeadNip', 'lastSyncTime']
  };

  for (const name in schemas) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(schemas[name]);
      sheet.getRange(1, 1, 1, schemas[name].length).setFontWeight('bold').setBackground('#0B3C5D').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }

  // Pre-seed default Administrator if Admin sheet empty
  const adminSheet = ss.getSheetByName(SHEET_NAMES.ADMIN);
  if (adminSheet.getLastRow() <= 1) {
    adminSheet.appendRow([
      'ADM-PTKI-001',
      'admin',
      'admin.workshop@ptki.ac.id',
      'Ir. Bambang Suhartono, M.T.',
      'PTKI_ADMIN_SALT_99:99ed3e6532b6a88135d326b56aaa21ed4a61029a1f02c85f267a2b3a113cc3b7',
      'admin',
      new Date().toISOString()
    ]);
  }
}

function handleRegisterStudent(ss, data) {
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const existing = sheet.getDataRange().getValues();
  // Check unique NIM and Email
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][2] == data.nim_nip) {
      return { status: 'error', message: 'NIM ' + data.nim_nip + ' sudah terdaftar!' };
    }
    if (existing[i][5] == data.email) {
      return { status: 'error', message: 'Email ' + data.email + ' sudah terdaftar!' };
    }
  }

  sheet.appendRow([
    data.id,
    data.name,
    data.nim_nip,
    data.department,
    data.classSemester || '-',
    data.email,
    data.whatsApp || data.phone || '-',
    data.passwordHash,
    'student',
    data.status || 'active',
    new Date().toISOString(),
    new Date().toISOString()
  ]);

  return { status: 'success', message: 'Pendaftaran mahasiswa berhasil disimpan ke Google Sheets.' };
}

function appendRecordToSheet(sheet, data) {
  if (!sheet) return { status: 'error', message: 'Sheet tidak ditemukan.' };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => (data[h] !== undefined ? data[h] : ''));
  sheet.appendRow(row);
  return { status: 'success', message: 'Data berhasil dicatat.' };
}

function handleApproveBorrow(ss, data) {
  const eqSheet = ss.getSheetByName(SHEET_NAMES.EQUIPMENT);
  const eqData = eqSheet.getDataRange().getValues();
  const headers = eqData[0];
  const idIdx = headers.indexOf('id');
  const availIdx = headers.indexOf('availableQty');

  for (let i = 1; i < eqData.length; i++) {
    if (eqData[i][idIdx] === data.equipmentId) {
      const currentAvail = Number(eqData[i][availIdx]);
      if (currentAvail >= data.quantity) {
        eqSheet.getRange(i + 1, availIdx + 1).setValue(currentAvail - data.quantity);
      }
      break;
    }
  }
  return { status: 'success', message: 'Peminjaman disetujui & stok dipotong.' };
}

function handleReturnEquipment(ss, data) {
  appendRecordToSheet(ss.getSheetByName(SHEET_NAMES.RETURNS), data);
  const eqSheet = ss.getSheetByName(SHEET_NAMES.EQUIPMENT);
  const eqData = eqSheet.getDataRange().getValues();
  const eqHeaders = eqData[0];
  const nameIdx = eqHeaders.indexOf('name');
  const availIdx = eqHeaders.indexOf('availableQty');

  for (let i = 1; i < eqData.length; i++) {
    if (eqData[i][nameIdx] === data.equipmentName) {
      const currentAvail = Number(eqData[i][availIdx]);
      eqSheet.getRange(i + 1, availIdx + 1).setValue(currentAvail + Number(data.quantity));
      break;
    }
  }
  return { status: 'success', message: 'Pengembalian alat dicatat & stok dikembalikan.' };
}

function handleDeductMaterial(ss, data) {
  const matSheet = ss.getSheetByName(SHEET_NAMES.MATERIALS);
  const matData = matSheet.getDataRange().getValues();
  const headers = matData[0];
  const idIdx = headers.indexOf('id');
  const stockIdx = headers.indexOf('stock');

  for (let i = 1; i < matData.length; i++) {
    if (matData[i][idIdx] === data.materialId) {
      const currentStock = Number(matData[i][stockIdx]);
      const newStock = Math.max(0, currentStock - Number(data.quantityUsed));
      matSheet.getRange(i + 1, stockIdx + 1).setValue(newStock);
      break;
    }
  }
  return { status: 'success', message: 'Bahan dikeluarkan & stok resmi dipotong.' };
}

function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}
`;
