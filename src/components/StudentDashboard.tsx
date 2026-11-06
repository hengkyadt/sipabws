import React from 'react';
import { 
  User as UserType, 
  BorrowingTransaction, 
  MaterialUsage, 
  Equipment,
  NavigationTab 
} from '../types';
import { 
  GraduationCap, 
  Wrench, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  RotateCcw,
  User,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface StudentDashboardProps {
  student: UserType;
  borrowings: BorrowingTransaction[];
  materialUsages: MaterialUsage[];
  equipment: Equipment[];
  onNavigate: (tab: NavigationTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  borrowings,
  materialUsages,
  equipment,
  onNavigate
}) => {
  // Filter transactions strictly to this student
  const myBorrowings = borrowings.filter(b => b.borrowerId === student.nim_nip);
  const myMaterialUsages = materialUsages.filter(m => m.userId === student.nim_nip);

  const totalBorrowings = myBorrowings.length;
  const pendingRequests = myBorrowings.filter(b => b.status === 'MENUNGGU_PERSETUJUAN').length;
  const approvedWaitingCollection = myBorrowings.filter(b => b.status === 'DISETUJUI').length;
  const currentlyBorrowed = myBorrowings.filter(b => b.status === 'SEDANG_DIPINJAM').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const awaitingReturn = myBorrowings.filter(b => 
    (b.status === 'SEDANG_DIPINJAM' || b.status === 'DISETUJUI') && b.expectedReturnDate >= todayStr
  ).length;

  const overdueLoans = myBorrowings.filter(b => 
    b.status === 'TERLAMBAT' || ((b.status === 'SEDANG_DIPINJAM' || b.status === 'DISETUJUI') && b.expectedReturnDate < todayStr)
  );

  const totalMaterials = myMaterialUsages.length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B3C5D] via-[#124d75] to-[#07273d] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F28C28] to-amber-600 flex items-center justify-center text-white shadow-lg shrink-0 border-2 border-white/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                <span>Mahasiswa Aktif PTKI Medan</span>
                <span>&bull;</span>
                <span className="font-mono text-amber-300 font-bold">{student.nim_nip}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Halo, {student.name}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/80">
                {student.department} &bull; {student.classSemester || 'Semester Aktif'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('borrowing')}
              className="bg-[#F28C28] hover:bg-[#d97514] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Pinjam Alat Baru
            </button>
            <button
              onClick={() => onNavigate('materials')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-2 backdrop-blur-xs"
            >
              <FlaskConical className="w-4 h-4 text-amber-300" />
              Ajukan Bahan
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert if Student has Overdue Items */}
      {overdueLoans.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm">Peringatan Keterlambatan Pengembalian Alat!</p>
              <p className="text-xs text-rose-700">
                Anda memiliki {overdueLoans.length} peralatan yang telah melampaui batas tanggal pengembalian. Segera kembalikan ke workshop untuk menghindari sanksi/denda.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('borrowing')}
            className="self-start sm:self-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Lihat Pinjaman Saya
          </button>
        </div>
      )}

      {/* 6 Metric Summary Cards for Student */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Pengajuan</span>
          <p className="text-2xl font-bold font-heading text-[#0B3C5D] mt-1">{totalBorrowings}</p>
          <span className="text-[10px] text-slate-400">Peminjaman alat</span>
        </div>

        <div className={`bg-white rounded-2xl p-4 border shadow-xs ${pendingRequests > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-heading text-amber-800 mt-1">{pendingRequests}</p>
          <span className="text-[10px] text-slate-400">Verifikasi admin</span>
        </div>

        <div className={`bg-white rounded-2xl p-4 border shadow-xs ${approvedWaitingCollection > 0 ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Siap Diambil</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-heading text-blue-800 mt-1">{approvedWaitingCollection}</p>
          <span className="text-[10px] text-slate-400">Disetujui admin</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sedang Dipinjam</span>
          <p className="text-2xl font-bold font-heading text-emerald-700 mt-1">{currentlyBorrowed}</p>
          <span className="text-[10px] text-slate-400">Alat di tangan Anda</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Batas Kembali</span>
          <p className="text-2xl font-bold font-heading text-slate-700 mt-1">{awaitingReturn}</p>
          <span className="text-[10px] text-slate-400">Menunggu jadwal</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Bahan Dipakai</span>
          <p className="text-2xl font-bold font-heading text-[#F28C28] mt-1">{totalMaterials}</p>
          <span className="text-[10px] text-slate-400">Transaksi bahan</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('borrowing')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3C5D] flex items-center justify-center mb-3 group-hover:bg-[#0B3C5D] group-hover:text-white transition">
            <Wrench className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Pinjam Peralatan Workshop</h4>
          <p className="text-xs text-slate-500 mt-1">
            Lihat ketersediaan alat dan mesin perkakas.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0B3C5D] group-hover:text-[#F28C28]">
            <span>Buka Formulir</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('materials')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F28C28] flex items-center justify-center mb-3 group-hover:bg-[#F28C28] group-hover:text-white transition">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Ajukan Bahan Habis Pakai</h4>
          <p className="text-xs text-slate-500 mt-1">
            Besi, kawat las, kertas pasir, dan bahan lainnya.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#F28C28]">
            <span>Ambil Bahan</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Riwayat Aktivitas Saya</h4>
          <p className="text-xs text-slate-500 mt-1">
            Semua catatan peminjaman, pengembalian, dan bahan yang pernah diajukan.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <span>Lihat Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('student-profile')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-700 group-hover:text-white transition">
            <User className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Profil & Ganti Password</h4>
          <p className="text-xs text-slate-500 mt-1">
            Ubah nomor kontak WhatsApp dan perbarui kata sandi akun Anda.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-purple-700">
            <span>Kelola Akun</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </div>
        </button>
      </div>

      {/* Early Return Guidance Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-[#0B3C5D] text-white flex items-center justify-center shrink-0 shadow-xs">
          <RotateCcw className="w-4 h-4 text-[#F28C28]" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-[#0B3C5D] text-sm">
            Ingin Mengembalikan Alat Lebih Cepat dari Jadwal?
          </p>
          <p className="text-slate-600 leading-relaxed">
            Anda dapat mengembalikan peralatan kapan saja sebelum batas waktu pengembalian berakhir. Cukup bawa fisik peralatan beserta aksesorisnya ke <strong>Ruang Workshop PTKI Medan</strong> dan tunjukkan <strong>Kode Transaksi</strong> kepada Administrator / Teknisi untuk diperiksa kelengkapannya dan diselesaikan di sistem.
          </p>
        </div>
      </div>

      {/* Active Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#F28C28]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Peminjaman Aktif Saya ({myBorrowings.length} Transaksi)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('borrowing')}
            className="text-xs font-semibold text-[#0B3C5D] hover:underline"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Peralatan Dipinjam</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Batas Pengembalian</th>
                <th className="py-3 px-4">Status Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myBorrowings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    Anda belum memiliki riwayat peminjaman alat.
                  </td>
                </tr>
              ) : (
                myBorrowings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B3C5D]">
                      {b.transactionCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {b.equipmentName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {b.quantity} Unit
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {b.expectedReturnDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {b.status === 'MENUNGGU_PERSETUJUAN' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Menunggu Review Admin
                        </span>
                      )}
                      {b.status === 'DISETUJUI' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          Disetujui (Silakan Ambil di Workshop)
                        </span>
                      )}
                      {b.status === 'SEDANG_DIPINJAM' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Sedang Digunakan
                        </span>
                      )}
                      {b.status === 'DIKEMBALIKAN' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Sudah Dikembalikan
                        </span>
                      )}
                      {b.status === 'TERLAMBAT' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
                          Terlambat Dikembalikan
                        </span>
                      )}
                      {b.status === 'DITOLAK' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Ditolak
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

