export const getJwtFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
  
  if (jwtCookie) {
    return jwtCookie.split('=')[1];
  }
  
  // Fallback: verificar cookies de Keycloak como indicador de sesión activa
  // Nota: Las cookies de Keycloak (KEYCLOAK_IDENTITY, KEYCLOAK_SESSION) no contienen
  // el access token directamente, pero su presencia indica que hay una sesión activa.
  // isAuthenticated() verificará estas cookies para determinar el estado de autenticación.
  // Aquí retornamos null porque no podemos usar estas cookies como token de API.
  const keycloakIdentity = getKeycloakCookie('KEYCLOAK_IDENTITY');
  const keycloakSession = getKeycloakCookie('KEYCLOAK_SESSION');
  
  // Si hay cookies de Keycloak pero no cookie jwt, la sesión existe pero no tenemos el token
  // Esto puede ocurrir si el usuario está autenticado en Keycloak pero aún no ha completado
  // el intercambio del código por token. En este caso, retornamos null.
  return null;
};

export const getKeycloakCookie = (cookieName: string): string | null => {
  const cookies = document.cookie.split(';');
  const keycloakCookie = cookies.find(cookie => cookie.trim().startsWith(`${cookieName}=`));
  
  if (keycloakCookie) {
    return keycloakCookie.split('=')[1];
  }
  
  return null;
};

export const getAuthHeaders = (): HeadersInit => {
  const jwt = getJwtFromCookie();
  
  if (jwt) {
    return {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

export const isAuthenticated = (): boolean => {
  // Primero verificar si hay cookie JWT (access token)
  const jwt = getJwtFromCookie();
  if (jwt) {
    return true;
  }
  
  // Si no hay JWT, verificar cookies de Keycloak como indicador de sesión
  const keycloakIdentity = getKeycloakCookie('KEYCLOAK_IDENTITY');
  const keycloakSession = getKeycloakCookie('KEYCLOAK_SESSION');
  
  // Si hay alguna cookie de Keycloak, consideramos que hay sesión activa
  return keycloakIdentity !== null || keycloakSession !== null;
};

export const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getUserInfo = (): { name?: string; given_name?: string; family_name?: string; email?: string; preferred_username?: string } | null => {
  // Intentar obtener información del JWT (access token)
  const jwt = getJwtFromCookie();
  if (jwt) {
    const decoded = decodeJwt(jwt);
    if (decoded) {
      return {
        name: decoded.name,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        email: decoded.email,
        preferred_username: decoded.preferred_username,
      };
    }
  }
  
  // Si no hay JWT, intentar obtener de KEYCLOAK_IDENTITY
  const keycloakIdentity = getKeycloakCookie('KEYCLOAK_IDENTITY');
  if (keycloakIdentity) {
    const decoded = decodeJwt(keycloakIdentity);
    if (decoded) {
      return {
        name: decoded.name,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        email: decoded.email,
        preferred_username: decoded.preferred_username,
      };
    }
  }
  
  return null;
};

export const getUserDisplayName = (): string => {
  const userInfo = getUserInfo();
  if (!userInfo) {
    return 'Usuario';
  }
  
  // Intentar usar name completo
  if (userInfo.name) {
    return userInfo.name;
  }
  
  // Si no, combinar given_name y family_name
  if (userInfo.given_name || userInfo.family_name) {
    return [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ');
  }
  
  // Si no, usar preferred_username o email
  if (userInfo.preferred_username) {
    return userInfo.preferred_username;
  }
  
  if (userInfo.email) {
    return userInfo.email.split('@')[0];
  }
  
  return 'Usuario';
};

export const logout = (): void => {
  // Limpiar la cookie JWT
  document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Limpiar cookies de Keycloak (si están accesibles)
  const keycloakCookies = [
    'KEYCLOAK_IDENTITY',
    'KEYCLOAK_SESSION',
    'AUTH_SESSION_ID',
    'KC_AUTH_SESSION_HASH',
    'KC_RESTART',
  ];
  
  keycloakCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // También intentar limpiar con diferentes paths comunes
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });
  
  // Redirigir al logout de Keycloak usando la función del config
  // Usar import dinámico para evitar dependencia circular
  import('@/config/keycloak').then(({ getLogoutUrl }) => {
    window.location.href = getLogoutUrl();
  });
};
