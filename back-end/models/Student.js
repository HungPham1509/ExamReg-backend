const Sequelize = require('sequelize');
const connection = require('../database/connection');
const ExaminationShift = require('./ExaminationShift');
const StudentExaminationShift = require('./StudentExaminationShift');

const Student = connection.sequelize.define(
    'student',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        fullname: {
            type: Sequelize.STRING(50)
        },
        student_code: {
            type: Sequelize.STRING(8),
            unique: true
        },
        birth_date: {
            type: Sequelize.STRING(20)
        },
        vnu_mail: {
            type: Sequelize.STRING(50),
            unique: true
        },
        class_code: {
            type: Sequelize.STRING(20)
        },
        class_name: {
            type: Sequelize.STRING(15)
        },
        note: {
            type: Sequelize.TEXT
        }
    }
)

Student.belongsToMany(ExaminationShift, {through: StudentExaminationShift});
ExaminationShift.belongsToMany(Student, {through: StudentExaminationShift})

module.exports = Student;
