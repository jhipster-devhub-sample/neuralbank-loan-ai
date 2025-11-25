#!/bin/bash

# Script to generate config.js from environment variables at runtime
# This script runs when the container starts
# If config.js is mounted from ConfigMap, it will not be regenerated

CONFIG_FILE="/var/www/html/config.js"

# Check if config.js is already mounted (from ConfigMap)
if [ -f "$CONFIG_FILE" ] && [ ! -w "$CONFIG_FILE" ]; then
    echo "Config file $CONFIG_FILE is mounted from ConfigMap, skipping generation"
    # Execute the original command (httpd)
    exec "$@"
fi

# Function to escape single quotes and backslashes for JavaScript strings
escape_js() {
    echo "$1" | sed "s/\\\/\\\\\\\/g" | sed "s/'/\\\'/g" | sed "s/\"/\\\"/g"
}

# Get environment variables with defaults
KEYCLOAK_ISSUER_URL="${VITE_KEYCLOAK_ISSUER_URL:-}"
KEYCLOAK_CLIENT_ID="${VITE_KEYCLOAK_CLIENT_ID:-}"
KEYCLOAK_CLIENT_SECRET="${VITE_KEYCLOAK_CLIENT_SECRET:-}"
KEYCLOAK_AUTH_ENDPOINT="${VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT:-}"
KEYCLOAK_REDIRECT_URI="${VITE_KEYCLOAK_REDIRECT_URI:-}"
KEYCLOAK_TOKEN_ENDPOINT="${VITE_KEYCLOAK_TOKEN_ENDPOINT:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"

# Escape values for JavaScript
KEYCLOAK_ISSUER_URL_ESC=$(escape_js "$KEYCLOAK_ISSUER_URL")
KEYCLOAK_CLIENT_ID_ESC=$(escape_js "$KEYCLOAK_CLIENT_ID")
KEYCLOAK_CLIENT_SECRET_ESC=$(escape_js "$KEYCLOAK_CLIENT_SECRET")
KEYCLOAK_AUTH_ENDPOINT_ESC=$(escape_js "$KEYCLOAK_AUTH_ENDPOINT")
KEYCLOAK_REDIRECT_URI_ESC=$(escape_js "$KEYCLOAK_REDIRECT_URI")
KEYCLOAK_TOKEN_ENDPOINT_ESC=$(escape_js "$KEYCLOAK_TOKEN_ENDPOINT")
API_BASE_URL_ESC=$(escape_js "$API_BASE_URL")

# Generate config.js file only if not mounted from ConfigMap
cat > "$CONFIG_FILE" <<EOF
// Runtime configuration - Generated at container startup
// Path: $CONFIG_FILE
// Note: This file can be mounted from a ConfigMap instead
window.__ENV__ = {
  VITE_KEYCLOAK_ISSUER_URL: '$KEYCLOAK_ISSUER_URL_ESC',
  VITE_KEYCLOAK_CLIENT_ID: '$KEYCLOAK_CLIENT_ID_ESC',
  VITE_KEYCLOAK_CLIENT_SECRET: '$KEYCLOAK_CLIENT_SECRET_ESC',
  VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT: '$KEYCLOAK_AUTH_ENDPOINT_ESC',
  VITE_KEYCLOAK_REDIRECT_URI: '$KEYCLOAK_REDIRECT_URI_ESC',
  VITE_KEYCLOAK_TOKEN_ENDPOINT: '$KEYCLOAK_TOKEN_ENDPOINT_ESC',
  VITE_API_BASE_URL: '$API_BASE_URL_ESC',
};
EOF

# Ensure correct permissions
chmod 644 "$CONFIG_FILE"
chown 1001:0 "$CONFIG_FILE"

echo "Configuration file generated at $CONFIG_FILE"
echo "Keycloak Client ID: ${KEYCLOAK_CLIENT_ID:-<not set>}"
echo "Keycloak Issuer URL: ${KEYCLOAK_ISSUER_URL:-<not set>}"

# Execute the original command (httpd)
exec "$@"

