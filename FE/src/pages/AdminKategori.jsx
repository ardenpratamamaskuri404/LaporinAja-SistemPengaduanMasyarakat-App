import AdminLayout from '../layouts/AdminLayout';
import { 
  Plus, Search, Edit2, Trash2, 
  X, Layers, Zap, 
  Shield, BookOpen, Droplets, Road, Hospital, GraduationCap, Leaf, Building2, Sparkles, MessageCircle
} from 'lucide-react';

import { useState, useEffect } from 'react';
import api from '../utils/api';

const ICON_MAP = {
  Layers,
  Zap,
  Droplets,
  Shield,
  BookOpen,
  Road,
  Hospital,
  GraduationCap,
  Leaf,
  Building2,
  Sparkles,
  MessageCircle
};

const AdminKategori = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ nama: '', warna: 'bg-[#2d5a1e]', icon: 'Layers', deskripsi: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/kategori');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const interval = setInterval(fetchCategories, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      if (editingId) {
        const response = await api.put(`/kategori/${editingId}`, newCategory);
        if (response.data.success) {
          setCategories(categories.map(c => c.id === editingId ? response.data.data : c));
          setIsModalOpen(false);
          setEditingId(null);
          setNewCategory({ nama: '', warna: 'bg-[#2d5a1e]', icon: 'Layers', deskripsi: '' });
        }
      } else {
        const response = await api.post('/kategori', newCategory);
        if (response.data.success) {
          setCategories([response.data.data, ...categories]);
          setIsModalOpen(false);
          setNewCategory({ nama: '', warna: 'bg-[#2d5a1e]', icon: 'Layers', deskripsi: '' });
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditClick = (cat) => {
    setNewCategory({
      nama: cat.nama,
      warna: cat.warna || 'bg-[#2d5a1e]',
      icon: cat.icon || 'Layers',
      deskripsi: cat.deskripsi || ''
    });
    setEditingId(cat.id);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setNewCategory({ nama: '', warna: 'bg-[#2d5a1e]', icon: 'Layers', deskripsi: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      const response = await api.delete(`/kategori/${id}`);
      if (response.data.success) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Admin &gt; Kategori</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Kategori</h2>
              <p className="text-sm text-gray-400 mt-2">Atur klasifikasi laporan publik untuk mempermudah distribusi tugas.</p>
           </div>
           <button onClick={openCreateModal} className="bg-[#2d5a1e] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 active:scale-95">
              <Plus className="w-5 h-5" /> Buat Kategori Baru
           </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#2d5a1e]">
                 <Layers className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Kategori</p>
                 <h3 className="text-3xl font-black text-gray-900 dark:text-white">{filteredCategories.length}</h3>
              </div>
           </div>
           <div className="md:col-span-2 bg-[#2d5a1e] p-8 rounded-[32px] shadow-sm relative overflow-hidden flex items-center">
              <div className="relative z-10 text-white max-w-lg">
                 <h4 className="text-xl font-black mb-2">Tips Pengelolaan</h4>
                 <p className="text-sm text-green-100 opacity-80 leading-relaxed">Pastikan setiap kategori memiliki ikon yang representatif dan warna yang kontras untuk memudahkan visualisasi pada sistem.</p>
              </div>
              <Layers className="absolute -right-10 -bottom-10 w-48 h-48 text-white opacity-10 rotate-12" />
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
           <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="relative group max-w-sm w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Cari kategori..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none transition-all" 
                 />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-8 py-6">No</th>
                       <th className="px-8 py-6">Kategori</th>
                       <th className="px-8 py-6">Warna Utama</th>
                       <th className="px-8 py-6">Jumlah Laporan</th>
                       <th className="px-8 py-6">Dibuat</th>
                       <th className="px-8 py-6 text-center">Aksi</th>
                    </tr>
                 </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">Memuat data...</td></tr>
                    ) : filteredCategories.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">{searchTerm ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}</td></tr>
                    ) : filteredCategories.map((cat, index) => {
                      const Icon = ICON_MAP[cat.icon] || Layers;
                      return (
                      <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                         <td className="px-8 py-6 text-sm font-bold text-gray-400">{index + 1}</td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl ${cat.warna || 'bg-gray-500'} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                                  <Icon className={`w-5 h-5 ${cat.warna?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{cat.nama}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">slug: {cat.slug}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <div className={`w-4 h-4 rounded-full ${cat.warna || 'bg-gray-500'}`}></div>
                               <span className="text-xs font-bold text-gray-500 uppercase">Warna</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-black text-gray-900 dark:text-white">{cat.count || 0}</span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase">Laporan</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-xs font-bold text-gray-400">{new Date(cat.createdAt).toLocaleDateString()}</td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                               <button onClick={() => handleEditClick(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                               <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                    )})}
                 </tbody>
              </table>
           </div>
           <div className="p-8 flex items-center justify-between border-t border-gray-50 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400">Menampilkan {filteredCategories.length} dari {categories.length} kategori</p>
           </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
             <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{editingId ? 'Edit Kategori' : 'Kategori Baru'}</h3>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                   </button>
                </div>
                <div className="p-10 space-y-8">
                   <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500 ml-1">Nama Kategori</label>
                      <input type="text" value={newCategory.nama} onChange={(e) => setNewCategory({...newCategory, nama: e.target.value})} placeholder="Misal: Penerangan Jalan" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all" />
                   </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500 ml-1">Pilih Ikon Representatif</label>
                      <div className="flex gap-4">
                         {[
                           {component: Layers, name: 'Layers'},
                           {component: Zap, name: 'Zap'},
                           {component: Droplets, name: 'Droplets'},
                           {component: Shield, name: 'Shield'},
                           {component: BookOpen, name: 'BookOpen'},
                           {component: Road, name: 'Road'},
                           {component: Hospital, name: 'Hospital'},
                           {component: GraduationCap, name: 'GraduationCap'},
                           {component: Leaf, name: 'Leaf'},
                           {component: Building2, name: 'Building2'},
                           {component: Sparkles, name: 'Sparkles'},
                           {component: MessageCircle, name: 'MessageCircle'}
                         ].map(({component: Icon, name}, i) => (
                           <button key={i} onClick={() => setNewCategory({...newCategory, icon: name})} className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${newCategory.icon === name ? 'bg-green-50 border-[#2d5a1e] text-[#2d5a1e]' : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300'}`}>
                              <Icon className="w-6 h-6" />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500 ml-1">Warna Identitas</label>
                      <div className="flex gap-3">
                         {['bg-[#2d5a1e]', 'bg-[#1a4d2e]', 'bg-red-600', 'bg-purple-600', 'bg-blue-900'].map((color, i) => (
                           <button key={i} onClick={() => setNewCategory({...newCategory, warna: color})} className={`w-8 h-8 rounded-full ${color} ${newCategory.warna === color ? 'ring-4 ring-green-100 dark:ring-green-900/30' : ''}`}></button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500 ml-1">Deskripsi Kategori</label>
                      <textarea rows="4" value={newCategory.deskripsi} onChange={(e) => setNewCategory({...newCategory, deskripsi: e.target.value})} placeholder="Jelaskan jenis laporan yang masuk ke kategori ini..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all resize-none"></textarea>
                   </div>
                </div>
                <div className="p-10 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-4">
                   <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">Batal</button>
                   <button onClick={handleCreateOrUpdate} disabled={!newCategory.nama} className="bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 disabled:opacity-50">Simpan Kategori</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminKategori;
