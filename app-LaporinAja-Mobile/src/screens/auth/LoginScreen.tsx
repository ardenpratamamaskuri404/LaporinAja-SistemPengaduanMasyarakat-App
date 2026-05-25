import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Image,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS } from '../../constants/theme';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const { isDarkMode, t } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Harap isi email dan kata sandi Anda.');
      return;
    }
    
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    
    if (!res.success) {
      Alert.alert('Login Gagal', res.message || 'Email atau kata sandi salah.');
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, isDarkMode && s.darkContainer]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Back Button */}
      <TouchableOpacity style={s.absBackBtn} onPress={() => {
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          try { navigation.navigate('Onboarding'); } catch(e) {}
        }
      }}>
        <MaterialCommunityIcons name="arrow-left" size={28} color={isDarkMode ? "#fff" : COLORS.black} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={[s.logoWrapper, isDarkMode && s.darkLogoWrapper]}>
            <MaterialCommunityIcons name="home" size={50} color="#9FCB98" />
          </View>
          <Text style={s.brandName}>LaporinAja</Text>
          <Text style={s.brandTagline}>Sistem Pelaporan Pengaduan Masyarakat</Text>
        </View>

        <View style={s.form}>
          <Text style={s.welcomeText}>Selamat Datang!</Text>
          <Text style={s.instructionText}>Masuk ke akun Anda untuk mulai melapor.</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={s.input}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor="#e2e8f0"
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 16 }}
            left={<TextInput.Icon icon="email-outline" />}
          />

          <TextInput
            label="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={s.input}
            outlineColor="#e2e8f0"
            activeOutlineColor={COLORS.primary}
            theme={{ roundness: 16 }}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)} 
              />
            }
          />

          <TouchableOpacity 
            style={s.forgotBtn} 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={s.forgotT}>Lupa Kata Sandi?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.loginBtn} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.loginBtnT}>Masuk</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.line} />
            <Text style={s.dividerT}>ATAU</Text>
            <View style={s.line} />
          </View>

          <TouchableOpacity 
            style={s.registerLink} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.registerT}>
              Belum memiliki akun? <Text style={s.registerHighlight}>Daftar Sekarang</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 50 },
  logoWrapper: { 
    width: 90, 
    height: 90, 
    borderRadius: 25, 
    backgroundColor: '#ffffff', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkLogoWrapper: {
    backgroundColor: '#1e293b',
    shadowColor: '#000',
  },
  brandName: { fontSize: 32, fontWeight: '900', color: '#9FCB98', letterSpacing: -0.5 },
  brandTagline: { fontSize: 13, color: COLORS.gray500, marginTop: 4, fontWeight: '500' },
  form: { width: '100%' },
  welcomeText: { fontSize: 26, fontWeight: '800', color: COLORS.black, marginBottom: 6 },
  instructionText: { fontSize: 14, color: COLORS.gray500, marginBottom: 35 },
  input: { marginBottom: 18, backgroundColor: '#fff' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 35, padding: 4 },
  forgotT: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  loginBtn: { 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row',
    paddingVertical: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  loginBtnT: { color: '#fff', fontSize: 17, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 35, gap: 15 },
  line: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  dividerT: { color: COLORS.gray400, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  registerLink: { alignItems: 'center', padding: 10 },
  registerT: { fontSize: 14, color: COLORS.gray600 },
  registerHighlight: { color: COLORS.primary, fontWeight: '800' },
  darkContainer: { backgroundColor: '#0f172a' },
  darkText: { color: '#f8fafc' },
  absBackBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 45, height: 45, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
});

export default LoginScreen;
