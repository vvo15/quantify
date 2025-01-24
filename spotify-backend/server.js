// server.js (or index.js)
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// 1. Redirect to Spotify's authorization URL
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-top-read';
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI, // e.g. http://localhost:8080/callback
    scope,
    code_challenge_method: 'S256',
    code_challenge: req.query.code_challenge,
  })}`;

  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
});

// 2. Spotify will redirect the user to GET /callback
//    We then forward them on to the frontend with the ?code= param.
app.get('/callback', (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }
  console.log('Authorization code received in GET /callback:', code);

  // Redirect to your frontend with the code in the query params
  res.redirect(`http://localhost:3000/?code=${code}`);
});

// 3. The frontend will POST to /callback to exchange the code for tokens
app.post('/callback', async (req, res) => {
  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    console.error('Missing code or code_verifier');
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }

  console.log('Received authorization code:', code);
  console.log('Code Verifier:', code_verifier);

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI, // Must match your Spotify app settings
        code_verifier,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    console.log('Access Token:', access_token);

    res.json({ access_token, refresh_token });
  } catch (error) {
    console.error('Error exchanging authorization code:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

// 4. Fetch Top Tracks
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
  } catch (error) {
    console.error('Error fetching top tracks:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// 5. Fetch user profile
app.get('/api/me', async (req, res) => {
  const accessToken = req.query.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access Token Required' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
