const express = require('express');
const { generateTimeTable } = require('../controllers/TimeTableController');

const router = express.Router();

router.get('/generate', generateTimeTable);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Route Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;