import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { COLORS } from '../../constants/theme';

const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUserData } = useAuth();
  const { isDarkMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: user?.nama || '',
    no_telp: user?.no_telp || '',
    alamat: user?.alamat || '',
    pekerjaan: user?.pekerjaan || '',
  });
  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (newAvatar) {
        fd.append('foto', {
          uri: newAvatar,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await api.put('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        await updateUserData(res.data.data);
        Alert.alert('Berhasil', 'Profil Anda telah diperbarui.');
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.container, isDarkMode && { backgroundColor: '#0f172a' }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[s.header, isDarkMode && { backgroundColor: '#1e293b', borderBottomColor: '#334155' }]}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerT, isDarkMode && { color: '#f8fafc' }]}>Edit Profil</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={isDarkMode ? COLORS.primaryLight : COLORS.primary} /> : <Text style={s.saveT}>Simpan</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.avatarSection}>
          <View style={s.avatarWrapper}>
            {newAvatar || user?.foto_profil ? (
              <Image
                source={{ uri: newAvatar || `${BASE_URL}${user?.foto_profil}` }}
                style={s.avatar}
              />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Text style={s.avatarPlaceholderText}>
                  {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={s.editAvatarBtn} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[s.avatarHint, isDarkMode && { color: '#94a3b8' }]}>Ketuk untuk mengubah foto profil</Text>
        </View>

        <View style={s.form}>
          <TextInput
            label="Nama Lengkap"
            value={form.nama}
            onChangeText={v => setForm(f => ({ ...f, nama: v }))}
            mode="outlined"
            style={[s.input, isDarkMode && { backgroundColor: '#1e293b' }]}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
            theme={{ 
              roundness: 12, 
              colors: {
                background: isDarkMode ? '#1e293b' : '#fff',
                surface: isDarkMode ? '#1e293b' : '#fff',
                text: isDarkMode ? '#f8fafc' : COLORS.black,
                primary: isDarkMode ? COLORS.primaryLight : COLORS.primary,
                placeholder: '#94a3b8',
                onSurface: isDarkMode ? '#f8fafc' : COLORS.black,
                outline: isDarkMode ? '#334155' : '#e2e8f0',
              }
            }}
          />
          <TextInput
            label="Nomor Telepon"
            value={form.no_telp}
            onChangeText={v => setForm(f => ({ ...f, no_telp: v }))}
            mode="outlined"
            style={[s.input, isDarkMode && { backgroundColor: '#1e293b' }]}
            keyboardType="phone-pad"
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
            theme={{ 
              roundness: 12, 
              colors: {
                background: isDarkMode ? '#1e293b' : '#fff',
                surface: isDarkMode ? '#1e293b' : '#fff',
                text: isDarkMode ? '#f8fafc' : COLORS.black,
                primary: isDarkMode ? COLORS.primaryLight : COLORS.primary,
                placeholder: '#94a3b8',
                onSurface: isDarkMode ? '#f8fafc' : COLORS.black,
                outline: isDarkMode ? '#334155' : '#e2e8f0',
              }
            }}
          />
          <TextInput
            label="Pekerjaan"
            value={form.pekerjaan}
            onChangeText={v => setForm(f => ({ ...f, pekerjaan: v }))}
            mode="outlined"
            style={[s.input, isDarkMode && { backgroundColor: '#1e293b' }]}
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
            theme={{ 
              roundness: 12, 
              colors: {
                background: isDarkMode ? '#1e293b' : '#fff',
                surface: isDarkMode ? '#1e293b' : '#fff',
                text: isDarkMode ? '#f8fafc' : COLORS.black,
                primary: isDarkMode ? COLORS.primaryLight : COLORS.primary,
                placeholder: '#94a3b8',
                onSurface: isDarkMode ? '#f8fafc' : COLORS.black,
                outline: isDarkMode ? '#334155' : '#e2e8f0',
              }
            }}
          />
          <TextInput
            label="Alamat Lengkap"
            value={form.alamat}
            onChangeText={v => setForm(f => ({ ...f, alamat: v }))}
            mode="outlined"
            style={[s.input, isDarkMode && { backgroundColor: '#1e293b' }]}
            multiline
            outlineColor={isDarkMode ? '#334155' : '#e2e8f0'}
            activeOutlineColor={isDarkMode ? COLORS.primaryLight : COLORS.primary}
            theme={{ 
              roundness: 12, 
              colors: {
                background: isDarkMode ? '#1e293b' : '#fff',
                surface: isDarkMode ? '#1e293b' : '#fff',
                text: isDarkMode ? '#f8fafc' : COLORS.black,
                primary: isDarkMode ? COLORS.primaryLight : COLORS.primary,
                placeholder: '#94a3b8',
                onSurface: isDarkMode ? '#f8fafc' : COLORS.black,
                outline: isDarkMode ? '#334155' : '#e2e8f0',
              }
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  saveT: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  scroll: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9' },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarHint: { fontSize: 13, color: COLORS.gray400, marginTop: 12 },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
});

export default EditProfileScreen;
