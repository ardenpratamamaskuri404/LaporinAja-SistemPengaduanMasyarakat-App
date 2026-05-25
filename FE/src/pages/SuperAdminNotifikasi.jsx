import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  Bell, Shield, Activity, Zap, 
  Settings, Trash2, CheckCheck, 
  ChevronRight, AlertTriangle, 
  Database, UserPlus, Globe, Loader
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotifications } from '../contexts/NotificationContext';

const SuperAdminNotifikasi = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('Terbaru');

  const filters = [
    { id: 'Semua', label: 'Semua Notifikasi' },
    { id: 'Belum Dibaca', label: 'Belum Dibaca' },
    { id: 'Sudah Dibaca', label: 'Sudah Dibaca' },
  ];

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    };
    loadNotifications();

    // Set up polling for real-time updates every 10 seconds
    const pollInterval = setInterval(async () => {
      await fetchNotifications();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...notifications];

    // Apply read/unread filter
    if (activeFilter === 'Belum Dibaca') {
      filtered = filtered.filter(n => !n.sudahDibaca);
    } else if (activeFilter === 'Sudah Dibaca') {
      filtered = filtered.filter(n => n.sudahDibaca);
    }

    // Apply sorting
    if (sortBy === 'Terbaru') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Terlama') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setDisplayedNotifications(filtered);
  }, [notifications, activeFilter, sortBy]);

  // Format time relative to now
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return notifDate.toLocaleDateString('id-ID');
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleNotifClick = (notif) => {
    handleMarkAsRead(notif.id);
    if (notif.laporanId) {
      navigate(`/laporan/${notif.laporanId}`);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle hide all notifications
  const handleHideAll = async () => {
    try {
      const response = await api.put('/notifikasi/hide-all');
      if (response.data.success) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error hiding notifications:', error);
    }
  };

  const sortOptions = ['Terbaru', 'Terlama'];

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Super Admin Notifikasi</h2>
              {unreadCount > 0 && (
                <span className="bg-[#1a4d2e] text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20">
                  {unreadCount} Belum Dibaca
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm font-medium">Pusat kendali informasi dan peringatan sistem tingkat tinggi untuk seluruh infrastruktur platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isLoading}
              className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-50 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" /> Tandai Semua
            </button>
            <button 
              onClick={handleHideAll}
              disabled={displayedNotifications.length === 0 || isLoading}
              className="bg-white dark:bg-gray-900 text-red-500 border border-gray-100 dark:border-gray-800 px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-red-50 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" /> Bersihkan
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeFilter === f.id 
                    ? 'bg-[#1a4d2e] text-white shadow-lg shadow-green-900/20' 
                    : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-100 dark:border-gray-800 hover:border-[#1a4d2e] hover:text-[#1a4d2e]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="relative group">
              <button className="text-xs font-bold text-gray-500 flex items-center gap-2">
                {sortBy}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`w-full text-left px-4 py-2 text-xs font-bold ${
                      sortBy === option
                        ? 'bg-[#1a4d2e] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && displayedNotifications.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-[#1a4d2e] animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayedNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">Tidak ada notifikasi</h3>
            <p className="text-gray-500 dark:text-gray-500">Semua notifikasi Anda sudah dibaca atau tidak ada notifikasi baru.</p>
          </div>
        )}

        {/* Notif List */}
        {!isLoading && displayedNotifications.length > 0 && (
          <div className="space-y-4 pb-20">
            {displayedNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`group relative flex gap-6 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden ${
                  !notif.sudahDibaca ? 'border-l-4 border-l-[#1a4d2e] bg-green-50/30 dark:bg-green-900/10' : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  !notif.sudahDibaca 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Bell className={`w-6 h-6 ${
                    !notif.sudahDibaca 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        !notif.sudahDibaca
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {notif.sudahDibaca ? 'Dibaca' : 'Belum Dibaca'}
                      </span>
                      <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-[#1a4d2e] transition-colors line-clamp-1">
                        {notif.pesan}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-4">{formatTime(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl line-clamp-2">
                    {notif.pesan}
                  </p>
                  {notif.laporanId && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[10px] font-black text-gray-300 tracking-wider uppercase">
                        Laporan ID: {notif.laporanId}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real-time Status Indicator */}
        <div className="fixed bottom-10 right-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 animate-bounce-slow">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Master Link: Active</span>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminNotifikasi;
