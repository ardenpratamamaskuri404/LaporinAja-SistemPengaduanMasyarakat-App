import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  FileText, Search, Download, 
  AlertTriangle, ChevronDown, 
  User, MapPin, MoreVertical,
  CheckCircle, Clock, ArrowRight, X,
  Shield, CheckCircle2, Filter, Loader, RotateCcw, UserPlus, Trash2, MessageSquare
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';


const SuperAdminLaporan = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [reports, setReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedReports, setSelectedReports] = useState([]);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    kategori: '',
    urgensi: '',
    startDate: '',
    endDate: '',
    adminId: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchAdmins();
    fetchCategories();
    // Real-time polling every 30 seconds
    const interval = setInterval(() => fetchReports(filters), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategori');
      if (response.data.success) setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchReports = async (appliedFilters = {}) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams(appliedFilters).toString();
      const response = await api.get(`/laporan?${queryParams}`);
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
      setIsApplyingFilters(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        const onlyAdmins = response.data.data.filter(u => u.role === 'ADMIN');
        setAdmins(onlyAdmins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    fetchReports(filters);
  };

  const handleResetFilters = () => {
    const reset = { status: '', kategori: '', urgensi: '', startDate: '', endDate: '', adminId: '' };
    setFilters(reset);
    fetchReports(reset);
  };

  const handleSelectReport = (id) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(reports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(lang === 'ID' ? 'Hapus laporan terpilih?' : 'Delete selected reports?')) return;
    try {
      setIsUpdatingBulk(true);
      const response = await api.post('/laporan/bulk/delete', { ids: selectedReports });
      if (response.data.success) {
        setSelectedReports([]);
        fetchReports(filters);
      }
    } catch (error) {
      console.error('Error deleting reports:', error);
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (newStatus === 'SELESAI') {
      alert(lang === 'ID' ? 'Status SELESAI wajib dilengkapi dengan bukti pengerjaan dan foto realisasi. Silakan ubah secara individu melalui halaman detail masing-masing laporan.' : 'Status COMPLETED must include proof of work and completion photo. Please update individually via the detail page of each report.');
      return;
    }
    try {
      setIsUpdatingBulk(true);
      const response = await api.put('/laporan/bulk/status', { ids: selectedReports, status: newStatus });
      if (response.data.success) {
        setSelectedReports([]);
        setIsStatusMenuOpen(false);
        fetchReports(filters);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleAssignClick = (report) => {
    setSelectedReport(report);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedAdminId) return alert('Silakan pilih admin');
    try {
      const response = await api.put(`/laporan/${selectedReport.id}/assign`, { adminId: selectedAdminId });
      if (response.data.success) {
        fetchReports(filters);
        setIsAssignModalOpen(false);
        setSelectedReport(null);
        setSelectedAdminId('');
      }
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SELESAI': return 'bg-green-100 text-green-600';
      case 'PROSES': return 'bg-blue-100 text-blue-600';
      case 'DITOLAK': return 'bg-red-100 text-red-600';
      case 'PENDING': return 'bg-gray-100 text-gray-500';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const translateStatus = (s) => {
    if (lang === 'ID') return s;
    if (s === 'PROSES') return 'IN PROCESS';
    if (s === 'SELESAI') return 'COMPLETED';
    if (s === 'DITOLAK') return 'REJECTED';
    return s;
  };

  const translateCategory = (c) => {
    if (lang === 'ID') return c;
    const map = {
      'Infrastruktur': 'Infrastructure',
      'Kesehatan': 'Health',
      'Pendidikan': 'Education',
      'Lingkungan': 'Environment',
      'Utilitas': 'Utilities',
      'Lainnya': 'Others'
    };
    return map[c] || c;
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t.laporan_manage_title}</h2>
                 <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{lang === 'ID' ? 'Pantau, tugaskan, dan kelola semua laporan dari seluruh wilayah.' : 'Monitor, assign, and manage all reports from all regions.'}</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                 <FileText className="w-5 h-5 text-[#1a4d2e]" />
                 <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{reports.length} {lang === 'ID' ? 'Laporan' : 'Reports'}</p>
                 </div>
              </div>
              <button className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                 <Download className="w-5 h-5" /> {t.laporan_export_data}
              </button>
           </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6 items-end">
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.manage_rep_status}</label>
                 <select 
                   name="status"
                   value={filters.status}
                   onChange={handleFilterChange}
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t.manage_rep_all_status}</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PROSES">PROSES</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DITOLAK">DITOLAK</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.manage_rep_cat}</label>
                 <select 
                   name="kategori"
                   value={filters.kategori}
                   onChange={handleFilterChange}
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t.manage_rep_all_cat}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.nama}>{cat.nama}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{lang === 'ID' ? 'Admin' : 'Admin'}</label>
                 <select 
                   name="adminId"
                   value={filters.adminId}
                   onChange={handleFilterChange}
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                 >
                    <option value="">{lang === 'ID' ? 'Semua Admin' : 'All Admins'}</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                 </select>
              </div>
              <div className="lg:col-span-2 2xl:col-span-2 space-y-3">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.manage_rep_date}</label>
                 <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none transition-all" 
                    />
                    <input 
                      type="date" 
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none transition-all" 
                    />
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:col-span-1 2xl:col-span-1">
                <button 
                  onClick={handleApplyFilters}
                  disabled={isApplyingFilters}
                  className="flex-1 bg-[#1a4d2e] text-white px-4 h-[56px] rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:bg-[#11331e] transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 active:scale-95"
                >
                   {isApplyingFilters ? <Loader className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                   {t.manage_rep_apply}
                </button>
                <button 
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none px-4 h-[56px] rounded-2xl text-xs sm:text-sm font-black text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                   {t.manage_rep_reset}
                </button>
              </div>
           </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-10 py-6">
                         <input type="checkbox" onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-[#1a4d2e] focus:ring-[#1a4d2e]" />
                       </th>
                       <th className="px-10 py-6">{t.laporan_id}</th>
                       <th className="px-10 py-6">{t.report_label_title}</th>
                       <th className="px-10 py-6">{t.laporan_reporter}</th>
                       <th className="px-10 py-6">{t.detail_info_date}</th>
                       <th className="px-10 py-6 text-center">Status</th>
                       <th className="px-10 py-6">{lang === 'ID' ? 'Admin' : 'Admin'}</th>
                       <th className="px-10 py-6 text-center">{t.laporan_action}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="8" className="text-center py-20"><Loader className="w-8 h-8 animate-spin mx-auto text-gray-300" /></td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-20 text-gray-400 font-bold">{t.laporan_empty}</td></tr>
                    ) : reports.map((r) => (
                      <tr key={r.id} className={`group hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-all ${selectedReports.includes(r.id) ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                         <td className="px-10 py-8">
                            <input 
                              type="checkbox" 
                              checked={selectedReports.includes(r.id)} 
                              onChange={() => handleSelectReport(r.id)}
                              className="w-4 h-4 rounded border-gray-300 text-[#1a4d2e] focus:ring-[#1a4d2e]" 
                            />
                         </td>
                         <td className="px-10 py-8">
                            <Link to={`/laporan/${r.id}`} className="text-sm font-black text-gray-400 tracking-wider hover:text-[#1a4d2e] transition-all">LPR-{r.id}</Link>
                         </td>
                         <td className="px-10 py-8">
                            <div>
                               <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{r.judul}</p>
                               <p className="text-[10px] font-bold text-[#1a4d2e] uppercase tracking-widest">{translateCategory(r.kategori)}</p>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               {r.user?.foto_profil ? (
                                  <img src={`http://localhost:5000${r.user.foto_profil}`} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                               ) : (
                                  <img src={`https://ui-avatars.com/api/?name=${r.user?.nama || 'User'}&background=random`} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                               )}
                               <span className="text-sm font-bold text-gray-500">{r.user?.nama || 'Warga'}</span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-sm font-bold text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                         <td className="px-10 py-8 text-center">
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyle(r.status)}`}>
                               {translateStatus(r.status)}
                            </span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               {r.adminId ? (
                                 <>
                                   {r.assignedAdmin?.foto_profil ? (
                                      <img src={`http://localhost:5000${r.assignedAdmin.foto_profil}`} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Admin" />
                                   ) : (
                                      <img src={`https://ui-avatars.com/api/?name=${r.assignedAdmin?.nama || 'Admin'}&background=random`} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Admin" />
                                   )}
                                   <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{r.assignedAdmin?.nama || 'Admin'}</span>
                                 </>
                               ) : (
                                 <span className="text-xs font-bold text-gray-400 italic">{t.laporan_unassigned}</span>
                               )}
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                 onClick={() => handleAssignClick(r)}
                                 title={t.laporan_assign}
                                 className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-blue-500 transition-all"
                               >
                                  <UserPlus className="w-4 h-4" />
                               </button>
                               <Link 
                                 to={`/laporan/${r.id}`}
                                 title="Diskusi & Detail"
                                 className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-[#2d5a1e] transition-all"
                               >
                                  <MessageSquare className="w-4 h-4" />
                               </Link>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedReports.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a] dark:bg-black text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 animate-slide-up z-[100] border border-white/10 backdrop-blur-xl">
             <div className="flex flex-col border-r border-white/10 pr-8">
                <span className="text-2xl font-black text-green-500">{selectedReports.length}</span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.manage_rep_selected}</span>
             </div>
             <button onClick={() => setSelectedReports([])} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{t.manage_rep_cancel}</button>
             
             <div className="flex items-center gap-6">
                <div className="relative">
                  <button 
                    onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isStatusMenuOpen ? 'text-green-500' : 'text-gray-300 hover:text-white'}`}
                  >
                     <RotateCcw className={`w-4 h-4 ${isUpdatingBulk ? 'animate-spin' : ''}`} /> {t.manage_rep_update}
                  </button>
                  
                  {isStatusMenuOpen && (
                    <div className="absolute bottom-full mb-4 left-0 bg-[#2d2d2d] border border-white/10 rounded-2xl p-2 min-w-[160px] shadow-2xl animate-fade-in">
                      {['PENDING', 'PROSES', 'DITOLAK'].map(status => (
                        <button 
                          key={status}
                          onClick={() => handleBulkStatusUpdate(status)}
                          className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-all"
                >
                   <Trash2 className="w-4 h-4" /> {t.manage_rep_delete}
                </button>
             </div>
          </div>
        )}

        {/* Assign Modal */}
        {isAssignModalOpen && selectedReport && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAssignModalOpen(false)}></div>
             <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-[#1a4d2e]">
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{t.laporan_assign_title}</h3>
                      <p className="text-[10px] font-black text-green-200/60 uppercase tracking-widest mt-1">LPR-{selectedReport.id}</p>
                   </div>
                   <button onClick={() => setIsAssignModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{lang === 'ID' ? 'Detail Laporan' : 'Report Details'}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mb-1">{selectedReport.judul}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{selectedReport.deskripsi}</p>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'ID' ? 'Pilih Admin Wilayah' : 'Select Regional Admin'}</label>
                      <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {admins.length === 0 ? (
                          <p className="text-xs text-center py-4 text-gray-400 italic">{lang === 'ID' ? 'Tidak ada admin tersedia' : 'No admins available'}</p>
                        ) : admins.map((admin) => (
                          <button
                            key={admin.id}
                            onClick={() => setSelectedAdminId(admin.id)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedAdminId === admin.id ? 'bg-green-50 border-[#1a4d2e] text-[#1a4d2e]' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${selectedAdminId === admin.id ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {admin.nama?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black">{admin.nama}</p>
                               <p className="text-[10px] opacity-60 font-bold">{admin.email}</p>
                            </div>
                            {selectedAdminId === admin.id && <CheckCircle2 className="w-5 h-5" />}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                   <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">{t.laporan_cancel}</button>
                   <button onClick={handleAssign} disabled={!selectedAdminId} className="flex-1 bg-[#1a4d2e] text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50">{t.laporan_assign_now}</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminLaporan;
