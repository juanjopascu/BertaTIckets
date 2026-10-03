import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const COUNTRIES = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', emailSuffix: 'ar', region: 'Cono Sur' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', emailSuffix: 'cl', region: 'Cono Sur' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', emailSuffix: 'co', region: 'Andina' },
  { code: 'MX', name: 'México', flag: '🇲🇽', emailSuffix: 'mx', region: 'Norteamérica' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', emailSuffix: 'uy', region: 'Cono Sur' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', emailSuffix: 'pe', region: 'Andina' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', emailSuffix: 'us', region: 'Hub Miami' }
];

export default function AdminCanalesAyuda({ embedded = false }) {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('AR');
  const [canales, setCanales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Modal para clonar/copiar canales desde otro país
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceCountry, setCopySourceCountry] = useState('AR');

  // New sector modal/form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSector, setNewSector] = useState({
    sector: '',
    email: '',
    asunto: 'Consulta - DACAS',
    descripcion: '',
    activo: true
  });

  const activeCountryObj = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  const presetEmails = [
    `soporte.${activeCountryObj.emailSuffix}@dacas.com`,
    `ventas.${activeCountryObj.emailSuffix}@dacas.com`,
    `facturacion.${activeCountryObj.emailSuffix}@dacas.com`,
    `info.${activeCountryObj.emailSuffix}@dacas.com`,
    `admin.${activeCountryObj.emailSuffix}@dacas.com`,
    'soporte.interno@dacas.com',
    'ventas@dacas.com',
    'facturacion@dacas.com',
    'info@dacas.com',
    'cobranzas@dacas.com'
  ];

  useEffect(() => {
    fetchCanales(selectedCountry);
  }, [selectedCountry]);

  const fetchCanales = async (countryCode = selectedCountry) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/config-ayuda?country=${countryCode}`);
      if (!res.ok) throw new Error('Error al obtener canales de ayuda.');
      const data = await res.json();
      setCanales(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (index, newEmail) => {
    const updated = [...canales];
    updated[index].email = newEmail;
    setCanales(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...canales];
    updated[index][field] = value;
    setCanales(updated);
  };

  const handleToggleActivo = (index) => {
    const updated = [...canales];
    updated[index].activo = !updated[index].activo;
    setCanales(updated);
  };

  const handleDeleteSector = (index) => {
    if (!window.confirm(`¿Eliminar el sector "${canales[index].sector}" para ${activeCountryObj.name}?`)) return;
    const updated = canales.filter((_, i) => i !== index);
    setCanales(updated);
  };

  const handleAddNewSector = (e) => {
    e.preventDefault();
    if (!newSector.sector.trim() || !newSector.email.trim()) {
      alert('El nombre del sector y el correo son obligatorios.');
      return;
    }
    const nuevo = {
      ...newSector,
      id: `sector_${Date.now()}`
    };
    setCanales([...canales, nuevo]);
    setNewSector({
      sector: '',
      email: `soporte.${activeCountryObj.emailSuffix}@dacas.com`,
      asunto: `Consulta - DACAS ${activeCountryObj.name}`,
      descripcion: '',
      activo: true
    });
    setShowNewModal(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMensaje(null);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('crm_token') || sessionStorage.getItem('token') || sessionStorage.getItem('sessionId');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/config-ayuda?country=${selectedCountry}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ country_code: selectedCountry, canales })
      });
      if (!res.ok) throw new Error('Error al guardar la configuración de correos.');
      const data = await res.json();
      setCanales(Array.isArray(data) ? data : canales);
      setMensaje(`✨ ¡Canales y correos de ${activeCountryObj.flag} ${activeCountryObj.name} guardados con éxito!`);
      setTimeout(() => setMensaje(null), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm(`¿Restablecer los canales de ayuda de ${activeCountryObj.name} a los valores predeterminados de fábrica?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/config-ayuda/reset?country=${selectedCountry}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al restablecer canales de ayuda.');
      const data = await res.json();
      setCanales(Array.isArray(data) ? data : []);
      setMensaje(`🔄 Canales de ${activeCountryObj.flag} ${activeCountryObj.name} restablecidos a los valores oficiales.`);
      setTimeout(() => setMensaje(null), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFromCountry = async () => {
    if (copySourceCountry === selectedCountry) {
      alert('Seleccione un país de origen diferente.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/config-ayuda?country=${copySourceCountry}`);
      if (!res.ok) throw new Error('Error al leer canales del país origen.');
      const sourceCanales = await res.json();
      if (Array.isArray(sourceCanales) && sourceCanales.length > 0) {
        const sourceCountry = COUNTRIES.find(c => c.code === copySourceCountry) || { emailSuffix: 'ar', name: 'Argentina' };
        const targetSuffix = activeCountryObj.emailSuffix;
        const cloned = sourceCanales.map(c => ({
          ...c,
          id: `sector_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email: c.email.replace(`.${sourceCountry.emailSuffix}@`, `.${targetSuffix}@`).replace(/@dacas\.com$/, `.${targetSuffix}@dacas.com`),
          sector: c.sector.replace(sourceCountry.name, activeCountryObj.name),
          asunto: c.asunto.replace(sourceCountry.name, activeCountryObj.name),
          descripcion: (c.descripcion || '').replace(sourceCountry.name, activeCountryObj.name)
        }));
        setCanales(cloned);
        setShowCopyModal(false);
        setMensaje(`📋 Sectores clonados de ${sourceCountry.name} para ${activeCountryObj.name}. Haz clic en "Guardar Todos los Cambios" para confirmar.`);
        setTimeout(() => setMensaje(null), 4500);
      } else {
        alert(`No se encontraron canales en ${copySourceCountry}`);
      }
    } catch (err) {
      setError('Error al copiar sectores: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={embedded ? "crm-embedded-view" : "crm-container"} style={embedded ? { width: '100%', maxWidth: '100%', margin: 0, padding: 0 } : { maxWidth: '1140px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      {!embedded && (
        <header className="crm-header" style={{ marginBottom: '24px' }}>
          <div className="header-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '1.4rem',
                  letterSpacing: '-0.02em',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(15, 164, 222, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>DACAS</span>
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Canales y Correos de Ayuda
                  </h1>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Configuración de correos de destino independientes por país para el Shop y CRM
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  type="button"
                  className="nav-btn" 
                  onClick={() => navigate('/shop')} 
                  style={{ 
                    cursor: 'pointer', 
                    background: 'rgba(15, 164, 222, 0.1)', 
                    color: '#0fa4de', 
                    border: '1px solid rgba(15, 164, 222, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  <BrandingVectorIcon name="shopping-bag" size={14} color="#0fa4de" />
                  <span>Ver Shop</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Selector de Países con Pestañas / Tabs */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span>
            <span style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-main)' }}>
              Ámbito de País (Aislamiento Multi-Tenant)
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(15, 164, 222, 0.12)',
              color: '#0fa4de'
            }}>
              100% Independiente
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowCopyModal(true)}
              style={{
                background: 'rgba(15, 164, 222, 0.08)',
                color: '#0fa4de',
                border: '1px solid rgba(15, 164, 222, 0.25)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Copiar sectores desde otro país"
            >
              <BrandingVectorIcon name="copy" size={13} color="#0fa4de" />
              <span>Clonar desde otro país</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Restaurar valores de fábrica para este país"
            >
              <BrandingVectorIcon name="refresh-cw" size={13} color="#ef4444" />
              <span>Restaurar Oficial</span>
            </button>
          </div>
        </div>

        {/* Barra de Tabs de Países */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {COUNTRIES.map(c => {
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCountry(c.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #0fa4de' : '1px solid var(--border-color, #e2e8f0)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(15, 164, 222, 0.14) 0%, rgba(2, 132, 199, 0.08) 100%)' 
                    : 'transparent',
                  color: isSelected ? '#0fa4de' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 8px rgba(15, 164, 222, 0.2)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{c.flag}</span>
                <span>{c.name}</span>
                {isSelected && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#0fa4de',
                    display: 'inline-block'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Contexto de País Activo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(14, 165, 233, 0.03) 100%)',
        border: '1px solid rgba(15, 164, 222, 0.25)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>{activeCountryObj.flag}</span>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Editando Canales de Soporte y Ayuda para <span style={{ color: '#0fa4de' }}>{activeCountryObj.name}</span> ({canales.length} sectores configurados)
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Cualquier cambio o eliminación solo afectará a los clientes y usuarios que operen en {activeCountryObj.name}.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewSector({
              sector: '',
              email: `soporte.${activeCountryObj.emailSuffix}@dacas.com`,
              asunto: `Consulta - DACAS ${activeCountryObj.name}`,
              descripcion: '',
              activo: true
            });
            setShowNewModal(true);
          }}
          style={{
            background: 'var(--primary, #0fa4de)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(15, 164, 222, 0.3)'
          }}
        >
          <BrandingVectorIcon name="plus" size={13} color="#ffffff" strokeWidth={2.5} />
          <span>Agregar Sector a {activeCountryObj.name}</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {mensaje && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <BrandingVectorIcon name="check" size={16} color="#10b981" />
          <span>{mensaje}</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <BrandingVectorIcon name="alert-triangle" size={16} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Canales Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
          Cargando configuración de correos para {activeCountryObj.flag} {activeCountryObj.name}...
        </div>
      ) : canales.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          background: 'var(--card-bg, #ffffff)',
          border: '1px dashed var(--border-color, #e2e8f0)',
          borderRadius: '14px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📬</div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            No hay canales de ayuda configurados para {activeCountryObj.name}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Puedes clonar la estructura desde Argentina o agregar sectores manualmente.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                background: 'var(--primary, #0fa4de)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cargar Valores Oficiales de {activeCountryObj.name}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {canales.map((c, index) => (
            <div
              key={c.id || index}
              style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '14px',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
                opacity: c.activo ? 1 : 0.65,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(15, 164, 222, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BrandingVectorIcon 
                      name={
                        c.id && (c.id.includes('crm') || c.id.includes('soporte')) ? 'headphones' : 
                        c.id && (c.id.includes('shop') || c.id.includes('ventas')) ? 'shopping-bag' : 
                        c.id && (c.id.includes('factura') || c.id.includes('cobranza')) ? 'credit-card' : 
                        'briefcase'
                      }
                      size={18}
                      color="#0fa4de"
                    />
                  </span>
                  <div>
                    <input
                      type="text"
                      value={c.sector}
                      onChange={(e) => handleFieldChange(index, 'sector', e.target.value)}
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: '750',
                        color: 'var(--text-main)',
                        border: '1px solid transparent',
                        borderRadius: '6px',
                        padding: '3px 6px',
                        background: 'transparent',
                        fontFamily: 'inherit'
                      }}
                      title="Haz clic para editar el nombre del sector"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={c.activo}
                      onChange={() => handleToggleActivo(index)}
                      style={{ cursor: 'pointer' }}
                    />
                    {c.activo ? 'Sector Activo' : 'Deshabilitado'}
                  </label>
                  
                  {canales.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSector(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      title={`Eliminar este sector en ${activeCountryObj.name}`}
                    >
                      <BrandingVectorIcon name="trash" size={14} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Selector / Input de Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Correo Electrónico de Destino ({activeCountryObj.flag} {activeCountryObj.name})
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={c.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder={`soporte.${activeCountryObj.emailSuffix}@dacas.com`}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        background: 'var(--input-bg, rgba(0, 0, 0, 0.04))',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontFamily: 'inherit'
                      }}
                    />
                    
                    {/* Presets dropdown */}
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleEmailChange(index, e.target.value);
                      }}
                      style={{
                        padding: '9px 10px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: 'var(--input-bg, rgba(0, 0, 0, 0.04))',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                      title="Seleccionar correo sugerido"
                    >
                      <option value="">Sugeridos ▾</option>
                      {presetEmails.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Asunto por defecto */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Asunto del Correo (Subject)
                  </label>
                  <input
                    type="text"
                    value={c.asunto}
                    onChange={(e) => handleFieldChange(index, 'asunto', e.target.value)}
                    placeholder="Asunto predeterminado"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      background: 'var(--input-bg, rgba(0, 0, 0, 0.04))',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Descripción opcional */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Descripción o Alcance (Opcional)
                </label>
                <input
                  type="text"
                  value={c.descripcion || ''}
                  onChange={(e) => handleFieldChange(index, 'descripcion', e.target.value)}
                  placeholder={`Detalles de atención para clientes de ${activeCountryObj.name}...`}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    background: 'var(--input-bg, rgba(0, 0, 0, 0.04))',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          ))}

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '14px',
            marginTop: '10px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrandingVectorIcon name="info" size={16} color="var(--primary, #0fa4de)" />
              <span>
                Guardando canales para <strong>{activeCountryObj.flag} {activeCountryObj.name}</strong>. Se aplicarán al Shop y CRM de este país.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 24px',
                fontWeight: '750',
                fontSize: '0.92rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                opacity: saving ? 0.7 : 1
              }}
            >
              <BrandingVectorIcon name="check" size={16} color="#ffffff" strokeWidth={2.5} />
              <span>{saving ? 'Guardando Cambios...' : `Guardar Canales de ${activeCountryObj.name}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Agregar Nuevo Sector */}
      {showNewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeCountryObj.flag}</span>
              <span>Agregar Nuevo Sector en {activeCountryObj.name}</span>
            </h3>

            <form onSubmit={handleAddNewSector} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Nombre del Sector / Área
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ej: Logística y Envíos ${activeCountryObj.name}`}
                  value={newSector.sector}
                  onChange={(e) => setNewSector({ ...newSector, sector: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Correo de Destino
                </label>
                <input
                  type="email"
                  required
                  placeholder={`logistica.${activeCountryObj.emailSuffix}@dacas.com`}
                  value={newSector.email}
                  onChange={(e) => setNewSector({ ...newSector, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  placeholder={`Consulta - DACAS ${activeCountryObj.name}`}
                  value={newSector.asunto}
                  onChange={(e) => setNewSector({ ...newSector, asunto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder={`Consultas específicas para canales en ${activeCountryObj.name}...`}
                  value={newSector.descripcion}
                  onChange={(e) => setNewSector({ ...newSector, descripcion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary, #0fa4de)',
                    color: '#ffffff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Agregar a {activeCountryObj.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clonar / Copiar desde otro país */}
      {showCopyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Clonar Canales de Ayuda
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Copia la configuración de sectores y correos desde otro país y adáptala automáticamente para <strong>{activeCountryObj.flag} {activeCountryObj.name}</strong>.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                País de Origen a copiar:
              </label>
              <select
                value={copySourceCountry}
                onChange={(e) => setCopySourceCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  fontWeight: '600'
                }}
              >
                {COUNTRIES.filter(c => c.code !== selectedCountry).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              background: 'rgba(15, 164, 222, 0.08)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '20px'
            }}>
              💡 Se reemplazarán automáticamente los dominios de correo (ej: <code>soporte.ar@...</code> a <code>soporte.{activeCountryObj.emailSuffix}@...</code>).
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCopyFromCountry}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary, #0fa4de)',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Clonando...' : `Clonar a ${activeCountryObj.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
