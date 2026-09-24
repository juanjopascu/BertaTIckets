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
      if (usuario.rol === 'cliente' || usuario.rol === 'manager') return <Navigate to="/mis-tickets" replace />;
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

        {/* Ruta de Usuario / Empleado / Cliente / Manager */}
        <Route
          path="/mis-tickets"
          element={
            <ProtectedRoute rolesPermitidos={['cliente', 'usuario', 'manager']}>
              <PanelUsuario usuario={usuario} setUsuario={setUsuario} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <FloatingHelpButton usuario={usuario} />
    </Router>
  );
}

// Beautiful and premium floating support and help button (FAB)
function FloatingHelpButton({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const cardRef = React.useRef(null);

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

  const getMailtoUrl = () => {
    const recipient = 'soporte.interno@dacas.com';
    const subject = encodeURIComponent('Soporte CRM - Solicitud de Ayuda');
    
    let bodyContent = `Hola Equipo de Soporte,\n\nTengo la siguiente consulta o inconveniente en la plataforma CRM:\n\n[Escribe tu consulta o inconveniente aquí]\n\n--------------------------------------------------\n`;
    bodyContent += `Detalles de diagnóstico automático:\n`;
    bodyContent += `- URL de origen: ${window.location.href}\n`;
    bodyContent += `- Fecha y hora del reporte: ${new Date().toLocaleString()}\n`;
    
    if (usuario) {
      bodyContent += `- Usuario: ${usuario.nombre} (${usuario.email})\n`;
      bodyContent += `- Rol: ${usuario.rol}\n`;
      if (usuario.pais) bodyContent += `- País: ${usuario.pais}\n`;
      if (usuario.sector) bodyContent += `- Sector: ${usuario.sector}\n`;
      if (usuario.ciudad) bodyContent += `- Ciudad: ${usuario.ciudad}\n`;
    } else {
      bodyContent += `- Estado de autenticación: No autenticado / Login\n`;
    }
    bodyContent += `--------------------------------------------------\n`;
    
    const body = encodeURIComponent(bodyContent);
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('soporte.interno@dacas.com')
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
            Soporte Interno Dacas
          </h4>
          <p>¿Tienes dudas o algún inconveniente con el CRM? Contáctanos de forma directa:</p>
          
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

          {/* Botón copiar correo a portapapeles (Fallback de alta confianza) */}
          <button 
            className="floating-help-card-btn secondary"
            onClick={handleCopyEmail}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copiar Email de Soporte
          </button>
          
          <p style={{ fontSize: '0.75rem', marginTop: '4px', textAlign: 'center', opacity: 0.8 }}>
            soporte.interno@dacas.com
          </p>
        </div>
      )}

      {/* Botón FAB disparador */}
      <span className="floating-help-tooltip" style={{ opacity: isOpen ? 0 : undefined }}>
        ¿Necesitas ayuda?
      </span>
      <button 
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

