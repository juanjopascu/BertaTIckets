export const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

export const COLORS = ['#0fa4de', '#38bdf8', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
export const PIE_COLORS = ['#0fa4de', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export const CATEGORIES = ['networking', 'infraestructura', 'comunicaciones_unificadas', 'security', 'General'];

export const statusLabel = (s) => ({
  pending: 'Pendiente',
  procesando: '🟡 En Preparación',
  paid: '🟢 Pagado',
  en_camino: '🚚 En Despacho',
  entregado: '✅ Entregado',
  shipped: '🚚 Enviado',
  completed: '✅ Completado',
  cancelled: '🔴 Cancelado'
}[s] || s);

export const statusStyle = (s) => {
  if (s === 'paid' || s === 'completed' || s === 'entregado') return { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
  if (s === 'pending' || s === 'procesando') return { background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' };
  if (s === 'en_camino' || s === 'shipped') return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
  if (s === 'cancelled') return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
  return { background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid #e2e8f0' };
};

export const translateRuleType = (t) => ({ discount: 'Descuento', tax: 'Impuesto', shipping: 'Envío', nationalization: 'Nacionalización' }[t] || t);
export const translateValueType = (t) => ({ percentage: '% Porcentaje', fixed: '$ Fijo' }[t] || t);

export const initialUserForm = {
  name: '', email: '', password: '', status: 'activo', cargo: 'Encargado de Compras',
  razon_social: '', tipo_cliente: 'Reseller / Integrador IT', direccion_legal: '', localidad: '', codigo_postal: '', ciudad: '', country_id: '', phone: '', fecha_limite_facturacion: '', web: '',
  cuenta_corriente_habilitada: false,
  cuenta_corriente_limite: 0,
  report_to_country_id: '', vendedor: '', direccion_entrega: '', localidad_entrega: '', codigo_postal_entrega: '', ciudad_entrega: '', pais_entrega_id: '', tipo_iva: '', numero_nit: '',
  nombre_compras: '', telefono_compras: '', email_compras: '',
  nombre_pagos: '', telefono_pagos: '', email_pagos: '',
  nombre_admin: '', telefono_admin: '', email_admin: '',
  email_factura_electronica: '', email_contacto_compras: '', email_cotizaciones_automaticas: '',
  iibb_jurisdiccion: '901 - Capital Federal',
  iibb_tipo: 'C.M.',
  iibb_numero: '',
  iibb_codigo_aceptacion: false,
  percepciones: {
    caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
    bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
    salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
    misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
    tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
  }
};


export const downloadCSV = (rows, headers, filename) => {
  const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;
  const csv = "data:text/csv;charset=utf-8,\uFEFF"
    + [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const DACAS_COUNTRIES_LIST = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', id: 2 },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', id: 4 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', id: 5 },
  { code: 'MX', name: 'México', flag: '🇲🇽', id: 8 },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', id: 1 },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', id: 12 },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', id: 10 },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', id: 3 },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', id: 6 },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', id: 7 },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', id: 9 },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', id: 11 }
];

export const sanitizeVisualConfig = (config) => {
  if (!config) return config;
  const slides = Array.isArray(config.heroSlides) ? config.heroSlides : [];
  const seenIds = new Set();
  const sanitizedSlides = slides.map((s, idx) => {
    let id = s.id;
    if (id === undefined || id === null || seenIds.has(String(id))) {
      id = `slide_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    }
    seenIds.add(String(id));
    const rawMetrics = Array.isArray(s.metrics) ? s.metrics : [];
    const defaultMetrics = [
      { value: '+25 Años', label: 'Liderando el Mercado IT' },
      { value: '12 Países', label: 'Cobertura Regional' },
      { value: '24/7', label: 'Soporte y Garantía Oficial' }
    ];
    const metrics = [
      rawMetrics[0] || defaultMetrics[0],
      rawMetrics[1] || defaultMetrics[1],
      rawMetrics[2] || defaultMetrics[2]
    ];
    return {
      ...s,
      id,
      metrics
    };
  });

  const defaultBrandBanners = [
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
  ];

  const brandBanners = (Array.isArray(config.brandBanners) && config.brandBanners.length > 0)
    ? config.brandBanners
    : defaultBrandBanners;

  let carouselList = Array.isArray(config.homeCarousels?.list) ? config.homeCarousels.list : null;

  if (!carouselList || carouselList.length === 0) {
    const feat = config.homeCarousels?.featured || {};
    const cust = config.homeCarousels?.custom || {};
    carouselList = [
      {
        id: 'car_featured',
        title: feat.title || '🔥 Productos Destacados',
        subtitle: feat.subtitle || 'Equipamiento de alta demanda con entrega inmediata y garantía oficial DACAS',
        badge: 'TOP SELLERS',
        badgeColor: '#0fa4de',
        icon: 'star',
        enabled: feat.enabled !== false,
        selectionType: (feat.productIds && feat.productIds.length > 0) ? 'manual' : 'featured',
        targetCategory: 'all',
        targetBrand: 'all',
        productIds: Array.isArray(feat.productIds) ? feat.productIds : []
      },
      {
        id: 'car_custom',
        title: cust.title || '⚡ Oportunidades & Ofertas IT',
        subtitle: cust.subtitle || 'Soluciones corporativas seleccionadas con precios mayoristas para canales',
        badge: 'SELECCIÓN DACAS',
        badgeColor: '#10b981',
        icon: 'shield',
        enabled: cust.enabled !== false,
        selectionType: (cust.productIds && cust.productIds.length > 0) ? 'manual' : 'featured',
        targetCategory: 'all',
        targetBrand: 'all',
        productIds: Array.isArray(cust.productIds) ? cust.productIds : []
      }
    ];
  } else {
    carouselList = carouselList.map((c, idx) => ({
      id: c.id || `car_${idx}_${Date.now()}`,
      title: c.title || `Carrusel #${idx + 1}`,
      subtitle: c.subtitle || '',
      badge: c.badge || 'DESTACADO',
      badgeColor: c.badgeColor || '#0fa4de',
      icon: c.icon || 'star',
      enabled: c.enabled !== false,
      selectionType: c.selectionType || (c.productIds && c.productIds.length > 0 ? 'manual' : 'featured'),
      targetCategory: c.targetCategory || 'all',
      targetBrand: c.targetBrand || 'all',
      productIds: Array.isArray(c.productIds) ? c.productIds : []
    }));
  }

  const homeCarousels = {
    list: carouselList,
    featured: carouselList[0] || {},
    custom: carouselList[1] || {}
  };

  return {
    ...config,
    heroSlides: sanitizedSlides,
    brandBanners,
    homeCarousels
  };
};

export const DEFAULT_CHECKOUT_METHODS = {
  shipping: [
    {
      id: 'express',
      enabled: true,
      title: 'Envío Express a Domicilio',
      subtitle: 'Despacho a Planta / Oficina',
      badge: 'Recomendado',
      icon: '🚚',
      priceText: 'Bonificado (B2B)',
      description: 'Envío directo puerta a puerta a la dirección declarada de la empresa.'
    },
    {
      id: 'hub',
      enabled: true,
      title: 'Retiro en HUB DACAS',
      subtitle: 'Depósito Central (Sin Cargo)',
      badge: 'Gratis',
      icon: '🏢',
      priceText: 'Sin cargo',
      description: 'Retiro por depósito central o centro logístico DACAS en el país.'
    },
    {
      id: 'expreso',
      enabled: true,
      title: 'Expreso / Transporte Propio',
      subtitle: 'Despacho a receptoría de expreso',
      badge: 'Interior',
      icon: '🚛',
      priceText: 'A cargo del cliente',
      description: 'Despacho hacia la receptoría o transporte que el integrador contrate.'
    }
  ],
  payment: [
    {
      id: 'cuenta_corriente',
      enabled: true,
      title: 'Cuenta Corriente Comercial B2B DACAS',
      subtitle: 'Pago diferido contra factura y límite crediticio asignado a tu empresa.',
      icon: 'bank',
      terms: ['30_dias', '60_dias'],
      terms_label: 'Plazo de Facturación:',
      instrucciones: 'Sujeto a verificación de línea crediticia aprobada en DACAS.'
    },
    {
      id: 'transferencia',
      enabled: true,
      title: 'Transferencia Bancaria Directa (CBU / SWIFT)',
      subtitle: 'Se emitirá la Factura Proforma con cuentas en BBVA / Banco Santander para depósito en USD o ARS al tipo de cambio oficial.',
      badge: 'Inmediato',
      icon: '💸',
      banco: 'Banco Santander / BBVA Argentina',
      titular: 'DACAS S.A.',
      cuit: '30-68942158-9',
      cbu: '0720123920000001234567',
      alias: 'DACAS.PAGOS.B2B',
      swift: 'BAPROARBAXXX',
      tipo_cuenta: 'Cuenta Corriente Especial en USD / ARS',
      instrucciones: 'Una vez efectuada la transferencia, adjuntá el comprobante a cobranzas@dacas.com indicando tu número de orden.'
    },
    {
      id: 'tarjeta',
      enabled: true,
      title: 'Tarjeta Corporativa / Débito (Stripe Secure)',
      subtitle: 'Procesamiento online seguro e inmediato con Visa, Mastercard, American Express B2B.',
      badge: 'Online',
      icon: '💳',
      gateway: 'Stripe SSL 256-bit',
      instrucciones: 'Transacción encriptada y protegida bajo normativa PCI-DSS Nivel 1.'
    },
    {
      id: 'echeq',
      enabled: true,
      title: 'Cheque de Pago Diferido / E-Cheq',
      subtitle: 'Endoso y recepción de cheques electrónicos interbancarios COELSA.',
      badge: 'Financiamiento',
      icon: '📑',
      cuit_receptor: '30-68942158-9',
      banco_receptor: 'Banco Santander',
      plazos_admitidos: '30 y 60 días fecha factura',
      instrucciones: 'Emitir o endosar el E-Cheq a favor de DACAS S.A. (CUIT 30-68942158-9) mediante homebanking.'
    }
  ],
  terms_conditions_text: 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'
};


