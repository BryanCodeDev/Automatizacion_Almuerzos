const RegistroAlmuerzo = require('../models/registroAlmuerzo');
const Empleado = require('../models/empleado');
const { Op } = require('sequelize');

// Get all tickets with optional filters
const getAllTickets = async (req, res) => {
  try {
    const { fecha, desde, hasta, search, area } = req.query;
    
    let where = {};
    
    if (fecha) {
      where.fecha = fecha;
    } else if (desde && hasta) {
      where.fecha = {
        [Op.between]: [desde, hasta]
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.fecha = {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      };
    }
    
    const empleadoWhere = {};
    if (search) {
      empleadoWhere[Op.or] = [
        { nombre_completo: { [Op.like]: `%${search}%` } },
        { cedula: { [Op.like]: `%${search}%` } }
      ];
    }
    if (area) {
      empleadoWhere.area = area;
    }
    
    const registros = await RegistroAlmuerzo.findAll({
      where,
      include: [{
        model: Empleado,
        as: 'empleado',
        where: Object.keys(empleadoWhere).length > 0 ? empleadoWhere : undefined,
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });
    
    res.json(registros);
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Get areas for filter
const getAreas = async (req, res) => {
  try {
    const areas = await Empleado.findAll({
      attributes: ['area'],
      where: { 
        activo: true,
        area: { [Op.ne]: null }
      },
      group: ['area']
    });
    
    res.json(areas.map(a => a.area).filter(a => a));
  } catch (error) {
    console.error('Error in getAreas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllTickets,
  getAreas
};