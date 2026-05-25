import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../utils/api';
import { 
  User, Lock, Settings, Check, Mail, Phone, 
  Shield, MapPin, Bell, ChevronDown, Camera, 
  Trash2, LogOut, Eye, EyeOff, CheckCircle2,
  Clock, Activity, Edit2
} from 'lucide-react';

const AdminPengaturan = () => {
  const { lang, toggleLang } = useSettings();
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  const [prefs, setPrefs] = useState({
    emailNotif: true,
    pushNotif: false,
  });

  const inferLocation = (name) => {
    if (!name) return { kota: '', provinsi: '' };
    const lowerName = name.toLowerCase();
    if (lowerName.includes('depok')) {
      return { kota: 'Depok', provinsi: 'Jawa Barat' };
    }
    if (lowerName.includes('subang')) {
      return { kota: 'Subang', provinsi: 'Jawa Barat' };
    }
    if (lowerName.includes('tangerang selatan') || lowerName.includes('tangsel')) {
      return { kota: 'Tangerang Selatan', provinsi: 'Banten' };
    }
    if (lowerName.includes('bogor')) {
      return { kota: 'Bogor', provinsi: 'Jawa Barat' };
    }
    if (lowerName.includes('bekasi')) {
      return { kota: 'Bekasi', provinsi: 'Jawa Barat' };
    }
    if (lowerName.includes('bandung')) {
      return { kota: 'Bandung', provinsi: 'Jawa Barat' };
    }
    if (lowerName.includes('jakarta pusat') || lowerName.includes('jakpus')) {
      return { kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta' };
    }
    if (lowerName.includes('jakarta selatan') || lowerName.includes('jaksel')) {
      return { kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta' };
    }
    if (lowerName.includes('jakarta barat') || lowerName.includes('jakbar')) {
      return { kota: 'Jakarta Barat', provinsi: 'DKI Jakarta' };
    }
    if (lowerName.includes('jakarta timur') || lowerName.includes('jaktim')) {
      return { kota: 'Jakarta Timur', provinsi: 'DKI Jakarta' };
    }
    if (lowerName.includes('jakarta utara') || lowerName.includes('jakut')) {
      return { kota: 'Jakarta Utara', provinsi: 'DKI Jakarta' };
    }
    return { kota: '', provinsi: '' };
  };

  const inferred = inferLocation(user?.nama);

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    no_telp: user?.no_telp || '',
    alamat: user?.alamat || '',
    provinsi: user?.provinsi || inferred.provinsi || '',
    kota: user?.kota || inferred.kota || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [adminStats, setAdminStats] = useState({
    completed: 0,
    avgResponseTime: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/statistics/admin');
      if (res.data.success) {
        setAdminStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  // Reset form to current user data
  const resetForm = () => {
    const inferredLoc = inferLocation(user?.nama);
    setFormData({
      nama: user?.nama || '',
      email: user?.email || '',
      no_telp: user?.no_telp || '',
      alamat: user?.alamat || '',
      provinsi: user?.provinsi || inferredLoc.provinsi || '',
      kota: user?.kota || inferredLoc.kota || '',
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
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
        showSuccess('Foto profil berhasil diperbarui');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal mengunggah foto');
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
        showSuccess('Foto profil berhasil dihapus');
      }
    } catch (error) {
      showError('Gagal menghapus foto');
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
    if (!passwordData.currentPassword) return showError('Masukkan kata sandi saat ini');
    if (passwordData.newPassword.length < 8) return showError('Kata sandi baru minimal 8 karakter');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError('Konfirmasi kata sandi baru tidak cocok');
    }

    try {
      setIsLoading(true);
      const res = await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        showSuccess('Kata sandi berhasil diperbarui');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal memperbarui kata sandi');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { label: 'Lemah', color: 'text-red-500', bar: 'bg-red-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Sedang', color: 'text-orange-500', bar: 'bg-orange-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Kuat', color: 'text-blue-500', bar: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Sangat Kuat', color: 'text-green-500', bar: 'bg-green-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const tabs = [
    { id: 'info', label: 'Info Pribadi' },
    { id: 'password', label: 'Ganti Password' },
    { id: 'prefs', label: 'Preferensi' },
  ];

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8 pb-20">
        {/* Header */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Admin &gt; Pengaturan</p>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan Akun</h2>
          <p className="text-sm text-gray-400 mt-2">Kelola informasi profil, keamanan, dan preferensi akun Anda.</p>
        </div>

        {/* Toast Messages */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-2xl text-sm font-bold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold animate-fade-in">
            <Shield className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-10 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              {/* Photo */}
              <div className="relative w-32 h-32 mx-auto mb-8 group">
                {user?.foto_profil ? (
                  <img
                    src={`http://localhost:5000${user.foto_profil}`}
                    alt="Profile"
                    className="w-full h-full rounded-[40px] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-[40px] bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-4xl font-black text-[#2d5a1e]">
                    {user?.nama?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-10 h-10 bg-white text-[#2d5a1e] rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
                    title="Ubah Foto"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  {user?.foto_profil && (
                    <button
                      onClick={handleDeletePhoto}
                      className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      title="Hapus Foto"
                    >
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
                     className="w-10 h-10 bg-white text-[#2d5a1e] rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-all border-4 border-white dark:border-gray-900 active:scale-90"
                     title="Ubah Foto"
                   >
                     <Camera className="w-5 h-5" />
                   </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-[40px] flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-[#2d5a1e] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{user?.nama || 'Admin'}</h3>
              <p className="text-sm text-gray-400 mb-2">{user?.email}</p>
              <div className="bg-[#2d5a1e]/10 text-[#2d5a1e] dark:text-green-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-[#2d5a1e]/20 dark:border-green-800 mb-8">
                Administrator
              </div>

              <button
                onClick={logout}
                className="w-full bg-white dark:bg-gray-800 border-2 border-red-50 dark:border-red-900/20 py-4 rounded-2xl text-sm font-bold text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <LogOut className="w-4 h-4" /> Keluar Sesi
              </button>
            </div>

            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">{lang === 'ID' ? 'Statistik Akun' : 'Account Statistics'}</h4>
              <div className="space-y-6">
                {[
                  { label: lang === 'ID' ? 'Laporan Diverifikasi' : 'Verified Reports', value: adminStats.completed.toLocaleString(), icon: CheckCircle2, color: 'text-green-500' },
                  { label: lang === 'ID' ? 'Waktu Respon Rata-rata' : 'Avg. Response Time', value: `${adminStats.avgResponseTime} ${lang === 'ID' ? 'Jam' : 'Hours'}`, icon: Clock, color: 'text-blue-500' },
                  { label: lang === 'ID' ? 'Bergabung Sejak' : 'Joined Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' }) : '-', icon: Activity, color: 'text-purple-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-bold text-gray-500">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Settings Panel */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-50 dark:border-gray-800 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-6 text-sm font-bold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-[#2d5a1e]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-8 right-8 h-1 bg-[#2d5a1e] rounded-t-full shadow-lg shadow-green-900/20"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-10 flex-1 space-y-10 animate-fade-in">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Pegawai</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          value={`ADM-${user?.id?.toString().padStart(4, '0')}`}
                          disabled
                          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="no_telp"
                          value={formData.no_telp}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          placeholder="Contoh: 08123456789"
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Provinsi</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="provinsi"
                          value={formData.provinsi}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          placeholder="Contoh: Jawa Barat"
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kota / Kabupaten</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          name="kota"
                          value={formData.kota}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          placeholder="Contoh: Depok"
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-gray-300" />
                        <textarea
                          rows="3"
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleInfoChange}
                          disabled={!isEditing}
                          placeholder="Alamat lengkap..."
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="space-y-8 max-w-xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kata Sandi Baru</label>
                      {passwordStrength && (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min. 8 karakter"
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordStrength && (
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${passwordStrength.bar} ${passwordStrength.width} transition-all duration-500 rounded-full`}></div>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 ml-1">Gunakan minimal 8 karakter, huruf besar, angka, dan simbol.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={`w-full bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:outline-none transition-all ${
                          passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-transparent focus:border-[#2d5a1e]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">Kata sandi tidak cocok</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'prefs' && (
                <div className="space-y-10">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">Preferensi & Notifikasi</h4>
                  <div className="space-y-8">
                    {[
                      {
                        key: 'emailNotif',
                        label: 'Notifikasi Email',
                        desc: 'Terima rekap laporan harian via email',
                      },
                      {
                        key: 'pushNotif',
                        label: 'Notifikasi Push Browser',
                        desc: 'Pemberitahuan real-time untuk laporan baru',
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                          className={`w-12 h-6 rounded-full relative transition-all ${
                            prefs[item.key] ? 'bg-[#2d5a1e]' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                              prefs[item.key] ? 'right-1' : 'left-1'
                            }`}
                          ></div>
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">Bahasa Antarmuka</p>
                        <p className="text-xs text-gray-400">Pilih bahasa yang digunakan dalam sistem</p>
                      </div>
                      <button
                        onClick={toggleLang}
                        className="flex items-center gap-2 border-2 border-gray-100 dark:border-gray-800 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                          {lang === 'ID' ? 'Bahasa Indonesia' : 'English'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-10 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-end border-t border-gray-100 dark:border-gray-800">
              {activeTab === 'info' && (
                !isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Edit Profil
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="px-8 py-4 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      disabled={isLoading}
                      className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                )
              )}
              {activeTab === 'password' && (
                <button
                  onClick={handleUpdatePassword}
                  disabled={isLoading || !passwordData.newPassword || !passwordData.currentPassword}
                  className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {isLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPengaturan;
