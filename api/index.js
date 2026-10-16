// Vercel serverless entry point.
// Vercel calls this function for every request (no app.listen needed).
require('dotenv').config({ quiet: true });

const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB(); // reuses the existing connection when the function is "warm"
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
  return app(req, res);
};