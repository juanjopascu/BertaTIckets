const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

async function run() {
  try {
    await client.connect();
    console.log("Conectado a PostgreSQL principal...");
    try {
        await client.query('CREATE DATABASE ecommerce_db;');
        console.log("Base de datos ecommerce_db creada.");
    } catch (e) {
        if (e.code !== '42P04') { // Ignore database exists error
            console.error("Error creating database:", e);
        } else {
            console.log("La base de datos ecommerce_db ya existía.");
        }
    }
    await client.end();
    
    // Connect to the new database
    const client2 = new Client({
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: 'ecommerce_db',
        password: process.env.PGPASSWORD || 'postgres',
        port: process.env.PGPORT || 5432,
    });
    
    await client2.connect();
    console.log("Conectado a ecommerce_db. Ejecutando schema...");
    const schema = fs.readFileSync(path.join(__dirname, '../ecommerce_schema.sql'), 'utf8');
    await client2.query(schema);
    console.log("Schema ejecutado con éxito.");
    await client2.end();
  } catch (err) {
    console.error("Error de conexión/ejecución:", err.message);
  }
}

run();
