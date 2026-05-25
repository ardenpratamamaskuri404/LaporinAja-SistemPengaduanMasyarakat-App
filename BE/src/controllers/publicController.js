const prisma = require('../config/database');

const getBantuan = async (req, res) => {
  try {
    const bantuan = await prisma.bantuan.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, message: 'Bantuan fetched successfully', data: bantuan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const getTentang = async (req, res) => {
  try {
    const tentang = await prisma.tentang.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, message: 'Tentang fetched successfully', data: tentang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

module.exports = {
  getBantuan,
  getTentang
};
