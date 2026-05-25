import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GuestRoute, ProtectedRoute } from './components/RouteGuard';
import { useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import BuatLaporanPage from './pages/BuatLaporanPage';
import LaporanSayaPage from './pages/LaporanSayaPage';
import DetailLaporanPage from './pages/DetailLaporanPage';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import BantuanPage from './pages/BantuanPage';
import StatistikPage from './pages/StatistikPage';
import TentangPage from './pages/TentangPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLaporan from './pages/AdminLaporan';
import AdminBuatLaporan from './pages/AdminBuatLaporan';
import AdminKategori from './pages/AdminKategori';
import AdminUser from './pages/AdminUser';
import AdminTambahUser from './pages/AdminTambahUser';
import AdminStatistik from './pages/AdminStatistik';
import AdminLog from './pages/AdminLog';
import AdminProfile from './pages/AdminProfile';
import AdminPengaturan from './pages/AdminPengaturan';
import AdminNotifikasi from './pages/AdminNotifikasi';
import AdminBantuan from './pages/AdminBantuan';

import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminLaporan from './pages/SuperAdminLaporan';
import SuperAdminKategori from './pages/SuperAdminKategori';
import SuperAdminUser from './pages/SuperAdminUser';
import SuperAdminTambahUser from './pages/SuperAdminTambahUser';
import SuperAdminStatistik from './pages/SuperAdminStatistik';
import SuperAdminConfig from './pages/SuperAdminConfig';
import SuperAdminLog from './pages/SuperAdminLog';
import SuperAdminNotifikasi from './pages/SuperAdminNotifikasi';
import SuperAdminProfile from './pages/SuperAdminProfile';
import SuperAdminPengaturan from './pages/SuperAdminPengaturan';
import SuperAdminBantuan from './pages/SuperAdminBantuan';

import NotFoundPage from './pages/NotFoundPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ScrollRevealManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const observeElements = () => {
      const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      revealElements.forEach(el => observer.observe(el));
      
      // Fallback: If after 2 seconds elements are still not active, force them (prevents white screen)
      setTimeout(() => {
        revealElements.forEach(el => {
          if (!el.classList.contains('active')) {
            el.classList.add('active');
          }
        });
      }, 2000);
    };

    observeElements();

    // Re-observe if DOM changes (useful for dynamic content)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ScrollToTop />
        <ScrollRevealManager />
        <AuthProvider>
          <NotificationProvider>
            <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/bantuan" element={<BantuanPage />} />
          <Route path="/statistik" element={<StatistikPage />} />
          <Route path="/tentang" element={<TentangPage />} />

          {/* Protected MASYARAKAT pages */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['MASYARAKAT']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/buat-laporan" element={<ProtectedRoute roles={['MASYARAKAT']}><BuatLaporanPage /></ProtectedRoute>} />
          <Route path="/laporan" element={<ProtectedRoute roles={['MASYARAKAT']}><LaporanSayaPage /></ProtectedRoute>} />
          <Route path="/laporan/:id" element={<ProtectedRoute roles={['MASYARAKAT', 'ADMIN', 'SUPER_ADMIN']}><DetailLaporanPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['MASYARAKAT']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifikasi" element={<ProtectedRoute roles={['MASYARAKAT']}><NotificationPage /></ProtectedRoute>} />

          {/* Admin pages */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/laporan" element={<ProtectedRoute roles={['ADMIN']}><AdminLaporan /></ProtectedRoute>} />
          <Route path="/admin/buat-laporan" element={<ProtectedRoute roles={['ADMIN']}><AdminBuatLaporan /></ProtectedRoute>} />
          <Route path="/admin/kategori" element={<ProtectedRoute roles={['ADMIN']}><AdminKategori /></ProtectedRoute>} />
          <Route path="/admin/user" element={<ProtectedRoute roles={['ADMIN']}><AdminUser /></ProtectedRoute>} />
          <Route path="/admin/user/tambah" element={<ProtectedRoute roles={['ADMIN']}><AdminTambahUser /></ProtectedRoute>} />
          <Route path="/admin/statistik" element={<ProtectedRoute roles={['ADMIN']}><AdminStatistik /></ProtectedRoute>} />
          <Route path="/admin/log" element={<ProtectedRoute roles={['ADMIN']}><AdminLog /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute roles={['ADMIN']}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/pengaturan" element={<ProtectedRoute roles={['ADMIN']}><AdminPengaturan /></ProtectedRoute>} />
          <Route path="/admin/notifikasi" element={<ProtectedRoute roles={['ADMIN']}><AdminNotifikasi /></ProtectedRoute>} />
          <Route path="/admin/bantuan" element={<ProtectedRoute roles={['ADMIN']}><AdminBantuan /></ProtectedRoute>} />

          {/* Super Admin specific pages */}
          <Route path="/superadmin/dashboard" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/laporan" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLaporan /></ProtectedRoute>} />
          <Route path="/superadmin/kategori" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminKategori /></ProtectedRoute>} />
          <Route path="/superadmin/user" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminUser /></ProtectedRoute>} />
          <Route path="/superadmin/user/tambah" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminTambahUser /></ProtectedRoute>} />
          <Route path="/superadmin/statistik" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminStatistik /></ProtectedRoute>} />
          <Route path="/superadmin/konfigurasi" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminConfig /></ProtectedRoute>} />
          <Route path="/superadmin/log" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLog /></ProtectedRoute>} />
          <Route path="/superadmin/notifikasi" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminNotifikasi /></ProtectedRoute>} />
          <Route path="/superadmin/profile" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminProfile /></ProtectedRoute>} />
          <Route path="/superadmin/pengaturan" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminPengaturan /></ProtectedRoute>} />
          <Route path="/superadmin/bantuan" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminBantuan /></ProtectedRoute>} />

          {/* Guest-only pages */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/lupa-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </NotificationProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
