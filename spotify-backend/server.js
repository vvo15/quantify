const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 8080;

// CORS setup to allow all domains (adjust in production)
app.use(cors());

// Serve static files from the React app's build directory
const buildPath = path.join(__dirname, '../spotify-frontend/build');
app.use(express.static(buildPath));

// Redirect user for authentication with Spotify
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-top-read';
    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI
    })}`);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI
            }),
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Redirecting to the frontend with tokens
        res.redirect(`/#${querystring.stringify({ access_token: accessToken, refresh_token: refreshToken })}`);
    } catch (error) {
        console.error('Failed to retrieve access token', error);
        res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
    }
});

// Use the access token to access the Spotify Web API for top tracks
app.get('https://api.spotify.com/v1/me/top/tracks', async (req, res) => {
    const accessToken = req.query.access_token;
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Failed to fetch top tracks:', error);
        res.status(500).send(error.message);
    }
});

// Fallback to serve the React app's index.html for any other requests
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    res.sendFile(indexPath, function (err) {
        if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send(err.message);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(error.response || error.message);
});
