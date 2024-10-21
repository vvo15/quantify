const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if environment variables are loaded
console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('Redirect URI:', process.env.REDIRECT_URI);

const app = express();
const port = process.env.PORT || 8080;

// CORS setup to allow cross-origin requests (adjust for production if needed)
app.use(cors({ origin: 'http://localhost:8080' }));

// Serve static files from the React app's build directory
const buildPath = path.join(__dirname, '../spotify-frontend/build');
console.log('Serving static files from:', buildPath);
app.use(express.static(buildPath));

// Login route: Redirects user to Spotify for authentication
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
    })}`;
    res.redirect(authUrl);
});

// Callback route: Exchanges authorization code for access and refresh tokens
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    console.log('Authorization Code received:', code);

    if (!code) {
        console.error('Authorization code not found.');
        return res.status(400).json({ error: 'Authorization code missing.' });
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
            }),
            headers: {
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('Tokens received:', response.data);
        const { access_token, refresh_token } = response.data;

        // Redirect to frontend with tokens in the hash fragment
        res.redirect(`/#${querystring.stringify({
            access_token,
            refresh_token,
        })}`);
    } catch (error) {
        console.error('Error retrieving tokens:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Authentication failed',
            details: error.response ? error.response.data : 'No response data',
        });
    }
});

// API route: Fetches the user's top tracks from Spotify
app.get('/api/top-tracks', async (req, res) => {
    const accessToken = req.query.access_token;

    console.log('Access Token:', accessToken);

    if (!accessToken) {
        return res.status(401).json({ error: 'Access Token Required' });
    }

    try {
        const topTracksUrl = 'https://api.spotify.com/v1/me/top/tracks';
        const response = await axios.get(topTracksUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log('Top tracks received:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top tracks:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to fetch top tracks',
            details: error.response ? error.response.data : 'No response data',
        });
    }
});

// Fallback route: Serves the React app's index.html for any unknown route
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
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
console.log("done");