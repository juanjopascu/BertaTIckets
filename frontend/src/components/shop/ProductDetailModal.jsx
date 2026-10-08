import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import BrandingVectorIcon from '../../BrandingVectorIcon';

/* ─── POP-UP MODAL WITH INTERACTIVE PHOTO CAROUSEL & DETAILS ─── */
export default function ProductDetailModal({ product, clientUser, onOpenAuth, onClose, onAddToCart }) {
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
