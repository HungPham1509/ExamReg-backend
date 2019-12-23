const Sequelize = require('sequelize');
const connection = require('../database/connection');

const ExaminationShiftCourse = connection.sequelize.define(
    'examination_shift_course'
)

module.exports = ExaminationShiftCourse;