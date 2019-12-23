const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course');


router.get('/', courseController.getAllCourse);
router.get('/:course_uuid', courseController.getCourse);
router.patch('/:course_uuid', courseController.editCourse);


module.exports = router;