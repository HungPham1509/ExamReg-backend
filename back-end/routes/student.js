const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student');

router.get('/', studentController.getAllStudents);
router.get('/:student_uuid', studentController.getStudent);
router.delete('/:student_uuid', studentController.deleteStudent);
router.patch('/:student_uuid', studentController.editStudent);
router.post('/add-student-accounts', studentController.addStudentAccounts);

module.exports = router;