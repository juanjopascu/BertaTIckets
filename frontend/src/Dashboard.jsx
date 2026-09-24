import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketModal from './TicketModal';

const API_BASE_URL = `http://${window.location.hostname}:3001`;
const API_URL = `${API_BASE_URL}/api/clientes`;
const DEPT_URL = `${API_BASE_URL}/api/departamentos`;
const ESTADOS_URL = `${API_BASE_URL}/api/estados`;

function Dashboard({ usuario, setUsuario, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');
  const [filtroAsignado, setFiltroAsignado] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [viewMode, setViewMode] = useState('list');
  const [departamentoActivo, setDepartamentoActivo] = useState(null);
  const [modalCliente, setModalCliente] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', empresa: '', estado_embudo: 'Prospecto',
    pais: '', marca: '', nombre_empresa: '', orden_compra_cliente: '', stock: 'No',
    soft_hard: '', factura_cancelada: 'No'
  });
  const [archivos, setArchivos] = useState([]);
  const [error, setError] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(true);

  const [registroModo, setRegistroModo] = useState('existente'); // 'existente' o 'manual'
  const [selectedClienteEmail, setSelectedClienteEmail] = useState('');

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

  const [configTickets, setConfigTickets] = useState({
    habilitarNuevoTicketProcesos: true,
    habilitarReintegroGastos: true,
    habilitarReservaViajes: true
  });

  useEffect(() => {
    document.title = "DACAS Portal de Gestión";
    fetchDepartamentos();
    fetchEstados();
    fetchClientes();
    fetchUsuarios();
    fetchConfigTickets();
  }, []);

  const fetchConfigTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/config-tickets`);
      const data = await res.json();
      setConfigTickets(data);
      
      if (usuario && usuario.rol === 'staff') {
        setTicketCategoria('soporte');
      } else {
        // Auto-ajustar categoría seleccionada si la actual está deshabilitada
        if (ticketCategoria === 'soporte' && !data.habilitarNuevoTicketProcesos) {
          if (data.habilitarReintegroGastos || data.habilitarReservaViajes) {
            setTicketCategoria('expenses');
          }
        } else if (ticketCategoria === 'expenses' && !data.habilitarReintegroGastos && !data.habilitarReservaViajes) {
          if (data.habilitarNuevoTicketProcesos) {
            setTicketCategoria('soporte');
          }
        }
      }

      // Auto-ajustar tipo de gasto si el actual está deshabilitado o vacío
      if (tipoExpense === 'viaje' && !data.habilitarReservaViajes) {
        if (data.habilitarReintegroGastos) {
          setTipoExpense('reintegro');
        } else {
          setTipoExpense('');
        }
      } else if (tipoExpense === 'reintegro' && !data.habilitarReintegroGastos) {
        if (data.habilitarReservaViajes) {
          setTipoExpense('viaje');
        } else {
          setTipoExpense('');
        }
      } else if (!tipoExpense || tipoExpense === '') {
        if (data.habilitarReintegroGastos) {
          setTipoExpense('reintegro');
        } else if (data.habilitarReservaViajes) {
          setTipoExpense('viaje');
        }
      }
    } catch (err) {
      console.error("Error al obtener la configuración de tickets:", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error obteniendo usuarios", err);
    }
  };

  const fetchEstados = async () => {
    try {
      const res = await fetch(ESTADOS_URL);
      const data = await res.json();
      setEstados(data);
    } catch (err) {
      console.error("Error obteniendo estados", err);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const res = await fetch(DEPT_URL);
      const data = await res.json();
      setDepartamentos(data);
      if (data.length > 0) {
        // En lugar de tomar data[0], tomamos el primero que el usuario puede ver
        const deptosPermitidos = usuario?.rol === 'staff' && usuario?.accesos?.departamentos 
          ? data.filter(d => usuario.accesos.departamentos.includes(d.id)) 
          : data;
        
        if (deptosPermitidos.length > 0) {
          setDepartamentoActivo(deptosPermitidos[0].id);
        }
      }
    } catch (err) {
      console.error("Error obteniendo departamentos", err);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setClientes(data);
      } else {
        setClientes([]);
        setError(data.error || 'No se pudo cargar la lista de clientes.');
      }
    } catch (err) {
      console.error("Error conectando a la API", err);
      setClientes([]);
      setError('No se pudo conectar con el servidor.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'nombre') {
      setViajeData(prev => ({ ...prev, quienSolicita: value }));
    }
    if (name === 'email') {
      setViajeData(prev => ({ ...prev, correoElectronico: value }));
    }
  };

  const handleSelectClienteExistente = (e) => {
    const email = e.target.value;
    setSelectedClienteEmail(email);
    if (email) {
      const selected = usuarios.find(u => u.email === email);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          nombre: selected.nombre,
          email: selected.email,
          telefono: selected.telefono || '',
          empresa: selected.sector || selected.empresa || ''
        }));
        setViajeData(prev => ({
          ...prev,
          quienSolicita: selected.nombre,
          correoElectronico: selected.email
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        nombre: '',
        email: '',
        telefono: '',
        empresa: ''
      }));
      setViajeData(prev => ({
        ...prev,
        quienSolicita: '',
        correoElectronico: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar límites de tamaño en el lado del cliente (15 MB por archivo)
    const MAX_SIZE = 15 * 1024 * 1024;
    for (let file of archivos) {
      if (file.size > MAX_SIZE) {
        setError(`El archivo "${file.name}" supera el tamaño máximo permitido de 15 MB.`);
        return;
      }
    }

    try {
      const form = new FormData();
      form.append('creado_por', usuario.nombre || usuario.email);
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
        return departamentoActivo || 4;
      })();

      if (ticketCategoria === 'expenses') {
        if (tipoExpense === 'reintegro') {
          form.append('nombre', formData.nombre || '');
          form.append('empresa', 'Reintegro de Gastos');
          form.append('departamento', targetDepto);
          form.append('email', formData.email || usuario.email);
          form.append('telefono', formData.telefono || '');
          form.append('estado_embudo', formData.estado_embudo || 'Prospecto');
          form.append('comentario', `Solicitud de reintegro. Tipo: ${reintegroTipo}, Monto: ${reintegroMonto}, País: ${reintegroPais}, Autorizante: ${reintegroAutorizante}`);
          
          const camposExtra = {
            isExpense: true,
            expenseType: 'reintegro',
            "Quien solicita": formData.nombre || usuario.nombre,
            "Autorizante": reintegroAutorizante,
            "Pais": reintegroPais,
            "Tipo de Gasto": reintegroTipo,
            "Monto": reintegroMonto
          };
          form.append('camposExtra', JSON.stringify(camposExtra));
        } else if (tipoExpense === 'viaje') {
          form.append('nombre', formData.nombre || '');
          form.append('empresa', 'Reserva de Viajes');
          form.append('departamento', targetDepto);
          form.append('email', formData.email || usuario.email);
          form.append('telefono', formData.telefono || '');
          form.append('estado_embudo', formData.estado_embudo || 'Prospecto');
          form.append('comentario', `Solicitud de reserva de viaje para ${viajeData.quienSolicita || formData.nombre || usuario.nombre}. Destino: ${viajeData.paisDestino}. Motivo: ${viajeData.motivoViaje}`);

          const camposExtra = {
            isExpense: true,
            expenseType: 'viaje',
            "Quien solicita": viajeData.quienSolicita || formData.nombre || usuario.nombre,
            "Correo Electronico": viajeData.correoElectronico || formData.email || usuario.email,
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
          form.append('camposExtra', JSON.stringify(camposExtra));
        } else {
          setError("Por favor seleccione un tipo de Expense (Reintegro o Reserva de Viaje).");
          return;
        }
      } else {
        form.append('nombre', formData.nombre);
        form.append('email', formData.email);
        form.append('telefono', formData.telefono || '');
        form.append('empresa', formData.empresa || '');
        form.append('estado_embudo', formData.estado_embudo || 'Prospecto');
        form.append('departamento', targetDepto);
        
        // Nuevos campos obligatorios
        form.append('pais', formData.pais || '');
        form.append('marca', formData.marca || '');
        form.append('nombre_empresa', formData.nombre_empresa || '');
        form.append('orden_compra_cliente', formData.orden_compra_cliente || '');
        form.append('stock', formData.stock || 'No');
        form.append('soft_hard', formData.soft_hard || '');
        form.append('factura_cancelada', formData.factura_cancelada || 'No');
      }

      if (archivos.length > 0) {
        archivos.forEach(file => {
          form.append('documentos', file);
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: form
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar el cliente');

      setFormData({
        nombre: '', email: '', telefono: '', empresa: '', estado_embudo: 'Prospecto',
        pais: '', marca: '', nombre_empresa: '', orden_compra_cliente: '', stock: 'No',
        soft_hard: '', factura_cancelada: 'No'
      });
      setArchivos([]);
      setSelectedClienteEmail('');
      setRegistroModo('existente');

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

      setMostrarFormulario(false);
      fetchClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  // La actualización de tickets se hace desde el TicketModal.

  const handleTicketUpdated = (id, clienteActualizado) => {
    setClientes(prev => prev.map(c => c.id === id ? clienteActualizado : c));
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

  const activeDept = departamentos.find(d => d.id === departamentoActivo);
  const activeDeptName = activeDept?.nombre || 'Seleccione un departamento';
  const clientesFiltrados = activeDept?.nombre.toLowerCase() === 'general'
    ? clientes
    : clientes.filter(c => c.departamento === departamentoActivo);
  
  const ticketsFiltradosFinal = clientesFiltrados.filter(c => {
    // 1. Buscador por texto
    const q = busqueda.toLowerCase().trim();
    const matchesSearch = !q || (
      c.id.toString().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      (c.empresa && c.empresa.toLowerCase().includes(q)) ||
      c.estado_embudo.toLowerCase().includes(q) ||
      (c.prioridad && c.prioridad.toLowerCase().includes(q))
    );
    
    // 2. Filtro Prioridad
    const matchesPriority = filtroPrioridad === 'Todas' || (c.prioridad || 'Normal') === filtroPrioridad;
    
    // 3. Filtro Asignado
    let matchesAssignee = true;
    if (filtroAsignado === 'Sin Asignar') {
      matchesAssignee = !c.asignado_a;
    } else if (filtroAsignado !== 'Todos') {
      matchesAssignee = c.asignado_a === filtroAsignado;
    }
    
    // 4. Filtro Estado
    const matchesState = filtroEstado === 'Todos' || c.estado_embudo === filtroEstado;
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesState;
  });

  const deptosAMostrar = usuario?.rol === 'staff' && usuario?.accesos?.departamentos 
    ? departamentos.filter(d => usuario.accesos.departamentos.includes(d.id)) 
    : departamentos;
    
  const estadosAMostrar = usuario?.rol === 'staff' && usuario?.accesos?.estados 
    ? estados.filter(e => usuario.accesos.estados.includes(e.nombre)) 
    : estados;

  const puedeCrearTicket = usuario?.crear_tickets !== false;

  return (
    <div className="crm-container layout-sidebar">
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
                  Portal de Gestión
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Mayorista de Tecnología, Ciberseguridad & Networking
                </div>
              </div>
            </div>

            {/* Selector de Mercado / País estilo DACAS */}
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

              <div className="user-controls" style={{ width: 'auto', padding: 0 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Hola, <strong style={{ color: 'var(--text-main)' }}>{usuario?.nombre}</strong></span>
                <button 
                  type="button" 
                  onClick={toggleTheme} 
                  className="theme-toggle-btn"
                  title="Cambiar Tema"
                  style={{
                    background: 'var(--pill-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    color: 'var(--text-main)'
                  }}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="crm-main-grid">
        {/* BARRA LATERAL DE DEPARTAMENTOS Y ADMINISTRACION */}
        <aside className="sidebar-depts sidebar-left">
          {(usuario?.rol === 'admin' || usuario?.rol === 'admin_ecommerce') && (
            <div className="sidebar-section sidebar-section-admin">
              <h3 
                onClick={() => setAdminAbierto(!adminAbierto)} 
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                {usuario?.rol === 'admin_ecommerce' ? 'Gestión E-commerce' : 'Administración'}
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)',
                  transform: adminAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  display: 'inline-block'
                }}>
                  ▼
                </span>
              </h3>
              {adminAbierto && (
                <ul className="admin-menu-list" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <li>
                    <button className="sidebar-menu-btn" onClick={() => navigate('/admin/ecommerce')}>
                      <span className="sidebar-btn-icon">🛒</span>
                      <span className="sidebar-btn-text">E-commerce</span>
                    </button>
                  </li>
                  <li>
                    <button className="sidebar-menu-btn" onClick={() => navigate('/reportes')}>
                      <span className="sidebar-btn-icon">📊</span>
                      <span className="sidebar-btn-text">Reportes</span>
                    </button>
                  </li>
                  {usuario?.rol === 'admin' && (
                    <>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/departamentos')}>
                          <span className="sidebar-btn-icon">🏢</span>
                          <span className="sidebar-btn-text">Gestionar Deptos</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/estados')}>
                          <span className="sidebar-btn-icon">🏷️</span>
                          <span className="sidebar-btn-text">Gestionar Estados</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/templates')}>
                          <span className="sidebar-btn-icon">📋</span>
                          <span className="sidebar-btn-text">Plantillas</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/organizaciones')}>
                          <span className="sidebar-btn-icon">🏢</span>
                          <span className="sidebar-btn-text">Organizaciones</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/equipos')}>
                          <span className="sidebar-btn-icon">👥</span>
                          <span className="sidebar-btn-text">Gestionar Equipos</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/admin')}>
                          <span className="sidebar-btn-icon">⚙️</span>
                          <span className="sidebar-btn-text">Usuarios</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/admin/importar-kayako')}>
                          <span className="sidebar-btn-icon">📥</span>
                          <span className="sidebar-btn-text">Importar Kayako</span>
                        </button>
                      </li>
                      <li>
                        <button className="sidebar-menu-btn" onClick={() => navigate('/config-tickets')}>
                          <span className="sidebar-btn-icon">⚙️</span>
                          <span className="sidebar-btn-text">Configuración Tickets</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="sidebar-section sidebar-section-depts">
            <h3>Departamentos</h3>
            <ul className="dept-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deptosAMostrar.map(dept => {
                const isActive = departamentoActivo === dept.id;
                const totalTickets = dept.nombre.toLowerCase() === 'general' 
                  ? clientes.length 
                  : clientes.filter(c => c.departamento === dept.id).length;

                return (
                  <li key={dept.id} className="dept-group-item" style={{ listStyle: 'none' }}>
                    <div 
                      className={`dept-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (isActive) {
                          setFiltroEstado('Todos');
                        } else {
                          setDepartamentoActivo(dept.id);
                          setFiltroEstado('Todos');
                        }
                      }}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '12px 16px'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                        <span style={{ 
                          transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: '0.65rem',
                          display: 'inline-block',
                          opacity: 0.6
                        }}>
                          ▶
                        </span>
                        {dept.nombre}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        background: isActive ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                        color: isActive ? 'white' : 'var(--text-main)',
                        transition: 'all 0.2s ease'
                      }}>
                        {totalTickets}
                      </span>
                    </div>

                    {/* Hilo Colapsable de Estados Internos */}
                    {isActive && (
                      <ul className="sidebar-states-list" style={{ 
                        listStyle: 'none', 
                        paddingLeft: '20px', 
                        marginTop: '6px', 
                        marginBottom: '12px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '4px',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        {/* Opción "Todos los estados" */}
                        <li 
                          className={`state-subitem ${filtroEstado === 'Todos' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiltroEstado('Todos');
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: filtroEstado === 'Todos' ? 'var(--primary)' : 'var(--text-muted)',
                            background: filtroEstado === 'Todos' ? 'var(--primary-light)' : 'transparent',
                            transition: 'var(--transition-bezier)'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🔵</span> Todos los estados
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8 }}>
                            {totalTickets}
                          </span>
                        </li>

                        {/* Lista de cada estado particular */}
                        {estadosAMostrar.map(est => {
                          const stateCount = dept.nombre.toLowerCase() === 'general' 
                            ? clientes.filter(c => c.estado_embudo === est.nombre).length
                            : clientes.filter(c => c.departamento === dept.id && c.estado_embudo === est.nombre).length;

                          const isStateActive = filtroEstado === est.nombre;

                          return (
                            <li 
                              key={est.id}
                              className={`state-subitem ${isStateActive ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiltroEstado(est.nombre);
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: isStateActive ? 'var(--primary)' : 'var(--text-muted)',
                                background: isStateActive ? 'var(--primary-light)' : 'transparent',
                                transition: 'var(--transition-bezier)'
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>🏷️</span> {est.nombre}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8 }}>
                                {stateCount}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* TABLERO PRINCIPAL */}
        <div className="board-wrapper">
          <div className="board-header">
            <h2>Tickets en: <span>{activeDeptName}</span></h2>
          </div>

          {/* BOTÓN NUEVO TICKET (ONE UI STYLE) */}

          {puedeCrearTicket && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button 
                className="nav-btn" 
                onClick={() => {
                  const newVal = !mostrarFormulario;
                  setMostrarFormulario(newVal);
                  if (newVal) {
                    fetchConfigTickets();
                  }
                }}
                style={{ width: 'fit-content', background: mostrarFormulario ? 'var(--danger-bg)' : 'var(--card-bg)', color: mostrarFormulario ? 'var(--danger)' : 'var(--text-main)' }}
              >
                {mostrarFormulario ? '❌ Cancelar Nuevo Ticket' : '➕ Nuevo Ticket'}
              </button>

              {mostrarFormulario && (
                <section className="form-section-compact" style={{ animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                  <h3>Nuevo Ticket para este departamento</h3>
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
                    <form onSubmit={handleSubmit} className="crm-form-inline" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'stretch' }}>
                    
                    {/* Selector de modo de registro (On Behalf Of) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1c1c1e' }}>Registro a Nombre de:</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          type="button" 
                          onClick={() => {
                            setRegistroModo('existente');
                            setSelectedClienteEmail('');
                            setFormData(prev => ({ ...prev, nombre: '', email: '', telefono: '', empresa: '' }));
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '20px',
                            border: '1px solid #d2d2d7',
                            background: registroModo === 'existente' ? 'var(--primary)' : 'white',
                            color: registroModo === 'existente' ? 'white' : 'var(--text-main)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          👤 Cliente Existente
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setRegistroModo('manual');
                            setSelectedClienteEmail('');
                            setFormData(prev => ({ ...prev, nombre: '', email: '', telefono: '', empresa: '' }));
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '20px',
                            border: '1px solid #d2d2d7',
                            background: registroModo === 'manual' ? 'var(--primary)' : 'white',
                            color: registroModo === 'manual' ? 'white' : 'var(--text-main)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✍️ Cliente Nuevo (Ingreso Manual)
                        </button>
                      </div>

                      {registroModo === 'existente' && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <label style={{ fontSize: '0.8rem', color: '#8e8e93', fontWeight: 'bold' }}>Buscar Cliente Registrado:</label>
                          <select 
                            value={selectedClienteEmail} 
                            onChange={handleSelectClienteExistente}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white', outline: 'none' }}
                          >
                            <option value="">-- Selecciona un cliente/manager registrado --</option>
                            {usuarios.filter(u => u.rol === 'cliente' || u.rol === 'manager').map(u => (
                              <option key={u.id} value={u.email}>
                                👤 {u.nombre} ({u.email}) - Rol: {u.rol}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      <input 
                        type="text" 
                        name="nombre" 
                        placeholder="Nombre del Cliente *" 
                        value={formData.nombre} 
                        onChange={handleInputChange} 
                        required 
                        disabled={registroModo === 'existente'} 
                        style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: registroModo === 'existente' ? '#f5f5f7' : 'white', color: registroModo === 'existente' ? '#8e8e93' : 'var(--text-main)' }} 
                      />
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="Email *" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        disabled={registroModo === 'existente'} 
                        style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: registroModo === 'existente' ? '#f5f5f7' : 'white', color: registroModo === 'existente' ? '#8e8e93' : 'var(--text-main)' }} 
                      />
                      <input 
                        type="text" 
                        name="telefono" 
                        placeholder="Teléfono" 
                        value={formData.telefono} 
                        onChange={handleInputChange} 
                        disabled={registroModo === 'existente'} 
                        style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: registroModo === 'existente' ? '#f5f5f7' : 'white', color: registroModo === 'existente' ? '#8e8e93' : 'var(--text-main)' }} 
                      />
                    </div>

                    {/* Pestañas de Tipo de Ticket (Soporte vs Expenses) */}
                    {usuario.rol !== 'staff' && configTickets.habilitarNuevoTicketProcesos && (configTickets.habilitarReintegroGastos || configTickets.habilitarReservaViajes) && (
                      <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Asunto / Empresa *</label>
                          <input 
                            type="text" 
                            name="empresa" 
                            placeholder="Asunto / Empresa *" 
                            value={formData.empresa} 
                            onChange={handleInputChange} 
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7' }} 
                          />
                        </div>

                        {/* Nuevos campos obligatorios (Flexbox responsivo) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.15)' }}>
                          <select 
                            name="pais" 
                            value={formData.pais} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
                          >
                            <option value="">Seleccione país... *</option>
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
                          
                          <select 
                            name="marca" 
                            value={formData.marca} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
                          >
                            <option value="">Seleccione marca... *</option>
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

                          <input 
                            type="text" 
                            name="nombre_empresa" 
                            placeholder="Company Name * (Nombre de Empresa)" 
                            value={formData.nombre_empresa} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7' }}
                          />

                          <input 
                            type="number" 
                            name="orden_compra_cliente" 
                            placeholder="Client purchase order * (Nro Orden)" 
                            value={formData.orden_compra_cliente} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7' }}
                          />

                          <select 
                            name="stock" 
                            value={formData.stock} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
                          >
                            <option value="No">Stock: No</option>
                            <option value="Sí">Stock: Sí</option>
                          </select>

                          <select 
                            name="soft_hard" 
                            value={formData.soft_hard} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
                          >
                            <option value="">Seleccione Soft / Hard...</option>
                            <option value="Soft">Soft</option>
                            <option value="Hard">Hard</option>
                          </select>

                          <select 
                            name="factura_cancelada" 
                            value={formData.factura_cancelada} 
                            onChange={handleInputChange} 
                            required
                            style={{ flex: '1 1 200px', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
                          >
                            <option value="No">Factura Cancelada: No</option>
                            <option value="Sí">Factura Cancelada: Sí</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Selector de Reintegro vs Viaje */}
                        {configTickets.habilitarReintegroGastos && configTickets.habilitarReservaViajes && (
                          <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                            <label style={{ fontWeight: '700', display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-main)' }}>Tipo de Solicitud de Gasto *</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={() => setTipoExpense('reintegro')}
                                style={{
                                  flex: 1,
                                  padding: '12px',
                                  borderRadius: '12px',
                                  border: tipoExpense === 'reintegro' ? '2px solid var(--purple-brand)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0,0,0,0.08)'),
                                  background: tipoExpense === 'reintegro' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(107, 33, 168, 0.06)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'),
                                  color: tipoExpense === 'reintegro' ? 'var(--purple-brand)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'var(--purple-brand)'),
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ fontSize: '1.25rem' }}>💵</span>
                                Crear un Reintegro
                              </button>
                              <button
                                type="button"
                                onClick={() => setTipoExpense('viaje')}
                                style={{
                                  flex: 1,
                                  padding: '12px',
                                  borderRadius: '12px',
                                  border: tipoExpense === 'viaje' ? '2px solid var(--purple-brand)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0,0,0,0.08)'),
                                  background: tipoExpense === 'viaje' ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(107, 33, 168, 0.06)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'),
                                  color: tipoExpense === 'viaje' ? 'var(--purple-brand)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'var(--purple-brand)'),
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ fontSize: '1.25rem' }}>✈️</span>
                                Reservar Viajes
                              </button>
                            </div>
                          </div>
                        )}

                        {tipoExpense === 'reintegro' && configTickets.habilitarReintegroGastos && (
                          <div style={{ background: theme === 'dark' ? 'rgba(192, 132, 252, 0.05)' : 'rgba(107, 33, 168, 0.02)', padding: '15px', borderRadius: '14px', border: theme === 'dark' ? '1px solid rgba(192, 132, 252, 0.2)' : '1px solid rgba(107, 33, 168, 0.1)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>💵 Formulario de Reintegro de Gastos</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Asunto *</label>
                              <input 
                                type="text" 
                                value={formData.nombre || ''} 
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                                required 
                                placeholder="Ej: EXPENSES - MM/AA - Nombre completo" 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7' }} 
                              />
                            </div>

                            <div style={{
                              marginTop: '2px',
                              marginBottom: '8px',
                              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              fontSize: '0.8rem',
                              color: theme === 'dark' ? '#f8fafc' : '#475569',
                              lineHeight: '1.4'
                            }}>
                              <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>💡</span> Aclaración sobre el Asunto:
                              </div>
                              <div style={{ marginLeft: '15px' }}>
                                Por favor completar el asunto siguiendo este formato:
                                <div style={{ marginTop: '2px' }}>• <strong>Para TRAVELS</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '1px 3px', borderRadius: '3px' }}>TRAVELS - Pais - Nombre completo - Motivo del viaje</code></div>
                                <div style={{ marginTop: '2px' }}>• <strong>Para EXPENSES</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '1px 3px', borderRadius: '3px' }}>EXPENSES - MM/AA - Nombre completo</code></div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Autorizante *</label>
                              <input 
                                type="text" 
                                value={reintegroAutorizante} 
                                onChange={(e) => setReintegroAutorizante(e.target.value)} 
                                required 
                                placeholder="Nombre del autorizante" 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7' }} 
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>País *</label>
                              <select 
                                value={reintegroPais} 
                                onChange={(e) => setReintegroPais(e.target.value)} 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tipo de Expense *</label>
                              <select 
                                value={reintegroTipo} 
                                onChange={(e) => setReintegroTipo(e.target.value)} 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7', background: 'white' }}
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Monto *</label>
                              <input 
                                type="text" 
                                value={reintegroMonto} 
                                onChange={(e) => setReintegroMonto(e.target.value)} 
                                required 
                                placeholder="Monto (ej: 150 USD)" 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7' }} 
                              />
                            </div>
                          </div>
                        )}

                        {tipoExpense === 'viaje' && configTickets.habilitarReservaViajes && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                            <h4 style={{ margin: '0 0 2px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>✈️ Solicitud de Reserva de Viajes</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Asunto *</label>
                              <input 
                                type="text" 
                                value={formData.nombre || ''} 
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                                required 
                                placeholder="Ej: TRAVELS - Pais - Nombre completo - Motivo del viaje" 
                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d2d2d7' }} 
                              />
                            </div>

                            <div style={{
                              marginTop: '2px',
                              marginBottom: '8px',
                              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-color)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              fontSize: '0.8rem',
                              color: theme === 'dark' ? '#f8fafc' : '#475569',
                              lineHeight: '1.4'
                            }}>
                              <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>💡</span> Aclaración sobre el Asunto:
                              </div>
                              <div style={{ marginLeft: '15px' }}>
                                Por favor completar el asunto siguiendo este formato:
                                <div style={{ marginTop: '2px' }}>• <strong>Para TRAVELS</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '1px 3px', borderRadius: '3px' }}>TRAVELS - Pais - Nombre completo - Motivo del viaje</code></div>
                                <div style={{ marginTop: '2px' }}>• <strong>Para EXPENSES</strong>: <code style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme === 'dark' ? '#f8fafc' : '#1c1c1e', padding: '1px 3px', borderRadius: '3px' }}>EXPENSES - MM/AA - Nombre completo</code></div>
                              </div>
                            </div>

                            <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#8e8e93' }}>
                              Por favor, complete todos los campos requeridos agrupados en las siguientes secciones.
                            </p>

                            {/* ESTILOS DE ACORDEÓN */}
                            <style>{`
                              .acc-header {
                                background: white;
                                border: 1px solid rgba(107, 33, 168, 0.15);
                                border-radius: 10px;
                                padding: 10px 14px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                cursor: pointer;
                                font-weight: 700;
                                color: var(--purple-brand);
                                font-family: 'Outfit', sans-serif;
                                transition: all 0.2s ease;
                                user-select: none;
                                font-size: 0.85rem;
                              }
                              .acc-header:hover {
                                background: var(--primary-light);
                                border-color: var(--purple-brand);
                              }
                              .acc-content {
                                background: var(--input-bg);
                                border: 1px solid var(--border-color);
                                border-top: none;
                                border-radius: 0 0 10px 10px;
                                padding: 15px;
                                margin-top: -6px;
                                margin-bottom: 8px;
                                display: flex;
                                flex-direction: column;
                                gap: 10px;
                              }
                              .grid-2col {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                                gap: 10px;
                              }
                              .form-group-acc {
                                display: flex;
                                flex-direction: column;
                                gap: 4px;
                              }
                              .form-group-acc label {
                                font-size: 0.78rem;
                                font-weight: bold;
                                color: #6e6e73;
                              }
                              .form-group-acc input, .form-group-acc select, .form-group-acc textarea {
                                padding: 8px;
                                border-radius: 8px;
                                border: 1px solid #d2d2d7;
                                background: white;
                                font-size: 0.8rem;
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
                                    <div className="form-group-acc">
                                      <label>Quien solicita *</label>
                                      <input type="text" value={viajeData.quienSolicita || formData.nombre} onChange={(e) => setViajeData({...viajeData, quienSolicita: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Correo Electrónico *</label>
                                      <input type="email" value={viajeData.correoElectronico || formData.email} onChange={(e) => setViajeData({...viajeData, correoElectronico: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Cargo *</label>
                                      <input type="text" value={viajeData.cargo} onChange={(e) => setViajeData({...viajeData, cargo: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Autorizante de Viaje *</label>
                                      <input type="text" value={viajeData.autorizante} onChange={(e) => setViajeData({...viajeData, autorizante: e.target.value})} required />
                                    </div>
                                  </div>
                                  
                                  <div className="form-group-acc">
                                    <label>Nombre completo como figura en el documento *</label>
                                    <input type="text" value={viajeData.nombreCompletoDoc} onChange={(e) => setViajeData({...viajeData, nombreCompletoDoc: e.target.value})} required />
                                  </div>

                                  <div className="grid-2col">
                                    <div className="form-group-acc">
                                      <label>Fecha de nacimiento *</label>
                                      <input type="date" value={viajeData.fechaNacimiento} onChange={(e) => setViajeData({...viajeData, fechaNacimiento: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Tipo de documento *</label>
                                      <select value={viajeData.tipoDoc} onChange={(e) => setViajeData({...viajeData, tipoDoc: e.target.value})} required>
                                        <option value="Pasaporte">Pasaporte</option>
                                        <option value="DNI / Cédula">DNI / Cédula</option>
                                        <option value="Otro">Otro</option>
                                      </select>
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Número de Documento *</label>
                                      <input type="text" value={viajeData.nroDoc} onChange={(e) => setViajeData({...viajeData, nroDoc: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Fecha vencimiento Doc *</label>
                                      <input type="date" value={viajeData.fechaVencimientoDoc} onChange={(e) => setViajeData({...viajeData, fechaVencimientoDoc: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Fecha Emisión Doc *</label>
                                      <input type="date" value={viajeData.fechaEmisionDoc} onChange={(e) => setViajeData({...viajeData, fechaEmisionDoc: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Nacionalidad *</label>
                                      <input type="text" value={viajeData.nacionalidad} onChange={(e) => setViajeData({...viajeData, nacionalidad: e.target.value})} required />
                                    </div>
                                  </div>

                                  <div className="form-group-acc">
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
                                    <div className="form-group-acc">
                                      <label>Código de Área *</label>
                                      <input type="text" value={viajeData.codigoArea} onChange={(e) => setViajeData({...viajeData, codigoArea: e.target.value})} placeholder="Ej: +54" required />
                                    </div>
                                    <div className="form-group-acc">
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
                                    <div className="form-group-acc">
                                      <label>Tipo de Viaje *</label>
                                      <select value={viajeData.tipoViaje} onChange={(e) => setViajeData({...viajeData, tipoViaje: e.target.value})} required>
                                        <option value="Internacional">Internacional</option>
                                        <option value="Nacional">Nacional</option>
                                      </select>
                                    </div>
                                    <div className="form-group-acc">
                                      <label>País de Origen *</label>
                                      <input type="text" value={viajeData.paisOrigen} onChange={(e) => setViajeData({...viajeData, paisOrigen: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Otro Origen</label>
                                      <input type="text" value={viajeData.otroOrigen} onChange={(e) => setViajeData({...viajeData, otroOrigen: e.target.value})} />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>País de Destino *</label>
                                      <input type="text" value={viajeData.paisDestino} onChange={(e) => setViajeData({...viajeData, paisDestino: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Otro Destino</label>
                                      <input type="text" value={viajeData.otroDestino} onChange={(e) => setViajeData({...viajeData, otroDestino: e.target.value})} />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Multidestinos</label>
                                      <input type="text" value={viajeData.unicamenteMultidestinos} onChange={(e) => setViajeData({...viajeData, unicamenteMultidestinos: e.target.value})} placeholder="Detalle tramos extra" />
                                    </div>
                                  </div>

                                  <div className="grid-2col">
                                    <div className="form-group-acc">
                                      <label>Motivo del Viaje *</label>
                                      <input type="text" value={viajeData.motivoViaje} onChange={(e) => setViajeData({...viajeData, motivoViaje: e.target.value})} placeholder="Ej: Evento Partner" required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>ID Campaña</label>
                                      <input type="text" value={viajeData.idCampana} onChange={(e) => setViajeData({...viajeData, idCampana: e.target.value})} />
                                    </div>
                                  </div>

                                  <div className="form-group-acc" style={{ position: 'relative' }}>
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
                                                  fontSize: '0.85rem',
                                                  cursor: 'pointer',
                                                  background: isSelected ? (theme === 'dark' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(107, 33, 168, 0.05)') : 'transparent',
                                                  color: isSelected ? 'var(--purple-brand)' : 'var(--text-main)',
                                                  fontWeight: isSelected ? '600' : 'normal',
                                                  transition: 'all 0.15s ease',
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
                                    <div className="form-group-acc">
                                      <label>Otra Fábrica</label>
                                      <input type="text" value={viajeData.otraFabrica} onChange={(e) => setViajeData({...viajeData, otraFabrica: e.target.value})} />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Canal a visitar</label>
                                      <input type="text" value={viajeData.canalVisitar} onChange={(e) => setViajeData({...viajeData, canalVisitar: e.target.value})} />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Ciudad Origen y Aero *</label>
                                      <input type="text" value={viajeData.ciudadOrigenAero} onChange={(e) => setViajeData({...viajeData, ciudadOrigenAero: e.target.value})} placeholder="Ej: Buenos Aires (EZE)" required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Ciudad Destino y Aero *</label>
                                      <input type="text" value={viajeData.ciudadDestinoAero} onChange={(e) => setViajeData({...viajeData, ciudadDestinoAero: e.target.value})} placeholder="Ej: Miami (MIA)" required />
                                    </div>
                                  </div>

                                  <div className="grid-2col" style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)', marginTop: '4px' }}>
                                    <div className="form-group-acc">
                                      <label>Fecha de llegada *</label>
                                      <input type="date" value={viajeData.fechaLlegada} onChange={(e) => setViajeData({...viajeData, fechaLlegada: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Horario llegada</label>
                                      <input type="text" value={viajeData.horarioLlegada} onChange={(e) => setViajeData({...viajeData, horarioLlegada: e.target.value})} placeholder="Ej: Por la mañana" />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Franja Horaria</label>
                                      <select value={viajeData.franjaHorariaLlegada} onChange={(e) => setViajeData({...viajeData, franjaHorariaLlegada: e.target.value})}>
                                        <option value="GMT-3">GMT-3</option>
                                        <option value="GMT-4">GMT-4</option>
                                        <option value="GMT-5">GMT-5</option>
                                        <option value="GMT+1">GMT+1</option>
                                        <option value="Otro">Otro</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid-2col" style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)' }}>
                                    <div className="form-group-acc">
                                      <label>Fecha de salida *</label>
                                      <input type="date" value={viajeData.fechaSalida} onChange={(e) => setViajeData({...viajeData, fechaSalida: e.target.value})} required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Horario salida</label>
                                      <input type="text" value={viajeData.horarioSalida} onChange={(e) => setViajeData({...viajeData, horarioSalida: e.target.value})} placeholder="Ej: Por la tarde" />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Franja Horaria Salida</label>
                                      <select value={viajeData.franjaHorariaSalida} onChange={(e) => setViajeData({...viajeData, franjaHorariaSalida: e.target.value})}>
                                        <option value="GMT-3">GMT-3</option>
                                        <option value="GMT-4">GMT-4</option>
                                        <option value="GMT-5">GMT-5</option>
                                        <option value="GMT+1">GMT+1</option>
                                        <option value="Otro">Otro</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid-2col">
                                    <div className="form-group-acc">
                                      <label>Equipaje Bodega *</label>
                                      <select value={viajeData.solicitaEquipaje} onChange={(e) => setViajeData({...viajeData, solicitaEquipaje: e.target.value})} required>
                                        <option value="No">No</option>
                                        <option value="Sí">Sí</option>
                                      </select>
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Cantidad Equipaje</label>
                                      <input type="text" value={viajeData.cantidadEquipaje} onChange={(e) => setViajeData({...viajeData, cantidadEquipaje: e.target.value})} placeholder="Ej: 1 valija 23kg" />
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
                                    <div className="form-group-acc">
                                      <label>Contacto *</label>
                                      <input type="text" value={viajeData.contactoEmergencia} onChange={(e) => setViajeData({...viajeData, contactoEmergencia: e.target.value})} placeholder="Nombre completo" required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Parentesco *</label>
                                      <input type="text" value={viajeData.parentescoEmergencia} onChange={(e) => setViajeData({...viajeData, parentescoEmergencia: e.target.value})} placeholder="Ej: Cónyuge" required />
                                    </div>
                                    <div className="form-group-acc">
                                      <label>Celular *</label>
                                      <input type="text" value={viajeData.celularEmergencia} onChange={(e) => setViajeData({...viajeData, celularEmergencia: e.target.value})} placeholder="Con código país" required />
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
                                    <div className="form-group-acc">
                                      <label>¿Solicita Hotel? *</label>
                                      <select value={viajeData.solicitaHotel} onChange={(e) => setViajeData({...viajeData, solicitaHotel: e.target.value})} required>
                                        <option value="No">No</option>
                                        <option value="Sí">Sí</option>
                                      </select>
                                    </div>
                                    {viajeData.solicitaHotel === 'Sí' && (
                                      <>
                                        <div className="form-group-acc">
                                          <label>Check IN *</label>
                                          <input type="date" value={viajeData.checkInHotel} onChange={(e) => setViajeData({...viajeData, checkInHotel: e.target.value})} required />
                                        </div>
                                        <div className="form-group-acc">
                                          <label>Check Out *</label>
                                          <input type="date" value={viajeData.checkOutHotel} onChange={(e) => setViajeData({...viajeData, checkOutHotel: e.target.value})} required />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div className="form-group-acc">
                                    <label>Hotel sugerido o área de locación</label>
                                    <input type="text" value={viajeData.hotelSugerido} onChange={(e) => setViajeData({...viajeData, hotelSugerido: e.target.value})} placeholder="Ej: Cerca de las oficinas" />
                                  </div>
                                  <div className="form-group-acc">
                                    <label>Requerimientos Especiales</label>
                                    <textarea 
                                      value={viajeData.requerimientosEspeciales} 
                                      onChange={(e) => setViajeData({...viajeData, requerimientosEspeciales: e.target.value})} 
                                      placeholder="Dietas especiales, etc..." 
                                      rows={2}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px dashed #d2d2d7' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1c1c1e', textAlign: 'left' }}>Adjuntar Archivos (Hasta 15 MB c/u):</label>
                          <input 
                            type="file" 
                            multiple 
                            onChange={(e) => setArchivos(Array.from(e.target.files))} 
                            style={{ padding: '6px', fontSize: '0.85rem', cursor: 'pointer' }} 
                          />
                          {archivos.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#6e6e73', marginTop: '4px', textAlign: 'left' }}>
                              <strong>Archivos seleccionados ({archivos.length}):</strong>
                              <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                                {archivos.map((file, idx) => (
                                  <li key={idx}>
                                    📎 {file.name} <span style={{ color: '#8e8e93' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <button type="submit" className="btn-submit compact" style={{ width: 'fit-content', alignSelf: 'flex-end', padding: '10px 24px', fontSize: '0.9rem' }}>Registrar Ticket</button>
                      </>
                    )}
                  </form>
                  )}
                </section>
              )}
            </div>
          )}

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
              color: #1c1c1e;
              font-family: 'Outfit', sans-serif;
            }
            .column-count {
              background: rgba(0,0,0,0.06);
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 700;
              color: #8e8e93;
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
              background: white;
              border-radius: 16px;
              padding: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
              border: 1px solid rgba(0,0,0,0.05);
              cursor: pointer;
              transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
              text-align: left;
            }
            .ticket-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(0,0,0,0.06);
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
              color: #8e8e93;
            }
            .card-title {
              margin: 0 0 4px 0;
              font-size: 0.9rem;
              font-weight: 700;
              color: #1c1c1e;
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
          `}</style>

          {/* BARRA DE BÚSQUEDA Y FILTRADO INTERACTIVA (ONE UI STYLE) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '15px', flexWrap: 'wrap' }}>
            {/* Buscador */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e93', fontSize: '1rem' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por ID, cliente, asunto..." 
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

            {/* Filtros de Columna y Modo Vista */}
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
                  value={filtroAsignado} 
                  onChange={(e) => setFiltroAsignado(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Todos">Asignado: Todos</option>
                  <option value="Sin Asignar">Sin Asignar</option>
                  {usuarios.filter(u => u.rol === 'admin' || u.rol === 'staff').map(u => (
                    <option key={u.id} value={u.nombre}>{u.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  value={filtroEstado} 
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Todos">Estado: Todos</option>
                  {estadosAMostrar.map(e => (
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

          {/* VISTA CONTENIDO: TABLERO (BOARD) O LISTA DE TICKETS */}
          {viewMode === 'board' ? (
            <div className="board-container" style={{ marginTop: '20px' }}>
              {estadosAMostrar.map(est => {
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
                            <p className="card-subject">{ticket.empresa || 'Sin asunto'}</p>
                            <div className="card-footer">
                              <span className="card-assignee" title={ticket.asignado_a || 'Sin asignar'}>
                                👤 {ticket.asignado_a || 'Sin asignar'}
                              </span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {((ticket.archivos && ticket.archivos.length > 0) || ticket.archivo_url) && (
                                  <span className="card-activity" style={{ background: 'rgba(52, 199, 89, 0.08)', color: '#34c759' }} title={`${ticket.archivos ? ticket.archivos.length : 1} adjunto(s)`}>
                                    📎 {ticket.archivos ? ticket.archivos.length : 1}
                                  </span>
                                )}
                                <span className="card-activity">💬 {ticket.notas ? ticket.notas.length : 0}</span>
                              </div>
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
            <section className="board-section" style={{ marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 12px' }}>ID / Remitente</th>
                  <th style={{ padding: '14px 12px' }}>Asunto</th>
                  <th style={{ padding: '14px 12px' }}>Estado</th>
                  <th style={{ padding: '14px 12px' }}>Prioridad</th>
                  <th style={{ padding: '14px 12px' }}>Última Actividad</th>
                  <th style={{ padding: '14px 12px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay tickets en este departamento.</td></tr>
                ) : ticketsFiltradosFinal.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron tickets que coincidan con los filtros.</td></tr>
                ) : (
                  ticketsFiltradosFinal.map(cliente => (
                    <tr key={cliente.id}>
                      <td style={{ padding: '14px 12px' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>#{cliente.id}</strong><br/>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cliente.nombre}</span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--text-main)' }}>{cliente.empresa || 'Sin empresa'}</td>
                      <td style={{ padding: '14px 12px' }}>
                        {(() => {
                          const estObj = estados.find(e => e.nombre === cliente.estado_embudo);
                          const colorBase = estObj?.color || '#0fa4de';
                          return (
                            <span style={{ background: `${colorBase}1c`, color: colorBase, padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: '700' }}>
                              {cliente.estado_embudo}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className={`badge prioridad-${(cliente.prioridad || 'Normal').toLowerCase()}`}>
                          {cliente.prioridad || 'Normal'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          {cliente.notas?.length > 0 ? new Date(cliente.notas[cliente.notas.length-1].fecha).toLocaleString() : new Date(cliente.creado_en).toLocaleString()}
                        </span>
                        <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', gap: '8px' }}>
                          <span>💬 {cliente.notas ? cliente.notas.length : 0} Notas</span>
                          {((cliente.archivos && cliente.archivos.length > 0) || cliente.archivo_url) && (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>📎 {cliente.archivos ? cliente.archivos.length : 1} Adjuntos</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <button 
                          onClick={() => setModalCliente(cliente)}
                        >
                          Abrir Ticket
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}
        </div>
      </main>

      {modalCliente && (
        <TicketModal 
          cliente={modalCliente} 
          usuario={usuario}
          onClose={() => setModalCliente(null)} 
          onTicketUpdated={handleTicketUpdated}
          departamentos={departamentos}
          estadosEmbudo={estadosAMostrar.map(e => e.nombre)}
          agentes={usuarios.filter(u => u.rol === 'admin' || u.rol === 'staff')}
        />
      )}

    </div>
  );
}

export default Dashboard;
