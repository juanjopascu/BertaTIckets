import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminOrganizaciones() {
  const navigate = useNavigate();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Form and Modal State
  const [nombre, setNombre] = useState('');
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoId, setDepartamentoId] = useState('');

  useEffect(() => {
    fetchOrganizaciones();
    fetchUsuarios();
    fetchDepartamentos();
  }, []);

  const fetchOrganizaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizaciones`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrganizaciones(data);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener organizaciones.');
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsuarios(data);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener usuarios para vinculación.');
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setDepartamentos(data);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener departamentos.');
    }
  };

  const getDepartamentoNombre = (deptId) => {
    if (!deptId) return 'Sin asignar (Operaciones)';
    const dept = departamentos.find(d => d.id === parseInt(deptId));
    return dept ? dept.nombre : 'Sin asignar (Operaciones)';
  };

  // Managers are users with role 'manager' (or admins)
  const availableManagers = usuarios.filter(u => u.rol === 'manager' || u.rol === 'admin');
  
  // Clientes are users with role 'cliente'
  const availableClientes = usuarios.filter(u => u.rol === 'cliente');

  const handleToggleManager = (email) => {
    if (selectedManagers.includes(email)) {
      setSelectedManagers(selectedManagers.filter(m => m !== email));
    } else {
      setSelectedManagers([...selectedManagers, email]);
    }
  };

  const handleToggleCliente = (email) => {
    if (selectedClientes.includes(email)) {
      setSelectedClientes(selectedClientes.filter(c => c !== email));
    } else {
      setSelectedClientes([...selectedClientes, email]);
    }
  };

  const handleEdit = (org) => {
    setEditingId(org.id);
    setNombre(org.nombre);
    setSelectedManagers(org.managers || []);
    setSelectedClientes(org.clientes || []);
    setDepartamentoId(org.departamentoId || '');
    setError(null);
    setSuccess(null);
    setMostrarModal(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setNombre('');
    setSelectedManagers([]);
    setSelectedClientes([]);
    setDepartamentoId('');
    setError(null);
    setSuccess(null);
    setMostrarModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre.trim()) {
      setError('El nombre de la organización es obligatorio.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      managers: selectedManagers,
      clientes: selectedClientes,
      departamentoId: departamentoId ? parseInt(departamentoId) : null
    };

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/organizaciones/${editingId}`
        : `${API_BASE_URL}/api/organizaciones`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar la organización.');

      setSuccess(editingId ? 'Organización actualizada con éxito.' : 'Organización creada con éxito.');
      handleResetForm();
      fetchOrganizaciones();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta organización? Esto desvinculará a los managers y clientes asociados, pero no los eliminará del sistema.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/organizaciones/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess('Organización eliminada con éxito.');
      fetchOrganizaciones();
      if (editingId === id) handleResetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const getUserName = (email) => {
    const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? user.nombre : email;
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
                  Gestión de Organizaciones
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Agrupación de clientes corporativos y asignación de Managers
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
                <button 
                  className="nav-btn" 
                  style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                  onClick={() => {
                    handleResetForm();
                    setMostrarModal(true);
                  }}
                >
                  ➕ Añadir Nueva Organización
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="crm-main">
        {success && (
          <div style={{ background: '#dcfce3', color: '#166534', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
            {success}
          </div>
        )}

        {/* MODAL EMERGENTE DE ORGANIZACIÓN (POP-UP) */}
        {mostrarModal && (
          <div className="modal-overlay" onClick={handleResetForm}>
            <div className="modal-container" style={{ maxWidth: '650px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? '✏️ Editar Organización' : '➕ Nueva Organización'}</h2>
                <button onClick={handleResetForm}>✕</button>
              </div>
              <div style={{ padding: '32px' }}>
                {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Nombre de la Organización *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Grupo Tech, Dacas Argentina..." 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Departamento de Destino por Defecto</label>
                    <select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: 'white',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">-- Sin departamento por defecto (Usa fallback) --</option>
                      {departamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* SELECCIÓN DE MANAGERS */}
                  <div className="form-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', margin: 0 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      Asignar Managers (Rol Manager / Admin) ({selectedManagers.length})
                    </label>
                    {availableManagers.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#86868b', fontStyle: 'italic', margin: 0 }}>
                        No hay usuarios creados con el rol "manager" todavía.
                      </p>
                    ) : (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.08)', padding: '10px', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {availableManagers.map(mgr => (
                          <label key={mgr.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedManagers.includes(mgr.email)}
                              onChange={() => handleToggleManager(mgr.email)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            <span><strong>{mgr.nombre}</strong> <span style={{ color: '#86868b' }}>({mgr.email})</span></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SELECCIÓN DE CLIENTES */}
                  <div className="form-group" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', margin: 0 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#1e293b' }}>
                      Clientes Asociados ({selectedClientes.length})
                    </label>
                    {availableClientes.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#86868b', fontStyle: 'italic', margin: 0 }}>
                        No hay usuarios creados con el rol "cliente" en el sistema.
                      </p>
                    ) : (
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.08)', padding: '10px', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {availableClientes.map(cli => (
                          <label key={cli.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedClientes.includes(cli.email)}
                              onChange={() => handleToggleCliente(cli.email)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            <span><strong>{cli.nombre}</strong> <span style={{ color: '#86868b' }}>({cli.email})</span></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={handleResetForm} 
                      style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '14px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      style={{ width: 'auto', padding: '14px 28px' }}
                    >
                      {editingId ? 'Guardar Cambios' : 'Crear Organización'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE ORGANIZACIONES */}
        <section className="board-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Organizaciones Activas ({organizaciones.length})</h2>
            <input 
              type="text" 
              placeholder="🔍 Buscar organización..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', width: '220px', outline: 'none' }}
            />
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre de la Organización</th>
                  <th>ID</th>
                  <th>Managers Asignados</th>
                  <th>Clientes Vinculados</th>
                  <th>Departamento de Destino</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {organizaciones.filter(o => o.nombre.toLowerCase().includes(filterText.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
                      No se encontraron organizaciones.
                    </td>
                  </tr>
                ) : (
                  organizaciones
                    .filter(o => o.nombre.toLowerCase().includes(filterText.toLowerCase()))
                    .map(org => (
                      <tr key={org.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>🏢 {org.nombre}</div>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(67, 97, 238, 0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                            ID: {org.id}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          {org.managers && org.managers.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {org.managers.map(email => (
                                <span 
                                  key={email} 
                                  style={{ background: 'var(--primary-light)', color: 'var(--purple-brand)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}
                                  title={email}
                                >
                                  💼 {getUserName(email)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#86868b', fontStyle: 'italic' }}>Sin managers</span>
                          )}
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          {org.clientes && org.clientes.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {org.clientes.map(email => (
                                <span 
                                  key={email} 
                                  style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}
                                  title={email}
                                >
                                  👤 {getUserName(email)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#86868b', fontStyle: 'italic' }}>Sin clientes</span>
                          )}
                        </td>
                        <td>
                          <span style={{ background: org.departamentoId ? '#f0fdf4' : '#f8fafc', color: org.departamentoId ? '#15803d' : '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: org.departamentoId ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}>
                            🏢 {getDepartamentoNombre(org.departamentoId)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              onClick={() => handleEdit(org)}
                              style={{ 
                                background: '#3b82f6', 
                                color: 'white', 
                                border: 'none', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                              }}
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDelete(org.id)}
                              className="btn-delete"
                              style={{ padding: '4px 8px', borderRadius: '4px' }}
                            >
                              Eliminar
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

export default AdminOrganizaciones;
