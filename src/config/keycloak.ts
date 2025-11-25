import { getEnvVar } from '@/utils/env';

// Función para obtener el redirectURI, usando el origin actual si no está configurado
export const getRedirectURI = (): string => {
  const envRedirectURI = getEnvVar('VITE_KEYCLOAK_REDIRECT_URI');
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
  issuerURL: getEnvVar('VITE_KEYCLOAK_ISSUER_URL'),
  clientID: getEnvVar('VITE_KEYCLOAK_CLIENT_ID'),
  clientSecret: getEnvVar('VITE_KEYCLOAK_CLIENT_SECRET'),
  authorizationEndpoint: getEnvVar('VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT'),
  tokenEndpoint: getEnvVar('VITE_KEYCLOAK_TOKEN_ENDPOINT'),
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

// Function to get post-logout redirect URI
const getPostLogoutRedirectURI = (): string => {
  // Check if there's a configured post-logout redirect URI
  const envPostLogoutURI = getEnvVar('VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI');
  if (envPostLogoutURI && envPostLogoutURI.trim() !== '') {
    return envPostLogoutURI.trim();
  }
  
  // Default to current origin, but force http:// for localhost
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If it's localhost, force http://
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const protocol = 'http:';
      const host = window.location.host;
      return `${protocol}//${host}`;
    }
    return origin;
  }
  
  return '';
};

export const getLogoutUrl = (): string => {
  const logoutEndpoint = KEYCLOAK_CONFIG.issuerURL + '/protocol/openid-connect/logout';
  const postLogoutURI = getPostLogoutRedirectURI();
  
  // Log for debugging
  if (import.meta.env.DEV) {
    console.log('🔐 Post-logout redirect URI:', postLogoutURI);
  }
  
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.clientID,
    post_logout_redirect_uri: postLogoutURI,
  });

  const logoutUrl = `${logoutEndpoint}?${params.toString()}`;
  
  if (import.meta.env.DEV) {
    console.log('🔐 Complete logout URL:', logoutUrl);
  }
  
  return logoutUrl;
};

export const exchangeCodeForToken = async (code: string): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> => {
  const redirectURI = getRedirectURI();
  
  // Preparar los parámetros del body
  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    code: code,
    client_id: KEYCLOAK_CONFIG.clientID,
    redirect_uri: redirectURI,
  };
  
  // Si hay client_secret configurado, agregarlo
  // Nota: Para aplicaciones públicas (SPA), normalmente no se requiere client_secret
  // y el cliente debe estar configurado como "public" en Keycloak
  if (KEYCLOAK_CONFIG.clientSecret) {
    bodyParams.client_secret = KEYCLOAK_CONFIG.clientSecret;
  }
  
  // Log para debugging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔐 Exchanging code for token...');
    console.log('🔐 Redirect URI:', redirectURI);
    console.log('🔐 Client ID:', KEYCLOAK_CONFIG.clientID);
    console.log('🔐 Has client secret:', !!KEYCLOAK_CONFIG.clientSecret);
  }
  
  const response = await fetch(KEYCLOAK_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(bodyParams),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to exchange code for token: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage += ` - ${errorJson.error || errorJson.error_description || errorText}`;
      
      if (import.meta.env.DEV) {
        console.error('🔐 Token exchange error:', errorJson);
        console.error('🔐 Full error response:', errorText);
      }
    } catch {
      errorMessage += ` - ${errorText}`;
      if (import.meta.env.DEV) {
        console.error('🔐 Token exchange error (raw):', errorText);
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (import.meta.env.DEV) {
    console.log('🔐 Token exchange successful');
  }
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
};
