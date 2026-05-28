const Empleado = require('../models/empleado');
const RegistroAlmuerzo = require('../models/registroAlmuerzo');
const { Op } = require('sequelize');
const { esDiaHabil, proximoDiaHabil } = require('../utils/diasHabiles');

// Verificar almuerzo por últimos 4 dígitos de cédula (ruta pública)
const verificarPorCedula = async (req, res) => {
  try {
    const { ultimos4 } = req.body;
    
    // Validar entrada
    if (!ultimos4 || !/^\d{4}$/.test(ultimos4)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se requieren exactamente 4 dígitos'
      });
    }
    
    // Verificar si hoy es día hábil
    const hoy = new Date();
    if (!esDiaHabil(hoy)) {
      const proximo = proximoDiaHabil(hoy);
      const diaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      return res.json({
        success: false,
        tipo: 'no_habil',
        mensaje: `Hoy no hay servicio de almuerzo. El próximo servicio es el ${diaSemana[proximo.getDay()]} ${proximo.toLocaleDateString('es-CO')}`
      });
    }
    
    // Buscar empleados cuya cédula termine en esos 4 dígitos
    const empleados = await Empleado.findAll({
      where: {
        cedula: {
          [Op.endsWith]: ultimos4
        },
        activo: true
      }
    });
    
    if (empleados.length === 0) {
      return res.json({
        success: false,
        tipo: 'no_encontrado',
        mensaje: 'No se encontró ningún empleado con esa cédula'
      });
    }
    
    // Si hay múltiples empleados, devolver lista para que elija
    if (empleados.length > 1) {
      return res.json({
        success: false,
        tipo: 'multiple',
        mensaje: 'Múltiples empleados encontrados. Seleccione el suyo.',
        empleados: empleados.map(e => ({
          id: e.id,
          nombre_completo: e.nombre_completo
        }))
      });
    }
    
    // Verificar si el empleado recibió almuerzo hoy
    const empleado = empleados[0];
    
    const hoyStr = hoy.toISOString().slice(0, 10);
    const registro = await RegistroAlmuerzo.findOne({
      where: {
        empleado_id: empleado.id,
        fecha: hoyStr
      },
      include: [{
        model: Empleado,
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }]
    });
    
    if (registro) {
      return res.json({
        success: true,
        tipo: 'registrado',
        empleado: {
          nombre_completo: empleado.nombre_completo,
          area: empleado.area,
          cargo: empleado.cargo
        },
        registro: {
          hora: registro.hora,
          ticket_codigo: registro.ticket_codigo
        }
      });
    } else {
      return res.json({
        success: true,
        tipo: 'no_registrado',
        empleado: {
          nombre_completo: empleado.nombre_completo,
          area: empleado.area,
          cargo: empleado.cargo
        }
      });
    }
  } catch (error) {
    console.error('Error in verificarPorCedula:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

// Verificar por ID de empleado (método 2 y 3 del verificador interno)
const verificarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const empleado = await Empleado.findByPk(id);
    if (!empleado || !empleado.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Empleado no encontrado'
      });
    }
    
    // Verificar si recibió hoy
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);
    
    const registroHoy = await RegistroAlmuerzo.findOne({
      where: {
        empleado_id: empleado.id,
        fecha: hoyStr
      }
    });
    
    // Obtener historial de la semana
    const { desde, hasta } = require('../utils/diasHabiles').semanaActual();
    
    const registrosSemana = await RegistroAlmuerzo.findAll({
      where: {
        empleado_id: empleado.id,
        fecha: {
          [Op.between]: [desde, hasta]
        }
      }
    });
    
    const diasSemana = ['lun', 'mar', 'mié', 'jue', 'vie'];
    const historialSemana = {};
    
    for (let i = 0; i < 5; i++) {
      const fecha = new Date(desde);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().slice(0, 10);
      historialSemana[diasSemana[i]] = registrosSemana.some(r => r.fecha === fechaStr);
    }
    
    res.json({
      success: true,
      empleado: {
        id: empleado.id,
        nombre_completo: empleado.nombre_completo,
        cedula: empleado.cedula,
        area: empleado.area,
        cargo: empleado.cargo
      },
      hoy: registroHoy ? {
        registrado: true,
        hora: registroHoy.hora,
        ticket_codigo: registroHoy.ticket_codigo
      } : {
        registrado: false
      },
      semana: {
        historial: historialSemana,
        total: registrosSemana.length
      }
    });
  } catch (error) {
    console.error('Error in verificarPorId:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor'
    });
  }
};

module.exports = {
  verificarPorCedula,
  verificarPorId
};