import React, { useState, useEffect, useMemo } from 'react';

/* ─── Animated Number Counter for Slide 0 (Efecto animado de números) ─── */
export function AnimatedHeroStats({ active, metrics }) {
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

export const HERO_SLIDES = [
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

export class ShopErrorBoundary extends React.Component {
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
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
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('dacas_client_user');
                  localStorage.removeItem('dacas_client_token');
                  localStorage.removeItem('shop_user');
                  localStorage.removeItem('shop_token');
                } catch (_) {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reiniciar Sesión
            </button>
          </div>
          {this.state.error && (
            <pre style={{ marginTop: '16px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#991B1B', fontSize: '12px', maxWidth: '750px', textAlign: 'left', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
              <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default AnimatedHeroStats;
