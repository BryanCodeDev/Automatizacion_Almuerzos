const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  getQR,
  exportar
} = require('../controllers/empleadoController');

// Routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/:id/qr', getQR);
router.get('/exportar', exportar);

module.exports = router;