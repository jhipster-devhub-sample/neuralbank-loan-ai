import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '@/config/keycloak';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Error de autenticación: ${errorParam}`);
        setIsLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setError('No se recibió el código de autorización');
        setIsLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Intercambiar código por token
        const tokenData = await exchangeCodeForToken(code);
        
        // Almacenar el access token en una cookie
        const expires = tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toUTCString()
          : new Date(Date.now() + 3600 * 1000).toUTCString(); // Default 1 hora
        
        document.cookie = `jwt=${tokenData.access_token}; expires=${expires}; path=/; SameSite=Lax`;
        
        // Si hay refresh token, también guardarlo
        if (tokenData.refresh_token) {
          document.cookie = `refresh_token=${tokenData.refresh_token}; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; SameSite=Lax`;
        }

        // Redirigir a la página principal
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar la autenticación');
        setIsLoading(false);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Procesando autenticación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

