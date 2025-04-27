const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const Student = require("models/Student");
const Teacher = require("models/Teacher");
const Classroom = require("models/Classroom");

const s3 = new AWS.S3({ region: "ap-south-1" });
const ssm = new AWS.SSM({ region: "ap-south-1" });

let isConnected = false;

const getDbUri = async () => {
  try {
    const res = await ssm
      .getParameter({ Name: "/course-backend/MONGO_URI", WithDecryption: true })
      .promise();
    console.log(res.Parameter.Value);
    return res.Parameter.Value;
  } catch (error) {
    console.error("Error fetching MongoDB URI from SSM:", error);
    throw new Error("Error fetching DB URI");
  }
};

async function connectToDatabase() {
  if (isConnected) return;

  const dbUri = await getDbUri();

  if (typeof dbUri !== "string") {
    throw new Error("Invalid MongoDB URI returned from SSM");
  }

  await mongoose.connect(dbUri)
  isConnected = true;
}

exports.handleSqsEvent = async (event) => {
  console.log("🚀 Lambda triggered with event:", JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      const { bucket, jsonKey, dataType } = messageBody;

      // Connect to database
      await connectToDatabase();

      const s3Object = await s3
        .getObject({
          Bucket: bucket,
          Key: jsonKey,
        })
        .promise();

      // Parse the JSON file from S3
      const data = JSON.parse(s3Object.Body.toString("utf-8"));

      if (dataType === "students") {
        // Process students
        await Student.insertMany(data);
        console.log(`✅ Inserted ${data.length} students into MongoDB`);
      } else if (dataType === "teachers") {
        // Process teachers
        await Teacher.insertMany(data);
        console.log(`✅ Inserted ${data.length} teachers into MongoDB`);
      } else if (dataType === "classrooms") {
        await Classroom.insertMany(data);
        console.log(`✅ Inserted ${data.length} classrooms into MongoDB`);
      } else {
        console.log(`⚠️ Unknown dataType: ${dataType}. Skipping this file.`);
      }
    } catch (error) {
      console.error("❌ Error processing record:", error.message || error);
    }
  }

  return { statusCode: 200 };
};
