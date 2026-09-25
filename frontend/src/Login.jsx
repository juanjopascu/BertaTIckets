import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import BrandingVectorIcon from './BrandingVectorIcon';
const API_BASE_URL = `http://${window.location.hostname}:3001`;

// Helper component for the animated avatar Berto the Golden Retriever puppy
function BertoAvatar({ state }) {
  const isAngry = state === 'angry';
  const isTyping = state === 'typing';

  // Blinking effect matching the mobile application's blinking logic
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    let timer;
    const runBlink = () => {
      timer = setTimeout(() => {
        if (state !== 'angry') {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            runBlink();
          }, 150);
        } else {
          runBlink();
        }
      }, 3000 + Math.random() * 3000);
    };
    runBlink();
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className={`berto-avatar-container ${state}`}>
      <div className="berto-image-wrapper">
        <div className="berto-img-clip" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg
            viewBox="0 0 120 120"
            className={`berto-avatar ${state}`}
            style={{ width: '120px', height: '120px', overflow: 'visible' }}
          >
            {/* 1. Body/Chest */}
            <path
              d="M 30 110 Q 20 120 15 120 L 105 120 Q 100 120 90 110 Z"
              fill="#FBBF24"
            />
            <path
              d="M 45 110 Q 60 115 75 110 L 80 120 L 40 120 Z"
              fill="#FEF3C7"
            />

            {/* 2. Ears */}
            {/* Left Ear */}
            <path
              d="M 18 45 C -10 45 -5 95 15 100 Q 22 75 22 55 Z"
              fill="#D97706"
            />
            {/* Right Ear */}
            <path
              d="M 102 45 C 130 45 125 95 105 100 Q 98 75 98 55 Z"
              fill="#D97706"
            />

            {/* 3. Face Circle */}
            <circle cx="60" cy="70" r="42" fill="#FBBF24" />

            {/* 4. Cute Snout */}
            <rect x="42" y="72" width="36" height="24" rx="12" fill="#FEF3C7" />

            {/* Nose */}
            <path
              d="M 53 76 L 67 76 Q 67 82 60 84 Q 53 82 53 76 Z"
              fill="#1E293B"
            />

            {/* Mouth / Smile */}
            <path
              d="M 52 82 Q 56 89 60 82"
              fill="none"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 60 82 Q 64 89 68 82"
              fill="none"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* 5. Puppy Eyes */}
            {isAngry ? (
              <>
                {/* Sad brow lines */}
                <path
                  d="M 36 62 Q 42 52 48 62"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 72 62 Q 78 52 84 62"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Sad circles */}
                <circle cx="42" cy="63" r="3" fill="#0F172A" />
                <circle cx="78" cy="63" r="3" fill="#0F172A" />
                {/* Cheeks */}
                <circle cx="32" cy="82" r="6" fill="#EF4444" fillOpacity="0.4" />
                <circle cx="88" cy="82" r="6" fill="#EF4444" fillOpacity="0.4" />
              </>
            ) : isBlinking ? (
              <>
                {/* Blinking eyes */}
                <path
                  d="M 36 62 L 48 62"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.0"
                  strokeLinecap="round"
                />
                <path
                  d="M 72 62 L 84 62"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.0"
                  strokeLinecap="round"
                />
              </>
            ) : isTyping ? (
              <>
                {/* Squinting eyes */}
                <circle cx="42" cy="62" r="5.5" fill="#0F172A" />
                <circle cx="78" cy="62" r="5.5" fill="#0F172A" />
                {/* Pupils */}
                <circle cx="43" cy="64.5" r="1.8" fill="white" />
                <circle cx="77" cy="64.5" r="1.8" fill="white" />
              </>
            ) : (
              <>
                {/* Idle eyes */}
                <circle cx="42" cy="62" r="6.5" fill="#0F172A" />
                <circle cx="78" cy="62" r="6.5" fill="#0F172A" />
                {/* Reflections */}
                <circle cx="39.5" cy="59.5" r="2.2" fill="white" />
                <circle cx="75.5" cy="59.5" r="2.2" fill="white" />
                <circle cx="44" cy="64" r="1.0" fill="white" />
                <circle cx="80" cy="64" r="1.0" fill="white" />
              </>
            )}
          </svg>
        </div>
        {/* Playful and premium interactive emotional overlays */}
        {isAngry && (
          <div className="berto-effects">
            <span className="berto-bubble-sad">¡Contraseña incorrecta! 😢</span>
            <span className="berto-effect-emoji left-puff">💨</span>
            <span className="berto-effect-emoji right-puff">💨</span>
            <span className="berto-effect-emoji anger-left"></span>
            <span className="berto-effect-emoji anger-right"></span>
          </div>
        )}
        {isTyping && (
          <div className="berto-effects">
            <span className="berto-bubble-typing">Escribiendo... ✍️</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Login({ setUsuario, initialError, clearInitialError, theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [avatarState, setAvatarState] = useState('normal'); // 'normal' | 'typing' | 'angry'
  const [shakeBox, setShakeBox] = useState(false);
  const [branding, setBranding] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();

  useEffect(() => {
    // Cargar personalización visual del backend
    fetch(`${API_BASE_URL}/api/system/branding`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBranding(data);
          if (data.browserTitle) {
            document.title = data.browserTitle;
          }
        }
      })
      .catch(err => console.error('Error al cargar branding en login:', err));
  }, []);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
      triggerErrorAnimations();
      if (clearInitialError) {
        clearInitialError();
      }
    }
  }, [initialError]);

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    setAvatarState('typing');
    setError(''); // Clear error alert on edit
  };

  const handleInputFocus = () => {
    setAvatarState('typing');
  };

  const handleInputBlur = () => {
    if (avatarState === 'typing') {
      setAvatarState('normal');
    }
  };

  const triggerErrorAnimations = () => {
    setAvatarState('angry');
    setShakeBox(true);
    // Reset shakeBox state after animation completes so it can be re-triggered
    setTimeout(() => setShakeBox(false), 500);
  };

  const getDestination = (rol, requestedPath) => {
    if (requestedPath && requestedPath !== '/login') return requestedPath;
    if (rol === 'admin_ecommerce') return '/admin/ecommerce';
    if (rol === 'admin' || rol === 'staff') return '/';
    return '/mis-tickets';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        setUsuario(data.usuario);
        const destination = getDestination(data.usuario.rol, location.state?.from?.pathname);
        navigate(destination, { replace: true });
      } else {
        setError(data.error || 'Credenciales inválidas');
        triggerErrorAnimations();
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
      triggerErrorAnimations();
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError('');
      const loginResponse = await instance.loginPopup(loginRequest);
      const email = loginResponse.account.username;
      const nombre = loginResponse.account.name;

      // Validar con el backend (usando el mismo mecanismo de sesiones por ahora)
      const response = await fetch(`${API_BASE_URL}/api/login-microsoft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre })
      });
      const data = await response.json();

      if (response.ok) {
        setUsuario(data.usuario);
        const destination = getDestination(data.usuario.rol, location.state?.from?.pathname);
        navigate(destination, { replace: true });
      } else {
        setError(data.error || 'Acceso denegado con Microsoft.');
        triggerErrorAnimations();
      }
    } catch (err) {
      console.error(err);
      setError('Error durante la autenticación con Microsoft.');
      triggerErrorAnimations();
    }
  };

  const loginCfg = branding?.login || {};
  const avatarType = loginCfg.avatarType || 'berto_svg';
  const customAvatarImg = loginCfg.avatarImageUrl
    ? (loginCfg.avatarImageUrl.startsWith('http') || loginCfg.avatarImageUrl.startsWith('data:')
        ? loginCfg.avatarImageUrl
        : `${API_BASE_URL}${loginCfg.avatarImageUrl}`)
    : '';

  const customBgImg = loginCfg.customBackgroundImage
    ? (loginCfg.customBackgroundImage.startsWith('http') || loginCfg.customBackgroundImage.startsWith('data:')
        ? loginCfg.customBackgroundImage
        : `${API_BASE_URL}${loginCfg.customBackgroundImage}`)
    : '';

  const backgroundStyle = loginCfg.backgroundStyle || 'default_gradient';
  const containerCustomStyle = {
    position: 'relative'
  };

  if (backgroundStyle === 'custom_image' && customBgImg) {
    containerCustomStyle.backgroundImage = `url(${customBgImg})`;
    containerCustomStyle.backgroundSize = 'cover';
    containerCustomStyle.backgroundPosition = 'center';
    containerCustomStyle.backgroundRepeat = 'no-repeat';
  } else if (backgroundStyle === 'deep_blue') {
    containerCustomStyle.background = 'linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9ee0 100%)';
  } else if (backgroundStyle === 'dark_slate') {
    containerCustomStyle.background = 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)';
  }

  const btnGradStart = loginCfg.buttonGradientStart || '#0fa4de';
  const btnGradEnd = loginCfg.buttonGradientEnd || '#0284c7';

  return (
    <div className="login-container" style={containerCustomStyle}>
      {/* Botón flotante para cambiar el tema */}
      {loginCfg.showThemeToggle !== false && (
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100
          }}
          title="Cambiar Tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      )}

      <div className={`login-box ${shakeBox ? 'shake-box' : ''}`}>

        {/* Dynamic Avatar / Logo Customizer */}
        {avatarType === 'berto_svg' && (
          <BertoAvatar state={avatarState} />
        )}

        {avatarType === 'custom_image' && customAvatarImg && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div style={{
              width: `${loginCfg.avatarSize || 120}px`,
              height: `${loginCfg.avatarSize || 120}px`,
              borderRadius: loginCfg.avatarShape === 'circle' ? '50%' : loginCfg.avatarShape === 'rounded' ? '18px' : '0px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}>
              <img
                src={customAvatarImg}
                alt="Logo Login"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}

        {avatarType === 'preset_icon' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.12) 0%, rgba(2, 132, 199, 0.06) 100%)',
              border: '1.5px solid rgba(15, 164, 222, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px -6px rgba(15, 164, 222, 0.22)',
              color: 'var(--primary, #0fa4de)',
              backdropFilter: 'blur(8px)'
            }}>
              <BrandingVectorIcon 
                name={loginCfg.avatarIcon || 'building'} 
                size={44} 
                color="var(--primary, #0fa4de)" 
                strokeWidth={1.9} 
              />
            </div>
          </div>
        )}

        <h1>{loginCfg.title || 'DACAS Portal de Gestión'}</h1>
        <p>{loginCfg.subtitle || 'Inicia sesión para acceder al sistema'}</p>

        {error && (
          <div className="error-alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              placeholder={loginCfg.emailPlaceholder || 'tu@correo.com'}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleInputChange(e, setPassword)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              placeholder={loginCfg.passwordPlaceholder || '••••••••'}
            />
          </div>
          <button
            type="submit"
            className="btn-submit"
            style={{
              background: `linear-gradient(135deg, ${btnGradStart} 0%, ${btnGradEnd} 100%)`,
              boxShadow: `0 4px 15px ${btnGradStart}40`
            }}
          >
            {loginCfg.submitButtonText || 'Ingresar'}
          </button>
        </form>

        {loginCfg.showShopLink !== false && (
          <div style={{ marginTop: '14px', textAlign: 'center', width: '100%' }}>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              style={{
                background: 'transparent',
                border: 'none',
                color: btnGradStart,
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px'
              }}
            >
              {loginCfg.shopLinkText || '🛍️ Ir a la Tienda DACAS Shop'}
            </button>
          </div>
        )}

        {loginCfg.showMicrosoftLogin !== false && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button
              onClick={handleMicrosoftLogin}
              style={{ width: '100%', background: '#0078d4', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.462 0H0v7.462h7.462V0zM16 0H8.538v7.462H16V0zM7.462 8.538H0V16h7.462V8.538zM16 8.538H8.538V16H16V8.538z" />
              </svg>
              {loginCfg.microsoftButtonText || 'Iniciar sesión con Microsoft'}
            </button>
          </div>
        )}

        {loginCfg.footerText && (
          <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
            {loginCfg.footerText}
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;
