const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const getUsers = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.role === 'ADMIN') {
      if (req.user.kota) {
        where.OR = [
          { kota: req.user.kota },
          { kota: req.user.kota.toLowerCase() },
          { kota: req.user.kota.toUpperCase() }
        ];
      } else {
        where.kota = 'UNASSIGNED_CITY';
      }
    }

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telp: true,
        foto_profil: true,
        kota: true,
        createdAt: true,
      },
    });

    res.json({ success: true, message: 'Users fetched successfully', data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, role } = req.body;

    const user = await prisma.users.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    if (role) {
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MASYARAKAT'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role provided', data: null });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
        const existingEmail = await prisma.users.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh pengguna lain', data: null });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { 
        nama: nama || undefined,
        email: email || undefined,
        role: role || undefined 
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telp: true,
        createdAt: true
      }
    });

    res.json({ success: true, message: 'Informasi pengguna berhasil diperbarui', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    await prisma.users.delete({ where: { id: parseInt(id) } });
    
    res.json({ success: true, message: 'User deleted successfully', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email, no_telp, alamat, pekerjaan, provinsi, kota, deletePhoto } = req.body;
    
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    let foto = undefined;
    if (deletePhoto === 'true') {
      // If user wants to delete current photo
      if (user.foto_profil) {
        const filePath = path.join(__dirname, '../../', user.foto_profil);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      foto = null;
    } else if (req.file) {
      // If user uploaded a new photo
      if (user.foto_profil) {
        const oldFilePath = path.join(__dirname, '../../', user.foto_profil);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      foto = `/uploads/${req.file.filename}`;
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan', data: null });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        nama: nama || undefined,
        email: email || undefined,
        no_telp: no_telp || undefined,
        alamat: alamat || undefined,
        pekerjaan: pekerjaan || undefined,
        provinsi: provinsi || undefined,
        kota: kota || undefined,
        foto_profil: foto !== undefined ? foto : undefined
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telp: true,
        alamat: true,
        pekerjaan: true,
        provinsi: true,
        kota: true,
        foto_profil: true,
        createdAt: true
      }
    });

    await logActivity(userId, 'UPDATE_PROFILE', 'Memperbarui informasi profil');

    res.json({ success: true, message: 'Profil berhasil diperbarui', data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};


const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah', data: null });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await logActivity(userId, 'UPDATE_PASSWORD', 'Memperbarui kata sandi akun');

    res.json({ success: true, message: 'Password berhasil diperbarui', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await prisma.activitylog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, selesai, pending, proses] = await Promise.all([
      prisma.laporan.count({ where: { userId } }),
      prisma.laporan.count({ where: { userId, status: 'SELESAI' } }),
      prisma.laporan.count({ where: { userId, status: 'PENDING' } }),
      prisma.laporan.count({ where: { userId, status: 'PROSES' } })
    ]);
    res.json({ 
      success: true, 
      data: { 
        total, 
        selesai, 
        pending: pending + proses
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  updateUserInfo,
  deleteUser,
  updateProfile,
  updatePassword,
  getActivities,
  getStats
};
