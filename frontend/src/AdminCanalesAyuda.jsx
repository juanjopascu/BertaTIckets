import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const PRESET_EMAILS = [
  'soporte.interno@dacas.com',
  'ventas@dacas.com',
  'facturacion@dacas.com',
  'info@dacas.com',
  'admin.ecommerce@dacas.com',
  'soporte@dacas.com',
  'administracion@dacas.com',
  'cobranzas@dacas.com'
];

export default function AdminCanalesAyuda({ embedded = false }) {
  const navigate = useNavigate();
  const [canales, setCanales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // New sector modal/form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSector, setNewSector] = useState({
    sector: '',
    email: 'soporte.interno@dacas.com',
    asunto: 'Consulta - DACAS',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    fetchCanales();
  }, []);

  const fetchCanales = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/config-ayuda`);
      if (!res.ok) throw new Error('Error al obtener canales de ayuda.');
      const data = await res.json();
      setCanales(data);
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
    if (!window.confirm(`¿Eliminar el sector "${canales[index].sector}"?`)) return;
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
      email: 'soporte.interno@dacas.com',
      asunto: 'Consulta - DACAS',
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
      const res = await fetch(`${API_BASE_URL}/api/config-ayuda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canales })
      });
      if (!res.ok) throw new Error('Error al guardar la configuración de correos.');
      const data = await res.json();
      setCanales(data);
      setMensaje('✨ ¡Correos y sectores de ayuda guardados con éxito!');
      setTimeout(() => setMensaje(null), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={embedded ? "crm-embedded-view" : "crm-container"} style={embedded ? { width: '100%', maxWidth: '100%', margin: 0, padding: 0 } : { maxWidth: '1080px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      {!embedded && (
        <header className="crm-header" style={{ marginBottom: '28px' }}>
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
                    Configuración de correos de destino para el botón de ayuda del Shop y CRM
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
                    gap: '6px'
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
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Info Card Banner */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '14px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(15, 164, 222, 0.12)',
            color: '#0fa4de',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem'
          }}>
            <BrandingVectorIcon name="headphones" size={22} color="#0fa4de" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Asignación Directa de Correos por Sector
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Define qué casilla de correo recibe las consultas de cada área cuando un cliente o usuario presiona el botón de ayuda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          style={{
            background: 'var(--primary, #0fa4de)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
          }}
        >
          <BrandingVectorIcon name="plus" size={14} color="#ffffff" strokeWidth={2.5} />
          <span>Agregar Sector</span>
        </button>
      </div>

      {/* Canales Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
          Cargando configuración de correos...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                      title="Eliminar sector"
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
                    Correo Electrónico de Destino
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={c.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="ejemplo@dacas.com"
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
                      {PRESET_EMAILS.map((em) => (
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
                  placeholder="Detalles sobre qué consultas se derivan a esta área..."
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
              <span>Los cambios guardados se aplicarán en tiempo real al botón flotante de ayuda en el Shop y CRM.</span>
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
              <span>{saving ? 'Guardando Cambios...' : 'Guardar Todos los Cambios'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Nuevo Sector */}
      {showNewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '90%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrandingVectorIcon name="plus" size={18} color="var(--primary, #0fa4de)" strokeWidth={2.5} />
              <span>Agregar Nuevo Sector de Ayuda</span>
            </h3>

            <form onSubmit={handleAddNewSector} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Nombre del Sector / Área
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Logística y Envíos"
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
                  placeholder="ejemplo@dacas.com"
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
                  placeholder="Asunto predeterminado"
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
                  placeholder="Descripción de alcance..."
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
                  Agregar Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
