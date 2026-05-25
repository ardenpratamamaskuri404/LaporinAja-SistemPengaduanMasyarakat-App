import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../utils/translations';
import { TrendingUp, TrendingDown, Minus, Filter, Calendar, MapPin, Search, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categoryColors = ['#1a3d0f', '#2d5a1e', '#52bf5c', '#a8d5a2', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'];

const StatistikPage = () => {
  const { lang } = useSettings();
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('heatmap');
  const [statCards, setStatCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetchStats();
    // Real-time polling every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [lang]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/laporan/stats/public');
      if (res.data?.success) {
        const d = res.data.data;

        // Build stat cards
        const pending = (d.statuses?.PENDING || 0) + (d.statuses?.PROSES || 0);
        setStatCards([
          { label: t.stat_total, value: d.totalLaporan.toLocaleString(), badge: null },
          { label: lang === 'ID' ? 'Laporan Selesai' : 'Resolved', value: d.totalSelesai.toLocaleString(), badge: `${d.selesaiPct}%`, badgeUp: true },
          { label: lang === 'ID' ? 'Pending / Proses' : 'Pending / Process', value: pending.toLocaleString(), badge: null },
          { label: t.stat_avg_resp, value: '24 Jam', badge: null },
        ]);

        // Build categories
        const catEntries = Object.entries(d.categories || {});
        const totalCat = catEntries.reduce((a, [, v]) => a + v, 0);
        const cats = catEntries.map(([label, count], i) => ({
          label,
          pct: totalCat > 0 ? Math.round((count / totalCat) * 100) : 0,
          color: categoryColors[i % categoryColors.length],
          count
        })).sort((a, b) => b.count - a.count);
        setCategories(cats);

        // Build rankings
        setRankings(cats.slice(0, 5).map((c, i) => ({
          no: String(i + 1).padStart(2, '0'),
          category: c.label,
          jumlah: c.count.toLocaleString(),
          trend: i === 0 ? 'up' : i === cats.length - 1 ? 'down' : 'flat'
        })));

        // Build hotspots from geographic data
        const geoEntries = Object.entries(d.geographic || {});
        setHotspots(geoEntries.filter(([, v]) => v.lat && v.lng).map(([city, data], i) => ({
          id: i + 1,
          pos: [data.lat, data.lng],
          title: city,
          reports: data.count,
          color: categoryColors[i % categoryColors.length]
        })));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdf8] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="animate-fade-in">
        <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left reveal">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{t.stats_title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t.stats_subtitle}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#2d5a1e]" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {statCards.map((c, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 group reveal-scale">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3 group-hover:text-[#2d5a1e] transition-colors">{c.label}</p>
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">{c.value}</h3>
                      {c.badge && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">{c.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Maps Section */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 shadow-sm mb-10 overflow-hidden reveal transition-colors">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.stats_map_title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.stats_map_desc}</p>
                  </div>
                  <div className="flex bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl">
                    <button onClick={() => setMapMode('heatmap')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${mapMode === 'heatmap' ? 'bg-[#2d5a1e] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-[#2d5a1e]'}`}>Heatmap</button>
                    <button onClick={() => setMapMode('cluster')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${mapMode === 'cluster' ? 'bg-[#2d5a1e] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-[#2d5a1e]'}`}>Cluster</button>
                  </div>
                </div>
                <div className="h-[500px] w-full rounded-[32px] overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-inner z-0">
                  <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    {hotspots.map(h => (
                      mapMode === 'heatmap' ? (
                        <CircleMarker key={h.id} center={h.pos} radius={Math.max(10, Math.sqrt(h.reports) * 3)} fillColor={h.color} color="#fff" weight={2} opacity={1} fillOpacity={0.6}>
                          <Popup><div className="font-sans"><p className="font-bold text-lg text-[#2d5a1e] mb-1">{h.title}</p><p className="text-sm font-medium text-gray-600">{h.reports} {lang === 'ID' ? 'Laporan' : 'Reports'}</p></div></Popup>
                        </CircleMarker>
                      ) : (
                        <Marker key={h.id} position={h.pos}>
                          <Popup><div className="font-sans"><p className="font-bold text-lg text-[#2d5a1e] mb-1">{h.title}</p><p className="text-sm font-medium text-gray-600">{h.reports} {lang === 'ID' ? 'Laporan' : 'Reports'}</p></div></Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Charts and Rankings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Donut Chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 shadow-sm col-span-1 reveal-left transition-colors">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.stats_cat_title}</h2>
                  <div className="flex flex-col items-center gap-8">
                    {categories.length > 0 ? <DonutChart slices={categories} /> : <p className="text-gray-400 text-sm">No data</p>}
                    <div className="w-full space-y-4">
                      {categories.map((c) => (
                        <div key={c.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: c.color }}></span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">{c.label}</span>
                          </div>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rankings */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 shadow-sm lg:col-span-2 reveal-right transition-colors">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.stats_rank_title}</h2>
                      <p className="text-gray-400 text-xs font-medium uppercase mt-1 tracking-widest">{lang === 'ID' ? 'Update Terakhir: Hari ini' : 'Last Update: Today'}</p>
                    </div>
                    <TrendingUp className="text-[#2d5a1e] w-6 h-6 opacity-20" />
                  </div>
                  {rankings.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">{lang === 'ID' ? 'Belum ada data' : 'No data yet'}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 dark:border-gray-800">
                            <th className="pb-4 text-left font-bold">{t.stats_rank_no}</th>
                            <th className="pb-4 text-left font-bold">{t.stats_rank_cat}</th>
                            <th className="pb-4 text-right font-bold">{t.stats_rank_qty}</th>
                            <th className="pb-4 text-center font-bold">{t.stats_rank_trend}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {rankings.map((r) => (
                            <tr key={r.no} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="py-5 text-sm font-extrabold text-gray-300 dark:text-gray-600">{r.no}</td>
                              <td className="py-5"><p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#2d5a1e] transition-colors">{r.category}</p></td>
                              <td className="py-5 text-sm font-extrabold text-gray-900 dark:text-white text-right">{r.jumlah}</td>
                              <td className="py-5"><div className="flex justify-center"><TrendIcon trend={r.trend} /></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const DonutChart = ({ slices }) => {
  const total = slices.reduce((a, s) => a + s.pct, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const r = 60, cx = 80, cy = 80, stroke = 22;
  const circumference = 2 * Math.PI * r;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {slices.map((s, i) => {
        const offset = circumference - (s.pct / total) * circumference;
        const rotation = (cumulative / total) * 360 - 90;
        cumulative += s.pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset}
            transform={`rotate(${rotation} ${cx} ${cy})`} className="transition-all duration-700" />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="bold" className="fill-green-900 dark:fill-green-400">{slices.length}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" className="fill-gray-500 dark:fill-gray-400">Categories</text>
    </svg>
  );
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-green-600" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

export default StatistikPage;
