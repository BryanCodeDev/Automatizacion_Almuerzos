const QRCode = require('qrcode');
const fs = require('fs');

// Leer el archivo empleados.sql original
const empleadosSql = fs.readFileSync('./empleados.sql', 'utf8');
const lines = empleadosSql.split('\n');

// Extraer empleados del SQL (líneas que empiezan con '(')
const empleados = [];
let inInsert = false;

lines.forEach(line => {
  if (line.includes('INSERT INTO empleados')) {
    inInsert = true;
    return;
  }
  if (inInsert && line.trim().startsWith('(')) {
    // Extraer datos: ('cedula', 'nombre', 'area', 'cargo', TRUE)
    const match = line.match(/\('([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*TRUE\)/);
    if (match) {
      empleados.push({
        cedula: match[1],
        nombre: match[2],
        area: match[3],
        cargo: match[4]
      });
    }
  }
});

console.log(`Encontrados ${empleados.length} empleados`);

// Función para generar QR data
const generateQRData = (cedula, nombre, area, cargo) => {
  return JSON.stringify({
    id: String(cedula),
    cedula: String(cedula),
    nombre: nombre,
    area: area || '',
    cargo: cargo || ''
  });
};

// Generar SQL actualizado
let sqlOutput = `-- Sistema de Gestión de Almuerzos Corporativos
-- Script para poblar la tabla de empleados - Generado desde ReporteMaestroEmpleados 2026-05-27
-- Incluye QR data con ID estable basado en la cédula

USE almuerzos_db;

-- Eliminar datos existentes (opcional, para ejecutar en limpio)
-- TRUNCATE TABLE empleados;

-- INSERTAR EMPLEADOS
INSERT INTO empleados (cedula, nombre_completo, area, cargo, qr_data, activo) VALUES
`;

empleados.forEach((emp, index) => {
  const qrData = generateQRData(emp.cedula, emp.nombre, emp.area, emp.cargo);
  const qrDataEscapado = qrData.replace(/'/g, "''");
  const isLast = index === empleados.length - 1;
  sqlOutput += `('${emp.cedula}', '${emp.nombre}', '${emp.area}', '${emp.cargo}', '${qrDataEscapado}', TRUE)${isLast ? ';' : ','}\n`;
});

// Guardar archivo
fs.writeFileSync('./empleados_qr.sql', sqlOutput);
console.log('Archivo generado: empleados_qr.sql');

// Si se quiere generar imágenes QR, descomentar:
// async function generarImagenes() {
//   for (const emp of empleados) {
//     const qrData = generateQRData(emp.cedula, emp.nombre, emp.area, emp.cargo);
//     const qrImage = await QRCode.toDataURL(qrData);
//     console.log(`QR generado para ${emp.nombre}`);
//   }
// }
// generarImagenes();