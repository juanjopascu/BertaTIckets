import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function AdminTemplates({ embedded = false }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  
  // Modal & Form State
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [campos, setCampos] = useState([]);
  
  // New assignment state
  const [asociacionTipo, setAsociacionTipo] = useState('equipo');
  const [equipoId, setEquipoId] = useState('');
  const [accion, setAccion] = useState('Soporte Técnico');
  const [accionPersonalizada, setAccionPersonalizada] = useState('');
  
  const [destinatarioTipo, setDestinatarioTipo] = useState('todos');
  const [destinatarioEmail, setDestinatarioEmail] = useState('');
  const [organizacionId, setOrganizacionId] = useState('');

  // Dynamic field creation helper state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('texto');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchEquipos();
    fetchUsuarios();
    fetchOrganizaciones();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener plantillas.');
    }
  };

  const fetchEquipos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/equipos`);
      const data = await response.json();
      if (Array.isArray(data)) setEquipos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`);
      const data = await response.json();
      if (Array.isArray(data)) setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrganizaciones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizaciones`);
      const data = await response.json();
      if (Array.isArray(data)) setOrganizaciones(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (email) => {
    if (!email) return '';
    const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? user.nombre : email.split('@')[0];
  };

  const handleAddField = () => {
    if (!fieldName.trim()) {
      alert('El nombre del campo es obligatorio.');
      return;
    }
    
    const fieldId = fieldName.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_') + '_' + Date.now();

    const newField = {
      id: fieldId,
      nombre: fieldName.trim(),
      tipo: fieldType,
      requerido: fieldRequired,
      opciones: fieldType === 'seleccion' ? fieldOptions.trim() : ''
    };

    setCampos([...campos, newField]);
    
    // Reset helper state
    setFieldName('');
    setFieldType('texto');
    setFieldRequired(false);
    setFieldOptions('');
  };

  const handleRemoveField = (id) => {
    setCampos(campos.filter(f => f.id !== id));
  };

  const handleEdit = (tpl) => {
    setEditingId(tpl.id);
    setNombre(tpl.nombre);
    setDescripcion(tpl.descripcion || '');
    
    // Asociacion fields
    const assocType = tpl.asociacionTipo || 'equipo';
    setAsociacionTipo(assocType);
    setEquipoId(tpl.equipoId || '');
    
    const isStandardAccion = ['Soporte Técnico', 'Facturación / Finanzas', 'Instalación / Configuración', 'Consulta Comercial', 'Mantenimiento Preventivo', 'Capacitación', 'Auditoría / Seguridad'].includes(tpl.accion);
    if (tpl.accion) {
      if (isStandardAccion) {
        setAccion(tpl.accion);
        setAccionPersonalizada('');
      } else {
        setAccion('Otro');
        setAccionPersonalizada(tpl.accion);
      }
    } else {
      setAccion('Soporte Técnico');
      setAccionPersonalizada('');
    }
    
    // Destinatarios fields
    setDestinatarioTipo(tpl.destinatarioTipo || 'todos');
    setDestinatarioEmail(tpl.destinatarioEmail || '');
    setOrganizacionId(tpl.organizacionId || '');
    
    setCampos(tpl.campos || []);
    setError(null);
    setSuccess(null);
    setMostrarModal(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setAsociacionTipo('equipo');
    setEquipoId('');
    setAccion('Soporte Técnico');
    setAccionPersonalizada('');
    setDestinatarioTipo('todos');
    setDestinatarioEmail('');
    setOrganizacionId('');
    setCampos([]);
    setError(null);
    setSuccess(null);
    setMostrarModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre.trim()) {
      setError('El nombre de la plantilla es obligatorio.');
      return;
    }

    const finalAccion = asociacionTipo === 'accion' 
      ? (accion === 'Otro' ? accionPersonalizada.trim() : accion)
      : null;

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      asociacionTipo,
      equipoId: asociacionTipo === 'equipo' && equipoId ? parseInt(equipoId) : null,
      accion: finalAccion,
      destinatarioTipo,
      destinatarioEmail: destinatarioTipo === 'persona' && destinatarioEmail ? destinatarioEmail : null,
      organizacionId: destinatarioTipo === 'organizacion' && organizacionId ? parseInt(organizacionId) : null,
      campos: campos
    };

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/templates/${editingId}`
        : `${API_BASE_URL}/api/templates`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar la plantilla.');

      setSuccess(editingId ? 'Plantilla actualizada con éxito.' : 'Plantilla creada con éxito.');
      handleResetForm();
      fetchTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta plantilla? Los tickets existentes creados con ella no perderán sus datos, pero no se podrán crear nuevos tickets con este formato.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess('Plantilla eliminada con éxito.');
      fetchTemplates();
      if (editingId === id) handleResetForm();
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
                    Plantillas de Tickets
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Estandarización de respuestas predeterminadas y formularios guiados
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-controls">
                  <button 
                    className="nav-btn" 
                    style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                    onClick={() => {
                      handleResetForm();
                      setMostrarModal(true);
                    }}
                  >
                    ➕ Añadir Nueva Plantilla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="crm-main">
        {success && (
          <div style={{ background: '#dcfce3', color: '#166534', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
            {success}
          </div>
        )}

        {/* MODAL EMERGENTE DE CREACIÓN / EDICIÓN (POP-UP) */}
        {mostrarModal && (
          <div className="modal-overlay" onClick={handleResetForm}>
            <div className="modal-container" style={{ maxWidth: '650px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla'}</h2>
                <button onClick={handleResetForm}>✕</button>
              </div>
              <div style={{ padding: '32px' }}>
                {error && <div className="error-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600 }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Nombre & Descripción */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Nombre de la Plantilla *</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Falla de Impresora, Alta de Software..." 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                      <label>Descripción</label>
                      <input 
                        type="text"
                        placeholder="Breve explicación de cuándo usar esta plantilla..." 
                        value={descripcion} 
                        onChange={(e) => setDescripcion(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ASOCIACIÓN DE LA PLANTILLA: Equipo de Soporte o Acción */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>🛠️ Asociación del Ticket</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                        <label>Asociar a:</label>
                        <select 
                          value={asociacionTipo} 
                          onChange={(e) => setAsociacionTipo(e.target.value)}
                          className="status-select"
                          style={{ width: '100%' }}
                        >
                          <option value="equipo">👥 Equipo de Soporte</option>
                          <option value="accion">⚡ Acción Específica</option>
                        </select>
                      </div>

                      {asociacionTipo === 'equipo' ? (
                        <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                          <label>Equipo de Soporte Asignado</label>
                          <select 
                            value={equipoId} 
                            onChange={(e) => setEquipoId(e.target.value)}
                            className="status-select"
                            style={{ width: '100%' }}
                          >
                            <option value="">-- Seleccione un equipo --</option>
                            {equipos.map(eq => (
                              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                          <label>Acción Asociada</label>
                          <select 
                            value={accion} 
                            onChange={(e) => setAccion(e.target.value)}
                            className="status-select"
                            style={{ width: '100%', marginBottom: accion === 'Otro' ? '10px' : 0 }}
                          >
                            <option value="Soporte Técnico">Soporte Técnico</option>
                            <option value="Facturación / Finanzas">Facturación / Finanzas</option>
                            <option value="Instalación / Configuración">Instalación / Configuración</option>
                            <option value="Consulta Comercial">Consulta Comercial</option>
                            <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                            <option value="Capacitación">Capacitación</option>
                            <option value="Auditoría / Seguridad">Auditoría / Seguridad</option>
                            <option value="Otro">Otro (Ingreso manual)</option>
                          </select>
                          {accion === 'Otro' && (
                            <input 
                              type="text" 
                              placeholder="Ej. Auditoría de Infraestructura, Reclamo" 
                              value={accionPersonalizada}
                              onChange={(e) => setAccionPersonalizada(e.target.value)}
                              required={asociacionTipo === 'accion' && accion === 'Otro'}
                              style={{ width: '100%', marginTop: '6px' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESTINATARIO DE LA PLANTILLA: Persona o Grupo de Clientes (Organización) */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>👤 Destinatarios de la Plantilla</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                        <label>Habilitar para:</label>
                        <select 
                          value={destinatarioTipo} 
                          onChange={(e) => setDestinatarioTipo(e.target.value)}
                          className="status-select"
                          style={{ width: '100%' }}
                        >
                          <option value="todos">🌍 Todos los Clientes (Global)</option>
                          <option value="persona">👤 Persona Específica</option>
                          <option value="organizacion">🏢 Grupo de Clientes (Organización)</option>
                        </select>
                      </div>

                      {destinatarioTipo === 'persona' && (
                        <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                          <label>Seleccionar Usuario</label>
                          <select 
                            value={destinatarioEmail} 
                            onChange={(e) => setDestinatarioEmail(e.target.value)}
                            className="status-select"
                            style={{ width: '100%' }}
                            required={destinatarioTipo === 'persona'}
                          >
                            <option value="">-- Seleccione un usuario --</option>
                            {usuarios.map(u => (
                              <option key={u.id} value={u.email}>👤 {u.nombre} ({u.email}) - Rol: {u.rol}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {destinatarioTipo === 'organizacion' && (
                        <div className="form-group" style={{ margin: 0, flex: '1 1 240px' }}>
                          <label>Seleccionar Organización (Grupo)</label>
                          <select 
                            value={organizacionId} 
                            onChange={(e) => setOrganizacionId(e.target.value)}
                            className="status-select"
                            style={{ width: '100%' }}
                            required={destinatarioTipo === 'organizacion'}
                          >
                            <option value="">-- Seleccione una organización --</option>
                            {organizaciones.map(org => (
                              <option key={org.id} value={org.id}>🏢 {org.nombre}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN DE CAMPOS DINÁMICOS */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>📋 Diseñar Campos del Formulario</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Nombre del Campo *</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Número de Serie, IP del router..." 
                          value={fieldName} 
                          onChange={(e) => setFieldName(e.target.value)}
                          style={{ padding: '10px' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Tipo de Campo</label>
                        <select 
                          value={fieldType} 
                          onChange={(e) => setFieldType(e.target.value)}
                          className="status-select"
                          style={{ width: '100%', padding: '10px', height: '42px' }}
                        >
                          <option value="texto">Texto plano</option>
                          <option value="numero">Número</option>
                          <option value="seleccion">Lista de Opciones (Dropdown)</option>
                          <option value="area_texto">Área de Texto (Grande)</option>
                          <option value="casilla">Casilla de verificación</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px', flex: '1 1 120px' }}>
                        <input 
                          type="checkbox" 
                          id="fieldRequiredCheck"
                          checked={fieldRequired} 
                          onChange={(e) => setFieldRequired(e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                        />
                        <label htmlFor="fieldRequiredCheck" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer', margin: 0 }}>¿Obligatorio?</label>
                      </div>
                    </div>

                    {fieldType === 'seleccion' && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Opciones (Separadas por comas) *</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Router, Switch, Access Point, Fibra" 
                          value={fieldOptions} 
                          onChange={(e) => setFieldOptions(e.target.value)}
                        />
                      </div>
                    )}

                    <button 
                      type="button" 
                      onClick={handleAddField}
                      className="nav-btn"
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      ➕ Insertar Campo
                    </button>
                  </div>

                  {/* VISTA DE CAMPOS AGREGADOS */}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>Campos de esta Plantilla ({campos.length})</h3>
                    {campos.length === 0 ? (
                      <p style={{ color: '#8e8e93', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #e2e8f0', margin: 0 }}>
                        Aún no has añadido ningún campo personalizado. El formulario solo tendrá el título estándar.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                        {campos.map((c, index) => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ textAlign: 'left' }}>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>#{index + 1} - {c.nombre} {c.requerido && <span style={{ color: 'red' }}>*</span>}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#6e6e73', marginLeft: '8px' }}>
                                ({c.tipo === 'casilla' ? 'Checkbox' : c.tipo === 'seleccion' ? 'Dropdown' : c.tipo})
                                {c.opciones && ` [Opciones: ${c.opciones}]`}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveField(c.id)}
                              style={{ border: 'none', background: 'transparent', color: '#e63946', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
                              title="Eliminar campo"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botones del Modal */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={handleResetForm} 
                      style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '14px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '14px 28px' }}>
                      {editingId ? 'Guardar Cambios' : 'Crear Plantilla'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE PLANTILLAS REGISTRADAS */}
        <section className="board-section">
          <h2>Plantillas Disponibles</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre de la Plantilla</th>
                  <th>ID</th>
                  <th>Asociación</th>
                  <th>Destinatarios</th>
                  <th>Campos Definidos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
                      No hay plantillas creadas todavía.
                    </td>
                  </tr>
                ) : (
                  templates.map(tpl => (
                    <tr key={tpl.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>📋 {tpl.nombre}</div>
                        {tpl.descripcion && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tpl.descripcion}</div>}
                      </td>
                      <td>
                        <span style={{ background: 'rgba(67, 97, 238, 0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                          ID: {tpl.id}
                        </span>
                      </td>
                      <td>
                        {tpl.asociacionTipo === 'accion' ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            ⚡ Acción: {tpl.accion || 'Soporte'}
                          </span>
                        ) : (
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            👥 Equipo: {equipos.find(eq => eq.id === tpl.equipoId)?.nombre || `Equipo #${tpl.equipoId}`}
                          </span>
                        )}
                      </td>
                      <td>
                        {tpl.destinatarioTipo === 'persona' ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }} title={tpl.destinatarioEmail}>
                            👤 Persona: {getUserName(tpl.destinatarioEmail)}
                          </span>
                        ) : tpl.destinatarioTipo === 'organizacion' ? (
                          <span style={{ background: 'var(--primary-light)', color: 'var(--purple-brand)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            🏢 Org: {organizaciones.find(o => o.id === tpl.organizacionId)?.nombre || `Org #${tpl.organizacionId}`}
                          </span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            🌍 Global (Todos)
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        {tpl.campos && tpl.campos.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {tpl.campos.map(c => (
                              <span 
                                key={c.id} 
                                style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}
                                title={`${c.tipo} ${c.requerido ? '(Requerido)' : ''}`}
                              >
                                {c.nombre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#86868b', fontStyle: 'italic' }}>Sin campos personalizados</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            onClick={() => handleEdit(tpl)}
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
                            onClick={() => handleDelete(tpl.id)}
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



export default AdminTemplates;
