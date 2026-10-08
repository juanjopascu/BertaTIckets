import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../apiConfig';

/* ─── High-Tech Mock Products (DACAS Catalog & Solutions) ─── */
export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Firewall Next-Gen Enterprise FortiGate 60F',
    brand: 'Fortinet',
    description: '<p>Protección contra amenazas de alto rendimiento para redes corporativas medianas y grandes. Incluye control de aplicaciones, filtrado web avanzado, VPN IPSec/SSL de alta velocidad y detección por IA de intrusiones en tiempo real.</p><ul><li>Rendimiento IPS: 1.4 Gbps</li><li>Conexiones concurrentes: 700,000</li><li>Puertos: 10 x GE RJ45</li></ul>',
    price: 850,
    promotional_price: 765,
    stock: 24,
    badge: 'MÁS VENDIDO',
    badgeColor: '#0fa4de',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'security',
    sku: 'FG-60F-BDL',
    weight: '1.2',
    width: '21.6',
    depth: '16.0',
    height: '3.8'
  },
  {
    id: 2,
    name: 'Switch Gestionable Gigabit 24 Puertos PoE+ MikroTik Cloud Router',
    brand: 'MikroTik',
    description: '<p>Switch empresarial capa 2/3 con 24 puertos Gigabit PoE dual 802.3af/at y 4 puertos 10G SFP+ para fibra óptica de alta velocidad.</p><ul><li>Puertos: 24 x 10/100/1000 Mbps PoE+</li><li>Uplinks: 4 x 10G SFP+</li><li>Sistema operativo: RouterOS / SwOS</li></ul>',
    price: 480,
    promotional_price: 449,
    stock: 18,
    badge: 'DESTACADO',
    badgeColor: '#10b981',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'networking',
    sku: 'CRS328-24P-4S',
    weight: '4.5',
    width: '44.5',
    depth: '30.2',
    height: '4.4'
  },
  {
    id: 3,
    name: 'Punto de Acceso Wi-Fi 6 Enterprise Aruba Instant On AP22',
    brand: 'Aruba',
    description: '<p>Access Point de techo para alta densidad corporativa. Ofrece tecnología Wi-Fi 6 MU-MIMO con gestión centralizada en la nube sin costo adicional de licencias.</p><ul><li>Estándar: 802.11ax Wi-Fi 6</li><li>Cobertura: Hasta 150 m²</li><li>Soporte Mesh Inteligente y Portal Cautivo</li></ul>',
    price: 195,
    promotional_price: null,
    stock: 40,
    badge: 'NUEVO',
    badgeColor: '#38bdf8',
    image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'networking',
    sku: 'R4W02A-AP22',
    weight: '0.8',
    width: '19.7',
    depth: '19.7',
    height: '3.5'
  },
  {
    id: 4,
    name: 'Sistema UPS Online Doble Conversión Vertiv Liebert GXT5 3kVA',
    brand: 'Vertiv',
    description: '<p>UPS de alta confiabilidad factor de potencia 1.0 para centros de datos y racks críticos. Proporciona protección total contra cortes, sobretensiones y microcortes.</p><ul><li>Capacidad: 3000VA / 3000W</li><li>Topología: Online Doble Conversión</li><li>Baterías hot-swappable y tarjeta SNMP de gestión</li></ul>',
    price: 2150,
    promotional_price: 1980,
    stock: 12,
    badge: 'ENTERPRISE',
    badgeColor: '#6366f1',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'infraestructura',
    sku: 'GXT5-3000IRT2UXLE',
    weight: '28.2',
    width: '43.0',
    depth: '54.0',
    height: '8.5'
  },
  {
    id: 5,
    name: 'Teléfono IP Ejecutivo AudioCodes 450HD con Microsoft Teams',
    brand: 'AudioCodes',
    description: '<p>Teléfono IP de escritorio corporativo de alta gama certificado para Microsoft Teams y SIP, con pantalla táctil color de 5 pulgadas, audio HD SILK y switch Gigabit PoE integrado.</p>',
    price: 320,
    promotional_price: 295,
    stock: 25,
    badge: 'TEAMS CERT',
    badgeColor: '#0fa4de',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'comunicaciones_unificadas',
    sku: 'AC-450HD-TEAMS',
    weight: '1.4',
    width: '25.7',
    depth: '22.8',
    height: '9.8'
  },
  {
    id: 6,
    name: 'Sistema de Videoconferencia Avaya Collaboration Bar B109',
    brand: 'Avaya',
    description: '<p>Solución de colaboración y videoconferencia HD con audio OmniSound cristalino, cancelación de eco y conectividad Bluetooth/USB para salas de reuniones empresariales.</p>',
    price: 680,
    promotional_price: 620,
    stock: 14,
    badge: 'COLABORACIÓN',
    badgeColor: '#10b981',
    image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'comunicaciones_unificadas',
    sku: 'AVAYA-B109-HD',
    weight: '2.1',
    width: '60.0',
    depth: '10.5',
    height: '12.0'
  },
  {
    id: 7,
    name: 'Gabinete Rack Servidores 42U Panduit Net-Access Insonorizado',
    brand: 'Panduit',
    description: '<p>Rack para centros de datos de 42 unidades con puertas microperforadas de alta ventilación, organizadores verticales de cableado y cerraduras de seguridad integradas.</p>',
    price: 1890,
    promotional_price: null,
    stock: 6,
    badge: 'DATACENTER',
    badgeColor: '#6366f1',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'infraestructura',
    sku: 'PANDUIT-42U-NA',
    weight: '125.0',
    width: '80.0',
    depth: '120.0',
    height: '200.0'
  },
  {
    id: 8,
    name: 'UPS Monofásica Torre/Rack Eaton 9PX 1000VA RT2U',
    brand: 'Eaton',
    description: '<p>UPS Online Doble Conversión con factor de potencia 0.9 y rendimiento hasta 94% en modo online. Compatible con entornos virtuales VMware y Hyper-V.</p>',
    price: 990,
    promotional_price: 890,
    stock: 15,
    badge: 'EFICIENTE',
    badgeColor: '#0fa4de',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'infraestructura',
    sku: '9PX1000IRT2U',
    weight: '17.4',
    width: '44.0',
    depth: '45.0',
    height: '8.6'
  }
];

export const DACAS_COUNTRIES = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' }
];

export function CategoryIcon({ name, size = 18, color = 'currentColor', style = {} }) {
  const n = (name || '').toLowerCase().trim();
  if (n === 'networking' || n.includes('network') || n === '🌐') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (n === 'infraestructura' || n.includes('infra') || n === '🏗️' || n.includes('server')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
        <rect x="2" y="3" width="20" height="7" rx="2" />
        <rect x="2" y="14" width="20" height="7" rx="2" />
        <line x1="6" y1="6.5" x2="6.01" y2="6.5" />
        <line x1="6" y1="17.5" x2="6.01" y2="17.5" />
        <line x1="10" y1="6.5" x2="14" y2="6.5" />
        <line x1="10" y1="17.5" x2="14" y2="17.5" />
      </svg>
    );
  }
  if (n === 'comunicaciones_unificadas' || n.includes('comunic') || n === '📞' || n.includes('telef')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (n === 'security' || n.includes('secur') || n.includes('segurid') || n === '🔒') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }
  // Default / All / Todos los productos
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function BrandLogoImg({ src, alt, name, color = '#0fa4de', size = 38 }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const letter = (name || alt || 'D').trim().charAt(0).toUpperCase();

  const finalSrc = src && typeof src === 'string' && src.startsWith('/uploads')
    ? `${API_BASE_URL}${src}`
    : src;

  if (!finalSrc || hasError) {
    return (
      <span style={{
        fontSize: `${Math.round(size * 0.52)}px`,
        fontWeight: '900',
        color: color || '#0fa4de',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        lineHeight: 1
      }}>
        {letter}
      </span>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt || name || 'Marca'}
      onError={() => setHasError(true)}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  );
}

export const CATEGORIES = [
  { key: 'all', label: 'Todos los productos', icon: 'all' },
  { key: 'networking', label: 'Networking', icon: 'networking' },
  { key: 'infraestructura', label: 'Infraestructura', icon: 'infraestructura' },
  { key: 'comunicaciones_unificadas', label: 'Comunicaciones Unificadas', icon: 'comunicaciones_unificadas' },
  { key: 'security', label: 'Security', icon: 'security' },
];

export const BRAND_INFO = {
  // ── Comunicaciones Unificadas ──
  'audiocodes': {
    name: 'AudioCodes',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23005596"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="16" fill="white" text-anchor="middle">AC</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="18" fill="%23005596">AudioCodes</text></svg>',
    tagline: 'Gateways de Voz, SBCs y Teléfonos IP Teams',
    color: '#005596',
    bg: 'linear-gradient(135deg, rgba(0, 85, 150, 0.08) 0%, rgba(0, 85, 150, 0.02) 100%)'
  },
  'avaya': {
    name: 'Avaya',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23CC0000"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">A</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="22" fill="%23CC0000" letter-spacing="1">AVAYA</text></svg>',
    tagline: 'Líder en Contact Center y Comunicaciones Unificadas',
    color: '#CC0000',
    bg: 'linear-gradient(135deg, rgba(204, 0, 0, 0.08) 0%, rgba(204, 0, 0, 0.02) 100%)'
  },

  // ── Seguridad - Ciberseguridad ──
  'algosec': {
    name: 'AlgoSec',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%230084C7"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">A</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="19" fill="%230084C7">AlgoSec</text></svg>',
    tagline: 'Automatización de Seguridad y Políticas de Firewall',
    color: '#0084C7',
    bg: 'linear-gradient(135deg, rgba(0, 132, 199, 0.08) 0%, rgba(0, 132, 199, 0.02) 100%)'
  },
  'barracuda': {
    name: 'Barracuda Networks',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23006699"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">B</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="18" fill="%23006699">Barracuda</text></svg>',
    tagline: 'Seguridad de Email, WAF y Respaldo en la Nube',
    color: '#006699',
    bg: 'linear-gradient(135deg, rgba(0, 102, 153, 0.08) 0%, rgba(0, 102, 153, 0.02) 100%)'
  },
  'fortinet': {
    name: 'Fortinet',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23EE3124"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">F</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="20" fill="%23071524" letter-spacing="0.5">FORTINET</text></svg>',
    tagline: 'Seguridad de Red Convergente y Firewalls NGFW FortiGate',
    color: '#EE3124',
    bg: 'linear-gradient(135deg, rgba(238, 49, 36, 0.08) 0%, rgba(238, 49, 36, 0.02) 100%)'
  },
  'f5': {
    name: 'F5 Networks',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><circle cx="20" cy="24" r="16" fill="%23E2231A"/><text x="20" y="30" font-family="sans-serif" font-weight="900" font-size="16" fill="white" text-anchor="middle">f5</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="18" fill="%23071524">Networks</text></svg>',
    tagline: 'Seguridad y Entrega Multi-Cloud de Aplicaciones & DDoS',
    color: '#E2231A',
    bg: 'linear-gradient(135deg, rgba(226, 35, 26, 0.08) 0%, rgba(226, 35, 26, 0.02) 100%)'
  },
  'imperva': {
    name: 'Imperva',
    logo: null,
    tagline: 'Protección Integral de Datos, APIs y WAF Avanzado',
    color: '#001E62',
    bg: 'linear-gradient(135deg, rgba(0, 30, 98, 0.08) 0%, rgba(0, 30, 98, 0.02) 100%)'
  },
  'hitachi vantara': {
    name: 'Hitachi Vantara',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23E8112D"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">H</text><text x="46" y="25" font-family="sans-serif" font-weight="900" font-size="16" fill="%23E8112D">HITACHI</text><text x="46" y="38" font-family="sans-serif" font-weight="700" font-size="11" fill="%2364748B">Vantara</text></svg>',
    tagline: 'Almacenamiento Seguro e Infraestructura de Datos Críticos',
    color: '#E8112D',
    bg: 'linear-gradient(135deg, rgba(232, 17, 45, 0.08) 0%, rgba(232, 17, 45, 0.02) 100%)'
  },
  'infoblox': {
    name: 'Infoblox',
    logo: null,
    tagline: 'Gestión DDI Segura (DNS, DHCP, IPAM) y BloxOne Threat Defense',
    color: '#68BC45',
    bg: 'linear-gradient(135deg, rgba(104, 188, 69, 0.08) 0%, rgba(104, 188, 69, 0.02) 100%)'
  },
  'nsfocus': {
    name: 'NSFOCUS',
    logo: null,
    tagline: 'Defensa contra Ataques DDoS Carrier-Grade y Seguridad Web',
    color: '#008542',
    bg: 'linear-gradient(135deg, rgba(0, 133, 66, 0.08) 0%, rgba(0, 133, 66, 0.02) 100%)'
  },
  'radware': {
    name: 'Radware',
    logo: null,
    tagline: 'Control de Entrega de Aplicaciones y Mitigación DDoS',
    color: '#F26522',
    bg: 'linear-gradient(135deg, rgba(242, 101, 34, 0.08) 0%, rgba(242, 101, 34, 0.02) 100%)'
  },
  'silver peak': {
    name: 'Silver Peak',
    logo: null,
    tagline: 'EdgeConnect SD-WAN Seguro y Optimización de Red WAN',
    color: '#0085CA',
    bg: 'linear-gradient(135deg, rgba(0, 133, 202, 0.08) 0%, rgba(0, 133, 202, 0.02) 100%)'
  },
  'sophos': {
    name: 'Sophos',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%2300549A"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">S</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="20" fill="%2300549A">SOPHOS</text></svg>',
    tagline: 'Ciberseguridad Sincronizada, Intercept X Endpoint y XGS',
    color: '#00549A',
    bg: 'linear-gradient(135deg, rgba(0, 84, 154, 0.08) 0%, rgba(0, 84, 154, 0.02) 100%)'
  },
  'sonicwall': {
    name: 'SonicWall',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23F37023"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">S</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="18" fill="%23F37023">SonicWall</text></svg>',
    tagline: 'Firewalls de Nueva Generación TZ / NSa y Acceso Seguro',
    color: '#F37023',
    bg: 'linear-gradient(135deg, rgba(243, 112, 35, 0.08) 0%, rgba(243, 112, 35, 0.02) 100%)'
  },
  'veracode': {
    name: 'Veracode',
    logo: null,
    tagline: 'Seguridad en Desarrollo y Análisis de Código de Software',
    color: '#00B3E3',
    bg: 'linear-gradient(135deg, rgba(0, 179, 227, 0.08) 0%, rgba(0, 179, 227, 0.02) 100%)'
  },
  'vicarius': {
    name: 'Vicarius',
    logo: null,
    tagline: 'Gestión y Remediación Autónoma de Vulnerabilidades vRx',
    color: '#1E293B',
    bg: 'linear-gradient(135deg, rgba(30, 41, 59, 0.08) 0%, rgba(30, 41, 59, 0.02) 100%)'
  },
  'viewtinet': {
    name: 'Viewtinet',
    logo: null,
    tagline: 'Monitoreo de Tráfico de Red, Calidad de Experiencia y QoS',
    color: '#00A8E1',
    bg: 'linear-gradient(135deg, rgba(0, 168, 225, 0.08) 0%, rgba(0, 168, 225, 0.02) 100%)'
  },

  // ── Infraestructura ──
  'avocent': {
    name: 'Avocent',
    logo: null,
    tagline: 'Gestión KVM-over-IP y Control Fuera de Banda para Datacenters',
    color: '#333333',
    bg: 'linear-gradient(135deg, rgba(51, 51, 51, 0.08) 0%, rgba(51, 51, 51, 0.02) 100%)'
  },
  'commscope': {
    name: 'CommScope',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23005596"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">C</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="17" fill="%23005596">COMMSCOPE</text></svg>',
    tagline: 'Infraestructura Integral de Redes Ópticas y Cableado',
    color: '#005596',
    bg: 'linear-gradient(135deg, rgba(0, 85, 150, 0.08) 0%, rgba(0, 85, 150, 0.02) 100%)'
  },
  'commscope netconnect': {
    name: 'CommScope NETCONNECT',
    logo: null,
    tagline: 'Sistemas de Cableado Estructurado y Conectividad de Cobre',
    color: '#005596',
    bg: 'linear-gradient(135deg, rgba(0, 85, 150, 0.08) 0%, rgba(0, 85, 150, 0.02) 100%)'
  },
  'commscope systimax': {
    name: 'CommScope SYSTIMAX',
    logo: null,
    tagline: 'Infraestructura Premium de Ultra Alta Velocidad y Fibra',
    color: '#005596',
    bg: 'linear-gradient(135deg, rgba(0, 85, 150, 0.08) 0%, rgba(0, 85, 150, 0.02) 100%)'
  },
  'eaton': {
    name: 'Eaton',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23005EB8"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">E</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="21" fill="%23005EB8">EATON</text></svg>',
    tagline: 'Sistemas UPS, PDUs y Protección de Energía Crítica',
    color: '#005EB8',
    bg: 'linear-gradient(135deg, rgba(0, 94, 184, 0.08) 0%, rgba(0, 94, 184, 0.02) 100%)'
  },
  'gabitel': {
    name: 'Gabitel',
    logo: null,
    tagline: 'Racks de Servidores, Gabinetes Exteriores y Cajas Murales',
    color: '#72BF44',
    bg: 'linear-gradient(135deg, rgba(114, 191, 68, 0.08) 0%, rgba(114, 191, 68, 0.02) 100%)'
  },
  'panduit': {
    name: 'Panduit',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23005A9C"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">P</text><text x="46" y="30" font-family="sans-serif" font-weight="800" font-size="19" fill="%23005A9C">Panduit</text></svg>',
    tagline: 'Cableado Estructurado, Canalización y Datacenter Solutions',
    color: '#005A9C',
    bg: 'linear-gradient(135deg, rgba(0, 90, 156, 0.08) 0%, rgba(0, 90, 156, 0.02) 100%)'
  },
  'siemon': {
    name: 'Siemon',
    logo: null,
    tagline: 'Sistemas de Cableado de Red de Alto Rendimiento',
    color: '#D2232A',
    bg: 'linear-gradient(135deg, rgba(210, 35, 42, 0.08) 0%, rgba(210, 35, 42, 0.02) 100%)'
  },
  'vertiv': {
    name: 'Vertiv',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23FF4500"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">V</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="21" fill="%230F172A">VERTIV</text></svg>',
    tagline: 'Climatización Crítica Liebert, UPS y Micro-Datacenters',
    color: '#FF4500',
    bg: 'linear-gradient(135deg, rgba(255, 69, 0, 0.08) 0%, rgba(255, 69, 0, 0.02) 100%)'
  },
  'tz': {
    name: 'TZ',
    logo: null,
    tagline: 'Cerraduras Electrónicas Inteligentes y Control de Acceso SMA',
    color: '#EAB308',
    bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.02) 100%)'
  },

  // ── Networking ──
  'mikrotik': {
    name: 'MikroTik',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23D8232A"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">M</text><text x="46" y="30" font-family="sans-serif" font-weight="900" font-size="19" fill="%231E293B">MikroTik</text></svg>',
    tagline: 'Routers, Switches de alta capacidad y RouterOS',
    color: '#D8232A',
    bg: 'linear-gradient(135deg, rgba(216, 35, 42, 0.08) 0%, rgba(216, 35, 42, 0.02) 100%)'
  },
  'aruba': {
    name: 'Aruba',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%23FF8300"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">A</text><text x="46" y="31" font-family="sans-serif" font-weight="900" font-size="21" fill="%23FF8300">aruba</text></svg>',
    tagline: 'Puntos de Acceso Wi-Fi 6 y Switching Corporativo Cloud',
    color: '#FF8300',
    bg: 'linear-gradient(135deg, rgba(255, 131, 0, 0.08) 0%, rgba(255, 131, 0, 0.02) 100%)'
  },
  'microsoft': {
    name: 'Microsoft',
    logo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="none"><rect width="36" height="36" y="6" rx="8" fill="%2300A4EF"/><text x="18" y="29" font-family="sans-serif" font-weight="900" font-size="18" fill="white" text-anchor="middle">M</text><text x="46" y="30" font-family="sans-serif" font-weight="700" font-size="18" fill="%23334155">Microsoft</text></svg>',
    tagline: 'Licenciamiento Corporativo CSP, Windows Server y M365',
    color: '#00A4EF',
    bg: 'linear-gradient(135deg, rgba(0, 164, 239, 0.08) 0%, rgba(0, 164, 239, 0.02) 100%)'
  },
  'dacas': {
    name: 'DACAS',
    logo: '/favicon-shop.svg',
    tagline: 'Servicios Oficiales, Soporte y Capacitaciones',
    color: '#0FA4DE',
    bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
  }
};

export const CATEGORY_BRANDS_MAP = {
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
};

export const DISALLOWED_BRANDS = ['cisco', 'poly', 'ubiquiti', 'dell', 'dell technologies'];
