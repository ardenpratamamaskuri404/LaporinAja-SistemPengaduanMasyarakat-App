import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  UserPlus, Mail, Phone, 
  Shield, User, ArrowLeft,
  Check, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminTambahUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/admin/user'), 2000);
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/admin/user')}
             className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#2d5a1e] transition-all"
           >
              <ArrowLeft className="w-6 h-6" />
           </button>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">User &gt; Tambah Baru</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Registrasi Pengguna Baru</h2>
           </div>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-[40px] p-16 text-center space-y-6 animate-slide-up">
             <div className="w-20 h-20 bg-green-500 rounded-[30px] flex items-center justify-center text-white mx-auto shadow-xl shadow-green-500/20">
                <Check className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Berhasil Terdaftar!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Data pengguna telah disimpan. Mengalihkan kembali ke daftar user...</p>
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
             <div className="p-12 space-y-10">
                {/* Section 1: Identitas */}
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#2d5a1e]">
                         <User className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Informasi Identitas</h4>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                         <input required type="text" placeholder="Masukkan nama sesuai KTP" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK (Opsional)</label>
                         <input type="text" placeholder="16 digit nomor induk kependudukan" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                      </div>
                   </div>
                </div>

                {/* Section 2: Kontak & Akun */}
                <div className="space-y-8 pt-10 border-t border-gray-50 dark:border-gray-800">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                         <Mail className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Kontak & Akses</h4>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Aktif</label>
                         <input required type="email" placeholder="contoh@email.com" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                         <input required type="tel" placeholder="08xxxxxxxxxx" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Awal</label>
                         <input required type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role / Peran</label>
                         <select className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer">
                            <option value="MASYARAKAT">Masyarakat</option>
                            <option value="ADMIN">Administrator Wilayah</option>
                            <option value="SUPER_ADMIN">Super Administrator</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-[28px] flex gap-4">
                   <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                   <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                      Pengguna yang baru didaftarkan akan menerima email konfirmasi. Pastikan alamat email yang dimasukkan valid untuk proses verifikasi akun.
                   </p>
                </div>
             </div>

             <div className="p-12 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button"
                  onClick={() => navigate('/admin/user')}
                  className="px-10 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                   Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#2d5a1e] text-white px-12 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                   {loading ? (
                     <>Memproses...</>
                   ) : (
                     <><Check className="w-5 h-5" /> Daftarkan Pengguna</>
                   )}
                </button>
             </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTambahUser;
