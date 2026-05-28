const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const RegistroAlmuerzo = sequelize.define('RegistroAlmuerzo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  registrado_por: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ticket_codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'registros_almuerzo',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RegistroAlmuerzo;