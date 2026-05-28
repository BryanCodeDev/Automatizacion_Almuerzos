const express = require('express');
const router = express.Router();
const verificarController = require('../controllers/verificar');

// Rutas públicas (sin autenticación)
router.post('/cedula', verificarController.verificarPorCedula);
router.post('/cedula/registrar', verificarController.registrarPorCedula);

// Rutas protegidas (con autenticación)
const { authenticateToken } = require('../middlewares/auth');
router.get('/empleado/:id', authenticateToken, verificarController.verificarPorId);

module.exports = router;