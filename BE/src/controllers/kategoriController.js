const prisma = require('../config/database');

const jwt = require('jsonwebtoken');

const getKategori = async (req, res) => {
  try {
    const kategoris = await prisma.kategori.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const laporanCounts = await prisma.laporan.groupBy({
      by: ['kategori'],
      _count: {
        id: true
      }
    });

    const countMap = {};
    laporanCounts.forEach(item => {
      countMap[item.kategori] = item._count.id;
    });

    const kategorisWithCount = kategoris.map(kat => ({
      ...kat,
      count: countMap[kat.nama] || 0
    }));

    res.json({ success: true, data: kategorisWithCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createKategori = async (req, res) => {
  try {
    const { nama, warna, icon, deskripsi } = req.body;
    const slug = nama.toLowerCase().replace(/ /g, '-');
    const kategori = await prisma.kategori.create({
      data: { nama, slug, warna, icon, deskripsi }
    });
    res.status(201).json({ success: true, message: 'Kategori created', data: kategori });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, warna, icon, deskripsi } = req.body;
    const slug = nama ? nama.toLowerCase().replace(/ /g, '-') : undefined;
    const kategori = await prisma.kategori.update({
      where: { id: parseInt(id) },
      data: { nama, slug, warna, icon, deskripsi }
    });
    res.json({ success: true, message: 'Kategori updated', data: kategori });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kategori.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Kategori deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getKategori,
  createKategori,
  updateKategori,
  deleteKategori
};
