'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const signOut = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_refresh_token');
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('google_refresh_token');
    if (!storedRefreshToken) {
      signOut();
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newExpiryTime = Date.now() + (data.expires_in * 1000);
      
      setAccessToken(data.access_token);
      localStorage.setItem('google_access_token', data.access_token);
      localStorage.setItem('google_token_expiry', newExpiryTime.toString());
      
      // Schedule next refresh 5 minutes before expiry
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      const refreshIn = Math.max(0, data.expires_in - 300) * 1000;
      refreshTimeoutRef.current = setTimeout(refreshToken, refreshIn);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      signOut();
    }
  }, [signOut]);

  const signIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:3001/auth/callback';
    const scope = 'https://www.googleapis.com/auth/calendar.readonly';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  const handleAuthCallback = (token: TokenResponse) => {
    setAccessToken(token.access_token);
    const expiryTime = Date.now() + (token.expires_in * 1000);
    localStorage.setItem('google_access_token', token.access_token);
    localStorage.setItem('google_token_expiry', expiryTime.toString());
    
    // Store refresh token if provided
    if (token.refresh_token) {
      localStorage.setItem('google_refresh_token', token.refresh_token);
    }
    
    // Schedule token refresh directly
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    const refreshIn = Math.max(0, token.expires_in - 300) * 1000;
    refreshTimeoutRef.current = setTimeout(refreshToken, refreshIn);
  };

  useEffect(() => {
    // Check for stored token on mount
    const stored = localStorage.getItem('google_access_token');
    const storedExpiry = localStorage.getItem('google_token_expiry');
    
    if (stored && storedExpiry) {
      const expiryTime = parseInt(storedExpiry);
      if (Date.now() < expiryTime) {
        // Use setTimeout to avoid synchronous setState during render
        setTimeout(() => setAccessToken(stored), 0);
        
        // Schedule refresh if we have a refresh token
        const storedRefreshToken = localStorage.getItem('google_refresh_token');
        if (storedRefreshToken) {
          const timeUntilExpiry = (expiryTime - Date.now()) / 1000;
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          const refreshIn = Math.max(0, timeUntilExpiry - 300) * 1000;
          refreshTimeoutRef.current = setTimeout(refreshToken, refreshIn);
        }
      } else {
        // Token expired, clear it
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
        localStorage.removeItem('google_refresh_token');
      }
    }
    setTimeout(() => setIsLoading(false), 0);
  }, [refreshToken]);

  return {
    accessToken,
    isLoading,
    signIn,
    signOut,
    handleAuthCallback
  };
}
