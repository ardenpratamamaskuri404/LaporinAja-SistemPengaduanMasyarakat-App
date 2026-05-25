import { useState, useEffect } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  Activity, Search, Download, 
  Filter, Calendar, Clock, 
  ArrowRight, Shield, User, 
  LogIn, CheckCircle, XCircle, 
  Database, Settings, FileText,
  ChevronDown
} from 'lucide-react';
import api from '../utils/api';

const SuperAdminLog = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    uniqueActors: 0,
    todayActivities: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    actor: '',
    action: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...(filters.actor && { actor: filters.actor }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });

      const [response, statsRes] = await Promise.all([
        api.get(`/activity-log?${params}`),
        api.get('/activity-log/stats')
      ]);

      if (statsRes.data.success) {
        const s = statsRes.data.data;
        // Find today's activities manually if backend doesn't return todayActivities
        // But backend just returns totalActivities. Let's see if we can just use totalActivities.
        setStats({
          totalActivities: s.totalActivities || 0,
          uniqueActors: s.uniqueActors || 0,
          todayActivities: s.todayActivities || 0
        });
      }

      if (response.data.success) {
        // Group logs by date
        const grouped = {};
        response.data.data.forEach(log => {
          const date = new Date(log.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(log);
        });
        setLogs(grouped);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('LOGIN')) return LogIn;
    if (action.includes('APPROVE') || action.includes('UPDATE')) return CheckCircle;
    if (action.includes('FAIL') || action.includes('ERROR')) return XCircle;
    if (action.includes('CONFIG')) return Settings;
    return Activity;
  };

  const getActionStyle = (action) => {
    if (action.includes('LOGIN')) return 'bg-green-50 text-green-600';
    if (action.includes('APPROVE') || action.includes('UPDATE')) return 'bg-green-100 text-[#1a4d2e]';
    if (action.includes('FAIL') || action.includes('ERROR')) return 'bg-red-50 text-red-600';
    if (action.includes('CONFIG')) return 'bg-blue-50 text-blue-600';
    return 'bg-blue-50 text-blue-600';
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Log Aktivitas</h2>
              <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
           </div>
           <div className="flex items-center gap-3">
              <button className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                 <Download className="w-4 h-4" /> Ekspor CSV
              </button>
              <button className="bg-green-100 text-[#1a4d2e] border border-green-200 px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-[#1a4d2e] hover:text-white transition-all shadow-sm">
                 <Download className="w-4 h-4" /> Ekspor Excel
              </button>
           </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Hari Ini (Terbaru)', val: stats.todayActivities, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
             { label: 'Aktor Aktif', val: stats.uniqueActors, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: 'Total Aktivitas', val: stats.totalActivities, icon: Activity, color: 'text-red-500', bg: 'bg-red-50' }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px] shadow-sm flex items-center gap-6 group hover:border-[#1a4d2e] transition-all">
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

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm flex flex-col lg:flex-row gap-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e]" />
              <input 
                type="text" 
                placeholder="Cari aktor atau detail..." 
                value={filters.search}
                onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1); }}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none transition-all shadow-sm"
              />
           </div>
           <div className="flex flex-wrap items-center gap-4">
              <div className="relative cursor-pointer">
                 <select 
                   value={filters.actor}
                   onChange={(e) => { setFilters({...filters, actor: e.target.value}); setPage(1); }}
                   className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl pl-6 pr-12 py-4 text-sm font-bold appearance-none outline-none shadow-sm"
                 >
                    <option value="">Semua Aktor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <div className="relative cursor-pointer">
                 <select 
                   value={filters.action}
                   onChange={(e) => { setFilters({...filters, action: e.target.value}); setPage(1); }}
                   className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl pl-6 pr-12 py-4 text-sm font-bold appearance-none outline-none shadow-sm"
                 >
                    <option value="">Semua Aksi</option>
                    <option value="LOGIN">Login</option>
                    <option value="UPDATE">Update</option>
                    <option value="CREATE">Create</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
           </div>
        </div>

        {/* Logs Timeline */}
        <div className="space-y-12">
           {isLoading ? (
             <p className="text-center py-10 text-gray-400">Memuat data...</p>
           ) : Object.keys(logs).length === 0 ? (
             <p className="text-center py-10 text-gray-400">Belum ada aktivitas</p>
           ) : Object.entries(logs).map(([date, items]) => (
             <div key={date} className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[2px] bg-gray-100 dark:bg-gray-800 flex-1"></div>
                   <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-900 px-4 py-1 rounded-full border border-gray-100 dark:border-gray-800">{date}</h5>
                   <div className="h-[2px] bg-gray-100 dark:bg-gray-800 flex-1"></div>
                </div>
                <div className="space-y-4">
                   {items.map((log, idx) => {
                     const IconComponent = getActionIcon(log.aksi);
                     const style = getActionStyle(log.aksi);
                     return (
                       <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm hover:border-[#1a4d2e] transition-all group overflow-hidden relative">
                          <div className="flex items-center gap-6 relative z-10">
                             <div className={`w-14 h-14 rounded-2xl ${style} flex items-center justify-center shrink-0`}>
                                <IconComponent className="w-7 h-7" />
                             </div>
                             <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                   <p className="text-base font-black text-gray-900 dark:text-white">
                                      {log.user?.nama || 'System'} <span className="text-gray-400 font-bold text-sm ml-1">({log.user?.role || 'System'})</span>
                                   </p>
                                   <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${style}`}>
                                      {log.aksi}
                                   </span>
                                </div>
                                <p className="text-sm font-bold text-gray-500 leading-relaxed">{log.detail || 'No details'}</p>
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-2.5 rounded-xl flex flex-wrap items-center gap-x-8 gap-y-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID:</span>
                                      <span className="text-[11px] font-black text-gray-900 dark:text-white tracking-widest">{log.id}</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Waktu:</span>
                                      <span className="text-[11px] font-black text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
           ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminLog;
