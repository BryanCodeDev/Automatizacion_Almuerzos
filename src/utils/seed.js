const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { sequelize } = require('../database');
const Empleado = require('../models/empleado');
const UsuarioSistema = require('../models/usuarioSistema');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // Clear database and recreate tables
    console.log('Database synchronized for seeding');

    // Create usuarios del sistema based on real data from users.sql
    // Password hashes are already bcrypt, so we can use them directly
    
    // Administrators (roleId 1 and 5 from source system)
    const adminHash1 = '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO'; // he5com22
    const adminHash2 = '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia'; // Duvy.2025
    
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

    // Operators (roleId 2,3,4,6,7 from source system - all map to our 'operador')
    const operadorHash = '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia'; // Duvy.2025
    
    const operadorUsers = [
      {
        nombre: 'Yohana Gil',
        email: 'yohana.gil@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Area De Calidad',
        email: 'analista.calidad@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Blanca Marcelo',
        email: 'jefe.bodegapt@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Laura Ruge',
        email: 'analista.compras@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Jimena Ponguta',
        email: 'analista.contable@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Sharoll Peñafiel',
        email: 'analista.facturacion1@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Gabriela Juyo',
        email: 'comercioexterior@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Heylen Naranjo',
        email: 'planeacion1@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Eliana Granados',
        email: 'analista.mercadeo@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Alvaro Chimbi',
        email: 'alvaro.chimbi@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Kelly Villareal',
        email: 'analista.talentohumano@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Cristian Enciso',
        email: 'callcenter1@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Nelson Vargas',
        email: 'servicioalcliente3@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Ambiental',
        email: 'gestionambiental@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Pilar Chaurra',
        email: 'tesoreria@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      },
      {
        nombre: 'Alexandro Cabrera',
        email: 'direccion.ventas@duvyclass.co',
        password_hash: operadorHash,
        rol: 'operador',
        activo: true
      }
    ];

    // Create all admin users
    for (const adminData of adminUsers) {
      await UsuarioSistema.create(adminData);
    }
    
    // Create all operator users
    for (const operadorData of operadorUsers) {
      await UsuarioSistema.create(operadorData);
    }

    console.log(`Usuarios del sistema creados: ${adminUsers.length + operadorUsers.length}`);

    // Create empleados de prueba (same as before)
    const empleadosData = [
      {
        cedula: '1001234567',
        nombre_completo: 'Juan Pérez González',
        area: 'Sistemas',
        cargo: 'Analista de Sistemas'
      },
      {
        cedula: '1002345678',
        nombre_completo: 'María López Herrera',
        area: 'Recursos Humanos',
        cargo: 'Asistente de RRHH'
      },
      {
        cedula: '1003456789',
        nombre_completo: 'Carlos Ramírez Silva',
        area: 'Finanzas',
        cargo: 'Contador'
      },
      {
        cedula: '1004567890',
        nombre_completo: 'Ana Martínez Ruiz',
        area: 'Mercadeo',
        cargo: 'Diseñadora Gráfica'
      },
      {
        cedula: '1005678901',
        nombre_completo: 'Luis Torres Vega',
        area: 'Operaciones',
        cargo: 'Supervisor de Producción'
      }
    ];

    for (const empleadoData of empleadosData) {
      // Generate QR data JSON using cedula as stable ID
      const qrData = {
        id: empleadoData.cedula,  // Use cedula as stable ID
        cedula: empleadoData.cedula,
        nombre: empleadoData.nombre_completo,
        area: empleadoData.area,
        cargo: empleadoData.cargo
      };

      // Create empleado with QR data
      const empleado = await Empleado.create({
        ...empleadoData,
        qr_data: JSON.stringify(qrData),
        activo: true
      });

      // Generate QR code image as base64
      const qrImageBase64 = await QRCode.toDataURL(JSON.stringify(qrData));

      // Update empleado with QR image
      await empleado.update({
        qr_imagen: qrImageBase64
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