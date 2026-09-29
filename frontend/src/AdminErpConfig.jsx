import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon from './BrandingVectorIcon';
import NotificationBell from './NotificationBell';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const COUNTRIES_LIST = [
  { name: 'Argentina', code: 'ARG', flag: '🇦🇷', currency: 'ARS', defaultTax: 'CUIT' },
  { name: 'Chile', code: 'CHL', flag: '🇨🇱', currency: 'CLP', defaultTax: 'RUT' },
  { name: 'Colombia', code: 'COL', flag: '🇨🇴', currency: 'COP', defaultTax: 'NIT' },
  { name: 'Perú', code: 'PER', flag: '🇵🇪', currency: 'PEN', defaultTax: 'RUC' },
  { name: 'Venezuela', code: 'VEN', flag: '🇻🇪', currency: 'USD', defaultTax: 'RIF' },
  { name: 'Estados Unidos', code: 'USA', flag: '🇺🇸', currency: 'USD', defaultTax: 'EIN' },
  { name: 'Uruguay', code: 'URY', flag: '🇺🇾', currency: 'UYU', defaultTax: 'RUT' },
  { name: 'Brasil', code: 'BRA', flag: '🇧🇷', currency: 'BRL', defaultTax: 'CNPJ' },
  { name: 'México', code: 'MEX', flag: '🇲🇽', currency: 'MXN', defaultTax: 'RFC' },
  { name: 'Ecuador', code: 'ECU', flag: 'ECU', currency: 'USD', defaultTax: 'RUC' },
  { name: 'Costa Rica', code: 'CRI', flag: '🇨🇷', currency: 'CRC', defaultTax: 'Cédula Jurídica' },
  { name: 'Panamá', code: 'PAN', flag: '🇵🇦', currency: 'USD', defaultTax: 'RUC' }
];

export default function AdminErpConfig({ embedded = false, usuario, theme = 'light', onBack }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apis'); // 'apis' | 'params' | 'fiscal' | 'maintenance'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Settings & Country APIs
  const [settings, setSettings] = useState({
    instance_name: 'DACAS Enterprise ERP OneWorld Cluster',
    version: '2.0.0',
    base_currency: 'USD',
    multi_subsidiary_consolidation: true,
    require_ceo_venezuela: true,
    strict_credit_limit: true,
    auto_generate_invoices: true,
    auto_generate_remitos: true,
    inventory_cost_method: 'FIFO Estricto',
    decimals: 2,
    sync_interval_minutes: 15,
    email_notifications_enabled: true,
    webhook_enabled: true,
    prefixes: {
      sales_order: 'SO-',
      purchase_order: 'PO-',
      invoice: 'INV-',
      remito: 'REM-',
      vendor_bill: 'VB-',
      journal_entry: 'JE-',
      customer_id: 'CLI-ERP-'
    },
    fiscal_rules: {}
  });

  const [countryApis, setCountryApis] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [searchCountry, setSearchCountry] = useState('');

  // Modal State for Country API
  const [showApiModal, setShowApiModal] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [apiForm, setApiForm] = useState({
    country: 'Argentina',
    code: 'ARG',
    flag: '🇦🇷',
    api_name: '',
    endpoint_url: '',
    environment: 'Producción',
    auth_type: 'Bearer Token',
    api_key_or_token: '',
    subsidiary_id: '',
    subsidiary_name: '',
    timeout_ms: 5000,
    status: 'Activo',
    enabled: true,
    notes: ''
  });

  // Ping Testing State
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Reconciliation State
  const [reconcileReport, setReconcileReport] = useState(null);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resSettings, resApis, resSubs] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/settings`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/country-apis`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/subsidiaries`)
      ]);

      if (resSettings.ok) {
        const sData = await resSettings.json();
        setSettings(sData);
      }
      if (resApis.ok) {
        const aData = await resApis.json();
        setCountryApis(aData);
      }
      if (resSubs.ok) {
        const subData = await resSubs.json();
        setSubsidiaries(subData);
      }
    } catch (err) {
      console.error('Error fetching ERP admin config:', err);
      showTemporaryFeedback('Error al cargar datos del ERP Admin: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const showTemporaryFeedback = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Save Global Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Error al guardar configuración global.');
      const data = await res.json();
      setSettings(data.settings);
      showTemporaryFeedback('Configuración global y parámetros ERP guardados exitosamente.');
    } catch (err) {
      showTemporaryFeedback('Error: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // Open Modal to Add/Edit API
  const handleOpenApiModal = (api = null) => {
    if (api) {
      setEditingApi(api);
      setApiForm({
        id: api.id,
        country: api.country || 'Argentina',
        code: api.code || 'ARG',
        flag: api.flag || '🇦🇷',
        api_name: api.api_name || '',
        endpoint_url: api.endpoint_url || '',
        environment: api.environment || 'Producción',
        auth_type: api.auth_type || 'Bearer Token',
        api_key_or_token: api.api_key_or_token || '',
        subsidiary_id: api.subsidiary_id || '',
        subsidiary_name: api.subsidiary_name || '',
        timeout_ms: api.timeout_ms || 5000,
        status: api.status || 'Activo',
        enabled: api.enabled !== undefined ? api.enabled : true,
        notes: api.notes || ''
      });
    } else {
      setEditingApi(null);
      setApiForm({
        country: 'Argentina',
        code: 'ARG',
        flag: '🇦🇷',
        api_name: '',
        endpoint_url: '',
        environment: 'Producción',
        auth_type: 'Bearer Token',
        api_key_or_token: '',
        subsidiary_id: subsidiaries.length > 0 ? subsidiaries[0].id : '',
        subsidiary_name: subsidiaries.length > 0 ? subsidiaries[0].name : '',
        timeout_ms: 5000,
        status: 'Activo',
        enabled: true,
        notes: ''
      });
    }
    setShowApiModal(true);
  };

  // Country selection in modal
  const handleCountryChange = (cName) => {
    const found = COUNTRIES_LIST.find(c => c.name === cName);
    const subMatch = subsidiaries.find(s => s.country === cName);
    setApiForm(prev => ({
      ...prev,
      country: cName,
      code: found ? found.code : 'GEN',
      flag: found ? found.flag : '🌐',
      subsidiary_id: subMatch ? subMatch.id : prev.subsidiary_id,
      subsidiary_name: subMatch ? subMatch.name : prev.subsidiary_name
    }));
  };

  // Save Country API
  const handleSaveCountryApi = async (e) => {
    e.preventDefault();
    if (!apiForm.api_name.trim() || !apiForm.endpoint_url.trim()) {
      showTemporaryFeedback('Complete los campos obligatorios (Nombre de API y URL Endpoint)', true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/country-apis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiForm)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Error al guardar API');
      }
      const data = await res.json();
      showTemporaryFeedback(data.message || 'API por país guardada correctamente.');
      setShowApiModal(false);
      const resApis = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/country-apis`);
      if (resApis.ok) setCountryApis(await resApis.json());
    } catch (err) {
      showTemporaryFeedback(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // Delete Country API
  const handleDeleteApi = async (id, name) => {
    if (!window.confirm(`¿Está seguro de eliminar la integración "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/country-apis/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      showTemporaryFeedback(`Integración "${name}" eliminada.`);
      setCountryApis(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      showTemporaryFeedback(err.message, true);
    }
  };

  // Test Connection Ping
  const handleTestConnection = async (api) => {
    setTestingId(api.id);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/country-apis/${api.id}/test`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fallo de ping');
      setTestResult(data);
      setCountryApis(prev => prev.map(c => c.id === api.id ? { ...c, ping_latency_ms: data.latency_ms, last_ping: new Date().toISOString() } : c));
      showTemporaryFeedback(`Conexión exitosa con ${api.country} — Latencia: ${data.latency_ms}ms`);
    } catch (err) {
      showTemporaryFeedback(`Error de conexión con ${api.country}: ${err.message}`, true);
    } finally {
      setTestingId(null);
    }
  };

  // Reconcile Balances
  const handleReconcile = async () => {
    setReconciling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/reconcile`, { method: 'POST' });
      if (!res.ok) throw new Error('Error ejecutando reconciliación');
      const data = await res.json();
      setReconcileReport(data.reconciliation);
      showTemporaryFeedback('Auditoría y conciliación contable completada sin discrepancias.');
    } catch (err) {
      showTemporaryFeedback(err.message, true);
    } finally {
      setReconciling(false);
    }
  };

  // Download Backup
  const handleDownloadBackup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/backup`);
      if (!res.ok) throw new Error('Error al generar respaldo');
      const backupObj = await res.json();
      const blob = new Blob([JSON.stringify(backupObj.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupObj.filename || 'dacaserp_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showTemporaryFeedback('Copia de respaldo JSON descargada exitosamente.');
    } catch (err) {
      showTemporaryFeedback(err.message, true);
    }
  };

  const filteredApis = countryApis.filter(api => {
    const q = searchCountry.toLowerCase();
    return (
      (api.country && api.country.toLowerCase().includes(q)) ||
      (api.api_name && api.api_name.toLowerCase().includes(q)) ||
      (api.code && api.code.toLowerCase().includes(q)) ||
      (api.endpoint_url && api.endpoint_url.toLowerCase().includes(q))
    );
  });

  return (
    <div className="erp-config-wrap" style={{
      padding: embedded ? '0' : '28px 36px',
      maxWidth: '1680px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: 'var(--text-main, #0f172a)',
      background: 'transparent'
    }}>
      <style>{`
        .erp-config-wrap {
          color: var(--text-main, #0f172a);
        }
        [data-theme='dark'] .erp-config-wrap {
          color: #ffffff !important;
        }
        [data-theme='dark'] .erp-config-wrap div[style*="background: #FFFFFF"],
        [data-theme='dark'] .erp-config-wrap div[style*="background:#FFFFFF"],
        [data-theme='dark'] .erp-config-wrap div[style*="background: rgb(255, 255, 255)"],
        [data-theme='dark'] .erp-config-wrap div[style*="background-color: #FFFFFF"],
        [data-theme='dark'] .erp-config-wrap div[style*="background-color: rgb(255, 255, 255)"],
        [data-theme='dark'] .erp-config-wrap div[style*="background: white"],
        [data-theme='dark'] .erp-config-wrap div[style*="background:#ffffff"],
        [data-theme='dark'] .erp-config-wrap div[style*="background: #ffffff"] {
          background: var(--card-bg, #0f2742) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-config-wrap div[style*="background: #F8FAFC"],
        [data-theme='dark'] .erp-config-wrap div[style*="background:#F8FAFC"],
        [data-theme='dark'] .erp-config-wrap div[style*="background: rgb(248, 250, 252)"],
        [data-theme='dark'] .erp-config-wrap div[style*="background-color: #F8FAFC"],
        [data-theme='dark'] .erp-config-wrap div[style*="background: #f8fafc"],
        [data-theme='dark'] .erp-config-wrap button[style*="background: #F8FAFC"],
        [data-theme='dark'] .erp-config-wrap button[style*="background:#F8FAFC"],
        [data-theme='dark'] .erp-config-wrap button[style*="background: rgb(248, 250, 252)"],
        [data-theme='dark'] .erp-config-wrap button[style*="background: #f8fafc"] {
          background: var(--pill-bg, #12354c) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-config-wrap [style*="color: #071524"],
        [data-theme='dark'] .erp-config-wrap [style*="color:#071524"],
        [data-theme='dark'] .erp-config-wrap [style*="color: #0f172a"],
        [data-theme='dark'] .erp-config-wrap [style*="color:#0f172a"],
        [data-theme='dark'] .erp-config-wrap [style*="color: #1e293b"],
        [data-theme='dark'] .erp-config-wrap [style*="color: #334155"],
        [data-theme='dark'] .erp-config-wrap [style*="color: rgb(7, 21, 36)"],
        [data-theme='dark'] .erp-config-wrap [style*="color: rgb(15, 23, 42)"] {
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-config-wrap [style*="color: #64748B"],
        [data-theme='dark'] .erp-config-wrap [style*="color:#64748B"],
        [data-theme='dark'] .erp-config-wrap [style*="color: #475569"],
        [data-theme='dark'] .erp-config-wrap [style*="color:#475569"],
        [data-theme='dark'] .erp-config-wrap [style*="color: rgb(100, 116, 139)"],
        [data-theme='dark'] .erp-config-wrap [style*="color: rgb(71, 85, 105)"] {
          color: var(--text-muted, #94a3b8) !important;
        }
        [data-theme='dark'] .erp-config-wrap select,
        [data-theme='dark'] .erp-config-wrap input,
        [data-theme='dark'] .erp-config-wrap textarea {
          background-color: var(--input-bg, #0b1d33) !important;
          color: var(--text-main, #ffffff) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
        }
        [data-theme='dark'] .erp-config-wrap select option {
          background-color: var(--card-bg, #0f2742) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-config-wrap th {
          background: var(--pill-bg, #12354c) !important;
          color: #38bdf8 !important;
          border-bottom-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
        }
        [data-theme='dark'] .erp-config-wrap td {
          border-bottom-color: rgba(255, 255, 255, 0.08) !important;
          color: var(--text-main, #ffffff) !important;
        }
      `}</style>
      {/* ── TOP HEADER: DACAS ERP Admin ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        padding: '20px 24px',
        borderRadius: '16px',
        background: 'var(--card-bg, #FFFFFF)',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: 'var(--shadow-md, 0 4px 20px rgba(0,0,0,0.03))'
      }}>
        {/* Left Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!embedded && (
            <button
              type="button"
              onClick={onBack ? onBack : () => navigate('/')}
              style={{
                background: 'var(--pill-bg, #F8FAFC)',
                border: '1px solid var(--border-color, #CBD5E1)',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--primary, #0fa4de)',
                fontSize: '13px',
                fontWeight: '800',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Ir a Home / Panel Principal"
            >
              <BrandingVectorIcon name="home" size={16} color="var(--primary, #0fa4de)" />
              <span>Home</span>
            </button>
          )}

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
            flexShrink: 0
          }}>
            <BrandingVectorIcon name="server" size={24} color="#ffffff" />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#071524', letterSpacing: '-0.02em' }}>
              ERP Admin & Integraciones
            </h1>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            padding: '8px 14px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#166534'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px #22C55E'
            }} />
            <span>Base ERP Activa (erp_database.json)</span>
          </div>

          {/* Notification Bell */}
          <NotificationBell 
            usuario={usuario}
            onNavigate={(targetView) => {
              if (onBack) onBack();
              else window.location.href = targetView === 'erp' ? '/admin/erp' : targetView === 'ecommerce' ? '/admin/ecommerce' : '/';
            }}
          />

          {/* Reconcile Button */}
          <button
            type="button"
            onClick={handleReconcile}
            disabled={reconciling}
            style={{
              background: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '9px 15px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: reconciling ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <BrandingVectorIcon name="refresh" size={14} color="#0284C7" />
            <span>{reconciling ? 'Auditando...' : 'Conciliar ERP'}</span>
          </button>

          {/* Backup Button */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            style={{
              background: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '9px 15px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <BrandingVectorIcon name="download" size={14} color="#0284C7" />
            <span>Exportar Backup</span>
          </button>

          {/* New API or Save Params depending on tab */}
          {activeTab === 'apis' && (
            <button
              type="button"
              onClick={() => handleOpenApiModal()}
              style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)'
              }}
            >
              <BrandingVectorIcon name="plus" size={14} color="#FFFFFF" />
              <span>Nueva API País</span>
            </button>
          )}

          {activeTab === 'params' && (
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)'
              }}
            >
              <BrandingVectorIcon name="save" size={14} color="#FFFFFF" />
              <span>{saving ? 'Guardando...' : 'Guardar Parámetros'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Toast Feedback ── */}
      {feedback && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 20px',
          borderRadius: '12px',
          background: feedback.isError ? '#FEF2F2' : '#EFF6FF',
          border: `1px solid ${feedback.isError ? '#FECACA' : '#BAE6FD'}`,
          color: feedback.isError ? '#DC2626' : '#0369A1',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandingVectorIcon name={feedback.isError ? "alert-circle" : "check-circle"} size={16} color={feedback.isError ? "#DC2626" : "#0369A1"} />
            <span>{feedback.msg}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            <BrandingVectorIcon name="close" size={14} color="currentColor" />
          </button>
        </div>
      )}

      {/* ── MAIN ERP CONFIG NAVIGATION TABS ── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          type="button"
          onClick={onBack ? onBack : () => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '3px solid transparent',
            padding: '12px 18px',
            borderRadius: '12px 12px 0 0',
            fontWeight: '800',
            fontSize: '13.5px',
            color: '#0fa4de',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Ir a Home / Panel Principal"
        >
          <BrandingVectorIcon name="home" size={17} color="#0fa4de" />
          <span>Home</span>
        </button>
        {[
          { key: 'apis', label: 'APIs & Facturación por País', icon: 'globe', badge: countryApis.length },
          { key: 'params', label: 'Parámetros Globales ERP', icon: 'sliders' },
          { key: 'fiscal', label: 'Reglas Fiscales & Impuestos', icon: 'shield' },
          { key: 'maintenance', label: 'Auditoría & Reconciliación', icon: 'activity' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #0fa4de' : '3px solid transparent',
                padding: '12px 18px',
                borderRadius: '12px 12px 0 0',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13.5px',
                color: isActive ? '#0284c7' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 -2px 10px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <BrandingVectorIcon name={tab.icon} size={16} color={isActive ? '#0fa4de' : '#64748B'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span style={{
                  background: isActive ? '#E0F2FE' : '#F1F5F9',
                  color: isActive ? '#0284C7' : '#64748B',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <div style={{ marginBottom: '12px' }}>
            <BrandingVectorIcon name="refresh" size={32} color="#0fa4de" />
          </div>
          <p style={{ fontWeight: '700', fontSize: '15px', color: '#071524' }}>
            Cargando consola de administración del ERP...
          </p>
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: APIS & FACTURACIÓN POR PAÍS
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'apis' && (
            <div>
              {/* Search and stats bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px'
              }}>
                <div style={{ position: 'relative', width: '340px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por país, servicio o endpoint..."
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '10px', display: 'flex' }}>
                    <BrandingVectorIcon name="search" size={15} color="#94A3B8" />
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                  Mostrando {filteredApis.length} de {countryApis.length} integraciones activas en LATAM & Global
                </div>
              </div>

              {/* Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '16px'
              }}>
                {filteredApis.map(api => (
                  <div
                    key={api.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '28px', lineHeight: 1 }}>{api.flag || '🌐'}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#071524' }}>
                                {api.country}
                              </h3>
                              <span style={{
                                background: '#F1F5F9',
                                color: '#475569',
                                fontSize: '10px',
                                fontWeight: '800',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                {api.code}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>
                              {api.subsidiary_name || 'Multi-Subsidiary Global'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: api.environment === 'Producción' ? '#DCFCE7' : '#FEF3C7',
                            color: api.environment === 'Producción' ? '#166534' : '#92400E',
                            border: `1px solid ${api.environment === 'Producción' ? '#86EFAC' : '#FDE68A'}`
                          }}>
                            {api.environment}
                          </span>
                        </div>
                      </div>

                      {/* API Details */}
                      <div style={{ margin: '12px 0', fontSize: '13px' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '6px', fontSize: '13.5px' }}>
                          {api.api_name}
                        </div>
                        <div style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          color: '#0369A1',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '10px'
                        }}>
                          {api.endpoint_url}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                          <div><strong style={{ color: '#334155' }}>Autenticación:</strong> {api.auth_type}</div>
                          <div><strong style={{ color: '#334155' }}>Timeout:</strong> {api.timeout_ms || 5000} ms</div>
                          <div>
                            <strong style={{ color: '#334155' }}>Latencia:</strong>{' '}
                            <span style={{ color: '#0284C7', fontWeight: '800' }}>
                              {api.ping_latency_ms ? `${api.ping_latency_ms} ms` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <strong style={{ color: '#334155' }}>Estado:</strong>{' '}
                            <span style={{ color: api.status === 'Activo' ? '#16A34A' : '#EA580C', fontWeight: '800' }}>
                              ● {api.status}
                            </span>
                          </div>
                        </div>

                        {api.notes && (
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                            "{api.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                      marginTop: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleTestConnection(api)}
                        disabled={testingId === api.id}
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#15803D',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: testingId === api.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <BrandingVectorIcon name="zap" size={13} color="#15803D" />
                        <span>{testingId === api.id ? 'Probando...' : 'Probar Conexión'}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenApiModal(api)}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BrandingVectorIcon name="edit" size={12} color="#334155" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApi(api.id, api.api_name)}
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            borderRadius: '8px',
                            padding: '7px 10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <BrandingVectorIcon name="trash" size={13} color="#DC2626" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 2: PARÁMETROS GLOBALES DEL ERP
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'params' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#071524' }}>
                  Parámetros Corporativos ERP OneWorld
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Ajuste de nomenclaturas, validaciones cruzadas entre subsidiarias y políticas de emisión de comprobantes.
                </p>
              </div>

              {/* Grid of Parameter Groups */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
                {/* General Info */}
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BrandingVectorIcon name="building" size={18} color="#0284C7" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0369A1' }}>
                      Identidad & Moneda Corporativa
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Nombre del Cluster ERP
                      </label>
                      <input
                        type="text"
                        value={settings.instance_name || ''}
                        onChange={(e) => setSettings({ ...settings, instance_name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                          Moneda Base Consolidada
                        </label>
                        <select
                          value={settings.base_currency || 'USD'}
                          onChange={(e) => setSettings({ ...settings, base_currency: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                        >
                          <option value="USD">USD - Dólar Estadounidense</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="ARS">ARS - Peso Argentino</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                          Método de Costeo Stock
                        </label>
                        <select
                          value={settings.inventory_cost_method || 'FIFO Estricto'}
                          onChange={(e) => setSettings({ ...settings, inventory_cost_method: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                        >
                          <option value="FIFO Estricto">FIFO Estricto</option>
                          <option value="Promedio Ponderado">Promedio Ponderado</option>
                          <option value="LIFO">LIFO</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policies & Controls */}
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BrandingVectorIcon name="shield" size={18} color="#0284C7" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0369A1' }}>
                      Políticas de Control & Validación
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                      <input
                        type="checkbox"
                        checked={!!settings.strict_credit_limit}
                        onChange={(e) => setSettings({ ...settings, strict_credit_limit: e.target.checked })}
                      />
                      <span><strong>Control estricto de Crédito:</strong> Bloquear facturación si se supera límite crediticio</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                      <input
                        type="checkbox"
                        checked={!!settings.require_ceo_venezuela}
                        onChange={(e) => setSettings({ ...settings, require_ceo_venezuela: e.target.checked })}
                      />
                      <span><strong>Validación CEO Venezuela:</strong> Exigir nombre del CEO / Director para End Users</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                      <input
                        type="checkbox"
                        checked={!!settings.auto_generate_invoices}
                        onChange={(e) => setSettings({ ...settings, auto_generate_invoices: e.target.checked })}
                      />
                      <span><strong>Emisión automática de Factura:</strong> Generar número fiscal al aprobar orden de venta</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                      <input
                        type="checkbox"
                        checked={!!settings.auto_generate_remitos}
                        onChange={(e) => setSettings({ ...settings, auto_generate_remitos: e.target.checked })}
                      />
                      <span><strong>Despacho automático de Remito:</strong> Emitir remito oficial para logística</span>
                    </label>
                  </div>
                </div>

                {/* Prefixes */}
                <div style={{ gridColumn: '1 / -1', background: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BrandingVectorIcon name="file-text" size={18} color="#0284C7" />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0369A1' }}>
                      Prefijos y Nomenclatura de Transacciones
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Órdenes de Venta (SO)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.sales_order) || 'SO-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, sales_order: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Facturas Clientes (INV)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.invoice) || 'INV-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, invoice: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Remitos de Despacho (REM)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.remito) || 'REM-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, remito: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Órdenes de Compra (PO)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.purchase_order) || 'PO-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, purchase_order: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Facturas Proveedor (VB)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.vendor_bill) || 'VB-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, vendor_bill: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        Asientos Libro Diario (JE)
                      </label>
                      <input
                        type="text"
                        value={(settings.prefixes && settings.prefixes.journal_entry) || 'JE-'}
                        onChange={(e) => setSettings({
                          ...settings,
                          prefixes: { ...settings.prefixes, journal_entry: e.target.value }
                        })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Bar */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.3)'
                  }}
                >
                  <BrandingVectorIcon name="save" size={16} color="#FFFFFF" />
                  <span>{saving ? 'Guardando cambios...' : 'Guardar Todos los Parámetros'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: REGLAS FISCALES & IMPUESTOS
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'fiscal' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#071524' }}>
                    Reglas Fiscales e Impuestos por País
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    Configuración de alícuotas de IVA / VAT, identificadores tributarios oficiales y regímenes de comprobantes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="save" size={14} color="#FFFFFF" />
                  <span>Guardar Tasas</span>
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '18px'
              }}>
                {COUNTRIES_LIST.slice(0, 6).map(country => {
                  const key = country.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
                  const rule = (settings.fiscal_rules && settings.fiscal_rules[key]) || {
                    tax_id_name: country.defaultTax,
                    vat_rate: country.name === 'Argentina' ? 21 : country.name === 'Chile' || country.name === 'Colombia' ? 19 : country.name === 'Perú' ? 18 : country.name === 'Venezuela' ? 16 : 7,
                    currency: country.currency,
                    requires_electronic_invoice: true
                  };

                  return (
                    <div
                      key={country.code}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '24px' }}>{country.flag}</span>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#071524' }}>{country.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Moneda: {rule.currency || country.currency}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                          {country.code}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                        <div>
                          <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '4px' }}>ID Tributario</label>
                          <input
                            type="text"
                            value={rule.tax_id_name || country.defaultTax}
                            onChange={(e) => {
                              const newRules = { ...settings.fiscal_rules };
                              newRules[key] = { ...rule, tax_id_name: e.target.value };
                              setSettings({ ...settings, fiscal_rules: newRules });
                            }}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '4px' }}>Alícuota IVA (%)</label>
                          <input
                            type="number"
                            value={rule.vat_rate !== undefined ? rule.vat_rate : 21}
                            onChange={(e) => {
                              const newRules = { ...settings.fiscal_rules };
                              newRules[key] = { ...rule, vat_rate: parseFloat(e.target.value) || 0 };
                              setSettings({ ...settings, fiscal_rules: newRules });
                            }}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', fontSize: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                          <input
                            type="checkbox"
                            checked={!!rule.requires_electronic_invoice}
                            onChange={(e) => {
                              const newRules = { ...settings.fiscal_rules };
                              newRules[key] = { ...rule, requires_electronic_invoice: e.target.checked };
                              setSettings({ ...settings, fiscal_rules: newRules });
                            }}
                          />
                          <span>Facturación electrónica mandatoria</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 4: MANTENIMIENTO & RECONCILIACIÓN
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}>
                <div style={{ marginBottom: '22px' }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#071524' }}>
                    Auditoría de Integridad y Reconciliación ERP
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    Verificación de consistencia entre cuentas comerciales por cobrar (A/R), por pagar (A/P) y base independiente.
                  </p>
                </div>

                {reconcileReport ? (
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '22px',
                    marginBottom: '22px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16A34A', fontWeight: '800', marginBottom: '16px', fontSize: '14px' }}>
                      <BrandingVectorIcon name="check-circle" size={18} color="#16A34A" />
                      <span>Auditoría de Balances Finalizada — Discrepancias Detectadas: {reconcileReport.discrepancies_detected}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Total Facturación Bruta</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#071524', marginTop: '4px' }}>
                          USD ${(reconcileReport.total_invoices_usd || 0).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Cuentas por Cobrar (A/R)</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284C7', marginTop: '4px' }}>
                          USD ${(reconcileReport.accounts_receivable_ar_usd || 0).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Cuentas por Pagar (A/P)</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#DC2626', marginTop: '4px' }}>
                          USD ${(reconcileReport.accounts_payable_ap_usd || 0).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Subsidiarias Auditadas</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#16A34A', marginTop: '4px' }}>
                          {reconcileReport.subsidiaries_audited} Activas
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: '14px', marginBottom: '22px', border: '1px dashed #CBD5E1' }}>
                    <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 14px 0', fontWeight: '600' }}>
                      Ejecute la verificación para certificar la integridad de las transacciones en la base de datos independiente.
                    </p>
                    <button
                      type="button"
                      onClick={handleReconcile}
                      disabled={reconciling}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)'
                      }}
                    >
                      <BrandingVectorIcon name="refresh" size={15} color="#FFFFFF" />
                      <span>{reconciling ? 'Ejecutando conciliación...' : 'Ejecutar Auditoría Ahora'}</span>
                    </button>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#071524' }}>Copia de Seguridad de la Base ERP</strong>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Descarga instantánea del archivo JSON con la arquitectura ERP OneWorld completa.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <BrandingVectorIcon name="download" size={14} color="#0284C7" />
                    <span>Descargar dacaserp_backup.json</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: AGREGAR / EDITAR API PAÍS
      ══════════════════════════════════════════════════════════════════════ */}
      {showApiModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #CBD5E1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#071524' }}>
                  {editingApi ? 'Editar Integración API País' : 'Nueva Integración API por País'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Conector de facturación electrónica, impuestos o webhook para subsidiaria regional
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <BrandingVectorIcon name="close" size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleSaveCountryApi} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Country & Flag */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    País Destino *
                  </label>
                  <select
                    value={apiForm.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    {COUNTRIES_LIST.map(c => (
                      <option key={c.code} value={c.name}>{c.flag} {c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Código ISO
                  </label>
                  <input
                    type="text"
                    value={apiForm.code}
                    readOnly
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '13px', fontWeight: '800' }}
                  />
                </div>
              </div>

              {/* API Name & Environment */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Nombre del Servicio / API *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AFIP WSFE v1 / SII DTE / DIAN CUFE"
                    value={apiForm.api_name}
                    onChange={(e) => setApiForm({ ...apiForm, api_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Entorno *
                  </label>
                  <select
                    value={apiForm.environment}
                    onChange={(e) => setApiForm({ ...apiForm, environment: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Producción">Producción</option>
                    <option value="Homologación">Homologación</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              {/* Endpoint URL */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  URL Endpoint Oficial *
                </label>
                <input
                  type="url"
                  placeholder="https://api.tributaria.gov/v1/..."
                  value={apiForm.endpoint_url}
                  onChange={(e) => setApiForm({ ...apiForm, endpoint_url: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              {/* Auth Type & Secret/Token */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Tipo de Autenticación
                  </label>
                  <select
                    value={apiForm.auth_type}
                    onChange={(e) => setApiForm({ ...apiForm, auth_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="Certificado Digital X.509">Certificado Digital X.509</option>
                    <option value="API Key Header">API Key Header</option>
                    <option value="Basic Auth">Basic Auth</option>
                    <option value="OAuth 2.0">OAuth 2.0</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Token / API Key / Credencial Secreta
                  </label>
                  <input
                    type="password"
                    placeholder="Clave secreta o token criptográfico"
                    value={apiForm.api_key_or_token}
                    onChange={(e) => setApiForm({ ...apiForm, api_key_or_token: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Subsidiary Assignment & Timeout */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Asignar a Subsidiaria ERP
                  </label>
                  <select
                    value={apiForm.subsidiary_name}
                    onChange={(e) => {
                      const match = subsidiaries.find(s => s.name === e.target.value);
                      setApiForm({
                        ...apiForm,
                        subsidiary_name: e.target.value,
                        subsidiary_id: match ? match.id : null
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="">Todas / Multi-Subsidiary Global</option>
                    {subsidiaries.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.country})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={apiForm.timeout_ms}
                    onChange={(e) => setApiForm({ ...apiForm, timeout_ms: parseInt(e.target.value) || 5000 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Notas de Configuración / Certificación
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre CAE, numeración autorizada o vencimiento de certificados..."
                  value={apiForm.notes}
                  onChange={(e) => setApiForm({ ...apiForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="save" size={14} color="#FFFFFF" />
                  <span>{saving ? 'Guardando...' : editingApi ? 'Actualizar Integración' : 'Guardar Integración'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
