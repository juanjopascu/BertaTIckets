import React, { useState, useEffect } from 'react';

const MACROS = [
  "Hola, hemos recibido tu consulta. Estamos trabajando en ello.",
  "Requerimos más información o documentación para continuar.",
  "El departamento técnico ya está analizando tu caso.",
  "Tu ticket ha sido resuelto y será cerrado."
];

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const TRAVEL_GROUPS = [
  {
    title: '👤 Datos Personales',
    fields: [
      'Quien solicita',
      'Correo Electronico',
      'Cargo',
      'Autorizante',
      'Nombre completo como figura en el documento de viaje',
      'Fecha de nacimiento',
      'Tipo de documento de viaje',
      'Numero de Documento de viaje',
      'Fecha de vencimiento del Documento de viaje',
      'Fecha de Emision Del Documento de viaje',
      'Nacionalidad',
      'Numero de Visa'
    ]
  },
  {
    title: '📞 Teléfono Completo',
    fields: [
      'Codigo De Area',
      'Numero de telefono'
    ]
  },
  {
    title: '✈️ Datos del Viaje',
    fields: [
      'Tipo de Viaje',
      'Pais de Origen// Departure Country',
      'Otro',
      'Pais de Destino // Country Destination',
      'Otro Destino',
      'Unicamente Multidestinos',
      'Motivo Del Viaje',
      'Id De La Campaña',
      'Fabrica Por la que viaja',
      'otra Fabrica',
      'Nombre del Canal que va a visitar',
      'Ciudad de Origen Y Aeropuerto',
      'Cuidad de Destino Y Aeropuerto',
      'Fecha de llegada a Destino',
      'Horario de llegada a Destino',
      'Franja Horaria',
      'Fecha que debe irse del Destino',
      'Horario que debe irse del destino',
      'Franja Horaria Salida',
      'Solicita equipaje en Bodega',
      'Cantidad de Equipaje en Bodega'
    ]
  },
  {
    title: '🚨 Datos de Emergencia',
    fields: [
      'Contacto',
      'Parentesco',
      'Numero de celular'
    ]
  },
  {
    title: '🏨 Solicita Hotel',
    fields: [
      '¿Solicita Hotel?',
      'Check IN',
      'Check Out',
      'Hotel sugerido o área de locación del mismo.',
      'REQUERIMIENTOS ESPECIALES'
    ]
  }
];

function TicketModal({ cliente, onClose, onTicketUpdated, usuario, isCustomer, departamentos = [], estadosEmbudo = [], agentes = [] }) {
  const [nota, setNota] = useState('');
  const [archivosNota, setArchivosNota] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nuevoDepto, setNuevoDepto] = useState(cliente.departamento);

  useEffect(() => {
    setNuevoDepto(cliente.departamento);
  }, [cliente.id, cliente.departamento]);

  const notas = cliente.notas || [];
  
  const camposExtraObj = cliente.camposExtra
    ? (typeof cliente.camposExtra === 'string'
      ? (() => { try { return JSON.parse(cliente.camposExtra); } catch (e) { return {}; } })()
      : cliente.camposExtra)
    : null;
  const isExpense = camposExtraObj?.isExpense === true;
  const expenseType = camposExtraObj?.expenseType;

  const handleActualizarTicket = async (e) => {
    e?.preventDefault();

    const deptoCambiado = parseInt(nuevoDepto) !== parseInt(cliente.departamento);
    const tieneNota = nota.trim() || archivosNota.length > 0;

    if (!deptoCambiado && !tieneNota) return;

    // Validar tamaño de archivo en el cliente (15 MB por archivo)
    const MAX_SIZE = 15 * 1024 * 1024;
    for (let file of archivosNota) {
      if (file.size > MAX_SIZE) {
        setError(`El archivo "${file.name}" supera el tamaño máximo permitido de 15 MB.`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let clienteActualizado = { ...cliente };

      // 1. Agregar Nota si tiene contenido o archivos
      if (tieneNota) {
        const form = new FormData();
        form.append('mensaje', nota);
        form.append('autor', usuario.nombre);
        
        if (archivosNota.length > 0) {
          archivosNota.forEach(file => {
            form.append('documentos', file);
          });
        }

        const responseNota = await fetch(`${API_BASE_URL}/api/clientes/${cliente.id}/notas`, {
          method: 'POST',
          body: form
        });
        
        if (!responseNota.ok) {
          const errData = await responseNota.json();
          throw new Error(errData.error || 'Error al agregar nota');
        }
        
        const nuevaNota = await responseNota.json();
        clienteActualizado.notas = [...(clienteActualizado.notas || []), nuevaNota];
        clienteActualizado.actualizado_en = nuevaNota.fecha;
      }

      // 2. Transferir de departamento si cambió
      if (deptoCambiado) {
        const payload = { 
          ...clienteActualizado, 
          departamento: parseInt(nuevoDepto), 
          operador: usuario?.email || usuario?.nombre || 'Desconocido' 
        };
        const responseDepto = await fetch(`${API_BASE_URL}/api/clientes/${cliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!responseDepto.ok) {
          const errData = await responseDepto.json();
          throw new Error(errData.error || 'Error al transferir departamento');
        }
        
        clienteActualizado = await responseDepto.json();
      }

      onTicketUpdated(cliente.id, clienteActualizado);
      setNota('');
      setArchivosNota([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMacroSelect = (macroText) => {
    setNota(macroText);
  };

  const handleUpdateTicketField = async (field, value) => {
    try {
      const payload = { 
        ...cliente, 
        [field]: value, 
        operador: usuario?.email || usuario?.nombre || 'Desconocido' 
      };
      const response = await fetch(`${API_BASE_URL}/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updatedCliente = await response.json();
        onTicketUpdated(cliente.id, updatedCliente);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Ticket #{cliente.id}: {cliente.nombre}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {usuario?.rol === 'admin' && (
              <button 
                onClick={() => window.print()}
                className="btn-submit"
                style={{
                  width: 'auto',
                  padding: '12px 24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" rx="1" />
                </svg>
                Exportar a PDF
              </button>
            )}
            <button onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-content-flex">
          <div className="modal-info-panel">
            <h4>Detalles</h4>
            {cliente.comentario && (
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(15, 118, 110, 0.02) 100%)',
                border: '1px solid rgba(15, 118, 110, 0.12)',
                padding: '14px 18px',
                borderRadius: '18px',
                marginBottom: '20px',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.02)'
              }}>
                <span style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px'
                }}>
                  💬 Comentarios
                </span>
                <p style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {cliente.comentario}
                </p>
              </div>
            )}
            <p><strong>Empresa:</strong> {cliente.empresa || '-'}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono || '-'}</p>
            <p><strong>Asignado A:</strong> {cliente.asignado_a || <span style={{ color: '#8e8e93', fontStyle: 'italic' }}>Sin asignar</span>}</p>
            
            {isCustomer ? (
              <>
                <p style={{ marginTop: '10px' }}><strong>Estado:</strong> <span className="badge">{cliente.estado_embudo}</span></p>
                <p style={{ marginTop: '10px' }}><strong>Prioridad:</strong></p>
                <span className={`badge prioridad-${(cliente.prioridad || 'Normal').toLowerCase()}`}>{cliente.prioridad || 'Normal'}</span>
              </>
            ) : (
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6e6e73', marginBottom: '6px' }}>Estado:</label>
                  <select 
                    value={cliente.estado_embudo} 
                    onChange={(e) => handleUpdateTicketField('estado_embudo', e.target.value)}
                  >
                    {estadosEmbudo.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6e6e73', marginBottom: '6px' }}>Transferir Departamento:</label>
                  <select 
                    value={nuevoDepto} 
                    onChange={(e) => setNuevoDepto(e.target.value)}
                  >
                    {departamentos.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6e6e73', marginBottom: '6px' }}>Prioridad:</label>
                  <select 
                    value={cliente.prioridad || 'Normal'} 
                    onChange={(e) => handleUpdateTicketField('prioridad', e.target.value)}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#6e6e73', marginBottom: '6px' }}>Asignar Agente:</label>
                  <select 
                    value={cliente.asignado_a || ''} 
                    onChange={(e) => handleUpdateTicketField('asignado_a', e.target.value || null)}
                  >
                    <option value="">Sin Asignar</option>
                    {agentes.map(ag => (
                      <option key={ag.id} value={ag.nombre}>{ag.nombre} ({ag.rol === 'admin' ? 'Administrador' : 'Staff'})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 🏷️ Información Adicional de Ticket en Flexbox */}
            {!isExpense && (cliente.pais || cliente.marca || cliente.nombre_empresa || cliente.orden_compra_cliente || cliente.stock || cliente.soft_hard || cliente.factura_cancelada) && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px', textAlign: 'left' }}>🏷️ Información Adicional de Ticket</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', textAlign: 'left' }}>
                  {cliente.pais && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>País</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.pais}</strong>
                    </div>
                  )}
                  {cliente.marca && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marca</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.marca}</strong>
                    </div>
                  )}
                  {cliente.nombre_empresa && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.nombre_empresa}</strong>
                    </div>
                  )}
                  {cliente.orden_compra_cliente !== undefined && cliente.orden_compra_cliente !== null && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client Purchase Order</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.orden_compra_cliente}</strong>
                    </div>
                  )}
                  {cliente.stock && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.stock}</strong>
                    </div>
                  )}
                  {cliente.soft_hard && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soft / Hard</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.soft_hard}</strong>
                    </div>
                  )}
                  {cliente.factura_cancelada && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px', background: 'rgba(67, 97, 238, 0.04)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(67, 97, 238, 0.08)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Factura Cancelada</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{cliente.factura_cancelada}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 📋 Datos de Formulario */}
            {!isExpense && cliente.camposExtra && Object.keys(cliente.camposExtra).length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px', textAlign: 'left' }}>📋 Datos de Formulario</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {Object.entries(cliente.camposExtra).map(([lbl, val], idx) => (
                    <div key={idx} style={{ background: 'rgba(120, 120, 128, 0.04)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginTop: '2px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {typeof val === 'boolean' ? (val ? 'Sí' : 'No') : String(val !== undefined && val !== null ? val : '-')}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 💸 Vista Especializada para REINTEGROS */}
            {isExpense && expenseType === 'reintegro' && camposExtraObj && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <div style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{
                      background: 'var(--purple-brand)',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      💸 Reintegro de Gastos
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Ticket #{cliente.id}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', margin: '15px 0', borderBottom: '1px dashed var(--border-color)', paddingBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Monto a Reintegrar</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--purple-brand)', margin: '6px 0', fontFamily: 'Outfit, sans-serif' }}>
                      {camposExtraObj["Monto"] || camposExtraObj["Monto del Gasto"] || '-'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Quien solicita:</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{camposExtraObj["Quien solicita"] || cliente.nombre}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Autorizante:</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{camposExtraObj["Autorizante"] || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>País:</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{camposExtraObj["Pais"] || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tipo de Expense:</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{camposExtraObj["Tipo de Gasto"] || camposExtraObj["Tipo de Expense"] || '-'}</strong>
                    </div>
                    {(camposExtraObj["Comentarios"] || camposExtraObj["Motivo del Gasto"]) && (
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '3px' }}>Detalles / Comentarios:</span>
                        <div style={{ background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', border: '1px solid var(--border-color)' }}>
                          {camposExtraObj["Comentarios"] || camposExtraObj["Motivo del Gasto"]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ✈️ Vista Especializada para RESERVAS DE VIAJE */}
            {isExpense && expenseType === 'viaje' && camposExtraObj && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, var(--expenses-gradient-end) 0%, var(--purple-brand) 100%)',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ✈️ Reserva de Viajes
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ticket #{cliente.id}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                  {TRAVEL_GROUPS.map((grp, grpIdx) => {
                    const hasData = grp.fields.some(f => camposExtraObj[f] !== undefined && camposExtraObj[f] !== null && camposExtraObj[f] !== '');
                    if (!hasData) return null;

                    return (
                      <div key={grpIdx} style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '12px 16px',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--purple-brand)', fontWeight: '700', fontFamily: 'Outfit, sans-serif', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                          {grp.title}
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                          {grp.fields.map((fldName, fldIdx) => {
                            const val = camposExtraObj[fldName];
                            if (val === undefined || val === null || val === '') return null;
                            return (
                              <div key={fldIdx} style={{ background: 'var(--input-bg)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{fldName}</span>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginTop: '2px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                  {typeof val === 'boolean' ? (val ? 'Sí' : 'No') : String(val)}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sección de adjuntos del ticket principal */}
            {((cliente.archivos && cliente.archivos.length > 0) || cliente.archivo_url) && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px', textAlign: 'left' }}>📎 Archivos Adjuntos</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {cliente.archivos && cliente.archivos.length > 0 ? (
                    cliente.archivos.map((file, idx) => {
                      const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.nombre);
                      return (
                        <a 
                          key={idx} 
                          href={`${API_BASE_URL}${file.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            background: 'var(--input-bg)',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            border: '1px solid var(--border-color)',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{esImagen ? '🖼️' : '📄'}</span>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={file.nombre}>
                            {file.nombre}
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    // Soporte para legacy archivo_url
                    <a 
                      href={`${API_BASE_URL}${cliente.archivo_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        background: 'var(--input-bg)',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        border: '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                    >
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        Ver Archivo Principal
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-timeline">
            <h4>Hilo de Conversación</h4>
            
            <div className="modal-messages-area">
              {notas.length === 0 ? (
                <p style={{ color: '#6e6e73', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>No hay notas en este ticket.</p>
              ) : (
                notas.map((n) => (
                  <div key={n.id} className={n.autor === usuario.nombre ? "modal-message-right" : "modal-message-left"}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>{n.autor}</strong> - {new Date(n.fecha).toLocaleString()}
                    </div>
                    {n.mensaje && <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.mensaje}</div>}
                    
                    {n.archivos && n.archivos.length > 0 && (
                      <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        paddingTop: '8px'
                      }}>
                        {n.archivos.map((file, fileIdx) => {
                          const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.nombre);
                          if (esImagen) {
                            return (
                              <div key={fileIdx} style={{ margin: '4px 0', textAlign: 'left' }}>
                                <a href={`${API_BASE_URL}${file.url}`} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={`${API_BASE_URL}${file.url}`} 
                                    alt={file.nombre} 
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '180px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(0,0,0,0.08)',
                                      objectFit: 'contain',
                                      cursor: 'zoom-in',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                      display: 'block'
                                    }} 
                                  />
                                </a>
                                <div style={{ fontSize: '0.72rem', color: '#8e8e93', marginTop: '2px' }}>📎 {file.nombre}</div>
                              </div>
                            );
                          } else {
                            return (
                              <a 
                                key={fileIdx} 
                                href={`${API_BASE_URL}${file.url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  background: 'rgba(0, 0, 0, 0.03)',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  fontSize: '0.8rem',
                                  width: 'fit-content',
                                  maxWidth: '100%',
                                  border: '1px solid rgba(0,0,0,0.02)',
                                  textAlign: 'left'
                                }}
                              >
                                <span>📄</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.nombre}>
                                  {file.nombre}
                                </span>
                              </a>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="modal-reply-area">
              {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '5px' }}>{error}</div>}
              
              {!isCustomer && (
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>⚡ Respuestas Rápidas:</label>
                  <select onChange={(e) => handleMacroSelect(e.target.value)} className="modal-macro-select" defaultValue="">
                    <option value="" disabled>Seleccionar Macro...</option>
                    {MACROS.map((m, idx) => (
                      <option key={idx} value={m}>Macro #{idx+1}: {m.substring(0,25)}...</option>
                    ))}
                  </select>
                </div>
              )}

              <textarea 
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe una actualización o nota interna..."
                className="modal-textarea"
                rows={3}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px dashed var(--border-color)', width: '100%', boxSizing: 'border-box', marginBottom: '10px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>📎 Adjuntar Archivos a la Nota (Hasta 15 MB c/u):</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setArchivosNota(Array.from(e.target.files))} 
                  style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }} 
                />
                {archivosNota.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <strong>Seleccionados ({archivosNota.length}):</strong>
                    <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                      {archivosNota.map((file, idx) => (
                        <li key={idx}>
                          📎 {file.name} <span style={{ color: '#8e8e93' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button 
                onClick={handleActualizarTicket} 
                disabled={loading || (parseInt(nuevoDepto) === parseInt(cliente.departamento) && !nota.trim() && archivosNota.length === 0)} 
                className="btn-submit"
                style={{ alignSelf: 'flex-end', width: 'auto', padding: '12px 24px' }}
              >
                {loading ? 'Actualizando...' : 'Actualizar Ticket'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
