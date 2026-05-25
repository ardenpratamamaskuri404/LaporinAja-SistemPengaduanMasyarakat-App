import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import {
  Search, FileText, Shield, User, Lock, ChevronDown, ChevronUp,
  Mail, MessageSquare, Clock, ArrowRight, Loader2
} from 'lucide-react';
import api from '../utils/api';

const FAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden reveal delay-${index * 100} transition-colors`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500 shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 shrink-0 ml-3" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3 animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

const BantuanPage = () => {
  const { lang } = useSettings();
  const t = translations[lang];
  const [search, setSearch] = useState('');

  const faqs = [
    { 
      id: 1, 
      pertanyaan: lang === 'ID' ? 'Bagaimana cara membuat laporan?' : 'How to create a report?', 
      jawaban: lang === 'ID' 
        ? 'Anda dapat membuat laporan dengan mengklik tombol "Buat Laporan" di dashboard dan mengisi formulir yang tersedia dengan judul, deskripsi, kategori, dan foto pendukung.' 
        : 'You can create a report by clicking the "Create Report" button on the dashboard and filling out the available form with a title, description, category, and supporting photos.' 
    },
    { 
      id: 2, 
      pertanyaan: lang === 'ID' ? 'Apakah laporan saya akan tetap anonim?' : 'Will my report remain anonymous?', 
      jawaban: lang === 'ID' 
        ? 'Identitas Anda akan dilindungi dan hanya akan digunakan untuk keperluan verifikasi oleh tim admin. Anda juga bisa memilih kategori yang sesuai untuk menjaga privasi.' 
        : 'Your identity will be protected and only used for verification purposes by the admin team. You can also choose the appropriate category to maintain privacy.' 
    },
    { 
      id: 3, 
      pertanyaan: lang === 'ID' ? 'Berapa lama laporan diproses?' : 'How long will it take to process?', 
      jawaban: lang === 'ID' 
        ? 'Rata-rata laporan akan ditindaklanjuti dalam waktu 1-3 hari kerja tergantung pada tingkat urgensi dan ketersediaan petugas di lapangan.' 
        : 'On average, reports will be followed up within 1-3 working days depending on the urgency level and the availability of officers in the field.' 
    },
    { 
      id: 4, 
      pertanyaan: lang === 'ID' ? 'Bagaimana cara memantau status laporan?' : 'How to monitor report status?', 
      jawaban: lang === 'ID' 
        ? 'Anda dapat memantau status laporan melalui menu "Laporan Saya" di dashboard. Status akan diperbarui secara otomatis dari Pending, Proses, hingga Selesai.' 
        : 'You can monitor the report status through the "My Reports" menu on the dashboard. The status will be updated automatically from Pending, Processing, to Finished.' 
    },
    { 
      id: 5, 
      pertanyaan: lang === 'ID' ? 'Apa yang harus saya lakukan jika laporan ditolak?' : 'What should I do if my report is rejected?', 
      jawaban: lang === 'ID' 
        ? 'Jika laporan ditolak, Anda akan menerima alasan penolakan. Anda dapat memperbaiki detail laporan tersebut atau membuat laporan baru yang lebih lengkap.' 
        : 'If the report is rejected, you will receive a reason for rejection. You can fix the report details or create a new, more complete report.' 
    },
  ];

  const categories = [
    { icon: FileText, title: lang === 'ID' ? 'Cara Melapor' : 'How to Report', desc: lang === 'ID' ? 'Panduan langkah demi langkah untuk mengisi dan mengirimkan laporan pengaduan Anda.' : 'Step-by-step guide to fill out and submit your complaint report.' },
    { icon: Shield, title: lang === 'ID' ? 'Verifikasi' : 'Verification', desc: lang === 'ID' ? 'Informasi mengenai proses validasi dan verifikasi data pelaporan warga.' : 'Information regarding the validation and verification process of citizen reporting data.' },
    { icon: User, title: lang === 'ID' ? 'Akun Pelapor' : 'Reporter Account', desc: lang === 'ID' ? 'Pengaturan profil, keamanan akun, dan pemulihan kata sandi pengguna.' : 'Profile settings, account security, and user password recovery.' },
    { icon: Lock, title: lang === 'ID' ? 'Etika & Privasi' : 'Ethics & Privacy', desc: lang === 'ID' ? 'Kebijakan penggunaan platform dan perlindungan data pribadi pelapor.' : 'Platform use policy and protection of reporter personal data.' },
  ];

  const filteredFAQs = faqs.filter(
    (f) =>
      f.pertanyaan.toLowerCase().includes(search.toLowerCase()) ||
      f.jawaban.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="animate-fade-in">
        {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-[#f0faf0] to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.help_hero_title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t.help_hero_desc}
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto reveal">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ID' ? 'Cari topik bantuan...' : 'Search help topics...'}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-4 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a1e] dark:focus:ring-green-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:border-[#2d5a1e]/30 dark:hover:border-green-500/30 transition-all duration-200 group reveal-scale delay-${i * 100}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#2d5a1e]/10 dark:bg-green-900/20 flex items-center justify-center mb-3 group-hover:bg-[#2d5a1e] dark:group-hover:bg-green-500 transition-colors duration-200">
                <cat.icon className="w-5 h-5 text-[#2d5a1e] dark:text-green-400 group-hover:text-white transition-colors duration-200" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">{cat.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 max-w-3xl mx-auto px-4">
        <div className="reveal">
          <h2 className="section-title dark:text-white mb-2">{t.help_faq_title}</h2>
          <p className="section-subtitle dark:text-gray-400 mb-8">{t.help_faq_subtitle}</p>
        </div>
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, i) => <FAQItem key={faq.id} question={faq.pertanyaan} answer={faq.jawaban} index={i} />)
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{lang === 'ID' ? 'Tidak ada hasil untuk' : 'No results for'} "<span className="font-medium text-gray-900 dark:text-white">{search}</span>"</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-[#f8fdf8] dark:bg-gray-950 transition-colors">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="section-title dark:text-white mb-2 reveal">{t.help_contact_title}</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-shadow reveal delay-100">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a1e]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-[#2d5a1e] dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{t.help_contact_email}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{lang === 'ID' ? 'Kirimkan pertanyaan detail Anda melalui email.' : 'Send your detailed questions via email.'}</p>
              <a href="mailto:support@laporinaja.id" className="text-[#2d5a1e] dark:text-green-400 text-sm font-medium hover:underline">
                support@laporinaja.id
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-shadow reveal delay-200">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a1e]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-[#2d5a1e] dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{t.help_contact_wa}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{lang === 'ID' ? 'Respon cepat melalui chat WhatsApp resmi kami.' : 'Fast response via our official WhatsApp chat.'}</p>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-[#2d5a1e] dark:text-green-400 text-sm font-medium hover:underline">
                +62 812 3456 7890
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-shadow reveal delay-300">
              <div className="w-12 h-12 rounded-xl bg-[#2d5a1e]/10 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[#2d5a1e] dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{t.help_contact_hours}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{lang === 'ID' ? 'Waktu aktif tim admin untuk memproses laporan.' : 'Active time for admin team to process reports.'}</p>
              <p className="text-[#2d5a1e] dark:text-green-400 text-sm font-medium">{lang === 'ID' ? 'Senin – Jumat | 08.00 – 17.00 WIB' : 'Monday – Friday | 08.00 – 17.00 WIB'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#2d5a1e] dark:bg-green-950 reveal transition-colors">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{lang === 'ID' ? 'Siap untuk membantu warga lainnya?' : 'Ready to help other citizens?'}</h2>
            <p className="text-green-200 dark:text-green-400/80 text-sm">{lang === 'ID' ? 'Jadilah bagian dari solusi. Lapor sekarang untuk perubahan yang lebih baik.' : 'Be part of the solution. Report now for a better change.'}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-[#2d5a1e] font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-all text-sm shadow-xl shadow-black/10">
              {lang === 'ID' ? 'Mulai Lapor' : 'Start Reporting'}
            </Link>
            <Link to="/bantuan" className="inline-flex items-center gap-2 border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all text-sm">
              {lang === 'ID' ? 'Panduan User' : 'User Guide'}
            </Link>
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </div>
  );
};

export default BantuanPage;
