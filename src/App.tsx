/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  NavigationTab, 
  User, 
  Equipment, 
  Material, 
  BorrowingTransaction, 
  ReturnTransaction, 
  MaterialUsage, 
  TransactionHistoryItem,
  AppSettings 
} from './types';
import { storageService } from './services/storageService';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProfile } from './components/StudentProfile';
import { EquipmentInventory } from './components/EquipmentInventory';
import { BorrowingManagement } from './components/BorrowingManagement';
import { ReturnManagement } from './components/ReturnManagement';
import { MaterialUsageManagement } from './components/MaterialUsageManagement';
import { TransactionHistory } from './components/TransactionHistory';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';
import { UserManagement } from './components/UserManagement';
import { AdminProfile } from './components/AdminProfile';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Session State (null if unauthenticated)
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getActiveSession());
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Core Data States
  const [allUsers, setAllUsers] = useState<User[]>(() => storageService.getUsers());
  const [equipment, setEquipment] = useState<Equipment[]>(() => storageService.getEquipment());
  const [materials, setMaterials] = useState<Material[]>(() => storageService.getMaterials());
  const [borrowings, setBorrowings] = useState<BorrowingTransaction[]>(() => storageService.getBorrowings());
  const [returns, setReturns] = useState<ReturnTransaction[]>(() => storageService.getReturns());
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>(() => storageService.getMaterialUsages());
  const [history, setHistory] = useState<TransactionHistoryItem[]>(() => storageService.getTransactionHistory());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());

  // Helper States
  const [preSelectedEquipment, setPreSelectedEquipment] = useState<Equipment | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback((type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload data from local storage
  const reloadAllData = useCallback(() => {
    setAllUsers(storageService.getUsers());
    setEquipment(storageService.getEquipment());
    setMaterials(storageService.getMaterials());
    setBorrowings(storageService.getBorrowings());
    setReturns(storageService.getReturns());
    setMaterialUsages(storageService.getMaterialUsages());
    setHistory(storageService.getTransactionHistory());
    setSettings(storageService.getSettings());
  }, []);

  // Enforce Role-Based Access Control (RBAC)
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      const adminOnlyTabs: NavigationTab[] = ['returns', 'reports', 'sheets-integration', 'users', 'admin-profile'];
      if (adminOnlyTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
        showToast('warning', 'Akses Dibatasi', 'Halaman tersebut hanya dapat diakses oleh Administrator Workshop.');
      }
    }
  }, [currentTab, currentUser, showToast]);

  // Keep users and pending approvals fresh when switching tabs
  useEffect(() => {
    if (currentTab === 'users' || currentTab === 'dashboard') {
      setAllUsers(storageService.getUsers());
    }
  }, [currentTab]);

  // Handle Login & Logout
  const handleLoginSuccess = (user: User) => {
    reloadAllData();
    setCurrentUser(user);
    setCurrentTab('dashboard');
    showToast(
      'success',
      'Berhasil Masuk',
      `Selamat datang, ${user.name} (${user.role === 'admin' ? 'Administrator Workshop' : 'Mahasiswa'})`
    );
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
    showToast('info', 'Telah Keluar', 'Sesi Anda telah diakhiri dengan aman.');
  };

  const handleSwitchUser = (user: User) => {
    storageService.setActiveSession(user);
    setCurrentUser(user);
    showToast(
      'info',
      'Pengguna Berganti',
      `Sekarang aktif sebagai ${user.name} (${user.role === 'admin' ? 'Administrator' : 'Mahasiswa'})`
    );
  };

  // Equipment Handlers
  const handleAddEquipment = (itemData: Omit<Equipment, 'id'>) => {
    const newEq: Equipment = {
      ...itemData,
      id: `EQ-${Date.now()}`
    };
    storageService.addEquipment(newEq);
    setEquipment(storageService.getEquipment());
    showToast('success', 'Alat Ditambahkan', `${newEq.name} berhasil disimpan ke inventaris workshop.`);
  };

  const handleUpdateEquipment = (item: Equipment) => {
    storageService.updateEquipment(item);
    setEquipment(storageService.getEquipment());
    showToast('success', 'Alat Diperbarui', `Data ${item.name} berhasil disimpan.`);
  };

  const handleDeleteEquipment = (id: string) => {
    storageService.deleteEquipment(id);
    setEquipment(storageService.getEquipment());
    showToast('warning', 'Alat Dihapus', 'Peralatan telah dihapus dari inventaris.');
  };

  const handleDirectBorrow = (eq: Equipment) => {
    setPreSelectedEquipment(eq);
    setCurrentTab('borrowing');
  };

  // Borrowing Handlers
  const handleSubmitBorrowing = (data: Omit<BorrowingTransaction, 'id' | 'transactionCode' | 'createdAt' | 'status'>) => {
    try {
      const newBorrowing = storageService.submitBorrowing(data);
      reloadAllData();
      showToast(
        'success',
        'Pengajuan Terkirim',
        `Permohonan ${newBorrowing.equipmentName} (${newBorrowing.transactionCode}) berhasil dikirim ke antrean admin.`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Mengajukan', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleApproveBorrowing = (id: string) => {
    if (!currentUser) return;
    try {
      storageService.approveBorrowing(id, currentUser.name);
      reloadAllData();
      showToast('success', 'Peminjaman Disetujui', 'Peminjaman disetujui. Mahasiswa dipersilakan mengambil alat di workshop.');
    } catch (err: any) {
      showToast('error', 'Gagal Menyetujui', err.message || 'Terjadi kesalahan.');
    }
  };

  const handleHandoverEquipment = (id: string) => {
    if (!currentUser) return;
    try {
      storageService.handoverEquipment(id, currentUser.name);
      reloadAllData();
      showToast('success', 'Serah Terima Selesai', 'Peralatan telah diserahkan fisik kepada mahasiswa. Masa pinjam aktif.');
    } catch (err: any) {
      showToast('error', 'Gagal Serah Terima', err.message);
    }
  };

  const handleRejectBorrowing = (id: string, reason: string) => {
    if (!currentUser) return;
    try {
      storageService.rejectBorrowing(id, reason, currentUser.name);
      reloadAllData();
      showToast('warning', 'Peminjaman Ditolak', `Permohonan ditolak dengan alasan: ${reason}`);
    } catch (err: any) {
      showToast('error', 'Gagal Menolak', err.message);
    }
  };

  // Return Handlers
  const handleProcessReturn = (params: {
    borrowingId: string;
    actualReturnDate: string;
    conditionUponReturn: 'Baik' | 'Rusak' | 'Hilang';
    notes?: string;
    penalty?: number;
    confirmedBy: string;
  }) => {
    try {
      const returnRecord = storageService.processReturn(params);
      reloadAllData();
      showToast(
        'success',
        'Pengembalian Selesai',
        `Alat ${returnRecord.equipmentName} berhasil dikonfirmasi kembali (${returnRecord.conditionUponReturn}). Stok telah dipulihkan.`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Mengonfirmasi', err.message);
    }
  };

  // Materials Handlers
  const handleAddMaterial = (itemData: Omit<Material, 'id'>) => {
    const newMat: Material = {
      ...itemData,
      id: `MAT-${Date.now()}`
    };
    storageService.addMaterial(newMat);
    setMaterials(storageService.getMaterials());
    showToast('success', 'Bahan Ditambahkan', `${newMat.name} berhasil disimpan ke katalog bahan.`);
  };

  const handleUpdateMaterial = (item: Material) => {
    storageService.updateMaterial(item);
    setMaterials(storageService.getMaterials());
    showToast('success', 'Bahan Diperbarui', `Data ${item.name} berhasil disimpan.`);
  };

  const handleDeleteMaterial = (id: string) => {
    storageService.deleteMaterial(id);
    setMaterials(storageService.getMaterials());
    showToast('warning', 'Bahan Dihapus', 'Bahan telah dihapus dari inventaris.');
  };

  const handleSubmitUsage = (data: Omit<MaterialUsage, 'id' | 'usageCode' | 'createdAt' | 'status'>) => {
    try {
      const usage = storageService.submitMaterialUsage(data);
      reloadAllData();
      showToast(
        'success', 
        'Pengajuan Bahan Terkirim', 
        `Permohonan ${usage.materialName} (${usage.quantityUsed} ${usage.unit}) menunggu persetujuan admin. (Stok belum dipotong)`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Mengajukan Bahan', err.message);
    }
  };

  const handleApproveUsage = (id: string) => {
    if (!currentUser) return;
    try {
      storageService.approveMaterialUsage(id, currentUser.name);
      reloadAllData();
      showToast('success', 'Permohonan Bahan Disetujui', 'Disetujui. Silakan lakukan pengeluaran fisik bahan di depo/lab.');
    } catch (err: any) {
      showToast('error', 'Gagal Menyetujui', err.message);
    }
  };

  const handleIssueMaterial = (id: string) => {
    if (!currentUser) return;
    try {
      storageService.issueMaterial(id, currentUser.name);
      reloadAllData();
      showToast('success', 'Bahan Telah Dikeluarkan', 'Bahan telah diserahkan dan stok resmi di database workshop telah dipotong.');
    } catch (err: any) {
      showToast('error', 'Gagal Mengeluarkan Bahan', err.message);
    }
  };

  const handleRejectUsage = (id: string, reason: string) => {
    if (!currentUser) return;
    try {
      storageService.rejectMaterialUsage(id, reason, currentUser.name);
      reloadAllData();
      showToast('warning', 'Pemakaian Bahan Ditolak', `Permohonan ditolak: ${reason}`);
    } catch (err: any) {
      showToast('error', 'Gagal Menolak', err.message);
    }
  };

  // Student Profile Updates
  const handleUpdateProfile = (updated: User) => {
    setCurrentUser(updated);
    setAllUsers(storageService.getUsers());
  };

  // User Handlers
  const handleAddUser = (user: User) => {
    storageService.addUser(user);
    setAllUsers(storageService.getUsers());
    showToast('success', 'Mahasiswa Ditambahkan', `Akun ${user.name} berhasil dibuat.`);
  };

  const handleUpdateUser = (user: User) => {
    storageService.updateUser(user);
    setAllUsers(storageService.getUsers());
    showToast('success', 'Data Mahasiswa Diperbarui', `Data akun ${user.name} telah disimpan.`);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    const result = storageService.deleteUser(userId);
    if (result.success) {
      setAllUsers(storageService.getUsers());
      showToast('warning', 'Akun Mahasiswa Dihapus', `Akun mahasiswa ${targetUser?.name || userId} berhasil dihapus dari sistem.`);
    } else {
      showToast('error', 'Gagal Menghapus Akun', result.error || 'Terjadi kesalahan.');
    }
  };

  const handleApproveStudent = (userId: string) => {
    if (!currentUser) return;
    try {
      const res = storageService.approveStudent(userId, currentUser.name);
      if (res.success && res.user) {
        setAllUsers(storageService.getUsers());
        showToast(
          'success',
          'Akun Mahasiswa Telah Di-ACC',
          `Akun ${res.user.name} (NIM: ${res.user.nim_nip || res.user.id}) berhasil disetujui dan berstatus AKTIF. Mahasiswa sekarang dapat login dan mengajukan pinjaman.`
        );
      } else {
        showToast('error', 'Gagal Menyetujui Akun', res.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menyetujui Akun', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleRejectStudent = (userId: string) => {
    if (!currentUser) return;
    const targetUser = allUsers.find(u => u.id === userId);
    try {
      const result = storageService.deleteUser(userId);
      if (result.success) {
        setAllUsers(storageService.getUsers());
        showToast(
          'warning',
          'Pendaftaran Mahasiswa Ditolak',
          `Pendaftaran akun mahasiswa ${targetUser?.name || userId} telah ditolak dan dihapus dari antrean verifikasi.`
        );
      } else {
        showToast('error', 'Gagal Menolak Pendaftaran', result.error || 'Terjadi kesalahan.');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menolak', err.message);
    }
  };

  // Settings & Reset
  const handleSaveSettings = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('success', 'Pengaturan Disimpan', 'Konfigurasi Google Sheets berhasil diperbarui.');
  };

  const handleResetData = () => {
    storageService.resetToInitialData();
    reloadAllData();
    showToast('info', 'Data Direset', 'Semua inventaris dan transaksi telah dikembalikan ke dataset awal PTKI Medan.');
  };

  // Sync with Google Sheets
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      if (settings.appsScriptUrl) {
        const res = await storageService.testGasConnection(settings.appsScriptUrl);
        if (res.success) {
          showToast('success', 'Sinkronisasi Selesai', 'Data transaksi berhasil diverifikasi dengan Google Sheets.');
        } else {
          showToast('warning', 'Sinkronisasi Lokal', 'Tersimpan di penyimpanan browser. Endpoint Apps Script merespons peringatan.');
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        showToast('info', 'Data Tersimpan Lokal', 'Data tersimpan rapi dan permanen di penyimpanan browser (Local Storage).');
      }
    } catch {
      showToast('error', 'Kendala Jaringan', 'Tidak dapat menghubungi Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  // If user is NOT logged in, show the AuthScreen
  if (!currentUser) {
    return (
      <>
        <AuthScreen 
          onLoginSuccess={handleLoginSuccess} 
          onUserRegistered={() => setAllUsers(storageService.getUsers())}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Pending student registrations waiting for admin ACC
  const pendingUsersCount = allUsers.filter(
    (u) => u.role === 'student' && u.status === 'pending_approval'
  ).length;

  // Overdue count calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = borrowings.filter(
    (b) => b.status === 'TERLAMBAT' || ((b.status === 'DISETUJUI' || b.status === 'SEDANG_DIPINJAM') && b.expectedReturnDate < todayStr)
  ).length;

  const pendingBorrowingsCount = borrowings.filter((b) => b.status === 'MENUNGGU_PERSETUJUAN').length;
  const pendingMaterialCount = materialUsages.filter((m) => m.status === 'MENUNGGU_PERSETUJUAN').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setPreSelectedEquipment(null);
        }}
        currentUser={currentUser}
        pendingBorrowingsCount={pendingBorrowingsCount}
        pendingMaterialCount={pendingMaterialCount}
        pendingUsersCount={pendingUsersCount}
        overdueCount={overdueCount}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isSheetsConnected={Boolean(settings.appsScriptUrl && settings.isOnline)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Sticky Top Header */}
        <Header
          currentTab={currentTab}
          activeUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUser}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          isSheetsConnected={Boolean(settings.appsScriptUrl && settings.isOnline)}
          onQuickSync={handleSyncNow}
          isSyncing={isSyncing}
          onNavigateToSheets={() => setCurrentTab('sheets-integration')}
          onNavigateToAdminProfile={() => setCurrentTab('admin-profile')}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* DASHBOARD: Split between Admin Dashboard and Student Dashboard */}
          {currentTab === 'dashboard' && (
            currentUser.role === 'admin' ? (
              <Dashboard
                equipment={equipment}
                materials={materials}
                borrowings={borrowings}
                returns={returns}
                materialUsages={materialUsages}
                userRole="admin"
                pendingUsersCount={pendingUsersCount}
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  setPreSelectedEquipment(null);
                }}
                onApproveBorrowing={handleApproveBorrowing}
                onRejectBorrowing={handleRejectBorrowing}
                onApproveMaterial={handleApproveUsage}
              />
            ) : (
              <StudentDashboard
                student={currentUser}
                borrowings={borrowings}
                materialUsages={materialUsages}
                equipment={equipment}
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  setPreSelectedEquipment(null);
                }}
              />
            )
          )}

          {currentTab === 'equipment' && (
            <EquipmentInventory
              equipment={equipment}
              userRole={currentUser.role}
              onAddEquipment={handleAddEquipment}
              onUpdateEquipment={handleUpdateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
              onDirectBorrow={handleDirectBorrow}
            />
          )}

          {currentTab === 'borrowing' && (
            <BorrowingManagement
              equipment={equipment}
              borrowings={borrowings}
              activeUser={currentUser}
              userRole={currentUser.role}
              preSelectedEquipment={preSelectedEquipment}
              onSubmitBorrowing={handleSubmitBorrowing}
              onApproveBorrowing={handleApproveBorrowing}
              onHandoverEquipment={handleHandoverEquipment}
              onRejectBorrowing={handleRejectBorrowing}
            />
          )}

          {currentTab === 'returns' && currentUser.role === 'admin' && (
            <ReturnManagement
              borrowings={borrowings}
              returns={returns}
              userRole="admin"
              currentUserName={currentUser.name}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {currentTab === 'materials' && (
            <MaterialUsageManagement
              materials={materials}
              materialUsages={materialUsages}
              activeUser={currentUser}
              userRole={currentUser.role}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onSubmitUsage={handleSubmitUsage}
              onApproveUsage={handleApproveUsage}
              onIssueMaterial={handleIssueMaterial}
              onRejectUsage={handleRejectUsage}
            />
          )}

          {currentTab === 'history' && (
            <TransactionHistory 
              history={history} 
              currentUser={currentUser}
            />
          )}

          {currentTab === 'student-profile' && (
            <StudentProfile
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'reports' && currentUser.role === 'admin' && (
            <ReportsView
              borrowings={borrowings}
              returns={returns}
              materialUsages={materialUsages}
              equipment={equipment}
              materials={materials}
              settings={settings}
            />
          )}

          {currentTab === 'sheets-integration' && currentUser.role === 'admin' && (
            <GoogleSheetsSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onSyncNow={handleSyncNow}
              isSyncing={isSyncing}
            />
          )}

          {currentTab === 'users' && currentUser.role === 'admin' && (
            <UserManagement
              users={allUsers}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onApproveUser={handleApproveStudent}
              onRejectUser={handleRejectStudent}
            />
          )}

          {currentTab === 'admin-profile' && currentUser.role === 'admin' && (
            <AdminProfile
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">
            SI-PAB WORKSHOP PTKI MEDAN &bull; Sistem Informasi Peminjaman Alat dan Pemakaian Bahan
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Politeknik Teknologi Kimia Industri Medan (Kementerian Perindustrian RI) &bull; Terhubung Google Sheets
          </p>
        </footer>
      </div>

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
