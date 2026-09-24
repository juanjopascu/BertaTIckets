import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

export default function ShopClientPortal() {
  const navigate = useNavigate();

  // State
  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_client_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('dacas_client_token'));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'discounts'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'procesando' | 'en_camino' | 'entregado'

  // Data
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total_orders: 0,
    active_orders: 0,
    delivered_orders: 0,
    total_spent: '0.00',
    active_rules_count: 0
  });
  const [activeRules, setActiveRules] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);

  // Modals & Forms
  const [selectedOrderForVoucher, setSelectedOrderForVoucher] = useState(null);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [changeForm, setChangeForm] = useState({
    request_type: 'Actualización de Domicilio de Entrega',
    details: '',
    phone_contact: '',
    urgent: false
  });
  const [submittingChange, setSubmittingChange] = useState(false);

  // Editable quick profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    ciudad: '',
    direccion_entrega: '',
    nombre_compras: '',
    telefono_compras: '',
    email_compras: '',
    nombre_pagos: '',
    telefono_pagos: '',
    email_pagos: ''
  });

  const fileInputRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/shop');
      return;
    }
    fetchCustomerData();
  }, [token]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Profile & Stats
      const pRes = await fetch(`${API_BASE_URL}/api/ecommerce/client/profile`, { headers });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfileData(pData.user);
        setStats(pData.stats || {});
        setActiveRules(pData.active_rules || []);
        setChangeRequests(pData.recent_change_requests || []);
        
        // Sync local storage user
        localStorage.setItem('dacas_client_user', JSON.stringify(pData.user));
        setClientUser(pData.user);

        // Prep edit form
        setEditForm({
          name: pData.user.name || '',
          phone: pData.user.phone || '',
          ciudad: pData.user.ciudad || '',
          direccion_entrega: pData.user.direccion_entrega || '',
          nombre_compras: pData.user.nombre_compras || '',
          telefono_compras: pData.user.telefono_compras || '',
          email_compras: pData.user.email_compras || '',
          nombre_pagos: pData.user.nombre_pagos || '',
          telefono_pagos: pData.user.telefono_pagos || '',
          email_pagos: pData.user.email_pagos || ''
        });
      }

      // 2. Orders History
      const oRes = await fetch(`${API_BASE_URL}/api/ecommerce/client/orders`, { headers });
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(Array.isArray(oData) ? oData : []);
      }
    } catch (err) {
      console.error('Error cargando portal del cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Avatar Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.avatar_url) {
        setProfileData(prev => ({ ...prev, avatar_url: data.avatar_url }));
        const updatedUser = { ...clientUser, avatar_url: data.avatar_url };
        setClientUser(updatedUser);
        localStorage.setItem('dacas_client_user', JSON.stringify(updatedUser));
        showToast('¡Foto de perfil actualizada exitosamente!');
      } else {
        throw new Error(data.error || 'Error al subir foto');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Submit Data Change Request
  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    setSubmittingChange(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/request-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_type: changeForm.request_type,
          details: changeForm.details,
          proposed_data: {
            phone_contact: changeForm.phone_contact,
            urgent: changeForm.urgent
          }
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('¡Solicitud de cambio enviada! Nuestro equipo comercial la procesará.');
        setChangeModalOpen(false);
        setChangeForm({ request_type: 'Actualización de Domicilio de Entrega', details: '', phone_contact: '', urgent: false });
        if (data.request) {
          setChangeRequests(prev => [data.request, ...prev]);
        }
      } else {
        throw new Error(data.error || 'Error al enviar solicitud');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingChange(false);
    }
  };

  // Submit Profile Edit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/client/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfileData(data.user);
        setClientUser(data.user);
        localStorage.setItem('dacas_client_user', JSON.stringify(data.user));
        setEditProfileOpen(false);
        showToast('¡Datos de contacto actualizados correctamente!');
      } else {
        throw new Error(data.error || 'Error al actualizar perfil');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dacas_client_user');
    localStorage.removeItem('dacas_client_token');
    navigate('/shop');
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'procesando') return ['procesando', 'pending', 'pendiente', 'paid'].includes(o.status);
    if (orderFilter === 'en_camino') return ['en_camino', 'shipped'].includes(o.status);
    if (orderFilter === 'entregado') return ['entregado', 'completed'].includes(o.status);
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'entregado' || s === 'completed') {
      return { label: '✓ Entregado', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', step: 4 };
    }
    if (s === 'en_camino' || s === 'shipped') {
      return { label: '🚚 En Tránsito / Despacho', bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC', step: 3 };
    }
    if (s === 'procesando' || s === 'paid') {
      return { label: '⚙️ En Preparación / Logística', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', step: 2 };
    }
    return { label: '⏳ Recibido / Pendiente', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', step: 1 };
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideDown 0.3s ease'
        }}>
          <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.25)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '68px', justifyContent: 'space-between' }}>
          
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div onClick={() => navigate('/shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#fff',
                fontWeight: '900',
                fontSize: '1.2rem',
                padding: '5px 12px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(15, 164, 222, 0.4)'
              }}>
                DACAS
              </div>
              <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                Shop <span style={{ color: '#0fa4de', fontSize: '0.85rem' }}>Portal de Cliente B2B</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/shop')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <span>🛒</span>
              <span>Volver a la Tienda</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: '#EF444422',
                color: '#F87171',
                border: '1px solid #EF444444',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '30px 20px 80px' }}>

        {/* ── Executive Hero Card ── */}
        <div style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d233a 50%, #0f3252 100%)',
          borderRadius: '24px',
          padding: '32px',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(7, 21, 36, 0.15)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow Accent */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(15,164,222,0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 1 }}>
            
            {/* User & Company Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              
              {/* Avatar Uploader */}
              <div style={{ position: 'relative', width: '84px', height: '84px' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  border: '3px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '34px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
                }}>
                  {profileData?.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>🏢</span>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  disabled={avatarUploading}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#0fa4de',
                    color: '#fff',
                    border: '2px solid #071524',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {avatarUploading ? '⏳' : '📷'}
                </button>
              </div>

              {/* Company Data */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
                    {profileData?.razon_social || profileData?.name || clientUser?.razon_social || 'Empresa Cliente'}
                  </h1>
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#4ade80',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    ✓ Cuenta B2B Activa
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', color: '#94A3B8', fontSize: '13px' }}>
                  <span>👤 <strong>Contacto:</strong> {profileData?.name || clientUser?.name}</span>
                  <span>📧 <strong>Email:</strong> {profileData?.email || clientUser?.email}</span>
                  {profileData?.numero_nit && <span>🏛️ <strong>CUIT/NIT:</strong> {profileData.numero_nit}</span>}
                  {profileData?.country_name && <span>🌐 <strong>País:</strong> {profileData.country_name}</span>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setChangeModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '11px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15,164,222,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📝</span>
                <span>Solicitar Modificación de Datos</span>
              </button>
            </div>
          </div>

          {/* ── Summary Stats Grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total en Compras</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8' }}>${parseFloat(stats.total_spent || 0).toFixed(2)} <span style={{ fontSize: '12px', color: '#94A3B8' }}>USD</span></div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{stats.total_orders} órdenes registradas</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Pedidos Activos</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b' }}>{stats.active_orders} <span style={{ fontSize: '12px', color: '#94A3B8' }}>en curso</span></div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Logística y despacho DACAS</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Pedidos Entregados</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{stats.delivered_orders} <span style={{ fontSize: '12px', color: '#94A3B8' }}>completados</span></div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Historial con remito oficial</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Descuentos Asignados</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a855f7' }}>{stats.active_rules_count || activeRules.length} <span style={{ fontSize: '12px', color: '#94A3B8' }}>reglas activas</span></div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Tarifas especiales B2B</div>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #E2E8F0', paddingBottom: '2px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '800',
              color: activeTab === 'orders' ? '#0fa4de' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid #0fa4de' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <span>📦</span>
            <span>Mis Compras y Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '800',
              color: activeTab === 'profile' ? '#0fa4de' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid #0fa4de' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <span>🏢</span>
            <span>Mi Ficha Corporativa & Contactos</span>
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '800',
              color: activeTab === 'discounts' ? '#0fa4de' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'discounts' ? '3px solid #0fa4de' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <span>🏷️</span>
            <span>Mis Descuentos y Condiciones</span>
          </button>
        </div>

        {/* ── TAB 1: MIS COMPRAS Y PEDIDOS ── */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `Todos los Pedidos (${orders.length})` },
                { key: 'procesando', label: `En Proceso (${orders.filter(o => ['procesando', 'pending', 'pendiente', 'paid'].includes(o.status)).length})` },
                { key: 'en_camino', label: `En Tránsito (${orders.filter(o => ['en_camino', 'shipped'].includes(o.status)).length})` },
                { key: 'entregado', label: `Entregados (${orders.filter(o => ['entregado', 'completed'].includes(o.status)).length})` }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: orderFilter === f.key ? '#0fa4de' : '#CBD5E1',
                    background: orderFilter === f.key ? '#E0F2FE' : '#FFFFFF',
                    color: orderFilter === f.key ? '#0369A1' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
                <p>Cargando tus compras...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                <h3 style={{ margin: '0 0 8px', color: '#071524', fontWeight: '800' }}>No tienes pedidos en esta categoría</h3>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 20px' }}>Explora el catálogo mayorista de DACAS para armar tu cotización o compra.</p>
                <button
                  onClick={() => navigate('/shop')}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Ir al Catálogo de Productos →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredOrders.map(order => {
                  const badge = getStatusBadge(order.status);
                  const orderDate = new Date(order.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1.5px solid #E2E8F0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Order Card Header */}
                      <div style={{
                        background: '#F8FAFC',
                        padding: '16px 24px',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '900', fontSize: '16px', color: '#071524' }}>
                            PEDIDO #{order.id}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>
                            📅 {orderDate}
                          </span>
                          {order.payment_method && (
                            <span style={{ fontSize: '12px', background: '#F1F5F9', color: '#334155', padding: '3px 10px', borderRadius: '6px', fontWeight: '600' }}>
                              💳 {order.payment_method}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div style={{
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          fontSize: '12px',
                          fontWeight: '800',
                          padding: '5px 14px',
                          borderRadius: '999px'
                        }}>
                          {badge.label}
                        </div>
                      </div>

                      {/* Stepper Progress Bar */}
                      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                          
                          {/* Progress Line */}
                          <div style={{
                            position: 'absolute',
                            top: '14px',
                            left: '30px',
                            right: '30px',
                            height: '4px',
                            background: '#E2E8F0',
                            zIndex: 1
                          }}>
                            <div style={{
                              height: '100%',
                              background: '#0fa4de',
                              width: badge.step === 1 ? '10%' : badge.step === 2 ? '40%' : badge.step === 3 ? '75%' : '100%',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>

                          {/* Step 1 */}
                          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: badge.step >= 1 ? '#0fa4de' : '#E2E8F0',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '800', margin: '0 auto 6px'
                            }}>
                              1
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: badge.step >= 1 ? '#071524' : '#94A3B8' }}>
                              Recibido
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: badge.step >= 2 ? '#0fa4de' : '#E2E8F0',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '800', margin: '0 auto 6px'
                            }}>
                              2
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: badge.step >= 2 ? '#071524' : '#94A3B8' }}>
                              Preparación IT
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: badge.step >= 3 ? '#0fa4de' : '#E2E8F0',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '800', margin: '0 auto 6px'
                            }}>
                              3
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: badge.step >= 3 ? '#0fa4de' : '#94A3B8' }}>
                              En Despacho
                            </span>
                          </div>

                          {/* Step 4 */}
                          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: badge.step >= 4 ? '#10b981' : '#E2E8F0',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '800', margin: '0 auto 6px'
                            }}>
                              4
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: badge.step >= 4 ? '#10b981' : '#94A3B8' }}>
                              Entregado
                            </span>
                          </div>
                        </div>

                        {order.tracking_number && (
                          <div style={{ marginTop: '14px', fontSize: '12px', color: '#0369A1', background: '#F0F9FF', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span>🚚</span>
                            <span>Guía de Seguimiento: <strong>{order.tracking_number}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div style={{ padding: '16px 24px' }}>
                        {order.items && order.items.length > 0 ? (
                          order.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                              ) : (
                                <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>
                                  {item.product_name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                  {item.brand && <span>Marca: <strong>{item.brand}</strong> · </span>}
                                  {item.sku && <span>SKU: {item.sku} · </span>}
                                  <span>Cantidad: <strong>{item.quantity}</strong></span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', color: '#0fa4de', fontSize: '15px' }}>
                                  ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)} USD
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                                  ${parseFloat(item.price_at_purchase).toFixed(2)} c/u
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '13px', color: '#64748B', padding: '10px 0' }}>Detalles de productos no disponibles.</div>
                        )}
                      </div>

                      {/* Order Footer Total & Actions */}
                      <div style={{
                        padding: '16px 24px',
                        background: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          {parseFloat(order.discount_applied || 0) > 0 && (
                            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', marginRight: '14px' }}>
                              🏷️ Ahorro B2B: -${parseFloat(order.discount_applied).toFixed(2)} USD
                            </span>
                          )}
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#071524' }}>
                            Total Facturado: <span style={{ color: '#0fa4de', fontSize: '1.2rem' }}>${parseFloat(order.total).toFixed(2)} USD</span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setSelectedOrderForVoucher(order)}
                            style={{
                              background: '#FFFFFF',
                              color: '#071524',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '10px',
                              padding: '8px 16px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span>📄</span>
                            <span>Ver Proforma / Remito</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MI FICHA CORPORATIVA & CONTACTOS ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
            
            {/* Left: Detailed Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524' }}>
                  🏢 Datos de la Empresa y Facturación
                </h2>
                <button
                  onClick={() => setEditProfileOpen(true)}
                  style={{
                    background: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid #BAE6FD',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Editar Contactos Rápidos
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Razón Social</label>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#071524', marginTop: '2px' }}>{profileData?.razon_social || profileData?.name || 'N/A'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Identificación Fiscal (CUIT / NIT)</label>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#071524', marginTop: '2px' }}>{profileData?.numero_nit || 'N/A'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Tipo de Cliente</label>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0fa4de', marginTop: '2px' }}>{profileData?.tipo_cliente || 'Integrador IT'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>País y Jurisdicción</label>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#071524', marginTop: '2px' }}>{profileData?.country_name || 'Argentina'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Dirección Legal / Fiscal</label>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginTop: '2px' }}>{profileData?.direccion_legal || 'No especificada'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Dirección de Entrega Predeterminada</label>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginTop: '2px' }}>{profileData?.direccion_entrega || 'Depósito Central'}</div>
                </div>
              </div>

              {/* Responsables de Sector */}
              <h3 style={{ margin: '24px 0 14px', fontSize: '1.05rem', fontWeight: '800', color: '#071524', borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                👥 Contactos Designados
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0fa4de', marginBottom: '6px' }}>📦 Responsable de Compras</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524' }}>{profileData?.nombre_compras || 'No especificado'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{profileData?.telefono_compras || ''}</div>
                  <div style={{ fontSize: '12px', color: '#0369A1' }}>{profileData?.email_compras || ''}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>💳 Responsable de Pagos & Finanzas</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#071524' }}>{profileData?.nombre_pagos || 'No especificado'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{profileData?.telefono_pagos || ''}</div>
                  <div style={{ fontSize: '12px', color: '#0369A1' }}>{profileData?.email_pagos || ''}</div>
                </div>
              </div>
            </div>

            {/* Right: Change Requests History */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#071524' }}>
                  📋 Solicitudes de Cambio
                </h3>
                <button
                  onClick={() => setChangeModalOpen(true)}
                  style={{
                    background: '#0fa4de',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  + Nueva
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                Historial de modificaciones solicitadas a DACAS (cambio de CUIT, razón social, línea de crédito, etc.).
              </p>

              {changeRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px' }}>
                  No has enviado solicitudes de modificación recientes.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {changeRequests.map(cr => (
                    <div key={cr.id} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '12.5px', color: '#071524' }}>{cr.request_type}</span>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: cr.status === 'aprobado' ? '#DCFCE7' : '#FEF3C7',
                          color: cr.status === 'aprobado' ? '#15803D' : '#B45309'
                        }}>
                          {cr.status === 'aprobado' ? '✓ Aprobado' : '⏳ En Revisión'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{cr.details}</p>
                      <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{new Date(cr.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: MIS DESCUENTOS Y CONDICIONES ── */}
        {activeTab === 'discounts' && (
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '28px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '900', color: '#071524' }}>
              🏷️ Condiciones Comerciales y Descuentos Activos
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 24px' }}>
              Estas son las tarifas de precios mayoristas y bonificaciones automáticas aplicadas en tu cuenta para cotizaciones y pedidos en DACAS.
            </p>

            {activeRules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏷️</div>
                <p>Tu cuenta cuenta con la lista de precios mayorista estándar para tu categoría.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {activeRules.map(rule => (
                  <div key={rule.id} style={{
                    background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
                    border: '1.5px solid #BAE6FD',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(15,164,222,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        background: '#0fa4de',
                        color: '#fff',
                        fontWeight: '900',
                        fontSize: '14px',
                        padding: '4px 10px',
                        borderRadius: '8px'
                      }}>
                        {rule.value_type === 'percentage' ? `-${parseFloat(rule.value)}%` : `-$${parseFloat(rule.value)} USD`}
                      </span>
                      <span style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700', background: '#E0F2FE', padding: '2px 8px', borderRadius: '999px' }}>
                        {rule.user_id ? 'Exclusivo para tu Empresa' : 'Convenio de Categoría'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '14.5px', fontWeight: '800', color: '#071524' }}>
                      {rule.name}
                    </h4>

                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                      {rule.brand && <div>• Marca aplicable: <strong>{rule.brand}</strong></div>}
                      {rule.tipo_cliente && <div>• Categoría: <strong>{rule.tipo_cliente}</strong></div>}
                      <div>• Aplicación automática: <strong>En Catálogo y Carrito</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL: SOLICITAR MODIFICACIÓN DE DATOS ── */}
      {changeModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 21, 36, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '540px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'scaleUp 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524' }}>
                📝 Solicitar Modificación de Datos
              </h3>
              <button
                onClick={() => setChangeModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 20px', lineHeight: '1.5' }}>
              Ingresa los detalles de la modificación que necesitas realizar en tu cuenta corporativa. Nuestro equipo de administración revisará y actualizará tu ficha.
            </p>

            <form onSubmit={handleSubmitChangeRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                  Tipo de Modificación *
                </label>
                <select
                  value={changeForm.request_type}
                  onChange={e => setChangeForm({ ...changeForm, request_type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#fff', color: '#071524' }}
                >
                  <option value="Actualización de Domicilio de Entrega">Actualización de Domicilio de Entrega</option>
                  <option value="Cambio de Razón Social / CUIT">Cambio de Razón Social / CUIT</option>
                  <option value="Actualización de Contactos de Compras / Pagos">Actualización de Contactos de Compras / Pagos</option>
                  <option value="Solicitud de Ampliación de Línea de Crédito">Solicitud de Ampliación de Línea de Crédito</option>
                  <option value="Cambio de Condición de Facturación / IVA">Cambio de Condición de Facturación / IVA</option>
                  <option value="Otro Requerimiento Administrativo">Otro Requerimiento Administrativo</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                  Detalles del cambio requerido *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe con exactitud los nuevos datos (ej: Nueva dirección, CUIT, nombre del nuevo responsable, etc.)"
                  value={changeForm.details}
                  onChange={e => setChangeForm({ ...changeForm, details: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#071524' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                  Teléfono / WhatsApp de contacto para validar
                </label>
                <input
                  type="text"
                  placeholder="+54 11 4444-5555"
                  value={changeForm.phone_contact}
                  onChange={e => setChangeForm({ ...changeForm, phone_contact: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#071524' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setChangeModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingChange}
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
                >
                  {submittingChange ? 'Enviando...' : 'Enviar Solicitud a DACAS →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR CONTACTOS RÁPIDOS ── */}
      {editProfileOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 21, 36, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524' }}>
                ✏️ Actualizar Contactos y Domicilio
              </h3>
              <button
                onClick={() => setEditProfileOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Nombre Contacto Principal</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', color: '#071524' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Teléfono General</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', color: '#071524' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Dirección de Entrega</label>
                <input
                  type="text"
                  value={editForm.direccion_entrega}
                  onChange={e => setEditForm({ ...editForm, direccion_entrega: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', color: '#071524' }}
                />
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0fa4de', fontWeight: '800' }}>Sector Compras</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    placeholder="Nombre Compras"
                    value={editForm.nombre_compras}
                    onChange={e => setEditForm({ ...editForm, nombre_compras: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', color: '#071524' }}
                  />
                  <input
                    placeholder="Email Compras"
                    value={editForm.email_compras}
                    onChange={e => setEditForm({ ...editForm, email_compras: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', color: '#071524' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#10b981', fontWeight: '800' }}>Sector Pagos / Tesorería</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    placeholder="Nombre Pagos"
                    value={editForm.nombre_pagos}
                    onChange={e => setEditForm({ ...editForm, nombre_pagos: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', color: '#071524' }}
                  />
                  <input
                    placeholder="Email Pagos"
                    value={editForm.email_pagos}
                    onChange={e => setEditForm({ ...editForm, email_pagos: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', color: '#071524' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#fff', fontWeight: '800', cursor: 'pointer' }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PROFORMA / VOUCHER DE PEDIDO ── */}
      {selectedOrderForVoucher && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 21, 36, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            color: '#071524'
          }}>
            {/* Voucher Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #071524', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0fa4de' }}>DACAS S.A.</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Distribuidor Mayorista de Valor Agregado</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>info@dacas.com · www.dacas.com</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>COMPROBANTE DE COMPRA</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0fa4de' }}>ORDEN #{selectedOrderForVoucher.id}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{new Date(selectedOrderForVoucher.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Voucher Client Info */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '12.5px', lineHeight: '1.6' }}>
              <div><strong>Cliente:</strong> {profileData?.razon_social || clientUser?.razon_social || 'Cliente DACAS'}</div>
              <div><strong>CUIT / NIT:</strong> {profileData?.numero_nit || '30-12345678-9'}</div>
              <div><strong>Entrega en:</strong> {selectedOrderForVoucher.shipping_address || 'Dirección registrada'}</div>
              <div><strong>Condición de Pago:</strong> {selectedOrderForVoucher.payment_method || 'Cuenta Corriente'}</div>
            </div>

            {/* Voucher Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#071524', color: '#fff', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Item</th>
                  <th style={{ padding: '8px 10px' }}>SKU / Marca</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cant.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unitario</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderForVoucher.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{item.product_name}</td>
                    <td style={{ padding: '10px', color: '#64748B' }}>{item.brand || 'DACAS'} ({item.sku || 'N/A'})</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: '#0fa4de' }}>
                      ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Voucher Total */}
            <div style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: '900', color: '#071524', marginBottom: '24px' }}>
              Total: <span style={{ color: '#0fa4de' }}>${parseFloat(selectedOrderForVoucher.total).toFixed(2)} USD</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#071524',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🖨️ Imprimir / Guardar PDF
              </button>
              <button
                onClick={() => setSelectedOrderForVoucher(null)}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
