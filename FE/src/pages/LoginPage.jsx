import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Home, ArrowLeft, Megaphone } from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { lang } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(lang === 'ID' ? 'Email dan kata sandi wajib diisi.' : 'Email and password are required.');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      const userData = result.data;
      if (userData.role === 'SUPER_ADMIN') {
        navigate('/superadmin/dashboard');
      } else if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-950 flex flex-col animate-fade-in transition-colors duration-300">
      <div className="flex-1 flex">

        {/* LEFT — Illustration */}
        <div className="hidden lg:flex lg:w-[55%] bg-[#f5f5f0] dark:bg-gray-950 items-center justify-center p-16 animate-slide-up transition-colors">
          <div className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl shadow-black/5 p-12 border border-gray-50 dark:border-gray-800">
            <img
              src="/foto-login.png"
              alt="LaporinAja Illustration"
              className="w-full h-auto object-contain mix-blend-multiply"
            />
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.login_left_title}</h3>
              <p className="text-gray-400 text-sm">{t.login_left_desc}</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center bg-white dark:bg-gray-900 relative px-8 py-16 lg:px-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Back button */}
          <Link
            to="/"
            className="absolute top-8 left-8 lg:left-16 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#2d5a1e] dark:hover:text-green-400 hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{t.login_title}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t.login_subtitle}</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl px-6 py-4 mb-8 font-medium">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t.login_email}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }}
                    placeholder="nama@email.com"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 ml-1">
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t.login_pass}</label>
                  <Link to="/lupa-password" id="forgot-password" className="text-[11px] font-bold text-[#2d5a1e] dark:text-green-400 hover:underline uppercase tracking-widest">{t.login_forgot}</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl pl-12 pr-12 py-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5a1e] dark:bg-green-600 hover:bg-[#1e3f14] dark:hover:bg-green-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#2d5a1e]/20 dark:shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.login_btn}
              </button>
            </form>
            
            {/* Social Login */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <span className="relative bg-white dark:bg-gray-900 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                  {t.social_divider_login}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 py-3.5 rounded-2xl transition-all duration-200 group active:scale-[0.98]">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Google</span>
                </button>
                <button className="flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 py-3.5 rounded-2xl transition-all duration-200 group active:scale-[0.98]">
                  <svg className="w-5 h-5 fill-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Facebook</span>
                </button>
              </div>
            </div>

            <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 mt-10 uppercase tracking-[0.2em]">
              {t.login_no_acc} <Link to="/register" className="text-[#2d5a1e] dark:text-green-400 hover:underline ml-1">{t.login_reg_here}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
