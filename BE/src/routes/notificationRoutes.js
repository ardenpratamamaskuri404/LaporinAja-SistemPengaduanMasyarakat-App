const express = require('express');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead, hideAllNotifications, deleteNotifications } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getNotifications);
router.get('/unread/count', auth, getUnreadCount);
router.put('/:id/read', auth, markAsRead);
router.put('/read/all', auth, markAllAsRead);
router.put('/hide/all', auth, hideAllNotifications);
router.put('/hide-all', auth, hideAllNotifications);
router.post('/delete-multiple', auth, deleteNotifications);

module.exports = router;
