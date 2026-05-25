// ============================================
// Home Screen - LaporinAja Mobile
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { COLORS, STATUS_CONFIG } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface HomeStats {
  total: number;
  selesai: number;
  pending: number;
  proses: number;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { isDarkMode, t } = useSettings();
  const [stats, setStats] = useState<HomeStats>({ total: 0, selesai: 0, pending: 0, proses: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get(`/laporan?limit=5`),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (reportsRes.data.success) setRecentReports(reportsRes.data.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
      <View style={[s.badge, { backgroundColor: config.bg }]}>
        <Text style={[s.badgeT, { color: config.color }]}>{config.label.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return <View style={s.loadC}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={[s.container, isDarkMode && s.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header Bar */}
      <View style={[s.topBar, isDarkMode && s.darkHeader]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="home" size={28} color={isDarkMode ? "#4ade80" : COLORS.primary} />
          <View>
            <Text style={[s.logoText, isDarkMode && s.darkText]}>LaporinAja</Text>
            <Text style={s.topSub}>Sistem Pengaduan Masyarakat</Text>
          </View>
        </View>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('NotifTab')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={isDarkMode ? "#fff" : COLORS.gray600} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
            {user?.foto_profil ? (
              <Image 
                source={{ uri: `${BASE_URL}${user.foto_profil}` }} 
                style={s.avatarImg} 
              />
            ) : (
              <View style={[s.avatarImg, s.avatarPlaceholder]}>
                <Text style={s.avatarPlaceholderText}>
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Banner Card */}
        <View style={s.bannerCard}>
          <View style={s.bannerContent}>
            <Text style={s.greet}>Halo, {user?.nama?.split(' ')[0] || 'User'}! 👋</Text>
            <Text style={s.bannerSub}>Mari bersama ciptakan lingkungan yang lebih baik.</Text>
            <TouchableOpacity 
              style={s.bannerBtn} 
              onPress={() => navigation.navigate('CreateReport')}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
              <Text style={s.bannerBtnT}>Buat Laporan</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bannerOverlay} />
        </View>

        {/* Horizontal Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
          <View style={[s.statChip, isDarkMode && s.darkCard]}>
            <View style={[s.statIcon, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="file-multiple" size={18} color="#0288d1" />
            </View>
            <View>
              <Text style={[s.statNum, isDarkMode && s.darkText]}>{stats.total || 0}</Text>
              <Text style={s.statLabel}>Total</Text>
            </View>
          </View>
          <View style={[s.statChip, isDarkMode && s.darkCard]}>
            <View style={[s.statIcon, { backgroundColor: '#fff7ed' }]}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#f97316" />
            </View>
            <View>
              <Text style={[s.statNum, isDarkMode && s.darkText]}>{stats.pending || 0}</Text>
              <Text style={s.statLabel}>Pending</Text>
            </View>
          </View>
          <View style={[s.statChip, isDarkMode && s.darkCard]}>
            <View style={[s.statIcon, { backgroundColor: '#eef5ee' }]}>
              <MaterialCommunityIcons name="progress-wrench" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={[s.statNum, isDarkMode && s.darkText]}>{stats.proses || 0}</Text>
              <Text style={s.statLabel}>Proses</Text>
            </View>
          </View>
          <View style={[s.statChip, isDarkMode && s.darkCard]}>
            <View style={[s.statIcon, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#16a34a" />
            </View>
            <View>
              <Text style={[s.statNum, isDarkMode && s.darkText]}>{stats.selesai || 0}</Text>
              <Text style={s.statLabel}>Selesai</Text>
            </View>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>{t('quick_action')}</Text>
          <View style={s.actGrid}>
            <TouchableOpacity style={[s.actBox, isDarkMode && s.darkCard]} onPress={() => navigation.navigate('CreateReport')}>
              <View style={[s.actIconC, { backgroundColor: '#eef5ee' }]}>
                <MaterialCommunityIcons name="plus-circle-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={[s.actT, isDarkMode && s.darkText]}>Buat{"\n"}Laporan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[s.actBox, isDarkMode && s.darkCard]} onPress={() => navigation.navigate('MyReports')}>
              <View style={[s.actIconC, { backgroundColor: '#fff7ed' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={28} color="#f97316" />
              </View>
              <Text style={[s.actT, isDarkMode && s.darkText]}>Laporan{"\n"}Saya</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.actBox, isDarkMode && s.darkCard]} onPress={() => navigation.navigate('Statistics')}>
              <View style={[s.actIconC, { backgroundColor: '#f0f9ff' }]}>
                <MaterialCommunityIcons name="chart-box-outline" size={28} color="#0ea5e9" />
              </View>
              <Text style={[s.actT, isDarkMode && s.darkText]}>Lihat{"\n"}Statistik</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={s.section}>
          <View style={s.secHead}>
            <Text style={[s.secTitle, isDarkMode && s.darkText]}>{t('recent_reports')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
              <Text style={s.seeAll}>{t('see_all')}</Text>
            </TouchableOpacity>
          </View>

          {recentReports.length === 0 ? (
            <View style={s.empty}>
              <MaterialCommunityIcons name="file-document-outline" size={50} color={COLORS.gray300} />
              <Text style={s.emptyT}>Belum ada laporan terbaru</Text>
            </View>
          ) : (
            recentReports.map((r, i) => (
              <TouchableOpacity 
                key={r.id} 
                style={[s.repCard, isDarkMode && s.darkCard]}
                onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
              >
                <Image 
                  source={{ uri: r.fotos?.[0]?.url ? `${BASE_URL}${r.fotos[0].url}` : 'https://placehold.co/400x300?text=No+Image' }} 
                  style={s.repImg} 
                />
                <View style={s.repInfo}>
                  <View style={s.repHeader}>
                    {getStatusBadge(r.status)}
                    <Text style={s.repTime}>{new Date(r.createdAt).toLocaleDateString('id-ID')}</Text>
                  </View>
                  <Text style={[s.repTitle, isDarkMode && s.darkText]} numberOfLines={1}>{r.judul}</Text>
                  <View style={s.repLocRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.gray400} />
                    <Text style={s.repLoc} numberOfLines={1}>{r.alamat || 'Lokasi tidak tersedia'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fcf9' },
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  logoText: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  topSub: { fontSize: 11, color: COLORS.gray400, marginTop: -2 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 4 },
  avatarImg: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.gray200 },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bannerCard: { margin: 20, height: 150, borderRadius: 24, backgroundColor: COLORS.primary, overflow: 'hidden', padding: 20, justifyContent: 'center' },
  bannerContent: { zIndex: 2 },
  greet: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 15 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 4 },
  bannerBtnT: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  bannerOverlay: { position: 'absolute', right: -30, bottom: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)' },
  statsScroll: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#f1f5f9', elevation: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: COLORS.black },
  statLabel: { fontSize: 12, color: COLORS.gray500, fontWeight: '500' },
  section: { paddingHorizontal: 20, marginTop: 10 },
  secTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 15 },
  actGrid: { flexDirection: 'row', gap: 12 },
  actBox: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray100, elevation: 1 },
  actIconC: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actT: { fontSize: 13, fontWeight: '600', color: COLORS.gray700, textAlign: 'center', lineHeight: 18 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  repCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 12, elevation: 1 },
  repImg: { width: 85, height: 85, borderRadius: 16, marginRight: 15 },
  repInfo: { flex: 1, justifyContent: 'center' },
  repHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeT: { fontSize: 10, fontWeight: '800' },
  repTime: { fontSize: 11, color: COLORS.gray400 },
  repTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginBottom: 6 },
  repLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repLoc: { fontSize: 12, color: COLORS.gray500 },
  empty: { padding: 40, alignItems: 'center' },
  emptyT: { fontSize: 14, color: COLORS.gray400, marginTop: 10 },
  darkContainer: { backgroundColor: '#0f172a' },
  darkHeader: { backgroundColor: '#1e293b' },
  darkText: { color: '#f8fafc' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
});

export default HomeScreen;
