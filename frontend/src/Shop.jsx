import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import BrandingVectorIcon from "./BrandingVectorIcon";
import { API_BASE_URL } from "./apiConfig";

import {
  MOCK_PRODUCTS,
  DACAS_COUNTRIES,
  CategoryIcon,
  BrandLogoImg,
  CATEGORIES,
  BRAND_INFO,
  CATEGORY_BRANDS_MAP,
  DISALLOWED_BRANDS
} from "./components/shop/shopCatalogData";

import AnimatedHeroStats, { HERO_SLIDES, ShopErrorBoundary } from "./components/shop/AnimatedHeroStats";
import ProductCard from "./components/shop/ProductCard";
import ProductCarousel from "./components/shop/ProductCarousel";
import BrandPromoBanners from "./components/shop/BrandPromoBanners";
import BrandsDirectoryView from "./components/shop/BrandsDirectoryView";
import ShopMacHelpHub from "./components/shop/ShopMacHelpHub";
import ProductDetailModal from "./components/shop/ProductDetailModal";
import ProductDetailPageView from "./components/shop/ProductDetailPageView";
import AuthModal from "./components/shop/AuthModal";

function ShopMain() {
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
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    try {
      return localStorage.getItem('dacas_selected_country') || 'AR';
    } catch {
      return 'AR';
    }
  });

  const selectedCountryObj = DACAS_COUNTRIES.find((c) => c.code === selectedCountryCode) || DACAS_COUNTRIES[1];

  const [visualSettings, setVisualSettings] = useState(null);

  const heroSlides = useMemo(() => {
    const raw = (visualSettings?.heroSlides && Array.isArray(visualSettings.heroSlides) && visualSettings.heroSlides.length > 0)
      ? visualSettings.heroSlides
      : HERO_SLIDES;
    return raw.map((s, idx) => ({
      ...s,
      id: s.id !== undefined && s.id !== null ? s.id : idx,
      metrics: (Array.isArray(s.metrics) && s.metrics.length > 0) ? s.metrics : [
        { value: '+25 Años', label: 'Liderando el Mercado IT' },
        { value: '12 Países', label: 'Cobertura Regional' },
        { value: '24/7', label: 'Soporte y Garantía Oficial' }
      ]
    }));
  }, [visualSettings]);

  const categories = useMemo(() => {
    if (visualSettings?.categories && Array.isArray(visualSettings.categories) && visualSettings.categories.length > 0) {
      return visualSettings.categories.filter(c => c.enabled !== false);
    }
    return CATEGORIES;
  }, [visualSettings]);

  const categoryBrandsMap = useMemo(() => {
    return visualSettings?.categoryBrands || CATEGORY_BRANDS_MAP;
  }, [visualSettings]);

  const announcement = visualSettings?.announcement || {
    enabled: true,
    text: 'Distribución Oficial y Soporte Certificado en 12 Países de América Latina y USA',
    badgeText: 'COBERTURA DACAS',
    link: '#paises'
  };

  const generalSettings = visualSettings?.general || {
    shopTitle: 'DACAS B2B Shop',
    shopSubtitle: 'Plataforma Corporativa de Soluciones IT, Ciberseguridad & Conectividad Enterprise',
    showCountryBar: true,
    contactPhone: '+54 11 4110-3300',
    contactEmail: 'ventas@dacas.com',
    whatsappNumber: '+5491141103300',
    headerBadge: 'DISTRIBUIDOR OFICIAL MAYORISTA',
    primaryColor: '#0fa4de'
  };

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const slideTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [isHeroHovered, heroSlides.length]);

  useEffect(() => {
    try {
      localStorage.setItem('dacas_shop_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [addedId, setAddedId] = useState(null);

  // Vistas principales: 'home' (Principal con carruseles y banners) | 'brands' (Directorio completo de marcas) | 'catalog' (Catálogo paginado)
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogSort, setCatalogSort] = useState('relevance');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandCatFilter, setBrandCatFilter] = useState('all');

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val && val.trim()) {
      setActiveNavTab('catalog');
      setCatalogPage(1);
    }
  };

  const handleGoHome = () => {
    setActiveNavTab('home');
    setSearch('');
    setSelectedBrand(null);
    setSelectedSubcategory(null);
    setActiveCategory('all');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBrands = () => {
    setActiveNavTab('brands');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoCatalog = (category = 'all', brand = null, subcategory = null) => {
    setActiveNavTab('catalog');
    setActiveCategory(category);
    setSelectedBrand(brand);
    setSelectedSubcategory(subcategory);
    setCatalogPage(1);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBrand = (brandName, subcategory = null) => {
    setSelectedBrand(brandName);
    setSelectedSubcategory(subcategory);
    setActiveCategory('all');
    setActiveNavTab('catalog');
    setCatalogPage(1);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado y navegación a la Página Dedicada de Producto
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
      setActiveNavTab('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('p', product.id);
        window.history.pushState({ productId: product.id }, '', url.toString());
      } catch (_) {}

      try {
        const token = localStorage.getItem('dacas_client_token');
        fetch(`${API_BASE_URL}/api/ecommerce/track/product-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            brand: product.brand,
            price: product.promotional_price || product.price,
            category: product.category,
            user: clientUser ? { nombre: clientUser.name, email: clientUser.email, rol: 'cliente' } : undefined
          })
        }).catch(() => { });
      } catch (_) { }
    }
  };

  const handleBackFromProduct = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
    setActiveNavTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cargar producto automáticamente si viene en URL ?p=ID
  useEffect(() => {
    if (!products || products.length === 0) return;
    try {
      const url = new URL(window.location.href);
      const pid = url.searchParams.get('p');
      if (pid) {
        const found = products.find(p => String(p.id) === String(pid));
        if (found) {
          setSelectedProduct(found);
          setActiveNavTab('product');
        }
      }
    } catch (_) {}
  }, [products]);

  // Manejar navegación con botones Atrás y Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      try {
        const url = new URL(window.location.href);
        const pid = url.searchParams.get('p');
        if (pid && products && products.length > 0) {
          const found = products.find(p => String(p.id) === String(pid));
          if (found) {
            setSelectedProduct(found);
            setActiveNavTab('product');
            return;
          }
        }
        if (activeNavTab === 'product') {
          setActiveNavTab('home');
        }
      } catch (_) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, activeNavTab]);


  // Cliente Auth & Registro B2B
  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Escuchar cambios de autenticación en tiempo real
  useEffect(() => {
    const handleAuthSync = () => {
      try {
        const saved = localStorage.getItem('dacas_client_user') || localStorage.getItem('shop_user');
        setClientUser(saved ? JSON.parse(saved) : null);
      } catch {
        setClientUser(null);
      }
    };
    window.addEventListener('storage', handleAuthSync);
    return () => window.removeEventListener('storage', handleAuthSync);
  }, []);

  const userCountryCode = (
    clientUser?.country_code ||
    (clientUser?.country_id === 4 ? 'CL' : clientUser?.country_id === 5 ? 'CO' : 'AR') ||
    'AR'
  ).toUpperCase();
  const userCountryObj = DACAS_COUNTRIES.find((c) => c.code === userCountryCode) || DACAS_COUNTRIES[1];

  const [showCountryBlockedModal, setShowCountryBlockedModal] = useState(false);
  const [attemptedCountry, setAttemptedCountry] = useState(null);

  // Sincronizar y forzar el país de la cuenta registrada si el cliente está logueado
  useEffect(() => {
    if (clientUser && userCountryCode) {
      if (selectedCountryCode !== userCountryCode) {
        setSelectedCountryCode(userCountryCode);
        try {
          localStorage.setItem('dacas_selected_country', userCountryCode);
          window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: userCountryCode } }));
        } catch {}
        fetchProducts(userCountryCode);
      }
    }
  }, [clientUser, userCountryCode, selectedCountryCode]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [clientTypes, setClientTypes] = useState([
    { id: 1, name: 'Integrador IT / Reseller' },
    { id: 2, name: 'Proveedor de Internet (ISP / WISP)' },
    { id: 3, name: 'Consultora IT / Ciberseguridad' },
    { id: 4, name: 'Empresa Corporativa' },
    { id: 5, name: 'Organismo Público' }
  ]);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    razon_social: '',
    tipo_cliente: 'Integrador IT / Reseller',
    phone: '',
    numero_nit: '',
    country_id: String(selectedCountryObj?.id || 2),
    country_code: selectedCountryCode || 'AR',
    ciudad: '',
    direccion_legal: ''
  });

  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (selectedCountryObj && selectedCountryObj.id) {
      setAuthForm(prev => ({
        ...prev,
        country_id: String(selectedCountryObj.id),
        country_code: selectedCountryObj.code
      }));
    }
  }, [selectedCountryObj]);

  useEffect(() => {
    fetchCountries();
    fetchClientTypes();
  }, []);

  useEffect(() => {
    if (authModalOpen) {
      fetchClientTypes();
    }
  }, [authModalOpen]);

  useEffect(() => {
    fetchProducts(selectedCountryCode);
    fetchVisualSettings(selectedCountryCode);
  }, [selectedCountryCode]);

  const fetchVisualSettings = async (targetCountry = selectedCountryCode) => {
    try {
      const code = targetCountry || selectedCountryCode || 'AR';
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        setVisualSettings(data);
      }
    } catch (_) { }
  };

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
    } catch (_) { }
  };

  const fetchClientTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/client-types`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setClientTypes(data);
          setAuthForm(prev => {
            if (!prev.tipo_cliente || !data.some(ct => ct.name === prev.tipo_cliente)) {
              return { ...prev, tipo_cliente: data[0].name };
            }
            return prev;
          });
        }
      }
    } catch (_) { }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const payload = {
        ...authForm,
        country_code: authForm.country_code || selectedCountryCode || 'AR',
        country_id: authForm.country_id || selectedCountryObj?.id || 2
      };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    fetchProducts(selectedCountryCode);
  }, [clientUser, selectedCountryCode]);

  const fetchProducts = async (targetCountry = selectedCountryCode) => {
    try {
      const activeCode = targetCountry || selectedCountryCode || 'AR';
      const token = localStorage.getItem('dacas_client_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/products?country=${activeCode}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize images property and filter disallowed brands
          const normalized = data
            .filter((p) => !p.brand || !DISALLOWED_BRANDS.includes(p.brand.toLowerCase()))
            .map((p) => {
              const mainImg = p.image_url || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '');
              const secImgs = Array.isArray(p.secondary_images) ? p.secondary_images : [];
              let combined = [];
              if (mainImg) combined.push(mainImg);
              secImgs.forEach((img) => {
                if (img && !combined.includes(img)) combined.push(img);
              });
              if (combined.length === 0 && Array.isArray(p.images) && p.images.length > 0) {
                combined = p.images;
              }
              return {
                ...p,
                image_url: mainImg,
                images: combined
              };
            });
          setProducts(normalized);
          setLoading(false);
          return;
        }
      }
    } catch (_) { }

    // Fallback to rich DACAS mock with lock simulation if no clientUser
    const cleanMocks = MOCK_PRODUCTS.filter((p) => !p.brand || !DISALLOWED_BRANDS.includes(p.brand.toLowerCase()));
    const token = localStorage.getItem('dacas_client_token');
    if (!token) {
      setProducts(cleanMocks.map((p) => ({ ...p, price: null, promotional_price: null, is_locked: true })));
    } else {
      setProducts(cleanMocks);
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

  // Tracking de carritos cargados sin compra
  const lastCartLoggedRef = useRef(null);
  useEffect(() => {
    if (cart && cart.length > 0) {
      const timer = setTimeout(() => {
        const currentCartKey = JSON.stringify(cart.map(i => ({ id: i.id, qty: i.qty })));
        if (lastCartLoggedRef.current !== currentCartKey) {
          lastCartLoggedRef.current = currentCartKey;
          const token = localStorage.getItem('dacas_client_token');
          fetch(`${API_BASE_URL}/api/ecommerce/track/cart-activity`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              items: cart,
              total: cartTotal,
              trigger: 'cart_filled_pending',
              user: clientUser ? { nombre: clientUser.name, email: clientUser.email, rol: 'cliente' } : undefined
            })
          }).catch(() => { });
        }
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [cart, cartTotal, clientUser]);

  const isProductInCat = (p, catKey) => {
    if (!catKey || catKey === 'all') return true;
    const pCat = (p.category || '').toLowerCase();
    if (pCat === catKey.toLowerCase()) return true;
    if (catKey === 'networking') {
      return pCat.includes('network') || pCat.includes('switch') || pCat.includes('wifi') || pCat.includes('wireless') || pCat.includes('router');
    }
    if (catKey === 'infraestructura') {
      return pCat.includes('infra') || pCat.includes('servidor') || pCat.includes('server') || pCat.includes('cloud') || pCat.includes('rack') || pCat.includes('datacenter');
    }
    if (catKey === 'comunicaciones_unificadas') {
      return pCat.includes('comunicacion') || pCat.includes('unificada') || pCat.includes('voip') || pCat.includes('video') || pCat.includes('telef') || pCat.includes('colaboracion');
    }
    if (catKey === 'security') {
      return pCat.includes('secur') || pCat.includes('seguridad') || pCat.includes('firewall') || pCat.includes('ciber') || pCat.includes('licencia');
    }
    return false;
  };

  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    setSelectedBrand(null);
    setSearch('');
  };

  const handleSlideLinkClick = (btn) => {
    if (!btn) return;
    const link = (btn.link || '').trim();
    if (link) {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
        return;
      }
      if (link.startsWith('#')) {
        const el = document.querySelector(link);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (link.startsWith('/shop?cat=')) {
        const cat = link.split('?cat=')[1]?.split('&')[0];
        if (cat) {
          handleSelectCategory(cat);
          return;
        }
      }
      if (link === '/shop' || link === '/shop/') {
        handleSelectCategory('all');
        return;
      }
      if (link.startsWith('/')) {
        window.location.href = link;
        return;
      }
      const catMatch = categories.find(c => c.key === link);
      if (catMatch) {
        handleSelectCategory(catMatch.key);
        return;
      }
      if (link.includes('.') && !link.includes(' ')) {
        window.open(`https://${link}`, '_blank', 'noopener,noreferrer');
        return;
      }
      handleSelectCategory(link);
      return;
    }
    if (btn.cat) {
      handleSelectCategory(btn.cat);
    }
  };

  const currentCategoryObj = categories.find((c) => c.key === activeCategory) || categories[0];
  const categoryProducts = products.filter((p) => isProductInCat(p, activeCategory));

  const isBrandAllowedInCountry = (brandName, categoryKey, currentCountryCode) => {
    if (!brandName) return true;
    const bKey = brandName.toLowerCase();

    // 1. Check in visualSettings.categoryBrands
    if (visualSettings?.categoryBrands) {
      const categoriesToCheck = categoryKey && categoryKey !== 'all'
        ? [categoryKey]
        : Object.keys(visualSettings.categoryBrands);

      for (const cat of categoriesToCheck) {
        const list = visualSettings.categoryBrands[cat];
        if (Array.isArray(list)) {
          const found = list.find(item => {
            if (typeof item === 'string') return item.toLowerCase() === bKey;
            return (item?.name || '').toLowerCase() === bKey;
          });
          if (found && typeof found === 'object' && Array.isArray(found.countries) && found.countries.length > 0) {
            return found.countries.includes(currentCountryCode);
          }
        }
      }
    }

    // 2. Check in visualSettings.brandCountries
    if (visualSettings?.brandCountries && visualSettings.brandCountries[bKey]) {
      const allowed = visualSettings.brandCountries[bKey];
      if (Array.isArray(allowed) && allowed.length > 0) {
        return allowed.includes(currentCountryCode);
      }
    }

    return true;
  };

  const availableBrands = useMemo(() => {
    if (activeCategory === 'all') {
      const productBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))
        .filter((b) => !DISALLOWED_BRANDS.includes(b.toLowerCase()))
        .filter((b) => isBrandAllowedInCountry(b, 'all', selectedCountryCode));
      return productBrands.map((bName) => {
        const brandKey = bName.toLowerCase();
        const info = BRAND_INFO[brandKey] || {
          name: bName,
          logo: null,
          tagline: `Equipos y soluciones oficiales ${bName}`,
          color: '#0fa4de',
          bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
        };
        const custom = visualSettings?.brandCustomInfo?.[brandKey];
        const finalName = (custom && custom.name) ? custom.name : (info.name || bName);
        const finalColor = (custom && custom.color) ? custom.color : (info.color || '#0fa4de');
        const count = products.filter((p) => p.brand && p.brand.toLowerCase() === bName.toLowerCase()).length;
        return {
          ...info,
          name: finalName,
          color: finalColor,
          rawName: finalName,
          count
        };
      });
    }

    const rawOfficial = categoryBrandsMap[activeCategory] || [];
    const officialKeys = rawOfficial
      .map(item => (typeof item === 'string' ? item : item?.name || ''))
      .filter(Boolean)
      .map(k => k.toLowerCase())
      .filter(k => isBrandAllowedInCountry(k, activeCategory, selectedCountryCode));

    const productBrands = categoryProducts
      .map((p) => p.brand)
      .filter(Boolean)
      .filter(b => isBrandAllowedInCountry(b, activeCategory, selectedCountryCode));

    const combinedKeys = Array.from(new Set([...officialKeys, ...productBrands.map((b) => b.toLowerCase())]))
      .filter((k) => !DISALLOWED_BRANDS.includes(k.toLowerCase()));

    return combinedKeys.map((key) => {
      const info = BRAND_INFO[key] || {
        name: key.toUpperCase(),
        logo: null,
        tagline: `Equipos y soluciones oficiales ${key}`,
        color: '#0fa4de',
        bg: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(15, 164, 222, 0.02) 100%)'
      };
      const custom = visualSettings?.brandCustomInfo?.[key];
      const finalName = (custom && custom.name) ? custom.name : (info.name || key);
      const finalColor = (custom && custom.color) ? custom.color : (info.color || '#0fa4de');
      const count = categoryProducts.filter((p) => p.brand && p.brand.toLowerCase() === (info.name || key).toLowerCase()).length;
      return {
        ...info,
        name: finalName,
        color: finalColor,
        rawName: finalName,
        count
      };
    });
  }, [activeCategory, categoryProducts, products, categoryBrandsMap, visualSettings, selectedCountryCode]);

  // Carruseles de la Home (Ilimitados, independientes por país)
  const homeCarouselsList = useMemo(() => {
    const rawList = visualSettings?.homeCarousels?.list;
    let list = [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      list = rawList;
    } else {
      // Fallback a los 2 carruseles clásicos si no hay lista
      const feat = visualSettings?.homeCarousels?.featured;
      const cust = visualSettings?.homeCarousels?.custom;
      list = [
        {
          id: 'car_featured',
          title: feat?.title || "Productos Destacados & Más Vendidos",
          subtitle: feat?.subtitle || "Equipamiento enterprise de alta rotación con entrega inmediata",
          badge: "TOP SELLERS",
          badgeColor: "#0fa4de",
          icon: "star",
          enabled: feat?.enabled !== false,
          selectionType: (feat?.productIds && feat.productIds.length > 0) ? 'manual' : 'featured',
          targetCategory: 'all',
          targetBrand: 'all',
          productIds: feat?.productIds || []
        },
        {
          id: 'car_custom',
          title: cust?.title || "Selección Especial DACAS & Novedades",
          subtitle: cust?.subtitle || "Soluciones tecnológicas recomendadas por nuestro equipo de ingenieros",
          badge: "SELECCIÓN DACAS",
          badgeColor: "#10b981",
          icon: "shield",
          enabled: cust?.enabled !== false,
          selectionType: (cust?.productIds && cust.productIds.length > 0) ? 'manual' : 'custom_default',
          targetCategory: 'all',
          targetBrand: 'all',
          productIds: cust?.productIds || []
        }
      ];
    }

    return list.filter(c => c && c.enabled !== false).map(c => {
      let carProducts = [];
      const selType = c.selectionType || 'manual';

      if (selType === 'category' && c.targetCategory && c.targetCategory !== 'all') {
        carProducts = products.filter(p => isProductInCat(p, c.targetCategory));
      } else if (selType === 'brand' && c.targetBrand && c.targetBrand !== 'all') {
        carProducts = products.filter(p => p.brand && p.brand.toLowerCase() === c.targetBrand.toLowerCase());
      } else if (selType === 'manual' && Array.isArray(c.productIds) && c.productIds.length > 0) {
        const idSet = new Set(c.productIds.map(id => parseInt(id)));
        carProducts = products.filter(p => idSet.has(parseInt(p.id)));
      } else if (selType === 'custom_default') {
        const tagged = products.filter(p => p.badge === 'NUEVO' || p.badge === 'ENTERPRISE');
        if (tagged.length >= 3) carProducts = tagged;
        else if (products.length > 4) carProducts = products.slice(2, 10);
        else carProducts = products;
      } else {
        // 'featured'
        if (c.productIds && c.productIds.length > 0) {
          const idSet = new Set(c.productIds.map(id => parseInt(id)));
          carProducts = products.filter(p => idSet.has(parseInt(p.id)));
        } else {
          const explicitlyFeatured = products.filter(p => p.is_featured || p.isFeatured || p.featured || p.badge === 'DESTACADO' || p.badge === 'MÁS VENDIDO' || p.badge === 'HOT');
          if (explicitlyFeatured.length > 0) carProducts = explicitlyFeatured;
          else carProducts = products.slice(0, 8);
        }
      }

      return {
        ...c,
        products: carProducts
      };
    }).filter(c => c.products && c.products.length > 0);
  }, [products, visualSettings]);

  // Marcas Oficiales para el Slide / Rail de la Home
  const featuredBrandKeys = useMemo(() => {
    const defaultKeys = ['fortinet', 'vertiv', 'mikrotik', 'aruba', 'avaya', 'audiocodes', 'panduit', 'eaton'];
    const keysSet = new Set(defaultKeys);
    if (visualSettings?.brandCustomInfo) {
      Object.keys(visualSettings.brandCustomInfo).forEach(k => {
        if (k && !DISALLOWED_BRANDS.includes(k.toLowerCase())) {
          keysSet.add(k.toLowerCase());
        }
      });
    }
    return Array.from(keysSet).filter(k => isBrandAllowedInCountry(k, 'all', selectedCountryCode));
  }, [visualSettings, selectedCountryCode, isBrandAllowedInCountry]);

  // Catálogo completo filtrado y ordenado para miles de productos
  const sortedAndFilteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (p.brand && DISALLOWED_BRANDS.includes(p.brand.toLowerCase())) return false;
      const q = search.toLowerCase().trim();
      const matchSearch = !search ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q));
      const matchCat = isProductInCat(p, activeCategory);
      const matchBrand = !selectedBrand || selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
      const matchSubcat = !selectedSubcategory || selectedSubcategory === 'all' ||
        (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
      return matchSearch && matchCat && matchBrand && matchSubcat;
    });

    if (catalogSort === 'price_asc') {
      list = [...list].sort((a, b) => ((a.promotional_price || a.price || 0) - (b.promotional_price || b.price || 0)));
    } else if (catalogSort === 'price_desc') {
      list = [...list].sort((a, b) => ((b.promotional_price || b.price || 0) - (a.promotional_price || a.price || 0)));
    } else if (catalogSort === 'name_asc') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [products, search, activeCategory, selectedBrand, selectedSubcategory, catalogSort]);

  // Subcategorías dinámicas disponibles para la marca seleccionada en el país actual
  const availableSubcategoriesForBrand = useMemo(() => {
    if (!selectedBrand || selectedBrand === 'all') return [];
    const brandProducts = products.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    const counts = {};
    brandProducts.forEach(p => {
      const sub = (p.subcategory || '').trim();
      if (sub) {
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products, selectedBrand]);

  // Datos completos de la marca seleccionada (incluyendo banner personalizado)
  const selectedBrandData = useMemo(() => {
    if (!selectedBrand || selectedBrand === 'all') return null;
    const target = selectedBrand.toLowerCase().trim();

    let custom = visualSettings?.brandCustomInfo?.[target];
    let matchedKey = target;
    if (!custom && visualSettings?.brandCustomInfo) {
      for (const [k, v] of Object.entries(visualSettings.brandCustomInfo)) {
        if (k.toLowerCase() === target || (v?.name && v.name.toLowerCase().trim() === target)) {
          custom = v;
          matchedKey = k;
          break;
        }
      }
    }

    const defaultInfo = BRAND_INFO[matchedKey] || BRAND_INFO[target] || {};

    const name = custom?.name || defaultInfo.name || selectedBrand;
    const logo = (custom?.logo !== undefined && custom?.logo !== '') ? custom.logo : (defaultInfo.logo || null);
    const banner = (custom?.banner !== undefined && custom?.banner !== '') ? custom.banner : (defaultInfo.banner || null);
    const tagline = custom?.tagline || defaultInfo.tagline || `Soluciones oficiales ${name}`;
    const color = custom?.color || defaultInfo.color || '#0fa4de';

    return { key: matchedKey, name, logo, banner, tagline, color };
  }, [selectedBrand, visualSettings]);

  // Compatibilidad hacia atrás con referencias existentes a filtered
  const filtered = sortedAndFilteredProducts;

  const totalCatalogPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (catalogPage - 1) * itemsPerPage;
    return sortedAndFilteredProducts.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredProducts, catalogPage, itemsPerPage]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ── Top Regional Countries Flag Bar (12 Países DACAS) ── */}
      <div style={{ background: '#E2E8F0', borderBottom: '1px solid #CBD5E1', padding: '5px 0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <BrandingVectorIcon name="globe" size={14} color="#475569" /> Cobertura Regional DACAS:
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: clientUser ? '#0369a1' : '#0284c7', color: '#ffffff', padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', boxShadow: '0 1px 3px rgba(2,132,199,0.3)' }}>
              <span>{clientUser ? '🔒 Tienda Asignada:' : '📍 Operando en:'} {selectedCountryObj.flag} {selectedCountryObj.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
            {DACAS_COUNTRIES.map((c) => {
              const isSelected = selectedCountryCode === c.code;
              const isLockedForOther = clientUser && userCountryCode !== c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    if (isLockedForOther) {
                      setAttemptedCountry(c);
                      setShowCountryBlockedModal(true);
                      return;
                    }
                    setSelectedCountryCode(c.code);
                    try {
                      localStorage.setItem('dacas_selected_country', c.code);
                      window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: c.code } }));
                    } catch {}
                    fetchProducts(c.code);
                  }}
                  title={isLockedForOther 
                    ? `🔒 Tu cuenta está registrada en ${userCountryObj.name}. Clic para cambiar de usuario si deseas operar en ${c.name}.`
                    : `${c.name} (${c.code}) - Clic para ver catálogo y stock de ${c.name}`
                  }
                  style={{
                    background: isSelected ? '#0fa4de' : 'transparent',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(15, 164, 222, 0.4)' : 'none',
                    transform: isSelected ? 'scale(1.12)' : 'none',
                    opacity: isLockedForOther ? 0.65 : 1
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{c.flag}</span>
                  {isLockedForOther && (
                    <span style={{ fontSize: '9px', marginLeft: '-2px' }}>🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Announcement Bar ── */}
      {announcement.enabled && (
        <div style={{ background: '#071524', color: '#94A3B8', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid rgba(15, 164, 222, 0.15)' }}>
          <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{selectedCountryObj.flag}</span>
              <span><strong>DACAS {selectedCountryObj.name}</strong> · {announcement.text || 'Envíos asegurados y distribución mayorista regional de valor agregado'}</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {generalSettings.contactPhone && (
                <span style={{ color: '#0fa4de', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="phone" size={12} color="#0fa4de" /> {generalSettings.contactPhone}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Sticky Header ── */}
      <header style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '72px', gap: '24px' }}>

          {/* Logo DACAS Shop */}
          <div onClick={handleGoHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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

          {/* Botón Home */}
          <button
            type="button"
            onClick={handleGoHome}
            style={{
              background: activeNavTab === 'home' ? '#E0F2FE' : '#F8FAFC',
              border: '1.5px solid',
              borderColor: activeNavTab === 'home' ? '#0fa4de' : '#E2E8F0',
              borderRadius: '999px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0fa4de',
              fontSize: '13px',
              fontWeight: '800',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="Ir a Inicio"
          >
            <BrandingVectorIcon name="home" size={15} color="#0fa4de" />
            <span>Inicio</span>
          </button>

          {/* Search Bar */}
          <form style={{ flex: 1, minWidth: 0, position: 'relative' }} onSubmit={(e) => e.preventDefault()}>
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
                      <BrandingVectorIcon name="building" size={16} color="#ffffff" />
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
                          <BrandingVectorIcon name="building" size={20} color="#ffffff" />
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
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
                        <BrandingVectorIcon name="layout" size={14} color="#0369A1" />
                        <span>Mi Portal de Cliente B2B</span>
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
                      <BrandingVectorIcon name="lock" size={13} color="#DC2626" />
                      <span>Cerrar Sesión</span>
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
                <BrandingVectorIcon name="user" size={14} color="#0fa4de" />
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0fa4de" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
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
                      <div style={{ marginBottom: '8px' }}>
                        <BrandingVectorIcon name="shopping-cart" size={32} color="#94A3B8" />
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Tu carrito está vacío</p>
                    </div>
                  ) : cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          <BrandingVectorIcon name="box" size={24} color="#94A3B8" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#071524' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Cant: <strong>{item.qty}</strong> · <span style={{ color: '#0fa4de', fontWeight: '700' }}>${(parseFloat(item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        title="Eliminar"
                      >
                        <BrandingVectorIcon name="x" size={14} color="currentColor" />
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

      {/* ── Storefront Navigation Bar ── */}
      <nav style={{ background: '#071524', borderBottom: '1px solid rgba(15, 164, 222, 0.2)', position: 'sticky', top: '72px', zIndex: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: '52px', gap: '8px', boxSizing: 'border-box', overflowX: 'auto' }}>
          
          {/* 1. Inicio */}
          <button
            onClick={handleGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: activeNavTab === 'home' ? '800' : '600',
              color: activeNavTab === 'home' ? '#FFFFFF' : '#94A3B8',
              background: activeNavTab === 'home' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: activeNavTab === 'home' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeNavTab === 'home' ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <BrandingVectorIcon name="home" size={15} color={activeNavTab === 'home' ? '#FFFFFF' : '#94A3B8'} />
            <span>Inicio</span>
          </button>

          {/* 2. Marcas Oficiales */}
          <button
            onClick={handleGoBrands}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: activeNavTab === 'brands' ? '800' : '600',
              color: activeNavTab === 'brands' ? '#FFFFFF' : '#94A3B8',
              background: activeNavTab === 'brands' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: activeNavTab === 'brands' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeNavTab === 'brands' ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <BrandingVectorIcon name="award" size={15} color={activeNavTab === 'brands' ? '#FFFFFF' : '#94A3B8'} />
            <span>Marcas</span>
            <span style={{
              background: activeNavTab === 'brands' ? 'rgba(255,255,255,0.25)' : 'rgba(15, 164, 222, 0.2)',
              color: activeNavTab === 'brands' ? '#FFFFFF' : '#38bdf8',
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 7px',
              borderRadius: '999px',
              marginLeft: '2px'
            }}>
              +20
            </span>
          </button>

          {/* 3. Catálogo Completo */}
          <button
            onClick={() => handleGoCatalog('all', null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '800' : '600',
              color: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '#FFFFFF' : '#94A3B8',
              background: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: (activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            <CategoryIcon name="all" size={15} color={(activeNavTab === 'catalog' && activeCategory === 'all' && !selectedBrand) ? '#FFFFFF' : '#94A3B8'} />
            <span>Catálogo</span>
          </button>

          {/* Separador */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', margin: '0 6px', flexShrink: 0 }} />

          {/* Accesos directos a Categorías principales */}
          {categories.filter(c => c.key !== 'all').map((cat) => {
            const isSelected = activeNavTab === 'catalog' && activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleGoCatalog(cat.key, null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#FFFFFF' : '#94A3B8',
                  background: isSelected ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 14px rgba(15, 164, 222, 0.35)' : 'none',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={cat.key || cat.icon} size={15} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                <span>{cat.label || cat.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── 1. VISTA INICIO (HOME): Hero Slider + Carrusel Destacados + Banners Marcas + Carrusel Especial + Marcas Partners ── */}
      {activeNavTab === 'home' && (
        <div>
          {/* Hero Banner Carousel DACAS */}
          {heroSlides.length > 0 && (() => {
        const slideIndex = currentHeroSlide >= heroSlides.length ? 0 : currentHeroSlide;
        const currentSlideObj = heroSlides[slideIndex] || heroSlides[0] || HERO_SLIDES[0];
        const isImageOnly = (currentSlideObj.type === 'custom_image' && currentSlideObj.showOverlayText !== true) || currentSlideObj.showOverlayText === false;
        const hasBackground = Boolean(currentSlideObj.imageUrl);

        return (
          <div
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
            style={{
              background: 'linear-gradient(135deg, #071524 0%, #0f2742 60%, #12354c 100%)',
              color: '#fff',
              padding: isImageOnly ? '0' : '30px 20px 42px',
              position: 'relative',
              overflow: 'hidden',
              height: '420px',
              minHeight: '420px',
              maxHeight: '420px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* ── Imagen de fondo a pantalla completa (Ocupa el 100% del Slide) ── */}
            {hasBackground && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                  overflow: 'hidden',
                  pointerEvents: isImageOnly ? 'auto' : 'none',
                  cursor: (isImageOnly && currentSlideObj.primaryBtn?.enabled !== false && (currentSlideObj.primaryBtn?.link || currentSlideObj.primaryBtn?.cat)) ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isImageOnly && currentSlideObj.primaryBtn?.enabled !== false && (currentSlideObj.primaryBtn?.link || currentSlideObj.primaryBtn?.cat)) {
                    handleSlideLinkClick(currentSlideObj.primaryBtn);
                  }
                }}
              >
                <img
                  src={currentSlideObj.imageUrl}
                  alt={currentSlideObj.titleLine1 || 'Banner Background DACAS'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: currentSlideObj.imagePosition || 'center',
                    display: 'block'
                  }}
                />
                {/* Capa de contraste y oscurecimiento para garantizar lectura perfecta de textos sobreimpresos */}
                {!isImageOnly && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: currentSlideObj.overlayStyle === 'strong'
                        ? 'linear-gradient(90deg, rgba(7, 21, 36, 0.96) 0%, rgba(7, 21, 36, 0.88) 50%, rgba(7, 21, 36, 0.72) 100%)'
                        : currentSlideObj.overlayStyle === 'light'
                        ? 'linear-gradient(90deg, rgba(7, 21, 36, 0.82) 0%, rgba(7, 21, 36, 0.6) 50%, rgba(7, 21, 36, 0.25) 100%)'
                        : currentSlideObj.overlayStyle === 'none'
                        ? 'transparent'
                        : 'linear-gradient(90deg, rgba(7, 21, 36, 0.94) 0%, rgba(7, 21, 36, 0.82) 48%, rgba(7, 21, 36, 0.55) 75%, rgba(7, 21, 36, 0.35) 100%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
            )}

            {/* Glow dinámico de fondo (activo cuando no hay foto de fondo) */}
            {!hasBackground && (
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '650px',
                height: '650px',
                background: `radial-gradient(circle, ${currentSlideObj.titleColor || '#0fa4de'}2E 0%, rgba(0,0,0,0) 70%)`,
                pointerEvents: 'none',
                transition: 'background 0.8s ease',
                zIndex: 0
              }} />
            )}

            {/* Carousel Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Slide anterior"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 39, 66, 0.75)',
                    border: '1px solid rgba(15, 164, 222, 0.35)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0fa4de'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 39, 66, 0.75)'; e.currentTarget.style.borderColor = 'rgba(15, 164, 222, 0.35)'; }}
                >
                  ‹
                </button>

                <button
                  onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                  aria-label="Siguiente slide"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 39, 66, 0.75)',
                    border: '1px solid rgba(15, 164, 222, 0.35)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0fa4de'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 39, 66, 0.75)'; e.currentTarget.style.borderColor = 'rgba(15, 164, 222, 0.35)'; }}
                >
                  ›
                </button>
              </>
            )}

            {/* ── Botón CTA Flotante en Modo Solo Imagen ── */}
            {isImageOnly && currentSlideObj.primaryBtn?.enabled !== false && currentSlideObj.primaryBtn?.text && (
              <div style={{ position: 'absolute', bottom: '24px', right: '36px', zIndex: 5 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideLinkClick(currentSlideObj.primaryBtn);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '12px 26px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(15, 164, 222, 0.5)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  {currentSlideObj.primaryBtn.text} →
                </button>
              </div>
            )}

            {/* ── Slide Content Container: Textos, Títulos, Botones y KPIs (Modo Combinado o Estándar) ── */}
            {!isImageOnly && (
              <div style={{ maxWidth: '1320px', width: '100%', height: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '30px', position: 'relative', zIndex: 1, padding: '0 40px', boxSizing: 'border-box' }}>
                {/* Left Text / CTAs */}
                <div style={{ flex: 1, minWidth: '300px', transition: 'all 0.4s ease' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(15, 164, 222, 0.2)',
                    border: '1px solid rgba(15, 164, 222, 0.45)',
                    backdropFilter: 'blur(8px)',
                    color: currentSlideObj.titleColor || '#38bdf8',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    marginBottom: '18px',
                    letterSpacing: '0.05em'
                  }}>
                    <BrandingVectorIcon name={currentSlideObj.badgeIcon || 'shield'} size={14} color={currentSlideObj.titleColor || '#38bdf8'} />
                    <span>{currentSlideObj.badge}</span>
                  </div>
                  <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.15, textShadow: '0 2px 14px rgba(0,0,0,0.45)' }}>
                    {currentSlideObj.titleLine1} <br />
                    <span style={{ color: currentSlideObj.titleColor || '#0fa4de' }}>
                      {currentSlideObj.titleLine2}
                    </span>
                  </h1>
                  <p style={{ margin: '0 0 20px', color: '#E2E8F0', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '520px', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
                    {currentSlideObj.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {currentSlideObj.primaryBtn?.enabled !== false && currentSlideObj.primaryBtn?.text && (
                      <button
                        onClick={() => handleSlideLinkClick(currentSlideObj.primaryBtn)}
                        style={{
                          background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '12px 26px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 20px rgba(15, 164, 222, 0.45)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      >
                        {currentSlideObj.primaryBtn.text}
                      </button>
                    )}
                    {currentSlideObj.secondaryBtn?.enabled !== false && currentSlideObj.secondaryBtn?.text && (
                      <button
                        onClick={() => handleSlideLinkClick(currentSlideObj.secondaryBtn)}
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(8px)',
                          color: '#fff',
                          border: '1px solid rgba(15, 164, 222, 0.4)',
                          borderRadius: '999px',
                          padding: '12px 26px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 164, 222, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                      >
                        {currentSlideObj.secondaryBtn.text}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Visual / Animated Stats */}
                {currentSlideObj.type === 'animated_stats' ? (
                  <AnimatedHeroStats active={true} metrics={currentSlideObj.metrics} />
                ) : (
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {currentSlideObj.metrics?.map((metric, mIdx) => (
                      <div
                        key={metric.label || mIdx}
                        style={{
                          textAlign: 'center',
                          background: 'rgba(15, 39, 66, 0.85)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(15, 164, 222, 0.35)',
                          borderRadius: '16px',
                          padding: '18px 22px',
                          minWidth: '110px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: currentSlideObj.titleColor || '#0fa4de' }}>
                          {metric.value}
                        </div>
                        <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px', fontWeight: '600' }}>
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Carousel Bottom Indicator Dots */}
            {heroSlides.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                zIndex: 10
              }}>
                {heroSlides.map((slide, idx) => (
                  <button
                    key={`hero-dot-${slide.id !== undefined && slide.id !== null ? slide.id : idx}`}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Ir al slide ${idx + 1}`}
                    style={{
                      width: slideIndex === idx ? '28px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: slideIndex === idx ? '#0fa4de' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      padding: 0,
                      boxShadow: slideIndex === idx ? '0 0 10px rgba(15, 164, 222, 0.6)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

          {/* Main Home Content Grid */}
          <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '16px 20px 60px' }}>
            
            {/* Carruseles Dinámicos de la Home (Ilimitados por País) */}
            {homeCarouselsList.map((carousel, idx) => (
              <React.Fragment key={carousel.id || idx}>
                <ProductCarousel
                  title={carousel.title}
                  subtitle={carousel.subtitle}
                  badge={carousel.badge}
                  badgeColor={carousel.badgeColor || '#0fa4de'}
                  icon={carousel.icon || 'star'}
                  products={carousel.products}
                  clientUser={clientUser}
                  selectedCountryCode={selectedCountryCode}
                  selectedCountryObj={selectedCountryObj}
                  onOpenAuth={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={(p, q) => addToCart(p, q)}
                  justAddedId={addedId}
                  onViewAll={() => {
                    if (carousel.selectionType === 'category' && carousel.targetCategory) {
                      handleGoCatalog(carousel.targetCategory, null);
                    } else if (carousel.selectionType === 'brand' && carousel.targetBrand) {
                      handleGoCatalog('all', carousel.targetBrand);
                    } else {
                      handleGoCatalog('all', null);
                    }
                  }}
                />

                {/* Banners Promocionales de Marcas luego del primer carrusel */}
                {idx === 0 && (
                  <BrandPromoBanners
                    banners={visualSettings?.brandBanners}
                    onBrandClick={handleSelectBrand}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Si no hay ningún carrusel activo, mostrar los banners de marca igual */}
            {homeCarouselsList.length === 0 && (
              <BrandPromoBanners
                banners={visualSettings?.brandBanners}
                onBrandClick={handleSelectBrand}
              />
            )}

            {/* Rail de Marcas Oficiales Destacadas */}
            <section style={{ margin: '40px 0 20px', background: '#FFFFFF', borderRadius: '24px', padding: '32px 28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(15, 164, 222, 0.1)',
                    color: '#0fa4de',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    <BrandingVectorIcon name="award" size={12} color="#0fa4de" />
                    <span>ALIANZAS & FABRICANTES DIRECTOS</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#071524' }}>
                    Marcas Oficiales DACAS
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                    Distribución oficial regional con garantía de fábrica y soporte certificado.
                  </p>
                </div>

                <button
                  onClick={handleGoBrands}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <span>Ver todas las marcas (+20)</span>
                  <span>→</span>
                </button>
              </div>

              {/* Grid de Marcas Destacadas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '14px' }}>
                {featuredBrandKeys.map((bKey) => {
                  const keyLower = (bKey || '').toLowerCase();
                  const custom = visualSettings?.brandCustomInfo?.[keyLower];
                  const bInfo = BRAND_INFO[keyLower] || { name: bKey.charAt(0).toUpperCase() + bKey.slice(1), color: '#0fa4de' };
                  const finalName = (custom && custom.name) ? custom.name : (bInfo.name || bKey);
                  const finalLogo = (custom && custom.logo !== undefined && custom.logo !== '') ? custom.logo : (bInfo.logo || null);
                  const finalColor = (custom && custom.color) ? custom.color : (bInfo.color || '#0fa4de');

                  return (
                    <div
                      key={keyLower}
                      onClick={() => handleSelectBrand(finalName)}
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        minHeight: '108px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = finalColor;
                        e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.06), 0 0 0 1px ${finalColor}33`;
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                    >
                      <div style={{ height: '42px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                        <BrandLogoImg src={finalLogo} alt={finalName} name={finalName} color={finalColor} size={36} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {finalName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ── 2. VISTA MARCAS DEDICADA: Directorio completo con buscador, filtros y tarjetas de fabricantes ── */}
      {activeNavTab === 'brands' && (
        <BrandsDirectoryView
          products={products}
          categoryBrandsMap={categoryBrandsMap}
          categories={categories}
          brandSearch={brandSearch}
          setBrandSearch={setBrandSearch}
          brandCatFilter={brandCatFilter}
          setBrandCatFilter={setBrandCatFilter}
          onSelectBrand={handleSelectBrand}
          selectedCountryCode={selectedCountryCode}
          isBrandAllowedInCountry={isBrandAllowedInCountry}
          visualSettings={visualSettings}
        />
      )}

      {/* ── 3. VISTA CATÁLOGO COMPLETO: Diagramado para Miles de Productos con Filtros, Ordenamiento y Paginación ── */}
      {activeNavTab === 'catalog' && (
        <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 20px 60px' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span onClick={handleGoHome} style={{ cursor: 'pointer', color: '#0fa4de', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <BrandingVectorIcon name="home" size={13} color="#0fa4de" /> Inicio
            </span>
            <span>/</span>
            <span
              onClick={() => { setActiveCategory('all'); setSelectedBrand(null); setCatalogPage(1); }}
              style={{ cursor: 'pointer', color: activeCategory === 'all' && !selectedBrand ? '#071524' : '#0fa4de', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              Catálogo
            </span>
            {activeCategory !== 'all' && (
              <>
                <span>/</span>
                <span
                  onClick={() => { setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{ cursor: 'pointer', color: !selectedBrand ? '#071524' : '#0fa4de', fontWeight: '700' }}
                >
                  {currentCategoryObj?.label}
                </span>
              </>
            )}
            {selectedBrand && (
              <>
                <span>/</span>
                <span
                  onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    fontWeight: !selectedSubcategory ? '800' : '650',
                    color: !selectedSubcategory ? '#071524' : '#0fa4de',
                    cursor: selectedSubcategory ? 'pointer' : 'default'
                  }}
                >
                  {selectedBrand === 'all' ? 'Todas las Marcas' : selectedBrand}
                </span>
              </>
            )}
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span style={{ fontWeight: '800', color: '#071524' }}>
                  {selectedSubcategory}
                </span>
              </>
            )}
          </div>

          {/* Catalog Top Toolbar: Header, Total Count, Sorting & Items per page */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedBrand && selectedBrand !== 'all' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      {selectedBrandData?.logo && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '4px'
                        }}>
                          <BrandLogoImg src={selectedBrandData.logo} alt={selectedBrandData.name} name={selectedBrandData.name} color={selectedBrandData.color} size={26} />
                        </span>
                      )}
                      <span>Productos {selectedBrandData?.name || selectedBrand}</span>
                    </span>
                  ) : (
                    <span>{currentCategoryObj?.label || 'Catálogo de Soluciones'}</span>
                  )}
                  {selectedSubcategory && (
                    <span style={{ fontSize: '1.05rem', fontWeight: '750', color: '#0fa4de', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '2px 10px', borderRadius: '8px' }}>
                      {selectedSubcategory}
                    </span>
                  )}
                  {selectedBrand && selectedBrand !== 'all' && activeCategory !== 'all' && (
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748B' }}>
                      en {currentCategoryObj?.label}
                    </span>
                  )}
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748B' }}>
                  {sortedAndFilteredProducts.length > 0 ? (
                    <>
                      Mostrando <strong>{(catalogPage - 1) * itemsPerPage + 1} - {Math.min(catalogPage * itemsPerPage, sortedAndFilteredProducts.length)}</strong> de <strong>{sortedAndFilteredProducts.length}</strong> {sortedAndFilteredProducts.length === 1 ? 'producto' : 'productos'} para distribución mayorista
                    </>
                  ) : (
                    '0 productos disponibles para los criterios seleccionados'
                  )}
                </p>
              </div>

              {/* Controles de ordenamiento y cantidad por página */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="catalog-sort" style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Ordenar:</label>
                  <select
                    id="catalog-sort"
                    value={catalogSort}
                    onChange={(e) => { setCatalogSort(e.target.value); setCatalogPage(1); }}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#071524',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="relevance">Más Relevantes</option>
                    <option value="price_asc">Menor Precio</option>
                    <option value="price_desc">Mayor Precio</option>
                    <option value="name_asc">Nombre (A - Z)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="catalog-per-page" style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Por pág:</label>
                  <select
                    id="catalog-per-page"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCatalogPage(1); }}
                    style={{
                      height: '38px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#071524',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categorías Pills Rápidas */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginRight: '4px' }}>Categoría:</span>
              {categories.map((c) => {
                const isSelected = activeCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => { setActiveCategory(c.key); setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }}
                    style={{
                      padding: '5px 13px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: isSelected ? '800' : '600',
                      border: isSelected ? '1px solid #0fa4de' : '1px solid #E2E8F0',
                      background: isSelected ? '#0fa4de' : '#F8FAFC',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 2px 6px rgba(15, 164, 222, 0.3)' : 'none'
                    }}
                  >
                    {c.label || c.name}
                  </button>
                );
              })}
            </div>

            {/* Selector de Marcas rápido (Pills) */}
            {availableBrands.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginRight: '4px' }}>Marca:</span>
                <button
                  onClick={() => { setSelectedBrand('all'); setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: selectedBrand === 'all' || !selectedBrand ? '800' : '600',
                    border: selectedBrand === 'all' || !selectedBrand ? '1px solid #0fa4de' : '1px solid #E2E8F0',
                    background: selectedBrand === 'all' || !selectedBrand ? '#0fa4de' : '#FFFFFF',
                    color: selectedBrand === 'all' || !selectedBrand ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Todas las Marcas
                </button>
                {availableBrands.map((b) => {
                  const isBSelected = selectedBrand?.toLowerCase() === b.rawName.toLowerCase();
                  return (
                    <button
                      key={b.rawName}
                      onClick={() => { setSelectedBrand(b.rawName); setSelectedSubcategory(null); setCatalogPage(1); }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: isBSelected ? '800' : '600',
                        border: isBSelected ? `1px solid ${b.color || '#0fa4de'}` : '1px solid #E2E8F0',
                        background: isBSelected ? (b.color || '#0fa4de') : '#FFFFFF',
                        color: isBSelected ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {b.name} ({b.count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selector de Subcategorías de la Marca seleccionada */}
            {selectedBrand && selectedBrand !== 'all' && availableSubcategoriesForBrand.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#F0F9FF',
                borderRadius: '12px',
                border: '1.5px solid #BAE6FD'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <BrandingVectorIcon name="layers" size={13} color="#0369a1" />
                  Subcategorías {selectedBrand}:
                </span>
                <button
                  onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: !selectedSubcategory || selectedSubcategory === 'all' ? '800' : '650',
                    border: !selectedSubcategory || selectedSubcategory === 'all' ? '1.5px solid #0fa4de' : '1px solid #BAE6FD',
                    background: !selectedSubcategory || selectedSubcategory === 'all' ? '#0fa4de' : '#FFFFFF',
                    color: !selectedSubcategory || selectedSubcategory === 'all' ? '#FFFFFF' : '#0369a1',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Todas las Subcategorías
                </button>
                {availableSubcategoriesForBrand.map(s => {
                  const isSubSel = selectedSubcategory?.toLowerCase() === s.name.toLowerCase();
                  return (
                    <button
                      key={s.name}
                      onClick={() => { setSelectedSubcategory(s.name); setCatalogPage(1); }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: isSubSel ? '800' : '650',
                        border: isSubSel ? '1.5px solid #0fa4de' : '1px solid #BAE6FD',
                        background: isSubSel ? '#0fa4de' : '#FFFFFF',
                        color: isSubSel ? '#FFFFFF' : '#0369a1',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSubSel ? '0 2px 6px rgba(15, 164, 222, 0.3)' : 'none'
                      }}
                    >
                      {s.name} ({s.count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Filter Chips Bar */}
            {(selectedBrand || selectedSubcategory || activeCategory !== 'all' || search) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px dashed #E2E8F0' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '750', color: '#94A3B8' }}>Filtros activos:</span>
                
                {search && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0F172A', fontWeight: '700' }}>
                    Texto: "{search}"
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {activeCategory !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0369A1', fontWeight: '700' }}>
                    Categoría: {currentCategoryObj?.label}
                    <button onClick={() => { setActiveCategory('all'); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369A1', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {selectedBrand && selectedBrand !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 164, 222, 0.15)', border: '1px solid rgba(15, 164, 222, 0.4)', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0fa4de', fontWeight: '800' }}>
                    Marca: {selectedBrand}
                    <button onClick={() => { setSelectedBrand(null); setSelectedSubcategory(null); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0fa4de', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                {selectedSubcategory && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: '999px', padding: '3px 10px', fontSize: '11.5px', color: '#0369A1', fontWeight: '800' }}>
                    Subcategoría: {selectedSubcategory}
                    <button onClick={() => { setSelectedSubcategory(null); setCatalogPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369A1', fontWeight: 'bold', padding: 0 }}>×</button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('all');
                    setSelectedBrand(null);
                    setSelectedSubcategory(null);
                    setCatalogPage(1);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '11.5px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 6px'
                  }}
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </div>

          {/* ── Brand Banner (debajo de los filtros y encima de los productos) ── */}
          {selectedBrand && selectedBrand !== 'all' && selectedBrandData?.banner && (
            <div style={{
              position: 'relative',
              width: '100%',
              borderRadius: '22px',
              overflow: 'hidden',
              marginBottom: '26px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: `1.5px solid ${selectedBrandData.color ? `${selectedBrandData.color}33` : '#E2E8F0'}`,
              background: '#071524'
            }}>
              <img
                src={selectedBrandData.banner}
                alt={`Banner oficial ${selectedBrandData.name || selectedBrand}`}
                style={{
                  width: '100%',
                  maxHeight: '320px',
                  minHeight: '160px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* Estado de carga o Lista de Productos */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
              <p style={{ fontWeight: '700' }}>Cargando catálogo oficial DACAS...</p>
            </div>
          ) : sortedAndFilteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ marginBottom: '12px' }}>
                <BrandingVectorIcon name="search" size={48} color="#94A3B8" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#071524' }}>No encontramos coincidencias</h3>
              <p style={{ margin: 0, color: '#64748B' }}>No se encontraron productos para los filtros seleccionados.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                  setSelectedBrand(null);
                  setCatalogPage(1);
                }}
                style={{ marginTop: '16px', background: '#0fa4de', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: '750', cursor: 'pointer' }}
              >
                Ver todo el catálogo disponible
              </button>
            </div>
          ) : (
            <div>
              {/* Grid de Productos Paginados */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '26px' }}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    clientUser={clientUser}
                    selectedCountryCode={selectedCountryCode}
                    selectedCountryObj={selectedCountryObj}
                    onOpenAuth={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    onSelectProduct={() => handleSelectProduct(product)}
                    onAddToCart={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    justAdded={addedId === product.id}
                  />
                ))}
              </div>

              {/* Controles de Paginación */}
              {totalCatalogPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '44px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setCatalogPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                    disabled={catalogPage === 1}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: catalogPage === 1 ? '#F1F5F9' : '#FFFFFF',
                      color: catalogPage === 1 ? '#94A3B8' : '#071524',
                      cursor: catalogPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: '750',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ‹ Anterior
                  </button>

                  {Array.from({ length: totalCatalogPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalCatalogPages ||
                      (pageNum >= catalogPage - 1 && pageNum <= catalogPage + 1)
                    ) {
                      const isCurrent = catalogPage === pageNum;
                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => { setCatalogPage(pageNum); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                          style={{
                            minWidth: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            border: isCurrent ? '1.5px solid #0fa4de' : '1.5px solid #CBD5E1',
                            background: isCurrent ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#FFFFFF',
                            color: isCurrent ? '#FFFFFF' : '#071524',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            boxShadow: isCurrent ? '0 3px 10px rgba(15, 164, 222, 0.35)' : 'none'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === catalogPage - 2 ||
                      pageNum === catalogPage + 2
                    ) {
                      return <span key={`ellipsis-${pageNum}`} style={{ color: '#94A3B8', padding: '0 4px', fontWeight: 'bold' }}>…</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => { setCatalogPage(prev => Math.min(totalCatalogPages, prev + 1)); window.scrollTo({ top: 320, behavior: 'smooth' }); }}
                    disabled={catalogPage === totalCatalogPages}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: catalogPage === totalCatalogPages ? '#F1F5F9' : '#FFFFFF',
                      color: catalogPage === totalCatalogPages ? '#94A3B8' : '#071524',
                      cursor: catalogPage === totalCatalogPages ? 'not-allowed' : 'pointer',
                      fontWeight: '750',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Siguiente ›
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ── 4. VISTA DETALLE DE PRODUCTO: Página dedicada con Galería, Ficha Técnica, Stock y Productos Relacionados ── */}
      {activeNavTab === 'product' && selectedProduct && (
        <ProductDetailPageView
          product={selectedProduct}
          allProducts={products}
          clientUser={clientUser}
          selectedCountryCode={selectedCountryCode}
          selectedCountryObj={selectedCountryObj}
          onOpenAuth={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onSelectProduct={handleSelectProduct}
          onGoBack={handleBackFromProduct}
          onGoCatalog={handleGoCatalog}
          visualSettings={visualSettings}
          justAddedId={addedId}
        />
      )}

      {/* ── Trust & Quality Badges ── */}
      <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '36px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: '30px', flexWrap: 'wrap' }}>
          {[
            { icon: 'lock', title: 'Distribución Segura', sub: 'Certificación y trazabilidad garantizada', color: '#0FA4DE', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'box', title: 'Stock en Tiempo Real', sub: 'Disponibilidad inmediata para despachos', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'shield', title: 'Garantía Oficial', sub: 'Respaldo directo de fabricantes', color: '#0FA4DE', bg: '#F0F9FF', border: '#BAE6FD' },
            { icon: 'handshake', title: 'Atención a Canales', sub: 'Precios preferenciales para integradores', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
          ].map((b) => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '13px',
                background: b.bg,
                border: `1.5px solid ${b.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(15, 164, 222, 0.08)'
              }}>
                <BrandingVectorIcon name={b.icon} size={22} color={b.color} strokeWidth={2.2} />
              </div>
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
            <span>© {new Date().getFullYear()} DACAS {selectedCountryObj?.name || 'Argentina'} · Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

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
          clientTypes={clientTypes}
        />
      )}

      {/* ── MODAL: CAMBIO DE PAÍS NO AUTORIZADO PARA CLIENTE B2B ── */}
      {showCountryBlockedModal && clientUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 21, 36, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '30px'
            }}>
              🔒
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: '900', color: '#0F172A' }}>
              Cambio de Tienda no Autorizado
            </h3>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 16px',
              margin: '16px 0',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#334155'
            }}>
              <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                🏢 {clientUser.razon_social || clientUser.empresa || clientUser.name}
              </div>
              <div style={{ color: '#64748B', fontSize: '11.5px' }}>
                {clientUser.cuit || clientUser.numero_nit ? `CUIT: ${clientUser.cuit || clientUser.numero_nit} · ` : ''}
                Tienda asignada: <strong>{userCountryObj.flag} {userCountryObj.name}</strong>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px' }}>
              Esta tienda opera de forma exclusiva para <strong>{userCountryObj.name}</strong> bajo su reglamentación fiscal, impositiva (IVA 21%) y despachos desde depósitos nacionales.
              <br /><br />
              Tu cuenta corporativa no está autorizada para operar en la tienda de <strong>{attemptedCountry?.flag} {attemptedCountry?.name}</strong>. Para ingresar a ese mercado, debes cerrar sesión e identificarte con una cuenta corporativa habilitada en ese país.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCountryBlockedModal(false)}
                style={{
                  width: '100%',
                  background: '#0FA4DE',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.3)'
                }}
              >
                Permanecer en Tienda {userCountryObj.flag} {userCountryObj.name}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetCode = attemptedCountry?.code || 'AR';
                  handleLogout();
                  setShowCountryBlockedModal(false);
                  setSelectedCountryCode(targetCode);
                  try {
                    localStorage.setItem('dacas_selected_country', targetCode);
                    window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: targetCode } }));
                  } catch {}
                  fetchProducts(targetCode);
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                style={{
                  width: '100%',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión e Ingresar con cuenta de {attemptedCountry?.flag} {attemptedCountry?.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTÓN DE AYUDA DESPLEGABLE ESTILO MAC (EXCLUSIVO CLIENTES LOGUEADOS) ── */}
      {clientUser && (
        <ShopMacHelpHub
          clientUser={clientUser}
          generalSettings={generalSettings}
          onSelectProduct={setSelectedProduct}
          navigate={navigate}
          onOpenAuth={() => {
            setAuthError(null);
            setAuthSuccessMessage(null);
            setAuthModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function Shop(props) {
  return (
    <ShopErrorBoundary>
      <ShopMain {...props} />
    </ShopErrorBoundary>
  );
}

// Re-exports for backwards compatibility across the application
export {
  MOCK_PRODUCTS,
  DACAS_COUNTRIES,
  CategoryIcon,
  BrandLogoImg,
  CATEGORIES,
  BRAND_INFO,
  CATEGORY_BRANDS_MAP,
  DISALLOWED_BRANDS
} from "./components/shop/shopCatalogData";

export {
  AnimatedHeroStats,
  HERO_SLIDES,
  ShopErrorBoundary,
  ProductCard,
  ProductCarousel,
  BrandPromoBanners,
  BrandsDirectoryView,
  ShopMacHelpHub,
  ProductDetailModal,
  ProductDetailPageView,
  AuthModal
};
