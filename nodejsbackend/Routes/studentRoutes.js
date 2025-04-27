const express = require('express');
const { enrollStudent, getStudents, uploadStudentCSV } = require('../controllers/StudentController');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/enroll-student', enrollStudent);
router.post('/upload-students', upload.single('file'), uploadStudentCSV);
router.get('/', getStudents);

module.exports = router;
 