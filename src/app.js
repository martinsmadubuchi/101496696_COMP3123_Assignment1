// Express application setup
const express = require('express');
const helmet = require('helmet');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiters');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// On Vercel the app runs behind a proxy; trust it so rate limiting sees the real client IP
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// Security headers (CSP, X-Frame-Options, nosniff, HSTS, hides X-Powered-By, etc.)
app.use(helmet());

// Log every request to logs/app.log (placed early so 429s and bad JSON are logged too)
app.use(requestLogger);

// Parse JSON request bodies (limit size to block huge payloads)
app.use(express.json({ limit: '10kb' }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'COMP 3123 Assignment 1 API is running' });
});

// Health check (not rate limited, so monitoring always works)
app.use('/health', healthRoutes);

// General rate limit for all API routes
app.use('/api', apiLimiter);

// API routes (auth routes get an extra, stricter limit)
app.use('/api/v1/user', authLimiter, userRoutes);
app.use('/api/v1/emp', employeeRoutes);

// Unknown routes -> 404 (must come AFTER all real routes)
app.use(notFound);

// Central error handler (must be LAST)
app.use(errorHandler);

module.exports = app;