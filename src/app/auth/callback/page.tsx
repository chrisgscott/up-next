'use client';

import { useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function AuthCallback() {
  const { handleAuthCallback } = useGoogleAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      window.location.href = '/';
      return;
    }

    if (code) {
      // Exchange authorization code for tokens
      fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Token exchange error:', data.error);
          window.location.href = '/';
          return;
        }
        
        handleAuthCallback({
          access_token: data.access_token,
          expires_in: data.expires_in,
          token_type: data.token_type,
          scope: data.scope,
          refresh_token: data.refresh_token,
        });
        
        // Redirect to main app
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Token exchange error:', error);
        window.location.href = '/';
      });
    }
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
