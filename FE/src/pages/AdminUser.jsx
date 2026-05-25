import AdminLayout from '../layouts/AdminLayout';
import { 
  UserPlus, Search, Edit2, 
  Trash2, Shield, User, 
  Mail, Phone, ChevronLeft, 
  ChevronRight, MoreVertical, CheckCircle2,
  XCircle, Filter
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const response = await api.put(`/users/${editingUser.id}/role`, { role: editingUser.role });
      if (response.data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editingUser.role } : u));
        setIsEditModalOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ADMIN': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-green-100 text-[#2d5a1e] dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Aktif' 
      ? 'bg-green-50 text-green-600 dark:bg-green-900/20' 
      : 'bg-red-50 text-red-600 dark:bg-red-900/20';
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Admin &gt; User</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola User</h2>
              <p className="text-sm text-gray-400 mt-2">Atur hak akses dan kelola database pengguna platform.</p>
           </div>
           <Link to="/admin/user/tambah" className="bg-[#2d5a1e] text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 active:scale-95">
              <UserPlus className="w-6 h-6" /> Tambah User Baru
           </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6">
           <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d5a1e]" />
              <input type="text" placeholder="Cari berdasarkan nama, email, atau ID..." className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none transition-all" />
           </div>
           <div className="flex gap-4">
              <select className="bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl px-6 py-3.5 text-sm font-bold focus:outline-none">
                 <option>Semua Peran</option>
                 <option>Masyarakat</option>
                 <option>Admin</option>
                 <option>Super Admin</option>
              </select>
              <select className="bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl px-6 py-3.5 text-sm font-bold focus:outline-none">
                 <option>Semua Status</option>
                 <option>Aktif</option>
                 <option>Nonaktif</option>
              </select>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-8 py-6">ID User</th>
                       <th className="px-8 py-6">Pengguna</th>
                       <th className="px-8 py-6">Kontak</th>
                       <th className="px-8 py-6 text-center">Peran</th>
                       <th className="px-8 py-6 text-center">Status</th>
                       <th className="px-8 py-6">Terdaftar</th>
                       <th className="px-8 py-6 text-center">Aksi</th>
                    </tr>
                 </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Memuat data...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Belum ada user</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                         <td className="px-8 py-6">
                            <span className="text-xs font-black text-gray-400 tracking-wider">#{u.id}</span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                  <User className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{u.nama}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                               <Phone className="w-3.5 h-3.5" /> -
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                               {u.role.replace('_', ' ')}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge('Aktif')}`}>
                               <CheckCircle2 className="w-3 h-3" />
                               Aktif
                            </div>
                         </td>
                         <td className="px-8 py-6 text-xs font-bold text-gray-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                               <button onClick={() => handleEditClick(u)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                               <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-8 flex items-center justify-between border-t border-gray-50 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400">Menampilkan {users.length} pengguna</p>
              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
                 <button className="w-10 h-10 rounded-xl bg-[#2d5a1e] text-white text-xs font-black">1</button>
                 <button className="w-10 h-10 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-50">2</button>
                 <button className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400"><ChevronRight className="w-5 h-5" /></button>
              </div>
           </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}></div>
             <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit User</h3>
                   <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                      <XCircle className="w-6 h-6 text-gray-400" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama</label>
                      <input type="text" value={editingUser.nama} disabled className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-bold opacity-70" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input type="email" value={editingUser.email} disabled className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-bold opacity-70" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peran</label>
                      <select 
                        value={editingUser.role} 
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all"
                      >
                         <option value="MASYARAKAT">MASYARAKAT</option>
                         <option value="ADMIN">ADMIN</option>
                         <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                   </div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                   <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Batal</button>
                   <button onClick={handleUpdate} className="flex-1 bg-[#2d5a1e] text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 transition-all">Simpan</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUser;
