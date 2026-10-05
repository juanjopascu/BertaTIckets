import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

/* ─── High-Tech Mock Products (DACAS Catalog & Solutions) ─── */
const MOCK_PRODUCTS = [
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
    sku: 'PANDUIT-42U-RCK',
    weight: '98.0',
    width: '60.0',
    depth: '100.0',
    height: '200.0'
  },
  {
    id: 8,
    name: 'Licencia Anual Ciberseguridad Cloud & Endpoint Protection',
    brand: 'Fortinet',
    description: '<p>Suscripción anual por usuario con protección avanzada contra Ransomware, EDR (Endpoint Detection and Response), filtrado DNS y sandboxing en la nube de nivel corporativo.</p>',
    price: 65,
    promotional_price: null,
    stock: 999,
    badge: 'DIGITAL',
    badgeColor: '#f59e0b',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'security',
    sku: 'LIC-EDR-ANNUAL',
    weight: '0',
    width: '0',
    depth: '0',
    height: '0'
  }
];

const DACAS_COUNTRIES = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
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
  // Default / All / Todos los productos / 🛒
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
    ? `http://${window.location.hostname}:3001${src}`
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

const CATEGORIES = [
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

const CATEGORY_BRANDS_MAP = {
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

const DISALLOWED_BRANDS = ['cisco', 'poly', 'ubiquiti', 'dell', 'dell technologies'];

/* ─── Animated Number Counter for Slide 0 (Efecto animado de números) ─── */
function AnimatedHeroStats({ active, metrics }) {
  const [count25, setCount25] = useState(0);
  const [count100, setCount100] = useState(0);
  const [count24, setCount24] = useState(0);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (!active) {
      setCount25(0);
      setCount100(0);
      setCount24(0);
      setGlowing(false);
      return;
    }

    setGlowing(true);
    const glowTimer = setTimeout(() => setGlowing(false), 2200);

    // Animación de +25 Años
    let start25 = 0;
    const dur25 = 1100;
    const step25Time = Math.max(15, dur25 / 25);
    const interval25 = setInterval(() => {
      start25 += 1;
      setCount25(start25);
      if (start25 >= 25) clearInterval(interval25);
    }, step25Time);

    // Animación de 100% Oficial
    let start100 = 0;
    const dur100 = 1300;
    const step100Time = Math.max(15, dur100 / 50);
    const interval100 = setInterval(() => {
      start100 += 2;
      setCount100(Math.min(start100, 100));
      if (start100 >= 100) clearInterval(interval100);
    }, step100Time);

    // Animación de 24/7 Soporte
    let start24 = 0;
    const dur24 = 1000;
    const step24Time = Math.max(15, dur24 / 24);
    const interval24 = setInterval(() => {
      start24 += 1;
      setCount24(start24);
      if (start24 >= 24) clearInterval(interval24);
    }, step24Time);

    return () => {
      clearTimeout(glowTimer);
      clearInterval(interval25);
      clearInterval(interval100);
      clearInterval(interval24);
    };
  }, [active]);

  const stats = useMemo(() => {
    if (Array.isArray(metrics) && metrics.length >= 3 && (metrics[0]?.value || metrics[1]?.value || metrics[2]?.value)) {
      return [
        {
          value: count25 > 0 && metrics[0]?.value?.includes('25') ? `+${count25} Años` : (metrics[0]?.value || `+${count25} Años`),
          label: metrics[0]?.label || 'Liderazgo Regional'
        },
        {
          value: count100 > 0 && metrics[1]?.value?.includes('100') ? `${count100}% Oficial` : (metrics[1]?.value || `${count100}% Oficial`),
          label: metrics[1]?.label || 'Garantía de Fábrica'
        },
        {
          value: count24 > 0 && metrics[2]?.value?.includes('24') ? `${count24}/7` : (metrics[2]?.value || `${count24}/7`),
          label: metrics[2]?.label || 'Soporte Técnico'
        }
      ];
    }
    return [
      { value: `+${count25} Años`, label: 'Liderazgo Regional' },
      { value: `${count100}% Oficial`, label: 'Garantía de Fábrica' },
      { value: `${count24}/7`, label: 'Soporte Técnico' }
    ];
  }, [metrics, count25, count100, count24]);

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {stats.map((stat, idx) => (
        <div
          key={stat.label || idx}
          style={{
            textAlign: 'center',
            background: 'rgba(15, 39, 66, 0.75)',
            backdropFilter: 'blur(12px)',
            border: glowing ? '1.5px solid #38bdf8' : '1px solid rgba(15, 164, 222, 0.25)',
            borderRadius: '20px',
            padding: '24px 28px',
            minWidth: '115px',
            transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: glowing
              ? '0 0 30px rgba(15, 164, 222, 0.45), inset 0 0 15px rgba(56, 189, 248, 0.25)'
              : '0 4px 20px rgba(0,0,0,0.2)',
            transform: glowing ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
            animationDelay: `${idx * 0.1}s`
          }}
        >
          <div style={{
            fontSize: '2.2rem',
            fontWeight: '900',
            color: '#0fa4de',
            textShadow: glowing ? '0 0 20px rgba(56, 189, 248, 0.85)' : 'none',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s, text-shadow 0.3s'
          }}>
            {stat.value}
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', fontWeight: '600' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const HERO_SLIDES = [
  {
    id: 0,
    badge: 'RED REGIONAL DACAS',
    badgeIcon: 'globe',
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
    ]
  },
  {
    id: 1,
    badge: 'SEGURIDAD ZERO TRUST & FIREWALLS FORTINET',
    badgeIcon: 'lock',
    titleLine1: 'Protección Perimetral Avanzada',
    titleLine2: '& Detección de Amenazas con IA',
    titleColor: '#EE3124',
    desc: 'Firewalls NGFW FortiGate con procesamiento SOC4 de ultra baja latencia, SD-WAN seguro y licencias oficiales FortiGuard con entrega inmediata.',
    primaryBtn: { text: 'Explorar Soluciones Security', cat: 'security' },
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
    badgeIcon: 'zap',
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
    badgeIcon: 'phone',
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
];

class ShopErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Shop Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' }}>
            🛍️
          </div>
          <h2 style={{ color: '#0F172A', margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800 }}>
            Actualizando DACAS Shop...
          </h2>
          <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 0 20px', fontSize: '14px' }}>
            Se ha actualizado la configuración regional del catálogo. Presioná el botón a continuación para recargar la vista.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{
              background: '#0FA4DE',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 28px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
            }}
          >
            Recargar Catálogo DACAS 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Product Carousel Component for Home View ── */
function ProductCarousel({
  title,
  subtitle,
  badge,
  badgeColor = '#0fa4de',
  icon = 'star',
  products = [],
  clientUser,
  selectedCountryCode,
  selectedCountryObj,
  onSelectProduct,
  onAddToCart,
  justAddedId,
  onOpenAuth,
  onViewAll
}) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -317 : 317;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Carrusel dinámico: si tiene más de 4 productos, se va desplazando automáticamente
  useEffect(() => {
    if (!products || products.length <= 4 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // Si llegó cerca del final, vuelve al inicio para bucle continuo
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 317, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [products, isHovered]);

  if (!products || products.length === 0) return null;

  const isDynamic = products.length > 4;

  return (
    <section style={{ margin: '36px 0 46px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {badge && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: `${badgeColor}18`,
                color: badgeColor,
                border: `1px solid ${badgeColor}33`,
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 12px',
                borderRadius: '999px',
                letterSpacing: '0.05em'
              }}>
                <BrandingVectorIcon name={icon} size={12} color={badgeColor} />
                <span>{badge}</span>
              </div>
            )}
            {isDynamic && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '750',
                color: isHovered ? '#64748B' : '#0fa4de',
                background: isHovered ? '#F1F5F9' : '#F0F9FF',
                border: `1px solid ${isHovered ? '#CBD5E1' : '#BAE6FD'}`,
                padding: '3px 10px',
                borderRadius: '999px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isHovered ? '#94A3B8' : '#0fa4de',
                  boxShadow: isHovered ? 'none' : '0 0 6px #0fa4de'
                }} />
                <span>{isHovered ? 'Pausado' : 'Dinámico'}</span>
              </div>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#071524', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '5px 0 0', fontSize: '0.92rem', color: '#64748B' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onViewAll && (
            <button
              onClick={onViewAll}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                color: '#0fa4de',
                fontWeight: '750',
                fontSize: '13px',
                padding: '8px 16px',
                borderRadius: '999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.background = '#F0F9FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <span>Ver todos</span>
              <span>→</span>
            </button>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleScroll('left')}
              aria-label="Anterior"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#071524',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
            >
              ‹
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Siguiente"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#071524',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          display: 'flex',
          gap: '22px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '6px 4px 18px',
          margin: '0 -4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {products.map((product) => (
          <div key={`carousel-p-${product.id}`} style={{ flex: '0 0 295px', width: '295px', minWidth: '295px', height: '490px' }}>
            <ProductCard
              product={product}
              clientUser={clientUser}
              selectedCountryCode={selectedCountryCode}
              selectedCountryObj={selectedCountryObj}
              onOpenAuth={onOpenAuth}
              onSelectProduct={() => onSelectProduct(product)}
              onAddToCart={(e) => {
                e.stopPropagation();
                onAddToCart(product, 1);
              }}
              justAdded={justAddedId === product.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Brand Promo Banners Component (2 o 3 Banners Promocionales de Marcas) ── */
function BrandPromoBanners({ banners = [], onBrandClick }) {
  const activeBanners = useMemo(() => {
    if (Array.isArray(banners) && banners.length > 0) {
      const filtered = banners.filter(b => b.enabled !== false);
      if (filtered.length > 0) return filtered.slice(0, 3);
    }
    return [
      {
        id: 'fortinet',
        brand: 'Fortinet',
        badge: 'CIBERSEGURIDAD LÍDER',
        title: 'Firewalls Next-Gen FortiGate',
        subtitle: 'Seguridad convergente de red, SD-WAN y prevención de amenazas por IA',
        accentColor: '#EE3124',
        bgGradient: 'linear-gradient(135deg, #180908 0%, #2b1210 50%, #071524 100%)',
        buttonText: 'Ver Soluciones Fortinet'
      },
      {
        id: 'vertiv',
        brand: 'Vertiv',
        badge: 'INFRAESTRUCTURA CRÍTICA',
        title: 'Sistemas UPS Liebert & Energía',
        subtitle: 'Continuidad operativa de centros de datos, racks y climatización de precisión',
        accentColor: '#FF4500',
        bgGradient: 'linear-gradient(135deg, #1a0d05 0%, #29180c 50%, #071524 100%)',
        buttonText: 'Ver Soluciones Vertiv'
      },
      {
        id: 'mikrotik',
        brand: 'MikroTik',
        badge: 'NETWORKING & ROUTING',
        title: 'Routers & Switches Carrier 10G/40G',
        subtitle: 'Máximo rendimiento por puerto, RouterOS y despliegues para ISPs',
        accentColor: '#00A4EF',
        bgGradient: 'linear-gradient(135deg, #051929 0%, #0c2538 50%, #071524 100%)',
        buttonText: 'Ver Soluciones MikroTik'
      }
    ];
  }, [banners]);

  if (activeBanners.length === 0) return null;

  return (
    <section style={{ margin: '30px 0 46px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeBanners.length === 1 ? '1fr' : activeBanners.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '22px'
      }}>
        {activeBanners.map((banner, idx) => {
          const accent = banner.accentColor || '#0fa4de';
          const bg = banner.bgGradient || 'linear-gradient(135deg, #071524 0%, #1e293b 100%)';

          return (
            <div
              key={banner.id || idx}
              onClick={() => onBrandClick(banner.brand)}
              style={{
                position: 'relative',
                background: bg,
                borderRadius: '24px',
                padding: '28px 26px',
                cursor: 'pointer',
                overflow: 'hidden',
                border: `1.5px solid ${accent}33`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '215px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.boxShadow = `0 18px 40px rgba(0,0,0,0.22), 0 0 25px ${accent}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = `${accent}33`;
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
              }}
            >
              {/* Glow Accent Background Circle */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              <div>
                {/* Badge & Brand */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: `${accent}25`,
                    color: '#ffffff',
                    border: `1px solid ${accent}55`,
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }} />
                    {banner.badge || 'PARTNER OFICIAL'}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {banner.brand}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 style={{
                  margin: '0 0 8px',
                  color: '#ffffff',
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em'
                }}>
                  {banner.title}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#CBD5E1',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  maxWidth: '380px'
                }}>
                  {banner.subtitle}
                </p>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: accent,
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  boxShadow: `0 4px 14px ${accent}44`,
                  transition: 'all 0.2s'
                }}>
                  <span>{banner.buttonText || `Explorar ${banner.brand}`}</span>
                  <span>→</span>
                </span>
                <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '600' }}>
                  Stock y precios B2B
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Brands Directory View Component (Sección Dedicada de Marcas Oficiales) ── */
function BrandsDirectoryView({
  products = [],
  categoryBrandsMap = {},
  categories = [],
  brandSearch = '',
  setBrandSearch,
  brandCatFilter = 'all',
  setBrandCatFilter,
  onSelectBrand,
  selectedCountryCode,
  isBrandAllowedInCountry,
  visualSettings = null
}) {
  const brandList = useMemo(() => {
    const keysSet = new Set(Object.keys(BRAND_INFO));
    if (visualSettings?.brandCustomInfo) {
      Object.keys(visualSettings.brandCustomInfo).forEach(k => keysSet.add(k.toLowerCase()));
    }
    products.forEach(p => {
      if (p.brand && !DISALLOWED_BRANDS.includes(p.brand.toLowerCase())) {
        keysSet.add(p.brand.toLowerCase());
      }
    });

    const list = Array.from(keysSet)
      .filter(k => !DISALLOWED_BRANDS.includes(k.toLowerCase()))
      .filter(k => isBrandAllowedInCountry(k, brandCatFilter, selectedCountryCode))
      .map(key => {
        const info = BRAND_INFO[key] || {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          logo: null,
          tagline: `Soluciones y equipamiento oficial ${key.toUpperCase()}`,
          color: '#0fa4de',
          bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
        };

        const custom = visualSettings?.brandCustomInfo?.[key];
        const finalName = (custom && custom.name) ? custom.name : (info.name || key);
        const finalLogo = (custom && custom.logo !== undefined && custom.logo !== '') ? custom.logo : (info.logo || null);
        const finalTagline = (custom && custom.tagline) ? custom.tagline : info.tagline;
        const finalColor = (custom && custom.color) ? custom.color : (info.color || '#0fa4de');

        const cats = [];
        Object.entries(categoryBrandsMap).forEach(([catKey, brands]) => {
          if (Array.isArray(brands)) {
            const hasIt = brands.some(item => {
              const bName = typeof item === 'string' ? item : item?.name;
              return bName && bName.toLowerCase() === key.toLowerCase();
            });
            if (hasIt) cats.push(catKey);
          }
        });

        const brandProducts = products.filter(p => p.brand && p.brand.toLowerCase() === key.toLowerCase());
        const productCount = brandProducts.length;
        const subcategories = Array.from(new Set(brandProducts.map(p => (p.subcategory || '').trim()).filter(Boolean)));

        return {
          ...info,
          key,
          name: finalName,
          logo: finalLogo,
          tagline: finalTagline,
          color: finalColor,
          rawName: finalName,
          categories: cats,
          subcategories,
          productCount
        };
      });

    let filtered = list;
    if (brandCatFilter !== 'all') {
      filtered = filtered.filter(b => b.categories.includes(brandCatFilter));
    }

    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase().trim();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.tagline?.toLowerCase().includes(q) ||
        b.key.includes(q)
      );
    }

    return filtered.sort((a, b) => (b.productCount - a.productCount) || a.name.localeCompare(b.name));
  }, [products, categoryBrandsMap, brandSearch, brandCatFilter, selectedCountryCode, isBrandAllowedInCountry]);

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 164, 222, 0.12)',
          color: '#0fa4de',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '0.05em',
          marginBottom: '14px'
        }}>
          <BrandingVectorIcon name="award" size={14} color="#0fa4de" />
          <span>ALIANZAS & DISTRIBUCIÓN OFICIAL DIRECTA</span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: '900', color: '#071524', letterSpacing: '-0.02em' }}>
          Marcas & Fabricantes Partners
        </h1>
        <p style={{ margin: '0 auto', fontSize: '1rem', color: '#64748B', maxWidth: '720px', lineHeight: 1.6 }}>
          Accedé al ecosistema de soluciones tecnológicas más robusto del mercado. Cada fabricante cuenta con garantía directa de fábrica, soporte de ingeniería preventa y despacho regional asegurado.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Buscar por marca o fabricante (ej: Fortinet, Vertiv, MikroTik, Avaya...)"
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              padding: '0 44px 0 16px',
              fontSize: '14px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {brandSearch && (
            <button
              onClick={() => setBrandSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginRight: '4px' }}>Área Tecnológica:</span>
          {[
            { key: 'all', label: 'Todas las Marcas' },
            { key: 'security', label: 'Ciberseguridad' },
            { key: 'networking', label: 'Networking' },
            { key: 'infraestructura', label: 'Infraestructura' },
            { key: 'comunicaciones_unificadas', label: 'Comunicaciones Unificadas' }
          ].map(cat => {
            const isSel = brandCatFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setBrandCatFilter(cat.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: isSel ? '800' : '600',
                  border: isSel ? '1.5px solid #0fa4de' : '1px solid #E2E8F0',
                  background: isSel ? '#0fa4de' : '#F8FAFC',
                  color: isSel ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSel ? '0 2px 8px rgba(15, 164, 222, 0.3)' : 'none'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Brand Cards */}
      {brandList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No encontramos marcas con ese criterio</h3>
          <p style={{ margin: 0, color: '#64748B' }}>Probá quitando el filtro de búsqueda o cambiando el área tecnológica.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {brandList.map(b => (
            <div
              key={b.key}
              onClick={() => onSelectBrand(b.rawName)}
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                border: '1.5px solid #E2E8F0',
                padding: '26px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = b.color || '#0fa4de';
                e.currentTarget.style.boxShadow = `0 14px 34px rgba(0,0,0,0.08), 0 0 0 1px ${b.color || '#0fa4de'}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                {/* Brand Logo & Product Count Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: b.bg || 'rgba(15, 164, 222, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <BrandLogoImg src={b.logo} alt={b.name} name={b.name} color={b.color} size={36} />
                  </div>

                  <span style={{
                    background: b.productCount > 0 ? 'rgba(15, 164, 222, 0.1)' : '#F1F5F9',
                    color: b.productCount > 0 ? (b.color || '#0fa4de') : '#94A3B8',
                    fontWeight: '800',
                    fontSize: '11.5px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    border: `1px solid ${b.productCount > 0 && b.color ? `${b.color}33` : 'rgba(0,0,0,0.06)'}`
                  }}>
                    {b.productCount} {b.productCount === 1 ? 'Producto' : 'Productos'}
                  </span>
                </div>

                {/* Name & Tagline */}
                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: '800', color: '#071524' }}>
                  {b.name}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                  {b.tagline}
                </p>

                {/* Subcategorías disponibles en este país */}
                {b.subcategories && b.subcategories.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {b.subcategories.map(sub => (
                      <span
                        key={sub}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBrand(b.rawName, sub);
                        }}
                        style={{
                          background: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          color: '#0369A1',
                          fontSize: '11px',
                          fontWeight: '750',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0fa4de';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F0F9FF';
                          e.currentTarget.style.color = '#0369A1';
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: b.color || '#0fa4de'
                }}>
                  <span>Ver Productos</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShopMain() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    try {
      return localStorage.getItem('dacas_selected_country') || 'AR';
    } catch {
      return 'AR';
    }
  });

  const selectedCountryObj = DACAS_COUNTRIES.find((c) => c.code === selectedCountryCode) || DACAS_COUNTRIES[1];

  const [visualSettings, setVisualSettings] = useState(null);

  const heroSlides = useMemo(() => {
    const raw = (visualSettings?.heroSlides && Array.isArray(visualSettings.heroSlides) && visualSettings.heroSlides.length > 0)
      ? visualSettings.heroSlides
      : HERO_SLIDES;
    return raw.map((s, idx) => ({
      ...s,
      id: s.id !== undefined && s.id !== null ? s.id : idx,
      metrics: (Array.isArray(s.metrics) && s.metrics.length > 0) ? s.metrics : [
        { value: '+25 Años', label: 'Liderando el Mercado IT' },
        { value: '12 Países', label: 'Cobertura Regional' },
        { value: '24/7', label: 'Soporte y Garantía Oficial' }
      ]
    }));
  }, [visualSettings]);

  const categories = useMemo(() => {
    if (visualSettings?.categories && Array.isArray(visualSettings.categories) && visualSettings.categories.length > 0) {
      return visualSettings.categories.filter(c => c.enabled !== false);
    }
    return CATEGORIES;
  }, [visualSettings]);

  const categoryBrandsMap = useMemo(() => {
    return visualSettings?.categoryBrands || CATEGORY_BRANDS_MAP;
  }, [visualSettings]);

  const announcement = visualSettings?.announcement || {
    enabled: true,
    text: 'Distribución Oficial y Soporte Certificado en 12 Países de América Latina y USA',
    badgeText: 'COBERTURA DACAS',
    link: '#paises'
  };

  const generalSettings = visualSettings?.general || {
    shopTitle: 'DACAS B2B Shop',
    shopSubtitle: 'Plataforma Corporativa de Soluciones IT, Ciberseguridad & Conectividad Enterprise',
    showCountryBar: true,
    contactPhone: '+54 11 4110-3300',
    contactEmail: 'ventas@dacas.com',
    whatsappNumber: '+5491141103300',
    headerBadge: 'DISTRIBUIDOR OFICIAL MAYORISTA',
    primaryColor: '#0fa4de'
  };

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const slideTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [isHeroHovered, heroSlides.length]);

  useEffect(() => {
    try {
      localStorage.setItem('dacas_shop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [addedId, setAddedId] = useState(null);

  // Vistas principales: 'home' (Principal con carruseles y banners) | 'brands' (Directorio completo de marcas) | 'catalog' (Catálogo paginado)
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogSort, setCatalogSort] = useState('relevance');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandCatFilter, setBrandCatFilter] = useState('all');

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val && val.trim()) {
      setActiveNavTab('catalog');
      setCatalogPage(1);
    }
  };

  const handleGoHome = () => {
    setActiveNavTab('home');
    setSearch('');
    setSelectedBrand(null);
    setSelectedSubcategory(null);
    setActiveCategory('all');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBrands = () => {
    setActiveNavTab('brands');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoCatalog = (category = 'all', brand = null, subcategory = null) => {
    setActiveNavTab('catalog');
    setActiveCategory(category);
    setSelectedBrand(brand);
    setSelectedSubcategory(subcategory);
    setCatalogPage(1);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName, subcategory = null) => {
    setSelectedBrand(brandName);
    setSelectedSubcategory(subcategory);
    setActiveCategory('all');
    setActiveNavTab('catalog');
    setCatalogPage(1);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado y navegación a la Página Dedicada de Producto
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
      setActiveNavTab('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('p', product.id);
        window.history.pushState({ productId: product.id }, '', url.toString());
      } catch (_) {}

      try {
        const token = localStorage.getItem('dacas_client_token');
        fetch(`${API_BASE_URL}/api/ecommerce/track/product-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            brand: product.brand,
            price: product.promotional_price || product.price,
            category: product.category,
            user: clientUser ? { nombre: clientUser.name, email: clientUser.email, rol: 'cliente' } : undefined
          })
        }).catch(() => { });
      } catch (_) { }
    }
  };

  const handleBackFromProduct = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    setActiveNavTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cargar producto automáticamente si viene en URL ?p=ID
  useEffect(() => {
    if (!products || products.length === 0) return;
    try {
      const url = new URL(window.location.href);
      const pid = url.searchParams.get('p');
      if (pid) {
        const found = products.find(p => String(p.id) === String(pid));
        if (found) {
          setSelectedProduct(found);
          setActiveNavTab('product');
        }
      }
    } catch (_) {}
  }, [products]);

  // Manejar navegación con botones Atrás y Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      try {
        const url = new URL(window.location.href);
        const pid = url.searchParams.get('p');
        if (pid && products && products.length > 0) {
          const found = products.find(p => String(p.id) === String(pid));
          if (found) {
            setSelectedProduct(found);
            setActiveNavTab('product');
            return;
          }
        }
        if (activeNavTab === 'product') {
          setActiveNavTab('home');
        }
      } catch (_) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, activeNavTab]);


  // Cliente Auth & Registro B2B
  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Escuchar cambios de autenticación en tiempo real
  useEffect(() => {
    const handleAuthSync = () => {
      try {
        const saved = localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user');
        setClientUser(saved ? JSON.parse(saved) : null);
      } catch {
        setClientUser(null);
      }
    };
    window.addEventListener('storage', handleAuthSync);
    return () => window.removeEventListener('storage', handleAuthSync);
  }, []);

  const userCountryCode = (
    clientUser?.country_code ||
    (clientUser?.country_id === 4 ? 'CL' : clientUser?.country_id === 5 ? 'CO' : 'AR') ||
    'AR'
  ).toUpperCase();
  const userCountryObj = DACAS_COUNTRIES.find((c) => c.code === userCountryCode) || DACAS_COUNTRIES[1];

  const [showCountryBlockedModal, setShowCountryBlockedModal] = useState(false);
  const [attemptedCountry, setAttemptedCountry] = useState(null);

  // Sincronizar y forzar el país de la cuenta registrada si el cliente está logueado
  useEffect(() => {
    if (clientUser && userCountryCode) {
      if (selectedCountryCode !== userCountryCode) {
        setSelectedCountryCode(userCountryCode);
        try {
          localStorage.setItem('dacas_selected_country', userCountryCode);
          window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: userCountryCode } }));
        } catch {}
        fetchProducts(userCountryCode);
      }
    }
  }, [clientUser, userCountryCode, selectedCountryCode]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    razon_social: '',
    tipo_cliente: 'Integrador IT / Reseller',
    phone: '',
    numero_nit: '',
    country_id: String(selectedCountryObj?.id || 2),
    country_code: selectedCountryCode || 'AR',
    ciudad: '',
    direccion_legal: ''
  });

  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (selectedCountryObj && selectedCountryObj.id) {
      setAuthForm(prev => ({
        ...prev,
        country_id: String(selectedCountryObj.id),
        country_code: selectedCountryObj.code
      }));
    }
  }, [selectedCountryObj]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCountryCode);
    fetchVisualSettings(selectedCountryCode);
  }, [selectedCountryCode]);

  const fetchVisualSettings = async (targetCountry = selectedCountryCode) => {
    try {
      const code = targetCountry || selectedCountryCode || 'AR';
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        setVisualSettings(data);
      }
    } catch (_) { }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/countries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      }
    } catch (_) { }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const payload = {
        ...authForm,
        country_code: authForm.country_code || selectedCountryCode || 'AR',
        country_id: authForm.country_id || selectedCountryObj?.id || 2
      };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar solicitud de registro');
      }

      setAuthSuccessMessage({
        title: '¡Solicitud de Registro Enviada con Éxito!',
        body: 'Su solicitud de alta de cuenta ha sido recibida por el equipo de administración de DACAS. Una vez revisada y activada su cuenta por un administrador, se le habilitará el acceso y lista de precios mayorista.',
        email: authForm.email,
        company: authForm.razon_social || authForm.name
      });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Login exitoso
      localStorage.setItem('dacas_client_user', JSON.stringify(data.user));
      localStorage.setItem('dacas_client_token', data.token);
      setClientUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ ...authForm, password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dacas_client_user');
    localStorage.removeItem('dacas_client_token');
    setClientUser(null);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    fetchProducts(selectedCountryCode);
  }, [clientUser, selectedCountryCode]);

  const fetchProducts = async (targetCountry = selectedCountryCode) => {
    try {
      const activeCode = targetCountry || selectedCountryCode || 'AR';
      const token = localStorage.getItem('dacas_client_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/products?country=${activeCode}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize images property and filter disallowed brands
          const normalized = data
            .filter((p) => !p.brand || !DISALLOWED_BRANDS.includes(p.brand.toLowerCase()))
            .map((p) => {
              const mainImg = p.image_url || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '');
              const secImgs = Array.isArray(p.secondary_images) ? p.secondary_images : [];
              let combined = [];
              if (mainImg) combined.push(mainImg);
              secImgs.forEach((img) => {
                if (img && !combined.includes(img)) combined.push(img);
              });
              if (combined.length === 0 && Array.isArray(p.images) && p.images.length > 0) {
                combined = p.images;
              }
              return {
                ...p,
                image_url: mainImg,
                images: combined
              };
            });
          setProducts(normalized);
          setLoading(false);
          return;
        }
      }
    } catch (_) { }

    // Fallback to rich DACAS mock with lock simulation if no clientUser
    const cleanMocks = MOCK_PRODUCTS.filter((p) => !p.brand || !DISALLOWED_BRANDS.includes(p.brand.toLowerCase()));
    const token = localStorage.getItem('dacas_client_token');
    if (!token) {
      setProducts(cleanMocks.map((p) => ({ ...p, price: null, promotional_price: null, is_locked: true })));
    } else {
      setProducts(cleanMocks);
    }
    setLoading(false);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const qtyToAdd = parseInt(quantity, 10) || 1;
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i);
      }
      return [...prev, { ...product, qty: qtyToAdd }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Tracking de carritos cargados sin compra
  const lastCartLoggedRef = useRef(null);
  useEffect(() => {
    if (cart && cart.length > 0) {
      const timer = setTimeout(() => {
        const currentCartKey = JSON.stringify(cart.map(i => ({ id: i.id, qty: i.qty })));
        if (lastCartLoggedRef.current !== currentCartKey) {
          lastCartLoggedRef.current = currentCartKey;
          const token = localStorage.getItem('dacas_client_token');
          fetch(`${API_BASE_URL}/api/ecommerce/track/cart-activity`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              items: cart,
              total: cartTotal,
              trigger: 'cart_filled_pending',
              user: clientUser ? { nombre: clientUser.name, email: clientUser.email, rol: 'cliente' } : undefined
            })
          }).catch(() => { });
        }
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [cart, cartTotal, clientUser]);

  const isProductInCat = (p, catKey) => {
    if (!catKey || catKey === 'all') return true;
    const pCat = (p.category || '').toLowerCase();
    if (pCat === catKey.toLowerCase()) return true;
    if (catKey === 'networking') {
      return pCat.includes('network') || pCat.includes('switch') || pCat.includes('wifi') || pCat.includes('wireless') || pCat.includes('router');
    }
    if (catKey === 'infraestructura') {
      return pCat.includes('infra') || pCat.includes('servidor') || pCat.includes('server') || pCat.includes('cloud') || pCat.includes('rack') || pCat.includes('datacenter');
    }
    if (catKey === 'comunicaciones_unificadas') {
      return pCat.includes('comunicacion') || pCat.includes('unificada') || pCat.includes('voip') || pCat.includes('video') || pCat.includes('telef') || pCat.includes('colaboracion');
    }
    if (catKey === 'security') {
      return pCat.includes('secur') || pCat.includes('seguridad') || pCat.includes('firewall') || pCat.includes('ciber') || pCat.includes('licencia');
    }
    return false;
  };

  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    setSelectedBrand(null);
    setSearch('');
  };

  const currentCategoryObj = categories.find((c) => c.key === activeCategory) || categories[0];
  const categoryProducts = products.filter((p) => isProductInCat(p, activeCategory));

  const isBrandAllowedInCountry = (brandName, categoryKey, currentCountryCode) => {
    if (!brandName) return true;
    const bKey = brandName.toLowerCase();

    // 1. Check in visualSettings.categoryBrands
    if (visualSettings?.categoryBrands) {
      const categoriesToCheck = categoryKey && categoryKey !== 'all'
        ? [categoryKey]
        : Object.keys(visualSettings.categoryBrands);

      for (const cat of categoriesToCheck) {
        const list = visualSettings.categoryBrands[cat];
        if (Array.isArray(list)) {
          const found = list.find(item => {
            if (typeof item === 'string') return item.toLowerCase() === bKey;
            return (item?.name || '').toLowerCase() === bKey;
          });
          if (found && typeof found === 'object' && Array.isArray(found.countries) && found.countries.length > 0) {
            return found.countries.includes(currentCountryCode);
          }
        }
      }
    }

    // 2. Check in visualSettings.brandCountries
    if (visualSettings?.brandCountries && visualSettings.brandCountries[bKey]) {
      const allowed = visualSettings.brandCountries[bKey];
      if (Array.isArray(allowed) && allowed.length > 0) {
        return allowed.includes(currentCountryCode);
      }
    }

    return true;
  };

  const availableBrands = useMemo(() => {
    if (activeCategory === 'all') {
      const productBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))
        .filter((b) => !DISALLOWED_BRANDS.includes(b.toLowerCase()))
        .filter((b) => isBrandAllowedInCountry(b, 'all', selectedCountryCode));
      return productBrands.map((bName) => {
        const brandKey = bName.toLowerCase();
        const info = BRAND_INFO[brandKey] || {
          name: bName,
          logo: null,
          tagline: `Equipos y soluciones oficiales ${bName}`,
          color: '#0fa4de',
          bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
        };
        const custom = visualSettings?.brandCustomInfo?.[brandKey];
        const finalName = (custom && custom.name) ? custom.name : (info.name || bName);
        const finalColor = (custom && custom.color) ? custom.color : (info.color || '#0fa4de');
        const count = products.filter((p) => p.brand && p.brand.toLowerCase() === bName.toLowerCase()).length;
        return {
          ...info,
          name: finalName,
          color: finalColor,
          rawName: finalName,
          count
        };
      });
    }

    const rawOfficial = categoryBrandsMap[activeCategory] || [];
    const officialKeys = rawOfficial
      .map(item => (typeof item === 'string' ? item : item?.name || ''))
      .filter(Boolean)
      .map(k => k.toLowerCase())
      .filter(k => isBrandAllowedInCountry(k, activeCategory, selectedCountryCode));

    const productBrands = categoryProducts
      .map((p) => p.brand)
      .filter(Boolean)
      .filter(b => isBrandAllowedInCountry(b, activeCategory, selectedCountryCode));

    const combinedKeys = Array.from(new Set([...officialKeys, ...productBrands.map((b) => b.toLowerCase())]))
      .filter((k) => !DISALLOWED_BRANDS.includes(k.toLowerCase()));

    return combinedKeys.map((key) => {
      const info = BRAND_INFO[key] || {
        name: key.toUpperCase(),
        logo: null,
        tagline: `Equipos y soluciones oficiales ${key}`,
        color: '#0fa4de',
        bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
      };
      const custom = visualSettings?.brandCustomInfo?.[key];
      const finalName = (custom && custom.name) ? custom.name : (info.name || key);
      const finalColor = (custom && custom.color) ? custom.color : (info.color || '#0fa4de');
      const count = categoryProducts.filter((p) => p.brand && p.brand.toLowerCase() === (info.name || key).toLowerCase()).length;
      return {
        ...info,
        name: finalName,
        color: finalColor,
        rawName: finalName,
        count
      };
    });
  }, [activeCategory, categoryProducts, products, categoryBrandsMap, visualSettings, selectedCountryCode]);

  // Productos para Carrusel 1: Productos Destacados
  const featuredProducts = useMemo(() => {
    const config = visualSettings?.homeCarousels?.featured;
    if (config?.productIds && Array.isArray(config.productIds) && config.productIds.length > 0) {
      const selected = products.filter(p => config.productIds.includes(p.id));
      if (selected.length > 0) return selected;
    }
    const explicitlyFeatured = products.filter(p => p.is_featured || p.isFeatured || p.featured || p.badge === 'DESTACADO' || p.badge === 'MÁS VENDIDO');
    if (explicitlyFeatured.length > 0) return explicitlyFeatured;
    return products.slice(0, 8);
  }, [products, visualSettings]);

  // Productos para Carrusel 2: Selección Especial DACAS
  const customCarouselProducts = useMemo(() => {
    const config = visualSettings?.homeCarousels?.custom;
    if (config?.productIds && Array.isArray(config.productIds) && config.productIds.length > 0) {
      const selected = products.filter(p => config.productIds.includes(p.id));
      if (selected.length > 0) return selected;
    }
    const tagged = products.filter(p => p.badge === 'NUEVO' || p.badge === 'ENTERPRISE');
    if (tagged.length >= 3) return tagged;
    if (products.length > 4) return products.slice(2, 10);
    return products;
  }, [products, visualSettings]);

  // Marcas Oficiales para el Slide / Rail de la Home
  const featuredBrandKeys = useMemo(() => {
    const defaultKeys = ['fortinet', 'vertiv', 'mikrotik', 'aruba', 'avaya', 'audiocodes', 'panduit', 'eaton'];
    const keysSet = new Set(defaultKeys);
    if (visualSettings?.brandCustomInfo) {
      Object.keys(visualSettings.brandCustomInfo).forEach(k => {
        if (k && !DISALLOWED_BRANDS.includes(k.toLowerCase())) {
          keysSet.add(k.toLowerCase());
        }
      });
    }
    return Array.from(keysSet).filter(k => isBrandAllowedInCountry(k, 'all', selectedCountryCode));
  }, [visualSettings, selectedCountryCode, isBrandAllowedInCountry]);

  // Catálogo completo filtrado y ordenado para miles de productos
  const sortedAndFilteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (p.brand && DISALLOWED_BRANDS.includes(p.brand.toLowerCase())) return false;
      const q = search.toLowerCase().trim();
      const matchSearch = !search ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q));
      const matchCat = isProductInCat(p, activeCategory);
      const matchBrand = !selectedBrand || selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
      const matchSubcat = !selectedSubcategory || selectedSubcategory === 'all' ||
        (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
      return matchSearch && matchCat && matchBrand && matchSubcat;
    });

    if (catalogSort === 'price_asc') {
      list = [...list].sort((a, b) => ((a.promotional_price || a.price || 0) - (b.promotional_price || b.price || 0)));
    } else if (catalogSort === 'price_desc') {
      list = [...list].sort((a, b) => ((b.promotional_price || b.price || 0) - (a.promotional_price || a.price || 0)));
    } else if (catalogSort === 'name_asc') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [products, search, activeCategory, selectedBrand, selectedSubcategory, catalogSort]);

  // Subcategorías dinámicas disponibles para la marca seleccionada en el país actual
  const availableSubcategoriesForBrand = useMemo(() => {
    if (!selectedBrand || selectedBrand === 'all') return [];
    const brandProducts = products.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    const counts = {};
    brandProducts.forEach(p => {
      const sub = (p.subcategory || '').trim();
      if (sub) {
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products, selectedBrand]);

  // Compatibilidad hacia atrás con referencias existentes a filtered
  const filtered = sortedAndFilteredProducts;

  const totalCatalogPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (catalogPage - 1) * itemsPerPage;
    return sortedAndFilteredProducts.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredProducts, catalogPage, itemsPerPage]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ── Top Regional Countries Flag Bar (12 Países DACAS) ── */}
      <div style={{ background: '#E2E8F0', borderBottom: '1px solid #CBD5E1', padding: '5px 0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <BrandingVectorIcon name="globe" size={14} color="#475569" /> Cobertura Regional DACAS:
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: clientUser ? '#0369a1' : '#0284c7', color: '#ffffff', padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', boxShadow: '0 1px 3px rgba(2,132,199,0.3)' }}>
              <span>{clientUser ? '🔒 Tienda Asignada:' : '📍 Operando en:'} {selectedCountryObj.flag} {selectedCountryObj.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
            {DACAS_COUNTRIES.map((c) => {
              const isSelected = selectedCountryCode === c.code;
              const isLockedForOther = clientUser && userCountryCode !== c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    if (isLockedForOther) {
                      setAttemptedCountry(c);
                      setShowCountryBlockedModal(true);
                      return;
                    }
                    setSelectedCountryCode(c.code);
                    try {
                      localStorage.setItem('dacas_selected_country', c.code);
                      window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: c.code } }));
                    } catch {}
                    fetchProducts(c.code);
                  }}
                  title={isLockedForOther 
                    ? `🔒 Tu cuenta está registrada en ${userCountryObj.name}. Clic para cambiar de usuario si deseas operar en ${c.name}.`
                    : `${c.name} (${c.code}) - Clic para ver catálogo y stock de ${c.name}`
                  }
                  style={{
                    background: isSelected ? '#0fa4de' : 'transparent',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(15, 164, 222, 0.4)' : 'none',
                    transform: isSelected ? 'scale(1.12)' : 'none',
                    opacity: isLockedForOther ? 0.65 : 1
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{c.flag}</span>
                  {isLockedForOther && (
                    <span style={{ fontSize: '9px', marginLeft: '-2px' }}>🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Announcement Bar ── */}
      {announcement.enabled && (
        <div style={{ background: '#071524', color: '#94A3B8', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid rgba(15, 164, 222, 0.15)' }}>
          <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{selectedCountryObj.flag}</span>
              <span><strong>DACAS {selectedCountryObj.name}</strong> · {announcement.text || 'Envíos asegurados y distribución mayorista regional de valor agregado'}</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {generalSettings.contactPhone && (
                <span style={{ color: '#0fa4de', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="phone" size={12} color="#0fa4de" /> {generalSettings.contactPhone}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Sticky Header ── */}
      <header style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '72px', gap: '24px' }}>

          {/* Logo DACAS Shop */}
          <div onClick={handleGoHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              padding: '6px 14px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span>DACAS</span>
            </div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#071524' }}>
                Shop <span style={{ color: '#0fa4de', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise</span>
              </span>
            </div>
          </div>

          {/* Botón Home */}
          <button
            type="button"
            onClick={handleGoHome}
            style={{
              background: activeNavTab === 'home' ? '#E0F2FE' : '#F8FAFC',
              border: '1.5px solid',
              borderColor: activeNavTab === 'home' ? '#0fa4de' : '#E2E8F0',
              borderRadius: '999px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0fa4de',
              fontSize: '13px',
              fontWeight: '800',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="Ir a Inicio"
          >
            <BrandingVectorIcon name="home" size={15} color="#0fa4de" />
            <span>Inicio</span>
          </button>

          {/* Search Bar */}
          <form style={{ flex: 1, minWidth: 0, position: 'relative' }} onSubmit={(e) => e.preventDefault()}>
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              type="text"
              placeholder="Buscar productos por modelo, SKU, tecnología, marca..."
              aria-label="Buscar"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '999px',
                border: '1.5px solid #CBD5E1',
                padding: '0 52px 0 20px',
                fontSize: '14px',
                color: '#0F172A',
                outline: 'none',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0fa4de';
                e.target.style.boxShadow = '0 0 0 4px rgba(15, 164, 222, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#CBD5E1';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
          </form>

          {/* Client Account / B2B Login Trigger */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={userMenuRef}>
            {clientUser ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    cursor: 'pointer',
                    color: '#166534',
                    padding: '6px 14px 6px 8px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '800',
                    overflow: 'hidden'
                  }}>
                    {clientUser.avatar_url ? (
                      <img src={clientUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <BrandingVectorIcon name="building" size={16} color="#ffffff" />
                    )}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '800', fontSize: '13px', color: '#071524' }}>
                      {clientUser.razon_social || clientUser.name}
                    </div>
                  </div>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontWeight: '800'
                  }}>
                    B2B
                  </span>
                  <span style={{ fontSize: '10px', color: '#166534' }}>▼</span>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '290px',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    border: '1px solid #E2E8F0',
                    zIndex: 200,
                    padding: '16px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '20px',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {clientUser.avatar_url ? (
                          <img src={clientUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <BrandingVectorIcon name="building" size={20} color="#ffffff" />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Cliente Mayorista Activo</div>
                        <div style={{ fontWeight: '800', color: '#071524', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {clientUser.razon_social || clientUser.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0fa4de', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {clientUser.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          color: '#0369A1',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <BrandingVectorIcon name="layout" size={14} color="#0369A1" />
                        <span>Mi Portal de Cliente B2B</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <BrandingVectorIcon name="box" size={14} color="#334155" />
                        <span>Mis Compras y Estado</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <BrandingVectorIcon name="building" size={14} color="#334155" />
                        <span>Mi Ficha & Solicitar Cambios</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/admin/erp'); }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #071524 0%, #1e293b 100%)',
                          border: 'none',
                          color: '#38BDF8',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <BrandingVectorIcon name="database" size={14} color="#38BDF8" />
                        <span>Módulo ERP & Administración</span>
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <BrandingVectorIcon name="lock" size={13} color="#DC2626" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAuthError(null); setAuthSuccessMessage(null); setAuthModalOpen(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #0fa4de',
                  cursor: 'pointer',
                  color: '#0fa4de',
                  padding: '9px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(15, 164, 222, 0.12)'
                }}
              >
                <BrandingVectorIcon name="user" size={14} color="#0fa4de" />
                <span>Mi Cuenta / Registro</span>
              </button>
            )}
          </div>

          {/* Cart Trigger */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={cartRef}>
            <button
              id="cart-toggle-btn"
              onClick={() => setCartOpen(!cartOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: cartCount > 0 ? '#E0F2FE' : '#F1F5F9',
                border: '1px solid',
                borderColor: cartCount > 0 ? '#BAE6FD' : '#E2E8F0',
                cursor: 'pointer',
                color: '#071524',
                padding: '10px 16px',
                borderRadius: '999px',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0fa4de" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '-9px',
                    background: '#0fa4de',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '800',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(15, 164, 222, 0.4)'
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ color: '#071524', fontWeight: '800' }}>${cartTotal.toFixed(2)}</span>
            </button>

            {/* Cart Dropdown */}
            {cartOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '380px',
                background: '#fff',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                border: '1px solid #E2E8F0',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'slideDown 0.2s ease-out'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', fontWeight: '800', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Mi Carrito</span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{cartCount} {cartCount === 1 ? 'producto' : 'productos'}</span>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '12px 20px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <BrandingVectorIcon name="shopping-cart" size={32} color="#94A3B8" />
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Tu carrito está vacío</p>
                    </div>
                  ) : cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          <BrandingVectorIcon name="box" size={24} color="#94A3B8" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#071524' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Cant: <strong>{item.qty}</strong> · <span style={{ color: '#0fa4de', fontWeight: '700' }}>${(parseFloat(item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        title="Eliminar"
                      >
                        <BrandingVectorIcon name="x" size={14} color="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontWeight: '800', fontSize: '16px', color: '#071524' }}>
                      <span>Subtotal estimado:</span>
                      <span style={{ color: '#0fa4de' }}>${cartTotal.toFixed(2)} USD</span>
                    </div>
                    <button
                      onClick={() => navigate('/shop/checkout')}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '13px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      Iniciar Compra Segura →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Storefront Navigation Bar ── */}
      <nav style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.2)', position: 'sticky', top: '72px', zIndex: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: '52px', gap: '8px', boxSizing: 'border-box', overflowX: 'auto' }}>
          
          {/* 1. Inicio */}
          <button
            onClick={handleGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: activeNavTab === 'home' ? '800' : '600',
              color: activeNavTab === 'home' ? '#FFFFFF' : '#94A3B8',
              background: activeNavTab === 'home' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: activeNavTab === 'home' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeNavTab === 'home' ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <BrandingVectorIcon name="home" size={15} color={activeNavTab === 'home' ? '#FFFFFF' : '#94A3B8'} />
            <span>Inicio</span>
          </button>

          {/* 2. Marcas Oficiales */}
          <button
            onClick={handleGoBrands}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: activeNavTab === 'brands' ? '800' : '600',
              color: activeNavTab === 'brands' ? '#FFFFFF' : '#94A3B8',
              background: activeNavTab === 'brands' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: activeNavTab === 'brands' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeNavTab === 'brands' ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <BrandingVectorIcon name="award" size={15} color={activeNavTab === 'brands' ? '#FFFFFF' : '#94A3B8'} />
            <span>Marcas</span>
            <span style={{
              background: activeNavTab === 'brands' ? 'rgba(255,255,255,0.25)' : 'rgba(15, 164, 222, 0.2)',
              color: activeNavTab === 'brands' ? '#FFFFFF' : '#38bdf8',
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 7px',
              borderRadius: '999px',
              marginLeft: '2px'
            }}>
              +20
            </span>
          </button>

          {/* 3. Catálogo Completo */}
          <button
            onClick={() => handleGoCatalog('all', null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '800' : '600',
              color: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '#FFFFFF' : '#94A3B8',
              background: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <CategoryIcon name="all" size={15} color={(activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '#FFFFFF' : '#94A3B8'} />
            <span>Catálogo</span>
          </button>

          {/* Separador */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', margin: '0 6px', flexShrink: 0 }} />

          {/* Accesos directos a Categorías principales */}
          {categories.filter(c => c.key !== 'all').map((cat) => {
            const isSelected = activeNavTab === 'catalog' && activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleGoCatalog(cat.key, null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#FFFFFF' : '#94A3B8',
                  background: isSelected ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={cat.key || cat.icon} size={15} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                <span>{cat.label || cat.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── 1. VISTA INICIO (HOME): Hero Slider + Carrusel Destacados + Banners Marcas + Carrusel Especial + Marcas Partners ── */}
      {activeNavTab === 'home' && (
        <div>
          {/* Hero Banner Carousel DACAS */}
          {heroSlides.length > 0 && (() => {
        const slideIndex = currentHeroSlide >= heroSlides.length ? 0 : currentHeroSlide;
        const currentSlideObj = heroSlides[slideIndex] || heroSlides[0] || HERO_SLIDES[0];

        return (
          <div
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0f2742 60%, #12354c 100%)',
              color: '#fff',
              padding: '30px 20px 42px',
              position: 'relative',
              overflow: 'hidden',
              height: '420px',
              minHeight: '420px',
              maxHeight: '420px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Glow dinámico de fondo */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '650px',
              height: '650px',
              background: `radial-gradient(circle, ${currentSlideObj.titleColor || '#0fa4de'}2E 0%, rgba(0,0,0,0) 70%)`,
              pointerEvents: 'none',
              transition: 'background 0.8s ease'
            }} />

            {/* Carousel Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Slide anterior"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 39, 66, 0.7)',
                    border: '1px solid rgba(15, 164, 222, 0.3)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0fa4de'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 39, 66, 0.7)'; e.currentTarget.style.borderColor = 'rgba(15, 164, 222, 0.3)'; }}
                >
                  ‹
                </button>

                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                  aria-label="Siguiente slide"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 39, 66, 0.7)',
                    border: '1px solid rgba(15, 164, 222, 0.3)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0fa4de'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 39, 66, 0.7)'; e.currentTarget.style.borderColor = 'rgba(15, 164, 222, 0.3)'; }}
                >
                  ›
                </button>
              </>
            )}

            {/* Slide Content Container */}
            <div style={{ maxWidth: '1320px', width: '100%', height: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '30px', position: 'relative', zIndex: 1, padding: '0 40px', boxSizing: 'border-box' }}>

              {currentSlideObj.type === 'custom_image' && currentSlideObj.imageUrl ? (
                /* ── Renderizado de Banner Gráfico Completo del Diseñador ── */
                <div
                  onClick={() => currentSlideObj.primaryBtn?.cat && handleSelectCategory(currentSlideObj.primaryBtn.cat)}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentSlideObj.primaryBtn?.cat ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '18px'
                  }}
                >
                  <img
                    src={currentSlideObj.imageUrl}
                    alt={currentSlideObj.titleLine1 || 'Banner Promocional DACAS'}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '348px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '18px',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      border: '1px solid rgba(15, 164, 222, 0.25)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => { if (currentSlideObj.primaryBtn?.cat) e.currentTarget.style.transform = 'scale(1.005)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                  />
                  {currentSlideObj.primaryBtn?.text && (
                    <div style={{ position: 'absolute', bottom: '18px', right: '24px', zIndex: 2 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategory(currentSlideObj.primaryBtn.cat);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '10px 22px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
                        }}
                      >
                        {currentSlideObj.primaryBtn.text} →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Renderizado Estándar Tipográfico & Métricas ── */
                <>
                  {/* Left Text / CTAs */}
                  <div style={{ flex: 1, minWidth: '300px', transition: 'all 0.4s ease' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(15, 164, 222, 0.15)',
                      border: '1px solid rgba(15, 164, 222, 0.4)',
                      color: currentSlideObj.titleColor || '#38bdf8',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      marginBottom: '18px',
                      letterSpacing: '0.05em'
                    }}>
                      <BrandingVectorIcon name={currentSlideObj.badgeIcon || 'shield'} size={14} color={currentSlideObj.titleColor || '#38bdf8'} />
                      <span>{currentSlideObj.badge}</span>
                    </div>
                    <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                      {currentSlideObj.titleLine1} <br />
                      <span style={{ color: currentSlideObj.titleColor || '#0fa4de' }}>
                        {currentSlideObj.titleLine2}
                      </span>
                    </h1>
                    <p style={{ margin: '0 0 20px', color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '520px' }}>
                      {currentSlideObj.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {currentSlideObj.primaryBtn?.text && (
                        <button
                          onClick={() => handleSelectCategory(currentSlideObj.primaryBtn.cat)}
                          style={{
                            background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '999px',
                            padding: '12px 26px',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(15, 164, 222, 0.4)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          {currentSlideObj.primaryBtn.text}
                        </button>
                      )}
                      {currentSlideObj.secondaryBtn?.text && (
                        <button
                          onClick={() => handleSelectCategory(currentSlideObj.secondaryBtn.cat)}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            border: '1px solid rgba(15, 164, 222, 0.3)',
                            borderRadius: '999px',
                            padding: '12px 26px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 164, 222, 0.18)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        >
                          {currentSlideObj.secondaryBtn.text}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Visual / Animated Stats */}
                  {currentSlideObj.type === 'animated_stats' ? (
                    <AnimatedHeroStats active={true} metrics={currentSlideObj.metrics} />
                  ) : (
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      {currentSlideObj.metrics?.map((metric, mIdx) => (
                        <div
                          key={metric.label || mIdx}
                          style={{
                            textAlign: 'center',
                            background: 'rgba(15, 39, 66, 0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(15, 164, 222, 0.25)',
                            borderRadius: '16px',
                            padding: '18px 22px',
                            minWidth: '110px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: currentSlideObj.titleColor || '#0fa4de' }}>
                            {metric.value}
                          </div>
                          <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', fontWeight: '600' }}>
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Carousel Bottom Indicator Dots */}
            {heroSlides.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                zIndex: 10
              }}>
                {heroSlides.map((slide, idx) => (
                  <button
                    key={`hero-dot-${slide.id !== undefined && slide.id !== null ? slide.id : idx}`}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Ir al slide ${idx + 1}`}
                    style={{
                      width: slideIndex === idx ? '28px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: slideIndex === idx ? '#0fa4de' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      padding: 0,
                      boxShadow: slideIndex === idx ? '0 0 10px rgba(15, 164, 222, 0.6)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

          {/* Main Home Content Grid */}
          <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '16px 20px 60px' }}>
            
            {/* Carrusel 1: Productos Destacados */}
            {visualSettings?.homeCarousels?.featured?.enabled !== false && (
              <ProductCarousel
                title={visualSettings?.homeCarousels?.featured?.title || "Productos Destacados & Más Vendidos"}
                subtitle={visualSettings?.homeCarousels?.featured?.subtitle || "Equipamiento enterprise de alta rotación con entrega inmediata"}
                badge="TOP SELLERS"
                badgeColor="#0fa4de"
                icon="star"
                products={featuredProducts}
                clientUser={clientUser}
                selectedCountryCode={selectedCountryCode}
                selectedCountryObj={selectedCountryObj}
                onOpenAuth={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                onSelectProduct={handleSelectProduct}
                onAddToCart={(p, q) => addToCart(p, q)}
                justAddedId={addedId}
                onViewAll={() => handleGoCatalog('all', null)}
              />
            )}

            {/* Espacio para Banners Promocionales de Marcas (2/3 marcas) */}
            <BrandPromoBanners
              banners={visualSettings?.brandBanners}
              onBrandClick={handleSelectBrand}
            />

            {/* Carrusel 2: Productos elegidos nosotros (Selección Especial DACAS) */}
            {visualSettings?.homeCarousels?.custom?.enabled !== false && (
              <ProductCarousel
                title={visualSettings?.homeCarousels?.custom?.title || "Selección Especial DACAS & Novedades"}
                subtitle={visualSettings?.homeCarousels?.custom?.subtitle || "Soluciones tecnológicas recomendadas por nuestro equipo de ingenieros"}
                badge="SELECCIÓN DACAS"
                badgeColor="#10b981"
                icon="shield"
                products={customCarouselProducts}
                clientUser={clientUser}
                selectedCountryCode={selectedCountryCode}
                selectedCountryObj={selectedCountryObj}
                onOpenAuth={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                onSelectProduct={handleSelectProduct}
                onAddToCart={(p, q) => addToCart(p, q)}
                justAddedId={addedId}
                onViewAll={() => handleGoCatalog('all', null)}
              />
            )}

            {/* Rail de Marcas Oficiales Destacadas */}
            <section style={{ margin: '40px 0 20px', background: '#FFFFFF', borderRadius: '24px', padding: '32px 28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(15, 164, 222, 0.1)',
                    color: '#0fa4de',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    <BrandingVectorIcon name="award" size={12} color="#0fa4de" />
                    <span>ALIANZAS & FABRICANTES DIRECTOS</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#071524' }}>
                    Marcas Oficiales DACAS
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                    Distribución oficial regional con garantía de fábrica y soporte certificado.
                  </p>
                </div>

                <button
                  onClick={handleGoBrands}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <span>Ver todas las marcas (+20)</span>
                  <span>→</span>
                </button>
              </div>

              {/* Grid de Marcas Destacadas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '14px' }}>
                {featuredBrandKeys.map((bKey) => {
                  const keyLower = (bKey || '').toLowerCase();
                  const custom = visualSettings?.brandCustomInfo?.[keyLower];
                  const bInfo = BRAND_INFO[keyLower] || { name: bKey.charAt(0).toUpperCase() + bKey.slice(1), color: '#0fa4de' };
                  const finalName = (custom && custom.name) ? custom.name : (bInfo.name || bKey);
                  const finalLogo = (custom && custom.logo !== undefined && custom.logo !== '') ? custom.logo : (bInfo.logo || null);
                  const finalColor = (custom && custom.color) ? custom.color : (bInfo.color || '#0fa4de');

                  return (
                    <div
                      key={keyLower}
                      onClick={() => handleSelectBrand(finalName)}
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        minHeight: '108px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = finalColor;
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.06), 0 0 0 1px ${finalColor}33`;
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                    >
                      <div style={{ height: '42px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                        <BrandLogoImg src={finalLogo} alt={finalName} name={finalName} color={finalColor} size={36} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {finalName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ── 2. VISTA MARCAS DEDICADA: Directorio completo con buscador, filtros y tarjetas de fabricantes ── */}
      {activeNavTab === 'brands' && (
        <BrandsDirectoryView
          products={products}
          categoryBrandsMap={categoryBrandsMap}
          categories={categories}
          brandSearch={brandSearch}
          setBrandSearch={setBrandSearch}
          brandCatFilter={brandCatFilter}
          setBrandCatFilter={setBrandCatFilter}
          onSelectBrand={handleSelectBrand}
          selectedCountryCode={selectedCountryCode}
          isBrandAllowedInCountry={isBrandAllowedInCountry}
          visualSettings={visualSettings}
        />
      )}

      {/* ── 3. VISTA CATÁLOGO COMPLETO: Diagramado para Miles de Productos con Filtros, Ordenamiento y Paginación ── */}
      {activeNavTab === 'catalog' && (
        <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 20px 60px' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span onClick={handleGoHome} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <BrandingVectorIcon name="home" size={13} color="#0fa4de" /> Inicio
            </span>
            <span>/</span>
            <span
              onClick={() => { setActiveCategory('all'); setSelectedBrand(null); setCatalogPage(1); }}
              style={{ cursor: 'pointer', color: activeCategory === 'all' && !selectedBrand ? '#071524' : '#0fa4de', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              Catálogo
            </span>
            {activeCategory !== 'all' && (
              <>
                <span>/</span>
                <span
                  onClick={() => { setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{ cursor: 'pointer', color: !selectedBrand ? '#071524' : '#0fa4de', fontWeight: '700' }}
                >
                  {currentCategoryObj?.label}
                </span>
              </>
            )}
            {selectedBrand && (
              <>
                <span>/</span>
                <span
                  onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    fontWeight: !selectedSubcategory ? '800' : '650',
                    color: !selectedSubcategory ? '#071524' : '#0fa4de',
                    cursor: selectedSubcategory ? 'pointer' : 'default'
                  }}
                >
                  {selectedBrand === 'all' ? 'Todas las Marcas' : selectedBrand}
                </span>
              </>
            )}
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span style={{ fontWeight: '800', color: '#071524' }}>
                  {selectedSubcategory}
                </span>
              </>
            )}
          </div>

          {/* Catalog Top Toolbar: Header, Total Count, Sorting & Items per page */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span>{selectedBrand && selectedBrand !== 'all' ? `Productos ${selectedBrand}` : currentCategoryObj?.label || 'Catálogo de Soluciones'}</span>
                  {selectedSubcategory && (
                    <span style={{ fontSize: '1.05rem', fontWeight: '750', color: '#0fa4de', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '2px 10px', borderRadius: '8px' }}>
                      {selectedSubcategory}
                    </span>
                  )}
                  {selectedBrand && selectedBrand !== 'all' && activeCategory !== 'all' && (
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748B' }}>
                      en {currentCategoryObj?.label}
                    </span>
                  )}
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
                  {sortedAndFilteredProducts.length > 0 ? (
                    <>
                      Mostrando <strong>{(catalogPage - 1) * itemsPerPage + 1} - {Math.min(catalogPage * itemsPerPage, sortedAndFilteredProducts.length)}</strong> de <strong>{sortedAndFilteredProducts.length}</strong> {sortedAndFilteredProducts.length === 1 ? 'producto' : 'productos'} para distribución mayorista
                    </>
                  ) : (
                    '0 productos disponibles para los criterios seleccionados'
                  )}
                </p>
              </div>

              {/* Controles de ordenamiento y cantidad por página */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="catalog-sort" style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Ordenar:</label>
                  <select
                    id="catalog-sort"
                    value={catalogSort}
                    onChange={(e) => { setCatalogSort(e.target.value); setCatalogPage(1); }}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#071524',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="relevance">Más Relevantes</option>
                    <option value="price_asc">Menor Precio</option>
                    <option value="price_desc">Mayor Precio</option>
                    <option value="name_asc">Nombre (A - Z)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="catalog-per-page" style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Por pág:</label>
                  <select
                    id="catalog-per-page"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCatalogPage(1); }}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#071524',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categorías Pills Rápidas */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginRight: '4px' }}>Categoría:</span>
              {categories.map((c) => {
                const isSelected = activeCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => { setActiveCategory(c.key); setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }}
                    style={{
                      padding: '5px 13px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: isSelected ? '800' : '600',
                      border: isSelected ? '1px solid #0fa4de' : '1px solid #E2E8F0',
                      background: isSelected ? '#0fa4de' : '#F8FAFC',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 2px 6px rgba(15, 164, 222, 0.3)' : 'none'
                    }}
                  >
                    {c.label || c.name}
                  </button>
                );
              })}
            </div>

            {/* Selector de Marcas rápido (Pills) */}
            {availableBrands.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginRight: '4px' }}>Marca:</span>
                <button
                  onClick={() => { setSelectedBrand('all'); setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: selectedBrand === 'all' || !selectedBrand ? '800' : '600',
                    border: selectedBrand === 'all' || !selectedBrand ? '1px solid #0fa4de' : '1px solid #E2E8F0',
                    background: selectedBrand === 'all' || !selectedBrand ? '#0fa4de' : '#FFFFFF',
                    color: selectedBrand === 'all' || !selectedBrand ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Todas las Marcas
                </button>
                {availableBrands.map((b) => {
                  const isBSelected = selectedBrand?.toLowerCase() === b.rawName.toLowerCase();
                  return (
                    <button
                      key={b.rawName}
                      onClick={() => { setSelectedBrand(b.rawName); setSelectedSubcategory(null); setCatalogPage(1); }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: isBSelected ? '800' : '600',
                        border: isBSelected ? `1px solid ${b.color || '#0fa4de'}` : '1px solid #E2E8F0',
                        background: isBSelected ? (b.color || '#0fa4de') : '#FFFFFF',
                        color: isBSelected ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {b.name} ({b.count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selector de Subcategorías de la Marca seleccionada */}
            {selectedBrand && selectedBrand !== 'all' && availableSubcategoriesForBrand.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#F0F9FF',
                borderRadius: '12px',
                border: '1.5px solid #BAE6FD'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="layers" size={13} color="#0369a1" />
                  Subcategorías {selectedBrand}:
                </span>
                <button
                  onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: !selectedSubcategory || selectedSubcategory === 'all' ? '800' : '650',
                    border: !selectedSubcategory || selectedSubcategory === 'all' ? '1.5px solid #0fa4de' : '1px solid #BAE6FD',
                    background: !selectedSubcategory || selectedSubcategory === 'all' ? '#0fa4de' : '#FFFFFF',
                    color: !selectedSubcategory || selectedSubcategory === 'all' ? '#FFFFFF' : '#0369a1',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Todas las Subcategorías
                </button>
                {availableSubcategoriesForBrand.map(s => {
                  const isSubSel = selectedSubcategory?.toLowerCase() === s.name.toLowerCase();
                  return (
                    <button
                      key={s.name}
                      onClick={() => { setSelectedSubcategory(s.name); setCatalogPage(1); }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: isSubSel ? '800' : '650',
                        border: isSubSel ? '1.5px solid #0fa4de' : '1px solid #BAE6FD',
                        background: isSubSel ? '#0fa4de' : '#FFFFFF',
                        color: isSubSel ? '#FFFFFF' : '#0369a1',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSubSel ? '0 2px 6px rgba(15, 164, 222, 0.3)' : 'none'
                      }}
                    >
                      {s.name} ({s.count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Filter Chips Bar */}
            {(selectedBrand || selectedSubcategory || activeCategory !== 'all' || search) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px dashed #E2E8F0' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '750', color: '#94A3B8' }}>Filtros activos:</span>
                
                {search && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0F172A', fontWeight: '700' }}>
                    Texto: "{search}"
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {activeCategory !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0369A1', fontWeight: '700' }}>
                    Categoría: {currentCategoryObj?.label}
                    <button onClick={() => { setActiveCategory('all'); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369A1', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {selectedBrand && selectedBrand !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 164, 222, 0.15)', border: '1px solid rgba(15, 164, 222, 0.4)', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0fa4de', fontWeight: '800' }}>
                    Marca: {selectedBrand}
                    <button onClick={() => { setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0fa4de', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {selectedSubcategory && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0369A1', fontWeight: '800' }}>
                    Subcategoría: {selectedSubcategory}
                    <button onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369A1', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('all');
                    setSelectedBrand(null);
                    setSelectedSubcategory(null);
                    setCatalogPage(1);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '11.5px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 6px'
                  }}
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </div>

          {/* Estado de carga o Lista de Productos */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
              <p style={{ fontWeight: '700' }}>Cargando catálogo oficial DACAS...</p>
            </div>
          ) : sortedAndFilteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ marginBottom: '12px' }}>
                <BrandingVectorIcon name="search" size={48} color="#94A3B8" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No encontramos coincidencias</h3>
              <p style={{ margin: 0, color: '#64748B' }}>No se encontraron productos para los filtros seleccionados.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                  setSelectedBrand(null);
                  setCatalogPage(1);
                }}
                style={{ marginTop: '16px', background: '#0fa4de', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: '750', cursor: 'pointer' }}
              >
                Ver todo el catálogo disponible
              </button>
            </div>
          ) : (
            <div>
              {/* Grid de Productos Paginados */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '26px' }}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    clientUser={clientUser}
                    selectedCountryCode={selectedCountryCode}
                    selectedCountryObj={selectedCountryObj}
                    onOpenAuth={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    onSelectProduct={() => handleSelectProduct(product)}
                    onAddToCart={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    justAdded={addedId === product.id}
                  />
                ))}
              </div>

              {/* Controles de Paginación */}
              {totalCatalogPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '44px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setCatalogPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                    disabled={catalogPage === 1}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: catalogPage === 1 ? '#F1F5F9' : '#FFFFFF',
                      color: catalogPage === 1 ? '#94A3B8' : '#071524',
                      cursor: catalogPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '750',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ‹ Anterior
                  </button>

                  {Array.from({ length: totalCatalogPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalCatalogPages ||
                      (pageNum >= catalogPage - 1 && pageNum <= catalogPage + 1)
                    ) {
                      const isCurrent = catalogPage === pageNum;
                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => { setCatalogPage(pageNum); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                          style={{
                            minWidth: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            border: isCurrent ? '1.5px solid #0fa4de' : '1.5px solid #CBD5E1',
                            background: isCurrent ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#FFFFFF',
                            color: isCurrent ? '#FFFFFF' : '#071524',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            boxShadow: isCurrent ? '0 3px 10px rgba(15, 164, 222, 0.35)' : 'none'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === catalogPage - 2 ||
                      pageNum === catalogPage + 2
                    ) {
                      return <span key={`ellipsis-${pageNum}`} style={{ color: '#94A3B8', padding: '0 4px', fontWeight: 'bold' }}>…</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => { setCatalogPage(prev => Math.min(totalCatalogPages, prev + 1)); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                    disabled={catalogPage === totalCatalogPages}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: catalogPage === totalCatalogPages ? '#F1F5F9' : '#FFFFFF',
                      color: catalogPage === totalCatalogPages ? '#94A3B8' : '#071524',
                      cursor: catalogPage === totalCatalogPages ? 'not-allowed' : 'pointer',
                      fontWeight: '750',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Siguiente ›
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ── 4. VISTA DETALLE DE PRODUCTO: Página dedicada con Galería, Ficha Técnica, Stock y Productos Relacionados ── */}
      {activeNavTab === 'product' && selectedProduct && (
        <ProductDetailPageView
          product={selectedProduct}
          allProducts={products}
          clientUser={clientUser}
          selectedCountryCode={selectedCountryCode}
          selectedCountryObj={selectedCountryObj}
          onOpenAuth={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onSelectProduct={handleSelectProduct}
          onGoBack={handleBackFromProduct}
          onGoCatalog={handleGoCatalog}
          visualSettings={visualSettings}
          justAddedId={addedId}
        />
      )}

      {/* ── Trust & Quality Badges ── */}
      <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: '30px', flexWrap: 'wrap' }}>
          {[
            { icon: 'lock', title: 'Distribución Segura', sub: 'Certificación y trazabilidad garantizada', color: '#0FA4DE', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'box', title: 'Stock en Tiempo Real', sub: 'Disponibilidad inmediata para despachos', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'shield', title: 'Garantía Oficial', sub: 'Respaldo directo de fabricantes', color: '#0FA4DE', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'handshake', title: 'Atención a Canales', sub: 'Precios preferenciales para integradores', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
          ].map((b) => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '13px',
                background: b.bg,
                border: `1.5px solid ${b.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(15, 164, 222, 0.08)'
              }}>
                <BrandingVectorIcon name={b.icon} size={22} color={b.color} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>{b.title}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: '#071524', color: '#94A3B8', textAlign: 'center', padding: '32px 20px', fontSize: '13px', borderTop: '1px solid rgba(15, 164, 222, 0.15)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.1rem' }}>DACAS <span style={{ color: '#0fa4de' }}>Shop</span></span>
            <span>· Mayorista de Valor Agregado en Tecnología & Ciberseguridad</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} DACAS {selectedCountryObj?.name || 'Argentina'} · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* ── MODAL DE REGISTRO B2B Y LOGIN DE CLIENTES ── */}
      {authModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => { setAuthModalOpen(false); setAuthError(null); setAuthSuccessMessage(null); }}
          authForm={authForm}
          setAuthForm={setAuthForm}
          onRegisterSubmit={handleRegisterSubmit}
          onLoginSubmit={handleLoginSubmit}
          error={authError}
          success={authSuccessMessage}
          loading={authLoading}
          countries={countries}
        />
      )}

      {/* ── MODAL: CAMBIO DE PAÍS NO AUTORIZADO PARA CLIENTE B2B ── */}
      {showCountryBlockedModal && clientUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 21, 36, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '30px'
            }}>
              🔒
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>
              Cambio de Tienda no Autorizado
            </h3>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 16px',
              margin: '16px 0',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#334155'
            }}>
              <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                🏢 {clientUser.razon_social || clientUser.empresa || clientUser.name}
              </div>
              <div style={{ color: '#64748B', fontSize: '11.5px' }}>
                {clientUser.cuit || clientUser.numero_nit ? `CUIT: ${clientUser.cuit || clientUser.numero_nit} · ` : ''}
                Tienda asignada: <strong>{userCountryObj.flag} {userCountryObj.name}</strong>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px' }}>
              Esta tienda opera de forma exclusiva para <strong>{userCountryObj.name}</strong> bajo su reglamentación fiscal, impositiva (IVA 21%) y despachos desde depósitos nacionales.
              <br /><br />
              Tu cuenta corporativa no está autorizada para operar en la tienda de <strong>{attemptedCountry?.flag} {attemptedCountry?.name}</strong>. Para ingresar a ese mercado, debes cerrar sesión e identificarte con una cuenta corporativa habilitada en ese país.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCountryBlockedModal(false)}
                style={{
                  width: '100%',
                  background: '#0FA4DE',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.3)'
                }}
              >
                Permanecer en Tienda {userCountryObj.flag} {userCountryObj.name}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetCode = attemptedCountry?.code || 'AR';
                  handleLogout();
                  setShowCountryBlockedModal(false);
                  setSelectedCountryCode(targetCode);
                  try {
                    localStorage.setItem('dacas_selected_country', targetCode);
                    window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: targetCode } }));
                  } catch {}
                  fetchProducts(targetCode);
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                style={{
                  width: '100%',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión e Ingresar con cuenta de {attemptedCountry?.flag} {attemptedCountry?.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTÓN DE AYUDA DESPLEGABLE ESTILO MAC (EXCLUSIVO CLIENTES LOGUEADOS) ── */}
      {clientUser && (
        <ShopMacHelpHub
          clientUser={clientUser}
          generalSettings={generalSettings}
          onSelectProduct={setSelectedProduct}
          navigate={navigate}
          onOpenAuth={() => {
            setAuthError(null);
            setAuthSuccessMessage(null);
            setAuthModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

/* ── Unified macOS Dock Fan / Stack Help Hub Widget (Solo Usuarios Logueados + Confirmación de Datos) ── */
function ShopMacHelpHub({ clientUser, generalSettings, onSelectProduct, navigate, onOpenAuth }) {
  if (!clientUser) return null;

  const [isFanOpen, setIsFanOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'ai' | 'whatsapp' | 'support' | 'confirm_data' | null
  const [pendingTargetChannel, setPendingTargetChannel] = useState(null); // 'ai' | 'whatsapp' | 'support' | 'orders'
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [hubHovered, setHubHovered] = useState(false);
  const [botConfig, setBotConfig] = useState(null);

  // Formulario de confirmación de datos
  const [confirmForm, setConfirmForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    cuit: ''
  });

  // Inicializar formulario con los datos del usuario logueado
  useEffect(() => {
    if (clientUser) {
      setConfirmForm({
        company: clientUser.razon_social || clientUser.empresa || clientUser.name || '',
        contactName: clientUser.name || '',
        email: clientUser.email || '',
        phone: clientUser.telefono || clientUser.phone || '',
        cuit: clientUser.cuit || clientUser.documento || 'Verificado'
      });
    } else {
      setDataConfirmed(false);
    }
  }, [clientUser]);

  // n8n AI Agent Chat State
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInputVal, setAiInputVal] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const aiMessagesEndRef = useRef(null);
  const hubRef = useRef(null);

  // Reset/Iniciar mensajes del Copilot con los datos confirmados
  useEffect(() => {
    if (confirmForm.company || clientUser) {
      const companyLabel = confirmForm.company || clientUser?.razon_social || 'su empresa';
      const contactLabel = confirmForm.contactName || clientUser?.name || 'Estimado/a';
      setAiMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `👋 ¡Hola **${contactLabel}** (**${companyLabel}**)! Tus credenciales B2B han sido validadas.\n\nSoy el **Copilot de IA de DACAS B2B**. Puedo consultar stock en tiempo real, recomendarte soluciones de networking y ciberseguridad o preparar cotizaciones directas para tu cuenta.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: []
        }
      ]);
    }
  }, [dataConfirmed, clientUser]);

  // Cargar configuración de n8n bot
  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/api/ecommerce/settings/n8n-bot`)
      .then(res => res.json())
      .then(data => setBotConfig(data))
      .catch(() => { });
  }, []);

  // Scroll automático en el chat de IA
  useEffect(() => {
    if (activeModal === 'ai') {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiIsTyping, activeModal]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        setIsFanOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Interceptor para abrir canales: Requiere Confirmación de Datos
  const handleOpenChannel = (channelId) => {
    setIsFanOpen(false);

    // Si no ha confirmado los datos en esta sesión, pedir confirmación
    if (!dataConfirmed) {
      setPendingTargetChannel(channelId);
      setActiveModal('confirm_data');
      return;
    }

    // Si ya confirmó los datos, abrir el canal directamente
    if (channelId === 'orders') {
      navigate('/shop/portal');
    } else {
      setActiveModal(channelId);
    }
  };

  // Confirmar formulario de datos
  const handleConfirmDataSubmit = (e) => {
    e?.preventDefault();
    if (!confirmForm.company.trim() || !confirmForm.contactName.trim() || !confirmForm.email.trim()) {
      alert('Por favor complete Empresa, Nombre de Contacto y Email.');
      return;
    }

    setDataConfirmed(true);
    const target = pendingTargetChannel || 'ai';
    setPendingTargetChannel(null);

    if (target === 'orders') {
      setActiveModal(null);
      navigate('/shop/portal');
    } else {
      setActiveModal(target);
    }
  };

  // Enviar mensaje al agente de n8n
  const handleSendAiMessage = async (customText = null) => {
    const textToSend = customText || aiInputVal;
    if (!textToSend.trim() || aiIsTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    if (!customText) setAiInputVal('');
    setAiIsTyping(true);

    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/ecommerce/n8n-bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId: clientUser ? `client_${clientUser.id}` : 'b2b_verified',
          userContext: {
            name: confirmForm.contactName || clientUser?.name,
            company: confirmForm.company || clientUser?.razon_social,
            email: confirmForm.email || clientUser?.email,
            phone: confirmForm.phone || clientUser?.telefono,
            cuit: confirmForm.cuit || clientUser?.cuit
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.response,
            recommendedProducts: data.recommendedProducts || [],
            toolUsed: data.toolUsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || 'Error al procesar');
      }
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Disculpa, tuve un inconveniente temporal para conectar con el agente n8n. Por favor prueba con otra consulta o contáctanos directo por WhatsApp.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiIsTyping(false);
    }
  };

  // WhatsApp datos personalizados con la información confirmada
  const rawNumber = generalSettings?.whatsappNumber || '+5491141103300';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const companyInfo = confirmForm.company ? ` desde *${confirmForm.company}* (Contacto: ${confirmForm.contactName})` : '';
  const defaultMsg = `¡Hola DACAS! Me contacto${companyInfo} a través del Shop Mayorista B2B para solicitar asesoramiento comercial y cotizaciones.`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;

  const isWhatsappEnabled = generalSettings?.whatsappEnabled !== false;
  const isAiEnabled = botConfig?.enabled !== false;

  // Acciones del Stack/Fan de Mac
  const fanItems = [
    ...(isAiEnabled ? [{
      id: 'ai',
      label: 'Asistente IA B2B (n8n)',
      badge: 'En Línea',
      badgeColor: '#0fa4de',
      badgeBg: 'rgba(15, 164, 222, 0.15)',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #0fa4de 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(15, 164, 222, 0.45)',
          border: '2px solid #38bdf8'
        }}>
          <BrandingVectorIcon name="bot" size={24} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('ai')
    }] : []),
    ...(isWhatsappEnabled ? [{
      id: 'whatsapp',
      label: 'WhatsApp Comercial',
      badge: 'Directo',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(37, 211, 102, 0.45)',
          border: '2px solid #86efac'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
      ),
      action: () => handleOpenChannel('whatsapp')
    }] : []),
    {
      id: 'support',
      label: 'Mesa de Ayuda & Soporte',
      badge: 'Help Desk',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(2, 132, 199, 0.45)',
          border: '2px solid #7dd3fc',
          color: '#ffffff'
        }}>
          <BrandingVectorIcon name="headphones" size={22} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('support')
    },
    {
      id: 'orders',
      label: 'Mis Compras & Tracking',
      badge: 'Portal B2B',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(99, 102, 241, 0.45)',
          border: '2px solid #c7d2fe',
          color: '#ffffff'
        }}>
          <BrandingVectorIcon name="box" size={22} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('orders')
    }
  ];

  return (
    <div
      ref={hubRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <style>{`
        @keyframes macFanIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes macModalIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mac-fan-pill-hover:hover {
          background: rgba(255, 255, 255, 0.98) !important;
          transform: translateX(-4px) scale(1.03) !important;
          box-shadow: 0 10px 28px rgba(7, 21, 36, 0.22) !important;
        }
        .mac-fan-icon-hover:hover {
          transform: scale(1.12) !important;
        }
      `}</style>

      {/* ── MODAL DE CONFIRMACIÓN DE DATOS (REQUERIDO ANTES DE ASISTENCIA) ── */}
      {activeModal === 'confirm_data' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0a2540 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #10B981'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <BrandingVectorIcon name="clipboard" size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF' }}>Confirmación de Datos</div>
                <div style={{ fontSize: '11px', color: '#86EFAC' }}>Valida tu cuenta B2B para continuar</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <BrandingVectorIcon name="x" size={14} color="#FFFFFF" />
            </button>
          </div>

          <form onSubmit={handleConfirmDataSubmit} style={{ padding: '18px', background: '#F8FAFC' }}>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748B', lineHeight: '1.45' }}>
              Por favor confirma los datos de contacto de tu empresa para asociar tu consulta y cotizaciones:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Razón Social / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={confirmForm.company}
                  onChange={(e) => setConfirmForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Ej: Conectividad SA"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Nombre del Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={confirmForm.contactName}
                  onChange={(e) => setConfirmForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={confirmForm.email}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mail@empresa.com"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    value={confirmForm.phone}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 9 11..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              {confirmForm.cuit && (
                <div style={{ fontSize: '11px', color: '#64748B', background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px' }}>
                  CUIT / ID Fiscal: <strong>{confirmForm.cuit}</strong>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <BrandingVectorIcon name="check" size={16} color="#FFFFFF" />
              <span>Confirmar Datos y Continuar</span>
              <BrandingVectorIcon name="arrow-right" size={14} color="#FFFFFF" />
            </button>
          </form>
        </div>
      )}

      {/* ── 1. MODAL DEL ASISTENTE DE IA (N8N COPILOT) ── */}
      {activeModal === 'ai' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 36px)',
            height: '560px',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #034870 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #0fa4de'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 12px rgba(15, 164, 222, 0.45)'
                }}
              >
                <BrandingVectorIcon name="bot" size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {botConfig?.botName || 'DACAS AI Copilot'}
                  <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.25)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                    n8n Agent
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
                  {confirmForm.company ? `${confirmForm.company} · Online` : 'Online · Asesoría B2B'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveModal('confirm_data')}
                title="Editar / Reconfirmar Datos"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <BrandingVectorIcon name="edit" size={11} color="#ffffff" />
                <span>Datos</span>
              </button>
              <button
                type="button"
                onClick={() => setAiMessages([
                  {
                    id: 'welcome_reset',
                    sender: 'bot',
                    text: `👋 Chat reiniciado para **${confirmForm.company || 'su empresa'}**. ¿Sobre qué producto o solución deseas consultar?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                title="Limpiar Conversación"
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="rotate-ccw" size={14} color="#94A3B8" />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <BrandingVectorIcon name="x" size={14} color="#ffffff" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              background: '#F8FAFC',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {aiMessages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '12px 14px',
                      borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      background: isBot ? '#FFFFFF' : 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: isBot ? '#1E293B' : '#FFFFFF',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      border: isBot ? '1px solid #E2E8F0' : 'none',
                      boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.04)' : '0 3px 10px rgba(15, 164, 222, 0.3)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {m.text}

                    {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: isBot ? '#0369A1' : '#E0F2FE', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <BrandingVectorIcon name="package" size={13} color={isBot ? '#0369A1' : '#E0F2FE'} />
                          <span>Productos Disponibles:</span>
                        </div>
                        {m.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(p);
                              setActiveModal(null);
                            }}
                            style={{
                              background: '#F0F9FF',
                              border: '1px solid #BAE6FD',
                              borderRadius: '10px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              gap: '8px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: '750', fontSize: '11.5px', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: '700' }}>
                                USD ${Number(p.price || 0).toLocaleString()} · Stock: {p.stock > 0 ? `${p.stock} un.` : 'A Pedido'}
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              Ver <BrandingVectorIcon name="arrow-right" size={11} color="#0284c7" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94A3B8', padding: '0 4px' }}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {aiIsTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '14px', width: 'fit-content' }}>
                <span style={{ fontSize: '11px', color: '#0fa4de', fontWeight: '700' }}>Agente n8n consultando catálogo</span>
                <BrandingVectorIcon name="clock" size={13} color="#0fa4de" />
              </div>
            )}
            <div ref={aiMessagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{ padding: '8px 12px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {(botConfig?.suggestedQuestions || [
              'Stock FortiGate 60F',
              'Switches Aruba 24p',
              'Cotizar Lote B2B'
            ]).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendAiMessage(q)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiMessage();
            }}
            style={{
              padding: '10px 14px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={aiInputVal}
              onChange={(e) => setAiInputVal(e.target.value)}
              placeholder="Escribe tu consulta sobre productos o stock..."
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!aiInputVal.trim() || aiIsTyping}
              style={{
                background: aiInputVal.trim() ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 14px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: aiInputVal.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <BrandingVectorIcon name="send" size={14} color="#ffffff" />
            </button>
          </form>
        </div>
      )}

      {/* ── 2. MODAL DE WHATSAPP COMERCIAL ── */}
      {activeModal === 'whatsapp' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '340px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0c233d 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #25D366'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(37, 211, 102, 0.45)'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.084-1.809-.395-1.423-.58-2.339-2.028-2.411-2.12-.07-.093-.578-.77-.578-1.468 0-.698.366-1.041.498-1.183.132-.142.289-.177.386-.177.097 0 .193.001.277.006.09.004.209-.034.327.249.12.288.412 1.004.448 1.077.036.074.06.16.012.256-.048.096-.072.155-.144.238-.073.084-.153.187-.218.252-.072.072-.147.151-.063.295.084.144.373.615.8 1 0 .55.498.922.99 1.139.144.063.228.055.313-.042.084-.097.362-.423.46-.568.097-.145.193-.12.326-.072.133.048.844.398.989.47.145.072.241.108.277.169.036.06.036.353-.108.758z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#FFFFFF' }}>DACAS B2B WhatsApp</div>
                <div style={{ fontSize: '11px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}></span>
                  En línea · Asesoría Comercial
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <BrandingVectorIcon name="x" size={14} color="#FFFFFF" />
            </button>
          </div>

          {/* Body Card */}
          <div style={{ padding: '16px', background: '#F8FAFC' }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '12.5px',
                color: '#334155',
                border: '1px solid #E2E8F0',
                lineHeight: '1.45',
                marginBottom: '14px'
              }}
            >
              ¡Hola <strong>{confirmForm.contactName || 'Cliente'}</strong>! Tu consulta quedará vinculada a <strong>{confirmForm.company}</strong> para respuesta comercial prioritaria.
              <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '6px', textAlign: 'right' }}>
                DACAS Corp · Respuesta prioritaria
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <span>Abrir WhatsApp Web / App</span>
              <span>→</span>
            </a>
          </div>
        </div>
      )}

      {/* ── 3. MODAL DE MESA DE AYUDA & SOPORTE ── */}
      {activeModal === 'support' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '340px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0369a1 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #38bdf8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrandingVectorIcon name="headphones" size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#FFFFFF' }}>Mesa de Ayuda DACAS</div>
                <div style={{ fontSize: '11px', color: '#7dd3fc' }}>Atención B2B Especializada</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <BrandingVectorIcon name="x" size={13} color="#ffffff" />
            </button>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="phone" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Central Telefónica</div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#071524' }}>
                  {generalSettings?.contactPhone || '+54 11 4110-3300'}
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="mail" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Correo de Soporte</div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#071524' }}>
                  {generalSettings?.contactEmail || 'soporte@dacas.com'}
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="clock" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Horario de Atención</div>
                <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#071524' }}>
                  Lunes a Viernes 09:00 - 18:00 hs
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DESPLEGABLE ESTILO ABANICO / PILA DE MAC (DOCK FAN MENU) ── */}
      {isFanOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            right: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px',
            zIndex: 9998,
            pointerEvents: 'auto'
          }}
        >
          {fanItems.map((item, idx) => {
            const delay = (fanItems.length - 1 - idx) * 0.05;
            return (
              <div
                key={item.id}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  animation: `macFanIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Text Capsule / Pill (Estilo Mac Glassmorphism) */}
                <div
                  className="mac-fan-pill-hover"
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    boxShadow: '0 6px 20px rgba(7, 21, 36, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span style={{ fontWeight: '750', fontSize: '13px', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: item.badgeColor,
                        background: item.badgeBg,
                        padding: '2px 7px',
                        borderRadius: '999px'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Circular Icon Pill (Estilo Dock Icon) */}
                <div
                  className="mac-fan-icon-hover"
                  style={{
                    flexShrink: 0,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {item.icon}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. BOTÓN PRINCIPAL FLOTANTE ESTILO MAC ── */}
      <button
        type="button"
        onClick={() => {
          if (activeModal) {
            setActiveModal(null);
          } else {
            setIsFanOpen(!isFanOpen);
          }
        }}
        onMouseEnter={() => setHubHovered(true)}
        onMouseLeave={() => setHubHovered(false)}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: isFanOpen || activeModal
            ? 'linear-gradient(135deg, #071524 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #0fa4de 100%)',
          border: '2px solid rgba(56, 189, 248, 0.6)',
          boxShadow: hubHovered || isFanOpen
            ? '0 10px 28px rgba(15, 164, 222, 0.55), 0 0 0 5px rgba(15, 164, 222, 0.2)'
            : '0 6px 22px rgba(7, 21, 36, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: hubHovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          color: '#FFFFFF',
          outline: 'none'
        }}
        title="Centro de Asistencia y Agentes B2B"
      >
        {isFanOpen || activeModal ? (
          <BrandingVectorIcon name="x" size={24} color="#FFFFFF" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M12 7v2" />
              <path d="M12 13h.01" />
            </svg>
          </div>
        )}

        {/* Pulse Dot Indicator */}
        {!isFanOpen && !activeModal && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              background: clientUser ? '#10B981' : '#38BDF8',
              border: '2px solid #FFFFFF',
              boxShadow: clientUser ? '0 0 0 2px rgba(16, 185, 129, 0.6)' : '0 0 0 2px rgba(56, 189, 248, 0.6)'
            }}
          />
        )}
      </button>
    </div>
  );
}

/* ── Product Card Component ── */
function ProductCard({ product, clientUser, onOpenAuth, onSelectProduct, onAddToCart, justAdded, selectedCountryCode, selectedCountryObj }) {
  const [hovered, setHovered] = useState(false);
  const activeCountryCode = selectedCountryCode || (() => {
    try { return localStorage.getItem('dacas_selected_country') || 'AR'; } catch { return 'AR'; }
  })();
  const activeCountryObj = selectedCountryObj || DACAS_COUNTRIES.find((c) => c.code === activeCountryCode) || DACAS_COUNTRIES[1] || { flag: '🇦🇷', name: 'Argentina' };
  const mainImage = product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? (mainImage && !product.images.includes(mainImage) ? [mainImage, ...product.images] : product.images)
    : (mainImage ? [mainImage] : []);
  const isLocked = !clientUser || product.is_locked || product.price === null || product.price === undefined;

  return (
    <div
      onClick={onSelectProduct}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: hovered ? '#0fa4de' : '#E2E8F0',
        boxShadow: hovered ? '0 16px 36px rgba(15, 164, 222, 0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', height: '210px', minHeight: '210px', maxHeight: '210px', overflow: 'hidden', background: '#F8FAFC' }}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrandingVectorIcon name="package" size={48} color="#94A3B8" />
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: product.badgeColor || '#0fa4de',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '999px',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {product.badge}
          </span>
        )}

        {/* Multiple Photos indicator */}
        {images.length > 1 && (
          <span style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(7, 21, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <BrandingVectorIcon name="camera" size={12} color="#ffffff" />
            <span>{images.length}</span>
          </span>
        )}

        {/* Stock country badge */}
        {product.stock !== undefined && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: product.stock > 0 ? (product.stock <= 10 ? 'rgba(234, 88, 12, 0.95)' : 'rgba(16, 185, 129, 0.95)') : 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '4px 9px',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {product.stock > 0 ? (
              <span>{activeCountryObj.flag} Stock {activeCountryCode}: {product.stock} un.</span>
            ) : (
              <span>{activeCountryObj.flag} Sin stock en {activeCountryObj.name}</span>
            )}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Header tags: Brand, SKU & Discount Rule with normalized height */}
          <div style={{ minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '4px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
              {product.brand && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: '#E0F2FE',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {product.brand}
                </span>
              )}
              {product.subcategory && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '750',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  color: '#0284c7',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {product.subcategory}
                </span>
              )}
              {product.sku && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
              {product.applied_rule ? (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: '#DCFCE7',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                  padding: '1px 7px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <BrandingVectorIcon name="tag" size={10} color="#166534" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.applied_rule.rule_name || product.applied_rule.name || 'Descuento B2B'}
                  </span>
                  {product.discount_percent && <span style={{ flexShrink: 0 }}>(-{product.discount_percent}%)</span>}
                </span>
              ) : null}
            </div>
          </div>

          {/* Title - exactly 2 lines clamped */}
          <h3
            title={product.name}
            style={{
              margin: '0 0 8px',
              fontSize: '14.5px',
              fontWeight: '800',
              color: '#071524',
              lineHeight: '1.35',
              height: '40px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.name}
          </h3>

          {/* Description - exactly 2 lines clamped */}
          <div
            style={{
              margin: '0 0 12px',
              fontSize: '12.5px',
              color: '#64748B',
              lineHeight: '1.45',
              height: '36px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.description ? product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
          </div>
        </div>

        {/* Bottom Price and Add to Cart Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9', minHeight: '52px' }}>
          {isLocked ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontSize: '13px', fontWeight: '800' }}>
                <BrandingVectorIcon name="lock" size={13} color="#0369a1" />
                <span>Precio B2B</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                Canal autorizado
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#071524', lineHeight: 1 }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ minHeight: '16px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                  <>
                    <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ${product.base_price} USD
                    </span>
                    <span style={{ fontSize: '9.5px', background: '#DCFCE7', color: '#166534', fontWeight: '800', padding: '1px 5px', borderRadius: '4px' }}>
                      -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}%
                    </span>
                  </>
                ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                  <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ${product.promotional_price} USD
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {isLocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              style={{
                background: 'linear-gradient(135deg, #071524, #0f2742)',
                color: '#38bdf8',
                border: '1px solid rgba(15, 164, 222, 0.3)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7,21,36,0.2)'
              }}
            >
              <BrandingVectorIcon name="lock" size={13} color="#38bdf8" />
              <span>Ver Precio B2B</span>
            </button>
          ) : (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={onAddToCart}
              style={{
                background: justAdded ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #0fa4de, #0284c7)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {justAdded ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="check" size={14} color="#FFFFFF" /> Agregado
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="plus" size={14} color="#FFFFFF" /> Agregar
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── POP-UP MODAL WITH INTERACTIVE PHOTO CAROUSEL & DETAILS ─── */
function ProductDetailModal({ product, clientUser, onOpenAuth, onClose, onAddToCart }) {
  const mainImage = product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? (mainImage && !product.images.includes(mainImage) ? [mainImage, ...product.images] : product.images)
    : (mainImage ? [mainImage] : []);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isLocked = !clientUser || product.is_locked || product.price === null || product.price === undefined;

  // Keyboard navigation (Escape to close, Arrows to cycle images)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (images.length > 1) {
        if (e.key === 'ArrowRight') setActiveImageIdx(prev => (prev + 1) % images.length);
        if (e.key === 'ArrowLeft') setActiveImageIdx(prev => (prev - 1 + images.length) % images.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 21, 36, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            fontSize: '18px',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
        >
          <BrandingVectorIcon name="x" size={18} color="#475569" />
        </button>

        {/* 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', padding: '36px' }}>

          {/* LEFT COLUMN: CAROUSEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Main Image Viewer */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '360px',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {images.length > 0 ? (
                <img
                  src={images[activeImageIdx]}
                  alt={`${product.name} - Vista ${activeImageIdx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.25s ease-in-out'
                  }}
                />
              ) : (
                <div style={{ color: '#CBD5E1' }}>
                  <BrandingVectorIcon name="package" size={64} color="#CBD5E1" />
                </div>
              )}

              {/* Navigation Arrows (if > 1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    title="Foto anterior"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      fontSize: '20px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    ‹
                  </button>

                  <button
                    onClick={handleNextImage}
                    title="Foto siguiente"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      fontSize: '20px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    ›
                  </button>

                  {/* Photo Index Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(7, 21, 36, 0.75)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {activeImageIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 0' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: activeImageIdx === idx ? '#0fa4de' : '#E2E8F0',
                      boxShadow: activeImageIdx === idx ? '0 0 0 3px rgba(15,164,222,0.2)' : 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      background: '#F8FAFC'
                    }}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Dimensions & Specs Card */}
            {/* Dimensions & Specs Card */}
            {(product.weight || product.width || product.sku) && (
              <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#071524', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BrandingVectorIcon name="layers" size={14} color="#071524" />
                  <span>Especificaciones Físicas</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  {product.brand && <div><strong>Marca:</strong> {product.brand}</div>}
                  {product.sku && <div><strong>SKU:</strong> {product.sku}</div>}
                  {product.weight && parseFloat(product.weight) > 0 && <div><strong>Peso:</strong> {product.weight} kg</div>}
                  {product.width && parseFloat(product.width) > 0 && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Dimensiones:</strong> {product.depth || 0} x {product.width} x {product.height || 0} cm
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS & ADD TO CART */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header tags */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
              {product.brand && (
                <span style={{
                  background: '#E0F2FE',
                  color: '#0369a1',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {product.brand}
                </span>
              )}

              <span style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                DACAS CERTIFIED
              </span>

              {product.stock !== undefined && (
                <span style={{
                  background: product.stock > 0 ? '#DCFCE7' : '#FEE2E2',
                  color: product.stock > 0 ? '#166534' : '#991B1B',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {product.stock > 0 ? (
                    <>
                      <BrandingVectorIcon name="check" size={12} color="#166534" />
                      <span>En Stock ({product.stock} disp.)</span>
                    </>
                  ) : (
                    <>
                      <BrandingVectorIcon name="x" size={12} color="#991B1B" />
                      <span>Agotado</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: '1.65rem', fontWeight: '900', color: '#071524', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            {/* Price Box */}
            {isLocked ? (
              <div style={{ margin: '14px 0 20px', padding: '18px 20px', background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', borderRadius: '16px', border: '1px solid #BAE6FD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <BrandingVectorIcon name="lock" size={20} color="#0369a1" />
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#0369a1' }}>
                    Precios B2B Exclusivos para Canales DACAS
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#0284c7', lineHeight: 1.5 }}>
                  Los precios y condiciones comerciales se calculan en base a tu <strong>Tipo de Cliente</strong>, <strong>País de operación</strong> y <strong>Marca del fabricante</strong>.
                </p>
              </div>
            ) : (
              <div style={{ margin: '14px 0 20px', padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#071524' }}>
                    ${product.price}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>USD</span>

                  {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                    <>
                      <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        ${product.base_price} USD
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}% B2B
                      </span>
                    </>
                  ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                    <>
                      <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        ${product.promotional_price} USD
                      </span>
                      <span style={{ background: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        OFERTA
                      </span>
                    </>
                  ) : null}
                </div>

                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0369a1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <BrandingVectorIcon name="building" size={12} color="#0369a1" />
                  <span>Tarifa aplicada para <strong>{clientUser?.tipo_cliente || 'Integrador'}</strong> · {clientUser?.pais || 'Argentina'} · {product.brand || 'Dacas'}</span>
                </div>
              </div>
            )}

            {/* Description rendered as Rich HTML */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#071524', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Descripción del Producto
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.65',
                  color: '#475569',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '<p>Sin descripción detallada.</p>') }}
              />
            </div>

            {/* Action Area: Locked vs Logged-In Button */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
              {isLocked ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #071524 0%, #0f2742 100%)',
                    color: '#38bdf8',
                    border: '1px solid rgba(15, 164, 222, 0.4)',
                    borderRadius: '14px',
                    padding: '16px 24px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(7, 21, 36, 0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <BrandingVectorIcon name="lock" size={16} color="#38bdf8" />
                  <span>Iniciar Sesión / Solicitar Cuenta B2B para Comprar</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '12px', padding: '4px', border: '1px solid #CBD5E1' }}>
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      style={{ width: '36px', height: '36px', background: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', color: '#071524' }}
                    >
                      -
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: '#071524' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => (product.stock ? Math.min(product.stock, prev + 1) : prev + 1))}
                      style={{ width: '36px', height: '36px', background: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', color: '#071524' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    style={{
                      flex: 1,
                      background: added ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '14px 24px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: added ? '0 4px 15px rgba(16,185,129,0.4)' : '0 4px 15px rgba(15,164,222,0.4)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <BrandingVectorIcon name={added ? "check" : "shopping-cart"} size={16} color="#ffffff" />
                    <span>{added ? '¡Agregado al Carrito!' : `Agregar al Carrito · $${(parseFloat(product.price || 0) * quantity).toFixed(2)}`}</span>
                  </button>
                </div>
              )}

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BrandingVectorIcon name="shield" size={13} color="#64748B" /> Garantía oficial DACAS
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BrandingVectorIcon name="zap" size={13} color="#64748B" /> Despacho inmediato
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BrandingVectorIcon name="file-text" size={13} color="#64748B" /> Facturación A/B oficial
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── PRODUCT DETAIL PAGE VIEW (PÁGINA DEDICADA DE PRODUCTO) ─── */
function ProductDetailPageView({
  product,
  allProducts = [],
  clientUser,
  selectedCountryCode,
  selectedCountryObj,
  onOpenAuth,
  onAddToCart,
  onSelectProduct,
  onGoBack,
  onGoCatalog,
  visualSettings,
  justAddedId
}) {
  const activeCountryCode = selectedCountryCode || (() => {
    try { return localStorage.getItem('dacas_selected_country') || 'AR'; } catch { return 'AR'; }
  })();
  const activeCountryObj = selectedCountryObj || DACAS_COUNTRIES.find((c) => c.code === activeCountryCode) || DACAS_COUNTRIES[1] || { flag: '🇦🇷', name: 'Argentina' };

  const mainImage = product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? (mainImage && !product.images.includes(mainImage) ? [mainImage, ...product.images] : product.images)
    : (mainImage ? [mainImage] : []);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (isLightboxOpen && e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
      if (images.length > 1) {
        if (e.key === 'ArrowRight') setActiveImageIdx(prev => (prev + 1) % images.length);
        if (e.key === 'ArrowLeft') setActiveImageIdx(prev => (prev - 1 + images.length) % images.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isLightboxOpen]);

  const isLocked = !clientUser || product.is_locked || product.price === null || product.price === undefined;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleCopySku = () => {
    if (product.sku) {
      navigator.clipboard?.writeText(product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getCategoryLabel = (catKey) => {
    if (!catKey) return 'Tecnología B2B';
    const found = CATEGORIES.find(c => c.key === catKey || c.id === catKey);
    if (found && found.label) return found.label;
    return catKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Productos Relacionados: Selección manual del administrador o fallback por categoría/marca
  const relatedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0 || !product) return [];

    // 1. Si el administrador seleccionó productos relacionados específicos para este equipo:
    if (Array.isArray(product.related_ids) && product.related_ids.length > 0) {
      const manualMatches = product.related_ids
        .map(id => allProducts.find(p => p.id === id || String(p.id) === String(id)))
        .filter(Boolean);
      if (manualMatches.length > 0) return manualMatches;
    }

    if (Array.isArray(product.related_skus) && product.related_skus.length > 0) {
      const skuMatches = product.related_skus
        .map(s => allProducts.find(p => p.sku && p.sku.toLowerCase() === String(s).toLowerCase()))
        .filter(Boolean);
      if (skuMatches.length > 0) return skuMatches;
    }

    // 2. Fallback dinámico por misma categoría o marca
    const others = allProducts.filter(p => p.id !== product.id);
    const sameCat = others.filter(p => p.category && product.category && String(p.category).toLowerCase() === String(product.category).toLowerCase());
    const sameBrand = others.filter(p => p.brand && product.brand && String(p.brand).toLowerCase() === String(product.brand).toLowerCase());

    const combined = Array.from(new Set([...sameCat, ...sameBrand]));
    if (combined.length >= 4) {
      return combined.slice(0, 10);
    }
    const remaining = others.filter(p => !combined.some(c => c.id === p.id));
    return [...combined, ...remaining].slice(0, 10);
  }, [product, allProducts]);

  const parsedPrice = parseFloat(product.price || 0);
  const parsedBasePrice = product.base_price ? parseFloat(product.base_price) : null;
  const hasDiscount = parsedBasePrice && parsedBasePrice > parsedPrice;
  const discountPct = product.discount_percent || (hasDiscount ? Math.round((1 - parsedPrice / parsedBasePrice) * 100) : null);
  const ivaAmount = parsedPrice * 0.21;
  const priceWithIva = parsedPrice + ivaAmount;

  const whatsappMessage = encodeURIComponent(
    `Hola equipo comercial DACAS Argentina, me interesa solicitar cotización y stock para el siguiente producto:\n\n` +
    `• Equipo: ${product.name}\n` +
    `• SKU: ${product.sku || 'N/A'}\n` +
    `• Marca: ${product.brand || 'DACAS'}\n` +
    `• Cantidad: ${quantity} unidades\n` +
    `• Centro Logístico: ${activeCountryObj.name}`
  );

  return (
    <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '20px 24px 80px' }}>
      {/* ─── BARRA SUPERIOR UNIFICADA DE NAVEGACIÓN Y BREADCRUMB ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px 16px',
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onGoBack}
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              color: '#071524',
              fontWeight: '750',
              fontSize: '12.5px',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; e.currentTarget.style.background = '#F0F9FF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; e.currentTarget.style.background = '#F8FAFC'; }}
          >
            <span>←</span>
            <span>Volver a la Tienda</span>
          </button>

          <span style={{ color: '#E2E8F0', fontSize: '16px' }}>|</span>

          {/* Breadcrumb Path */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
            color: '#64748B',
            flexWrap: 'wrap'
          }}>
            <span onClick={onGoBack} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BrandingVectorIcon name="home" size={13} color="#0fa4de" /> Inicio
            </span>
            <span style={{ color: '#CBD5E1' }}>›</span>
            <span onClick={() => onGoCatalog('all', null)} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700' }}>
              Catálogo
            </span>
            {product.category && (
              <>
                <span style={{ color: '#CBD5E1' }}>›</span>
                <span onClick={() => onGoCatalog(product.category, null)} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700' }}>
                  {getCategoryLabel(product.category)}
                </span>
              </>
            )}
            {product.brand && (
              <>
                <span style={{ color: '#CBD5E1' }}>›</span>
                <span onClick={() => onGoCatalog('all', product.brand)} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700' }}>
                  {product.brand}
                </span>
              </>
            )}
            <span style={{ color: '#CBD5E1' }}>›</span>
            <span style={{ fontWeight: '750', color: '#071524', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </span>
          </nav>
        </div>

        {/* Acciones Rápidas (Copiar SKU & Compartir) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {product.sku && (
            <button
              onClick={handleCopySku}
              title="Copiar SKU al portapapeles"
              style={{
                background: copiedSku ? '#ECFDF5' : '#F8FAFC',
                border: `1px solid ${copiedSku ? '#A7F3D0' : '#E2E8F0'}`,
                color: copiedSku ? '#059669' : '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '750',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <BrandingVectorIcon name={copiedSku ? "check" : "copy"} size={13} color={copiedSku ? "#059669" : "#64748B"} />
              <span>{copiedSku ? '¡SKU Copiado!' : `SKU: ${product.sku}`}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            title="Copiar enlace del producto"
            style={{
              background: copiedUrl ? '#ECFDF5' : '#F8FAFC',
              border: `1px solid ${copiedUrl ? '#A7F3D0' : '#E2E8F0'}`,
              color: copiedUrl ? '#059669' : '#475569',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <BrandingVectorIcon name={copiedUrl ? "check" : "share"} size={13} color={copiedUrl ? "#059669" : "#64748B"} />
            <span>{copiedUrl ? '¡Enlace copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* ─── CONTENEDOR PRINCIPAL DEL PRODUCTO (SHOWCASE 2 COLUMNAS) ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '32px 36px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 46%) minmax(360px, 54%)',
          gap: '40px',
          alignItems: 'start'
        }}>

          {/* ══ COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES PROFESIONAL & BENEFICIOS ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Lienzo Principal de Fotografía */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '430px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '1.5px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.015), 0 2px 10px rgba(0,0,0,0.02)',
                cursor: images.length > 0 ? 'zoom-in' : 'default'
              }}
              onClick={() => { if (images.length > 0) setIsLightboxOpen(true); }}
            >
              {images.length > 0 ? (
                <img
                  src={images[activeImageIdx]}
                  alt={`${product.name} - Vista ${activeImageIdx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '24px',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                />
              ) : (
                <BrandingVectorIcon name="package" size={80} color="#CBD5E1" />
              )}

              {/* Badges Flotantes Superiores */}
              <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px', zIndex: 2 }}>
                {(product.badge || product.is_featured) && (
                  <span style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(15, 164, 222, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⭐</span>
                    <span>{product.badge || 'DESTACADO'}</span>
                  </span>
                )}
              </div>

              {product.stock !== undefined && (
                <span style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: product.stock > 0 ? '#ECFDF5' : '#FEF2F2',
                  border: `1.5px solid ${product.stock > 0 ? '#A7F3D0' : '#FECACA'}`,
                  color: product.stock > 0 ? '#065F46' : '#991B1B',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  zIndex: 2
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: product.stock > 0 ? '#10B981' : '#EF4444'
                  }} />
                  <span>{activeCountryObj.flag} Stock {activeCountryCode}: {product.stock > 0 ? `${product.stock} un.` : 'Sin stock'}</span>
                </span>
              )}

              {/* Botón flotante para Zoom */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                title="Ampliar imagen completa"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: '750',
                  color: '#071524',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  zIndex: 2,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
              >
                <span>🔍</span>
                <span>Ampliar</span>
              </button>

              {/* Flechas de navegación si hay más de 1 imagen */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx(prev => (prev - 1 + images.length) % images.length);
                    }}
                    aria-label="Foto anterior"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      fontSize: '18px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.15s',
                      zIndex: 2
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx(prev => (prev + 1) % images.length);
                    }}
                    aria-label="Foto siguiente"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      fontSize: '18px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.15s',
                      zIndex: 2
                    }}
                  >
                    ›
                  </button>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(7, 21, 36, 0.8)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 12px',
                    borderRadius: '999px',
                    zIndex: 2
                  }}>
                    {activeImageIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Fila de Miniaturas */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '2px 0' }}>
                {images.map((img, idx) => (
                  <div
                    key={`thumb-${idx}`}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2.5px solid #0fa4de' : '1.5px solid #E2E8F0',
                      boxShadow: activeImageIdx === idx ? '0 0 0 3px rgba(15,164,222,0.25)' : 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      background: '#FFFFFF',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ COLUMNA DERECHA: CENTRO COMERCIAL, PRECIOS B2B Y COMPRA ══ */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Metadatos y Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {product.brand && (
                <span style={{
                  background: '#E0F2FE',
                  color: '#0369a1',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '11.5px',
                  fontWeight: '750',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {getCategoryLabel(product.category)}
                </span>
              )}
              {product.subcategory && (
                <span style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  color: '#0369A1',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {product.subcategory}
                </span>
              )}
              <span style={{
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                fontSize: '11px',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: 'auto'
              }}>
                <BrandingVectorIcon name="award" size={12} color="#059669" />
                <span>DISTRIBUIDOR OFICIAL</span>
              </span>
            </div>

            {/* Título Principal */}
            <h1 style={{
              margin: '0 0 10px',
              fontSize: '1.75rem',
              fontWeight: '850',
              color: '#071524',
              lineHeight: 1.28,
              letterSpacing: '-0.02em'
            }}>
              {product.name}
            </h1>

            {/* Calificación y Estado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: '800' }}>
                <span>★★★★★</span>
                <span style={{ color: '#071524', marginLeft: '4px' }}>5.0</span>
              </div>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ color: '#059669', fontWeight: '750' }}>✓ Certificado de fábrica</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span>Condición: <strong>{product.condition || 'Nuevo Sellado'}</strong></span>
            </div>

            {/* Puntos Clave de Ingeniería / Bullet Points Configurados */}
            {(() => {
              let bulletList = [];
              if (Array.isArray(product.highlights)) {
                bulletList = product.highlights.filter(Boolean);
              } else if (typeof product.highlights === 'string' && product.highlights.trim()) {
                bulletList = product.highlights.split(/\r?\n|\|/).map(s => s.trim()).filter(Boolean);
              } else if (Array.isArray(product.features)) {
                bulletList = product.features.filter(Boolean);
              }

              if (bulletList.length === 0) return null;

              return (
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '12px 16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Características Destacadas
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#334155', lineHeight: 1.45 }}>
                    {bulletList.map((bullet, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                        <span style={{ color: '#0fa4de', fontWeight: 'bold' }}>✓</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Tarjeta Comercial B2B de Precio */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #0fa4de',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '14px',
              boxShadow: '0 2px 10px rgba(15,164,222,0.06)'
            }}>
              {isLocked ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '6px' }}>
                    <BrandingVectorIcon name="lock" size={18} color="#0369a1" />
                    <span style={{ fontSize: '15px', fontWeight: '800' }}>Precios Mayoristas B2B Exclusivos</span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                    Accedé con tu cuenta de canal para ver precios preferenciales, líneas de crédito y stock disponible.
                  </p>
                  <button
                    onClick={onOpenAuth}
                    style={{
                      background: 'linear-gradient(135deg, #071524 0%, #0f2742 100%)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontWeight: '750',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <BrandingVectorIcon name="user" size={14} color="#38bdf8" />
                    <span>Iniciar Sesión / Solicitar Cuenta B2B</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#071524', lineHeight: 1 }}>
                      ${product.price}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#64748B' }}>USD</span>
                    <span style={{ background: '#E0F2FE', color: '#0369a1', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      Neto Mayorista B2B
                    </span>
                    {hasDiscount && (
                      <>
                        <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '4px' }}>
                          ${product.base_price} USD
                        </span>
                        <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                          -{discountPct}% Descuento Canal
                        </span>
                      </>
                    )}
                  </div>

                  {/* Detalle Impositivo B2B */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#64748B', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span>+ IVA (21%): <strong>${ivaAmount.toFixed(2)} USD</strong></span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span>Total con IVA: <strong style={{ color: '#071524' }}>${priceWithIva.toFixed(2)} USD</strong></span>
                  </div>

                  {product.applied_rule && (
                    <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px', color: '#065F46', fontSize: '11.5px', fontWeight: '750' }}>
                      <BrandingVectorIcon name="tag" size={11} color="#059669" />
                      <span>{product.applied_rule.rule_name || product.applied_rule.name}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                    * Facturación oficial A o B al tipo de cambio oficial BNA vendedor del día. Precios válidos para integradores y canales registrados.
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilidad de Stock en Tiempo Real */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: product.stock > 0 ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${product.stock > 0 ? '#BBF7D0' : '#FECACA'}`,
              borderRadius: '10px',
              marginBottom: '14px'
            }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: product.stock > 0 ? '#10B981' : '#EF4444',
                boxShadow: product.stock > 0 ? '0 0 6px #10B981' : 'none',
                flexShrink: 0
              }} />
              <div style={{ fontSize: '12px', color: '#071524' }}>
                {product.stock > 0 ? (
                  <span>
                    <strong>Stock Disponible:</strong> {product.stock} unidades listas para despacho inmediato en Centro Logístico DACAS ({activeCountryObj.name}).
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', fontWeight: '700' }}>
                    Sin stock disponible en depósito local. Consultar plazo de arribo o solicitar backorder.
                  </span>
                )}
              </div>
            </div>

            {/* Selector de Cantidad y Agregar al Carrito */}
            {!isLocked && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F1F5F9',
                  borderRadius: '10px',
                  padding: '3px',
                  border: '1.5px solid #CBD5E1'
                }}>
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    aria-label="Restar cantidad"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      fontSize: '18px',
                      color: '#071524',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: '#071524' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => (product.stock ? Math.min(product.stock, prev + 1) : prev + 1))}
                    aria-label="Sumar cantidad"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      fontSize: '18px',
                      color: '#071524',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  style={{
                    flex: '1 1 240px',
                    background: added ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: added ? '0 4px 15px rgba(16,185,129,0.35)' : '0 4px 15px rgba(15,164,222,0.35)',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <BrandingVectorIcon name={added ? "check" : "shopping-cart"} size={16} color="#ffffff" />
                  <span>{added ? '¡Agregado con éxito!' : `Agregar al Carrito · $${(parsedPrice * quantity).toFixed(2)} USD`}</span>
                </button>
              </div>
            )}

            {/* Consulta Directa por WhatsApp */}
            <a
              href={`https://wa.me/5491140000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                color: '#15803D',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: '750',
                fontSize: '12.5px',
                textDecoration: 'none',
                cursor: 'pointer',
                marginBottom: '14px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#DCFCE7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F0FDF4'; }}
            >
              <BrandingVectorIcon name="phone" size={14} color="#15803D" />
              <span>Consultar cotización y disponibilidad por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN DETALLADA: DESCRIPCIÓN & CARACTERÍSTICAS Y DATASHEET ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        padding: '28px 34px',
        marginBottom: '36px'
      }}>
        {/* Cabecera de la Sección */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '2px solid #F1F5F9',
          paddingBottom: '14px',
          marginBottom: '24px'
        }}>
          <BrandingVectorIcon name="file-text" size={20} color="#0fa4de" />
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#071524',
            margin: 0
          }}>
            Descripción &amp; Características
          </h2>
        </div>

        {/* Descripción Detallada */}
        <div style={{ maxWidth: '960px' }}>
          <div
            style={{
              fontSize: '14.5px',
              lineHeight: '1.75',
              color: '#334155'
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                product.description ||
                `<p>${product.name}</p>`
              )
            }}
          />
        </div>

        {/* Ficha Técnica Oficial (Datasheet) */}
        {product.datasheet_url ? (
          <div style={{
            marginTop: '32px',
            padding: '20px 24px',
            borderRadius: '14px',
            border: '1.5px solid #BAE6FD',
            background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
            boxShadow: '0 4px 14px rgba(15,164,222,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '32px' }}>📄</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '850', color: '#071524' }}>
                  Ficha Técnica Oficial (Datasheet)
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px' }}>
                  Especificaciones completas de hardware, diagramas y compatibilidad de {product.brand || 'DACAS'}.
                </div>
              </div>
            </div>
            <a
              href={product.datasheet_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0fa4de',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '800',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(15,164,222,0.25)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0284c7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0fa4de'; }}
            >
              <span>↓ Descargar Ficha Técnica (PDF)</span>
              <span>↗</span>
            </a>
          </div>
        ) : (
          <div style={{
            marginTop: '32px',
            padding: '18px 22px',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📋</span>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#0F172A' }}>
                  Documentación Técnica y Datasheet Oficial
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Solicita el datasheet técnico y diagrama de este equipo a nuestro equipo preventa.
                </div>
              </div>
            </div>
            <a
              href={`https://wa.me/5491141103300?text=${encodeURIComponent(`Hola DACAS, requiero el datasheet técnico oficial para el equipo ${product.name} (SKU: ${product.sku || ''})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '750',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>💬 Solicitar Datasheet por WhatsApp</span>
            </a>
          </div>
        )}
      </div>

      {/* ─── CARRUSEL DE PRODUCTOS RELACIONADOS ─── */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <ProductCarousel
            title="Productos Relacionados"
            subtitle="Equipos complementarios de la misma categoría o tecnología recomendados por DACAS"
            badge="RECOMENDADOS"
            badgeColor="#10B981"
            icon="sparkles"
            products={relatedProducts}
            clientUser={clientUser}
            selectedCountryCode={selectedCountryCode}
            selectedCountryObj={selectedCountryObj}
            onSelectProduct={(p) => {
              onSelectProduct(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={(p, qty) => onAddToCart(p, qty)}
            justAddedId={justAddedId}
            onOpenAuth={onOpenAuth}
            onViewAll={() => onGoCatalog(product.category || 'all', null)}
          />
        </div>
      )}

      {/* ─── MODAL LIGHTBOX DE FOTO EN ALTA RESOLUCIÓN ─── */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(7, 21, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Cerrar vista ampliada"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                color: '#071524',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '15px', fontWeight: '800', color: '#071524', marginBottom: '16px', textAlign: 'center' }}>
              {product.name}
            </div>

            <img
              src={images[activeImageIdx]}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                objectFit: 'contain'
              }}
            />

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                {images.map((img, idx) => (
                  <div
                    key={`modal-thumb-${idx}`}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2px solid #0fa4de' : '1px solid #CBD5E1',
                      cursor: 'pointer',
                      padding: '3px',
                      background: '#FFFFFF'
                    }}
                  >
                    <img src={img} alt="Miniatura" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ─── MODAL DE AUTENTICACIÓN & REGISTRO DE CLIENTES B2B ─── */
function AuthModal({
  mode,
  setMode,
  onClose,
  authForm,
  setAuthForm,
  onRegisterSubmit,
  onLoginSubmit,
  error,
  success,
  loading,
  countries
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 21, 36, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: mode === 'register' ? '640px' : '440px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            fontWeight: 'bold',
            fontSize: '16px',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.background = '#E2E8F0'; e.target.style.color = '#0F172A'; }}
          onMouseLeave={(e) => { e.target.style.background = '#F1F5F9'; e.target.style.color = '#64748B'; }}
        >
          <BrandingVectorIcon name="x" size={16} color="#64748B" />
        </button>

        <div style={{ padding: '28px 32px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#fff',
              fontWeight: '900',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '16px',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(15,164,222,0.3)'
            }}>
              DACAS Enterprise
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#071524' }}>
              {mode === 'register' ? 'Solicitud de Cuenta de Cliente B2B' : 'Acceso a Clientes y Distribuidores'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
              {mode === 'register'
                ? 'Regístrese para acceder a precios mayoristas y soporte técnico oficial'
                : 'Inicie sesión con sus credenciales autorizadas'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            gap: '4px'
          }}>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BrandingVectorIcon name="edit" size={14} color={mode === 'register' ? '#0fa4de' : '#64748B'} />
              <span>Solicitar Registro</span>
            </button>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BrandingVectorIcon name="lock" size={14} color={mode === 'login' ? '#0fa4de' : '#64748B'} />
              <span>Iniciar Sesión</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BrandingVectorIcon name="alert-triangle" size={16} color="#DC2626" />
              <div><strong>Atención:</strong> {error}</div>
            </div>
          )}

          {/* Success Banner (For registration request) */}
          {success ? (
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                <BrandingVectorIcon name="check-circle" size={44} color="#166534" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#166534', fontSize: '18px', fontWeight: '800' }}>
                {success.title}
              </h3>
              <p style={{ margin: '0 0 16px', color: '#15803D', fontSize: '13.5px', lineHeight: '1.6' }}>
                {success.body}
              </p>

              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #DCFCE7', fontSize: '12.5px', color: '#475569', marginBottom: '18px', textAlign: 'left' }}>
                <div><strong>Empresa:</strong> {success.company}</div>
                <div><strong>Email:</strong> {success.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <strong>Estado:</strong>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                  <span style={{ color: '#D97706', fontWeight: '700' }}>Pendiente de Aprobación por Administrador</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setMode('login'); }}
                  style={{
                    flex: 1,
                    background: '#0fa4de',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Ir a Iniciar Sesión
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            /* ── REGISTRATION FORM ── */
            <div>
              {/* B2B Info Box */}
              <div style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
                border: '1px solid #BAE6FD',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <BrandingVectorIcon name="lock" size={20} color="#0369A1" />
                </div>
                <div style={{ fontSize: '12.5px', color: '#0369A1', lineHeight: '1.5' }}>
                  <strong>Distribución Mayorista Exclusiva:</strong> Por políticas comerciales de DACAS, cada solicitud de registro es revisada por nuestro equipo de administración para habilitarle la cuenta, condiciones de pago y lista de precios oficial.
                </div>
              </div>

              <form onSubmit={onRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Gómez"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Razón Social / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Redes & IT Solutions S.A."
                      value={authForm.razon_social}
                      onChange={e => setAuthForm({ ...authForm, razon_social: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Email Corporativo (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contacto@empresa.com"
                      value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+54 11 4444-5555"
                      value={authForm.phone}
                      onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      CUIT / RUT / NIT Fiscal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="30-12345678-9"
                      value={authForm.numero_nit}
                      onChange={e => setAuthForm({ ...authForm, numero_nit: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Tipo de Cliente / Actividad
                    </label>
                    <select
                      value={authForm.tipo_cliente}
                      onChange={e => setAuthForm({ ...authForm, tipo_cliente: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      <option value="Integrador IT / Reseller">Integrador IT / Reseller</option>
                      <option value="Proveedor de Internet (ISP / WISP)">Proveedor de Internet (ISP / WISP)</option>
                      <option value="Consultora IT / Ciberseguridad">Consultora IT / Ciberseguridad</option>
                      <option value="Empresa Corporativa">Empresa Corporativa</option>
                      <option value="Organismo Público">Organismo Público</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      País
                    </label>
                    <select
                      value={authForm.country_id}
                      onChange={e => setAuthForm({ ...authForm, country_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {countries && countries.length > 0 ? (
                        countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      ) : (
                        <option value="1">Argentina</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Ciudad / Localidad
                    </label>
                    <input
                      type="text"
                      placeholder="Buenos Aires, Córdoba..."
                      value={authForm.ciudad}
                      onChange={e => setAuthForm({ ...authForm, ciudad: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                    Contraseña para su cuenta *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '10px',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <BrandingVectorIcon name="mail" size={16} color="#ffffff" />
                  <span>{loading ? 'Enviando Solicitud...' : 'Enviar Solicitud de Registro B2B'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* ── LOGIN FORM ── */
            <form onSubmit={onLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@empresa.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{loading ? 'Validando...' : 'Ingresar a mi Cuenta B2B'}</span>
                <BrandingVectorIcon name="arrow-right" size={14} color="#ffffff" />
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#64748B' }}>
                ¿Aún no tiene cuenta habilitada?{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setMode('register'); }}
                  style={{ color: '#0fa4de', fontWeight: '700', textDecoration: 'none' }}
                >
                  Solicite su alta aquí
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop(props) {
  return (
    <ShopErrorBoundary>
      <ShopMain {...props} />
    </ShopErrorBoundary>
  );
}

