import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  User, Lock, Bell, Edit2, CheckCircle, 
  MapPin, Briefcase, Phone, Mail, 
  ChevronRight, ArrowRight, AlertCircle,
  Clock, Check, FileText, Camera, Trash2, X as CloseIcon, Languages
} from 'lucide-react';
import { useEffect } from 'react';


const ProfilePage = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [activeMenu, setActiveMenu] = useState('profil');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    no_telp: user?.no_telp || '',
    alamat: user?.alamat || '',
    pekerjaan: user?.pekerjaan || '',
    provinsi: user?.provinsi || '',
    kota: user?.kota || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    waNotif: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, selesai: 0, pending: 0 });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/users/activities');
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities');
    }
  };


  const handleInfoChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

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
        alert('Foto profil berhasil diperbarui');
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
        alert('Foto profil berhasil dihapus');
      }
    } catch (error) {
      alert('Gagal menghapus foto');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveInfo = async () => {
    try {
      setIsLoading(true);
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        updateUser(res.data.data);
        setIsEditing(false);
        alert('Profil berhasil diperbarui');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      nama: user?.nama || '',
      email: user?.email || '',
      no_telp: user?.no_telp || '',
      alamat: user?.alamat || '',
      pekerjaan: user?.pekerjaan || '',
      provinsi: user?.provinsi || '',
      kota: user?.kota || ''
    });
    setIsEditing(false);
  };


  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert('Konfirmasi password baru tidak cocok');
    }
    
    try {
      setIsLoading(true);
      const res = await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        alert('Password berhasil diperbarui');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: t.profile_tab_info },
    { id: 'password', label: t.profile_tab_password },
    { id: 'prefs', label: t.profile_tab_prefs },
    { id: 'activity', label: t.profile_tab_activity },
  ];

  const sidebarMenu = [
    { id: 'profil', icon: User, label: t.profile_menu_profile },
    { id: 'keamanan', icon: Lock, label: t.profile_menu_security },
    { id: 'notifikasi', icon: Bell, label: t.profile_menu_notif },
  ];

  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Profile Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center transition-colors">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="w-full h-full rounded-[32px] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-3xl font-black text-[#2d5a1e] dark:text-green-400 relative group transition-all duration-500 hover:shadow-[#2d5a1e]/20">
                    {user?.foto_profil ? (
                      <img src={`http://localhost:5000${user.foto_profil}`} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      user?.nama?.substring(0, 2).toUpperCase() || 'US'
                    )}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 gap-3">
                       <button onClick={() => fileInputRef.current.click()} className="p-2.5 bg-white/20 hover:bg-white/40 rounded-xl transition-all hover:scale-110" title={t.profile_change_photo}>
                          <Camera className="w-5 h-5 text-white" />
                       </button>
                       {user?.foto_profil && (
                         <button onClick={handleDeletePhoto} className="p-2.5 bg-red-500/40 hover:bg-red-500/60 rounded-xl transition-all hover:scale-110" title={t.profile_delete_photo}>
                            <Trash2 className="w-5 h-5 text-white" />
                         </button>
                       )}
                    </div>
                    {/* Action Buttons at bottom right */}
                    <div className="absolute bottom-1 right-1 flex gap-1 z-10">
                      {user?.foto_profil && (
                        <button 
                          onClick={handleDeletePhoto}
                          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 text-white transition-transform active:scale-90"
                          title={t.profile_delete_photo}
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-green-50 dark:border-gray-900 text-[#2d5a1e] dark:text-green-400 transition-transform active:scale-90"
                        title={t.profile_change_photo}
                      >
                         <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-[32px] flex items-center justify-center z-20">
                       <div className="w-6 h-6 border-4 border-[#2d5a1e] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
               </div>
               <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{user?.nama || 'User'}</h2>
               <p className="text-gray-400 text-xs font-bold mb-4">{user?.email}</p>
               <div className="bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 px-4 py-1.5 rounded-xl text-xs font-bold inline-block border border-green-100 dark:border-green-800">
                  {user?.role === 'MASYARAKAT' ? t.profile_active_citizen : user?.role}
               </div>
               <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> {t.profile_joined_since} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {month: 'long', year: 'numeric'}) : '-'}
               </p>

               <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{t.profile_stats_total}</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#2d5a1e] dark:text-green-400">{stats.selesai}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{t.profile_stats_resolved}</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-yellow-600">{stats.pending}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{t.profile_stats_pending}</p>
                  </div>
               </div>
            </div>

            {/* Sidebar Menu */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                {sidebarMenu.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id);
                      if (item.id === 'profil') setActiveTab('info');
                      if (item.id === 'keamanan') setActiveTab('password');
                      if (item.id === 'notifikasi') navigate('/notifikasi');
                    }}
                    className={`w-full flex items-center justify-between p-5 text-left transition-all group ${activeMenu === item.id ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeMenu === item.id ? 'bg-[#2d5a1e] text-white shadow-lg shadow-green-900/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-[#2d5a1e]'}`}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <span className={`text-sm font-bold ${activeMenu === item.id ? 'text-[#2d5a1e] dark:text-green-400' : 'text-gray-500'}`}>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-all ${activeMenu === item.id ? 'text-[#2d5a1e] translate-x-1' : 'text-gray-300 group-hover:text-gray-400'}`} />
                 </button>
               ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Form Section */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
               {/* Tabs */}
               <div className="flex flex-wrap gap-8 border-b border-gray-50 dark:border-gray-800 mb-10 overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#2d5a1e] dark:text-green-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <div className="flex items-center gap-2">
                        {tab.id === 'info' && <User className="w-4 h-4" />}
                        {tab.id === 'password' && <Lock className="w-4 h-4" />}
                        {tab.id === 'prefs' && <AlertCircle className="w-4 h-4" />}
                        {tab.id === 'activity' && <Clock className="w-4 h-4" />}
                        {tab.label}
                      </div>
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2d5a1e] rounded-t-full shadow-lg shadow-green-900/20"></div>}
                    </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="animate-fade-in">
                  {activeTab === 'info' && (
                    <div className="animate-fade-in">
                      <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">{t.profile_tab_info}</h3>
                        <p className="text-gray-400 text-sm">{t.reg_subtitle}</p>
                      </div>


                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_label_name}</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="text" name="nama" value={formData.nama} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all disabled:opacity-70" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_label_email}</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" name="email" value={formData.email} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl pl-12 pr-28 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all disabled:opacity-70" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-green-100 dark:border-green-800 flex items-center gap-1.5">
                               <CheckCircle className="w-3 h-3" /> {t.profile_verified}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_label_phone}</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="text" name="no_telp" value={formData.no_telp} onChange={handleInfoChange} disabled={!isEditing} placeholder="+62..." className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all disabled:opacity-70" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_label_job}</label>
                          <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="text" name="pekerjaan" value={formData.pekerjaan} onChange={handleInfoChange} disabled={!isEditing} placeholder="Pekerjaan..." className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all disabled:opacity-70" />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_label_address}</label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <textarea 
                              rows="3" 
                              name="alamat"
                              value={formData.alamat}
                              onChange={handleInfoChange}
                              disabled={!isEditing}
                              placeholder="Alamat lengkap..."
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all resize-none disabled:opacity-70"
                            ></textarea>

                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'password' && (
                    <div className="animate-fade-in max-w-xl">
                      <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">{t.profile_tab_password}</h3>
                        <p className="text-gray-400 text-sm">{lang === 'ID' ? 'Gunakan kombinasi password yang kuat untuk keamanan akun Anda.' : 'Use a strong password combination for your account security.'}</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_current_pass}</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_new_pass}</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.profile_confirm_pass}</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e]" />
                            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 dark:text-white focus:outline-none transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                   {activeTab === 'prefs' && (
                    <div className="animate-fade-in">
                      <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">{t.profile_tab_prefs}</h3>
                        <p className="text-gray-400 text-sm">{lang === 'ID' ? 'Sesuaikan pengaturan platform sesuai kenyamanan Anda.' : 'Customize platform settings according to your comfort.'}</p>
                      </div>

                      <div className="space-y-8">
                         <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                            <div>
                               <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t.profile_lang_app}</h4>
                               <p className="text-xs text-gray-400">{lang === 'ID' ? 'Pilih bahasa yang digunakan di seluruh platform.' : 'Choose the language used across the platform.'}</p>
                            </div>
                            <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                               <button onClick={() => lang !== 'ID' && useSettings().toggleLang()} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${lang === 'ID' ? 'bg-[#2d5a1e] text-white' : 'text-gray-400 hover:text-gray-600'}`}>Indonesia</button>
                               <button onClick={() => lang !== 'EN' && useSettings().toggleLang()} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${lang === 'EN' ? 'bg-[#2d5a1e] text-white' : 'text-gray-400 hover:text-gray-600'}`}>English</button>
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                            <div>
                               <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t.profile_notif_email}</h4>
                               <p className="text-xs text-gray-400">{lang === 'ID' ? 'Dapatkan update status laporan melalui email.' : 'Get report status updates via email.'}</p>
                            </div>
                            <button 
                               onClick={() => setPrefs({...prefs, emailNotif: !prefs.emailNotif})}
                               className={`w-12 h-6 rounded-full relative transition-all ${prefs.emailNotif ? 'bg-[#2d5a1e]' : 'bg-gray-200 dark:bg-gray-700'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.emailNotif ? 'right-1' : 'left-1'}`}></div>
                             </button>
                         </div>

                         <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                            <div>
                               <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{t.profile_notif_wa}</h4>
                               <p className="text-xs text-gray-400">{lang === 'ID' ? 'Dapatkan notifikasi instan melalui nomor WhatsApp Anda.' : 'Get instant notifications via your WhatsApp number.'}</p>
                            </div>
                            <button 
                               onClick={() => setPrefs({...prefs, waNotif: !prefs.waNotif})}
                               className={`w-12 h-6 rounded-full relative transition-all ${prefs.waNotif ? 'bg-[#2d5a1e]' : 'bg-gray-200 dark:bg-gray-700'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.waNotif ? 'right-1' : 'left-1'}`}></div>
                             </button>
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="animate-fade-in">
                      <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">{t.profile_tab_activity}</h3>
                        <p className="text-gray-400 text-sm">{lang === 'ID' ? 'Pantau riwayat aktivitas akun Anda di platform LaporinAja.' : 'Monitor your account activity history on LaporinAja platform.'}</p>
                      </div>

                      <div className="space-y-4">
                        {activities.length > 0 ? activities.map((act, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                               act.aksi.includes('CREATE') ? 'bg-green-50 text-green-500' :
                               act.aksi.includes('UPDATE') ? 'bg-blue-50 text-blue-500' :
                               act.aksi.includes('DELETE') ? 'bg-red-50 text-red-500' :
                               'bg-gray-50 text-gray-500'
                             }`}>
                                {act.aksi.includes('PROFILE') ? <User className="w-6 h-6" /> : 
                                 act.aksi.includes('LAPORAN') ? <FileText className="w-6 h-6" /> :
                                 <Clock className="w-6 h-6" />}
                             </div>
                             <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{act.aksi.replace(/_/g, ' ')}</h4>
                                <p className="text-xs text-gray-400">{act.detail}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(act.createdAt).toLocaleDateString()}</p>
                                <p className="text-[9px] text-gray-300">{new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                          </div>
                        )) : (
                          <div className="text-center py-12">
                             <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                             <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t.profile_no_activity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-50 dark:border-gray-800">
                    {activeTab === 'info' && (
                      !isEditing ? (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> {t.profile_btn_edit}
                        </button>
                      ) : (
                        <>
                          <button onClick={handleCancelEdit} className="px-10 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-700">
                            {t.profile_btn_cancel}
                          </button>
                          <button onClick={handleSaveInfo} disabled={isLoading} className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50">
                            <Check className="w-4 h-4" /> {isLoading ? (lang === 'ID' ? 'Menyimpan...' : 'Saving...') : t.profile_btn_save}
                          </button>
                        </>
                      )
                    )}
                    {activeTab === 'password' && (
                      <button onClick={handleUpdatePassword} disabled={isLoading || !passwordData.newPassword} className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50">
                        <Check className="w-4 h-4" /> {isLoading ? (lang === 'ID' ? 'Menyimpan...' : 'Saving...') : t.profile_update_pass}
                      </button>
                    )}
                  </div>

               </div>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-12 gap-8">
               {/* CTA Card */}
               <div className="md:col-span-12 bg-[#2d5a1e] dark:bg-green-950 rounded-[32px] p-8 shadow-sm text-white relative overflow-hidden flex flex-col justify-between group transition-colors">
                  <div className="relative z-10">
                     <h3 className="text-xl font-extrabold tracking-tight mb-3 pr-8">{t.profile_cta_title}</h3>
                     <p className="text-green-100 dark:text-green-400/80 text-xs leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                       {t.profile_cta_desc}
                     </p>
                  </div>
                  <Link to="/buat-laporan" className="relative z-10 w-fit bg-white text-[#2d5a1e] px-6 py-3 rounded-xl text-xs font-bold mt-8 flex items-center gap-2 hover:bg-green-50 transition-all shadow-xl shadow-black/20">
                     {t.dash_btn_create} <ArrowRight className="w-4 h-4" />
                  </Link>
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-4 right-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <User className="w-24 h-24" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
