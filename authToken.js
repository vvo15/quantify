//cleanify, rank top songs, all time, time listened
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Hello World!!!!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' + 
      querystring.stringify({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.REDIRECT_URI,
      }));
});
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
              'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });
      const access_token = response.data.access_token;
      res.redirect('/#' + querystring.stringify({access_token}));
  } catch (error) {
      res.redirect('/#' + querystring.stringify({error: 'invalid_token'}));
  }
});
const getUserTopTracks = async (accessToken) => {
  try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
  } catch (error) {
      console.error('Failed to fetch top tracks:', error);
  }
};