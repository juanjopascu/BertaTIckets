import React from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';

export default function BrandCreateModal({
  isOpen,
  onClose,
  newBrandForm,
  setNewBrandForm,
  handleCreateNewBrand,
  isUploadingBrandLogo,
  isUploadingBrandBanner,
  handleUploadBrandLogo,
  handleUploadBrandBanner,
  dacasCountriesList = []
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '600px', padding: '28px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandingVectorIcon name="plus" size={18} color="#0FA4DE" />
            <span>Crear y Asignar Nueva Marca</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
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

          {/* Banner Upload & URL for New Brand */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                Banner de la Marca (Portada para el Catálogo)
              </label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Recomendado: 1200×300 px</span>
            </div>
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
                <span>{isUploadingBrandBanner ? 'Subiendo...' : 'Subir banner...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadBrandBanner(e.target.files[0], true);
                    }
                  }}
                />
              </label>
              {newBrandForm.banner && (
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>✓ Banner cargado</span>
              )}
            </div>
            <input
              type="text"
              placeholder="O ingresa la URL del banner (https://...)"
              value={newBrandForm.banner || ''}
              onChange={(e) => setNewBrandForm({ ...newBrandForm, banner: e.target.value })}
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
                      onClick={() => setNewBrandForm({ ...newBrandForm, countries: dacasCountriesList.map(c => c.code) })}
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
                  {dacasCountriesList.map(c => {
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
              onClick={onClose}
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
  );
}
