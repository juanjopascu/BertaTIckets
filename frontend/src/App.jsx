import React, { useState, useEffect, useRef } from 'react';
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
import AdminCanalesAyuda from './AdminCanalesAyuda';
import AdminPersonalizacion from './AdminPersonalizacion';
import AdminReporteriaGeneral from './AdminReporteriaGeneral';
import './App.css';

function DynamicFaviconAndTitle() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'DACAS Portal de Gestión & Mesa de Ayuda';
    const faviconHref = '/favicon-portal.svg';
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = faviconHref;
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children, rolesPermitidos, usuario }) {
  const location = useLocation();
  const current = usuario || (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  })();

  if (!current) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(current.rol)) {
    if (current.rol === 'admin' || current.rol === 'staff') return <Navigate to="/" replace />;
    if (current.rol === 'cliente' || current.rol === 'vendedor' || current.rol === 'pm' || current.rol === 'manager') return <Navigate to="/mis-tickets" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("GLOBAL ERROR CAUGHT [CRM App]:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#FEF2F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #FECACA' }}>
            <h2 style={{ color: '#991B1B', margin: '0 0 10px' }}>⚠️ Error en la visualización (CRM)</h2>
            <p style={{ color: '#475569', fontSize: '14px' }}>Se produjo un error al renderizar la vista del CRM.</p>
            <pre style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px', fontSize: '12px', color: '#B91C1C', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{ background: '#0FA4DE', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}
            >
              Recargar Vista
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FloatingHelpButton({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const activeUser = usuario || (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  })();

  if (!activeUser) return null;

  return (
    <div className="floating-help-btn-container" ref={cardRef}>
      {isOpen && (
        <div className="floating-help-card">
          <h4>Soporte Interno DACAS</h4>
          <p>¿Tienes dudas o algún inconveniente con el CRM? Contáctanos de forma directa:</p>
          <a className="floating-help-card-btn primary" href="mailto:soporte@dacas.com?subject=Soporte%20CRM">
            Enviar Correo Electrónico
          </a>
        </div>
      )}
      <button 
        type="button"
        className="floating-help-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ayuda"
      >
        <svg viewBox="0 0 24 24" className="floating-help-icon" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>
    </div>
  );
}

export default function App() {
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  return (
    <Router>
      <DynamicFaviconAndTitle />
      <GlobalErrorBoundary>
        <Routes>
          <Route
            path="/login"
            element={!usuario ? <Login setUsuario={setUsuario} initialError={sessionError} clearInitialError={() => setSessionError('')} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to={(usuario.rol === 'admin' || usuario.rol === 'staff') ? '/' : '/mis-tickets'} />}
          />

          {/* Rutas de Gestión de Tickets (CRM) */}
          <Route
            path="/"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin', 'staff']}>
                <Dashboard usuario={usuario} setUsuario={setUsuario} theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminUsuarios usuario={usuario} theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminUsuarios usuario={usuario} theme={theme} toggleTheme={toggleTheme} initialTab="logs" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departamentos"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminDepartamentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estados"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminEstados />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <Reportes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizaciones"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminOrganizaciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipos"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminEquipos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/importar-kayako"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminImportarKayako />
              </ProtectedRoute>
            }
          />
          <Route
            path="/config-tickets"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminConfigTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/canales-ayuda"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminCanalesAyuda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/personalizacion"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin']}>
                <AdminPersonalizacion usuario={usuario} theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reporteria-general"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['admin', 'staff', 'manager']}>
                <AdminReporteriaGeneral usuario={usuario} theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />

          {/* Portal de tickets para usuarios y clientes */}
          <Route
            path="/mis-tickets"
            element={
              <ProtectedRoute usuario={usuario} rolesPermitidos={['cliente', 'vendedor', 'pm', 'usuario', 'manager']}>
                <PanelUsuario usuario={usuario} setUsuario={setUsuario} theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalErrorBoundary>
      <FloatingHelpButton usuario={usuario} />
    </Router>
  );
}
