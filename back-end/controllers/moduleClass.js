const uuid = require('uuid');
const exceljs = require('exceljs');
const Course = require('../models/Course');
const ModuleClass = require('../models/ModuleClass');
const Student = require('../models/Student');
const StudentModuleClass = require('../models/StudentModuleClass');

exports.addModuleClass = (req, res, next) => {
    // đọc file excel: 8 dòng đầu là thông tin học phần và lớp học phần
    const wb = new exceljs.Workbook();
    wb.xlsx.readFile(req.file.path).then(function () {
        const sheet = wb.getWorksheet(1);
        const temp = [];
        for(var i = 1; i < 9; i++) {
            temp.push(sheet.getRow(i).getCell(2).value);
        }
        // thông tin học phần
        const courseUuid = uuid();

        const course = {
            uuid: courseUuid,
            course_name: temp[0],
            course_code: temp[1],
            institute: temp[2],
            examine_method: temp[3],
            examine_time: temp[4]
        }
        // danh sách sinh viên
        const studentList = [];
        sheet.eachRow(function(row, rowNumber) {
            if(rowNumber > 10) studentList.push(row.values.splice(2, 7));
        });
        for(var i = 0; i < studentList.length; i++) {
            const date = studentList[i][2];
            const birth_date = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
            studentList[i][2] = birth_date;
        }
        // tìm học phần
        Course.findOne({ where: {course_code: course.course_code} })
        .then(doc => {
            // nếu chưa có học phần trong db: thêm mới học phần và lớp học phần
            if(!doc) {
                // thông tin lớp học phần
                const moduleClass = {
                    uuid: uuid(),
                    courseUuid: courseUuid,
                    module_class_code: temp[5],
                    number_of_credits: temp[6],
                    lecturer_name: temp[7]
                }

                Course.create(course).then(result => {
                    ModuleClass.create(moduleClass).then(mClass => {
                        for(var i = 0 ; i < studentList.length ; i++) {
                            const studentUuid = uuid();
                            const student = {
                                uuid: studentUuid,
                                fullname: studentList[i][1],
                                student_code: studentList[i][0],
                                birth_date: studentList[i][2],
                                class_code: studentList[i][4],
                                class_name: studentList[i][3],
                                vnu_mail: studentList[i][0] + '@vnu.edu.com'
                            }
                            const status = studentList[i][5];
                            Student.findOne({ where: {student_code: student.student_code} })
                            .then(stu => {
                                if(stu) {
                                    StudentModuleClass.create({
                                        studentUuid: stu.uuid,
                                        moduleClassUuid: mClass.uuid,
                                        status: status
                                    })
                                    .catch(error => {
                                        res.status(409).json({
                                            error: error,
                                            message: 'Có lỗi xảy ra'
                                        })
                                    });
                                }
                                else {
                                    Student.create(student).then(newStu => {
                                        StudentModuleClass.create({
                                            studentUuid: newStu.uuid,
                                            moduleClassUuid: mClass.uuid,
                                            status: status
                                        });
                                    })
                                    .catch(error => {
                                        res.status(409).json({
                                            error: error,
                                            message: 'Có lỗi xảy ra'
                                        })
                                    });;                                    
                                }
                            });
                        }
                    });
                    res.status(201).json({
                        message: 'Thêm lớp học phần thành công'
                    });
                }).catch(error => {
                    res.status(409).json({
                        error: error,
                        message: 'Có lỗi xảy ra'
                    })
                });
            }
            // nếu đã tồn tạo học phần: chỉ thêm lớp học phần
            else {
                // thông tin học phần
                // nếu lớp học phần đã tồn tại: báo lỗi
                const moduleClass = {
                    uuid: uuid(),
                    courseUuid: doc.uuid,
                    module_class_code: temp[5],
                    number_of_credits: temp[6],
                    lecturer_name: temp[7]
                }
                ModuleClass.create(moduleClass).then(mClass => {
                    for(var i = 0 ; i < studentList.length ; i++) {
                        const studentUuid = uuid();
                        const student = {
                            uuid: studentUuid,
                            fullname: studentList[i][1],
                            student_code: studentList[i][0],
                            birth_date: studentList[i][2],
                            class_code: studentList[i][4],
                            class_name: studentList[i][3],
                            vnu_mail: studentList[i][0] + '@vnu.edu.com'
                        }
                        const status = studentList[i][5];
                        Student.findOne({ where: {student_code: student.student_code} })
                        .then(stu => {
                            if(stu) {
                                StudentModuleClass.create({
                                    studentUuid: stu.uuid,
                                    moduleClassUuid: mClass.uuid,
                                    status: status
                                }).catch(error => {
                                    res.status(409).json({
                                        error: error,
                                        message: 'Có lỗi xảy ra'
                                    })
                                });
                            }
                            else {
                                Student.create(student).then(newStu => {
                                    StudentModuleClass.create({
                                        studentUuid: newStu.uuid,
                                        moduleClassUuid: mClass.uuid,
                                        status: status
                                    });
                                })
                                .catch(error => {
                                    res.status(409).json({
                                        error: error,
                                        message: 'Có lỗi xảy ra'
                                    })
                                });                                    
                            }
                        });
                    }
                    res.status(201).json({
                        message: 'Thêm lớp học phần thành công'
                    });
                }).catch(error => {
                    res.status(409).json({
                        error: error,
                        message: 'Lớp học phần đã tồn tại'
                    })
                });
            }
        })
        
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}

exports.getModuleClass = (req, res, next) => {
    ModuleClass.findOne({
        attributes: ['uuid', 'module_class_code', 'number_of_credits', 'lecturer_name', 'courseUuid'], 
        where:{uuid: req.params.module_class_uuid},
        include: [{
            model: Student,
            attributes: ['uuid', 'fullname', 'student_code', 'class_name', 'birth_date', 'class_code'],
            through: {
                model: StudentModuleClass,
                as: 'condition',
                attributes: ['status']
            }
        }] 
    })
    .then(result => {
        if(!result) {
            return res.status(404).json({
                message: 'Not Found'
            });
        }
        else {
            return res.status(200).json({
                result: result
            });
        }
    })
    .catch(error => {
        res.status(500).json({
            error: error,
            message: 'Có lỗi xảy ra'
        })
    })
}