const Sequelize = require('sequelize');
const connection = require('../database/connection');

const StudentExaminationShift = connection.sequelize.define(
    'student_examination_shift'
)

module.exports = StudentExaminationShift;