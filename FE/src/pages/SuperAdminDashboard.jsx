import { useState, useEffect } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  Users, FileText, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Database, 
  Cpu, HardDrive, RefreshCw, Download,
  MoreHorizontal, ShieldCheck, XCircle,
  MapPin, Globe, Activity, Zap, AlertTriangle
} from 'lucide-react';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';


const SuperAdminDashboard = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [repRes, userRes, statsRes, actRes] = await Promise.all([
        api.get('/laporan?limit=100'),
        api.get('/users'),
        api.get('/statistik/super'),
        api.get('/activity-log?limit=4')
      ]);
      if (repRes.data.success) setReports(repRes.data.data);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (actRes.data.success) setActivities(actRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats_cards = [
    { label: t.super_dash_total_citizen, val: stats?.totalUsers || 0, trend: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t.super_dash_rep_national, val: stats?.totalReports || 0, trend: '+5%', icon: Globe, color: 'text-[#1a4d2e]', bg: 'bg-green-50' },
    { label: 'Spam Detected', val: stats?.spamCount || 0, trend: 'Critical', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: t.super_dash_sys_resp, val: `${stats?.avgResponseTime || 0}h`, trend: 'Fast', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' }
  ];


  const recentActivities = (activities || []).map(a => ({
    time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actor: a.user?.nama || 'System',
    type: a.aksi,
    detail: a.detail || 'No details',
    target: `ACT-${a.id}`,
    status: 'Sukses'
  }));

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t.super_dash_title}</h2>
              <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
           </div>

           <div className="flex items-center gap-3">
              <button onClick={fetchData} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all">
                 Refresh <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </div>

        {/* System Health Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 grid md:grid-cols-4 gap-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
           <div className="flex items-center gap-5 border-r border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-sm font-black text-gray-900 dark:text-white">{t.super_dash_active}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latency: {stats?.latency || 24}ms</p>
              </div>
           </div>

           <div className="flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.super_dash_node_uptime}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.systemUptime || 99.99}%</p>
           </div>

           <div className="flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Laporan Selesai</p>
              <p className="text-2xl font-black text-green-600 flex items-center gap-2">
                 {stats?.completedReports || 0} <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </p>
           </div>
           <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.super_dash_db_sync}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">Active</p>
           </div>

        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {stats_cards.map((s, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px] shadow-sm group hover:border-[#1a4d2e] transition-all">
                <div className="flex items-center justify-between mb-8">
                   <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-6 h-6" />
                   </div>
                   <MoreHorizontal className="text-gray-300" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{isLoading && !stats ? '...' : s.val}</h3>
                   <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {s.trend}
                   </p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Activity Log */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-10 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-10 px-2">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t.super_dash_audit_log}</h4>
                  <button className="bg-gray-50 dark:bg-gray-800 text-gray-400 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-[#1a4d2e] transition-all">{t.admin_dash_see_all}</button>
               </div>

              <div className="space-y-4">
                 {recentActivities.map((a, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl group hover:bg-white dark:hover:bg-gray-800 transition-all">
                      <div className="flex items-center gap-6">
                          <div className="text-center shrink-0">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.detail_info_date}</p>
                             <p className="text-sm font-black text-gray-900 dark:text-white">{a.time}</p>
                          </div>

                         <div className="w-10 h-10 rounded-full bg-[#1a4d2e] flex items-center justify-center text-xs font-black text-white shadow-sm">
                            {a.actor[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{a.actor} <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-2">{a.type}</span></p>
                            <p className="text-xs font-bold text-gray-400 truncate max-w-[300px]">{a.detail}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Target ID</p>
                         <p className="text-xs font-black text-gray-900 dark:text-white tracking-widest">{a.target}</p>
                      </div>
                   </div>
                 ))}
                 {recentActivities.length === 0 && <p className="text-center py-10 text-gray-400">Belum ada aktivitas terbaru</p>}
              </div>
           </div>

           {/* Server Stats */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-10 shadow-sm">
               <h4 className="text-xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">{t.admin_dash_effectiveness}</h4>

              <div className="space-y-8">
                 {[
                   { label: 'Selesai', value: stats?.distribution?.completed || 0, color: 'bg-green-500' },
                   { label: 'Proses', value: stats?.distribution?.inProgress || 0, color: 'bg-blue-500' },
                   { label: 'Pending', value: stats?.distribution?.pending || 0, color: 'bg-red-500' },
                 ].map((s, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                         <span className="text-gray-400">{s.label}</span>
                         <span className="text-gray-900 dark:text-white">{s.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                         <div className={`h-full ${s.color} transition-all duration-1000`} style={{ width: `${s.value}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
               <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[32px]">
                  <div className="flex items-center gap-4 mb-3">
                     <Activity className="w-5 h-5 text-green-500" />
                     <span className="text-xs font-black text-green-600 uppercase tracking-widest">Health Check</span>
                  </div>
                  <p className="text-[10px] font-bold text-green-400 leading-relaxed uppercase tracking-widest">{t.super_dash_health_good}</p>
               </div>

           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
