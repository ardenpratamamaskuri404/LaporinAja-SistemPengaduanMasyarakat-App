import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import { AuthStack, MainStack } from './src/navigation/AppNavigator';
import SplashScreenCustom from './src/screens/auth/SplashScreen';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4a7c44',
    secondary: '#365c32',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#dc2626',
  },
  roundness: 12,
};

const darkTheme = {
  ...MD3LightTheme,
  dark: true,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#99c399',
    secondary: '#4a7c44',
    background: '#0f172a',
    surface: '#1e293b',
    error: '#ef4444',
    text: '#f8fafc',
    outline: '#334155',
  },
  roundness: 12,
};

import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const AppNavigation = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isDarkMode } = useSettings();

  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: isDarkMode ? '#99c399' : '#4a7c44',
      background: isDarkMode ? '#0f172a' : '#ffffff',
      card: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#f8fafc' : '#1e293b',
      border: isDarkMode ? '#334155' : '#f1f5f9',
    },
  };

  if (loading) {
    return (
      <View style={[s.loadC, isDarkMode && { backgroundColor: '#0f172a' }]}>
        <ActivityIndicator size="large" color="#4a7c44" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const Main = () => {
  const { isDarkMode } = useSettings();
  return (
    <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </PaperProvider>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        {showSplash ? (
          <SplashScreenCustom onFinish={() => setShowSplash(false)} />
        ) : (
          <Main />
        )}
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  loadC: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
