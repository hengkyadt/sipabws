export type UserRole = 'admin' | 'user' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  nim_nip: string;
  department: string;
  classSemester?: string;
  phone: string;
  whatsApp?: string;
  passwordHash?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending_approval';
  createdAt?: string;
  lastLogin?: string;
}

export interface AdminAccount {
  adminId: string;
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

export interface LoginHistoryItem {
  loginId: string;
  userId: string;
  userName: string;
  role: string;
  loginDate: string;
  loginStatus: 'SUCCESS' | 'FAILED_PASSWORD' | 'INACTIVE_ACCOUNT' | 'ACCOUNT_NOT_FOUND';
  device?: string;
}

export type EquipmentCondition = 'Baik' | 'Rusak Ringan' | 'Dalam Perawatan' | 'Rusak Berat';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  totalQty: number;
  availableQty: number;
  condition: EquipmentCondition;
  location: string;
  description: string;
  imageUrl?: string;
  specification?: string;
  lastMaintenance?: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  location: string;
  description: string;
  specification?: string;
}

export type BorrowingStatus = 
  | 'MENUNGGU_PERSETUJUAN' 
  | 'DISETUJUI' 
  | 'SEDANG_DIPINJAM'
  | 'DITOLAK' 
  | 'DIKEMBALIKAN' 
  | 'TERLAMBAT';

export interface BorrowingTransaction {
  id: string;
  transactionCode: string;
  borrowerName: string;
  borrowerId: string; // NIM / NIP
  department: string;
  classSemester?: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  quantity: number;
  borrowDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  actualReturnDate?: string;
  purpose: string;
  notes?: string;
  status: BorrowingStatus;
  approvedBy?: string;
  approvedAt?: string;
  handedOverBy?: string;
  handedOverAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ReturnTransaction {
  id: string;
  returnCode: string;
  borrowingTransactionId: string;
  transactionCode: string;
  borrowerName: string;
  borrowerId: string;
  equipmentName: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  conditionUponReturn: 'Baik' | 'Rusak' | 'Hilang';
  notes?: string;
  penalty?: number; // Denda jika ada
  confirmedBy: string;
  createdAt: string;
}

export type MaterialUsageStatus = 
  | 'MENUNGGU_PERSETUJUAN' 
  | 'DISETUJUI' 
  | 'DIKELUARKAN'
  | 'DITOLAK';

export interface MaterialUsage {
  id: string;
  usageCode: string;
  userName: string;
  userId: string; // NIM / NIP
  department: string;
  classSemester?: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  category: string;
  quantityUsed: number;
  unit: string;
  usageDate: string;
  purpose: string;
  notes?: string;
  status: MaterialUsageStatus;
  approvedBy?: string;
  approvedAt?: string;
  issuedBy?: string;
  issuedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type TransactionType = 'PEMINJAMAN' | 'PENGEMBALIAN' | 'PEMAKAIAN_BAHAN' | 'PENYERAHAN_ALAT' | 'PENGELUARAN_BAHAN';

export interface TransactionHistoryItem {
  id: string;
  referenceCode: string;
  type: TransactionType;
  timestamp: string;
  actorName: string;
  actorId: string;
  department: string;
  itemType: 'ALAT' | 'BAHAN';
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
  details: string;
  operator: string;
}

export interface AppSettings {
  workshopName: string;
  institutionName: string;
  labHeadName: string;
  labHeadNip: string;
  appsScriptUrl: string;
  googleSheetId: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncTime?: string;
  isOnline: boolean;
  studentAutoApproveRegistration: boolean; // default active or pending approval
}

export type NavigationTab = 
  | 'dashboard'
  | 'equipment'
  | 'borrowing'
  | 'returns'
  | 'materials'
  | 'history'
  | 'reports'
  | 'sheets-integration'
  | 'users'
  | 'student-profile'
  | 'admin-profile';
