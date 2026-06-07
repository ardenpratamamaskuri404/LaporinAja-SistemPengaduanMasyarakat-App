import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import { 
  ChevronRight, ChevronLeft, MapPin, Image as ImageIcon, 
  Upload, CheckCircle2, AlertCircle, Info, Send, 
  Trash2, X, Plus, LocateFixed,
  Road, Hospital, GraduationCap, Leaf, Zap, Building2, Sparkles, MessageCircle, Layers
} from 'lucide-react';

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ICON_MAP = {
  Road,
  Hospital,
  GraduationCap,
  Leaf,
  Zap,
  Building2,
  Sparkles,
  MessageCircle,
  Layers
};

const CategoryIcon = ({ iconName, className = 'w-6 h-6' }) => {
  const Icon = ICON_MAP[iconName] || MessageCircle;
  return <Icon className={className} />;
};

const AdminBuatLaporan = () => {
  const { user } = useAuth();
  const { lang } = useSettings();
  const t = translations[lang];
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: '',
    urgensi: 'Sedang',
    deskripsi: '',
    tanggal: '',
    riwayat: 'Tidak',
    latitude: -6.4025, // default depok
    longitude: 106.7942,
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    jenis_laporan: 'INTERNAL',
    nama_pelapor_offline: '',
    foto: []
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/kategori');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Initialize coordinates based on user's city
  useEffect(() => {
    if (user && user.kota) {
      const cityCoords = {
        'subang': { lat: -6.5614, lng: 107.7587 },
        'depok': { lat: -6.4025, lng: 106.7942 },
        'jakarta': { lat: -6.2088, lng: 106.8456 },
        'bandung': { lat: -6.9175, lng: 107.6191 },
        'bogor': { lat: -6.5971, lng: 106.7932 },
        'bekasi': { lat: -6.2383, lng: 106.9756 },
        'tangerang': { lat: -6.1702, lng: 106.6403 }
      };
      const c = cityCoords[user.kota.toLowerCase()];
      if (c) {
        setFormData(prev => ({
          ...prev,
          latitude: c.lat,
          longitude: c.lng,
          kota: user.kota
        }));
      } else {
        setFormData(prev => ({ ...prev, kota: user.kota }));
      }
    }
  }, [user]);

  const [previews, setPreviews] = useState([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_laporan');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setFormData(prev => ({ ...prev, ...parsed, foto: [] })); // Files can't be stored in localStorage
      setStep(parsed.step || 1);
    }
  }, []);

  // Save draft to localStorage whenever formData or step changes
  useEffect(() => {
    const { foto, ...draftData } = formData;
    localStorage.setItem('draft_laporan', JSON.stringify({ ...draftData, step }));
  }, [formData, step]);

  // Reverse geocoding function
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const address = data.address;
          
          // Build alamat lengkap
          let alamatLengkap = '';
          if (address.road) alamatLengkap += address.road;
          if (address.house_number) alamatLengkap += ` No. ${address.house_number}`;
          if (address.neighbourhood) alamatLengkap += `, ${address.neighbourhood}`;
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            alamat: alamatLengkap || prev.alamat,
            kelurahan: address.village || address.neighbourhood || address.quarter || address.hamlet || prev.kelurahan,
            kecamatan: address.subdistrict || address.city_district || address.suburb || address.district || address.township || address.municipality || prev.kecamatan,
            kota: address.city || address.town || address.city_municipal || address.county || address.municipality || prev.kota
          }));
        }
      }
    } catch (geoErr) {
      console.error('Reverse geocoding error:', geoErr);
      // If geocoding fails, at least set the coordinates
      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    }
  };

  // Map click handler component
  const LocationPicker = () => {
    const map = useMapEvents({
      click(e) {
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });

    useEffect(() => {
      if (formData.latitude && formData.longitude && map) {
        map.setView([formData.latitude, formData.longitude], map.getZoom());
      }
    }, [formData.latitude, formData.longitude, map]);

    return (
      <Marker position={[formData.latitude, formData.longitude]} />
    );
  };

  const handleNext = () => {
    if (step === 1 && (!formData.judul || !formData.kategori || !formData.urgensi)) {
      setError(lang === 'ID' ? 'Harap lengkapi semua bidang pada langkah ini.' : 'Please fill all fields in this step.');
      return;
    }
    if (step === 2 && !formData.deskripsi) {
       setError(lang === 'ID' ? 'Deskripsi laporan wajib diisi.' : 'Report description is required.');
       return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1 && (formData.judul || formData.deskripsi)) {
      setShowExitModal(true);
      setPendingExit(true);
    } else {
      setStep(step - 1);
    }
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
    setStep(1);
    setFormData(prev => ({ ...prev, judul: '', kategori: '', urgensi: 'Sedang', deskripsi: '', tanggal: '', riwayat: 'Tidak', alamat: '', kelurahan: '', kecamatan: '', jenis_laporan: 'INTERNAL', nama_pelapor_offline: '', foto: [] }));
    setPreviews([]);
    setAgree(false);
    setPendingExit(false);
    localStorage.removeItem('draft_laporan');
  };

  const handleExitContinue = () => {
    setShowExitModal(false);
    setPendingExit(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchAddressFromCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          alert(lang === 'ID' ? 'Gagal mendapatkan lokasi. Pastikan GPS aktif.' : 'Failed to get location. Make sure GPS is active.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert(lang === 'ID' ? 'Browser tidak mendukung geolokasi.' : 'Browser does not support geolocation.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.foto.length + files.length > 3) {
      alert(lang === 'ID' ? 'Maksimal 3 foto.' : 'Maximum 3 photos.');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setFormData({ ...formData, foto: [...formData.foto, ...files] });
  };

  const removePhoto = (index) => {
    const newFotos = [...formData.foto];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(newPreviews[index]);
    newFotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPreviews(newPreviews);
    setFormData({ ...formData, foto: newFotos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agree) {
      setError(lang === 'ID' ? 'Anda harus menyetujui syarat & ketentuan.' : 'You must agree to the terms & conditions.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('judul', formData.judul);
      data.append('deskripsi', formData.deskripsi);
      data.append('kategori', formData.kategori);
      data.append('urgensi', formData.urgensi);
      if (formData.tanggal) data.append('tanggal_kejadian', formData.tanggal);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('alamat', formData.alamat);
      data.append('kelurahan', formData.kelurahan);
      data.append('kecamatan', formData.kecamatan);
      data.append('kota', formData.kota);
      data.append('riwayat', formData.riwayat);
      data.append('jenis_laporan', formData.jenis_laporan);
      if (formData.jenis_laporan === 'OFFLINE') {
        data.append('nama_pelapor_offline', formData.nama_pelapor_offline);
      }
      
      if (formData.foto.length > 0) {
        formData.foto.forEach(file => {
          data.append('foto', file);
        });
      }

      const res = await api.post('/laporan', data);

      if (res.data.success) {
        setSuccess(true);
        localStorage.removeItem('draft_laporan');
        setTimeout(() => navigate('/admin/laporan'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'ID' ? 'Gagal mengirim laporan' : 'Failed to submit report'));
    } finally {
      setLoading(false);
    }
  };

  const urgencies = [
    { id: 'Rendah', label: lang === 'ID' ? 'Rendah' : 'Low', color: 'bg-green-50 text-green-600 border-green-100' },
    { id: 'Sedang', label: lang === 'ID' ? 'Sedang' : 'Medium', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'Tinggi', label: lang === 'ID' ? 'Tinggi' : 'High', color: 'bg-red-50 text-red-600 border-red-100' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{t.report_success_title}</h2>
          <p className="text-gray-500 leading-relaxed">{t.report_success_desc}</p>
          <div className="pt-8">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-full h-full bg-green-500 animate-progress"></div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">{lang === 'ID' ? 'Mengalihkan ke Laporan Saya...' : 'Redirecting to My Reports...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        
        {/* Breadcrumb & Header */}
        <div className="mb-10 reveal">
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
             <Link to="/" className="hover:text-[#2d5a1e]">{lang === 'ID' ? 'Beranda' : 'Home'}</Link>
             <ChevronRight className="w-3 h-3" />
             <span className="text-[#2d5a1e]">{t.report_title}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t.report_title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.report_subtitle}</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 reveal">
           <div className="flex items-center justify-between relative">
              {/* Lines */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10"></div>
              <div 
                className="absolute top-5 left-0 h-0.5 bg-[#2d5a1e] transition-all duration-500 -z-10"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>

              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center group">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${
                     step >= s 
                       ? 'bg-[#2d5a1e] text-white border-green-100 dark:border-green-900/30' 
                       : 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-50 dark:border-gray-900'
                   } ${step === s ? 'ring-4 ring-[#2d5a1e]/10 scale-110' : ''}`}>
                     {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors ${
                     step >= s ? 'text-[#2d5a1e] dark:text-green-400' : 'text-gray-300'
                   }`}>
                     {t[`report_step_${s}`]}
                   </span>
                </div>
              ))}
           </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 min-h-[500px] reveal-scale">
           
           {error && (
             <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl px-6 py-4 mb-8 font-medium animate-shake">
                <AlertCircle className="w-5 h-5" /> {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* Step 1: Info Utama */}
             {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Laporan *</label>
                      <select 
                        value={formData.jenis_laporan}
                        onChange={(e) => setFormData({...formData, jenis_laporan: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all dark:text-white"
                      >
                        <option value="INTERNAL">Laporan Internal (Temuan Petugas)</option>
                        <option value="OFFLINE">Aduan Offline (Mewakili Warga)</option>
                      </select>
                    </div>
                    {formData.jenis_laporan === 'OFFLINE' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pelapor Asli *</label>
                        <input 
                          type="text"
                          value={formData.nama_pelapor_offline}
                          onChange={(e) => setFormData({...formData, nama_pelapor_offline: e.target.value})}
                          placeholder="Contoh: Bpk. Suryo"
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2d5a1e] rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <Info className="w-4 h-4 text-[#2d5a1e]" />
                      </div>
                      {lang === 'ID' ? 'Detail Laporan' : 'Report Details'}
                    </h2>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_title} *</label>
                        <input 
                          type="text" 
                          value={formData.judul}
                          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                          placeholder={t.report_placeholder_title}
                          className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-[#2d5a1e]/5 focus:border-[#2d5a1e] transition-all outline-none dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_category} *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, kategori: cat.nama })}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group ${
                                formData.kategori === cat.nama 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-[#2d5a1e] text-[#2d5a1e]' 
                                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                              }`}
                            >
                                <div className="mb-2 group-hover:scale-125 transition-transform flex items-center justify-center">
                                  <CategoryIcon iconName={cat.icon} className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-center">{cat.nama}</span>
                            </button>
                          ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_urgency} *</label>
                        <div className="grid grid-cols-3 gap-4">
                          {urgencies.map((urg) => (
                            <button
                              key={urg.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, urgensi: urg.id })}
                              className={`py-4 rounded-2xl border text-sm font-bold transition-all ${
                                formData.urgensi === urg.id 
                                  ? urg.color + ' ring-4 ring-offset-0 ring-opacity-20 ' + urg.color.split(' ')[1].replace('text-', 'ring-')
                                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                              }`}
                            >
                                {urg.label}
                            </button>
                          ))}
                        </div>
                    </div>
                  </div>
                </div>
             )}

             {/* Step 2: Deskripsi */}
             {step === 2 && (
               <div className="space-y-8 animate-fade-in">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                     <AlertCircle className="w-4 h-4 text-[#2d5a1e]" />
                   </div>
                   {lang === 'ID' ? 'Deskripsi Laporan' : 'Report Description'}
                 </h2>

                 <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_desc} *</label>
                    <textarea 
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      placeholder={t.report_placeholder_desc}
                      rows={6}
                      className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl px-6 py-5 text-sm focus:ring-4 focus:ring-[#2d5a1e]/5 focus:border-[#2d5a1e] transition-all outline-none resize-none dark:text-white"
                    />
                    <div className="text-right mt-2">
                       <span className={`text-[10px] font-bold ${formData.deskripsi.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                         {formData.deskripsi.length}/1000
                       </span>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_date} (Opsional)</label>
                      <input 
                        type="date" 
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-[#2d5a1e]/5 focus:border-[#2d5a1e] transition-all outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_history}</label>
                      <div className="flex gap-6 mt-4 ml-1">
                         {[(lang === 'ID' ? 'Ya' : 'Yes'), (lang === 'ID' ? 'Tidak' : 'No')].map((opt) => (
                           <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative w-5 h-5">
                               <input 
                                 type="radio" 
                                 name="riwayat"
                                 checked={formData.riwayat === opt}
                                 onChange={() => setFormData({ ...formData, riwayat: opt })}
                                 className="sr-only"
                               />
                               <div className={`w-full h-full rounded-full border-2 transition-all ${
                                 formData.riwayat === opt 
                                   ? 'border-[#2d5a1e] bg-white' 
                                   : 'border-gray-200 dark:border-gray-700 bg-transparent'
                               }`}></div>
                               {formData.riwayat === opt && (
                                 <div className="absolute inset-1.5 bg-[#2d5a1e] rounded-full animate-scale"></div>
                               )}
                             </div>
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{opt}</span>
                           </label>
                         ))}
                      </div>
                    </div>
                 </div>
               </div>
             )}

             {/* Step 3: Lokasi */}
             {step === 3 && (
               <div className="space-y-8 animate-fade-in">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                     <MapPin className="w-4 h-4 text-[#2d5a1e]" />
                   </div>
                   {lang === 'ID' ? 'Lokasi Kejadian' : 'Incident Location'}
                 </h2>

                 <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={handleGetLocation}
                      className="w-full py-3 bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-green-100 dark:border-green-800 hover:bg-green-100 transition-all"
                    >
                       <LocateFixed className="w-4 h-4" /> {lang === 'ID' ? 'Ambil Lokasi Otomatis' : 'Get Auto Location'}
                    </button>
                    
                    <div className="h-[350px] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 relative shadow-inner">
                      <MapContainer 
                        center={[formData.latitude, formData.longitude]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker />
                      </MapContainer>
                      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ID' ? 'Pin Koordinat' : 'Coordinate Pin'}</span>
                         <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'ID' ? 'Geser peta atau klik untuk menandai lokasi yang tepat' : 'Drag the map or click to mark the exact location'}</p>
                 </div>

                 <div className="grid gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{t.report_label_address}</label>
                      <textarea 
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder={t.report_placeholder_address}
                        rows={2}
                        className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-[#2d5a1e]/5 focus:border-[#2d5a1e] transition-all outline-none resize-none dark:text-white"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                       <div>
                         <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t.report_label_village}</label>
                         <input 
                           type="text" 
                           value={formData.kelurahan}
                           onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                           className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1e] dark:text-white"
                         />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t.report_label_district}</label>
                         <input 
                           type="text" 
                           value={formData.kecamatan}
                           onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                           className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1e] dark:text-white"
                         />
                       </div>
                       <div>
                         <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t.report_label_city}</label>
                         <input 
                           type="text" 
                           value={formData.kota}
                           onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                           className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2d5a1e] dark:text-white"
                         />
                       </div>
                    </div>
                 </div>
               </div>
             )}

             {/* Step 4: Lampiran & Review */}
             {step === 4 && (
               <div className="space-y-10 animate-fade-in">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                     <ImageIcon className="w-4 h-4 text-[#2d5a1e]" />
                   </div>
                   {lang === 'ID' ? 'Lampiran & Pengiriman' : 'Attachments & Submission'}
                 </h2>

                 {/* Photo Upload */}
                 <div className="space-y-6">
                    <label className={`group relative w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] flex flex-col items-center justify-center gap-3 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-[#2d5a1e] transition-all cursor-pointer overflow-hidden ${formData.foto.length >= 3 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                       <input 
                         type="file" 
                         multiple
                         accept="image/jpeg,image/jpg,image/png"
                         onChange={handleFileChange}
                         disabled={formData.foto.length >= 3}
                         className="sr-only" 
                       />
                       <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#2d5a1e] transition-colors">
                          <Plus className="w-6 h-6" />
                       </div>
                       <div className="text-center">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{lang === 'ID' ? 'Klik untuk upload foto bukti' : 'Click to upload evidence photo'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{lang === 'ID' ? 'Maksimal 3 foto. Format: PNG, JPG. Ukuran maks 20MB.' : 'Max 3 photos. Format: PNG, JPG. Max 20MB.'}</p>
                       </div>
                    </label>

                    <div className="grid grid-cols-3 gap-4">
                       {previews.map((prev, idx) => (
                         <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img src={prev} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Review Card */}
                 <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[32px] p-8 space-y-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-4">{lang === 'ID' ? 'Ringkasan Laporan' : 'Report Summary'}</h3>
                    <div className="grid gap-4">
                       <div className="flex justify-between items-start gap-4">
                          <span className="text-xs font-bold text-gray-400">{lang === 'ID' ? 'Judul' : 'Title'}</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 text-right">{formData.judul}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400">{lang === 'ID' ? 'Kategori' : 'Category'}</span>
                          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-[#2d5a1e] text-[10px] font-bold rounded-full">{formData.kategori || '-'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400">{lang === 'ID' ? 'Urgensi' : 'Urgency'}</span>
                          <span className={`text-[10px] font-bold ${formData.urgensi === 'Tinggi' || formData.urgensi === 'High' ? 'text-red-500' : 'text-amber-500'}`}>! {formData.urgensi}</span>
                       </div>
                       <div className="flex justify-between items-start gap-4">
                          <span className="text-xs font-bold text-gray-400">{lang === 'ID' ? 'Lokasi' : 'Location'}</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 text-right line-clamp-2">{formData.alamat || (lang === 'ID' ? 'Ditandai di Peta' : 'Marked on Map')}</span>
                       </div>
                    </div>
                 </div>

                 {/* Agreement */}
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative w-6 h-6 flex-shrink-0 mt-0.5">
                       <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="sr-only" />
                       <div className={`w-full h-full rounded-lg border-2 transition-all ${agree ? 'border-[#2d5a1e] bg-[#2d5a1e]' : 'border-gray-200 dark:border-gray-700 group-hover:border-[#2d5a1e]'}`}>
                         {agree && <CheckCircle2 className="w-full h-full text-white p-0.5" />}
                       </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                       {t.report_agree || 'Saya setuju dengan Syarat & Ketentuan dan menyatakan bahwa informasi yang saya berikan adalah benar sesuai dengan fakta di lapangan.'}
                    </p>
                 </label>
               </div>
             )}

             {/* Navigation Buttons */}
             <div className="pt-10 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                  >
                    <ChevronLeft className="w-5 h-5" /> {t.report_btn_prev}
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-lg shadow-[#2d5a1e]/20 active:scale-[0.98]"
                  >
                    {t.report_btn_next} <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !agree}
                    className="flex items-center gap-3 bg-[#2d5a1e] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e3f14] transition-all shadow-lg shadow-[#2d5a1e]/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                       <div className="flex items-center gap-2">🚀 {t.report_btn_submit}</div>
                    )}
                  </button>
                )}
             </div>

           </form>
        </div>

        {/* Exit Confirmation Modal (Draft Modal) */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-6">
                 <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">
                {lang === 'ID' ? 'Lanjutkan Laporan?' : 'Continue Report?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {lang === 'ID' 
                  ? 'Laporan Anda belum selesai dikirim. Apakah Anda ingin membatalkan dan kembali ke awal, atau tetap melanjutkan laporan ini?' 
                  : 'Your report is not yet finished. Do you want to cancel and go back to the start, or stay and continue this report?'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExitCancel} 
                  className="py-3.5 rounded-2xl text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-all"
                >
                  {lang === 'ID' ? 'Batalkan' : 'Cancel'}
                </button>
                <button 
                  onClick={handleExitContinue} 
                  className="py-3.5 rounded-2xl bg-[#2d5a1e] text-white font-bold text-sm hover:bg-[#1e3f14] shadow-lg shadow-green-900/20 transition-all"
                >
                  {lang === 'ID' ? 'Lanjutkan' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Helpful Tip */}
        <div className="mt-10 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-[32px] p-6 flex items-start gap-4 reveal">
           <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Info className="w-5 h-5 text-[#2d5a1e]" />
           </div>
           <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
             {lang === 'ID' ? 'Pilihlah kategori yang paling sesuai agar laporan Anda dapat segera ditindaklanjuti oleh instansi yang berwenang.' : 'Choose the most appropriate category so that your report can be followed up by the competent authorities immediately.'}
           </p>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminBuatLaporan;
