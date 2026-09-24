const { Client } = require('pg');
const client = new Client({ user: process.env.PGUSER || 'postgres', host: process.env.PGHOST || 'localhost', database: process.env.PGDATABASE || 'postgres', password: process.env.PGPASSWORD || 'postgres', port: process.env.PGPORT || 5432 });
async function run() {
  await client.connect();
  await client.query("DROP DATABASE IF EXISTS ecommerce_db WITH (FORCE);");
  await client.end();
}
run().catch(console.error);
