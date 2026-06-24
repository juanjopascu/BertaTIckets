const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function hashPassword(password) {
    if (!password) return '';
    return crypto.createHash('sha256').update(password).digest('hex');
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para guardar archivos en /uploads con límites de tamaño
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // Límite estricto de 15 MB por archivo
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.sql'];
        if (!allowed.includes(ext)) {
            return cb(new Error('Tipo de archivo no permitido. Solo se admiten PDFs, imágenes (JPG, PNG), planillas Excel (XLS, XLSX) y archivos SQL (.sql).'));
        }
        cb(null, true);
    }
});

// Middleware helper para manejar las subidas múltiples y capturar errores de tamaño de archivo de Multer
function handleUpload(field, maxCount = 15) {
    const multerUpload = upload.array(field, maxCount);
    return function (req, res, next) {
        multerUpload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Uno o más archivos exceden el tamaño máximo permitido de 15 MB.' });
                }
                return res.status(400).json({ error: `Error en la subida de archivos: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
}

// ==========================================
// BASE DE DATOS EN MEMORIA
// ==========================================
let departamentosDb = [
    { id: 1, nombre: "General", sla_horas: 24 },
    { id: 2, nombre: "Ventas", sla_horas: 12 },
    { id: 3, nombre: "Soporte Técnico", sla_horas: 4 },
    { id: 4, nombre: "Operaciones", sla_horas: 24 },
    { id: 5, nombre: "Expenses", sla_horas: 24 },
    { id: 6, nombre: "Travels", sla_horas: 24 }
];
let nextDepartamentoId = 7;

let estadosDb = [
    { id: 1, nombre: "Prospecto", sla_horas: 24 },
    { id: 2, nombre: "Contactado", sla_horas: 48 },
    { id: 3, nombre: "Negociación", sla_horas: 72 },
    { id: 4, nombre: "Ganado", sla_horas: 24 },
    { id: 5, nombre: "Perdido", sla_horas: 24 }
];
let nextEstadoId = 6;

let configTicketsDb = {
    habilitarNuevoTicketProcesos: true,
    habilitarReintegroGastos: true,
    habilitarReservaViajes: true
};

let clientesDb = [
    {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        telefono: "12345678",
        empresa: "Tech Corp",
        estado_embudo: "Negociación",
        departamento: 2,
        prioridad: "Normal",
        archivo_url: null,
        notas: [],
        asignado_a: "Staff de Prueba",
        creado_en: new Date(Date.now() - 72 * 60 * 60 * 1000), // Hace 3 días
        creado_por: "juan@ejemplo.com",
        actualizado_en: new Date(Date.now() - 12 * 60 * 60 * 1000),
        historial_estados: [
            { estado: "Prospecto", desde: new Date(Date.now() - 72 * 60 * 60 * 1000), hasta: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            { estado: "Contactado", desde: new Date(Date.now() - 48 * 60 * 60 * 1000), hasta: new Date(Date.now() - 12 * 60 * 60 * 1000) },
            { estado: "Negociación", desde: new Date(Date.now() - 12 * 60 * 60 * 1000), hasta: null }
        ],
        historial_asignados: [
            { asignado_a: null, desde: new Date(Date.now() - 72 * 60 * 60 * 1000), hasta: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            { asignado_a: "Staff de Prueba", desde: new Date(Date.now() - 48 * 60 * 60 * 1000), hasta: null }
        ],
        historial_departamentos: [
            { departamento: 2, desde: new Date(Date.now() - 72 * 60 * 60 * 1000), hasta: null }
        ]
    },
    {
        id: 2,
        nombre: "María García",
        email: "maria@ejemplo.com",
        telefono: "87654321",
        empresa: "Innovate SA",
        estado_embudo: "Contactado",
        departamento: 3, // Soporte Técnico (SLA de 4 horas - Incumplido)
        prioridad: "Alta",
        archivo_url: null,
        notas: [],
        asignado_a: "Administrador",
        creado_en: new Date(Date.now() - 6 * 60 * 60 * 1000), // Hace 6 horas (Excedió el SLA de 4 horas)
        creado_por: "maria@ejemplo.com",
        actualizado_en: new Date(Date.now() - 4 * 60 * 60 * 1000),
        historial_estados: [
            { estado: "Prospecto", desde: new Date(Date.now() - 6 * 60 * 60 * 1000), hasta: new Date(Date.now() - 4 * 60 * 60 * 1000) },
            { estado: "Contactado", desde: new Date(Date.now() - 4 * 60 * 60 * 1000), hasta: null }
        ],
        historial_asignados: [
            { asignado_a: "Administrador", desde: new Date(Date.now() - 6 * 60 * 60 * 1000), hasta: null }
        ],
        historial_departamentos: [
            { departamento: 3, desde: new Date(Date.now() - 6 * 60 * 60 * 1000), hasta: null }
        ]
    },
    {
        id: 3,
        nombre: "Carlos López",
        email: "carlos@ejemplo.com",
        telefono: "55588822",
        empresa: "Servicios CL",
        estado_embudo: "Ganado",
        departamento: 3, // Soporte Técnico (Resuelto en 2 horas - Cumplido)
        prioridad: "Baja",
        archivo_url: null,
        notas: [],
        asignado_a: "Staff de Prueba",
        creado_en: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 24 horas
        creado_por: "carlos@ejemplo.com",
        actualizado_en: new Date(Date.now() - 22 * 60 * 60 * 1000),
        historial_estados: [
            { estado: "Prospecto", desde: new Date(Date.now() - 24 * 60 * 60 * 1000), hasta: new Date(Date.now() - 22 * 60 * 60 * 1000) },
            { estado: "Ganado", desde: new Date(Date.now() - 22 * 60 * 60 * 1000), hasta: null }
        ],
        historial_asignados: [
            { asignado_a: "Staff de Prueba", desde: new Date(Date.now() - 24 * 60 * 60 * 1000), hasta: null }
        ],
        historial_departamentos: [
            { departamento: 3, desde: new Date(Date.now() - 24 * 60 * 60 * 1000), hasta: null }
        ]
    }
];
let nextClienteId = 4;

let usuariosDb = [
    { id: 1, nombre: "Administrador", email: "admin@crm.com", password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", rol: "admin", crear_tickets: true, activo: true, pais: "Argentina", sector: "Administración", horario_atencion: "24/7", ciudad: "Buenos Aires" },
    { id: 2, nombre: "Cliente de Prueba", email: "cliente@crm.com", password: "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446", rol: "cliente", crear_tickets: true, activo: true, pais: "Chile", sector: "Compras", horario_atencion: "09:00 - 18:00", ciudad: "Santiago" },
    { id: 3, nombre: "Staff de Prueba", email: "staff@crm.com", password: "1562206543da764123c21bd524674f0a8aaf49c8a89744c97352fe677f7e4006", rol: "staff", crear_tickets: true, activo: true, accesos: { departamentos: [2], estados: ["Prospecto", "Contactado"] }, equipoId: 1, pais: "Uruguay", sector: "Soporte Técnico", horario_atencion: "08:00 - 17:00", ciudad: "Montevideo" },
    { id: 4, nombre: "Manager de Prueba", email: "manager@crm.com", password: "6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17", rol: "manager", crear_tickets: true, activo: true, pais: "Argentina", sector: "Operaciones", horario_atencion: "09:00 - 18:00", ciudad: "Buenos Aires" },
    { id: 5, nombre: "Juan Pascuzzi", email: "jpascuzzi@dacas.com", password: "66c5b8883a78c8a041d08a8b0906eb0208235f93a86ab913f276aba2d64e3cd9", rol: "admin", crear_tickets: true, activo: true, pais: "Argentina", sector: "Dirección", horario_atencion: "24/7", ciudad: "Buenos Aires" }
];
let nextUsuarioId = 6;

// Hashear contraseñas iniciales al arranque del servidor
usuariosDb.forEach(u => {
    if (u.password && u.password.length < 64) {
        u.password = hashPassword(u.password);
    }
});

let nextAccionId = 1;
function registrarAccionTicket(ticketId, accion, detalle, usuarioStr) {
    const ticket = clientesDb.find(c => c.id === ticketId);
    if (!ticket) return;

    if (!ticket.auditoria_acciones) {
        ticket.auditoria_acciones = [];
    }

    ticket.auditoria_acciones.push({
        id: nextAccionId++,
        accion,
        detalle,
        usuario: usuarioStr || 'Sistema',
        fecha: new Date().toISOString()
    });
}

// Inicializar bitácora de auditoría para los tickets iniciales al arranque
clientesDb.forEach(c => {
    if (!c.auditoria_acciones) {
        const depto = departamentosDb.find(d => d.id === c.departamento);
        c.auditoria_acciones = [
            {
                id: nextAccionId++,
                accion: "Creación",
                detalle: `Ticket creado y asignado al departamento "${depto ? depto.nombre : 'General'}" en estado "${c.estado_embudo}"`,
                usuario: c.creado_por || "cliente@crm.com",
                fecha: c.creado_en ? new Date(c.creado_en).toISOString() : new Date().toISOString()
            }
        ];

        // Agregar también histórico de notas si las hay
        if (c.notas && c.notas.length > 0) {
            c.notas.forEach(n => {
                c.auditoria_acciones.push({
                    id: nextAccionId++,
                    accion: "Comentario",
                    detalle: `Nueva respuesta/nota registrada en el ticket.`,
                    usuario: n.autor || "Sistema",
                    fecha: n.creado_en ? new Date(n.creado_en).toISOString() : new Date().toISOString()
                });
            });
        }
    }
});

// ==========================================
// BASE DE DATOS EN MEMORIA - EQUIPOS
// ==========================================
let equiposDb = [
    { id: 1, nombre: "Equipo Soporte Técnico", miembros: ["staff@crm.com"] }
];
let nextEquipoId = 2;

// Función helper para sincronizar bidireccionalmente los miembros de equiposDb y el equipoId en usuariosDb
function sincronizarMiembroEquipo(userEmail, equipoId, userRol) {
    const emailLower = userEmail.toLowerCase();

    // Primero remover de todos los equipos
    equiposDb.forEach(e => {
        e.miembros = e.miembros.filter(m => m.toLowerCase() !== emailLower);
    });

    // Si el rol es staff y tiene un equipo válido asignado, agregarlo
    if (userRol === 'staff' && equipoId) {
        const equipo = equiposDb.find(e => e.id === parseInt(equipoId));
        if (equipo) {
            if (!equipo.miembros.some(m => m.toLowerCase() === emailLower)) {
                equipo.miembros.push(emailLower);
            }
        }
    }
}

// ==========================================
// BASE DE DATOS EN MEMORIA - ORGANIZACIONES
// ==========================================
let organizacionesDb = [
    {
        id: 1,
        nombre: "Dacas Corporativo",
        managers: ["manager@crm.com"],
        clientes: ["cliente@crm.com", "juan@ejemplo.com"],
        departamentoId: null
    }
];
let nextOrganizacionId = 2;


// ==========================================
// ENDPOINTS DE DEPARTAMENTOS
// ==========================================

app.get('/api/departamentos', (req, res) => {
    res.status(200).json(departamentosDb);
});

app.post('/api/departamentos', (req, res) => {
    const { nombre, sla_horas } = req.body;
    if (!nombre || nombre.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio.' });
    if (departamentosDb.find(d => d.nombre.toLowerCase() === nombre.toLowerCase())) return res.status(400).json({ error: 'El departamento ya existe.' });
    const nuevo = { id: nextDepartamentoId++, nombre: nombre.trim(), sla_horas: sla_horas ? parseInt(sla_horas) : 24 };
    departamentosDb.push(nuevo);
    res.status(201).json(nuevo);
});

app.put('/api/departamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, sla_horas } = req.body;

    const index = departamentosDb.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Departamento no encontrado.' });

    if (nombre) {
        if (nombre.trim() === '') return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
        const duplicado = departamentosDb.find(d => d.nombre.toLowerCase() === nombre.toLowerCase() && d.id !== id);
        if (duplicado) return res.status(400).json({ error: 'Ya existe otro departamento con ese nombre.' });

        if (id === 1 && nombre.trim().toLowerCase() !== "general") {
            return res.status(403).json({ error: 'No se puede renombrar el departamento General.' });
        }
        departamentosDb[index].nombre = nombre.trim();
    }

    if (sla_horas !== undefined) {
        departamentosDb[index].sla_horas = parseInt(sla_horas);
    }

    res.status(200).json(departamentosDb[index]);
});

app.delete('/api/departamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = departamentosDb.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Departamento no encontrado.' });
    if (id === 1) return res.status(403).json({ error: 'No puedes borrar el departamento General.' });

    const deletedDepto = departamentosDb[index];
    const oldDeptoName = deletedDepto ? deletedDepto.nombre : 'Eliminado';

    clientesDb.forEach(c => {
        if (c.departamento === id) {
            c.departamento = 1;
            let historial_departamentos = c.historial_departamentos ? [...c.historial_departamentos] : [];
            if (historial_departamentos.length > 0) {
                historial_departamentos[historial_departamentos.length - 1] = {
                    ...historial_departamentos[historial_departamentos.length - 1],
                    hasta: new Date()
                };
            } else {
                historial_departamentos.push({
                    departamento: id,
                    desde: c.creado_en || new Date(),
                    hasta: new Date()
                });
            }
            historial_departamentos.push({
                departamento: 1,
                desde: new Date(),
                hasta: null
            });
            c.historial_departamentos = historial_departamentos;
            c.actualizado_en = new Date();

            registrarAccionTicket(
                c.id,
                "Transferencia",
                `Departamento cambiado: ${oldDeptoName} ➡️ General (por eliminación de departamento)`,
                "Sistema"
            );
        }
    });

    departamentosDb.splice(index, 1);
    res.status(200).json({ mensaje: "Departamento eliminado" });
});

// ==========================================
// ENDPOINTS DE ESTADOS
// ==========================================

app.get('/api/estados', (req, res) => {
    res.status(200).json(estadosDb);
});

app.post('/api/estados', (req, res) => {
    const { nombre, sla_horas } = req.body;
    if (!nombre || nombre.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio.' });
    if (estadosDb.find(e => e.nombre.toLowerCase() === nombre.toLowerCase())) return res.status(400).json({ error: 'El estado ya existe.' });
    const nuevo = { id: nextEstadoId++, nombre: nombre.trim(), sla_horas: sla_horas ? parseInt(sla_horas) : 24 };
    estadosDb.push(nuevo);
    res.status(201).json(nuevo);
});

app.put('/api/estados/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, sla_horas } = req.body;

    const index = estadosDb.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'Estado no encontrado.' });

    if (nombre) {
        if (nombre.trim() === '') return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
        const duplicado = estadosDb.find(e => e.nombre.toLowerCase() === nombre.toLowerCase() && e.id !== id);
        if (duplicado) return res.status(400).json({ error: 'Ya existe otro estado con ese nombre.' });

        if ((id === 1 || estadosDb[index].nombre === "Prospecto") && nombre.trim().toLowerCase() !== "prospecto") {
            return res.status(403).json({ error: 'No se puede renombrar el estado por defecto Prospecto.' });
        }
        estadosDb[index].nombre = nombre.trim();
    }

    if (sla_horas !== undefined) {
        estadosDb[index].sla_horas = parseInt(sla_horas);
    }

    res.status(200).json(estadosDb[index]);
});

app.delete('/api/estados/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = estadosDb.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'Estado no encontrado.' });

    // Evitar borrar el primer estado por defecto para evitar problemas con prospectos huérfanos
    if (id === 1 || estadosDb[index].nombre === "Prospecto") return res.status(403).json({ error: 'No puedes borrar el estado por defecto (Prospecto).' });

    // Actualizar clientes que tenían este estado al estado por defecto
    const nombreEstadoBorrado = estadosDb[index].nombre;
    clientesDb.forEach(c => {
        if (c.estado_embudo === nombreEstadoBorrado) c.estado_embudo = "Prospecto";
    });

    estadosDb.splice(index, 1);
    res.status(200).json({ mensaje: "Estado eliminado" });
});

// ==========================================
// ENDPOINTS DE CONFIGURACIÓN DE TICKETS
// ==========================================
app.get('/api/config-tickets', (req, res) => {
    res.status(200).json(configTicketsDb);
});

app.post('/api/config-tickets', (req, res) => {
    const { habilitarNuevoTicketProcesos, habilitarReintegroGastos, habilitarReservaViajes } = req.body;

    if (habilitarNuevoTicketProcesos !== undefined) configTicketsDb.habilitarNuevoTicketProcesos = !!habilitarNuevoTicketProcesos;
    if (habilitarReintegroGastos !== undefined) configTicketsDb.habilitarReintegroGastos = !!habilitarReintegroGastos;
    if (habilitarReservaViajes !== undefined) configTicketsDb.habilitarReservaViajes = !!habilitarReservaViajes;

    res.status(200).json(configTicketsDb);
});

// ==========================================
// BASE DE DATOS DE SESIONES Y AUTENTICACIÓN
// ==========================================
let sesionesActivas = [];

function getClientIp(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    let cleanIp = typeof ip === 'string' ? ip : 'Desconocida';
    if (cleanIp.includes(',')) {
        cleanIp = cleanIp.split(',')[0].trim();
    }
    if (cleanIp === '::1' || cleanIp === '::ffff:127.0.0.1') {
        cleanIp = '127.0.0.1';
    } else if (cleanIp.startsWith('::ffff:')) {
        cleanIp = cleanIp.substring(7);
    }
    return cleanIp;
}

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const hashed = hashPassword(password);
    const usuario = usuariosDb.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashed);

    if (usuario) {
        if (usuario.activo === false) {
            return res.status(403).json({ error: "Tu cuenta ha sido deshabilitada por un administrador." });
        }
        const sesionId = crypto.randomBytes(32).toString('hex');
        const ip = getClientIp(req);

        // Registrar sesión activa
        sesionesActivas.push({
            id: sesionId,
            usuarioId: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            ip: ip,
            loginAt: new Date().toISOString()
        });

        res.status(200).json({
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                accesos: usuario.accesos,
                equipoId: usuario.equipoId || null,
                crear_tickets: usuario.crear_tickets !== false,
                activo: usuario.activo !== false,
                pais: usuario.pais || '',
                sector: usuario.sector || '',
                horario_atencion: usuario.horario_atencion || '',
                ciudad: usuario.ciudad || '',
                sesionId: sesionId
            }
        });
    } else {
        res.status(401).json({ error: "Credenciales inválidas" });
    }
});

app.post('/api/login-microsoft', (req, res) => {
    const { email, nombre } = req.body;

    // Buscar si el correo de Microsoft ya está registrado como usuario válido
    const usuario = usuariosDb.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (usuario) {
        if (usuario.activo === false) {
            return res.status(403).json({ error: "Tu cuenta ha sido deshabilitada por un administrador." });
        }
        const sesionId = crypto.randomBytes(32).toString('hex');
        const ip = getClientIp(req);

        // Registrar sesión activa
        sesionesActivas.push({
            id: sesionId,
            usuarioId: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            ip: ip,
            loginAt: new Date().toISOString()
        });

        res.status(200).json({
            mensaje: "Login exitoso con Microsoft",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                accesos: usuario.accesos,
                equipoId: usuario.equipoId || null,
                crear_tickets: usuario.crear_tickets !== false,
                activo: usuario.activo !== false,
                pais: usuario.pais || '',
                sector: usuario.sector || '',
                horario_atencion: usuario.horario_atencion || '',
                ciudad: usuario.ciudad || '',
                sesionId: sesionId
            }
        });
    } else {
        res.status(403).json({ error: "Este correo de Microsoft no tiene acceso a Berta Ticket." });
    }
});


app.get('/api/usuarios', (req, res) => {
    const seguros = usuariosDb.map(u => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        accesos: u.accesos,
        equipoId: u.equipoId || null,
        crear_tickets: u.crear_tickets !== false,
        activo: u.activo !== false,
        pais: u.pais || '',
        sector: u.sector || '',
        horario_atencion: u.horario_atencion || '',
        ciudad: u.ciudad || ''
    }));
    res.status(200).json(seguros);
});

app.post('/api/usuarios', (req, res) => {
    const { nombre, email, password, rol, accesos, equipoId, crear_tickets, activo, pais, sector, horario_atencion, ciudad } = req.body;
    if (usuariosDb.find(u => u.email === email)) return res.status(400).json({ error: 'El email ya está en uso por otro usuario.' });
    const nuevoUsuario = {
        id: nextUsuarioId++,
        nombre,
        email,
        password: hashPassword(password),
        rol: rol || 'cliente',
        crear_tickets: crear_tickets !== false,
        activo: activo !== false,
        pais: pais || '',
        sector: sector || '',
        horario_atencion: horario_atencion || '',
        ciudad: ciudad || ''
    };
    if (nuevoUsuario.rol === 'staff') {
        nuevoUsuario.accesos = accesos || { departamentos: [], estados: [] };
        nuevoUsuario.equipoId = equipoId ? parseInt(equipoId) : null;
    }
    usuariosDb.push(nuevoUsuario);

    if (nuevoUsuario.rol === 'staff' && nuevoUsuario.equipoId) {
        sincronizarMiembroEquipo(nuevoUsuario.email, nuevoUsuario.equipoId, nuevoUsuario.rol);
    }

    res.status(201).json({
        id: nuevoUsuario.id,
        nombre,
        email,
        rol: nuevoUsuario.rol,
        accesos: nuevoUsuario.accesos,
        equipoId: nuevoUsuario.equipoId || null,
        crear_tickets: nuevoUsuario.crear_tickets,
        activo: nuevoUsuario.activo,
        pais: nuevoUsuario.pais,
        sector: nuevoUsuario.sector,
        horario_atencion: nuevoUsuario.horario_atencion,
        ciudad: nuevoUsuario.ciudad
    });
});

app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, email, password, rol, accesos, equipoId, crear_tickets, activo, pais, sector, horario_atencion, ciudad } = req.body;

    const index = usuariosDb.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

    if (id === 1 && rol !== 'admin') {
        return res.status(403).json({ error: 'No se puede quitar el rol de administrador al administrador principal.' });
    }

    if (id === 1 && activo === false) {
        return res.status(403).json({ error: 'No se puede deshabilitar al administrador principal.' });
    }

    const emailEnUso = usuariosDb.find(u => u.email === email && u.id !== id);
    if (emailEnUso) return res.status(400).json({ error: 'El email ya está en uso por otro usuario.' });

    const viejoEmail = usuariosDb[index].email;
    const viejoRol = usuariosDb[index].rol;
    const nuevoRol = rol || usuariosDb[index].rol;
    const nuevoEquipoId = nuevoRol === 'staff' ? (equipoId ? parseInt(equipoId) : null) : null;

    usuariosDb[index] = {
        ...usuariosDb[index],
        nombre,
        email,
        password: password ? hashPassword(password) : usuariosDb[index].password,
        rol: nuevoRol,
        crear_tickets: crear_tickets !== false,
        activo: id === 1 ? true : (activo !== false),
        pais: pais !== undefined ? pais : (usuariosDb[index].pais || ''),
        sector: sector !== undefined ? sector : (usuariosDb[index].sector || ''),
        horario_atencion: horario_atencion !== undefined ? horario_atencion : (usuariosDb[index].horario_atencion || ''),
        ciudad: ciudad !== undefined ? ciudad : (usuariosDb[index].ciudad || '')
    };

    if (usuariosDb[index].rol === 'staff') {
        usuariosDb[index].accesos = accesos || { departamentos: [], estados: [] };
        usuariosDb[index].equipoId = nuevoEquipoId;
    } else {
        delete usuariosDb[index].accesos;
        delete usuariosDb[index].equipoId;
    }

    // Si se deshabilita el usuario, se remueve su sesión activa de inmediato
    if (usuariosDb[index].activo === false) {
        sesionesActivas = sesionesActivas.filter(s => s.usuarioId !== id);
    }

    // Sincronizar en equiposDb
    if (viejoEmail.toLowerCase() !== email.toLowerCase()) {
        equiposDb.forEach(e => {
            e.miembros = e.miembros.filter(m => m.toLowerCase() !== viejoEmail.toLowerCase());
        });
    }
    sincronizarMiembroEquipo(email, nuevoEquipoId, nuevoRol);

    res.status(200).json({
        id: usuariosDb[index].id,
        nombre,
        email,
        rol: usuariosDb[index].rol,
        accesos: usuariosDb[index].accesos,
        equipoId: usuariosDb[index].equipoId || null,
        crear_tickets: usuariosDb[index].crear_tickets,
        activo: usuariosDb[index].activo,
        pais: usuariosDb[index].pais,
        sector: usuariosDb[index].sector,
        horario_atencion: usuariosDb[index].horario_atencion,
        ciudad: usuariosDb[index].ciudad
    });
});

app.delete('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id === 1) return res.status(403).json({ error: 'No se puede eliminar al administrador principal.' });
    const index = usuariosDb.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

    // Remover de equiposDb
    const usuarioABorrar = usuariosDb[index];
    equiposDb.forEach(e => {
        e.miembros = e.miembros.filter(m => m.toLowerCase() !== usuarioABorrar.email.toLowerCase());
    });

    // Remover de sesiones activas de inmediato
    sesionesActivas = sesionesActivas.filter(s => s.usuarioId !== id);

    usuariosDb.splice(index, 1);
    res.status(200).json({ mensaje: "Usuario eliminado" });
});

// ==========================================
// ENDPOINTS DE CONTROL DE SESIONES ACTIVAS
// ==========================================

app.get('/api/admin/sesiones', (req, res) => {
    res.status(200).json(sesionesActivas);
});

// Endpoint global para obtener toda la bitácora de auditoría consolidada
app.get('/api/admin/auditoria-acciones', (req, res) => {
    let todasAcciones = [];
    clientesDb.forEach(ticket => {
        if (ticket.auditoria_acciones) {
            ticket.auditoria_acciones.forEach(accion => {
                todasAcciones.push({
                    ...accion,
                    ticketId: ticket.id,
                    ticketNombre: ticket.nombre,
                    ticketEmail: ticket.email
                });
            });
        }
    });
    // Ordenar de forma descendente por fecha
    todasAcciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.status(200).json(todasAcciones);
});

app.post('/api/admin/desconectar', (req, res) => {
    const { sesionId } = req.body;
    if (!sesionId) return res.status(400).json({ error: 'Falta ID de sesión.' });

    const index = sesionesActivas.findIndex(s => s.id === sesionId);
    if (index !== -1) {
        sesionesActivas.splice(index, 1);
        res.status(200).json({ mensaje: "Usuario desconectado con éxito." });
    } else {
        res.status(404).json({ error: "Sesión no encontrada o ya inactiva." });
    }
});

app.get('/api/verificar-sesion', (req, res) => {
    const { sesionId } = req.query;
    if (!sesionId) {
        return res.status(401).json({ activa: false, error: "Falta ID de sesión." });
    }
    const sesion = sesionesActivas.find(s => s.id === sesionId);
    if (sesion) {
        return res.status(200).json({ activa: true });
    } else {
        return res.status(401).json({ activa: false, error: "Tu sesión ha sido cerrada por un administrador." });
    }
});

app.post('/api/logout', (req, res) => {
    const { sesionId } = req.body;
    if (sesionId) {
        sesionesActivas = sesionesActivas.filter(s => s.id !== sesionId);
    }
    res.status(200).json({ mensaje: "Logout exitoso en backend" });
});

// ==========================================
// ENDPOINTS DE ORGANIZACIONES
// ==========================================

app.get('/api/organizaciones', (req, res) => {
    res.status(200).json(organizacionesDb);
});

app.post('/api/organizaciones', (req, res) => {
    const { nombre, managers, clientes, departamentoId } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la organización es obligatorio.' });
    }
    const nueva = {
        id: nextOrganizacionId++,
        nombre: nombre.trim(),
        managers: Array.isArray(managers) ? managers : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        departamentoId: departamentoId ? parseInt(departamentoId) : null
    };
    organizacionesDb.push(nueva);
    res.status(201).json(nueva);
});

app.put('/api/organizaciones/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, managers, clientes, departamentoId } = req.body;
    const index = organizacionesDb.findIndex(o => o.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Organización no encontrada.' });
    }
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la organización es obligatorio.' });
    }
    organizacionesDb[index] = {
        id: id,
        nombre: nombre.trim(),
        managers: Array.isArray(managers) ? managers : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        departamentoId: departamentoId ? parseInt(departamentoId) : null
    };
    res.status(200).json(organizacionesDb[index]);
});

app.delete('/api/organizaciones/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = organizacionesDb.findIndex(o => o.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Organización no encontrada.' });
    }
    organizacionesDb.splice(index, 1);
    res.status(200).json({ mensaje: "Organización eliminada" });
});

// ==========================================
// ENDPOINTS DE EQUIPOS
// ==========================================
app.get('/api/equipos', (req, res) => {
    res.status(200).json(equiposDb);
});

app.post('/api/equipos', (req, res) => {
    const { nombre, miembros } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
    }
    const nuevo = {
        id: nextEquipoId++,
        nombre: nombre.trim(),
        miembros: Array.isArray(miembros) ? miembros.map(m => m.toLowerCase()) : []
    };
    equiposDb.push(nuevo);

    // Sincronizar el campo equipoId en los usuarios correspondientes
    usuariosDb.forEach(u => {
        if (u.rol === 'staff') {
            if (nuevo.miembros.includes(u.email.toLowerCase())) {
                u.equipoId = nuevo.id;
            } else if (u.equipoId === nuevo.id) {
                u.equipoId = null;
            }
        }
    });

    res.status(201).json(nuevo);
});

app.put('/api/equipos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, miembros } = req.body;
    const index = equiposDb.findIndex(e => e.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
    }

    const nuevosMiembros = Array.isArray(miembros) ? miembros.map(m => m.toLowerCase()) : [];

    equiposDb[index] = {
        id,
        nombre: nombre.trim(),
        miembros: nuevosMiembros
    };

    // Sincronizar equipoId en usuariosDb
    usuariosDb.forEach(u => {
        if (u.rol === 'staff') {
            if (nuevosMiembros.includes(u.email.toLowerCase())) {
                u.equipoId = id;
            } else if (u.equipoId === id) {
                u.equipoId = null;
            }
        }
    });

    res.status(200).json(equiposDb[index]);
});

app.delete('/api/equipos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = equiposDb.findIndex(e => e.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Equipo no encontrado.' });
    }

    // Quitar equipoId de los usuarios asignados a este equipo
    usuariosDb.forEach(u => {
        if (u.equipoId === id) {
            u.equipoId = null;
        }
    });

    equiposDb.splice(index, 1);
    res.status(200).json({ mensaje: "Equipo eliminado con éxito." });
});

// ==========================================
// ENDPOINTS DE CLIENTES (CRM / TICKETS)
// ==========================================

// Modificado para aceptar Multipart form-data para subir múltiples archivos de hasta 15 MB
app.post('/api/clientes', handleUpload('documentos', 15), (req, res) => {
    // Si viene como JSON plano (desde admin): req.body.departamento
    // Si viene como form-data (desde el panel del usuario): req.body.departamento también existe pero todo es string
    const { nombre, email, telefono, empresa, estado_embudo, departamento, asignado_a, prioridad, templateId, camposExtra,
        pais, marca, nombre_empresa, orden_compra_cliente, stock, soft_hard, factura_cancelada, comentario, creado_por } = req.body;

    const archivos = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(f => {
            archivos.push({
                nombre: f.originalname,
                url: `/uploads/${f.filename}`
            });
        });
    }

    const archivo_url = archivos.length > 0 ? archivos[0].url : null;

    const estado = estado_embudo || 'Prospecto';
    const asignado = asignado_a || null;

    let parsedCamposExtra = null;
    if (camposExtra) {
        try {
            parsedCamposExtra = typeof camposExtra === 'string'
                ? JSON.parse(camposExtra)
                : camposExtra;
        } catch (e) {
            console.error("Error parsing camposExtra in backend", e);
        }
    }

    const inicialNotas = [];
    if (comentario && comentario.trim() !== '') {
        inicialNotas.push({
            id: Date.now(),
            mensaje: comentario,
            autor: nombre || email || 'Cliente',
            fecha: new Date(),
            archivos: []
        });
    }

    let finalDepartamentoId = 1;
    if (parsedCamposExtra && parsedCamposExtra.isExpense === true) {
        if (parsedCamposExtra.expenseType === 'reintegro') {
            const expDept = departamentosDb.find(d => d.nombre.toLowerCase() === 'expenses');
            finalDepartamentoId = expDept ? expDept.id : 5;
        } else if (parsedCamposExtra.expenseType === 'viaje') {
            const trvDept = departamentosDb.find(d => d.nombre.toLowerCase() === 'travels');
            finalDepartamentoId = trvDept ? trvDept.id : 6;
        }
    } else {
        const opsDept = departamentosDb.find(d => d.nombre.toLowerCase() === 'operaciones');
        finalDepartamentoId = opsDept ? opsDept.id : 4;
    }

    const nuevoCliente = {
        id: nextClienteId++,
        nombre,
        email: email || '',
        telefono: telefono || '',
        empresa: empresa || '',
        estado_embudo: estado,
        departamento: finalDepartamentoId,
        prioridad: prioridad || 'Normal',
        archivo_url: archivo_url,
        archivos: archivos,
        notas: inicialNotas,
        asignado_a: asignado,
        creado_en: new Date(),
        creado_por: creado_por || email || 'Cliente',
        actualizado_en: new Date(),
        historial_estados: [
            { estado: estado, desde: new Date(), hasta: null }
        ],
        historial_asignados: [
            { asignado_a: asignado, desde: new Date(), hasta: null }
        ],
        historial_departamentos: [
            { departamento: finalDepartamentoId, desde: new Date(), hasta: null }
        ],
        templateId: templateId ? parseInt(templateId) : null,
        camposExtra: parsedCamposExtra,
        pais: pais || '',
        marca: marca || '',
        nombre_empresa: nombre_empresa || '',
        orden_compra_cliente: orden_compra_cliente ? parseInt(orden_compra_cliente) : null,
        stock: stock || 'No',
        soft_hard: soft_hard || '',
        factura_cancelada: factura_cancelada || 'No',
        comentario: comentario || ''
    };
    clientesDb.push(nuevoCliente);

    const depto = departamentosDb.find(d => d.id === nuevoCliente.departamento);
    registrarAccionTicket(
        nuevoCliente.id,
        "Creación",
        `Ticket creado y asignado al departamento "${depto ? depto.nombre : 'General'}" en estado "${nuevoCliente.estado_embudo}"`,
        nuevoCliente.creado_por
    );

    res.status(201).json(nuevoCliente);
});

app.get('/api/clientes', (req, res) => {
    const sorted = [...clientesDb].sort((a, b) => b.creado_en - a.creado_en);
    res.status(200).json(sorted);
});

// Endpoint para obtener los tickets de un usuario específico
app.get('/api/mis-tickets', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Falta email' });

    // Buscar el usuario para conocer su rol
    const usuario = usuariosDb.find(u => u.email.toLowerCase() === email.toLowerCase());

    let misTickets = [];
    if (usuario && usuario.rol === 'manager') {
        // Encontrar las organizaciones a las que pertenece este manager
        const orgs = organizacionesDb.filter(o => o.managers.some(m => m.toLowerCase() === email.toLowerCase()));
        // Colectar todos los correos de los clientes de estas organizaciones
        const clientesEmails = new Set(
            orgs.flatMap(o => o.clientes).map(c => c.toLowerCase())
        );
        // También incluir el propio email del manager por si tiene tickets propios
        clientesEmails.add(email.toLowerCase());

        misTickets = clientesDb.filter(c => clientesEmails.has(c.email.toLowerCase()));
    } else {
        misTickets = clientesDb.filter(c => c.email.toLowerCase() === email.toLowerCase());
    }

    const sorted = [...misTickets].sort((a, b) => b.creado_en - a.creado_en);
    res.status(200).json(sorted);
});

app.put('/api/clientes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, email, telefono, empresa, estado_embudo, departamento, prioridad, asignado_a,
        pais, marca, nombre_empresa, orden_compra_cliente, stock, soft_hard, factura_cancelada, comentario, operador } = req.body;
    const index = clientesDb.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Cliente no encontrado.' });

    const oldCliente = { ...clientesDb[index] }; // Crear copia superficial para asegurar que guardamos los valores anteriores

    // Si cambia de estado
    let historial_estados = oldCliente.historial_estados ? [...oldCliente.historial_estados] : [];
    const nuevoEstado = estado_embudo || oldCliente.estado_embudo || 'Prospecto';
    if (nuevoEstado !== oldCliente.estado_embudo) {
        // Cerrar estado anterior
        if (historial_estados.length > 0) {
            historial_estados[historial_estados.length - 1] = {
                ...historial_estados[historial_estados.length - 1],
                hasta: new Date()
            };
        } else {
            // Si por alguna razón no tenía historial, lo inicializamos
            historial_estados.push({
                estado: oldCliente.estado_embudo || 'Prospecto',
                desde: oldCliente.creado_en || new Date(),
                hasta: new Date()
            });
        }
        historial_estados.push({
            estado: nuevoEstado,
            desde: new Date(),
            hasta: null
        });
    }

    // Si cambia de asignado
    let historial_asignados = oldCliente.historial_asignados ? [...oldCliente.historial_asignados] : [];
    const cleanOldAsignado = oldCliente.asignado_a || null;
    const cleanNewAsignado = asignado_a === undefined ? cleanOldAsignado : (asignado_a || null);
    if (cleanNewAsignado !== cleanOldAsignado) {
        // Cerrar asignado anterior
        if (historial_asignados.length > 0) {
            historial_asignados[historial_asignados.length - 1] = {
                ...historial_asignados[historial_asignados.length - 1],
                hasta: new Date()
            };
        } else {
            // Si por alguna razón no tenía historial, lo inicializamos
            historial_asignados.push({
                asignado_a: cleanOldAsignado,
                desde: oldCliente.creado_en || new Date(),
                hasta: new Date()
            });
        }
        historial_asignados.push({
            asignado_a: cleanNewAsignado,
            desde: new Date(),
            hasta: null
        });
    }

    // Si cambia de departamento
    let historial_departamentos = oldCliente.historial_departamentos ? [...oldCliente.historial_departamentos] : [];
    const nuevoDepartamento = departamento !== undefined ? parseInt(departamento) : oldCliente.departamento;
    if (nuevoDepartamento !== oldCliente.departamento) {
        // Cerrar departamento anterior
        if (historial_departamentos.length > 0) {
            historial_departamentos[historial_departamentos.length - 1] = {
                ...historial_departamentos[historial_departamentos.length - 1],
                hasta: new Date()
            };
        } else {
            // Si por alguna razón no tenía historial, lo inicializamos
            historial_departamentos.push({
                departamento: oldCliente.departamento,
                desde: oldCliente.creado_en || new Date(),
                hasta: new Date()
            });
        }
        historial_departamentos.push({
            departamento: nuevoDepartamento,
            desde: new Date(),
            hasta: null
        });
    }

    clientesDb[index] = {
        ...oldCliente,
        nombre: nombre !== undefined ? nombre : oldCliente.nombre,
        email: email !== undefined ? email : oldCliente.email,
        telefono: telefono !== undefined ? telefono : oldCliente.telefono,
        empresa: empresa !== undefined ? empresa : oldCliente.empresa,
        estado_embudo: nuevoEstado,
        departamento: nuevoDepartamento,
        prioridad: prioridad || oldCliente.prioridad,
        asignado_a: cleanNewAsignado,
        historial_estados,
        historial_asignados,
        historial_departamentos,
        actualizado_en: new Date(),
        pais: pais !== undefined ? pais : oldCliente.pais,
        marca: marca !== undefined ? marca : oldCliente.marca,
        nombre_empresa: nombre_empresa !== undefined ? nombre_empresa : oldCliente.nombre_empresa,
        orden_compra_cliente: orden_compra_cliente !== undefined ? (orden_compra_cliente ? parseInt(orden_compra_cliente) : null) : oldCliente.orden_compra_cliente,
        stock: stock !== undefined ? stock : oldCliente.stock,
        soft_hard: soft_hard !== undefined ? soft_hard : oldCliente.soft_hard,
        factura_cancelada: factura_cancelada !== undefined ? factura_cancelada : oldCliente.factura_cancelada,
        comentario: comentario !== undefined ? comentario : oldCliente.comentario
    };

    // Registrar auditoría de cambios
    const usuarioStr = operador || 'Sistema';

    // 1. Estado
    const realNuevoEstado = clientesDb[index].estado_embudo;
    if (realNuevoEstado !== oldCliente.estado_embudo) {
        registrarAccionTicket(
            id,
            "Cambio de Estado",
            `Cambio de estado: ${oldCliente.estado_embudo || 'Prospecto'} ➡️ ${realNuevoEstado}`,
            usuarioStr
        );
    }

    // 2. Asignado
    const realNuevoAsignado = clientesDb[index].asignado_a;
    if (realNuevoAsignado !== oldCliente.asignado_a) {
        registrarAccionTicket(
            id,
            "Reasignación",
            `Asignado redefinido: ${oldCliente.asignado_a || 'Nadie'} ➡️ ${realNuevoAsignado || 'Nadie'}`,
            usuarioStr
        );
    }

    // 3. Departamento
    const realNuevoDeptoId = clientesDb[index].departamento;
    if (realNuevoDeptoId !== oldCliente.departamento) {
        const oldDepto = departamentosDb.find(d => d.id === oldCliente.departamento);
        const newDepto = departamentosDb.find(d => d.id === realNuevoDeptoId);
        const oldDeptoName = oldDepto ? oldDepto.nombre : 'General';
        const newDeptoName = newDepto ? newDepto.nombre : 'General';
        registrarAccionTicket(
            id,
            "Transferencia",
            `Departamento cambiado: ${oldDeptoName} ➡️ ${newDeptoName}`,
            usuarioStr
        );
    }

    // 4. Prioridad
    const realNuevaPrioridad = clientesDb[index].prioridad;
    if (realNuevaPrioridad !== oldCliente.prioridad) {
        registrarAccionTicket(
            id,
            "Cambio de Prioridad",
            `Prioridad cambiada: ${oldCliente.prioridad || 'Normal'} ➡️ ${realNuevaPrioridad}`,
            usuarioStr
        );
    }

    res.status(200).json(clientesDb[index]);
});

// Endpoint para añadir una nota al hilo del ticket (Módulo interno estilo Kayako) con soporte para adjuntos múltiples de hasta 15 MB
app.post('/api/clientes/:id/notas', handleUpload('documentos', 15), (req, res) => {
    const id = parseInt(req.params.id);
    const { mensaje, autor } = req.body;

    const cliente = clientesDb.find(c => c.id === id);
    if (!cliente) return res.status(404).json({ error: 'Ticket no encontrado.' });

    const archivos = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(f => {
            archivos.push({
                nombre: f.originalname,
                url: `/uploads/${f.filename}`
            });
        });
    }

    const nuevaNota = {
        id: Date.now(),
        mensaje: mensaje || '',
        autor: autor || 'Sistema',
        fecha: new Date(),
        archivos: archivos
    };

    if (!cliente.notas) cliente.notas = [];
    cliente.notas.push(nuevaNota);
    cliente.actualizado_en = new Date();

    registrarAccionTicket(id, "Comentario", "Nueva respuesta registrada en el ticket.", autor || 'Sistema');

    res.status(201).json(nuevaNota);
});

// ==========================================
// ENDPOINTS DE IMPORTACIÓN DE KAYAKO
// ==========================================

const mysql = require('mysql2/promise');

// 1. Validar conexión y obtener estadísticas
app.post('/api/importar-kayako/conectar', async (req, res) => {
    const { host, port, user, password, database, prefix = 'sw' } = req.body;

    if (!host || !user || !database) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos de conexión.' });
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host,
            port: parseInt(port) || 3306,
            user,
            password,
            database,
            connectTimeout: 5000
        });

        const pfx = prefix.trim();

        let deptCount = 0;
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${pfx}departments\` WHERE \`module\` = 'tickets'`);
            deptCount = rows[0].c;
        } catch (e) { console.warn("No se pudo leer swdepartments", e); }

        let staffCount = 0;
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${pfx}staff\``);
            staffCount = rows[0].c;
        } catch (e) { console.warn("No se pudo leer swstaff", e); }

        let ticketCount = 0;
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${pfx}tickets\``);
            ticketCount = rows[0].c;
        } catch (e) { console.warn("No se pudo leer swtickets", e); }

        let postCount = 0;
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${pfx}ticketposts\``);
            postCount = rows[0].c;
        } catch (e) { console.warn("No se pudo leer swticketposts", e); }

        let statusCount = 0;
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) AS c FROM \`${pfx}ticketstatuses\``);
            statusCount = rows[0].c;
        } catch (e) { console.warn("No se pudo leer swticketstatuses", e); }

        await connection.end();

        res.status(200).json({
            mensaje: "Conexión exitosa",
            estadisticas: {
                departamentos: deptCount,
                agentes: staffCount,
                tickets: ticketCount,
                notas: postCount,
                estados: statusCount
            }
        });

    } catch (err) {
        if (connection) {
            try { await connection.end(); } catch (e) { }
        }
        res.status(500).json({ error: `Error de conexión: ${err.message}` });
    }
});

// 2. Procesar importación desde base de datos conectada
app.post('/api/importar-kayako/procesar-conexion', async (req, res) => {
    const { host, port, user, password, database, prefix = 'sw' } = req.body;

    if (!host || !user || !database) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host,
            port: parseInt(port) || 3306,
            user,
            password,
            database,
            connectTimeout: 10000
        });

        const pfx = prefix.trim();

        // 1. Obtener estados de Kayako
        let kayakoStatuses = {};
        try {
            const [rows] = await connection.query(`SELECT ticketstatusid, title FROM \`${pfx}ticketstatuses\``);
            rows.forEach(r => {
                kayakoStatuses[r.ticketstatusid] = r.title;
                if (!estadosDb.find(e => e.nombre.toLowerCase() === r.title.toLowerCase())) {
                    estadosDb.push({ id: nextEstadoId++, nombre: r.title.trim() });
                }
            });
        } catch (e) { console.warn("Error leyendo statuses", e); }

        // 2. Obtener departamentos de Kayako
        let deptMap = {};
        try {
            const [rows] = await connection.query(`SELECT departmentid, title FROM \`${pfx}departments\` WHERE \`module\` = 'tickets'`);
            rows.forEach(r => {
                let localDept = departamentosDb.find(d => d.nombre.toLowerCase() === r.title.toLowerCase());
                if (!localDept) {
                    localDept = { id: nextDepartamentoId++, nombre: r.title.trim(), sla_horas: 24 };
                    departamentosDb.push(localDept);
                }
                deptMap[r.departmentid] = localDept.id;
            });
        } catch (e) { console.warn("Error leyendo departamentos", e); }

        // 3. Obtener agentes de Kayako
        let staffMap = {};
        try {
            const [rows] = await connection.query(`SELECT staffid, firstname, lastname, email, username FROM \`${pfx}staff\``);
            rows.forEach(r => {
                const fullname = `${r.firstname} ${r.lastname}`.trim();
                staffMap[r.staffid] = fullname;

                let localUser = usuariosDb.find(u => u.email.toLowerCase() === r.email.toLowerCase());
                if (!localUser) {
                    localUser = {
                        id: nextUsuarioId++,
                        nombre: fullname,
                        email: r.email,
                        password: 'default_password',
                        rol: 'staff',
                        crear_tickets: true,
                        accesos: { departamentos: Object.values(deptMap), estados: estadosDb.map(e => e.nombre) }
                    };
                    usuariosDb.push(localUser);
                }
            });
        } catch (e) { console.warn("Error leyendo staff", e); }

        // 4. Obtener todos los posts (notas) organizados por ticketid
        let postsByTicket = {};
        try {
            const [rows] = await connection.query(`SELECT ticketpostid, ticketid, dateline, fullname, email, contents, creator FROM \`${pfx}ticketposts\` ORDER BY dateline ASC`);
            rows.forEach(r => {
                if (!postsByTicket[r.ticketid]) postsByTicket[r.ticketid] = [];
                postsByTicket[r.ticketid].push({
                    id: r.ticketpostid || Date.now() + Math.random(),
                    mensaje: r.contents ? r.contents.replace(/<[^>]*>/g, '') : '',
                    autor: r.fullname || (r.creator === 1 ? 'Agente' : 'Cliente'),
                    fecha: new Date(r.dateline * 1000)
                });
            });
        } catch (e) { console.warn("Error leyendo posts", e); }

        // 5. Obtener y procesar tickets
        let importedCount = 0;
        try {
            const [rows] = await connection.query(`SELECT ticketid, ticketmaskid, departmentid, ticketstatusid, email, fullname, subject, dateline, ownerstaffid, priorityid FROM \`${pfx}tickets\``);

            rows.forEach(t => {
                const alreadyExists = clientesDb.some(c => c.empresa === t.subject && c.email === t.email);
                if (alreadyExists) return;

                const localDeptId = deptMap[t.departmentid] || 1;
                const statusName = kayakoStatuses[t.ticketstatusid] || 'Prospecto';
                const assigneeName = staffMap[t.ownerstaffid] || null;

                let prioridadName = 'Normal';
                if (t.priorityid === 1 || t.priorityid === '1') prioridadName = 'Baja';
                else if (t.priorityid === 3 || t.priorityid === '3') prioridadName = 'Alta';
                else if (t.priorityid === 4 || t.priorityid === '4') prioridadName = 'Urgente';

                const creadoFecha = new Date(t.dateline * 1000);

                const nuevoCliente = {
                    id: nextClienteId++,
                    nombre: t.fullname || 'Cliente Kayako',
                    email: t.email || '',
                    telefono: '',
                    empresa: t.subject || 'Asunto sin especificar',
                    estado_embudo: statusName,
                    departamento: localDeptId,
                    prioridad: prioridadName,
                    archivo_url: null,
                    notas: postsByTicket[t.ticketid] || [],
                    asignado_a: assigneeName,
                    creado_en: creadoFecha,
                    creado_por: t.fullname || t.email || 'Cliente Kayako',
                    actualizado_en: creadoFecha,
                    historial_estados: [
                        { estado: statusName, desde: creadoFecha, hasta: null }
                    ],
                    historial_asignados: [
                        { asignado_a: assigneeName, desde: creadoFecha, hasta: null }
                    ],
                    historial_departamentos: [
                        { departamento: localDeptId, desde: creadoFecha, hasta: null }
                    ]
                };
                clientesDb.push(nuevoCliente);
                importedCount++;
            });
        } catch (e) {
            console.error("Error leyendo tickets", e);
            throw new Error(`Error en la importación de tickets: ${e.message}`);
        }

        await connection.end();

        res.status(200).json({
            mensaje: "Importación completada con éxito",
            estadisticas: {
                departamentos: Object.keys(deptMap).length,
                agentes: Object.keys(staffMap).length,
                tickets: importedCount,
                notas: Object.values(postsByTicket).reduce((acc, curr) => acc + curr.length, 0)
            }
        });

    } catch (err) {
        if (connection) {
            try { await connection.end(); } catch (e) { }
        }
        res.status(500).json({ error: `Error durante el procesamiento: ${err.message}` });
    }
});

// Auxiliares para el parseo heurístico del archivo SQL
function getRowObject(row, defaultColumns) {
    const obj = {};
    const cols = row.columns || defaultColumns;
    cols.forEach((col, i) => {
        if (i < row.fields.length) {
            obj[col.toLowerCase()] = row.fields[i];
        }
    });
    return obj;
}

function parseSqlRows(sqlText, targetTableName) {
    const rows = [];
    const lowerTarget = targetTableName.toLowerCase();
    const regex = new RegExp(`INSERT\\s+INTO\\s+[\`"]?(${lowerTarget})[\`"]?\\s*(\\(([^)]+)\\))?\\s*VALUES\\s*`, 'gi');

    let match;
    while ((match = regex.exec(sqlText)) !== null) {
        const columns = match[3] ? match[3].split(',').map(c => c.replace(/[`"]/g, '').trim()) : null;
        let index = regex.lastIndex;

        let inRow = false;
        let inString = false;
        let stringChar = null;
        let escaped = false;
        let currentRowStr = '';

        while (index < sqlText.length) {
            const char = sqlText[index];

            if (!inRow) {
                if (char === '(') {
                    inRow = true;
                    currentRowStr = '';
                } else if (char === ';') {
                    break;
                }
            } else {
                currentRowStr += char;
                if (escaped) {
                    escaped = false;
                } else if (char === '\\') {
                    escaped = true;
                } else if ((char === "'" || char === '"') && !escaped) {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    } else if (char === stringChar) {
                        inString = false;
                        stringChar = null;
                    }
                } else if (char === ')' && !inString) {
                    inRow = false;
                    const rowContent = currentRowStr.slice(0, -1);
                    const fields = parseRowFields(rowContent);
                    rows.push({ columns, fields });
                }
            }
            index++;
        }
        regex.lastIndex = index;
    }
    return rows;
}

function parseRowFields(rowStr) {
    const fields = [];
    let index = 0;
    let inString = false;
    let stringChar = null;
    let escaped = false;
    let currentField = '';

    while (index < rowStr.length) {
        const char = rowStr[index];

        if (escaped) {
            currentField += char;
            escaped = false;
        } else if (char === '\\') {
            escaped = true;
            currentField += char;
        } else if ((char === "'" || char === '"') && !escaped) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
            currentField += char;
        } else if (char === ',' && !inString) {
            fields.push(cleanFieldValue(currentField));
            currentField = '';
        } else {
            currentField += char;
        }
        index++;
    }
    fields.push(cleanFieldValue(currentField));
    return fields;
}

function cleanFieldValue(val) {
    val = val.trim();
    if (val === 'NULL' || val === 'null') return null;
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        let content = val.slice(1, -1);
        content = content.replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');
        return content;
    }
    if (!isNaN(val) && val !== '') {
        return Number(val);
    }
    return val;
}

// 3. Procesar importación desde archivo SQL subido
app.post('/api/importar-kayako/subir-sql', upload.single('sqlFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo SQL.' });
    }

    try {
        const sqlPath = req.file.path;
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        const rawStatuses = parseSqlRows(sqlContent, 'swticketstatuses');
        const rawDepts = parseSqlRows(sqlContent, 'swdepartments');
        const rawStaff = parseSqlRows(sqlContent, 'swstaff');
        const rawTickets = parseSqlRows(sqlContent, 'swtickets');
        const rawPosts = parseSqlRows(sqlContent, 'swticketposts');

        // 1. Estados
        const statusesMap = {};
        rawStatuses.forEach(r => {
            const obj = getRowObject(r, ['ticketstatusid', 'title']);
            if (!r.columns) {
                obj.ticketstatusid = r.fields[0];
                obj.title = r.fields[1] || 'Estado';
            }
            statusesMap[obj.ticketstatusid] = obj.title;

            if (!estadosDb.find(e => e.nombre.toLowerCase() === obj.title.toLowerCase())) {
                estadosDb.push({ id: nextEstadoId++, nombre: obj.title.trim() });
            }
        });

        // 2. Departamentos
        const deptMap = {};
        rawDepts.forEach(r => {
            const obj = getRowObject(r, ['departmentid', 'parentdepartmentid', 'title', 'module']);
            if (!r.columns) {
                const strings = r.fields.filter(f => typeof f === 'string');
                obj.departmentid = r.fields[0];
                obj.title = strings.find(s => s !== 'tickets' && s !== 'livechat') || `Depto ${r.fields[0]}`;
                obj.module = strings.find(s => s === 'tickets') || 'tickets';
            }

            if (obj.module === 'tickets') {
                let localDept = departamentosDb.find(d => d.nombre.toLowerCase() === obj.title.toLowerCase());
                if (!localDept) {
                    localDept = { id: nextDepartamentoId++, nombre: obj.title.trim(), sla_horas: 24 };
                    departamentosDb.push(localDept);
                }
                deptMap[obj.departmentid] = localDept.id;
            }
        });

        // 3. Staff
        const staffMap = {};
        rawStaff.forEach(r => {
            const obj = getRowObject(r, ['staffid', 'staffgroupid', 'firstname', 'lastname', 'username', 'password', 'email', 'fullname']);
            if (!r.columns) {
                const emails = r.fields.filter(f => typeof f === 'string' && f.includes('@'));
                const strings = r.fields.filter(f => typeof f === 'string' && !f.includes('@'));
                obj.staffid = r.fields[0];
                obj.email = emails[0] || `staff${r.fields[0]}@kayako.local`;
                obj.firstname = strings[0] || 'Staff';
                obj.lastname = strings[1] || '';
                obj.fullname = `${obj.firstname} ${obj.lastname}`.trim();
            }
            if (!obj.fullname && (obj.firstname || obj.lastname)) {
                obj.fullname = `${obj.firstname || ''} ${obj.lastname || ''}`.trim();
            }

            staffMap[obj.staffid] = obj.fullname || 'Agente';

            let localUser = usuariosDb.find(u => u.email.toLowerCase() === obj.email.toLowerCase());
            if (!localUser) {
                localUser = {
                    id: nextUsuarioId++,
                    nombre: obj.fullname || 'Agente Kayako',
                    email: obj.email,
                    password: 'default_password',
                    rol: 'staff',
                    crear_tickets: true,
                    accesos: { departamentos: Object.values(deptMap), estados: estadosDb.map(e => e.nombre) }
                };
                usuariosDb.push(localUser);
            }
        });

        // 4. Posts
        const postsByTicket = {};
        rawPosts.forEach(r => {
            const obj = getRowObject(r, ['ticketpostid', 'ticketid', 'dateline', 'fullname', 'email', 'contents', 'creator']);
            if (!r.columns) {
                const emails = r.fields.filter(f => typeof f === 'string' && f.includes('@'));
                const timestamps = r.fields.filter(f => typeof f === 'number' && f > 1000000000 && f < 2500000000);
                const ints = r.fields.filter(f => typeof f === 'number' && f <= 100000000);
                obj.ticketpostid = r.fields[0];
                obj.ticketid = r.fields[1];
                obj.dateline = timestamps[0] || Math.floor(Date.now() / 1000);
                obj.fullname = r.fields.find(f => typeof f === 'string' && !f.includes('@') && f.length > 0 && f.length < 50) || 'Usuario';
                obj.email = emails[0] || '';
                obj.contents = r.fields.find(f => typeof f === 'string' && !f.includes('@') && f !== obj.fullname && f.length > 5) || 'Sin contenido';
                obj.creator = ints.find(i => i === 1 || i === 2 || i === 3) || 1;
            }

            if (!postsByTicket[obj.ticketid]) postsByTicket[obj.ticketid] = [];
            postsByTicket[obj.ticketid].push({
                id: obj.ticketpostid || Date.now() + Math.random(),
                mensaje: obj.contents ? obj.contents.replace(/<[^>]*>/g, '') : '',
                autor: obj.fullname || (obj.creator === 1 ? 'Agente' : 'Cliente'),
                fecha: new Date((obj.dateline || Math.floor(Date.now() / 1000)) * 1000)
            });
        });

        Object.keys(postsByTicket).forEach(tid => {
            postsByTicket[tid].sort((a, b) => a.fecha - b.fecha);
        });

        // 5. Tickets
        let importedCount = 0;
        rawTickets.forEach(r => {
            const obj = getRowObject(r, ['ticketid', 'ticketmaskid', 'departmentid', 'ticketstatusid', 'priorityid', 'email', 'fullname', 'subject', 'dateline', 'ownerstaffid']);
            if (!r.columns) {
                const emails = r.fields.filter(f => typeof f === 'string' && f.includes('@'));
                const strings = r.fields.filter(f => typeof f === 'string' && !f.includes('@') && f.length > 5);
                const timestamps = r.fields.filter(f => typeof f === 'number' && f > 1000000000 && f < 2500000000);

                obj.ticketid = r.fields[0];
                obj.ticketmaskid = r.fields[1] || String(r.fields[0]);
                obj.departmentid = typeof r.fields[2] === 'number' ? r.fields[2] : 1;
                obj.ticketstatusid = typeof r.fields[3] === 'number' ? r.fields[3] : 1;
                obj.priorityid = typeof r.fields[4] === 'number' ? r.fields[4] : 1;
                obj.email = emails[0] || 'user@kayako.local';
                obj.fullname = r.fields.find(f => typeof r.fields[9] === 'string' && !r.fields[9].includes('@') && r.fields[9].length > 0 && r.fields[9].length < 50) || r.fields.find(f => typeof f === 'string' && !f.includes('@') && f.length > 0 && f.length < 50) || 'Cliente Kayako';
                obj.subject = strings.find(s => s !== obj.fullname && s !== obj.ticketmaskid) || 'Asunto sin especificar';
                obj.dateline = timestamps[0] || Math.floor(Date.now() / 1000);
                obj.ownerstaffid = typeof r.fields[9] === 'number' ? r.fields[9] : 0;
            }

            const alreadyExists = clientesDb.some(c => c.empresa === obj.subject && c.email === obj.email);
            if (alreadyExists) return;

            const localDeptId = deptMap[obj.departmentid] || 1;
            const statusName = statusesMap[obj.ticketstatusid] || 'Prospecto';
            const assigneeName = staffMap[obj.ownerstaffid] || null;

            let prioridadName = 'Normal';
            if (obj.priorityid === 1 || obj.priorityid === '1') prioridadName = 'Baja';
            else if (obj.priorityid === 3 || obj.priorityid === '3') prioridadName = 'Alta';
            else if (obj.priorityid === 4 || obj.priorityid === '4') prioridadName = 'Urgente';

            const creadoFecha = new Date((obj.dateline || Math.floor(Date.now() / 1000)) * 1000);

            const nuevoCliente = {
                id: nextClienteId++,
                nombre: obj.fullname || 'Cliente Kayako',
                email: obj.email || '',
                telefono: '',
                empresa: obj.subject || 'Asunto sin especificar',
                estado_embudo: statusName,
                departamento: localDeptId,
                prioridad: prioridadName,
                archivo_url: null,
                notes: postsByTicket[obj.ticketid] || [],
                notas: postsByTicket[obj.ticketid] || [],
                asignado_a: assigneeName,
                creado_en: creadoFecha,
                creado_por: obj.fullname || obj.email || 'Cliente Kayako',
                actualizado_en: creadoFecha,
                historial_estados: [
                    { estado: statusName, desde: creadoFecha, hasta: null }
                ],
                historial_asignados: [
                    { asignado_a: assigneeName, desde: creadoFecha, hasta: null }
                ],
                historial_departamentos: [
                    { departamento: localDeptId, desde: creadoFecha, hasta: null }
                ]
            };
            clientesDb.push(nuevoCliente);
            importedCount++;
        });

        fs.unlinkSync(sqlPath);

        res.status(200).json({
            mensaje: "Importación de SQL completada con éxito",
            estadisticas: {
                departamentos: Object.keys(deptMap).length,
                agentes: Object.keys(staffMap).length,
                tickets: importedCount,
                notas: Object.values(postsByTicket).reduce((acc, curr) => acc + curr.length, 0)
            }
        });

    } catch (err) {
        console.error("Error procesando SQL", err);
        res.status(500).json({ error: `Error al procesar el archivo SQL: ${err.message}` });
    }
});

// ==========================================
// ENDPOINTS DE PLANTILLAS DE TICKETS (TEMPLATES)
// ==========================================
let templatesDb = [
    {
        id: 1,
        nombre: "Soporte de Equipos",
        descripcion: "Formulario para solicitar soporte técnico de hardware o software.",
        asociacionTipo: "equipo",
        equipoId: 1,
        accion: null,
        destinatarioTipo: "todos",
        destinatarioEmail: null,
        organizacionId: null,
        campos: [
            { id: "serial", nombre: "Número de Serie", tipo: "texto", requerido: true },
            { id: "categoria", nombre: "Categoría", tipo: "seleccion", requerido: true, opciones: "Hardware, Software, Redes, Otro" },
            { id: "descripcion_detallada", nombre: "Descripción del Problema", tipo: "area_texto", requerido: true }
        ]
    }
];
let nextTemplateId = 2;

app.get('/api/templates', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(200).json(templatesDb);
    }

    const userEmail = email.toLowerCase().trim();
    const user = usuariosDb.find(u => u.email.toLowerCase() === userEmail);

    // Si el usuario no existe, o es admin/staff, puede ver todas
    if (user && (user.rol === 'admin' || user.rol === 'staff')) {
        return res.status(200).json(templatesDb);
    }

    // Buscar organizaciones donde este usuario es cliente
    const userOrgs = organizacionesDb.filter(o =>
        (o.clientes && o.clientes.map(c => c.toLowerCase()).includes(userEmail)) ||
        (o.managers && o.managers.map(m => m.toLowerCase()).includes(userEmail))
    ).map(o => o.id);

    const filtrados = templatesDb.filter(t => {
        // Por defecto, si no tiene destinatarioTipo, es visible para todos (retrocompatibilidad)
        if (!t.destinatarioTipo || t.destinatarioTipo === 'todos') {
            return true;
        }
        if (t.destinatarioTipo === 'persona' && t.destinatarioEmail && t.destinatarioEmail.toLowerCase() === userEmail) {
            return true;
        }
        if (t.destinatarioTipo === 'organizacion' && t.organizacionId && userOrgs.includes(parseInt(t.organizacionId))) {
            return true;
        }
        return false;
    });

    res.status(200).json(filtrados);
});

app.post('/api/templates', (req, res) => {
    const { nombre, descripcion, asociacionTipo, equipoId, accion, destinatarioTipo, destinatarioEmail, organizacionId, campos } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    const nuevo = {
        id: nextTemplateId++,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : '',
        asociacionTipo: asociacionTipo || 'equipo',
        equipoId: equipoId ? parseInt(equipoId) : null,
        accion: accion ? accion.trim() : null,
        destinatarioTipo: destinatarioTipo || 'todos',
        destinatarioEmail: destinatarioEmail ? destinatarioEmail.trim() : null,
        organizacionId: organizacionId ? parseInt(organizacionId) : null,
        campos: Array.isArray(campos) ? campos : []
    };
    templatesDb.push(nuevo);
    res.status(201).json(nuevo);
});

app.put('/api/templates/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, asociacionTipo, equipoId, accion, destinatarioTipo, destinatarioEmail, organizacionId, campos } = req.body;
    const index = templatesDb.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Plantilla no encontrada.' });
    }
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    templatesDb[index] = {
        ...templatesDb[index],
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : '',
        asociacionTipo: asociacionTipo || 'equipo',
        equipoId: equipoId ? parseInt(equipoId) : null,
        accion: accion ? accion.trim() : null,
        destinatarioTipo: destinatarioTipo || 'todos',
        destinatarioEmail: destinatarioEmail ? destinatarioEmail.trim() : null,
        organizacionId: organizacionId ? parseInt(organizacionId) : null,
        campos: Array.isArray(campos) ? campos : []
    };
    res.status(200).json(templatesDb[index]);
});

app.delete('/api/templates/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = templatesDb.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Plantilla no encontrada.' });
    }
    templatesDb.splice(index, 1);
    res.status(200).json({ mensaje: "Plantilla eliminada con éxito." });
});

app.listen(port, () => {
    console.log(`🚀 Servidor backend ejecutándose (En Memoria) en http://localhost:${port}`);
});
