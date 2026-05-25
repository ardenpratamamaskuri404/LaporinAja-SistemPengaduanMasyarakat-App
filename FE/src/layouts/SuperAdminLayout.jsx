import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  LayoutDashboard, FileText, Layers, Users, 
  BarChart3, Activity, Settings, Bell, 
  LogOut, Search, Menu, X, Sun, Moon,
  ShieldCheck, Globe, Database, Cpu, Languages, HelpCircle,
  ChevronRight
} from 'lucide-react';
import { translations } from '../utils/translations';

const SuperAdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, lang, toggleLang } = useSettings();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('superAdminSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('superAdminSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/superadmin/dashboard', labelKey: 'nav_dashboard' },
    { icon: FileText, label: 'Kelola Laporan', to: '/superadmin/laporan', labelKey: 'side_manage_report' },
    { icon: Layers, label: 'Kelola Kategori', to: '/superadmin/kategori', labelKey: 'side_manage_category' },
    { icon: Users, label: 'Kelola Pengguna', to: '/superadmin/user', labelKey: 'side_manage_user' },
    { icon: Globe, label: 'Statistik Nasional', to: '/superadmin/statistik', labelKey: 'side_global_stats' },
    { icon: Database, label: 'Log Aktivitas', to: '/superadmin/log', labelKey: 'side_activity_log' },
    { icon: Languages, label: 'Konfigurasi', to: '/superadmin/konfigurasi', labelKey: 'side_config' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 lg:translate-x-0 ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-[88px] lg:translate-x-0 -translate-x-full'}`}>
        <div className={`h-full flex flex-col ${isSidebarOpen ? 'p-6' : 'p-4'}`}>
          <div className="flex flex-col mb-10 relative">
            <div className={`flex items-center gap-3 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-100 mb-6' : 'opacity-0 w-0 h-0 mb-0'}`}>
              <div className="w-12 h-12 bg-[#2d5a1e] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-900/30 ring-4 ring-green-500/10 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="whitespace-nowrap">
                <h1 className="text-2xl font-black text-[#2d5a1e] dark:text-green-400 tracking-tighter">LaporinAja</h1>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-black text-[#2d5a1e] dark:text-green-400 uppercase tracking-[0.2em]">{translations[lang]?.side_super_admin}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-[#2d5a1e] transition-all hover:scale-110 active:scale-95 ${!isSidebarOpen ? 'mx-auto' : 'absolute -right-2 top-1'}`}
            >
              {isSidebarOpen ? <ChevronRight className="w-5 h-5 rotate-180" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group relative ${
                  isActive(item.to)
                    ? 'bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
                title={!isSidebarOpen ? (translations[lang]?.[item.labelKey] || item.label) : ''}
              >
                <item.icon className={`w-5 h-5 transition-colors shrink-0 ${isActive(item.to) ? 'text-[#2d5a1e] dark:text-green-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                  {translations[lang]?.[item.labelKey] || item.label}
                </span>
                {isActive(item.to) && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 bg-[#2d5a1e] dark:bg-green-400 rounded-full"></div>}
                {isActive(item.to) && !isSidebarOpen && <div className="absolute right-2 w-1 h-5 bg-[#2d5a1e] dark:bg-green-400 rounded-full"></div>}
              </Link>
            ))}
          </nav>

          <div className={`mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2 ${!isSidebarOpen ? 'flex flex-col items-center' : ''}`}>
             <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-red-500 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 ${!isSidebarOpen ? 'justify-center' : ''}`} title={!isSidebarOpen ? translations[lang]?.side_logout : ''}>
                 <LogOut className="w-5 h-5 shrink-0" />
                 <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                   {translations[lang]?.side_logout}
                 </span>
              </button>
             <Link to="/superadmin/pengaturan" className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`} title={!isSidebarOpen ? translations[lang]?.side_settings : ''}>
                <Settings className="w-5 h-5 shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                  {translations[lang]?.side_settings}
                </span>
             </Link>
             <Link to="/superadmin/bantuan" className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-white bg-[#2d5a1e] hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 active:scale-95 ${!isSidebarOpen ? 'justify-center' : ''}`} title={!isSidebarOpen ? translations[lang]?.side_help : ''}>
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                  {translations[lang]?.side_help}
                </span>
             </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-[88px] ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
               <div className="relative w-full group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                  <input 
                    type="text" 
                    placeholder="Cari laporan, user, atau kategori..." 
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none transition-all" 
                  />
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 border-r border-gray-100 dark:border-gray-800 pr-6">
                  <button onClick={toggleLang} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                    <Languages className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-[#2d5a1e] text-[8px] text-white font-bold px-1 rounded-sm">{lang}</span>
                  </button>
                  <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <Link to="/superadmin/notifikasi" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] font-black text-white px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
               </div>

               <div className="flex items-center gap-4">
                  <Link to="/superadmin/pengaturan" className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                       <p className="text-[15px] font-black text-gray-900 dark:text-white group-hover:text-[#2d5a1e] transition-colors leading-none mb-1">{user?.nama || 'Super Admin'}</p>
                       <p className="text-[11px] text-gray-400 font-bold">{user?.email || 'superadmin@laporinaja.id'}</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm group-hover:shadow-md group-hover:border-[#2d5a1e] transition-all bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-sm font-bold text-[#2d5a1e] dark:text-green-400">
                       {user?.foto_profil ? (
                         <img src={`http://localhost:5000${user.foto_profil}`} alt="Super Admin" className="w-full h-full object-cover" />
                       ) : (
                         user?.nama?.[0]?.toUpperCase() || 'SA'
                       )}
                    </div>
                  </Link>
               </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
