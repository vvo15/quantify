import React from 'react';
import TopTracks from './TopTracks.js';  // Adjust this path if needed
import logo from './download.png';            // Assuming logo.svg is correctly placed in your src folder
import './App.css';

function App() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Quantify</h1>
          <h2>Track all of your listening statistics in one place.</h2>
        </header>
        <TopTracks />
      </div>
    );
}
  
export default App;
