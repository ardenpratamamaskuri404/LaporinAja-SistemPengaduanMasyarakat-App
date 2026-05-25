import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (quiet = false) => {
    if (!user) return;
    try {
      if (!quiet) setIsLoading(true);
      const response = await api.get('/notifikasi');
      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter(n => !n.sudahDibaca).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [user]);

  // Socket.IO Integration
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification socket');
      });

      newSocket.on('notification:new', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('Notifikasi Baru', {
            body: notification.pesan,
            icon: '/logo.png'
          });
        }
      });

      newSocket.on('laporan:new', (laporan) => {
        // If user is admin/superadmin, show notification about new report
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          const msg = `Laporan baru masuk: ${laporan.judul}`;
          // We could fetch notifications again to get the server-side notification
          fetchNotifications(true);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, fetchNotifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifikasi/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, sudahDibaca: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifikasi/read/all');
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, sudahDibaca: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        socket
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
