import React, { useState, useMemo, useEffect } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import PaginationBar from '../PaginationBar';
import { API_BASE_URL, downloadCSV } from '../adminHelpers';

export default function EndUsersTab({
  users = [],
  countries = [],
  activeCountryObj = { name: 'Argentina', code: 'AR', id: 2 },
  getAuthHeader
}) {
  const [endUsers, setEndUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentEndUser, setCurrentEndUser] = useState({
    user_id: '',
    company_name: '',
    name: '',
    tax_id: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    country: activeCountryObj?.name || 'Argentina',
    city: ''
  });

  const fetchEndUsers = async () => {
    try {
      setLoading(true);
      const headers = { ...(getAuthHeader ? getAuthHeader() : {}) };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/end-users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEndUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Error fetching end users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentEndUser({
      user_id: users.length > 0 ? users[0].id : '',
      company_name: '',
      name: '',
      tax_id: '',
      contact_name: '',
      email: '',
      phone: '',
      industry: '',
      country: activeCountryObj?.name || 'Argentina',
      city: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (eu) => {
    setModalMode('edit');
    setCurrentEndUser({
      id: eu.id,
      user_id: eu.user_id || '',
      company_name: eu.company_name || eu.razon_social || eu.name || '',
      name: eu.company_name || eu.razon_social || eu.name || '',
      tax_id: eu.tax_id || eu.cuit || eu.rut || '',
      contact_name: eu.contact_name || eu.contacto || '',
      email: eu.email || '',
      phone: eu.phone || eu.telefono || '',
      industry: eu.industry || eu.rubro || '',
      country: eu.country || eu.pais || activeCountryObj?.name || 'Argentina',
      city: eu.city || eu.ciudad || ''
    });
    setShowModal(true);
  };

  const handleSaveEndUser = async (e) => {
    e.preventDefault();
    if (!currentEndUser.company_name && !currentEndUser.name) {
      alert('Por favor ingrese la razón social o nombre del End User');
      return;
    }
    try {
      const headers = { 'Content-Type': 'application/json', ...(getAuthHeader ? getAuthHeader() : {}) };
      const payload = {
        ...currentEndUser,
        name: currentEndUser.company_name || currentEndUser.name,
        user_id: currentEndUser.user_id ? Number(currentEndUser.user_id) : null
      };

      const url = modalMode === 'edit'
        ? `${API_BASE_URL}/api/ecommerce/admin/erp/end-users/${currentEndUser.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/erp/end-users`;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowModal(false);
        fetchEndUsers();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Error al guardar el End User');
      }
    } catch (err) {
      console.error('Error saving end user:', err);
    }
  };

  const handleDeleteEndUser = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este End User?')) return;
    try {
      const headers = { ...(getAuthHeader ? getAuthHeader() : {}) };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/end-users/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchEndUsers();
      }
    } catch (err) {
      console.error('Error deleting end user:', err);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredEndUsers.map(eu => {
      const parentUser = users.find(u => Number(u.id) === Number(eu.user_id));
      return {
        id: eu.id,
        nombre: eu.company_name || eu.name || '',
        cuit: eu.tax_id || eu.cuit || '',
        canal_mayorista: parentUser ? (parentUser.razon_social || parentUser.name) : (eu.client_name || ''),
        email_canal: parentUser?.email || '',
        pais: eu.country || eu.pais || '',
        contacto: eu.contact_name || eu.contacto || '',
        email: eu.email || '',
        telefono: eu.phone || eu.telefono || '',
        industria: eu.industry || eu.rubro || ''
      };
    });

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Razón Social End User' },
      { key: 'cuit', label: 'ID Fiscal / CUIT' },
      { key: 'canal_mayorista', label: 'Canal Mayorista Vinculado' },
      { key: 'email_canal', label: 'Email Canal' },
      { key: 'pais', label: 'País' },
      { key: 'contacto', label: 'Contacto' },
      { key: 'email', label: 'Email Contacto' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'industria', label: 'Industria' }
    ];

    downloadCSV(rows, headers, `dacas_end_users_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Verificación de si nos encontramos bajo el Scope de un país específico (ej: Argentina)
  const isCountryScoped = Boolean(
    activeCountryObj &&
    activeCountryObj.code &&
    activeCountryObj.code !== 'all' &&
    activeCountryObj.id !== null &&
    !String(activeCountryObj.name || '').toLowerCase().includes('todos')
  );

  const scopedTargetCountryName = (activeCountryObj?.name || 'Argentina').toLowerCase();
  const scopedTargetCountryCode = (activeCountryObj?.code || 'AR').toUpperCase();

  // Filtrado
  const filteredEndUsers = useMemo(() => {
    return endUsers.filter(eu => {
      const q = search.toLowerCase().trim();
      const name = (eu.company_name || eu.name || '').toLowerCase();
      const tax = (eu.tax_id || eu.cuit || eu.rut || '').toLowerCase();
      const contact = (eu.contact_name || eu.contacto || '').toLowerCase();
      const email = (eu.email || '').toLowerCase();
      const parentUser = users.find(u => Number(u.id) === Number(eu.user_id));
      const clientName = (parentUser?.razon_social || parentUser?.name || eu.client_name || '').toLowerCase();

      const matchSearch = !search ||
        name.includes(q) ||
        tax.includes(q) ||
        contact.includes(q) ||
        email.includes(q) ||
        clientName.includes(q);

      // Si el scope está restringido a un país (ej: Argentina), solo se admiten End Users de ese país
      if (isCountryScoped) {
        const euCountry = (eu.country || eu.pais || '').toLowerCase();
        const euCode = (eu.country_code || '').toUpperCase();
        const parentCountry = (parentUser?.country_name || '').toLowerCase();
        const parentCode = (parentUser?.country_code || '').toUpperCase();

        const matchesScopedCountry =
          euCountry === scopedTargetCountryName ||
          euCode === scopedTargetCountryCode ||
          (!euCountry && !euCode && (
            parentCountry === scopedTargetCountryName ||
            parentCode === scopedTargetCountryCode ||
            Number(parentUser?.country_id) === Number(activeCountryObj.id)
          ));

        if (!matchesScopedCountry) return false;
      } else {
        // En scope Global / Todos los Países, se aplica el dropdown interactivo de país
        if (filterCountry !== 'all') {
          const countryVal = (eu.country || eu.pais || '').toUpperCase();
          if (countryVal !== filterCountry.toUpperCase()) return false;
        }
      }

      const matchClient = filterClient === 'all' || String(eu.user_id) === String(filterClient);

      return matchSearch && matchClient;
    });
  }, [endUsers, search, filterCountry, filterClient, users, isCountryScoped, scopedTargetCountryName, scopedTargetCountryCode, activeCountryObj]);

  // Lista de canales mayoristas disponibles (filtrada por país si aplica scope)
  const availableChannels = useMemo(() => {
    if (!isCountryScoped) return users;
    return users.filter(u => {
      const uCode = (u.country_code || '').toUpperCase();
      const uName = (u.country_name || '').toLowerCase();
      const uId = Number(u.country_id);
      return uCode === scopedTargetCountryCode ||
             uName === scopedTargetCountryName ||
             (activeCountryObj?.id && uId === Number(activeCountryObj.id));
    });
  }, [users, isCountryScoped, scopedTargetCountryCode, scopedTargetCountryName, activeCountryObj]);

  const paginatedEndUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEndUsers.slice(start, start + pageSize);
  }, [filteredEndUsers, page, pageSize]);

  return (
    <section className="board-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* HEADER SUPERIOR CON ACCIONES */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '18px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
          }}>
            <BrandingVectorIcon name="briefcase" size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>
                Catálogo de End Users (Clientes Finales)
              </h2>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {filteredEndUsers.length} registros
              </span>
              {isCountryScoped && (
                <span style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  Scope: {activeCountryObj.name} ({activeCountryObj.code})
                </span>
              )}
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Directorio de clientes corporativos finales asociados a canales mayoristas para licenciamiento y entregas.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BrandingVectorIcon name="download" size={13} color="#0284c7" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 8px rgba(2, 132, 199, 0.3)'
            }}
          >
            <BrandingVectorIcon name="plus" size={13} color="#ffffff" />
            <span>+ Registrar End User</span>
          </button>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '380px'
          }}>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por End User, CUIT, canal o contacto..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              <BrandingVectorIcon name="search" size={13} color="#64748b" />
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Filtro por Canal Mayorista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748b' }}>Canal Mayorista:</span>
            <select
              value={filterClient}
              onChange={(e) => { setFilterClient(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '11.5px',
                background: '#ffffff',
                fontWeight: '600'
              }}
            >
              <option value="all">Todos los Canales ({availableChannels.length})</option>
              {availableChannels.map(u => (
                <option key={u.id} value={u.id}>
                  {u.razon_social || u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por País (Solo visible en scope Global / Todos los Países) */}
          {!isCountryScoped && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748b' }}>País:</span>
              <select
                value={filterCountry}
                onChange={(e) => { setFilterCountry(e.target.value); setPage(1); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  background: '#ffffff',
                  fontWeight: '600'
                }}
              >
                <option value="all">Todos los Países</option>
                {countries.map(c => (
                  <option key={c.code || c.id} value={c.code || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TABLA PRINCIPAL DE END USERS */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ width: '5%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>ID</th>
              <th style={{ width: '22%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>End User / Razón Social</th>
              <th style={{ width: '12%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>CUIT / NIT</th>
              <th style={{ width: '20%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Canal Mayorista</th>
              <th style={{ width: '12%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>País / Ciudad</th>
              <th style={{ width: '17%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Contacto & Email</th>
              <th style={{ width: '12%', padding: '8px 12px', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEndUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <BrandingVectorIcon name="briefcase" size={32} color="#94a3b8" />
                  </div>
                  <div style={{ fontWeight: '750', fontSize: '14px', color: '#1e293b' }}>
                    No se encontraron End Users registrados
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Haz click en "+ Registrar End User" para crear una ficha vinculada a un canal mayorista.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEndUsers.map((eu, idx) => {
                const parentUser = users.find(u => Number(u.id) === Number(eu.user_id));
                return (
                  <tr
                    key={eu.id || idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: '#0284c7', fontWeight: '800' }}>
                      #{eu.id}
                    </td>

                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: '750', color: '#0f172a', fontSize: '12px' }}>
                        {eu.company_name || eu.name || 'End User Sin Nombre'}
                      </div>
                      {(eu.industry || eu.rubro) && (
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                          Rubro: {eu.industry || eu.rubro}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#334155', fontWeight: '600' }}>
                      {eu.tax_id || eu.cuit || eu.rut || '-'}
                    </td>

                    <td style={{ padding: '8px 12px' }}>
                      {parentUser ? (
                        <div>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>
                            {parentUser.razon_social || parentUser.name}
                          </span>
                          <span style={{ color: '#0284c7', fontSize: '10.5px', display: 'block' }}>
                            {parentUser.email}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b' }}>
                          {eu.client_name || 'Canal no especificado'}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                      <span style={{ fontWeight: '600' }}>{eu.country || eu.pais || 'Argentina'}</span>
                      {(eu.city || eu.ciudad) && (
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                          {eu.city || eu.ciudad}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ color: '#0f172a', fontWeight: '600' }}>
                        {eu.contact_name || eu.contacto || '-'}
                      </div>
                      {eu.email && (
                        <div style={{ color: '#0284c7', fontSize: '11px' }}>
                          {eu.email}
                        </div>
                      )}
                      {(eu.phone || eu.telefono) && (
                        <div style={{ color: '#64748b', fontSize: '10.5px' }}>
                          Tel: {eu.phone || eu.telefono}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(eu)}
                          title="Editar End User"
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            color: '#0284c7',
                            borderRadius: '5px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '750',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BrandingVectorIcon name="edit" size={11} color="#0284c7" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEndUser(eu.id)}
                          title="Eliminar End User"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '5px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '750',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BrandingVectorIcon name="trash" size={11} color="#dc2626" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <PaginationBar
        currentPage={page}
        totalItems={filteredEndUsers.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[25, 50, 100, 200]}
      />

      {/* MODAL CREAR / EDITAR END USER */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandingVectorIcon name="briefcase" size={16} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {modalMode === 'edit' ? 'Editar End User' : 'Registrar Nuevo End User'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                    Cliente final o empresa destinataria vinculado al canal mayorista
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="x" size={14} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveEndUser} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* CANAL MAYORISTA PADRE */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                    Canal Mayorista (Owner B2B) *
                  </label>
                  <select
                    value={currentEndUser.user_id || ''}
                    onChange={(e) => {
                      const uid = e.target.value;
                      const parent = users.find(u => String(u.id) === String(uid));
                      setCurrentEndUser(prev => ({
                        ...prev,
                        user_id: uid,
                        country: parent?.country_name || parent?.country || prev.country
                      }));
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: '600'
                    }}
                  >
                    <option value="">-- Seleccionar Canal Mayorista --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.razon_social || u.name} ({u.email}) - #{u.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  {/* RAZÓN SOCIAL / NOMBRE */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      Razón Social / Nombre Fantasía *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentEndUser.company_name || currentEndUser.name || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, company_name: e.target.value, name: e.target.value }))}
                      placeholder="Ej. Clínica Metropolitana S.A."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* IDENTIFICADOR FISCAL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      ID Fiscal / CUIT / RUT
                    </label>
                    <input
                      type="text"
                      value={currentEndUser.tax_id || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, tax_id: e.target.value }))}
                      placeholder="30-12345678-9"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* CONTACTO PRINCIPAL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      Persona de Contacto
                    </label>
                    <input
                      type="text"
                      value={currentEndUser.contact_name || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, contact_name: e.target.value }))}
                      placeholder="Ej. Ing. Martín Gómez"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      Email de Notificación
                    </label>
                    <input
                      type="email"
                      value={currentEndUser.email || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="compras@enduser.com"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* TELÉFONO */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={currentEndUser.phone || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 11 4321-9876"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* INDUSTRIA / SECTOR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                      Industria / Sector
                    </label>
                    <input
                      type="text"
                      value={currentEndUser.industry || ''}
                      onChange={(e) => setCurrentEndUser(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Ej. Salud, Banca, Gobierno, Retail"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '7px',
                    border: 'none',
                    background: '#0284c7',
                    fontSize: '12px',
                    fontWeight: '750',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(2,132,199,0.3)'
                  }}
                >
                  {modalMode === 'edit' ? 'Guardar Cambios' : 'Registrar End User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
