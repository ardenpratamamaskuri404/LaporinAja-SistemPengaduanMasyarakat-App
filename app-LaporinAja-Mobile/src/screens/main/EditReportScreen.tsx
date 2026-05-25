import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, Dimensions,
  TextInput as RNTextInput, KeyboardAvoidingView, Platform,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api, { BASE_URL } from '../../services/api';
import { COLORS, URGENCY_CONFIG } from '../../constants/theme';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../contexts/SettingsContext';

const { width } = Dimensions.get('window');

const mapWebIconToMobile = (webIcon: string): string => {
  switch (webIcon) {
    case 'Road': return 'road';
    case 'Hospital': return 'hospital-building';
    case 'GraduationCap': return 'school';
    case 'Leaf': return 'leaf';
    case 'Zap': return 'flash';
    case 'Building2': return 'office-building';
    case 'Sparkles': return 'sparkles';
    case 'MessageCircle': return 'comment-text-outline';
    default: return 'help-circle-outline';
  }
};

const LeafletMap = ({ lat, lng, onLocationSelect, isDarkMode }: any) => {
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
          ${isDarkMode ? '.leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }' : ''}
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat || -6.2088}, ${lng || 106.8456}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);
          var marker = L.marker([${lat || -6.2088}, ${lng || 106.8456}], {draggable: true}).addTo(map);
          
          marker.on('dragend', function(event) {
            var position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify(position));
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
          });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: mapHtml }}
      style={{ flex: 1 }}
      scrollEnabled={false}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);
        onLocationSelect(data.lat, data.lng);
      }}
    />
  );
};

const EditReportScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { reportId } = route.params;
  const { isDarkMode, t } = useSettings();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/kategori');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Infrastruktur',
    urgensi: 'Sedang',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    latitude: -6.2088,
    longitude: 106.8456,
    tanggal_kejadian: new Date().toISOString().split('T')[0],
  });

  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [deletedPhotos, setDeletedPhotos] = useState<number[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const MONTHS_IN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const YEARS = [2024, 2025, 2026];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const loadReport = async () => {
    try {
      const res = await api.get(`/laporan/${reportId}`);
      if (res.data.success) {
        const rep = res.data.data;
        setForm({
          judul: rep.judul || '',
          deskripsi: rep.deskripsi || '',
          kategori: rep.kategori || 'Infrastruktur',
          urgensi: rep.urgensi || 'Sedang',
          alamat: rep.alamat || '',
          kelurahan: rep.kelurahan || '',
          kecamatan: rep.kecamatan || '',
          kota: rep.kota || '',
          latitude: rep.latitude ? Number(rep.latitude) : -6.2088,
          longitude: rep.longitude ? Number(rep.longitude) : 106.8456,
          tanggal_kejadian: rep.tanggal_kejadian ? rep.tanggal_kejadian.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setExistingPhotos(rep.fotos || []);
      }
    } catch (err) {
      Alert.alert(t('Gagal'), 'Gagal memuat detail laporan.');
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const openDatePicker = () => {
    const d = new Date(form.tanggal_kejadian);
    if (!isNaN(d.getTime())) {
      setTempDate({
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
    }
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    const formattedMonth = String(tempDate.month).padStart(2, '0');
    const formattedDay = String(tempDate.day).padStart(2, '0');
    const dateStr = `${tempDate.year}-${formattedMonth}-${formattedDay}`;
    update('tanggal_kejadian', dateStr);
    setShowDatePicker(false);
  };

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const activePhotosCount = existingPhotos.length - deletedPhotos.length + newPhotos.length;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    if (activePhotosCount >= 3) { Alert.alert(t('Peringatan'), 'Maksimal 3 foto'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', quality: 0.7,
    });
    if (!result.canceled) setNewPhotos(p => [...p, result.assets[0].uri]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    if (activePhotosCount >= 3) { Alert.alert(t('Peringatan'), 'Maksimal 3 foto'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setNewPhotos(p => [...p, result.assets[0].uri]);
  };

  const toggleDeleteExistingPhoto = (id: number) => {
    if (deletedPhotos.includes(id)) {
      setDeletedPhotos(p => p.filter(x => x !== id));
    } else {
      setDeletedPhotos(p => [...p, id]);
    }
  };

  const removeNewPhoto = (uri: string) => {
    setNewPhotos(p => p.filter(x => x !== uri));
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      update('latitude', loc.coords.latitude);
      update('longitude', loc.coords.longitude);
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) {
        update('alamat', geo[0].street || geo[0].name || '');
        update('kelurahan', geo[0].district || '');
        update('kecamatan', geo[0].subregion || '');
        update('kota', geo[0].city || '');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    update('latitude', lat);
    update('longitude', lng);
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geo[0]) {
        update('alamat', geo[0].street || geo[0].name || '');
        update('kelurahan', geo[0].district || '');
        update('kecamatan', geo[0].subregion || '');
        update('kota', geo[0].city || '');
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!form.judul || !form.deskripsi) { Alert.alert(t('Peringatan'), 'Harap isi judul dan deskripsi.'); return; }
    
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, String(v));
      });

      if (deletedPhotos.length > 0) {
        fd.append('deletedFotos', JSON.stringify(deletedPhotos));
      }

      newPhotos.forEach((uri, i) => {
        let name = uri.split('/').pop() || `photo_${i}.jpg`;
        if (!/\.(jpe?g|png)$/i.test(name)) {
          name = `${name}.jpg`;
        }
        const type = 'image/jpeg';
        // @ts-ignore
        fd.append('foto', { uri, name, type });
      });
      
      const res = await api.put(`/laporan/${reportId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.success) {
        Alert.alert(t('Berhasil'), 'Laporan Anda berhasil diperbarui!', [
          { text: 'OK', onPress: () => navigation.navigate('ReportDetail', { reportId, refresh: Date.now() }) }
        ]);
      }
    } catch (err: any) {
      console.error('Update report error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan perubahan.';
      Alert.alert(t('Gagal'), errMsg);
    } finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <View style={[s.centerC, isDarkMode && s.darkContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[s.container, isDarkMode && s.darkContainer]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Custom Header */}
      <View style={[s.header, isDarkMode && s.darkHeader]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, isDarkMode && s.darkText]}>Edit Laporan</Text>
        <TouchableOpacity style={s.saveHeaderBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={s.saveHeaderT}>Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* Step 1: Info Detail */}
        <View style={s.section}>
          <Text style={[s.label, isDarkMode && s.darkText]}>Judul Laporan</Text>
          <RNTextInput 
            style={[s.input, isDarkMode && s.darkInput, isDarkMode && s.darkText]} 
            placeholder="Apa yang ingin Anda laporkan?"
            placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
            value={form.judul}
            onChangeText={v => update('judul', v)}
          />

          <Text style={[s.label, isDarkMode && s.darkText]}>Deskripsi Laporan</Text>
          <RNTextInput 
            style={[s.input, s.textArea, isDarkMode && s.darkInput, isDarkMode && s.darkText]} 
            placeholder="Deskripsikan secara detail tentang kejadian atau fasilitas yang rusak..."
            placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
            value={form.deskripsi}
            onChangeText={v => update('deskripsi', v)}
            multiline
            numberOfLines={4}
          />

          <Text style={[s.label, isDarkMode && s.darkText]}>Kategori</Text>
          <View style={s.catGrid}>
            {categories.map(c => (
              <TouchableOpacity 
                key={c.id} 
                style={[s.catBox, isDarkMode && s.darkInput, form.kategori === c.nama && s.catBoxActive, isDarkMode && form.kategori === c.nama && { borderColor: COLORS.primary }]}
                onPress={() => update('kategori', c.nama)}
              >
                <MaterialCommunityIcons name={mapWebIconToMobile(c.icon) as any} size={22} color={form.kategori === c.nama ? COLORS.primary : (isDarkMode ? '#64748b' : COLORS.gray500)} />
                <Text style={[s.catT, isDarkMode && s.darkText, form.kategori === c.nama && s.catTActive]}>{c.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.label, isDarkMode && s.darkText]}>Urgensi</Text>
          {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
            <TouchableOpacity 
              key={key} 
              style={[s.urgBox, isDarkMode && s.darkInput, form.urgensi === key && s.urgBoxActive]}
              onPress={() => update('urgensi', key)}
            >
              <View style={[s.urgBar, { backgroundColor: cfg.color }]} />
              <View style={s.urgContent}>
                <Text style={[s.urgTitle, isDarkMode && s.darkText]}>{cfg.label}</Text>
                <Text style={[s.urgDesc, isDarkMode && { color: '#64748b' }]}>{cfg.desc}</Text>
              </View>
              {form.urgensi === key && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2: Waktu & Tanggal */}
        <View style={s.section}>
          <Text style={[s.label, isDarkMode && s.darkText]}>Tanggal Kejadian</Text>
          <TouchableOpacity style={[s.dateBtn, isDarkMode && s.darkInput]} onPress={openDatePicker}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
            <Text style={[s.dateBtnT, isDarkMode && s.darkText]}>
              {new Date(form.tanggal_kejadian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step 3: Dokumentasi Foto */}
        <View style={s.section}>
          <Text style={[s.label, isDarkMode && s.darkText]}>Dokumentasi Foto</Text>
          <Text style={s.hintText}>Unggah foto pendukung sebagai bukti (Maksimal 3 foto)</Text>
          
          <View style={s.photoGrid}>
            {/* Existing Photos */}
            {existingPhotos.map((p) => {
              const isDeleted = deletedPhotos.includes(p.id);
              return (
                <View key={p.id} style={[s.photoWrapper, isDeleted && s.deletedPhotoWrapper]}>
                  <Image source={{ uri: `${BASE_URL}${p.url}` }} style={[s.photoImg, isDeleted && { opacity: 0.3 }]} />
                  <TouchableOpacity 
                    style={[s.deletePhotoBtn, isDeleted && { backgroundColor: COLORS.primary }]} 
                    onPress={() => toggleDeleteExistingPhoto(p.id)}
                  >
                    <MaterialCommunityIcons name={isDeleted ? "undo" : "trash-can-outline"} size={16} color="#fff" />
                  </TouchableOpacity>
                  {isDeleted && (
                    <View style={s.deletedLabel}>
                      <Text style={s.deletedText}>Dihapus</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* New Photos */}
            {newPhotos.map((uri, idx) => (
              <View key={`new-${idx}`} style={s.photoWrapper}>
                <Image source={{ uri }} style={s.photoImg} />
                <TouchableOpacity style={s.deletePhotoBtn} onPress={() => removeNewPhoto(uri)}>
                  <MaterialCommunityIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Upload Button Box */}
            {activePhotosCount < 3 && (
              <View style={s.photoSelectorRow}>
                <TouchableOpacity style={[s.pickerBox, isDarkMode && s.darkInput]} onPress={pickImage}>
                  <MaterialCommunityIcons name="image-multiple" size={24} color={COLORS.primary} />
                  <Text style={[s.pickerBoxT, isDarkMode && s.darkText]}>Galeri</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.pickerBox, isDarkMode && s.darkInput]} onPress={takePhoto}>
                  <MaterialCommunityIcons name="camera" size={24} color={COLORS.primary} />
                  <Text style={[s.pickerBoxT, isDarkMode && s.darkText]}>Kamera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Step 4: Lokasi */}
        <View style={s.section}>
          <Text style={[s.label, isDarkMode && s.darkText]}>Titik Lokasi Kejadian</Text>
          <View style={s.locationCard}>
            <TouchableOpacity style={s.currentLocBtn} onPress={getLocation} disabled={loading}>
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#fff" />
              <Text style={s.currentLocBtnT}>Gunakan Lokasi Saat Ini</Text>
            </TouchableOpacity>

            <View style={[s.mapContainer, isDarkMode && { borderColor: '#334155' }]}>
              <LeafletMap 
                lat={form.latitude} 
                lng={form.longitude} 
                onLocationSelect={handleLocationSelect}
                isDarkMode={isDarkMode}
              />
            </View>

            <View style={s.addressInfo}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} color={COLORS.primary} />
              <RNTextInput 
                style={[s.addressInput, isDarkMode && s.darkText]} 
                value={form.alamat} 
                onChangeText={v => update('alamat', v)}
                placeholder="Alamat detail..."
                placeholderTextColor={isDarkMode ? '#64748b' : COLORS.gray400}
                multiline
              />
            </View>

            <View style={s.grid2}>
              <View style={s.col}>
                <Text style={s.miniLabel}>Kecamatan</Text>
                <Text style={[s.miniVal, isDarkMode && s.darkText]}>{form.kecamatan || '-'}</Text>
              </View>
              <View style={s.col}>
                <Text style={s.miniLabel}>Kota/Kabupaten</Text>
                <Text style={[s.miniVal, isDarkMode && s.darkText]}>{form.kota || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[s.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.submitBtnT}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, isDarkMode && { backgroundColor: '#1e293b' }]}>
            <Text style={[s.modalTitle, isDarkMode && s.darkText]}>Pilih Tanggal Kejadian</Text>
            
            <View style={s.datePickerLayout}>
              {/* Day */}
              <View style={s.wheelCol}>
                <Text style={s.wheelLabel}>Hari</Text>
                <ScrollView nestedScrollEnabled style={s.wheelScroll}>
                  {Array.from({ length: getDaysInMonth(tempDate.month, tempDate.year) }, (_, i) => i + 1).map(d => (
                    <TouchableOpacity key={d} style={[s.wheelItem, tempDate.day === d && s.wheelItemActive]} onPress={() => setTempDate(p => ({ ...p, day: d }))}>
                      <Text style={[s.wheelItemT, tempDate.day === d && s.wheelItemActiveT, isDarkMode && { color: '#e2e8f0' }]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month */}
              <View style={s.wheelCol}>
                <Text style={s.wheelLabel}>Bulan</Text>
                <ScrollView nestedScrollEnabled style={s.wheelScroll}>
                  {MONTHS_IN.map((m, i) => (
                    <TouchableOpacity key={i} style={[s.wheelItem, tempDate.month === (i + 1) && s.wheelItemActive]} onPress={() => {
                      const maxDays = getDaysInMonth(i + 1, tempDate.year);
                      setTempDate(p => ({
                        ...p,
                        month: i + 1,
                        day: p.day > maxDays ? maxDays : p.day
                      }));
                    }}>
                      <Text style={[s.wheelItemT, tempDate.month === (i + 1) && s.wheelItemActiveT, isDarkMode && { color: '#e2e8f0' }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year */}
              <View style={s.wheelCol}>
                <Text style={s.wheelLabel}>Tahun</Text>
                <ScrollView nestedScrollEnabled style={s.wheelScroll}>
                  {YEARS.map(y => (
                    <TouchableOpacity key={y} style={[s.wheelItem, tempDate.year === y && s.wheelItemActive]} onPress={() => {
                      const maxDays = getDaysInMonth(tempDate.month, y);
                      setTempDate(p => ({
                        ...p,
                        year: y,
                        day: p.day > maxDays ? maxDays : p.day
                      }));
                    }}>
                      <Text style={[s.wheelItemT, tempDate.year === y && s.wheelItemActiveT, isDarkMode && { color: '#e2e8f0' }]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={s.modalBtnRow}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowDatePicker(false)}>
                <Text style={s.modalCancelT}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirm} onPress={handleConfirmDate}>
                <Text style={s.modalConfirmT}>Pilih</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#0f172a' },
  centerC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, flex: 1 },
  saveHeaderBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  saveHeaderT: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  scroll: { padding: 20 },
  section: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  darkInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  catBox: { width: (width - 60) / 2, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', flexDirection: 'row', gap: 8 },
  catBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  catT: { fontSize: 12, color: COLORS.gray500, fontWeight: '600' },
  catTActive: { color: COLORS.primary, fontWeight: '700' },
  urgBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, backgroundColor: '#fff', marginBottom: 10 },
  urgBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  urgBar: { width: 4, height: 36, borderRadius: 2 },
  urgContent: { flex: 1, marginLeft: 12 },
  urgTitle: { fontSize: 13, fontWeight: '700', color: COLORS.black },
  urgDesc: { fontSize: 11, color: COLORS.gray500 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 16, backgroundColor: '#fff' },
  dateBtnT: { fontSize: 14, color: '#0f172a', marginLeft: 10 },
  hintText: { fontSize: 12, color: COLORS.gray500, marginBottom: 12 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoWrapper: { position: 'relative', width: 100, height: 100, borderRadius: 10, overflow: 'hidden' },
  deletedPhotoWrapper: { borderColor: '#ef4444', borderWidth: 2 },
  photoImg: { width: '100%', height: '100%' },
  deletePhotoBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  deletedLabel: { position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.4)', justifyContent: 'center', alignItems: 'center' },
  deletedText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  photoSelectorRow: { flexDirection: 'row', gap: 10, width: '100%' },
  pickerBox: { flex: 1, height: 80, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  pickerBoxT: { fontSize: 12, color: COLORS.gray500, marginTop: 6, fontWeight: '600' },
  locationCard: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, backgroundColor: 'transparent' },
  currentLocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, height: 40, borderRadius: 8, marginBottom: 12 },
  currentLocBtnT: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 8 },
  mapContainer: { height: 200, width: '100%', borderRadius: 10, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  addressInfo: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, marginBottom: 12 },
  addressInput: { flex: 1, fontSize: 13, color: '#0f172a', marginLeft: 8, minHeight: 40, padding: 0, textAlignVertical: 'top' },
  grid2: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  miniLabel: { fontSize: 10, color: COLORS.gray400, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  miniVal: { fontSize: 12, color: COLORS.black, fontWeight: '600' },
  submitBtn: { height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#4a7c44', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  submitBtnT: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, textAlign: 'center', marginBottom: 20 },
  datePickerLayout: { flexDirection: 'row', justifyContent: 'space-between', height: 160, marginBottom: 20 },
  wheelCol: { width: '30%', alignItems: 'center' },
  wheelLabel: { fontSize: 11, fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', marginBottom: 6 },
  wheelScroll: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  wheelItem: { paddingVertical: 10, alignItems: 'center' },
  wheelItemActive: { backgroundColor: COLORS.primarySurface },
  wheelItemT: { fontSize: 13, color: COLORS.black },
  wheelItemActiveT: { color: COLORS.primary, fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancel: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 8, backgroundColor: '#f1f5f9' },
  modalCancelT: { fontSize: 14, fontWeight: '600', color: COLORS.gray500 },
  modalConfirm: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.primary },
  modalConfirmT: { fontSize: 14, fontWeight: '700', color: '#fff' }
});

export default EditReportScreen;
