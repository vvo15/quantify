import React from 'react';
import TopTracks from './TopTracks.js';
import logo from './logo.svg';
import './App.css';

function App() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Welcome to My Spotify App</h1>
        </header>
        <TopTracks />
      </div>
    );
}
  
export default App;
