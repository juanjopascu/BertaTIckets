import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';

export default function BulkProductModal({
  isOpen,
  onClose,
  bulkLoading,
  bulkFile,
  bulkData = [],
  bulkError,
  bulkResult,
  bulkMode,
  setBulkMode,
  bulkDragOver,
  setBulkDragOver,
  downloadSampleCSV,
  handleProcessCSVFile,
  handleConfirmBulkImport,
  setBulkData,
  setBulkFile,
  setBulkResult
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => !bulkLoading && onClose()} style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
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
              boxShadow: '0 4px 14px rgba(15, 164, 222, 0.35)'
            }}>
              <BrandingVectorIcon name="upload" size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
                Carga Masiva de Productos (Excel / CSV)
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#94A3B8' }}>
                Importa o actualiza miles de productos a tu catálogo B2B mediante planillas Excel (.xlsx / .xls) o CSV
              </p>
            </div>
          </div>

          <button
            disabled={bulkLoading}
            onClick={onClose}
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
                  Descarga nuestra plantilla oficial pre-formateada con columna de IVA (21% / 10.5%), links a datasheets PDF y productos relacionados.
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
              Descargar Plantilla CSV / Excel
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
              accept=".csv,text/csv,text/plain,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessCSVFile(e.target.files[0]);
                }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <BrandingVectorIcon name="upload-cloud" size={36} color="#0FA4DE" />
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
                  Arrastra y suelta tu archivo Excel (.xlsx / .xls) o .CSV aquí
                </strong>
                <span style={{ color: '#64748B', fontSize: '12.5px', marginTop: '4px', display: 'block' }}>
                  o haz clic para buscarlo en tu equipo (compatible con libros de Excel y CSVs delimitados por coma o punto y coma)
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
              <BrandingVectorIcon name="alert-triangle" size={16} color="#991B1B" />
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
                <BrandingVectorIcon name="check-circle" size={18} color="#166534" />
                <span>Carga masiva procesada exitosamente</span>
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
                    <option value="upsert">Actualizar existentes y Crear nuevos (Upsert)</option>
                    <option value="create_only">Solo crear nuevos</option>
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
                    Vista Previa de Registros ({bulkData.length > 15 ? 'Primeros 15 de ' + bulkData.length : bulkData.length})
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Revisa que las columnas coincidan correctamente antes de confirmar
                  </span>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '320px' }}>
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
                        <th>IVA (%)</th>
                        <th>Stock</th>
                        <th>Visibilidad</th>
                        <th>Datasheet</th>
                        <th>Relacionados</th>
                        <th>Peso (kg)</th>
                        <th>Dimensiones (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkData.slice(0, 15).map((item, idx) => {
                        const rawV = item.visible !== undefined ? item.visible : (item.is_visible !== undefined ? item.is_visible : (item.visibilidad !== undefined ? item.visibilidad : item.status));
                        const isOculto = rawV === false || String(rawV).trim().toLowerCase() === 'oculto' || String(rawV).trim().toLowerCase() === 'false' || String(rawV).trim().toLowerCase() === '0';
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>
                              {item.isValid ? (
                                <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                  Válido
                                </span>
                              ) : (
                                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                  Incompleto
                                </span>
                              )}
                            </td>
                            <td><strong style={{ color: '#0F172A' }}>{item.name || '—'}</strong></td>
                            <td>{item.brand || '—'}</td>
                            <td><span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{item.category || 'General'}</span></td>
                            <td style={{ fontFamily: 'monospace' }}>{item.sku || '—'}</td>
                            <td><strong>${item.price}</strong></td>
                            <td>{item.promotional_price ? <span style={{ color: '#10B981', fontWeight: '700' }}>${item.promotional_price}</span> : '—'}</td>
                            <td>
                              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                {item.iva ?? item.tax_rate ?? 21}%
                              </span>
                            </td>
                            <td><strong style={{ color: item.stock > 0 ? '#166534' : '#DC2626' }}>{item.stock}</strong></td>
                            <td>
                              {isOculto ? (
                                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                  Oculto
                                </span>
                              ) : (
                                <span style={{ background: '#ECFDF5', color: '#065F46', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                  Visible
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {item.datasheet_url ? (
                                <a
                                  href={item.datasheet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#E0F2FE',
                                    color: '#0369A1',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    display: 'inline-block'
                                  }}
                                  title={item.datasheet_url}
                                >
                                  PDF Link
                                </a>
                              ) : (
                                <span style={{ color: '#94A3B8' }}>—</span>
                              )}
                            </td>
                            <td>
                              {item.related_skus ? (
                                <span
                                  style={{
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10.5px',
                                    fontFamily: 'monospace',
                                    display: 'inline-block',
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={Array.isArray(item.related_skus) ? item.related_skus.join(', ') : String(item.related_skus)}
                                >
                                  {Array.isArray(item.related_skus) ? item.related_skus.join(', ') : String(item.related_skus)}
                                </span>
                              ) : (
                                <span style={{ color: '#94A3B8' }}>—</span>
                              )}
                            </td>
                            <td>{item.weight ? `${item.weight} kg` : '—'}</td>
                            <td>{(item.depth || item.width || item.height) ? `${item.depth || '0'} x ${item.width || '0'} x ${item.height || '0'}` : '—'}</td>
                          </tr>
                        );
                      })}
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
                    <span>Importando...</span>
                  ) : (
                    <span>Confirmar e Importar {bulkData.length} Productos</span>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
