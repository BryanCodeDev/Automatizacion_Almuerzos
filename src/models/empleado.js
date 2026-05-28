const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Empleado = sequelize.define('Empleado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre_completo: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  area: {
    type: DataTypes.STRING(100)
  },
  cargo: {
    type: DataTypes.STRING(100)
  },
  qr_data: {
    type: DataTypes.TEXT
  },
  qr_imagen: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'empleados',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Empleado;