// controllers/syncController.js
const { Course, Class } = require('../models');
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const syncController = {
    uploadData: async (req, res) => {
        logger.info('Received request body:', req.body);
        const t = await sequelize.transaction();

        try {
            const { courses, classes } = req.body;
            // console.log("courses", courses);
            // console.log("classes", classes);
            logger.info('Received upload request:', {
                coursesCount: courses?.length,
                classesCount: classes?.length
            });

            // Validate input
            if (!Array.isArray(courses) || !Array.isArray(classes)) {
                throw new Error('Invalid data format: courses and classes must be arrays');
            }
            // delete all courses and classes
            await sequelize.query('DELETE FROM courses', { transaction: t });
            await sequelize.query('DELETE FROM classes', { transaction: t });
            // Upsert courses
            if (courses.length > 0) {
                await sequelize.query(
                    `INSERT INTO courses (id, type, day_of_week, time_of_day, duration, capacity, price, description)
                        VALUES ${courses.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
                        ON DUPLICATE KEY UPDATE
                        id = VALUES(id),
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
            if (classes.length > 0) {
                await sequelize.query(
                    `INSERT INTO classes (id, course_id, date, teacher, comments)
                     VALUES ${classes.map(() => '(?, ?, ?, ?, ?)').join(', ')}
                     ON DUPLICATE KEY UPDATE
                     id = VALUES(id),
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
            logger.info('Upload successful');
            res.json({
                success: true,
                message: 'Data synchronized successfully',
                coursesUploaded: courses.length,
                classesUploaded: classes.length
            });

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

    downloadData: async (req, res) => {
        try {
            // Get all courses
            const [courses] = await sequelize.query(
                'SELECT * FROM courses'
            );

            // Get all classes
            const [classes] = await sequelize.query(
                'SELECT * FROM classes'
            );

            // Transform the data to match Android app's format
            const transformedCourses = courses.map(course => ({
                id: course.id,
                type: course.type,
                dayOfWeek: course.day_of_week,
                timeOfDay: course.time_of_day,
                duration: course.duration,
                capacity: course.capacity,
                price: course.price,
                description: course.description
            }));

            const transformedClasses = classes.map(classItem => ({
                id: classItem.id,
                courseId: classItem.course_id,
                date: classItem.date,
                teacher: classItem.teacher,
                comments: classItem.comments
            }));

            logger.info('Download successful', {
                coursesCount: courses.length,
                classesCount: classes.length
            });

            res.json({
                success: true,
                data: {
                    courses: transformedCourses,
                    classes: transformedClasses
                },
                message: 'Data retrieved successfully'
            });

        } catch (error) {
            logger.error('Sync download error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving data',
                error: error.message
            });
        }
    }
};

module.exports = syncController;