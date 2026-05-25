import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, Platform,
  TextInput as RNTextInput, KeyboardAvoidingView, Dimensions,
  FlatList, Animated, Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api, { BASE_URL } from '../../services/api';
import { getSocket } from '../../services/socket';
import { COLORS, STATUS_CONFIG } from '../../constants/theme';

const { width } = Dimensions.get('window');

const LeafletDetailMap = ({ lat, lng, isDarkMode }: any) => {
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
          var map = L.map('map').setView([${lat}, ${lng}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map);
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
    />
  );
};

const ReportDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { reportId } = route.params;
  const { user } = useAuth();
  const { isDarkMode, t } = useSettings();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const [ratingVal, setRatingVal] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabFade = useRef(new Animated.Value(1)).current;

  const fetchReport = useCallback(async () => {
    try {
      const res = await api.get(`/laporan/${reportId}`);
      if (res.data.success) setReport(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat laporan');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } finally { setLoading(false); }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReport();
    });
    const interval = setInterval(() => {
      fetchReport();
    }, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation, fetchReport]);

  const handleDelete = () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus laporan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await api.delete(`/laporan/${reportId}`);
              if (res.data.success) {
                Alert.alert('Berhasil', 'Laporan berhasil dihapus.');
                navigation.goBack();
              }
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || 'Gagal menghapus laporan';
              Alert.alert('Gagal', msg);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };



  useEffect(() => {
    if (!loading && report) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading, report]);

  useEffect(() => {
    tabFade.setValue(0);
    Animated.timing(tabFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [activeTab]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const commentHandler = (data: any) => {
        if (data.laporanId === reportId) {
          setReport((prev: any) => prev ? { ...prev, comments: [...(prev.comments || []), data] } : prev);
        }
      };
      const statusHandler = (data: any) => {
        if (data.laporanId === reportId) {
          setReport((prev: any) => prev ? { 
            ...prev, 
            status: data.statusBaru,
            statusHistories: [data, ...(prev.statusHistories || [])]
          } : prev);
        }
      };
      socket.on('comment:new', commentHandler);
      socket.on('status:updated', statusHandler);
      return () => { 
        socket.off('comment:new', commentHandler); 
        socket.off('status:updated', statusHandler);
      };
    }
  }, [reportId]);

  const submitRating = async () => {
    if (ratingVal < 1) return;
    setSubmittingRating(true);
    try {
      const res = await api.post(`/laporan/${reportId}/rating`, { 
        nilai: ratingVal, 
        komentar: ratingComment 
      });
      if (res.data.success) {
        Alert.alert('Sukses', 'Terima kasih atas penilaian Anda!');
        fetchReport();
      }
    } catch (err: any) { 
      console.error('Rating error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal mengirim rating';
      Alert.alert('Gagal', errMsg); 
    } finally { 
      setSubmittingRating(false); 
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const fileUri = `${documentDirectory}Laporan-${report.id}.pdf`;
      const downloadRes = await downloadAsync(
        `${BASE_URL}/laporan/${reportId}/pdf`,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (downloadRes.status === 200) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Unduh Laporan #${report.id}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        throw new Error(`Server returned status code ${downloadRes.status}`);
      }
    } catch (err: any) {
      console.error('Download PDF error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengunduh PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${BASE_URL}/laporan/${reportId}`;
      const text = `Halo, saya ingin membagikan laporan pengaduan: "${report.judul}".\nCek detailnya di: ${shareUrl}`;
      await Share.share({
        message: text,
        title: `Laporan #${report.id}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (report && report.rating) {
      setRatingVal(report.rating.nilai);
    }
  }, [report]);

  const sendComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await api.post(`/comment/${reportId}`, { isi: comment.trim() });
      setComment('');
      fetchReport();
    } catch (err) { Alert.alert('Error', 'Gagal mengirim komentar'); }
    finally { setSending(false); }
  };

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <View style={[s.loadC, isDarkMode && s.darkContainer]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!report) return null;

  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
  const photos = report.fotos || [];
  const heroUri = photos.length > 0
    ? `${BASE_URL}${photos[selectedPhoto]?.url}`
    : 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';

  const TABS = [
    { key: 'detail', label: 'Detail' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'riwayat', label: 'Riwayat' },
    { key: 'komentar', label: 'Komentar' },
  ];

  const getTimeline = () => {
    if (!report) return [];

    // Filter consecutive duplicates in status histories
    const uniqueHistories = [...(report.statusHistories || [])]
      .reverse()
      .filter((h: any, index: number, arr: any[]) => {
        return index === 0 || h.statusBaru !== arr[index - 1].statusBaru;
      });

    // Append current status if it's different and not in history
    if (report.status !== 'PENDING') {
      const lastHistoryStatus = uniqueHistories.length > 0 ? uniqueHistories[uniqueHistories.length - 1].statusBaru : 'PENDING';
      if (lastHistoryStatus !== report.status) {
        uniqueHistories.push({
          statusBaru: report.status,
          createdAt: report.updatedAt || new Date().toISOString(),
          user: { nama: 'Sistem' }
        });
      }
    }

    const timeline = [
      {
        status: 'Laporan Terkirim',
        createdAt: report.createdAt,
        user: { nama: report.user?.nama || 'Masyarakat' },
        description: 'Laporan berhasil dibuat dan dikirim ke sistem.'
      },
      ...uniqueHistories.map((h: any) => {
        let statusLabel = h.statusBaru;
        let desc = '';
        if (h.statusBaru === 'PROSES') {
          statusLabel = 'Diverifikasi & Diproses';
          desc = h.user?.nama ? `Laporan diverifikasi oleh Admin (${h.user.nama}) dan masuk tahap penanganan.` : 'Laporan sedang diproses oleh petugas.';
        } else if (h.statusBaru === 'SELESAI') {
          statusLabel = 'Laporan Selesai';
          desc = h.user?.nama ? `Laporan ditandai selesai oleh Admin (${h.user.nama}).` : 'Laporan telah selesai ditangani.';
        } else if (h.statusBaru === 'DITOLAK') {
          statusLabel = 'Laporan Ditolak';
          desc = h.user?.nama ? `Laporan ditolak oleh Admin (${h.user.nama}).` : 'Laporan ditolak.';
        }
        return {
          status: statusLabel,
          createdAt: h.createdAt,
          user: h.user,
          description: desc
        };
      })
    ];

    return timeline;
  };

  const timelineItems = getTimeline();

  return (
    <KeyboardAvoidingView 
      style={[s.container, isDarkMode && s.darkContainer]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
    >
      <StatusBar style="light" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Animated.View style={[s.heroC, { opacity: fadeAnim }]}>
          <Image source={{ uri: heroUri }} style={s.heroImg} />
          <View style={s.heroOverlay}>
            <TouchableOpacity style={s.heroBtn} onPress={() => {
              if (navigation.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                try { navigation.navigate('MainTabs', { screen: 'HomeTab' }); } catch(e) {}
              }
            }}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={s.heroTitle}>Detail Laporan</Text>
            <TouchableOpacity style={s.heroBtn}>
              <MaterialCommunityIcons name="share-variant-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Thumbnails */}
        {photos.length > 0 && (
          <View style={s.thumbRow}>
            {photos.map((p: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[s.thumb, selectedPhoto === i && s.thumbActive]}
                onPress={() => setSelectedPhoto(i)}
              >
                <Image source={{ uri: `${BASE_URL}${p.url}` }} style={s.thumbImg} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Card */}
        <Animated.View style={[s.infoCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.infoHead}>
            <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
              <Text style={[s.statusT, { color: st.color }]}>{st.label.toUpperCase()}</Text>
            </View>
            <Text style={[s.dateT, isDarkMode && { color: '#94a3b8' }]}>{fmtDate(report.createdAt)}</Text>
          </View>
          <Text style={[s.reportTitle, isDarkMode && s.darkText]}>{report.judul}</Text>
          <View style={s.chipRow}>
            <View style={[s.chipOutline, isDarkMode && { borderColor: '#334155' }]}>
              <MaterialCommunityIcons name="tools" size={14} color={isDarkMode ? COLORS.primaryLight : COLORS.gray600} />
              <Text style={[s.chipT, isDarkMode && s.darkText]}>{report.kategori}</Text>
            </View>
            <View style={[s.chipOutline, { borderColor: '#f59e0b' }]}>
              <Text style={[s.chipT, { color: '#d97706' }]}>! {report.urgensi || 'Mendesak'}</Text>
            </View>
          </View>
          
          {/* Action Row for Edit and Delete */}
          {report.userId === user?.id && (
            <View style={s.actionRow}>
              {report.status === 'PENDING' && (
                <TouchableOpacity 
                  style={[s.actionBtn, s.editBtn]} 
                  onPress={() => navigation.navigate('EditReport', { reportId: report.id })}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                  <Text style={s.actionBtnT}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[s.actionBtn, s.deleteBtn]} 
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="trash-can" size={16} color="#fff" />
                    <Text style={s.actionBtnT}>Hapus</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Tabs */}
        <View style={[s.tabBar, isDarkMode && { borderBottomColor: '#334155' }]}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, activeTab === t.key && s.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[s.tabT, activeTab === t.key && s.tabTActive, isDarkMode && activeTab !== t.key && { color: '#64748b' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <Animated.View style={[s.tabContent, { opacity: tabFade }]}>
          {activeTab === 'detail' && (
            <View>
              {/* BUKTI PENANGANAN RESMI OLEH PETUGAS */}
              {report.status === 'SELESAI' && (report.keterangan_selesai || (report.fotosSelesai && report.fotosSelesai.length > 0)) && (
                <View style={[s.resolutionCard, isDarkMode && s.darkResolutionCard]}>
                  <View style={s.resolutionTitleRow}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={isDarkMode ? '#4ade80' : '#166534'} />
                    <Text style={[s.resolutionTitle, isDarkMode && s.darkResolutionTitle]}>
                      BUKTI PENANGANAN PENGERJAAN
                    </Text>
                  </View>
                  {report.keterangan_selesai && (
                    <Text style={[s.resolutionDesc, isDarkMode && s.darkResolutionDesc]}>
                      {report.keterangan_selesai}
                    </Text>
                  )}
                  {report.fotosSelesai && report.fotosSelesai.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -10, paddingHorizontal: 10 }}>
                      {report.fotosSelesai.map((foto: any, i: number) => (
                        <Image 
                          key={i}
                          source={{ uri: `${BASE_URL}${foto.url}` }} 
                          style={[s.resolutionImg, { marginRight: i < report.fotosSelesai.length - 1 ? 10 : 0 }]} 
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              <Text style={[s.secLabel, isDarkMode && s.darkText]}>Deskripsi</Text>
              <Text style={[s.descText, isDarkMode && { color: '#94a3b8' }]}>{report.deskripsi}</Text>

              {report.tanggal_kejadian && (
                <>
                  <Text style={[s.secLabel, isDarkMode && s.darkText]}>Tanggal Kejadian</Text>
                  <Text style={[s.descText, isDarkMode && { color: '#94a3b8' }]}>{fmtDate(report.tanggal_kejadian)}</Text>
                </>
              )}

              {report.status === 'SELESAI' && (
                <View style={[s.ratingCard, isDarkMode && { backgroundColor: '#1c1917', borderColor: '#44403c' }]}>
                  <Text style={[s.ratingTitle, isDarkMode && { color: '#fdba74' }]}>Beri Rating Layanan</Text>
                  
                  {report.rating ? (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                      <View style={s.stars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <MaterialCommunityIcons 
                            key={star}
                            name={star <= report.rating.nilai ? "star" : "star-outline"} 
                            size={32} 
                            color="#f59e0b" 
                          />
                        ))}
                      </View>
                      {report.rating.komentar && (
                        <Text style={[s.ratingCommentText, isDarkMode && s.darkText]}>
                          "{report.rating.komentar}"
                        </Text>
                      )}
                      <Text style={s.ratingDone}>Penilaian Anda telah tersimpan.</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={[s.ratingSub, isDarkMode && { color: '#a8a29e' }]}>Bagaimana penilaian Anda terhadap penanganan laporan ini?</Text>
                      <View style={s.stars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <TouchableOpacity key={star} onPress={() => setRatingVal(star)}>
                            <MaterialCommunityIcons 
                              name={star <= ratingVal ? "star" : "star-outline"} 
                              size={32} 
                              color={star <= ratingVal ? "#f59e0b" : COLORS.gray300} 
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      {ratingVal > 0 && (
                        <View style={{ marginTop: 15 }}>
                          <RNTextInput
                            style={[s.ratingInput, isDarkMode && { backgroundColor: '#0f172a', color: '#fff' }]}
                            placeholder="Tulis ulasan/komentar (opsional)..."
                            placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
                            value={ratingComment}
                            onChangeText={setRatingComment}
                            multiline
                          />
                          <TouchableOpacity 
                            style={s.ratingSubmitBtn} 
                            onPress={submitRating}
                            disabled={submittingRating}
                          >
                            {submittingRating ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={s.ratingSubmitBtnT}>Kirim Penilaian</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Ekspor & Bagikan Section */}
              <View style={[s.exportCard, isDarkMode && s.darkCard]}>
                <Text style={[s.exportTitle, isDarkMode && s.darkText]}>Ekspor & Bagikan</Text>
                <Text style={s.exportSub}>Anda dapat mengunduh salinan resmi laporan ini dalam format PDF atau membagikannya ke media sosial.</Text>
                
                <View style={s.exportBtnRow}>
                  <TouchableOpacity 
                    style={[s.exportBtn, s.pdfBtn]} 
                    onPress={handleDownloadPDF}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" />
                        <Text style={s.pdfBtnT}>Unduh PDF</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[s.exportBtn, s.shareBtn]} onPress={handleShare}>
                    <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                    <Text style={s.shareBtnT}>Bagikan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'lokasi' && (
            <View>
              <View style={[s.locCard, isDarkMode && { backgroundColor: '#1e293b' }]}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.locAddr, isDarkMode && s.darkText]}>{report.alamat || 'Alamat tidak tersedia'}</Text>
                  {(report.kelurahan || report.kecamatan || report.kota) && (
                    <Text style={[s.locSub, isDarkMode && { color: '#94a3b8' }]}>
                      {[report.kelurahan, report.kecamatan, report.kota].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </View>
              </View>
              {report.latitude && report.longitude && (
                <View>
                  <View style={[s.mapContainer, isDarkMode && { borderColor: '#1e293b', borderWidth: 1 }]}>
                    <LeafletDetailMap 
                      lat={Number(report.latitude)} 
                      lng={Number(report.longitude)} 
                      isDarkMode={isDarkMode}
                    />
                  </View>
                  <View style={s.coordsContainer}>
                    <MaterialCommunityIcons name="compass-outline" size={16} color={isDarkMode ? COLORS.primaryLight : COLORS.primary} />
                    <Text style={[s.coordsText, isDarkMode && s.darkText]}>
                      Koordinat: {Number(report.latitude).toFixed(6)}, {Number(report.longitude).toFixed(6)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'riwayat' && (
            <View>
              {timelineItems.length > 0 ? (
                timelineItems.map((h: any, i: number) => {
                  const isLatest = i === timelineItems.length - 1;
                  return (
                    <View key={i} style={s.tlItem}>
                      <View style={s.tlLeft}>
                        <View style={[s.tlDot, isLatest && { backgroundColor: COLORS.primary }]}>
                          {isLatest ? (
                            <MaterialCommunityIcons name="check" size={12} color="#fff" />
                          ) : (
                            <MaterialCommunityIcons name="circle-small" size={16} color={COLORS.gray400} />
                          )}
                        </View>
                        {i < timelineItems.length - 1 && <View style={[s.tlLine, isDarkMode && { backgroundColor: '#334155' }]} />}
                      </View>
                      <View style={s.tlRight}>
                        <Text style={[s.tlTitle, isDarkMode && s.darkText]}>{h.status}</Text>
                        <Text style={[s.tlDate, isDarkMode && { color: '#64748b' }]}>{fmtDate(h.createdAt)}</Text>
                        {h.description ? <Text style={[s.tlDesc, isDarkMode && { color: '#94a3b8' }]}>{h.description}</Text> : null}
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={s.emptyC}>
                  <MaterialCommunityIcons name="timeline-outline" size={48} color={isDarkMode ? '#334155' : COLORS.gray300} />
                  <Text style={[s.emptyT, isDarkMode && { color: '#64748b' }]}>Belum ada perubahan status</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'komentar' && (
            <View>
              {(report.comment || []).length === 0 ? (
                <View style={s.emptyC}>
                  <MaterialCommunityIcons name="chat-outline" size={48} color={isDarkMode ? '#334155' : COLORS.gray300} />
                  <Text style={[s.emptyT, isDarkMode && { color: '#64748b' }]}>Belum ada komentar</Text>
                </View>
              ) : (
                (report.comment || []).map((c: any, i: number) => {
                  const isAdmin = c.users?.role !== 'MASYARAKAT';
                  return (
                    <View key={i} style={[s.cmtCard, isDarkMode && s.darkCard, isAdmin && s.cmtAdmin, isAdmin && isDarkMode && { backgroundColor: '#1e293b' }]}>
                      <View style={s.cmtHead}>
                        <View style={[s.cmtAvatar, isAdmin && { backgroundColor: COLORS.primary }, isDarkMode && !isAdmin && { backgroundColor: '#0f172a' }]}>
                          <MaterialCommunityIcons name={isAdmin ? 'shield-check' : 'account'} size={18} color={isAdmin ? '#fff' : (isDarkMode ? '#64748b' : COLORS.gray500)} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.cmtName, isDarkMode && s.darkText]}>{c.users?.nama}</Text>
                          {isAdmin && <Text style={s.cmtRole}>Petugas</Text>}
                        </View>
                        <Text style={s.cmtTime}>{fmtTime(c.createdAt)}</Text>
                      </View>
                      <Text style={[s.cmtText, isDarkMode && { color: '#94a3b8' }]}>{c.isi}</Text>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </Animated.View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Comment Input Bar */}
      <View style={[s.inputBar, isDarkMode && s.darkHeader, { borderTopColor: isDarkMode ? '#334155' : '#f1f5f9' }]}>
        <View style={[s.inputAvatar, isDarkMode && { backgroundColor: '#0f172a' }]}>
          <MaterialCommunityIcons name="account" size={20} color={isDarkMode ? '#64748b' : COLORS.gray500} />
        </View>
        <RNTextInput
          style={[s.inputField, isDarkMode && { backgroundColor: '#0f172a', color: '#fff' }]}
          placeholder="Tulis komentar..."
          value={comment}
          onChangeText={setComment}
          multiline
          placeholderTextColor={isDarkMode ? '#475569' : COLORS.gray400}
        />
        <TouchableOpacity style={s.sendBtn} onPress={sendComment} disabled={sending}>
          <MaterialCommunityIcons name="send" size={20} color={sending ? COLORS.gray400 : '#fff'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroC: { width, height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12 },
  heroBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  thumbRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  thumb: { width: 65, height: 65, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: COLORS.primary },
  thumbImg: { width: '100%', height: '100%' },
  infoCard: { paddingHorizontal: 20, paddingTop: 20 },
  infoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  statusT: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  dateT: { fontSize: 12, color: COLORS.gray400 },
  reportTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black, lineHeight: 30, marginBottom: 12 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  chipOutline: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray200 },
  chipT: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginTop: 10, paddingHorizontal: 20 },
  tab: { paddingVertical: 14, marginRight: 24 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: COLORS.primary },
  tabT: { fontSize: 14, fontWeight: '600', color: COLORS.gray400 },
  tabTActive: { color: COLORS.primary, fontWeight: '700' },
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  secLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray700, marginBottom: 8 },
  descText: { fontSize: 14, color: COLORS.gray600, lineHeight: 22, marginBottom: 20 },
  locCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, backgroundColor: COLORS.primarySurface, borderRadius: 16 },
  locAddr: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  locSub: { fontSize: 13, color: COLORS.gray500, marginTop: 3 },
  mapContainer: { height: 250, borderRadius: 20, overflow: 'hidden', marginTop: 20 },
  coordsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, paddingHorizontal: 4 },
  coordsText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  tlItem: { flexDirection: 'row', minHeight: 80 },
  tlLeft: { width: 30, alignItems: 'center' },
  tlDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.gray200, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  tlLine: { width: 2, flex: 1, backgroundColor: COLORS.gray200, marginTop: -2 },
  tlRight: { flex: 1, paddingLeft: 14, paddingBottom: 20 },
  tlTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  tlDate: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  tlDesc: { fontSize: 13, color: COLORS.gray600, marginTop: 6, lineHeight: 19 },
  emptyC: { alignItems: 'center', paddingVertical: 40 },
  emptyT: { fontSize: 14, color: COLORS.gray400, marginTop: 10 },
  cmtCard: { padding: 14, borderRadius: 16, backgroundColor: '#f8fafc', marginBottom: 12 },
  cmtAdmin: { backgroundColor: COLORS.primarySurface, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  cmtHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cmtAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  cmtName: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  cmtRole: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  cmtTime: { fontSize: 11, color: COLORS.gray400 },
  cmtText: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 10, 
    paddingBottom: Platform.OS === 'ios' ? 28 : 20, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9', 
    backgroundColor: '#fff', 
    gap: 10 
  },
  inputAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  inputField: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  ratingCard: { backgroundColor: '#fff7ed', borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1, borderColor: '#fed7aa' },
  ratingTitle: { fontSize: 16, fontWeight: '700', color: '#9a3412', marginBottom: 4 },
  ratingSub: { fontSize: 13, color: '#c2410c', marginBottom: 15, lineHeight: 18 },
  stars: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  ratingDone: { fontSize: 12, fontWeight: '600', color: '#166534', marginTop: 10 },
  ratingCommentText: { fontSize: 14, fontStyle: 'italic', color: COLORS.gray600, marginTop: 5, marginBottom: 10, textAlign: 'center', paddingHorizontal: 10 },
  ratingInput: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#fed7aa', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, minHeight: 60, textAlignVertical: 'top', color: COLORS.black },
  ratingSubmitBtn: { backgroundColor: '#e056fd', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  ratingSubmitBtnT: { color: '#fff', fontWeight: '700', fontSize: 13 },
  exportCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 4,
  },
  exportSub: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    marginBottom: 15,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 1,
  },
  pdfBtn: {
    backgroundColor: '#dc2626',
  },
  pdfBtnT: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
  },
  shareBtnT: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  darkContainer: { backgroundColor: '#0f172a' },
  darkHeader: { backgroundColor: '#1e293b' },
  darkText: { color: '#f8fafc' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  resolutionCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  darkResolutionCard: {
    backgroundColor: '#022c22',
    borderColor: '#064e3b',
  },
  resolutionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  resolutionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  darkResolutionTitle: {
    color: '#34d399',
  },
  resolutionDesc: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 18,
    marginBottom: 12,
  },
  darkResolutionDesc: {
    color: '#a7f3d0',
  },
  resolutionImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 8,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flex: 1 },
  editBtn: { backgroundColor: COLORS.primary },
  deleteBtn: { backgroundColor: '#ef4444' },
  actionBtnT: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

export default ReportDetailScreen;
