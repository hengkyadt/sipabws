import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Check, 
  X, 
  AlertTriangle, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Edit3, 
  Trash2,
  PackageCheck,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { 
  Material, 
  MaterialUsage, 
  User as UserType, 
  UserRole 
} from '../types';

interface MaterialUsageManagementProps {
  materials: Material[];
  materialUsages: MaterialUsage[];
  activeUser: UserType;
  userRole: UserRole;
  onAddMaterial: (item: Omit<Material, 'id'>) => void;
  onUpdateMaterial: (item: Material) => void;
  onDeleteMaterial: (id: string) => void;
  onSubmitUsage: (data: Omit<MaterialUsage, 'id' | 'usageCode' | 'createdAt' | 'status'>) => void;
  onApproveUsage: (id: string) => void;
  onIssueMaterial: (id: string) => void;
  onRejectUsage: (id: string, reason: string) => void;
}

export const MaterialUsageManagement: React.FC<MaterialUsageManagementProps> = ({
  materials,
  materialUsages,
  activeUser,
  userRole,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onSubmitUsage,
  onApproveUsage,
  onIssueMaterial,
  onRejectUsage
}) => {
  const isAdmin = activeUser.role === 'admin';
  const [activeTab, setActiveTab] = useState<'inventory' | 'usages' | 'form'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State for Usage Request
  const today = new Date().toISOString().split('T')[0];
  const [usageForm, setUsageForm] = useState({
    userName: activeUser.name,
    userId: activeUser.nim_nip,
    department: activeUser.department,
    classSemester: activeUser.classSemester || '',
    materialId: materials[0]?.id || '',
    quantityUsed: 1,
    usageDate: today,
    purpose: '',
    notes: ''
  });

  // Modal for Adding/Editing Material
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialFormData, setMaterialFormData] = useState({
    code: '',
    name: '',
    category: 'Reagen Kimia',
    stock: 10,
    unit: 'Liter',
    minStock: 2,
    location: '',
    description: '',
    specification: ''
  });

  const selectedMaterial = materials.find(m => m.id === usageForm.materialId);

  const categories = [
    'ALL',
    'Bahan Pengelasan & Logam',
    'Pelumas & Solven',
    'Bahan Lainnya',
  ];

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filter: If student, show ONLY their own usage requests!
  const baseUsages = isAdmin 
    ? materialUsages 
    : materialUsages.filter(u => u.userId === activeUser.nim_nip);

  const filteredUsages = baseUsages.filter(u => 
    u.usageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    if (usageForm.quantityUsed <= 0) {
      alert('Jumlah pemakaian harus lebih besar dari 0.');
      return;
    }

    if (usageForm.quantityUsed > selectedMaterial.stock) {
      alert(`Jumlah yang diminta (${usageForm.quantityUsed} ${selectedMaterial.unit}) melebihi stok yang tersedia (${selectedMaterial.stock} ${selectedMaterial.unit}).`);
      return;
    }

    onSubmitUsage({
      userName: activeUser.name,
      userId: activeUser.nim_nip,
      department: activeUser.department,
      classSemester: activeUser.classSemester || '',
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      materialCode: selectedMaterial.code,
      category: selectedMaterial.category,
      quantityUsed: usageForm.quantityUsed,
      unit: selectedMaterial.unit,
      usageDate: usageForm.usageDate,
      purpose: usageForm.purpose,
      notes: usageForm.notes
    });

    setUsageForm(prev => ({
      ...prev,
      quantityUsed: 1,
      purpose: '',
      notes: ''
    }));

    setActiveTab('usages');
  };

  const handleOpenAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialFormData({
      code: `MB-WS-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Bahan Pengelasan & Logam',
      stock: 3,
      unit: '',
      minStock: 2,
      location: 'Gudang Bahan Workshop PTKI',
      description: '',
      specification: ''
    });
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMaterialFormData({
      code: m.code,
      name: m.name,
      category: m.category,
      stock: m.stock,
      unit: m.unit,
      minStock: m.minStock,
      location: m.location,
      description: m.description,
      specification: m.specification || ''
    });
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        ...materialFormData
      });
    } else {
      onAddMaterial(materialFormData);
    }
    setIsMaterialModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-[#F28C28]" />
          <span>Katalog Stok Bahan Habis Pakai</span>
          <span className="text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
            {materials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('usages')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'usages'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-[#F28C28]" />
          <span>{isAdmin ? 'Semua Permohonan & Pengeluaran Bahan' : 'Permohonan Bahan Saya'}</span>
          <span className="text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
            {filteredUsages.length}
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
          <Send className="w-4 h-4" />
          <span>Form Permohonan Bahan</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY STOK BAHAN */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama bahan, kode bahan, lokasi bahan..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'ALL' ? 'Semua Kategori' : c}</option>
                ))}
              </select>

              {isAdmin && (
                <button
                  onClick={handleOpenAddMaterial}
                  className="bg-[#0B3C5D] hover:bg-[#07273d] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#F28C28]" />
                  Tambah Bahan Baru
                </button>
              )}
            </div>
          </div>

          {/* Material Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const isLowStock = mat.stock <= mat.minStock;

              return (
                <div
                  key={mat.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                    isLowStock ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-[#F28C28]">
                        {mat.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {mat.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {mat.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{mat.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Sisa Stok:</span>
                      <div className="text-right">
                        <span className={`text-base font-extrabold font-mono ${isLowStock ? 'text-amber-700' : 'text-[#0B3C5D]'}`}>
                          {mat.stock} {mat.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Min: {mat.minStock} {mat.unit}</span>
                      </div>
                    </div>

                    {isLowStock && (
                      <div className="mb-3 px-2.5 py-1 bg-amber-100/70 border border-amber-300/60 rounded-lg text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Peringatan: Stok menipis!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setUsageForm(prev => ({ ...prev, materialId: mat.id }));
                          setActiveTab('form');
                        }}
                        className="flex-1 bg-[#F28C28] hover:bg-[#d97514] text-white py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition"
                      >
                        Ajukan Pemakaian
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditMaterial(mat)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Bahan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus ${mat.name}?`)) onDeleteMaterial(mat.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                            title="Hapus Bahan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR PERMOHONAN PEMAKAIAN BAHAN */}
      {activeTab === 'usages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isAdmin ? 'Log Permohonan & Pengeluaran Bahan Workshop' : 'Catatan Permohonan Bahan Saya'} ({filteredUsages.length} Transaksi)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Sheet: Material_Usage
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">No. Permohonan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Bahan Workshop</th>
                  <th className="py-3 px-4">Volume Diminta</th>
                  <th className="py-3 px-4">Keperluan Praktikum</th>
                  <th className="py-3 px-4">Status Transaksi</th>
                  <th className="py-3 px-4 text-right">Aksi Alur Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FlaskConical className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium">Belum ada rekaman pemakaian bahan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsages.map((usage) => {
                    const isPending = usage.status === 'MENUNGGU_PERSETUJUAN';
                    const isApprovedWaitingIssuance = usage.status === 'DISETUJUI';

                    return (
                      <tr key={usage.id} className="hover:bg-blue-50/30 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#0B3C5D] block text-xs">
                            {usage.usageCode}
                          </span>
                          <span className="text-[10px] text-slate-400">{usage.usageDate}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 leading-tight">{usage.userName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{usage.userId} &bull; {usage.department}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{usage.materialName}</p>
                          <span className="text-[10px] text-slate-500">{usage.category}</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {usage.quantityUsed} {usage.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-xs text-slate-700 max-w-xs line-clamp-2">{usage.purpose}</p>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {usage.status === 'MENUNGGU_PERSETUJUAN' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                              Menunggu Review
                            </span>
                          )}
                          {usage.status === 'DISETUJUI' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Disetujui (Menunggu Pengeluaran)
                            </span>
                          )}
                          {usage.status === 'DIKELUARKAN' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <PackageCheck className="w-3 h-3 text-emerald-600" />
                              Bahan Telah Dikeluarkan (Stok Terpotong)
                            </span>
                          )}
                          {usage.status === 'DITOLAK' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              Ditolak
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isAdmin ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Step 1: Admin Approves the request (Stock NOT yet deducted) */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => onApproveUsage(usage.id)}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                                    title="Setujui Permohonan Bahan"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Masukkan alasan penolakan bahan:');
                                      if (reason) onRejectUsage(usage.id, reason);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}

                              {/* Step 2: Admin confirms actual physical handover -> STOCK DEDUCTED */}
                              {isApprovedWaitingIssuance && (
                                <button
                                  onClick={() => onIssueMaterial(usage.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                                  title="Konfirmasi Penyerahan Fisik & Potong Stok Bahan"
                                >
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  <span>Keluarkan Bahan Fisik</span>
                                </button>
                              )}

                              {usage.status === 'DIKELUARKAN' && (
                                <span className="text-[11px] text-slate-400 font-mono">Selesai</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-right text-xs">
                              {isApprovedWaitingIssuance && (
                                <span className="text-[#F28C28] font-bold">
                                  Silakan ambil bahan di workshop!
                                </span>
                              )}
                              {usage.status === 'DIKELUARKAN' && (
                                <span className="text-emerald-700 font-semibold">
                                  Bahan telah diterima
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
      )}

      {/* TAB 3: FORM PENGAJUAN BAHAN */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-lg font-bold text-[#0B3C5D] font-heading flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#F28C28]" />
              Formulir Permohonan Pemakaian Bahan Habis Pakai
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              <strong>Catatan penting:</strong> Stok bahan <em>tidak akan berkurang</em> saat pengajuan dikirim. Stok hanya akan berkurang saat Administrator mengonfirmasi pengeluaran fisik bahan kepada Anda.
            </p>
          </div>

          <form onSubmit={handleSubmitUsage} className="space-y-4">
            {/* User Identification locked */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  disabled
                  value={activeUser.name}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIM / NIP</label>
                <input
                  type="text"
                  disabled
                  value={activeUser.nim_nip}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Program Studi</label>
                <input
                  type="text"
                  disabled
                  value={activeUser.department}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Material Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Bahan Workshop *
              </label>
              <select
                value={usageForm.materialId}
                onChange={(e) => setUsageForm({ ...usageForm, materialId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0B3C5D]"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                    [{m.code}] {m.name} — (Sisa di Gudang: {m.stock} {m.unit})
                  </option>
                ))}
              </select>

              {selectedMaterial && (
                <div className="mt-2 text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                  <span>Lokasi Rak: <strong>{selectedMaterial.location}</strong></span>
                  <span className="font-mono font-bold text-emerald-800">Tersedia: {selectedMaterial.stock} {selectedMaterial.unit}</span>
                </div>
              )}
            </div>

            {/* Quantity & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah yang Dibutuhkan ({selectedMaterial?.unit || 'Unit'}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedMaterial ? selectedMaterial.stock : 9999}
                  required
                  value={usageForm.quantityUsed}
                  onChange={(e) => setUsageForm({ ...usageForm, quantityUsed: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pengambilan / Praktikum *
                </label>
                <input
                  type="date"
                  required
                  value={usageForm.usageDate}
                  onChange={(e) => setUsageForm({ ...usageForm, usageDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Pemakaian / Keperluan Praktikum *
              </label>
              <textarea
                required
                rows={2}
                value={usageForm.purpose}
                onChange={(e) => setUsageForm({ ...usageForm, purpose: e.target.value })}
                placeholder="Contoh: Untuk praktikum proses produksi..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan
              </label>
              <input
                type="text"
                value={usageForm.notes}
                onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })}
                placeholder="Contoh: Tambah catatan bila perlu..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Kirim Permohonan Bahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT MATERIAL (Admin) */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading mb-3">
              {editingMaterial ? 'Edit Data Bahan Workshop' : 'Tambah Bahan Habis Pakai Baru'}
            </h3>

            <form onSubmit={handleSaveMaterial} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Bahan *</label>
                  <input
                    type="text"
                    required
                    value={materialFormData.code}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={materialFormData.category}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >

                    <option value="Bahan Pengelasan & Logam">Bahan Pengelasan & Logam</option>
                    <option value="Pelumas & Solven">Pelumas & Solven</option>
                    <option value="Bahan Lainnya">Bahan Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan *</label>
                <input
                  type="text"
                  required
                  value={materialFormData.name}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={materialFormData.stock}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    placeholder="batang, cm, mm, dll"
                    value={materialFormData.unit}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Min *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={materialFormData.minStock}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, minStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Penyimpanan *</label>
                <input
                  type="text"
                  required
                  value={materialFormData.location}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialUsageManagement;

