import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface AuthScreenProps {
  onLoginSuccess: (user: UserType) => void;
  onUserRegistered?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onUserRegistered }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regDepartment, setRegDepartment] = useState('D3 Teknik Mesin');
  const [regClassSemester, setRegClassSemester] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsApp, setRegWhatsApp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const result = await storageService.login(loginIdentifier, loginPassword);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setLoginError(result.error || 'Terjadi kesalahan saat masuk.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal terhubung ke layanan otentikasi.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password minimal harus 6 karakter.');
      return;
    }

    setRegLoading(true);

    try {
      const result = await storageService.registerStudent({
        name: regName,
        nim: regNim,
        studyProgram: regDepartment,
        classSemester: regClassSemester,
        email: regEmail,
        whatsApp: regWhatsApp,
        password: regPassword
      });

      if (result.success && result.user) {
        onUserRegistered?.();
        setRegSuccessMessage(`Pendaftaran berhasil! Data akun ${result.user.name} (NIM: ${result.user.nim_nip}) telah masuk ke sistem dan sedang MENUNGGU VERIFIKASI (ACC) dari Administrator Workshop PTKI Medan.`);
        setTimeout(() => {
          setLoginIdentifier(regNim);
          setLoginPassword(regPassword);
          setAuthMode('login');
          setRegSuccessMessage(null);
        }, 3500);
      } else {
        setRegError(result.error || 'Gagal melakukan pendaftaran.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Terjadi kesalahan pada server pendaftaran.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07273d] via-[#0B3C5D] to-[#165682] flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-blue-900/20">
        
        {/* Left Branding Column (PTKI Industrial Side) */}
        <div className="md:col-span-5 bg-[#0B3C5D] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#F28C28]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F28C28] to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-amber-300/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-wide text-white font-heading">SI-PAB</span>
                  <span className="bg-[#F28C28] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">PTKI</span>
                </div>
                <p className="text-xs text-blue-200">Workshop</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-heading text-white leading-tight">
                Sistem Peminjaman Alat & Bahan Workshop
              </h2>
              <p className="text-blue-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
                Platform terpusat untuk mahasiswa, dosen, dan PLP di Politeknik Teknologi Kimia Industri Medan yang terhubung langsung ke Google Sheets.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-blue-100/90">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span>Akun Administrator Tunggal Workshop</span>
              </div>
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Registrasi Mandiri Mahasiswa (Validasi NIM Unik)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-[11px] text-blue-200/70">
            Kementerian Perindustrian Republik Indonesia &bull; PTKI Medan
          </div>
        </div>

        {/* Right Form Column (Login / Register) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* LOGIN VIEW */}
          {authMode === 'login' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#F28C28] uppercase tracking-wider">
                  Masuk ke Portal
                </span>
                <h3 className="text-2xl font-bold text-[#0B3C5D] font-heading mt-0.5">
                  Selamat Datang di SI-PAB
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan Username Admin atau Email/NIM Mahasiswa yang telah terdaftar.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    NIM / Email Mahasiswa / Username Admin *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Contoh: 2101042 atau admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password Akun *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#0B3C5D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-[#0B3C5D] hover:bg-[#07273d] text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-[#F28C28]" />
                      <span>Masuk ke Akun</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Belum memiliki akun mahasiswa?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setLoginError(null);
                  }}
                  className="font-bold text-[#F28C28] hover:underline"
                >
                  Daftar Akun Mahasiswa Baru &rarr;
                </button>
              </div>
            </div>
          )}

          {/* REGISTRATION VIEW */}
          {authMode === 'register' && (
            <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1 custom-scrollbar">
              <div>
                <span className="text-xs font-bold text-[#F28C28] uppercase tracking-wider">
                  Pendaftaran Akun
                </span>
                <h3 className="text-2xl font-bold text-[#0B3C5D] font-heading mt-0.5">
                  Registrasi Mahasiswa PTKI
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi data mahasiswa Anda untuk mengajukan pinjaman alat workshop.
                </p>
              </div>

              {regSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{regSuccessMessage}</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa *</label>
                    <input
                      type="text"
                      required
                      value={regNim}
                      onChange={(e) => setRegNim(e.target.value)}
                      placeholder="Contoh: 2201089"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas / Semester *</label>
                    <input
                      type="text"
                      required
                      value={regClassSemester}
                      onChange={(e) => setRegClassSemester(e.target.value)}
                      placeholder="Contoh: TMA-b / Semester 2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Studi *</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="D3 Teknik Mesin">D3 Teknik Mesin</option>
                    <option value="D3 Teknik Kimia">D3 Teknik Kimia</option>
                    <option value="D3 Agribisnis Kelapa Sawit">D3 Agribisnis Kelapa Sawit</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Aktif (Harus Unik) *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Masukkan Email Aktif"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      type="text"
                      required
                      value={regWhatsApp}
                      onChange={(e) => setRegWhatsApp(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password Baru *</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 Karakter"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Password *</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi Password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRegPassword}
                      onChange={(e) => setShowRegPassword(e.target.checked)}
                      className="rounded text-[#0B3C5D]"
                    />
                    <span>Tampilkan Password</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 bg-[#F28C28] hover:bg-[#d97514] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {regLoading ? (
                    <span>Mendaftarkan Akun...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Mahasiswa</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRegError(null);
                  }}
                  className="font-bold text-[#0B3C5D] hover:underline"
                >
                  Kembali ke Halaman Login &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

