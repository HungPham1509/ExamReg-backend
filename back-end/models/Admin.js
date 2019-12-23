const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Admin = connection.sequelize.define(
    'admin',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        fullname: {
            type: Sequelize.STRING(50)
        },
        email: {
            type: Sequelize.STRING(225),
            unique: true
        },
        vnu_mail: {
            type: Sequelize.STRING(50),
            unique: true
        },
        phone_number: {
            type: Sequelize.STRING(15),
            unique: true
        },
        note: {
            type: Sequelize.TEXT
        }
    }
)

module.exports = Admin;
