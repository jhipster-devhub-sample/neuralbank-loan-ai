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
