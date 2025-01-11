import React from 'react';
import TopTracks from './TopTracks.js';  // Adjust this path if needed
import logo from './download.png';            // Assuming logo.svg is correctly placed in your src folder
import './App.css';
import ProfileDetails from './ProfileDetails.js';

function App() {
    return (
      <div className="App">

      <h1 
        style={{
          fontSize: '22px', 
          textAlign: 'left', 
          display: 'flex',
          alignItems: 'center', 
          gap: '8px',
          marginLeft: '230px'
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
        <ProfileDetails/>
        <header className="App-header">
          <h2>Track all of your listening statistics in one place.</h2>
        </header>
        <TopTracks />
      </div>
    );
}
  
export default App;