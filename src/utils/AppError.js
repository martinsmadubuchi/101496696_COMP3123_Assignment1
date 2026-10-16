// Custom error class: lets us throw errors with a specific HTTP status code
class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;