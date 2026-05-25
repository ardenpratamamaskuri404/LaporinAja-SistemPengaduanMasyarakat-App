const prisma = require('../config/database');
const { logActivity } = require('../utils/logger');

// In-memory config storage (in production, use database)
let systemConfig = {
  general: {
    appName: 'LaporinAja',
    appDescription: 'Platform pelaporan warga yang modern dan terpercaya.',
    timezone: 'Asia/Jakarta',
    language: 'ID',
    maxPhotosPerReport: 5,
    maxFileSize: 10
  },
  email: {
    smtpServer: 'smtp.mailtrap.io',
    smtpPort: 2525,
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: 'noreply@laporinaja.id'
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true
  },
  integration: {
    googleMapsApiKey: '',
    firebaseCloudMessagingKey: ''
  },
  backup: {
    autoBackupEnabled: true,
    backupSchedule: '00:00'
  }
};

// Get all configuration
const getConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      data: systemConfig
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get specific configuration section
const getConfigSection = async (req, res) => {
  try {
    const { section } = req.params;

    if (!systemConfig[section]) {
      return res.status(404).json({ success: false, message: 'Configuration section not found' });
    }

    res.json({
      success: true,
      data: systemConfig[section]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update general settings
const updateGeneralSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appName, appDescription, timezone, language, maxPhotosPerReport, maxFileSize } = req.body;

    systemConfig.general = {
      ...systemConfig.general,
      ...(appName && { appName }),
      ...(appDescription && { appDescription }),
      ...(timezone && { timezone }),
      ...(language && { language }),
      ...(maxPhotosPerReport && { maxPhotosPerReport: parseInt(maxPhotosPerReport) }),
      ...(maxFileSize && { maxFileSize: parseInt(maxFileSize) })
    };

    await logActivity(userId, 'UPDATE_CONFIG_GENERAL', 'Memperbarui pengaturan umum sistem');

    res.json({
      success: true,
      message: 'General settings updated successfully',
      data: systemConfig.general
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update email settings
const updateEmailSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { smtpServer, smtpPort, smtpUsername, smtpPassword, senderEmail } = req.body;

    systemConfig.email = {
      ...systemConfig.email,
      ...(smtpServer && { smtpServer }),
      ...(smtpPort && { smtpPort: parseInt(smtpPort) }),
      ...(smtpUsername && { smtpUsername }),
      ...(smtpPassword && { smtpPassword }),
      ...(senderEmail && { senderEmail })
    };

    await logActivity(userId, 'UPDATE_CONFIG_EMAIL', 'Memperbarui pengaturan email SMTP');

    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: systemConfig.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update security settings
const updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      twoFactorEnabled,
      sessionTimeout,
      passwordMinLength,
      passwordRequireUppercase,
      passwordRequireNumbers,
      passwordRequireSpecialChars
    } = req.body;

    systemConfig.security = {
      ...systemConfig.security,
      ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
      ...(sessionTimeout && { sessionTimeout: parseInt(sessionTimeout) }),
      ...(passwordMinLength && { passwordMinLength: parseInt(passwordMinLength) }),
      ...(passwordRequireUppercase !== undefined && { passwordRequireUppercase }),
      ...(passwordRequireNumbers !== undefined && { passwordRequireNumbers }),
      ...(passwordRequireSpecialChars !== undefined && { passwordRequireSpecialChars })
    };

    await logActivity(userId, 'UPDATE_CONFIG_SECURITY', 'Memperbarui pengaturan keamanan sistem');

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: systemConfig.security
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update integration settings
const updateIntegrationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { googleMapsApiKey, firebaseCloudMessagingKey } = req.body;

    systemConfig.integration = {
      ...systemConfig.integration,
      ...(googleMapsApiKey && { googleMapsApiKey }),
      ...(firebaseCloudMessagingKey && { firebaseCloudMessagingKey })
    };

    await logActivity(userId, 'UPDATE_CONFIG_INTEGRATION', 'Memperbarui pengaturan integrasi pihak ketiga');

    res.json({
      success: true,
      message: 'Integration settings updated successfully',
      data: systemConfig.integration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update backup settings
const updateBackupSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { autoBackupEnabled, backupSchedule } = req.body;

    systemConfig.backup = {
      ...systemConfig.backup,
      ...(autoBackupEnabled !== undefined && { autoBackupEnabled }),
      ...(backupSchedule && { backupSchedule })
    };

    await logActivity(userId, 'UPDATE_CONFIG_BACKUP', 'Memperbarui pengaturan backup sistem');

    res.json({
      success: true,
      message: 'Backup settings updated successfully',
      data: systemConfig.backup
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Trigger backup
const triggerBackup = async (req, res) => {
  try {
    const userId = req.user.id;

    // Simulate backup process
    await logActivity(userId, 'TRIGGER_BACKUP', 'Memicu backup database manual');

    res.json({
      success: true,
      message: 'Backup triggered successfully',
      data: {
        backupId: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getConfig,
  getConfigSection,
  updateGeneralSettings,
  updateEmailSettings,
  updateSecuritySettings,
  updateIntegrationSettings,
  updateBackupSettings,
  triggerBackup
};
