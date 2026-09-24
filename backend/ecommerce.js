const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { generateProductDescription, generateDimensionsAI, generateCategoriesAI } = require('./services/geminiService');

const router = express.Router();

// Configuración de Multer para imágenes y multimedia de productos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.xls', '.xlsx', '.csv'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se admiten imágenes, PDFs y planillas Excel/CSV.'));
    }
    cb(null, true);
  }
});

// PostgreSQL Connection with automatic In-Memory Fallback for development/standalone mode
const rawPool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ecommerce_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

let isPgConnected = false;
rawPool.connect()
  .then(async client => {
    isPgConnected = true;
    try {
      await client.query(`
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS promotional_price DECIMAL(10, 2);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS secondary_images JSONB;
      `);
    } catch (_) {}
    client.release();
    console.log('✅ Conectado exitosamente a PostgreSQL (E-commerce)');
  })
  .catch(() => {
    isPgConnected = false;
    console.log('ℹ️ PostgreSQL no disponible. Usando motor E-commerce En Memoria con datos iniciales.');
  });

// --- IN-MEMORY DATABASE FALLBACK STORE ---
const inMem = {
  users: [
    {
      id: 1,
      name: 'Usuario Demo',
      email: 'demo@dacas.com',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Empresa Demo S.A.',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+54 11 4000-1234',
      numero_nit: '30-12345678-9',
      direccion_legal: 'Av. Corrientes 1234, Piso 8',
      direccion_entrega: 'Av. del Libertador 4500, Depósito 2',
      ciudad: 'Buenos Aires',
      country_id: 1,
      status: 'activo',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      nombre_compras: 'Laura Gómez',
      telefono_compras: '+54 11 4000-1235',
      email_compras: 'compras@empresademo.com.ar',
      nombre_pagos: 'Martín Rodríguez',
      telefono_pagos: '+54 11 4000-1236',
      email_pagos: 'pagos@empresademo.com.ar',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'carlos@redesnet.com.ar',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'RedesNet Soluciones IT S.R.L.',
      tipo_cliente: 'Integrador IT',
      phone: '+54 11 5555-8899',
      numero_nit: '30-71458922-4',
      ciudad: 'Buenos Aires',
      country_id: 1,
      status: 'pendiente',
      avatar_url: null,
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  change_requests: [
    {
      id: 1,
      user_id: 1,
      user_name: 'Usuario Demo',
      user_email: 'demo@dacas.com',
      company_name: 'Empresa Demo S.A.',
      request_type: 'Cambio de Domicilio de Entrega',
      details: 'Solicitamos actualizar la dirección de entrega al nuevo centro de distribución en Av. del Libertador 4500.',
      status: 'aprobado',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  countries: [
    { id: 1, code: 'AR', name: 'Argentina', tax_rate: '21.00', shipping_cost: '15.00', nationalization_cost: '5.00', discount_rate: '0.00' },
    { id: 2, code: 'UY', name: 'Uruguay', tax_rate: '22.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 3, code: 'CL', name: 'Chile', tax_rate: '19.00', shipping_cost: '18.00', nationalization_cost: '2.00', discount_rate: '5.00' },
    { id: 4, code: 'MX', name: 'México', tax_rate: '16.00', shipping_cost: '25.00', nationalization_cost: '10.00', discount_rate: '0.00' },
    { id: 5, code: 'ES', name: 'España', tax_rate: '21.00', shipping_cost: '30.00', nationalization_cost: '0.00', discount_rate: '10.00' },
    { id: 6, code: 'US', name: 'Estados Unidos', tax_rate: '0.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' }
  ],
  products: [
    {
      id: 1,
      name: 'Fortinet FortiGate 60F - Next Generation Firewall',
      brand: 'Fortinet',
      category: 'ciberseguridad',
      sku: 'FG-60F-BDL-950-12',
      description: '<p>Firewall empresarial de última generación con procesador de seguridad SOC4 (SD-WAN seguro, IPS, Antivirus, Control de Aplicaciones y VPN SSL).</p>',
      price: '890.00',
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Cisco Catalyst C9200L Switch 24 Puertos PoE+ (4x10G Uplink)',
      brand: 'Cisco',
      category: 'networking',
      sku: 'C9200L-24P-4X-E',
      description: '<p>Switch empresarial capa 3 administrable con 24 puertos Gigabit PoE+ (370W de presupuesto) y 4 uplinks fijos 10G SFP+.</p>',
      price: '1650.00',
      stock: 22,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Ubiquiti UniFi Dream Machine Pro (UDM-Pro Enterprise Gateway)',
      brand: 'Ubiquiti',
      category: 'networking',
      sku: 'UDM-PRO-ENT',
      description: '<p>Consola de red todo en uno: Security Gateway 10G SFP+, NVR UniFi Protect para videovigilancia y controlador UniFi OS integrado.</p>',
      price: '520.00',
      stock: 35,
      image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'MikroTik Cloud Router Switch CRS328-24P-4S+RM (PoE Dual)',
      brand: 'MikroTik',
      category: 'networking',
      sku: 'CRS328-24P-4S+RM',
      description: '<p>Switch de 24 puertos Gigabit con salida PoE automática 802.3af/at y 24V Pasivo + 4 puertos SFP+ de 10Gbps y fuente redundante.</p>',
      price: '480.00',
      stock: 28,
      image_url: 'https://images.unsplash.com/photo-1520869562399-e772f342b00a?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1520869562399-e772f342b00a?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Aruba Instant On AP22 Wi-Fi 6 (802.11ax 2x2 MU-MIMO)',
      brand: 'Aruba',
      category: 'wifi',
      sku: 'R4W02A-AP22',
      description: '<p>Punto de acceso empresarial Wi-Fi 6 de alta densidad con gestión en la nube sin costo de licencias, portal cautivo y soporte Mesh.</p>',
      price: '195.00',
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Licencia Anual FortiGuard Enterprise Protection Bundle',
      brand: 'Fortinet',
      category: 'licencias',
      sku: 'LIC-FG-ENT-1Y',
      description: '<p>Renovación y suscripción anual a servicios de seguridad avanzada: Anti-Malware en la nube, DLP, Sandboxing y filtrado Web DNS.</p>',
      price: '340.00',
      stock: 999,
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    }
  ],
  product_stock: [
    { id: 1, product_id: 1, country_id: 1, stock: 30 },
    { id: 2, product_id: 1, country_id: 2, stock: 15 },
    { id: 3, product_id: 2, country_id: 1, stock: 12 },
    { id: 4, product_id: 3, country_id: 1, stock: 25 },
    { id: 5, product_id: 4, country_id: 1, stock: 20 },
    { id: 6, product_id: 5, country_id: 1, stock: 40 }
  ],
  pricing_rules: [
    {
      id: 1,
      name: 'Descuento Mayorista Integradores IT en Fortinet (Argentina)',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '18.00',
      tipo_cliente: 'Integrador IT / Reseller',
      country_id: 1,
      brand: 'Fortinet',
      product_id: null,
      user_id: null,
      priority: 10,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Descuento Especial ISPs en Ubiquiti y MikroTik',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '20.00',
      tipo_cliente: 'Proveedor de Internet (ISP / WISP)',
      country_id: null,
      brand: 'Ubiquiti',
      product_id: null,
      user_id: null,
      priority: 8,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Convenio Corporativo Cisco Enterprise',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '12.00',
      tipo_cliente: 'Empresa Corporativa',
      country_id: null,
      brand: 'Cisco',
      product_id: null,
      user_id: null,
      priority: 5,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Descuento General Integradores IT en Networking & WiFi (Chile)',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '15.00',
      tipo_cliente: 'Integrador IT / Reseller',
      country_id: 3,
      brand: null,
      product_id: null,
      user_id: null,
      priority: 6,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 1042,
      user_id: 1,
      country_id: 1,
      total: '2470.00',
      subtotal: '2130.00',
      tax_applied: '447.30',
      shipping_applied: '15.00',
      nationalization_applied: '5.00',
      discount_applied: '127.30',
      status: 'entregado',
      payment_method: 'Transferencia B2B Bancaria (Factura A)',
      shipping_address: 'Av. del Libertador 4500, Depósito 2, Buenos Aires',
      tracking_number: 'DACAS-LOG-AR-99214',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      delivered_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 1049,
      user_id: 1,
      country_id: 1,
      total: '1530.00',
      subtotal: '1360.00',
      tax_applied: '285.60',
      shipping_applied: '15.00',
      nationalization_applied: '5.00',
      discount_applied: '135.60',
      status: 'en_camino',
      payment_method: 'Cuenta Corriente Corporativa 30 días',
      shipping_address: 'Av. del Libertador 4500, Depósito 2, Buenos Aires',
      tracking_number: 'DACAS-LOG-AR-99388',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 1055,
      user_id: 1,
      country_id: 1,
      total: '756.50',
      subtotal: '890.00',
      tax_applied: '0.00',
      shipping_applied: '0.00',
      nationalization_applied: '0.00',
      discount_applied: '133.50',
      status: 'procesando',
      payment_method: 'Transferencia B2B Bancaria (Factura A)',
      shipping_address: 'Av. del Libertador 4500, Depósito 2, Buenos Aires',
      tracking_number: 'DACAS-LOG-PENDING',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ],
  order_items: [
    {
      id: 1,
      order_id: 1042,
      product_id: 1,
      product_name: 'Fortinet FortiGate 60F - Next Generation Firewall',
      brand: 'Fortinet',
      sku: 'FG-60F-BDL-950-12',
      quantity: 2,
      price_at_purchase: '756.50',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 2,
      order_id: 1042,
      product_id: 3,
      product_name: 'Ubiquiti UniFi Dream Machine Pro (UDM-Pro Enterprise Gateway)',
      brand: 'Ubiquiti',
      sku: 'UDM-PRO-ENT',
      quantity: 1,
      price_at_purchase: '520.00',
      image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 3,
      order_id: 1049,
      product_id: 2,
      product_name: 'Cisco Catalyst C9200L Switch 24 Puertos PoE+ (4x10G Uplink)',
      brand: 'Cisco',
      sku: 'C9200L-24P-4X-E',
      quantity: 1,
      price_at_purchase: '1452.00',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 4,
      order_id: 1055,
      product_id: 1,
      product_name: 'Fortinet FortiGate 60F - Next Generation Firewall',
      brand: 'Fortinet',
      sku: 'FG-60F-BDL-950-12',
      quantity: 1,
      price_at_purchase: '756.50',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    }
  ],
  nextIds: { users: 3, countries: 7, products: 7, stock: 7, rules: 5, orders: 1056, order_items: 5, change_requests: 2 }
};

function executeInMemoryQuery(sql, params = []) {
  const norm = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT * FROM ecommerce_countries
  if (/^SELECT \* FROM ecommerce_countries/i.test(norm)) {
    if (/WHERE id = \$1/i.test(norm)) {
      const row = inMem.countries.find(c => c.id === parseInt(params[0]));
      return { rows: row ? [row] : [] };
    }
    const rows = [...inMem.countries].sort((a, b) => a.name.localeCompare(b.name));
    return { rows };
  }

  // 2. SELECT * FROM ecommerce_products
  if (/^SELECT \* FROM ecommerce_products/i.test(norm)) {
    if (/WHERE id = \$1/i.test(norm)) {
      const row = inMem.products.find(p => p.id === parseInt(params[0]));
      return { rows: row ? [row] : [] };
    }
    const rows = [...inMem.products].sort((a, b) => a.id - b.id);
    return { rows };
  }

  // 3. SELECT * FROM ecommerce_users
  if (/^SELECT \* FROM ecommerce_users/i.test(norm)) {
    if (/WHERE email = \$1/i.test(norm)) {
      const qEmail = (params[0] || '').toLowerCase();
      const user = inMem.users.find(u => u.email.toLowerCase() === qEmail || (qEmail === 'demo@berta.com' && u.email === 'demo@dacas.com'));
      return { rows: user ? [user] : [] };
    }
    if (/WHERE id = \$1/i.test(norm)) {
      const user = inMem.users.find(u => u.id === parseInt(params[0]));
      return { rows: user ? [user] : [] };
    }
    return { rows: inMem.users };
  }

  // 3.1 UPDATE ecommerce_users SET status = $1 WHERE id = $2
  if (/^UPDATE ecommerce_users SET status = \$1 WHERE id = \$2/i.test(norm)) {
    const status = params[0];
    const userId = parseInt(params[1]);
    const u = inMem.users.find(user => user.id === userId);
    if (u) {
      u.status = status;
      return { rows: [u] };
    }
    return { rows: [] };
  }

  // 4. INSERT INTO ecommerce_users
  if (/^INSERT INTO ecommerce_users/i.test(norm)) {
    const existing = inMem.users.find(u => u.email.toLowerCase() === (params[1] || params[0] || (params[0] && params[0].email) || '').toLowerCase());
    if (existing) {
      const err = new Error('Email already exists');
      err.code = '23505';
      throw err;
    }
    const id = inMem.nextIds.users++;
    let newUser;
    if (params.length === 3) {
      newUser = { 
        id, 
        name: params[0], 
        email: params[1], 
        password_hash: params[2], 
        status: 'pendiente',
        created_at: new Date().toISOString() 
      };
    } else if (params.length === 4) {
      newUser = { 
        id, 
        name: params[0], 
        email: params[1], 
        password_hash: params[2], 
        status: params[3] || 'pendiente',
        created_at: new Date().toISOString() 
      };
    } else {
      newUser = {
        id,
        name: params[0], email: params[1], password_hash: params[2], razon_social: params[3], tipo_cliente: params[4],
        direccion_legal: params[5], localidad: params[6], codigo_postal: params[7], ciudad: params[8], country_id: params[9],
        phone: params[10], fecha_limite_facturacion: params[11], web: params[12], report_to_country_id: params[13],
        vendedor: params[14], direccion_entrega: params[15], localidad_entrega: params[16], codigo_postal_entrega: params[17],
        ciudad_entrega: params[18], pais_entrega_id: params[19], tipo_iva: params[20], numero_nit: params[21],
        nombre_compras: params[22], telefono_compras: params[23], email_compras: params[24], nombre_pagos: params[25],
        telefono_pagos: params[26], email_pagos: params[27], nombre_admin: params[28], telefono_admin: params[29],
        email_admin: params[30], email_factura_electronica: params[31], email_contacto_compras: params[32],
        email_cotizaciones_automaticas: params[33], address: params[34], company: params[35],
        status: params[36] || 'activo',
        created_at: new Date().toISOString()
      };
    }
    inMem.users.push(newUser);
    return { rows: [newUser] };
  }

  // 5. SELECT u.*, c.name as country_name FROM ecommerce_users
  if (/FROM ecommerce_users u/i.test(norm)) {
    if (/WHERE u\.id = \$1/i.test(norm)) {
      const u = inMem.users.find(user => user.id === parseInt(params[0]));
      if (!u) return { rows: [] };
      const c = inMem.countries.find(country => country.id === u.country_id);
      return { rows: [{ ...u, status: u.status || 'activo', country_name: c ? c.name : null }] };
    }
    const rows = inMem.users.map(u => {
      const c = inMem.countries.find(country => country.id === u.country_id);
      return { ...u, status: u.status || 'activo', country_name: c ? c.name : null };
    });
    return { rows };
  }

  // 6. UPDATE ecommerce_users
  if (/^UPDATE ecommerce_users/i.test(norm)) {
    const userId = parseInt(params[params.length - 1]);
    const idx = inMem.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      inMem.users[idx] = {
        ...inMem.users[idx],
        name: params[0], email: params[1], razon_social: params[2], tipo_cliente: params[3],
        direccion_legal: params[4], localidad: params[5], codigo_postal: params[6], ciudad: params[7],
        country_id: params[8], phone: params[9], fecha_limite_facturacion: params[10], web: params[11],
        report_to_country_id: params[12], vendedor: params[13], direccion_entrega: params[14], localidad_entrega: params[15],
        codigo_postal_entrega: params[16], ciudad_entrega: params[17], pais_entrega_id: params[18], tipo_iva: params[19],
        numero_nit: params[20], nombre_compras: params[21], telefono_compras: params[22], email_compras: params[23],
        nombre_pagos: params[24], telefono_pagos: params[25], email_pagos: params[26], nombre_admin: params[27],
        telefono_admin: params[28], email_admin: params[29], email_factura_electronica: params[30], email_contacto_compras: params[31],
        email_cotizaciones_automaticas: params[32], address: params[33], company: params[34],
        status: params[35] !== undefined && typeof params[35] === 'string' && ['activo', 'pendiente', 'inactivo'].includes(params[35]) ? params[35] : inMem.users[idx].status
      };
      if (params.length >= 37) { // includes password
        inMem.users[idx].password_hash = params[35];
      }
      return { rows: [inMem.users[idx]] };
    }
    return { rows: [] };
  }

  // 7. PRICING RULES
  if (/FROM ecommerce_pricing_rules/i.test(norm)) {
    if (/is_active = true/i.test(norm)) {
      const rows = inMem.pricing_rules.filter(r => r.is_active).sort((a, b) => b.priority - a.priority);
      return { rows };
    }
    const rows = inMem.pricing_rules.map(r => {
      const p = inMem.products.find(prod => prod.id === r.product_id);
      const c = inMem.countries.find(country => country.id === r.country_id);
      const u = inMem.users.find(user => user.id === r.user_id);
      return {
        ...r,
        product_name: p ? p.name : null,
        country_name: c ? c.name : null,
        user_email: u ? u.email : null
      };
    }).sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return { rows };
  }

  if (/^INSERT INTO ecommerce_pricing_rules/i.test(norm)) {
    let newRule;
    if (params.length >= 11) {
      newRule = {
        id: inMem.nextIds.rules++,
        name: params[0],
        rule_type: params[1],
        value_type: params[2],
        value: String(params[3]),
        tipo_cliente: params[4] || null,
        country_id: params[5] ? parseInt(params[5]) : null,
        brand: params[6] || null,
        product_id: params[7] ? parseInt(params[7]) : null,
        user_id: params[8] ? parseInt(params[8]) : null,
        priority: parseInt(params[9]) || 0,
        is_active: params[10] !== false,
        created_at: new Date().toISOString()
      };
    } else {
      newRule = {
        id: inMem.nextIds.rules++,
        name: params[0],
        rule_type: params[1],
        value_type: params[2],
        value: String(params[3]),
        product_id: params[4] ? parseInt(params[4]) : null,
        country_id: params[5] ? parseInt(params[5]) : null,
        user_id: params[6] ? parseInt(params[6]) : null,
        priority: parseInt(params[7]) || 0,
        is_active: params[8] !== false,
        tipo_cliente: null,
        brand: null,
        created_at: new Date().toISOString()
      };
    }
    inMem.pricing_rules.push(newRule);
    return { rows: [newRule] };
  }

  if (/^UPDATE ecommerce_pricing_rules/i.test(norm)) {
    const id = parseInt(params[params.length - 1]);
    const idx = inMem.pricing_rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      if (params.length >= 12) {
        inMem.pricing_rules[idx] = {
          ...inMem.pricing_rules[idx],
          name: params[0],
          rule_type: params[1],
          value_type: params[2],
          value: String(params[3]),
          tipo_cliente: params[4] || null,
          country_id: params[5] ? parseInt(params[5]) : null,
          brand: params[6] || null,
          product_id: params[7] ? parseInt(params[7]) : null,
          user_id: params[8] ? parseInt(params[8]) : null,
          priority: parseInt(params[9]) || 0,
          is_active: params[10] !== false
        };
      } else {
        inMem.pricing_rules[idx] = {
          ...inMem.pricing_rules[idx],
          name: params[0],
          rule_type: params[1],
          value_type: params[2],
          value: String(params[3]),
          product_id: params[4] ? parseInt(params[4]) : null,
          country_id: params[5] ? parseInt(params[5]) : null,
          user_id: params[6] ? parseInt(params[6]) : null,
          priority: parseInt(params[7]) || 0,
          is_active: params[8] !== false
        };
      }
      return { rows: [inMem.pricing_rules[idx]] };
    }
    return { rows: [] };
  }

  if (/^DELETE FROM ecommerce_pricing_rules/i.test(norm)) {
    const id = parseInt(params[0]);
    inMem.pricing_rules = inMem.pricing_rules.filter(r => r.id !== id);
    return { rows: [] };
  }

  // 8. STOCK PER COUNTRY
  if (/FROM ecommerce_product_stock/i.test(norm)) {
    if (/WHERE product_id = \$1 AND country_id = \$2/i.test(norm)) {
      const item = inMem.product_stock.find(s => s.product_id === parseInt(params[0]) && s.country_id === parseInt(params[1]));
      return { rows: item ? [item] : [] };
    }
    if (/WHERE s\.product_id = \$1/i.test(norm)) {
      const items = inMem.product_stock
        .filter(s => s.product_id === parseInt(params[0]))
        .map(s => {
          const c = inMem.countries.find(country => country.id === s.country_id);
          return { ...s, country_name: c ? c.name : null };
        });
      return { rows: items };
    }
  }

  if (/INSERT INTO ecommerce_product_stock/i.test(norm)) {
    const pId = parseInt(params[0]);
    const cId = parseInt(params[1]);
    const stockVal = parseInt(params[2]);
    let item = inMem.product_stock.find(s => s.product_id === pId && s.country_id === cId);
    if (item) {
      item.stock = stockVal;
    } else {
      item = { id: inMem.nextIds.stock++, product_id: pId, country_id: cId, stock: stockVal };
      inMem.product_stock.push(item);
    }
    return { rows: [item] };
  }

  // 9. ADMIN PRODUCTS CRUD
  if (/^INSERT INTO ecommerce_products/i.test(norm)) {
    const pData = (typeof params[0] === 'object' && params[0] !== null) ? params[0] : {
      name: params[0],
      description: params[1],
      price: String(params[2] || '0.00'),
      stock: parseInt(params[3]) || 0,
      image_url: params[4] || '',
      video_url: params[5] || '',
      compare_price: params[6] ? String(params[6]) : null,
      sku: params[7] || '',
      secondary_images: params[8] || [],
      category: params[9] || 'General'
    };

    const newProd = {
      id: inMem.nextIds.products++,
      name: pData.name || '',
      description: pData.description || '',
      price: String(pData.price || '0.00'),
      promotional_price: pData.promotional_price ? String(pData.promotional_price) : null,
      show_price: pData.show_price !== undefined ? pData.show_price : true,
      cost: pData.cost ? String(pData.cost) : '0.00',
      profit_margin: pData.profit_margin || '',
      product_type: pData.product_type || 'physical',
      stock_type: pData.stock_type || 'infinite',
      stock: pData.stock_type === 'infinite' ? 9999 : (parseInt(pData.stock) || 0),
      sku: pData.sku || '',
      barcode: pData.barcode || '',
      weight: pData.weight || '',
      depth: pData.depth || '',
      width: pData.width || '',
      height: pData.height || '',
      mpn: pData.mpn || '',
      age_group: pData.age_group || '',
      gender: pData.gender || '',
      categories: pData.categories || [pData.category || 'General'],
      variants: pData.variants || [],
      image_url: pData.image_url || '',
      secondary_images: pData.secondary_images || [],
      video_url: pData.video_url || '',
      created_at: new Date().toISOString()
    };
    inMem.products.push(newProd);
    return { rows: [newProd] };
  }

  if (/^UPDATE ecommerce_products/i.test(norm)) {
    let id;
    let pData;
    if (typeof params[0] === 'object' && params[0] !== null) {
      pData = params[0];
      id = parseInt(params[1]);
    } else {
      id = parseInt(params[params.length - 1]);
      pData = {
        name: params[0],
        description: params[1],
        price: String(params[2] || '0.00'),
        stock: parseInt(params[3]) || 0,
        image_url: params[4] || '',
        video_url: params[5] || '',
        compare_price: params[6] ? String(params[6]) : null,
        sku: params[7] || '',
        secondary_images: params[8] || [],
        category: params[9] || 'General'
      };
    }

    const idx = inMem.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      inMem.products[idx] = {
        ...inMem.products[idx],
        ...pData,
        id,
        price: String(pData.price || inMem.products[idx].price || '0.00'),
        stock: pData.stock_type === 'infinite' ? 9999 : (pData.stock !== undefined ? parseInt(pData.stock) : inMem.products[idx].stock)
      };
      return { rows: [inMem.products[idx]] };
    }
    return { rows: [] };
  }

  if (/^DELETE FROM ecommerce_products/i.test(norm)) {
    const id = parseInt(params[0]);
    const idx = inMem.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = inMem.products.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // 10. ADMIN COUNTRIES CRUD
  if (/^INSERT INTO ecommerce_countries/i.test(norm)) {
    const newCountry = {
      id: inMem.nextIds.countries++,
      code: params[0],
      name: params[1],
      tax_rate: String(params[2] || 0),
      shipping_cost: String(params[3] || 0),
      nationalization_cost: String(params[4] || 0),
      discount_rate: String(params[5] || 0)
    };
    inMem.countries.push(newCountry);
    return { rows: [newCountry] };
  }

  if (/^UPDATE ecommerce_countries/i.test(norm)) {
    const id = parseInt(params[params.length - 1]);
    const idx = inMem.countries.findIndex(c => c.id === id);
    if (idx !== -1) {
      inMem.countries[idx] = {
        ...inMem.countries[idx],
        code: params[0],
        name: params[1],
        tax_rate: String(params[2]),
        shipping_cost: String(params[3]),
        nationalization_cost: String(params[4]),
        discount_rate: String(params[5])
      };
      return { rows: [inMem.countries[idx]] };
    }
    return { rows: [] };
  }

  if (/^DELETE FROM ecommerce_countries/i.test(norm)) {
    const id = parseInt(params[0]);
    inMem.countries = inMem.countries.filter(c => c.id !== id);
    return { rows: [] };
  }

  // 11. ORDERS & ORDER ITEMS
  if (/^INSERT INTO ecommerce_orders/i.test(norm)) {
    const newOrder = {
      id: inMem.nextIds.orders++,
      user_id: params[0],
      country_id: params[1],
      total: params[2],
      tax_applied: params[3],
      shipping_applied: params[4],
      nationalization_applied: params[5],
      discount_applied: params[6],
      stripe_payment_intent_id: params[7],
      status: params[8] || 'pending',
      created_at: new Date().toISOString()
    };
    inMem.orders.push(newOrder);
    return { rows: [newOrder] };
  }

  if (/^INSERT INTO ecommerce_order_items/i.test(norm)) {
    const item = {
      id: inMem.nextIds.order_items++,
      order_id: params[0],
      product_id: params[1],
      quantity: params[2],
      price_at_purchase: params[3]
    };
    inMem.order_items.push(item);
    return { rows: [item] };
  }

  if (/FROM ecommerce_orders/i.test(norm)) {
    if (/WHERE user_id = \$1/i.test(norm)) {
      const userOrders = inMem.orders.filter(o => o.user_id === parseInt(params[0])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: userOrders };
    }
    const rows = inMem.orders.map(o => {
      const u = inMem.users.find(user => user.id === o.user_id);
      const c = inMem.countries.find(country => country.id === o.country_id);
      const items = inMem.order_items.filter(it => it.order_id === o.id);
      return {
        ...o,
        user_name: u ? u.name : 'Desconocido',
        user_email: u ? u.email : 'N/A',
        user_company: u ? (u.razon_social || u.empresa || u.name) : 'Empresa Cliente',
        user_cuit: u ? (u.cuit || u.numero_nit || '') : '',
        user_phone: u ? (u.phone || u.telefono || '') : '',
        country_name: c ? c.name : 'Argentina',
        items: items
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows };
  }

  if (/^UPDATE ecommerce_orders SET status = \$1 WHERE id = \$2/i.test(norm)) {
    const status = params[0];
    const orderId = parseInt(params[1]);
    const order = inMem.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      return { rows: [order] };
    }
    return { rows: [] };
  }

  // 12. CHANGE REQUESTS
  if (/FROM ecommerce_change_requests/i.test(norm)) {
    if (/WHERE user_id = \$1/i.test(norm)) {
      const rows = inMem.change_requests.filter(c => c.user_id === parseInt(params[0])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows };
    }
    return { rows: inMem.change_requests };
  }

  if (/^INSERT INTO ecommerce_change_requests/i.test(norm)) {
    const newReq = {
      id: inMem.nextIds.change_requests++,
      user_id: params[0],
      user_name: params[1],
      user_email: params[2],
      company_name: params[3],
      request_type: params[4],
      details: params[5],
      status: 'pendiente',
      created_at: new Date().toISOString()
    };
    inMem.change_requests.push(newReq);
    return { rows: [newReq] };
  }

  // 13. ORDER ITEMS FOR ORDER
  if (/FROM ecommerce_order_items/i.test(norm)) {
    if (/WHERE order_id = \$1/i.test(norm)) {
      const items = inMem.order_items.filter(oi => oi.order_id === parseInt(params[0]));
      return { rows: items };
    }
  }

  return { rows: [] };
}

const pool = {
  query: async (text, params) => {
    if (isPgConnected) {
      try {
        return await rawPool.query(text, params);
      } catch (err) {
        // Fallback if Postgres query fails unexpectedly
        return executeInMemoryQuery(text, params);
      }
    }
    return executeInMemoryQuery(text, params);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_ecommerce';

// Middleware to authenticate JWT or CRM Session (Mandatory)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-session-id'];
  let token = null;
  if (authHeader) {
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }
  }
  
  if (!token) return res.status(401).json({ error: 'Token o sesión requerida' });

  // 1. Try JWT
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
      return next();
    }

    // 2. Try CRM session if router has validator callback
    if (router.validateSession) {
      const session = router.validateSession(token);
      if (session) {
        req.user = {
          id: session.usuarioId,
          email: session.email,
          name: session.nombre,
          role: session.rol,
          rol: session.rol
        };
        return next();
      }
    }

    return res.status(403).json({ error: 'Token o sesión inválida o expirada' });
  });
};

// Middleware to verify Administrator Role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  const role = req.user.role || req.user.rol;
  if (role !== 'admin' && role !== 'admin_ecommerce') {
    return res.status(403).json({ error: 'Permisos insuficientes. Se requiere rol de administrador.' });
  }
  next();
};

// Middleware for Optional JWT (e.g. checkout by guest or registered user)
const optionalAuthToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
};

// ==========================================
// AUTHENTICATION & CLIENT REGISTRATION
// ==========================================

// Solicitud de registro de cliente desde el Shop (B2B)
router.post('/auth/register', async (req, res) => {
  try {
    const { 
      name, email, password, razon_social, tipo_cliente, phone, 
      numero_nit, country_id, ciudad, direccion_legal, web, company 
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    // Check if PG or in-memory
    let result;
    if (isPgConnected) {
      result = await pool.query(
        `INSERT INTO ecommerce_users (
          name, email, password_hash, razon_social, tipo_cliente, phone,
          numero_nit, country_id, ciudad, direccion_legal, web, company, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, name, email, status`,
        [
          name || 'Cliente B2B',
          email,
          hashedPassword,
          razon_social || name || '',
          tipo_cliente || 'Reseller / Integrador',
          phone || '',
          numero_nit || '',
          country_id || null,
          ciudad || '',
          direccion_legal || '',
          web || '',
          company || razon_social || '',
          'pendiente' // Requiere aprobación manual por el administrador
        ]
      );
    } else {
      result = await pool.query(
        'INSERT INTO ecommerce_users',
        [
          name || 'Cliente B2B', email, hashedPassword, razon_social || name || '', tipo_cliente || 'Reseller / Integrador',
          direccion_legal || '', '', '', ciudad || '', country_id || 1,
          phone || '', null, web || '', null, '', '', '', '', '', null, '', numero_nit || '',
          '', '', '', '', '', '', '', '', '',
          email, email, email, direccion_legal || '', company || razon_social || '',
          'pendiente'
        ]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de registro enviada con éxito. Por políticas mayoristas de DACAS, su cuenta será revisada y activada por un administrador a la brevedad.',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        status: 'pendiente'
      }
    });
  } catch (error) {
    if (error.code === '23505') { // unique violation
      res.status(400).json({ error: 'Ya existe una cuenta o solicitud registrada con este email.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    const result = await pool.query('SELECT * FROM ecommerce_users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const userStatus = user.status || 'activo';

      if (userStatus === 'pendiente') {
        return res.status(403).json({ 
          error: 'Su cuenta aún está PENDIENTE DE APROBACIÓN por el administrador de DACAS. Un ejecutivo se contactará para habilitar su acceso mayorista.',
          pending: true
        });
      }

      if (userStatus === 'inactivo') {
        return res.status(403).json({ 
          error: 'Su cuenta se encuentra desactivada temporalmente. Por favor contacte al soporte de DACAS.',
          inactive: true
        });
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name, razon_social: user.razon_social }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({ 
        token: accessToken, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          razon_social: user.razon_social || user.name,
          tipo_cliente: user.tipo_cliente,
          phone: user.phone,
          status: userStatus
        } 
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas. Verifique su email y contraseña.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// COUNTRIES
// ==========================================

router.get('/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ecommerce_countries ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PRICING ENGINE UTILITIES
// ==========================================

function calculateCustomProductPrice(product, user, allRules) {
  const basePrice = parseFloat(product.price) || 0;
  if (!user) {
    return {
      price: basePrice.toFixed(2),
      base_price: basePrice.toFixed(2),
      client_price: null,
      promotional_price: null,
      discount_percentage: null,
      discount_percent: null,
      applied_rule: null,
      is_locked: true
    };
  }

  // Filter rules matching dimensions: user_id, tipo_cliente, country_id, brand, product_id
  const matchingRules = (allRules || []).filter(r => {
    if (!r.is_active) return false;
    
    // Dimension: Specific user override
    if (r.user_id && parseInt(r.user_id) !== parseInt(user.id)) {
      return false;
    }

    // Dimension: Specific product override
    if (r.product_id && parseInt(r.product_id) !== parseInt(product.id)) {
      return false;
    }

    // Dimension: Tipo de Cliente (if specified and rule doesn't target a specific user)
    if (!r.user_id && r.tipo_cliente && r.tipo_cliente !== 'all' && r.tipo_cliente !== user.tipo_cliente) {
      return false;
    }

    // Dimension: País (if specified and rule doesn't target a specific user)
    if (!r.user_id && r.country_id && parseInt(r.country_id) !== parseInt(user.country_id)) {
      return false;
    }

    // Dimension: Marca del equipo (Brand)
    if (r.brand && r.brand !== 'all' && (!product.brand || product.brand.toLowerCase() !== r.brand.toLowerCase())) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Specific client rules get top priority boost (+1000), specific product rules get (+500)
    const prioA = (parseInt(a.priority) || 0) + (a.user_id ? 1000 : 0) + (a.product_id ? 500 : 0);
    const prioB = (parseInt(b.priority) || 0) + (b.user_id ? 1000 : 0) + (b.product_id ? 500 : 0);
    return prioB - prioA;
  });

  let finalPrice = basePrice;
  let appliedRule = null;

  if (matchingRules.length > 0) {
    const topRule = matchingRules[0];
    const ruleVal = parseFloat(topRule.value) || 0;
    
    if (topRule.rule_type === 'discount') {
      if (topRule.value_type === 'percentage') {
        finalPrice = Math.max(0, basePrice * (1 - ruleVal / 100));
      } else {
        finalPrice = Math.max(0, basePrice - ruleVal);
      }
      appliedRule = {
        id: topRule.id,
        name: topRule.name,
        rule_name: topRule.name,
        type: 'discount',
        value: ruleVal,
        value_type: topRule.value_type,
        summary: [
          topRule.user_id ? 'Tarifa Especial Cliente' : null,
          topRule.tipo_cliente ? topRule.tipo_cliente : null,
          topRule.brand ? topRule.brand : null,
          topRule.value_type === 'percentage' ? `-${ruleVal}%` : `-$${ruleVal}`
        ].filter(Boolean).join(' · ')
      };
    } else if (topRule.rule_type === 'markup') {
      if (topRule.value_type === 'percentage') {
        finalPrice = basePrice * (1 + ruleVal / 100);
      } else {
        finalPrice = basePrice + ruleVal;
      }
      appliedRule = { id: topRule.id, name: topRule.name, rule_name: topRule.name, type: 'markup', value: ruleVal, value_type: topRule.value_type };
    } else if (topRule.rule_type === 'fixed_price') {
      finalPrice = ruleVal;
      appliedRule = { id: topRule.id, name: topRule.name, rule_name: topRule.name, type: 'fixed_price', value: ruleVal };
    }
  }

  const hasDiscount = finalPrice < basePrice;
  const discountPercent = hasDiscount && basePrice > 0 ? Math.round((1 - finalPrice / basePrice) * 100) : null;

  return {
    price: finalPrice.toFixed(2), // Active discounted price to charge
    base_price: basePrice.toFixed(2), // Original price
    client_price: finalPrice.toFixed(2),
    promotional_price: hasDiscount ? finalPrice.toFixed(2) : null,
    discount_percentage: discountPercent,
    discount_percent: discountPercent,
    applied_rule: appliedRule,
    is_locked: false
  };
}

// ==========================================
// PRODUCTS
// ==========================================

router.get('/products', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userRes = await pool.query('SELECT * FROM ecommerce_users WHERE id = $1', [decoded.id]);
        if (userRes.rows.length > 0 && (userRes.rows[0].status || 'activo') === 'activo') {
          user = userRes.rows[0];
        }
      } catch (_) {}
    }

    const result = await pool.query('SELECT * FROM ecommerce_products ORDER BY id ASC');
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
    const allRules = rulesRes.rows;

    const formatted = result.rows.map(p => {
      const pricing = calculateCustomProductPrice(p, user, allRules);
      return {
        ...p,
        ...pricing
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userRes = await pool.query('SELECT * FROM ecommerce_users WHERE id = $1', [decoded.id]);
        if (userRes.rows.length > 0 && (userRes.rows[0].status || 'activo') === 'activo') {
          user = userRes.rows[0];
        }
      } catch (_) {}
    }

    const result = await pool.query('SELECT * FROM ecommerce_products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
    const pricing = calculateCustomProductPrice(result.rows[0], user, rulesRes.rows);

    res.json({
      ...result.rows[0],
      ...pricing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint público/autenticado para consultar reglas de precio activas
router.get('/pricing-rules', async (req, res) => {
  try {
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true ORDER BY priority DESC');
    res.json(rulesRes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ORDERS & PAYMENTS (Stripe)
// ==========================================

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { items, country_id } = req.body; // array of { id, quantity }, country_id
    const userId = req.user.id;
    
    // Get country default rules as baseline
    let baseTaxRate = 0;
    let baseShippingCost = 0;
    let baseNationalizationCost = 0;
    let baseDiscountRate = 0;

    if (country_id) {
      const countryRes = await pool.query('SELECT * FROM ecommerce_countries WHERE id = $1', [country_id]);
      if (countryRes.rows.length > 0) {
        const c = countryRes.rows[0];
        baseTaxRate = parseFloat(c.tax_rate) || 0;
        baseShippingCost = parseFloat(c.shipping_cost) || 0;
        baseNationalizationCost = parseFloat(c.nationalization_cost) || 0;
        baseDiscountRate = parseFloat(c.discount_rate) || 0;
      }
    }

    // Fetch all active rules
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true ORDER BY priority DESC');
    const allRules = rulesRes.rows;

    let subTotalAmount = 0;
    let itemDiscounts = 0;
    let itemTaxes = 0;
    let itemShipping = 0;
    let itemNationalization = 0;
    
    const orderItems = [];

    for (let item of items) {
      const productResult = await pool.query('SELECT * FROM ecommerce_products WHERE id = $1', [item.id]);
      const product = productResult.rows[0];
      if (!product) return res.status(400).json({ error: `Product ${item.id} not found` });

      // Check stock
      let stockAvailable = product.stock;
      if (country_id) {
         const stockRes = await pool.query('SELECT stock FROM ecommerce_product_stock WHERE product_id = $1 AND country_id = $2', [product.id, country_id]);
         if (stockRes.rows.length > 0) {
           stockAvailable = stockRes.rows[0].stock;
         } else {
           stockAvailable = 0;
         }
      }

      if (stockAvailable < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name} in the selected country` });
      }
      
      const itemPrice = parseFloat(product.price);
      const itemTotal = itemPrice * item.quantity;
      subTotalAmount += itemTotal;
      
      // Evaluate Rules for this item
      // Rule matching: applies if condition is NULL OR condition matches current context
      const applicableRules = allRules.filter(r => 
        (r.product_id === null || r.product_id === product.id) &&
        (r.country_id === null || r.country_id === parseInt(country_id)) &&
        (r.user_id === null || r.user_id === userId)
      );

      // Find top rule for each type
      const discountRule = applicableRules.find(r => r.rule_type === 'discount');
      const taxRule = applicableRules.find(r => r.rule_type === 'tax');
      const shippingRule = applicableRules.find(r => r.rule_type === 'shipping');
      const nationalizationRule = applicableRules.find(r => r.rule_type === 'nationalization');

      // Calculate Discount
      if (discountRule) {
        itemDiscounts += discountRule.value_type === 'percentage' 
          ? (itemTotal * (parseFloat(discountRule.value) / 100))
          : parseFloat(discountRule.value) * item.quantity; // Fixed amount per unit
      } else {
        itemDiscounts += itemTotal * (baseDiscountRate / 100);
      }

      const itemAfterDiscount = itemTotal - (discountRule ? 
        (discountRule.value_type === 'percentage' ? (itemTotal * (parseFloat(discountRule.value) / 100)) : parseFloat(discountRule.value) * item.quantity) 
        : (itemTotal * (baseDiscountRate / 100))
      );

      // Calculate Tax
      if (taxRule) {
        itemTaxes += taxRule.value_type === 'percentage'
          ? (itemAfterDiscount * (parseFloat(taxRule.value) / 100))
          : parseFloat(taxRule.value) * item.quantity;
      } else {
        itemTaxes += itemAfterDiscount * (baseTaxRate / 100);
      }

      // Calculate Shipping
      if (shippingRule) {
        itemShipping += shippingRule.value_type === 'percentage'
           ? (itemTotal * (parseFloat(shippingRule.value) / 100))
           : parseFloat(shippingRule.value); // Usually fixed per order, but if per item, apply here. Let's do fixed per item unit for flexibility.
      } else {
         // Base shipping is usually global per cart, we'll add it outside the loop to avoid multiplying per item.
      }

      // Calculate Nationalization
      if (nationalizationRule) {
        itemNationalization += nationalizationRule.value_type === 'percentage'
          ? (itemTotal * (parseFloat(nationalizationRule.value) / 100))
          : parseFloat(nationalizationRule.value);
      } else {
         // Base nationalization is global per cart.
      }

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: itemPrice
      });
    }

    // Determine final global shipping and nationalization
    // If ANY item had a shipping/nationalization rule, we already added it. 
    // If NO rules applied to any items for these, we use the base cost.
    // For simplicity, we just use the calculated ones. If they are 0 and no rules applied, use base.
    const finalShipping = itemShipping > 0 ? itemShipping : baseShippingCost;
    const finalNationalization = itemNationalization > 0 ? itemNationalization : baseNationalizationCost;

    const discountApplied = itemDiscounts;
    const taxApplied = itemTaxes;
    const amountAfterDiscount = subTotalAmount - discountApplied;
    const totalAmount = amountAfterDiscount + taxApplied + finalShipping + finalNationalization;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // in cents
      currency: 'usd', // or your currency
      metadata: {
        userId: req.user.id,
        countryId: country_id || ''
      }
    });

    // Create Order in DB (status pending)
    const orderResult = await pool.query(
      'INSERT INTO ecommerce_orders (user_id, country_id, total, tax_applied, shipping_applied, nationalization_applied, discount_applied, stripe_payment_intent_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [req.user.id, country_id || null, totalAmount, taxApplied, shippingCost, nationalizationCost, discountApplied, paymentIntent.id, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    // Insert Order Items
    for (let oi of orderItems) {
      await pool.query(
        'INSERT INTO ecommerce_order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, oi.product_id, oi.quantity, oi.price_at_purchase]
      );
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to mark order as paid (Usually you should use Stripe Webhooks instead)
router.post('/orders/:id/confirm-payment', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE ecommerce_orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *', ['paid', id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found or not yours' });
        }
        res.json(result.rows[0]);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ecommerce_orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CLIENT PORTAL & ACCOUNT MANAGEMENT
// ==========================================

// 1. Obtener perfil completo del cliente autenticado
router.get('/client/profile', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query(`
      SELECT u.*, c.name as country_name, c.tax_rate, c.shipping_cost 
      FROM ecommerce_users u 
      LEFT JOIN ecommerce_countries c ON u.country_id = c.id 
      WHERE u.id = $1
    `, [req.user.id]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const user = userRes.rows[0];
    delete user.password_hash;

    // Resumen de órdenes del cliente
    let orders = [];
    if (isPgConnected) {
      const ordRes = await pool.query('SELECT * FROM ecommerce_orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
      orders = ordRes.rows;
    } else {
      orders = inMem.orders.filter(o => o.user_id === req.user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const activeOrders = orders.filter(o => ['pendiente', 'procesando', 'en_camino', 'paid'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => ['entregado', 'completed'].includes(o.status)).length;

    // Reglas de precio aplicables al cliente
    let rules = [];
    if (isPgConnected) {
      const rRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
      rules = rRes.rows;
    } else {
      rules = inMem.pricing_rules.filter(r => r.is_active);
    }
    const myRules = rules.filter(r => 
      (r.user_id && parseInt(r.user_id) === req.user.id) || 
      (!r.user_id && r.tipo_cliente && r.tipo_cliente === user.tipo_cliente)
    );

    // Solicitudes de cambio
    let changeReqs = [];
    if (isPgConnected) {
      try {
        const cRes = await pool.query('SELECT * FROM ecommerce_change_requests WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        changeReqs = cRes.rows;
      } catch (_) {}
    } else {
      changeReqs = (inMem.change_requests || []).filter(cr => cr.user_id === req.user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({
      user,
      stats: {
        total_orders: orders.length,
        active_orders: activeOrders,
        delivered_orders: deliveredOrders,
        total_spent: totalSpent.toFixed(2),
        active_rules_count: myRules.length
      },
      active_rules: myRules,
      recent_change_requests: changeReqs
    });
  } catch (error) {
    console.error('Error en /client/profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Actualizar datos editables del perfil (teléfono, contacto, avatar, etc.)
router.put('/client/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, phone, ciudad, direccion_entrega, localidad_entrega, codigo_postal_entrega,
      web, avatar_url, nombre_compras, telefono_compras, email_compras,
      nombre_pagos, telefono_pagos, email_pagos
    } = req.body;

    if (isPgConnected) {
      await pool.query(`
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      `);
      const result = await pool.query(`
        UPDATE ecommerce_users SET 
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          ciudad = COALESCE($3, ciudad),
          direccion_entrega = COALESCE($4, direccion_entrega),
          localidad_entrega = COALESCE($5, localidad_entrega),
          codigo_postal_entrega = COALESCE($6, codigo_postal_entrega),
          web = COALESCE($7, web),
          avatar_url = COALESCE($8, avatar_url),
          nombre_compras = COALESCE($9, nombre_compras),
          telefono_compras = COALESCE($10, telefono_compras),
          email_compras = COALESCE($11, email_compras),
          nombre_pagos = COALESCE($12, nombre_pagos),
          telefono_pagos = COALESCE($13, telefono_pagos),
          email_pagos = COALESCE($14, email_pagos)
        WHERE id = $15
        RETURNING *
      `, [
        name, phone, ciudad, direccion_entrega, localidad_entrega, codigo_postal_entrega,
        web, avatar_url, nombre_compras, telefono_compras, email_compras,
        nombre_pagos, telefono_pagos, email_pagos, userId
      ]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      const updated = result.rows[0];
      delete updated.password_hash;
      return res.json({ success: true, message: 'Perfil actualizado exitosamente', user: updated });
    } else {
      const idx = inMem.users.findIndex(u => u.id === userId);
      if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (name !== undefined) inMem.users[idx].name = name;
      if (phone !== undefined) inMem.users[idx].phone = phone;
      if (ciudad !== undefined) inMem.users[idx].ciudad = ciudad;
      if (direccion_entrega !== undefined) inMem.users[idx].direccion_entrega = direccion_entrega;
      if (localidad_entrega !== undefined) inMem.users[idx].localidad_entrega = localidad_entrega;
      if (codigo_postal_entrega !== undefined) inMem.users[idx].codigo_postal_entrega = codigo_postal_entrega;
      if (web !== undefined) inMem.users[idx].web = web;
      if (avatar_url !== undefined) inMem.users[idx].avatar_url = avatar_url;
      if (nombre_compras !== undefined) inMem.users[idx].nombre_compras = nombre_compras;
      if (telefono_compras !== undefined) inMem.users[idx].telefono_compras = telefono_compras;
      if (email_compras !== undefined) inMem.users[idx].email_compras = email_compras;
      if (nombre_pagos !== undefined) inMem.users[idx].nombre_pagos = nombre_pagos;
      if (telefono_pagos !== undefined) inMem.users[idx].telefono_pagos = telefono_pagos;
      if (email_pagos !== undefined) inMem.users[idx].email_pagos = email_pagos;

      const updated = { ...inMem.users[idx] };
      delete updated.password_hash;
      return res.json({ success: true, message: 'Perfil actualizado exitosamente', user: updated });
    }
  } catch (error) {
    console.error('Error en PUT /client/profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Subir foto de perfil propia (Avatar)
router.post('/client/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen de avatar' });
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const userId = req.user.id;

    if (isPgConnected) {
      await pool.query(`ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
      await pool.query('UPDATE ecommerce_users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);
    } else {
      const u = inMem.users.find(user => user.id === userId);
      if (u) u.avatar_url = avatarUrl;
    }

    res.json({
      success: true,
      message: 'Foto de perfil actualizada con éxito',
      avatar_url: avatarUrl
    });
  } catch (error) {
    console.error('Error en POST /client/avatar:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Solicitar Modificación de Datos Corporativos / Fiscales
router.post('/client/request-change', authenticateToken, async (req, res) => {
  try {
    const { request_type, details, proposed_data } = req.body;
    const userId = req.user.id;

    if (!request_type || !details) {
      return res.status(400).json({ error: 'El tipo de solicitud y los detalles son obligatorios.' });
    }

    // Obtener datos actuales del usuario
    let user = null;
    if (isPgConnected) {
      const uRes = await pool.query('SELECT * FROM ecommerce_users WHERE id = $1', [userId]);
      user = uRes.rows[0];
    } else {
      user = inMem.users.find(u => u.id === userId);
    }

    const userName = user ? user.name : req.user.name || 'Cliente';
    const userEmail = user ? user.email : req.user.email;
    const companyName = user ? (user.razon_social || user.name) : 'Empresa';

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_change_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES ecommerce_users(id),
          user_name VARCHAR(150),
          user_email VARCHAR(150),
          company_name VARCHAR(150),
          request_type VARCHAR(150) NOT NULL,
          details TEXT NOT NULL,
          proposed_data JSONB,
          status VARCHAR(50) DEFAULT 'pendiente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await pool.query(`
        INSERT INTO ecommerce_change_requests (user_id, user_name, user_email, company_name, request_type, details, proposed_data, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
        RETURNING *
      `, [userId, userName, userEmail, companyName, request_type, details, JSON.stringify(proposed_data || {})]);

      return res.status(201).json({
        success: true,
        message: 'Solicitud de cambio enviada correctamente al equipo de administración de DACAS.',
        request: result.rows[0]
      });
    } else {
      const newReq = {
        id: inMem.nextIds.change_requests++,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        company_name: companyName,
        request_type,
        details,
        proposed_data: proposed_data || {},
        status: 'pendiente',
        created_at: new Date().toISOString()
      };
      if (!inMem.change_requests) inMem.change_requests = [];
      inMem.change_requests.push(newReq);

      return res.status(201).json({
        success: true,
        message: 'Solicitud de cambio enviada correctamente al equipo de administración de DACAS.',
        request: newReq
      });
    }
  } catch (error) {
    console.error('Error en POST /client/request-change:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Historial de compras y pedidos detallados del cliente
router.get('/client/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isPgConnected) {
      const ordersRes = await pool.query(`
        SELECT o.*, c.name as country_name
        FROM ecommerce_orders o
        LEFT JOIN ecommerce_countries c ON o.country_id = c.id
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
      `, [userId]);

      const ordersWithItems = [];
      for (let order of ordersRes.rows) {
        const itemsRes = await pool.query(`
          SELECT oi.*, p.name as product_name, p.sku, p.brand, p.image_url
          FROM ecommerce_order_items oi
          LEFT JOIN ecommerce_products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);

        ordersWithItems.push({
          ...order,
          items: itemsRes.rows
        });
      }

      return res.json(ordersWithItems);
    } else {
      // In-Memory store
      const userOrders = inMem.orders
        .filter(o => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const ordersWithItems = userOrders.map(order => {
        const c = inMem.countries.find(country => country.id === order.country_id);
        const rawItems = inMem.order_items.filter(oi => oi.order_id === order.id);
        const items = rawItems.map(oi => {
          const prod = inMem.products.find(p => p.id === oi.product_id);
          return {
            ...oi,
            product_name: oi.product_name || (prod ? prod.name : 'Producto DACAS'),
            sku: oi.sku || (prod ? prod.sku : 'SKU-DACAS'),
            brand: oi.brand || (prod ? prod.brand : 'DACAS'),
            image_url: oi.image_url || (prod ? prod.image_url : '')
          };
        });

        return {
          ...order,
          country_name: c ? c.name : 'Argentina',
          items
        };
      });

      return res.json(ordersWithItems);
    }
  } catch (error) {
    console.error('Error en /client/orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Creación directa de orden B2B desde el carrito (Checkout B2B Onboarding)
router.post('/client/orders', optionalAuthToken, async (req, res) => {
  try {
    const { 
      items, 
      country_id, 
      payment_method, 
      shipping_method,
      shipping_address, 
      billing_info,
      po_number,
      delivery_notes,
      notes 
    } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos' });
    }

    // Obtener usuario y reglas
    let user = null;
    let allRules = [];
    if (userId) {
      if (isPgConnected) {
        const uRes = await pool.query('SELECT * FROM ecommerce_users WHERE id = $1', [userId]);
        user = uRes.rows[0];
      } else {
        user = inMem.users.find(u => u.id === userId);
      }
    } else if (billing_info) {
      // Create a virtual user object from billing info for guest orders
      user = {
        id: null,
        name: billing_info.contacto_nombre || billing_info.empresa || 'Cliente Invitado',
        email: billing_info.contacto_email || 'invitado@ecommerce.com',
        empresa: billing_info.empresa || '',
        cuit: billing_info.cuit || '',
        tipo_factura: billing_info.tipo_factura || 'Factura A (Responsable Inscripto)',
        pais: 'Argentina'
      };
    }

    if (isPgConnected) {
      const rRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
      allRules = rRes.rows;
    } else {
      allRules = inMem.pricing_rules.filter(r => r.is_active);
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const orderItems = [];

    for (let item of items) {
      let prod = null;
      if (isPgConnected) {
        const pRes = await pool.query('SELECT * FROM ecommerce_products WHERE id = $1', [item.id]);
        prod = pRes.rows[0];
      } else {
        prod = inMem.products.find(p => p.id === item.id);
      }

      if (!prod) continue;
      const pricing = calculateCustomProductPrice(prod, user, allRules);
      const unitPrice = parseFloat(pricing.price) || parseFloat(prod.price) || 0;
      const originalPrice = parseFloat(pricing.base_price) || parseFloat(prod.price) || unitPrice;
      const qty = parseInt(item.quantity || item.qty, 10) || 1;

      const itemSubtotal = originalPrice * qty;
      const itemFinalTotal = unitPrice * qty;
      subtotal += itemSubtotal;
      totalDiscount += (itemSubtotal - itemFinalTotal);

      orderItems.push({
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku || '',
        brand: prod.brand || '',
        quantity: qty,
        price_at_purchase: unitPrice.toFixed(2),
        image_url: prod.image_url || ''
      });
    }

    const totalFinal = Math.max(0, subtotal - totalDiscount);
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const effectivePo = po_number || `OC-${orderNumber}`;
    const effectiveTracking = `DACAS-LOG-AR-${orderNumber}`;

    let orderToReturn = null;

    if (isPgConnected) {
      const orderRes = await pool.query(`
        INSERT INTO ecommerce_orders (
          user_id, country_id, total, tax_applied, shipping_applied, nationalization_applied, discount_applied, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [userId || 1, country_id || (user ? user.country_id : 1), totalFinal.toFixed(2), 0, 0, 0, totalDiscount.toFixed(2), 'procesando']);

      const newOrder = orderRes.rows[0];

      for (let oi of orderItems) {
        await pool.query(`
          INSERT INTO ecommerce_order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
        `, [newOrder.id, oi.product_id, oi.quantity, oi.price_at_purchase]);
      }

      orderToReturn = {
        ...newOrder,
        payment_method: payment_method || 'Cuenta Corriente Corporativa',
        shipping_method: shipping_method || 'Envío a Domicilio / Planta',
        shipping_address: shipping_address || (user ? user.direccion_entrega : 'Dirección registrada'),
        billing_info: billing_info || { razon_social: user?.empresa || user?.name, cuit: user?.cuit },
        po_number: effectivePo,
        delivery_notes: delivery_notes || notes || '',
        tracking_number: effectiveTracking,
        items: orderItems
      };
    } else {
      const newOrder = {
        id: inMem.nextIds.orders++,
        user_id: userId,
        country_id: country_id || (user ? user.country_id : 1),
        total: totalFinal.toFixed(2),
        subtotal: subtotal.toFixed(2),
        discount_applied: totalDiscount.toFixed(2),
        tax_applied: '0.00',
        shipping_applied: '0.00',
        nationalization_applied: '0.00',
        status: 'procesando',
        payment_method: payment_method || 'Cuenta Corriente Corporativa',
        shipping_method: shipping_method || 'Envío Express a Domicilio / Planta',
        shipping_address: shipping_address || (user ? user.direccion_entrega : 'Dirección registrada'),
        billing_info: billing_info || { razon_social: user?.empresa || user?.name, cuit: user?.cuit },
        po_number: effectivePo,
        delivery_notes: delivery_notes || notes || '',
        tracking_number: effectiveTracking,
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      inMem.orders.unshift(newOrder);

      for (let oi of orderItems) {
        inMem.order_items.push({
          id: inMem.nextIds.order_items++,
          order_id: newOrder.id,
          ...oi
        });
      }

      orderToReturn = {
        ...newOrder,
        items: orderItems
      };
    }

    // ── NOTIFICAR AUTOMÁTICAMENTE Y CREAR TICKET EN DEPARTAMENTO DE OPERACIONES ──
    let createdTicket = null;
    if (typeof router.onOrderCreated === 'function') {
      try {
        createdTicket = router.onOrderCreated({
          order: orderToReturn,
          user: user || { name: billing_info?.contacto_nombre, email: billing_info?.contacto_email, empresa: billing_info?.empresa, cuit: billing_info?.cuit },
          orderItems,
          billingInfo: billing_info || { empresa: user?.empresa || user?.name, cuit: user?.cuit },
          shippingInfo: { 
            shipping_method: orderToReturn.shipping_method,
            shipping_address: orderToReturn.shipping_address,
            delivery_notes: delivery_notes || notes || ''
          },
          paymentMethod: payment_method,
          trackingNumber: effectiveTracking,
          poNumber: effectivePo
        });
      } catch (e) {
        console.error('Error al invocar router.onOrderCreated:', e);
      }
    }

    return res.status(201).json({
      success: true,
      message: '¡Orden de compra generada exitosamente y ticket de operaciones abierto!',
      ticket_id: createdTicket ? createdTicket.id : null,
      order: orderToReturn
    });
  } catch (error) {
    console.error('Error en POST /client/orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RULES ENGINE (Pricing & Costs)
// ==========================================

router.get('/admin/rules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as product_name, c.name as country_name, u.email as user_email 
      FROM ecommerce_pricing_rules r
      LEFT JOIN ecommerce_products p ON r.product_id = p.id
      LEFT JOIN ecommerce_countries c ON r.country_id = c.id
      LEFT JOIN ecommerce_users u ON r.user_id = u.id
      ORDER BY r.priority DESC, r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/rules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, rule_type, value_type, value, tipo_cliente, country_id, brand, product_id, user_id, priority, is_active } = req.body;
    const query = `
      INSERT INTO ecommerce_pricing_rules (name, rule_type, value_type, value, tipo_cliente, country_id, brand, product_id, user_id, priority, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `;
    const values = [
      name, 
      rule_type, 
      value_type, 
      value, 
      tipo_cliente || null, 
      country_id ? parseInt(country_id) : null, 
      brand || null, 
      product_id ? parseInt(product_id) : null, 
      user_id ? parseInt(user_id) : null, 
      priority ? parseInt(priority) : 0, 
      is_active !== false
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/rules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rule_type, value_type, value, tipo_cliente, country_id, brand, product_id, user_id, priority, is_active } = req.body;
    const query = `
      UPDATE ecommerce_pricing_rules 
      SET name=$1, rule_type=$2, value_type=$3, value=$4, tipo_cliente=$5, country_id=$6, brand=$7, product_id=$8, user_id=$9, priority=$10, is_active=$11 
      WHERE id=$12 RETURNING *
    `;
    const values = [
      name, 
      rule_type, 
      value_type, 
      value, 
      tipo_cliente || null, 
      country_id ? parseInt(country_id) : null, 
      brand || null, 
      product_id ? parseInt(product_id) : null, 
      user_id ? parseInt(user_id) : null, 
      priority ? parseInt(priority) : 0, 
      is_active !== false, 
      id
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/rules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ecommerce_pricing_rules WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN ENDPOINTS & PROTECTED ACTIONS
// ==========================================

// --- MULTIMEDIA UPLOADS & AI GENERATION ---

router.post('/upload', authenticateToken, requireAdmin, upload.array('files', 15), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const urls = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
    res.json({
      success: true,
      urls: urls,
      primaryUrl: urls[0],
      files: req.files.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
        url: `${protocol}://${host}/uploads/${f.filename}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/generate-description', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del producto es requerido para generar la descripción' });
    }
    const description = await generateProductDescription(name, category);
    res.json({ success: true, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/generate-dimensions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const dimensions = await generateDimensionsAI(name);
    res.json({ success: true, ...dimensions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/generate-categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const categories = await generateCategoriesAI(name);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let result;
    if (isPgConnected) {
      const { name, description, price, stock, image_url } = req.body;
      result = await pool.query(
        'INSERT INTO ecommerce_products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, stock, image_url]
      );
    } else {
      result = await pool.query('INSERT INTO ecommerce_products', [req.body]);
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/products/bulk-upload', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { products: items, mode = 'upsert' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se recibieron productos válidos para importar.' });
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;
      
      const name = String(item.name || item.nombre || item.Producto || '').trim();
      if (!name) {
        errors.push(`Fila ${rowNum}: El nombre del producto es obligatorio.`);
        continue;
      }

      const rawPrice = item.price !== undefined ? item.price : (item.precio !== undefined ? item.precio : '0.00');
      const cleanPrice = String(rawPrice).replace('$', '').replace(/,/g, '.').trim();
      const priceNum = parseFloat(cleanPrice);
      const price = isNaN(priceNum) ? '0.00' : priceNum.toFixed(2);

      const rawPromoPrice = item.promotional_price !== undefined ? item.promotional_price : (item.precio_promocional !== undefined ? item.precio_promocional : null);
      let promotional_price = null;
      if (rawPromoPrice !== null && rawPromoPrice !== undefined && String(rawPromoPrice).trim() !== '') {
        const promoNum = parseFloat(String(rawPromoPrice).replace('$', '').replace(/,/g, '.').trim());
        if (!isNaN(promoNum) && promoNum > 0) promotional_price = promoNum.toFixed(2);
      }

      const rawStock = item.stock !== undefined ? item.stock : (item.Stock !== undefined ? item.Stock : 0);
      const stock = parseInt(rawStock, 10) || 0;

      const brand = String(item.brand || item.marca || item.Marca || '').trim();
      const category = String(item.category || item.categoria || item.Categoría || 'General').trim() || 'General';
      const sku = String(item.sku || item.SKU || item.codigo || item.Código || '').trim();
      const description = String(item.description || item.descripcion || item.Descripción || '').trim();
      const image_url = String(item.image_url || item.imagen || item.Imagen || item.foto || '').trim();

      if (isPgConnected) {
        let existing = null;
        if (sku) {
          const skuCheck = await pool.query('SELECT * FROM ecommerce_products WHERE sku = $1', [sku]);
          if (skuCheck.rows.length > 0) existing = skuCheck.rows[0];
        }
        if (!existing && name) {
          const nameCheck = await pool.query('SELECT * FROM ecommerce_products WHERE LOWER(name) = LOWER($1)', [name]);
          if (nameCheck.rows.length > 0) existing = nameCheck.rows[0];
        }

        if (existing && mode === 'upsert') {
          await pool.query(
            `UPDATE ecommerce_products 
             SET name = $1, brand = $2, category = $3, sku = $4, description = $5, price = $6, promotional_price = $7, stock = $8, image_url = COALESCE(NULLIF($9, ''), image_url) 
             WHERE id = $10`,
            [name, brand, category, sku, description, price, promotional_price, stock, image_url, existing.id]
          );
          updatedCount++;
        } else {
          await pool.query(
            `INSERT INTO ecommerce_products (name, brand, category, sku, description, price, promotional_price, stock, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [name, brand, category, sku, description, price, promotional_price, stock, image_url]
          );
          createdCount++;
        }
      } else {
        // In-Memory store
        let existing = null;
        if (sku) {
          existing = inMem.products.find(p => p.sku && p.sku.toLowerCase() === sku.toLowerCase());
        }
        if (!existing && name) {
          existing = inMem.products.find(p => p.name && p.name.toLowerCase() === name.toLowerCase());
        }

        if (existing && mode === 'upsert') {
          existing.name = name;
          if (brand) existing.brand = brand;
          if (category) existing.category = category;
          if (sku) existing.sku = sku;
          if (description) existing.description = description;
          existing.price = price;
          existing.promotional_price = promotional_price;
          existing.stock = stock;
          if (image_url) {
            existing.image_url = image_url;
            if (!existing.images || existing.images.length === 0) existing.images = [image_url];
          }
          updatedCount++;
        } else {
          const defaultImg = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop';
          const newProduct = {
            id: inMem.nextIds.products++,
            name,
            brand: brand || 'DACAS',
            category,
            categories: [category],
            sku,
            description: description || `<p>${name}</p>`,
            price,
            promotional_price,
            stock,
            image_url: image_url || defaultImg,
            images: image_url ? [image_url] : [defaultImg],
            created_at: new Date().toISOString()
          };
          inMem.products.push(newProduct);
          createdCount++;
        }
      }
    }

    res.json({
      success: true,
      total: items.length,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Proceso completado con éxito: ${createdCount} creados, ${updatedCount} actualizados.`
    });
  } catch (error) {
    console.error('Error en bulk-upload:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let result;
    if (isPgConnected) {
      const { name, description, price, stock, image_url } = req.body;
      result = await pool.query(
        'UPDATE ecommerce_products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5 WHERE id = $6 RETURNING *',
        [name, description, price, stock, image_url, id]
      );
    } else {
      result = await pool.query('UPDATE ecommerce_products', [req.body, id]);
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ecommerce_products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email, c.name as country_name 
      FROM ecommerce_orders o 
      LEFT JOIN ecommerce_users u ON o.user_id = u.id 
      LEFT JOIN ecommerce_countries c ON o.country_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Estado es requerido' });
    const result = await pool.query('UPDATE ecommerce_orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Countries
router.post('/admin/countries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, name, tax_rate, shipping_cost, nationalization_cost, discount_rate } = req.body;
    const result = await pool.query(
      'INSERT INTO ecommerce_countries (code, name, tax_rate, shipping_cost, nationalization_cost, discount_rate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [code, name, tax_rate, shipping_cost, nationalization_cost, discount_rate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/countries/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, tax_rate, shipping_cost, nationalization_cost, discount_rate } = req.body;
    const result = await pool.query(
      'UPDATE ecommerce_countries SET code = $1, name = $2, tax_rate = $3, shipping_cost = $4, nationalization_cost = $5, discount_rate = $6 WHERE id = $7 RETURNING *',
      [code, name, tax_rate, shipping_cost, nationalization_cost, discount_rate, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/countries/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ecommerce_countries WHERE id = $1', [id]);
    res.json({ message: 'Country deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Product Stock per Country
router.get('/admin/products/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.id, s.country_id, s.stock, c.name as country_name 
      FROM ecommerce_product_stock s 
      JOIN ecommerce_countries c ON s.country_id = c.id 
      WHERE s.product_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/products/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { country_id, stock } = req.body;
    const result = await pool.query(
      'INSERT INTO ecommerce_product_stock (product_id, country_id, stock) VALUES ($1, $2, $3) ON CONFLICT (product_id, country_id) DO UPDATE SET stock = $3 RETURNING *',
      [id, country_id, stock]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Users (Customers) - Sanitized against password_hash exposure
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, c.name as country_name
      FROM ecommerce_users u
      LEFT JOIN ecommerce_countries c ON u.country_id = c.id
      ORDER BY u.created_at DESC
    `);
    const users = (result.rows || []).map(u => {
      const sanitized = { ...u };
      delete sanitized.password_hash;
      return sanitized;
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const password = data.password || '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO ecommerce_users (
        name, email, password_hash, razon_social, tipo_cliente, direccion_legal, localidad, codigo_postal, ciudad, country_id, phone, fecha_limite_facturacion, web,
        report_to_country_id, vendedor, direccion_entrega, localidad_entrega, codigo_postal_entrega, ciudad_entrega, pais_entrega_id, tipo_iva, numero_nit,
        nombre_compras, telefono_compras, email_compras, nombre_pagos, telefono_pagos, email_pagos, nombre_admin, telefono_admin, email_admin,
        email_factura_electronica, email_contacto_compras, email_cotizaciones_automaticas, address, company
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36
      ) RETURNING id, name, email
    `;
    const values = [
      data.name, data.email, hashedPassword, data.razon_social, data.tipo_cliente, data.direccion_legal, data.localidad, data.codigo_postal, data.ciudad, data.country_id || null, data.phone, data.fecha_limite_facturacion || null, data.web,
      data.report_to_country_id || null, data.vendedor, data.direccion_entrega, data.localidad_entrega, data.codigo_postal_entrega, data.ciudad_entrega, data.pais_entrega_id || null, data.tipo_iva, data.numero_nit,
      data.nombre_compras, data.telefono_compras, data.email_compras, data.nombre_pagos, data.telefono_pagos, data.email_pagos, data.nombre_admin, data.telefono_admin, data.email_admin,
      data.email_factura_electronica, data.email_contacto_compras, data.email_cotizaciones_automaticas, data.address, data.company
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query(`
      SELECT u.*, c.name as country_name
      FROM ecommerce_users u
      LEFT JOIN ecommerce_countries c ON u.country_id = c.id
      WHERE u.id = $1
    `, [id]);
    
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const ordersResult = await pool.query('SELECT * FROM ecommerce_orders WHERE user_id = $1 ORDER BY created_at DESC', [id]);
    
    const userClean = { ...userResult.rows[0] };
    delete userClean.password_hash;

    res.json({
      ...userClean,
      orders: ordersResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    let query = `
      UPDATE ecommerce_users SET 
        name = $1, email = $2, razon_social = $3, tipo_cliente = $4, direccion_legal = $5, localidad = $6, codigo_postal = $7, ciudad = $8, country_id = $9, phone = $10, fecha_limite_facturacion = $11, web = $12,
        report_to_country_id = $13, vendedor = $14, direccion_entrega = $15, localidad_entrega = $16, codigo_postal_entrega = $17, ciudad_entrega = $18, pais_entrega_id = $19, tipo_iva = $20, numero_nit = $21,
        nombre_compras = $22, telefono_compras = $23, email_compras = $24, nombre_pagos = $25, telefono_pagos = $26, email_pagos = $27, nombre_admin = $28, telefono_admin = $29, email_admin = $30,
        email_factura_electronica = $31, email_contacto_compras = $32, email_cotizaciones_automaticas = $33, address = $34, company = $35
    `;
    let values = [
      data.name, data.email, data.razon_social, data.tipo_cliente, data.direccion_legal, data.localidad, data.codigo_postal, data.ciudad, data.country_id || null, data.phone, data.fecha_limite_facturacion || null, data.web,
      data.report_to_country_id || null, data.vendedor, data.direccion_entrega, data.localidad_entrega, data.codigo_postal_entrega, data.ciudad_entrega, data.pais_entrega_id || null, data.tipo_iva, data.numero_nit,
      data.nombre_compras, data.telefono_compras, data.email_compras, data.nombre_pagos, data.telefono_pagos, data.email_pagos, data.nombre_admin, data.telefono_admin, data.email_admin,
      data.email_factura_electronica, data.email_contacto_compras, data.email_cotizaciones_automaticas, data.address, data.company
    ];
    
    // Update password if provided
    if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        query += `, password_hash = $36 WHERE id = $37 RETURNING id, email`;
        values.push(hashedPassword, id);
    } else {
        query += ` WHERE id = $36 RETURNING id, email`;
        values.push(id);
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: error.message });
  }
});

// Admin User Status Toggle / Approval
router.put('/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['activo', 'pendiente', 'inactivo'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser activo, pendiente o inactivo' });
    }

    const result = await pool.query('UPDATE ecommerce_users SET status = $1 WHERE id = $2 RETURNING id, name, email, status', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: `Estado actualizado a ${status}`, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE ecommerce_users SET status = $1 WHERE id = $2 RETURNING id, name, email, status', ['activo', id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Cliente aprobado y activado exitosamente', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

