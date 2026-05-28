-- Sistema de Gestión de Almuerzos Corporativos
-- Script de creación de base de datos MySQL

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS almuerzos_db;
USE almuerzos_db;

-- Tabla: empleados
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    area VARCHAR(100),
    cargo VARCHAR(100),
    qr_data TEXT,
    qr_imagen LONGTEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: usuarios_sistema
CREATE TABLE usuarios_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: registros_almuerzo
CREATE TABLE registros_almuerzo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empleado_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    registrado_por INT NOT NULL,
    ticket_codigo VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES usuarios_sistema(id),
    UNIQUE KEY unico_empleado_fecha (empleado_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales para mejor rendimiento
CREATE INDEX idx_registros_fecha ON registros_almuerzo(fecha);
CREATE INDEX idx_registros_empleado ON registros_almuerzo(empleado_id);
CREATE INDEX idx_empleados_activo ON empleados(activo);
CREATE INDEX idx_usuarios_activo ON usuarios_sistema(activo);

-- Comentario sobre las tablas
-- empleados: almacena información de los empleados y sus códigos QR
-- usuarios_sistema: almacena usuarios del sistema con roles (admin/operador)
-- registros_almuerzo: almacena cada almuerzo recibido por empleado (máximo 1 por día)
