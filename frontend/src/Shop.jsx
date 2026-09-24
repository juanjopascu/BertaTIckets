import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

/* ─── High-Tech Mock Products (DACAS Catalog & Solutions) ─── */
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Firewall Next-Gen Enterprise FortiGate 60F',
    brand: 'Fortinet',
    description: '<p>Protección contra amenazas de alto rendimiento para redes corporativas medianas y grandes. Incluye control de aplicaciones, filtrado web avanzado, VPN IPSec/SSL de alta velocidad y detección por IA de intrusiones en tiempo real.</p><ul><li>Rendimiento IPS: 1.4 Gbps</li><li>Conexiones concurrentes: 700,000</li><li>Puertos: 10 x GE RJ45</li></ul>',
    price: 850,
    promotional_price: 765,
    stock: 24,
    badge: 'MÁS VENDIDO',
    badgeColor: '#0fa4de',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'ciberseguridad',
    sku: 'FG-60F-BDL',
    weight: '1.2',
    width: '21.6',
    depth: '16.0',
    height: '3.8'
  },
  {
    id: 2,
    name: 'Switch Gestionable Gigabit 24 Puertos PoE+ Cisco Catalyst',
    brand: 'Cisco',
    description: '<p>Switch empresarial capa 2/3 con capacidad de alimentación PoE+ de 370W. Ideal para infraestructura de cámaras IP, puntos de acceso Wi-Fi y telefonía VoIP con gestión centralizada en la nube.</p><ul><li>Puertos: 24 x 10/100/1000 Mbps PoE+</li><li>Uplinks: 4 x 10G SFP+</li><li>Capacidad de conmutación: 128 Gbps</li></ul>',
    price: 1290,
    promotional_price: 1199,
    stock: 15,
    badge: 'DESTACADO',
    badgeColor: '#10b981',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'networking',
    sku: 'CAT-24P-POE',
    weight: '4.5',
    width: '44.5',
    depth: '30.2',
    height: '4.4'
  },
  {
    id: 3,
    name: 'Punto de Acceso Wi-Fi 6 Mesh Enterprise Ubiquiti UniFi Pro',
    brand: 'Ubiquiti',
    description: '<p>Access Point de techo para alta densidad de clientes. Ofrece velocidades agregadas de hasta 5.3 Gbps en bandas de 2.4 GHz y 5 GHz con roaming transparente y análisis RF en tiempo real.</p><ul><li>Estándar: 802.11ax Wi-Fi 6</li><li>Cobertura: Hasta 140 m²</li><li>Conexión simultánea: +300 usuarios</li></ul>',
    price: 240,
    promotional_price: null,
    stock: 40,
    badge: 'NUEVO',
    badgeColor: '#38bdf8',
    image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'wifi',
    sku: 'U6-PRO-AP',
    weight: '0.8',
    width: '19.7',
    depth: '19.7',
    height: '3.5'
  },
  {
    id: 4,
    name: 'Servidor Rack 1U Dell PowerEdge Intel Xeon 16-Core',
    brand: 'Dell Technologies',
    description: '<p>Servidor empresarial de alta eficiencia energética para virtualización, bases de datos y servicios en la nube híbrida. Equipado con doble fuente redundante y controladora iDRAC9 Enterprise.</p><ul><li>Procesador: Intel Xeon Silver 4314 (16C/32T)</li><li>Memoria: 64GB DDR4 ECC RDIMM (Expandible a 1TB)</li><li>Almacenamiento: 2 x 960GB SSD Enterprise NVMe</li></ul>',
    price: 3450,
    promotional_price: 3200,
    stock: 8,
    badge: 'ENTERPRISE',
    badgeColor: '#6366f1',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'servidores',
    sku: 'PE-R450-SRV',
    weight: '16.5',
    width: '48.2',
    depth: '60.5',
    height: '4.3'
  },
  {
    id: 5,
    name: 'Licencia Anual Ciberseguridad Cloud & Endpoint Protection',
    brand: 'Fortinet',
    description: '<p>Suscripción anual por usuario con protección avanzada contra Ransomware, EDR (Endpoint Detection and Response), filtrado DNS y sandboxing en la nube de nivel corporativo.</p>',
    price: 65,
    promotional_price: null,
    stock: 999,
    badge: 'DIGITAL',
    badgeColor: '#f59e0b',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'licencias',
    sku: 'LIC-EDR-ANNUAL',
    weight: '0',
    width: '0',
    depth: '0',
    height: '0'
  },
  {
    id: 6,
    name: 'Ticket DACAS Tech Summit & Ciberseguridad 2026',
    brand: 'Dacas',
    description: '<p>Pase VIP exclusivo para la cumbre anual de tecnología y ciberseguridad DACAS. Incluye acceso a keynotes ejecutivas, acreditación para laboratorios prácticos, almuerzo ejecutivo y kit oficial.</p>',
    price: 150,
    promotional_price: 135,
    stock: 50,
    badge: 'EVENTO',
    badgeColor: '#0fa4de',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492539438225-2178229c92cc?q=80&w=1000&auto=format&fit=crop'
    ],
    category: 'tickets',
    sku: 'EVT-DACAS-2026',
    weight: '0.2',
    width: '10.0',
    depth: '15.0',
    height: '0.1'
  }
];

const CATEGORIES = [
  { key: 'all', label: 'Todos los productos', icon: '🛒' },
  { key: 'networking', label: 'Networking & Switches', icon: '🌐' },
  { key: 'ciberseguridad', label: 'Ciberseguridad & Firewalls', icon: '🔒' },
  { key: 'wifi', label: 'Wi-Fi & Wireless', icon: '📶' },
  { key: 'servidores', label: 'Servidores & Cloud', icon: '💻' },
  { key: 'licencias', label: 'Licencias & Software', icon: '🔑' },
  { key: 'tickets', label: 'Tickets & Eventos', icon: '🎫' },
];

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dacas_shop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedId, setAddedId] = useState(null);
  
  // Modal de detalles de producto y carrusel
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cliente Auth & Registro B2B
  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_client_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    razon_social: '',
    tipo_cliente: 'Integrador IT / Reseller',
    phone: '',
    numero_nit: '',
    country_id: '1',
    ciudad: '',
    direccion_legal: ''
  });

  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCountries();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/countries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      }
    } catch (_) {}
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar solicitud de registro');
      }

      setAuthSuccessMessage({
        title: '¡Solicitud de Registro Enviada con Éxito!',
        body: 'Su solicitud de alta de cuenta ha sido recibida por el equipo de administración de DACAS. Una vez revisada y activada su cuenta por un administrador, se le habilitará el acceso y lista de precios mayorista.',
        email: authForm.email,
        company: authForm.razon_social || authForm.name
      });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Login exitoso
      localStorage.setItem('dacas_client_user', JSON.stringify(data.user));
      localStorage.setItem('dacas_client_token', data.token);
      setClientUser(data.user);
      setAuthModalOpen(false);
      setAuthForm({ ...authForm, password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dacas_client_user');
    localStorage.removeItem('dacas_client_token');
    setClientUser(null);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [clientUser]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('dacas_client_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/products`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize images property
          const normalized = data.map(p => ({
            ...p,
            images: Array.isArray(p.images) && p.images.length > 0 
              ? p.images 
              : (p.image_url ? [p.image_url] : [])
          }));
          setProducts(normalized);
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    
    // Fallback to rich DACAS mock with lock simulation if no clientUser
    const token = localStorage.getItem('dacas_client_token');
    if (!token) {
      setProducts(MOCK_PRODUCTS.map(p => ({ ...p, price: null, promotional_price: null, is_locked: true })));
    } else {
      setProducts(MOCK_PRODUCTS);
    }
    setLoading(false);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const qtyToAdd = parseInt(quantity, 10) || 1;
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i);
      }
      return [...prev, { ...product, qty: qtyToAdd }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q));
    const matchCat = activeCategory === 'all' || (p.category === activeCategory);
    return matchSearch && matchCat;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ── Top Announcement Bar ── */}
      <div style={{ background: '#071524', color: '#94A3B8', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid rgba(15, 164, 222, 0.15)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🇦🇷</span>
            <span><strong>DACAS Mayorista Oficial</strong> · Envíos asegurados y distribución regional de valor agregado</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: '#0fa4de', fontWeight: '600' }}>📞 Soporte Preventa IT</span>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: '#E2E8F0', textDecoration: 'none', fontWeight: '600' }}>
              Portal Admin →
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Header ── */}
      <header style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '72px', gap: '24px' }}>
          
          {/* Logo DACAS Shop */}
          <div onClick={() => navigate('/shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              padding: '6px 14px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span>DACAS</span>
            </div>
            <div>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#071524' }}>
                Shop <span style={{ color: '#0fa4de', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise</span>
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form style={{ flex: 1, minWidth: 0, position: 'relative' }} onSubmit={(e) => e.preventDefault()}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Buscar productos por modelo, SKU, tecnología, marca..."
              aria-label="Buscar"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '999px',
                border: '1.5px solid #CBD5E1',
                padding: '0 52px 0 20px',
                fontSize: '14px',
                color: '#0F172A',
                outline: 'none',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0fa4de';
                e.target.style.boxShadow = '0 0 0 4px rgba(15, 164, 222, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#CBD5E1';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
          </form>

          {/* Client Account / B2B Login Trigger */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={userMenuRef}>
            {clientUser ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    cursor: 'pointer',
                    color: '#166534',
                    padding: '6px 14px 6px 8px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '800',
                    overflow: 'hidden'
                  }}>
                    {clientUser.avatar_url ? (
                      <img src={clientUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>🏢</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '800', fontSize: '13px', color: '#071524' }}>
                      {clientUser.razon_social || clientUser.name}
                    </div>
                  </div>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontWeight: '800'
                  }}>
                    B2B
                  </span>
                  <span style={{ fontSize: '10px', color: '#166534' }}>▼</span>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '290px',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    border: '1px solid #E2E8F0',
                    zIndex: 200,
                    padding: '16px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '20px',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {clientUser.avatar_url ? (
                          <img src={clientUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>🏢</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Cliente Mayorista Activo</div>
                        <div style={{ fontWeight: '800', color: '#071524', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {clientUser.razon_social || clientUser.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0fa4de', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {clientUser.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          color: '#0369A1',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <span>📊</span>
                        <span>Mi Portal de Cliente B2B</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <span>📦</span>
                        <span>Mis Compras y Estado</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/shop/portal'); }}
                        style={{
                          width: '100%',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left'
                        }}
                      >
                        <span>🏢</span>
                        <span>Mi Ficha & Solicitar Cambios</span>
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🚪</span> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAuthError(null); setAuthSuccessMessage(null); setAuthModalOpen(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #0fa4de',
                  cursor: 'pointer',
                  color: '#0fa4de',
                  padding: '9px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(15, 164, 222, 0.12)'
                }}
              >
                <span>👤</span>
                <span>Mi Cuenta / Registro</span>
              </button>
            )}
          </div>

          {/* Cart Trigger */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={cartRef}>
            <button
              id="cart-toggle-btn"
              onClick={() => setCartOpen(!cartOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: cartCount > 0 ? '#E0F2FE' : '#F1F5F9',
                border: '1px solid',
                borderColor: cartCount > 0 ? '#BAE6FD' : '#E2E8F0',
                cursor: 'pointer',
                color: '#071524',
                padding: '10px 16px',
                borderRadius: '999px',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0fa4de" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '-9px',
                    background: '#0fa4de',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '800',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(15, 164, 222, 0.4)'
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ color: '#071524', fontWeight: '800' }}>${cartTotal.toFixed(2)}</span>
            </button>

            {/* Cart Dropdown */}
            {cartOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '380px',
                background: '#fff',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                border: '1px solid #E2E8F0',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'slideDown 0.2s ease-out'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', fontWeight: '800', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Mi Carrito</span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{cartCount} {cartCount === 1 ? 'producto' : 'productos'}</span>
                </div>
                
                <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '12px 20px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Tu carrito está vacío</p>
                    </div>
                  ) : cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#071524' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Cant: <strong>{item.qty}</strong> · <span style={{ color: '#0fa4de', fontWeight: '700' }}>${(parseFloat(item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '18px', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontWeight: '800', fontSize: '16px', color: '#071524' }}>
                      <span>Subtotal estimado:</span>
                      <span style={{ color: '#0fa4de' }}>${cartTotal.toFixed(2)} USD</span>
                    </div>
                    <button 
                      onClick={() => navigate('/shop/checkout')}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '13px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      Iniciar Compra Segura →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Category Navigation Bar ── */}
      <nav style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.2)', position: 'sticky', top: '72px', zIndex: 99 }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '48px', gap: '8px', overflowX: 'auto' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: activeCategory === cat.key ? '#FFFFFF' : '#94A3B8',
                background: activeCategory === cat.key ? '#0fa4de' : 'transparent',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: activeCategory === cat.key ? '0 2px 10px rgba(15, 164, 222, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => { if (activeCategory !== cat.key) e.currentTarget.style.background = '#12354c'; }}
              onMouseLeave={(e) => { if (activeCategory !== cat.key) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero Banner DACAS ── */}
      <div style={{
        background: 'linear-gradient(135deg, #071524 0%, #0f2742 60%, #12354c 100%)',
        color: '#fff',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de fondo */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(15,164,222,0.22) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 164, 222, 0.15)',
              border: '1px solid rgba(15, 164, 222, 0.4)',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: '700',
              padding: '6px 14px',
              borderRadius: '999px',
              marginBottom: '18px',
              letterSpacing: '0.05em'
            }}>
              <span>🛡️</span> DISTRIBUIDOR MAYORISTA DE VALOR AGREGADO
            </div>
            <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Equipamiento IT, Redes <br />
              <span style={{ color: '#0fa4de' }}>& Ciberseguridad Enterprise</span>
            </h1>
            <p style={{ margin: '0 0 28px', color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px' }}>
              Hardware empresarial de alta disponibilidad, licencias oficiales y soluciones completas para integradores y canales con respaldo técnico oficial.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveCategory('networking')}
                style={{
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 28px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(15, 164, 222, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                Ver Networking & Switches
              </button>
              <button
                onClick={() => setActiveCategory('ciberseguridad')}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(15, 164, 222, 0.3)',
                  borderRadius: '999px',
                  padding: '14px 28px',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 164, 222, 0.18)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                Ciberseguridad & Firewalls
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { value: '+25 Años', label: 'Liderazgo Regional' },
              { value: '100% Oficial', label: 'Garantía de Fábrica' },
              { value: '24/7', label: 'Soporte Técnico' }
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(15, 39, 66, 0.7)', border: '1px solid rgba(15, 164, 222, 0.25)', borderRadius: '20px', padding: '24px 28px', minWidth: '110px' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0fa4de' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', fontWeight: '600' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Catalog Grid ── */}
      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '48px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#071524' }}>
              {CATEGORIES.find(c => c.key === activeCategory)?.label}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
              Haz clic en cualquier producto para ver su ficha técnica completa y galería multimedia.
            </p>
          </div>
          {search && (
            <button onClick={() => setSearch('')} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '999px', padding: '8px 16px', color: '#071524', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              Limpiar búsqueda ×
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <p style={{ fontWeight: '600' }}>Cargando catálogo de productos DACAS...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No encontramos coincidencias</h3>
            <p style={{ margin: 0, color: '#64748B' }}>No se encontraron productos para "<strong>{search}</strong>"</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '26px' }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                clientUser={clientUser}
                onOpenAuth={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                onSelectProduct={() => setSelectedProduct(product)}
                onAddToCart={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                justAdded={addedId === product.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Trust & Quality Badges ── */}
      <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: '30px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔒', title: 'Distribución Segura', sub: 'Certificación y trazabilidad garantizada' },
            { icon: '📦', title: 'Stock en Tiempo Real', sub: 'Disponibilidad inmediata para despachos' },
            { icon: '🛡️', title: 'Garantía Oficial', sub: 'Respaldo directo de fabricantes' },
            { icon: '🤝', title: 'Atención a Canales', sub: 'Precios preferenciales para integradores' },
          ].map((b) => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '28px' }}>{b.icon}</span>
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#071524' }}>{b.title}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: '#071524', color: '#94A3B8', textAlign: 'center', padding: '32px 20px', fontSize: '13px', borderTop: '1px solid rgba(15, 164, 222, 0.15)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.1rem' }}>DACAS <span style={{ color: '#0fa4de' }}>Shop</span></span>
            <span>· Mayorista de Valor Agregado en Tecnología & Ciberseguridad</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} DACAS Argentina · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* ── MODAL POP-UP CON DETALLES & CARRUSEL DE FOTOS ── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          clientUser={clientUser}
          onOpenAuth={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => addToCart(product, qty)}
        />
      )}

      {/* ── MODAL DE REGISTRO B2B Y LOGIN DE CLIENTES ── */}
      {authModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => { setAuthModalOpen(false); setAuthError(null); setAuthSuccessMessage(null); }}
          authForm={authForm}
          setAuthForm={setAuthForm}
          onRegisterSubmit={handleRegisterSubmit}
          onLoginSubmit={handleLoginSubmit}
          error={authError}
          success={authSuccessMessage}
          loading={authLoading}
          countries={countries}
        />
      )}
    </div>
  );
}

/* ── Product Card Component ── */
function ProductCard({ product, clientUser, onOpenAuth, onSelectProduct, onAddToCart, justAdded }) {
  const [hovered, setHovered] = useState(false);
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);
  const mainImage = images[0] || product.image_url;
  const isLocked = !clientUser || product.is_locked || product.price === null || product.price === undefined;

  return (
    <div
      onClick={onSelectProduct}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: hovered ? '#0fa4de' : '#E2E8F0',
        boxShadow: hovered ? '0 16px 36px rgba(15, 164, 222, 0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#F8FAFC' }}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#94A3B8' }}>📦</div>
        )}

        {/* Badge */}
        {product.badge && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: product.badgeColor || '#0fa4de',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '999px',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {product.badge}
          </span>
        )}

        {/* Multiple Photos indicator */}
        {images.length > 1 && (
          <span style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(7, 21, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📷 {images.length}
          </span>
        )}

        {/* Stock warning */}
        {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '999px'
          }}>
            ¡Últimos {product.stock}!
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {product.brand && (
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              background: '#E0F2FE',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {product.brand}
            </span>
          )}
          {product.sku && (
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.04em' }}>
              SKU: {product.sku}
            </span>
          )}
          {product.applied_rule && (
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              background: '#DCFCE7',
              color: '#166534',
              border: '1px solid #BBF7D0',
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>🏷️</span>
              <span>{product.applied_rule.rule_name || product.applied_rule.name || 'Descuento B2B'}</span>
              {product.discount_percent && <span>(-{product.discount_percent}%)</span>}
            </span>
          )}
        </div>

        <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '800', color: '#071524', lineHeight: 1.35 }}>
          {product.name}
        </h3>

        <div
          style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: '#64748B',
            lineHeight: 1.5,
            flex: 1,
            maxHeight: '44px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.description ? product.description.replace(/<[^>]+>/g, ' ').substring(0, 90) + '...' : ''}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          {isLocked ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontSize: '13px', fontWeight: '800' }}>
                <span>🔒</span> Precio B2B Exclusivo
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                Accedé como canal autorizado
              </span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#071524' }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>USD</span>
              </div>
              {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ${product.base_price} USD
                  </span>
                  <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                    -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}%
                  </span>
                </div>
              ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                  ${product.promotional_price} USD
                </span>
              ) : null}
            </div>
          )}

          {isLocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              style={{
                background: 'linear-gradient(135deg, #071524, #0f2742)',
                color: '#38bdf8',
                border: '1px solid rgba(15, 164, 222, 0.3)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(7,21,36,0.2)'
              }}
            >
              <span>🔒</span> Ver Precio B2B
            </button>
          ) : (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={onAddToCart}
              style={{
                background: justAdded ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #0fa4de, #0284c7)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: justAdded ? '0 4px 14px rgba(16,185,129,0.4)' : '0 4px 14px rgba(15,164,222,0.3)',
              }}
            >
              {justAdded ? '✓ Agregado' : '+ Agregar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── POP-UP MODAL WITH INTERACTIVE PHOTO CAROUSEL & DETAILS ─── */
function ProductDetailModal({ product, clientUser, onOpenAuth, onClose, onAddToCart }) {
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isLocked = !clientUser || product.is_locked || product.price === null || product.price === undefined;

  // Keyboard navigation (Escape to close, Arrows to cycle images)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (images.length > 1) {
        if (e.key === 'ArrowRight') setActiveImageIdx(prev => (prev + 1) % images.length);
        if (e.key === 'ArrowLeft') setActiveImageIdx(prev => (prev - 1 + images.length) % images.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 21, 36, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            fontSize: '18px',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
        >
          ✕
        </button>

        {/* 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', padding: '36px' }}>
          
          {/* LEFT COLUMN: CAROUSEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Main Image Viewer */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '360px',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {images.length > 0 ? (
                <img
                  src={images[activeImageIdx]}
                  alt={`${product.name} - Vista ${activeImageIdx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.25s ease-in-out'
                  }}
                />
              ) : (
                <div style={{ fontSize: '64px', color: '#CBD5E1' }}>📦</div>
              )}

              {/* Navigation Arrows (if > 1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    title="Foto anterior"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      fontSize: '20px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    ‹
                  </button>

                  <button
                    onClick={handleNextImage}
                    title="Foto siguiente"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      fontSize: '20px',
                      color: '#071524',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    ›
                  </button>

                  {/* Photo Index Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(7, 21, 36, 0.75)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {activeImageIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 0' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: activeImageIdx === idx ? '#0fa4de' : '#E2E8F0',
                      boxShadow: activeImageIdx === idx ? '0 0 0 3px rgba(15,164,222,0.2)' : 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      background: '#F8FAFC'
                    }}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Dimensions & Specs Card */}
            {(product.weight || product.width || product.sku) && (
              <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', marginTop: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#071524', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  ⚙️ Especificaciones Físicas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  {product.brand && <div><strong>Marca:</strong> {product.brand}</div>}
                  {product.sku && <div><strong>SKU:</strong> {product.sku}</div>}
                  {product.weight && parseFloat(product.weight) > 0 && <div><strong>Peso:</strong> {product.weight} kg</div>}
                  {product.width && parseFloat(product.width) > 0 && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Dimensiones:</strong> {product.depth || 0} x {product.width} x {product.height || 0} cm
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS & ADD TO CART */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header tags */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
              {product.brand && (
                <span style={{
                  background: '#E0F2FE',
                  color: '#0369a1',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {product.brand}
                </span>
              )}

              <span style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                DACAS CERTIFIED
              </span>

              {product.stock !== undefined && (
                <span style={{
                  background: product.stock > 0 ? '#DCFCE7' : '#FEE2E2',
                  color: product.stock > 0 ? '#166534' : '#991B1B',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}>
                  {product.stock > 0 ? `✓ En Stock (${product.stock} disp.)` : '✕ Agotado'}
                </span>
              )}
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: '1.65rem', fontWeight: '900', color: '#071524', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            {/* Price Box */}
            {isLocked ? (
              <div style={{ margin: '14px 0 20px', padding: '18px 20px', background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', borderRadius: '16px', border: '1px solid #BAE6FD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '24px' }}>🔒</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#0369a1' }}>
                    Precios B2B Exclusivos para Canales DACAS
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#0284c7', lineHeight: 1.5 }}>
                  Los precios y condiciones comerciales se calculan en base a tu <strong>Tipo de Cliente</strong>, <strong>País de operación</strong> y <strong>Marca del fabricante</strong>.
                </p>
              </div>
            ) : (
              <div style={{ margin: '14px 0 20px', padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#071524' }}>
                    ${product.price}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>USD</span>

                  {product.base_price && parseFloat(product.base_price) > parseFloat(product.price) ? (
                    <>
                      <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        ${product.base_price} USD
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        -{product.discount_percent || Math.round((1 - product.price / product.base_price) * 100)}% B2B
                      </span>
                    </>
                  ) : product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.price) ? (
                    <>
                      <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        ${product.promotional_price} USD
                      </span>
                      <span style={{ background: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        OFERTA
                      </span>
                    </>
                  ) : null}
                </div>

                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                  🏢 Tarifa aplicada para <strong>{clientUser?.tipo_cliente || 'Integrador'}</strong> · 🌎 {clientUser?.pais || 'Argentina'} · 🏷️ {product.brand || 'Dacas'}
                </div>
              </div>
            )}

            {/* Description rendered as Rich HTML */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#071524', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Descripción del Producto
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.65',
                  color: '#475569',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '<p>Sin descripción detallada.</p>') }}
              />
            </div>

            {/* Action Area: Locked vs Logged-In Button */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
              {isLocked ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #071524 0%, #0f2742 100%)',
                    color: '#38bdf8',
                    border: '1px solid rgba(15, 164, 222, 0.4)',
                    borderRadius: '14px',
                    padding: '16px 24px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(7, 21, 36, 0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🔐</span> Iniciar Sesión / Solicitar Cuenta B2B para Comprar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '12px', padding: '4px', border: '1px solid #CBD5E1' }}>
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      style={{ width: '36px', height: '36px', background: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', color: '#071524' }}
                    >
                      -
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: '#071524' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => (product.stock ? Math.min(product.stock, prev + 1) : prev + 1))}
                      style={{ width: '36px', height: '36px', background: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', color: '#071524' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    style={{
                      flex: 1,
                      background: added ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '14px 24px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: added ? '0 4px 15px rgba(16,185,129,0.4)' : '0 4px 15px rgba(15,164,222,0.4)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {added ? '✓ ¡Agregado al Carrito!' : `🛒 Agregar al Carrito · $${(parseFloat(product.price || 0) * quantity).toFixed(2)}`}
                  </button>
                </div>
              )}

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', justifyContent: 'center' }}>
                <span>🛡️ Garantía oficial DACAS</span>
                <span>·</span>
                <span>⚡ Despacho inmediato</span>
                <span>·</span>
                <span>📋 Facturación A/B oficial</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── MODAL DE AUTENTICACIÓN & REGISTRO DE CLIENTES B2B ─── */
function AuthModal({
  mode,
  setMode,
  onClose,
  authForm,
  setAuthForm,
  onRegisterSubmit,
  onLoginSubmit,
  error,
  success,
  loading,
  countries
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 21, 36, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: mode === 'register' ? '640px' : '440px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            fontWeight: 'bold',
            fontSize: '16px',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.background = '#E2E8F0'; e.target.style.color = '#0F172A'; }}
          onMouseLeave={(e) => { e.target.style.background = '#F1F5F9'; e.target.style.color = '#64748B'; }}
        >
          ✕
        </button>

        <div style={{ padding: '28px 32px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#fff',
              fontWeight: '900',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '16px',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(15,164,222,0.3)'
            }}>
              DACAS Enterprise
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#071524' }}>
              {mode === 'register' ? 'Solicitud de Cuenta de Cliente B2B' : 'Acceso a Clientes y Distribuidores'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
              {mode === 'register'
                ? 'Regístrese para acceder a precios mayoristas y soporte técnico oficial'
                : 'Inicie sesión con sus credenciales autorizadas'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📝 Solicitar Registro
            </button>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#071524' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              🔐 Iniciar Sesión
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: '1.5'
            }}>
              <strong>⚠️ Atención:</strong> {error}
            </div>
          )}

          {/* Success Banner (For registration request) */}
          {success ? (
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px', color: '#166534', fontSize: '18px', fontWeight: '800' }}>
                {success.title}
              </h3>
              <p style={{ margin: '0 0 16px', color: '#15803D', fontSize: '13.5px', lineHeight: '1.6' }}>
                {success.body}
              </p>
              
              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #DCFCE7', fontSize: '12.5px', color: '#475569', marginBottom: '18px', textAlign: 'left' }}>
                <div><strong>Empresa:</strong> {success.company}</div>
                <div><strong>Email:</strong> {success.email}</div>
                <div><strong>Estado:</strong> <span style={{ color: '#D97706', fontWeight: '700' }}>🟡 Pendiente de Aprobación por Administrador</span></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setMode('login'); }}
                  style={{
                    flex: 1,
                    background: '#0fa4de',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Ir a Iniciar Sesión
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            /* ── REGISTRATION FORM ── */
            <div>
              {/* B2B Info Box */}
              <div style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
                border: '1px solid #BAE6FD',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <div style={{ fontSize: '12.5px', color: '#0369A1', lineHeight: '1.5' }}>
                  <strong>Distribución Mayorista Exclusiva:</strong> Por políticas comerciales de DACAS, cada solicitud de registro es revisada por nuestro equipo de administración para habilitarle la cuenta, condiciones de pago y lista de precios oficial.
                </div>
              </div>

              <form onSubmit={onRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Nombre de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Gómez"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Razón Social / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Redes & IT Solutions S.A."
                      value={authForm.razon_social}
                      onChange={e => setAuthForm({ ...authForm, razon_social: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Email Corporativo (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contacto@empresa.com"
                      value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+54 11 4444-5555"
                      value={authForm.phone}
                      onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      CUIT / RUT / NIT Fiscal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="30-12345678-9"
                      value={authForm.numero_nit}
                      onChange={e => setAuthForm({ ...authForm, numero_nit: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Tipo de Cliente / Actividad
                    </label>
                    <select
                      value={authForm.tipo_cliente}
                      onChange={e => setAuthForm({ ...authForm, tipo_cliente: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      <option value="Integrador IT / Reseller">Integrador IT / Reseller</option>
                      <option value="Proveedor de Internet (ISP / WISP)">Proveedor de Internet (ISP / WISP)</option>
                      <option value="Consultora IT / Ciberseguridad">Consultora IT / Ciberseguridad</option>
                      <option value="Empresa Corporativa">Empresa Corporativa</option>
                      <option value="Organismo Público">Organismo Público</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      País
                    </label>
                    <select
                      value={authForm.country_id}
                      onChange={e => setAuthForm({ ...authForm, country_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {countries && countries.length > 0 ? (
                        countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      ) : (
                        <option value="1">Argentina</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Ciudad / Localidad
                    </label>
                    <input
                      type="text"
                      placeholder="Buenos Aires, Córdoba..."
                      value={authForm.ciudad}
                      onChange={e => setAuthForm({ ...authForm, ciudad: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                    Contraseña para su cuenta *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '10px',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Enviando Solicitud...' : '📨 Enviar Solicitud de Registro B2B'}
                </button>
              </form>
            </div>
          ) : (
            /* ── LOGIN FORM ── */
            <form onSubmit={onLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@empresa.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(15,164,222,0.35)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Validando...' : 'Ingresar a mi Cuenta B2B →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#64748B' }}>
                ¿Aún no tiene cuenta habilitada?{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setMode('register'); }}
                  style={{ color: '#0fa4de', fontWeight: '700', textDecoration: 'none' }}
                >
                  Solicite su alta aquí
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

