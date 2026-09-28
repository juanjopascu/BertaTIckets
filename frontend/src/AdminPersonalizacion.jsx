import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingVectorIcon, { BUILT_IN_BRANDING_ICONS } from './BrandingVectorIcon';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

// Iconos UI internos de la interfaz (estilo Lucide)
function UIIcon({ name, size = 16, color = 'currentColor', strokeWidth = 2, style = {} }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
  };

  switch (name) {
    case 'eye':
      return (
        <svg {...props}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'rotate-ccw':
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case 'save':
      return (
        <svg {...props}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...props}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      );
    case 'image':
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...props}>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...props}>
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    case 'layout':
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      );
    case 'palette':
      return (
        <svg {...props}>
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg {...props}>
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...props}>
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function AdminPersonalizacion({ usuario, theme, toggleTheme, embedded = false, onBack }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);
  const headerLogoInputRef = useRef(null);
  const customIconFileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'portal' | 'theme' | 'announcement'
  const [previewMode, setPreviewMode] = useState('login'); // 'login' | 'dashboard'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados de biblioteca de íconos y modal para agregar nuevos
  const [iconCategoryFilter, setIconCategoryFilter] = useState('todos');
  const [iconSearchText, setIconSearchText] = useState('');
  const [showAddIconModal, setShowAddIconModal] = useState(false);
  const [newIconForm, setNewIconForm] = useState({
    name: '',
    sourceType: 'file', // 'file' | 'svg' | 'url'
    svgContent: '',
    urlContent: '',
    category: 'Personalizados'
  });
  const [customIconUploading, setCustomIconUploading] = useState(false);

  // Branding configuration state
  const [config, setConfig] = useState({
    portalTitle: 'DACAS Portal de Gestión',
    portalSubtitle: 'Mayorista de Tecnología, Ciberseguridad & Networking',
    companyName: 'DACAS',
    companyTagline: 'Distribuidor Mayorista de Valor Agregado',
    headerLogoType: 'text_icon',
    headerLogoUrl: '',
    headerLogoIcon: 'building',
    headerLogoText: 'DACAS',
    headerLogoAccentText: 'Portal de Gestión',
    browserTitle: 'DACAS Portal de Gestión',
    faviconUrl: '',
    customIcons: [], // Lista de íconos personalizados subidos
    login: {
      avatarType: 'preset_icon', // 'berto_svg' | 'custom_image' | 'preset_icon' | 'none'
      avatarImageUrl: '',
      avatarIcon: 'building',
      avatarShape: 'circle',
      avatarSize: 120,
      title: 'DACAS Portal de Gestión',
      subtitle: 'Inicia sesión para acceder al sistema',
      emailPlaceholder: 'tu@correo.com',
      passwordPlaceholder: '••••••••',
      submitButtonText: 'Ingresar',
      showShopLink: true,
      shopLinkText: 'Ir a la Tienda DACAS Shop',
      showMicrosoftLogin: true,
      microsoftButtonText: 'Iniciar sesión con Microsoft',
      showThemeToggle: true,
      footerText: 'DACAS Mayorista Oficial • Todos los derechos reservados',
      supportContactUrl: '',
      cardBackground: 'glass',
      primaryColor: '#0fa4de',
      accentColor: '#00ABC5',
      buttonGradientStart: '#0fa4de',
      buttonGradientEnd: '#0284c7',
      backgroundStyle: 'default_gradient',
      customBackgroundImage: '',
      customBackgroundColor: '#0f172a'
    },
    theme: {
      primaryColor: '#0fa4de',
      secondaryColor: '#0284c7',
      accentColor: '#00ABC5',
      headerBackground: 'default'
    },
    announcement: {
      enabled: false,
      text: '',
      type: 'info',
      dismissible: true
    }
  });

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/system/branding`);
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({
          ...prev,
          ...data,
          customIcons: data.customIcons || [],
          login: { ...prev.login, ...(data.login || {}) },
          theme: { ...prev.theme, ...(data.theme || {}) },
          announcement: { ...prev.announcement, ...(data.announcement || {}) }
        }));
      }
    } catch (err) {
      console.error('Error al cargar branding:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const handleFileUpload = async (file, targetField) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/api/system/branding/upload`, {
        method: 'POST',
        headers: {
          'x-session-id': usuario?.sesionId || ''
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      const uploadedUrl = data.url;

      if (targetField === 'login.avatarImageUrl') {
        setConfig(prev => ({
          ...prev,
          login: {
            ...prev.login,
            avatarType: 'custom_image',
            avatarImageUrl: uploadedUrl
          }
        }));
      } else if (targetField === 'login.customBackgroundImage') {
        setConfig(prev => ({
          ...prev,
          login: {
            ...prev.login,
            backgroundStyle: 'custom_image',
            customBackgroundImage: uploadedUrl
          }
        }));
      } else if (targetField === 'headerLogoUrl') {
        setConfig(prev => ({
          ...prev,
          headerLogoType: 'custom_image',
          headerLogoUrl: uploadedUrl
        }));
      }
    } catch (err) {
      alert(`Error al subir imagen: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Subir / Guardar Nuevo Ícono Personalizado
  const handleAddCustomIconSubmit = async (e) => {
    e.preventDefault();
    try {
      setCustomIconUploading(true);
      let iconValue = '';
      const iconName = newIconForm.name.trim() || 'Ícono ' + ((config.customIcons?.length || 0) + 1);

      if (newIconForm.sourceType === 'file') {
        const file = customIconFileInputRef.current?.files?.[0];
        if (!file) {
          alert('Por favor selecciona un archivo de ícono (SVG o PNG).');
          return;
        }

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE_URL}/api/system/branding/upload`, {
          method: 'POST',
          headers: { 'x-session-id': usuario?.sesionId || '' },
          body: formData
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al subir el archivo');
        }

        const data = await res.json();
        iconValue = data.url;
      } else if (newIconForm.sourceType === 'svg') {
        if (!newIconForm.svgContent.trim()) {
          alert('Por favor pega el código SVG del ícono.');
          return;
        }
        iconValue = newIconForm.svgContent.trim();
      } else if (newIconForm.sourceType === 'url') {
        if (!newIconForm.urlContent.trim()) {
          alert('Por favor ingresa la URL de la imagen del ícono.');
          return;
        }
        iconValue = newIconForm.urlContent.trim();
      }

      const newIconItem = {
        id: 'custom_' + Date.now(),
        name: iconName,
        value: iconValue,
        category: 'Personalizados',
        createdAt: new Date().toISOString()
      };

      const updatedIcons = [...(config.customIcons || []), newIconItem];

      setConfig(prev => ({
        ...prev,
        customIcons: updatedIcons,
        login: {
          ...prev.login,
          avatarIcon: iconValue
        }
      }));

      // Reset modal form
      setNewIconForm({
        name: '',
        sourceType: 'file',
        svgContent: '',
        urlContent: '',
        category: 'Personalizados'
      });
      if (customIconFileInputRef.current) customIconFileInputRef.current.value = '';
      setShowAddIconModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error al agregar ícono: ${err.message}`);
    } finally {
      setCustomIconUploading(false);
    }
  };

  const handleDeleteCustomIcon = (iconId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar este ícono personalizado de la biblioteca?')) return;
    const updatedIcons = (config.customIcons || []).filter(ic => ic.id !== iconId);
    setConfig(prev => ({
      ...prev,
      customIcons: updatedIcons
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const res = await fetch(`${API_BASE_URL}/api/system/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': usuario?.sesionId || ''
        },
        body: JSON.stringify(config)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'No se pudo guardar la configuración');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de que deseas restaurar la personalización visual a los valores oficiales por defecto de DACAS?')) {
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/system/branding/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': usuario?.sesionId || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.branding) setConfig(data.branding);
        alert('Personalización restaurada exitosamente.');
      }
    } catch (err) {
      alert('Error al restaurar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';

  // Combinar íconos nativos y personalizados
  const allIcons = [
    ...BUILT_IN_BRANDING_ICONS.map(ic => ({ ...ic, isCustom: false, value: ic.id })),
    ...(config.customIcons || []).map(ic => ({ ...ic, isCustom: true, category: 'Personalizados' }))
  ];

  const categories = ['todos', 'Corporativo', 'Seguridad', 'Tecnología', 'Hardware', 'Servicio', 'Comercial', 'General', 'Personalizados'];

  const filteredIcons = allIcons.filter(ic => {
    const matchesCategory = iconCategoryFilter === 'todos' || ic.category === iconCategoryFilter;
    const matchesSearch = !iconSearchText.trim() || ic.name.toLowerCase().includes(iconSearchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      minHeight: embedded ? 'auto' : '100vh',
      background: embedded ? 'transparent' : (isDark ? '#0b0f19' : '#f1f5f9'),
      color: textCol,
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingBottom: '30px'
    }}>

      {/* Top Header Bar */}
      <header style={{
        background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${borderCol}`,
        borderRadius: embedded ? '22px' : '0px',
        padding: embedded ? '14px 22px' : '16px 28px',
        position: embedded ? 'relative' : 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: embedded ? '20px' : '0',
        boxShadow: embedded ? '0 10px 25px -5px rgba(7, 21, 36, 0.05)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!embedded && (
            <button
              onClick={() => onBack ? onBack() : navigate('/')}
              style={{
                background: 'transparent',
                border: `1px solid ${borderCol}`,
                color: textCol,
                borderRadius: '12px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Volver al Dashboard
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: embedded ? '1.25rem' : '1.38rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--primary, #0fa4de)', display: 'inline-flex' }}>
                <UIIcon name="palette" size={22} color="var(--primary, #0fa4de)" />
              </span>
              <span>Personalización & Branding del Sistema</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.84rem', color: textMuted, marginTop: '3px' }}>
              Personaliza la pantalla de inicio de sesión, biblioteca de íconos vectoriales, logos y temas corporativos.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {!embedded && (
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: `1px solid ${borderCol}`,
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textCol
              }}
              title="Cambiar tema"
            >
              <BrandingVectorIcon name={isDark ? "sun" : "moon"} size={16} color="currentColor" />
            </button>
          )}

          <button
            onClick={() => window.open('/login', '_blank')}
            style={{
              background: isDark ? '#334155' : '#e2e8f0',
              border: 'none',
              borderRadius: '12px',
              color: textCol,
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <UIIcon name="eye" size={16} />
            <span>Ver Pantalla de Login Real</span>
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            style={{
              background: 'transparent',
              border: `1.5px solid ${isDark ? '#ef4444' : '#dc2626'}`,
              color: isDark ? '#f87171' : '#dc2626',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: saving ? 0.6 : 1
            }}
          >
            <UIIcon name="rotate-ccw" size={15} color={isDark ? '#f87171' : '#dc2626'} />
            <span>Restaurar Oficial</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(15, 164, 222, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: (saving || uploading) ? 0.7 : 1
            }}
          >
            <UIIcon name="save" size={16} color="#ffffff" />
            <span>{saving ? 'Guardando...' : saveSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </header>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div style={{
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '10px 24px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
        }}>
          <UIIcon name="check" size={18} color="#ffffff" />
          <span>¡Personalización del sistema guardada con éxito! Todos los cambios están activos.</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#ef4444',
          color: '#ffffff',
          padding: '10px 24px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <BrandingVectorIcon name="alert-triangle" size={16} color="#ffffff" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Container with 2 Columns */}
      <div style={{
        maxWidth: '1480px',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.25fr) minmax(380px, 0.95fr)',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: Controls & CMS Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Navigation Sub-Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: cardBg,
            padding: '8px',
            borderRadius: '18px',
            border: `1px solid ${borderCol}`,
            overflowX: 'auto',
            boxShadow: '0 8px 20px -4px rgba(7, 21, 36, 0.05)'
          }}>
            {[
              { key: 'login', label: 'Pantalla de Login', icon: 'monitor' },
              { key: 'portal', label: 'Encabezado & Identidad', icon: 'layout' },
              { key: 'theme', label: 'Colores & Temas', icon: 'palette' },
              { key: 'announcement', label: 'Anuncio Global', icon: 'megaphone' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'login') setPreviewMode('login');
                  else setPreviewMode('dashboard');
                }}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'transparent',
                  color: activeTab === tab.key ? '#ffffff' : textMuted,
                  fontWeight: activeTab === tab.key ? '800' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(15, 164, 222, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UIIcon name={tab.icon} size={16} color={activeTab === tab.key ? '#ffffff' : textMuted} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: PANTALLA DE LOGIN */}
          {activeTab === 'login' && (
            <div style={{
              background: cardBg,
              borderRadius: '22px',
              border: `1px solid ${borderCol}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 14px 34px -4px rgba(7, 21, 36, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: textCol, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UIIcon name="image" size={20} color="var(--primary, #0fa4de)" />
                  <span>Imagen / Avatar Principal del Login</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: textMuted }}>
                  Elige qué símbolo, logo vectorizado o imagen institucional se muestra en el inicio de sesión.
                </p>
              </div>

              {/* Selector de Tipo de Avatar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'preset_icon', label: 'Ícono Vectorial', desc: 'Biblioteca SVG del sitio', icon: 'shield' },
                  { key: 'custom_image', label: 'Imagen / Logo', desc: 'Subir archivo o URL', icon: 'image' },
                  { key: 'berto_svg', label: 'Mascota Berto', desc: 'Avatar animado', icon: 'sparkles' },
                  { key: 'none', label: 'Sin Imagen', desc: 'Solo título y campos', icon: 'eye-off' }
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => setConfig(prev => ({ ...prev, login: { ...prev.login, avatarType: opt.key } }))}
                    style={{
                      border: `2px solid ${config.login.avatarType === opt.key ? '#0fa4de' : borderCol}`,
                      borderRadius: '16px',
                      padding: '14px 12px',
                      cursor: 'pointer',
                      background: config.login.avatarType === opt.key ? (isDark ? 'rgba(15, 164, 222, 0.15)' : '#e0f2fe') : inputBg,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <div style={{ color: config.login.avatarType === opt.key ? '#0fa4de' : textMuted, marginBottom: '2px' }}>
                      <UIIcon name={opt.icon} size={22} color={config.login.avatarType === opt.key ? '#0fa4de' : textMuted} />
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: config.login.avatarType === opt.key ? '#0fa4de' : textCol }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted }}>
                      {opt.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* SELECCIONADOR DE ÍCONO VECTORIAL (MODERNO + CARGA DE NUEVOS) */}
              {config.login.avatarType === 'preset_icon' && (
                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                  border: `1px solid ${borderCol}`,
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: textCol }}>Biblioteca de Íconos Vectoriales (SVG)</strong>
                      <div style={{ fontSize: '11.5px', color: textMuted }}>
                        Íconos con el diseño y colores del sistema. Selecciona uno o carga nuevos cuando lo requieras.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddIconModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(15, 164, 222, 0.3)'
                      }}
                    >
                      <UIIcon name="plus" size={15} color="#ffffff" />
                      <span>+ Cargar Nuevo Ícono</span>
                    </button>
                  </div>

                  {/* Filtros de Categorías y Búsqueda */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setIconCategoryFilter(cat)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            border: `1px solid ${iconCategoryFilter === cat ? '#0fa4de' : borderCol}`,
                            background: iconCategoryFilter === cat ? '#0fa4de' : (isDark ? '#1e293b' : '#ffffff'),
                            color: iconCategoryFilter === cat ? '#ffffff' : textMuted,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {cat} {cat === 'Personalizados' && config.customIcons?.length ? `(${config.customIcons.length})` : ''}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={iconSearchText}
                      onChange={e => setIconSearchText(e.target.value)}
                      placeholder="Buscar ícono..."
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '12px',
                        width: '160px'
                      }}
                    />
                  </div>

                  {/* Grid de Íconos Vectoriales */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                    gap: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '4px',
                    borderRadius: '12px'
                  }}>
                    {filteredIcons.map(ic => {
                      const isSelected = config.login.avatarIcon === ic.value || (config.login.avatarIcon === ic.id);
                      return (
                        <div
                          key={ic.id}
                          onClick={() => setConfig(prev => ({ ...prev, login: { ...prev.login, avatarIcon: ic.value } }))}
                          style={{
                            border: `2px solid ${isSelected ? '#0fa4de' : borderCol}`,
                            borderRadius: '14px',
                            padding: '10px 6px',
                            background: isSelected ? (isDark ? 'rgba(15,164,222,0.22)' : '#e0f2fe') : cardBg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                            boxShadow: isSelected ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none'
                          }}
                          title={ic.name}
                        >
                          {ic.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomIcon(ic.id, e)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                              title="Eliminar este ícono personalizado"
                            >
                              <UIIcon name="x" size={10} color="#ffffff" />
                            </button>
                          )}

                          <div style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSelected ? '#0fa4de' : (isDark ? '#cbd5e1' : '#475569')
                          }}>
                            <BrandingVectorIcon
                              name={ic.value}
                              size={28}
                              color={isSelected ? '#0fa4de' : (isDark ? '#94a3b8' : '#475569')}
                            />
                          </div>

                          <div style={{
                            fontSize: '10.5px',
                            fontWeight: isSelected ? '800' : '600',
                            color: isSelected ? '#0fa4de' : textMuted,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            padding: '0 2px'
                          }}>
                            {ic.name}
                          </div>
                        </div>
                      );
                    })}

                    {/* Botón rápido "+ Agregar" al final de la cuadrícula */}
                    <div
                      onClick={() => setShowAddIconModal(true)}
                      style={{
                        border: `2px dashed ${borderCol}`,
                        borderRadius: '14px',
                        padding: '10px 6px',
                        background: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: 'var(--primary, #0fa4de)'
                      }}
                    >
                      <UIIcon name="plus" size={24} color="var(--primary, #0fa4de)" />
                      <span style={{ fontSize: '10.5px', fontWeight: '800' }}>+ Cargar</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles si es Imagen Personalizada */}
              {config.login.avatarType === 'custom_image' && (
                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                  border: `1px dashed ${borderCol}`,
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>Subir Imagen desde tu Equipo</strong>
                      <div style={{ fontSize: '11px', color: textMuted }}>Formatos soportados: PNG, JPG, WebP, SVG (Máx 15MB)</div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'login.avatarImageUrl');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '9px 16px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <UIIcon name="upload" size={15} color="#ffffff" />
                      <span>{uploading ? 'Subiendo...' : 'Seleccionar Imagen'}</span>
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      O Ingresar URL Directa de la Imagen
                    </label>
                    <input
                      type="text"
                      value={config.login.avatarImageUrl}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, avatarImageUrl: e.target.value } }))}
                      placeholder="https://ejemplo.com/logo.png o /uploads/..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                        Forma del Avatar / Contenedor
                      </label>
                      <select
                        value={config.login.avatarShape}
                        onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, avatarShape: e.target.value } }))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${borderCol}`,
                          background: inputBg,
                          color: textCol,
                          fontSize: '13px'
                        }}
                      >
                        <option value="circle">Circular (Redondo)</option>
                        <option value="rounded">Bordes Suaves (16px)</option>
                        <option value="original">Rectangular / Original</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                        Tamaño (Alto / Ancho: {config.login.avatarSize || 120}px)
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="220"
                        step="10"
                        value={config.login.avatarSize || 120}
                        onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, avatarSize: parseInt(e.target.value) } }))}
                        style={{ width: '100%', cursor: 'pointer', marginTop: '6px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: `1px solid ${borderCol}`, margin: 0 }} />

              {/* Textos del Login */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '800' }}>
                  Títulos, Subtítulos y Textos del Formulario
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={config.login.title}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, title: e.target.value } }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Subtítulo Informativo
                    </label>
                    <input
                      type="text"
                      value={config.login.subtitle}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, subtitle: e.target.value } }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Texto del Botón Ingresar
                    </label>
                    <input
                      type="text"
                      value={config.login.submitButtonText}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, submitButtonText: e.target.value } }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Pie de Página (Copyright / Legal)
                    </label>
                    <input
                      type="text"
                      value={config.login.footerText}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, footerText: e.target.value } }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${borderCol}`, margin: 0 }} />

              {/* Integraciones y accesos del Login */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '800' }}>
                  Integraciones y Enlaces Rápidos
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.login.showMicrosoftLogin}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, showMicrosoftLogin: e.target.checked } }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px' }}>Habilitar Botón de Inicio de Sesión con Microsoft Azure AD (SSO)</strong>
                      <div style={{ fontSize: '11px', color: textMuted }}>Permite a los empleados y staff autenticarse con sus cuentas institucionales @dacas.com.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.login.showShopLink}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, showShopLink: e.target.checked } }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px' }}>Mostrar Enlace de Acceso Rápido a la Tienda DACAS Shop</strong>
                      <div style={{ fontSize: '11px', color: textMuted }}>Agrega el acceso directo para compradores y clientes B2B.</div>
                    </div>
                  </label>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${borderCol}`, margin: 0 }} />

              {/* Estilo de Fondo de Login */}
              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '800' }}>
                  Fondo de la Pantalla de Login (Wallpaper)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { key: 'default_gradient', label: 'Degradado DACAS', desc: 'Azul IT y slate' },
                    { key: 'deep_blue', label: 'Azul Profundo', desc: 'Estilo enterprise' },
                    { key: 'dark_slate', label: 'Pizarra Oscura', desc: 'Minimalista dark' },
                    { key: 'custom_image', label: 'Wallpaper Personalizado', desc: 'Imagen subida' }
                  ].map(bg => (
                    <div
                      key={bg.key}
                      onClick={() => setConfig(prev => ({ ...prev, login: { ...prev.login, backgroundStyle: bg.key } }))}
                      style={{
                        border: `2px solid ${config.login.backgroundStyle === bg.key ? '#0fa4de' : borderCol}`,
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        background: config.login.backgroundStyle === bg.key ? (isDark ? 'rgba(15,164,222,0.2)' : '#e0f2fe') : inputBg,
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '12px', color: config.login.backgroundStyle === bg.key ? '#0fa4de' : textCol }}>
                        {bg.label}
                      </div>
                      <div style={{ fontSize: '10px', color: textMuted }}>{bg.desc}</div>
                    </div>
                  ))}
                </div>

                {config.login.backgroundStyle === 'custom_image' && (
                  <div style={{
                    background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                    border: `1px dashed ${borderCol}`,
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'login.customBackgroundImage');
                      }}
                    />
                    <input
                      type="text"
                      value={config.login.customBackgroundImage}
                      onChange={e => setConfig(prev => ({ ...prev, login: { ...prev.login, customBackgroundImage: e.target.value } }))}
                      placeholder="URL o sube una imagen de fondo..."
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '12px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        background: '#0fa4de',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {uploading ? '⏳' : 'Subir Fondo'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ENCABEZADO & IDENTIDAD DEL PORTAL */}
          {activeTab === 'portal' && (
            <div style={{
              background: cardBg,
              borderRadius: '22px',
              border: `1px solid ${borderCol}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 14px 34px -4px rgba(7, 21, 36, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: textCol, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UIIcon name="layout" size={20} color="var(--primary, #0fa4de)" />
                  <span>Identidad y Encabezado del Portal</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: textMuted }}>
                  Define el nombre del portal, subtítulo institucional y el logo superior del dashboard.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Nombre de la Empresa / Marca
                  </label>
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={e => setConfig(prev => ({ ...prev, companyName: e.target.value, headerLogoText: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Título del Portal
                  </label>
                  <input
                    type="text"
                    value={config.portalTitle}
                    onChange={e => setConfig(prev => ({ ...prev, portalTitle: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Subtítulo / Slogan Institucional del Encabezado
                  </label>
                  <input
                    type="text"
                    value={config.portalSubtitle}
                    onChange={e => setConfig(prev => ({ ...prev, portalSubtitle: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Título de la Pestaña del Navegador (HTML Title)
                  </label>
                  <input
                    type="text"
                    value={config.browserTitle}
                    onChange={e => setConfig(prev => ({ ...prev, browserTitle: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${borderCol}`, margin: 0 }} />

              {/* Logo del Encabezado */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '800' }}>
                  Logo del Encabezado Superior
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { key: 'text_icon', label: 'Badge Oficial con Texto', desc: 'Badge azul estilizado' },
                    { key: 'custom_image', label: 'Imagen de Logo Subida', desc: 'Logo corporativo' }
                  ].map(opt => (
                    <div
                      key={opt.key}
                      onClick={() => setConfig(prev => ({ ...prev, headerLogoType: opt.key }))}
                      style={{
                        border: `2px solid ${config.headerLogoType === opt.key ? '#0fa4de' : borderCol}`,
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        background: config.headerLogoType === opt.key ? (isDark ? 'rgba(15,164,222,0.2)' : '#e0f2fe') : inputBg,
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '12px', color: config.headerLogoType === opt.key ? '#0fa4de' : textCol }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '10px', color: textMuted }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>

                {config.headerLogoType === 'custom_image' && (
                  <div style={{
                    background: isDark ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                    border: `1px dashed ${borderCol}`,
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <input
                      type="file"
                      ref={headerLogoInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'headerLogoUrl');
                      }}
                    />
                    <input
                      type="text"
                      value={config.headerLogoUrl}
                      onChange={e => setConfig(prev => ({ ...prev, headerLogoUrl: e.target.value }))}
                      placeholder="URL o sube el logo para el encabezado..."
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '12px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => headerLogoInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        background: '#0fa4de',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {uploading ? '⏳' : 'Subir Logo'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COLORES & TEMAS */}
          {activeTab === 'theme' && (
            <div style={{
              background: cardBg,
              borderRadius: '22px',
              border: `1px solid ${borderCol}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 14px 34px -4px rgba(7, 21, 36, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: textCol, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UIIcon name="palette" size={20} color="var(--primary, #0fa4de)" />
                  <span>Paleta de Colores & Estilo Visual</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: textMuted }}>
                  Configura los colores primarios y degradados de la interfaz.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: inputBg, padding: '16px', borderRadius: '14px', border: `1px solid ${borderCol}` }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                    Color Primario DACAS
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={config.login.buttonGradientStart || '#0fa4de'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, buttonGradientStart: e.target.value, primaryColor: e.target.value },
                        theme: { ...prev.theme, primaryColor: e.target.value }
                      }))}
                      style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.login.buttonGradientStart || '#0fa4de'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, buttonGradientStart: e.target.value, primaryColor: e.target.value },
                        theme: { ...prev.theme, primaryColor: e.target.value }
                      }))}
                      style={{ width: '100px', padding: '8px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: cardBg, color: textCol, fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ background: inputBg, padding: '16px', borderRadius: '14px', border: `1px solid ${borderCol}` }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                    Color Secundario / Degradado
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={config.login.buttonGradientEnd || '#0284c7'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, buttonGradientEnd: e.target.value },
                        theme: { ...prev.theme, secondaryColor: e.target.value }
                      }))}
                      style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.login.buttonGradientEnd || '#0284c7'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, buttonGradientEnd: e.target.value },
                        theme: { ...prev.theme, secondaryColor: e.target.value }
                      }))}
                      style={{ width: '100px', padding: '8px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: cardBg, color: textCol, fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ background: inputBg, padding: '16px', borderRadius: '14px', border: `1px solid ${borderCol}` }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                    Color de Acento / Cyan
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={config.login.accentColor || '#00ABC5'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, accentColor: e.target.value },
                        theme: { ...prev.theme, accentColor: e.target.value }
                      }))}
                      style={{ width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.login.accentColor || '#00ABC5'}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        login: { ...prev.login, accentColor: e.target.value },
                        theme: { ...prev.theme, accentColor: e.target.value }
                      }))}
                      style={{ width: '100px', padding: '8px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: cardBg, color: textCol, fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANUNCIO GLOBAL */}
          {activeTab === 'announcement' && (
            <div style={{
              background: cardBg,
              borderRadius: '22px',
              border: `1px solid ${borderCol}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 14px 34px -4px rgba(7, 21, 36, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: textCol, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UIIcon name="megaphone" size={20} color="var(--primary, #0fa4de)" />
                  <span>Anuncio / Mensaje Global en Dashboard</span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: textMuted }}>
                  Muestra un banner superior visible para todos los administradores, staff y usuarios de la plataforma.
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.announcement.enabled}
                  onChange={e => setConfig(prev => ({ ...prev, announcement: { ...prev.announcement, enabled: e.target.checked } }))}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '800', fontSize: '14px' }}>Activar Banner de Anuncio Global</span>
              </label>

              {config.announcement.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Tipo de Anuncio
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[
                        { key: 'info', label: 'Informativo', color: '#0fa4de' },
                        { key: 'warning', label: 'Advertencia', color: '#f59e0b' },
                        { key: 'success', label: 'Éxito', color: '#10b981' },
                        { key: 'danger', label: 'Urgente / Alerta', color: '#ef4444' }
                      ].map(type => (
                        <button
                          key={type.key}
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, announcement: { ...prev.announcement, type: type.key } }))}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: `2px solid ${config.announcement.type === type.key ? type.color : borderCol}`,
                            background: config.announcement.type === type.key ? (isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9') : inputBg,
                            color: textCol,
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      Texto del Mensaje de Anuncio
                    </label>
                    <textarea
                      rows="3"
                      value={config.announcement.text}
                      onChange={e => setConfig(prev => ({ ...prev, announcement: { ...prev.announcement, text: e.target.value } }))}
                      placeholder="Ej: Mantenimiento programado de servidores este fin de semana de 02:00 a 06:00 GMT-3..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${borderCol}`,
                        background: inputBg,
                        color: textCol,
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Real-Time Interactive Live Preview */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{
            background: cardBg,
            borderRadius: '22px',
            border: `1px solid ${borderCol}`,
            overflow: 'hidden',
            boxShadow: '0 14px 34px -4px rgba(7, 21, 36, 0.08)'
          }}>
            {/* Header del Simulador */}
            <div style={{
              background: isDark ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${borderCol}`,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary, #0fa4de)', display: 'inline-flex' }}>
                  <UIIcon name="eye" size={17} color="var(--primary, #0fa4de)" />
                </span>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>Simulador en Tiempo Real</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: isDark ? '#1e293b' : '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode('login')}
                  style={{
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: previewMode === 'login' ? '#0fa4de' : 'transparent',
                    color: previewMode === 'login' ? '#ffffff' : textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UIIcon name="smartphone" size={12} color={previewMode === 'login' ? '#ffffff' : textMuted} />
                  <span>Pantalla Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dashboard')}
                  style={{
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: previewMode === 'dashboard' ? '#0fa4de' : 'transparent',
                    color: previewMode === 'dashboard' ? '#ffffff' : textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UIIcon name="layout" size={12} color={previewMode === 'dashboard' ? '#ffffff' : textMuted} />
                  <span>Encabezado Portal</span>
                </button>
              </div>
            </div>

            {/* Preview Window Canvas */}
            <div style={{
              padding: '28px 20px',
              minHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: previewMode === 'login'
                ? config.login.backgroundStyle === 'deep_blue'
                  ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
                  : config.login.backgroundStyle === 'dark_slate'
                    ? '#090d16'
                    : config.login.backgroundStyle === 'custom_image' && config.login.customBackgroundImage
                      ? `url(${config.login.customBackgroundImage.startsWith('http') ? config.login.customBackgroundImage : `${API_BASE_URL}${config.login.customBackgroundImage}`}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #0f172a 100%)'
                : isDark ? '#0b0f19' : '#f8fafc',
              position: 'relative'
            }}>

              {previewMode === 'login' && (
                <div style={{
                  width: '100%',
                  maxWidth: '340px',
                  background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '24px',
                  padding: '28px 24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  textAlign: 'center',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`
                }}>
                  {/* AVATAR RENDER EN SIMULADOR */}
                  {config.login.avatarType === 'berto_svg' && (
                    <div style={{ width: '74px', height: '74px', margin: '0 auto 12px auto', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                      <UIIcon name="sparkles" size={32} color="#d97706" />
                    </div>
                  )}

                  {config.login.avatarType === 'custom_image' && (
                    <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                      {config.login.avatarImageUrl ? (
                        <img
                          src={config.login.avatarImageUrl.startsWith('http') ? config.login.avatarImageUrl : `${API_BASE_URL}${config.login.avatarImageUrl}`}
                          alt="Avatar Custom"
                          style={{
                            width: `${Math.min(config.login.avatarSize || 90, 100)}px`,
                            height: `${Math.min(config.login.avatarSize || 90, 100)}px`,
                            objectFit: 'contain',
                            borderRadius: config.login.avatarShape === 'circle' ? '50%' : config.login.avatarShape === 'rounded' ? '14px' : '0px',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e0f2fe', color: '#0fa4de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          Sin Imagen
                        </div>
                      )}
                    </div>
                  )}

                  {config.login.avatarType === 'preset_icon' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '14px'
                    }}>
                      <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.15) 0%, rgba(2, 132, 199, 0.08) 100%)',
                        border: '1.5px solid rgba(15, 164, 222, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 22px -4px rgba(15, 164, 222, 0.25)',
                        color: 'var(--primary, #0fa4de)'
                      }}>
                        <BrandingVectorIcon
                          name={config.login.avatarIcon || 'building'}
                          size={40}
                          color="var(--primary, #0fa4de)"
                          strokeWidth={1.9}
                        />
                      </div>
                    </div>
                  )}

                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>
                    {config.login.title || 'DACAS Portal de Gestión'}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {config.login.subtitle || 'Inicia sesión para acceder al sistema'}
                  </p>

                  {/* Form fields mockup */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Correo Electrónico</div>
                      <div style={{ background: isDark ? '#0f172a' : '#f1f5f9', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {config.login.emailPlaceholder || 'tu@correo.com'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Contraseña</div>
                      <div style={{ background: isDark ? '#0f172a' : '#f1f5f9', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {config.login.passwordPlaceholder || '••••••••'}
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        background: `linear-gradient(135deg, ${config.login.buttonGradientStart || '#0fa4de'} 0%, ${config.login.buttonGradientEnd || '#0284c7'} 100%)`,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px',
                        fontWeight: '800',
                        fontSize: '13px',
                        marginTop: '4px',
                        cursor: 'default',
                        boxShadow: `0 4px 12px ${config.login.buttonGradientStart || '#0fa4de'}40`
                      }}
                    >
                      {config.login.submitButtonText || 'Ingresar'}
                    </button>
                  </div>

                  {config.login.showShopLink && (
                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#0fa4de', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <BrandingVectorIcon name="shopping-bag" size={12} color="#0fa4de" />
                      <span>{config.login.shopLinkText || 'Ir a la Tienda DACAS Shop'}</span>
                    </div>
                  )}

                  {config.login.showMicrosoftLogin && (
                    <div style={{ marginTop: '12px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingTop: '12px' }}>
                      <div style={{ background: '#0078d4', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M7.462 0H0v7.462h7.462V0zM16 0H8.538v7.462H16V0zM7.462 8.538H0V16h7.462V8.538zM16 8.538H8.538V16H16V8.538z" />
                        </svg>
                        <span>{config.login.microsoftButtonText || 'Iniciar sesión con Microsoft'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {previewMode === 'dashboard' && (
                <div style={{
                  width: '100%',
                  background: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '18px',
                  border: `1px solid ${borderCol}`,
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                }}>
                  {/* Mock Announcement */}
                  {config.announcement?.enabled && (
                    <div style={{
                      background: config.announcement.type === 'danger' ? '#ef4444' : config.announcement.type === 'warning' ? '#f59e0b' : config.announcement.type === 'success' ? '#10b981' : '#0fa4de',
                      color: '#ffffff',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <BrandingVectorIcon name="megaphone" size={14} color="#ffffff" />
                      <span>{config.announcement.text || 'Mensaje de anuncio global para todos los usuarios.'}</span>
                    </div>
                  )}

                  {/* Mock Header */}
                  <div style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${borderCol}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {config.headerLogoType === 'custom_image' && config.headerLogoUrl ? (
                        <img
                          src={config.headerLogoUrl.startsWith('http') ? config.headerLogoUrl : `${API_BASE_URL}${config.headerLogoUrl}`}
                          alt="Logo Header"
                          style={{ height: '36px', maxWidth: '140px', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{
                          background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                          color: '#ffffff',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          fontWeight: '900',
                          fontSize: '14px',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <BrandingVectorIcon name={config.headerLogoIcon || 'building'} size={18} color="#ffffff" />
                          <span>{config.headerLogoText || 'DACAS'}</span>
                        </div>
                      )}

                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: textCol }}>{config.portalTitle}</div>
                        <div style={{ fontSize: '11px', color: textMuted }}>{config.portalSubtitle}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDark ? '#334155' : '#e2e8f0' }} />
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0fa4de' }} />
                    </div>
                  </div>

                  <div style={{ padding: '24px', textAlign: 'center', color: textMuted, fontSize: '12px' }}>
                    Vista previa de la barra superior del portal CRM & Dashboard.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* MODAL PARA CARGAR / AGREGAR NUEVO ÍCONO PERSONALIZADO */}
      {showAddIconModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: cardBg,
            borderRadius: '22px',
            border: `1px solid ${borderCol}`,
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${borderCol}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UIIcon name="plus" size={18} color="var(--primary, #0fa4de)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Cargar Nuevo Ícono al Sistema</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddIconModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                <UIIcon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomIconSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Nombre descriptivo del ícono
                </label>
                <input
                  type="text"
                  required
                  value={newIconForm.name}
                  onChange={e => setNewIconForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Ciberdefensa, Router Cisco, Starlink..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${borderCol}`,
                    background: inputBg,
                    color: textCol,
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                  Método de Carga
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { key: 'file', label: 'Archivo (SVG/PNG)', icon: 'upload' },
                    { key: 'svg', label: 'Código SVG', icon: 'sparkles' },
                    { key: 'url', label: 'URL Web', icon: 'image' }
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setNewIconForm(prev => ({ ...prev, sourceType: m.key }))}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: `2px solid ${newIconForm.sourceType === m.key ? '#0fa4de' : borderCol}`,
                        background: newIconForm.sourceType === m.key ? (isDark ? 'rgba(15,164,222,0.2)' : '#e0f2fe') : inputBg,
                        color: newIconForm.sourceType === m.key ? '#0fa4de' : textCol,
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <UIIcon name={m.icon} size={16} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {newIconForm.sourceType === 'file' && (
                <div style={{
                  background: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                  border: `1.5px dashed ${borderCol}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <input
                    type="file"
                    ref={customIconFileInputRef}
                    accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0] && !newIconForm.name) {
                        const fname = e.target.files[0].name.replace(/\.[^/.]+$/, "");
                        setNewIconForm(prev => ({ ...prev, name: fname }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => customIconFileInputRef.current?.click()}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Seleccionar Archivo SVG o PNG
                  </button>
                  <div style={{ fontSize: '11px', color: textMuted, marginTop: '8px' }}>
                    Recomendado: Archivos vectoriales .svg transparentes o .png de 128x128px
                  </div>
                </div>
              )}

              {newIconForm.sourceType === 'svg' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    Pegar código SVG (&lt;svg ...&gt;...&lt;/svg&gt;)
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={newIconForm.svgContent}
                    onChange={e => setNewIconForm(prev => ({ ...prev, svgContent: e.target.value }))}
                    placeholder="<svg viewBox='0 0 24 24' ...> ... </svg>"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '11.5px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {newIconForm.sourceType === 'url' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    URL pública de la imagen / vector
                  </label>
                  <input
                    type="url"
                    required
                    value={newIconForm.urlContent}
                    onChange={e => setNewIconForm(prev => ({ ...prev, urlContent: e.target.value }))}
                    placeholder="https://ejemplo.com/icono.svg"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${borderCol}`,
                      background: inputBg,
                      color: textCol,
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddIconModal(false)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${borderCol}`,
                    color: textCol,
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={customIconUploading}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {customIconUploading ? 'Cargando e Instalando...' : 'Guardar y Usar Ícono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
