// ============================================
// Navigation - LaporinAja Mobile
// Design: Premium bottom tab bar with raised 
// central (+) button as per mockups.
// ============================================
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import CreateReportScreen from '../screens/main/CreateReportScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import HelpCenterScreen from '../screens/main/HelpCenterScreen';
import StatisticsScreen from '../screens/main/StatisticsScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Center Button
const CustomTabBarButton = ({ children, onPress, isDarkMode }: any) => (
  <TouchableOpacity
    style={s.customBtnWrapper}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={s.customBtn}>
      {children}
    </View>
    <Text style={[s.customBtnLabel, isDarkMode && { color: '#94a3b8' }]}>Buat</Text>
  </TouchableOpacity>
);

const TabNavigator = () => {
  const { isDarkMode } = useSettings();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [s.tabBar, isDarkMode && s.darkTabBar],
        tabBarActiveTintColor: isDarkMode ? COLORS.primaryLight : COLORS.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: s.tabLabel,
      }}
    >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Beranda',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-outline" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="ReportsTab"
      component={MyReportsScreen}
      options={{
        tabBarLabel: 'Laporan',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-outline" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="CreateReportTab"
      component={View} // Dummy
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.navigate('CreateReport');
        },
      })}
      options={{
        tabBarLabel: '',
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} isDarkMode={isDarkMode}>
            <MaterialCommunityIcons name="plus" size={32} color="#fff" />
          </CustomTabBarButton>
        ),
      }}
    />
    <Tab.Screen
      name="NotifTab"
      component={NotificationsScreen}
      options={{
        tabBarLabel: 'Notif',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bell-outline" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-outline" size={24} color={color} />,
      }}
    />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  darkTabBar: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -5,
  },
  customBtnWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  customBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#99c399', // Matching the mockup green color
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4a7c44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  customBtnLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 4,
  }
});

import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

export const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

import EditReportScreen from '../screens/main/EditReportScreen';

export const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="CreateReport" component={CreateReportScreen} />
    <Stack.Screen name="EditReport" component={EditReportScreen} />
    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    <Stack.Screen name="MyReports" component={MyReportsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
    <Stack.Screen name="Statistics" component={StatisticsScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);
