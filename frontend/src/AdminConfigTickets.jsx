import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminConfigTickets() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    habilitarNuevoTicketProcesos: true,
    habilitarReintegroGastos: true,
    habilitarReservaViajes: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/config-tickets`);
      if (!response.ok) throw new Error('Error al obtener la configuración.');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMensaje(null);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Error al guardar la configuración.');
      const data = await response.json();
      setConfig(data);
      setMensaje('✨ ¡Configuración guardada exitosamente!');
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crm-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header className="crm-header" style={{ marginBottom: '30px' }}>
        <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>⚙️ Configuración de Creación de Tickets</h1>
          <div className="user-controls">
            <button className="nav-btn" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              🔙 Volver a Berta Ticket
            </button>
          </div>
        </div>
        <p style={{ color: '#6e6e73', marginTop: '10px' }}>
          Desde aquí puedes habilitar o deshabilitar cualquier función o tipo de formulario en el flujo de creación de tickets para usuarios y agentes.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#86868b' }}>
          Cargando configuración...
        </div>
      ) : (
        <main className="crm-main" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <section className="form-section" style={{ background: '#ffffff', borderRadius: '24px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', color: '#1c1c1e' }}>Funciones del Formulario</h2>
            
            {mensaje && (
              <div style={{ background: '#eafaf1', color: '#2e7d32', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c8e6c9', animation: 'fadeIn 0.3s ease' }}>
                {mensaje}
              </div>
            )}
            {error && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '500', border: '1px solid #ffcdd2', animation: 'fadeIn 0.3s ease' }}>
                ❌ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Feature 1: Nuevo Ticket Procesos */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>🎫</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1c1c1e' }}>Nuevo Ticket Procesos</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#86868b' }}>Formulario para solicitudes de soporte tradicionales y procesos operativos generales.</p>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                  <input 
                    type="checkbox" 
                    checked={config.habilitarNuevoTicketProcesos}
                    onChange={() => handleToggle('habilitarNuevoTicketProcesos')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="slider" style={{ 
                    position: 'absolute', 
                    cursor: 'pointer', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: config.habilitarNuevoTicketProcesos ? 'var(--primary)' : '#ccc', 
                    transition: '.4s', 
                    borderRadius: '34px' 
                  }}>
                    <span className="knob" style={{ 
                      position: 'absolute', 
                      content: '""', 
                      height: '26px', width: '26px', 
                      left: config.habilitarNuevoTicketProcesos ? '30px' : '4px', 
                      bottom: '4px', 
                      backgroundColor: 'white', 
                      transition: '.4s', 
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Feature 2: Reintegro de Gastos */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>💸</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1c1c1e' }}>Reintegro de Gastos</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#86868b' }}>Formulario estructurado de expenses para rembolsos y rendiciones de gastos.</p>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                  <input 
                    type="checkbox" 
                    checked={config.habilitarReintegroGastos}
                    onChange={() => handleToggle('habilitarReintegroGastos')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="slider" style={{ 
                    position: 'absolute', 
                    cursor: 'pointer', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: config.habilitarReintegroGastos ? '#6b21a8' : '#ccc', 
                    transition: '.4s', 
                    borderRadius: '34px' 
                  }}>
                    <span className="knob" style={{ 
                      position: 'absolute', 
                      content: '""', 
                      height: '26px', width: '26px', 
                      left: config.habilitarReintegroGastos ? '30px' : '4px', 
                      bottom: '4px', 
                      backgroundColor: 'white', 
                      transition: '.4s', 
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></span>
                  </span>
                </label>
              </div>

              {/* Feature 3: Reserva de Viajes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>✈️</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1c1c1e' }}>Reserva de Viajes</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#86868b' }}>Formulario estructurado premium con 5 secciones para reservas de viajes y aéreos.</p>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                  <input 
                    type="checkbox" 
                    checked={config.habilitarReservaViajes}
                    onChange={() => handleToggle('habilitarReservaViajes')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="slider" style={{ 
                    position: 'absolute', 
                    cursor: 'pointer', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: config.habilitarReservaViajes ? 'var(--purple-brand)' : '#ccc', 
                    transition: '.4s', 
                    borderRadius: '34px' 
                  }}>
                    <span className="knob" style={{ 
                      position: 'absolute', 
                      content: '""', 
                      height: '26px', width: '26px', 
                      left: config.habilitarReservaViajes ? '30px' : '4px', 
                      bottom: '4px', 
                      backgroundColor: 'white', 
                      transition: '.4s', 
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></span>
                  </span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSave} 
                disabled={saving}
                style={{
                  padding: '14px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0d655e 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(15, 118, 110, 0.3)',
                  transition: 'all 0.25s ease',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Guardando...' : '💾 Guardar Configuración'}
              </button>
            </div>
          </section>

          {/* Premium Preview Box */}
          <section style={{ background: 'var(--primary-light)', border: '1px dashed var(--primary)', borderRadius: '24px', padding: '25px', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem' }}>💡</div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--primary)' }}>¿Cómo funciona esta configuración?</h4>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#6e6e73', lineHeight: '1.5' }}>
                Si deshabilitas una función, los usuarios empleados y los agentes no verán el botón o la pestaña de esa opción específica cuando hagan clic en "Crear Ticket". Si se deshabilitan las opciones de <strong>Reintegro de Gastos</strong> y <strong>Reserva de Viajes</strong> simultáneamente, la pestaña completa de <strong>Expenses</strong> se ocultará automáticamente para simplificar la interfaz.
              </p>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default AdminConfigTickets;
