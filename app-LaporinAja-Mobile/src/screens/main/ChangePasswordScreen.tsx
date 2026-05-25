import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { TextInput, Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import { COLORS } from '../../constants/theme';

const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Peringatan', 'Konfirmasi password baru tidak sesuai.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      if (res.data.success) {
        Alert.alert('Berhasil', 'Kata sandi Anda telah diperbarui.');
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat mengubah kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const paperTheme = {
    colors: {
      ...(isDarkMode ? {
        background: '#1e293b',
        surface: '#1e293b',
        text: '#f8fafc',
        primary: COLORS.primaryLight,
        placeholder: '#94a3b8',
        outline: '#334155',
        onSurface: '#f8fafc',
      } : {
        background: '#fff',
        surface: '#fff',
        text: COLORS.black,
        primary: COLORS.primary,
        placeholder: '#94a3b8',
        outline: '#e2e8f0',
        onSurface: COLORS.black,
      }),
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
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
          <Text style={[s.headerT, isDarkMode && s.darkText]}>Ganti Kata Sandi</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.iconWrapper}>
            <MaterialCommunityIcons name="lock-reset" size={60} color={isDarkMode ? COLORS.primaryLight : COLORS.primary} />
          </View>
          <Text style={[s.desc, isDarkMode && s.darkMetaText]}>Gunakan kata sandi yang kuat dan jangan bagikan kepada siapa pun.</Text>

          <View style={s.form}>
            <TextInput
              label="Kata Sandi Lama"
              value={form.oldPassword}
              onChangeText={v => setForm(f => ({ ...f, oldPassword: v }))}
              mode="outlined"
              secureTextEntry={!showPass.old}
              style={[s.input, isDarkMode && s.darkInput]}
              outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
              activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
              theme={{ roundness: 12, colors: paperTheme.colors }}
              right={<TextInput.Icon icon={showPass.old ? "eye-off" : "eye"} onPress={() => setShowPass(p => ({ ...p, old: !p.old }))} />}
            />
            <TextInput
              label="Kata Sandi Baru"
              value={form.newPassword}
              onChangeText={v => setForm(f => ({ ...f, newPassword: v }))}
              mode="outlined"
              secureTextEntry={!showPass.new}
              style={[s.input, isDarkMode && s.darkInput]}
              outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
              activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
              theme={{ roundness: 12, colors: paperTheme.colors }}
              right={<TextInput.Icon icon={showPass.new ? "eye-off" : "eye"} onPress={() => setShowPass(p => ({ ...p, new: !p.new }))} />}
            />
            <TextInput
              label="Konfirmasi Kata Sandi Baru"
              value={form.confirmPassword}
              onChangeText={v => setForm(f => ({ ...f, confirmPassword: v }))}
              mode="outlined"
              secureTextEntry={!showPass.confirm}
              style={[s.input, isDarkMode && s.darkInput]}
              outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
              activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
              theme={{ roundness: 12, colors: paperTheme.colors }}
              right={<TextInput.Icon icon={showPass.confirm ? "eye-off" : "eye"} onPress={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} />}
            />

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnT}>Perbarui Kata Sandi</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  darkText: { color: '#f8fafc' },
  scroll: { padding: 25, alignItems: 'center' },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  desc: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', lineHeight: 22, marginBottom: 35 },
  darkMetaText: { color: '#94a3b8' },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  darkInput: { backgroundColor: '#1e293b' },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, elevation: 2 },
  saveBtnT: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ChangePasswordScreen;
