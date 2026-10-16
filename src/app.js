// Express application setup (routes and middleware get added here)
const express = require('express');

const app = express();

// Parse JSON request bodies (limit size to block huge payloads)
app.use(express.json({ limit: '10kb' }));

// Temporary root route to confirm the server works
app.get('/', (req, res) => {
  res.status(200).json({ message: 'COMP 3123 Assignment 1 API is running' });
});

module.exports = app;