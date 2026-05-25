import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
    User, Mail, Lock, Eye, EyeOff, Phone, 
    MapPin, Home, AlertCircle, CheckCircle, 
    Loader2, ArrowLeft, ChevronDown, Search, Megaphone
} from 'lucide-react';

const provinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Lampung", "Banten", "Jawa Barat", "DKI Jakarta", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara", "Papua Barat", "Papua"
];

const citiesByProvince = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
  "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Cimahi", "Tasikmalaya", "Cirebon"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Banyuwangi"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Banyumas"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunung Kidul"],
  "Banten": ["Tangerang", "Serang", "Cilegon", "Tangerang Selatan"],
};

const getPasswordStrength = (password, lang) => {
  if (password.length === 0) return { label: '', color: '', width: '0%' };
  if (password.length < 6) return { label: lang === 'ID' ? 'Lemah' : 'Weak', color: 'bg-red-400', width: '25%' };
  if (password.length < 8) return { label: lang === 'ID' ? 'Sedang' : 'Medium', color: 'bg-yellow-400', width: '50%' };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: lang === 'ID' ? 'Kuat' : 'Strong', color: 'bg-[#2d5a1e]', width: '100%' };
  return { label: lang === 'ID' ? 'Cukup' : 'Fair', color: 'bg-green-400', width: '75%' };
};

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const { lang } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    nama: '', 
    email: '', 
    telp: '', 
    provinsi: '',
    kota: '', 
    password: '', 
    konfirmasi: '', 
    agree: false 
  });
  const [showPass, setShowPass] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const t = translations[lang];
  const strength = getPasswordStrength(form.password, lang);
  const availableCities = citiesByProvince[form.provinsi] || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
    
    if (name === 'provinsi') {
        setForm(prev => ({ ...prev, provinsi: value, kota: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.email || !form.password || !form.konfirmasi || !form.provinsi || !form.kota) {
      setError(lang === 'ID' ? 'Semua kolom wajib diisi.' : 'All fields are required.'); return;
    }
    if (form.password !== form.konfirmasi) {
      setError(lang === 'ID' ? 'Konfirmasi kata sandi tidak cocok.' : 'Password confirmation does not match.'); return;
    }
    if (form.password.length < 6) {
      setError(lang === 'ID' ? 'Kata sandi minimal 6 karakter.' : 'Password must be at least 6 characters.'); return;
    }
    if (!form.agree) {
      setError(lang === 'ID' ? 'Anda harus menyetujui syarat & ketentuan.' : 'You must agree to the terms & conditions.'); return;
    }

    const result = await register({
      nama: form.nama,
      email: form.email,
      password: form.password,
      no_telp: form.telp || null,
      provinsi: form.provinsi,
      kota: form.kota,
      agree_terms: form.agree,
    });
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-gray-950 flex animate-fade-in transition-colors duration-300">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#a8ccaa] dark:bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-bl-[100px]"></div>
        
        <div className="relative z-10 animate-slide-up">
            <Link to="/" className="flex items-center gap-2 font-bold text-[#1a3d0f] dark:text-green-400 text-2xl mb-12">
                <Home className="w-7 h-7" />
                LaporinAja
            </Link>
            
            <h1 className="text-5xl font-extrabold text-[#1a3d0f] dark:text-white leading-tight mb-5 tracking-tight">
                {t.reg_left_title}
            </h1>
            <p className="text-[#2d5a1e] dark:text-gray-400 text-base font-medium leading-relaxed max-w-sm opacity-80">
                {t.reg_left_desc}
            </p>
        </div>

        <div className="relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Reduced size Image Container */}
            <div className="relative w-full max-w-sm mx-auto aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl border-4 border-white/20 dark:border-gray-800 group hover:scale-[1.02] transition-transform duration-700">
                <img 
                    src="/foto-register.png" 
                    alt="register-image" 
                    className="w-full h-full object-cover dark:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a3d0f]/40 dark:from-black/60 via-transparent to-transparent"></div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
                <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#a8ccaa] dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[#2d5a1e] dark:text-green-400">
                            {i}
                        </div>
                    ))}
                </div>
                <span className="text-[#1a3d0f] dark:text-gray-400 text-xs font-bold">+12,400 {lang === 'ID' ? 'Warga Terdaftar' : 'Registered Citizens'}</span>
            </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative bg-white dark:bg-gray-950">
        {/* Back Button */}
        <Link 
            to="/" 
            className="absolute top-8 left-8 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-[#2d5a1e] dark:hover:text-green-400 hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
        >
            <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{t.reg_title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">{t.reg_subtitle}</p>

          {success && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-2xl px-6 py-4 mb-8 font-medium animate-bounce">
              <CheckCircle className="w-6 h-6" /> {lang === 'ID' ? 'Akun berhasil dibuat! Mengarahkan ke login...' : 'Account created! Redirecting to login...'}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl px-6 py-4 mb-8 font-medium">
              <AlertCircle className="w-6 h-6" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_name}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_email}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Telp */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_phone}</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="text"
                    name="telp"
                    value={form.telp}
                    onChange={handleChange}
                    placeholder="0812xxxxxxxx"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Provinsi */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_prov}</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <select
                    name="provinsi"
                    value={form.provinsi}
                    onChange={handleChange}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 appearance-none transition-all font-medium"
                  >
                    <option value="">{lang === 'ID' ? 'Pilih Provinsi' : 'Select Province'}</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Kota */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_city}</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <select
                    name="kota"
                    value={form.kota}
                    onChange={handleChange}
                    disabled={!form.provinsi}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 appearance-none transition-all font-medium disabled:opacity-50"
                  >
                    <option value="">{form.provinsi ? (lang === 'ID' ? 'Pilih Kota' : 'Select City') : (lang === 'ID' ? 'Pilih Provinsi Dulu' : 'Select Province First')}</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.login_pass}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                        <input
                            type={showPass ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">{t.reg_confirm}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                        <input
                            type={showKonfirmasi ? 'text' : 'password'}
                            name="konfirmasi"
                            value={form.konfirmasi}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Agree */}
            <div className="flex items-start gap-3 p-1">
                <input
                    type="checkbox"
                    name="agree"
                    id="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#2d5a1e] cursor-pointer"
                />
                <label htmlFor="agree" className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed cursor-pointer select-none">
                    {t.reg_agree_1} <Link to="/syarat" className="text-[#2d5a1e] dark:text-green-400 hover:underline">{t.reg_agree_2}</Link> {t.reg_agree_3} <Link to="/privasi" className="text-[#2d5a1e] dark:text-green-400 hover:underline">{t.reg_agree_4}</Link> LaporinAja.
                </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#2d5a1e] dark:bg-green-600 hover:bg-[#1e3f14] dark:hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2d5a1e]/20 dark:shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.reg_btn}
            </button>
          </form>
          
          {/* Social Register */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <span className="relative bg-white dark:bg-gray-950 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                {t.social_divider_reg}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 py-3.5 rounded-2xl transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-md">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 py-3.5 rounded-2xl transition-all duration-200 group active:scale-[0.98] shadow-sm hover:shadow-md">
                <svg className="w-5 h-5 fill-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 mt-8 uppercase tracking-widest">
            {t.reg_have_acc} <Link to="/login" className="text-[#2d5a1e] dark:text-green-400 hover:underline ml-1">{t.reg_login_here}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
