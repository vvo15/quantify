// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create a context so other components can consume the access token
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);

  // Utility to generate random string for PKCE code verifier
  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((value) => possible[value % possible.length])
      .join('');
  };

  // Utility to generate code challenge from code verifier
  const createCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  useEffect(() => {
    const handleAuthFlow = async () => {
      // If we already have an access token, do nothing
      if (accessToken) return;

      // Check if there's a code in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const storedCodeVerifier = localStorage.getItem('code_verifier');

      if (code && storedCodeVerifier) {
        // We have an authorization code; exchange it for an access token
        try {
          const response = await fetch('http://localhost:8080/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, code_verifier: storedCodeVerifier }),
          });
          const data = await response.json();

          if (data.access_token) {
            setAccessToken(data.access_token);

            // Remove the query params from the URL (avoid re-triggering the flow)
            window.history.replaceState({}, document.title, '/');
          } else {
            console.error('Failed to retrieve access token:', data.error);
          }
        } catch (error) {
          console.error('Error during token exchange:', error);
        }
      } else {
        // No code in URL — start the OAuth flow by redirecting to Spotify
        const codeVerifier = generateRandomString(128);
        localStorage.setItem('code_verifier', codeVerifier);

        try {
          const codeChallenge = await createCodeChallenge(codeVerifier);
          const authUrl = `http://localhost:8080/login?code_challenge=${codeChallenge}`;
          window.location.href = authUrl;
        } catch (error) {
          console.error('Error creating code challenge:', error);
        }
      }
    };

    handleAuthFlow();
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
