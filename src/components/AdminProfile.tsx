import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  FileCode2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface AdminProfileProps {
  currentUser: UserType;
  onUpdateProfile: (updatedUser: UserType) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({
  currentUser,
  onUpdateProfile
}) => {
  const adminAccount = storageService.getAdminAccount();

  // Admin Profile Info State
  const [username, setUsername] = useState(adminAccount.username || 'admin');
  const [email, setEmail] = useState(adminAccount.email || 'workshop.usbptkimedan@gmail.com');
  const [fullName, setFullName] = useState(adminAccount.fullName || currentUser.name);
  const [nimNip, setNimNip] = useState(currentUser.nim_nip || '197605062003121004');
  const [phone, setPhone] = useState(currentUser.phone || '0812-3456-7890');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Code Copy State
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!username.trim() || !email.trim() || !fullName.trim()) {
      setProfileError('Username, Email, dan Nama Lengkap wajib diisi.');
      return;
    }

    try {
      const res = await storageService.updateAdminProfile({
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
        nimNip: nimNip.trim(),
        phone: phone.trim()
      });

      if (res.success) {
        const updated: UserType = {
          ...currentUser,
          name: fullName.trim(),
          email: email.trim(),
          nim_nip: nimNip.trim(),
          phone: phone.trim(),
          whatsApp: phone.trim()
        };
        onUpdateProfile(updated);
        setProfileSuccess(`Profil Administrator & Username "${username.trim()}" berhasil disimpan! Gunakan username/email ini saat login.`);
        setTimeout(() => setProfileSuccess(null), 4000);
      } else {
        setProfileError(res.error || 'Gagal menyimpan profil admin.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
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
        setPasswordSuccess('Password administrator berhasil diubah! Gunakan password baru ini untuk login berikutnya.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Password saat ini salah.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Terjadi kesalahan saat memproses kata sandi.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopyCodeSnippet = () => {
    const snippet = `// Di file: src/data/initialData.ts
export const INITIAL_ADMIN: AdminAccount = {
  adminId: 'ADM-PTKI-001',
  username: '${username}',
  email: '${email}',
  fullName: '${fullName}',
  passwordHash: '${adminAccount.passwordHash}',
  role: 'admin',
  createdAt: '2025-01-01 08:00:00'
};`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3C5D] via-[#124d75] to-[#07273d] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F28C28] to-amber-600 flex items-center justify-center text-white shadow-lg shrink-0 border-2 border-white/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F28C28]/20 text-orange-200 border border-[#F28C28]/30 text-xs font-semibold mb-1">
              <span>Akun Tunggal Administrator Workshop</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Pengaturan Akun & Keamanan Administrator
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-0.5">
              Ubah Username Login, Email, Nama Kepala Workshop, dan Kata Sandi Administrator.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Profile & Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Username & Data Identitas Admin */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-[#0B3C5D]" />
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              1. Ubah Username & Identitas Admin
            </h3>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Username Login Admin *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau bambang_workshop"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Username ini digunakan saat Anda login di halaman muka.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Email Administrator Workshop *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="workshop.usbptkimedan@gmail.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Anda juga dapat login menggunakan alamat email ini.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nama Lengkap & Gelar (Kepala Workshop / Lab) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abdillah, ST. MM."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  value={nimNip}
                  onChange={(e) => setNimNip(e.target.value)}
                  placeholder="197605062003121004"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0B3C5D]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl font-semibold shadow-xs transition flex items-center justify-center gap-1.5 mt-2"
            >
              <Save className="w-4 h-4 text-[#F28C28]" />
              <span>Simpan Perubahan Username & Profil</span>
            </button>
          </form>
        </div>

        {/* Form 2: Ubah Kata Sandi (Password) Admin */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-[#F28C28]" />
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              2. Ubah Kata Sandi (Password) Admin
            </h3>
          </div>

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

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Password Administrator Saat Ini *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl pr-10 focus:ring-2 focus:ring-[#0B3C5D]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Password Administrator Baru *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl pr-10 focus:ring-2 focus:ring-[#0B3C5D]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Konfirmasi Password Administrator Baru *
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B3C5D]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl font-semibold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? 'Menyimpan Kata Sandi...' : 'Perbarui Password Admin'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

