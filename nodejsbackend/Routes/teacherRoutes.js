const express = require('express');
const { uploadTeachersCSV, getTeachers, teacherTimeTable, studentUnderTeacher } = require('../controllers/teacherController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload-teachers', upload.single('file'), uploadTeachersCSV);
router.get('/getTimeTable/:teacherName', teacherTimeTable);
router.get('/getStudentUnderTeacher/:teacherName', studentUnderTeacher);
router.get('/', getTeachers);

module.exports = router;
