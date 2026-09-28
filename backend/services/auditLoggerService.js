const fs = require('fs');
const path = require('path');

const SYSTEM_LOGS_FILE_PATH = path.join(__dirname, '..', 'system_logs.json');
let systemLogsDb = [];
let nextSystemLogId = 1;

function loadSystemLogs() {
    try {
        if (fs.existsSync(SYSTEM_LOGS_FILE_PATH)) {
            const rawLogs = fs.readFileSync(SYSTEM_LOGS_FILE_PATH, 'utf8');
            const parsed = JSON.parse(rawLogs);
            if (Array.isArray(parsed) && parsed.length > 0) {
                systemLogsDb = parsed;
                nextSystemLogId = Math.max(...systemLogsDb.map(l => l.id || 0)) + 1;
            }
        }
    } catch (err) {
        console.error('Error cargando system_logs.json:', err);
    }
}
loadSystemLogs();

// Inicializar con historial representativo si está vacío
if (systemLogsDb.length === 0) {
    const now = Date.now();
    systemLogsDb = [
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 180).toISOString(),
            origen: 'sistema',
            tipo: 'INFO',
            accion: 'SISTEMA_INICIALIZADO',
            descripcion: 'Servidor DACAS Enterprise Core & Motor E-Commerce inicializado con éxito.',
            usuario: { nombre: 'Sistema DACAS', email: 'system@dacas.com', rol: 'system' },
            ip: '127.0.0.1',
            detalles: { version: '2.5.0', node: process.version, env: 'production' }
        },
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 145).toISOString(),
            origen: 'ecommerce',
            tipo: 'SUCCESS',
            accion: 'CATALOGO_SINCRONIZADO',
            descripcion: 'Catálogo de hardware sincronizado con 18 marcas oficiales (Cisco, Fortinet, Poly, etc.).',
            usuario: { nombre: 'Admin E-commerce', email: 'admin.ecommerce@dacas.com', rol: 'admin_ecommerce' },
            ip: '190.220.14.88',
            detalles: { totalProductos: 42, categorias: ['networking', 'infraestructura', 'comunicaciones_unificadas', 'security'] }
        },
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 110).toISOString(),
            origen: 'dashboard',
            tipo: 'INFO',
            accion: 'SLA_CONFIGURADO',
            descripcion: 'SLA de departamentos verificado: Soporte Técnico (4h), Ventas (12h), Operaciones (24h).',
            usuario: { nombre: 'Juan Pascuzzi', email: 'jpascuzzi@dacas.com', rol: 'admin' },
            ip: '181.47.88.12',
            detalles: { sla_general: '33%', cumplimiento: 'OK' }
        },
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 75).toISOString(),
            origen: 'ecommerce',
            tipo: 'SUCCESS',
            accion: 'COTIZACION_PROFORMA_GENERADA',
            descripcion: 'Cliente Corporativo generó Proforma mayorista #DAC-77312 por USD $12,450.00.',
            usuario: { nombre: 'Telecom Global SA', email: 'compras@telecomglobal.com', rol: 'cliente' },
            ip: '200.58.112.4',
            detalles: { ordenId: 'DAC-77312', monto: 12450.00, moneda: 'USD', metodo: 'transferencia_bancaria' }
        },
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 40).toISOString(),
            origen: 'tickets',
            tipo: 'INFO',
            accion: 'TICKET_ESTADO_ACTUALIZADO',
            descripcion: 'Ticket #3 "Falla enlace de fibra óptica" movido al estado "En Proceso".',
            usuario: { nombre: 'Staff Soporte', email: 'staff@crm.com', rol: 'staff' },
            ip: '181.47.88.12',
            detalles: { ticketId: 3, anterior: 'Prospecto', nuevo: 'En Proceso' }
        },
        {
            id: nextSystemLogId++,
            timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
            origen: 'auth',
            tipo: 'SECURITY',
            accion: 'SESION_ADMIN_INICIADA',
            descripcion: 'Autenticación exitosa de Administrador con credenciales de alta seguridad.',
            usuario: { nombre: 'Juan Pascuzzi', email: 'jpascuzzi@dacas.com', rol: 'admin' },
            ip: '127.0.0.1',
            detalles: { sesionActiva: true, mfa: 'ok', client: 'Web App' }
        }
    ];
}

function saveSystemLogs() {
    try {
        if (systemLogsDb.length > 2500) {
            systemLogsDb = systemLogsDb.slice(systemLogsDb.length - 2500);
        }
        fs.writeFileSync(SYSTEM_LOGS_FILE_PATH, JSON.stringify(systemLogsDb, null, 2), 'utf8');
    } catch (err) {
        console.error('Error guardando system_logs.json:', err);
    }
}

function registrarLog({ origen = 'sistema', tipo = 'INFO', accion, descripcion, usuario, req, detalles = {} }) {
    try {
        let userObj = { nombre: 'Sistema / Visitante', email: 'sistema@dacas.com', rol: 'system' };
        let ip = '127.0.0.1';

        if (req) {
            const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
            ip = Array.isArray(rawIp) ? rawIp[0] : (rawIp.split(',')[0] || '127.0.0.1').trim();
            if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
            
            if (req.user) {
                userObj = {
                    id: req.user.id,
                    nombre: req.user.nombre || req.user.name || 'Usuario',
                    email: req.user.email || req.user.correo || '',
                    rol: req.user.rol || req.user.role || 'user'
                };
            }
        }

        if (usuario) {
            if (typeof usuario === 'string') {
                userObj = { nombre: usuario, email: usuario, rol: 'user' };
            } else {
                userObj = { ...userObj, ...usuario };
            }
        }

        const nuevoLog = {
            id: nextSystemLogId++,
            timestamp: new Date().toISOString(),
            origen: (origen || 'sistema').toLowerCase(), // 'dashboard' | 'ecommerce' | 'auth' | 'tickets' | 'usuarios' | 'sistema' | 'config'
            tipo: (tipo || 'INFO').toUpperCase(), // 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY'
            accion: accion || 'EVENTO_GENERAL',
            descripcion: descripcion || 'Acción registrada en el sistema.',
            usuario: userObj,
            ip,
            detalles: detalles || {}
        };

        systemLogsDb.unshift(nuevoLog); // Más reciente primero
        saveSystemLogs();
        return nuevoLog;
    } catch (e) {
        console.error('Error al registrar log de auditoría:', e);
    }
}

function obtenerLogs({ origen, tipo, search, limit = 150, page = 1 } = {}) {
    loadSystemLogs();
    let filtrados = [...systemLogsDb];

    if (origen && origen !== 'todos' && origen !== 'all') {
        const oLower = origen.toLowerCase();
        if (oLower === 'carritos' || oLower === 'carritos_abandonados' || oLower === 'abandonados') {
            filtrados = filtrados.filter(l => (l.accion || '').toUpperCase().includes('CARRITO'));
        } else if (oLower === 'catalogo' || oLower === 'visitas_catalogo' || oLower === 'productos') {
            filtrados = filtrados.filter(l => (l.accion || '').toUpperCase().includes('PRODUCTO_VISITADO') || (l.accion || '').toUpperCase().includes('CATALOGO'));
        } else {
            filtrados = filtrados.filter(l => (l.origen || '').toLowerCase() === oLower);
        }
    }

    if (tipo && tipo !== 'todos' && tipo !== 'all') {
        const tUpper = tipo.toUpperCase();
        filtrados = filtrados.filter(l => (l.tipo || '').toUpperCase() === tUpper);
    }

    if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        filtrados = filtrados.filter(l => {
            const acc = (l.accion || '').toLowerCase();
            const desc = (l.descripcion || '').toLowerCase();
            const userNom = (l.usuario?.nombre || '').toLowerCase();
            const userEmail = (l.usuario?.email || '').toLowerCase();
            const ip = (l.ip || '').toLowerCase();
            const sku = (l.detalles?.sku || '').toLowerCase();
            const prodName = (l.detalles?.productName || '').toLowerCase();
            const itemsStr = JSON.stringify(l.detalles?.items || '').toLowerCase();
            return acc.includes(q) || desc.includes(q) || userNom.includes(q) || userEmail.includes(q) || ip.includes(q) || sku.includes(q) || prodName.includes(q) || itemsStr.includes(q);
        });
    }

    const total = filtrados.length;
    const l = parseInt(limit) || 150;
    const p = parseInt(page) || 1;
    const startIndex = (p - 1) * l;
    const items = filtrados.slice(startIndex, startIndex + l);

    return {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l) || 1,
        logs: items
    };
}

function obtenerEstadisticasLogs() {
    loadSystemLogs();
    const total = systemLogsDb.length;
    const ecommerce = systemLogsDb.filter(l => l.origen === 'ecommerce').length;
    
    // Carritos abandonados / sin compra
    const carritosLogs = systemLogsDb.filter(l => (l.accion || '').toUpperCase().includes('CARRITO_ABANDONADO') || (l.accion || '').toUpperCase().includes('CARRITO_SIN_COMPRA'));
    const carritos_abandonados = carritosLogs.length;
    const monto_carritos_abandonados = carritosLogs.reduce((sum, l) => sum + (parseFloat(l.detalles?.total || l.detalles?.monto) || 0), 0);

    // Visitas al catálogo y fichas de producto
    const visitas_catalogo = systemLogsDb.filter(l => (l.accion || '').toUpperCase().includes('PRODUCTO_VISITADO') || (l.accion || '').toUpperCase().includes('CATALOGO_EXPLORADO')).length;

    const dashboard = systemLogsDb.filter(l => l.origen === 'dashboard' || l.origen === 'tickets').length;
    const auth = systemLogsDb.filter(l => l.origen === 'auth' || l.origen === 'usuarios').length;
    const security = systemLogsDb.filter(l => l.tipo === 'SECURITY').length;
    const warning = systemLogsDb.filter(l => l.tipo === 'WARNING' || l.tipo === 'ERROR').length;

    return {
        total,
        ecommerce,
        carritos_abandonados,
        monto_carritos_abandonados,
        visitas_catalogo,
        dashboard,
        auth,
        security,
        warning
    };
}

function limpiarLogs() {
    systemLogsDb = [];
    saveSystemLogs();
    return true;
}

module.exports = {
    registrarLog,
    obtenerLogs,
    obtenerEstadisticasLogs,
    limpiarLogs
};
