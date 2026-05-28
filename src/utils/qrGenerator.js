const QRCode = require('qrcode');

/**
 * Generates a QR code as a base64 data URL from employee data
 * Uses cedula as stable identifier (consistent across database resets)
 * @param {Object} employeeData - Employee object with id, cedula, nombre_completo, area, cargo
 * @returns {Promise<string>} Base64 data URL of the QR code
 */
const generateQR = async (employeeData) => {
  const qrData = {
    id: employeeData.id,
    cedula: employeeData.cedula,
    nombre: employeeData.nombre_completo,
    area: employeeData.area,
    cargo: employeeData.cargo
  };
  const qrDataString = JSON.stringify(qrData);
  return await QRCode.toDataURL(qrDataString);
};

/**
 * Generates QR data string for database storage (uses cedula as stable ID)
 * @param {string|number} cedula - Employee cedula (used as stable identifier)
 * @param {string} nombre_completo - Employee full name
 * @param {string} area - Employee area
 * @param {string} cargo - Employee position
 * @returns {string} JSON string of QR data
 */
const generateQRData = (cedula, nombre_completo, area, cargo) => {
  const qrData = {
    id: cedula,
    cedula: cedula,
    nombre: nombre_completo,
    area: area,
    cargo: cargo
  };
  return JSON.stringify(qrData);
};

module.exports = { generateQR, generateQRData };