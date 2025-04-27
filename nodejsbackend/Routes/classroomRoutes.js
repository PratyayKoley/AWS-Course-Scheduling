const express = require('express');
const { uploadClassroomCSV, getClassrooms } = require('../controllers/ClassroomController');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/upload-classrooms', upload.single('file'), uploadClassroomCSV);
router.get('/', getClassrooms);

module.exports = router;