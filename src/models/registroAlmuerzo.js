const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const RegistroAlmuerzo = sequelize.define('RegistroAlmuerzo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
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

// Associations will be defined in index.js or after all models are loaded
module.exports = RegistroAlmuerzo;