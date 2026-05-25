// ============================================
// Register Screen - LaporinAja Mobile
// Matching alur-inti.txt fields: 
// Nama, Email, Nomor Telepon, Provinsi, 
// Kota/Kabupaten, Pekerjaan, Alamat, Kata Sandi
// ============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS } from '../../constants/theme';

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const { isDarkMode, t } = useSettings();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_telp: '',
    provinsi: '',
    kota_kabupaten: '',
    pekerjaan: '',
    alamat: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.nama || !form.email || !form.password || !form.no_telp || !form.provinsi || !form.kota_kabupaten) {
      Alert.alert('Peringatan', 'Harap isi semua bidang yang bertanda bintang (*).');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Peringatan', 'Konfirmasi password tidak sesuai.');
      return;
    }
    
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    
    if (res.success) {
      Alert.alert('Berhasil', 'Registrasi berhasil! Silakan login untuk melanjutkan.', [
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Registrasi Gagal', res.message || 'Terjadi kesalahan saat mendaftar.');
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, isDarkMode && s.darkContainer]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('Login'); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? "#fff" : COLORS.black} />
        </TouchableOpacity>
        
        <View style={s.header}>
          <View style={[s.logoWrapper, isDarkMode && s.darkLogoWrapper]}>
            <MaterialCommunityIcons name="home" size={40} color="#9FCB98" />
          </View>
          <Text style={[s.title, isDarkMode && s.darkText]}>Daftar Akun</Text>
          <Text style={[s.subTitle, isDarkMode && { color: '#94a3b8' }]}>Gabung bersama warga lainnya untuk menciptakan lingkungan yang lebih baik.</Text>
        </View>

        <View style={s.form}>
          <TextInput
            label="Nama Lengkap *"
            value={form.nama}
            onChangeText={v => update('nama', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="account-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <TextInput
            label="Email *"
            value={form.email}
            onChangeText={v => update('email', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="email-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <TextInput
            label="Nomor Telepon *"
            value={form.no_telp}
            onChangeText={v => update('no_telp', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            keyboardType="phone-pad"
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="phone-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <View style={s.row}>
            <TextInput
              label="Provinsi *"
              value={form.provinsi}
              onChangeText={v => update('provinsi', v)}
              mode="outlined"
              style={[s.input, isDarkMode && s.darkInput, { flex: 1, marginRight: 8 }]}
              textColor={isDarkMode ? '#fff' : COLORS.black}
              outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
              activeOutlineColor={COLORS.primary}
              theme={{ roundness: 12 }}
            />
            <TextInput
              label="Kota/Kab *"
              value={form.kota_kabupaten}
              onChangeText={v => update('kota_kabupaten', v)}
              mode="outlined"
              style={[s.input, isDarkMode && s.darkInput, { flex: 1, marginLeft: 8 }]}
              textColor={isDarkMode ? '#fff' : COLORS.black}
              outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
              activeOutlineColor={COLORS.primary}
              theme={{ roundness: 12 }}
            />
          </View>

          <TextInput
            label="Pekerjaan"
            value={form.pekerjaan}
            onChangeText={v => update('pekerjaan', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="briefcase-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <TextInput
            label="Alamat Lengkap"
            value={form.alamat}
            onChangeText={v => update('alamat', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput, { height: 100 }]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            multiline
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="map-marker-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <TextInput
            label="Kata Sandi *"
            value={form.password}
            onChangeText={v => update('password', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            secureTextEntry={!showPassword}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="lock-outline" color={isDarkMode ? '#64748b' : undefined} />}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} color={isDarkMode ? '#64748b' : undefined} onPress={() => setShowPassword(!showPassword)} />}
          />

          <TextInput
            label="Konfirmasi Kata Sandi *"
            value={form.confirmPassword}
            onChangeText={v => update('confirmPassword', v)}
            mode="outlined"
            style={[s.input, isDarkMode && s.darkInput]}
            textColor={isDarkMode ? '#fff' : COLORS.black}
            secureTextEntry={!showPassword}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="lock-check-outline" color={isDarkMode ? '#64748b' : undefined} />}
          />

          <TouchableOpacity style={s.regBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.regBtnT}>Daftar Sekarang</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={[s.loginT, isDarkMode && { color: '#94a3b8' }]}>Sudah memiliki akun? <Text style={s.loginHighlight}>Masuk</Text></Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#0f172a' },
  scroll: { paddingHorizontal: 25, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  header: { marginBottom: 30 },
  logoWrapper: { 
    width: 70, 
    height: 70, 
    borderRadius: 20, 
    backgroundColor: 'rgba(159, 203, 152, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20,
  },
  darkLogoWrapper: {
    backgroundColor: 'rgba(159, 203, 152, 0.08)',
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  subTitle: { fontSize: 14, color: COLORS.gray500, lineHeight: 22 },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  darkInput: { backgroundColor: '#1e293b' },
  row: { flexDirection: 'row', width: '100%' },
  regBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  regBtnT: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginT: { fontSize: 14, color: COLORS.gray600 },
  loginHighlight: { color: COLORS.primary, fontWeight: '700' },
});

export default RegisterScreen;
