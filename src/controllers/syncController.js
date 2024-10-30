// src/controllers/syncController.js
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const syncController = {
    // Handle data upload from Android app
    uploadData: async (req, res) => {
        const t = await sequelize.transaction();

        try {
            const { courses, classes } = req.body;

            // Upsert courses
            if (courses && courses.length > 0) {
                await sequelize.query(
                    `INSERT INTO courses (id, type, day_of_week, time_of_day, duration, capacity, price, description)
                     VALUES ${courses.map(c => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
                     ON DUPLICATE KEY UPDATE
                     type = VALUES(type),
                     day_of_week = VALUES(day_of_week),
                     time_of_day = VALUES(time_of_day),
                     duration = VALUES(duration),
                     capacity = VALUES(capacity),
                     price = VALUES(price),
                     description = VALUES(description)`,
                    {
                        replacements: courses.flatMap(c => [
                            c.id, c.type, c.dayOfWeek, c.timeOfDay,
                            c.duration, c.capacity, c.price, c.description
                        ]),
                        transaction: t
                    }
                );
            }

            // Upsert classes
            if (classes && classes.length > 0) {
                await sequelize.query(
                    `INSERT INTO classes (id, course_id, date, teacher, comments)
                     VALUES ${classes.map(c => '(?, ?, ?, ?, ?)').join(', ')}
                     ON DUPLICATE KEY UPDATE
                     course_id = VALUES(course_id),
                     date = VALUES(date),
                     teacher = VALUES(teacher),
                     comments = VALUES(comments)`,
                    {
                        replacements: classes.flatMap(c => [
                            c.id, c.courseId, c.date, c.teacher, c.comments
                        ]),
                        transaction: t
                    }
                );
            }

            await t.commit();
            res.json({ success: true, message: 'Data synchronized successfully' });

        } catch (error) {
            await t.rollback();
            logger.error('Sync upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error synchronizing data',
                error: error.message
            });
        }
    },

    // Handle data download to Android app
    downloadData: async (req, res) => {
        try {
            // Get last sync timestamp from query params or default to 0
            const lastSync = req.query.lastSync || '1970-01-01 00:00:00';

            // Get all updated records since last sync
            const [courses] = await sequelize.query(
                `SELECT * FROM courses WHERE last_modified > ?`,
                { replacements: [lastSync] }
            );

            const [classes] = await sequelize.query(
                `SELECT * FROM classes WHERE last_modified > ?`,
                { replacements: [lastSync] }
            );

            // Get current server timestamp for next sync
            const [{ currentTimestamp }] = await sequelize.query(
                'SELECT CURRENT_TIMESTAMP as currentTimestamp'
            );

            res.json({
                success: true,
                data: {
                    courses,
                    classes,
                    timestamp: currentTimestamp
                }
            });

        } catch (error) {
            logger.error('Sync download error:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading data',
                error: error.message
            });
        }
    },

    deleteAll: async (req, res) => {
      const t = await sequelize.transaction();

      try {
          // Delete all classes first due to foreign key constraints
          await sequelize.query('DELETE FROM classes', { transaction: t });

          // Then delete all courses
          await sequelize.query('DELETE FROM courses', { transaction: t });

          await t.commit();
          res.json({
              success: true,
              message: 'All data deleted successfully'
          });

      } catch (error) {
          await t.rollback();
          logger.error('Delete all error:', error);
          res.status(500).json({
              success: false,
              message: 'Error deleting data',
              error: error.message
          });
      }
  }
};

module.exports = syncController;