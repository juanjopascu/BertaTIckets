import React, { useState } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { API_BASE_URL } from '../../apiConfig';

const DACAS_COUNTRIES = [
  { code: 'AR', name: 'Argentina', id: 2 },
  { code: 'CL', name: 'Chile', id: 4 },
  { code: 'CO', name: 'Colombia', id: 5 },
  { code: 'PE', name: 'Perú', id: 8 },
  { code: 'UY', name: 'Uruguay', id: 10 },
  { code: 'MX', name: 'México', id: 6 },
  { code: 'EC', name: 'Ecuador', id: 7 },
  { code: 'CR', name: 'Costa Rica', id: 12 },
  { code: 'BR', name: 'Brasil', id: 3 },
  { code: 'BO', name: 'Bolivia', id: 1 },
  { code: 'PY', name: 'Paraguay', id: 9 },
  { code: 'DO', name: 'República Dominicana', id: 11 }
];

const CLIENT_TYPES = [
  'Integrador IT / Reseller',
  'Proveedor de Servicios / ISP / Telco',
  'Distribuidor Submayorista',
  'Empresa Corporativa / Cliente Final Enterprise'
];

export default function B2BPortalLogin({ onLoginSuccess, loginConfig = null }) {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'register_success'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    razon_social: '',
    email: '',
    phone: '',
    numero_nit: '',
    tipo_cliente: CLIENT_TYPES[0],
    country_code: 'AR',
    country_id: 2,
    ciudad: '',
    password: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [registeredData, setRegisteredData] = useState(null);

  // Dynamic left column configuration from Visual Settings
  const badgeText = loginConfig?.badgeText || 'Portal Privado B2B - Acceso Restringido';
  const title = loginConfig?.title || 'Distribución Mayorista IT & Ciberseguridad';
  const description = loginConfig?.description || 'Plataforma corporativa de abastecimiento tecnológico exclusiva para Canales, Integradores y Resellers autorizados en América Latina y Estados Unidos.';
  const footerText = loginConfig?.footerText || 'DACAS Mayorista Oficial • Conectividad, Ciberseguridad & Data Centers';

  const defaultFeatures = [
    {
      id: 'feat_1',
      icon: 'globe',
      title: '12 Países con Stock Local',
      desc: 'Acceda a inventario en tiempo real y facturación oficial en moneda local según su sede.'
    },
    {
      id: 'feat_2',
      icon: 'credit-card',
      title: 'Condiciones Comerciales & Crédito',
      desc: 'Precios mayoristas protegidos, margen de canal y gestión de cuenta corriente con verificación B2B.'
    },
    {
      id: 'feat_3',
      icon: 'truck',
      title: 'Despacho Inmediato & Retiro HUB',
      desc: 'Envíos asegurados y retiros en centros logísticos oficiales con trazabilidad integral.'
    },
    {
      id: 'feat_4',
      icon: 'check-circle',
      title: 'Garantía Oficial Directa del Fabricante',
      desc: 'Soporte postventa certificado, canalización de RMA y gestión técnica de licencias enterprise.'
    }
  ];

  const features = Array.isArray(loginConfig?.features) && loginConfig.features.length > 0
    ? loginConfig.features.filter(f => f.enabled !== false)
    : defaultFeatures;

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Por favor complete su correo corporativo y contraseña.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.pending) {
          setLoginError(data.error || 'Su cuenta aún está pendiente de aprobación por el administrador de DACAS.');
        } else {
          setLoginError(data.error || 'Credenciales inválidas. Verifique su correo corporativo y contraseña.');
        }
        setLoginLoading(false);
        return;
      }

      if (data.user && data.token) {
        onLoginSuccess(data.user, data.token);
      } else {
        setLoginError('Respuesta inválida del servidor de autenticación.');
      }
    } catch (err) {
      setLoginError('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.name.trim() || !regForm.razon_social.trim() || !regForm.email.trim() || !regForm.password.trim()) {
      setRegError('Por favor complete todos los campos obligatorios (*).');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setRegLoading(true);

    try {
      const selectedCountry = DACAS_COUNTRIES.find(c => c.code === regForm.country_code) || DACAS_COUNTRIES[0];
      const payload = {
        ...regForm,
        country_code: selectedCountry.code,
        country_id: selectedCountry.id
      };

      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud de registro');
      }

      setRegisteredData({
        company: regForm.razon_social,
        email: regForm.email
      });
      setView('register_success');
    } catch (err) {
      setRegError(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071524 0%, #0c2138 50%, #071524 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: view === 'register' ? '1120px' : '1040px',
        width: '100%',
        background: '#0F2742',
        borderRadius: '24px',
        border: '1px solid rgba(15, 164, 222, 0.25)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        display: 'grid',
        gridTemplateColumns: view === 'register' ? 'minmax(320px, 400px) 1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Columna Izquierda: Información Corporativa DACAS Enterprise */}
        <div style={{
          padding: '44px 40px',
          background: 'linear-gradient(180deg, rgba(7, 21, 36, 0.85) 0%, rgba(15, 39, 66, 0.95) 100%)',
          borderRight: '1px solid rgba(15, 164, 222, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          <div>
            {/* Header / Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                padding: '6px 14px',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
              }}>
                DACAS
              </div>
              <div>
                <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  Shop <span style={{ color: '#0fa4de', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise</span>
                </span>
              </div>
            </div>

            {/* Badge de Seguridad B2B */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 164, 222, 0.15)',
              border: '1px solid rgba(15, 164, 222, 0.35)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: '800',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <BrandingVectorIcon name="shield" size={13} color="#38bdf8" />
              <span>{badgeText}</span>
            </div>

            <h2 style={{
              margin: '0 0 12px',
              color: '#FFFFFF',
              fontSize: '1.75rem',
              fontWeight: '900',
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              {title}
            </h2>

            <p style={{
              margin: '0 0 28px',
              color: '#94A3B8',
              fontSize: '13px',
              lineHeight: 1.6
            }}>
              {description}
            </p>

            {/* Pilares Comerciales B2B */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {features.map((p, idx) => (
                <div key={p.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(15, 164, 222, 0.15)',
                    border: '1px solid rgba(15, 164, 222, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BrandingVectorIcon name={p.icon || 'star'} size={15} color="#0fa4de" />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '800' }}>
                      {p.title}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '11.5px', marginTop: '2px', lineHeight: 1.4 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Informativo */}
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(15, 164, 222, 0.15)',
            fontSize: '11px',
            color: '#64748B'
          }}>
            {footerText}
          </div>
        </div>

        {/* Columna Derecha: Formulario de Ingreso o Formulario de Registro B2B */}
        <div style={{
          padding: '40px 38px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}>
          {/* ── VISTA 1: INGRESO DE CLIENTES B2B ── */}
          {view === 'login' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#E0F2FE',
                  color: '#0284c7',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  marginBottom: '10px'
                }}>
                  <BrandingVectorIcon name="lock" size={12} color="#0284c7" />
                  <span>Credenciales Corporativas</span>
                </div>
                <h3 style={{
                  margin: '0 0 6px',
                  fontSize: '1.45rem',
                  fontWeight: '900',
                  color: '#0F172A',
                  letterSpacing: '-0.02em'
                }}>
                  Ingreso al Portal B2B
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Inicie sesión para acceder al catálogo, precios y stock asignados a la cuenta de su empresa.
                </p>
              </div>

              {loginError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    <BrandingVectorIcon name="alert-circle" size={15} color="#991B1B" />
                  </div>
                  <div>{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                    Correo Electrónico Corporativo
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="compras@suempresa.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0284c7';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1';
                        e.target.style.background = '#F8FAFC';
                      }}
                    />
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <BrandingVectorIcon name="mail" size={16} color="#64748B" />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>
                      Contraseña
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                      Acceso encriptado
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0284c7';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1';
                        e.target.style.background = '#F8FAFC';
                      }}
                    />
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <BrandingVectorIcon name="key" size={16} color="#64748B" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 20px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: loginLoading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {loginLoading ? (
                    <>
                      <BrandingVectorIcon name="rotate-ccw" size={16} color="#FFFFFF" />
                      <span>Verificando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar a mi Tienda B2B</span>
                      <BrandingVectorIcon name="arrow-right" size={15} color="#FFFFFF" />
                    </>
                  )}
                </button>
              </form>

              {/* Botón para solicitar alta de cuenta B2B */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                    ¿Su empresa aún no es cliente mayorista de DACAS?
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
                    Solicite la habilitación de su cuenta corporativa para acceder a precios de distribución mayorista, margen de canal y crédito comercial.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setView('register');
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #0284c7',
                      color: '#0284c7',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0284c7';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = '#0284c7';
                    }}
                  >
                    <BrandingVectorIcon name="building" size={14} color="currentColor" />
                    <span>Solicitar Alta de Cuenta B2B</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── VISTA 2: FORMULARIO DE REGISTRO / ALTA B2B EN LA MISMA PÁGINA ── */}
          {view === 'register' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setView('login');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 0
                  }}
                >
                  <BrandingVectorIcon name="arrow-left" size={14} color="#0284c7" />
                  <span>Volver al Ingreso</span>
                </button>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Paso 1 de 1
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  margin: '0 0 6px',
                  fontSize: '1.45rem',
                  fontWeight: '900',
                  color: '#0F172A',
                  letterSpacing: '-0.02em'
                }}>
                  Solicitud de Cuenta de Cliente B2B
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.45 }}>
                  Complete los datos de su empresa para solicitar la apertura de cuenta mayorista y condiciones comerciales oficiales.
                </p>
              </div>

              {/* Notificación informativa B2B */}
              <div style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  <BrandingVectorIcon name="shield" size={15} color="#0284c7" />
                </div>
                <div style={{ fontSize: '11.5px', color: '#0369a1', lineHeight: 1.45 }}>
                  <strong>Distribución Mayorista Exclusiva:</strong> Por políticas comerciales de DACAS, cada solicitud de registro es revisada por nuestro equipo de administración para verificar actividad comercial y habilitar la lista de precios oficial.
                </div>
              </div>

              {regError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <BrandingVectorIcon name="alert-circle" size={14} color="#991B1B" />
                  <div>{regError}</div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Razón Social / Empresa *
                    </label>
                    <input
                      type="text"
                      value={regForm.razon_social}
                      onChange={(e) => setRegForm({ ...regForm, razon_social: e.target.value })}
                      placeholder="Ej: Redes & IT Solutions S.A."
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="Ej: Laura Gómez"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Email Corporativo (Login) *
                    </label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+54 11 4444-5555"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      CUIT / RUT / NIT Fiscal *
                    </label>
                    <input
                      type="text"
                      value={regForm.numero_nit}
                      onChange={(e) => setRegForm({ ...regForm, numero_nit: e.target.value })}
                      placeholder="30-12345678-9"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Tipo de Cliente / Actividad
                    </label>
                    <select
                      value={regForm.tipo_cliente}
                      onChange={(e) => setRegForm({ ...regForm, tipo_cliente: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    >
                      {CLIENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      País de Radicación *
                    </label>
                    <select
                      value={regForm.country_code}
                      onChange={(e) => {
                        const code = e.target.value;
                        const match = DACAS_COUNTRIES.find(c => c.code === code);
                        setRegForm({
                          ...regForm,
                          country_code: code,
                          country_id: match ? match.id : 2
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    >
                      {DACAS_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                      Ciudad / Localidad *
                    </label>
                    <input
                      type="text"
                      value={regForm.ciudad}
                      onChange={(e) => setRegForm({ ...regForm, ciudad: e.target.value })}
                      placeholder="Buenos Aires, Santiago, Bogotá..."
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        background: '#F8FAFC',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                    Contraseña para su Cuenta *
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '12.5px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: regLoading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {regLoading ? (
                    <>
                      <BrandingVectorIcon name="rotate-ccw" size={15} color="#FFFFFF" />
                      <span>Procesando Solicitud...</span>
                    </>
                  ) : (
                    <>
                      <BrandingVectorIcon name="send" size={15} color="#FFFFFF" />
                      <span>Enviar Solicitud de Registro B2B</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── VISTA 3: ÉXITO EN EL REGISTRO B2B ── */}
          {view === 'register_success' && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#DCFCE7',
                border: '2px solid #86EFAC',
                color: '#16A34A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <BrandingVectorIcon name="check-circle" size={32} color="#16A34A" />
              </div>

              <h3 style={{
                margin: '0 0 10px',
                fontSize: '1.45rem',
                fontWeight: '900',
                color: '#0F172A'
              }}>
                ¡Solicitud de Registro Enviada con Éxito!
              </h3>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                margin: '18px 0',
                textAlign: 'left',
                fontSize: '12.5px',
                lineHeight: 1.5,
                color: '#334155'
              }}>
                <p style={{ margin: '0 0 8px' }}>
                  Su solicitud de alta para <strong>{registeredData?.company}</strong> ha sido recibida por el equipo de administración de DACAS.
                </p>
                <p style={{ margin: 0, color: '#64748B' }}>
                  Una vez validados sus antecedentes comerciales, recibirá la confirmación al correo <strong>{registeredData?.email}</strong> para comenzar a operar en la plataforma.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegForm({
                    name: '',
                    razon_social: '',
                    email: '',
                    phone: '',
                    numero_nit: '',
                    tipo_cliente: CLIENT_TYPES[0],
                    country_code: 'AR',
                    country_id: 2,
                    ciudad: '',
                    password: ''
                  });
                  setView('login');
                }}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Volver al Inicio de Sesión</span>
                <BrandingVectorIcon name="arrow-right" size={14} color="#FFFFFF" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
