import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminUsuarios({ usuario, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [activoTab, setActivoTab] = useState('usuarios'); // 'usuarios' | 'sesiones'
  const [sesiones, setSesiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [equipos, setEquipos] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    rol: 'cliente',
    accesos: { departamentos: [], estados: [] },
    equipoId: '',
    crear_tickets: true,
    activo: true,
    pais: '',
    sector: '',
    horario_atencion: '',
    ciudad: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activoTab === 'sesiones') {
      fetchSesiones();
      const interval = setInterval(fetchSesiones, 4000);
      return () => clearInterval(interval);
    }
  }, [activoTab]);

  const fetchSesiones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sesiones`);
      const data = await response.json();
      setSesiones(data);
    } catch (err) {
      console.error("Error obteniendo sesiones:", err);
    }
  };

  const handleDesconectar = async (sesionId) => {
    if (window.confirm('¿Estás seguro de que deseas desconectar de forma obligatoria a este usuario?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/desconectar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sesionId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al desconectar la sesión.');
        fetchSesiones();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchDepartamentos();
    fetchEstados();
    fetchEquipos();
  }, []);

  const fetchEquipos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/equipos`);
      const data = await response.json();
      setEquipos(data);
    } catch (err) {
      console.error('Error al obtener equipos:', err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`);
      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      setError('Error al obtener usuarios.');
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos`);
      const data = await response.json();
      setDepartamentos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estados`);
      const data = await response.json();
      setEstados(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (tipo, valor) => {
    setFormData(prev => {
      const actual = prev.accesos[tipo];
      const nuevos = actual.includes(valor) 
        ? actual.filter(v => v !== valor) 
        : [...actual, valor];
      return { ...prev, accesos: { ...prev.accesos, [tipo]: nuevos } };
    });
  };

  const handleEditClick = (usuario) => {
    setEditingId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // Contraseña en blanco para que no cambie a menos que se escriba algo
      rol: usuario.rol,
      accesos: usuario.accesos || { departamentos: [], estados: [] },
      equipoId: usuario.equipoId || '',
      crear_tickets: usuario.crear_tickets !== false,
      activo: usuario.activo !== false,
      pais: usuario.pais || '',
      sector: usuario.sector || '',
      horario_atencion: usuario.horario_atencion || '',
      ciudad: usuario.ciudad || ''
    });
    setMostrarModal(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      nombre: '', email: '', password: '', rol: 'cliente', 
      accesos: { departamentos: [], estados: [] },
      equipoId: '',
      crear_tickets: true,
      activo: true,
      pais: '',
      sector: '',
      horario_atencion: '',
      ciudad: ''
    });
    setError(null);
    setMostrarModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Si no es staff, no enviamos accesos ni equipoId
      const payload = { ...formData };
      if (payload.rol !== 'staff') {
        delete payload.accesos;
        delete payload.equipoId;
      } else {
        payload.equipoId = payload.equipoId ? parseInt(payload.equipoId) : null;
      }
      
      // Si estamos editando y la contraseña está vacía, no la enviamos para no sobreescribirla
      if (editingId && !payload.password) {
        delete payload.password;
      }
 
      const url = editingId ? `${API_BASE_URL}/api/usuarios/${editingId}` : `${API_BASE_URL}/api/usuarios`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      handleCancelEdit();
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchUsuarios();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="crm-container">
      <header className="crm-header">
        <div className="header-top">
          <h1>Administración de Usuarios</h1>
          <div className="user-controls">
            <button className="nav-btn" onClick={() => navigate('/')}>🔙 Volver a Berta Ticket</button>
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title="Cambiar Tema"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="nav-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none' }} onClick={() => {
              setEditingId(null);
              setFormData({
                nombre: '', email: '', password: '', rol: 'cliente',
                accesos: { departamentos: [], estados: [] },
                equipoId: '',
                crear_tickets: true,
                activo: true,
                pais: '', sector: '', horario_atencion: '', ciudad: ''
              });
              setMostrarModal(true);
            }}>
              ➕ Añadir Nuevo Usuario
            </button>
          </div>
        </div>
      </header>

      <main className="crm-main">
        {/* MODAL EMERGENTE DE USUARIO (POP-UP) */}
        {mostrarModal && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-container" style={{ maxWidth: '650px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
                <button onClick={handleCancelEdit}>✕</button>
              </div>
              <div style={{ padding: '32px' }}>
                {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
                <form onSubmit={handleSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Row 1: Nombre & Email */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Nombre</label>
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>

                  {/* Row 2: Contraseña & Rol */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Contraseña {editingId && <span style={{fontSize:'0.75rem', color:'#64748b'}}>(Dejar en blanco para mantener)</span>}</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingId} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Rol en el Sistema</label>
                      <select name="rol" value={formData.rol} onChange={handleInputChange} className="status-select" style={{ padding: '14px 18px', width: '100%' }}>
                        <option value="cliente">Cliente (Solo crea tickets)</option>
                        <option value="manager">Manager (Monitorea múltiples clientes)</option>
                        <option value="staff">Staff (Atiende tickets específicos)</option>
                        <option value="admin">Administrador (Acceso total)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: País & Ciudad */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>País</label>
                      <input type="text" name="pais" placeholder="Ej. Argentina" value={formData.pais} onChange={handleInputChange} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Ciudad</label>
                      <input type="text" name="ciudad" placeholder="Ej. Buenos Aires" value={formData.ciudad} onChange={handleInputChange} />
                    </div>
                  </div>

                  {/* Row 4: Sector & Horario de Atención */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Sector / Departamento</label>
                      <input type="text" name="sector" placeholder="Ej. Ventas, Soporte, Finanzas" value={formData.sector} onChange={handleInputChange} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Horario de Atención</label>
                      <input type="text" name="horario_atencion" placeholder="Ej. 09:00 - 18:00" value={formData.horario_atencion} onChange={handleInputChange} />
                    </div>
                  </div>

                  {/* Team Assignment Dropdown if role is Staff */}
                  {formData.rol === 'staff' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Equipo de Soporte</label>
                      <select 
                        name="equipoId" 
                        value={formData.equipoId || ''} 
                        onChange={handleInputChange} 
                        className="status-select" 
                        style={{ padding: '14px 18px', width: '100%' }}
                      >
                        <option value="">Sin equipo asignado</option>
                        {equipos.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ticket Creation Option */}
                  <div className="form-group" style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: '10px', 
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', 
                    padding: '12px 15px', 
                    borderRadius: '12px', 
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', 
                    margin: 0 
                  }}>
                    <input 
                      type="checkbox" 
                      name="crear_tickets" 
                      checked={formData.crear_tickets} 
                      onChange={(e) => setFormData({ ...formData, crear_tickets: e.target.checked })} 
                      style={{ width: 'auto', minWidth: 'auto', padding: 0, cursor: 'pointer' }}
                    />
                    <label style={{ 
                      cursor: 'pointer', 
                      margin: 0, 
                      fontWeight: 600, 
                      fontSize: '0.95rem', 
                      color: theme === 'dark' ? '#e2e8f0' : '#1e293b' 
                    }}>
                      Habilitar creación de tickets para este usuario
                    </label>
                  </div>

                  {/* User Status Option (Enable/Disable) */}
                  {editingId !== 1 && (
                    <div className="form-group" style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: '10px', 
                      background: theme === 'dark' 
                        ? (formData.activo ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)') 
                        : (formData.activo ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'), 
                      padding: '12px 15px', 
                      borderRadius: '12px', 
                      border: theme === 'dark'
                        ? (formData.activo ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)')
                        : (formData.activo ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'), 
                      margin: 0, 
                      transition: 'all 0.2s ease' 
                    }}>
                      <input 
                        type="checkbox" 
                        name="activo" 
                        checked={formData.activo} 
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} 
                        style={{ width: 'auto', minWidth: 'auto', padding: 0, cursor: 'pointer' }}
                      />
                      <label style={{ 
                        cursor: 'pointer', 
                        margin: 0, 
                        fontWeight: 600, 
                        fontSize: '0.95rem', 
                        color: theme === 'dark' ? '#e2e8f0' : (formData.activo ? '#16a34a' : '#dc2626') 
                      }}>
                        Habilitar usuario (Permitir acceso y login)
                      </label>
                    </div>
                  )}

                  {/* Staff Accesses */}
                  {formData.rol === 'staff' && (
                    <div style={{ 
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc', 
                      padding: '18px', 
                      borderRadius: '16px', 
                      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1rem', 
                        color: theme === 'dark' ? '#f1f5f9' : '#1e293b', 
                        fontWeight: 700 
                      }}>
                        Accesos Asignados (Staff)
                      </h3>
                      
                      <div>
                        <label style={{ 
                          fontWeight: 'bold', 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: '0.8rem', 
                          textTransform: 'uppercase', 
                          color: theme === 'dark' ? '#94a3b8' : '#64748b' 
                        }}>
                          Departamentos Permitidos
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {departamentos.map(d => (
                            <label key={d.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.9rem', 
                              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white', 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e2e8f0', 
                              color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                              cursor: 'pointer' 
                            }}>
                              <input 
                                type="checkbox" 
                                checked={formData.accesos.departamentos.includes(d.id)} 
                                onChange={() => handleCheckboxChange('departamentos', d.id)}
                                style={{ cursor: 'pointer' }}
                              />
                              {d.nombre}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ 
                          fontWeight: 'bold', 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontSize: '0.8rem', 
                          textTransform: 'uppercase', 
                          color: theme === 'dark' ? '#94a3b8' : '#64748b' 
                        }}>
                          Estados Permitidos
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {estados.map(e => (
                            <label key={e.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.9rem', 
                              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white', 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e2e8f0', 
                              color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                              cursor: 'pointer' 
                            }}>
                              <input 
                                type="checkbox" 
                                checked={formData.accesos.estados.includes(e.nombre)} 
                                onChange={() => handleCheckboxChange('estados', e.nombre)}
                                style={{ cursor: 'pointer' }}
                              />
                              {e.nombre}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={handleCancelEdit} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '14px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '14px 28px' }}>
                      {editingId ? 'Actualizar Usuario' : 'Añadir Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Pestañas Premium */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px', 
          background: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(10px)',
          padding: '6px', 
          borderRadius: '16px', 
          border: '1px solid rgba(226, 232, 240, 0.8)',
          width: 'fit-content'
        }}>
          <button 
            type="button"
            onClick={() => setActivoTab('usuarios')} 
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activoTab === 'usuarios' ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'transparent',
              color: activoTab === 'usuarios' ? 'white' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: activoTab === 'usuarios' ? '0 4px 12px var(--primary-light)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            👥 Usuarios Registrados
          </button>
          <button 
            type="button"
            onClick={() => setActivoTab('sesiones')} 
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activoTab === 'sesiones' ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'transparent',
              color: activoTab === 'sesiones' ? 'white' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: activoTab === 'sesiones' ? '0 4px 12px var(--primary-light)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔒 Sesiones Activas
          </button>
        </div>

        {activoTab === 'usuarios' ? (
          <section className="board-section">
            <h2>Usuarios del Sistema</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre / Email</th>
                  <th>Ubicación</th>
                  <th>Sector / Horario</th>
                  <th>Rol</th>
                  <th>Accesos (Staff)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{u.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      {u.pais || u.ciudad ? (
                        <div style={{ fontSize: '0.9rem' }}>
                          {u.ciudad && <span>{u.ciudad}</span>}
                          {u.ciudad && u.pais && <span>, </span>}
                          {u.pais && <span style={{ fontWeight: 500 }}>{u.pais}</span>}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Sin especificar</span>
                      )}
                    </td>
                    <td>
                      {u.sector || u.horario_atencion ? (
                        <div style={{ fontSize: '0.9rem' }}>
                          {u.sector && <div style={{ fontWeight: 600 }}>📁 {u.sector}</div>}
                          {u.horario_atencion && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>🕒 {u.horario_atencion}</div>}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                        <span style={{ 
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', 
                          background: u.rol === 'admin' ? 'var(--danger-bg)' : u.rol === 'staff' ? 'var(--warning-bg)' : u.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : 'var(--primary-light)', 
                          color: u.rol === 'admin' ? 'var(--danger)' : u.rol === 'staff' ? 'var(--warning)' : u.rol === 'manager' ? 'var(--purple-brand)' : 'var(--primary)' 
                        }}>
                          {u.rol}
                        </span>
                        {u.rol === 'staff' && (
                          <span style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem',
                            background: u.equipoId ? 'var(--primary-light)' : '#f1f5f9',
                            color: u.equipoId ? 'var(--primary)' : '#64748b',
                            fontWeight: 600
                          }}>
                            👥 {u.equipoId ? (equipos.find(eq => eq.id === u.equipoId)?.nombre || `Equipo #${u.equipoId}`) : 'Sin Equipo'}
                          </span>
                        )}
                        <span style={{
                          padding: '2px 6px', borderRadius: '8px', fontSize: '0.75rem',
                          background: u.crear_tickets !== false ? '#dcfce7' : '#f1f5f9',
                          color: u.crear_tickets !== false ? '#15803d' : '#64748b',
                          fontWeight: 600
                        }}>
                          {u.crear_tickets !== false ? '✍️ Crea Tickets' : '🚫 No Crea Tickets'}
                        </span>
                        <span style={{
                          padding: '2px 6px', borderRadius: '8px', fontSize: '0.75rem',
                          background: u.activo !== false ? '#dcfce7' : '#fee2e2',
                          color: u.activo !== false ? '#15803d' : '#991b1b',
                          fontWeight: 600
                        }}>
                          {u.activo !== false ? '🟢 Habilitado' : '🔴 Deshabilitado'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {u.rol === 'staff' && u.accesos ? (
                        <div>
                          <strong>Deptos:</strong> {u.accesos.departamentos?.length || 0} asignados<br/>
                          <strong>Estados:</strong> {u.accesos.estados?.length || 0} asignados
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {u.id !== 1 && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleEditClick(u)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="board-section" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <style>{`
              @keyframes pulse {
                0% {
                  transform: scale(0.95);
                  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                }
                70% {
                  transform: scale(1);
                  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
                }
                100% {
                  transform: scale(0.95);
                  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                }
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Control de Sesiones Activas</h2>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🟢 {sesiones.length} {sesiones.length === 1 ? 'Sesión activa' : 'Sesiones activas'}
              </span>
            </div>
            
            {sesiones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔒</div>
                <p style={{ color: '#64748b', fontWeight: '500' }}>No hay otras sesiones activas registradas en este momento.</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario / Email</th>
                    <th>Dirección IP</th>
                    <th>Rol</th>
                    <th>Hora de Conexión</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiones.map(s => {
                    const esMiSesion = s.id === usuario?.sesionId;
                    const loginDate = new Date(s.loginAt);
                    
                    return (
                      <tr key={s.id} style={{ background: esMiSesion ? 'rgba(15, 118, 110, 0.04)' : 'transparent' }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email}</div>
                        </td>
                        <td>
                          <span className="ip-badge" style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            border: '1px solid #e2e8f0'
                          }}>
                            🌐 {s.ip}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', 
                            background: s.rol === 'admin' ? 'var(--danger-bg)' : s.rol === 'staff' ? 'var(--warning-bg)' : s.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : 'var(--primary-light)', 
                            color: s.rol === 'admin' ? 'var(--danger)' : s.rol === 'staff' ? 'var(--warning)' : s.rol === 'manager' ? 'var(--purple-brand)' : 'var(--primary)' 
                          }}>
                            {s.rol}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                            📅 {loginDate.toLocaleDateString()} a las {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-pulse-dot" style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#22c55e',
                              display: 'inline-block',
                              boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)',
                              animation: 'pulse 1.8s infinite'
                            }} />
                            <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '600' }}>Conectado</span>
                          </div>
                        </td>
                        <td>
                          {esMiSesion ? (
                            <span style={{ 
                              fontSize: '0.8rem', 
                              color: 'var(--primary)', 
                              fontWeight: 'bold',
                              background: 'var(--primary-light)',
                              padding: '4px 10px',
                              borderRadius: '8px'
                            }}>
                              Tu Sesión
                            </span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => handleDesconectar(s.id)}
                              className="btn-delete"
                              style={{ 
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                color: 'white', 
                                border: 'none', 
                                padding: '6px 12px', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.25)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.15)';
                              }}
                            >
                              Desconectar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminUsuarios;
