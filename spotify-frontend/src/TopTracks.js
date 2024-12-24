import React, { useEffect, useState } from 'react';

function TopTracks() {
    const [tracks, setTracks] = useState([]);

    // Generate a random string for code verifier
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from(crypto.getRandomValues(new Uint8Array(length)))
            .map((value) => possible[value % possible.length])
            .join('');
    };

    const codeVerifier = generateRandomString(128);
    localStorage.setItem('code_verifier', codeVerifier);

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
            const challenge = await createCodeChallenge(codeVerifier);

            if (!window.location.search.includes('code')) {
                const authUrl = `http://localhost:8080/login?code_challenge=${challenge}`;
                window.location.href = authUrl;
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const storedCodeVerifier = localStorage.getItem('code_verifier');

                if (!code || !storedCodeVerifier) {
                    console.error('Missing code or code_verifier in frontend');
                    return;
                }

                const response = await fetch('http://localhost:8080/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, code_verifier: storedCodeVerifier }),
                });

                const data = await response.json();

                if (data.access_token) {
                    fetchTopTracks(data.access_token);
                } else {
                    console.error('Failed to retrieve access token');
                }
            }
        };

        const fetchTopTracks = async (accessToken) => {
            try {
                const response = await fetch(`http://localhost:8080/api/top-tracks?access_token=${accessToken}`);
                const data = await response.json();
                setTracks(data.items || []);
            } catch (error) {
                console.error('Error fetching top tracks:', error);
            }
        };

        handleAuthFlow();
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