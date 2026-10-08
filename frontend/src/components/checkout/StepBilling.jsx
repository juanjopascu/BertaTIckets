import React from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

export default function StepBilling({
  billing,
  setBilling,
  shopUser,
  confirmedFiscalData,
  setConfirmedFiscalData,
  inputStyle,
  labelStyle,
  setStep,
  setError,
  navigate
}) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrandingVectorIcon name="building" size={24} color="#0fa4de" />
            <span>2. Datos Fiscales & Facturación Corporativa</span>
          </h2>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            <span>🔒</span> Datos Oficiales de tu Cuenta
          </span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
          Información impositiva y fiscal vinculada a tu empresa. Verificá que los datos sean correctos para la emisión de la Factura Oficial y Remito legal.
        </p>
      </div>

      {/* Informational Verification Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)', border: '1px solid rgba(15, 164, 222, 0.22)', borderRadius: '14px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px', lineHeight: 1 }}>🛡️</span>
        <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }}>
          <strong style={{ color: '#0284c7', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
            Datos cargados directamente — Solo lectura
          </strong>
          Estos datos corresponden al registro oficial de tu empresa en DACAS y no son editables en el checkout por requerimiento fiscal. Por favor confirmá que sean correctos antes de continuar.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Razón Social */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Razón Social / Nombre de la Empresa *</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Verificado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.empresa || shopUser?.razon_social || shopUser?.name || 'Empresa Demo S.A.'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>

        {/* CUIT */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>CUIT / Tax ID / Identificación Fiscal *</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Verificado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.cuit || shopUser?.numero_nit || shopUser?.cuit || '30-12345678-9'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>

        {/* Tipo de Comprobante */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Tipo de Comprobante Requerido</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Asignado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.tipo_factura || 'Factura A (Responsable Inscripto)'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>

        {/* Condición de IVA */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Condición ante el IVA</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Asignado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.condicion_iva || shopUser?.tipo_iva || 'IVA Responsable Inscripto'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>

        {/* Orden de Compra Interna (Opcional - editable para este pedido) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>N° de Orden de Compra Interna (Opcional)</label>
            <span style={{ fontSize: '11px', color: '#0fa4de', fontWeight: '600' }}>✏️ Opcional</span>
          </div>
          <input
            type="text"
            style={inputStyle}
            placeholder="Ej. OC-2026-904"
            value={billing.po_number || ''}
            onChange={e => setBilling({ ...billing, po_number: e.target.value })}
          />
        </div>

        {/* Contacto Administrativo */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Contacto de Compras / Finanzas *</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Registrado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.contacto_nombre || shopUser?.nombre_compras || shopUser?.name || 'Usuario Demo'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>

        {/* Email Facturación */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Email para Envío de Factura Electrónica *</label>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>🔒 Registrado</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              style={{
                ...inputStyle,
                background: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
              value={billing.contacto_email || shopUser?.email_factura_electronica || shopUser?.email_compras || shopUser?.email || 'demo@dacas.com'}
              readOnly
              disabled
            />
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.55 }} title="Dato oficial registrado en tu cuenta">🔒</span>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox Box */}
      <div style={{
        background: confirmedFiscalData ? '#F0FDF4' : '#FFFBEB',
        border: confirmedFiscalData ? '1.5px solid #BBF7D0' : '1.5px solid #FDE68A',
        borderRadius: '14px',
        padding: '14px 18px',
        marginTop: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={confirmedFiscalData}
            onChange={e => setConfirmedFiscalData(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#16A34A', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: '700', color: confirmedFiscalData ? '#166534' : '#92400E' }}>
            Confirmo que los datos fiscales de mi empresa son correctos para esta compra
          </span>
        </label>
        <span style={{ fontSize: '11.5px', color: '#64748B' }}>
          ¿Datos incorrectos? <span onClick={() => navigate('/shop/portal')} style={{ color: '#0fa4de', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>Solicitar cambio en Mi Cuenta</span>
        </span>
      </div>

      {/* Step 2 Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={() => setStep('cart')}
          style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
        >
          ← Volver al Carrito
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirmedFiscalData) {
              setError('Por favor confirmá que los datos fiscales son correctos marcando la casilla.');
              return;
            }
            const finalEmpresa = billing.empresa || shopUser?.razon_social || shopUser?.name || 'Empresa Demo S.A.';
            const finalCuit = billing.cuit || shopUser?.numero_nit || shopUser?.cuit || '30-12345678-9';
            setBilling(prev => ({
              ...prev,
              empresa: finalEmpresa,
              cuit: finalCuit,
              tipo_factura: prev.tipo_factura || 'Factura A (Responsable Inscripto)',
              condicion_iva: prev.condicion_iva || shopUser?.tipo_iva || 'IVA Responsable Inscripto',
              contacto_nombre: prev.contacto_nombre || shopUser?.nombre_compras || shopUser?.name || 'Usuario Demo',
              contacto_email: prev.contacto_email || shopUser?.email_factura_electronica || shopUser?.email || 'demo@dacas.com',
            }));
            setError('');
            setStep('shipping');
          }}
          style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15, 164, 222, 0.35)' }}
        >
          Continuar a Logística & Despacho →
        </button>
      </div>
    </div>
  );
}
