import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
  Search, Filter, Calendar, Grid, List, 
  ChevronRight, MapPin, Clock, Tag, X,
  ChevronLeft, Loader2, LayoutGrid, AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const LaporanSayaPage = () => {
  const { user } = useAuth();
  const { lang } = useSettings();
  const t = translations[lang];

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const limit = 6;

  useEffect(() => {
    fetchReports();
  }, [page]);

  useEffect(() => {
    // Fetch categories
    api.get('/kategori').then(res => {
      if (res.data?.success) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userId', user?.id);
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);
      if (category) params.append('kategori', category);
      if (search) params.append('search', search);

      const res = await api.get(`/laporan?${params.toString()}`);
      if (res.data?.success) {
        let data = res.data.data;
        // Client-side date filtering
        if (dateFrom) data = data.filter(r => new Date(r.createdAt) >= new Date(dateFrom));
        if (dateTo) data = data.filter(r => new Date(r.createdAt) <= new Date(dateTo + 'T23:59:59'));
        setReports(data);
        setTotalCount(res.data.pagination?.total || data.length);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchReports();
  };

  const handleReset = () => {
    setStatus('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
    setTimeout(fetchReports, 0);
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'PROSES': return 'bg-blue-500';
      case 'SELESAI': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'DITOLAK': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case 'PROSES': return lang === 'ID' ? 'Diproses' : 'Processing';
      case 'SELESAI': return lang === 'ID' ? 'Selesai' : 'Completed';
      case 'PENDING': return 'Pending';
      case 'DITOLAK': return lang === 'ID' ? 'Ditolak' : 'Rejected';
      default: return s;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t.reports_title}
            </h1>
            <span className="bg-[#2d5a1e]/10 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              {totalCount} {lang === 'ID' ? 'laporan' : 'reports'}
            </span>
          </div>

          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit self-end md:self-auto">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#2d5a1e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Grid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#2d5a1e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 mb-10 shadow-sm transition-colors">
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{lang === 'ID' ? 'Cari Laporan' : 'Search Report'}</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5a1e] transition-colors" />
                  <input type="text" placeholder={t.reports_filter_search} value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 focus:border-[#2d5a1e] transition-all text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 focus:border-[#2d5a1e] appearance-none transition-all text-gray-900 dark:text-white">
                  <option value="">{t.reports_filter_status}</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROSES">{lang === 'ID' ? 'Diproses' : 'Processing'}</option>
                  <option value="SELESAI">{lang === 'ID' ? 'Selesai' : 'Completed'}</option>
                  <option value="DITOLAK">{lang === 'ID' ? 'Ditolak' : 'Rejected'}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{lang === 'ID' ? 'Kategori' : 'Category'}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#2d5a1e]/10 focus:border-[#2d5a1e] appearance-none transition-all text-gray-900 dark:text-white">
                  <option value="">{t.reports_filter_category}</option>
                  {categories.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <button onClick={handleApplyFilter} className="flex-1 bg-[#2d5a1e] text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/20 active:scale-95 flex items-center justify-center gap-2">
                  <Filter className="w-4 h-4" /> {t.reports_filter_apply}
                </button>
                <button onClick={handleReset} className="text-gray-400 hover:text-red-500 font-bold text-sm px-3 py-3.5 transition-all">
                  {t.reports_filter_reset}
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-6 border-t border-gray-50 dark:border-gray-800/50">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t.reports_filter_date}</label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]/20 transition-all text-gray-900 dark:text-white" />
                </div>
                <span className="text-gray-300 font-bold">―</span>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]/20 transition-all text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#2d5a1e]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-16 text-center">
            <AlertCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg mb-2">{lang === 'ID' ? 'Belum ada laporan' : 'No reports yet'}</p>
            <p className="text-gray-400 text-sm mb-6">{lang === 'ID' ? 'Mulai buat laporan pertama Anda sekarang.' : 'Start creating your first report now.'}</p>
            <Link to="/buat-laporan" className="inline-flex items-center gap-2 bg-[#2d5a1e] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#1e3f14] transition-all">
              {lang === 'ID' ? 'Buat Laporan' : 'Create Report'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report) => (
              <Link key={report.id} to={`/laporan/${report.id}`}
                className="group bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#2d5a1e]/10 to-[#2d5a1e]/5">
                  {report.fotos?.length > 0 ? (
                    <img src={`http://localhost:5000${report.fotos[0].url}`} alt={report.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><LayoutGrid className="w-16 h-16 text-[#2d5a1e]/20" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className={`absolute top-4 right-4 ${getStatusColor(report.status)} text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                    {getStatusLabel(report.status)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">#LPR-{report.id}</span>
                    <span className="text-[10px] font-bold text-[#2d5a1e] dark:text-green-400 bg-[#2d5a1e]/10 dark:bg-green-900/20 px-2 py-1 rounded-lg">{translateCategory(report.kategori)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-[#2d5a1e] dark:group-hover:text-green-400 transition-colors">
                    {report.judul}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{report.kota || report.alamat || '-'}</span>
                  </div>
                  <div className="pt-5 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(report.createdAt)}
                    </div>
                    <span className="text-xs font-bold text-[#2d5a1e] dark:text-green-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t.reports_view_detail} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Link key={report.id} to={`/laporan/${report.id}`}
                className="group bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-[#2d5a1e]/10 to-[#2d5a1e]/5">
                  {report.fotos?.length > 0 ? (
                    <img src={`http://localhost:5000${report.fotos[0].url}`} alt={report.judul} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><LayoutGrid className="w-8 h-8 text-[#2d5a1e]/20" /></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-gray-400">#LPR-{report.id}</span>
                    <div className={`${getStatusColor(report.status)} w-2 h-2 rounded-full`}></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{getStatusLabel(report.status)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-[#2d5a1e] transition-colors">{report.judul}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs"><Tag className="w-3.5 h-3.5" />{translateCategory(report.kategori)}</div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs"><MapPin className="w-3.5 h-3.5" />{report.kota || report.alamat || '-'}</div>
                  </div>
                </div>
                <div className="pr-4 text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{formatDate(report.createdAt)}</p>
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-[#2d5a1e] group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 dark:border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              {lang === 'ID' ? 'Menampilkan' : 'Showing'} <span className="font-bold text-gray-700 dark:text-gray-200">{(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)}</span> {lang === 'ID' ? 'dari' : 'of'} <span className="font-bold text-gray-700 dark:text-gray-200">{totalCount}</span> {lang === 'ID' ? 'laporan' : 'reports'}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${p === page ? 'bg-[#2d5a1e] text-white shadow-lg shadow-green-900/20' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LaporanSayaPage;
