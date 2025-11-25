export const KEYCLOAK_CONFIG = {
  issuerURL: "https://rhbk.apps.cluster-lv5jx.lv5jx.sandbox2484.opentlc.com/realms/neuralbank",
  clientID: "neuralbank",
  authorizationEndpoint: "https://rhbk.apps.cluster-lv5jx.lv5jx.sandbox2484.opentlc.com/realms/neuralbank/protocol/openid-connect/auth",
  redirectURI: "https://neuralbank.apps.cluster-lv5jx.lv5jx.sandbox2484.opentlc.com/auth/callback",
  tokenEndpoint: "https://rhbk.apps.cluster-lv5jx.lv5jx.sandbox2484.opentlc.com/realms/neuralbank/protocol/openid-connect/token",
};

export const getAuthorizationUrl = (state?: string): string => {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.clientID,
    redirect_uri: KEYCLOAK_CONFIG.redirectURI,
    response_type: 'code',
    scope: 'openid profile email',
    ...(state && { state }),
  });

  return `${KEYCLOAK_CONFIG.authorizationEndpoint}?${params.toString()}`;
};

export const getLogoutUrl = (): string => {
  const logoutEndpoint = KEYCLOAK_CONFIG.issuerURL + '/protocol/openid-connect/logout';
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CONFIG.clientID,
    post_logout_redirect_uri: window.location.origin,
  });

  return `${logoutEndpoint}?${params.toString()}`;
};
