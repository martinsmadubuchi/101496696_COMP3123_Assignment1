// Health check: tells anyone testing that the API (and database) is working
const mongoose = require('mongoose');

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

exports.getHealth = (req, res) => {
  const dbStatus = DB_STATES[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    service: 'COMP3123 Assignment 1 API',
    environment: process.env.NODE_ENV || 'development',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      name: 'comp3123_assignment1',
      status: dbStatus,
    },
  });
};