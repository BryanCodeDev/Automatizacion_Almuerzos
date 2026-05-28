const Empleado = require('./empleado');
const RegistroAlmuerzo = require('./registroAlmuerzo');
const UsuarioSistema = require('./usuarioSistema');

// Define associations
RegistroAlmuerzo.belongsTo(Empleado, { foreignKey: 'empleado_id' });
RegistroAlmuerzo.belongsTo(UsuarioSistema, { foreignKey: 'registrado_por' });

module.exports = { Empleado, RegistroAlmuerzo, UsuarioSistema };