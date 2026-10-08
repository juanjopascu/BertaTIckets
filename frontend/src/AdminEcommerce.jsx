import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';
import NotificationBell from './NotificationBell';

// Helpers & Data
import {
  API_BASE_URL,
  DACAS_COUNTRIES_LIST,
  sanitizeVisualConfig,
  DEFAULT_CHECKOUT_METHODS,
  initialUserForm
} from './components/admin/adminHelpers';

// Tab Sub-Modules
import CatalogTab from './components/admin/tabs/CatalogTab';
import PricingRulesTab from './components/admin/tabs/PricingRulesTab';
import UsersTab from './components/admin/tabs/UsersTab';
import OrdersTab from './components/admin/tabs/OrdersTab';
import AnalyticsTab from './components/admin/tabs/AnalyticsTab';
import CheckoutTab from './components/admin/tabs/CheckoutTab';
import VisualTab from './components/admin/tabs/VisualTab';
import ErpTab from './components/admin/tabs/ErpTab';
import AiBotTab from './components/admin/tabs/AiBotTab';

// Modals
import UserDetailModal from './components/admin/modals/UserDetailModal';
import OrderDetailModal from './components/admin/modals/OrderDetailModal';
import ClientTypesModal from './components/admin/modals/ClientTypesModal';

// Re-export for external modules (e.g. Dashboard.jsx)
export { DACAS_COUNTRIES_LIST } from './components/admin/adminHelpers';

function EcommerceLayoutWrapper({
  embedded,
  activeTab,
  setActiveTab,
  selectedCountryScope,
  handleCountryScopeChange,
  users = [],
  usuario,
  visualSubTab = 'hero',
  setVisualSubTab,
  children
}) {
  const [isVisualExpanded, setIsVisualExpanded] = useState(true);
  if (embedded) {
    return (
      <main className="crm-main-embedded" style={{ width: '100%', maxWidth: '100%', padding: 0, margin: 0 }}>
        {children}
      </main>
    );
  }

  return (
    <div className="crm-container" style={{ padding: '24px 32px', maxWidth: '1680px', margin: '0 auto', boxSizing: 'border-box' }}>
      <main className="crm-main-grid" style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start' }}>
        {/* SIDEBAR DEDICADO E-COMMERCE CON SCROLL INTERNO INDEPENDIENTE */}
        <aside
          className="sidebar-depts sidebar-left"
          style={{
            position: 'sticky',
            top: '16px',
            height: 'calc(100vh - 32px)',
            maxHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 12px 12px 12px',
            width: '280px',
            flexShrink: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 20
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '10px' }}>
            {/* 1. Botón Volver a Administración (Fijo) */}
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="sidebar-menu-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '750',
                padding: '8px 12px',
                width: '100%',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: '#0284c7',
                cursor: 'pointer',
                fontSize: '0.82rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title="Regresar al Portal General de Administración y Tickets"
            >
              <BrandingVectorIcon name="arrow-left" size={14} color="#0284c7" />
              <span>Volver a Administración</span>
            </button>

            {/* 2. Encabezado E-commerce (Fijo) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 2px', flexShrink: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(15, 164, 222, 0.25)',
                flexShrink: 0
              }}>
                <BrandingVectorIcon name="shopping-cart" size={16} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
                  Gestión E-commerce
                </h3>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: '600' }}>
                  Control Regional DACAS
                </span>
              </div>
            </div>

            {/* 3. Selector de Scope Activo (Fijo y compacto) */}
            <div style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              padding: '8px 10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Scope Activo
                </span>
                <span style={{ fontSize: '8.5px', background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#ffffff', padding: '1.5px 6px', borderRadius: '4px', fontWeight: '800' }}>
                  PRIMARY KEY
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCountryScope}
                  onChange={(e) => handleCountryScopeChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '7px',
                    border: '1.5px solid #0fa4de',
                    background: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: '750',
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  {DACAS_COUNTRIES_LIST.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', lineHeight: 1.2 }}>
                Catálogo, stock y precios por país.
              </div>
            </div>

            {/* 4. Menú de Módulos E-commerce con Scroll Autónomo (No mueve la web) */}
            <div
              className="ecommerce-sidebar-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '3px'
              }}
            >
              <div style={{
                fontSize: '10.5px',
                fontWeight: '800',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 6px',
                position: 'sticky',
                top: 0,
                background: 'var(--card-bg, #ffffff)',
                zIndex: 2
              }}>
                Módulos E-commerce
              </div>
              {[
                { id: 'products', label: 'Productos', icon: 'box' },
                { id: 'brands', label: 'Marcas', icon: 'tag' },
                { id: 'countries', label: 'Países y Sedes', icon: 'globe' },
                { id: 'rules', label: 'Cupones & Reglas', icon: 'ticket' },
                { id: 'users', label: 'Clientes Mayoristas', icon: 'users', badge: (users || []).filter(u => u.status === 'pendiente').length },
                { id: 'orders', label: 'Órdenes de Compra', icon: 'file-text' },
                { id: 'reportes', label: 'Reportería & Métricas', icon: 'bar-chart' },
                { id: 'envios', label: 'Métodos de Envío', icon: 'truck' },
                { id: 'pagos', label: 'Métodos de Pago', icon: 'credit-card' },
                { id: 'visual', label: 'Diseño & Banners', icon: 'palette' },
                { id: 'n8n_bot', label: 'Bot n8n B2B', icon: 'bot' },
                { id: 'apli', label: 'Conexión Apli', icon: 'zap' }
              ].map(item => {
                const isSelected = activeTab === item.id;
                const isVisualItem = item.id === 'visual';

                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isVisualItem) {
                          if (activeTab === 'visual') {
                            setIsVisualExpanded(prev => !prev);
                          } else {
                            setActiveTab('visual');
                            setIsVisualExpanded(true);
                          }
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`sidebar-menu-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7.5px 10px',
                        fontSize: '0.84rem',
                        borderRadius: '9px',
                        fontWeight: isSelected ? '800' : '650',
                        background: isSelected ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-main, #334155)',
                        border: isSelected ? 'none' : '1px solid transparent',
                        boxShadow: isSelected ? '0 3px 10px rgba(15, 164, 222, 0.28)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BrandingVectorIcon name={item.icon} size={15} color={isSelected ? '#ffffff' : '#0284c7'} />
                        </span>
                        <span>{item.label}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.badge > 0 && (
                          <span style={{
                            background: isSelected ? '#ffffff' : '#f59e0b',
                            color: isSelected ? '#0284c7' : '#ffffff',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '999px'
                          }}>
                            {item.badge}
                          </span>
                        )}

                        {isVisualItem && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              opacity: 0.9,
                              transition: 'transform 0.2s ease',
                              transform: (isSelected && isVisualExpanded) ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          >
                            <BrandingVectorIcon
                              name="chevron-down"
                              size={13}
                              color={isSelected ? '#ffffff' : '#64748b'}
                            />
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Submenú desplegable dentro del módulo Diseño & Banners */}
                    {isVisualItem && isSelected && isVisualExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          marginLeft: '12px',
                          paddingLeft: '8px',
                          borderLeft: '2px solid rgba(15, 164, 222, 0.35)',
                          marginTop: '3px',
                          marginBottom: '4px'
                        }}
                      >
                        {[
                          { id: 'hero', label: 'Banners Principales (Hero)', icon: 'layers' },
                          { id: 'brand_banners', label: 'Banners Marcas & Carruseles', icon: 'star' },
                          { id: 'announcement', label: 'Anuncio & Barra Superior', icon: 'megaphone' },
                          { id: 'categories', label: '4 Categorías del Shop', icon: 'tag' },
                          { id: 'brands', label: 'Marcas por Categoría', icon: 'building' },
                          { id: 'contact', label: 'Contacto & WhatsApp', icon: 'headphones' }
                        ].map(sub => {
                          const isSubActive = visualSubTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('visual');
                                if (setVisualSubTab) setVisualSubTab(sub.id);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '6px 8px',
                                fontSize: '0.78rem',
                                borderRadius: '7px',
                                fontWeight: isSubActive ? '800' : '600',
                                background: isSubActive ? 'rgba(15, 164, 222, 0.12)' : 'transparent',
                                color: isSubActive ? '#0284c7' : 'var(--text-main, #475569)',
                                border: isSubActive ? '1px solid rgba(15, 164, 222, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = '#f1f5f9';
                                  e.currentTarget.style.color = '#0f172a';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-main, #475569)';
                                }
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                                <BrandingVectorIcon
                                  name={sub.icon}
                                  size={12}
                                  color={isSubActive ? '#0284c7' : '#64748b'}
                                />
                              </span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL A LA DERECHA */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Barra Superior de Toolbar Breadcrumb */}
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '16px',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                style={{
                  background: 'var(--pill-bg, #f1f5f9)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  color: 'var(--text-main, #0f172a)',
                  borderRadius: '10px',
                  padding: '7px 13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.86rem',
                  fontWeight: '700'
                }}
                title="Volver a Home / Panel Principal"
              >
                <BrandingVectorIcon name="home" size={15} color="#0fa4de" />
                <span>Home</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0fa4de' }}>
                  <BrandingVectorIcon name="shopping-cart" size={20} color="#0fa4de" />
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Gestión E-commerce
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    • {
                      {
                        products: 'Catálogo de Productos',
                        brands: 'Marcas',
                        countries: 'Países y Sedes',
                        rules: 'Cupones & Reglas',
                        users: 'Clientes Mayoristas',
                        orders: 'Órdenes de Compra',
                        reportes: 'Reportería & Métricas',
                        envios: 'Métodos de Envío',
                        pagos: 'Métodos de Pago',
                        pagos_envios: 'Pagos y Envíos',
                        visual: `Diseño & Banners • ${{
                          hero: 'Banners Principales (Hero)',
                          brand_banners: 'Banners Marcas & Carruseles',
                          announcement: 'Anuncio & Barra Superior',
                          categories: '4 Categorías del Shop',
                          brands: 'Marcas por Categoría',
                          contact: 'Contacto & WhatsApp'
                        }[visualSubTab] || 'Personalización'}`,
                        n8n_bot: 'Bot n8n B2B',
                        apli: 'Conexión Apli'
                      }[activeTab] || 'Gestión'
                    }
                  </span>
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NotificationBell
                usuario={typeof usuario !== 'undefined' ? usuario : { rol: 'admin_ecommerce', nombre: 'Admin E-Commerce' }}
                onNavigate={(targetView) => {
                  if (targetView === 'erp') window.location.href = '/admin/erp';
                  else if (targetView === 'crm') window.location.href = '/';
                }}
              />
              {activeTab === 'reportes' && (
                <button className="nav-btn" onClick={() => window.print()} style={{ background: 'var(--card-bg)', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <BrandingVectorIcon name="printer" size={15} color="currentColor" />
                  <span>Imprimir / PDF</span>
                </button>
              )}
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

function AdminEcommerce({
  embedded = false,
  hideTopBars = false,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  visualSubTab: externalVisualSubTab,
  onVisualSubTabChange: externalOnVisualSubTabChange,
  countryScope: externalCountryScope,
  onCountryScopeChange: externalOnCountryScopeChange,
  onBack
}) {
  const navigate = useNavigate();
  const [internalActiveTab, setInternalActiveTab] = useState('products');
  const [internalVisualSubTab, setInternalVisualSubTab] = useState('hero');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = (tab) => {
    setInternalActiveTab(tab);
    if (externalOnTabChange) externalOnTabChange(tab);
  };

  const visualSubTab = externalVisualSubTab !== undefined ? externalVisualSubTab : internalVisualSubTab;
  const setVisualSubTab = (subTab) => {
    setInternalVisualSubTab(subTab);
    if (externalOnVisualSubTabChange) externalOnVisualSubTabChange(subTab);
  };

  // Primary Key Country Scope
  const [selectedCountryScope, setSelectedCountryScope] = useState(() => {
    try {
      if (externalCountryScope && externalCountryScope !== 'all') return externalCountryScope;
      const saved = localStorage.getItem('dacas_admin_country_scope');
      return (saved && saved !== 'all') ? saved : 'AR';
    } catch {
      return 'AR';
    }
  });

  useEffect(() => {
    if (externalCountryScope && externalCountryScope !== selectedCountryScope) {
      setSelectedCountryScope(externalCountryScope);
    }
  }, [externalCountryScope]);

  useEffect(() => {
    const handleStorageScope = (e) => {
      const c = e?.detail?.country;
      if (c && c !== selectedCountryScope) {
        setSelectedCountryScope(c);
      }
    };
    window.addEventListener('dacas_country_changed', handleStorageScope);
    return () => window.removeEventListener('dacas_country_changed', handleStorageScope);
  }, [selectedCountryScope]);

  const activeCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === selectedCountryScope) || DACAS_COUNTRIES_LIST[0];

  const handleCountryScopeChange = (code) => {
    const safeCode = (!code || code === 'all') ? 'AR' : code;
    setSelectedCountryScope(safeCode);
    if (externalOnCountryScopeChange) externalOnCountryScopeChange(safeCode);
    try {
      localStorage.setItem('dacas_admin_country_scope', safeCode);
      localStorage.setItem('dacas_selected_country', safeCode);
      window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: safeCode } }));
    } catch {}
  };

  // Shared Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [countries, setCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [visualConfig, setVisualConfig] = useState(null);
  const [checkoutMethods, setCheckoutMethods] = useState(DEFAULT_CHECKOUT_METHODS);
  const [isSavingCheckout, setIsSavingCheckout] = useState(false);
  const [checkoutSaveSuccess, setCheckoutSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Client types
  const [clientTypes, setClientTypes] = useState([
    { id: 1, name: 'Integrador IT / Reseller', description: 'Empresas integradoras de soluciones de conectividad', color: '#0284c7' },
    { id: 2, name: 'Proveedor de Internet (ISP / WISP)', description: 'Proveedores de internet y carriers', color: '#10b981' },
    { id: 3, name: 'Consultora IT / Ciberseguridad', description: 'Firmas especializadas en seguridad informática', color: '#8b5cf6' },
    { id: 4, name: 'Empresa Corporativa', description: 'Clientes directos del segmento corporativo', color: '#f59e0b' },
    { id: 5, name: 'Organismo Público', description: 'Entidades gubernamentales y sector público', color: '#64748b' }
  ]);
  const [clientTypesModalOpen, setClientTypesModalOpen] = useState(false);
  const [editingClientType, setEditingClientType] = useState(null);
  const [clientTypeForm, setClientTypeForm] = useState({ name: '', description: '', color: '#0284c7' });
  const [savingClientType, setSavingClientType] = useState(false);

  // Modals for User & Order detail
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ERP Apli states
  const [apliConfig, setApliConfig] = useState({});
  const [apliTesting, setApliTesting] = useState(false);
  const [apliTestResult, setApliTestResult] = useState(null);
  const [apliSyncing, setApliSyncing] = useState(false);
  const [apliSyncResult, setApliSyncResult] = useState(null);
  const [apliSaveSuccess, setApliSaveSuccess] = useState(false);
  const [apliSubTab, setApliSubTab] = useState('settings');
  const [isSavingApli, setIsSavingApli] = useState(false);
  const [apliLogs, setApliLogs] = useState([]);

  // n8n AI Bot states
  const [n8nConfig, setN8nConfig] = useState({});
  const [n8nTesting, setN8nTesting] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState(null);
  const [n8nSaveSuccess, setN8nSaveSuccess] = useState(false);
  const [n8nSubTab, setN8nSubTab] = useState('config');
  const [isSavingN8n, setIsSavingN8n] = useState(false);
  const [playgroundMessages, setPlaygroundMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy el Agente IA de DACAS Mayorista B2B. ¿En qué puedo ayudarte hoy?',
      time: '12:00'
    }
  ]);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [isPlaygroundTyping, setIsPlaygroundTyping] = useState(false);
  const [n8nWorkflow, setN8nWorkflow] = useState(null);
  const [n8nLogs, setN8nLogs] = useState([]);

  // Auth Header Helper
  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('dacas_token') || sessionStorage.getItem('token');
    const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (sessionId) headers['x-session-id'] = sessionId;
    return headers;
  };

  // ── Data Fetching ──
  const fetchProducts = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const url = code && code !== 'all'
        ? `${API_BASE_URL}/api/ecommerce/products?country=${code}`
        : `${API_BASE_URL}/api/ecommerce/products?country=all`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchOrders = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const url = code && code !== 'all'
        ? `${API_BASE_URL}/api/ecommerce/admin/orders?country=${code}`
        : `${API_BASE_URL}/api/ecommerce/admin/orders`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/countries`);
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch {
      setCountries([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users`, { headers: getAuthHeader() });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/pricing-rules`, { headers: getAuthHeader() });
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch {
      setRules([]);
    }
  };

  const fetchVisualSettings = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const target = (code && code !== 'all') ? code : 'AR';
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${target}`);
      if (res.ok) {
        const data = await res.json();
        setVisualConfig(sanitizeVisualConfig(data));
      }
    } catch (err) {
      console.error('Error fetching visual settings:', err);
    }
  };

  const fetchCheckoutMethods = async (countryCode) => {
    try {
      const code = countryCode || (selectedCountryScope !== 'all' ? selectedCountryScope : 'AR');
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        setCheckoutMethods(data);
        localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching checkout methods:', err);
    }
  };

  const handleSaveCheckoutMethods = async () => {
    setIsSavingCheckout(true);
    setCheckoutSaveSuccess(false);
    try {
      const code = selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(checkoutMethods));
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods?country=${code}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(checkoutMethods)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar métodos de pago y envío');
      if (data.config) setCheckoutMethods(data.config);
      setCheckoutSaveSuccess(true);
      setTimeout(() => setCheckoutSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error guardando métodos de pago y envío: ' + err.message);
    } finally {
      setIsSavingCheckout(false);
    }
  };

  const handleResetCheckoutMethods = async () => {
    const code = selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
    if (!window.confirm(`¿Deseas restablecer los métodos de envío y formas de pago para ${activeCountryObj.name || code} a los valores oficiales por defecto?`)) return;
    setIsSavingCheckout(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods/reset?country=${code}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setCheckoutMethods(data.config);
        localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(data.config));
        setCheckoutSaveSuccess(true);
      }
    } catch (err) {
      alert('Error al restablecer checkout: ' + err.message);
    } finally {
      setIsSavingCheckout(false);
    }
  };

  const fetchClientTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/client-types`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setClientTypes(data);
      }
    } catch (err) {
      console.warn('Error fetching client types:', err);
    }
  };

  const fetchApliSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli`);
      if (res.ok) {
        const data = await res.json();
        setApliConfig(data);
      }
    } catch (err) {
      console.error('Error fetching apli settings:', err);
    }
  };

  const fetchApliLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/logs`);
      if (res.ok) {
        const data = await res.json();
        setApliLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching apli logs:', err);
    }
  };

  const fetchN8nSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot`);
      if (res.ok) {
        const data = await res.json();
        setN8nConfig(data);
      }
    } catch (err) {
      console.error('Error fetching n8n bot settings:', err);
    }
  };

  const fetchN8nLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/logs`);
      if (res.ok) {
        const data = await res.json();
        setN8nLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching n8n logs:', err);
    }
  };

  const fetchN8nWorkflow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/workflow`);
      if (res.ok) {
        const data = await res.json();
        setN8nWorkflow(data);
      }
    } catch (err) {
      console.error('Error fetching n8n workflow:', err);
    }
  };

  // Initial & Country-reactive effects
  useEffect(() => {
    fetchProducts(selectedCountryScope);
    fetchVisualSettings(selectedCountryScope);
    fetchCheckoutMethods(selectedCountryScope);
    fetchUsers();
    fetchOrders(selectedCountryScope);
    fetchRules();
  }, [selectedCountryScope]);

  useEffect(() => {
    fetchCountries();
    fetchClientTypes();
    fetchApliSettings();
    fetchApliLogs();
    fetchN8nSettings();
    fetchN8nLogs();
    fetchN8nWorkflow();
  }, []);

  // Update order status handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Open modals
  const openUserModal = (u) => {
    setSelectedUser(u);
    setShowUserModal(true);
  };

  const openOrderModal = (o) => {
    setSelectedOrder(o);
    setShowOrderModal(true);
  };

  // User Actions
  const handleApproveUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Error al aprobar usuario');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'activo' } : u));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: 'activo' }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'activo' ? 'inactivo' : 'activo';
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Client Types Handlers
  const handleSaveClientType = async (e) => {
    e.preventDefault();
    setSavingClientType(true);
    try {
      const url = editingClientType
        ? `${API_BASE_URL}/api/ecommerce/admin/client-types/${editingClientType.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/client-types`;
      const method = editingClientType ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(clientTypeForm)
      });
      if (!res.ok) throw new Error('Error al guardar tipo de cliente');
      fetchClientTypes();
      setEditingClientType(null);
      setClientTypeForm({ name: '', description: '', color: '#0284c7' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingClientType(false);
    }
  };

  const handleDeleteClientType = async (typeId) => {
    if (!window.confirm('¿Eliminar este tipo de cliente?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/client-types/${typeId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchClientTypes();
    } catch (err) {
      alert(err.message);
    }
  };

  // Analytics KPI calculations
  const analyticsData = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRev = validOrders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
    const paidCount = orders.filter(o => o.status === 'paid' || o.status === 'completed' || o.status === 'entregado').length;
    const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'procesando').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
    const lowStock = products.filter(p => Number(p.stock) <= 5).length;
    const convRate = users.length > 0 ? ((orders.length / users.length) * 100).toFixed(1) : 0;
    const aov = validOrders.length > 0 ? (totalRev / validOrders.length).toFixed(2) : 0;

    return {
      totalRevenue: totalRev,
      totalOrders: orders.length,
      paidOrders: paidCount,
      pendingOrders: pendingCount,
      cancelledOrders: cancelledCount,
      lowStockProducts: lowStock,
      conversionRate: convRate,
      avgOrderValue: aov
    };
  }, [orders, products, users]);

  return (
    <div
      className={embedded ? "crm-embedded-view" : "crm-container"}
      style={embedded ? { width: '100%', maxWidth: '100%', margin: 0, padding: 0 } : {}}
    >
      <style>{`
        .dacas-pill-btn {
          background: var(--card-bg, #FFFFFF);
          border: 1.5px solid var(--border-color, #E2E8F0);
          color: var(--text-main, #334155);
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 0.86rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .dacas-pill-btn:hover {
          color: #0284c7;
          border-color: #BAE6FD;
          background: rgba(15, 164, 222, 0.08);
          transform: translateY(-1px);
        }
        .dacas-pill-btn.active, .dacas-pill-btn.selected {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 14px rgba(15, 164, 222, 0.35) !important;
        }

        .dacas-action-pill {
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          color: #334155;
          padding: 5px 14px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .dacas-action-pill:hover, .dacas-action-pill.active {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 3px 10px rgba(15, 164, 222, 0.3) !important;
        }
        .dacas-action-pill.danger {
          padding: 5px 10px;
          color: #64748B;
        }
        .dacas-action-pill.danger:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3) !important;
        }

        .crm-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 14px; margin-top: 8px; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center; }
        .modal-content { background:var(--card-bg, white); padding:30px; border-radius:20px; width:90%; max-width:900px; max-height:90vh; overflow-y:auto; }

        /* Scrollbar elegante y autónomo para el menú del sidebar */
        .ecommerce-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
        }
        .ecommerce-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ecommerce-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ecommerce-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 999px;
        }
        .ecommerce-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 164, 222, 0.6);
        }
      `}</style>

      <EcommerceLayoutWrapper
        embedded={embedded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCountryScope={selectedCountryScope}
        handleCountryScopeChange={handleCountryScopeChange}
        users={users}
        usuario={{ rol: 'admin_ecommerce', nombre: 'Admin E-Commerce' }}
        visualSubTab={visualSubTab}
        setVisualSubTab={setVisualSubTab}
      >
        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        {/* 1. CATALOG TAB: Products, Brands, Countries */}
        {(activeTab === 'products' || activeTab === 'brands' || activeTab === 'countries') && (
          <CatalogTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            products={products}
            setProducts={setProducts}
            fetchProducts={fetchProducts}
            countries={countries}
            fetchCountries={fetchCountries}
            selectedCountryScope={selectedCountryScope}
            getAuthHeader={getAuthHeader}
            visualConfig={visualConfig}
            setVisualConfig={setVisualConfig}
          />
        )}

        {/* 2. PRICING RULES & COUPONS TAB */}
        {activeTab === 'rules' && (
          <PricingRulesTab
            countryScopedRules={rules}
            filteredRules={rules}
            paginatedRules={rules}
            ruleFilterType="all"
            setRuleFilterType={() => {}}
            activeCountryObj={activeCountryObj}
            selectedCountryScope={selectedCountryScope}
            dacasCountriesList={DACAS_COUNTRIES_LIST}
            countries={countries}
            users={users}
            products={products}
            clientTypes={clientTypes}
            fetchRules={fetchRules}
            getAuthHeader={getAuthHeader}
          />
        )}

        {/* 3. USERS / CLIENTES MAYORISTAS TAB */}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            countries={countries}
            activeCountryObj={activeCountryObj}
            clientTypes={clientTypes}
            setClientTypes={setClientTypes}
            setClientTypesModalOpen={setClientTypesModalOpen}
            openUserModal={openUserModal}
            fetchUsers={fetchUsers}
            getAuthHeader={getAuthHeader}
          />
        )}

        {/* 4. ORDERS / ÓRDENES DE COMPRA TAB */}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            countries={countries}
            activeCountryObj={activeCountryObj}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            onViewOrder={openOrderModal}
          />
        )}

        {/* 5. ANALYTICS / REPORTERÍA TAB */}
        {activeTab === 'reportes' && (
          <AnalyticsTab
            totalRevenue={analyticsData.totalRevenue}
            totalOrders={analyticsData.totalOrders}
            paidOrders={analyticsData.paidOrders}
            pendingOrders={analyticsData.pendingOrders}
            cancelledOrders={analyticsData.cancelledOrders}
            conversionRate={analyticsData.conversionRate}
            avgOrderValue={analyticsData.avgOrderValue}
            products={products}
            lowStockProducts={analyticsData.lowStockProducts}
            activeCountryObj={activeCountryObj}
          />
        )}

        {/* 6. CHECKOUT: ENVÍOS & PAGOS */}
        {(activeTab === 'envios' || activeTab === 'pagos' || activeTab === 'pagos_envios') && (
          <CheckoutTab
            activeTab={activeTab}
            checkoutSubTab={activeTab === 'envios' ? 'shipping' : 'payment'}
            checkoutMethods={checkoutMethods}
            setCheckoutMethods={setCheckoutMethods}
            activeCountryObj={activeCountryObj}
            isSavingCheckout={isSavingCheckout}
            checkoutSaveSuccess={checkoutSaveSuccess}
            handleResetCheckoutMethods={handleResetCheckoutMethods}
            handleSaveCheckoutMethods={handleSaveCheckoutMethods}
          />
        )}

        {/* 7. VISUAL / DISEÑO & BANNERS TAB */}
        {activeTab === 'visual' && (
          <VisualTab
            visualConfig={visualConfig}
            setVisualConfig={setVisualConfig}
            activeCountryObj={activeCountryObj}
            selectedCountryScope={selectedCountryScope}
            onCountryScopeChange={handleCountryScopeChange}
            products={products}
            onNavigateToBrands={() => setActiveTab('brands')}
            getAuthHeader={getAuthHeader}
            visualSubTab={visualSubTab}
            setVisualSubTab={setVisualSubTab}
          />
        )}

        {/* 8. ERP APLI CONNECTION TAB */}
        {activeTab === 'apli' && (
          <ErpTab
            apliConfig={apliConfig}
            setApliConfig={setApliConfig}
            apliTesting={apliTesting}
            handleTestApliConnection={async () => {
              setApliTesting(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/test`, { method: 'POST', headers: getAuthHeader() });
                const data = await res.json();
                setApliTestResult(data);
              } catch (err) {
                setApliTestResult({ success: false, message: err.message });
              } finally {
                setApliTesting(false);
              }
            }}
            apliTestResult={apliTestResult}
            apliSyncing={apliSyncing}
            handleSyncApliNow={async () => {
              setApliSyncing(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/sync`, { method: 'POST', headers: getAuthHeader() });
                const data = await res.json();
                setApliSyncResult(data);
                fetchApliLogs();
              } catch (err) {
                setApliSyncResult({ success: false, message: err.message });
              } finally {
                setApliSyncing(false);
              }
            }}
            apliSyncResult={apliSyncResult}
            apliSaveSuccess={apliSaveSuccess}
            apliSubTab={apliSubTab}
            setApliSubTab={setApliSubTab}
            handleResetApli={() => {}}
            handleSaveApliSettings={async (e) => {
              if (e) e.preventDefault();
              setIsSavingApli(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli`, {
                  method: 'PUT',
                  headers: getAuthHeader(),
                  body: JSON.stringify(apliConfig)
                });
                if (res.ok) {
                  setApliSaveSuccess(true);
                  setTimeout(() => setApliSaveSuccess(false), 3000);
                }
              } catch (err) {
                alert(err.message);
              } finally {
                setIsSavingApli(false);
              }
            }}
            isSavingApli={isSavingApli}
            apliLogs={apliLogs}
            fetchApliLogs={fetchApliLogs}
          />
        )}

        {/* 9. N8N AI BOT TAB */}
        {activeTab === 'n8n_bot' && (
          <AiBotTab
            n8nConfig={n8nConfig}
            setN8nConfig={setN8nConfig}
            n8nTesting={n8nTesting}
            handleTestN8nConnection={async () => {
              setN8nTesting(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/test`, { method: 'POST', headers: getAuthHeader() });
                const data = await res.json();
                setN8nTestResult(data);
              } catch (err) {
                setN8nTestResult({ success: false, message: err.message });
              } finally {
                setN8nTesting(false);
              }
            }}
            n8nTestResult={n8nTestResult}
            n8nSaveSuccess={n8nSaveSuccess}
            n8nSubTab={n8nSubTab}
            setN8nSubTab={setN8nSubTab}
            handleResetN8nSettings={() => {}}
            handleSaveN8nSettings={async (e) => {
              if (e) e.preventDefault();
              setIsSavingN8n(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot`, {
                  method: 'PUT',
                  headers: getAuthHeader(),
                  body: JSON.stringify(n8nConfig)
                });
                if (res.ok) {
                  setN8nSaveSuccess(true);
                  setTimeout(() => setN8nSaveSuccess(false), 3000);
                }
              } catch (err) {
                alert(err.message);
              } finally {
                setIsSavingN8n(false);
              }
            }}
            isSavingN8n={isSavingN8n}
            playgroundMessages={playgroundMessages}
            setPlaygroundMessages={setPlaygroundMessages}
            playgroundInput={playgroundInput}
            setPlaygroundInput={setPlaygroundInput}
            isPlaygroundTyping={isPlaygroundTyping}
            handlePlaygroundSend={async (e) => {
              if (e) e.preventDefault();
              if (!playgroundInput.trim()) return;
              const userMsg = { id: Date.now(), sender: 'user', text: playgroundInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
              setPlaygroundMessages(prev => [...prev, userMsg]);
              setPlaygroundInput('');
              setIsPlaygroundTyping(true);
              try {
                const res = await fetch(`${API_BASE_URL}/api/ecommerce/bot/chat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: userMsg.text, country: selectedCountryScope })
                });
                const data = await res.json();
                setPlaygroundMessages(prev => [...prev, {
                  id: Date.now() + 1,
                  sender: 'bot',
                  text: data.reply || data.response || 'No se obtuvo respuesta del bot.',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
              } catch (err) {
                setPlaygroundMessages(prev => [...prev, {
                  id: Date.now() + 1,
                  sender: 'bot',
                  text: 'Error de conexión: ' + err.message,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
              } finally {
                setIsPlaygroundTyping(false);
              }
            }}
            n8nWorkflow={n8nWorkflow}
            n8nLogs={n8nLogs}
            fetchN8nLogs={fetchN8nLogs}
          />
        )}
      </EcommerceLayoutWrapper>

      {/* MODAL FICHA CORPORATIVA CLIENTE B2B */}
      <UserDetailModal
        isOpen={showUserModal}
        selectedUser={selectedUser}
        countries={countries}
        onClose={() => { setShowUserModal(false); setSelectedUser(null); }}
        handleApproveUser={handleApproveUser}
        handleEditUser={() => {}}
        handleOpenAddUserToCompany={() => {}}
        handleToggleUserStatus={handleToggleUserStatus}
        handleDeleteUser={handleDeleteUser}
      />

      {/* MODAL DETALLE DE ORDEN */}
      <OrderDetailModal
        isOpen={showOrderModal}
        selectedOrder={selectedOrder}
        onClose={() => { setShowOrderModal(false); setSelectedOrder(null); }}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* MODAL TIPOS DE CLIENTE */}
      <ClientTypesModal
        isOpen={clientTypesModalOpen}
        onClose={() => setClientTypesModalOpen(false)}
        editingClientType={editingClientType}
        setEditingClientType={setEditingClientType}
        clientTypeForm={clientTypeForm}
        setClientTypeForm={setClientTypeForm}
        savingClientType={savingClientType}
        handleSaveClientType={handleSaveClientType}
        handleDeleteClientType={handleDeleteClientType}
        clientTypes={clientTypes}
        users={users}
      />
    </div>
  );
}

export default AdminEcommerce;
