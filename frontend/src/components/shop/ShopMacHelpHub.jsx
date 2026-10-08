import React, { useState, useEffect, useRef } from 'react';
import BrandingVectorIcon from '../../BrandingVectorIcon';
import { API_BASE_URL } from '../../apiConfig';

/* ── Unified macOS Dock Fan / Stack Help Hub Widget (Solo Usuarios Logueados + Confirmación de Datos) ── */
export default function ShopMacHelpHub({ clientUser, generalSettings, onSelectProduct, navigate, onOpenAuth }) {
  if (!clientUser) return null;

  const [isFanOpen, setIsFanOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'ai' | 'whatsapp' | 'support' | 'confirm_data' | null
  const [pendingTargetChannel, setPendingTargetChannel] = useState(null); // 'ai' | 'whatsapp' | 'support' | 'orders'
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [hubHovered, setHubHovered] = useState(false);
  const [botConfig, setBotConfig] = useState(null);

  // Formulario de confirmación de datos
  const [confirmForm, setConfirmForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    cuit: ''
  });

  // Inicializar formulario con los datos del usuario logueado
  useEffect(() => {
    if (clientUser) {
      setConfirmForm({
        company: clientUser.razon_social || clientUser.empresa || clientUser.name || '',
        contactName: clientUser.name || '',
        email: clientUser.email || '',
        phone: clientUser.telefono || clientUser.phone || '',
        cuit: clientUser.cuit || clientUser.documento || 'Verificado'
      });
    } else {
      setDataConfirmed(false);
    }
  }, [clientUser]);

  // n8n AI Agent Chat State
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInputVal, setAiInputVal] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const aiMessagesEndRef = useRef(null);
  const hubRef = useRef(null);

  // Reset/Iniciar mensajes del Copilot con los datos confirmados
  useEffect(() => {
    if (confirmForm.company || clientUser) {
      const companyLabel = confirmForm.company || clientUser?.razon_social || 'su empresa';
      const contactLabel = confirmForm.contactName || clientUser?.name || 'Estimado/a';
      setAiMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `👋 ¡Hola **${contactLabel}** (**${companyLabel}**)! Tus credenciales B2B han sido validadas.\n\nSoy el **Copilot de IA de DACAS B2B**. Puedo consultar stock en tiempo real, recomendarte soluciones de networking y ciberseguridad o preparar cotizaciones directas para tu cuenta.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: []
        }
      ]);
    }
  }, [dataConfirmed, clientUser]);

  // Cargar configuración de n8n bot
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot`)
      .then(res => res.json())
      .then(data => setBotConfig(data))
      .catch(() => { });
  }, []);

  // Scroll automático en el chat de IA
  useEffect(() => {
    if (activeModal === 'ai') {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiIsTyping, activeModal]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        setIsFanOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Interceptor para abrir canales: Requiere Confirmación de Datos
  const handleOpenChannel = (channelId) => {
    setIsFanOpen(false);

    // Si no ha confirmado los datos en esta sesión, pedir confirmación
    if (!dataConfirmed) {
      setPendingTargetChannel(channelId);
      setActiveModal('confirm_data');
      return;
    }

    // Si ya confirmó los datos, abrir el canal directamente
    if (channelId === 'orders') {
      navigate('/shop/portal');
    } else {
      setActiveModal(channelId);
    }
  };

  // Confirmar formulario de datos
  const handleConfirmDataSubmit = (e) => {
    e?.preventDefault();
    if (!confirmForm.company.trim() || !confirmForm.contactName.trim() || !confirmForm.email.trim()) {
      alert('Por favor complete Empresa, Nombre de Contacto y Email.');
      return;
    }

    setDataConfirmed(true);
    const target = pendingTargetChannel || 'ai';
    setPendingTargetChannel(null);

    if (target === 'orders') {
      setActiveModal(null);
      navigate('/shop/portal');
    } else {
      setActiveModal(target);
    }
  };

  // Enviar mensaje al agente de n8n
  const handleSendAiMessage = async (customText = null) => {
    const textToSend = customText || aiInputVal;
    if (!textToSend.trim() || aiIsTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    if (!customText) setAiInputVal('');
    setAiIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/n8n-bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId: clientUser ? `client_${clientUser.id}` : 'b2b_verified',
          userContext: {
            name: confirmForm.contactName || clientUser?.name,
            company: confirmForm.company || clientUser?.razon_social,
            email: confirmForm.email || clientUser?.email,
            phone: confirmForm.phone || clientUser?.telefono,
            cuit: confirmForm.cuit || clientUser?.cuit
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.response,
            recommendedProducts: data.recommendedProducts || [],
            toolUsed: data.toolUsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || 'Error al procesar');
      }
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Disculpa, tuve un inconveniente temporal para conectar con el agente n8n. Por favor prueba con otra consulta o contáctanos directo por WhatsApp.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiIsTyping(false);
    }
  };

  // WhatsApp datos personalizados con la información confirmada
  const rawNumber = generalSettings?.whatsappNumber || '+5491141103300';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const companyInfo = confirmForm.company ? ` desde *${confirmForm.company}* (Contacto: ${confirmForm.contactName})` : '';
  const defaultMsg = `¡Hola DACAS! Me contacto${companyInfo} a través del Shop Mayorista B2B para solicitar asesoramiento comercial y cotizaciones.`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;

  const isWhatsappEnabled = generalSettings?.whatsappEnabled !== false;
  const isAiEnabled = botConfig?.enabled !== false;

  // Acciones del Stack/Fan de Mac
  const fanItems = [
    ...(isAiEnabled ? [{
      id: 'ai',
      label: 'Asistente IA B2B (n8n)',
      badge: 'En Línea',
      badgeColor: '#0fa4de',
      badgeBg: 'rgba(15, 164, 222, 0.15)',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #0fa4de 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(15, 164, 222, 0.45)',
          border: '2px solid #38bdf8'
        }}>
          <BrandingVectorIcon name="bot" size={24} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('ai')
    }] : []),
    ...(isWhatsappEnabled ? [{
      id: 'whatsapp',
      label: 'WhatsApp Comercial',
      badge: 'Directo',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(37, 211, 102, 0.45)',
          border: '2px solid #86efac'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
      ),
      action: () => handleOpenChannel('whatsapp')
    }] : []),
    {
      id: 'support',
      label: 'Mesa de Ayuda & Soporte',
      badge: 'Help Desk',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(2, 132, 199, 0.45)',
          border: '2px solid #7dd3fc',
          color: '#ffffff'
        }}>
          <BrandingVectorIcon name="headphones" size={22} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('support')
    },
    {
      id: 'orders',
      label: 'Mis Compras & Tracking',
      badge: 'Portal B2B',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(99, 102, 241, 0.45)',
          border: '2px solid #c7d2fe',
          color: '#ffffff'
        }}>
          <BrandingVectorIcon name="box" size={22} color="#ffffff" />
        </div>
      ),
      action: () => handleOpenChannel('orders')
    }
  ];

  return (
    <div
      ref={hubRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <style>{`
        @keyframes macFanIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes macModalIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mac-fan-pill-hover:hover {
          background: rgba(255, 255, 255, 0.98) !important;
          transform: translateX(-4px) scale(1.03) !important;
          box-shadow: 0 10px 28px rgba(7, 21, 36, 0.22) !important;
        }
        .mac-fan-icon-hover:hover {
          transform: scale(1.12) !important;
        }
      `}</style>

      {/* ── MODAL DE CONFIRMACIÓN DE DATOS (REQUERIDO ANTES DE ASISTENCIA) ── */}
      {activeModal === 'confirm_data' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0a2540 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #10B981'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <BrandingVectorIcon name="clipboard" size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF' }}>Confirmación de Datos</div>
                <div style={{ fontSize: '11px', color: '#86EFAC' }}>Valida tu cuenta B2B para continuar</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <BrandingVectorIcon name="x" size={14} color="#FFFFFF" />
            </button>
          </div>

          <form onSubmit={handleConfirmDataSubmit} style={{ padding: '18px', background: '#F8FAFC' }}>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748B', lineHeight: '1.45' }}>
              Por favor confirma los datos de contacto de tu empresa para asociar tu consulta y cotizaciones:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Razón Social / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={confirmForm.company}
                  onChange={(e) => setConfirmForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Ej: Conectividad SA"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Nombre del Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={confirmForm.contactName}
                  onChange={(e) => setConfirmForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={confirmForm.email}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mail@empresa.com"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    value={confirmForm.phone}
                    onChange={(e) => setConfirmForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 9 11..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              {confirmForm.cuit && (
                <div style={{ fontSize: '11px', color: '#64748B', background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px' }}>
                  CUIT / ID Fiscal: <strong>{confirmForm.cuit}</strong>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <BrandingVectorIcon name="check" size={16} color="#FFFFFF" />
              <span>Confirmar Datos y Continuar</span>
              <BrandingVectorIcon name="arrow-right" size={14} color="#FFFFFF" />
            </button>
          </form>
        </div>
      )}

      {/* ── 1. MODAL DEL ASISTENTE DE IA (N8N COPILOT) ── */}
      {activeModal === 'ai' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 36px)',
            height: '560px',
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #034870 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #0fa4de'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 12px rgba(15, 164, 222, 0.45)'
                }}
              >
                <BrandingVectorIcon name="bot" size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {botConfig?.botName || 'DACAS AI Copilot'}
                  <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.25)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                    n8n Agent
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }}></span>
                  {confirmForm.company ? `${confirmForm.company} · Online` : 'Online · Asesoría B2B'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveModal('confirm_data')}
                title="Editar / Reconfirmar Datos"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <BrandingVectorIcon name="edit" size={11} color="#ffffff" />
                <span>Datos</span>
              </button>
              <button
                type="button"
                onClick={() => setAiMessages([
                  {
                    id: 'welcome_reset',
                    sender: 'bot',
                    text: `👋 Chat reiniciado para **${confirmForm.company || 'su empresa'}**. ¿Sobre qué producto o solución deseas consultar?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                title="Limpiar Conversación"
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="rotate-ccw" size={14} color="#94A3B8" />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <BrandingVectorIcon name="x" size={14} color="#ffffff" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              background: '#F8FAFC',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {aiMessages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '12px 14px',
                      borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      background: isBot ? '#FFFFFF' : 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: isBot ? '#1E293B' : '#FFFFFF',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      border: isBot ? '1px solid #E2E8F0' : 'none',
                      boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.04)' : '0 3px 10px rgba(15, 164, 222, 0.3)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {m.text}

                    {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: isBot ? '#0369A1' : '#E0F2FE', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <BrandingVectorIcon name="package" size={13} color={isBot ? '#0369A1' : '#E0F2FE'} />
                          <span>Productos Disponibles:</span>
                        </div>
                        {m.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(p);
                              setActiveModal(null);
                            }}
                            style={{
                              background: '#F0F9FF',
                              border: '1px solid #BAE6FD',
                              borderRadius: '10px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              gap: '8px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: '750', fontSize: '11.5px', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: '700' }}>
                                USD ${Number(p.price || 0).toLocaleString()} · Stock: {p.stock > 0 ? `${p.stock} un.` : 'A Pedido'}
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              Ver <BrandingVectorIcon name="arrow-right" size={11} color="#0284c7" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94A3B8', padding: '0 4px' }}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {aiIsTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '14px', width: 'fit-content' }}>
                <span style={{ fontSize: '11px', color: '#0fa4de', fontWeight: '700' }}>Agente n8n consultando catálogo</span>
                <BrandingVectorIcon name="clock" size={13} color="#0fa4de" />
              </div>
            )}
            <div ref={aiMessagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{ padding: '8px 12px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {(botConfig?.suggestedQuestions || [
              'Stock FortiGate 60F',
              'Switches Aruba 24p',
              'Cotizar Lote B2B'
            ]).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendAiMessage(q)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiMessage();
            }}
            style={{
              padding: '10px 14px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={aiInputVal}
              onChange={(e) => setAiInputVal(e.target.value)}
              placeholder="Escribe tu consulta sobre productos o stock..."
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!aiInputVal.trim() || aiIsTyping}
              style={{
                background: aiInputVal.trim() ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 14px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: aiInputVal.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <BrandingVectorIcon name="send" size={14} color="#ffffff" />
            </button>
          </form>
        </div>
      )}

      {/* ── 2. MODAL DE WHATSAPP COMERCIAL ── */}
      {activeModal === 'whatsapp' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '340px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0c233d 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #25D366'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(37, 211, 102, 0.45)'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.084-1.809-.395-1.423-.58-2.339-2.028-2.411-2.12-.07-.093-.578-.77-.578-1.468 0-.698.366-1.041.498-1.183.132-.142.289-.177.386-.177.097 0 .193.001.277.006.09.004.209-.034.327.249.12.288.412 1.004.448 1.077.036.074.06.16.012.256-.048.096-.072.155-.144.238-.073.084-.153.187-.218.252-.072.072-.147.151-.063.295.084.144.373.615.8 1 0 .55.498.922.99 1.139.144.063.228.055.313-.042.084-.097.362-.423.46-.568.097-.145.193-.12.326-.072.133.048.844.398.989.47.145.072.241.108.277.169.036.06.036.353-.108.758z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#FFFFFF' }}>DACAS B2B WhatsApp</div>
                <div style={{ fontSize: '11px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}></span>
                  En línea · Asesoría Comercial
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <BrandingVectorIcon name="x" size={14} color="#FFFFFF" />
            </button>
          </div>

          {/* Body Card */}
          <div style={{ padding: '16px', background: '#F8FAFC' }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '12.5px',
                color: '#334155',
                border: '1px solid #E2E8F0',
                lineHeight: '1.45',
                marginBottom: '14px'
              }}
            >
              ¡Hola <strong>{confirmForm.contactName || 'Cliente'}</strong>! Tu consulta quedará vinculada a <strong>{confirmForm.company}</strong> para respuesta comercial prioritaria.
              <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '6px', textAlign: 'right' }}>
                DACAS Corp · Respuesta prioritaria
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <span>Abrir WhatsApp Web / App</span>
              <span>→</span>
            </a>
          </div>
        </div>
      )}

      {/* ── 3. MODAL DE MESA DE AYUDA & SOPORTE ── */}
      {activeModal === 'support' && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '340px',
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 24px 60px rgba(7, 21, 36, 0.35)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'macModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0369a1 100%)',
              padding: '16px 18px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #38bdf8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrandingVectorIcon name="headphones" size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#FFFFFF' }}>Mesa de Ayuda DACAS</div>
                <div style={{ fontSize: '11px', color: '#7dd3fc' }}>Atención B2B Especializada</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <BrandingVectorIcon name="x" size={13} color="#ffffff" />
            </button>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="phone" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Central Telefónica</div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#071524' }}>
                  {generalSettings?.contactPhone || '+54 11 4110-3300'}
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="mail" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Correo de Soporte</div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#071524' }}>
                  {generalSettings?.contactEmail || 'soporte@dacas.com'}
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrandingVectorIcon name="clock" size={20} color="#0fa4de" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Horario de Atención</div>
                <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#071524' }}>
                  Lunes a Viernes 09:00 - 18:00 hs
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DESPLEGABLE ESTILO ABANICO / PILA DE MAC (DOCK FAN MENU) ── */}
      {isFanOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            right: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px',
            zIndex: 9998,
            pointerEvents: 'auto'
          }}
        >
          {fanItems.map((item, idx) => {
            const delay = (fanItems.length - 1 - idx) * 0.05;
            return (
              <div
                key={item.id}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  animation: `macFanIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Text Capsule / Pill (Estilo Mac Glassmorphism) */}
                <div
                  className="mac-fan-pill-hover"
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    boxShadow: '0 6px 20px rgba(7, 21, 36, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span style={{ fontWeight: '750', fontSize: '13px', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: item.badgeColor,
                        background: item.badgeBg,
                        padding: '2px 7px',
                        borderRadius: '999px'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Circular Icon Pill (Estilo Dock Icon) */}
                <div
                  className="mac-fan-icon-hover"
                  style={{
                    flexShrink: 0,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {item.icon}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. BOTÓN PRINCIPAL FLOTANTE ESTILO MAC ── */}
      <button
        type="button"
        onClick={() => {
          if (activeModal) {
            setActiveModal(null);
          } else {
            setIsFanOpen(!isFanOpen);
          }
        }}
        onMouseEnter={() => setHubHovered(true)}
        onMouseLeave={() => setHubHovered(false)}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: isFanOpen || activeModal
            ? 'linear-gradient(135deg, #071524 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #071524 0%, #0a2540 50%, #0fa4de 100%)',
          border: '2px solid rgba(56, 189, 248, 0.6)',
          boxShadow: hubHovered || isFanOpen
            ? '0 10px 28px rgba(15, 164, 222, 0.55), 0 0 0 5px rgba(15, 164, 222, 0.2)'
            : '0 6px 22px rgba(7, 21, 36, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: hubHovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          color: '#FFFFFF',
          outline: 'none'
        }}
        title="Centro de Asistencia y Agentes B2B"
      >
        {isFanOpen || activeModal ? (
          <BrandingVectorIcon name="x" size={24} color="#FFFFFF" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M12 7v2" />
              <path d="M12 13h.01" />
            </svg>
          </div>
        )}

        {/* Pulse Dot Indicator */}
        {!isFanOpen && !activeModal && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              background: clientUser ? '#10B981' : '#38BDF8',
              border: '2px solid #FFFFFF',
              boxShadow: clientUser ? '0 0 0 2px rgba(16, 185, 129, 0.6)' : '0 0 0 2px rgba(56, 189, 248, 0.6)'
            }}
          />
        )}
      </button>
    </div>
  );
}
