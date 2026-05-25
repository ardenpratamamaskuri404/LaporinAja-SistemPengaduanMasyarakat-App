import { useState, useEffect } from 'react';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  Settings, Globe, Shield, 
  Cloud, Lock, Database, 
  Upload, Check, Info, 
  ChevronDown, Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import api from '../utils/api';

const SuperAdminConfig = () => {
  const [activeTab, setActiveTab] = useState('Umum');
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = ['Umum', 'Email & Notif', 'Keamanan', 'Integrasi', 'Backup'];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (section, data) => {
    try {
      setIsSaving(true);
      const response = await api.put(`/config/${section}`, data);
      if (response.data.success) {
        setConfig(prev => ({
          ...prev,
          [section]: response.data.data
        }));
        alert('Konfigurasi berhasil disimpan');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Konfigurasi</h2>
              <span className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Super Admin</span>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 gap-10">
           {tabs.map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab ? 'text-[#1a4d2e]' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a4d2e] rounded-t-full"></div>}
             </button>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
           {/* Left: Configuration Form */}
           <div className="lg:col-span-8 space-y-10">
              {activeTab === 'Umum' && (
                <>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Identitas Aplikasi</h3>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Aplikasi</label>
                           <input type="text" defaultValue="LaporinAja" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                           <textarea rows="3" defaultValue="Platform pelaporan warga yang modern dan terpercaya." className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] focus:outline-none transition-all resize-none" />
                        </div>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Logo & Branding</h3>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Logo Baru</label>
                           <div className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:border-[#1a4d2e] transition-all cursor-pointer bg-gray-50/30">
                              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                 <Upload className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-black text-gray-900 dark:text-white mb-1">Tarik & Lepas gambar disini</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SVG, PNG, JPG (Max 2MB)</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Saat Ini</label>
                           <div className="h-[184px] bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                              <span className="text-4xl font-black text-[#1a4d2e]">L.</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Batas Konten</h3>
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Foto per Laporan</label>
                              <input type="number" defaultValue="5" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Ukuran File (MB)</label>
                              <input type="number" defaultValue="10" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                           </div>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Lokalisasi</h3>
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bahasa Default</label>
                              <div className="relative group">
                                 <select className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none">
                                    <option>Bahasa Indonesia</option>
                                    <option>English (US)</option>
                                 </select>
                                 <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone Default</label>
                              <div className="relative group">
                                 <select className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none">
                                    <option>Asia/Jakarta (WIB)</option>
                                    <option>Asia/Makassar (WITA)</option>
                                    <option>Asia/Jayapura (WIT)</option>
                                 </select>
                                 <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </>
              )}

              {activeTab === 'Email & Notif' && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan Email & SMTP</h3>
                   <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Server</label>
                            <input type="text" defaultValue="smtp.mailtrap.io" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Port</label>
                            <input type="number" defaultValue="2525" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                         </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Username</label>
                            <input type="text" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Password</label>
                            <input type="password" placeholder="********" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Pengirim Default</label>
                         <input type="email" defaultValue="noreply@laporinaja.id" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'Keamanan' && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Keamanan Sistem</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Autentikasi Dua Faktor (2FA)</p>
                            <p className="text-xs text-gray-400">Wajibkan 2FA untuk seluruh akun Administrator.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1a4d2e]"></div>
                         </label>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sesi Timeout (Menit)</label>
                         <input type="number" defaultValue="30" className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'Integrasi' && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Integrasi Pihak Ketiga</h3>
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps API Key</label>
                         <input type="text" placeholder="AIzaSyB..." className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Firebase Cloud Messaging Key</label>
                         <input type="text" placeholder="AAAA..." className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#1a4d2e] outline-none" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'Backup' && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                   <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Backup & Restore Data</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Auto-Backup Harian</p>
                            <p className="text-xs text-gray-400">Database akan dibackup otomatis setiap pukul 00:00.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1a4d2e]"></div>
                         </label>
                      </div>
                      <button className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all w-full">
                         <Cloud className="w-5 h-5" /> Download Backup Database (SQL)
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Right: Info & Preview */}
           <div className="lg:col-span-4 space-y-10">
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-[32px] p-8 flex gap-5">
                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-green-600 shrink-0 shadow-sm">
                    <Info className="w-5 h-5" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-black text-gray-900 dark:text-white">Informasi Konfigurasi</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Perubahan pada identitas aplikasi dan batas konten akan langsung diterapkan ke seluruh pengguna yang mengakses sistem.</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-10 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Preview Visual</h4>
                    <Smartphone className="w-5 h-5 text-gray-300" />
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-[32px] p-6 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#1a4d2e] rounded-xl flex items-center justify-center text-white text-xs font-black">L.</div>
                       <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">LaporinAja</p>
                    </div>
                    <div className="space-y-3">
                       <div className="h-28 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                       </div>
                       <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-1/2"></div>
                       </div>
                    </div>
                 </div>
                 <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">Preview tampilan laporan pada aplikasi warga</p>
              </div>

              <button className="w-full bg-[#1a4d2e] text-white py-5 rounded-[28px] text-sm font-black shadow-xl shadow-green-900/30 hover:bg-[#123620] transition-all flex items-center justify-center gap-3 active:scale-95">
                 <Database className="w-5 h-5" /> Simpan Semua
              </button>
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminConfig;
