const express = require('express');
const router = express.Router();
const registerController = require('../controllers/register');

router.get('/:examination_semester_uuid', registerController.getShiftsOfStudentCourses);
router.post('/:student_uuid/:examination_semester_uuid', registerController.registerShift);
router.delete('/:student_uuid/:examination_semester_uuid', registerController.deleteRegisteredShift);
router.get('/:student_uuid/:examination_semester_uuid', registerController.getAllStudentRegisteredShift);

module.exports = router;