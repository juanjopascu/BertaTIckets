// Global API Fetch Interceptor for Security and Session Management
const originalFetch = window.fetch;

window.fetch = async function(resource, init = {}) {
  const options = { ...init };
  const headers = new Headers(options.headers || {});

  try {
    const savedUser = localStorage.getItem('usuario');
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    // Attach CRM active session ID
    if (user && user.sesionId) {
      if (!headers.has('x-session-id')) {
        headers.set('x-session-id', user.sesionId);
      }
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${user.sesionId}`);
      }
    } else {
      // Attach E-commerce client / admin JWT if present
      const authToken = 
        localStorage.getItem('dacas_client_token') ||
        localStorage.getItem('shop_token') ||
        localStorage.getItem('dacas_admin_token') ||
        localStorage.getItem('ecommerce_token') ||
        localStorage.getItem('crm_token') ||
        localStorage.getItem('token') ||
        (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('token') || sessionStorage.getItem('sessionId')) : null);

      if (authToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
    }
  } catch (e) {
    console.warn('[Security Interceptor] Error parsing auth context:', e);
  }

  options.headers = headers;
  return originalFetch(resource, options);
};

export default {};
