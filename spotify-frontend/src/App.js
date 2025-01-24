import React from 'react';
import { AuthProvider } from './AuthContext';
import TopTracks from './TopTracks';
import logo from './download.png';
import './App.css';
import ProfileDetails from './ProfileDetails';

function App() {
  return (
    <AuthProvider>
      <div
        className="App"
        style={{
          // Use Spotify-like font
          fontFamily: 'Circular, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Header / Logo and Title (restored to previous left-aligned position) */}
        <h1
          style={{
            fontSize: '22px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '230px',
            marginTop: '20px',
            marginBottom: '10px',
          }}
        >
          <img
            src={logo}
            className="App-logo"
            width="50"
            height="50"
            alt="logo"
          />
          Quantify
        </h1>

        {/* Profile Details (centered within its own container) */}
        <ProfileDetails />

        {/* Subheader / Tagline 
            - Removed extra margin so it appears closer to the profile details
        */}
        <header
          className="App-header"
          style={{
            marginTop: '0px', // Eliminate gap between ProfileDetails & tagline
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 'normal',
            }}
          >
            Track all of your listening statistics in one place.
          </h2>
        </header>

        {/* Top Tracks (centered in its container) */}
        <TopTracks />
      </div>
    </AuthProvider>
  );
}

export default App;
