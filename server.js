// Entry point: load env variables, connect to MongoDB, then start the server
require('dotenv').config({ quiet: true });

const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  })
  .catch(() => {
    logger.error('Server not started because the database connection failed');
    process.exit(1);
  });