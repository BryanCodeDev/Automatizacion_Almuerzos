const { generateQR } = require('../utils/qrGenerator');
const sequelize = require('../database');
const Empleado = require('../models/empleado');
const UsuarioSistema = require('../models/usuarioSistema');
const RegistroAlmuerzo = require('../models/registroAlmuerzo');

const seedDatabase = async () => {
  try {
    RegistroAlmuerzo.belongsTo(Empleado, { foreignKey: 'empleado_id' });
    RegistroAlmuerzo.belongsTo(UsuarioSistema, { foreignKey: 'registrado_por' });
    
    await sequelize.sync({ force: true });
    console.log('Database synchronized for seeding');

    const adminHash1 = '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO';
    const adminHash2 = '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia';
    
    const adminUsers = [
      {
        nombre: 'Neidy Bustos',
        email: 'coordinador.administrativo@duvyclass.co',
        password_hash: adminHash1,
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Jhon Reyes',
        email: 'asistentesistemas@duvyclass.co',
        password_hash: adminHash1,
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Cesar Orozco',
        email: 'cesar.orozco@duvyclass.co',
        password_hash: adminHash1,
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Bryan Muñoz',
        email: 'admin@duvyclass.co',
        password_hash: adminHash1,
        rol: 'admin',
        activo: true
      }
    ];

    const operadorHash = '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia';

    const operadorUsers = [
      { nombre: 'Yohana Gil', email: 'yohana.gil@duvyclass.co', password_hash: operadorHash, rol: 'operador', activo: true },
    ];

    await UsuarioSistema.bulkCreate([...adminUsers, ...operadorUsers]);
    console.log('Usuarios del sistema creados:', [...adminUsers, ...operadorUsers].length);

    const fs = require('fs');
    const path = require('path');
    
    const empleadosSqlPath = path.join(__dirname, '../../empleados.sql');
    const empleadosSqlContent = fs.readFileSync(empleadosSqlPath, 'utf8');
    
    const empleadosLines = empleadosSqlContent.split('\n')
      .filter(line => line.trim().startsWith("('"))
      .map(line => {
        const match = line.match(/\('([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(TRUE|FALSE)\)/);
        if (match) {
          return {
            cedula: match[1],
            nombre_completo: match[2],
            area: match[3],
            cargo: match[4],
            qr_data: match[5],
            activo: match[6] === 'TRUE'
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log(`Empleados a crear desde empleados.sql: ${empleadosLines.length}`);

    for (const empleadoData of empleadosLines) {
      const qrData = {
        id: empleadoData.cedula,
        cedula: empleadoData.cedula,
        nombre: empleadoData.nombre_completo,
        area: empleadoData.area,
        cargo: empleadoData.cargo
      };

      const empleado = await Empleado.create({
        ...empleadoData,
        qr_data: JSON.stringify(qrData),
        activo: true
      });

      const qrImageBase64 = await generateQR({
        id: empleadoData.cedula,
        cedula: empleadoData.cedula,
        nombre_completo: empleadoData.nombre_completo,
        area: empleadoData.area,
        cargo: empleadoData.cargo
      });

      await empleado.update({
        qr_imagen: qrImageBase64.replace('data:image/png;base64,', '')
      });

      console.log(`Empleado creado: ${empleado.nombre_completo}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };