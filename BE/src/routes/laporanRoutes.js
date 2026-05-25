const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { 
  createLaporan, 
  getLaporans, 
  getLaporanById, 
  updateLaporan,
  updateStatus, 
  deleteLaporan,
  assignLaporan,
  rateLaporan,
  getPublicStats,
  downloadLaporanPDF,
  exportLaporansPDF
} = require('../controllers/laporanController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public stats endpoint (no auth needed)
router.get('/stats/public', getPublicStats);

router.route('/')
  .get(authMiddleware, getLaporans)
  .post(authMiddleware, upload.array('foto', 3), createLaporan);

// Bulk operations MUST be above /:id routes
router.post('/bulk/delete', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false, message: 'Invalid IDs' });
  try {
    let whereClause = { id: { in: ids.map(id => parseInt(id)) } };
    if (req.user.role === 'ADMIN' && req.user.kota) {
      whereClause.OR = [
        { kota: req.user.kota },
        { kota: req.user.kota.toLowerCase() },
        { kota: req.user.kota.toUpperCase() }
      ];
    } else if (req.user.role === 'ADMIN') {
      whereClause.kota = 'UNASSIGNED_CITY';
    }
    await prisma.laporan.deleteMany({ where: whereClause });
    res.json({ success: true, message: 'Bulk delete success' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bulk/status', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { ids, status } = req.body;
  const changedBy = req.user.id;
  if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ success: false, message: 'Invalid input' });
  try {
    let whereClause = { id: { in: ids.map(id => parseInt(id)) } };
    if (req.user.role === 'ADMIN' && req.user.kota) {
      whereClause.OR = [
        { kota: req.user.kota },
        { kota: req.user.kota.toLowerCase() },
        { kota: req.user.kota.toUpperCase() }
      ];
    } else if (req.user.role === 'ADMIN') {
      whereClause.kota = 'UNASSIGNED_CITY';
    }

    const laporans = await prisma.laporan.findMany({
      where: whereClause
    });

    const updatePromises = laporans.map(lap => {
      return prisma.$transaction([
        prisma.laporan.update({
          where: { id: lap.id },
          data: { status }
        }),
        prisma.statushistory.create({
          data: {
            statusLama: lap.status,
            statusBaru: status,
            laporanId: lap.id,
            changedBy
          }
        }),
        prisma.notifikasi.create({
          data: {
            userId: lap.userId,
            laporanId: lap.id,
            pesan: `Status laporan Anda "${lap.judul}" telah diubah secara massal dari ${lap.status} menjadi ${status}.`
          }
        })
      ]);
    });

    const results = await Promise.all(updatePromises);

    if (req.io) {
      results.forEach(result => {
        const [updatedLap, , newNotif] = result;
        req.io.emit('laporan:updated', updatedLap);
        if (newNotif) {
          req.io.to(`user_${newNotif.userId}`).emit('notification:new', newNotif);
        }
      });
    }

    res.json({ success: true, message: 'Bulk status update success' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/:id')
  .get(authMiddleware, getLaporanById)
  .put(authMiddleware, upload.array('foto', 3), updateLaporan)
  .delete(authMiddleware, deleteLaporan);

router.put('/:id/status', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), upload.array('foto_selesai', 10), updateStatus);
router.put('/:id/assign', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), assignLaporan);
router.post('/:id/rating', authMiddleware, rateLaporan);
router.get('/:id/pdf', authMiddleware, downloadLaporanPDF);
router.get('/export/pdf', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), exportLaporansPDF);

module.exports = router;
