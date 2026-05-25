const prisma = require('../config/database');

/**
 * Log user activity to the database
 * @param {number} userId - ID of the user performing the action
 * @param {string} aksi - Short description of the action (e.g., 'MEMBUAT_LAPORAN')
 * @param {string} detail - Detailed description of the action
 */
const logActivity = async (userId, aksi, detail) => {
  try {
    await prisma.activitylog.create({
      data: {
        userId,
        aksi,
        detail
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
