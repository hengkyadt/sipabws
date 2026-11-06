import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  KeyRound, 
  History, 
  Clock, 
  Lock, 
  UserX, 
  UserCheck,
  Trash2
} from 'lucide-react';
import { User, LoginHistoryItem } from '../types';
import { storageService } from '../services/storageService';
import { UserAvatar } from './UserAvatar';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onApproveUser,
  onRejectUser
}) => {
  const studentsOnly = users.filter(u => u.role === 'student');
  const pendingStudents = studentsOnly.filter(u => u.status === 'pending_approval');

  const [activeTab, setActiveTab] = useState<'pending_verification' | 'students' | 'login_history'>(() => {
    return users.some(u => u.role === 'student' && u.status === 'pending_approval')
      ? 'pending_verification'
      : 'students';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newAdminSetPass, setNewAdminSetPass] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'admin' | 'student',
    nim_nip: '',
    department: 'D3 Teknik Mesin',
    classSemester: 'TMA-b / Semester 2',
    phone: '',
    whatsApp: '',
    status: 'active' as 'active' | 'inactive' | 'pending_approval'
  });

  const loginLogs: LoginHistoryItem[] = storageService.getLoginHistory();

  const filteredStudents = studentsOnly.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nim_nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.classSemester && u.classSemester.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || u.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'student',
      nim_nip: '',
      department: 'D3 Teknik Mesin',
      classSemester: 'TMA-b / Semester 2',
      phone: '',
      whatsApp: '',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      nim_nip: user.nim_nip,
      department: user.department,
      classSemester: user.classSemester || '',
      phone: user.phone || '',
      whatsApp: user.whatsApp || user.phone || '',
      status: user.status
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData
      });
    } else {
      // Validate unique NIM and Email
      if (users.some(u => u.nim_nip === formData.nim_nip)) {
        alert(`NIM ${formData.nim_nip} sudah ada dalam database.`);
        return;
      }
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        alert(`Email ${formData.email} sudah digunakan.`);
        return;
      }

      onAddUser({
        id: `MHS-${formData.nim_nip}`,
        ...formData,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    }
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'active' ? 'mengaktifkan kembali' : 'menonaktifkan (suspend)';
    if (confirm(`Yakin ingin ${actionLabel} akun mahasiswa ${user.name}?`)) {
      onUpdateUser({
        ...user,
        status: nextStatus
      });
    }
  };

  const handleDeleteStudent = (user: User) => {
    if (!onDeleteUser) return;
    if (confirm(`PERINGATAN HAPUS AKUN:\n\nApakah Anda yakin ingin MENGHAPUS PERMANEN akun mahasiswa:\n• Nama: ${user.name}\n• NIM: ${user.nim_nip}\n• Prodi: ${user.department}\n\nSemua data login mahasiswa ini akan dihapus dari sistem.`)) {
      onDeleteUser(user.id);
      if (editingUser?.id === user.id) {
        setIsAddModalOpen(false);
        setEditingUser(null);
      }
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newAdminSetPass) return;

    if (newAdminSetPass.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }

    await storageService.adminResetPassword(resetPasswordUser.id, newAdminSetPass);
    alert(`Password untuk ${resetPasswordUser.name} (${resetPasswordUser.nim_nip}) berhasil direset menjadi: ${newAdminSetPass}`);
    setResetPasswordUser(null);
    setNewAdminSetPass('');
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending_verification')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'pending_verification'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className={`w-4 h-4 ${pendingStudents.length > 0 ? 'text-amber-400 animate-spin' : 'text-[#F28C28]'}`} />
          <span>Verifikasi & ACC Akun Baru</span>
          {pendingStudents.length > 0 ? (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              {pendingStudents.length} Menunggu ACC
            </span>
          ) : (
            <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#F28C28]" />
          <span>Daftar Semua Mahasiswa ({studentsOnly.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('login_history')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'login_history'
              ? 'bg-[#0B3C5D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4 text-[#F28C28]" />
          <span>Audit Riwayat Login ({loginLogs.length})</span>
        </button>
      </div>

      {/* TAB 0: VERIFIKASI & ACC AKUN MAHASISWA BARU */}
      {activeTab === 'pending_verification' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-950 font-heading">
                  Antrean Verifikasi & Persetujuan Akun Mahasiswa (ACC)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Mahasiswa baru yang mendaftar wajib diverifikasi oleh Administrator sebelum dapat masuk (login) dan meminjam peralatan workshop.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs self-start sm:self-auto shrink-0">
              {pendingStudents.length} Menunggu ACC
            </span>
          </div>

          {pendingStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Pendaftaran yang Menunggu Verifikasi</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Semua akun mahasiswa yang mendaftar telah di-ACC. Setiap pendaftaran akun baru dari mahasiswa akan otomatis muncul pada halaman ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingStudents.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={st.name} role="student" size="xl" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{st.name}</h4>
                        <span className="font-mono text-xs text-[#F28C28] font-bold block mt-0.5">
                          NIM: {st.nim_nip}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">{st.department}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                      Menunggu ACC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Kelas / Semester</span>
                      <span className="font-semibold text-slate-700">{st.classSemester || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Waktu Mendaftar</span>
                      <span className="font-semibold text-slate-700 font-mono text-[11px]">{st.createdAt || '-'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono font-medium">{st.whatsApp || st.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onApproveUser ? onApproveUser(st.id) : onUpdateUser({ ...st, status: 'active' })}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui (ACC Akun)</span>
                    </button>

                    <button
                      onClick={() => onRejectUser ? onRejectUser(st.id) : handleDeleteStudent(st)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                      title="Tolak Permohonan Akun Ini"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(st)}
                      className="p-2 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                      title="Edit Detail"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama mahasiswa, NIM unik, kelas, atau email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-aktif / Suspended</option>
                <option value="pending_approval">Menunggu Approval</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700"
              >
                <option value="ALL">Semua Program Studi</option>
                <option value="D3 Teknik Mesin">D3 Teknik Mesin</option>
                <option value="D3 Teknik Kimia">D3 Teknik Kimia</option>
                <option value="D3 Agribisnis Kelapa Sawit">D3 Agribisnis Kelapa Sawit</option>
              </select>

              <button
                onClick={handleOpenAdd}
                className="bg-[#0B3C5D] hover:bg-[#07273d] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#F28C28]" />
                Tambah Mahasiswa
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Mahasiswa Terdaftar ({filteredStudents.length} Mahasiswa)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Sheet: Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Mahasiswa & NIM</th>
                    <th className="py-3 px-4">Prodi & Kelas</th>
                    <th className="py-3 px-4">Kontak (WhatsApp & Email)</th>
                    <th className="py-3 px-4">Status Akun</th>
                    <th className="py-3 px-4">Login Terakhir</th>
                    <th className="py-3 px-4 text-right">Kelola Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <GraduationCap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium">Tidak ada data mahasiswa yang cocok dengan filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        className={student.status === 'pending_approval' 
                          ? 'bg-amber-50/60 hover:bg-amber-100/50 border-l-4 border-amber-500 transition' 
                          : 'hover:bg-blue-50/30 transition'}
                      >
                        {/* Name & NIM */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={student.name}
                              role="student"
                              size="lg"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                              <span className="font-mono text-[11px] text-[#F28C28] font-bold block mt-0.5">
                                NIM: {student.nim_nip}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dept & Class */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 leading-snug">{student.department}</p>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {student.classSemester || '-'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-mono">{student.whatsApp || student.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{student.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {student.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Aktif
                            </span>
                          )}
                          {student.status === 'inactive' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Non-aktif / Suspended
                            </span>
                          )}
                          {student.status === 'pending_approval' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                              Menunggu Approval
                            </span>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                          {student.lastLogin || '-'}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* ACC / Activate button or Toggle */}
                            {student.status === 'pending_approval' ? (
                              <button
                                onClick={() => onApproveUser ? onApproveUser(student.id) : onUpdateUser({ ...student, status: 'active' })}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                title="Setujui dan Aktifkan Akun Mahasiswa Ini (ACC)"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>ACC Akun</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(student)}
                                className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                                  student.status === 'active'
                                    ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={student.status === 'active' ? 'Non-aktifkan Akun' : 'Aktifkan Akun'}
                              >
                                {student.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            )}

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetPasswordUser(student);
                                setNewAdminSetPass('PtkiMedan2025!');
                              }}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition"
                              title="Reset Password Mahasiswa"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Edit Profile */}
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
                              title="Edit Data Mahasiswa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Student Account */}
                            {onDeleteUser && (
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg transition"
                                title="Hapus Akun Mahasiswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGIN HISTORY AUDIT */}
      {activeTab === 'login_history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Log Riwayat Login Pengguna ({loginLogs.length} Catatan)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Sheet: Login_History
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Waktu Login</th>
                  <th className="py-3 px-4">Perangkat / Klien</th>
                  <th className="py-3 px-4">Status Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginLogs.map((log) => (
                  <tr key={log.loginId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-xs">{log.loginId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4">{log.role}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">{log.loginDate}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{log.device || 'Web Browser'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.loginStatus === 'SUCCESS' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Berhasil Masuk
                        </span>
                      )}
                      {log.loginStatus === 'FAILED_PASSWORD' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          Password Salah
                        </span>
                      )}
                      {log.loginStatus === 'INACTIVE_ACCOUNT' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800">
                          Akun Non-aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0B3C5D] font-heading mb-3">
              {editingUser ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru (Admin)'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Mahasiswa *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="Nama mahasiswa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.nim_nip}
                    onChange={(e) => setFormData({ ...formData, nim_nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono disabled:opacity-60"
                    placeholder="Contoh: 2101042"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas / Semester *</label>
                  <input
                    type="text"
                    required
                    value={formData.classSemester}
                    onChange={(e) => setFormData({ ...formData, classSemester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    placeholder="TMA-b / Semester 2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Studi *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="D3 Teknik Mesin">D3 Teknik Mesin</option>
                  <option value="D3 Teknik Kimia">D3 Teknik Kimia</option>
                  <option value="D3 Agribisnis Kelapa Sawit">D3 Agribisnis Kelapa Sawit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Mahasiswa *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    placeholder="Masukkan email Anda"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.whatsApp}
                    onChange={(e) => setFormData({ ...formData, whatsApp: e.target.value, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Akun *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="active">Aktif (Dapat Login & Pinjam)</option>
                  <option value="inactive">Non-aktif (Suspended / Dinonaktifkan)</option>
                  <option value="pending_approval">Menunggu Approval Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {editingUser && onDeleteUser ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(editingUser)}
                    className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-1.5 transition text-xs"
                    title="Hapus Akun Ini Permanen"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Hapus Akun</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl font-semibold text-xs sm:text-sm"
                  >
                    Simpan Mahasiswa
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#F28C28]" />
              Reset Password Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reset kata sandi untuk <strong>{resetPasswordUser.name}</strong> (NIM: {resetPasswordUser.nim_nip}):
            </p>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru yang Ditetapkan Admin *
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newAdminSetPass}
                  onChange={(e) => setNewAdminSetPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl text-xs font-semibold"
                >
                  Terapkan Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

