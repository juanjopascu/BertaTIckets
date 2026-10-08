import React, { useState, useMemo } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import PaginationBar from '../PaginationBar';
import { initialUserForm, API_BASE_URL } from '../adminHelpers';

export default function UsersTab({
  users = [],
  countries = [],
  activeCountryObj = { name: 'Argentina', code: 'AR', flag: '🇦🇷', id: 2 },
  clientTypes = [],
  setClientTypes,
  setClientTypesModalOpen,
  openUserModal,
  fetchUsers,
  getAuthHeader
}) {
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(25);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userCreateMode, setUserCreateMode] = useState('new_company');
  const [selectedExistingCompany, setSelectedExistingCompany] = useState('');
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userFormSection, setUserFormSection] = useState(1);
  const [error, setError] = useState(null);

  // Dropdown de acciones flotante
  const [openActionDropdown, setOpenActionDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Users filtrados por país
  const countryScopedUsers = useMemo(() => {
    return users.filter(u => {
      const uCountryId = Number(u.country_id);
      const uCountryCode = (u.country_code || '').toUpperCase();
      const uCountryName = (u.country_name || '').toLowerCase();
      return (activeCountryObj.id && uCountryId === activeCountryObj.id) ||
             (activeCountryObj.code && uCountryCode === activeCountryObj.code) ||
             (activeCountryObj.name && uCountryName.includes(activeCountryObj.name.toLowerCase()));
    });
  }, [users, activeCountryObj]);

  // Empresas distintas para asociar usuarios
  const distinctCompanies = useMemo(() => {
    const list = [];
    const seen = new Set();
    users.forEach(u => {
      const name = (u.razon_social || u.name || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          razon_social: name,
          tipo_cliente: u.tipo_cliente || 'Reseller / Integrador IT',
          numero_nit: u.numero_nit || '',
          country_id: u.country_id || '',
          country_name: u.country_name || '',
          phone: u.phone || '',
          web: u.web || '',
          direccion_legal: u.direccion_legal || '',
          localidad: u.localidad || '',
          ciudad: u.ciudad || '',
          codigo_postal: u.codigo_postal || '',
          vendedor: u.vendedor || '',
          report_to_country_id: u.report_to_country_id || '',
          direccion_entrega: u.direccion_entrega || '',
          localidad_entrega: u.localidad_entrega || '',
          ciudad_entrega: u.ciudad_entrega || '',
          codigo_postal_entrega: u.codigo_postal_entrega || '',
          pais_entrega_id: u.pais_entrega_id || '',
          tipo_iva: u.tipo_iva || '',
          nombre_compras: u.nombre_compras || '',
          telefono_compras: u.telefono_compras || '',
          email_compras: u.email_compras || '',
          nombre_pagos: u.nombre_pagos || '',
          telefono_pagos: u.telefono_pagos || '',
          email_pagos: u.email_pagos || '',
          nombre_admin: u.nombre_admin || '',
          telefono_admin: u.telefono_admin || '',
          email_admin: u.email_admin || '',
          email_factura_electronica: u.email_factura_electronica || '',
          email_contacto_compras: u.email_contacto_compras || '',
          email_cotizaciones_automaticas: u.email_cotizaciones_automaticas || '',
          iibb_jurisdiccion: u.iibb_jurisdiccion,
          iibb_tipo: u.iibb_tipo,
          iibb_numero: u.iibb_numero,
          iibb_codigo_aceptacion: u.iibb_codigo_aceptacion,
          percepciones: u.percepciones
        });
      }
    });
    return list;
  }, [users]);

  // Filtro de usuarios
  const filteredUsers = useMemo(() => {
    return countryScopedUsers.filter(u => {
      const matchStatus = userFilterStatus === 'all'
        ? true
        : userFilterStatus === 'activo'
        ? (u.status || 'activo') === 'activo'
        : u.status === userFilterStatus;

      const q = (userSearch || '').trim().toLowerCase();
      const matchSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.razon_social && u.razon_social.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.numero_nit && u.numero_nit.toLowerCase().includes(q)) ||
        (u.vendedor && u.vendedor.toLowerCase().includes(q)) ||
        (u.tipo_cliente && u.tipo_cliente.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [countryScopedUsers, userFilterStatus, userSearch]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return filteredUsers.slice(start, start + userPageSize);
  }, [filteredUsers, userPage, userPageSize]);

  // Handlers
  const handlePercepcionChange = (provKey, field, val) => {
    setUserForm(prev => ({
      ...prev,
      percepciones: {
        ...(prev.percepciones || {}),
        [provKey]: {
          ...(prev.percepciones?.[provKey] || {}),
          [field]: val
        }
      }
    }));
  };

  const resetUserForm = () => {
    setUserForm({
      ...initialUserForm,
      country_id: activeCountryObj?.id || 2,
      report_to_country_id: activeCountryObj?.id || 2
    });
    setEditingUser(null);
    setShowUserForm(false);
    setUserFormSection(1);
    setUserCreateMode('new_company');
    setSelectedExistingCompany('');
  };

  const handleSelectExistingCompany = (companyName) => {
    setSelectedExistingCompany(companyName);
    const comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === companyName.toLowerCase());
    if (comp) {
      setUserForm(prev => ({
        ...prev,
        razon_social: comp.razon_social,
        tipo_cliente: comp.tipo_cliente,
        numero_nit: comp.numero_nit,
        country_id: comp.country_id,
        phone: comp.phone || prev.phone,
        web: comp.web,
        direccion_legal: comp.direccion_legal,
        localidad: comp.localidad,
        ciudad: comp.ciudad,
        codigo_postal: comp.codigo_postal,
        vendedor: comp.vendedor,
        report_to_country_id: comp.report_to_country_id,
        direccion_entrega: comp.direccion_entrega,
        localidad_entrega: comp.localidad_entrega,
        ciudad_entrega: comp.ciudad_entrega,
        codigo_postal_entrega: comp.codigo_postal_entrega,
        pais_entrega_id: comp.pais_entrega_id,
        tipo_iva: comp.tipo_iva,
        nombre_compras: comp.nombre_compras,
        telefono_compras: comp.telefono_compras,
        email_compras: comp.email_compras,
        nombre_pagos: comp.nombre_pagos,
        telefono_pagos: comp.telefono_pagos,
        email_pagos: comp.email_pagos,
        nombre_admin: comp.nombre_admin,
        telefono_admin: comp.telefono_admin,
        email_admin: comp.email_admin,
        email_factura_electronica: comp.email_factura_electronica,
        email_contacto_compras: comp.email_contacto_compras,
        email_cotizaciones_automaticas: comp.email_cotizaciones_automaticas,
        iibb_jurisdiccion: comp.iibb_jurisdiccion || prev.iibb_jurisdiccion,
        iibb_tipo: comp.iibb_tipo || prev.iibb_tipo,
        iibb_numero: comp.iibb_numero || prev.iibb_numero,
        iibb_codigo_aceptacion: comp.iibb_codigo_aceptacion !== undefined ? comp.iibb_codigo_aceptacion : prev.iibb_codigo_aceptacion,
        percepciones: comp.percepciones || prev.percepciones
      }));
    }
  };

  const handleOpenAddUserToCompany = (compOrUser) => {
    resetUserForm();
    let comp = null;
    if (typeof compOrUser === 'string') {
      comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === compOrUser.toLowerCase());
    } else if (compOrUser) {
      comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === (compOrUser.razon_social || compOrUser.name || '').toLowerCase()) || compOrUser;
    }
    setUserCreateMode('existing_company');
    if (comp) {
      const cName = comp.razon_social || comp.name || '';
      setSelectedExistingCompany(cName);
      setUserForm({
        ...initialUserForm,
        razon_social: cName,
        tipo_cliente: comp.tipo_cliente || 'Reseller / Integrador IT',
        numero_nit: comp.numero_nit || '',
        country_id: comp.country_id || '',
        phone: comp.phone || '',
        web: comp.web || '',
        direccion_legal: comp.direccion_legal || '',
        localidad: comp.localidad || '',
        ciudad: comp.ciudad || '',
        codigo_postal: comp.codigo_postal || '',
        vendedor: comp.vendedor || '',
        report_to_country_id: comp.report_to_country_id || '',
        direccion_entrega: comp.direccion_entrega || '',
        localidad_entrega: comp.localidad_entrega || '',
        ciudad_entrega: comp.ciudad_entrega || '',
        codigo_postal_entrega: comp.codigo_postal_entrega || '',
        pais_entrega_id: comp.pais_entrega_id || '',
        tipo_iva: comp.tipo_iva || '',
        nombre_compras: comp.nombre_compras || '',
        telefono_compras: comp.telefono_compras || '',
        email_compras: comp.email_compras || '',
        nombre_pagos: comp.nombre_pagos || '',
        telefono_pagos: comp.telefono_pagos || '',
        email_pagos: comp.email_pagos || '',
        nombre_admin: comp.nombre_admin || '',
        telefono_admin: comp.telefono_admin || '',
        email_admin: comp.email_admin || '',
        email_factura_electronica: comp.email_factura_electronica || '',
        email_contacto_compras: comp.email_contacto_compras || '',
        email_cotizaciones_automaticas: comp.email_cotizaciones_automaticas || '',
        iibb_jurisdiccion: comp.iibb_jurisdiccion || initialUserForm.iibb_jurisdiccion,
        iibb_tipo: comp.iibb_tipo || initialUserForm.iibb_tipo,
        iibb_numero: comp.iibb_numero || comp.numero_nit || '',
        iibb_codigo_aceptacion: comp.iibb_codigo_aceptacion !== undefined ? comp.iibb_codigo_aceptacion : initialUserForm.iibb_codigo_aceptacion,
        percepciones: comp.percepciones || initialUserForm.percepciones,
        cargo: 'Encargado de Compras'
      });
    }
    setShowUserForm(true);
    setUserFormSection(1);
  };

  const handleEditUser = async (u) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${u.id}`);
      if (res.ok) {
        const data = await res.json();
        const safeData = { ...initialUserForm, ...data, password: '' };
        if (safeData.fecha_limite_facturacion) safeData.fecha_limite_facturacion = safeData.fecha_limite_facturacion.split('T')[0];
        let percs = data.percepciones;
        if (typeof percs === 'string') {
          try { percs = JSON.parse(percs); } catch (_) { percs = null; }
        }
        safeData.percepciones = percs || initialUserForm.percepciones;
        safeData.iibb_jurisdiccion = data.iibb_jurisdiccion || initialUserForm.iibb_jurisdiccion;
        safeData.iibb_tipo = data.iibb_tipo || initialUserForm.iibb_tipo;
        safeData.iibb_numero = data.iibb_numero || data.numero_nit || '';
        safeData.iibb_codigo_aceptacion = data.iibb_codigo_aceptacion !== undefined ? data.iibb_codigo_aceptacion : initialUserForm.iibb_codigo_aceptacion;
        safeData.cuenta_corriente_habilitada = Boolean(data.cuenta_corriente_habilitada);
        safeData.cuenta_corriente_limite = data.cuenta_corriente_limite !== undefined ? (parseFloat(data.cuenta_corriente_limite) || 0) : (parseFloat(data.limite_credito) || 0);
        setUserForm(safeData);
        setEditingUser(u);
        setUserCreateMode('existing_company');
        setSelectedExistingCompany(safeData.razon_social || '');
        setShowUserForm(true);
        setUserFormSection(1);
      }
    } catch (e) {
      alert('Error cargando usuario para editar');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = editingUser
        ? `${API_BASE_URL}/api/ecommerce/admin/users/${editingUser.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';
      const payload = { ...userForm };
      if (editingUser && !payload.password) delete payload.password;
      payload.cuenta_corriente_habilitada = Boolean(userForm.cuenta_corriente_habilitada);
      payload.cuenta_corriente_limite = (userForm.cuenta_corriente_limite !== '' && userForm.cuenta_corriente_limite !== null && userForm.cuenta_corriente_limite !== undefined)
        ? (parseFloat(userForm.cuenta_corriente_limite) || 0)
        : 0;
      if (payload.fecha_limite_facturacion) {
        payload.fecha_limite_facturacion = new Date(payload.fecha_limite_facturacion).toISOString().split('T')[0];
      } else {
        payload.fecha_limite_facturacion = null;
      }
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al guardar cliente');
      resetUserForm();
      if (fetchUsers) await fetchUsers();
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const handleApproveUser = async (userId) => {
    if (!window.confirm('¿Desea aprobar y activar la cuenta de este cliente para que pueda comprar y acceder al portal?')) return;
    try {
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}/approve`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al aprobar cliente');
      if (fetchUsers) fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al cambiar estado');
      if (fetchUsers) fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="board-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Gestión y Aprobación de Clientes DACAS</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#6b7280' }}>
            Revisa las solicitudes de registro enviadas desde el Shop, aprueba clientes mayoristas y gestiona condiciones comerciales.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setClientTypesModalOpen && setClientTypesModalOpen(true)}
            style={{
              background: '#f0f9ff',
              color: '#0284c7',
              border: '1.5px solid #bae6fd',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
              transition: 'all 0.15s ease'
            }}
            title="Abrir ABM de Tipos de Cliente para segmentación"
          >
            <span style={{ fontSize: '15px' }}>🏷️</span>
            <span>Tipos de Cliente (ABM)</span>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '10.5px', fontWeight: '800', padding: '1px 7px', borderRadius: '999px' }}>
              {clientTypes.length}
            </span>
          </button>
          <button className="dacas-action-pill primary" onClick={() => { resetUserForm(); setShowUserForm(true); }}>
            <BrandingVectorIcon name="plus" size={14} color="#ffffff" />
            <span>Crear Cliente Manualmente</span>
          </button>
        </div>
      </div>

      {/* Country Scope Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
        border: '1px solid rgba(15, 164, 222, 0.25)',
        padding: '10px 16px',
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{activeCountryObj.flag || '🇦🇷'}</span>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
            Clientes radicados en {activeCountryObj.name} ({activeCountryObj.code})
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            — Mostrando únicamente cuentas mayoristas de {activeCountryObj.name} ({countryScopedUsers.length} clientes encontrados)
          </span>
        </div>
      </div>

      {/* Barra de Filtros por Estado y Buscador de Clientes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Todos los Clientes', icon: null, count: countryScopedUsers.length },
            { key: 'pendiente', label: 'Solicitudes Pendientes', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => u.status === 'pendiente').length, highlight: true },
            { key: 'activo', label: 'Clientes Activos', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => (u.status || 'activo') === 'activo').length },
            { key: 'inactivo', label: 'Inactivos', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => u.status === 'inactivo').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setUserFilterStatus(f.key)}
              style={{
                padding: '5px 11px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: userFilterStatus === f.key ? '#0fa4de' : 'var(--border-color)',
                background: userFilterStatus === f.key ? '#0fa4de' : 'var(--card-bg)',
                color: userFilterStatus === f.key ? '#ffffff' : 'var(--text-main)',
                fontWeight: userFilterStatus === f.key ? '700' : '600',
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: userFilterStatus === f.key ? '0 2px 6px rgba(15, 164, 222, 0.2)' : 'none'
              }}
            >
              {f.icon}
              <span>{f.label}</span>
              <span style={{
                background: userFilterStatus === f.key ? 'rgba(255,255,255,0.25)' : (f.highlight && f.count > 0 ? '#fef3c7' : '#f1f5f9'),
                color: userFilterStatus === f.key ? '#ffffff' : (f.highlight && f.count > 0 ? '#d97706' : '#64748b'),
                padding: '1px 5px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador de clientes */}
        <div style={{ position: 'relative', width: '280px', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Buscar empresa, usuario, CUIT, email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text-main)',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
            <BrandingVectorIcon name="search" size={13} color="#94a3b8" />
          </span>
          {userSearch && (
            <button 
              type="button" 
              onClick={() => setUserSearch('')}
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', padding: '2px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ALTA / EDICIÓN DE USUARIO B2B */}
      {showUserForm && (
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>{editingUser ? `Editar Usuario / Cliente: ${editingUser.name}` : (userCreateMode === 'existing_company' ? `Agregar Nuevo Usuario a Empresa: ${userForm.razon_social || 'Seleccionada'}` : 'Alta Nueva Empresa & Usuario Principal B2B')}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {editingUser ? 'Actualiza los datos personales, cargo o condiciones de acceso.' : (userCreateMode === 'existing_company' ? 'Crea una cuenta adicional de log-in que compartirá la misma empresa, condiciones fiscales y descuentos.' : 'Crea una nueva razón social junto a su primer usuario habilitado para operar.')}
              </p>
            </div>
            <button onClick={resetUserForm} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
          </div>

          {/* Switcher Modo de Creación */}
          {!editingUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setUserCreateMode('new_company');
                  setSelectedExistingCompany('');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: userCreateMode === 'new_company' ? 'linear-gradient(135deg, #0fa4de, #0284c7)' : 'transparent',
                  color: userCreateMode === 'new_company' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: userCreateMode === 'new_company' ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: userCreateMode === 'new_company' ? '0 2px 8px rgba(15, 164, 222, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>🏢</span> Nueva Empresa & Usuario Principal
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserCreateMode('existing_company');
                  if (distinctCompanies.length > 0 && !selectedExistingCompany) {
                    handleSelectExistingCompany(distinctCompanies[0].razon_social);
                  }
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: userCreateMode === 'existing_company' ? 'linear-gradient(135deg, #0fa4de, #0284c7)' : 'transparent',
                  color: userCreateMode === 'existing_company' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: userCreateMode === 'existing_company' ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: userCreateMode === 'existing_company' ? '0 2px 8px rgba(15, 164, 222, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>👥</span> Agregar Usuario a Empresa Existente ({distinctCompanies.length})
              </button>
            </div>
          )}

          {/* Selector de Empresa Existente */}
          {!editingUser && userCreateMode === 'existing_company' && (
            <div style={{ background: 'rgba(15, 164, 222, 0.08)', border: '1px solid rgba(15, 164, 222, 0.3)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '6px' }}>
                🏢 Seleccionar Empresa a la que pertenecerá este usuario:
              </label>
              <select
                value={selectedExistingCompany || userForm.razon_social}
                onChange={(e) => handleSelectExistingCompany(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #0fa4de',
                  fontWeight: '700',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '14px'
                }}
              >
                {distinctCompanies.length === 0 && <option value="">No hay empresas registradas aún</option>}
                {distinctCompanies.map(c => (
                  <option key={c.razon_social} value={c.razon_social}>
                    {c.razon_social} {c.numero_nit ? `— CUIT/NIT: ${c.numero_nit}` : ''} {c.country_name ? `(${c.country_name})` : ''}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ℹ️</span> Este nuevo usuario podrá ingresar con su propio email y clave, compartiendo el catálogo de precios, condiciones comerciales y pedidos de <strong>{userForm.razon_social || 'la empresa'}</strong>.
              </div>
            </div>
          )}

          <form onSubmit={handleUserSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* BLOQUE 1: DATOS DE ACCESO & CUENTA */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>👤</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                      1. Datos de Acceso & Cuenta de Usuario (Auth & Operador)
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Credenciales para iniciar sesión en el Shop, estado y rol dentro de la empresa.
                    </span>
                  </div>
                </div>
                <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '10.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                  ACCESO SHOP
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>Estado de Cuenta *</label>
                  <select 
                    value={userForm.status || 'activo'} 
                    onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                    style={{
                      fontWeight: '700',
                      borderColor: userForm.status === 'activo' ? '#10b981' : userForm.status === 'pendiente' ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    <option value="activo">🟢 Activo (Habilitado para comprar)</option>
                    <option value="pendiente">🟡 Pendiente de Aprobación</option>
                    <option value="inactivo">🔴 Inactivo / Bloqueado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nombre y Apellido del Usuario *</label>
                  <input type="text" placeholder="Ej: Laura Gómez" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Cargo / Rol en la Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Encargado de Compras, Gerente..." 
                    value={userForm.cargo || ''} 
                    onChange={e => setUserForm({ ...userForm, cargo: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Email de Log-In (Shop) *</label>
                  <input type="email" placeholder="usuario@empresa.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Contraseña {editingUser ? '(Dejar vacío para mantener)' : '*'}</label>
                  <input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required={!editingUser} />
                </div>

                <div className="form-group">
                  <label>Teléfono Directo / WhatsApp</label>
                  <input type="text" placeholder="+54 11 4000-1234" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                </div>
              </div>
            </div>

            {/* BLOQUE 2: PERFIL COMERCIAL & LEGAL */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📊</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                      2. Perfil Comercial & Legal (Segmentación B2B)
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Razón social, categorización comercial para listas de precios y datos web corporativos.
                    </span>
                  </div>
                </div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '10.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                  FICHA PORTAL
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>Razón Social / Empresa *</label>
                  <input 
                    type="text" 
                    value={userForm.razon_social} 
                    onChange={e => setUserForm({ ...userForm, razon_social: e.target.value })} 
                    required 
                    disabled={!editingUser && userCreateMode === 'existing_company'}
                    style={{ background: !editingUser && userCreateMode === 'existing_company' ? 'rgba(0,0,0,0.04)' : undefined }}
                    placeholder="Ej: Soluciones Tecnológicas S.A."
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Cliente / Actividad *</label>
                  <select
                    value={userForm.tipo_cliente || ''}
                    onChange={e => setUserForm({ ...userForm, tipo_cliente: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">-- Seleccionar Tipo de Cliente --</option>
                    {userForm.tipo_cliente && !clientTypes.some(ct => ct.name === userForm.tipo_cliente) && (
                      <option value={userForm.tipo_cliente}>{userForm.tipo_cliente} (Personalizado)</option>
                    )}
                    {clientTypes.map(ct => (
                      <option key={ct.id || ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>País Legal / Operación</label>
                  <select value={userForm.country_id} onChange={e => setUserForm({ ...userForm, country_id: e.target.value })}>
                    <option value="">Selecciona País...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sitio Web Corporativo</label>
                  <input type="text" value={userForm.web} onChange={e => setUserForm({ ...userForm, web: e.target.value })} placeholder="https://www.empresa.com" />
                </div>

                <div className="form-group">
                  <label>Fecha Límite Facturación</label>
                  <input type="date" value={userForm.fecha_limite_facturacion} onChange={e => setUserForm({ ...userForm, fecha_limite_facturacion: e.target.value })} />
                </div>

                {/* CASILLA CUENTA CORRIENTE & LÍMITE */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: userForm.cuenta_corriente_habilitada ? 'rgba(16, 185, 129, 0.08)' : 'rgba(241, 245, 249, 0.7)',
                  border: `1.5px solid ${userForm.cuenta_corriente_habilitada ? '#10b981' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setUserForm(prev => ({ ...prev, cuenta_corriente_habilitada: !prev.cuenta_corriente_habilitada }))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: userForm.cuenta_corriente_habilitada ? '#10b981' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BrandingVectorIcon 
                          name="credit-card" 
                          size={22} 
                          color={userForm.cuenta_corriente_habilitada ? '#ffffff' : '#64748b'} 
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Cuenta Corriente Habilitada</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '2px 9px',
                            borderRadius: '999px',
                            background: userForm.cuenta_corriente_habilitada ? '#dcfce7' : '#f1f5f9',
                            color: userForm.cuenta_corriente_habilitada ? '#15803d' : '#64748b',
                            border: `1px solid ${userForm.cuenta_corriente_habilitada ? '#86efac' : '#cbd5e1'}`
                          }}>
                            {userForm.cuenta_corriente_habilitada ? '✓ Habilitada para Checkout' : '🔒 Bloqueada en Checkout'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          Al marcar esta casilla, el cliente podrá seleccionar y pagar con <strong>Cuenta Corriente Comercial B2B</strong> en el Checkout del Shop.
                        </div>
                      </div>
                    </div>

                    <input 
                      type="checkbox" 
                      checked={!!userForm.cuenta_corriente_habilitada}
                      onChange={e => {
                        e.stopPropagation();
                        setUserForm({ ...userForm, cuenta_corriente_habilitada: e.target.checked });
                      }}
                      style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#10b981', flexShrink: 0 }}
                    />
                  </div>

                  {/* Campo de Límite de Crédito (Monto) */}
                  {userForm.cuenta_corriente_habilitada && (
                    <div style={{
                      marginTop: '4px',
                      paddingTop: '12px',
                      borderTop: '1px dashed rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span>💵</span> LÍMITE DE CRÉDITO CUENTA CORRIENTE (USD)
                        </label>
                        <div style={{ fontSize: '11.5px', color: '#047857' }}>
                          Monto máximo financiable en el Checkout. Si la orden supera este valor, el sistema bloqueará la opción de crédito automáticamente. (0 para sin límite)
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#065f46' }}>$</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="0 (Sin límite)"
                          value={userForm.cuenta_corriente_limite !== undefined && userForm.cuenta_corriente_limite !== null ? userForm.cuenta_corriente_limite : ''}
                          onChange={e => setUserForm({ ...userForm, cuenta_corriente_limite: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '160px',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #10b981',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: '14px',
                            fontWeight: '800',
                            outline: 'none',
                            textAlign: 'right'
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#065f46' }}>USD</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BLOQUE 3: CONDICIÓN FISCAL & ASIGNACIÓN */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🧾</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                      3. Condición Fiscal & Asignación Comercial
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Identificación tributaria, condición IVA y ejecutivo comercial asignado.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>Número de CUIT / RUT / NIT *</label>
                  <input type="text" value={userForm.numero_nit} onChange={e => setUserForm({ ...userForm, numero_nit: e.target.value })} placeholder="Ej: 30-71234567-8" />
                </div>

                <div className="form-group">
                  <label>Tipo de IVA / Condición Fiscal</label>
                  <input 
                    type="text" 
                    value={userForm.tipo_iva} 
                    onChange={e => setUserForm({ ...userForm, tipo_iva: e.target.value })} 
                    placeholder="IVA Responsable Inscripto, Exento..." 
                  />
                </div>

                <div className="form-group">
                  <label>Vendedor Asignado (Ejecutivo Comercial DACAS)</label>
                  <input type="text" value={userForm.vendedor} onChange={e => setUserForm({ ...userForm, vendedor: e.target.value })} placeholder="Ej: Juan Pérez" />
                </div>

                <div className="form-group">
                  <label>Report To (País de Reporte Comercial)</label>
                  <select value={userForm.report_to_country_id} onChange={e => setUserForm({ ...userForm, report_to_country_id: e.target.value })}>
                    <option value="">Selecciona País...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* BLOQUE 4: DOMICILIO LEGAL / FISCAL */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                4. Domicilio Legal / Fiscal
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección Legal (Calle, Altura, Piso / Depto)</label>
                  <textarea value={userForm.direccion_legal} onChange={e => setUserForm({ ...userForm, direccion_legal: e.target.value })} rows="2" placeholder="Ej: Av. Corrientes 1234, Piso 8" />
                </div>
                <div className="form-group">
                  <label>Localidad / Barrio</label>
                  <input type="text" value={userForm.localidad} onChange={e => setUserForm({ ...userForm, localidad: e.target.value })} placeholder="Ej: San Nicolás" />
                </div>
                <div className="form-group">
                  <label>Ciudad / Provincia</label>
                  <input type="text" value={userForm.ciudad} onChange={e => setUserForm({ ...userForm, ciudad: e.target.value })} placeholder="Ej: Buenos Aires" />
                </div>
                <div className="form-group">
                  <label>Código Postal Legal</label>
                  <input type="text" value={userForm.codigo_postal} onChange={e => setUserForm({ ...userForm, codigo_postal: e.target.value })} placeholder="Ej: C1043AAS" />
                </div>
              </div>
            </div>

            {/* BLOQUE 5: DIRECCIÓN DE ENTREGA */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                5. Dirección de Entrega / Despacho (Ship-To)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección de Entrega (Calle, Depósito, Altura)</label>
                  <textarea value={userForm.direccion_entrega} onChange={e => setUserForm({ ...userForm, direccion_entrega: e.target.value })} rows="2" placeholder="Ej: Av. del Libertador 4500, Depósito 2" />
                </div>
                <div className="form-group">
                  <label>Localidad Entrega</label>
                  <input type="text" value={userForm.localidad_entrega} onChange={e => setUserForm({ ...userForm, localidad_entrega: e.target.value })} placeholder="Ej: Palermo" />
                </div>
                <div className="form-group">
                  <label>Ciudad Entrega</label>
                  <input type="text" value={userForm.ciudad_entrega} onChange={e => setUserForm({ ...userForm, ciudad_entrega: e.target.value })} placeholder="Ej: Buenos Aires" />
                </div>
                <div className="form-group">
                  <label>Cód Postal Entrega</label>
                  <input type="text" value={userForm.codigo_postal_entrega} onChange={e => setUserForm({ ...userForm, codigo_postal_entrega: e.target.value })} placeholder="Ej: C1426BWW" />
                </div>
                <div className="form-group">
                  <label>País de Entrega</label>
                  <select value={userForm.pais_entrega_id} onChange={e => setUserForm({ ...userForm, pais_entrega_id: e.target.value })}>
                    <option value="">Selecciona País...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* BLOQUE 6: PERCEPCIONES / RETENCIONES IIBB */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                    6. Percepciones & Retenciones IIBB (Ingresos Brutos - Argentina)
                  </h4>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Alícuotas impositivas aplicables automáticamente al momento del Checkout.
                  </span>
                </div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '10.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                  ARGENTINA EXCLUSIVO
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px', background: '#f8fafc' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                      Jurisdicción
                    </label>
                    <select
                      value={userForm.iibb_jurisdiccion || '901 - Capital Federal'}
                      onChange={e => setUserForm({ ...userForm, iibb_jurisdiccion: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#0f172a', background: '#ffffff' }}
                    >
                      <option value="901 - Capital Federal">901 - Capital Federal</option>
                      <option value="902 - Buenos Aires">902 - Buenos Aires</option>
                      <option value="904 - Córdoba">904 - Córdoba</option>
                      <option value="914 - Misiones">914 - Misiones</option>
                      <option value="917 - Salta">917 - Salta</option>
                      <option value="921 - Santa Fe">921 - Santa Fe</option>
                      <option value="924 - Tucumán">924 - Tucumán</option>
                      <option value="900 - Convenio Multilateral">900 - Convenio Multilateral</option>
                    </select>
                  </div>

                  <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px', background: '#f8fafc' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                      Nro Inscripcion IIBB
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px' }}>
                      <select
                        value={userForm.iibb_tipo || 'C.M.'}
                        onChange={e => setUserForm({ ...userForm, iibb_tipo: e.target.value })}
                        style={{ padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#0f172a', background: '#ffffff' }}
                      >
                        <option value="C.M.">C.M.</option>
                        <option value="Local">Local</option>
                        <option value="Exento">Exento</option>
                        <option value="No Inscripto">No Inscripto</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Ej: 9017223280"
                        value={userForm.iibb_numero || ''}
                        onChange={e => setUserForm({ ...userForm, iibb_numero: e.target.value })}
                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#0f172a', background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Percepciones Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {['caba', 'salta', 'bsas', 'misiones'].map(prov => {
                    const p = userForm.percepciones?.[prov] || { enabled: false, alicuota: 0, vigencia: '' };
                    return (
                      <div key={prov} style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '12px 14px', background: p.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Perc {prov.toUpperCase()}</span>
                          {p.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '70px' }}>
                            <input
                              type="checkbox"
                              checked={!!p.enabled}
                              onChange={e => handlePercepcionChange(prov, 'enabled', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                            />
                            <span>{prov.toUpperCase()}</span>
                          </label>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="0,0000"
                              value={p.alicuota !== undefined ? p.alicuota : 0}
                              onChange={e => handlePercepcionChange(prov, 'alicuota', parseFloat(e.target.value) || 0)}
                              style={{ width: '75px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right', background: '#ffffff' }}
                            />
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>%</span>
                          </div>
                          <input
                            type="date"
                            value={p.vigencia || '2026-10-01'}
                            onChange={e => handlePercepcionChange(prov, 'vigencia', e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', color: '#334155', background: '#ffffff', marginLeft: 'auto' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
              borderTop: '1.5px solid var(--border-color)',
              paddingTop: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <button 
                type="button" 
                className="btn-delete" 
                onClick={resetUserForm}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                style={{
                  padding: '10px 26px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
                }}
              >
                {editingUser ? '✓ Actualizar Usuario' : (userCreateMode === 'existing_company' ? '✓ Crear y Habilitar Usuario para esta Empresa' : '✓ Guardar y Habilitar Empresa B2B')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE USUARIOS / CLIENTES */}
      <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', background: '#ffffff' }}>
        <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', whiteSpace: 'nowrap', width: '65px' }}>ID</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '180px' }}>Empresa / Razón Social</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '180px' }}>Contacto & Email</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', width: '120px' }}>CUIT / NIT</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', width: '130px' }}>Segmento</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', width: '110px' }}>Estado</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', textAlign: 'center', width: '90px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>No se encontraron clientes</div>
                  <div style={{ fontSize: '12px' }}>Intenta cambiar los términos de búsqueda o filtros de estado para {activeCountryObj.name}.</div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map(u => {
                const isPending = u.status === 'pendiente';
                const isInactive = u.status === 'inactivo';
                const companyKey = (u.razon_social || u.name || '').trim().toLowerCase();
                const sameCompanyCount = users.filter(x => (x.razon_social || x.name || '').trim().toLowerCase() === companyKey).length;
                
                return (
                  <tr
                    key={u.id}
                    onClick={() => openUserModal && openUserModal(u.id)}
                    style={{
                      borderBottom: '1px solid var(--border-color-subtle, #f1f5f9)',
                      background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                      cursor: 'pointer',
                      height: '40px',
                      transition: 'background 0.15s ease'
                    }}
                    title="Click para abrir la ficha comercial completa, sucursales y datos impositivos"
                  >
                    <td style={{ padding: '4px 10px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span style={{ color: 'var(--primary, #0fa4de)', fontSize: '12px', fontWeight: '800' }}>#{u.id}</span>
                    </td>

                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong style={{ color: 'var(--text-main, #0f172a)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.razon_social || u.name}>
                          {u.razon_social || u.name}
                        </strong>
                        {sameCompanyCount > 1 && (
                          <span 
                            title={`Esta empresa cuenta con ${sameCompanyCount} usuarios vinculados`}
                            style={{
                              background: 'rgba(15, 164, 222, 0.1)',
                              color: '#0284c7',
                              border: '1px solid rgba(15, 164, 222, 0.25)',
                              padding: '0 5px',
                              borderRadius: '999px',
                              fontSize: '9.5px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              flexShrink: 0
                            }}
                          >
                            <BrandingVectorIcon name="users" size={9} color="#0284c7" />
                            {sameCompanyCount}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '220px' }}>
                      <div style={{ fontSize: '11.5px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${u.name} <${u.email}>`}>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{u.name}</span>
                        <span style={{ color: '#64748b', margin: '0 4px' }}>•</span>
                        <span style={{ color: '#0284c7' }}>{u.email}</span>
                      </div>
                    </td>

                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', fontWeight: '700', background: '#f8fafc', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', width: 'fit-content' }} title={u.numero_nit || 'Sin CUIT'}>
                          {u.numero_nit || 'Sin CUIT'}
                        </span>
                        {u.cuenta_corriente_habilitada ? (
                          <span style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '9.5px',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            width: 'fit-content'
                          }}>
                            <BrandingVectorIcon name="credit-card" size={9} color="#059669" />
                            CC {parseFloat(u.cuenta_corriente_limite || 0) > 0 ? `$${parseFloat(u.cuenta_corriente_limite).toLocaleString()} USD` : 'Habilitada'}
                          </span>
                        ) : (
                          <span style={{
                            background: '#f8fafc',
                            color: '#94a3b8',
                            border: '1px solid #e2e8f0',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '9.5px',
                            fontWeight: '700',
                            width: 'fit-content'
                          }}>
                            Sin CC
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const matchedType = clientTypes.find(ct => (ct.name || '').trim().toLowerCase() === (u.tipo_cliente || '').trim().toLowerCase());
                        const color = matchedType?.color || '#0284c7';
                        return (
                          <span style={{
                            background: matchedType ? `${color}15` : '#f1f5f9',
                            color: matchedType ? color : '#475569',
                            border: matchedType ? `1px solid ${color}35` : '1px solid #e2e8f0',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: '700'
                          }}>
                            {u.tipo_cliente || 'Mayorista'}
                          </span>
                        );
                      })()}
                    </td>

                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {isPending ? (
                        <span style={{
                          background: '#fef3c7',
                          color: '#d97706',
                          border: '1px solid #fde68a',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '750',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706' }}></span>
                          Pendiente
                        </span>
                      ) : isInactive ? (
                        <span style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '750',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626' }}></span>
                          Inactivo
                        </span>
                      ) : (
                        <span style={{
                          background: '#dcfce7',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '750',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }}></span>
                          Activo
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '6px 12px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openActionDropdown === u.id) {
                              setOpenActionDropdown(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                              setOpenActionDropdown(u.id);
                            }
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 9px', borderRadius: '7px', cursor: 'pointer',
                            fontSize: '11px', fontWeight: '700',
                            background: isPending ? '#fef3c7' : '#F1F5F9',
                            color: isPending ? '#d97706' : '#334155',
                            border: isPending ? '1px solid #fde68a' : '1px solid #CBD5E1',
                            transition: 'background 0.15s'
                          }}
                        >
                          <BrandingVectorIcon name="settings" size={11} color={isPending ? '#d97706' : '#334155'} />
                          <span>Acciones</span>
                          <BrandingVectorIcon name="chevron-down" size={10} color={isPending ? '#d97706' : '#64748B'} />
                        </button>

                        {openActionDropdown === u.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'fixed',
                              top: dropdownPos.top,
                              left: dropdownPos.left,
                              zIndex: 9999,
                              background: '#ffffff',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
                              minWidth: '160px',
                              padding: '4px'
                            }}
                          >
                            {isPending ? (
                              <button
                                onClick={() => { handleApproveUser(u.id); setOpenActionDropdown(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                  border: 'none', background: 'transparent',
                                  fontSize: '11.5px', fontWeight: '600', color: '#16a34a'
                                }}
                              >
                                <BrandingVectorIcon name="check" size={12} color="#16a34a" />
                                Aprobar
                              </button>
                            ) : (
                              <button
                                onClick={() => { handleOpenAddUserToCompany(u); setOpenActionDropdown(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                  border: 'none', background: 'transparent',
                                  fontSize: '11.5px', fontWeight: '600', color: '#334155'
                                }}
                              >
                                <BrandingVectorIcon name="plus" size={12} color="#334155" />
                                Agregar Usuario
                              </button>
                            )}

                            <button
                              onClick={() => { openUserModal && openUserModal(u.id); setOpenActionDropdown(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                border: 'none', background: 'transparent',
                                fontSize: '11.5px', fontWeight: '600', color: '#334155'
                              }}
                            >
                              <BrandingVectorIcon name="eye" size={12} color="#334155" />
                              Ver Perfil
                            </button>

                            <button
                              onClick={() => { handleEditUser(u); setOpenActionDropdown(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                border: 'none', background: 'transparent',
                                fontSize: '11.5px', fontWeight: '600', color: '#334155'
                              }}
                            >
                              <BrandingVectorIcon name="edit" size={12} color="#334155" />
                              Editar
                            </button>

                            <div style={{ height: '1px', background: '#F1F5F9', margin: '3px 0' }} />

                            {isPending ? (
                              <button
                                onClick={() => { handleToggleUserStatus(u.id, 'inactivo'); setOpenActionDropdown(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                  border: 'none', background: 'transparent',
                                  fontSize: '11.5px', fontWeight: '600', color: '#dc2626'
                                }}
                              >
                                <BrandingVectorIcon name="x" size={12} color="#dc2626" />
                                Rechazar
                              </button>
                            ) : isInactive ? (
                              <button
                                onClick={() => { handleToggleUserStatus(u.id, 'activo'); setOpenActionDropdown(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                  border: 'none', background: 'transparent',
                                  fontSize: '11.5px', fontWeight: '600', color: '#16a34a'
                                }}
                              >
                                <BrandingVectorIcon name="check" size={12} color="#16a34a" />
                                Activar
                              </button>
                            ) : (
                              <button
                                onClick={() => { handleToggleUserStatus(u.id, 'inactivo'); setOpenActionDropdown(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                  border: 'none', background: 'transparent',
                                  fontSize: '11.5px', fontWeight: '600', color: '#dc2626'
                                }}
                              >
                                <BrandingVectorIcon name="user-x" size={12} color="#dc2626" />
                                Desactivar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN DE CLIENTES */}
      <PaginationBar
        currentPage={userPage}
        totalItems={filteredUsers.length}
        pageSize={userPageSize}
        onPageChange={setUserPage}
        onPageSizeChange={setUserPageSize}
        pageSizeOptions={[15, 25, 50, 100]}
      />
    </section>
  );
}
