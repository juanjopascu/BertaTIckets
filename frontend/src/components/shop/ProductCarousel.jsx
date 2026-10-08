import React, { useState, useRef, useEffect, useCallback } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import ProductCard from './ProductCard';

export default function ProductCarousel({
  title,
  subtitle,
  badge,
  badgeColor = '#0fa4de',
  icon = 'star',
  products = [],
  clientUser,
  selectedCountryCode,
  selectedCountryObj,
  onSelectProduct,
  onAddToCart,
  justAddedId,
  onOpenAuth,
  onViewAll
}) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const interactionTimerRef = useRef(null);

  // Calcula dinámicamente el ancho de avance de una tarjeta + gap
  const getStepWidth = useCallback(() => {
    if (!scrollRef.current) return 300;
    const firstChild = scrollRef.current.firstElementChild;
    if (firstChild && firstChild.offsetWidth > 0) {
      return firstChild.offsetWidth + 22;
    }
    return (scrollRef.current.clientWidth - 3 * 22) / 4 + 22;
  }, []);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const step = getStepWidth();
      const amount = dir === 'left' ? -step : step;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });

      // Pausa temporal del auto-scroll durante 6s tras clic manual del usuario
      setUserInteracted(true);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = setTimeout(() => {
        setUserInteracted(false);
      }, 6000);
    }
  };

  // Auto-rotación continua si el carrusel tiene más de 4 productos
  useEffect(() => {
    if (!products || products.length <= 4 || isHovered || userInteracted) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const step = getStepWidth();
        // Si está a punto de llegar al final del track, regresa suavemente al inicio
        if (scrollLeft + clientWidth >= scrollWidth - 18) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [products, isHovered, userInteracted, getStepWidth]);

  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, []);

  if (!products || products.length === 0) return null;

  const isDynamic = products.length > 4;

  return (
    <section style={{ margin: '30px 0 42px', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {badge && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: `${badgeColor}18`,
                color: badgeColor,
                border: `1px solid ${badgeColor}33`,
                fontSize: '11px',
                fontWeight: '800',
                padding: '3px 11px',
                borderRadius: '999px',
                letterSpacing: '0.04em'
              }}>
                <BrandingVectorIcon name={icon} size={11} color={badgeColor} />
                <span>{badge}</span>
              </div>
            )}
            {isDynamic && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10.5px',
                fontWeight: '750',
                color: isHovered ? '#64748B' : '#0fa4de',
                background: isHovered ? '#F1F5F9' : '#F0F9FF',
                border: `1px solid ${isHovered ? '#CBD5E1' : '#BAE6FD'}`,
                padding: '2px 9px',
                borderRadius: '999px',
                transition: 'all 0.2s'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isHovered ? '#94A3B8' : '#0fa4de',
                  boxShadow: isHovered ? 'none' : '0 0 6px #0fa4de'
                }} />
                <span>{isHovered ? 'Pausado' : 'Rotación automática'}</span>
              </div>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#071524', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748B' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onViewAll && (
            <button
              onClick={onViewAll}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                color: '#0fa4de',
                fontWeight: '750',
                fontSize: '12.5px',
                padding: '7px 15px',
                borderRadius: '999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.background = '#F0F9FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <span>Ver todos</span>
              <span>→</span>
            </button>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleScroll('left')}
              aria-label="Anterior"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#071524',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
            >
              ‹
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Siguiente"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#071524',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0fa4de'; e.currentTarget.style.color = '#0fa4de'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#071524'; }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track - Alineado exactamente al margen con los banners */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          display: 'flex',
          gap: '22px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '4px 0 16px',
          margin: 0,
          width: '100%',
          boxSizing: 'border-box',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {products.map((product) => (
          <div
            key={`carousel-p-${product.id}`}
            style={{
              flex: '0 0 calc((100% - 3 * 22px) / 4)',
              width: 'calc((100% - 3 * 22px) / 4)',
              minWidth: '260px',
              maxWidth: 'calc((100% - 3 * 22px) / 4)',
              height: '400px',
              boxSizing: 'border-box'
            }}
          >
            <ProductCard
              product={product}
              clientUser={clientUser}
              selectedCountryCode={selectedCountryCode}
              selectedCountryObj={selectedCountryObj}
              onOpenAuth={onOpenAuth}
              onSelectProduct={() => onSelectProduct(product)}
              onAddToCart={(e) => {
                e.stopPropagation();
                onAddToCart(product, 1);
              }}
              justAdded={justAddedId === product.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
