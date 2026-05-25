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
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { COLORS, URGENCY_CONFIG } from '../../constants/theme';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../contexts/SettingsContext';

const { width, height } = Dimensions.get('window');

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

const CreateReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDarkMode, t } = useSettings();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
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

  const [mapCenter] = useState({ lat: -6.2088, lng: 106.8456 });
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    if (photos.length >= 3) { Alert.alert(t('Peringatan'), 'Maksimal 3 foto'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', quality: 0.7,
    });
    if (!result.canceled) setPhotos(p => [...p, result.assets[0].uri]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    if (photos.length >= 3) { Alert.alert(t('Peringatan'), 'Maksimal 3 foto'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhotos(p => [...p, result.assets[0].uri]);
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
    if (!agree) { Alert.alert(t('Peringatan'), 'Anda harus menyetujui pernyataan deklarasi.'); return; }
    if (!form.judul || !form.deskripsi) { Alert.alert(t('Peringatan'), 'Harap isi judul dan deskripsi.'); return; }
    
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) fd.append(k, String(v));
      });
      photos.forEach((uri, i) => {
        let name = uri.split('/').pop() || `photo_${i}.jpg`;
        // Ensure name has a valid image extension for backend Multer filter
        if (!/\.(jpe?g|png)$/i.test(name)) {
          name = `${name}.jpg`;
        }
        const type = 'image/jpeg';
        // @ts-ignore
        fd.append('foto', { uri, name, type });
      });
      
      // Explicitly set multipart/form-data header so Axios transmits FormData correctly
      const res = await api.post('/laporan', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.success) {
        Alert.alert(t('Berhasil'), t('Laporan berhasil dikirim!'), [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'HomeTab' }) }]);
      }
    } catch (err: any) {
      console.error('Submit report error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengirim laporan.';
      Alert.alert(t('Gagal'), errMsg);
    } finally { setLoading(false); }
  };

  const renderProgress = () => {
    const pct = step * 25;
    return (
      <View style={[s.progC, isDarkMode && s.darkContainer]}>
        <View style={s.progHead}>
          <Text style={[s.progT, isDarkMode && { color: COLORS.primaryLight }]}>{t('Langkah')} {step} dari 4: {t(['Detail', 'Deskripsi', 'Lokasi', 'Konfirmasi'][step - 1])}</Text>
          <Text style={[s.progPct, isDarkMode && { color: '#94a3b8' }]}>{pct}%</Text>
        </View>
        <View style={[s.progBg, isDarkMode && { backgroundColor: '#1e293b' }]}>
          <View style={[s.progBar, { width: `${pct}%` }]} />
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={s.stepC}>
      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Judul Laporan')}</Text>
      <RNTextInput 
        style={[s.input, isDarkMode && s.darkInput, isDarkMode && s.darkText]} 
        placeholder={t('Apa yang ingin Anda laporkan?')}
        placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
        value={form.judul}
        onChangeText={v => update('judul', v)}
      />

      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Kategori')}</Text>
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

      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Urgensi')}</Text>
      {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
        <TouchableOpacity 
          key={key} 
          style={[s.urgBox, isDarkMode && s.darkInput, form.urgensi === key && s.urgBoxActive]}
          onPress={() => update('urgensi', key)}
        >
          <View style={[s.urgBar, { backgroundColor: cfg.color }]} />
          <View style={s.urgContent}>
            <Text style={[s.urgTitle, isDarkMode && s.darkText]}>{t(cfg.label)}</Text>
            <Text style={[s.urgDesc, isDarkMode && { color: '#64748b' }]}>{t(cfg.desc)}</Text>
          </View>
          {form.urgensi === key && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View style={s.stepC}>
      <Text style={[s.stepHeader, isDarkMode && s.darkText]}>{t('Deskripsi')}</Text>
      <Text style={[s.stepSub, isDarkMode && { color: '#94a3b8' }]}>{t('Ceritakan detail kejadian secara jelas untuk membantu petugas menindaklanjuti laporan Anda.')}</Text>
      
      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Deskripsi Kejadian')}</Text>
      <View style={[s.areaC, isDarkMode && s.darkInput]}>
        <RNTextInput 
          style={[s.area, isDarkMode && s.darkText]} 
          placeholder={t('Tuliskan urutan kejadian, ciri-ciri, atau dampak yang terlihat...')}
          placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
          multiline
          value={form.deskripsi}
          onChangeText={v => update('deskripsi', v)}
        />
        <Text style={s.areaLen}>{form.deskripsi.length} / 1000</Text>
      </View>

      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Tanggal Kejadian')}</Text>
      <TouchableOpacity 
        style={[s.dateBox, isDarkMode && s.darkInput]} 
        onPress={openDatePicker}
        activeOpacity={0.7}
      >
        <RNTextInput 
          style={[s.dateInput, isDarkMode && s.darkText]} 
          value={form.tanggal_kejadian} 
          editable={false} 
          pointerEvents="none"
        />
        <MaterialCommunityIcons name="calendar-outline" size={24} color={isDarkMode ? '#64748b' : COLORS.gray600} />
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={s.stepC}>
      <Text style={[s.stepHeader, isDarkMode && s.darkText]}>{t('Tentukan Lokasi')}</Text>
      <Text style={[s.stepSub, isDarkMode && { color: '#94a3b8' }]}>{t('Berikan detail lokasi kejadian untuk mempermudah petugas.')}</Text>

      <TouchableOpacity style={[s.gpsBtn, isDarkMode && { borderColor: COLORS.primary }]} onPress={getLocation}>
        <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
        <Text style={[s.gpsBtnT, isDarkMode && { color: COLORS.primaryLight }]}>{t('Ambil Lokasi GPS')}</Text>
      </TouchableOpacity>

      <View style={[s.mapContainer, isDarkMode && { borderColor: '#1e293b', borderWidth: 1 }]}>
        <LeafletMap 
          lat={mapCenter.lat} 
          lng={mapCenter.lng} 
          isDarkMode={isDarkMode}
          onLocationSelect={handleLocationSelect} 
        />
      </View>

      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Alamat Lengkap')}</Text>
      <View style={[s.inputC, isDarkMode && { backgroundColor: '#1e293b', borderColor: COLORS.primary }]}>
        <RNTextInput style={[s.input2, { flex: 1, borderWidth: 0, marginBottom: 0, backgroundColor: 'transparent' }, isDarkMode && s.darkText]} value={form.alamat} onChangeText={v => update('alamat', v)} />
        <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.primary} />
      </View>

      <View style={{ flexDirection: 'row', gap: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={[s.label, isDarkMode && s.darkText]}>{t('Kelurahan')}</Text>
          <RNTextInput style={[s.input2, isDarkMode && s.darkInput, isDarkMode && s.darkText]} value={form.kelurahan} onChangeText={v => update('kelurahan', v)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.label, isDarkMode && s.darkText]}>{t('Kecamatan')}</Text>
          <RNTextInput style={[s.input2, isDarkMode && s.darkInput, isDarkMode && s.darkText]} value={form.kecamatan} onChangeText={v => update('kecamatan', v)} />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={s.stepC}>
      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Dokumentasi Foto')}</Text>
      <TouchableOpacity style={[s.photoPlaceholder, isDarkMode && { backgroundColor: '#1e293b', borderStyle: 'dashed' }]} onPress={pickImage}>
        <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={COLORS.primary} />
        <Text style={[s.photoT, isDarkMode && { color: '#94a3b8' }]}>{t('Tap untuk pilih foto')}</Text>
      </TouchableOpacity>

      <View style={s.photoRow}>
        {photos.map((uri, i) => (
          <View key={i} style={s.photoBox}>
            <Image source={{ uri }} style={s.photoImg} />
            <TouchableOpacity style={s.photoDel} onPress={() => setPhotos(p => p.filter((_, j) => j !== i))}>
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 3 && (
          <TouchableOpacity style={[s.photoAdd, isDarkMode && { backgroundColor: '#1e293b' }]} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera-outline" size={32} color={isDarkMode ? '#475569' : COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[s.label, isDarkMode && s.darkText]}>{t('Ringkasan Laporan')}</Text>
      <View style={[s.summaryCard, isDarkMode && { backgroundColor: '#1e293b' }]}>
        <View style={s.sumRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.sumLabel}>{t('Judul')}</Text>
            <Text style={[s.sumVal, isDarkMode && s.darkText]}>{form.judul || t('Belum diisi')}</Text>
          </View>
          <TouchableOpacity onPress={() => setStep(1)}><Text style={s.sumEdit}>{t('Ubah')}</Text></TouchableOpacity>
        </View>
        <View style={s.sumRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.sumLabel}>{t('Lokasi')}</Text>
            <Text style={[s.sumVal, isDarkMode && s.darkText]}>{form.alamat || t('Alamat tidak tersedia')}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={s.agreeRow} onPress={() => setAgree(!agree)}>
        <View style={[s.check, agree && s.checkActive]}>
          {agree && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
        </View>
        <Text style={[s.agreeT, isDarkMode && { color: '#94a3b8' }]}>{t('Saya menyatakan bahwa laporan ini benar adanya dan bersedia bertanggung jawab atas informasi yang diberikan.')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.container, isDarkMode && s.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Custom Premium Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={s.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDatePicker(false)}
        >
          <View style={[s.modalCard, isDarkMode && s.darkCard]}>
            <Text style={[s.modalTitle, isDarkMode && s.darkText]}>{t('Pilih Tanggal Kejadian')}</Text>
            
            <View style={s.pickerRow}>
              {/* Day Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{t('Hari')}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {Array.from({ length: getDaysInMonth(tempDate.month, tempDate.year) }, (_, i) => i + 1).map(day => (
                    <TouchableOpacity 
                      key={day} 
                      style={[s.pickerBtn, tempDate.day === day && s.pickerBtnActive]}
                      onPress={() => setTempDate(p => ({ ...p, day }))}
                    >
                      <Text style={[s.pickerBtnT, isDarkMode && s.darkText, tempDate.day === day && s.pickerBtnTActive]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{t('Bulan')}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {MONTHS_IN.map((monthName, idx) => {
                    const monthVal = idx + 1;
                    return (
                      <TouchableOpacity 
                        key={monthName} 
                        style={[s.pickerBtn, tempDate.month === monthVal && s.pickerBtnActive]}
                        onPress={() => {
                          const maxDays = getDaysInMonth(monthVal, tempDate.year);
                          const nextDay = tempDate.day > maxDays ? maxDays : tempDate.day;
                          setTempDate(p => ({ ...p, month: monthVal, day: nextDay }));
                        }}
                      >
                        <Text style={[s.pickerBtnT, isDarkMode && s.darkText, tempDate.month === monthVal && s.pickerBtnTActive]}>{monthName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{t('Tahun')}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {YEARS.map(year => (
                    <TouchableOpacity 
                      key={year} 
                      style={[s.pickerBtn, tempDate.year === year && s.pickerBtnActive]}
                      onPress={() => {
                        const maxDays = getDaysInMonth(tempDate.month, year);
                        const nextDay = tempDate.day > maxDays ? maxDays : tempDate.day;
                        setTempDate(p => ({ ...p, year, day: nextDay }));
                      }}
                    >
                      <Text style={[s.pickerBtnT, isDarkMode && s.darkText, tempDate.year === year && s.pickerBtnTActive]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={s.modalCancelBtnT}>{t('Batal')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirmBtn} onPress={handleConfirmDate}>
                <Text style={s.modalConfirmBtnT}>{t('Pilih')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <View style={[s.header, isDarkMode && s.darkHeader]}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
          }
        }}>
          <MaterialCommunityIcons name="close" size={28} color={isDarkMode ? "#fff" : COLORS.black} />
        </TouchableOpacity>
        <Text style={[s.headerT, isDarkMode && s.darkText]}>{t('Buat Laporan')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgress()}

      <ScrollView contentContainerStyle={[s.scroll, isDarkMode && s.darkContainer]} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={[s.footer, isDarkMode && s.darkHeader]}>
        <View style={s.btnRow}>
          {step > 1 && (
            <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={isDarkMode ? '#94a3b8' : COLORS.gray600} />
              <Text style={[s.backBtnT, isDarkMode && { color: '#94a3b8' }]}>{t('Kembali')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[s.nextBtn, step === 1 && { width: '100%' }]} 
            onPress={() => step < 4 ? setStep(step + 1) : handleSubmit()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.nextBtnT}>{step === 4 ? t('Kirim Laporan') : t('Lanjut')}</Text>
                <MaterialCommunityIcons name={step === 4 ? "rocket-launch-outline" : "arrow-right"} size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fcf9' },
  darkContainer: { backgroundColor: '#0f172a' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff' },
  darkHeader: { backgroundColor: '#1e293b', borderBottomColor: '#334155', borderTopColor: '#334155' },
  headerT: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  darkText: { color: '#f8fafc' },
  progC: { padding: 20, backgroundColor: '#f9fcf9' },
  progHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progT: { fontSize: 13, fontWeight: '600', color: '#4a7c44' },
  progPct: { fontSize: 13, color: COLORS.gray500 },
  progBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4 },
  progBar: { height: 8, backgroundColor: '#4a7c44', borderRadius: 4 },
  scroll: { padding: 20 },
  stepC: { flex: 1 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.gray700, marginBottom: 15 },
  input: { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 25 },
  darkInput: { backgroundColor: '#1e293b', borderColor: '#334155' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
  catBox: { width: (width - 52) / 2, backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  catBoxActive: { backgroundColor: 'rgba(74, 124, 68, 0.1)', borderColor: '#4a7c44' },
  catT: { fontSize: 14, fontWeight: '600', color: COLORS.gray600 },
  catTActive: { color: '#4a7c44' },
  urgBox: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', alignItems: 'center', paddingRight: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  urgBoxActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(74, 124, 68, 0.05)' },
  urgBar: { width: 5, height: '100%' },
  urgContent: { flex: 1, padding: 15 },
  urgTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  urgDesc: { fontSize: 13, color: COLORS.gray500, lineHeight: 18 },
  stepHeader: { fontSize: 24, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  stepSub: { fontSize: 14, color: COLORS.gray500, lineHeight: 22, marginBottom: 25 },
  areaC: { backgroundColor: '#fff', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 25 },
  area: { minHeight: 150, fontSize: 15, textAlignVertical: 'top' },
  areaLen: { alignSelf: 'flex-end', fontSize: 12, color: COLORS.gray400 },
  dateBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 25 },
  dateInput: { flex: 1, fontSize: 15, color: COLORS.black },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, borderRadius: 25, borderWidth: 1.5, borderColor: '#4a7c44', marginBottom: 25 },
  gpsBtnT: { fontSize: 15, fontWeight: '700', color: '#4a7c44' },
  mapContainer: { height: 280, borderRadius: 20, overflow: 'hidden', marginBottom: 25, position: 'relative' },
  inputC: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 124, 68, 0.05)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, borderWidth: 1, borderColor: '#4a7c44', marginBottom: 20 },
  input2: { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, fontSize: 14 },
  photoPlaceholder: { height: 160, borderWidth: 2, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  photoT: { fontSize: 14, color: COLORS.gray500, marginTop: 10 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  photoBox: { width: 100, height: 100, borderRadius: 12, position: 'relative' },
  photoImg: { width: '100%', height: '100%', borderRadius: 12 },
  photoDel: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  photoAdd: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  summaryCard: { backgroundColor: 'rgba(74, 124, 68, 0.05)', borderRadius: 16, padding: 15, marginBottom: 25 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sumLabel: { fontSize: 13, color: COLORS.gray500, marginBottom: 4 },
  sumVal: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  sumEdit: { fontSize: 14, fontWeight: '600', color: '#4a7c44' },
  agreeRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  check: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#cbd5e1' },
  checkActive: { backgroundColor: '#4a7c44', borderColor: '#4a7c44' },
  agreeT: { flex: 1, fontSize: 13, color: COLORS.gray600, lineHeight: 18 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  btnRow: { flexDirection: 'row', gap: 12 },
  backBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  backBtnT: { fontSize: 16, fontWeight: '700', color: COLORS.gray600 },
  nextBtn: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#4a7c44', paddingVertical: 16, borderRadius: 30 },
  nextBtnT: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 220,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pickerBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerBtnActive: {
    backgroundColor: COLORS.primary,
  },
  pickerBtnT: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  pickerBtnTActive: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  modalCancelBtnT: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  modalConfirmBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  modalConfirmBtnT: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
export default CreateReportScreen;
