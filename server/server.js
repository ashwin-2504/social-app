// Import the express module
const express = require('express');

// Create an instance of express
const app = express();

// Define the port number the server will listen on
const port = 5000;

// Define a route for the root URL that sends a response
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});