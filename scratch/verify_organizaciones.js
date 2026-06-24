const http = require('http');

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Iniciando verificación del Backend de Organizaciones y Manager ===');

  try {
    // Primero, creamos usuarios de prueba (un manager y dos clientes)
    console.log('\n1. Creando usuarios de prueba en el backend...');

    const managerUser = {
      nombre: 'Manager Test',
      email: 'manager_test@crm.com',
      password: 'managerpassword',
      rol: 'manager',
      crear_tickets: true
    };
    const c1User = {
      nombre: 'Cliente Test 1',
      email: 'cliente1_test@crm.com',
      password: 'clientepassword',
      rol: 'cliente',
      crear_tickets: true
    };
    const c2User = {
      nombre: 'Cliente Test 2',
      email: 'cliente2_test@crm.com',
      password: 'clientepassword',
      rol: 'cliente',
      crear_tickets: true
    };

    // Registrar en /api/usuarios
    await apiRequest('POST', '/api/usuarios', managerUser);
    await apiRequest('POST', '/api/usuarios', c1User);
    await apiRequest('POST', '/api/usuarios', c2User);
    console.log('Usuarios de prueba creados.');

    // 2. Crear una Organización
    console.log('\n2. Creando organización de prueba (POST /api/organizaciones)...');
    const orgPayload = {
      nombre: 'Organización Test S.A.',
      managers: ['manager_test@crm.com'],
      clientes: ['cliente1_test@crm.com', 'cliente2_test@crm.com']
    };
    const createOrgRes = await apiRequest('POST', '/api/organizaciones', orgPayload);
    console.log('Status:', createOrgRes.status);
    console.log('Organización creada:', JSON.stringify(createOrgRes.body, null, 2));

    if (createOrgRes.status !== 201 || !createOrgRes.body.id) {
      throw new Error('Error al crear la organización de prueba.');
    }
    const orgId = createOrgRes.body.id;

    // 3. Crear tickets para los clientes de prueba
    console.log('\n3. Creando tickets para los clientes (POST /api/clientes)...');
    const t1 = {
      nombre: 'Fallo de Red Cliente 1',
      email: 'cliente1_test@crm.com',
      empresa: 'Empresa Test 1',
      departamento: 1
    };
    const t2 = {
      nombre: 'Consulta de Factura Cliente 2',
      email: 'cliente2_test@crm.com',
      empresa: 'Empresa Test 2',
      departamento: 2
    };

    const t1Res = await apiRequest('POST', '/api/clientes', t1);
    const t2Res = await apiRequest('POST', '/api/clientes', t2);
    console.log('Ticket 1 Status:', t1Res.status);
    console.log('Ticket 2 Status:', t2Res.status);

    if (t1Res.status !== 201 || t2Res.status !== 201) {
      throw new Error('Error al crear los tickets de los clientes.');
    }
    const ticket1Id = t1Res.body.id;
    const ticket2Id = t2Res.body.id;

    // 4. Consultar mis-tickets con el email del manager
    console.log('\n4. Consultando tickets del Manager (GET /api/mis-tickets?email=manager_test@crm.com)...');
    const managerTicketsRes = await apiRequest('GET', '/api/mis-tickets?email=manager_test@crm.com');
    console.log('Status:', managerTicketsRes.status);
    console.log('Tickets del Manager encontrados:', managerTicketsRes.body.length);
    console.log('Títulos devueltos:', managerTicketsRes.body.map(t => t.nombre));

    // El manager debe poder ver ambos tickets de sus clientes organizacionales
    const hasT1 = managerTicketsRes.body.some(t => t.id === ticket1Id);
    const hasT2 = managerTicketsRes.body.some(t => t.id === ticket2Id);

    if (!hasT1 || !hasT2) {
      throw new Error('El manager no puede ver todos los tickets de su organización.');
    }
    console.log('✅ Verificación exitosa: El manager ve consolidados los tickets de su organización.');

    // 5. Eliminar la Organización de prueba
    console.log('\n5. Eliminando organización de prueba (DELETE /api/organizaciones/:id)...');
    const deleteOrgRes = await apiRequest('DELETE', `/api/organizaciones/${orgId}`);
    console.log('Status:', deleteOrgRes.status);
    console.log('Respuesta:', deleteOrgRes.body);

    if (deleteOrgRes.status !== 200) {
      throw new Error('Error al eliminar la organización.');
    }

    // 6. Consultar mis-tickets con el email del manager post-eliminación
    console.log('\n6. Consultando de nuevo tickets del Manager post-eliminación...');
    const managerTicketsPostRes = await apiRequest('GET', '/api/mis-tickets?email=manager_test@crm.com');
    console.log('Tickets del Manager tras desvinculación:', managerTicketsPostRes.body.length);

    if (managerTicketsPostRes.body.some(t => t.id === ticket1Id || t.id === ticket2Id)) {
      throw new Error('El manager sigue viendo tickets de los clientes tras eliminar la organización.');
    }
    console.log('✅ Verificación exitosa: El manager ya no visualiza tickets tras desvincular la organización.');

    // 7. Verificar el desacoplamiento: los tickets de los clientes deben seguir existiendo
    console.log('\n7. Confirmando que los tickets originales de clientes siguen intactos (Desacoplamiento)...');
    const c1TicketsRes = await apiRequest('GET', '/api/mis-tickets?email=cliente1_test@crm.com');
    const hasTicket1Intact = c1TicketsRes.body.some(t => t.id === ticket1Id);

    if (!hasTicket1Intact) {
      throw new Error('El ticket del cliente fue eliminado o alterado de forma errónea al eliminar la organización.');
    }
    console.log('✅ Verificación exitosa: Desacoplamiento de datos validado (tickets de clientes persisten).');

    console.log('\n🎉 ¡TODOS LOS TESTS DE ORGANIZACIONES Y ROLES PASARON CON ÉXITO! 🎉');

  } catch (error) {
    console.error('\n❌ ERROR EN LA VERIFICACIÓN DE ORGANIZACIONES:', error.message);
    process.exit(1);
  }
}

runTests();
