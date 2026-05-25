const express = require('express');
const { getBantuan, getTentang } = require('../controllers/publicController');

const router = express.Router();

router.get('/bantuan', getBantuan);
router.get('/tentang', getTentang);

module.exports = router;
