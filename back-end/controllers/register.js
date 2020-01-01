const uuid = require('uuid')
const ExaminationSemester = require('../models/ExaminationSemester');
const ExaminationRoom = require('../models/ExaminationRoom');
const ExaminationShift = require('../models/ExaminationShift');
const ExaminationShiftExaminationRoom = require('../models/ExaminationShiftExaminationRoom');
const ExaminationShiftCourse = require('../models/ExaminationShiftCourse');
const Course = require('../models/Course');
const StudentExaminationShift = require('../models/StudentExaminationShift');
const Student = require('../models/Student');
const Sequelize = require('sequelize');

// lấy tất cả ca thi mà có môn thi thuộc những môn thi mà sinh học
exports.getShiftsOfStudentCourses = (req, res, next) => {
    ExaminationShift.findAll({
        where: {examinationSemesterUuid: req.params.examination_semester_uuid},
        attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
        include: [
            {
                model: Course,
                where: {uuid: req.query.course_uuid},
                attributes: ['uuid', 'course_code', 'course_name', 'institute', 'examine_method', 'examine_time'],
                through: {
                    model: ExaminationShiftCourse,
                    attributes: [],
                    as: 'course'
                },
            },
            {
                model: ExaminationRoom,
                attributes: ['uuid', 'room_name', 'place', 'number_of_computers'],
                through: {
                    model: ExaminationShiftExaminationRoom,
                    attributes: ['number_of_computers_remaining'],
                    as: 'status'
                }
            }
        ]
    })
    .then(shifts => {
        if(shifts.length <= 0) {
            return res.status(404).json({
                message: 'Ko tìm thấy ca thi'
            })
        }
        res.status(200).json({
            result: shifts
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}
// đăng kí ca thi
exports.registerShift = (req, res, next) => {
    ExaminationShift.findOne(
        {
            where: {uuid: req.query.examination_shift_uuid},
            attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
            include: [
                {
                    model: ExaminationRoom,
                    attributes: ['uuid', 'room_name', 'place', 'number_of_computers'],
                    through: {
                        model: ExaminationShiftExaminationRoom,
                        attributes: ['number_of_computers_remaining'],
                        as: 'status'
                    }
                }
            ]
        }
    )
    .then(shift => {
        if(!shift) {
            return res.status(404).json({
                message: 'Ko tìm thấy ca thi'
            })
        }
        else {
            if(shift['examination_rooms'][0].status.number_of_computers_remaining <= 0) {
                return res.status(404).json({
                    message: 'Ca thi đã đầy'
                })
            }
            else {
                StudentExaminationShift.create({
                    studentUuid: req.params.student_uuid,
                    examinationShiftUuid: req.query.examination_shift_uuid
                }).then(result => {
                    ExaminationShiftExaminationRoom.update(
                        {
                            number_of_computers_remaining: shift['examination_rooms'][0].status.number_of_computers_remaining - 1
                        },
                        {
                            where: {examinationShiftUuid: req.query.examination_shift_uuid},
                        }
                    )
                    return res.status(200).json({
                        message: 'Đăng kí ca thi thành công'
                    })
                })
            }
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}
// hủy ca thi đã đăng kí
exports.deleteRegisteredShift = (req, res, next) => {
    StudentExaminationShift.findOne(
        {
            where: {
                studentUuid: req.params.student_uuid,
                examinationShiftUuid: req.query.examination_shift_uuid
            }
        }
    )
    .then(result => {
        if(!result) {
            return res.status(404).json({
                message: 'Ko tìm thấy ca thi'
            })
        }
        else {
            ExaminationShift.findOne(
                {
                    where: {uuid: req.query.examination_shift_uuid},
                    attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
                    include: [
                        {
                            model: ExaminationRoom,
                            attributes: ['uuid', 'room_name', 'place', 'number_of_computers'],
                            through: {
                                model: ExaminationShiftExaminationRoom,
                                attributes: ['number_of_computers_remaining'],
                                as: 'status'
                            }
                        }
                    ]
                }
            )
            .then(shift => {
                StudentExaminationShift.destroy({
                    where: {
                        studentUuid: req.params.student_uuid,
                        examinationShiftUuid: req.query.examination_shift_uuid
                    }
                })
                ExaminationShiftExaminationRoom.update(
                    {
                        number_of_computers_remaining: shift['examination_rooms'][0].status.number_of_computers_remaining + 1
                    },
                    {
                        where: {examinationShiftUuid: req.query.examination_shift_uuid},
                    }
                )
                res.status(200).json({
                    message: 'Hủy ca thi thành công'
                })
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}
// lấy toàn bộ các ca thi sinh viên đã đăng kí
exports.getAllStudentRegisteredShift = (req, res, next) => {
    Student.findOne({
        where: {uuid: req.params.student_uuid},
        attributes: ['uuid', 'fullname', 'student_code', 'birth_date', 'vnu_mail', 'class_code', 'class_name'],
        include: [
            {
                model: ExaminationShift,
                attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
                include: [
                    {
                        model: Course,
                        attributes: ['uuid', 'course_code', 'course_name', 'institute', 'examine_method', 'examine_time'],
                        through: {
                            model: ExaminationShiftCourse,
                            attributes: [],
                            as: 'course'
                        },
                    },
                    {
                        model: ExaminationRoom,
                        attributes: ['uuid', 'room_name', 'place', 'number_of_computers'],
                        through: {
                            model: ExaminationShiftExaminationRoom,
                            attributes: ['number_of_computers_remaining'],
                            as: 'status'
                        }
                    }
                ],
                through: {
                    model: StudentExaminationShift
                }
            }
        ]
    })
    .then(student => {
        if(student['examination_shifts'].length === 0 ) {
            res.status(404).json({
                message: 'Bạn chưa đăng kí ca thi nào'
            })
        }
        res.status(200).json({
            result: student
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}
