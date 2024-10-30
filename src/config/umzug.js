// src/config/umzug.js
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const config = require('./database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

const umzug = new Umzug({
    migrations: {
        glob: ['migrations/*.js', { cwd: path.resolve(__dirname, '..') }],
        resolve: ({ name, path, context }) => {
            const migration = require(path);
            return {
                name,
                up: async () => migration.up(context, Sequelize),
                down: async () => migration.down(context, Sequelize)
            };
        }
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: logger
});

module.exports = umzug;