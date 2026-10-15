/**
 * ecommerceApiClient.js
 * Cliente inter-servicios para consumir la API de E-Commerce & ERP desde el CRM.
 * Configuración obligatoria por variables de entorno: ECOMMERCE_API_URL, INTERNAL_SERVICE_KEY.
 */
const ECOMMERCE_API_URL = process.env.ECOMMERCE_API_URL;
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

if (!ECOMMERCE_API_URL || !INTERNAL_SERVICE_KEY) {
  throw new Error('FATAL: ECOMMERCE_API_URL e INTERNAL_SERVICE_KEY deben estar definidos en el .env del servicio CRM.');
}

const REQUEST_TIMEOUT_MS = 5000;

async function fetchEcommerce(endpoint, options = {}) {
  const url = `${ECOMMERCE_API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-service-key': INTERNAL_SERVICE_KEY,
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Error ${res.status} al consultar E-commerce`);
  }
  return data;
}

/**
 * Consultar las compras y órdenes asociadas al email de un cliente
 */
async function obtenerComprasCliente(email) {
  return await fetchEcommerce(`/api/internal/orders/by-customer?email=${encodeURIComponent(email)}`);
}

/**
 * Validar si un número de serie o SKU tiene garantía en el catálogo DACAS
 */
async function verificarGarantiaProducto(sku, serial) {
  const params = new URLSearchParams();
  if (sku) params.set('sku', sku);
  if (serial) params.set('serial', serial);
  return await fetchEcommerce(`/api/internal/products/verify-serial?${params.toString()}`);
}

module.exports = {
  obtenerComprasCliente,
  verificarGarantiaProducto
};
