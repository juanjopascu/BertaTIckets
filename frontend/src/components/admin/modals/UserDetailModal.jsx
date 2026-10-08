import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import { statusStyle, statusLabel } from '../adminHelpers';

export default function UserDetailModal({
  isOpen,
  selectedUser,
  countries = [],
  onClose,
  handleApproveUser,
  handleEditUser,
  handleOpenAddUserToCompany,
  handleToggleUserStatus,
  handleDeleteUser
}) {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '980px',
          width: '95%',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0a192f'
        }}
      >
        {/* ── Header Bar ── */}
        <div style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
          color: '#ffffff',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid rgba(15, 164, 222, 0.25)'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '900',
              boxShadow: '0 6px 18px rgba(15, 164, 222, 0.35)',
              flexShrink: 0
            }}>
              {(selectedUser.razon_social || selectedUser.name || 'C').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {selectedUser.razon_social || selectedUser.name}
                </h2>
                <span style={{
                  background: selectedUser.status === 'activo' ? '#DCFCE7' : selectedUser.status === 'pendiente' ? '#FEF3C7' : '#FEE2E2',
                  color: selectedUser.status === 'activo' ? '#166534' : selectedUser.status === 'pendiente' ? '#92400E' : '#991B1B',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedUser.status === 'activo' ? '#16a34a' : selectedUser.status === 'pendiente' ? '#d97706' : '#dc2626' }}></span>
                  {selectedUser.status === 'activo' ? 'Cuenta Activa' : selectedUser.status === 'pendiente' ? 'Pendiente Aprobación' : 'Suspendido'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#94A3B8', flexWrap: 'wrap' }}>
                <span>ID Cliente: <strong style={{ color: '#E2E8F0' }}>#{selectedUser.id}</strong></span>
                <span>•</span>
                <span>✉️ <strong style={{ color: '#E2E8F0' }}>{selectedUser.email}</strong></span>
                {selectedUser.tipo_cliente && (
                  <>
                    <span>•</span>
                    <span style={{ background: 'rgba(15, 164, 222, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' }}>
                      🏢 {selectedUser.tipo_cliente}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {selectedUser.status === 'pendiente' && (
              <button
                onClick={() => {
                  handleApproveUser(selectedUser.id);
                  onClose();
                }}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ✓ Aprobar Cuenta
              </button>
            )}
            <button
              onClick={() => {
                handleEditUser(selectedUser);
                onClose();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✏️ Editar
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                color: '#64748B'
              }}
              title="Cerrar"
            >
              <BrandingVectorIcon name="x" size={18} color="#64748B" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Content ── */}
        <div style={{ padding: '24px 30px', maxHeight: '74vh', overflowY: 'auto', background: '#F8FAFC' }}>
          
          {/* Grid 1: Datos Fiscales & Comerciales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
            {/* Card 1: Identificación Comercial */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📊</span> Perfil Comercial & Legal
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Razón Social:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.razon_social || selectedUser.name || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Tipo de Cliente:</span>
                  <strong style={{ color: '#0284c7', fontWeight: '700' }}>{selectedUser.tipo_cliente || 'Integrador IT / Reseller'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>País Operación:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.country_name || countries.find(c => c.id === selectedUser.country_id)?.name || 'Argentina'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Teléfono:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.phone ? <a href={`tel:${selectedUser.phone}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '700' }}>{selectedUser.phone}</a> : '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Sitio Web:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.web ? <a href={selectedUser.web.startsWith('http') ? selectedUser.web : `https://${selectedUser.web}`} target="_blank" rel="noreferrer" style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '700' }}>{selectedUser.web}</a> : '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Cuenta Corriente:</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: selectedUser.cuenta_corriente_habilitada ? '#DCFCE7' : '#FEE2E2',
                      color: selectedUser.cuenta_corriente_habilitada ? '#166534' : '#991B1B',
                      border: `1px solid ${selectedUser.cuenta_corriente_habilitada ? '#86EFAC' : '#FCA5A5'}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {selectedUser.cuenta_corriente_habilitada ? '✓ Habilitada para Checkout' : '🔒 Bloqueada en Checkout'}
                    </span>
                    {selectedUser.cuenta_corriente_habilitada && (
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', marginTop: '3px' }}>
                        Límite: {parseFloat(selectedUser.cuenta_corriente_limite || selectedUser.limite_credito || 0) > 0 ? `$${parseFloat(selectedUser.cuenta_corriente_limite || selectedUser.limite_credito).toLocaleString()} USD` : 'Sin límite'}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Límite Facturación:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.fecha_limite_facturacion ? new Date(selectedUser.fecha_limite_facturacion).toLocaleDateString() : '—'}</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Datos Impositivos & Fiscales */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧾</span> Condición Fiscal & Asignación
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>CUIT / NIT / RUT:</span>
                  <span style={{ background: '#071524', color: '#38bdf8', padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.05em', fontWeight: '800', fontSize: '12px' }}>
                    {selectedUser.numero_nit || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Condición IVA:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.tipo_iva || 'Responsable Inscripto'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Vendedor Asignado:</span>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                    {selectedUser.vendedor || 'Equipo Comercial DACAS'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Reporta a País:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{countries.find(c => c.id === selectedUser.report_to_country_id)?.name || 'DACAS Casa Central'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Fecha Registro:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : '—'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2: Ubicaciones (Legal y Despacho) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
            {/* Dirección Legal */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏛️</span> Domicilio Legal / Fiscal
              </div>
              {selectedUser.direccion_legal ? (
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13.5px' }}>{selectedUser.direccion_legal}</div>
                  <div style={{ color: '#64748B' }}>
                    {[selectedUser.localidad, selectedUser.ciudad].filter(Boolean).join(', ')}
                    {selectedUser.codigo_postal ? ` (CP ${selectedUser.codigo_postal})` : ''}
                  </div>
                  <div style={{ color: '#0284c7', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🌎</span> {selectedUser.country_name || countries.find(c => c.id === selectedUser.country_id)?.name || 'Argentina'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> No se ha registrado domicilio fiscal específico.
                </div>
              )}
            </div>

            {/* Dirección de Entrega */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚚</span> Dirección de Entrega / Despacho
              </div>
              {selectedUser.direccion_entrega ? (
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13.5px' }}>{selectedUser.direccion_entrega}</div>
                  <div style={{ color: '#64748B' }}>
                    {[selectedUser.localidad_entrega, selectedUser.ciudad_entrega].filter(Boolean).join(', ')}
                    {selectedUser.codigo_postal_entrega ? ` (CP ${selectedUser.codigo_postal_entrega})` : ''}
                  </div>
                  <div style={{ color: '#0284c7', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🌎</span> {countries.find(c => c.id === selectedUser.pais_entrega_id)?.name || selectedUser.country_name || 'Mismo país legal'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📦</span> Misma que dirección legal o a convenir por pedido.
                </div>
              )}
            </div>
          </div>

          {/* Card: Percepciones y Retenciones IIBB (Argentina) */}
          {((selectedUser.country_id === 2 || selectedUser.country_name === 'Argentina' || !selectedUser.country_id) && (
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏛️</span> Percepciones & Retenciones IIBB (Argentina)
                </div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  Jurisdicción: {selectedUser.iibb_jurisdiccion || '901 - Capital Federal'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px', fontSize: '12.5px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Inscripción IIBB:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedUser.iibb_tipo || 'C.M.'} — {selectedUser.iibb_numero || selectedUser.numero_nit || '—'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Código de Aceptación:</span>
                  <strong style={{ color: selectedUser.iibb_codigo_aceptacion ? '#16a34a' : '#94a3b8' }}>
                    {selectedUser.iibb_codigo_aceptacion ? '✓ Aceptado / Homologado' : '✗ No informado'}
                  </strong>
                </div>
              </div>

              {/* Listado de Percepciones configuradas */}
              {(() => {
                let percs = selectedUser.percepciones;
                if (typeof percs === 'string') {
                  try { percs = JSON.parse(percs); } catch (_) { percs = null; }
                }
                if (!percs) return <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Sin percepciones configuradas.</div>;

                const provs = [
                  { key: 'caba', name: 'CABA', ...percs.caba },
                  { key: 'bsas', name: 'Bs. As. (ARBA)', ...percs.bsas },
                  { key: 'salta', name: 'Salta', ...percs.salta },
                  { key: 'misiones', name: 'Misiones', ...percs.misiones },
                  { key: 'tucuman', name: 'Tucumán', ...percs.tucuman },
                ];

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                    {provs.map(p => {
                      const isActive = p.enabled && parseFloat(p.alicuota) > 0;
                      return (
                        <div key={p.key} style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isActive ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                          background: isActive ? '#f0f9ff' : '#ffffff'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.name}</strong>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: isActive ? '#0284c7' : '#94a3b8' }}>
                              {isActive ? 'ACTIVA' : 'INACTIVA'}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: isActive ? '#0369a1' : '#64748b' }}>
                            {parseFloat(p.alicuota || 0).toFixed(4)}%
                          </div>
                          {p.coef ? <div style={{ fontSize: '10.5px', color: '#64748b' }}>Coef: {p.coef}</div> : null}
                          {p.vigencia ? <div style={{ fontSize: '10px', color: '#94a3b8' }}>Vto: {p.vigencia}</div> : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ))}

          {/* Grid 3: Contactos Designados */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👥</span> Contactos Clave Designados
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Compras */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🛒</span>
                  <span style={{ fontWeight: '800', fontSize: '11px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contacto Compras</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                  {selectedUser.nombre_compras || 'Sin especificar'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedUser.telefono_compras && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_compras}</strong></div>}
                  {selectedUser.email_compras && <div>✉️ <a href={`mailto:${selectedUser.email_compras}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_compras}</a></div>}
                  {!selectedUser.telefono_compras && !selectedUser.email_compras && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                </div>
              </div>

              {/* Pagos */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💳</span>
                  <span style={{ fontWeight: '800', fontSize: '11px', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pagos / Tesorería</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                  {selectedUser.nombre_pagos || 'Sin especificar'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedUser.telefono_pagos && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_pagos}</strong></div>}
                  {selectedUser.email_pagos && <div>✉️ <a href={`mailto:${selectedUser.email_pagos}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_pagos}</a></div>}
                  {!selectedUser.telefono_pagos && !selectedUser.email_pagos && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                </div>
              </div>

              {/* Administración */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👔</span>
                  <span style={{ fontWeight: '800', fontSize: '11px', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Administración / Dirección</span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                  {selectedUser.nombre_admin || 'Sin especificar'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedUser.telefono_admin && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_admin}</strong></div>}
                  {selectedUser.email_admin && <div>✉️ <a href={`mailto:${selectedUser.email_admin}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_admin}</a></div>}
                  {!selectedUser.telefono_admin && !selectedUser.email_admin && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Grid 4.5: Cuentas de Usuarios Vinculadas a esta Empresa */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥</span> Usuarios con Acceso al Shop ({selectedUser.company_users?.length || 1})
              </div>
              <button
                onClick={() => {
                  handleOpenAddUserToCompany(selectedUser);
                  onClose();
                }}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(15, 164, 222, 0.3)'
                }}
              >
                ➕ Agregar Usuario a esta Empresa
              </button>
            </div>

            <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: 0, border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <table className="users-table" style={{ width: '100%', minWidth: '650px', fontSize: '12.5px', margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Usuario / Contacto</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Email (LogIn)</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Cargo / Función</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Teléfono</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Estado</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedUser.company_users && selectedUser.company_users.length > 0 ? selectedUser.company_users : [selectedUser]).map(u => {
                    const isCurrentUser = u.id === selectedUser.id;
                    return (
                      <tr key={u.id} style={{ background: isCurrentUser ? 'rgba(15, 164, 222, 0.04)' : 'transparent' }}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#0F172A' }}>{u.name}</strong>
                            {isCurrentUser && (
                              <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '10.5px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                                Viendo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#0fa4de', fontWeight: '600', wordBreak: 'break-all' }}>{u.email}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600' }}>
                            {u.cargo || 'Encargado de Compras'}
                          </span>
                        </td>
                        <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <span style={{
                            background: (u.status || 'activo') === 'activo' ? '#DCFCE7' : (u.status === 'pendiente' ? '#FEF3C7' : '#FEE2E2'),
                            color: (u.status || 'activo') === 'activo' ? '#166534' : (u.status === 'pendiente' ? '#92400E' : '#991B1B'),
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {(u.status || 'activo') === 'activo' ? '🟢 Activo' : (u.status === 'pendiente' ? '🟡 Pendiente' : '🔴 Inactivo')}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                handleEditUser(u);
                                onClose();
                              }}
                              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#334155', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: '600' }}
                              title="Editar este usuario"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u.id, (u.status || 'activo') === 'activo' ? 'inactivo' : 'activo')}
                              style={{
                                background: (u.status || 'activo') === 'activo' ? '#FEF2F2' : '#F0FDF4',
                                border: '1px solid ' + ((u.status || 'activo') === 'activo' ? '#FECACA' : '#BBF7D0'),
                                color: (u.status || 'activo') === 'activo' ? '#DC2626' : '#16A34A',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11.5px',
                                fontWeight: '600'
                              }}
                              title={(u.status || 'activo') === 'activo' ? 'Desactivar acceso' : 'Activar acceso'}
                            >
                              {(u.status || 'activo') === 'activo' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 7px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px' }}
                              title="Eliminar cuenta de usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid 5: Historial de Órdenes */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📦</span> Historial de Órdenes y Cotizaciones ({selectedUser.orders?.length || 0})
            </div>
            {selectedUser.orders && selectedUser.orders.length > 0 ? (
              <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: 0, border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <table className="users-table" style={{ width: '100%', minWidth: '500px', fontSize: '12.5px', margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>ID Orden</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Fecha</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Total (USD)</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                        <td><span style={{ fontWeight: '800', color: '#071524' }}>${o.total} USD</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', ...statusStyle(o.status) }}>
                            {statusLabel(o.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '13px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>🛒</span>
                Este cliente aún no ha registrado órdenes de compra en la plataforma.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
