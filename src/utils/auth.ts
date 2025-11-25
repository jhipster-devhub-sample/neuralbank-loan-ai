export const getJwtFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
  
  if (jwtCookie) {
    return jwtCookie.split('=')[1];
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
  return getJwtFromCookie() !== null;
};

export const logout = (): void => {
  // Limpiar la cookie JWT
  document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirigir al logout de Keycloak
  const logoutEndpoint = 'https://rhbk.apps.cluster-lv5jx.lv5jx.sandbox2484.opentlc.com/realms/neuralbank/protocol/openid-connect/logout';
  const params = new URLSearchParams({
    client_id: 'neuralbank',
    post_logout_redirect_uri: window.location.origin,
  });
  
  window.location.href = `${logoutEndpoint}?${params.toString()}`;
};
