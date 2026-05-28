const RegistroAlmuerzo = require('../models/registroAlmuerzo');
const Empleado = require('../models/empleado');
const UsuarioSistema = require('../models/usuarioSistema');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const escanear = async (req, res) => {
  try {
    const { qr_data } = req.body;
    
    if (!qr_data) {
      return res.status(400).json({ message: 'Datos QR requeridos' });
    }
    
    let empleadoData;
    try {
      empleadoData = JSON.parse(qr_data);
    } catch (error) {
      return res.status(400).json({ message: 'Formato de QR inválido' });
    }
    
    const { id, cedula } = empleadoData;
    
    // Buscar empleado: el QR contiene id=cedula (como string), buscar primero por cedula
    const empleado = await Empleado.findOne({
      where: { 
        cedula: String(id) || cedula,
        activo: true
      }
    });
    
    if (!empleado) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empleado no encontrado o inactivo' 
      });
    }
    
    // Check if already registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingRegistro = await RegistroAlmuerzo.findOne({
      where: {
        empleado_id: empleado.id,
        fecha: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });
    
    if (existingRegistro) {
      return res.json({
        success: false,
        message: 'Ya recibió almuerzo hoy',
        hora_registro: existingRegistro.hora,
        empleado: {
          id: empleado.id,
          nombre_completo: empleado.nombre_completo,
          cedula: empleado.cedula,
          area: empleado.area,
          cargo: empleado.cargo
        }
      });
    }
    
    // Generate unique ticket code
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticket_codigo = `ALM-${dateStr}-${randomPart}`;
    
    // Create registro
    const registro = await RegistroAlmuerzo.create({
      empleado_id: empleado.id,
      fecha: today,
      hora: new Date(),
      ticket_codigo,
      registrado_por: req.usuario.id
    });
    
    // Fetch registro with empleado data
    const registroConEmpleado = await RegistroAlmuerzo.findByPk(registro.id, {
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }]
    });
    
    res.json({
      success: true,
      empleado: registroConEmpleado.empleado,
      ticket_codigo: registroConEmpleado.ticket_codigo,
      fecha: registroConEmpleado.fecha,
      hora: registroConEmpleado.hora,
      mensaje: 'Almuerzo registrado correctamente'
    });
  } catch (error) {
    console.error('Error in escanear:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getHoy = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const registros = await RegistroAlmuerzo.findAll({
      where: {
        fecha: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }],
      order: [['hora', 'DESC']]
    });
    
    res.json(registros);
  } catch (error) {
    console.error('Error in getHoy:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getTicket = async (req, res) => {
  try {
    const { ticket_codigo } = req.params;
    
    const registro = await RegistroAlmuerzo.findOne({
      where: { ticket_codigo },
      include: [{
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }]
    });
    
    if (!registro) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    
    res.json(registro);
  } catch (error) {
    console.error('Error in getTicket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const removeRegistro = async (req, res) => {
  try {
    // Only admin can delete registros
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ message: 'No tiene permiso para eliminar registros' });
    }
    
    const registro = await RegistroAlmuerzo.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    
    await registro.destroy();
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error in removeRegistro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const downloadTicket = async (req, res) => {
  try {
    const { ticket_codigo } = req.params;
    
    const registro = await RegistroAlmuerzo.findOne({
      where: { ticket_codigo },
      include: [{
        model: Empleado,
        required: false,
        as: 'empleado',
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }]
    });
    
    if (!registro) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    
    // Generate ticket image with text info
    const { createCanvas } = require('canvas');
    const empleado = registro.empleado;
    
    // Dimensions: ticket size 300x200 pixels
    const width = 300;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Title
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TICKET ALMUERZO', width / 2, 25);
    
    // Separator line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 35);
    ctx.lineTo(width - 20, 35);
    ctx.stroke();
    
    // Info text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    
    const fechaHora = new Date().toLocaleDateString('es-CO') + ' ' + new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    ctx.fillText('ACCESO: AUTORIZADO', 30, 60);
    ctx.fillText(`NOMBRE: ${empleado ? empleado.nombre_completo : 'N/A'}`, 30, 95);
    ctx.fillText(`CC: ${empleado ? empleado.cedula : 'N/A'}`, 30, 130);
    ctx.fillText(`FECHA: ${fechaHora}`, 30, 165);
    
    // Convert to PNG
    const buffer = canvas.toBuffer('image/png');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${ticket_codigo}.png`);
    res.send(buffer);
  } catch (error) {
    console.error('Error in downloadTicket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  escanear,
  getHoy,
  getTicket,
  removeRegistro,
  downloadTicket
};