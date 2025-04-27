const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: String, required: true },
  subjects: [{ type: String }], // Array of subjects based on semester
  llc: { type: String }, // LLC course if applicable
  elective1: { type: String }, // First elective course
  elective2: { type: String }, // Second elective course, if applicable
  openElective: { type: String }, // Open elective course if applicable
});

module.exports = mongoose.model("Student", studentSchema);
