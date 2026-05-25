import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import api from '../utils/api';
import { 
  Users, UserPlus, Shield, 
  Search, Filter, ChevronDown,
  UserCheck, XCircle, MoreVertical,
  Activity, AlertTriangle, TrendingUp,
  Edit2, Trash2, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';

const SuperAdminUser = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const response = await api.delete(`/users/${id}`);
      if (response.data.success) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await api.put(`/users/${editingUser.id}`, { 
        nama: editingUser.nama,
        email: editingUser.email,
        role: editingUser.role 
      });
      if (response.data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? response.data.data : u));
        setIsEditModalOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui pengguna');
    }
  };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersCount = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
  const activeUsersCount = users.filter(u => u.role === 'MASYARAKAT').length;
  const spamUsersCount = users.filter(u => u.role === 'MASYARAKAT' && !(u.no_telp || u.telp) && !u.kota).length;

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Pengguna</h2>
                 <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
              </div>
           </div>
           <Link to="/superadmin/user/tambah" className="bg-[#1a4d2e] text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-[#123620] transition-all shadow-xl shadow-green-900/20 active:scale-95">
              <UserPlus className="w-5 h-5" /> Tambah Pengguna
           </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { label: t.manage_user_total, val: users.length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
             { label: t.manage_user_admin, val: users.filter(u => u.role === 'ADMIN').length, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: t.manage_user_super, val: users.filter(u => u.role === 'SUPER_ADMIN').length, icon: UserCheck, color: 'text-[#1a4d2e]', bg: 'bg-green-50' },
             { label: t.manage_user_citizen, val: users.filter(u => u.role === 'MASYARAKAT').length, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px] shadow-sm flex items-center justify-between group hover:border-[#1a4d2e] transition-all">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <h3 className="text-3xl font-black text-gray-900 dark:text-white">{s.val}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                   <s.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>

        {/* Filter & Search */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm flex flex-col lg:flex-row gap-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e]" />
              <input 
                type="text" 
                placeholder={t.manage_user_search_placeholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-transparent focus:border-[#1a4d2e] rounded-2xl pl-16 pr-8 py-4 text-sm font-bold focus:outline-none transition-all"
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                 <select 
                   value={roleFilter}
                   onChange={(e) => setRoleFilter(e.target.value)}
                   className="bg-gray-50/50 dark:bg-gray-800/50 border border-transparent focus:border-[#1a4d2e] rounded-2xl pl-6 pr-12 py-4 text-sm font-bold appearance-none outline-none cursor-pointer"
                 >
                    <option value="">{t.manage_user_all_role}</option>
                    <option value="MASYARAKAT">{t.manage_user_citizen}</option>
                    <option value="ADMIN">{t.manage_user_admin}</option>
                    <option value="SUPER_ADMIN">{t.manage_user_super}</option>
                 </select>
                 <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button 
                onClick={fetchUsers}
                className="bg-[#1a4d2e] text-white p-4 rounded-2xl hover:bg-[#123620] transition-all shadow-lg shadow-green-900/10 active:scale-95"
              >
                 <Activity className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30 dark:bg-gray-800/30">
                       <th className="px-10 py-6">ID</th>
                       <th className="px-10 py-6">Pengguna</th>
                       <th className="px-10 py-6">Role</th>
                       <th className="px-10 py-6">No. Telp</th>
                       <th className="px-10 py-6">Bergabung</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6 text-center">Aksi</th>
                    </tr>
                 </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Memuat data...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Belum ada pengguna</td></tr>
                    ) : users
                        .filter(u => 
                          (u.nama.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
                          (roleFilter === '' || u.role === roleFilter)
                        )
                        .map((u, i) => (
                      <tr key={u.id} className="group hover:bg-gray-50/20 dark:hover:bg-gray-800/20 transition-all">
                         <td className="px-10 py-8">
                            <span className="text-xs font-black text-gray-400 tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{u.id}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                 {u.foto_profil ? (
                                   <img src={`http://localhost:5000${u.foto_profil}`} alt={u.nama} className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-xs font-black text-gray-400">{u.nama[0]}</span>
                                 )}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{u.nama}</p>
                                  <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' : u.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                               {u.role.replace('_', ' ')}
                            </span>
                         </td>
                         <td className="px-10 py-8 text-sm font-bold text-gray-500">{u.no_telp || u.telp || '-'}</td>
                         <td className="px-10 py-8 text-sm font-bold text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-green-500"></div>
                               <span className="text-xs font-black uppercase tracking-widest text-green-600">Aktif</span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button onClick={() => handleEditClick(u)} className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                               <button onClick={() => handleDelete(u.id)} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
           </div>
           <div className="p-10 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400">Menampilkan {users.length} pengguna</p>
              <div className="flex items-center gap-2">
                 <button className="w-9 h-9 rounded-xl bg-[#1a4d2e] text-white text-[10px] font-black">1</button>
                 <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black">2</button>
                 <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black">3</button>
                 <span className="text-gray-400 px-1">...</span>
                 <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black flex items-center justify-center rotate-[-90deg]"><ChevronDown className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
        {/* Bottom Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Pengguna Baru', val: newUsersCount, trend: `+${newUsersCount} Baru`, icon: Activity, color: 'text-green-600', sub: 'Terdaftar 30 hari terakhir' },
             { label: 'Pengguna Aktif Lapor', val: activeUsersCount, trend: 'Rata-rata tinggi', icon: UserCheck, color: 'text-blue-500', sub: 'Kategori Masyarakat' },
             { label: 'Akun Terindikasi Spam', val: spamUsersCount, trend: spamUsersCount > 0 ? 'Perlu ditinjau' : 'Sistem Aman', icon: AlertTriangle, color: 'text-red-500', sub: 'Tanpa No. Telp & Kota', critical: spamUsersCount > 0 }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 rounded-[40px] shadow-sm group hover:border-[#1a4d2e] transition-all relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full">
                   <div className="flex items-center justify-between mb-8">
                      <div className={`w-12 h-12 rounded-2xl ${s.bg || 'bg-gray-50'} flex items-center justify-center ${s.color}`}>
                         <s.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${s.critical ? 'text-red-500' : 'text-green-600'}`}>{s.trend}</span>
                   </div>
                   <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{s.val}</h3>
                   <p className="text-sm font-bold text-gray-400">{s.label}</p>
                   <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-auto pt-8 border-t border-gray-50 dark:border-gray-800">{s.sub}</p>
                </div>
                {i === 0 && <TrendingUp className="absolute -right-8 -bottom-8 w-40 h-40 text-green-500 opacity-[0.03]" />}
             </div>
           ))}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}></div>
             <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit Pengguna</h3>
                   <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                      <XCircle className="w-6 h-6 text-gray-400" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama</label>
                      <input 
                        type="text" 
                        value={editingUser.nama} 
                        onChange={(e) => setEditingUser({...editingUser, nama: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        value={editingUser.email} 
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                      <select 
                        value={editingUser.role} 
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all"
                      >
                         <option value="MASYARAKAT">MASYARAKAT</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                   </div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                   <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Batal</button>
                   <button onClick={handleUpdate} className="flex-1 bg-[#1a4d2e] text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 transition-all">Simpan</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUser;
