import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Wrench, 
  Edit3, 
  Trash2, 
  MapPin, 
  Tag, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  ArrowRight,
  ArrowUpDown
} from 'lucide-react';
import { Equipment, EquipmentCondition, UserRole } from '../types';

interface EquipmentInventoryProps {
  equipment: Equipment[];
  userRole: UserRole;
  onAddEquipment: (item: Omit<Equipment, 'id'>) => void;
  onUpdateEquipment: (item: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
  onDirectBorrow?: (equipment: Equipment) => void;
}

export const EquipmentInventory: React.FC<EquipmentInventoryProps> = ({
  equipment,
  userRole,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onDirectBorrow
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code_asc' | 'code_desc' | 'name_asc' | 'qty_desc'>('code_asc');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Equipment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Mesin Workshop',
    totalQty: 1,
    availableQty: 1,
    condition: 'Baik' as EquipmentCondition,
    location: '',
    description: '',
    specification: ''
  });

  const categories = [
    'ALL',
    'Mesin Workshop',
    'Perkakas Tangan',
    'Alat Ukur & Kalibrasi',
    'APD & Safety K3'
  ];

  const conditions = ['ALL', 'Baik', 'Rusak Ringan', 'Dalam Perawatan', 'Rusak Berat'];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'ALL' || item.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  // Sort equipment: default 'code_asc' ensures 001 is ALWAYS at the top!
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (sortBy === 'code_asc') {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy === 'code_desc') {
      return b.code.localeCompare(a.code, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }
    if (sortBy === 'qty_desc') {
      return b.availableQty - a.availableQty;
    }
    return 0;
  });

  const handleOpenAdd = () => {
    // Generate next sequential code so it follows natural numbering (e.g., 001, 002, 003 -> next: 004)
    let nextNum = 1;
    const existingNums = equipment
      .map(e => {
        const matches = e.code.match(/\d+/g);
        return matches ? parseInt(matches[matches.length - 1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);

    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    }
    const padded = String(nextNum).padStart(3, '0');

    setFormData({
      code: `EQ-WS-${padded}`,
      name: '',
      category: 'Mesin Workshop',
      totalQty: 1,
      availableQty: 1,
      condition: 'Baik',
      location: 'Workshop Terpadu PTKI',
      description: '',
      specification: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      totalQty: item.totalQty,
      availableQty: item.availableQty,
      condition: item.condition,
      location: item.location,
      description: item.description,
      specification: item.specification || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      onUpdateEquipment({
        ...editingEquipment,
        ...formData,
        availableQty: Math.min(formData.availableQty, formData.totalQty)
      });
      setEditingEquipment(null);
    } else {
      onAddEquipment({
        ...formData,
        availableQty: formData.totalQty
      });
      setIsAddModalOpen(false);
    }
  };

  const getConditionBadge = (condition: EquipmentCondition) => {
    switch (condition) {
      case 'Baik':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Baik
          </span>
        );
      case 'Rusak Ringan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Rusak Ringan
          </span>
        );
      case 'Dalam Perawatan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            Perawatan
          </span>
        );
      case 'Rusak Berat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Rusak Berat
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, Add Button */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode alat, nama mesin, instrumen, atau lokasi penyimpanan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B3C5D]/20 focus:border-[#0B3C5D] transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#0B3C5D]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#0B3C5D]"
          >
            {conditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond === 'ALL' ? 'Semua Kondisi' : cond}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#0B3C5D] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent py-1.5 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
              title="Urutan Kode & Tampilan Inventaris"
            >
              <option value="code_asc">Kode Alat (001 &rarr; 999)</option>
              <option value="code_desc">Kode Alat (999 &rarr; 001)</option>
              <option value="name_asc">Nama Alat (A &rarr; Z)</option>
              <option value="qty_desc">Stok Tersedia Terbanyak</option>
            </select>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#0B3C5D] hover:bg-[#07273d] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#F28C28]" />
              Tambah Alat Baru
            </button>
          )}
        </div>
      </div>

      {/* Equipment Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Daftar Inventaris ({sortedEquipment.length} Alat Terdaftar)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100/70 text-[#0B3C5D] text-[10px] font-bold">
              Urutan: {sortBy === 'code_asc' ? '001 → 999' : sortBy === 'code_desc' ? '999 → 001' : sortBy === 'name_asc' ? 'A-Z' : 'Stok'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Terhubung otomatis ke Sheet <strong className="text-slate-700 font-mono">Equipment</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button
                    onClick={() => setSortBy(sortBy === 'code_asc' ? 'code_desc' : 'code_asc')}
                    className="flex items-center gap-1 text-slate-700 font-bold hover:text-[#0B3C5D] transition"
                    title="Klik untuk mengubah urutan kode"
                  >
                    <span>Kode & Nama Alat</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#F28C28]" />
                  </button>
                </th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Lokasi Simpan</th>
                <th className="py-3 px-4 text-center">Ketersediaan Stok</th>
                <th className="py-3 px-4">Kondisi Fisik</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">Tidak ada alat yang cocok dengan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                sortedEquipment.map((item) => {
                  const percentAvailable = Math.round((item.availableQty / (item.totalQty || 1)) * 100);
                  const isAvailable = item.availableQty > 0;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition">
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-100 text-[#0B3C5D] shrink-0 mt-0.5">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-[11px] font-bold text-[#F28C28]">
                              {item.code}
                            </span>
                            <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {item.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{item.location}</span>
                        </div>
                      </td>

                      {/* Availability & Stock Progress */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-baseline gap-1 font-mono">
                            <span className={`text-base font-bold ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {item.availableQty}
                            </span>
                            <span className="text-slate-400 text-xs">/ {item.totalQty} Unit</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${percentAvailable}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {isAvailable ? `${percentAvailable}% Siap Pinjam` : 'Habis Dipinjam'}
                          </span>
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getConditionBadge(item.condition)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pinjam Button (Especially for user / borrower) */}
                          {onDirectBorrow && isAvailable && (
                            <button
                              onClick={() => onDirectBorrow(item)}
                              className="px-2.5 py-1.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                              title="Pinjam Alat Ini Sekarang"
                            >
                              <span>Pinjam</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {userRole === 'admin' ? (
                            <>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Alat"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus ${item.name} dari inventaris?`)) {
                                    onDeleteEquipment(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Alat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedDetail(item)}
                              className="px-2 py-1 text-slate-600 hover:text-[#0B3C5D] text-xs font-medium border border-slate-200 rounded-lg"
                            >
                              Detail
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingEquipment) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0B3C5D] font-heading mb-1">
              {editingEquipment ? 'Edit Data Inventaris Alat' : 'Tambah Alat Baru ke Workshop'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Data akan otomatis disinkronisasikan ke Google Sheets sheet <strong>Equipment</strong>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode / ID Inventaris Alat *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                    placeholder="Contoh: EQ-TK-005"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Alat *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  >
                    <option value="Mesin Workshop">Mesin Workshop</option>
                    <option value="Perkakas Tangan">Perkakas Tangan</option>
                    <option value="Alat Ukur & Kalibrasi">Alat Ukur & Kalibrasi</option>
                    <option value="APD & Safety K3">APD & Safety K3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Peralatan / Mesin *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  placeholder="Contoh: Mesin Bubut TUDA PROS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Unit *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQty}
                    onChange={(e) => setFormData({ ...formData, totalQty: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Tersedia *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalQty}
                    required
                    value={formData.availableQty}
                    onChange={(e) => setFormData({ ...formData, availableQty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kondisi Alat *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as EquipmentCondition })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Dalam Perawatan">Dalam Perawatan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Penyimpanan di Workshop *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  placeholder="Contoh: Lab Kimia Dasar Lemari B-03"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Fungsi Alat
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  placeholder="Keterangan peruntukan, praktikum terkait, atau catatan khusus..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spesifikasi Teknis
                </label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                  placeholder="Contoh: 220V 50Hz, Akurasi 0.01 mm, rentang 190-1100 nm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEquipment(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
                >
                  {editingEquipment ? 'Simpan Perubahan' : 'Tambah ke Inventaris'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#F28C28]">{selectedDetail.code}</span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedDetail.name}</h3>
              </div>
              {getConditionBadge(selectedDetail.condition)}
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 my-4">
              <p><strong>Kategori:</strong> {selectedDetail.category}</p>
              <p><strong>Lokasi Simpan:</strong> {selectedDetail.location}</p>
              <p><strong>Total Unit:</strong> {selectedDetail.totalQty} Unit ({selectedDetail.availableQty} Tersedia)</p>
              <p><strong>Spesifikasi:</strong> {selectedDetail.specification || '-'}</p>
              <p><strong>Deskripsi:</strong> {selectedDetail.description}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
              {selectedDetail.availableQty > 0 && onDirectBorrow && (
                <button
                  onClick={() => {
                    const item = selectedDetail;
                    setSelectedDetail(null);
                    onDirectBorrow(item);
                  }}
                  className="px-4 py-2 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Ajukan Pinjam Alat Ini
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentInventory;

