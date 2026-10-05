// Configuración centralizada de API URL
// Si se accede por HTTPS (producción o SSL autofirmado), se usa URL relativa '' para que Nginx haga proxy a /api/
// Si se accede por HTTP en desarrollo (ej: localhost:5173), se conecta directamente al puerto 3001.

export const API_BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:'
  ? ''
  : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

export default API_BASE_URL;
