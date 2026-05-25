import { useState } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import { 
  HelpCircle, MessageSquare, Mail, Phone,
  ChevronDown, FileText, Shield, Clock
} from 'lucide-react';

const SuperAdminBantuan = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { id: 1, q: 'Apakah identitas saya aman saat melapor?', a: 'Ya, semua data pengguna terenkripsi dan dilindungi sesuai kebijakan privasi kami.' },
    { id: 2, q: 'Berapa lama waktu penanganan satu laporan?', a: 'Rata-rata laporan ditangani dalam 24 jam tergantung tingkat urgensi.' },
    { id: 3, q: 'Bagaimana cara melacak status laporan saya?', a: 'Anda dapat melihat status laporan di halaman "Laporan Saya" pada dashboard.' },
    { id: 4, q: 'Bagaimana jika laporan saya ditolak?', a: 'Anda akan menerima alasan penolakan dan dapat mengajukan laporan ulang dengan data yang lebih lengkap.' },
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <SuperAdminLayout>
      <div className="animate-fade-in space-y-10 pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-900 rounded-[40px] p-10 border border-green-100 dark:border-gray-800">
          <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-[#1a4d2e]/10 dark:text-green-900/20" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Super Admin &gt; Bantuan</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Ada yang bisa kami bantu?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">Temukan panduan, FAQ, dan cara mendapatkan dukungan teknis untuk layanan LaporinAja.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative group">
            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a4d2e]" />
            <input 
              type="text" 
              placeholder="Cari topik bantuan atau kata kunci..." 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-[#1a4d2e] rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, label: 'Cara Melapor', desc: 'Panduan langkah demi langkah pengisian pengaduan.', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { icon: Shield, label: 'Verifikasi', desc: 'Informasi mengenai proses validasi laporan.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: MessageSquare, label: 'Akun Pelapor', desc: 'Pengaturan dan kelola data akun pribadi.', color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
            { icon: Shield, label: 'Etika & Privasi', desc: 'Kebijakan privasi dan perlindungan data pribadi.', color: 'text-[#1a4d2e]', bg: 'bg-[#1a4d2e]/5 dark:bg-green-900/20' },
          ].map((cat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 hover:border-[#1a4d2e]/30 transition-all group">
              <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} mb-6`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-[#1a4d2e] transition-colors">{cat.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Pertanyaan Umum (FAQ)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mungkin jawaban Anda sudah ada di sini</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left"
                >
                  <span className="text-base font-black text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === faq.id && (
                  <div className="px-8 pb-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Hubungi Kami Secara Langsung</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#1a4d2e] mx-auto mb-6">
                <Mail className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">Email Dukungan</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Kirimkan kendala Anda melalui email resmi</p>
              <p className="text-sm font-bold text-[#1a4d2e] dark:text-green-400">support@laporinaja.id</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#1a4d2e] mx-auto mb-6">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">WhatsApp Hotline</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Respon cepat untuk pertanyaan mendesak</p>
              <p className="text-sm font-bold text-[#1a4d2e] dark:text-green-400">+62 812 3456 7890</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 mx-auto mb-6">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">Jam Operasional</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Waktu layanan untuk respon laporan</p>
              <p className="text-xs font-bold text-gray-500">Senin - Jumat : 08.00 - 17.00 WIB</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1a4d2e] to-[#0e2a18] p-10 rounded-[40px] shadow-xl shadow-green-900/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white max-w-xl">
              <h3 className="text-2xl font-black mb-3">Siap berkontribusi untuk lingkungan lainnya?</h3>
              <p className="text-green-100 opacity-80 text-sm leading-relaxed">
                Jadilah bagian dari solusi. Lapor sekarang untuk perubahan yang lebih baik di lingkungan Anda.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/superadmin/dashboard" className="bg-white text-[#1a4d2e] px-8 py-4 rounded-xl text-sm font-black hover:bg-green-50 transition-all active:scale-95">
                Ke Dashboard
              </Link>
              <Link to="/superadmin/pengaturan" className="border-2 border-white text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95">
                Panduan User
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBantuan;
