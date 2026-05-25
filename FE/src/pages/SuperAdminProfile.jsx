import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  User, Mail, Phone, 
  Shield, MapPin, Calendar, 
  Edit2, Camera, CheckCircle2, 
  Clock, Activity, ArrowLeft, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';


const SuperAdminProfile = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const navigate = useNavigate();
  const { user } = useAuth();


  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { updateUser } = useAuth();
  
  const [saStats, setSaStats] = useState({
    systemUptime: 99.9,
    avgResponseTime: 0,
    totalReports: 0
  });

  useEffect(() => {
    fetchStats();
    // Real-time polling every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/statistik/super');
      if (res.data.success) {
        setSaStats({
          systemUptime: res.data.data.systemUptime || 99.9,
          avgResponseTime: res.data.data.avgResponseTime || 0,
          totalReports: res.data.data.totalReports || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch super admin stats', error);
    }
  };

  const stats = [
    { label: t.profile_stats_verified, value: (saStats.totalReports || 0).toLocaleString(), icon: CheckCircle2, color: 'text-[#1a4d2e]', bg: 'bg-[#1a4d2e]/10' },
    { label: t.profile_stats_avg_resp, value: `${saStats.avgResponseTime || 0} ${lang === 'ID' ? 'Jam' : 'Hours'}`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: lang === 'ID' ? 'Uptime Server' : 'Server Uptime', value: `${saStats.systemUptime || 99.9}%`, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('foto', file);

    try {
      setIsLoading(true);
      const res = await api.put('/users/profile', data);
      if (res.data.success) {
        updateUser(res.data.data);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Hapus foto profil?')) return;
    try {
      setIsLoading(true);
      const res = await api.put('/users/profile', { deletePhoto: 'true' });
      if (res.data.success) {
        updateUser(res.data.data);
      }
    } catch (error) {
      alert('Gagal menghapus foto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-8 pb-20">
        {/* Header with Back Button */}
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate(-1)}
             className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#1a4d2e] transition-all shadow-sm"
           >
              <ArrowLeft className="w-6 h-6" />
           </button>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Super Admin &gt; Profile</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.profile_full_profile}</h2>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Left: Profile Card */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-[48px] p-10 shadow-sm border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#1a4d2e] to-green-800 opacity-10"></div>
                 
                 <div className="relative mt-8 mb-8">
                    <div className="w-40 h-40 mx-auto rounded-[48px] overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl relative group bg-green-50 flex items-center justify-center text-5xl font-black text-[#1a4d2e]">
                       {user?.foto_profil ? (
                         <img 
                           src={`http://localhost:5000${user.foto_profil}`} 
                           alt="Admin Profile" 
                           className="w-full h-full object-cover transition-transform group-hover:scale-110"
                         />
                       ) : (
                         user?.nama?.substring(0, 2).toUpperCase() || 'SA'
                       )}
                       <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 gap-3">
                          <button onClick={() => fileInputRef.current.click()} className="p-2.5 bg-white/20 hover:bg-white/40 rounded-xl transition-all hover:scale-110" title={t.profile_change_photo}>
                             <Camera className="w-5 h-5 text-white" />
                          </button>
                          {user?.foto_profil && (
                            <button onClick={handleDeletePhoto} className="p-2.5 bg-red-500/40 hover:bg-red-500/60 rounded-xl transition-all hover:scale-110" title={t.profile_delete_photo}>
                               <Trash2 className="w-5 h-5 text-white" />
                            </button>
                          )}
                       </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex gap-2 z-10">
                       {user?.foto_profil && (
                         <button 
                           onClick={handleDeletePhoto}
                           className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-4 border-white dark:border-gray-900 active:scale-90"
                           title={t.profile_delete_photo}
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                       <button 
                         onClick={() => fileInputRef.current.click()}
                         className="w-10 h-10 bg-white text-[#1a4d2e] rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-all border-4 border-white dark:border-gray-900 active:scale-90"
                         title={t.profile_change_photo}
                       >
                          <Camera className="w-5 h-5" />
                       </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                    {isLoading && (
                       <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-[48px] flex items-center justify-center z-20">
                          <div className="w-8 h-8 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                       </div>
                    )}
                    <div className="absolute bottom-2 right-1/2 translate-x-16 w-10 h-10 bg-[#1a4d2e] rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-lg">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                 </div>

                 <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{user?.nama || 'Super Admin'}</h3>
                 <p className="text-sm font-bold text-[#1a4d2e] dark:text-green-400 uppercase tracking-widest mb-6">Super Administrator</p>
                 
                 <div className="flex justify-center gap-3">
                    <button onClick={() => navigate('/superadmin/pengaturan')} className="bg-[#1a4d2e] text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-green-900/20 hover:bg-[#123620] transition-all active:scale-95">
                       {t.profile_btn_edit}
                    </button>
                 </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center">{t.profile_health_check}</h4>
                 <div className="space-y-6">
                    {stats.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                               <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{item.label}</span>
                         </div>
                         <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Detailed Info */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-[48px] p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                 <h4 className="text-lg font-black text-gray-900 dark:text-white mb-10 flex items-center gap-3">
                    <User className="w-5 h-5 text-[#1a4d2e]" /> {t.profile_tab_info}
                 </h4>
                 
                 <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_label_name}</p>
                       <p className="text-base font-bold text-gray-800 dark:text-gray-200">{user?.nama}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_emp_id}</p>
                       <p className="text-base font-bold text-gray-800 dark:text-gray-200">SA-{user?.id?.toString().padStart(4, '0')}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_sys_email}</p>
                       <p className="text-base font-bold text-gray-800 dark:text-gray-200">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_emergency}</p>
                       <p className="text-base font-bold text-gray-800 dark:text-gray-200">{user?.no_telp || '-'}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_access_auth}</p>
                       <p className="text-base font-bold text-gray-800 dark:text-gray-200">{lang === 'ID' ? 'Manajemen Pengguna, Konfigurasi Sistem, Akses Data Global' : 'User Management, System Configuration, Global Data Access'}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.profile_server_loc}</p>
                       <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                          <p className="text-sm font-bold text-gray-500 leading-relaxed">{user?.alamat || '-'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                       <Calendar className="w-4 h-4 text-blue-500" /> {t.profile_joined_date}
                    </h4>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-gray-800 dark:text-white">
                         {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                       </p>
                       <p className="text-xs font-bold text-gray-400">{t.profile_sys_root}</p>
                    </div>
                 </div>
                 <div className="bg-[#1a4d2e] rounded-[40px] p-8 shadow-2xl shadow-green-900/20 relative overflow-hidden group">
                    <div className="relative z-10 text-white">
                       <h4 className="text-sm font-black mb-4 uppercase tracking-widest opacity-80">{t.profile_security_perm}</h4>
                       <p className="text-3xl font-black mb-2">{t.profile_highest}</p>
                       <p className="text-xs font-bold text-green-100 opacity-60 italic">{t.profile_bypass}</p>
                    </div>
                    <Shield className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminProfile;
