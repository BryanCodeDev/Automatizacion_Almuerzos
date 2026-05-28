const express = require('express');
const router = express.Router();
const {
  getSemana,
  getEmpleado,
  exportar,
  exportarEmpleado,
  exportarBoletaDia,
  getBoletaDia
} = require('../controllers/reporteController');

// Routes
router.get('/semana', getSemana);
router.get('/empleado/:id', getEmpleado);
router.get('/exportar', exportar);
router.get('/empleado/:id/exportar', exportarEmpleado);
router.get('/boleta-dia/exportar', exportarBoletaDia);
router.get('/boleta-dia', getBoletaDia);

module.exports = router;