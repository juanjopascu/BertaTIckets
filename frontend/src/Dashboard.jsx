import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketModal from './TicketModal';
import AdminPersonalizacion from './AdminPersonalizacion';
import AdminEcommerce, { DACAS_COUNTRIES_LIST } from './AdminEcommerce';
import Reportes from './Reportes';
import AdminDepartamentos from './AdminDepartamentos';
import AdminEstados from './AdminEstados';
import AdminTemplates from './AdminTemplates';
import AdminOrganizaciones from './AdminOrganizaciones';
import AdminEquipos from './AdminEquipos';
import AdminUsuarios from './AdminUsuarios';
import AdminImportarKayako from './AdminImportarKayako';
import AdminConfigTickets from './AdminConfigTickets';
import AdminCanalesAyuda from './AdminCanalesAyuda';
import AdminErp from './AdminErp';
import AdminErpConfig from './AdminErpConfig';
import AdminReporteriaGeneral from './AdminReporteriaGeneral';
import BrandingVectorIcon from './BrandingVectorIcon';
import HomeCommandCenter from './HomeCommandCenter';
import NotificationBell from './NotificationBell';

const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '' : `http://${window.location.hostname}:3001`;
const API_URL = `${API_BASE_URL}/api/clientes`;
const DEPT_URL = `${API_BASE_URL}/api/departamentos`;
const ESTADOS_URL = `${API_BASE_URL}/api/estados`;

function AdminViewIcon({ name, size = 18, strokeWidth = 2 }) {
  switch (name) {
    case 'personalizacion':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      );
    case 'ecommerce':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      );
    case 'erp':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      );
    case 'erp-admin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );
    case 'reporteria-general':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
          <circle cx="19" cy="9" r="2"/>
        </svg>
      );
    case 'reportes':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'departamentos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
          <path d="M9 22v-4h6v4"/>
          <path d="M8 6h.01"/>
          <path d="M16 6h.01"/>
          <path d="M12 6h.01"/>
          <path d="M12 10h.01"/>
          <path d="M12 14h.01"/>
          <path d="M16 10h.01"/>
          <path d="M16 14h.01"/>
          <path d="M8 10h.01"/>
          <path d="M8 14h.01"/>
        </svg>
      );
    case 'estados':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
          <path d="M7 7h.01"/>
        </svg>
      );
    case 'templates':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="M9 12h6"/>
          <path d="M9 16h6"/>
        </svg>
      );
    case 'organizaciones':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    case 'equipos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'usuarios':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    case 'importar-kayako':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      );
    case 'config-tickets':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case 'canales-ayuda':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      );
    case 'logs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
  }
}

const ADMIN_VIEWS_INFO = {
  personalizacion: { title: 'Personalización & Login', iconKey: 'personalizacion', route: '/admin/personalizacion' },
  ecommerce: { title: 'Gestión E-commerce', iconKey: 'ecommerce', route: '/admin/ecommerce' },
  erp: { title: 'Módulo ERP & End Users', iconKey: 'erp', route: '/admin/erp' },
  reportes: { title: 'Reportes & Métricas', iconKey: 'reportes', route: '/reportes' },
  departamentos: { title: 'Gestión de Departamentos', iconKey: 'departamentos', route: '/departamentos' },
  estados: { title: 'Gestión de Estados', iconKey: 'estados', route: '/estados' },
  templates: { title: 'Plantillas de Respuestas', iconKey: 'templates', route: '/templates' },
  organizaciones: { title: 'Organizaciones', iconKey: 'organizaciones', route: '/organizaciones' },
  equipos: { title: 'Gestión de Equipos', iconKey: 'equipos', route: '/equipos' },
  usuarios: { title: 'Usuarios del Sistema', iconKey: 'usuarios', route: '/admin' },
  logs: { title: 'Logs & Auditoría', iconKey: 'logs' },
  'importar-kayako': { title: 'Importar Kayako', iconKey: 'importar-kayako', route: '/admin/importar-kayako' },
  'config-tickets': { title: 'Configuración de Tickets', iconKey: 'config-tickets', route: '/config-tickets' },
  'canales-ayuda': { title: 'Canales de Ayuda', iconKey: 'canales-ayuda', route: '/admin/canales-ayuda' },
  'erp-admin': { title: 'ERP Admin & Integraciones', iconKey: 'erp-admin', route: '/admin/erp-admin' }
};

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
  const [filtroPais, setFiltroPais] = useState('Todos');
  const [viewMode, setViewMode] = useState('list');
  const [departamentoActivo, setDepartamentoActivo] = useState(null);
  const [activeAdminView, setActiveAdminView] = useState(null); // null (Tickets) | 'personalizacion' | ...
  const [isMaximized, setIsMaximized] = useState(false);
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
  const [adminGeneralAbierto, setAdminGeneralAbierto] = useState(true);
  const [ticketsProcesosAbierto, setTicketsProcesosAbierto] = useState(true);

  useEffect(() => {
    if (['personalizacion', 'usuarios', 'canales-ayuda', 'logs', 'importar-kayako', 'erp-admin', 'reporteria-general'].includes(activeAdminView)) {
      setAdminGeneralAbierto(true);
    } else if (['departamentos', 'estados', 'templates', 'organizaciones', 'equipos', 'config-tickets', 'reportes'].includes(activeAdminView)) {
      setTicketsProcesosAbierto(true);
    }
  }, [activeAdminView]);

  const [ecommerceSubTab, setEcommerceSubTab] = useState('products');
  const [ecommerceCountryScope, setEcommerceCountryScope] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_admin_country_scope');
      return (saved && saved !== 'all') ? saved : 'AR';
    } catch {
      return 'AR';
    }
  });

  useEffect(() => {
    const handleCountryChanged = (e) => {
      if (e?.detail?.country) {
        setEcommerceCountryScope(e.detail.country);
      }
    };
    window.addEventListener('dacas_country_changed', handleCountryChanged);
    return () => window.removeEventListener('dacas_country_changed', handleCountryChanged);
  }, []);

  const handleEcommerceCountryChange = (code) => {
    const safeCode = (!code || code === 'all') ? 'AR' : code;
    setEcommerceCountryScope(safeCode);
    try {
      localStorage.setItem('dacas_admin_country_scope', safeCode);
      localStorage.setItem('dacas_selected_country', safeCode);
      window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: safeCode } }));
    } catch {}
  };

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
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    fetchDepartamentos();
    fetchEstados();
    fetchClientes();
    fetchUsuarios();
    fetchConfigTickets();
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/branding`);
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
        if (data.browserTitle) {
          document.title = data.browserTitle;
        }
      }
    } catch (err) {
      console.error('Error al cargar branding en Dashboard:', err);
    }
  };

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
          setDepartamentoActivo(prev => (prev !== null && prev !== undefined) ? prev : deptosPermitidos[0].id);
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
  const isHomeView = !activeAdminView && !departamentoActivo;
  const activeDeptName = isHomeView ? 'Consolidado Regional' : (activeDept?.nombre || 'Seleccione un departamento');
  const clientesFiltrados = (isHomeView || activeDept?.nombre?.toLowerCase() === 'general')
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

    // 5. Filtro País
    const matchesPais = filtroPais === 'Todos' || (c.pais && c.pais.toLowerCase() === filtroPais.toLowerCase());
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesState && matchesPais;
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
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
              onClick={() => {
                setActiveAdminView(null);
                setDepartamentoActivo(null);
                setBusqueda('');
                setFiltroEstado('Todos');
                setFiltroPrioridad('Todas');
                setFiltroAsignado('Todos');
                setFiltroPais('Todos');
              }}
              title="Ir a Home / Inicio"
            >
              {branding?.headerLogoType === 'custom_image' && branding?.headerLogoUrl ? (
                <img
                  src={branding.headerLogoUrl.startsWith('http') ? branding.headerLogoUrl : `${API_BASE_URL}${branding.headerLogoUrl}`}
                  alt="Logo"
                  style={{ maxHeight: '46px', maxWidth: '160px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  background: `linear-gradient(135deg, ${branding?.login?.buttonGradientStart || '#0fa4de'} 0%, ${branding?.login?.buttonGradientEnd || '#0284c7'} 100%)`,
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
                  <span>{branding?.companyName || 'DACAS'}</span>
                </div>
              )}
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {branding?.portalTitle || 'Portal de Gestión'}
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {branding?.portalSubtitle || 'Mayorista de Tecnología, Ciberseguridad & Networking'}
                </div>
              </div>
            </div>

            {/* Controles de Usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-controls" style={{ width: 'auto', padding: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Hola, <strong style={{ color: 'var(--text-main)' }}>{usuario?.nombre}</strong></span>
                
                {/* Campana de Notificaciones (ERP, CRM, E-Commerce) */}
                <NotificationBell 
                  usuario={usuario}
                  onNavigate={(targetView, targetTab, meta) => {
                    if (targetView === 'erp') {
                      setActiveAdminView('erp');
                    } else if (targetView === 'ecommerce') {
                      setActiveAdminView('tiendanube');
                    } else if (targetView === 'crm') {
                      setActiveAdminView(null);
                      if (meta?.ticketId) {
                        const match = clientes.find(c => c.id === Number(meta.ticketId));
                        if (match) {
                          setModalCliente(match);
                        }
                      }
                    }
                  }}
                />

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
                  {theme === 'light' ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2"/>
                      <path d="M12 20v2"/>
                      <path d="m4.93 4.93 1.41 1.41"/>
                      <path d="m17.66 17.66 1.41 1.41"/>
                      <path d="M2 12h2"/>
                      <path d="M20 12h2"/>
                      <path d="m6.34 17.66-1.41 1.41"/>
                      <path d="m19.07 4.93-1.41 1.41"/>
                    </svg>
                  )}
                </button>
                <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER DE ANUNCIO GLOBAL DEL SISTEMA */}
      {branding?.announcement?.enabled && branding?.announcement?.text && (
        <div style={{
          background: branding.announcement.type === 'danger' ? '#ef4444' : branding.announcement.type === 'warning' ? '#f59e0b' : branding.announcement.type === 'success' ? '#10b981' : 'linear-gradient(90deg, #0fa4de 0%, #0284c7 100%)',
          color: '#ffffff',
          padding: '10px 24px',
          fontWeight: '700',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <BrandingVectorIcon 
            name={branding.announcement.type === 'danger' ? 'alert-circle' : branding.announcement.type === 'warning' ? 'alert-triangle' : branding.announcement.type === 'success' ? 'check-circle' : 'megaphone'} 
            size={18} 
            color="#ffffff" 
          />
          <span>{branding.announcement.text}</span>
        </div>
      )}

      <main 
        className={`crm-main-grid ${isMaximized ? 'crm-main-grid-maximized' : ''}`}
        style={isMaximized ? {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: theme === 'dark' ? '#0b0f19' : '#f8fafc',
          overflowY: 'auto',
          padding: '20px 28px',
          display: 'flex',
          flexDirection: 'row',
          gap: '24px',
          width: '100vw',
          height: '100vh',
          boxSizing: 'border-box'
        } : {}}
      >
        {/* BARRA LATERAL DE DEPARTAMENTOS Y ADMINISTRACION */}
        <aside 
          className="sidebar-depts sidebar-left"
          style={activeAdminView === 'ecommerce' ? { position: 'sticky', top: '16px', maxHeight: 'calc(100vh - 32px)', height: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 } : isMaximized ? { position: 'sticky', top: 0, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', flexShrink: 0 } : {}}
        >
          {activeAdminView === 'ecommerce' ? (
            /* ── SIDEBAR DEDICADO E-COMMERCE (Administración y CRM ocultos) ── */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px', animation: 'fadeIn 0.2s ease-out' }}>
              {/* Botón Volver a Administración / CRM General */}
              <button
                type="button"
                onClick={() => {
                  setActiveAdminView(null);
                  setIsMaximized(false);
                }}
                className="sidebar-menu-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '750',
                  padding: '10px 14px',
                  width: '100%',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: '#0284c7',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                title="Regresar al Portal General de Administración y Tickets"
              >
                <BrandingVectorIcon name="arrow-left" size={15} color="#0284c7" />
                <span>Volver a Administración</span>
              </button>

              {/* Encabezado E-commerce */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: '0 4px 10px rgba(15, 164, 222, 0.3)'
                }}>
                  <BrandingVectorIcon name="shopping-cart" size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>
                    Gestión E-commerce
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', fontWeight: '600' }}>
                    Control Regional DACAS
                  </span>
                </div>
              </div>

              {/* Selector de Scope Activo en el Sidebar */}
              <div style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
                padding: '12px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Scope Activo
                  </span>
                  <span style={{ fontSize: '9px', background: 'linear-gradient(135deg, #0fa4de, #0284c7)', color: '#ffffff', padding: '2px 7px', borderRadius: '4px', fontWeight: '800' }}>
                    PRIMARY KEY
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <select
                    value={ecommerceCountryScope}
                    onChange={(e) => handleEcommerceCountryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid #0fa4de',
                      background: '#f8fafc',
                      fontSize: '12.5px',
                      fontWeight: '750',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    {(DACAS_COUNTRIES_LIST || []).map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.3 }}>
                  Catálogo, stock y precios filtrados para este país.
                </div>
              </div>

              {/* Menú de Navegación Vertical de E-commerce */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '3px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 6px', marginBottom: '2px' }}>
                  Módulos E-commerce
                </div>
                {[
                  { id: 'products', label: 'Productos', icon: 'box' },
                  { id: 'brands', label: 'Marcas', icon: 'tag' },
                  { id: 'countries', label: 'Países y Sedes', icon: 'globe' },
                  { id: 'rules', label: 'Cupones & Reglas', icon: 'ticket' },
                  { id: 'users', label: 'Clientes Mayoristas', icon: 'users' },
                  { id: 'orders', label: 'Órdenes de Compra', icon: 'file-text' },
                  { id: 'reportes', label: 'Reportería & Métricas', icon: 'bar-chart' },
                  { id: 'envios', label: 'Métodos de Envío', icon: 'truck' },
                  { id: 'pagos', label: 'Métodos de Pago', icon: 'credit-card' },
                  { id: 'visual', label: 'Diseño & Banners', icon: 'palette' },
                  { id: 'n8n_bot', label: 'Bot n8n B2B', icon: 'bot' },
                  { id: 'apli', label: 'Conexión Apli', icon: 'zap' }
                ].map(item => {
                  const isSelected = ecommerceSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEcommerceSubTab(item.id)}
                      className={`sidebar-menu-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        borderRadius: '10px',
                        fontWeight: isSelected ? '800' : '650',
                        background: isSelected ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-main, #334155)',
                        border: isSelected ? 'none' : '1px solid transparent',
                        boxShadow: isSelected ? '0 4px 12px rgba(15, 164, 222, 0.3)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <BrandingVectorIcon name={item.icon} size={16} color={isSelected ? '#ffffff' : '#0284c7'} />
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* BOTÓN HOME PRINCIPAL */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => {
                setActiveAdminView(null);
                setDepartamentoActivo(null);
                setBusqueda('');
                setFiltroEstado('Todos');
                setFiltroPrioridad('Todas');
                setFiltroAsignado('Todos');
                setFiltroPais('Todos');
              }}
              className={`sidebar-menu-btn ${!activeAdminView && !departamentoActivo ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '800',
                padding: '11px 14px',
                width: '100%',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color, #e2e8f0)',
                background: (!activeAdminView && !departamentoActivo) ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'var(--card-bg, #ffffff)',
                color: (!activeAdminView && !departamentoActivo) ? '#ffffff' : 'var(--text-main, #0f172a)',
                cursor: 'pointer',
                boxShadow: (!activeAdminView && !departamentoActivo) ? '0 4px 12px rgba(15, 164, 222, 0.35)' : '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease'
              }}
              title="Volver al Inicio del Sistema"
            >
              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <BrandingVectorIcon name="home" size={18} color={(!activeAdminView && !departamentoActivo) ? '#ffffff' : '#0fa4de'} />
              </span>
              <span className="sidebar-btn-text" style={{ fontSize: '0.94rem' }}>Home</span>
            </button>
          </div>

          {(usuario?.rol === 'admin' || usuario?.rol === 'admin_ecommerce' || usuario?.rol === 'admin_erp') && (
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
                {usuario?.rol === 'admin_erp' ? 'Módulo ERP' : usuario?.rol === 'admin_ecommerce' ? 'Gestión E-commerce' : 'Administración'}
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
                <div className="admin-menu-groups" style={{ animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  
                  {/* ÍTEM 1: ADMINISTRACIÓN GENERAL */}
                  {usuario?.rol === 'admin' && (
                    <div className="admin-group-block" style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        onClick={() => setAdminGeneralAbierto(!adminGeneralAbierto)}
                        className={`sidebar-menu-btn ${['personalizacion', 'canales-ayuda', 'logs', 'importar-kayako', 'usuarios', 'erp-admin', 'reporteria-general'].includes(activeAdminView) ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: '700',
                          padding: '10px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <AdminViewIcon name="personalizacion" size={17} />
                          </span>
                          <span className="sidebar-btn-text">Administración General</span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          transform: adminGeneralAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}>
                          ▼
                        </span>
                      </button>

                      {adminGeneralAbierto && (
                        <ul className="admin-menu-list admin-subgroup-list" style={{
                          listStyle: 'none',
                          padding: '4px 0 4px 12px',
                          margin: '3px 0 3px 12px',
                          borderLeft: '2px solid var(--border-color, #e2e8f0)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'personalizacion' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'personalizacion' ? null : 'personalizacion')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="personalizacion" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Personalización & Login</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'canales-ayuda' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'canales-ayuda' ? null : 'canales-ayuda')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="canales-ayuda" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Canales de Ayuda</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'logs' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'logs' ? null : 'logs')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="logs" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Logs & Auditoría</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'importar-kayako' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'importar-kayako' ? null : 'importar-kayako')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="importar-kayako" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Importar Kayako</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'usuarios' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'usuarios' ? null : 'usuarios')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="usuarios" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Usuarios y Sesiones</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'erp-admin' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'erp-admin' ? null : 'erp-admin')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="erp-admin" size={15} />
                              </span>
                              <span className="sidebar-btn-text">ERP Admin</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'reporteria-general' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'reporteria-general' ? null : 'reporteria-general')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="reporteria-general" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Reportería General</span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}

                  {/* ÍTEM 2: CRM PROCESOS */}
                  {usuario?.rol === 'admin' && (
                    <div className="admin-group-block" style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        onClick={() => setTicketsProcesosAbierto(!ticketsProcesosAbierto)}
                        className={`sidebar-menu-btn ${['departamentos', 'estados', 'templates', 'organizaciones', 'equipos', 'config-tickets', 'reportes'].includes(activeAdminView) ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: '700',
                          padding: '10px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <AdminViewIcon name="templates" size={17} />
                          </span>
                          <span className="sidebar-btn-text">CRM Procesos</span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          transform: ticketsProcesosAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}>
                          ▼
                        </span>
                      </button>

                      {ticketsProcesosAbierto && (
                        <ul className="admin-menu-list admin-subgroup-list" style={{
                          listStyle: 'none',
                          padding: '4px 0 4px 12px',
                          margin: '3px 0 3px 12px',
                          borderLeft: '2px solid var(--border-color, #e2e8f0)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'departamentos' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'departamentos' ? null : 'departamentos')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="departamentos" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Gestión de Departamentos</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'estados' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'estados' ? null : 'estados')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="estados" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Gestión de Estados</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'templates' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'templates' ? null : 'templates')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="templates" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Plantillas de Respuestas</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'organizaciones' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'organizaciones' ? null : 'organizaciones')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="organizaciones" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Organizaciones</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'equipos' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'equipos' ? null : 'equipos')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="equipos" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Gestión de Equipos</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'config-tickets' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'config-tickets' ? null : 'config-tickets')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="config-tickets" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Configuración de Tickets</span>
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`sidebar-menu-btn ${activeAdminView === 'reportes' ? 'active' : ''}`}
                              onClick={() => setActiveAdminView(activeAdminView === 'reportes' ? null : 'reportes')}
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            >
                              <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <AdminViewIcon name="reportes" size={15} />
                              </span>
                              <span className="sidebar-btn-text">Reportes & Métricas</span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}

                  {/* ÍTEM 3: E-COMMERCE */}
                  {(usuario?.rol === 'admin' || usuario?.rol === 'admin_ecommerce') && (
                    <div className="admin-group-block">
                      <button 
                        className={`sidebar-menu-btn ${activeAdminView === 'ecommerce' ? 'active' : ''}`}
                        onClick={() => setActiveAdminView(activeAdminView === 'ecommerce' ? null : 'ecommerce')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontWeight: '700',
                          padding: '10px 14px'
                        }}
                      >
                        <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <AdminViewIcon name="ecommerce" size={17} />
                        </span>
                        <span className="sidebar-btn-text">E-Commerce</span>
                      </button>
                    </div>
                  )}

                  {/* ÍTEM 4: ERP */}
                  {(usuario?.rol === 'admin' || usuario?.rol === 'admin_erp') && (
                    <div className="admin-group-block">
                      <button 
                        className={`sidebar-menu-btn ${activeAdminView === 'erp' ? 'active' : ''}`}
                        onClick={() => setActiveAdminView(activeAdminView === 'erp' ? null : 'erp')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontWeight: '700',
                          padding: '10px 14px'
                        }}
                      >
                        <span className="sidebar-btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <AdminViewIcon name="erp" size={17} />
                        </span>
                        <span className="sidebar-btn-text">ERP</span>
                      </button>
                    </div>
                  )}

                </div>
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
                      className={`dept-item ${isActive && !activeAdminView ? 'active' : ''}`}
                      onClick={() => {
                        setActiveAdminView(null);
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
                            setActiveAdminView(null);
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
                            <BrandingVectorIcon name="layers" size={13} color="currentColor" /> Todos los estados
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
                                setActiveAdminView(null);
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
                                <BrandingVectorIcon name="tag" size={13} color="currentColor" /> {est.nombre}
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
            </>
          )}
        </aside>

        {/* VISTAS EMBEBIDAS DE ADMINISTRACIÓN O TABLERO PRINCIPAL DE TICKETS */}
        {activeAdminView ? (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Top Toolbar for Embedded View */}
            <div
              style={{
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAdminView(null);
                    setIsMaximized(false);
                  }}
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
                    fontWeight: '700',
                    transition: 'all 0.15s ease'
                  }}
                  title="Volver a Home / Panel Principal"
                >
                  <BrandingVectorIcon name="home" size={15} color="#0fa4de" />
                  <span>Home</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0fa4de' }}>
                    <AdminViewIcon name={activeAdminView} size={20} />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {ADMIN_VIEWS_INFO[activeAdminView]?.title || 'Administración'}
                    {activeAdminView === 'ecommerce' && (
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
                            visual: 'Diseño & Banners',
                            n8n_bot: 'Bot n8n B2B',
                            apli: 'Conexión Apli'
                          }[ecommerceSubTab] || 'Gestión'
                        }
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Botón Maximizar / Pantalla Completa (Estilo Android) */}
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  style={{
                    background: isMaximized ? 'var(--primary)' : 'var(--pill-bg)',
                    border: `1px solid ${isMaximized ? 'var(--primary)' : 'var(--border-color)'}`,
                    color: isMaximized ? '#ffffff' : 'var(--text-main)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isMaximized ? '0 4px 12px rgba(15, 164, 222, 0.3)' : 'none'
                  }}
                  title={isMaximized ? "Restaurar vista normal" : "Maximizar a pantalla completa"}
                >
                  {isMaximized ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                  )}
                </button>

                {/* Botón Abrir en Nueva Pestaña (Estilo Android) */}
                {ADMIN_VIEWS_INFO[activeAdminView]?.route && (
                  <button
                    type="button"
                    onClick={() => window.open(ADMIN_VIEWS_INFO[activeAdminView].route, '_blank')}
                    style={{
                      background: 'var(--pill-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Abrir en nueva pestaña"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Contenido de la Vista Activa */}
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              {activeAdminView === 'personalizacion' && (
                <AdminPersonalizacion
                  usuario={usuario}
                  theme={theme}
                  toggleTheme={toggleTheme}
                  embedded={true}
                  onBack={() => {
                    setActiveAdminView(null);
                    setIsMaximized(false);
                  }}
                />
              )}
              {activeAdminView === 'ecommerce' && (
                <AdminEcommerce
                  embedded={true}
                  hideTopBars={true}
                  activeTab={ecommerceSubTab}
                  onTabChange={setEcommerceSubTab}
                  countryScope={ecommerceCountryScope}
                  onCountryScopeChange={handleEcommerceCountryChange}
                  onBack={() => {
                    setActiveAdminView(null);
                    setIsMaximized(false);
                  }}
                />
              )}
              {activeAdminView === 'erp' && <AdminErp embedded={true} usuario={usuario} theme={theme} onBack={() => setActiveAdminView(null)} />}
              {activeAdminView === 'reportes' && <Reportes embedded={true} />}
              {activeAdminView === 'departamentos' && <AdminDepartamentos embedded={true} />}
              {activeAdminView === 'estados' && <AdminEstados embedded={true} />}
              {activeAdminView === 'templates' && <AdminTemplates embedded={true} />}
              {activeAdminView === 'organizaciones' && <AdminOrganizaciones embedded={true} />}
              {activeAdminView === 'equipos' && <AdminEquipos embedded={true} />}
              {activeAdminView === 'usuarios' && <AdminUsuarios usuario={usuario} theme={theme} toggleTheme={toggleTheme} embedded={true} initialTab="usuarios" />}
              {activeAdminView === 'logs' && <AdminUsuarios usuario={usuario} theme={theme} toggleTheme={toggleTheme} embedded={true} initialTab="logs" />}
              {activeAdminView === 'importar-kayako' && <AdminImportarKayako embedded={true} />}
              {activeAdminView === 'config-tickets' && <AdminConfigTickets embedded={true} />}
              {activeAdminView === 'canales-ayuda' && <AdminCanalesAyuda embedded={true} />}
              {activeAdminView === 'erp-admin' && (
                <AdminErpConfig
                  embedded={true}
                  usuario={usuario}
                  theme={theme}
                  onBack={() => {
                    setActiveAdminView(null);
                    setIsMaximized(false);
                  }}
                />
              )}
              {activeAdminView === 'reporteria-general' && (
                <AdminReporteriaGeneral
                  embedded={true}
                  usuario={usuario}
                  theme={theme}
                  onBack={() => {
                    setActiveAdminView(null);
                    setIsMaximized(false);
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="board-wrapper">
            {isHomeView && (
              <HomeCommandCenter
                usuario={usuario}
                clientes={clientes}
                departamentos={departamentos}
                estados={estados}
                usuarios={usuarios}
                theme={theme}
                setActiveAdminView={setActiveAdminView}
                setDepartamentoActivo={setDepartamentoActivo}
              />
            )}

            <div className="board-header">
              <h2>{isHomeView ? 'Registro de Tickets Globales' : 'Tickets en:'} <span>{activeDeptName}</span></h2>
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
                style={{ width: 'fit-content', background: mostrarFormulario ? 'var(--danger-bg)' : 'var(--card-bg)', color: mostrarFormulario ? 'var(--danger)' : 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <BrandingVectorIcon name={mostrarFormulario ? "x" : "plus"} size={14} color="currentColor" />
                <span>{mostrarFormulario ? 'Cancelar Nuevo Ticket' : 'Nuevo Ticket'}</span>
              </button>

              {mostrarFormulario && (
                <section className="form-section-compact" style={{ animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                  <h3>Nuevo Ticket para este departamento</h3>
                  {error && <div className="error-alert">{error}</div>}

                  {(!configTickets.habilitarNuevoTicketProcesos && !configTickets.habilitarReintegroGastos && !configTickets.habilitarReservaViajes) ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(239, 68, 68, 0.04)', border: '1px dashed rgba(239, 68, 68, 0.2)', borderRadius: '24px', margin: '20px 0' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <BrandingVectorIcon name="alert-triangle" size={44} color="#ef4444" />
                      </div>
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
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <BrandingVectorIcon name="user" size={14} color={registroModo === 'existente' ? '#ffffff' : 'var(--text-main)'} />
                          <span>Cliente Existente</span>
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
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <BrandingVectorIcon name="edit" size={14} color={registroModo === 'manual' ? '#ffffff' : 'var(--text-main)'} />
                          <span>Cliente Nuevo (Manual)</span>
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
                            <option value="">-- Selecciona un usuario registrado (Vendedor/PM/Manager) --</option>
                            {usuarios.filter(u => u.rol === 'cliente' || u.rol === 'vendedor' || u.rol === 'pm' || u.rol === 'manager').map(u => (
                              <option key={u.id} value={u.email}>
                                {u.nombre} ({u.email}) - Rol: {u.rol}
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
                            transition: 'all 0.25s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <BrandingVectorIcon name="dollar" size={16} color="currentColor" /> Expenses
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
                                  gap: '6px'
                                }}
                              >
                                <BrandingVectorIcon name="dollar" size={20} color="currentColor" />
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
                                  gap: '6px'
                                }}
                              >
                                <BrandingVectorIcon name="plane" size={20} color="currentColor" />
                                Reservar Viajes
                              </button>
                            </div>
                          </div>
                        )}

                        {tipoExpense === 'reintegro' && configTickets.habilitarReintegroGastos && (
                          <div style={{ background: theme === 'dark' ? 'rgba(192, 132, 252, 0.05)' : 'rgba(107, 33, 168, 0.02)', padding: '15px', borderRadius: '14px', border: theme === 'dark' ? '1px solid rgba(192, 132, 252, 0.2)' : '1px solid rgba(107, 33, 168, 0.1)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="dollar" size={16} color="var(--purple-brand)" /> Formulario de Reintegro de Gastos
                            </h4>
                            
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
                              <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BrandingVectorIcon name="lightbulb" size={14} color="var(--purple-brand)" /> Aclaración sobre el Asunto:
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
                            <h4 style={{ margin: '0 0 2px 0', color: 'var(--purple-brand)', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="plane" size={16} color="var(--purple-brand)" /> Solicitud de Reserva de Viajes
                            </h4>
                            
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
                              <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BrandingVectorIcon name="lightbulb" size={14} color="var(--purple-brand)" /> Aclaración sobre el Asunto:
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
                                alignItems: center;
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
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="user" size={14} color="currentColor" /> 1. Datos Personales
                                </span>
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
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="phone" size={14} color="currentColor" /> 2. Teléfono Completo
                                </span>
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
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="plane" size={14} color="currentColor" /> 3. Datos del Viaje
                                </span>
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
                                                  <BrandingVectorIcon name="check" size={13} color="var(--purple-brand)" strokeWidth={2.5} />
                                                ) : (
                                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    <BrandingVectorIcon name="plus" size={11} color="currentColor" /> Agregar
                                                  </span>
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
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="alert-circle" size={14} color="currentColor" /> 4. Datos de Emergencia
                                </span>
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
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <BrandingVectorIcon name="hotel" size={14} color="currentColor" /> 5. Solicita Hotel
                                </span>
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
                                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                                    <BrandingVectorIcon name="paperclip" size={13} color="#64748b" />
                                    <span>{file.name}</span>
                                    <span style={{ color: '#8e8e93' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
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
              min-width: 160px;
              background: var(--pill-bg);
              border-radius: var(--radius-xl, 22px);
              padding: 14px;
              box-shadow: inset 0 0 0 1px var(--border-color-subtle);
              border: 1px solid var(--border-color-subtle);
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
              background: var(--card-bg);
              padding: 3px 10px;
              border-radius: var(--radius-pill);
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--text-muted);
              border: 1px solid var(--border-color-subtle);
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
              border-radius: var(--radius-lg, 18px);
              padding: 16px;
              box-shadow: var(--shadow-sm);
              border: 1px solid var(--border-color-subtle);
              cursor: pointer;
              transition: var(--transition-bezier);
              text-align: left;
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
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e93', display: 'flex', alignItems: 'center' }}>
                <BrandingVectorIcon name="search" size={16} color="#8e8e93" />
              </span>
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

              <div>
                <select 
                  value={filtroPais} 
                  onChange={(e) => setFiltroPais(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.85rem', background: 'white', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
                  title="Filtrar tickets por país"
                >
                  <option value="Todos">🌎 País: Todos</option>
                  <option value="Argentina">🇦🇷 Argentina</option>
                  <option value="Chile">🇨🇱 Chile</option>
                  <option value="Colombia">🇨🇴 Colombia</option>
                  <option value="México">🇲🇽 México</option>
                  <option value="Uruguay">🇺🇾 Uruguay</option>
                  <option value="Perú">🇵🇪 Perú</option>
                  <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
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
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BrandingVectorIcon name={viewMode === 'list' ? "layers" : "file-text"} size={14} color="#ffffff" />
                <span>{viewMode === 'list' ? 'Ver Tablero' : 'Ver Lista'}</span>
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
                              <span className="card-assignee" title={ticket.asignado_a || 'Sin asignar'} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <BrandingVectorIcon name="user" size={12} color="#64748b" />
                                <span>{ticket.asignado_a || 'Sin asignar'}</span>
                              </span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {((ticket.archivos && ticket.archivos.length > 0) || ticket.archivo_url) && (
                                  <span className="card-activity" style={{ background: 'rgba(52, 199, 89, 0.08)', color: '#34c759', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`${ticket.archivos ? ticket.archivos.length : 1} adjunto(s)`}>
                                    <BrandingVectorIcon name="paperclip" size={11} color="#34c759" />
                                    <span>{ticket.archivos ? ticket.archivos.length : 1}</span>
                                  </span>
                                )}
                                <span className="card-activity" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <BrandingVectorIcon name="message-square" size={11} color="var(--primary)" />
                                  <span>{ticket.notas ? ticket.notas.length : 0}</span>
                                </span>
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
            <section className="board-section" style={{ marginTop: '16px', padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID / Remitente</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Asunto</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prioridad</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Última Actividad</th>
                      <th style={{ padding: '8px 12px', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay tickets en este departamento.</td></tr>
                    ) : ticketsFiltradosFinal.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron tickets que coincidan con los filtros.</td></tr>
                    ) : (
                      ticketsFiltradosFinal.map(cliente => (
                        <tr key={cliente.id} style={{ borderBottom: '1px solid var(--border-color-subtle, #f1f5f9)', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '6px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                            <div style={{ color: 'var(--primary, #0fa4de)', fontWeight: '800', fontSize: '0.88rem', lineHeight: '1.2' }}>#{cliente.id}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.2', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cliente.nombre || 'Sin remitente'}
                            </div>
                          </td>
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.82rem', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {cliente.empresa || cliente.asunto || 'Sin asunto'}
                            </div>
                          </td>
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {(() => {
                              const estObj = estados.find(e => e.nombre === cliente.estado_embudo);
                              const colorBase = estObj?.color || '#0fa4de';
                              return (
                                <span style={{ background: `${colorBase}1c`, color: colorBase, padding: '3px 10px', borderRadius: 'var(--radius-pill, 999px)', fontSize: '0.74rem', fontWeight: '750', display: 'inline-block' }}>
                                  {cliente.estado_embudo}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span className={`badge prioridad-${(cliente.prioridad || 'Normal').toLowerCase()}`} style={{ padding: '3px 9px', fontSize: '0.74rem', fontWeight: '700' }}>
                              {cliente.prioridad || 'Normal'}
                            </span>
                          </td>
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 500, lineHeight: '1.2' }}>
                              {cliente.notas?.length > 0 ? new Date(cliente.notas[cliente.notas.length-1].fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(cliente.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ marginTop: '2px', fontSize: '0.72rem', color: 'var(--primary, #0fa4de)', display: 'flex', gap: '8px', alignItems: 'center', lineHeight: '1.2' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                                <BrandingVectorIcon name="message-square" size={10} color="var(--primary, #0fa4de)" />
                                <span>{cliente.notas ? cliente.notas.length : 0} Notas</span>
                              </span>
                              {((cliente.archivos && cliente.archivos.length > 0) || cliente.archivo_url) && (
                                <span style={{ color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <BrandingVectorIcon name="layers" size={10} color="#10b981" />
                                  <span>{cliente.archivos ? cliente.archivos.length : 1} Adjuntos</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '6px 12px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button 
                              onClick={() => setModalCliente(cliente)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BrandingVectorIcon name="eye" size={11} color="currentColor" />
                              <span>Abrir Ticket</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
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
          departamentos={departamentos}
          estadosEmbudo={estadosAMostrar.map(e => e.nombre)}
          agentes={usuarios.filter(u => u.rol === 'admin' || u.rol === 'staff')}
        />
      )}

    </div>
  );
}

export default Dashboard;
