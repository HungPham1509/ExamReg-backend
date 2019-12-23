const Sequelize = require('sequelize');
const connection = require('../database/connection');

const ExaminationShiftExaminationRoom = connection.sequelize.define(
    'examination_shift_examination_room',
    {
        number_of_computers_remaining: {
            type: Sequelize.INTEGER
        }
    }
    
)

module.exports = ExaminationShiftExaminationRoom;