// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);

  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((value) => possible[value % possible.length])
      .join('');
  };

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
      if (accessToken) return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const storedCodeVerifier = localStorage.getItem('code_verifier');

      if (code && storedCodeVerifier) {
        try {
          const response = await fetch('http://localhost:8080/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, code_verifier: storedCodeVerifier }),
          });
          const data = await response.json();
          if (data.access_token) {
            setAccessToken(data.access_token);
            // remove ?code= from URL
            window.history.replaceState({}, document.title, '/');
          } else {
            console.error('Failed to retrieve access token:', data.error);
          }
        } catch (error) {
          console.error('Error during token exchange:', error);
        }
      } else {
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
