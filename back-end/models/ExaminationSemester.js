const Sequelize = require('sequelize');
const connection = require('../database/connection');
const ExaminationShift = require('./ExaminationShift');

const ExaminationSemester = connection.sequelize.define(
    'examination_semester',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        year: {
            type: Sequelize.STRING(9)
        },
        semester: {
            type: Sequelize.INTEGER
        }
    }
);

ExaminationSemester.hasMany(ExaminationShift);

module.exports = ExaminationSemester;