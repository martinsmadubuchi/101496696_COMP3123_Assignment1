// Validation rules for employee endpoints
const { body, param, query } = require('express-validator');
const AppError = require('../utils/AppError');

const ALLOWED_FIELDS = [
  'first_name', 'last_name', 'email', 'position',
  'salary', 'date_of_joining', 'department',
];

// Reject any field we don't expect (e.g. a client trying to set "user")
exports.rejectUnknownFields = (req, res, next) => {
  const data = req.body;
  if (data !== undefined && (data === null || typeof data !== 'object' || Array.isArray(data))) {
    return next(new AppError('Request body must be a JSON object', 400));
  }
  const unknown = Object.keys(data || {}).filter((k) => !ALLOWED_FIELDS.includes(k));
  if (unknown.length) {
    return next(new AppError('Validation failed', 400,
      unknown.map((f) => ({ field: f, message: `Field "${f}" is not allowed` }))));
  }
  next();
};

// PUT must change at least one field
exports.requireNonEmptyBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Request body must contain at least one field to update', 400));
  }
  next();
};

// Builds the rules; for updates every field is optional
function fieldRules(isUpdate) {
  const text = (name, max) => {
    const start = isUpdate
      ? body(name).optional()
      : body(name).exists({ values: 'falsy' }).withMessage(`${name} is required`).bail();
    return start
      .isString().withMessage(`${name} must be a string`).bail()
      .trim()
      .isLength({ min: 1, max }).withMessage(`${name} must be 1-${max} characters`);
  };

  const salaryStart = isUpdate
    ? body('salary').optional()
    : body('salary').exists({ values: 'null' }).withMessage('salary is required').bail();

  const dateStart = isUpdate
    ? body('date_of_joining').optional()
    : body('date_of_joining').exists({ values: 'falsy' }).withMessage('date_of_joining is required').bail();

  return [
    text('first_name', 50),
    text('last_name', 50),
    text('email', 254)
      .isEmail().withMessage('email format is invalid')
      .toLowerCase(),
    text('position', 100),
    salaryStart
      .isFloat({ gt: 0, max: 10000000 }).withMessage('salary must be a positive number (max 10,000,000)')
      .toFloat(),
    dateStart
      .isISO8601({ strict: true }).withMessage('date_of_joining must be a valid date (YYYY-MM-DD)').bail()
      .custom((v) => {
        if (new Date(v).getFullYear() < 1900) throw new Error('date_of_joining is too far in the past');
        return true;
      })
      .toDate(),
    text('department', 100),
  ];
}

exports.createEmployeeRules = fieldRules(false);
exports.updateEmployeeRules = fieldRules(true);

exports.eidParamRule = [
  param('eid').isMongoId().withMessage('Invalid employee ID'),
];

exports.eidQueryRule = [
  query('eid')
    .exists({ values: 'falsy' }).withMessage('eid query parameter is required').bail()
    .isString().withMessage('eid must be a single value').bail()
    .isMongoId().withMessage('Invalid employee ID'),
];