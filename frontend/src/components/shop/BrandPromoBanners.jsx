import React, { useMemo } from 'react';

export default function BrandPromoBanners({ banners = [], onBrandClick }) {
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
