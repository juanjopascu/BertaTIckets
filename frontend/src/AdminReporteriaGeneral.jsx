import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, TrendingUp, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  Download, Printer, RefreshCw, DollarSign, Layers, Globe, Building2, Users,
  CheckCircle2, Clock, ArrowRight, Workflow, Boxes, FileSpreadsheet,
  ArrowUpRight, ArrowDownRight, ShieldCheck, ShoppingCart, Award, Sparkles,
  ChevronRight, Truck, FileText, Check, AlertTriangle, Plus, Trash2, Edit3,
  Copy, Star, Eye, Filter, Sliders, Layout, Sparkle
} from 'lucide-react';
import BrandingVectorIcon from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

// Plantillas sugeridas para crear reportes rápidamente con un solo clic
const REPORT_TEMPLATES = [
  {
    titulo: 'Ventas por Marca y Categoría',
    descripcion: 'Comparación de facturación mayorista entre Fortinet, Cisco, MikroTik y Ubiquiti.',
    modulo: 'erp_finanzas',
    tipoGrafico: 'bar',
    metrica: 'facturacion_usd',
    dimension: 'marca',
    unidad: 'USD',
    color: '#0fa4de',
    data: [
      { label: 'Fortinet', valor: 415200, extra: 'Margen 28.8%' },
      { label: 'Cisco Enterprise', valor: 240000, extra: 'Margen 24.1%' },
      { label: 'MikroTik', valor: 145000, extra: 'Margen 31.2%' },
      { label: 'Ubiquiti', valor: 98500, extra: 'Margen 34.5%' },
      { label: 'Cables & Fibra', valor: 42000, extra: 'Margen 42.0%' }
    ]
  },
  {
    titulo: 'Satisfacción y NPS por Vendedor / PM',
    descripcion: 'Índice NPS de atención y casos atendidos exitosamente por ejecutivo comercial.',
    modulo: 'crm_tickets',
    tipoGrafico: 'bar',
    metrica: 'nps_score',
    dimension: 'vendedor',
    unidad: 'pts',
    color: '#10b981',
    data: [
      { label: 'Juan Pérez (Senior PM)', valor: 96, extra: '142 tickets' },
      { label: 'María Gómez (Ventas Corp)', valor: 94, extra: '118 tickets' },
      { label: 'Carlos Ruiz (Soporte L2)', valor: 98, extra: '95 tickets' },
      { label: 'Lucía Fernández (Networking)', valor: 91, extra: '88 tickets' },
      { label: 'Martín Silva (Seguridad)', valor: 95, extra: '104 tickets' }
    ]
  },
  {
    titulo: 'Proyección de Cobranzas A/R a 30-60-90 días',
    descripcion: 'Cuentas a cobrar en USD distribuidas por vencimiento contractual mayorista.',
    modulo: 'erp_finanzas',
    tipoGrafico: 'area',
    metrica: 'monto_usd',
    dimension: 'vencimiento',
    unidad: 'USD',
    color: '#8b5cf6',
    data: [
      { label: 'Al Día (< 30d)', valor: 1480000, extra: '82% cartera' },
      { label: 'Tramo 31 - 60d', valor: 310000, extra: '12% cartera' },
      { label: 'Tramo 61 - 90d', valor: 95000, extra: '4.5% cartera' },
      { label: 'En Gestión (> 90d)', valor: 32000, extra: '1.5% cartera' }
    ]
  },
  {
    titulo: 'Tasa de Devoluciones y Garantías (RMA)',
    descripcion: 'Índice de retorno por garantía técnica por familia de producto.',
    modulo: 'logistica_hubs',
    tipoGrafico: 'pie',
    metrica: 'porcentaje_rma',
    dimension: 'familia',
    unidad: '%',
    color: '#f59e0b',
    data: [
      { label: 'Firewalls UTM', valor: 0.8, extra: 'Tolerancia: < 1.5%' },
      { label: 'Switches Gestionables', valor: 1.1, extra: 'Tolerancia: < 2.0%' },
      { label: 'Access Points WiFi 6', valor: 0.6, extra: 'Tolerancia: < 1.0%' },
      { label: 'Transceptores Ópticos', valor: 0.3, extra: 'Tolerancia: < 0.8%' }
    ]
  }
];

export default function AdminReporteriaGeneral({ usuario, theme = 'light', onBack, embedded = false }) {
  const [periodo, setPeriodo] = useState('ytd'); // '30d' | 'quarter' | 'ytd' | 'historic'
  const [subsidiariaFiltro, setSubsidiariaFiltro] = useState('todas');
  const [activeModuleTab, setActiveModuleTab] = useState('overview'); // 'overview' | 'custom-reports' | 'lucid-flow' | 'finanzas' | 'crm' | 'ecommerce' | 'sedes'
  const [selectedFlowNode, setSelectedFlowNode] = useState('crm');

  // Estado para gestión libre de reportes personalizados
  const [customReports, setCustomReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);

  // Formulario del Creador de Reportes Personalizados
  const [reportForm, setReportForm] = useState({
    titulo: '',
    descripcion: '',
    modulo: 'erp_finanzas',
    tipoGrafico: 'bar',
    metrica: 'facturacion',
    dimension: 'marca',
    unidad: 'USD',
    color: '#0fa4de',
    pinned: false,
    rows: [
      { label: 'Concepto A', valor: 100, extra: '' },
      { label: 'Concepto B', valor: 150, extra: '' },
      { label: 'Concepto C', valor: 85, extra: '' }
    ]
  });

  const isDark = theme === 'dark';

  // Colores corporativos DACAS
  const PRIMARY_COLOR = '#0fa4de';
  const SUCCESS_COLOR = '#10b981';
  const WARNING_COLOR = '#f59e0b';
  const PURPLE_COLOR = '#8b5cf6';
  const CYAN_COLOR = '#06b6d4';

  const PIE_COLORS = ['#0fa4de', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

  // Cargar reportes personalizados desde el backend
  const fetchCustomReports = async () => {
    try {
      setLoadingReports(true);
      const res = await fetch(`${API_BASE_URL}/api/reports/custom`);
      if (res.ok) {
        const data = await res.json();
        setCustomReports(data);
      }
    } catch (err) {
      console.error('Error al cargar reportes personalizados:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchCustomReports();
  }, []);

  // Handlers para crear / editar / eliminar reportes libres
  const handleOpenCreateModal = (template = null) => {
    setEditingReportId(null);
    if (template) {
      setReportForm({
        titulo: template.titulo,
        descripcion: template.descripcion,
        modulo: template.modulo,
        tipoGrafico: template.tipoGrafico,
        metrica: template.metrica,
        dimension: template.dimension,
        unidad: template.unidad,
        color: template.color,
        pinned: false,
        rows: template.data.map(d => ({ ...d }))
      });
    } else {
      setReportForm({
        titulo: '',
        descripcion: '',
        modulo: 'erp_finanzas',
        tipoGrafico: 'bar',
        metrica: 'facturacion',
        dimension: 'mes',
        unidad: 'USD',
        color: '#0fa4de',
        pinned: false,
        rows: [
          { label: 'Enero', valor: 120, extra: '' },
          { label: 'Febrero', valor: 180, extra: '' },
          { label: 'Marzo', valor: 240, extra: '' }
        ]
      });
    }
    setShowCreateModal(true);
  };

  const handleEditReport = (report) => {
    setEditingReportId(report.id);
    setReportForm({
      titulo: report.titulo,
      descripcion: report.descripcion || '',
      modulo: report.modulo || 'erp_finanzas',
      tipoGrafico: report.tipoGrafico || 'bar',
      metrica: report.metrica || '',
      dimension: report.dimension || '',
      unidad: report.unidad || '',
      color: report.color || '#0fa4de',
      pinned: !!report.pinned,
      rows: Array.isArray(report.data) ? report.data.map(d => ({ ...d })) : []
    });
    setShowCreateModal(true);
  };

  const handleDeleteReport = async (reportId, e) => {
    e && e.stopPropagation();
    if (!window.confirm('¿Confirmas eliminar este reporte personalizado?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/custom/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleTogglePin = async (report, e) => {
    e && e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/custom/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !report.pinned })
      });
      if (res.ok) {
        setCustomReports(prev => prev.map(r => r.id === report.id ? { ...r, pinned: !r.pinned } : r));
      }
    } catch (err) {
      console.error('Error al fijar reporte:', err);
    }
  };

  const handleDuplicateReport = async (report, e) => {
    e && e.stopPropagation();
    try {
      const newRep = {
        ...report,
        titulo: `${report.titulo} (Copia)`,
        pinned: false
      };
      delete newRep.id;
      const res = await fetch(`${API_BASE_URL}/api/reports/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRep)
      });
      if (res.ok) {
        const created = await res.json();
        setCustomReports(prev => [created, ...prev]);
      }
    } catch (err) {
      alert(`Error al duplicar: ${err.message}`);
    }
  };

  const handleSaveReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.titulo.trim()) {
      alert('Por favor escribe un título para el reporte.');
      return;
    }

    const payload = {
      titulo: reportForm.titulo.trim(),
      descripcion: reportForm.descripcion.trim(),
      modulo: reportForm.modulo,
      tipoGrafico: reportForm.tipoGrafico,
      metrica: reportForm.metrica,
      dimension: reportForm.dimension,
      unidad: reportForm.unidad,
      color: reportForm.color,
      pinned: reportForm.pinned,
      data: reportForm.rows.map(r => ({
        label: r.label.trim() || 'Dato',
        valor: Number(r.valor) || 0,
        extra: r.extra ? r.extra.trim() : ''
      }))
    };

    try {
      if (editingReportId) {
        const res = await fetch(`${API_BASE_URL}/api/reports/custom/${editingReportId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setCustomReports(prev => prev.map(r => r.id === editingReportId ? updated : r));
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/reports/custom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setCustomReports(prev => [created, ...prev]);
        }
      }
      setShowCreateModal(false);
    } catch (err) {
      alert(`Error al guardar reporte: ${err.message}`);
    }
  };

  const handleAddRow = () => {
    setReportForm(prev => ({
      ...prev,
      rows: [...prev.rows, { label: `Serie ${prev.rows.length + 1}`, valor: 100, extra: '' }]
    }));
  };

  const handleRemoveRow = (index) => {
    if (reportForm.rows.length <= 1) return;
    setReportForm(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateRow = (index, field, value) => {
    setReportForm(prev => {
      const updated = [...prev.rows];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, rows: updated };
    });
  };

  // Datos financieros consolidados mes a mes (ERP OneWorld)
  const FINANCIAL_TREND_DATA = [
    { mes: 'Ene', ingresos: 420000, costos: 298000, margen: 122000, ecommerce: 8200 },
    { mes: 'Feb', ingresos: 450000, costos: 319000, margen: 131000, ecommerce: 9100 },
    { mes: 'Mar', ingresos: 490000, costos: 345000, margen: 145000, ecommerce: 9800 },
    { mes: 'Abr', ingresos: 510000, costos: 360000, margen: 150000, ecommerce: 10400 },
    { mes: 'May', ingresos: 535000, costos: 378000, margen: 157000, ecommerce: 11200 },
    { mes: 'Jun', ingresos: 520000, costos: 367000, margen: 153000, ecommerce: 10900 },
    { mes: 'Jul', ingresos: 545000, costos: 385000, margen: 160000, ecommerce: 11800 },
    { mes: 'Ago', ingresos: 560000, costos: 395000, margen: 165000, ecommerce: 12500 },
    { mes: 'Sep', ingresos: 580000, costos: 410000, margen: 170000, ecommerce: 13600 },
    { mes: 'Oct (Est)', ingresos: 590000, costos: 418000, margen: 172000, ecommerce: 14100 },
    { mes: 'Nov (Est)', ingresos: 610000, costos: 432000, margen: 178000, ecommerce: 15200 },
    { mes: 'Dic (Est)', ingresos: 640000, costos: 453000, margen: 187000, ecommerce: 16800 }
  ];

  // Ventas y Margen por País / Subsidiaria
  const COUNTRY_PERFORMANCE_DATA = [
    { pais: 'Argentina 🇦🇷', ventas: 2150000, cogs: 1520000, margen: 630000, tickets: 480, clientes: 112, hub: 'Hub Central BUE' },
    { pais: 'Chile 🇨🇱', ventas: 1420000, cogs: 1010000, margen: 410000, tickets: 320, clientes: 78, hub: 'Hub SCL' },
    { pais: 'Colombia 🇨🇴', ventas: 980000, cogs: 705000, margen: 275000, tickets: 230, clientes: 54, hub: 'Hub BOG' },
    { pais: 'Perú 🇵🇪', ventas: 640000, cogs: 460000, margen: 180000, tickets: 160, clientes: 38, hub: 'Hub LIM' },
    { pais: 'México 🇲🇽', ventas: 480000, cogs: 345000, margen: 135000, tickets: 110, clientes: 31, hub: 'Hub MEX' },
    { pais: 'Brasil 🇧🇷', ventas: 310000, cogs: 225000, margen: 85000, tickets: 75, clientes: 19, hub: 'Hub SP' },
    { pais: 'USA / FTZ 🇺🇸', ventas: 120000, cogs: 95000, margen: 25000, tickets: 45, clientes: 10, hub: 'HQ Logistics MIA' }
  ];

  // Distribución de Tickets y Carga por Departamento CRM
  const DEPT_DISTRIBUTION_DATA = [
    { name: 'Soporte Técnico', value: 580, slaOk: 97.4, avgHours: 3.2 },
    { name: 'Ventas & Cotizaciones', value: 420, slaOk: 99.1, avgHours: 2.1 },
    { name: 'Operaciones & Logística', value: 240, slaOk: 98.0, avgHours: 4.5 },
    { name: 'General & Onboarding', value: 95, slaOk: 100, avgHours: 1.8 },
    { name: 'Expenses / Reintegros', value: 55, slaOk: 96.5, avgHours: 8.2 },
    { name: 'Travels / Reservas', value: 30, slaOk: 98.2, avgHours: 6.4 }
  ];

  // Embudo de Conversión de Casos Comerciales CRM
  const FUNNEL_DATA = [
    { etapa: '1. Contactado / Lead', cantidad: 185, conversion: '100%' },
    { etapa: '2. En Calificación', cantidad: 142, conversion: '76.7%' },
    { etapa: '3. En Negociación', cantidad: 98, conversion: '52.9%' },
    { etapa: '4. Cotización Enviada', cantidad: 74, conversion: '40.0%' },
    { etapa: '5. Ganado / Cerrado', cantidad: 56, conversion: '30.2%' }
  ];

  // Métricas semanales de E-Commerce B2B
  const ECOMMERCE_WEEKLY_DATA = [
    { semana: 'Sem 1', ordenes: 24, facturadoUSD: 18400, ticketPromedio: 766, carritos: 58 },
    { semana: 'Sem 2', ordenes: 31, facturadoUSD: 24100, ticketPromedio: 777, carritos: 69 },
    { semana: 'Sem 3', ordenes: 28, facturadoUSD: 21500, ticketPromedio: 767, carritos: 62 },
    { semana: 'Sem 4', ordenes: 38, facturadoUSD: 31200, ticketPromedio: 821, carritos: 84 },
    { semana: 'Sem 5', ordenes: 42, facturadoUSD: 34500, ticketPromedio: 821, carritos: 91 }
  ];

  // Nodos del Diagrama de Procesos Operativos (Estilo Lucidchart)
  const LUCID_FLOW_NODES = [
    {
      id: 'ingesta',
      title: '1. Ingesta Multicanal',
      sub: 'Tickets & Leads B2B',
      icon: Users,
      color: '#0fa4de',
      metrics: '1,420 Casos / Año',
      detail: 'Recepción por Correo, Portal Shop, API, Mesa de Ayuda y PBX. Detección automática de cliente y asignación a departamento.'
    },
    {
      id: 'crm',
      title: '2. Calificación & CRM',
      sub: 'Cotización & Margen',
      icon: Activity,
      color: '#8b5cf6',
      metrics: 'Conv: 30.2% • SLA 98.4%',
      detail: 'Validación de requerimiento técnico, emisión de cotización con lista de precios mayorista y cálculo de margen comercial en vivo.'
    },
    {
      id: 'erp',
      title: '3. Facturación OneWorld',
      sub: 'Crédito & Cuentas',
      icon: DollarSign,
      color: '#10b981',
      metrics: '$6.1M Facturados USD',
      detail: 'Aprobación de línea de crédito, emisión de factura electrónica A/R en moneda local o USD, y registro contable OneWorld.'
    },
    {
      id: 'logistica',
      title: '4. Hub Logístico',
      sub: 'Pick, Pack & Stock',
      icon: Boxes,
      color: '#f59e0b',
      metrics: '8 Hubs • 24h Despacho',
      detail: 'Reserva de stock en almacén local (BUE, SCL, MIA, BOG, LIM, MEX, SP, MVD), preparación de bultos con etiquetado QR.'
    },
    {
      id: 'transito',
      title: '5. Despacho & Aduana',
      sub: 'Flete Internacional',
      icon: Truck,
      color: '#06b6d4',
      metrics: '2,840 Bultos YTD',
      detail: 'Coordinación con transporte terrestre y aéreo courier, gestión de guías de despacho aduanero y tracking satelital en tiempo real.'
    },
    {
      id: 'entrega',
      title: '6. Entrega & NPS',
      sub: 'Recepción Conforme',
      icon: ShieldCheck,
      color: '#16a34a',
      metrics: '99.1% Conforme • NPS 94',
      detail: 'Remito digital firmado, cierre automático del ticket en CRM, encuesta de satisfacción del canal y liquidación de cobranza.'
    }
  ];

  // Resumen Ejecutivo Filtrado
  const kpiData = useMemo(() => {
    return {
      totalRevenue: '$6,100,000 USD',
      revenueGrowth: '+18.4% vs año ant.',
      grossMargin: '$1,730,000 USD (28.4%)',
      totalTickets: '1,420 Casos',
      slaCompliance: '98.4%',
      ecommerceTotal: '$106,700 USD',
      activeClients: '342 Empresas B2B',
      cashBankBalance: '$2,480,500 USD'
    };
  }, [periodo, subsidiariaFiltro]);

  const handleExportCSV = () => {
    const headers = ['Mes', 'Ingresos USD', 'Costos COGS USD', 'Margen USD', 'E-Commerce USD'];
    const rows = FINANCIAL_TREND_DATA.map(d => [d.mes, d.ingresos, d.costos, d.margen, d.ecommerce]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DACAS_Reporte_General_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizador universal de gráficos personalizados
  const renderCustomReportChart = (report) => {
    const chartData = report.data || [];
    const repColor = report.color || '#0fa4de';

    switch (report.tipoGrafico) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} ${report.unidad || ''}`, report.titulo]}
                contentStyle={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="valor" stroke={repColor} strokeWidth={2.5} dot={{ r: 4, fill: repColor }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad_${report.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={repColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={repColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} ${report.unidad || ''}`, report.titulo]}
                contentStyle={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="valor" stroke={repColor} strokeWidth={2.5} fillOpacity={1} fill={`url(#grad_${report.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="valor" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [`${v} ${report.unidad || ''}`, name]}
                  contentStyle={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'table':
        return (
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color, #E2E8F0)', color: 'var(--text-muted, #64748B)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Dimensión</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Valor ({report.unidad || 'U'})</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: '700' }}>{row.label}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '800', color: repColor }}>{row.valor}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-muted, #64748B)' }}>{row.extra || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} ${report.unidad || ''}`, report.titulo]}
                contentStyle={{ background: 'var(--card-bg, #FFFFFF)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="valor" fill={repColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg-main, #f8fafc)',
      color: 'var(--text-main, #0f172a)',
      padding: embedded ? '0' : '24px',
      boxSizing: 'border-box',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* ── TOP HEADER: Reportería General ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
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
                fontWeight: '800'
              }}
              title="Volver"
            >
              <BrandingVectorIcon name="arrow-left" size={16} color="var(--primary, #0fa4de)" />
              <span>Volver</span>
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
            <BarChart3 size={24} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main, #071524)', letterSpacing: '-0.02em' }}>
                Reportería General & BI 360°
              </h1>
              <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(15, 164, 222, 0.12)', color: '#0fa4de', padding: '3px 8px', borderRadius: '8px' }}>
                OneWorld ERP + Lucid Engine
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
              Tablero corporativo unificado con total libertad para diseñar y personalizar reportes a medida.
            </div>
          </div>
        </div>

        {/* Acciones y Exportación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Botón Destacado: Crear Nuevo Reporte */}
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <span>+ Crear Reporte Personalizado</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              background: 'var(--card-bg, #FFFFFF)',
              color: 'var(--text-main, #0F172A)',
              border: '1px solid var(--border-color, #CBD5E1)',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={15} color="var(--primary, #0fa4de)" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: 'var(--pill-bg, #f1f5f9)',
              color: 'var(--text-main, #0F172A)',
              border: '1px solid var(--border-color, #CBD5E1)',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={15} color="currentColor" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* ── NAVEGACIÓN POR MÓDULOS DE REPORTERÍA ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: 'var(--card-bg, #FFFFFF)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid var(--border-color, #E2E8F0)',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {[
          { id: 'overview', label: 'Visión Integral 360°', icon: LayoutGridIcon },
          { id: 'custom-reports', label: `Mis Reportes Creados (${customReports.length})`, icon: Sliders },
          { id: 'lucid-flow', label: 'Diagrama de Flujo Lucid', icon: Workflow },
          { id: 'finanzas', label: 'Finanzas ERP OneWorld', icon: DollarSign },
          { id: 'crm', label: 'CRM, Casos & SLAs', icon: Activity },
          { id: 'ecommerce', label: 'E-Commerce & SKUs', icon: ShoppingCart },
          { id: 'sedes', label: 'Sedes & Hubs Regionales', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeModuleTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveModuleTab(tab.id)}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted, #64748b)',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(15, 164, 222, 0.3)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? '#ffffff' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 1. KPI SCORECARD EJECUTIVO (6 Tarjetas Clave) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { title: 'Facturación Bruta (YTD)', value: kpiData.totalRevenue, sub: kpiData.revenueGrowth, color: '#0fa4de', bg: 'rgba(15, 164, 222, 0.1)', icon: DollarSign },
          { title: 'Margen Bruto Global', value: kpiData.grossMargin, sub: 'Objetivo: 28% cumplido', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: Award },
          { title: 'Casos CRM Totales', value: kpiData.totalTickets, sub: `SLA cumplido: ${kpiData.slaCompliance}`, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: Activity },
          { title: 'E-Commerce B2B Ventas', value: kpiData.ecommerceTotal, sub: '14 pedidos hoy', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: ShoppingCart },
          { title: 'Empresas & Clientes Activos', value: kpiData.activeClients, sub: '+24 altas este mes', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Users },
          { title: 'Tesorería y Liquidez (USD)', value: kpiData.cashBankBalance, sub: 'Disponibilidad inmediata', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', icon: ShieldCheck }
        ].map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--card-bg, #FFFFFF)',
                border: '1px solid var(--border-color, #E2E8F0)',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.title}
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardIcon size={16} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: card.color }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. SECCIÓN: ESTUDIO DE REPORTES PERSONALIZADOS LIBRES ── */}
      {(activeModuleTab === 'overview' || activeModuleTab === 'custom-reports') && (
        <div style={{
          background: 'var(--card-bg, #FFFFFF)',
          border: '1px solid var(--border-color, #E2E8F0)',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="#0fa4de" />
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '900', color: 'var(--text-main, #0F172A)' }}>
                  Estudio de Reportes Personalizados (Libertad Total de Creación)
                </h3>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted, #64748B)' }}>
                Diseña, edita y agrega nuevos reportes con la métrica, dimensión y tipo de visualización que necesites.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleOpenCreateModal()}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>+ Crear Reporte Libre</span>
              </button>
            </div>
          </div>

          {/* Plantillas Rápidas para Crear en 1 Clic */}
          <div style={{
            background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
            border: '1px dashed var(--border-color, #cbd5e1)',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0fa4de', fontWeight: '800', fontSize: '12.5px' }}>
              <Sparkles size={16} />
              <span>Plantillas Rápidas:</span>
            </div>
            {REPORT_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleOpenCreateModal(tpl)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                title={tpl.descripcion}
              >
                <Plus size={13} color="#0fa4de" />
                <span>{tpl.titulo}</span>
              </button>
            ))}
          </div>

          {/* Grid de Reportes Personalizados Creados */}
          {customReports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
              No tienes reportes personalizados aún. Haz clic en <strong>+ Crear Reporte Libre</strong> o elige una plantilla rápida.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '18px'
            }}>
              {customReports.map(report => (
                <div
                  key={report.id}
                  style={{
                    background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                    border: `1px solid ${report.pinned ? '#0fa4de' : 'var(--border-color, #E2E8F0)'}`,
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: report.pinned ? '0 8px 24px rgba(15, 164, 222, 0.15)' : 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))',
                    position: 'relative'
                  }}
                >
                  {/* Encabezado del Reporte */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${report.color || '#0fa4de'}22`,
                          color: report.color || '#0fa4de',
                          textTransform: 'uppercase'
                        }}>
                          {report.modulo || 'General'}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>
                          • {report.tipoGrafico || 'bar'}
                        </span>
                      </div>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>
                        {report.titulo}
                      </h4>
                      {report.descripcion && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
                          {report.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Acciones de la tarjeta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(report, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: report.pinned ? '#f59e0b' : 'var(--text-muted, #94a3b8)',
                          padding: '4px'
                        }}
                        title={report.pinned ? 'Desfijar de la portada' : 'Fijar en la portada'}
                      >
                        <Star size={16} fill={report.pinned ? '#f59e0b' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditReport(report)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', padding: '4px' }}
                        title="Editar reporte"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDuplicateReport(report, e)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', padding: '4px' }}
                        title="Duplicar reporte"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteReport(report.id, e)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        title="Eliminar reporte"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Visualización del Gráfico */}
                  <div style={{ width: '100%', minHeight: '220px', marginTop: '4px' }}>
                    {renderCustomReportChart(report)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. SECCIÓN: DIAGRAMA DE FLUJO INTERACTIVO (LUCIDCHART STYLE) ── */}
      {(activeModuleTab === 'overview' || activeModuleTab === 'lucid-flow') && (
        <div style={{
          background: 'var(--card-bg, #FFFFFF)',
          border: '1px solid var(--border-color, #E2E8F0)',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Workflow size={20} color="#0fa4de" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-main, #0F172A)' }}>
                  Diagrama de Flujo Operativo & Procesos DACAS (Lucid Engine)
                </h3>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted, #64748B)' }}>
                Mapeo interactivo de punta a punta: desde la captación multicanal del requerimiento hasta el fulfillment regional y entrega final.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '4px 10px', borderRadius: '8px' }}>
              ✓ Flujo Operativo Activo (99.1% SLA)
            </span>
          </div>

          {/* Diagrama de Nodos Conectados en Grilla */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            position: 'relative'
          }}>
            {LUCID_FLOW_NODES.map((node, index) => {
              const NodeIcon = node.icon;
              const isSelected = selectedFlowNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedFlowNode(node.id)}
                  style={{
                    background: isSelected ? 'rgba(15, 164, 222, 0.08)' : (isDark ? '#0f172a' : '#f8fafc'),
                    border: `2px solid ${isSelected ? node.color : 'var(--border-color, #E2E8F0)'}`,
                    borderRadius: '14px',
                    padding: '16px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 6px 20px ${node.color}33` : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${node.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <NodeIcon size={17} color={node.color} />
                    </div>
                    {index < LUCID_FLOW_NODES.length - 1 && (
                      <ArrowRight size={14} color="var(--text-muted, #94a3b8)" style={{ opacity: 0.6 }} />
                    )}
                  </div>

                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main, #0f172a)', display: 'block' }}>
                      {node.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                      {node.sub}
                    </span>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isDark ? '#1e293b' : '#ffffff',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: node.color,
                    textAlign: 'center'
                  }}>
                    {node.metrics}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle del Nodo Seleccionado */}
          {selectedFlowNode && (
            <div style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: isDark ? '#0f172a' : '#f1f5f9',
              border: '1px solid var(--border-color, #CBD5E1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#0fa4de" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>
                  Detalle Operativo del Paso Seleccionado:
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #475569)' }}>
                  {LUCID_FLOW_NODES.find(n => n.id === selectedFlowNode)?.detail}
                </span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0fa4de' }}>
                Monitoreo Continuo SLA
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 4. GRÁFICOS PRINCIPALES DE EVOLUCIÓN (RECHARTS) ── */}
      {(activeModuleTab === 'overview' || activeModuleTab === 'finanzas') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Gráfico 1: Evolución Mensual de Ingresos, Costos y Margen */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                  Evolución Financiera Mensual (Ingresos vs COGS vs Margen)
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                  Facturación consolidada en Dólares Estadounidenses (USD) con curva de margen bruto.
                </p>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0fa4de', background: 'rgba(15, 164, 222, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                OneWorld ERP
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FINANCIAL_TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMargen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SUCCESS_COLOR} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={SUCCESS_COLOR} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                  <XAxis dataKey="mes" stroke="var(--text-muted, #64748B)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted, #64748B)" fontSize={12} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [`$${val.toLocaleString()} USD`, '']}
                    contentStyle={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '1px solid var(--border-color, #E2E8F0)',
                      borderRadius: '10px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      fontSize: '12.5px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos Brutos" stroke={PRIMARY_COLOR} strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="costos" name="Costos (COGS)" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="margen" name="Margen Bruto" stroke={SUCCESS_COLOR} strokeWidth={2.5} fillOpacity={1} fill="url(#colorMargen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Carga de Casos por Departamento CRM */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                Tickets & Carga por Departamento
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                Distribución de requerimientos operativos y soporte.
              </p>
            </div>

            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEPT_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DEPT_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} tickets`, name]}
                    contentStyle={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '1px solid var(--border-color, #E2E8F0)',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {DEPT_DISTRIBUTION_DATA.slice(0, 4).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[i] }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-main, #0F172A)' }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>{d.value}</span>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>{d.slaOk}% SLA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. GRÁFICOS SECUNDARIOS: Rendimiento por País y Embudo Comercial ── */}
      {(activeModuleTab === 'overview' || activeModuleTab === 'sedes' || activeModuleTab === 'crm') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Gráfico 3: Ventas B2B y Margen por País */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                  Rendimiento Comercial por País / Hub Logístico
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                  Ventas brutas vs Margen en los 7 países de distribución directa.
                </p>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                Multi-País
              </span>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COUNTRY_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                  <XAxis dataKey="pais" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val, name) => [`$${val.toLocaleString()} USD`, name === 'ventas' ? 'Venta Total' : 'Margen Bruto']}
                    contentStyle={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '1px solid var(--border-color, #E2E8F0)',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="ventas" name="Ventas (USD)" fill={PRIMARY_COLOR} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="margen" name="Margen Bruto (USD)" fill={SUCCESS_COLOR} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 4: Embudo de Conversión Comercial CRM */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.02))'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                Embudo Comercial B2B (Funnel de Ventas)
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                Tasa de avance desde prospección hasta cierre Ganado.
              </p>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={FUNNEL_DATA} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
                  <YAxis dataKey="etapa" type="category" stroke="var(--text-muted, #64748B)" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val} Casos (${item.payload.conversion})`, 'Oportunidades']}
                    contentStyle={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '1px solid var(--border-color, #E2E8F0)',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREADOR / EDITOR DE REPORTES PERSONALIZADOS ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            borderRadius: '20px',
            border: '1px solid var(--border-color, #E2E8F0)',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, #E2E8F0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: 'var(--card-bg, #FFFFFF)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="#0fa4de" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main, #0F172A)' }}>
                  {editingReportId ? 'Editar Reporte Personalizado' : 'Creador de Reportes Libres'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #64748B)', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReportSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Título & Descripción */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0F172A)', display: 'block', marginBottom: '4px' }}>
                    Título del Reporte *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.titulo}
                    onChange={e => setReportForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ej: Análisis de Ventas de Seguridad por Trimestre"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #CBD5E1)',
                      background: 'var(--pill-bg, #F8FAFC)',
                      color: 'var(--text-main, #0F172A)',
                      fontSize: '13px',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0F172A)', display: 'block', marginBottom: '4px' }}>
                    Descripción o Propósito
                  </label>
                  <input
                    type="text"
                    value={reportForm.descripcion}
                    onChange={e => setReportForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Ej: Seguimiento de cumplimiento mensual de los canales VIP."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #CBD5E1)',
                      background: 'var(--pill-bg, #F8FAFC)',
                      color: 'var(--text-main, #0F172A)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Parámetros: Módulo, Tipo de Gráfico, Unidad, Color */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                    Módulo de Origen
                  </label>
                  <select
                    value={reportForm.modulo}
                    onChange={e => setReportForm(prev => ({ ...prev, modulo: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--pill-bg, #F8FAFC)', color: 'var(--text-main, #0F172A)', fontSize: '12px', fontWeight: '700' }}
                  >
                    <option value="erp_finanzas">💰 Finanzas ERP</option>
                    <option value="crm_tickets">🎫 CRM Tickets & SLAs</option>
                    <option value="logistica_hubs">📦 Logística & Hubs</option>
                    <option value="ecommerce_shop">🛒 DACAS Shop</option>
                    <option value="clientes_b2b">🏢 Canales B2B</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                    Tipo de Gráfico
                  </label>
                  <select
                    value={reportForm.tipoGrafico}
                    onChange={e => setReportForm(prev => ({ ...prev, tipoGrafico: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--pill-bg, #F8FAFC)', color: 'var(--text-main, #0F172A)', fontSize: '12px', fontWeight: '700' }}
                  >
                    <option value="bar">📊 Barras (BarChart)</option>
                    <option value="line">📈 Líneas (LineChart)</option>
                    <option value="area">🌊 Área con Gradiente</option>
                    <option value="pie">🍩 Circular (Pie/Donut)</option>
                    <option value="table">📋 Tabla de Datos</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    value={reportForm.unidad}
                    onChange={e => setReportForm(prev => ({ ...prev, unidad: e.target.value }))}
                    placeholder="USD, %, hs, un."
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--pill-bg, #F8FAFC)', color: 'var(--text-main, #0F172A)', fontSize: '12px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                    Color Principal
                  </label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {['#0fa4de', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444'].map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setReportForm(prev => ({ ...prev, color: col }))}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: col,
                          border: reportForm.color === col ? '2px solid #071524' : 'none',
                          cursor: 'pointer',
                          boxShadow: reportForm.color === col ? '0 0 0 2px rgba(15,164,222,0.4)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Editor Manual de Series de Datos */}
              <div style={{
                background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
                border: '1px solid var(--border-color, #CBD5E1)',
                borderRadius: '14px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                    Datos del Reporte (Filas / Series)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    style={{
                      background: 'rgba(15, 164, 222, 0.1)',
                      color: '#0fa4de',
                      border: '1px solid rgba(15, 164, 222, 0.3)',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} />
                    <span>+ Agregar Fila</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {reportForm.rows.map((row, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 34px', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Etiqueta (ej: Q1, Fortinet)"
                        value={row.label}
                        onChange={e => handleUpdateRow(idx, 'label', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--card-bg, #FFFFFF)', fontSize: '12px', color: 'var(--text-main, #0F172A)' }}
                      />
                      <input
                        type="number"
                        placeholder="Valor numérico"
                        value={row.valor}
                        onChange={e => handleUpdateRow(idx, 'valor', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--card-bg, #FFFFFF)', fontSize: '12px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}
                      />
                      <input
                        type="text"
                        placeholder="Detalle extra (opcional)"
                        value={row.extra || ''}
                        onChange={e => handleUpdateRow(idx, 'extra', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #CBD5E1)', background: 'var(--card-bg, #FFFFFF)', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={reportForm.rows.length <= 1}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: reportForm.rows.length <= 1 ? 0.3 : 1 }}
                        title="Eliminar fila"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox Fijar en Portada */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={reportForm.pinned}
                  onChange={e => setReportForm(prev => ({ ...prev, pinned: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main, #0F172A)' }}>
                  Fijar este reporte en el Tablero Principal (Pinned)
                </span>
              </label>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #CBD5E1)',
                    background: 'var(--pill-bg, #F8FAFC)',
                    color: 'var(--text-muted, #64748B)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)'
                  }}
                >
                  {editingReportId ? 'Actualizar Reporte' : 'Guardar y Publicar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutGridIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
