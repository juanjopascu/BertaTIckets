import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import ProductCarousel from './ProductCarousel';
import { DACAS_COUNTRIES, CATEGORIES } from './shopCatalogData';

/* ─── PRODUCT DETAIL PAGE VIEW (PÁGINA DEDICADA DE PRODUCTO) ─── */
export default function ProductDetailPageView({
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
