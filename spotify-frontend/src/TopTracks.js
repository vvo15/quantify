import React, { useEffect, useState } from 'react';

function TopTracks() {
    const [tracks, setTracks] = useState([]);
    const clientId = 'f3b6382942394d78b21785da386038c8'; // Replace with your Spotify client ID
    const redirectUri = 'http://localhost:8080/callback'; // Adjust as needed

    // Generate a random string for code verifier
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], '');
    };

    const codeVerifier = generateRandomString(64);
    localStorage.setItem('code_verifier', codeVerifier);

    const codeChallenge = async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    useEffect(() => {
        const authorizeUser = async () => {
            const challenge = await codeChallenge();
            const authUrl = new URL('https://accounts.spotify.com/authorize');
            authUrl.search = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                redirect_uri: redirectUri,
                scope: 'user-read-private user-top-read',
                code_challenge_method: 'S256',
                code_challenge: challenge,
            }).toString();
            window.location.href = authUrl.toString();
        };

        authorizeUser();
    }, []);

    useEffect(() => {
        const fetchTopTracks = async () => {
            const accessToken = new URLSearchParams(window.location.hash).get('access_token');
            if (!accessToken) {
                console.error('Access token not found');
                return;
            }

            try {
                const response = await fetch('/api/top-tracks', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (!response.ok) {
                    throw new Error(`Error fetching top tracks: ${response.statusText}`);
                }
                const data = await response.json();
                setTracks(data.items || []);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchTopTracks();
    }, []);

    return (
        <div>
            <h1>Your Top Tracks</h1>
            <ul>
                {tracks.map((track) => (
                    <li key={track.id}>
                        {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TopTracks;
