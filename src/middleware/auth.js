// JWT authentication: checks "Authorization: Bearer <token>"
// and attaches the logged-in user to req.user
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    logger.warn(`AUTHZ missing token: ${req.method} ${req.originalUrl}`);
    throw new AppError('Authentication required: missing Bearer token', 401);
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    logger.warn(`AUTHZ malformed Authorization header: ${req.method} ${req.originalUrl}`);
    throw new AppError('Authorization header must be in the format: Bearer <token>', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    logger.warn(`AUTHZ ${expired ? 'expired' : 'invalid'} token: ${req.method} ${req.originalUrl}`);
    throw new AppError(expired ? 'Token has expired' : 'Invalid token', 401);
  }

  // The user id comes ONLY from the verified token, never from the client
  if (!mongoose.isValidObjectId(payload.sub)) {
    throw new AppError('Invalid token', 401);
  }

  const user = await User.findById(payload.sub).lean();
  if (!user) {
    logger.warn(`AUTHZ token for deleted/unknown user: ${payload.sub}`);
    throw new AppError('User for this token no longer exists', 401);
  }

  req.user = { id: user._id.toString(), username: user.username };
  next();
};