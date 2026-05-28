const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, me);

module.exports = router;