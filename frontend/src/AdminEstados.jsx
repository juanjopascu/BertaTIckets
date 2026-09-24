import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminEstados() {
  const navigate = useNavigate();
  const [estados, setEstados] = useState([]);
  const [nombre, setNombre] = useState('');
  const [slaHoras, setSlaHoras] = useState(24);
  const [error, setError] = useState(null);

  // Estados de edición inline
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editSlaHoras, setEditSlaHoras] = useState(24);

  useEffect(() => {
    fetchEstados();
  }, []);

  const fetchEstados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estados`);
      const data = await response.json();
      setEstados(data);
    } catch (err) {
      setError('Error al obtener estados.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/estados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, sla_horas: parseInt(slaHoras) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setNombre('');
      setSlaHoras(24);
      fetchEstados();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (e) => {
    setEditingId(e.id);
    setEditNombre(e.nombre);
    setEditSlaHoras(e.sla_horas || 24);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNombre('');
    setEditSlaHoras(24);
  };

  const handleSaveEdit = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/estados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre, sla_horas: parseInt(editSlaHoras) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setEditingId(null);
      fetchEstados();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estados/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchEstados();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="crm-container">
      <header className="crm-header">
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
                  Administración de Estados
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Flujos de ciclo de vida de tickets y etapas del embudo
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--pill-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <span>🇦🇷</span>
                <span>DACAS Argentina</span>
              </div>

              <div className="user-controls">
                <button className="nav-btn" onClick={() => navigate('/')}>🔙 Volver al Dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="crm-main">
        <section className="form-section">
          <h2>Nuevo Estado</h2>
          {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg, #fef2f2)', color: 'var(--danger, #ef4444)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
          <form onSubmit={handleSubmit} className="crm-form">
            <div className="form-group">
              <label>Nombre del Estado</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Límite SLA (Horas)</label>
              <input type="number" min="1" value={slaHoras} onChange={(e) => setSlaHoras(e.target.value)} required />
            </div>
            <button type="submit" className="btn-submit">Crear Estado</button>
          </form>
        </section>

        <section className="board-section">
          <h2>Lista de Estados</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nombre</th>
                <th style={{ width: '180px' }}>Límite SLA</th>
                <th style={{ width: '220px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estados.map(e => {
                const isEditing = e.id === editingId;
                const isProspecto = e.nombre === 'Prospecto' || e.id === 1;
                return (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editNombre} 
                          onChange={(e) => setEditNombre(e.target.value)} 
                          required 
                          disabled={isProspecto} // Prospecto is protected
                          style={{ 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #cbd5e1', 
                            background: 'transparent', 
                            color: 'inherit', 
                            width: '90%',
                            fontFamily: 'inherit',
                            fontSize: 'inherit'
                          }} 
                        />
                      ) : (
                        <strong>{e.nombre}</strong>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="number" 
                            min="1" 
                            value={editSlaHoras} 
                            onChange={(e) => setEditSlaHoras(e.target.value)} 
                            required 
                            style={{ 
                              padding: '8px 12px', 
                              borderRadius: '8px', 
                              border: '1px solid #cbd5e1', 
                              background: 'transparent', 
                              color: 'inherit', 
                              width: '80px',
                              fontFamily: 'inherit',
                              fontSize: 'inherit'
                            }} 
                          />
                          <span>horas</span>
                        </div>
                      ) : (
                        <span style={{ 
                          fontWeight: 600, 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem', 
                          background: 'var(--primary-light)', 
                          color: 'var(--primary, #0f766e)' 
                        }}>
                          {e.sla_horas ? `${e.sla_horas} horas` : '24 horas'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleSaveEdit(e.id)} 
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            💾 Guardar
                          </button>
                          <button 
                            type="button" 
                            onClick={handleCancelEdit} 
                            style={{ background: '#6b7280', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleEditClick(e)} 
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✏️ Editar
                          </button>
                          {!isProspecto && (
                            <button className="btn-delete" onClick={() => handleDelete(e.id)} style={{ padding: '6px 12px', borderRadius: '8px' }}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminEstados;
