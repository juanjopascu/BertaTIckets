import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from './ShopContext';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #00C4E0, #00ABC5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
  },
  logoText: { fontWeight: '800', fontSize: '1.1rem', color: '#1a1a2e' },
  title: { fontSize: '1.5rem', fontWeight: '900', color: '#1a1a2e', margin: '0 0 6px' },
  subtitle: { fontSize: '0.9rem', color: '#6B7280', margin: '0 0 28px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#111827',
    outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  btn: {
    width: '100%', padding: '13px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #00C4E0, #00ABC5)',
    color: '#fff', border: 'none', fontWeight: '700', fontSize: '15px',
    cursor: 'pointer', marginTop: '4px', transition: 'opacity 0.2s',
  },
  divider: { textAlign: 'center', color: '#9CA3AF', fontSize: '13px', margin: '20px 0', position: 'relative' },
  toggleLink: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' },
  errorBox: {
    background: '#fef2f2', color: '#dc2626', padding: '10px 14px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
  },
  successBox: {
    background: '#f0fdf4', color: '#16a34a', padding: '10px 14px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '16px',
  },
};

export default function ShopLogin() {
  const navigate = useNavigate();
  const { login, register } = useShop();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
      if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
      if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
        setSuccess('¡Cuenta creada! Redirigiendo...');
      }
      setTimeout(() => navigate('/shop'), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo} onClick={() => navigate('/shop')}>
          <div style={S.logoIcon}>🏢</div>
          <span style={S.logoText}>DACAS <span style={{ color: '#00ABC5' }}>Portal de Gestión</span></span>
        </div>

        <h1 style={S.title}>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h1>
        <p style={S.subtitle}>
          {mode === 'login'
            ? 'Ingresá a tu cuenta para comprar y gestionar tus pedidos.'
            : 'Registrate gratis para acceder a la tienda y hacer tu primera compra.'}
        </p>

        {error && <div style={S.errorBox}>⚠️ {error}</div>}
        {success && <div style={S.successBox}>✅ {success}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          {mode === 'register' && (
            <div>
              <label style={S.label}>Nombre completo *</label>
              <input
                id="shop-name"
                type="text"
                style={S.input}
                value={form.name}
                onChange={set('name')}
                placeholder="Juan Pérez"
                required
                onFocus={e => e.target.style.borderColor = '#00ABC5'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          )}

          <div>
            <label style={S.label}>Email *</label>
            <input
              id="shop-email"
              type="email"
              style={S.input}
              value={form.email}
              onChange={set('email')}
              placeholder="tu@email.com"
              required
              onFocus={e => e.target.style.borderColor = '#00ABC5'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div>
            <label style={S.label}>Contraseña *</label>
            <input
              id="shop-password"
              type="password"
              style={S.input}
              value={form.password}
              onChange={set('password')}
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              required
              onFocus={e => e.target.style.borderColor = '#00ABC5'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={S.label}>Confirmar contraseña *</label>
              <input
                id="shop-confirm-password"
                type="password"
                style={S.input}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repetí tu contraseña"
                required
                onFocus={e => e.target.style.borderColor = '#00ABC5'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          )}

          <button
            id="shop-submit-btn"
            type="submit"
            style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={S.toggleLink}>
          {mode === 'login' ? (
            <>¿No tenés cuenta? <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#00ABC5', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Registrate gratis →</button></>
          ) : (
            <>¿Ya tenés cuenta? <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#00ABC5', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Iniciar Sesión →</button></>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer' }}>
            ← Volver a la tienda sin cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
