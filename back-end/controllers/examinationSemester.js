const uuid = require('uuid')
const ExaminationSemester = require('../models/ExaminationSemester');
const ExaminationRoom = require('../models/ExaminationRoom');
const ExaminationShift = require('../models/ExaminationShift');
const ExaminationShiftExaminationRoom = require('../models/ExaminationShiftExaminationRoom');
const ExaminationShiftCourse = require('../models/ExaminationShiftCourse');
const Course = require('../models/Course');
const Sequelize = require('sequelize');

exports.getAllExaminationSemesters = (req, res, next) => {
    ExaminationSemester.findAll({
        attributes: ['uuid', 'year', 'semester']
    })
    .then(result => {
        if(result.length <= 0) {
            return res.status(404).json({
                message: 'Không tìm thấy ca thi'
            })
        }
        res.status(200).json({
            result: result
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}

exports.createExaminationSemester = (req, res, next) => {
    ExaminationSemester.findOne({where: {year: req.body.year, semester: req.body.semester}})
    .then(result => {
        if(result) {
            return res.status(409).json({
                message: 'Kì thi đã tồn tại'
            })
        }
        else {
            ExaminationSemester.create({
                uuid: uuid(),
                year: req.body.year,
                semester: req.body.semester
            })
            .then(examination => {
                res.status(201).json({
                    message: 'Tạo kì thi thành công'
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

exports.createRoom = (req, res, next) => {
    ExaminationRoom.findOne({where: {room_name: req.body.room_name, place: req.body.place}})
    .then(result => {
        if(result) {
            return res.status(409).json({
                message: 'Phòng thi đã tồn tại'
            })
        }
        else {
            ExaminationRoom.create({
                uuid: uuid(),
                room_name: req.body.room_name,
                place: req.body.place,
                number_of_computers: req.body.number_of_computers
            })
            .then(examination => {
                res.status(201).json({
                    message: 'Tạo phòng thi thành công'
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

exports.creatExaminationShift = (req, res, next) => {
    ExaminationRoom.findOne({ where:{room_name: req.body.room_name, place: req.body.place} })
    .then(room => {
        if(!room) {
            return res.status(404).json({
                message: 'Phòng thi không tồn tại'
            })
        }
        else {
            ExaminationShift.findOne({
                include: [{
                    model: ExaminationRoom,
                    through: {
                        model: ExaminationShiftExaminationRoom
                    },
                    where: {room_name: room.room_name, place: room.place}
                }],
                where: {
                    examination_date: req.body.examination_date,
                    [Sequelize.Op.or]: [
                        {
                            start_time: {[Sequelize.Op.gte]: req.body.start_time},
                            end_time: {[Sequelize.Op.lte]: req.body.end_time}
                        },
                        {
                            start_time: {[Sequelize.Op.lte]: req.body.start_time},
                            end_time: {[Sequelize.Op.gte]: req.body.end_time}
                        }
                    ]
                }
            })
            .then(shift => {
                if(shift) {
                    return res.status(409).json({
                        message: 'Phòng thi đã được sử dụng ở ca thi này',
                        shift: shift
                    })
                }
                else {
                    const shiftUuid = uuid();
                    ExaminationShift.create({
                        uuid: shiftUuid,
                        examination_date: req.body.examination_date,
                        start_time: req.body.start_time,
                        end_time: req.body.end_time,
                        examinationSemesterUuid: req.params.examination_semester_uuid
                    })
                    .then(result => {
                        ExaminationShiftCourse.create({
                            examinationShiftUuid: shiftUuid,
                            courseUuid: req.body.course_uuid
                        })
                        .catch(error => {
                            res.status(500).json({
                                error: error,
                                message: 'Có lỗi xảy ra'
                            });
                        })

                        ExaminationShiftExaminationRoom.create({
                            examinationShiftUuid: shiftUuid,
                            examinationRoomUuid: room.uuid,
                            number_of_computers_remaining: room.number_of_computers
                        })
                        .catch(error => {
                            res.status(500).json({
                                error: error,
                                message: 'Có lỗi xảy ra'
                            });
                        })

                        res.status(201).json({
                            message: 'Tạo ca thi thành công'
                        })
                    })
                    .catch(error => {
                        res.status(500).json({
                            error: error,
                            message: 'Có lỗi xảy ra'
                        });
                    })
                }
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

exports.getAllExaminationShifts = (req, res, next) => {
    const page = req.query.page;
    ExaminationSemester.findOne({
        where: {uuid: req.params.examination_semester_uuid},
        attributes: ['uuid', 'year', 'semester'],
        include: [
            {
                model: ExaminationShift,
                attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
                limit: 8,
                offset: 8*page,
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
                            attributes: [],
                            as: 'room'
                        }
                    }
                ]
            }
        ]
    })
    .then(result => {
        if(result.length <= 0) {
            return res.status(404).json({
                message: 'Không tìm thấy ca thi'
            })
        }
        res.status(200).json({
            result: result
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        });
    })
}

exports.getExaminationShift = (req, res, next) => {
    ExaminationShift.findOne({
        attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
        where: {uuid: req.params.examination_shift_uuid},
        include: [
            {
                model: Course,
                attributes: ['uuid', 'course_code', 'course_name', 'institute', 'examine_method', 'examine_time'],
                through: {
                    model: ExaminationShiftCourse,
                    attributes: []
                },
            },
            {
                model: ExaminationRoom,
                attributes: ['uuid', 'room_name', 'place', 'number_of_computers'],
                through: {
                    model: ExaminationShiftExaminationRoom,
                    attributes: []
                }
            }
        ]
    })
    .then(shift => {
        if(!shift) {
            return res.status(404).json({
                message: 'Ko tìm thấy ca thi'
            })
        }
        else {
            return res.status(200).json({
                result: shift
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

/*exports.editExaminationShift = (req, res, next) => {
    ExaminationShift.findOne({
        include: [{
            model: ExaminationRoom,
            through: {
                model: ExaminationShiftExaminationRoom
            },
            where: {uuid: req.body.examination_room_uuid}
        }],
        where: {
            
            examination_date: req.body.examination_date,
            [Sequelize.Op.or]: [
                {
                    start_time: {[Sequelize.Op.gte]: req.body.start_time},
                    end_time: {[Sequelize.Op.lte]: req.body.end_time}
                },
                {
                    start_time: {[Sequelize.Op.lte]: req.body.start_time},
                    end_time: {[Sequelize.Op.gte]: req.body.end_time}
                }
            ]
        }
    })
    .then(shift => {
        if(shift) {
            return res.status(409).json({
                message: 'Phòng thi đã được sử dụng ở ca thi này',
                shift: shift
            })
        }
        else {
            ExaminationShift.update(
                {
                    examination_date: req.body.examination_date,
                    start_time: req.body.start_time,
                    end_time: req.body.end_time
                },
                {
                    where: {uuid: req.params.examination_shift_uuid}
                }
            )

            ExaminationShiftCourse.update(
                {
                    courseUuid: req.body.course_uuid
                },
                {
                    where: {examinationShiftUuid: req.params.examination_shift_uuid}
                }
            )

            ExaminationShiftExaminationRoom.update(
                {
                    examinationRoomUuid: req.body.examination_room_uuid
                },
                {
                    where: {examinationShiftUuid: req.params.examination_shift_uuid}
                }
            )

            res.status(200).json({
                message: 'Thay đổi thông tin ca thi thành công'
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
*/

exports.deleteExaminationShift = (req, res, next) => {
    ExaminationShift.destroy({
        attributes: ['uuid', 'examination_date', 'start_time', 'end_time', 'examinationSemesterUuid'],
        where: {uuid: req.params.examination_shift_uuid},
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
                    attributes: [],
                    as: 'room'
                }
            }
        ]
    })
    .then(shift => {
        if(!shift) {
            return res.status(404).json({
                message: 'Ko tìm thấy ca thi'
            })
        }
        else {
            return res.status(200).json({
                message: 'Hủy ca thi thành công'
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