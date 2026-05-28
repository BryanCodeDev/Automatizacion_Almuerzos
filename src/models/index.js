const Empleado = require('./empleado');
const RegistroAlmuerzo = require('./registroAlmuerzo');
const UsuarioSistema = require('./usuarioSistema');

// Associations
RegistroAlmuerzo.belongsTo(Empleado, { 
  foreignKey: 'empleado_id',
  as: 'empleado'
});
RegistroAlmuerzo.belongsTo(UsuarioSistema, { 
  foreignKey: 'registrado_por',
  as: 'registradoPor'
});

module.exports = { Empleado, RegistroAlmuerzo, UsuarioSistema };