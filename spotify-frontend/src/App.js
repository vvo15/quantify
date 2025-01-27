// App.js
import React from 'react';
import { AuthProvider } from './AuthContext';
import TopTracks from './TopTracks';
import ProfileDetails from './ProfileDetails';
import logo from './download.png';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div
        style={{
          fontFamily: 'Circular, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Logo + Title (left-aligned at marginLeft: 230px) */}
        <h1
          style={{
            fontSize: '22px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '-100px',
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

        {/* Welcome, user */}
        <ProfileDetails />

        {/* Tagline (centered, no extra gap) */}
        <header
          className="App-header"
          style={{
            marginTop: '0px',
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

        {/* Single TopTracks component with a dropdown to toggle time range */}
        <TopTracks />
      </div>
    </AuthProvider>
  );
}

export default App;
