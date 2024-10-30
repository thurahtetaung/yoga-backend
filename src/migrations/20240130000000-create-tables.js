// src/migrations/01_initial_schema.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('courses', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            day_of_week: {
                type: Sequelize.STRING,
                allowNull: false
            },
            time_of_day: {
                type: Sequelize.STRING,
                allowNull: false
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            capacity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            last_modified: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.createTable('classes', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                allowNull: false
            },
            course_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'courses',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            date: {
                type: Sequelize.STRING,
                allowNull: false
            },
            teacher: {
                type: Sequelize.STRING,
                allowNull: false
            },
            comments: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            last_modified: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('classes');
        await queryInterface.dropTable('courses');
    }
};