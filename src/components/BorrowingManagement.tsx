import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Send, 
  Check, 
  X, 
  Search, 
  Calendar, 
  Clock, 
  Wrench, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  FileCheck2,
  HandMetal,
  PackageCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { 
  Equipment, 
  BorrowingTransaction, 
  BorrowingStatus, 
  User as UserType, 
  UserRole 
} from '../types';

interface BorrowingManagementProps {
  equipment: Equipment[];
  borrowings: BorrowingTransaction[];
  activeUser: UserType;
  userRole: UserRole;
  preSelectedEquipment?: Equipment | null;
  onSubmitBorrowing: (data: Omit<BorrowingTransaction, 'id' | 'transactionCode' | 'createdAt' | 'status'>) => void;
  onApproveBorrowing: (id: string) => void;
  onHandoverEquipment?: (id: string) => void;
  onRejectBorrowing: (id: string, reason: string) => void;
}

export const BorrowingManagement: React.FC<BorrowingManagementProps> = ({
  equipment,
  borrowings,
  activeUser,
  userRole,
  preSelectedEquipment,
  onSubmitBorrowing,
  onApproveBorrowing,
  onHandoverEquipment,
  onRejectBorrowing
}) => {
  const isAdmin = activeUser.role === 'admin';
  const [activeTab, setActiveTab] = useState<'list' | 'form'>(preSelectedEquipment ? 'form' : 'list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const nextThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    borrowerName: activeUser.name,
    borrowerId: activeUser.nim_nip,
    department: activeUser.department,
    classSemester: activeUser.classSemester || '',
    equipmentId: preSelectedEquipment?.id || (equipment[0]?.id || ''),
    quantity: 1,
    borrowDate: today,
    expectedReturnDate: nextThreeDays,
    purpose: '',
    notes: ''
  });

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetRejectId, setTargetRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected Equipment info for live stock verification
  const selectedEquipment = equipment.find(e => e.id === formData.equipmentId);
  const maxAvailable = selectedEquipment ? selectedEquipment.availableQty : 0;

  useEffect(() => {
    if (preSelectedEquipment) {
      setFormData(prev => ({
        ...prev,
        equipmentId: preSelectedEquipment.id
      }));
      setActiveTab('form');
    }
  }, [preSelectedEquipment]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      borrowerName: activeUser.name,
      borrowerId: activeUser.nim_nip,
      department: activeUser.department,
      classSemester: activeUser.classSemester || ''
    }));
  }, [activeUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEquipment) {
      alert('Pilih peralatan yang ingin dipinjam.');
      return;
    }

    if (maxAvailable <= 0) {
      alert('Maaf, stok alat ini saat ini sedang habis atau dalam perawatan.');
      return;
    }

    if (formData.quantity > maxAvailable) {
      alert(`Jumlah yang diminta (${formData.quantity}) melebihi stok yang tersedia (${maxAvailable}).`);
      return;
    }

    if (formData.expectedReturnDate < formData.borrowDate) {
      alert('Tanggal pengembalian tidak boleh mendahului tanggal peminjaman.');
      return;
    }

    onSubmitBorrowing({
      borrowerName: formData.borrowerName,
      borrowerId: formData.borrowerId,
      department: formData.department,
      classSemester: formData.classSemester,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      equipmentCode: selectedEquipment.code,
      quantity: formData.quantity,
      borrowDate: formData.borrowDate,
      expectedReturnDate: formData.expectedReturnDate,
      purpose: formData.purpose,
      notes: formData.notes
    });

    setFormData(prev => ({
      ...prev,
      purpose: '',
      notes: '',
      quantity: 1
    }));

    setActiveTab('list');
  };

  const handleOpenReject = (id: string) => {
    setTargetRejectId(id);
    setRejectionReason('Alat sedang dijadwalkan untuk praktikum reguler atau stok tidak mencukupi.');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (targetRejectId && rejectionReason) {
      onRejectBorrowing(targetRejectId, rejectionReason);
      setRejectModalOpen(false);
      setTargetRejectId(null);
    }
  };

  // Filter: If student, show ONLY their own borrowings! If admin, show all.
  const baseBorrowings = isAdmin 
    ? borrowings 
    : borrowings.filter(b => b.borrowerId === activeUser.nim_nip);

  const displayBorrowings = baseBorrowings.filter(b => {
    const matchesSearch = 
      b.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.borrowerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BorrowingStatus) => {
    switch (status) {
      case 'MENUNGGU_PERSETUJUAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            Menunggu Persetujuan
          </span>
        );
      case 'DISETUJUI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Disetujui (Silakan Ambil di Lab)
          </span>
        );
      case 'SEDANG_DIPINJAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <PackageCheck className="w-3 h-3 text-emerald-600" />
            Sedang Digunakan
          </span>
        );
      case 'DIKEMBALIKAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <FileCheck2 className="w-3 h-3 text-slate-500" />
            Sudah Dikembalikan
          </span>
        );
      case 'TERLAMBAT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Terlambat
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <X className="w-3 h-3 text-rose-500" />
            Ditolak
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'list'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>{isAdmin ? 'Daftar Peminjaman & Persetujuan' : 'Daftar Peminjaman Saya'}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            activeTab === 'list' ? 'bg-[#F28C28] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {displayBorrowings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'form'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4 text-[#F28C28]" />
          <span>Form Pengajuan Peminjaman Alat</span>
        </button>
      </div>

      {/* VIEW 1: FORM PENGAJUAN PINJAM ALAT */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2 text-[#0B3C5D] font-bold text-lg font-heading">
              <ClipboardList className="w-5 h-5 text-[#F28C28]" />
              Formulir Permohonan Peminjaman Peralatan Workshop
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data peminjam otomatis terhubung dengan akun login aktif Anda. Ketersediaan alat divalidasi langsung dari database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Borrower Identitas Info Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B3C5D]">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#F28C28]" />
                  Identitas Peminjam (Terkunci Sesuai Akun Login)
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Sesuai profil {isAdmin ? 'Admin' : 'Mahasiswa'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    disabled
                    value={formData.borrowerName}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIM / NIP</label>
                  <input
                    type="text"
                    disabled
                    value={formData.borrowerId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Program Studi</label>
                  <input
                    type="text"
                    disabled
                    value={formData.department}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Selection with Live Stock Check */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Peralatan yang Akan Dipinjam *
              </label>

              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0B3C5D]"
              >
                {equipment.map((item) => (
                  <option 
                    key={item.id} 
                    value={item.id}
                    disabled={item.availableQty <= 0}
                  >
                    [{item.code}] {item.name} — ({item.availableQty > 0 ? `Tersedia: ${item.availableQty} Unit` : 'STOK HABIS'}) - {item.location}
                  </option>
                ))}
              </select>

              {/* Live Availability Alert Badge */}
              {selectedEquipment && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  maxAvailable > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {maxAvailable > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <strong>Status Ketersediaan:</strong> {maxAvailable > 0 ? `${maxAvailable} dari ${selectedEquipment.totalQty} unit siap dipinjam` : 'Alat sedang tidak tersedia (habis dipinjam/maintenance)'}
                      <span className="text-slate-500 block text-[11px]">Lokasi Simpan: {selectedEquipment.location} | Kondisi: {selectedEquipment.condition}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm px-2.5 py-1 bg-white rounded-lg shadow-2xs border">
                    {maxAvailable} Siap
                  </span>
                </div>
              )}
            </div>

            {/* Quantity and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Alat yang Diminta *
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, maxAvailable)}
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#0B3C5D]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Maksimal: {maxAvailable} unit</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Mulai Pinjam *
                </label>
                <input
                  type="date"
                  required
                  value={formData.borrowDate}
                  onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Tanggal Pengembalian *
                </label>
                <input
                  type="date"
                  required
                  min={formData.borrowDate}
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>
            </div>

            {/* Purpose & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Peminjaman / Keperluan Praktikum *
              </label>
              <textarea
                required
                rows={2}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Contoh: Praktikum Proses Produksi, atau Proyek Akhir Rancang Bangun..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan / Aksesoris Pelengkap
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tambahkan catatan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={maxAvailable <= 0}
                className="px-6 py-2.5 bg-[#0B3C5D] hover:bg-[#07273d] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#F28C28]" />
                Kirim Pengajuan Peminjaman
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: LIST TRANSAKSI PEMINJAMAN */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode transaksi, nama peminjam, NIM, atau nama alat..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 font-medium py-1 focus:outline-hidden"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU_PERSETUJUAN">Menunggu Review</option>
                  <option value="DISETUJUI">Disetujui (Siap Ambil)</option>
                  <option value="SEDANG_DIPINJAM">Sedang Digunakan</option>
                  <option value="DIKEMBALIKAN">Dikembalikan</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>

              <button
                onClick={() => setActiveTab('form')}
                className="bg-[#F28C28] hover:bg-[#d97514] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <ClipboardList className="w-4 h-4" />
                Ajukan Pinjam Baru
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isAdmin ? 'Seluruh Transaksi Peminjaman Mahasiswa' : 'Catatan Peminjaman Pribadi Saya'} ({displayBorrowings.length} Data)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Sheet: Borrowing_Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Identitas Peminjam</th>
                    <th className="py-3 px-4">Peralatan Dipinjam</th>
                    <th className="py-3 px-4 text-center">Jadwal Pengembalian</th>
                    <th className="py-3 px-4">Status Transaksi</th>
                    <th className="py-3 px-4 text-right">Aksi Alur Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayBorrowings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium">Tidak ada rekaman peminjaman.</p>
                      </td>
                    </tr>
                  ) : (
                    displayBorrowings.map((b) => {
                      const isPending = b.status === 'MENUNGGU_PERSETUJUAN';
                      const isApproved = b.status === 'DISETUJUI';

                      return (
                        <tr key={b.id} className="hover:bg-blue-50/30 transition">
                          {/* Code & Created Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-[#0B3C5D] block text-xs">
                              {b.transactionCode}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {b.createdAt}
                            </span>
                          </td>

                          {/* Borrower */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 leading-tight">{b.borrowerName}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {b.borrowerId} &bull; {b.department}
                            </p>
                          </td>

                          {/* Equipment */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-[#0B3C5D] shrink-0 mt-0.5">
                                <Wrench className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 leading-snug">{b.equipmentName}</p>
                                <span className="text-[11px] font-mono font-bold text-[#0B3C5D]">
                                  {b.quantity} Unit
                                </span>
                                {b.notes && <span className="italic block text-[10px] text-slate-400">({b.notes})</span>}
                              </div>
                            </div>
                          </td>

                          {/* Expected Return Date */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {b.expectedReturnDate}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Mulai: {b.borrowDate}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(b.status)}
                            {b.rejectionReason && (
                              <p className="text-[10px] text-rose-600 mt-1 italic max-w-[150px] truncate">
                                Alasan: {b.rejectionReason}
                              </p>
                            )}
                          </td>

                          {/* Actions: Admin Workflows vs Student Status */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {isAdmin ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Step 1: Approve / Reject Pending Request */}
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => onApproveBorrowing(b.id)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                                      title="Setujui Peminjaman"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Setujui</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenReject(b.id)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                                      title="Tolak Peminjaman"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Tolak</span>
                                    </button>
                                  </>
                                )}

                                {/* Step 2: Handover Physical Equipment when Student arrives */}
                                {isApproved && onHandoverEquipment && (
                                  <button
                                    onClick={() => onHandoverEquipment(b.id)}
                                    className="px-2.5 py-1.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                                    title="Konfirmasi Penyerahan Fisik Alat ke Mahasiswa"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5 text-[#F28C28]" />
                                    <span>Serah Terima Alat</span>
                                  </button>
                                )}

                                {!isPending && !isApproved && (
                                  <span className="text-xs text-slate-400 font-mono">-</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-right text-xs">
                                {isApproved && (
                                  <span className="text-[#F28C28] font-bold block animate-pulse">
                                    Silakan ambil alat di Workshop!
                                  </span>
                                )}
                                {b.status === 'SEDANG_DIPINJAM' && (
                                  <span className="text-emerald-700 font-semibold block">
                                    Harap kembalikan s/d {b.expectedReturnDate}
                                  </span>
                                )}
                              </div>
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
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1 flex items-center gap-2">
              <X className="w-5 h-5 text-rose-600" />
              Tolak Permohonan Peminjaman Alat
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan alasan penolakan agar peminjam dapat mengetahui kendala di workshop:
            </p>

            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
              placeholder="Contoh: Alat sedang disiapkan untuk ujian kompetensi atau jadwal praktikum paralel..."
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingManagement;

