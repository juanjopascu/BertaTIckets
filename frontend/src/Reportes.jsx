import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API_BASE_URL = `http://${window.location.hostname}:3001`;
const API_URL = `${API_BASE_URL}/api/clientes`;
const DEPT_URL = `${API_BASE_URL}/api/departamentos`;
const ESTADOS_URL = `${API_BASE_URL}/api/estados`;

const COLORS = ['#0f766e', '#06b6d4', '#4cc9f0', '#f72585', '#0284c7', '#f8961e', '#277da1'];
const COMPLIANT_COLOR = '#10b981'; // Green
const VIOLATED_COLOR = '#ef4444'; // Red

function Reportes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sla'); // 'sla', 'estados', 'agentes', 'audit'
  const [searchAudit, setSearchAudit] = useState('');
  
  // Estados para Bitácora de Acciones
  const [accionesLog, setAccionesLog] = useState([]);
  const [searchBitacora, setSearchBitacora] = useState('');
  const [subTabAudit, setSubTabAudit] = useState('metricas'); // 'metricas' | 'bitacora'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resDept = await fetch(DEPT_URL);
      const depts = await resDept.json();
      setDepartamentos(depts);

      const resEst = await fetch(ESTADOS_URL);
      const ests = await resEst.json();
      setEstados(ests);

      const resCli = await fetch(API_URL);
      const clis = await resCli.json();
      setClientes(clis);

      // Cargar Bitácora de Acciones
      const resAudit = await fetch(`${API_BASE_URL}/api/admin/auditoria-acciones`);
      if (resAudit.ok) {
        const auditData = await resAudit.json();
        setAccionesLog(auditData);
      }
    } catch (err) {
      console.error("Error obteniendo datos para reportes", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper para formatear duraciones en milisegundos a texto legible
  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return "0 mins";
    const totalMins = Math.floor(ms / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // ----------------------------------------------------
  // 1. CALCULADOR DE TIEMPOS POR ESTADO
  // ----------------------------------------------------
  const calculateStateTimes = () => {
    const stats = {};
    // Inicializar con todos los estados conocidos
    estados.forEach(e => {
      stats[e.nombre] = { totalMs: 0, count: 0 };
    });

    clientes.forEach(c => {
      const history = c.historial_estados || [];
      history.forEach(h => {
        const desde = new Date(h.desde);
        const hasta = h.hasta ? new Date(h.hasta) : new Date();
        const diff = hasta - desde;
        
        if (!stats[h.estado]) {
          stats[h.estado] = { totalMs: 0, count: 0 };
        }
        stats[h.estado].totalMs += diff;
        stats[h.estado].count += 1;
      });
    });

    return Object.keys(stats).map(name => {
      const info = stats[name];
      const avgHrs = info.count > 0 ? (info.totalMs / info.count / 3600000) : 0;
      return {
        name,
        avgHours: parseFloat(avgHrs.toFixed(2)),
        formattedTime: formatDuration(info.count > 0 ? Math.round(info.totalMs / info.count) : 0),
        count: info.count,
        totalMs: info.totalMs
      };
    });
  };

  // ----------------------------------------------------
  // 2. CALCULADOR DE SLA POR DEPARTAMENTO
  // ----------------------------------------------------
  const calculateSlaStats = () => {
    return departamentos.map(dept => {
      const deptTickets = clientes.filter(c => c.departamento === dept.id);
      const limitHours = dept.sla_horas || 24;
      let compliantCount = 0;
      let violatedCount = 0;

      const ticketDetails = deptTickets.map(t => {
        const isResolved = t.estado_embudo === 'Ganado' || t.estado_embudo === 'Perdido';
        let endDate = new Date();
        
        if (isResolved && t.historial_estados) {
          const resTransition = t.historial_estados.find(h => h.estado === 'Ganado' || h.estado === 'Perdido');
          if (resTransition) {
            endDate = new Date(resTransition.desde);
          } else {
            endDate = t.creado_en ? new Date(t.creado_en) : new Date();
          }
        }
        
        const createdDate = t.creado_en ? new Date(t.creado_en) : new Date();
        const elapsedHours = (endDate - createdDate) / 3600000;
        const isCompliant = elapsedHours <= limitHours;

        if (isCompliant) compliantCount++;
        else violatedCount++;

        return {
          id: t.id,
          nombre: t.nombre,
          asunto: t.empresa,
          estado: t.estado_embudo,
          prioridad: t.prioridad,
          horasTranscurridas: parseFloat(elapsedHours.toFixed(1)),
          limiteSLA: limitHours,
          cumplido: isCompliant
        };
      });

      const total = deptTickets.length;
      const rate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

      return {
        id: dept.id,
        nombre: dept.nombre,
        sla_horas: limitHours,
        total,
        cumplidos: compliantCount,
        incumplidos: violatedCount,
        tasaCumplimiento: rate,
        tickets: ticketDetails
      };
    });
  };

  // ----------------------------------------------------
  // 3. CALCULADOR DE TIEMPOS POR AGENTE
  // ----------------------------------------------------
  const calculateAgentTimes = () => {
    const agentStats = {};

    clientes.forEach(c => {
      const history = c.historial_asignados || [];
      history.forEach(h => {
        if (!h.asignado_a) return;
        const desde = new Date(h.desde);
        const hasta = h.hasta ? new Date(h.hasta) : new Date();
        const diff = hasta - desde;
        
        if (!agentStats[h.asignado_a]) {
          agentStats[h.asignado_a] = { totalMs: 0, count: 0, activeCount: 0 };
        }
        agentStats[h.asignado_a].totalMs += diff;
        agentStats[h.asignado_a].count += 1;
      });

      // Contar tickets activos actualmente asignados
      if (c.asignado_a && c.estado_embudo !== 'Ganado' && c.estado_embudo !== 'Perdido') {
        if (!agentStats[c.asignado_a]) {
          agentStats[c.asignado_a] = { totalMs: 0, count: 0, activeCount: 0 };
        }
        agentStats[c.asignado_a].activeCount += 1;
      }
    });

    return Object.keys(agentStats).map(name => {
      const info = agentStats[name];
      const hrs = info.totalMs / 3600000;
      return {
        name,
        totalHours: parseFloat(hrs.toFixed(2)),
        formattedTime: formatDuration(info.totalMs),
        activeTickets: info.activeCount,
        totalTransitions: info.count
      };
    });
  };

  // ----------------------------------------------------
  // EXPORTACIONES A CSV
  // ----------------------------------------------------
  const downloadCSV = (rows, headers, filename) => {
    const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.map(escape).join(",")].concat(rows.map(row => row.map(escape).join(","))).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSlaCSV = () => {
    const stats = calculateSlaStats();
    const headers = ["Departamento", "SLA Configurado (Horas)", "Tickets Totales", "Cumplidos", "Incumplidos", "Tasa Cumplimiento (%)"];
    const rows = stats.map(s => [
      s.nombre,
      s.sla_horas,
      s.total,
      s.cumplidos,
      s.incumplidos,
      `${s.tasaCumplimiento}%`
    ]);
    downloadCSV(rows, headers, "cumplimiento_sla_departamentos.csv");
  };

  const exportStateTimesCSV = () => {
    const stats = calculateStateTimes();
    const headers = ["Estado", "Tiempo Promedio (Horas)", "Tiempo Promedio (Texto)", "Transiciones Registradas"];
    const rows = stats.map(s => [
      s.name,
      s.avgHours,
      s.formattedTime,
      s.count
    ]);
    downloadCSV(rows, headers, "tiempo_promedio_estados.csv");
  };

  const exportAgentCSV = () => {
    const stats = calculateAgentTimes();
    const headers = ["Agente", "Tiempo Total Asignado", "Horas Decimales", "Tickets Activos Asignados", "Transiciones Asignadas"];
    const rows = stats.map(s => [
      s.name,
      s.formattedTime,
      s.totalHours,
      s.activeTickets,
      s.totalTransitions
    ]);
    downloadCSV(rows, headers, "tiempo_asignacion_agentes.csv");
  };

  const filteredAuditTickets = clientes.filter(t => {
    const q = searchAudit.toLowerCase().trim();
    if (!q) return true;
    
    const currentOwner = (t.asignado_a || 'Sin asignar').toLowerCase();
    const pastOwners = (t.historial_asignados || [])
      .map(h => h.asignado_a)
      .filter(Boolean)
      .map(n => n.toLowerCase());
    
    return (
      t.id.toString().includes(q) ||
      (t.empresa && t.empresa.toLowerCase().includes(q)) ||
      (t.creado_por && t.creado_por.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      currentOwner.includes(q) ||
      pastOwners.some(p => p.includes(q))
    );
  });

  const exportAuditCSV = () => {
    const headers = [
      "ID Ticket", 
      "Asunto / Empresa", 
      "Creador", 
      "Owner Actual", 
      "Owners Anteriores", 
      "Cambios de Estado", 
      "Cambios de Departamento", 
      "Cantidad de Respuestas", 
      "Fecha Creacion", 
      "Ultima Modificacion"
    ];
    const rows = filteredAuditTickets.map(t => {
      const currentOwner = t.asignado_a || 'Sin asignar';
      const pastOwners = (t.historial_asignados || [])
        .map(h => h.asignado_a)
        .filter(Boolean)
        .filter(name => name !== t.asignado_a);
      const uniquePastOwners = Array.from(new Set(pastOwners)).join(', ') || 'Ninguno';
      
      const stateChanges = Math.max(0, (t.historial_estados || []).length - 1);
      const deptChanges = Math.max(0, (t.historial_departamentos || []).length - 1);
      const responsesCount = (t.notas || []).length;
      
      const createdDate = t.creado_en ? new Date(t.creado_en).toLocaleString() : '-';
      const updatedDate = t.actualizado_en ? new Date(t.actualizado_en).toLocaleString() : (t.creado_en ? new Date(t.creado_en).toLocaleString() : '-');
      
      return [
        `#${t.id}`,
        t.empresa || 'Asunto sin especificar',
        t.creado_por || t.email || 'Cliente',
        currentOwner,
        uniquePastOwners,
        stateChanges,
        deptChanges,
        responsesCount,
        createdDate,
        updatedDate
      ];
    });
    downloadCSV(rows, headers, "reporte_auditoria_trazabilidad.csv");
  };

  const filteredAccionesLog = accionesLog.filter(acc => {
    if (!searchBitacora.trim()) return true;
    const q = searchBitacora.toLowerCase();
    return (
      acc.ticketId?.toString().includes(q) ||
      acc.ticketNombre?.toLowerCase().includes(q) ||
      acc.ticketEmail?.toLowerCase().includes(q) ||
      acc.accion?.toLowerCase().includes(q) ||
      acc.detalle?.toLowerCase().includes(q) ||
      acc.usuario?.toLowerCase().includes(q) ||
      (acc.fecha && new Date(acc.fecha).toLocaleString().toLowerCase().includes(q))
    );
  });

  const exportBitacoraCSV = () => {
    const headers = [
      "Fecha y Hora",
      "ID Ticket",
      "Asunto / Empresa",
      "Email Cliente",
      "Operador / Operario",
      "Accion",
      "Detalle de la Operacion"
    ];
    const rows = filteredAccionesLog.map(acc => [
      acc.fecha ? new Date(acc.fecha).toLocaleString() : '-',
      `#${acc.ticketId || ''}`,
      acc.ticketNombre || '',
      acc.ticketEmail || '',
      acc.usuario || 'Sistema',
      acc.accion || '',
      acc.detalle || ''
    ]);
    downloadCSV(rows, headers, "bitacora_acciones_tickets.csv");
  };

  // KPIs Resumen
  const totalTickets = clientes.length;
  const ganados = clientes.filter(c => c.estado_embudo === 'Ganado').length;
  
  const slaStats = calculateSlaStats();
  const totalCumplidos = slaStats.reduce((acc, curr) => acc + curr.cumplidos, 0);
  const complianceRate = totalTickets > 0 ? Math.round((totalCumplidos / totalTickets) * 100) : 100;

  const agentTimes = calculateAgentTimes();
  const busiestAgent = agentTimes.length > 0 
    ? agentTimes.sort((a,b) => b.activeTickets - a.activeTickets)[0]?.name 
    : 'Ninguno';

  if (loading) {
    return (
      <div className="crm-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Cargando análisis avanzado...</h2>
          <p style={{ color: '#8e8e93', marginTop: '10px' }}>Procesando históricos de tickets y métricas SLA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crm-container">
      {/* Estilos locales para impresión e interactividad premium */}
      <style>{`
        .tab-buttons {
          display: flex;
          background: rgba(120, 120, 128, 0.08);
          border-radius: 16px;
          padding: 4px;
          margin-bottom: 24px;
          gap: 4px;
        }
        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 0.95rem;
          color: #8e8e93;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .tab-btn.active {
          background: white;
          color: #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .report-section-card {
          background: var(--card-bg, white);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
          animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          margin-bottom: 30px;
        }
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .badge-compliant {
          background: #e6fcf5;
          color: #0ca678;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .badge-violated {
          background: #fff5f5;
          color: #fa5252;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.8rem;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          .nav-btn, .tab-buttons, .action-bar, .user-controls, header, .logout-btn {
            display: none !important;
          }
          .crm-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .report-section-card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            page-break-inside: avoid;
            margin-bottom: 20px !important;
            padding: 15px !important;
          }
          .kpi-section {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .kpi-card {
            flex: 1 1 20% !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <header className="crm-header grid-header">
        <div className="header-top">
          <h1>Reportería y SLA Avanzado</h1>
          <div className="user-controls">
            <button className="nav-btn" onClick={() => window.print()} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
              🖨️ Exportar PDF / Imprimir
            </button>
            <button className="nav-btn" onClick={() => navigate('/')}>
              🔙 Volver al Dashboard
            </button>
          </div>
        </div>
        <p>Métricas detalladas de cumplimiento, tiempos de resolución y rendimiento del personal de soporte.</p>
      </header>

      <main className="crm-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        
        {/* Sección KPIs */}
        <section className="kpi-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div className="kpi-card">
            <h3>Cumplimiento SLA General</h3>
            <p className="kpi-number" style={{ color: complianceRate >= 80 ? COMPLIANT_COLOR : VIOLATED_COLOR }}>
              {complianceRate}%
            </p>
          </div>
          <div className="kpi-card">
            <h3>Total de Tickets</h3>
            <p className="kpi-number">{totalTickets}</p>
          </div>
          <div className="kpi-card">
            <h3>Tickets Ganados / Resueltos</h3>
            <p className="kpi-number" style={{ color: 'var(--primary)' }}>{ganados}</p>
          </div>
          <div className="kpi-card">
            <h3>Agente con más Carga</h3>
            <p className="kpi-number" style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{busiestAgent}</p>
          </div>
        </section>

        {/* Selector de Pestañas (Samsung One UI 8.5 Style) */}
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'sla' ? 'active' : ''}`} onClick={() => setActiveTab('sla')}>
            🏢 SLA de Departamentos
          </button>
          <button className={`tab-btn ${activeTab === 'estados' ? 'active' : ''}`} onClick={() => setActiveTab('estados')}>
            🏷️ Tiempos en Estados
          </button>
          <button className={`tab-btn ${activeTab === 'agentes' ? 'active' : ''}`} onClick={() => setActiveTab('agentes')}>
            👤 Desempeño de Agentes
          </button>
          <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            🕵️ Auditoría y Trazabilidad
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑA: SLA DE DEPARTAMENTOS */}
        {activeTab === 'sla' && (
          <div>
            <div className="report-section-card">
              <div className="action-bar">
                <h3>Cumplimiento de SLA por Departamento</h3>
                <button className="nav-btn" onClick={exportSlaCSV} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  📥 Descargar CSV
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Gráfico Recharts Stacked Bar */}
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={calculateSlaStats().map(s => ({
                        name: s.nombre,
                        'Cumplidos': s.cumplidos,
                        'Incumplidos': s.incumplidos
                      }))}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Legend />
                      <Bar dataKey="Cumplidos" stackId="a" fill={COMPLIANT_COLOR} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Incumplidos" stackId="a" fill={VIOLATED_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="report-section-card">
              <h3>Detalle de Tiempos y Cumplimiento</h3>
              <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Departamento</th>
                      <th>SLA Límite</th>
                      <th>Total Tickets</th>
                      <th>Cumplieron SLA</th>
                      <th>Excedieron SLA</th>
                      <th>Porcentaje Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateSlaStats().map(dept => (
                      <tr key={dept.id}>
                        <td><strong>{dept.nombre}</strong></td>
                        <td>{dept.sla_horas} horas</td>
                        <td>{dept.total}</td>
                        <td style={{ color: COMPLIANT_COLOR, fontWeight: 'bold' }}>{dept.cumplidos}</td>
                        <td style={{ color: VIOLATED_COLOR, fontWeight: 'bold' }}>{dept.incumplidos}</td>
                        <td>
                          <span 
                            style={{ 
                              background: dept.tasaCumplimiento >= 80 ? '#e6fcf5' : '#fff5f5', 
                              color: dept.tasaCumplimiento >= 80 ? COMPLIANT_COLOR : VIOLATED_COLOR,
                              padding: '4px 10px', 
                              borderRadius: '8px', 
                              fontWeight: 'bold'
                            }}
                          >
                            {dept.tasaCumplimiento}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="report-section-card">
              <h3>Desglose Individual de Cumplimiento (SLA)</h3>
              <p style={{ color: '#6e6e73', marginBottom: '15px', fontSize: '0.9rem' }}>Lista detallada de todos los tickets y su estado de cumplimiento con respecto al SLA departamental.</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>ID Ticket</th>
                      <th>Cliente</th>
                      <th>Asunto / Empresa</th>
                      <th>Estado</th>
                      <th>Tiempo Transcurrido</th>
                      <th>SLA Permitido</th>
                      <th>Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateSlaStats().flatMap(d => d.tickets).length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#8e8e93' }}>No hay tickets registrados.</td></tr>
                    ) : (
                      calculateSlaStats().flatMap(d => d.tickets).map(t => (
                        <tr key={t.id}>
                          <td><strong>#{t.id}</strong></td>
                          <td>{t.nombre}</td>
                          <td>{t.asunto || '-'}</td>
                          <td>
                            <span className="badge" style={{ background: '#eff6ff', color: '#1e40af' }}>{t.estado}</span>
                          </td>
                          <td>{t.horasTranscurridas} horas</td>
                          <td>{t.limiteSLA} horas</td>
                          <td>
                            {t.cumplido ? (
                              <span className="badge-compliant">✓ Cumplido</span>
                            ) : (
                              <span className="badge-violated">✗ Incumplido</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE PESTAÑA: TIEMPOS POR ESTADO */}
        {activeTab === 'estados' && (
          <div>
            <div className="report-section-card">
              <div className="action-bar">
                <h3>Tiempo Promedio de Permanencia por Estado</h3>
                <button className="nav-btn" onClick={exportStateTimesCSV} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  📥 Descargar CSV
                </button>
              </div>

              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={calculateStateTimes()}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Horas Promedio', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [`${value} horas`, 'Tiempo Promedio']} />
                    <Bar dataKey="avgHours" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                      {calculateStateTimes().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="report-section-card">
              <h3>Métricas Detalladas por Estado de Embudo</h3>
              <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Estado del Embudo</th>
                      <th>Tiempo Promedio (Horas Decimales)</th>
                      <th>Tiempo Promedio Formateado</th>
                      <th>Total Transiciones Registradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStateTimes().map(s => (
                      <tr key={s.name}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.avgHours} horas</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{s.formattedTime}</td>
                        <td>{s.count} veces</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE PESTAÑA: DESEMPEÑO DE AGENTES */}
        {activeTab === 'agentes' && (
          <div>
            <div className="report-section-card">
              <div className="action-bar">
                <h3>Tiempo Acumulado de Asignación por Agente</h3>
                <button className="nav-btn" onClick={exportAgentCSV} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  📥 Descargar CSV
                </button>
              </div>

              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={calculateAgentTimes()}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Horas Totales', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [`${value} horas`, 'Tiempo Total Asignado']} />
                    <Bar dataKey="totalHours" fill="var(--purple-brand)" radius={[8, 8, 0, 0]}>
                      {calculateAgentTimes().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="report-section-card">
              <h3>Desempeño y Asignación de Agentes</h3>
              <p style={{ color: '#6e6e73', marginBottom: '15px', fontSize: '0.9rem' }}>Muestra el tiempo total que cada agente ha tenido tickets asignados y su carga de trabajo activa actual.</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Nombre del Agente</th>
                      <th>Tickets Activos Asignados</th>
                      <th>Total Asignaciones Históricas</th>
                      <th>Tiempo Total Asignado (Horas)</th>
                      <th>Tiempo Total Asignado Formateado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateAgentTimes().length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#8e8e93' }}>No hay datos de asignación registrados.</td></tr>
                    ) : (
                      calculateAgentTimes().map(agent => (
                        <tr key={agent.name}>
                          <td><strong>{agent.name}</strong></td>
                          <td>
                            <span 
                              style={{ 
                                background: agent.activeTickets > 0 ? '#eff6ff' : '#f8fafc',
                                color: agent.activeTickets > 0 ? '#1e40af' : '#8e8e93',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                fontWeight: 'bold'
                              }}
                            >
                              {agent.activeTickets} tickets
                            </span>
                          </td>
                          <td>{agent.totalTransitions} asignaciones</td>
                          <td>{agent.totalHours} horas</td>
                          <td style={{ color: 'var(--purple-brand)', fontWeight: 'bold' }}>{agent.formattedTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            {/* Selector de sub-vista de auditoría premium */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px' }}>
              <button 
                onClick={() => setSubTabAudit('metricas')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '0.95rem',
                  fontWeight: subTabAudit === 'metricas' ? '700' : '500',
                  color: subTabAudit === 'metricas' ? 'var(--primary)' : '#8e8e93',
                  borderBottom: subTabAudit === 'metricas' ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                📊 Métricas Resumidas
              </button>
              <button 
                onClick={() => setSubTabAudit('bitacora')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '0.95rem',
                  fontWeight: subTabAudit === 'bitacora' ? '700' : '500',
                  color: subTabAudit === 'bitacora' ? 'var(--primary)' : '#8e8e93',
                  borderBottom: subTabAudit === 'bitacora' ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                📜 Bitácora de Operaciones (Línea de Tiempo)
              </button>
            </div>

            {subTabAudit === 'metricas' ? (
              <div className="report-section-card">
                <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Auditoría y Trazabilidad de Incidencias</h3>
                    <p style={{ color: '#8e8e93', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                      Control de cambios de estado, de departamento, historial de owners, respuestas y modificaciones.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="🔍 Buscar por ID, asunto, creador u owner..."
                      value={searchAudit}
                      onChange={(e) => setSearchAudit(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: '1px solid #d2d2d7',
                        background: 'white',
                        color: 'black',
                        minWidth: '280px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    />
                    <button className="nav-btn" onClick={exportAuditCSV} style={{ background: 'var(--primary-light)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                      📥 Descargar CSV de Auditoría
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                  <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '80px', textAlign: 'left', padding: '12px 16px' }}>ID Ticket</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Asunto / Empresa</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Creador</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Owner Actual</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Owners Anteriores</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Cambios Estado</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Cambios Depto</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Respuestas</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Última Modificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditTickets.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', color: '#8e8e93', padding: '40px 20px' }}>
                            No se encontraron tickets con los criterios de búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditTickets.map(t => {
                          const currentOwner = t.asignado_a || <span style={{ color: '#8e8e93', fontStyle: 'italic' }}>Sin asignar</span>;
                          
                          const pastOwners = (t.historial_asignados || [])
                            .map(h => h.asignado_a)
                            .filter(Boolean)
                            .filter(name => name !== t.asignado_a);
                          const uniquePastOwners = Array.from(new Set(pastOwners));

                          const stateChanges = Math.max(0, (t.historial_estados || []).length - 1);
                          const deptChanges = Math.max(0, (t.historial_departamentos || []).length - 1);
                          const responsesCount = (t.notas || []).length;
                          
                          const lastMod = t.actualizado_en 
                            ? new Date(t.actualizado_en).toLocaleString() 
                            : (t.creado_en ? new Date(t.creado_en).toLocaleString() : '-');

                          return (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <td style={{ padding: '12px 16px' }}><strong>#{t.id}</strong></td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-main, #1c1c1e)' }}>{t.empresa || 'Asunto sin especificar'}</div>
                                <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>Creado: {t.creado_en ? new Date(t.creado_en).toLocaleDateString() : '-'}</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: '500', color: 'var(--text-main, #1c1c1e)' }}>{t.creado_por || 'Cliente'}</div>
                                <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>{t.email || '-'}</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ 
                                  background: t.asignado_a ? '#eff6ff' : '#f4f4f5', 
                                  color: t.asignado_a ? '#1e40af' : '#71717a', 
                                  padding: '4px 8px', 
                                  borderRadius: '8px', 
                                  fontWeight: '600', 
                                  fontSize: '0.8rem' 
                                }}>
                                  {currentOwner}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {uniquePastOwners.length === 0 ? (
                                  <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Ninguno</span>
                                ) : (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {uniquePastOwners.map((po, idx) => (
                                      <span key={idx} style={{ background: '#f4f4f5', color: '#52525b', padding: '2px 6px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                        {po}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                <span style={{ 
                                  background: stateChanges > 0 ? '#fffbeb' : '#f0fdf4', 
                                  color: stateChanges > 0 ? '#b45309' : '#15803d', 
                                  padding: '4px 10px', 
                                  borderRadius: '12px', 
                                  fontWeight: '700',
                                  fontSize: '0.85rem'
                                }}>
                                  {stateChanges}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                <span style={{ 
                                  background: deptChanges > 0 ? '#fdf2f8' : '#f0fdf4', 
                                  color: deptChanges > 0 ? '#be185d' : '#15803d', 
                                  padding: '4px 10px', 
                                  borderRadius: '12px', 
                                  fontWeight: '700',
                                  fontSize: '0.85rem'
                                }}>
                                  {deptChanges}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                                <span style={{ 
                                  background: '#f0fdf4', 
                                  color: '#16a34a', 
                                  padding: '4px 10px', 
                                  borderRadius: '12px', 
                                  fontWeight: '700',
                                  fontSize: '0.85rem'
                                }}>
                                  {responsesCount}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: '500', color: 'var(--primary)', fontSize: '0.85rem' }}>{lastMod}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Vista de Bitácora de Operaciones (System Event Timeline)
              <div className="report-section-card">
                <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Historial de Operaciones del Sistema (Event Timeline)</h3>
                    <p style={{ color: '#8e8e93', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                      Bitácora consolidada y cronológica de cada acción individual efectuada sobre los tickets.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="🔍 Buscar por Ticket, Operador, Acción..."
                      value={searchBitacora}
                      onChange={(e) => setSearchBitacora(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: '1px solid #d2d2d7',
                        background: 'white',
                        color: 'black',
                        minWidth: '320px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    />
                    <button className="nav-btn" onClick={exportBitacoraCSV} style={{ background: '#eff6ff', color: '#1e40af', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                      📥 Exportar Bitácora (CSV)
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                  <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 16px', width: '180px' }}>Fecha y Hora</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', width: '220px' }}>Ticket Relacionado</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', width: '150px' }}>Acción</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', width: '200px' }}>Operador</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Detalle de la Operación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccionesLog.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#8e8e93', padding: '40px 20px' }}>
                            No se encontraron registros en la bitácora con los criterios de búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredAccionesLog.map(acc => {
                          let badgeBg = 'rgba(107, 114, 128, 0.08)';
                          let badgeFg = '#6b7280';
                          
                          if (acc.accion === 'Creación') {
                            badgeBg = 'rgba(16, 185, 129, 0.1)';
                            badgeFg = '#10b981';
                          } else if (acc.accion === 'Transferencia') {
                            badgeBg = 'rgba(2, 132, 199, 0.1)';
                            badgeFg = 'var(--purple-brand)';
                          } else if (acc.accion === 'Reasignación') {
                            badgeBg = 'var(--primary-light)';
                            badgeFg = 'var(--primary)';
                          } else if (acc.accion === 'Comentario') {
                            badgeBg = 'rgba(248, 150, 30, 0.1)';
                            badgeFg = '#f8961e';
                          } else if (acc.accion === 'Cambio de Estado') {
                            badgeBg = 'rgba(247, 37, 133, 0.1)';
                            badgeFg = '#f72585';
                          } else if (acc.accion === 'Cambio de Prioridad') {
                            badgeBg = 'rgba(239, 68, 68, 0.1)';
                            badgeFg = '#ef4444';
                          }

                          return (
                            <tr key={acc.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: '500', color: 'var(--primary)', fontSize: '0.85rem' }}>
                                  {acc.fecha ? new Date(acc.fecha).toLocaleString() : '-'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1c1c1e' }}>
                                    Ticket #{acc.ticketId}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#8e8e93', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                    {acc.ticketNombre || 'Sin especificar'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  background: badgeBg,
                                  color: badgeFg,
                                  padding: '5px 10px',
                                  borderRadius: '12px',
                                  fontWeight: '700',
                                  fontSize: '0.75rem',
                                  display: 'inline-block',
                                  letterSpacing: '0.3px'
                                }}>
                                  {acc.accion}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '0.85rem' }}>
                                  {acc.usuario || 'Sistema'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '0.88rem', color: '#1f2937', fontWeight: '500' }}>
                                  {acc.detalle}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default Reportes;
