const QRCode = require('qrcode');

/**
 * Generates a QR code as a base64 data URL from employee data
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

module.exports = { generateQR };