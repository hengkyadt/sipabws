import React, { useState } from 'react';
import { 
  Menu, 
  RotateCw, 
  UserCircle, 
  Sheet, 
  Check, 
  ChevronDown,
  Sparkles,
  ArrowRightLeft,
  LogOut,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { User, NavigationTab } from '../types';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  currentTab: NavigationTab;
  activeUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onOpenMobileMenu: () => void;
  isSheetsConnected: boolean;
  onQuickSync: () => void;
  isSyncing: boolean;
  onNavigateToSheets: () => void;
  onNavigateToAdminProfile?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeUser,
  allUsers,
  onSwitchUser,
  onOpenMobileMenu,
  isSheetsConnected,
  onQuickSync,
  isSyncing,
  onNavigateToSheets,
  onNavigateToAdminProfile,
  onLogout
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isAdmin = activeUser.role === 'admin';

  const getPageInfo = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: isAdmin ? 'Dashboard Administrator Workshop' : 'Dashboard Mahasiswa',
          subtitle: isAdmin 
            ? 'Ringkasan aktivitas peminjaman alat, stok bahan, dan persetujuan terkini' 
            : 'Status peminjaman alat, batas pengembalian, dan riwayat praktikum Anda'
        };
      case 'equipment':
        return {
          title: 'Katalog & Inventaris Peralatan',
          subtitle: 'Katalog mesin perkakas bubut/las, dan peralatan lab lainnya'
        };
      case 'borrowing':
        return {
          title: isAdmin ? 'Sistem Peminjaman & Persetujuan' : 'Peminjaman Peralatan Saya',
          subtitle: isAdmin 
            ? 'Tinjau, setujui, tolak, dan serah terima alat kepada mahasiswa'
            : 'Formulir pengajuan peminjaman baru dan monitoring status persetujuan'
        };
      case 'returns':
        return {
          title: 'Manajemen Pengembalian Alat',
          subtitle: 'Pencatatan pengembalian fisik, verifikasi kondisi, dan pemantauan keterlambatan'
        };
      case 'materials':
        return {
          title: isAdmin ? 'Manajemen Pemakaian Bahan' : 'Permohonan Pemakaian Bahan',
          subtitle: isAdmin 
            ? 'Persetujuan dan konfirmasi pengeluaran fisik reagen serta bahan habis pakai'
            : 'Formulir permintaan besi, kawat las, kertas pasir, dan bahan lainnya untuk praktikum'
        };
      case 'history':
        return {
          title: isAdmin ? 'Riwayat Transaksi Terpadu' : 'Riwayat Aktivitas Saya',
          subtitle: 'Log audit permanen seluruh transaksi peminjaman, pengembalian, dan bahan'
        };
      case 'reports':
        return {
          title: 'Laporan & Ekspor Berita Acara',
          subtitle: 'Cetak dokumen berita acara resmi berkop PTKI Medan atau ekspor ke Excel'
        };
      case 'sheets-integration':
        return {
          title: 'Integrasi Google Sheets & Apps Script',
          subtitle: 'Konfigurasi backend database 10 tabel Google Sheets dan generator Code.gs'
        };
      case 'users':
        return {
          title: 'Manajemen Akun Mahasiswa',
          subtitle: 'Kelola akun mahasiswa, aktivasi, penonaktifan, dan reset password'
        };
      case 'admin-profile':
        return {
          title: 'Pengaturan Akun & Password Administrator',
          subtitle: 'Kelola username login, email, nama kepala workshop, dan kata sandi admin tunggal'
        };
      case 'student-profile':
        return {
          title: 'Profil Mahasiswa & Keamanan',
          subtitle: 'Informasi kontak aktif dan pengaturan kata sandi akun'
        };
      default:
        return {
          title: 'SI-PAB Workshop PTKI Medan',
          subtitle: 'Sistem Informasi Peminjaman Alat dan Pemakaian Bahan'
        };
    }
  };

  const pageInfo = getPageInfo(currentTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#0B3C5D] truncate font-heading tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, Sync, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Google Sheets Status Pill (Only clickable/manageable by admin) */}
          <button
            onClick={isAdmin ? onNavigateToSheets : undefined}
            disabled={!isAdmin}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-2xs ${
              isSheetsConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
            title={isAdmin ? 'Konfigurasi Google Sheets' : 'Database terhubung ke Google Sheets'}
          >
            <Sheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">
              {isSheetsConnected ? 'Google Sheets Aktif' : 'Lokal Storage'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isSheetsConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          </button>

          {/* Quick Sync Button */}
          <button
            onClick={onQuickSync}
            disabled={isSyncing}
            className="p-2 text-slate-500 hover:text-[#0B3C5D] hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
            title="Sinkronisasi Data"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#F28C28]' : ''}`} />
          </button>

          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-left"
            >
              <UserAvatar
                name={activeUser.name}
                role={activeUser.role}
                size="md"
                showStatusIndicator={true}
              />

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {activeUser.name}
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className={`font-semibold uppercase tracking-wider ${
                    isAdmin ? 'text-[#F28C28]' : 'text-emerald-600'
                  }`}>
                    {isAdmin ? 'Admin Workshop' : 'Mahasiswa'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-mono">{activeUser.nim_nip}</span>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl mb-2 border border-slate-100">
                    <p className="text-[11px] font-bold text-[#0B3C5D] uppercase tracking-wider flex items-center gap-1.5">
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
                          Akun Administrator Tunggal
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          Akun Mahasiswa Terdaftar
                        </>
                      )}
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-1">{activeUser.name}</p>
                    <p className="text-[11px] text-slate-500">{activeUser.department}</p>
                  </div>

                  {/* If admin, show quick tester to test other accounts */}
                  {isAdmin && (
                    <div className="mb-2">
                      <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Uji Tampilan Akun Lain:
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {allUsers.map((user) => {
                          const isSelected = user.id === activeUser.id;
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                onSwitchUser(user);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition ${
                                isSelected
                                  ? 'bg-[#0B3C5D] text-white shadow-sm'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <UserAvatar
                                name={user.name}
                                role={user.role}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0 text-xs">
                                <p className="font-semibold truncate leading-tight">{user.name}</p>
                                <p className={`text-[10px] truncate ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {user.nim_nip} ({user.role === 'admin' ? 'Admin' : 'Mahasiswa'})
                                </p>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#F28C28] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Profile & Password Quick Link */}
                  {isAdmin && onNavigateToAdminProfile && (
                    <div className="px-1 pb-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onNavigateToAdminProfile();
                        }}
                        className="w-full flex items-center gap-2.5 p-2 bg-blue-50/70 hover:bg-blue-100/70 text-[#0B3C5D] rounded-xl text-xs font-bold transition border border-blue-200/60 text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#F28C28] shrink-0" />
                        <span className="flex-1">Pengaturan Akun & Password</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Aplikasi (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

