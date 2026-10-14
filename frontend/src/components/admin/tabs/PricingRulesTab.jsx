import React, { useState, useMemo } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import PaginationBar from '../PaginationBar';
import { API_BASE_URL, SUGGESTED_CLIENT_TAGS } from '../adminHelpers';

const defaultInitialRuleForm = {
  name: '',
  rule_type: 'discount',
  value_type: 'percentage',
  value: '',
  country_id: '',
  brand: '',
  product_id: '',
  user_id: '',
  tipo_cliente: '',
  target_client_tag: '',
  priority: 10,
  is_active: true,
  is_coupon: false,
  coupon_code: '',
  min_order_amount: '',
  valid_until: '',
  usage_limit: '',
  times_used: 0
};

export default function PricingRulesTab({
  countryScopedRules: propCountryScopedRules = [],
  filteredRules: propFilteredRules = [],
  paginatedRules: propPaginatedRules = [],
  ruleFilterType: propRuleFilterType,
  setRuleFilterType: propSetRuleFilterType,
  activeCountryObj = { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  selectedCountryScope,
  dacasCountriesList = [],
  showRuleForm: propShowRuleForm,
  setShowRuleForm: propSetShowRuleForm,
  editingRule: propEditingRule,
  setEditingRule: propSetEditingRule,
  ruleForm: propRuleForm,
  setRuleForm: propSetRuleForm,
  initialRuleForm = defaultInitialRuleForm,
  handleRuleSubmit: propHandleRuleSubmit,
  resetRuleForm: propResetRuleForm,
  handleEditRule: propHandleEditRule,
  handleDeleteRule: propHandleDeleteRule,
  countries = [],
  users = [],
  products = [],
  clientTypes = [],
  rulePage: propRulePage,
  setRulePage: propSetRulePage,
  rulePageSize: propRulePageSize,
  setRulePageSize: propSetRulePageSize,
  fetchRules,
  getAuthHeader
}) {
  const [localShowRuleForm, setLocalShowRuleForm] = useState(false);
  const [localEditingRule, setLocalEditingRule] = useState(null);
  const [localRuleForm, setLocalRuleForm] = useState(defaultInitialRuleForm);
  const [localRuleFilterType, setLocalRuleFilterType] = useState('all');
  const [localRulePage, setLocalRulePage] = useState(1);
  const [localRulePageSize, setLocalRulePageSize] = useState(25);

  const showRuleForm = propShowRuleForm !== undefined ? propShowRuleForm : localShowRuleForm;
  const setShowRuleForm = propSetShowRuleForm || setLocalShowRuleForm;
  const editingRule = propEditingRule !== undefined ? propEditingRule : localEditingRule;
  const setEditingRule = propSetEditingRule || setLocalEditingRule;
  const ruleForm = propRuleForm || localRuleForm;
  const setRuleForm = propSetRuleForm || setLocalRuleForm;
  const ruleFilterType = propRuleFilterType || localRuleFilterType;
  const setRuleFilterType = propSetRuleFilterType || setLocalRuleFilterType;
  const rulePage = propRulePage || localRulePage;
  const setRulePage = propSetRulePage || setLocalRulePage;
  const rulePageSize = propRulePageSize || localRulePageSize;
  const setRulePageSize = propSetRulePageSize || setLocalRulePageSize;

  const handleRuleSubmit = propHandleRuleSubmit || (async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ruleForm,
        value: parseFloat(ruleForm.value) || 0,
        priority: parseInt(ruleForm.priority) || 0,
        country_id: ruleForm.country_id ? parseInt(ruleForm.country_id) : null,
        product_id: ruleForm.product_id ? parseInt(ruleForm.product_id) : null,
        user_id: ruleForm.user_id ? parseInt(ruleForm.user_id) : null,
        min_order_amount: ruleForm.min_order_amount ? parseFloat(ruleForm.min_order_amount) : null,
        usage_limit: ruleForm.usage_limit ? parseInt(ruleForm.usage_limit) : null,
        coupon_code: ruleForm.is_coupon && ruleForm.coupon_code ? String(ruleForm.coupon_code).trim().toUpperCase() : null,
        target_client_tag: ruleForm.target_client_tag ? String(ruleForm.target_client_tag).trim() : null
      };
      const url = editingRule ? `${API_BASE_URL}/api/ecommerce/admin/rules/${editingRule.id}` : `${API_BASE_URL}/api/ecommerce/admin/rules`;
      const method = editingRule ? 'PUT' : 'POST';
      const headers = { 'Content-Type': 'application/json', ...(getAuthHeader ? getAuthHeader() : {}) };
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowRuleForm(false);
        setEditingRule(null);
        if (fetchRules) fetchRules();
      }
    } catch (err) {
      console.error('Error saving rule:', err);
    }
  });

  const resetRuleForm = propResetRuleForm || (() => {
    setShowRuleForm(false);
    setEditingRule(null);
    setRuleForm(defaultInitialRuleForm);
  });

  const handleEditRule = propHandleEditRule || ((r) => {
    setEditingRule(r);
    setRuleForm({
      ...r,
      is_coupon: !!r.coupon_code,
      coupon_code: r.coupon_code || '',
      country_id: r.country_id ? String(r.country_id) : '',
      brand: r.brand || '',
      product_id: r.product_id ? String(r.product_id) : '',
      user_id: r.user_id ? String(r.user_id) : '',
      tipo_cliente: r.tipo_cliente || '',
      target_client_tag: r.target_client_tag || '',
      priority: r.priority || 10,
      min_order_amount: r.min_order_amount || '',
      valid_until: r.valid_until ? r.valid_until.split('T')[0] : '',
      usage_limit: r.usage_limit || ''
    });
    setShowRuleForm(true);
  });

  const handleDeleteRule = propHandleDeleteRule || (async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta regla o cupón?')) return;
    try {
      const headers = { ...(getAuthHeader ? getAuthHeader() : {}) };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/rules/${id}`, { method: 'DELETE', headers });
      if (res.ok && fetchRules) fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  });

  const countryScopedRules = propCountryScopedRules;
  const filteredRules = useMemo(() => {
    if (propFilteredRules.length > 0 && propRuleFilterType) return propFilteredRules;
    return countryScopedRules.filter(r => {
      if (ruleFilterType === 'coupons') return !!r.coupon_code && String(r.coupon_code).trim() !== '';
      if (ruleFilterType === 'rules') return !r.coupon_code || String(r.coupon_code).trim() === '';
      return true;
    });
  }, [countryScopedRules, propFilteredRules, propRuleFilterType, ruleFilterType]);

  const paginatedRules = useMemo(() => {
    if (propPaginatedRules.length > 0 && propRulePage) return propPaginatedRules;
    const start = (rulePage - 1) * rulePageSize;
    return filteredRules.slice(start, start + rulePageSize);
  }, [filteredRules, propPaginatedRules, propRulePage, rulePage, rulePageSize]);
  return (
    <section className="board-section">
      {/* Header & Sub-filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandingVectorIcon name="tag" size={22} color="#0FA4DE" strokeWidth={2.2} />
            <span>Cupones de Descuento y Reglas de Precios B2B</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
            Creá y administrá cupones promocionales con código y reglas de tarifas automáticas segmentadas por <strong>País</strong>, <strong>Cliente</strong>, <strong>Marca</strong> o <strong>Producto</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button"
            className="dacas-pill-btn active" 
            onClick={() => {
              const defaultCountryId = (selectedCountryScope && selectedCountryScope !== 'all')
                ? (dacasCountriesList.find(c => c.code === selectedCountryScope)?.id || '')
                : '';
              setEditingRule(null);
              setRuleForm({ 
                ...initialRuleForm, 
                is_coupon: true, 
                coupon_code: `DACAS-${Math.floor(100 + Math.random() * 900)}`,
                country_id: defaultCountryId ? String(defaultCountryId) : ''
              });
              setShowRuleForm(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontWeight: '800',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)'
            }}
          >
            <BrandingVectorIcon name="plus" size={14} color="#FFFFFF" strokeWidth={2.5} />
            <span>Crear Cupón de Descuento</span>
          </button>

          <button 
            type="button"
            className="dacas-pill-btn" 
            onClick={() => {
              const defaultCountryId = (selectedCountryScope && selectedCountryScope !== 'all')
                ? (dacasCountriesList.find(c => c.code === selectedCountryScope)?.id || '')
                : '';
              setEditingRule(null);
              setRuleForm({ 
                ...initialRuleForm, 
                is_coupon: false, 
                coupon_code: '',
                country_id: defaultCountryId ? String(defaultCountryId) : ''
              });
              setShowRuleForm(true);
            }}
            style={{
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: '700',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BrandingVectorIcon name="settings" size={13} color="#475569" strokeWidth={2} />
            <span>Nueva Regla Automática</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs / Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setRuleFilterType('all')}
          style={{
            background: ruleFilterType === 'all' ? '#0FA4DE' : '#F1F5F9',
            color: ruleFilterType === 'all' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '999px',
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Todos ({countryScopedRules.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setRuleFilterType('coupons')}
          style={{
            background: ruleFilterType === 'coupons' ? '#0FA4DE' : '#F1F5F9',
            color: ruleFilterType === 'coupons' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '999px',
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🎟️ Cupones con Código ({countryScopedRules.filter(r => r.coupon_code && String(r.coupon_code).trim()).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setRuleFilterType('rules')}
          style={{
            background: ruleFilterType === 'rules' ? '#0FA4DE' : '#F1F5F9',
            color: ruleFilterType === 'rules' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '999px',
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>⚙️ Tarifas y Reglas Automáticas ({countryScopedRules.filter(r => !r.coupon_code || !String(r.coupon_code).trim()).length})</span>
        </button>
      </div>

      <div style={{
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#0369A1',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        <span style={{ fontSize: '18px' }}>{activeCountryObj?.flag || '🇦🇷'}</span>
        <span>
          Cupones y reglas comerciales exclusivas para la filial de <strong>{activeCountryObj?.name || 'Argentina'} ({activeCountryObj?.code || 'AR'})</strong>.
        </span>
      </div>

      {/* Creation / Edit Form */}
      {showRuleForm && (
        <div style={{ background: '#FFFFFF', padding: '24px 28px', borderRadius: '18px', marginBottom: '24px', border: '1px solid #BAE6FD', boxShadow: '0 8px 24px rgba(15, 164, 222, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{editingRule ? '✏️ Editar Configuración de Descuento' : ruleForm.is_coupon ? '🎟️ Crear Nuevo Cupón de Descuento' : '⚙️ Crear Nueva Regla de Precio Automática'}</span>
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Segmentá el beneficio por <strong>País</strong>, <strong>Cliente específico</strong>, <strong>Marca</strong> o <strong>Producto</strong>
              </span>
            </div>

            {/* Toggle Mode */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
              <button
                type="button"
                onClick={() => setRuleForm({ ...ruleForm, is_coupon: true })}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: ruleForm.is_coupon ? '#0FA4DE' : 'transparent',
                  color: ruleForm.is_coupon ? '#FFFFFF' : '#475569'
                }}
              >
                🎟️ Cupón con Código
              </button>
              <button
                type="button"
                onClick={() => setRuleForm({ ...ruleForm, is_coupon: false, coupon_code: '' })}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: !ruleForm.is_coupon ? '#0FA4DE' : 'transparent',
                  color: !ruleForm.is_coupon ? '#FFFFFF' : '#475569'
                }}
              >
                ⚙️ Regla Automática B2B
              </button>
            </div>
          </div>

          <form onSubmit={handleRuleSubmit} className="crm-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              
              {/* Nombre descriptivo */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Nombre / Descripción del Descuento *</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                  required
                  placeholder="Ej: Cupón Promocional 20% en Fortinet para Clientes de Argentina"
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', width: '100%' }}
                />
              </div>

              {/* Código de cupón (si aplica) */}
              {ruleForm.is_coupon && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: '#0369A1', fontWeight: '800', fontSize: '12.5px' }}>🎟️ Código de Cupón *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const brandPrefix = ruleForm.brand ? ruleForm.brand.slice(0, 5).toUpperCase() : 'DACAS';
                        const randomCode = `${brandPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
                        setRuleForm({ ...ruleForm, coupon_code: randomCode });
                      }}
                      style={{ background: 'none', border: 'none', color: '#0FA4DE', fontSize: '11px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ⚡ Generar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ruleForm.coupon_code}
                    onChange={e => setRuleForm({ ...ruleForm, coupon_code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    required={ruleForm.is_coupon}
                    placeholder="Ej: FORTINET-ARG-20"
                    style={{ color: '#0369A1', background: '#F0F9FF', border: '1.5px solid #BAE6FD', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}
                  />
                </div>
              )}

              {/* Tipo de Ajuste */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Tipo de Ajuste *</label>
                <select
                  value={ruleForm.rule_type}
                  onChange={e => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="discount">🏷️ Descuento</option>
                  <option value="markup">📈 Recargo / Markup</option>
                  <option value="fixed_price">💲 Precio Fijo</option>
                </select>
              </div>

              {/* Formato de Valor (% vs USD) */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Unidad de Medida *</label>
                <select
                  value={ruleForm.value_type}
                  onChange={e => setRuleForm({ ...ruleForm, value_type: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo en USD ($)</option>
                </select>
              </div>

              {/* Valor numérico */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Valor del Beneficio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={ruleForm.value}
                  onChange={e => setRuleForm({ ...ruleForm, value: e.target.value })}
                  required
                  placeholder={ruleForm.value_type === 'percentage' ? 'Ej: 15 (para 15%)' : 'Ej: 50.00 (para $50 USD)'}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
                />
              </div>

              {/* DIMENSIÓN 1: PAÍS */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🌎 País Destino (Segmentación)</label>
                <select
                  value={ruleForm.country_id || ''}
                  onChange={e => setRuleForm({ ...ruleForm, country_id: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="">🌎 Válido para todos los países</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              {/* DIMENSIÓN 2: CLIENTE / USUARIO */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>👤 Cliente / Integrador Específico</label>
                <select
                  value={ruleForm.user_id || ''}
                  onChange={e => setRuleForm({ ...ruleForm, user_id: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="">👤 Válido para cualquier cliente</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      #{u.id} - {u.razon_social || u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* DIMENSIÓN 3: MARCA / FABRICANTE */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🏷️ Marca / Fabricante</label>
                <select
                  value={ruleForm.brand || ''}
                  onChange={e => setRuleForm({ ...ruleForm, brand: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="">🏷️ Aplica a todas las marcas</option>
                  <option value="Fortinet">Fortinet (Cybersecurity)</option>
                  <option value="MikroTik">MikroTik (Routers & Wireless)</option>
                  <option value="Aruba">Aruba Networks (Enterprise WiFi/Switching)</option>
                  <option value="AudioCodes">AudioCodes (VoIP & Microsoft Teams)</option>
                  <option value="Avaya">Avaya (Unified Communications)</option>
                  <option value="Vertiv">Vertiv (UPS & Data Center)</option>
                  <option value="Panduit">Panduit (Cabling & Racks)</option>
                  <option value="CommScope">CommScope (Enterprise Cabling)</option>
                  <option value="Eaton">Eaton (Power Quality)</option>
                  <option value="Sophos">Sophos (Security)</option>
                  <option value="SonicWall">SonicWall (Firewalls)</option>
                  <option value="Microsoft">Microsoft (Licencias & Cloud)</option>
                  <option value="Hikvision">Hikvision (Seguridad y CCTV)</option>
                  <option value="Grandstream">Grandstream (Telefonía IP)</option>
                  <option value="Dacas">Dacas Soluciones Integradas</option>
                </select>
              </div>

              {/* DIMENSIÓN 4: PRODUCTO ESPECÍFICO */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>📦 Producto Específico</label>
                <select
                  value={ruleForm.product_id || ''}
                  onChange={e => setRuleForm({ ...ruleForm, product_id: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="">📦 Aplica a todo el catálogo</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.brand || 'DACAS'}] - Base: ${p.price} USD
                    </option>
                  ))}
                </select>
              </div>

              {/* DIMENSIÓN 5: TIPO DE CLIENTE */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🏢 Tipo de Cliente (Segmento B2B)</label>
                <select
                  value={ruleForm.tipo_cliente || ''}
                  onChange={e => setRuleForm({ ...ruleForm, tipo_cliente: e.target.value })}
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                >
                  <option value="">Todos los segmentos de clientes</option>
                  {clientTypes.map(ct => (
                    <option key={ct.id || ct.name} value={ct.name}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DIMENSIÓN 6: TAG / ETIQUETA DE CLIENTE */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🏷️ Tag / Etiqueta de Cliente (Opcional)</label>
                <input
                  type="text"
                  value={ruleForm.target_client_tag || ''}
                  onChange={e => setRuleForm({ ...ruleForm, target_client_tag: e.target.value })}
                  placeholder="Ej: Partner Platinum, VIP, Gobierno..."
                  list="client-tags-suggestions-rules"
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                />
                <datalist id="client-tags-suggestions-rules">
                  {(SUGGESTED_CLIENT_TAGS || []).map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                  Aplica únicamente a clientes que tengan asignada esta etiqueta en su ficha.
                </span>
              </div>

              {/* CONDICIONES DE CUPÓN: MONTO MÍNIMO */}
              {ruleForm.is_coupon && (
                <div className="form-group">
                  <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>💵 Monto Mínimo de Pedido (USD, Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ruleForm.min_order_amount}
                    onChange={e => setRuleForm({ ...ruleForm, min_order_amount: e.target.value })}
                    placeholder="Ej: 500.00"
                    style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>
              )}

              {/* CONDICIONES DE CUPÓN: FECHA DE VENCIMIENTO */}
              {ruleForm.is_coupon && (
                <div className="form-group">
                  <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>📅 Fecha de Vencimiento (Opcional)</label>
                  <input
                    type="date"
                    value={ruleForm.valid_until}
                    onChange={e => setRuleForm({ ...ruleForm, valid_until: e.target.value })}
                    style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>
              )}

              {/* CONDICIONES DE CUPÓN: LÍMITE DE USOS */}
              {ruleForm.is_coupon && (
                <div className="form-group">
                  <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🔢 Límite de Usos Máximos (Opcional)</label>
                  <input
                    type="number"
                    value={ruleForm.usage_limit}
                    onChange={e => setRuleForm({ ...ruleForm, usage_limit: e.target.value })}
                    placeholder="Ej: 50 (Ilimitado si queda vacío)"
                    style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>
              )}

              {/* PRIORIDAD */}
              <div className="form-group">
                <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>⚡ Prioridad de Aplicación</label>
                <input
                  type="number"
                  value={ruleForm.priority}
                  onChange={e => setRuleForm({ ...ruleForm, priority: e.target.value })}
                  placeholder="0"
                  style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                />
              </div>

              {/* CHECKBOX ACTIVA */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '26px' }}>
                <input 
                  type="checkbox" 
                  id="rule_active" 
                  checked={ruleForm.is_active} 
                  onChange={e => setRuleForm({ ...ruleForm, is_active: e.target.checked })} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                />
                <label htmlFor="rule_active" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', color: '#0F172A', fontSize: '13px' }}>
                  {ruleForm.is_coupon ? 'Cupón Activo para Canje' : 'Regla de Precios Activa'}
                </label>
              </div>

            </div>

            {/* Impact Live Summary Box */}
            <div style={{
              marginTop: '20px',
              padding: '14px 18px',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#0369A1',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '16px', marginTop: '1px' }}>💡</span>
              <div>
                <strong>Resumen del impacto:</strong>{' '}
                {ruleForm.is_coupon ? (
                  <span>
                    El cupón <strong>{ruleForm.coupon_code || '[SIN CÓDIGO]'}</strong> otorgará un{' '}
                    <strong>{ruleForm.value ? (ruleForm.value_type === 'percentage' ? `${ruleForm.value}% OFF` : `$${ruleForm.value} USD de descuento`) : 'beneficio sin definir'}</strong>{' '}
                    para{' '}
                    <strong>
                      {ruleForm.user_id ? (users.find(u => String(u.id) === String(ruleForm.user_id))?.razon_social || `Cliente #${ruleForm.user_id}`) : 'cualquier cliente'}
                    </strong>
                    {ruleForm.country_id ? ` con entrega en ${countries.find(c => String(c.id) === String(ruleForm.country_id))?.name || 'país seleccionado'}` : ''}
                    {ruleForm.brand ? ` en equipos de la marca "${ruleForm.brand}"` : ''}
                    {ruleForm.product_id ? ` para el producto seleccionado` : ''}
                    {ruleForm.min_order_amount ? ` (con compra mínima de $${ruleForm.min_order_amount} USD)` : ''}
                    {ruleForm.valid_until ? ` hasta el ${ruleForm.valid_until}` : ''}.
                  </span>
                ) : (
                  <span>
                    Se aplicará una regla automática de{' '}
                    <strong>
                      {ruleForm.rule_type === 'discount' ? 'Descuento' : ruleForm.rule_type === 'markup' ? 'Recargo' : 'Precio Fijo'} de{' '}
                      {ruleForm.value ? (ruleForm.value_type === 'percentage' ? `${ruleForm.value}%` : `$${ruleForm.value} USD`) : '(Sin definir)'}
                    </strong>{' '}
                    para{' '}
                    <strong>
                      {ruleForm.user_id ? (users.find(u => String(u.id) === String(ruleForm.user_id))?.razon_social || `Cliente #${ruleForm.user_id}`) : 'todos los clientes'}
                    </strong>
                    {ruleForm.country_id ? ` en ${countries.find(c => String(c.id) === String(ruleForm.country_id))?.name || 'país seleccionado'}` : ''}
                    {ruleForm.brand ? ` en marca "${ruleForm.brand}"` : ''}
                    {ruleForm.product_id ? ` para el producto seleccionado` : ''}.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <button 
                type="submit" 
                className="btn-submit" 
                style={{ 
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '10px', 
                  padding: '10px 24px', 
                  fontWeight: '800', 
                  fontSize: '13px', 
                  cursor: 'pointer' 
                }}
              >
                {editingRule ? 'Guardar Modificaciones' : ruleForm.is_coupon ? 'Crear Cupón de Descuento' : 'Crear Regla de Precio'}
              </button>
              <button 
                type="button" 
                className="btn-delete" 
                onClick={resetRuleForm}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Rules & Coupons */}
      <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', minWidth: '180px' }}>Código / Nombre</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', width: '110px' }}>Beneficio</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', width: '90px' }}>🌎 País</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', minWidth: '140px' }}>👤 Cliente</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', width: '100px' }}>🏷️ Marca</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', minWidth: '130px' }}>📦 Producto</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', width: '140px' }}>Condiciones</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', width: '80px' }}>Estado</th>
              <th style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'center', width: '85px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRules.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏷️</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>No se encontraron cupones ni reglas</div>
                  <div style={{ fontSize: '12px' }}>Crea un nuevo cupón o regla de precios para {activeCountryObj.name}.</div>
                </td>
              </tr>
            ) : (
              paginatedRules.map(r => {
                const isCoupon = !!(r.coupon_code && String(r.coupon_code).trim());
                return (
                  <tr
                    key={r.id}
                    onClick={() => handleEditRule(r)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      height: '40px',
                      transition: 'background 0.15s ease'
                    }}
                    title="Click para ver o editar esta regla / cupón"
                  >
                    {/* Código / Nombre */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '240px' }}>
                      {isCoupon ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ 
                            background: '#E0F2FE', 
                            color: '#0369A1', 
                            padding: '2px 6px', 
                            borderRadius: '5px', 
                            fontWeight: '800', 
                            fontSize: '11px', 
                            letterSpacing: '0.5px',
                            border: '1px solid #BAE6FD',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            🎟️ {r.coupon_code}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong style={{ fontSize: '11.5px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</strong>
                          <span style={{ fontSize: '9.5px', color: '#0FA4DE', fontWeight: '700', background: '#F0F9FF', padding: '1px 5px', borderRadius: '3px' }}>B2B</span>
                        </div>
                      )}
                    </td>

                    {/* Ajuste / Beneficio */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: r.rule_type === 'discount' ? '#DCFCE7' : '#E0F2FE',
                        color: r.rule_type === 'discount' ? '#166534' : '#0369A1',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'inline-block'
                      }}>
                        {r.rule_type === 'discount' ? 'Desc ' : r.rule_type === 'markup' ? 'Markup ' : 'Fijo '}
                        {r.value_type === 'percentage' ? `${r.value}%` : `$${r.value} USD`}
                      </span>
                    </td>

                    {/* País */}
                    <td style={{ padding: '4px 10px', fontSize: '11px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {r.country_name || (r.country_id ? `${activeCountryObj.flag} ID:${r.country_id}` : (
                        <span style={{ color: '#0369a1', fontWeight: '600' }}>{activeCountryObj.flag} {activeCountryObj.name}</span>
                      ))}
                    </td>

                    {/* Cliente */}
                    <td style={{ padding: '4px 10px', fontSize: '11px', verticalAlign: 'middle', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.user_razon_social || r.user_email ? (
                        <span style={{ background: '#F1F5F9', color: '#0F172A', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10.5px' }} title={r.user_razon_social || r.user_email}>
                          👤 {r.user_razon_social || r.user_email}
                        </span>
                      ) : r.target_client_tag ? (
                        <span style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                          🏷️ {r.target_client_tag}
                        </span>
                      ) : r.tipo_cliente ? (
                        <span style={{ background: '#F8FAFC', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '600' }}>
                          🏢 {r.tipo_cliente}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Todos</span>
                      )}
                    </td>

                    {/* Marca */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {r.brand ? (
                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                          {r.brand}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic' }}>Todas</span>
                      )}
                    </td>

                    {/* Producto */}
                    <td style={{ padding: '4px 10px', fontSize: '11px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      {r.product_name || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Todo catálogo</span>}
                    </td>

                    {/* Condiciones & Usos */}
                    <td style={{ padding: '4px 10px', fontSize: '10.5px', color: '#475569', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {isCoupon ? (
                        <span>Usos: <strong>{r.times_used || 0}{r.usage_limit ? `/${r.usage_limit}` : ''}</strong></span>
                      ) : r.min_order_amount ? (
                        <span>Mín: ${parseFloat(r.min_order_amount).toFixed(0)}</span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Prio: {r.priority || 0}</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: r.is_active ? '#DCFCE7' : '#FEE2E2',
                        color: r.is_active ? '#166534' : '#DC2626',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '10.5px',
                        fontWeight: '800'
                      }}>
                        {r.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '4px 10px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          type="button"
                          onClick={() => handleEditRule(r)} 
                          style={{ 
                            background: '#F1F5F9', 
                            color: '#0284C7', 
                            border: '1px solid #CBD5E1', 
                            padding: '2px 6px', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontWeight: '700',
                            fontSize: '10.5px'
                          }}
                        >
                          Editar
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteRule(r.id)} 
                          style={{ 
                            background: '#FEE2E2', 
                            color: '#EF4444', 
                            border: 'none', 
                            padding: '2px 5px', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                          }}
                          title="Eliminar regla / cupón"
                        >
                          <BrandingVectorIcon name="trash" size={10} color="#EF4444" />
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

      {/* PAGINACIÓN DE REGLAS Y CUPONES */}
      <PaginationBar
        currentPage={rulePage}
        totalItems={filteredRules.length}
        pageSize={rulePageSize}
        onPageChange={setRulePage}
        onPageSizeChange={setRulePageSize}
        pageSizeOptions={[15, 25, 50, 100]}
      />
    </section>
  );
}
