import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

export default function CheckoutOrderSummary({
  cart = [],
  appliedCoupon = null,
  handleApplyCoupon,
  couponInput = '',
  setCouponInput,
  couponLoading = false,
  handleRemoveCoupon,
  couponError = '',
  couponSuccess = '',
  cartTotal = 0,
  discountAmount = 0,
  isArgentinaClient = false,
  activePercepcionesList = [],
  finalOrderTotal = 0
}) {
  return (
    <div style={{ position: 'sticky', top: '90px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandingVectorIcon name="shopping-cart" size={18} color="#0FA4DE" />
          <span>Resumen de la Cotización</span>
        </h3>

        {/* Items preview list */}
        <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <div style={{ fontWeight: '700', color: '#071524', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ color: '#94A3B8', fontSize: '11px' }}>Cant: {item.qty} × ${parseFloat(item.price).toFixed(2)}</div>
              </div>
              <div style={{ fontWeight: '800', color: '#071524', flexShrink: 0 }}>
                ${(parseFloat(item.price) * item.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code Redemption Box */}
        <div style={{ margin: '14px 0', padding: '14px', background: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BrandingVectorIcon name="tag" size={13} color="#0FA4DE" />
            <span>¿Tenés un Cupón de Descuento?</span>
          </div>

          {!appliedCoupon ? (
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Ej: FORTINET15"
                value={couponInput}
                onChange={e => setCouponInput && setCouponInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0F172A'
                }}
              />
              <button
                type="submit"
                disabled={couponLoading || !couponInput.trim()}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: (couponLoading || !couponInput.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (couponLoading || !couponInput.trim()) ? 0.7 : 1
                }}
              >
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#DCFCE7', padding: '8px 12px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrandingVectorIcon name="tag" size={13} color="#166534" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#166534' }}>{appliedCoupon.code}</div>
                  <div style={{ fontSize: '10.5px', color: '#15803D' }}>{appliedCoupon.discount_display}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: '800', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Quitar cupón"
              >
                <BrandingVectorIcon name="x" size={13} color="#DC2626" />
              </button>
            </div>
          )}

          {couponError && (
            <div style={{ color: '#DC2626', fontSize: '11px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BrandingVectorIcon name="alert-circle" size={12} color="#DC2626" />
              <span>{couponError}</span>
            </div>
          )}
          {couponSuccess && !couponError && (
            <div style={{ color: '#166534', fontSize: '11px', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BrandingVectorIcon name="check-circle" size={12} color="#166534" />
              <span>{couponSuccess}</span>
            </div>
          )}
        </div>

        {/* Calculations */}
        <div style={{ borderTop: '1.5px solid #F1F5F9', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>
            <span>Subtotal Neto:</span>
            <span style={{ fontWeight: '700', color: '#071524' }}>${cartTotal.toFixed(2)} USD</span>
          </div>

          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16A34A', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Descuento ({appliedCoupon?.code || 'Cupón'}):</span>
              </span>
              <span style={{ fontWeight: '800' }}>-${discountAmount.toFixed(2)} USD</span>
            </div>
          )}

          {isArgentinaClient && activePercepcionesList.length > 0 && (
            <div style={{ margin: '8px 0', padding: '8px 10px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FEF3C7' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Percepciones IIBB (Base Neta):
              </div>
              {activePercepcionesList.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#B45309', marginBottom: '3px' }}>
                  <span>Perc. {p.label} ({p.alicuota.toFixed(2)}%):</span>
                  <span style={{ fontWeight: '800' }}>+${p.amount.toFixed(2)} USD</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
            <span>Envío B2B:</span>
            <span style={{ fontWeight: '700', color: '#16A34A' }}>Bonificado (B2B)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '900', color: '#071524', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
            <span>Total Final:</span>
            <span style={{ color: '#0FA4DE' }}>${finalOrderTotal.toFixed(2)} USD</span>
          </div>
        </div>

      </div>
    </div>
  );
}
