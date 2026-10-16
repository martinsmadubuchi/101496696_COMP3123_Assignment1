// Handles HTTP request/response for signup and login
const authService = require('../services/authService');

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  const user = await authService.registerUser({ username, email, password });

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  });
};

exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  const { user, token } = await authService.loginUser({ username, email, password });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    token_type: 'Bearer',
    expires_in: process.env.JWT_EXPIRES_IN || '1h',
    user: { id: user._id, username: user.username, email: user.email },
  });
};