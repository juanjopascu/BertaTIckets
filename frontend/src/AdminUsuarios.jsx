import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminUsuarios({ usuario, theme, toggleTheme, embedded = false, initialTab = 'usuarios' }) {
  const navigate = useNavigate();
  const [activoTab, setActivoTab] = useState(initialTab); // 'usuarios' | 'sesiones' | 'logs'

  useEffect(() => {
    if (initialTab) {
      setActivoTab(initialTab);
    }
  }, [initialTab]);

  const [sesiones, setSesiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [equipos, setEquipos] = useState([]);

  // Estados de Logs y Auditoría
  const [systemLogs, setSystemLogs] = useState([]);
  const [logStats, setLogStats] = useState({ total: 0, ecommerce: 0, dashboard: 0, auth: 0, security: 0 });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logOriginFilter, setLogOriginFilter] = useState('todos');
  const [logTypeFilter, setLogTypeFilter] = useState('todos');
  const [logSearchText, setLogSearchText] = useState('');
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  
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

  const fetchSystemLogs = async () => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams();
      if (logOriginFilter && logOriginFilter !== 'todos') params.append('origen', logOriginFilter);
      if (logTypeFilter && logTypeFilter !== 'todos') params.append('tipo', logTypeFilter);
      if (logSearchText.trim()) params.append('search', logSearchText.trim());

      const response = await fetch(`${API_BASE_URL}/api/admin/system-logs?${params.toString()}`);
      const data = await response.json();
      if (data && data.logs) {
        setSystemLogs(data.logs);
        if (data.stats) setLogStats(data.stats);
      }
    } catch (err) {
      console.error("Error obteniendo logs del sistema:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activoTab === 'sesiones') {
      fetchSesiones();
      const interval = setInterval(fetchSesiones, 4000);
      return () => clearInterval(interval);
    } else if (activoTab === 'logs') {
      fetchSystemLogs();
      if (autoRefreshLogs) {
        const interval = setInterval(fetchSystemLogs, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [activoTab, logOriginFilter, logTypeFilter, logSearchText, autoRefreshLogs]);

  const handleClearLogs = async () => {
    if (window.confirm('¿Estás seguro de que deseas purgar todo el historial de logs y auditoría? Esta acción registrará un evento de seguridad irreversible.')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/system-logs`, { method: 'DELETE' });
        fetchSystemLogs();
      } catch (err) {
        console.error("Error purgando logs:", err);
      }
    }
  };

  const exportLogsCSV = () => {
    if (systemLogs.length === 0) {
      alert('No hay logs disponibles para exportar.');
      return;
    }
    const headers = ['ID', 'Fecha y Hora', 'Módulo / Origen', 'Nivel', 'Acción', 'Descripción', 'Usuario', 'Email', 'Rol', 'IP'];
    const rows = systemLogs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.origen || ''}"`,
      `"${l.tipo || ''}"`,
      `"${(l.accion || '').replace(/"/g, '""')}"`,
      `"${(l.descripcion || '').replace(/"/g, '""')}"`,
      `"${(l.usuario?.nombre || '').replace(/"/g, '""')}"`,
      `"${l.usuario?.email || ''}"`,
      `"${l.usuario?.rol || ''}"`,
      `"${l.ip || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_logs_sistema_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                    Gestión de Usuarios <span style={{ color: '#0fa4de' }}>&</span> Permisos
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Administración de roles, accesos por departamento, equipos y estados
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-controls">
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
            </div>
          </div>
        </header>
      )}

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
                        <option value="admin_ecommerce">Admin E-commerce (Gestión de Tienda y Catálogo)</option>
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
          <button 
            type="button"
            onClick={() => setActivoTab('logs')} 
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activoTab === 'logs' ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'transparent',
              color: activoTab === 'logs' ? 'white' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: activoTab === 'logs' ? '0 4px 12px var(--primary-light)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📜 Logs & Auditoría
            {logStats.total > 0 && (
              <span style={{
                background: activoTab === 'logs' ? 'rgba(255,255,255,0.25)' : 'var(--pill-bg)',
                color: activoTab === 'logs' ? '#ffffff' : 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {logStats.total}
              </span>
            )}
          </button>
        </div>

        {activoTab === 'usuarios' ? (
          <section className="board-section">
            <h2>Usuarios del Sistema</h2>
            <div className="crm-table-container">
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
                          background: u.rol === 'admin' ? 'var(--danger-bg)' : u.rol === 'admin_ecommerce' ? (theme === 'dark' ? 'rgba(15, 164, 222, 0.2)' : '#e0f2fe') : u.rol === 'staff' ? 'var(--warning-bg)' : u.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : 'var(--primary-light)', 
                          color: u.rol === 'admin' ? 'var(--danger)' : u.rol === 'admin_ecommerce' ? '#0284c7' : u.rol === 'staff' ? 'var(--warning)' : u.rol === 'manager' ? 'var(--purple-brand)' : 'var(--primary)',
                          fontWeight: u.rol === 'admin_ecommerce' ? 700 : 'normal'
                        }}>
                          {u.rol === 'admin_ecommerce' ? '🛒 Admin E-commerce' : u.rol}
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
          </div>
        </section>
      ) : activoTab === 'sesiones' ? (
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
            <div className="crm-table-container">
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
                            background: s.rol === 'admin' ? 'var(--danger-bg)' : s.rol === 'admin_ecommerce' ? (theme === 'dark' ? 'rgba(15, 164, 222, 0.2)' : '#e0f2fe') : s.rol === 'staff' ? 'var(--warning-bg)' : s.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : 'var(--primary-light)', 
                            color: s.rol === 'admin' ? 'var(--danger)' : s.rol === 'admin_ecommerce' ? '#0284c7' : s.rol === 'staff' ? 'var(--warning)' : s.rol === 'manager' ? 'var(--purple-brand)' : 'var(--primary)',
                            fontWeight: s.rol === 'admin_ecommerce' ? 700 : 'normal'
                          }}>
                            {s.rol === 'admin_ecommerce' ? '🛒 Admin E-commerce' : s.rol}
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
            </div>
          )}
        </section>
        ) : (
          /* ── PESTAÑA 3: LOGS & AUDITORÍA GLOBAL (DASHBOARD & E-COMMERCE) ── */
          <section className="board-section" style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header del apartado de logs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Bitácora de Logs & Auditoría Integral</span>
                  <span style={{ fontSize: '11px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', letterSpacing: '0.04em' }}>
                    TIEMPO REAL
                  </span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Registro unificado y trazabilidad forense de todas las acciones del <strong>Dashboard CRM</strong> y el <strong>E-Commerce B2B</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', cursor: 'pointer', background: 'var(--pill-bg)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-color-subtle)' }}>
                  <input 
                    type="checkbox" 
                    checked={autoRefreshLogs} 
                    onChange={(e) => setAutoRefreshLogs(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Auto-actualizar (5s)</span>
                </label>
                <button
                  type="button"
                  onClick={fetchSystemLogs}
                  disabled={loadingLogs}
                  style={{
                    background: 'var(--pill-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🔄 {loadingLogs ? 'Actualizando...' : 'Refrescar'}
                </button>
                <button
                  type="button"
                  onClick={exportLogsCSV}
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--primary-glow)'
                  }}
                >
                  📥 Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>

            {/* 4 Mini Tarjetas Flotantes KPI de Auditoría */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TOTAL DE LOGS REGISTRADOS
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.total || systemLogs.length}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Historial global consolidado</span>
              </div>

              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🛒 ACTIVIDAD E-COMMERCE
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#0284c7', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.ecommerce || 0}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pedidos, catálogo, marcas y proformas</span>
              </div>

              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎫 CRM & DASHBOARD
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#10b981', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.dashboard || 0}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tickets, estados, SLAs y respuestas</span>
              </div>

              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔒 SEGURIDAD & SESIONES
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#f59e0b', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.security || logStats.auth || 0}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inicios de sesión y cambios de roles</span>
              </div>
            </div>

            {/* Barra de Filtros Interactivos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--pill-bg)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border-color-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* Selector de Origen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Módulo:</span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'ecommerce', label: '🛒 E-Commerce' },
                    { id: 'dashboard', label: '📊 Dashboard' },
                    { id: 'tickets', label: '🎫 Tickets' },
                    { id: 'auth', label: '🔒 Seguridad & Auth' },
                    { id: 'sistema', label: '⚙️ Sistema' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLogOriginFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: logOriginFilter === tab.id ? '700' : '600',
                        background: logOriginFilter === tab.id ? 'var(--primary)' : 'var(--card-bg)',
                        color: logOriginFilter === tab.id ? '#ffffff' : 'var(--text-main)',
                        border: logOriginFilter === tab.id ? '1px solid var(--primary)' : '1px solid var(--border-color-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Selector de Nivel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Nivel:</span>
                  <select
                    value={logTypeFilter}
                    onChange={(e) => setLogTypeFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color-subtle)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="todos">Todos los Niveles</option>
                    <option value="INFO">🔵 INFO</option>
                    <option value="SUCCESS">🟢 SUCCESS</option>
                    <option value="WARNING">🟡 WARNING</option>
                    <option value="SECURITY">🟣 SECURITY</option>
                    <option value="ERROR">🔴 ERROR</option>
                  </select>
                </div>
              </div>

              {/* Búsqueda en Vivo */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por acción, email, descripción, IP o ID..."
                  value={logSearchText}
                  onChange={(e) => setLogSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                {logSearchText && (
                  <button
                    type="button"
                    onClick={() => setLogSearchText('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tabla Flotante de Registros de Logs */}
            {systemLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--pill-bg)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜</div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--text-main)' }}>No se encontraron registros de logs</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Intenta cambiar los filtros de módulo o la búsqueda ingresada.
                </p>
              </div>
            ) : (
              <div className="crm-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th style={{ width: '160px' }}>Fecha & Hora</th>
                      <th style={{ width: '130px' }}>Módulo</th>
                      <th style={{ width: '100px' }}>Nivel</th>
                      <th>Acción & Descripción</th>
                      <th style={{ width: '220px' }}>Usuario & IP</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.map(log => {
                      const fecha = new Date(log.timestamp);
                      const isEcommerce = log.origen === 'ecommerce';
                      const isTickets = log.origen === 'tickets';
                      const isDashboard = log.origen === 'dashboard';
                      const isAuth = log.origen === 'auth' || log.origen === 'usuarios';

                      const tipo = (log.tipo || 'INFO').toUpperCase();

                      return (
                        <tr key={log.id}>
                          {/* Fecha */}
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                              📅 {fecha.toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              ⏰ {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>

                          {/* Módulo / Origen */}
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              background: isEcommerce ? 'rgba(2, 132, 199, 0.12)' : isTickets ? 'rgba(16, 185, 129, 0.12)' : isAuth ? 'rgba(245, 158, 11, 0.12)' : isDashboard ? 'rgba(15, 164, 222, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                              color: isEcommerce ? '#0284c7' : isTickets ? '#10b981' : isAuth ? '#d97706' : isDashboard ? 'var(--primary)' : 'var(--text-muted)',
                              border: `1px solid ${isEcommerce ? 'rgba(2, 132, 199, 0.25)' : isTickets ? 'rgba(16, 185, 129, 0.25)' : isAuth ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 164, 222, 0.25)'}`
                            }}>
                              {isEcommerce && '🛒 Shop'}
                              {isTickets && '🎫 Tickets'}
                              {isDashboard && '📊 Dashboard'}
                              {isAuth && '🔒 Seguridad'}
                              {!isEcommerce && !isTickets && !isDashboard && !isAuth && '⚙️ Sistema'}
                            </span>
                          </td>

                          {/* Nivel */}
                          <td>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              letterSpacing: '0.04em',
                              background: tipo === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : tipo === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : tipo === 'SECURITY' ? 'rgba(168, 85, 247, 0.15)' : tipo === 'ERROR' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 164, 222, 0.15)',
                              color: tipo === 'SUCCESS' ? '#16a34a' : tipo === 'WARNING' ? '#d97706' : tipo === 'SECURITY' ? '#9333ea' : tipo === 'ERROR' ? '#dc2626' : '#0284c7'
                            }}>
                              {tipo}
                            </span>
                          </td>

                          {/* Acción & Descripción */}
                          <td>
                            <div style={{ fontWeight: '750', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                              {log.accion}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                              {log.descripcion}
                            </div>
                          </td>

                          {/* Usuario & IP */}
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              👤 {log.usuario?.nombre || 'Sistema'}
                            </div>
                            {log.usuario?.email && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {log.usuario.email}
                              </div>
                            )}
                            <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace', marginTop: '3px' }}>
                              🌐 IP: {log.ip || '127.0.0.1'}
                            </div>
                          </td>

                          {/* Botón Ver Payload */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedLogDetail(log)}
                              style={{
                                background: 'var(--pill-bg)',
                                color: 'var(--primary)',
                                border: '1px solid var(--border-color-subtle)',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              🔍 Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal de Detalle de Log / Payload JSON */}
            {selectedLogDetail && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(7, 21, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-color)',
                  maxWidth: '680px',
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '28px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📜</span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        Detalle del Evento #{selectedLogDetail.id}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLogDetail(null)}
                      style={{ background: 'var(--pill-bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--pill-bg)', padding: '16px', borderRadius: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Acción</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedLogDetail.accion}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Nivel</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedLogDetail.tipo}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Fecha y Hora</span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{new Date(selectedLogDetail.timestamp).toLocaleString()}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>IP de Origen</span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedLogDetail.ip}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Descripción Forense
                    </span>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', background: 'var(--pill-bg)', padding: '14px', borderRadius: '14px', lineHeight: 1.4 }}>
                      {selectedLogDetail.descripcion}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Payload & Metadatos JSON
                    </span>
                    <pre style={{
                      margin: 0,
                      background: '#071524',
                      color: '#38bdf8',
                      padding: '16px',
                      borderRadius: '14px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxHeight: '220px'
                    }}>
                      {JSON.stringify(selectedLogDetail.detalles || {}, null, 2)}
                    </pre>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLogDetail(null)}
                    style={{
                      alignSelf: 'flex-end',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminUsuarios;
