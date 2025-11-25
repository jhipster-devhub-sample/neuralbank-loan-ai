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
  document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`;
};
