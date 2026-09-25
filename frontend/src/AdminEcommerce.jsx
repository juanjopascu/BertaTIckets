import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import AdminProductFormTiendanube from './AdminProductFormTiendanube';

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
const MOCK_COUNTRIES = [];
const MOCK_USERS = [];
const MOCK_RULES = [];

function AdminEcommerce() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [countries, setCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

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

  const filteredOrders = orders.filter(o => {
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
    const q = (productSearch || '').toLowerCase();
    const matchSearch = !productSearch ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    const matchCat = !selectedCategory || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) || (Array.isArray(p.categories) && p.categories.includes(selectedCategory));
    const matchStock = filterStock === 'all' || (filterStock === 'in_stock' && Number(p.stock) > 0) || (filterStock === 'out_of_stock' && Number(p.stock) === 0);
    return matchSearch && matchCat && matchStock;
  });

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
  const initialUserForm = {
    name: '', email: '', password: '', status: 'activo',
    razon_social: '', tipo_cliente: 'Reseller / Integrador IT', direccion_legal: '', localidad: '', codigo_postal: '', ciudad: '', country_id: '', phone: '', fecha_limite_facturacion: '', web: '',
    report_to_country_id: '', vendedor: '', direccion_entrega: '', localidad_entrega: '', codigo_postal_entrega: '', ciudad_entrega: '', pais_entrega_id: '', tipo_iva: '', numero_nit: '',
    nombre_compras: '', telefono_compras: '', email_compras: '',
    nombre_pagos: '', telefono_pagos: '', email_pagos: '',
    nombre_admin: '', telefono_admin: '', email_admin: '',
    email_factura_electronica: '', email_contacto_compras: '', email_cotizaciones_automaticas: ''
  };
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userFormSection, setUserFormSection] = useState(1);

  // RULES Form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const initialRuleForm = {
    name: '', rule_type: 'discount', value_type: 'percentage', value: '',
    tipo_cliente: '', brand: '', country_id: '', product_id: '', user_id: '',
    priority: '0', is_active: true
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

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCountries();
    fetchUsers();
    fetchRules();
    fetchVisualSettings();
  }, []);

  const fetchVisualSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual`);
      if (res.ok) {
        const data = await res.json();
        setVisualConfig(data);
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
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(visualConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar diseño');
      setVisualConfig(data.config || visualConfig);
      setVisualSaveSuccess(true);
      setTimeout(() => setVisualSaveSuccess(false), 4000);
    } catch (err) {
      alert('Error guardando personalización: ' + err.message);
    } finally {
      setIsSavingVisual(false);
    }
  };

  const handleResetVisualSettings = async () => {
    if (!window.confirm('¿Deseas restaurar la configuración visual a la plantilla oficial de DACAS?')) return;
    setIsSavingVisual(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual/reset`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setVisualConfig(data.config);
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
      id: Date.now(),
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
    setEditingSlideIdx(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index, direction) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;
    setVisualConfig({ ...visualConfig, heroSlides: slides });
    setEditingSlideIdx(targetIdx);
  };

  const handleUpdateSlideField = (index, field, value) => {
    if (!visualConfig || !visualConfig.heroSlides) return;
    const slides = [...visualConfig.heroSlides];
    slides[index] = { ...slides[index], [field]: value };
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
    const metrics = [...(slides[slideIdx].metrics || [])];
    metrics[metricIdx] = { ...metrics[metricIdx], [field]: value };
    slides[slideIdx] = { ...slides[slideIdx], metrics };
    setVisualConfig({ ...visualConfig, heroSlides: slides });
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) && data.length > 0 ? data : MOCK_PRODUCTS);
    } catch {
      setProducts(MOCK_PRODUCTS);
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users`);
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
    const url = editingProduct
      ? `${API_BASE_URL}/api/ecommerce/admin/products/${editingProduct.id}`
      : `${API_BASE_URL}/api/ecommerce/admin/products`;
    const method = editingProduct ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al guardar el producto');
    resetProductForm();
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchProducts();
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

  // ── User / Customer Methods ──
  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setEditingUser(null);
    setShowUserForm(false);
    setUserFormSection(1);
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

  const handleEditUser = async (u) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/users/${u.id}`);
      if (res.ok) {
        const data = await res.json();
        const safeData = { ...initialUserForm, ...data, password: '' };
        if (safeData.fecha_limite_facturacion) safeData.fecha_limite_facturacion = safeData.fecha_limite_facturacion.split('T')[0];
        setUserForm(safeData);
        setEditingUser(u);
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
      priority: rule.priority || '0',
      is_active: rule.is_active !== undefined ? rule.is_active : true
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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar regla');
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

  // ─────────────────────── REPORTING CALCULATIONS ───────────────────────
  const totalRevenue = orders.filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
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
    orders.forEach(o => {
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
      products.map(p => [p.id, p.name, p.brand || '', p.category || 'General', p.sku || '', `$${p.price}`, p.promotional_price ? `$${p.promotional_price}` : '', p.stock, p.description || '', p.image_url || '']),
      ['ID', 'Nombre', 'Marca', 'Categoria', 'SKU', 'Precio_USD', 'Precio_Promo_USD', 'Stock', 'Descripcion', 'URL_Imagen'],
      'productos_catalogo_dacas.csv'
    );
  };

  const downloadSampleCSV = () => {
    const headers = ['Nombre', 'Marca', 'Categoria', 'SKU', 'Precio_USD', 'Precio_Promo_USD', 'Stock', 'Descripcion', 'URL_Imagen'];
    const sampleRows = [
      [
        'Fortinet FortiGate 60F NGFW',
        'Fortinet',
        'security',
        'FG-60F-BDL-950-12',
        '890.00',
        '845.00',
        '45',
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

      parsedItems.push({
        id_temp: i,
        name,
        brand,
        category: category || 'General',
        sku,
        price,
        promotional_price,
        stock,
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="crm-container">
      <style>{`
        .tab-buttons { display:flex; flex-wrap: wrap; background:rgba(120,120,128,0.08); border-radius:16px; padding:4px; margin-bottom:24px; gap:4px; }
        .tab-btn { flex:1; min-width:120px; background:transparent; border:none; padding:12px 16px; font-weight:600; font-size:0.9rem; color:#8e8e93; border-radius:12px; cursor:pointer; transition:all 0.25s; }
        .tab-btn.active { background:white; color:#000; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
        [data-theme="dark"] .tab-btn.active { background:var(--card-bg); color:var(--text-main); }
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
              <div style={{
                background: 'var(--pill-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <span>🇦🇷</span>
                <span>DACAS Argentina</span>
              </div>

              <div className="user-controls">
                {activeTab === 'reportes' && (
                  <button className="nav-btn" onClick={() => window.print()} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                    🖨️ Imprimir / PDF
                  </button>
                )}
                <button className="nav-btn" onClick={() => navigate('/')}>🔙 Dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="crm-main">
        <div className="tab-buttons">
          <button className={`tab-btn${activeTab === 'products' ? ' active' : ''}`} onClick={() => setActiveTab('products')}>📦 Productos</button>
          <button className={`tab-btn${activeTab === 'countries' ? ' active' : ''}`} onClick={() => setActiveTab('countries')}>🌍 Países</button>
          <button className={`tab-btn${activeTab === 'rules' ? ' active' : ''}`} onClick={() => setActiveTab('rules')}>🎯 Reglas (Precios)</button>
          <button className={`tab-btn${activeTab === 'users' ? ' active' : ''}`} onClick={() => setActiveTab('users')} style={{ position: 'relative' }}>
            👥 Clientes
            {users.filter(u => u.status === 'pendiente').length > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '999px',
                marginLeft: '8px',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)'
              }}>
                {users.filter(u => u.status === 'pendiente').length} pend.
              </span>
            )}
          </button>
          <button className={`tab-btn${activeTab === 'orders' ? ' active' : ''}`} onClick={() => setActiveTab('orders')}>📋 Órdenes</button>
          <button className={`tab-btn${activeTab === 'reportes' ? ' active' : ''}`} onClick={() => setActiveTab('reportes')}>📊 Reportería</button>
          <button className={`tab-btn${activeTab === 'visual' ? ' active' : ''}`} onClick={() => setActiveTab('visual')}>🎨 Personalización Shop</button>
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
            />
          ) : (
            <section className="board-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Catálogo de Productos</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#6b7280' }}>
                    Gestiona tu catálogo, fotos, descripciones enriquecidas, precios y stock.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="nav-btn"
                    style={{ background: 'var(--card-bg)' }}
                    onClick={exportProductsCSV}
                    title="Exportar todos los productos actuales a un archivo CSV"
                  >
                    📥 Exportar CSV
                  </button>
                  <button
                    className="nav-btn"
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(15, 164, 222, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => {
                      setShowBulkModal(true);
                      setBulkData([]);
                      setBulkFile(null);
                      setBulkResult(null);
                      setBulkError(null);
                    }}
                  >
                    📤 Carga Masiva (CSV)
                  </button>
                  <button className="nav-btn" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                    ➕ Nuevo Producto
                  </button>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, SKU, marca..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    flex: '1 1 240px',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="all">Todo el Stock</option>
                  <option value="in_stock">En Stock (&gt; 0)</option>
                  <option value="out_of_stock">Sin Stock (0)</option>
                </select>
                <button
                  className="nav-btn"
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  onClick={() => { setProductSearch(''); setSelectedCategory(''); setFilterStock('all'); }}
                >
                  ✕ Limpiar
                </button>
              </div>

              {/* Tabla de Productos */}
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Categoría</th>
                    <th>Precio Base</th>
                    <th>Precio Promo</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const discount = p.promotional_price && Number(p.price) > 0
                      ? Math.round((1 - Number(p.promotional_price) / Number(p.price)) * 100)
                      : null;
                    return (
                      <tr key={p.id}>
                        <td style={{ width: '56px' }}>
                          <img
                            src={(p.images && p.images[0]) || p.image_url || 'https://placehold.co/50x50/f1f5f9/94a3b8?text=Foto'}
                            alt={p.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/50x50/f1f5f9/94a3b8?text=Foto'; }}
                          />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          {p.badge && (
                            <span style={{
                              marginLeft: '8px',
                              background: p.badgeColor || '#0fa4de',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                        <td>{p.category || 'General'}</td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td>
                          {p.promotional_price ? (
                            <span style={{ color: '#10b981', fontWeight: '700' }}>
                              ${Number(p.promotional_price).toFixed(2)}
                              {discount && <small style={{ marginLeft: '4px', background: '#dcfce7', color: '#16a34a', padding: '1px 4px', borderRadius: '4px', fontSize: '10px' }}>-{discount}%</small>}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: p.stock > 10 ? '#dcfce7' : p.stock > 0 ? '#fef3c7' : '#fee2e2',
                            color: p.stock > 10 ? '#16a34a' : p.stock > 0 ? '#d97706' : '#dc2626'
                          }}>
                            {p.stock ?? 0} u.
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                              style={{ background: '#0fa4de', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => openStockModal(p)}
                              style={{ background: '#6366f1', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Stock Países
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )
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

            <table className="users-table">
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
          </section>
        )}

        {/* ═══════════════ RULES ═══════════════ */}
        {activeTab === 'rules' && (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Motor de Reglas de Precios y Descuentos</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#6b7280' }}>
                  Aplica descuentos globales, por producto, país o cliente específico con prioridades.
                </p>
              </div>
              <button className="nav-btn" onClick={() => setShowRuleForm(true)}>➕ Nueva Regla</button>
            </div>

            {showRuleForm && (
              <div style={{ background: '#FFFFFF', padding: '24px 28px', borderRadius: '18px', marginBottom: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#071524' }}>
                    {editingRule ? '✏️ Editar Regla de Precio' : '➕ Nueva Regla de Precio'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Configuración de precios B2B por cliente, marca, país o producto</span>
                </div>

                <form onSubmit={handleRuleSubmit} className="crm-form">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Nombre de la Regla *</label>
                      <input
                        type="text"
                        value={ruleForm.name}
                        onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                        required
                        placeholder="Ej: Descuento Especial 15% Empresa Demo"
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Tipo de Regla *</label>
                      <select
                        value={ruleForm.rule_type}
                        onChange={e => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="discount">🏷️ Descuento (%)</option>
                        <option value="markup">📈 Recargo / Markup</option>
                        <option value="fixed_price">💲 Precio Fijo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Tipo de Valor *</label>
                      <select
                        value={ruleForm.value_type}
                        onChange={e => setRuleForm({ ...ruleForm, value_type: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto Fijo (USD $)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Valor del Ajuste *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ruleForm.value}
                        onChange={e => setRuleForm({ ...ruleForm, value: e.target.value })}
                        required
                        placeholder="Ej: 15"
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Cliente Específico (Opcional)</label>
                      <select
                        value={ruleForm.user_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, user_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Aplica a todos los clientes</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            👤 #{u.id} - {u.razon_social || u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Marca / Fabricante (Opcional)</label>
                      <select
                        value={ruleForm.brand || ''}
                        onChange={e => setRuleForm({ ...ruleForm, brand: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Aplica a todas las marcas</option>
                        <option value="Fortinet">Fortinet</option>
                        <option value="AudioCodes">AudioCodes</option>
                        <option value="Avaya">Avaya</option>
                        <option value="MikroTik">MikroTik</option>
                        <option value="Aruba">Aruba Networks</option>
                        <option value="Vertiv">Vertiv</option>
                        <option value="Panduit">Panduit</option>
                        <option value="CommScope">CommScope</option>
                        <option value="Eaton">Eaton</option>
                        <option value="Sophos">Sophos</option>
                        <option value="SonicWall">SonicWall</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Dacas">Dacas Eventos / Soluciones</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Tipo de Cliente (Opcional)</label>
                      <select
                        value={ruleForm.tipo_cliente || ''}
                        onChange={e => setRuleForm({ ...ruleForm, tipo_cliente: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Aplica a todos los tipos de clientes</option>
                        <option value="Integrador IT / Reseller">Integrador IT / Reseller</option>
                        <option value="Empresa / Reseller">Empresa / Reseller</option>
                        <option value="Proveedor de Internet (ISP / WISP)">Proveedor de Internet (ISP / WISP)</option>
                        <option value="Empresa Corporativa">Empresa Corporativa</option>
                        <option value="Consultora IT / Ciberseguridad">Consultora IT / Ciberseguridad</option>
                        <option value="Entidad Gubernamental / Educación">Entidad Gubernamental / Educación</option>
                        <option value="Otro">Otro Tipo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>País de Destino (Opcional)</label>
                      <select
                        value={ruleForm.country_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, country_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Aplica a todos los países</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Producto Específico (Opcional)</label>
                      <select
                        value={ruleForm.product_id || ''}
                        onChange={e => setRuleForm({ ...ruleForm, product_id: e.target.value })}
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="">Aplica a todos los productos del catálogo</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price} USD)</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#334155', fontWeight: '700', fontSize: '12.5px' }}>Prioridad (Mayor = se aplica primero)</label>
                      <input
                        type="number"
                        value={ruleForm.priority}
                        onChange={e => setRuleForm({ ...ruleForm, priority: e.target.value })}
                        placeholder="0"
                        style={{ color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px' }}>
                      <input type="checkbox" id="rule_active" checked={ruleForm.is_active} onChange={e => setRuleForm({ ...ruleForm, is_active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                      <label htmlFor="rule_active" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', color: '#0F172A' }}>Regla Activa</label>
                    </div>
                  </div>

                  {/* Impact Live Summary Box */}
                  <div style={{
                    marginTop: '18px',
                    padding: '14px 18px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#0369A1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>💡</span>
                    <span>
                      <strong>Impacto de la regla:</strong> Se aplicará{' '}
                      <strong>
                        {ruleForm.rule_type === 'discount' ? 'un Descuento' : ruleForm.rule_type === 'markup' ? 'un Recargo' : 'un Precio Fijo'} de{' '}
                        {ruleForm.value ? (ruleForm.value_type === 'percentage' ? `${ruleForm.value}%` : `$${ruleForm.value} USD`) : '(Valor sin definir)'}
                      </strong>{' '}
                      para{' '}
                      <strong>
                        {ruleForm.user_id ? users.find(u => String(u.id) === String(ruleForm.user_id))?.razon_social || `Cliente #${ruleForm.user_id}` : 'Todos los clientes'}
                      </strong>
                      {ruleForm.brand ? ` en equipos ${ruleForm.brand}` : ''}
                      {ruleForm.country_id ? ` en ${countries.find(c => String(c.id) === String(ruleForm.country_id))?.name || 'país seleccionado'}` : ''}
                      {ruleForm.product_id ? ` para el producto seleccionado` : ''}.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="btn-submit" style={{ maxWidth: '200px' }}>{editingRule ? 'Guardar Cambios' : 'Crear Regla'}</button>
                    <button type="button" className="btn-delete" onClick={resetRuleForm}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre Regla</th><th>Tipo / Ajuste</th><th>Tipo Cliente</th><th>País</th><th>Marca</th><th>Producto</th><th>Cliente</th><th>Prioridad</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>
                      <span style={{
                        background: r.rule_type === 'discount' ? '#dcfce7' : '#e0f2fe',
                        color: r.rule_type === 'discount' ? '#166534' : '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        {r.rule_type === 'discount' ? 'Descuento ' : r.rule_type === 'markup' ? 'Markup ' : 'Fijo '}
                        {r.value_type === 'percentage' ? `${r.value}%` : `$${r.value}`}
                      </span>
                    </td>
                    <td>
                      {r.tipo_cliente ? (
                        <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                          {r.tipo_cliente}
                        </span>
                      ) : <span style={{ color: '#94a3b8' }}>Todos</span>}
                    </td>
                    <td>
                      {r.country_name || (r.country_id ? `ID: ${r.country_id}` : <span style={{ color: '#94a3b8' }}>Todos</span>)}
                    </td>
                    <td>
                      {r.brand ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                          {r.brand}
                        </span>
                      ) : <span style={{ color: '#94a3b8' }}>Todas</span>}
                    </td>
                    <td>{r.product_name || <span style={{ color: '#94a3b8' }}>Todos</span>}</td>
                    <td>{r.user_email || <span style={{ color: '#94a3b8' }}>Todos</span>}</td>
                    <td><span style={{ fontWeight: '700' }}>{r.priority}</span></td>
                    <td>
                      <span style={{
                        background: r.is_active ? '#dcfce7' : '#fee2e2',
                        color: r.is_active ? '#16a34a' : '#dc2626',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {r.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEditRule(r)} style={{ background: '#0fa4de', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                        <button onClick={() => handleDeleteRule(r.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <button className="nav-btn" onClick={() => { resetUserForm(); setShowUserForm(true); }}>
                ➕ Crear Cliente Manualmente
              </button>
            </div>

            {/* Filtros por Estado */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Todos los Clientes', count: users.length },
                { key: 'pendiente', label: '🟡 Solicitudes Pendientes', count: users.filter(u => u.status === 'pendiente').length, highlight: true },
                { key: 'activo', label: '🟢 Clientes Activos', count: users.filter(u => (u.status || 'activo') === 'activo').length },
                { key: 'inactivo', label: '🔴 Inactivos', count: users.filter(u => u.status === 'inactivo').length }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setUserFilterStatus(f.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: userFilterStatus === f.key ? '#0fa4de' : 'var(--border-color)',
                    background: userFilterStatus === f.key ? '#0fa4de' : 'var(--card-bg)',
                    color: userFilterStatus === f.key ? '#ffffff' : 'var(--text-main)',
                    fontWeight: userFilterStatus === f.key ? '700' : '500',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: userFilterStatus === f.key ? '0 2px 8px rgba(15, 164, 222, 0.25)' : 'none'
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{
                    background: userFilterStatus === f.key ? 'rgba(255,255,255,0.25)' : (f.highlight && f.count > 0 ? '#fef3c7' : '#f1f5f9'),
                    color: userFilterStatus === f.key ? '#ffffff' : (f.highlight && f.count > 0 ? '#d97706' : '#64748b'),
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ALTA / EDICIÓN DE USUARIO B2B */}
            {showUserForm && (
              <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>{editingUser ? `Editar Cliente: ${editingUser.razon_social || editingUser.name}` : 'Alta Nuevo Cliente B2B'}</h3>
                  <button onClick={resetUserForm} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>
                
                <div className="stepper" style={{ marginBottom: '20px' }}>
                  <div className={`step ${userFormSection === 1 ? 'active' : ''}`} onClick={() => setUserFormSection(1)}>1. General & Auth</div>
                  <div className={`step ${userFormSection === 2 ? 'active' : ''}`} onClick={() => setUserFormSection(2)}>2. Ship To / Fiscal</div>
                  <div className={`step ${userFormSection === 3 ? 'active' : ''}`} onClick={() => setUserFormSection(3)}>3. Contactos</div>
                  <div className={`step ${userFormSection === 4 ? 'active' : ''}`} onClick={() => setUserFormSection(4)}>4. Mails Referencia</div>
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
                        <label>Nombre de Contacto *</label>
                        <input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Email (Log In) *</label>
                        <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Contraseña {editingUser && '(Dejar vacío para no cambiar)'} {!editingUser && '*'}</label>
                        <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required={!editingUser} />
                      </div>
                      <div className="form-group">
                        <label>Razón Social / Empresa</label>
                        <input type="text" value={userForm.razon_social} onChange={e => setUserForm({ ...userForm, razon_social: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Cliente</label>
                        <input type="text" value={userForm.tipo_cliente} onChange={e => setUserForm({ ...userForm, tipo_cliente: e.target.value })} placeholder="Ej: Integrador IT, Reseller, Corporativo" />
                      </div>
                      <div className="form-group">
                        <label>Teléfono General / WhatsApp</label>
                        <input type="text" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
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

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="submit" className="btn-submit">{editingUser ? 'Actualizar Cliente' : 'Guardar y Habilitar Cliente'}</button>
                    <button type="button" className="btn-delete" onClick={resetUserForm}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* TABLA DE USUARIOS / CLIENTES */}
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Empresa / Razón Social</th>
                  <th>Contacto & Email</th>
                  <th>Teléfono</th>
                  <th>País / CUIT</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => {
                    if (userFilterStatus === 'all') return true;
                    if (userFilterStatus === 'pendiente') return u.status === 'pendiente';
                    if (userFilterStatus === 'activo') return (u.status || 'activo') === 'activo';
                    if (userFilterStatus === 'inactivo') return u.status === 'inactivo';
                    return true;
                  })
                  .map(u => {
                    const isPending = u.status === 'pendiente';
                    const isInactive = u.status === 'inactivo';
                    return (
                      <tr key={u.id} style={{ background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                        <td>{u.id}</td>
                        <td>
                          <strong>{u.razon_social || u.name}</strong>
                          {u.tipo_cliente && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {u.tipo_cliente}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{u.name}</div>
                          <div style={{ fontSize: '12px', color: '#0fa4de', marginTop: '2px' }}>{u.email}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{u.phone || '—'}</td>
                        <td>
                          <div>{u.country_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{u.numero_nit || ''}</div>
                        </td>
                        <td>
                          {isPending ? (
                            <span style={{
                              background: '#fef3c7',
                              color: '#d97706',
                              border: '1px solid #fde68a',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🟡 Solicitud Shop (Pendiente)
                            </span>
                          ) : isInactive ? (
                            <span style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              🔴 Inactivo
                            </span>
                          ) : (
                            <span style={{
                              background: '#dcfce7',
                              color: '#16a34a',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              🟢 Activo
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isPending && (
                              <button
                                onClick={() => handleApproveUser(u.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                                }}
                              >
                                ✓ Aprobar Cliente
                              </button>
                            )}
                            <button
                              onClick={() => openUserModal(u.id)}
                              style={{ background: '#0fa4de', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            >
                              Ver Perfil
                            </button>
                            <button
                              onClick={() => handleEditUser(u)}
                              style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            >
                              Editar
                            </button>
                            {isPending ? (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, 'inactivo')}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                                title="Rechazar solicitud"
                              >
                                Rechazar
                              </button>
                            ) : isInactive ? (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, 'activo')}
                                style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                              >
                                Reactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, 'inactivo')}
                                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '12px' }}
                                title="Desactivar cliente"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        )}

        {/* ═══════════════ ÓRDENES / PEDIDOS B2B ═══════════════ */}
        {activeTab === 'orders' && (
          <section className="board-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#071524' }}>📋 Gestión de Órdenes y Cotizaciones B2B</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                  Supervisa los pedidos generados en el Shop, gestiona el estado logístico y revisa los tickets sincronizados con Operaciones CRM.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={exportOrdersCSV}
                  className="nav-btn"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📥 Exportar CSV
                </button>
              </div>
            </div>

            {/* Quick KPI Chips for Orders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Órdenes</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#071524', marginTop: '2px' }}>{orders.length}</div>
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Facturado</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A', marginTop: '2px' }}>
                  ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
                </div>
              </div>
              <div style={{ background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#854D0E', fontWeight: '700', textTransform: 'uppercase' }}>En Preparación</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#CA8A04', marginTop: '2px' }}>
                  {orders.filter(o => o.status === 'procesando' || o.status === 'pending').length}
                </div>
              </div>
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#075985', fontWeight: '700', textTransform: 'uppercase' }}>En Despacho / Camino</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0284C7', marginTop: '2px' }}>
                  {orders.filter(o => o.status === 'en_camino' || o.status === 'shipped').length}
                </div>
              </div>
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6B21A8', fontWeight: '700', textTransform: 'uppercase' }}>Entregadas</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#9333EA', marginTop: '2px' }}>
                  {orders.filter(o => o.status === 'entregado' || o.status === 'completed').length}
                </div>
              </div>
            </div>

            {/* Toolbar: Filters & Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por ID, cliente, empresa, CUIT, tracking, OC..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#ffffff' }}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="procesando">🟡 En Preparación (Procesando)</option>
                  <option value="en_camino">🚚 En Despacho / Camino</option>
                  <option value="entregado">✅ Entregado</option>
                  <option value="paid">🟢 Pagado</option>
                  <option value="cancelled">🔴 Cancelado</option>
                </select>

                <select
                  value={orderCountryFilter}
                  onChange={(e) => setOrderCountryFilter(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#ffffff' }}
                >
                  <option value="all">Todos los Países</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {(orderSearch || orderStatusFilter !== 'all' || orderCountryFilter !== 'all') && (
                  <button
                    onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); setOrderCountryFilter('all'); }}
                    style={{ background: '#E2E8F0', border: 'none', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📦</div>
                <h3 style={{ margin: '0 0 6px', color: '#0F172A' }}>No se encontraron órdenes</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                  Intenta ajustar los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>N° Orden</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Fecha</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Cliente & Empresa</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>País & Despacho</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Condición / PO</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Total USD</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569' }}>Estado</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(ord => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: '800', color: '#0FA4DE', fontSize: '13px' }}>#{ord.id}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.user_company || ord.user_name || 'Cliente B2B'}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{ord.user_email}</div>
                          {ord.user_cuit && <div style={{ fontSize: '11px', color: '#94A3B8' }}>CUIT: {ord.user_cuit}</div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '600', color: '#334155' }}>📍 {ord.country_name || 'Argentina'}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{ord.shipping_method || 'Envío a Domicilio'}</div>
                          {ord.tracking_number && (
                            <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontFamily: 'monospace' }}>
                              {ord.tracking_number}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '12px', color: '#334155' }}>{ord.payment_method || 'Cuenta Corriente'}</div>
                          {ord.po_number && <div style={{ fontSize: '11px', color: '#0FA4DE', fontWeight: '600' }}>{ord.po_number}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: '800', color: '#071524', fontSize: '14px' }}>
                            ${parseFloat(ord.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </div>
                          {parseFloat(ord.discount_applied || 0) > 0 && (
                            <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>
                              Desc: -${parseFloat(ord.discount_applied).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <select
                            value={ord.status || 'procesando'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              ...statusStyle(ord.status)
                            }}
                          >
                            <option value="procesando">🟡 En Preparación</option>
                            <option value="en_camino">🚚 En Despacho</option>
                            <option value="entregado">✅ Entregado</option>
                            <option value="paid">🟢 Pagado</option>
                            <option value="cancelled">🔴 Cancelado</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => { setSelectedOrder(ord); setShowOrderModal(true); }}
                            style={{
                              background: '#0FA4DE',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(15, 164, 222, 0.25)'
                            }}
                          >
                            👁️ Ver Detalle
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
                  <span style={{ fontSize: '26px' }}>🎨</span>
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
                  onClick={() => window.open('/shop', '_blank')}
                  style={{
                    background: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '11px 18px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                >
                  <span>👁️</span> Previsualizar en Shop
                </button>

                <button
                  type="button"
                  onClick={handleResetVisualSettings}
                  disabled={isSavingVisual}
                  style={{
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    padding: '11px 16px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Restaura la configuración oficial de DACAS"
                >
                  <span>🔄</span> Restaurar Oficial
                </button>

                <button
                  type="button"
                  onClick={handleSaveVisualSettings}
                  disabled={isSavingVisual}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px 22px',
                    fontWeight: '800',
                    fontSize: '13.5px',
                    cursor: isSavingVisual ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!isSavingVisual) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  {isSavingVisual ? (
                    <><span>⏳</span> Guardando...</>
                  ) : (
                    <><span>💾</span> Guardar Cambios</>
                  )}
                </button>
              </div>
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
                <span style={{ fontSize: '18px' }}>✅</span>
                <span>¡Diseño y configuración visual del Shop actualizados correctamente en tiempo real!</span>
              </div>
            )}

            {visualConfig ? (
              <div>
                {/* ── Sub-Tab Navigation Bar ── */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  background: '#F1F5F9',
                  padding: '6px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  overflowX: 'auto'
                }}>
                  {[
                    { id: 'hero', label: '🚀 Carousel de Banners (Hero)', desc: `${(visualConfig.heroSlides || []).length} Slides Activos` },
                    { id: 'announcement', label: '📢 Anuncio & Barra Superior', desc: 'Mensaje de cobertura' },
                    { id: 'categories', label: '🏷️ 4 Categorías del Shop', desc: 'Títulos, íconos y orden' },
                    { id: 'brands', label: '🏭 Marcas por Categoría', desc: 'Fabricantes autorizados' },
                    { id: 'contact', label: '📞 Contacto B2B & WhatsApp', desc: 'Canales de atención' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVisualSubTab(tab.id)}
                      style={{
                        flex: 1,
                        minWidth: '180px',
                        background: visualSubTab === tab.id ? '#FFFFFF' : 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: visualSubTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '13px', color: visualSubTab === tab.id ? '#0284c7' : '#334155' }}>
                        {tab.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontWeight: '500' }}>
                        {tab.desc}
                      </div>
                    </button>
                  ))}
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
                            return (
                              <div
                                key={s.id || idx}
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
                            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>✏️</span> Editando Slide #{editingSlideIdx + 1}: {cur.titleLine1}
                            </h4>

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

                            {/* Metrics (3 boxes) */}
                            {cur.type !== 'animated_stats' && (
                              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                                  📊 3 Métricas Destacadas del Banner
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                                  {[0, 1, 2].map(mIdx => {
                                    const m = cur.metrics?.[mIdx] || { value: '', label: '' };
                                    return (
                                      <div key={mIdx} style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <input
                                          type="text"
                                          value={m.value || ''}
                                          onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'value', e.target.value)}
                                          placeholder="Valor (ej: 1.4 Gbps)"
                                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}
                                        />
                                        <input
                                          type="text"
                                          value={m.label || ''}
                                          onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'label', e.target.value)}
                                          placeholder="Etiqueta (ej: Uptime)"
                                          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#64748B' }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 2: ANNOUNCEMENT & HEADER ── */}
                {visualSubTab === 'announcement' && (
                  <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📢</span> Configuración de la Barra Superior & Textos de Cabecera
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <input
                        type="checkbox"
                        id="toggleAnnouncement"
                        checked={visualConfig.announcement?.enabled !== false}
                        onChange={(e) => setVisualConfig({
                          ...visualConfig,
                          announcement: { ...(visualConfig.announcement || {}), enabled: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          placeholder="Plataforma Corporativa de Soluciones IT..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 3: CATEGORIES ── */}
                {visualSubTab === 'categories' && (
                  <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🏷️</span> Las 4 Secciones Principales del Shop
                        </h3>
                        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px' }}>
                          Personaliza el nombre, ícono y descripción visible para los integradores y clientes.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                      {(visualConfig.categories || []).map((cat, idx) => (
                        <div
                          key={cat.key || idx}
                          style={{
                            background: '#F8FAFC',
                            padding: '20px',
                            borderRadius: '14px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              SECCIÓN #{idx + 1} ({cat.key})
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="checkbox"
                                id={`cat-enabled-${idx}`}
                                checked={cat.enabled !== false}
                                onChange={(e) => {
                                  const updatedCats = [...visualConfig.categories];
                                  updatedCats[idx] = { ...updatedCats[idx], enabled: e.target.checked };
                                  setVisualConfig({ ...visualConfig, categories: updatedCats });
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              <label htmlFor={`cat-enabled-${idx}`} style={{ fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                                Activa
                              </label>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
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
                                style={{ width: '100%', textAlign: 'center', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
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
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
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
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 4: BRANDS PER CATEGORY ── */}
                {visualSubTab === 'brands' && (
                  <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏭</span> Fabricantes / Marcas Asignadas por Sección
                    </h3>
                    <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '13px' }}>
                      Gestiona qué marcas aparecen en el selector previo antes de mostrar los productos de cada categoría.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      {[
                        { key: 'networking', title: '🌐 Networking' },
                        { key: 'infraestructura', title: '⚡ Infraestructura' },
                        { key: 'comunicaciones_unificadas', title: '📞 Comunicaciones Unificadas' },
                        { key: 'security', title: '🛡️ Seguridad' }
                      ].map(group => {
                        const brandsList = (visualConfig.categoryBrands && visualConfig.categoryBrands[group.key]) || [];
                        return (
                          <div
                            key={group.key}
                            style={{
                              background: '#F8FAFC',
                              padding: '20px',
                              borderRadius: '14px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                              {group.title} ({brandsList.length})
                            </h4>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                              {brandsList.map((brandKey, bIdx) => (
                                <span
                                  key={bIdx}
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #CBD5E1',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: '#0F172A',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  {brandKey.toUpperCase()}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedMap = { ...(visualConfig.categoryBrands || {}) };
                                      updatedMap[group.key] = brandsList.filter((_, i) => i !== bIdx);
                                      setVisualConfig({ ...visualConfig, categoryBrands: updatedMap });
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#94A3B8',
                                      cursor: 'pointer',
                                      padding: '0',
                                      fontWeight: '900',
                                      fontSize: '11px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                                    title="Quitar marca"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Add Brand Input */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="Añadir marca (ej: sophos)"
                                id={`new-brand-input-${group.key}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim().toLowerCase();
                                    if (val && !brandsList.includes(val)) {
                                      const updatedMap = { ...(visualConfig.categoryBrands || {}) };
                                      updatedMap[group.key] = [...brandsList, val];
                                      setVisualConfig({ ...visualConfig, categoryBrands: updatedMap });
                                      e.target.value = '';
                                    }
                                  }
                                }}
                                style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`new-brand-input-${group.key}`);
                                  if (input) {
                                    const val = input.value.trim().toLowerCase();
                                    if (val && !brandsList.includes(val)) {
                                      const updatedMap = { ...(visualConfig.categoryBrands || {}) };
                                      updatedMap[group.key] = [...brandsList, val];
                                      setVisualConfig({ ...visualConfig, categoryBrands: updatedMap });
                                      input.value = '';
                                    }
                                  }
                                }}
                                style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                + Añadir
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SUBTAB 5: CONTACT & WHATSAPP ── */}
                {visualSubTab === 'contact' && (
                  <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📞</span> Canales de Atención Directa y Cotización B2B
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          placeholder="+5491141103300"
                        />
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748B' }}>
                          Permite a los integradores enviar sus carritos de cotización directo a WhatsApp.
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
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          placeholder="ventas@dacas.com"
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
                    transition: 'all 0.2s'
                  }}
                  title="Cerrar"
                >
                  ✕
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

              {/* Grid 4: Canales de Notificación y Facturación */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '18px 20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📧</span> Enrutamiento de Correos & Facturación
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600', marginBottom: '2px' }}>Factura Electrónica:</span>
                    <strong style={{ color: '#0F172A', wordBreak: 'break-all', fontWeight: '700' }}>{selectedUser.email_factura_electronica || selectedUser.email}</strong>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600', marginBottom: '2px' }}>Contacto de Compras:</span>
                    <strong style={{ color: '#0F172A', wordBreak: 'break-all', fontWeight: '700' }}>{selectedUser.email_contacto_compras || selectedUser.email}</strong>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B', display: 'block', fontWeight: '600', marginBottom: '2px' }}>Cotizaciones Automáticas:</span>
                    <strong style={{ color: '#0F172A', wordBreak: 'break-all', fontWeight: '700' }}>{selectedUser.email_cotizaciones_automaticas || selectedUser.email}</strong>
                  </div>
                </div>
              </div>

              {/* Grid 5: Historial de Órdenes */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📦</span> Historial de Órdenes y Cotizaciones ({selectedUser.orders?.length || 0})
                </div>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID Orden</th>
                        <th>Fecha</th>
                        <th>Total (USD)</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.orders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                          <td><span style={{ fontWeight: '800', color: '#071524' }}>${o.total} USD</span></td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', ...statusStyle(o.status) }}>
                              {statusLabel(o.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                ✕
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
              padding: '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(15, 164, 222, 0.2)', border: '1px solid rgba(15, 164, 222, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  📦
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Orden de Compra B2B #{selectedOrder.id}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
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
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: 'none',
                      ...statusStyle(selectedOrder.status)
                    }}
                  >
                    <option value="procesando">🟡 En Preparación</option>
                    <option value="en_camino">🚚 En Despacho</option>
                    <option value="entregado">✅ Entregado</option>
                    <option value="paid">🟢 Pagado</option>
                    <option value="cancelled">🔴 Cancelado</option>
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
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
              
              {/* Left Column: Products & Notes */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛒</span> Productos Solicitados ({selectedOrder.items?.length || 1})
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#ffffff' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name || item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            📦
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>{item.product_name || item.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', gap: '8px' }}>
                            {item.brand && <span style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>{item.brand}</span>}
                            {item.sku && <span>SKU: {item.sku}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: '#071524', fontSize: '13px' }}>
                            ${parseFloat(item.price_at_purchase || item.price || 0).toFixed(2)} USD
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Cant: <strong>{item.quantity || item.qty || 1}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', color: '#64748B', fontSize: '13px', textAlign: 'center' }}>
                      • Ítem de Hardware / Licenciamiento registrado en la orden
                    </div>
                  )}
                </div>

                {/* Logistics & Delivery Notes */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🚚</span> Modalidad y Despacho
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
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
                <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', padding: '16px', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '800', fontSize: '13px' }}>
                    <span>🎫</span> Ticket Automático Generado en Operaciones CRM
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#15803D', lineHeight: '1.5' }}>
                    Esta orden sincronizó automáticamente la apertura de un ticket operativo en el departamento de <strong>Operaciones</strong> para control de stock, facturación y despacho logístico.
                  </p>
                </div>
              </div>

              {/* Right Column: Financial Breakdown & Invoicing */}
              <div>
                {/* Financial Summary */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                    💵 Resumen Financiero
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
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

                    <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#071524' }}>Total Orden:</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#0FA4DE' }}>
                        ${parseFloat(selectedOrder.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invoicing & Client Info */}
                <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏢</span> Datos Fiscales y Comerciales
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
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

    </div>
  );
}

export default AdminEcommerce;


