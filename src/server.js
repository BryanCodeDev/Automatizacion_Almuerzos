const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const registroRoutes = require('./routes/registroRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const verificarRoutes = require('./routes/verificar');
const { authenticateToken } = require('./middlewares/auth');
const { authorizeRole } = require('./middlewares/role');

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/verificar', verificarRoutes);
app.use('/api/registros/ticket', require('./routes/ticketRoutes')); // Public ticket download

// Protected routes
app.use('/api/empleados', authenticateToken, empleadoRoutes);
app.use('/api/registros', authenticateToken, registroRoutes);
app.use('/api/reportes', authenticateToken, reporteRoutes);
app.use('/api/usuarios', authenticateToken, authorizeRole('admin'), usuarioRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;