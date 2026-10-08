import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { LATAM_COUNTRIES, inputStyle as defaultInputStyle, labelStyle as defaultLabelStyle } from './checkoutHelpers';

export default function StepEndUser({
  selectedEndUserId,
  handleSelectEndUser,
  savedEndUsers = [],
  endUser = {},
  setEndUser,
  handleNewEndUser,
  handleSaveEndUser,
  handleDeleteEndUser,
  endUserSaving = false,
  endUserFeedback = '',
  setEndUserFeedback,
  setStep,
  setError,
  inputStyle = defaultInputStyle,
  labelStyle = defaultLabelStyle
}) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandingVectorIcon name="briefcase" size={24} color="#0fa4de" />
            <span>4. Datos de End User (ABM End User)</span>
          </h2>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#0369A1', border: '1px solid #BAE6FD', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            <span>📋</span> Registro para Fabricante & Licencias
          </span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
          Identificá al Cliente Final (End User) destinatario de la solución para la activación de garantías oficiales, números de serie y registro de licencias ante el fabricante.
        </p>
      </div>

      {/* ABM Selector Toolbar */}
      <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <label style={{ ...labelStyle, color: '#0369A1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👥</span> End Users Guardados (ABM)
            </label>
            <select
              value={selectedEndUserId}
              onChange={e => handleSelectEndUser(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, background: '#FFFFFF', borderColor: '#CBD5E1', fontWeight: '700' }}
            >
              <option value="">-- Seleccionar End User Registrado en tu Cuenta --</option>
              {savedEndUsers.map(eu => (
                <option key={eu.id} value={eu.id}>
                  {eu.nombre} ({eu.ciudad ? `${eu.ciudad}, ` : ''}{eu.pais})
                </option>
              ))}
              <option value="new">➕ [Nuevo] Registrar nuevo End User</option>
            </select>
          </div>

          {/* ABM Actions Buttons (Aceptar, Nuevo, Modificar, Grabar, Eliminar) */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                if (!endUser.nombre || !endUser.nombre.trim()) {
                  setError('Por favor completá el Nombre del End User.');
                  return;
                }
                if (endUser.pais === 'Venezuela' && (!endUser.contacto || !endUser.contacto.trim())) {
                  setError('Para Venezuela es obligatorio ingresar el Nombre del CEO en el campo Contacto.');
                  return;
                }
                setError('');
                setStep('payment');
              }}
              style={{
                background: '#0284c7',
                border: '1.5px solid #0369A1',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Confirmar y continuar con este End User"
            >
              <span>✓</span> Aceptar
            </button>
            <button
              type="button"
              onClick={handleNewEndUser}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Limpiar formulario para ingresar nuevo cliente final"
            >
              <span>➕</span> Nuevo
            </button>
            <button
              type="button"
              onClick={() => {
                if (setEndUserFeedback) {
                  setEndUserFeedback('✏️ Modo edición activado.');
                  setTimeout(() => setEndUserFeedback(''), 3000);
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Modificar los datos del End User seleccionado"
            >
              <span>✏️</span> Modificar
            </button>
            <button
              type="button"
              onClick={handleSaveEndUser}
              disabled={endUserSaving}
              style={{
                background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: endUserSaving ? 'not-allowed' : 'pointer',
                opacity: endUserSaving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(15, 164, 222, 0.25)'
              }}
              title="Guardar este End User en la libreta de tu empresa"
            >
              <span>💾</span> {endUserSaving ? 'Grabando...' : 'Grabar'}
            </button>
            <button
              type="button"
              onClick={handleDeleteEndUser}
              disabled={!selectedEndUserId || selectedEndUserId === 'new'}
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: (!selectedEndUserId || selectedEndUserId === 'new') ? 'not-allowed' : 'pointer',
                opacity: (!selectedEndUserId || selectedEndUserId === 'new') ? 0.5 : 1
              }}
              title="Eliminar este End User de la libreta"
            >
              <span>🗑️</span> Eliminar
            </button>
          </div>
        </div>

        {endUserFeedback && (
          <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '700', color: endUserFeedback.includes('✅') ? '#166534' : '#DC2626', background: endUserFeedback.includes('✅') ? '#DCFCE7' : '#FEE2E2', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
            {endUserFeedback}
          </div>
        )}
      </div>

      {/* Form Fields matching requirement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Nombre del End User */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, color: '#DC2626', textDecoration: 'underline', fontWeight: '800' }}>
              Nombre del End User
            </label>
            <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '800' }}>* Obligatorio</span>
          </div>
          <input
            type="text"
            style={{ ...inputStyle, borderColor: !endUser.nombre ? '#FCA5A5' : '#E2E8F0', fontWeight: '700' }}
            placeholder="Ej. Banco Metropolitano S.A."
            value={endUser.nombre || ''}
            onChange={e => setEndUser({ ...endUser, nombre: e.target.value })}
            required
          />
        </div>

        {/* Dirección */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Dirección</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="Ej. Av. Corrientes 500, Piso 12"
            value={endUser.direccion || ''}
            onChange={e => setEndUser({ ...endUser, direccion: e.target.value })}
          />
        </div>

        {/* Ciudad */}
        <div style={{ gridColumn: 'span 2', maxWidth: '420px' }}>
          <label style={labelStyle}>Ciudad</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="Ej. Buenos Aires / Caracas"
            value={endUser.ciudad || ''}
            onChange={e => setEndUser({ ...endUser, ciudad: e.target.value })}
          />
        </div>

        {/* Pais */}
        <div>
          <label style={labelStyle}>Pais</label>
          <select
            style={{ ...inputStyle, background: '#FFFFFF', fontWeight: '600' }}
            value={endUser.pais || 'Argentina'}
            onChange={e => setEndUser({ ...endUser, pais: e.target.value })}
          >
            {LATAM_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label style={labelStyle}>Teléfono</label>
          <input
            type="tel"
            style={inputStyle}
            placeholder="Ej. +54 11 4321-0000"
            value={endUser.telefono || ''}
            onChange={e => setEndUser({ ...endUser, telefono: e.target.value })}
          />
        </div>

        {/* Contacto - ( Venezuela nombre CEO obligatorio ) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, color: endUser.pais === 'Venezuela' ? '#B91C1C' : '#475569' }}>
              Contacto - ( Venezuela nombre CEO obligatorio ) {endUser.pais === 'Venezuela' && '*'}
            </label>
            {endUser.pais === 'Venezuela' && (
              <span style={{ fontSize: '11px', color: '#B91C1C', fontWeight: '800', background: '#FEE2E2', padding: '2px 8px', borderRadius: '6px' }}>
                ⚠️ Nombre del CEO Mandatorio para Venezuela
              </span>
            )}
          </div>
          <input
            type="text"
            style={{ ...inputStyle, borderColor: (endUser.pais === 'Venezuela' && !endUser.contacto) ? '#F87171' : '#E2E8F0' }}
            placeholder="Ej. Dr. Alejandro Silva - CEO / Gerente General"
            value={endUser.contacto || ''}
            onChange={e => setEndUser({ ...endUser, contacto: e.target.value })}
            required={endUser.pais === 'Venezuela'}
          />
        </div>

        {/* Website */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Website</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="Ej. www.cliente.com"
            value={endUser.website || ''}
            onChange={e => setEndUser({ ...endUser, website: e.target.value })}
          />
        </div>
      </div>

      {/* Step 4 Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={() => setStep('shipping')}
          style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
        >
          ← Volver a Logística
        </button>
        <button
          type="button"
          onClick={() => {
            if (!endUser.nombre || !endUser.nombre.trim()) {
              setError('Por favor completá el Nombre del End User (requerido para registrar la solución).');
              return;
            }
            if (endUser.pais === 'Venezuela' && (!endUser.contacto || !endUser.contacto.trim())) {
              setError('Para Venezuela es obligatorio ingresar el Nombre del CEO en el campo Contacto.');
              return;
            }
            setError('');
            setStep('payment');
          }}
          style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
        >
          Continuar a Forma de Pago & Financiación →
        </button>
      </div>
    </div>
  );
}
