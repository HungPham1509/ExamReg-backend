const Course = require('../models/Course');
const ModuleClass = require('../models/ModuleClass');


exports.getAllCourse = (req, res, next) => {
    const page = req.query.page
    console.log(page)
    let lim, off;
    if(page == 100) {
        lim = 100;
        off = 0
    }
    else {
        lim = 4,
        off = 4*page
    }
    Course.findAll({
        include: [
            {
                model: ModuleClass
            }
        ],
        order: [['course_name', 'ASC']],
        limit: lim,
        offset: off
    })
    .then(courses => {
        const result = courses.map(course => {
            return {
                uuid: course.uuid,
                course_name: course.course_name,
                course_code: course.course_code,
                institute: course.institute,
                examine_method: course.examine_method,
                examine_time: course.examine_time,
                module_classes: course.module_classes.map(module_class => {
                    return {
                        uuid: module_class.uuid,
                        module_class_code: module_class.module_class_code,
                        number_of_credits: module_class.number_of_credits,
                        lecturer_name: module_class.lecturer_name 
                    }
                })
            }
        })
        res.status(200).json({
            result: result
        })
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}

exports.getCourse = (req, res, next) => {
    Course.findOne({ 
        where:{uuid: req.params.course_uuid},
        include: [
            {
                model: ModuleClass
            }
        ] 
    })
    .then(result => {
        if(!result) {
            return res.status(404).json({
                message: 'Not Found'
            })
        }
        else {
            return res.status(200).json({
                course: {
                    uuid: result.uuid,
                    course_name: result.course_name,
                    course_code: result.course_code,
                    institute: result.institute,
                    examine_method: result.examine_method,
                    examine_time: result.examine_time,
                    module_classes: result.module_classes.map(module_class => {
                        return {
                            uuid: module_class.uuid,
                            module_class_code: module_class.module_class_code,
                            number_of_credits: module_class.number_of_credits,
                            lecturer_name: module_class.lecturer_name 
                        }
                    })
                }
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

exports.editCourse = (req, res, next) => {
    Course.update(
        {
            course_code: req.body.course_code,
            course_name: req.body.course_name,
            institute: req.body.institute,
            examine_method: req.body.examine_method,
            examine_time: req.body.examine_time
        },
        { 
            where: {uuid: req.params.course_uuid}
        } 
    )
    .then(result => {
        if(result[0] === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy học phần'
            })
        }
        else {
            return res.status(200).json({
               message: 'Chỉnh sửa thông tin học phần thành công'
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