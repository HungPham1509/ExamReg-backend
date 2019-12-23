const express = require('express');
const router = express.Router();

const examinationSemesterController = require('../controllers/examinationSemester');

router.post('/', examinationSemesterController.createExaminationSemester);
router.post('/create-examination-room', examinationSemesterController.createRoom);
router.post('/:examination_semester_uuid', examinationSemesterController.creatExaminationShift);
router.get('/examination-shift/:examination_shift_uuid', examinationSemesterController.getExaminationShift);
//router.patch('/examination-shift/:examination_shift_uuid', examinationSemesterController.editExaminationShift);
router.delete('/examination-shift/:examination_shift_uuid', examinationSemesterController.deleteExaminationShift);
router.get('/:examination_semester_uuid', examinationSemesterController.getAllExaminationShifts);
router.get('/', examinationSemesterController.getAllExaminationSemesters);
module.exports = router;