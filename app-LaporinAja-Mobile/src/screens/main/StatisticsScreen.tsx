import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode } = useSettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In real app, we would have a specific endpoint for complex stats
      const res = await api.get('/users/stats');
      if (res.data.success) {
        // Mocking some data for visualization based on basic stats
        const s = res.data.data;
        setStats({
          total: s.total || 0,
          selesai: s.selesai || 0,
          proses: s.proses || 0,
          pending: s.pending || 0,
          ditolak: s.ditolak || 0,
          categories: [
            { name: 'Infrastruktur', count: 12, color: '#4a7c44', legendFontColor: '#7f7f7f', legendFontSize: 12 },
            { name: 'Kebersihan', count: 8, color: '#99c399', legendFontColor: '#7f7f7f', legendFontSize: 12 },
            { name: 'Keamanan', count: 5, color: '#f59e0b', legendFontColor: '#7f7f7f', legendFontSize: 12 },
            { name: 'Lainnya', count: 3, color: '#94a3b8', legendFontColor: '#7f7f7f', legendFontSize: 12 },
          ]
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <View style={s.loadC}><ActivityIndicator size="large" color={isDarkMode ? COLORS.primaryLight : COLORS.primary} /></View>;

  const chartConfig = {
    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
    backgroundGradientFrom: isDarkMode ? '#1e293b' : '#fff',
    backgroundGradientTo: isDarkMode ? '#1e293b' : '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => isDarkMode ? `rgba(159, 203, 152, ${opacity})` : `rgba(74, 124, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: isDarkMode ? COLORS.primaryLight : COLORS.primary }
  };

  return (
    <View style={[s.container, isDarkMode && s.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[s.header, isDarkMode && s.darkHeader]}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? "#fff" : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerT, isDarkMode && s.darkText]}>Statistik Laporan</Text>
        <TouchableOpacity onPress={fetchStats}>
          <MaterialCommunityIcons name="refresh" size={24} color={isDarkMode ? "#94a3b8" : COLORS.gray400} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Summary Row */}
        <View style={s.summaryRow}>
          <View style={[s.statCard, { backgroundColor: isDarkMode ? '#334155' : COLORS.primarySurface }]}>
            <Text style={[s.statVal, isDarkMode && { color: COLORS.primaryLight }]}>{stats.total}</Text>
            <Text style={[s.statLabel, isDarkMode && s.darkMetaText]}>Total Laporan</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: isDarkMode ? '#1a2e1a' : '#f0fdf4' }]}>
            <Text style={[s.statVal, { color: isDarkMode ? COLORS.primaryLight : '#166534' }]}>{stats.selesai}</Text>
            <Text style={[s.statLabel, isDarkMode && s.darkMetaText]}>Selesai</Text>
          </View>
        </View>

        {/* Categories Pie Chart */}
        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>Distribusi Kategori</Text>
          <View style={[s.chartBox, isDarkMode && s.darkCard]}>
            <PieChart
              data={stats.categories}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              accessor={"count"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          </View>
        </View>

        {/* Weekly Trend Bar Chart */}
        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>Tren Laporan Mingguan</Text>
          <View style={[s.chartBox, isDarkMode && s.darkCard]}>
            <BarChart
              data={{
                labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
                datasets: [{ data: [2, 4, 1, 5, 3, 2, 0] }]
              }}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              showValuesOnTopOfBars
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        {/* Status Distribution */}
        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>Progress Penanganan</Text>
          <View style={[s.progressList, isDarkMode && s.darkCard]}>
            {[
              { label: 'Menunggu', val: stats.pending, color: '#f59e0b', pct: 40 },
              { label: 'Diproses', val: stats.proses, color: '#0ea5e9', pct: 25 },
              { label: 'Selesai', val: stats.selesai, color: '#22c55e', pct: 30 },
              { label: 'Ditolak', val: stats.ditolak, color: '#ef4444', pct: 5 },
            ].map((p, i) => (
              <View key={i} style={s.progItem}>
                <View style={s.progInfo}>
                  <Text style={[s.progLabel, isDarkMode && s.darkText]}>{p.label}</Text>
                  <Text style={[s.progVal, isDarkMode && s.darkMetaText]}>{p.val} Laporan</Text>
                </View>
                <View style={[s.progBg, isDarkMode && { backgroundColor: '#334155' }]}>
                  <View style={[s.progBar, { width: `${p.pct}%`, backgroundColor: p.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  darkText: { color: '#f8fafc' },
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', padding: 20, gap: 15 },
  statCard: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: 13, color: COLORS.gray500, fontWeight: '500' },
  darkMetaText: { color: '#94a3b8' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  secTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 15 },
  chartBox: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  darkCard: { backgroundColor: '#1e293b' },
  progressList: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  progItem: { marginBottom: 15 },
  progInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
  progVal: { fontSize: 13, color: COLORS.gray500 },
  progBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4 },
  progBar: { height: 8, borderRadius: 4 },
});

export default StatisticsScreen;
