import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminDepartamentos() {
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
    <div className="crm-container">
      <header className="crm-header">
        <div className="header-top">
          <h1>Administración de Departamentos</h1>
          <div className="user-controls">
            <button className="nav-btn" onClick={() => navigate('/')}>🔙 Volver a Berta Ticket</button>
          </div>
        </div>
        <p>Los prospectos en departamentos borrados serán movidos automáticamente al departamento "General".</p>
      </header>

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
                            onClick={() => handleEditClick(d)}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✏️ Editar
                          </button>
                          {d.id !== 1 && (
                            <button className="btn-delete" onClick={() => handleDelete(d.id)} style={{ padding: '6px 12px', borderRadius: '8px' }}>
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

export default AdminDepartamentos;
