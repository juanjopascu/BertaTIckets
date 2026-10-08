import React, { useMemo } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { BrandLogoImg, BRAND_INFO, DISALLOWED_BRANDS } from './shopCatalogData';

/* ── Brands Directory View Component (Sección Dedicada de Marcas Oficiales) ── */
export default function BrandsDirectoryView({
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
    const keysSet = new Set();
    Object.values(categoryBrandsMap || {}).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => {
          const name = typeof item === 'string' ? item : item?.name;
          if (name) keysSet.add(name.toLowerCase().trim());
        });
      }
    });

    // Fallback inicial si categoryBrandsMap aún no está listo
    if (keysSet.size === 0) {
      Object.keys(BRAND_INFO).forEach(k => keysSet.add(k.toLowerCase().trim()));
    }

    if (visualSettings?.brandCustomInfo) {
      Object.keys(visualSettings.brandCustomInfo).forEach(k => keysSet.add(k.toLowerCase().trim()));
    }
    products.forEach(p => {
      if (p.brand && !DISALLOWED_BRANDS.includes(p.brand.toLowerCase())) {
        keysSet.add(p.brand.toLowerCase().trim());
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
        const finalBanner = (custom && custom.banner !== undefined && custom.banner !== '') ? custom.banner : (info.banner || null);
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
          banner: finalBanner,
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
