// ============================================
// Settings Context - LaporinAja Mobile
// Managing Global Dark Mode and Language (ID/EN)
// ============================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  isDarkMode: boolean;
  language: 'id' | 'en';
  toggleDarkMode: () => void;
  setLanguage: (lang: 'id' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    home: 'Beranda',
    reports: 'Laporan',
    create: 'Buat',
    notif: 'Notif',
    profile: 'Profil',
    recent_reports: 'Laporan Terbaru',
    see_all: 'Lihat Semua',
    statistics: 'Statistik',
    quick_action: 'Aksi Cepat',
    settings: 'Pengaturan',
    edit_profile: 'Edit Profil',
    change_password: 'Ganti Kata Sandi',
    help_center: 'Pusat Bantuan',
    logout: 'Keluar',
    dark_mode: 'Mode Gelap',
    language: 'Bahasa',
  },
  en: {
    home: 'Home',
    reports: 'Reports',
    create: 'Create',
    notif: 'Notif',
    profile: 'Profile',
    recent_reports: 'Recent Reports',
    see_all: 'See All',
    statistics: 'Statistics',
    quick_action: 'Quick Actions',
    settings: 'Settings',
    edit_profile: 'Edit Profile',
    change_password: 'Change Password',
    help_center: 'Help Center',
    logout: 'Logout',
    dark_mode: 'Dark Mode',
    language: 'Language',
  }
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguageState] = useState<'id' | 'en'>('id');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      const lang = await AsyncStorage.getItem('language');
      if (theme) setIsDarkMode(theme === 'dark');
      if (lang) setLanguageState(lang as 'id' | 'en');
    } catch (e) { console.error(e); }
  };

  const toggleDarkMode = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const setLanguage = async (lang: 'id' | 'en') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ isDarkMode, language, toggleDarkMode, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
