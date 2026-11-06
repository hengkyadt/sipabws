import React from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw,
  ArrowUpRight,
  Check,
  X,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import { 
  Equipment, 
  Material, 
  BorrowingTransaction, 
  ReturnTransaction, 
  MaterialUsage, 
  UserRole,
  NavigationTab
} from '../types';

interface DashboardProps {
  equipment: Equipment[];
  materials: Material[];
  borrowings: BorrowingTransaction[];
  returns: ReturnTransaction[];
  materialUsages: MaterialUsage[];
  userRole: UserRole;
  pendingUsersCount?: number;
  onNavigate: (tab: NavigationTab) => void;
  onApproveBorrowing: (id: string) => void;
  onRejectBorrowing: (id: string, reason: string) => void;
  onApproveMaterial: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  equipment,
  materials,
  borrowings,
  returns,
  materialUsages,
  userRole,
  pendingUsersCount = 0,
  onNavigate,
  onApproveBorrowing,
  onRejectBorrowing,
  onApproveMaterial
}) => {
  // Metric Calculations
  const totalEquipmentCount = equipment.reduce((acc, eq) => acc + eq.totalQty, 0);
  const availableEquipmentCount = equipment.reduce((acc, eq) => acc + eq.availableQty, 0);
  const borrowedEquipmentCount = totalEquipmentCount - availableEquipmentCount;
  const totalMaterialTypes = materials.length;

  const pendingBorrowings = borrowings.filter(b => b.status === 'MENUNGGU_PERSETUJUAN');
  const pendingBorrowingsCount = pendingBorrowings.length;

  const pendingMaterialUsages = materialUsages.filter(m => m.status === 'MENUNGGU_PERSETUJUAN');

  const approvedMaterialCount = materialUsages.filter(m => m.status === 'DISETUJUI').length;

  const overdueList = borrowings.filter(b => {
    if (b.status === 'TERLAMBAT') return true;
    if (b.status === 'DISETUJUI') {
      const today = new Date().toISOString().split('T')[0];
      return b.expectedReturnDate < today;
    }
    return false;
  });
  const overdueCount = overdueList.length;

  // Equipment borrowing statistics by Department
  const borrowingsByDept: Record<string, number> = {};
  borrowings.forEach(b => {
    borrowingsByDept[b.department] = (borrowingsByDept[b.department] || 0) + b.quantity;
  });

  // Material usage volume by Category
  const materialByCategory: Record<string, number> = {};
  materialUsages.filter(m => m.status === 'DISETUJUI').forEach(m => {
    materialByCategory[m.category] = (materialByCategory[m.category] || 0) + m.quantityUsed;
  });

  const cards = [
    {
      title: 'Total Inventaris Alat',
      value: totalEquipmentCount,
      unit: 'Unit Alat',
      subtitle: `${equipment.length} jenis instrumen & mesin`,
      icon: Wrench,
      accent: 'border-l-blue-600',
      iconBg: 'bg-blue-50 text-blue-700',
      tab: 'equipment' as NavigationTab
    },
    {
      title: 'Alat Tersedia di Workshop',
      value: availableEquipmentCount,
      unit: 'Unit',
      subtitle: `${Math.round((availableEquipmentCount / (totalEquipmentCount || 1)) * 100)}% siap dipinjam`,
      icon: CheckCircle2,
      accent: 'border-l-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tab: 'equipment' as NavigationTab
    },
    {
      title: 'Sedang Dipinjam',
      value: borrowedEquipmentCount,
      unit: 'Unit',
      subtitle: 'Praktikum & penelitian aktif',
      icon: Clock,
      accent: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-700',
      tab: 'borrowing' as NavigationTab
    },
    {
      title: 'Katalog Bahan Workshop',
      value: totalMaterialTypes,
      unit: 'Kategori Bahan',
      subtitle: `${materials.filter(m => m.stock <= m.minStock).length} bahan di bawah stok minimum`,
      icon: FlaskConical,
      accent: 'border-l-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-700',
      tab: 'materials' as NavigationTab
    },
    {
      title: 'Permohonan Peminjaman',
      value: pendingBorrowingsCount,
      unit: 'Menunggu',
      subtitle: pendingBorrowingsCount > 0 ? 'Perlu tindakan verifikasi admin' : 'Semua permohonan telah diproses',
      icon: AlertCircle,
      accent: 'border-l-[#F28C28]',
      iconBg: 'bg-orange-50 text-[#F28C28]',
      tab: 'borrowing' as NavigationTab,
      highlight: pendingBorrowingsCount > 0
    },
    {
      title: 'Total Pemakaian Bahan',
      value: approvedMaterialCount,
      unit: 'Transaksi',
      subtitle: `${materialUsages.length} total pengajuan tercatat`,
      icon: TrendingUp,
      accent: 'border-l-teal-600',
      iconBg: 'bg-teal-50 text-teal-700',
      tab: 'materials' as NavigationTab
    },
    {
      title: 'Keterlambatan Pengembalian',
      value: overdueCount,
      unit: 'Transaksi',
      subtitle: overdueCount > 0 ? 'Segera tindak lanjuti peminjam' : 'Tidak ada keterlambatan',
      icon: AlertTriangle,
      accent: 'border-l-rose-600',
      iconBg: 'bg-rose-50 text-rose-700',
      tab: 'returns' as NavigationTab,
      alert: overdueCount > 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B3C5D] via-[#124d75] to-[#07273d] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#F28C28]/20 text-orange-200 border border-[#F28C28]/40 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F28C28] animate-pulse" />
              Sistem Digital Terintegrasi
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
              SI-PAB Workshop PTKI Medan
            </h2>
            <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
              Selamat datang di portal sentralisasi peminjaman alat praktikum, pengembalian instrumen laboratorium, dan permohonan pemakaian bahan praktikum mahasiswa Politeknik Teknologi Kimia Industri Medan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('borrowing')}
              className="bg-[#F28C28] hover:bg-[#d97514] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Ajukan Pinjam Alat
            </button>
            <button
              onClick={() => onNavigate('materials')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-2 backdrop-blur-xs"
            >
              <FlaskConical className="w-4 h-4 text-orange-300" />
              Ambil Bahan
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner: Pending Student Registrations waiting for Admin ACC */}
      {userRole === 'admin' && pendingUsersCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 ring-4 ring-amber-100">
              <UserCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                  Perlu Tindakan
                </span>
                <p className="font-bold text-sm text-amber-950">
                  Terdapat {pendingUsersCount} Pendaftaran Mahasiswa Baru Menunggu ACC Admin!
                </p>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Akun mahasiswa baru berstatus pending dan belum dapat meminjam alat/bahan praktikum sebelum diverifikasi & disetujui oleh Administrator Workshop.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('users')}
            className="self-start sm:self-auto px-4 py-2.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Buka Verifikasi & ACC ({pendingUsersCount})
          </button>
        </div>
      )}

      {/* Overdue Warning Alert Banner if any */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm">Peringatan: Terdapat {overdueCount} Alat Terlambat Dikembalikan!</p>
              <p className="text-xs text-rose-700">
                Peminjaman telah melampaui batas tanggal pengembalian yang disepakati. Harap lakukan konfirmasi pengembalian di menu Pengembalian Alat.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('returns')}
            className="self-start sm:self-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0"
          >
            Tinjau Pengembalian
          </button>
        </div>
      )}

      {/* 7 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(c.tab)}
              className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer border-l-4 ${c.accent} ${
                c.alert ? 'ring-2 ring-rose-400/50 bg-rose-50/20' : ''
              } ${c.highlight ? 'ring-2 ring-orange-400/50 bg-orange-50/20' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0B3C5D] font-heading">
                  {c.value}
                </span>
                <span className="text-xs font-semibold text-slate-600">{c.unit}</span>
              </div>

              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span className="truncate">{c.subtitle}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Charts & Pending Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Statistics & Distribution (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Peminjaman Alat per Jurusan / Program Studi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0B3C5D] text-base font-heading">
                  Statistik Peminjaman Alat per Program Studi
                </h3>
                <p className="text-xs text-slate-500">Distribusi pemakaian alat workshop oleh mahasiswa & dosen</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                Workshop
              </span>
            </div>

            <div className="space-y-3.5">
              {Object.entries(borrowingsByDept).map(([dept, qty], index) => {
                const totalInDept = Object.values(borrowingsByDept).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((qty / totalInDept) * 100);
                const colors = ['bg-[#0B3C5D]', 'bg-[#F28C28]', 'bg-teal-600', 'bg-indigo-600'];
                const barColor = colors[index % colors.length];

                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{dept}</span>
                      <span className="text-slate-500 font-mono">
                        {qty} alat ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Pemakaian Bahan per Kategori */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0B3C5D] text-base font-heading">
                  Statistik Pemakaian Bahan Habis Pakai
                </h3>
                <p className="text-xs text-slate-500">Konsumsi besi, kawat las, plat, dan bahan lainnya pada praktikum</p>
              </div>
              <button 
                onClick={() => onNavigate('materials')}
                className="text-xs font-semibold text-[#F28C28] hover:underline flex items-center gap-1"
              >
                Lihat Stok Lengkap
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {materials.slice(0, 4).map((mat) => {
                const isLow = mat.stock <= mat.minStock;
                return (
                  <div 
                    key={mat.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                      isLow ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-slate-500">{mat.code}</span>
                        <span className="font-medium text-[11px] text-slate-600">{mat.category}</span>
                      </div>
                      <p className="font-bold text-slate-800 line-clamp-1">{mat.name}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500">Sisa Stok:</span>
                      <span className={`font-mono font-bold ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                        {mat.stock} {mat.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals Queue & Quick Admin Actions (1 Col) */}
        <div className="space-y-6">
          {/* Pending Borrowings Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F28C28]" />
                <h3 className="font-bold text-[#0B3C5D] text-sm font-heading">
                  Antrean Verifikasi Peminjaman
                </h3>
              </div>
              <span className="text-xs bg-orange-100 text-[#F28C28] font-bold px-2 py-0.5 rounded-full">
                {pendingBorrowings.length}
              </span>
            </div>

            {pendingBorrowings.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-xs font-medium">Tidak ada permohonan tertunda.</p>
                <p className="text-[11px]">Semua permohonan telah diverifikasi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBorrowings.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-slate-500">{item.transactionCode}</span>
                        <p className="font-bold text-slate-800">{item.borrowerName}</p>
                        <p className="text-[10px] text-slate-500">{item.department} ({item.borrowerId})</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.quantity} Unit
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100 font-medium">
                      {item.equipmentName}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Kembali: {item.expectedReturnDate}
                      </span>
                    </div>

                    {userRole === 'admin' ? (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                        <button
                          onClick={() => onApproveBorrowing(item.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition text-[11px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Masukkan alasan penolakan permohonan pinjam:');
                            if (reason) onRejectBorrowing(item.id, reason);
                          }}
                          className="flex-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition text-[11px]"
                        >
                          <X className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold block text-center">
                        Menunggu Persetujuan Admin Workshop
                      </span>
                    )}
                  </div>
                ))}

                {pendingBorrowings.length > 3 && (
                  <button
                    onClick={() => onNavigate('borrowing')}
                    className="w-full py-2 text-center text-xs text-[#0B3C5D] font-bold hover:underline"
                  >
                    Lihat semua ({pendingBorrowings.length}) permohonan →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pending Material Usages */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-[#0B3C5D] text-sm font-heading">
                  Permohonan Bahan Menunggu
                </h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {pendingMaterialUsages.length}
              </span>
            </div>

            {pendingMaterialUsages.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">
                Tidak ada antrean bahan.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingMaterialUsages.slice(0, 2).map((mu) => (
                  <div key={mu.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800 font-bold">{mu.userName}</span>
                      <span className="text-emerald-700 font-bold font-mono">
                        {mu.quantityUsed} {mu.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{mu.materialName}</p>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => onApproveMaterial(mu.id)}
                        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 rounded-lg text-[10px] transition"
                      >
                        Setujui Pengambilan Bahan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

