import { useState, useEffect } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  BarChart3, TrendingUp, TrendingDown, 
  Download, Calendar, MapPin, 
  Layers, Clock, CheckCircle2, 
  XCircle, Filter, Globe, 
  Zap, Activity, ShieldCheck
} from 'lucide-react';
import api from '../utils/api';

const SuperAdminStatistik = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [urgencyData, setUrgencyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, monthlyRes, categoryRes, regionalRes, urgencyRes] = await Promise.all([
        api.get('/statistik/super'),
        api.get(`/statistik/trend/monthly?year=${selectedYear}`),
        api.get('/statistik/distribution/category'),
        api.get('/statistik/distribution/regional'),
        api.get('/statistik/distribution/urgency')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (monthlyRes.data.success) setMonthlyData(monthlyRes.data.data);
      if (categoryRes.data.success) setCategoryData(categoryRes.data.data);
      if (regionalRes.data.success) setRegionalData(regionalRes.data.data);
      if (urgencyRes.data.success) setUrgencyData(urgencyRes.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Statistik Global</h2>
                 <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Analisa data platform real-time dari seluruh wilayah di Indonesia.</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95 shadow-sm uppercase tracking-widest">
                 <Download className="w-5 h-5" /> Export BI Report
              </button>
           </div>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Uptime Platform', value: `${stats?.systemUptime || 0}%`, trend: 'Stabil', icon: ShieldCheck, color: 'text-[#1a4d2e]', bg: 'bg-green-50' },
             { label: 'Total Laporan Nasional', value: stats?.totalReports || 0, trend: '+12.5%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Admin Wilayah Aktif', value: stats?.totalAdmins || 0, trend: '34 Prov', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' }
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-[#1a4d2e] transition-all">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                   <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{isLoading ? '...' : stat.value}</h3>
                   <div className={`text-[10px] font-black uppercase flex items-center gap-2 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}>
                      <TrendingUp className="w-4 h-4" />
                      {stat.trend} <span className="text-gray-300">Vs Bulan Lalu</span>
                   </div>
                </div>
                <div className={`w-20 h-20 rounded-3xl ${stat.bg} dark:bg-gray-800 flex items-center justify-center`}>
                   <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
             </div>
           ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-12 gap-8">
           {/* Growth Chart */}
           <div className="lg:col-span-8 bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-12 px-4">
                 <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Traffic Laporan Nasional</h4>
                 <div className="flex bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl gap-2">
                    {[2024, 2025, 2026].map(year => (
                      <button 
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-6 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${selectedYear === year ? 'bg-[#1a4d2e] text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {year}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="h-72 flex items-end gap-5 px-4 relative">
                 <div className="absolute inset-0 flex flex-col justify-between px-4 pb-14 opacity-10">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="border-t border-gray-400 w-full h-0"></div>)}
                 </div>
                 {monthlyData.map((data, i) => {
                   const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
                   const height = (data.count / maxCount) * 100;
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative z-10">
                        <div className="relative w-full h-56 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl overflow-hidden group-hover:bg-gray-100 transition-colors">
                           <div 
                             className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a4d2e] to-green-400 rounded-2xl transition-all duration-1000 delay-150 group-hover:from-green-600 shadow-lg"
                             style={{ height: `${height}%` }}
                           ></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-[#1a4d2e] transition-colors">{['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][i]}</span>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Distribution */}
           <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-12 tracking-tight">Beban Regional</h4>
              <div className="space-y-10 flex-1">
                 {regionalData.map((reg, i) => (
                   <div key={i} className="space-y-3 group">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                         <span className="text-gray-400 group-hover:text-gray-600 transition-colors">{reg.kota}</span>
                         <span className="text-gray-900 dark:text-white">{reg.count} <span className="text-gray-300 font-bold ml-1">Reports</span></span>
                      </div>
                      <div className="h-3 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                         <div 
                           className="h-full bg-[#1a4d2e] rounded-full transition-all duration-1000 delay-500 shadow-lg"
                           style={{ width: `${(reg.count / Math.max(...regionalData.map(r => r.count), 1)) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Deep Insights */}
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 group hover:border-[#1a4d2e] transition-all">
              <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                 <Zap className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Puncak Aktivitas</h4>
                 <div className="space-y-6">
                    {[
                      { time: '09:00 - 11:00', load: 'Tinggi', color: 'text-red-500' },
                      { time: '14:00 - 16:00', load: 'Sedang', color: 'text-orange-500' },
                      { time: '20:00 - 22:00', load: 'Rendah', color: 'text-green-500' }
                    ].map((t, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                         <span className="text-sm font-bold text-gray-500">{t.time}</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${t.color}`}>{t.load}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 group hover:border-blue-500 transition-all">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Globe className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Device Usage</h4>
                 <div className="space-y-8">
                    {[
                      { label: 'Mobile App', val: 78, color: 'bg-blue-500' },
                      { label: 'Web Browser', val: 22, color: 'bg-blue-200' }
                    ].map((d, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-gray-400">{d.label}</span>
                            <span className="text-gray-900 dark:text-white">{d.val}%</span>
                         </div>
                         <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${d.color}`} style={{ width: `${d.val}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-[#1a4d2e] p-10 rounded-[48px] shadow-2xl shadow-green-900/40 relative overflow-hidden flex flex-col justify-between group">
              <div className="relative z-10 text-white">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                    <Download className="w-6 h-6" />
                 </div>
                 <h4 className="text-3xl font-black mb-6 leading-tight group-hover:translate-x-2 transition-transform">Platform BI <br/> Analytics</h4>
                 <p className="text-sm text-green-100/70 font-medium leading-relaxed">Dapatkan analisa mendalam dan prediksi tren untuk perencanaan pembangunan nasional tahun depan.</p>
              </div>
              <button className="relative z-10 w-full bg-white text-[#1a4d2e] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-green-50 transition-all shadow-xl active:scale-95 mt-10">
                 Cetak Laporan Global
              </button>
              <BarChart3 className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminStatistik;
