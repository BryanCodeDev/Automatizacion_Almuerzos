const UsuarioSistema = require('../models/usuarioSistema');
const bcrypt = require('bcryptjs');

const getAll = async (req, res) => {
  try {
    const usuarios = await UsuarioSistema.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['nombre', 'ASC']]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error in getAll usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const usuario = await UsuarioSistema.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error in getById usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Check if email already exists
    const existing = await UsuarioSistema.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    const usuario = await UsuarioSistema.create({
      nombre,
      email,
      password_hash,
      rol: rol || 'operador',
      activo: true
    });
    
    // Remove password hash from response
    const { password_hash: _, ...usuarioSinPassword } = usuario.get();
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    console.error('Error in create usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;
    
    const usuario = await UsuarioSistema.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Check if email is being changed and already exists
    if (email && email !== usuario.email) {
      const existing = await UsuarioSistema.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'El email ya está registrado por otro usuario' });
      }
    }
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (rol !== undefined) updateData.rol = rol;
    if (activo !== undefined) updateData.activo = activo;
    
    // If password is provided, hash and update it
    if (req.body.password) {
      updateData.password_hash = await bcrypt.hash(req.body.password, 10);
    }
    
    await usuario.update(updateData);
    
    const { password_hash: _, ...usuarioSinPassword } = usuario.get();
    res.json(usuarioSinPassword);
  } catch (error) {
    console.error('Error in update usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await UsuarioSistema.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Soft delete: set activo to false
    await usuario.update({ activo: false });
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error in remove usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};