const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken, verifyToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { nama, email, password, no_telp, provinsi, kota, agree_terms, role } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields', data: null });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists', data: null });
    }

    let finalRole = 'MASYARAKAT';
    if (role && role !== 'MASYARAKAT') {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded && decoded.role === 'SUPER_ADMIN') {
          finalRole = role;
        } else {
          return res.status(403).json({ success: false, message: 'Only Super Admin can assign roles other than MASYARAKAT', data: null });
        }
      } else {
        return res.status(403).json({ success: false, message: 'Only Super Admin can assign roles other than MASYARAKAT', data: null });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.users.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        no_telp: no_telp || null,
        provinsi: provinsi || null,
        kota: kota || null,
        agree_terms: agree_terms === true || agree_terms === 'true',
        role: finalRole,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telp: true,
        provinsi: true,
        kota: true,
        alamat: true,
        pekerjaan: true,
        createdAt: true,
      }
    });

    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password', data: null });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        no_telp: user.no_telp,
        provinsi: user.provinsi,
        kota: user.kota,
        alamat: user.alamat,
        pekerjaan: user.pekerjaan,
        foto_profil: user.foto_profil,
        createdAt: user.createdAt,
        token,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const logout = async (req, res) => {
  // Since we are using JWT, the client should discard the token.
  // This endpoint is provided for completeness.
  res.json({ success: true, message: 'Logout successful', data: null });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required', data: null });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      // For security, still return success even if user not found
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.', data: null });
    }

    // In a real app, you would send an email with a reset link.
    // For now, we just confirm the email exists.
    res.json({ success: true, message: 'If the email exists, a reset link has been sent.', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword
};
