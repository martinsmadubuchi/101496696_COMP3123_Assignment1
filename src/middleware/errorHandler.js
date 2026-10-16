// Centralized error handler: every error in the app ends up here
// and is returned as consistent JSON with the right status code.
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    // Malformed JSON in the request body
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  } else if (err.code === 11000) {
    // MongoDB duplicate key (unique field already used)
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `${field} already exists`;
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId, etc.
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (statusCode >= 500) {
    // Log full details for us, but never send stack traces to the client
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
    message = 'Internal server error';
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  const body = { status: 'error', message };
  if (details) body.errors = details;

  res.status(statusCode).json(body);
};