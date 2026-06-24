export const msalConfig = {
  auth: {
    // Reemplaza esto con tu Client ID (Application ID) del portal de Azure
    clientId: "TU_CLIENT_ID_AQUI",
    // Si solo quieres permitir cuentas de tu empresa, usa: "https://login.microsoftonline.com/TU_TENANT_ID"
    // Si quieres permitir cualquier cuenta Microsoft, usa "common"
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173", // A donde redirige después de iniciar sesión
  },
  cache: {
    cacheLocation: "sessionStorage", // Recomendado para evitar problemas si se abren múltiples pestañas
    storeAuthStateInCookie: false, // Setear a true si hay problemas en IE11/Edge antiguos
  }
};

// Scopes que queremos solicitar de Microsoft (Solo necesitamos leer su perfil básico y su email)
export const loginRequest = {
  scopes: ["User.Read", "email", "profile"]
};
