// ============================================
// Theme Constants - LaporinAja Mobile
// ============================================

export const COLORS = {
  primary: '#2d5a1e',     // Web green color
  primaryDark: '#1e3f14', // Web dark hover green color
  primaryLight: '#9fcb98', // Requested logo icon color
  primarySurface: '#f1f8f1',
  backgroundGreen: '#9fcb98',

  accent: '#e0b40d',
  accentLight: '#fef9e7',

  white: '#ffffff',
  black: '#1a1a1a',
  
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',

  danger: '#d32f2f',
  dangerLight: '#fdecea',
  warning: '#ed6c02',
  warningLight: '#fff4e5',
  success: '#2e7d32',
  successLight: '#edf7ed',
  info: '#0288d1',
  infoLight: '#e1f5fe',

  pending: '#f59e0b',
  proses: '#4caf50', // Matching green for proses
  selesai: '#2e7d32',
  ditolak: '#d32f2f',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  radius: 12,
  radiusSm: 8,
  radiusLg: 16,
  radiusXl: 24,

  padding: 16,
  paddingSm: 12,
  paddingLg: 20,
  paddingXl: 24,
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: 'Pending', color: '#f97316', bg: '#fff7ed', icon: 'clock-outline' },
  PROSES: { label: 'Sedang Diproses', color: '#4a7c44', bg: '#eef5ee', icon: 'progress-wrench' },
  SELESAI: { label: 'Selesai', color: '#16a34a', bg: '#f0fdf4', icon: 'check-circle-outline' },
  DITOLAK: { label: 'Ditolak', color: '#dc2626', bg: '#fef2f2', icon: 'close-circle-outline' },
};

export const URGENCY_CONFIG: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  'Mendesak': { 
    label: 'Mendesak', 
    desc: 'Membutuhkan penanganan segera.',
    color: '#dc2626', 
    bg: '#fef2f2' 
  },
  'Sedang': { 
    label: 'Sedang', 
    desc: 'Perlu ditangani dalam waktu dekat.',
    color: '#f97316', 
    bg: '#fff7ed' 
  },
  'Normal': { 
    label: 'Normal', 
    desc: 'Masalah rutin.',
    color: '#4a7c44', 
    bg: '#f1f8f1' 
  },
};
