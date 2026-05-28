const express = require('express');
const router = express.Router();
const { downloadTicket } = require('../controllers/registroController');
const { getAllTickets, getAreas } = require('../controllers/ticketController');
const { authenticateToken } = require('../middlewares/auth');

// Protected routes - admin only
router.get('/', authenticateToken, getAllTickets);
router.get('/areas', authenticateToken, getAreas);

// Public ticket download (must be last to avoid conflicts)
router.get('/:ticket_codigo/download', downloadTicket);

module.exports = router;