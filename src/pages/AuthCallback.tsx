import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken, getAuthorizationUrl } from '@/config/keycloak';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
        setError(`Authentication error: ${errorParam}`);
        setIsLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setError('Authorization code not received');
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
        let errorMessage = 'Error processing authentication';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // More descriptive messages for common errors
          if (err.message.includes('401')) {
            errorMessage = 'Authentication error: The Keycloak client must be configured as "public" or a client_secret is required. Please verify the Keycloak configuration.';
          } else if (err.message.includes('400')) {
            errorMessage = 'Error: The authorization code is invalid or has expired. Please try logging in again.';
          } else if (err.message.includes('redirect_uri')) {
            errorMessage = 'Error: The redirect_uri does not match. Please verify the Keycloak configuration.';
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
        // Don't redirect automatically on error, let the user see the message
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.href = getAuthorizationUrl()} 
              variant="default"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

