const express = require('express');
const {
  getActivityLogs,
  getActivityLogById,
  getActivityStatistics,
  exportActivityLogsCSV
} = require('../controllers/activityLogController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Get all activity logs
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getActivityLogs);

// Get activity statistics
router.get('/stats', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getActivityStatistics);

// Export activity logs to CSV
router.get('/export/csv', authMiddleware, roleMiddleware('SUPER_ADMIN'), exportActivityLogsCSV);

// Get activity log by ID
router.get('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getActivityLogById);

module.exports = router;
