import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

export default function StepSuccess({ createdOrder, navigate }) {
  if (!createdOrder) return null;

  return (
    <div className="printable-proforma proforma-container ecommerce-proforma-voucher" style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>

      {/* Header Voucher */}
      <div style={{ paddingBottom: '28px', borderBottom: '2px solid #071524', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0fa4de', letterSpacing: '-0.02em' }}>DACAS S.A.</div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#071524' }}>Distribuidor Mayorista de Valor Agregado B2B</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>CUIT: 30-68942158-9 · IVA Responsable Inscripto</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>Av. del Libertador 4500, CABA · ventas@dacas.com · www.dacas.com</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: '#071524', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px', letterSpacing: '0.04em' }}>
            FACTURA PROFORMA B2B
          </div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#0fa4de' }}>ORDEN #{createdOrder.id}</div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>Fecha: {new Date(createdOrder.created_at || Date.now()).toLocaleDateString()}</div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>Validez de Oferta: 15 días corridos</div>
        </div>
      </div>

      {/* Visual Tracking Stepper (Hidden on Print) */}
      <div className="no-print" style={{ padding: '28px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
          Estado Actual del Pedido en Tiempo Real
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
          {[
            { title: '1. Pedido Registrado', desc: 'Validación de Stock', status: 'done', icon: 'file-text' },
            { title: '2. Ficha & Crédito', desc: 'Aprobación Comercial', status: 'current', icon: 'search' },
            { title: '3. Picking & Armado', desc: 'Preparación IT', status: 'box' },
            { title: '4. En Despacho', desc: 'Guía de Transporte', status: 'pending', icon: 'truck' },
          ].map(st => (
            <div key={st.title} style={{
              background: st.status === 'done' ? '#ECFDF5' : st.status === 'current' ? '#EFF6FF' : '#F8FAFC',
              border: `1.5px solid ${st.status === 'done' ? '#10B981' : st.status === 'current' ? '#0fa4de' : '#E2E8F0'}`,
              borderRadius: '16px',
              padding: '16px',
            }}>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <BrandingVectorIcon name={st.icon} size={24} color={st.status === 'done' ? '#059669' : st.status === 'current' ? '#0284C7' : '#94A3B8'} />
              </div>
              <div style={{ fontWeight: '800', fontSize: '13px', color: st.status === 'done' ? '#065F46' : st.status === 'current' ? '#0369A1' : '#64748B' }}>
                {st.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{st.desc}</div>
              <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: st.status === 'done' ? '#059669' : st.status === 'current' ? '#0284C7' : '#94A3B8' }}>
                {st.status === 'done' ? 'Completado' : st.status === 'current' ? 'En Proceso' : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voucher Metadata Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', padding: '20px 0', borderBottom: '1px solid #F1F5F9', fontSize: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Código de Seguimiento</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0fa4de', marginTop: '2px' }}>{createdOrder.tracking_number || `DACAS-LOG-AR-${createdOrder.id}`}</div>
        </div>
        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Condición de Pago</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524', marginTop: '2px' }}>{createdOrder.payment_method || 'Cuenta Corriente Comercial'}</div>
        </div>
        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Modalidad de Despacho</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524', marginTop: '2px' }}>{createdOrder.shipping_method || 'Envío a Domicilio'}</div>
        </div>
        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Destino / Entrega</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginTop: '2px' }}>{createdOrder.shipping_address}</div>
        </div>

        {createdOrder.end_user && (
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '10.5px', color: '#0FA4DE', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrandingVectorIcon name="briefcase" size={13} color="#0FA4DE" />
              <span>Datos de End User (Usuario Final para Garantía & Licencia):</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '3px' }}>
              {createdOrder.end_user.nombre}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              {createdOrder.end_user.direccion && <span>📍 {createdOrder.end_user.direccion}</span>}
              {(createdOrder.end_user.ciudad || createdOrder.end_user.pais) && (
                <span>🌎 {[createdOrder.end_user.ciudad, createdOrder.end_user.pais].filter(Boolean).join(', ')}</span>
              )}
              {createdOrder.end_user.telefono && <span>📞 {createdOrder.end_user.telefono}</span>}
              {createdOrder.end_user.contacto && <span>👤 Contacto/CEO: <strong>{createdOrder.end_user.contacto}</strong></span>}
              {createdOrder.end_user.website && <span>🌐 <a href={createdOrder.end_user.website.startsWith('http') ? createdOrder.end_user.website : `https://${createdOrder.end_user.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0FA4DE', textDecoration: 'none' }}>{createdOrder.end_user.website}</a></span>}
            </div>
          </div>
        )}
      </div>

      {/* Items Summary Table */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 14px', color: '#071524' }}>Detalle de Productos Cotizados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#071524', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', borderRadius: '6px 0 0 6px' }}>Producto / Descripción</th>
              <th style={{ padding: '10px 12px' }}>Marca / SKU</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cantidad</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Precio Unitario</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {createdOrder.items?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 12px', fontWeight: '700', color: '#071524' }}>{item.product_name}</td>
                <td style={{ padding: '10px 12px', color: '#64748B' }}>{item.brand || 'DACAS'} · {item.sku || 'SKU-DACAS'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>${parseFloat(item.price_at_purchase).toFixed(2)} USD</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0fa4de' }}>
                  ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)} USD
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Breakdown & Bank Wire Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px', alignItems: 'start' }}>
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '14px', fontSize: '11.5px', color: '#0369A1' }}>
            <div style={{ fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrandingVectorIcon name="bank" size={14} color="#0369A1" />
              <span>Cuentas Bancarias DACAS S.A. para Transferencias:</span>
            </div>
            <div>Banco: <strong>Banco Santander / BBVA</strong></div>
            <div>CBU: <strong>0720123920000001234567</strong> | Alias: <strong>DACAS.PAGOS.B2B</strong></div>
            <div>SWIFT: <strong>BAPROARBAXXX</strong> | CUIT: <strong>30-68942158-9</strong></div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px 20px', borderRadius: '12px', textAlign: 'right', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Subtotal Neto B2B: <strong>${createdOrder.subtotal || createdOrder.total} USD</strong></div>
            {parseFloat(createdOrder.discount_applied || 0) > 0 && (
              <div style={{ fontSize: '12px', color: '#10B981', marginBottom: '4px' }}>Descuentos aplicados: <strong>-${createdOrder.discount_applied} USD</strong></div>
            )}
            {parseFloat(createdOrder.percepciones_total || 0) > 0 && (
              <div style={{ fontSize: '12px', color: '#D97706', marginBottom: '4px' }}>
                Percepciones IIBB: <strong>+${parseFloat(createdOrder.percepciones_total).toFixed(2)} USD</strong>
              </div>
            )}
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#071524', borderTop: '1.5px solid #E2E8F0', paddingTop: '8px' }}>
              Total Final: <span style={{ color: '#0fa4de' }}>${parseFloat(createdOrder.total).toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden during Print) */}
      <div className="no-print" style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
          }}
        >
          <BrandingVectorIcon name="printer" size={16} color="#ffffff" />
          <span>Imprimir / Guardar como PDF</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shop/portal')}
          style={{
            background: '#071524',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BrandingVectorIcon name="user" size={16} color="#ffffff" />
          <span>Ver en Mi Panel de Cliente →</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shop')}
          style={{
            background: '#F1F5F9',
            color: '#475569',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 24px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Volver al Catálogo
        </button>
      </div>
    </div>
  );
}
