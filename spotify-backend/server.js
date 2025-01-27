// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Debug logs
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// 1. /login -> redirect to Spotify
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-top-read';
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope,
    code_challenge_method: 'S256',
    code_challenge: req.query.code_challenge,
  })}`;
  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
});

// 2. Spotify redirects to /callback (GET)
app.get('/callback', (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }
  console.log('Authorization code in GET /callback:', code);

  // Redirect to frontend with code
  res.redirect(`http://localhost:3000/?code=${code}`);
});

// 3. Exchange code -> tokens (POST /callback)
app.post('/callback', async (req, res) => {
  const { code, code_verifier } = req.body;
  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
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
    console.error('Error exchanging code:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

// 4. /api/top-tracks?time_range=xxx
app.get('/api/top-tracks', async (req, res) => {
  const accessToken = req.query.access_token;
  const timeRange = req.query.time_range || 'medium_term';

  if (!accessToken) {
    return res.status(401).json({ error: 'Access Token Required' });
  }

  console.log(`Fetching top tracks with time_range=${timeRange}`);

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=20`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top tracks:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// 5. /api/me -> user profile
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
