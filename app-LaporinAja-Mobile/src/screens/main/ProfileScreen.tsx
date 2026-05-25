import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { COLORS } from '../../constants/theme';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, language, setLanguage, t } = useSettings();
  const [stats, setStats] = useState({ total: 0, selesai: 0, pending: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        if (res.data.success) setStats(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: logout },
    ]);
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
        <Text style={[s.headerT, isDarkMode && s.darkText]}>{t('profile')}</Text>
        <TouchableOpacity onPress={toggleDarkMode}>
          <MaterialCommunityIcons name={isDarkMode ? "weather-sunny" : "weather-night"} size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileRow}>
            {user?.foto_profil ? (
              <Image
                source={{ uri: `${BASE_URL}${user.foto_profil}` }}
                style={s.avatar}
              />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Text style={s.avatarPlaceholderText}>
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={s.profileInfo}>
              <View style={s.nameRow}>
                <Text style={s.name}>{user?.nama || 'User'}</Text>
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedT}>VERIFIKASI</Text>
                </View>
              </View>
              <Text style={s.email}>{user?.email}</Text>
              <Text style={s.roleLabel}>WARGA AKTIF</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNum}>{stats.total || 0}</Text>
              <Text style={s.statLabel}>TOTAL</Text>
            </View>
            <View style={[s.statItem, s.statBorder]}>
              <Text style={s.statNum}>{stats.selesai || 0}</Text>
              <Text style={s.statLabel}>SELESAI</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statNum}>{stats.pending || 0}</Text>
              <Text style={s.statLabel}>PENDING</Text>
            </View>
          </View>
        </View>

        {/* AKUN Section */}
        <Text style={s.sectionTitle}>AKUN</Text>
        <View style={[s.menuCard, isDarkMode && s.darkCard]}>
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('edit_profile')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray400} />
          </TouchableOpacity>
          <View style={[s.menuDivider, isDarkMode && s.darkDivider]} />
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
            <MaterialCommunityIcons name="lock-outline" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('change_password')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* PREFERENSI Section */}
        <Text style={s.sectionTitle}>PREFERENSI</Text>
        <View style={[s.menuCard, isDarkMode && s.darkCard]}>
          <View style={s.menuItem}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('dark_mode')}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e2e8f0', true: COLORS.primaryLight }}
              thumbColor={isDarkMode ? COLORS.primary : '#f4f4f5'}
            />
          </View>
          <View style={[s.menuDivider, isDarkMode && s.darkDivider]} />
          <View style={s.menuItem}>
            <MaterialCommunityIcons name="web" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('language')}</Text>
            <View style={s.langRow}>
              <TouchableOpacity onPress={() => setLanguage('id')} style={[s.langBadge, language === 'id' && s.langActive]}>
                <Text style={[s.langBT, language === 'id' && s.langActiveT]}>ID</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLanguage('en')} style={[s.langBadge, language === 'en' && s.langActive]}>
                <Text style={[s.langBT, language === 'en' && s.langActiveT]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[s.menuDivider, isDarkMode && s.darkDivider]} />
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('Statistics')}>
            <MaterialCommunityIcons name="chart-bar" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('statistics')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* LAINNYA Section */}
        <Text style={s.sectionTitle}>LAINNYA</Text>
        <View style={[s.menuCard, isDarkMode && s.darkCard]}>
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('HelpCenter')}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('help_center')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray400} />
          </TouchableOpacity>
          <View style={[s.menuDivider, isDarkMode && s.darkDivider]} />
          <TouchableOpacity style={s.menuItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
            <Text style={[s.menuT, isDarkMode && s.darkText]}>{t('Kebijakan Privasi')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[s.logoutBtn, isDarkMode && s.darkLogout]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text style={s.logoutT}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={s.version}>Versi 1.0.0 (Build 2026)</Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  profileCard: { marginHorizontal: 20, marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.primary, gap: 15 },
  avatar: { width: 65, height: 65, borderRadius: 33, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  name: { fontSize: 17, fontWeight: '700', color: '#fff' },
  verifiedBadge: { backgroundColor: '#2563eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  verifiedT: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 3 },
  roleLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', paddingVertical: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.gray400, letterSpacing: 1.5, marginHorizontal: 20, marginTop: 24, marginBottom: 10 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, gap: 14 },
  menuT: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.gray700 },
  menuDivider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 54 },
  langRow: { flexDirection: 'row', alignItems: 'center' },
  langT: { fontSize: 14, color: COLORS.gray500, marginRight: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', marginHorizontal: 20, marginTop: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2' },
  logoutT: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  version: { textAlign: 'center', fontSize: 13, color: COLORS.gray400, marginTop: 20, marginBottom: 10 },
  darkContainer: { backgroundColor: '#0f172a' },
  darkHeader: { backgroundColor: '#1e293b' },
  darkText: { color: '#f8fafc' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  darkDivider: { backgroundColor: '#334155' },
  darkLogout: { backgroundColor: '#1e293b', borderColor: '#450a0a' },
  langBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f1f5f9', marginLeft: 8 },
  langActive: { backgroundColor: COLORS.primary },
  langBT: { fontSize: 12, fontWeight: '700', color: COLORS.gray500 },
  langActiveT: { color: '#fff' },
});

export default ProfileScreen;
