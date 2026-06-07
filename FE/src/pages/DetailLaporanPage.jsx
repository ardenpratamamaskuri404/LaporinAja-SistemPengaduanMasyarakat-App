import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminLayout from '../layouts/AdminLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { 
  ChevronRight, ChevronLeft, Edit, Trash2, Share2, 
  MapPin, Clock, Star, Copy, Send,
  Download, CheckCircle2, Loader2, AlertCircle, ArrowLeft,
  X, Plus, Camera, Image as ImageIcon, Map as MapIcon, Check, FileText, Lock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const DetailLaporanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useSettings();
  const t = translations[lang];

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Lightbox Modal States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (imagesList, startIndex) => {
    setLightboxImages(imagesList);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    if (lightboxImages.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    }
  };

  const handlePrevLightbox = (e) => {
    e.stopPropagation();
    if (lightboxImages.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages]);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const commentsEndRef = useRef(null);

  // Auto-scroll to bottom of comments
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time polling for comments every 3 seconds
  useEffect(() => {
    if (!id) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get(`/laporan/${id}`);
        if (res.data?.success) {
          setReport(res.data.data);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [id]);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ judul: '', deskripsi: '', latitude: null, longitude: null });
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Status update states
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionData, setCompletionData] = useState({ keterangan: '', fotos: [] });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const completionFileRef = useRef(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/laporan/${id}`);
      if (res.data?.success) {
        setReport(res.data.data);
        if (res.data.data.rating) {
          setRating(res.data.data.rating.nilai);
        }
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      const res = await api.post(`/comment/${id}`, { isi: comment });
      if (res.data?.success) {
        setComment('');
        await fetchReport();
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.detail_delete_confirm)) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/laporan/${id}`);
      if (res.data?.success) {
        navigate('/laporan');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleRating = async () => {
    if (rating < 1) return;
    setSubmittingRating(true);
    try {
      const res = await api.post(`/laporan/${id}/rating`, { nilai: rating, komentar: ratingComment });
      if (res.data?.success) {
        alert(t.detail_rating_success);
        fetchReport();
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/laporan/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan-${report.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(t.detail_pdf_failed);
    } finally {

      setDownloading(false);
    }
  };

  const handleStartEdit = () => {
    setEditData({ 
      judul: report.judul, 
      deskripsi: report.deskripsi,
      latitude: report.latitude,
      longitude: report.longitude
    });
    setNewPhotos([]);
    setDeletedPhotos([]);
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + (report.fotos?.length || 0) - deletedPhotos.length > 3) {
      return alert(t.detail_limit_photo);
    }

    setNewPhotos([...newPhotos, ...files]);
  };

  const toggleDeletePhoto = (photoId) => {
    if (deletedPhotos.includes(photoId)) {
      setDeletedPhotos(deletedPhotos.filter(id => id !== photoId));
    } else {
      setDeletedPhotos([...deletedPhotos, photoId]);
      setActiveImage(0); // Reset to first photo to avoid index out of bounds
    }
  };

  const handleSaveEdit = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('judul', editData.judul);
      formData.append('deskripsi', editData.deskripsi);
      formData.append('latitude', editData.latitude);
      formData.append('longitude', editData.longitude);
      
      if (deletedPhotos.length > 0) {
        formData.append('deletedFotos', JSON.stringify(deletedPhotos));
      }

      newPhotos.forEach(photo => {
        formData.append('foto', photo);
      });

      const res = await api.put(`/laporan/${id}`, formData);

      if (res.data?.success) {
        setReport(res.data.data);
        setIsEditing(false);
        setNewPhotos([]);
        setDeletedPhotos([]);
        alert(t.detail_update_success);
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus !== 'SELESAI' && !window.confirm(`Ubah status laporan menjadi ${newStatus}?`)) return;
    
    setIsUpdatingStatus(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      if (newStatus === 'SELESAI') {
        formData.append('keterangan_selesai', completionData.keterangan);
        if (completionData.fotos.length > 0) {
          completionData.fotos.forEach(foto => {
            formData.append('foto_selesai', foto);
          });
        }
      }

      const res = await api.put(`/laporan/${id}/status`, formData);

      if (res.data?.success) {
        setIsCompletionModalOpen(false);
        setCompletionData({ keterangan: '', fotos: [] });
        fetchReport();
        alert(lang === 'ID' ? 'Status laporan berhasil diperbarui' : 'Report status updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleShareWA = () => {
    const text = `Halo, saya ingin membagikan laporan pengaduan: ${report.judul}. Cek detailnya di: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(t.detail_share_success);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString(lang === 'ID' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' }) + (lang === 'ID' ? ' WIB' : '');

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

  const renderContentWithLayout = (children) => {
    if (user?.role === 'ADMIN') return <AdminLayout>{children}</AdminLayout>;
    if (user?.role === 'SUPER_ADMIN') return <SuperAdminLayout>{children}</SuperAdminLayout>;
    return (
      <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        {children}
        <Footer />
      </div>
    );
  };


  if (loading) {
    return renderContentWithLayout(
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2d5a1e]" />
      </div>
    );
  }

  if (!report) {
    return renderContentWithLayout(
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <AlertCircle className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500 font-bold">{lang === 'ID' ? 'Laporan tidak ditemukan' : 'Report not found'}</p>
        <button onClick={() => navigate(-1)} className="text-[#2d5a1e] font-bold text-sm hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> {lang === 'ID' ? 'Kembali' : 'Back'}</button>
      </div>
    );
  }

  const currentCoords = [
    parseFloat(isEditing ? editData.latitude : report.latitude) || -6.2088,
    parseFloat(isEditing ? editData.longitude : report.longitude) || 106.8456
  ];

  const statusColor = report.status === 'SELESAI' ? 'text-green-600 bg-green-50' : report.status === 'PROSES' ? 'text-blue-600 bg-blue-50' : report.status === 'DITOLAK' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';

  // Reverse to make chronological and filter consecutive duplicates
  const uniqueHistories = [...(report.statushistory || [])]
    .reverse()
    .filter((h, index, arr) => {
      // Keep if it's the first history, or if status changed from the previous
      return index === 0 || h.statusBaru !== arr[index - 1].statusBaru;
    });

  // Fallback: If the actual status of the report is not in the history 
  // (e.g. updated via bulk action), append it to the timeline.
  if (report.status !== 'PENDING') {
    const lastHistoryStatus = uniqueHistories.length > 0 ? uniqueHistories[uniqueHistories.length - 1].statusBaru : 'PENDING';
    if (lastHistoryStatus !== report.status) {
       uniqueHistories.push({
         statusBaru: report.status,
         createdAt: report.updatedAt || new Date().toISOString(),
         users: { nama: 'Sistem' }
       });
    }
  }

  const timeline = [
    { status: t.detail_timeline_init, date: formatDate(report.createdAt), completed: true, active: true },
    ...uniqueHistories.map(h => {
      let nameDisplay = '';
      if (h.users) {
        if (h.users.role === 'ADMIN' && h.users.kota) {
          nameDisplay = `Admin Kota ${h.users.kota}`;
        } else if (h.users.role === 'SUPER_ADMIN') {
          nameDisplay = 'Super Admin';
        } else {
          nameDisplay = h.users.nama;
        }
      }
      
      return {
      status: h.statusBaru === 'PROSES' ? t.detail_timeline_proc : h.statusBaru === 'SELESAI' ? t.detail_timeline_done : h.statusBaru === 'DITOLAK' ? t.detail_timeline_fail : h.statusBaru,
      date: formatDate(h.createdAt),
      desc: nameDisplay ? `Oleh: ${nameDisplay}` : null,
      completed: true, active: true
    }})
  ];

  return renderContentWithLayout(
      <main className={`max-w-7xl mx-auto animate-fade-in ${user?.role === 'MASYARAKAT' || !user ? 'pt-24 pb-20 px-4 sm:px-6 lg:px-8' : ''}`}>
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'SUPER_ADMIN' ? '/superadmin/dashboard' : '/dashboard'} className="hover:text-[#2d5a1e] transition-colors">{t.detail_breadcrumb_home}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={user?.role === 'ADMIN' ? '/admin/laporan' : user?.role === 'SUPER_ADMIN' ? '/superadmin/laporan' : '/laporan'} className="hover:text-[#2d5a1e] transition-colors">{t.detail_breadcrumb_list}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#2d5a1e] dark:text-green-400">#LPR-{report.id}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`${statusColor} px-4 py-1.5 rounded-xl text-xs font-bold border`}>{translateStatus(report.status)}</span>
                  <span className="bg-gray-50 dark:bg-gray-800 text-gray-500 px-4 py-1.5 rounded-xl text-xs font-bold border border-gray-100 dark:border-gray-700">{translateCategory(report.kategori)}</span>
                  {report.urgensi && <span className="bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-red-100 dark:border-red-800">{translateUrgency(report.urgensi)}</span>}
                </div>
                <div className="flex gap-2">
                  {report.status === 'PENDING' && report.userId === user?.id && !isEditing && (
                    <button onClick={handleStartEdit} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">
                      <Edit className="w-4 h-4" /> {t.detail_action_edit}
                    </button>
                  )}
                  {report.userId === user?.id && !isEditing && (
                    <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                      <Trash2 className="w-4 h-4" /> {t.detail_action_delete}
                    </button>
                  )}
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && report.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus('PROSES')} disabled={isUpdatingStatus} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30">
                      {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Terima Laporan
                    </button>
                  )}
                  {user?.role === 'ADMIN' && report.status === 'PROSES' && (
                    <button onClick={() => setIsCompletionModalOpen(true)} className="flex items-center gap-2 bg-[#2d5a1e] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-lg shadow-green-900/30">
                      <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
                    </button>
                  )}
                  <button onClick={handleShareWA} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 px-4 py-2 rounded-xl text-sm font-bold text-[#2d5a1e] dark:text-green-400 hover:bg-green-100 transition-all">
                    <Share2 className="w-4 h-4" /> {t.detail_action_share}
                  </button>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.report_label_title}</label>

                  <input 
                    type="text" 
                    value={editData.judul} 
                    onChange={(e) => setEditData({...editData, judul: e.target.value})}
                    className="w-full text-2xl font-extrabold bg-gray-50 dark:bg-gray-800 border border-[#2d5a1e] rounded-2xl px-6 py-4 outline-none dark:text-white"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">{report.judul}</h1>
                  <p className="text-gray-400 text-sm font-medium">{t.detail_reported_on} {formatDate(report.createdAt)} • {formatTime(report.createdAt)}</p>
                </>

              )}
            </div>

            {/* Photo Gallery / Slider */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t.detail_photo_docs}</h2>
                  {isEditing && (
                    <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[#2d5a1e] font-bold text-xs uppercase tracking-wider hover:opacity-70 transition-opacity">
                       <Plus className="w-4 h-4" /> {t.profile_change_photo}
                    </button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                     <div className="relative rounded-[32px] overflow-hidden aspect-square group">
                        {(() => {
                           const visiblePhotos = report.fotos?.filter(f => !deletedPhotos.includes(f.id)) || [];
                           const photoToShow = visiblePhotos[activeImage] || visiblePhotos[0] || (newPhotos.length > 0 ? { url: URL.createObjectURL(newPhotos[0]) } : null);
                           
                           return photoToShow ? (
                             <img 
                               src={photoToShow.url.startsWith('blob:') ? photoToShow.url : `http://localhost:5000${photoToShow.url}`} 
                               alt="Documentation" 
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                               onClick={() => {
                                  const urls = visiblePhotos.map(f => f.url.startsWith('blob:') ? f.url : `http://localhost:5000${f.url}`);
                                  const newUrls = newPhotos.map(p => URL.createObjectURL(p));
                                  const allUrls = [...urls, ...newUrls];
                                  openLightbox(allUrls, activeImage);
                                }}
                             />
                           ) : (
                             <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 text-gray-300">
                                <ImageIcon className="w-12 h-12" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">{t.detail_no_photo}</p>
                             </div>
                           );
                        })()}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="grid grid-cols-3 gap-3">
                        {report.fotos?.filter(f => !deletedPhotos.includes(f.id)).map((foto, idx) => (
                           <div key={foto.id || idx} className="relative group">
                              <button 
                                onClick={() => setActiveImage(idx)}
                                className={`w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#2d5a1e]' : 'border-transparent'}`}
                              >
                                 <img src={`http://localhost:5000${foto.url}`} alt="Thumb" className="w-full h-full object-cover" />
                              </button>
                              {isEditing && (
                                <button 
                                  onClick={() => toggleDeletePhoto(foto.id)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                                >
                                   <X className="w-3 h-3" />
                                </button>
                              )}
                           </div>
                        ))}
                        {isEditing && newPhotos.map((photo, idx) => (
                           <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-green-300 bg-green-50 flex items-center justify-center">
                              <img src={URL.createObjectURL(photo)} alt="New" className="w-full h-full object-cover opacity-50" />
                              <button onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-sm">
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                     </div>
                     <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                        {t.detail_photo_hint}
                     </p>
                  </div>
               </div>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.detail_section_desc}</h2>
              {isEditing ? (
                <textarea 
                  value={editData.deskripsi} 
                  onChange={(e) => setEditData({...editData, deskripsi: e.target.value})}
                  rows={6}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-[#2d5a1e] rounded-2xl px-6 py-4 outline-none dark:text-white text-sm leading-relaxed resize-none"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.deskripsi}</p>
              )}
            </div>

            {/* BUKTI PENANGANAN RESMI OLEH PETUGAS (Only visible if SELESAI and has Bukti) */}
            {report.status === 'SELESAI' && (report.keterangan_selesai || (report.fotosSelesai && report.fotosSelesai.length > 0)) && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-[40px] p-8 shadow-sm border-2 border-[#2d5a1e] dark:border-green-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#2d5a1e] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#2d5a1e] dark:text-green-400">BUKTI PENANGANAN RESMI OLEH PETUGAS</h2>
                    <p className="text-[10px] font-bold text-green-700/60 dark:text-green-400/60 uppercase tracking-widest">Penyelesaian Laporan</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-green-800/60 dark:text-green-400/60 uppercase tracking-widest mb-3">Keterangan Hasil Kerja</h3>
                    <p className="text-green-900 dark:text-green-100 leading-relaxed font-medium bg-white/50 dark:bg-black/20 p-5 rounded-3xl">
                      {report.keterangan_selesai || '-'}
                    </p>
                  </div>
                  {report.fotosSelesai && report.fotosSelesai.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-green-800/60 dark:text-green-400/60 uppercase tracking-widest mb-3">Foto Realisasi</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {report.fotosSelesai.map((foto, idx) => (
                          <div 
                            key={idx} 
                            className="rounded-2xl overflow-hidden aspect-square bg-black/5 cursor-zoom-in group relative"
                            onClick={() => {
                              const urls = report.fotosSelesai.map(f => `http://localhost:5000${f.url}`);
                              openLightbox(urls, idx);
                            }}
                          >
                            <img 
                              src={`http://localhost:5000${foto.url}`} 
                              alt={`Bukti Selesai ${idx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t.detail_section_loc}</h2>
                   {isEditing && (
                     <span className="text-[10px] font-black text-[#2d5a1e] bg-green-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <MapIcon className="w-3 h-3" /> {t.detail_change_point}
                     </span>
                   )}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                  <MapPin className="w-5 h-5 text-[#2d5a1e] dark:text-green-400" />
                  {report.alamat || report.kota || '-'}
                </div>
              </div>
              <div className="h-96 w-full z-0 relative">
                <MapContainer center={currentCoords} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {isEditing ? (
                    <LocationPicker position={currentCoords} setPosition={(pos) => setEditData({...editData, latitude: pos[0], longitude: pos[1]})} />
                  ) : (
                    <Marker position={currentCoords}><Popup>{report.judul}</Popup></Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-[#2d5a1e] animate-bounce-subtle">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all">
                  {t.laporan_cancel}
                </button>
                <button onClick={handleSaveEdit} disabled={updating} className="flex-1 py-4 rounded-2xl font-bold text-white bg-[#2d5a1e] hover:bg-[#1e3f14] shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {t.btn_save_changes}</>}
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.detail_section_discussion}</h2>
                  <p className="text-xs text-gray-400 mt-1">{report.comment?.length || 0} {t.detail_discussion_total} • {lang === 'ID' ? 'Diperbarui otomatis' : 'Auto-updated'}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">{lang === 'ID' ? 'Live' : 'Live'}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 scroll-smooth">
                {(report.comment || []).length === 0 ? (
                  <div className="text-center py-12 opacity-40">
                    <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.detail_discussion_empty}</p>
                    <p className="text-xs text-gray-400 mt-1">{lang === 'ID' ? 'Jadilah yang pertama berkomentar' : 'Be the first to comment'}</p>
                  </div>
                ) : (
                  (report.comment || []).map((c) => {
                    const isOfficial = c.users?.role === 'ADMIN' || c.users?.role === 'SUPER_ADMIN';
                    const isMe = c.users?.id === user?.id;
                    const isMeOrOfficial = isMe || isOfficial;
                    return (
                      <div key={c.id} className={`flex gap-3 ${isMeOrOfficial ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                          isOfficial ? 'bg-[#2d5a1e] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {c.users?.nama?.[0]?.toUpperCase() || '?'}
                        </div>
                        {/* Bubble */}
                        <div className={`max-w-[75%] space-y-1 ${isMeOrOfficial ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`flex items-center gap-2 ${isMeOrOfficial ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{c.users?.nama || 'Anonim'}</span>
                            {isOfficial && (
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                c.users?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {c.users?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} ✓
                              </span>
                            )}
                          </div>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isOfficial
                              ? 'bg-[#2d5a1e] text-white rounded-tr-none'
                              : isMe
                              ? 'bg-blue-500 text-white rounded-tr-none'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-none'
                          }`}>
                            {c.isi}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">
                            {new Date(c.createdAt).toLocaleTimeString(lang === 'ID' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })} · {formatDate(c.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-50 dark:border-gray-800 pt-6">
                {user ? (
                  <div className="flex items-end gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2d5a1e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user?.nama?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendComment();
                          }
                        }}
                        placeholder={t.detail_discussion_hint}
                        rows={2}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-[#2d5a1e] rounded-2xl py-3 pl-4 pr-14 text-sm focus:outline-none transition-all dark:text-white resize-none"
                      />
                      <button
                        onClick={handleSendComment}
                        disabled={sendingComment || !comment.trim()}
                        className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-[#2d5a1e] text-white flex items-center justify-center hover:bg-[#1e3f14] transition-all disabled:opacity-50 active:scale-90"
                      >
                        {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm text-gray-500">{lang === 'ID' ? 'Login untuk ikut berdiskusi' : 'Login to join the discussion'}</p>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2 ml-12">{lang === 'ID' ? 'Tekan Enter untuk kirim, Shift+Enter untuk baris baru' : 'Press Enter to send, Shift+Enter for new line'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">{t.detail_timeline_title}</h2>
              <div className="space-y-0">
                {timeline.map((step, i) => (
                  <div key={i} className="flex gap-4 min-h-[80px]">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${step.completed ? 'bg-[#2d5a1e] text-white' : 'bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700'}`}>
                        {step.completed && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      {i !== timeline.length - 1 && <div className={`w-0.5 flex-1 ${step.completed ? 'bg-[#2d5a1e]' : 'bg-gray-100 dark:bg-gray-800'}`}></div>}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{step.status}</h3>
                      <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                      {step.desc && <p className="text-[10px] text-[#2d5a1e] dark:text-green-400 font-bold mt-1 bg-[#2d5a1e]/5 px-2 py-0.5 rounded-md w-fit">{step.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">{t.detail_info_title}</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">{t.detail_info_reporter}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{report.user?.nama}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">{t.detail_info_category}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{translateCategory(report.kategori)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">{t.detail_info_urgency}</span>
                  <span className={`text-sm font-bold ${report.urgensi === 'Tinggi' ? 'text-red-500' : 'text-amber-500'}`}>{translateUrgency(report.urgensi || 'Sedang')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">{t.detail_info_id}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg font-mono">#LPR-{report.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">{t.detail_info_date}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
              {report.status !== 'SELESAI' ? (
                <div className="absolute inset-0 bg-gray-50/50 dark:bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center text-center p-6">
                  <div className="space-y-2">
                    <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400 leading-relaxed">{t.detail_rating_locked}</p>
                  </div>
                </div>
              ) : null}
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">{t.detail_rating_title}</h2>
              {report.rating ? (
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-8 h-8 ${s <= report.rating.nilai ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                  </div>
                  <p className="text-xs text-gray-500">{t.detail_rating_already}</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-center gap-3 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => report.status === 'SELESAI' && setRating(s)} className="transition-transform hover:scale-110">
                        <Star className={`w-8 h-8 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  {report.status === 'SELESAI' && rating > 0 && (
                    <div className="space-y-3">
                      <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
                        placeholder={t.detail_rating_hint}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e]/20 border-none dark:text-white" rows="2" />
                      <button onClick={handleRating} disabled={submittingRating}
                        className="w-full bg-[#2d5a1e] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#1e3f14] transition-all disabled:opacity-50">
                        {submittingRating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.detail_rating_btn}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">{t.detail_export_share}</h2>
              <div className="space-y-3">
                <button onClick={handleDownloadPDF} disabled={downloading} className="w-full flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 hover:bg-green-100 transition-all text-sm font-bold text-[#2d5a1e] dark:text-green-400 group">
                  <div className="flex items-center gap-3">
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {t.detail_download_pdf}
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={handleCopyLink} className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-bold text-gray-700 dark:text-gray-200 group">
                  <div className="flex items-center gap-3"><Copy className="w-4 h-4 text-gray-400 group-hover:text-[#2d5a1e]" /> {t.detail_share_copy}</div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
                <button onClick={handleShareWA} className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-bold text-gray-700 dark:text-gray-200 group">
                  <div className="flex items-center gap-3"><Share2 className="w-4 h-4 text-gray-400 group-hover:text-green-500" /> {t.detail_share_wa}</div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {isCompletionModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsCompletionModalOpen(false)}></div>
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-[#2d5a1e]">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Formulir Bukti Selesai</h3>
                  <p className="text-[10px] font-black text-green-200/60 uppercase tracking-widest mt-1">LPR-{report.id}</p>
                </div>
                <button onClick={() => setIsCompletionModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan Hasil Kerja *</label>
                  <textarea
                    value={completionData.keterangan}
                    onChange={(e) => setCompletionData({...completionData, keterangan: e.target.value})}
                    placeholder="Deskripsikan apa saja yang sudah diperbaiki..."
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all dark:text-white resize-none"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unggah Foto Realisasi (Opsional, Max 10 foto)</label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {completionData.fotos.map((foto, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#2d5a1e]">
                        <img src={URL.createObjectURL(foto)} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => setCompletionData({...completionData, fotos: completionData.fotos.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {completionData.fotos.length < 10 && (
                      <button onClick={() => completionFileRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#2d5a1e] flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 transition-all">
                        <Camera className="w-6 h-6 text-gray-400" />
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <input type="file" ref={completionFileRef} onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newFotos = Array.from(e.target.files);
                      setCompletionData({...completionData, fotos: [...completionData.fotos, ...newFotos].slice(0, 10)});
                    }
                  }} className="hidden" accept="image/*" multiple />
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Max 10 foto, total ukuran 20MB</p>
                </div>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
                <button onClick={() => setIsCompletionModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Batal</button>
                <button 
                  onClick={() => handleUpdateStatus('SELESAI')} 
                  disabled={!completionData.keterangan || isUpdatingStatus} 
                  className="flex-1 bg-[#2d5a1e] text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Kirim Bukti & Selesai
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && lightboxImages.length > 0 && (
          <div 
            className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-fade-in"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 z-[3100] active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Button */}
            {lightboxImages.length > 1 && (
              <button 
                onClick={handlePrevLightbox}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 z-[3100] active:scale-90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image Container */}
            <div 
              className="max-w-[90vw] max-h-[80vh] flex items-center justify-center select-none"
              onClick={(e) => e.stopPropagation()} // Prevent close on image click
            >
              <img 
                src={lightboxImages[lightboxIndex]} 
                alt={`Lightbox image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/5 animate-zoom-in"
              />
            </div>

            {/* Right Button */}
            {lightboxImages.length > 1 && (
              <button 
                onClick={handleNextLightbox}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 z-[3100] active:scale-90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Counter & Indicators */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2">
              <span className="text-sm font-bold text-white/60 tracking-wider">
                {lightboxIndex + 1} / {lightboxImages.length}
              </span>
              {lightboxImages.length > 1 && (
                <div className="flex gap-1.5 mt-2">
                  {lightboxImages.map((_, i) => (
                    <button 
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === lightboxIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    );
};

export default DetailLaporanPage;

