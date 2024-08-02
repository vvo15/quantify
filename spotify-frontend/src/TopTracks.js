import React, { useState, useEffect } from 'react';

function TopTracks() {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/top-tracks'); // Adjust this URL based on your backend configuration
            const data = await res.json();
            setTracks(data.tracks);
        }

        fetchData();
    }, []);

    return (
        <ul>
            {tracks.map(track => (
                <li key={track.id}>{track.name} by {track.artists.join(", ")}</li>
            ))}
        </ul>
    );
}

export default TopTracks;
