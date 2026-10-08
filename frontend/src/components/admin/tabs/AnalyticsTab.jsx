import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { PIE_COLORS } from '../adminHelpers';

export default function AnalyticsTab({
  totalRevenue = 0,
  totalOrders = 0,
  paidOrders = 0,
  pendingOrders = 0,
  cancelledOrders = 0,
  conversionRate = 0,
  avgOrderValue = 0,
  products = [],
  lowStockProducts = 0,
  revenueByDay = [],
  salesByCountry = [],
  ordersByStatus = [],
  productRevenue = [],
  activeCountryObj = { code: 'AR', name: 'Argentina' }
}) {
  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        {[
          { value: `$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, label: 'Ingresos Totales', color: '#10b981' },
          { value: totalOrders, label: 'Órdenes Totales', color: '#06b6d4' },
          { value: paidOrders, label: 'Órdenes Pagadas', color: '#10b981' },
          { value: pendingOrders, label: 'Órdenes Pendientes', color: '#f59e0b' },
          { value: cancelledOrders, label: 'Canceladas', color: '#ef4444' },
          { value: `${conversionRate}%`, label: 'Tasa de Conversión', color: '#0f766e' },
          { value: `$${avgOrderValue}`, label: 'Ticket Promedio', color: '#0284c7' },
          { value: products.length, label: 'Productos Activos', color: '#6366f1' },
          { value: lowStockProducts, label: 'Productos Stock Bajo', color: lowStockProducts > 0 ? '#ef4444' : '#10b981' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ borderLeftColor: kpi.color }}>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">

        {/* Revenue by day */}
        <div className="report-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📈 Ingresos Últimos 7 Días</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v}`, 'Ingresos']} />
              <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fill="url(#colorIngresos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Country */}
        <div className="report-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🌍 Ingresos por País</h3>
          {salesByCountry.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Sin datos suficientes</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesByCountry} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {salesByCountry.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Ventas']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status pie */}
        <div className="report-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🥧 Distribución de Órdenes</h3>
          {ordersByStatus.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Sin datos suficientes</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders per day (bar) */}
        <div className="report-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>📦 Órdenes por Día</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Órdenes']} />
              <Bar dataKey="ordenes" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products price/stock */}
        <div className="report-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>🛍️ Stock vs Precio por Producto</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" name="Stock" fill="#4cc9f0" radius={[6, 6, 0, 0]} />
              <Bar dataKey="precio" name="Precio ($)" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tabla alertas stock bajo ── */}
      {lowStockProducts > 0 && (
        <div className="report-card" style={{ borderLeft: '4px solid #ef4444', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>⚠️ Alertas de Stock Bajo (≤15 unidades)</h3>
          <table className="users-table">
            <thead>
              <tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock Local ({activeCountryObj.code})</th></tr>
            </thead>
            <tbody>
              {products.filter(p => p.stock <= 15).map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>${p.price}</td>
                  <td><span style={{ fontWeight: 700, color: '#dc2626' }}>{p.stock} unidades</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
