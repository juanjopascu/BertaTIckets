import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import AdminUsuarios from './AdminUsuarios';
import AdminDepartamentos from './AdminDepartamentos';
import AdminEstados from './AdminEstados';
import PanelUsuario from './PanelUsuario';
import Reportes from './Reportes';
import AdminImportarKayako from './AdminImportarKayako';
import AdminTemplates from './AdminTemplates';
import AdminOrganizaciones from './AdminOrganizaciones';
import AdminEquipos from './AdminEquipos';
import AdminConfigTickets from './AdminConfigTickets';
import AdminEcommerce from './AdminEcommerce';
import AdminCanalesAyuda from './AdminCanalesAyuda';
import AdminPersonalizacion from './AdminPersonalizacion';
import Shop from './Shop';
import ShopClientPortal from './ShopClientPortal';
import ShopCheckout from './ShopCheckout';
import './App.css';

// Componente de sincronización dinámica de Título y Favicon (DACAS Shop vs DACAS Portal de Gestión)
function DynamicFaviconAndTitle() {
  const location = useLocation();

  useEffect(() => {
    const isShop = location.pathname.startsWith('/shop');

    // 1. Título dinámico
    if (isShop) {
      if (location.pathname === '/shop/checkout') {
        document.title = 'DACAS Shop | Checkout';
      } else if (location.pathname === '/shop/portal' || location.pathname === '/shop/account') {
        document.title = 'DACAS Shop | Mi Panel';
      } else {
        document.title = 'DACAS Shop';
      }
    } else {
      document.title = 'DACAS Portal de Gestión';
    }

    // 2. Favicon dinámico
    const faviconHref = isShop ? '/favicon-shop.svg' : '/favicon-portal.svg';
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = faviconHref;

    // También actualizar apple-touch-icon si existe
    const appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = faviconHref;
    }
  }, [location.pathname]);

  return null;
}

function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem('usuario');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [sessionError, setSessionError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Aplicar tema global al cambiar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persistir usuario en localStorage
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [usuario]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Efecto global para monitorear en tiempo real si la sesión fue desconectada por el administrador
  useEffect(() => {
    if (!usuario || !usuario.sesionId) return;

    const API_BASE_URL = `http://${window.location.hostname}:3001`;

    const verificarSesion = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/verificar-sesion?sesionId=${usuario.sesionId}`);
        if (!res.ok) {
          const data = await res.json();
          setSessionError(data.error || 'Tu sesión ha sido cerrada de forma remota por un administrador.');
          setUsuario(null);
        }
      } catch (err) {
        console.error("Error verificando sesión activa:", err);
      }
    };

    // Verificar inmediatamente y luego cada 5 segundos
    verificarSesion();
    const interval = setInterval(verificarSesion, 5000);

    return () => clearInterval(interval);
  }, [usuario]);

  // Componente de protección de rutas basado en roles
  const ProtectedRoute = ({ children, rolesPermitidos }) => {
    const location = useLocation();
    if (!usuario) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      // Si un usuario no autorizado intenta entrar a una ruta, lo redirigimos a donde le corresponde
      if (usuario.rol === 'admin_ecommerce') return <Navigate to="/admin/ecommerce" replace />;
      if (usuario.rol === 'admin' || usuario.rol === 'staff') return <Navigate to="/" replace />;
      if (usuario.rol === 'cliente' || usuario.rol === 'vendedor' || usuario.rol === 'pm' || usuario.rol === 'manager') return <Navigate to="/mis-tickets" replace />;
    }
    return children;
  };

  return (
    <Router>
      <DynamicFaviconAndTitle />
      <Routes>
        <Route
          path="/login"
          element={!usuario ? <Login setUsuario={setUsuario} initialError={sessionError} clearInitialError={() => setSessionError('')} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to={usuario.rol === 'admin_ecommerce' ? '/admin/ecommerce' : (usuario.rol === 'admin' || usuario.rol === 'staff') ? '/' : '/mis-tickets'} />}
        />

        {/* Rutas Públicas de E-commerce */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/portal" element={<ShopClientPortal />} />
        <Route path="/shop/account" element={<ShopClientPortal />} />
        <Route path="/shop/checkout" element={<ShopCheckout />} />

        {/* Rutas de Administrador */}
        <Route
          path="/"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'staff', 'admin_ecommerce']}>
              <Dashboard usuario={usuario} setUsuario={setUsuario} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminUsuarios usuario={usuario} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departamentos"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminDepartamentos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estados"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminEstados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'admin_ecommerce']}>
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminTemplates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizaciones"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminOrganizaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipos"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminEquipos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/importar-kayako"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminImportarKayako />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config-tickets"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminConfigTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ecommerce"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'admin_ecommerce']}>
              <AdminEcommerce />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/canales-ayuda"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminCanalesAyuda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/personalizacion"
          element={
            <ProtectedRoute rolesPermitidos={['admin', 'admin_ecommerce']}>
              <AdminPersonalizacion usuario={usuario} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />

        {/* Ruta de Usuario / Empleado / Cliente / Manager */}
        <Route
          path="/mis-tickets"
          element={
            <ProtectedRoute rolesPermitidos={['cliente', 'vendedor', 'pm', 'usuario', 'manager']}>
              <PanelUsuario usuario={usuario} setUsuario={setUsuario} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <FloatingHelpButton usuario={usuario} />
    </Router>
  );
}

const DEFAULT_SUPPORT_DESTINATIONS = [
  {
    id: 'soporte_crm',
    nombre: 'Soporte Técnico / CRM',
    email: 'soporte.interno@dacas.com',
    asunto: 'Soporte CRM - Solicitud de Ayuda',
  },
  {
    id: 'ventas_shop',
    nombre: 'Ventas y E-Commerce',
    email: 'ventas@dacas.com',
    asunto: 'Consulta Comercial / E-Commerce Shop',
  },
  {
    id: 'facturacion',
    nombre: 'Facturación y Cobranzas',
    email: 'facturacion@dacas.com',
    asunto: 'Consulta de Facturación y Cuentas',
  },
  {
    id: 'general',
    nombre: 'Atención General Dacas',
    email: 'info@dacas.com',
    asunto: 'Consulta General - Dacas',
  }
];

// Beautiful and premium floating support and help button (FAB)
function FloatingHelpButton({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [destinations, setDestinations] = useState(DEFAULT_SUPPORT_DESTINATIONS);
  const [shopUser, setShopUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user') || 'null');
    } catch {
      return null;
    }
  });

  // Track login state in shop or CRM
  useEffect(() => {
    const checkAuth = () => {
      try {
        const u = JSON.parse(localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user') || 'null');
        setShopUser(u);
      } catch {
        setShopUser(null);
      }
    };
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const location = useLocation();
  const isShopRoute = location.pathname.startsWith('/shop');
  const activeUser = usuario || shopUser;
  const cardRef = React.useRef(null);

  useEffect(() => {
    if (!isOpen || !activeUser || isShopRoute) return;
    const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${apiHost}:3001/api/config-ayuda`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(d => d.activo !== false);
          if (active.length > 0) {
            setDestinations(active.map(d => ({
              id: d.id,
              nombre: d.sector || d.nombre,
              email: d.email,
              asunto: d.asunto || 'Consulta - DACAS'
            })));
          }
        }
      })
      .catch(err => {
        console.warn('Usando configuración local por defecto para canales de ayuda:', err);
      });
  }, [isOpen, activeUser, isShopRoute]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // En las rutas de Shop, el botón flotante y asistente n8n es gestionado de forma nativa e integrada por ShopMacHelpHub
  if (isShopRoute) {
    return null;
  }

  // If user is not logged in, do not render the floating help button
  if (!activeUser) {
    return null;
  }

  // Choose the destination email based on the current section
  const currentDept = isShopRoute
    ? destinations.find(d => d.id === 'ventas_shop' || d.id.includes('shop') || d.id.includes('ventas')) || destinations[0] || DEFAULT_SUPPORT_DESTINATIONS[1]
    : destinations.find(d => d.id === 'soporte_crm' || d.id.includes('crm') || d.id.includes('soporte')) || destinations[0] || DEFAULT_SUPPORT_DESTINATIONS[0];

  const getMailtoUrl = () => {
    const recipient = currentDept.email;
    const subject = encodeURIComponent(currentDept.asunto || (isShopRoute ? 'Consulta Shop DACAS' : 'Soporte CRM DACAS'));
    
    let bodyContent = `Hola Equipo de ${currentDept.nombre},\n\nTengo la siguiente consulta o requerimiento:\n\n[Escribe tu mensaje o consulta aquí]\n\n--------------------------------------------------\n`;
    bodyContent += `Detalles de diagnóstico automático:\n`;
    bodyContent += `- Canal de destino: ${currentDept.nombre} (${currentDept.email})\n`;
    bodyContent += `- URL de origen: ${window.location.href}\n`;
    bodyContent += `- Fecha y hora del reporte: ${new Date().toLocaleString()}\n`;
    
    if (activeUser) {
      bodyContent += `- Usuario: ${activeUser.nombre || activeUser.name || 'Cliente'} (${activeUser.email})\n`;
      if (activeUser.empresa || activeUser.company) bodyContent += `- Empresa: ${activeUser.empresa || activeUser.company}\n`;
      if (activeUser.rol || activeUser.role) bodyContent += `- Rol: ${activeUser.rol || activeUser.role}\n`;
      if (activeUser.pais) bodyContent += `- País: ${activeUser.pais}\n`;
      if (activeUser.sector) bodyContent += `- Sector: ${activeUser.sector}\n`;
      if (activeUser.ciudad) bodyContent += `- Ciudad: ${activeUser.ciudad}\n`;
    }
    bodyContent += `--------------------------------------------------\n`;
    
    const body = encodeURIComponent(bodyContent);
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentDept.email)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      })
      .catch((err) => {
        console.error("No se pudo copiar el email: ", err);
      });
  };

  return (
    <div className="floating-help-btn-container" ref={cardRef}>
      {/* Toast de confirmación al copiar */}
      {showToast && (
        <div className="floating-help-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          ¡Email copiado al portapapeles!
        </div>
      )}

      {/* Popover Card de Opciones de Ayuda */}
      {isOpen && (
        <div className="floating-help-card">
          <h4>
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            {isShopRoute ? 'Soporte y Ventas Shop' : 'Soporte Interno DACAS'}
          </h4>
          <p>
            {isShopRoute
              ? '¿Tienes dudas sobre productos, pedidos o cotizaciones? Contáctanos de forma directa:'
              : '¿Tienes dudas o algún inconveniente con el CRM? Contáctanos de forma directa:'}
          </p>

          {/* Botón enviar correo nativo */}
          <a 
            className="floating-help-card-btn primary" 
            href={getMailtoUrl()}
            onClick={() => {
              // Delay the closing slightly so the browser doesn't abort the native mailto navigation by unmounting the anchor immediately.
              setTimeout(() => setIsOpen(false), 300);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar Correo Electrónico
          </a>

          {/* Botón copiar correo a portapapeles */}
          <button 
            type="button"
            className="floating-help-card-btn secondary"
            onClick={handleCopyEmail}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copiar Email de Soporte
          </button>
          
          <div className="floating-help-footer-badge">
            <span className="floating-help-footer-dot"></span>
            {currentDept.email}
          </div>
        </div>
      )}

      {/* Botón FAB disparador */}
      <span className="floating-help-tooltip" style={{ opacity: isOpen ? 0 : undefined }}>
        ¿Necesitas ayuda?
      </span>
      <button 
        type="button"
        className="floating-help-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Botón de ayuda y soporte técnico"
        aria-expanded={isOpen}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="floating-help-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
          style={{ transform: isOpen ? 'rotate(135deg)' : undefined }}
        >
          {isOpen ? (
            // Icono de cruz cuando está abierto para cerrar
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            // Icono de salvavidas cuando está cerrado
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

export default App;

