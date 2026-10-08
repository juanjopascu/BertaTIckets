import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

export default function StepShipping({
  shippingMethod,
  setShippingMethod,
  shipping,
  setShipping,
  checkoutMethods,
  inputStyle,
  labelStyle,
  setStep,
  setError
}) {
  const activeShipping = (checkoutMethods?.shipping || []).filter(m => m.enabled !== false);
  const selectedMethodObj = activeShipping.find(m => m.id === shippingMethod) || activeShipping[0];
  const effType = selectedMethodObj?.delivery_type || (
    (selectedMethodObj?.id?.toLowerCase().includes('hub') || selectedMethodObj?.title?.toLowerCase().includes('retiro'))
      ? 'hub'
      : (selectedMethodObj?.id?.toLowerCase().includes('expreso') || selectedMethodObj?.title?.toLowerCase().includes('expreso'))
      ? 'expreso'
      : 'caba'
  );

  const effFields = selectedMethodObj?.fields || (
    effType === 'hub' ? {
      require_receiver: true,
      require_dni: true,
      require_phone: true,
      require_address: false,
      require_postal_code: false,
      require_partido: false,
      require_time_slot: false,
      require_expreso_info: false,
      require_notes: true
    } : effType === 'expreso' ? {
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
    }
  );

  const handleContinue = () => {
    if (effFields.require_receiver && (!shipping.contacto_recepcion || !shipping.contacto_recepcion.trim())) {
      setError(effType === 'hub' ? 'Por favor ingresá el Nombre y Apellido de la persona autorizada a retirar.' : 'Por favor ingresá la persona autorizada a recibir.');
      return;
    }
    if (effFields.require_dni && (!shipping.dni_retiro || !shipping.dni_retiro.trim())) {
      setError('Por favor ingresá el DNI de la persona que retira la mercadería.');
      return;
    }
    if (effFields.require_expreso_info && (!shipping.expreso_nombre || !shipping.expreso_nombre.trim())) {
      setError('Por favor indicá el nombre de la empresa de transporte o expreso.');
      return;
    }
    if (effFields.require_address && (!shipping.calle || !shipping.calle.trim())) {
      setError(effType === 'expreso' ? 'Por favor completá la dirección de la receptoría del expreso.' : 'Por favor completá la calle o avenida de destino.');
      return;
    }
    if (effFields.require_postal_code && (!shipping.codigo_postal || !shipping.codigo_postal.trim())) {
      setError('Por favor completá el código postal.');
      return;
    }
    if (effFields.require_partido && (!(shipping.partido || shipping.ciudad || '').trim())) {
      setError('Por favor completá el partido o localidad de entrega.');
      return;
    }
    if (effFields.require_phone && (!shipping.telefono_recepcion || !shipping.telefono_recepcion.trim())) {
      setError('Por favor completá el número de teléfono para contacto y coordinación.');
      return;
    }

    setError('');
    setStep('end_user');
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandingVectorIcon name="truck" size={24} color="#0fa4de" />
          <span>3. Logística, Despacho y Entrega</span>
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
          Seleccioná el método de entrega de la mercadería y completá el destino.
        </p>
      </div>

      {/* Shipping Method Cards */}
      {activeShipping.length === 0 ? (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandingVectorIcon name="alert-triangle" size={16} color="#991B1B" />
          <span>No hay métodos de envío habilitados actualmente por la administración.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, activeShipping.length))}, 1fr)`, gap: '14px', marginBottom: '28px' }}>
          {activeShipping.map(m => {
            const isSel = shippingMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setShippingMethod(m.id)}
                style={{
                  background: isSel ? '#F0F9FF' : '#FFFFFF',
                  border: `2px solid ${isSel ? '#0fa4de' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <BrandingVectorIcon name={m.icon || 'truck'} size={24} color={isSel ? '#0fa4de' : '#64748B'} />
                  {m.badge && (
                    <span style={{ background: isSel ? '#0fa4de' : '#F1F5F9', color: isSel ? '#fff' : '#64748B', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                      {m.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524', marginBottom: '4px' }}>{m.title}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{m.subtitle || m.description || ''}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Fields According to Selected Shipping Method */}
      {/* ── 1. CASO: RETIRO EN HUB ── */}
      {effType === 'hub' && (
        <div>
          <div style={{ background: '#F8FAFC', padding: '18px 22px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(15, 164, 222, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BrandingVectorIcon name="building" size={24} color="#0fa4de" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>
                  {selectedMethodObj?.title || 'Retiro en HUB Central DACAS'}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                  {selectedMethodObj?.subtitle || selectedMethodObj?.description || 'Depósito Central Barracas / Nuñez / CABA. Lunes a Viernes de 9:00 a 18:00 hs.'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: '750', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="check" size={13} color="#10B981" />
                  <span>Sin costo de flete · Indique quién retira para autorizar el ingreso y entrega en depósito con DNI.</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nombre y Apellido de Quien Retira *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Juan Pérez / Chofer Logística"
                value={shipping.contacto_recepcion}
                onChange={e => setShipping({ ...shipping, contacto_recepcion: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>DNI / Documento de Identidad *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. 34.567.890"
                value={shipping.dni_retiro || ''}
                onChange={e => setShipping({ ...shipping, dni_retiro: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Número de Teléfono para Contacto y Coordinación *</label>
              <input
                type="tel"
                style={inputStyle}
                placeholder="+54 11 4000-1234"
                value={shipping.telefono_recepcion}
                onChange={e => setShipping({ ...shipping, telefono_recepcion: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Aclaraciones o Autorización Especial para Retiro (Opcional)</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Retira transporte tercerizado con remito firmado..."
                value={shipping.instrucciones}
                onChange={e => setShipping({ ...shipping, instrucciones: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CASO: EXPRESO / TRANSPORTE AL INTERIOR ── */}
      {effType === 'expreso' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#071524', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrandingVectorIcon name="truck" size={18} color="#0fa4de" />
              <span>Datos de la Empresa de Transporte / Expreso</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nombre de la Empresa de Transporte *</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Ej. Expreso Cruz del Sur / Sevillanita / Andreani"
                  value={shipping.expreso_nombre}
                  onChange={e => setShipping({ ...shipping, expreso_nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>N° de Cuenta / Remito Cliente en Expreso</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Ej. CTA-884920"
                  value={shipping.expreso_guia}
                  onChange={e => setShipping({ ...shipping, expreso_guia: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Dirección de la Receptoría (Calle y Altura) *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Av. Amancio Alcorta 2900"
                value={shipping.calle}
                onChange={e => setShipping({ ...shipping, calle: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Código Postal Receptoría *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="1437"
                value={shipping.codigo_postal}
                onChange={e => setShipping({ ...shipping, codigo_postal: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Partido / Localidad Receptoría *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Villa Soldati / CABA"
                value={shipping.partido || shipping.ciudad || ''}
                onChange={e => setShipping({ ...shipping, partido: e.target.value, ciudad: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Número de Teléfono para Contacto y Coordinación *</label>
              <input
                type="tel"
                style={inputStyle}
                placeholder="+54 11 4000-1234"
                value={shipping.telefono_recepcion}
                onChange={e => setShipping({ ...shipping, telefono_recepcion: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Persona Autorizada / Contacto en Transporte</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Mesa de Entradas Transporte"
                value={shipping.contacto_recepcion}
                onChange={e => setShipping({ ...shipping, contacto_recepcion: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Instrucciones Especiales para Logística (Opcional)</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Despachar con remito adjunto y seguro declarado..."
                value={shipping.instrucciones}
                onChange={e => setShipping({ ...shipping, instrucciones: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CASO: PERSONALIZADO ── */}
      {effType === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {effFields.require_expreso_info && (
            <>
              <div>
                <label style={labelStyle}>Empresa de Transporte / Expreso *</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Ej. Expreso Cruz del Sur"
                  value={shipping.expreso_nombre}
                  onChange={e => setShipping({ ...shipping, expreso_nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>N° de Cuenta / Remito Cliente</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Ej. CTA-884920"
                  value={shipping.expreso_guia}
                  onChange={e => setShipping({ ...shipping, expreso_guia: e.target.value })}
                />
              </div>
            </>
          )}

          {effFields.require_address && (
            <>
              <div>
                <label style={labelStyle}>Calle o Avenida de Destino *</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Av. del Libertador"
                  value={shipping.calle}
                  onChange={e => setShipping({ ...shipping, calle: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Altura / Número *</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="4500"
                  value={shipping.numero}
                  onChange={e => setShipping({ ...shipping, numero: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Piso / Dpto / Dársena (Opcional)</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Piso 4 - Dpto B"
                  value={shipping.piso_depto}
                  onChange={e => setShipping({ ...shipping, piso_depto: e.target.value })}
                />
              </div>
            </>
          )}

          {effFields.require_postal_code && (
            <div>
              <label style={labelStyle}>Código Postal *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="1426"
                value={shipping.codigo_postal}
                onChange={e => setShipping({ ...shipping, codigo_postal: e.target.value })}
                required
              />
            </div>
          )}

          {effFields.require_partido && (
            <div>
              <label style={labelStyle}>Partido / Localidad / Municipio *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. CABA / Vicente López / San Martín"
                value={shipping.partido || shipping.ciudad || ''}
                onChange={e => setShipping({ ...shipping, partido: e.target.value, ciudad: e.target.value })}
                required
              />
            </div>
          )}

          {effFields.require_receiver && (
            <div>
              <label style={labelStyle}>Persona Autorizada a Recibir / Retirar *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Laura Gómez"
                value={shipping.contacto_recepcion}
                onChange={e => setShipping({ ...shipping, contacto_recepcion: e.target.value })}
                required
              />
            </div>
          )}

          {effFields.require_dni && (
            <div>
              <label style={labelStyle}>DNI de Quien Retira / Recibe *</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. 34.567.890"
                value={shipping.dni_retiro || ''}
                onChange={e => setShipping({ ...shipping, dni_retiro: e.target.value })}
                required
              />
            </div>
          )}

          {effFields.require_phone && (
            <div>
              <label style={labelStyle}>Número de Teléfono para Contacto y Coordinación *</label>
              <input
                type="tel"
                style={inputStyle}
                placeholder="+54 11 4000-1234"
                value={shipping.telefono_recepcion}
                onChange={e => setShipping({ ...shipping, telefono_recepcion: e.target.value })}
                required
              />
            </div>
          )}

          {effFields.require_time_slot && (
            <div>
              <label style={labelStyle}>Franja Horaria de Recepción</label>
              <select
                style={inputStyle}
                value={shipping.horario_entrega}
                onChange={e => setShipping({ ...shipping, horario_entrega: e.target.value })}
              >
                <option value="9:00 a 18:00 hs (Horario Corrido)">9:00 a 18:00 hs (Horario Corrido)</option>
                <option value="9:00 a 13:00 hs (Turno Mañana)">9:00 a 13:00 hs (Turno Mañana)</option>
                <option value="14:00 a 18:00 hs (Turno Tarde)">14:00 a 18:00 hs (Turno Tarde)</option>
              </select>
            </div>
          )}

          {effFields.require_notes !== false && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Instrucciones Especiales para Logística (Opcional)</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Ej. Ingresar por dársena de carga, anunciar en portería técnica..."
                value={shipping.instrucciones}
                onChange={e => setShipping({ ...shipping, instrucciones: e.target.value })}
              />
            </div>
          )}
        </div>
      )}

      {/* ── 4. CASO: ENVÍO EN CABA / DOMICILIO (DEFAULT) ── */}
      {effType !== 'hub' && effType !== 'expreso' && effType !== 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Calle o Avenida de Destino *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Av. del Libertador"
              value={shipping.calle}
              onChange={e => setShipping({ ...shipping, calle: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Altura / Número *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="4500"
              value={shipping.numero}
              onChange={e => setShipping({ ...shipping, numero: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Piso / Dpto / Dársena (Opcional)</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Piso 4 - Dpto B"
              value={shipping.piso_depto}
              onChange={e => setShipping({ ...shipping, piso_depto: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Código Postal *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="1426"
              value={shipping.codigo_postal}
              onChange={e => setShipping({ ...shipping, codigo_postal: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Partido / Localidad / Municipio *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Ej. CABA / Vicente López / San Martín"
              value={shipping.partido || shipping.ciudad || ''}
              onChange={e => setShipping({ ...shipping, partido: e.target.value, ciudad: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Número de Teléfono para Contacto y Coordinación *</label>
            <input
              type="tel"
              style={inputStyle}
              placeholder="+54 11 4000-1234"
              value={shipping.telefono_recepcion}
              onChange={e => setShipping({ ...shipping, telefono_recepcion: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Persona Autorizada a Recibir *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Ej. Laura Gómez"
              value={shipping.contacto_recepcion}
              onChange={e => setShipping({ ...shipping, contacto_recepcion: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Franja Horaria de Recepción</label>
            <select
              style={inputStyle}
              value={shipping.horario_entrega}
              onChange={e => setShipping({ ...shipping, horario_entrega: e.target.value })}
            >
              <option value="9:00 a 18:00 hs (Horario Corrido)">9:00 a 18:00 hs (Horario Corrido)</option>
              <option value="9:00 a 13:00 hs (Turno Mañana)">9:00 a 13:00 hs (Turno Mañana)</option>
              <option value="14:00 a 18:00 hs (Turno Tarde)">14:00 a 18:00 hs (Turno Tarde)</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Instrucciones Especiales para Logística (Opcional)</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Ej. Ingresar por dársena de carga, anunciar en portería técnica..."
              value={shipping.instrucciones}
              onChange={e => setShipping({ ...shipping, instrucciones: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Step 3 Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={() => setStep('billing')}
          style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
        >
          ← Volver a Facturación
        </button>
        <button
          type="button"
          onClick={handleContinue}
          style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
        >
          Continuar a Datos de End User →
        </button>
      </div>
    </div>
  );
}
