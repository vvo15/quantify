const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;


// Use CORS before all route definitions
app.use(cors()); // This allows all domains to access your API. Be more specific in a production environment.

// Example of a route
app.get('/api/top-tracks', (req, res) => {
    // Simulated data
    const tracks = [
        { id: 1, name: "Song 1", artists: ["Artist 1"] },
        { id: 2, name: "Song 2", artists: ["Artist 2"] }
    ];
    res.json({ tracks });
});

// Serve static files from the React app in production
app.use(express.static('../spotify-frontend/build'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
