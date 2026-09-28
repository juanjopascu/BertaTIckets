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

const CATEGORIES = [
  { key: 'all', label: 'Todos los productos', icon: 'all' },
  { key: 'networking', label: 'Networking', icon: 'networking' },
  { key: 'infraestructura', label: 'Infraestructura', icon: 'infraestructura' },
  { key: 'comunicaciones_unificadas', label: 'Comunicaciones Unificadas', icon: 'comunicaciones_unificadas' },
  { key: 'security', label: 'Security', icon: 'security' },
];

const BRAND_INFO = {
  // ── Comunicaciones Unificadas ──
  'audiocodes': {
    name: 'AudioCodes',
    logo: null,
    tagline: 'Gateways de Voz, SBCs y Teléfonos IP Teams',
    color: '#005596',
    bg: 'linear-gradient(135deg, rgba(0, 85, 150, 0.08) 0%, rgba(0, 85, 150, 0.02) 100%)'
  },
  'avaya': {
    name: 'Avaya',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Avaya_Logo.svg',
    tagline: 'Líder en Contact Center y Comunicaciones Unificadas',
    color: '#CC0000',
    bg: 'linear-gradient(135deg, rgba(204, 0, 0, 0.08) 0%, rgba(204, 0, 0, 0.02) 100%)'
  },

  // ── Seguridad - Ciberseguridad ──
  'algosec': {
    name: 'AlgoSec',
    logo: null,
    tagline: 'Automatización de Seguridad y Políticas de Firewall',
    color: '#0084C7',
    bg: 'linear-gradient(135deg, rgba(0, 132, 199, 0.08) 0%, rgba(0, 132, 199, 0.02) 100%)'
  },
  'barracuda': {
    name: 'Barracuda Networks',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Barracuda_Networks_logo.svg',
    tagline: 'Seguridad de Email, WAF y Respaldo en la Nube',
    color: '#006699',
    bg: 'linear-gradient(135deg, rgba(0, 102, 153, 0.08) 0%, rgba(0, 102, 153, 0.02) 100%)'
  },
  'fortinet': {
    name: 'Fortinet',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Fortinet_logo.svg',
    tagline: 'Seguridad de Red Convergente y Firewalls NGFW FortiGate',
    color: '#EE3124',
    bg: 'linear-gradient(135deg, rgba(238, 49, 36, 0.08) 0%, rgba(238, 49, 36, 0.02) 100%)'
  },
  'f5': {
    name: 'F5 Networks',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/F5_Networks_logo.svg',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Hitachi_Inspire_the_Next_logo.svg',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Sophos_Logo_2017.svg',
    tagline: 'Ciberseguridad Sincronizada, Intercept X Endpoint y XGS',
    color: '#00549A',
    bg: 'linear-gradient(135deg, rgba(0, 84, 154, 0.08) 0%, rgba(0, 84, 154, 0.02) 100%)'
  },
  'sonicwall': {
    name: 'SonicWall',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/SonicWall_Logo.svg',
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
    logo: null,
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Eaton_Corporation_logo.svg',
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
    logo: null,
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
    logo: null,
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/MikroTik_Logo.svg',
    tagline: 'Routers, Switches de alta capacidad y RouterOS',
    color: '#D8232A',
    bg: 'linear-gradient(135deg, rgba(216, 35, 42, 0.08) 0%, rgba(216, 35, 42, 0.02) 100%)'
  },
  'aruba': {
    name: 'Aruba',
    logo: null,
    tagline: 'Puntos de Acceso Wi-Fi 6 y Switching Corporativo Cloud',
    color: '#FF8300',
    bg: 'linear-gradient(135deg, rgba(255, 131, 0, 0.08) 0%, rgba(255, 131, 0, 0.02) 100%)'
  },
  'microsoft': {
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
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

/* ─── Animated Number Counter for Slide 0 (Efecto animado de números) ─── */
function AnimatedHeroStats({ active }) {
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

  const stats = [
    { value: `+${count25} Años`, label: 'Liderazgo Regional' },
    { value: `${count100}% Oficial`, label: 'Garantía de Fábrica' },
    { value: `${count24}/7`, label: 'Soporte Técnico' }
  ];

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
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
    badge: 'DISTRIBUIDOR MAYORISTA DE VALOR AGREGADO',
    badgeIcon: 'shield',
    titleLine1: 'Equipamiento IT, Redes',
    titleLine2: '& Ciberseguridad Enterprise',
    titleColor: '#0fa4de',
    desc: 'Hardware empresarial de alta disponibilidad, licencias oficiales y soluciones completas para integradores y canales con respaldo técnico oficial.',
    primaryBtn: { text: 'Ver Networking & Switches', cat: 'networking' },
    secondaryBtn: { text: 'Security & Firewalls', cat: 'security' },
    type: 'animated_stats'
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

export default function Shop() {
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

  const [visualSettings, setVisualSettings] = useState(null);

  const heroSlides = useMemo(() => {
    if (visualSettings?.heroSlides && Array.isArray(visualSettings.heroSlides) && visualSettings.heroSlides.length > 0) {
      return visualSettings.heroSlides;
    }
    return HERO_SLIDES;
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
  const [addedId, setAddedId] = useState(null);

  // Modal de detalles de producto y carrusel
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
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
    country_id: '1',
    ciudad: '',
    direccion_legal: ''
  });

  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCountries();
    fetchVisualSettings();
  }, []);

  const fetchVisualSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual`);
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
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
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
    fetchProducts();
  }, [clientUser]);

  const DISALLOWED_BRANDS = ['cisco', 'poly', 'ubiquiti', 'dell', 'dell technologies'];

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('dacas_client_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/products`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize images property and filter disallowed brands
          const normalized = data
            .filter((p) => !p.brand || !DISALLOWED_BRANDS.includes(p.brand.toLowerCase()))
            .map((p) => ({
              ...p,
              images: Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : (p.image_url ? [p.image_url] : [])
            }));
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
        const count = products.filter((p) => p.brand && p.brand.toLowerCase() === bName.toLowerCase()).length;
        return {
          ...info,
          rawName: info.name || bName,
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
      const count = categoryProducts.filter((p) => p.brand && p.brand.toLowerCase() === (info.name || key).toLowerCase()).length;
      return {
        ...info,
        rawName: info.name || key,
        count
      };
    });
  }, [activeCategory, categoryProducts, products, categoryBrandsMap, visualSettings, selectedCountryCode]);

  const filtered = products.filter((p) => {
    if (p.brand && DISALLOWED_BRANDS.includes(p.brand.toLowerCase())) return false;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    const matchCat = isProductInCat(p, activeCategory);
    const matchBrand = !selectedBrand || selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    return matchSearch && matchCat && matchBrand;
  });

  const selectedCountryObj = DACAS_COUNTRIES.find((c) => c.code === selectedCountryCode) || DACAS_COUNTRIES[1];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ── Top Regional Countries Flag Bar (12 Países DACAS) ── */}
      <div style={{ background: '#E2E8F0', borderBottom: '1px solid #CBD5E1', padding: '5px 0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <BrandingVectorIcon name="globe" size={14} color="#475569" /> Cobertura Regional DACAS:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
            {DACAS_COUNTRIES.map((c) => {
              const isSelected = selectedCountryCode === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setSelectedCountryCode(c.code);
                    localStorage.setItem('dacas_selected_country', c.code);
                  }}
                  title={`${c.name} (${c.code})`}
                  style={{
                    background: isSelected ? '#CBD5E1' : 'transparent',
                    border: isSelected ? '1.5px solid #94A3B8' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    transform: isSelected ? 'scale(1.06)' : 'none'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{c.flag}</span>
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
          <div onClick={() => navigate('/shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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

          {/* Search Bar */}
          <form style={{ flex: 1, minWidth: 0, position: 'relative' }} onSubmit={(e) => e.preventDefault()}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {/* ── Category Navigation Bar ── */}
      <nav style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.2)', position: 'sticky', top: '72px', zIndex: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: '52px', gap: '8px', boxSizing: 'border-box' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleSelectCategory(cat.key)}
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                fontSize: '13.5px',
                fontWeight: activeCategory === cat.key ? '700' : '600',
                color: activeCategory === cat.key ? '#FFFFFF' : '#94A3B8',
                background: activeCategory === cat.key ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
                border: activeCategory === cat.key ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                boxShadow: activeCategory === cat.key ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.key) {
                  e.currentTarget.style.background = 'rgba(15, 164, 222, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(15, 164, 222, 0.3)';
                  e.currentTarget.style.color = '#F1F5F9';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.key) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <CategoryIcon name={cat.key || cat.icon} size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label || cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero Banner Carousel DACAS ── */}
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
              padding: '56px 20px 64px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '340px',
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
            <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', position: 'relative', zIndex: 1, padding: '0 40px' }}>

              {currentSlideObj.type === 'custom_image' && currentSlideObj.imageUrl ? (
                /* ── Renderizado de Banner Gráfico Completo del Diseñador ── */
                <div
                  onClick={() => currentSlideObj.primaryBtn?.cat && handleSelectCategory(currentSlideObj.primaryBtn.cat)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentSlideObj.primaryBtn?.cat ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => { if (currentSlideObj.primaryBtn?.cat) e.currentTarget.style.transform = 'scale(1.005)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  <img
                    src={currentSlideObj.imageUrl}
                    alt={currentSlideObj.titleLine1 || 'Banner Promocional DACAS'}
                    style={{
                      maxWidth: '1240px',
                      width: '100%',
                      maxHeight: '420px',
                      objectFit: 'cover',
                      borderRadius: '18px',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                      border: '1px solid rgba(15, 164, 222, 0.25)'
                    }}
                  />
                  {currentSlideObj.primaryBtn?.text && (
                    <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
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
                    <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                      {currentSlideObj.titleLine1} <br />
                      <span style={{ color: currentSlideObj.titleColor || '#0fa4de' }}>
                        {currentSlideObj.titleLine2}
                      </span>
                    </h1>
                    <p style={{ margin: '0 0 28px', color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px' }}>
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
                            padding: '14px 28px',
                            fontWeight: '700',
                            fontSize: '15px',
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
                            padding: '14px 28px',
                            fontWeight: '600',
                            fontSize: '15px',
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
                    <AnimatedHeroStats active={slideIndex === 0} />
                  ) : (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {currentSlideObj.metrics?.map((metric, mIdx) => (
                        <div
                          key={metric.label || mIdx}
                          style={{
                            textAlign: 'center',
                            background: 'rgba(15, 39, 66, 0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(15, 164, 222, 0.25)',
                            borderRadius: '20px',
                            padding: '24px 28px',
                            minWidth: '115px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ fontSize: '2.1rem', fontWeight: '900', color: currentSlideObj.titleColor || '#0fa4de' }}>
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
                    key={slide.id || idx}
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

      {/* ── Main Catalog / Brand Selection View ── */}
      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '48px 20px 60px' }}>
        {/* ── PASO 1: SELECCIÓN PREVIA DE MARCA / FABRICANTE (Cuando se selecciona un grupo específico) ── */}
        {activeCategory !== 'all' && !selectedBrand && !search ? (
          <div>
            {/* Breadcrumb y encabezado de paso previo */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                <span onClick={() => { setActiveCategory('all'); setSelectedBrand(null); }} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CategoryIcon name="all" size={14} color="#0fa4de" /> Catálogo
                </span>
                <span>/</span>
                <span style={{ fontWeight: '700', color: '#071524', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CategoryIcon name={currentCategoryObj?.key} size={14} color="#071524" /> {currentCategoryObj?.label}
                </span>
                <span>/</span>
                <span style={{ color: '#94A3B8' }}>Seleccionar Marca</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 164, 222, 0.12)', color: '#0fa4de', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    PASO 1 DE 2 · SELECCIÓN DE FABRICANTE
                  </div>
                  <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', color: '#071524', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CategoryIcon name={currentCategoryObj?.key} size={26} color="#0fa4de" />
                    <span>{currentCategoryObj?.label}</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B', maxWidth: '680px', lineHeight: 1.5 }}>
                    Selecciona una marca para explorar sus modelos certificados, stock en tiempo real y precios mayoristas oficiales:
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBrand('all')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#071524',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="box" size={14} color="currentColor" />
                    Ver Todos los Productos ({categoryProducts.length}) →
                  </span>
                </button>
              </div>
            </div>

            {/* Grid de Marcas */}
            {availableBrands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <BrandingVectorIcon name="box" size={48} color="#94A3B8" />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No hay marcas registradas en esta categoría</h3>
                <p style={{ margin: '0 0 16px', color: '#64748B' }}>Pronto incorporaremos nuevos fabricantes para {currentCategoryObj?.label}.</p>
                <button
                  onClick={() => setSelectedBrand('all')}
                  style={{ background: '#0fa4de', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Ver todos los productos disponibles
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {availableBrands.map((b) => (
                  <div
                    key={b.rawName}
                    onClick={() => setSelectedBrand(b.rawName)}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '20px',
                      padding: '28px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = b.color || '#0fa4de';
                      e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.08), 0 0 0 1px ${b.color || '#0fa4de'}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                    }}
                  >
                    <div>
                      {/* Brand Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          background: b.bg || 'rgba(15, 164, 222, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          {b.logo ? (
                            <img src={b.logo} alt={b.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '1.6rem', fontWeight: '900', color: b.color || '#0fa4de' }}>
                              {b.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <span style={{
                          background: 'rgba(15, 164, 222, 0.1)',
                          color: b.color || '#0fa4de',
                          fontWeight: '800',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '999px',
                          border: `1px solid ${b.color ? `${b.color}33` : 'rgba(15, 164, 222, 0.2)'}`
                        }}>
                          {b.count} {b.count === 1 ? 'Producto' : 'Productos'}
                        </span>
                      </div>

                      {/* Brand Title & Tagline */}
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.35rem', fontWeight: '800', color: '#071524' }}>
                        {b.name}
                      </h3>
                      <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                        {b.tagline}
                      </p>
                    </div>

                    {/* Action button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: '1px solid #F1F5F9'
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>
                        Garantía Oficial DACAS
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: '750',
                        color: b.color || '#0fa4de'
                      }}>
                        Ver Productos <BrandingVectorIcon name="arrow-right" size={13} color="currentColor" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── PASO 2: LISTADO DE PRODUCTOS FILTRADOS ── */
          <div>
            <div style={{ marginBottom: '28px' }}>
              {/* Breadcrumbs de navegación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span onClick={() => { setActiveCategory('all'); setSelectedBrand(null); }} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CategoryIcon name="all" size={14} color="#0fa4de" /> Catálogo
                </span>
                <span>/</span>
                <span
                  onClick={() => setSelectedBrand(null)}
                  style={{ cursor: activeCategory !== 'all' ? 'pointer' : 'default', color: activeCategory !== 'all' ? '#0fa4de' : '#071524', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <CategoryIcon name={currentCategoryObj?.key} size={14} color={activeCategory !== 'all' ? '#0fa4de' : '#071524'} /> {currentCategoryObj?.label}
                </span>
                {selectedBrand && (
                  <>
                    <span>/</span>
                    <span style={{ fontWeight: '750', color: '#071524' }}>
                      {selectedBrand === 'all' ? 'Todas las Marcas' : selectedBrand}
                    </span>
                  </>
                )}
              </div>

              {/* Encabezado con título y acciones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span>{currentCategoryObj?.label}</span>
                    {selectedBrand && selectedBrand !== 'all' && (
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748B' }}>
                        · Marca: <strong style={{ color: '#0fa4de' }}>{selectedBrand}</strong>
                      </span>
                    )}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
                    {filtered.length} {filtered.length === 1 ? 'producto disponible' : 'productos disponibles'} para compras corporativas y cotizaciones.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {activeCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedBrand(null)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '999px',
                        padding: '8px 16px',
                        color: '#071524',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
                    >
                      ← Cambiar Marca
                    </button>
                  )}
                  {search && (
                    <button onClick={() => setSearch('')} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '999px', padding: '8px 16px', color: '#071524', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      Limpiar búsqueda ×
                    </button>
                  )}
                </div>
              </div>

              {/* Selector de Marcas rápido (Pills) cuando se está dentro de una categoría */}
              {activeCategory !== 'all' && availableBrands.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginRight: '4px' }}>Filtrar Marca:</span>
                  <button
                    onClick={() => setSelectedBrand('all')}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: selectedBrand === 'all' || !selectedBrand ? '1px solid #0fa4de' : '1px solid #E2E8F0',
                      background: selectedBrand === 'all' || !selectedBrand ? '#0fa4de' : '#FFFFFF',
                      color: selectedBrand === 'all' || !selectedBrand ? '#FFFFFF' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Todas ({categoryProducts.length})
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b.rawName}
                      onClick={() => setSelectedBrand(b.rawName)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: selectedBrand?.toLowerCase() === b.rawName.toLowerCase() ? `1px solid ${b.color || '#0fa4de'}` : '1px solid #E2E8F0',
                        background: selectedBrand?.toLowerCase() === b.rawName.toLowerCase() ? (b.color || '#0fa4de') : '#FFFFFF',
                        color: selectedBrand?.toLowerCase() === b.rawName.toLowerCase() ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {b.name} ({b.count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                <p style={{ fontWeight: '600' }}>Cargando catálogo de productos DACAS...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <BrandingVectorIcon name="search" size={48} color="#94A3B8" />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No encontramos coincidencias</h3>
                <p style={{ margin: 0, color: '#64748B' }}>No se encontraron productos para los filtros seleccionados.</p>
                <button
                  onClick={() => setSelectedBrand('all')}
                  style={{ marginTop: '16px', background: '#0fa4de', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Ver todos los productos de esta categoría
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '26px' }}>
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    clientUser={clientUser}
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
            )}
          </div>
        )}
      </main>

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
            <span>© {new Date().getFullYear()} DACAS Argentina · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* ── MODAL POP-UP CON DETALLES & CARRUSEL DE FOTOS ── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          clientUser={clientUser}
          onOpenAuth={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => addToCart(product, qty)}
        />
      )}

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
function ProductCard({ product, clientUser, onOpenAuth, onSelectProduct, onAddToCart, justAdded }) {
  const [hovered, setHovered] = useState(false);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image_url ? [product.image_url] : []);
  const mainImage = images[0] || product.image_url;
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
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#F8FAFC' }}>
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

        {/* Stock warning */}
        {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '999px'
          }}>
            ¡Últimos {product.stock}!
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {product.brand && (
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              background: '#E0F2FE',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {product.brand}
            </span>
          )}
          {product.sku && (
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.04em' }}>
              SKU: {product.sku}
            </span>
          )}
          {product.applied_rule && (
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              background: '#DCFCE7',
              color: '#166534',
              border: '1px solid #BBF7D0',
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <BrandingVectorIcon name="tag" size={11} color="#166534" />
              <span>{product.applied_rule.rule_name || product.applied_rule.name || 'Descuento B2B'}</span>
              {product.discount_percent && <span>(-{product.discount_percent}%)</span>}
            </span>
          )}
        </div>

        <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '800', color: '#071524', lineHeight: 1.35 }}>
          {product.name}
        </h3>

        <div
          style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: '#64748B',
            lineHeight: 1.5,
            flex: 1,
            maxHeight: '44px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.description ? product.description.replace(/<[^>]+>/g, ' ').substring(0, 90) + '...' : ''}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          {isLocked ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontSize: '13px', fontWeight: '800' }}>
                <BrandingVectorIcon name="lock" size={13} color="#0369a1" />
                <span>Precio B2B Exclusivo</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                Accedé como canal autorizado
              </span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#071524' }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ${product.base_price} USD
                  </span>
                  <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                    -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}%
                  </span>
                </div>
              ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                  ${product.promotional_price} USD
                </span>
              ) : null}
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
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image_url ? [product.image_url] : []);

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

