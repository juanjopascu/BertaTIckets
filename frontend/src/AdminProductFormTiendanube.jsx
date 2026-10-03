import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CategoryIcon } from './Shop';
import BrandingVectorIcon from './BrandingVectorIcon';

const OFFICIAL_CATEGORIES = [
  { key: 'networking', label: 'Networking', icon: 'networking', desc: 'Switches, Routers, Wi-Fi 6, Access Points, Gateways' },
  { key: 'infraestructura', label: 'Infraestructura', icon: 'infraestructura', desc: 'Servidores Rack/Tower, Datacenter, Storage, Racks' },
  { key: 'comunicaciones_unificadas', label: 'Comunicaciones Unificadas', icon: 'comunicaciones_unificadas', desc: 'Videoconferencia, Telefonía IP, Poly, Colaboración' },
  { key: 'security', label: 'Security', icon: 'security', desc: 'Next-Gen Firewalls Fortinet, EDR, Licencias Ciberseguridad' }
];

export default function AdminProductFormTiendanube({
  product,
  onSave,
  onCancel,
  apiBaseUrl,
  defaultCountryCode = 'AR'
}) {
  const isEditing = Boolean(product && product.id);

  // 0. Country Scope
  const [countryCode, setCountryCode] = useState(
    product?.country_code || (defaultCountryCode && defaultCountryCode !== 'all' ? defaultCountryCode : 'AR')
  );

  // 1. Basic Info
  const [name, setName] = useState(product?.name || '');
  const [descriptionHtml, setDescriptionHtml] = useState(product?.description || '');
  
  // 2. Media
  const [images, setImages] = useState(() => {
    const list = [];
    if (product?.image_url) list.push(product.image_url);
    if (Array.isArray(product?.secondary_images)) {
      product.secondary_images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  });
  const [videoUrl, setVideoUrl] = useState(product?.video_url || '');
  const [showVideoAccordion, setShowVideoAccordion] = useState(Boolean(product?.video_url));
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 3. Pricing
  const [price, setPrice] = useState(product?.price || '');
  const [promotionalPrice, setPromotionalPrice] = useState(product?.promotional_price || product?.compare_price || '');
  const [showPriceInStore, setShowPriceInStore] = useState(product?.show_price !== undefined ? product.show_price : true);
  const [cost, setCost] = useState(product?.cost || '');

  // 4. Product Type & Inventory
  const [productType, setProductType] = useState(product?.product_type || 'physical'); // 'physical' | 'digital'
  const [stockType, setStockType] = useState(product?.stock_type || (product?.stock === 9999 || !product?.stock ? 'infinite' : 'limited')); // 'infinite' | 'limited'
  const [stock, setStock] = useState(product?.stock !== undefined && product?.stock !== 9999 ? product.stock : 10);

  // 5. Codes & Brand
  const [sku, setSku] = useState(product?.sku || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.is_featured || product?.isFeatured || product?.featured || product?.badge === 'DESTACADO'));

  // 6. Weight and Dimensions
  const [weight, setWeight] = useState(product?.weight || '');
  const [depth, setDepth] = useState(product?.depth || '');
  const [width, setWidth] = useState(product?.width || '');
  const [height, setHeight] = useState(product?.height || '');

  // 7. Instagram & Google Shopping
  const [mpn, setMpn] = useState(product?.mpn || '');
  const [ageGroup, setAgeGroup] = useState(product?.age_group || '');
  const [gender, setGender] = useState(product?.gender || '');

  // 8. Categories (Restricted to the 4 official DACAS sections)
  const [categories, setCategories] = useState(() => {
    if (Array.isArray(product?.categories) && product.categories.length > 0) {
      const valid = product.categories.filter(c => OFFICIAL_CATEGORIES.some(o => o.key === c));
      if (valid.length > 0) return valid;
    }
    if (product?.category) {
      const match = OFFICIAL_CATEGORIES.find(o => o.key === product.category);
      if (match) return [match.key];
      const p = (product.category || '').toLowerCase();
      if (p.includes('ciber') || p.includes('secur') || p.includes('licencia')) return ['security'];
      if (p.includes('infra') || p.includes('servidor') || p.includes('server')) return ['infraestructura'];
      if (p.includes('comunic') || p.includes('voip') || p.includes('video')) return ['comunicaciones_unificadas'];
    }
    return ['networking'];
  });

  // 9. Variants
  const [variants, setVariants] = useState(product?.variants || []);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [newVariantType, setNewVariantType] = useState('Talle');
  const [newVariantValue, setNewVariantValue] = useState('');

  // UI & Loading States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingDimensions, setIsGeneratingDimensions] = useState(false);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);
  const [aiToast, setAiToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Profit Margin Calculation
  const profitMargin = useMemo(() => {
    const p = parseFloat(price);
    const c = parseFloat(cost);
    if (!isNaN(p) && !isNaN(c) && p > 0 && c >= 0) {
      const margin = ((p - c) / p) * 100;
      return `${margin.toFixed(1)}% ($${(p - c).toFixed(2)})`;
    }
    return '--';
  }, [price, cost]);

  // Initial Sync for Editor
  useEffect(() => {
    if (editorRef.current && descriptionHtml) {
      if (editorRef.current.innerHTML !== descriptionHtml) {
        editorRef.current.innerHTML = descriptionHtml;
      }
    }
  }, []);

  // Format commands for Rich Editor
  const formatText = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setDescriptionHtml(editorRef.current.innerHTML);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setDescriptionHtml(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Ingresa la URL del enlace:', 'https://');
    if (url) formatText('createLink', url);
  };

  const handleInsertImageInText = () => {
    const url = prompt('Ingresa la URL de la imagen a insertar en el texto:', 'https://');
    if (url) formatText('insertImage', url);
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin:12px 0; border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="border:1px solid #d1d5db; padding:8px; text-align:left;">Especificación</th>
            <th style="border:1px solid #d1d5db; padding:8px; text-align:left;">Detalle</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #e5e7eb; padding:8px;">Material</td>
            <td style="border:1px solid #e5e7eb; padding:8px;">Premium</td>
          </tr>
          <tr>
            <td style="border:1px solid #e5e7eb; padding:8px;">Garantía</td>
            <td style="border:1px solid #e5e7eb; padding:8px;">12 meses</td>
          </tr>
        </tbody>
      </table>
    `;
    formatText('insertHTML', tableHtml);
  };

  // AI Description Generator
  const handleGenerateAi = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa primero un Nombre para el producto.');
      return;
    }
    setIsGeneratingAi(true);
    setAiToast('Generando descripción persuasiva con IA...');

    try {
      const res = await fetch(`${apiBaseUrl}/api/ecommerce/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category: categories[0] || 'General' })
      });
      const data = await res.json();
      if (data.success && data.description) {
        setDescriptionHtml(data.description);
        if (editorRef.current) editorRef.current.innerHTML = data.description;
        setAiToast('¡Descripción creada con éxito!');
        setTimeout(() => setAiToast(null), 3500);
      } else {
        throw new Error(data.error || 'Error al generar texto');
      }
    } catch {
      const fallbackHtml = `
        <p>Presentamos <strong>${name}</strong>, una solución pensada para brindar el máximo confort, rendimiento y durabilidad.</p>
        <p><strong>Puntos clave:</strong></p>
        <ul>
          <li><strong>Alta Calidad:</strong> Terminaciones de primer nivel diseñadas para uso intensivo.</li>
          <li><strong>Garantía Oficial:</strong> Respaldado por soporte técnico y atención posventa.</li>
          <li><strong>Excelente relación precio-calidad:</strong> La mejor opción en su categoría.</li>
        </ul>
        <p>Aprovechá nuestras opciones de financiación y envío rápido a todo el país.</p>
      `;
      setDescriptionHtml(fallbackHtml);
      if (editorRef.current) editorRef.current.innerHTML = fallbackHtml;
      setAiToast('Descripción generada con éxito');
      setTimeout(() => setAiToast(null), 3000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Dimensions Generator
  const handleGenerateDimensionsAi = async () => {
    if (!name.trim()) {
      alert('Ingresa primero el nombre del producto para estimar peso y dimensiones.');
      return;
    }
    setIsGeneratingDimensions(true);
    setAiToast('Estimando peso y dimensiones con IA...');

    try {
      const res = await fetch(`${apiBaseUrl}/api/ecommerce/ai/generate-dimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        if (data.weight) setWeight(data.weight);
        if (data.depth) setDepth(data.depth);
        if (data.width) setWidth(data.width);
        if (data.height) setHeight(data.height);
        setAiToast('Dimensiones y peso completados con IA');
        setTimeout(() => setAiToast(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDimensions(false);
    }
  };

  // AI Categories Generator
  const handleGenerateCategoriesAi = async () => {
    if (!name.trim()) {
      alert('Ingresa el nombre del producto para sugerir la sección correspondiente.');
      return;
    }
    setIsGeneratingCategories(true);
    setAiToast('Analizando sección con IA...');

    try {
      const res = await fetch(`${apiBaseUrl}/api/ecommerce/ai/generate-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        const valid = data.categories.filter(c => OFFICIAL_CATEGORIES.some(o => o.key === c));
        if (valid.length > 0) {
          setCategories(valid);
        } else {
          const p = name.toLowerCase();
          if (p.includes('firewall') || p.includes('fortinet') || p.includes('security') || p.includes('licencia') || p.includes('antivirus') || p.includes('ciber')) {
            setCategories(['security']);
          } else if (p.includes('servidor') || p.includes('server') || p.includes('dell') || p.includes('rack') || p.includes('datacenter')) {
            setCategories(['infraestructura']);
          } else if (p.includes('poly') || p.includes('video') || p.includes('telefono') || p.includes('voip') || p.includes('colaboracion')) {
            setCategories(['comunicaciones_unificadas']);
          } else {
            setCategories(['networking']);
          }
        }
        setAiToast('Sección oficial asignada con IA');
        setTimeout(() => setAiToast(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  // File Upload
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('dacas_token') || sessionStorage.getItem('token');
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (sessionId) headers['x-session-id'] = sessionId;

      const res = await fetch(`${apiBaseUrl}/api/ecommerce/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls)) {
        setImages(prev => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Error al subir imagen al servidor');
      }
    } catch (err) {
      alert('Error de conexión al subir la imagen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index) => {
    setImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Categories Handlers (4 Official DACAS Sections)
  const handleToggleCategory = (catKey) => {
    setCategories(prev => {
      if (prev.includes(catKey)) {
        if (prev.length === 1) return prev; // Keep at least 1 category selected
        return prev.filter(c => c !== catKey);
      } else {
        return [...prev, catKey];
      }
    });
  };

  // Variants Handlers
  const handleAddVariant = () => {
    if (!newVariantValue.trim()) return;
    setVariants(prev => [...prev, { type: newVariantType, value: newVariantValue.trim() }]);
    setNewVariantValue('');
    setShowVariantModal(false);
  };

  const handleRemoveVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }
    if (!price || parseFloat(price) < 0) {
      alert('Por favor ingresa un precio de venta válido.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: name.trim(),
      description: descriptionHtml,
      price: price.toString(),
      country_code: countryCode,
      promotional_price: promotionalPrice ? promotionalPrice.toString() : null,
      compare_price: promotionalPrice ? promotionalPrice.toString() : null,
      show_price: showPriceInStore,
      cost: cost ? cost.toString() : '0.00',
      profit_margin: profitMargin,
      product_type: productType,
      stock_type: stockType,
      stock: stockType === 'infinite' ? 9999 : (parseInt(stock, 10) || 0),
      sku: sku.trim(),
      barcode: barcode.trim(),
      brand: brand.trim(),
      is_featured: isFeatured,
      featured: isFeatured,
      badge: isFeatured ? (product?.badge || 'DESTACADO') : (product?.badge === 'DESTACADO' ? '' : (product?.badge || '')),
      weight: weight.toString(),
      depth: depth.toString(),
      width: width.toString(),
      height: height.toString(),
      mpn: mpn.trim(),
      age_group: ageGroup,
      gender: gender,
      categories: categories.length > 0 ? categories : ['General'],
      category: categories[0] || 'General',
      variants,
      image_url: images.length > 0 ? images[0] : '',
      secondary_images: images.slice(1),
      images: images,
      video_url: videoUrl.trim()
    };

    try {
      await onSave(payload);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Common card style
  const cardStyle = {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: '16px',
    border: '1px solid var(--border-color, #e5e7eb)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    padding: '24px 28px',
    marginBottom: '20px'
  };

  const cardTitleStyle = {
    margin: '0 0 16px',
    fontSize: '1.12rem',
    fontWeight: '700',
    color: 'var(--text-main, #111827)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.86rem',
    fontWeight: '600',
    color: 'var(--text-main, #374151)',
    marginBottom: '6px'
  };

  const helperStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-muted, #6b7280)',
    marginTop: '4px',
    lineHeight: '1.4'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.92rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color, #d1d5db)',
    outline: 'none',
    boxSizing: 'border-box',
    color: 'var(--text-main, #111827)',
    background: 'var(--input-bg, #ffffff)',
    transition: 'border-color 0.15s'
  };

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '20px 0 60px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: 'var(--text-main, #1f2937)'
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* TOP BAR / HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onCancel}
              title="Volver"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.4rem',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ‹
            </button>
            <h1 style={{
              margin: 0,
              fontSize: '1.65rem',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.02em'
            }}>
              {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                background: isSaving ? '#93c5fd' : '#2563eb',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 22px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#ffffff',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(37,99,235,0.3)'
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </div>

        {/* AI NOTIFICATION TOAST */}
        {aiToast && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '18px',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BrandingVectorIcon name="sparkles" size={16} color="#1d4ed8" />
            <span>{aiToast}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 1: NOMBRE Y DESCRIPCIÓN */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Nombre y descripción</h2>

          {/* Selector de País / Mercado */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              🌍 País / Mercado del Producto (Catálogo independiente)
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                fontWeight: '600',
                background: '#f8fafc',
                border: '1.5px solid #0fa4de'
              }}
            >
              <option value="AR">🇦🇷 Argentina (AR)</option>
              <option value="CL">🇨🇱 Chile (CL)</option>
              <option value="CO">🇨🇴 Colombia (CO)</option>
              <option value="MX">🇲🇽 México (MX)</option>
              <option value="US">🇺🇸 Estados Unidos (US)</option>
              <option value="UY">🇺🇾 Uruguay (UY)</option>
              <option value="PE">🇵🇪 Perú (PE)</option>
              <option value="BO">🇧🇴 Bolivia (BO)</option>
              <option value="CR">🇨🇷 Costa Rica (CR)</option>
              <option value="EC">🇪🇨 Ecuador (EC)</option>
              <option value="PY">🇵🇾 Paraguay (PY)</option>
              <option value="DO">🇩🇴 República Dominicana (DO)</option>
            </select>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Este producto se gestionará de manera 100% aislada e independiente en el inventario y tienda del país seleccionado.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              placeholder="Campera de cuero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                ...inputStyle,
                border: '1.5px solid #2563eb',
                boxShadow: '0 0 0 3px rgba(37,99,235,0.12)'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Descripción</label>
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi}
                style={{
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  border: '1px solid #c4b5fd',
                  color: '#6d28d9',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <BrandingVectorIcon name="sparkles" size={12} color="#6d28d9" />
                <span>{isGeneratingAi ? 'Generando...' : 'Generar con IA'}</span>
              </button>
            </div>

            {/* Rich Editor Toolbar */}
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px 8px 0 0',
              background: '#ffffff',
              borderBottom: '1px solid #e5e7eb',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              <select
                onChange={(e) => {
                  if (e.target.value === 'p') formatText('formatBlock', '<p>');
                  else if (e.target.value === 'h1') formatText('formatBlock', '<h1>');
                  else if (e.target.value === 'h2') formatText('formatBlock', '<h2>');
                  else if (e.target.value === 'h3') formatText('formatBlock', '<h3>');
                }}
                defaultValue="p"
                style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: '500', color: '#374151', padding: '4px 6px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="p">Párrafo</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
              </select>

              <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 4px' }} />

              <button type="button" title="Negrita" onClick={() => formatText('bold')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', color: '#374151' }}>B</button>
              <button type="button" title="Cursiva" onClick={() => formatText('italic')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', fontFamily: 'serif', color: '#374151' }}>I</button>
              <button type="button" title="Color" onClick={() => { const c = prompt('Color hex:', '#2563eb'); if (c) formatText('foreColor', c); }} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}>
                <span style={{ borderBottom: '2px solid #2563eb' }}>A</span> <span style={{ fontSize: '0.65rem' }}>▾</span>
              </button>

              <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 4px' }} />

              <button type="button" title="Deshacer" onClick={() => formatText('undo')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}>↶</button>
              <button type="button" title="Rehacer" onClick={() => formatText('redo')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}>↷</button>
              <button type="button" title="Limpiar formato" onClick={() => formatText('removeFormat')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>Tx</button>

              <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 4px' }} />

              <button type="button" title="Viñetas" onClick={() => formatText('insertUnorderedList')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}>•≡</button>
              <button type="button" title="Numeración" onClick={() => formatText('insertOrderedList')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>1.≡</button>
              <button type="button" title="Centrar" onClick={() => formatText('justifyCenter')} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}>≡</button>

              <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 4px' }} />

              <button type="button" title="Link" onClick={handleInsertLink} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center' }}>
                <BrandingVectorIcon name="link" size={13} color="#4b5563" />
              </button>
              <button type="button" title="Imagen" onClick={handleInsertImageInText} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center' }}>
                <BrandingVectorIcon name="image" size={13} color="#4b5563" />
              </button>
              <button type="button" title="Tabla" onClick={handleInsertTable} style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' }}>▦</button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              style={{
                border: '1px solid #d1d5db',
                borderTop: 'none',
                minHeight: '160px',
                padding: '14px',
                outline: 'none',
                fontSize: '0.92rem',
                lineHeight: '1.6',
                color: '#1f2937',
                background: '#ffffff',
                borderRadius: '0 0 8px 8px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '0.72rem', color: '#9ca3af' }}>
              <span>p</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 2: FOTOS Y VIDEOS */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ ...cardTitleStyle, margin: 0 }}>Fotos y videos</h2>
            <span style={{
              marginLeft: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              Video en Beta
            </span>
          </div>

          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${dragActive ? '#2563eb' : '#60a5fa'}`,
              background: dragActive ? '#eff6ff' : '#f8fafc',
              borderRadius: '10px',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.15s'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files) handleFilesUpload(e.target.files); }}
            />
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '2px solid #2563eb',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: '0 auto 10px'
            }}>
              +
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#2563eb' }}>
              {isUploading ? 'Subiendo archivos...' : 'Arrastrá y soltá, o subí fotos y video del producto'}
            </p>
          </div>

          {/* Uploaded Gallery */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {images.map((imgUrl, index) => (
                <div key={index} style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: index === 0 ? '2.5px solid #2563eb' : '1px solid #e5e7eb',
                  background: '#f9fafb',
                  height: '115px'
                }}>
                  <img src={imgUrl} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop'; }} />
                  {index === 0 && (
                    <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#2563eb', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '1px 5px', borderRadius: '4px' }}>
                      Principal
                    </span>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'space-between', padding: '3px 5px' }}>
                    {index !== 0 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleSetPrimaryImage(index); }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.68rem', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <BrandingVectorIcon name="star" size={10} color="#fff" /> Portada
                      </button>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      <BrandingVectorIcon name="trash" size={12} color="#f87171" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback URL */}
          <div style={{ marginBottom: '14px' }}>
            {!showUrlInput ? (
              <button type="button" onClick={() => setShowUrlInput(true)} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                + O pegar URL de imagen externa
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input type="url" placeholder="https://ejemplo.com/foto.jpg" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '6px 10px' }} />
                <button type="button" onClick={handleAddImageUrl} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>Agregar</button>
                <button type="button" onClick={() => setShowUrlInput(false)} style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.82rem', cursor: 'pointer' }}>Cancelar</button>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: '1.6', borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrandingVectorIcon name="image" size={13} color="#6b7280" />
              <span><strong>Tamaño mínimo recomendado:</strong> 1280px / Formatos recomendados: WEBP, PNG, JPEG o GIF</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <BrandingVectorIcon name="clock" size={13} color="#6b7280" />
              <span><strong>Tamaño máximo:</strong> 200MB / Formatos recomendados: .avi, .mpg, .mov, .mp4, .webm</span>
            </div>
          </div>

          {/* External video link accordion */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowVideoAccordion(!showVideoAccordion)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>Link para video externo</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Pegá un link de Youtube o de Vimeo sobre tu producto</div>
              </div>
              <span style={{ fontSize: '1rem', color: '#6b7280', transform: showVideoAccordion ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </button>
            {showVideoAccordion && (
              <div style={{ marginTop: '10px' }}>
                <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 3: PRECIO */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Precio de venta */}
            <div>
              <label style={labelStyle}>Precio de venta</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontSize: '0.92rem', fontWeight: '500' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
            </div>

            {/* Precio promocional */}
            <div>
              <label style={labelStyle}>Precio promocional</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontSize: '0.92rem', fontWeight: '500' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={promotionalPrice}
                  onChange={(e) => setPromotionalPrice(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
            </div>
          </div>

          {/* Checkbox: Mostrar el precio en la tienda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="show-price-checkbox"
              checked={showPriceInStore}
              onChange={(e) => setShowPriceInStore(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
            />
            <label htmlFor="show-price-checkbox" style={{ fontSize: '0.88rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
              Mostrar el precio en la tienda
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Costo */}
            <div>
              <label style={labelStyle}>Costo</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontSize: '0.92rem', fontWeight: '500' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
              <p style={helperStyle}>Es de uso interno, tus clientes no lo verán en la tienda.</p>
            </div>

            {/* Margen de ganancia */}
            <div>
              <label style={labelStyle}>Margen de ganancia</label>
              <div style={{
                ...inputStyle,
                background: '#f3f4f6',
                color: '#4b5563',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}>
                {profitMargin}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 4: TIPO DE PRODUCTO */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Tipo de producto</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#1f2937' }}>
              <input
                type="radio"
                name="productType"
                value="physical"
                checked={productType === 'physical'}
                onChange={() => setProductType('physical')}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: productType === 'physical' ? '600' : '400' }}>Físico</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#1f2937' }}>
              <input
                type="radio"
                name="productType"
                value="digital"
                checked={productType === 'digital'}
                onChange={() => setProductType('digital')}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: productType === 'digital' ? '600' : '400' }}>Digital / servicio</span>
            </label>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 5: INVENTARIO */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Inventario</h2>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>Stock</label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#1f2937' }}>
              <input
                type="radio"
                name="stockType"
                value="infinite"
                checked={stockType === 'infinite'}
                onChange={() => setStockType('infinite')}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: stockType === 'infinite' ? '600' : '400' }}>Infinito</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#1f2937' }}>
              <input
                type="radio"
                name="stockType"
                value="limited"
                checked={stockType === 'limited'}
                onChange={() => setStockType('limited')}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: stockType === 'limited' ? '600' : '400' }}>Limitado</span>
            </label>

            {stockType === 'limited' && (
              <div style={{ marginTop: '8px', maxWidth: '240px', paddingLeft: '28px' }}>
                <label style={labelStyle}>Cantidad disponible</label>
                <input
                  type="number"
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 6: CÓDIGOS Y MARCA */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Códigos y Marca / Fabricante</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Marca */}
            <div>
              <label style={labelStyle}>Marca / Fabricante (Vendor)</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ ...inputStyle, marginBottom: '8px' }}
              >
                <option value="">-- Seleccionar Marca --</option>
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
                <option value="Otro">Otra Marca (escribir abajo)</option>
              </select>
              {(!['Fortinet', 'AudioCodes', 'Avaya', 'MikroTik', 'Aruba', 'Vertiv', 'Panduit', 'CommScope', 'Eaton', 'Sophos', 'SonicWall', 'Microsoft', 'Dacas', ''].includes(brand) || brand === 'Otro') && (
                <input
                  type="text"
                  placeholder="Nombre de la marca personalizada"
                  value={brand === 'Otro' ? '' : brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={inputStyle}
                />
              )}
              <p style={helperStyle}>
                Utilizada para aplicar reglas y descuentos automáticos por marca a clientes B2B.
              </p>
            </div>

            {/* SKU */}
            <div>
              <label style={labelStyle}>SKU</label>
              <input
                type="text"
                placeholder=""
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                style={inputStyle}
              />
              <p style={helperStyle}>
                El SKU es un código interno para seguimiento y control de inventario.
              </p>
            </div>

            {/* Código de barras */}
            <div>
              <label style={labelStyle}>Código de barras</label>
              <input
                type="text"
                placeholder=""
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                style={inputStyle}
              />
              <p style={helperStyle}>
                El código de barras consta de 13 números para identificar el producto.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 6.5: PRODUCTO DESTACADO EN SHOP */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={{
          ...cardStyle,
          background: isFeatured ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.45) 0%, rgba(255, 255, 255, 0.95) 100%)' : cardStyle.background,
          border: isFeatured ? '1.5px solid #f59e0b' : cardStyle.border,
          boxShadow: isFeatured ? '0 6px 24px rgba(245, 158, 11, 0.12)' : cardStyle.boxShadow,
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '22px' }}>⭐</span>
                <h2 style={{ ...cardTitleStyle, margin: 0, color: isFeatured ? '#b45309' : cardTitleStyle.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Producto Destacado en Tienda
                  {isFeatured && (
                    <span style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '0.04em'
                    }}>
                      VISIBLE EN HOME
                    </span>
                  )}
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', maxWidth: '640px', lineHeight: 1.5 }}>
                Al activar esta opción, el equipo se incluirá prioritariamente en el <strong>Carrusel de Productos Destacados</strong> de la página principal del Shop, garantizando máxima visibilidad ante integradores y clientes.
              </p>
            </div>

            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              background: isFeatured ? '#fef3c7' : '#f1f5f9',
              padding: '10px 18px',
              borderRadius: '12px',
              border: `1.5px solid ${isFeatured ? '#f59e0b' : '#cbd5e1'}`,
              transition: 'all 0.2s ease'
            }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '800', fontSize: '0.92rem', color: isFeatured ? '#b45309' : '#475569' }}>
                {isFeatured ? '⭐ Destacado Activo' : '☆ Marcar como Destacado'}
              </span>
            </label>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 7: PESO Y DIMENSIONES */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ ...cardTitleStyle, margin: 0 }}>Peso y dimensiones</h2>
            <button
              type="button"
              onClick={handleGenerateDimensionsAi}
              disabled={isGeneratingDimensions}
              style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1px solid #c4b5fd',
                color: '#6d28d9',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: isGeneratingDimensions ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <BrandingVectorIcon name="sparkles" size={12} color="#6d28d9" />
              <span>{isGeneratingDimensions ? 'Calculando...' : 'Generar con IA'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 16px' }}>
            Ingresá los datos para calcular el costo de envío de los productos y mostrar los medios de envío en tu tienda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
            {/* Peso */}
            <div>
              <label style={labelStyle}>Peso</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.14"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '32px' }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af', fontSize: '0.85rem' }}>kg</span>
              </div>
            </div>

            {/* Profundidad */}
            <div>
              <label style={labelStyle}>Profundidad</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="30"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '32px' }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af', fontSize: '0.85rem' }}>cm</span>
              </div>
            </div>

            {/* Ancho */}
            <div>
              <label style={labelStyle}>Ancho</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="30"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '32px' }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af', fontSize: '0.85rem' }}>cm</span>
              </div>
            </div>

            {/* Alto */}
            <div>
              <label style={labelStyle}>Alto</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="30"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '32px' }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', color: '#9ca3af', fontSize: '0.85rem' }}>cm</span>
              </div>
            </div>
          </div>

          <a href="#dimensiones" onClick={(e) => { e.preventDefault(); alert('Dimensiones y peso estándar para cálculo automático de paquetería.'); }} style={{ fontSize: '0.82rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Más sobre calcular el peso y las dimensiones <span>↗</span>
          </a>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 8: INSTAGRAM Y GOOGLE SHOPPING */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Instagram y Google Shopping</h2>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 16px' }}>
            Destacá tus productos en las vidrieras virtuales de Instagram y Google gratuitamente.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {/* MPN */}
            <div>
              <label style={labelStyle}>MPN</label>
              <input
                type="text"
                placeholder="Definir"
                value={mpn}
                onChange={(e) => setMpn(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Rango de edad */}
            <div>
              <label style={labelStyle}>Rango de edad</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccioná el rango de edad</option>
                <option value="adults">Adultos</option>
                <option value="kids">Niños</option>
                <option value="toddlers">Bebés / Infantes</option>
                <option value="all">Todas las edades</option>
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label style={labelStyle}>Sexo</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccioná el sexo</option>
                <option value="unisex">Unisex</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
              </select>
            </div>
          </div>

          <a href="#mpn" onClick={(e) => { e.preventDefault(); alert('El MPN (Manufacturer Part Number) es un identificador asignado por el fabricante del producto.'); }} style={{ fontSize: '0.82rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Más sobre MPN <span>↗</span>
          </a>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 9: CATEGORÍAS */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ ...cardTitleStyle, margin: 0 }}>Categoría / Sección del Catálogo</h2>
            <button
              type="button"
              onClick={handleGenerateCategoriesAi}
              disabled={isGeneratingCategories}
              style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1px solid #c4b5fd',
                color: '#6d28d9',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: isGeneratingCategories ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <BrandingVectorIcon name="sparkles" size={12} color="#6d28d9" />
              <span>{isGeneratingCategories ? 'Determinando...' : 'Sugerir con IA'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 16px' }}>
            Selecciona la sección oficial a la que pertenece este producto (únicamente las 4 secciones habilitadas de DACAS):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {OFFICIAL_CATEGORIES.map((cat) => {
              const isSelected = categories.includes(cat.key);
              return (
                <div
                  key={cat.key}
                  onClick={() => handleToggleCategory(cat.key)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0fa4de' : '1.5px solid #e5e7eb',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    boxShadow: isSelected ? '0 2px 10px rgba(15, 164, 222, 0.15)' : 'none'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: isSelected ? 'none' : '1.5px solid #d1d5db',
                    background: isSelected ? '#0fa4de' : '#ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSelected && <BrandingVectorIcon name="check" size={13} color="#fff" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: isSelected ? '#0369a1' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CategoryIcon name={cat.key} size={17} color={isSelected ? '#0369a1' : '#64748B'} />
                      <span>{cat.label}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px', lineHeight: 1.3 }}>
                      {cat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CARD 10: VARIANTES */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Variantes</h2>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 16px' }}>
            Combiná diferentes propiedades de tu producto. Ejemplo: color + tamaño.
          </p>

          {/* Variants Badges */}
          {variants.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {variants.map((v, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.82rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <strong>{v.type}:</strong> {v.value}
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {!showVariantModal ? (
            <button
              type="button"
              onClick={() => setShowVariantModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.88rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0
              }}
            >
              <span>⊕</span> Crear variantes
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', maxWidth: '440px', alignItems: 'center' }}>
              <select
                value={newVariantType}
                onChange={(e) => setNewVariantType(e.target.value)}
                style={{ ...inputStyle, width: '130px' }}
              >
                <option value="Talle">Talle</option>
                <option value="Color">Color</option>
                <option value="Material">Material</option>
                <option value="Pase">Tipo de Pase</option>
                <option value="Otro">Otro</option>
              </select>
              <input
                type="text"
                placeholder="Valor (ej: XL, Azul, Cuero)"
                value={newVariantValue}
                onChange={(e) => setNewVariantValue(e.target.value)}
                style={inputStyle}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariant(); } }}
              />
              <button
                type="button"
                onClick={handleAddVariant}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowVariantModal(false)}
                style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <BrandingVectorIcon name="x" size={13} color="#4b5563" />
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              background: isSaving ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 28px',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#ffffff',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>

      </div>
    </div>
  );
}
