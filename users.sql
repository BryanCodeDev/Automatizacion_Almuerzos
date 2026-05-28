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
('Yohana Gil', 'yohana.gil@duvyclass.co', '$2b$10$vwFSFoRi7xmftzs7oiv6Z.GZml2YhWi64.HzjZfmwYxNrGtxpgLia', 'operador', TRUE);