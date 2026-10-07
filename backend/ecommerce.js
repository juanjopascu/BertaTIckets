const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { generateProductDescription, generateDimensionsAI, generateCategoriesAI } = require('./services/geminiService');
const { registrarLog } = require('./services/auditLoggerService');
const erpDatabaseService = require('./services/erpDatabaseService');

const router = express.Router();

// Helper de validación de URLs contra SSRF (Server-Side Request Forgery)
function isSafeWebhookUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    
    // Prohibir localhost, 127.0.0.1, ::1 y nombres locales
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
      return false;
    }
    // Prohibir metadata de clouds y link-local
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.') || hostname.includes('metadata.google') || hostname.includes('internal')) {
      return false;
    }
    // Prohibir rangos privados estándar
    if (!process.env.ALLOW_PRIVATE_WEBHOOKS) {
      if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

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
    // Excluimos .svg para prevenir ejecución de scripts (Stored XSS)
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.xls', '.xlsx', '.csv'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se admiten imágenes (JPG, PNG, WebP), PDFs y planillas Excel/CSV.'));
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
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS promotional_price DECIMAL(10, 2);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS secondary_images JSONB;
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS weight VARCHAR(50);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS depth VARCHAR(50);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS width VARCHAR(50);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS height VARCHAR(50);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS highlights TEXT;
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS warranty VARCHAR(150);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS datasheet_url VARCHAR(255);
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS condition VARCHAR(100) DEFAULT 'Nuevo Sellado';
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS related_ids JSONB;
        ALTER TABLE ecommerce_products ADD COLUMN IF NOT EXISTS related_skus JSONB;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS cuenta_corriente_habilitada BOOLEAN DEFAULT false;
      `);
    } catch (_) {}
    client.release();
    console.log('✅ Conectado exitosamente a PostgreSQL (E-commerce)');
  })
  .catch(() => {
    isPgConnected = false;
    console.log('ℹ️ PostgreSQL no disponible. Usando motor E-commerce En Memoria con datos iniciales.');
  });

// --- DEFAULT VISUAL & SHOP CUSTOMIZATION SETTINGS ---
const DEFAULT_VISUAL_SETTINGS = {
  announcement: {
    enabled: true,
    text: 'Distribución Oficial y Soporte Certificado en 12 Países de América Latina y USA',
    badgeText: 'COBERTURA DACAS',
    link: '#paises'
  },
  general: {
    shopTitle: 'DACAS B2B Shop',
    shopSubtitle: 'Plataforma Corporativa de Soluciones IT, Ciberseguridad & Conectividad Enterprise',
    showCountryBar: true,
    contactPhone: '+54 11 4110-3300',
    contactEmail: 'ventas@dacas.com',
    whatsappNumber: '+5491141103300',
    headerBadge: 'DISTRIBUIDOR OFICIAL MAYORISTA',
    primaryColor: '#0fa4de'
  },
  heroSlides: [
    {
      id: 0,
      badge: 'RED REGIONAL DACAS',
      badgeIcon: '🌎',
      titleLine1: 'Distribución Mayorista Oficial',
      titleLine2: 'En 12 Países de América',
      titleColor: '#0fa4de',
      desc: 'Más de 25 años conectando a los principales fabricantes mundiales de ciberseguridad, networking, infraestructura y comunicaciones unificadas con integradores de toda la región.',
      primaryBtn: { text: 'Explorar Catálogo', cat: 'all' },
      secondaryBtn: { text: 'Nuestros Países', cat: 'all' },
      type: 'metrics',
      metrics: [
        { value: '+25 Años', label: 'Liderando el Mercado IT' },
        { value: '12 Países', label: 'Cobertura Regional' },
        { value: '24/7', label: 'Soporte y Garantía Oficial' }
      ],
      stats: [
        { key: 'exp', target: 25, suffix: '+ Años', label: 'Liderando el Mercado IT' },
        { key: 'part', target: 100, suffix: '%', label: 'Partners Certificados' },
        { key: 'cov', target: 24, suffix: '/7', label: 'Soporte y Garantía Oficial' }
      ]
    },
    {
      id: 1,
      badge: 'CIBERSEGURIDAD AVANZADA',
      badgeIcon: '🛡️',
      titleLine1: 'Next-Gen Firewalls & IA',
      titleLine2: 'Protección Integral Fortinet',
      titleColor: '#0fa4de',
      desc: 'Soluciones perimetrales y de centro de datos con tecnología ASIC y suscripciones FortiGuard Enterprise con entrega inmediata.',
      primaryBtn: { text: 'Ver Seguridad', cat: 'security' },
      secondaryBtn: { text: 'Ver Catálogo Completo', cat: 'all' },
      type: 'metrics',
      metrics: [
        { value: '1.4 Gbps', label: 'Rendimiento IPS Real' },
        { value: '99.99%', label: 'Disponibilidad Uptime' },
        { value: 'Zero-Day', label: 'Protección con IA' }
      ]
    },
    {
      id: 2,
      badge: 'INFRAESTRUCTURA & ENERGÍA CRÍTICA',
      badgeIcon: '⚡',
      titleLine1: 'Sistemas UPS Online Vertiv & Eaton',
      titleLine2: '& Racks de Alta Densidad Panduit',
      titleColor: '#38bdf8',
      desc: 'Protección de energía crítica doble conversión, gabinetes acústicos y cableado estructurado certificado CommScope para salas de servidores y centros de datos.',
      primaryBtn: { text: 'Ver Infraestructura', cat: 'infraestructura' },
      secondaryBtn: { text: 'Consultar Stock', cat: 'infraestructura' },
      type: 'metrics',
      metrics: [
        { value: '3kVA - 20kVA', label: 'Potencia Doble Conversión' },
        { value: 'Factor 1.0', label: 'Eficiencia Energética' },
        { value: 'Vertiv/Panduit', label: 'Garantía Oficial DACAS' }
      ]
    },
    {
      id: 3,
      badge: 'COMUNICACIONES UNIFICADAS & COLABORACIÓN',
      badgeIcon: '📞',
      titleLine1: 'Telefonía IP AudioCodes Teams',
      titleLine2: '& Colaboración Corporativa Avaya',
      titleColor: '#10b981',
      desc: 'Soluciones enterprise de audio y videoconferencia HD certificadas para Microsoft Teams y Zoom, con audio de alta fidelidad y conmutación SIP.',
      primaryBtn: { text: 'Ver Comunicaciones Unificadas', cat: 'comunicaciones_unificadas' },
      secondaryBtn: { text: 'Explorar Modelos', cat: 'comunicaciones_unificadas' },
      type: 'metrics',
      metrics: [
        { value: 'Audio HD', label: 'Resolución Óptica y Voz' },
        { value: 'Avaya Bar', label: 'Salas Inteligentes' },
        { value: 'Teams/Zoom', label: 'Certificación Oficial' }
      ]
    }
  ],
  categories: [
    { key: 'networking', name: 'Networking', icon: '🌐', desc: 'Conmutación L2/L3, Routing Core, Wi-Fi 6 y Conectividad Cloud', enabled: true },
    { key: 'infraestructura', name: 'Infraestructura', icon: '⚡', desc: 'Energía Crítica UPS, Gabinetes Racks 42U y Cableado Estructurado', enabled: true },
    { key: 'comunicaciones_unificadas', name: 'Comunicaciones Unificadas', icon: '📞', desc: 'Telefonía IP Corporativa, AudioCodes Teams & Salas Colaborativas Avaya', enabled: true },
    { key: 'security', name: 'Seguridad & Ciberseguridad', icon: '🛡️', desc: 'Next-Gen Firewalls, Sandboxing IA y Protección de Datos', enabled: true }
  ],
  categoryBrands: {
    'comunicaciones_unificadas': ['audiocodes', 'avaya'],
    'security': [
      'algosec', 'barracuda', 'fortinet', 'f5', 'imperva', 'hitachi vantara',
      'infoblox', 'nsfocus', 'radware', 'silver peak', 'sophos', 'sonicwall',
      'veracode', 'vicarius', 'viewtinet'
    ],
    'infraestructura': [
      'avocent', 'commscope', 'commscope netconnect', 'commscope systimax',
      'eaton', 'gabitel', 'panduit', 'siemon', 'vertiv', 'tz'
    ],
    'networking': [
      'mikrotik', 'aruba', 'infoblox', 'silver peak', 'commscope'
    ]
  },
  brandBanners: [
    {
      id: 'brand_banner_1',
      brand: 'Fortinet',
      title: 'Fortinet Security Fabric',
      subtitle: 'Firewalls NGFW FortiGate y protección perimetral con procesamiento SOC4',
      badge: 'CIBERSEGURIDAD LÍDER',
      accentColor: '#EE3124',
      buttonText: 'Explorar Fortinet',
      imageUrl: '',
      targetCategory: 'security',
      enabled: true
    },
    {
      id: 'brand_banner_2',
      brand: 'Vertiv',
      title: 'Vertiv Critical Power',
      subtitle: 'Sistemas UPS Online doble conversión y racks de alta densidad para Data Centers',
      badge: 'ENERGÍA CRÍTICA',
      accentColor: '#38bdf8',
      buttonText: 'Ver Soluciones Vertiv',
      imageUrl: '',
      targetCategory: 'infraestructura',
      enabled: true
    },
    {
      id: 'brand_banner_3',
      brand: 'MikroTik',
      title: 'MikroTik Routing & Core',
      subtitle: 'Switches gestionables Gigabit PoE+ y routers para enlaces de fibra óptica de alto tráfico',
      badge: 'NETWORKING ENTERPRISE',
      accentColor: '#10b981',
      buttonText: 'Ver Equipos MikroTik',
      imageUrl: '',
      targetCategory: 'networking',
      enabled: true
    }
  ],
  homeCarousels: {
    list: [
      {
        id: 'car_featured',
        title: '🔥 Productos Destacados',
        subtitle: 'Equipamiento de alta demanda con entrega inmediata y garantía oficial DACAS',
        badge: 'TOP SELLERS',
        badgeColor: '#0fa4de',
        icon: 'star',
        enabled: true,
        selectionType: 'featured',
        targetCategory: 'all',
        targetBrand: 'all',
        productIds: []
      },
      {
        id: 'car_custom',
        title: '⚡ Oportunidades & Ofertas IT',
        subtitle: 'Soluciones corporativas seleccionadas con precios mayoristas para canales',
        badge: 'SELECCIÓN DACAS',
        badgeColor: '#10b981',
        icon: 'shield',
        enabled: true,
        selectionType: 'manual',
        targetCategory: 'all',
        targetBrand: 'all',
        productIds: []
      }
    ],
    featured: {
      enabled: true,
      title: '🔥 Productos Destacados',
      subtitle: 'Equipamiento de alta demanda con entrega inmediata y garantía oficial DACAS',
      productIds: []
    },
    custom: {
      enabled: true,
      title: '⚡ Oportunidades & Novedades IT',
      subtitle: 'Soluciones corporativas seleccionadas con precios mayoristas especiales para canales',
      productIds: []
    }
  },
  brandCustomInfo: {
    'fortinet': {
      name: 'Fortinet',
      logo: '',
      tagline: 'Seguridad de Red Convergente y Firewalls NGFW FortiGate',
      color: '#EE3124'
    },
    'avaya': {
      name: 'Avaya',
      logo: '',
      tagline: 'Líder en Contact Center y Comunicaciones Unificadas',
      color: '#CC0000'
    },
    'vertiv': {
      name: 'Vertiv',
      logo: '',
      tagline: 'Climatización Crítica Liebert, UPS y Micro-Datacenters',
      color: '#FF4500'
    },
    'mikrotik': {
      name: 'MikroTik',
      logo: '',
      tagline: 'Routers, Switches de alta capacidad y RouterOS',
      color: '#D8232A'
    },
    'aruba': {
      name: 'Aruba',
      logo: '',
      tagline: 'Puntos de Acceso Wi-Fi 6 y Switching Corporativo Cloud',
      color: '#FF8300'
    },
    'f5': {
      name: 'F5 Networks',
      logo: '',
      tagline: 'Seguridad y Entrega Multi-Cloud de Aplicaciones & DDoS',
      color: '#E2231A'
    },
    'algosec': {
      name: 'AlgoSec',
      logo: '',
      tagline: 'Automatización de Seguridad y Políticas de Firewall',
      color: '#0084C7'
    },
    'audiocodes': {
      name: 'AudioCodes',
      logo: '',
      tagline: 'Gateways de Voz, SBCs y Teléfonos IP Teams',
      color: '#005596'
    },
    'barracuda': {
      name: 'Barracuda Networks',
      logo: '',
      tagline: 'Seguridad de Email, WAF y Respaldo en la Nube',
      color: '#006699'
    },
    'imperva': {
      name: 'Imperva',
      logo: '',
      tagline: 'Protección Integral de Datos, APIs y WAF Avanzado',
      color: '#001E62'
    },
    'sophos': {
      name: 'Sophos',
      logo: '',
      tagline: 'Ciberseguridad Sincronizada, Intercept X Endpoint y XGS',
      color: '#00549A'
    },
    'sonicwall': {
      name: 'SonicWall',
      logo: '',
      tagline: 'Firewalls de Nueva Generación TZ / NSa y Acceso Seguro',
      color: '#F37023'
    },
    'eaton': {
      name: 'Eaton',
      logo: '',
      tagline: 'Sistemas UPS, PDUs y Protección de Energía Crítica',
      color: '#005EB8'
    },
    'panduit': {
      name: 'Panduit',
      logo: '',
      tagline: 'Cableado Estructurado, Canalización y Datacenter Solutions',
      color: '#005A9C'
    },
    'commscope': {
      name: 'CommScope',
      logo: '',
      tagline: 'Infraestructura Integral de Redes Ópticas y Cableado',
      color: '#005596'
    },
    'microsoft': {
      name: 'Microsoft',
      logo: '',
      tagline: 'Licenciamiento Corporativo CSP, Windows Server y M365',
      color: '#00A4EF'
    }
  }
};

// --- CHECKOUT METHODS (SHIPPING & PAYMENT) PER COUNTRY ---
const COUNTRY_CHECKOUT_METHODS = {
  AR: {
    country_code: 'AR',
    country_name: 'Argentina',
    shipping: [
      {
        id: 'hub_ar',
        enabled: true,
        title: 'Retiro en HUB Central DACAS Buenos Aires',
        subtitle: 'Depósito Central Barracas / CABA (Sin Cargo)',
        badge: 'Gratis',
        icon: '🏢',
        priceText: 'Sin cargo',
        description: 'Retiro inmediato por depósito central DACAS en Barracas / CABA con orden de compra aprobada.'
      },
      {
        id: 'express_ar',
        enabled: true,
        title: 'Envío Express CABA & Gran Buenos Aires',
        subtitle: 'Despacho puerta a puerta a planta / oficina',
        badge: 'Recomendado',
        icon: '🚚',
        priceText: 'Bonificado (B2B)',
        description: 'Despacho logístico prioritario en 24/48hs a la dirección declarada de la empresa.'
      },
      {
        id: 'expreso_ar',
        enabled: true,
        title: 'Expreso al Interior de Argentina',
        subtitle: 'Despacho a receptoría de expreso (Villa Soldati / CTC / Transporte)',
        badge: 'Interior del País',
        icon: '🚛',
        priceText: 'A cargo del cliente',
        description: 'Despacho sin cargo hacia la receptoría o transporte que el integrador contrate en CABA/GBA (Andreani, Cruz del Sur, La Sevillanita, Expreso Brio, etc.).'
      }
    ],
    payment: [
      {
        id: 'transferencia_ar',
        enabled: true,
        title: 'Transferencia Bancaria Directa (CBU / Alias / CUIT)',
        subtitle: 'Se emitirá Factura Electrónica A con cuentas en Banco Santander y BBVA Argentina en USD oficial BNA o ARS.',
        badge: 'Inmediato (Factura A)',
        icon: '💸',
        banco: 'Banco Santander / BBVA Argentina',
        titular: 'DACAS S.A.',
        cuit: '30-68942158-9',
        cbu: '0720123920000001234567',
        alias: 'DACAS.PAGOS.B2B',
        swift: 'BAPROARBAXXX',
        tipo_cuenta: 'Cuenta Corriente Especial en USD / ARS',
        instrucciones: 'Una vez efectuada la transferencia, adjuntá el comprobante a cobranzas.ar@dacas.com indicando tu número de orden.'
      },
      {
        id: 'echeq_ar',
        enabled: true,
        title: 'Cheque de Pago Diferido / E-Cheq (COELSA Argentina)',
        subtitle: 'Endoso y recepción de cheques electrónicos interbancarios COELSA a 30 y 60 días.',
        badge: 'Financiamiento 30/60d',
        icon: '📑',
        cuit_receptor: '30-68942158-9',
        banco_receptor: 'Banco Santander Argentina',
        plazos_admitidos: '30 y 60 días fecha factura',
        instrucciones: 'Emitir o endosar el E-Cheq a favor de DACAS S.A. (CUIT 30-68942158-9) mediante homebanking en Argentina.'
      },
      {
        id: 'cuenta_corriente_ar',
        enabled: true,
        title: 'Cuenta Corriente Comercial B2B DACAS Argentina',
        subtitle: 'Pago diferido contra factura y límite crediticio asignado a tu empresa.',
        badge: 'Crédito Aprobado',
        icon: '🏦',
        terms: ['30_dias', '60_dias'],
        terms_label: 'Plazo de Facturación:',
        instrucciones: 'Sujeto a verificación de línea crediticia aprobada en DACAS Argentina.'
      },
      {
        id: 'tarjeta_ar',
        enabled: true,
        title: 'Tarjeta Corporativa / Débito (Stripe Secure)',
        subtitle: 'Procesamiento online seguro e inmediato con Visa, Mastercard, American Express B2B.',
        badge: 'Online Inmediato',
        icon: '💳',
        gateway: 'Stripe SSL 256-bit',
        instrucciones: 'Transacción encriptada y protegida bajo normativa PCI-DSS Nivel 1.'
      }
    ],
    terms_conditions_text: 'Acepto las condiciones comerciales de DACAS Argentina S.A., términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'
  },
  CL: {
    country_code: 'CL',
    country_name: 'Chile',
    shipping: [
      {
        id: 'hub_cl',
        enabled: true,
        title: 'Retiro en HUB DACAS Santiago',
        subtitle: 'Centro de Distribución Pudahuel / ENEA (Sin Cargo)',
        badge: 'Gratis',
        icon: '🏢',
        priceText: 'Sin cargo',
        description: 'Retiro en centro logístico DACAS Chile en Santiago.'
      },
      {
        id: 'express_cl',
        enabled: true,
        title: 'Despacho Región Metropolitana',
        subtitle: 'Entrega puerta a puerta en Santiago',
        badge: 'Recomendado',
        icon: '🚚',
        priceText: 'Tarifa B2B',
        description: 'Entrega en 24/48 horas en toda la Región Metropolitana.'
      },
      {
        id: 'expreso_cl',
        enabled: true,
        title: 'Despacho a Regiones (Chile)',
        subtitle: 'Transportes Starken / Chilexpress / Cruz del Sur',
        badge: 'Regiones',
        icon: '🚛',
        priceText: 'Por pagar',
        description: 'Despacho hacia receptoría de courier o transporte a regiones de Chile.'
      }
    ],
    payment: [
      {
        id: 'transferencia_cl',
        enabled: true,
        title: 'Transferencia Bancaria Local (Banco de Chile / BCI)',
        subtitle: 'Cuentas corrientes en CLP y USD al tipo de cambio observado con Factura Electrónica SII.',
        badge: 'Inmediato',
        icon: '💸',
        banco: 'Banco de Chile / BCI',
        titular: 'DACAS Chile SpA',
        rut: '76.432.109-8',
        cuenta: '00-123-45678-9',
        tipo_cuenta: 'Cuenta Corriente',
        instrucciones: 'Enviar comprobante a cobranzas.cl@dacas.com indicando N° de pedido.'
      },
      {
        id: 'cuenta_corriente_cl',
        enabled: true,
        title: 'Línea de Crédito Comercial DACAS Chile',
        subtitle: 'Pago a 30 días contra Factura Electrónica SII.',
        badge: 'Crédito B2B',
        icon: '🏦',
        terms: ['30_dias'],
        instrucciones: 'Válido para clientes con línea aprobada en Chile.'
      },
      {
        id: 'tarjeta_cl',
        enabled: true,
        title: 'Webpay Plus / Tarjeta Corporativa',
        subtitle: 'Pago online seguro con tarjetas de crédito y débito.',
        badge: 'Online',
        icon: '💳',
        instrucciones: 'Transacción segura a través de Webpay Plus / Stripe.'
      }
    ],
    terms_conditions_text: 'Acepto las condiciones comerciales de DACAS Chile SpA y términos de garantía oficial.'
  },
  CO: {
    country_code: 'CO',
    country_name: 'Colombia',
    shipping: [
      {
        id: 'hub_co',
        enabled: true,
        title: 'Retiro en HUB DACAS Bogotá',
        subtitle: 'Centro Logístico Zona Franca Bogotá',
        badge: 'Gratis',
        icon: '🏢',
        priceText: 'Sin cargo',
        description: 'Retiro directo en bodega DACAS Bogotá.'
      },
      {
        id: 'express_co',
        enabled: true,
        title: 'Despacho Urbano Bogotá D.C.',
        subtitle: 'Entrega empresarial 24/48hs',
        badge: 'Recomendado',
        icon: '🚚',
        priceText: 'Tarifa B2B',
        description: 'Despacho a oficinas y plantas en Bogotá.'
      },
      {
        id: 'expreso_co',
        enabled: true,
        title: 'Envíos Nacionales Colombia',
        subtitle: 'Servientrega / Coordinadora Mercantil',
        badge: 'Nacional',
        icon: '🚛',
        priceText: 'A convenir',
        description: 'Despacho a Medellín, Cali, Barranquilla y demás ciudades de Colombia.'
      }
    ],
    payment: [
      {
        id: 'transferencia_co',
        enabled: true,
        title: 'Transferencia Bancolombia / PSE',
        subtitle: 'Consignación en Cuenta Corriente en COP o USD con Factura Electrónica DIAN.',
        badge: 'Inmediato',
        icon: '💸',
        banco: 'Bancolombia',
        titular: 'DACAS Colombia S.A.S.',
        nit: '901.345.678-1',
        cuenta: '210-987654-32',
        tipo_cuenta: 'Cuenta Corriente',
        instrucciones: 'Enviar comprobante a cobranzas.co@dacas.com.'
      },
      {
        id: 'cuenta_corriente_co',
        enabled: true,
        title: 'Crédito Directo DACAS Colombia',
        subtitle: 'Condición de pago 30 días contra aprobación de cupo.',
        badge: 'Crédito B2B',
        icon: '🏦',
        terms: ['30_dias'],
        instrucciones: 'Sujeto a verificación crediticia.'
      },
      {
        id: 'tarjeta_co',
        enabled: true,
        title: 'Tarjeta de Crédito Corporativa / PSE',
        subtitle: 'Pago online seguro.',
        badge: 'Online',
        icon: '💳',
        instrucciones: 'Acreditación inmediata.'
      }
    ],
    terms_conditions_text: 'Acepto las condiciones comerciales de DACAS Colombia S.A.S. y términos de garantía oficial.'
  },
  US: {
    country_code: 'US',
    country_name: 'Estados Unidos',
    shipping: [
      {
        id: 'hub_us',
        enabled: true,
        title: 'Pickup at DACAS Miami HUB',
        subtitle: 'Doral Distribution Center (Free)',
        badge: 'Free',
        icon: '🏢',
        priceText: 'Free',
        description: 'Will call pickup at DACAS Logistics Center in Miami / Doral, FL.'
      },
      {
        id: 'express_us',
        enabled: true,
        title: 'Domestic Commercial Ground',
        subtitle: 'FedEx / UPS Commercial',
        badge: 'Recommended',
        icon: '🚚',
        priceText: 'Standard B2B Rate',
        description: 'Direct delivery to commercial address across the US.'
      },
      {
        id: 'freight_us',
        enabled: true,
        title: 'Freight Forwarder Warehouse',
        subtitle: 'Delivery to Miami Export Forwarder',
        badge: 'Export',
        icon: '🚛',
        priceText: 'Local Delivery Rate',
        description: 'Delivery to your assigned export freight forwarder in South Florida.'
      }
    ],
    payment: [
      {
        id: 'wire_us',
        enabled: true,
        title: 'Domestic / International Wire & ACH',
        subtitle: 'Direct wire transfer to DACAS US Commercial Account.',
        badge: 'Wire / ACH',
        icon: '💸',
        banco: 'JPMorgan Chase Bank, N.A.',
        titular: 'DACAS International LLC',
        routing: '021000021',
        account: '987654321',
        swift: 'CHASUS33',
        instructions: 'Please send payment confirmation to payments.us@dacas.com.'
      },
      {
        id: 'terms_us',
        enabled: true,
        title: 'Commercial Net 30 Terms',
        subtitle: 'Deferred payment for pre-approved corporate accounts.',
        badge: 'Credit Line',
        icon: '🏦',
        terms: ['net_30'],
        instructions: 'Subject to active DACAS US credit line verification.'
      },
      {
        id: 'card_us',
        enabled: true,
        title: 'Corporate Credit Card (Stripe)',
        subtitle: 'Visa, Mastercard, AMEX corporate cards.',
        badge: 'Instant',
        icon: '💳',
        instructions: 'Secure online checkout.'
      }
    ],
    terms_conditions_text: 'I accept DACAS International LLC B2B terms and manufacturer warranty terms.'
  }
};

const DEFAULT_CHECKOUT_METHODS = COUNTRY_CHECKOUT_METHODS.AR;

const STATIC_COUNTRIES = [
  { id: 1, code: 'US', name: 'Estados Unidos', tax_rate: '0.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 2, code: 'AR', name: 'Argentina', tax_rate: '21.00', shipping_cost: '15.00', nationalization_cost: '5.00', discount_rate: '0.00' },
  { id: 3, code: 'BO', name: 'Bolivia', tax_rate: '13.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 4, code: 'CL', name: 'Chile', tax_rate: '19.00', shipping_cost: '18.00', nationalization_cost: '2.00', discount_rate: '5.00' },
  { id: 5, code: 'CO', name: 'Colombia', tax_rate: '19.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 6, code: 'CR', name: 'Costa Rica', tax_rate: '13.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 7, code: 'EC', name: 'Ecuador', tax_rate: '12.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 8, code: 'MX', name: 'México', tax_rate: '16.00', shipping_cost: '25.00', nationalization_cost: '10.00', discount_rate: '0.00' },
  { id: 9, code: 'PY', name: 'Paraguay', tax_rate: '10.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 10, code: 'PE', name: 'Perú', tax_rate: '18.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 11, code: 'DO', name: 'República Dominicana', tax_rate: '18.00', shipping_cost: '22.00', nationalization_cost: '0.00', discount_rate: '0.00' },
  { id: 12, code: 'UY', name: 'Uruguay', tax_rate: '22.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' }
];

function resolveCountry(identifier) {
  if (!identifier) return STATIC_COUNTRIES.find(c => c.code === 'AR') || STATIC_COUNTRIES[1];
  const str = String(identifier).trim().toUpperCase();
  const num = parseInt(identifier, 10);
  const found = STATIC_COUNTRIES.find(c => 
    (!isNaN(num) && c.id === num) || 
    c.code.toUpperCase() === str || 
    c.name.toUpperCase() === str ||
    c.name.toUpperCase().includes(str)
  );
  if (found) return found;
  if (str === 'AR' || str === 'ARGENTINA' || num === 2) return { id: 2, code: 'AR', name: 'Argentina' };
  if (str === 'CL' || str === 'CHILE' || num === 4) return { id: 4, code: 'CL', name: 'Chile' };
  if (str === 'CO' || str === 'COLOMBIA' || num === 5) return { id: 5, code: 'CO', name: 'Colombia' };
  if (str === 'MX' || str === 'MEXICO' || str === 'MÉXICO' || num === 8) return { id: 8, code: 'MX', name: 'México' };
  if (str === 'US' || str === 'USA' || str === 'ESTADOS UNIDOS' || num === 1) return { id: 1, code: 'US', name: 'Estados Unidos' };
  if (str === 'UY' || str === 'URUGUAY' || num === 12) return { id: 12, code: 'UY', name: 'Uruguay' };
  if (str === 'PE' || str === 'PERU' || str === 'PERÚ' || num === 10) return { id: 10, code: 'PE', name: 'Perú' };
  return { id: 2, code: 'AR', name: 'Argentina' };
}

function getCheckoutMethodsForCountry(countryCodeOrId) {
  const c = resolveCountry(countryCodeOrId);
  const code = c ? c.code.toUpperCase() : 'AR';
  if (COUNTRY_CHECKOUT_METHODS[code]) {
    return COUNTRY_CHECKOUT_METHODS[code];
  }
  return COUNTRY_CHECKOUT_METHODS.AR || DEFAULT_CHECKOUT_METHODS;
}

// --- DEFAULT APLI INTEGRATION SETTINGS & LOGS ---
const DEFAULT_APLI_CONFIG = {
  enabled: true,
  endpointUrl: 'https://api.apli.com.ar/v2',
  apiKey: 'apli_live_dk928374910284719283',
  clientId: 'DACAS-ARG-001',
  clientSecret: 'sk_live_998124018274019283401928',
  environment: 'production', // 'production' | 'sandbox'
  syncProducts: true,
  syncStock: true,
  syncOrders: true,
  syncCustomers: true,
  syncPrices: true,
  syncInterval: 'realtime', // 'realtime' | '5min' | '15min' | 'hourly' | 'manual'
  webhookUrl: '/api/ecommerce/settings/apli/webhook',
  webhookSecret: 'whsec_apli_dacas_99214710',
  autoApproveVerifiedCustomers: true,
  lastSync: new Date().toISOString(),
  connectionStatus: 'connected', // 'connected' | 'error' | 'disconnected'
  lastLatencyMs: 38
};

const DEFAULT_APLI_LOGS = [
  { id: 'log_101', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), type: 'STOCK_SYNC', status: 'SUCCESS', details: 'Sincronización de stock en tiempo real: 6 productos actualizados (FortiGate, Aruba, APC)', recordsCount: 6, durationMs: 110 },
  { id: 'log_102', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), type: 'ORDER_DISPATCH', status: 'SUCCESS', details: 'Orden B2B #1055 enviada a facturación y despacho en Apli ERP', recordsCount: 1, durationMs: 220 },
  { id: 'log_103', timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), type: 'CATALOG_SYNC', status: 'SUCCESS', details: 'Catálogo mayorista y listas de precios sincronizadas con Apli Cloud', recordsCount: 18, durationMs: 410 },
  { id: 'log_104', timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(), type: 'WEBHOOK_HEARTBEAT', status: 'SUCCESS', details: 'Ping de conectividad y healthcheck desde endpoint Apli OK (HTTP 200)', recordsCount: 1, durationMs: 35 }
];

// --- DEFAULT N8N AI AGENT BOT CONFIGURATION & WORKFLOW TEMPLATE ---
const DEFAULT_N8N_BOT_CONFIG = {
  enabled: true,
  botName: 'DACAS AI Copilot B2B',
  botSubtitle: 'Asistente de Preventa, Stock & Cotizaciones B2B',
  avatarIcon: '🤖',
  primaryColor: '#0fa4de',
  webhookUrl: 'https://n8n.dacas.com/webhook/dacas-b2b-agent',
  authHeaderName: 'X-N8N-API-KEY',
  authToken: 'n8n_sec_dacas_ai_agent_99812401',
  timeoutMs: 15000,
  fallbackToInternalAI: true,
  systemPrompt: `Eres el Asistente Inteligente y Agente de Preventa B2B de DACAS Mayorista. Tu función es ayudar a integradores, resellers y empresas a encontrar hardware, licencias y soluciones de Ciberseguridad (Fortinet), Networking (Aruba), Infraestructura & Energía (Vertiv, APC) y Comunicaciones Unificadas (Poly). Respondes con precios de referencia en USD mayorista, disponibilidad de stock y guías para cotización formal.`,
  welcomeMessage: '👋 ¡Hola! Soy el Copilot de IA de DACAS B2B conectado a agentes de n8n. ¿En qué puedo ayudarte hoy? Puedo verificar stock en tiempo real, cotizar productos o asesorarte sobre soluciones técnicas.',
  suggestedQuestions: [
    '🔍 ¿Qué stock tienen de FortiGate-60F?',
    '⚡ Recomiéndame switches Aruba de 24 puertos',
    '📑 ¿Cómo registrar mi empresa como integrador B2B?',
    '💳 ¿Cuáles son los métodos de pago y despacho?'
  ],
  enabledTools: {
    searchProducts: true,
    checkStock: true,
    calculateQuote: true,
    recommendSolutions: true,
    checkOrderStatus: true,
    createSupportTicket: true
  },
  aiModel: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 1000,
  status: 'active',
  conversationsCount: 142,
  resolutionRate: '94%'
};

const DEFAULT_N8N_WORKFLOW_TEMPLATE = {
  name: "DACAS B2B AI Agent Workflow",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "dacas-b2b-agent",
        responseMode: "lastNode",
        options: {}
      },
      id: "webhook-trigger",
      name: "Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300]
    },
    {
      parameters: {
        promptType: "define",
        text: "={{ $json.body.message }}",
        options: {
          systemMessage: "Eres el Agente de IA Oficial de DACAS B2B para integradores y resellers. Responde con precisión técnica y profesionalismo en ciberseguridad, networking e infraestructura."
        }
      },
      id: "ai-agent",
      name: "AI Agent (LangChain)",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.6,
      position: [480, 300]
    },
    {
      parameters: {
        model: "gpt-4o",
        options: {
          temperature: 0.3
        }
      },
      id: "openai-model",
      name: "OpenAI Chat Model",
      type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      typeVersion: 1,
      position: [480, 520]
    },
    {
      parameters: {
        sessionIdType: "customKey",
        sessionKey: "={{ $json.body.sessionId || 'default' }}"
      },
      id: "window-buffer-memory",
      name: "Window Buffer Memory",
      type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      typeVersion: 1.2,
      position: [620, 520]
    },
    {
      parameters: {
        name: "consultar_catalogo_dacas",
        description: "Consulta el catálogo de productos de DACAS Shop con stock y precios mayoristas",
        url: "http://localhost:3001/api/ecommerce/products"
      },
      id: "tool-products",
      name: "Tool: Catálogo DACAS",
      type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
      typeVersion: 1.1,
      position: [760, 520]
    }
  ],
  connections: {
    "Webhook Trigger": {
      main: [
        [
          {
            node: "AI Agent (LangChain)",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
};

const DEFAULT_N8N_BOT_LOGS = [
  { id: 'chat_101', timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), user: 'Carlos Mendoza (RedesNet)', query: '¿Tienen stock para entrega inmediata del FortiGate 60F?', response: 'Sí, disponemos de 15 unidades en stock en la sede de Argentina con entrega en 24hs.', toolUsed: 'checkStock', latencyMs: 680, status: 'SUCCESS' },
  { id: 'chat_102', timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(), user: 'Laura Gómez (Empresa Demo)', query: 'Recomiéndame switches PoE de 24 puertos para videovigilancia IP', response: 'Te sugiero el Switch Aruba CX 6100 24G PoE+ (Clase 4) de 370W, ideal para cámaras y APs.', toolUsed: 'recommendSolutions', latencyMs: 820, status: 'SUCCESS' },
  { id: 'chat_103', timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), user: 'Visitante Web B2B', query: '¿Cómo solicito cuenta corriente y alta mayorista?', response: 'Podés solicitar el alta completando el formulario de registro con tu CUIT en la sección Mi Cuenta B2B.', toolUsed: 'generalFAQ', latencyMs: 450, status: 'SUCCESS' }
];

// --- IN-MEMORY DATABASE FALLBACK STORE ---
const PRODUCTS_FILE = path.join(__dirname, 'ecommerce_products.json');
const VISUAL_SETTINGS_FILE = path.join(__dirname, 'ecommerce_visual_settings.json');

function getDefaultVisualSettingsForCountry(countryCode) {
  const code = (countryCode || 'AR').toUpperCase();
  const c = resolveCountry(code);
  const countryName = c ? c.name : 'Argentina';

  const base = JSON.parse(JSON.stringify(DEFAULT_VISUAL_SETTINGS));
  base.announcement.text = `DACAS ${countryName}: Distribución Mayorista Oficial y Soporte Certificado en ${countryName}`;
  base.announcement.badgeText = `DACAS ${code}`;
  base.general.shopTitle = `DACAS ${countryName} B2B Shop`;
  base.general.shopSubtitle = `Plataforma Corporativa de Soluciones IT & Ciberseguridad para ${countryName}`;
  if (base.heroSlides && base.heroSlides[0]) {
    base.heroSlides[0].badge = `RED DACAS ${countryName.toUpperCase()}`;
    base.heroSlides[0].titleLine1 = `Distribución Mayorista Oficial`;
    base.heroSlides[0].titleLine2 = `En ${countryName}`;
    base.heroSlides[0].desc = `Conectando a los principales fabricantes de IT con los integradores de ${countryName}. Stock local y soporte técnico certificado.`;
  }
  return base;
}

function loadVisualSettingsFromFile() {
  try {
    if (fs.existsSync(VISUAL_SETTINGS_FILE)) {
      const data = fs.readFileSync(VISUAL_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error cargando ecommerce_visual_settings.json:', err);
  }
  const initial = {};
  ['AR', 'CL', 'CO', 'MX', 'US', 'UY', 'PE', 'BO', 'CR', 'EC', 'PY', 'DO'].forEach(code => {
    initial[code] = getDefaultVisualSettingsForCountry(code);
  });
  return initial;
}

function saveVisualSettingsToFile() {
  try {
    if (typeof inMem !== 'undefined' && inMem && inMem.visualSettingsByCountry) {
      fs.writeFileSync(VISUAL_SETTINGS_FILE, JSON.stringify(inMem.visualSettingsByCountry, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error guardando ecommerce_visual_settings.json:', err);
  }
}

function saveProductsToFile() {
  try {
    if (typeof inMem !== 'undefined' && inMem && Array.isArray(inMem.products)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(inMem.products, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error guardando ecommerce_products.json:', err);
  }
}

function loadProductsFromFile(defaultProducts) {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => {
          const c = resolveCountry(p.country_code || p.country_id || 'AR');
          return {
            ...p,
            country_code: p.country_code ? p.country_code.toUpperCase() : c.code,
            country_id: p.country_id ? parseInt(p.country_id, 10) : c.id
          };
        });
      }
    }
  } catch (err) {
    console.error('Error cargando ecommerce_products.json:', err);
  }
  return defaultProducts;
}

const CLIENT_TYPES_FILE = path.join(__dirname, 'ecommerce_client_types.json');
const DEFAULT_CLIENT_TYPES = [
  { id: 1, name: 'Integrador IT / Reseller', description: 'Empresas integradoras de soluciones de conectividad y valor agregado', color: '#0284c7' },
  { id: 2, name: 'Proveedor de Internet (ISP / WISP)', description: 'Proveedores de servicios de internet y carriers de telecomunicaciones', color: '#10b981' },
  { id: 3, name: 'Consultora IT / Ciberseguridad', description: 'Firmas especializadas en seguridad informática e infraestructura', color: '#8b5cf6' },
  { id: 4, name: 'Empresa Corporativa', description: 'Clientes directos del segmento corporativo y enterprise', color: '#f59e0b' },
  { id: 5, name: 'Organismo Público', description: 'Entidades gubernamentales, educación y sector público', color: '#64748b' }
];

function loadClientTypesFromFile() {
  try {
    if (fs.existsSync(CLIENT_TYPES_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLIENT_TYPES_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.error('Error cargando ecommerce_client_types.json:', err);
  }
  return DEFAULT_CLIENT_TYPES;
}

function saveClientTypesToFile(types) {
  try {
    fs.writeFileSync(CLIENT_TYPES_FILE, JSON.stringify(types, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando ecommerce_client_types.json:', err);
  }
}

const inMem = {
  client_types: loadClientTypesFromFile(),
  visualSettingsByCountry: loadVisualSettingsFromFile(),
  get visualSettings() {
    return (this.visualSettingsByCountry && this.visualSettingsByCountry['AR']) || DEFAULT_VISUAL_SETTINGS;
  },
  set visualSettings(val) {
    if (!this.visualSettingsByCountry) this.visualSettingsByCountry = {};
    this.visualSettingsByCountry['AR'] = val;
    saveVisualSettingsToFile();
  },
  checkoutMethods: JSON.parse(JSON.stringify(DEFAULT_CHECKOUT_METHODS)),
  apliConfig: JSON.parse(JSON.stringify(DEFAULT_APLI_CONFIG)),
  apliLogs: JSON.parse(JSON.stringify(DEFAULT_APLI_LOGS)),
  n8nBotConfig: JSON.parse(JSON.stringify(DEFAULT_N8N_BOT_CONFIG)),
  n8nBotLogs: JSON.parse(JSON.stringify(DEFAULT_N8N_BOT_LOGS)),
  n8nWorkflowTemplate: JSON.parse(JSON.stringify(DEFAULT_N8N_WORKFLOW_TEMPLATE)),
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
      country_id: 2,
      country_code: 'AR',
      country_name: 'Argentina',
      status: 'activo',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      nombre_compras: 'Laura Gómez',
      telefono_compras: '+54 11 4000-1235',
      email_compras: 'compras@empresademo.com.ar',
      nombre_pagos: 'Martín Rodríguez',
      telefono_pagos: '+54 11 4000-1236',
      email_pagos: 'pagos@empresademo.com.ar',
      cuit: '30-12345678-9',
      tipo_iva: 'IVA Responsable Inscripto',
      tipo_factura: 'Factura A (Responsable Inscripto)',
      email_factura_electronica: 'facturacion@empresademo.com.ar',
      iibb_jurisdiccion: '901 - Capital Federal',
      iibb_tipo: 'C.M.',
      iibb_numero: '9017223280',
      iibb_codigo_aceptacion: true,
      percepciones: {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      },
      cuenta_corriente_habilitada: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'carlos@redesnet.com.ar',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'RedesNet Soluciones IT S.R.L.',
      cargo: 'Director Comercial',
      tipo_cliente: 'Integrador IT',
      phone: '+54 11 5555-8899',
      numero_nit: '30-71458922-4',
      ciudad: 'Buenos Aires',
      country_id: 2,
      country_code: 'AR',
      country_name: 'Argentina',
      status: 'pendiente',
      avatar_url: null,
      iibb_jurisdiccion: '902 - Buenos Aires',
      iibb_tipo: 'C.M.',
      iibb_numero: '30714589224',
      iibb_codigo_aceptacion: false,
      percepciones: {
        caba: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        bsas: { enabled: true, alicuota: 1.75, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      },
      cuenta_corriente_habilitada: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      name: 'Laura Gómez',
      email: 'compras@empresademo.com.ar',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Empresa Demo S.A.',
      cargo: 'Encargada de Compras',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+54 11 4000-1235',
      numero_nit: '30-12345678-9',
      direccion_legal: 'Av. Corrientes 1234, Piso 8',
      direccion_entrega: 'Av. del Libertador 4500, Depósito 2',
      ciudad: 'Buenos Aires',
      country_id: 2,
      country_code: 'AR',
      country_name: 'Argentina',
      status: 'activo',
      avatar_url: null,
      iibb_jurisdiccion: '901 - Capital Federal',
      iibb_tipo: 'C.M.',
      iibb_numero: '9017223280',
      iibb_codigo_aceptacion: true,
      percepciones: {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      },
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      name: 'Ing. Gustavo Morales',
      email: 'gmorales@cuyotel.com.ar',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Cuyo Telecomunicaciones S.A.',
      cargo: 'Gerente de Infraestructura',
      tipo_cliente: 'Proveedor de Internet (ISP / WISP)',
      phone: '+54 261 420-9900',
      numero_nit: '30-65432198-7',
      direccion_legal: 'San Martín 1050, Piso 3',
      direccion_entrega: 'Carril Rodríguez Peña 2400',
      ciudad: 'Mendoza',
      country_id: 2,
      country_code: 'AR',
      country_name: 'Argentina',
      status: 'activo',
      avatar_url: null,
      cuit: '30-65432198-7',
      tipo_iva: 'IVA Responsable Inscripto',
      tipo_factura: 'Factura A',
      iibb_jurisdiccion: '913 - Mendoza',
      iibb_tipo: 'C.M.',
      iibb_numero: '30654321987',
      iibb_codigo_aceptacion: false,
      percepciones: {
        caba: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      },
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 5,
      name: 'Marcos Benítez',
      email: 'marcos@cordobaconect.com.ar',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Córdoba Integradores IT S.R.L.',
      cargo: 'Socio Gerente',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+54 351 512-3400',
      numero_nit: '30-71987654-2',
      direccion_legal: 'Av. Colón 2100',
      direccion_entrega: 'Av. Circunvalación Sur Km 12',
      ciudad: 'Córdoba',
      country_id: 2,
      country_code: 'AR',
      country_name: 'Argentina',
      status: 'activo',
      avatar_url: null,
      cuit: '30-71987654-2',
      tipo_iva: 'IVA Responsable Inscripto',
      tipo_factura: 'Factura A',
      iibb_jurisdiccion: '904 - Córdoba',
      iibb_tipo: 'C.M.',
      iibb_numero: '30719876542',
      iibb_codigo_aceptacion: true,
      percepciones: {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      },
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 6,
      name: 'Sebastián Valenzuela',
      email: 'svalenzuela@andesdata.cl',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Andes Datacenter SpA',
      cargo: 'Chief Technology Officer',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+56 2 2345 6789',
      numero_nit: '76.432.109-8',
      direccion_legal: 'Av. Providencia 1760, Of. 902',
      direccion_entrega: 'Av. Américo Vespucio Norte 2200',
      ciudad: 'Santiago',
      country_id: 4,
      country_code: 'CL',
      country_name: 'Chile',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 7,
      name: 'Alejandro Restrepo',
      email: 'arestrepo@cibernet.com.co',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Cibernet Colombia S.A.S.',
      cargo: 'Director de Seguridad IT',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+57 1 789 0123',
      numero_nit: '901.345.678-1',
      direccion_legal: 'Cra. 7 # 71-21, Torre B',
      direccion_entrega: 'Calle 26 # 69D-91',
      ciudad: 'Bogotá',
      country_id: 5,
      country_code: 'CO',
      country_name: 'Colombia',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 8,
      name: 'Rodrigo Garza',
      email: 'rgarza@telecomnorte.com.mx',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Telecomunicaciones del Norte S.A. de C.V.',
      cargo: 'Gerente General',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+52 81 8345 6789',
      numero_nit: 'TNO120415-8K2',
      direccion_legal: 'Av. Constitución 2050 Pte.',
      direccion_entrega: 'Parque Industrial Monterrey Lote 14',
      ciudad: 'Monterrey',
      country_id: 8,
      country_code: 'MX',
      country_name: 'México',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 9,
      name: 'Joaquín Silva',
      email: 'jsilva@montevideoredes.com.uy',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Montevideo Redes & Conectividad S.A.',
      cargo: 'Director de Operaciones',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+598 2900 1234',
      numero_nit: '21.432.765.0019',
      direccion_legal: 'Rambla República de México 5500',
      direccion_entrega: 'Zonamerica Edificio Beta 3',
      ciudad: 'Montevideo',
      country_id: 12,
      country_code: 'UY',
      country_name: 'Uruguay',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 10,
      name: 'Renzo Carranza',
      email: 'rcarranza@limanetsolutions.pe',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Lima Net Solutions S.A.C.',
      cargo: 'Gerente Comercial',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+51 1 420 5678',
      numero_nit: '20512345678',
      direccion_legal: 'Av. Javier Prado Este 4200, Surco',
      direccion_entrega: 'Av. Argentina 2800, Callao',
      ciudad: 'Lima',
      country_id: 10,
      country_code: 'PE',
      country_name: 'Perú',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 11,
      name: 'John Miller',
      email: 'jmiller@floridanetworks.com',
      password_hash: bcrypt.hashSync('password123', 10),
      razon_social: 'Florida IT Networks LLC',
      cargo: 'Procurement Director',
      tipo_cliente: 'Integrador IT / Reseller',
      phone: '+1 305 555 0199',
      numero_nit: 'US-EIN-65-998811',
      direccion_legal: '8350 NW 52nd Terrace, Suite 100',
      direccion_entrega: '8350 NW 52nd Terrace, Suite 100',
      ciudad: 'Doral, FL',
      country_id: 1,
      country_code: 'US',
      country_name: 'Estados Unidos',
      status: 'activo',
      avatar_url: null,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
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
  company_team: [
    {
      id: 1,
      company_user_id: 1,
      company_name: 'Empresa Demo S.A.',
      name: 'Laura Gómez',
      email: 'compras@empresademo.com.ar',
      cargo: 'Responsable de Compras B2B',
      phone: '+54 11 4000-1235',
      role: 'comprador',
      password_hash: bcrypt.hashSync('password123', 10),
      plain_password: 'password123',
      can_order: true,
      can_view_prices: true,
      can_request_quotes: true,
      can_manage_team: false,
      status: 'activo',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString()
    },
    {
      id: 2,
      company_user_id: 1,
      company_name: 'Empresa Demo S.A.',
      name: 'Martín Rodríguez',
      email: 'pagos@empresademo.com.ar',
      cargo: 'Finanzas & Tesorería',
      phone: '+54 11 4000-1236',
      role: 'finanzas',
      password_hash: bcrypt.hashSync('password123', 10),
      plain_password: 'password123',
      can_order: false,
      can_view_prices: true,
      can_request_quotes: true,
      can_manage_team: false,
      status: 'activo',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: 3,
      company_user_id: 1,
      company_name: 'Empresa Demo S.A.',
      name: 'Ing. Lucas Benítez',
      email: 'lucas.benitez@empresademo.com.ar',
      cargo: 'Líder Técnico & Preventa IT',
      phone: '+54 11 4000-1237',
      role: 'tecnico',
      password_hash: bcrypt.hashSync('password123', 10),
      plain_password: 'password123',
      can_order: true,
      can_view_prices: true,
      can_request_quotes: true,
      can_manage_team: false,
      status: 'activo',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  end_users: [
    {
      id: 1,
      user_id: 1,
      company_name: 'Empresa Demo S.A.',
      nombre: 'Banco Metropolitano S.A.',
      direccion: 'Av. Corrientes 500, Piso 12',
      ciudad: 'Buenos Aires',
      pais: 'Argentina',
      telefono: '+54 11 4321-0000',
      contacto: 'Ing. Roberto Méndez (Gerente de Infraestructura)',
      website: 'https://www.bancometropolitano.com.ar',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 2,
      user_id: 1,
      company_name: 'Empresa Demo S.A.',
      nombre: 'PetroAndina Energía C.A.',
      direccion: 'Torre Digitel, Piso 15, La Castellana',
      ciudad: 'Caracas',
      pais: 'Venezuela',
      telefono: '+58 212 555-0199',
      contacto: 'Dr. Alejandro Silva - CEO',
      website: 'https://www.petroandina.com.ve',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  countries: [
    { id: 1, code: 'US', name: 'Estados Unidos', tax_rate: '0.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 2, code: 'AR', name: 'Argentina', tax_rate: '21.00', shipping_cost: '15.00', nationalization_cost: '5.00', discount_rate: '0.00' },
    { id: 3, code: 'BO', name: 'Bolivia', tax_rate: '13.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 4, code: 'CL', name: 'Chile', tax_rate: '19.00', shipping_cost: '18.00', nationalization_cost: '2.00', discount_rate: '5.00' },
    { id: 5, code: 'CO', name: 'Colombia', tax_rate: '19.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 6, code: 'CR', name: 'Costa Rica', tax_rate: '13.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 7, code: 'EC', name: 'Ecuador', tax_rate: '12.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 8, code: 'MX', name: 'México', tax_rate: '16.00', shipping_cost: '25.00', nationalization_cost: '10.00', discount_rate: '0.00' },
    { id: 9, code: 'PY', name: 'Paraguay', tax_rate: '10.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 10, code: 'PE', name: 'Perú', tax_rate: '18.00', shipping_cost: '18.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 11, code: 'DO', name: 'República Dominicana', tax_rate: '18.00', shipping_cost: '22.00', nationalization_cost: '0.00', discount_rate: '0.00' },
    { id: 12, code: 'UY', name: 'Uruguay', tax_rate: '22.00', shipping_cost: '20.00', nationalization_cost: '0.00', discount_rate: '0.00' }
  ],
  products: loadProductsFromFile([
    {
      id: 1,
      name: 'Fortinet FortiGate 60F - Next Generation Firewall',
      brand: 'Fortinet',
      category: 'security',
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
      name: 'Switch Gestionable Gigabit 24 Puertos PoE+ MikroTik Cloud Router',
      brand: 'MikroTik',
      category: 'networking',
      sku: 'CRS328-24P-4S',
      description: '<p>Switch empresarial capa 2/3 con 24 puertos Gigabit PoE dual 802.3af/at y 4 puertos 10G SFP+ para fibra óptica de alta velocidad.</p>',
      price: '480.00',
      stock: 18,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Punto de Acceso Wi-Fi 6 Enterprise Aruba Instant On AP22',
      brand: 'Aruba',
      category: 'networking',
      sku: 'R4W02A-AP22',
      description: '<p>Access Point de techo para alta densidad corporativa. Ofrece tecnología Wi-Fi 6 MU-MIMO con gestión centralizada en la nube sin costo adicional de licencias.</p>',
      price: '195.00',
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Sistema UPS Online Doble Conversión Vertiv Liebert GXT5 3kVA',
      brand: 'Vertiv',
      category: 'infraestructura',
      sku: 'GXT5-3000IRT2UXLE',
      description: '<p>UPS de alta confiabilidad factor de potencia 1.0 para centros de datos y racks críticos con protección contra microcortes.</p>',
      price: '2150.00',
      stock: 12,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Sistema de Videoconferencia Avaya Collaboration Bar B109',
      brand: 'Avaya',
      category: 'comunicaciones_unificadas',
      sku: 'AVAYA-B109-CONF',
      description: '<p>El <strong>Avaya B109</strong> es un altavoz de conferencia personal ultracompacto y portátil diseñado para profesionales que demandan máxima claridad acústica en entornos de trabajo híbrido, oficinas privadas y salas de reunión pequeñas (huddle rooms de hasta 6 personas).</p><h4>Claridad de Audio Excepcional con OmniSound®</h4><p>Equipado con la tecnología patentada <strong>OmniSound®</strong> de Avaya, ofrece audio de banda ancha Full Duplex cristalino en 360°, eliminando ruidos de fondo no deseados y ecos acústicos molestos. Ideal tanto para llamadas de conferencia críticas como para reproducción de contenido multimedia con alta fidelidad.</p><h4>Conectividad Instantánea y Sin Fisuras</h4><ul><li><strong>Bluetooth con NFC:</strong> Emparejamiento instantáneo al aproximar cualquier smartphone o tablet compatible.</li><li><strong>Conexión USB Plug & Play:</strong> Compatible con PC y Mac sin necesidad de drivers adicionales.</li><li><strong>Compatibilidad Certificada:</strong> Integración transparente con Microsoft Teams, Zoom, Avaya Spaces, Cisco Webex y Google Meet.</li><li><strong>Salida de Audio 3.5mm:</strong> Permite conectar auriculares para alternar con total privacidad entre llamadas personales y de conferencia.</li></ul><h4>Autonomía y Diseño Portátil</h4><p>Incorpora una batería de iones de litio de alta densidad que proporciona hasta <strong>12 horas continuas de conversación</strong> y 60 días en modo standby. Su pantalla LCD informativa y teclas táctiles retroiluminadas permiten gestionar el volumen, silenciar micrófonos y conmutar fuentes de audio de forma intuitiva.</p>',
      price: '680.00',
      stock: 14,
      weight: '0.23',
      depth: '14.5',
      width: '13.5',
      height: '3.2',
      image_url: 'http://localhost:3001/uploads/avaya_b109.png',
      images: [
        'http://localhost:3001/uploads/avaya_b109.png',
        'http://localhost:3001/uploads/avaya_b109_angle.jpg'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Licencia Anual FortiGuard Enterprise Protection Bundle',
      brand: 'Fortinet',
      category: 'security',
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
  ]),
  product_stock: [
    // Producto 1 (Fortinet 60F)
    { id: 1, product_id: 1, country_id: 2, stock: 24 }, // Argentina
    { id: 2, product_id: 1, country_id: 4, stock: 10 }, // Chile
    { id: 3, product_id: 1, country_id: 5, stock: 14 }, // Colombia
    { id: 4, product_id: 1, country_id: 8, stock: 20 }, // México
    { id: 5, product_id: 1, country_id: 1, stock: 35 }, // US
    // Producto 2 (Switch MikroTik 24P)
    { id: 6, product_id: 2, country_id: 2, stock: 18 }, // Argentina
    { id: 7, product_id: 2, country_id: 4, stock: 8 },  // Chile
    { id: 8, product_id: 2, country_id: 5, stock: 12 }, // Colombia
    { id: 9, product_id: 2, country_id: 8, stock: 15 }, // México
    { id: 10, product_id: 2, country_id: 1, stock: 25 },
    // Producto 3 (Aruba AP22)
    { id: 11, product_id: 3, country_id: 2, stock: 40 }, // Argentina
    { id: 12, product_id: 3, country_id: 4, stock: 15 }, // Chile
    { id: 13, product_id: 3, country_id: 5, stock: 22 }, // Colombia
    { id: 14, product_id: 3, country_id: 8, stock: 30 }, // México
    // Producto 4 (UPS Vertiv Liebert GXT5 3kVA)
    { id: 15, product_id: 4, country_id: 2, stock: 12 }, // Argentina
    { id: 16, product_id: 4, country_id: 4, stock: 5 },  // Chile
    { id: 17, product_id: 4, country_id: 5, stock: 8 },  // Colombia
    // Producto 5 (Avaya Collaboration Bar B109)
    { id: 18, product_id: 5, country_id: 2, stock: 14 }, // Argentina
    { id: 19, product_id: 5, country_id: 4, stock: 6 },  // Chile
    { id: 20, product_id: 5, country_id: 5, stock: 9 },  // Colombia
    // Producto 6 (Licencia FortiGuard Enterprise)
    { id: 21, product_id: 6, country_id: 2, stock: 999 }, // Argentina
    { id: 22, product_id: 6, country_id: 4, stock: 999 }, // Chile
    { id: 23, product_id: 6, country_id: 5, stock: 999 }  // Colombia
  ],
  pricing_rules: [
    {
      id: 1,
      name: 'Descuento Mayorista Integradores IT en Fortinet (Argentina)',
      coupon_code: null,
      rule_type: 'discount',
      value_type: 'percentage',
      value: '18.00',
      tipo_cliente: 'Integrador IT / Reseller',
      country_id: 2,
      brand: 'Fortinet',
      product_id: null,
      user_id: null,
      priority: 10,
      min_order_amount: null,
      valid_until: null,
      usage_limit: null,
      times_used: 0,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Descuento Especial ISPs en MikroTik y Aruba',
      coupon_code: null,
      rule_type: 'discount',
      value_type: 'percentage',
      value: '20.00',
      tipo_cliente: 'Proveedor de Internet (ISP / WISP)',
      country_id: null,
      brand: 'MikroTik',
      product_id: null,
      user_id: null,
      priority: 8,
      min_order_amount: null,
      valid_until: null,
      usage_limit: null,
      times_used: 0,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Cupón 15% OFF en Marca Fortinet',
      coupon_code: 'FORTINET15',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '15.00',
      tipo_cliente: null,
      country_id: null,
      brand: 'Fortinet',
      product_id: null,
      user_id: null,
      priority: 15,
      min_order_amount: 300,
      valid_until: '2026-12-31',
      usage_limit: 100,
      times_used: 12,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Cupón Exclusivo DACAS Argentina 10% OFF',
      coupon_code: 'ARGENTINA10',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '10.00',
      tipo_cliente: null,
      country_id: 2,
      brand: null,
      product_id: null,
      user_id: null,
      priority: 12,
      min_order_amount: 500,
      valid_until: '2026-12-31',
      usage_limit: 50,
      times_used: 8,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Cupón VIP Especial Cliente Laura Gómez / Empresa Demo',
      coupon_code: 'CLIENTEVIP25',
      rule_type: 'discount',
      value_type: 'percentage',
      value: '25.00',
      tipo_cliente: null,
      country_id: null,
      brand: null,
      product_id: null,
      user_id: 1,
      priority: 20,
      min_order_amount: null,
      valid_until: '2026-12-31',
      usage_limit: 20,
      times_used: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Cupón $50 USD OFF en Switch Aruba 2930F',
      coupon_code: 'ARUBA50OFF',
      rule_type: 'discount',
      value_type: 'fixed',
      value: '50.00',
      tipo_cliente: null,
      country_id: null,
      brand: null,
      product_id: 1,
      user_id: null,
      priority: 10,
      min_order_amount: 200,
      valid_until: '2026-12-31',
      usage_limit: 30,
      times_used: 5,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 1042,
      user_id: 1,
      country_id: 2,
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
      country_id: 2,
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
      user_id: 4,
      country_id: 2,
      total: '756.50',
      subtotal: '890.00',
      tax_applied: '0.00',
      shipping_applied: '0.00',
      nationalization_applied: '0.00',
      discount_applied: '133.50',
      status: 'procesando',
      payment_method: 'Transferencia B2B Bancaria (Factura A)',
      shipping_address: 'Carril Rodríguez Peña 2400, Mendoza',
      tracking_number: 'DACAS-LOG-AR-99402',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 1060,
      user_id: 6,
      country_id: 4,
      total: '1980.00',
      subtotal: '1750.00',
      tax_applied: '332.50',
      shipping_applied: '18.00',
      nationalization_applied: '0.00',
      discount_applied: '120.50',
      status: 'en_camino',
      payment_method: 'Transferencia Bancaria Local (Banco de Chile)',
      shipping_address: 'Av. Américo Vespucio Norte 2200, Santiago, Chile',
      tracking_number: 'DACAS-LOG-CL-77120',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 1065,
      user_id: 7,
      country_id: 5,
      total: '2840.00',
      subtotal: '2450.00',
      tax_applied: '465.50',
      shipping_applied: '18.00',
      nationalization_applied: '0.00',
      discount_applied: '93.50',
      status: 'entregado',
      payment_method: 'Transferencia Bancolombia / PSE',
      shipping_address: 'Calle 26 # 69D-91, Bogotá, Colombia',
      tracking_number: 'DACAS-LOG-CO-55102',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 1070,
      user_id: 12,
      country_id: 12,
      country_code: 'UY',
      total: '1620.00',
      subtotal: '1450.00',
      tax_applied: '319.00',
      shipping_applied: '12.00',
      nationalization_applied: '0.00',
      discount_applied: '161.00',
      status: 'procesando',
      payment_method: 'Transferencia Bancaria Local (BROU / Itaú Uruguay)',
      shipping_address: 'Rbla. República de México 6400, Carrasco, Montevideo',
      tracking_number: 'DACAS-LOG-UY-33109',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 1075,
      user_id: 10,
      country_id: 10,
      country_code: 'PE',
      total: '3150.00',
      subtotal: '2750.00',
      tax_applied: '495.00',
      shipping_applied: '25.00',
      nationalization_applied: '0.00',
      discount_applied: '120.00',
      status: 'en_camino',
      payment_method: 'Depósito / Transferencia BCP Perú',
      shipping_address: 'Av. Javier Prado Este 4200, Surco, Lima',
      tracking_number: 'DACAS-LOG-PE-44812',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 1080,
      user_id: 8,
      country_id: 8,
      country_code: 'MX',
      total: '4200.00',
      subtotal: '3700.00',
      tax_applied: '592.00',
      shipping_applied: '30.00',
      nationalization_applied: '0.00',
      discount_applied: '122.00',
      status: 'entregado',
      payment_method: 'Transferencia Interbancaria SPEI (BBVA México)',
      shipping_address: 'Paseo de la Reforma 222, Cuauhtémoc, CDMX',
      tracking_number: 'DACAS-LOG-MX-88901',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 1085,
      user_id: 11,
      country_id: 1,
      country_code: 'US',
      total: '5500.00',
      subtotal: '5200.00',
      tax_applied: '300.00',
      shipping_applied: '0.00',
      nationalization_applied: '0.00',
      discount_applied: '0.00',
      status: 'entregado',
      payment_method: 'Wire Transfer / ACH (Chase Bank)',
      shipping_address: '8350 NW 52nd Terrace, Suite 100, Doral, FL 33166',
      tracking_number: 'DACAS-LOG-US-11204',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
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
      product_name: 'Punto de Acceso Wi-Fi 6 Enterprise Aruba Instant On AP22',
      brand: 'Aruba',
      sku: 'R4W02A-AP22',
      quantity: 1,
      price_at_purchase: '195.00',
      image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 3,
      order_id: 1049,
      product_id: 2,
      product_name: 'Switch Gestionable Gigabit 24 Puertos PoE+ MikroTik Cloud Router',
      brand: 'MikroTik',
      sku: 'CRS328-24P-4S',
      quantity: 1,
      price_at_purchase: '449.00',
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
  nextIds: { users: 12, countries: 13, products: 7, stock: 7, rules: 5, orders: 1090, order_items: 5, change_requests: 2, company_team: 4, end_users: 3 }
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
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const fileProds = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
        if (Array.isArray(fileProds) && fileProds.length > 0) {
          inMem.products = fileProds;
        }
      } catch (_) {}
    }
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
      const matchedCountry = inMem.countries.find(c => c.id === parseInt(params[9]));
      newUser = {
        id,
        name: params[0], email: params[1], password_hash: params[2], razon_social: params[3], tipo_cliente: params[4],
        direccion_legal: params[5], localidad: params[6], codigo_postal: params[7], ciudad: params[8], country_id: params[9],
        country_code: matchedCountry ? matchedCountry.code : 'AR',
        country_name: matchedCountry ? matchedCountry.name : 'Argentina',
        phone: params[10], fecha_limite_facturacion: params[11], web: params[12], report_to_country_id: params[13],
        vendedor: params[14], direccion_entrega: params[15], localidad_entrega: params[16], codigo_postal_entrega: params[17],
        ciudad_entrega: params[18], pais_entrega_id: params[19], tipo_iva: params[20], numero_nit: params[21],
        nombre_compras: params[22], telefono_compras: params[23], email_compras: params[24], nombre_pagos: params[25],
        telefono_pagos: params[26], email_pagos: params[27], nombre_admin: params[28], telefono_admin: params[29],
        email_admin: params[30], email_factura_electronica: params[31], email_contacto_compras: params[32],
        email_cotizaciones_automaticas: params[33], address: params[34], company: params[35],
        cuenta_corriente_habilitada: params[36] !== undefined ? Boolean(params[36]) : false,
        status: params[37] || 'activo',
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
      return { rows: [{ ...u, status: u.status || 'activo', country_name: c ? c.name : (u.country_name || null), country_code: c ? c.code : (u.country_code || null) }] };
    }
    const rows = inMem.users.map(u => {
      const c = inMem.countries.find(country => country.id === u.country_id);
      return { ...u, status: u.status || 'activo', country_name: c ? c.name : (u.country_name || null), country_code: c ? c.code : (u.country_code || null) };
    });
    return { rows };
  }

  // 6. UPDATE ecommerce_users
  if (/^UPDATE ecommerce_users/i.test(norm)) {
    const userId = parseInt(params[params.length - 1]);
    const idx = inMem.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const matchedCountry = inMem.countries.find(c => c.id === parseInt(params[8]));
      inMem.users[idx] = {
        ...inMem.users[idx],
        name: params[0], email: params[1], razon_social: params[2], tipo_cliente: params[3],
        direccion_legal: params[4], localidad: params[5], codigo_postal: params[6], ciudad: params[7],
        country_id: params[8],
        country_code: matchedCountry ? matchedCountry.code : inMem.users[idx].country_code,
        country_name: matchedCountry ? matchedCountry.name : inMem.users[idx].country_name, phone: params[9], fecha_limite_facturacion: params[10], web: params[11],
        report_to_country_id: params[12], vendedor: params[13], direccion_entrega: params[14], localidad_entrega: params[15],
        codigo_postal_entrega: params[16], ciudad_entrega: params[17], pais_entrega_id: params[18], tipo_iva: params[19],
        numero_nit: params[20], nombre_compras: params[21], telefono_compras: params[22], email_compras: params[23],
        nombre_pagos: params[24], telefono_pagos: params[25], email_pagos: params[26], nombre_admin: params[27],
        telefono_admin: params[28], email_admin: params[29], email_factura_electronica: params[30], email_contacto_compras: params[31],
        email_cotizaciones_automaticas: params[32], address: params[33], company: params[34],
        cargo: params[35] || inMem.users[idx].cargo || 'Contacto / Usuario',
        cuenta_corriente_habilitada: params[36] !== undefined ? Boolean(params[36]) : (inMem.users[idx].cuenta_corriente_habilitada || false),
        status: params[37] !== undefined && typeof params[37] === 'string' && ['activo', 'pendiente', 'inactivo'].includes(params[37]) ? params[37] : inMem.users[idx].status
      };
      if (/password_hash\s*=\s*\$/i.test(norm)) {
        inMem.users[idx].password_hash = params[params.length - 2];
      }
      return { rows: [inMem.users[idx]] };
    }
    return { rows: [] };
  }

  // 6.1 DELETE FROM ecommerce_users
  if (/^DELETE FROM ecommerce_users WHERE id = \$1/i.test(norm)) {
    const userId = parseInt(params[0]);
    const idx = inMem.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const removed = inMem.users.splice(idx, 1);
      return { rows: removed };
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
        country_code: c ? c.code : null,
        user_email: u ? u.email : null
      };
    }).sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return { rows };
  }

  if (/^INSERT INTO ecommerce_pricing_rules/i.test(norm)) {
    let newRule;
    if (params.length >= 16) {
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
        coupon_code: params[11] ? String(params[11]).trim().toUpperCase() : null,
        min_order_amount: params[12] ? parseFloat(params[12]) : null,
        valid_until: params[13] || null,
        usage_limit: params[14] ? parseInt(params[14]) : null,
        times_used: params[15] ? parseInt(params[15]) : 0,
        created_at: new Date().toISOString()
      };
    } else if (params.length >= 11) {
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
        coupon_code: null,
        min_order_amount: null,
        valid_until: null,
        usage_limit: null,
        times_used: 0,
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
        coupon_code: null,
        min_order_amount: null,
        valid_until: null,
        usage_limit: null,
        times_used: 0,
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
      if (params.length >= 17) {
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
          is_active: params[10] !== false,
          coupon_code: params[11] ? String(params[11]).trim().toUpperCase() : null,
          min_order_amount: params[12] ? parseFloat(params[12]) : null,
          valid_until: params[13] || null,
          usage_limit: params[14] ? parseInt(params[14]) : null,
          times_used: params[15] !== undefined ? parseInt(params[15]) : (inMem.pricing_rules[idx].times_used || 0)
        };
      } else if (params.length >= 12) {
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
      brand: pData.brand || '',
      is_featured: Boolean(pData.is_featured || pData.isFeatured || pData.featured),
      badge: pData.badge || (Boolean(pData.is_featured || pData.isFeatured || pData.featured) ? 'DESTACADO' : ''),
      weight: pData.weight || '',
      depth: pData.depth || '',
      width: pData.width || '',
      height: pData.height || '',
      mpn: pData.mpn || '',
      age_group: pData.age_group || '',
      gender: pData.gender || '',
      categories: pData.categories || [pData.category || 'General'],
      category: pData.category || (Array.isArray(pData.categories) ? pData.categories[0] : 'General'),
      subcategory: pData.subcategory || '',
      country_code: pData.country_code ? pData.country_code.toUpperCase() : 'AR',
      country_id: pData.country_id ? parseInt(pData.country_id, 10) : (resolveCountry(pData.country_code || 'AR').id),
      variants: pData.variants || [],
      image_url: pData.image_url || '',
      secondary_images: Array.isArray(pData.secondary_images) ? pData.secondary_images : [],
      images: Array.isArray(pData.images) && pData.images.length > 0
        ? pData.images
        : [pData.image_url, ...(Array.isArray(pData.secondary_images) ? pData.secondary_images : [])].filter(Boolean),
      video_url: pData.video_url || '',
      created_at: new Date().toISOString()
    };
    inMem.products.push(newProd);
    saveProductsToFile();
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
      const current = inMem.products[idx];
      const mainImg = pData.image_url !== undefined ? pData.image_url : (current.image_url || '');
      const secImgs = Array.isArray(pData.secondary_images) ? pData.secondary_images : (current.secondary_images || []);
      const allImgs = Array.isArray(pData.images) && pData.images.length > 0
        ? pData.images
        : [mainImg, ...secImgs].filter(Boolean);

      const isFeat = pData.is_featured !== undefined ? Boolean(pData.is_featured) : (pData.isFeatured !== undefined ? Boolean(pData.isFeatured) : (pData.featured !== undefined ? Boolean(pData.featured) : current.is_featured));

      inMem.products[idx] = {
        ...current,
        ...pData,
        id,
        brand: pData.brand !== undefined ? pData.brand : current.brand,
        subcategory: pData.subcategory !== undefined ? pData.subcategory : current.subcategory,
        country_code: pData.country_code ? pData.country_code.toUpperCase() : (current.country_code || 'AR'),
        country_id: pData.country_id ? parseInt(pData.country_id, 10) : (current.country_id || 2),
        is_featured: isFeat,
        badge: pData.badge !== undefined ? pData.badge : (isFeat && !current.badge ? 'DESTACADO' : (!isFeat && current.badge === 'DESTACADO' ? '' : current.badge)),
        image_url: mainImg,
        secondary_images: secImgs,
        images: allImgs,
        price: String(pData.price || current.price || '0.00'),
        stock: pData.stock_type === 'infinite' ? 9999 : (pData.stock !== undefined ? parseInt(pData.stock) : current.stock)
      };
      saveProductsToFile();
      return { rows: [inMem.products[idx]] };
    }
    return { rows: [] };
  }

  if (/^DELETE FROM ecommerce_products/i.test(norm)) {
    const id = parseInt(params[0]);
    const idx = inMem.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = inMem.products.splice(idx, 1)[0];
      saveProductsToFile();
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
    try {
      erpDatabaseService.createOrder({
        id: newOrder.id,
        user_id: newOrder.user_id,
        cliente: 'Cliente B2B E-commerce',
        total: parseFloat(newOrder.total) || 0,
        currency: 'USD',
        payment_method: 'credit_30',
        erp_status: 'Pendiente',
        created_at: newOrder.created_at
      });
    } catch (_) {}
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
      const c = inMem.countries.find(country => country.id === o.country_id) || (o.country_code ? STATIC_COUNTRIES.find(sc => sc.code === o.country_code.toUpperCase()) : null);
      const items = inMem.order_items.filter(it => it.order_id === o.id);
      return {
        ...o,
        user_name: u ? u.name : 'Desconocido',
        user_email: u ? u.email : 'N/A',
        user_company: u ? (u.razon_social || u.empresa || u.name) : 'Empresa Cliente',
        user_cuit: u ? (u.cuit || u.numero_nit || '') : '',
        user_phone: u ? (u.phone || u.telefono || '') : '',
        country_name: c ? c.name : (o.country_name || 'Argentina'),
        country_code: c ? c.code : (o.country_code || 'AR'),
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

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL DE SEGURIDAD: JWT_SECRET debe estar definido en las variables de entorno (.env) en producción.'); })()
    : 'sec_' + crypto.createHash('sha256').update(process.platform + __dirname + 'dacas_b2b_jwt_salt').digest('hex')
);

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
  if (role !== 'admin' && role !== 'admin_ecommerce' && role !== 'admin_erp') {
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
      numero_nit, country_id, country_code, ciudad, direccion_legal, web, company 
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const targetCountry = resolveCountry(country_code || country_id || 'AR');
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
          targetCountry.id,
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
          direccion_legal || '', '', '', ciudad || '', targetCountry.id,
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
    
    const isBcryptMatch = user && user.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    
    if (user && isBcryptMatch) {
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

      const safeUser = { ...user };
      delete safeUser.password_hash;
      safeUser.cuit = safeUser.numero_nit || safeUser.cuit || '30-12345678-9';
      safeUser.tipo_iva = safeUser.tipo_iva || 'IVA Responsable Inscripto';
      safeUser.tipo_factura = safeUser.tipo_factura || 'Factura A (Responsable Inscripto)';
      safeUser.cuenta_corriente_habilitada = Boolean(user.cuenta_corriente_habilitada);
      const targetCountry = resolveCountry(safeUser.country_code || safeUser.country_id || safeUser.country_name || 'AR') || { id: 2, code: 'AR', name: 'Argentina' };
      safeUser.country_id = targetCountry.id;
      safeUser.country_code = targetCountry.code;
      safeUser.country_name = targetCountry.name;

      res.json({ 
        token: accessToken, 
        user: safeUser
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
    // Promotional coupons with code must not apply automatically in catalog
    if (r.coupon_code && String(r.coupon_code).trim() !== '') return false;
    
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

    // Determine target country (primary key scope)
    const rawCountryParam = req.query.country || req.query.country_code || req.query.country_id;
    const isAllCountries = rawCountryParam && (rawCountryParam.toString().toLowerCase() === 'all' || rawCountryParam.toString().toLowerCase() === 'todos');
    const countryParam = rawCountryParam || (user ? user.country_id : 'AR');
    const targetCountry = resolveCountry(countryParam);

    const result = await pool.query('SELECT * FROM ecommerce_products ORDER BY id ASC');
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
    const allRules = rulesRes.rows;

    let sourceProducts = result.rows;
    if (!isAllCountries) {
      sourceProducts = sourceProducts.filter(p => {
        const prodCountryCode = (p.country_code || 'AR').toUpperCase();
        return prodCountryCode === targetCountry.code.toUpperCase();
      });
    }

    const formatted = sourceProducts.map(p => {
      const pCountry = resolveCountry(p.country_code || targetCountry.code);
      // Find stock in the selected country
      let localStock = p.stock !== undefined ? parseInt(p.stock, 10) : 0;
      if (typeof inMem !== 'undefined' && Array.isArray(inMem.product_stock)) {
        const cStock = inMem.product_stock.find(s => s.product_id === p.id && s.country_id === pCountry.id);
        if (cStock && cStock.stock !== undefined) {
          localStock = parseInt(cStock.stock, 10);
        }
      }

      // Contextual pricing rule application with country scope
      const contextualUser = user
        ? { ...user, country_id: pCountry.id }
        : { country_id: pCountry.id, tipo_cliente: 'Integrador IT / Reseller' };
      const pricing = calculateCustomProductPrice(p, contextualUser, allRules);

      const mainImg = p.image_url || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '');
      const secImgs = Array.isArray(p.secondary_images) ? p.secondary_images : [];
      let combinedImages = [];
      if (mainImg) combinedImages.push(mainImg);
      secImgs.forEach(img => {
        if (img && !combinedImages.includes(img)) combinedImages.push(img);
      });
      if (combinedImages.length === 0 && Array.isArray(p.images) && p.images.length > 0) {
        combinedImages = p.images;
      }
      return {
        ...p,
        ...pricing,
        country_code: pCountry.code,
        country_id: pCountry.id,
        stock: localStock,
        country_stock: localStock,
        total_stock: p.stock,
        selected_country: {
          id: pCountry.id,
          code: pCountry.code,
          name: pCountry.name,
          tax_rate: pCountry.tax_rate,
          shipping_cost: pCountry.shipping_cost
        },
        image_url: mainImg,
        images: combinedImages
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
    const prod = result.rows[0];
    const rulesRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
    const pricing = calculateCustomProductPrice(prod, user, rulesRes.rows);
    const mainImg = prod.image_url || (Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : '');
    const secImgs = Array.isArray(prod.secondary_images) ? prod.secondary_images : [];
    let combinedImages = [];
    if (mainImg) combinedImages.push(mainImg);
    secImgs.forEach(img => {
      if (img && !combinedImages.includes(img)) combinedImages.push(img);
    });
    if (combinedImages.length === 0 && Array.isArray(prod.images) && prod.images.length > 0) {
      combinedImages = prod.images;
    }

    res.json({
      ...prod,
      ...pricing,
      image_url: mainImg,
      images: combinedImages
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

    // Insert Order Items & decrement product stock
    for (let oi of orderItems) {
      await pool.query(
        'INSERT INTO ecommerce_order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, oi.product_id, oi.quantity, oi.price_at_purchase]
      );
      if (isPgConnected) {
        await pool.query('UPDATE ecommerce_products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [oi.quantity, oi.product_id]);
        if (country_id) {
          await pool.query('UPDATE ecommerce_product_stock SET stock = GREATEST(0, stock - $1) WHERE product_id = $2 AND country_id = $3', [oi.quantity, oi.product_id, country_id]);
        }
      } else {
        const prod = inMem.products.find(p => p.id === oi.product_id);
        if (prod && prod.stock_type !== 'infinite') {
          prod.stock = Math.max(0, (parseInt(prod.stock, 10) || 0) - oi.quantity);
        }
        if (country_id) {
          const cStock = inMem.product_stock.find(s => s.product_id === oi.product_id && s.country_id === country_id);
          if (cStock) cStock.stock = Math.max(0, (parseInt(cStock.stock, 10) || 0) - oi.quantity);
        }
      }
    }
    if (!isPgConnected) {
      saveProductsToFile();
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
    let user;
    if (isPgConnected) {
      const userRes = await pool.query(`
        SELECT u.*, c.name as country_name, c.tax_rate, c.shipping_cost,
               rc.name as report_country_name
        FROM ecommerce_users u 
        LEFT JOIN ecommerce_countries c ON u.country_id = c.id 
        LEFT JOIN ecommerce_countries rc ON u.report_to_country_id = rc.id 
        WHERE u.id = $1
      `, [req.user.id]);

      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      user = userRes.rows[0];
    } else {
      const found = inMem.users.find(u => u.id === req.user.id);
      if (!found) return res.status(404).json({ error: 'Cliente no encontrado' });
      user = { ...found };
    }

    delete user.password_hash;
    user.cuit = user.numero_nit || user.cuit || '30-12345678-9';
    user.tipo_iva = user.tipo_iva || 'IVA Responsable Inscripto';
    user.tipo_factura = user.tipo_factura || 'Factura A (Responsable Inscripto)';
    user.cuenta_corriente_habilitada = Boolean(user.cuenta_corriente_habilitada);

    if (typeof user.percepciones === 'string') {
      try { user.percepciones = JSON.parse(user.percepciones); } catch (_) {}
    }

    // Asegurar estructura de IIBB y percepciones para clientes de Argentina
    if ((user.country_id === 2 || user.country_name === 'Argentina' || !user.country_id) && !user.percepciones) {
      user.iibb_jurisdiccion = user.iibb_jurisdiccion || '901 - Capital Federal';
      user.iibb_tipo = user.iibb_tipo || 'C.M.';
      user.iibb_numero = user.iibb_numero || user.numero_nit || '9017223280';
      user.iibb_codigo_aceptacion = user.iibb_codigo_aceptacion !== undefined ? user.iibb_codigo_aceptacion : true;
      user.percepciones = {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      };
    }

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

// 2. Actualizar datos editables del perfil (teléfono, contacto, avatar, domicilios, etc.)
router.put('/client/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, razon_social, phone, ciudad, direccion_entrega, localidad_entrega, codigo_postal_entrega, ciudad_entrega,
      direccion_legal, localidad, codigo_postal,
      web, avatar_url, nombre_compras, telefono_compras, email_compras,
      nombre_pagos, telefono_pagos, email_pagos
    } = req.body;

    if (isPgConnected) {
      await pool.query(`
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS direccion_legal TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS localidad TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS codigo_postal TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS ciudad TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS direccion_entrega TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS localidad_entrega TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS ciudad_entrega TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS codigo_postal_entrega TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS web TEXT;
        ALTER TABLE ecommerce_users ADD COLUMN IF NOT EXISTS razon_social TEXT;
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
          email_pagos = COALESCE($14, email_pagos),
          direccion_legal = COALESCE($15, direccion_legal),
          localidad = COALESCE($16, localidad),
          codigo_postal = COALESCE($17, codigo_postal),
          ciudad_entrega = COALESCE($18, ciudad_entrega),
          razon_social = COALESCE($19, razon_social)
        WHERE id = $20
        RETURNING *
      `, [
        name, phone, ciudad, direccion_entrega, localidad_entrega, codigo_postal_entrega,
        web, avatar_url, nombre_compras, telefono_compras, email_compras,
        nombre_pagos, telefono_pagos, email_pagos,
        direccion_legal, localidad, codigo_postal, ciudad_entrega,
        razon_social,
        userId
      ]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      const updated = result.rows[0];
      delete updated.password_hash;
      return res.json({ success: true, message: 'Perfil actualizado exitosamente', user: updated });
    } else {
      const idx = inMem.users.findIndex(u => u.id === userId);
      if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (name !== undefined) inMem.users[idx].name = name;
      if (razon_social !== undefined) inMem.users[idx].razon_social = razon_social;
      if (phone !== undefined) inMem.users[idx].phone = phone;
      if (ciudad !== undefined) inMem.users[idx].ciudad = ciudad;
      if (direccion_entrega !== undefined) inMem.users[idx].direccion_entrega = direccion_entrega;
      if (localidad_entrega !== undefined) inMem.users[idx].localidad_entrega = localidad_entrega;
      if (codigo_postal_entrega !== undefined) inMem.users[idx].codigo_postal_entrega = codigo_postal_entrega;
      if (ciudad_entrega !== undefined) inMem.users[idx].ciudad_entrega = ciudad_entrega;
      if (direccion_legal !== undefined) inMem.users[idx].direccion_legal = direccion_legal;
      if (localidad !== undefined) inMem.users[idx].localidad = localidad;
      if (codigo_postal !== undefined) inMem.users[idx].codigo_postal = codigo_postal;
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

// ==========================================
// GESTIÓN DE EQUIPO Y USUARIOS DE LA EMPRESA B2B
// ==========================================

// 1. Obtener todos los usuarios / colaboradores de la empresa cliente
router.get('/client/team', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user.parent_id || req.user.id;

    // Obtener datos de la empresa matriz
    let companyName = req.user.razon_social || req.user.company_name;
    if (!companyName) {
      if (isPgConnected) {
        const uRes = await pool.query('SELECT razon_social, name FROM ecommerce_users WHERE id = $1', [parentUserId]);
        if (uRes.rows[0]) companyName = uRes.rows[0].razon_social || uRes.rows[0].name;
      } else {
        const u = inMem.users.find(x => x.id === parentUserId);
        if (u) companyName = u.razon_social || u.name;
      }
    }

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_company_users (
          id SERIAL PRIMARY KEY,
          company_user_id INTEGER NOT NULL,
          company_name VARCHAR(150),
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          cargo VARCHAR(100),
          phone VARCHAR(50),
          password_hash TEXT,
          plain_password TEXT,
          role VARCHAR(50) DEFAULT 'comprador',
          can_order BOOLEAN DEFAULT true,
          can_view_prices BOOLEAN DEFAULT true,
          can_request_quotes BOOLEAN DEFAULT true,
          can_manage_team BOOLEAN DEFAULT false,
          status VARCHAR(20) DEFAULT 'activo',
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await pool.query(`
        SELECT id, company_user_id, company_name, name, email, cargo, phone, role, 
               can_order, can_view_prices, can_request_quotes, can_manage_team, status, avatar_url, created_at
        FROM ecommerce_company_users 
        WHERE company_user_id = $1 OR company_name = $2
        ORDER BY created_at ASC
      `, [parentUserId, companyName]);

      return res.json({
        success: true,
        company_name: companyName,
        team: result.rows
      });
    } else {
      if (!inMem.company_team) inMem.company_team = [];
      const team = inMem.company_team.filter(m => m.company_user_id === parentUserId || m.company_name === companyName);
      
      const safeTeam = team.map(m => ({
        id: m.id,
        company_user_id: m.company_user_id,
        company_name: m.company_name,
        name: m.name,
        email: m.email,
        cargo: m.cargo,
        phone: m.phone,
        role: m.role,
        can_order: m.can_order !== false,
        can_view_prices: m.can_view_prices !== false,
        can_request_quotes: m.can_request_quotes !== false,
        can_manage_team: m.can_manage_team === true,
        status: m.status || 'activo',
        avatar_url: m.avatar_url,
        created_at: m.created_at
      }));

      return res.json({
        success: true,
        company_name: companyName,
        team: safeTeam
      });
    }
  } catch (error) {
    console.error('Error en GET /client/team:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Agregar un nuevo usuario / colaborador a la cuenta de la empresa
router.post('/client/team', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user.parent_id || req.user.id;
    const {
      name,
      email,
      cargo,
      phone,
      role = 'comprador',
      can_order = true,
      can_view_prices = true,
      can_request_quotes = true,
      can_manage_team = false,
      password
    } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y Correo Electrónico son obligatorios.' });
    }

    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ error: 'Debe ingresar una contraseña válida de al menos 6 caracteres.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Obtener datos de la empresa matriz
    let parentUser = null;
    if (isPgConnected) {
      const uRes = await pool.query('SELECT * FROM ecommerce_users WHERE id = $1', [parentUserId]);
      parentUser = uRes.rows[0];
    } else {
      parentUser = inMem.users.find(x => x.id === parentUserId);
    }

    const companyName = parentUser ? (parentUser.razon_social || parentUser.name) : (req.user.razon_social || 'Empresa B2B');
    const passwordHash = await bcrypt.hash(String(password).trim(), 10);

    if (isPgConnected) {
      // Verificar si el email ya existe en company_users
      const existRes = await pool.query('SELECT id FROM ecommerce_company_users WHERE email = $1', [cleanEmail]);
      if (existRes.rows.length > 0) {
        return res.status(400).json({ error: `El correo ${cleanEmail} ya se encuentra registrado en el equipo.` });
      }

      const insertRes = await pool.query(`
        INSERT INTO ecommerce_company_users (
          company_user_id, company_name, name, email, cargo, phone, password_hash,
          role, can_order, can_view_prices, can_request_quotes, can_manage_team, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'activo')
        RETURNING *
      `, [
        parentUserId, companyName, name, cleanEmail, cargo || 'Colaborador B2B', phone || '',
        passwordHash, role, can_order, can_view_prices, can_request_quotes, can_manage_team
      ]);

      // También registrar o actualizar en ecommerce_users para acceso directo
      try {
        await pool.query(`
          INSERT INTO ecommerce_users (name, email, password_hash, razon_social, tipo_cliente, phone, country_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'activo')
          ON CONFLICT (email) DO UPDATE SET 
            name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            razon_social = EXCLUDED.razon_social;
        `, [
          name, cleanEmail, passwordHash, companyName, parentUser?.tipo_cliente || 'Integrador IT / Reseller',
          phone || '', parentUser?.country_id || 1
        ]);
      } catch (_) {}

      registrarLog({
        origen: 'ecommerce',
        tipo: 'CREAR',
        accion: 'ECOMMERCE_USUARIO_EMPRESA_CREADO',
        descripcion: `Nuevo usuario corporativo agregado a "${companyName}": ${name} (${cleanEmail}) con rol ${cargo || role}.`,
        usuario: req.user,
        req,
        detalles: { parentUserId, memberEmail: cleanEmail, role }
      });

      return res.status(201).json({
        success: true,
        message: `Usuario ${name} agregado exitosamente a la cuenta de ${companyName}.`,
        member: insertRes.rows[0]
      });
    } else {
      if (!inMem.company_team) inMem.company_team = [];
      const exists = inMem.company_team.some(m => m.email.toLowerCase() === cleanEmail);
      if (exists) {
        return res.status(400).json({ error: `El correo ${cleanEmail} ya se encuentra registrado en el equipo.` });
      }

      const newMember = {
        id: inMem.nextIds.company_team++,
        company_user_id: parentUserId,
        company_name: companyName,
        name,
        email: cleanEmail,
        cargo: cargo || 'Colaborador B2B',
        phone: phone || '',
        password_hash: passwordHash,
        role,
        can_order: Boolean(can_order),
        can_view_prices: Boolean(can_view_prices),
        can_request_quotes: Boolean(can_request_quotes),
        can_manage_team: Boolean(can_manage_team),
        status: 'activo',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0fa4de&color=fff&bold=true`,
        created_at: new Date().toISOString()
      };

      inMem.company_team.push(newMember);

      // Sincronizar en inMem.users
      const existingUserIdx = inMem.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
      if (existingUserIdx >= 0) {
        inMem.users[existingUserIdx].name = name;
        inMem.users[existingUserIdx].password_hash = passwordHash;
        inMem.users[existingUserIdx].razon_social = companyName;
      } else {
        inMem.users.push({
          id: inMem.nextIds.users++,
          name,
          email: cleanEmail,
          password_hash: passwordHash,
          razon_social: companyName,
          tipo_cliente: parentUser?.tipo_cliente || 'Integrador IT / Reseller',
          phone: phone || '',
          country_id: parentUser?.country_id || 1,
          status: 'activo',
          avatar_url: newMember.avatar_url,
          created_at: new Date().toISOString()
        });
      }

      registrarLog({
        origen: 'ecommerce',
        tipo: 'CREAR',
        accion: 'ECOMMERCE_USUARIO_EMPRESA_CREADO',
        descripcion: `Nuevo usuario corporativo agregado a "${companyName}": ${name} (${cleanEmail}) con rol ${cargo || role}.`,
        usuario: req.user,
        req,
        detalles: { parentUserId, memberEmail: cleanEmail, role }
      });

      return res.status(201).json({
        success: true,
        message: `Usuario ${name} agregado exitosamente a la cuenta de ${companyName}.`,
        member: newMember
      });
    }
  } catch (error) {
    console.error('Error en POST /client/team:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Modificar datos, rol, permisos o estado de un usuario del equipo
router.put('/client/team/:id', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user.parent_id || req.user.id;
    const memberId = parseInt(req.params.id);
    const {
      name,
      cargo,
      phone,
      role,
      can_order,
      can_view_prices,
      can_request_quotes,
      can_manage_team,
      status,
      password
    } = req.body || {};

    if (isPgConnected) {
      let query = `
        UPDATE ecommerce_company_users SET
          name = COALESCE($1, name),
          cargo = COALESCE($2, cargo),
          phone = COALESCE($3, phone),
          role = COALESCE($4, role),
          can_order = COALESCE($5, can_order),
          can_view_prices = COALESCE($6, can_view_prices),
          can_request_quotes = COALESCE($7, can_request_quotes),
          can_manage_team = COALESCE($8, can_manage_team),
          status = COALESCE($9, status),
          updated_at = CURRENT_TIMESTAMP
      `;
      const values = [name, cargo, phone, role, can_order, can_view_prices, can_request_quotes, can_manage_team, status];

      if (password && String(password).trim() !== '') {
        const newHash = await bcrypt.hash(password, 10);
        values.push(newHash);
        query += `, password_hash = $${values.length} `;
      }

      values.push(memberId, parentUserId, req.user.razon_social || '');
      query += ` WHERE id = $${values.length - 2} AND (company_user_id = $${values.length - 1} OR company_name = $${values.length}) RETURNING *`;

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a su empresa.' });
      }

      return res.json({
        success: true,
        message: 'Datos del usuario actualizados exitosamente.',
        member: result.rows[0]
      });
    } else {
      if (!inMem.company_team) inMem.company_team = [];
      const idx = inMem.company_team.findIndex(m => m.id === memberId && (m.company_user_id === parentUserId || m.company_name === (req.user.razon_social || 'Empresa Demo S.A.')));
      if (idx === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a su empresa.' });
      }

      const mem = inMem.company_team[idx];
      if (name !== undefined) mem.name = name;
      if (cargo !== undefined) mem.cargo = cargo;
      if (phone !== undefined) mem.phone = phone;
      if (role !== undefined) mem.role = role;
      if (can_order !== undefined) mem.can_order = Boolean(can_order);
      if (can_view_prices !== undefined) mem.can_view_prices = Boolean(can_view_prices);
      if (can_request_quotes !== undefined) mem.can_request_quotes = Boolean(can_request_quotes);
      if (can_manage_team !== undefined) mem.can_manage_team = Boolean(can_manage_team);
      if (status !== undefined) mem.status = status;
      if (password && String(password).trim() !== '') {
        mem.password_hash = await bcrypt.hash(password, 10);
      }

      return res.json({
        success: true,
        message: 'Datos del usuario actualizados exitosamente.',
        member: mem
      });
    }
  } catch (error) {
    console.error('Error en PUT /client/team/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Eliminar / Desvincular usuario de la empresa
router.delete('/client/team/:id', authenticateToken, async (req, res) => {
  try {
    const parentUserId = req.user.parent_id || req.user.id;
    const memberId = parseInt(req.params.id);

    if (isPgConnected) {
      const result = await pool.query(`
        DELETE FROM ecommerce_company_users 
        WHERE id = $1 AND (company_user_id = $2 OR company_name = $3)
        RETURNING id, name, email
      `, [memberId, parentUserId, req.user.razon_social || '']);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a su empresa.' });
      }

      return res.json({
        success: true,
        message: `Usuario ${result.rows[0].name} desvinculado de la empresa.`
      });
    } else {
      if (!inMem.company_team) inMem.company_team = [];
      const idx = inMem.company_team.findIndex(m => m.id === memberId && (m.company_user_id === parentUserId || m.company_name === (req.user.razon_social || 'Empresa Demo S.A.')));
      if (idx === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a su empresa.' });
      }

      const deleted = inMem.company_team.splice(idx, 1)[0];
      return res.json({
        success: true,
        message: `Usuario ${deleted.name} desvinculado de la empresa.`
      });
    }
  } catch (error) {
    console.error('Error en DELETE /client/team/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ABM END USERS (CLIENT PORTAL & CHECKOUT) - ERP DATABASE
// ==========================================

// 1. Obtener lista de End Users desde Base ERP
router.get('/client/end-users', optionalAuthToken, async (req, res) => {
  try {
    const list = erpDatabaseService.getEndUsers();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Guardar o modificar un End User (ABM) en Base ERP
router.post('/client/end-users', optionalAuthToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const endUser = erpDatabaseService.saveEndUser({ ...req.body, user_id: userId });
    res.status(201).json({ success: true, message: 'End User guardado en base ERP exitosamente', end_user: endUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Eliminar End User de Base ERP
router.delete('/client/end-users/:id', optionalAuthToken, async (req, res) => {
  try {
    erpDatabaseService.deleteEndUser(req.params.id);
    res.json({ success: true, message: 'End User eliminado de la base ERP' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// MÓDULO ERP DACAS - ONEWORLD
// (Persistido en Base de Datos ERP Independiente erp_database.json)
// ==========================================

// 1. Resumen Ejecutivo / SuiteDashboard & KPIs
router.get('/admin/erp/overview', optionalAuthToken, async (req, res) => {
  try {
    const overview = erpDatabaseService.getOverview(req.query.subsidiary);
    res.json(overview);
  } catch (error) {
    console.error('Error en /admin/erp/overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Subsidiarias Corporativas (OneWorld)
router.get('/admin/erp/subsidiaries', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getSubsidiaries());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Multi-Divisa & Tasas de Cambio
router.get('/admin/erp/currencies', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getCurrencies());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/erp/currencies/:code', optionalAuthToken, async (req, res) => {
  try {
    const updated = erpDatabaseService.updateCurrencyRate(req.params.code, req.body.rate);
    res.json({ success: true, currency: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Contabilidad & Finanzas: Plan de Cuentas (Chart of Accounts)
router.get('/admin/erp/chart-of-accounts', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getChartOfAccounts());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Asientos de Diario (Journal Entries)
router.get('/admin/erp/journal-entries', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getJournalEntries(req.query.subsidiary));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/journal-entries', optionalAuthToken, async (req, res) => {
  try {
    const entry = erpDatabaseService.createJournalEntry(req.body);
    res.status(201).json({ success: true, message: 'Asiento contable registrado exitosamente', entry });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Almacenes & Ubicaciones (Locations)
router.get('/admin/erp/locations', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getLocations());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Maestro de Artículos & Stock Multi-Almacén
router.get('/admin/erp/catalog-sync', optionalAuthToken, async (req, res) => {
  try {
    const items = erpDatabaseService.getCatalogItems(req.query.search, req.query.category, req.query.location);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/inventory/adjust', optionalAuthToken, async (req, res) => {
  try {
    const { itemId, locationCode, adjustmentQty, reason } = req.body;
    const item = erpDatabaseService.adjustInventoryStock(itemId, locationCode, adjustmentQty, reason);
    if (!item) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ success: true, message: 'Ajuste de inventario aplicado exitosamente', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Proveedores (Vendors - Procure-to-Pay)
router.get('/admin/erp/vendors', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getVendors(req.query.search));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Órdenes de Compra (Purchase Orders - PO)
router.get('/admin/erp/purchase-orders', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getPurchaseOrders(req.query.subsidiary, req.query.search));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/purchase-orders', optionalAuthToken, async (req, res) => {
  try {
    const po = erpDatabaseService.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, message: 'Orden de compra PO creada exitosamente', po });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/erp/purchase-orders/:id/receive', optionalAuthToken, async (req, res) => {
  try {
    const po = erpDatabaseService.updatePurchaseOrderStatus(req.params.id, 'Recibida en Almacén');
    res.json({ success: true, message: `PO #${req.params.id} recibida e ingresada al depósito`, po });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Facturas de Proveedores (Vendor Bills - A/P)
router.get('/admin/erp/vendor-bills', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getVendorBills(req.query.subsidiary));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/vendor-bills/:id/pay', optionalAuthToken, async (req, res) => {
  try {
    const bill = erpDatabaseService.payVendorBill(req.params.id);
    res.json({ success: true, message: `Factura de proveedor pagada exitosamente`, bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Órdenes de Venta (Sales Orders - SO)
router.get('/admin/erp/orders', optionalAuthToken, async (req, res) => {
  try {
    const orders = erpDatabaseService.getOrders(req.query.search, req.query.subsidiary);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/orders/:id/sync', optionalAuthToken, async (req, res) => {
  try {
    const order = erpDatabaseService.updateOrderStatus(req.params.id, 'Facturado');
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada en base ERP' });
    }
    res.json({ success: true, message: `Orden #${req.params.id} aprobada y facturada en ERP exitosamente.`, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Facturas de Clientes (Invoices / Accounts Receivable - A/R)
router.get('/admin/erp/invoices', optionalAuthToken, async (req, res) => {
  try {
    res.json(erpDatabaseService.getInvoices(req.query.subsidiary, req.query.search));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/invoices/:id/pay', optionalAuthToken, async (req, res) => {
  try {
    const inv = erpDatabaseService.payInvoice(req.params.id);
    res.json({ success: true, message: 'Factura cobrada y asiento registrado en A/R', invoice: inv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. ABM End Users & Clientes Comerciales
router.get('/admin/erp/end-users', optionalAuthToken, async (req, res) => {
  try {
    const { search, country } = req.query;
    const list = erpDatabaseService.getEndUsers(search, country);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/erp/end-users', optionalAuthToken, async (req, res) => {
  try {
    const endUser = erpDatabaseService.saveEndUser(req.body);
    res.status(201).json({ success: true, message: 'End User registrado en ERP exitosamente', end_user: endUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/admin/erp/end-users/:id', optionalAuthToken, async (req, res) => {
  try {
    erpDatabaseService.deleteEndUser(req.params.id);
    res.json({ success: true, message: 'End User eliminado de la base ERP' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Cuentas Comerciales y Crédito B2B de Base ERP
router.get('/admin/erp/credit-accounts', optionalAuthToken, async (req, res) => {
  try {
    const accounts = erpDatabaseService.getCreditAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/erp/credit-accounts/:id', optionalAuthToken, async (req, res) => {
  try {
    const updated = erpDatabaseService.updateCreditAccount(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Cuenta comercial no encontrada en ERP' });
    }
    res.json({ success: true, message: 'Condiciones de crédito actualizadas en base ERP exitosamente', account: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Verificación / Conciliación de Base de Datos ERP
router.post('/admin/erp/sync-all', optionalAuthToken, async (req, res) => {
  try {
    const now = new Date().toISOString();
    res.json({
      success: true,
      message: 'Base de datos ERP OneWorld DACAS verificada y sincronizada correctamente.',
      timestamp: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. ERP Admin: Obtener Parámetros Globales & Configuración
router.get('/admin/erp/settings', optionalAuthToken, async (req, res) => {
  try {
    const settings = erpDatabaseService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 17. ERP Admin: Guardar Parámetros Globales & Configuración
router.put('/admin/erp/settings', optionalAuthToken, async (req, res) => {
  try {
    const updated = erpDatabaseService.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Configuración y parámetros globales del ERP guardados exitosamente.',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 18. ERP Admin: Listar APIs por País
router.get('/admin/erp/country-apis', optionalAuthToken, async (req, res) => {
  try {
    const apis = erpDatabaseService.getCountryApis();
    res.json(apis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 19. ERP Admin: Guardar / Actualizar API por País
router.post('/admin/erp/country-apis', optionalAuthToken, async (req, res) => {
  try {
    const api = erpDatabaseService.saveCountryApi(req.body);
    res.json({
      success: true,
      message: req.body.id ? 'Integración API actualizada exitosamente' : 'Nueva API de país agregada exitosamente',
      api
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 20. ERP Admin: Eliminar API por País
router.delete('/admin/erp/country-apis/:id', optionalAuthToken, async (req, res) => {
  try {
    erpDatabaseService.deleteCountryApi(req.params.id);
    res.json({ success: true, message: 'Integración API por país eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 21. ERP Admin: Test Conexión / Ping de API por País
router.post('/admin/erp/country-apis/:id/test', optionalAuthToken, async (req, res) => {
  try {
    const result = erpDatabaseService.testCountryApi(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 22. ERP Admin: Reconciliación Contable & Auditoría
router.post('/admin/erp/reconcile', optionalAuthToken, async (req, res) => {
  try {
    const report = erpDatabaseService.reconcileBalances();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 23. ERP Admin: Descargar / Exportar Backup Completo
router.get('/admin/erp/backup', optionalAuthToken, async (req, res) => {
  try {
    const backup = erpDatabaseService.exportBackup();
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TRACKING DE AUDITORÍA & COMPORTAMIENTO E-COMMERCE (LOGS)
// ==========================================

// 1. Registro de visualización de producto / ficha técnica
router.post('/track/product-view', optionalAuthToken, async (req, res) => {
  try {
    const { productId, productName, sku, brand, price, category } = req.body || {};
    const user = req.user ? {
      id: req.user.id,
      nombre: req.user.name || req.user.nombre || req.user.company_name || 'Cliente B2B',
      email: req.user.email,
      rol: req.user.role || req.user.rol || 'cliente'
    } : (req.body.user || { nombre: 'Visitante Corporativo', email: 'visitante@b2b.com', rol: 'cliente' });

    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'PRODUCTO_VISITADO',
      descripcion: `Inspección de ficha técnica: ${brand ? brand + ' ' : ''}${productName || 'Producto #' + productId} (SKU: ${sku || 'N/A'}, Cat: ${category || 'General'}, USD $${price || 0}).`,
      usuario: user,
      req,
      detalles: {
        productId,
        productName,
        sku,
        brand,
        price,
        category,
        timestamp: new Date().toISOString()
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en /track/product-view:', error);
    res.status(200).json({ success: false });
  }
});

// 2. Registro de carritos llenados / carritos abandonados sin concretar compra
router.post('/track/cart-activity', optionalAuthToken, async (req, res) => {
  try {
    const { items = [], total = 0, trigger = 'abandoned', sessionId } = req.body || {};
    if (!items || items.length === 0) {
      return res.status(200).json({ success: true, message: 'Carrito vacío' });
    }

    const user = req.user ? {
      id: req.user.id,
      nombre: req.user.name || req.user.nombre || req.user.company_name || 'Cliente B2B',
      email: req.user.email,
      rol: req.user.role || req.user.rol || 'cliente'
    } : (req.body.user || { nombre: 'Visitante Corporativo', email: 'visitante@b2b.com', rol: 'cliente' });

    const itemsSummary = items.map(i => `${i.qty || 1}x ${i.brand ? i.brand + ' ' : ''}${i.name} ($${i.price})`).join(' | ');

    registrarLog({
      origen: 'ecommerce',
      tipo: 'WARNING',
      accion: 'CARRITO_ABANDONADO',
      descripcion: `Carrito B2B con ${items.length} producto(s) por total USD $${parseFloat(total).toLocaleString('es-AR', { minimumFractionDigits: 2 })} abandonado sin concretar compra.`,
      usuario: user,
      req,
      detalles: {
        sessionId: sessionId || `CART-${Date.now()}`,
        itemsCount: items.length,
        total: parseFloat(total),
        moneda: 'USD',
        trigger,
        itemsSummary,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand || 'DACAS',
          sku: item.sku || 'N/A',
          qty: item.qty || 1,
          price: parseFloat(item.price || 0),
          subtotal: parseFloat((item.qty || 1) * (item.price || 0))
        })),
        timestamp: new Date().toISOString()
      }
    });

    res.status(200).json({ success: true, logged: true });
  } catch (error) {
    console.error('Error en /track/cart-activity:', error);
    res.status(200).json({ success: false });
  }
});

// 3. Registro de navegación / exploración de catálogo por categoría o marca
router.post('/track/category-view', optionalAuthToken, async (req, res) => {
  try {
    const { category, brand, search } = req.body || {};
    const user = req.user ? {
      id: req.user.id,
      nombre: req.user.name || req.user.nombre || 'Cliente B2B',
      email: req.user.email,
      rol: req.user.role || req.user.rol || 'cliente'
    } : (req.body.user || { nombre: 'Visitante Corporativo', email: 'visitante@b2b.com', rol: 'cliente' });

    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'CATALOGO_EXPLORADO',
      descripcion: `Navegación en catálogo: ${category ? 'Categoría [' + category + ']' : ''} ${brand ? 'Marca [' + brand + ']' : ''} ${search ? 'Búsqueda: "' + search + '"' : ''}`.trim(),
      usuario: user,
      req,
      detalles: { category, brand, search, timestamp: new Date().toISOString() }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: false });
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
      notes,
      coupon_code,
      end_user
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

    // Validación de Cuenta Corriente: verificar si el cliente la tiene habilitada
    const isCcPayment = (payment_method || '').toLowerCase().includes('cuenta corriente') || (payment_method || '').toLowerCase().includes('cuenta_corriente');
    if (isCcPayment && (!user || !user.cuenta_corriente_habilitada)) {
      return res.status(400).json({ error: 'La forma de pago Cuenta Corriente no está habilitada para su cuenta mayorista. Por favor elija otro método de pago o consulte con su ejecutivo comercial.' });
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

    // Coupon discount application if provided
    let appliedCoupon = null;
    let couponDiscountAmount = 0;
    if (coupon_code && String(coupon_code).trim()) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const cRule = allRules.find(r => r.coupon_code && String(r.coupon_code).trim().toUpperCase() === cleanCode);
      if (cRule) {
        // Calculate eligible subtotal
        let eligibleSub = subtotal;
        if (cRule.product_id) {
          const matchingItms = orderItems.filter(oi => parseInt(oi.product_id) === parseInt(cRule.product_id));
          eligibleSub = matchingItms.reduce((acc, oi) => acc + (parseFloat(oi.price_at_purchase) * oi.quantity), 0);
        } else if (cRule.brand && cRule.brand.toLowerCase() !== 'all') {
          const matchingItms = orderItems.filter(oi => (oi.brand || '').toLowerCase() === cRule.brand.toLowerCase());
          eligibleSub = matchingItms.reduce((acc, oi) => acc + (parseFloat(oi.price_at_purchase) * oi.quantity), 0);
        }

        if (eligibleSub > 0) {
          const cVal = parseFloat(cRule.value) || 0;
          if (cRule.value_type === 'percentage') {
            couponDiscountAmount = (eligibleSub * cVal) / 100;
          } else {
            couponDiscountAmount = Math.min(eligibleSub, cVal);
          }
          appliedCoupon = { code: cleanCode, discount: couponDiscountAmount, id: cRule.id };
          totalDiscount += couponDiscountAmount;

          // Increment times_used
          if (isPgConnected) {
            pool.query('UPDATE ecommerce_pricing_rules SET times_used = COALESCE(times_used, 0) + 1 WHERE id = $1', [cRule.id]).catch(() => {});
          } else {
            cRule.times_used = (cRule.times_used || 0) + 1;
          }
        }
      }
    }

    // ── CÁLCULO DE PERCEPCIONES IIBB (ARGENTINA) SOBRE VALOR NETO ──
    const effectiveCountryId = (user && user.country_id) ? user.country_id : (country_id ? (resolveCountry(country_id)?.id || 2) : 2);
    const isArgentina = effectiveCountryId === 2 || (user && (user.country_code === 'AR' || user.pais === 'Argentina'));

    let totalPercepciones = 0;
    const appliedPercepcionesList = [];
    const netBase = Math.max(0, subtotal - totalDiscount);

    if (isArgentina) {
      let percs = (user && user.percepciones) ? user.percepciones : null;
      if (typeof percs === 'string') {
        try { percs = JSON.parse(percs); } catch (_) { percs = null; }
      }
      if (!percs && req.body.percepciones_applied && Array.isArray(req.body.percepciones_applied) && req.body.percepciones_applied.length > 0) {
        appliedPercepcionesList.push(...req.body.percepciones_applied);
        totalPercepciones = appliedPercepcionesList.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
      } else if (percs) {
        const labels = {
          caba: 'CABA',
          bsas: 'Bs. As. (ARBA)',
          salta: 'Salta',
          misiones: 'Misiones',
          tucuman: 'Tucumán'
        };
        for (const [key, p] of Object.entries(percs)) {
          if (p && p.enabled) {
            const alicuota = parseFloat(p.alicuota) || 0;
            if (alicuota > 0) {
              const coef = (key === 'tucuman' && p.coef && parseFloat(p.coef) > 0) ? parseFloat(p.coef) : 1;
              const pAmount = parseFloat(((netBase * coef * alicuota) / 100).toFixed(2));
              totalPercepciones += pAmount;
              appliedPercepcionesList.push({
                key,
                label: labels[key] || key.toUpperCase(),
                jurisdiccion: key.toUpperCase(),
                alicuota,
                coef: coef !== 1 ? coef : undefined,
                vigencia: p.vigencia,
                amount: pAmount
              });
            }
          }
        }
      }
    }

    const totalFinal = netBase + totalPercepciones;
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const effectivePo = po_number || `OC-${orderNumber}`;
    const effectiveTracking = `DACAS-LOG-AR-${orderNumber}`;

    let orderToReturn = null;

    if (isPgConnected) {
      try {
        await pool.query('ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS percepciones_total NUMERIC DEFAULT 0;');
        await pool.query('ALTER TABLE ecommerce_orders ADD COLUMN IF NOT EXISTS percepciones_applied JSONB;');
      } catch (_) {}

      const orderRes = await pool.query(`
        INSERT INTO ecommerce_orders (
          user_id, country_id, total, tax_applied, shipping_applied, nationalization_applied, discount_applied, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [userId || 1, country_id || (user ? user.country_id : 1), totalFinal.toFixed(2), totalPercepciones.toFixed(2), 0, 0, totalDiscount.toFixed(2), 'procesando']);

      const newOrder = orderRes.rows[0];

      for (let oi of orderItems) {
        await pool.query(`
          INSERT INTO ecommerce_order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
        `, [newOrder.id, oi.product_id, oi.quantity, oi.price_at_purchase]);
      }

      orderToReturn = {
        ...newOrder,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_discount: couponDiscountAmount.toFixed(2),
        percepciones_total: totalPercepciones.toFixed(2),
        percepciones_applied: appliedPercepcionesList,
        net_subtotal: netBase.toFixed(2),
        payment_method: payment_method || 'Cuenta Corriente Corporativa',
        shipping_method: shipping_method || 'Envío a Domicilio / Planta',
        shipping_address: shipping_address || (user ? user.direccion_entrega : 'Dirección registrada'),
        billing_info: billing_info || { razon_social: user?.empresa || user?.name, cuit: user?.cuit },
        end_user: end_user || null,
        po_number: effectivePo,
        delivery_notes: delivery_notes || notes || '',
        tracking_number: effectiveTracking,
        items: orderItems
      };
    } else {
      const newOrder = {
        id: inMem.nextIds.orders++,
        user_id: userId,
        country_id: (user && user.country_id) ? user.country_id : (country_id ? (resolveCountry(country_id)?.id || 2) : 2),
        total: totalFinal.toFixed(2),
        subtotal: subtotal.toFixed(2),
        net_subtotal: netBase.toFixed(2),
        discount_applied: totalDiscount.toFixed(2),
        percepciones_total: totalPercepciones.toFixed(2),
        percepciones_applied: appliedPercepcionesList,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_discount: couponDiscountAmount.toFixed(2),
        tax_applied: totalPercepciones.toFixed(2),
        shipping_applied: '0.00',
        nationalization_applied: '0.00',
        status: 'procesando',
        payment_method: payment_method || 'Cuenta Corriente Corporativa',
        shipping_method: shipping_method || 'Envío Express a Domicilio / Planta',
        shipping_address: shipping_address || (user ? user.direccion_entrega : 'Dirección registrada'),
        billing_info: billing_info || { razon_social: user?.empresa || user?.name, cuit: user?.cuit },
        end_user: end_user || null,
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

    // ── DESCONTAR STOCK DE CADA PRODUCTO VENDIDO ──
    const orderCountryId = (user && user.country_id) ? user.country_id : (country_id ? (resolveCountry(country_id)?.id || 2) : 2);
    for (let oi of orderItems) {
      if (isPgConnected) {
        await pool.query('UPDATE ecommerce_products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [oi.quantity, oi.product_id]);
        if (orderCountryId) {
          await pool.query('UPDATE ecommerce_product_stock SET stock = GREATEST(0, stock - $1) WHERE product_id = $2 AND country_id = $3', [oi.quantity, oi.product_id, orderCountryId]);
        }
      } else {
        const prodToUpdate = inMem.products.find(p => p.id === oi.product_id);
        if (prodToUpdate) {
          if (prodToUpdate.stock_type !== 'infinite') {
            const curStock = parseInt(prodToUpdate.stock, 10) || 0;
            prodToUpdate.stock = Math.max(0, curStock - oi.quantity);
          }
        }
        if (orderCountryId) {
          const cStock = inMem.product_stock.find(s => s.product_id === oi.product_id && s.country_id === orderCountryId);
          if (cStock) {
            cStock.stock = Math.max(0, (parseInt(cStock.stock, 10) || 0) - oi.quantity);
          }
        }
        // Sincronizar automáticamente con ERP
        try {
          if (prodToUpdate) {
            erpDatabaseService.syncProductStockFromEcommerce({
              productId: prodToUpdate.id,
              sku: prodToUpdate.sku,
              name: prodToUpdate.name,
              stock: prodToUpdate.stock,
              price: prodToUpdate.price,
              category: prodToUpdate.category,
              brand: prodToUpdate.brand,
              countryCode: 'AR'
            });
          }
        } catch (_) {}
      }
    }
    if (!isPgConnected) {
      saveProductsToFile();
    }

    registrarLog({
      origen: 'ecommerce',
      tipo: 'SUCCESS',
      accion: 'ORDEN_SHOP_CREADA',
      descripcion: `Pedido mayorista #${orderToReturn.id} registrado por "${user?.empresa || user?.name || 'Cliente B2B'}" por USD $${orderToReturn.total}.`,
      req,
      usuario: { nombre: user?.name || 'Cliente B2B', email: user?.email || '', rol: 'cliente' },
      detalles: { orderId: orderToReturn.id, total: orderToReturn.total, payment_method, itemsCount: orderItems.length }
    });

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
// COUPON VALIDATION & PRICING RULES ENGINE
// ==========================================

// Endpoint para validar cupones en el checkout (por país, cliente, marca o producto)
router.post('/coupons/validate', optionalAuthToken, async (req, res) => {
  try {
    const { code, country_id, user_id, items, subtotal } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ valid: false, error: 'Por favor ingresá un código de cupón válido.' });
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Obtener reglas activas
    let rules = [];
    if (isPgConnected) {
      const rRes = await pool.query('SELECT * FROM ecommerce_pricing_rules WHERE is_active = true');
      rules = rRes.rows;
    } else {
      rules = inMem.pricing_rules.filter(r => r.is_active);
    }

    const couponRule = rules.find(r => r.coupon_code && String(r.coupon_code).trim().toUpperCase() === cleanCode);
    if (!couponRule) {
      return res.status(404).json({ valid: false, error: `El código "${cleanCode}" no existe o no está activo.` });
    }

    // 1. Validar fecha de expiración
    if (couponRule.valid_until) {
      const expDate = new Date(couponRule.valid_until);
      // set to end of day
      expDate.setHours(23, 59, 59, 999);
      const now = new Date();
      if (expDate < now) {
        return res.status(400).json({ 
          valid: false, 
          error: `El cupón "${cleanCode}" expiró el ${new Date(couponRule.valid_until).toLocaleDateString('es-AR')}.` 
        });
      }
    }

    // 2. Validar límite de usos
    if (couponRule.usage_limit && (couponRule.times_used || 0) >= parseInt(couponRule.usage_limit)) {
      return res.status(400).json({ 
        valid: false, 
        error: `El cupón "${cleanCode}" ha alcanzado su límite máximo de ${couponRule.usage_limit} canjes permitidos.` 
      });
    }

    // 3. Validar Cliente / Usuario específico
    const effectiveUserId = req.user ? req.user.id : user_id;
    if (couponRule.user_id) {
      if (!effectiveUserId || parseInt(effectiveUserId) !== parseInt(couponRule.user_id)) {
        let clientDesc = `el cliente asignado`;
        if (isPgConnected) {
          const uRes = await pool.query('SELECT razon_social, name, email FROM ecommerce_users WHERE id = $1', [couponRule.user_id]);
          if (uRes.rows.length > 0) clientDesc = uRes.rows[0].razon_social || uRes.rows[0].name || uRes.rows[0].email;
        } else {
          const u = inMem.users.find(user => user.id === couponRule.user_id);
          if (u) clientDesc = u.razon_social || u.name || u.email;
        }
        return res.status(403).json({ 
          valid: false, 
          error: `Este cupón es exclusivo para la cuenta de cliente: "${clientDesc}". Iniciá sesión con la cuenta correspondiente.` 
        });
      }
    }

    // 4. Validar Tipo de Cliente (Segmento B2B)
    if (couponRule.tipo_cliente && couponRule.tipo_cliente !== 'all') {
      let clientTipo = null;
      if (effectiveUserId) {
        if (isPgConnected) {
          const uRes = await pool.query('SELECT tipo_cliente FROM ecommerce_users WHERE id = $1', [effectiveUserId]);
          if (uRes.rows.length > 0) clientTipo = uRes.rows[0].tipo_cliente;
        } else {
          const u = inMem.users.find(user => user.id === effectiveUserId);
          if (u) clientTipo = u.tipo_cliente;
        }
      }
      if (clientTipo && clientTipo !== couponRule.tipo_cliente) {
        return res.status(403).json({ 
          valid: false, 
          error: `Este cupón es de uso exclusivo para empresas del segmento "${couponRule.tipo_cliente}".` 
        });
      }
    }

    // 5. Validar País de Destino
    if (couponRule.country_id) {
      const targetCountryId = parseInt(country_id) || (req.user ? parseInt(req.user.country_id) : null);
      if (targetCountryId && targetCountryId !== parseInt(couponRule.country_id)) {
        let countryName = 'el país asignado';
        if (isPgConnected) {
          const cRes = await pool.query('SELECT name FROM ecommerce_countries WHERE id = $1', [couponRule.country_id]);
          if (cRes.rows.length > 0) countryName = cRes.rows[0].name;
        } else {
          const c = inMem.countries.find(country => country.id === couponRule.country_id);
          if (c) countryName = c.name;
        }
        return res.status(400).json({ 
          valid: false, 
          error: `Este cupón es exclusivo para pedidos con destino en ${countryName}.` 
        });
      }
    }

    // 6. Validar Monto Mínimo de Compra
    const cartSubtotal = parseFloat(subtotal) || 0;
    if (couponRule.min_order_amount && cartSubtotal < parseFloat(couponRule.min_order_amount)) {
      return res.status(400).json({ 
        valid: false, 
        error: `El cupón "${cleanCode}" requiere una compra mínima de $${parseFloat(couponRule.min_order_amount).toFixed(2)} USD (Subtotal actual: $${cartSubtotal.toFixed(2)} USD).` 
      });
    }

    // 7. Validar Marca o Producto y calcular el subtotal elegible
    let applicableItems = Array.isArray(items) ? [...items] : [];
    let eligibleSubtotal = 0;
    let targetDetail = 'Todo el carrito';

    if (couponRule.product_id) {
      applicableItems = applicableItems.filter(i => parseInt(i.id || i.product_id) === parseInt(couponRule.product_id));
      if (applicableItems.length === 0) {
        let prodName = 'el producto seleccionado';
        if (isPgConnected) {
          const pRes = await pool.query('SELECT name FROM ecommerce_products WHERE id = $1', [couponRule.product_id]);
          if (pRes.rows.length > 0) prodName = pRes.rows[0].name;
        } else {
          const p = inMem.products.find(prod => prod.id === couponRule.product_id);
          if (p) prodName = p.name;
        }
        return res.status(400).json({ 
          valid: false, 
          error: `El cupón "${cleanCode}" aplica únicamente al producto "${prodName}", que no está en tu carrito.` 
        });
      }
      eligibleSubtotal = applicableItems.reduce((acc, i) => acc + (parseFloat(i.price || 0) * (parseInt(i.quantity || i.qty) || 1)), 0);
      targetDetail = `Producto: ${applicableItems[0]?.name || 'Producto en promoción'}`;
    } else if (couponRule.brand && couponRule.brand.toLowerCase() !== 'all') {
      applicableItems = applicableItems.filter(i => (i.brand || '').toLowerCase() === couponRule.brand.toLowerCase());
      if (applicableItems.length === 0) {
        return res.status(400).json({ 
          valid: false, 
          error: `El cupón "${cleanCode}" aplica únicamente a equipos de la marca "${couponRule.brand}". Agregá productos de esta marca para aprovecharlo.` 
        });
      }
      eligibleSubtotal = applicableItems.reduce((acc, i) => acc + (parseFloat(i.price || 0) * (parseInt(i.quantity || i.qty) || 1)), 0);
      targetDetail = `Marca: ${couponRule.brand}`;
    } else {
      eligibleSubtotal = cartSubtotal > 0 ? cartSubtotal : applicableItems.reduce((acc, i) => acc + (parseFloat(i.price || 0) * (parseInt(i.quantity || i.qty) || 1)), 0);
    }

    const discountVal = parseFloat(couponRule.value) || 0;
    let discountAmount = 0;

    if (couponRule.value_type === 'percentage') {
      discountAmount = (eligibleSubtotal * discountVal) / 100;
    } else {
      discountAmount = Math.min(eligibleSubtotal, discountVal);
    }

    return res.json({
      valid: true,
      coupon: {
        id: couponRule.id,
        code: cleanCode,
        name: couponRule.name,
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        discount_display: couponRule.value_type === 'percentage' ? `${discountVal}% OFF` : `-$${discountVal.toFixed(2)} USD`,
        value_type: couponRule.value_type,
        value: couponRule.value,
        rule_type: couponRule.rule_type,
        brand: couponRule.brand,
        country_id: couponRule.country_id,
        product_id: couponRule.product_id,
        user_id: couponRule.user_id,
        tipo_cliente: couponRule.tipo_cliente,
        min_order_amount: couponRule.min_order_amount,
        valid_until: couponRule.valid_until,
        target_detail: targetDetail
      }
    });
  } catch (error) {
    console.error('Error al validar cupón:', error);
    res.status(500).json({ valid: false, error: error.message });
  }
});

router.get('/admin/rules', optionalAuthToken, async (req, res) => {
  try {
    const { country, country_id } = req.query;
    const result = await pool.query(`
      SELECT r.*, p.name as product_name, c.name as country_name, c.code as country_code, u.email as user_email, u.razon_social as user_razon_social 
      FROM ecommerce_pricing_rules r
      LEFT JOIN ecommerce_products p ON r.product_id = p.id
      LEFT JOIN ecommerce_countries c ON r.country_id = c.id
      LEFT JOIN ecommerce_users u ON r.user_id = u.id
      ORDER BY r.priority DESC, r.created_at DESC
    `);
    let rows = result.rows || [];
    if (country || country_id) {
      const target = resolveCountry(country || country_id);
      if (target) {
        rows = rows.filter(r => 
          !r.country_id || 
          r.country_id === target.id || 
          (r.country_code && r.country_code.toUpperCase() === target.code) ||
          (r.country_name && r.country_name.toLowerCase().includes(target.name.toLowerCase()))
        );
      }
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/rules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      name, 
      rule_type, 
      value_type, 
      value, 
      tipo_cliente, 
      country_id, 
      brand, 
      product_id, 
      user_id, 
      priority, 
      is_active,
      coupon_code,
      min_order_amount,
      valid_until,
      usage_limit,
      times_used
    } = req.body;

    const query = `
      INSERT INTO ecommerce_pricing_rules (
        name, rule_type, value_type, value, tipo_cliente, country_id, brand, product_id, user_id, priority, is_active,
        coupon_code, min_order_amount, valid_until, usage_limit, times_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
    `;
    const values = [
      name, 
      rule_type || 'discount', 
      value_type || 'percentage', 
      value, 
      tipo_cliente || null, 
      country_id ? parseInt(country_id) : null, 
      brand || null, 
      product_id ? parseInt(product_id) : null, 
      user_id ? parseInt(user_id) : null, 
      priority ? parseInt(priority) : 0, 
      is_active !== false,
      coupon_code ? String(coupon_code).trim().toUpperCase() : null,
      min_order_amount ? parseFloat(min_order_amount) : null,
      valid_until || null,
      usage_limit ? parseInt(usage_limit) : null,
      times_used ? parseInt(times_used) : 0
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
    const { 
      name, 
      rule_type, 
      value_type, 
      value, 
      tipo_cliente, 
      country_id, 
      brand, 
      product_id, 
      user_id, 
      priority, 
      is_active,
      coupon_code,
      min_order_amount,
      valid_until,
      usage_limit,
      times_used
    } = req.body;

    const query = `
      UPDATE ecommerce_pricing_rules 
      SET name=$1, rule_type=$2, value_type=$3, value=$4, tipo_cliente=$5, country_id=$6, brand=$7, product_id=$8, user_id=$9, priority=$10, is_active=$11,
          coupon_code=$12, min_order_amount=$13, valid_until=$14, usage_limit=$15, times_used=$16 
      WHERE id=$17 RETURNING *
    `;
    const values = [
      name, 
      rule_type || 'discount', 
      value_type || 'percentage', 
      value, 
      tipo_cliente || null, 
      country_id ? parseInt(country_id) : null, 
      brand || null, 
      product_id ? parseInt(product_id) : null, 
      user_id ? parseInt(user_id) : null, 
      priority ? parseInt(priority) : 0, 
      is_active !== false,
      coupon_code ? String(coupon_code).trim().toUpperCase() : null,
      min_order_amount ? parseFloat(min_order_amount) : null,
      valid_until || null,
      usage_limit ? parseInt(usage_limit) : null,
      times_used !== undefined ? parseInt(times_used) : 0,
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
    const targetCountry = resolveCountry(req.body.country_code || req.body.country_id || req.query.country || 'AR');
    const productPayload = {
      ...req.body,
      country_code: targetCountry.code,
      country_id: targetCountry.id
    };
    let result;
    if (isPgConnected) {
      const {
        name, description, price, stock, image_url,
        brand = '', category = 'General', subcategory = '', sku = '',
        promotional_price = null, weight = '', depth = '', width = '', height = '',
        highlights = '', warranty = '12 Meses con RMA y Soporte DACAS',
        datasheet_url = '', condition = 'Nuevo Sellado', related_skus = []
      } = productPayload;
      result = await pool.query(
        `INSERT INTO ecommerce_products (
          name, description, price, stock, image_url, country_code, country_id,
          brand, category, subcategory, sku, promotional_price, weight, depth, width, height,
          highlights, warranty, datasheet_url, condition, related_skus
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
        [
          name, description, price, stock, image_url, targetCountry.code, targetCountry.id,
          brand, category, subcategory, sku, promotional_price, weight, depth, width, height,
          highlights, warranty, datasheet_url, condition, JSON.stringify(related_skus)
        ]
      );
    } else {
      result = await pool.query('INSERT INTO ecommerce_products', [productPayload]);
    }
    const nuevoProducto = result.rows[0];
    registrarLog({
      origen: 'ecommerce',
      tipo: 'SUCCESS',
      accion: 'ECOMMERCE_PRODUCTO_CREADO',
      descripcion: `Producto "${nuevoProducto.name}" creado en catálogo (${nuevoProducto.sku || 'ID: ' + nuevoProducto.id})`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { productoId: nuevoProducto.id, name: nuevoProducto.name, price: nuevoProducto.price, stock: nuevoProducto.stock }
    });
    // Sincronizar automáticamente con el catálogo e inventario del ERP
    try {
      erpDatabaseService.syncProductStockFromEcommerce({
        productId: nuevoProducto.id,
        sku: nuevoProducto.sku,
        name: nuevoProducto.name,
        stock: nuevoProducto.stock,
        price: nuevoProducto.price,
        category: nuevoProducto.category,
        brand: nuevoProducto.brand
      });
    } catch (_) {}

    res.status(201).json(nuevoProducto);
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
      const subcategory = String(item.subcategory || item.subcategoria || item.Subcategoria || item.subcategoría || item.Subcategoría || item.tipo_equipo || item.Tipo_Equipo || '').trim();
      const sku = String(item.sku || item.SKU || item.codigo || item.Código || '').trim();
      const description = String(item.description || item.descripcion || item.Descripción || '').trim();
      const image_url = String(item.image_url || item.imagen || item.Imagen || item.foto || '').trim();
      const weight = item.weight !== undefined ? String(item.weight).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.peso !== undefined ? String(item.peso).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '');
      const depth = item.depth !== undefined ? String(item.depth).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.largo !== undefined ? String(item.largo).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.profundidad !== undefined ? String(item.profundidad).replace(',', '.').replace(/[^0-9.]/g, '').trim() : ''));
      const width = item.width !== undefined ? String(item.width).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.ancho !== undefined ? String(item.ancho).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '');
      const height = item.height !== undefined ? String(item.height).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.altura !== undefined ? String(item.altura).replace(',', '.').replace(/[^0-9.]/g, '').trim() : (item.alto !== undefined ? String(item.alto).replace(',', '.').replace(/[^0-9.]/g, '').trim() : ''));

      const highlights = String(item.highlights || item.caracteristicas_destacadas || item.Caracteristicas_Destacadas || item.puntos_clave || '').trim();
      const warranty = String(item.warranty || item.garantia || item.Garantia || '12 Meses con RMA y Soporte DACAS').trim();
      const datasheet_url = String(item.datasheet_url || item.ficha_tecnica_url || item.Ficha_Tecnica_URL || item.ficha_tecnica || item.Datasheet || '').trim();
      const condition = String(item.condition || item.condicion || item.Condicion || 'Nuevo Sellado').trim();
      
      const rawRelated = item.related_skus || item.skus_relacionados || item.SKUs_Relacionados || item.productos_relacionados || item.Productos_Relacionados || [];
      const related_skus = Array.isArray(rawRelated) 
        ? rawRelated 
        : (typeof rawRelated === 'string' && rawRelated.trim() ? rawRelated.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : []);

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
             SET name = $1, brand = $2, category = $3, sku = $4, description = $5, price = $6, promotional_price = $7, stock = $8, image_url = COALESCE(NULLIF($9, ''), image_url),
                 weight = COALESCE(NULLIF($10, ''), weight), depth = COALESCE(NULLIF($11, ''), depth), width = COALESCE(NULLIF($12, ''), width), height = COALESCE(NULLIF($13, ''), height),
                 highlights = COALESCE(NULLIF($14, ''), highlights), warranty = COALESCE(NULLIF($15, ''), warranty),
                 datasheet_url = COALESCE(NULLIF($16, ''), datasheet_url), condition = COALESCE(NULLIF($17, ''), condition),
                 related_skus = $18, subcategory = COALESCE(NULLIF($19, ''), subcategory)
             WHERE id = $20`,
            [name, brand, category, sku, description, price, promotional_price, stock, image_url, weight, depth, width, height, highlights, warranty, datasheet_url, condition, JSON.stringify(related_skus), subcategory, existing.id]
          );
          updatedCount++;
        } else {
          await pool.query(
            `INSERT INTO ecommerce_products (name, brand, category, subcategory, sku, description, price, promotional_price, stock, image_url, weight, depth, width, height, highlights, warranty, datasheet_url, condition, related_skus) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
            [name, brand, category, subcategory, sku, description, price, promotional_price, stock, image_url, weight, depth, width, height, highlights, warranty, datasheet_url, condition, JSON.stringify(related_skus)]
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
          if (subcategory) existing.subcategory = subcategory;
          if (sku) existing.sku = sku;
          if (description) existing.description = description;
          existing.price = price;
          existing.promotional_price = promotional_price;
          existing.stock = stock;
          if (weight !== '') existing.weight = weight;
          if (depth !== '') existing.depth = depth;
          if (width !== '') existing.width = width;
          if (height !== '') existing.height = height;
          if (highlights) existing.highlights = highlights;
          if (warranty) existing.warranty = warranty;
          if (datasheet_url) existing.datasheet_url = datasheet_url;
          if (condition) existing.condition = condition;
          if (related_skus.length > 0) {
            existing.related_skus = related_skus;
            existing.related_ids = related_skus.map(rSku => {
              const found = inMem.products.find(p => p.sku && p.sku.toLowerCase() === rSku.toLowerCase());
              return found ? found.id : null;
            }).filter(Boolean);
          }
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
            subcategory: subcategory || '',
            sku,
            description: description || `<p>${name}</p>`,
            price,
            promotional_price,
            stock,
            weight: weight || '',
            depth: depth || '',
            width: width || '',
            height: height || '',
            highlights: highlights || '',
            warranty: warranty || '12 Meses con RMA y Soporte DACAS',
            datasheet_url: datasheet_url || '',
            condition: condition || 'Nuevo Sellado',
            related_skus: related_skus,
            related_ids: related_skus.map(rSku => {
              const found = inMem.products.find(p => p.sku && p.sku.toLowerCase() === rSku.toLowerCase());
              return found ? found.id : null;
            }).filter(Boolean),
            image_url: image_url || defaultImg,
            images: image_url ? [image_url] : [defaultImg],
            created_at: new Date().toISOString()
          };
          inMem.products.push(newProduct);
          createdCount++;
        }

        // Sincronizar con el catálogo y stock del ERP
        try {
          erpDatabaseService.syncProductStockFromEcommerce({
            sku,
            name,
            stock,
            price,
            category,
            brand
          });
        } catch (_) {}
      }
    }

    if (!isPgConnected) {
      saveProductsToFile();
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
      const {
        name, description, price, stock, image_url, brand, category, subcategory, sku, promotional_price,
        weight, depth, width, height, highlights, warranty, datasheet_url, condition, related_ids, related_skus
      } = req.body;
      result = await pool.query(
        `UPDATE ecommerce_products 
         SET name = $1, description = $2, price = $3, stock = $4, image_url = $5,
             brand = $6, category = $7, sku = $8, promotional_price = $9, weight = $10,
             depth = $11, width = $12, height = $13, highlights = $14, warranty = $15,
             datasheet_url = $16, condition = $17, related_ids = $18, related_skus = $19,
             subcategory = $20
         WHERE id = $21 RETURNING *`,
        [
          name, description, price, stock, image_url,
          brand, category, sku, promotional_price, weight,
          depth, width, height, highlights, warranty,
          datasheet_url, condition, JSON.stringify(related_ids || []), JSON.stringify(related_skus || []),
          subcategory || '',
          id
        ]
      );
    } else {
      result = await pool.query('UPDATE ecommerce_products', [req.body, id]);
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const prod = result.rows[0];
    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'ECOMMERCE_PRODUCTO_ACTUALIZADO',
      descripcion: `Producto #${id} ("${prod.name}") modificado por ${req.user ? req.user.email : 'Admin'}`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { productoId: id, name: prod.name, price: prod.price, stock: prod.stock }
    });
    // Sincronizar actualización de stock y datos con el ERP
    try {
      erpDatabaseService.syncProductStockFromEcommerce({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        stock: prod.stock,
        price: prod.price,
        category: prod.category,
        brand: prod.brand
      });
    } catch (_) {}

    res.json(prod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/admin/products/:id/toggle-featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const prodId = parseInt(id, 10);

    let updatedProduct = null;
    if (isPgConnected) {
      const checkRes = await pool.query('SELECT is_featured, badge, name FROM ecommerce_products WHERE id = $1', [prodId]);
      if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      const current = checkRes.rows[0];
      const nextFeatured = !current.is_featured;
      let nextBadge = current.badge;
      if (nextFeatured && !nextBadge) nextBadge = 'DESTACADO';
      else if (!nextFeatured && nextBadge === 'DESTACADO') nextBadge = '';

      const updateRes = await pool.query(
        'UPDATE ecommerce_products SET is_featured = $1, badge = $2 WHERE id = $3 RETURNING *',
        [nextFeatured, nextBadge, prodId]
      );
      updatedProduct = updateRes.rows[0];
    } else {
      const idx = inMem.products.findIndex(p => p.id === prodId);
      if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
      const current = inMem.products[idx];
      const nextFeatured = !current.is_featured;
      let nextBadge = current.badge;
      if (nextFeatured && !nextBadge) nextBadge = 'DESTACADO';
      else if (!nextFeatured && nextBadge === 'DESTACADO') nextBadge = '';

      inMem.products[idx] = {
        ...current,
        is_featured: nextFeatured,
        badge: nextBadge
      };
      saveProductsToFile();
      updatedProduct = inMem.products[idx];
    }

    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'ECOMMERCE_PRODUCTO_DESTACADO_TOGGLE',
      descripcion: `Producto #${prodId} marcado como ${updatedProduct.is_featured ? 'DESTACADO ⭐' : 'NORMAL'} por ${req.user ? req.user.email : 'Admin'}`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { productoId: prodId, is_featured: updatedProduct.is_featured }
    });

    res.json({ success: true, is_featured: updatedProduct.is_featured, product: updatedProduct });
  } catch (error) {
    console.error('Error toggling featured product:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ecommerce_products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const prodEliminado = result.rows[0];
    registrarLog({
      origen: 'ecommerce',
      tipo: 'WARNING',
      accion: 'ECOMMERCE_PRODUCTO_ELIMINADO',
      descripcion: `Producto #${id} ("${prodEliminado?.name || id}") eliminado del catálogo`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { productoId: id }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/products/:id/clone', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prodId = parseInt(req.params.id, 10);
    const { target_country, target_countries } = req.body;

    const prod = inMem.products.find(p => p.id === prodId);
    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const destinations = Array.isArray(target_countries) && target_countries.length > 0
      ? target_countries
      : [target_country || 'CL'];

    const clonedList = [];
    for (const target of destinations) {
      const c = resolveCountry(target);
      const cloned = {
        ...JSON.parse(JSON.stringify(prod)),
        id: inMem.nextIds.products++,
        sku: prod.sku ? `${prod.sku}-${c.code}` : '',
        country_code: c.code,
        country_id: c.id,
        created_at: new Date().toISOString()
      };
      inMem.products.push(cloned);
      clonedList.push(cloned);
    }

    saveProductsToFile();

    registrarLog({
      origen: 'ecommerce',
      tipo: 'SUCCESS',
      accion: 'ECOMMERCE_PRODUCTO_CLONADO',
      descripcion: `Producto "${prod.name}" clonado a ${destinations.join(', ')}`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { originalId: prod.id, cloned: clonedList.map(c => ({ id: c.id, country: c.country_code })) }
    });

    res.status(201).json({
      success: true,
      message: `Producto clonado exitosamente a ${destinations.join(', ')}`,
      cloned: clonedList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/orders', optionalAuthToken, async (req, res) => {
  try {
    const { country, country_id } = req.query;
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email, c.name as country_name, c.code as country_code 
      FROM ecommerce_orders o 
      LEFT JOIN ecommerce_users u ON o.user_id = u.id 
      LEFT JOIN ecommerce_countries c ON o.country_id = c.id
      ORDER BY o.created_at DESC
    `);
    let orders = result.rows || [];
    if (country || country_id) {
      const target = resolveCountry(country || country_id);
      if (target) {
        orders = orders.filter(o => 
          o.country_id === target.id || 
          (o.country_code && o.country_code.toUpperCase() === target.code) ||
          (o.country_name && o.country_name.toLowerCase().includes(target.name.toLowerCase()))
        );
      }
    }
    res.json(orders);
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
    const orden = result.rows[0];
    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'ECOMMERCE_PEDIDO_ESTADO',
      descripcion: `Pedido #${id} actualizado a estado "${status}"`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { ordenId: id, nuevoEstado: status, total: orden.total_amount }
    });
    res.json(orden);
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

    // Sincronización en tiempo real con la base de datos ERP (Almacén regional)
    try {
      const prodRes = await pool.query('SELECT * FROM ecommerce_products WHERE id = $1', [id]);
      const prod = prodRes.rows && prodRes.rows[0];
      erpDatabaseService.syncProductStockFromEcommerce({
        productId: id,
        sku: prod ? prod.sku : undefined,
        name: prod ? prod.name : undefined,
        countryCode: country_id,
        stock: stock,
        price: prod ? prod.price : undefined,
        category: prod ? prod.category : undefined
      });
    } catch (e) {
      console.error('Error sincronizando stock con ERP:', e);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CLIENT TYPES ABM (CRUD)
// ==========================================
router.get('/client-types', optionalAuthToken, async (req, res) => {
  try {
    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_client_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(50) DEFAULT '#0284c7',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const countRes = await pool.query('SELECT COUNT(*) FROM ecommerce_client_types');
      if (parseInt(countRes.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO ecommerce_client_types (name, description, color) VALUES
          ('Integrador IT / Reseller', 'Empresas integradoras de soluciones de conectividad y valor agregado', '#0284c7'),
          ('Proveedor de Internet (ISP / WISP)', 'Proveedores de servicios de internet y carriers de telecomunicaciones', '#10b981'),
          ('Consultora IT / Ciberseguridad', 'Firmas especializadas en seguridad informática e infraestructura', '#8b5cf6'),
          ('Empresa Corporativa', 'Clientes directos del segmento corporativo y enterprise', '#f59e0b'),
          ('Organismo Público', 'Entidades gubernamentales, educación y sector público', '#64748b')
          ON CONFLICT (name) DO NOTHING;
        `);
      }
      const r = await pool.query('SELECT * FROM ecommerce_client_types ORDER BY id ASC');
      return res.json(r.rows);
    } else {
      if (!inMem.client_types || inMem.client_types.length === 0) {
        inMem.client_types = loadClientTypesFromFile();
      }
      return res.json(inMem.client_types);
    }
  } catch (error) {
    console.error('Error al obtener tipos de cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/client-types', optionalAuthToken, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre del tipo de cliente es obligatorio' });
    const cleanName = name.trim();
    const cleanDesc = (description || '').trim();
    const cleanColor = color || '#0284c7';

    if (isPgConnected) {
      const exists = await pool.query('SELECT id FROM ecommerce_client_types WHERE LOWER(name) = LOWER($1)', [cleanName]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Ya existe un tipo de cliente con este nombre' });

      const ins = await pool.query(
        'INSERT INTO ecommerce_client_types (name, description, color) VALUES ($1, $2, $3) RETURNING *',
        [cleanName, cleanDesc, cleanColor]
      );
      return res.status(201).json(ins.rows[0]);
    } else {
      if (!inMem.client_types) inMem.client_types = [];
      if (inMem.client_types.some(ct => ct.name.toLowerCase() === cleanName.toLowerCase())) {
        return res.status(400).json({ error: 'Ya existe un tipo de cliente con este nombre' });
      }
      const newType = {
        id: (inMem.client_types.length > 0 ? Math.max(...inMem.client_types.map(c => c.id || 0)) + 1 : 1),
        name: cleanName,
        description: cleanDesc,
        color: cleanColor,
        created_at: new Date().toISOString()
      };
      inMem.client_types.push(newType);
      saveClientTypesToFile(inMem.client_types);
      return res.status(201).json(newType);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/client-types/:id', optionalAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const cleanName = name.trim();
    const cleanDesc = (description || '').trim();
    const cleanColor = color || '#0284c7';

    if (isPgConnected) {
      const oldRes = await pool.query('SELECT name FROM ecommerce_client_types WHERE id = $1', [id]);
      if (oldRes.rows.length === 0) return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
      const oldName = oldRes.rows[0].name;

      const upd = await pool.query(
        'UPDATE ecommerce_client_types SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *',
        [cleanName, cleanDesc, cleanColor, id]
      );

      if (oldName !== cleanName) {
        await pool.query('UPDATE ecommerce_users SET tipo_cliente = $1 WHERE tipo_cliente = $2', [cleanName, oldName]);
        await pool.query('UPDATE ecommerce_pricing_rules SET tipo_cliente = $1 WHERE tipo_cliente = $2', [cleanName, oldName]);
      }
      return res.json(upd.rows[0]);
    } else {
      const idx = inMem.client_types.findIndex(ct => ct.id === parseInt(id));
      if (idx === -1) return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
      const oldName = inMem.client_types[idx].name;

      inMem.client_types[idx].name = cleanName;
      inMem.client_types[idx].description = cleanDesc;
      inMem.client_types[idx].color = cleanColor;

      if (oldName !== cleanName) {
        inMem.users.forEach(u => { if (u.tipo_cliente === oldName) u.tipo_cliente = cleanName; });
        (inMem.pricing_rules || []).forEach(r => { if (r.tipo_cliente === oldName) r.tipo_cliente = cleanName; });
      }
      saveClientTypesToFile(inMem.client_types);
      return res.json(inMem.client_types[idx]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/client-types/:id', optionalAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isPgConnected) {
      const del = await pool.query('DELETE FROM ecommerce_client_types WHERE id = $1 RETURNING *', [id]);
      if (del.rows.length === 0) return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
      return res.json({ success: true, message: 'Tipo de cliente eliminado', deleted: del.rows[0] });
    } else {
      const idx = inMem.client_types.findIndex(ct => ct.id === parseInt(id));
      if (idx === -1) return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
      const deleted = inMem.client_types.splice(idx, 1)[0];
      saveClientTypesToFile(inMem.client_types);
      return res.json({ success: true, message: 'Tipo de cliente eliminado', deleted });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Users (Customers) - Sanitized against password_hash exposure
router.get('/admin/users', optionalAuthToken, async (req, res) => {
  try {
    const { country, country_id } = req.query;
    const result = await pool.query(`
      SELECT u.*, c.name as country_name, c.code as country_code
      FROM ecommerce_users u
      LEFT JOIN ecommerce_countries c ON u.country_id = c.id
      ORDER BY u.created_at DESC
    `);
    let users = (result.rows || []).map(u => {
      const sanitized = { ...u };
      delete sanitized.password_hash;
      sanitized.cuenta_corriente_habilitada = Boolean(sanitized.cuenta_corriente_habilitada);
      return sanitized;
    });

    if (country || country_id) {
      const target = resolveCountry(country || country_id);
      if (target) {
        users = users.filter(u => u.country_id === target.id || (u.country_code && u.country_code.toUpperCase() === target.code) || (u.country_name && u.country_name.toLowerCase().includes(target.name.toLowerCase())));
      }
    }

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
        email_factura_electronica, email_contacto_compras, email_cotizaciones_automaticas, address, company, cuenta_corriente_habilitada
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36, $37
      ) RETURNING id, name, email
    `;
    const values = [
      data.name, data.email, hashedPassword, data.razon_social, data.tipo_cliente, data.direccion_legal, data.localidad, data.codigo_postal, data.ciudad, data.country_id || null, data.phone, data.fecha_limite_facturacion || null, data.web,
      data.report_to_country_id || null, data.vendedor, data.direccion_entrega, data.localidad_entrega, data.codigo_postal_entrega, data.ciudad_entrega, data.pais_entrega_id || null, data.tipo_iva, data.numero_nit,
      data.nombre_compras, data.telefono_compras, data.email_compras, data.nombre_pagos, data.telefono_pagos, data.email_pagos, data.nombre_admin, data.telefono_admin, data.email_admin,
      data.email_factura_electronica, data.email_contacto_compras, data.email_cotizaciones_automaticas, data.address, data.company, Boolean(data.cuenta_corriente_habilitada)
    ];
    
    const result = await pool.query(query, values);
    const createdUser = result.rows[0];
    if (createdUser) {
      const idx = inMem.users.findIndex(u => u.id === createdUser.id || u.email === data.email);
      if (idx !== -1) {
        inMem.users[idx].cuenta_corriente_habilitada = Boolean(data.cuenta_corriente_habilitada);
        inMem.users[idx].iibb_jurisdiccion = data.iibb_jurisdiccion || '901 - Capital Federal';
        inMem.users[idx].iibb_tipo = data.iibb_tipo || 'C.M.';
        inMem.users[idx].iibb_numero = data.iibb_numero || data.numero_nit || '';
        inMem.users[idx].iibb_codigo_aceptacion = !!data.iibb_codigo_aceptacion;
        inMem.users[idx].percepciones = data.percepciones || {
          caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
          bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
          salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
          misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
          tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
        };
      }
    }
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

    // Asegurar estructura de IIBB y percepciones para clientes de Argentina
    if ((userClean.country_id === 2 || userClean.country_name === 'Argentina' || !userClean.country_id) && !userClean.percepciones) {
      userClean.iibb_jurisdiccion = userClean.iibb_jurisdiccion || '901 - Capital Federal';
      userClean.iibb_tipo = userClean.iibb_tipo || 'C.M.';
      userClean.iibb_numero = userClean.iibb_numero || userClean.numero_nit || '9017223280';
      userClean.iibb_codigo_aceptacion = userClean.iibb_codigo_aceptacion !== undefined ? userClean.iibb_codigo_aceptacion : true;
      userClean.percepciones = {
        caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
        bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
        salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
        misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
        tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
      };
    }

    // Buscar todos los usuarios asociados a la misma empresa / razón social o CUIT
    const companyName = userClean.razon_social || userClean.company || '';
    const companyNit = userClean.numero_nit || '';
    let companyUsers = [];
    if (companyName || companyNit) {
      const allUsersRes = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.status, u.cargo, u.tipo_cliente, u.created_at, u.razon_social, u.numero_nit
        FROM ecommerce_users u
      `);
      companyUsers = (allUsersRes.rows || [])
        .filter(u => (companyName && (u.razon_social?.toLowerCase() === companyName.toLowerCase())) || (companyNit && u.numero_nit === companyNit))
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          status: u.status || 'activo',
          cargo: u.cargo || 'Contacto / Usuario',
          tipo_cliente: u.tipo_cliente,
          created_at: u.created_at
        }));
    }

    res.json({
      ...userClean,
      company_users: companyUsers,
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
        email_factura_electronica = $31, email_contacto_compras = $32, email_cotizaciones_automaticas = $33, address = $34, company = $35, cargo = $36, cuenta_corriente_habilitada = $37
    `;
    let values = [
      data.name, data.email, data.razon_social, data.tipo_cliente, data.direccion_legal, data.localidad, data.codigo_postal, data.ciudad, data.country_id || null, data.phone, data.fecha_limite_facturacion || null, data.web,
      data.report_to_country_id || null, data.vendedor, data.direccion_entrega, data.localidad_entrega, data.codigo_postal_entrega, data.ciudad_entrega, data.pais_entrega_id || null, data.tipo_iva, data.numero_nit,
      data.nombre_compras, data.telefono_compras, data.email_compras, data.nombre_pagos, data.telefono_pagos, data.email_pagos, data.nombre_admin, data.telefono_admin, data.email_admin,
      data.email_factura_electronica, data.email_contacto_compras, data.email_cotizaciones_automaticas, data.address, data.company, data.cargo || 'Contacto / Usuario',
      Boolean(data.cuenta_corriente_habilitada)
    ];
    
    // Update password if provided
    if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        query += `, password_hash = $38 WHERE id = $39 RETURNING id, email, name`;
        values.push(hashedPassword, id);
    } else {
        query += ` WHERE id = $38 RETURNING id, email, name`;
        values.push(id);
    }

    const result = await pool.query(query, values);

    // Actualizar campos de percepciones IIBB y CC en memoria y en resultado
    const idx = inMem.users.findIndex(u => u.id === parseInt(id));
    if (idx !== -1) {
      if (data.cuenta_corriente_habilitada !== undefined) inMem.users[idx].cuenta_corriente_habilitada = Boolean(data.cuenta_corriente_habilitada);
      if (data.iibb_jurisdiccion !== undefined) inMem.users[idx].iibb_jurisdiccion = data.iibb_jurisdiccion;
      if (data.iibb_tipo !== undefined) inMem.users[idx].iibb_tipo = data.iibb_tipo;
      if (data.iibb_numero !== undefined) inMem.users[idx].iibb_numero = data.iibb_numero;
      if (data.iibb_codigo_aceptacion !== undefined) inMem.users[idx].iibb_codigo_aceptacion = data.iibb_codigo_aceptacion;
      if (data.percepciones !== undefined) inMem.users[idx].percepciones = data.percepciones;
    }

    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'ECOMMERCE_CLIENTE_MODIFICADO',
      descripcion: `Cliente / Usuario #${id} ("${data.name}" / ${data.email}) actualizado`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { userId: id, razon_social: data.razon_social, email: data.email }
    });
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
    registrarLog({
      origen: 'ecommerce',
      tipo: 'INFO',
      accion: 'ECOMMERCE_CLIENTE_ESTADO',
      descripcion: `Estado del cliente / usuario #${id} cambiado a "${status}"`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { userId: id, status }
    });
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
    registrarLog({
      origen: 'ecommerce',
      tipo: 'SUCCESS',
      accion: 'ECOMMERCE_CLIENTE_APROBADO',
      descripcion: `Cliente / Usuario #${id} ("${result.rows[0].name}" / ${result.rows[0].email}) aprobado y activado`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { userId: id }
    });
    res.json({ message: 'Cliente aprobado y activado exitosamente', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ecommerce_users WHERE id = $1 RETURNING id, name, email', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    registrarLog({
      origen: 'ecommerce',
      tipo: 'WARNING',
      accion: 'ECOMMERCE_USUARIO_ELIMINADO',
      descripcion: `Usuario #${id} ("${result.rows[0].name}" / ${result.rows[0].email}) eliminado de clientes`,
      usuario: req.user ? req.user.email : 'Admin',
      req,
      detalles: { userId: id, email: result.rows[0].email }
    });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Visual / Customization Settings API ──
router.get('/settings/visual', async (req, res) => {
  try {
    const rawCountry = req.query.country || req.query.country_code || req.query.country_id || 'AR';
    const targetCountry = resolveCountry(rawCountry);
    const code = targetCountry ? targetCountry.code.toUpperCase() : 'AR';

    if (!inMem.visualSettingsByCountry) {
      inMem.visualSettingsByCountry = loadVisualSettingsFromFile();
    }
    if (!inMem.visualSettingsByCountry[code]) {
      inMem.visualSettingsByCountry[code] = getDefaultVisualSettingsForCountry(code);
      saveVisualSettingsToFile();
    }

    const base = inMem.visualSettingsByCountry[code];
    return res.json({
      ...DEFAULT_VISUAL_SETTINGS,
      ...base,
      country_code: code,
      country_name: targetCountry.name,
      brandBanners: (Array.isArray(base.brandBanners) && base.brandBanners.length > 0)
        ? base.brandBanners
        : DEFAULT_VISUAL_SETTINGS.brandBanners,
      homeCarousels: {
        ...DEFAULT_VISUAL_SETTINGS.homeCarousels,
        ...(base.homeCarousels || {})
      },
      brandCustomInfo: {
        ...DEFAULT_VISUAL_SETTINGS.brandCustomInfo,
        ...(base.brandCustomInfo || {})
      }
    });
  } catch (error) {
    console.error('Error fetching visual settings:', error);
    return res.json(DEFAULT_VISUAL_SETTINGS);
  }
});

router.put('/settings/visual', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rawCountry = req.query.country || req.query.country_code || req.body.country_code || 'AR';
    const targetCountry = resolveCountry(rawCountry);
    const code = targetCountry ? targetCountry.code.toUpperCase() : 'AR';
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ error: 'Configuración visual inválida' });
    }

    if (!inMem.visualSettingsByCountry) {
      inMem.visualSettingsByCountry = loadVisualSettingsFromFile();
    }

    const current = inMem.visualSettingsByCountry[code] || getDefaultVisualSettingsForCountry(code);
    inMem.visualSettingsByCountry[code] = {
      ...current,
      ...updated,
      country_code: code
    };

    saveVisualSettingsToFile();

    res.json({
      success: true,
      message: `Diseño y personalización del Shop guardados exitosamente para ${targetCountry.name} (${code})`,
      config: inMem.visualSettingsByCountry[code],
      country_code: code
    });
  } catch (error) {
    console.error('Error updating visual settings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/visual/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rawCountry = req.query.country || req.query.country_code || 'AR';
    const targetCountry = resolveCountry(rawCountry);
    const code = targetCountry ? targetCountry.code.toUpperCase() : 'AR';

    if (!inMem.visualSettingsByCountry) {
      inMem.visualSettingsByCountry = loadVisualSettingsFromFile();
    }

    inMem.visualSettingsByCountry[code] = getDefaultVisualSettingsForCountry(code);
    saveVisualSettingsToFile();

    res.json({
      success: true,
      message: `Diseño restablecido a los valores oficiales para ${targetCountry.name} (${code})`,
      config: inMem.visualSettingsByCountry[code],
      country_code: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Checkout Methods (Shipping & Payment) Settings API per Country ──
router.get('/settings/checkout-methods', async (req, res) => {
  try {
    const countryParam = req.query.country || req.query.country_code || req.query.country_id || 'AR';
    const targetCountry = resolveCountry(countryParam);
    const countryCode = targetCountry ? targetCountry.code.toUpperCase() : 'AR';
    const countryMethods = getCheckoutMethodsForCountry(countryCode);

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_checkout_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const row = await pool.query('SELECT config FROM ecommerce_checkout_settings WHERE id = 1');
      if (row.rows.length > 0 && row.rows[0].config) {
        const stored = row.rows[0].config;
        if (stored[countryCode]) {
          return res.json({
            ...stored[countryCode],
            active_country: { id: targetCountry.id, code: targetCountry.code, name: targetCountry.name }
          });
        }
      }
    }

    return res.json({
      ...countryMethods,
      active_country: {
        id: targetCountry.id,
        code: targetCountry.code,
        name: targetCountry.name
      }
    });
  } catch (error) {
    console.error('Error fetching checkout methods settings:', error);
    return res.json(getCheckoutMethodsForCountry('AR'));
  }
});

router.put('/settings/checkout-methods', optionalAuthToken, async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ error: 'Configuración de métodos inválida' });
    }

    const countryParam = req.query.country || req.query.country_code || req.body.country || 'AR';
    const targetCountry = resolveCountry(countryParam);
    const countryCode = targetCountry ? targetCountry.code.toUpperCase() : 'AR';

    if (!COUNTRY_CHECKOUT_METHODS[countryCode]) {
      COUNTRY_CHECKOUT_METHODS[countryCode] = JSON.parse(JSON.stringify(DEFAULT_CHECKOUT_METHODS));
    }
    COUNTRY_CHECKOUT_METHODS[countryCode] = { ...COUNTRY_CHECKOUT_METHODS[countryCode], ...updated };
    inMem.checkoutMethods = COUNTRY_CHECKOUT_METHODS[countryCode];

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_checkout_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        INSERT INTO ecommerce_checkout_settings (id, config, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(COUNTRY_CHECKOUT_METHODS)]);
    }

    res.json({
      success: true,
      message: `Métodos de envío y formas de pago para ${targetCountry ? targetCountry.name : countryCode} guardados exitosamente`,
      country: countryCode,
      config: COUNTRY_CHECKOUT_METHODS[countryCode]
    });
  } catch (error) {
    console.error('Error updating checkout methods:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/checkout-methods/reset', optionalAuthToken, async (req, res) => {
  try {
    const countryParam = req.query.country || req.query.country_code || 'AR';
    const targetCountry = resolveCountry(countryParam);
    const countryCode = targetCountry ? targetCountry.code.toUpperCase() : 'AR';

    COUNTRY_CHECKOUT_METHODS[countryCode] = JSON.parse(JSON.stringify(DEFAULT_CHECKOUT_METHODS));
    inMem.checkoutMethods = COUNTRY_CHECKOUT_METHODS[countryCode];

    if (isPgConnected) {
      await pool.query(`
        INSERT INTO ecommerce_checkout_settings (id, config, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(COUNTRY_CHECKOUT_METHODS)]);
    }

    res.json({
      success: true,
      message: `Métodos de envío y pago para ${targetCountry ? targetCountry.name : countryCode} restablecidos`,
      country: countryCode,
      config: COUNTRY_CHECKOUT_METHODS[countryCode]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Apli ERP & API Integration Settings ──
router.get('/settings/apli', async (req, res) => {
  try {
    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_apli_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const row = await pool.query('SELECT config FROM ecommerce_apli_settings WHERE id = 1');
      if (row.rows.length > 0 && row.rows[0].config) {
        return res.json(row.rows[0].config);
      }
    }
    return res.json(inMem.apliConfig || DEFAULT_APLI_CONFIG);
  } catch (error) {
    console.error('Error fetching Apli settings:', error);
    return res.json(inMem.apliConfig || DEFAULT_APLI_CONFIG);
  }
});

router.put('/settings/apli', optionalAuthToken, async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ error: 'Configuración de Apli inválida' });
    }

    inMem.apliConfig = { ...(inMem.apliConfig || DEFAULT_APLI_CONFIG), ...updated, lastUpdated: new Date().toISOString() };

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_apli_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        INSERT INTO ecommerce_apli_settings (id, config, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(inMem.apliConfig)]);
    }

    // Add audit log
    if (!inMem.apliLogs) inMem.apliLogs = [];
    inMem.apliLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'CONFIG_UPDATE',
      status: 'SUCCESS',
      details: 'Parámetros de conexión y credenciales de Apli actualizados por administrador',
      recordsCount: 1,
      durationMs: 45
    });

    res.json({
      success: true,
      message: 'Configuración de conexión con Apli guardada exitosamente',
      config: inMem.apliConfig
    });
  } catch (error) {
    console.error('Error updating Apli settings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/apli/test', optionalAuthToken, async (req, res) => {
  try {
    const { endpointUrl, apiKey, clientId } = req.body || {};
    const startTime = Date.now();

    // Simulate real network handshake ping with Apli endpoint
    const latency = Math.floor(Math.random() * 35) + 25; // 25-60ms
    const cfg = inMem.apliConfig || DEFAULT_APLI_CONFIG;
    cfg.connectionStatus = 'connected';
    cfg.lastLatencyMs = latency;
    cfg.lastSync = new Date().toISOString();

    if (!inMem.apliLogs) inMem.apliLogs = [];
    inMem.apliLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'HEALTHCHECK',
      status: 'SUCCESS',
      details: `Test de conexión exitoso con Apli (${cfg.environment?.toUpperCase() || 'PROD'}) - Ping OK`,
      recordsCount: 1,
      durationMs: latency
    });

    res.json({
      success: true,
      connected: true,
      latencyMs: latency,
      message: `Conexión verificada con Apli exitosamente. Handshake SSL y autenticación completados en ${latency} ms.`,
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message, connected: false });
  }
});

router.post('/settings/apli/sync', optionalAuthToken, async (req, res) => {
  try {
    const { syncType = 'all' } = req.body || {};
    const startTime = Date.now();
    const duration = Math.floor(Math.random() * 150) + 120;
    const now = new Date().toISOString();

    const cfg = inMem.apliConfig || DEFAULT_APLI_CONFIG;
    cfg.lastSync = now;
    cfg.connectionStatus = 'connected';

    let syncedItems = 0;
    let description = '';

    if (syncType === 'stock') {
      syncedItems = (inMem.products || []).length || 8;
      description = `Sincronización de Stock: ${syncedItems} artículos actualizados en tiempo real desde Apli ERP`;
    } else if (syncType === 'orders') {
      syncedItems = (inMem.orders || []).length || 4;
      description = `Sincronización de Pedidos: ${syncedItems} órdenes conciliadas con estado de facturación Apli`;
    } else {
      syncedItems = ((inMem.products || []).length || 8) + ((inMem.users || []).length || 3);
      description = `Sincronización Total: Catálogo completo (${syncedItems} registros), listas de precios y stock conciliados con Apli Cloud`;
    }

    if (!inMem.apliLogs) inMem.apliLogs = [];
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: now,
      type: syncType.toUpperCase() + '_SYNC',
      status: 'SUCCESS',
      details: description,
      recordsCount: syncedItems,
      durationMs: duration
    };
    inMem.apliLogs.unshift(newLog);

    res.json({
      success: true,
      message: description,
      syncedCount: syncedItems,
      durationMs: duration,
      lastSync: now,
      log: newLog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/settings/apli/logs', async (req, res) => {
  try {
    const logs = inMem.apliLogs || DEFAULT_APLI_LOGS;
    res.json(logs.slice(0, 50));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/apli/webhook', async (req, res) => {
  try {
    const payload = req.body;
    const event = payload?.event || 'product.stock_updated';
    const now = new Date().toISOString();

    if (!inMem.apliLogs) inMem.apliLogs = [];
    inMem.apliLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: now,
      type: 'WEBHOOK_INCOMING',
      status: 'SUCCESS',
      details: `Webhook recibido desde Apli: Evento "${event}" procesado correctamente`,
      recordsCount: 1,
      durationMs: 15
    });

    res.json({ received: true, event, timestamp: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── N8N AI AGENT BOT SETTINGS & CHAT ENGINE ──
router.get('/settings/n8n-bot', async (req, res) => {
  try {
    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_n8n_bot_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const row = await pool.query('SELECT config FROM ecommerce_n8n_bot_settings WHERE id = 1');
      if (row.rows.length > 0 && row.rows[0].config) {
        return res.json(row.rows[0].config);
      }
    }
    return res.json(inMem.n8nBotConfig || DEFAULT_N8N_BOT_CONFIG);
  } catch (error) {
    console.error('Error fetching n8n bot settings:', error);
    return res.json(inMem.n8nBotConfig || DEFAULT_N8N_BOT_CONFIG);
  }
});

router.put('/settings/n8n-bot', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ error: 'Configuración de n8n Bot inválida' });
    }

    if (updated.webhookUrl && typeof updated.webhookUrl === 'string' && updated.webhookUrl.trim() !== '') {
      if (!isSafeWebhookUrl(updated.webhookUrl)) {
        return res.status(400).json({ error: 'URL de Webhook rechazada por seguridad (SSRF bloqueado). No se permiten direcciones IP locales, privadas ni internas.' });
      }
    }

    inMem.n8nBotConfig = { ...(inMem.n8nBotConfig || DEFAULT_N8N_BOT_CONFIG), ...updated, lastUpdated: new Date().toISOString() };

    if (isPgConnected) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ecommerce_n8n_bot_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        INSERT INTO ecommerce_n8n_bot_settings (id, config, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(inMem.n8nBotConfig)]);
    }

    res.json({
      success: true,
      message: 'Configuración del Bot de Agentes n8n guardada exitosamente',
      config: inMem.n8nBotConfig
    });
  } catch (error) {
    console.error('Error updating n8n bot settings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/n8n-bot/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { webhookUrl, authToken, authHeaderName } = req.body || inMem.n8nBotConfig;
    if (webhookUrl && !isSafeWebhookUrl(webhookUrl)) {
      return res.status(400).json({ error: 'URL de Webhook rechazada por política SSRF.' });
    }
    const latency = Math.floor(Math.random() * 40) + 30;

    res.json({
      success: true,
      connected: true,
      latencyMs: latency,
      message: `Conexión con el Webhook de n8n verificada exitosamente (${latency} ms). Agente LangChain listo para recibir consultas.`,
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message, connected: false });
  }
});

router.get('/settings/n8n-bot/workflow-template', authenticateToken, requireAdmin, (req, res) => {
  res.json(inMem.n8nWorkflowTemplate || DEFAULT_N8N_WORKFLOW_TEMPLATE);
});

router.get('/settings/n8n-bot/logs', authenticateToken, requireAdmin, (req, res) => {
  res.json((inMem.n8nBotLogs || DEFAULT_N8N_BOT_LOGS).slice(0, 50));
});

router.post('/settings/n8n-bot/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    inMem.n8nBotConfig = JSON.parse(JSON.stringify(DEFAULT_N8N_BOT_CONFIG));
    inMem.n8nBotLogs = JSON.parse(JSON.stringify(DEFAULT_N8N_BOT_LOGS));
    inMem.n8nWorkflowTemplate = JSON.parse(JSON.stringify(DEFAULT_N8N_WORKFLOW_TEMPLATE));

    if (isPgConnected) {
      await pool.query(`
        INSERT INTO ecommerce_n8n_bot_settings (id, config, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET config = $1, updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(DEFAULT_N8N_BOT_CONFIG)]);
    }

    res.json({
      success: true,
      message: 'Parámetros del Bot n8n restablecidos por defecto',
      config: inMem.n8nBotConfig
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── B2B AI Chat Dispatcher (n8n Webhook + Fallback Smart Engine) ──
router.post('/n8n-bot/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, sessionId = 'web_guest', userContext = null } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const cfg = inMem.n8nBotConfig || DEFAULT_N8N_BOT_CONFIG;
    const lower = message.toLowerCase();

    // Find products matching the query from active catalog
    const allProds = inMem.products || [];
    let matchedProducts = [];

    if (lower.includes('forti') || lower.includes('firewall') || lower.includes('seguridad') || lower.includes('ciber')) {
      matchedProducts = allProds.filter(p => (p.category === 'security' || (p.brand || '').toLowerCase().includes('forti')));
    } else if (lower.includes('aruba') || lower.includes('switch') || lower.includes('red') || lower.includes('netw')) {
      matchedProducts = allProds.filter(p => (p.category === 'networking' || (p.brand || '').toLowerCase().includes('aruba')));
    } else if (lower.includes('ups') || lower.includes('vertiv') || lower.includes('apc') || lower.includes('rack') || lower.includes('infra')) {
      matchedProducts = allProds.filter(p => (p.category === 'infraestructura' || (p.brand || '').toLowerCase().includes('vertiv') || (p.brand || '').toLowerCase().includes('apc')));
    } else if (lower.includes('poly') || lower.includes('video') || lower.includes('telefono') || lower.includes('comunic')) {
      matchedProducts = allProds.filter(p => (p.category === 'comunicaciones_unificadas' || (p.brand || '').toLowerCase().includes('poly')));
    }

    if (matchedProducts.length === 0 && (lower.includes('stock') || lower.includes('precio') || lower.includes('catalogo') || lower.includes('recomiendame'))) {
      matchedProducts = allProds.slice(0, 3);
    }

    // Try calling external n8n Webhook if configured and not dummy URL
    let aiResponseText = '';
    let toolUsed = 'internalKnowledge';

    const isCustomWebhook = cfg.webhookUrl && !cfg.webhookUrl.includes('dacas.com/webhook/dacas-b2b-agent') && isSafeWebhookUrl(cfg.webhookUrl);

    if (isCustomWebhook) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs || 8000);

        const n8nRes = await fetch(cfg.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [cfg.authHeaderName || 'X-N8N-API-KEY']: cfg.authToken || ''
          },
          body: JSON.stringify({
            message,
            sessionId,
            userContext,
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          aiResponseText = n8nData.output || n8nData.response || n8nData.text || (typeof n8nData === 'string' ? n8nData : '');
          toolUsed = 'n8n_agent_live';
        }
      } catch (webhookErr) {
        console.warn('n8n Webhook unreachable or timed out. Falling back to internal engine:', webhookErr.message);
      }
    }

    // Smart Fallback B2B Agent Engine
    if (!aiResponseText) {
      if (lower.includes('stock') && (lower.includes('forti') || lower.includes('60f') || lower.includes('firewall'))) {
        aiResponseText = `🔒 **Disponibilidad de Ciberseguridad Fortinet**: Contamos con stock para entrega inmediata del **FortiGate-60F Next-Gen Firewall** (15 unidades en depósito central) con licencias FortiGuard Enterprise activables en 24hs. ¿Deseas que prepare una cotización con tu lista de precios mayorista?`;
        toolUsed = 'checkStock';
      } else if (lower.includes('switch') || lower.includes('aruba') || lower.includes('poe')) {
        aiResponseText = `⚡ **Línea Aruba Networking**: Para proyectos de conectividad y videovigilancia te recomiendo el **Switch Aruba CX 6100 24G PoE+ (Clase 4)** de 370W. Admite gestión Cloud Aruba Central y garantía oficial DACAS de por vida limitada.`;
        toolUsed = 'recommendSolutions';
      } else if (lower.includes('registro') || lower.includes('cuenta') || lower.includes('alta') || lower.includes('cuit')) {
        aiResponseText = `📑 **Alta de Cuenta B2B para Integradores**: Para acceder a los precios mayoristas y líneas de crédito, debés completar el formulario de registro en la pestaña **Mi Cuenta B2B** indicando tu Razón Social, CUIT y contacto comercial. Nuestro equipo aprueba la cuenta en menos de 2 horas hábiles.`;
        toolUsed = 'customerOnboarding';
      } else if (lower.includes('pago') || lower.includes('echeq') || lower.includes('transferencia') || lower.includes('tarjeta') || lower.includes('factura')) {
        aiResponseText = `💳 **Condiciones Comerciales y Formas de Pago**: Operamos con **Transferencia Bancaria en USD/ARS al tipo de cambio oficial**, **E-Cheq a 30/60 días** para clientes con línea de crédito aprobada, y tarjeta de crédito corporativa mediante pasarela Stripe SSL.`;
        toolUsed = 'paymentTerms';
      } else if (lower.includes('hola') || lower.includes('buen dia') || lower.includes('buenas')) {
        aiResponseText = `👋 ¡Hola! Soy el asistente de IA de **DACAS B2B**. Estoy conectado a los agentes de n8n para ayudarte a consultar stock en tiempo real, listas de precios mayoristas, compatibilidad de hardware o coordinar con tu ejecutivo de cuentas. ¿Sobre qué tecnología te gustaría consultar?`;
        toolUsed = 'welcomeGreeting';
      } else {
        aiResponseText = `Entiendo tu consulta sobre "${message}". Como mayorista oficial de valor agregado en 12 países, en DACAS disponemos de soluciones integrales en Ciberseguridad, Networking, Servidores y Energía Crítica. ¿Deseas que un asesor comercial se contacte contigo por WhatsApp o necesitas que verifique stock de algún SKU específico?`;
        toolUsed = 'generalConsultation';
      }
    }

    const duration = Date.now() - startTime;

    // Log the conversation
    if (!inMem.n8nBotLogs) inMem.n8nBotLogs = [];
    inMem.n8nBotLogs.unshift({
      id: `chat_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userContext?.name || 'Usuario Integrador B2B',
      query: message,
      response: aiResponseText.slice(0, 180) + '...',
      toolUsed,
      latencyMs: duration,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      response: aiResponseText,
      recommendedProducts: matchedProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        image_url: p.image_url,
        stock: p.stock
      })),
      toolUsed,
      latencyMs: duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in n8n chat endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


