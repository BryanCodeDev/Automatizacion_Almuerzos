const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { UsuarioSistema } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const usuario = await UsuarioSistema.findOne({
      where: { email, activo: true }
    });
    
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const me = async (req, res) => {
  try {
    const usuario = await UsuarioSistema.findByPk(req.usuario.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error in me:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { login, me };