import React, { useState, useEffect, useRef, useMemo } from 'react';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

export default function NotificationBell({ usuario, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'erp', 'crm', 'ecommerce'
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const userRole = usuario?.rol || 'admin';
  const isAdmin = userRole === 'admin';

  // Compose Notification Form State (Solo para Administrador)
  const [composeForm, setComposeForm] = useState({
    title: '',
    message: '',
    category: 'general', // 'general', 'erp', 'crm', 'ecommerce'
    severity: 'info',    // 'info', 'warning', 'danger', 'success'
    targetAudience: 'all', // 'all' o 'roles'
    selectedRoles: ['admin', 'admin_erp', 'admin_ecommerce', 'staff', 'vendedor', 'pm']
  });
  const [submittingNotification, setSubmittingNotification] = useState(false);
  const [composeFeedback, setComposeFeedback] = useState(null);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?role=${encodeURIComponent(userRole)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling cada 20s
    return () => clearInterval(interval);
  }, [userRole]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all?role=${encodeURIComponent(userRole)}`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dismiss / delete single notification
  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Enviar notificación (exclusivo para el Administrador)
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setComposeFeedback({ error: true, msg: 'Solo el rol de Administrador puede mandar notificaciones al resto de los usuarios.' });
      return;
    }
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      setComposeFeedback({ error: true, msg: 'Por favor completa el título y el mensaje de la notificación.' });
      return;
    }

    try {
      setSubmittingNotification(true);
      setComposeFeedback(null);

      const targetCategory = composeForm.category === 'general' ? 'crm' : composeForm.category;
      const targetView = composeForm.category === 'general' ? null : composeForm.category;

      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: usuario.rol,
          senderName: usuario.nombre || 'Administrador',
          sesionId: usuario.sesionId,
          title: composeForm.title.trim(),
          message: composeForm.message.trim(),
          category: targetCategory,
          severity: composeForm.severity,
          targetView: targetView,
          actionLabel: targetView === 'erp' ? 'Ver en ERP' : targetView === 'ecommerce' ? 'Ver en E-Com' : 'Ver Detalles',
          roles: composeForm.targetAudience === 'all'
            ? ['admin', 'admin_erp', 'admin_ecommerce', 'staff', 'vendedor', 'pm', 'manager', 'cliente']
            : composeForm.selectedRoles
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComposeFeedback({ error: false, msg: '¡Notificación enviada con éxito a todos los usuarios correspondientes!' });
        setNotifications(prev => [data.notification, ...prev]);
        setTimeout(() => {
          setIsComposing(false);
          setComposeFeedback(null);
          setComposeForm({
            title: '',
            message: '',
            category: 'general',
            severity: 'info',
            targetAudience: 'all',
            selectedRoles: ['admin', 'admin_erp', 'admin_ecommerce', 'staff', 'vendedor', 'pm']
          });
        }, 1200);
      } else {
        setComposeFeedback({ error: true, msg: data.error || 'No se pudo enviar la notificación.' });
      }
    } catch (err) {
      setComposeFeedback({ error: true, msg: 'Error al conectar con el servidor para mandar la notificación.' });
    } finally {
      setSubmittingNotification(false);
    }
  };

  // Click on notification item
  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    if (onNavigate) {
      onNavigate(notif.targetView, notif.targetTab, { ticketId: notif.ticketId, orderId: notif.orderId });
    } else {
      if (notif.targetView === 'erp') {
        window.location.href = '/admin/erp';
      } else if (notif.targetView === 'ecommerce') {
        window.location.href = '/admin/ecommerce';
      } else if (notif.targetView === 'crm') {
        window.location.href = '/';
      }
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      erp: notifications.filter(n => n.category === 'erp').length,
      crm: notifications.filter(n => n.category === 'crm').length,
      ecommerce: notifications.filter(n => n.category === 'ecommerce').length
    };
  }, [notifications]);

  const formatRelativeTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Ahora mismo';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      return `Hace ${diffDays} días`;
    } catch {
      return 'Reciente';
    }
  };

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'erp':
        return { label: 'ERP', color: '#0fa4de', bg: 'rgba(15, 164, 222, 0.12)', icon: 'activity' };
      case 'crm':
        return { label: 'CRM', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', icon: 'ticket' };
      case 'ecommerce':
        return { label: 'E-Commerce', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'shopping-bag' };
      default:
        return { label: 'Sistema', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', icon: 'bell' };
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Botón Campana con Insignia */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Centro de Notificaciones (ERP, CRM, E-Commerce)"
        style={{
          background: isOpen ? 'var(--primary, #0fa4de)' : 'var(--pill-bg, #f1f5f9)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: isOpen ? '#ffffff' : 'var(--text-main, #0f172a)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none'
        }}
      >
        <BrandingVectorIcon name="bell" size={18} color="currentColor" />

        {/* Badge contador sin leer */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '10.5px',
              fontWeight: '900',
              padding: '1px 5px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--card-bg, #ffffff)',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)',
              animation: 'notificationPulse 2s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover / Panel de Notificaciones Flotante */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            right: 0,
            width: '410px',
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '18px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 99999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header del Centro de Notificaciones */}
          <div
            style={{
              padding: '16px 18px 12px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--pill-bg, #f8fafc)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="bell" size={17} color="#0fa4de" />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '12px'
                    }}
                  >
                    {unreadCount} nuevas
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Botón Mandar Notificación: SOLO visible si el usuario tiene rol de Administrador */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsComposing(true)}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 11px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(15, 164, 222, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Mandar Notificación a los Usuarios (Exclusivo Administrador)"
                  >
                    <span>+ Mandar Notificación</span>
                  </button>
                )}

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary, #0fa4de)',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '6px'
                    }}
                  >
                    Marcar leídas
                  </button>
                )}
              </div>
            </div>

            {/* Pestañas de Filtro (Todas / ERP / CRM / E-Commerce) */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg, #ffffff)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
              {[
                { id: 'all', label: 'Todas', count: counts.all },
                { id: 'erp', label: 'ERP', count: counts.erp },
                { id: 'crm', label: 'CRM', count: counts.crm },
                { id: 'ecommerce', label: 'E-Com', count: counts.ecommerce }
              ].map(f => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'var(--primary, #0fa4de)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-muted, #64748b)',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{
                      fontSize: '10px',
                      opacity: isSelected ? 0.9 : 0.7,
                      fontWeight: '800'
                    }}>
                      ({f.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuerpo con Scroll de Notificaciones */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '8px'
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ opacity: 0.4 }}>
                  <BrandingVectorIcon name="bell" size={36} color="currentColor" />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>Sin notificaciones</div>
                <div style={{ fontSize: '11.5px', maxWidth: '240px' }}>
                  No hay alertas pendientes en la categoría seleccionada.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredNotifications.map(n => {
                  const catMeta = getCategoryMeta(n.category);

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: n.read ? 'var(--card-bg, #ffffff)' : 'rgba(15, 164, 222, 0.05)',
                        border: n.read ? '1px solid var(--border-color, #f1f5f9)' : '1px solid rgba(15, 164, 222, 0.25)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--pill-bg, #f8fafc)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'var(--card-bg, #ffffff)' : 'rgba(15, 164, 222, 0.05)'}
                    >
                      {/* Indicador de no leído */}
                      {!n.read && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: '#0fa4de',
                            boxShadow: '0 0 6px #0fa4de'
                          }}
                        />
                      )}

                      {/* Icono de Categoría */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: catMeta.bg,
                          color: catMeta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        <BrandingVectorIcon name={catMeta.icon} size={16} color={catMeta.color} />
                      </div>

                      {/* Contenido */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: !n.read ? '14px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '900',
                              color: catMeta.color,
                              background: catMeta.bg,
                              padding: '2px 6px',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {catMeta.label}
                          </span>
                          {n.emisor && (
                            <span style={{ fontSize: '10.5px', color: '#0fa4de', fontWeight: '800' }}>
                              De: {n.emisor}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>
                            • {formatRelativeTime(n.timestamp)}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: n.read ? '700' : '800', color: 'var(--text-main, #0f172a)', lineHeight: '1.3', marginBottom: '3px' }}>
                          {n.title}
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', lineHeight: '1.4' }}>
                          {n.message}
                        </div>

                        {/* Botón de acción */}
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              color: '#0fa4de',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {n.actionLabel || 'Ver'} →
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(n.id, e)}
                            title="Descartar notificación"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              fontSize: '11px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Informativo */}
          <div
            style={{
              padding: '10px 16px',
              background: 'var(--pill-bg, #f8fafc)',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              fontSize: '11px',
              color: 'var(--text-muted, #64748b)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Hub: ERP • CRM • E-Commerce</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main, #0f172a)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MANDAR NOTIFICACIÓN (EXCLUSIVO ADMINISTRADOR) */}
      {isComposing && isAdmin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(7, 21, 36, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '20px'
          }}
          onClick={() => setIsComposing(false)}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '20px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'var(--pill-bg, #f8fafc)',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <BrandingVectorIcon name="bell" size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main, #0f172a)' }}>
                    Mandar Notificación a Usuarios
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#0fa4de', fontWeight: '800' }}>
                    Autorización: Rol Administrador
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsComposing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendNotification} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {composeFeedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    background: composeFeedback.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: composeFeedback.error ? '#dc2626' : '#166534',
                    border: `1px solid ${composeFeedback.error ? '#fca5a5' : '#86efac'}`
                  }}
                >
                  {composeFeedback.msg}
                </div>
              )}

              {/* Título */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-main, #0f172a)', marginBottom: '6px' }}>
                  Título del Comunicado / Alerta *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mantenimiento programado ERP / Aviso de inventario"
                  value={composeForm.title}
                  onChange={e => setComposeForm({ ...composeForm, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'var(--text-main, #0f172a)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Mensaje */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-main, #0f172a)', marginBottom: '6px' }}>
                  Mensaje Detallado *
                </label>
                <textarea
                  rows={3}
                  placeholder="Escribe el contenido de la notificación que recibirán los usuarios en su campana..."
                  value={composeForm.message}
                  onChange={e => setComposeForm({ ...composeForm, message: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'var(--text-main, #0f172a)',
                    fontSize: '13px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Categoría / Módulo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0f172a)', marginBottom: '6px' }}>
                    Módulo Destino
                  </label>
                  <select
                    value={composeForm.category}
                    onChange={e => setComposeForm({ ...composeForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-color, #cbd5e1)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--text-main, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="general">📢 General (Todos)</option>
                    <option value="erp">🏢 ERP OneWorld</option>
                    <option value="crm">🎯 CRM & Soporte</option>
                    <option value="ecommerce">🛒 E-Commerce & Tienda</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0f172a)', marginBottom: '6px' }}>
                    Nivel de Prioridad
                  </label>
                  <select
                    value={composeForm.severity}
                    onChange={e => setComposeForm({ ...composeForm, severity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-color, #cbd5e1)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--text-main, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="info">ℹ️ Informativa (Normal)</option>
                    <option value="warning">⚠️ Advertencia Operativa</option>
                    <option value="danger">🚨 Urgente / Crítica</option>
                    <option value="success">✅ Éxito / Confirmación</option>
                  </select>
                </div>
              </div>

              {/* Destinatarios */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0f172a)', marginBottom: '6px' }}>
                  Alcance de Usuarios
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-main, #0f172a)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetAudience"
                      checked={composeForm.targetAudience === 'all'}
                      onChange={() => setComposeForm({ ...composeForm, targetAudience: 'all' })}
                    />
                    <span>A todos los usuarios del sistema</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-main, #0f172a)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetAudience"
                      checked={composeForm.targetAudience === 'roles'}
                      onChange={() => setComposeForm({ ...composeForm, targetAudience: 'roles' })}
                    />
                    <span>Solo roles operativos (Vendedores, ERP, Staff)</span>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  disabled={submittingNotification}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--pill-bg, #f1f5f9)',
                    color: 'var(--text-main, #0f172a)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingNotification}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: submittingNotification ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    opacity: submittingNotification ? 0.7 : 1
                  }}
                >
                  {submittingNotification ? 'Enviando...' : 'Mandar Notificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyframe animation inline style */}
      <style>{`
        @keyframes notificationPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); }
          100% { transform: scale(1); }
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
