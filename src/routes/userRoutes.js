const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupRules, loginRules } = require('../validators/userValidators');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/v1/user/signup
router.post('/signup', signupRules, validate, signup);

// POST /api/v1/user/login
router.post('/login', loginRules, validate, login);

module.exports = router;