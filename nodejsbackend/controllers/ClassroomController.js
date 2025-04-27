const csv = require('csvtojson');
const Classroom = require('../models/Classroom'); // Mongoose Classroom model

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

// Upload CSV of classrooms and save them to MongoDB
exports.uploadClassroomCSV = async (req, res) => {
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

    const jsonKey = key.replace('uploads/', 'converted/').replace('.csv', '.json');
    const QUEUE_URL = await getQueueUrlFromSSM();
    const message = {
      
      bucket: bucketName,
      jsonKey: jsonKey,
      dataType: 'classrooms'
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

// Get all classrooms from MongoDB
exports.getClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
};
