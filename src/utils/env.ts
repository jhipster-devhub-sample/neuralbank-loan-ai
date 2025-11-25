// Helper function to get environment variables from runtime config or build-time env
// In production, reads from window.__ENV__ (generated at container startup)
// In development, reads from import.meta.env (Vite build-time)

declare global {
  interface Window {
    __ENV__?: {
      [key: string]: string;
    };
  }
}

export const getEnvVar = (key: string, defaultValue: string = ""): string => {
  // First try runtime config (window.__ENV__) - for production
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    const value = window.__ENV__[key];
    if (import.meta.env.DEV) {
      console.log(`🔧 Env var ${key} from window.__ENV__:`, value);
    }
    return value;
  }
  
  // Fallback to build-time env (import.meta.env) - for development
  if (import.meta.env[key]) {
    const value = import.meta.env[key] as string;
    if (import.meta.env.DEV) {
      console.log(`🔧 Env var ${key} from import.meta.env:`, value);
    }
    return value;
  }
  
  if (import.meta.env.DEV) {
    console.log(`🔧 Env var ${key} using default:`, defaultValue);
  }
  return defaultValue;
};

