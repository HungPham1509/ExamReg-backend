const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Student = require('./Student');
const StudentModuleClass = require('./StudentModuleClass');

const ModuleClass = connection.sequelize.define(
    'module_class',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        module_class_code: {
            type: Sequelize.STRING(10),
            unique: true
        },
        number_of_credits: {
            type: Sequelize.INTEGER
        },
        lecturer_name: {
            type: Sequelize.STRING(225)
        }
    }
);

ModuleClass.belongsToMany(Student, { through: StudentModuleClass});
Student.belongsToMany(ModuleClass, {through: StudentModuleClass});

module.exports = ModuleClass;