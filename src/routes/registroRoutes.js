const express = require('express');
const router = express.Router();
const {
  escanear,
  getHoy,
  getTicket,
  removeRegistro,
  downloadTicket
} = require('../controllers/registroController');

// Routes
router.post('/escanear', escanear);
router.get('/hoy', getHoy);
router.get('/ticket/:ticket_codigo', getTicket);
router.get('/ticket/:ticket_codigo/download', downloadTicket);
router.delete('/:id', removeRegistro);

module.exports = router;