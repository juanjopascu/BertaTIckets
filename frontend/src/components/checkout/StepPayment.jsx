import React, { useState } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { isCuentaCorrienteMethod } from './checkoutHelpers';

export default function StepPayment({
  checkoutMethods,
  paymentMethod,
  setPaymentMethod,
  isCuentaCorrienteHabilitada,
  setError,
  ccTerms,
  setCcTerms,
  isArgentinaClient,
  shopUser,
  billing,
  netCommercialSubtotal,
  activePercepcionesList = [],
  acceptTerms,
  setAcceptTerms,
  handlePlaceOrder,
  loading,
  finalOrderTotal = 0,
  cuentaCorrienteLimite = 0,
  isCreditLimitExceeded = false,
  setStep
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const activePayments = (checkoutMethods?.payment || []).filter(m => m.enabled !== false);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandingVectorIcon name="credit-card" size={24} color="#0fa4de" />
          <span>5. Forma de Pago & Condiciones Comerciales</span>
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
          Seleccioná las condiciones financieras para la liquidación de la orden mayorista.
        </p>
      </div>

      {/* Payment Methods Cards */}
      {activePayments.length === 0 ? (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandingVectorIcon name="alert-triangle" size={16} color="#991B1B" />
          <span>No hay medios de pago habilitados actualmente por la administración.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {activePayments.map(m => {
            const isSel = paymentMethod === m.id;
            const isCC = isCuentaCorrienteMethod(m);
            const isNotEnabled = isCC && !isCuentaCorrienteHabilitada;
            const isLimitBlocked = isCC && cuentaCorrienteLimite > 0 && finalOrderTotal > cuentaCorrienteLimite;
            const isBlocked = isNotEnabled || isLimitBlocked;

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isLimitBlocked) {
                    setError(`El monto total de la orden ($${finalOrderTotal.toFixed(2)} USD) supera el límite de crédito disponible de tu Cuenta Corriente ($${cuentaCorrienteLimite.toFixed(2)} USD). Por favor seleccioná Transferencia Bancaria u otro medio de pago.`);
                    return;
                  }
                  if (isNotEnabled) {
                    setError('La Cuenta Corriente no está habilitada para tu cuenta comercial. Comunicate con DACAS para solicitar calificación crediticia.');
                    return;
                  }
                  setError('');
                  setPaymentMethod(m.id);
                }}
                style={{
                  border: isBlocked 
                    ? '1.5px dashed #CBD5E1' 
                    : `2px solid ${isSel ? '#0fa4de' : '#E2E8F0'}`,
                  background: isBlocked 
                    ? '#F8FAFC' 
                    : isSel ? '#F0F9FF' : '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  cursor: isBlocked ? 'not-allowed' : 'pointer',
                  opacity: isBlocked ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: isBlocked
                        ? '#F1F5F9'
                        : isSel ? 'rgba(15, 164, 222, 0.15)' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BrandingVectorIcon
                        name={isBlocked ? (isLimitBlocked ? 'alert-triangle' : 'lock') : (m.icon || 'credit-card')}
                        size={22}
                        color={isBlocked ? (isLimitBlocked ? '#D97706' : '#94A3B8') : isSel ? '#0fa4de' : '#64748B'}
                      />
                    </div>
                    <div>
                      <div style={{
                        fontWeight: '800',
                        fontSize: '14px',
                        color: isBlocked ? '#64748B' : '#071524',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{m.title}</span>
                        {isNotEnabled && (
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            background: '#FEE2E2',
                            color: '#991B1B',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            No Habilitada
                          </span>
                        )}
                        {isLimitBlocked && (
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            background: '#FEF3C7',
                            color: '#B45309',
                            border: '1px solid #FCD34D',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            ⚠️ Límite Excedido (${cuentaCorrienteLimite.toLocaleString()} USD máx.)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        {m.subtitle || m.description || ''}
                      </div>
                    </div>
                  </div>

                  {isNotEnabled ? (
                    <span style={{
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}>
                      <BrandingVectorIcon name="lock" size={11} color="#DC2626" />
                      <span>Bloqueada</span>
                    </span>
                  ) : isLimitBlocked ? (
                    <span style={{
                      background: '#FFFBEB',
                      color: '#B45309',
                      border: '1px solid #FCD34D',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}>
                      <BrandingVectorIcon name="alert-triangle" size={11} color="#B45309" />
                      <span>Límite Superado</span>
                    </span>
                  ) : isCC && isCuentaCorrienteHabilitada ? (
                    <span style={{
                      background: '#DCFCE7',
                      color: '#166534',
                      border: '1px solid #BBF7D0',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}>
                      <BrandingVectorIcon name="check" size={12} color="#166534" />
                      <span>Crédito Aprobado {cuentaCorrienteLimite > 0 ? `(Hasta $${cuentaCorrienteLimite.toLocaleString()} USD)` : ''}</span>
                    </span>
                  ) : (
                    m.badge && m.badge.toLowerCase() !== 'crédito aprobado' && m.badge.toLowerCase() !== 'credito aprobado' && (
                      <span style={{
                        background: isSel ? '#0fa4de' : '#10B981',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        flexShrink: 0
                      }}>
                        {m.badge}
                      </span>
                    )
                  )}
                </div>

                {/* Alert message if Cuenta Corriente is blocked due to disabled account */}
                {isNotEnabled && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: '#FFF1F2',
                    border: '1px solid #FFE4E6',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#9F1239',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: '1.4'
                  }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      <BrandingVectorIcon name="alert-triangle" size={14} color="#E11D48" />
                    </div>
                    <div>
                      <strong>Línea de crédito no habilitada:</strong> Tu cuenta mayorista no posee habilitada la Cuenta Corriente para compras a plazo. Para solicitar calificación y apertura de línea crediticia a 30/60 días, contactá a tu ejecutivo comercial en DACAS.
                    </div>
                  </div>
                )}

                {/* Alert message if Cuenta Corriente exceeds credit limit */}
                {isLimitBlocked && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    background: '#FFFBEB',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: '1.45'
                  }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      <BrandingVectorIcon name="alert-triangle" size={16} color="#D97706" />
                    </div>
                    <div>
                      <strong style={{ color: '#B45309' }}>Límite de crédito superado (${finalOrderTotal.toFixed(2)} USD &gt; ${cuentaCorrienteLimite.toFixed(2)} USD):</strong> Tu cuenta comercial posee un límite de crédito autorizado de <strong>${cuentaCorrienteLimite.toFixed(2)} USD</strong> en DACAS. Dado que esta compra supera dicho monto, no podés financiarla con Cuenta Corriente. Por favor seleccioná <strong>Transferencia Bancaria Directa</strong> o contactá a tu ejecutivo de cuentas para solicitar una ampliación de crédito.
                    </div>
                  </div>
                )}

                {/* ── CUENTA CORRIENTE TERMS (ONLY IF HABILITADA) ── */}
                {!isBlocked && isSel && isCC && (
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #BAE6FD' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#0369A1' }}>
                        {m.terms_label || 'Plazo de Facturación:'}
                      </label>
                      <select
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0fa4de', background: '#fff', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                        value={ccTerms}
                        onChange={e => setCcTerms(e.target.value)}
                      >
                        <option value="30_dias">30 días fecha de emisión de factura</option>
                        <option value="60_dias">60 días fecha de emisión de factura</option>
                        <option value="90_dias">90 días fecha de emisión de factura (Especial)</option>
                      </select>
                    </div>
                    {m.instrucciones && (
                      <div style={{ fontSize: '11px', color: '#0284C7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BrandingVectorIcon name="info" size={13} color="#0284C7" />
                        <span>{m.instrucciones}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TRANSFERENCIA BANCARIA DETAILS (CBU / SWIFT / ALIAS) ── */}
                {isSel && m.id === 'transferencia' && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1.5px solid #BAE6FD',
                    boxShadow: '0 2px 10px rgba(15, 164, 222, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E0F2FE' }}>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BrandingVectorIcon name="building-2" size={14} color="#0369A1" />
                        <span>Cuentas Bancarias Habilitadas para Liquidación</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '800', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '8px' }}>
                        {m.tipo_cuenta || 'USD / ARS Oficial'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>Banco:</span>
                        <strong style={{ color: '#0F172A' }}>{m.banco || 'Banco Santander / BBVA'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>Titular & Razón Social:</span>
                        <strong style={{ color: '#0F172A' }}>{m.titular || 'DACAS S.A.'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>CUIT / Tax ID:</span>
                        <strong style={{ color: '#0F172A' }}>{m.cuit || '30-68942158-9'}</strong>
                      </div>
                    </div>

                    {/* CBU & Alias Copy Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      {/* CBU Box */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CBU / CVU</div>
                          <code style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', letterSpacing: '0.02em' }}>
                            {m.cbu || '0720123920000001234567'}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(m.cbu || '0720123920000001234567', 'cbu');
                          }}
                          style={{
                            background: copiedKey === 'cbu' ? '#10B981' : '#0fa4de',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <BrandingVectorIcon name={copiedKey === 'cbu' ? "check" : "file-text"} size={11} color="#ffffff" />
                          <span>{copiedKey === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      {/* Alias Box */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Alias CBU</div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0369A1' }}>
                            {m.alias || 'DACAS.PAGOS.B2B'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(m.alias || 'DACAS.PAGOS.B2B', 'alias');
                          }}
                          style={{
                            background: copiedKey === 'alias' ? '#10B981' : '#0fa4de',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <BrandingVectorIcon name={copiedKey === 'alias' ? "check" : "file-text"} size={11} color="#ffffff" />
                          <span>{copiedKey === 'alias' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* SWIFT Box */}
                    {m.swift && (
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <BrandingVectorIcon name="globe" size={12} color="#166534" />
                          <span><strong>Código SWIFT (Transferencias Internacionales):</strong> <code style={{ fontWeight: '800', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>{m.swift}</code></span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(m.swift, 'swift');
                          }}
                          style={{
                            background: copiedKey === 'swift' ? '#10B981' : '#16A34A',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BrandingVectorIcon name={copiedKey === 'swift' ? "check" : "file-text"} size={10} color="#ffffff" />
                          <span>{copiedKey === 'swift' ? 'Copiado' : 'Copiar SWIFT'}</span>
                        </button>
                      </div>
                    )}

                    {/* Instrucciones de envío de comprobante */}
                    {m.instrucciones && (
                      <div style={{ fontSize: '11px', color: '#475569', background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <BrandingVectorIcon name="file-text" size={12} color="#475569" />
                        <span><strong>Nota:</strong> {m.instrucciones}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── E-CHEQ DETAILS ── */}
                {isSel && m.id === 'echeq' && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1.5px solid #BAE6FD',
                    boxShadow: '0 2px 10px rgba(15, 164, 222, 0.08)'
                  }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0369A1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BrandingVectorIcon name="file-text" size={14} color="#0369A1" />
                      <span>Datos para Emisión de E-Cheq</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                      <div><span style={{ color: '#64748B' }}>CUIT Receptor:</span> <strong>{m.cuit_receptor || '30-68942158-9'}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Banco Receptor:</span> <strong>{m.banco_receptor || 'Banco Santander'}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Plazos Admitidos:</span> <strong>{m.plazos_admitidos || '30 y 60 días'}</strong></div>
                    </div>
                    {m.instrucciones && (
                      <div style={{ fontSize: '11px', color: '#475569', background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px' }}>
                        {m.instrucciones}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TARJETA STRIPE DETAILS ── */}
                {isSel && m.id === 'tarjeta' && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #BAE6FD', fontSize: '12px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="lock" size={13} color="#0369A1" />
                    <span><strong>{m.gateway || 'Stripe SSL 256-bit'}:</strong> {m.instrucciones || 'Transacción encriptada y protegida bajo normativa PCI-DSS.'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Liquidación Impositiva & Percepciones IIBB (Argentina) */}
      {isArgentinaClient && (
        <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '18px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏛️</span>
              <span>Liquidación Impositiva & Percepciones IIBB (Argentina)</span>
            </div>
            <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
              Régimen: {shopUser?.iibb_tipo || 'C.M.'} • Sede: {shopUser?.iibb_jurisdiccion || '901 - Capital Federal'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', color: '#475569', marginBottom: '14px', background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div>CUIT / NIT: <strong style={{ color: '#0F172A' }}>{billing?.cuit || shopUser?.cuit || shopUser?.numero_nit || '30-12345678-9'}</strong></div>
            <div>Nro Inscripción IIBB: <strong style={{ color: '#0F172A' }}>{shopUser?.iibb_numero || shopUser?.cuit || '9017223280'}</strong></div>
            <div>Base Imponible Neta: <strong style={{ color: '#0F172A' }}>${(netCommercialSubtotal || 0).toFixed(2)} USD</strong></div>
          </div>

          {/* Lista de Percepciones Calculadas sobre Valor Neto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activePercepcionesList.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#DCFCE7', borderRadius: '8px' }}>
                <span>✓</span> Cliente sin percepciones activas de Ingresos Brutos (Alícuota 0.00% o Exento).
              </div>
            ) : (
              activePercepcionesList.map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FFFBEB',
                  border: '1px solid #FEF3C7',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px'
                }}>
                  <div>
                    <span style={{ fontWeight: '800', color: '#92400E' }}>Percepción IIBB {p.label}:</span>
                    <span style={{ color: '#B45309', marginLeft: '6px', fontSize: '11.5px' }}>
                      Alícuota: <strong>{p.alicuota.toFixed(4)}%</strong> {p.coef ? `(Coef: ${p.coef})` : ''} sobre valor neto
                    </span>
                    {p.vigencia && <span style={{ color: '#94A3B8', fontSize: '11px', marginLeft: '8px' }}>(Vto: {p.vigencia})</span>}
                  </div>
                  <span style={{ fontWeight: '900', color: '#B45309', fontSize: '13.5px' }}>
                    +${p.amount.toFixed(2)} USD
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions Box */}
      <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={e => setAcceptTerms(e.target.checked)}
            style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#0fa4de' }}
          />
          <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
            {checkoutMethods?.terms_conditions_text || 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'}
          </span>
        </label>
      </div>

      {/* Step 5 Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={() => setStep('end_user')}
          style={{ background: 'transparent', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
        >
          ← Volver a Datos de End User
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '15px 36px',
            fontWeight: '900',
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(15, 164, 222, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {loading ? 'Generando Orden y Proforma...' : `Confirmar y Emitir Orden B2B • $${finalOrderTotal.toFixed(2)} USD`}
        </button>
      </div>
    </div>
  );
}
