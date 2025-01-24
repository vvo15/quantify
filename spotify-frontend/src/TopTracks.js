import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

function TopTracks() {
  const { accessToken } = useContext(AuthContext);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (!accessToken) return;

    async function fetchTopTracks() {
      try {
        const response = await fetch(
          `http://localhost:8080/api/top-tracks?access_token=${accessToken}`
        );
        const data = await response.json();
        setTracks(data.items || []);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    }

    fetchTopTracks();
  }, [accessToken]);

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '20px auto 40px auto', // center horizontally
        textAlign: 'left',
      }}
    >
      {/* Larger "Your Top Tracks" */}
      <h1
        style={{
          fontSize: '30px', // Make bigger
          marginBottom: '15px',
          fontWeight: 'normal',
        }}
      >
        Your Top Tracks
      </h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tracks.map((track) => {
          // Show only first 3 words of song name
          const truncatedName = track.name.split(' ').slice(0, 3).join(' ');
          // Combine artist names
          const artistNames = track.artists.map((artist) => artist.name).join(', ');
          // Album art (if available)
          const albumImages = track.album?.images || [];
          const albumArt = albumImages.length > 0 ? albumImages[0].url : null;

          return (
            <li
              key={track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                gap: '10px',
              }}
            >
              {albumArt && (
                <img
                  src={albumArt}
                  alt={track.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              )}
              <span>
                <strong>{truncatedName}</strong> by {artistNames}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TopTracks;
