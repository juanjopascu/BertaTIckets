import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';

export default function CheckoutTab({
  activeTab,
  checkoutSubTab,
  checkoutMethods,
  setCheckoutMethods,
  activeCountryObj = { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  isSavingCheckout,
  checkoutSaveSuccess,
  handleResetCheckoutMethods,
  handleSaveCheckoutMethods
}) {
  const showShipping = activeTab === 'envios' || (activeTab === 'pagos_envios' && checkoutSubTab === 'shipping');
  const showPayment = activeTab === 'pagos' || (activeTab === 'pagos_envios' && checkoutSubTab === 'payment');

  return (
    <>
      {/* ═══════════════ GESTIÓN MÉTODOS DE ENVÍO ═══════════════ */}
      {showShipping && (
        <section className="board-section" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* ── Header & Action Toolbar ── */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-color, #E2E8F0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 164, 222, 0.12)', width: '38px', height: '38px', borderRadius: '12px' }}>
                  <BrandingVectorIcon name="truck" size={22} color="#0fa4de" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                  Gestión de Métodos de Envío & Logística
                </h2>
                <span style={{
                  background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.15), rgba(2, 132, 199, 0.2))',
                  color: '#0284c7',
                  fontWeight: '800',
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {activeCountryObj?.flag} {activeCountryObj?.name}
                </span>
                <span style={{
                  background: 'rgba(15, 164, 222, 0.1)',
                  color: '#0284c7',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {(checkoutMethods?.shipping || []).filter(s => s.enabled).length} Activos
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #64748B)', maxWidth: '700px' }}>
                Configuración de logística y despacho para <strong>{activeCountryObj?.name} ({activeCountryObj?.code})</strong>. Habilitá, deshabilitá o personalizá los métodos de despacho locales (HUBs, Expresos y Entregas Puerta a Puerta) para las operaciones de este país.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleResetCheckoutMethods}
                disabled={isSavingCheckout}
                className="dacas-pill-btn"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  color: 'var(--text-muted, #64748B)',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BrandingVectorIcon name="rotate-ccw" size={15} color="#64748B" />
                <span>Restablecer Oficiales</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCheckoutMethods}
                disabled={isSavingCheckout}
                className="dacas-pill-btn active"
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BrandingVectorIcon name="save" size={16} color="#FFFFFF" />
                <span>{isSavingCheckout ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>

          {/* Success feedback alert */}
          {checkoutSaveSuccess && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <BrandingVectorIcon name="check" size={18} color="#059669" />
              <span>¡Configuración de envíos guardada exitosamente! Los cambios ya están activos en el Checkout.</span>
            </div>
          )}

          <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {(checkoutMethods?.shipping || []).map((method, idx) => (
                  <div
                    key={method.id || idx}
                    style={{
                      background: 'var(--card-bg, #FFFFFF)',
                      borderRadius: '18px',
                      padding: '22px',
                      border: `2px solid ${method.enabled ? '#0fa4de' : 'var(--border-color, #E2E8F0)'}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      opacity: method.enabled ? 1 : 0.7,
                      transition: 'all 0.25s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Top Header Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: method.enabled ? 'rgba(15, 164, 222, 0.12)' : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <BrandingVectorIcon name={method.icon || 'truck'} size={24} color={method.enabled ? '#0fa4de' : '#64748B'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main, #0F172A)' }}>
                            {method.title || 'Método de Envío'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                            ID: <code style={{ color: '#0fa4de', fontWeight: '700' }}>{method.id}</code>
                          </div>
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...checkoutMethods };
                          updated.shipping[idx].enabled = !updated.shipping[idx].enabled;
                          setCheckoutMethods({ ...updated });
                        }}
                        style={{
                          background: method.enabled ? '#10B981' : '#94A3B8',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '6px 14px',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          boxShadow: method.enabled ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                      >
                        <BrandingVectorIcon name={method.enabled ? 'check' : 'x'} size={13} color="#FFFFFF" strokeWidth={3} />
                        <span>{method.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                      </button>
                    </div>

                    {/* Live Preview Box */}
                    <div style={{
                      background: method.enabled ? '#F0F9FF' : '#F8FAFC',
                      border: `1.5px solid ${method.enabled ? '#BAE6FD' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '16px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                        <BrandingVectorIcon name="eye" size={13} color="#0284C7" />
                        <span>Vista Previa en Checkout (Paso 3)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <BrandingVectorIcon name={method.icon || 'truck'} size={22} color="#0fa4de" />
                        {method.badge && (
                          <span style={{ background: '#0fa4de', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524' }}>{method.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{method.subtitle}</div>
                    </div>

                    {/* Editable Form Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
                      <div style={{ boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          Título del Botón
                        </label>
                        <input
                          type="text"
                          value={method.title || ''}
                          onChange={(e) => {
                            const updated = { ...checkoutMethods };
                            updated.shipping[idx].title = e.target.value;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '38px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color, #CBD5E1)',
                            fontSize: '13px',
                            background: 'var(--bg-main, #FFFFFF)',
                            color: 'var(--text-main, #0F172A)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          Subtítulo / Bajada
                        </label>
                        <input
                          type="text"
                          value={method.subtitle || ''}
                          onChange={(e) => {
                            const updated = { ...checkoutMethods };
                            updated.shipping[idx].subtitle = e.target.value;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '38px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color, #CBD5E1)',
                            fontSize: '13px',
                            background: 'var(--bg-main, #FFFFFF)',
                            color: 'var(--text-main, #0F172A)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', boxSizing: 'border-box' }}>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Etiqueta / Badge
                          </label>
                          <input
                            type="text"
                            value={method.badge || ''}
                            placeholder="Ej. Recomendado"
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.shipping[idx].badge = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Ícono (ID / Emoji)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}>
                            <input
                              type="text"
                              value={method.icon || ''}
                              placeholder="truck / hub / box"
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.shipping[idx].icon = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{
                                boxSizing: 'border-box',
                                width: '100%',
                                height: '38px',
                                padding: '0 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                fontSize: '13px',
                                background: 'var(--bg-main, #FFFFFF)',
                                color: 'var(--text-main, #0F172A)',
                                outline: 'none'
                              }}
                            />
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              background: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxSizing: 'border-box'
                            }}>
                              <BrandingVectorIcon name={method.icon || 'truck'} size={18} color="#0fa4de" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configuración de Datos Solicitados / Tipo de Entrega */}
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color, #F1F5F9)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#0369A1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          <BrandingVectorIcon name="file-text" size={13} color="#0369A1" />
                          <span>Datos Solicitados al Cliente en Checkout</span>
                        </label>
                        <select
                          value={method.delivery_type || (
                            (method.id?.toLowerCase().includes('hub') || method.title?.toLowerCase().includes('retiro'))
                              ? 'hub'
                              : (method.id?.toLowerCase().includes('expreso') || method.title?.toLowerCase().includes('expreso'))
                              ? 'expreso'
                              : 'caba'
                          )}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const updated = { ...checkoutMethods };
                            const defaultFields = newType === 'hub' ? {
                              require_receiver: true,
                              require_dni: true,
                              require_phone: true,
                              require_address: false,
                              require_postal_code: false,
                              require_partido: false,
                              require_time_slot: false,
                              require_expreso_info: false,
                              require_notes: true
                            } : newType === 'expreso' ? {
                              require_receiver: true,
                              require_dni: false,
                              require_phone: true,
                              require_address: true,
                              require_postal_code: true,
                              require_partido: true,
                              require_time_slot: false,
                              require_expreso_info: true,
                              require_notes: true
                            } : {
                              require_receiver: true,
                              require_dni: false,
                              require_phone: true,
                              require_address: true,
                              require_postal_code: true,
                              require_partido: true,
                              require_time_slot: true,
                              require_expreso_info: false,
                              require_notes: true
                            };
                            updated.shipping[idx].delivery_type = newType;
                            updated.shipping[idx].fields = defaultFields;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '38px',
                            padding: '0 10px',
                            borderRadius: '10px',
                            border: '1.5px solid #0fa4de',
                            fontSize: '12px',
                            fontWeight: '750',
                            background: '#F0F9FF',
                            color: '#0369A1',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="hub">🏢 Retiro en HUB (Pide: Nombre y Apellido de quien retira, DNI, Teléfono)</option>
                          <option value="caba">🚚 Envío en CABA / Domicilio (Pide: Dirección, CP, Partido, Teléfono de coordinación)</option>
                          <option value="expreso">🚛 Expreso / Transporte al Interior (Pide: Transporte, Receptoría, CP, Partido, Teléfono)</option>
                          <option value="custom">⚙️ Personalizado (Elegir campos manualmente)</option>
                        </select>
                      </div>

                      {/* Modificable por método: Campos específicos activos */}
                      <div style={{ marginTop: '8px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#475569', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Campos específicos activos:</span>
                          <span style={{ fontSize: '10px', color: '#0fa4de', fontWeight: '750' }}>Modificable por método</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {[
                            { key: 'require_receiver', label: 'Persona que recibe / retira' },
                            { key: 'require_dni', label: 'DNI de quien retira' },
                            { key: 'require_address', label: 'Dirección (Calle y Altura)' },
                            { key: 'require_postal_code', label: 'Código Postal' },
                            { key: 'require_partido', label: 'Partido / Localidad' },
                            { key: 'require_phone', label: 'Teléfono coordinación' },
                            { key: 'require_time_slot', label: 'Franja horaria' },
                            { key: 'require_expreso_info', label: 'Datos del Expreso' },
                          ].map(f => {
                            const currType = method.delivery_type || (
                              (method.id?.toLowerCase().includes('hub') || method.title?.toLowerCase().includes('retiro'))
                                ? 'hub'
                                : (method.id?.toLowerCase().includes('expreso') || method.title?.toLowerCase().includes('expreso'))
                                ? 'expreso'
                                : 'caba'
                            );
                            const currentFields = method.fields || (
                              currType === 'hub'
                                ? { require_receiver: true, require_dni: true, require_phone: true, require_address: false, require_postal_code: false, require_partido: false, require_time_slot: false, require_expreso_info: false, require_notes: true }
                                : currType === 'expreso'
                                ? { require_receiver: true, require_dni: false, require_phone: true, require_address: true, require_postal_code: true, require_partido: true, require_time_slot: false, require_expreso_info: true, require_notes: true }
                                : { require_receiver: true, require_dni: false, require_phone: true, require_address: true, require_postal_code: true, require_partido: true, require_time_slot: true, require_expreso_info: false, require_notes: true }
                            );
                            const isChecked = Boolean(currentFields[f.key]);
                            return (
                              <label key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: isChecked ? '#0F172A' : '#94A3B8', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    const currentF = { ...currentFields, [f.key]: e.target.checked };
                                    updated.shipping[idx].fields = currentF;
                                    updated.shipping[idx].delivery_type = 'custom';
                                    setCheckoutMethods({ ...updated });
                                  }}
                                />
                                <span style={{ fontWeight: isChecked ? '700' : '400' }}>{f.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newId = `custom_shipping_${Date.now()}`;
                    const updated = { ...checkoutMethods };
                    updated.shipping.push({
                      id: newId,
                      enabled: true,
                      title: 'Nuevo Método de Entrega',
                      subtitle: 'Descripción breve de la entrega',
                      badge: 'Nuevo',
                      icon: 'box',
                      priceText: 'A convenir',
                      description: 'Detalles del nuevo método de despacho.'
                    });
                    setCheckoutMethods({ ...updated });
                  }}
                  style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    border: '2px dashed #0fa4de',
                    color: '#0fa4de',
                    borderRadius: '16px',
                    padding: '14px 28px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <BrandingVectorIcon name="plus" size={16} color="#0fa4de" strokeWidth={2.5} />
                  <span>Añadir Nuevo Método de Envío</span>
                </button>
              </div>
            </div>
        </section>
      )}

      {/* ═══════════════ GESTIÓN FORMAS DE PAGO ═══════════════ */}
      {showPayment && (
        <section className="board-section" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* ── Header & Action Toolbar ── */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            borderRadius: '20px',
            padding: '24px 28px',
            border: '1px solid var(--border-color, #E2E8F0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 132, 199, 0.12)', width: '38px', height: '38px', borderRadius: '12px' }}>
                  <BrandingVectorIcon name="credit-card" size={22} color="#0284c7" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                  Gestión de Métodos de Pago & Financiación
                </h2>
                <span style={{
                  background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.15), rgba(2, 132, 199, 0.2))',
                  color: '#0284c7',
                  fontWeight: '800',
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {activeCountryObj?.flag} {activeCountryObj?.name}
                </span>
                <span style={{
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284c7',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {(checkoutMethods?.payment || []).filter(p => p.enabled).length} Activos
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #64748B)', maxWidth: '700px' }}>
                Configuración financiera y pasarelas de pago para <strong>{activeCountryObj?.name} ({activeCountryObj?.code})</strong>. Habilitá, deshabilitá o personalizá las opciones de pago corporativo (CBU/Alias, E-Cheqs diferidos, Tarjeta de Crédito, Cuenta Corriente o Stripe) para las operaciones de este país.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleResetCheckoutMethods}
                disabled={isSavingCheckout}
                className="dacas-pill-btn"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  color: 'var(--text-muted, #64748B)',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BrandingVectorIcon name="rotate-ccw" size={15} color="#64748B" />
                <span>Restablecer Oficiales</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCheckoutMethods}
                disabled={isSavingCheckout}
                className="dacas-pill-btn active"
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BrandingVectorIcon name="save" size={16} color="#FFFFFF" />
                <span>{isSavingCheckout ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>

          {/* Success feedback alert */}
          {checkoutSaveSuccess && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <BrandingVectorIcon name="check" size={18} color="#059669" />
              <span>¡Configuración de pagos guardada exitosamente! Los cambios ya están activos en el Checkout.</span>
            </div>
          )}

          <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {(checkoutMethods?.payment || []).map((method, idx) => (
                  <div
                    key={method.id || idx}
                    style={{
                      background: 'var(--card-bg, #FFFFFF)',
                      borderRadius: '18px',
                      padding: '22px',
                      border: `2px solid ${method.enabled ? '#0fa4de' : 'var(--border-color, #E2E8F0)'}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      opacity: method.enabled ? 1 : 0.7,
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Top Header Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: method.enabled ? 'rgba(15, 164, 222, 0.12)' : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <BrandingVectorIcon name={method.icon || 'credit-card'} size={24} color={method.enabled ? '#0fa4de' : '#64748B'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main, #0F172A)' }}>
                            {method.title || 'Forma de Pago'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                            ID: <code style={{ color: '#0fa4de', fontWeight: '700' }}>{method.id}</code>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {idx >= 4 && (
                          <button
                            type="button"
                            title="Eliminar método personalizado"
                            onClick={() => {
                              if (window.confirm('¿Deseas eliminar este método de pago?')) {
                                const updated = { ...checkoutMethods };
                                updated.payment.splice(idx, 1);
                                setCheckoutMethods({ ...updated });
                              }
                            }}
                            style={{
                              background: '#FEE2E2',
                              color: '#EF4444',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <BrandingVectorIcon name="trash" size={14} color="#EF4444" />
                          </button>
                        )}

                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...checkoutMethods };
                            updated.payment[idx].enabled = !updated.payment[idx].enabled;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            background: method.enabled ? '#10B981' : '#94A3B8',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontWeight: '800',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: method.enabled ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          <BrandingVectorIcon name={method.enabled ? 'check' : 'x'} size={13} color="#FFFFFF" strokeWidth={3} />
                          <span>{method.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div style={{
                      background: method.enabled ? '#F0F9FF' : '#F8FAFC',
                      border: `1.5px solid ${method.enabled ? '#BAE6FD' : '#E2E8F0'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '16px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                        <BrandingVectorIcon name="eye" size={13} color="#0284C7" />
                        <span>Vista Previa en Checkout (Paso 4)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BrandingVectorIcon name={method.icon || 'credit-card'} size={22} color="#0fa4de" />
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524' }}>{method.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{method.subtitle}</div>
                          </div>
                        </div>
                        {method.badge && (
                          <span style={{ background: '#10B981', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>
                            {method.badge}
                          </span>
                        )}
                      </div>

                      {/* Preview of Bank Details if Transferencia */}
                      {method.id === 'transferencia' && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #BAE6FD', fontSize: '11px', color: '#0369A1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BrandingVectorIcon name="bank" size={13} color="#0284c7" />
                            <span><strong>Banco:</strong> {method.banco || 'Banco Santander'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BrandingVectorIcon name="ticket" size={13} color="#0284c7" />
                            <span><strong>CBU:</strong> <code style={{ background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px' }}>{method.cbu || '07201239...'}</code></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BrandingVectorIcon name="tag" size={13} color="#0284c7" />
                            <span><strong>Alias:</strong> <strong>{method.alias || 'DACAS.PAGOS.B2B'}</strong> | <strong>SWIFT:</strong> {method.swift || 'BAPROARBAXXX'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* General Form Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, boxSizing: 'border-box' }}>
                      <div style={{ boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          Título de la Opción
                        </label>
                        <input
                          type="text"
                          value={method.title || ''}
                          onChange={(e) => {
                            const updated = { ...checkoutMethods };
                            updated.payment[idx].title = e.target.value;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '38px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color, #CBD5E1)',
                            fontSize: '13px',
                            background: 'var(--bg-main, #FFFFFF)',
                            color: 'var(--text-main, #0F172A)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          Descripción / Subtítulo Principal
                        </label>
                        <textarea
                          rows={2}
                          value={method.subtitle || ''}
                          onChange={(e) => {
                            const updated = { ...checkoutMethods };
                            updated.payment[idx].subtitle = e.target.value;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            boxSizing: 'border-box',
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color, #CBD5E1)',
                            fontSize: '13px',
                            background: 'var(--bg-main, #FFFFFF)',
                            color: 'var(--text-main, #0F172A)',
                            resize: 'vertical',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', boxSizing: 'border-box' }}>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Etiqueta / Badge
                          </label>
                          <input
                            type="text"
                            value={method.badge || ''}
                            placeholder="Ej. Sin Recargo"
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.payment[idx].badge = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Ícono (ID / Emoji)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}>
                            <input
                              type="text"
                              value={method.icon || ''}
                              placeholder="bank / credit-card"
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].icon = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{
                                boxSizing: 'border-box',
                                width: '100%',
                                height: '38px',
                                padding: '0 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                fontSize: '13px',
                                background: 'var(--bg-main, #FFFFFF)',
                                color: 'var(--text-main, #0F172A)',
                                outline: 'none'
                              }}
                            />
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              background: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxSizing: 'border-box'
                            }}>
                              <BrandingVectorIcon name={method.icon || 'credit-card'} size={18} color="#0fa4de" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Specific Banking Fields for Transferencia CBU / SWIFT ── */}
                      {method.id === 'transferencia' && (
                        <div style={{
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrandingVectorIcon name="bank" size={16} color="#0369A1" />
                            <span>Datos Bancarios Oficiales (CBU / SWIFT / Alias)</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Banco / Entidad
                              </label>
                              <input
                                type="text"
                                value={method.banco || ''}
                                placeholder="Banco Santander / BBVA"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].banco = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Titular / Razón Social
                              </label>
                              <input
                                type="text"
                                value={method.titular || ''}
                                placeholder="DACAS S.A."
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].titular = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                CBU / CVU (22 dígitos)
                              </label>
                              <input
                                type="text"
                                value={method.cbu || ''}
                                placeholder="0720123920000001234567"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].cbu = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontFamily: 'monospace' }}
                              />
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Alias CBU
                              </label>
                              <input
                                type="text"
                                value={method.alias || ''}
                                placeholder="DACAS.PAGOS.B2B"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].alias = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontWeight: '700', color: '#0369A1' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Código SWIFT / BIC
                              </label>
                              <input
                                type="text"
                                value={method.swift || ''}
                                placeholder="BAPROARBAXXX"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].swift = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontFamily: 'monospace' }}
                              />
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                CUIT / Tax ID
                              </label>
                              <input
                                type="text"
                                value={method.cuit || ''}
                                placeholder="30-68942158-9"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].cuit = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>
                          </div>

                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                              Instrucciones para el Comprobante de Pago
                            </label>
                            <textarea
                              rows={2}
                              value={method.instrucciones || ''}
                              placeholder="Enviar comprobante a cobranzas@dacas.com indicando N° de Orden."
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].instrucciones = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{ boxSizing: 'border-box', width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ── Specific Fields for E-Cheq ── */}
                      {method.id === 'echeq' && (
                        <div style={{
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrandingVectorIcon name="file-text" size={16} color="#0369A1" />
                            <span>Configuración de E-Cheq Digital</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                CUIT Receptor
                              </label>
                              <input
                                type="text"
                                value={method.cuit_receptor || ''}
                                placeholder="30-68942158-9"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].cuit_receptor = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Banco Receptor COELSA
                              </label>
                              <input
                                type="text"
                                value={method.banco_receptor || ''}
                                placeholder="Banco Santander"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].banco_receptor = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>
                          </div>

                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                              Plazos Admitidos / Condiciones
                            </label>
                            <input
                              type="text"
                              value={method.plazos_admitidos || ''}
                              placeholder="30 y 60 días fecha factura"
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].plazos_admitidos = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ── Specific Fields for Cuenta Corriente ── */}
                      {method.id === 'cuenta_corriente' && (
                        <div style={{
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrandingVectorIcon name="building" size={16} color="#0369A1" />
                            <span>Configuración de Cuenta Corriente B2B</span>
                          </div>

                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                              Etiqueta del Selector de Plazos
                            </label>
                            <input
                              type="text"
                              value={method.terms_label || 'Plazo de Facturación:'}
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].terms_label = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                            />
                          </div>

                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                              Nota de Evaluación Crediticia
                            </label>
                            <textarea
                              rows={2}
                              value={method.instrucciones || ''}
                              placeholder="Sujeto a verificación de línea crediticia aprobada en DACAS."
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].instrucciones = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{ boxSizing: 'border-box', width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Add New Payment Method & Terms & Conditions Card ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `custom_payment_${Date.now()}`;
                      const updated = { ...checkoutMethods };
                      updated.payment.push({
                        id: newId,
                        enabled: true,
                        title: 'Nueva Opción de Pago',
                        subtitle: 'Instrucciones para el pago corporativo',
                        badge: 'Opcional',
                        icon: 'credit-card',
                        instrucciones: 'Instrucciones adicionales para este medio de pago.'
                      });
                      setCheckoutMethods({ ...updated });
                    }}
                    style={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '2px dashed #0fa4de',
                      color: '#0fa4de',
                      borderRadius: '16px',
                      padding: '14px 28px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <BrandingVectorIcon name="plus" size={16} color="#0fa4de" strokeWidth={2.5} />
                    <span>Añadir Nueva Forma de Pago</span>
                  </button>
                </div>

                {/* Legal Terms & Conditions in Checkout Paso 4 */}
                <div style={{
                  background: 'var(--card-bg, #FFFFFF)',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <BrandingVectorIcon name="file-text" size={20} color="#0fa4de" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                      Texto de Términos y Condiciones Comerciales (Checkbox Paso 4)
                    </h3>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                    Este es el texto que el cliente debe aceptar al final del Paso 4 para confirmar y procesar su orden mayorista.
                  </p>
                  <textarea
                    rows={3}
                    value={checkoutMethods?.terms_conditions_text || ''}
                    placeholder="Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial..."
                    onChange={(e) => {
                      setCheckoutMethods({
                        ...checkoutMethods,
                        terms_conditions_text: e.target.value
                      });
                    }}
                    style={{
                      boxSizing: 'border-box',
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #CBD5E1)',
                      fontSize: '13px',
                      background: 'var(--bg-main, #FFFFFF)',
                      color: 'var(--text-main, #0F172A)',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

        </section>
      )}
    </>
  );
}
