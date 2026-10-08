import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

export default function StepCart({ cart, updateQty, removeFromCart, navigate, setStep }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandingVectorIcon name="shopping-cart" size={24} color="#0fa4de" />
            <span>1. Carro de Compras & Cotización B2B</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
            Revisá los productos agregados, cantidades y precios por cliente corporativo.
          </p>
        </div>
        <span style={{ background: '#F1F5F9', color: '#071524', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>
          {cart.reduce((s, i) => s + i.qty, 0)} ítems
        </span>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <BrandingVectorIcon name="shopping-cart" size={56} color="#94A3B8" />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#071524', fontSize: '1.2rem', fontWeight: '800' }}>Tu carrito está vacío</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px' }}>Agregá equipos o licencias desde nuestro catálogo mayorista.</p>
          <button
            onClick={() => navigate('/shop')}
            style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)' }}
          >
            Explorar Catálogo de Equipos →
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #F1F5F9', alignItems: 'center' }}>

                {/* Image Thumbnail */}
                <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <BrandingVectorIcon name="box" size={24} color="#94A3B8" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: 'rgba(15, 164, 222, 0.12)', color: '#0284C7', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                      {item.brand || 'DACAS'}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>SKU: {item.sku || `PROD-${item.id}`}</span>
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>● En Stock para Despacho</span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>${parseFloat(item.price).toFixed(2)} USD / un.</span>
                  </div>
                </div>

                {/* Quantity buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '4px 8px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F1F5F9', color: '#071524', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    −
                  </button>
                  <span style={{ fontWeight: '800', minWidth: '24px', textAlign: 'center', fontSize: '14px' }}>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F1F5F9', color: '#071524', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>

                {/* Total Line */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontWeight: '900', fontSize: '15px', color: '#071524' }}>
                    ${(parseFloat(item.price) * item.qty).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>USD Total</div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Quitar"
                >
                  <BrandingVectorIcon name="trash-2" size={16} color="#94A3B8" />
                </button>
              </div>
            ))}
          </div>

          {/* Step 1 Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={() => navigate('/shop')}
              style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Agregar más productos
            </button>
            <button
              onClick={() => setStep('billing')}
              style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
            >
              Continuar a Datos Fiscales & Facturación →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
