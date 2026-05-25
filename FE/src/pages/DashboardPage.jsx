import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
    PlusCircle, Clock, CheckCircle2, AlertCircle, 
    ChevronRight, Bell, MessageSquare, ArrowUpRight,
    Filter, LayoutGrid, List, MoreVertical, XCircle, Loader2
} from 'lucide-react';
import api from '../utils/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const { lang } = useSettings();
  const t = translations[lang];

  const [activeFilter, setActiveFilter] = useState('Semua');
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, proses: 0, selesai: 0 });

  useEffect(() => {
    fetchReports();
    fetchNotifications();
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchReports();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const res = await api.get(`/laporan?userId=${user?.id}`);
      if (res.data?.success) {
        const data = res.data.data;
        setReports(data);
        // Calculate stats from real data
        setStatsData({
          total: data.length,
          pending: data.filter(r => r.status === 'PENDING').length,
          proses: data.filter(r => r.status === 'PROSES').length,
          selesai: data.filter(r => r.status === 'SELESAI').length,
        });
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get('/notifikasi');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await api.put('/notifikasi/hide-all');
      if (res.data?.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const stats = [
    { label: t.dash_stat_total || 'Total Laporan', value: statsData.total.toString(), icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t.dash_stat_pending || 'Pending', value: statsData.pending.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: t.dash_stat_process || 'Diproses', value: statsData.proses.toString(), icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: t.dash_stat_success || 'Selesai', value: statsData.selesai.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const filters = [
    { id: 'Semua', label: t.dash_filter_all || 'Semua' },
    { id: 'PENDING', label: t.dash_filter_pending || 'Pending' },
    { id: 'PROSES', label: t.dash_filter_process || 'Diproses' },
    { id: 'SELESAI', label: t.dash_filter_success || 'Selesai' },
    { id: 'DITOLAK', label: t.dash_filter_rejected || 'Ditolak' },
  ];

  // Filter reports based on active filter
  const filteredReports = reports.filter(r => {
    if (activeFilter === 'Semua') return true;
    return r.status === activeFilter;
  });

  const latestReports = filteredReports.slice(0, 4);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SELESAI': return 'bg-green-500';
      case 'PROSES': return 'bg-indigo-500';
      case 'PENDING': return 'bg-amber-500';
      case 'DITOLAK': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SELESAI': return lang === 'ID' ? 'Selesai' : 'Completed';
      case 'PROSES': return lang === 'ID' ? 'Diproses' : 'Processing';
      case 'PENDING': return lang === 'ID' ? 'Pending' : 'Pending';
      case 'DITOLAK': return lang === 'ID' ? 'Ditolak' : 'Rejected';
      default: return status;
    }
  };

  const getNotifType = (pesan) => {
    if (pesan.includes('selesai') || pesan.includes('SELESAI')) return 'success';
    if (pesan.includes('proses') || pesan.includes('PROSES') || pesan.includes('diproses')) return 'info';
    return 'message';
  };

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'ID' ? 'Baru saja' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${lang === 'ID' ? 'menit lalu' : 'min ago'}`;
    if (diffHours < 24) return `${diffHours} ${lang === 'ID' ? 'jam lalu' : 'hours ago'}`;
    if (diffDays < 7) return `${diffDays} ${lang === 'ID' ? 'hari lalu' : 'days ago'}`;
    return date.toLocaleDateString('id-ID');
  };

  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[#f0fdf4] dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 rounded-[40px] p-8 md:p-12 border border-green-100/50 dark:border-gray-800 shadow-sm mb-10 reveal">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                {(t.dash_welcome || 'Selamat Datang, {name}! 👋').replace('{name}', user?.nama || '')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mb-8 leading-relaxed">
                {t.dash_subtitle || 'Pantau dan kelola semua laporan pengaduan Anda di satu tempat.'}
              </p>
              <Link 
                to="/buat-laporan"
                className="inline-flex items-center gap-3 bg-[#2d5a1e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#1e3f14] transition-all shadow-lg shadow-[#2d5a1e]/20 active:scale-[0.98]"
              >
                <PlusCircle className="w-5 h-5" /> {t.dash_btn_create || 'Buat Laporan Baru'}
              </Link>
            </div>
            <div className="w-48 h-48 md:w-64 md:h-64 relative reveal-scale delay-200">
               <div className="absolute inset-0 bg-[#2d5a1e]/10 dark:bg-green-500/10 rounded-full animate-pulse-slow"></div>
               <img 
                 src="/public/vektor-dashboard-masyarakat.png" 
                 alt="Illustration" 
                 className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
               />
            </div>
          </div>
          {/* Abstract patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2d5a1e]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#2d5a1e]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 group reveal-scale"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 reveal">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    activeFilter === f.id 
                      ? 'bg-[#2d5a1e] text-white shadow-md shadow-[#2d5a1e]/20' 
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-[#2d5a1e] hover:text-[#2d5a1e]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Reports Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white reveal-left">{t.dash_latest_title || 'Laporan Terbaru'}</h2>
                <Link to="/laporan" className="text-xs font-bold text-[#2d5a1e] dark:text-green-400 hover:underline flex items-center gap-1 reveal-right">
                  {t.dash_latest_all || 'Lihat Semua'} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {loadingReports ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2d5a1e]" />
                </div>
              ) : latestReports.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">{lang === 'ID' ? 'Belum ada laporan.' : 'No reports yet.'}</p>
                  <Link to="/buat-laporan" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#2d5a1e] hover:underline">
                    <PlusCircle className="w-4 h-4" /> {lang === 'ID' ? 'Buat Laporan Pertama' : 'Create First Report'}
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {latestReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group reveal delay-100"
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#2d5a1e]/10 to-[#2d5a1e]/5">
                        {report.fotos?.length > 0 ? (
                          <img 
                            src={`http://localhost:5000${report.fotos[0].url}`} 
                            alt={report.judul} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <LayoutGrid className="w-16 h-16 text-[#2d5a1e]/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-white shadow-lg ${getStatusColor(report.status)}`}>
                             {getStatusLabel(report.status)}
                           </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="text-[10px] font-bold bg-[#2d5a1e]/10 text-[#2d5a1e] px-2 py-0.5 rounded-md">{report.kategori}</span>
                           <span className="text-[10px] font-bold text-gray-400">#LPR-{report.id}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#2d5a1e] transition-colors line-clamp-1">{report.judul}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                          {report.deskripsi}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'ID' ? 'Lokasi' : 'Location'}</span>
                             <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{report.kota || report.alamat || '-'}</span>
                          </div>
                          <Link to={`/laporan/${report.id}`} className="text-xs font-bold text-[#2d5a1e] dark:text-green-400 flex items-center gap-1.5 hover:gap-2 transition-all">
                             {lang === 'ID' ? 'Lihat Detail' : 'View Detail'} <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 border border-[#2d5a1e]/5 dark:border-gray-800 rounded-[40px] p-8 shadow-sm reveal-right">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#2d5a1e]" /> {t.dash_notif_title || 'Notifikasi Terbaru'}
                </h2>
                {notifications.filter(n => !n.sudahDibaca).length > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>

              {loadingNotifs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-bold">{lang === 'ID' ? 'Tidak ada notifikasi' : 'No notifications'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="relative pl-6 pb-6 border-l border-gray-100 dark:border-gray-800 last:pb-0">
                      <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                        getNotifType(notif.pesan) === 'success' ? 'bg-green-500' : getNotifType(notif.pesan) === 'info' ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}></div>
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2 line-clamp-3">{notif.pesan}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <button 
                  onClick={handleClearNotifications}
                  className="w-full mt-8 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-[#2d5a1e] hover:text-white hover:border-[#2d5a1e] transition-all active:scale-[0.98]"
                >
                  {lang === 'ID' ? 'Bersihkan Semua Notifikasi' : 'Clear All Notifications'}
                </button>
              )}
            </div>

            {/* Quick Actions / Info */}
            <div className="bg-gradient-to-br from-[#2d5a1e] to-[#1e3f14] rounded-[40px] p-8 text-white shadow-xl shadow-[#2d5a1e]/20 reveal-right delay-200">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <PlusCircle className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-xl font-bold mb-3">{lang === 'ID' ? 'Butuh Bantuan?' : 'Need Help?'}</h3>
               <p className="text-green-100/80 text-sm mb-6 leading-relaxed">
                 {lang === 'ID' ? 'Punya pertanyaan seputar penggunaan aplikasi atau kendala pelaporan? Tim kami siap membantu Anda 24/7.' : 'Have questions about using the app or reporting issues? Our team is ready to help 24/7.'}
               </p>
               <Link to="/bantuan" className="block text-center bg-white text-[#2d5a1e] py-3 rounded-2xl text-sm font-bold hover:bg-green-50 transition-all active:scale-[0.98]">
                 {lang === 'ID' ? 'Buka Pusat Bantuan' : 'Open Help Center'}
               </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
