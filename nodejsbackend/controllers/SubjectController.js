const csv = require('csvtojson');
const Subject = require('../models/Subject'); // Mongoose Student model

// Get all students (Retrieve from MongoDB)
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Upload CSV of students and save them to MongoDB
exports.uploadSubjectsCSV = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Parse the CSV file into JSON
      const subjects = await csv().fromString(req.file.buffer.toString());
  
      // Insert multiple classrooms into MongoDB
      await Subject.insertMany(subjects);
  
      res.json({ message: 'CSV data uploaded and classrooms saved to MongoDB successfully' });
    } catch (error) {
      console.error('Error processing CSV file:', error);
      res.status(500).json({ error: 'Failed to process CSV file' });
    }
  };
