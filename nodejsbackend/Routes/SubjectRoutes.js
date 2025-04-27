const express = require('express');
const { uploadSubjectsCSV, getSubjects } = require('../controllers/SubjectController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload-subjects', upload.single('file'), uploadSubjectsCSV);
router.get('/', getSubjects);

module.exports = router;
