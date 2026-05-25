const prisma = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notifikasi.findMany({
      where: { userId, tersembunyi: false },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, message: 'Notifications fetched successfully', data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notifikasi.count({
      where: { userId, sudahDibaca: false, tersembunyi: false }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notifikasi.findUnique({ where: { id: parseInt(id) } });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found', data: null });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied', data: null });
    }

    const updatedNotification = await prisma.notifikasi.update({
      where: { id: parseInt(id) },
      data: { sudahDibaca: true }
    });

    res.json({ success: true, message: 'Notification marked as read', data: updatedNotification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notifikasi.updateMany({
      where: { userId, sudahDibaca: false },
      data: { sudahDibaca: true }
    });

    res.json({ success: true, message: 'All notifications marked as read', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

// Hide all notifications from UI but keep in database
const hideAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notifikasi.updateMany({
      where: { userId, tersembunyi: false },
      data: { tersembunyi: true, sudahDibaca: true }
    });

    res.json({ success: true, message: 'All notifications hidden', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs provided', data: null });
    }

    await prisma.notifikasi.deleteMany({
      where: {
        id: { in: ids },
        userId: userId
      }
    });

    res.json({ success: true, message: 'Notifications deleted successfully', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', data: null });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  hideAllNotifications,
  deleteNotifications
};
