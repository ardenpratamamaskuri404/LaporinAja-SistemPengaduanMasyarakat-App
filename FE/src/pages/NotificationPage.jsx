import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
  Bell, CheckCircle2, MessageSquare, 
  Settings, Trash2, CheckCheck, 
  ChevronRight, Clock, AlertCircle,
  Wifi, RefreshCw
} from 'lucide-react';
import api from '../utils/api';

const NotificationPage = () => {
  const { lang } = useSettings();
  const navigate = useNavigate();
  const t = translations[lang];

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifikasi');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifikasi/read/all');
      if (response.data.success) {
        setNotifications(notifications.map(n => ({ ...n, sudahDibaca: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Yakin ingin menghapus semua notifikasi?')) return;
    try {
      const ids = notifications.map(n => n.id);
      const response = await api.post('/notifikasi/delete-multiple', { ids });
      if (response.data.success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await api.put(`/notifikasi/${id}/read`);
      if (response.data.success) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, sudahDibaca: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.sudahDibaca) markAsRead(notif.id);
    if (notif.laporanId) {
      navigate(`/laporan/${notif.laporanId}`);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Belum Dibaca') return !n.sudahDibaca;
    return true;
  });

  const getIcon = (pesan) => {
    if (pesan.toLowerCase().includes('status')) return <Clock className="w-5 h-5 text-green-600" />;
    if (pesan.toLowerCase().includes('komentar') || pesan.toLowerCase().includes('balasan')) return <MessageSquare className="w-5 h-5 text-blue-600" />;
    return <Bell className="w-5 h-5 text-pink-600" />;
  };

  const getIconBg = (pesan) => {
    if (pesan.toLowerCase().includes('status')) return 'bg-green-50 dark:bg-green-900/20';
    if (pesan.toLowerCase().includes('komentar') || pesan.toLowerCase().includes('balasan')) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-pink-50 dark:bg-pink-900/20';
  };

  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
           <div className="reveal-left">
              <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t.notif_title}</h1>
                 <span className="bg-[#2d5a1e] text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-green-900/20 uppercase tracking-widest">
                    {notifications.filter(n => !n.sudahDibaca).length} Baru
                 </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Update terbaru mengenai laporan dan akun Anda.</p>
           </div>
           <div className="flex items-center gap-3 reveal-right">
              <button onClick={markAllAsRead} className="bg-white dark:bg-gray-900 text-gray-500 hover:text-[#2d5a1e] border border-gray-100 dark:border-gray-800 px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
                <CheckCheck className="w-4 h-4" /> {t.notif_mark_all}
              </button>
              <button onClick={clearAll} className="bg-white dark:bg-gray-900 text-red-500 border border-gray-100 dark:border-gray-800 px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> {t.notif_clear_all}
              </button>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide reveal">
           {['Semua', 'Belum Dibaca'].map((label) => (
             <button
                key={label}
                onClick={() => setActiveFilter(label)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  activeFilter === label 
                    ? 'bg-[#2d5a1e] text-white border-[#2d5a1e] shadow-lg shadow-green-900/20' 
                    : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-[#2d5a1e] hover:text-[#2d5a1e]'
                }`}
             >
               {label}
             </button>
           ))}
           <button onClick={fetchNotifications} className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-[#2d5a1e]">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
           {isLoading ? (
             <p className="text-center py-20 text-gray-400">Memuat notifikasi...</p>
           ) : filteredNotifications.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Tidak ada notifikasi untuk ditampilkan</p>
             </div>
           ) : filteredNotifications.map((notif) => (
             <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`relative group bg-white dark:bg-gray-900 rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex gap-6 cursor-pointer overflow-hidden ${!notif.sudahDibaca ? 'border-l-4 border-l-[#2d5a1e]' : ''}`}
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getIconBg(notif.pesan)}`}>
                   {getIcon(notif.pesan)}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[#2d5a1e] transition-colors">Notifikasi Sistem</h3>
                   </div>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-12">{notif.pesan}</p>
                </div>
                <div className="text-right flex flex-col justify-between items-end shrink-0">
                   <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                   {!notif.sudahDibaca && (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                   )}
                </div>
             </div>
           ))}
        </div>

        {/* Real-time Status */}
        <div className="flex items-center justify-center gap-2 mt-10 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-900 w-max mx-auto px-6 py-3 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
           Connected to Live Feed
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationPage;
