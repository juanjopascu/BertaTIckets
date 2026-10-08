import React, { useState, useMemo, useRef } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import { BrandLogoImg, BRAND_INFO } from '../../../Shop';
import CarouselEditorCard, { CAROUSEL_CATEGORIES } from './CarouselEditorCard';
import { API_BASE_URL, DACAS_COUNTRIES_LIST, sanitizeVisualConfig } from '../adminHelpers';

export default function VisualTab({
  visualConfig,
  setVisualConfig,
  activeCountryObj,
  selectedCountryScope,
  onCountryScopeChange,
  products = [],
  onNavigateToBrands,
  getAuthHeader
}) {
  const [visualSubTab, setVisualSubTab] = useState('hero');
  const [editingSlideIdx, setEditingSlideIdx] = useState(0);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [isSavingVisual, setIsSavingVisual] = useState(false);
  const [visualSaveSuccess, setVisualSaveSuccess] = useState(false);
  const bannerFileInputRef = useRef(null);

  // Desplegables para asignador de marcas por categoría
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState({
    networking: true,
    infraestructura: false,
    comunicaciones_unificadas: false,
    security: false
  });
  const [selectedBrandToAssign, setSelectedBrandToAssign] = useState({});

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

  // Brands list derived from products
  const availableBrandsList = useMemo(() => {
    const set = new Set();
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.brand) set.add(p.brand.toLowerCase());
      });
    }
    return Array.from(set).sort();
  }, [products]);

  // All master brands
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

      let countries = meta.countries || [];
      if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[key])) {
        countries = visualConfig.brandCountries[key];
      }

      return {
        key,
        name: finalName,
        logo: finalLogo,
        tagline: finalTagline,
        color: finalColor,
        countries,
        productCount: products.filter(p => p.brand && p.brand.toLowerCase() === key).length
      };
    });
  }, [visualConfig, products]);

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

  // Save visual settings
  const handleSaveVisualSettings = async () => {
    setIsSavingVisual(true);
    setVisualSaveSuccess(false);
    try {
      const target = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${target}`, {
        method: 'PUT',
        headers,
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

  // Reset visual settings
  const handleResetVisualSettings = async () => {
    const target = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
    if (!window.confirm(`¿Deseas restaurar la configuración visual de ${target} a la plantilla oficial de DACAS?`)) return;
    setIsSavingVisual(true);
    try {
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual/reset?country=${target}`, {
        method: 'POST',
        headers
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

  // Slide handlers
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
      primaryBtn: { text: 'Ver Catálogo', link: '/shop', enabled: true },
      secondaryBtn: { text: 'Consultar Stock', link: '/contacto', enabled: true },
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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;
        handleUpdateSlideField(slideIdx, 'imageUrl', base64Url);

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

  // Brand Banners handlers
  const handleUpdateBrandBanner = (index, field, value) => {
    if (!visualConfig) return;
    const banners = [...(visualConfig.brandBanners || [])];
    banners[index] = { ...banners[index], [field]: value };
    setVisualConfig({ ...visualConfig, brandBanners: banners });
  };

  // Carousels handlers
  const handleAddCarousel = () => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    const newCarousel = {
      id: `car_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `⚡ Nuevo Carrusel #${list.length + 1}`,
      subtitle: 'Soluciones corporativas seleccionadas para canales de distribución',
      badge: 'DESTACADO',
      badgeColor: '#0fa4de',
      icon: 'star',
      enabled: true,
      selectionType: 'category',
      targetCategory: 'networking',
      targetBrand: 'all',
      productIds: []
    };
    const updatedList = [...list, newCarousel];
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list: updatedList
      }
    });
  };

  const handleUpdateCarousel = (idx, field, value) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    list[idx] = { ...list[idx], [field]: value };
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleToggleCarouselProduct = (idx, productId) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    const currentIds = Array.isArray(list[idx].productIds) ? [...list[idx].productIds] : [];
    const idNum = parseInt(productId);
    const exists = currentIds.includes(idNum);
    const updated = exists ? currentIds.filter(id => id !== idNum) : [...currentIds, idNum];
    list[idx] = { ...list[idx], productIds: updated };
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleSelectAllVisibleProducts = (idx, visibleIds) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    const currentIds = Array.isArray(list[idx].productIds) ? [...list[idx].productIds] : [];
    const idSet = new Set(currentIds.map(id => parseInt(id)));
    visibleIds.forEach(id => idSet.add(parseInt(id)));
    list[idx] = { ...list[idx], productIds: Array.from(idSet) };
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleClearAllCarouselProducts = (idx) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    list[idx] = { ...list[idx], productIds: [] };
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleMoveCarousel = (idx, dir) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleDeleteCarousel = (idx) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    if (!window.confirm(`¿Seguro que deseas eliminar el carrusel "${list[idx].title}"?`)) return;
    list.splice(idx, 1);
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleDuplicateCarousel = (idx) => {
    const list = Array.isArray(visualConfig?.homeCarousels?.list) ? [...visualConfig.homeCarousels.list] : [];
    if (!list[idx]) return;
    const original = list[idx];
    const clone = {
      ...original,
      id: `car_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${original.title} (Copia)`,
      productIds: [...(original.productIds || [])]
    };
    list.splice(idx + 1, 0, clone);
    setVisualConfig({
      ...visualConfig,
      homeCarousels: {
        ...visualConfig.homeCarousels,
        list
      }
    });
  };

  const handleCopyCarouselsFromCountry = async (sourceCountryCode) => {
    if (!sourceCountryCode || sourceCountryCode === selectedCountryScope) return;
    if (!window.confirm(`¿Deseas reemplazar los carruseles actuales de ${selectedCountryScope} copiando la lista completa de ${sourceCountryCode}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${sourceCountryCode}`);
      if (res.ok) {
        const data = await res.json();
        const sanitized = sanitizeVisualConfig(data);
        const sourceCarousels = sanitized.homeCarousels?.list || [];
        setVisualConfig({
          ...visualConfig,
          homeCarousels: {
            ...visualConfig.homeCarousels,
            list: JSON.parse(JSON.stringify(sourceCarousels))
          }
        });
        alert(`¡Carruseles copiados con éxito desde ${sourceCountryCode}! Recuerda presionar "Guardar Cambios".`);
      }
    } catch (err) {
      alert('Error copiando carruseles: ' + err.message);
    }
  };

  // Brand Assignment handlers
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

    let brandCountries = [];
    if (visualConfig?.brandCountries && Array.isArray(visualConfig.brandCountries[cleanKey])) {
      brandCountries = visualConfig.brandCountries[cleanKey];
    } else {
      brandCountries = [currentScope];
    }

    const newBrandItem = {
      name: cleanKey,
      countries: brandCountries
    };

    const updatedList = [...currentList, newBrandItem];
    const newConfig = {
      ...visualConfig,
      categoryBrands: {
        ...(visualConfig?.categoryBrands || {}),
        [catKey]: updatedList
      }
    };

    setVisualConfig(newConfig);
    setSelectedBrandToAssign(prev => ({ ...prev, [catKey]: '' }));

    try {
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${currentScope}`, {
        method: 'PUT',
        headers,
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

    setVisualConfig(newConfig);

    try {
      const currentScope = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
      const headers = getAuthHeader ? getAuthHeader() : { 'Content-Type': 'application/json' };
      await fetch(`${API_BASE_URL}/api/ecommerce/settings/visual?country=${currentScope}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.error('Error persistiendo desvinculación de marca:', err);
    }
  };

  const currentScopeCode = (selectedCountryScope && selectedCountryScope !== 'all') ? selectedCountryScope : 'AR';
  const currentCountryObj = DACAS_COUNTRIES_LIST.find(c => c.code === currentScopeCode) || activeCountryObj || {
    code: currentScopeCode,
    name: currentScopeCode,
    flag: '🇦🇷'
  };

  const CATEGORIES_DEF = [
    {
      key: 'networking',
      title: 'Networking',
      icon: '🌐',
      desc: 'Switches gestionables, Routers empresariales, Wi-Fi 6 y Conectividad',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)'
    },
    {
      key: 'infraestructura',
      title: 'Infraestructura',
      icon: '⚡',
      desc: 'Energía Crítica UPS Online, Racks 42U y Cableado Estructurado',
      color: '#d97706',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      key: 'comunicaciones_unificadas',
      title: 'Comunicaciones Unificadas',
      icon: '📞',
      desc: 'Gateways de Voz, SBCs, Telefonía IP Microsoft Teams & Salas Avaya',
      color: '#059669',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      key: 'security',
      title: 'Seguridad & Ciberseguridad',
      icon: '🛡️',
      desc: 'Next-Gen Firewalls FortiGate, Sandboxing con IA y Protección de Datos',
      color: '#dc2626',
      bg: 'rgba(239, 68, 68, 0.08)'
    }
  ];

  return (
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
          <span style={{ fontSize: '30px' }}>{currentCountryObj.flag || '🌎'}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
              Editando Banners, Carruseles y Home para: <span style={{ color: '#0284c7' }}>{currentCountryObj.name} ({currentCountryObj.code})</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Multi-tenancy activo: los banners, carruseles y anuncios son 100% independientes para este país.
            </div>
          </div>
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
                const isImageOnly = (slide.type === 'custom_image' && slide.showOverlayText !== true) || slide.showOverlayText === false;
                const hasBackground = Boolean(slide.imageUrl);

                return (
                  <div style={{
                    background: 'linear-gradient(135deg, #071524 0%, #0f2742 60%, #12354c 100%)',
                    borderRadius: '20px',
                    padding: isImageOnly ? '0' : '32px 36px',
                    color: '#FFFFFF',
                    marginBottom: '24px',
                    border: '1px solid rgba(15, 164, 222, 0.35)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '260px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {/* Imagen de Fondo si está cargada */}
                    {hasBackground && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <img
                          src={slide.imageUrl}
                          alt="Preview Fondo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {!isImageOnly && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: slide.overlayStyle === 'strong'
                              ? 'linear-gradient(90deg, rgba(7, 21, 36, 0.96) 0%, rgba(7, 21, 36, 0.88) 50%, rgba(7, 21, 36, 0.72) 100%)'
                              : slide.overlayStyle === 'light'
                              ? 'linear-gradient(90deg, rgba(7, 21, 36, 0.82) 0%, rgba(7, 21, 36, 0.6) 50%, rgba(7, 21, 36, 0.25) 100%)'
                              : slide.overlayStyle === 'none'
                              ? 'transparent'
                              : 'linear-gradient(90deg, rgba(7, 21, 36, 0.94) 0%, rgba(7, 21, 36, 0.82) 48%, rgba(7, 21, 36, 0.55) 75%, rgba(7, 21, 36, 0.35) 100%)'
                          }} />
                        )}
                      </div>
                    )}

                    {/* Badge de Estado del Slide */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '16px',
                      background: 'rgba(7, 21, 36, 0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(15, 164, 222, 0.4)',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      letterSpacing: '0.05em',
                      zIndex: 10
                    }}>
                      {hasBackground ? (isImageOnly ? '🖼️ SOLO IMAGEN DE FONDO' : '✨ FONDO + TEXTOS COMBINADOS') : '📊 DISEÑO TECNOLÓGICO DACAS'} • SLIDE #{editingSlideIdx + 1}
                    </div>

                    {/* Contenido en Modo Solo Imagen */}
                    {isImageOnly ? (
                      <div style={{ width: '100%', height: '260px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '20px' }}>
                        {slide.primaryBtn?.enabled !== false && slide.primaryBtn?.text && (
                          <span style={{
                            background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                            color: '#fff',
                            padding: '10px 22px',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: '750',
                            boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
                          }}>
                            {slide.primaryBtn.text} →
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Contenido en Modo Combinado o Estándar */
                      <div style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '320px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(15, 164, 222, 0.2)',
                            border: `1px solid ${slide.titleColor || '#0fa4de'}`,
                            color: slide.titleColor || '#38bdf8',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            marginBottom: '12px',
                            backdropFilter: 'blur(6px)'
                          }}>
                            <span>{slide.badgeIcon || '🛡️'}</span> {slide.badge || 'BADGE DEL BANNER'}
                          </div>

                          <h3 style={{ margin: '0 0 10px', fontSize: '1.75rem', fontWeight: '900', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {slide.titleLine1 || 'Título Línea 1'} <br />
                            <span style={{ color: slide.titleColor || '#0fa4de' }}>
                              {slide.titleLine2 || 'Título Línea 2'}
                            </span>
                          </h3>

                          <p style={{ color: '#E2E8F0', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 18px', maxWidth: '650px', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                            {slide.desc || 'Descripción del slide para el cliente'}
                          </p>

                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {slide.primaryBtn?.enabled !== false && slide.primaryBtn?.text && (
                              <span style={{
                                background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                                color: '#fff',
                                padding: '10px 22px',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: '750',
                                boxShadow: '0 4px 14px rgba(15, 164, 222, 0.4)'
                              }}>
                                {slide.primaryBtn.text} →
                              </span>
                            )}
                            {slide.secondaryBtn?.enabled !== false && slide.secondaryBtn?.text && (
                              <span style={{
                                background: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(15, 164, 222, 0.35)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                padding: '10px 22px',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                {slide.secondaryBtn.text}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* KPIs laterales en la preview */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {(Array.isArray(slide?.metrics) ? slide.metrics : []).slice(0, 3).map((m, mIdx) => (
                            <div key={mIdx} style={{
                              textAlign: 'center',
                              background: 'rgba(15, 39, 66, 0.85)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(15, 164, 222, 0.3)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              minWidth: '95px'
                            }}>
                              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: slide.titleColor || '#0fa4de' }}>
                                {m.value || '--'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px', fontWeight: '600' }}>
                                {m.label || '--'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 📐 Ficha de Especificaciones Técnicas */}
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

              {/* Slides Stacked */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
                
                {/* Cuadrante Superior: Lista de Diapositivas Activas */}
                <div style={{ background: '#FFFFFF', padding: '22px 26px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎞️</span> Diapositivas Activas del Hero ({visualConfig.heroSlides?.length || 0})
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                        Haz clic en cualquier diapositiva para seleccionarla y editarla a pantalla completa abajo. Reordena la secuencia con ⬅️ y ➡️.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
                        transition: 'all 0.15s'
                      }}
                    >
                      ➕ Agregar Nuevo Slide
                    </button>
                  </div>

                  {(!visualConfig.heroSlides || visualConfig.heroSlides.length === 0) ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <p style={{ margin: '0 0 10px', color: '#64748B', fontWeight: '600' }}>No hay diapositivas activas configuradas.</p>
                      <button type="button" onClick={handleAddSlide} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                        ➕ Crear Primera Diapositiva
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                      {visualConfig.heroSlides.map((s, idx) => {
                        const isSelected = editingSlideIdx === idx;
                        const isImageOnlySlide = (s.type === 'custom_image' && s.showOverlayText !== true) || s.showOverlayText === false;
                        const typeBadge = isImageOnlySlide ? '🖼️ Solo Imagen' : s.imageUrl ? '✨ Fondo + Textos' : s.type === 'animated_stats' ? '⚡ Animado' : '📊 Título + KPIs';
                        const slideKey = `hero-slide-item-${s?.id !== undefined && s?.id !== null ? s.id : idx}`;
                        
                        return (
                          <div
                            key={slideKey}
                            onClick={() => setEditingSlideIdx(idx)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '14px',
                              background: isSelected ? '#F0F9FF' : '#F8FAFC',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #E2E8F0',
                              boxShadow: isSelected ? '0 6px 18px rgba(2, 132, 199, 0.16)' : '0 1px 3px rgba(0,0,0,0.02)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.18s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                              {s.imageUrl ? (
                                <img 
                                  src={s.imageUrl} 
                                  alt={`Slide ${idx + 1}`} 
                                  style={{ width: '52px', height: '38px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1', flexShrink: 0, background: '#071524' }} 
                                />
                              ) : (
                                <div style={{ width: '52px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #071524 0%, #0f2742 100%)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                                  {s.badgeIcon || '🛡️'}
                                </div>
                              )}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: s.titleColor || '#0284c7' }}>
                                  <span>SLIDE #{idx + 1}</span>
                                  {isSelected ? (
                                    <span style={{ background: '#0284c7', color: '#FFFFFF', padding: '1px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '800' }}>
                                      ✓ Editando
                                    </span>
                                  ) : (
                                    <span style={{ background: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '5px', fontSize: '9.5px', fontWeight: '600' }}>
                                      {typeBadge}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {s.titleLine1 || 'Sin título'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, -1)}
                                disabled={idx === 0}
                                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '7px', padding: '5px 8px', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: idx === 0 ? 0.35 : 1 }}
                                title="Mover a la izquierda / antes"
                              >
                                ⬅️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, 1)}
                                disabled={idx === visualConfig.heroSlides.length - 1}
                                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '7px', padding: '5px 8px', cursor: idx === visualConfig.heroSlides.length - 1 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: idx === visualConfig.heroSlides.length - 1 ? 0.35 : 1 }}
                                title="Mover a la derecha / después"
                              >
                                ➡️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(idx)}
                                style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '12px' }}
                                title="Eliminar slide"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cuadrante Inferior: Personalización del Slide a Pantalla Completa */}
                {visualConfig.heroSlides && visualConfig.heroSlides[editingSlideIdx] && (() => {
                  const cur = visualConfig.heroSlides[editingSlideIdx];
                  return (
                    <div style={{ background: '#FFFFFF', padding: '26px 30px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%' }}>
                      
                      {/* Header con Título y Botón Guardar Directo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>✏️</span> Personalizando Slide #{editingSlideIdx + 1}: {cur.titleLine1 || 'Banner Principal'}
                            </h4>
                            <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '3px 9px', borderRadius: '6px', fontWeight: '800' }}>
                              📐 1920 × 500 px
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                            Configura el tipo de diseño, la imagen, los textos, enlaces y botones de este slide.
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {visualSaveSuccess && (
                            <span style={{ color: '#10B981', fontSize: '12.5px', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              ✅ ¡Cambios guardados!
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleSaveVisualSettings}
                            disabled={isSavingVisual}
                            style={{
                              background: '#0fa4de',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '9px 20px',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: isSavingVisual ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '7px',
                              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span>💾</span> {isSavingVisual ? 'Guardando...' : 'Guardar Banners'}
                          </button>
                        </div>
                      </div>

                      {/* 1. Selector de Modo de Banner */}
                      <div style={{ marginBottom: '22px', background: '#F8FAFC', padding: '16px 18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
                          🎨 1. Tipo de Presentación del Banner
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                          {[
                            { id: 'metrics', label: '📊 Título + 3 KPIs Laterales', desc: 'Textos, botones y 3 métricas destacadas (admite imagen de fondo)' },
                            { id: 'animated_stats', label: '⚡ Animado Core DACAS', desc: 'Textos, botones y contadores tecnológicos (admite imagen de fondo)' },
                            { id: 'custom_image', label: '🖼️ Solo Imagen (Sin Textos)', desc: 'Para banners prediseñados donde no requieres textos sobreimpresos' }
                          ].map(t => {
                            const isSelected = t.id === 'custom_image'
                              ? (cur.type === 'custom_image' && cur.showOverlayText !== true) || cur.showOverlayText === false
                              : (cur.type || 'metrics') === t.id && cur.showOverlayText !== false;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  if (t.id === 'custom_image') {
                                    handleUpdateSlideField(editingSlideIdx, 'type', 'custom_image');
                                    handleUpdateSlideField(editingSlideIdx, 'showOverlayText', false);
                                  } else {
                                    handleUpdateSlideField(editingSlideIdx, 'type', t.id);
                                    handleUpdateSlideField(editingSlideIdx, 'showOverlayText', true);
                                  }
                                }}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  textAlign: 'left',
                                  background: isSelected ? '#0284c7' : '#FFFFFF',
                                  color: isSelected ? '#FFFFFF' : '#334155',
                                  border: `2px solid ${isSelected ? '#0284c7' : '#CBD5E1'}`,
                                  cursor: 'pointer',
                                  fontSize: '12.5px',
                                  fontWeight: '750',
                                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.22)' : 'none',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ fontSize: '13px', marginBottom: '3px' }}>{t.label}</div>
                                <div style={{ fontSize: '11px', opacity: isSelected ? 0.95 : 0.75, fontWeight: '500' }}>{t.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Imagen de Fondo del Banner */}
                      <div style={{ marginBottom: '22px', background: '#F0F9FF', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid #BAE6FD' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '13.5px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                              <span>🖼️</span> 2. Imagen de Fondo del Banner (Ocupa el 100% del Slide)
                            </label>
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                              Cubre todo el ancho y alto del slide. Puedes combinarla con textos y botones por encima.
                            </div>
                          </div>
                          <span style={{ fontSize: '11.5px', background: '#E0F2FE', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                            Resolución Oficial: 1920 × 500 px
                          </span>
                        </div>

                        <input
                          type="file"
                          ref={bannerFileInputRef}
                          accept="image/webp,image/png,image/jpeg,image/jpg"
                          style={{ display: 'none' }}
                          onChange={(e) => handleBannerFileUpload(e, editingSlideIdx)}
                        />

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
                          <button
                            type="button"
                            onClick={() => bannerFileInputRef.current && bannerFileInputRef.current.click()}
                            disabled={uploadingBanner}
                            style={{
                              background: '#0fa4de',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: uploadingBanner ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 3px 10px rgba(15, 164, 222, 0.3)'
                            }}
                          >
                            <span>📁</span> {uploadingBanner ? 'Subiendo imagen...' : 'Cargar Foto desde la PC'}
                          </button>

                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>o ingresa una URL:</span>

                          <input
                            type="text"
                            value={cur.imageUrl || ''}
                            onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'imageUrl', e.target.value)}
                            placeholder="https://servidor.com/banner-1920x500.webp"
                            style={{ flex: 1, minWidth: '240px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', background: '#FFFFFF' }}
                          />

                          {cur.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateSlideField(editingSlideIdx, 'imageUrl', '')}
                              style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '9px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                            >
                              🗑️ Quitar Foto
                            </button>
                          )}
                        </div>

                        {!cur.imageUrl ? (
                          <div
                            onClick={() => bannerFileInputRef.current && bannerFileInputRef.current.click()}
                            style={{
                              border: '2px dashed #93C5FD',
                              borderRadius: '12px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              background: 'rgba(255, 255, 255, 0.75)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#0284c7'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                          >
                            <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>☁️</div>
                            <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0369A1' }}>
                              Haz clic aquí o arrastra tu imagen para cubrir el fondo del banner
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                              Formatos: WebP, PNG, JPG • Máximo 15 MB • Se adaptará a pantalla completa (1920×500 px)
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', position: 'relative', background: '#071524' }}>
                              <img 
                                src={cur.imageUrl} 
                                alt="Banner Preview" 
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} 
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '12px',
                                background: 'rgba(7, 21, 36, 0.88)',
                                color: '#38bdf8',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '750',
                                backdropFilter: 'blur(6px)',
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                              }}>
                                ✓ Imagen de Fondo Cargada (1920×500 px)
                              </div>
                            </div>

                            {/* Controles Interactivos de Combinación */}
                            <div style={{ marginTop: '14px', background: '#FFFFFF', padding: '14px 16px', borderRadius: '10px', border: '1px solid #BAE6FD', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={(cur.showOverlayText !== false && cur.type !== 'custom_image') || cur.showOverlayText === true}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    handleUpdateSlideField(editingSlideIdx, 'showOverlayText', checked);
                                    if (checked && cur.type === 'custom_image') {
                                      handleUpdateSlideField(editingSlideIdx, 'type', 'metrics');
                                    } else if (!checked) {
                                      handleUpdateSlideField(editingSlideIdx, 'type', 'custom_image');
                                    }
                                  }}
                                  style={{ width: '18px', height: '18px', accentColor: '#0284c7', cursor: 'pointer' }}
                                />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0369A1' }}>
                                    ✨ Superponer textos, botones y métricas sobre la imagen de fondo (Modo Combinado)
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                    Mantén activo para ver títulos, descripción, botones de acción y 3 KPIs sobre la fotografía.
                                  </div>
                                </div>
                              </label>

                              {((cur.showOverlayText !== false && cur.type !== 'custom_image') || cur.showOverlayText === true) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#475569' }}>
                                    🌓 Contraste / Oscurecimiento para lectura:
                                  </span>
                                  {[
                                    { id: 'medium', label: 'Equilibrado (Recomendado)' },
                                    { id: 'strong', label: 'Fuerte (Más oscuro)' },
                                    { id: 'light', label: 'Suave' },
                                    { id: 'none', label: 'Sin oscurecimiento' }
                                  ].map(lvl => (
                                    <button
                                      key={lvl.id}
                                      type="button"
                                      onClick={() => handleUpdateSlideField(editingSlideIdx, 'overlayStyle', lvl.id)}
                                      style={{
                                        background: (cur.overlayStyle || 'medium') === lvl.id ? '#0284c7' : '#F8FAFC',
                                        color: (cur.overlayStyle || 'medium') === lvl.id ? '#FFFFFF' : '#334155',
                                        border: `1.5px solid ${(cur.overlayStyle || 'medium') === lvl.id ? '#0284c7' : '#CBD5E1'}`,
                                        padding: '5px 11px',
                                        borderRadius: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      {lvl.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Textos, Badges, Colores y Botones */}
                      {((cur.type !== 'custom_image' && cur.showOverlayText !== false) || cur.showOverlayText === true) ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px', marginBottom: '22px' }}>
                            
                            {/* Columna Izquierda: Badges, Títulos y Color */}
                            <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                              <h5 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>🏷️</span> Identidad Visual & Títulos
                              </h5>

                              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px', marginBottom: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                                    Ícono / Emoji
                                  </label>
                                  <input
                                    type="text"
                                    value={cur.badgeIcon || ''}
                                    onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'badgeIcon', e.target.value)}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', textAlign: 'center' }}
                                    placeholder="🛡️"
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                                    Texto del Badge Superior
                                  </label>
                                  <input
                                    type="text"
                                    value={cur.badge || ''}
                                    onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'badge', e.target.value)}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                                    placeholder="DISTRIBUIDOR OFICIAL MAYORISTA"
                                  />
                                </div>
                              </div>

                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                                  Título Línea 1 (Texto Principal)
                                </label>
                                <input
                                  type="text"
                                  value={cur.titleLine1 || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleLine1', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontWeight: '700' }}
                                  placeholder="Equipamiento IT, Redes"
                                />
                              </div>

                              <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                                  Título Línea 2 (Texto con Color de Acento)
                                </label>
                                <input
                                  type="text"
                                  value={cur.titleLine2 || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleLine2', e.target.value)}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontWeight: '700', color: cur.titleColor || '#0fa4de' }}
                                  placeholder="& Ciberseguridad Enterprise"
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                                  Color de Acento del Título
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <input
                                    type="color"
                                    value={cur.titleColor || '#0fa4de'}
                                    onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'titleColor', e.target.value)}
                                    style={{ width: '38px', height: '34px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '2px' }}
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
                                        background: cur.titleColor === p.color ? p.color : '#FFFFFF',
                                        color: cur.titleColor === p.color ? '#FFF' : '#334155',
                                        border: `1.5px solid ${cur.titleColor === p.color ? p.color : '#CBD5E1'}`,
                                        borderRadius: '8px',
                                        padding: '5px 9px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}
                                    >
                                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: p.color }}></span>
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Columna Derecha: Descripción & Botones de Acción */}
                            <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                              <h5 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>🔘</span> Descripción & Botones de Acción
                              </h5>

                              <div style={{ marginBottom: '14px', flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                                  Descripción del Slide
                                </label>
                                <textarea
                                  value={cur.desc || ''}
                                  onChange={(e) => handleUpdateSlideField(editingSlideIdx, 'desc', e.target.value)}
                                  rows={3}
                                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', resize: 'vertical' }}
                                  placeholder="Texto explicativo para los clientes..."
                                />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Botón Primario */}
                                <div style={{
                                  background: cur.primaryBtn?.enabled !== false ? '#FFFFFF' : '#F1F5F9',
                                  padding: '12px',
                                  borderRadius: '10px',
                                  border: cur.primaryBtn?.enabled !== false ? '1.5px solid #BAE6FD' : '1px solid #CBD5E1',
                                  transition: 'all 0.2s ease'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: cur.primaryBtn?.enabled !== false ? '#0284c7' : '#64748B', margin: 0 }}>
                                      <span>🔘</span> Botón Primario
                                    </label>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cur.primaryBtn?.enabled !== false ? '#0369A1' : '#64748B' }}>
                                      <input
                                        type="checkbox"
                                        checked={cur.primaryBtn?.enabled !== false}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'enabled', e.target.checked)}
                                        style={{ cursor: 'pointer', accentColor: '#0284c7', width: '14px', height: '14px' }}
                                      />
                                      {cur.primaryBtn?.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                                    </label>
                                  </div>

                                  <div style={{ opacity: cur.primaryBtn?.enabled !== false ? 1 : 0.45, pointerEvents: cur.primaryBtn?.enabled !== false ? 'auto' : 'none' }}>
                                    <div style={{ marginBottom: '6px' }}>
                                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#64748B', marginBottom: '3px' }}>
                                        Texto del Botón
                                      </label>
                                      <input
                                        type="text"
                                        value={cur.primaryBtn?.text || ''}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'text', e.target.value)}
                                        placeholder="Texto botón (ej: Ver Seguridad)"
                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#64748B', marginBottom: '3px' }}>
                                        🔗 Hipervínculo / Destino (URL)
                                      </label>
                                      <input
                                        type="text"
                                        value={cur.primaryBtn?.link !== undefined ? cur.primaryBtn.link : (cur.primaryBtn?.cat ? (cur.primaryBtn.cat === 'all' ? '/shop' : `/shop?cat=${cur.primaryBtn.cat}`) : '')}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'link', e.target.value)}
                                        placeholder="https://... o /shop?cat=security"
                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                                      {[
                                        { label: 'Catálogo', link: '/shop' },
                                        { label: 'Seguridad', link: '/shop?cat=security' },
                                        { label: 'Networking', link: '/shop?cat=networking' }
                                      ].map(s => (
                                        <button
                                          key={s.label}
                                          type="button"
                                          onClick={() => handleUpdateSlideBtn(editingSlideIdx, 'primaryBtn', 'link', s.link)}
                                          style={{
                                            background: '#F0F9FF',
                                            border: '1px solid #BAE6FD',
                                            borderRadius: '4px',
                                            padding: '1px 6px',
                                            fontSize: '9.5px',
                                            color: '#0369A1',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                          }}
                                        >
                                          {s.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Botón Secundario */}
                                <div style={{
                                  background: cur.secondaryBtn?.enabled !== false ? '#FFFFFF' : '#F1F5F9',
                                  padding: '12px',
                                  borderRadius: '10px',
                                  border: cur.secondaryBtn?.enabled !== false ? '1.5px solid #CBD5E1' : '1px solid #E2E8F0',
                                  transition: 'all 0.2s ease'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: cur.secondaryBtn?.enabled !== false ? '#334155' : '#64748B', margin: 0 }}>
                                      <span>🔘</span> Botón Secundario
                                    </label>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: cur.secondaryBtn?.enabled !== false ? '#334155' : '#64748B' }}>
                                      <input
                                        type="checkbox"
                                        checked={cur.secondaryBtn?.enabled !== false}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'enabled', e.target.checked)}
                                        style={{ cursor: 'pointer', accentColor: '#475569', width: '14px', height: '14px' }}
                                      />
                                      {cur.secondaryBtn?.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                                    </label>
                                  </div>

                                  <div style={{ opacity: cur.secondaryBtn?.enabled !== false ? 1 : 0.45, pointerEvents: cur.secondaryBtn?.enabled !== false ? 'auto' : 'none' }}>
                                    <div style={{ marginBottom: '6px' }}>
                                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#64748B', marginBottom: '3px' }}>
                                        Texto del Botón
                                      </label>
                                      <input
                                        type="text"
                                        value={cur.secondaryBtn?.text || ''}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'text', e.target.value)}
                                        placeholder="Texto botón (ej: Consultar Stock)"
                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#64748B', marginBottom: '3px' }}>
                                        🔗 Hipervínculo / Destino (URL)
                                      </label>
                                      <input
                                        type="text"
                                        value={cur.secondaryBtn?.link !== undefined ? cur.secondaryBtn.link : (cur.secondaryBtn?.cat ? (cur.secondaryBtn.cat === 'all' ? '/shop' : `/shop?cat=${cur.secondaryBtn.cat}`) : '')}
                                        onChange={(e) => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'link', e.target.value)}
                                        placeholder="https://... o /shop o /contacto"
                                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFFFFF' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                                      {[
                                        { label: 'Catálogo', link: '/shop' },
                                        { label: 'Infraestructura', link: '/shop?cat=infraestructura' },
                                        { label: 'Contacto', link: '/contacto' }
                                      ].map(s => (
                                        <button
                                          key={s.label}
                                          type="button"
                                          onClick={() => handleUpdateSlideBtn(editingSlideIdx, 'secondaryBtn', 'link', s.link)}
                                          style={{
                                            background: '#F1F5F9',
                                            border: '1px solid #CBD5E1',
                                            borderRadius: '4px',
                                            padding: '1px 6px',
                                            fontSize: '9.5px',
                                            color: '#334155',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                          }}
                                        >
                                          {s.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 4. Métricas / 3 KPIs */}
                          <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                              <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>📊</span> 3 Métricas Destacadas del Banner (Botones / KPIs laterales en pantalla grande)
                              </label>
                              {cur.type === 'animated_stats' && (
                                <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#D97706', padding: '3px 9px', borderRadius: '6px', fontWeight: '750' }}>
                                  ⚡ Modo animado DACAS activo
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                              {[0, 1, 2].map(mIdx => {
                                const m = cur.metrics?.[mIdx] || { value: '', label: '' };
                                return (
                                  <div key={mIdx} style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>
                                      KPI / Botón #{mIdx + 1}
                                    </div>
                                    <input
                                      type="text"
                                      value={m.value || ''}
                                      onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'value', e.target.value)}
                                      placeholder={mIdx === 0 ? "Valor (ej: +25 Años)" : mIdx === 1 ? "Valor (ej: 12 Países)" : "Valor (ej: 24/7)"}
                                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px' }}
                                    />
                                    <input
                                      type="text"
                                      value={m.label || ''}
                                      onChange={(e) => handleUpdateSlideMetric(editingSlideIdx, mIdx, 'label', e.target.value)}
                                      placeholder={mIdx === 0 ? "Etiqueta (ej: Liderando el Mercado IT)" : mIdx === 1 ? "Etiqueta (ej: Cobertura Regional)" : "Etiqueta (ej: Soporte Oficial)"}
                                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11.5px', color: '#64748B' }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ background: '#F0F9FF', padding: '18px 22px', borderRadius: '14px', border: '1.5px dashed #38BDF8', fontSize: '13px', color: '#0369A1', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <span>🖼️</span> Modo "Solo Imagen" Activo
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#475569' }}>
                              En este modo la imagen de fondo se presenta limpia sin textos sobreimpresos ni botones de métricas. ¿Deseas combinar esta imagen con títulos, botones y métricas?
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateSlideField(editingSlideIdx, 'type', 'metrics');
                              handleUpdateSlideField(editingSlideIdx, 'showOverlayText', true);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px 20px',
                              fontSize: '12.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>✨</span> Combinar Imagen con Textos y Botones
                          </button>
                        </div>
                      )}

                      {/* 5. Barra Inferior de Guardado */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                          🌍 Configurando para: <strong>{selectedCountryScope === 'all' ? 'Todos los Países' : selectedCountryScope || 'AR'}</strong> • Los cambios se verán inmediatamente en la tienda tras guardar.
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveVisualSettings}
                          disabled={isSavingVisual}
                          style={{
                            background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 28px',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            cursor: isSavingVisual ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span>💾</span> {isSavingVisual ? 'Guardando Cambios...' : 'Guardar Diseño y Banners'}
                        </button>
                      </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '22px' }}>🎠</span>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Configuración de Carruseles de la Home
                      </h4>
                      <span style={{
                        background: '#E0F2FE',
                        color: '#0284c7',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '999px'
                      }}>
                        {(visualConfig?.homeCarousels?.list || []).length} Carrusel{(visualConfig?.homeCarousels?.list || []).length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B', maxWidth: '680px' }}>
                      Crea, reordena y personaliza todos los carruseles que desees para la página principal. Cada país tiene sus carruseles y productos de forma 100% independiente.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleAddCarousel}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: '900' }}>+</span>
                      <span>Agregar Nuevo Carrusel</span>
                    </button>
                  </div>
                </div>

                {/* Country Switcher & Copy Bar */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  marginBottom: '22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📍 País Activo:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {DACAS_COUNTRIES_LIST.map(c => {
                        const isSel = selectedCountryScope === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => onCountryScopeChange && onCountryScopeChange(c.code)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: isSel ? '2px solid #0fa4de' : '1px solid #CBD5E1',
                              background: isSel ? '#0fa4de' : '#FFFFFF',
                              color: isSel ? '#FFFFFF' : '#334155',
                              fontWeight: '800',
                              fontSize: '11.5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Copy carousels from another country */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>
                      📋 Copiar carruseles de:
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleCopyCarouselsFromCountry(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      <option value="" disabled>Seleccionar país...</option>
                      {DACAS_COUNTRIES_LIST.filter(c => c.code !== selectedCountryScope).map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* List of Carousels */}
                <div>
                  {visualConfig?.homeCarousels?.list && visualConfig.homeCarousels.list.length > 0 ? (
                    visualConfig.homeCarousels.list.map((carousel, idx) => (
                      <CarouselEditorCard
                        key={carousel.id || idx}
                        carousel={carousel}
                        index={idx}
                        total={visualConfig.homeCarousels.list.length}
                        allProducts={products}
                        availableBrands={availableBrandsList}
                        availableCategories={CAROUSEL_CATEGORIES}
                        onUpdate={(field, val) => handleUpdateCarousel(idx, field, val)}
                        onToggleProduct={(prodId) => handleToggleCarouselProduct(idx, prodId)}
                        onSelectAllVisible={(ids) => handleSelectAllVisibleProducts(idx, ids)}
                        onClearAll={() => handleClearAllCarouselProducts(idx)}
                        onMove={(dir) => handleMoveCarousel(idx, dir)}
                        onDuplicate={() => handleDuplicateCarousel(idx)}
                        onDelete={() => handleDeleteCarousel(idx)}
                      />
                    ))
                  ) : (
                    <div style={{
                      padding: '48px 24px',
                      background: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1.5px dashed #CBD5E1',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎠</div>
                      <h5 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                        No hay carruseles configurados para {currentCountryObj.name}
                      </h5>
                      <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748B' }}>
                        Puedes agregar un nuevo carrusel personalizado o copiar la lista de carruseles de otro país.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddCarousel}
                        style={{
                          background: '#0fa4de',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        + Crear Primer Carrusel
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Save Bar */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    💡 <em>Recuerda guardar los cambios para que se publiquen en la tienda de <strong>{currentCountryObj.name}</strong>.</em>
                  </div>
                  <button
                    type="button"
                    className="dacas-pill-btn active"
                    onClick={handleSaveVisualSettings}
                    disabled={isSavingVisual}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                      color: '#FFFFFF',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '13px',
                      border: 'none',
                      cursor: isSavingVisual ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSavingVisual ? 'Guardando...' : `💾 Guardar Carruseles de ${currentCountryObj.name}`}
                  </button>
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
            <div style={{ background: '#FFFFFF', padding: '28px 32px', borderRadius: '22px', border: '1px solid rgba(15, 164, 222, 0.18)', boxShadow: '0 8px 30px rgba(7, 21, 36, 0.04)' }}>
              
              {/* Cabecera Principal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px', borderBottom: '1px solid #F1F5F9', paddingBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📁</span>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>
                      Marcas por Categoría Tecnológica
                    </h3>
                    <span style={{
                      background: '#E0F2FE',
                      color: '#0284c7',
                      fontWeight: '800',
                      fontSize: '11.5px',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {currentCountryObj.flag} {currentCountryObj.name} ({currentCountryObj.code})
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: '13px', maxWidth: '780px', lineHeight: 1.45 }}>
                    Asigna y organiza qué fabricantes oficiales se visualizan dentro de cada una de las 4 categorías tecnológicas del Shop.
                    <strong style={{ color: '#0F172A' }}> Las marcas no se crean aquí</strong>; selecciona únicamente de las marcas existentes creadas en el módulo Marcas.
                  </p>
                </div>

                {/* Botones de Control y Enlace a Marcas */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleExpandAllCategories(true)}
                    style={{
                      background: '#F8FAFC',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Desplegar todas las categorías"
                  >
                    🔽 Desplegar Todas
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExpandAllCategories(false)}
                    style={{
                      background: '#F8FAFC',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Colapsar todas las categorías"
                  >
                    🔼 Colapsar Todas
                  </button>

                  {onNavigateToBrands && (
                    <button
                      type="button"
                      onClick={onNavigateToBrands}
                      style={{
                        background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 3px 10px rgba(15, 164, 222, 0.25)'
                      }}
                      title="Ir al módulo Marcas para crear nuevos fabricantes o editar logotipos"
                    >
                      <span>🏷️</span>
                      <span>Módulo Marcas (Crear / Editar Logos) ➔</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notificación informativa sobre el flujo */}
              <div style={{
                background: 'rgba(15, 164, 222, 0.05)',
                border: '1px solid #BAE6FD',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '12px',
                color: '#0369A1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>💡</span>
                  <span>
                    <strong>Modo ordenado sin ruido visual:</strong> Haz clic en cualquier categoría para desplegarla. Para asignar una marca, selecciónala en el desplegable de esa categoría.
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BAE6FD', whiteSpace: 'nowrap' }}>
                  4 Categorías
                </span>
              </div>

              {/* Lista de Categorías en Modo Desplegable (Accordion) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {CATEGORIES_DEF.map(group => {
                  const isExpanded = Boolean(expandedCategoryKeys[group.key]);
                  const rawList = (visualConfig?.categoryBrands && visualConfig.categoryBrands[group.key]) || [];
                  
                  const assignedBrands = rawList.map((item, idx) => ({
                    ...normalizeBrandItem(item, group.key),
                    originalIdx: idx
                  }));

                  const displayedAssignedBrands = assignedBrands.filter(b => {
                    if (!b.countries || b.countries.length === 0) return true;
                    return b.countries.includes(currentScopeCode);
                  });

                  const availableBrandsToAssign = (allAdminBrands || []).filter(mb => {
                    const inScope = !mb.countries || mb.countries.length === 0 || mb.countries.includes(currentScopeCode);
                    if (!inScope) return false;
                    const alreadyAssigned = assignedBrands.some(a => a.name.toLowerCase().trim() === mb.key);
                    return !alreadyAssigned;
                  }).sort((a, b) => a.name.localeCompare(b.name));

                  return (
                    <div
                      key={group.key}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: isExpanded ? `1.5px solid ${group.color}` : '1.5px solid #E2E8F0',
                        boxShadow: isExpanded ? '0 6px 20px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Barra de Categoría (Header Desplegable Clickeable) */}
                      <div
                        onClick={() => toggleCategoryExpand(group.key)}
                        style={{
                          padding: '16px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: isExpanded ? `${group.bg}` : '#FFFFFF',
                          userSelect: 'none',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isExpanded ? '#FFFFFF' : group.bg,
                            border: `1px solid ${group.color}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                            boxShadow: isExpanded ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                          }}>
                            {group.icon}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '850', color: '#0F172A' }}>
                                {group.title}
                              </h4>
                              <span style={{
                                background: displayedAssignedBrands.length > 0 ? (isExpanded ? group.color : '#E0F2FE') : '#F1F5F9',
                                color: displayedAssignedBrands.length > 0 ? (isExpanded ? '#FFFFFF' : '#0369A1') : '#64748B',
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '2px 9px',
                                borderRadius: '999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span>{displayedAssignedBrands.length > 0 ? '●' : '○'}</span>
                                <span>{displayedAssignedBrands.length} {displayedAssignedBrands.length === 1 ? 'marca asignada' : 'marcas asignadas'}</span>
                              </span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {group.desc}
                            </div>
                          </div>
                        </div>

                        {/* Flecha Indicadora del Desplegable */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: '750',
                            color: isExpanded ? group.color : '#64748B',
                            background: isExpanded ? '#FFFFFF' : '#F1F5F9',
                            border: isExpanded ? `1px solid ${group.color}44` : '1px solid #CBD5E1',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}>
                            <span>{isExpanded ? '▲ Ocultar marcas' : '▼ Ver marcas'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Contenido Desplegado */}
                      {isExpanded && (
                        <div style={{
                          padding: '18px 20px',
                          borderTop: '1px solid #E2E8F0',
                          background: '#F8FAFC'
                        }}>
                          {/* Barra de Asignación */}
                          <div style={{
                            background: '#FFFFFF',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: '1px solid #CBD5E1',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '18px' }}>➕</span>
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                                  Asignar Marca de Marcas a {group.title}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                  Elige un fabricante ya registrado en el catálogo para agregarlo a esta categoría.
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
                                      background: '#FFFFFF',
                                      fontSize: '12.5px',
                                      fontWeight: '700',
                                      color: '#0F172A',
                                      minWidth: '240px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="">
                                      {availableBrandsToAssign.length === 0
                                        ? `(Todas las marcas de ${currentCountryObj?.name || currentScopeCode} ya están asignadas)`
                                        : `-- Seleccionar de marcas de ${currentCountryObj?.name || currentScopeCode} (${availableBrandsToAssign.length} disponibles) --`}
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
                                      background: selectedBrandToAssign[group.key] ? 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)' : '#E2E8F0',
                                      color: selectedBrandToAssign[group.key] ? '#FFFFFF' : '#94A3B8',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 15px',
                                      fontSize: '12.5px',
                                      fontWeight: '800',
                                      cursor: selectedBrandToAssign[group.key] ? 'pointer' : 'not-allowed',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      boxShadow: selectedBrandToAssign[group.key] ? '0 3px 10px rgba(15, 164, 222, 0.25)' : 'none',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <span>✓</span>
                                    <span>Asignar</span>
                                  </button>
                                </>
                              ) : (
                                <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: '700', background: '#DCFCE7', padding: '5px 10px', borderRadius: '6px' }}>
                                  ✓ Todas las marcas registradas ya están asignadas a {group.title}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Listado de Marcas Asignadas en esta Categoría */}
                          {displayedAssignedBrands.length === 0 ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '30px 16px',
                              background: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1.5px dashed #CBD5E1',
                              color: '#64748B'
                            }}>
                              <div style={{ fontSize: '26px', marginBottom: '4px' }}>🏷️</div>
                              <div style={{ fontWeight: '750', fontSize: '13px', color: '#334155' }}>
                                No hay marcas asignadas a {group.title} en {currentCountryObj.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px' }}>
                                Utiliza el selector desplegable de arriba para elegir una de las marcas creadas en el catálogo.
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                              gap: '10px'
                            }}>
                              {displayedAssignedBrands.map(b => {
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
                                      background: '#FFFFFF',
                                      borderRadius: '12px',
                                      border: '1px solid #E2E8F0',
                                      padding: '10px 14px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '10px',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                      <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
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
                                          color: '#0F172A',
                                          textTransform: 'uppercase',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {masterBrand.name}
                                        </div>
                                        <div style={{
                                          fontSize: '10.5px',
                                          color: '#64748B',
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
                                      onClick={() => handleUnassignBrandFromCategory(group.key, b.originalIdx, masterBrand.name, group.title)}
                                      title={`Quitar ${masterBrand.name} de ${group.title}`}
                                      style={{
                                        background: '#FEF2F2',
                                        color: '#DC2626',
                                        border: '1px solid #FECACA',
                                        borderRadius: '7px',
                                        padding: '5px 9px',
                                        fontSize: '11px',
                                        fontWeight: '750',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        flexShrink: 0,
                                        transition: 'all 0.12s ease'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#FFFFFF'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
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
  );
}
