const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const serverless = require('serverless-http')
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const ssm = new AWS.SSM();
require('dotenv').config();

const timetableRoutes = require('./Routes/timetableRoutes');
const studentRoutes = require('./Routes/studentRoutes');
const teacherRoutes = require('./Routes/teacherRoutes');
const classroomRoutes = require('./Routes/classroomRoutes');
const subjectRoutes = require('./Routes/SubjectRoutes');

const app = express();
// const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Atlas connection
const getDbUri = async () => {
  try {
    const res = await ssm.getParameter({ Name: '/course-backend/MONGO_URI', WithDecryption: true }).promise();
    return res.Parameter.Value;
  } catch (error) {
    console.error('Error fetching MongoDB URI from SSM:', error);
    throw new Error('Error fetching DB URI');
  }
};

// Use the MongoDB URI fetched from SSM
getDbUri().then((dbUri) => {
  mongoose.connect(dbUri)
    .then(() => console.log('MongoDB Atlas connected'))
    .catch((error) => console.error('MongoDB connection error:', error));
}).catch((error) => {
  console.error('Failed to get DB URI:', error);
});

// Route handling
app.use('/api/timetable', timetableRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/subjects', subjectRoutes);

// Start the server
module.exports.handler = serverless(app);

// app.listen(5000, () => {
//   console.log('Server is running on http://localhost:5000');
// })