import React from 'react';

export default function ProductCloneModal({
  isOpen,
  productToClone,
  onClose,
  cloneTargetCountry,
  setCloneTargetCountry,
  handleExecuteClone,
  isCloning,
  dacasCountriesList = []
}) {
  if (!isOpen || !productToClone) return null;

  return (
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
            {dacasCountriesList.map(c => (
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
            onClick={onClose}
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
  );
}
