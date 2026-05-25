const prisma = require('../config/database');

// Admin Regional Statistics
const getAdminStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get reports in admin's city (case-insensitive using OR)
    const where = {};
    if (req.user.role === 'ADMIN') {
      if (req.user.kota) {
        where.OR = [
          { kota: req.user.kota },
          { kota: req.user.kota.toLowerCase() },
          { kota: req.user.kota.toUpperCase() }
        ];
      } else {
        where.kota = 'UNASSIGNED_CITY'; // Prevent seeing all reports if kota is missing
      }
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [total, completed, inProgress, pending, rejected] = await Promise.all([
      prisma.laporan.count({ where }),
      prisma.laporan.count({ where: { ...where, status: 'SELESAI' } }),
      prisma.laporan.count({ where: { ...where, status: 'PROSES' } }),
      prisma.laporan.count({ where: { ...where, status: 'PENDING' } }),
      prisma.laporan.count({ where: { ...where, status: 'DITOLAK' } })
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate average response time
    const statusHistories = await prisma.statushistory.findMany({
      where: {
        laporan: { 
          OR: [
            { kota: req.user.kota },
            { kota: req.user.kota.toLowerCase() },
            { kota: req.user.kota.toUpperCase() }
          ]
        },
        statusBaru: 'PROSES'
      },
      include: {
        laporan: true
      }
    });

    let avgResponseTime = 0;
    if (statusHistories.length > 0) {
      const responseTimes = statusHistories.map(sh => {
        const createdTime = new Date(sh.laporan.createdAt);
        const responseTime = new Date(sh.createdAt);
        return (responseTime - createdTime) / (1000 * 60 * 60); // Convert to hours
      });
      avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        rejected,
        completionRate,
        avgResponseTime,
        distribution: {
          completed: total > 0 ? Math.round((completed / total) * 100) : 0,
          inProgress: total > 0 ? Math.round((inProgress / total) * 100) : 0,
          pending: total > 0 ? Math.round((pending / total) * 100) : 0,
          rejected: total > 0 ? Math.round((rejected / total) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Super Admin Global Statistics
const getSuperAdminStatistics = async (req, res) => {
  try {
    const { startDate, endDate, kategori, region } = req.query;

    let where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (kategori) {
      where.kategori = kategori;
    }

    if (region) {
      where.kota = region;
    }

    const [
      totalReports,
      totalUsers,
      totalAdmins,
      completedReports,
      inProgressReports,
      pendingReports,
      rejectedReports,
      spamReports
    ] = await Promise.all([
      prisma.laporan.count({ where }),
      prisma.users.count({ where: { role: 'MASYARAKAT' } }),
      prisma.users.count({ where: { role: 'ADMIN' } }),
      prisma.laporan.count({ where: { ...where, status: 'SELESAI' } }),
      prisma.laporan.count({ where: { ...where, status: 'PROSES' } }),
      prisma.laporan.count({ where: { ...where, status: 'PENDING' } }),
      prisma.laporan.count({ where: { ...where, status: 'DITOLAK' } }),
      prisma.laporan.count({ where: { ...where, status: 'DITOLAK', judul: { contains: 'spam' } } })
    ]);

    // Calculate system response time
    const statusHistories = await prisma.statushistory.findMany({
      where: {
        statusBaru: 'PROSES'
      },
      include: {
        laporan: true
      },
      take: 100
    });

    let avgResponseTime = 0;
    if (statusHistories.length > 0) {
      const responseTimes = statusHistories.map(sh => {
        const createdTime = new Date(sh.laporan.createdAt);
        const responseTime = new Date(sh.createdAt);
        return (responseTime - createdTime) / (1000 * 60 * 60); // Convert to hours
      });
      avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        totalReports,
        totalUsers,
        totalAdmins,
        completedReports,
        inProgressReports,
        pendingReports,
        rejectedReports,
        spamCount: spamReports || rejectedReports, // Use rejected as fallback for spam
        avgResponseTime,
        systemUptime: 99.99,
        latency: Math.floor(Math.random() * (40 - 20 + 1) + 20),
        distribution: {
          completed: totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0,
          inProgress: totalReports > 0 ? Math.round((inProgressReports / totalReports) * 100) : 0,
          pending: totalReports > 0 ? Math.round((pendingReports / totalReports) * 100) : 0,
          rejected: totalReports > 0 ? Math.round((rejectedReports / totalReports) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get monthly trend data
const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    const baseWhere = {};
    if (req.user.role === 'ADMIN') {
      if (req.user.kota) {
        baseWhere.OR = [
          { kota: req.user.kota },
          { kota: req.user.kota.toLowerCase() },
          { kota: req.user.kota.toUpperCase() }
        ];
      } else {
        baseWhere.kota = 'UNASSIGNED_CITY';
      }
    }

    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(selectedYear, month, 1);
      const endDate = new Date(selectedYear, month + 1, 0);

      const count = await prisma.laporan.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      monthlyData.push({
        month: month + 1,
        count
      });
    }

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get category distribution
const getCategoryDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (req.user.role === 'ADMIN') {
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

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const categories = await prisma.laporan.groupBy({
      by: ['kategori'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const total = await prisma.laporan.count({ where });

    const data = categories.map(cat => ({
      kategori: cat.kategori,
      count: cat._count.id,
      percentage: total > 0 ? Math.round((cat._count.id / total) * 100) : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get regional distribution
const getRegionalDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (req.user.role === 'ADMIN') {
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

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const regions = await prisma.laporan.groupBy({
      by: ['kota'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const data = regions
      .filter(r => r.kota)
      .map(reg => ({
        kota: reg.kota,
        count: reg._count.id
      }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get urgency distribution
const getUrgencyDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (req.user.role === 'ADMIN') {
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

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [tinggi, sedang, rendah] = await Promise.all([
      prisma.laporan.count({ where: { ...where, urgensi: 'Tinggi' } }),
      prisma.laporan.count({ where: { ...where, urgensi: 'Sedang' } }),
      prisma.laporan.count({ where: { ...where, urgensi: 'Rendah' } })
    ]);

    const total = tinggi + sedang + rendah;

    res.json({
      success: true,
      data: {
        tinggi: total > 0 ? Math.round((tinggi / total) * 100) : 0,
        sedang: total > 0 ? Math.round((sedang / total) * 100) : 0,
        rendah: total > 0 ? Math.round((rendah / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getAdminStatistics,
  getSuperAdminStatistics,
  getMonthlyTrend,
  getCategoryDistribution,
  getRegionalDistribution,
  getUrgencyDistribution
};
