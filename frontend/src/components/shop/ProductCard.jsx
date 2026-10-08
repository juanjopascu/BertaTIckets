import React, { useState } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { DACAS_COUNTRIES } from './shopCatalogData';

export default function ProductCard({
  product,
  clientUser,
  onOpenAuth,
  onSelectProduct,
  onAddToCart,
  justAdded,
  selectedCountryCode,
  selectedCountryObj
}) {
  const [hovered, setHovered] = useState(false);
  const activeCountryCode = selectedCountryCode || (() => {
    try { return localStorage.getItem('dacas_selected_country') || 'AR'; } catch { return 'AR'; }
  })();
  const activeCountryObj = selectedCountryObj || DACAS_COUNTRIES.find((c) => c.code === activeCountryCode) || DACAS_COUNTRIES[1] || { flag: '🇦🇷', name: 'Argentina' };
  const mainImage = product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? (mainImage && !product.images.includes(mainImage) ? [mainImage, ...product.images] : product.images)
    : (mainImage ? [mainImage] : []);
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
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', height: '165px', minHeight: '165px', maxHeight: '165px', overflow: 'hidden', background: '#F8FAFC' }}>
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
            <BrandingVectorIcon name="package" size={42} color="#94A3B8" />
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: product.badgeColor || '#0fa4de',
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {product.badge}
          </span>
        )}

        {/* Multiple Photos indicator */}
        {images.length > 1 && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(7, 21, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <BrandingVectorIcon name="camera" size={11} color="#ffffff" />
            <span>{images.length}</span>
          </span>
        )}

        {/* Stock country badge */}
        {product.stock !== undefined && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: product.stock > 0 ? (product.stock <= 10 ? 'rgba(234, 88, 12, 0.95)' : 'rgba(16, 185, 129, 0.95)') : 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {product.stock > 0 ? (
              <span>{activeCountryObj.flag} Stock {activeCountryCode}: {product.stock} un.</span>
            ) : (
              <span>{activeCountryObj.flag} Sin stock en {activeCountryObj.name}</span>
            )}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Header tags: Brand, SKU & Discount Rule */}
          <div style={{ minHeight: '34px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '3px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap', overflow: 'hidden' }}>
              {product.brand && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: '#E0F2FE',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {product.brand}
                </span>
              )}
              {product.subcategory && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '750',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  color: '#0284c7',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {product.subcategory}
                </span>
              )}
              {product.sku && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
              {product.applied_rule ? (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  background: '#DCFCE7',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                  padding: '1px 7px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <BrandingVectorIcon name="tag" size={10} color="#166534" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.applied_rule.rule_name || product.applied_rule.name || 'Descuento B2B'}
                  </span>
                  {product.discount_percent && <span style={{ flexShrink: 0 }}>(-{product.discount_percent}%)</span>}
                </span>
              ) : null}
            </div>
          </div>

          {/* Title - exactly 2 lines clamped */}
          <h3
            title={product.name}
            style={{
              margin: '0 0 4px',
              fontSize: '13.5px',
              fontWeight: '800',
              color: '#071524',
              lineHeight: '1.3',
              height: '36px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.name}
          </h3>

          {/* Description - exactly 2 lines clamped */}
          <div
            style={{
              margin: '0 0 8px',
              fontSize: '11px',
              color: '#64748B',
              lineHeight: '1.35',
              height: '30px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.description ? product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
          </div>
        </div>

        {/* Bottom Price and Add to Cart Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #F1F5F9', minHeight: '44px' }}>
          {isLocked ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontSize: '12px', fontWeight: '800' }}>
                <BrandingVectorIcon name="lock" size={12} color="#0369a1" />
                <span>Precio B2B</span>
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>
                Canal autorizado
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#071524', lineHeight: 1 }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ minHeight: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                  <>
                    <span style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ${product.base_price} USD
                    </span>
                    <span style={{ fontSize: '9px', background: '#DCFCE7', color: '#166534', fontWeight: '800', padding: '1px 4px', borderRadius: '4px' }}>
                      -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}%
                    </span>
                  </>
                ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                  <span style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ${product.promotional_price} USD
                  </span>
                ) : null}
              </div>
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
                borderRadius: '10px',
                padding: '7px 12px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 3px 10px rgba(7,21,36,0.18)'
              }}
            >
              <BrandingVectorIcon name="lock" size={12} color="#38bdf8" />
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
                borderRadius: '10px',
                padding: '7px 14px',
                fontWeight: '750',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {justAdded ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BrandingVectorIcon name="check" size={13} color="#FFFFFF" /> Agregado
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BrandingVectorIcon name="plus" size={13} color="#FFFFFF" /> Agregar
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
