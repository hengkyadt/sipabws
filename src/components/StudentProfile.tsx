import React, { useState } from 'react';
import { 
  User as UserType 
} from '../types';
import { 
  User, 
  Lock, 
  Phone, 
  GraduationCap, 
  Building2, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Save 
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface StudentProfileProps {
  currentUser: UserType;
  onUpdateProfile: (updatedUser: UserType) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  currentUser,
  onUpdateProfile
}) => {
  // Profile edit state
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [classSemester, setClassSemester] = useState(currentUser.classSemester || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserType = {
      ...currentUser,
      phone,
      whatsApp: phone,
      classSemester
    };
    storageService.updateUser(updated);
    onUpdateProfile(updated);
    setProfileSuccess('Data profil kontak berhasil diperbarui!');
    setTimeout(() => setProfileSuccess(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await storageService.changePassword(currentUser.id, currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Kata sandi berhasil diubah! Gunakan kata sandi baru untuk login berikutnya.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Gagal mengubah password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0B3C5D] text-white flex items-center justify-center font-bold text-lg">
            <User className="w-6 h-6 text-[#F28C28]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0B3C5D] font-heading">
              Profil & Keamanan Akun
            </h3>
            <p className="text-xs text-slate-500">
              Kelola data kontak aktif dan perbarui kata sandi akun Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Profile Info Form */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0B3C5D]" />
              <span>Data Identitas Mahasiswa</span>
            </h4>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">NIM</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.nim_nip}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Peran Akun</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold capitalize cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Program Studi</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.department}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Email Terdaftar</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kelas / Semester Aktif</label>
                <input
                  type="text"
                  value={classSemester}
                  onChange={(e) => setClassSemester(e.target.value)}
                  placeholder="Contoh: TMA-b / Semester 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nomor WhatsApp / Telepon Aktif</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#F28C28]" />
                <span>Simpan Perubahan Kontak</span>
              </button>
            </form>
          </div>

          {/* Right Column: Password Change Form */}
          <div className="space-y-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l md:pl-8 border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F28C28]" />
              <span>Ganti Kata Sandi (Password)</span>
            </h4>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi Saat Ini *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ulangi Kata Sandi Baru *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi kata sandi baru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Kata sandi Anda dienkripsi menggunakan algoritma <strong>SHA-256 ber-salt unik</strong>. Admin workshop tidak dapat melihat kata sandi teks biasa Anda.
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl font-semibold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{passwordLoading ? 'Mengubah Kata Sandi...' : 'Perbarui Kata Sandi'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

