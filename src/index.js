// src/index.js
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const syncRoutes = require('./routes/syncRoutes');
const logger = require('./utils/logger');
const umzug = require('./config/umzug');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/sync', syncRoutes);

async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Check pending migrations
    const pending = await umzug.pending();

    if (pending.length > 0) {
      logger.info(`Found ${pending.length} pending migrations. Running migrations...`);

      // Log each migration that will be run
      pending.forEach(migration => {
        logger.info(`- ${migration.name}`);
      });

      // Run migrations
      await umzug.up();
      logger.info('Migrations completed successfully.');
    } else {
      logger.info('No pending migrations found.');
    }

    // Optional: Log executed migrations
    const executed = await umzug.executed();
    logger.info(`Total executed migrations: ${executed.length}`);

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