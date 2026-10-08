export const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

export const LATAM_COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela'
];

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

export const DEFAULT_CHECKOUT_METHODS = {
  shipping: [
    {
      id: 'express',
      enabled: true,
      title: 'Envío Express a Domicilio',
      subtitle: 'Despacho a Planta / Oficina',
      badge: 'Recomendado',
      icon: 'truck',
      priceText: 'Bonificado (B2B)',
      description: 'Despacho prioritario directo a domicilio u obra.',
      delivery_type: 'caba',
      fields: {
        require_receiver: true,
        require_dni: false,
        require_phone: true,
        require_address: true,
        require_postal_code: true,
        require_partido: true,
        require_time_slot: true,
        require_expreso_info: false,
        require_notes: true
      }
    },
    {
      id: 'hub',
      enabled: true,
      title: 'Retiro en HUB DACAS',
      subtitle: 'Depósito Central (Sin Cargo)',
      badge: 'Gratis',
      icon: 'building',
      priceText: 'Sin cargo',
      description: 'Retiro presencial inmediato en HUB Central.',
      delivery_type: 'hub',
      fields: {
        require_receiver: true,
        require_dni: true,
        require_phone: true,
        require_address: false,
        require_postal_code: false,
        require_partido: false,
        require_time_slot: false,
        require_expreso_info: false,
        require_notes: true
      }
    },
    {
      id: 'expreso',
      enabled: true,
      title: 'Expreso / Transporte Propio',
      subtitle: 'Despacho a receptoría de expreso',
      badge: 'Interior',
      icon: 'truck',
      priceText: 'A cargo del cliente',
      description: 'Envío coordinado mediante transporte o expreso seleccionado.',
      delivery_type: 'expreso',
      fields: {
        require_receiver: true,
        require_dni: false,
        require_phone: true,
        require_address: true,
        require_postal_code: true,
        require_partido: true,
        require_time_slot: false,
        require_expreso_info: true,
        require_notes: true
      }
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
      icon: 'credit-card',
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
      icon: 'credit-card',
      gateway: 'Stripe SSL 256-bit',
      instrucciones: 'Transacción encriptada y protegida bajo normativa PCI-DSS Nivel 1.'
    },
    {
      id: 'echeq',
      enabled: true,
      title: 'Cheque de Pago Diferido / E-Cheq',
      subtitle: 'Endoso y recepción de cheques electrónicos interbancarios COELSA.',
      badge: 'Financiamiento',
      icon: 'file-text',
      cuit_receptor: '30-68942158-9',
      banco_receptor: 'Banco Santander',
      plazos_admitidos: '30 y 60 días fecha factura',
      instrucciones: 'Emitir o endosar el E-Cheq a favor de DACAS S.A. (CUIT 30-68942158-9) mediante homebanking.'
    }
  ],
  terms_conditions_text: 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'
};

export const isCuentaCorrienteMethod = (m) => {
  if (!m) return false;
  const idStr = String(m.id || '').toLowerCase();
  const titleStr = String(m.title || '').toLowerCase();
  return idStr.includes('cuenta_corriente') || idStr.includes('ctacte') || titleStr.includes('cuenta corriente');
};

export const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #E2E8F0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '14px',
  fontFamily: 'inherit',
  background: '#FFFFFF',
  color: '#071524',
  transition: 'all 0.2s ease',
};

export const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
};
