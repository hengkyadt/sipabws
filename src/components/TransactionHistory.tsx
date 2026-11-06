import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Wrench, 
  FlaskConical, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { TransactionHistoryItem, TransactionType, User } from '../types';

interface TransactionHistoryProps {
  history: TransactionHistoryItem[];
  currentUser?: User;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ history, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItem, setSelectedItem] = useState<TransactionHistoryItem | null>(null);

  const isStudent = currentUser && currentUser.role === 'student';
  const baseHistory = isStudent 
    ? history.filter(h => h.actorId === currentUser.nim_nip)
    : history;

  const filteredHistory = baseHistory.filter((item) => {
    const matchesSearch = 
      item.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status.toLowerCase().includes(statusFilter.toLowerCase());

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && item.timestamp >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && item.timestamp <= endDate + ' 23:59';
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'PEMINJAMAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-3 h-3 text-blue-600" />
            Peminjaman Alat
          </span>
        );
      case 'PENGEMBALIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            Pengembalian Alat
          </span>
        );
      case 'PEMAKAIAN_BAHAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FlaskConical className="w-3 h-3 text-amber-600" />
            Pemakaian Bahan
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'No. Referensi', 'Jenis Transaksi', 'Waktu Transaksi', 'Nama Pemohon', 'NIM/NIP', 'Jurusan', 'Tipe Item', 'Nama Alat/Bahan', 'Jumlah', 'Satuan', 'Status', 'Keterangan', 'Operator'];
    const rows = filteredHistory.map(h => [
      h.id,
      h.referenceCode,
      h.type,
      h.timestamp,
      `"${h.actorName}"`,
      h.actorId,
      `"${h.department}"`,
      h.itemType,
      `"${h.itemName}"`,
      h.quantity,
      h.unit,
      `"${h.status}"`,
      `"${h.details}"`,
      `"${h.operator}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Riwayat_Transaksi_SIPAB_PTKI_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search and Advanced Filters Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode referensi, nama mahasiswa, NIM, nama alat atau bahan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4 text-[#F28C28]" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Jenis Aktivitas</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="PEMINJAMAN">Peminjaman Alat</option>
              <option value="PENGEMBALIAN">Pengembalian Alat</option>
              <option value="PEMAKAIAN_BAHAN">Pemakaian Bahan</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Status Transaksi</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Selesai">Selesai Dikembalikan</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#F28C28]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Log Audit Aktivitas Terpadu ({filteredHistory.length} Baris Data)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Sheet: Transaction_History
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Waktu & Ref ID</th>
                <th className="py-3 px-4">Jenis Transaksi</th>
                <th className="py-3 px-4">Pemohon / Aktor</th>
                <th className="py-3 px-4">Item (Alat / Bahan)</th>
                <th className="py-3 px-4 text-center">Volume / Qty</th>
                <th className="py-3 px-4">Status & Hasil</th>
                <th className="py-3 px-4">Operator / Admin</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">Tidak ada riwayat transaksi yang memenuhi kriteria filter.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#0B3C5D] block text-xs">
                        {item.referenceCode}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.timestamp}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(item.type)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 leading-tight">{item.actorName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.actorId} • {item.department}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 leading-snug">{item.itemName}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{item.itemType}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {item.quantity} {item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-800 block">{item.status}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">{item.details}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {item.operator}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-slate-500 hover:text-[#0B3C5D] hover:bg-slate-100 rounded-lg transition"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#F28C28]">{selectedItem.referenceCode}</span>
                <h3 className="text-base font-bold text-[#0B3C5D]">Rincian Transaksi Workshop</h3>
              </div>
              {getTypeBadge(selectedItem.type)}
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Waktu Catat:</span>
                <span className="font-semibold">{selectedItem.timestamp}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Pemohon:</span>
                <span className="font-bold text-slate-900">{selectedItem.actorName} ({selectedItem.actorId})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Program Studi:</span>
                <span className="font-semibold">{selectedItem.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Nama Item:</span>
                <span className="font-bold text-[#0B3C5D]">{selectedItem.itemName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Volume:</span>
                <span className="font-mono font-bold">{selectedItem.quantity} {selectedItem.unit}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Status Operasi:</span>
                <span className="font-semibold text-emerald-700">{selectedItem.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Petugas / Operator:</span>
                <span className="font-semibold">{selectedItem.operator}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Keterangan Aktivitas:</span>
                <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 italic leading-relaxed">
                  {selectedItem.details}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

