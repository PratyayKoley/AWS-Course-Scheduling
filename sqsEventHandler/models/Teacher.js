const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teaching_subjects: [{ type: String, required: true }],
  lectureLoad: { type: Number, default: 0 }, // Track assigned lectures per week
});

module.exports = mongoose.model('Teacher', teacherSchema);
