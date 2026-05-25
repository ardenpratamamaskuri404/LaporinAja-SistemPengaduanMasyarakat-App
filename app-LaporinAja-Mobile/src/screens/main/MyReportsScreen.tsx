// ============================================
// My Reports Screen - LaporinAja Mobile
// Design: Filter chips (Semua/Diproses/Selesai/Ditolak),
// Report cards with image thumbnail + info + status badge
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { COLORS, STATUS_CONFIG } from '../../constants/theme';

const FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'PROSES', label: 'Diproses' },
  { key: 'SELESAI', label: 'Selesai' },
  { key: 'DITOLAK', label: 'Ditolak' },
];

const MyReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { isDarkMode } = useSettings();
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const params: any = { userId: user?.id };
      if (filter !== 'ALL') params.status = filter;
      const res = await api.get('/laporan', { params });
      if (res.data.success) setReports(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.id, filter]);

  useEffect(() => { setLoading(true); fetchReports(); }, [fetchReports]);

  const onRefresh = async () => { setRefreshing(true); await fetchReports(); setRefreshing(false); };

  const fmtTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff}m yang lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)}j yang lalu`;
    if (diff < 2880) return 'Kemarin';
    return `${Math.floor(diff / 1440)} hari lalu`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const imgUri = item.fotos?.[0]?.url
      ? `${BASE_URL}${item.fotos[0].url}`
      : 'https://placehold.co/200x200/e2e8f0/94a3b8?text=No+Img';

    return (
      <TouchableOpacity
        style={[s.card, isDarkMode && s.darkCard]}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        activeOpacity={0.7}
      >
        {/* Thumbnail */}
        <Image source={{ uri: imgUri }} style={s.cardImg} />

        {/* Info */}
        <View style={s.cardInfo}>
          <View style={s.cardTop}>
            <Text style={[s.cardTitle, isDarkMode && s.darkText]} numberOfLines={1}>{item.judul}</Text>
            <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
              <Text style={[s.statusT, { color: st.color }]}>{st.label.toUpperCase()}</Text>
            </View>
          </View>

          <View style={s.cardMeta}>
            <MaterialCommunityIcons name="tools" size={13} color={isDarkMode ? '#94a3b8' : COLORS.gray400} />
            <Text style={[s.cardMetaT, isDarkMode && s.darkMetaText]}>{item.kategori}</Text>
          </View>

          <View style={s.cardBottom}>
            <View style={s.cardMeta}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={isDarkMode ? '#94a3b8' : COLORS.gray400} />
              <Text style={[s.cardMetaT, isDarkMode && s.darkMetaText]}>{item.alamat || item.kecamatan || 'Lokasi'}</Text>
            </View>
            <Text style={[s.cardTime, isDarkMode && s.darkMetaText]}>{fmtTime(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, isDarkMode && s.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View style={[s.header, isDarkMode && s.darkHeader]}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={isDarkMode ? "#fff" : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerT, isDarkMode && s.darkText]}>Laporan Saya</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="filter-variant" size={24} color={isDarkMode ? "#94a3b8" : COLORS.gray500} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={[s.filterRow, isDarkMode && s.darkHeader]}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              s.filterChip, 
              filter === f.key && s.filterActive,
              isDarkMode && filter !== f.key && { borderColor: '#334155', backgroundColor: '#1e293b' }
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              s.filterT, 
              filter === f.key && s.filterTActive,
              isDarkMode && filter !== f.key && { color: '#94a3b8' }
            ]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadC}><ActivityIndicator size="large" color={isDarkMode ? COLORS.primaryLight : COLORS.primary} /></View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[isDarkMode ? COLORS.primaryLight : COLORS.primary]} />}
          ListEmptyComponent={
            <View style={s.emptyC}>
              <MaterialCommunityIcons name="file-search-outline" size={60} color={isDarkMode ? '#334155' : COLORS.gray300} />
              <Text style={[s.emptyT, isDarkMode && s.darkMetaText]}>Tidak ada laporan</Text>
              <Text style={[s.emptySub, isDarkMode && s.darkMetaText]}>
                {filter !== 'ALL' ? 'Coba ubah filter pencarian' : 'Buat laporan pertama Anda'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  darkHeader: { backgroundColor: '#1e293b' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  darkText: { color: '#f8fafc' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 25, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: '#fff' },
  filterActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  filterT: { fontSize: 13, fontWeight: '600', color: COLORS.gray500 },
  filterTActive: { color: '#fff' },
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, gap: 14 },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  cardImg: { width: 80, height: 80, borderRadius: 14 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusT: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  cardMetaT: { fontSize: 12, color: COLORS.gray500 },
  darkMetaText: { color: '#94a3b8' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTime: { fontSize: 11, color: COLORS.gray400 },
  emptyC: { alignItems: 'center', paddingTop: 80 },
  emptyT: { fontSize: 16, fontWeight: '700', color: COLORS.gray500, marginTop: 16 },
  emptySub: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
});

export default MyReportsScreen;
