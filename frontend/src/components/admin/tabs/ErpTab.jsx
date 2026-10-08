import React, { useState } from 'react';

export default function ErpTab({
  apliConfig = {},
  setApliConfig,
  apliTesting,
  handleTestApliConnection,
  apliTestResult,
  apliSyncing,
  handleSyncApliNow,
  apliSyncResult,
  apliSaveSuccess,
  apliSubTab,
  setApliSubTab,
  handleResetApli,
  handleSaveApliSettings,
  isSavingApli,
  apliLogs = [],
  fetchApliLogs
}) {
  const [showApliApiKey, setShowApliApiKey] = useState(false);
  const [showApliSecret, setShowApliSecret] = useState(false);

  return (
    <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Banner & Status Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #071524 0%, #0c233d 50%, #034870 100%)',
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
            }}>
              🔌
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Módulo de Conexión & Integración Apli
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                Sincronización en tiempo real de catálogo, stock, listas de precios y pedidos B2B con Apli ERP & Cloud.
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
              background: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              color: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? '#4ADE80' : '#F87171',
              border: `1px solid ${apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? '#22C55E' : '#EF4444'
              }}></span>
              {apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'Conectado & Operativo' : 'Desconectado'}
            </span>

            <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
              ⚡ Latencia API: <strong style={{ color: '#38BDF8' }}>{apliConfig.lastLatencyMs || 35} ms</strong>
            </span>

            <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
              🌐 Entorno: <strong style={{ color: '#FFFFFF', textTransform: 'uppercase' }}>{apliConfig.environment || 'produccion'}</strong>
            </span>

            <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
              ⏱️ Última Sincronización: <strong style={{ color: '#FFFFFF' }}>{apliConfig.lastSync ? new Date(apliConfig.lastSync).toLocaleTimeString() : 'Reciente'}</strong>
            </span>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestApliConnection}
            disabled={apliTesting}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: apliTesting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s'
            }}
          >
            <span>⚡</span> {apliTesting ? 'Probando...' : 'Probar Conexión'}
          </button>

          <button
            type="button"
            onClick={() => handleSyncApliNow('all')}
            disabled={apliSyncing}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: apliSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <span>🔄</span> {apliSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
          </button>
        </div>
      </div>

      {/* Test Connection / Sync Result Alerts */}
      {apliTestResult && (
        <div style={{
          background: apliTestResult.success ? '#ECFDF5' : '#FEF2F2',
          color: apliTestResult.success ? '#065F46' : '#991B1B',
          border: `1.5px solid ${apliTestResult.success ? '#A7F3D0' : '#FECACA'}`,
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '18px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{apliTestResult.success ? '✅' : '❌'}</span>
          <span>{apliTestResult.message}</span>
        </div>
      )}

      {apliSyncResult && (
        <div style={{
          background: apliSyncResult.success ? '#EFF6FF' : '#FEF2F2',
          color: apliSyncResult.success ? '#1E40AF' : '#991B1B',
          border: `1.5px solid ${apliSyncResult.success ? '#BFDBFE' : '#FECACA'}`,
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '18px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{apliSyncResult.success ? '🚀' : '❌'}</span>
          <span>{apliSyncResult.message}</span>
        </div>
      )}

      {apliSaveSuccess && (
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
          <span>¡Configuración del módulo Apli guardada exitosamente!</span>
        </div>
      )}

      {/* Sub-Tabs Nav for Apli */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'config', label: '⚙️ Parámetros & Credenciales', desc: 'API Keys y Endpoints' },
          { id: 'sync', label: '🔄 Sincronización Automática', desc: 'Catálogo, Stock y Pedidos' },
          { id: 'webhooks', label: '🔗 Webhooks de Apli', desc: 'Notificaciones en Tiempo Real' },
          { id: 'logs', label: '📊 Logs & Auditoría', desc: `${apliLogs.length} Eventos Registrados` }
        ].map(st => (
          <button
            key={st.id}
            type="button"
            onClick={() => setApliSubTab(st.id)}
            style={{
              background: apliSubTab === st.id ? '#0fa4de' : '#FFFFFF',
              color: apliSubTab === st.id ? '#FFFFFF' : '#475569',
              border: `1.5px solid ${apliSubTab === st.id ? '#0fa4de' : '#CBD5E1'}`,
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              boxShadow: apliSubTab === st.id ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>{st.label}</span>
            <span style={{ fontSize: '10.5px', opacity: apliSubTab === st.id ? 0.9 : 0.65, fontWeight: '600' }}>
              {st.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ── SUBTAB 1: PARÁMETROS & CREDENCIALES ── */}
      {apliSubTab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* General Connection Card */}
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔐</span> Credenciales de Acceso Apli API
              </h3>
              <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontWeight: '750' }}>
                REST v2
              </span>
            </div>

            {/* Switch Enable Integration */}
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>Habilitar Conexión Apli ERP</div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Activa la integración del Shop con la API de Apli.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={apliConfig.enabled}
                  onChange={(e) => setApliConfig({ ...apliConfig, enabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: apliConfig.enabled ? '#0fa4de' : '#CBD5E1',
                  transition: '0.3s', borderRadius: '34px'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '20px', width: '20px', left: apliConfig.enabled ? '24px' : '3px', bottom: '3px',
                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>

            {/* Environment Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Entorno de Ejecución
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'production', label: '🚀 Producción (Live)', desc: 'Servidores oficiales' },
                  { id: 'sandbox', label: '🧪 Sandbox (Pruebas)', desc: 'Ambiente de test' }
                ].map(env => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setApliConfig({ ...apliConfig, environment: env.id })}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${apliConfig.environment === env.id ? '#0284c7' : '#E2E8F0'}`,
                      background: apliConfig.environment === env.id ? '#F0F9FF' : '#FFFFFF',
                      color: apliConfig.environment === env.id ? '#0369A1' : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{env.label}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500' }}>{env.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Endpoint URL */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                Apli API Base Endpoint URL
              </label>
              <input
                type="url"
                value={apliConfig.endpointUrl || ''}
                onChange={(e) => setApliConfig({ ...apliConfig, endpointUrl: e.target.value })}
                placeholder="https://api.apli.com.ar/v2"
                style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Client / Tenant ID */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                ID de Cliente / Tenant DACAS en Apli
              </label>
              <input
                type="text"
                value={apliConfig.clientId || ''}
                onChange={(e) => setApliConfig({ ...apliConfig, clientId: e.target.value })}
                placeholder="DACAS-ARG-001"
                style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* API Key */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                  API Key / Bearer Token
                </label>
                <button
                  type="button"
                  onClick={() => setShowApliApiKey(!showApliApiKey)}
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
                  <span>{showApliApiKey ? '🙈' : '👁️'}</span>
                  <span>{showApliApiKey ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <input
                type={showApliApiKey ? 'text' : 'password'}
                value={apliConfig.apiKey || ''}
                onChange={(e) => setApliConfig({ ...apliConfig, apiKey: e.target.value })}
                placeholder="apli_live_..."
                style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: showApliApiKey ? 'monospace' : 'inherit', outline: 'none' }}
              />
            </div>

            {/* Client Secret */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                  Client Secret
                </label>
                <button
                  type="button"
                  onClick={() => setShowApliSecret(!showApliSecret)}
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
                  <span>{showApliSecret ? '🙈' : '👁️'}</span>
                  <span>{showApliSecret ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <input
                type={showApliSecret ? 'text' : 'password'}
                value={apliConfig.clientSecret || ''}
                onChange={(e) => setApliConfig({ ...apliConfig, clientSecret: e.target.value })}
                placeholder="sk_live_..."
                style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: showApliSecret ? 'monospace' : 'inherit', outline: 'none' }}
              />
            </div>
          </div>

          {/* Integration Details & Security Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> Seguridad y Cifrado de Transacciones
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔒</span>
                  <div>
                    <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Encriptación TLS 1.3 / SSL 256-bit</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Toda la comunicación con Apli viaja con encriptación de grado bancario.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔑</span>
                  <div>
                    <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Firma HMAC-SHA256 en Webhooks</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Validación criptográfica de origen en cada notificación entrante.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Reintentos Exponenciales Automáticos</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Si Apli no responde, el sistema reintenta con backoff automático de 5 intentos.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons Card */}
            <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1.5px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#166534' }}>Guardar Cambios de Conexión</div>
                <div style={{ fontSize: '11.5px', color: '#15803D' }}>Los cambios se aplicarán de inmediato a todo el sistema.</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResetApli}
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Restablecer
                </button>
                <button
                  type="button"
                  onClick={handleSaveApliSettings}
                  disabled={isSavingApli}
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: isSavingApli ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  {isSavingApli ? 'Guardando...' : '💾 Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBTAB 2: SINCRONIZACIÓN AUTOMÁTICA ── */}
      {apliSubTab === 'sync' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔄</span> Matriz de Sincronización Bidireccional
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                Selecciona qué módulos se actualizarán de forma automatizada entre DACAS Shop y Apli ERP.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSyncApliNow('stock')}
                disabled={apliSyncing}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
              >
                📦 Sincronizar Solo Stock
              </button>
              <button
                type="button"
                onClick={() => handleSyncApliNow('orders')}
                disabled={apliSyncing}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
              >
                🛒 Conciliar Pedidos
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'syncProducts', title: 'Catálogo de Productos & Precios', desc: 'Sincroniza SKUs, títulos, descripciones, marcas y listas mayoristas en USD.', icon: '🏷️' },
              { key: 'syncStock', title: 'Inventario & Stock en Tiempo Real', desc: 'Actualiza cantidades disponibles de forma automática al registrar ventas o ingresos.', icon: '📦' },
              { key: 'syncOrders', title: 'Despacho & Facturación de Pedidos', desc: 'Envía órdenes B2B aprobadas directo a Apli para emisión de factura fiscal y remito.', icon: '🧾' },
              { key: 'syncCustomers', title: 'Clientes & Límites de Crédito', desc: 'Valida cuentas corrientes, CUITs verificados y líneas de crédito de integradores.', icon: '🏢' }
            ].map(item => (
              <div
                key={item.key}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1.5px solid ${apliConfig[item.key] ? '#0284c7' : '#E2E8F0'}`,
                  background: apliConfig[item.key] ? '#F0F9FF' : '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: apliConfig[item.key] ? '#0369A1' : '#1E293B' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', lineHeight: '1.4' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(apliConfig[item.key])}
                  onChange={(e) => setApliConfig({ ...apliConfig, [item.key]: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7', marginTop: '2px' }}
                />
              </div>
            ))}
          </div>

          {/* Sync Frequency */}
          <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              ⏱️ Frecuencia de Sincronización Automática
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {[
                { id: 'realtime', label: '⚡ Tiempo Real (Webhooks)', desc: 'Instantáneo' },
                { id: '5min', label: '⏱️ Cada 5 minutos', desc: 'Alta frecuencia' },
                { id: '15min', label: '⏱️ Cada 15 minutos', desc: 'Recomendado' },
                { id: 'hourly', label: '⏱️ Cada 1 hora', desc: 'Bajo tráfico' },
                { id: 'manual', label: '✋ Solo Manual', desc: 'Bajo demanda' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setApliConfig({ ...apliConfig, syncInterval: f.id })}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1.5px solid ${apliConfig.syncInterval === f.id ? '#0284c7' : '#CBD5E1'}`,
                    background: apliConfig.syncInterval === f.id ? '#0284c7' : '#FFFFFF',
                    color: apliConfig.syncInterval === f.id ? '#FFFFFF' : '#334155',
                    fontWeight: '700',
                    fontSize: '11.5px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div>{f.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: '500' }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSaveApliSettings}
              disabled={isSavingApli}
              style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: isSavingApli ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)'
              }}
            >
              {isSavingApli ? 'Guardando...' : '💾 Guardar Preferencias de Sincronización'}
            </button>
          </div>
        </div>
      )}

      {/* ── SUBTAB 3: WEBHOOKS ── */}
      {apliSubTab === 'webhooks' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔗</span> Endpoints y Webhooks de Notificación
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                URL del Webhook de DACAS Shop (Ingresar en panel de Apli)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/ecommerce/settings/apli/webhook`}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', background: '#F8FAFC', fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/ecommerce/settings/apli/webhook`);
                    alert('¡URL del Webhook copiada al portapapeles!');
                  }}
                  style={{ background: '#0fa4de', color: '#FFFFFF', border: 'none', padding: '0 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                >
                  📋 Copiar
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Secreto de Firma Webhook (HMAC-SHA256)
              </label>
              <input
                type="text"
                value={apliConfig.webhookSecret || ''}
                onChange={(e) => setApliConfig({ ...apliConfig, webhookSecret: e.target.value })}
                placeholder="whsec_..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '8px' }}>
              Eventos de Apli Suscritos:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['product.stock_updated', 'order.invoice_generated', 'order.status_change', 'customer.credit_limit_updated'].map(ev => (
                <span key={ev} style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '750', fontFamily: 'monospace' }}>
                  ✓ {ev}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSaveApliSettings}
              disabled={isSavingApli}
              style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: isSavingApli ? 'not-allowed' : 'pointer'
              }}
            >
              💾 Guardar Configuración de Webhook
            </button>
          </div>
        </div>
      )}

      {/* ── SUBTAB 4: LOGS & AUDITORÍA ── */}
      {apliSubTab === 'logs' && (
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Registro de Transacciones y Eventos Apli ({apliLogs.length})
            </h3>
            <button
              type="button"
              onClick={fetchApliLogs}
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
            >
              🔄 Actualizar Logs
            </button>
          </div>

          {apliLogs.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
              No hay registros de eventos aún.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Fecha & Hora</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Tipo de Evento</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Estado</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Detalle de Transacción</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {apliLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '750', color: '#0F172A' }}>
                        <span style={{
                          background: log.type.includes('STOCK') ? '#FEF3C7' : log.type.includes('ORDER') ? '#E0F2FE' : '#F1F5F9',
                          color: log.type.includes('STOCK') ? '#B45309' : log.type.includes('ORDER') ? '#0369A1' : '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px'
                        }}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: log.status === 'SUCCESS' ? '#DCFCE7' : '#FEE2E2',
                          color: log.status === 'SUCCESS' ? '#15803D' : '#DC2626',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '10.5px'
                        }}>
                          {log.status === 'SUCCESS' ? '✓ OK' : '✕ ERROR'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748B', fontFamily: 'monospace' }}>
                        {log.durationMs} ms
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
