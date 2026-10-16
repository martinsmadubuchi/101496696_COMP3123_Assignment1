// Winston logger: writes logs to the console and to files in /logs
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// On Vercel, only /tmp is writable. Locally we use the project's logs/ folder.
const logDir = process.env.VERCEL
  ? '/tmp/logs'
  : path.join(__dirname, '..', '..', 'logs');

try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (err) {
  // If the folder can't be created, we still log to the console
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`
  )
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
  ],
});

module.exports = logger;