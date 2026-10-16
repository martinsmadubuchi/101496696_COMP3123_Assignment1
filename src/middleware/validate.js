// Runs after express-validator rules. If any rule failed -> 400 with details.
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.path || 'body',
      message: e.msg,
    }));
    return next(new AppError('Validation failed', 400, details));
  }
  next();
};