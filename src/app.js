// Express application setup
const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies (limit size to block huge payloads)
app.use(express.json({ limit: '10kb' }));

// Log every request to logs/app.log
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'COMP 3123 Assignment 1 API is running' });
});

// Health check
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

// Unknown routes -> 404 (must come AFTER all real routes)
app.use(notFound);

// Central error handler (must be LAST)
app.use(errorHandler);

module.exports = app;