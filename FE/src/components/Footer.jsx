import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { Home, Mail, Phone, MapPin, Camera, Share2, Megaphone } from 'lucide-react';

const Footer = () => {
  const { lang } = useSettings();
  
  const text = {
    ID: {
      brand_desc: "Portal pelaporan masalah publik yang menghubungkan warga dengan pemerintah untuk solusi yang cepat dan transparan.",
      service: "Layanan",
      about: "Tentang Kami",
      stats: "Statistik Publik",
      agencies: "Daftar Instansi",
      guide: "Panduan Melapor",
      help_policy: "Bantuan & Kebijakan",
      help_center: "Pusat Bantuan",
      privacy: "Kebijakan Privasi",
      terms: "Syarat & Ketentuan",
      security: "Keamanan Akun",
      contact: "Kontak",
      copyright: "© 2026 LaporinAja. Portal Pelaporan Warga Terpercaya.",
    },
    EN: {
      brand_desc: "Public issue reporting portal connecting citizens with the government for fast and transparent solutions.",
      service: "Services",
      about: "About Us",
      stats: "Public Statistics",
      agencies: "Agencies List",
      guide: "Reporting Guide",
      help_policy: "Help & Policy",
      help_center: "Help Center",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      security: "Account Security",
      contact: "Contact",
      copyright: "© 2026 LaporinAja. Trusted Citizen Reporting Portal.",
    }
  };

  const t = text[lang];

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3 text-[#2d5a1e] dark:text-green-400">
              <Home className="w-7 h-7" />
              LaporinAja
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t.brand_desc}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-[#2d5a1e] hover:text-white transition-all text-gray-400 dark:text-gray-500">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-[#2d5a1e] hover:text-white transition-all text-gray-400 dark:text-gray-500">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="mailto:support@laporinaja.id" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-[#2d5a1e] hover:text-white transition-all text-gray-400 dark:text-gray-500">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t.service}</h4>
            <ul className="space-y-2">
              {[
                { label: t.about, to: '/tentang' },
                { label: t.stats, to: '/statistik' },
                { label: t.agencies, to: '/instansi' },
                { label: t.guide, to: '/bantuan' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-500 dark:text-gray-400 text-sm hover:text-[#2d5a1e] dark:hover:text-green-400 transition-colors underline underline-offset-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan & Kebijakan */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t.help_policy}</h4>
            <ul className="space-y-2">
              {[
                { label: t.help_center, to: '/bantuan' },
                { label: t.privacy, to: '/privasi' },
                { label: t.terms, to: '/syarat' },
                { label: t.security, to: '/keamanan' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-500 dark:text-gray-400 text-sm hover:text-[#2d5a1e] dark:hover:text-green-400 transition-colors underline underline-offset-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t.contact}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#2d5a1e] dark:text-green-400" />
                Jl. Kebenaran No. 12, Depok, Indonesia
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-[#2d5a1e] dark:text-green-400" />
                support@laporinaja.id
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Phone className="w-4 h-4 shrink-0 text-[#2d5a1e] dark:text-green-400" />
                (021) 1234 5678
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-400 dark:text-gray-600 text-sm">{t.copyright}</p>
          <div className="flex gap-4">
            <Link to="/privasi" className="text-gray-400 dark:text-gray-600 text-sm hover:text-gray-600 dark:hover:text-gray-400 transition-colors">{t.privacy}</Link>
            <Link to="/syarat" className="text-gray-400 dark:text-gray-600 text-sm hover:text-gray-600 dark:hover:text-gray-400 transition-colors">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
