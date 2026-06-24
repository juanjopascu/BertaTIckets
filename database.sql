-- database.sql
CREATE DATABASE crm_db;

-- Conéctate a la base de datos crm_db antes de ejecutar lo siguiente:
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    empresa VARCHAR(100),
    estado_embudo VARCHAR(50) DEFAULT 'Prospecto' CHECK (estado_embudo IN ('Prospecto', 'Contactado', 'Negociación', 'Ganado', 'Perdido')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
