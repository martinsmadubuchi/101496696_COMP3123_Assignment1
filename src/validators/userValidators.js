// Validation rules for signup and login
const { body } = require('express-validator');

exports.signupRules = [
  body('username')
    .exists({ values: 'falsy' }).withMessage('Username is required').bail()
    .isString().withMessage('Username must be a string').bail()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),

  body('email')
    .exists({ values: 'falsy' }).withMessage('Email is required').bail()
    .isString().withMessage('Email must be a string').bail()
    .trim()
    .isEmail().withMessage('Email format is invalid')
    .isLength({ max: 254 }).withMessage('Email is too long')
    .toLowerCase(),

  body('password')
    .exists({ values: 'falsy' }).withMessage('Password is required').bail()
    .isString().withMessage('Password must be a string').bail()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
];

exports.loginRules = [
  // Must send username OR email (not both, not neither)
  body().custom((value) => {
    const { username, email } = value || {};
    if (!username && !email) throw new Error('Provide either username or email');
    if (username && email) throw new Error('Provide username OR email, not both');
    return true;
  }),

  body('username')
    .optional()
    .isString().withMessage('Username must be a string')
    .trim()
    .isLength({ max: 30 }).withMessage('Username is too long'),

  body('email')
    .optional()
    .isString().withMessage('Email must be a string')
    .trim()
    .isEmail().withMessage('Email format is invalid')
    .toLowerCase(),

  body('password')
    .exists({ values: 'falsy' }).withMessage('Password is required').bail()
    .isString().withMessage('Password must be a string'),
];