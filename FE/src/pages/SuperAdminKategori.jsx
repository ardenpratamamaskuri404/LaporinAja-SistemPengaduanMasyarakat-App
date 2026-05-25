import { useState, useEffect } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  Plus, Search, Edit2, Trash2, 
  X, Check, Layers, Zap, 
  Shield, BookOpen, MoreVertical,
  ChevronLeft, ChevronRight, Droplets,
  Globe
} from 'lucide-react';
import api from '../utils/api';

const SuperAdminKategori = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ nama: '', warna: 'bg-[#1a4d2e]', icon: 'Layers', deskripsi: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleCreateOrUpdate = async () => {
    try {
      if (editingId) {
        const response = await api.put(`/kategori/${editingId}`, newCategory);
        if (response.data.success) {
          setCategories(categories.map(c => c.id === editingId ? response.data.data : c));
          setIsModalOpen(false);
          setEditingId(null);
          setNewCategory({ nama: '', warna: 'bg-[#1a4d2e]', icon: 'Layers', deskripsi: '' });
        }
      } else {
        const response = await api.post('/kategori', newCategory);
        if (response.data.success) {
          setCategories([response.data.data, ...categories]);
          setIsModalOpen(false);
          setNewCategory({ nama: '', warna: 'bg-[#1a4d2e]', icon: 'Layers', deskripsi: '' });
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditClick = (cat) => {
    setNewCategory({
      nama: cat.nama,
      warna: cat.warna || 'bg-[#1a4d2e]',
      icon: cat.icon || 'Layers',
      deskripsi: cat.deskripsi || ''
    });
    setEditingId(cat.id);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setNewCategory({ nama: '', warna: 'bg-[#1a4d2e]', icon: 'Layers', deskripsi: '' });
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

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Kategori</h2>
                 <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Atur klasifikasi laporan global untuk seluruh wilayah di platform.</p>
           </div>
           <button 
             onClick={openCreateModal}
             className="bg-[#1a4d2e] text-white px-8 py-4 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#123620] transition-all shadow-xl shadow-green-900/20 active:scale-95"
           >
              <Plus className="w-6 h-6" /> Tambah Kategori
           </button>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:border-[#1a4d2e] transition-all">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#1a4d2e]">
                 <Layers className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Kategori</p>
                 <h3 className="text-4xl font-black text-gray-900 dark:text-white">{categories.length}</h3>
              </div>
           </div>
           
           <div className="md:col-span-2 bg-[#1a4d2e] p-8 rounded-[32px] shadow-2xl shadow-green-900/20 relative overflow-hidden flex items-center group">
              <div className="relative z-10 text-white max-w-lg">
                 <h4 className="text-xl font-black mb-2 group-hover:translate-x-1 transition-transform">Standarisasi Kategori Global</h4>
                 <p className="text-sm text-green-100 opacity-80 leading-relaxed">Setiap kategori yang Anda buat di sini akan tersedia untuk seluruh admin wilayah. Pastikan penamaan bersifat universal.</p>
              </div>
              <Layers className="absolute -right-10 -bottom-10 w-48 h-48 text-white opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
           </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
           <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="relative group max-w-sm w-full">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e]" />
                 <input type="text" placeholder="Cari kategori..." className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-transparent focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none transition-all shadow-sm" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-10 py-6">ID</th>
                       <th className="px-10 py-6">Kategori Master</th>
                       <th className="px-10 py-6">Aset Visual</th>
                       <th className="px-10 py-6 text-center">Data Laporan</th>
                       <th className="px-10 py-6">Last Update</th>
                       <th className="px-10 py-6 text-center">Kontrol</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">Memuat data...</td></tr>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">Belum ada kategori</td></tr>
                    ) : categories.map((cat) => {
                      let Icon = Layers;
                      if (cat.icon === 'Zap') Icon = Zap;
                      else if (cat.icon === 'Droplets') Icon = Droplets;
                      else if (cat.icon === 'Shield') Icon = Shield;
                      else if (cat.icon === 'BookOpen') Icon = BookOpen;
                      else if (cat.icon === 'Globe') Icon = Globe;

                      return (
                      <tr key={cat.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all group">
                         <td className="px-10 py-8 text-sm font-black text-gray-400 tracking-wider">#{cat.id}</td>
                         <td className="px-10 py-8">
                            <div>
                               <p className="text-base font-black text-gray-900 dark:text-white group-hover:text-[#1a4d2e] transition-colors">{cat.nama}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SLUG: {cat.slug}</p>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl ${cat.warna || 'bg-gray-500'} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                                  <Icon className={`w-5 h-5 ${cat.warna?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                               </div>
                               <div className={`w-4 h-4 rounded-full ${cat.warna || 'bg-gray-500'}`}></div>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full">
                               <span className="text-sm font-black text-gray-900 dark:text-white">{cat.count || 0}</span>
                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entries</span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-xs font-bold text-gray-400">{new Date(cat.createdAt).toLocaleDateString()}</td>
                         <td className="px-10 py-8">
                            <div className="flex items-center justify-center gap-3">
                               <button onClick={() => handleEditClick(cat)} className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-[#1a4d2e] rounded-xl text-gray-400 hover:text-white transition-all">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-red-500 rounded-xl text-gray-400 hover:text-white transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                         </td>
                      </tr>
                    )})}
                 </tbody>
               </table>
            </div>
            <div className="p-10 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
               <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Menampilkan {categories.length} kategori</p>
            </div>
         </div>

         {/* Add Modal */}
         {isModalOpen && (
           <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
              <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                 <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-[#1a4d2e]">
                    <div>
                       <h3 className="text-2xl font-black text-white tracking-tight">{editingId ? 'Edit Master Category' : 'New Master Category'}</h3>
                       <p className="text-[10px] font-black text-green-200/60 uppercase tracking-[0.2em] mt-1">Sistem Konfigurasi Global</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                       <X className="w-6 h-6 text-white" />
                    </button>
                 </div>
                 <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kategori</label>
                       <input type="text" value={newCategory.nama} onChange={(e) => setNewCategory({...newCategory, nama: e.target.value})} placeholder="Misal: Krisis Kesehatan" className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all shadow-sm" />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Ikon Master</label>
                       <div className="grid grid-cols-6 gap-4">
                          {[{component: Layers, name: 'Layers'}, {component: Zap, name: 'Zap'}, {component: Droplets, name: 'Droplets'}, {component: Shield, name: 'Shield'}, {component: BookOpen, name: 'BookOpen'}, {component: Globe, name: 'Globe'}].map(({component: Icon, name}, i) => (
                            <button key={i} onClick={() => setNewCategory({...newCategory, icon: name})} className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all ${newCategory.icon === name ? 'bg-green-50 border-[#1a4d2e] text-[#1a4d2e]' : 'border-gray-50 dark:border-gray-800 text-gray-300 hover:border-gray-200 hover:text-gray-900'}`}>
                               <Icon className="w-6 h-6" />
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Warna Identitas Visual</label>
                       <div className="flex gap-4">
                          {['bg-[#1a4d2e]', 'bg-[#2d5a1e]', 'bg-blue-600', 'bg-red-600', 'bg-pink-600', 'bg-orange-500'].map((color, i) => (
                            <button key={i} onClick={() => setNewCategory({...newCategory, warna: color})} className={`w-10 h-10 rounded-2xl ${color} ${newCategory.warna === color ? 'ring-4 ring-green-100 dark:ring-green-900/30 scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}></button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi & Ruang Lingkup</label>
                       <textarea rows="4" value={newCategory.deskripsi} onChange={(e) => setNewCategory({...newCategory, deskripsi: e.target.value})} placeholder="Jelaskan parameter laporan yang masuk ke kategori ini secara global..." className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all resize-none shadow-sm"></textarea>
                    </div>
                 </div>
                 <div className="p-10 border-t border-gray-50 dark:border-gray-800 flex items-center justify-end gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest">Batal</button>
                    <button onClick={handleCreateOrUpdate} disabled={!newCategory.nama} className="bg-[#1a4d2e] text-white px-12 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 uppercase tracking-widest disabled:opacity-50">Deploy Kategori</button>
                 </div>
              </div>
           </div>
         )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminKategori;
