import React, { useState, useEffect, useMemo } from 'react';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

// ─── Grupos de Husos Horarios Oficiales DACAS (Valores por defecto) ───
const TIMEZONE_GROUPS = [
  {
    id: 'utc-3',
    regionName: 'Cono Sur & Brasil',
    utcOffset: 'UTC-3',
    timeZone: 'America/Argentina/Buenos_Aires',
    countries: [
      { name: 'Argentina', flag: '🇦🇷', city: 'Buenos Aires', hub: 'Hub Central BUE' },
      { name: 'Chile', flag: '🇨🇱', city: 'Santiago', hub: 'Hub SCL' },
      { name: 'Uruguay', flag: '🇺🇾', city: 'Montevideo', hub: 'Hub MVD' },
      { name: 'Brasil', flag: '🇧🇷', city: 'São Paulo', hub: 'Hub SAO' }
    ]
  },
  {
    id: 'utc-4',
    regionName: 'Estados Unidos & Caribe',
    utcOffset: 'UTC-4',
    timeZone: 'America/New_York',
    countries: [
      { name: 'Estados Unidos', flag: '🇺🇸', city: 'Miami / FL', hub: 'Miami FTZ Logistics' }
    ]
  },
  {
    id: 'utc-5',
    regionName: 'Región Andina',
    utcOffset: 'UTC-5',
    timeZone: 'America/Bogota',
    countries: [
      { name: 'Colombia', flag: '🇨🇴', city: 'Bogotá', hub: 'Hub BOG' },
      { name: 'Perú', flag: '🇵🇪', city: 'Lima', hub: 'Hub LIM' }
    ]
  },
  {
    id: 'utc-6',
    regionName: 'México & Centroamérica',
    utcOffset: 'UTC-6',
    timeZone: 'America/Mexico_City',
    countries: [
      { name: 'México', flag: '🇲🇽', city: 'CDMX', hub: 'Hub MEX' }
    ]
  }
];

// ─── Componente de Reloj Analógico SVG Vectorial Ultra-Preciso ───
function AnalogClock({ timeZone, now }) {
  const { hours, minutes, seconds, hourAngle, minuteAngle, secondAngle } = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).formatToParts(now);

      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const s = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);

      const sAngle = s * 6; // 360 / 60
      const mAngle = m * 6 + s * 0.1; // 360 / 60 + seg
      const hAngle = (h % 12) * 30 + m * 0.5; // 360 / 12 + min

      return {
        hours: h,
        minutes: m,
        seconds: s,
        hourAngle: sAngle === 0 ? hAngle : hAngle,
        minuteAngle: mAngle,
        secondAngle: sAngle
      };
    } catch {
      return { hours: 0, minutes: 0, seconds: 0, hourAngle: 0, minuteAngle: 0, secondAngle: 0 };
    }
  }, [timeZone, now]);

  // Coordenadas del cuadrante (cx: 55, cy: 55, r: 48)
  const cx = 55;
  const cy = 55;
  const hourLength = 26;
  const minuteLength = 37;
  const secondLength = 41;

  const toRad = deg => (deg * Math.PI) / 180;

  const hx = cx + hourLength * Math.sin(toRad(hourAngle));
  const hy = cy - hourLength * Math.cos(toRad(hourAngle));

  const mx = cx + minuteLength * Math.sin(toRad(minuteAngle));
  const my = cy - minuteLength * Math.cos(toRad(minuteAngle));

  const sx = cx + secondLength * Math.sin(toRad(secondAngle));
  const sy = cy - secondLength * Math.cos(toRad(secondAngle));

  // Ticks de las horas
  const ticks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
    const isMajor = deg % 90 === 0;
    const rInner = isMajor ? 38 : 41;
    const rOuter = 45;
    return {
      x1: cx + rInner * Math.sin(toRad(deg)),
      y1: cy - rInner * Math.cos(toRad(deg)),
      x2: cx + rOuter * Math.sin(toRad(deg)),
      y2: cy - rOuter * Math.cos(toRad(deg)),
      isMajor
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg
        width="110"
        height="110"
        viewBox="0 0 110 110"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
          userSelect: 'none'
        }}
      >
        {/* Esfera del reloj */}
        <circle
          cx={cx}
          cy={cy}
          r="50"
          fill="var(--pill-bg, #f1f5f9)"
          stroke="var(--border-color, rgba(15, 164, 222, 0.3))"
          strokeWidth="2.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r="46"
          fill="none"
          stroke="var(--border-color, rgba(15, 164, 222, 0.15))"
          strokeWidth="1"
        />

        {/* Ticks de 12 horas */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? 'var(--primary, #0fa4de)' : 'var(--text-muted, #94a3b8)'}
            strokeWidth={t.isMajor ? '2' : '1'}
            strokeLinecap="round"
          />
        ))}

        {/* Aguja de Horas */}
        <line
          x1={cx}
          y1={cy}
          x2={hx}
          y2={hy}
          stroke="var(--text-main, #0f172a)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Aguja de Minutos */}
        <line
          x1={cx}
          y1={cy}
          x2={mx}
          y2={my}
          stroke="var(--primary, #0fa4de)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Aguja de Segundos */}
        <line
          x1={cx}
          y1={cy}
          x2={sx}
          y2={sy}
          stroke="#ef4444"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Eje central */}
        <circle cx={cx} cy={cy} r="4" fill="var(--text-main, #0f172a)" />
        <circle cx={cx} cy={cy} r="2" fill="#ef4444" />
      </svg>

      {/* Lectura Digital Auxiliar */}
      <div style={{
        fontSize: '0.98rem',
        fontWeight: '900',
        color: 'var(--text-main, #071524)',
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

// ─── Cotizaciones y Divisas frente al USD ───
const DEFAULT_EXCHANGE_RATES = [
  {
    code: 'ARS',
    pair: 'USD / ARS',
    country: 'Argentina',
    flag: '🇦🇷',
    rate: 1065.50,
    rateFinancial: 1290.00,
    change24h: +0.22,
    symbol: '$',
    label: 'Oficial / CCL'
  },
  {
    code: 'CLP',
    pair: 'USD / CLP',
    country: 'Chile',
    flag: '🇨🇱',
    rate: 944.30,
    change24h: -0.15,
    symbol: '$',
    label: 'Observado'
  },
  {
    code: 'COP',
    pair: 'USD / COP',
    country: 'Colombia',
    flag: '🇨🇴',
    rate: 4142.00,
    change24h: +0.38,
    symbol: '$',
    label: 'TRM Oficial'
  },
  {
    code: 'PEN',
    pair: 'USD / PEN',
    country: 'Perú',
    flag: '🇵🇪',
    rate: 3.76,
    change24h: +0.05,
    symbol: 'S/.',
    label: 'Interbancario'
  },
  {
    code: 'BRL',
    pair: 'USD / BRL',
    country: 'Brasil',
    flag: '🇧🇷',
    rate: 5.46,
    change24h: -0.19,
    symbol: 'R$',
    label: 'Comercial PTAX'
  },
  {
    code: 'MXN',
    pair: 'USD / MXN',
    country: 'México',
    flag: '🇲🇽',
    rate: 19.38,
    change24h: +0.14,
    symbol: '$',
    label: 'FIX Banxico'
  },
  {
    code: 'UYU',
    pair: 'USD / UYU',
    country: 'Uruguay',
    flag: '🇺🇾',
    rate: 41.70,
    change24h: 0.00,
    symbol: '$',
    label: 'Interbancario BCU'
  }
];

// ─── Catálogo de Widgets de Reportes en Vivo ───
const AVAILABLE_WIDGETS = [
  {
    id: 'tickets_live',
    title: 'Métricas de Tickets & SLA en Vivo',
    category: 'Mesa de Ayuda & CRM',
    icon: 'ticket',
    desc: 'Volumen total, estado de atención, SLA de primera respuesta y tickets urgentes.'
  },
  {
    id: 'erp_financial',
    title: 'Pulso Financiero DACAS ERP (OneWorld)',
    category: 'Finanzas & Facturación',
    icon: 'activity',
    desc: 'Facturación YTD, cuentas a cobrar A/R, facturas pendientes A/P y liquidez empresarial.'
  },
  {
    id: 'department_load',
    title: 'Distribución Operativa por Departamento',
    category: 'Operaciones',
    icon: 'pie-chart',
    desc: 'Carga de trabajo en tiempo real dividida entre departamentos técnicos y comerciales.'
  },
  {
    id: 'ecommerce_pulse',
    title: 'Ventas & Pedidos E-Commerce DACAS Shop',
    category: 'Ventas Digitales',
    icon: 'shopping-bag',
    desc: 'Ingresos del mes en tienda B2B, pedidos procesados y productos destacados.'
  },
  {
    id: 'logistics_hubs',
    title: 'Almacenes & Logística Multi-País',
    category: 'Logística',
    icon: 'box',
    desc: 'Valoración de stock en los 4 centros de distribución (BUE, SCL, MIA, BOG).'
  },
  {
    id: 'currency_converter',
    title: 'Calculadora Rápida Multidivisa a USD',
    category: 'Tesorería',
    icon: 'dollar-sign',
    desc: 'Conversor interactivo en tiempo real para cotizaciones y presupuestos en moneda local.'
  }
];

const DEFAULT_ENABLED_WIDGETS = [
  'tickets_live',
  'erp_financial',
  'department_load',
  'ecommerce_pulse',
  'currency_converter',
  'logistics_hubs'
];

export default function HomeCommandCenter({
  usuario,
  clientes = [],
  departamentos = [],
  estados = [],
  usuarios = [],
  theme = 'light',
  setActiveAdminView,
  setDepartamentoActivo
}) {
  // ── 1. Reloj en Vivo (Actualizado cada segundo) ──
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── 1.1 Sincronización Dinámica de Países de Operación de la Firma ──
  const [operatingCountries, setOperatingCountries] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/system/branding`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.operatingCountries) && data.operatingCountries.length > 0) {
          setOperatingCountries(data.operatingCountries);
        }
      })
      .catch(err => console.warn('No se pudieron cargar los países de branding en Home:', err));
  }, []);

  const timezoneGroups = useMemo(() => {
    if (!operatingCountries || operatingCountries.length === 0) {
      return TIMEZONE_GROUPS;
    }

    const activeList = operatingCountries.filter(c => c.active !== false);
    if (activeList.length === 0) return TIMEZONE_GROUPS;

    const groupsMap = {};
    activeList.forEach(c => {
      const key = c.utcOffset || 'UTC-3';
      if (!groupsMap[key]) {
        let regionName = c.regionName;
        if (!regionName) {
          if (key === 'UTC-3') regionName = 'Cono Sur & Brasil';
          else if (key === 'UTC-4') regionName = 'Estados Unidos & Caribe';
          else if (key === 'UTC-5') regionName = 'Región Andina';
          else if (key === 'UTC-6') regionName = 'México & Centroamérica';
          else if (key === 'UTC+1' || key === 'UTC+0') regionName = 'Región Europa';
          else regionName = `Zona Horaria ${key}`;
        }

        groupsMap[key] = {
          id: key.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          regionName,
          utcOffset: key,
          timeZone: c.timezone || 'America/Argentina/Buenos_Aires',
          countries: []
        };
      }

      groupsMap[key].countries.push({
        name: c.name,
        flag: c.flag || '🌐',
        city: c.city,
        hub: c.hub
      });
    });

    return Object.values(groupsMap);
  }, [operatingCountries]);

  // ── 2. Widgets Personalizables (Persistidos en LocalStorage) ──
  const [enabledWidgets, setEnabledWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_home_widgets');
      return saved ? JSON.parse(saved) : DEFAULT_ENABLED_WIDGETS;
    } catch {
      return DEFAULT_ENABLED_WIDGETS;
    }
  });

  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const toggleWidget = (widgetId) => {
    setEnabledWidgets(prev => {
      let updated;
      if (prev.includes(widgetId)) {
        updated = prev.filter(id => id !== widgetId);
      } else {
        updated = [...prev, widgetId];
      }
      try {
        localStorage.setItem('dacas_home_widgets', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving widgets preference:', e);
      }
      return updated;
    });
  };

  const removeWidget = (widgetId, widgetTitle) => {
    toggleWidget(widgetId);
    setToastMessage(`Widget "${widgetTitle}" ocultado. Puedes volver a activarlo desde "+ Gestionar Widgets".`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const resetWidgets = () => {
    setEnabledWidgets(DEFAULT_ENABLED_WIDGETS);
    try {
      localStorage.setItem('dacas_home_widgets', JSON.stringify(DEFAULT_ENABLED_WIDGETS));
    } catch (_) {}
    setToastMessage('Todos los widgets han sido restablecidos.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 3. Conversor de Divisa Interactivo ──
  const [calcUsdAmount, setCalcUsdAmount] = useState(1000);
  const [selectedCurrency, setSelectedCurrency] = useState('ARS');

  // ── 4. Cálculos en tiempo real de métricas ──
  const metrics = useMemo(() => {
    const total = clientes.length;
    const abiertos = clientes.filter(c => {
      const st = (c.estado_embudo || '').toLowerCase();
      return st.includes('abierto') || st.includes('nuevo') || st.includes('prospecto');
    }).length;
    const enProceso = clientes.filter(c => {
      const st = (c.estado_embudo || '').toLowerCase();
      return st.includes('proceso') || st.includes('pendiente') || st.includes('espera');
    }).length;
    const resueltos = clientes.filter(c => {
      const st = (c.estado_embudo || '').toLowerCase();
      return st.includes('resuelto') || st.includes('cerrado') || st.includes('finalizado') || st.includes('ganado');
    }).length;

    const urgentes = clientes.filter(c => (c.prioridad || '').toLowerCase() === 'urgente' || (c.prioridad || '').toLowerCase() === 'alta').length;

    // Distribución por Departamento
    const deptDistribution = departamentos.map(dept => {
      const count = clientes.filter(c => c.departamento === dept.id).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        id: dept.id,
        nombre: dept.nombre,
        color: dept.color || '#0fa4de',
        count,
        pct
      };
    }).sort((a, b) => b.count - a.count);

    return { total, abiertos, enProceso, resueltos, urgentes, deptDistribution };
  }, [clientes, departamentos]);

  // Función para determinar si la oficina local está abierta (Lunes a Viernes de 9 a 18)
  const getOfficeStatus = (timeZone) => {
    try {
      const options = { timeZone, hour: 'numeric', weekday: 'short', hour12: false };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      const hourPart = parts.find(p => p.type === 'hour')?.value;
      const weekdayPart = parts.find(p => p.type === 'weekday')?.value;
      const hour = parseInt(hourPart, 10);
      const isWeekend = weekdayPart === 'Sat' || weekdayPart === 'Sun';
      const isOpen = !isWeekend && hour >= 9 && hour < 18;
      return {
        isOpen,
        label: isOpen ? 'Oficinas Abiertas' : 'Fuera de Horario',
        color: isOpen ? '#10b981' : '#94a3b8'
      };
    } catch {
      return { isOpen: true, label: 'En Horario', color: '#10b981' };
    }
  };

  return (
    <div className="home-command-center" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card-bg, #0f2742)',
          color: 'var(--text-main, #ffffff)',
          border: '1px solid var(--border-color, rgba(15, 164, 222, 0.4))',
          borderRadius: '12px',
          padding: '12px 22px',
          boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.5))',
          zIndex: 9999,
          fontSize: '0.88rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <BrandingVectorIcon name="check-circle" size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 1: BIENVENIDA & RELOJES ANALÓGICOS AGRUPADOS POR ZONA HORARIA
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px',
              fontSize: '1.45rem',
              fontWeight: '900',
              color: 'var(--text-main, #071524)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <BrandingVectorIcon name="globe" size={24} color="var(--primary, #0fa4de)" />
              <span>Centro de Control Operativo DACAS Regional</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted, #64748B)' }}>
              Husos horarios consolidados con relojes analógicos en tiempo real y cotizaciones de los países donde opera DACAS.
            </p>
          </div>

          {/* Botón Personalizar Widgets */}
          <button
            type="button"
            onClick={() => setShowWidgetModal(true)}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '9px 16px',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <BrandingVectorIcon name="plus" size={15} color="#ffffff" />
            <span>Gestionar Widgets ({enabledWidgets.length}/{AVAILABLE_WIDGETS.length})</span>
          </button>
        </div>

        {/* ── Tarjetas de Zonas Horarias Dinámicas con Relojes Analógicos ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {timezoneGroups.map(grp => {
            const status = getOfficeStatus(grp.timeZone);

            const dateString = new Intl.DateTimeFormat('es-AR', {
              timeZone: grp.timeZone,
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }).format(now);

            return (
              <div
                key={grp.id}
                style={{
                  background: 'var(--pill-bg, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                {/* Cabecera de la Zona Horaria */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  paddingBottom: '10px'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.90rem', color: 'var(--text-main, #0f172a)' }}>
                      {grp.regionName}
                    </strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', textTransform: 'capitalize' }}>
                      {dateString}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    color: '#0fa4de',
                    background: 'rgba(15, 164, 222, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '8px'
                  }}>
                    {grp.utcOffset}
                  </span>
                </div>

                {/* Reloj Analógico SVG Vectorial */}
                <AnalogClock timeZone={grp.timeZone} now={now} />

                {/* Badge de Horario Comercial */}
                <div style={{
                  fontSize: '0.70rem',
                  fontWeight: '800',
                  color: status.color,
                  background: status.isOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: status.color
                  }} />
                  <span>{status.label} (9 a 18 hs)</span>
                </div>

                {/* Lista de Países y Ciudades Agrupados en esta Zona */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  marginTop: '4px',
                  background: 'var(--card-bg, #ffffff)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)'
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Países en esta Zona:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {grp.countries.map(c => (
                      <div
                        key={c.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.78rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{c.flag}</span>
                          <span style={{ fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748B)' }}>{c.city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 2: TIPOS DE CAMBIO OFICIALES Y COTIZACIONES A USD
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '20px',
        padding: '22px 24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
            }}>
              <BrandingVectorIcon name="dollar-sign" size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main, #071524)' }}>
                Tipos de Cambio Regionales a Dólar Estadounidense (USD)
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748B)' }}>
                Cotizaciones bancarias mayoristas utilizadas para facturación B2B, importaciones y tesorería.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: '700',
              color: '#0284c7',
              background: 'rgba(15, 164, 222, 0.1)',
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              Base Divisa: 1.00 USD
            </span>
          </div>
        </div>

        {/* Grid de Cotizaciones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {DEFAULT_EXCHANGE_RATES.map(fx => {
            const isPositive = fx.change24h > 0;
            const isZero = fx.change24h === 0;

            return (
              <div
                key={fx.code}
                style={{
                  background: 'var(--pill-bg, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{fx.flag}</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main, #0f172a)' }}>{fx.pair}</strong>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: isZero ? 'var(--text-muted)' : isPositive ? '#16a34a' : '#dc2626',
                    background: isZero ? 'transparent' : isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {isZero ? '0.00%' : `${isPositive ? '+' : ''}${fx.change24h}%`}
                  </span>
                </div>

                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: 'var(--text-main, #071524)'
                }}>
                  {fx.symbol}{fx.rate.toLocaleString('es-AR', { minimumFractionDigits: fx.rate < 10 ? 2 : 2 })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted, #64748B)' }}>
                  <span>{fx.country}</span>
                  <span style={{ fontWeight: '600' }}>{fx.label}</span>
                </div>

                {fx.rateFinancial && (
                  <div style={{
                    borderTop: '1px dashed var(--border-color, #cbd5e1)',
                    paddingTop: '4px',
                    marginTop: '2px',
                    fontSize: '0.70rem',
                    color: 'var(--text-muted, #64748B)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Financiero / MEP:</span>
                    <strong style={{ color: 'var(--text-main)' }}>${fx.rateFinancial.toLocaleString('es-AR')}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3: WIDGETS DE REPORTES EN VIVO (MODULAR & PERSONALIZABLE)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: '900',
          color: 'var(--text-main, #071524)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <BrandingVectorIcon name="layers" size={20} color="var(--primary, #0fa4de)" />
          <span>Tablero de Reportes & Pulso en Vivo</span>
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={resetWidgets}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color, #cbd5e1)',
              color: 'var(--text-muted, #64748B)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            title="Restablecer todos los widgets por defecto"
          >
            Restablecer Widgets
          </button>
          <button
            type="button"
            onClick={() => setShowWidgetModal(true)}
            style={{
              background: 'var(--pill-bg, #f1f5f9)',
              border: '1px solid var(--border-color, #cbd5e1)',
              color: 'var(--text-main, #0f172a)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.80rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BrandingVectorIcon name="settings" size={14} color="var(--primary, #0fa4de)" />
            <span>+ Agregar / Ocultar Widgets</span>
          </button>
        </div>
      </div>

      {/* Grid Dinámica de Widgets Habilitados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* ── WIDGET 1: TICKETS & SLA EN VIVO ── */}
        {enabledWidgets.includes('tickets_live') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="ticket" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Tickets & SLAs Operativos
                </h4>
              </div>
              <button
                type="button"
                onClick={() => removeWidget('tickets_live', 'Métricas de Tickets')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Ocultar este widget"
              >
                <BrandingVectorIcon name="x" size={14} color="currentColor" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>{metrics.total}</div>
              </div>
              <div style={{ background: 'rgba(15, 164, 222, 0.1)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700' }}>ABIERTOS</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0284c7' }}>{metrics.abiertos}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: '700' }}>EN CURSO</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#d97706' }}>{metrics.enProceso}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>RESUELTOS</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>{metrics.resueltos}</div>
              </div>
            </div>

            {/* Barra de Cumplimiento SLA */}
            <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 14px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-main)' }}>Cumplimiento de SLA Global</span>
                <span style={{ color: '#10b981' }}>98.4% a tiempo</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '98.4%', height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #0fa4de 100%)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── WIDGET 2: PULSO FINANCIERO ERP DACAS ── */}
        {enabledWidgets.includes('erp_financial') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="activity" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Salud Financiera DACAS ERP (OneWorld)
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveAdminView && setActiveAdminView('erp')}
                  style={{
                    background: 'var(--pill-bg, #f1f5f9)',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    color: 'var(--primary, #0fa4de)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Abrir ERP →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdminView && setActiveAdminView('reporteria-general')}
                  style={{
                    background: 'rgba(15, 164, 222, 0.1)',
                    border: '1px solid rgba(15, 164, 222, 0.3)',
                    color: '#0fa4de',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                  title="Ver Reportería General 360°"
                >
                  Reportería 360° →
                </button>
                <button
                  type="button"
                  onClick={() => removeWidget('erp_financial', 'Pulso Financiero ERP')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Ocultar este widget"
                >
                  <BrandingVectorIcon name="x" size={14} color="currentColor" />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>FACTURACIÓN YTD</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>$6,100,000 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD</span></div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>↑ 18.2% vs año anterior</span>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>CUENTAS POR COBRAR (A/R)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0284c7', marginTop: '2px' }}>$34,200 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD</span></div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cobranzas Net 30/60</span>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>CUENTAS POR PAGAR (A/P)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#d97706', marginTop: '2px' }}>$145,000 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD</span></div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Facturas Proveedor</span>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>TESORERÍA EN BANCOS</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$2,480,500 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USD</span></div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>Liquidez disponible</span>
              </div>
            </div>
          </div>
        )}

        {/* ── WIDGET 3: DISTRIBUCIÓN POR DEPARTAMENTO ── */}
        {enabledWidgets.includes('department_load') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="pie-chart" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Carga por Departamento
                </h4>
              </div>
              <button
                type="button"
                onClick={() => removeWidget('department_load', 'Carga por Departamento')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Ocultar este widget"
              >
                <BrandingVectorIcon name="x" size={14} color="currentColor" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {metrics.deptDistribution.slice(0, 4).map(d => (
                <div
                  key={d.id}
                  onClick={() => setDepartamentoActivo && setDepartamentoActivo(d.id)}
                  style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: '8px', transition: 'background 0.15s ease' }}
                  title="Click para filtrar por este departamento"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', fontWeight: '700', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-main)' }}>{d.nombre}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{d.count} tickets ({d.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--pill-bg, #f1f5f9)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(d.pct, 4)}%`, height: '100%', background: d.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WIDGET 4: VENTAS & E-COMMERCE DACAS SHOP ── */}
        {enabledWidgets.includes('ecommerce_pulse') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="shopping-bag" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Pulso E-Commerce DACAS Shop
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveAdminView && setActiveAdminView('ecommerce')}
                  style={{
                    background: 'var(--pill-bg, #f1f5f9)',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    color: 'var(--primary, #0fa4de)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Ver Tienda →
                </button>
                <button
                  type="button"
                  onClick={() => removeWidget('ecommerce_pulse', 'Ventas E-Commerce')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Ocultar este widget"
                >
                  <BrandingVectorIcon name="x" size={14} color="currentColor" />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: '700' }}>PEDIDOS HOY</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>14</div>
                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>+3 en espera</span>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: '700' }}>VENTAS MES</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0284c7' }}>$106.7K</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>USD Total</span>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '12px 10px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: '700' }}>STOCK CRÍTICO</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ef4444' }}>3 SKUs</div>
                <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: '700' }}>Reordenar</span>
              </div>
            </div>
          </div>
        )}

        {/* ── WIDGET 5: CALCULADORA RÁPIDA MULTIDIVISA A USD ── */}
        {enabledWidgets.includes('currency_converter') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="refresh" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Conversor Inmediato USD ↔ Moneda Local
                </h4>
              </div>
              <button
                type="button"
                onClick={() => removeWidget('currency_converter', 'Calculadora Multidivisa')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Ocultar este widget"
              >
                <BrandingVectorIcon name="x" size={14} color="currentColor" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Monto en USD</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '8px', fontWeight: '800', color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    value={calcUsdAmount}
                    onChange={(e) => setCalcUsdAmount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 24px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-main, #071524)',
                      fontSize: '1rem',
                      fontWeight: '800',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ width: '130px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>A Moneda</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-main, #071524)',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    boxSizing: 'border-box'
                  }}
                >
                  {DEFAULT_EXCHANGE_RATES.map(r => (
                    <option key={r.code} value={r.code}>{r.flag} {r.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resultado de la conversión */}
            {(() => {
              const cur = DEFAULT_EXCHANGE_RATES.find(r => r.code === selectedCurrency) || DEFAULT_EXCHANGE_RATES[0];
              const result = (calcUsdAmount * cur.rate).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return (
                <div style={{
                  background: 'var(--pill-bg, #f8fafc)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>EQUIVALENTE EN {cur.country.toUpperCase()}:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0284c7' }}>
                      {cur.symbol} {result} {cur.code}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    1 USD = {cur.rate} {cur.code}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── WIDGET 6: ALMACENES & CENTROS LOGÍSTICOS ── */}
        {enabledWidgets.includes('logistics_hubs') && (
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0,0,0,0.03))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="box" size={18} color="var(--primary, #0fa4de)" />
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #071524)' }}>
                  Hubs de Logística & Valoración
                </h4>
              </div>
              <button
                type="button"
                onClick={() => removeWidget('logistics_hubs', 'Almacenes y Logística')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Ocultar este widget"
              >
                <BrandingVectorIcon name="x" size={14} color="currentColor" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.80rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>LOC-BUE (Argentina)</span>
                <div style={{ fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$890,400 USD</div>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.80rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>LOC-SCL (Chile)</span>
                <div style={{ fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$485,000 USD</div>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.80rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>LOC-MIA (Miami FTZ)</span>
                <div style={{ fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$395,000 USD</div>
              </div>
              <div style={{ background: 'var(--pill-bg, #f8fafc)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.80rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>LOC-BOG (Colombia)</span>
                <div style={{ fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$145,000 USD</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL DE PERSONALIZACIÓN DE WIDGETS
      ══════════════════════════════════════════════════════════════════════ */}
      {showWidgetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--shadow-lg, 0 20px 40px rgba(0,0,0,0.3))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main, #071524)' }}>
                  Personalizar Widgets del Home
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #64748B)' }}>
                  Activa o desactiva los widgets de reportes en vivo según tu prioridad operativa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWidgetModal(false)}
                style={{
                  background: 'var(--pill-bg, #f1f5f9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BrandingVectorIcon name="close" size={16} color="var(--text-main)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              {AVAILABLE_WIDGETS.map(w => {
                const isEnabled = enabledWidgets.includes(w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: isEnabled ? 'rgba(15, 164, 222, 0.08)' : 'var(--pill-bg, #f8fafc)',
                      border: `1px solid ${isEnabled ? 'var(--primary, #0fa4de)' : 'var(--border-color, #e2e8f0)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isEnabled ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'var(--border-color, #cbd5e1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <BrandingVectorIcon name={w.icon} size={18} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.90rem', color: 'var(--text-main, #0f172a)' }}>
                          {w.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                          {w.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      background: isEnabled ? '#0fa4de' : '#cbd5e1',
                      position: 'relative',
                      transition: 'background 0.2s ease',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        position: 'absolute',
                        top: '3px',
                        left: isEnabled ? '22px' : '3px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={resetWidgets}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  color: 'var(--text-main)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Activar Todos
              </button>
              <button
                type="button"
                onClick={() => setShowWidgetModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)'
                }}
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
