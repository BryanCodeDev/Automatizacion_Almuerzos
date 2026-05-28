const Empleado = require('../models/empleado');
const RegistroAlmuerzo = require('../models/registroAlmuerzo');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const { exportWeeklyReportToExcel, exportRegistrosToExcel, exportEmployeesToExcel } = require('../utils/excelExporter');

const getSemana = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let startDate, endDate;
    if (desde && hasta) {
      startDate = new Date(desde);
      endDate = new Date(hasta);
    } else {
      // Default to current week (Monday to Sunday)
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust to make Monday the start
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Sunday
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Get all active employees
    const empleados = await Empleado.findAll({ where: { activo: true } });
    
    // Generate date range labels (e.g., ['lun', 'mar', ...])
    const dias = [];
    const fechaActual = new Date(startDate);
    while (fechaActual <= endDate) {
      const diaSemana = fechaActual.getDay(); // 0 = Sunday, 1 = Monday, etc.
      let diaNombre;
      switch (diaSemana) {
        case 0: diaNombre = 'dom'; break;
        case 1: diaNombre = 'lun'; break;
        case 2: diaNombre = 'mar'; break;
        case 3: diaNombre = 'mié'; break;
        case 4: diaNombre = 'jue'; break;
        case 5: diaNombre = 'vie'; break;
        case 6: diaNombre = 'sáb'; break;
      }
      dias.push(diaNombre);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    // Build matrix: empleado_id -> { fecha: true/false }
    const matriz = {};
    const totales = {};
    
    // For each employee, check each day in range
    for (const emp of empleados) {
      matriz[emp.id] = {};
      totales[emp.id] = 0;
      
      const fechaActual = new Date(startDate);
      while (fechaActual <= endDate) {
        const fechaStr = fechaActual.toISOString().slice(0, 10); // YYYY-MM-DD
        const diaSemana = fechaActual.getDay();
        let diaNombre;
        switch (diaSemana) {
          case 0: diaNombre = 'dom'; break;
          case 1: diaNombre = 'lun'; break;
          case 2: diaNombre = 'mar'; break;
          case 3: diaNombre = 'mié'; break;
          case 4: diaNombre = 'jue'; break;
          case 5: diaNombre = 'vie'; break;
          case 6: diaNombre = 'sáb'; break;
        }
        
        // Check if there's a registro for this employee on this date
        const encontrado = await RegistroAlmuerzo.findOne({
          where: {
            empleado_id: emp.id,
            fecha: fechaStr
          }
        });
        
        matriz[emp.id][diaNombre] = !!encontrado;
        if (encontrado) totales[emp.id]++;
        
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }
    
    res.json({ empleados, dias, matriz, totales });
  } catch (error) {
    console.error('Error in getSemana:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { desde, hasta } = req.query;
    
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    let startDate, endDate;
    if (desde && hasta) {
      startDate = new Date(desde);
      endDate = new Date(hasta);
    } else {
      // Default to last 30 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    }
    
    const registros = await RegistroAlmuerzo.findAll({
      where: {
        empleado_id: id,
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['fecha', 'ASC']]
    });
    
    res.json({
      empleado: {
        id: empleado.id,
        nombre_completo: empleado.nombre_completo,
        cedula: empleado.cedula,
        area: empleado.area,
        cargo: empleado.cargo
      },
      registros: registros.map(r => ({
        id: r.id,
        fecha: r.fecha,
        hora: r.hora,
        ticket_codigo: r.ticket_codigo
      })),
      total: registros.length
    });
  } catch (error) {
    console.error('Error in getEmpleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const exportar = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let startDate, endDate;
    if (desde && hasta) {
      startDate = new Date(desde);
      endDate = new Date(hasta);
    } else {
      // Default to current week
      const today = new Date();
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Reuse the logic from getSemana to get the report data
    const empleados = await Empleado.findAll({ where: { activo: true } });
    
    const dias = [];
    const fechaActual = new Date(startDate);
    while (fechaActual <= endDate) {
      const diaSemana = fechaActual.getDay();
      let diaNombre;
      switch (diaSemana) {
        case 0: diaNombre = 'dom'; break;
        case 1: diaNombre = 'lun'; break;
        case 2: diaNombre = 'mar'; break;
        case 3: diaNombre = 'mié'; break;
        case 4: diaNombre = 'jue'; break;
        case 5: diaNombre = 'vie'; break;
        case 6: diaNombre = 'sáb'; break;
      }
      dias.push(diaNombre);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
const matriz = {};
    const totales = {};
    
    for (const emp of empleados) {
      matriz[emp.id] = {};
      totales[emp.id] = 0;
      
      let fechaActual = new Date(startDate);
      while (fechaActual <= endDate) {
         const fechaStr = fechaActual.toISOString().slice(0, 10);
         const diaSemana = fechaActual.getDay();
         let diaNombre;
         switch (diaSemana) {
           case 0: diaNombre = 'dom'; break;
           case 1: diaNombre = 'lun'; break;
           case 2: diaNombre = 'mar'; break;
           case 3: diaNombre = 'mié'; break;
           case 4: diaNombre = 'jue'; break;
           case 5: diaNombre = 'vie'; break;
           case 6: diaNombre = 'sáb'; break;
         }
        
        const encontrado = await RegistroAlmuerzo.findOne({
          where: {
            empleado_id: emp.id,
            fecha: fechaStr
          }
        });
        
        matriz[emp.id][diaNombre] = !!encontrado;
        if (encontrado) totales[emp.id]++;
        
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }
    
    const reportData = {
      empleados,
      dias,
      matriz,
      totales
    };
    const wb = exportWeeklyReportToExcel(reportData);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte_semanal.xlsx'
    );
    
    wb.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error in exportar reportes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const exportarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { desde, hasta } = req.query;
    
    let startDate, endDate;
    if (desde && hasta) {
      startDate = new Date(desde);
      endDate = new Date(hasta);
    } else {
      // Default to last 30 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    }
    
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    const registros = await RegistroAlmuerzo.findAll({
      where: {
        empleado_id: id,
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['fecha', 'ASC']]
    });
    
    // Prepare data for export
    const exportData = [
      ['Fecha', 'Hora', 'Código de Ticket']
    ];
    
    registros.forEach(registro => {
      exportData.push([
        new Date(registro.fecha).toLocaleDateString('es-CO'),
        new Date(registro.hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        registro.ticket_codigo
      ]);
    });
    
    // Add totals row
    exportData.push(['Total', registros.length, '']);
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Historial_${empleado.nombre_completo}`);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=historial_empleado_${empleado.id}.xlsx`
    );
    
    wb.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error in exportarEmpleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const exportarBoletaDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ message: 'Fecha requerida' });
    }
    
    const startDate = new Date(fecha);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(fecha);
    endDate.setHours(23, 59, 59, 999);
    
    const registros = await RegistroAlmuerzo.findAll({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Empleado,
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }],
      order: [['hora', 'ASC']]
    });
    
    // Prepare data for export
    const exportData = [
      ['Nombre', 'Cédula', 'Área', 'Cargo', 'Hora de Registro']
    ];
    
    registros.forEach(reg => {
      exportData.push([
        reg.empleado.nombre_completo,
        reg.empleado.cedula,
        reg.empleado.area || '-',
        reg.empleado.cargo || '-',
        new Date(reg.hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      ]);
    });
    
    // Add totals row
    exportData.push(['TOTAL', '', '', '', registros.length]);
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Boleta_${fecha}`);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=boleta_dia_${fecha}.xlsx`
    );
    
    wb.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error in exportarBoletaDia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getBoletaDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ message: 'Fecha requerida' });
    }
    
    const startDate = new Date(fecha);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(fecha);
    endDate.setHours(23, 59, 59, 999);
    
    const registros = await RegistroAlmuerzo.findAll({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Empleado,
        attributes: ['id', 'nombre_completo', 'cedula', 'area', 'cargo']
      }],
      order: [['hora', 'ASC']]
    });
    
    // Calculate totals by area and cargo
    const desgloseArea = {};
    const desgloseCargo = {};
    
    registros.forEach(reg => {
      const area = reg.empleado.area || 'Sin área';
      const cargo = reg.empleado.cargo || 'Sin cargo';
      desgloseArea[area] = (desgloseArea[area] || 0) + 1;
      desgloseCargo[cargo] = (desgloseCargo[cargo] || 0) + 1;
    });
    
    res.json({
      fecha,
      total: registros.length,
      desglose: {
        area: desgloseArea,
        cargo: desgloseCargo
      },
      registros: registros.map(reg => ({
        nombre: reg.empleado.nombre_completo,
        cedula: reg.empleado.cedula,
        area: reg.empleado.area,
        cargo: reg.empleado.cargo,
        hora: reg.hora
      }))
    });
  } catch (error) {
    console.error('Error in getBoletaDia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getSemana,
  getEmpleado,
  exportar,
  exportarEmpleado,
  exportarBoletaDia,
  getBoletaDia
};