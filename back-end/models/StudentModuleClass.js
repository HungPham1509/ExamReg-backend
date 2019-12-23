const Sequelize = require('sequelize');
const connection = require('../database/connection');

const StudentModuleClass = connection.sequelize.define(
    'student_module_class',
    {
        status: {
            type: Sequelize.INTEGER
        }
    }
)

module.exports = StudentModuleClass;