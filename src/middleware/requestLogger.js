// Logs every request (method, path, status, time) into the Winston log files.
// Morgan does NOT log headers, so JWT tokens and passwords never reach the logs.
const morgan = require('morgan');
const logger = require('../utils/logger');

const stream = {
  write: (message) => logger.info(message.trim()),
};

const requestLogger = morgan(
  ':method :url :status - :response-time ms - ip=:remote-addr',
  { stream }
);

module.exports = requestLogger;