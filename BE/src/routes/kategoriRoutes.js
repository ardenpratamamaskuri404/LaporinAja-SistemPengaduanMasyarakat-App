const express = require('express');
const { getKategori, createKategori, updateKategori, deleteKategori } = require('../controllers/kategoriController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getKategori);
router.post('/', auth, roleMiddleware('SUPER_ADMIN', 'ADMIN'), createKategori);
router.put('/:id', auth, roleMiddleware('SUPER_ADMIN', 'ADMIN'), updateKategori);
router.delete('/:id', auth, roleMiddleware('SUPER_ADMIN', 'ADMIN'), deleteKategori);

module.exports = router;
