import React, { useState, useMemo } from 'react';

export const isProductInCat = (p, catKey) => {
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

export const CAROUSEL_CATEGORIES = [
  { key: 'all', label: 'Todo el Catálogo' },
  { key: 'networking', label: '🌐 Networking & Conectividad' },
  { key: 'infraestructura', label: '⚡ Infraestructura & Datacenter' },
  { key: 'comunicaciones_unificadas', label: '📞 Comunicaciones Unificadas' },
  { key: 'security', label: '🛡️ Ciberseguridad & Firewalls' }
];

export default function CarouselEditorCard({
  carousel,
  index,
  total,
  allProducts = [],
  availableBrands = [],
  availableCategories = CAROUSEL_CATEGORIES,
  onUpdate,
  onToggleProduct,
  onSelectAllVisible,
  onClearAll,
  onMove,
  onDuplicate,
  onDelete
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const q = productSearch.trim().toLowerCase();
      const matchSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));
      const matchBrand = filterBrand === 'all' || (p.brand && p.brand.toLowerCase() === filterBrand.toLowerCase());
      const matchCat = filterCategory === 'all' || isProductInCat(p, filterCategory);
      return matchSearch && matchBrand && matchCat;
    });
  }, [allProducts, productSearch, filterBrand, filterCategory]);

  const selectedIds = Array.isArray(carousel.productIds) ? carousel.productIds : [];
  const selectedProducts = useMemo(() => {
    const idSet = new Set(selectedIds.map(id => parseInt(id)));
    return allProducts.filter(p => idSet.has(parseInt(p.id)));
  }, [allProducts, selectedIds]);

  const matchingCategoryCount = useMemo(() => {
    if (carousel.selectionType !== 'category' || !carousel.targetCategory || carousel.targetCategory === 'all') return allProducts.length;
    return allProducts.filter(p => isProductInCat(p, carousel.targetCategory)).length;
  }, [allProducts, carousel.selectionType, carousel.targetCategory]);

  const matchingBrandCount = useMemo(() => {
    if (carousel.selectionType !== 'brand' || !carousel.targetBrand || carousel.targetBrand === 'all') return allProducts.length;
    return allProducts.filter(p => p.brand && p.brand.toLowerCase() === carousel.targetBrand.toLowerCase()).length;
  }, [allProducts, carousel.selectionType, carousel.targetBrand]);

  const PRESET_COLORS = ['#0fa4de', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const ICONS_LIST = [
    { key: 'star', label: '⭐ Estrella' },
    { key: 'shield', label: '🛡️ Escudo' },
    { key: 'zap', label: '⚡ Rayo' },
    { key: 'fire', label: '🔥 Fuego' },
    { key: 'tag', label: '🏷️ Etiqueta' },
    { key: 'box', label: '📦 Caja' },
    { key: 'cpu', label: '💻 Hardware' }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: carousel.enabled !== false ? '1.5px solid #CBD5E1' : '1px dashed #CBD5E1',
      borderRadius: '18px',
      marginBottom: '20px',
      boxShadow: carousel.enabled !== false ? '0 4px 16px rgba(0,0,0,0.04)' : 'none',
      opacity: carousel.enabled !== false ? 1 : 0.75,
      transition: 'all 0.2s ease',
      overflow: 'hidden'
    }}>
      {/* Header bar */}
      <div style={{
        background: carousel.enabled !== false ? '#F8FAFC' : '#F1F5F9',
        padding: '14px 20px',
        borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Position, Title, Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <span style={{
            background: '#0fa4de',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: '900',
            padding: '3px 9px',
            borderRadius: '8px',
            letterSpacing: '0.05em'
          }}>
            #{index + 1}
          </span>
          <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
            {carousel.title || 'Carrusel sin título'}
          </span>
          {carousel.badge && (
            <span style={{
              background: `${carousel.badgeColor || '#0fa4de'}18`,
              color: carousel.badgeColor || '#0fa4de',
              border: `1px solid ${carousel.badgeColor || '#0fa4de'}40`,
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {carousel.badge}
            </span>
          )}
          <span style={{
            fontSize: '11.5px',
            color: '#64748B',
            background: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            fontWeight: '600'
          }}>
            {carousel.selectionType === 'category' ? `📂 Cat: ${carousel.targetCategory || 'networking'} (${matchingCategoryCount} prod.)` :
             carousel.selectionType === 'brand' ? `🏷️ Marca: ${(carousel.targetBrand || '').toUpperCase()} (${matchingBrandCount} prod.)` :
             carousel.selectionType === 'manual' ? `🎯 ${selectedIds.length} seleccionados` : '⭐ Destacados'}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Mover arriba"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 9px',
              borderRadius: '6px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              opacity: index === 0 ? 0.35 : 1,
              fontSize: '12px',
              fontWeight: '800'
            }}
          >
            ⬆️
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Mover abajo"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 9px',
              borderRadius: '6px',
              cursor: index === total - 1 ? 'not-allowed' : 'pointer',
              opacity: index === total - 1 ? 0.35 : 1,
              fontSize: '12px',
              fontWeight: '800'
            }}
          >
            ⬇️
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicar carrusel"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '5px 9px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              color: '#334155'
            }}
          >
            📋 Duplicar
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar carrusel"
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '5px 9px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            🗑️ Eliminar
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: carousel.enabled !== false ? '#0284c7' : '#64748B', cursor: 'pointer', marginLeft: '6px' }}>
            <input
              type="checkbox"
              checked={carousel.enabled !== false}
              onChange={(e) => onUpdate('enabled', e.target.checked)}
              style={{ accentColor: '#0fa4de', cursor: 'pointer' }}
            />
            {carousel.enabled !== false ? 'Activo' : 'Oculto'}
          </label>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '900',
              color: '#64748B'
            }}
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div style={{ padding: '20px 24px' }}>
          {/* Row 1: Texts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                Título del Carrusel:
              </label>
              <input
                type="text"
                value={carousel.title || ''}
                onChange={(e) => onUpdate('title', e.target.value)}
                placeholder="Ej: 🔥 Ofertas Especiales IT"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                Subtítulo / Bajada:
              </label>
              <input
                type="text"
                value={carousel.subtitle || ''}
                onChange={(e) => onUpdate('subtitle', e.target.value)}
                placeholder="Ej: Soluciones corporativas con precios mayoristas para canales"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px' }}
              />
            </div>
          </div>

          {/* Row 2: Badge, Color & Icon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                Badge Superior:
              </label>
              <input
                type="text"
                value={carousel.badge || ''}
                onChange={(e) => onUpdate('badge', e.target.value)}
                placeholder="Ej: SELECCIÓN DACAS"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                Color del Badge:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="color"
                  value={carousel.badgeColor || '#0fa4de'}
                  onChange={(e) => onUpdate('badgeColor', e.target.value)}
                  style={{ width: '32px', height: '30px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: 0 }}
                />
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {PRESET_COLORS.map(c => (
                    <span
                      key={c}
                      onClick={() => onUpdate('badgeColor', c)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: carousel.badgeColor === c ? '2px solid #0F172A' : '1px solid rgba(0,0,0,0.15)',
                        transform: carousel.badgeColor === c ? 'scale(1.15)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                Ícono:
              </label>
              <select
                value={carousel.icon || 'star'}
                onChange={(e) => onUpdate('icon', e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              >
                {ICONS_LIST.map(ic => (
                  <option key={ic.key} value={ic.key}>{ic.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Product Selection Mode */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
              🎯 Modo de Selección de Productos para este Carrusel:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              {[
                { type: 'category', title: '📂 Por Categoría Entera', desc: 'Muestra automáticamente todos los equipos de una categoría' },
                { type: 'brand', title: '🏷️ Por Marca Completa', desc: 'Muestra automáticamente todos los productos de un fabricante' },
                { type: 'manual', title: '🎯 Manual / Específica', desc: 'Eliges qué productos exactos mostrar con buscador' },
                { type: 'featured', title: '⭐ Automático Destacados', desc: 'Productos destacados y con stock de alta rotación' }
              ].map(mode => {
                const isSelected = (carousel.selectionType || 'manual') === mode.type;
                return (
                  <div
                    key={mode.type}
                    onClick={() => onUpdate('selectionType', mode.type)}
                    style={{
                      border: isSelected ? '2px solid #0fa4de' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#F0F9FF' : '#FFFFFF',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '12.5px', color: isSelected ? '#0284c7' : '#1E293B', marginBottom: '2px' }}>
                      {mode.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                      {mode.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mode 1: By Category */}
            {carousel.selectionType === 'category' && (
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  Selecciona la Categoría:
                </label>
                <select
                  value={carousel.targetCategory || 'networking'}
                  onChange={(e) => onUpdate('targetCategory', e.target.value)}
                  style={{ width: '100%', maxWidth: '420px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  {availableCategories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>
                  ✅ Este carrusel cargará automáticamente los <strong>{matchingCategoryCount} productos</strong> de esta categoría activos con stock para este país.
                </div>
              </div>
            )}

            {/* Mode 2: By Brand */}
            {carousel.selectionType === 'brand' && (
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  Selecciona el Fabricante / Marca:
                </label>
                <select
                  value={carousel.targetBrand || availableBrands[0] || 'fortinet'}
                  onChange={(e) => onUpdate('targetBrand', e.target.value)}
                  style={{ width: '100%', maxWidth: '420px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b.toUpperCase()}</option>
                  ))}
                </select>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>
                  ✅ Este carrusel cargará automáticamente los <strong>{matchingBrandCount} productos</strong> de <strong>{(carousel.targetBrand || '').toUpperCase()}</strong> disponibles para este país.
                </div>
              </div>
            )}

            {/* Mode 3: Manual Selection with Search and Filters */}
            {carousel.selectionType === 'manual' && (
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                {/* Search & Filter Toolbar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="🔍 Buscar por nombre, marca o SKU..."
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  >
                    <option value="all">Todas las Categorías</option>
                    {availableCategories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  >
                    <option value="all">Todas las Marcas</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b.toUpperCase()}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onSelectAllVisible(filteredProducts.map(p => p.id))}
                    style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0284c7', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    + Seleccionar Visibles ({filteredProducts.length})
                  </button>
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearAll}
                      style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Quitar Todos
                    </button>
                  )}
                </div>

                {/* Selected Products Chips Bar */}
                {selectedProducts.length > 0 && (
                  <div style={{ marginBottom: '12px', background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0284c7', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Equipos seleccionados para este carrusel ({selectedProducts.length}):</span>
                      <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 'normal' }}>Haz clic en la ✕ para quitar cualquiera</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '110px', overflowY: 'auto' }}>
                      {selectedProducts.map(p => (
                        <span
                          key={p.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#F0F9FF',
                            border: '1px solid #BAE6FD',
                            color: '#0369A1',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleProduct(p.id)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '900', cursor: 'pointer', padding: 0, fontSize: '12px' }}
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scrollable Products List with Checkboxes */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px' }}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(prod => {
                      const isChecked = selectedIds.includes(parseInt(prod.id));
                      return (
                        <div
                          key={prod.id}
                          onClick={() => onToggleProduct(prod.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isChecked ? '#F0F9FF' : 'transparent',
                            border: isChecked ? '1px solid #BAE6FD' : '1px solid transparent',
                            marginBottom: '3px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: '#0fa4de', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, minWidth: 0, fontSize: '12px' }}>
                            <span style={{ fontWeight: '700', color: '#0F172A' }}>{prod.name}</span>
                            <span style={{ color: '#64748B', marginLeft: '6px', fontSize: '11px' }}>
                              ({prod.brand || 'DACAS'}) · SKU: {prod.sku || 'N/A'} · ${parseFloat(prod.price || 0).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '16px', fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                      No se encontraron productos con ese filtro.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 4: Automatic / Featured */}
            {carousel.selectionType === 'featured' && (
              <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                ⭐ <strong>Modo Automático:</strong> Este carrusel mostrará automáticamente los productos marcados como <em>Destacados</em>, <em>Nuevos</em> o con stock de alta rotación para este país sin necesidad de seleccionarlos a mano.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
