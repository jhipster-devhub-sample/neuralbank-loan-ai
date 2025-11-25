// Función para obtener el redirectURI, usando el origin actual si no está configurado
export const getRedirectURI = (): string => {
  const envRedirectURI = import.meta.env.VITE_KEYCLOAK_REDIRECT_URI;
  if (envRedirectURI && envRedirectURI.trim() !== '') {
    // Asegurarse de que no tenga espacios en blanco
    return envRedirectURI.trim();
  }
  // En desarrollo, usar el origin actual + /auth/callback
  // Forzar http:// para localhost (evitar problemas con SSL)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Si es localhost, forzar http://
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const protocol = 'http:';
      const host = window.location.host;
      return `${protocol}//${host}/auth/callback`;
    }
    return `${origin}/auth/callback`;
  }
  return "";
};

export const KEYCLOAK_CONFIG = {
  issuerURL: import.meta.env.VITE_KEYCLOAK_ISSUER_URL || "",
  clientID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "",
  authorizationEndpoint: import.meta.env.VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT || "",
  tokenEndpoint: import.meta.env.VITE_KEYCLOAK_TOKEN_ENDPOINT || "",
};

export const getAuthorizationUrl = (state?: string): string => {
  const redirectURI = getRedirectURI();
  
  // Log para debugging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔐 Redirect URI being used:', redirectURI);
    console.log('🔐 Full authorization URL will be sent to Keycloak');
  }
  
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.clientID,
    redirect_uri: redirectURI,
    response_type: 'code',
    scope: 'openid profile email',
    ...(state && { state }),
  });

  const authUrl = `${KEYCLOAK_CONFIG.authorizationEndpoint}?${params.toString()}`;
  
  if (import.meta.env.DEV) {
    console.log('🔐 Complete authorization URL:', authUrl);
  }
  
  return authUrl;
};

export const getLogoutUrl = (): string => {
  const logoutEndpoint = KEYCLOAK_CONFIG.issuerURL + '/protocol/openid-connect/logout';
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.clientID,
    post_logout_redirect_uri: window.location.origin,
  });

  return `${logoutEndpoint}?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> => {
  const response = await fetch(KEYCLOAK_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: KEYCLOAK_CONFIG.clientID,
      redirect_uri: getRedirectURI(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
};
