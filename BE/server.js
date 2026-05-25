require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { verifyToken } = require('./src/utils/jwt');
const prisma = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const laporanRoutes = require('./src/routes/laporanRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const userRoutes = require('./src/routes/userRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const kategoriRoutes = require('./src/routes/kategoriRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');
const activityLogRoutes = require('./src/routes/activityLogRoutes');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Middleware to inject io into req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, nama: true, email: true, role: true }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.nama} (${socket.id})`);
  
  // Join user-specific room for private notifications
  socket.join(`user_${socket.user.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.nama} (${socket.id})`);
  });
});

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifikasi', notificationRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/statistik', statisticsRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/config', configRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Sistem Pelaporan Pengaduan Masyarakat API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' 
      ? 'Ukuran file terlalu besar! Maksimal ukuran file yang diperbolehkan adalah 20MB.' 
      : `Error unggah file: ${err.message}`;
    return res.status(400).json({ success: false, message: msg, data: null });
  }

  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using this port or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
