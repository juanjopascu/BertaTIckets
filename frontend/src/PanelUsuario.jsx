import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketModal from './TicketModal';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function PanelUsuario({ usuario, setUsuario, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [misTickets, setMisTickets] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [viewMode, setViewMode] = useState('list');
  const [configTickets, setConfigTickets] = useState({
    habilitarNuevoTicketProcesos: true,
    habilitarReintegroGastos: true,
    habilitarReservaViajes: true
  });
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalCliente, setModalCliente] = useState(null);

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [departamento, setDepartamento] = useState(4);
  const [archivos, setArchivos] = useState([]);
  const [comentario, setComentario] = useState('');
  
  // Nuevos campos obligatorios
  const [pais, setPais] = useState('');
  const [marca, setMarca] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [ordenCompraCliente, setOrdenCompraCliente] = useState('');
  const [stock, setStock] = useState('No');
  const [softHard, setSoftHard] = useState('');
  const [facturaCancelada, setFacturaCancelada] = useState('No');

  // Pestañas y campos de Expenses / Reintegros / Viajes
  const [ticketCategoria, setTicketCategoria] = useState('soporte'); // 'soporte' | 'expenses'
  const [tipoExpense, setTipoExpense] = useState(''); // '' | 'reintegro' | 'viaje'
  const [reintegroMotivo, setReintegroMotivo] = useState('');
  const [reintegroMonto, setReintegroMonto] = useState('');
  const [reintegroMoneda, setReintegroMoneda] = useState('USD');
  const [reintegroAutorizante, setReintegroAutorizante] = useState('');
  const [reintegroComentarios, setReintegroComentarios] = useState('');
  const [reintegroPais, setReintegroPais] = useState('');
  const [reintegroTipo, setReintegroTipo] = useState('');
  const [openAccordion, setOpenAccordion] = useState('personales');
  const [dropdownFabricaOpen, setDropdownFabricaOpen] = useState(false);

  const [viajeData, setViajeData] = useState({
    quienSolicita: '',
    correoElectronico: '',
    cargo: '',
    autorizante: '',
    nombreCompletoDoc: '',
    fechaNacimiento: '',
    tipoDoc: 'Pasaporte',
    nroDoc: '',
    fechaVencimientoDoc: '',
    fechaEmisionDoc: '',
    nacionalidad: '',
    nroVisa: '',
    codigoArea: '',
    nroTelefono: '',
    tipoViaje: 'Internacional',
    paisOrigen: 'Argentina',
    otroOrigen: '',
    paisDestino: 'Usa',
    otroDestino: '',
    unicamenteMultidestinos: '',
    motivoViaje: '',
    idCampana: '',
    fabricaViaja: [],
    otraFabrica: '',
    canalVisitar: '',
    ciudadOrigenAero: '',
    ciudadDestinoAero: '',
    fechaLlegada: '',
    horarioLlegada: '',
    franjaHorariaLlegada: 'GMT-3',
    fechaSalida: '',
    horarioSalida: '',
    franjaHorariaSalida: 'GMT-3',
    solicitaEquipaje: 'No',
    cantidadEquipaje: '',
    contactoEmergencia: '',
    parentescoEmergencia: '',
    celularEmergencia: '',
    solicitaHotel: 'No',
    checkInHotel: '',
    checkOutHotel: '',
    hotelSugerido: '',
    requerimientosEspeciales: ''
  });

  useEffect(() => {
    if (usuario) {
      setViajeData(prev => ({
        ...prev,
        quienSolicita: usuario.nombre || '',
        correoElectronico: usuario.email || '',
        autorizante: prev.autorizante || ''
      }));
    }
  }, [usuario]);
  
  // Manager-specific states
  const [organizaciones, setOrganizaciones] = useState([]);
  const [clientesOrganizacion, setClientesOrganizacion] = useState([]);
  const [selectedOnBehalfEmail, setSelectedOnBehalfEmail] = useState('');
  const [allOrganizaciones, setAllOrganizaciones] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDepartamentos();
    fetchEstados();
    fetchMisTickets();
    fetchAllOrganizaciones();
    fetchConfigTickets();
    if (usuario.rol === 'manager') {
      fetchManagerOrgs();
    }
  }, []);

  const fetchManagerOrgs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/organizaciones`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const orgs = data.filter(o => o.managers.some(m => m.toLowerCase() === usuario.email.toLowerCase()));
        setOrganizaciones(orgs);
        const emails = Array.from(new Set(orgs.flatMap(o => o.clientes)));
        setClientesOrganizacion(emails);
      }
    } catch (err) {
      console.error("Error al obtener organizaciones:", err);
    }
  };

  const fetchAllOrganizaciones = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/organizaciones`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllOrganizaciones(data);
      }
    } catch (err) {
      console.error("Error al obtener todas las organizaciones:", err);
    }
  };

  const targetEmail = (usuario.rol === 'manager' && selectedOnBehalfEmail) ? selectedOnBehalfEmail : usuario.email;

  useEffect(() => {
    if (!targetEmail) return;
    
    const myOrg = allOrganizaciones.find(o => 
      o.clientes && o.clientes.some(c => c.toLowerCase() === targetEmail.toLowerCase())
    );
    
    if (myOrg && myOrg.departamentoId) {
      setDepartamento(myOrg.departamentoId);
    } else {
      const opsDept = departamentos.find(d => d.nombre.toLowerCase() === 'operaciones');
      if (opsDept) {
        setDepartamento(opsDept.id);
      } else if (departamentos.length > 0) {
        setDepartamento(departamentos[0].id);
      }
    }
  }, [selectedOnBehalfEmail, usuario.email, usuario.rol, allOrganizaciones, departamentos]);

  const fetchConfigTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/config-tickets`);
      const data = await res.json();
      setConfigTickets(data);
      if (!data.habilitarNuevoTicketProcesos && (data.habilitarReintegroGastos || data.habilitarReservaViajes)) {
        setTicketCategoria('expenses');
        if (!data.habilitarReintegroGastos && data.habilitarReservaViajes) {
          setTipoExpense('viaje');
        } else if (data.habilitarReintegroGastos && !data.habilitarReservaViajes) {
          setTipoExpense('reintegro');
        }
      } else if (data.habilitarNuevoTicketProcesos) {
        setTicketCategoria('soporte');
      }
    } catch (err) {
      console.error("Error al obtener la configuración de tickets:", err);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/departamentos`);
      const data = await res.json();
      setDepartamentos(data);
      if (data.length > 0) {
        const opsDept = data.find(d => d.nombre.toLowerCase() === 'operaciones');
        if (opsDept) {
          setDepartamento(opsDept.id);
        } else {
          setDepartamento(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEstados = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/estados`);
      const data = await res.json();
      setEstados(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMisTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mis-tickets?email=${usuario.email}`);
      const data = await res.json();
      setMisTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar límites de tamaño en el lado del cliente (15 MB por archivo)
    const MAX_SIZE = 15 * 1024 * 1024;
    for (let file of archivos) {
      if (file.size > MAX_SIZE) {
        setError(`El archivo "${file.name}" supera el tamaño máximo permitido de 15 MB.`);
        return;
      }
    }

    const emailParaTicket = (usuario.rol === 'manager' && selectedOnBehalfEmail) ? selectedOnBehalfEmail : usuario.email;

    const targetDepto = (() => {
      if (ticketCategoria === 'expenses') {
        if (tipoExpense === 'reintegro') {
          const expDept = departamentos.find(d => d.nombre.toLowerCase() === 'expenses');
          if (expDept) return expDept.id;
          return 5;
        } else if (tipoExpense === 'viaje') {
          const trvDept = departamentos.find(d => d.nombre.toLowerCase() === 'travels');
          if (trvDept) return trvDept.id;
          return 6;
        }
      }
      const opsDept = departamentos.find(d => d.nombre.toLowerCase() === 'operaciones');
      if (opsDept) return opsDept.id;
      return departamento || 4;
    })();

    const formData = new FormData();
    formData.append('creado_por', usuario.nombre || usuario.email);
    
    if (ticketCategoria === 'expenses') {
      if (tipoExpense === 'reintegro') {
        formData.append('nombre', nombre);
        formData.append('empresa', 'Reintegro de Gastos');
        formData.append('departamento', targetDepto);
        formData.append('email', emailParaTicket);
        formData.append('comentario', `Solicitud de reintegro. Tipo: ${reintegroTipo}, Monto: ${reintegroMonto}, País: ${reintegroPais}, Autorizante: ${reintegroAutorizante}`);
        
        const camposExtra = {
          isExpense: true,
          expenseType: 'reintegro',
          "Quien solicita": usuario.nombre,
          "Autorizante": reintegroAutorizante,
          "Pais": reintegroPais,
          "Tipo de Gasto": reintegroTipo,
          "Monto": reintegroMonto
        };
        formData.append('camposExtra', JSON.stringify(camposExtra));
      } else if (tipoExpense === 'viaje') {
        formData.append('nombre', nombre);
        formData.append('empresa', 'Reserva de Viajes');
        formData.append('departamento', targetDepto);
        formData.append('email', emailParaTicket);
        formData.append('comentario', `Solicitud de reserva de viaje para ${viajeData.quienSolicita}. Destino: ${viajeData.paisDestino}. Motivo: ${viajeData.motivoViaje}`);

        const camposExtra = {
          isExpense: true,
          expenseType: 'viaje',
          "Quien solicita": viajeData.quienSolicita,
          "Correo Electronico": viajeData.correoElectronico,
          "Cargo": viajeData.cargo,
          "Autorizante": viajeData.autorizante,
          "Nombre completo como figura en el documento de viaje": viajeData.nombreCompletoDoc,
          "Fecha de nacimiento": viajeData.fechaNacimiento,
          "Tipo de documento de viaje": viajeData.tipoDoc,
          "Numero de Documento de viaje": viajeData.nroDoc,
          "Fecha de vencimiento del Documento de viaje": viajeData.fechaVencimientoDoc,
          "Fecha de Emision Del Documento de viaje": viajeData.fechaEmisionDoc,
          "Nacionalidad": viajeData.nacionalidad,
          "Numero de Visa": viajeData.nroVisa,
          "Codigo De Area": viajeData.codigoArea,
          "Numero de telefono": viajeData.nroTelefono,
          "Tipo de Viaje": viajeData.tipoViaje,
          "Pais de Origen// Departure Country": viajeData.paisOrigen,
          "Otro": viajeData.otroOrigen,
          "Pais de Destino // Country Destination": viajeData.paisDestino,
          "Otro Destino": viajeData.otroDestino,
          "Unicamente Multidestinos": viajeData.unicamenteMultidestinos,
          "Motivo Del Viaje": viajeData.motivoViaje,
          "Id De La Campaña": viajeData.idCampana,
          "Fabrica Por la que viaja": viajeData.fabricaViaja.join(', '),
          "otra Fabrica": viajeData.otraFabrica,
          "Nombre del Canal que va a visitar": viajeData.canalVisitar,
          "Ciudad de Origen Y Aeropuerto": viajeData.ciudadOrigenAero,
          "Cuidad de Destino Y Aeropuerto": viajeData.ciudadDestinoAero,
          "Fecha de llegada a Destino": viajeData.fechaLlegada,
          "Horario de llegada a Destino": viajeData.horarioLlegada,
          "Franja Horaria": viajeData.franjaHorariaLlegada,
          "Fecha que debe irse del Destino": viajeData.fechaSalida,
          "Horario que debe irse del destino": viajeData.horarioSalida,
          "Franja Horaria Salida": viajeData.franjaHorariaSalida,
          "Contacto": viajeData.contactoEmergencia,
          "Parentesco": viajeData.parentescoEmergencia,
          "Numero de celular": viajeData.celularEmergencia,
          "¿Solicita Hotel?": viajeData.solicitaHotel,
          "Check IN": viajeData.checkInHotel,
          "Check Out": viajeData.checkOutHotel,
          "Hotel sugerido o área de locación del mismo.": viajeData.hotelSugerido,
          "REQUERIMIENTOS ESPECIALES": viajeData.requerimientosEspeciales,
          "Solicita equipaje en Bodega": viajeData.solicitaEquipaje,
          "Cantidad de Equipaje en Bodega": viajeData.cantidadEquipaje
        };
        formData.append('camposExtra', JSON.stringify(camposExtra));
      } else {
        setError("Por favor seleccione un tipo de Expense (Reintegro o Reserva de Viaje).");
        return;
      }
    } else {
      formData.append('nombre', nombre);
      formData.append('empresa', empresa);
      formData.append('departamento', targetDepto);
      formData.append('email', emailParaTicket);
      formData.append('pais', pais);
      formData.append('marca', marca);
      formData.append('nombre_empresa', nombreEmpresa);
      formData.append('orden_compra_cliente', ordenCompraCliente);
      formData.append('stock', stock);
      formData.append('soft_hard', softHard);
      formData.append('factura_cancelada', facturaCancelada);
      formData.append('comentario', comentario);
    }

    if (archivos.length > 0) {
      archivos.forEach(file => {
        formData.append('documentos', file);
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al enviar el ticket');

      setSuccess('¡Ticket enviado correctamente!');
      setNombre('');
      setEmpresa('');
      setArchivos([]);
      setComentario('');
      setSelectedOnBehalfEmail('');
      
      // Limpiar campos tradicionales
      setPais('');
      setMarca('');
      setNombreEmpresa('');
      setOrdenCompraCliente('');
      setStock('No');
      setSoftHard('');
      setFacturaCancelada('No');

      // Limpiar Expenses
      setTicketCategoria('soporte');
      setTipoExpense('');
      setReintegroMotivo('');
      setReintegroMonto('');
      setReintegroMoneda('USD');
      setReintegroAutorizante('');
      setReintegroComentarios('');
      setReintegroPais('');
      setReintegroTipo('');
      setViajeData({
        quienSolicita: usuario.nombre || '',
        correoElectronico: usuario.email || '',
        cargo: '',
        autorizante: '',
        nombreCompletoDoc: '',
        fechaNacimiento: '',
        tipoDoc: 'Pasaporte',
        nroDoc: '',
        fechaVencimientoDoc: '',
        fechaEmisionDoc: '',
        nacionalidad: '',
        nroVisa: '',
        codigoArea: '',
        nroTelefono: '',
        tipoViaje: 'Internacional',
        paisOrigen: 'Argentina',
        otroOrigen: '',
        paisDestino: 'Usa',
        otroDestino: '',
        unicamenteMultidestinos: '',
        motivoViaje: '',
        idCampana: '',
        fabricaViaja: [],
        otraFabrica: '',
        canalVisitar: '',
        ciudadOrigenAero: '',
        ciudadDestinoAero: '',
        fechaLlegada: '',
        horarioLlegada: '',
        franjaHorariaLlegada: 'GMT-3',
        fechaSalida: '',
        horarioSalida: '',
        franjaHorariaSalida: 'GMT-3',
        solicitaEquipaje: 'No',
        cantidadEquipaje: '',
        contactoEmergencia: '',
        parentescoEmergencia: '',
        celularEmergencia: '',
        solicitaHotel: 'No',
        checkInHotel: '',
        checkOutHotel: '',
        hotelSugerido: '',
        requerimientosEspeciales: ''
      });
      
      setMostrarFormulario(false);
      fetchMisTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTicketUpdated = (id, clienteActualizado) => {
    setMisTickets(prev => prev.map(c => c.id === id ? clienteActualizado : c));
    if (modalCliente && modalCliente.id === id) {
      setModalCliente(clienteActualizado);
    }
  };

  const handleLogout = async () => {
    if (usuario && usuario.sesionId) {
      try {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sesionId: usuario.sesionId })
        });
      } catch (err) {
        console.error("Error logging out from server:", err);
      }
    }
    setUsuario(null);
    navigate('/login');
  };

  const ticketsFiltradosFinal = misTickets.filter(t => {
    // 1. Buscador por texto
    const q = busqueda.toLowerCase().trim();
    const matchesSearch = !q || (
      t.id.toString().includes(q) ||
      t.nombre.toLowerCase().includes(q) ||
      (t.empresa && t.empresa.toLowerCase().includes(q)) ||
      t.estado_embudo.toLowerCase().includes(q) ||
      (t.prioridad && t.prioridad.toLowerCase().includes(q))
    );

    // 2. Filtro Prioridad
    const matchesPriority = filtroPrioridad === 'Todas' || (t.prioridad || 'Normal') === filtroPrioridad;

    // 3. Filtro Estado
    const matchesState = filtroEstado === 'Todos' || t.estado_embudo === filtroEstado;

    return matchesSearch && matchesPriority && matchesState;
  });

  return (
    <div className="crm-container">
      <header className="crm-header grid-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '1.4rem',
                letterSpacing: '-0.02em',
                padding: '8px 16px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(15, 164, 222, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>DACAS</span>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Portal de Clientes <span style={{ color: '#0fa4de' }}>&</span> Soporte
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Seguimiento de tickets técnicos, solicitudes y garantías
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'var(--pill-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <span>🇦🇷</span>
                <span>DACAS Argentina</span>
              </div>

              <div className="user-controls">
                <span style={{ color: 'var(--text-muted)' }}>Hola, <strong style={{ color: 'var(--text-main)' }}>{usuario.nombre}</strong></span>
                <button className="nav-btn" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                  {mostrarFormulario ? 'Ver Mis Tickets' : '➕ Nuevo Ticket'}
                </button>
                <button 
                  type="button" 
                  onClick={toggleTheme} 
                  className="theme-toggle-btn"
                  title="Cambiar Tema"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="crm-main">
        {usuario.rol === 'manager' && organizaciones.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(107, 33, 168, 0.05) 0%, rgba(67, 97, 238, 0.05) 100%)',
            border: '1px solid rgba(107, 33, 168, 0.15)',
            padding: '16px 20px',
            borderRadius: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h4 style={{ margin: 0, color: 'var(--purple-brand)', fontSize: '1.05rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>
                🏢 Panel de Control de Manager
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#515154' }}>
                Organización: <strong>{organizaciones.map(o => o.nombre).join(', ')}</strong> | Supervisando: <strong>{clientesOrganizacion.length}</strong> clientes.
              </p>
            </div>
            <span style={{
              background: 'var(--purple-brand)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Modo Manager
            </span>
          </div>
        )}

        {mostrarFormulario ? (
          <div className="form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Crear un nuevo Ticket</h3>
            {error && <div className="error-alert">{error}</div>}
            
            {(!configTickets.habilitarNuevoTicketProcesos && !configTickets.habilitarReintegroGastos && !configTickets.habilitarReservaViajes) ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(239, 68, 68, 0.04)', border: '1px dashed rgba(239, 68, 68, 0.2)', borderRadius: '24px', margin: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#ef4444' }}>Creación de Tickets Deshabilitada</h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#6e6e73', lineHeight: '1.5' }}>
                  El administrador ha deshabilitado temporalmente la creación de nuevos tickets de todo tipo. Por favor, ponte en contacto con soporte si consideras que esto es un error.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              {usuario.rol === 'manager' && (
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Reportar en nombre del Cliente *</label>
                  <select 
                    className="status-select" 
                    value={selectedOnBehalfEmail} 
                    onChange={(e) => setSelectedOnBehalfEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px' }}
                    required
                  >
                    <option value="">-- Seleccionar Cliente de mi Organización --</option>
                    <option value={usuario.email}>A mi propio nombre ({usuario.nombre})</option>
                    {clientesOrganizacion.map(email => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#8e8e93' }}>
                    Registra esta incidencia bajo la cuenta de cualquiera de tus clientes vinculados.
                  </p>
                </div>
              )}

              {/* Pestañas de Tipo de Ticket (Soporte vs Expenses) */}
              {configTickets.habilitarNuevoTicketProcesos && (configTickets.habilitarReintegroGastos || configTickets.habilitarReservaViajes) && (
                <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTicketCategoria('soporte')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: ticketCategoria === 'soporte' ? 'linear-gradient(135deg, var(--primary) 0%, #0d655e 100%)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)'),
                      color: ticketCategoria === 'soporte' ? 'white' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#1c1c1e'),
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    Nuevo Ticket Procesos
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketCategoria('expenses')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: ticketCategoria === 'expenses' ? 'linear-gradient(135deg, var(--purple-brand) 0%, var(--expenses-gradient-end) 100%)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)'),
                      color: ticketCategoria === 'expenses' ? 'white' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#1c1c1e'),
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    💸 Expenses
                  </button>
                </div>
              )}

              {ticketCategoria === 'soporte' ? (
                <>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Empresa</label>
                    <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
                  </div>


                  {/* Nuevos campos obligatorios (Flexbox responsivo) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px', background: 'var(--primary-light)', padding: '15px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>País *</label>
                      <select 
                        className="status-select" 
                        value={pais} 
                        onChange={(e) => setPais(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required
                      >
                        <option value="">Seleccione país...</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Bolivia">Bolivia</option>
                        <option value="Paraguay">Paraguay</option>
                        <option value="Uruguay">Uruguay</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Peru">Peru</option>
                        <option value="Usa">Usa</option>
                        <option value="Republica Dominicana">Republica Dominicana</option>
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Mexico">Mexico</option>
                      </select>
                    </div>
                    
                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Marca *</label>
                      <select 
                        className="status-select" 
                        value={marca} 
                        onChange={(e) => setMarca(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required
                      >
                        <option value="">Seleccione marca...</option>
                        <option value="A10">A10</option>
                        <option value="ALCATEL LUCENT">ALCATEL LUCENT</option>
                        <option value="ALLIED TELESIS">ALLIED TELESIS</option>
                        <option value="ALLOT">ALLOT</option>
                        <option value="APC">APC</option>
                        <option value="ARUBA">ARUBA</option>
                        <option value="AUDIOCODES">AUDIOCODES</option>
                        <option value="AVAYA">AVAYA</option>
                        <option value="AVOCENT - VERTIV">AVOCENT - VERTIV</option>
                        <option value="BARRACUDA NETWORKS">BARRACUDA NETWORKS</option>
                        <option value="BOSCH">BOSCH</option>
                        <option value="CDVI">CDVI</option>
                        <option value="COMMSCOPE - AMP NETCONNECT">COMMSCOPE - AMP NETCONNECT</option>
                        <option value="COMMSCOPE - SYSTIMAX">COMMSCOPE - SYSTIMAX</option>
                        <option value="DIGIFORT">DIGIFORT</option>
                        <option value="EATON">EATON</option>
                        <option value="EXTREME NETWORKS">EXTREME NETWORKS</option>
                        <option value="F5">F5</option>
                        <option value="FIREEYE">FIREEYE</option>
                        <option value="FLIR">FLIR</option>
                        <option value="FORTINET">FORTINET</option>
                        <option value="FYSER">FYSER</option>
                        <option value="GABITEL">GABITEL</option>
                        <option value="GUARDICORE BY AKAMI">GUARDICORE BY AKAMI</option>
                        <option value="HITACHI VANTARA">HITACHI VANTARA</option>
                        <option value="IMPERVA">IMPERVA</option>
                        <option value="INFOBLOX">INFOBLOX</option>
                        <option value="MILESTONE">MILESTONE</option>
                        <option value="NS FOCUS">NS FOCUS</option>
                        <option value="NVT PHYBRIDGE">NVT PHYBRIDGE</option>
                        <option value="PANDUIT">PANDUIT</option>
                        <option value="RADWARE">RADWARE</option>
                        <option value="RUCKUS">RUCKUS</option>
                        <option value="SCHNEIDER ELECTRIC">SCHNEIDER ELECTRIC</option>
                        <option value="SIEMON">SIEMON</option>
                        <option value="SOPHOS">SOPHOS</option>
                        <option value="VERACODE">VERACODE</option>
                        <option value="VERTIV">VERTIV</option>
                        <option value="VICARIUS">VICARIUS</option>
                        <option value="VIEWTINET">VIEWTINET</option>
                        <option value="OPTONE">OPTONE</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Company Name *</label>
                      <input 
                        type="text" 
                        value={nombreEmpresa} 
                        onChange={(e) => setNombreEmpresa(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Client purchase order *</label>
                      <input 
                        type="number" 
                        value={ordenCompraCliente} 
                        onChange={(e) => setOrdenCompraCliente(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Stock *</label>
                      <select 
                        className="status-select" 
                        value={stock} 
                        onChange={(e) => setStock(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Soft y Hard *</label>
                      <select 
                        className="status-select" 
                        value={softHard} 
                        onChange={(e) => setSoftHard(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required
                      >
                        <option value="">Seleccione Soft / Hard...</option>
                        <option value="Soft">Soft</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px', minWidth: '180px', marginBottom: 0 }}>
                      <label style={{ fontWeight: '600' }}>Factura Cancelada *</label>
                      <select 
                        className="status-select" 
                        value={facturaCancelada} 
                        onChange={(e) => setFacturaCancelada(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                        required
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Comentarios *</label>
                    <textarea 
                      value={comentario} 
                      onChange={(e) => setComentario(e.target.value)} 
                      required 
                      placeholder="Escribe tus comentarios aquí..."
                      rows={4}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '14px', 
                        border: '1.5px solid var(--border-color)', 
                        background: 'var(--input-bg)',
                        color: 'var(--text-main)',
                        outline: 'none', 
                        resize: 'vertical',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Selector de Reintegro vs Viaje */}
                  {configTickets.habilitarReintegroGastos && configTickets.habilitarReservaViajes && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontWeight: '700', display: 'block', marginBottom: '10px', fontSize: '0.95rem' }}>Tipo de Solicitud de Gasto *</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setTipoExpense('reintegro')}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            border: tipoExpense === 'reintegro' ? '2px solid var(--purple-brand)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0,0,0,0.08)'),
                            background: tipoExpense === 'reintegro' ? (theme === 'dark' ? 'rgba(107, 33, 168, 0.15)' : 'rgba(107, 33, 168, 0.06)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'),
                            color: tipoExpense === 'reintegro' ? 'var(--purple-brand)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'var(--purple-brand)'),
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>💵</span>
                          Crear un Reintegro
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoExpense('viaje')}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            border: tipoExpense === 'viaje' ? '2px solid var(--purple-brand)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0,0,0,0.08)'),
                            background: tipoExpense === 'viaje' ? (theme === 'dark' ? 'rgba(107, 33, 168, 0.15)' : 'rgba(107, 33, 168, 0.06)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'),
                            color: tipoExpense === 'viaje' ? 'var(--purple-brand)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'var(--purple-brand)'),
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>✈️</span>
                          Reservar Viajes
                        </button>
                      </div>
                    </div>
                  )}

                  {tipoExpense === 'reintegro' && (
                    <div style={{ background: 'rgba(107, 33, 168, 0.02)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(107, 33, 168, 0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif' }}>💵 Formulario de Reintegro de Gastos</h4>
                      
                      <div className="form-group">
                        <label>Asunto *</label>
                        <input 
                          type="text" 
                          value={nombre} 
                          onChange={(e) => setNombre(e.target.value)} 
                          required 
                          placeholder="Ej: EXPENSES - MM/AA - Nombre completo" 
                        />
                      </div>

                      <div style={{
                        marginTop: '-5px',
                        marginBottom: '10px',
                        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '0.85rem',
                        color: theme === 'dark' ? '#f8fafc' : '#475569',
                        lineHeight: '1.4'
                      }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💡</span> Aclaración sobre el Asunto:
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                          Por favor completar el asunto siguiendo este formato:
                          <div style={{ marginTop: '4px' }}>• <strong>Para TRAVELS</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '2px 4px', borderRadius: '4px' }}>TRAVELS - Pais - Nombre completo - Motivo del viaje</code></div>
                          <div style={{ marginTop: '2px' }}>• <strong>Para EXPENSES</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '2px 4px', borderRadius: '4px' }}>EXPENSES - MM/AA - Nombre completo</code></div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Autorizante *</label>
                        <input 
                          type="text" 
                          value={reintegroAutorizante} 
                          onChange={(e) => setReintegroAutorizante(e.target.value)} 
                          required 
                          placeholder="Nombre del autorizante" 
                        />
                      </div>

                      <div className="form-group">
                        <label>País *</label>
                        <select 
                          className="status-select" 
                          value={reintegroPais} 
                          onChange={(e) => setReintegroPais(e.target.value)} 
                          style={{ width: '100%', padding: '10px' }} 
                          required
                        >
                          <option value="">Seleccione país...</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Chile">Chile</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Bolivia">Bolivia</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="Uruguay">Uruguay</option>
                          <option value="Ecuador">Ecuador</option>
                          <option value="Peru">Peru</option>
                          <option value="Usa">Usa</option>
                          <option value="Republica Dominicana">Republica Dominicana</option>
                          <option value="Costa Rica">Costa Rica</option>
                          <option value="Mexico">Mexico</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Tipo de Expense *</label>
                        <select 
                          className="status-select" 
                          value={reintegroTipo} 
                          onChange={(e) => setReintegroTipo(e.target.value)} 
                          style={{ width: '100%', padding: '10px' }} 
                          required
                        >
                          <option value="">Seleccione tipo de gasto...</option>
                          <option value="Comidas / Almuerzos">Comidas / Almuerzos</option>
                          <option value="Hoteles / Alojamiento">Hoteles / Alojamiento</option>
                          <option value="Viajes / Aéreos">Viajes / Aéreos</option>
                          <option value="Transporte / Taxis">Transporte / Taxis</option>
                          <option value="Suscripciones / Licencias">Suscripciones / Licencias</option>
                          <option value="Otros Gastos">Otros Gastos</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Monto *</label>
                        <input 
                          type="text" 
                          value={reintegroMonto} 
                          onChange={(e) => setReintegroMonto(e.target.value)} 
                          required 
                          placeholder="Monto (ej: 150 USD)" 
                        />
                      </div>
                    </div>
                  )}

                  {tipoExpense === 'viaje' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif' }}>✈️ Solicitud de Reserva de Viajes</h4>
                      
                      <div className="form-group">
                        <label>Asunto *</label>
                        <input 
                          type="text" 
                          value={nombre} 
                          onChange={(e) => setNombre(e.target.value)} 
                          required 
                          placeholder="Ej: TRAVELS - Pais - Nombre completo - Motivo del viaje" 
                        />
                      </div>

                      <div style={{
                        marginTop: '-5px',
                        marginBottom: '10px',
                        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '0.85rem',
                        color: theme === 'dark' ? '#f8fafc' : '#475569',
                        lineHeight: '1.4'
                      }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💡</span> Aclaración sobre el Asunto:
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                          Por favor completar el asunto siguiendo este formato:
                          <div style={{ marginTop: '4px' }}>• <strong>Para TRAVELS</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '2px 4px', borderRadius: '4px' }}>TRAVELS - Pais - Nombre completo - Motivo del viaje</code></div>
                          <div style={{ marginTop: '2px' }}>• <strong>Para EXPENSES</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '2px 4px', borderRadius: '4px' }}>EXPENSES - MM/AA - Nombre completo</code></div>
                        </div>
                      </div>

                      <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#8e8e93' }}>
                        Por favor, complete todos los campos requeridos agrupados en las siguientes secciones.
                      </p>

                      {/* ESTILOS DE ACORDEÓN */}
                      <style>{`
                        .acc-header {
                          background: white;
                          border: 1px solid rgba(107, 33, 168, 0.15);
                          border-radius: 12px;
                          padding: 14px 18px;
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          cursor: pointer;
                          font-weight: 700;
                          color: var(--purple-brand);
                          font-family: 'Outfit', sans-serif;
                          transition: all 0.2s ease;
                          user-select: none;
                        }
                        .acc-header:hover {
                          background: rgba(107, 33, 168, 0.02);
                          border-color: var(--purple-brand);
                        }
                        .acc-content {
                          background: rgba(107, 33, 168, 0.01);
                          border: 1px solid rgba(107, 33, 168, 0.08);
                          border-top: none;
                          border-radius: 0 0 12px 12px;
                          padding: 20px;
                          margin-top: -6px;
                          margin-bottom: 10px;
                          display: flex;
                          flex-direction: column;
                          gap: 15px;
                          animation: slideDown 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                        }
                        .grid-2col {
                          display: grid;
                          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                          gap: 15px;
                        }
                      `}</style>

                      {/* 1. Datos Personales */}
                      <div>
                        <div className="acc-header" onClick={() => setOpenAccordion(openAccordion === 'personales' ? '' : 'personales')}>
                          <span>👤 1. Datos Personales</span>
                          <span>{openAccordion === 'personales' ? '▲' : '▼'}</span>
                        </div>
                        {openAccordion === 'personales' && (
                          <div className="acc-content">
                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Quien solicita *</label>
                                <input type="text" value={viajeData.quienSolicita} onChange={(e) => setViajeData({...viajeData, quienSolicita: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Correo Electrónico *</label>
                                <input type="email" value={viajeData.correoElectronico} onChange={(e) => setViajeData({...viajeData, correoElectronico: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Cargo *</label>
                                <input type="text" value={viajeData.cargo} onChange={(e) => setViajeData({...viajeData, cargo: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Autorizante de Viaje *</label>
                                <input type="text" value={viajeData.autorizante} onChange={(e) => setViajeData({...viajeData, autorizante: e.target.value})} required />
                              </div>
                            </div>
                            
                            <div className="form-group">
                              <label>Nombre completo como figura en el documento de viaje *</label>
                              <input type="text" value={viajeData.nombreCompletoDoc} onChange={(e) => setViajeData({...viajeData, nombreCompletoDoc: e.target.value})} required />
                            </div>

                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fecha de nacimiento *</label>
                                <input type="date" value={viajeData.fechaNacimiento} onChange={(e) => setViajeData({...viajeData, fechaNacimiento: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Tipo de documento de viaje *</label>
                                <select className="status-select" value={viajeData.tipoDoc} onChange={(e) => setViajeData({...viajeData, tipoDoc: e.target.value})} style={{ width: '100%', padding: '10px' }} required>
                                  <option value="Pasaporte">Pasaporte</option>
                                  <option value="DNI / Cédula">DNI / Cédula</option>
                                  <option value="Otro">Otro</option>
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Número de Documento *</label>
                                <input type="text" value={viajeData.nroDoc} onChange={(e) => setViajeData({...viajeData, nroDoc: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fecha vencimiento Doc *</label>
                                <input type="date" value={viajeData.fechaVencimientoDoc} onChange={(e) => setViajeData({...viajeData, fechaVencimientoDoc: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fecha Emisión Doc *</label>
                                <input type="date" value={viajeData.fechaEmisionDoc} onChange={(e) => setViajeData({...viajeData, fechaEmisionDoc: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Nacionalidad *</label>
                                <input type="text" value={viajeData.nacionalidad} onChange={(e) => setViajeData({...viajeData, nacionalidad: e.target.value})} required />
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Número de Visa (Si aplica)</label>
                              <input type="text" value={viajeData.nroVisa} onChange={(e) => setViajeData({...viajeData, nroVisa: e.target.value})} placeholder="Opcional" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Teléfono Completo */}
                      <div>
                        <div className="acc-header" onClick={() => setOpenAccordion(openAccordion === 'telefono' ? '' : 'telefono')}>
                          <span>📞 2. Teléfono Completo</span>
                          <span>{openAccordion === 'telefono' ? '▲' : '▼'}</span>
                        </div>
                        {openAccordion === 'telefono' && (
                          <div className="acc-content">
                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Código de Área *</label>
                                <input type="text" value={viajeData.codigoArea} onChange={(e) => setViajeData({...viajeData, codigoArea: e.target.value})} placeholder="Ej: +54" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Número de Teléfono *</label>
                                <input type="text" value={viajeData.nroTelefono} onChange={(e) => setViajeData({...viajeData, nroTelefono: e.target.value})} placeholder="Ej: 911555555" required />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Datos del Viaje */}
                      <div>
                        <div className="acc-header" onClick={() => setOpenAccordion(openAccordion === 'viaje' ? '' : 'viaje')}>
                          <span>✈️ 3. Datos del Viaje</span>
                          <span>{openAccordion === 'viaje' ? '▲' : '▼'}</span>
                        </div>
                        {openAccordion === 'viaje' && (
                          <div className="acc-content">
                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Tipo de Viaje *</label>
                                <select className="status-select" value={viajeData.tipoViaje} onChange={(e) => setViajeData({...viajeData, tipoViaje: e.target.value})} style={{ width: '100%', padding: '10px' }} required>
                                  <option value="Internacional">Internacional</option>
                                  <option value="Nacional">Nacional</option>
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>País de Origen *</label>
                                <input type="text" value={viajeData.paisOrigen} onChange={(e) => setViajeData({...viajeData, paisOrigen: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Otro Origen (Si aplica)</label>
                                <input type="text" value={viajeData.otroOrigen} onChange={(e) => setViajeData({...viajeData, otroOrigen: e.target.value})} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>País de Destino *</label>
                                <input type="text" value={viajeData.paisDestino} onChange={(e) => setViajeData({...viajeData, paisDestino: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Otro Destino (Si aplica)</label>
                                <input type="text" value={viajeData.otroDestino} onChange={(e) => setViajeData({...viajeData, otroDestino: e.target.value})} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Multidestinos (Si aplica)</label>
                                <input type="text" value={viajeData.unicamenteMultidestinos} onChange={(e) => setViajeData({...viajeData, unicamenteMultidestinos: e.target.value})} placeholder="Detalle los tramos extra" />
                              </div>
                            </div>

                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Motivo del Viaje *</label>
                                <input type="text" value={viajeData.motivoViaje} onChange={(e) => setViajeData({...viajeData, motivoViaje: e.target.value})} placeholder="Ej: Evento Partner" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>ID de la Campaña (Si aplica)</label>
                                <input type="text" value={viajeData.idCampana} onChange={(e) => setViajeData({...viajeData, idCampana: e.target.value})} />
                              </div>
                            </div>

                            <div className="form-group" style={{ position: 'relative' }}>
                              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Fábrica por la que viaja *</label>
                              
                              <div 
                                onClick={() => setDropdownFabricaOpen(!dropdownFabricaOpen)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  minHeight: '42px',
                                  background: 'white',
                                  padding: '8px 12px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--purple-brand)'}
                                onMouseLeave={(e) => {
                                  if (!dropdownFabricaOpen) e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                              >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                                  {viajeData.fabricaViaja.length === 0 ? (
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Seleccionar fábrica(s)...</span>
                                  ) : (
                                    viajeData.fabricaViaja.map(brand => (
                                      <span 
                                        key={brand}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const next = viajeData.fabricaViaja.filter(b => b !== brand);
                                          setViajeData({ ...viajeData, fabricaViaja: next });
                                        }}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          background: theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(107, 33, 168, 0.1)',
                                          color: 'var(--purple-brand)',
                                          fontSize: '0.78rem',
                                          fontWeight: '600',
                                          padding: '3px 8px',
                                          borderRadius: '20px',
                                          border: theme === 'dark' ? '1px solid rgba(192, 132, 252, 0.3)' : '1px solid rgba(107, 33, 168, 0.15)',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'var(--purple-brand)';
                                          e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(107, 33, 168, 0.1)';
                                          e.currentTarget.style.color = 'var(--purple-brand)';
                                        }}
                                        title="Click para quitar"
                                      >
                                        {brand} <span style={{ fontSize: '11px', fontWeight: 'bold' }}>×</span>
                                      </span>
                                    ))
                                  )}
                                </div>
                                <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '6px', userSelect: 'none' }}>
                                  {dropdownFabricaOpen ? '▲' : '▼'}
                                </span>
                              </div>

                              {dropdownFabricaOpen && (
                                <>
                                  <div 
                                    onClick={() => setDropdownFabricaOpen(false)}
                                    style={{
                                      position: 'fixed',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 998,
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '6px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    zIndex: 999,
                                    maxHeight: '260px',
                                    overflowY: 'auto',
                                    padding: '6px 0',
                                  }}>
                                    {[
                                      'FORTINET', 'AVAYA', 'COMMSCOPE', 'EXTREME', 'ARUBA', 
                                      'PANDUIT', 'RADWARE', 'SOPHOS', 'A10', 'VERACODE', 
                                      'VERTIV', 'RUCKUS', 'BOSCH', 'IMPERVA', 'Dacas', 'OTRO'
                                    ].map(brand => {
                                      const isSelected = viajeData.fabricaViaja.includes(brand);
                                      return (
                                        <div
                                          key={brand}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const next = isSelected 
                                              ? viajeData.fabricaViaja.filter(b => b !== brand) 
                                              : [...viajeData.fabricaViaja, brand];
                                            setViajeData({ ...viajeData, fabricaViaja: next });
                                          }}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 16px',
                                            background: isSelected ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(107, 33, 168, 0.05)') : 'transparent',
                                            color: isSelected ? 'var(--purple-brand)' : 'var(--text-main)',
                                            fontWeight: isSelected ? '600' : 'normal',
                                            transition: 'all 0.15s ease',
                                            cursor: 'pointer',
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isSelected ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.18)' : 'rgba(107, 33, 168, 0.08)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)');
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isSelected ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(107, 33, 168, 0.05)') : 'transparent';
                                          }}
                                        >
                                          <span>{brand}</span>
                                          {isSelected ? (
                                            <span style={{ color: 'var(--purple-brand)', fontWeight: 'bold' }}>✓</span>
                                          ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>+ Agregar</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Otra Fábrica (Especificar)</label>
                                <input type="text" value={viajeData.otraFabrica} onChange={(e) => setViajeData({...viajeData, otraFabrica: e.target.value})} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Nombre del Canal a visitar</label>
                                <input type="text" value={viajeData.canalVisitar} onChange={(e) => setViajeData({...viajeData, canalVisitar: e.target.value})} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Ciudad de Origen Y Aeropuerto *</label>
                                <input type="text" value={viajeData.ciudadOrigenAero} onChange={(e) => setViajeData({...viajeData, ciudadOrigenAero: e.target.value})} placeholder="Ej: Buenos Aires (EZE)" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Ciudad de Destino Y Aeropuerto *</label>
                                <input type="text" value={viajeData.ciudadDestinoAero} onChange={(e) => setViajeData({...viajeData, ciudadDestinoAero: e.target.value})} placeholder="Ej: Miami (MIA)" required />
                              </div>
                            </div>

                            <div className="grid-2col" style={{ background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', marginTop: '8px' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fecha de llegada a Destino *</label>
                                <input type="date" value={viajeData.fechaLlegada} onChange={(e) => setViajeData({...viajeData, fechaLlegada: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Horario sugerido de llegada</label>
                                <input type="text" value={viajeData.horarioLlegada} onChange={(e) => setViajeData({...viajeData, horarioLlegada: e.target.value})} placeholder="Ej: Por la mañana" />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Franja Horaria llegada</label>
                                <select className="status-select" value={viajeData.franjaHorariaLlegada} onChange={(e) => setViajeData({...viajeData, franjaHorariaLlegada: e.target.value})} style={{ width: '100%', padding: '10px' }}>
                                  <option value="GMT-3">GMT-3</option>
                                  <option value="GMT-4">GMT-4</option>
                                  <option value="GMT-5">GMT-5</option>
                                  <option value="GMT+1">GMT+1</option>
                                  <option value="Otro">Otro</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid-2col" style={{ background: 'white', padding: '15px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fecha de salida de Destino *</label>
                                <input type="date" value={viajeData.fechaSalida} onChange={(e) => setViajeData({...viajeData, fechaSalida: e.target.value})} required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Horario sugerido de salida</label>
                                <input type="text" value={viajeData.horarioSalida} onChange={(e) => setViajeData({...viajeData, horarioSalida: e.target.value})} placeholder="Ej: Por la tarde" />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Franja Horaria salida</label>
                                <select className="status-select" value={viajeData.franjaHorariaSalida} onChange={(e) => setViajeData({...viajeData, franjaHorariaSalida: e.target.value})} style={{ width: '100%', padding: '10px' }}>
                                  <option value="GMT-3">GMT-3</option>
                                  <option value="GMT-4">GMT-4</option>
                                  <option value="GMT-5">GMT-5</option>
                                  <option value="GMT+1">GMT+1</option>
                                  <option value="Otro">Otro</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Solicita equipaje en Bodega *</label>
                                <select className="status-select" value={viajeData.solicitaEquipaje} onChange={(e) => setViajeData({...viajeData, solicitaEquipaje: e.target.value})} style={{ width: '100%', padding: '10px' }} required>
                                  <option value="No">No</option>
                                  <option value="Sí">Sí</option>
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Cantidad de Equipaje</label>
                                <input type="text" value={viajeData.cantidadEquipaje} onChange={(e) => setViajeData({...viajeData, cantidadEquipaje: e.target.value})} placeholder="Ej: 1 valija de 23kg" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. Datos de Emergencia */}
                      <div>
                        <div className="acc-header" onClick={() => setOpenAccordion(openAccordion === 'emergencia' ? '' : 'emergencia')}>
                          <span>🚨 4. Datos de Emergencia</span>
                          <span>{openAccordion === 'emergencia' ? '▲' : '▼'}</span>
                        </div>
                        {openAccordion === 'emergencia' && (
                          <div className="acc-content">
                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Contacto de Emergencia *</label>
                                <input type="text" value={viajeData.contactoEmergencia} onChange={(e) => setViajeData({...viajeData, contactoEmergencia: e.target.value})} placeholder="Nombre completo" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Parentesco *</label>
                                <input type="text" value={viajeData.parentescoEmergencia} onChange={(e) => setViajeData({...viajeData, parentescoEmergencia: e.target.value})} placeholder="Ej: Cónyuge" required />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Número de Celular *</label>
                                <input type="text" value={viajeData.celularEmergencia} onChange={(e) => setViajeData({...viajeData, celularEmergencia: e.target.value})} placeholder="Con código de país" required />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 5. Solicita Hotel */}
                      <div>
                        <div className="acc-header" onClick={() => setOpenAccordion(openAccordion === 'hotel' ? '' : 'hotel')}>
                          <span>🏨 5. Solicita Hotel</span>
                          <span>{openAccordion === 'hotel' ? '▲' : '▼'}</span>
                        </div>
                        {openAccordion === 'hotel' && (
                          <div className="acc-content">
                            <div className="grid-2col">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>¿Solicita Hotel? *</label>
                                <select className="status-select" value={viajeData.solicitaHotel} onChange={(e) => setViajeData({...viajeData, solicitaHotel: e.target.value})} style={{ width: '100%', padding: '10px' }} required>
                                  <option value="No">No</option>
                                  <option value="Sí">Sí</option>
                                </select>
                              </div>
                              {viajeData.solicitaHotel === 'Sí' && (
                                <>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Check IN *</label>
                                    <input type="date" value={viajeData.checkInHotel} onChange={(e) => setViajeData({...viajeData, checkInHotel: e.target.value})} required />
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Check Out *</label>
                                    <input type="date" value={viajeData.checkOutHotel} onChange={(e) => setViajeData({...viajeData, checkOutHotel: e.target.value})} required />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="form-group">
                              <label>Hotel sugerido o área de locación del mismo</label>
                              <input type="text" value={viajeData.hotelSugerido} onChange={(e) => setViajeData({...viajeData, hotelSugerido: e.target.value})} placeholder="Ej: Cerca de las oficinas" />
                            </div>
                            <div className="form-group">
                              <label>Requerimientos Especiales</label>
                              <textarea 
                                value={viajeData.requerimientosEspeciales} 
                                onChange={(e) => setViajeData({...viajeData, requerimientosEspeciales: e.target.value})} 
                                placeholder="Dietas especiales, habitación accesible, etc..." 
                                rows={2}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. Contable Expenses quitado */}
                    </div>
                  )}
                </>
              )}

              {!(ticketCategoria === 'expenses' && tipoExpense === '') && (
                <>
                  <div className="form-group">
                    <label>Adjuntar Archivos (Hasta 15 MB c/u)</label>
                    <input 
                      type="file" 
                      multiple 
                      onChange={(e) => setArchivos(Array.from(e.target.files))} 
                      style={{ padding: '8px', background: '#f8fafc', display: 'block', width: '100%', borderRadius: '8px', border: '1px dashed #d2d2d7' }} 
                    />
                    {archivos.length > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#6e6e73', marginTop: '6px' }}>
                        <strong>Archivos seleccionados ({archivos.length}):</strong>
                        <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '0' }}>
                          {archivos.map((file, idx) => (
                            <li key={idx}>
                              📎 {file.name} <span style={{ color: '#8e8e93' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-submit" style={{ marginTop: '10px' }}>Enviar</button>
                </>
              )}
            </form>
            )}
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {success && <div style={{ background: '#dcfce3', color: '#166534', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

            {/* ESTILOS DE TABLERO DE COLUMNAS (KANBAN) */}
            <style>{`
              .board-container {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                padding: 10px 0;
                min-height: 450px;
                align-items: flex-start;
                width: 100%;
              }
              .board-column {
                flex: 1 1 180px;
                min-width: 150px;
                background: rgba(120, 120, 128, 0.04);
                border-radius: 20px;
                padding: 12px;
                box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03);
                box-sizing: border-box;
              }
              .column-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 0 4px;
              }
              .column-header h4 {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 700;
                color: var(--text-main);
                font-family: 'Outfit', sans-serif;
              }
              .column-count {
                background: var(--primary-light);
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--primary);
              }
              .column-cards {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 500px;
                overflow-y: auto;
                padding-right: 4px;
              }
              .ticket-card {
                background: var(--card-bg);
                border-radius: 16px;
                padding: 16px;
                box-shadow: var(--shadow-sm);
                border: 1px solid var(--border-color);
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                text-align: left;
                color: var(--text-main);
              }
              .ticket-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
                border-color: var(--primary);
              }
              .card-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              }
              .card-id {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--text-muted);
              }
              .card-title {
                margin: 0 0 4px 0;
                font-size: 0.9rem;
                font-weight: 700;
                color: var(--text-main);
              }
              .card-subject {
                margin: 0 0 12px 0;
                font-size: 0.8rem;
                color: #8e8e93;
                word-break: break-word;
              }
              .card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.75rem;
                color: #8e8e93;
                border-top: 1px solid rgba(0,0,0,0.03);
                padding-top: 10px;
              }
              .card-assignee {
                font-weight: 500;
                max-width: 130px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .card-activity {
                background: var(--primary-light);
                color: var(--primary);
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: 600;
              }
              .badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
              }
              .prioridad-baja {
                background: #f0fdf4;
                color: #166534;
              }
              .prioridad-normal {
                background: #eff6ff;
                color: #1e40af;
              }
              .prioridad-alta {
                background: #fffbeb;
                color: #9a3412;
              }
              .prioridad-urgente {
                background: #fee2e2;
                color: #991b1b;
              }
            `}</style>

            {/* BARRA DE BÚSQUEDA Y FILTRADO INTERACTIVA (ONE UI STYLE) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", fontWeight: '700' }}>Mis Tickets</h3>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                {/* Buscador */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e93', fontSize: '1rem' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Buscar por ID, asunto, estado..." 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.25s ease'
                    }}
                  />
                  {busqueda && (
                    <button 
                      onClick={() => setBusqueda('')} 
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#8e8e93',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <select 
                      value={filtroPrioridad} 
                      onChange={(e) => setFiltroPrioridad(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Todas">Prioridad: Todas</option>
                      <option value="Baja">Baja</option>
                      <option value="Normal">Normal</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <select 
                      value={filtroEstado} 
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Todos">Estado: Todos</option>
                      {estados.map(e => (
                        <option key={e.id} value={e.nombre}>{e.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
                    style={{ 
                      padding: '10px 16px', 
                      borderRadius: '14px', 
                      border: 'none', 
                      background: 'var(--primary)', 
                      color: 'white', 
                      fontSize: '0.85rem', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(15, 118, 110, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {viewMode === 'list' ? '🗂️ Ver Tablero' : '📋 Ver Lista'}
                  </button>
                </div>
              </div>
            </div>

            {/* TABLERO U HOJA */}
            {viewMode === 'board' ? (
              <div className="board-container" style={{ marginTop: '20px' }}>
                {estados.map(est => {
                  const ticketsEnEsteEstado = ticketsFiltradosFinal.filter(t => t.estado_embudo === est.nombre);
                  return (
                    <div key={est.id} className="board-column">
                      <div className="column-header">
                        <h4>{est.nombre}</h4>
                        <span className="column-count">{ticketsEnEsteEstado.length}</span>
                      </div>
                      <div className="column-cards">
                        {ticketsEnEsteEstado.length === 0 ? (
                          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8e8e93', fontSize: '0.8rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px', border: '1px dashed rgba(0,0,0,0.05)' }}>
                            Sin tickets
                          </div>
                        ) : (
                          ticketsEnEsteEstado.map(ticket => (
                            <div key={ticket.id} className="ticket-card" onClick={() => setModalCliente(ticket)}>
                              <div className="card-top">
                                <span className="card-id">#{ticket.id}</span>
                                <span className={`badge prioridad-${(ticket.prioridad || 'Normal').toLowerCase()}`}>{ticket.prioridad || 'Normal'}</span>
                              </div>
                              <h4 className="card-title">{ticket.nombre}</h4>
                              {usuario.rol === 'manager' && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--purple-brand)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600' }}>
                                  <span>👤 Cliente:</span>
                                  <span style={{ fontStyle: 'italic' }}>{ticket.email}</span>
                                </div>
                              )}
                              <p className="card-subject">{ticket.empresa || 'Sin asunto'}</p>
                              <div className="card-footer">
                                <span className="card-assignee" title={ticket.asignado_a || 'Sin asignar'}>
                                  👤 {ticket.asignado_a || 'Sin asignar'}
                                </span>
                                <span className="card-activity">💬 {ticket.notas ? ticket.notas.length : 0}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="users-table" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '15px' }}>ID</th>
                      {usuario.rol === 'manager' && <th style={{ padding: '15px' }}>Cliente</th>}
                      <th style={{ padding: '15px' }}>Asunto</th>
                      <th style={{ padding: '15px' }}>Estado</th>
                      <th style={{ padding: '15px' }}>Prioridad</th>
                      <th style={{ padding: '15px' }}>Última Actividad</th>
                      <th style={{ padding: '15px' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misTickets.length === 0 ? (
                      <tr><td colSpan={usuario.rol === 'manager' ? "7" : "6"} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No tienes tickets activos. ¡Crea uno nuevo!</td></tr>
                    ) : ticketsFiltradosFinal.length === 0 ? (
                      <tr><td colSpan={usuario.rol === 'manager' ? "7" : "6"} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No se encontraron tickets que coincidan con los filtros.</td></tr>
                    ) : (
                      ticketsFiltradosFinal.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px' }}>#{t.id}</td>
                          {usuario.rol === 'manager' && (
                            <td style={{ padding: '15px', color: 'var(--purple-brand)', fontWeight: '600', fontSize: '0.85rem' }}>
                              👤 {t.email}
                            </td>
                          )}
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.nombre}</td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{t.estado_embudo}</span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span className={`badge prioridad-${(t.prioridad || 'Normal').toLowerCase()}`}>{t.prioridad || 'Normal'}</span>
                          </td>
                          <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>
                            {t.notas?.length > 0 ? new Date(t.notas[t.notas.length-1].fecha).toLocaleString() : new Date(t.creado_en).toLocaleString()}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <button 
                              onClick={() => setModalCliente(t)}
                              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Ver / Responder
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {modalCliente && (
        <TicketModal 
          cliente={modalCliente} 
          usuario={usuario}
          onClose={() => setModalCliente(null)} 
          onTicketUpdated={handleTicketUpdated}
          isCustomer={true}
        />
      )}
    </div>
  );
}

export default PanelUsuario;
