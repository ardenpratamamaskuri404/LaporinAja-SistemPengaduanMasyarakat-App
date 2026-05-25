const prisma = require('../config/database');

const getComments = async (req, res) => {
  try {
    const { laporanId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { laporanId: parseInt(laporanId) },
      include: {
        users: { select: { id: true, nama: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, message: 'Comments fetched successfully', data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const addComment = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const { isi } = req.body;
    const userId = req.user.id;

    if (!isi) {
      return res.status(400).json({ success: false, message: 'Isi komentar cannot be empty', data: null });
    }

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(laporanId) } });
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    // Use transaction to create comment and notify relevant users
    const [comment, notifications] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          isi,
          userId,
          laporanId: parseInt(laporanId)
        },
        include: {
          users: { select: { id: true, nama: true, role: true } },
          laporan: { select: { id: true, judul: true, userId: true, adminId: true, kota: true } }
        }
      });

      const notifyUserIds = new Set();
      
      // 1. Report Owner (Masyarakat)
      if (laporan.userId !== userId) {
        notifyUserIds.add(laporan.userId);
      }
      
      // 2. Regional Admins
      const regionalAdmins = await tx.users.findMany({
        where: { role: 'ADMIN', kota: laporan.kota },
        select: { id: true }
      });
      regionalAdmins.forEach(ra => {
        if (ra.id !== userId) notifyUserIds.add(ra.id);
      });
      
      // 3. Super Admins (Always stay updated)
      const superAdmins = await tx.users.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true }
      });
      superAdmins.forEach(sa => {
        if (sa.id !== userId) notifyUserIds.add(sa.id);
      });

      const createdNotifications = await Promise.all(
        Array.from(notifyUserIds).map(targetId => {
          const rolePrefix = req.user.role === 'MASYARAKAT' ? '' : 'Petugas ';
          return tx.notifikasi.create({
            data: {
              userId: targetId,
              laporanId: parseInt(laporanId),
              pesan: `${rolePrefix}${req.user.nama} memberikan komentar pada laporan: "${laporan.judul}"`
            }
          });
        })
      );

      return [newComment, createdNotifications];
    });

    if (req.io) {
      req.io.emit('comment:new', comment);
      notifications.forEach(notification => {
        req.io.to(`user_${notification.userId}`).emit('notification:new', notification);
      });
    }

    res.status(201).json({ success: true, message: 'Comment added successfully', data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

module.exports = {
  getComments,
  addComment
};
