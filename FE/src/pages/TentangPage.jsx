import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { Shield, Zap, Building, Users, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TentangPage = () => {
  const { lang } = useSettings();
  const t = translations[lang];

  const team = [
    { nama: 'Arden', jabatan: 'CEO', deskripsi: 'Pakar pengembangan aplikasi web dan integrasi sistem.' },
    { nama: 'Arkan', jabatan: 'Manajer', deskripsi: 'Berfokus pada pengalaman pengguna dan desain visual yang intuitif.' },
    { nama: 'Dandi', jabatan: 'Project Manager', deskripsi: 'Memastikan seluruh proyek berjalan tepat waktu dan sesuai target.' },
    { nama: 'Bhuminindra', jabatan: 'System Analyst', deskripsi: 'Menganalisis kebutuhan sistem untuk solusi yang lebih efisien.' },
  ];

  const timeline = [
    { tahun: '2026', judul: lang === 'ID' ? 'Awal Terbentuk' : 'Founding', deskripsi: lang === 'ID' ? 'LaporinAja mulai dikembangkan sebagai solusi digital pengaduan.' : 'LaporinAja began development as a digital complaint solution.' },
    { tahun: '2026', judul: lang === 'ID' ? 'Peluncuran Versi 1.0' : 'Launch Version 1.0', deskripsi: lang === 'ID' ? 'Aplikasi resmi dirilis untuk membantu masyarakat melapor.' : 'Official app released to help citizens report.' },
    { tahun: '2026', judul: lang === 'ID' ? 'Ekspansi Layanan' : 'Service Expansion', deskripsi: lang === 'ID' ? 'Menjangkau lebih banyak wilayah dan integrasi instansi.' : 'Reaching more regions and agency integrations.' },
  ];

  const values = [
    { judul: lang === 'ID' ? 'Transparansi' : 'Transparency', deskripsi: lang === 'ID' ? 'Kami menjamin setiap proses penanganan laporan dilakukan secara terbuka.' : 'We guarantee every report handling process is conducted openly.', icon: Shield },
    { judul: lang === 'ID' ? 'Kecepatan' : 'Speed', deskripsi: lang === 'ID' ? 'Respon cepat adalah prioritas utama kami dalam melayani warga.' : 'Fast response is our top priority in serving citizens.', icon: Zap },
    { judul: lang === 'ID' ? 'Integritas' : 'Integrity', deskripsi: lang === 'ID' ? 'Menjunjung tinggi kejujuran dan etika dalam setiap layanan kami.' : 'Upholding honesty and ethics in every service we provide.', icon: CheckCircle },
    { judul: lang === 'ID' ? 'Inovasi' : 'Innovation', deskripsi: lang === 'ID' ? 'Terus berinovasi untuk memberikan solusi pelaporan terbaik.' : 'Continuously innovating to provide the best reporting solutions.', icon: TrendingUp },
    { judul: lang === 'ID' ? 'Kolaborasi' : 'Collaboration', deskripsi: lang === 'ID' ? 'Bekerja sama dengan berbagai pihak untuk perubahan positif.' : 'Working together with various parties for positive change.', icon: Users },
    { judul: lang === 'ID' ? 'Data Terbuka' : 'Open Data', deskripsi: lang === 'ID' ? 'Mendorong keterbukaan data demi kemajuan pembangunan daerah.' : 'Encouraging data openness for the progress of regional development.', icon: Building },
  ];

  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="animate-fade-in">
        <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="pt-24 pb-0 bg-[#f8fdf8] dark:bg-gray-950 reveal">
          <div className="max-w-5xl mx-auto px-4 text-center pt-12 pb-0 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">{t.about_hero_title}</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-12">
              {t.about_hero_desc}
            </p>
            {/* Hero illustration */}
            <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-100 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden reveal-scale delay-200">
              <img
                src="/foto-tentang-kami.png"
                alt="Tim LaporinAja"
                loading="lazy"
                className="w-full h-72 object-cover object-top dark:opacity-80"
              />
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="py-20 bg-[#f8fdf8] dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-[#2d5a1e]/10 dark:border-gray-800 shadow-sm reveal-left transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#2d5a1e]/10 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#2d5a1e] dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.about_visi_title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {t.about_visi_desc}
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm reveal-right transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#2d5a1e]/10 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#2d5a1e] dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.about_misi_title}</h2>
              </div>
              <ul className="space-y-3">
                {[
                  t.about_misi_1,
                  t.about_misi_2,
                  t.about_misi_3,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-[#2d5a1e] dark:text-green-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-white dark:bg-gray-900 rounded-[60px] shadow-sm mx-4 mb-20 reveal transition-colors">
          <div className="max-w-4xl mx-auto px-4">
            <div className="reveal">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-[#2d5a1e] dark:text-green-400 mb-3">{lang === 'ID' ? 'PERJALANAN KAMI' : 'OUR JOURNEY'}</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-16 tracking-tight">{t.about_timeline_title}</h2>
            </div>
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#2d5a1e]/20 dark:bg-green-900/30"></div>
              <div className="space-y-12">
                {timeline.map((item, i) => (
                  <div key={i} className={`flex items-center gap-8 ${i % 2 !== 0 ? 'flex-row-reverse' : ''} reveal-${i % 2 === 0 ? 'left' : 'right'}`}>
                    <div className={`flex-1 ${i % 2 !== 0 ? 'text-right' : ''}`}>
                      <div className="bg-[#f8fdf8] dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-50 dark:border-gray-700">
                        <span className="text-xs font-bold text-[#2d5a1e] dark:text-green-400 bg-[#2d5a1e]/10 dark:bg-green-900/30 px-3 py-1 rounded-full">{item.tahun}</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-2">{item.judul}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.deskripsi}</p>
                      </div>
                    </div>
                    {/* Node */}
                    <div className="w-5 h-5 rounded-full bg-[#2d5a1e] dark:bg-green-500 border-4 border-white dark:border-gray-900 shadow-md shrink-0 z-10"></div>
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-[#f8fdf8] dark:bg-gray-950 transition-colors">
          <div className="max-w-5xl mx-auto px-4">
            <div className="reveal">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3 tracking-tight">{t.about_values_title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-12">{t.about_values_desc}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={v.judul} className={`bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-[#2d5a1e]/10 dark:border-gray-800 hover:shadow-md transition-all group reveal delay-${i * 100}`}>
                    <div className="w-14 h-14 bg-[#2d5a1e]/10 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2d5a1e] dark:group-hover:bg-green-500 transition-colors">
                      <Icon className="w-7 h-7 text-[#2d5a1e] dark:text-green-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">{v.judul}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.deskripsi}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white dark:bg-gray-900 rounded-[60px] shadow-sm mx-4 mb-20 reveal transition-colors">
          <div className="max-w-5xl mx-auto px-4">
            <div className="reveal">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3 tracking-tight">{t.about_team_title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-14">{t.about_team_desc}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div key={member.nama} className={`bg-[#f8fdf8] dark:bg-gray-800 rounded-3xl p-6 text-center shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-md transition-all reveal-scale delay-${i * 100}`}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a8d5a2] to-[#2d5a1e] mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#2d5a1e]/20">
                    {member.nama[0]}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{member.nama}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{member.jabatan}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#1a2e10] dark:bg-green-950 reveal transition-colors">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.about_cta_title}</h2>
            <p className="text-green-200/70 dark:text-green-400/70 text-sm mb-10 max-w-lg mx-auto leading-relaxed">
              {t.about_cta_desc}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="bg-[#2d5a1e] dark:bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1e4014] dark:hover:bg-green-500 transition-all shadow-xl shadow-black/20 active:scale-[0.98]">
                {t.about_cta_btn}
              </Link>
              <Link to="/bantuan" className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all">
                {lang === 'ID' ? 'Panduan Pengguna' : 'User Guide'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>

      <Footer />
    </div>
  );
};

export default TentangPage;
