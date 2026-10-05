import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

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
  const [logModalTab, setLogModalTab] = useState('visual'); // 'visual' | 'json'
  const [copiedLogJson, setCopiedLogJson] = useState(false);

  const handleCopyLogJson = (data) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data || {}, null, 2));
      setCopiedLogJson(true);
      setTimeout(() => setCopiedLogJson(false), 2000);
    } catch (e) {
      console.error('Error al copiar JSON:', e);
    }
  };

  const formatFieldLabel = (key) => {
    const labels = {
      productId: 'ID de Producto',
      productName: 'Producto',
      sku: 'Código SKU',
      brand: 'Marca / Fabricante',
      price: 'Precio de Lista',
      category: 'Categoría',
      timestamp: 'Fecha del Evento',
      orderId: 'N° de Pedido',
      total: 'Total Retenido',
      subtotal: 'Subtotal',
      metodoPago: 'Método de Pago',
      usuarioId: 'ID Usuario',
      email: 'Email',
      nombre: 'Nombre',
      rol: 'Rol',
      origen: 'Origen',
      estado: 'Estado',
      accion: 'Acción'
    };
    if (labels[key]) return labels[key];
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  };

  const getLogUser = (log) => {
    if (!log) return { nombre: 'Visitante B2B', email: '', rol: '' };
    const u = log.usuario;
    if (typeof u === 'object' && u !== null) {
      return {
        nombre: u.nombre || u.name || u.razon_social || u.email || 'Usuario B2B',
        email: u.email || '',
        rol: u.rol || u.role || ''
      };
    }
    if (typeof u === 'string' && u.trim().length > 0) {
      return {
        nombre: u,
        email: u.includes('@') ? u : '',
        rol: ''
      };
    }
    if (log.detalles?.user) {
      return {
        nombre: log.detalles.user.nombre || log.detalles.user.name || 'Usuario B2B',
        email: log.detalles.user.email || '',
        rol: log.detalles.user.rol || log.detalles.user.role || ''
      };
    }
    return {
      nombre: 'Visitante B2B',
      email: '',
      rol: 'Invitado'
    };
  };

  const [editingId, setEditingId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    password: '', 
    rol: 'vendedor',
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
      nombre: '', email: '', password: '', rol: 'vendedor', 
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
                    className="nav-btn"
                    onClick={() => { window.location.href = '/'; }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Ir a Home / Panel Principal"
                  >
                    <BrandingVectorIcon name="home" size={15} color="currentColor" />
                    <span>Home</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={toggleTheme} 
                    className="theme-toggle-btn"
                    title="Cambiar Tema"
                  >
                    <BrandingVectorIcon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
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
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandingVectorIcon name={editingId ? "edit" : "plus"} size={20} color="var(--primary)" />
                  {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandingVectorIcon name="x" size={18} color="var(--text-muted)" />
                </button>
              </div>
              <div style={{ padding: '28px 32px' }}>
                {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
                <form onSubmit={handleSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Grid de 2 columnas 100% simétricas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px 20px' }}>
                    
                    {/* Campo 1: Nombre */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Nombre
                      </label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Nombre completo"
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 2: Email */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Email
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="ejemplo@dacas.com"
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 3: Contraseña */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        <span>Contraseña</span>
                        {editingId && <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '500', textTransform: 'none' }}>(Dejar vacío p/ mantener)</span>}
                      </label>
                      <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required={!editingId} 
                        placeholder={editingId ? "••••••••" : "Contraseña de acceso"}
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 4: Rol */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Rol en el Sistema
                      </label>
                      <select 
                        name="rol" 
                        value={formData.rol} 
                        onChange={handleInputChange} 
                        className="status-select" 
                        style={{ height: '46px', padding: '0 14px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      >
                        <option value="vendedor">Vendedor (Gestión y emisión de tickets)</option>
                        <option value="pm">PM (Product Manager)</option>
                        <option value="manager">Manager (Monitorea múltiples clientes)</option>
                        <option value="staff">Staff (Atiende tickets específicos)</option>
                        <option value="admin_ecommerce">Admin E-commerce (Gestión de Tienda y Catálogo)</option>
                        <option value="admin_erp">ERP Admin (Gestión de ERP, End Users y Conciliación)</option>
                        <option value="admin">Administrador (Acceso total)</option>
                      </select>
                    </div>

                    {/* Campo 5: País */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        País
                      </label>
                      <input 
                        type="text" 
                        name="pais" 
                        placeholder="Ej. Argentina" 
                        value={formData.pais} 
                        onChange={handleInputChange} 
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 6: Ciudad */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Ciudad
                      </label>
                      <input 
                        type="text" 
                        name="ciudad" 
                        placeholder="Ej. Buenos Aires" 
                        value={formData.ciudad} 
                        onChange={handleInputChange} 
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 7: Sector / Departamento */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Sector / Departamento
                      </label>
                      <input 
                        type="text" 
                        name="sector" 
                        placeholder="Ej. Ventas, Soporte, Finanzas" 
                        value={formData.sector} 
                        onChange={handleInputChange} 
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>

                    {/* Campo 8: Horario de Atención */}
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Horario de Atención
                      </label>
                      <input 
                        type="text" 
                        name="horario_atencion" 
                        placeholder="Ej. 09:00 - 18:00" 
                        value={formData.horario_atencion} 
                        onChange={handleInputChange} 
                        style={{ height: '46px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  {/* Team Assignment Dropdown if role is Staff */}
                  {formData.rol === 'staff' && (
                    <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: '8px' }}>
                        Equipo de Soporte
                      </label>
                      <select 
                        name="equipoId" 
                        value={formData.equipoId || ''} 
                        onChange={handleInputChange} 
                        className="status-select" 
                        style={{ height: '46px', padding: '0 14px', boxSizing: 'border-box', width: '100%', borderRadius: '10px' }}
                      >
                        <option value="">Sin equipo asignado</option>
                        {equipos.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ticket Creation Option */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', 
                    padding: '12px 18px', 
                    borderRadius: '12px', 
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', 
                    margin: 0,
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}>
                    <input 
                      type="checkbox" 
                      name="crear_tickets" 
                      checked={formData.crear_tickets} 
                      onChange={(e) => setFormData({ ...formData, crear_tickets: e.target.checked })} 
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        minWidth: '18px', 
                        maxWidth: '18px', 
                        flex: '0 0 18px', 
                        margin: 0, 
                        padding: 0, 
                        cursor: 'pointer', 
                        accentColor: 'var(--primary)' 
                      }}
                    />
                    <span style={{ 
                      margin: 0, 
                      fontWeight: 600, 
                      fontSize: '0.88rem', 
                      color: theme === 'dark' ? '#e2e8f0' : '#1e293b' 
                    }}>
                      Habilitar creación de tickets para este usuario
                    </span>
                  </label>

                  {/* User Status Option (Enable/Disable) */}
                  {editingId !== 1 && (
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: theme === 'dark' 
                        ? (formData.activo ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)') 
                        : (formData.activo ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'), 
                      padding: '12px 18px', 
                      borderRadius: '12px', 
                      border: theme === 'dark'
                        ? (formData.activo ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)')
                        : (formData.activo ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'), 
                      margin: 0, 
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease' 
                    }}>
                      <input 
                        type="checkbox" 
                        name="activo" 
                        checked={formData.activo} 
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} 
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          minWidth: '18px', 
                          maxWidth: '18px', 
                          flex: '0 0 18px', 
                          margin: 0, 
                          padding: 0, 
                          cursor: 'pointer', 
                          accentColor: '#22c55e' 
                        }}
                      />
                      <span style={{ 
                        margin: 0, 
                        fontWeight: 600, 
                        fontSize: '0.88rem', 
                        color: formData.activo ? '#16a34a' : '#dc2626' 
                      }}>
                        {formData.activo ? 'Habilitar usuario (Permitir acceso y login)' : 'Usuario deshabilitado (Acceso revocado)'}
                      </span>
                    </label>
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
                                style={{ width: 'auto', minWidth: 'auto', flex: '0 0 auto', cursor: 'pointer' }}
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
                                style={{ width: 'auto', minWidth: 'auto', flex: '0 0 auto', cursor: 'pointer' }}
                              />
                              {e.nombre}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer buttons 100% simétricos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      style={{ 
                        background: '#e2e8f0', 
                        color: '#475569', 
                        border: 'none', 
                        padding: '13px 20px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        fontWeight: '700', 
                        fontSize: '0.92rem',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      style={{ 
                        width: '100%', 
                        padding: '13px 20px', 
                        borderRadius: '12px', 
                        fontWeight: '700', 
                        fontSize: '0.92rem',
                        boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {editingId ? 'Actualizar Usuario' : 'Añadir Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Barra Superior Simétrica: Selector de Pestañas + Botón Nuevo Usuario */}
        {activoTab !== 'logs' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px', 
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
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
                <BrandingVectorIcon name="users" size={16} />
                Usuarios Registrados
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
                <BrandingVectorIcon name="lock" size={16} />
                Sesiones Activas
              </button>
            </div>

            {/* Botón de Creación de Usuario Simétrico y Prominente */}
            <button
              type="button"
              className="btn-submit"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nombre: '', email: '', password: '', rol: 'vendedor',
                  accesos: { departamentos: [], estados: [] },
                  equipoId: '',
                  crear_tickets: true,
                  activo: true,
                  pais: '', sector: '', horario_atencion: '', ciudad: ''
                });
                setMostrarModal(true);
              }}
              style={{
                width: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px rgba(15, 164, 222, 0.3)',
                cursor: 'pointer'
              }}
            >
              <BrandingVectorIcon name="plus" size={16} color="#ffffff" />
              Nuevo Usuario
            </button>
          </div>
        )}

        {activoTab === 'usuarios' ? (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>Usuarios del Sistema</h2>
                <span style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: '800' 
                }}>
                  {usuarios.length} registrados
                </span>
              </div>
            </div>
            <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', background: '#ffffff' }}>
              <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '180px' }}>Nombre & Email</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '170px' }}>Ubicación & Sector</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '160px' }}>Rol & Equipo</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '150px' }}>Estado & Permisos</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', textAlign: 'center', width: '110px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => {
                  const locationText = u.ciudad || u.pais ? `${u.ciudad ? u.ciudad : ''}${u.ciudad && u.pais ? ', ' : ''}${u.pais ? u.pais : ''}` : 'Sin ubicación';
                  const sectorText = u.sector || 'General';
                  const equipoNombre = u.equipoId ? (equipos.find(eq => eq.id === u.equipoId)?.nombre || `Equipo #${u.equipoId}`) : 'Sin Equipo Asignado';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color-subtle, #f1f5f9)', transition: 'background 0.15s ease' }}>
                      {/* 1. Nombre & Email (2 lines) */}
                      <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '220px' }}>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-main, #0f172a)', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '5px' }} title={u.nombre}>
                          <BrandingVectorIcon name="user" size={13} color="var(--primary)" />
                          <span>{u.nombre}</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#0fa4de', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }} title={u.email}>
                          <BrandingVectorIcon name="mail" size={11} color="#0fa4de" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* 2. Ubicación & Sector (2 lines) */}
                      <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '220px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-main, #334155)', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }} title={locationText}>
                          <BrandingVectorIcon name="map-pin" size={12} color="#ef4444" />
                          <span>{locationText}</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }} title={`${sectorText}${u.horario_atencion ? ` • ${u.horario_atencion}` : ''}`}>
                          <BrandingVectorIcon name="folder" size={11} color="#64748b" />
                          <span>{sectorText}</span>
                          {u.horario_atencion && (
                            <>
                              <span>•</span>
                              <BrandingVectorIcon name="clock" size={10} color="#94a3b8" />
                              <span>{u.horario_atencion}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 3. Rol & Equipo (2 lines) */}
                      <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '200px' }}>
                        <div style={{ lineHeight: '1.25' }}>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', 
                            background: u.rol === 'admin' ? 'var(--danger-bg)' : u.rol === 'admin_ecommerce' ? (theme === 'dark' ? 'rgba(15, 164, 222, 0.2)' : '#e0f2fe') : u.rol === 'admin_erp' ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') : u.rol === 'staff' ? 'var(--warning-bg)' : u.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : u.rol === 'pm' ? (theme === 'dark' ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7') : 'var(--primary-light)', 
                            color: u.rol === 'admin' ? 'var(--danger)' : u.rol === 'admin_ecommerce' ? '#0284c7' : u.rol === 'admin_erp' ? '#166534' : u.rol === 'staff' ? 'var(--warning)' : u.rol === 'manager' ? 'var(--purple-brand)' : u.rol === 'pm' ? '#d97706' : 'var(--primary)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {u.rol === 'admin_ecommerce' ? (
                              <><BrandingVectorIcon name="shopping-bag" size={12} /> Admin E-commerce</>
                            ) : u.rol === 'admin_erp' ? (
                              <><BrandingVectorIcon name="database" size={12} color="#166534" /> ERP Admin</>
                            ) : u.rol === 'admin' ? (
                              <><BrandingVectorIcon name="shield" size={12} /> Administrador</>
                            ) : u.rol === 'staff' ? (
                              <><BrandingVectorIcon name="briefcase" size={12} /> Staff</>
                            ) : u.rol === 'manager' ? (
                              <><BrandingVectorIcon name="users" size={12} /> Manager</>
                            ) : u.rol === 'pm' ? (
                              <><BrandingVectorIcon name="layers" size={12} /> PM</>
                            ) : (
                              <><BrandingVectorIcon name="user" size={12} /> Vendedor</>
                            )}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.25', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }} title={u.rol === 'staff' ? `Equipo: ${equipoNombre}` : (u.crear_tickets !== false ? 'Habilitado para emitir tickets' : 'Solo consulta')}>
                          {u.rol === 'staff' ? (
                            <><BrandingVectorIcon name="users" size={11} color="#64748b" /> <span>{equipoNombre}</span></>
                          ) : (u.crear_tickets !== false ? (
                            <><BrandingVectorIcon name="edit" size={11} color="#10b981" /> <span>Crea Tickets</span></>
                          ) : (
                            <><BrandingVectorIcon name="lock" size={11} color="#ef4444" /> <span>Solo Consulta</span></>
                          ))}
                        </div>
                      </td>

                      {/* 4. Estado & Permisos (2 lines) */}
                      <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '180px' }}>
                        <div style={{ lineHeight: '1.25' }}>
                          <span style={{
                            padding: '2px 7px', borderRadius: '8px', fontSize: '10.5px',
                            background: u.activo !== false ? '#dcfce7' : '#fee2e2',
                            color: u.activo !== false ? '#15803d' : '#991b1b',
                            fontWeight: 750,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.activo !== false ? '#22c55e' : '#ef4444' }}></span>
                            {u.activo !== false ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.25', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.rol === 'staff' && u.accesos ? (
                            `Deptos: ${u.accesos.departamentos?.length || 0} • Estados: ${u.accesos.estados?.length || 0}`
                          ) : (
                            'Acceso Portal Matriz'
                          )}
                        </div>
                      </td>

                      {/* 5. Acciones (2 lines vertical align) */}
                      <td style={{ padding: '6px 12px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {u.id !== 1 ? (
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleEditClick(u)}
                              style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '4px 9px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BrandingVectorIcon name="edit" size={11} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(u.id)}
                              className="btn-delete"
                              style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BrandingVectorIcon name="trash" size={11} /> Eliminar
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Principal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              {sesiones.length} {sesiones.length === 1 ? 'Sesión activa' : 'Sesiones activas'}
            </span>
          </div>
          
          {sesiones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ marginBottom: '10px' }}><BrandingVectorIcon name="lock" size={38} color="#94a3b8" /></div>
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
                            <BrandingVectorIcon name="globe" size={12} color="#64748b" /> {s.ip}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', 
                            background: s.rol === 'admin' ? 'var(--danger-bg)' : s.rol === 'admin_ecommerce' ? (theme === 'dark' ? 'rgba(15, 164, 222, 0.2)' : '#e0f2fe') : s.rol === 'admin_erp' ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') : s.rol === 'staff' ? 'var(--warning-bg)' : s.rol === 'manager' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : '#f3e8ff') : s.rol === 'pm' ? (theme === 'dark' ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7') : 'var(--primary-light)', 
                            color: s.rol === 'admin' ? 'var(--danger)' : s.rol === 'admin_ecommerce' ? '#0284c7' : s.rol === 'admin_erp' ? '#166534' : s.rol === 'staff' ? 'var(--warning)' : s.rol === 'manager' ? 'var(--purple-brand)' : s.rol === 'pm' ? '#d97706' : 'var(--primary)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {s.rol === 'admin_ecommerce' ? (
                              <><BrandingVectorIcon name="shopping-bag" size={12} /> Admin E-commerce</>
                            ) : s.rol === 'admin_erp' ? (
                              <><BrandingVectorIcon name="database" size={12} color="#166534" /> ERP Admin</>
                            ) : s.rol === 'admin' ? (
                              <><BrandingVectorIcon name="shield" size={12} /> Administrador</>
                            ) : s.rol === 'staff' ? (
                              <><BrandingVectorIcon name="briefcase" size={12} /> Staff</>
                            ) : s.rol === 'manager' ? (
                              <><BrandingVectorIcon name="users" size={12} /> Manager</>
                            ) : s.rol === 'pm' ? (
                              <><BrandingVectorIcon name="layers" size={12} /> PM</>
                            ) : (
                              <><BrandingVectorIcon name="user" size={12} /> Vendedor</>
                            )}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <BrandingVectorIcon name="calendar" size={12} color="#64748b" />
                            <span>{loginDate.toLocaleDateString()} a las {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                  <BrandingVectorIcon name="rotate-ccw" size={13} /> {loadingLogs ? 'Actualizando...' : 'Refrescar'}
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
                  <BrandingVectorIcon name="download" size={13} /> Exportar CSV
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="trash" size={13} /> Limpiar
                </button>
              </div>
            </div>

            {/* 4 Mini Tarjetas Flotantes KPI de Auditoría */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="file-text" size={13} color="var(--primary)" /> TOTAL DE EVENTOS AUDITADOS
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.total || systemLogs.length}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Historial global consolidado</span>
              </div>

              {/* KPI Carritos Abandonados */}
              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, transparent 100%)' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="shopping-cart" size={13} color="#d97706" /> CARRITOS SIN COMPRA
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#d97706', fontFamily: 'Outfit, sans-serif' }}>
                    {logStats.carritos_abandonados || systemLogs.filter(l => (l.accion || '').includes('CARRITO')).length}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#b45309' }}>
                    USD ${Number(logStats.monto_carritos_abandonados || 3977).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Carritos cargados sin finalizar orden</span>
              </div>

              {/* KPI Catálogo / Productos Vistos */}
              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid rgba(2, 132, 199, 0.3)', background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.04) 0%, transparent 100%)' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="eye" size={13} color="#0284c7" /> VISITAS AL CATÁLOGO
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#0284c7', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.visitas_catalogo || systemLogs.filter(l => (l.accion || '').includes('PRODUCTO_VISITADO') || (l.accion || '').includes('CATALOGO')).length}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fichas técnicas y modelos consultados</span>
              </div>

              <div className="card floating-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="lock" size={13} color="#9333ea" /> SEGURIDAD & SESIONES
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: '900', color: '#9333ea', fontFamily: 'Outfit, sans-serif' }}>
                  {logStats.security || logStats.auth || 0}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inicios de sesión y alertas de acceso</span>
              </div>
            </div>

            {/* Barra de Filtros Interactivos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--pill-bg)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border-color-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* Selector de Origen / Módulo con Filtros Específicos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Filtro:</span>
                  {[
                    { id: 'todos', label: 'Todos', icon: 'file-text' },
                    { id: 'carritos', label: 'Carritos Abandonados', icon: 'shopping-cart' },
                    { id: 'catalogo', label: 'Visitas a Catálogo', icon: 'eye' },
                    { id: 'ecommerce', label: 'E-Commerce B2B', icon: 'box' },
                    { id: 'dashboard', label: 'Dashboard', icon: 'zap' },
                    { id: 'tickets', label: 'Tickets', icon: 'ticket' },
                    { id: 'auth', label: 'Seguridad & Auth', icon: 'lock' }
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
                        background: logOriginFilter === tab.id ? (tab.id === 'carritos' ? '#d97706' : tab.id === 'catalogo' ? '#0284c7' : 'var(--primary)') : 'var(--card-bg)',
                        color: logOriginFilter === tab.id ? '#ffffff' : 'var(--text-main)',
                        border: logOriginFilter === tab.id ? '1px solid transparent' : '1px solid var(--border-color-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: logOriginFilter === tab.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <BrandingVectorIcon name={tab.icon} size={12} color={logOriginFilter === tab.id ? '#ffffff' : 'currentColor'} />
                      <span>{tab.label}</span>
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
                    <option value="INFO">INFO</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>

              {/* Búsqueda en Vivo */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Buscar por acción, producto, SKU, carrito, cliente, IP o email..."
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    <BrandingVectorIcon name="x" size={14} color="var(--text-muted)" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabla Flotante de Registros de Logs (Estricta Arquitectura 2 Líneas) */}
            {systemLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--pill-bg)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                <div style={{ marginBottom: '10px' }}><BrandingVectorIcon name="file-text" size={40} color="#94a3b8" /></div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--text-main)' }}>No se encontraron registros de logs</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Intenta cambiar los filtros de módulo o la búsqueda ingresada.
                </p>
              </div>
            ) : (
              <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', background: '#ffffff' }}>
                <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '130px' }}>Fecha & Hora</th>
                      <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '140px' }}>Módulo & Nivel</th>
                      <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '320px' }}>Acción & Detalle Forense</th>
                      <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '190px' }}>Usuario & IP</th>
                      <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', textAlign: 'center', width: '90px' }}>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.map(log => {
                      const fecha = new Date(log.timestamp);
                      const isCartAbandoned = (log.accion || '').includes('CARRITO_ABANDONADO') || (log.accion || '').includes('CARRITO_SIN_COMPRA');
                      const isProductView = (log.accion || '').includes('PRODUCTO_VISITADO') || (log.accion || '').includes('CATALOGO_EXPLORADO');
                      const isEcommerce = log.origen === 'ecommerce' || isCartAbandoned || isProductView;
                      const isTickets = log.origen === 'tickets';
                      const isDashboard = log.origen === 'dashboard';
                      const isAuth = log.origen === 'auth' || log.origen === 'usuarios';

                      const tipo = (log.tipo || 'INFO').toUpperCase();

                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color-subtle, #f1f5f9)', transition: 'background 0.15s ease' }}>
                          {/* 1. Fecha & Hora (2 lines) */}
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main, #0f172a)', lineHeight: '1.25', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <BrandingVectorIcon name="calendar" size={11} color="#64748b" />
                              <span>{fecha.toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace', lineHeight: '1.25', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <BrandingVectorIcon name="clock" size={10} color="#94a3b8" />
                              <span>{fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                          </td>

                          {/* 2. Módulo & Nivel (2 lines) */}
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ lineHeight: '1.25' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '10.5px',
                                fontWeight: '750',
                                background: isCartAbandoned ? '#fef3c7' : isProductView ? '#e0f2fe' : isEcommerce ? 'rgba(2, 132, 199, 0.12)' : isTickets ? 'rgba(16, 185, 129, 0.12)' : isAuth ? 'rgba(245, 158, 11, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                                color: isCartAbandoned ? '#b45309' : isProductView ? '#0284c7' : isEcommerce ? '#0284c7' : isTickets ? '#10b981' : isAuth ? '#d97706' : '#475569'
                              }}>
                                {isCartAbandoned ? (
                                  <><BrandingVectorIcon name="shopping-cart" size={11} /> Carrito B2B</>
                                ) : isProductView ? (
                                  <><BrandingVectorIcon name="eye" size={11} /> Catálogo</>
                                ) : isEcommerce ? (
                                  <><BrandingVectorIcon name="box" size={11} /> Shop</>
                                ) : isTickets ? (
                                  <><BrandingVectorIcon name="ticket" size={11} /> Tickets</>
                                ) : isAuth ? (
                                  <><BrandingVectorIcon name="lock" size={11} /> Auth</>
                                ) : (
                                  <><BrandingVectorIcon name="settings" size={11} /> Sistema</>
                                )}
                              </span>
                            </div>
                            <div style={{ marginTop: '2px', lineHeight: '1.25' }}>
                              <span style={{
                                padding: '1px 6px',
                                borderRadius: '6px',
                                fontSize: '9.5px',
                                fontWeight: '800',
                                letterSpacing: '0.04em',
                                background: tipo === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : tipo === 'WARNING' ? 'rgba(245, 158, 11, 0.15)' : tipo === 'SECURITY' ? 'rgba(168, 85, 247, 0.15)' : tipo === 'ERROR' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 164, 222, 0.15)',
                                color: tipo === 'SUCCESS' ? '#16a34a' : tipo === 'WARNING' ? '#d97706' : tipo === 'SECURITY' ? '#9333ea' : tipo === 'ERROR' ? '#dc2626' : '#0284c7'
                              }}>
                                {tipo}
                              </span>
                            </div>
                          </td>

                          {/* 3. Acción & Descripción (2 lines) */}
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '380px' }}>
                            {isCartAbandoned ? (
                              <>
                                <div style={{ fontWeight: '750', fontSize: '12px', color: '#b45309', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.accion}>
                                  CARRITO ABANDONADO • {log.detalles?.itemsCount || 0} ÍTEMS • USD ${Number(log.detalles?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }} title={log.detalles?.itemsSummary || log.descripcion}>
                                  <BrandingVectorIcon name="box" size={11} color="#94a3b8" />
                                  <span>{log.detalles?.itemsSummary || log.descripcion}</span>
                                </div>
                              </>
                            ) : isProductView ? (
                              <>
                                <div style={{ fontWeight: '750', fontSize: '12px', color: '#0284c7', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.accion}>
                                  PRODUCTO CONSULTADO: {log.detalles?.brand ? `${log.detalles.brand} • ` : ''}{log.detalles?.productName || log.descripcion}
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }} title={`SKU: ${log.detalles?.sku || 'N/A'} • Cat: ${log.detalles?.category || 'General'} • Precio: USD $${log.detalles?.price || 0}`}>
                                  SKU: {log.detalles?.sku || 'N/A'} • USD ${log.detalles?.price || 0} • Cat: {log.detalles?.category || 'General'}
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontWeight: '750', fontSize: '12px', color: 'var(--text-main, #0f172a)', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.accion}>
                                  {log.accion}
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }} title={log.descripcion}>
                                  {log.descripcion}
                                </div>
                              </>
                            )}
                          </td>

                          {/* 4. Usuario & IP (2 lines) */}
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '210px' }}>
                            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-main, #0f172a)', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }} title={log.usuario?.nombre || 'Visitante'}>
                              <BrandingVectorIcon name="user" size={12} color="var(--primary)" />
                              <span>{log.usuario?.nombre || 'Visitante Web'}</span>
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#0fa4de', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }} title={`${log.usuario?.email || 'N/A'} • IP: ${log.ip || '127.0.0.1'}`}>
                              <BrandingVectorIcon name="mail" size={10} color="#0fa4de" />
                              <span>{log.usuario?.email || 'N/A'}</span>
                              <span style={{ color: '#94a3b8' }}>• {log.ip || '127.0.0.1'}</span>
                            </div>
                          </td>

                          {/* 5. Botón Ver (2 lines centered) */}
                          <td style={{ padding: '6px 12px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => { setSelectedLogDetail(log); setLogModalTab('visual'); }}
                              style={{
                                background: isCartAbandoned ? '#f59e0b' : isProductView ? '#0284c7' : '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BrandingVectorIcon name="eye" size={11} /> Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal de Detalle de Log Forense y Desglose Interactivo */}
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
                  background: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                  border: '1px solid #e2e8f0',
                  maxWidth: '720px',
                  width: '100%',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  padding: '28px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BrandingVectorIcon
                        name={(selectedLogDetail.accion || '').includes('CARRITO') ? 'shopping-cart' : (selectedLogDetail.accion || '').includes('PRODUCTO') ? 'eye' : 'file-text'}
                        size={22}
                        color="var(--primary)"
                      />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                          {(selectedLogDetail.accion || '').includes('CARRITO') ? 'Auditoría de Carrito Abandonado' : (selectedLogDetail.accion || '').includes('PRODUCTO') ? 'Detalle de Producto Consultado' : `Detalle del Evento #${selectedLogDetail.id}`}
                        </h3>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {logModalTab === 'visual' ? 'Vista interactiva y comercial de trazabilidad' : 'Estructura técnica de datos en JSON crudo'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Segmented Switcher: Vista Visual vs JSON */}
                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => setLogModalTab('visual')}
                          style={{
                            border: 'none',
                            padding: '6px 13px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: logModalTab === 'visual' ? '800' : '600',
                            background: logModalTab === 'visual' ? '#ffffff' : 'transparent',
                            color: logModalTab === 'visual' ? '#0f172a' : '#64748b',
                            boxShadow: logModalTab === 'visual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <BrandingVectorIcon name="eye" size={13} color={logModalTab === 'visual' ? '#0fa4de' : '#64748b'} />
                          <span>Vista Visual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogModalTab('json')}
                          style={{
                            border: 'none',
                            padding: '6px 13px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: logModalTab === 'json' ? '800' : '600',
                            background: logModalTab === 'json' ? '#ffffff' : 'transparent',
                            color: logModalTab === 'json' ? '#0f172a' : '#64748b',
                            boxShadow: logModalTab === 'json' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <BrandingVectorIcon name="terminal" size={13} color={logModalTab === 'json' ? '#0fa4de' : '#64748b'} />
                          <span>Ver JSON</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedLogDetail(null)}
                        style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                      >
                        <BrandingVectorIcon name="x" size={16} color="#475569" />
                      </button>
                    </div>
                  </div>

                  {logModalTab === 'visual' ? (
                    <>
                      {/* Grid de Metadatos Principales */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Acción</span>
                          <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedLogDetail.accion}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Nivel</span>
                          <div style={{ marginTop: '2px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: selectedLogDetail.tipo === 'WARNING' ? '#fef3c7' : selectedLogDetail.tipo === 'SECURITY' ? '#fee2e2' : '#e0f2fe',
                              color: selectedLogDetail.tipo === 'WARNING' ? '#b45309' : selectedLogDetail.tipo === 'SECURITY' ? '#dc2626' : '#0284c7'
                            }}>
                              {selectedLogDetail.tipo}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Fecha y Hora</span>
                          <div style={{ fontSize: '0.83rem', color: '#334155', fontWeight: '600', marginTop: '2px' }}>{new Date(selectedLogDetail.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>IP & Dispositivo</span>
                          <div style={{ fontSize: '0.83rem', color: '#334155', fontFamily: 'monospace', fontWeight: '600', marginTop: '2px' }}>{selectedLogDetail.ip}</div>
                        </div>
                      </div>

                      {/* TARJETA DESTACADA DEL USUARIO QUE REVISÓ EL ÍTEM */}
                      {(() => {
                        const logUserInfo = getLogUser(selectedLogDetail);
                        return (
                          <div style={{
                            background: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                                color: '#ffffff',
                                fontWeight: '800',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(15, 164, 222, 0.25)',
                                flexShrink: 0
                              }}>
                                {(logUserInfo.nombre || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.03em' }}>
                                  <BrandingVectorIcon name="user" size={12} color="#0fa4de" />
                                  <span>Usuario / Cliente que Consultó el Ítem</span>
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                                  {logUserInfo.nombre}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                                  {logUserInfo.email && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: '600' }}>
                                      <BrandingVectorIcon name="mail" size={12} color="#64748b" />
                                      <span>{logUserInfo.email}</span>
                                    </span>
                                  )}
                                  {logUserInfo.rol && (
                                    <span style={{
                                      background: logUserInfo.rol === 'vendedor' ? '#e0f2fe' : logUserInfo.rol === 'pm' ? '#fef3c7' : logUserInfo.rol === 'admin' ? '#fee2e2' : '#f1f5f9',
                                      color: logUserInfo.rol === 'vendedor' ? '#0284c7' : logUserInfo.rol === 'pm' ? '#d97706' : logUserInfo.rol === 'admin' ? '#dc2626' : '#475569',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '800',
                                      textTransform: 'capitalize'
                                    }}>
                                      Rol: {logUserInfo.rol === 'cliente' ? 'Cliente B2B' : logUserInfo.rol}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>
                                Dirección IP
                              </span>
                              <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block', marginTop: '3px' }}>
                                {selectedLogDetail.ip || '127.0.0.1'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* FICHA VISUAL DESTACADA PARA PRODUCTOS */}
                      {((selectedLogDetail.accion || '').includes('PRODUCTO_VISITADO') || selectedLogDetail.detalles?.productName) && (
                        <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', padding: '18px', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="eye" size={14} color="#0284c7" /> Ficha Comercial del Producto Consultado
                            </span>
                            {selectedLogDetail.detalles?.brand && (
                              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0369a1', background: '#e0f2fe', padding: '3px 10px', borderRadius: '8px', border: '1px solid #7dd3fc' }}>
                                {selectedLogDetail.detalles.brand}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', lineHeight: '1.3' }}>
                            {selectedLogDetail.detalles?.productName}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Código SKU</div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', marginTop: '3px' }}>
                                {selectedLogDetail.detalles?.sku || 'N/A'}
                              </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Categoría</div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7', textTransform: 'capitalize', marginTop: '3px' }}>
                                {selectedLogDetail.detalles?.category || 'General'}
                              </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Precio de Lista</div>
                              <div style={{ fontSize: '14px', fontWeight: '900', color: '#10b981', marginTop: '3px' }}>
                                USD ${Number(selectedLogDetail.detalles?.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
                              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>ID Catálogo</div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', marginTop: '3px' }}>
                                #{selectedLogDetail.detalles?.productId || selectedLogDetail.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DESGLOSE ESPECIAL SI ES CARRITO ABANDONADO */}
                      {selectedLogDetail.detalles?.items && Array.isArray(selectedLogDetail.detalles.items) && selectedLogDetail.detalles.items.length > 0 && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="box" size={14} color="#b45309" /> Productos Que Estaban En El Carrito
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: '#b45309' }}>
                              Total Retenido: USD ${Number(selectedLogDetail.detalles.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                              <thead>
                                <tr style={{ background: '#fef3c7', textAlign: 'left', borderBottom: '1px solid #fcd34d' }}>
                                  <th style={{ padding: '6px 8px', color: '#92400e' }}>Producto / Marca</th>
                                  <th style={{ padding: '6px 8px', color: '#92400e' }}>SKU</th>
                                  <th style={{ padding: '6px 8px', color: '#92400e', textAlign: 'center' }}>Cant.</th>
                                  <th style={{ padding: '6px 8px', color: '#92400e', textAlign: 'right' }}>Precio Unit.</th>
                                  <th style={{ padding: '6px 8px', color: '#92400e', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedLogDetail.detalles.items.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #fef3c7' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: '700', color: '#0f172a' }}>
                                      {item.brand ? <span style={{ color: '#0284c7', marginRight: '4px' }}>[{item.brand}]</span> : null}
                                      {item.name}
                                    </td>
                                    <td style={{ padding: '6px 8px', color: '#64748b', fontFamily: 'monospace' }}>{item.sku || 'N/A'}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '700' }}>{item.qty}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>USD ${item.price}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700', color: '#b45309' }}>USD ${item.subtotal || (item.qty * item.price)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* OTROS ATRIBUTOS Y PARÁMETROS VISUALES */}
                      {selectedLogDetail.detalles && typeof selectedLogDetail.detalles === 'object' && Object.keys(selectedLogDetail.detalles).filter(k => !['productName', 'brand', 'sku', 'price', 'category', 'items', 'total', 'productId'].includes(k)).length > 0 && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '16px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                            Atributos Adicionales de la Operación
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                            {Object.entries(selectedLogDetail.detalles)
                              .filter(([k]) => !['productName', 'brand', 'sku', 'price', 'category', 'items', 'total', 'productId'].includes(k))
                              .map(([k, val]) => (
                                <div key={k} style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                                    {formatFieldLabel(k)}
                                  </div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-all', marginTop: '2px' }}>
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Descripción Forense */}
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Descripción Forense
                        </span>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#0f172a', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', lineHeight: 1.45, border: '1px solid #e2e8f0' }}>
                          {selectedLogDetail.descripcion}
                        </p>
                      </div>

                      {/* Botón rápido opcional para inspeccionar JSON */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setLogModalTab('json')}
                          style={{
                            background: '#f8fafc',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <BrandingVectorIcon name="terminal" size={12} color="#64748b" />
                          <span>Ver Payload JSON Técnico</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* PESTAÑA: JSON CRUDO & TRAZABILIDAD */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>
                            Payload JSON Crudo & Trazabilidad
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLogJson(selectedLogDetail.detalles)}
                            style={{
                              background: copiedLogJson ? '#10b981' : '#0fa4de',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <BrandingVectorIcon name={copiedLogJson ? 'check' : 'copy'} size={12} color="#ffffff" />
                            <span>{copiedLogJson ? '¡Copiado! ✓' : 'Copiar JSON'}</span>
                          </button>
                        </div>
                        <pre style={{
                          margin: 0,
                          background: '#071524',
                          color: '#38bdf8',
                          padding: '16px',
                          borderRadius: '14px',
                          fontSize: '11.5px',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          maxHeight: '260px',
                          lineHeight: '1.5'
                        }}>
                          {JSON.stringify(selectedLogDetail.detalles || {}, null, 2)}
                        </pre>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <button
                          type="button"
                          onClick={() => setLogModalTab('visual')}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#0f172a',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <BrandingVectorIcon name="eye" size={13} color="#0f172a" />
                          <span>← Volver a Vista Visual</span>
                        </button>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedLogDetail(null)}
                      style={{
                        background: '#0fa4de',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 20px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cerrar Detalle
                    </button>
                  </div>
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
