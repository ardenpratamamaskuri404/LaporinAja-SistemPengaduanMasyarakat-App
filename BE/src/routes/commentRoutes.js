const express = require('express');
const { getComments, addComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:laporanId')
  .get(getComments)
  .post(authMiddleware, addComment);

module.exports = router;
