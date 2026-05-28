const sequelize = require('../database');
const Empleado = require('../models/empleado');
const RegistroAlmuerzo = require('../models/registroAlmuerzo');
const UsuarioSistema = require('../models/usuarioSistema');

// Define associations
Empleado.hasMany(RegistroAlmuerzo, { foreignKey: 'empleado_id', as: 'registros' });
RegistroAlmuerzo.belongsTo(Empleado, { foreignKey: 'empleado_id' });
RegistroAlmuerzo.belongsTo(UsuarioSistema, { foreignKey: 'registrado_por', as: 'registradoPor' });
UsuarioSistema.hasMany(RegistroAlmuerzo, { foreignKey: 'registrado_por', as: 'registros' });

const runMigrations = async () => {
  try {
    // Sync all models to the database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };