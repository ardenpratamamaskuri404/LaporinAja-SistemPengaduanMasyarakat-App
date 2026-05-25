const express = require('express');
const { getUsers, updateUserInfo, deleteUser, updateProfile, updatePassword, getActivities, getStats } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Allow ANY authenticated user to update their own profile and password
router.put('/profile', authMiddleware, upload.single('foto'), updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.get('/activities', authMiddleware, getActivities);
router.get('/stats', authMiddleware, getStats);

// Only SUPER_ADMIN and ADMIN can access the following user management routes
router.use(authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'));

router.get('/', getUsers);
router.put('/:id', updateUserInfo);
router.put('/:id/role', updateUserInfo); // alias for role update
router.delete('/:id', deleteUser);

module.exports = router;
