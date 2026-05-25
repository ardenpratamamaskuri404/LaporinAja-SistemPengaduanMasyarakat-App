import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import {
  MapPin, Image, Activity, Shield, MessageSquare, Database,
  ArrowRight, CheckCircle, Star, Users, FileCheck, Clock
} from 'lucide-react';
import api from '../utils/api';

// Counter animation hook
const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ icon: Icon, value, label, suffix = '' }) => {
  const count = useCounter(value);
  return (
    <div className="text-center reveal-scale">
      <div className="text-3xl md:text-4xl font-bold text-[#2d5a1e] dark:text-green-400">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useSettings();
  const [stats, setStats] = useState({ total: 0, selesai: 0, respons: 24, warga: 0 });

  const t = translations[lang];

  const fetchStats = () => {
    api.get('/laporan/stats/public').then(res => {
      if (res.data?.success) {
        const d = res.data.data;
        setStats({
          total: d.totalLaporan || 0,
          selesai: d.selesaiPct || 0,
          respons: 24,
          warga: d.totalUsers || 0,
        });
      }
    }).catch(() => {});
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }
    fetchStats();
    // Real-time polling every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const features = [
    { icon: MapPin, title: t.feat_1_title, desc: t.feat_1_desc },
    { icon: Image, title: t.feat_2_title, desc: t.feat_2_desc },
    { icon: Activity, title: t.feat_3_title, desc: t.feat_3_desc },
    { icon: Shield, title: t.feat_4_title, desc: t.feat_4_desc },
    { icon: MessageSquare, title: t.feat_5_title, desc: t.feat_5_desc },
    { icon: Database, title: t.feat_6_title, desc: t.feat_6_desc },
  ];

  const steps = [
    { icon: FileCheck, title: t.landing_step_1_title, desc: t.landing_step_1_desc },
    { icon: Shield, title: t.landing_step_2_title, desc: t.landing_step_2_desc },
    { icon: CheckCircle, title: t.landing_step_3_title, desc: t.landing_step_3_desc },
  ];


  const testimonials = [
    { name: 'S.J Rainy', role: t.landing_testimonial_1_role, text: t.landing_testimonial_1_text, rating: 5 },
    { name: 'Budi Santoso', role: t.landing_testimonial_2_role, text: t.landing_testimonial_2_text, rating: 5 },
    { name: 'Andi Yuana', role: t.landing_testimonial_3_role, text: t.landing_testimonial_3_text, rating: 5 },
  ];


  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#f0faf0] via-white to-[#f0faf0] dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <div className="inline-flex items-center gap-2 bg-[#2d5a1e]/10 dark:bg-green-900/20 text-[#2d5a1e] dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-[#2d5a1e] dark:bg-green-400 rounded-full"></span>
                {t.hero_badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-5">
                {t.hero_title_1}
                <span className="text-[#2d5a1e] dark:text-green-400">{t.hero_title_2}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                {t.hero_desc}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary text-base shadow-lg shadow-green-900/20">
                  {t.hero_cta_1} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/bantuan" className="btn-outline text-base dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-black">
                  {t.hero_cta_2}
                </Link>
              </div>
            </div>

            {/* Hero Image Section */}
            <div className="relative hidden md:block group reveal-right">
              <div className="absolute inset-0 bg-[#2d5a1e] dark:bg-green-400 rounded-[40px] rotate-3 opacity-10 group-hover:rotate-1 transition-transform duration-500"></div>
              <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-4 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden h-[450px] flex items-center justify-center">
                <img
                  src="/Green-City.png"
                  alt="Ilustrasi laporan masyarakat"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-[32px] dark:opacity-80"
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full px-8">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 dark:border-gray-700 flex items-center gap-4 animate-bounce-subtle">
                    <div className="w-12 h-12 rounded-xl bg-[#2d5a1e] dark:bg-green-500 flex items-center justify-center text-white shadow-lg shadow-[#2d5a1e]/30">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total > 0 ? stats.total.toLocaleString() + '+' : '...'}</div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.hero_floating_stat}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={Users} value={stats.total} label={t.stat_total} />
            <StatCard value={stats.selesai} label={t.stat_success} suffix="%" />
            <StatCard value={stats.respons} label={t.stat_avg_resp} suffix=" Jam" />
            <StatCard value={stats.warga} label={t.stat_users} suffix="+" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#f8fdf8] dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal">
            <h2 className="section-title dark:text-white">{t.feat_title}</h2>
            <p className="section-subtitle dark:text-gray-400">{t.feat_subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feat, i) => (
              <div key={feat.title} className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-all duration-200 group reveal delay-${(i % 3) * 100}`}>
                <div className="w-12 h-12 rounded-xl bg-[#2d5a1e]/10 dark:bg-green-900/20 flex items-center justify-center mb-4 group-hover:bg-[#2d5a1e] dark:group-hover:bg-green-500 transition-colors duration-200">
                  <feat.icon className="w-6 h-6 text-[#2d5a1e] dark:text-green-400 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title dark:text-white reveal">{t.landing_step_title}</h2>
          <div className="grid md:grid-cols-3 gap-12 mt-16 relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#2d5a1e]/20 dark:via-green-900/30 to-transparent reveal"></div>
            {steps.map((step, i) => (
              <div key={step.title} className={`text-center relative reveal delay-${i * 100}`}>
                <div className="w-16 h-16 rounded-2xl bg-[#2d5a1e]/10 dark:bg-green-900/20 border-2 border-[#2d5a1e]/20 dark:border-green-800 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-8 h-8 text-[#2d5a1e] dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#f8fdf8] dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title dark:text-white reveal">{t.landing_testimonial_title}</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {testimonials.map((tItem, i) => (
              <div key={tItem.name} className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-all reveal delay-${i * 100}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(tItem.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">"{tItem.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2d5a1e] dark:bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    {tItem.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{tItem.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{tItem.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#2d5a1e] dark:bg-green-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.hero_cta_register}
          </h2>
          <p className="text-green-200 dark:text-green-400/80 mb-8 max-w-xl mx-auto">
            {t.hero_cta_register_desc}
          </p>

          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-[#2d5a1e] font-semibold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-all hover:shadow-lg active:scale-[0.98]">
            {t.hero_cta_1} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
