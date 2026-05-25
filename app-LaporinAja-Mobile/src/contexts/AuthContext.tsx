// ============================================
// Auth Context - LaporinAja Mobile
// ============================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
  no_telp?: string;
  alamat?: string;
  pekerjaan?: string;
  foto_profil?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUserData: (newData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        connectSocket(storedToken);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const userData = response.data.data;
        const userToken = userData.token;

        if (userData.role !== 'MASYARAKAT') {
          return { success: false, message: 'Aplikasi ini hanya untuk Masyarakat.' };
        }

        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        connectSocket(userToken);

        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal terhubung ke server.',
      };
    }
  };

  const register = async (formData: any) => {
    try {
      const response = await api.post('/auth/register', formData);
      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Gagal mendaftar.' };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    disconnectSocket();
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  const updateUserData = async (newData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
