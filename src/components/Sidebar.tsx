import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardList, 
  RotateCcw, 
  FlaskConical, 
  History, 
  FileText, 
  Sheet, 
  Users, 
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  X,
  LogOut,
  UserCircle
} from 'lucide-react';
import { NavigationTab, UserRole, User as UserType } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: UserType;
  pendingBorrowingsCount: number;
  pendingMaterialCount: number;
  overdueCount: number;
  pendingUsersCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isSheetsConnected: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  pendingBorrowingsCount,
  pendingMaterialCount,
  overdueCount,
  pendingUsersCount = 0,
  isOpenMobile,
  onCloseMobile,
  isSheetsConnected,
  onLogout
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Navigation Items customized per role
  const adminNavItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard Admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'equipment' as NavigationTab,
      label: 'Inventaris Alat',
      icon: Wrench,
      badge: null
    },
    {
      id: 'borrowing' as NavigationTab,
      label: 'Peminjaman & Persetujuan',
      icon: ClipboardList,
      badge: pendingBorrowingsCount > 0 ? (
        <span className="ml-auto bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {pendingBorrowingsCount}
        </span>
      ) : null
    },
    {
      id: 'returns' as NavigationTab,
      label: 'Pengembalian Alat',
      icon: RotateCcw,
      badge: overdueCount > 0 ? (
        <span className="ml-auto bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          {overdueCount} Terlambat
        </span>
      ) : null
    },
    {
      id: 'materials' as NavigationTab,
      label: 'Pemakaian Bahan Workshop',
      icon: FlaskConical,
      badge: pendingMaterialCount > 0 ? (
        <span className="ml-auto bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {pendingMaterialCount}
        </span>
      ) : null
    },
    {
      id: 'history' as NavigationTab,
      label: 'Riwayat Transaksi',
      icon: History,
      badge: null
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Laporan & Berita Acara',
      icon: FileText,
      badge: null
    },
    {
      id: 'users' as NavigationTab,
      label: 'Kelola Akun Mahasiswa',
      icon: Users,
      badge: pendingUsersCount > 0 ? (
        <span className="ml-auto bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          {pendingUsersCount} ACC
        </span>
      ) : null
    },
    {
      id: 'admin-profile' as NavigationTab,
      label: 'Profil & Akun Admin',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'sheets-integration' as NavigationTab,
      label: 'Google Sheets DB',
      icon: Sheet,
      badge: isSheetsConnected ? (
        <span className="ml-auto bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-medium px-2 py-0.5 rounded-full">
          Live Sync
        </span>
      ) : (
        <span className="ml-auto bg-slate-700 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
          Lokal
        </span>
      )
    }
  ];

  const studentNavItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard Saya',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'equipment' as NavigationTab,
      label: 'Katalog Alat Workshop',
      icon: Wrench,
      badge: null
    },
    {
      id: 'borrowing' as NavigationTab,
      label: 'Peminjaman Alat Saya',
      icon: ClipboardList,
      badge: null
    },
    {
      id: 'materials' as NavigationTab,
      label: 'Pemakaian Bahan Saya',
      icon: FlaskConical,
      badge: null
    },
    {
      id: 'history' as NavigationTab,
      label: 'Riwayat Aktivitas Saya',
      icon: History,
      badge: null
    },
    {
      id: 'student-profile' as NavigationTab,
      label: 'Profil & Password',
      icon: UserCircle,
      badge: null
    }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#0B3C5D] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#07273d]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F28C28] to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-amber-300/30 shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide text-white font-heading">SI-PAB</span>
                <span className="bg-[#F28C28] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">PTKI</span>
              </div>
              <p className="text-[11px] text-blue-200/80 leading-tight font-medium">Workshop</p>
              <p className="text-[9px] text-slate-400 font-mono">Politeknik Teknologi Kimia Industri</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-5 py-3 bg-[#09324e] border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-100">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
            ) : (
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            )}
            <span>Peran: <strong className="text-white capitalize font-semibold">{isAdmin ? 'Administrator Workshop' : 'Mahasiswa PTKI'}</strong></span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1.5 custom-scrollbar">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-blue-300/60 uppercase">
            {isAdmin ? 'Menu Administrator' : 'Menu Mahasiswa'}
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F28C28] to-amber-600 text-white shadow-md shadow-orange-900/30 font-semibold'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-white scale-110' : 'text-blue-300 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge}
                {!item.badge && isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account Info & Logout Button */}
        <div className="p-3.5 bg-[#07273d] border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/5">
            <UserAvatar
              name={currentUser.name}
              role={currentUser.role}
              size="lg"
            />
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-bold text-white truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-blue-200/70 font-mono truncate">{currentUser.nim_nip}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

