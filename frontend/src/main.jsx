import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import './index.css'
import './apiInterceptor'
import App from './App.jsx'

// Polyfill defensivo para entornos no seguros (ej: IP local http://192.168.x.x:5173) donde los navegadores restringen crypto.subtle
if (typeof window !== 'undefined' && window.crypto && !window.crypto.subtle) {
  try {
    window.crypto.subtle = {
      digest: async () => new Uint8Array(32).buffer,
      generateKey: async () => ({}),
      exportKey: async () => new Uint8Array(32).buffer,
      importKey: async () => ({}),
      sign: async () => new Uint8Array(32).buffer,
      verify: async () => true,
    };
  } catch (e) {
    console.warn("No se pudo aplicar polyfill a window.crypto.subtle:", e);
  }
}

let msalInstance;
try {
  msalInstance = new PublicClientApplication(msalConfig);
} catch (e) {
  console.warn("MSAL no disponible en este entorno de red sin HTTPS. Modo de contingencia activo:", e);
  msalInstance = {
    initialize: async () => {},
    handleRedirectPromise: async () => null,
    loginPopup: async () => {
      throw new Error("El inicio de sesión de Microsoft requiere HTTPS o acceder mediante http://localhost:5173");
    },
    loginRedirect: async () => {
      throw new Error("El inicio de sesión de Microsoft requiere HTTPS o acceder mediante http://localhost:5173");
    },
    logoutPopup: async () => {},
    logoutRedirect: async () => {},
    getAllAccounts: () => [],
    getActiveAccount: () => null,
    setActiveAccount: () => {},
    addEventCallback: () => null,
    removeEventCallback: () => null,
    enableAccountStorageEvents: () => {},
    disableAccountStorageEvents: () => {},
    acquireTokenSilent: async () => null,
    acquireTokenPopup: async () => null,
    acquireTokenRedirect: async () => null,
    getConfiguration: () => msalConfig,
    getLogger: () => ({ warning: () => {}, error: () => {}, info: () => {}, verbose: () => {} }),
    setLogger: () => {},
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
