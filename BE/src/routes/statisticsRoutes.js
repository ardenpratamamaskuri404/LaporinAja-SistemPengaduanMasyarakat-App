const express = require('express');
const {
  getAdminStatistics,
  getSuperAdminStatistics,
  getMonthlyTrend,
  getCategoryDistribution,
  getRegionalDistribution,
  getUrgencyDistribution
} = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin statistics (for admins)
router.get('/admin', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), getAdminStatistics);

// Super admin global statistics
router.get('/super', authMiddleware, roleMiddleware('SUPER_ADMIN'), getSuperAdminStatistics);

// Monthly trend data
router.get('/trend/monthly', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), getMonthlyTrend);

// Category distribution
router.get('/distribution/category', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), getCategoryDistribution);

// Regional distribution
router.get('/distribution/regional', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), getRegionalDistribution);

// Urgency distribution
router.get('/distribution/urgency', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), getUrgencyDistribution);

module.exports = router;
