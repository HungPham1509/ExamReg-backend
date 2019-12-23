const Sequelize = require('sequelize');
const connection = require('../database/connection');
const ModuleClass = require('./ModuleClass');
const ExaminationShiftCourse = require('./ExaminationShiftCourse');
const ExaminationShift = require('./ExaminationShift')

const Course = connection.sequelize.define(
    'course',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        course_code: {
            type: Sequelize.STRING(7),
            unique: true
        },
        course_name: {
            type: Sequelize.STRING(225),
            unique: true
        },
        institute:  {
            type: Sequelize.STRING(225)
        },
        examine_method: {
            type: Sequelize.STRING(45)
        },
        examine_time: {
            type: Sequelize.STRING(10)
        }
    }
);
Course.hasMany(ModuleClass);

ExaminationShift.belongsToMany(Course, {through: ExaminationShiftCourse});
Course.belongsToMany(ExaminationShift, {through: ExaminationShiftCourse});

module.exports = Course;