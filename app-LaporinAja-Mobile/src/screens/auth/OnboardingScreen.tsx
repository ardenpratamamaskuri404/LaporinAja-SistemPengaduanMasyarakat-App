import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Laporkan Masalah', desc: 'Foto dan laporkan masalah di sekitarmu dengan mudah.', icon: require('../../../assets/onboarding_1.png') },
  { id: '2', title: 'Pantau Progress', desc: 'Lacak status laporanmu dari pending sampai selesai.', icon: require('../../../assets/onboarding_2.png') },
  { id: '3', title: 'Diskusi Langsung', desc: 'Berkomunikasi dengan petugas terkait laporanmu.', icon: require('../../../assets/onboarding_3.png') },
];

import AsyncStorage from '@react-native-async-storage/async-storage';

const SlideItem = ({ item }: { item: any }) => {
  const { isDarkMode, t } = useSettings();

  return (
    <View style={s.slide}>
      <Image source={item.icon} style={s.img} />
      <Text style={[s.title, isDarkMode && s.darkText]}>
        {t(item.title)}
      </Text>
      <Text style={[s.desc, isDarkMode && { color: '#94a3b8' }]}>
        {t(item.desc)}
      </Text>
    </View>
  );
};

const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const { isDarkMode, t } = useSettings();
  const flatListRef = useRef<FlatList>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  const startAutoScroll = () => {
    autoScrollInterval.current = setInterval(() => {
      setIndex(prev => {
        const nextIndex = (prev + 1) % SLIDES.length;
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          } catch (err) {
            console.warn('Auto scroll error:', err);
          }
        }, 50);
        return nextIndex;
      });
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const handleScrollBegin = () => {
    stopAutoScroll();
  };

  const handleScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
    startAutoScroll();
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index);
    }
  });

  return (
    <View style={[s.container, isDarkMode && s.darkContainer]}>
      {index > 0 && (
        <TouchableOpacity style={s.absBackBtn} onPress={() => {
          const newIndex = index - 1;
          setIndex(newIndex);
          try {
            flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
          } catch (err) {
            console.warn('Back button scroll error:', err);
          }
        }}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={isDarkMode ? "#fff" : COLORS.black} />
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged.current}
        getItemLayout={(data, idx) => ({
          length: width,
          offset: width * idx,
          index: idx,
        })}
        renderItem={({ item }) => (
          <SlideItem item={item} />
        )}
      />
      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => <View key={i} style={[s.dot, index === i && s.dotActive]} />)}
        </View>
        <TouchableOpacity style={s.btn} onPress={async () => {
          stopAutoScroll();
          try {
            await AsyncStorage.setItem('hasLaunched', 'true');
          } catch (e) {
            console.error(e);
          }
          navigation.navigate('Login');
        }}>
          <Text style={s.btnT}>{index === 2 ? t('Mulai Sekarang') : t('Lewati')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#0f172a' },
  absBackBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 45, height: 45, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  slide: { width, padding: 40, alignItems: 'center', justifyContent: 'center' },
  img: { width: 300, height: 300, marginBottom: 40, borderRadius: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black, marginBottom: 15, textAlign: 'center' },
  darkText: { color: '#f8fafc' },
  desc: { fontSize: 15, color: COLORS.gray500, textAlign: 'center', lineHeight: 24 },
  footer: { padding: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15 },
  btnT: { color: '#fff', fontWeight: '700' },
});

export default OnboardingScreen;
