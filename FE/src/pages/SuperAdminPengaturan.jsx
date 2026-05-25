import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  User, Lock, Settings, Edit2, LogOut, 
  Check, Mail, Phone, Shield, MapPin, 
  Globe, Bell, ChevronDown, Camera, Trash2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';


const SuperAdminPengaturan = () => {
  const { lang, toggleLang } = useSettings();
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  const [prefs, setPrefs] = useState({
    emailNotif: true,
    pushNotif: false
  });


  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    no_telp: user?.no_telp || '',
    alamat: user?.alamat || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saStats, setSaStats] = useState({
    totalReports: 0,
    avgResponseTime: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/statistics/super');
      if (res.data.success) {
        setSaStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch super admin stats:', error);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const resetForm = () => {
    setFormData({
      nama: user?.nama || '',
      email: user?.email || '',
      no_telp: user?.no_telp || '',
      alamat: user?.alamat || '',
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
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
        showSuccess('Profil berhasil diperbarui');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError('Konfirmasi password baru tidak cocok');
    }
    
    try {
      setIsLoading(true);
      const res = await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        showSuccess('Password berhasil diperbarui');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Super Admin &gt; Pengaturan</p>
           <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan Akun</h2>
        </div>

        {/* Toast Messages */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-2xl text-sm font-bold">
            <Check className="w-5 h-5 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold">
            <Shield className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Sidebar Card */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-[40px] p-10 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                 <div className="relative w-32 h-32 mx-auto mb-8 group">
                    {user?.foto_profil ? (
                      <img src={`http://localhost:5000${user.foto_profil}`} alt="Profile" className="w-full h-full rounded-[40px] object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-[40px] bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-4xl font-black text-[#1a4d2e]">
                         {user?.nama?.substring(0, 2).toUpperCase() || 'SA'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => fileInputRef.current.click()} className="w-10 h-10 bg-white text-[#1a4d2e] rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors">
                          <Camera className="w-5 h-5" />
                       </button>
                       {user?.foto_profil && (
                         <button onClick={handleDeletePhoto} className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                       {user?.foto_profil && (
                         <button 
                           onClick={handleDeletePhoto}
                           className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-4 border-white dark:border-gray-900 active:scale-90"
                           title="Hapus Foto"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                       <button 
                         onClick={() => fileInputRef.current.click()}
                         className="w-10 h-10 bg-white text-[#1a4d2e] rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-all border-4 border-white dark:border-gray-900 active:scale-90"
                         title="Ubah Foto"
                       >
                          <Camera className="w-5 h-5" />
                       </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{user?.nama || 'Super Admin'}</h3>
                 <p className="text-sm text-gray-400 mb-6">{user?.email || 'superadmin@laporinaja.id'}</p>
                 <div className="bg-[#1a4d2e]/10 text-[#1a4d2e] dark:text-green-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-[#1a4d2e]/20 dark:border-green-800">
                    Super Admin
                 </div>
                 
                 <div className="grid gap-3 mt-10">
                    <button onClick={logout} className="w-full bg-white dark:bg-gray-800 border-2 border-red-50 dark:border-red-900/20 py-4 rounded-2xl text-sm font-bold text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                       <LogOut className="w-4 h-4" /> Keluar Sesi
                    </button>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">{lang === 'ID' ? 'Statistik Akun' : 'Account Statistics'}</h4>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-500">{lang === 'ID' ? 'Laporan Diverifikasi' : 'Verified Reports'}</span>
                       <span className="text-sm font-black text-[#1a4d2e]">{(saStats.totalReports || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-500">{lang === 'ID' ? 'Waktu Respon Rata-rata' : 'Avg. Response Time'}</span>
                       <span className="text-sm font-black text-blue-600">{saStats.avgResponseTime || 0} {lang === 'ID' ? 'Jam' : 'Hours'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-500">{lang === 'ID' ? 'Bergabung Sejak' : 'Joined Since'}</span>
                       <span className="text-sm font-black text-gray-900 dark:text-white">
                         {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {month: 'short', year: 'numeric'}) : '-'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Settings Panel */}
           <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
              <div className="flex border-b border-gray-50 dark:border-gray-800 px-4">
                 {[
                   { id: 'info', label: 'Info Pribadi' },
                   { id: 'password', label: 'Ganti Password' },
                   { id: 'prefs', label: 'Preferensi' }
                 ].map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-6 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#1a4d2e]' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     {tab.label}
                     {activeTab === tab.id && <div className="absolute bottom-0 left-8 right-8 h-1 bg-[#1a4d2e] rounded-t-full shadow-lg shadow-green-900/20"></div>}
                   </button>
                 ))}
              </div>

              <div className="p-10 flex-1 space-y-10 animate-fade-in">
                 {activeTab === 'info' && (
                   <div className="space-y-10">
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <div className="relative">
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                               <input type="text" name="nama" value={formData.nama} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Pegawai</label>
                            <div className="relative">
                               <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                               <input type="text" value={`SA-${user?.id?.toString().padStart(4, '0')}`} disabled className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Instansi</label>
                            <div className="relative">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                               <input type="email" name="email" value={formData.email} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                            <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                               <input type="text" name="no_telp" value={formData.no_telp} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed" />
                            </div>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit Kerja / Departemen</label>
                            <div className="relative">
                               <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                               <input type="text" defaultValue="Direktorat Pengelolaan Pengaduan Masyarakat" disabled className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                            </div>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Kantor</label>
                            <div className="relative">
                               <MapPin className="absolute left-4 top-5 w-4 h-4 text-gray-300" />
                               <textarea rows="3" name="alamat" value={formData.alamat} onChange={handleInfoChange} disabled={!isEditing} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed" />
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'password' && (
                   <div className="space-y-10">
                      <div className="space-y-6 max-w-xl">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                           <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold" />
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center px-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kata Sandi Baru</label>
                              {passwordData.newPassword.length > 5 && <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Kuat</span>}
                           </div>
                           <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi Baru</label>
                           <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold" />
                        </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'prefs' && (
                   <div className="space-y-10">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Preferensi & Notifikasi</h4>
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">Notifikasi Email</p>
                              <p className="text-xs text-gray-400">Terima rekap laporan harian via email</p>
                           </div>
                           <button onClick={() => setPrefs({...prefs, emailNotif: !prefs.emailNotif})} className={`w-12 h-6 rounded-full relative transition-all ${prefs.emailNotif ? 'bg-[#1a4d2e]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.emailNotif ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">Notifikasi Push Browser</p>
                              <p className="text-xs text-gray-400">Pemberitahuan real-time untuk laporan baru</p>
                           </div>
                           <button onClick={() => setPrefs({...prefs, pushNotif: !prefs.pushNotif})} className={`w-12 h-6 rounded-full relative transition-all ${prefs.pushNotif ? 'bg-[#1a4d2e]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.pushNotif ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">Bahasa Antarmuka</p>
                              <p className="text-xs text-gray-400">Pilih bahasa yang digunakan dalam sistem</p>
                           </div>
                           <button onClick={() => toggleLang()} className="flex items-center gap-2 border-2 border-gray-100 dark:border-gray-800 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{lang === 'ID' ? 'Bahasa Indonesia' : 'English'}</span>
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                           </button>
                        </div>

                      </div>
                   </div>
                 )}
              </div>

              <div className="p-10 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-end border-t border-gray-100 dark:border-gray-800">
                 <div className="flex gap-4">
                    {activeTab === 'info' && (
                      !isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="bg-[#1a4d2e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 transition-all">
                           <Edit2 className="w-4 h-4" /> Edit Profil
                        </button>
                      ) : (
                        <>
                          <button onClick={handleCancelEdit} disabled={isLoading} className="px-8 py-4 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50">
                            Batalkan
                          </button>
                          <button onClick={handleSaveInfo} disabled={isLoading} className="bg-[#1a4d2e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 transition-all">
                             <Check className="w-4 h-4" /> {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                          </button>
                        </>
                      )
                    )}
                    {activeTab === 'password' && (
                      <button onClick={handleUpdatePassword} disabled={isLoading || !passwordData.newPassword} className="bg-[#1a4d2e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50">
                         <Check className="w-4 h-4" /> {isLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPengaturan;
