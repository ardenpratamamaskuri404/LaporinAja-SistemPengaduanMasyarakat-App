const prisma = require('../config/database');

// Get all activity logs (Super Admin only)
const getActivityLogs = async (req, res) => {
  try {
    const { actor, action, startDate, endDate, search, page, limit } = req.query;

    let where = {};

    if (actor) {
      where.userId = parseInt(actor);
    }

    if (action) {
      where.aksi = action;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (search) {
      where.OR = [
        { aksi: { contains: search } },
        { detail: { contains: search } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const skip = (pageNum - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.activitylog.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.activitylog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get activity log by ID
const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.activitylog.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Activity log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get activity statistics
const getActivityStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalActivities, uniqueActors, todayActivities, actionTypes] = await Promise.all([
      prisma.activitylog.count({ where }),
      prisma.activitylog.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true }
      }),
      prisma.activitylog.count({
        where: {
          ...where,
          createdAt: { gte: todayStart }
        }
      }),
      prisma.activitylog.findMany({
        where,
        distinct: ['aksi'],
        select: { aksi: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalActivities,
        uniqueActors: uniqueActors.length,
        todayActivities,
        actionTypes: actionTypes.length,
        recentActivities: await prisma.activitylog.findMany({
          where,
          include: {
            users: {
              select: {
                id: true,
                nama: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Export activity logs to CSV
const exportActivityLogsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const logs = await prisma.activitylog.findMany({
      where,
      include: {
        users: {
          select: {
            nama: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV content
    let csv = 'Timestamp,Actor,Email,Role,Action,Detail\n';
    logs.forEach(log => {
      const timestamp = new Date(log.createdAt).toISOString();
      const actor = log.users?.nama || 'Unknown';
      const email = log.users?.email || '';
      const role = log.users?.role || '';
      const action = log.aksi || '';
      const detail = (log.detail || '').replace(/"/g, '""'); // Escape quotes

      csv += `"${timestamp}","${actor}","${email}","${role}","${action}","${detail}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getActivityLogs,
  getActivityLogById,
  getActivityStatistics,
  exportActivityLogsCSV
};
