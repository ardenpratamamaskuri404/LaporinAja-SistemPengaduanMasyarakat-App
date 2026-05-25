// ============================================
// Notifications Screen - LaporinAja Mobile
// Design: Filter chips, grouped by date, notification cards, bottom banner
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { getSocket } from '../../services/socket';
import { COLORS } from '../../constants/theme';

const FILTERS = ['Semua', 'Belum Dibaca', 'Status', 'Komentar'];

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode, t } = useSettings();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Semua');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifikasi');
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handler = (notif: any) => setNotifications(prev => [notif, ...prev]);
      socket.on('notification:new', handler);
      return () => { socket.off('notification:new', handler); };
    }
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifikasi/read/all');
      setNotifications(prev => prev.map(n => ({ ...n, sudahDibaca: true })));
    } catch (err) { console.error(err); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchNotifications(); setRefreshing(false); };

  const fmtTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter and Group notifications
  const getFilteredGroups = () => {
    let filtered = notifications;
    if (filter === 'Belum Dibaca') filtered = notifications.filter(n => !n.sudahDibaca);
    else if (filter === 'Status') filtered = notifications.filter(n => n.pesan?.toLowerCase().includes('status') || n.pesan?.toLowerCase().includes('proses'));
    else if (filter === 'Komentar') filtered = notifications.filter(n => n.pesan?.toLowerCase().includes('komentar'));

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    const groups: { label: string; items: any[] }[] = [];
    const todayItems: any[] = [];
    const yesterdayItems: any[] = [];
    const olderItems: any[] = [];

    filtered.forEach(item => {
      const d = new Date(item.createdAt);
      if (d.toDateString() === today.toDateString()) todayItems.push(item);
      else if (d.toDateString() === yesterday.toDateString()) yesterdayItems.push(item);
      else olderItems.push(item);
    });

    if (todayItems.length) groups.push({ label: 'Hari Ini', items: todayItems });
    if (yesterdayItems.length) groups.push({ label: 'Kemarin', items: yesterdayItems });
    if (olderItems.length) groups.push({ label: 'Sebelumnya', items: olderItems });

    return groups;
  };

  const getNotifIcon = (notif: any) => {
    const msg = notif.pesan?.toLowerCase() || '';
    if (msg.includes('proses') || msg.includes('diproses')) return { icon: 'file-document-outline', bg: '#eef5ee', color: COLORS.primary };
    if (msg.includes('komentar')) return { icon: 'comment-text-outline', bg: '#fff7ed', color: '#f97316' };
    if (msg.includes('selesai')) return { icon: 'check-circle-outline', bg: '#eef5ee', color: COLORS.primary };
    return { icon: 'bell-outline', bg: isDarkMode ? '#1e293b' : '#f1f5f9', color: isDarkMode ? COLORS.primaryLight : COLORS.gray500 };
  };

  const grouped = getFilteredGroups();

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
        <Text style={[s.headerT, isDarkMode && s.darkText]}>Notifikasi</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={s.readAllT}>Baca Semua</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={[s.filterWrapper, isDarkMode && s.darkHeader, isDarkMode && { borderBottomColor: '#334155' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.filterRow, isDarkMode && { backgroundColor: '#1e293b' }]}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                s.filterChip, 
                filter === f && s.filterActive,
                isDarkMode && filter !== f && { borderColor: '#334155', backgroundColor: '#1e293b' }
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterT, filter === f && s.filterTActive, isDarkMode && filter !== f && { color: '#94a3b8' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.loadC}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {grouped.length === 0 ? (
            <View style={s.emptyC}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color={isDarkMode ? '#334155' : COLORS.gray300} />
              <Text style={[s.emptyT, isDarkMode && { color: '#64748b' }]}>Tidak ada notifikasi</Text>
            </View>
          ) : (
            grouped.map((group, gi) => (
              <View key={gi}>
                <Text style={[s.groupLabel, isDarkMode && { color: '#64748b' }]}>{group.label}</Text>
                {group.items.map((item, i) => {
                  const ic = getNotifIcon(item);
                  return (
                    <TouchableOpacity
                      key={item.id || i}
                      style={[s.card, isDarkMode && s.darkCard, !item.sudahDibaca && s.cardUnread]}
                      onPress={() => item.laporanId && navigation.navigate('ReportDetail', { reportId: item.laporanId })}
                    >
                      <View style={[s.notifIcon, { backgroundColor: isDarkMode ? '#0f172a' : ic.bg }]}>
                        <MaterialCommunityIcons name={ic.icon as any} size={22} color={ic.color} />
                      </View>
                      <View style={s.cardBody}>
                        <View style={s.cardHead}>
                          <Text style={[s.cardTitle, isDarkMode && s.darkText]} numberOfLines={1}>
                            {item.pesan?.split('.')[0] || 'Notifikasi'}
                          </Text>
                          <Text style={s.cardTime}>{fmtTime(item.createdAt)}</Text>
                        </View>
                        <Text style={[s.cardDesc, isDarkMode && { color: '#94a3b8' }]} numberOfLines={2}>
                          {item.pesan}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}

          {/* Bottom Banner Card */}
          <View style={[s.bannerCard, isDarkMode && s.darkCard]}>
            <Image
              source={{ uri: 'https://placehold.co/600x300/4a7c44/ffffff?text=Kerja+Bakti' }}
              style={s.bannerImg}
            />
            <View style={s.bannerOverlay}>
              <Text style={s.bannerTitle}>Kerja Bakti Minggu Ini</Text>
              <Text style={s.bannerDesc}>Bergabunglah bersama warga Cluster Hijau untuk lingkungan yang lebih bersih.</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  readAllT: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  filterRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 25, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: '#fff' },
  filterActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  filterT: { fontSize: 13, fontWeight: '600', color: COLORS.gray500 },
  filterTActive: { color: '#fff' },
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  groupLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray500, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 16, gap: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black, flex: 1, marginRight: 10 },
  cardTime: { fontSize: 12, color: COLORS.gray400 },
  cardDesc: { fontSize: 13, color: COLORS.gray500, lineHeight: 19 },
  emptyC: { alignItems: 'center', paddingTop: 80 },
  emptyT: { fontSize: 14, color: COLORS.gray400, marginTop: 10 },
  bannerCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 20, overflow: 'hidden', height: 160, position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 17 },
  darkContainer: { backgroundColor: '#0f172a' },
  darkHeader: { backgroundColor: '#1e293b' },
  darkText: { color: '#f8fafc' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  filterWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
});

export default NotificationsScreen;
