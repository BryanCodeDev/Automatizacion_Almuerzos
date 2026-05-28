const XLSX = require('xlsx');

/**
 * Exports an array of employee objects to Excel workbook
 * @param {Array} employees - Array of employee objects
 * @returns {XLSX.WorkBook} Excel workbook
 */
const exportEmployeesToExcel = (employees) => {
  const worksheetData = [
    ['Nombre', 'Cédula', 'Área', 'Cargo', 'Activo']
  ];

  employees.forEach(emp => {
    worksheetData.push([
      emp.nombre_completo,
      emp.cedula,
      emp.area,
      emp.cargo,
      emp.activo ? 'Sí' : 'No'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
  return wb;
};

/**
 * Exports an array of registro objects to Excel workbook (for daily boleta)
 * @param {Array} registros - Array of registro objects with employee data
 * @returns {XLSX.WorkBook} Excel workbook
 */
const exportRegistrosToExcel = (registros) => {
  const worksheetData = [
    ['Nombre', 'Cédula', 'Área', 'Cargo', 'Hora de Registro']
  ];

  registros.forEach(reg => {
    worksheetData.push([
      reg.empleado ? reg.empleado.nombre_completo : 'N/A',
      reg.empleado ? reg.empleado.cedula : 'N/A',
      reg.empleado ? reg.empleado.area : 'N/A',
      reg.empleado ? reg.empleado.cargo : 'N/A',
      reg.hora ? reg.hora.toString().substring(0, 8) : 'N/A'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registro Almuerzo');
  return wb;
};

/**
 * Exports weekly report data to Excel
 * @param {Object} reportData - Object with empleados, dias, matriz, totales
 * @returns {XLSX.WorkBook} Excel workbook
 */
const exportWeeklyReportToExcel = (reportData) => {
  const { empleados, dias, matriz, totales } = reportData;

  // Create header row: Empleado, then each day, then Total
  const header = ['Empleado'];
  dias.forEach(dia => {
    header.push(dia.charAt(0).toUpperCase() + dia.slice(1)); // Capitalize first letter
  });
  header.push('Total');

  const worksheetData = [header];

  empleados.forEach(emp => {
    const row = [emp.nombre_completo];
    dias.forEach(dia => {
      const fechaKey = dia; // Assuming dias are formatted like 'lun', 'mar', etc.
      // We need to map to actual date strings? For simplicity, we'll assume matriz uses day names as keys
      const received = matriz[emp.id] && matriz[emp.id][fechaKey] ? '✓' : '';
      row.push(received);
    });
    row.push(totales[emp.id] || 0);
    worksheetData.push(row);
  });

  // Add totals row
  const totalsRow = ['TOTAL'];
  dias.forEach(() => {
    totalsRow.push(''); // We don't have daily totals in this structure, but we could calculate
  });
  totalsRow.push(totales.total || 0);
  worksheetData.push(totalsRow);

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Semanal');
  return wb;
};

module.exports = {
  exportEmployeesToExcel,
  exportRegistrosToExcel,
  exportWeeklyReportToExcel
};