const express = require('express');
const {
  getConfig,
  getConfigSection,
  updateGeneralSettings,
  updateEmailSettings,
  updateSecuritySettings,
  updateIntegrationSettings,
  updateBackupSettings,
  triggerBackup
} = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Super Admin only routes
router.use(authMiddleware, roleMiddleware('SUPER_ADMIN'));

// Get all configuration
router.get('/', getConfig);

// Get specific configuration section
router.get('/:section', getConfigSection);

// Update general settings
router.put('/general', updateGeneralSettings);

// Update email settings
router.put('/email', updateEmailSettings);

// Update security settings
router.put('/security', updateSecuritySettings);

// Update integration settings
router.put('/integration', updateIntegrationSettings);

// Update backup settings
router.put('/backup', updateBackupSettings);

// Trigger backup
router.post('/backup/trigger', triggerBackup);

module.exports = router;
