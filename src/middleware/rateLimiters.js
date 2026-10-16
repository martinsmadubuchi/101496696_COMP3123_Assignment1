// Rate limiting: limits how many requests one IP can make in a time window.
// Protects login/signup from brute-force attacks and the API from abuse.
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Shared handler: logs the event and returns a consistent JSON 429 response
function onLimitReached(req, res, next, options) {
  logger.warn(`RATE LIMIT exceeded: ${req.method} ${req.originalUrl} ip=${req.ip}`);
  res.status(options.statusCode).json({
    status: 'error',
    message: options.message,
  });
}

// Strict limit for authentication endpoints (login + signup)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                // 10 requests per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  handler: onLimitReached,
});

// General limit for all API traffic
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // 100 requests per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again later.',
  handler: onLimitReached,
});