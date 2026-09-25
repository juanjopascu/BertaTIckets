import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminEquipos({ embedded = false }) {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // State for form and modal
  const [nombre, setNombre] = useState('');
  const [miembros, setMiembros] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    fetchEquipos();
    fetchUsuarios();
  }, []);

  const fetchEquipos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/equipos`);
      const data = await response.json();
      setEquipos(data);
    } catch (err) {
      setError('Error al obtener equipos.');
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`);
      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const staffUsers = usuarios.filter(u => u.rol === 'staff');

  const handleCheckboxChange = (email) => {
    setMiembros(prev => 
      prev.includes(email) 
        ? prev.filter(m => m !== email) 
        : [...prev, email]
    );
  };

  const handleEditClick = (equipo) => {
    setEditingId(equipo.id);
    setNombre(equipo.nombre);
    setMiembros(equipo.miembros || []);
    setError(null);
    setMostrarModal(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setNombre('');
    setMiembros([]);
    setMostrarModal(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/equipos/${editingId}` 
        : `${API_BASE_URL}/api/equipos`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, miembros })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      handleCancel();
      fetchEquipos();
      fetchUsuarios(); // Recargar usuarios para reflejar cambios en equipoId
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este equipo? Los miembros del staff asignados serán desvinculados pero conservarán sus cuentas.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/equipos/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchEquipos();
      fetchUsuarios(); // Recargar usuarios para reflejar la desvinculación
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
                    Gestión de Equipos de Soporte
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Organización de agentes, balanceo de carga y colaboración
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-controls">
                  <button 
                    className="nav-btn" 
                    style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                    onClick={() => {
                      handleCancel();
                      setMostrarModal(true);
                    }}
                  >
                    ➕ Añadir Nuevo Equipo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="crm-main">
        {/* MODAL EMERGENTE DE EQUIPO (POP-UP) */}
        {mostrarModal && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-container" style={{ maxWidth: '650px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? '✏️ Editar Equipo' : '➕ Nuevo Equipo'}</h2>
                <button onClick={handleCancel}>✕</button>
              </div>
              <div style={{ padding: '32px' }}>
                {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Nombre del Equipo *</label>
                    <input 
                      type="text" 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      placeholder="Ej. Soporte Nivel 2, Consultas Especiales" 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', margin: 0 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      Seleccionar Miembros del Staff ({staffUsers.filter(u => miembros.includes(u.email)).length})
                    </label>
                    
                    {staffUsers.length === 0 ? (
                      <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                        No hay usuarios registrados con rol "staff" para asignar.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                        {staffUsers.map(u => (
                          <label 
                            key={u.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              fontSize: '0.9rem', 
                              background: 'white', 
                              padding: '10px 14px', 
                              borderRadius: '12px', 
                              border: '1px solid #e2e8f0', 
                              cursor: 'pointer',
                              flex: '1 1 220px',
                              minWidth: '180px',
                              transition: 'all 0.2s ease',
                              boxShadow: miembros.includes(u.email) ? '0 0 0 2px var(--primary)' : 'none'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={miembros.includes(u.email)} 
                              onChange={() => handleCheckboxChange(u.email)}
                              style={{ cursor: 'pointer', width: 'auto', minWidth: 'auto', margin: 0 }}
                            />
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{u.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={handleCancel} 
                      style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '14px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '14px 28px' }}>
                      {editingId ? 'Guardar Cambios' : 'Crear Equipo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <section className="board-section">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>Equipos Activos</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre del Equipo</th>
                  <th>ID</th>
                  <th>Miembros (Staff)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic', fontSize: '0.84rem' }}>
                      No hay equipos creados. Haz clic en "Añadir Nuevo Equipo" para empezar.
                    </td>
                  </tr>
                ) : (
                  equipos.map(eq => (
                    <tr key={eq.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BrandingVectorIcon name="users" size={13} color="#0fa4de" />
                          <span>{eq.nombre}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(15, 164, 222, 0.08)', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '700' }}>
                          ID: {eq.id}
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px' }}>
                        {(!eq.miembros || eq.miembros.length === 0) ? (
                          <span style={{ fontSize: '0.76rem', color: '#8e8e93', fontStyle: 'italic' }}>Sin miembros asignados</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {eq.miembros.map(m => {
                              const matchingUser = usuarios.find(u => u.email.toLowerCase() === m.toLowerCase());
                              return (
                                <span 
                                  key={m} 
                                  style={{ 
                                    background: '#f1f5f9', 
                                    color: '#334155', 
                                    padding: '2px 8px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.74rem',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={m}
                                >
                                  <BrandingVectorIcon name="user" size={11} color="#64748b" />
                                  <span>{matchingUser ? matchingUser.nombre : m}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleEditClick(eq)}
                            className="dacas-action-pill secondary"
                            title="Editar equipo"
                          >
                            <BrandingVectorIcon name="edit" size={11} color="currentColor" />
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(eq.id)}
                            className="dacas-action-pill danger"
                            title="Eliminar equipo"
                          >
                            <BrandingVectorIcon name="trash" size={11} color="currentColor" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminEquipos;
