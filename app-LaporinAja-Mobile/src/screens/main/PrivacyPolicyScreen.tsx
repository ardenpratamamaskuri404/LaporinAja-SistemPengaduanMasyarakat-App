import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS } from '../../constants/theme';

const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode, t } = useSettings();

  const sections = [
    {
      title: '1. Informasi yang Kami Kumpulkan',
      content: 'Kami mengumpulkan informasi yang Anda berikan saat membuat laporan, termasuk nama, lokasi (koordinat GPS), foto, dan deskripsi kejadian. Kami juga mengumpulkan informasi perangkat secara otomatis.'
    },
    {
      title: '2. Penggunaan Informasi',
      content: 'Informasi Anda digunakan untuk memproses pengaduan, memverifikasi lokasi kejadian, dan memungkinkan petugas berwenang untuk merespons laporan Anda dengan tepat.'
    },
    {
      title: '3. Berbagi Informasi',
      content: 'Laporan Anda dapat dilihat oleh admin sistem dan instansi pemerintah terkait. Identitas Anda dapat ditampilkan secara anonim tergantung pada pengaturan privasi laporan Anda.'
    },
    {
      title: '4. Keamanan Data',
      content: 'Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data pribadi Anda dari akses yang tidak sah.'
    },
    {
      title: '5. Hak Anda',
      content: 'Anda berhak untuk mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda yang tersimpan dalam sistem kami.'
    }
  ];

  return (
    <SafeAreaView style={[s.container, isDarkMode && s.darkContainer]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[s.header, isDarkMode && s.darkHeader]}>
        <TouchableOpacity style={s.backBtn} onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, isDarkMode && s.darkText]}>Kebijakan Privasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, isDarkMode && s.darkCard]}>
          <Text style={[s.lastUpdate, isDarkMode && { color: '#94a3b8' }]}>Terakhir diperbarui: 16 Mei 2026</Text>
          <Text style={[s.intro, isDarkMode && s.darkText]}>
            Selamat datang di LaporinAja. Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
          </Text>

          {sections.map((section, i) => (
            <View key={i} style={s.section}>
              <Text style={[s.sectionTitle, isDarkMode && s.darkText]}>{section.title}</Text>
              <Text style={[s.sectionText, isDarkMode && { color: '#94a3b8' }]}>{section.content}</Text>
            </View>
          ))}

          <View style={s.footer}>
            <Text style={[s.footerText, isDarkMode && { color: '#64748b' }]}>
              Dengan menggunakan aplikasi LaporinAja, Anda menyetujui ketentuan dalam Kebijakan Privasi ini.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  darkText: { color: '#f8fafc' },
  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  lastUpdate: { fontSize: 12, color: COLORS.gray500, marginBottom: 12 },
  intro: { fontSize: 14, lineHeight: 22, color: COLORS.gray700, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  sectionText: { fontSize: 14, lineHeight: 22, color: COLORS.gray600 },
  footer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerText: { fontSize: 13, textAlign: 'center', color: COLORS.gray500, fontStyle: 'italic' },
});

export default PrivacyPolicyScreen;
