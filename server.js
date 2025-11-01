const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Jokes routes
app.use('/jokebook', require('./jokes'));

// Simple categories route
app.get('/jokebook/categories', (req, res) => {
    res.json(['funnyJoke', 'lameJoke']);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});