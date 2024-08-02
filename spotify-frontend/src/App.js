import React from 'react';
import TopTracks from './TopTracks.js';  // Adjust this path if needed
import logo from './logo.svg';            // Assuming logo.svg is correctly placed in your src folder
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
