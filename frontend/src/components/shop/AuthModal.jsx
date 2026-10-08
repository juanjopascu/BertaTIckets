import React, { useEffect } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';

/* ─── MODAL DE AUTENTICACIÓN & REGISTRO DE CLIENTES B2B ─── */
export default function AuthModal({
  mode,
  setMode,
  onClose,
  authForm,
  setAuthForm,
  onRegisterSubmit,
  onLoginSubmit,
  error,
  success,
  loading,
  countries,
  clientTypes = []
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 21, 36, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: mode === 'register' ? '640px' : '440px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            fontWeight: 'bold',
            fontSize: '16px',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.background = '#E2E8F0'; e.target.style.color = '#0F172A'; }}
          onMouseLeave={(e) => { e.target.style.background = '#F1F5F9'; e.target.style.color = '#64748B'; }}
        >
          <BrandingVectorIcon name="x" size={16} color="#64748B" />
        </button>

        <div style={{ padding: '28px 32px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#fff',
              fontWeight: '900',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '16px',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(15,164,222,0.3)'
            }}>
              DACAS Enterprise
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#071524' }}>
              {mode === 'register' ? 'Solicitud de Cuenta de Cliente B2B' : 'Acceso a Clientes y Distribuidores'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
              {mode === 'register'
                ? 'Regístrese para acceder a precios mayoristas y soporte técnico oficial'
                : 'Inicie sesión con sus credenciales autorizadas'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            gap: '4px'
          }}>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BrandingVectorIcon name="edit" size={14} color={mode === 'register' ? '#0fa4de' : '#64748B'} />
              <span>Solicitar Registro</span>
            </button>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BrandingVectorIcon name="lock" size={14} color={mode === 'login' ? '#0fa4de' : '#64748B'} />
              <span>Iniciar Sesión</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BrandingVectorIcon name="alert-triangle" size={16} color="#DC2626" />
              <div><strong>Atención:</strong> {error}</div>
            </div>
          )}

          {/* Success Banner (For registration request) */}
          {success ? (
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                <BrandingVectorIcon name="check-circle" size={44} color="#166534" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#166534', fontSize: '18px', fontWeight: '800' }}>
                {success.title}
              </h3>
              <p style={{ margin: '0 0 16px', color: '#15803D', fontSize: '13.5px', lineHeight: '1.6' }}>
                {success.body}
              </p>

              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #DCFCE7', fontSize: '12.5px', color: '#475569', marginBottom: '18px', textAlign: 'left' }}>
                <div><strong>Empresa:</strong> {success.company}</div>
                <div><strong>Email:</strong> {success.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <strong>Estado:</strong>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                  <span style={{ color: '#D97706', fontWeight: '700' }}>Pendiente de Aprobación por Administrador</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setMode('login'); }}
                  style={{
                    flex: 1,
                    background: '#0fa4de',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Ir a Iniciar Sesión
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            /* ── REGISTRATION FORM ── */
            <div>
              {/* B2B Info Box */}
              <div style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
                border: '1px solid #BAE6FD',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <BrandingVectorIcon name="lock" size={20} color="#0369A1" />
                </div>
                <div style={{ fontSize: '12.5px', color: '#0369A1', lineHeight: '1.5' }}>
                  <strong>Distribución Mayorista Exclusiva:</strong> Por políticas comerciales de DACAS, cada solicitud de registro es revisada por nuestro equipo de administración para habilitarle la cuenta, condiciones de pago y lista de precios oficial.
                </div>
              </div>

              <form onSubmit={onRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Gómez"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Razón Social / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Redes & IT Solutions S.A."
                      value={authForm.razon_social}
                      onChange={e => setAuthForm({ ...authForm, razon_social: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Email Corporativo (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contacto@empresa.com"
                      value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+54 11 4444-5555"
                      value={authForm.phone}
                      onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      CUIT / RUT / NIT Fiscal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="30-12345678-9"
                      value={authForm.numero_nit}
                      onChange={e => setAuthForm({ ...authForm, numero_nit: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Tipo de Cliente / Actividad
                    </label>
                    <select
                      value={authForm.tipo_cliente}
                      onChange={e => setAuthForm({ ...authForm, tipo_cliente: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {clientTypes && clientTypes.length > 0 ? (
                        clientTypes.map(ct => (
                          <option key={ct.id || ct.name} value={ct.name}>
                            {ct.name}
                          </option>
                        ))
                      ) : (
                        <option value="Integrador IT / Reseller">Integrador IT / Reseller</option>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      País
                    </label>
                    <select
                      value={authForm.country_id}
                      onChange={e => setAuthForm({ ...authForm, country_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {countries && countries.length > 0 ? (
                        countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      ) : (
                        <option value="1">Argentina</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Ciudad / Localidad
                    </label>
                    <input
                      type="text"
                      placeholder="Buenos Aires, Córdoba..."
                      value={authForm.ciudad}
                      onChange={e => setAuthForm({ ...authForm, ciudad: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                    Contraseña para su cuenta *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '10px',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <BrandingVectorIcon name="mail" size={16} color="#ffffff" />
                  <span>{loading ? 'Enviando Solicitud...' : 'Enviar Solicitud de Registro B2B'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* ── LOGIN FORM ── */
            <form onSubmit={onLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@empresa.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{loading ? 'Validando...' : 'Ingresar a mi Cuenta B2B'}</span>
                <BrandingVectorIcon name="arrow-right" size={14} color="#ffffff" />
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#64748B' }}>
                ¿Aún no tiene cuenta habilitada?{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setMode('register'); }}
                  style={{ color: '#0fa4de', fontWeight: '700', textDecoration: 'none' }}
                >
                  Solicite su alta aquí
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
