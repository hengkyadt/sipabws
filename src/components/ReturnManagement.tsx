import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  User, 
  Wrench, 
  FileCheck2,
  DollarSign,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  BorrowingTransaction, 
  ReturnTransaction, 
  UserRole 
} from '../types';

interface ReturnManagementProps {
  borrowings: BorrowingTransaction[];
  returns: ReturnTransaction[];
  userRole: UserRole;
  currentUserName: string;
  onProcessReturn: (params: {
    borrowingId: string;
    actualReturnDate: string;
    conditionUponReturn: 'Baik' | 'Rusak' | 'Hilang';
    notes?: string;
    penalty?: number;
    confirmedBy: string;
  }) => void;
}

export const ReturnManagement: React.FC<ReturnManagementProps> = ({
  borrowings,
  returns,
  userRole,
  currentUserName,
  onProcessReturn
}) => {
  const [activeTab, setActiveTab] = useState<'pending_returns' | 'return_history'>('pending_returns');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Return Confirmation Modal
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingTransaction | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [actualReturnDate, setActualReturnDate] = useState(today);
  const [conditionUponReturn, setConditionUponReturn] = useState<'Baik' | 'Rusak' | 'Hilang'>('Baik');
  const [notes, setNotes] = useState('');
  const [penalty, setPenalty] = useState(0);

  // Active borrowings that have been approved/handed over and not yet returned
  const pendingReturnBorrowings = borrowings.filter(
    b => b.status === 'SEDANG_DIPINJAM' || b.status === 'DISETUJUI' || b.status === 'TERLAMBAT'
  );

  const filteredPending = pendingReturnBorrowings.filter(b => 
    b.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = returns.filter(r => 
    r.returnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenReturnModal = (item: BorrowingTransaction) => {
    setSelectedBorrowing(item);
    setActualReturnDate(today);
    setConditionUponReturn('Baik');
    setNotes('');
    setPenalty(0);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowing) return;

    onProcessReturn({
      borrowingId: selectedBorrowing.id,
      actualReturnDate,
      conditionUponReturn,
      notes,
      penalty,
      confirmedBy: currentUserName
    });

    setSelectedBorrowing(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('pending_returns')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'pending_returns'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#F28C28]" />
          <span>Alat Belum Kembali (Sedang Dipinjam)</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            activeTab === 'pending_returns' ? 'bg-[#F28C28] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {pendingReturnBorrowings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('return_history')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'return_history'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Riwayat Pengembalian Selesai</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            activeTab === 'return_history' ? 'bg-[#F28C28] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {returns.length}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode transaksi, nama peminjam, NIM, atau nama peralatan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
          />
        </div>
      </div>

      {/* TAB 1: PENDING RETURNS (ACTIVE BORROWINGS) */}
      {activeTab === 'pending_returns' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Alat Dalam Masa Pinjam ({filteredPending.length} Transaksi)
            </span>
            <span className="text-xs text-slate-500">
              Konfirmasi pengembalian akan mengembalikan stok alat di sistem.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Peralatan Dipinjam</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Batas Kembali</th>
                  <th className="py-3 px-4">Status Waktu</th>
                  <th className="py-3 px-4 text-right">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      <p className="font-medium">Semua alat yang dipinjam telah dikembalikan ke workshop.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((item) => {
                    const isOverdue = item.expectedReturnDate < today || item.status === 'TERLAMBAT';

                    return (
                      <tr key={item.id} className={`hover:bg-blue-50/30 transition ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                        {/* Borrower */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] text-slate-400 block">{item.transactionCode}</span>
                          <p className="font-bold text-slate-900 leading-tight">{item.borrowerName}</p>
                          <p className="text-[11px] text-slate-500">{item.department} ({item.borrowerId})</p>
                        </td>

                        {/* Equipment & Qty */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 leading-snug">{item.equipmentName}</p>
                          <span className="inline-block bg-blue-50 text-blue-700 font-mono font-bold text-xs px-2 py-0.5 rounded mt-0.5">
                            {item.quantity} Unit
                          </span>
                        </td>

                        {/* Borrow Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {item.borrowDate}
                        </td>

                        {/* Expected Return Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                          {item.expectedReturnDate}
                        </td>

                        {/* Status / Overdue Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Terlambat Dikembalikan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Masa Pinjam Aktif
                            </span>
                          )}
                        </td>

                        {/* Action: Return Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {userRole === 'admin' ? (
                            <button
                              onClick={() => handleOpenReturnModal(item)}
                              className="px-3 py-1.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 ml-auto"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#F28C28]" />
                              <span>Konfirmasi Kembali</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              Serahkan alat ke Teknisi
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RETURN HISTORY */}
      {activeTab === 'return_history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Arsip Pengembalian Alat Selesai ({filteredHistory.length} Transaksi)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Sheet: Return_Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">No. Pengembalian</th>
                  <th className="py-3 px-4">Peminjam</th>
                  <th className="py-3 px-4">Peralatan</th>
                  <th className="py-3 px-4">Tgl Kembali Riil</th>
                  <th className="py-3 px-4">Kondisi Alat Saat Kembali</th>
                  <th className="py-3 px-4">Denda / Catatan</th>
                  <th className="py-3 px-4">Dikonfirmasi Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FileCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium">Belum ada arsip pengembalian.</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-800 text-xs block">
                          {ret.returnCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {ret.transactionCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-tight">{ret.borrowerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{ret.borrowerId}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{ret.equipmentName}</p>
                        <span className="text-xs text-slate-500 font-mono">{ret.quantity} Unit</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{ret.actualReturnDate}</span>
                        <span className="text-[10px] text-slate-400 block">Jadwal: {ret.expectedReturnDate}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ret.conditionUponReturn === 'Baik' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Baik & Lengkap
                          </span>
                        )}
                        {ret.conditionUponReturn === 'Rusak' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Ada Kerusakan
                          </span>
                        )}
                        {ret.conditionUponReturn === 'Hilang' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Hilang
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {ret.penalty ? (
                          <span className="font-mono text-rose-600 font-bold block text-xs">
                            Denda: Rp {ret.penalty.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                        <p className="text-xs text-slate-600 italic line-clamp-1">
                          {ret.notes || '-'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          {ret.confirmedBy}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRM RETURN MODAL */}
      {selectedBorrowing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#F28C28]" />
                <h3 className="text-base font-bold text-[#0B3C5D] font-heading">
                  Verifikasi Pengembalian Peralatan
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">
                {selectedBorrowing.transactionCode}
              </span>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              {/* Summary box of the loan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p><strong>Peminjam:</strong> {selectedBorrowing.borrowerName} ({selectedBorrowing.borrowerId})</p>
                <p><strong>Program Studi:</strong> {selectedBorrowing.department}</p>
                <p><strong>Peralatan:</strong> {selectedBorrowing.equipmentName} ({selectedBorrowing.quantity} Unit)</p>
                <p><strong>Jadwal Pengembalian:</strong> {selectedBorrowing.expectedReturnDate}</p>
              </div>

              {/* Actual Return Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tanggal Pengembalian Fisik *
                  </label>
                  {actualReturnDate < selectedBorrowing.expectedReturnDate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ⚡ Lebih Awal ({selectedBorrowing.expectedReturnDate})
                    </span>
                  )}
                  {actualReturnDate === selectedBorrowing.expectedReturnDate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                      ✓ Tepat Waktu
                    </span>
                  )}
                  {actualReturnDate > selectedBorrowing.expectedReturnDate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                      ⚠️ Terlambat
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  required
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                />
                {actualReturnDate < selectedBorrowing.expectedReturnDate && (
                  <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Mahasiswa mengembalikan alat lebih awal dari jadwal yang diajukan. Bebas denda keterlambatan.</span>
                  </p>
                )}
              </div>

              {/* Condition upon return */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kondisi Fisik Saat Dikembalikan *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Baik', 'Rusak', 'Hilang'] as const).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setConditionUponReturn(cond)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        conditionUponReturn === cond
                          ? cond === 'Baik'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : cond === 'Rusak'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cond === 'Baik' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {cond === 'Rusak' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {cond === 'Hilang' && <XCircle className="w-3.5 h-3.5" />}
                      <span>{cond}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Damage Notes or Penalty if not Baik */}
              {conditionUponReturn !== 'Baik' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="text-xs text-amber-900 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Pencatatan Masalah / Denda Ganti Rugi
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Estimasi Denda / Biaya Perbaikan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={penalty}
                      onChange={(e) => setPenalty(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pemeriksaan Teknisi
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kelengkapan baut, kabel, kebersihan alat, atau kondisi fungsi operasional..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedBorrowing(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Konfirmasi Pengembalian Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;

