const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Timetable = require('../models/TimeTable');
const Classroom = require('../models/Classroom');

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

// Upload CSV of teachers and save them to MongoDB
exports.uploadTeachersCSV = async (req, res) => {
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
      dataType: 'teachers'
    };

    await sqs.sendMessage({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message)
    }).promise();
    console.log('📩 Message sent to SQS:', message);

    res.status(200).json({ message: 'CSV uploaded and message sent to queue for processing.' });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
};

// Get all teachers from MongoDB
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error('❌ Error uploading CSV teachers and processing:', error.message || error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get students under a specific teacher based on the subjects they teach
exports.studentUnderTeacher = async (req, res) => {
  try {
    const { teacherName } = req.params;

    // Find the teacher by name
    const teacher = await Teacher.findOne({ name: teacherName });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Find students whose subjects match the teacher's subjects
    const studentsUnderTeacher = await Student.find({
      $or: [
        { subjects: { $in: teacher.teaching_subjects } },
        { llc: { $in: teacher.teaching_subjects } },
        { elective1: { $in: teacher.teaching_subjects } },
        { elective2: { $in: teacher.teaching_subjects } },
        { openElective: { $in: teacher.teaching_subjects } }
      ]
    });
    
    if (studentsUnderTeacher.length > 0) {
      return res.json(studentsUnderTeacher);
    } else {
      return res.status(404).json({ message: 'No students found under this teacher' });
    }
  } catch (error) {
    console.error('Error fetching students under teacher:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.teacherTimeTable = async (req, res) => {
  const { teacherName } = req.params;

  try {
    // Fetch the timetable entries directly by teacher name
    const timetableEntries = await Timetable.find({ teacher: teacherName }).populate('classroom');

    if (timetableEntries.length === 0) {
      return res.status(404).json({ message: 'No schedule found for this teacher' });
    }

    // Organize the schedule by day and time slot
    const teacherSchedule = {};

    timetableEntries.forEach(entry => {
      if (!teacherSchedule[entry.day]) {
        teacherSchedule[entry.day] = []; // Initialize an empty array for each day
      }

      teacherSchedule[entry.day].push({
        timeSlot: entry.timeSlot,
        subject: entry.subject,
        classroom: entry.classroom,
      });
    });

    res.json({ teacherName, schedule: teacherSchedule });
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
