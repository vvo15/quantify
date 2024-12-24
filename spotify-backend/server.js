const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Allow cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the React app's build directory
const buildPath = path.join(__dirname, '../spotify-frontend/build');
app.use(express.static(buildPath));

// Redirect to Spotify's authorization URL
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: req.query.code_challenge, // Passed from frontend
    })}`;
    res.redirect(authUrl);
});
console.log("print ln 36");

// Handle Spotify callback and exchange code for tokens
app.post('/callback', async (req, res) => {
    const { code, code_verifier } = req.body;

    if (!code || !code_verifier) {
        return res.status(400).send('Missing code or code_verifier.');
    }

    console.log('Exchanging authorization code for tokens...');
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                code_verifier: code_verifier,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                },
            }
        );

        const { access_token, refresh_token } = response.data;

        // Redirect to frontend with tokens
        res.json({ access_token, refresh_token });
        console.log("print ln 70");

    } catch (error) {
        console.error('Error exchanging authorization code:', error.response.data || error.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// API route to fetch top tracks using the access token
app.get('/api/top-tracks', async (req, res) => {
    const accessToken = req.query.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: 'Access Token Required' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        res.json(response.data);
        console.log(res.json(response.data));
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Failed to load application');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});