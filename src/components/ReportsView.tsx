import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Wrench, 
  FlaskConical, 
  AlertTriangle, 
  RotateCcw,
  Building2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { 
  BorrowingTransaction, 
  ReturnTransaction, 
  MaterialUsage, 
  Equipment, 
  Material,
  AppSettings 
} from '../types';

interface ReportsViewProps {
  borrowings: BorrowingTransaction[];
  returns: ReturnTransaction[];
  materialUsages: MaterialUsage[];
  equipment: Equipment[];
  materials: Material[];
  settings: AppSettings;
}

type ReportType = 
  | 'monthly_borrowing'
  | 'equipment_usage'
  | 'material_consumption'
  | 'damaged_equipment'
  | 'overdue_returns';

export const ReportsView: React.FC<ReportsViewProps> = ({
  borrowings,
  returns,
  materialUsages,
  equipment,
  materials,
  settings
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('monthly_borrowing');
  const [selectedMonth, setSelectedMonth] = useState('2025-02');

  const reportTabs = [
    { id: 'monthly_borrowing' as ReportType, label: 'Peminjaman Bulanan', icon: Calendar },
    { id: 'equipment_usage' as ReportType, label: 'Pemakaian Alat', icon: Wrench },
    { id: 'material_consumption' as ReportType, label: 'Konsumsi Bahan', icon: FlaskConical },
    { id: 'damaged_equipment' as ReportType, label: 'Alat Rusak / Masalah', icon: AlertTriangle },
    { id: 'overdue_returns' as ReportType, label: 'Keterlambatan Pengembalian', icon: RotateCcw }
  ];

  // Filtered dataset according to selected report
  const getReportData = () => {
    switch (selectedReport) {
      case 'monthly_borrowing':
        return borrowings.filter(b => b.borrowDate.startsWith(selectedMonth));
      case 'equipment_usage':
        return equipment.map(eq => {
          const usedCount = borrowings.filter(b => b.equipmentId === eq.id || b.equipmentName === eq.name).length;
          return {
            ...eq,
            usedCount
          };
        });
      case 'material_consumption':
        return materialUsages.filter(m => m.usageDate.startsWith(selectedMonth));
      case 'damaged_equipment':
        return {
          inventoryDamaged: equipment.filter(e => e.condition !== 'Baik'),
          returnedDamaged: returns.filter(r => r.conditionUponReturn !== 'Baik')
        };
      case 'overdue_returns':
        const today = new Date().toISOString().split('T')[0];
        return borrowings.filter(b => (b.status === 'TERLAMBAT' || (b.status === 'DISETUJUI' && b.expectedReturnDate < today)));
      default:
        return [];
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let filename = `Laporan_${selectedReport}_${selectedMonth}.csv`;
    let csvData = '';

    if (selectedReport === 'monthly_borrowing') {
      const data = borrowings.filter(b => b.borrowDate.startsWith(selectedMonth));
      const headers = ['Kode Transaksi', 'Peminjam', 'NIM/NIP', 'Jurusan', 'Peralatan', 'Jumlah', 'Tgl Pinjam', 'Tgl Kembali', 'Status'];
      const rows = data.map(b => [
        b.transactionCode,
        `"${b.borrowerName}"`,
        b.borrowerId,
        `"${b.department}"`,
        `"${b.equipmentName}"`,
        b.quantity,
        b.borrowDate,
        b.expectedReturnDate,
        b.status
      ]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (selectedReport === 'material_consumption') {
      const data = materialUsages.filter(m => m.usageDate.startsWith(selectedMonth));
      const headers = ['No Permohonan', 'Pengguna', 'NIM/NIP', 'Jurusan', 'Nama Bahan', 'Kategori', 'Volume Terpakai', 'Satuan', 'Tgl Pakai', 'Status'];
      const rows = data.map(m => [
        m.usageCode,
        `"${m.userName}"`,
        m.userId,
        `"${m.department}"`,
        `"${m.materialName}"`,
        `"${m.category}"`,
        m.quantityUsed,
        m.unit,
        m.usageDate,
        m.status
      ]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      // General equipment list
      const headers = ['Kode', 'Nama Alat', 'Kategori', 'Kondisi', 'Total Unit', 'Tersedia', 'Lokasi'];
      const rows = equipment.map(e => [
        e.code,
        `"${e.name}"`,
        `"${e.category}"`,
        e.condition,
        e.totalQty,
        e.availableQty,
        `"${e.location}"`
      ]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="no-print bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F28C28]" />
              Pusat Laporan & Ekspor Berita Acara Workshop
            </h3>
            <p className="text-xs text-slate-500">
              Cetak dokumen resmi berkop surat PTKI Medan atau unduh tabel spreadsheet (CSV/Excel).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#F28C28]" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* Tab & Month Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedReport === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F28C28]' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Periode Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-semibold text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Official Printable Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 print:p-0 print:border-none print:shadow-none max-w-4xl mx-auto">
        {/* Kop Surat Resmi PTKI Medan */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-[#0B3C5D] text-[#F28C28] flex items-center justify-center font-extrabold text-xl font-heading shrink-0 shadow-md">
            PTKI
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              KEMENTERIAN PERINDUSTRIAN REPUBLIK INDONESIA
            </p>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0B3C5D] font-heading uppercase tracking-wide">
              POLITEKNIK TEKNOLOGI KIMIA INDUSTRI (PTKI) MEDAN
            </h1>
            <p className="text-xs font-semibold text-slate-800">
              UNIT PELAKSANA TEKNIS WORKSHOP DAN LABORATORIUM TERPADU
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jl. Medan Tenggara No. VII, Medan 20228, Sumatera Utara | Website: ptki.ac.id
            </p>
          </div>
        </div>

        {/* Title of the Report */}
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase underline decoration-2 underline-offset-4">
            {selectedReport === 'monthly_borrowing' && 'LAPORAN REKAPITULASI PEMINJAMAN ALAT WORKSHOP'}
            {selectedReport === 'equipment_usage' && 'LAPORAN UTILISASI DAN INTENSITAS PEMAKAIAN ALAT'}
            {selectedReport === 'material_consumption' && 'LAPORAN KONSUMSI BAHAN HABIS PAKAI & REAGEN'}
            {selectedReport === 'damaged_equipment' && 'LAPORAN KONDISI FISIK DAN KERUSAKAN PERALATAN'}
            {selectedReport === 'overdue_returns' && 'LAPORAN MONITORING KETERLAMBATAN PENGEMBALIAN ALAT'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Periode Laporan: <strong>{selectedMonth}</strong> | Status Data: <strong>Terverifikasi Google Sheets</strong>
          </p>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto my-6">
          {selectedReport === 'monthly_borrowing' && (
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border border-slate-300">Kode & Tgl Pinjam</th>
                  <th className="p-2 border border-slate-300">Nama Peminjam / NIM</th>
                  <th className="p-2 border border-slate-300">Program Studi</th>
                  <th className="p-2 border border-slate-300">Peralatan Dipinjam</th>
                  <th className="p-2 border border-slate-300 text-center">Jumlah</th>
                  <th className="p-2 border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.filter(b => b.borrowDate.startsWith(selectedMonth)).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400">
                      Tidak ada rekaman transaksi peminjaman pada periode {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  borrowings.filter(b => b.borrowDate.startsWith(selectedMonth)).map((b, idx) => (
                    <tr key={b.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">
                        {b.transactionCode}<br />
                        <span className="text-slate-500 text-[10px]">{b.borrowDate}</span>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <strong>{b.borrowerName}</strong><br />
                        <span className="font-mono text-slate-500 text-[10px]">{b.borrowerId}</span>
                      </td>
                      <td className="p-2 border border-slate-300">{b.department}</td>
                      <td className="p-2 border border-slate-300">{b.equipmentName}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{b.quantity} Unit</td>
                      <td className="p-2 border border-slate-300 font-semibold">{b.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {selectedReport === 'material_consumption' && (
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border border-slate-300">No Permohonan & Tgl</th>
                  <th className="p-2 border border-slate-300">Pemohon (NIM)</th>
                  <th className="p-2 border border-slate-300">Bahan Kimia / Material</th>
                  <th className="p-2 border border-slate-300">Kategori</th>
                  <th className="p-2 border border-slate-300 text-center">Volume Pemakaian</th>
                  <th className="p-2 border border-slate-300">Keperluan</th>
                </tr>
              </thead>
              <tbody>
                {materialUsages.filter(m => m.usageDate.startsWith(selectedMonth)).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400">
                      Tidak ada pemakaian bahan tercatat pada periode {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  materialUsages.filter(m => m.usageDate.startsWith(selectedMonth)).map((m, idx) => (
                    <tr key={m.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">
                        {m.usageCode}<br />
                        <span className="text-slate-500 text-[10px]">{m.usageDate}</span>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <strong>{m.userName}</strong> ({m.userId})<br />
                        <span className="text-[10px] text-slate-500">{m.department}</span>
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold">{m.materialName}</td>
                      <td className="p-2 border border-slate-300">{m.category}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                        {m.quantityUsed} {m.unit}
                      </td>
                      <td className="p-2 border border-slate-300 italic">{m.purpose}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {selectedReport === 'equipment_usage' && (
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border border-slate-300">Kode Alat</th>
                  <th className="p-2 border border-slate-300">Nama Peralatan / Mesin</th>
                  <th className="p-2 border border-slate-300">Kategori</th>
                  <th className="p-2 border border-slate-300 text-center">Total Unit</th>
                  <th className="p-2 border border-slate-300 text-center">Kondisi</th>
                  <th className="p-2 border border-slate-300">Lokasi Penempatan</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq, idx) => (
                  <tr key={eq.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-semibold">{eq.code}</td>
                    <td className="p-2 border border-slate-300 font-bold">{eq.name}</td>
                    <td className="p-2 border border-slate-300">{eq.category}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{eq.totalQty} Unit ({eq.availableQty} Siap)</td>
                    <td className="p-2 border border-slate-300 text-center font-semibold">{eq.condition}</td>
                    <td className="p-2 border border-slate-300">{eq.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'damaged_equipment' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-700">1. Inventaris Perlu Perbaikan</h4>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-300">Kode & Nama Alat</th>
                    <th className="p-2 border border-slate-300">Kategori</th>
                    <th className="p-2 border border-slate-300">Kondisi</th>
                    <th className="p-2 border border-slate-300">Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.filter(e => e.condition !== 'Baik').map(e => (
                    <tr key={e.id}>
                      <td className="p-2 border border-slate-300 font-semibold">{e.code} - {e.name}</td>
                      <td className="p-2 border border-slate-300">{e.category}</td>
                      <td className="p-2 border border-slate-300 text-rose-700 font-bold">{e.condition}</td>
                      <td className="p-2 border border-slate-300">{e.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="font-bold text-xs uppercase text-slate-700 pt-3">2. Pengembalian dengan Catatan Kerusakan / Hilang</h4>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-300">Peminjam</th>
                    <th className="p-2 border border-slate-300">Peralatan</th>
                    <th className="p-2 border border-slate-300">Kondisi Kembali</th>
                    <th className="p-2 border border-slate-300">Denda / Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.filter(r => r.conditionUponReturn !== 'Baik').length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400">Tidak ada pengembalian alat rusak dalam arsip.</td>
                    </tr>
                  ) : (
                    returns.filter(r => r.conditionUponReturn !== 'Baik').map(r => (
                      <tr key={r.id}>
                        <td className="p-2 border border-slate-300">{r.borrowerName} ({r.borrowerId})</td>
                        <td className="p-2 border border-slate-300">{r.equipmentName}</td>
                        <td className="p-2 border border-slate-300 font-bold text-rose-700">{r.conditionUponReturn}</td>
                        <td className="p-2 border border-slate-300 italic">{r.notes} (Denda: Rp {r.penalty || 0})</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'overdue_returns' && (
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">No. Transaksi</th>
                  <th className="p-2 border border-slate-300">Nama Peminjam</th>
                  <th className="p-2 border border-slate-300">Program Studi</th>
                  <th className="p-2 border border-slate-300">Peralatan</th>
                  <th className="p-2 border border-slate-300">Batas Pengembalian</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.filter(b => b.status === 'TERLAMBAT' || b.expectedReturnDate < new Date().toISOString().split('T')[0]).map(b => (
                  <tr key={b.id}>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-rose-700">{b.transactionCode}</td>
                    <td className="p-2 border border-slate-300 font-bold">{b.borrowerName} ({b.borrowerId})</td>
                    <td className="p-2 border border-slate-300">{b.department}</td>
                    <td className="p-2 border border-slate-300">{b.equipmentName} ({b.quantity} Unit)</td>
                    <td className="p-2 border border-slate-300 font-mono text-rose-700 font-bold">{b.expectedReturnDate}</td>
                    <td className="p-2 border border-slate-300 text-center text-rose-700 font-bold">Terlambat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tanda Tangan Resmi Pengesahan Dokumen PTKI Medan */}
        <div className="mt-12 pt-4 grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p className="text-slate-600">Mengetahui / Memeriksa,</p>
            <p className="font-semibold text-slate-800">Teknisi Penanggung Jawab Workshop</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">M. Farhan Lubis, S.T.</p>
            <p className="text-slate-500 font-mono">NIP. 198804202015031002</p>
          </div>

          <div>
            <p className="text-slate-600">Medan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-slate-800">Kepala Workshop & Laboratorium Terpadu</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">{settings.labHeadName}</p>
            <p className="text-slate-500 font-mono">NIP. {settings.labHeadNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

