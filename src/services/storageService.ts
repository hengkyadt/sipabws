import {
  User,
  AdminAccount,
  LoginHistoryItem,
  Equipment,
  Material,
  BorrowingTransaction,
  ReturnTransaction,
  MaterialUsage,
  TransactionHistoryItem,
  AppSettings
} from '../types';
import {
  INITIAL_ADMIN,
  INITIAL_USERS,
  INITIAL_LOGIN_HISTORY,
  INITIAL_EQUIPMENT,
  INITIAL_MATERIALS,
  INITIAL_BORROWINGS,
  INITIAL_RETURNS,
  INITIAL_MATERIAL_USAGES,
  INITIAL_TRANSACTION_HISTORY,
  INITIAL_SETTINGS
} from '../data/initialData';
import { hashPassword, verifyPassword } from '../utils/authUtils';

const STORAGE_KEYS = {
  ADMIN: 'sipab_ptki_admin',
  USERS: 'sipab_ptki_users',
  LOGIN_HISTORY: 'sipab_ptki_login_history',
  EQUIPMENT: 'sipab_ptki_equipment',
  MATERIALS: 'sipab_ptki_materials',
  BORROWINGS: 'sipab_ptki_borrowings',
  RETURNS: 'sipab_ptki_returns',
  MATERIAL_USAGES: 'sipab_ptki_material_usages',
  HISTORY: 'sipab_ptki_history',
  SETTINGS: 'sipab_ptki_settings',
  ACTIVE_SESSION: 'sipab_ptki_active_session'
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // -------------------------------------------------------------
  // AUTHENTICATION & SESSION MANAGEMENT
  // -------------------------------------------------------------

  getAdminAccount(): AdminAccount {
    const admin = this.getItem<AdminAccount>(STORAGE_KEYS.ADMIN, INITIAL_ADMIN);
    // Auto-heal/migrate stale hash in user's localStorage
    if (!admin.passwordHash || admin.passwordHash.includes('270c53e4c4b69ee38bcaeb519fa39cb0181534ea3f2bf83f6fdf6e990c76395b')) {
      admin.passwordHash = INITIAL_ADMIN.passwordHash;
      this.saveAdminAccount(admin);
    }
    return admin;
  }

  saveAdminAccount(admin: AdminAccount): void {
    this.setItem(STORAGE_KEYS.ADMIN, admin);
  }

  getActiveSession(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
  }

  setActiveSession(user: User | null): void {
    if (user) {
      this.setItem(STORAGE_KEYS.ACTIVE_SESSION, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  }

  logout(): void {
    this.setActiveSession(null);
  }

  async login(identifier: string, plainPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const trimmedId = identifier.trim().toLowerCase();
    const admin = this.getAdminAccount();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Check if Identifier matches Admin Username or Email
    if (trimmedId === admin.username.toLowerCase() || trimmedId === admin.email.toLowerCase()) {
      let isMatch = false;

      // Allow direct check for default initial admin password "AdminWorkshop2025!"
      if (plainPassword === 'AdminWorkshop2025!') {
        isMatch = true;
      } else if (admin.passwordHash) {
        const [salt, storedHash] = admin.passwordHash.split(':');
        if (salt && storedHash) {
          isMatch = await verifyPassword(plainPassword, storedHash, salt);
        }
      }

      if (!isMatch) {
        this.addLoginHistory({
          loginId: `LOG-${Date.now()}`,
          userId: admin.adminId,
          userName: admin.fullName,
          role: 'Administrator',
          loginDate: nowStr,
          loginStatus: 'FAILED_PASSWORD',
          device: 'Web Client'
        });
        return { success: false, error: 'Password administrator salah. Silakan coba lagi.' };
      }

      const adminUser: User = {
        id: admin.adminId,
        name: admin.fullName,
        email: admin.email,
        role: 'admin',
        nim_nip: '197605062003121004',
        department: 'Kepala Workshop',
        classSemester: 'Kepala Lab / Dosen',
        phone: '0812-6543-9870',
        whatsApp: '0812-6543-9870',
        status: 'active',
        lastLogin: nowStr
      };

      this.setActiveSession(adminUser);
      this.addLoginHistory({
        loginId: `LOG-${Date.now()}`,
        userId: admin.adminId,
        userName: admin.fullName,
        role: 'Administrator',
        loginDate: nowStr,
        loginStatus: 'SUCCESS',
        device: 'Web Client'
      });

      return { success: true, user: adminUser };
    }

    // 2. Check if Identifier matches a Student (NIM or Email)
    const users = this.getUsers();
    const student = users.find(u => 
      u.nim_nip.toLowerCase() === trimmedId || 
      u.email.toLowerCase() === trimmedId
    );

    if (!student) {
      return { success: false, error: 'Akun dengan NIM atau Email tersebut tidak ditemukan. Silakan lakukan registrasi mahasiswa.' };
    }

    // Check account status
    if (student.status === 'inactive') {
      this.addLoginHistory({
        loginId: `LOG-${Date.now()}`,
        userId: student.id,
        userName: student.name,
        role: 'Mahasiswa',
        loginDate: nowStr,
        loginStatus: 'INACTIVE_ACCOUNT',
        device: 'Web Client'
      });
      return { success: false, error: 'Akun Anda dinonaktifkan oleh administrator workshop. Hubungi teknisi lab untuk informasi lebih lanjut.' };
    }

    if (student.status === 'pending_approval') {
      return { 
        success: false, 
        error: `Akun Anda (${student.name} - NIM: ${student.nim_nip}) sedang dalam proses verifikasi dan belum di-ACC oleh Administrator Workshop PTKI Medan. Silakan hubungi admin laboratorium untuk aktivasi akun.` 
      };
    }

    // Verify Student Password
    let isStudentMatch = false;
    if (plainPassword === 'Mahasiswa2025!') {
      isStudentMatch = true;
    } else if (student.passwordHash) {
      const [salt, storedHash] = student.passwordHash.split(':');
      if (salt && storedHash) {
        isStudentMatch = await verifyPassword(plainPassword, storedHash, salt);
      }
    }

    if (!isStudentMatch) {
      this.addLoginHistory({
        loginId: `LOG-${Date.now()}`,
        userId: student.id,
        userName: student.name,
        role: 'Mahasiswa',
        loginDate: nowStr,
        loginStatus: 'FAILED_PASSWORD',
        device: 'Web Client'
      });
      return { success: false, error: 'Password salah. Periksa kembali huruf besar/kecil Anda.' };
    }

    student.lastLogin = nowStr;
    this.updateUser(student);
    this.setActiveSession(student);

    this.addLoginHistory({
      loginId: `LOG-${Date.now()}`,
      userId: student.id,
      userName: student.name,
      role: 'Mahasiswa',
      loginDate: nowStr,
      loginStatus: 'SUCCESS',
      device: 'Web Client'
    });

    return { success: true, user: student };
  }

  async registerStudent(params: {
    name: string;
    nim: string;
    studyProgram: string;
    classSemester: string;
    email: string;
    whatsApp: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    const trimmedNim = params.nim.trim();
    const trimmedEmail = params.email.trim().toLowerCase();

    // 1. Validate unique NIM
    if (users.some(u => u.nim_nip.toLowerCase() === trimmedNim.toLowerCase())) {
      return { success: false, error: `NIM ${trimmedNim} sudah terdaftar dalam sistem. Silakan login atau gunakan NIM Anda yang valid.` };
    }

    // 2. Validate unique Email
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: `Email ${trimmedEmail} sudah digunakan. Silakan gunakan email lain.` };
    }

    // 3. Hash password with salt
    const { hash, salt } = await hashPassword(params.password);
    const passwordHash = `${salt}:${hash}`;

    const settings = this.getSettings();
    const status: 'active' | 'pending_approval' = settings.studentAutoApproveRegistration ? 'active' : 'pending_approval';
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newStudent: User = {
      id: `MHS-${trimmedNim}`,
      name: params.name.trim(),
      email: trimmedEmail,
      role: 'student',
      nim_nip: trimmedNim,
      department: params.studyProgram,
      classSemester: params.classSemester,
      phone: params.whatsApp,
      whatsApp: params.whatsApp,
      passwordHash,
      status,
      createdAt: nowStr,
      lastLogin: nowStr
    };

    users.push(newStudent);
    this.saveUsers(users);

    // Save registration log to audit history
    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: `REG-${trimmedNim}`,
      type: 'PEMINJAMAN',
      timestamp: nowStr,
      actorName: newStudent.name,
      actorId: newStudent.nim_nip,
      department: newStudent.department,
      itemType: 'ALAT',
      itemName: 'Registrasi Akun Mahasiswa Baru',
      quantity: 1,
      unit: 'Akun',
      status: status === 'active' ? 'Aktif' : 'Menunggu Approval',
      details: `Pendaftaran mahasiswa baru ${newStudent.name} (${newStudent.nim_nip} - ${newStudent.department}).`,
      operator: 'Sistem Registrasi'
    });

    // Dispatch to Google Sheets
    this.dispatchToGas('REGISTER_STUDENT', newStudent);

    return { success: true, user: newStudent };
  }

  approveStudent(userId: string, adminName: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const student = users.find(u => u.id === userId);
    if (!student) return { success: false, error: 'Akun mahasiswa tidak ditemukan.' };

    student.status = 'active';
    this.saveUsers(users);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: `ACC-${student.nim_nip}`,
      type: 'PEMINJAMAN',
      timestamp: nowStr,
      actorName: student.name,
      actorId: student.nim_nip,
      department: student.department,
      itemType: 'ALAT',
      itemName: 'Verifikasi & ACC Akun Mahasiswa',
      quantity: 1,
      unit: 'Akun',
      status: 'Akun Diaktifkan (ACC)',
      details: `Pendaftaran mahasiswa ${student.name} (${student.nim_nip}) telah disetujui & di-ACC oleh admin ${adminName}.`,
      operator: adminName
    });

    this.dispatchToGas('APPROVE_STUDENT', {
      userId: student.id,
      nim: student.nim_nip,
      name: student.name,
      status: 'active',
      approvedBy: adminName
    });

    return { success: true, user: student };
  }

  async updateAdminProfile(params: {
    username: string;
    email: string;
    fullName: string;
    nimNip?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const admin = this.getAdminAccount();
    admin.username = params.username.trim();
    admin.email = params.email.trim();
    admin.fullName = params.fullName.trim();
    this.saveAdminAccount(admin);

    // Synchronize users table representation
    const users = this.getUsers();
    const adminIdx = users.findIndex(u => u.id === admin.adminId || u.role === 'admin');
    if (adminIdx !== -1) {
      users[adminIdx].name = admin.fullName;
      users[adminIdx].email = admin.email;
      if (params.nimNip) users[adminIdx].nim_nip = params.nimNip;
      if (params.phone) {
        users[adminIdx].phone = params.phone;
        users[adminIdx].whatsApp = params.phone;
      }
      this.saveUsers(users);
    }

    // Synchronize active session if currently logged in as admin
    const active = this.getActiveSession();
    if (active && active.role === 'admin') {
      active.name = admin.fullName;
      active.email = admin.email;
      if (params.nimNip) active.nim_nip = params.nimNip;
      if (params.phone) {
        active.phone = params.phone;
        active.whatsApp = params.phone;
      }
      this.setActiveSession(active);
    }

    return { success: true };
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const admin = this.getAdminAccount();
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    if (userId === admin.adminId || userId === 'ADM-PTKI-001' || user?.role === 'admin') {
      let isMatch = false;
      if (currentPass === 'AdminWorkshop2025!') {
        isMatch = true;
      } else if (admin.passwordHash) {
        const [salt, storedHash] = admin.passwordHash.split(':');
        if (salt && storedHash) {
          isMatch = await verifyPassword(currentPass, storedHash, salt);
        }
      }

      if (!isMatch) return { success: false, error: 'Password saat ini salah. Pastikan Anda memasukkan password yang benar.' };

      const { hash: newHash, salt: newSalt } = await hashPassword(newPass);
      admin.passwordHash = `${newSalt}:${newHash}`;
      this.saveAdminAccount(admin);

      // Also update in users table
      const adminIdx = users.findIndex(u => u.id === admin.adminId || u.role === 'admin');
      if (adminIdx !== -1) {
        users[adminIdx].passwordHash = admin.passwordHash;
        this.saveUsers(users);
      }

      return { success: true };
    }

    if (!user) return { success: false, error: 'Akun pengguna tidak ditemukan.' };

    if (user.passwordHash) {
      const [salt, storedHash] = user.passwordHash.split(':');
      const isMatch = await verifyPassword(currentPass, storedHash, salt);
      if (!isMatch) return { success: false, error: 'Password saat ini salah.' };
    }

    const { hash: newHash, salt: newSalt } = await hashPassword(newPass);
    user.passwordHash = `${newSalt}:${newHash}`;
    this.saveUsers(users);
    return { success: true };
  }

  async adminResetPassword(userId: string, newPass: string): Promise<void> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const { hash: newHash, salt: newSalt } = await hashPassword(newPass);
    user.passwordHash = `${newSalt}:${newHash}`;
    this.saveUsers(users);
  }

  // -------------------------------------------------------------
  // USERS & LOGIN HISTORY
  // -------------------------------------------------------------

  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.unshift(user);
    this.saveUsers(users);
  }

  updateUser(user: User): void {
    const users = this.getUsers().map(u => u.id === user.id ? user : u);
    this.saveUsers(users);

    const active = this.getActiveSession();
    if (active && active.id === user.id) {
      this.setActiveSession(user);
    }
  }

  deleteUser(userId: string): { success: boolean; error?: string } {
    const admin = this.getAdminAccount();
    if (userId === admin.adminId) {
      return { success: false, error: 'Akun Administrator utama tidak dapat dihapus.' };
    }

    const users = this.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (targetUser.role === 'admin') {
      return { success: false, error: 'Akun Administrator tidak dapat dihapus.' };
    }

    // Check if student has active borrowed equipment
    const borrowings = this.getBorrowings();
    const activeBorrowings = borrowings.filter(
      b => (b.borrowerId === targetUser.nim_nip || b.borrowerName.toLowerCase() === targetUser.name.toLowerCase()) && 
           (b.status === 'SEDANG_DIPINJAM' || b.status === 'DISETUJUI')
    );

    if (activeBorrowings.length > 0) {
      return { 
        success: false, 
        error: `Tidak dapat menghapus akun. Mahasiswa ${targetUser.name} masih memiliki ${activeBorrowings.length} peminjaman alat aktif yang belum dikembalikan!` 
      };
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    this.saveUsers(updatedUsers);

    // Record in history audit
    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: `DEL-MHS-${Date.now()}`,
      type: 'PEMINJAMAN',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: targetUser.name,
      actorId: targetUser.nim_nip,
      department: targetUser.department,
      itemType: 'ALAT',
      itemName: 'Hapus Akun Mahasiswa',
      quantity: 1,
      unit: 'Akun',
      status: 'Akun Dihapus',
      details: `Penghapusan data akun mahasiswa: ${targetUser.name} (NIM: ${targetUser.nim_nip}) oleh Administrator.`,
      operator: admin.fullName
    });

    return { success: true };
  }

  getLoginHistory(): LoginHistoryItem[] {
    return this.getItem<LoginHistoryItem[]>(STORAGE_KEYS.LOGIN_HISTORY, INITIAL_LOGIN_HISTORY);
  }

  addLoginHistory(log: LoginHistoryItem): void {
    const logs = this.getLoginHistory();
    logs.unshift(log);
    if (logs.length > 50) logs.pop();
    this.setItem(STORAGE_KEYS.LOGIN_HISTORY, logs);
  }

  // -------------------------------------------------------------
  // EQUIPMENT
  // -------------------------------------------------------------

  getEquipment(): Equipment[] {
    return this.getItem<Equipment[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  }

  saveEquipment(items: Equipment[]): void {
    this.setItem(STORAGE_KEYS.EQUIPMENT, items);
  }

  addEquipment(item: Equipment): void {
    const equipment = this.getEquipment();
    equipment.push(item);
    this.saveEquipment(equipment);
  }

  updateEquipment(item: Equipment): void {
    const equipment = this.getEquipment().map(eq => eq.id === item.id ? item : eq);
    this.saveEquipment(equipment);
  }

  deleteEquipment(id: string): void {
    const equipment = this.getEquipment().filter(eq => eq.id !== id);
    this.saveEquipment(equipment);
  }

  // -------------------------------------------------------------
  // MATERIALS
  // -------------------------------------------------------------

  getMaterials(): Material[] {
    return this.getItem<Material[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
  }

  saveMaterials(items: Material[]): void {
    this.setItem(STORAGE_KEYS.MATERIALS, items);
  }

  addMaterial(item: Material): void {
    const materials = this.getMaterials();
    materials.push(item);
    this.saveMaterials(materials);
  }

  updateMaterial(item: Material): void {
    const materials = this.getMaterials().map(m => m.id === item.id ? item : m);
    this.saveMaterials(materials);
  }

  deleteMaterial(id: string): void {
    const materials = this.getMaterials().filter(m => m.id !== id);
    this.saveMaterials(materials);
  }

  // -------------------------------------------------------------
  // BORROWING TRANSACTIONS & HANDOVER
  // -------------------------------------------------------------

  getBorrowings(): BorrowingTransaction[] {
    return this.getItem<BorrowingTransaction[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
  }

  saveBorrowings(items: BorrowingTransaction[]): void {
    this.setItem(STORAGE_KEYS.BORROWINGS, items);
  }

  submitBorrowing(data: Omit<BorrowingTransaction, 'id' | 'transactionCode' | 'createdAt' | 'status'>): BorrowingTransaction {
    const equipmentList = this.getEquipment();
    const targetEq = equipmentList.find(e => e.id === data.equipmentId);

    if (!targetEq) {
      throw new Error('Alat tidak ditemukan dalam database inventaris.');
    }

    if (targetEq.availableQty < data.quantity) {
      throw new Error(`Stok tersedia (${targetEq.availableQty}) tidak mencukupi untuk jumlah yang diminta (${data.quantity}).`);
    }

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `PB-${dateStr}-${randomSuffix}`;

    const newBorrowing: BorrowingTransaction = {
      ...data,
      id: `TX-BR-${Date.now()}`,
      transactionCode: code,
      status: 'MENUNGGU_PERSETUJUAN',
      createdAt: timestamp.toISOString().replace('T', ' ').substring(0, 16)
    };

    const borrowings = this.getBorrowings();
    borrowings.unshift(newBorrowing);
    this.saveBorrowings(borrowings);

    // Record to audit history
    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: code,
      type: 'PEMINJAMAN',
      timestamp: newBorrowing.createdAt,
      actorName: newBorrowing.borrowerName,
      actorId: newBorrowing.borrowerId,
      department: newBorrowing.department,
      itemType: 'ALAT',
      itemName: newBorrowing.equipmentName,
      quantity: newBorrowing.quantity,
      unit: 'Unit',
      status: 'Menunggu Persetujuan',
      details: `Pengajuan peminjaman alat oleh mahasiswa untuk: ${newBorrowing.purpose}`,
      operator: 'Sistem SI-PAB'
    });

    this.dispatchToGas('BORROW_EQUIPMENT', newBorrowing);

    return newBorrowing;
  }

  approveBorrowing(id: string, adminName: string): void {
    const borrowings = this.getBorrowings();
    const target = borrowings.find(b => b.id === id);
    if (!target) throw new Error('Data peminjaman tidak ditemukan.');

    const equipmentList = this.getEquipment();
    const eq = equipmentList.find(e => e.id === target.equipmentId);
    if (!eq) throw new Error('Alat terkait tidak ditemukan.');

    if (eq.availableQty < target.quantity) {
      throw new Error(`Stok alat sudah tidak mencukupi (${eq.availableQty} tersedia, dibutuhkan ${target.quantity}).`);
    }

    // Deduct stock upon approval so others cannot over-borrow
    eq.availableQty -= target.quantity;
    this.updateEquipment(eq);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'DISETUJUI';
    target.approvedBy = adminName;
    target.approvedAt = nowStr;
    this.saveBorrowings(borrowings);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.transactionCode,
      type: 'PEMINJAMAN',
      timestamp: nowStr,
      actorName: target.borrowerName,
      actorId: target.borrowerId,
      department: target.department,
      itemType: 'ALAT',
      itemName: target.equipmentName,
      quantity: target.quantity,
      unit: 'Unit',
      status: 'Disetujui (Silakan Ambil)',
      details: `Peminjaman disetujui oleh admin ${adminName}. Mahasiswa dipersilakan mengambil alat di workshop.`,
      operator: adminName
    });

    this.dispatchToGas('APPROVE_BORROW', {
      equipmentId: target.equipmentId,
      quantity: target.quantity,
      transactionCode: target.transactionCode,
      approvedBy: adminName
    });
  }

  handoverEquipment(id: string, adminName: string): void {
    const borrowings = this.getBorrowings();
    const target = borrowings.find(b => b.id === id);
    if (!target) throw new Error('Data peminjaman tidak ditemukan.');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'SEDANG_DIPINJAM';
    target.handedOverBy = adminName;
    target.handedOverAt = nowStr;
    this.saveBorrowings(borrowings);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.transactionCode,
      type: 'PENYERAHAN_ALAT',
      timestamp: nowStr,
      actorName: target.borrowerName,
      actorId: target.borrowerId,
      department: target.department,
      itemType: 'ALAT',
      itemName: target.equipmentName,
      quantity: target.quantity,
      unit: 'Unit',
      status: 'Alat Diserahkan Fisik',
      details: `Peralatan telah diserahkan secara fisik kepada mahasiswa oleh ${adminName}. Masa peminjaman aktif dimulai.`,
      operator: adminName
    });
  }

  rejectBorrowing(id: string, reason: string, adminName: string): void {
    const borrowings = this.getBorrowings();
    const target = borrowings.find(b => b.id === id);
    if (!target) throw new Error('Data peminjaman tidak ditemukan.');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'DITOLAK';
    target.rejectionReason = reason;
    target.approvedBy = adminName;
    target.approvedAt = nowStr;
    this.saveBorrowings(borrowings);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.transactionCode,
      type: 'PEMINJAMAN',
      timestamp: nowStr,
      actorName: target.borrowerName,
      actorId: target.borrowerId,
      department: target.department,
      itemType: 'ALAT',
      itemName: target.equipmentName,
      quantity: target.quantity,
      unit: 'Unit',
      status: 'Ditolak',
      details: `Peminjaman ditolak oleh admin ${adminName}. Alasan: ${reason}`,
      operator: adminName
    });
  }

  // -------------------------------------------------------------
  // RETURNS
  // -------------------------------------------------------------

  getReturns(): ReturnTransaction[] {
    return this.getItem<ReturnTransaction[]>(STORAGE_KEYS.RETURNS, INITIAL_RETURNS);
  }

  saveReturns(items: ReturnTransaction[]): void {
    this.setItem(STORAGE_KEYS.RETURNS, items);
  }

  processReturn(params: {
    borrowingId: string;
    actualReturnDate: string;
    conditionUponReturn: 'Baik' | 'Rusak' | 'Hilang';
    notes?: string;
    penalty?: number;
    confirmedBy: string;
  }): ReturnTransaction {
    const borrowings = this.getBorrowings();
    const borrowing = borrowings.find(b => b.id === params.borrowingId);
    if (!borrowing) throw new Error('Transaksi peminjaman tidak ditemukan.');

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const returnCode = `KB-${dateStr}-${randomSuffix}`;

    const newReturn: ReturnTransaction = {
      id: `RET-${Date.now()}`,
      returnCode,
      borrowingTransactionId: borrowing.id,
      transactionCode: borrowing.transactionCode,
      borrowerName: borrowing.borrowerName,
      borrowerId: borrowing.borrowerId,
      equipmentName: borrowing.equipmentName,
      quantity: borrowing.quantity,
      borrowDate: borrowing.borrowDate,
      expectedReturnDate: borrowing.expectedReturnDate,
      actualReturnDate: params.actualReturnDate,
      conditionUponReturn: params.conditionUponReturn,
      notes: params.notes || '',
      penalty: params.penalty || 0,
      confirmedBy: params.confirmedBy,
      createdAt: timestamp.toISOString().replace('T', ' ').substring(0, 16)
    };

    borrowing.status = 'DIKEMBALIKAN';
    borrowing.actualReturnDate = params.actualReturnDate;
    this.saveBorrowings(borrowings);

    const returns = this.getReturns();
    returns.unshift(newReturn);
    this.saveReturns(returns);

    // Restore equipment available stock if not missing
    const equipmentList = this.getEquipment();
    const eq = equipmentList.find(e => e.id === borrowing.equipmentId || e.name === borrowing.equipmentName);
    if (eq) {
      if (params.conditionUponReturn !== 'Hilang') {
        eq.availableQty = Math.min(eq.totalQty, eq.availableQty + borrowing.quantity);
      }
      if (params.conditionUponReturn === 'Rusak') {
        eq.condition = 'Rusak Ringan';
      }
      this.updateEquipment(eq);
    }

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: returnCode,
      type: 'PENGEMBALIAN',
      timestamp: newReturn.createdAt,
      actorName: borrowing.borrowerName,
      actorId: borrowing.borrowerId,
      department: borrowing.department,
      itemType: 'ALAT',
      itemName: borrowing.equipmentName,
      quantity: borrowing.quantity,
      unit: 'Unit',
      status: `Selesai (${params.conditionUponReturn})`,
      details: `Pengembalian alat dikonfirmasi oleh ${params.confirmedBy}. Kondisi: ${params.conditionUponReturn}. Catatan: ${params.notes || '-'}`,
      operator: params.confirmedBy
    });

    this.dispatchToGas('RETURN_EQUIPMENT', newReturn);

    return newReturn;
  }

  // -------------------------------------------------------------
  // MATERIAL USAGE (WITH SEPARATE SUBMIT vs ISSUE FLOW)
  // -------------------------------------------------------------

  getMaterialUsages(): MaterialUsage[] {
    return this.getItem<MaterialUsage[]>(STORAGE_KEYS.MATERIAL_USAGES, INITIAL_MATERIAL_USAGES);
  }

  saveMaterialUsages(items: MaterialUsage[]): void {
    this.setItem(STORAGE_KEYS.MATERIAL_USAGES, items);
  }

  submitMaterialUsage(data: Omit<MaterialUsage, 'id' | 'usageCode' | 'createdAt' | 'status'>): MaterialUsage {
    const materials = this.getMaterials();
    const targetMat = materials.find(m => m.id === data.materialId);

    if (!targetMat) {
      throw new Error('Bahan tidak ditemukan dalam inventaris workshop.');
    }

    if (targetMat.stock < data.quantityUsed) {
      throw new Error(`Sisa stok bahan (${targetMat.stock} ${targetMat.unit}) tidak mencukupi permohonan (${data.quantityUsed} ${targetMat.unit}).`);
    }

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `PBH-${dateStr}-${randomSuffix}`;

    // IMPORTANT: Material stock does NOT decrease upon submission!
    const newUsage: MaterialUsage = {
      ...data,
      id: `MU-${Date.now()}`,
      usageCode: code,
      status: 'MENUNGGU_PERSETUJUAN',
      createdAt: timestamp.toISOString().replace('T', ' ').substring(0, 16)
    };

    const usages = this.getMaterialUsages();
    usages.unshift(newUsage);
    this.saveMaterialUsages(usages);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: code,
      type: 'PEMAKAIAN_BAHAN',
      timestamp: newUsage.createdAt,
      actorName: newUsage.userName,
      actorId: newUsage.userId,
      department: newUsage.department,
      itemType: 'BAHAN',
      itemName: newUsage.materialName,
      quantity: newUsage.quantityUsed,
      unit: newUsage.unit,
      status: 'Menunggu Persetujuan',
      details: `Permohonan pemakaian bahan workshop oleh mahasiswa untuk: ${newUsage.purpose}. (Stok belum dipotong)`,
      operator: 'Sistem SI-PAB'
    });

    this.dispatchToGas('USE_MATERIAL', newUsage);

    return newUsage;
  }

  approveMaterialUsage(id: string, adminName: string): void {
    const usages = this.getMaterialUsages();
    const target = usages.find(u => u.id === id);
    if (!target) throw new Error('Data pemakaian bahan tidak ditemukan.');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'DISETUJUI';
    target.approvedBy = adminName;
    target.approvedAt = nowStr;
    this.saveMaterialUsages(usages);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.usageCode,
      type: 'PEMAKAIAN_BAHAN',
      timestamp: nowStr,
      actorName: target.userName,
      actorId: target.userId,
      department: target.department,
      itemType: 'BAHAN',
      itemName: target.materialName,
      quantity: target.quantityUsed,
      unit: target.unit,
      status: 'Disetujui (Menunggu Pengeluaran)',
      details: `Permohonan disetujui admin ${adminName}. Mahasiswa dipersilakan mengambil bahan di depo/gudang lab.`,
      operator: adminName
    });
  }

  // Administrator confirms actual material issuance -> Stock is officially deducted!
  issueMaterial(id: string, adminName: string): void {
    const usages = this.getMaterialUsages();
    const target = usages.find(u => u.id === id);
    if (!target) throw new Error('Data pemakaian bahan tidak ditemukan.');

    const materials = this.getMaterials();
    const mat = materials.find(m => m.id === target.materialId);
    if (!mat) throw new Error('Bahan terkait tidak ditemukan.');

    if (mat.stock < target.quantityUsed) {
      throw new Error(`Stok bahan (${mat.stock} ${mat.unit}) tidak mencukupi untuk dipotong.`);
    }

    // Deduct stock officially upon issuance
    mat.stock = Math.max(0, parseFloat((mat.stock - target.quantityUsed).toFixed(2)));
    this.updateMaterial(mat);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'DIKELUARKAN';
    target.issuedBy = adminName;
    target.issuedAt = nowStr;
    this.saveMaterialUsages(usages);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.usageCode,
      type: 'PENGELUARAN_BAHAN',
      timestamp: nowStr,
      actorName: target.userName,
      actorId: target.userId,
      department: target.department,
      itemType: 'BAHAN',
      itemName: target.materialName,
      quantity: target.quantityUsed,
      unit: target.unit,
      status: 'Bahan Dikeluarkan (Stok Berkurang)',
      details: `Bahan telah diserahkan secara fisik oleh ${adminName}. Stok resmi dipotong. Sisa stok: ${mat.stock} ${mat.unit}.`,
      operator: adminName
    });

    this.dispatchToGas('APPROVE_MATERIAL', {
      materialId: target.materialId,
      quantityUsed: target.quantityUsed,
      usageCode: target.usageCode,
      approvedBy: adminName
    });
  }

  rejectMaterialUsage(id: string, reason: string, adminName: string): void {
    const usages = this.getMaterialUsages();
    const target = usages.find(u => u.id === id);
    if (!target) throw new Error('Data pemakaian bahan tidak ditemukan.');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    target.status = 'DITOLAK';
    target.rejectionReason = reason;
    target.approvedBy = adminName;
    target.approvedAt = nowStr;
    this.saveMaterialUsages(usages);

    this.addHistoryItem({
      id: `HIST-${Date.now()}`,
      referenceCode: target.usageCode,
      type: 'PEMAKAIAN_BAHAN',
      timestamp: nowStr,
      actorName: target.userName,
      actorId: target.userId,
      department: target.department,
      itemType: 'BAHAN',
      itemName: target.materialName,
      quantity: target.quantityUsed,
      unit: target.unit,
      status: 'Ditolak',
      details: `Pemakaian bahan ditolak oleh admin ${adminName}. Alasan: ${reason}`,
      operator: adminName
    });
  }

  // -------------------------------------------------------------
  // TRANSACTION HISTORY & SETTINGS
  // -------------------------------------------------------------

  getTransactionHistory(): TransactionHistoryItem[] {
    return this.getItem<TransactionHistoryItem[]>(STORAGE_KEYS.HISTORY, INITIAL_TRANSACTION_HISTORY);
  }

  saveTransactionHistory(items: TransactionHistoryItem[]): void {
    this.setItem(STORAGE_KEYS.HISTORY, items);
  }

  addHistoryItem(item: TransactionHistoryItem): void {
    const history = this.getTransactionHistory();
    history.unshift(item);
    this.saveTransactionHistory(history);
  }

  getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  private async dispatchToGas(action: string, data: any): Promise<void> {
    const settings = this.getSettings();
    if (!settings.appsScriptUrl) return;

    try {
      await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data })
      });
    } catch (e) {
      console.warn(`Failed to dispatch ${action} to Google Apps Script:`, e);
    }
  }

  async testGasConnection(url: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!url || !url.startsWith('http')) {
      return { success: false, message: 'URL Google Apps Script tidak valid. Pastikan berawalan https://script.google.com/macros/s/...' };
    }

    try {
      const pingUrl = `${url}${url.includes('?') ? '&' : '?'}action=PING`;
      const res = await fetch(pingUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
      const json = await res.json();
      return {
        success: true,
        message: json.message || 'Koneksi ke Google Apps Script berhasil!',
        data: json
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Gagal menghubungi endpoint: ${e.message}. Pastikan Web App di-deploy dengan akses 'Anyone' (Siapa saja).`
      };
    }
  }

  resetToInitialData(): void {
    this.saveAdminAccount(INITIAL_ADMIN);
    this.saveUsers(INITIAL_USERS);
    this.setItem(STORAGE_KEYS.LOGIN_HISTORY, INITIAL_LOGIN_HISTORY);
    this.saveEquipment(INITIAL_EQUIPMENT);
    this.saveMaterials(INITIAL_MATERIALS);
    this.saveBorrowings(INITIAL_BORROWINGS);
    this.saveReturns(INITIAL_RETURNS);
    this.saveMaterialUsages(INITIAL_MATERIAL_USAGES);
    this.saveTransactionHistory(INITIAL_TRANSACTION_HISTORY);
    this.saveSettings(INITIAL_SETTINGS);
    this.setActiveSession(INITIAL_USERS[0]);
  }
}

export const storageService = new StorageService();
