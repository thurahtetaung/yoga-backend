// src/models/index.js
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: msg => logger.debug(msg)
});

// Define models
const Course = require('./course')(sequelize);
const Class = require('./class')(sequelize);

module.exports = {
  sequelize,
  Course,
  Class
};