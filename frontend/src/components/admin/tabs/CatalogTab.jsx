import React, { useState, useMemo } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import AdminProductFormTiendanube from '../../../AdminProductFormTiendanube';
import PaginationBar from '../PaginationBar';
import ProductCloneModal from '../modals/ProductCloneModal';
import BulkProductModal from '../modals/BulkProductModal';
import BrandEditModal from '../modals/BrandEditModal';
import BrandCreateModal from '../modals/BrandCreateModal';
import { BrandLogoImg, BRAND_INFO } from '../../../Shop';
import { DACAS_COUNTRIES_LIST, CATEGORIES, API_BASE_URL, downloadCSV } from '../adminHelpers';

const CATEGORY_GROUPS = [
  { key: 'networking', label: 'Networking', icon: '🌐', color: '#0fa4de', bg: 'rgba(15, 164, 222, 0.08)' },
  { key: 'infraestructura', label: 'Infraestructura', icon: '⚡', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { key: 'comunicaciones_unificadas', label: 'Comunicaciones Unificadas', icon: '📞', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  { key: 'security', label: 'Seguridad & Ciberseguridad', icon: '🛡️', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' }
];

export default function CatalogTab({
  activeTab = 'products',
  setActiveTab,
  products = [],
  setProducts,
  fetchProducts,
  countries = [],
  fetchCountries,
  selectedCountryScope = 'AR',
  getAuthHeader = () => ({}),
  visualConfig = {},
  setVisualConfig
}) {
  const currentScopeCode = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
  const activeCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === currentScopeCode) || {
    code: currentScopeCode,
    name: currentScopeCode,
    flag: '🇦🇷',
    id: 2
  };

  // ══════════════════════════════════════════════════════════════
  // PRODUCTS STATE & LOGIC
  // ══════════════════════════════════════════════════════════════
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(25);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Drawer stock state
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [drawerStock, setDrawerStock] = useState(0);
  const [drawerUpdatingStock, setDrawerUpdatingStock] = useState(false);

  // Clone Modal
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [productToClone, setProductToClone] = useState(null);
  const [cloneTargetCountry, setCloneTargetCountry] = useState('CL');
  const [isCloning, setIsCloning] = useState(false);

  // Bulk Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [bulkError, setBulkError] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkMode, setBulkMode] = useState('preview');
  const [bulkDragOver, setBulkDragOver] = useState(false);

  // Update drawer stock when product detail is selected
  React.useEffect(() => {
    if (selectedProductDetail) {
      setDrawerStock(Number(selectedProductDetail.stock) || 0);
    }
  }, [selectedProductDetail]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      const matchCat = !selectedCategory || p.category === selectedCategory;

      let matchStock = true;
      if (filterStock === 'in_stock') matchStock = Number(p.stock) > 0;
      else if (filterStock === 'out_of_stock') matchStock = Number(p.stock) <= 0;

      return matchSearch && matchCat && matchStock;
    });
  }, [products, productSearch, selectedCategory, filterStock]);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return filteredProducts.slice(start, start + productPageSize);
  }, [filteredProducts, productPage, productPageSize]);

  const resetProductForm = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleSaveTiendanubeProduct = async (payload) => {
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
    if (fetchProducts) fetchProducts(selectedCountryScope);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Error al eliminar');
      if (fetchProducts) fetchProducts(selectedCountryScope);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleFeaturedProduct = async (productId) => {
    if (setProducts) {
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
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${productId}/toggle-featured`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (fetchProducts) fetchProducts();
      }
    } catch (err) {
      console.error('Error toggling featured status:', err);
      if (fetchProducts) fetchProducts();
    }
  };

  const handleDrawerStockSave = async () => {
    if (!selectedProductDetail) return;
    setDrawerUpdatingStock(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/${selectedProductDetail.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(drawerStock) })
      });
      if (!res.ok) throw new Error('Error al actualizar el stock');
      if (setProducts) {
        setProducts(prev => prev.map(p => p.id === selectedProductDetail.id ? { ...p, stock: Number(drawerStock) } : p));
      }
      setSelectedProductDetail(prev => prev ? { ...prev, stock: Number(drawerStock) } : null);
      alert(`✅ Stock local de "${selectedProductDetail.name}" actualizado a ${drawerStock} u. para ${activeCountryObj.name}!`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDrawerUpdatingStock(false);
    }
  };

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
      if (fetchProducts) fetchProducts(selectedCountryScope);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  const exportProductsCSV = () => {
    downloadCSV(
      products.map(p => [
        p.id,
        p.name,
        p.brand || '',
        p.category || 'General',
        p.subcategory || '',
        p.sku || '',
        `$${p.price}`,
        p.promotional_price ? `$${p.promotional_price}` : '',
        p.stock,
        p.weight || '',
        p.depth || p.length || '',
        p.width || '',
        p.height || '',
        p.description || '',
        p.image_url || '',
        (Array.isArray(p.highlights) ? p.highlights.join(' | ') : (p.highlights || '')),
        p.warranty || '12 Meses con RMA y Soporte DACAS',
        p.datasheet_url || '',
        p.condition || 'Nuevo Sellado',
        (Array.isArray(p.related_skus) ? p.related_skus.join(', ') : (p.related_ids ? products.filter(x => p.related_ids.includes(x.id)).map(x => x.sku).filter(Boolean).join(', ') : ''))
      ]),
      [
        'ID', 'Nombre', 'Marca', 'Categoria', 'Subcategoria', 'SKU', 'Precio_USD', 'Precio_Promo_USD', 'Stock',
        'Peso_kg', 'Largo_cm', 'Ancho_cm', 'Alto_cm', 'Descripcion', 'URL_Imagen', 'Caracteristicas',
        'Garantia', 'Datasheet_PDF', 'Condicion', 'Productos_Relacionados'
      ],
      `catalogo_productos_${selectedCountryScope || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  // Bulk CSV Handlers
  const downloadSampleCSV = () => {
    const headers = ['sku', 'name', 'brand', 'category', 'price', 'promotional_price', 'stock', 'description', 'image_url'];
    const sampleRows = [
      ['FORTI-FG-40F', 'FortiGate 40F Network Security', 'Fortinet', 'security', '499.00', '449.00', '25', 'Firewall de última generación para sucursales', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8'],
      ['CISCO-C9200L-24P', 'Catalyst 9200L 24 puertos PoE+', 'Cisco', 'networking', '1250.00', '', '10', 'Switch enterprise Layer 3 gestionable', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31']
    ];
    downloadCSV(sampleRows, headers, `plantilla_carga_masiva_dacas_${selectedCountryScope || 'AR'}.csv`);
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
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setBulkError('El archivo CSV está vacío o no contiene filas de datos.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        const parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const rawRow = lines[i];
          const matches = rawRow.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawRow.split(',');
          const rowObj = {};
          headers.forEach((h, idx) => {
            let val = matches[idx] ? matches[idx].trim().replace(/^["']|["']$/g, '') : '';
            rowObj[h] = val;
          });
          if (rowObj.name || rowObj.sku) {
            parsedRows.push(rowObj);
          }
        }

        setBulkData(parsedRows);
        setBulkMode('preview');
      } catch (err) {
        setBulkError('Error procesando el formato del CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmBulkImport = async () => {
    if (!bulkData || bulkData.length === 0) return;
    setBulkLoading(true);
    setBulkError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/admin/products/bulk?country=${selectedCountryScope || 'AR'}`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: bulkData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la importación masiva');

      setBulkResult({
        created: data.created || bulkData.length,
        updated: data.updated || 0,
        errors: data.errors || []
      });
      if (fetchProducts) fetchProducts(selectedCountryScope);
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // BRANDS STATE & LOGIC
  // ══════════════════════════════════════════════════════════════
  const [brandsViewMode, setBrandsViewMode] = useState('categories'); // 'categories' | 'grid'
  const [activeCategoryPill, setActiveCategoryPill] = useState('all');
  const [brandAdminSearch, setBrandAdminSearch] = useState('');
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState({
    networking: true,
    infraestructura: true,
    comunicaciones_unificadas: true,
    security: true
  });
  const [selectedBrandToAssign, setSelectedBrandToAssign] = useState({});

  // Modals for Brands
  const [editingBrandModal, setEditingBrandModal] = useState(null);
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [isUploadingBrandBanner, setIsUploadingBrandBanner] = useState(false);

  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    logo: '',
    banner: '',
    tagline: '',
    color: '#0fa4de',
    category: 'networking',
    isGlobal: true,
    countries: []
  });

  const normalizeBrandItem = (item, catKey) => {
    if (typeof item === 'string') {
      const bKey = item.toLowerCase();
      const bCountries = (visualConfig?.brandCountries && visualConfig.brandCountries[bKey]) || [];
      return { name: bKey, countries: bCountries };
    }
    return {
      name: (item?.name || '').toLowerCase(),
      countries: Array.isArray(item?.countries) ? item.countries : []
    };
  };

  const toggleCategoryExpand = (catKey) => {
    setExpandedCategoryKeys(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  const handleExpandAllCategories = (expand = true) => {
    setExpandedCategoryKeys({
      networking: expand,
      infraestructura: expand,
      comunicaciones_unificadas: expand,
      security: expand
    });
  };

  const allAdminBrands = useMemo(() => {
    const keysMap = new Map();
    Object.entries(visualConfig?.categoryBrands || {}).forEach(([cat, list]) => {
      if (Array.isArray(list)) {
        list.forEach((item, idx) => {
          const name = typeof item === 'string' ? item : item?.name;
          if (name) {
            const k = name.toLowerCase().trim();
            const bCountries = (typeof item === 'object' && Array.isArray(item.countries)) ? item.countries : [];
            if (!keysMap.has(k)) {
              keysMap.set(k, { catKey: cat, originalIdx: idx, countries: bCountries });
            }
          }
        });
      }
    });

    if (visualConfig?.brandCustomInfo) {
      Object.keys(visualConfig.brandCustomInfo).forEach(k => {
        const cleanK = k ? k.toLowerCase().trim() : '';
        if (cleanK && !keysMap.has(cleanK)) {
          keysMap.set(cleanK, { catKey: 'unassigned', originalIdx: -1, countries: [] });
        }
      });
    }

    if (keysMap.size === 0) {
      Object.keys(BRAND_INFO || {}).forEach(k => {
        keysMap.set(k.toLowerCase().trim(), { catKey: 'networking', originalIdx: -1, countries: [] });
      });
    }

    return Array.from(keysMap.entries()).map(([key, meta]) => {
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

      let bCountries = meta.countries || [];
      if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[key])) {
        bCountries = visualConfig.brandCountries[key];
      }

      const prodCount = products.filter(p => p.brand && p.brand.toLowerCase() === key).length;

      return {
        key,
        name: finalName,
        logo: finalLogo,
        banner: custom.banner || '',
        tagline: finalTagline,
        color: finalColor,
        category: meta.catKey,
        originalIdx: meta.originalIdx,
        countries: bCountries,
        productCount: prodCount,
        hasCustomLogo: Boolean(custom.logo),
        hasCustomBanner: Boolean(custom.banner),
        hasCustomTagline: Boolean(custom.tagline)
      };
    });
  }, [visualConfig, products]);

  const filteredAdminBrands = useMemo(() => {
    return allAdminBrands.filter(b => {
      const matchCat = activeCategoryPill === 'all' || b.category === activeCategoryPill;
      const q = brandAdminSearch.toLowerCase().trim();
      const matchSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.key.includes(q);
      return matchCat && matchSearch;
    });
  }, [allAdminBrands, activeCategoryPill, brandAdminSearch]);

  const handleCreateNewBrand = async (e) => {
    e.preventDefault();
    const brandName = newBrandForm.name.trim().toLowerCase();
    if (!brandName) return;

    const catKey = newBrandForm.category;
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];

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
        banner: (newBrandForm.banner || '').trim(),
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

    if (setVisualConfig) setVisualConfig(newConfig);

    setNewBrandForm({
      name: '',
      logo: '',
      banner: '',
      tagline: '',
      color: '#0fa4de',
      category: newBrandForm.category,
      isGlobal: true,
      countries: []
    });
    setShowNewBrandModal(false);

    try {
      const targetCountry = selectedCountryScope && selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${targetCountry}`, {
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

    let bCountries = [];
    if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[key])) {
      bCountries = visualConfig.brandCountries[key];
    } else {
      Object.entries(visualConfig?.categoryBrands || {}).forEach(([cat, list]) => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            const b = normalizeBrandItem(item, cat);
            if (b.name === key && b.countries?.length > 0) bCountries = b.countries;
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
      banner: custom.banner !== undefined ? custom.banner : (defaultInfo.banner || ''),
      tagline: custom.tagline || defaultInfo.tagline || `Soluciones corporativas oficiales ${key.toUpperCase()}`,
      color: custom.color || defaultInfo.color || '#0fa4de',
      countries: bCountries || [],
      isGlobal: !bCountries || bCountries.length === 0
    });
  };

  const handleSaveBrandModal = async (e) => {
    if (e) e.preventDefault();
    if (!editingBrandModal) return;
    const { brandKey, catKey, brandIdx, name, logo, banner, tagline, color, countries: brandCountries, isGlobal } = editingBrandModal;

    const brandNameClean = (name || brandKey).trim();
    const updatedCountries = isGlobal ? [] : (brandCountries || []);

    const updatedCustomInfo = {
      ...(visualConfig?.brandCustomInfo || {}),
      [brandKey]: {
        name: brandNameClean,
        logo: (logo || '').trim(),
        banner: (banner || '').trim(),
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

    if (setVisualConfig) setVisualConfig(newConfig);
    setEditingBrandModal(null);

    try {
      const targetCountry = selectedCountryScope && selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${targetCountry}`, {
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

  const handleUploadBrandBanner = async (file, isNew = false) => {
    if (!file) return;
    setIsUploadingBrandBanner(true);
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
          setNewBrandForm(prev => ({ ...prev, banner: data.urls[0] }));
        } else {
          setEditingBrandModal(prev => ({ ...prev, banner: data.urls[0] }));
        }
      } else {
        alert(data.error || 'Error al subir banner');
      }
    } catch (err) {
      alert('Error de conexión al subir banner: ' + err.message);
    } finally {
      setIsUploadingBrandBanner(false);
    }
  };

  const handleReassignBrandCategory = async (brandName, fromCat, toCat) => {
    if (!brandName || fromCat === toCat) return;
    const cleanName = brandName.toLowerCase().trim();
    const oldList = visualConfig?.categoryBrands?.[fromCat] || [];
    const newList = visualConfig?.categoryBrands?.[toCat] || [];

    const itemToMove = oldList.find(item => {
      const b = normalizeBrandItem(item, fromCat);
      return b.name === cleanName;
    }) || cleanName;

    const updatedOldList = oldList.filter(item => {
      const b = normalizeBrandItem(item, fromCat);
      return b.name !== cleanName;
    });

    const existsInNew = newList.some(item => {
      const b = normalizeBrandItem(item, toCat);
      return b.name === cleanName;
    });
    const updatedNewList = existsInNew ? newList : [...newList, itemToMove];

    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [fromCat]: updatedOldList,
        [toCat]: updatedNewList
      }
    };

    if (setVisualConfig) setVisualConfig(newConfig);

    try {
      const targetCountry = selectedCountryScope && selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${targetCountry}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error reasignando categoría de marca:', err);
    }
  };

  const handleDeleteBrand = async (catKey, brandIdx, brandName) => {
    const countryName = DACAS_COUNTRIES_LIST.find(c => c.code === selectedCountryScope)?.name || selectedCountryScope || 'este país';
    if (!window.confirm(`¿Estás seguro de que deseas quitar la marca "${brandName.toUpperCase()}" de ${countryName}?`)) {
      return;
    }
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];
    const updatedList = currentList.filter((_, idx) => idx !== brandIdx);
    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      }
    };
    if (setVisualConfig) setVisualConfig(newConfig);

    try {
      const targetCountry = selectedCountryScope && selectedCountryScope !== 'all' ? selectedCountryScope : 'AR';
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${targetCountry}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error persistiendo eliminación de marca:', err);
    }
  };

  const handleAssignBrandToCategory = async (catKey, brandKey) => {
    if (!brandKey || !catKey) return;
    const cleanKey = brandKey.toLowerCase().trim();
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];

    const exists = currentList.some(item => {
      const b = normalizeBrandItem(item, catKey);
      return b.name.toLowerCase() === cleanKey;
    });

    if (exists) {
      alert(`La marca "${brandKey.toUpperCase()}" ya se encuentra asignada a esta categoría.`);
      return;
    }

    const currentScope = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
    let bCountries = [];
    if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[cleanKey])) {
      bCountries = visualConfig.brandCountries[cleanKey];
    } else {
      bCountries = [currentScope];
    }

    const newBrandItem = {
      name: cleanKey,
      countries: bCountries
    };

    const updatedList = [...currentList, newBrandItem];
    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      }
    };

    if (setVisualConfig) setVisualConfig(newConfig);
    setSelectedBrandToAssign(prev => ({ ...prev, [catKey]: '' }));

    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${currentScope}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error guardando asignación de marca:', err);
      alert('Error guardando asignación de marca: ' + err.message);
    }
  };

  const handleUnassignBrandFromCategory = async (catKey, brandIdx, brandName, catTitle) => {
    const scopeName = DACAS_COUNTRIES_LIST.find(c => c.code === selectedCountryScope)?.name || selectedCountryScope || 'este país';
    if (!window.confirm(`¿Deseas desvincular la marca "${(brandName || '').toUpperCase()}" de la categoría "${catTitle || catKey}" para ${scopeName}?\n\n(La marca seguirá existiendo en el catálogo oficial de Marcas)`)) {
      return;
    }
    const currentList = visualConfig?.categoryBrands?.[catKey] || [];
    const targetItem = currentList[brandIdx];
    const cleanKey = (typeof targetItem === 'string' ? targetItem : targetItem?.name || brandName || '').toLowerCase().trim();
    const updatedList = currentList.filter((_, idx) => idx !== brandIdx);

    const masterBrand = allAdminBrands.find(mb => mb.key === cleanKey) || {};
    const existingCustom = visualConfig?.brandCustomInfo?.[cleanKey] || {};
    const updatedCustomInfo = {
      ...(visualConfig?.brandCustomInfo || {}),
      [cleanKey]: {
        name: existingCustom.name || masterBrand.name || (cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)),
        logo: existingCustom.logo !== undefined ? existingCustom.logo : (masterBrand.logo || ''),
        tagline: existingCustom.tagline || masterBrand.tagline || '',
        color: existingCustom.color || masterBrand.color || '#0fa4de'
      }
    };

    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      },
      brandCustomInfo: updatedCustomInfo
    };
    if (setVisualConfig) setVisualConfig(newConfig);

    try {
      const targetCountry = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${targetCountry}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error desvinculando marca de categoría:', err);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // COUNTRIES STATE & LOGIC
  // ══════════════════════════════════════════════════════════════
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({
    code: '',
    name: '',
    tax_rate: '0',
    shipping_cost: '0',
    nationalization_cost: '0',
    discount_rate: '0'
  });

  const resetCountryForm = () => {
    setCountryForm({ code: '', name: '', tax_rate: '0', shipping_cost: '0', nationalization_cost: '0', discount_rate: '0' });
    setEditingCountry(null);
    setShowCountryForm(false);
  };

  const handleEditCountry = (c) => {
    setEditingCountry(c);
    setCountryForm({
      code: c.code,
      name: c.name,
      tax_rate: c.tax_rate ?? '0',
      shipping_cost: c.shipping_cost ?? '0',
      nationalization_cost: c.nationalization_cost ?? '0',
      discount_rate: c.discount_rate ?? '0'
    });
    setShowCountryForm(true);
  };

  const handleCountrySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCountry
        ? `${API_BASE_URL}/api/ecommerce/admin/countries/${editingCountry.id}`
        : `${API_BASE_URL}/api/ecommerce/admin/countries`;
      const method = editingCountry ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(countryForm),
      });
      if (!res.ok) throw new Error('Error al guardar país');
      resetCountryForm();
      if (fetchCountries) fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('¿Eliminar este país de la base de datos?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/ecommerce/admin/countries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (fetchCountries) fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER SUB-VIEWS
  // ══════════════════════════════════════════════════════════════

  // 1. PRODUCTS VIEW
  if (activeTab === 'products') {
    if (showProductForm) {
      return (
        <AdminProductFormTiendanube
          product={editingProduct}
          allProducts={products}
          onSave={handleSaveTiendanubeProduct}
          onCancel={resetProductForm}
          apiBaseUrl={API_BASE_URL}
          defaultCountryCode={selectedCountryScope}
        />
      );
    }

    return (
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
              Gestionando exclusivamente el inventario local, catálogo y precios para los depósitos de <strong>{activeCountryObj.name} ({activeCountryObj.code})</strong>.
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
            onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
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
            onChange={(e) => { setSelectedCategory(e.target.value); setProductPage(1); }}
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
            onChange={(e) => { setFilterStock(e.target.value); setProductPage(1); }}
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
            onClick={() => { setProductSearch(''); setSelectedCategory(''); setFilterStock('all'); setProductPage(1); }}
          >
            ✕ Limpiar
          </button>
        </div>

        {/* Tabla de Productos de Alta Densidad */}
        <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="users-table crm-compact-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>Foto</th>
                <th style={{ width: '120px' }}>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Precio USD</th>
                <th style={{ textAlign: 'center' }}>Stock {activeCountryObj.flag} {activeCountryObj.code}</th>
                <th style={{ textAlign: 'center', width: '90px' }}>⭐ Destacado</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📦</div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>No se encontraron productos</div>
                    <div style={{ fontSize: '12px' }}>Intenta cambiar los filtros de búsqueda o seleccionar otra categoría para {activeCountryObj.name}.</div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => {
                  const isFeat = Boolean(p.is_featured || p.isFeatured || p.badge === 'DESTACADO');
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProductDetail(p)}
                      style={{
                        cursor: 'pointer',
                        height: '42px',
                        transition: 'background 0.15s ease'
                      }}
                      title="Click para ver especificaciones técnicas, packaging y ajustar stock"
                    >
                      <td style={{ width: '40px', textAlign: 'center', padding: '4px 6px' }}>
                        <img
                          src={p.image_url || (p.images && p.images[0]) || 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Foto'}
                          alt={p.name}
                          style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'inline-block' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/40x40/f1f5f9/94a3b8?text=Foto'; }}
                        />
                      </td>
                      <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '700', color: '#0369a1', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                          {p.sku || 'S/SKU'}
                        </span>
                      </td>
                      <td style={{ padding: '4px 8px', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontWeight: '600',
                              color: 'var(--text-main)',
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1
                            }}
                            title={p.name}
                          >
                            {p.name}
                          </span>
                          {p.brand && (
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                              {p.brand}
                            </span>
                          )}
                          {p.subcategory && (
                            <span style={{ fontSize: '10px', color: '#0369a1', fontWeight: '750', background: '#e0f2fe', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                              {p.subcategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: 'var(--pill-bg, #f1f5f9)',
                          border: '1px solid var(--border-color, #e2e8f0)',
                          color: 'var(--text-main, #334155)',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {(p.category || 'General').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        {p.promotional_price ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <span style={{ color: '#10b981', fontWeight: '800', fontSize: '12px' }}>
                              ${Number(p.promotional_price).toFixed(2)}
                            </span>
                            <s style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '10px' }}>
                              ${Number(p.price).toFixed(2)}
                            </s>
                          </div>
                        ) : (
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '12px' }}>
                            ${Number(p.price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: Number(p.stock) > 10 ? '#dcfce7' : Number(p.stock) > 0 ? '#fef3c7' : '#fee2e2',
                          color: Number(p.stock) > 10 ? '#16a34a' : Number(p.stock) > 0 ? '#d97706' : '#dc2626',
                          display: 'inline-block'
                        }}>
                          {p.stock ?? 0} u.
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '4px 6px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleFeaturedProduct(p.id)}
                          title={isFeat ? "Quitar de destacados" : "Marcar destacado"}
                          style={{
                            background: isFeat ? '#fffbeb' : '#f8fafc',
                            border: isFeat ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                            color: isFeat ? '#d97706' : '#94a3b8',
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span>{isFeat ? '⭐' : '☆'}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'center', padding: '4px 6px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                          <button
                            className="dacas-action-pill"
                            onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                            title="Editar producto completo"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            <BrandingVectorIcon name="edit" size={11} />
                          </button>
                          <button
                            className="dacas-action-pill"
                            onClick={() => handleOpenCloneModal(p)}
                            title="Clonar a otro país"
                            style={{ padding: '2px 6px', fontSize: '11px', background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}
                          >
                            <BrandingVectorIcon name="copy" size={11} color="#16a34a" />
                          </button>
                          <button
                            className="dacas-action-pill danger"
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Eliminar producto"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            <BrandingVectorIcon name="trash" size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <PaginationBar
          currentPage={productPage}
          totalItems={filteredProducts.length}
          pageSize={productPageSize}
          onPageChange={setProductPage}
          onPageSizeChange={setProductPageSize}
          pageSizeOptions={[15, 25, 50, 100]}
        />

        {/* Slide-over Drawer Detalle de Producto */}
        {selectedProductDetail && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 99998,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setSelectedProductDetail(null)}
          >
            <div
              style={{
                width: '540px',
                maxWidth: '100vw',
                height: '100vh',
                background: '#ffffff',
                boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 99999,
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {activeCountryObj.flag} Stock {activeCountryObj.name} ({activeCountryObj.code})
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                      SKU: {selectedProductDetail.sku || 'S/SKU'}
                    </span>
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={selectedProductDetail.name}>
                    {selectedProductDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductDetail(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '15px',
                    fontWeight: '700'
                  }}
                  title="Cerrar detalles"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Image & Quick Specs */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <img
                    src={selectedProductDetail.image_url || (selectedProductDetail.images && selectedProductDetail.images[0]) || 'https://placehold.co/100x100/f1f5f9/94a3b8?text=Foto'}
                    alt={selectedProductDetail.name}
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/f1f5f9/94a3b8?text=Foto'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                      {selectedProductDetail.brand || 'Marca Oficial DACAS'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '2px 0 6px' }}>
                      ${Number(selectedProductDetail.price || 0).toFixed(2)} USD
                    </div>
                    {selectedProductDetail.promotional_price && (
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                        Precio Promocional: ${Number(selectedProductDetail.promotional_price).toFixed(2)} USD
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>
                        {(selectedProductDetail.category || 'General').replace(/_/g, ' ')}
                      </span>
                      {selectedProductDetail.badge && (
                        <span style={{ background: selectedProductDetail.badgeColor || '#0fa4de', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          {selectedProductDetail.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Local Management Card */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #0fa4de', padding: '16px', boxShadow: '0 4px 12px rgba(15, 164, 222, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        Stock en Depósito {activeCountryObj.name}
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: drawerStock > 10 ? '#dcfce7' : drawerStock > 0 ? '#fef3c7' : '#fee2e2',
                      color: drawerStock > 10 ? '#16a34a' : drawerStock > 0 ? '#d97706' : '#dc2626'
                    }}>
                      {drawerStock > 0 ? `${drawerStock} u. Disponibles` : 'Sin Stock'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '11.5px', color: '#64748b' }}>
                    Ajuste rápido de inventario físico local para la filial de <strong>{activeCountryObj.name}</strong>. No afecta al resto de los países.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDrawerStock(prev => Math.max(0, Number(prev) - 1))}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={drawerStock}
                      onChange={(e) => setDrawerStock(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{
                        width: '90px',
                        textAlign: 'center',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #0fa4de',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#0f172a'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setDrawerStock(prev => Number(prev) + 1)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerStock(prev => Number(prev) + 10)}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={handleDrawerStockSave}
                      disabled={drawerUpdatingStock}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#0fa4de',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: drawerUpdatingStock ? 'wait' : 'pointer'
                      }}
                    >
                      {drawerUpdatingStock ? 'Guardando...' : 'Guardar Stock'}
                    </button>
                  </div>
                </div>

                {/* Logistics & Packaging specs */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📐</span>
                    <span>Especificaciones Logísticas & Packaging</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Peso del Bulto</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        📦 {selectedProductDetail.weight ? `${selectedProductDetail.weight} kg` : 'No especificado'}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Dimensiones (LxAxAlt)</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        📏 {(selectedProductDetail.depth || selectedProductDetail.width || selectedProductDetail.height)
                          ? `${selectedProductDetail.depth || 0} × ${selectedProductDetail.width || 0} × ${selectedProductDetail.height || 0} cm`
                          : 'No especificadas'}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Volumen Calculado</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        {((Number(selectedProductDetail.depth || 0) * Number(selectedProductDetail.width || 0) * Number(selectedProductDetail.height || 0)) / 1000000).toFixed(4)} m³
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Depósito Físico</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        {activeCountryObj.flag} {activeCountryObj.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Description */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Descripción & Especificaciones
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5, maxHeight: '140px', overflowY: 'auto' }}>
                    {selectedProductDetail.description || 'Sin descripción técnica cargada para este producto.'}
                  </div>
                </div>

                {/* Highlights */}
                {selectedProductDetail.highlights && (
                  <div style={{ background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      ✓ Características Destacadas
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#0c4a6e' }}>
                      {String(selectedProductDetail.highlights).split(/\r?\n|\|/).filter(Boolean).map((bullet, bIdx) => (
                        <div key={bIdx} style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#0fa4de', fontWeight: 'bold' }}>•</span>
                          <span>{bullet.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warranty & Documentation */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    🛡️ Garantía & Documentación
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <strong>Garantía:</strong> {selectedProductDetail.warranty || '12 Meses con RMA y Soporte DACAS'}
                    </div>
                    <div>
                      <strong>Condición:</strong> {selectedProductDetail.condition || 'Nuevo Sellado'}
                    </div>
                    {selectedProductDetail.datasheet_url && (
                      <div style={{ marginTop: '2px' }}>
                        <a
                          href={selectedProductDetail.datasheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#0fa4de', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>📄 Ver Datasheet Oficial (PDF)</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related products */}
                {((Array.isArray(selectedProductDetail.related_ids) && selectedProductDetail.related_ids.length > 0) ||
                  (Array.isArray(selectedProductDetail.related_skus) && selectedProductDetail.related_skus.length > 0)) && (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      🔗 Productos Relacionados Asignados
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(selectedProductDetail.related_ids || []).map(rId => {
                        const rel = products.find(p => p.id === rId);
                        return (
                          <span
                            key={rId}
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}
                          >
                            {rel ? `${rel.sku ? rel.sku + ' • ' : ''}${rel.name.slice(0, 24)}...` : `ID #${rId}`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedProductDetail;
                    setSelectedProductDetail(null);
                    setEditingProduct(p);
                    setShowProductForm(true);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #0fa4de',
                    background: '#0fa4de',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="edit" size={13} color="#ffffff" />
                  <span>Editar Formulario Completo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedProductDetail;
                    setSelectedProductDetail(null);
                    handleOpenCloneModal(p);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BrandingVectorIcon name="copy" size={13} color="#16a34a" />
                  <span>Clonar a otro País</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedProductDetail.id;
                    setSelectedProductDetail(null);
                    handleDeleteProduct(id);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  title="Eliminar producto"
                >
                  <BrandingVectorIcon name="trash" size={13} color="#dc2626" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Clonar Producto */}
        <ProductCloneModal
          isOpen={showCloneModal}
          productToClone={productToClone}
          onClose={() => { setShowCloneModal(false); setProductToClone(null); }}
          cloneTargetCountry={cloneTargetCountry}
          setCloneTargetCountry={setCloneTargetCountry}
          handleExecuteClone={handleExecuteClone}
          isCloning={isCloning}
          dacasCountriesList={DACAS_COUNTRIES_LIST}
        />

        {/* Modal Carga Masiva */}
        <BulkProductModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          bulkLoading={bulkLoading}
          bulkFile={bulkFile}
          bulkData={bulkData}
          bulkError={bulkError}
          bulkResult={bulkResult}
          bulkMode={bulkMode}
          setBulkMode={setBulkMode}
          bulkDragOver={bulkDragOver}
          setBulkDragOver={setBulkDragOver}
          downloadSampleCSV={downloadSampleCSV}
          handleProcessCSVFile={handleProcessCSVFile}
          handleConfirmBulkImport={handleConfirmBulkImport}
          setBulkData={setBulkData}
          setBulkFile={setBulkFile}
          setBulkResult={setBulkResult}
        />
      </section>
    );
  }

  // 2. BRANDS VIEW
  if (activeTab === 'brands') {
    const countsByCat = {};
    let totalBrandsInCountry = 0;
    CATEGORY_GROUPS.forEach(g => {
      const list = (visualConfig?.categoryBrands && visualConfig.categoryBrands[g.key]) || [];
      countsByCat[g.key] = list.length;
      totalBrandsInCountry += list.length;
    });

    const visibleGroups = activeCategoryPill === 'all'
      ? CATEGORY_GROUPS
      : CATEGORY_GROUPS.filter(g => g.key === activeCategoryPill);

    const qSearch = brandAdminSearch.toLowerCase().trim();

    return (
      <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* Cabecera Principal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'var(--card-bg, #ffffff)',
          padding: '22px 24px',
          borderRadius: '18px',
          border: '1.5px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '28px' }}>🏷️</span>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '850', color: 'var(--text-main, #071524)', letterSpacing: '-0.02em' }}>
                Marcas Oficiales de {activeCountryObj.name}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.12), rgba(2, 132, 199, 0.18))',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '0.02em'
              }}>
                <span>{activeCountryObj.flag}</span>
                <span>PRIMARY KEY: {activeCountryObj.code}</span>
              </span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--text-muted, #64748b)', maxWidth: '780px', lineHeight: 1.45 }}>
              Gestiona los fabricantes y asigna sus categorías tecnológicas para clientes que operan en <strong>{activeCountryObj.name}</strong>. Cada país cuenta con su propio catálogo independiente y sincronizado en tiempo real con el Shop.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setBrandsViewMode('categories')}
                style={{
                  background: brandsViewMode === 'categories' ? '#ffffff' : 'transparent',
                  color: brandsViewMode === 'categories' ? '#0284c7' : '#64748b',
                  fontWeight: '750',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: brandsViewMode === 'categories' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Organizador visual por categorías tecnológicas"
              >
                <span>🏭</span>
                <span>Por Categorías & Asignación</span>
              </button>
              <button
                type="button"
                onClick={() => setBrandsViewMode('grid')}
                style={{
                  background: brandsViewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: brandsViewMode === 'grid' ? '#0284c7' : '#64748b',
                  fontWeight: '750',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: brandsViewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Directorio completo de tarjetas con logotipos"
              >
                <span>🗂️</span>
                <span>Directorio de Tarjetas</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewBrandForm({
                  name: '',
                  logo: '',
                  banner: '',
                  tagline: '',
                  color: '#0fa4de',
                  category: activeCategoryPill !== 'all' ? activeCategoryPill : 'networking',
                  isGlobal: true,
                  countries: []
                });
                setShowNewBrandModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '750',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
              }}
            >
              <span style={{ fontSize: '15px' }}>➕</span>
              <span>Asignar / Nueva Marca a {activeCountryObj.code}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Marcas en {activeCountryObj.code}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '850', color: '#0f172a', marginTop: '4px' }}>
              {totalBrandsInCountry}
            </div>
          </div>
          {CATEGORY_GROUPS.map(g => (
            <div key={g.key} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <span>{g.icon}</span>
                <span>{g.label.split('&')[0].trim()}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '850', color: g.color, marginTop: '4px' }}>
                {countsByCat[g.key] || 0}
              </div>
            </div>
          ))}
        </div>

        {/* Pills & Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setActiveCategoryPill('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: activeCategoryPill === 'all' ? '800' : '650',
                border: activeCategoryPill === 'all' ? '1.5px solid #0fa4de' : '1px solid #cbd5e1',
                background: activeCategoryPill === 'all' ? '#e0f2fe' : '#ffffff',
                color: activeCategoryPill === 'all' ? '#0284c7' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✨</span>
              <span>Todas ({totalBrandsInCountry})</span>
            </button>

            {CATEGORY_GROUPS.map(g => {
              const isSel = activeCategoryPill === g.key;
              const count = countsByCat[g.key] || 0;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setActiveCategoryPill(g.key)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: isSel ? '800' : '650',
                    border: isSel ? `1.5px solid ${g.color}` : '1px solid #cbd5e1',
                    background: isSel ? g.bg : '#ffffff',
                    color: isSel ? g.color : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                  <span style={{
                    background: isSel ? g.color : '#e2e8f0',
                    color: isSel ? '#ffffff' : '#64748b',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    marginLeft: '2px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', minWidth: '220px', flex: '0 1 280px' }}>
            <input
              type="text"
              placeholder={`🔍 Buscar marca en ${activeCountryObj.name}...`}
              value={brandAdminSearch}
              onChange={(e) => setBrandAdminSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 30px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '12.5px',
                fontWeight: '600',
                boxSizing: 'border-box'
              }}
            />
            {brandAdminSearch && (
              <button
                onClick={() => setBrandAdminSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* MODO 1: Asignador por Categorías */}
        {brandsViewMode === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => handleExpandAllCategories(true)}
                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔽 Desplegar Todas
              </button>
              <button
                type="button"
                onClick={() => handleExpandAllCategories(false)}
                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔼 Colapsar Todas
              </button>
            </div>

            {visibleGroups.map(group => {
              const isExpanded = Boolean(expandedCategoryKeys[group.key]);
              const rawList = (visualConfig?.categoryBrands && visualConfig.categoryBrands[group.key]) || [];
              const normalizedBrands = rawList.map((item, idx) => ({
                ...normalizeBrandItem(item, group.key),
                originalIdx: idx
              }));

              const displayedBrands = normalizedBrands.filter(b => {
                if (!qSearch) return true;
                return b.name.toLowerCase().includes(qSearch) || (b.tagline && b.tagline.toLowerCase().includes(qSearch));
              });

              const availableBrandsToAssign = (allAdminBrands || []).filter(mb => {
                const inScope = !mb.countries || mb.countries.length === 0 || mb.countries.includes(currentScopeCode);
                if (!inScope) return false;
                const alreadyAssigned = normalizedBrands.some(a => a.name.toLowerCase().trim() === mb.key);
                return !alreadyAssigned;
              }).sort((a, b) => a.name.localeCompare(b.name));

              return (
                <div
                  key={group.key}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: isExpanded ? `1.5px solid ${group.color}` : '1.5px solid #e2e8f0',
                    boxShadow: isExpanded ? '0 6px 20px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => toggleCategoryExpand(group.key)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isExpanded ? `${group.bg}` : '#ffffff',
                      userSelect: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isExpanded ? '#ffffff' : group.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        border: `1px solid ${group.color}44`,
                        flexShrink: 0
                      }}>
                        {group.icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
                            {group.label}
                          </h3>
                          <span style={{
                            background: displayedBrands.length > 0 ? (isExpanded ? group.color : '#e0f2fe') : '#f1f5f9',
                            color: displayedBrands.length > 0 ? (isExpanded ? '#ffffff' : '#0369a1') : '#64748b',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '2px 9px',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <span>{displayedBrands.length > 0 ? '●' : '○'}</span>
                            <span>{displayedBrands.length} {displayedBrands.length === 1 ? 'marca asignada' : 'marcas asignadas'}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                          {activeCountryObj.flag} Categoría activa para clientes de {activeCountryObj.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '750',
                        color: isExpanded ? group.color : '#64748b',
                        background: isExpanded ? '#ffffff' : '#f1f5f9',
                        border: isExpanded ? `1px solid ${group.color}44` : '1px solid #cbd5e1',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{isExpanded ? '▲ Ocultar marcas' : '▼ Ver marcas'}</span>
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: '18px 20px',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}>
                      <div style={{
                        background: '#ffffff',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>➕</span>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                              Asignar Marca de Marcas a {group.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Selecciona de los fabricantes ya registrados en el catálogo oficial para {activeCountryObj.name}.
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {availableBrandsToAssign.length > 0 ? (
                            <>
                              <select
                                value={selectedBrandToAssign[group.key] || ''}
                                onChange={(e) => setSelectedBrandToAssign(prev => ({ ...prev, [group.key]: e.target.value }))}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #0284c7',
                                  background: '#ffffff',
                                  fontSize: '12.5px',
                                  fontWeight: '700',
                                  color: '#0f172a',
                                  minWidth: '240px',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="">
                                  {availableBrandsToAssign.length === 0
                                    ? `(Todas las marcas de ${activeCountryObj.name || currentScopeCode} ya están asignadas)`
                                    : `-- Seleccionar de marcas de ${activeCountryObj.name || currentScopeCode} (${availableBrandsToAssign.length} disponibles) --`}
                                </option>
                                {availableBrandsToAssign.map(b => (
                                  <option key={b.key} value={b.key}>
                                    {b.name.toUpperCase()} {b.productCount > 0 ? `(${b.productCount} prods)` : ''}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleAssignBrandToCategory(group.key, selectedBrandToAssign[group.key])}
                                disabled={!selectedBrandToAssign[group.key]}
                                style={{
                                  background: selectedBrandToAssign[group.key] ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#e2e8f0',
                                  color: selectedBrandToAssign[group.key] ? '#ffffff' : '#94a3b8',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '8px 15px',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: selectedBrandToAssign[group.key] ? 'pointer' : 'not-allowed',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <span>✓</span>
                                <span>Asignar</span>
                              </button>
                            </>
                          ) : (
                            <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '5px 10px', borderRadius: '6px' }}>
                              ✓ Todas las marcas oficiales ya están asignadas a {group.label}
                            </div>
                          )}
                        </div>
                      </div>

                      {displayedBrands.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '30px 16px',
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1.5px dashed #cbd5e1',
                          color: '#64748b'
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏷️</div>
                          <div style={{ fontWeight: '750', fontSize: '13px', color: '#334155' }}>
                            No hay marcas asignadas a {group.label} en {activeCountryObj.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>
                            Elige un fabricante en el selector superior para mostrarlo en el Shop.
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                          gap: '10px'
                        }}>
                          {displayedBrands.map(b => {
                            const bKey = b.name.toLowerCase().trim();
                            const masterBrand = allAdminBrands.find(mb => mb.key === bKey) || {
                              key: bKey,
                              name: b.name.toUpperCase(),
                              logo: '',
                              color: group.color,
                              tagline: ''
                            };

                            return (
                              <div
                                key={b.originalIdx}
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  padding: '10px 14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px',
                                    flexShrink: 0
                                  }}>
                                    <BrandLogoImg
                                      src={masterBrand.logo}
                                      alt={masterBrand.name}
                                      name={masterBrand.name}
                                      color={masterBrand.color || group.color}
                                      size={24}
                                    />
                                  </div>

                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{
                                      fontWeight: '800',
                                      fontSize: '12.5px',
                                      color: '#0f172a',
                                      textTransform: 'uppercase',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {masterBrand.name}
                                    </div>
                                    <div style={{
                                      fontSize: '10.5px',
                                      color: '#64748b',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {masterBrand.tagline || 'Fabricante Oficial'}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleUnassignBrandFromCategory(group.key, b.originalIdx, masterBrand.name, group.label)}
                                  title={`Quitar ${masterBrand.name} de ${group.label}`}
                                  style={{
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    borderRadius: '7px',
                                    padding: '5px 9px',
                                    fontSize: '11px',
                                    fontWeight: '750',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    flexShrink: 0
                                  }}
                                >
                                  <span>✕</span>
                                  <span>Quitar</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODO 2: Directorio Completo de Tarjetas */}
        {brandsViewMode === 'grid' && (
          <div>
            {filteredAdminBrands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
                <h4 style={{ margin: 0, color: '#334155' }}>No se encontraron marcas en {activeCountryObj.name}</h4>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Prueba ajustando el término de búsqueda.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
                {filteredAdminBrands.map(b => (
                  <div
                    key={b.key}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <BrandLogoImg src={b.logo} alt={b.name} name={b.name} color={b.color} size={30} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{
                            background: b.productCount > 0 ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                            color: b.productCount > 0 ? '#10b981' : '#94a3b8',
                            fontWeight: '750',
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
                          {b.banner && (
                            <span style={{
                              background: '#F0FDF4',
                              color: '#15803D',
                              border: '1px solid #BBF7D0',
                              fontWeight: '750',
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🖼️ Con Banner
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: '850', color: '#0f172a' }}>
                        {b.name}
                      </h3>

                      <p style={{
                        margin: '0 0 12px',
                        fontSize: '0.82rem',
                        color: '#475569',
                        lineHeight: 1.4,
                        background: '#f8fafc',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        minHeight: '38px'
                      }}>
                        {b.tagline}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748b' }}>
                          📂 Mover a:
                        </span>
                        <select
                          value={b.category}
                          onChange={(e) => handleReassignBrandCategory(b.name, b.category, e.target.value)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '750',
                            color: '#0f172a',
                            border: '1.5px solid #0fa4de',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            background: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="networking">🌐 Networking</option>
                          <option value="infraestructura">⚡ Infraestructura</option>
                          <option value="comunicaciones_unificadas">📞 Comunicaciones</option>
                          <option value="security">🛡️ Seguridad</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditBrand(b.key, b.category, b.originalIdx)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '12px',
                          fontWeight: '750',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>✏️</span>
                        <span>Editar Marca</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(b.category, b.originalIdx, b.name)}
                        title={`Quitar marca de ${activeCountryObj.name}`}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '12px',
                          fontWeight: '750',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Editar Marca */}
        <BrandEditModal
          editingBrandModal={editingBrandModal}
          setEditingBrandModal={setEditingBrandModal}
          handleSaveBrandModal={handleSaveBrandModal}
          isUploadingBrandLogo={isUploadingBrandLogo}
          isUploadingBrandBanner={isUploadingBrandBanner}
          handleUploadBrandLogo={handleUploadBrandLogo}
          handleUploadBrandBanner={handleUploadBrandBanner}
          dacasCountriesList={DACAS_COUNTRIES_LIST}
        />

        {/* Modal Crear Marca */}
        <BrandCreateModal
          isOpen={showNewBrandModal}
          onClose={() => setShowNewBrandModal(false)}
          newBrandForm={newBrandForm}
          setNewBrandForm={setNewBrandForm}
          handleCreateNewBrand={handleCreateNewBrand}
          isUploadingBrandLogo={isUploadingBrandLogo}
          isUploadingBrandBanner={isUploadingBrandBanner}
          handleUploadBrandLogo={handleUploadBrandLogo}
          handleUploadBrandBanner={handleUploadBrandBanner}
          dacasCountriesList={DACAS_COUNTRIES_LIST}
        />
      </section>
    );
  }

  // 3. COUNTRIES VIEW
  if (activeTab === 'countries') {
    return (
      <section className="board-section" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Países y Reglas Fiscales/Envíos</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#6b7280' }}>
              Parámetros multi-tenancy regionales: aranceles aduaneros, IVA local y costos logísticos base.
            </p>
          </div>
          <button
            className="nav-btn"
            onClick={() => { resetCountryForm(); setShowCountryForm(true); }}
            style={{
              background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ➕ Nuevo País
          </button>
        </div>

        {showCountryForm && (
          <div style={{ background: 'var(--card-bg, #ffffff)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.15rem', color: '#0f172a' }}>{editingCountry ? 'Editar Parámetros de País' : 'Nuevo País / Sede Regional'}</h3>
            <form onSubmit={handleCountrySubmit} className="crm-form">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Código ISO (e.g. AR, UY, CL, MX) *</label>
                  <input
                    type="text"
                    value={countryForm.code}
                    onChange={e => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                    required
                    maxLength="5"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Nombre del País *</label>
                  <input
                    type="text"
                    value={countryForm.name}
                    onChange={e => setCountryForm({ ...countryForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Impuesto / IVA (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={countryForm.tax_rate}
                    onChange={e => setCountryForm({ ...countryForm, tax_rate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Costo de Envío Base ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={countryForm.shipping_cost}
                    onChange={e => setCountryForm({ ...countryForm, shipping_cost: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Costo Aduana / Nacionalización ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={countryForm.nationalization_cost}
                    onChange={e => setCountryForm({ ...countryForm, nationalization_cost: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Descuento por País (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={countryForm.discount_rate}
                    onChange={e => setCountryForm({ ...countryForm, discount_rate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{ background: '#0fa4de', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingCountry ? 'Guardar Cambios' : 'Crear País'}
                </button>
                <button
                  type="button"
                  onClick={resetCountryForm}
                  style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="crm-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="users-table crm-compact-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Código</th>
                <th>Nombre</th>
                <th style={{ textAlign: 'right' }}>IVA (%)</th>
                <th style={{ textAlign: 'right' }}>Envío Base</th>
                <th style={{ textAlign: 'right' }}>Nacionalización</th>
                <th style={{ textAlign: 'right' }}>Desc. País</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {countries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No hay países registrados.
                  </td>
                </tr>
              ) : (
                countries.map(c => (
                  <tr key={c.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: '#0369a1' }}>{c.code}</strong></td>
                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                    <td style={{ textAlign: 'right' }}>{c.tax_rate}%</td>
                    <td style={{ textAlign: 'right' }}>${c.shipping_cost}</td>
                    <td style={{ textAlign: 'right' }}>${c.nationalization_cost}</td>
                    <td style={{ textAlign: 'right' }}>{c.discount_rate}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditCountry(c)}
                          style={{ background: '#0fa4de', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCountry(c.id)}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return null;
}
