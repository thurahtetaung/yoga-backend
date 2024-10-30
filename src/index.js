// src/index.js
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
// const routes = require('./routes');
const syncRoutes = require('./routes/syncRoutes');
// const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const umzug = require('./config/umzug');

const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/api', routes);
app.use('/api/sync', syncRoutes);

// Error handling
// app.use(errorHandler);

// Database connection, migrations, and server startup
async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Run migrations
    logger.info('Running migrations...');
    await umzug.up();
    logger.info('Migrations completed successfully.');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();