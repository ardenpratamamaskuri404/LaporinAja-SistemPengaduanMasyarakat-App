import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useSettings } from '../../contexts/SettingsContext';

const FAQS = [
  { q: 'Bagaimana cara membuat laporan?', a: 'Anda dapat menekan tombol (+) di menu utama, lalu ikuti 4 langkah yang disediakan mulai dari detail laporan hingga unggah foto.' },
  { q: 'Berapa lama laporan saya akan diproses?', a: 'Laporan biasanya diverifikasi dalam waktu 24 jam. Waktu penanganan tergantung pada tingkat urgensi yang Anda pilih.' },
  { q: 'Dapatkah saya membatalkan laporan?', a: 'Laporan yang sudah dikirim tidak dapat dibatalkan melalui aplikasi, namun Anda dapat menambahkan komentar pada laporan tersebut.' },
];

const HelpCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode, t } = useSettings();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

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
        <Text style={[s.headerT, isDarkMode && s.darkText]}>{t('Pusat Bantuan')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.searchSection, isDarkMode && s.darkCard]}>
          <Text style={[s.searchTitle, isDarkMode && s.darkText]}>{t('Apa yang bisa kami bantu?')}</Text>
          <TextInput
            placeholder={t('Cari bantuan...')}
            placeholderTextColor={isDarkMode ? '#64748b' : undefined}
            value={search}
            onChangeText={setSearch}
            mode="outlined"
            style={[s.searchInput, isDarkMode && { backgroundColor: '#0f172a' }]}
            textColor={isDarkMode ? '#fff' : undefined}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="magnify" color={isDarkMode ? '#64748b' : undefined} />}
          />
        </View>

        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>{t('Pertanyaan Populer')}</Text>
          {filteredFaqs.map((f, i) => (
            <TouchableOpacity 
              key={i} 
              style={[s.faqBox, isDarkMode && s.darkCard]} 
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <View style={s.faqHead}>
                <Text style={[s.faqQ, isDarkMode && s.darkText]}>{t(f.q)}</Text>
                <MaterialCommunityIcons name={expanded === i ? "chevron-up" : "chevron-down"} size={22} color={COLORS.gray400} />
              </View>
              {expanded === i && <Text style={[s.faqA, isDarkMode && { color: '#94a3b8', borderTopColor: '#334155' }]}>{t(f.a)}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.section}>
          <Text style={[s.secTitle, isDarkMode && s.darkText]}>{t('Hubungi Kami')}</Text>
          <View style={s.contactGrid}>
            <TouchableOpacity style={[s.contactBox, isDarkMode && s.darkCard]} onPress={() => Linking.openURL('https://wa.me/628123456789')}>
              <View style={[s.contactIcon, { backgroundColor: isDarkMode ? '#064e3b' : '#dcfce7' }]}>
                <MaterialCommunityIcons name="whatsapp" size={24} color="#22c55e" />
              </View>
              <Text style={[s.contactT, isDarkMode && s.darkText]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.contactBox, isDarkMode && s.darkCard]} onPress={() => Linking.openURL('mailto:support@laporinja.com')}>
              <View style={[s.contactIcon, { backgroundColor: isDarkMode ? '#0c4a6e' : '#e0f2fe' }]}>
                <MaterialCommunityIcons name="email-outline" size={24} color="#0ea5e9" />
              </View>
              <Text style={[s.contactT, isDarkMode && s.darkText]}>Email</Text>
            </TouchableOpacity>
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
  searchSection: { backgroundColor: '#fff', padding: 25, paddingBottom: 30 },
  searchTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginBottom: 15 },
  searchInput: { backgroundColor: '#fff' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  secTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 15 },
  faqBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  faqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.gray700, marginRight: 10 },
  faqA: { fontSize: 13, color: COLORS.gray500, lineHeight: 20, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  contactGrid: { flexDirection: 'row', gap: 12 },
  contactBox: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  contactIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  contactT: { fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
});

export default HelpCenterScreen;
