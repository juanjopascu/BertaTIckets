import React, { useState, useEffect } from 'react';
import BrandingVectorIcon from './BrandingVectorIcon';
import NotificationBell from './NotificationBell';

const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;

const LATAM_COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú',
  'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela', 'Estados Unidos'
];

export default function AdminErp({ usuario, theme = 'light', embedded = false, onBack }) {
  // Navigation
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'order_to_cash' | 'procure_to_pay' | 'inventory' | 'financials' | 'oneworld'
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Sub-tabs for each module
  const [subTabVentas, setSubTabVentas] = useState('sales_orders'); // 'sales_orders' | 'invoices' | 'credit' | 'end_users'
  const [subTabCompras, setSubTabCompras] = useState('purchase_orders'); // 'purchase_orders' | 'vendor_bills' | 'vendors'
  const [subTabInventario, setSubTabInventario] = useState('items_master'); // 'items_master' | 'locations' | 'adjustments'
  const [subTabFinanzas, setSubTabFinanzas] = useState('chart_of_accounts'); // 'chart_of_accounts' | 'journal_entries' | 'aging'
  const [subTabOneWorld, setSubTabOneWorld] = useState('subsidiaries'); // 'subsidiaries' | 'currencies'

  // Data Store
  const [stats, setStats] = useState({
    totalRevenue: 106700,
    accountsReceivableAR: 34200,
    accountsPayableAP: 145000,
    inventoryValuation: 506300,
    cashBankBalance: 2480500,
    totalSalesOrders: 4,
    openSalesOrdersCount: 2,
    totalPurchaseOrders: 3,
    totalVendors: 4,
    totalEndUsers: 3,
    totalCatalogItems: 6,
    activeSubsidiariesCount: 5,
    databaseStatus: 'connected',
    latencyMs: 1,
    lastSync: new Date().toISOString(),
    erpSystem: 'DACAS ERP OneWorld (Base Independiente)',
    environment: 'local_database'
  });

  const [subsidiaries, setSubsidiaries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [endUsers, setEndUsers] = useState([]);

  // Filters & Searches
  const [generalSearch, setGeneralSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [locationFilter, setLocationFilter] = useState('Todas');

  // Modals
  const [showAbmModal, setShowAbmModal] = useState(false);
  const [abmMode, setAbmMode] = useState('new');
  const [selectedEndUserId, setSelectedEndUserId] = useState('');
  const [endUserForm, setEndUserForm] = useState({
    nombre: '', direccion: '', ciudad: '', pais: 'Argentina', telefono: '', contacto: '', website: '', company_name: 'Empresa Cliente'
  });

  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [newPoForm, setNewPoForm] = useState({
    vendor_name: 'Fortinet Inc. USA', subsidiary: 'DACAS International LLC', location: 'LOC-MIA', total: 45000, delivery_date: '2026-10-25'
  });

  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [newJournalForm, setNewJournalForm] = useState({
    subsidiary: 'DACAS Argentina S.A.', memo: 'Ajuste contable mensual de provisión', total_amount: 15000,
    debit_account: '1100 - Cuentas por Cobrar Comerciales (A/R)',
    credit_account: '4010 - Ingresos por Venta de Equipamiento Hardware'
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    itemId: '', locationCode: 'LOC-BUE', adjustmentQty: 5, reason: 'Recepción directa de lote local'
  });

  const [editCreditModal, setEditCreditModal] = useState(false);
  const [selectedCreditAccount, setSelectedCreditAccount] = useState(null);

  // Load all ERP data from dedicated ERP Database
  const fetchAllData = async (sub = selectedSubsidiary) => {
    setLoading(true);
    try {
      const subQuery = sub && sub !== 'Todas' ? `?subsidiary=${encodeURIComponent(sub)}` : '';
      const [
        resOverview, resSubs, resCurr, resCoa, resJournals, resLocs,
        resCatalog, resVendors, resPOs, resBills, resOrders, resInvoices,
        resCredit, resEndUsers
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/overview${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/subsidiaries`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/currencies`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/chart-of-accounts`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/journal-entries${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/locations`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/catalog-sync`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/vendors`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/purchase-orders${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/vendor-bills${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/orders${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/invoices${subQuery}`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/credit-accounts`),
        fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/end-users`)
      ]);

      if (resOverview.ok) {
        const d = await resOverview.json();
        if (d.stats) setStats(d.stats);
      }
      if (resSubs.ok) setSubsidiaries(await resSubs.json());
      if (resCurr.ok) setCurrencies(await resCurr.json());
      if (resCoa.ok) setChartOfAccounts(await resCoa.json());
      if (resJournals.ok) setJournalEntries(await resJournals.json());
      if (resLocs.ok) setLocations(await resLocs.json());
      if (resCatalog.ok) setCatalogItems(await resCatalog.json());
      if (resVendors.ok) setVendors(await resVendors.json());
      if (resPOs.ok) setPurchaseOrders(await resPOs.json());
      if (resBills.ok) setVendorBills(await resBills.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resInvoices.ok) setInvoices(await resInvoices.json());
      if (resCredit.ok) setCreditAccounts(await resCredit.json());
      if (resEndUsers.ok) setEndUsers(await resEndUsers.json());
    } catch (err) {
      console.error('Error cargando datos ERP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(selectedSubsidiary);
  }, [selectedSubsidiary]);

  const showTemporaryFeedback = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Full verification of ERP database
  const handleFullSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/sync-all`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showTemporaryFeedback(data.message || 'Base de datos ERP verificada correctamente.');
        fetchAllData(selectedSubsidiary);
      } else {
        showTemporaryFeedback(`Error: ${data.error || 'Fallo de verificación'}`, true);
      }
    } catch (err) {
      showTemporaryFeedback('Error comunicando con la base de datos ERP', true);
    } finally {
      setSyncing(false);
    }
  };

  // Actions
  const handlePayInvoice = async (invId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/invoices/${invId}/pay`, { method: 'POST' });
      if (res.ok) {
        showTemporaryFeedback('Cobranza registrada exitosamente. Asiento A/R conciliado.');
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al registrar cobro', true);
    }
  };

  const handleReceivePO = async (poId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/purchase-orders/${poId}/receive`, { method: 'POST' });
      if (res.ok) {
        showTemporaryFeedback(`PO #${poId} ingresada al almacén de destino. Stock actualizado.`);
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al recibir PO', true);
    }
  };

  const handlePayVendorBill = async (billId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/vendor-bills/${billId}/pay`, { method: 'POST' });
      if (res.ok) {
        showTemporaryFeedback('Pago a proveedor emitido y conciliado con cuenta bancaria.');
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al pagar factura de proveedor', true);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoForm)
      });
      if (res.ok) {
        showTemporaryFeedback('Orden de Compra PO creada y enviada para aprobación.');
        setShowNewPoModal(false);
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al crear PO', true);
    }
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    try {
      const lines = [
        { account: newJournalForm.debit_account, debit: parseFloat(newJournalForm.total_amount), credit: 0 },
        { account: newJournalForm.credit_account, debit: 0, credit: parseFloat(newJournalForm.total_amount) }
      ];
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/journal-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subsidiary: newJournalForm.subsidiary,
          memo: newJournalForm.memo,
          total_amount: newJournalForm.total_amount,
          lines
        })
      });
      if (res.ok) {
        showTemporaryFeedback('Asiento contable balanceado y registrado en el Libro Diario.');
        setShowNewJournalModal(false);
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al registrar asiento contable', true);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm)
      });
      if (res.ok) {
        showTemporaryFeedback('Ajuste de stock físico aplicado en el depósito seleccionado.');
        setShowStockModal(false);
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al aplicar ajuste de stock', true);
    }
  };

  // ABM End Users Handlers
  const handleSaveEndUser = async (e) => {
    e.preventDefault();
    if (!endUserForm.nombre.trim()) {
      showTemporaryFeedback('El nombre del End User es obligatorio', true);
      return;
    }
    if (endUserForm.pais === 'Venezuela' && !endUserForm.contacto.trim()) {
      showTemporaryFeedback('Para Venezuela el Nombre del CEO es obligatorio en Contacto', true);
      return;
    }

    try {
      const payload = { ...endUserForm };
      if (abmMode === 'edit') payload.id = selectedEndUserId;

      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/end-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showTemporaryFeedback(abmMode === 'new' ? 'End User registrado exitosamente en base ERP' : 'End User actualizado');
        setShowAbmModal(false);
        fetchAllData(selectedSubsidiary);
      } else {
        const d = await res.json();
        showTemporaryFeedback(d.error || 'Error al guardar End User', true);
      }
    } catch {
      showTemporaryFeedback('Error de comunicación con el servidor ERP', true);
    }
  };

  const handleDeleteEndUser = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este End User de la base ERP?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/end-users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showTemporaryFeedback('End User eliminado de la base ERP');
        fetchAllData(selectedSubsidiary);
      }
    } catch {
      showTemporaryFeedback('Error al eliminar', true);
    }
  };

  // Filtered End Users
  const filteredEndUsers = endUsers.filter(eu => {
    const matchesSearch = !generalSearch ||
      (eu.nombre && eu.nombre.toLowerCase().includes(generalSearch.toLowerCase())) ||
      (eu.ciudad && eu.ciudad.toLowerCase().includes(generalSearch.toLowerCase())) ||
      (eu.contacto && eu.contacto.toLowerCase().includes(generalSearch.toLowerCase())) ||
      (eu.company_name && eu.company_name.toLowerCase().includes(generalSearch.toLowerCase()));
    const matchesCountry = countryFilter === 'Todos' || eu.pais === countryFilter;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="erp-dashboard-wrap" style={{
      padding: embedded ? '0' : '28px 36px',
      maxWidth: '1680px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: 'var(--text-main, #0f172a)',
      background: 'transparent'
    }}>
      <style>{`
        .erp-dashboard-wrap {
          color: var(--text-main, #0f172a);
        }
        [data-theme='dark'] .erp-dashboard-wrap {
          color: #ffffff !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: #FFFFFF"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background:#FFFFFF"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: rgb(255, 255, 255)"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background-color: #FFFFFF"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background-color: rgb(255, 255, 255)"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: white"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background:#ffffff"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: #ffffff"] {
          background: var(--card-bg, #0f2742) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: #F8FAFC"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background:#F8FAFC"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: rgb(248, 250, 252)"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background-color: #F8FAFC"],
        [data-theme='dark'] .erp-dashboard-wrap div[style*="background: #f8fafc"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background: #F8FAFC"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background:#F8FAFC"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background: rgb(248, 250, 252)"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background: #f8fafc"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background: #FFFFFF"],
        [data-theme='dark'] .erp-dashboard-wrap button[style*="background: rgb(255, 255, 255)"] {
          background: var(--pill-bg, #12354c) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #071524"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color:#071524"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #0f172a"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color:#0f172a"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #1e293b"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #334155"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: rgb(7, 21, 36)"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: rgb(15, 23, 42)"] {
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #64748B"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color:#64748B"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: #475569"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color:#475569"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: rgb(100, 116, 139)"],
        [data-theme='dark'] .erp-dashboard-wrap [style*="color: rgb(71, 85, 105)"] {
          color: var(--text-muted, #94a3b8) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap select,
        [data-theme='dark'] .erp-dashboard-wrap input,
        [data-theme='dark'] .erp-dashboard-wrap textarea {
          background-color: var(--input-bg, #0b1d33) !important;
          color: var(--text-main, #ffffff) !important;
          border-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap select option {
          background-color: var(--card-bg, #0f2742) !important;
          color: var(--text-main, #ffffff) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap th {
          background: var(--pill-bg, #12354c) !important;
          color: #38bdf8 !important;
          border-bottom-color: var(--border-color, rgba(15, 164, 222, 0.22)) !important;
        }
        [data-theme='dark'] .erp-dashboard-wrap td {
          border-bottom-color: rgba(255, 255, 255, 0.08) !important;
          color: var(--text-main, #ffffff) !important;
        }
      `}</style>
      {/* ── TOP HEADER: DACAS OneWorld ERP ── */}
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
        {/* Left Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!embedded && (
            <button
              type="button"
              onClick={() => {
                if (onBack) onBack();
                else window.location.href = '/';
              }}
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

          <div 
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = '/';
            }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            title="Ir a Home"
          >
            <BrandingVectorIcon name="database" size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main, #071524)', letterSpacing: '-0.02em' }}>
              Sistema ERP Empresarial DACAS
            </h1>
          </div>
        </div>

        {/* Right Controls: Subsidiary Selector & Verification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Subsidiary Filter (OneWorld Multi-Subsidiary Switcher) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <BrandingVectorIcon name="building" size={15} color="#0fa4de" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Subsidiaria:</span>
            <select
              value={selectedSubsidiary}
              onChange={(e) => setSelectedSubsidiary(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                fontWeight: '800',
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Todas">DACAS Consolidado (Global)</option>
              {subsidiaries.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.country})</option>
              ))}
            </select>
          </div>

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
            <span>Base ERP Activa (Local)</span>
          </div>

          {/* Notification Bell */}
          <NotificationBell 
            usuario={usuario}
            onNavigate={(targetView, targetTab) => {
              if (targetView === 'erp' && targetTab) {
                setActiveTab(targetTab);
              } else if (onBack) {
                onBack();
              } else {
                window.location.href = targetView === 'ecommerce' ? '/admin/ecommerce' : '/';
              }
            }}
          />

          {/* Verification Button */}
          <button
            type="button"
            onClick={handleFullSync}
            disabled={syncing}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)',
              opacity: syncing ? 0.7 : 1
            }}
          >
            <BrandingVectorIcon name="refresh" size={14} color="#FFFFFF" />
            <span>{syncing ? 'Verificando...' : 'Conciliar ERP'}</span>
          </button>
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

      {/* ── MAIN ERP NAVIGATION TABS ── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid var(--border-color, #E2E8F0)',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { key: 'overview', label: 'SuiteOverview (Tablero)', icon: 'activity', desc: 'KPIs & Salud Financiera' },
          { key: 'order_to_cash', label: 'Order-to-Cash (Ventas)', icon: 'shopping-bag', desc: 'Órdenes, Facturas & End Users' },
          { key: 'procure_to_pay', label: 'Procure-to-Pay (Compras)', icon: 'truck', desc: 'PO, Proveedores & Facturas A/P' },
          { key: 'inventory', label: 'Inventario & Almacenes', icon: 'box', desc: 'Artículos & Multi-Depósito' },
          { key: 'financials', label: 'Finanzas & Contabilidad', icon: 'file-text', desc: 'Plan de Cuentas & Libro Diario' },
          { key: 'oneworld', label: 'OneWorld (Subsidiarias)', icon: 'building', desc: 'Multi-Empresa & Multi-Divisa' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? 'var(--card-bg, #FFFFFF)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary, #0fa4de)' : '3px solid transparent',
                padding: '12px 18px',
                borderRadius: '12px 12px 0 0',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13.5px',
                color: isActive ? 'var(--primary, #0284c7)' : 'var(--text-muted, #64748B)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 -2px 10px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <BrandingVectorIcon name={tab.icon} size={16} color={isActive ? 'var(--primary, #0fa4de)' : 'var(--text-muted, #64748B)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: SUITEOVERVIEW (TABLERO EJECUTIVO ERP)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Executive KPI Scorecard (5 en una sola fila) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: '12px',
            marginBottom: '24px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* KPI 1: Facturación Neta */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Facturación Neta (YTD)</span>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>Invoiced A/R</span>
              </div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#071524', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ${(stats.totalRevenue || 0).toLocaleString('en-US')} <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <BrandingVectorIcon name="check-circle" size={13} color="#166534" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Facturas comerciales</span>
              </div>
            </div>

            {/* KPI 2: Cuentas por Cobrar A/R */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cuentas por Cobrar (A/R)</span>
                <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>Activo Líquido</span>
              </div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#071524', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ${(stats.accountsReceivableAR || 0).toLocaleString('en-US')} <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <BrandingVectorIcon name="clock" size={13} color="#64748B" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Cobranzas Net 30/60</span>
              </div>
            </div>

            {/* KPI 3: Cuentas por Pagar A/P */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cuentas por Pagar (A/P)</span>
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>Proveedores</span>
              </div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#071524', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ${(stats.accountsPayableAP || 0).toLocaleString('en-US')} <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#92400E', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <BrandingVectorIcon name="credit-card" size={13} color="#92400E" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Facturas vendor pendientes</span>
              </div>
            </div>

            {/* KPI 4: Valoración de Inventario */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Valoración de Stock</span>
                <span style={{ background: '#F3E8FF', color: '#7E22CE', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>4 Almacenes</span>
              </div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#071524', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ${(stats.inventoryValuation || 0).toLocaleString('en-US')} <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <BrandingVectorIcon name="box" size={13} color="#64748B" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Costo promedio FIFO</span>
              </div>
            </div>

            {/* KPI 5: Tesorería en Bancos */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px 14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tesorería & Bancos</span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>Cuenta 1010</span>
              </div>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#071524', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ${(stats.cashBankBalance || 0).toLocaleString('en-US')} <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <BrandingVectorIcon name="shield" size={13} color="#0369A1" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Liquidez disponible</span>
              </div>
            </div>
          </div>

          {/* Quick ERP Action Banner & Operational Status */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Financial Health Snapshot */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandingVectorIcon name="activity" size={17} color="#0fa4de" />
                  <span>Estado Financiero Consolidado ERP (OneWorld)</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Moneda Base: USD</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>Venta Total de Hardware & Software (Ingresos Brutos)</span>
                  <span style={{ fontWeight: '800', fontSize: '13.5px', color: '#071524' }}>$6,100,000 USD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748B' }}>(-) Costo de Mercaderías Vendidas (COGS Proveedores)</span>
                  <span style={{ fontWeight: '800', fontSize: '13.5px', color: '#DC2626' }}>($4,370,000 USD)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontWeight: '800', fontSize: '13px', color: '#166534' }}>Margen Bruto de Distribución (Gross Margin)</span>
                  <span style={{ fontWeight: '900', fontSize: '14px', color: '#166534' }}>$1,730,000 USD (28.4%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748B' }}>(-) Gastos de Operación, Logística & Sueldos</span>
                  <span style={{ fontWeight: '800', fontSize: '13.5px', color: '#64748B' }}>($700,000 USD)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                  <span style={{ fontWeight: '900', fontSize: '13.5px', color: '#0369A1' }}>Resultado Neto Operacional (Operating Income)</span>
                  <span style={{ fontWeight: '900', fontSize: '15px', color: '#0284c7' }}>$1,030,000 USD (16.9%)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logistics Hubs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Actions */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '800', color: '#071524' }}>Acciones Rápidas ERP</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => { setActiveTab('order_to_cash'); setSubTabVentas('sales_orders'); }}
                    style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <BrandingVectorIcon name="shopping-bag" size={14} color="#0fa4de" />
                    <span>Nueva Orden (SO)</span>
                  </button>
                  <button
                    onClick={() => setShowNewPoModal(true)}
                    style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <BrandingVectorIcon name="truck" size={14} color="#0fa4de" />
                    <span>Nueva Compra (PO)</span>
                  </button>
                  <button
                    onClick={() => setShowNewJournalModal(true)}
                    style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <BrandingVectorIcon name="file-text" size={14} color="#0fa4de" />
                    <span>Asiento Diario</span>
                  </button>
                  <button
                    onClick={() => { setAbmMode('new'); setEndUserForm({ nombre: '', direccion: '', ciudad: '', pais: 'Argentina', telefono: '', contacto: '', website: '', company_name: 'Empresa Cliente' }); setShowAbmModal(true); }}
                    style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <BrandingVectorIcon name="users" size={14} color="#0fa4de" />
                    <span>+ End User ABM</span>
                  </button>
                </div>
              </div>

              {/* Warehouses Breakdown */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', flex: 1 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: '#071524', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Almacenes & Centros de Distribución</span>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>4 Hubs Activos</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {locations.map(loc => (
                    <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '800', color: '#0f172a' }}>{loc.code}</span>
                        <span style={{ color: '#64748B', marginLeft: '6px' }}>{loc.name.split('(')[0]}</span>
                      </div>
                      <span style={{ fontWeight: '800', color: '#166534' }}>${(loc.valuation_usd || 0).toLocaleString('en-US')} USD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: ORDER-TO-CASH (VENTAS & CLIENTES)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'order_to_cash' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { key: 'sales_orders', label: 'Órdenes de Venta (Sales Orders)', count: orders.length },
              { key: 'invoices', label: 'Facturación & Cobranzas (A/R)', count: invoices.length },
              { key: 'credit', label: 'Cuentas Corrientes & Crédito B2B', count: creditAccounts.length },
              { key: 'end_users', label: 'ABM End Users (Clientes Finales)', count: endUsers.length }
            ].map(sub => (
              <button
                key={sub.key}
                onClick={() => setSubTabVentas(sub.key)}
                style={{
                  background: subTabVentas === sub.key ? '#0284c7' : '#FFFFFF',
                  color: subTabVentas === sub.key ? '#FFFFFF' : '#475569',
                  border: `1px solid ${subTabVentas === sub.key ? '#0284c7' : '#E2E8F0'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{sub.label}</span>
                <span style={{
                  background: subTabVentas === sub.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color: subTabVentas === sub.key ? '#FFFFFF' : '#64748B',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subview 1: Sales Orders */}
          {subTabVentas === 'sales_orders' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Registro de Órdenes de Venta (Sales Orders)</h3>
                <input
                  type="text"
                  placeholder="Buscar orden SO#, cliente o factura..."
                  value={generalSearch}
                  onChange={(e) => setGeneralSearch(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', width: '280px' }}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>SO# ERP</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Cliente</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Subsidiaria</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Depósito</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Total (USD)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => !generalSearch || o.cliente.toLowerCase().includes(generalSearch.toLowerCase()) || o.erp_order_id.toLowerCase().includes(generalSearch.toLowerCase())).map(ord => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{ord.erp_order_id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{ord.cliente}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{ord.subsidiary || 'DACAS Argentina S.A.'}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{ord.location || 'LOC-BUE'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>${(ord.total || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: ord.erp_status === 'Facturado' ? '#DCFCE7' : ord.erp_status.includes('Preparación') ? '#EFF6FF' : '#FEF3C7',
                            color: ord.erp_status === 'Facturado' ? '#166534' : ord.erp_status.includes('Preparación') ? '#0284c7' : '#92400E',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {ord.erp_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {ord.erp_status !== 'Facturado' ? (
                            <button
                              onClick={() => {
                                fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/orders/${ord.id}/sync`, { method: 'POST' })
                                  .then(() => { showTemporaryFeedback(`Orden #${ord.id} aprobada y facturada.`); fetchAllData(selectedSubsidiary); });
                              }}
                              style={{ background: '#0284c7', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Facturar SO
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>✓ Factura emitida</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Invoices A/R */}
          {subTabVentas === 'invoices' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Facturas Emitidas a Clientes (Accounts Receivable - A/R)</h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Factura #</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Orden Venta</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Cliente</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Vencimiento</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Total (USD)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Saldo Pendiente</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Cobranza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{inv.invoice_number}</td>
                        <td style={{ padding: '12px 14px', color: '#0284c7', fontWeight: '700' }}>{inv.sales_order_id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700' }}>{inv.customer_name}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{inv.due_date}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>${(inv.total || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: inv.balance_due > 0 ? '#DC2626' : '#166534' }}>
                          ${(inv.balance_due || 0).toLocaleString('en-US')} USD
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: inv.status.includes('Cobrada') ? '#DCFCE7' : '#FEF2F2',
                            color: inv.status.includes('Cobrada') ? '#166534' : '#DC2626',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {inv.balance_due > 0 ? (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              style={{ background: '#166534', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Registrar Cobro
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>✓ Conciliado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 3: Cuentas Corrientes B2B */}
          {subTabVentas === 'credit' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Líneas de Crédito & Plazos Comerciales B2B</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Cuenta ERP</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Razón Social</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tax ID / CUIT</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Límite Crédito</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Crédito Utilizado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Condición Pago</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditAccounts.map(acc => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{acc.erp_account_id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700' }}>{acc.company_name}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{acc.cuit}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>${(acc.credit_limit || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: acc.used_credit > 0 ? '#DC2626' : '#64748B' }}>${(acc.used_credit || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{acc.payment_terms}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{acc.erp_status}</span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            onClick={() => { setSelectedCreditAccount(acc); setEditCreditModal(true); }}
                            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Modificar Línea
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 4: ABM End Users */}
          {subTabVentas === 'end_users' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Catálogo Maestro de End Users (Clientes Finales para Licenciamiento)</h3>
                <button
                  onClick={() => { setAbmMode('new'); setEndUserForm({ nombre: '', direccion: '', ciudad: '', pais: 'Argentina', telefono: '', contacto: '', website: '', company_name: 'Empresa Cliente' }); setShowAbmModal(true); }}
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  + Nuevo End User
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, empresa, contacto o ciudad..."
                  value={generalSearch}
                  onChange={(e) => setGeneralSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="Todos">Todos los Países</option>
                  {LATAM_COUNTRIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>ID</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>End User / Razón Social</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>País</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Ciudad & Dirección</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Contacto Directo</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Teléfono</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEndUsers.map(eu => (
                      <tr key={eu.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#64748B' }}>#{eu.id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '800', color: '#071524' }}>{eu.nombre}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>{eu.company_name}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{eu.pais}</span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          <div>{eu.ciudad}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{eu.direccion}</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '600' }}>{eu.contacto || '-'}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{eu.telefono || '-'}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedEndUserId(eu.id);
                              setAbmMode('edit');
                              setEndUserForm({ ...eu });
                              setShowAbmModal(true);
                            }}
                            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', marginRight: '6px' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEndUser(eu.id)}
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: PROCURE-TO-PAY (COMPRAS & PROVEEDORES)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'procure_to_pay' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { key: 'purchase_orders', label: 'Órdenes de Compra (Purchase Orders - PO)', count: purchaseOrders.length },
              { key: 'vendor_bills', label: 'Facturas de Proveedor (Vendor Bills - A/P)', count: vendorBills.length },
              { key: 'vendors', label: 'Maestro de Proveedores (Vendors)', count: vendors.length }
            ].map(sub => (
              <button
                key={sub.key}
                onClick={() => setSubTabCompras(sub.key)}
                style={{
                  background: subTabCompras === sub.key ? '#0284c7' : '#FFFFFF',
                  color: subTabCompras === sub.key ? '#FFFFFF' : '#475569',
                  border: `1px solid ${subTabCompras === sub.key ? '#0284c7' : '#E2E8F0'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{sub.label}</span>
                <span style={{ background: subTabCompras === sub.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9', color: subTabCompras === sub.key ? '#FFFFFF' : '#64748B', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subview 1: Purchase Orders */}
          {subTabCompras === 'purchase_orders' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Órdenes de Compra a Fabricantes (Purchase Orders)</h3>
                <button
                  onClick={() => setShowNewPoModal(true)}
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  + Nueva Orden de Compra (PO)
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>PO# ERP</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Proveedor (Vendor)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Almacén Destino</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Fecha Entrega</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Total (USD)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Recepción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map(po => (
                      <tr key={po.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{po.po_number}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>{po.vendor_name}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{po.location} - {po.destination_warehouse.split('(')[0]}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{po.delivery_date}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>${(po.total || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: po.status.includes('Recibida') ? '#DCFCE7' : po.status.includes('Tránsito') ? '#EFF6FF' : '#FEF3C7',
                            color: po.status.includes('Recibida') ? '#166534' : po.status.includes('Tránsito') ? '#0284c7' : '#92400E',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {po.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {!po.status.includes('Recibida') ? (
                            <button
                              onClick={() => handleReceivePO(po.id)}
                              style={{ background: '#166534', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Ingresar a Depósito
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>✓ Mercadería Ingresada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Vendor Bills */}
          {subTabCompras === 'vendor_bills' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Facturas por Pagar a Proveedores (Accounts Payable - A/P)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Factura # (Bill)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>PO Vinculada</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Proveedor</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Vencimiento</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Total (USD)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Saldo a Pagar</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'center' }}>Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorBills.map(bill => (
                      <tr key={bill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{bill.bill_number}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0284c7' }}>{bill.po_number}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>{bill.vendor_name}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{bill.due_date}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>${(bill.total || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: bill.balance_due > 0 ? '#DC2626' : '#166534' }}>
                          ${(bill.balance_due || 0).toLocaleString('en-US')} USD
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: bill.status.includes('Pagada') ? '#DCFCE7' : '#FEF3C7',
                            color: bill.status.includes('Pagada') ? '#166534' : '#92400E',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {bill.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {bill.balance_due > 0 ? (
                            <button
                              onClick={() => handlePayVendorBill(bill.id)}
                              style={{ background: '#0fa4de', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Emitir Pago A/P
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>✓ Pagado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 3: Vendors Master */}
          {subTabCompras === 'vendors' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Maestro de Proveedores Tecnológicos (Vendors)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Código</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Nombre Fabricante</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Línea de Solución</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tax ID</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Términos Pago</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Compras YTD</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Deuda A/P</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(ven => (
                      <tr key={ven.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{ven.vendor_code}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>{ven.name}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{ven.category}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{ven.tax_id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{ven.payment_terms}</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>${(ven.total_purchases_ytd || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: ven.balance_payable_ap > 0 ? '#DC2626' : '#166534' }}>
                          ${(ven.balance_payable_ap || 0).toLocaleString('en-US')} USD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: INVENTARIO & ALMACENES (ITEMS & LOCATIONS)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { key: 'items_master', label: 'Maestro de Artículos (Items Master)', count: catalogItems.length },
              { key: 'locations', label: 'Multi-Almacén & Depósitos (Locations)', count: locations.length },
              { key: 'adjustments', label: 'Ajustes y Transferencias de Stock', count: 'Audit' }
            ].map(sub => (
              <button
                key={sub.key}
                onClick={() => setSubTabInventario(sub.key)}
                style={{
                  background: subTabInventario === sub.key ? '#0284c7' : '#FFFFFF',
                  color: subTabInventario === sub.key ? '#FFFFFF' : '#475569',
                  border: `1px solid ${subTabInventario === sub.key ? '#0284c7' : '#E2E8F0'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{sub.label}</span>
                <span style={{ background: subTabInventario === sub.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9', color: subTabInventario === sub.key ? '#FFFFFF' : '#64748B', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subview 1: Items Master */}
          {subTabInventario === 'items_master' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Maestro de Artículos ERP (Items Catalog)</h3>
                <button
                  onClick={() => setShowStockModal(true)}
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  + Ajustar Stock Físico
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>SKU / MPN</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Descripción & Marca</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tipo de Ítem ERP</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Costo Promedio</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Precio Mayorista</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Stock Total</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Almacenes (BsAs/SCL/MIA/BOG)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogItems.map(it => (
                      <tr key={it.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '800', color: '#0284c7' }}>{it.sku}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{it.mpn || it.sku}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '700', color: '#071524' }}>{it.nombre}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>{it.marca} • {it.categoria}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: it.item_type?.includes('Hardware') ? '#EFF6FF' : '#F3E8FF',
                            color: it.item_type?.includes('Hardware') ? '#0284c7' : '#7E22CE',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {it.item_type || 'Hardware Físico'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B', fontWeight: '600' }}>${(it.costo_promedio || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>${(it.precio_mayorista || 0).toLocaleString('en-US')} USD</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: it.stock_disponible > 10 ? '#DCFCE7' : '#FEF3C7',
                            color: it.stock_disponible > 10 ? '#166534' : '#92400E',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {it.stock_disponible} unidades
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#475569' }}>
                          {it.stock_por_almacen ? (
                            <span>BUE: {it.stock_por_almacen['LOC-BUE'] || 0} | SCL: {it.stock_por_almacen['LOC-SCL'] || 0} | MIA: {it.stock_por_almacen['LOC-MIA'] || 0} | BOG: {it.stock_por_almacen['LOC-BOG'] || 0}</span>
                          ) : (
                            <span>Central</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Locations */}
          {subTabInventario === 'locations' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {locations.map(loc => (
                <div key={loc.id} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                      {loc.code}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>{loc.country}</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>{loc.name}</h4>
                  <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#64748B' }}>{loc.address}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748B' }}>Responsable de Depósito:</span>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{loc.manager}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748B' }}>Valoración de Stock:</span>
                    <span style={{ fontWeight: '900', color: '#166534' }}>${(loc.valuation_usd || 0).toLocaleString('en-US')} USD</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subview 3: Adjustments */}
          {subTabInventario === 'adjustments' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Registro de Ajustes & Transferencias de Almacén</h3>
                <button
                  onClick={() => setShowStockModal(true)}
                  style={{ background: '#0284c7', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Nuevo Ajuste
                </button>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Todos los movimientos de entrada por Orden de Compra (PO) y salidas por Orden de Venta (SO) impactan automáticamente el stock del almacén de asignación y generan el asiento correspondiente en la cuenta contable <strong>1200 - Inventario de Mercaderías</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: FINANZAS & CONTABILIDAD (GENERAL LEDGER)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'financials' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { key: 'chart_of_accounts', label: 'Plan de Cuentas (Chart of Accounts)', count: chartOfAccounts.length },
              { key: 'journal_entries', label: 'Libro Diario (Journal Entries)', count: journalEntries.length },
              { key: 'aging', label: 'Antigüedad de Saldos (Aging A/R y A/P)', count: 'Score' }
            ].map(sub => (
              <button
                key={sub.key}
                onClick={() => setSubTabFinanzas(sub.key)}
                style={{
                  background: subTabFinanzas === sub.key ? '#0284c7' : '#FFFFFF',
                  color: subTabFinanzas === sub.key ? '#FFFFFF' : '#475569',
                  border: `1px solid ${subTabFinanzas === sub.key ? '#0284c7' : '#E2E8F0'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{sub.label}</span>
                <span style={{ background: subTabFinanzas === sub.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9', color: subTabFinanzas === sub.key ? '#FFFFFF' : '#64748B', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subview 1: Chart of Accounts */}
          {subTabFinanzas === 'chart_of_accounts' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Plan de Cuentas General ERP (Chart of Accounts)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Código</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Nombre de la Cuenta</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tipo Contable</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Subcategoría</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800', textAlign: 'right' }}>Saldo Consolidado (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartOfAccounts.map(acc => (
                      <tr key={acc.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{acc.code}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>{acc.name}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: acc.type.includes('Activo') ? '#DCFCE7' : acc.type.includes('Pasivo') ? '#FEF3C7' : acc.type.includes('Ingreso') ? '#EFF6FF' : '#F1F5F9',
                            color: acc.type.includes('Activo') ? '#166534' : acc.type.includes('Pasivo') ? '#92400E' : acc.type.includes('Ingreso') ? '#0284c7' : '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {acc.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{acc.subcategory}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '900', textAlign: 'right', color: '#071524' }}>
                          ${(acc.balance_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Journal Entries */}
          {subTabFinanzas === 'journal_entries' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#071524' }}>Libro Diario & Asientos Contables (Journal Entries)</h3>
                <button
                  onClick={() => setShowNewJournalModal(true)}
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  + Nuevo Asiento Contable
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {journalEntries.map(entry => (
                  <div key={entry.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '900', color: '#0284c7', fontSize: '14px' }}>{entry.entry_number}</span>
                        <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{entry.subsidiary}</span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>{entry.date}</span>
                      </div>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                        {entry.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>Glosa / Memo: {entry.memo}</p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#FFFFFF', borderRadius: '8px', overflow: 'hidden' }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', color: '#64748B', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Cuenta Contable</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Debe (Debit USD)</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Haber (Credit USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.lines?.map((line, lidx) => (
                          <tr key={lidx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0f172a' }}>{line.account}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: line.debit > 0 ? '800' : 'normal', color: line.debit > 0 ? '#166534' : '#94A3B8' }}>
                              ${line.debit > 0 ? line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: line.credit > 0 ? '800' : 'normal', color: line.credit > 0 ? '#0284c7' : '#94A3B8' }}>
                              ${line.credit > 0 ? line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subview 3: Aging */}
          {subTabFinanzas === 'aging' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Reporte de Antigüedad de Saldos (Aging Analysis)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534' }}>0 - 30 DÍAS (CORRIENTE)</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>$840,200 USD</div>
                </div>
                <div style={{ padding: '16px', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7' }}>31 - 60 DÍAS</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>$34,200 USD</div>
                </div>
                <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400E' }}>61 - 90 DÍAS</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#92400E', marginTop: '4px' }}>$0.00 USD</div>
                </div>
                <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#DC2626' }}>MÁS DE 90 DÍAS</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#DC2626', marginTop: '4px' }}>$0.00 USD</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 6: ONEWORLD (SUBSIDIARIAS & MULTI-DIVISA)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'oneworld' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { key: 'subsidiaries', label: 'Subsidiarias Corporativas', count: subsidiaries.length },
              { key: 'currencies', label: 'Gestión Multi-Divisa & Tasas de Cambio', count: currencies.length }
            ].map(sub => (
              <button
                key={sub.key}
                onClick={() => setSubTabOneWorld(sub.key)}
                style={{
                  background: subTabOneWorld === sub.key ? '#0284c7' : '#FFFFFF',
                  color: subTabOneWorld === sub.key ? '#FFFFFF' : '#475569',
                  border: `1px solid ${subTabOneWorld === sub.key ? '#0284c7' : '#E2E8F0'}`,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{sub.label}</span>
                <span style={{ background: subTabOneWorld === sub.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9', color: subTabOneWorld === sub.key ? '#FFFFFF' : '#64748B', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subview 1: Subsidiaries */}
          {subTabOneWorld === 'subsidiaries' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Entidades Jurídicas Subsidiarias (DACAS OneWorld)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Código</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Razón Social Legal</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>País</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tax ID / CUIT</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Moneda Base / Local</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Representante Legal</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsidiaries.map(sub => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{sub.code}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#071524' }}>{sub.name}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700' }}>{sub.country}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{sub.tax_id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#EFF6FF', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{sub.currency} / {sub.local_currency}</span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{sub.legal_rep}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{sub.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Currencies */}
          {subTabOneWorld === 'currencies' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: '#071524' }}>Tabla de Divisas & Tipos de Cambio Corporativos</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Código ISO</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Nombre de la Divisa</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Símbolo</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tasa respecto a USD (Base)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Tipo de Moneda</th>
                      <th style={{ padding: '12px 14px', fontWeight: '800' }}>Última Actualización</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map(cur => (
                      <tr key={cur.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '900', color: '#0284c7' }}>{cur.code}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>{cur.name}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '800' }}>{cur.symbol}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '900', color: '#071524' }}>
                          {cur.rate.toLocaleString('en-US', { minimumFractionDigits: 4 })}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: cur.is_base ? '#DCFCE7' : '#F1F5F9',
                            color: cur.is_base ? '#166534' : '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {cur.is_base ? 'Base Corporativa' : 'Moneda Subsidiaria'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                          {new Date(cur.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ABM END USER
      ══════════════════════════════════════════════════════════════════════ */}
      {showAbmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 21, 36, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '680px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #CBD5E1', overflow: 'hidden' }}>
            <div style={{ background: '#071524', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BrandingVectorIcon name="users" size={20} color="#0fa4de" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                  {abmMode === 'new' ? 'Registrar Nuevo End User en ERP' : `Editar End User #${selectedEndUserId}`}
                </h3>
              </div>
              <button onClick={() => setShowAbmModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <BrandingVectorIcon name="close" size={18} color="currentColor" />
              </button>
            </div>

            <form onSubmit={handleSaveEndUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Nombre del End User *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Santander Casa Central"
                  value={endUserForm.nombre}
                  onChange={(e) => setEndUserForm({ ...endUserForm, nombre: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>País *</label>
                  <select
                    value={endUserForm.pais}
                    onChange={(e) => setEndUserForm({ ...endUserForm, pais: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                  >
                    {LATAM_COUNTRIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej: Buenos Aires"
                    value={endUserForm.ciudad}
                    onChange={(e) => setEndUserForm({ ...endUserForm, ciudad: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Dirección</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Paseo Colón 315"
                  value={endUserForm.direccion}
                  onChange={(e) => setEndUserForm({ ...endUserForm, direccion: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                    Contacto Principal {endUserForm.pais === 'Venezuela' ? '(Obligatorio Nombre CEO *)' : ''}
                  </label>
                  <input
                    type="text"
                    required={endUserForm.pais === 'Venezuela'}
                    placeholder={endUserForm.pais === 'Venezuela' ? 'Dr. Juan Carlos Escotet (CEO)' : 'Ing. Responsable IT'}
                    value={endUserForm.contacto}
                    onChange={(e) => setEndUserForm({ ...endUserForm, contacto: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: endUserForm.pais === 'Venezuela' && !endUserForm.contacto ? '2px solid #EF4444' : '1.5px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Teléfono</label>
                  <input
                    type="text"
                    placeholder="+54 11 4000-0000"
                    value={endUserForm.telefono}
                    onChange={(e) => setEndUserForm({ ...endUserForm, telefono: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowAbmModal(false)} style={{ background: '#F1F5F9', border: 'none', color: '#475569', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                  Guardar End User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: NUEVA ORDEN DE COMPRA (PO)
      ══════════════════════════════════════════════════════════════════════ */}
      {showNewPoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 21, 36, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '580px', width: '100%', overflow: 'hidden' }}>
            <div style={{ background: '#071524', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Nueva Orden de Compra (Purchase Order - PO)</h3>
              <button onClick={() => setShowNewPoModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreatePO} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Proveedor (Vendor)</label>
                <select
                  value={newPoForm.vendor_name}
                  onChange={(e) => setNewPoForm({ ...newPoForm, vendor_name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  {vendors.map(v => <option key={v.id} value={v.name}>{v.name} ({v.category})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Subsidiaria</label>
                  <select
                    value={newPoForm.subsidiary}
                    onChange={(e) => setNewPoForm({ ...newPoForm, subsidiary: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                  >
                    {subsidiaries.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Depósito de Entrada</label>
                  <select
                    value={newPoForm.location}
                    onChange={(e) => setNewPoForm({ ...newPoForm, location: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                  >
                    {locations.map(l => <option key={l.id} value={l.code}>{l.code} - {l.name.split('(')[0]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Total Estimado (USD)</label>
                <input
                  type="number"
                  required
                  value={newPoForm.total}
                  onChange={(e) => setNewPoForm({ ...newPoForm, total: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '800' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowNewPoModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#FFFFFF', border: 'none', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Emitir Orden PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: NUEVO ASIENTO DE DIARIO
      ══════════════════════════════════════════════════════════════════════ */}
      {showNewJournalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 21, 36, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '620px', width: '100%', overflow: 'hidden' }}>
            <div style={{ background: '#071524', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Nuevo Asiento de Diario (Journal Entry)</h3>
              <button onClick={() => setShowNewJournalModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateJournal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Subsidiaria</label>
                <select
                  value={newJournalForm.subsidiary}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, subsidiary: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  {subsidiaries.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Concepto / Glosa</label>
                <input
                  type="text"
                  required
                  value={newJournalForm.memo}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, memo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#166534', marginBottom: '6px' }}>Cuenta Débito (Debe)</label>
                  <select
                    value={newJournalForm.debit_account}
                    onChange={(e) => setNewJournalForm({ ...newJournalForm, debit_account: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #86EFAC', fontSize: '12px', fontWeight: '700' }}
                  >
                    {chartOfAccounts.map(c => <option key={c.code} value={`${c.code} - ${c.name}`}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>Cuenta Crédito (Haber)</label>
                  <select
                    value={newJournalForm.credit_account}
                    onChange={(e) => setNewJournalForm({ ...newJournalForm, credit_account: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #BAE6FD', fontSize: '12px', fontWeight: '700' }}
                  >
                    {chartOfAccounts.map(c => <option key={c.code} value={`${c.code} - ${c.name}`}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Monto Balanceado (USD)</label>
                <input
                  type="number"
                  required
                  value={newJournalForm.total_amount}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, total_amount: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '800' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowNewJournalModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#FFFFFF', border: 'none', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Contabilizar Asiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: AJUSTE DE STOCK FÍSICO
      ══════════════════════════════════════════════════════════════════════ */}
      {showStockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 21, 36, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '520px', width: '100%', overflow: 'hidden' }}>
            <div style={{ background: '#071524', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Ajuste de Stock Físico en Depósito</h3>
              <button onClick={() => setShowStockModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAdjustStock} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Artículo / SKU</label>
                <select
                  value={stockForm.itemId}
                  onChange={(e) => setStockForm({ ...stockForm, itemId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="">Seleccione un SKU...</option>
                  {catalogItems.map(it => <option key={it.id} value={it.id}>{it.sku} - {it.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Depósito / Almacén</label>
                  <select
                    value={stockForm.locationCode}
                    onChange={(e) => setStockForm({ ...stockForm, locationCode: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                  >
                    {locations.map(l => <option key={l.id} value={l.code}>{l.code}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Cantidad de Ajuste (+ / -)</label>
                  <input
                    type="number"
                    required
                    value={stockForm.adjustmentQty}
                    onChange={(e) => setStockForm({ ...stockForm, adjustmentQty: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '800' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Motivo del Ajuste</label>
                <input
                  type="text"
                  required
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowStockModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#FFFFFF', border: 'none', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Aplicar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: EDITAR CONDICIONES DE CRÉDITO B2B
      ══════════════════════════════════════════════════════════════════════ */}
      {editCreditModal && selectedCreditAccount && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 21, 36, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
            <div style={{ background: '#071524', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Modificar Condiciones Comerciales</h3>
              <button onClick={() => setEditCreditModal(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await fetch(`${API_BASE_URL}/api/ecommerce/admin/erp/credit-accounts/${selectedCreditAccount.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedCreditAccount)
              });
              showTemporaryFeedback('Condiciones de crédito actualizadas exitosamente');
              setEditCreditModal(false);
              fetchAllData(selectedSubsidiary);
            }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Límite de Crédito (USD)</label>
                <input
                  type="number"
                  value={selectedCreditAccount.credit_limit}
                  onChange={(e) => setSelectedCreditAccount({ ...selectedCreditAccount, credit_limit: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '800' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Plazo de Pago</label>
                <select
                  value={selectedCreditAccount.payment_terms}
                  onChange={(e) => setSelectedCreditAccount({ ...selectedCreditAccount, payment_terms: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="Crédito B2B Net 30">Crédito B2B Net 30 Días</option>
                  <option value="Crédito B2B Net 60">Crédito B2B Net 60 Días</option>
                  <option value="Crédito B2B Net 90">Crédito B2B Net 90 Días</option>
                  <option value="Contado Inmediato">Contado Anticipado</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setEditCreditModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#FFFFFF', border: 'none', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
