const Student = require('../models/Student'); // Mongoose Student model
const AWS = require('aws-sdk');

const s3 = new AWS.S3({ region: 'ap-south-1' });
const sqs = new AWS.SQS({ region: 'ap-south-1' });
const ssm = new AWS.SSM({ region: 'ap-south-1' });

const getBucketNameFromSSM = async () => {
  const result = await ssm.getParameter({
    Name: '/course-backend/s3-bucket-name',
    WithDecryption: true
  }).promise();
  return result.Parameter.Value;
};

async function getQueueUrlFromSSM() {
  const result = await ssm.getParameter({
    Name: '/course-backend/SQS_QUEUE_URL',
    WithDecryption: true
  }).promise();
  return result.Parameter.Value;
}

// Enroll a single student (Save to MongoDB)
exports.enrollStudent = async (req, res) => {
  try {
    const studentData = req.body;
    const newStudent = new Student(studentData);
    await newStudent.save();
    res.send('Student enrolled successfully');
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).send('Error enrolling student');
  }
};

// Get all students (Retrieve from MongoDB)
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Upload CSV of students and save them to MongoDB
exports.uploadStudentCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucketName = await getBucketNameFromSSM();
    const timestamp = Date.now();
    const originalName = req.file.originalname;
    const key = `uploads/${timestamp}_${originalName}`;

    // Step 1: Upload CSV to S3
    await s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();
    console.log('✅ CSV uploaded to S3:', key);

    // Step 2: Wait for converted JSON to appear in S3
    const jsonKey = key.replace('uploads/', 'converted/').replace('.csv', '.json');
    const QUEUE_URL = await getQueueUrlFromSSM();
    const message = {
      bucket: bucketName,
      jsonKey: jsonKey,
      dataType: 'students'
    };

    await sqs.sendMessage({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message)
    }).promise();
    console.log('📩 Message sent to SQS:', message);

    res.status(200).json({ message: 'CSV uploaded and message sent to queue for processing.' });

  } catch (error) {
    console.error('❌ Error uploading CSV and processing:', error.message || error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};