import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Home } from 'lucide-react';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const { lang } = useSettings();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(lang === 'ID' ? 'Email wajib diisi.' : 'Email is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'ID' ? 'Terjadi kesalahan.' : 'An error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-gray-950 flex items-center justify-center p-6 animate-fade-in transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo/Home Link */}
        <div className="text-center mb-10 reveal">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-[#2d5a1e] dark:text-green-400 text-3xl">
            <Home className="w-8 h-8" />
            LaporinAja
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-2xl shadow-black/5 animate-slide-up">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t.forgot_title}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              {t.forgot_desc}
            </p>
          </div>

          {success ? (
            <div className="text-center animate-scale-in">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 dark:text-green-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.forgot_success_title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 leading-relaxed">
                {t.forgot_success_desc}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#2d5a1e] dark:text-green-400 font-bold text-sm hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> {t.forgot_back}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl px-6 py-4 mb-4 text-sm font-medium">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t.login_email}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5a1e] dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="nama@email.com"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 dark:focus:ring-green-400/10 focus:border-[#2d5a1e] dark:focus:border-green-400 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5a1e] dark:bg-green-600 hover:bg-[#1e3f14] dark:hover:bg-green-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#2d5a1e]/20 dark:shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.forgot_btn}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-[#2d5a1e] dark:hover:text-green-400 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {t.forgot_back}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
