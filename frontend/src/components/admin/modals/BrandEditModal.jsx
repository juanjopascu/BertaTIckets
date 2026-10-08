import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import { BrandLogoImg } from '../../../Shop';

export default function BrandEditModal({
  editingBrandModal,
  setEditingBrandModal,
  handleSaveBrandModal,
  isUploadingBrandLogo,
  isUploadingBrandBanner,
  handleUploadBrandLogo,
  handleUploadBrandBanner,
  dacasCountriesList = []
}) {
  if (!editingBrandModal) return null;

  return (
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

              {/* Brand Banner: Upload & URL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                    Banner de la Marca (Portada para el Catálogo)
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Recomendado: 1200 × 300 px</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
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
                    <span>{isUploadingBrandBanner ? 'Subiendo banner...' : 'Subir banner...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadBrandBanner(e.target.files[0], false);
                        }
                      }}
                    />
                  </label>
                  {editingBrandModal.banner && (
                    <button
                      type="button"
                      onClick={() => setEditingBrandModal({ ...editingBrandModal, banner: '' })}
                      style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      ✕ Quitar banner
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="O ingresa la URL del banner (https://...)"
                  value={editingBrandModal.banner || ''}
                  onChange={(e) => setEditingBrandModal({ ...editingBrandModal, banner: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', color: '#334155' }}
                />
                {editingBrandModal.banner && (
                  <div style={{
                    marginTop: '8px',
                    width: '100%',
                    height: '68px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    position: 'relative',
                    background: '#071524'
                  }}>
                    <img
                      src={editingBrandModal.banner}
                      alt="Previsualización banner"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F1F5F9', marginTop: '16px' }}>
                  <span style={{ color: editingBrandModal.color || '#0fa4de', fontSize: '12.5px', fontWeight: '800' }}>
                    Ver Productos →
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                Esta es exactamente la tarjeta que tus clientes verán en el catálogo y directorio de marcas.
              </div>

              {/* Vista previa del Banner para Catálogo */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span>🖼️</span> VISTA PREVIA DEL BANNER EN LA WEB (CATÁLOGO)
                </div>
                {editingBrandModal.banner ? (
                  <div style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: `2px solid ${editingBrandModal.color || '#0fa4de'}`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    maxHeight: '110px',
                    background: '#071524'
                  }}>
                    <img
                      src={editingBrandModal.banner}
                      alt={`Banner ${editingBrandModal.name}`}
                      style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    borderRadius: '14px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '14px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    color: '#94A3B8',
                    fontSize: '11.5px',
                    lineHeight: 1.4
                  }}>
                    Sin banner configurado. Si cargas un banner, aparecerá automáticamente como cabecera cuando el cliente haga clic en la tarjeta de {editingBrandModal.name || 'esta marca'} en la tienda.
                  </div>
                )}
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
                {dacasCountriesList.map(c => {
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
  );
}
