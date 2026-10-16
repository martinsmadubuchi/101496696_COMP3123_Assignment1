// Business logic for signup and login
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Create a JWT that contains the user's id (sub) and expires
function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

exports.registerUser = async ({ username, email, password }) => {
  const existing = await User.findOne({ $or: [{ username }, { email }] }).lean();
  if (existing) {
    const field = existing.username === username ? 'Username' : 'Email';
    logger.warn(`AUTH signup rejected: ${field.toLowerCase()} already exists`);
    throw new AppError(`${field} already exists`, 409);
  }

  // Password is hashed automatically by the pre('save') hook in User.js
  const user = await User.create({ username, email, password });
  logger.info(`AUTH signup success: user=${user.username} id=${user._id}`);
  return user;
};

exports.loginUser = async ({ username, email, password }) => {
  const query = username ? { username } : { email };
  const user = await User.findOne(query).select('+password');

  const passwordOk = user && (await user.comparePassword(password));
  if (!passwordOk) {
    // Same message whether the user doesn't exist or the password is wrong
    logger.warn(`AUTH login failed: ${username ? `username=${username}` : `email=${email}`}`);
    throw new AppError('Invalid username/email or password', 401);
  }

  logger.info(`AUTH login success: user=${user.username} id=${user._id}`);
  return { user, token: signToken(user) };
};