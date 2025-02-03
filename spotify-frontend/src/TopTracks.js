import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

function TopTracks() {

  const [timeRange, setTimeRange] = useState('short_term');
  const [tracks, setTracks] = useState([]);
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    if (!accessToken) return;

    console.log(`Fetching top tracks for: ${timeRange}`);

    async function fetchTopTracks() {
      try {
        const response = await fetch(
          `http://localhost:8080/api/top-tracks?access_token=${accessToken}&time_range=${timeRange}`
        );
        const data = await response.json();
        console.log('Fetched data:', data);
        setTracks(data.items || []);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    }

    fetchTopTracks();
  }, [accessToken, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '20px auto 40px auto',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <h1
          style={{
            fontSize: '24px',
            margin: 0,
            fontWeight: 'normal',
            marginRight: '1rem',
          }}
        >
          Your Top Tracks
        </h1>

        <select value={timeRange} onChange={handleTimeRangeChange}>
          <option value="short_term">Last 4 Weeks</option>
          <option value="medium_term">Last 6 Months</option>
          <option value="long_term">All Time</option>
        </select>
      </div>

      {tracks.length === 0 ? (
        <p>Loading or no tracks found...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tracks.map((track) => {
            const truncatedName = track.name.split(' ').slice(0, 3).join(' ');
            const artistNames = track.artists.map((artist) => artist.name).join(', ');
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
      )}
    </div>
  );
}

export default TopTracks;
