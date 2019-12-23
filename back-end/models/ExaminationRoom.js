const Sequelize = require('sequelize');
const connection = require('../database/connection');

const ExaminationRoom = connection.sequelize.define(
    'examination_room',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        room_name: {
            type: Sequelize.STRING(45)
        },
        place: {
            type: Sequelize.STRING(225)
        },
        number_of_computers: {
            type: Sequelize.INTEGER
        }
    }
);



module.exports = ExaminationRoom;