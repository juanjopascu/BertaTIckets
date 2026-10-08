import React, { useState } from 'react';

export const DEFAULT_N8N_WORKFLOW_TEMPLATE = {
  name: 'DACAS E-Commerce AI Agent Workflow',
  nodes: [],
  connections: {},
  settings: { executionOrder: 'v1' }
};

export default function AiBotTab({
  n8nConfig = {},
  setN8nConfig,
  n8nTesting,
  handleTestN8nConnection,
  n8nTestResult,
  n8nSaveSuccess,
  n8nSubTab,
  setN8nSubTab,
  handleResetN8nSettings,
  handleSaveN8nSettings,
  isSavingN8n,
  playgroundMessages = [],
  setPlaygroundMessages,
  playgroundInput = '',
  setPlaygroundInput,
  isPlaygroundTyping,
  handlePlaygroundSend,
  n8nWorkflow,
  n8nLogs = [],
  fetchN8nLogs
}) {
  const [showN8nToken, setShowN8nToken] = useState(false);

  return (
    <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Banner & Live Status */}
      <div style={{
        background: 'linear-gradient(135deg, #071524 0%, #0d2847 50%, #0fa4de 100%)',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 8px 30px rgba(7, 21, 36, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF6D5A 0%, #EA4C89 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 4px 14px rgba(255, 109, 90, 0.4)'
            }}>
              🤖
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Agentes IA & Bot n8n para Clientes B2B
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#E0F2FE' }}>
                Orquestación de Agentes de IA en n8n para asesoría técnica, consulta de stock en tiempo real y cotizaciones mayoristas.
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '800',
              background: n8nConfig.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: n8nConfig.enabled ? '#4ADE80' : '#F87171',
              border: `1px solid ${n8nConfig.enabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: n8nConfig.enabled ? '#22C55E' : '#EF4444'
              }}></span>
              {n8nConfig.enabled ? 'Bot IA Activo en Shop' : 'Bot Desactivado'}
            </span>

            <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
              🎯 Tasa de Resolución: <strong>{n8nConfig.resolutionRate || '94%'}</strong>
            </span>

            <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
              💬 Consultas B2B: <strong>{n8nConfig.conversationsCount || '142'}</strong>
            </span>

            <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
              🧠 Modelo: <strong style={{ textTransform: 'uppercase', color: '#38BDF8' }}>{n8nConfig.aiModel || 'gpt-4o'}</strong>
            </span>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestN8nConnection}
            disabled={n8nTesting}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: n8nTesting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s'
            }}
          >
            <span>⚡</span> {n8nTesting ? 'Probando Webhook...' : 'Probar Conexión'}
          </button>

          <button
            type="button"
            onClick={() => setN8nSubTab('playground')}
            style={{
              background: '#FFFFFF',
              color: '#0369A1',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s'
            }}
          >
            <span>🧪</span> Abrir Simulador
          </button>
        </div>
      </div>

      {/* Test Connection / Save Result Alerts */}
      {n8nTestResult && (
        <div style={{
          background: n8nTestResult.success ? '#ECFDF5' : '#FEF2F2',
          color: n8nTestResult.success ? '#065F46' : '#991B1B',
          border: `1.5px solid ${n8nTestResult.success ? '#A7F3D0' : '#FECACA'}`,
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '18px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{n8nTestResult.success ? '✅' : '❌'}</span>
          <span>{n8nTestResult.message}</span>
        </div>
      )}

      {n8nSaveSuccess && (
        <div style={{
          background: '#ECFDF5',
          color: '#065F46',
          border: '1.5px solid #A7F3D0',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '18px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✓</span>
          <span>¡Configuración de los Agentes de IA n8n guardada exitosamente!</span>
        </div>
      )}

      {/* Sub-Tabs Nav for N8N */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'config', label: '⚙️ Configuración & Webhook', desc: 'Parámetros y Prompts' },
          { id: 'playground', label: '🧪 Playground & Simulador', desc: 'Prueba en Tiempo Real' },
          { id: 'workflow', label: '📦 Workflow Oficial n8n', desc: 'Descargar / Copiar JSON' },
          { id: 'logs', label: '📊 Logs de Conversaciones', desc: `${n8nLogs.length} Chats Registrados` }
        ].map(st => (
          <button
            key={st.id}
            type="button"
            onClick={() => setN8nSubTab(st.id)}
            style={{
              background: n8nSubTab === st.id ? '#0fa4de' : '#FFFFFF',
              color: n8nSubTab === st.id ? '#FFFFFF' : '#475569',
              border: `1.5px solid ${n8nSubTab === st.id ? '#0fa4de' : '#CBD5E1'}`,
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              boxShadow: n8nSubTab === st.id ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>{st.label}</span>
            <span style={{ fontSize: '10.5px', opacity: n8nSubTab === st.id ? 0.9 : 0.65, fontWeight: '600' }}>
              {st.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ── SUBTAB 1: CONFIGURACIÓN & WEBHOOK ── */}
      {n8nSubTab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Left Card: Webhook & Core Parameters */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔗</span> Conexión al Webhook de n8n
            </h3>

            {/* Switch Enable */}
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>Habilitar Bot de IA en el Shop</div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Muestra el widget del agente de IA en la tienda B2B.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={n8nConfig.enabled}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, enabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: n8nConfig.enabled ? '#0fa4de' : '#CBD5E1',
                  transition: '0.3s', borderRadius: '34px'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '20px', width: '20px', left: n8nConfig.enabled ? '24px' : '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>

            {/* Webhook URL */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                URL del Webhook de n8n (Node Webhook Trigger)
              </label>
              <input
                type="url"
                value={n8nConfig.webhookUrl || ''}
                onChange={(e) => setN8nConfig({ ...n8nConfig, webhookUrl: e.target.value })}
                placeholder="https://tu-n8n.com/webhook/dacas-b2b-agent"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '42px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748B' }}>
                Endpoint HTTP POST configurado en tu instancia de n8n para recibir el mensaje del usuario.
              </p>
            </div>

            {/* Auth Header & Token */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                    Header de Autenticación
                  </label>
                </div>
                <input
                  type="text"
                  value={n8nConfig.authHeaderName || 'X-N8N-API-KEY'}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, authHeaderName: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '42px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '12.5px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                    API Token / Secreto
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowN8nToken(!showN8nToken)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: '#0fa4de',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: '2px 8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{showN8nToken ? '🙈' : '👁️'}</span>
                    <span>{showN8nToken ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>
                <input
                  type={showN8nToken ? 'text' : 'password'}
                  value={n8nConfig.authToken || ''}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, authToken: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '42px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '12.5px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Bot Visual & Identity Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', minHeight: '22px', marginBottom: '6px' }}>
                  Nombre del Bot
                </label>
                <input
                  type="text"
                  value={n8nConfig.botName || ''}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, botName: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '42px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', minHeight: '22px', marginBottom: '6px' }}>
                  Subtítulo del Header
                </label>
                <input
                  type="text"
                  value={n8nConfig.botSubtitle || ''}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, botSubtitle: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '42px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                Mensaje de Bienvenida Inicial
              </label>
              <textarea
                rows="3"
                value={n8nConfig.welcomeMessage || ''}
                onChange={(e) => setN8nConfig({ ...n8nConfig, welcomeMessage: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '12.5px',
                  lineHeight: '1.45',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Right Card: AI Agent Tools & System Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛠️</span> Herramientas (Tools) del Agente n8n
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                {[
                  { key: 'searchProducts', label: '🔍 Catálogo & Precios USD' },
                  { key: 'checkStock', label: '📦 Stock en Tiempo Real' },
                  { key: 'calculateQuote', label: '🧮 Cotizador de Proyectos' },
                  { key: 'recommendSolutions', label: '⚡ Recomendador Técnico' },
                  { key: 'checkOrderStatus', label: '🧾 Estado de Órdenes' },
                  { key: 'createSupportTicket', label: '🎫 Creación de Tickets' }
                ].map(tool => (
                  <label
                    key={tool.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: n8nConfig.enabledTools?.[tool.key] ? '#F0F9FF' : '#F8FAFC',
                      border: `1px solid ${n8nConfig.enabledTools?.[tool.key] ? '#BAE6FD' : '#E2E8F0'}`,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: n8nConfig.enabledTools?.[tool.key] ? '#0369A1' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(n8nConfig.enabledTools?.[tool.key])}
                      onChange={(e) => setN8nConfig({
                        ...n8nConfig,
                        enabledTools: { ...(n8nConfig.enabledTools || {}), [tool.key]: e.target.checked }
                      })}
                      style={{ accentColor: '#0fa4de', width: '16px', height: '16px' }}
                    />
                    <span>{tool.label}</span>
                  </label>
                ))}
              </div>

              {/* System Prompt */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  System Prompt / Rol del Agente de IA
                </label>
                <textarea
                  rows="4"
                  value={n8nConfig.systemPrompt || ''}
                  onChange={(e) => setN8nConfig({ ...n8nConfig, systemPrompt: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.45' }}
                />
              </div>
            </div>

            {/* Save Buttons Card */}
            <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1.5px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#166534' }}>Guardar Parámetros de n8n</div>
                <div style={{ fontSize: '11.5px', color: '#15803D' }}>Se aplicará de inmediato al Bot del Shop.</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResetN8nSettings}
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Restablecer
                </button>
                <button
                  type="button"
                  onClick={handleSaveN8nSettings}
                  disabled={isSavingN8n}
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: isSavingN8n ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  {isSavingN8n ? 'Guardando...' : '💾 Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBTAB 2: PLAYGROUND & SIMULADOR EN VIVO ── */}
      {n8nSubTab === 'playground' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧪</span> Simulador y Playground de Agentes n8n
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                Prueba cómo responde tu agente de n8n a diferentes escenarios de integradores y clientes B2B.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlaygroundMessages([
                {
                  id: 'p_reset',
                  sender: 'bot',
                  text: '👋 Sesión reiniciada. ¿Qué consulta deseas probar con el Agente n8n?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ])}
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
            >
              🔄 Reiniciar Chat de Prueba
            </button>
          </div>

          {/* Quick Test Prompt Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[
              '¿Qué stock tienen de Fortinet FortiGate 60F?',
              'Recomiéndame switches Aruba PoE para oficina',
              '¿Cómo registro mi empresa como distribuidor?',
              '¿Cuáles son las formas de pago en USD y ARS?'
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePlaygroundSend(p)}
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                💡 {p}
              </button>
            ))}
          </div>

          {/* Playground Chat Container */}
          <div style={{
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            background: '#F8FAFC',
            height: '420px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Messages */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {playgroundMessages.map((m) => {
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
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                        background: isBot ? '#FFFFFF' : '#0fa4de',
                        color: isBot ? '#1E293B' : '#FFFFFF',
                        fontSize: '13px',
                        lineHeight: '1.45',
                        border: isBot ? '1px solid #E2E8F0' : 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      {m.text}

                      {/* Product Recommendations */}
                      {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1' }}>
                            📦 Hardware Conciliado:
                          </div>
                          {m.recommendedProducts.map(p => (
                            <div key={p.id} style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '6px 10px', borderRadius: '8px', fontSize: '11.5px', color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: '700' }}>{p.name}</span>
                              <span style={{ color: '#0284c7', fontWeight: '800' }}>USD ${Number(p.price || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {m.toolUsed && (
                        <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#64748B', display: 'flex', gap: '10px' }}>
                          <span>🛠️ Tool: <code>{m.toolUsed}</code></span>
                          {m.latencyMs && <span>⚡ {m.latencyMs} ms</span>}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94A3B8', padding: '0 4px' }}>
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {isPlaygroundTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '14px', width: 'fit-content' }}>
                  <span style={{ fontSize: '11.5px', color: '#0fa4de', fontWeight: '700' }}>Agente n8n ejecutando LangChain</span>
                  <span>⏳</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePlaygroundSend();
              }}
              style={{
                padding: '12px 16px',
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                placeholder="Escribe una pregunta para probar el agente de IA..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
              />
              <button
                type="submit"
                disabled={!playgroundInput.trim() || isPlaygroundTyping}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: playgroundInput.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Enviar ➤
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBTAB 3: WORKFLOW OFICIAL N8N (JSON) ── */}
      {n8nSubTab === 'workflow' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦</span> Plantilla de Flujo Oficial para Importar en n8n
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                Descarga o copia el JSON preconfigurado con Webhook Trigger, AI Agent, Tools de Catálogo y Memoria Buffer.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2);
                  navigator.clipboard.writeText(jsonStr);
                  alert('¡Workflow JSON de n8n copiado al portapapeles! Ahora en n8n puedes pulsar Ctrl+V / Cmd+V o "Import from Clipboard".');
                }}
                style={{ background: '#0fa4de', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📋 Copiar JSON al Portapapeles
              </button>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'dacas_b2b_n8n_workflow.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ background: '#0284c7', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📥 Descargar .json
              </button>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>1. Importar en n8n</div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>En tu canvas de n8n, haz click en <strong>Import from File</strong> y sube el archivo descargado.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>2. Conectar tu LLM</div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>Configura tu credencial de <strong>OpenAI, Anthropic o Gemini</strong> en el nodo Chat Model.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>3. Activar Webhook</div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>Pasa el flujo a <strong>Active</strong> y pega la URL del Webhook en la pestaña de Configuración.</div>
            </div>
          </div>

          {/* Code Viewer */}
          <div style={{ background: '#0b1329', padding: '16px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: '#94a3b8', fontSize: '11.5px', fontFamily: 'monospace' }}>
              <span>dacas_b2b_n8n_workflow.json</span>
              <span>{(JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE).length / 1024).toFixed(1)} KB</span>
            </div>
            <pre style={{ margin: 0, maxHeight: '300px', overflowY: 'auto', color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace', lineHeight: '1.4' }}>
              {JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* ── SUBTAB 4: LOGS & AUDITORÍA ── */}
      {n8nSubTab === 'logs' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Registro de Consultas y Trazabilidad de Agentes ({n8nLogs.length})
            </h3>
            <button
              type="button"
              onClick={fetchN8nLogs}
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
            >
              🔄 Actualizar Historial
            </button>
          </div>

          {n8nLogs.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
              No hay conversaciones registradas aún.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Fecha & Hora</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Usuario / Integrador</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Pregunta / Prompt</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Respuesta del Agente</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Herramienta</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Latencia</th>
                  </tr>
                </thead>
                <tbody>
                  {n8nLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '750', color: '#0F172A' }}>
                        {log.user}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155', maxWidth: '220px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {log.query}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748B', maxWidth: '280px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {log.response}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700' }}>
                          {log.toolUsed}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748B', fontFamily: 'monospace' }}>
                        {log.latencyMs} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
