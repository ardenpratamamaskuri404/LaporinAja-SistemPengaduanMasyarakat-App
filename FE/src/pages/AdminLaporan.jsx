import AdminLayout from '../layouts/AdminLayout';
import { 
  Plus, Download, Filter, 
  ChevronLeft, ChevronRight, 
  MoreVertical, Check, MessageSquare,
  RotateCcw, UserPlus, Trash2, Loader, X, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';


const AdminLaporan = () => {
  const { user } = useAuth();
  const { lang } = useSettings();
  const t = translations[lang];
  const [selectedReports, setSelectedReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalReports, setTotalReports] = useState(0);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReportToAssign, setSelectedReportToAssign] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    kategori: '',
    urgensi: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchReports();
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [currentPage, pageSize]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kategori');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.kategori && { kategori: filters.kategori }),
        ...(filters.urgensi && { urgensi: filters.urgensi }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      };
      
      const response = await api.get('/laporan', { params });
      if (response.data.success) {
        setReports(response.data.data || []);
        setTotalReports(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async () => {
    setCurrentPage(1);
    setIsApplyingFilters(true);
    await fetchReports();
    setIsApplyingFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      kategori: '',
      urgensi: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.kategori) params.append('kategori', filters.kategori);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/laporan/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan-Export-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor laporan ke PDF');
    }
  };

  const toggleSelect = (id) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter(i => i !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(r => r.id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedReports.length === 0) return;
    if (newStatus === 'SELESAI') {
      alert(lang === 'ID' ? 'Status SELESAI wajib dilengkapi dengan bukti pengerjaan dan foto realisasi. Silakan ubah secara individu melalui halaman detail masing-masing laporan.' : 'Status COMPLETED must include proof of work and completion photo. Please update individually via the detail page of each report.');
      return;
    }
    
    try {
      setIsUpdatingBulk(true);
      const response = await api.put('/laporan/bulk/status', { 
        ids: selectedReports, 
        status: newStatus 
      });
      if (response.data.success) {
        setSelectedReports([]);
        setIsStatusMenuOpen(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status laporan');
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const handleAssignClick = (report) => {
    setSelectedReportToAssign(report);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedAdminId) return alert('Silakan pilih admin');
    try {
      const response = await api.put(`/laporan/${selectedReportToAssign.id}/assign`, { adminId: selectedAdminId });
      if (response.data.success) {
        fetchReports();
        setIsAssignModalOpen(false);
        setSelectedReportToAssign(null);
        setSelectedAdminId('');
        alert('Laporan berhasil ditugaskan');
      }
    } catch (error) {
      console.error('Error assigning report:', error);
      alert('Gagal menugaskan laporan');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0 || !window.confirm('Yakin ingin menghapus laporan terpilih?')) return;
    
    try {
      await api.post('/laporan/bulk/delete', { ids: selectedReports });
      setSelectedReports([]);
      fetchReports();
    } catch (error) {
      console.error('Error deleting reports:', error);
    }
  };

  const getUrgencyColor = (u) => {
    switch (u) {
      case 'Tinggi': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'Sedang': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Rendah': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'PROSES': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SELESAI': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
      case 'DITOLAK': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const translateStatus = (s) => {
    if (lang === 'ID') return s;
    if (s === 'PROSES') return 'IN PROCESS';
    if (s === 'SELESAI') return 'COMPLETED';
    if (s === 'DITOLAK') return 'REJECTED';
    return s;
  };

  const translateUrgency = (u) => {
    if (lang === 'ID') return u;
    if (u === 'Tinggi') return 'High';
    if (u === 'Sedang') return 'Medium';
    if (u === 'Rendah') return 'Low';
    return u;
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

  const totalPages = Math.ceil(totalReports / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalReports);

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Admin &gt; Laporan</p>
              <div className="flex items-center gap-4">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t.laporan_manage_title}</h2>
                 <span className="bg-green-100 dark:bg-green-900/30 text-[#2d5a1e] dark:text-green-400 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
                    {reports.length} {lang === 'ID' ? 'laporan' : 'reports'}
                 </span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Link to="/admin/buat-laporan" className="bg-[#2d5a1e] text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 active:scale-95">
                 <Plus className="w-5 h-5" /> {t.dash_btn_create}
              </Link>
              <button 
                onClick={handleExportPDF}
                className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
              >
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
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
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
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t.manage_rep_all_cat}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.nama}>{cat.nama}</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.manage_rep_urgency}</label>
                 <select 
                   name="urgensi"
                   value={filters.urgensi}
                   onChange={handleFilterChange}
                   className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t.manage_rep_all_urgency}</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
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
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none transition-all" 
                    />
                    <input 
                      type="date" 
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none transition-all" 
                    />
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:col-span-1 2xl:col-span-1">
                <button 
                  onClick={handleApplyFilters}
                  disabled={isApplyingFilters}
                  className="flex-1 bg-[#2d5a1e] text-white px-4 h-[56px] rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 active:scale-95"
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

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30">
                       <th className="px-10 py-6 w-10">
                          <button 
                            onClick={toggleSelectAll}
                            className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedReports.length === reports.length && reports.length > 0 ? 'bg-[#2d5a1e] border-[#2d5a1e]' : 'border-gray-300 dark:border-gray-600 hover:border-[#2d5a1e]'}`}
                          >
                             {selectedReports.length === reports.length && reports.length > 0 && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                          </button>
                       </th>
                       <th className="px-10 py-6">{t.laporan_id}</th>
                       <th className="px-10 py-6">{t.report_label_title}</th>
                       <th className="px-10 py-6">{t.laporan_reporter}</th>
                       <th className="px-10 py-6">{t.report_label_category}</th>
                       <th className="px-10 py-6 text-center">{t.laporan_urgency}</th>
                       <th className="px-10 py-6 text-center">Status</th>
                       <th className="px-10 py-6">Admin</th>
                       <th className="px-10 py-6">{t.detail_info_date}</th>
                       <th className="px-10 py-6">{t.laporan_action}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {isLoading ? (
                      <tr><td colSpan="10" className="text-center py-20 text-gray-500 font-medium">{t.laporan_loading}</td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan="10" className="text-center py-20 text-gray-500 font-medium">{t.laporan_empty}</td></tr>
                    ) : reports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`transition-all duration-200 group ${selectedReports.includes(report.id) ? 'bg-green-50/30 dark:bg-green-900/5' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'}`}
                      >
                         <td className="px-10 py-8">
                            <button 
                              onClick={() => toggleSelect(report.id)}
                              className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedReports.includes(report.id) ? 'bg-[#2d5a1e] border-[#2d5a1e]' : 'border-gray-200 dark:border-gray-700 group-hover:border-[#2d5a1e]'}`}
                            >
                               {selectedReports.includes(report.id) && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                            </button>
                         </td>
                         <td className="px-10 py-8">
                            <Link to={`/laporan/${report.id}`} className="text-sm font-black text-gray-400 tracking-wider hover:text-[#2d5a1e] transition-all">
                               LPR-{report.id}
                            </Link>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex flex-col gap-2">
                               <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{report.judul}</p>
                               <p className="text-[10px] font-bold text-[#2d5a1e] uppercase tracking-widest">{translateCategory(report.kategori)}</p>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden shadow-sm ring-2 ring-gray-100 dark:ring-gray-700">
                                   {report.user?.foto_profil ? (
                                      <img src={`http://localhost:5000${report.user.foto_profil}`} className="w-full h-full rounded-full object-cover" alt="User" />
                                   ) : (
                                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(report.user?.nama || 'User')}&background=random&size=80&bold=true&format=svg`} className="w-full h-full rounded-full object-cover" alt="User" />
                                   )}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{report.user?.nama || 'Anonim'}</span>
                                </div>
                             </div>
                          </td>
                         <td className="px-10 py-8">
                            <span className="text-xs font-bold text-gray-400">{translateCategory(report.kategori || '-')}</span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getUrgencyColor(report.urgensi || 'Rendah')}`}>
                               {translateUrgency(report.urgensi || 'Rendah')}
                            </span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(report.status)}`}>
                               {translateStatus(report.status)}
                            </span>
                         </td>
                         <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                                {report.assignedAdmin ? (
                                  <>
                                     <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden shadow-sm ring-2 ring-gray-100 dark:ring-gray-700">
                                        {report.assignedAdmin?.foto_profil ? (
                                           <img src={`http://localhost:5000${report.assignedAdmin.foto_profil}`} className="w-full h-full rounded-full object-cover" alt="Admin" />
                                        ) : (
                                           <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(report.assignedAdmin?.nama || 'Admin')}&background=random&size=80&bold=true&format=svg`} className="w-full h-full rounded-full object-cover" alt="Admin" />
                                        )}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{report.assignedAdmin?.nama || 'Admin'}</span>
                                     </div>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-gray-400 italic">Belum ditugaskan</span>
                                )}
                             </div>
                          </td>
                         <td className="px-10 py-8 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                               {!report.assignedAdmin && (
                                 <button 
                                   onClick={() => handleAssignClick(report)}
                                   title={t.laporan_assign}
                                   className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-blue-500 transition-all"
                                 >
                                    <UserPlus className="w-4 h-4" />
                                 </button>
                               )}
                               <Link to={`/laporan/${report.id}`} className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-[#2d5a1e] transition-all">
                                  <MessageSquare className="w-4 h-4" />
                               </Link>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="p-8 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400">
                Menampilkan {startIndex}-{endIndex} dari {totalReports} laporan
              </p>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1}
                   className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                   const pageNum = i + 1;
                   return (
                     <button 
                       key={pageNum}
                       onClick={() => setCurrentPage(pageNum)}
                       className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pageNum === currentPage ? 'bg-[#2d5a1e] text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800'}`}
                     >
                       {pageNum}
                     </button>
                   );
                 })}
                 {totalPages > 5 && (
                   <>
                     <span className="text-gray-400">...</span>
                     <button 
                       onClick={() => setCurrentPage(totalPages)}
                       className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${totalPages === currentPage ? 'bg-[#2d5a1e] text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800'}`}
                     >
                       {totalPages}
                     </button>
                   </>
                 )}
                 <button 
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                   className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
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
                   onClick={() => alert("Gunakan tombol assign di masing-masing baris tabel untuk menugaskan.")}
                   className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-blue-400 transition-all"
                 >
                    <UserPlus className="w-4 h-4" /> {t.manage_rep_assign}
                 </button>
                
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
        {isAssignModalOpen && selectedReportToAssign && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAssignModalOpen(false)}></div>
             <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-[#2d5a1e]">
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{t.laporan_assign_title}</h3>
                      <p className="text-[10px] font-black text-green-200/60 uppercase tracking-widest mt-1">LPR-{selectedReportToAssign.id}</p>
                   </div>
                   <button onClick={() => setIsAssignModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{lang === 'ID' ? 'Detail Laporan' : 'Report Details'}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mb-1">{selectedReportToAssign.judul}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{selectedReportToAssign.deskripsi}</p>
                   </div>

                   {/* Assign Self Button */}
                   <button 
                    onClick={async () => {
                      try {
                        const response = await api.put(`/laporan/${selectedReportToAssign.id}/assign`, { adminId: user.id });
                        if (response.data.success) {
                          fetchReports();
                          setIsAssignModalOpen(false);
                          setSelectedReportToAssign(null);
                          alert('Anda berhasil mengambil alih laporan ini!');
                        }
                      } catch (error) {
                        console.error('Error assigning self:', error);
                        alert('Gagal mengambil alih laporan');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#2d5a1e] to-green-700 text-white px-6 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95"
                   >
                     <UserPlus className="w-5 h-5" /> {lang === 'ID' ? 'Ambil Alih Sendiri' : 'Take Over Myself'}
                   </button>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'ID' ? 'Pilih Admin Wilayah Lain' : 'Select Other Regional Admin'}</label>
                      <div className="grid gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {admins.length === 0 ? (
                          <p className="text-xs text-center py-4 text-gray-400 italic">{lang === 'ID' ? 'Tidak ada admin lain tersedia' : 'No other admins available'}</p>
                        ) : admins.filter(a => a.id !== user.id).map((admin) => (
                          <button
                            key={admin.id}
                            onClick={() => setSelectedAdminId(admin.id)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedAdminId === admin.id ? 'bg-green-50 border-[#2d5a1e] text-[#2d5a1e]' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${selectedAdminId === admin.id ? 'bg-[#2d5a1e] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {admin.nama?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black">{admin.nama}</p>
                               <p className="text-[10px] opacity-60 font-bold">{admin.email}</p>
                            </div>
                            {selectedAdminId === admin.id && <Check className="w-5 h-5 stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                   <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">{t.laporan_cancel}</button>
                   <button onClick={handleAssign} disabled={!selectedAdminId} className="flex-1 bg-[#2d5a1e] text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50">{t.laporan_assign_now}</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLaporan;
