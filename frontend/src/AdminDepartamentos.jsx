import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

function AdminDepartamentos({ embedded = false }) {
  const navigate = useNavigate();
  const [departamentos, setDepartamentos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [slaHoras, setSlaHoras] = useState(24);
  const [error, setError] = useState(null);

  // Estados de edición inline
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editSlaHoras, setEditSlaHoras] = useState(24);

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos`);
      const data = await response.json();
      setDepartamentos(data);
    } catch (err) {
      setError('Error al obtener departamentos.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, sla_horas: parseInt(slaHoras) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setNombre('');
      setSlaHoras(24);
      fetchDepartamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (d) => {
    setEditingId(d.id);
    setEditNombre(d.nombre);
    setEditSlaHoras(d.sla_horas || 24);
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
      const response = await fetch(`${API_BASE_URL}/api/departamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre, sla_horas: parseInt(editSlaHoras) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setEditingId(null);
      fetchDepartamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchDepartamentos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={embedded ? "crm-embedded-view" : "crm-container"} style={embedded ? { width: '100%', maxWidth: '100%', margin: 0, padding: 0 } : {}}>
      {!embedded && (
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
                    Administración de Departamentos
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Estructuración de áreas operativas y niveles de soporte
                  </div>
                </div>
              </div>


            </div>
          </div>
        </header>
      )}

      <main className="crm-main">
        <section className="form-section">
          <h2>Nuevo Departamento</h2>
          {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg, #fef2f2)', color: 'var(--danger, #ef4444)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
          <form onSubmit={handleSubmit} className="crm-form">
            <div className="form-group">
              <label>Nombre del Departamento</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Límite SLA (Horas)</label>
              <input type="number" min="1" value={slaHoras} onChange={(e) => setSlaHoras(e.target.value)} required />
            </div>
            <button type="submit" className="btn-submit">Crear Departamento</button>
          </form>
        </section>

        <section className="board-section">
          <h2>Lista de Departamentos</h2>
          <div className="crm-table-container">
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
                {departamentos.map(d => {
                  const isEditing = d.id === editingId;
                  return (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            required
                            disabled={d.id === 1} // General is protected
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
                          <strong>{d.nombre}</strong>
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
                            {d.sla_horas ? `${d.sla_horas} horas` : '24 horas'}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(d.id)}
                              style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <BrandingVectorIcon name="save" size={13} color="#ffffff" /> Guardar
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              style={{ background: '#6b7280', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <BrandingVectorIcon name="x" size={13} color="#ffffff" /> Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleEditClick(d)}
                              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <BrandingVectorIcon name="edit" size={13} color="#1d4ed8" /> Editar
                            </button>
                            {d.id !== 1 && (
                              <button className="btn-delete" onClick={() => handleDelete(d.id)} style={{ padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <BrandingVectorIcon name="trash" size={13} color="currentColor" /> Eliminar
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
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDepartamentos;
