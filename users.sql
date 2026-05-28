-- Sistema de Gestión de Almuerzos Corporativos
-- Script adaptado desde users.sql original para poblar únicamente la tabla de usuarios del sistema
-- Los empleados se gestionan a través de la interfaz de administración o con datos de prueba

USE almuerzos_db;

-- =============================================
-- TABLA: usuarios_sistema (para login al sistema)
-- =============================================
-- Mapeo de roles desde el sistema original:
--   roleId 1, 5 (Administrador, Coordinadora Administrativa) -> 'admin'
--   Todos los demás roleId -> 'operador'

-- Eliminar datos existentes (opcional, para ejecutar en limpio)
-- TRUNCATE TABLE usuarios_sistema;

-- INSERTAR USUARIOS DEL SISTEMA (usuarios_sistema)
INSERT INTO usuarios_sistema (nombre, email, password_hash, rol, activo) VALUES
-- ADMINISTRADORES (roleId 1 y 5 del sistema original - contraseña: he5com22)
('Neidy Bustos', 'coordinador.administrativo@duvyclass.co', '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO', 'admin', TRUE),
('Jhon Reyes', 'asistentesistemas@duvyclass.co', '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO', 'admin', TRUE),
('Cesar Orozco', 'cesar.orozco@duvyclass.co', '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO', 'admin', TRUE),
('Bryan Muñoz', 'admin@duvyclass.co', '$2b$10$lwOD6DslfvQHW1OnUwMOpet/E745WOLOi4SG8wMOf5vlaWz0fxUdO', 'admin', TRUE),

-- OPERADORES (todos los demás roleId del sistema original - contraseña: Duvy.2025)
('Yohana Gil', 'yohana.gil@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Area De Calidad', 'analista.calidad@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Blanca Marcelo', 'jefe.bodegapt@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Laura Ruge', 'analista.compras@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Jimena Ponguta', 'analista.contable@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Sharoll Peñafiel', 'analista.facturacion1@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Gabriela Juyo', 'comercioexterior@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Heylen Naranjo', 'planeacion1@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Eliana Granados', 'analista.mercadeo@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Alvaro Chimbi', 'alvaro.chimbi@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Kelly Villareal', 'analista.talentohumano@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Cristian Enciso', 'callcenter1@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Nelson Vargas', 'servicioalcliente3@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Ambiental', 'gestionambiental@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Pilar Chaurra', 'tesoreria@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE),
('Alexandro Cabrera', 'direccion.ventas@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE);