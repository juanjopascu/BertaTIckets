import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import { statusStyle } from '../adminHelpers';

export default function OrderDetailModal({
  isOpen,
  selectedOrder,
  onClose,
  handleUpdateOrderStatus
}) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95%',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(15, 164, 222, 0.2)', border: '1px solid rgba(15, 164, 222, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrandingVectorIcon name="ticket" size={20} color="#0FA4DE" />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Orden de Compra B2B #{selectedOrder.id}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                Registrada el {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('es-AR') : '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>Estado:</span>
              <select
                value={selectedOrder.status || 'procesando'}
                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  border: 'none',
                  ...statusStyle(selectedOrder.status)
                }}
              >
                <option value="procesando">En Preparación</option>
                <option value="en_camino">En Despacho</option>
                <option value="entregado">Entregado</option>
                <option value="paid">Pagado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BrandingVectorIcon name="x" size={16} color="#64748B" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          
          {/* Left Column: Products & Notes */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrandingVectorIcon name="shopping-bag" size={15} color="#0FA4DE" />
              <span>Productos Solicitados ({selectedOrder.items?.length || 1})</span>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#ffffff' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name || item.name} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    ) : (
                      <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrandingVectorIcon name="box" size={18} color="#94A3B8" />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '12.5px' }}>{item.product_name || item.name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', display: 'flex', gap: '6px' }}>
                        {item.brand && <span style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>{item.brand}</span>}
                        {item.sku && <span>SKU: {item.sku}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#071524', fontSize: '12.5px' }}>
                        ${parseFloat(item.price_at_purchase || item.price || 0).toFixed(2)} USD
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                        Cant: <strong>{item.quantity || item.qty || 1}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '14px', color: '#64748B', fontSize: '12px', textAlign: 'center' }}>
                  • Ítem de Hardware / Licenciamiento registrado en la orden
                </div>
              )}
            </div>

            {/* Logistics & Delivery Notes */}
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrandingVectorIcon name="truck" size={14} color="#0FA4DE" />
                <span>Modalidad y Despacho</span>
              </div>
              <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                <div><strong>Dirección:</strong> {selectedOrder.shipping_address || 'Dirección registrada en ficha de cliente'}</div>
                <div><strong>Modalidad:</strong> {selectedOrder.shipping_method || 'Envío Express a Domicilio'}</div>
                {selectedOrder.tracking_number && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Tracking:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                      {selectedOrder.tracking_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CRM Ticket Integration Card */}
            <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', padding: '14px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '800', fontSize: '12px' }}>
                <BrandingVectorIcon name="ticket" size={14} color="#166534" />
                <span>Ticket Automático Generado en Operaciones CRM</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#15803D', lineHeight: '1.4' }}>
                Esta orden sincronizó automáticamente la apertura de un ticket operativo en el departamento de <strong>Operaciones</strong> para control de stock, facturación y despacho logístico.
              </p>
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Invoicing */}
          <div>
            {/* Financial Summary */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrandingVectorIcon name="credit-card" size={15} color="#0FA4DE" />
                <span>Resumen Financiero</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Subtotal Catálogo:</span>
                  <strong style={{ color: '#0F172A' }}>${parseFloat(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)} USD</strong>
                </div>

                {parseFloat(selectedOrder.discount_applied || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Descuento B2B Aplicado:</span>
                    <strong>-${parseFloat(selectedOrder.discount_applied).toFixed(2)} USD</strong>
                  </div>
                )}

                {parseFloat(selectedOrder.tax_applied || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Impuestos / IVA:</span>
                    <strong style={{ color: '#0F172A' }}>+${parseFloat(selectedOrder.tax_applied).toFixed(2)} USD</strong>
                  </div>
                )}

                {parseFloat(selectedOrder.shipping_applied || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Costo de Envío / Seguro:</span>
                    <strong style={{ color: '#0F172A' }}>+${parseFloat(selectedOrder.shipping_applied).toFixed(2)} USD</strong>
                  </div>
                )}

                <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#071524' }}>Total Orden:</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#0FA4DE' }}>
                    ${parseFloat(selectedOrder.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Invoicing & Client Info */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrandingVectorIcon name="building" size={14} color="#0FA4DE" />
                <span>Datos Fiscales y Comerciales</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                <div><strong>Razón Social:</strong> {selectedOrder.user_company || selectedOrder.user_name || 'Cliente B2B'}</div>
                {selectedOrder.user_cuit && <div><strong>CUIT / NIT:</strong> {selectedOrder.user_cuit}</div>}
                <div><strong>Email de Contacto:</strong> {selectedOrder.user_email}</div>
                {selectedOrder.user_phone && <div><strong>Teléfono:</strong> {selectedOrder.user_phone}</div>}
                <div><strong>Condición Comercial / Pago:</strong> {selectedOrder.payment_method || 'Cuenta Corriente Corporativa'}</div>
                {selectedOrder.po_number && (
                  <div><strong>N° Orden de Compra Cliente:</strong> <span style={{ color: '#0FA4DE', fontWeight: '700' }}>{selectedOrder.po_number}</span></div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#071524',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
