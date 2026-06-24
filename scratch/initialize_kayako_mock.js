// scratch/initialize_kayako_mock.js
// Script to programmatically generate a mock Kayako SQL dump and upload it to the running backend to initialize the import process.

const fs = require('fs');
const path = require('path');

// 1. Generate realistic mock Kayako SQL dump
const sqlContent = `
-- Mock Kayako Classic Database Export

-- 1. States (swticketstatuses)
INSERT INTO \`swticketstatuses\` (\`ticketstatusid\`, \`title\`) VALUES 
(10, 'Nuevo Pendiente'),
(20, 'En Investigación'),
(30, 'Esperando Cliente'),
(40, 'Resuelto DACAS');

-- 2. Departments (swdepartments)
INSERT INTO \`swdepartments\` (\`departmentid\`, \`parentdepartmentid\`, \`title\`, \`module\`) VALUES 
(101, 0, 'Soporte Networking dacas', 'tickets'),
(102, 0, 'Ciberseguridad dacas', 'tickets'),
(103, 0, 'Administracion General', 'tickets');

-- 3. Staff (swstaff)
INSERT INTO \`swstaff\` (\`staffid\`, \`staffgroupid\`, \`firstname\`, \`lastname\`, \`username\`, \`password\`, \`email\`, \`fullname\`) VALUES 
(201, 1, 'Andres', 'Gomez', 'agomez', 'hash', 'agomez@dacas.com', 'Andres Gomez'),
(202, 1, 'Sofia', 'Rodriguez', 'srodriguez', 'hash', 'srodriguez@dacas.com', 'Sofia Rodriguez'),
(203, 1, 'Martin', 'Peralta', 'mperalta', 'hash', 'mperalta@dacas.com', 'Martin Peralta');

-- 4. Tickets (swtickets)
INSERT INTO \`swtickets\` (\`ticketid\`, \`ticketmaskid\`, \`departmentid\`, \`ticketstatusid\`, \`email\`, \`fullname\`, \`subject\`, \`dateline\`, \`ownerstaffid\`, \`priorityid\`) VALUES 
(5001, 'DAC-10492', 101, 10, 'marcos.v@cliente.com', 'Marcos Villalba', 'Caída de enlace MPLS en Sucursal Rosario', 1716839400, 201, 4),
(5002, 'DAC-10493', 102, 20, 'lucas.m@seguridad.com', 'Lucas Martino', 'Alerta de ransomware detectada en servidor VPN', 1716843000, 202, 3),
(5003, 'DAC-10494', 103, 30, 'contabilidad@partner.com', 'Clara Benitez', 'Consulta por facturación de licencias Fortinet', 1716845000, 203, 1);

-- 5. Conversation History (swticketposts)
INSERT INTO \`swticketposts\` (\`ticketpostid\`, \`ticketid\`, \`dateline\`, \`fullname\`, \`email\`, \`contents\`, \`creator\`) VALUES 
(9001, 5001, 1716839400, 'Marcos Villalba', 'marcos.v@cliente.com', 'Hola, desde las 17:00 hs nos quedamos sin conexión en la sucursal de Rosario. ¿Pueden revisar el router perimetral?', 2),
(9002, 5001, 1716840600, 'Andres Gomez', 'agomez@dacas.com', 'Buenas tardes Marcos, iniciamos diagnóstico sobre el equipo. Vemos una caída física del puerto del proveedor. Procedemos a escalar a la operadora telefónica.', 1),
(9003, 5002, 1716843000, 'Lucas Martino', 'lucas.m@seguridad.com', 'Detectamos múltiples intentos fallidos de Login y firmas sospechosas en el firewall VPN.', 2),
(9004, 5002, 1716844200, 'Sofia Rodriguez', 'srodriguez@dacas.com', 'Hola Lucas, hemos bloqueado la IP de origen y activamos el doble factor de autenticación de emergencia.', 1),
(9005, 5003, 1716845000, 'Clara Benitez', 'contabilidad@partner.com', 'Buenas tardes, adjunto constancia para la facturación de este mes.', 2);
`;

const tempFilePath = path.join(__dirname, 'kayako_mock_dump.sql');
fs.writeFileSync(tempFilePath, sqlContent, 'utf8');
console.log(`✅ Archivo SQL temporal creado con éxito en: ${tempFilePath}`);

// 2. Perform upload to the running Express server
async function performImport() {
  try {
    const port = process.env.PORT || 3001;
    const url = `http://localhost:${port}/api/importar-kayako/subir-sql`;
    
    console.log(`🚀 Conectando con el servidor en ${url}...`);

    // Standard Node Form-Data creation for native fetch
    const fileBuffer = fs.readFileSync(tempFilePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    let payload = `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="sqlFile"; filename="kayako_mock_dump.sql"\r\n`;
    payload += `Content-Type: application/octet-stream\r\n\r\n`;
    
    const headerBuffer = Buffer.from(payload, 'utf8');
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const requestBody = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': requestBody.length
      },
      body: requestBody
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Fallo en la importación');
    }

    console.log('\n🎉 ¡IMPORTACIÓN COMPLETADA CON ÉXITO DESDE EL MOCK DE KAYAKO!');
    console.log('--------------------------------------------------');
    console.log(`🏢 Departamentos Importados: ${data.estadisticas.departamentos}`);
    console.log(`👤 Agentes (Staff) Importados: ${data.estadisticas.agentes}`);
    console.log(`📋 Tickets Importados: ${data.estadisticas.tickets}`);
    console.log(`💬 Respuestas de Chat Importadas: ${data.estadisticas.notas}`);
    console.log('--------------------------------------------------');
    console.log('Ya puedes ver toda la información en tiempo real en la web: http://localhost:5173/\n');
  } catch (err) {
    console.error('\n❌ Error al procesar la importación en el backend:', err.message);
    console.error('Asegúrate de que el servidor backend de Express esté corriendo en http://localhost:3001');
  } finally {
    // Clean up temporary SQL file
    try {
      fs.unlinkSync(tempFilePath);
      console.log('🧹 Limpieza completada: Archivo SQL temporal removido.');
    } catch (e) {}
  }
}

// Start import
performImport();
