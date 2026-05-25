import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  TrendingUp, TrendingDown, Clock, 
  CheckCircle, Users, FileText, 
  ChevronRight, ArrowUpRight, 
  Plus, Download, AlertTriangle,
  MapPin, RefreshCw, Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';


const AdminDashboard = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const [repRes, userRes, statsRes] = await Promise.all([
        api.get('/laporan?limit=100'),
        api.get('/users'),
        api.get('/statistik/admin').catch(() => ({ data: { success: false } }))
      ]);
      if (repRes.data.success) setReports(repRes.data.data || []);
      if (userRes.data.success) setUsers(userRes.data.data || []);
      if (statsRes.data.success) {
        // Use server-side stats if available
        const s = statsRes.data.data;
        setServerStats(s);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate statistics (use server stats if available, fallback to client-side)
  const totalReports = serverStats?.total ?? reports.length;
  const pendingReports = serverStats?.pending ?? reports.filter(r => r.status === 'PENDING').length;
  const completedReports = serverStats?.completed ?? reports.filter(r => r.status === 'SELESAI').length;
  const inProgressReports = serverStats?.inProgress ?? reports.filter(r => r.status === 'PROSES').length;
  const rejectedReports = serverStats?.rejected ?? reports.filter(r => r.status === 'DITOLAK').length;
  const completionRate = serverStats?.completionRate ?? (totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0);
  const avgResponseTime = serverStats?.avgResponseTime ?? 0;

  const stats = [
    { label: t.admin_dash_rep_wilayah || 'Total Laporan', value: totalReports.toString(), trend: t.trend_global || 'Global', up: true, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.admin_dash_unresponded || 'Pending', value: pendingReports.toString(), trend: t.trend_important || 'Important', up: false, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t.admin_dash_completed || 'Selesai', value: completedReports.toString(), trend: t.trend_success || 'Success', up: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t.admin_dash_total_user || 'Total User', value: users.length.toLocaleString(), trend: t.trend_database || 'Database', up: true, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentReports = reports.slice(0, 5);

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Region Banner */}
        <div className="bg-[#2d5a1e] text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-green-900/10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <MapPin className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black tracking-tight">{t.admin_dash_control || 'Admin Control Panel'}</h3>
                 <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{t.admin_dash_area || 'Wilayah Anda'}</p>
              </div>

           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={fetchData} 
                disabled={isRefreshing}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                Refresh <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link to="/admin/laporan" className="bg-white text-[#2d5a1e] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-gray-100">{t.nav_my_reports || 'Kelola Laporan'}</Link>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.map((stat, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                   <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-gray-800 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                   </div>
                   <div className={`text-[10px] font-black uppercase tracking-widest ${stat.up ? 'text-green-500' : 'text-orange-500'}`}>
                      {stat.trend}
                   </div>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {isLoading ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : (
                    stat.value
                  )}
                </h3>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Recent Reports Table */}
           <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-8 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                 <h3 className="text-xl font-black text-gray-900 dark:text-white">{t.admin_dash_recent}</h3>
                 <Link to="/admin/laporan" className="text-xs font-black text-[#2d5a1e] uppercase hover:underline">{t.admin_dash_see_all}</Link>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">
                          <th className="px-8 py-4">{t.report_label_title}</th>
                          <th className="px-8 py-4">{t.detail_info_reporter}</th>
                          <th className="px-8 py-4">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                       {recentReports.map((report, i) => (
                         <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-8 py-6">
                               <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{report.judul}</p>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{report.kategori}</p>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-gray-500">{report.user?.nama || 'Warga'}</td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${report.status === 'SELESAI' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                  {report.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                       {recentReports.length === 0 && (
                         <tr><td colSpan="3" className="px-8 py-10 text-center text-gray-400">Belum ada laporan masuk</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Quick Stats Distribution */}
           <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">{t.admin_dash_effectiveness || 'Distribusi Status Laporan'}</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Selesai', value: completionRate, color: 'bg-[#2d5a1e]' },
                   { label: 'Proses', value: totalReports ? Math.round((inProgressReports / totalReports) * 100) : 0, color: 'bg-blue-400' },
                   { label: 'Pending', value: totalReports ? Math.round((pendingReports / totalReports) * 100) : 0, color: 'bg-orange-400' },
                   { label: 'Ditolak', value: totalReports ? Math.round((rejectedReports / totalReports) * 100) : 0, color: 'bg-red-400' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                         <span className="text-gray-400">{item.label}</span>
                         <span className="text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-500 ${item.color}`} style={{ width: `${item.value}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Info</p>
                 <p className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-relaxed">
                   {t.admin_dash_notice || `Data dashboard diperbarui secara otomatis setiap 30 detik. Tingkat penyelesaian: ${completionRate}%`}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
