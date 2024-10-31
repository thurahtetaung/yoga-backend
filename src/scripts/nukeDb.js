// src/scripts/nukeDb.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

async function nukeDatabase() {
  try {
    logger.info('Starting database nuke process...');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get all tables
    const [results] = await sequelize.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
      {
        replacements: [config[env].database]
      }
    );

    if (results.length === 0) {
      logger.info('No tables found to drop.');
    } else {
      // Drop each table
      for (const row of results) {
        const tableName = row.table_name || row.TABLE_NAME;  // handle different case formats
        await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        logger.info(`Dropped table: ${tableName}`);
      }
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    logger.info('Database nuke completed successfully.');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error nuking database:', error);
    console.error(error);  // Added for more detailed error logging
    await sequelize.close();
    process.exit(1);
  }
}

nukeDatabase();