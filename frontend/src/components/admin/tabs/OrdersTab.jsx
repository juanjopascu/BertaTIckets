import React, { useState, useMemo } from 'react';
import BrandingVectorIcon from '../../../BrandingVectorIcon';
import PaginationBar from '../PaginationBar';
import { statusStyle, statusLabel, downloadCSV } from '../adminHelpers';

export default function OrdersTab({
  orders = [],
  countries = [],
  activeCountryObj = { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  handleUpdateOrderStatus,
  onViewOrder,
  exportOrdersCSV: externalExportOrdersCSV
}) {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderCountryFilter, setOrderCountryFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(25);

  const countryScopedOrders = useMemo(() => {
    return orders.filter(o => {
      const oCountryId = Number(o.country_id);
      const oCountryCode = (o.country_code || '').toUpperCase();
      const oCountryName = (o.country_name || '').toLowerCase();
      return (activeCountryObj.id && oCountryId === activeCountryObj.id) ||
             (activeCountryObj.code && oCountryCode === activeCountryObj.code) ||
             (activeCountryObj.name && oCountryName.includes(activeCountryObj.name.toLowerCase()));
    });
  }, [orders, activeCountryObj]);

  const totalRevenue = useMemo(() => {
    return countryScopedOrders.reduce((sum, o) => {
      if (o.status !== 'cancelled') {
        return sum + parseFloat(o.total || 0);
      }
      return sum;
    }, 0);
  }, [countryScopedOrders]);

  const filteredOrders = useMemo(() => {
    return countryScopedOrders.filter(o => {
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
  }, [countryScopedOrders, orderSearch, orderStatusFilter, orderCountryFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderPage, orderPageSize]);

  const handleExportCSV = () => {
    if (externalExportOrdersCSV) {
      externalExportOrdersCSV();
      return;
    }
    downloadCSV(
      filteredOrders.map(o => [
        `#${o.id}`,
        o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '',
        o.user_name || '—',
        o.country_name || activeCountryObj.name || 'Global',
        `$${o.total}`,
        statusLabel(o.status),
      ]),
      ['ID Orden', 'Fecha', 'Cliente', 'País', 'Total', 'Estado'],
      `ordenes_${activeCountryObj.code || 'ecommerce'}.csv`
    );
  };

  return (
    <section className="board-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#071524', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrandingVectorIcon name="ticket" size={20} color="#0FA4DE" />
            <span>Gestión de Órdenes y Cotizaciones B2B</span>
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
            Supervisa los pedidos generados en el Shop, gestiona el estado logístico y revisa los tickets sincronizados con Operaciones CRM.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
            className="nav-btn"
            style={{
              background: '#ffffff',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <BrandingVectorIcon name="download" size={14} color="#0FA4DE" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Country Scope Notice for Orders (Aislamiento Total) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(15, 164, 222, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
        border: '1px solid rgba(15, 164, 222, 0.25)',
        padding: '10px 16px',
        borderRadius: '10px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{activeCountryObj.flag || '🇦🇷'}</span>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
            Órdenes radicadas en {activeCountryObj.name} ({activeCountryObj.code})
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            — Mostrando métricas y facturación exclusiva para {activeCountryObj.name} ({countryScopedOrders.length} pedidos)
          </span>
        </div>
      </div>

      {/* Quick KPI Chips for Orders - Compact High-Density */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Órdenes</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#071524', marginTop: '1px' }}>{countryScopedOrders.length}</div>
        </div>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Facturado</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A', marginTop: '1px' }}>
            ${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USD
          </div>
        </div>
        <div style={{ background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '10px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10.5px', color: '#854D0E', fontWeight: '700', textTransform: 'uppercase' }}>En Preparación</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#CA8A04', marginTop: '1px' }}>
            {countryScopedOrders.filter(o => o.status === 'procesando' || o.status === 'pending').length}
          </div>
        </div>
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10.5px', color: '#075985', fontWeight: '700', textTransform: 'uppercase' }}>En Despacho / Camino</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7', marginTop: '1px' }}>
            {countryScopedOrders.filter(o => o.status === 'en_camino' || o.status === 'shipped').length}
          </div>
        </div>
        <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10.5px', color: '#6B21A8', fontWeight: '700', textTransform: 'uppercase' }}>Entregadas</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#9333EA', marginTop: '1px' }}>
            {countryScopedOrders.filter(o => o.status === 'entregado' || o.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar por ID, cliente, empresa, CUIT, tracking, OC..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '7px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#ffffff' }}
          >
            <option value="all">Todos los Estados</option>
            <option value="procesando">En Preparación (Procesando)</option>
            <option value="en_camino">En Despacho / Camino</option>
            <option value="entregado">Entregado</option>
            <option value="paid">Pagado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={orderCountryFilter}
            onChange={(e) => setOrderCountryFilter(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#ffffff' }}
          >
            <option value="all">Todos los Países</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {(orderSearch || orderStatusFilter !== 'all' || orderCountryFilter !== 'all') && (
            <button
              onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); setOrderCountryFilter('all'); }}
              style={{ background: '#E2E8F0', border: 'none', padding: '7px 10px', borderRadius: '7px', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Orders Table - Compact High Density */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <BrandingVectorIcon name="box" size={32} color="#94A3B8" />
          </div>
          <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: '14px' }}>No se encontraron órdenes</h3>
          <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>
            Intenta ajustar los criterios de búsqueda o filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', width: '120px' }}>N° Orden / Fecha</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '180px' }}>Cliente & Empresa</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '180px' }}>Destino & Logística</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '160px' }}>Pago / PO</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', width: '130px' }}>Total USD</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', width: '140px' }}>Estado</th>
                  <th style={{ padding: '8px 12px', fontWeight: '750', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center', width: '80px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(ord => (
                  <tr
                    key={ord.id}
                    onClick={() => onViewOrder && onViewOrder(ord)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      height: '40px',
                      transition: 'background 0.15s ease'
                    }}
                    title="Click para ver detalle completo de la orden, remitos y seguimiento"
                  >
                    {/* 1. N° Orden & Fecha */}
                    <td style={{ padding: '4px 10px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span style={{ fontWeight: '800', color: '#0FA4DE', fontSize: '12px' }}>#{ord.id}</span>
                      <span style={{ color: '#94A3B8', fontSize: '10.5px', marginLeft: '6px' }}>
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-AR') : '—'}
                      </span>
                    </td>

                    {/* 2. Cliente & Empresa */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '240px' }}>
                      <div
                        style={{ fontWeight: '700', color: '#0F172A', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={`${ord.user_company || ord.user_name || 'Cliente B2B'} (${ord.user_email || ''})`}
                      >
                        <span>{ord.user_company || ord.user_name || 'Cliente B2B'}</span>
                        {ord.user_email && <span style={{ color: '#64748B', fontWeight: '400', fontSize: '11px', marginLeft: '5px' }}>• {ord.user_email}</span>}
                      </div>
                    </td>

                    {/* 3. Destino & Logística */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '240px' }}>
                      <div
                        style={{ fontWeight: '600', color: '#334155', fontSize: '11.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={`${ord.country_name || activeCountryObj.name} • ${ord.tracking_number ? `Guía: ${ord.tracking_number}` : (ord.shipping_method || 'Despacho interno')}`}
                      >
                        <span>📍 {ord.country_name || activeCountryObj.name}</span>
                        <span style={{ color: '#94A3B8', margin: '0 4px' }}>•</span>
                        <span style={{ color: '#0369A1', fontFamily: ord.tracking_number ? 'monospace' : 'inherit', fontSize: '10.5px' }}>
                          {ord.tracking_number ? `Guía: ${ord.tracking_number}` : (ord.shipping_method || 'Despacho interno')}
                        </span>
                      </div>
                    </td>

                    {/* 4. Condición / PO */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', maxWidth: '190px' }}>
                      <div
                        style={{ fontSize: '11.5px', color: '#334155', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={`${ord.payment_method || 'Cuenta Corriente'} ${ord.po_number ? `• OC: ${ord.po_number}` : ''}`}
                      >
                        <span>{ord.payment_method || 'Cuenta Corriente'}</span>
                        {ord.po_number && (
                          <span style={{ color: '#0FA4DE', fontWeight: '700', fontSize: '10.5px', marginLeft: '5px' }}>
                            (OC: {ord.po_number})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Total USD */}
                    <td style={{ padding: '4px 10px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span style={{ fontWeight: '800', color: '#071524', fontSize: '12px' }}>
                        ${parseFloat(ord.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </td>

                    {/* 6. Estado */}
                    <td style={{ padding: '4px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ord.status || 'procesando'}
                        onChange={(e) => handleUpdateOrderStatus && handleUpdateOrderStatus(ord.id, e.target.value)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'block',
                          width: '100%',
                          boxSizing: 'border-box',
                          ...statusStyle(ord.status)
                        }}
                      >
                        <option value="procesando">En Preparación</option>
                        <option value="en_camino">En Despacho</option>
                        <option value="entregado">Entregado</option>
                        <option value="paid">Pagado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>

                    {/* 7. Acciones */}
                    <td style={{ padding: '4px 10px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onViewOrder && onViewOrder(ord)}
                        style={{
                          background: '#0FA4DE',
                          color: '#ffffff',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 1px 3px rgba(15, 164, 222, 0.2)'
                        }}
                      >
                        <BrandingVectorIcon name="eye" size={11} color="#ffffff" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN DE ÓRDENES */}
          <PaginationBar
            currentPage={orderPage}
            totalItems={filteredOrders.length}
            pageSize={orderPageSize}
            onPageChange={setOrderPage}
            onPageSizeChange={setOrderPageSize}
            pageSizeOptions={[15, 25, 50, 100]}
          />
        </>
      )}
    </section>
  );
}
