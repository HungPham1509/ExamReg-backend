const Account = require('../models/Account');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');


exports.login = (req, res, next) => {
    Account.findOne({where: {username: req.body.username}})
    .then(account => {
        if(account) {
            bcrypt.compare(req.body.password, account.password, (err, result) => {
                if(err) {
                    return res.status(401).json({
                        message: 'Auth Failed'
                    })
                }
                if(result) {
                    const token = jwt.sign({
                        username: account.username,
                        uuid: account.uuid,
                        role: account.role
                    },
                    'exam-register-web',
                    {expiresIn: '1h'}
                    );
                    res.cookie('access_token', token, {
                        expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
                        overwrite: true
                    });
                    return res.status(201).json({
                        message: 'Auth Success',
                        token: token
                    })
                }
                return res.status(401).json({
                    message: 'Auth Failed'
                })
            })
        }
        else {
            return res.status(401).json({
                message: 'Auth Failed'
            })
        }
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
}


exports.createAdminAccount = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                error: err
            })
        }
        else {
            try {
                const adminUuid = uuid();
                Admin.create({
                    uuid: adminUuid,
                    fullname: req.body.fullname,
                    email: req.body.email,
                    vnu_mail: req.body.vnu_mail,
                    phone_number: req.body.phone_number,
                    note: req.body.note
                })
                .then(result => {
                    console.log(result)
                });
    
                Account.create({
                    uuid: uuid(),
                    adminUuid: adminUuid,
                    username: req.body.username,
                    password: hash,
                    role: req.body.role
                })
                .then(result => {
                    console.log(result)
                });
                res.status(201).json({
                        message: 'Admin Created'
                })
            } catch (error) {
                res.status(500).json({
                    error: error
                })
            }
        }
    })
}

