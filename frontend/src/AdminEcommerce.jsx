import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import AdminProductFormTiendanube from './AdminProductFormTiendanube';
import BrandingVectorIcon from './BrandingVectorIcon';
import NotificationBell from './NotificationBell';
import { BRAND_INFO, BrandLogoImg } from './Shop';

const API_BASE_URL = `http://${window.location.hostname}:3001`;
const COLORS = ['#0fa4de', '#38bdf8', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
const PIE_COLORS = ['#0fa4de', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CATEGORIES = ['networking', 'infraestructura', 'comunicaciones_unificadas', 'security', 'General'];

// ── Mock data ──
const MOCK_ORDERS = [
  {
    id: 1055,
    user_id: 1,
    user_name: 'Juan Pérez',
    user_email: 'jperez@techsolutions.com',
    user_company: 'Tech Solutions S.A.',
    user_cuit: '30-71829340-9',
    user_phone: '+54 11 4567-8900',
    country_name: 'Argentina',
    country_id: 1,
    total: '756.50',
    subtotal: '890.00',
    discount_applied: '133.50',
    tax_applied: '0.00',
    shipping_applied: '0.00',
    status: 'procesando',
    payment_method: 'Transferencia B2B Bancaria (Factura A)',
    shipping_method: 'Envío Express a Domicilio',
    shipping_address: 'Av. del Libertador 4500, Depósito 2, Buenos Aires',
    tracking_number: 'DACAS-LOG-PENDING',
    po_number: 'OC-9842',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    items: [
      {
        id: 4,
        product_name: 'Fortinet FortiGate 60F - Next Generation Firewall',
        brand: 'Fortinet',
        sku: 'FG-60F-BDL-950-12',
        quantity: 1,
        price_at_purchase: '756.50',
        image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 1049,
    user_id: 1,
    user_name: 'Carlos Mendoza',
    user_email: 'cmendoza@redesit.com',
    user_company: 'Redes & Infraestructura IT SRL',
    user_cuit: '30-65489213-4',
    user_phone: '+54 11 5522-1100',
    country_name: 'Argentina',
    country_id: 1,
    total: '1530.00',
    subtotal: '1360.00',
    discount_applied: '135.60',
    tax_applied: '285.60',
    shipping_applied: '15.00',
    status: 'en_camino',
    payment_method: 'Cuenta Corriente Corporativa 30 días',
    shipping_method: 'Retiro en Centro Logístico DACAS',
    shipping_address: 'Panamericana Km 38.5, Tortuguitas, Buenos Aires',
    tracking_number: 'DACAS-LOG-AR-99388',
    po_number: 'OC-9730',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    items: [
      {
        id: 3,
        product_name: 'MikroTik Cloud Router Switch 24 Puertos PoE+ (4x10G SFP+)',
        brand: 'MikroTik',
        sku: 'CRS328-24P-4S',
        quantity: 1,
        price_at_purchase: '449.00',
        image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 1042,
    user_id: 2,
    user_name: 'Mariana Gomez',
    user_email: 'mgomez@connectcloud.cl',
    user_company: 'Connect Cloud Chile SpA',
    user_cuit: '76.421.890-K',
    user_phone: '+56 9 8765 4321',
    country_name: 'Chile',
    country_id: 2,
    total: '2470.00',
    subtotal: '2130.00',
    discount_applied: '127.30',
    tax_applied: '447.30',
    shipping_applied: '15.00',
    status: 'entregado',
    payment_method: 'Transferencia Bancaria Internacional',
    shipping_method: 'Despacho Aéreo Courier',
    shipping_address: 'Av. Providencia 1208, Of. 402, Santiago, Chile',
    tracking_number: 'DACAS-LOG-CL-99214',
    po_number: 'PO-2026-CH-44',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    items: [
      {
        id: 1,
        product_name: 'Fortinet FortiGate 60F - Next Generation Firewall',
        brand: 'Fortinet',
        sku: 'FG-60F-BDL-950-12',
        quantity: 2,
        price_at_purchase: '756.50',
        image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop'
      },
      {
        id: 2,
        product_name: 'Punto de Acceso Wi-Fi 6 Enterprise Aruba Instant On AP22',
        brand: 'Aruba',
        sku: 'R4W02A-AP22',
        quantity: 1,
        price_at_purchase: '195.00',
        image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000&auto=format&fit=crop'
      }
    ]
  }
];
const MOCK_PRODUCTS = [];
const MOCK_RULES = [];

// --- DEFAULT CHECKOUT METHODS (SHIPPING & PAYMENT) ---
const DEFAULT_CHECKOUT_METHODS = {
  shipping: [
    {
      id: 'express',
      enabled: true,
      title: 'Envío Express a Domicilio',
      subtitle: 'Despacho a Planta / Oficina',
      badge: 'Recomendado',
      icon: '🚚',
      priceText: 'Bonificado (B2B)',
      description: 'Envío directo puerta a puerta a la dirección declarada de la empresa.'
    },
    {
      id: 'hub',
      enabled: true,
      title: 'Retiro en HUB DACAS',
      subtitle: 'Depósito Central (Sin Cargo)',
      badge: 'Gratis',
      icon: '🏢',
      priceText: 'Sin cargo',
      description: 'Retiro por depósito central o centro logístico DACAS en el país.'
    },
    {
      id: 'expreso',
      enabled: true,
      title: 'Expreso / Transporte Propio',
      subtitle: 'Despacho a receptoría de expreso',
      badge: 'Interior',
      icon: '🚛',
      priceText: 'A cargo del cliente',
      description: 'Despacho hacia la receptoría o transporte que el integrador contrate.'
    }
  ],
  payment: [
    {
      id: 'cuenta_corriente',
      enabled: true,
      title: 'Cuenta Corriente Comercial B2B DACAS',
      subtitle: 'Pago diferido contra factura y límite crediticio asignado a tu empresa.',
      icon: 'bank',
      terms: ['30_dias', '60_dias'],
      terms_label: 'Plazo de Facturación:',
      instrucciones: 'Sujeto a verificación de línea crediticia aprobada en DACAS.'
    },
    {
      id: 'transferencia',
      enabled: true,
      title: 'Transferencia Bancaria Directa (CBU / SWIFT)',
      subtitle: 'Se emitirá la Factura Proforma con cuentas en BBVA / Banco Santander para depósito en USD o ARS al tipo de cambio oficial.',
      badge: 'Inmediato',
      icon: '💸',
      banco: 'Banco Santander / BBVA Argentina',
      titular: 'DACAS S.A.',
      cuit: '30-68942158-9',
      cbu: '0720123920000001234567',
      alias: 'DACAS.PAGOS.B2B',
      swift: 'BAPROARBAXXX',
      tipo_cuenta: 'Cuenta Corriente Especial en USD / ARS',
      instrucciones: 'Una vez efectuada la transferencia, adjuntá el comprobante a cobranzas@dacas.com indicando tu número de orden.'
    },
    {
      id: 'tarjeta',
      enabled: true,
      title: 'Tarjeta Corporativa / Débito (Stripe Secure)',
      subtitle: 'Procesamiento online seguro e inmediato con Visa, Mastercard, American Express B2B.',
      badge: 'Online',
      icon: '💳',
      gateway: 'Stripe SSL 256-bit',
      instrucciones: 'Transacción encriptada y protegida bajo normativa PCI-DSS Nivel 1.'
    },
    {
      id: 'echeq',
      enabled: true,
      title: 'Cheque de Pago Diferido / E-Cheq',
      subtitle: 'Endoso y recepción de cheques electrónicos interbancarios COELSA.',
      badge: 'Financiamiento',
      icon: '📑',
      cuit_receptor: '30-68942158-9',
      banco_receptor: 'Banco Santander',
      plazos_admitidos: '30 y 60 días fecha factura',
      instrucciones: 'Emitir o endosar el E-Cheq a favor de DACAS S.A. (CUIT 30-68942158-9) mediante homebanking.'
    }
  ],
  terms_conditions_text: 'Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial de fabricante de 12/36 meses y la emisión de la orden de compra con carácter vinculante para reserva de stock.'
};

const DACAS_COUNTRIES_LIST = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', id: 2 },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', id: 4 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', id: 5 },
  { code: 'MX', name: 'México', flag: '🇲🇽', id: 8 },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', id: 1 },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', id: 12 },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', id: 10 },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', id: 3 },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', id: 6 },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', id: 7 },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', id: 9 },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', id: 11 }
];

function AdminEcommerce({ embedded = false }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  // ── Primary Key / Country Scope Pivot ──
  const [selectedCountryScope, setSelectedCountryScope] = useState(() => {
    try {
      return localStorage.getItem('dacas_admin_country_scope') || 'AR';
    } catch {
      return 'AR';
    }
  });

  const activeCountryObj = selectedCountryScope === 'all'
    ? { code: 'all', name: 'Todos los Países', flag: '🌐', id: null }
    : (DACAS_COUNTRIES_LIST.find(c => c.code === selectedCountryScope) || DACAS_COUNTRIES_LIST[0]);

  const handleCountryScopeChange = (code) => {
    setSelectedCountryScope(code);
    try {
      localStorage.setItem('dacas_admin_country_scope', code);
      if (code !== 'all') {
        localStorage.setItem('dacas_selected_country', code);
        window.dispatchEvent(new CustomEvent('dacas_country_changed', { detail: { country: code } }));
      }
    } catch {}
  };

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [countries, setCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const bannerFileInputRef = useRef(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Product Filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterStock, setFilterStock] = useState('all');

  // Order Filters & Modals
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderCountryFilter, setOrderCountryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  // ── Primary Key / Country Scope Partitioning ──
  const countryScopedUsers = users.filter(u => {
    if (selectedCountryScope === 'all') return true;
    const userCountryCode = (u.country_code || '').toUpperCase();
    const userCountryId = Number(u.country_id);
    const userCountryName = (u.country_name || '').toLowerCase();
    return (activeCountryObj.code && userCountryCode === activeCountryObj.code) ||
           (activeCountryObj.id && userCountryId === activeCountryObj.id) ||
           (activeCountryObj.name && userCountryName.includes(activeCountryObj.name.toLowerCase()));
  });

  const countryScopedOrders = orders.filter(o => {
    if (selectedCountryScope === 'all') return true;
    const oCountryId = Number(o.country_id);
    const oCountryCode = (o.country_code || '').toUpperCase();
    const oCountryName = (o.country_name || '').toLowerCase();
    return (activeCountryObj.id && oCountryId === activeCountryObj.id) ||
           (activeCountryObj.code && oCountryCode === activeCountryObj.code) ||
           (activeCountryObj.name && oCountryName.includes(activeCountryObj.name.toLowerCase()));
  });

  const filteredOrders = countryScopedOrders.filter(o => {
    const q = (orderSearch || '').toLowerCase();
    const matchSearch = !orderSearch ||
      (String(o.id).includes(q)) ||
      (o.user_name && o.user_name.toLowerCase().includes(q)) ||
      (o.user_email && o.user_email.toLowerCase().includes(q)) ||
      (o.user_company && o.user_company.toLowerCase().includes(q)) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(q)) ||
      (o.po_number && o.po_number.toLowerCase().includes(q));
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter ||
      (orderStatusFilter === 'paid' && (o.status === 'paid' || o.status === 'completed' || o.status === 'entregado')) ||
      (orderStatusFilter === 'pending' && (o.status === 'pending' || o.status === 'procesando'));
    const matchCountry = orderCountryFilter === 'all' || String(o.country_id) === String(orderCountryFilter);
    return matchSearch && matchStatus && matchCountry;
  });

  const filteredProducts = products.filter(p => {
    if (selectedCountryScope !== 'all') {
      const pCountry = (p.country_code || 'AR').toUpperCase();
      if (pCountry !== selectedCountryScope.toUpperCase()) return false;
    }
    const q = (productSearch || '').toLowerCase();
    const matchSearch = !productSearch ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    const matchCat = !selectedCategory || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) || (Array.isArray(p.categories) && p.categories.includes(selectedCategory));
    const matchStock = filterStock === 'all' || (filterStock === 'in_stock' && Number(p.stock) > 0) || (filterStock === 'out_of_stock' && Number(p.stock) === 0);
    return matchSearch && matchCat && matchStock;
  });

  // Product Cloning State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [productToClone, setProductToClone] = useState(null);
  const [cloneTargetCountry, setCloneTargetCountry] = useState('CL');
  const [isCloning, setIsCloning] = useState(false);

  const handleOpenCloneModal = (p) => {
    setProductToClone(p);
    const currentCode = (p.country_code || 'AR').toUpperCase();
    const otherCountry = DACAS_COUNTRIES_LIST.find(c => c.code !== currentCode) || DACAS_COUNTRIES_LIST[1];
    setCloneTargetCountry(otherCountry.code);
    setShowCloneModal(true);
  };

  const handleExecuteClone = async () => {
    if (!productToClone || !cloneTargetCountry) return;
    setIsCloning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${productToClone.id}/clone`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_country: cloneTargetCountry })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al clonar el producto');
      alert(`✅ Producto "${productToClone.name}" clonado con éxito a ${cloneTargetCountry}!`);
      setShowCloneModal(false);
      setProductToClone(null);
      fetchProducts(selectedCountryScope);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  // Forms and modals
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '' });

  const [showCountryForm, setShowCountryForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({ code: '', name: '', tax_rate: '0', shipping_cost: '0', nationalization_cost: '0', discount_rate: '0' });

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [productStockList, setProductStockList] = useState([]);
  const [stockForm, setStockForm] = useState({ country_id: '', stock: '' });

  // USER Form & Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [openActionDropdown, setOpenActionDropdown] = useState(null); // stores user.id of open dropdown
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 }); // pixel coords for fixed dropdown
  const [userCreateMode, setUserCreateMode] = useState('new_company'); // 'new_company' | 'existing_company'
  const [selectedExistingCompany, setSelectedExistingCompany] = useState('');
  const initialUserForm = {
    name: '', email: '', password: '', status: 'activo', cargo: 'Encargado de Compras',
    razon_social: '', tipo_cliente: 'Reseller / Integrador IT', direccion_legal: '', localidad: '', codigo_postal: '', ciudad: '', country_id: '', phone: '', fecha_limite_facturacion: '', web: '',
    report_to_country_id: '', vendedor: '', direccion_entrega: '', localidad_entrega: '', codigo_postal_entrega: '', ciudad_entrega: '', pais_entrega_id: '', tipo_iva: '', numero_nit: '',
    nombre_compras: '', telefono_compras: '', email_compras: '',
    nombre_pagos: '', telefono_pagos: '', email_pagos: '',
    nombre_admin: '', telefono_admin: '', email_admin: '',
    email_factura_electronica: '', email_contacto_compras: '', email_cotizaciones_automaticas: '',
    iibb_jurisdiccion: '901 - Capital Federal',
    iibb_tipo: 'C.M.',
    iibb_numero: '',
    iibb_codigo_aceptacion: false,
    percepciones: {
      caba: { enabled: true, alicuota: 1.5, vigencia: '2026-10-01' },
      bsas: { enabled: false, alicuota: 0.0, vigencia: '2026-10-01' },
      salta: { enabled: false, alicuota: 0.0, vigencia: '2019-08-01' },
      misiones: { enabled: false, alicuota: 0.0, vigencia: '2023-05-01' },
      tucuman: { enabled: false, alicuota: 0.0, coef: 0.0, vigencia: '2025-06-01' }
    }
  };
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userFormSection, setUserFormSection] = useState(1);

  const handlePercepcionChange = (provKey, field, val) => {
    setUserForm(prev => ({
      ...prev,
      percepciones: {
        ...(prev.percepciones || {}),
        [provKey]: {
          ...(prev.percepciones?.[provKey] || {}),
          [field]: val
        }
      }
    }));
  };

  // RULES & COUPONS Form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleFilterType, setRuleFilterType] = useState('all'); // 'all' | 'coupons' | 'rules'
  const initialRuleForm = {
    name: '', 
    rule_type: 'discount', 
    value_type: 'percentage', 
    value: '',
    tipo_cliente: '', 
    brand: '', 
    country_id: '', 
    product_id: '', 
    user_id: '',
    priority: '0', 
    is_active: true,
    is_coupon: true, // true = Coupon with code, false = automatic B2B pricing rule
    coupon_code: '',
    min_order_amount: '',
    valid_until: '',
    usage_limit: '',
    times_used: 0
  };
  const [ruleForm, setRuleForm] = useState(initialRuleForm);

  // BULK PRODUCT CSV UPLOAD
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [bulkMode, setBulkMode] = useState('upsert');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [bulkDragOver, setBulkDragOver] = useState(false);

  // ── Visual & Shop Customization State ──
  const [visualConfig, setVisualConfig] = useState(null);
  const [visualSubTab, setVisualSubTab] = useState('hero'); // 'hero' | 'announcement' | 'categories' | 'brands' | 'contact'
  const [isSavingVisual, setIsSavingVisual] = useState(false);
  const [visualSaveSuccess, setVisualSaveSuccess] = useState(false);
  const [editingSlideIdx, setEditingSlideIdx] = useState(0);

  // ── Brand & Country Management State ──
  const [editingBrandModal, setEditingBrandModal] = useState(null); // { brandKey, catKey, brandIdx, name, logo, tagline, color, countries, isGlobal }
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [brandAdminSearch, setBrandAdminSearch] = useState('');
  const [brandAdminCategory, setBrandAdminCategory] = useState('all');
  const [brandCountryFilter, setBrandCountryFilter] = useState('all');
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    logo: '',
    tagline: '',
    color: '#0fa4de',
    category: 'networking',
    isGlobal: true,
    countries: []
  });

  const allAdminBrands = useMemo(() => {
    const keysSet = new Set(Object.keys(BRAND_INFO || {}));
    if (visualConfig?.brandCustomInfo) {
      Object.keys(visualConfig.brandCustomInfo).forEach(k => {
        if (k) keysSet.add(k.toLowerCase());
      });
    }
    Object.values(visualConfig?.categoryBrands || {}).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => {
          const name = typeof item === 'string' ? item : item?.name;
          if (name) keysSet.add(name.toLowerCase());
        });
      }
    });
    products.forEach(p => {
      if (p.brand) keysSet.add(p.brand.toLowerCase());
    });

    return Array.from(keysSet).map(key => {
      const defaultInfo = BRAND_INFO?.[key] || {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        logo: '',
        tagline: `Soluciones corporativas oficiales ${key.toUpperCase()}`,
        color: '#0fa4de'
      };
      const custom = visualConfig?.brandCustomInfo?.[key] || {};
      const finalName = custom.name || defaultInfo.name || (key.charAt(0).toUpperCase() + key.slice(1));
      const finalLogo = custom.logo !== undefined ? custom.logo : (defaultInfo.logo || '');
      const finalTagline = custom.tagline || defaultInfo.tagline || `Soluciones corporativas oficiales ${key.toUpperCase()}`;
      const finalColor = custom.color || defaultInfo.color || '#0fa4de';

      let catKey = 'networking';
      let originalIdx = -1;
      Object.entries(visualConfig?.categoryBrands || {}).forEach(([cat, list]) => {
        if (Array.isArray(list)) {
          const idx = list.findIndex(item => {
            const bName = typeof item === 'string' ? item : item?.name;
            return bName && bName.toLowerCase() === key;
          });
          if (idx !== -1) {
            catKey = cat;
            originalIdx = idx;
          }
        }
      });

      let countries = [];
      if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[key])) {
        countries = visualConfig.brandCountries[key];
      }

      const prodCount = products.filter(p => p.brand && p.brand.toLowerCase() === key).length;

      return {
        key,
        name: finalName,
        logo: finalLogo,
        tagline: finalTagline,
        color: finalColor,
        category: catKey,
        originalIdx,
        countries,
        productCount: prodCount,
        hasCustomLogo: Boolean(custom.logo),
        hasCustomTagline: Boolean(custom.tagline)
      };
    });
  }, [visualConfig, products]);

  const filteredAdminBrands = useMemo(() => {
    return allAdminBrands.filter(b => {
      const matchCat = brandAdminCategory === 'all' || b.category === brandAdminCategory;
      const q = brandAdminSearch.toLowerCase().trim();
      const matchSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.key.includes(q);
      return matchCat && matchSearch;
    }).sort((a, b) => (b.productCount - a.productCount) || a.name.localeCompare(b.name));
  }, [allAdminBrands, brandAdminSearch, brandAdminCategory]);

  // ── Checkout Methods (Shipping & Payment) State ──
  const [checkoutMethods, setCheckoutMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('dacas_checkout_methods');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKOUT_METHODS;
    } catch {
      return DEFAULT_CHECKOUT_METHODS;
    }
  });
  const [isSavingCheckout, setIsSavingCheckout] = useState(false);
  const [checkoutSaveSuccess, setCheckoutSaveSuccess] = useState(false);
  const [checkoutSubTab, setCheckoutSubTab] = useState('shipping'); // 'shipping' | 'payment'

  // ── Apli ERP & API Integration State ──
  const [apliConfig, setApliConfig] = useState({
    enabled: true,
    endpointUrl: 'https://api.apli.com.ar/v2',
    apiKey: 'apli_live_dk928374910284719283',
    clientId: 'DACAS-ARG-001',
    clientSecret: 'sk_live_998124018274019283401928',
    environment: 'production',
    syncProducts: true,
    syncStock: true,
    syncOrders: true,
    syncCustomers: true,
    syncPrices: true,
    syncInterval: 'realtime',
    webhookUrl: '/api/ecommerce/settings/apli/webhook',
    webhookSecret: 'whsec_apli_dacas_99214710',
    autoApproveVerifiedCustomers: true,
    lastSync: new Date().toISOString(),
    connectionStatus: 'connected',
    lastLatencyMs: 38
  });
  const [apliLogs, setApliLogs] = useState([]);
  const [isSavingApli, setIsSavingApli] = useState(false);
  const [apliSaveSuccess, setApliSaveSuccess] = useState(false);
  const [apliTesting, setApliTesting] = useState(false);
  const [apliTestResult, setApliTestResult] = useState(null);
  const [apliSyncing, setApliSyncing] = useState(false);
  const [apliSyncResult, setApliSyncResult] = useState(null);
  const [showApliApiKey, setShowApliApiKey] = useState(false);
  const [showApliSecret, setShowApliSecret] = useState(false);
  const [apliSubTab, setApliSubTab] = useState('config'); // 'config' | 'sync' | 'webhooks' | 'logs'

  // ── N8N AI Agent Bot State ──
  const [n8nConfig, setN8nConfig] = useState({
    enabled: true,
    botName: 'DACAS AI Copilot B2B',
    botSubtitle: 'Asistente de Preventa, Stock & Cotizaciones B2B',
    avatarIcon: '🤖',
    primaryColor: '#0fa4de',
    webhookUrl: 'https://n8n.dacas.com/webhook/dacas-b2b-agent',
    authHeaderName: 'X-N8N-API-KEY',
    authToken: 'n8n_sec_dacas_ai_agent_99812401',
    timeoutMs: 15000,
    fallbackToInternalAI: true,
    systemPrompt: `Eres el Asistente Inteligente y Agente de Preventa B2B de DACAS Mayorista. Tu función es ayudar a integradores, resellers y empresas a encontrar hardware, licencias y soluciones de Ciberseguridad (Fortinet), Networking (Aruba), Infraestructura & Energía (Vertiv, APC) y Comunicaciones Unificadas (Poly). Respondes con precios de referencia en USD mayorista, disponibilidad de stock y guías para cotización formal.`,
    welcomeMessage: '👋 ¡Hola! Soy el Copilot de IA de DACAS B2B conectado a agentes de n8n. ¿En qué puedo ayudarte hoy? Puedo verificar stock en tiempo real, cotizar productos o asesorarte sobre soluciones técnicas.',
    suggestedQuestions: [
      '🔍 ¿Qué stock tienen de FortiGate-60F?',
      '⚡ Recomiéndame switches Aruba de 24 puertos',
      '📑 ¿Cómo registrar mi empresa como integrador B2B?',
      '💳 ¿Cuáles son los métodos de pago y despacho?'
    ],
    enabledTools: {
      searchProducts: true,
      checkStock: true,
      calculateQuote: true,
      recommendSolutions: true,
      checkOrderStatus: true,
      createSupportTicket: true
    },
    aiModel: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 1000,
    status: 'active',
    conversationsCount: 142,
    resolutionRate: '94%'
  });
  const [n8nLogs, setN8nLogs] = useState([]);
  const [n8nWorkflow, setN8nWorkflow] = useState(null);
  const [n8nSubTab, setN8nSubTab] = useState('config'); // 'config' | 'playground' | 'workflow' | 'logs'
  const [isSavingN8n, setIsSavingN8n] = useState(false);
  const [n8nSaveSuccess, setN8nSaveSuccess] = useState(false);
  const [n8nTesting, setN8nTesting] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState(null);
  const [showN8nToken, setShowN8nToken] = useState(false);

  // Playground Chat State
  const [playgroundMessages, setPlaygroundMessages] = useState([
    {
      id: 'p_welcome',
      sender: 'bot',
      text: '👋 ¡Hola! Soy el entorno de pruebas del Agente n8n. Puedes consultarme sobre productos, stock en tiempo real o cualquier regla comercial para probar mis respuestas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [isPlaygroundTyping, setIsPlaygroundTyping] = useState(false);

  useEffect(() => {
    fetchProducts(selectedCountryScope);
    fetchVisualSettings(selectedCountryScope);
    fetchCheckoutMethods(selectedCountryScope);
    fetchUsers(selectedCountryScope);
  }, [selectedCountryScope]);

  useEffect(() => {
    fetchOrders();
    fetchCountries();
    fetchRules();
    fetchApliSettings();
    fetchApliLogs();
    fetchN8nSettings();
    fetchN8nLogs();
    fetchN8nWorkflow();
  }, []);

  const fetchN8nSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot`);
      if (res.ok) {
        const data = await res.json();
        setN8nConfig(data);
      }
    } catch (err) {
      console.error('Error fetching n8n bot settings:', err);
    }
  };

  const fetchN8nLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/logs`);
      if (res.ok) {
        const data = await res.json();
        setN8nLogs(data);
      }
    } catch (err) {
      console.error('Error fetching n8n bot logs:', err);
    }
  };

  const fetchN8nWorkflow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/workflow-template`);
      if (res.ok) {
        const data = await res.json();
        setN8nWorkflow(data);
      }
    } catch (err) {
      console.error('Error fetching n8n workflow:', err);
    }
  };

  const handleSaveN8nSettings = async () => {
    setIsSavingN8n(true);
    setN8nSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(n8nConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar configuración del Bot n8n');
      if (data.config) setN8nConfig(data.config);
      setN8nSaveSuccess(true);
      fetchN8nLogs();
      setTimeout(() => setN8nSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error al guardar configuración del Bot n8n: ' + err.message);
    } finally {
      setIsSavingN8n(false);
    }
  };

  const handleTestN8nConnection = async () => {
    setN8nTesting(true);
    setN8nTestResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/test`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(n8nConfig)
      });
      const data = await res.json();
      setN8nTestResult(data);
      setTimeout(() => setN8nTestResult(null), 8000);
    } catch (err) {
      setN8nTestResult({ success: false, message: 'Error de conexión con n8n: ' + err.message });
    } finally {
      setN8nTesting(false);
    }
  };

  const handlePlaygroundSend = async (customText = null) => {
    const textToSend = customText || playgroundInput;
    if (!textToSend.trim() || isPlaygroundTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPlaygroundMessages(prev => [...prev, userMsg]);
    if (!customText) setPlaygroundInput('');
    setIsPlaygroundTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/n8n-bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId: 'admin_playground',
          userContext: { name: 'Administrador DACAS', role: 'admin' }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPlaygroundMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.response,
            recommendedProducts: data.recommendedProducts || [],
            toolUsed: data.toolUsed,
            latencyMs: data.latencyMs,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        fetchN8nLogs();
      } else {
        throw new Error(data.error || 'Error al procesar');
      }
    } catch (err) {
      setPlaygroundMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Error al comunicarse con el agente n8n: ' + err.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsPlaygroundTyping(false);
    }
  };

  const handleResetN8nSettings = async () => {
    if (!window.confirm('¿Deseas restablecer los parámetros del Bot n8n a los valores oficiales?')) return;
    setIsSavingN8n(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/n8n-bot/reset`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setN8nConfig(data.config);
        fetchN8nLogs();
        setN8nSaveSuccess(true);
        setTimeout(() => setN8nSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error al restablecer Bot n8n: ' + err.message);
    } finally {
      setIsSavingN8n(false);
    }
  };

  const fetchApliSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli`);
      if (res.ok) {
        const data = await res.json();
        setApliConfig(data);
      }
    } catch (err) {
      console.error('Error fetching Apli settings:', err);
    }
  };

  const fetchApliLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/logs`);
      if (res.ok) {
        const data = await res.json();
        setApliLogs(data);
      }
    } catch (err) {
      console.error('Error fetching Apli logs:', err);
    }
  };

  const handleSaveApliSettings = async () => {
    setIsSavingApli(true);
    setApliSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(apliConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar configuración de Apli');
      if (data.config) setApliConfig(data.config);
      setApliSaveSuccess(true);
      fetchApliLogs();
      setTimeout(() => setApliSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error al guardar configuración de Apli: ' + err.message);
    } finally {
      setIsSavingApli(false);
    }
  };

  const handleTestApliConnection = async () => {
    setApliTesting(true);
    setApliTestResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/test`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(apliConfig)
      });
      const data = await res.json();
      setApliTestResult(data);
      if (data.connected) {
        setApliConfig(prev => ({ ...prev, connectionStatus: 'connected', lastLatencyMs: data.latencyMs, lastSync: data.timestamp }));
      }
      fetchApliLogs();
      setTimeout(() => setApliTestResult(null), 8000);
    } catch (err) {
      setApliTestResult({ success: false, message: 'Error de red al conectar con Apli: ' + err.message });
    } finally {
      setApliTesting(false);
    }
  };

  const handleSyncApliNow = async (syncType = 'all') => {
    setApliSyncing(true);
    setApliSyncResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/sync`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ syncType })
      });
      const data = await res.json();
      if (res.ok) {
        setApliSyncResult(data);
        setApliConfig(prev => ({ ...prev, lastSync: data.lastSync, connectionStatus: 'connected' }));
        fetchApliLogs();
        fetchProducts();
        fetchOrders();
        setTimeout(() => setApliSyncResult(null), 6000);
      } else {
        throw new Error(data.error || 'Error al sincronizar');
      }
    } catch (err) {
      setApliSyncResult({ success: false, message: 'Error en sincronización: ' + err.message });
    } finally {
      setApliSyncing(false);
    }
  };

  const handleResetApli = async () => {
    if (!window.confirm('¿Deseas restablecer los parámetros de Apli por defecto?')) return;
    setIsSavingApli(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/apli/reset`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setApliConfig(data.config);
        fetchApliLogs();
        setApliSaveSuccess(true);
        setTimeout(() => setApliSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error al restablecer Apli: ' + err.message);
    } finally {
      setIsSavingApli(false);
    }
  };

  const fetchCheckoutMethods = async (countryCode) => {
    try {
      const code = countryCode || (selectedCountryScope !== 'all' ? selectedCountryScope : 'AR');
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        setCheckoutMethods(data);
        localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching checkout methods:', err);
    }
  };

  const handleSaveCheckoutMethods = async () => {
    setIsSavingCheckout(true);
    setCheckoutSaveSuccess(false);
    try {
      const code = selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(checkoutMethods));
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods?country=${code}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(checkoutMethods)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar métodos de pago y envío');
      if (data.config) setCheckoutMethods(data.config);
      setCheckoutSaveSuccess(true);
      setTimeout(() => setCheckoutSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error guardando métodos de pago y envío: ' + err.message);
    } finally {
      setIsSavingCheckout(false);
    }
  };

  const handleResetCheckoutMethods = async () => {
    const code = selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
    if (!window.confirm(`¿Deseas restablecer los métodos de envío y formas de pago para ${activeCountryObj.name || code} a los valores oficiales por defecto?`)) return;
    setIsSavingCheckout(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/checkout-methods/reset?country=${code}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setCheckoutMethods(data.config);
        localStorage.setItem(`dacas_checkout_methods_${code}`, JSON.stringify(data.config));
        setCheckoutSaveSuccess(true);
        setTimeout(() => setCheckoutSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error resetting checkout methods:', err);
    } finally {
      setIsSavingCheckout(false);
    }
  };

  const sanitizeVisualConfig = (config) => {
    if (!config) return config;
    const slides = Array.isArray(config.heroSlides) ? config.heroSlides : [];
    const seenIds = new Set();
    const sanitizedSlides = slides.map((s, idx) => {
      let id = s.id;
      if (id === undefined || id === null || seenIds.has(String(id))) {
        id = `slide_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(String(id));
      const rawMetrics = Array.isArray(s.metrics) ? s.metrics : [];
      const defaultMetrics = [
        { value: '+25 Años', label: 'Liderando el Mercado IT' },
        { value: '12 Países', label: 'Cobertura Regional' },
        { value: '24/7', label: 'Soporte y Garantía Oficial' }
      ];
      const metrics = [
        rawMetrics[0] || defaultMetrics[0],
        rawMetrics[1] || defaultMetrics[1],
        rawMetrics[2] || defaultMetrics[2]
      ];
      return {
        ...s,
        id,
        metrics
      };
    });

    const defaultBrandBanners = [
      {
        id: 'brand_banner_1',
        brand: 'Fortinet',
        title: 'Fortinet Security Fabric',
        subtitle: 'Firewalls NGFW FortiGate y protección perimetral con procesamiento SOC4',
        badge: 'CIBERSEGURIDAD LÍDER',
        accentColor: '#EE3124',
        buttonText: 'Explorar Fortinet',
        imageUrl: '',
        targetCategory: 'security',
        enabled: true
      },
      {
        id: 'brand_banner_2',
        brand: 'Vertiv',
        title: 'Vertiv Critical Power',
        subtitle: 'Sistemas UPS Online doble conversión y racks de alta densidad para Data Centers',
        badge: 'ENERGÍA CRÍTICA',
        accentColor: '#38bdf8',
        buttonText: 'Ver Soluciones Vertiv',
        imageUrl: '',
        targetCategory: 'infraestructura',
        enabled: true
      },
      {
        id: 'brand_banner_3',
        brand: 'MikroTik',
        title: 'MikroTik Routing & Core',
        subtitle: 'Switches gestionables Gigabit PoE+ y routers para enlaces de fibra óptica de alto tráfico',
        badge: 'NETWORKING ENTERPRISE',
        accentColor: '#10b981',
        buttonText: 'Ver Equipos MikroTik',
        imageUrl: '',
        targetCategory: 'networking',
        enabled: true
      }
    ];

    const brandBanners = (Array.isArray(config.brandBanners) && config.brandBanners.length > 0)
      ? config.brandBanners
      : defaultBrandBanners;

    const homeCarousels = {
      featured: {
        enabled: true,
        title: '🔥 Productos Destacados',
        subtitle: 'Equipamiento de alta demanda con entrega inmediata y garantía oficial DACAS',
        productIds: [],
        ...(config.homeCarousels?.featured || {})
      },
      custom: {
        enabled: true,
        title: '⚡ Oportunidades & Novedades IT',
        subtitle: 'Soluciones corporativas seleccionadas con precios mayoristas especiales para canales',
        productIds: [],
        ...(config.homeCarousels?.custom || {})
      }
    };

    return {
      ...config,
      heroSlides: sanitizedSlides,
      brandBanners,
      homeCarousels
    };
  };

  const fetchVisualSettings = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const target = (code && code !== 'all') ? code : 'AR';
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${target}`);
      if (res.ok) {
        const data = await res.json();
        setVisualConfig(sanitizeVisualConfig(data));
      }
    } catch (err) {
      console.error('Error fetching visual settings:', err);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('dacas_token') || sessionStorage.getItem('token');
    const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (sessionId) headers['x-session-id'] = sessionId;
    return headers;
  };

  const handleSaveVisualSettings = async () => {
    setIsSavingVisual(true);
    setVisualSaveSuccess(false);
    try {
      const target = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${target}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(visualConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar diseño');
      setVisualConfig(sanitizeVisualConfig(data.config || visualConfig));
      setVisualSaveSuccess(true);
      setTimeout(() => setVisualSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error guardando personalización: ' + err.message);
    } finally {
      setIsSavingVisual(false);
    }
  };

  const handleResetVisualSettings = async () => {
    const target = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
    if (!window.confirm(`¿Deseas restaurar la configuración visual de ${target} a la plantilla oficial de DACAS?`)) return;
    setIsSavingVisual(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual/reset?country=${target}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setVisualConfig(sanitizeVisualConfig(data.config));
        setVisualSaveSuccess(true);
        setTimeout(() => setVisualSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error al restablecer: ' + err.message);
    } finally {
      setIsSavingVisual(false);
    }
  };

  const handleAddSlide = () => {
    if (!visualConfig) return;
    const newSlide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      badge: 'NUEVA SOLUCIÓN DACAS',
      badgeIcon: '🚀',
      titleLine1: 'Título de la Solución',
      titleLine2: 'Hardware & Licencias Oficiales',
      titleColor: '#0fa4de',
      desc: 'Descripción destacada de la tecnología, marcas y servicios de valor agregado para integradores.',
      primaryBtn: { text: 'Ver Catálogo', cat: 'all' },
      secondaryBtn: { text: 'Consultar Stock', cat: 'all' },
      type: 'metrics',
      metrics: [
        { value: 'Entrega Inmediata', label: 'Stock Regional' },
        { value: 'Garantía Oficial', label: 'Respaldo DACAS' },
        { value: 'Soporte 24/7', label: 'Preventa Certificada' }
      ]
    };
    const updatedSlides = [...(visualConfig.heroSlides || []), newSlide];
    setVisualConfig({ ...visualConfig, heroSlides: updatedSlides });
    setEditingSlideIdx(updatedSlides.length - 1);
  };

  const handleDeleteSlide = (index) => {
    if (!visualConfig || (visualConfig.heroSlides || []).length <= 1) {
      alert('Debe existir al menos un banner en el carousel del Shop.');
      return;
    }
    const updated = visualConfig.heroSlides.filter((_, idx) => idx !== index);
    setVisualConfig({ ...visualConfig, heroSlides: updated });
    setEditingSlideIdx(prev => Math.min(prev >= index ? Math.max(0, prev - 1) : prev, updated.length - 1));
  };

  const handleMoveSlide = (index, direction) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    let newEditingIdx = editingSlideIdx;
    if (editingSlideIdx === index) {
      newEditingIdx = targetIdx;
    } else if (editingSlideIdx === targetIdx) {
      newEditingIdx = index;
    }

    setVisualConfig({ ...visualConfig, heroSlides: slides });
    setEditingSlideIdx(newEditingIdx);
  };

  const handleUpdateSlideField = (index, field, value) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    const updatedSlide = { ...slides[index], [field]: value };
    if (field === 'type' || !updatedSlide.metrics || updatedSlide.metrics.length < 3) {
      const rawMetrics = Array.isArray(updatedSlide.metrics) ? updatedSlide.metrics : [];
      const defaultMetrics = [
        { value: '+25 Años', label: 'Liderando el Mercado IT' },
        { value: '12 Países', label: 'Cobertura Regional' },
        { value: '24/7', label: 'Soporte y Garantía Oficial' }
      ];
      updatedSlide.metrics = [
        rawMetrics[0] || defaultMetrics[0],
        rawMetrics[1] || defaultMetrics[1],
        rawMetrics[2] || defaultMetrics[2]
      ];
    }
    slides[index] = updatedSlide;
    setVisualConfig({ ...visualConfig, heroSlides: slides });
  };

  const handleUpdateSlideBtn = (index, btnType, field, value) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    const btn = slides[index][btnType] || {};
    slides[index] = {
      ...slides[index],
      [btnType]: { ...btn, [field]: value }
    };
    setVisualConfig({ ...visualConfig, heroSlides: slides });
  };

  const handleUpdateSlideMetric = (slideIdx, metricIdx, field, value) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    const currentSlide = slides[slideIdx] || {};
    const rawMetrics = Array.isArray(currentSlide.metrics) ? currentSlide.metrics : [];
    const defaultMetrics = [
      { value: '+25 Años', label: 'Liderando el Mercado IT' },
      { value: '12 Países', label: 'Cobertura Regional' },
      { value: '24/7', label: 'Soporte y Garantía Oficial' }
    ];
    const metrics = [
      { ...(rawMetrics[0] || defaultMetrics[0]) },
      { ...(rawMetrics[1] || defaultMetrics[1]) },
      { ...(rawMetrics[2] || defaultMetrics[2]) }
    ];
    metrics[metricIdx] = { ...metrics[metricIdx], [field]: value };
    slides[slideIdx] = { ...currentSlide, metrics };
    setVisualConfig({ ...visualConfig, heroSlides: slides });
  };
  const handleBannerFileUpload = async (e, slideIdx) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 15 MB.');
      return;
    }

    try {
      setUploadingBanner(true);
      // 1. Lectura inmediata en Base64 para vista previa local sin latencia
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;
        handleUpdateSlideField(slideIdx, 'imageUrl', base64Url);

        // 2. Intentar subir al servidor para persistencia de archivo
        try {
          const formData = new FormData();
          formData.append('image', file);
          const token = localStorage.getItem('token') || localStorage.getItem('crm_token');
          const res = await fetch(`${API_BASE_URL}/api/system/branding/upload`, {
            method: 'POST',
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              handleUpdateSlideField(slideIdx, 'imageUrl', `${API_BASE_URL}${data.url}`);
            }
          }
        } catch (_) {}
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al cargar archivo de banner:', err);
      alert('Error al leer el archivo de la PC.');
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  // ── Brand Banners (Home) & Home Carousels Handlers ──
  const handleUpdateBrandBanner = (index, field, value) => {
    if (!visualConfig) return;
    const banners = [...(visualConfig.brandBanners || [])];
    banners[index] = { ...banners[index], [field]: value };
    setVisualConfig({ ...visualConfig, brandBanners: banners });
  };

  const handleBrandBannerFileUpload = async (e, bannerIdx) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 15 MB.');
      return;
    }
    try {
      setUploadingBanner(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;
        handleUpdateBrandBanner(bannerIdx, 'imageUrl', base64Url);
        try {
          const formData = new FormData();
          formData.append('image', file);
          const token = localStorage.getItem('token') || localStorage.getItem('crm_token');
          const res = await fetch(`${API_BASE_URL}/api/system/branding/upload`, {
            method: 'POST',
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              handleUpdateBrandBanner(bannerIdx, 'imageUrl', `${API_BASE_URL}${data.url}`);
            }
          }
        } catch (_) {}
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al cargar archivo de banner de marca:', err);
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUpdateCarouselConfig = (carouselKey, field, value) => {
    if (!visualConfig) return;
    const current = visualConfig.homeCarousels || {};
    const specific = current[carouselKey] || {};
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...current,
        [carouselKey]: {
          ...specific,
          [field]: value
        }
      }
    });
  };

  const handleToggleCarouselProduct = (carouselKey, productId) => {
    if (!visualConfig) return;
    const current = visualConfig.homeCarousels || {};
    const specific = current[carouselKey] || {};
    const productIds = Array.isArray(specific.productIds) ? [...specific.productIds] : [];
    const idNum = parseInt(productId);
    const exists = productIds.includes(idNum);
    const updated = exists ? productIds.filter(id => id !== idNum) : [...productIds, idNum];
    handleUpdateCarouselConfig(carouselKey, 'productIds', updated);
  };

  // ── Brand Management Handlers ──
  const normalizeBrandItem = (item, catKey) => {
    if (typeof item === 'string') {
      const bKey = item.toLowerCase();
      const countries = (visualConfig?.brandCountries && visualConfig.brandCountries[bKey]) || [];
      return { name: bKey, countries };
    }
    return {
      name: (item?.name || '').toLowerCase(),
      countries: Array.isArray(item?.countries) ? item.countries : []
    };
  };

  const handleCreateNewBrand = async (e) => {
    e.preventDefault();
    const brandName = newBrandForm.name.trim().toLowerCase();
    if (!brandName) return;

    const catKey = newBrandForm.category;
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];

    // Check if already exists in this category
    const exists = currentList.some(item => {
      const b = normalizeBrandItem(item, catKey);
      return b.name === brandName;
    });

    if (exists) {
      alert(`La marca "${brandName.toUpperCase()}" ya se encuentra registrada en la categoría seleccionada.`);
      return;
    }

    const newBrandObj = {
      name: brandName,
      countries: newBrandForm.isGlobal ? [] : newBrandForm.countries
    };

    const updatedList = [...currentList, newBrandObj];
    const updatedBrandCountries = {
      ...(visualConfig?.brandCountries || {}),
      [brandName]: newBrandForm.isGlobal ? [] : newBrandForm.countries
    };

    const updatedCustomInfo = {
      ...(visualConfig?.brandCustomInfo || {}),
      [brandName]: {
        name: newBrandForm.name.trim(),
        logo: (newBrandForm.logo || '').trim(),
        tagline: (newBrandForm.tagline || '').trim(),
        color: newBrandForm.color || '#0fa4de'
      }
    };

    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      },
      brandCountries: updatedBrandCountries,
      brandCustomInfo: updatedCustomInfo
    };

    setVisualConfig(newConfig);

    setNewBrandForm({
      name: '',
      logo: '',
      tagline: '',
      color: '#0fa4de',
      category: newBrandForm.category,
      isGlobal: true,
      countries: []
    });
    setShowNewBrandModal(false);

    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error guardando nueva marca:', err);
    }
  };

  const handleOpenEditBrand = (brandKey, initialCat = 'networking', brandIdx = -1) => {
    const key = (brandKey || '').toLowerCase();
    const custom = visualConfig?.brandCustomInfo?.[key] || {};
    const defaultInfo = BRAND_INFO?.[key] || {};

    let countries = [];
    if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[key])) {
      countries = visualConfig.brandCountries[key];
    } else {
      Object.entries(visualConfig?.categoryBrands || {}).forEach(([cat, list]) => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            const b = normalizeBrandItem(item, cat);
            if (b.name === key && b.countries?.length > 0) countries = b.countries;
          });
        }
      });
    }

    setEditingBrandModal({
      brandKey: key,
      brandIdx,
      catKey: initialCat,
      name: custom.name || defaultInfo.name || (key.charAt(0).toUpperCase() + key.slice(1)),
      logo: custom.logo !== undefined ? custom.logo : (defaultInfo.logo || ''),
      tagline: custom.tagline || defaultInfo.tagline || `Soluciones corporativas oficiales ${key.toUpperCase()}`,
      color: custom.color || defaultInfo.color || '#0fa4de',
      countries: countries || [],
      isGlobal: !countries || countries.length === 0
    });
  };

  const handleSaveBrandModal = async (e) => {
    if (e) e.preventDefault();
    if (!editingBrandModal) return;
    const { brandKey, catKey, brandIdx, name, logo, tagline, color, countries, isGlobal } = editingBrandModal;

    const brandNameClean = (name || brandKey).trim();
    const updatedCountries = isGlobal ? [] : (countries || []);

    const updatedCustomInfo = {
      ...(visualConfig?.brandCustomInfo || {}),
      [brandKey]: {
        name: brandNameClean,
        logo: (logo || '').trim(),
        tagline: (tagline || '').trim(),
        color: color || '#0fa4de'
      }
    };

    const updatedBrandCountries = {
      ...(visualConfig?.brandCountries || {}),
      [brandKey]: updatedCountries
    };

    let updatedCategoryBrands = { ...(visualConfig?.categoryBrands || {}) };
    if (catKey && updatedCategoryBrands[catKey]) {
      const list = [...updatedCategoryBrands[catKey]];
      if (brandIdx >= 0 && brandIdx < list.length) {
        list[brandIdx] = { name: brandKey, countries: updatedCountries };
      }
      updatedCategoryBrands[catKey] = list;
    }

    const newConfig = {
      ...visualConfig,
      brandCustomInfo: updatedCustomInfo,
      brandCountries: updatedBrandCountries,
      categoryBrands: updatedCategoryBrands
    };

    setVisualConfig(newConfig);
    setEditingBrandModal(null);

    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error guardando marca:', err);
    }
  };

  const handleUploadBrandLogo = async (file, isNew = false) => {
    if (!file) return;
    setIsUploadingBrandLogo(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('dacas_token') || sessionStorage.getItem('token');
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (sessionId) headers['x-session-id'] = sessionId;

      const res = await fetch(`${API_BASE_URL}/api/ecommerce/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls) && data.urls[0]) {
        if (isNew) {
          setNewBrandForm(prev => ({ ...prev, logo: data.urls[0] }));
        } else {
          setEditingBrandModal(prev => ({ ...prev, logo: data.urls[0] }));
        }
      } else {
        alert(data.error || 'Error al subir logo');
      }
    } catch (err) {
      alert('Error de conexión al subir logo: ' + err.message);
    } finally {
      setIsUploadingBrandLogo(false);
    }
  };

  const handleDeleteBrand = (catKey, brandIdx, brandName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la marca "${brandName.toUpperCase()}" de esta sección?`)) {
      return;
    }
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];
    const updatedList = currentList.filter((_, idx) => idx !== brandIdx);
    setVisualConfig({
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      }
    });
  };

  const handleSaveBrandCountries = (catKey, brandIdx, newCountries) => {
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];
    const targetItem = currentList[brandIdx];
    const brandName = (typeof targetItem === 'string' ? targetItem : targetItem?.name || '').toLowerCase();

    const updatedList = currentList.map((item, idx) => {
      if (idx !== brandIdx) return item;
      return {
        name: brandName,
        countries: newCountries
      };
    });

    const updatedBrandCountries = {
      ...(visualConfig?.brandCountries || {}),
      [brandName]: newCountries
    };

    setVisualConfig({
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      },
      brandCountries: updatedBrandCountries
    });

    setEditingBrandModal(null);
  };

  const handleToggleFeaturedProduct = async (productId) => {
    setProducts(prev => prev.map(prod => {
      if (prod.id === productId) {
        const nextFeat = !(prod.is_featured || prod.isFeatured || prod.badge === 'DESTACADO');
        return {
          ...prod,
          is_featured: nextFeat,
          isFeatured: nextFeat,
          badge: nextFeat ? (prod.badge || 'DESTACADO') : (prod.badge === 'DESTACADO' ? '' : prod.badge)
        };
      }
      return prod;
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${productId}/toggle-featured`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error toggling featured status:', err);
      fetchProducts();
    }
  };

  const fetchProducts = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const url = code && code !== 'all'
        ? `${API_BASE_URL}/api/ecommerce/products?country=${code}`
        : `${API_BASE_URL}/api/ecommerce/products?country=all`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/countries`);
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : MOCK_COUNTRIES);
    } catch {
      setCountries(MOCK_COUNTRIES);
    }
  };

  const fetchUsers = async (countryCode) => {
    try {
      const code = countryCode !== undefined ? countryCode : selectedCountryScope;
      const url = code && code !== 'all'
        ? `${API_BASE_URL}/api/ecommerce/admin/users?country=${code}`
        : `${API_BASE_URL}/api/ecommerce/admin/users`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : MOCK_USERS);
    } catch {
      setUsers(MOCK_USERS);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/rules`);
      const data = await res.json();
      setRules(Array.isArray(data) ? data : MOCK_RULES);
    } catch {
      setRules(MOCK_RULES);
    }
  };

  // ── Product Methods ──
  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', stock: '', image_url: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleSaveTiendanubeProduct = async (payload) => {
    setError(null);
    const targetCountryCode = payload.country_code || (selectedCountryScope !== 'all' ? selectedCountryScope : 'AR');
    const targetCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === targetCountryCode) || DACAS_COUNTRIES_LIST[0];
    const fullPayload = {
      ...payload,
      country_code: targetCountryCode,
      country_id: targetCountryObj.id
    };
    const url = editingProduct
      ? `${API_BASE_URL}/api/ecommerce/admin/products/${editingProduct.id}`
      : `${API_BASE_URL}/api/ecommerce/admin/products?country=${targetCountryCode}`;
    const method = editingProduct ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
    });
    if (!res.ok) throw new Error('Error al guardar el producto');
    resetProductForm();
    fetchProducts(selectedCountryScope);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchProducts(selectedCountryScope);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Country Methods ──
  const resetCountryForm = () => {
    setCountryForm({ code: '', name: '', tax_rate: '0', shipping_cost: '0', nationalization_cost: '0', discount_rate: '0' });
    setEditingCountry(null);
    setShowCountryForm(false);
  };

  const handleCountrySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = editingCountry
        ? `${API_BASE_URL}/api/ecommerce/admin/countries/${editingCountry.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/countries`;
      const method = editingCountry ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(countryForm),
      });
      if (!res.ok) throw new Error('Error al guardar país');
      resetCountryForm();
      fetchCountries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('¿Eliminar este país?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/admin/countries/${id}`, { method: 'DELETE' });
      fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Stock per Country Methods ──
  const openStockModal = async (prod) => {
    setSelectedProductForStock(prod);
    setShowStockModal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${prod.id}/stock`);
      const data = await res.json();
      setProductStockList(Array.isArray(data) ? data : []);
    } catch {
      setProductStockList([]);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${selectedProductForStock.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm),
      });
      setStockForm({ country_id: '', stock: '' });
      openStockModal(selectedProductForStock); // refresh
    } catch (err) {
      alert('Error guardando stock');
    }
  };

  // ── Distinct Companies & Multi-User Helpers ──
  const distinctCompanies = useMemo(() => {
    const list = [];
    const seen = new Set();
    users.forEach(u => {
      const name = (u.razon_social || u.name || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          razon_social: name,
          tipo_cliente: u.tipo_cliente || 'Reseller / Integrador IT',
          numero_nit: u.numero_nit || '',
          country_id: u.country_id || '',
          country_name: u.country_name || '',
          phone: u.phone || '',
          web: u.web || '',
          direccion_legal: u.direccion_legal || '',
          localidad: u.localidad || '',
          ciudad: u.ciudad || '',
          codigo_postal: u.codigo_postal || '',
          vendedor: u.vendedor || '',
          report_to_country_id: u.report_to_country_id || '',
          direccion_entrega: u.direccion_entrega || '',
          localidad_entrega: u.localidad_entrega || '',
          ciudad_entrega: u.ciudad_entrega || '',
          codigo_postal_entrega: u.codigo_postal_entrega || '',
          pais_entrega_id: u.pais_entrega_id || '',
          tipo_iva: u.tipo_iva || '',
          nombre_compras: u.nombre_compras || '',
          telefono_compras: u.telefono_compras || '',
          email_compras: u.email_compras || '',
          nombre_pagos: u.nombre_pagos || '',
          telefono_pagos: u.telefono_pagos || '',
          email_pagos: u.email_pagos || '',
          nombre_admin: u.nombre_admin || '',
          telefono_admin: u.telefono_admin || '',
          email_admin: u.email_admin || '',
          email_factura_electronica: u.email_factura_electronica || '',
          email_contacto_compras: u.email_contacto_compras || '',
          email_cotizaciones_automaticas: u.email_cotizaciones_automaticas || ''
        });
      }
    });
    return list;
  }, [users]);

  const handleSelectExistingCompany = (companyName) => {
    setSelectedExistingCompany(companyName);
    const comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === companyName.toLowerCase());
    if (comp) {
      setUserForm(prev => ({
        ...prev,
        razon_social: comp.razon_social,
        tipo_cliente: comp.tipo_cliente,
        numero_nit: comp.numero_nit,
        country_id: comp.country_id,
        phone: comp.phone || prev.phone,
        web: comp.web,
        direccion_legal: comp.direccion_legal,
        localidad: comp.localidad,
        ciudad: comp.ciudad,
        codigo_postal: comp.codigo_postal,
        vendedor: comp.vendedor,
        report_to_country_id: comp.report_to_country_id,
        direccion_entrega: comp.direccion_entrega,
        localidad_entrega: comp.localidad_entrega,
        ciudad_entrega: comp.ciudad_entrega,
        codigo_postal_entrega: comp.codigo_postal_entrega,
        pais_entrega_id: comp.pais_entrega_id,
        tipo_iva: comp.tipo_iva,
        nombre_compras: comp.nombre_compras,
        telefono_compras: comp.telefono_compras,
        email_compras: comp.email_compras,
        nombre_pagos: comp.nombre_pagos,
        telefono_pagos: comp.telefono_pagos,
        email_pagos: comp.email_pagos,
        nombre_admin: comp.nombre_admin,
        telefono_admin: comp.telefono_admin,
        email_admin: comp.email_admin,
        email_factura_electronica: comp.email_factura_electronica,
        email_contacto_compras: comp.email_contacto_compras,
        email_cotizaciones_automaticas: comp.email_cotizaciones_automaticas
      }));
    }
  };

  const handleOpenAddUserToCompany = (compOrUser) => {
    resetUserForm();
    let comp = null;
    if (typeof compOrUser === 'string') {
      comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === compOrUser.toLowerCase());
    } else if (compOrUser) {
      comp = distinctCompanies.find(c => c.razon_social.toLowerCase() === (compOrUser.razon_social || compOrUser.name || '').toLowerCase()) || compOrUser;
    }
    setUserCreateMode('existing_company');
    if (comp) {
      const cName = comp.razon_social || comp.name || '';
      setSelectedExistingCompany(cName);
      setUserForm({
        ...initialUserForm,
        razon_social: cName,
        tipo_cliente: comp.tipo_cliente || 'Reseller / Integrador IT',
        numero_nit: comp.numero_nit || '',
        country_id: comp.country_id || '',
        phone: comp.phone || '',
        web: comp.web || '',
        direccion_legal: comp.direccion_legal || '',
        localidad: comp.localidad || '',
        ciudad: comp.ciudad || '',
        codigo_postal: comp.codigo_postal || '',
        vendedor: comp.vendedor || '',
        report_to_country_id: comp.report_to_country_id || '',
        direccion_entrega: comp.direccion_entrega || '',
        localidad_entrega: comp.localidad_entrega || '',
        ciudad_entrega: comp.ciudad_entrega || '',
        codigo_postal_entrega: comp.codigo_postal_entrega || '',
        pais_entrega_id: comp.pais_entrega_id || '',
        tipo_iva: comp.tipo_iva || '',
        nombre_compras: comp.nombre_compras || '',
        telefono_compras: comp.telefono_compras || '',
        email_compras: comp.email_compras || '',
        nombre_pagos: comp.nombre_pagos || '',
        telefono_pagos: comp.telefono_pagos || '',
        email_pagos: comp.email_pagos || '',
        nombre_admin: comp.nombre_admin || '',
        telefono_admin: comp.telefono_admin || '',
        email_admin: comp.email_admin || '',
        email_factura_electronica: comp.email_factura_electronica || '',
        email_contacto_compras: comp.email_contacto_compras || '',
        email_cotizaciones_automaticas: comp.email_cotizaciones_automaticas || '',
        iibb_jurisdiccion: comp.iibb_jurisdiccion || initialUserForm.iibb_jurisdiccion,
        iibb_tipo: comp.iibb_tipo || initialUserForm.iibb_tipo,
        iibb_numero: comp.iibb_numero || comp.numero_nit || '',
        iibb_codigo_aceptacion: comp.iibb_codigo_aceptacion !== undefined ? comp.iibb_codigo_aceptacion : initialUserForm.iibb_codigo_aceptacion,
        percepciones: comp.percepciones || initialUserForm.percepciones,
        cargo: 'Encargado de Compras'
      });
    }
    setShowUserForm(true);
    setUserFormSection(1);
  };

  // ── User / Customer Methods ──
  const resetUserForm = () => {
    setUserForm({
      ...initialUserForm,
      country_id: activeCountryObj?.id || 2,
      report_to_country_id: activeCountryObj?.id || 2
    });
    setEditingUser(null);
    setShowUserForm(false);
    setUserFormSection(1);
    setUserCreateMode('new_company');
    setSelectedExistingCompany('');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const url = editingUser
        ? `${API_BASE_URL}/api/ecommerce/admin/users/${editingUser.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';
      const payload = { ...userForm };
      if (editingUser && !payload.password) delete payload.password;
      if (payload.fecha_limite_facturacion) {
         payload.fecha_limite_facturacion = new Date(payload.fecha_limite_facturacion).toISOString().split('T')[0];
      } else {
         payload.fecha_limite_facturacion = null;
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al guardar cliente');
      resetUserForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const openUserModal = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        setShowUserModal(true);
      }
    } catch (e) {
      alert('Error cargando usuario');
    }
  };

  const handleApproveUser = async (userId) => {
    if (!window.confirm('¿Desea aprobar y activar la cuenta de este cliente para que pueda comprar y acceder al portal?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al aprobar cliente');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al cambiar estado');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la cuenta de usuario "${userName || userId}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al eliminar usuario');
      if (selectedUser && selectedUser.id === userId) {
        setShowUserModal(false);
      } else if (selectedUser) {
        openUserModal(selectedUser.id);
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditUser = async (u) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${u.id}`);
      if (res.ok) {
        const data = await res.json();
        const safeData = { ...initialUserForm, ...data, password: '' };
        if (safeData.fecha_limite_facturacion) safeData.fecha_limite_facturacion = safeData.fecha_limite_facturacion.split('T')[0];
        let percs = data.percepciones;
        if (typeof percs === 'string') {
          try { percs = JSON.parse(percs); } catch (_) { percs = null; }
        }
        safeData.percepciones = percs || initialUserForm.percepciones;
        safeData.iibb_jurisdiccion = data.iibb_jurisdiccion || initialUserForm.iibb_jurisdiccion;
        safeData.iibb_tipo = data.iibb_tipo || initialUserForm.iibb_tipo;
        safeData.iibb_numero = data.iibb_numero || data.numero_nit || '';
        safeData.iibb_codigo_aceptacion = data.iibb_codigo_aceptacion !== undefined ? data.iibb_codigo_aceptacion : initialUserForm.iibb_codigo_aceptacion;
        setUserForm(safeData);
        setEditingUser(u);
        setUserCreateMode('existing_company');
        setSelectedExistingCompany(safeData.razon_social || '');
        setShowUserForm(true);
        setUserFormSection(1);
      }
    } catch (e) {
      alert('Error cargando usuario para editar');
    }
  };

  // ── Rules Engine Methods ──
  const resetRuleForm = () => {
    setRuleForm(initialRuleForm);
    setEditingRule(null);
    setShowRuleForm(false);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name || '',
      rule_type: rule.rule_type || 'discount',
      value_type: rule.value_type || 'percentage',
      value: rule.value || '',
      tipo_cliente: rule.tipo_cliente || '',
      brand: rule.brand || '',
      product_id: rule.product_id || '',
      country_id: rule.country_id || '',
      user_id: rule.user_id || '',
      priority: rule.priority !== undefined ? String(rule.priority) : '0',
      is_active: rule.is_active !== undefined ? rule.is_active : true,
      is_coupon: !!(rule.coupon_code && String(rule.coupon_code).trim()),
      coupon_code: rule.coupon_code || '',
      min_order_amount: rule.min_order_amount || '',
      valid_until: rule.valid_until ? String(rule.valid_until).split('T')[0] : '',
      usage_limit: rule.usage_limit || '',
      times_used: rule.times_used || 0
    });
    setShowRuleForm(true);
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRule
        ? `${API_BASE_URL}/api/ecommerce/admin/rules/${editingRule.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/rules`;
      const method = editingRule ? 'PUT' : 'POST';
      const payload = { ...ruleForm };
      
      // empty string to null for optional relations
      if (!payload.tipo_cliente) payload.tipo_cliente = null;
      if (!payload.brand) payload.brand = null;
      if (!payload.product_id) payload.product_id = null;
      if (!payload.country_id) payload.country_id = null;
      if (!payload.user_id) payload.user_id = null;

      if (!payload.is_coupon) {
        payload.coupon_code = null;
        payload.min_order_amount = null;
        payload.valid_until = null;
        payload.usage_limit = null;
      } else {
        if (payload.coupon_code) payload.coupon_code = payload.coupon_code.trim().toUpperCase();
        else {
          alert('Por favor definí un Código de Cupón (ej: FORTINET-ARG-20)');
          return;
        }
        if (payload.min_order_amount) payload.min_order_amount = parseFloat(payload.min_order_amount);
        else payload.min_order_amount = null;
        if (!payload.valid_until) payload.valid_until = null;
        if (payload.usage_limit) payload.usage_limit = parseInt(payload.usage_limit);
        else payload.usage_limit = null;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar regla/cupón');
      }
      resetRuleForm();
      fetchRules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/admin/rules/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (err) {
      alert(err.message);
    }
  };


  // UI Helpers
  const statusLabel = (s) => ({
    pending: 'Pendiente',
    procesando: '🟡 En Preparación',
    paid: '🟢 Pagado',
    en_camino: '🚚 En Despacho',
    entregado: '✅ Entregado',
    shipped: '🚚 Enviado',
    completed: '✅ Completado',
    cancelled: '🔴 Cancelado'
  }[s] || s);

  const statusStyle = (s) => {
    if (s === 'paid' || s === 'completed' || s === 'entregado') return { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
    if (s === 'pending' || s === 'procesando') return { background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' };
    if (s === 'en_camino' || s === 'shipped') return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
    if (s === 'cancelled') return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
    return { background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid #e2e8f0' };
  };

  const translateRuleType = (t) => ({ discount: 'Descuento', tax: 'Impuesto', shipping: 'Envío', nationalization: 'Nacionalización' }[t] || t);
  const translateValueType = (t) => ({ percentage: '% Porcentaje', fixed: '$ Fijo' }[t] || t);

  // ─────────────────────── REPORTING CALCULATIONS (SCOPED BY COUNTRY) ───────────────────────
  const activeOrdersForStats = countryScopedOrders;
  const totalRevenue = activeOrdersForStats.filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
  const totalOrders = activeOrdersForStats.length;
  const paidOrders = activeOrdersForStats.filter(o => o.status === 'paid' || o.status === 'completed').length;
  const pendingOrders = activeOrdersForStats.filter(o => o.status === 'pending' || o.status === 'procesando').length;
  const cancelledOrders = activeOrdersForStats.filter(o => o.status === 'cancelled').length;
  const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0;
  const avgOrderValue = paidOrders > 0 ? (totalRevenue / paidOrders).toFixed(2) : 0;
  const lowStockProducts = products.filter(p => p.stock <= 15).length;

  const ordersByStatus = [
    { name: 'Pagado', value: paidOrders },
    { name: 'Pendiente', value: pendingOrders },
    { name: 'Cancelado', value: cancelledOrders },
  ].filter(i => i.value > 0);

  const revenueByDay = (() => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - 86400000 * i);
      const key = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      map[key] = { day: key, ingresos: 0, ordenes: 0 };
    }
    activeOrdersForStats.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      if (map[key]) {
        map[key].ordenes++;
        if (o.status === 'paid' || o.status === 'completed') {
          map[key].ingresos += parseFloat(o.total || 0);
        }
      }
    });
    return Object.values(map);
  })();

  const productRevenue = products.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 18) + '…' : p.name,
    precio: parseFloat(p.price),
    stock: p.stock,
  }));

  const salesByCountry = (() => {
    const map = {};
    orders.forEach(o => {
      if (o.status === 'paid' || o.status === 'completed') {
        const cName = o.country_name || 'Global';
        if (!map[cName]) map[cName] = { name: cName, value: 0 };
        map[cName].value += parseFloat(o.total || 0);
      }
    });
    return Object.values(map).sort((a,b) => b.value - a.value);
  })();

  // CSV export
  const downloadCSV = (rows, headers, filename) => {
    const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;
    const csv = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    downloadCSV(
      orders.map(o => [
        `#${o.id}`,
        o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '',
        o.user_name || '—',
        o.country_name || 'Global',
        `$${o.total}`,
        statusLabel(o.status),
      ]),
      ['ID Orden', 'Fecha', 'Cliente', 'País', 'Total', 'Estado'],
      'ordenes_ecommerce.csv'
    );
  };

  const exportProductsCSV = () => {
    downloadCSV(
      products.map(p => [
        p.id,
        p.name,
        p.brand || '',
        p.category || 'General',
        p.sku || '',
        `$${p.price}`,
        p.promotional_price ? `$${p.promotional_price}` : '',
        p.stock,
        p.weight || '',
        p.depth || p.length || '',
        p.width || '',
        p.height || '',
        p.description || '',
        p.image_url || ''
      ]),
      ['ID', 'Nombre', 'Marca', 'Categoria', 'SKU', 'Precio_USD', 'Precio_Promo_USD', 'Stock', 'Peso_KG', 'Largo_CM', 'Ancho_CM', 'Altura_CM', 'Descripcion', 'URL_Imagen'],
      'productos_catalogo_dacas.csv'
    );
  };

  const downloadSampleCSV = () => {
    const headers = ['Nombre', 'Marca', 'Categoria', 'SKU', 'Precio_USD', 'Precio_Promo_USD', 'Stock', 'Peso_KG', 'Largo_CM', 'Ancho_CM', 'Altura_CM', 'Descripcion', 'URL_Imagen'];
    const sampleRows = [
      [
        'Fortinet FortiGate 60F NGFW',
        'Fortinet',
        'security',
        'FG-60F-BDL-950-12',
        '890.00',
        '845.00',
        '45',
        '0.90',
        '21.6',
        '16.0',
        '3.8',
        'Firewall empresarial de última generación con procesador SOC4, SD-WAN seguro y antivirus',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000'
      ],
      [
        'MikroTik Cloud Router Switch 24P PoE+',
        'MikroTik',
        'networking',
        'CRS328-24P-4S',
        '480.00',
        '449.00',
        '22',
        '2.80',
        '44.3',
        '22.4',
        '4.4',
        'Switch administrable de 24 puertos Gigabit PoE+ dual 802.3af/at con 4 uplinks fijos 10G SFP+',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000'
      ],
      [
        'Aruba Instant On AP22 Wi-Fi 6',
        'Aruba',
        'networking',
        'R4W02A-AP22',
        '195.00',
        '',
        '35',
        '0.50',
        '16.0',
        '16.0',
        '3.7',
        'Access Point Wi-Fi 6 MU-MIMO para alta densidad de clientes y gestión centralizada en la nube',
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=1000'
      ],
      [
        'MikroTik Cloud Router Switch CRS328',
        'MikroTik',
        'networking',
        'CRS328-24P-4S+RM',
        '480.00',
        '',
        '28',
        '2.80',
        '44.3',
        '22.4',
        '4.4',
        'Switch de 24 puertos Gigabit PoE dual 802.3af/at con 4 puertos SFP+ de 10Gbps',
        'https://images.unsplash.com/photo-1520869562399-e772f342b00a?q=80&w=1000'
      ]
    ];

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos_dacas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVContent = (csvText) => {
    const lines = [];
    let row = [];
    let currentVal = '';
    let insideQuotes = false;

    const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const firstLine = text.split('\n')[0] || '';
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = ';';
    } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = '\t';
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\n' && !insideQuotes) {
        row.push(currentVal.trim());
        if (row.some(val => val.length > 0)) lines.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      if (row.some(val => val.length > 0)) lines.push(row);
    }

    if (lines.length < 2) return [];

    const rawHeaders = lines[0].map(h => 
      h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, '')
    );
    
    const headerMap = {};
    rawHeaders.forEach((h, idx) => {
      if (h.includes('nombre') || h.includes('producto') || h.includes('name') || h.includes('title')) headerMap.name = idx;
      else if (h.includes('marca') || h.includes('brand') || h.includes('fabricante')) headerMap.brand = idx;
      else if (h.includes('categoria') || h.includes('category') || h.includes('rubro')) headerMap.category = idx;
      else if (h.includes('sku') || h.includes('codigo') || h.includes('partnumber') || h.includes('mpn')) headerMap.sku = idx;
      else if (h.includes('promo') || h.includes('oferta') || h.includes('descuento')) headerMap.promotional_price = idx;
      else if (h.includes('precio') || h.includes('price') || h.includes('costo') || h.includes('valor')) headerMap.price = idx;
      else if (h.includes('stock') || h.includes('cantidad') || h.includes('qty') || h.includes('inventario')) headerMap.stock = idx;
      else if (h.includes('peso') || h.includes('weight') || h.includes('kg')) headerMap.weight = idx;
      else if (h.includes('largo') || h.includes('profundidad') || h.includes('length') || h.includes('depth') || h.includes('longitud')) headerMap.depth = idx;
      else if (h.includes('ancho') || h.includes('width')) headerMap.width = idx;
      else if (h.includes('altura') || h.includes('alto') || h.includes('height')) headerMap.height = idx;
      else if (h.includes('desc') || h.includes('detalle')) headerMap.description = idx;
      else if (h.includes('imagen') || h.includes('image') || h.includes('foto') || h.includes('url')) headerMap.image_url = idx;
    });

    if (headerMap.name === undefined) headerMap.name = 0;
    if (headerMap.price === undefined && lines[0].length > 1) headerMap.price = 1;
    if (headerMap.stock === undefined && lines[0].length > 2) headerMap.stock = 2;

    const parsedItems = [];
    for (let i = 1; i < lines.length; i++) {
      const r = lines[i];
      const name = headerMap.name !== undefined ? (r[headerMap.name] || '') : (r[0] || '');
      if (!name) continue;

      const brand = headerMap.brand !== undefined ? (r[headerMap.brand] || '') : '';
      const category = headerMap.category !== undefined ? (r[headerMap.category] || 'General') : 'General';
      const sku = headerMap.sku !== undefined ? (r[headerMap.sku] || '') : '';
      const rawPrice = headerMap.price !== undefined ? (r[headerMap.price] || '0') : '0';
      const rawPromo = headerMap.promotional_price !== undefined ? (r[headerMap.promotional_price] || '') : '';
      const rawStock = headerMap.stock !== undefined ? (r[headerMap.stock] || '0') : '0';
      const description = headerMap.description !== undefined ? (r[headerMap.description] || '') : '';
      const image_url = headerMap.image_url !== undefined ? (r[headerMap.image_url] || '') : '';

      const cleanPrice = String(rawPrice).replace('$', '').replace(/,/g, '.').trim();
      const price = isNaN(parseFloat(cleanPrice)) ? '0.00' : parseFloat(cleanPrice).toFixed(2);
      const promotional_price = rawPromo && !isNaN(parseFloat(String(rawPromo).replace('$', '').replace(/,/g, '.'))) 
        ? parseFloat(String(rawPromo).replace('$', '').replace(/,/g, '.')).toFixed(2) 
        : null;
      const stock = parseInt(rawStock, 10) || 0;

      const rawWeight = headerMap.weight !== undefined ? (r[headerMap.weight] || '') : '';
      const rawDepth = headerMap.depth !== undefined ? (r[headerMap.depth] || '') : '';
      const rawWidth = headerMap.width !== undefined ? (r[headerMap.width] || '') : '';
      const rawHeight = headerMap.height !== undefined ? (r[headerMap.height] || '') : '';

      const weight = rawWeight ? String(rawWeight).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '';
      const depth = rawDepth ? String(rawDepth).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '';
      const width = rawWidth ? String(rawWidth).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '';
      const height = rawHeight ? String(rawHeight).replace(',', '.').replace(/[^0-9.]/g, '').trim() : '';

      parsedItems.push({
        id_temp: i,
        name,
        brand,
        category: category || 'General',
        sku,
        price,
        promotional_price,
        stock,
        weight,
        depth,
        width,
        height,
        description,
        image_url,
        isValid: Boolean(name && !isNaN(parseFloat(price)))
      });
    }

    return parsedItems;
  };

  const handleProcessCSVFile = (file) => {
    if (!file) return;
    setBulkFile(file);
    setBulkError(null);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSVContent(text);
        if (parsed.length === 0) {
          setBulkError('El archivo CSV no contiene registros válidos o las columnas no pudieron identificarse.');
          setBulkData([]);
        } else {
          setBulkData(parsed);
        }
      } catch (err) {
        setBulkError('Error al leer el archivo CSV: ' + err.message);
      }
    };
    reader.onerror = () => {
      setBulkError('Error de lectura en el archivo seleccionado.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmBulkImport = async () => {
    if (!bulkData || bulkData.length === 0) return;
    setBulkLoading(true);
    setBulkError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/bulk-upload`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: bulkData,
          mode: bulkMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la carga masiva.');
      }

      setBulkResult(data);
      fetchProducts();
    } catch (err) {
      setBulkError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div
      className={embedded ? "crm-embedded-view" : "crm-container"}
      style={embedded ? { width: '100%', maxWidth: '100%', margin: 0, padding: 0 } : {}}
      onClick={() => { if (openActionDropdown !== null) setOpenActionDropdown(null); }}
    >
      <style>{`
        .tab-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(120, 120, 128, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 14px;
          padding: 6px;
          margin-bottom: 22px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          box-sizing: border-box;
        }
        .tab-buttons::-webkit-scrollbar {
          display: none;
        }
        [data-theme="dark"] .tab-buttons {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .tab-btn {
          flex: 1 0 auto;
          min-width: max-content;
          background: transparent;
          border: 1px solid transparent;
          padding: 9px 18px;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-muted, #475569);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          gap: 8px;
        }
        .tab-btn svg {
          stroke: currentColor;
          transition: stroke 0.2s ease;
        }
        .tab-btn:hover {
          color: var(--text-main, #0f172a);
          background: rgba(15, 164, 222, 0.08);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%);
          color: #ffffff !important;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(15, 164, 222, 0.35);
          border-color: transparent;
        }
        .tab-btn.active svg {
          stroke: #ffffff !important;
        }
        [data-theme="dark"] .tab-btn:hover {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.06);
        }
        [data-theme="dark"] .tab-btn.active {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%);
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(15, 164, 222, 0.4);
        }

        /* ── Dacas Custom Action Pills (Matching Selected / Deselected States) ── */
        .dacas-pill-btn {
          background: var(--card-bg, #FFFFFF);
          border: 1.5px solid var(--border-color, #E2E8F0);
          color: var(--text-main, #334155);
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 0.86rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .dacas-pill-btn svg {
          stroke: currentColor;
          transition: stroke 0.2s ease, transform 0.2s ease;
        }
        .dacas-pill-btn:hover {
          color: #0284c7;
          border-color: #BAE6FD;
          background: rgba(15, 164, 222, 0.08);
          transform: translateY(-1px);
        }
        .dacas-pill-btn:hover svg {
          stroke: #0284c7;
        }
        .dacas-pill-btn.active, .dacas-pill-btn.selected {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 14px rgba(15, 164, 222, 0.35) !important;
          transform: translateY(-1px);
        }
        .dacas-pill-btn.active svg, .dacas-pill-btn.selected svg {
          stroke: #FFFFFF !important;
        }

        .dacas-action-pill {
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          color: #334155;
          padding: 5px 14px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .dacas-action-pill svg {
          stroke: currentColor;
          transition: stroke 0.2s ease;
        }
        .dacas-action-pill:hover, .dacas-action-pill.active {
          background: linear-gradient(135deg, #0fa4de 0%, #0284c7 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 3px 10px rgba(15, 164, 222, 0.3) !important;
          transform: translateY(-1px);
        }
        .dacas-action-pill:hover svg, .dacas-action-pill.active svg {
          stroke: #FFFFFF !important;
        }
        .dacas-action-pill.danger {
          padding: 5px 10px;
          color: #64748B;
        }
        .dacas-action-pill.danger:hover, .dacas-action-pill.danger.active {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          border-color: transparent !important;
          color: #FFFFFF !important;
          box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3) !important;
        }
        .dacas-action-pill.danger:hover svg, .dacas-action-pill.danger.active svg {
          stroke: #FFFFFF !important;
        }
        .crm-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 14px; margin-top: 8px; }
        .report-card { background:var(--card-bg,white); border-radius:20px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.06); margin-bottom:24px; }
        .kpi-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:16px; margin-bottom:24px; }
        .kpi-card { background:var(--card-bg,white); border-radius:16px; padding:20px; box-shadow:0 4px 16px rgba(0,0,0,0.05); border-left:4px solid var(--primary); }
        .kpi-value { font-size:1.9rem; font-weight:900; color:var(--text-main); }
        .kpi-label { font-size:0.78rem; color:var(--text-muted); font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.04em; }
        .charts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(420px,1fr)); gap:24px; }
        @media(max-width:900px){ .charts-grid{ grid-template-columns:1fr; } }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center; }
        .modal-content { background:var(--card-bg, white); padding:30px; border-radius:20px; width:90%; max-width:900px; max-height:90vh; overflow-y:auto; }
        .stepper { display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px; }
        .step { padding:8px 16px; border-radius:20px; font-size:0.85rem; font-weight:bold; cursor:pointer; background:#eee; color:#666; }
        .step.active { background:#0f766e; color:white; }
        .rule-badge { display:inline-block; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:bold; background:#e2e8f0; color:#475569; margin-right:4px; }
      `}</style>

      {!embedded && (
        <header className="crm-header">
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
                    Admin E-Commerce <span style={{ color: '#0fa4de' }}>&</span> Catálogo
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Gestión de productos, inventario, precios multinacionales y reportería
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Notification Bell */}
                  <NotificationBell 
                    usuario={typeof usuario !== 'undefined' ? usuario : { rol: 'admin_ecommerce', nombre: 'Admin E-Commerce' }}
                    onNavigate={(targetView) => {
                      if (targetView === 'erp') {
                        window.location.href = '/admin/erp';
                      } else if (targetView === 'crm') {
                        window.location.href = '/';
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="nav-btn"
                    onClick={() => { window.location.href = '/'; }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Ir a Home / Panel Principal"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Home</span>
                  </button>
                  {activeTab === 'reportes' && (
                    <button className="nav-btn" onClick={() => window.print()} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                      🖨️ Imprimir / PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={embedded ? "crm-main-embedded" : "crm-main"} style={embedded ? { width: '100%', maxWidth: '100%', padding: 0, margin: 0 } : {}}>
        {/* ── Executive Primary Key / Country Scope Bar ── */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          padding: '14px 20px',
          marginBottom: '18px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#e0f2fe',
              border: '1.5px solid #0fa4de',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              {activeCountryObj.flag || '🌎'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                  Scope Activo: {activeCountryObj.name}
                </strong>
                <span style={{
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#ffffff',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 9px',
                  letterSpacing: '0.04em'
                }}>
                  PRIMARY KEY E-COMMERCE
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Filtrando clientes mayoristas, stock de productos, pedidos y métodos locales para <strong>{activeCountryObj.name}</strong>.
              </div>
            </div>
          </div>

          {/* Country Switcher Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%', padding: '2px 0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
              Seleccionar País:
            </span>
            {DACAS_COUNTRIES_LIST.map(c => {
              const isSelected = selectedCountryScope === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountryScopeChange(c.code)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #0fa4de' : '1px solid #cbd5e1',
                    background: isSelected ? '#0fa4de' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontWeight: isSelected ? '800' : '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 164, 222, 0.35)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Filtrar ecommerce por ${c.name}`}
                >
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>{c.flag}</span>
                  <span>{c.code}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleCountryScopeChange('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: selectedCountryScope === 'all' ? '1.5px solid #0fa4de' : '1px solid #cbd5e1',
                background: selectedCountryScope === 'all' ? '#0fa4de' : '#ffffff',
                color: selectedCountryScope === 'all' ? '#ffffff' : '#64748b',
                fontWeight: selectedCountryScope === 'all' ? '800' : '600',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Ver datos de todos los países"
            >
              <span>🌐</span>
              <span>Todos</span>
            </button>
          </div>
        </div>

        <div className="tab-buttons">
          <button 
            type="button"
            className="tab-btn" 
            onClick={() => { window.location.href = '/'; }}
            style={{ fontWeight: '800', color: '#0fa4de', marginRight: '4px' }}
            title="Ir a Home / Panel Principal"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>
          <button className={`tab-btn${activeTab === 'products' ? ' active' : ''}`} onClick={() => setActiveTab('products')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span>Productos</span>
          </button>
          <button className={`tab-btn${activeTab === 'brands' ? ' active' : ''}`} onClick={() => setActiveTab('brands')}>
            <BrandingVectorIcon name="award" size={17} />
            <span>Marcas</span>
          </button>
          <button className={`tab-btn${activeTab === 'countries' ? ' active' : ''}`} onClick={() => setActiveTab('countries')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Países</span>
          </button>
          <button className={`tab-btn${activeTab === 'rules' ? ' active' : ''}`} onClick={() => setActiveTab('rules')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span>Cupones y Reglas</span>
          </button>
          <button className={`tab-btn${activeTab === 'users' ? ' active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Clientes</span>
            {users.filter(u => u.status === 'pendiente').length > 0 && (
              <span style={{
                background: activeTab === 'users' ? '#ffffff' : '#f59e0b',
                color: activeTab === 'users' ? '#d97706' : '#ffffff',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s'
              }}>
                {users.filter(u => u.status === 'pendiente').length} pend.
              </span>
            )}
          </button>
          <button className={`tab-btn${activeTab === 'orders' ? ' active' : ''}`} onClick={() => setActiveTab('orders')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Órdenes</span>
          </button>
          <button className={`tab-btn${activeTab === 'reportes' ? ' active' : ''}`} onClick={() => setActiveTab('reportes')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Reportería</span>
          </button>
          <button className={`tab-btn${activeTab === 'pagos_envios' ? ' active' : ''}`} onClick={() => setActiveTab('pagos_envios')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>Pagos y Envíos</span>
          </button>
          <button className={`tab-btn${activeTab === 'visual' ? ' active' : ''}`} onClick={() => setActiveTab('visual')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
            </svg>
            <span>Personalización Shop</span>
          </button>
          <button className={`tab-btn${activeTab === 'apli' ? ' active' : ''}`} onClick={() => setActiveTab('apli')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <span>Conexión Apli</span>
            <span style={{
              background: apliConfig?.enabled ? (activeTab === 'apli' ? '#FFFFFF' : '#10B981') : '#64748B',
              color: apliConfig?.enabled ? (activeTab === 'apli' ? '#047857' : '#FFFFFF') : '#FFFFFF',
              fontSize: '10px',
              fontWeight: '800',
              padding: '1.5px 6px',
              borderRadius: '999px',
              marginLeft: '4px',
              transition: 'all 0.2s'
            }}>
              {apliConfig?.enabled ? 'Activo' : 'Off'}
            </span>
          </button>
          <button className={`tab-btn${activeTab === 'n8n_bot' ? ' active' : ''}`} onClick={() => setActiveTab('n8n_bot')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8.01" y2="16" />
              <line x1="16" y1="16" x2="16.01" y2="16" />
            </svg>
            <span>Bot n8n B2B</span>
            <span style={{
              background: n8nConfig?.enabled ? (activeTab === 'n8n_bot' ? '#FFFFFF' : '#0fa4de') : '#64748B',
              color: n8nConfig?.enabled ? (activeTab === 'n8n_bot' ? '#0284c7' : '#FFFFFF') : '#FFFFFF',
              fontSize: '10px',
              fontWeight: '800',
              padding: '1.5px 6px',
              borderRadius: '999px',
              marginLeft: '4px',
              transition: 'all 0.2s'
            }}>
              {n8nConfig?.enabled ? 'IA' : 'Off'}
            </span>
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        {/* ═══════════════ PRODUCTS ═══════════════ */}
        {activeTab === 'products' && (
          showProductForm ? (
            <AdminProductFormTiendanube
              product={editingProduct}
              onSave={handleSaveTiendanubeProduct}
              onCancel={resetProductForm}
              apiBaseUrl={API_BASE_URL}
              defaultCountryCode={selectedCountryScope}
            />
          ) : (
            <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Catálogo de Productos</h2>
                    <span style={{
                      background: 'rgba(15, 164, 222, 0.1)',
                      color: '#0284c7',
                      fontWeight: '800',
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{activeCountryObj.flag}</span>
                      <span>{activeCountryObj.name}</span>
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#6b7280' }}>
                    {selectedCountryScope === 'all' 
                      ? 'Mostrando el catálogo consolidado de todos los países de la red regional DACAS.' 
                      : `Gestionando exclusivamente el inventario, catálogo y precios de ${activeCountryObj.name}.`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="dacas-pill-btn"
                    onClick={exportProductsCSV}
                    title="Exportar todos los productos actuales a un archivo CSV"
                  >
                    <BrandingVectorIcon name="download" size={16} />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    className={`dacas-pill-btn${showBulkModal ? ' active' : ''}`}
                    onClick={() => {
                      setShowBulkModal(true);
                      setBulkData([]);
                      setBulkFile(null);
                      setBulkResult(null);
                      setBulkError(null);
                    }}
                    title="Carga masiva de catálogo mediante archivo CSV"
                  >
                    <BrandingVectorIcon name="upload" size={16} />
                    <span>Carga Masiva (CSV)</span>
                  </button>
                  <button
                    className={`dacas-pill-btn${showProductForm && !editingProduct ? ' active' : ''}`}
                    onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                    title="Crear un nuevo producto en el catálogo"
                  >
                    <BrandingVectorIcon name="plus" size={16} />
                    <span>Nuevo Producto</span>
                  </button>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, SKU, marca..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    minWidth: '160px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="all">Todo el Stock</option>
                  <option value="in_stock">En Stock (&gt; 0)</option>
                  <option value="out_of_stock">Sin Stock (0)</option>
                </select>
                <button
                  className="nav-btn"
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  onClick={() => { setProductSearch(''); setSelectedCategory(''); setFilterStock('all'); }}
                >
                  ✕ Limpiar
                </button>
              </div>

              {/* Tabla de Productos optimizada y compacta para encajar en el cuadro */}
              <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="users-table crm-compact-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '48px', textAlign: 'center' }}>Foto</th>
                      {selectedCountryScope === 'all' && (
                        <th style={{ width: '85px', textAlign: 'center' }}>País</th>
                      )}
                      <th>Producto / SKU</th>
                      <th>Categoría</th>
                      <th style={{ textAlign: 'right' }}>Precio</th>
                      <th style={{ textAlign: 'center' }}>Stock {selectedCountryScope !== 'all' ? `${activeCountryObj.flag} ${activeCountryObj.code}` : 'Global'}</th>
                      <th style={{ textAlign: 'center', width: '110px' }}>⭐ Destacado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const discount = p.promotional_price && Number(p.price) > 0
                        ? Math.round((1 - Number(p.promotional_price) / Number(p.price)) * 100)
                        : null;
                      return (
                        <tr key={p.id}>
                          <td style={{ width: '48px', textAlign: 'center' }}>
                            <img
                              src={p.image_url || (p.images && p.images[0]) || 'https://placehold.co/50x50/f1f5f9/94a3b8?text=Foto'}
                              alt={p.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                              onError={(e) => { e.target.src = 'https://placehold.co/50x50/f1f5f9/94a3b8?text=Foto'; }}
                            />
                          </td>
                          {selectedCountryScope === 'all' && (
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '700',
                                background: '#f1f5f9',
                                color: '#334155'
                              }}>
                                <span>{DACAS_COUNTRIES_LIST.find(c => c.code === (p.country_code || 'AR'))?.flag || '🌎'}</span>
                                <span>{p.country_code || 'AR'}</span>
                              </span>
                            </td>
                          )}
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.3 }}>
                              {p.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <span className="no-badge-style" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {p.sku || 'S/SKU'}
                              </span>
                              {p.badge && (
                                <span style={{
                                  background: p.badgeColor || '#0fa4de',
                                  color: '#fff',
                                  fontSize: '9px',
                                  fontWeight: '700',
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}>
                                  {p.badge}
                                </span>
                              )}
                              {(p.weight || p.depth || p.width || p.height) && (
                                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '3px' }} title={`Peso: ${p.weight || '—'} kg | Largo: ${p.depth || '—'} cm | Ancho: ${p.width || '—'} cm | Alto: ${p.height || '—'} cm`}>
                                  📦 {p.weight ? `${p.weight} kg` : ''}{(p.weight && (p.depth || p.width || p.height)) ? ' • ' : ''}{(p.depth || p.width || p.height) ? `${p.depth || '0'}x${p.width || '0'}x${p.height || '0'} cm` : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              background: 'var(--pill-bg)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'capitalize'
                            }}>
                              {(p.category || 'General').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {p.promotional_price ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                                  ${Number(p.promotional_price).toFixed(2)}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <s className="no-badge-style" style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                                    ${Number(p.price).toFixed(2)}
                                  </s>
                                  {discount && (
                                    <small style={{ background: '#dcfce7', color: '#16a34a', padding: '1px 4px', borderRadius: '4px', fontSize: '9px', fontWeight: '700' }}>
                                      -{discount}%
                                    </small>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                ${Number(p.price).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: p.stock > 10 ? '#dcfce7' : p.stock > 0 ? '#fef3c7' : '#fee2e2',
                              color: p.stock > 10 ? '#16a34a' : p.stock > 0 ? '#d97706' : '#dc2626',
                              display: 'inline-block'
                            }}>
                              {selectedCountryScope !== 'all' ? `${activeCountryObj.flag} ` : ''}{p.stock ?? 0} u.
                            </span>
                            {selectedCountryScope !== 'all' && p.total_stock !== undefined && (
                              <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '2px' }} title={`Stock local en ${activeCountryObj.name}: ${p.stock ?? 0} u. | Total Regional: ${p.total_stock} u.`}>
                                (Total: {p.total_stock} u.)
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {(() => {
                              const isFeat = Boolean(p.is_featured || p.isFeatured || p.badge === 'DESTACADO');
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeaturedProduct(p.id)}
                                  title={isFeat ? "Quitar de productos destacados en la Home" : "Marcar como producto destacado en la Home"}
                                  style={{
                                    background: isFeat ? '#fffbeb' : '#f8fafc',
                                    border: isFeat ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                                    color: isFeat ? '#d97706' : '#94a3b8',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.78rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: isFeat ? '0 2px 6px rgba(245, 158, 11, 0.2)' : 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span style={{ fontSize: '13px' }}>{isFeat ? '⭐' : '☆'}</span>
                                  <span>{isFeat ? 'Destacado' : 'Normal'}</span>
                                </button>
                              );
                            })()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                className={`dacas-action-pill${editingProduct?.id === p.id && showProductForm ? ' active' : ''}`}
                                onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                                title="Editar producto"
                              >
                                <BrandingVectorIcon name="edit" size={13} />
                                <span>Editar</span>
                              </button>
                              <button
                                className={`dacas-action-pill${selectedProductForStock?.id === p.id && showStockModal ? ' active' : ''}`}
                                onClick={() => openStockModal(p)}
                                title="Stock por Países"
                              >
                                <BrandingVectorIcon name="box" size={13} />
                                <span>Stock</span>
                              </button>
                              <button
                                className="dacas-action-pill"
                                onClick={() => handleOpenCloneModal(p)}
                                title="Clonar este producto a otro país"
                                style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                              >
                                <BrandingVectorIcon name="copy" size={13} color="#16a34a" />
                                <span>Clonar</span>
                              </button>
                              <button
                                className="dacas-action-pill danger"
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Eliminar producto"
                              >
                                <BrandingVectorIcon name="trash" size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MODAL CLONAR PRODUCTO A OTRO PAÍS */}
              {showCloneModal && productToClone && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 99999,
                  padding: '20px'
                }}>
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    maxWidth: '480px',
                    width: '100%',
                    padding: '28px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '26px' }}>📋</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                          Clonar Producto a Otro País
                        </h3>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Multi-tenancy: crea una copia independiente para otro catálogo nacional
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', marginBottom: '18px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{productToClone.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                        SKU actual: <span style={{ fontFamily: 'monospace' }}>{productToClone.sku || 'N/A'}</span> • País actual: <strong>{productToClone.country_code || 'AR'}</strong>
                      </div>
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                        Selecciona el País de Destino:
                      </label>
                      <select
                        value={cloneTargetCountry}
                        onChange={(e) => setCloneTargetCountry(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #0fa4de',
                          fontSize: '13.5px',
                          fontWeight: '600',
                          background: '#FFFFFF',
                          color: '#0F172A'
                        }}
                      >
                        {DACAS_COUNTRIES_LIST.map(c => (
                          <option key={c.code} value={c.code} disabled={c.code === (productToClone.country_code || 'AR')}>
                            {c.flag} {c.name} ({c.code}) {c.code === (productToClone.country_code || 'AR') ? '— (País Actual)' : ''}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                        El nuevo producto tendrá su propio ID, SKU adaptado e inventario local independiente.
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => { setShowCloneModal(false); setProductToClone(null); }}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#64748B',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteClone}
                        disabled={isCloning}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: isCloning ? 'wait' : 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        {isCloning ? 'Clonando...' : `Confirmar y Clonar a ${cloneTargetCountry}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )
        )}

        {/* ═══════════════ BRANDS (MARCAS OFICIALES) ═══════════════ */}
        {activeTab === 'brands' && (
          <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🏷️</span>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#071524' }}>
                    Marcas y Fabricantes Oficiales
                  </h2>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  Personaliza los logotipos, descripciones comerciales, áreas tecnológicas y países autorizados de cada marca en el Shop.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="dacas-pill-btn active"
                  onClick={() => {
                    setNewBrandForm({
                      name: '',
                      logo: '',
                      tagline: '',
                      color: '#0fa4de',
                      category: 'networking',
                      isGlobal: true,
                      countries: []
                    });
                    setShowNewBrandModal(true);
                  }}
                  title="Crear y configurar una nueva marca"
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)' }}
                >
                  <BrandingVectorIcon name="plus" size={16} />
                  <span>Nueva Marca</span>
                </button>
              </div>
            </div>

            {/* KPI Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '22px'
            }}>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Marcas</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{allAdminBrands.length}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Con Logo Configurado</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                  {allAdminBrands.filter(b => Boolean(b.logo)).length}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Con Productos Activos</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                  {allAdminBrands.filter(b => b.productCount > 0).length}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Visualización en Shop</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>
                  Directorio & Marcas Slide
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '22px' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '180px' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar marca o descripción..."
                  value={brandAdminSearch}
                  onChange={(e) => setBrandAdminSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 34px 9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
                {brandAdminSearch && (
                  <button
                    onClick={() => setBrandAdminSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'security', label: '🛡️ Ciberseguridad' },
                  { key: 'networking', label: '🌐 Networking' },
                  { key: 'infraestructura', label: '⚡ Infraestructura' },
                  { key: 'comunicaciones_unificadas', label: '📞 Comunicaciones Unificadas' }
                ].map(c => {
                  const isSel = brandAdminCategory === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setBrandAdminCategory(c.key)}
                      style={{
                        padding: '7px 13px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: isSel ? '700' : '600',
                        border: isSel ? '1.5px solid #0fa4de' : '1px solid #cbd5e1',
                        background: isSel ? 'rgba(15, 164, 222, 0.12)' : '#ffffff',
                        color: isSel ? '#0284c7' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Brands */}
            {filteredAdminBrands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
                <h4 style={{ margin: 0, color: '#334155' }}>No se encontraron marcas</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Prueba ajustando el término de búsqueda o categoría.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {filteredAdminBrands.map(b => {
                  const isGlobal = !b.countries || b.countries.length === 0;
                  return (
                    <div
                      key={b.key}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1.5px solid #e2e8f0',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Top row: Logo preview + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'rgba(15, 164, 222, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px',
                            border: `1.5px solid ${b.color ? `${b.color}33` : '#e2e8f0'}`
                          }}>
                            <BrandLogoImg src={b.logo} alt={b.name} name={b.name} color={b.color} size={32} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{
                              background: b.productCount > 0 ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                              color: b.productCount > 0 ? '#10b981' : '#94a3b8',
                              fontWeight: '700',
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}>
                              {b.productCount} {b.productCount === 1 ? 'Producto' : 'Productos'}
                            </span>
                            <span style={{
                              background: 'rgba(15, 164, 222, 0.08)',
                              color: '#0284c7',
                              fontWeight: '700',
                              fontSize: '10.5px',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              textTransform: 'capitalize'
                            }}>
                              {b.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Name & Tagline */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: '#0f172a' }}>
                            {b.name}
                          </h3>
                          {b.hasCustomLogo && (
                            <span title="Logo personalizado activo" style={{ fontSize: '12px' }}>✨</span>
                          )}
                        </div>

                        <p style={{
                          margin: '0 0 14px',
                          fontSize: '0.84rem',
                          color: '#475569',
                          lineHeight: 1.45,
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          minHeight: '44px'
                        }}>
                          {b.tagline}
                        </p>

                        {/* Country badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Cobertura:</span>
                          {isGlobal ? (
                            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10.5px', fontWeight: '700', padding: '2px 7px', borderRadius: '6px' }}>
                              🌐 Todos los Países
                            </span>
                          ) : (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10.5px', fontWeight: '700', padding: '2px 7px', borderRadius: '6px' }}>
                              {b.countries.map(c => {
                                const found = DACAS_COUNTRIES_LIST.find(x => x.code === c);
                                return found ? found.flag : c;
                              }).join(' ')} ({b.countries.length})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom action row */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditBrand(b.key, b.category, b.originalIdx)}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '9px 12px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(15, 164, 222, 0.25)'
                          }}
                        >
                          <BrandingVectorIcon name="edit" size={13} color="#ffffff" />
                          <span>Editar Marca & Logo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ COUNTRIES ═══════════════ */}
        {activeTab === 'countries' && (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Países y Reglas Fiscales/Envíos</h2>
              <button className="nav-btn" onClick={() => setShowCountryForm(true)}>➕ Nuevo País</button>
            </div>

            {showCountryForm && (
              <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0 }}>{editingCountry ? 'Editar País' : 'Nuevo País'}</h3>
                <form onSubmit={handleCountrySubmit} className="crm-form">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label>Código ISO (e.g. AR, UY, CL, MX) *</label>
                      <input type="text" value={countryForm.code} onChange={e => setCountryForm({ ...countryForm, code: e.target.value })} required maxLength="5" />
                    </div>
                    <div className="form-group">
                      <label>Nombre del País *</label>
                      <input type="text" value={countryForm.name} onChange={e => setCountryForm({ ...countryForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Impuesto / IVA (%)</label>
                      <input type="number" step="0.01" value={countryForm.tax_rate} onChange={e => setCountryForm({ ...countryForm, tax_rate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Costo de Envío Base ($)</label>
                      <input type="number" step="0.01" value={countryForm.shipping_cost} onChange={e => setCountryForm({ ...countryForm, shipping_cost: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Costo de Nacionalización / Aduana ($)</label>
                      <input type="number" step="0.01" value={countryForm.nationalization_cost} onChange={e => setCountryForm({ ...countryForm, nationalization_cost: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Descuento por País (%)</label>
                      <input type="number" step="0.01" value={countryForm.discount_rate} onChange={e => setCountryForm({ ...countryForm, discount_rate: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="btn-submit">{editingCountry ? 'Guardar Cambios' : 'Crear País'}</button>
                    <button type="button" className="btn-delete" onClick={resetCountryForm}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="users-table crm-compact-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Código</th><th>Nombre</th><th>IVA (%)</th><th>Envío Base</th><th>Nacionalización</th><th>Desc. País</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.name}</td>
                      <td>{c.tax_rate}%</td>
                      <td>${c.shipping_cost}</td>
                      <td>${c.nationalization_cost}</td>
                      <td>{c.discount_rate}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditCountry(c)} style={{ background: '#0fa4de', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                          <button onClick={() => handleDeleteCountry(c.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════════ RULES & COUPONS ═══════════════ */}
        {activeTab === 'rules' && (
          <section className="board-section">
            {/* Header & Sub-filter bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandingVectorIcon name="tag" size={22} color="#0FA4DE" strokeWidth={2.2} />
                  <span>Cupones de Descuento y Reglas de Precios B2B</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
                  Creá y administrá cupones promocionales con código y reglas de tarifas automáticas segmentadas por <strong>País</strong>, <strong>Cliente</strong>, <strong>Marca</strong> o <strong>Producto</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  className="dacas-pill-btn active" 
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({ ...initialRuleForm, is_coupon: true, coupon_code: `DACAS-${Math.floor(100 + Math.random() * 900)}` });
                    setShowRuleForm(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontWeight: '800',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(15, 164, 222, 0.25)'
                  }}
                >
                  <BrandingVectorIcon name="plus" size={14} color="#FFFFFF" strokeWidth={2.5} />
                  <span>Crear Cupón de Descuento</span>
                </button>

                <button 
                  className="dacas-pill-btn" 
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({ ...initialRuleForm, is_coupon: false, coupon_code: '' });
                    setShowRuleForm(true);
                  }}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="settings" size={13} color="#475569" strokeWidth={2} />
                  <span>Nueva Regla Automática</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs / Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <button
                onClick={() => setRuleFilterType('all')}
                style={{
                  background: ruleFilterType === 'all' ? '#0FA4DE' : '#F1F5F9',
                  color: ruleFilterType === 'all' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Todos ({rules.length})</span>
              </button>
              <button
                onClick={() => setRuleFilterType('coupons')}
                style={{
                  background: ruleFilterType === 'coupons' ? '#0FA4DE' : '#F1F5F9',
                  color: ruleFilterType === 'coupons' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🎟️ Cupones con Código ({rules.filter(r => r.coupon_code && String(r.coupon_code).trim()).length})</span>
              </button>
              <button
                onClick={() => setRuleFilterType('rules')}
                style={{
                  background: ruleFilterType === 'rules' ? '#0FA4DE' : '#F1F5F9',
                  color: ruleFilterType === 'rules' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>⚙️ Tarifas y Reglas Automáticas ({rules.filter(r => !r.coupon_code || !String(r.coupon_code).trim()).length})</span>
              </button>
            </div>

            {/* Creation / Edit Modal Form */}
            {showRuleForm && (
              <div style={{ background: '#FFFFFF', padding: '24px 28px', borderRadius: '18px', marginBottom: '24px', border: '1px solid #BAE6FD', boxShadow: '0 8px 24px rgba(15, 164, 222, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{editingRule ? '✏️ Editar Configuración de Descuento' : ruleForm.is_coupon ? '🎟️ Crear Nuevo Cupón de Descuento' : '⚙️ Crear Nueva Regla de Precio Automática'}</span>
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Segmentá el beneficio por <strong>País</strong>, <strong>Cliente específico</strong>, <strong>Marca</strong> o <strong>Producto</strong>
                    </span>
                  </div>

                  {/* Toggle Mode */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                    <button
                      type="button"
                      onClick={() => setRuleForm({ ...ruleForm, is_coupon: true })}
                      style={{
                        padding: '5px 12px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: ruleForm.is_coupon ? '#0FA4DE' : 'transparent',
                        color: ruleForm.is_coupon ? '#FFFFFF' : '#475569'
                      }}
                    >
                      🎟️ Cupón con Código
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleForm({ ...ruleForm, is_coupon: false, coupon_code: '' })}
                      style={{
                        padding: '5px 12px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: !ruleForm.is_coupon ? '#0FA4DE' : 'transparent',
                        color: !ruleForm.is_coupon ? '#FFFFFF' : '#475569'
                      }}
                    >
                      ⚙️ Regla Automática B2B
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRuleSubmit} className="crm-form">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    
                    {/* Nombre descriptivo */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Nombre / Descripción del Descuento *</label>
                      <input
                        type="text"
                        value={ruleForm.name}
                        onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                        required
                        placeholder="Ej: Cupón Promocional 20% en Fortinet para Clientes de Argentina"
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', width: '100%' }}
                      />
                    </div>

                    {/* Código de cupón (si aplica) */}
                    {ruleForm.is_coupon && (
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ color: '#0369A1', fontWeight: '800', fontSize: '12.5px' }}>🎟️ Código de Cupón *</label>
                          <button
                            type="button"
                            onClick={() => {
                              const brandPrefix = ruleForm.brand ? ruleForm.brand.slice(0, 5).toUpperCase() : 'DACAS';
                              const randomCode = `${brandPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
                              setRuleForm({ ...ruleForm, coupon_code: randomCode });
                            }}
                            style={{ background: 'none', border: 'none', color: '#0FA4DE', fontSize: '11px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            ⚡ Generar
                          </button>
                        </div>
                        <input
                          type="text"
                          value={ruleForm.coupon_code}
                          onChange={e => setRuleForm({ ...ruleForm, coupon_code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                          required={ruleForm.is_coupon}
                          placeholder="Ej: FORTINET-ARG-20"
                          style={{ color: '#0369A1', background: '#F0F9FF', border: '1.5px solid #BAE6FD', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}
                        />
                      </div>
                    )}

                    {/* Tipo de Ajuste */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Tipo de Ajuste *</label>
                      <select
                        value={ruleForm.rule_type}
                        onChange={e => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="discount">🏷️ Descuento</option>
                        <option value="markup">📈 Recargo / Markup</option>
                        <option value="fixed_price">💲 Precio Fijo</option>
                      </select>
                    </div>

                    {/* Formato de Valor (% vs USD) */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Unidad de Medida *</label>
                      <select
                        value={ruleForm.value_type}
                        onChange={e => setRuleForm({ ...ruleForm, value_type: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto Fijo en USD ($)</option>
                      </select>
                    </div>

                    {/* Valor numérico */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Valor del Beneficio *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ruleForm.value}
                        onChange={e => setRuleForm({ ...ruleForm, value: e.target.value })}
                        required
                        placeholder={ruleForm.value_type === 'percentage' ? 'Ej: 15 (para 15%)' : 'Ej: 50.00 (para $50 USD)'}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
                      />
                    </div>

                    {/* DIMENSIÓN 1: PAÍS */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🌎 País Destino (Segmentación)</label>
                      <select
                        value={ruleForm.country_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, country_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">🌎 Válido para todos los países</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                      </select>
                    </div>

                    {/* DIMENSIÓN 2: CLIENTE / USUARIO */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>👤 Cliente / Integrador Específico</label>
                      <select
                        value={ruleForm.user_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, user_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">👤 Válido para cualquier cliente</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            #{u.id} - {u.razon_social || u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DIMENSIÓN 3: MARCA / FABRICANTE */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🏷️ Marca / Fabricante</label>
                      <select
                        value={ruleForm.brand || ''}
                        onChange={e => setRuleForm({ ...ruleForm, brand: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">🏷️ Aplica a todas las marcas</option>
                        <option value="Fortinet">Fortinet (Cybersecurity)</option>
                        <option value="MikroTik">MikroTik (Routers & Wireless)</option>
                        <option value="Aruba">Aruba Networks (Enterprise WiFi/Switching)</option>
                        <option value="AudioCodes">AudioCodes (VoIP & Microsoft Teams)</option>
                        <option value="Avaya">Avaya (Unified Communications)</option>
                        <option value="Vertiv">Vertiv (UPS & Data Center)</option>
                        <option value="Panduit">Panduit (Cabling & Racks)</option>
                        <option value="CommScope">CommScope (Enterprise Cabling)</option>
                        <option value="Eaton">Eaton (Power Quality)</option>
                        <option value="Sophos">Sophos (Security)</option>
                        <option value="SonicWall">SonicWall (Firewalls)</option>
                        <option value="Microsoft">Microsoft (Licencias & Cloud)</option>
                        <option value="Hikvision">Hikvision (Seguridad y CCTV)</option>
                        <option value="Grandstream">Grandstream (Telefonía IP)</option>
                        <option value="Dacas">Dacas Soluciones Integradas</option>
                      </select>
                    </div>

                    {/* DIMENSIÓN 4: PRODUCTO ESPECÍFICO */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>📦 Producto Específico</label>
                      <select
                        value={ruleForm.product_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, product_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">📦 Aplica a todo el catálogo</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.brand || 'DACAS'}] - Base: ${p.price} USD
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DIMENSIÓN 5: TIPO DE CLIENTE */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🏢 Tipo de Cliente (Segmento B2B)</label>
                      <select
                        value={ruleForm.tipo_cliente || ''}
                        onChange={e => setRuleForm({ ...ruleForm, tipo_cliente: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Todos los segmentos de clientes</option>
                        <option value="Integrador IT / Reseller">Integrador IT / Reseller</option>
                        <option value="Empresa / Reseller">Empresa / Reseller</option>
                        <option value="Proveedor de Internet (ISP / WISP)">Proveedor de Internet (ISP / WISP)</option>
                        <option value="Empresa Corporativa">Empresa Corporativa</option>
                        <option value="Consultora IT / Ciberseguridad">Consultora IT / Ciberseguridad</option>
                        <option value="Entidad Gubernamental / Educación">Entidad Gubernamental / Educación</option>
                        <option value="Otro">Otro Tipo</option>
                      </select>
                    </div>

                    {/* CONDICIONES DE CUPÓN: MONTO MÍNIMO */}
                    {ruleForm.is_coupon && (
                      <div className="form-group">
                        <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>💵 Monto Mínimo de Pedido (USD, Opcional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={ruleForm.min_order_amount}
                          onChange={e => setRuleForm({ ...ruleForm, min_order_amount: e.target.value })}
                          placeholder="Ej: 500.00"
                          style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                        />
                      </div>
                    )}

                    {/* CONDICIONES DE CUPÓN: FECHA DE VENCIMIENTO */}
                    {ruleForm.is_coupon && (
                      <div className="form-group">
                        <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>📅 Fecha de Vencimiento (Opcional)</label>
                        <input
                          type="date"
                          value={ruleForm.valid_until}
                          onChange={e => setRuleForm({ ...ruleForm, valid_until: e.target.value })}
                          style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                        />
                      </div>
                    )}

                    {/* CONDICIONES DE CUPÓN: LÍMITE DE USOS */}
                    {ruleForm.is_coupon && (
                      <div className="form-group">
                        <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>🔢 Límite de Usos Máximos (Opcional)</label>
                        <input
                          type="number"
                          value={ruleForm.usage_limit}
                          onChange={e => setRuleForm({ ...ruleForm, usage_limit: e.target.value })}
                          placeholder="Ej: 50 (Ilimitado si queda vacío)"
                          style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                        />
                      </div>
                    )}

                    {/* PRIORIDAD */}
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>⚡ Prioridad de Aplicación</label>
                      <input
                        type="number"
                        value={ruleForm.priority}
                        onChange={e => setRuleForm({ ...ruleForm, priority: e.target.value })}
                        placeholder="0"
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>

                    {/* CHECKBOX ACTIVA */}
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '26px' }}>
                      <input 
                        type="checkbox" 
                        id="rule_active" 
                        checked={ruleForm.is_active} 
                        onChange={e => setRuleForm({ ...ruleForm, is_active: e.target.checked })} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                      />
                      <label htmlFor="rule_active" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', color: '#0F172A', fontSize: '13px' }}>
                        {ruleForm.is_coupon ? 'Cupón Activo para Canje' : 'Regla de Precios Activa'}
                      </label>
                    </div>

                  </div>

                  {/* Impact Live Summary Box */}
                  <div style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#0369A1',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '16px', marginTop: '1px' }}>💡</span>
                    <div>
                      <strong>Resumen del impacto:</strong>{' '}
                      {ruleForm.is_coupon ? (
                        <span>
                          El cupón <strong>{ruleForm.coupon_code || '[SIN CÓDIGO]'}</strong> otorgará un{' '}
                          <strong>{ruleForm.value ? (ruleForm.value_type === 'percentage' ? `${ruleForm.value}% OFF` : `$${ruleForm.value} USD de descuento`) : 'beneficio sin definir'}</strong>{' '}
                          para{' '}
                          <strong>
                            {ruleForm.user_id ? (users.find(u => String(u.id) === String(ruleForm.user_id))?.razon_social || `Cliente #${ruleForm.user_id}`) : 'cualquier cliente'}
                          </strong>
                          {ruleForm.country_id ? ` con entrega en ${countries.find(c => String(c.id) === String(ruleForm.country_id))?.name || 'país seleccionado'}` : ''}
                          {ruleForm.brand ? ` en equipos de la marca "${ruleForm.brand}"` : ''}
                          {ruleForm.product_id ? ` para el producto seleccionado` : ''}
                          {ruleForm.min_order_amount ? ` (con compra mínima de $${ruleForm.min_order_amount} USD)` : ''}
                          {ruleForm.valid_until ? ` hasta el ${ruleForm.valid_until}` : ''}.
                        </span>
                      ) : (
                        <span>
                          Se aplicará una regla automática de{' '}
                          <strong>
                            {ruleForm.rule_type === 'discount' ? 'Descuento' : ruleForm.rule_type === 'markup' ? 'Recargo' : 'Precio Fijo'} de{' '}
                            {ruleForm.value ? (ruleForm.value_type === 'percentage' ? `${ruleForm.value}%` : `$${ruleForm.value} USD`) : '(Sin definir)'}
                          </strong>{' '}
                          para{' '}
                          <strong>
                            {ruleForm.user_id ? (users.find(u => String(u.id) === String(ruleForm.user_id))?.razon_social || `Cliente #${ruleForm.user_id}`) : 'todos los clientes'}
                          </strong>
                          {ruleForm.country_id ? ` en ${countries.find(c => String(c.id) === String(ruleForm.country_id))?.name || 'país seleccionado'}` : ''}
                          {ruleForm.brand ? ` en marca "${ruleForm.brand}"` : ''}
                          {ruleForm.product_id ? ` para el producto seleccionado` : ''}.
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      style={{ 
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', 
                        color: '#FFFFFF', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: '10px 24px', 
                        fontWeight: '800', 
                        fontSize: '13px', 
                        cursor: 'pointer' 
                      }}
                    >
                      {editingRule ? 'Guardar Modificaciones' : ruleForm.is_coupon ? 'Crear Cupón de Descuento' : 'Crear Regla de Precio'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-delete" 
                      onClick={resetRuleForm}
                      style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table of Rules & Coupons */}
            <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>Código / Nombre</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>Beneficio</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>🌎 País</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>👤 Cliente</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>🏷️ Marca</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>📦 Producto</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>Condiciones / Canjes</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: '800', color: '#475569', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rules
                    .filter(r => {
                      if (ruleFilterType === 'coupons') return !!(r.coupon_code && String(r.coupon_code).trim());
                      if (ruleFilterType === 'rules') return !(r.coupon_code && String(r.coupon_code).trim());
                      return true;
                    })
                    .map(r => {
                      const isCoupon = !!(r.coupon_code && String(r.coupon_code).trim());
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          
                          {/* Código / Nombre */}
                          <td style={{ padding: '12px 14px' }}>
                            {isCoupon ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ 
                                    background: '#E0F2FE', 
                                    color: '#0369A1', 
                                    padding: '3px 8px', 
                                    borderRadius: '6px', 
                                    fontWeight: '900', 
                                    fontSize: '12px', 
                                    letterSpacing: '0.6px',
                                    border: '1px solid #BAE6FD',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    🎟️ {r.coupon_code}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(r.coupon_code);
                                      alert(`¡Código "${r.coupon_code}" copiado al portapapeles!`);
                                    }}
                                    title="Copiar código de cupón"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B' }}
                                  >
                                    <BrandingVectorIcon name="clipboard" size={12} color="#0FA4DE" />
                                  </button>
                                </div>
                                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>{r.name}</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>{r.name}</strong>
                                <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '600' }}>⚙️ Tarifa Automática B2B</span>
                              </div>
                            )}
                          </td>

                          {/* Ajuste / Beneficio */}
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: r.rule_type === 'discount' ? '#DCFCE7' : '#E0F2FE',
                              color: r.rule_type === 'discount' ? '#166534' : '#0369A1',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              display: 'inline-block'
                            }}>
                              {r.rule_type === 'discount' ? 'Descuento ' : r.rule_type === 'markup' ? 'Markup ' : 'Fijo '}
                              {r.value_type === 'percentage' ? `${r.value}%` : `$${r.value} USD`}
                            </span>
                          </td>

                          {/* País */}
                          <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                            {r.country_name || (r.country_id ? `ID País: ${r.country_id}` : (
                              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Todos</span>
                            ))}
                          </td>

                          {/* Cliente */}
                          <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                            {r.user_razon_social || r.user_email ? (
                              <span style={{ background: '#F1F5F9', color: '#0F172A', padding: '2px 7px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', display: 'inline-block' }}>
                                👤 {r.user_razon_social || r.user_email}
                              </span>
                            ) : r.tipo_cliente ? (
                              <span style={{ background: '#F8FAFC', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                🏢 {r.tipo_cliente}
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Todos los clientes</span>
                            )}
                          </td>

                          {/* Marca */}
                          <td style={{ padding: '12px 14px' }}>
                            {r.brand ? (
                              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                {r.brand}
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>Todas</span>
                            )}
                          </td>

                          {/* Producto */}
                          <td style={{ padding: '12px 14px', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.product_name || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Todo el catálogo</span>}
                          </td>

                          {/* Condiciones & Usos */}
                          <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#475569' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {isCoupon && (
                                <span style={{ fontWeight: '700', color: '#0369A1' }}>
                                  Usos: {r.times_used || 0}{r.usage_limit ? ` / ${r.usage_limit}` : ' (Ilimitado)'}
                                </span>
                              )}
                              {r.min_order_amount && (
                                <span style={{ color: '#64748B', fontSize: '10.5px' }}>
                                  Mínimo: ${parseFloat(r.min_order_amount).toFixed(2)} USD
                                </span>
                              )}
                              {r.valid_until && (
                                <span style={{ color: '#E11D48', fontSize: '10.5px', fontWeight: '700' }}>
                                  Vence: {new Date(r.valid_until).toLocaleDateString('es-AR')}
                                </span>
                              )}
                              {!isCoupon && !r.min_order_amount && !r.valid_until && (
                                <span style={{ color: '#94A3B8' }}>Prio: {r.priority || 0}</span>
                              )}
                            </div>
                          </td>

                          {/* Estado */}
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: r.is_active ? '#DCFCE7' : '#FEE2E2',
                              color: r.is_active ? '#166534' : '#DC2626',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {r.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <button 
                                onClick={() => handleEditRule(r)} 
                                style={{ 
                                  background: '#F1F5F9', 
                                  color: '#0284C7', 
                                  border: '1px solid #CBD5E1', 
                                  padding: '4px 9px', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer', 
                                  fontWeight: '700',
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <BrandingVectorIcon name="edit" size={11} color="#0284C7" />
                                <span>Editar</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteRule(r.id)} 
                                style={{ 
                                  background: '#FEE2E2', 
                                  color: '#EF4444', 
                                  border: 'none', 
                                  padding: '4px 7px', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer', 
                                  fontWeight: '700',
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Eliminar regla / cupón"
                              >
                                <BrandingVectorIcon name="trash" size={11} color="#EF4444" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════════ USERS / CLIENTES ═══════════════ */}
        {activeTab === 'users' && (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Gestión y Aprobación de Clientes DACAS</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#6b7280' }}>
                  Revisa las solicitudes de registro enviadas desde el Shop, aprueba clientes mayoristas y gestiona condiciones comerciales.
                </p>
              </div>
              <button className="dacas-action-pill primary" onClick={() => { resetUserForm(); setShowUserForm(true); }}>
                <BrandingVectorIcon name="plus" size={14} color="#ffffff" />
                <span>Crear Cliente Manualmente</span>
              </button>
            </div>

            {/* Country Scope Notice */}
            {selectedCountryScope !== 'all' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
                border: '1px solid rgba(15, 164, 222, 0.25)',
                padding: '10px 16px',
                borderRadius: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{activeCountryObj.flag || '🇦🇷'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    Clientes radicados en {activeCountryObj.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    — Mostrando únicamente cuentas mayoristas de {activeCountryObj.name} ({countryScopedUsers.length} clientes encontrados)
                  </span>
                </div>
                <button 
                  onClick={() => handleCountryScopeChange('all')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Ver Todos los Países 🌐
                </button>
              </div>
            )}

            {/* Barra de Filtros por Estado y Buscador de Clientes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'Todos los Clientes', icon: null, count: countryScopedUsers.length },
                  { key: 'pendiente', label: 'Solicitudes Pendientes', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => u.status === 'pendiente').length, highlight: true },
                  { key: 'activo', label: 'Clientes Activos', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => (u.status || 'activo') === 'activo').length },
                  { key: 'inactivo', label: 'Inactivos', icon: <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>, count: countryScopedUsers.filter(u => u.status === 'inactivo').length }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setUserFilterStatus(f.key)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: userFilterStatus === f.key ? '#0fa4de' : 'var(--border-color)',
                      background: userFilterStatus === f.key ? '#0fa4de' : 'var(--card-bg)',
                      color: userFilterStatus === f.key ? '#ffffff' : 'var(--text-main)',
                      fontWeight: userFilterStatus === f.key ? '700' : '600',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: userFilterStatus === f.key ? '0 2px 6px rgba(15, 164, 222, 0.2)' : 'none'
                    }}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                    <span style={{
                      background: userFilterStatus === f.key ? 'rgba(255,255,255,0.25)' : (f.highlight && f.count > 0 ? '#fef3c7' : '#f1f5f9'),
                      color: userFilterStatus === f.key ? '#ffffff' : (f.highlight && f.count > 0 ? '#d97706' : '#64748b'),
                      padding: '1px 5px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Buscador de clientes */}
              <div style={{ position: 'relative', width: '280px', minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="Buscar empresa, usuario, CUIT, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                  <BrandingVectorIcon name="search" size={13} color="#94a3b8" />
                </span>
                {userSearch && (
                  <button 
                    type="button" 
                    onClick={() => setUserSearch('')}
                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', padding: '2px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* ALTA / EDICIÓN DE USUARIO B2B */}
            {showUserForm && (
              <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{editingUser ? `Editar Usuario / Cliente: ${editingUser.name}` : (userCreateMode === 'existing_company' ? `Agregar Nuevo Usuario a Empresa: ${userForm.razon_social || 'Seleccionada'}` : 'Alta Nueva Empresa & Usuario Principal B2B')}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {editingUser ? 'Actualiza los datos personales, cargo o condiciones de acceso.' : (userCreateMode === 'existing_company' ? 'Crea una cuenta adicional de log-in que compartirá la misma empresa, condiciones fiscales y descuentos.' : 'Crea una nueva razón social junto a su primer usuario habilitado para operar.')}
                    </p>
                  </div>
                  <button onClick={resetUserForm} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>

                {/* Switcher Modo de Creación (sólo si no estamos editando) */}
                {!editingUser && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'rgba(0,0,0,0.03)', padding: '6px', borderRadius: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserCreateMode('new_company');
                        setSelectedExistingCompany('');
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: 'none',
                        background: userCreateMode === 'new_company' ? 'linear-gradient(135deg, #0fa4de, #0284c7)' : 'transparent',
                        color: userCreateMode === 'new_company' ? '#ffffff' : 'var(--text-main)',
                        fontWeight: userCreateMode === 'new_company' ? '700' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: userCreateMode === 'new_company' ? '0 2px 8px rgba(15, 164, 222, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>🏢</span> Nueva Empresa & Usuario Principal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserCreateMode('existing_company');
                        if (distinctCompanies.length > 0 && !selectedExistingCompany) {
                          handleSelectExistingCompany(distinctCompanies[0].razon_social);
                        }
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: 'none',
                        background: userCreateMode === 'existing_company' ? 'linear-gradient(135deg, #0fa4de, #0284c7)' : 'transparent',
                        color: userCreateMode === 'existing_company' ? '#ffffff' : 'var(--text-main)',
                        fontWeight: userCreateMode === 'existing_company' ? '700' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: userCreateMode === 'existing_company' ? '0 2px 8px rgba(15, 164, 222, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>👥</span> Agregar Usuario a Empresa Existente ({distinctCompanies.length})
                    </button>
                  </div>
                )}

                {/* Si estamos agregando a empresa existente, mostrar selector */}
                {!editingUser && userCreateMode === 'existing_company' && (
                  <div style={{ background: 'rgba(15, 164, 222, 0.08)', border: '1px solid rgba(15, 164, 222, 0.3)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '6px' }}>
                      🏢 Seleccionar Empresa a la que pertenecerá este usuario:
                    </label>
                    <select
                      value={selectedExistingCompany || userForm.razon_social}
                      onChange={(e) => handleSelectExistingCompany(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #0fa4de',
                        fontWeight: '700',
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        fontSize: '14px'
                      }}
                    >
                      {distinctCompanies.length === 0 && <option value="">No hay empresas registradas aún</option>}
                      {distinctCompanies.map(c => (
                        <option key={c.razon_social} value={c.razon_social}>
                          {c.razon_social} {c.numero_nit ? `— CUIT/NIT: ${c.numero_nit}` : ''} {c.country_name ? `(${c.country_name})` : ''}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>ℹ️</span> Este nuevo usuario podrá ingresar con su propio email y clave, compartiendo el catálogo de precios, condiciones comerciales y pedidos de <strong>{userForm.razon_social || 'la empresa'}</strong>.
                    </div>
                  </div>
                )}
                
                <div className="stepper" style={{ marginBottom: '20px' }}>
                  <div className={`step ${userFormSection === 1 ? 'active' : ''}`} onClick={() => setUserFormSection(1)}>1. Datos Usuario & Auth</div>
                  <div className={`step ${userFormSection === 2 ? 'active' : ''}`} onClick={() => setUserFormSection(2)}>2. Ship To / Fiscal</div>
                  <div className={`step ${userFormSection === 3 ? 'active' : ''}`} onClick={() => setUserFormSection(3)}>3. Contactos Empresa</div>
                  <div className={`step ${userFormSection === 4 ? 'active' : ''}`} onClick={() => setUserFormSection(4)}>4. Mails Notificaciones</div>
                  {(!userForm.country_id || parseInt(userForm.country_id) === 2 || String(userForm.country_id).toLowerCase() === 'ar' || userForm.country_id === '') && (
                    <div className={`step ${userFormSection === 5 ? 'active' : ''}`} onClick={() => setUserFormSection(5)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🇦🇷</span> 5. Perc/Ret IIBB
                    </div>
                  )}
                </div>

                <form onSubmit={handleUserSubmit} className="crm-form">
                  {/* SECCION 1 */}
                  {userFormSection === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label>Estado de Cuenta *</label>
                        <select 
                          value={userForm.status || 'activo'} 
                          onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                          style={{
                            fontWeight: '700',
                            borderColor: userForm.status === 'activo' ? '#10b981' : userForm.status === 'pendiente' ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          <option value="activo">🟢 Activo (Habilitado para comprar)</option>
                          <option value="pendiente">🟡 Pendiente de Aprobación</option>
                          <option value="inactivo">🔴 Inactivo / Bloqueado</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nombre y Apellido del Usuario *</label>
                        <input type="text" placeholder="Ej: Laura Gómez" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Cargo / Rol en la Empresa</label>
                        <input 
                          type="text" 
                          list="cargos-list"
                          placeholder="Ej: Encargado de Compras, Gerente, Finanzas..." 
                          value={userForm.cargo || ''} 
                          onChange={e => setUserForm({ ...userForm, cargo: e.target.value })} 
                        />
                        <datalist id="cargos-list">
                          <option value="Encargado de Compras" />
                          <option value="Comprador Senior" />
                          <option value="Gerente General / Director" />
                          <option value="Administración & Finanzas" />
                          <option value="Soporte Técnico / Preventa" />
                          <option value="Comercial / Ventas" />
                          <option value="Operaciones / Logística" />
                        </datalist>
                      </div>
                      <div className="form-group">
                        <label>Email de Log-In (Shop) *</label>
                        <input type="email" placeholder="usuario@empresa.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Contraseña {editingUser && '(Dejar vacío para no cambiar)'} {!editingUser && '*'}</label>
                        <input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required={!editingUser} />
                      </div>
                      <div className="form-group">
                        <label>Teléfono Directo / WhatsApp</label>
                        <input type="text" placeholder="+54 11 ..." value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Razón Social / Empresa *</label>
                        <input 
                          type="text" 
                          value={userForm.razon_social} 
                          onChange={e => setUserForm({ ...userForm, razon_social: e.target.value })} 
                          required 
                          disabled={!editingUser && userCreateMode === 'existing_company'}
                          style={{ background: !editingUser && userCreateMode === 'existing_company' ? 'rgba(0,0,0,0.04)' : undefined }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Cliente</label>
                        <input type="text" value={userForm.tipo_cliente} onChange={e => setUserForm({ ...userForm, tipo_cliente: e.target.value })} placeholder="Ej: Integrador IT, Reseller, Corporativo" />
                      </div>
                      <div className="form-group">
                        <label>Sitio Web</label>
                        <input type="text" value={userForm.web} onChange={e => setUserForm({ ...userForm, web: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label>Fecha Límite Facturación</label>
                        <input type="date" value={userForm.fecha_limite_facturacion} onChange={e => setUserForm({ ...userForm, fecha_limite_facturacion: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Dirección Legal</label>
                        <textarea value={userForm.direccion_legal} onChange={e => setUserForm({ ...userForm, direccion_legal: e.target.value })} rows="2" />
                      </div>
                      <div className="form-group">
                        <label>Ciudad</label>
                        <input type="text" value={userForm.ciudad} onChange={e => setUserForm({ ...userForm, ciudad: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Código Postal</label>
                        <input type="text" value={userForm.codigo_postal} onChange={e => setUserForm({ ...userForm, codigo_postal: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>País Legal</label>
                        <select value={userForm.country_id} onChange={e => setUserForm({ ...userForm, country_id: e.target.value })}>
                          <option value="">Selecciona País...</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* SECCION 2 */}
                  {userFormSection === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label>Report To (País de Reporte)</label>
                        <select value={userForm.report_to_country_id} onChange={e => setUserForm({ ...userForm, report_to_country_id: e.target.value })}>
                          <option value="">Selecciona País...</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Vendedor Asignado (Ejecutivo DACAS)</label>
                        <input type="text" value={userForm.vendedor} onChange={e => setUserForm({ ...userForm, vendedor: e.target.value })} placeholder="Ej: Juan Pérez" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Dirección de Entrega</label>
                        <textarea value={userForm.direccion_entrega} onChange={e => setUserForm({ ...userForm, direccion_entrega: e.target.value })} rows="2" />
                      </div>
                      <div className="form-group">
                        <label>Localidad Entrega</label>
                        <input type="text" value={userForm.localidad_entrega} onChange={e => setUserForm({ ...userForm, localidad_entrega: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Ciudad Entrega</label>
                        <input type="text" value={userForm.ciudad_entrega} onChange={e => setUserForm({ ...userForm, ciudad_entrega: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Cód Postal Entrega</label>
                        <input type="text" value={userForm.codigo_postal_entrega} onChange={e => setUserForm({ ...userForm, codigo_postal_entrega: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>País de Entrega</label>
                        <select value={userForm.pais_entrega_id} onChange={e => setUserForm({ ...userForm, pais_entrega_id: e.target.value })}>
                          <option value="">Selecciona País...</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tipo de IVA / Condición Fiscal</label>
                        <input type="text" value={userForm.tipo_iva} onChange={e => setUserForm({ ...userForm, tipo_iva: e.target.value })} placeholder="Resp. Inscripto, Exento..." />
                      </div>
                      <div className="form-group">
                        <label>Número de CUIT / RUT / NIT</label>
                        <input type="text" value={userForm.numero_nit} onChange={e => setUserForm({ ...userForm, numero_nit: e.target.value })} placeholder="30-XXXXXXXX-X" />
                      </div>
                    </div>
                  )}

                  {/* SECCION 3 */}
                  {userFormSection === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Encargado de Compras</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div className="form-group"><label>Nombre</label><input type="text" value={userForm.nombre_compras} onChange={e => setUserForm({ ...userForm, nombre_compras: e.target.value })} /></div>
                          <div className="form-group"><label>Teléfono</label><input type="text" value={userForm.telefono_compras} onChange={e => setUserForm({ ...userForm, telefono_compras: e.target.value })} /></div>
                          <div className="form-group"><label>Email</label><input type="email" value={userForm.email_compras} onChange={e => setUserForm({ ...userForm, email_compras: e.target.value })} /></div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Encargado de Pagos</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div className="form-group"><label>Nombre</label><input type="text" value={userForm.nombre_pagos} onChange={e => setUserForm({ ...userForm, nombre_pagos: e.target.value })} /></div>
                          <div className="form-group"><label>Teléfono</label><input type="text" value={userForm.telefono_pagos} onChange={e => setUserForm({ ...userForm, telefono_pagos: e.target.value })} /></div>
                          <div className="form-group"><label>Email</label><input type="email" value={userForm.email_pagos} onChange={e => setUserForm({ ...userForm, email_pagos: e.target.value })} /></div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Encargado de Administración</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div className="form-group"><label>Nombre</label><input type="text" value={userForm.nombre_admin} onChange={e => setUserForm({ ...userForm, nombre_admin: e.target.value })} /></div>
                          <div className="form-group"><label>Teléfono</label><input type="text" value={userForm.telefono_admin} onChange={e => setUserForm({ ...userForm, telefono_admin: e.target.value })} /></div>
                          <div className="form-group"><label>Email</label><input type="email" value={userForm.email_admin} onChange={e => setUserForm({ ...userForm, email_admin: e.target.value })} /></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECCION 4 */}
                  {userFormSection === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label>Envío de Factura Electrónica (Email)</label>
                        <input type="email" value={userForm.email_factura_electronica} onChange={e => setUserForm({ ...userForm, email_factura_electronica: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Contacto de Compras (Email)</label>
                        <input type="email" value={userForm.email_contacto_compras} onChange={e => setUserForm({ ...userForm, email_contacto_compras: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Email para recepción de cotizaciones automáticas</label>
                        <input type="email" value={userForm.email_cotizaciones_automaticas} onChange={e => setUserForm({ ...userForm, email_cotizaciones_automaticas: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {/* SECCION 5: PERCEPCIONES / RETENCIONES IIBB (ARGENTINA) */}
                  {userFormSection === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Banner Informativo */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.03) 100%)',
                        border: '1px solid rgba(15, 164, 222, 0.25)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>🏛️</span>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0369a1' }}>
                              Solapa de Perc/Ret IIBB (Ingresos Brutos - Argentina)
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              Las percepciones activas se calcularán automáticamente sobre el <strong>valor neto de productos</strong> al momento del Checkout/Pago.
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          letterSpacing: '0.04em'
                        }}>
                          ARGENTINA EXCLUSIVO
                        </span>
                      </div>

                      {/* Top Row: Jurisdicción & Nro Inscripcion IIBB */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* Box 1: Jurisdicción */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                            Jurisdicción
                          </label>
                          <select
                            value={userForm.iibb_jurisdiccion || '901 - Capital Federal'}
                            onChange={e => setUserForm({ ...userForm, iibb_jurisdiccion: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#0f172a',
                              background: '#f8fafc'
                            }}
                          >
                            <option value="901 - Capital Federal">901 - Capital Federal</option>
                            <option value="902 - Buenos Aires">902 - Buenos Aires</option>
                            <option value="903 - Catamarca">903 - Catamarca</option>
                            <option value="904 - Córdoba">904 - Córdoba</option>
                            <option value="905 - Corrientes">905 - Corrientes</option>
                            <option value="906 - Chaco">906 - Chaco</option>
                            <option value="907 - Chubut">907 - Chubut</option>
                            <option value="908 - Entre Ríos">908 - Entre Ríos</option>
                            <option value="909 - Formosa">909 - Formosa</option>
                            <option value="910 - Jujuy">910 - Jujuy</option>
                            <option value="911 - La Pampa">911 - La Pampa</option>
                            <option value="912 - La Rioja">912 - La Rioja</option>
                            <option value="913 - Mendoza">913 - Mendoza</option>
                            <option value="914 - Misiones">914 - Misiones</option>
                            <option value="915 - Neuquén">915 - Neuquén</option>
                            <option value="916 - Río Negro">916 - Río Negro</option>
                            <option value="917 - Salta">917 - Salta</option>
                            <option value="918 - San Juan">918 - San Juan</option>
                            <option value="919 - San Luis">919 - San Luis</option>
                            <option value="920 - Santa Cruz">920 - Santa Cruz</option>
                            <option value="921 - Santa Fe">921 - Santa Fe</option>
                            <option value="922 - Santiago del Estero">922 - Santiago del Estero</option>
                            <option value="924 - Tucumán">924 - Tucumán</option>
                            <option value="900 - Convenio Multilateral">900 - Convenio Multilateral</option>
                          </select>
                        </div>

                        {/* Box 2: Nro Inscripcion IIBB */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                            Nro Inscripcion IIBB
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px' }}>
                            <select
                              value={userForm.iibb_tipo || 'C.M.'}
                              onChange={e => setUserForm({ ...userForm, iibb_tipo: e.target.value })}
                              style={{
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#0f172a',
                                background: '#f8fafc'
                              }}
                            >
                              <option value="C.M.">C.M.</option>
                              <option value="Local">Local</option>
                              <option value="Exento">Exento</option>
                              <option value="No Inscripto">No Inscripto</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Ej: 9017223280"
                              value={userForm.iibb_numero || ''}
                              onChange={e => setUserForm({ ...userForm, iibb_numero: e.target.value })}
                              style={{
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#0f172a'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Percepciones Grid: 5 Boxes matching ERP Reference Image */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                        {/* 1. Perc CABA */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: userForm.percepciones?.caba?.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Perc CABA</span>
                            {userForm.percepciones?.caba?.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '70px' }}>
                              <input
                                type="checkbox"
                                checked={!!userForm.percepciones?.caba?.enabled}
                                onChange={e => handlePercepcionChange('caba', 'enabled', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              <span>CABA</span>
                            </label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="1,5000"
                                value={userForm.percepciones?.caba?.alicuota !== undefined ? userForm.percepciones?.caba?.alicuota : 1.5}
                                onChange={e => handlePercepcionChange('caba', 'alicuota', parseFloat(e.target.value) || 0)}
                                style={{ width: '75px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right', background: '#ffffff' }}
                              />
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>%</span>
                            </div>
                            <input
                              type="date"
                              value={userForm.percepciones?.caba?.vigencia || '2026-10-01'}
                              onChange={e => handlePercepcionChange('caba', 'vigencia', e.target.value)}
                              style={{ width: '135px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', background: '#ffffff', marginLeft: 'auto' }}
                            />
                          </div>
                        </div>

                        {/* 2. Perc Salta */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: userForm.percepciones?.salta?.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Perc Salta</span>
                            {userForm.percepciones?.salta?.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '70px' }}>
                              <input
                                type="checkbox"
                                checked={!!userForm.percepciones?.salta?.enabled}
                                onChange={e => handlePercepcionChange('salta', 'enabled', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              <span>Salta</span>
                            </label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="0,0000"
                                value={userForm.percepciones?.salta?.alicuota !== undefined ? userForm.percepciones?.salta?.alicuota : 0}
                                onChange={e => handlePercepcionChange('salta', 'alicuota', parseFloat(e.target.value) || 0)}
                                style={{ width: '75px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right', background: '#ffffff' }}
                              />
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>%</span>
                            </div>
                            <input
                              type="date"
                              value={userForm.percepciones?.salta?.vigencia || '2019-08-01'}
                              onChange={e => handlePercepcionChange('salta', 'vigencia', e.target.value)}
                              style={{ width: '135px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', background: '#ffffff', marginLeft: 'auto' }}
                            />
                          </div>
                        </div>

                        {/* 3. Perc Bs As */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: userForm.percepciones?.bsas?.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Perc Bs As</span>
                            {userForm.percepciones?.bsas?.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '70px' }}>
                              <input
                                type="checkbox"
                                checked={!!userForm.percepciones?.bsas?.enabled}
                                onChange={e => handlePercepcionChange('bsas', 'enabled', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              <span>BsAs</span>
                            </label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="0,0000"
                                value={userForm.percepciones?.bsas?.alicuota !== undefined ? userForm.percepciones?.bsas?.alicuota : 0}
                                onChange={e => handlePercepcionChange('bsas', 'alicuota', parseFloat(e.target.value) || 0)}
                                style={{ width: '75px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right', background: '#ffffff' }}
                              />
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>%</span>
                            </div>
                            <input
                              type="date"
                              value={userForm.percepciones?.bsas?.vigencia || '2026-10-01'}
                              onChange={e => handlePercepcionChange('bsas', 'vigencia', e.target.value)}
                              style={{ width: '135px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', background: '#ffffff', marginLeft: 'auto' }}
                            />
                          </div>
                        </div>

                        {/* 4. Perc Misiones */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: userForm.percepciones?.misiones?.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Perc Misiones</span>
                            {userForm.percepciones?.misiones?.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '70px' }}>
                              <input
                                type="checkbox"
                                checked={!!userForm.percepciones?.misiones?.enabled}
                                onChange={e => handlePercepcionChange('misiones', 'enabled', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              <span>Misiones</span>
                            </label>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="0,000"
                                value={userForm.percepciones?.misiones?.alicuota !== undefined ? userForm.percepciones?.misiones?.alicuota : 0}
                                onChange={e => handlePercepcionChange('misiones', 'alicuota', parseFloat(e.target.value) || 0)}
                                style={{ width: '75px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right', background: '#ffffff' }}
                              />
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>%</span>
                            </div>
                            <input
                              type="date"
                              value={userForm.percepciones?.misiones?.vigencia || '2023-05-01'}
                              onChange={e => handlePercepcionChange('misiones', 'vigencia', e.target.value)}
                              style={{ width: '135px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', background: '#ffffff', marginLeft: 'auto' }}
                            />
                          </div>
                        </div>

                        {/* 5. Perc Tucuman */}
                        <div style={{
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: userForm.percepciones?.tucuman?.enabled ? 'rgba(15, 164, 222, 0.04)' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          gridColumn: '1 / -1'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Perc Tucuman</span>
                            {userForm.percepciones?.tucuman?.enabled && <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>Activa</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <input
                                type="checkbox"
                                checked={!!userForm.percepciones?.tucuman?.enabled}
                                onChange={e => handlePercepcionChange('tucuman', 'enabled', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              <span>Tucuman</span>
                            </label>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>Coef</span>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="0,0000"
                                value={userForm.percepciones?.tucuman?.coef !== undefined ? userForm.percepciones?.tucuman?.coef : 0}
                                onChange={e => handlePercepcionChange('tucuman', 'coef', parseFloat(e.target.value) || 0)}
                                style={{ width: '80px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right' }}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Alícuota:</span>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                placeholder="0,0000"
                                value={userForm.percepciones?.tucuman?.alicuota !== undefined ? userForm.percepciones?.tucuman?.alicuota : 0}
                                onChange={e => handlePercepcionChange('tucuman', 'alicuota', parseFloat(e.target.value) || 0)}
                                style={{ width: '80px', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '700', textAlign: 'right' }}
                              />
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>%</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '160px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Vigencia:</span>
                              <input
                                type="date"
                                value={userForm.percepciones?.tucuman?.vigencia || '2025-06-01'}
                                onChange={e => handlePercepcionChange('tucuman', 'vigencia', e.target.value)}
                                style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr style={{ border: 'none', borderTop: '1.5px solid #cbd5e1', margin: '4px 0' }} />

                      {/* Checkbox Codigo de Aceptacion */}
                      <div style={{ padding: '4px 2px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!userForm.iibb_codigo_aceptacion}
                            onChange={e => setUserForm({ ...userForm, iibb_codigo_aceptacion: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: '#0fa4de', cursor: 'pointer' }}
                          />
                          <span>Codigo de Aceptacion</span>
                        </label>
                      </div>

                      {/* Previsualizador de Impacto Impositivo */}
                      {(() => {
                        const exampleNet = 1000;
                        const activeList = [];
                        const percs = userForm.percepciones || {};
                        for (const [key, p] of Object.entries(percs)) {
                          if (p?.enabled && parseFloat(p.alicuota) > 0) {
                            const ali = parseFloat(p.alicuota);
                            const coef = (key === 'tucuman' && parseFloat(p.coef) > 0) ? parseFloat(p.coef) : 1;
                            const amount = (exampleNet * coef * ali) / 100;
                            activeList.push({ name: key.toUpperCase(), ali, amount, coef });
                          }
                        }
                        const totalPerc = activeList.reduce((acc, x) => acc + x.amount, 0);

                        return (
                          <div style={{ background: '#f8fafc', border: '1px dashed #0284c7', borderRadius: '12px', padding: '14px 18px', fontSize: '12px', color: '#334155' }}>
                            <div style={{ fontWeight: '800', color: '#0284c7', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>💡</span> Simulación sobre compra neta de $1,000.00 USD:
                            </div>
                            {activeList.length === 0 ? (
                              <div style={{ color: '#64748b', fontStyle: 'italic' }}>No hay percepciones activas con alícuota mayor a 0%. Este cliente no pagará percepciones adicionales.</div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                  {activeList.map(x => (
                                    <span key={x.name} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                                      {x.name} ({x.ali}%): +${x.amount.toFixed(2)} USD
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontWeight: '800', color: '#0f172a' }}>
                                  Total final a liquidar en Checkout: ${(exampleNet + totalPerc).toFixed(2)} USD (Neto: $1,000.00 + Percepciones: ${totalPerc.toFixed(2)})
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="submit" className="btn-submit">{editingUser ? 'Actualizar Usuario' : (userCreateMode === 'existing_company' ? 'Crear y Habilitar Usuario para esta Empresa' : 'Guardar y Habilitar Empresa B2B')}</button>
                    <button type="button" className="btn-delete" onClick={resetUserForm}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* TABLA DE USUARIOS / CLIENTES - STRICT 2 LINES */}
            <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', background: '#ffffff' }}>
              <table className="users-table crm-compact-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', whiteSpace: 'nowrap', width: '80px' }}>ID</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '180px' }}>Empresa / Razón Social</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '180px' }}>Usuario & Acceso Login</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '150px' }}>Cargo & Contacto</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', minWidth: '150px' }}>País & CUIT / NIT</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', width: '130px' }}>Estado</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: '750', color: '#475569', textAlign: 'center', width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {countryScopedUsers
                  .filter(u => {
                    if (userFilterStatus === 'pendiente') return u.status === 'pendiente';
                    if (userFilterStatus === 'activo') return (u.status || 'activo') === 'activo';
                    if (userFilterStatus === 'inactivo') return u.status === 'inactivo';
                    return true;
                  })
                  .filter(u => {
                    if (!userSearch) return true;
                    const term = userSearch.toLowerCase().trim();
                    const company = (u.razon_social || '').toLowerCase();
                    const name = (u.name || '').toLowerCase();
                    const email = (u.email || '').toLowerCase();
                    const cuit = (u.numero_nit || '').toLowerCase();
                    const phone = (u.phone || '').toLowerCase();
                    const country = (u.country_name || countries.find(c => c.id === u.country_id)?.name || '').toLowerCase();
                    const tipo = (u.tipo_cliente || '').toLowerCase();
                    const cargo = (u.cargo || '').toLowerCase();
                    return company.includes(term) || name.includes(term) || email.includes(term) || cuit.includes(term) || phone.includes(term) || country.includes(term) || tipo.includes(term) || cargo.includes(term);
                  })
                  .map(u => {
                    const isPending = u.status === 'pendiente';
                    const isInactive = u.status === 'inactivo';
                    const companyKey = (u.razon_social || u.name || '').trim().toLowerCase();
                    const sameCompanyCount = users.filter(x => (x.razon_social || x.name || '').trim().toLowerCase() === companyKey).length;
                    
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color-subtle, #f1f5f9)', background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent', transition: 'background 0.15s ease' }}>
                        {/* 1. ID (2 lines) */}
                        <td style={{ padding: '6px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ color: 'var(--primary, #0fa4de)', fontSize: '12.5px', fontWeight: '800', lineHeight: '1.25' }}>#{u.id}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.25' }}>B2B</div>
                        </td>

                        {/* 2. Empresa / Razón Social (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }}>
                            <strong style={{ color: 'var(--text-main, #0f172a)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.razon_social || u.name}>
                              {u.razon_social || u.name}
                            </strong>
                            {sameCompanyCount > 1 && (
                              <span 
                                title={`Esta empresa cuenta con ${sameCompanyCount} usuarios con acceso al Shop`}
                                style={{
                                  background: 'rgba(15, 164, 222, 0.1)',
                                  color: '#0284c7',
                                  border: '1px solid rgba(15, 164, 222, 0.25)',
                                  padding: '0 5px',
                                  borderRadius: '999px',
                                  fontSize: '9.5px',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  flexShrink: 0
                                }}
                              >
                                <BrandingVectorIcon name="users" size={9} color="#0284c7" />
                                {sameCompanyCount}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.tipo_cliente || 'Integrador IT / Mayorista'}>
                            <span style={{ marginRight: '4px' }}>🏢</span>
                            <span>{u.tipo_cliente || 'Integrador IT / Mayorista'}</span>
                          </div>
                        </td>

                        {/* 3. Usuario & Acceso Login (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '220px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-main, #0f172a)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.name}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#0fa4de', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.email}>
                            <span style={{ marginRight: '4px' }}>✉</span>
                            <span>{u.email}</span>
                          </div>
                        </td>

                        {/* 4. Cargo & Contacto (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '190px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.cargo || 'Encargado de Compras'}>
                            <span style={{
                              background: 'rgba(0,0,0,0.04)',
                              color: 'var(--text-main, #334155)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '10.5px',
                              fontWeight: '600',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              display: 'inline-block'
                            }}>
                              {u.cargo || 'Encargado de Compras'}
                            </span>
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25', marginTop: '2px' }} title={u.phone || 'Sin Teléfono'}>
                            {u.phone ? `📞 ${u.phone}` : '—'}
                          </div>
                        </td>

                        {/* 5. País & CUIT / NIT (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '180px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-main, #334155)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.country_name || countries.find(c => c.id === u.country_id)?.name || 'Argentina'}>
                            📍 {u.country_name || countries.find(c => c.id === u.country_id)?.name || 'Argentina'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.25' }} title={u.numero_nit || 'Sin CUIT'}>
                            {u.numero_nit ? `CUIT: ${u.numero_nit}` : 'Sin CUIT'}
                          </div>
                        </td>

                        {/* 6. Estado (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div>
                            {isPending ? (
                              <span style={{
                                background: '#fef3c7',
                                color: '#d97706',
                                border: '1px solid #fde68a',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '750',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }}></span>
                                Solicitud Shop
                              </span>
                            ) : isInactive ? (
                              <span style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '750',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }}></span>
                                Inactivo
                              </span>
                            ) : (
                              <span style={{
                                background: '#dcfce7',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '750',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span>
                                Activo
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '2px', lineHeight: '1' }}>
                            Portal Mayorista
                          </div>
                        </td>

                        {/* 7. Acciones (2 lines vertical align) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {/* Dropdown de Acciones */}
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (openActionDropdown === u.id) {
                                  setOpenActionDropdown(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                  setOpenActionDropdown(u.id);
                                }
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '3px 9px', borderRadius: '7px', cursor: 'pointer',
                                fontSize: '11px', fontWeight: '700',
                                background: isPending ? '#fef3c7' : '#F1F5F9',
                                color: isPending ? '#d97706' : '#334155',
                                border: isPending ? '1px solid #fde68a' : '1px solid #CBD5E1',
                                transition: 'background 0.15s'
                              }}
                            >
                              <BrandingVectorIcon name="settings" size={11} color={isPending ? '#d97706' : '#334155'} />
                              <span>Acciones</span>
                              <BrandingVectorIcon name="chevron-down" size={10} color={isPending ? '#d97706' : '#64748B'} />
                            </button>

                            {openActionDropdown === u.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'fixed',
                                  top: dropdownPos.top,
                                  left: dropdownPos.left,
                                  zIndex: 9999,
                                  background: '#ffffff',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '10px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
                                  minWidth: '160px',
                                  padding: '4px'
                                }}
                              >
                                {/* Aprobar / Agregar Usuario */}
                                {isPending ? (
                                  <button
                                    onClick={() => { handleApproveUser(u.id); setOpenActionDropdown(null); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                      padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                      border: 'none', background: 'transparent',
                                      fontSize: '11.5px', fontWeight: '600', color: '#16a34a',
                                      transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <BrandingVectorIcon name="check" size={12} color="#16a34a" />
                                    Aprobar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { handleOpenAddUserToCompany(u); setOpenActionDropdown(null); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                      padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                      border: 'none', background: 'transparent',
                                      fontSize: '11.5px', fontWeight: '600', color: '#334155',
                                      transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <BrandingVectorIcon name="plus" size={12} color="#334155" />
                                    Agregar Usuario
                                  </button>
                                )}

                                <button
                                  onClick={() => { openUserModal(u.id); setOpenActionDropdown(null); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                    border: 'none', background: 'transparent',
                                    fontSize: '11.5px', fontWeight: '600', color: '#334155',
                                    transition: 'background 0.12s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <BrandingVectorIcon name="eye" size={12} color="#334155" />
                                  Ver Perfil
                                </button>

                                <button
                                  onClick={() => { handleEditUser(u); setOpenActionDropdown(null); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                    border: 'none', background: 'transparent',
                                    fontSize: '11.5px', fontWeight: '600', color: '#334155',
                                    transition: 'background 0.12s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <BrandingVectorIcon name="edit" size={12} color="#334155" />
                                  Editar
                                </button>

                                <div style={{ height: '1px', background: '#F1F5F9', margin: '3px 0' }} />

                                {isPending ? (
                                  <button
                                    onClick={() => { handleToggleUserStatus(u.id, 'inactivo'); setOpenActionDropdown(null); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                      padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                      border: 'none', background: 'transparent',
                                      fontSize: '11.5px', fontWeight: '600', color: '#dc2626',
                                      transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <BrandingVectorIcon name="x" size={12} color="#dc2626" />
                                    Rechazar
                                  </button>
                                ) : isInactive ? (
                                  <button
                                    onClick={() => { handleToggleUserStatus(u.id, 'activo'); setOpenActionDropdown(null); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                      padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                      border: 'none', background: 'transparent',
                                      fontSize: '11.5px', fontWeight: '600', color: '#16a34a',
                                      transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <BrandingVectorIcon name="check" size={12} color="#16a34a" />
                                    Activar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { handleToggleUserStatus(u.id, 'inactivo'); setOpenActionDropdown(null); }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                      padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                      border: 'none', background: 'transparent',
                                      fontSize: '11.5px', fontWeight: '600', color: '#dc2626',
                                      transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <BrandingVectorIcon name="user-x" size={12} color="#dc2626" />
                                    Desactivar
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
          </section>
        )}

        {/* ═══════════════ ÓRDENES / PEDIDOS B2B ═══════════════ */}
        {activeTab === 'orders' && (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandingVectorIcon name="ticket" size={20} color="#0FA4DE" />
                  <span>Gestión de Órdenes y Cotizaciones B2B</span>
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                  Supervisa los pedidos generados en el Shop, gestiona el estado logístico y revisa los tickets sincronizados con Operaciones CRM.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={exportOrdersCSV}
                  className="nav-btn"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px'
                  }}
                >
                  <BrandingVectorIcon name="download" size={14} color="#0FA4DE" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Country Scope Notice for Orders */}
            {selectedCountryScope !== 'all' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
                border: '1px solid rgba(15, 164, 222, 0.25)',
                padding: '10px 16px',
                borderRadius: '10px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{activeCountryObj.flag || '🇦🇷'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    Órdenes radicadas en {activeCountryObj.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    — Mostrando métricas y facturación exclusiva para {activeCountryObj.name} ({countryScopedOrders.length} pedidos)
                  </span>
                </div>
                <button 
                  onClick={() => handleCountryScopeChange('all')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Ver Todas las Órdenes 🌐
                </button>
              </div>
            )}

            {/* Quick KPI Chips for Orders - Compact High-Density */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Órdenes</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#071524', marginTop: '1px' }}>{countryScopedOrders.length}</div>
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Facturado</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A', marginTop: '1px' }}>
                  ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
                </div>
              </div>
              <div style={{ background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#854D0E', fontWeight: '700', textTransform: 'uppercase' }}>En Preparación</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#CA8A04', marginTop: '1px' }}>
                  {countryScopedOrders.filter(o => o.status === 'procesando' || o.status === 'pending').length}
                </div>
              </div>
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#075985', fontWeight: '700', textTransform: 'uppercase' }}>En Despacho / Camino</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7', marginTop: '1px' }}>
                  {countryScopedOrders.filter(o => o.status === 'en_camino' || o.status === 'shipped').length}
                </div>
              </div>
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#6B21A8', fontWeight: '700', textTransform: 'uppercase' }}>Entregadas</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#9333EA', marginTop: '1px' }}>
                  {countryScopedOrders.filter(o => o.status === 'entregado' || o.status === 'completed').length}
                </div>
              </div>
            </div>

            {/* Toolbar: Filters & Search */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente, empresa, CUIT, tracking, OC..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '7px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#ffffff' }}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="procesando">En Preparación (Procesando)</option>
                  <option value="en_camino">En Despacho / Camino</option>
                  <option value="entregado">Entregado</option>
                  <option value="paid">Pagado</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                <select
                  value={orderCountryFilter}
                  onChange={(e) => setOrderCountryFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#ffffff' }}
                >
                  <option value="all">Todos los Países</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {(orderSearch || orderStatusFilter !== 'all' || orderCountryFilter !== 'all') && (
                  <button
                    onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); setOrderCountryFilter('all'); }}
                    style={{ background: '#E2E8F0', border: 'none', padding: '7px 10px', borderRadius: '7px', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table - Compact High Density */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <BrandingVectorIcon name="box" size={32} color="#94A3B8" />
                </div>
                <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: '14px' }}>No se encontraron órdenes</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>
                  Intenta ajustar los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', width: '120px' }}>N° Orden / Fecha</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '180px' }}>Cliente & Empresa</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '180px' }}>Destino & Logística</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '160px' }}>Pago / PO</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', width: '130px' }}>Total USD</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', width: '140px' }}>Estado</th>
                      <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center', width: '80px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(ord => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                        {/* 1. N° Orden & Fecha (2 lines) */}
                        <td style={{ padding: '6px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: '800', color: '#0FA4DE', fontSize: '12.5px', lineHeight: '1.25' }}>#{ord.id}</div>
                          <div style={{ color: '#64748B', fontSize: '10.5px', lineHeight: '1.25' }}>
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </td>

                        {/* 2. Cliente & Empresa (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '240px' }}>
                          <div
                            style={{ fontWeight: '700', color: '#0F172A', fontSize: '12px', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={ord.user_company || ord.user_name || 'Cliente B2B'}
                          >
                            {ord.user_company || ord.user_name || 'Cliente B2B'}
                          </div>
                          <div
                            style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={`${ord.user_email || ''} ${ord.user_cuit ? `• CUIT: ${ord.user_cuit}` : ''}`}
                          >
                            {ord.user_email} {ord.user_cuit ? `• CUIT: ${ord.user_cuit}` : ''}
                          </div>
                        </td>

                        {/* 3. Destino & Logística (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '240px' }}>
                          <div
                            style={{ fontWeight: '600', color: '#334155', fontSize: '11.5px', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={`${ord.country_name || 'Argentina'} • ${ord.shipping_method || 'Envío a Domicilio'}`}
                          >
                            <span>📍 {ord.country_name || 'Argentina'}</span>
                            <span style={{ color: '#94A3B8', margin: '0 4px' }}>•</span>
                            <span style={{ color: '#64748B', fontSize: '10.5px' }}>{ord.shipping_method || 'Envío a Domicilio'}</span>
                          </div>
                          <div
                            style={{ fontSize: '10px', color: '#0369A1', fontFamily: 'monospace', fontWeight: '700', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={ord.tracking_number ? `Guía / Tracking: ${ord.tracking_number}` : 'Sin N° de Guía'}
                          >
                            {ord.tracking_number ? `Guía: ${ord.tracking_number}` : 'Despacho interno'}
                          </div>
                        </td>

                        {/* 4. Condición / PO (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', maxWidth: '200px' }}>
                          <div
                            style={{ fontSize: '11.5px', color: '#334155', fontWeight: '600', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={ord.payment_method || 'Cuenta Corriente'}
                          >
                            {ord.payment_method || 'Cuenta Corriente'}
                          </div>
                          <div
                            style={{ fontSize: '10.5px', color: ord.po_number ? '#0FA4DE' : '#94A3B8', fontWeight: ord.po_number ? '700' : '400', lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={ord.po_number ? `Orden de Compra: ${ord.po_number}` : 'Venta Directa'}
                          >
                            {ord.po_number ? `OC: ${ord.po_number}` : 'Venta Directa'}
                          </div>
                        </td>

                        {/* 5. Total USD & Descuento (2 lines) */}
                        <td style={{ padding: '6px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: '800', color: '#071524', fontSize: '12.5px', lineHeight: '1.25' }}>
                            ${parseFloat(ord.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </div>
                          <div style={{ fontSize: '10px', color: parseFloat(ord.discount_applied || 0) > 0 ? '#16A34A' : '#94A3B8', fontWeight: '600', lineHeight: '1.25' }}>
                            {parseFloat(ord.discount_applied || 0) > 0 ? `Desc: -$${parseFloat(ord.discount_applied).toFixed(2)}` : 'Precio regular'}
                          </div>
                        </td>

                        {/* 6. Estado (2 lines) */}
                        <td style={{ padding: '6px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <select
                            value={ord.status || 'procesando'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'block',
                              width: '100%',
                              boxSizing: 'border-box',
                              ...statusStyle(ord.status)
                            }}
                          >
                            <option value="procesando">En Preparación</option>
                            <option value="en_camino">En Despacho</option>
                            <option value="entregado">Entregado</option>
                            <option value="paid">Pagado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                          <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px', lineHeight: '1' }}>
                            Operaciones CRM
                          </div>
                        </td>

                        {/* 7. Acciones (2 lines vertical align) */}
                        <td style={{ padding: '6px 12px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <button
                            onClick={() => { setSelectedOrder(ord); setShowOrderModal(true); }}
                            style={{
                              background: '#0FA4DE',
                              color: '#ffffff',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(15, 164, 222, 0.2)'
                            }}
                          >
                            <BrandingVectorIcon name="eye" size={11} color="#ffffff" />
                            <span>Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ REPORTERÍA ═══════════════ */}
        {activeTab === 'reportes' && (
          <>
            {/* ── KPI Cards ── */}
            <div className="kpi-grid">
              {[
                { value: `$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, label: 'Ingresos Totales', color: '#10b981' },
                { value: totalOrders, label: 'Órdenes Totales', color: '#06b6d4' },
                { value: paidOrders, label: 'Órdenes Pagadas', color: '#10b981' },
                { value: pendingOrders, label: 'Órdenes Pendientes', color: '#f59e0b' },
                { value: cancelledOrders, label: 'Canceladas', color: '#ef4444' },
                { value: `${conversionRate}%`, label: 'Tasa de Conversión', color: '#0f766e' },
                { value: `$${avgOrderValue}`, label: 'Ticket Promedio', color: '#0284c7' },
                { value: products.length, label: 'Productos Activos', color: '#6366f1' },
                { value: lowStockProducts, label: 'Productos Stock Bajo', color: lowStockProducts > 0 ? '#ef4444' : '#10b981' },
              ].map((kpi, i) => (
                <div key={i} className="kpi-card" style={{ borderLeftColor: kpi.color }}>
                  <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="kpi-label">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* ── Charts ── */}
            <div className="charts-grid">

              {/* Revenue by day */}
              <div className="report-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📈 Ingresos Últimos 7 Días</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`$${v}`, 'Ingresos']} />
                    <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fill="url(#colorIngresos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Country */}
              <div className="report-card">
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🌍 Ingresos por País</h3>
                {salesByCountry.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Sin datos suficientes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={salesByCountry} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {salesByCountry.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Ventas']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Orders by status pie */}
              <div className="report-card">
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🥧 Distribución de Órdenes</h3>
                {ordersByStatus.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Sin datos suficientes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Orders per day (bar) */}
              <div className="report-card">
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📦 Órdenes por Día</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, 'Órdenes']} />
                    <Bar dataKey="ordenes" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Products price/stock */}
              <div className="report-card">
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🛍️ Stock vs Precio por Producto</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" name="Stock" fill="#4cc9f0" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="precio" name="Precio ($)" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Tabla alertas stock bajo ── */}
            {lowStockProducts > 0 && (
              <div className="report-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>⚠️ Alertas de Stock Bajo (≤15 unidades)</h3>
                <table className="users-table">
                  <thead>
                    <tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock Global</th></tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.stock <= 15).map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.name}</strong></td>
                        <td>${p.price}</td>
                        <td><span style={{ fontWeight: 700, color: '#dc2626' }}>{p.stock} unidades</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══════════════ GESTIÓN PAGOS Y ENVÍOS ═══════════════ */}
        {activeTab === 'pagos_envios' && (
          <section className="board-section" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            
            {/* ── Header & Action Toolbar ── */}
            <div style={{
              background: 'var(--card-bg, #FFFFFF)',
              borderRadius: '20px',
              padding: '24px 28px',
              border: '1px solid var(--border-color, #E2E8F0)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(15, 164, 222, 0.1)', padding: '6px 10px', borderRadius: '12px' }}>
                    <BrandingVectorIcon name="truck" size={20} color="#0fa4de" />
                    <BrandingVectorIcon name="credit-card" size={20} color="#0284c7" />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                    Gestión de Métodos de Envío & Formas de Pago
                  </h2>
                  <span style={{
                    background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.15), rgba(2, 132, 199, 0.2))',
                    color: '#0284c7',
                    fontWeight: '800',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {activeCountryObj.flag} {activeCountryObj.name}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #64748B)', maxWidth: '700px' }}>
                  Configuración para <strong>{activeCountryObj.name} ({activeCountryObj.code})</strong>. Habilitá, deshabilitá o personalizá los métodos de despacho locales (HUBs, Expresos) y opciones de pago corporativo (CBU/Alias, E-Cheqs diferidos, CC o Stripe) para las operaciones de este país.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleResetCheckoutMethods}
                  disabled={isSavingCheckout}
                  className="dacas-pill-btn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color, #CBD5E1)',
                    color: 'var(--text-muted, #64748B)',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <BrandingVectorIcon name="rotate-ccw" size={15} color="#64748B" />
                  <span>Restablecer Oficiales</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCheckoutMethods}
                  disabled={isSavingCheckout}
                  className="dacas-pill-btn active"
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <BrandingVectorIcon name="save" size={16} color="#FFFFFF" />
                  <span>{isSavingCheckout ? 'Guardando...' : 'Guardar Configuración'}</span>
                </button>
              </div>
            </div>

            {/* Success feedback alert */}
            {checkoutSaveSuccess && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                borderRadius: '14px',
                padding: '14px 20px',
                marginBottom: '20px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <BrandingVectorIcon name="check" size={18} color="#059669" />
                <span>¡Configuración de pagos y envíos guardada exitosamente! Los cambios ya están activos en el Checkout.</span>
              </div>
            )}

            {/* ── Subtabs Navigation ── */}
            <div style={{
              display: 'flex',
              gap: '12px',
              background: 'var(--card-bg, #FFFFFF)',
              padding: '8px',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #E2E8F0)',
              marginBottom: '24px',
              overflowX: 'auto'
            }}>
              <button
                type="button"
                onClick={() => setCheckoutSubTab('shipping')}
                className={`dacas-pill-btn ${checkoutSubTab === 'shipping' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: checkoutSubTab === 'shipping' ? 'none' : '1px solid var(--border-color, #E2E8F0)',
                  background: checkoutSubTab === 'shipping' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#FFFFFF',
                  color: checkoutSubTab === 'shipping' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  boxShadow: checkoutSubTab === 'shipping' ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none'
                }}
              >
                <BrandingVectorIcon name="truck" size={18} color={checkoutSubTab === 'shipping' ? '#FFFFFF' : '#64748B'} />
                <span>Métodos de Envío y Logística</span>
                <span style={{
                  background: checkoutSubTab === 'shipping' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: checkoutSubTab === 'shipping' ? '#FFFFFF' : 'var(--text-main, #0F172A)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {(checkoutMethods?.shipping || []).filter(s => s.enabled).length} Activos
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutSubTab('payment')}
                className={`dacas-pill-btn ${checkoutSubTab === 'payment' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: checkoutSubTab === 'payment' ? 'none' : '1px solid var(--border-color, #E2E8F0)',
                  background: checkoutSubTab === 'payment' ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#FFFFFF',
                  color: checkoutSubTab === 'payment' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  boxShadow: checkoutSubTab === 'payment' ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none'
                }}
              >
                <BrandingVectorIcon name="credit-card" size={18} color={checkoutSubTab === 'payment' ? '#FFFFFF' : '#64748B'} />
                <span>Formas de Pago & Financiación</span>
                <span style={{
                  background: checkoutSubTab === 'payment' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: checkoutSubTab === 'payment' ? '#FFFFFF' : 'var(--text-main, #0F172A)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {(checkoutMethods?.payment || []).filter(p => p.enabled).length} Activos
                </span>
              </button>
            </div>

            {/* ══════════════ SUBTAB 1: MÉTODOS DE ENVÍO ══════════════ */}
            {checkoutSubTab === 'shipping' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {(checkoutMethods?.shipping || []).map((method, idx) => (
                    <div
                      key={method.id || idx}
                      style={{
                        background: 'var(--card-bg, #FFFFFF)',
                        borderRadius: '18px',
                        padding: '22px',
                        border: `2px solid ${method.enabled ? '#0fa4de' : 'var(--border-color, #E2E8F0)'}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                        opacity: method.enabled ? 1 : 0.7,
                        transition: 'all 0.25s ease',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Header Card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: method.enabled ? 'rgba(15, 164, 222, 0.12)' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <BrandingVectorIcon name={method.icon || 'truck'} size={24} color={method.enabled ? '#0fa4de' : '#64748B'} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main, #0F172A)' }}>
                              {method.title || 'Método de Envío'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                              ID: <code style={{ color: '#0fa4de', fontWeight: '700' }}>{method.id}</code>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...checkoutMethods };
                            updated.shipping[idx].enabled = !updated.shipping[idx].enabled;
                            setCheckoutMethods({ ...updated });
                          }}
                          style={{
                            background: method.enabled ? '#10B981' : '#94A3B8',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontWeight: '800',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: method.enabled ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          <BrandingVectorIcon name={method.enabled ? 'check' : 'x'} size={13} color="#FFFFFF" strokeWidth={3} />
                          <span>{method.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                        </button>
                      </div>

                      {/* Live Preview Box */}
                      <div style={{
                        background: method.enabled ? '#F0F9FF' : '#F8FAFC',
                        border: `1.5px solid ${method.enabled ? '#BAE6FD' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '16px',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                          <BrandingVectorIcon name="eye" size={13} color="#0284C7" />
                          <span>Vista Previa en Checkout (Paso 3)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <BrandingVectorIcon name={method.icon || 'truck'} size={22} color="#0fa4de" />
                          {method.badge && (
                            <span style={{ background: '#0fa4de', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524' }}>{method.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{method.subtitle}</div>
                      </div>

                      {/* Editable Form Inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Título del Botón
                          </label>
                          <input
                            type="text"
                            value={method.title || ''}
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.shipping[idx].title = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Subtítulo / Bajada
                          </label>
                          <input
                            type="text"
                            value={method.subtitle || ''}
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.shipping[idx].subtitle = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', boxSizing: 'border-box' }}>
                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                              Etiqueta / Badge
                            </label>
                            <input
                              type="text"
                              value={method.badge || ''}
                              placeholder="Ej. Recomendado"
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.shipping[idx].badge = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{
                                boxSizing: 'border-box',
                                width: '100%',
                                height: '38px',
                                padding: '0 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                fontSize: '13px',
                                background: 'var(--bg-main, #FFFFFF)',
                                color: 'var(--text-main, #0F172A)',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                              Ícono (ID / Emoji)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}>
                              <input
                                type="text"
                                value={method.icon || ''}
                                placeholder="truck / hub / box"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.shipping[idx].icon = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{
                                  boxSizing: 'border-box',
                                  width: '100%',
                                  height: '38px',
                                  padding: '0 12px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-color, #CBD5E1)',
                                  fontSize: '13px',
                                  background: 'var(--bg-main, #FFFFFF)',
                                  color: 'var(--text-main, #0F172A)',
                                  outline: 'none'
                                }}
                              />
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                background: '#F8FAFC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxSizing: 'border-box'
                              }}>
                                <BrandingVectorIcon name={method.icon || 'truck'} size={18} color="#0fa4de" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `custom_shipping_${Date.now()}`;
                      const updated = { ...checkoutMethods };
                      updated.shipping.push({
                        id: newId,
                        enabled: true,
                        title: 'Nuevo Método de Entrega',
                        subtitle: 'Descripción breve de la entrega',
                        badge: 'Nuevo',
                        icon: 'box',
                        priceText: 'A convenir',
                        description: 'Detalles del nuevo método de despacho.'
                      });
                      setCheckoutMethods({ ...updated });
                    }}
                    style={{
                      background: 'var(--card-bg, #FFFFFF)',
                      border: '2px dashed #0fa4de',
                      color: '#0fa4de',
                      borderRadius: '16px',
                      padding: '14px 28px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <BrandingVectorIcon name="plus" size={16} color="#0fa4de" strokeWidth={2.5} />
                    <span>Añadir Nuevo Método de Envío</span>
                  </button>
                </div>
              </div>
            )}
            {/* ══════════════ SUBTAB 2: FORMAS DE PAGO ══════════════ */}
            {checkoutSubTab === 'payment' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {(checkoutMethods?.payment || []).map((method, idx) => (
                    <div
                      key={method.id || idx}
                      style={{
                        background: 'var(--card-bg, #FFFFFF)',
                        borderRadius: '18px',
                        padding: '22px',
                        border: `2px solid ${method.enabled ? '#0fa4de' : 'var(--border-color, #E2E8F0)'}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                        opacity: method.enabled ? 1 : 0.7,
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Header Card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: method.enabled ? 'rgba(15, 164, 222, 0.12)' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <BrandingVectorIcon name={method.icon || 'credit-card'} size={24} color={method.enabled ? '#0fa4de' : '#64748B'} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main, #0F172A)' }}>
                              {method.title || 'Forma de Pago'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)' }}>
                              ID: <code style={{ color: '#0fa4de', fontWeight: '700' }}>{method.id}</code>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {idx >= 4 && (
                            <button
                              type="button"
                              title="Eliminar método personalizado"
                              onClick={() => {
                                if (window.confirm('¿Deseas eliminar este método de pago?')) {
                                  const updated = { ...checkoutMethods };
                                  updated.payment.splice(idx, 1);
                                  setCheckoutMethods({ ...updated });
                                }
                              }}
                              style={{
                                background: '#FEE2E2',
                                color: '#EF4444',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <BrandingVectorIcon name="trash" size={14} color="#EF4444" />
                            </button>
                          )}

                          {/* Toggle Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...checkoutMethods };
                              updated.payment[idx].enabled = !updated.payment[idx].enabled;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              background: method.enabled ? '#10B981' : '#94A3B8',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '6px 14px',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              boxShadow: method.enabled ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                          >
                            <BrandingVectorIcon name={method.enabled ? 'check' : 'x'} size={13} color="#FFFFFF" strokeWidth={3} />
                            <span>{method.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Preview Box */}
                      <div style={{
                        background: method.enabled ? '#F0F9FF' : '#F8FAFC',
                        border: `1.5px solid ${method.enabled ? '#BAE6FD' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '16px',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                          <BrandingVectorIcon name="eye" size={13} color="#0284C7" />
                          <span>Vista Previa en Checkout (Paso 4)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BrandingVectorIcon name={method.icon || 'credit-card'} size={22} color="#0fa4de" />
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '13px', color: '#071524' }}>{method.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{method.subtitle}</div>
                            </div>
                          </div>
                          {method.badge && (
                            <span style={{ background: '#10B981', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>
                              {method.badge}
                            </span>
                          )}
                        </div>

                        {/* Preview of Bank Details if Transferencia */}
                        {method.id === 'transferencia' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #BAE6FD', fontSize: '11px', color: '#0369A1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="bank" size={13} color="#0284c7" />
                              <span><strong>Banco:</strong> {method.banco || 'Banco Santander'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="ticket" size={13} color="#0284c7" />
                              <span><strong>CBU:</strong> <code style={{ background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px' }}>{method.cbu || '07201239...'}</code></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BrandingVectorIcon name="tag" size={13} color="#0284c7" />
                              <span><strong>Alias:</strong> <strong>{method.alias || 'DACAS.PAGOS.B2B'}</strong> | <strong>SWIFT:</strong> {method.swift || 'BAPROARBAXXX'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* General Form Inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, boxSizing: 'border-box' }}>
                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Título de la Opción
                          </label>
                          <input
                            type="text"
                            value={method.title || ''}
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.payment[idx].title = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ boxSizing: 'border-box' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Descripción / Subtítulo Principal
                          </label>
                          <textarea
                            rows={2}
                            value={method.subtitle || ''}
                            onChange={(e) => {
                              const updated = { ...checkoutMethods };
                              updated.payment[idx].subtitle = e.target.value;
                              setCheckoutMethods({ ...updated });
                            }}
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, #CBD5E1)',
                              fontSize: '13px',
                              background: 'var(--bg-main, #FFFFFF)',
                              color: 'var(--text-main, #0F172A)',
                              resize: 'vertical',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', boxSizing: 'border-box' }}>
                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                              Etiqueta / Badge
                            </label>
                            <input
                              type="text"
                              value={method.badge || ''}
                              placeholder="Ej. Sin Recargo"
                              onChange={(e) => {
                                const updated = { ...checkoutMethods };
                                updated.payment[idx].badge = e.target.value;
                                setCheckoutMethods({ ...updated });
                              }}
                              style={{
                                boxSizing: 'border-box',
                                width: '100%',
                                height: '38px',
                                padding: '0 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                fontSize: '13px',
                                background: 'var(--bg-main, #FFFFFF)',
                                color: 'var(--text-main, #0F172A)',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <div style={{ boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted, #64748B)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                              Ícono (ID / Emoji)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}>
                              <input
                                type="text"
                                value={method.icon || ''}
                                placeholder="bank / credit-card"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].icon = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{
                                  boxSizing: 'border-box',
                                  width: '100%',
                                  height: '38px',
                                  padding: '0 12px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-color, #CBD5E1)',
                                  fontSize: '13px',
                                  background: 'var(--bg-main, #FFFFFF)',
                                  color: 'var(--text-main, #0F172A)',
                                  outline: 'none'
                                }}
                              />
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #CBD5E1)',
                                background: '#F8FAFC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxSizing: 'border-box'
                              }}>
                                <BrandingVectorIcon name={method.icon || 'credit-card'} size={18} color="#0fa4de" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Specific Banking Fields for Transferencia CBU / SWIFT ── */}
                        {method.id === 'transferencia' && (
                          <div style={{
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px',
                            marginTop: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BrandingVectorIcon name="bank" size={16} color="#0369A1" />
                              <span>Datos Bancarios Oficiales (CBU / SWIFT / Alias)</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  Banco / Entidad
                                </label>
                                <input
                                  type="text"
                                  value={method.banco || ''}
                                  placeholder="Banco Santander / BBVA"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].banco = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />
                              </div>

                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  Titular / Razón Social
                                </label>
                                <input
                                  type="text"
                                  value={method.titular || ''}
                                  placeholder="DACAS S.A."
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].titular = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  CBU / CVU (22 dígitos)
                                </label>
                                <input
                                  type="text"
                                  value={method.cbu || ''}
                                  placeholder="0720123920000001234567"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].cbu = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontFamily: 'monospace' }}
                                />
                              </div>

                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  Alias CBU
                                </label>
                                <input
                                  type="text"
                                  value={method.alias || ''}
                                  placeholder="DACAS.PAGOS.B2B"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].alias = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontWeight: '700', color: '#0369A1' }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  Código SWIFT / BIC
                                </label>
                                <input
                                  type="text"
                                  value={method.swift || ''}
                                  placeholder="BAPROARBAXXX"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].swift = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', fontFamily: 'monospace' }}
                                />
                              </div>

                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  CUIT / Tax ID
                                </label>
                                <input
                                  type="text"
                                  value={method.cuit || ''}
                                  placeholder="30-68942158-9"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].cuit = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />
                              </div>
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Instrucciones para el Comprobante de Pago
                              </label>
                              <textarea
                                rows={2}
                                value={method.instrucciones || ''}
                                placeholder="Enviar comprobante a cobranzas@dacas.com indicando N° de Orden."
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].instrucciones = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', resize: 'vertical' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* ── Specific Fields for E-Cheq ── */}
                        {method.id === 'echeq' && (
                          <div style={{
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px',
                            marginTop: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BrandingVectorIcon name="file-text" size={16} color="#0369A1" />
                              <span>Configuración de E-Cheq Digital</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', boxSizing: 'border-box' }}>
                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  CUIT Receptor
                                </label>
                                <input
                                  type="text"
                                  value={method.cuit_receptor || ''}
                                  placeholder="30-68942158-9"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].cuit_receptor = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />
                              </div>

                              <div style={{ boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                  Banco Receptor COELSA
                                </label>
                                <input
                                  type="text"
                                  value={method.banco_receptor || ''}
                                  placeholder="Banco Santander"
                                  onChange={(e) => {
                                    const updated = { ...checkoutMethods };
                                    updated.payment[idx].banco_receptor = e.target.value;
                                    setCheckoutMethods({ ...updated });
                                  }}
                                  style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />
                              </div>
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Plazos Admitidos / Condiciones
                              </label>
                              <input
                                type="text"
                                value={method.plazos_admitidos || ''}
                                placeholder="30 y 60 días fecha factura"
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].plazos_admitidos = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* ── Specific Fields for Cuenta Corriente ── */}
                        {method.id === 'cuenta_corriente' && (
                          <div style={{
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px',
                            marginTop: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BrandingVectorIcon name="building" size={16} color="#0369A1" />
                              <span>Configuración de Cuenta Corriente B2B</span>
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Etiqueta del Selector de Plazos
                              </label>
                              <input
                                type="text"
                                value={method.terms_label || 'Plazo de Facturación:'}
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].terms_label = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                              />
                            </div>

                            <div style={{ boxSizing: 'border-box' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '3px', textTransform: 'uppercase' }}>
                                Nota de Evaluación Crediticia
                              </label>
                              <textarea
                                rows={2}
                                value={method.instrucciones || ''}
                                placeholder="Sujeto a verificación de línea crediticia aprobada en DACAS."
                                onChange={(e) => {
                                  const updated = { ...checkoutMethods };
                                  updated.payment[idx].instrucciones = e.target.value;
                                  setCheckoutMethods({ ...updated });
                                }}
                                style={{ boxSizing: 'border-box', width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF', resize: 'vertical' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Add New Payment Method & Terms & Conditions Card ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `custom_payment_${Date.now()}`;
                        const updated = { ...checkoutMethods };
                        updated.payment.push({
                          id: newId,
                          enabled: true,
                          title: 'Nueva Opción de Pago',
                          subtitle: 'Instrucciones para el pago corporativo',
                          badge: 'Opcional',
                          icon: 'credit-card',
                          instrucciones: 'Instrucciones adicionales para este medio de pago.'
                        });
                        setCheckoutMethods({ ...updated });
                      }}
                      style={{
                        background: 'var(--card-bg, #FFFFFF)',
                        border: '2px dashed #0fa4de',
                        color: '#0fa4de',
                        borderRadius: '16px',
                        padding: '14px 28px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <BrandingVectorIcon name="plus" size={16} color="#0fa4de" strokeWidth={2.5} />
                      <span>Añadir Nueva Forma de Pago</span>
                    </button>
                  </div>

                  {/* Legal Terms & Conditions in Checkout Paso 4 */}
                  <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '18px',
                    padding: '24px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BrandingVectorIcon name="file-text" size={20} color="#0fa4de" />
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main, #0F172A)' }}>
                        Texto de Términos y Condiciones Comerciales (Checkbox Paso 4)
                      </h3>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                      Este es el texto que el cliente debe aceptar al final del Paso 4 para confirmar y procesar su orden mayorista.
                    </p>
                    <textarea
                      rows={3}
                      value={checkoutMethods.terms_conditions_text || ''}
                      placeholder="Acepto las condiciones comerciales de DACAS B2B, términos de garantía oficial..."
                      onChange={(e) => {
                        setCheckoutMethods({
                          ...checkoutMethods,
                          terms_conditions_text: e.target.value
                        });
                      }}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #CBD5E1)',
                        fontSize: '13px',
                        background: 'var(--bg-main, #FFFFFF)',
                        color: 'var(--text-main, #0F172A)',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        {/* ═══════════════ VISUAL & SHOP CUSTOMIZATION ═══════════════ */}
        {activeTab === 'visual' && (
          <section className="board-section" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            
            {/* ── Header & Action Toolbar ── */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <BrandingVectorIcon name="palette" size={26} color="#0fa4de" />
                  <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Personalización Visual del Shop
                  </h2>
                  <span style={{
                    background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.15), rgba(2, 132, 199, 0.2))',
                    color: '#0284c7',
                    fontWeight: '800',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    CMS B2B Live
                  </span>
                </div>
                <p style={{ margin: 0, color: '#64748B', fontSize: '13.5px', maxWidth: '650px' }}>
                  Edita y personaliza en tiempo real los banners principales del carousel, textos de cabecera, anuncios de cobertura, categorías activas y marcas asignadas.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="dacas-pill-btn"
                  onClick={() => window.open('/shop', '_blank')}
                  title="Abrir el Shop en una nueva pestaña"
                >
                  <BrandingVectorIcon name="eye" size={16} />
                  <span>Previsualizar en Shop</span>
                </button>

                <button
                  type="button"
                  className="dacas-pill-btn"
                  onClick={handleResetVisualSettings}
                  disabled={isSavingVisual}
                  style={{ color: '#DC2626' }}
                  title="Restaura la configuración oficial de DACAS"
                >
                  <BrandingVectorIcon name="rotate-ccw" size={16} color="#DC2626" />
                  <span>Restaurar Oficial</span>
                </button>

                <button
                  type="button"
                  className="dacas-pill-btn active"
                  onClick={handleSaveVisualSettings}
                  disabled={isSavingVisual}
                  style={{
                    cursor: isSavingVisual ? 'not-allowed' : 'pointer',
                    opacity: isSavingVisual ? 0.7 : 1
                  }}
                >
                  {isSavingVisual ? (
                    <>
                      <BrandingVectorIcon name="rotate-ccw" size={16} color="#FFFFFF" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <BrandingVectorIcon name="save" size={16} color="#FFFFFF" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Country Context Indicator */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.12) 100%)',
              border: '1.5px solid rgba(15, 164, 222, 0.3)',
              borderRadius: '16px',
              padding: '14px 20px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '30px' }}>{activeCountryObj.flag || '🌎'}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                    Editando Banners, Carruseles y Home para: <span style={{ color: '#0284c7' }}>{activeCountryObj.name} ({activeCountryObj.code})</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Multi-tenancy activo: los banners, carruseles y anuncios son 100% independientes para este país.
                  </div>
                </div>
              </div>
              {selectedCountryScope === 'all' && (
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', background: '#fef3c7', padding: '6px 12px', borderRadius: '8px' }}>
                  ⚠️ Selecciona un país específico arriba en la barra de países para editar su diseño exclusivo
                </div>
              )}
            </div>

            {/* Success Toast */}
            {visualSaveSuccess && (
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '14px 20px',
                borderRadius: '14px',
                marginBottom: '20px',
                fontSize: '13.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.1)'
              }}>
                <BrandingVectorIcon name="check-circle" size={18} color="#166534" />
                <span>¡Diseño y configuración visual del Shop actualizados correctamente en tiempo real!</span>
              </div>
            )}

            {visualConfig ? (
              <div>
                {/* ── Sub-Tab Navigation Bar ── */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  background: '#F1F5F9',
                  padding: '8px',
                  borderRadius: '20px',
                  marginBottom: '24px',
                  overflowX: 'auto'
                }}>
                  {[
                    { id: 'hero', icon: 'rocket', title: 'Carousel de Banners (Hero)', desc: `${(visualConfig.heroSlides || []).length} Slides Activos` },
                    { id: 'brand_banners', icon: 'star', title: 'Banners Marcas & Carruseles', desc: 'Banners 2/3 marcas y productos home' },
                    { id: 'announcement', icon: 'megaphone', title: 'Anuncio & Barra Superior', desc: 'Mensaje de cobertura' },
                    { id: 'categories', icon: 'tag', title: '4 Categorías del Shop', desc: 'Títulos, íconos y orden' },
                    { id: 'brands', icon: 'building', title: 'Marcas por Categoría', desc: 'Fabricantes autorizados' },
                    { id: 'contact', icon: 'headphones', title: 'Contacto B2B & WhatsApp', desc: 'Canales de atención' }
                  ].map(tab => {
                    const isTabActive = visualSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setVisualSubTab(tab.id)}
                        style={{
                          flex: 1,
                          minWidth: '190px',
                          background: isTabActive ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#FFFFFF',
                          border: isTabActive ? 'none' : '1px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: isTabActive ? '0 4px 14px rgba(15, 164, 222, 0.35)' : '0 1px 3px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isTabActive ? 'translateY(-1px)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <BrandingVectorIcon
                            name={tab.icon}
                            size={18}
                            color={isTabActive ? '#FFFFFF' : '#0284c7'}
                          />
                          <div style={{ fontWeight: '800', fontSize: '13px', color: isTabActive ? '#FFFFFF' : '#0F172A' }}>
                            {tab.title}
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: isTabActive ? 'rgba(255, 255, 255, 0.85)' : '#64748B', fontWeight: '500', paddingLeft: '26px' }}>
                          {tab.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── SUBTAB 1: HERO CAROUSEL ── */}
                {visualSubTab === 'hero' && (
                  <div>
                    {/* Live Slide Preview Box */}
                    {visualConfig.heroSlides && visualConfig.heroSlides.length > 0 && (() => {
                      const slide = visualConfig.heroSlides[editingSlideIdx] || visualConfig.heroSlides[0];
                      return (
                        <div style={{
                          background: '#071524',
                          borderRadius: '20px',
                          padding: '30px',
                          color: '#FFFFFF',
                          marginBottom: '24px',
                          border: '1px solid rgba(15, 164, 222, 0.3)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '16px',
                            background: 'rgba(15, 164, 222, 0.2)',
                            color: '#38bdf8',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            letterSpacing: '0.05em'
                          }}>
                            VISTA PREVIA EN VIVO (SLIDE #{editingSlideIdx + 1})
                          </div>

                          <div style={{ maxWidth: '900px' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(15, 164, 222, 0.15)',
                              border: `1px solid ${slide.titleColor || '#0fa4de'}`,
                              color: slide.titleColor || '#38bdf8',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              padding: '4px 12px',
                              borderRadius: '999px',
                              marginBottom: '12px'
                            }}>
                              <span>{slide.badgeIcon || '🛡️'}</span> {slide.badge || 'BADGE DEL BANNER'}
                            </div>

                            <h3 style={{ margin: '0 0 10px', fontSize: '1.75rem', fontWeight: '900', lineHeight: 1.2 }}>
                              {slide.titleLine1 || 'Título Línea 1'} <br />
                              <span style={{ color: slide.titleColor || '#0fa4de' }}>
                                {slide.titleLine2 || 'Título Línea 2'}
                              </span>
                            </h3>

                            <p style={{ color: '#94A3B8', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 18px', maxWidth: '650px' }}>
                              {slide.desc || 'Descripción del slide para el cliente'}
                            </p>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {slide.primaryBtn?.text && (
                                <span style={{
                                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                                  color: '#fff',
                                  padding: '8px 18px',
                                  borderRadius: '999px',
                                  fontSize: '12.5px',
                                  fontWeight: '700'
                                }}>
                                  {slide.primaryBtn.text} →
                                </span>
                              )}
                              {slide.secondaryBtn?.text && (
                                <span style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(15, 164, 222, 0.3)',
                                  color: '#fff',
                                  padding: '8px 18px',
                                  borderRadius: '999px',
                                  fontSize: '12.5px',
                                  fontWeight: '600'
                                }}>
                                  {slide.secondaryBtn.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 📐 Ficha de Especificaciones Técnicas para el Diseñador Gráfico */}
                    <div style={{
                      background: 'linear-gradient(135deg, #071524 0%, #0f2742 100%)',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      color: '#FFFFFF',
                      marginBottom: '20px',
                      border: '1px solid rgba(15, 164, 222, 0.35)',
                      boxShadow: '0 8px 24px rgba(7, 21, 36, 0.15)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.3rem' }}>📐</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#FFFFFF' }}>
                              Especificaciones Técnicas para el Diseñador Gráfico (Banners del Carousel)
                            </h4>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              Parámetros oficiales para crear banners de máxima fidelidad y carga instantánea.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const specText = `ESPECIFICACIONES TÉCNICAS DE BANNERS - DACAS B2B SHOP\n` +
                              `===================================================\n` +
                              `• Dimensiones Recomendadas: 1920 x 500 px (Relación ~16:4.2 / 3.84:1)\n` +
                              `• Resolución Mínima: 1440 x 420 px\n` +
                              `• Formatos Soportados: WebP (Recomendado), PNG 24-bit, JPG/JPEG (Calidad 90%)\n` +
                              `• Peso Máximo por Archivo: <= 400 KB (Máximo 500 KB)\n` +
                              `• Zona Segura (Safe Zone): 1400 x 420 px central (evitar texto/logos en los primeros 120px laterales por las flechas del carrusel)\n` +
                              `• Espacio de Color: sRGB (72 a 150 DPI)\n` +
                              `• Estilo & Paleta DACAS: Fondo oscuro (#071524 a #0f2742), Cian (#0fa4de), Acentos de Marca Oficiales.`;
                            navigator.clipboard.writeText(specText);
                            alert('📋 ¡Especificaciones técnicas copiadas al portapapeles para enviar al diseñador!');
                          }}
                          style={{
                            background: '#0fa4de',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          📋 Copiar Ficha para el Diseñador
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', fontSize: '11.5px' }}>
                        <div style={{ background: 'rgba(15, 39, 66, 0.65)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(15, 164, 222, 0.2)' }}>
                          <span style={{ color: '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '2px' }}>📏 DIMENSIONES</span>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>1920 x 500 px</span>
                          <div style={{ color: '#94A3B8', fontSize: '10.5px' }}>Aspect ratio ~3.84:1</div>
                        </div>

                        <div style={{ background: 'rgba(15, 39, 66, 0.65)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(15, 164, 222, 0.2)' }}>
                          <span style={{ color: '#10b981', fontWeight: '800', display: 'block', marginBottom: '2px' }}>📁 FORMATOS</span>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>WebP, PNG, JPG</span>
                          <div style={{ color: '#94A3B8', fontSize: '10.5px' }}>WebP preferido</div>
                        </div>

                        <div style={{ background: 'rgba(15, 39, 66, 0.65)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(15, 164, 222, 0.2)' }}>
                          <span style={{ color: '#f59e0b', fontWeight: '800', display: 'block', marginBottom: '2px' }}>⚖️ PESO MÁXIMO</span>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>&lt; 400 KB - 500 KB</span>
                          <div style={{ color: '#94A3B8', fontSize: '10.5px' }}>Optimizado web</div>
                        </div>

                        <div style={{ background: 'rgba(15, 39, 66, 0.65)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(15, 164, 222, 0.2)' }}>
                          <span style={{ color: '#c084fc', fontWeight: '800', display: 'block', marginBottom: '2px' }}>🛡️ SAFE ZONE</span>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>1400 x 420 px</span>
                          <div style={{ color: '#94A3B8', fontSize: '10.5px' }}>Margen lateral 120px</div>
                        </div>
                      </div>
                    </div>

                    {/* Slides Grid Selector & Slide Form */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                      
                      {/* Left: Slides List */}
                      <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                            Diapositivas Activas ({visualConfig.heroSlides?.length || 0})
                          </h4>
                          <button
                            type="button"
                            onClick={handleAddSlide}
                            style={{
                              background: '#E0F2FE',
                              color: '#0369A1',
                              border: '1px solid #BAE6FD',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ➕ Nuevo Slide
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {visualConfig.heroSlides?.map((s, idx) => {
                            const isSelected = editingSlideIdx === idx;
                            const slideKey = `hero-slide-item-${s.id !== undefined && s.id !== null ? s.id : idx}`;
                            return (
                              <div
                                key={slideKey}
                                onClick={() => setEditingSlideIdx(idx)}
                                style={{
                                  padding: '14px 16px',
                                  borderRadius: '12px',
                                  background: isSelected ? '#F0F9FF' : '#F8FAFC',
                                  border: isSelected ? '2px solid #0284c7' : '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '12px',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: s.titleColor || '#0284c7' }}>
                                    <span>{s.badgeIcon || '🛡️'}</span>
                                    <span>SLIDE #{idx + 1}</span>
                                    {isSelected && <span style={{ color: '#0369A1' }}>• Editando</span>}
                                  </div>
                                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {s.titleLine1 || 'Sin título'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveSlide(idx, -1)}
                                    disabled={idx === 0}
                                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 7px', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                                    title="Mover arriba"
                                  >
                                    ⬆️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveSlide(idx, 1)}
                                    disabled={idx === visualConfig.heroSlides.length - 1}
                                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 7px', cursor: idx === visualConfig.heroSlides.length - 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                                    title="Mover abajo"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlide(idx)}
                                    style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', fontSize: '12px' }}
                                    title="Eliminar slide"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Slide Editor Form */}
                      {visualConfig.heroSlides && visualConfig.heroSlides[editingSlideIdx] && (() => {
                        const cur = visualConfig.heroSlides[editingSlideIdx];
                        return (
                          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✏️</span> Editando Slide #{editingSlideIdx + 1}: {cur.titleLine1 || 'Banner Personalizado'}
                              </h4>
                              <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontWeight: '750' }}>
                                1920 x 500 px
                              </span>
                            </div>

                            {/* Selector de Modo de Banner */}
                            <div style={{ marginBottom: '18px', background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                                🎨 Tipo de Presentación del Banner
                              </label>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                                {[
                                  { id: 'metrics', label: '📊 Título + Métricas', desc: 'Tipográfico con 3 KPIs' },
                                  { id: 'custom_image', label: '🖼️ Banner Gráfico Completo', desc: 'Diseño 100% en Imagen' },
                                  { id: 'animated_stats', label: '⚡ Animado Core DACAS', desc: 'Contadores automáticos' }
                                ].map(t => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleUpdateSlideField(editingSlideIdx, 'type', t.id)}
                                    style={{
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      textAlign: 'left',
                                      background: (cur.type || 'metrics') === t.id ? '#0284c7' : '#FFFFFF',
                                      color: (cur.type || 'metrics') === t.id ? '#FFFFFF' : '#334155',
                                      border: `1.5px solid ${(cur.type || 'metrics') === t.id ? '#0284c7' : '#CBD5E1'}`,
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: '700'
                                    }}
                                  >
                                    <div>{t.label}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: '500' }}>{t.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Imagen de Banner (Carga desde PC / URL) */}
                            <div style={{ marginBottom: '16px', background: '#F0F9FF', padding: '16px', borderRadius: '14px', border: '1.5px solid #BAE6FD' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0369A1' }}>
                                  🖼️ Imagen del Banner (Cargar desde la PC o URL)
                                </label>
                                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                                  Recomendado: 1920x500 px
                                </span>
                              </div>

                              {/* Input de archivo nativo oculto */}
                              <input
                                type="file"
                                ref={bannerFileInputRef}
                                accept="image/webp,image/png,image/jpeg,image/jpg"
                                style={{ display: 'none' }}
                                onChange={(e) => handleBannerFileUpload(e, editingSlideIdx)}
                              />

                              {/* Botones de acción: Cargar desde PC o Pegar URL */}
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                                <button
                                  type="button"
                                  onClick={() => bannerFileInputRef.current && bannerFileInputRef.current.click()}
                                  disabled={uploadingBanner}
                                  style={{
                                    background: '#0fa4de',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '9px 18px',
                                    borderRadius: '10px',
                                    fontSize: '12.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
                                  }}
                                >
                                  <span>📁</span> {uploadingBanner ? 'Cargando archivo...' : 'Cargar Foto desde la PC'}
                                </button>

                                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>o ingresa una URL:</span>

                                <input
                                  type="text"
                                  value={cur.imageUrl || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'imageUrl', e.target.value)}
                                  placeholder="https://servidor.com/banner-1920x500.webp"
                                  style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                />

                                {cur.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSlideField(editingSlideIdx, 'imageUrl', '')}
                                    style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '8px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    🗑️ Quitar
                                  </button>
                                )}
                              </div>

                              {/* Zona Drag and Drop / Preview */}
                              {!cur.imageUrl ? (
                                <div
                                  onClick={() => bannerFileInputRef.current && bannerFileInputRef.current.click()}
                                  style={{
                                    border: '2px dashed #93C5FD',
                                    borderRadius: '12px',
                                    padding: '24px 16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#0284c7'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                                >
                                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>☁️</div>
                                  <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0369A1' }}>
                                    Haz click aquí o arrastra tu banner para subirlo desde la PC
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                    Formatos: WebP, PNG, JPG • Máximo 15 MB
                                  </div>
                                </div>
                              ) : (
                                <div style={{ marginTop: '8px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1', position: 'relative', background: '#071524' }}>
                                  <img 
                                    src={cur.imageUrl} 
                                    alt="Banner Preview" 
                                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} 
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px',
                                    background: 'rgba(7, 21, 36, 0.85)',
                                    color: '#38bdf8',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10.5px',
                                    fontWeight: '700',
                                    backdropFilter: 'blur(4px)'
                                  }}>
                                    ✓ Banner Cargado Correctamente
                                  </div>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                                  Ícono / Emoji del Badge
                                </label>
                                <input
                                  type="text"
                                  value={cur.badgeIcon || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'badgeIcon', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                                  placeholder="🛡️"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                                  Texto del Badge Superior
                                </label>
                                <input
                                  type="text"
                                  value={cur.badge || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'badge', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                                  placeholder="DISTRIBUIDOR OFICIAL MAYORISTA"
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                                  Título Línea 1
                                </label>
                                <input
                                  type="text"
                                  value={cur.titleLine1 || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleLine1', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                                  placeholder="Equipamiento IT, Redes"
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                                  Título Línea 2 (Color Resaltado)
                                </label>
                                <input
                                  type="text"
                                  value={cur.titleLine2 || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleLine2', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                                  placeholder="& Ciberseguridad Enterprise"
                                />
                              </div>
                            </div>

                            {/* Color Picker & Presets */}
                            <div style={{ marginBottom: '14px' }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                Color de Acento del Título
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <input
                                  type="color"
                                  value={cur.titleColor || '#0fa4de'}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleColor', e.target.value)}
                                  style={{ width: '40px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '2px' }}
                                />
                                {[
                                  { color: '#0fa4de', label: 'Cyan DACAS' },
                                  { color: '#10b981', label: 'Verde Esmeralda' },
                                  { color: '#38bdf8', label: 'Azul Sky' },
                                  { color: '#f59e0b', label: 'Ámbar' },
                                  { color: '#6366f1', label: 'Índigo' },
                                  { color: '#EE3124', label: 'Rojo Fortinet' }
                                ].map(p => (
                                  <button
                                    key={p.color}
                                    type="button"
                                    onClick={() => handleUpdateSlideField(editingSlideIdx, 'titleColor', p.color)}
                                    style={{
                                      background: cur.titleColor === p.color ? p.color : '#F1F5F9',
                                      color: cur.titleColor === p.color ? '#FFF' : '#334155',
                                      border: `1px solid ${cur.titleColor === p.color ? p.color : '#CBD5E1'}`,
                                      borderRadius: '8px',
                                      padding: '5px 10px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color, marginRight: '4px' }}></span>
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '14px' }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                                Descripción del Slide
                              </label>
                              <textarea
                                value={cur.desc || ''}
                                onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'desc', e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical' }}
                                placeholder="Texto explicativo para los clientes..."
                              />
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>
                                  🔘 Botón Primario
                                </label>
                                <input
                                  type="text"
                                  value={cur.primaryBtn?.text || ''}
                                  onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'text', e.target.value)}
                                  placeholder="Texto botón (ej: Ver Networking)"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', marginBottom: '6px' }}
                                />
                                <select
                                  value={cur.primaryBtn?.cat || 'all'}
                                  onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'cat', e.target.value)}
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                                >
                                  <option value="all">Ir a: Todo el Catálogo</option>
                                  <option value="networking">Ir a: Networking</option>
                                  <option value="infraestructura">Ir a: Infraestructura</option>
                                  <option value="comunicaciones_unificadas">Ir a: Comunicaciones Unificadas</option>
                                  <option value="security">Ir a: Seguridad</option>
                                </select>
                              </div>

                              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748B', marginBottom: '6px' }}>
                                  🔘 Botón Secundario
                                </label>
                                <input
                                  type="text"
                                  value={cur.secondaryBtn?.text || ''}
                                  onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'text', e.target.value)}
                                  placeholder="Texto botón (ej: Consultar Stock)"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', marginBottom: '6px' }}
                                />
                                <select
                                  value={cur.secondaryBtn?.cat || 'all'}
                                  onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'cat', e.target.value)}
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                                >
                                  <option value="all">Ir a: Todo el Catálogo</option>
                                  <option value="networking">Ir a: Networking</option>
                                  <option value="infraestructura">Ir a: Infraestructura</option>
                                  <option value="comunicaciones_unificadas">Ir a: Comunicaciones Unificadas</option>
                                  <option value="security">Ir a: Seguridad</option>
                                </select>
                              </div>
                            </div>

                            {/* Metrics / 3 KPI Buttons */}
                            {cur.type !== 'custom_image' ? (
                              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>📊</span> 3 Métricas Destacadas del Banner (Botones / KPIs laterales)
                                  </label>
                                  {cur.type === 'animated_stats' && (
                                    <span style={{ fontSize: '10.5px', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                      ⚡ Modo animado DACAS
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                                  {[0, 1, 2].map(mIdx => {
                                    const m = cur.metrics?.[mIdx] || { value: '', label: '' };
                                    return (
                                      <div key={mIdx} style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', marginBottom: '4px' }}>
                                          Botón #{mIdx + 1}
                                        </div>
                                        <input
                                          type="text"
                                          value={m.value || ''}
                                          onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'value', e.target.value)}
                                          placeholder={mIdx === 0 ? "Valor (ej: +25 Años)" : mIdx === 1 ? "Valor (ej: 12 Países)" : "Valor (ej: 24/7)"}
                                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}
                                        />
                                        <input
                                          type="text"
                                          value={m.label || ''}
                                          onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'label', e.target.value)}
                                          placeholder={mIdx === 0 ? "Etiqueta (ej: Liderando el Mercado IT)" : mIdx === 1 ? "Etiqueta (ej: Cobertura Regional)" : "Etiqueta (ej: Soporte Oficial)"}
                                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#64748B' }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px dashed #CBD5E1', fontSize: '12px', color: '#64748B' }}>
                                💡 <em>En modo "Banner Gráfico Completo", se muestra únicamente la imagen subida adaptada a 420px de alto. Para mostrar títulos y los 3 botones / métricas, selecciona <strong>"Título + Métricas"</strong> arriba.</em>
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB: BRAND BANNERS & CAROUSELS ── */}
                {visualSubTab === 'brand_banners' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* Header card */}
                    <div style={{ background: '#FFFFFF', padding: '26px 30px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 12px 36px rgba(7, 21, 36, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 164, 222, 0.1)', color: '#0fa4de', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', marginBottom: '8px' }}>
                            ⭐ HOME DEL SHOP · BANNERS DE MARCA & CARRUSELES
                          </div>
                          <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🏷️</span> Banners Promocionales de Marcas & Carruseles de la Home
                          </h3>
                          <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', maxWidth: '780px', lineHeight: 1.5 }}>
                            Personaliza los 2 o 3 banners destacados de marcas que promocionamos en la pantalla de inicio, y los carruseles horizontales de productos para que los clientes exploren el catálogo cómodamente.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: 3 Brand Banners */}
                    <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '22px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🎯</span> 2 o 3 Banners de Marcas Promocionadas (Home)
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                            Al hacer clic en un banner, el cliente navegará directo al catálogo con los productos de ese fabricante.
                          </p>
                        </div>
                        <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '8px', fontWeight: '750' }}>
                          {(visualConfig.brandBanners || []).filter(b => b.enabled !== false).length} de {(visualConfig.brandBanners || []).length} Activos
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {(visualConfig.brandBanners || []).map((b, bIdx) => (
                          <div
                            key={b.id || bIdx}
                            style={{
                              background: '#F8FAFC',
                              borderRadius: '16px',
                              border: `1.5px solid ${b.enabled !== false ? (b.accentColor || '#0fa4de') : '#CBD5E1'}`,
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              boxShadow: b.enabled !== false ? '0 4px 15px rgba(0,0,0,0.04)' : 'none',
                              opacity: b.enabled !== false ? 1 : 0.65,
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                              <span style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: b.accentColor || '#0fa4de' }}></span>
                                Banner de Marca #{bIdx + 1}
                              </span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: b.enabled !== false ? '#0284c7' : '#64748B', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={b.enabled !== false}
                                  onChange={(e) => handleUpdateBrandBanner(bIdx, 'enabled', e.target.checked)}
                                  style={{ cursor: 'pointer', accentColor: '#0fa4de' }}
                                />
                                {b.enabled !== false ? 'Activo en Home' : 'Oculto'}
                              </label>
                            </div>

                            {/* Marca / Fabricante */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                Fabricante / Marca Destacada:
                              </label>
                              <input
                                type="text"
                                value={b.brand || ''}
                                onChange={(e) => handleUpdateBrandBanner(bIdx, 'brand', e.target.value)}
                                placeholder="Ej: Fortinet, Vertiv, MikroTik, Panduit..."
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                              />
                            </div>

                            {/* Badge & Título */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                  Badge Superior:
                                </label>
                                <input
                                  type="text"
                                  value={b.badge || ''}
                                  onChange={(e) => handleUpdateBrandBanner(bIdx, 'badge', e.target.value)}
                                  placeholder="Ej: CIBERSEGURIDAD LÍDER"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px' }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                  Color de Acento:
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="color"
                                    value={b.accentColor || '#0fa4de'}
                                    onChange={(e) => handleUpdateBrandBanner(bIdx, 'accentColor', e.target.value)}
                                    style={{ width: '34px', height: '32px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: 0 }}
                                  />
                                  <input
                                    type="text"
                                    value={b.accentColor || '#0fa4de'}
                                    onChange={(e) => handleUpdateBrandBanner(bIdx, 'accentColor', e.target.value)}
                                    style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11.5px' }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Título Principal */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                Título del Banner:
                              </label>
                              <input
                                type="text"
                                value={b.title || ''}
                                onChange={(e) => handleUpdateBrandBanner(bIdx, 'title', e.target.value)}
                                placeholder="Ej: Fortinet Security Fabric"
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: '700' }}
                              />
                            </div>

                            {/* Subtítulo / Descripción */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                Subtítulo / Descripción:
                              </label>
                              <textarea
                                rows={2}
                                value={b.subtitle || ''}
                                onChange={(e) => handleUpdateBrandBanner(bIdx, 'subtitle', e.target.value)}
                                placeholder="Texto descriptivo de las soluciones de la marca..."
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px', resize: 'vertical' }}
                              />
                            </div>

                            {/* Texto del Botón */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                Texto del Botón de Acción:
                              </label>
                              <input
                                type="text"
                                value={b.buttonText || ''}
                                onChange={(e) => handleUpdateBrandBanner(bIdx, 'buttonText', e.target.value)}
                                placeholder={`Ej: Explorar ${b.brand || 'Marca'}`}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                            </div>

                            {/* Imagen de Fondo Opcional */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                                Imagen / Foto del Banner (Opcional):
                              </label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={b.imageUrl || ''}
                                  onChange={(e) => handleUpdateBrandBanner(bIdx, 'imageUrl', e.target.value)}
                                  placeholder="https://... o sube una imagen"
                                  style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px' }}
                                />
                                {b.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateBrandBanner(bIdx, 'imageUrl', '')}
                                    style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    Quitar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Product Carousels Configuration */}
                    <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '22px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🎠</span> Configuración de Carruseles Horizontales de la Home
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                          Define los 2 carruseles de productos que se mostrarán en la página principal: Productos Destacados y Selección Especial.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
                        {/* Carousel 1: Featured */}
                        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                              Carrusel 1: Productos Destacados
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: visualConfig.homeCarousels?.featured?.enabled !== false ? '#0284c7' : '#64748B', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={visualConfig.homeCarousels?.featured?.enabled !== false}
                                onChange={(e) => handleUpdateCarouselConfig('featured', 'enabled', e.target.checked)}
                                style={{ accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              {visualConfig.homeCarousels?.featured?.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                            </label>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                              Título del Carrusel:
                            </label>
                            <input
                              type="text"
                              value={visualConfig.homeCarousels?.featured?.title || '🔥 Productos Destacados'}
                              onChange={(e) => handleUpdateCarouselConfig('featured', 'title', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                            />
                          </div>

                          <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                              Subtítulo:
                            </label>
                            <input
                              type="text"
                              value={visualConfig.homeCarousels?.featured?.subtitle || 'Equipamiento de alta demanda con entrega inmediata'}
                              onChange={(e) => handleUpdateCarouselConfig('featured', 'subtitle', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px' }}
                            />
                          </div>

                          <div style={{ fontSize: '11.5px', color: '#64748B', background: '#F1F5F9', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.5 }}>
                            ℹ️ <em>Muestra automáticamente los productos con stock disponible y más recientes de la tienda, o los que marques en la selección manual.</em>
                          </div>
                        </div>

                        {/* Carousel 2: Custom Selected Products */}
                        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                              Carrusel 2: Productos Seleccionados por Nosotros
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: visualConfig.homeCarousels?.custom?.enabled !== false ? '#0284c7' : '#64748B', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={visualConfig.homeCarousels?.custom?.enabled !== false}
                                onChange={(e) => handleUpdateCarouselConfig('custom', 'enabled', e.target.checked)}
                                style={{ accentColor: '#0fa4de', cursor: 'pointer' }}
                              />
                              {visualConfig.homeCarousels?.custom?.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                            </label>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                              Título del Carrusel:
                            </label>
                            <input
                              type="text"
                              value={visualConfig.homeCarousels?.custom?.title || '⚡ Oportunidades & Novedades IT'}
                              onChange={(e) => handleUpdateCarouselConfig('custom', 'title', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                            />
                          </div>

                          <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                              Subtítulo:
                            </label>
                            <input
                              type="text"
                              value={visualConfig.homeCarousels?.custom?.subtitle || 'Soluciones corporativas seleccionadas con precios mayoristas especiales'}
                              onChange={(e) => handleUpdateCarouselConfig('custom', 'subtitle', e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px' }}
                            />
                          </div>

                          {/* Multi-product selector */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A' }}>
                                Elegir Productos para este Carrusel:
                              </label>
                              <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                                {(visualConfig.homeCarousels?.custom?.productIds || []).length} seleccionados
                              </span>
                            </div>

                            <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px' }}>
                              {products && products.length > 0 ? (
                                products.map(prod => {
                                  const isSelected = (visualConfig.homeCarousels?.custom?.productIds || []).includes(parseInt(prod.id));
                                  return (
                                    <div
                                      key={prod.id}
                                      onClick={() => handleToggleCarouselProduct('custom', prod.id)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        background: isSelected ? '#F0F9FF' : 'transparent',
                                        border: isSelected ? '1px solid #BAE6FD' : '1px solid transparent',
                                        marginBottom: '3px'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        style={{ accentColor: '#0fa4de', cursor: 'pointer' }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0, fontSize: '12px' }}>
                                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{prod.name}</span>
                                        <span style={{ color: '#64748B', marginLeft: '6px', fontSize: '11px' }}>({prod.brand || 'DACAS'}) · ${parseFloat(prod.price || 0).toFixed(2)} USD</span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ padding: '12px', fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                                  No hay productos cargados en el inventario
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 2: ANNOUNCEMENT & HEADER ── */}
                {visualSubTab === 'announcement' && (
                  <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 12px 36px rgba(7, 21, 36, 0.05)' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                      <span>📢</span> Configuración de la Barra Superior & Textos de Cabecera
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <input
                        type="checkbox"
                        id="toggleAnnouncement"
                        checked={visualConfig.announcement?.enabled !== false}
                        onChange={(e) => setVisualConfig({
                          ...visualConfig,
                          announcement: { ...(visualConfig.announcement || {}), enabled: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0fa4de' }}
                      />
                      <label htmlFor="toggleAnnouncement" style={{ fontWeight: '700', fontSize: '13.5px', color: '#0F172A', cursor: 'pointer' }}>
                        Mostrar Barra Superior de Anuncios y Cobertura Regional
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Texto del Anuncio Regional
                        </label>
                        <input
                          type="text"
                          value={visualConfig.announcement?.text || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            announcement: { ...(visualConfig.announcement || {}), text: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="Distribución Oficial y Soporte Certificado en 12 Países..."
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Teléfono de Atención en Cabecera
                        </label>
                        <input
                          type="text"
                          value={visualConfig.general?.contactPhone || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), contactPhone: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="+54 11 4110-3300"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Título de la Tienda (Header)
                        </label>
                        <input
                          type="text"
                          value={visualConfig.general?.shopTitle || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), shopTitle: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="DACAS B2B Shop"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Subtítulo de la Tienda (Header)
                        </label>
                        <input
                          type="text"
                          value={visualConfig.general?.shopSubtitle || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), shopSubtitle: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="Plataforma Corporativa de Soluciones IT..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 3: CATEGORIES ── */}
                {visualSubTab === 'categories' && (
                  <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 12px 36px rgba(7, 21, 36, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                          <span>🏷️</span> Las 4 Secciones Principales del Shop
                        </h3>
                        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13.5px' }}>
                          Personaliza el nombre, ícono y descripción visible para los integradores y clientes.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
                      {(visualConfig.categories || []).map((cat, idx) => (
                        <div
                          key={cat.key || idx}
                          style={{
                            background: '#FFFFFF',
                            padding: '24px',
                            borderRadius: '18px',
                            border: '1px solid rgba(15, 164, 222, 0.2)',
                            boxShadow: '0 6px 24px rgba(7, 21, 36, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.12), rgba(2, 132, 199, 0.06))',
                              color: '#0284c7',
                              padding: '5px 12px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              border: '1px solid rgba(15, 164, 222, 0.2)'
                            }}>
                              SECCIÓN #{idx + 1} ({cat.key})
                            </span>
                            <label
                              htmlFor={`cat-enabled-${idx}`}
                              style={{
                                background: cat.enabled !== false ? '#DCFCE7' : '#F1F5F9',
                                color: cat.enabled !== false ? '#166534' : '#64748B',
                                border: '1px solid ' + (cat.enabled !== false ? '#BBF7D0' : '#E2E8F0'),
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                id={`cat-enabled-${idx}`}
                                checked={cat.enabled !== false}
                                onChange={(e) => {
                                  const updatedCats = [...visualConfig.categories];
                                  updatedCats[idx] = { ...updatedCats[idx], enabled: e.target.checked };
                                  setVisualConfig({ ...visualConfig, categories: updatedCats });
                                }}
                                style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#10b981' }}
                              />
                              {cat.enabled !== false ? 'Activa' : 'Inactiva'}
                            </label>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                Ícono
                              </label>
                              <input
                                type="text"
                                value={cat.icon || ''}
                                onChange={(e) => {
                                  const updatedCats = [...visualConfig.categories];
                                  updatedCats[idx] = { ...updatedCats[idx], icon: e.target.value };
                                  setVisualConfig({ ...visualConfig, categories: updatedCats });
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  padding: '9px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #CBD5E1',
                                  fontSize: '20px',
                                  background: '#F8FAFC'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                                Nombre de la Categoría
                              </label>
                              <input
                                type="text"
                                value={cat.name || cat.label || ''}
                                onChange={(e) => {
                                  const updatedCats = [...visualConfig.categories];
                                  updatedCats[idx] = { ...updatedCats[idx], name: e.target.value, label: e.target.value };
                                  setVisualConfig({ ...visualConfig, categories: updatedCats });
                                }}
                                style={{
                                  width: '100%',
                                  padding: '9px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #CBD5E1',
                                  fontSize: '13.5px',
                                  fontWeight: '700',
                                  color: '#0F172A',
                                  background: '#FFFFFF'
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                              Descripción Breve
                            </label>
                            <textarea
                              value={cat.desc || ''}
                              onChange={(e) => {
                                const updatedCats = [...visualConfig.categories];
                                updatedCats[idx] = { ...updatedCats[idx], desc: e.target.value };
                                setVisualConfig({ ...visualConfig, categories: updatedCats });
                              }}
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1.5px solid #CBD5E1',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                color: '#334155',
                                background: '#FFFFFF',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 4: BRANDS PER CATEGORY & COUNTRY ── */}
                {visualSubTab === 'brands' && (
                  <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 12px 36px rgba(7, 21, 36, 0.05)' }}>
                    {/* Header & Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px', borderBottom: '1px solid #F1F5F9', paddingBottom: '18px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                          <span>🏭</span> Gestión de Marcas y Cobertura por País
                        </h3>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '13.5px', maxWidth: '700px', lineHeight: 1.4 }}>
                          Crea nuevas marcas, elimínalas y define en qué países opera cada fabricante. Las marcas solo aparecerán en el Shop cuando el cliente navegue desde un país autorizado.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setNewBrandForm({
                              name: '',
                              category: 'networking',
                              isGlobal: true,
                              countries: []
                            });
                            setShowNewBrandModal(true);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 18px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 3px 10px rgba(15, 164, 222, 0.3)'
                          }}
                        >
                          <span>➕</span> Crear Nueva Marca
                        </button>
                      </div>
                    </div>

                    {/* Country Filter Banner */}
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                          🌍 Filtrar Vista por País:
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          (Verifica qué marcas están activas para clientes de cada región)
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
                        <button
                          type="button"
                          onClick={() => setBrandCountryFilter('all')}
                          style={{
                            background: brandCountryFilter === 'all' ? '#0284c7' : '#FFFFFF',
                            color: brandCountryFilter === 'all' ? '#FFFFFF' : '#475569',
                            border: `1px solid ${brandCountryFilter === 'all' ? '#0284c7' : '#CBD5E1'}`,
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🌐 Todos los Países (Global)
                        </button>
                        {DACAS_COUNTRIES_LIST.map(c => {
                          const isSelected = brandCountryFilter === c.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => setBrandCountryFilter(c.code)}
                              style={{
                                background: isSelected ? '#0284c7' : '#FFFFFF',
                                color: isSelected ? '#FFFFFF' : '#475569',
                                border: `1px solid ${isSelected ? '#0284c7' : '#CBD5E1'}`,
                                borderRadius: '8px',
                                padding: '5px 10px',
                                fontSize: '12px',
                                fontWeight: isSelected ? '700' : '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{c.flag}</span> {c.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Categories Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
                      {[
                        { key: 'networking', title: 'Networking', icon: '🌐' },
                        { key: 'infraestructura', title: 'Infraestructura', icon: '⚡' },
                        { key: 'comunicaciones_unificadas', title: 'Comunicaciones Unificadas', icon: '📞' },
                        { key: 'security', title: 'Seguridad & Ciberseguridad', icon: '🛡️' }
                      ].map(group => {
                        const rawList = (visualConfig?.categoryBrands && visualConfig.categoryBrands[group.key]) || [];
                        const normalizedBrands = rawList.map((item, idx) => ({
                          ...normalizeBrandItem(item, group.key),
                          originalIdx: idx
                        }));

                        // Filter based on country filter if active
                        const displayedBrands = normalizedBrands.filter(b => {
                          if (brandCountryFilter === 'all') return true;
                          if (!b.countries || b.countries.length === 0) return true; // Global
                          return b.countries.includes(brandCountryFilter);
                        });

                        return (
                          <div
                            key={group.key}
                            style={{
                              background: '#F8FAFC',
                              borderRadius: '16px',
                              border: '1px solid #E2E8F0',
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            {/* Category Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>{group.icon}</span>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                                    {group.title}
                                  </h4>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                                    {displayedBrands.length} {displayedBrands.length === 1 ? 'marca activa' : 'marcas activas'}
                                    {brandCountryFilter !== 'all' && ` en ${brandCountryFilter}`}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setNewBrandForm({
                                    name: '',
                                    category: group.key,
                                    isGlobal: true,
                                    countries: []
                                  });
                                  setShowNewBrandModal(true);
                                }}
                                style={{
                                  background: '#E0F2FE',
                                  color: '#0369A1',
                                  border: '1px solid #BAE6FD',
                                  borderRadius: '8px',
                                  padding: '5px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                + Añadir
                              </button>
                            </div>

                            {/* Brands List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: '120px' }}>
                              {displayedBrands.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12.5px', background: '#FFFFFF', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                                  No hay marcas asignadas para esta categoría {brandCountryFilter !== 'all' ? `en ${brandCountryFilter}` : ''}
                                </div>
                              ) : (
                                displayedBrands.map(b => {
                                  const isGlobal = !b.countries || b.countries.length === 0;
                                  return (
                                    <div
                                      key={b.originalIdx}
                                      style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '10px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            {b.name}
                                          </span>
                                        </div>

                                        {/* Country Badges */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                          {isGlobal ? (
                                            <span style={{
                                              background: '#DCFCE7',
                                              color: '#15803D',
                                              fontSize: '10.5px',
                                              fontWeight: '700',
                                              padding: '2px 8px',
                                              borderRadius: '999px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              🌐 Todos los Países (Global)
                                            </span>
                                          ) : (
                                            <span style={{
                                              background: '#E0F2FE',
                                              color: '#0369A1',
                                              fontSize: '10.5px',
                                              fontWeight: '700',
                                              padding: '2px 8px',
                                              borderRadius: '999px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              <span>{b.countries.map(cCode => {
                                                const found = DACAS_COUNTRIES_LIST.find(c => c.code === cCode);
                                                return found ? found.flag : cCode;
                                              }).join(' ')}</span>
                                              <span>({b.countries.length} {b.countries.length === 1 ? 'país' : 'países'})</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Brand Actions */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditBrand(b.name, group.key, b.originalIdx)}
                                          title="Editar logotipo, descripción y cobertura de esta marca"
                                          style={{
                                            background: '#F1F5F9',
                                            color: '#0284c7',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '6px',
                                            padding: '5px 9px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                        >
                                          ✏️ Editar Marca & Logo
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteBrand(group.key, b.originalIdx, b.name)}
                                          title="Eliminar marca"
                                          style={{
                                            background: '#FEF2F2',
                                            color: '#DC2626',
                                            border: '1px solid #FECACA',
                                            borderRadius: '6px',
                                            padding: '5px 8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 5: CONTACT & WHATSAPP ── */}
                {visualSubTab === 'contact' && (
                  <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 12px 36px rgba(7, 21, 36, 0.05)' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                      <span>📞</span> Canales de Atención Directa y Cotización B2B
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                      <div style={{ gridColumn: '1 / -1', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💬</span> Botón Flotante de WhatsApp en el Shop
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Muestra el widget flotante interactivo de atención al cliente en tiempo real en la esquina inferior del Shop.
                          </div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={visualConfig.general?.whatsappEnabled !== false}
                            onChange={(e) => setVisualConfig({
                              ...visualConfig,
                              general: { ...(visualConfig.general || {}), whatsappEnabled: e.target.checked }
                            })}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: visualConfig.general?.whatsappEnabled !== false ? '#25D366' : '#CBD5E1',
                            transition: '0.3s', borderRadius: '34px'
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '20px', width: '20px', left: visualConfig.general?.whatsappEnabled !== false ? '24px' : '3px', bottom: '3px',
                              backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }} />
                          </span>
                        </label>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          WhatsApp Corporativo (con código de país)
                        </label>
                        <input
                          type="text"
                          value={visualConfig.general?.whatsappNumber || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), whatsappNumber: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="+5491141103300"
                        />
                        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                          Permite a los integradores contactar directo o enviar su cotización a WhatsApp.
                        </p>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Email de Ventas & Preventa
                        </label>
                        <input
                          type="email"
                          value={visualConfig.general?.contactEmail || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), contactEmail: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="ventas@dacas.com"
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          Mensaje Inicial Predeterminado al Abrir WhatsApp
                        </label>
                        <input
                          type="text"
                          value={visualConfig.general?.whatsappMessage || ''}
                          onChange={(e) => setVisualConfig({
                            ...visualConfig,
                            general: { ...(visualConfig.general || {}), whatsappMessage: e.target.value }
                          })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF' }}
                          placeholder="¡Hola DACAS! Me contacto desde el Shop B2B para solicitar asesoramiento comercial y cotizaciones."
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                Cargando configuración visual del Shop...
              </div>
            )}

          </section>
        )}

        {/* ═══════════════ APLI INTEGRATION & CONNECTION MODULE ═══════════════ */}
        {activeTab === 'apli' && (
          <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
            {/* Header Banner & Status Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #071524 0%, #0c233d 50%, #034870 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '24px',
              boxShadow: '0 8px 30px rgba(7, 21, 36, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
                  }}>
                    🔌
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                      Módulo de Conexión & Integración Apli
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                      Sincronización en tiempo real de catálogo, stock, listas de precios y pedidos B2B con Apli ERP & Cloud.
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '800',
                    background: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                    color: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? '#4ADE80' : '#F87171',
                    border: `1px solid ${apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? '#22C55E' : '#EF4444'
                    }}></span>
                    {apliConfig.enabled && apliConfig.connectionStatus === 'connected' ? 'Conectado & Operativo' : 'Desconectado'}
                  </span>

                  <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
                    ⚡ Latencia API: <strong style={{ color: '#38BDF8' }}>{apliConfig.lastLatencyMs || 35} ms</strong>
                  </span>

                  <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
                    🌐 Entorno: <strong style={{ color: '#FFFFFF', textTransform: 'uppercase' }}>{apliConfig.environment || 'produccion'}</strong>
                  </span>

                  <span style={{ fontSize: '12px', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
                    ⏱️ Última Sincronización: <strong style={{ color: '#FFFFFF' }}>{apliConfig.lastSync ? new Date(apliConfig.lastSync).toLocaleTimeString() : 'Reciente'}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTestApliConnection}
                  disabled={apliTesting}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: apliTesting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>⚡</span> {apliTesting ? 'Probando...' : 'Probar Conexión'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSyncApliNow('all')}
                  disabled={apliSyncing}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: apliSyncing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>🔄</span> {apliSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </button>
              </div>
            </div>

            {/* Test Connection / Sync Result Alerts */}
            {apliTestResult && (
              <div style={{
                background: apliTestResult.success ? '#ECFDF5' : '#FEF2F2',
                color: apliTestResult.success ? '#065F46' : '#991B1B',
                border: `1.5px solid ${apliTestResult.success ? '#A7F3D0' : '#FECACA'}`,
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>{apliTestResult.success ? '✅' : '❌'}</span>
                <span>{apliTestResult.message}</span>
              </div>
            )}

            {apliSyncResult && (
              <div style={{
                background: apliSyncResult.success ? '#EFF6FF' : '#FEF2F2',
                color: apliSyncResult.success ? '#1E40AF' : '#991B1B',
                border: `1.5px solid ${apliSyncResult.success ? '#BFDBFE' : '#FECACA'}`,
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>{apliSyncResult.success ? '🚀' : '❌'}</span>
                <span>{apliSyncResult.message}</span>
              </div>
            )}

            {apliSaveSuccess && (
              <div style={{
                background: '#ECFDF5',
                color: '#065F46',
                border: '1.5px solid #A7F3D0',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>✓</span>
                <span>¡Configuración del módulo Apli guardada exitosamente!</span>
              </div>
            )}

            {/* Sub-Tabs Nav for Apli */}
            <div style={{
              display: 'flex',
              gap: '10px',
              borderBottom: '2px solid #E2E8F0',
              paddingBottom: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'config', label: '⚙️ Parámetros & Credenciales', desc: 'API Keys y Endpoints' },
                { id: 'sync', label: '🔄 Sincronización Automática', desc: 'Catálogo, Stock y Pedidos' },
                { id: 'webhooks', label: '🔗 Webhooks de Apli', desc: 'Notificaciones en Tiempo Real' },
                { id: 'logs', label: '📊 Logs & Auditoría', desc: `${apliLogs.length} Eventos Registrados` }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setApliSubTab(st.id)}
                  style={{
                    background: apliSubTab === st.id ? '#0fa4de' : '#FFFFFF',
                    color: apliSubTab === st.id ? '#FFFFFF' : '#475569',
                    border: `1.5px solid ${apliSubTab === st.id ? '#0fa4de' : '#CBD5E1'}`,
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    boxShadow: apliSubTab === st.id ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{st.label}</span>
                  <span style={{ fontSize: '10.5px', opacity: apliSubTab === st.id ? 0.9 : 0.65, fontWeight: '600' }}>
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* ── SUBTAB 1: PARÁMETROS & CREDENCIALES ── */}
            {apliSubTab === 'config' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {/* General Connection Card */}
                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔐</span> Credenciales de Acceso Apli API
                    </h3>
                    <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontWeight: '750' }}>
                      REST v2
                    </span>
                  </div>

                  {/* Switch Enable Integration */}
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>Habilitar Conexión Apli ERP</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Activa la integración del Shop con la API de Apli.</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={apliConfig.enabled}
                        onChange={(e) => setApliConfig({ ...apliConfig, enabled: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: apliConfig.enabled ? '#0fa4de' : '#CBD5E1',
                        transition: '0.3s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '20px', width: '20px', left: apliConfig.enabled ? '24px' : '3px', bottom: '3px',
                          backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Environment Selector */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Entorno de Ejecución
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { id: 'production', label: '🚀 Producción (Live)', desc: 'Servidores oficiales' },
                        { id: 'sandbox', label: '🧪 Sandbox (Pruebas)', desc: 'Ambiente de test' }
                      ].map(env => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setApliConfig({ ...apliConfig, environment: env.id })}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: `1.5px solid ${apliConfig.environment === env.id ? '#0284c7' : '#E2E8F0'}`,
                            background: apliConfig.environment === env.id ? '#F0F9FF' : '#FFFFFF',
                            color: apliConfig.environment === env.id ? '#0369A1' : '#475569',
                            fontWeight: '700',
                            fontSize: '12px',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <div>{env.label}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500' }}>{env.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Endpoint URL */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Apli API Base Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={apliConfig.endpointUrl || ''}
                      onChange={(e) => setApliConfig({ ...apliConfig, endpointUrl: e.target.value })}
                      placeholder="https://api.apli.com.ar/v2"
                      style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Client / Tenant ID */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      ID de Cliente / Tenant DACAS en Apli
                    </label>
                    <input
                      type="text"
                      value={apliConfig.clientId || ''}
                      onChange={(e) => setApliConfig({ ...apliConfig, clientId: e.target.value })}
                      placeholder="DACAS-ARG-001"
                      style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* API Key */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                        API Key / Bearer Token
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApliApiKey(!showApliApiKey)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          color: '#0fa4de',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{showApliApiKey ? '🙈' : '👁️'}</span>
                        <span>{showApliApiKey ? 'Ocultar' : 'Mostrar'}</span>
                      </button>
                    </div>
                    <input
                      type={showApliApiKey ? 'text' : 'password'}
                      value={apliConfig.apiKey || ''}
                      onChange={(e) => setApliConfig({ ...apliConfig, apiKey: e.target.value })}
                      placeholder="apli_live_..."
                      style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: showApliApiKey ? 'monospace' : 'inherit', outline: 'none' }}
                    />
                  </div>

                  {/* Client Secret */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                        Client Secret
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApliSecret(!showApliSecret)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          color: '#0fa4de',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{showApliSecret ? '🙈' : '👁️'}</span>
                        <span>{showApliSecret ? 'Ocultar' : 'Mostrar'}</span>
                      </button>
                    </div>
                    <input
                      type={showApliSecret ? 'text' : 'password'}
                      value={apliConfig.clientSecret || ''}
                      onChange={(e) => setApliConfig({ ...apliConfig, clientSecret: e.target.value })}
                      placeholder="sk_live_..."
                      style={{ width: '100%', boxSizing: 'border-box', height: '42px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontFamily: showApliSecret ? 'monospace' : 'inherit', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Integration Details & Security Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🛡️</span> Seguridad y Cifrado de Transacciones
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <div>
                          <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Encriptación TLS 1.3 / SSL 256-bit</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>Toda la comunicación con Apli viaja con encriptación de grado bancario.</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔑</span>
                        <div>
                          <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Firma HMAC-SHA256 en Webhooks</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>Validación criptográfica de origen en cada notificación entrante.</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>⚡</span>
                        <div>
                          <div style={{ fontWeight: '750', fontSize: '12.5px', color: '#0F172A' }}>Reintentos Exponenciales Automáticos</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>Si Apli no responde, el sistema reintenta con backoff automático de 5 intentos.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Buttons Card */}
                  <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1.5px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#166534' }}>Guardar Cambios de Conexión</div>
                      <div style={{ fontSize: '11.5px', color: '#15803D' }}>Los cambios se aplicarán de inmediato a todo el sistema.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleResetApli}
                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Restablecer
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveApliSettings}
                        disabled={isSavingApli}
                        style={{
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: isSavingApli ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                        }}
                      >
                        {isSavingApli ? 'Guardando...' : '💾 Guardar Configuración'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBTAB 2: SINCRONIZACIÓN AUTOMÁTICA ── */}
            {apliSubTab === 'sync' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔄</span> Matriz de Sincronización Bidireccional
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                      Selecciona qué módulos se actualizarán de forma automatizada entre DACAS Shop y Apli ERP.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleSyncApliNow('stock')}
                      disabled={apliSyncing}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
                    >
                      📦 Sincronizar Solo Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSyncApliNow('orders')}
                      disabled={apliSyncing}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
                    >
                      🛒 Conciliar Pedidos
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { key: 'syncProducts', title: 'Catálogo de Productos & Precios', desc: 'Sincroniza SKUs, títulos, descripciones, marcas y listas mayoristas en USD.', icon: '🏷️' },
                    { key: 'syncStock', title: 'Inventario & Stock en Tiempo Real', desc: 'Actualiza cantidades disponibles de forma automática al registrar ventas o ingresos.', icon: '📦' },
                    { key: 'syncOrders', title: 'Despacho & Facturación de Pedidos', desc: 'Envía órdenes B2B aprobadas directo a Apli para emisión de factura fiscal y remito.', icon: '🧾' },
                    { key: 'syncCustomers', title: 'Clientes & Límites de Crédito', desc: 'Valida cuentas corrientes, CUITs verificados y líneas de crédito de integradores.', icon: '🏢' }
                  ].map(item => (
                    <div
                      key={item.key}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: `1.5px solid ${apliConfig[item.key] ? '#0284c7' : '#E2E8F0'}`,
                        background: apliConfig[item.key] ? '#F0F9FF' : '#F8FAFC',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '13px', color: apliConfig[item.key] ? '#0369A1' : '#1E293B' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', lineHeight: '1.4' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(apliConfig[item.key])}
                        onChange={(e) => setApliConfig({ ...apliConfig, [item.key]: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7', marginTop: '2px' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Sync Frequency */}
                <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                    ⏱️ Frecuencia de Sincronización Automática
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    {[
                      { id: 'realtime', label: '⚡ Tiempo Real (Webhooks)', desc: 'Instantáneo' },
                      { id: '5min', label: '⏱️ Cada 5 minutos', desc: 'Alta frecuencia' },
                      { id: '15min', label: '⏱️ Cada 15 minutos', desc: 'Recomendado' },
                      { id: 'hourly', label: '⏱️ Cada 1 hora', desc: 'Bajo tráfico' },
                      { id: 'manual', label: '✋ Solo Manual', desc: 'Bajo demanda' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setApliConfig({ ...apliConfig, syncInterval: f.id })}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1.5px solid ${apliConfig.syncInterval === f.id ? '#0284c7' : '#CBD5E1'}`,
                          background: apliConfig.syncInterval === f.id ? '#0284c7' : '#FFFFFF',
                          color: apliConfig.syncInterval === f.id ? '#FFFFFF' : '#334155',
                          fontWeight: '700',
                          fontSize: '11.5px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div>{f.label}</div>
                        <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: '500' }}>{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSaveApliSettings}
                    disabled={isSavingApli}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: isSavingApli ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)'
                    }}
                  >
                    {isSavingApli ? 'Guardando...' : '💾 Guardar Preferencias de Sincronización'}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUBTAB 3: WEBHOOKS ── */}
            {apliSubTab === 'webhooks' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔗</span> Endpoints y Webhooks de Notificación
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      URL del Webhook de DACAS Shop (Ingresar en panel de Apli)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={`http://${window.location.hostname}:3001/api/ecommerce/settings/apli/webhook`}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', background: '#F8FAFC', fontFamily: 'monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`http://${window.location.hostname}:3001/api/ecommerce/settings/apli/webhook`);
                          alert('¡URL del Webhook copiada al portapapeles!');
                        }}
                        style={{ background: '#0fa4de', color: '#FFFFFF', border: 'none', padding: '0 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        📋 Copiar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Secreto de Firma Webhook (HMAC-SHA256)
                    </label>
                    <input
                      type="text"
                      value={apliConfig.webhookSecret || ''}
                      onChange={(e) => setApliConfig({ ...apliConfig, webhookSecret: e.target.value })}
                      placeholder="whsec_..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '8px' }}>
                    Eventos de Apli Suscritos:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['product.stock_updated', 'order.invoice_generated', 'order.status_change', 'customer.credit_limit_updated'].map(ev => (
                      <span key={ev} style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '750', fontFamily: 'monospace' }}>
                        ✓ {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSaveApliSettings}
                    disabled={isSavingApli}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: isSavingApli ? 'not-allowed' : 'pointer'
                    }}
                  >
                    💾 Guardar Configuración de Webhook
                  </button>
                </div>
              </div>
            )}

            {/* ── SUBTAB 4: LOGS & AUDITORÍA ── */}
            {apliSubTab === 'logs' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📊</span> Registro de Transacciones y Eventos Apli ({apliLogs.length})
                  </h3>
                  <button
                    type="button"
                    onClick={fetchApliLogs}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
                  >
                    🔄 Actualizar Logs
                  </button>
                </div>

                {apliLogs.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    No hay registros de eventos aún.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Fecha & Hora</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Tipo de Evento</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Estado</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Detalle de Transacción</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Duración</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apliLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: '750', color: '#0F172A' }}>
                              <span style={{
                                background: log.type.includes('STOCK') ? '#FEF3C7' : log.type.includes('ORDER') ? '#E0F2FE' : '#F1F5F9',
                                color: log.type.includes('STOCK') ? '#B45309' : log.type.includes('ORDER') ? '#0369A1' : '#475569',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '10.5px'
                              }}>
                                {log.type}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: log.status === 'SUCCESS' ? '#DCFCE7' : '#FEE2E2',
                                color: log.status === 'SUCCESS' ? '#15803D' : '#DC2626',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: '800',
                                fontSize: '10.5px'
                              }}>
                                {log.status === 'SUCCESS' ? '✓ OK' : '✕ ERROR'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#334155' }}>
                              {log.details}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748B', fontFamily: 'monospace' }}>
                              {log.durationMs} ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </section>
        )}

        {/* ═══════════════ N8N AI AGENTS & BOT MODULE ═══════════════ */}
        {activeTab === 'n8n_bot' && (
          <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
            {/* Header Banner & Live Status */}
            <div style={{
              background: 'linear-gradient(135deg, #071524 0%, #0d2847 50%, #0fa4de 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '24px',
              boxShadow: '0 8px 30px rgba(7, 21, 36, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6D5A 0%, #EA4C89 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 4px 14px rgba(255, 109, 90, 0.4)'
                  }}>
                    🤖
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                      Agentes IA & Bot n8n para Clientes B2B
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#E0F2FE' }}>
                      Orquestación de Agentes de IA en n8n para asesoría técnica, consulta de stock en tiempo real y cotizaciones mayoristas.
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '800',
                    background: n8nConfig.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: n8nConfig.enabled ? '#4ADE80' : '#F87171',
                    border: `1px solid ${n8nConfig.enabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: n8nConfig.enabled ? '#22C55E' : '#EF4444'
                    }}></span>
                    {n8nConfig.enabled ? 'Bot IA Activo en Shop' : 'Bot Desactivado'}
                  </span>

                  <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
                    🎯 Tasa de Resolución: <strong>{n8nConfig.resolutionRate || '94%'}</strong>
                  </span>

                  <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
                    💬 Consultas B2B: <strong>{n8nConfig.conversationsCount || '142'}</strong>
                  </span>

                  <span style={{ fontSize: '12px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.12)', padding: '5px 12px', borderRadius: '8px' }}>
                    🧠 Modelo: <strong style={{ textTransform: 'uppercase', color: '#38BDF8' }}>{n8nConfig.aiModel || 'gpt-4o'}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTestN8nConnection}
                  disabled={n8nTesting}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: n8nTesting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>⚡</span> {n8nTesting ? 'Probando Webhook...' : 'Probar Conexión'}
                </button>

                <button
                  type="button"
                  onClick={() => setN8nSubTab('playground')}
                  style={{
                    background: '#FFFFFF',
                    color: '#0369A1',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>🧪</span> Abrir Simulador
                </button>
              </div>
            </div>

            {/* Test Connection / Save Result Alerts */}
            {n8nTestResult && (
              <div style={{
                background: n8nTestResult.success ? '#ECFDF5' : '#FEF2F2',
                color: n8nTestResult.success ? '#065F46' : '#991B1B',
                border: `1.5px solid ${n8nTestResult.success ? '#A7F3D0' : '#FECACA'}`,
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>{n8nTestResult.success ? '✅' : '❌'}</span>
                <span>{n8nTestResult.message}</span>
              </div>
            )}

            {n8nSaveSuccess && (
              <div style={{
                background: '#ECFDF5',
                color: '#065F46',
                border: '1.5px solid #A7F3D0',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>✓</span>
                <span>¡Configuración de los Agentes de IA n8n guardada exitosamente!</span>
              </div>
            )}

            {/* Sub-Tabs Nav for N8N */}
            <div style={{
              display: 'flex',
              gap: '10px',
              borderBottom: '2px solid #E2E8F0',
              paddingBottom: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'config', label: '⚙️ Configuración & Webhook', desc: 'Parámetros y Prompts' },
                { id: 'playground', label: '🧪 Playground & Simulador', desc: 'Prueba en Tiempo Real' },
                { id: 'workflow', label: '📦 Workflow Oficial n8n', desc: 'Descargar / Copiar JSON' },
                { id: 'logs', label: '📊 Logs de Conversaciones', desc: `${n8nLogs.length} Chats Registrados` }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setN8nSubTab(st.id)}
                  style={{
                    background: n8nSubTab === st.id ? '#0fa4de' : '#FFFFFF',
                    color: n8nSubTab === st.id ? '#FFFFFF' : '#475569',
                    border: `1.5px solid ${n8nSubTab === st.id ? '#0fa4de' : '#CBD5E1'}`,
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    boxShadow: n8nSubTab === st.id ? '0 4px 12px rgba(15, 164, 222, 0.25)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{st.label}</span>
                  <span style={{ fontSize: '10.5px', opacity: n8nSubTab === st.id ? 0.9 : 0.65, fontWeight: '600' }}>
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* ── SUBTAB 1: CONFIGURACIÓN & WEBHOOK ── */}
            {n8nSubTab === 'config' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {/* Left Card: Webhook & Core Parameters */}
                <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔗</span> Conexión al Webhook de n8n
                  </h3>

                  {/* Switch Enable */}
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>Habilitar Bot de IA en el Shop</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Muestra el widget del agente de IA en la tienda B2B.</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={n8nConfig.enabled}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, enabled: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: n8nConfig.enabled ? '#0fa4de' : '#CBD5E1',
                        transition: '0.3s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '20px', width: '20px', left: n8nConfig.enabled ? '24px' : '3px', bottom: '3px',
                          backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Webhook URL */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      URL del Webhook de n8n (Node Webhook Trigger)
                    </label>
                    <input
                      type="url"
                      value={n8nConfig.webhookUrl || ''}
                      onChange={(e) => setN8nConfig({ ...n8nConfig, webhookUrl: e.target.value })}
                      placeholder="https://tu-n8n.com/webhook/dacas-b2b-agent"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '42px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748B' }}>
                      Endpoint HTTP POST configurado en tu instancia de n8n para recibir el mensaje del usuario.
                    </p>
                  </div>

                  {/* Auth Header & Token */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                          Header de Autenticación
                        </label>
                      </div>
                      <input
                        type="text"
                        value={n8nConfig.authHeaderName || 'X-N8N-API-KEY'}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, authHeaderName: e.target.value })}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: '42px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '12.5px',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                          API Token / Secreto
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowN8nToken(!showN8nToken)}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            color: '#0fa4de',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{showN8nToken ? '🙈' : '👁️'}</span>
                          <span>{showN8nToken ? 'Ocultar' : 'Mostrar'}</span>
                        </button>
                      </div>
                      <input
                        type={showN8nToken ? 'text' : 'password'}
                        value={n8nConfig.authToken || ''}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, authToken: e.target.value })}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: '42px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '12.5px',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Bot Visual & Identity Settings */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', minHeight: '22px', marginBottom: '6px' }}>
                        Nombre del Bot
                      </label>
                      <input
                        type="text"
                        value={n8nConfig.botName || ''}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, botName: e.target.value })}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: '42px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', minHeight: '22px', marginBottom: '6px' }}>
                        Subtítulo del Header
                      </label>
                      <input
                        type="text"
                        value={n8nConfig.botSubtitle || ''}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, botSubtitle: e.target.value })}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          height: '42px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Mensaje de Bienvenida Inicial
                    </label>
                    <textarea
                      rows="3"
                      value={n8nConfig.welcomeMessage || ''}
                      onChange={(e) => setN8nConfig({ ...n8nConfig, welcomeMessage: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '12.5px',
                        lineHeight: '1.45',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Right Card: AI Agent Tools & System Prompt */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🛠️</span> Herramientas (Tools) del Agente n8n
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                      {[
                        { key: 'searchProducts', label: '🔍 Catálogo & Precios USD' },
                        { key: 'checkStock', label: '📦 Stock en Tiempo Real' },
                        { key: 'calculateQuote', label: '🧮 Cotizador de Proyectos' },
                        { key: 'recommendSolutions', label: '⚡ Recomendador Técnico' },
                        { key: 'checkOrderStatus', label: '🧾 Estado de Órdenes' },
                        { key: 'createSupportTicket', label: '🎫 Creación de Tickets' }
                      ].map(tool => (
                        <label
                          key={tool.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: n8nConfig.enabledTools?.[tool.key] ? '#F0F9FF' : '#F8FAFC',
                            border: `1px solid ${n8nConfig.enabledTools?.[tool.key] ? '#BAE6FD' : '#E2E8F0'}`,
                            padding: '10px 12px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: n8nConfig.enabledTools?.[tool.key] ? '#0369A1' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(n8nConfig.enabledTools?.[tool.key])}
                            onChange={(e) => setN8nConfig({
                              ...n8nConfig,
                              enabledTools: { ...(n8nConfig.enabledTools || {}), [tool.key]: e.target.checked }
                            })}
                            style={{ accentColor: '#0fa4de', width: '16px', height: '16px' }}
                          />
                          <span>{tool.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* System Prompt */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        System Prompt / Rol del Agente de IA
                      </label>
                      <textarea
                        rows="4"
                        value={n8nConfig.systemPrompt || ''}
                        onChange={(e) => setN8nConfig({ ...n8nConfig, systemPrompt: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.45' }}
                      />
                    </div>
                  </div>

                  {/* Save Buttons Card */}
                  <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1.5px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#166534' }}>Guardar Parámetros de n8n</div>
                      <div style={{ fontSize: '11.5px', color: '#15803D' }}>Se aplicará de inmediato al Bot del Shop.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleResetN8nSettings}
                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Restablecer
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveN8nSettings}
                        disabled={isSavingN8n}
                        style={{
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: isSavingN8n ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                        }}
                      >
                        {isSavingN8n ? 'Guardando...' : '💾 Guardar Configuración'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBTAB 2: PLAYGROUND & SIMULADOR EN VIVO ── */}
            {n8nSubTab === 'playground' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🧪</span> Simulador y Playground de Agentes n8n
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                      Prueba cómo responde tu agente de n8n a diferentes escenarios de integradores y clientes B2B.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlaygroundMessages([
                      {
                        id: 'p_reset',
                        sender: 'bot',
                        text: '👋 Sesión reiniciada. ¿Qué consulta deseas probar con el Agente n8n?',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
                  >
                    🔄 Reiniciar Chat de Prueba
                  </button>
                </div>

                {/* Quick Test Prompt Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {[
                    '¿Qué stock tienen de Fortinet FortiGate 60F?',
                    'Recomiéndame switches Aruba PoE para oficina',
                    '¿Cómo registro mi empresa como distribuidor?',
                    '¿Cuáles son las formas de pago en USD y ARS?'
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePlaygroundSend(p)}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>

                {/* Playground Chat Container */}
                <div style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  background: '#F8FAFC',
                  height: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Messages */}
                  <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {playgroundMessages.map((m) => {
                      const isBot = m.sender === 'bot';
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isBot ? 'flex-start' : 'flex-end',
                            gap: '4px'
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '85%',
                              padding: '12px 16px',
                              borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                              background: isBot ? '#FFFFFF' : '#0fa4de',
                              color: isBot ? '#1E293B' : '#FFFFFF',
                              fontSize: '13px',
                              lineHeight: '1.45',
                              border: isBot ? '1px solid #E2E8F0' : 'none',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                          >
                            {m.text}

                            {/* Product Recommendations */}
                            {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1' }}>
                                  📦 Hardware Conciliado:
                                </div>
                                {m.recommendedProducts.map(p => (
                                  <div key={p.id} style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '6px 10px', borderRadius: '8px', fontSize: '11.5px', color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '700' }}>{p.name}</span>
                                    <span style={{ color: '#0284c7', fontWeight: '800' }}>USD ${Number(p.price || 0).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {m.toolUsed && (
                              <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#64748B', display: 'flex', gap: '10px' }}>
                                <span>🛠️ Tool: <code>{m.toolUsed}</code></span>
                                {m.latencyMs && <span>⚡ {m.latencyMs} ms</span>}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '10px', color: '#94A3B8', padding: '0 4px' }}>
                            {m.timestamp}
                          </span>
                        </div>
                      );
                    })}

                    {isPlaygroundTyping && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '14px', width: 'fit-content' }}>
                        <span style={{ fontSize: '11.5px', color: '#0fa4de', fontWeight: '700' }}>Agente n8n ejecutando LangChain</span>
                        <span>⏳</span>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePlaygroundSend();
                    }}
                    style={{
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="text"
                      value={playgroundInput}
                      onChange={(e) => setPlaygroundInput(e.target.value)}
                      placeholder="Escribe una pregunta para probar el agente de IA..."
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                    />
                    <button
                      type="submit"
                      disabled={!playgroundInput.trim() || isPlaygroundTyping}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: playgroundInput.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Enviar ➤
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── SUBTAB 3: WORKFLOW OFICIAL N8N (JSON) ── */}
            {n8nSubTab === 'workflow' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📦</span> Plantilla de Flujo Oficial para Importar en n8n
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                      Descarga o copia el JSON preconfigurado con Webhook Trigger, AI Agent, Tools de Catálogo y Memoria Buffer.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const jsonStr = JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2);
                        navigator.clipboard.writeText(jsonStr);
                        alert('¡Workflow JSON de n8n copiado al portapapeles! Ahora en n8n puedes pulsar Ctrl+V / Cmd+V o "Import from Clipboard".');
                      }}
                      style={{ background: '#0fa4de', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📋 Copiar JSON al Portapapeles
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const jsonStr = JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2);
                        const blob = new Blob([jsonStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'dacas_b2b_n8n_workflow.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={{ background: '#0284c7', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📥 Descargar .json
                    </button>
                  </div>
                </div>

                {/* Quick Steps Guide */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>1. Importar en n8n</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>En tu canvas de n8n, haz click en <strong>Import from File</strong> y sube el archivo descargado.</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>2. Conectar tu LLM</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Configura tu credencial de <strong>OpenAI, Anthropic o Gemini</strong> en el nodo Chat Model.</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A', marginBottom: '4px' }}>3. Activar Webhook</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Pasa el flujo a <strong>Active</strong> y pega la URL del Webhook en la pestaña de Configuración.</div>
                  </div>
                </div>

                {/* Code Viewer */}
                <div style={{ background: '#0b1329', padding: '16px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: '#94a3b8', fontSize: '11.5px', fontFamily: 'monospace' }}>
                    <span>dacas_b2b_n8n_workflow.json</span>
                    <span>{(JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE).length / 1024).toFixed(1)} KB</span>
                  </div>
                  <pre style={{ margin: 0, maxHeight: '300px', overflowY: 'auto', color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace', lineHeight: '1.4' }}>
                    {JSON.stringify(n8nWorkflow || DEFAULT_N8N_WORKFLOW_TEMPLATE, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* ── SUBTAB 4: LOGS & AUDITORÍA ── */}
            {n8nSubTab === 'logs' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📊</span> Registro de Consultas y Trazabilidad de Agentes ({n8nLogs.length})
                  </h3>
                  <button
                    type="button"
                    onClick={fetchN8nLogs}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '750', cursor: 'pointer', color: '#334155' }}
                  >
                    🔄 Actualizar Historial
                  </button>
                </div>

                {n8nLogs.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    No hay conversaciones registradas aún.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Fecha & Hora</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Usuario / Integrador</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Pregunta / Prompt</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Respuesta del Agente</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Herramienta</th>
                          <th style={{ padding: '10px 12px', fontWeight: '800' }}>Latencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {n8nLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: '750', color: '#0F172A' }}>
                              {log.user}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#334155', maxWidth: '220px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {log.query}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748B', maxWidth: '280px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {log.response}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700' }}>
                                {log.toolUsed}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748B', fontFamily: 'monospace' }}>
                              {log.latencyMs} ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </section>
        )}

      </main>

      {/* ── USER PROFILE MODAL: FICHA CORPORATIVA B2B ── */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '980px',
              width: '95%',
              borderRadius: '24px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#0a192f'
            }}
          >
            {/* ── Header Bar ── */}
            <div style={{
              background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
              color: '#ffffff',
              padding: '24px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              borderBottom: '1px solid rgba(15, 164, 222, 0.25)'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '900',
                  boxShadow: '0 6px 18px rgba(15, 164, 222, 0.35)',
                  flexShrink: 0
                }}>
                  {(selectedUser.razon_social || selectedUser.name || 'C').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
                      {selectedUser.razon_social || selectedUser.name}
                    </h2>
                    <span style={{
                      background: selectedUser.status === 'activo' ? '#DCFCE7' : selectedUser.status === 'pendiente' ? '#FEF3C7' : '#FEE2E2',
                      color: selectedUser.status === 'activo' ? '#166534' : selectedUser.status === 'pendiente' ? '#92400E' : '#991B1B',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedUser.status === 'activo' ? '#16a34a' : selectedUser.status === 'pendiente' ? '#d97706' : '#dc2626' }}></span>
                      {selectedUser.status === 'activo' ? 'Cuenta Activa' : selectedUser.status === 'pendiente' ? 'Pendiente Aprobación' : 'Suspendido'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#94A3B8', flexWrap: 'wrap' }}>
                    <span>ID Cliente: <strong style={{ color: '#E2E8F0' }}>#{selectedUser.id}</strong></span>
                    <span>•</span>
                    <span>✉️ <strong style={{ color: '#E2E8F0' }}>{selectedUser.email}</strong></span>
                    {selectedUser.tipo_cliente && (
                      <>
                        <span>•</span>
                        <span style={{ background: 'rgba(15, 164, 222, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' }}>
                          🏢 {selectedUser.tipo_cliente}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {selectedUser.status === 'pendiente' && (
                  <button
                    onClick={() => {
                      handleApproveUser(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ✓ Aprobar Cuenta
                  </button>
                )}
                <button
                  onClick={() => {
                    handleEditUser(selectedUser);
                    setShowUserModal(false);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#ffffff',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: '#64748B'
                  }}
                  title="Cerrar"
                >
                  <BrandingVectorIcon name="x" size={18} color="#64748B" />
                </button>
              </div>
            </div>

            {/* ── Scrollable Body Content ── */}
            <div style={{ padding: '24px 30px', maxHeight: '74vh', overflowY: 'auto', background: '#F8FAFC' }}>
              
              {/* Grid 1: Datos Fiscales & Comerciales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                {/* Card 1: Identificación Comercial */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📊</span> Perfil Comercial & Legal
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Razón Social:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.razon_social || selectedUser.name || '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Tipo de Cliente:</span>
                      <strong style={{ color: '#0284c7', fontWeight: '700' }}>{selectedUser.tipo_cliente || 'Integrador IT / Reseller'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>País Operación:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.country_name || countries.find(c => c.id === selectedUser.country_id)?.name || 'Argentina'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Teléfono:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.phone ? <a href={`tel:${selectedUser.phone}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '700' }}>{selectedUser.phone}</a> : '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Sitio Web:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.web ? <a href={selectedUser.web.startsWith('http') ? selectedUser.web : `https://${selectedUser.web}`} target="_blank" rel="noreferrer" style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '700' }}>{selectedUser.web}</a> : '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Límite Facturación:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.fecha_limite_facturacion ? new Date(selectedUser.fecha_limite_facturacion).toLocaleDateString() : '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Card 2: Datos Impositivos & Fiscales */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🧾</span> Condición Fiscal & Asignación
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>CUIT / NIT / RUT:</span>
                      <span style={{ background: '#071524', color: '#38bdf8', padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.05em', fontWeight: '800', fontSize: '12px' }}>
                        {selectedUser.numero_nit || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Condición IVA:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.tipo_iva || 'Responsable Inscripto'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Vendedor Asignado:</span>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                        {selectedUser.vendedor || 'Equipo Comercial DACAS'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '7px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Reporta a País:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{countries.find(c => c.id === selectedUser.report_to_country_id)?.name || 'DACAS Casa Central'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Fecha Registro:</span>
                      <strong style={{ color: '#0F172A', fontWeight: '700' }}>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : '—'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Ubicaciones (Legal y Despacho) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                {/* Dirección Legal */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏛️</span> Domicilio Legal / Fiscal
                  </div>
                  {selectedUser.direccion_legal ? (
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13.5px' }}>{selectedUser.direccion_legal}</div>
                      <div style={{ color: '#64748B' }}>
                        {[selectedUser.localidad, selectedUser.ciudad].filter(Boolean).join(', ')}
                        {selectedUser.codigo_postal ? ` (CP ${selectedUser.codigo_postal})` : ''}
                      </div>
                      <div style={{ color: '#0284c7', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🌎</span> {selectedUser.country_name || countries.find(c => c.id === selectedUser.country_id)?.name || 'Argentina'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📍</span> No se ha registrado domicilio fiscal específico.
                    </div>
                  )}
                </div>

                {/* Dirección de Entrega */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🚚</span> Dirección de Entrega / Despacho
                  </div>
                  {selectedUser.direccion_entrega ? (
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13.5px' }}>{selectedUser.direccion_entrega}</div>
                      <div style={{ color: '#64748B' }}>
                        {[selectedUser.localidad_entrega, selectedUser.ciudad_entrega].filter(Boolean).join(', ')}
                        {selectedUser.codigo_postal_entrega ? ` (CP ${selectedUser.codigo_postal_entrega})` : ''}
                      </div>
                      <div style={{ color: '#0284c7', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🌎</span> {countries.find(c => c.id === selectedUser.pais_entrega_id)?.name || selectedUser.country_name || 'Mismo país legal'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📦</span> Misma que dirección legal o a convenir por pedido.
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Percepciones y Retenciones IIBB (Argentina) */}
              {((selectedUser.country_id === 2 || selectedUser.country_name === 'Argentina' || !selectedUser.country_id) && (
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏛️</span> Percepciones & Retenciones IIBB (Argentina)
                    </div>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      Jurisdicción: {selectedUser.iibb_jurisdiccion || '901 - Capital Federal'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px', fontSize: '12.5px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Inscripción IIBB:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedUser.iibb_tipo || 'C.M.'} — {selectedUser.iibb_numero || selectedUser.numero_nit || '—'}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Código de Aceptación:</span>
                      <strong style={{ color: selectedUser.iibb_codigo_aceptacion ? '#16a34a' : '#94a3b8' }}>
                        {selectedUser.iibb_codigo_aceptacion ? '✓ Aceptado / Homologado' : '✗ No informado'}
                      </strong>
                    </div>
                  </div>

                  {/* Listado de Percepciones configuradas */}
                  {(() => {
                    let percs = selectedUser.percepciones;
                    if (typeof percs === 'string') {
                      try { percs = JSON.parse(percs); } catch (_) { percs = null; }
                    }
                    if (!percs) return <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Sin percepciones configuradas.</div>;

                    const provs = [
                      { key: 'caba', name: 'CABA', ...percs.caba },
                      { key: 'bsas', name: 'Bs. As. (ARBA)', ...percs.bsas },
                      { key: 'salta', name: 'Salta', ...percs.salta },
                      { key: 'misiones', name: 'Misiones', ...percs.misiones },
                      { key: 'tucuman', name: 'Tucumán', ...percs.tucuman },
                    ];

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                        {provs.map(p => {
                          const isActive = p.enabled && parseFloat(p.alicuota) > 0;
                          return (
                            <div key={p.key} style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: isActive ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                              background: isActive ? '#f0f9ff' : '#ffffff'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '12px', color: '#0f172a' }}>{p.name}</strong>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: isActive ? '#0284c7' : '#94a3b8' }}>
                                  {isActive ? 'ACTIVA' : 'INACTIVA'}
                                </span>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: isActive ? '#0369a1' : '#64748b' }}>
                                {parseFloat(p.alicuota || 0).toFixed(4)}%
                              </div>
                              {p.coef ? <div style={{ fontSize: '10.5px', color: '#64748b' }}>Coef: {p.coef}</div> : null}
                              {p.vigencia ? <div style={{ fontSize: '10px', color: '#94a3b8' }}>Vto: {p.vigencia}</div> : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ))}

              {/* Grid 3: Contactos Designados */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👥</span> Contactos Clave Designados
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {/* Compras */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🛒</span>
                      <span style={{ fontWeight: '800', fontSize: '11px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contacto Compras</span>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                      {selectedUser.nombre_compras || 'Sin especificar'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedUser.telefono_compras && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_compras}</strong></div>}
                      {selectedUser.email_compras && <div>✉️ <a href={`mailto:${selectedUser.email_compras}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_compras}</a></div>}
                      {!selectedUser.telefono_compras && !selectedUser.email_compras && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                    </div>
                  </div>

                  {/* Pagos */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>💳</span>
                      <span style={{ fontWeight: '800', fontSize: '11px', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pagos / Tesorería</span>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                      {selectedUser.nombre_pagos || 'Sin especificar'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedUser.telefono_pagos && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_pagos}</strong></div>}
                      {selectedUser.email_pagos && <div>✉️ <a href={`mailto:${selectedUser.email_pagos}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_pagos}</a></div>}
                      {!selectedUser.telefono_pagos && !selectedUser.email_pagos && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                    </div>
                  </div>

                  {/* Administración */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>👔</span>
                      <span style={{ fontWeight: '800', fontSize: '11px', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Administración / Dirección</span>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                      {selectedUser.nombre_admin || 'Sin especificar'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedUser.telefono_admin && <div>📞 <strong style={{ color: '#0F172A' }}>{selectedUser.telefono_admin}</strong></div>}
                      {selectedUser.email_admin && <div>✉️ <a href={`mailto:${selectedUser.email_admin}`} style={{ color: '#0fa4de', textDecoration: 'none', fontWeight: '600' }}>{selectedUser.email_admin}</a></div>}
                      {!selectedUser.telefono_admin && !selectedUser.email_admin && <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin datos de contacto</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 4.5: Cuentas de Usuarios Vinculadas a esta Empresa */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👥</span> Usuarios con Acceso al Shop ({selectedUser.company_users?.length || 1})
                  </div>
                  <button
                    onClick={() => {
                      handleOpenAddUserToCompany(selectedUser);
                      setShowUserModal(false);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(15, 164, 222, 0.3)'
                    }}
                  >
                    ➕ Agregar Usuario a esta Empresa
                  </button>
                </div>

                <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: 0, border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <table className="users-table" style={{ width: '100%', minWidth: '650px', fontSize: '12.5px', margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>Usuario / Contacto</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Email (LogIn)</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Cargo / Función</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Teléfono</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Estado</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedUser.company_users && selectedUser.company_users.length > 0 ? selectedUser.company_users : [selectedUser]).map(u => {
                        const isCurrentUser = u.id === selectedUser.id;
                        return (
                          <tr key={u.id} style={{ background: isCurrentUser ? 'rgba(15, 164, 222, 0.04)' : 'transparent' }}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: '#0F172A' }}>{u.name}</strong>
                                {isCurrentUser && (
                                  <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '10.5px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                                    Viendo
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ color: '#0fa4de', fontWeight: '600', wordBreak: 'break-all' }}>{u.email}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <span style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600' }}>
                                {u.cargo || 'Encargado de Compras'}
                              </span>
                            </td>
                            <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <span style={{
                                background: (u.status || 'activo') === 'activo' ? '#DCFCE7' : (u.status === 'pendiente' ? '#FEF3C7' : '#FEE2E2'),
                                color: (u.status || 'activo') === 'activo' ? '#166534' : (u.status === 'pendiente' ? '#92400E' : '#991B1B'),
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                {(u.status || 'activo') === 'activo' ? '🟢 Activo' : (u.status === 'pendiente' ? '🟡 Pendiente' : '🔴 Inactivo')}
                              </span>
                            </td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                  onClick={() => {
                                    handleEditUser(u);
                                    setShowUserModal(false);
                                  }}
                                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#334155', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: '600' }}
                                  title="Editar este usuario"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(u.id, (u.status || 'activo') === 'activo' ? 'inactivo' : 'activo')}
                                  style={{
                                    background: (u.status || 'activo') === 'activo' ? '#FEF2F2' : '#F0FDF4',
                                    border: '1px solid ' + ((u.status || 'activo') === 'activo' ? '#FECACA' : '#BBF7D0'),
                                    color: (u.status || 'activo') === 'activo' ? '#DC2626' : '#16A34A',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '11.5px',
                                    fontWeight: '600'
                                  }}
                                  title={(u.status || 'activo') === 'activo' ? 'Desactivar acceso' : 'Activar acceso'}
                                >
                                  {(u.status || 'activo') === 'activo' ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '4px 7px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px' }}
                                  title="Eliminar cuenta de usuario"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid 5: Historial de Órdenes */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📦</span> Historial de Órdenes y Cotizaciones ({selectedUser.orders?.length || 0})
                </div>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: 0, border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <table className="users-table" style={{ width: '100%', minWidth: '500px', fontSize: '12.5px', margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ whiteSpace: 'nowrap' }}>ID Orden</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Fecha</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Total (USD)</th>
                          <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.orders.map(o => (
                          <tr key={o.id}>
                            <td><strong>#{o.id}</strong></td>
                            <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                            <td><span style={{ fontWeight: '800', color: '#071524' }}>${o.total} USD</span></td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', ...statusStyle(o.status) }}>
                                {statusLabel(o.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '13px' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>🛒</span>
                    Este cliente aún no ha registrado órdenes de compra en la plataforma.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── BULK CSV PRODUCT UPLOAD MODAL ── */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => !bulkLoading && setShowBulkModal(false)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1000px',
              width: '95%',
              borderRadius: '24px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#0a192f'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
              color: '#ffffff',
              padding: '24px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(15, 164, 222, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
                }}>
                  📤
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Carga Masiva de Productos (CSV)
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#94A3B8' }}>
                    Importa o actualiza múltiples productos a tu catálogo B2B de forma masiva
                  </p>
                </div>
              </div>

              <button
                disabled={bulkLoading}
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  fontSize: '15px',
                  cursor: bulkLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title="Cerrar"
              >
                <BrandingVectorIcon name="x" size={16} color="#64748B" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '26px 30px', maxHeight: '74vh', overflowY: 'auto', background: '#F8FAFC' }}>
              
              {/* Step 1: Info & Template Download */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '26px' }}>📄</span>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '13.5px', display: 'block' }}>¿Primera vez cargando productos?</strong>
                    <span style={{ color: '#64748B', fontSize: '12.5px' }}>
                      Descarga nuestra plantilla oficial pre-formateada con ejemplos listos para Excel o Google Sheets.
                    </span>
                  </div>
                </div>
                <button
                  onClick={downloadSampleCSV}
                  style={{
                    background: '#F1F5F9',
                    color: '#0284c7',
                    border: '1px solid #CBD5E1',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
                >
                  📥 Descargar Plantilla CSV
                </button>
              </div>

              {/* Step 2: Drag and Drop Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true); }}
                onDragLeave={() => setBulkDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setBulkDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessCSVFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  background: bulkDragOver ? '#F0F9FF' : '#FFFFFF',
                  border: `2px dashed ${bulkDragOver ? '#0fa4de' : '#CBD5E1'}`,
                  borderRadius: '18px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '20px'
                }}
                onClick={() => document.getElementById('bulk-csv-input').click()}
              >
                <input
                  id="bulk-csv-input"
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessCSVFile(e.target.files[0]);
                    }
                  }}
                />
                <div style={{ fontSize: '38px', marginBottom: '10px' }}>
                  {bulkFile ? '📊' : '☁️'}
                </div>
                {bulkFile ? (
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '15px' }}>{bulkFile.name}</strong>
                    <span style={{ display: 'block', color: '#64748B', fontSize: '12px', marginTop: '4px' }}>
                      ({(bulkFile.size / 1024).toFixed(1)} KB) — Haz clic o arrastra otro archivo para reemplazar
                    </span>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '14.5px', display: 'block' }}>
                      Arrastra y suelta tu archivo .CSV aquí
                    </strong>
                    <span style={{ color: '#64748B', fontSize: '12.5px', marginTop: '4px', display: 'block' }}>
                      o haz clic para buscarlo en tu equipo (delimitado por coma, punto y coma o tabulador)
                    </span>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {bulkError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Result Success Alert */}
              {bulkResult && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  fontSize: '13.5px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '4px' }}>
                    <span>🎉</span> ¡Carga masiva procesada exitosamente!
                  </div>
                  <div>
                    Total analizados: <strong>{bulkResult.total}</strong> | Creados: <strong>{bulkResult.created}</strong> | Actualizados: <strong>{bulkResult.updated}</strong>
                  </div>
                </div>
              )}

              {/* Step 3: Data Preview & Import Mode */}
              {bulkData.length > 0 && (
                <div>
                  {/* Mode Selector & Stats Header */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>
                        {bulkData.length} productos detectados
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>
                        {bulkData.filter(d => d.isValid).length} válidos
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>
                        Comportamiento:
                      </label>
                      <select
                        value={bulkMode}
                        onChange={(e) => setBulkMode(e.target.value)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          fontSize: '12.5px',
                          fontWeight: '600'
                        }}
                      >
                        <option value="upsert">🔄 Actualizar existentes y Crear nuevos (Upsert)</option>
                        <option value="create_only">➕ Solo crear nuevos</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Vista Previa de Registros ({bulkData.length > 10 ? 'Primeros 10 de ' + bulkData.length : bulkData.length})
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        Revisa que las columnas coincidan correctamente antes de confirmar
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                      <table className="users-table" style={{ margin: 0, fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Estado</th>
                            <th>Producto</th>
                            <th>Marca</th>
                            <th>Categoría</th>
                            <th>SKU</th>
                            <th>Precio (USD)</th>
                            <th>Promo (USD)</th>
                            <th>Stock</th>
                            <th>Peso (kg)</th>
                            <th>Dimensiones (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.slice(0, 15).map((item, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                {item.isValid ? (
                                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                    ✓ Válido
                                  </span>
                                ) : (
                                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                    ⚠️ Incompleto
                                  </span>
                                )}
                              </td>
                              <td><strong style={{ color: '#0F172A' }}>{item.name}</strong></td>
                              <td>{item.brand || '—'}</td>
                              <td><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{item.category}</span></td>
                              <td style={{ fontFamily: 'monospace' }}>{item.sku || '—'}</td>
                              <td><strong>${item.price}</strong></td>
                              <td>{item.promotional_price ? <span style={{ color: '#10B981', fontWeight: '700' }}>${item.promotional_price}</span> : '—'}</td>
                              <td><strong style={{ color: item.stock > 0 ? '#166534' : '#DC2626' }}>{item.stock}</strong></td>
                              <td>{item.weight ? `${item.weight} kg` : '—'}</td>
                              <td>{(item.depth || item.width || item.height) ? `${item.depth || '0'} x ${item.width || '0'} x ${item.height || '0'}` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                    <button
                      disabled={bulkLoading}
                      onClick={() => {
                        setBulkData([]);
                        setBulkFile(null);
                        setBulkResult(null);
                      }}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#64748B',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Limpiar Selección
                    </button>
                    <button
                      disabled={bulkLoading || bulkData.length === 0}
                      onClick={handleConfirmBulkImport}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: bulkLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {bulkLoading ? (
                        <>⏳ Importando...</>
                      ) : (
                        <>🚀 Confirmar e Importar {bulkData.length} Productos</>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── ORDER DETAILS MODAL ── */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)} style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '960px',
              width: '95%',
              borderRadius: '24px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(15, 164, 222, 0.2)', border: '1px solid rgba(15, 164, 222, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandingVectorIcon name="ticket" size={20} color="#0FA4DE" />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Orden de Compra B2B #{selectedOrder.id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                    Registrada el {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('es-AR') : '—'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>Estado:</span>
                  <select
                    value={selectedOrder.status || 'procesando'}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: 'none',
                      ...statusStyle(selectedOrder.status)
                    }}
                  >
                    <option value="procesando">En Preparación</option>
                    <option value="en_camino">En Despacho</option>
                    <option value="entregado">Entregado</option>
                    <option value="paid">Pagado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowOrderModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BrandingVectorIcon name="x" size={16} color="#64748B" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              
              {/* Left Column: Products & Notes */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BrandingVectorIcon name="shopping-bag" size={15} color="#0FA4DE" />
                  <span>Productos Solicitados ({selectedOrder.items?.length || 1})</span>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#ffffff' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name || item.name} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BrandingVectorIcon name="box" size={18} color="#94A3B8" />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '12.5px' }}>{item.product_name || item.name}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', display: 'flex', gap: '6px' }}>
                            {item.brand && <span style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>{item.brand}</span>}
                            {item.sku && <span>SKU: {item.sku}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: '#071524', fontSize: '12.5px' }}>
                            ${parseFloat(item.price_at_purchase || item.price || 0).toFixed(2)} USD
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                            Cant: <strong>{item.quantity || item.qty || 1}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '14px', color: '#64748B', fontSize: '12px', textAlign: 'center' }}>
                      • Ítem de Hardware / Licenciamiento registrado en la orden
                    </div>
                  )}
                </div>

                {/* Logistics & Delivery Notes */}
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="truck" size={14} color="#0FA4DE" />
                    <span>Modalidad y Despacho</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                    <div><strong>Dirección:</strong> {selectedOrder.shipping_address || 'Dirección registrada en ficha de cliente'}</div>
                    <div><strong>Modalidad:</strong> {selectedOrder.shipping_method || 'Envío Express a Domicilio'}</div>
                    {selectedOrder.tracking_number && (
                      <div style={{ marginTop: '4px' }}>
                        <strong>Tracking:</strong>{' '}
                        <span style={{ fontFamily: 'monospace', background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                          {selectedOrder.tracking_number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CRM Ticket Integration Card */}
                <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', padding: '14px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '800', fontSize: '12px' }}>
                    <BrandingVectorIcon name="ticket" size={14} color="#166534" />
                    <span>Ticket Automático Generado en Operaciones CRM</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#15803D', lineHeight: '1.4' }}>
                    Esta orden sincronizó automáticamente la apertura de un ticket operativo en el departamento de <strong>Operaciones</strong> para control de stock, facturación y despacho logístico.
                  </p>
                </div>
              </div>

              {/* Right Column: Financial Breakdown & Invoicing */}
              <div>
                {/* Financial Summary */}
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="credit-card" size={15} color="#0FA4DE" />
                    <span>Resumen Financiero</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Subtotal Catálogo:</span>
                      <strong style={{ color: '#0F172A' }}>${parseFloat(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)} USD</strong>
                    </div>

                    {parseFloat(selectedOrder.discount_applied || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                        <span>Descuento B2B Aplicado:</span>
                        <strong>-${parseFloat(selectedOrder.discount_applied).toFixed(2)} USD</strong>
                      </div>
                    )}

                    {parseFloat(selectedOrder.tax_applied || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Impuestos / IVA:</span>
                        <strong style={{ color: '#0F172A' }}>+${parseFloat(selectedOrder.tax_applied).toFixed(2)} USD</strong>
                      </div>
                    )}

                    {parseFloat(selectedOrder.shipping_applied || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Costo de Envío / Seguro:</span>
                        <strong style={{ color: '#0F172A' }}>+${parseFloat(selectedOrder.shipping_applied).toFixed(2)} USD</strong>
                      </div>
                    )}

                    <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#071524' }}>Total Orden:</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#0FA4DE' }}>
                        ${parseFloat(selectedOrder.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invoicing & Client Info */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrandingVectorIcon name="building" size={14} color="#0FA4DE" />
                    <span>Datos Fiscales y Comerciales</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                    <div><strong>Razón Social:</strong> {selectedOrder.user_company || selectedOrder.user_name || 'Cliente B2B'}</div>
                    {selectedOrder.user_cuit && <div><strong>CUIT / NIT:</strong> {selectedOrder.user_cuit}</div>}
                    <div><strong>Email de Contacto:</strong> {selectedOrder.user_email}</div>
                    {selectedOrder.user_phone && <div><strong>Teléfono:</strong> {selectedOrder.user_phone}</div>}
                    <div><strong>Condición Comercial / Pago:</strong> {selectedOrder.payment_method || 'Cuenta Corriente Corporativa'}</div>
                    {selectedOrder.po_number && (
                      <div><strong>N° Orden de Compra Cliente:</strong> <span style={{ color: '#0FA4DE', fontWeight: '700' }}>{selectedOrder.po_number}</span></div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: '#071524',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREAR NUEVA MARCA ── */}
      {showNewBrandModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '600px', padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrandingVectorIcon name="plus" size={18} color="#0FA4DE" />
                <span>Crear y Asignar Nueva Marca</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewBrandModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="x" size={18} color="#94A3B8" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBrand}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Nombre de la Marca / Fabricante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cisco, Palo Alto Networks, APC, Motorola..."
                  value={newBrandForm.name}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Logo Upload & URL for New Brand */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Logotipo de la Marca (Imagen / SVG / PNG / WebP)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{
                    background: '#F1F5F9',
                    color: '#0284c7',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <BrandingVectorIcon name="upload" size={14} color="#0284c7" />
                    <span>{isUploadingBrandLogo ? 'Subiendo...' : 'Subir imagen...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadBrandLogo(e.target.files[0], true);
                        }
                      }}
                    />
                  </label>
                  {newBrandForm.logo && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>✓ Imagen cargada</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="O ingresa la URL de la imagen (https://...)"
                  value={newBrandForm.logo}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, logo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Tagline / Description for New Brand */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Descripción Comercial (Tagline de la tarjeta)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Soluciones de infraestructura de red y conmutación corporativa..."
                  value={newBrandForm.tagline}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, tagline: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '12.5px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category & Color */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Categoría del Shop *
                  </label>
                  <select
                    value={newBrandForm.category}
                    onChange={(e) => setNewBrandForm({ ...newBrandForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="networking">🌐 Networking</option>
                    <option value="infraestructura">⚡ Infraestructura</option>
                    <option value="comunicaciones_unificadas">📞 Comunicaciones Unificadas</option>
                    <option value="security">🛡️ Seguridad & Ciberseguridad</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Color Distintivo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={newBrandForm.color || '#0fa4de'}
                      onChange={(e) => setNewBrandForm({ ...newBrandForm, color: e.target.value })}
                      style={{ width: '38px', height: '36px', padding: 0, border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newBrandForm.color || '#0fa4de'}
                      onChange={(e) => setNewBrandForm({ ...newBrandForm, color: e.target.value })}
                      style={{ flex: 1, padding: '7px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Cobertura por País de la Marca
                </label>

                <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="newBrandGlobal"
                      checked={newBrandForm.isGlobal}
                      onChange={() => setNewBrandForm({ ...newBrandForm, isGlobal: true, countries: [] })}
                    />
                    🌐 Todos los Países (Global)
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="newBrandGlobal"
                      checked={!newBrandForm.isGlobal}
                      onChange={() => setNewBrandForm({ ...newBrandForm, isGlobal: false, countries: ['US', 'AR'] })}
                    />
                    🎯 Países Específicos
                  </label>
                </div>

                {!newBrandForm.isGlobal && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                        Selecciona los países donde se comercializa:
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setNewBrandForm({ ...newBrandForm, countries: DACAS_COUNTRIES_LIST.map(c => c.code) })}
                          style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewBrandForm({ ...newBrandForm, countries: [] })}
                          style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Ninguno
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                      {DACAS_COUNTRIES_LIST.map(c => {
                        const checked = newBrandForm.countries.includes(c.code);
                        return (
                          <label
                            key={c.code}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 10px',
                              background: checked ? '#E0F2FE' : '#FFFFFF',
                              border: `1px solid ${checked ? '#0284c7' : '#E2E8F0'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: checked ? '700' : '500',
                              color: checked ? '#0369A1' : '#334155'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const updated = checked
                                  ? newBrandForm.countries.filter(x => x !== c.code)
                                  : [...newBrandForm.countries, c.code];
                                setNewBrandForm({ ...newBrandForm, countries: updated });
                              }}
                            />
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewBrandModal(false)}
                  style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 3px 10px rgba(15, 164, 222, 0.3)' }}
                >
                  Crear Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR MARCA OFICIAL, LOGO, DESCRIPCIÓN & COBERTURA ── */}
      {editingBrandModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '840px', padding: '26px 28px', borderRadius: '20px', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🏷️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                    Editar Marca Oficial: <span style={{ color: '#0284c7' }}>{editingBrandModal.name}</span>
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Personaliza el logotipo, descripción comercial (tagline), color y presencia regional para el Shop.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBrandModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="x" size={20} color="#94A3B8" />
              </button>
            </div>

            <form onSubmit={handleSaveBrandModal}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px', marginBottom: '20px' }}>
                {/* Left Column: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Brand Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Nombre Oficial de la Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBrandModal.name}
                      onChange={(e) => setEditingBrandModal({ ...editingBrandModal, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Brand Logo: Upload & URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Logotipo de la Marca (Imagen / SVG / PNG / WebP)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{
                        background: '#F1F5F9',
                        color: '#0284c7',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <BrandingVectorIcon name="upload" size={14} color="#0284c7" />
                        <span>{isUploadingBrandLogo ? 'Subiendo...' : 'Subir archivo...'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadBrandLogo(e.target.files[0], false);
                            }
                          }}
                        />
                      </label>
                      {editingBrandModal.logo && (
                        <button
                          type="button"
                          onClick={() => setEditingBrandModal({ ...editingBrandModal, logo: '' })}
                          style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✕ Quitar logo
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="O ingresa la URL de la imagen (https://... o data:image/...)"
                      value={editingBrandModal.logo || ''}
                      onChange={(e) => setEditingBrandModal({ ...editingBrandModal, logo: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', color: '#334155' }}
                    />
                  </div>

                  {/* Brand Tagline / Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Descripción Comercial (Tagline de la tarjeta en el Shop) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ej: Seguridad de Red Convergente y Firewalls NGFW FortiGate..."
                      value={editingBrandModal.tagline || ''}
                      onChange={(e) => setEditingBrandModal({ ...editingBrandModal, tagline: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '12.5px', lineHeight: 1.4, resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Plantillas:</span>
                      {[
                        'Puntos de Acceso Wi-Fi 6 y Switching Corporativo Cloud',
                        'Seguridad de Red Convergente y Firewalls NGFW',
                        'Líder en Contact Center y Comunicaciones Unificadas',
                        'Climatización Crítica Liebert, UPS y Micro-Datacenters',
                        'Routers, Switches de alta capacidad y RouterOS'
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditingBrandModal({ ...editingBrandModal, tagline: tpl })}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '2px 7px',
                            fontSize: '10.5px',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {tpl.slice(0, 24)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category & Color row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Área Tecnológica
                      </label>
                      <select
                        value={editingBrandModal.catKey || 'networking'}
                        onChange={(e) => setEditingBrandModal({ ...editingBrandModal, catKey: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                      >
                        <option value="networking">🌐 Networking</option>
                        <option value="infraestructura">⚡ Infraestructura</option>
                        <option value="comunicaciones_unificadas">📞 Comunicaciones Unificadas</option>
                        <option value="security">🛡️ Ciberseguridad</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Color Distintivo
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={editingBrandModal.color || '#0fa4de'}
                          onChange={(e) => setEditingBrandModal({ ...editingBrandModal, color: e.target.value })}
                          style={{ width: '38px', height: '36px', padding: 0, border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={editingBrandModal.color || '#0fa4de'}
                          onChange={(e) => setEditingBrandModal({ ...editingBrandModal, color: e.target.value })}
                          style={{ flex: 1, padding: '7px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Shop Card Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👁️</span> VISTA PREVIA EN TIENDA (SHOP CARD)
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '22px',
                    border: `2px solid ${editingBrandModal.color || '#0fa4de'}`,
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '230px'
                  }}>
                    <div>
                      {/* Logo & Product count badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          background: 'rgba(15, 164, 222, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          <BrandLogoImg
                            src={editingBrandModal.logo}
                            alt={editingBrandModal.name}
                            name={editingBrandModal.name}
                            color={editingBrandModal.color}
                            size={36}
                          />
                        </div>
                        <span style={{
                          background: 'rgba(15, 164, 222, 0.1)',
                          color: editingBrandModal.color || '#0fa4de',
                          fontWeight: '800',
                          fontSize: '11.5px',
                          padding: '5px 12px',
                          borderRadius: '999px',
                          border: `1px solid ${editingBrandModal.color || '#0fa4de'}33`
                        }}>
                          1 Producto
                        </span>
                      </div>

                      {/* Brand Name & Tagline */}
                      <h4 style={{ margin: '0 0 6px', fontSize: '1.22rem', fontWeight: '800', color: '#071524' }}>
                        {editingBrandModal.name || 'Nombre de la Marca'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.45 }}>
                        {editingBrandModal.tagline || 'Descripción o soluciones que ofrece esta marca...'}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9', marginTop: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>
                        Garantía Directa DACAS
                      </span>
                      <span style={{ color: editingBrandModal.color || '#0fa4de', fontSize: '12.5px', fontWeight: '800' }}>
                        Ver Productos →
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                    Esta es exactamente la tarjeta que tus clientes verán en el catálogo y directorio de marcas.
                  </div>
                </div>
              </div>

              {/* Country Coverage Section */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Cobertura Regional de la Marca
                </div>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="editBrandGlobal"
                      checked={editingBrandModal.isGlobal || !editingBrandModal.countries || editingBrandModal.countries.length === 0}
                      onChange={() => setEditingBrandModal({ ...editingBrandModal, isGlobal: true, countries: [] })}
                    />
                    🌐 Habilitar en TODOS los Países (Global)
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="editBrandGlobal"
                      checked={!editingBrandModal.isGlobal && editingBrandModal.countries && editingBrandModal.countries.length > 0}
                      onChange={() => setEditingBrandModal({ ...editingBrandModal, isGlobal: false, countries: editingBrandModal.countries?.length > 0 ? editingBrandModal.countries : ['US', 'AR', 'CL'] })}
                    />
                    🎯 Restringir a Países Específicos
                  </label>
                </div>

                {!editingBrandModal.isGlobal && editingBrandModal.countries && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', marginTop: '8px' }}>
                    {DACAS_COUNTRIES_LIST.map(c => {
                      const checked = editingBrandModal.countries.includes(c.code);
                      return (
                        <label
                          key={c.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 8px',
                            background: checked ? '#E0F2FE' : '#FFFFFF',
                            border: `1px solid ${checked ? '#0284c7' : '#E2E8F0'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            fontWeight: checked ? '700' : '500',
                            color: checked ? '#0369A1' : '#334155'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const updated = checked
                                ? editingBrandModal.countries.filter(x => x !== c.code)
                                : [...editingBrandModal.countries, c.code];
                              setEditingBrandModal({ ...editingBrandModal, countries: updated });
                            }}
                          />
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBrandModal(null)}
                  style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 3px 10px rgba(15, 164, 222, 0.3)' }}
                >
                  Guardar Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminEcommerce;


