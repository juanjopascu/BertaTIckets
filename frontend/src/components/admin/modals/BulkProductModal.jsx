import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import BrandingVectorIcon from '../../../BrandingVectorIcon';

// Diccionario de sinónimos para auto-mapeo inteligente al estilo Tiendanube
const FIELD_SYNONYMS = {
  name: ['nombre', 'name', 'producto', 'product', 'descripcion', 'description', 'articulo', 'artículo', 'item', 'titulo', 'título', 'modelo', 'equipo', 'detalle'],
  sku: ['sku', 'codigo', 'código', 'cod', 'part_number', 'partnumber', 'pn', 'p/n', 'modelo', 'referencia', 'id_producto'],
  price: ['precio', 'price', 'precio_usd', 'precio_dolares', 'costo', 'costo_usd', 'mayorista', 'reseller', 'canal', 'neto', 'gremio', 'distribuidor', 'u$s', 'usd', 'p_lista', 'lista'],
  stock: ['stock', 'cantidad', 'cant', 'existencias', 'disponible', 'disponibilidad', 'qty', 'unidades', 'stock_ar', 'inventario'],
  brand: ['marca', 'brand', 'fabricante', 'vendor', 'proveedor'],
  category: ['categoria', 'categoría', 'category', 'rubro', 'familia', 'tipo', 'segmento'],
  subcategory: ['subcategoria', 'subcategoría', 'subcategory', 'subrubro', 'linea', 'línea', 'tipo_equipo'],
  promotional_price: ['promocional', 'promo', 'precio_promo', 'oferta', 'descuento', 'precio_oferta'],
  iva: ['iva', 'alicuota', 'alícuota', 'tax', 'tax_rate', 'impuesto', 'porcentaje_iva'],
  description: ['descripcion_larga', 'especificaciones', 'detalle_tecnico', 'ficha', 'resumen'],
  image_url: ['imagen', 'image', 'url_imagen', 'foto', 'picture', 'link_imagen'],
  datasheet_url: ['datasheet', 'ficha_tecnica', 'ficha_técnica', 'pdf', 'url_datasheet', 'manual']
};

const SYSTEM_FIELDS = [
  { key: 'name', label: 'Nombre / Modelo del Producto', required: true, group: 'primary', desc: 'Denominación completa del equipo o licencia' },
  { key: 'sku', label: 'SKU / Código de Artículo', required: true, allowAuto: true, autoOptionLabel: '⚡ Auto-extraer del nombre o generar código', group: 'primary', desc: 'Identificador único de catálogo (Part Number)' },
  { key: 'price', label: 'Precio Mayorista (USD)', required: true, group: 'primary', desc: 'Precio base en USD antes de impuestos' },
  { key: 'stock', label: 'Stock / Existencias', required: false, defaultZero: true, group: 'inventory', desc: 'Cantidad de unidades disponibles' },
  { key: 'iva', label: 'IVA (%)', required: false, default21: true, group: 'inventory', desc: 'Alícuota fiscal (21% o 10.5%)' },
  { key: 'brand', label: 'Marca / Fabricante', required: false, allowAuto: true, autoOptionLabel: '⚡ Detectar automáticamente según el nombre', group: 'classification', desc: 'Fabricante oficial (ej. Fortinet, Allied Telesis, Aruba)' },
  { key: 'category', label: 'Categoría', required: false, allowAuto: true, autoOptionLabel: '⚡ Auto-clasificar por tipo (Networking, Security, etc.)', group: 'classification', desc: 'Categoría de producto en la tienda' },
  { key: 'subcategory', label: 'Subcategoría', required: false, group: 'classification', desc: 'Subclasificación técnica específica' },
  { key: 'promotional_price', label: 'Precio Promocional (USD)', required: false, group: 'additional', desc: 'Precio con descuento si aplica' },
  { key: 'description', label: 'Descripción / Ficha', required: false, group: 'additional', desc: 'Texto descriptivo o especificaciones' },
  { key: 'image_url', label: 'URL de Imagen', required: false, group: 'additional', desc: 'Enlace web directo a imagen JPG/PNG/WebP' },
  { key: 'datasheet_url', label: 'Datasheet / Ficha PDF', required: false, group: 'additional', desc: 'Enlace al PDF de especificaciones técnicas' }
];

export default function BulkProductModal({
  isOpen,
  onClose,
  bulkLoading,
  bulkFile,
  bulkData = [],
  bulkError,
  bulkResult,
  bulkMode = 'upsert',
  setBulkMode,
  bulkDragOver,
  setBulkDragOver,
  downloadSampleCSV,
  handleConfirmBulkImport,
  setBulkData,
  setBulkFile,
  setBulkResult,
  selectedCountryScope = 'AR'
}) {
  // Pasos del Wizard: 'upload' (1) -> 'mapping' (2) -> 'validation' (3) -> 'success' (4)
  const [currentStep, setCurrentStep] = useState('upload');
  
  // Datos crudos leídos del archivo
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [localFile, setLocalFile] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Mapeo actual: { [fieldKey]: rawHeaderName | '__auto__' | '__none__' }
  const [columnMapping, setColumnMapping] = useState({});

  // Filtro de visualización en la etapa de pre-validación
  const [validationFilter, setValidationFilter] = useState('all'); // 'all' | 'valid' | 'warning' | 'error'
  const [ignoreErrorsOnImport, setIgnoreErrorsOnImport] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset al abrir o cerrar
  useEffect(() => {
    if (isOpen) {
      if (bulkResult) {
        setCurrentStep('success');
      } else if (rawRows.length > 0 && currentStep === 'validation') {
        // Mantener paso si ya estaba en validación
      } else {
        setCurrentStep('upload');
      }
    } else {
      setLocalError(null);
    }
  }, [isOpen, bulkResult]);

  // Parser universal CSV delimitado por comas, punto y coma, tabs o pipes
  const parseUniversalCSV = (text) => {
    let cleanText = text || '';
    if (cleanText.charCodeAt(0) === 0xFEFF) {
      cleanText = cleanText.slice(1);
    }

    const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const delimiters = [';', ',', '\t', '|'];
    let bestDelim = ',';
    let maxCount = -1;

    for (const d of delimiters) {
      let count = 0;
      let inQ = false;
      for (let j = 0; j < firstLine.length; j++) {
        if (firstLine[j] === '"') inQ = !inQ;
        else if (!inQ && firstLine[j] === d) count++;
      }
      if (count > maxCount) {
        maxCount = count;
        bestDelim = d;
      }
    }

    const rows = [];
    for (const line of lines) {
      const row = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === bestDelim && !inQuotes) {
          row.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      row.push(cur.trim());
      if (row.some(val => val.length > 0)) {
        rows.push(row);
      }
    }
    return rows;
  };

  // Procesamiento de archivo subido (Excel o CSV)
  const processUploadedFile = (file) => {
    if (!file) return;
    setLocalFile(file);
    if (setBulkFile) setBulkFile(file);
    setLocalError(null);

    const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const isExcel = ext === 'xlsx' || ext === 'xls' || ext === 'ods';
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let extractedRows = [];

        if (isExcel) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('El archivo Excel no contiene hojas de trabajo legibles.');
          }
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          extractedRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
        } else {
          const text = typeof e.target.result === 'string'
            ? e.target.result
            : new TextDecoder('utf-8').decode(e.target.result);
          extractedRows = parseUniversalCSV(text);
        }

        if (!extractedRows || extractedRows.length < 2) {
          throw new Error('El archivo debe contener al menos 1 fila de encabezados y al menos 1 fila de productos.');
        }

        const headers = extractedRows[0].map((h, idx) => {
          const clean = String(h || '').trim();
          return clean || `Columna_${idx + 1}`;
        });

        const dataRows = extractedRows.slice(1).filter(r => 
          Array.isArray(r) && r.some(cell => cell !== null && cell !== undefined && String(cell).trim().length > 0)
        );

        if (dataRows.length === 0) {
          throw new Error('No se detectaron filas con datos en la planilla seleccionada.');
        }

        setRawHeaders(headers);
        setRawRows(dataRows);

        // Auto-mapeo inicial inteligente por sinónimos
        const initialMapping = {};
        SYSTEM_FIELDS.forEach(field => {
          const syns = FIELD_SYNONYMS[field.key] || [];
          let matchedHeader = '';

          // 1. Coincidencia exacta o contenida en sinónimos
          for (const header of headers) {
            const hClean = header.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[\s\-_/.]+/g, '_')
              .replace(/^_+|_+$/g, '');

            if (syns.some(s => s === hClean || hClean.includes(s) || s.includes(hClean))) {
              matchedHeader = header;
              break;
            }
          }

          if (matchedHeader) {
            initialMapping[field.key] = matchedHeader;
          } else if (field.allowAuto) {
            initialMapping[field.key] = '__auto__';
          } else if (field.defaultZero) {
            initialMapping[field.key] = '__default_0__';
          } else if (field.default21) {
            initialMapping[field.key] = '__default_21__';
          } else {
            initialMapping[field.key] = '__none__';
          }
        });

        // Caso especial: si no hay columna de SKU explícita pero hay código en el nombre
        if (!initialMapping.sku || initialMapping.sku === '__none__') {
          initialMapping.sku = '__auto__';
        }

        setColumnMapping(initialMapping);
        setCurrentStep('mapping');
      } catch (err) {
        setLocalError(err.message || 'Error procesando el archivo.');
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'UTF-8');
    }
  };

  // Obtener muestra de texto de una columna para filas 1 y 2
  const getColumnSample = (headerName, rowIdx = 0) => {
    if (!headerName || headerName.startsWith('__')) return null;
    const colIdx = rawHeaders.indexOf(headerName);
    if (colIdx === -1) return null;
    const row = rawRows[rowIdx];
    if (!row) return null;
    const val = row[colIdx];
    if (val === undefined || val === null || String(val).trim() === '') return '(Vacío)';
    return String(val).trim();
  };

  // Parseo numérico defensivo de precios (formatos latinoamericanos y anglosajones)
  const parseCleanPrice = (rawVal) => {
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') return 0;
    let clean = String(rawVal).trim()
      .replace(/^(?:U\$S|USD|U\$D|\$|ARS|EUR)\s*/i, '')
      .replace(/\s*(?:USD|U\$S)\s*$/i, '')
      .trim();

    // Formato 1.250,50
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(clean)) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (/^\d+(?:,\d{1,2})$/.test(clean)) {
      clean = clean.replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  // Pre-validación fila por fila usando el mapeo seleccionado
  const validatedDataset = useMemo(() => {
    if (rawRows.length === 0 || rawHeaders.length === 0) return [];

    return rawRows.map((row, index) => {
      const rowNum = index + 2; // Fila 1 son encabezados
      const issues = [];
      let status = 'valid'; // 'valid' | 'warning' | 'error'

      // Helper para extraer valor según mapeo
      const getValue = (fieldKey) => {
        const mappedHeader = columnMapping[fieldKey];
        if (!mappedHeader || mappedHeader.startsWith('__')) return '';
        const colIdx = rawHeaders.indexOf(mappedHeader);
        if (colIdx === -1) return '';
        const val = row[colIdx];
        return val !== undefined && val !== null ? String(val).trim() : '';
      };

      // 1. Nombre / Producto
      let name = getValue('name');
      const descVal = getValue('description');
      if (!name && descVal) {
        name = descVal.length > 120 ? descVal.slice(0, 120) : descVal;
        issues.push('Nombre tomado de la descripción');
      }

      // 2. SKU
      let sku = '';
      const mappedSku = columnMapping.sku;
      if (mappedSku && mappedSku !== '__auto__' && mappedSku !== '__none__') {
        sku = getValue('sku');
      }

      // Si SKU vino como S/SKU o vacío o en modo auto, extraer del nombre
      if (!sku || sku.toUpperCase() === 'S/SKU' || mappedSku === '__auto__') {
        const brandCodeMatch = name.match(/^(?:Allied Telesis|Fortinet|Cisco|Aruba|MikroTik|Vertiv|Avaya|Panduit|Eaton|AudioCodes|SonicWall|Ubiquiti|Poly)\s+([A-Z0-9][A-Z0-9/_.-]{2,25})\s*[-–—:]\s*(.+)$/i);
        if (brandCodeMatch) {
          sku = brandCodeMatch[1].trim();
          issues.push(`SKU extraído de la marca y título: ${sku}`);
        } else {
          const directMatch = name.match(/^([A-Z0-9][A-Z0-9/_.-]{2,25})\s*[-–—:]\s*(.+)$/i);
          if (directMatch) {
            sku = directMatch[1].trim();
            issues.push(`SKU extraído del inicio del título: ${sku}`);
          }
        }
      }

      // 3. Precio USD
      const rawPrice = getValue('price');
      const priceNum = parseCleanPrice(rawPrice);
      const price = priceNum.toFixed(2);

      // Si el SKU parecía un precio (ej. "145.00") y el precio estaba en 0
      if (priceNum === 0 && /^\$?\d+(\.\d{1,2})?$/.test(sku)) {
        sku = '';
        issues.push('Se corrigió valor numérico en SKU');
      }

      // 4. Marca
      let brand = '';
      if (columnMapping.brand && columnMapping.brand !== '__auto__' && columnMapping.brand !== '__none__') {
        brand = getValue('brand');
      }
      if (!brand || brand === 'DACAS' || columnMapping.brand === '__auto__') {
        const nLower = name.toLowerCase();
        const KNOWN_BRANDS = ['fortinet', 'cisco', 'mikrotik', 'vertiv', 'aruba', 'avaya', 'audiocodes', 'panduit', 'eaton', 'allied telesis', 'ubiquiti', 'dell', 'poly', 'juniper', 'huawei', 'tp-link'];
        const matched = KNOWN_BRANDS.find(b => nLower.includes(b));
        if (matched) {
          brand = matched.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          if (brand === 'Tplink' || brand === 'Tp-link') brand = 'TP-Link';
        } else {
          brand = 'DACAS';
        }
      }

      // 5. Categoría
      let category = '';
      if (columnMapping.category && columnMapping.category !== '__auto__' && columnMapping.category !== '__none__') {
        category = getValue('category');
      }
      if (!category || category === 'General' || columnMapping.category === '__auto__') {
        const nLower = name.toLowerCase();
        if (nLower.includes('switch') || nLower.includes('router') || nLower.includes('wi-fi') || nLower.includes('wifi') || nLower.includes('access point') || nLower.includes('conmutador')) {
          category = 'networking';
        } else if (nLower.includes('firewall') || nLower.includes('seguridad') || nLower.includes('fortigate') || nLower.includes('licencia') || nLower.includes('antivirus')) {
          category = 'security';
        } else if (nLower.includes('ups') || nLower.includes('bateria') || nLower.includes('pdu') || nLower.includes('rack') || nLower.includes('servidor') || nLower.includes('gxt') || nLower.includes('energia')) {
          category = 'infraestructura';
        } else if (nLower.includes('telefono') || nLower.includes('videoconferencia') || nLower.includes('poly') || nLower.includes('auricular') || nLower.includes('avaya')) {
          category = 'comunicaciones_unificadas';
        } else {
          category = 'General';
        }
      }

      // 6. Stock
      let stock = 0;
      if (columnMapping.stock && columnMapping.stock !== '__default_0__' && columnMapping.stock !== '__none__') {
        const rawStock = getValue('stock');
        stock = parseInt(String(rawStock).replace(/[^0-9-]/g, ''), 10) || 0;
      }

      // 7. IVA
      let iva = 21;
      if (columnMapping.iva && columnMapping.iva !== '__default_21__' && columnMapping.iva !== '__none__') {
        const rawIva = getValue('iva');
        const numIva = parseFloat(String(rawIva).replace('%', '').replace(',', '.'));
        if (!isNaN(numIva) && numIva > 0) iva = numIva;
      }

      // 8. Campos adicionales
      const subcategory = getValue('subcategory');
      const promotional_price = getValue('promotional_price');
      const description = getValue('description') || `<p>${name}</p>`;
      const image_url = getValue('image_url');
      const datasheet_url = getValue('datasheet_url');

      // Generación defensiva de SKU si sigue vacío
      if (!sku || sku.toUpperCase() === 'S/SKU') {
        const autoBrand = brand && brand !== 'DACAS' ? brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() : 'DAC';
        const autoWords = name.split(/\s+/).slice(0, 2).map(w => w.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()).filter(Boolean).join('');
        sku = `${autoBrand}-${autoWords || 'PROD'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        issues.push(`SKU generado automáticamente: ${sku}`);
      }

      // ══════════════════════════════════════════════════════════
      // EVALUACIÓN DE SEMÁFORO DE CALIDAD (OK / ADVERTENCIA / ERROR)
      // ══════════════════════════════════════════════════════════
      if (!name || name.trim().length === 0) {
        status = 'error';
        issues.unshift('Falta el nombre del producto (obligatorio)');
      } else if (priceNum === 0) {
        status = 'warning';
        issues.push('Precio en $0.00 (el producto se creará pero requerirá cotización)');
      } else if (stock === 0) {
        status = 'warning';
        issues.push('Stock en 0 unidades (se listará con botón Consultar Disponibilidad)');
      }

      return {
        _rowNumber: rowNum,
        _status: status,
        _issues: issues,
        name,
        sku,
        price,
        stock,
        brand,
        category,
        subcategory,
        iva,
        tax_rate: iva,
        promotional_price: promotional_price ? parseCleanPrice(promotional_price).toFixed(2) : '',
        description,
        image_url,
        datasheet_url,
        visible: true,
        is_visible: true,
        status: 'activo',
        isValid: status !== 'error'
      };
    });
  }, [rawRows, rawHeaders, columnMapping]);

  // Contadores de calidad
  const stats = useMemo(() => {
    const total = validatedDataset.length;
    const valid = validatedDataset.filter(d => d._status === 'valid').length;
    const warning = validatedDataset.filter(d => d._status === 'warning').length;
    const error = validatedDataset.filter(d => d._status === 'error').length;
    return { total, valid, warning, error };
  }, [validatedDataset]);

  // Dataset filtrado para la tabla de pre-visualización
  const filteredDataset = useMemo(() => {
    return validatedDataset.filter(item => {
      // Filtro por tab de estado
      if (validationFilter === 'valid' && item._status !== 'valid') return false;
      if (validationFilter === 'warning' && item._status !== 'warning') return false;
      if (validationFilter === 'error' && item._status !== 'error') return false;

      // Filtro por buscador de texto
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesBrand;
      }
      return true;
    });
  }, [validatedDataset, validationFilter, searchTerm]);

  // Ejecución final de importación
  const executeImport = () => {
    const productsToImport = ignoreErrorsOnImport
      ? validatedDataset.filter(item => item._status !== 'error')
      : validatedDataset;

    if (productsToImport.length === 0) {
      alert('No hay productos válidos seleccionados para importar.');
      return;
    }

    if (setBulkData) setBulkData(productsToImport);
    if (handleConfirmBulkImport) {
      handleConfirmBulkImport(productsToImport, bulkMode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => !bulkLoading && onClose()} style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '96%',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0a192f',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
      >
        {/* Header con Stepper */}
        <div style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
          color: '#ffffff',
          padding: '20px 28px',
          borderBottom: '1px solid rgba(15, 164, 222, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
            }}>
              <BrandingVectorIcon name="upload" size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>
                  Asistente de Importación Masiva B2B
                </h2>
                <span style={{
                  background: 'rgba(15, 164, 222, 0.2)',
                  color: '#38BDF8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  Depósito {selectedCountryScope}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Validación estricta de columnas y pre-visualización de registros antes de guardar
              </p>
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Step 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: currentStep === 'upload' ? 'rgba(15, 164, 222, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentStep === 'upload' ? '#0fa4de' : 'rgba(255, 255, 255, 0.1)'}`,
              color: currentStep === 'upload' ? '#38BDF8' : '#94A3B8',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <span>1. Archivo</span>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>→</span>
            {/* Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: currentStep === 'mapping' ? 'rgba(15, 164, 222, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentStep === 'mapping' ? '#0fa4de' : 'rgba(255, 255, 255, 0.1)'}`,
              color: currentStep === 'mapping' ? '#38BDF8' : '#94A3B8',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <span>2. Mapear Columnas</span>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>→</span>
            {/* Step 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: currentStep === 'validation' ? 'rgba(15, 164, 222, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentStep === 'validation' ? '#0fa4de' : 'rgba(255, 255, 255, 0.1)'}`,
              color: currentStep === 'validation' ? '#38BDF8' : '#94A3B8',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <span>3. Validar Registros</span>
            </div>

            <button
              disabled={bulkLoading}
              onClick={onClose}
              style={{
                marginLeft: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: bulkLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Cerrar"
            >
              <BrandingVectorIcon name="x" size={16} color="#CBD5E1" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', background: '#F8FAFC', flex: 1 }}>

          {/* Alertas de Error */}
          {(localError || bulkError) && (
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
              gap: '10px'
            }}>
              <BrandingVectorIcon name="alert-triangle" size={18} color="#991B1B" />
              <span>{localError || bulkError}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* PASO 1: SELECCIÓN Y CARGA DEL ARCHIVO                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {currentStep === 'upload' && (
            <div>
              {/* Info plantilla */}
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
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BrandingVectorIcon name="file-text" size={20} color="#0284c7" />
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '13.5px', display: 'block' }}>¿Primera vez cargando productos?</strong>
                    <span style={{ color: '#64748B', fontSize: '12.5px' }}>
                      Puedes usar tus propias planillas de distribuidores (Allied Telesis, Fortinet, Cisco, Vertiv) o nuestra plantilla pre-armada.
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
                    gap: '6px'
                  }}
                >
                  Descargar Plantilla CSV Oficial
                </button>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true); }}
                onDragLeave={() => setBulkDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setBulkDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUploadedFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  background: bulkDragOver ? '#F0F9FF' : '#FFFFFF',
                  border: `2px dashed ${bulkDragOver ? '#0fa4de' : '#CBD5E1'}`,
                  borderRadius: '18px',
                  padding: '45px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '20px'
                }}
                onClick={() => document.getElementById('tienda-file-input').click()}
              >
                <input
                  id="tienda-file-input"
                  type="file"
                  accept=".xlsx,.xls,.ods,.csv,text/csv,text/plain"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processUploadedFile(e.target.files[0]);
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <BrandingVectorIcon name="upload-cloud" size={42} color="#0FA4DE" />
                </div>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '15px', display: 'block' }}>
                    Arrastra y suelta tu archivo Excel (.xlsx / .xls) o CSV aquí
                  </strong>
                  <span style={{ color: '#64748B', fontSize: '12.5px', marginTop: '6px', display: 'block' }}>
                    Acepta libros de Excel multicelulares y archivos de texto delimitados por coma o punto y coma.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* PASO 2: MAPEO DE COLUMNAS (A LO TIENDANUBE)                */}
          {/* ══════════════════════════════════════════════════════════ */}
          {currentStep === 'mapping' && (
            <div>
              {/* Barra de cabecera con archivo cargado */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BrandingVectorIcon name="check-circle" size={18} color="#166534" />
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '14px' }}>
                      {localFile?.name || 'Archivo cargado'}
                    </strong>
                    <span style={{ color: '#64748B', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                      {rawHeaders.length} columnas detectadas | {rawRows.length} filas con productos
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('upload')}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cambiar Archivo
                </button>
              </div>

              {/* Instrucción clara */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#1E40AF',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <BrandingVectorIcon name="info" size={18} color="#1E40AF" />
                <span>
                  <strong>Asigna tus columnas:</strong> Verifica qué columna de tu planilla corresponde a cada campo de DACAS. Observa las muestras de texto en vivo para corroborar el contenido real.
                </span>
              </div>

              {/* Formulario de mapeo agrupado */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Grupo 1: Campos Principales Obligatorios */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                    <strong style={{ color: '#0F172A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Campos Principales Obligatorios
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
                    {SYSTEM_FIELDS.filter(f => f.group === 'primary').map(field => {
                      const selectedVal = columnMapping[field.key] || '';
                      const sample1 = getColumnSample(selectedVal, 0);
                      const sample2 = getColumnSample(selectedVal, 1);

                      return (
                        <div key={field.key} style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                              {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                            </label>
                            {field.required && (
                              <span style={{ fontSize: '10.5px', background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                Requerido
                              </span>
                            )}
                          </div>

                          <select
                            value={selectedVal}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '12.5px',
                              fontWeight: '600'
                            }}
                          >
                            <option value="__none__">-- No mapear / Omitir --</option>
                            {field.allowAuto && (
                              <option value="__auto__">{field.autoOptionLabel || '⚡ Extraer o detectar automáticamente'}</option>
                            )}
                            {rawHeaders.map((h, i) => (
                              <option key={i} value={h}>Columna: {h}</option>
                            ))}
                          </select>

                          {/* Muestra de texto en vivo */}
                          <div style={{
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px dashed #CBD5E1',
                            padding: '8px 10px',
                            fontSize: '11.5px',
                            color: '#475569'
                          }}>
                            {selectedVal === '__auto__' ? (
                              <span style={{ color: '#0284c7', fontWeight: '600' }}>
                                ✨ Modo automático: se deducirá del nombre o modelo del producto
                              </span>
                            ) : selectedVal === '__none__' ? (
                              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                Columna omitida
                              </span>
                            ) : (
                              <div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <strong style={{ color: '#0F172A' }}>Muestra Fila 1:</strong> {sample1 || '(Vacío)'}
                                </div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                  <strong style={{ color: '#0F172A' }}>Muestra Fila 2:</strong> {sample2 || '(Vacío)'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grupo 2: Inventario e Impuestos */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                    <strong style={{ color: '#0F172A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Inventario e Impuestos
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
                    {SYSTEM_FIELDS.filter(f => f.group === 'inventory').map(field => {
                      const selectedVal = columnMapping[field.key] || '';
                      const sample1 = getColumnSample(selectedVal, 0);
                      const sample2 = getColumnSample(selectedVal, 1);

                      return (
                        <div key={field.key} style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                            {field.label}
                          </label>

                          <select
                            value={selectedVal}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '12.5px',
                              fontWeight: '600'
                            }}
                          >
                            {field.defaultZero && <option value="__default_0__">Sin columna (default 0 unidades)</option>}
                            {field.default21 && <option value="__default_21__">Sin columna (default 21% IVA)</option>}
                            <option value="__none__">-- Omitir --</option>
                            {rawHeaders.map((h, i) => (
                              <option key={i} value={h}>Columna: {h}</option>
                            ))}
                          </select>

                          <div style={{
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px dashed #CBD5E1',
                            padding: '8px 10px',
                            fontSize: '11.5px',
                            color: '#475569'
                          }}>
                            {selectedVal.startsWith('__') ? (
                              <span style={{ color: '#0284c7' }}>Valor por defecto del sistema</span>
                            ) : (
                              <div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <strong style={{ color: '#0F172A' }}>Muestra Fila 1:</strong> {sample1 || '(Vacío)'}
                                </div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                  <strong style={{ color: '#0F172A' }}>Muestra Fila 2:</strong> {sample2 || '(Vacío)'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grupo 3: Clasificación y Marca */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                    <strong style={{ color: '#0F172A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clasificación y Marca
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
                    {SYSTEM_FIELDS.filter(f => f.group === 'classification').map(field => {
                      const selectedVal = columnMapping[field.key] || '';
                      const sample1 = getColumnSample(selectedVal, 0);

                      return (
                        <div key={field.key} style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                            {field.label}
                          </label>

                          <select
                            value={selectedVal}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '12.5px',
                              fontWeight: '600'
                            }}
                          >
                            {field.allowAuto && (
                              <option value="__auto__">{field.autoOptionLabel || '⚡ Auto-detectar'}</option>
                            )}
                            <option value="__none__">-- Omitir / General --</option>
                            {rawHeaders.map((h, i) => (
                              <option key={i} value={h}>Columna: {h}</option>
                            ))}
                          </select>

                          <div style={{
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px dashed #CBD5E1',
                            padding: '8px 10px',
                            fontSize: '11.5px',
                            color: '#475569'
                          }}>
                            {selectedVal === '__auto__' ? (
                              <span style={{ color: '#0284c7' }}>Auto-clasificación inteligente habilitada</span>
                            ) : (
                              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <strong style={{ color: '#0F172A' }}>Muestra Fila 1:</strong> {sample1 || '(Vacío)'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grupo 4: Multimedia y Enlaces */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span>
                    <strong style={{ color: '#0F172A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Información Adicional & Multimedia (Opcional)
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
                    {SYSTEM_FIELDS.filter(f => f.group === 'additional').map(field => {
                      const selectedVal = columnMapping[field.key] || '';
                      const sample1 = getColumnSample(selectedVal, 0);

                      return (
                        <div key={field.key} style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                            {field.label}
                          </label>

                          <select
                            value={selectedVal}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '12.5px',
                              fontWeight: '600'
                            }}
                          >
                            <option value="__none__">-- No mapear / Omitir --</option>
                            {rawHeaders.map((h, i) => (
                              <option key={i} value={h}>Columna: {h}</option>
                            ))}
                          </select>

                          <div style={{
                            background: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px dashed #CBD5E1',
                            padding: '8px 10px',
                            fontSize: '11.5px',
                            color: '#475569'
                          }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <strong style={{ color: '#0F172A' }}>Muestra:</strong> {sample1 || '(Vacío)'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Botón avanzar a validación */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <button
                  onClick={() => setCurrentStep('upload')}
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
                  Atrás
                </button>
                <button
                  onClick={() => setCurrentStep('validation')}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 24px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Continuar a Validación Fila por Fila</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* PASO 3: VALIDACIÓN FILA POR FILA (SEMÁFORO TIENDANUBE)     */}
          {/* ══════════════════════════════════════════════════════════ */}
          {currentStep === 'validation' && (
            <div>
              {/* Tarjetas de Semáforo / Calidad */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}>
                {/* Total */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                    Total Filas
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>
                    {stats.total}
                  </div>
                </div>

                {/* Válidos */}
                <div
                  onClick={() => setValidationFilter('valid')}
                  style={{
                    background: validationFilter === 'valid' ? '#F0FDF4' : '#FFFFFF',
                    borderRadius: '14px',
                    border: `1.5px solid ${validationFilter === 'valid' ? '#16A34A' : '#DCFCE7'}`,
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                    Válidos / Listos
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16A34A', marginTop: '4px' }}>
                    {stats.valid}
                  </div>
                </div>

                {/* Con Advertencias */}
                <div
                  onClick={() => setValidationFilter('warning')}
                  style={{
                    background: validationFilter === 'warning' ? '#FFFBEB' : '#FFFFFF',
                    borderRadius: '14px',
                    border: `1.5px solid ${validationFilter === 'warning' ? '#D97706' : '#FEF3C7'}`,
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontSize: '11.5px', color: '#92400E', fontWeight: '700', textTransform: 'uppercase' }}>
                    Con Advertencias
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#D97706', marginTop: '4px' }}>
                    {stats.warning}
                  </div>
                </div>

                {/* Con Errores */}
                <div
                  onClick={() => setValidationFilter('error')}
                  style={{
                    background: validationFilter === 'error' ? '#FEF2F2' : '#FFFFFF',
                    borderRadius: '14px',
                    border: `1.5px solid ${validationFilter === 'error' ? '#DC2626' : '#FEE2E2'}`,
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontSize: '11.5px', color: '#991B1B', fontWeight: '700', textTransform: 'uppercase' }}>
                    Errores Bloqueantes
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#DC2626', marginTop: '4px' }}>
                    {stats.error}
                  </div>
                </div>
              </div>

              {/* Filtros y Opciones de Importación */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {/* Tabs de filtro */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { key: 'all', label: `Todos (${stats.total})` },
                    { key: 'valid', label: `Válidos (${stats.valid})` },
                    { key: 'warning', label: `Advertencias (${stats.warning})` },
                    { key: 'error', label: `Errores (${stats.error})` }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setValidationFilter(tab.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: validationFilter === tab.key ? '#0fa4de' : '#F1F5F9',
                        color: validationFilter === tab.key ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Buscador rápido */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Filtrar por texto, SKU o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      width: '230px'
                    }}
                  />

                  {/* Selector modo upsert */}
                  <select
                    value={bulkMode}
                    onChange={(e) => setBulkMode && setBulkMode(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: '#F8FAFC'
                    }}
                  >
                    <option value="upsert">Actualizar y Crear (Upsert)</option>
                    <option value="create_only">Solo crear nuevos</option>
                  </select>
                </div>
              </div>

              {/* Checkbox de seguridad */}
              {stats.error > 0 && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="chk-ignore-errors"
                    checked={ignoreErrorsOnImport}
                    onChange={(e) => setIgnoreErrorsOnImport(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="chk-ignore-errors" style={{ fontSize: '12.5px', color: '#991B1B', fontWeight: '700', cursor: 'pointer' }}>
                    Omitir automáticamente las {stats.error} filas con errores críticos (solo se importarán las {stats.valid + stats.warning} filas válidas y con advertencias).
                  </label>
                </div>
              )}

              {/* Tabla de Registros Pre-validados */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px 18px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ fontSize: '12.5px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Vista Previa Detallada ({filteredDataset.length} registros)
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Comprueba cómo se guardará cada artículo en DACAS
                  </span>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '340px' }}>
                  <table className="users-table" style={{ margin: 0, fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th># Fila</th>
                        <th>Estado</th>
                        <th>SKU</th>
                        <th>Producto</th>
                        <th>Marca</th>
                        <th>Categoría</th>
                        <th>Precio (USD)</th>
                        <th>IVA</th>
                        <th>Stock</th>
                        <th>Observaciones / Diagnóstico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDataset.slice(0, 100).map((item, idx) => (
                        <tr key={idx} style={{
                          background: item._status === 'error' ? 'rgba(254, 242, 242, 0.4)' : (item._status === 'warning' ? 'rgba(255, 251, 235, 0.4)' : 'transparent')
                        }}>
                          <td><strong>{item._rowNumber}</strong></td>
                          <td>
                            {item._status === 'valid' && (
                              <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                ✓ Válido
                              </span>
                            )}
                            {item._status === 'warning' && (
                              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                ⚠ Alerta
                              </span>
                            )}
                            {item._status === 'error' && (
                              <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                ✕ Error
                              </span>
                            )}
                          </td>
                          <td>
                            <code style={{
                              background: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              color: item.sku ? '#0284c7' : '#EF4444'
                            }}>
                              {item.sku || 'SIN SKU'}
                            </code>
                          </td>
                          <td>
                            <strong style={{ color: '#0F172A', display: 'block', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name || '(Sin Nombre)'}
                            </strong>
                          </td>
                          <td>{item.brand || 'DACAS'}</td>
                          <td>
                            <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: parseFloat(item.price) > 0 ? '#0F172A' : '#D97706' }}>
                              ${item.price}
                            </strong>
                          </td>
                          <td>{item.iva}%</td>
                          <td>
                            <strong style={{ color: item.stock > 0 ? '#166534' : '#DC2626' }}>
                              {item.stock} U.
                            </strong>
                          </td>
                          <td>
                            {item._issues.length > 0 ? (
                              <div style={{ fontSize: '11px', color: item._status === 'error' ? '#DC2626' : '#92400E', lineHeight: '1.3' }}>
                                {item._issues.join(' • ')}
                              </div>
                            ) : (
                              <span style={{ color: '#16A34A', fontSize: '11px' }}>Todo correcto</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredDataset.length > 100 && (
                  <div style={{ padding: '8px 16px', background: '#F8FAFC', fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
                    Mostrando las primeras 100 filas de {filteredDataset.length} para optimizar el rendimiento.
                  </div>
                )}
              </div>

              {/* Acciones Finales */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  disabled={bulkLoading}
                  onClick={() => setCurrentStep('mapping')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ← Volver al Mapeo de Columnas
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    disabled={bulkLoading}
                    onClick={() => {
                      setRawHeaders([]);
                      setRawRows([]);
                      setLocalFile(null);
                      setCurrentStep('upload');
                    }}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#64748B',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Descartar y Cargar Otro Archivo
                  </button>

                  <button
                    disabled={bulkLoading || (ignoreErrorsOnImport ? stats.valid + stats.warning === 0 : stats.total === 0)}
                    onClick={executeImport}
                    style={{
                      background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 24px',
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
                      <span>Importando datos a {selectedCountryScope}...</span>
                    ) : (
                      <span>
                        Confirmar e Importar {ignoreErrorsOnImport ? (stats.valid + stats.warning) : stats.total} Productos
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* PASO 4: RESULTADO EXITOSO DE LA IMPORTACIÓN                */}
          {/* ══════════════════════════════════════════════════════════ */}
          {currentStep === 'success' && bulkResult && (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <BrandingVectorIcon name="check-circle" size={36} color="#166534" />
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: '900', color: '#0F172A' }}>
                ¡Carga Masiva Procesada Exitosamente!
              </h3>
              <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '13.5px' }}>
                Los productos se sincronizaron en el catálogo del depósito de {selectedCountryScope}.
              </p>

              <div style={{
                maxWidth: '500px',
                margin: '0 auto 30px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-around',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>TOTAL</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>{bulkResult.total}</div>
                </div>
                <div style={{ borderRight: '1px solid #E2E8F0' }}></div>
                <div>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: '700' }}>CREADOS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16A34A' }}>{bulkResult.created}</div>
                </div>
                <div style={{ borderRight: '1px solid #E2E8F0' }}></div>
                <div>
                  <span style={{ fontSize: '12px', color: '#0369A1', fontWeight: '700' }}>ACTUALIZADOS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284c7' }}>{bulkResult.updated}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button
                  onClick={() => {
                    setRawHeaders([]);
                    setRawRows([]);
                    setLocalFile(null);
                    if (setBulkResult) setBulkResult(null);
                    setCurrentStep('upload');
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Importar Otra Planilla
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
                  }}
                >
                  Ver Catálogo Actualizado
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
