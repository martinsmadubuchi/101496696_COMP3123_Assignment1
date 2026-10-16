// MongoDB connection using Mongoose
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Reuse one connection (important for Vercel, where code may run many times)
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }

    connectionPromise = mongoose
      .connect(uri, {
        dbName: 'comp3123_assignment1', // database name required by the assignment
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        logger.info(`MongoDB connected: database "${m.connection.name}"`);
        return m.connection;
      })
      .catch((err) => {
        connectionPromise = null; // allow retry on next call
        logger.error(`MongoDB connection error: ${err.message}`);
        throw err;
      });
  }

  return connectionPromise;
}

module.exports = connectDB;