import React, { useState } from 'react';
import { 
  Sheet, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Database, 
  FileCode2, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { AppSettings } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/gasScriptTemplate';
import { storageService } from '../services/storageService';

interface GoogleSheetsSettingsProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
}

export const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onSyncNow,
  isSyncing
}) => {
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.appsScriptUrl || '');
  const [googleSheetId, setGoogleSheetId] = useState(settings.googleSheetId || '');
  const [isCopied, setIsCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'schema'>('guide');

  const sheetsSchema = [
    {
      name: 'Users',
      color: 'bg-blue-600',
      description: 'Menyimpan akun pengguna, peran akses (admin/peminjam), NIM/NIP, dan prodi.',
      fields: ['id', 'name', 'email', 'role', 'nim_nip', 'department', 'phone', 'status']
    },
    {
      name: 'Equipment',
      color: 'bg-emerald-600',
      description: 'Inventaris mesin workshop, instrumen kimia, alat gelas lab, dan alat ukur.',
      fields: ['id', 'code', 'name', 'category', 'totalQty', 'availableQty', 'condition', 'location', 'description', 'lastMaintenance']
    },
    {
      name: 'Materials',
      color: 'bg-amber-600',
      description: 'Katalog bahan habis pakai (reagen kimia, kawat las, gas industri, pelarut).',
      fields: ['id', 'code', 'name', 'category', 'stock', 'unit', 'minStock', 'location', 'description']
    },
    {
      name: 'Borrowing_Transactions',
      color: 'bg-[#0B3C5D]',
      description: 'Rekaman peminjaman alat, batas tanggal kembali, dan status verifikasi.',
      fields: ['id', 'transactionCode', 'borrowerName', 'borrowerId', 'department', 'equipmentId', 'equipmentName', 'quantity', 'borrowDate', 'expectedReturnDate', 'status', 'approvedBy', 'createdAt']
    },
    {
      name: 'Return_Transactions',
      color: 'bg-teal-600',
      description: 'Pencatatan pengembalian fisik, kondisi alat (baik/rusak/hilang), dan denda.',
      fields: ['id', 'returnCode', 'transactionCode', 'borrowerName', 'equipmentName', 'quantity', 'actualReturnDate', 'conditionUponReturn', 'confirmedBy', 'createdAt']
    },
    {
      name: 'Material_Usage',
      color: 'bg-orange-600',
      description: 'Catatan konsumsi bahan habis pakai praktikum dan pengesahan admin.',
      fields: ['id', 'usageCode', 'userName', 'userId', 'department', 'materialName', 'category', 'quantityUsed', 'unit', 'usageDate', 'status', 'approvedBy']
    },
    {
      name: 'Transaction_History',
      color: 'bg-purple-600',
      description: 'Log audit permanen seluruh aktivitas workshop untuk transparansi.',
      fields: ['id', 'referenceCode', 'type', 'timestamp', 'actorName', 'actorId', 'itemName', 'quantity', 'status', 'details', 'operator']
    },
    {
      name: 'Settings',
      color: 'bg-slate-700',
      description: 'Konfigurasi institusi, nama kepala workshop, NIP, dan parameter sistem.',
      fields: ['workshopName', 'institutionName', 'labHeadName', 'labHeadNip', 'lastSyncTime']
    }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      appsScriptUrl: appsScriptUrl.trim(),
      googleSheetId: googleSheetId.trim(),
      isOnline: !!appsScriptUrl.trim()
    });
    setTestResult({
      success: true,
      message: 'Pengaturan koneksi Google Sheets tersimpan!'
    });
  };

  const handleTestConnection = async () => {
    if (!appsScriptUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await storageService.testGasConnection(appsScriptUrl.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#0B3C5D] to-[#07273d] text-white rounded-2xl p-6 shadow-xl border border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold">
              <Sheet className="w-4 h-4 text-emerald-400" />
              <span>Google Sheets Database Relasional (8 Sheets)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              Integrasi Google Sheets & Google Apps Script
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              SI-PAB Workshop PTKI Medan dirancang terhubung langsung ke spreadsheet Google Sheets milik Anda melalui Google Apps Script Web App dengan proteksi <strong>LockService</strong> untuk mencegah bentrokan stok.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'guide'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#F28C28]" />
          <span>Panduan Deployment & Koneksi</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'code'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-[#F28C28]" />
          <span>Kode Backend (Code.gs)</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-[#F28C28]" />
          <span>Struktur 8 Sheet Database</span>
        </button>
      </div>

      {/* TAB 1: PANDUAN & FORM KONFIGURASI URL */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Connection URL Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading mb-1 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#F28C28]" />
              Konfigurasi Web App URL Google Apps Script
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan Web App URL yang Anda dapatkan setelah melakukan Deployment pada Google Apps Script.
            </p>

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL *
                </label>
                <input
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format resmi berawalan <code className="text-slate-600 font-bold">https://script.google.com/macros/s/.../exec</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Sheet Spreadsheet ID (Opsional)
                </label>
                <input
                  type="text"
                  value={googleSheetId}
                  onChange={(e) => setGoogleSheetId(e.target.value)}
                  placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">{testResult.success ? 'Koneksi Berhasil' : 'Kendala Koneksi'}</p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi (Ping)'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 5-Step Visual Tutorial */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F28C28]" />
              5 Langkah Mudah Menghubungkan ke Google Sheets Pribadi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3C5D] text-white font-bold flex items-center justify-center text-xs">1</span>
                <p className="font-bold text-slate-900">Buat Spreadsheet Baru</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Buka Google Sheets di Google Drive Anda, beri nama <em>"SI-PAB Workshop PTKI Medan"</em>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3C5D] text-white font-bold flex items-center justify-center text-xs">2</span>
                <p className="font-bold text-slate-900">Buka Apps Script</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Klik menu <strong>Ekstensi &gt; Apps Script</strong> pada Google Sheets Anda.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3C5D] text-white font-bold flex items-center justify-center text-xs">3</span>
                <p className="font-bold text-slate-900">Paste Kode Code.gs</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Salin seluruh kode dari tab <strong>Kode Backend (Code.gs)</strong> di atas dan tempel di editor.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3C5D] text-white font-bold flex items-center justify-center text-xs">4</span>
                <p className="font-bold text-slate-900">Deploy sebagai Web App</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Pilih <strong>Deploy &gt; New Deployment &gt; Web App</strong>. Akses: <em>Anyone (Siapa saja)</em>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3C5D] text-white font-bold flex items-center justify-center text-xs">5</span>
                <p className="font-bold text-slate-900">Salin Web App URL</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Tempel URL ke form di atas, lalu tekan Simpan. Aplikasi Anda kini live terkoneksi!
                </p>
              </div>
            </div>
          </div>

          {/* Reset / Sample Data Actions */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-slate-800">Muat Ulang Data Sampel Standar PTKI Medan</p>
              <p className="text-[11px] text-slate-500">
                Mengembalikan inventaris spektrofotometer, mesin bubut, alat titrasi, kawat las, dan data awal workshop.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Kembalikan semua data ke setelan awal Workshop PTKI Medan?')) {
                  onResetData();
                }
              }}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition"
            >
              Reset ke Data Default PTKI
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CODE.GS VIEWER */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0B3C5D] font-heading flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#F28C28]" />
                Source Code Google Apps Script (Code.gs)
              </h3>
              <p className="text-xs text-slate-500">
                Skrip ini mengelola relasi 8 sheet, otorisasi, auto-create header, dan transaksi aman dengan LockService.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#F28C28]" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Seluruh Kode'}</span>
              </button>
              <button
                onClick={handleDownloadCode}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download .gs File</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-[500px] custom-scrollbar">
            <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: STRUCTURE OF THE 8 SHEETS */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading mb-1">
              Struktur Relasional 8 Sheet di Google Sheets
            </h3>
            <p className="text-xs text-slate-500">
              Setiap sheet dibuat secara otomatis oleh skrip Google Apps Script saat pertama kali diakses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sheetsSchema.map((sheet, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${sheet.color}`} />
                    <h4 className="font-bold text-slate-900 font-mono text-sm">{sheet.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Sheet #{idx + 1}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{sheet.description}</p>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Kolom Header:</span>
                  <div className="flex flex-wrap gap-1">
                    {sheet.fields.map((field) => (
                      <span key={field} className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsSettings;

