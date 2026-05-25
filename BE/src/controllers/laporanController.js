const prisma = require('../config/database');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../utils/logger');
const { normalizeKota } = require('../utils/locationNormalizer');

const createLaporan = async (req, res) => {
  try {
    const { judul, deskripsi, kategori, urgensi, latitude, longitude, alamat, kelurahan, kecamatan, kota, tanggal_kejadian, riwayat, jenis_laporan, nama_pelapor_offline } = req.body;
    const userId = req.user.id;
    
    if (!judul || !deskripsi || !kategori) {
      return res.status(400).json({ success: false, message: 'Judul, deskripsi, and kategori are required', data: null });
    }

    const normalizedCity = normalizeKota(kota, kecamatan, alamat);

    const laporan = await prisma.laporan.create({
      data: {
        judul,
        deskripsi,
        kategori,
        urgensi: urgensi || 'Sedang',
        userId,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        alamat: alamat || null,
        kelurahan: kelurahan || null,
        kecamatan: kecamatan || null,
        kota: normalizedCity,
        tanggal_kejadian: tanggal_kejadian ? new Date(tanggal_kejadian) : null,
        riwayat: riwayat || 'Tidak',
        jenis_laporan: jenis_laporan || 'PUBLIK',
        nama_pelapor_offline: nama_pelapor_offline || null,
        fotos: {
          create: req.files ? req.files.map(file => ({ url: `/uploads/${file.filename}` })) : []
        }
      },
      include: {
          user: { select: { id: true, nama: true, email: true } },
        fotos: true
      }
    });

    // 1. Create initial notification for the reporter
    const userNotification = await prisma.notifikasi.create({
      data: {
        userId,
        laporanId: laporan.id,
        pesan: `Laporan Anda "${judul}" telah berhasil dibuat dan sedang menunggu verifikasi.`
      }
    });

    // 2. Notify all Super Admins and Admins in the same city about the new report
    const administrativeUsers = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          ...(kota ? [{ role: 'ADMIN', kota }] : [])
        ]
      },
      select: { id: true }
    });

    const adminNotifications = await Promise.all(
      administrativeUsers.map(admin => 
        prisma.notifikasi.create({
          data: {
            userId: admin.id,
            laporanId: laporan.id,
            pesan: `Laporan baru masuk: "${judul}" dari ${req.user.nama}.`
          }
        })
      )
    );

    await logActivity(userId, 'CREATE_LAPORAN', `Membuat laporan baru: ${judul}`);

    if (req.io) {
      req.io.emit('laporan:new', laporan);
      
      // Emit notification to the reporter
      req.io.to(`user_${userId}`).emit('notification:new', userNotification);
      
      // Emit notification to all admins
      adminNotifications.forEach(notif => {
        req.io.to(`user_${notif.userId}`).emit('notification:new', notif);
      });
    }

    res.status(201).json({ success: true, message: 'Laporan created successfully', data: laporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};


const getLaporans = async (req, res) => {
  try {
    const { status, userId, kategori, urgensi, search, page, limit } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (req.user && req.user.role === 'MASYARAKAT') {
      where.userId = req.user.id;
    } else if (req.user && req.user.role === 'ADMIN') {
      if (req.user.kota) {
        where.OR = [
          { kota: req.user.kota },
          { kota: req.user.kota.toLowerCase() },
          { kota: req.user.kota.toUpperCase() }
        ];
      } else {
        where.kota = 'UNASSIGNED_CITY'; // Prevent seeing all reports if kota is missing
      }
      if (userId) {
        where.userId = parseInt(userId);
      }
    } else if (userId) {
      where.userId = parseInt(userId);
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (search) {
      where.OR = where.OR || [];
      where.OR.push(
        { judul: { contains: search } },
        { deskripsi: { contains: search } },
        { alamat: { contains: search } },
        { kota: { contains: search } }
      );
    }

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const skip = (pageNum - 1) * pageSize;

    const [laporans, total] = await Promise.all([
      prisma.laporan.findMany({
        where,
        include: {
          user: { select: { id: true, nama: true, email: true } },
          assignedAdmin: { select: { id: true, nama: true } },
          rating: { select: { id: true, nilai: true } },
          fotos: true,
          fotosSelesai: true
        },

        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.laporan.count({ where })
    ]);

    res.json({ 
      success: true, 
      message: 'Laporans fetched successfully', 
      data: laporans,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporan.findUnique({
      where: { id: parseInt(id) },
      include: {
          user: { select: { id: true, nama: true, email: true, role: true } },
        fotos: true,
        fotosSelesai: true,
        comment: {

          include: {
          users: { select: { id: true, nama: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        statushistory: {
          include: {
          users: { select: { id: true, nama: true, role: true, kota: true } } },
          orderBy: { createdAt: 'desc' }
        },
        rating: true,
        assignedAdmin: { select: { id: true, nama: true } }
      }
    });

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    if (req.user && req.user.role === 'MASYARAKAT' && laporan.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this report', data: null });
    }

    if (req.user && req.user.role === 'ADMIN' && req.user.kota) {
      const laporanCheck = await prisma.laporan.findFirst({
        where: { 
          id: parseInt(id),
          OR: [
            { kota: req.user.kota },
            { kota: req.user.kota.toLowerCase() },
            { kota: req.user.kota.toUpperCase() }
          ]
        }
      });
      if (!laporanCheck) {
        return res.status(403).json({ success: false, message: 'Access denied: This report is outside your jurisdiction', data: null });
      }
    }

    res.json({ success: true, message: 'Laporan fetched successfully', data: laporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const updateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { judul, deskripsi, kategori, urgensi, alamat, kelurahan, kecamatan, kota, latitude, longitude, deletedFotos } = req.body;

    const laporan = await prisma.laporan.findUnique({ 
      where: { id: parseInt(id) },
      include: { fotos: true }
    });
    
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    // Only the owner or admin can edit
    if (laporan.userId !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied', data: null });
    }

    if (req.user.role === 'ADMIN' && req.user.kota && (!laporan.kota || laporan.kota.toLowerCase() !== req.user.kota.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit reports in your city', data: null });
    }

    // Only allow editing if status is PENDING
    if (laporan.status !== 'PENDING' && req.user.role === 'MASYARAKAT') {
      return res.status(400).json({ success: false, message: 'Hanya laporan dengan status PENDING yang bisa diedit', data: null });
    }

    // Handle photo deletion
    if (deletedFotos) {
      const idsToDelete = JSON.parse(deletedFotos);
      for (const photoId of idsToDelete) {
        const photo = laporan.fotos.find(f => f.id === photoId);
        if (photo) {
          const filePath = path.join(__dirname, '../../', photo.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await prisma.laporanfoto.delete({ where: { id: photoId } });
        }
      }
    }

    let finalKota = laporan.kota;
    if (kota !== undefined || kecamatan !== undefined || alamat !== undefined) {
      const activeKota = kota !== undefined ? kota : laporan.kota;
      const activeKecamatan = kecamatan !== undefined ? kecamatan : laporan.kecamatan;
      const activeAlamat = alamat !== undefined ? alamat : laporan.alamat;
      finalKota = normalizeKota(activeKota, activeKecamatan, activeAlamat);
    }

    const updatedLaporan = await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: {
        judul: judul || laporan.judul,
        deskripsi: deskripsi || laporan.deskripsi,
        kategori: kategori || laporan.kategori,
        urgensi: urgensi || laporan.urgensi,
        alamat: alamat !== undefined ? alamat : laporan.alamat,
        kelurahan: kelurahan !== undefined ? kelurahan : laporan.kelurahan,
        kecamatan: kecamatan !== undefined ? kecamatan : laporan.kecamatan,
        kota: finalKota,
        latitude: latitude ? parseFloat(latitude) : laporan.latitude,
        longitude: longitude ? parseFloat(longitude) : laporan.longitude,
        fotos: {
          create: req.files ? req.files.map(file => ({ url: `/uploads/${file.filename}` })) : []
        }
      },
      include: {
          user: { select: { id: true, nama: true, email: true } },
        fotos: true
      }
    });

    await logActivity(userId, 'UPDATE_LAPORAN', `Memperbarui laporan: ${updatedLaporan.judul}`);

    if (req.io) {
      req.io.emit('laporan:updated', updatedLaporan);
    }

    res.json({ success: true, message: 'Laporan updated successfully', data: updatedLaporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};


const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan_selesai } = req.body;

    const changedBy = req.user.id;

    const validStatuses = ['PENDING', 'PROSES', 'SELESAI', 'DITOLAK'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided', data: null });
    }

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(id) } });
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    if (req.user.role === 'ADMIN' && req.user.kota && (!laporan.kota || laporan.kota.toLowerCase() !== req.user.kota.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only update reports in your city', data: null });
    }

    const oldStatus = laporan.status;

    // Use transaction to update status, create history, and notify
    const [updatedLaporan, history, notification] = await prisma.$transaction([
      prisma.laporan.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          ...(status === 'SELESAI' && {
            keterangan_selesai: keterangan_selesai || null,
            fotosSelesai: {
              create: req.files ? req.files.map(file => ({ url: `/uploads/${file.filename}` })) : []
            }
          })
        },
        include: {
          user: { select: { id: true, nama: true } },
          fotosSelesai: true
        }
      }),
      prisma.statushistory.create({
        data: {
          statusLama: oldStatus,
          statusBaru: status,
          laporanId: parseInt(id),
          changedBy
        }
      }),
      prisma.notifikasi.create({
        data: {
          userId: laporan.userId,
          laporanId: parseInt(id),
          pesan: `Status laporan Anda "${laporan.judul}" telah diperbarui menjadi ${status}.`
        }
      })
    ]);

    if (req.io) {
      req.io.emit('laporan:updated', updatedLaporan);
      req.io.to(`user_${laporan.userId}`).emit('notification:new', notification);
    }

    await logActivity(changedBy, 'UPDATE_STATUS', `Mengubah status laporan #${id} menjadi ${status}`);

    res.json({ success: true, message: 'Status updated successfully', data: updatedLaporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};


const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(id) } });
    
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    if (laporan.userId !== userId && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete your own reports', data: null });
    }

    if (role === 'ADMIN' && req.user.kota && (!laporan.kota || laporan.kota.toLowerCase() !== req.user.kota.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete reports in your city', data: null });
    }

    await prisma.laporan.delete({ where: { id: parseInt(id) } });

    await logActivity(userId, 'DELETE_LAPORAN', `Menghapus laporan #${id}`);

    res.json({ success: true, message: 'Laporan deleted successfully', data: null });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const assignLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ success: false, message: 'Admin ID is required', data: null });
    }

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(id) } });
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    if (req.user.role === 'ADMIN' && req.user.kota && (!laporan.kota || laporan.kota.toLowerCase() !== req.user.kota.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only assign reports in your city', data: null });
    }

    const updatedLaporan = await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: { 
        adminId: parseInt(adminId),
        status: 'PROSES' // Automatically change status to PROSES when assigned
      },
      include: {
          user: { select: { id: true, nama: true } },
        assignedAdmin: { select: { id: true, nama: true } }
      }
    });

    // Create status history
    await prisma.statushistory.create({
      data: {
        statusLama: laporan.status,
        statusBaru: 'PROSES',
        laporanId: parseInt(id),
        changedBy: req.user.id
      }
    });

    // Notify the user
    const userNotification = await prisma.notifikasi.create({
      data: {
        userId: laporan.userId,
        laporanId: parseInt(id),
        pesan: `Laporan Anda "${laporan.judul}" telah ditugaskan ke Admin dan sedang diproses.`
      }
    });

    // Notify the assigned Admin
    const adminNotification = await prisma.notifikasi.create({
      data: {
        userId: parseInt(adminId),
        laporanId: parseInt(id),
        pesan: `Anda telah ditugaskan untuk menangani laporan: "${laporan.judul}".`
      }
    });

    if (req.io) {
      req.io.emit('laporan:updated', updatedLaporan);
      req.io.to(`user_${laporan.userId}`).emit('notification:new', userNotification);
      req.io.to(`user_${parseInt(adminId)}`).emit('notification:new', adminNotification);
    }

    await logActivity(req.user.id, 'ASSIGN_LAPORAN', `Menugaskan laporan #${id} ke Admin #${adminId}`);

    res.json({ success: true, message: 'Laporan assigned successfully', data: updatedLaporan });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const rateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nilai, komentar } = req.body;
    const userId = req.user.id;

    if (!nilai || nilai < 1 || nilai > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1-5', data: null });
    }

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(id) } });
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    if (laporan.status !== 'SELESAI') {
      return res.status(400).json({ success: false, message: 'Rating only available for completed reports', data: null });
    }

    if (laporan.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the reporter can rate', data: null });
    }

    // Check if already rated
    const existing = await prisma.rating.findUnique({ where: { laporanId: parseInt(id) } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already rated this report', data: null });
    }

    const rating = await prisma.rating.create({
      data: {
        nilai: parseInt(nilai),
        komentar: komentar || null,
        userId,
        laporanId: parseInt(id)
      }
    });

    await logActivity(userId, 'RATE_LAPORAN', `Memberi rating ${nilai} pada laporan #${id}`);

    res.status(201).json({ success: true, message: 'Rating submitted successfully', data: rating });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const getPublicStats = async (req, res) => {
  try {
    const [totalLaporan, totalSelesai, totalUsers, laporans] = await Promise.all([
      prisma.laporan.count(),
      prisma.laporan.count({ where: { status: 'SELESAI' } }),
      prisma.users.count({ where: { role: 'MASYARAKAT' } }),
      prisma.laporan.findMany({
        select: {
          kategori: true,
          status: true,
          kota: true,
          latitude: true,
          longitude: true,
          createdAt: true,
        }
      })
    ]);

    // Calculate category distribution
    const categoryMap = {};
    laporans.forEach(l => {
      const catName = l.kategori || 'Lainnya';
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
    });

    // Calculate geographic distribution
    const geoMap = {};
    laporans.forEach(l => {
      if (l.kota) {
        if (!geoMap[l.kota]) {
          geoMap[l.kota] = { count: 0, lat: l.latitude ? parseFloat(l.latitude) : null, lng: l.longitude ? parseFloat(l.longitude) : null };
        }
        geoMap[l.kota].count++;
      }
    });

    // Calculate status distribution
    const statusMap = {};
    laporans.forEach(l => {
      statusMap[l.status] = (statusMap[l.status] || 0) + 1;
    });

    const selesaiPct = totalLaporan > 0 ? Math.round((totalSelesai / totalLaporan) * 100) : 0;

    res.json({
      success: true,
      message: 'Public stats fetched',
      data: {
        totalLaporan,
        totalSelesai,
        selesaiPct,
        totalUsers,
        categories: categoryMap,
        geographic: geoMap,
        statuses: statusMap,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const downloadLaporanPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporan.findUnique({
      where: { id: parseInt(id) },
      include: {
          user: { select: { id: true, nama: true, email: true } },
        assignedAdmin: { select: { id: true, nama: true } },
        statushistory: true,
        rating: true
      }
    });

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan not found', data: null });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Laporan-${laporan.id}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(25).text('LaporinAja - Ringkasan Laporan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Dicetak pada: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);

    // Report Details
    doc.fontSize(16).text('Informasi Laporan', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`ID Laporan: #LPR-${laporan.createdAt.getFullYear()}-${laporan.id.toString().padStart(3, '0')}`);
    doc.text(`Judul: ${laporan.judul}`);
    doc.text(`Kategori: ${laporan.kategori || '-'}`);
    doc.text(`Status: ${laporan.status}`);
    doc.text(`Urgensi: ${laporan.urgensi}`);
    doc.text(`Tanggal Lapor: ${laporan.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Deskripsi:');
    doc.fontSize(12).text(laporan.deskripsi, { align: 'justify' });
    doc.moveDown();

    doc.fontSize(14).text('Lokasi:');
    doc.fontSize(12).text(laporan.alamat || 'Tidak disebutkan');
    doc.text(`Kota: ${laporan.kota || '-'}`);
    doc.text(`Koordinat: ${laporan.latitude || '-'}, ${laporan.longitude || '-'}`);
    doc.moveDown();

    // User Info
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(16).text('Informasi Pelapor', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Nama: ${laporan.user.nama}`);
    doc.text(`Email: ${laporan.user.email}`);
    doc.moveDown(2);

    // Admin Info
    if (laporan.assignedAdmin) {
      doc.fontSize(16).text('Petugas Penanggung Jawab', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Nama: ${laporan.assignedAdmin.nama}`);
      doc.moveDown(2);
    }

    // Rating
    if (laporan.rating) {
      doc.fontSize(16).text('Penilaian Pelapor', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Nilai: ${laporan.rating.nilai} / 5`);
      doc.text(`Komentar: ${laporan.rating.komentar || '-'}`);
      doc.moveDown(2);
    }

    // Footer
    doc.fontSize(10).text('Terima kasih telah menggunakan LaporinAja untuk mewujudkan perubahan yang lebih baik.', {
      align: 'center',
      bottom: 50
    });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const exportLaporansPDF = async (req, res) => {
  try {
    const { status, kategori, startDate, endDate, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (req.user && req.user.role === 'ADMIN' && req.user.kota) {
      where.kota = req.user.kota;
    }

    if (search) {
      where.OR = [
        { judul: { contains: search } },
        { deskripsi: { contains: search } },
        { alamat: { contains: search } },
        { kota: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const laporans = await prisma.laporan.findMany({
      where,
      include: {
          user: { select: { id: true, nama: true, email: true } },
        assignedAdmin: { select: { id: true, nama: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const filename = `Laporan-Export-${new Date().getTime()}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('LaporinAja - Daftar Laporan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9).text(`Dicetak pada: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(800, doc.y).stroke();
    doc.moveDown();

    // Filter info
    const filterInfo = [];
    if (status) filterInfo.push(`Status: ${status}`);
    if (kategori) filterInfo.push(`Kategori: ${kategori}`);
    if (startDate || endDate) {
      filterInfo.push(`Tanggal: ${startDate || '-'} s/d ${endDate || '-'}`);
    }
    if (search) filterInfo.push(`Pencarian: ${search}`);

    if (filterInfo.length > 0) {
      doc.fontSize(9).text(`Filter: ${filterInfo.join(' | ')}`);
      doc.moveDown();
    }

    // Table header
    const tableTop = doc.y;
    const col1 = 40;
    const col2 = 100;
    const col3 = 200;
    const col4 = 320;
    const col5 = 420;
    const col6 = 500;
    const col7 = 600;
    const col8 = 700;

    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('ID', col1, tableTop);
    doc.text('Judul', col2, tableTop);
    doc.text('Pelapor', col3, tableTop);
    doc.text('Kategori', col4, tableTop);
    doc.text('Status', col5, tableTop);
    doc.text('Urgensi', col6, tableTop);
    doc.text('Admin', col7, tableTop);
    doc.text('Tanggal', col8, tableTop);

    doc.lineWidth(0.5).moveTo(40, tableTop + 15).lineTo(800, tableTop + 15).stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.font('Helvetica').fontSize(7);

    laporans.forEach((laporan, index) => {
      if (yPosition > 500) {
        doc.addPage();
        yPosition = 40;
      }

      doc.text(`LPR-${laporan.id}`, col1, yPosition);
      doc.text(laporan.judul.substring(0, 20), col2, yPosition);
      doc.text(laporan.user.nama.substring(0, 15), col3, yPosition);
      doc.text((laporan.kategori || '-').substring(0, 15), col4, yPosition);
      doc.text(laporan.status, col5, yPosition);
      doc.text(laporan.urgensi || 'Sedang', col6, yPosition);
      doc.text(laporan.assignedAdmin?.nama?.substring(0, 15) || '-', col7, yPosition);
      doc.text(new Date(laporan.createdAt).toLocaleDateString(), col8, yPosition);

      yPosition += 15;
    });

    // Footer
    doc.fontSize(8).text(`Total Laporan: ${laporans.length}`, 40, doc.page.height - 40);
    doc.text('Terima kasih telah menggunakan LaporinAja', { align: 'center', bottom: 20 });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

module.exports = {
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
};
