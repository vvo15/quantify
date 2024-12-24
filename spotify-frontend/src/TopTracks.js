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
            console.log('handleAuthFlow triggered.');

            // Get the authorization code from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const storedCodeVerifier = localStorage.getItem('code_verifier');

            console.log('Authorization code from URL:', code);
            console.log('Stored code verifier:', storedCodeVerifier);

            if (code && storedCodeVerifier) {
                // Send the code and code_verifier to the backend
                console.log('Sending code and code_verifier to backend...');
                try {
                    const response = await fetch('http://localhost:8080/callback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, code_verifier: storedCodeVerifier }),
                    });

                    const data = await response.json();
                    console.log('Response from backend:', data);

                    if (data.access_token) {
                        console.log('Access token received:', data.access_token);
                        fetchTopTracks(data.access_token);

                        // Clear query parameters to prevent looping
                        window.history.replaceState({}, document.title, '/');
                    } else {
                        console.error('Failed to retrieve access token:', data.error);
                    }
                } catch (error) {
                    console.error('Error during token exchange:', error);
                }
            } else {
                console.log('No authorization code found. Starting login flow...');

                // Start the login flow
                const codeVerifier = generateRandomString(128);
                localStorage.setItem('code_verifier', codeVerifier);

                try {
                    const codeChallenge = await createCodeChallenge(codeVerifier);
                    console.log('Generated code challenge:', codeChallenge);

                    const authUrl = `http://localhost:8080/login?code_challenge=${codeChallenge}`;
                    console.log('Redirecting to Spotify with URL:', authUrl);
                    window.location.href = authUrl;
                } catch (error) {
                    console.error('Error creating code challenge:', error);
                }
            }
        };

        const fetchTopTracks = async (accessToken) => {
            console.log('Fetching top tracks with access token...');
            try {
                const response = await fetch(`http://localhost:8080/api/top-tracks?access_token=${accessToken}`);
                const data = await response.json();
                console.log('Top tracks fetched:', data);
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
