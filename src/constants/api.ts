import { getEnvVar } from '@/utils/env';

const API_BASE_URL_RAW = getEnvVar('VITE_API_BASE_URL', '/api');

// Normalize API_BASE_URL - FORCE relative path to avoid domain duplication
export const API_BASE_URL = (() => {
  const url = API_BASE_URL_RAW.trim();
  
  // Always log the raw value for debugging
  console.log('🔧 VITE_API_BASE_URL raw value:', url);
  
  // If empty, use default
  if (!url) {
    console.warn('⚠️ VITE_API_BASE_URL is empty, using default /api');
    return '/api';
  }
  
  // If it's a full URL, extract just the path or force to relative
  // This prevents domain duplication issues
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.error('❌ ERROR: VITE_API_BASE_URL is configured as absolute URL:', url);
    console.error('❌ This causes domain duplication. Forcing to relative path /api');
    console.error('❌ Please update your ConfigMap to use: VITE_API_BASE_URL: "/api"');
    // Force to relative path to prevent duplication
    return '/api';
  }
  
  // If it's a relative path, ensure it starts with /
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  // Remove trailing slash for consistency
  const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  console.log('✅ API_BASE_URL normalized to:', normalized);
  return normalized;
})();

// Helper function to build API URLs
// endpoint should be like "v1/customers" (without leading /api)
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If API_BASE_URL is absolute, use it directly
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    if (import.meta.env.DEV) {
      console.log('🔗 API URL (absolute):', url);
    }
    return url;
  }
  
  // If API_BASE_URL is relative (e.g., "/api"), combine them
  // API_BASE_URL already includes "/api", so endpoint should be "v1/customers"
  const url = `${API_BASE_URL}/${cleanEndpoint}`;
  if (import.meta.env.DEV) {
    console.log('🔗 API URL (relative):', url, '| API_BASE_URL:', API_BASE_URL, '| endpoint:', cleanEndpoint);
  }
  return url;
};
