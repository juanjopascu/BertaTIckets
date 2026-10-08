import React from 'react';

export default function ClientTypesModal({
  isOpen,
  onClose,
  editingClientType,
  setEditingClientType,
  clientTypeForm,
  setClientTypeForm,
  savingClientType,
  handleSaveClientType,
  handleDeleteClientType,
  clientTypes = [],
  users = []
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 21, 36, 0.75)', zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#ffffff',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d233a 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>🏷️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                ABM: Tipos de Cliente (Segmentación B2B)
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Crea y administra los tipos de cliente para segmentar listas de precios, descuentos automáticos y filtros.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffffff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Form Crear / Editar */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{editingClientType ? '✏️' : '➕'}</span>
                <span>{editingClientType ? `Editar Tipo: ${editingClientType.name}` : 'Crear Nuevo Tipo de Cliente'}</span>
              </div>
              {editingClientType && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingClientType(null);
                    setClientTypeForm({ name: '', description: '', color: '#0284c7' });
                  }}
                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSaveClientType} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                    Nombre del Tipo de Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Integrador IT / Reseller, Carrier ISP..."
                    value={clientTypeForm.name}
                    onChange={e => setClientTypeForm({ ...clientTypeForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                    Color / Distintivo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={clientTypeForm.color || '#0284c7'}
                      onChange={e => setClientTypeForm({ ...clientTypeForm, color: e.target.value })}
                      style={{ width: '42px', height: '38px', padding: '2px', borderRadius: '8px', border: '1.5px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setClientTypeForm({ ...clientTypeForm, color: c })}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: c,
                            border: clientTypeForm.color === c ? '2.5px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                  Descripción / Alcance (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Empresas y canales con foco en integración de networking y ciberseguridad"
                  value={clientTypeForm.description}
                  onChange={e => setClientTypeForm({ ...clientTypeForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={savingClientType}
                  style={{
                    background: 'linear-gradient(135deg, #0fa4de 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(15, 164, 222, 0.3)'
                  }}
                >
                  <span>{savingClientType ? '⏳ Guardando...' : (editingClientType ? '✓ Actualizar Tipo' : '➕ Crear Tipo de Cliente')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Tipos Actuales */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>
                Tipos de Cliente Registrados ({clientTypes.length})
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                Estos tipos aparecerán disponibles en la lista desplegable al crear o editar clientes.
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', fontWeight: '800', color: '#475569' }}>Nombre / Tipo</th>
                    <th style={{ padding: '8px 12px', fontWeight: '800', color: '#475569' }}>Descripción</th>
                    <th style={{ padding: '8px 12px', fontWeight: '800', color: '#475569', textAlign: 'center', width: '90px' }}>Clientes</th>
                    <th style={{ padding: '8px 12px', fontWeight: '800', color: '#475569', textAlign: 'right', width: '130px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        No hay tipos de clientes definidos todavía.
                      </td>
                    </tr>
                  ) : (
                    clientTypes.map(ct => {
                      const clientCount = users.filter(u => (u.tipo_cliente || '').trim().toLowerCase() === (ct.name || '').trim().toLowerCase()).length;
                      return (
                        <tr key={ct.id || ct.name} style={{ borderBottom: '1px solid #f1f5f9', background: editingClientType?.id === ct.id ? '#eff6ff' : '#ffffff' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ct.color || '#0284c7', flexShrink: 0 }}></span>
                              <strong style={{ color: '#0f172a' }}>{ct.name}</strong>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>
                            {ct.description || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Sin descripción</span>}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                              {clientCount}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingClientType(ct);
                                  setClientTypeForm({ name: ct.name, description: ct.description || '', color: ct.color || '#0284c7' });
                                }}
                                style={{
                                  background: '#f0f9ff',
                                  color: '#0284c7',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClientType(ct.id, ct.name)}
                                style={{
                                  background: '#fef2f2',
                                  color: '#ef4444',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Eliminar
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
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
