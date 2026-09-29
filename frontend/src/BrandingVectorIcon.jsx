import React from 'react';
import DOMPurify from 'dompurify';

export const BUILT_IN_BRANDING_ICONS = [
  { id: 'building', name: 'Empresa / Sede', category: 'Corporativo' },
  { id: 'shield', name: 'Ciberseguridad', category: 'Seguridad' },
  { id: 'lock', name: 'Control de Acceso', category: 'Seguridad' },
  { id: 'key', name: 'Autenticación', category: 'Seguridad' },
  { id: 'server', name: 'Servidores & Datacenter', category: 'Tecnología' },
  { id: 'network', name: 'Networking & Redes', category: 'Tecnología' },
  { id: 'cloud', name: 'Servicios Cloud', category: 'Tecnología' },
  { id: 'cpu', name: 'Hardware & Chips', category: 'Tecnología' },
  { id: 'database', name: 'Bases de Datos', category: 'Tecnología' },
  { id: 'wifi', name: 'Conectividad WiFi', category: 'Tecnología' },
  { id: 'laptop', name: 'Equipos & Portátiles', category: 'Hardware' },
  { id: 'headphones', name: 'Soporte & Helpdesk', category: 'Servicio' },
  { id: 'ticket', name: 'Tickets & Casos', category: 'Servicio' },
  { id: 'briefcase', name: 'Gestión B2B / Comercial', category: 'Comercial' },
  { id: 'shopping-bag', name: 'E-Commerce / Distribución', category: 'Comercial' },
  { id: 'rocket', name: 'Innovación & Escalabilidad', category: 'General' },
  { id: 'zap', name: 'Rendimiento & Energía', category: 'General' },
  { id: 'star', name: 'Destacado / VIP', category: 'General' },
  { id: 'box', name: 'Inventario & Logística', category: 'General' },
  { id: 'terminal', name: 'DevOps & IT', category: 'Tecnología' },
  { id: 'layers', name: 'Soluciones Integradas', category: 'General' },
  { id: 'award', name: 'Certificación Oficial', category: 'Corporativo' }
];

export default function BrandingVectorIcon({ 
  name = 'building', 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 2, 
  className = '',
  style = {}
}) {
  if (!name) name = 'building';

  // Si es una URL o ruta de archivo subido (/uploads/..., http://..., data:image/...)
  if (typeof name === 'string' && (name.startsWith('/') || name.startsWith('http://') || name.startsWith('https://') || name.startsWith('data:image/'))) {
    return (
      <img
        src={name}
        alt="Custom Icon"
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style
        }}
      />
    );
  }

  // Si es un SVG crudo en texto (<svg ...)
  if (typeof name === 'string' && name.trim().startsWith('<svg')) {
    return (
      <span
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          ...style
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(name, { USE_PROFILES: { svg: true } }) }}
      />
    );
  }

  // Mapeo de Emojis legados a nombres de vector para retrocompatibilidad
  const emojiMap = {
    '🏠': 'home',
    '🏢': 'building',
    '🏬': 'building',
    '🏨': 'hotel',
    '🔐': 'lock',
    '🔒': 'lock',
    '🛡️': 'shield',
    '🛡': 'shield',
    '👑': 'award',
    '👔': 'briefcase',
    '💼': 'briefcase',
    '🤝': 'handshake',
    '⚡': 'zap',
    '🌐': 'globe',
    '🌍': 'globe',
    '🚀': 'rocket',
    '💻': 'laptop',
    '📞': 'phone',
    '🎟️': 'ticket',
    '🎫': 'ticket',
    '⭐': 'star',
    '🛒': 'shopping-cart',
    '🛍️': 'shopping-bag',
    '🛍': 'shopping-bag',
    '🚚': 'truck',
    '🚛': 'truck',
    '💳': 'credit-card',
    '🎉': 'award',
    '🏦': 'bank',
    '💸': 'dollar',
    '📑': 'file-text',
    '📝': 'file-text',
    '📜': 'file-text',
    '🔍': 'search',
    '📦': 'box',
    '📍': 'map-pin',
    '📥': 'download',
    '📤': 'upload',
    '➕': 'plus',
    '✏️': 'edit',
    '✍️': 'edit',
    '🗑️': 'trash',
    '🗑': 'trash',
    '👥': 'users',
    '👤': 'user',
    '✉️': 'mail',
    '✉': 'mail',
    '⚙️': 'settings',
    '🏷️': 'tag',
    '🤖': 'bot',
    '🎧': 'headphones',
    '✨': 'sparkles',
    '🖨️': 'printer',
    '📷': 'camera',
    '🖼️': 'image',
    '🔗': 'link',
    '📋': 'file-text',
    '📊': 'zap',
    '📈': 'zap',
    '💲': 'dollar',
    '💵': 'dollar',
    '📅': 'calendar',
    '⏳': 'clock',
    '🕒': 'clock',
    '⏰': 'clock',
    '✅': 'check-circle',
    '✓': 'check',
    '⚠️': 'alert-triangle',
    '🚨': 'alert-circle',
    '🚫': 'alert-circle',
    '📢': 'megaphone',
    '🔵': 'layers',
    '🟣': 'shield',
    '✈️': 'plane',
    '✈': 'plane',
    '📎': 'paperclip',
    '💡': 'lightbulb',
    '👁️': 'eye',
    '👁': 'eye',
    '🔄': 'rotate-ccw',
    '🟡': 'clock',
    '🟢': 'check-circle',
    '🔴': 'alert-circle',
    '🌙': 'moon',
    '☀️': 'sun',
    '✕': 'x',
    '✖': 'x',
    '➤': 'send',
    '➔': 'arrow-right',
    '→': 'arrow-right'
  };

  const cleanName = emojiMap[name] || name;

  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
  };

  switch (cleanName) {
    case 'bell':
      return (
        <svg {...svgProps}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case 'handshake':
      return (
        <svg {...svgProps}>
          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2" />
          <path d="m18 10 1.3-1.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6" />
          <path d="m2 14 6 6" />
          <path d="M22 10 16 4" />
          <path d="m10 8 2.3-2.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L14 12" />
          <path d="m13 13-2 2a1 1 0 0 1-1.4 0l-4.3-4.3a1 1 0 0 1 0-1.4l2-2" />
        </svg>
      );
    case 'user':
      return (
        <svg {...svgProps}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...svgProps}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case 'home':
      return (
        <svg {...svgProps}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'building':
      return (
        <svg {...svgProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...svgProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...svgProps}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'key':
      return (
        <svg {...svgProps}>
          <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
          <path d="m21 2-9.6 9.6" />
          <circle cx="7.5" cy="15.5" r="5.5" />
        </svg>
      );
    case 'server':
      return (
        <svg {...svgProps}>
          <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
          <line x1="6" x2="6.01" y1="6" y2="6" />
          <line x1="6" x2="6.01" y1="18" y2="18" />
        </svg>
      );
    case 'network':
    case 'globe':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...svgProps}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case 'cpu':
      return (
        <svg {...svgProps}>
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <rect width="6" height="6" x="9" y="9" rx="1" />
          <path d="M15 2v2" />
          <path d="M15 20v2" />
          <path d="M2 15h2" />
          <path d="M2 9h2" />
          <path d="M20 15h2" />
          <path d="M20 9h2" />
          <path d="M9 2v2" />
          <path d="M9 20v2" />
        </svg>
      );
    case 'database':
      return (
        <svg {...svgProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5V19A9 3 0 0 0 21 19V5" />
          <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
      );
    case 'wifi':
      return (
        <svg {...svgProps}>
          <path d="M12 20h.01" />
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="M5 12.859a10 10 0 0 1 14 0" />
          <path d="M8.5 16.429a5 5 0 0 1 7 0" />
        </svg>
      );
    case 'laptop':
      return (
        <svg {...svgProps}>
          <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
        </svg>
      );
    case 'headphones':
      return (
        <svg {...svgProps}>
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...svgProps}>
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 11v2" />
          <path d="M13 17v2" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...svgProps}>
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'shopping-bag':
      return (
        <svg {...svgProps}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" x2="21" y1="6" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...svgProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...svgProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'star':
      return (
        <svg {...svgProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'box':
      return (
        <svg {...svgProps}>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    case 'terminal':
      return (
        <svg {...svgProps}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" x2="20" y1="19" y2="19" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...svgProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'shopping-cart':
    case 'cart':
      return (
        <svg {...svgProps}>
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      );
    case 'truck':
    case 'shipping':
      return (
        <svg {...svgProps}>
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.24-4.04a1 1 0 0 0-.78-.37H14v10" />
          <circle cx="17" cy="18.5" r="2.5" />
          <circle cx="7" cy="18.5" r="2.5" />
        </svg>
      );
    case 'credit-card':
    case 'payment':
      return (
        <svg {...svgProps}>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      );
    case 'file-text':
    case 'document':
    case 'invoice':
      return (
        <svg {...svgProps}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...svgProps}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'check-circle':
    case 'check':
      return (
        <svg {...svgProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'alert-circle':
    case 'alert':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      );
    case 'alert-triangle':
    case 'warning':
      return (
        <svg {...svgProps}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
      );
    case 'clock':
    case 'time':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'bank':
    case 'landmark':
      return (
        <svg {...svgProps}>
          <line x1="3" x2="21" y1="22" y2="22" />
          <line x1="6" x2="18" y1="18" y2="18" />
          <path d="m3 11 9-7 9 7" />
          <line x1="4" x2="4" y1="18" y2="11" />
          <line x1="20" x2="20" y1="18" y2="11" />
          <line x1="8" x2="8" y1="18" y2="11" />
          <line x1="12" x2="12" y1="18" y2="11" />
          <line x1="16" x2="16" y1="18" y2="11" />
        </svg>
      );
    case 'search':
      return (
        <svg {...svgProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...svgProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'edit':
    case 'pencil':
    case 'pen':
      return (
        <svg {...svgProps}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      );
    case 'trash':
    case 'delete':
      return (
        <svg {...svgProps}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      );
    case 'download':
    case 'export':
      return (
        <svg {...svgProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      );
    case 'upload':
    case 'import':
      return (
        <svg {...svgProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      );
    case 'plus':
    case 'add':
      return (
        <svg {...svgProps}>
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...svgProps}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'rotate-ccw':
    case 'refresh':
      return (
        <svg {...svgProps}>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case 'save':
      return (
        <svg {...svgProps}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case 'palette':
    case 'brush':
      return (
        <svg {...svgProps}>
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
        </svg>
      );
    case 'megaphone':
    case 'announcement':
      return (
        <svg {...svgProps}>
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...svgProps}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <circle cx="7" cy="7" r=".5" fill="currentColor" />
        </svg>
      );
    case 'award':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'x':
    case 'close':
    case 'cancel':
      return (
        <svg {...svgProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case 'hub':
      return (
        <svg {...svgProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </svg>
      );
    case 'dollar':
    case 'cash':
    case 'money':
      return (
        <svg {...svgProps}>
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case 'phone':
    case 'telephone':
      return (
        <svg {...svgProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'user-plus':
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" x2="19" y1="8" y2="14" />
          <line x1="22" x2="16" y1="11" y2="11" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...svgProps}>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      );
    case 'play':
      return (
        <svg {...svgProps}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...svgProps}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    case 'bot':
    case 'robot':
    case 'ai':
      return (
        <svg {...svgProps}>
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...svgProps}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      );
    case 'printer':
      return (
        <svg {...svgProps}>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect width="12" height="8" x="6" y="14" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...svgProps}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case 'image':
      return (
        <svg {...svgProps}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case 'link':
      return (
        <svg {...svgProps}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'send':
      return (
        <svg {...svgProps}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'plane':
    case 'flight':
    case 'travel':
      return (
        <svg {...svgProps}>
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      );
    case 'hotel':
      return (
        <svg {...svgProps}>
          <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
          <path d="M8 7h.01" />
          <path d="M16 7h.01" />
          <path d="M12 7h.01" />
          <path d="M12 11h.01" />
          <path d="M16 11h.01" />
          <path d="M8 11h.01" />
          <path d="M10 22v-4h4v4" />
        </svg>
      );
    case 'paperclip':
    case 'attachment':
      return (
        <svg {...svgProps}>
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      );
    case 'lightbulb':
    case 'idea':
      return (
        <svg {...svgProps}>
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...svgProps}>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'message-square':
    case 'message':
    case 'chat':
    case 'comment':
      return (
        <svg {...svgProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...svgProps}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    default:
      // Si es un emoji o texto suelto desconocido
      if (typeof name === 'string' && name.length <= 4) {
        return <span style={{ fontSize: `${size * 0.85}px`, lineHeight: 1, display: 'inline-block', ...style }}>{name}</span>;
      }
      return (
        <svg {...svgProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
        </svg>
      );
  }
}
