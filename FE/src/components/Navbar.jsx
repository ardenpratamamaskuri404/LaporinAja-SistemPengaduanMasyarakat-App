import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
  Menu, X, Home, Bell, ChevronDown, LogOut, 
  User, FileText, Sun, Moon, Languages, Plus
} from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, lang, toggleTheme, toggleLang } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifikasi/unread/count').then(res => {
        if (res.data?.success) setUnreadCount(res.data.data.count);
      }).catch(() => {});
    }
  }, [user, location.pathname]);
  
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user?.role === 'MASYARAKAT' 
    ? [
        { label: t.nav_dashboard, to: '/dashboard' },
        { label: t.nav_create_report, to: '/buat-laporan' },
        { label: t.nav_my_reports, to: '/laporan' },
      ]
    : user?.role === 'SUPER_ADMIN'
    ? [
        { label: 'Dashboard Super Admin', to: '/superadmin/dashboard' },
        { label: t.nav_home, to: '/' },
        { label: t.nav_stats, to: '/statistik' },
      ]
    : user?.role === 'ADMIN'
    ? [
        { label: 'Dashboard Admin', to: '/admin/dashboard' },
        { label: t.nav_home, to: '/' },
        { label: t.nav_stats, to: '/statistik' },
      ]
    : [
        { label: t.nav_home, to: '/' },
        { label: t.nav_about, to: '/tentang' },
        { label: t.nav_stats, to: '/statistik' },
        { label: t.nav_help, to: '/bantuan' },
      ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'SUPER_ADMIN') return '/superadmin/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1001] transition-all duration-300 ${
      scrolled 
        ? 'bg-white dark:bg-gray-900 shadow-md' 
        : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-[#2d5a1e] dark:text-green-400 text-2xl">
            <Home className="w-7 h-7" />
            <span className="hidden sm:block">LaporinAja</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold transition-all duration-200 relative py-1 ${
                  isActive(link.to)
                    ? 'text-[#2d5a1e] dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#2d5a1e] dark:hover:text-green-400'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2d5a1e] dark:bg-green-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Controls & Auth */}
          <div className="flex items-center gap-4">
            {/* Control Icons */}
            <div className="hidden sm:flex items-center gap-2 border-r border-gray-100 dark:border-gray-800 pr-4">
              <button 
                onClick={toggleLang}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                title={lang === 'ID' ? 'Switch to English' : 'Ganti ke Indonesia'}
              >
                <Languages className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#2d5a1e] text-[8px] text-white font-bold px-1 rounded-sm">
                  {lang}
                </span>
              </button>
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user && (
                <Link 
                  to="/notifikasi"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-gray-900">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
              )}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-4 group p-1.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="flex flex-col text-right hidden sm:flex">
                      <span className="max-w-[150px] truncate font-black text-gray-900 dark:text-white leading-tight text-[15px]">{user.nama}</span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold truncate max-w-[150px] leading-tight">{user.email}</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden shrink-0 group-hover:shadow-md transition-all">
                      {user.foto_profil ? (
                        <img src={`http://localhost:5000${user.foto_profil}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 font-black text-lg">
                          {user.nama?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-[#2d5a1e]' : 'group-hover:text-gray-400'}`} />
                  </button>



                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.nama}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Home className="w-4 h-4 text-[#2d5a1e] dark:text-green-400" /> {user?.role === 'SUPER_ADMIN' ? 'Dashboard Super Admin' : user?.role === 'ADMIN' ? 'Dashboard Admin' : t.nav_dashboard}
                      </Link>
                      {user?.role === 'MASYARAKAT' && (
                        <Link
                          to="/buat-laporan"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="w-4 h-4 rounded-full border border-[#2d5a1e] dark:border-green-400 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-[#2d5a1e] dark:text-green-400" />
                          </div>
                          {t.nav_create_report}
                        </Link>
                      )}
                      <Link
                        to="/laporan"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FileText className="w-4 h-4 text-[#2d5a1e] dark:text-green-400" /> {t.nav_my_reports}
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-[#2d5a1e] dark:text-green-400" /> {t.profile_menu_profile}
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" /> {t.nav_logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#2d5a1e] dark:hover:text-green-400 transition-colors px-2"
                  >
                    {t.nav_login}
                  </Link>
                  <Link to="/register" className="bg-[#2d5a1e] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#1e3f14] transition-all active:scale-[0.98]">
                    {t.nav_register}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-6 space-y-6 animate-fade-in shadow-xl">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 px-4 rounded-xl text-sm font-bold ${
                  isActive(link.to)
                    ? 'bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <div className="flex items-center gap-4">
               <button onClick={toggleLang} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                    <Languages className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{lang}</span>
               </button>
               <button onClick={toggleTheme} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{isDark ? 'Light' : 'Dark'}</span>
               </button>
            </div>
            {user && (
              <Link to="/notifikasi" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1">
                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                   <Bell className="w-5 h-5" />
                   {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">{unreadCount}</span>}
                 </div>
                 <span className="text-[10px] font-bold text-gray-400">Notif</span>
              </Link>
            )}
          </div>

          {user ? (
            <div className="space-y-2">
               <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                 {user?.role === 'SUPER_ADMIN' ? 'Dashboard Super Admin' : user?.role === 'ADMIN' ? 'Dashboard Admin' : t.nav_dashboard}
               </Link>
               <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-3 px-4 text-sm font-bold text-gray-600 dark:text-gray-400">{t.profile_menu_profile}</Link>
               <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-sm font-bold text-red-500">{t.nav_logout}</button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-400 text-sm" onClick={() => setMenuOpen(false)}>
                {t.nav_login}
              </Link>
              <Link to="/register" className="flex-1 text-center py-3.5 rounded-xl bg-[#2d5a1e] text-white font-bold text-sm shadow-lg shadow-green-900/20" onClick={() => setMenuOpen(false)}>
                {t.nav_register}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
