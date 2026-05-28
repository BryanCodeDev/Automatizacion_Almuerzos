const Empleado = require('../models/empleado');
const { generateQR } = require('../utils/qrGenerator');

const getAll = async (req, res) => {
  try {
    const { area, cargo, activo } = req.query;
    const where = {};
    
    if (area) where.area = area;
    if (cargo) where.cargo = cargo;
    if (activo !== undefined) where.activo = activo === 'true';
    
    const empleados = await Empleado.findAll({ where, order: [['nombre_completo', 'ASC']] });
    res.json(empleados);
  } catch (error) {
    console.error('Error in getAll empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    res.json(empleado);
  } catch (error) {
    console.error('Error in getById empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const { cedula, nombre_completo, area, cargo } = req.body;
    
    // Check if cedula already exists
    const existing = await Empleado.findOne({ where: { cedula } });
    if (existing) {
      return res.status(400).json({ message: 'La cédula ya está registrada' });
    }
    
    // Generate QR data with cedula as stable ID (will be consistent across DB resets)
    const qrData = {
      id: cedula,  // Usar cédula como ID estable
      cedula: cedula,
      nombre: nombre_completo,
      area: area || '',
      cargo: cargo || ''
    };
    const qrDataString = JSON.stringify(qrData);
    
    // Create empleado with QR data
    const empleado = await Empleado.create({
      cedula,
      nombre_completo,
      area,
      cargo,
      qr_data: qrDataString,
      activo: true
    });
    
    // Generate QR code image as base64
    const qrImageBase64 = await generateQR({
      id: cedula,
      cedula: cedula,
      nombre_completo: nombre_completo,
      area: area || '',
      cargo: cargo || ''
    });
    
    // Update empleado with QR image
    await empleado.update({ qr_imagen: qrImageBase64 });
    
    // Fetch updated empleado
    const updatedEmpleado = await Empleado.findByPk(empleado.id);
    res.status(201).json(updatedEmpleado);
  } catch (error) {
    console.error('Error in create empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const { cedula, nombre_completo, area, cargo, activo } = req.body;
    const empleado = await Empleado.findByPk(req.params.id);
    
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    // Check if cedula is being changed and already exists
    if (cedula && cedula !== empleado.cedula) {
      const existing = await Empleado.findOne({ where: { cedula } });
      if (existing) {
        return res.status(400).json({ message: 'La cédula ya está registrada por otro empleado' });
      }
    }
    
    // Update fields
    const updateData = {};
    if (cedula !== undefined) updateData.cedula = cedula;
    if (nombre_completo !== undefined) updateData.nombre_completo = nombre_completo;
    if (area !== undefined) updateData.area = area;
    if (cargo !== undefined) updateData.cargo = cargo;
    if (activo !== undefined) updateData.activo = activo;
    
    await empleado.update(updateData);
    
    // If any of the data that affects QR changed, regenerate QR with cedula as stable ID
    if (cedula !== undefined || nombre_completo !== undefined || area !== undefined || cargo !== undefined) {
      // Get the current values after update
      const currentEmpleado = await Empleado.findByPk(empleado.id);
      const qrData = {
        id: currentEmpleado.cedula,  // Usar cédula como ID estable
        cedula: currentEmpleado.cedula,
        nombre: currentEmpleado.nombre_completo,
        area: currentEmpleado.area || '',
        cargo: currentEmpleado.cargo || ''
      };
      const qrDataString = JSON.stringify(qrData);
      const qrImageBase64 = await generateQR({
        id: currentEmpleado.cedula,
        cedula: currentEmpleado.cedula,
        nombre_completo: currentEmpleado.nombre_completo,
        area: currentEmpleado.area || '',
        cargo: currentEmpleado.cargo || ''
      });
      
      await empleado.update({
        qr_data: qrDataString,
        qr_imagen: qrImageBase64
      });
    }
    
    const updatedEmpleado = await Empleado.findByPk(empleado.id);
    res.json(updatedEmpleado);
  } catch (error) {
    console.error('Error in update empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    // Soft delete: set activo to false
    await empleado.update({ activo: false });
    res.json({ message: 'Empleado desactivado correctamente' });
  } catch (error) {
    console.error('Error in remove empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getQR = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    if (!empleado.qr_imagen) {
      return res.status(404).json({ message: 'QR no generado' });
    }
    
    // Return the base64 image (without data URL prefix for flexibility)
    const base64 = empleado.qr_imagen.split(',')[1];
    res.json({ qr_imagen: base64 });
  } catch (error) {
    console.error('Error in getQR:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const descargarQR = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    if (!empleado.qr_imagen) {
      return res.status(404).json({ message: 'QR no generado' });
    }
    
    // Convert base64 to buffer and send as file
    const base64 = empleado.qr_imagen.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=QR_${empleado.nombre_completo.replace(/\s+/g, '_')}.png`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error in descargarQR:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const exportar = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({ where: { activo: true }, order: [['nombre_completo', 'ASC']] });
    
    // For simplicity, we'll just return the data; the route handler will use excelExporter
    // But we'll generate the Excel file here and send it
    const { exportEmployeesToExcel } = require('../utils/excelExporter');
    const wb = exportEmployeesToExcel(empleados);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=empleados.xlsx'
    );
    
    wb.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error in exportar empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getQR,
  descargarQR,
  exportar
};