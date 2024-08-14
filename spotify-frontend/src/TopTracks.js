import React, { useState, useEffect } from 'react';

async function TopTracks() {
    const [tracks, setTracks] = useState([]);
   
      //authUrl.search = new URLSearchParams(params).toString();
const clientId = 'f3b6382942394d78b21785da386038c8';
const redirectUri = 'http://localhost:8080';

const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")

// generated in the previous step\
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }
  
  const codeVerifier  = generateRandomString(64);  
  const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }
  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
      
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  {
  response_type: 'code',
  client_id: clientId,
  scope,
  code_challenge_method: 'S256',
  code_challenge: codeChallenge,
  redirect_uri: redirectUri,
}

authUrl.search = new URLSearchParams(params).toString();
window.location.href = authUrl.toString();
const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

const getToken = async code => {

    // stored in the previous step
    let codeVerifier = localStorage.getItem('code_verifier');
  
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
  
    const body = await fetch('https://accounts.spotify.com/api/token', payload);
    const response =await body.json();
  
    localStorage.setItem('access_token', response.access_token);
  }
  
    useEffect(() => {
        async function fetchData() {
            try {
                const access_token = localStorage.getItem('access_token');
                if (!access_token) {
                    console.error('Access token not found');
                    return; // Exit if no access token
                }

                const res = await fetch('https://api.spotify.com/${endpoint}', {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });
                if (!res.ok) {
                    console.error('Error fetching top tracks:', res.status, await res.text());
                    throw new Error(`Failed to fetch top tracks: ${res.status}`);
                }
                const data = await res.json();
                if (data.tracks) {
                    setTracks(data.tracks);
                } else {
                    console.error('No tracks found in response:', data);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }

        fetchData();
    }, []);

    return (
        <ul>
            {tracks.map(track => (
                <li key={track.id}>
                    {track.name} by {track.artists ? track.artists.map(artist => artist.name).join(", ") : 'Unknown Artist'}
                </li>
            ))}
        </ul>
    );
}

export default TopTracks;
