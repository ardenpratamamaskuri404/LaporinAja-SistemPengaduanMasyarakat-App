import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Activity, Clock, User, 
  Search, Filter, ChevronLeft, 
  ChevronRight, Database, Shield,
  FileText, RotateCcw, LogIn,
  Calendar, CheckCircle, XCircle, Settings,
  ChevronDown, RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';

const AdminLog = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    uniqueActors: 0,
    todayActivities: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    date: ''
  });

  useEffect(() => {
    fetchData();
    // Real-time polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [page, filters.date]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(filters.date && { startDate: filters.date, endDate: filters.date }),
        ...(filters.search && { search: filters.search })
      });

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/activity-log?${params}`),
        api.get('/activity-log/stats')
      ]);

      if (logsRes.data.success) {
        setLogs(logsRes.data.data);
        setTotalPages(logsRes.data.pagination.pages);
        setTotalCount(logsRes.data.pagination.total);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData();
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('LOGIN')) return LogIn;
    if (action.includes('UPDATE') || action.includes('APPROVE') || action.includes('SELESAI')) return CheckCircle;
    if (action.includes('DITOLAK') || action.includes('DELETE') || action.includes('HAPUS')) return XCircle;
    if (action.includes('PENGATURAN') || action.includes('CONFIG')) return Settings;
    return Activity;
  };

  const getActionStyle = (action) => {
    if (action.includes('LOGIN')) return 'bg-green-50 text-green-600';
    if (action.includes('UPDATE') || action.includes('APPROVE') || action.includes('SELESAI')) return 'bg-blue-50 text-blue-600';
    if (action.includes('DITOLAK') || action.includes('DELETE') || action.includes('HAPUS')) return 'bg-red-50 text-red-600';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Admin &gt; Log Aktivitas</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Jejak Audit Sistem</h2>
              <p className="text-sm text-gray-400 mt-2">Rekaman seluruh aktivitas yang terjadi di dalam platform LaporinAja.</p>
           </div>
           <button 
             onClick={fetchData}
             className="flex items-center gap-2 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-black uppercase tracking-widest hover:text-[#2d5a1e] transition-all"
           >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> {lang === 'ID' ? 'Segarkan' : 'Refresh'}
           </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: lang === 'ID' ? 'Hari Ini (Terbaru)' : 'Today (Latest)', val: stats.todayActivities, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
             { label: lang === 'ID' ? 'Aktor Aktif' : 'Active Actors', val: stats.uniqueActors, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: lang === 'ID' ? 'Total Aktivitas' : 'Total Activities', val: stats.totalActivities, icon: Activity, color: 'text-red-500', bg: 'bg-red-50' }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px] shadow-sm flex items-center gap-6 group hover:border-[#2d5a1e] transition-all">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                   <s.icon className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <h3 className="text-4xl font-black text-gray-900 dark:text-white">{s.val}</h3>
                </div>
             </div>
           ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6">
           <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder={lang === 'ID' ? 'Cari berdasarkan aksi, user, atau deskripsi...' : 'Search by action, user, or description...'}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                onKeyDown={handleSearch}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none transition-all" 
              />
           </div>
           <div className="flex gap-4">
              <input 
                type="date" 
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl px-6 py-3.5 text-sm font-bold text-gray-500" 
              />
           </div>
        </div>

        {/* Timeline Table */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden pb-10">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-8 py-6">{lang === 'ID' ? 'Aktivitas' : 'Activity'}</th>
                       <th className="px-8 py-6">{lang === 'ID' ? 'Deskripsi Kejadian' : 'Incident Description'}</th>
                       <th className="px-8 py-6">{lang === 'ID' ? 'Aktor / Pengguna' : 'Actor / User'}</th>
                       <th className="px-8 py-6 text-right">{lang === 'ID' ? 'Waktu & Tanggal' : 'Time & Date'}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="4" className="px-8 py-10 text-center text-gray-400">{lang === 'ID' ? 'Memuat data...' : 'Loading data...'}</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan="4" className="px-8 py-10 text-center text-gray-400">{lang === 'ID' ? 'Tidak ada data log' : 'No log data'}</td></tr>
                    ) : logs.map((log) => {
                      const Icon = getActionIcon(log.aksi);
                      const style = getActionStyle(log.aksi);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl ${style} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5" />
                                 </div>
                                 <span className="text-sm font-black text-gray-900 dark:text-white">{log.aksi}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">{log.detail}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-400" />
                                 </div>
                                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{log.user?.nama || 'System'}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right whitespace-nowrap">
                              <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(log.createdAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>

           {/* Table Footer */}
           <div className="mt-10 px-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                 <Database className="w-4 h-4" />
                 {lang === 'ID' ? `Total ${totalCount.toLocaleString()} log tersimpan.` : `Total ${totalCount.toLocaleString()} logs stored.`}
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   disabled={page === 1}
                   className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 <button className="px-4 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                   {lang === 'ID' ? `Halaman ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}
                 </button>
                 <button 
                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   disabled={page === totalPages}
                   className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLog;
