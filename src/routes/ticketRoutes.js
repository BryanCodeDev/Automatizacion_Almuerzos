const express = require('express');
const router = express.Router();
const { downloadTicket } = require('../controllers/registroController');

router.get('/:ticket_codigo/download', downloadTicket);

module.exports = router;