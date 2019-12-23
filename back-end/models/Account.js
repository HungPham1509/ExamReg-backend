const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const Account = connection.sequelize.define(
    'account',
    {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING(45),
            unique: true
        },
        password: {
            type: Sequelize.CHAR(60)
        },
        role: {
            type: Sequelize.INTEGER
        }
    },
    {underscored: true}
);

Account.belongsTo(Student);
Account.belongsTo(Admin);

module.exports = Account;
