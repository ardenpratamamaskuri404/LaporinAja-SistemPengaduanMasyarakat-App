import { useState } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  UserPlus, Mail, Lock, 
  Shield, User, ArrowLeft, 
  CheckCircle, Loader2, MapPin, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const provinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Lampung", "Banten", "Jawa Barat", "DKI Jakarta", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara", "Papua Barat", "Papua"
];

const citiesByProvince = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
  "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Cimahi", "Tasikmalaya", "Cirebon", "Subang"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Banyuwangi"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Banyumas"],
  "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunung Kidul"],
  "Banten": ["Tangerang", "Serang", "Cilegon", "Tangerang Selatan"],
};

const SuperAdminTambahUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'MASYARAKAT',
    provinsi: '',
    kota: ''
  });

  const availableCities = citiesByProvince[form.provinsi] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Build registration payload
      const payload = {
        nama: form.nama,
        email: form.email,
        password: form.password,
        role: form.role,
        provinsi: form.role === 'ADMIN' ? form.provinsi : null,
        kota: form.role === 'ADMIN' ? form.kota : null
      };
      const response = await api.post('/auth/register', payload);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/superadmin/user'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftarkan pengguna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Link to="/superadmin/user" className="flex items-center gap-2 text-gray-400 hover:text-[#1a4d2e] mb-8 font-bold text-sm transition-all group">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar Pengguna
        </Link>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[48px] shadow-xl overflow-hidden">
           <div className="grid md:grid-cols-5 h-full">
              {/* Sidebar Info */}
              <div className="md:col-span-2 bg-[#1a4d2e] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center mb-8 backdrop-blur-md">
                       <UserPlus className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">Registrasi Pengguna Baru</h2>
                    <p className="text-green-100 text-sm font-medium leading-relaxed">
                       Tambahkan akun baru ke dalam sistem LaporinAja dengan otoritas Super Admin.
                    </p>
                 </div>
                 
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                       <Shield className="w-6 h-6 text-green-200" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-200">Kontrol Role</p>
                          <p className="text-xs font-bold">Akses penuh ke semua level role.</p>
                       </div>
                    </div>
                 </div>

                 {/* Abstract Shapes */}
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-green-500 rounded-full blur-3xl opacity-20"></div>
                 <div className="absolute top-1/2 -left-10 w-32 h-32 bg-green-700 rounded-full blur-2xl opacity-20"></div>
              </div>

              {/* Form Section */}
              <div className="md:col-span-3 p-12">
                 {success ? (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-xl shadow-green-900/10 border-4 border-white">
                         <CheckCircle className="w-10 h-10" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Registrasi Berhasil!</h3>
                         <p className="text-gray-400 text-sm font-medium">Data pengguna telah tersimpan ke dalam database pusat.</p>
                      </div>
                   </div>
                 ) : (
                   <form onSubmit={handleSubmit} className="space-y-8">
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold">
                          {error}
                        </div>
                      )}
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <div className="relative group">
                               <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                               <input 
                                 required
                                 type="text" 
                                 placeholder="Masukkan nama lengkap"
                                 value={form.nama}
                                 className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none transition-all"
                                 onChange={(e) => setForm({...form, nama: e.target.value})}
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
                            <div className="relative group">
                               <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                               <input 
                                 required
                                 type="email" 
                                 placeholder="nama@email.com"
                                 value={form.email}
                                 className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none transition-all"
                                 onChange={(e) => setForm({...form, email: e.target.value})}
                               />
                            </div>
                         </div>

                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                                   <input 
                                     required
                                     type="password" 
                                     placeholder="Min. 8 karakter"
                                     value={form.password}
                                     className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none transition-all"
                                     onChange={(e) => setForm({...form, password: e.target.value})}
                                   />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peran / Role</label>
                                <div className="relative group">
                                   <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                                   <select 
                                     value={form.role}
                                     className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-10 py-4 text-sm font-bold focus:outline-none appearance-none transition-all"
                                     onChange={(e) => setForm({...form, role: e.target.value})}
                                   >
                                      <option value="MASYARAKAT">Masyarakat</option>
                                      <option value="ADMIN">Administrator</option>
                                      <option value="SUPER_ADMIN">Super Admin</option>
                                   </select>
                                   <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                             </div>
                          </div>

                          {form.role === 'ADMIN' && (
                            <div className="grid grid-cols-2 gap-6 animate-fade-in">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Provinsi Wilayah Admin</label>
                                 <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                                    <select
                                      required
                                      value={form.provinsi}
                                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-10 py-4 text-sm font-bold focus:outline-none appearance-none transition-all"
                                      onChange={(e) => setForm(prev => ({ ...prev, provinsi: e.target.value, kota: '' }))}
                                    >
                                      <option value="">Pilih Provinsi</option>
                                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kota Wilayah Admin</label>
                                 <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" />
                                    <select
                                      required
                                      value={form.kota}
                                      disabled={!form.provinsi}
                                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-10 py-4 text-sm font-bold focus:outline-none appearance-none transition-all disabled:opacity-50"
                                      onChange={(e) => setForm({...form, kota: e.target.value})}
                                    >
                                      <option value="">{form.provinsi ? 'Pilih Kota' : 'Pilih Provinsi Dulu'}</option>
                                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                 </div>
                              </div>
                            </div>
                          )}
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1a4d2e] text-white py-5 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 hover:bg-[#123620] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Daftarkan Sekarang <ArrowLeft className="w-5 h-5 rotate-180" /></>}
                      </button>
                   </form>
                 )}
              </div>
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminTambahUser;
