const Student = require('../models/Student');
const ModuleClass = require('../models/ModuleClass');
const Account = require('../models/Account');
const StudentModuleClass = require('../models/StudentModuleClass');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

exports.getAllStudents = (req, res, next) => {
    const page = req.query.page;
    Student.findAll({
        attributes: ['uuid', 'fullname', 'student_code', 'class_name', 'birth_date', 'class_code', 'vnu_mail'],
        order: [['student_code', 'ASC']],
        limit: 10,
        offset: 10*page
    })
    .then(students => {
        res.status(200).json({
            result: students
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}

exports.getStudent = (req, res, next) => {
    Student.findOne({
        attributes: ['uuid', 'fullname', 'student_code', 'class_name', 'birth_date', 'class_code', 'vnu_mail'],
        where: {
            uuid: req.params.student_uuid
        },
        include: [{
            model: ModuleClass,
            attributes: ['uuid', 'module_class_code', 'number_of_credits', 'lecturer_name'],
            through: {
                model: StudentModuleClass,
                as: 'condition',
                attributes: ['status']
            }
        }]
    })
    .then(student => {
        if(!student) {
            return res.status(404).json({
                message: 'Not Found'
            });
        }
        else {
            console.log(student);
            res.status(200).json({
                result: student
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}

exports.deleteStudent = (req, res, next) => {
    Student.destroy({
        attributes: ['uuid', 'fullname', 'student_code', 'class_name', 'birth_date', 'class_code', 'vnu_mail'],
        where: {
            uuid: req.params.student_uuid
        },
        include: [{
            model: ModuleClass,
            attributes: ['uuid', 'module_class_code', 'number_of_credits', 'lecturer_name'],
            through: {
                model: StudentModuleClass,
                as: 'condition',
                attributes: ['status']
            }
        }]
    })
    .then(student => {
        if(!student) {
            return res.status(404).json({
                message: 'Not Found'
            });
        }
        else {
            console.log(student);
            res.status(200).json({
                message: 'Xóa sinh viên thành công'
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
} 

exports.editStudent = (req, res, next) => {
    Student.update(
        {
            student_code: req.body.student_code,
            fullname: req.body.fullname,
            birth_date: req.body.birth_date,
            class_name: req.body.class_name,
            class_code: req.body.class_code,
            vnu_mail: req.body.vnu_mail
        },
        { 
            where: {uuid: req.params.student_uuid}
        } 
    )
    .then(result => {
        if(result[0] === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy sinh viên'
            })
        }
        else {
            return res.status(200).json({
               message: 'Chỉnh sửa thông tin sinh viên thành công'
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}

exports.addStudentAccounts = (req, res, next) => {
    Student.findAll({
        attributes: ['uuid', 'student_code']
    })
    .then(students => {
        for(var i = 0; i < students.length; i++) {
            const tempUuid = students[i].uuid;
            const tempStudentCode = students[i].student_code;
            Account.findOne({ where: {studentUuid: tempUuid} })
            .then(result => {
                if(!result) {
                    bcrypt.hash(tempStudentCode, 10, (err, hash) => {
                        if(err) {
                            return res.status(500).json({
                                error: err,
                                message: 'Có lỗi xảy ra'
                            })
                        }
                        else {
                            Account.create({
                                uuid: uuid(),
                                studentUuid: tempUuid,
                                username: tempStudentCode,
                                password: hash,
                                role: 1
                            })
                        }
                    })
                }
            })
        }
        res.status(200).json({
            message: 'Cấp tài khoản cho sinh viên thành công'
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}