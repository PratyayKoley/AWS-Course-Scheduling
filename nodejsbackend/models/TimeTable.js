const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  semester: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6] },
  day: { type: String, required: true },
  timeSlot: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String },
  classroom: { type: String },
  isElective: { type: Boolean, default: false },
  electiveGroup: { type: String, default: null } // Grouping for electives
});

module.exports = mongoose.model('Timetable', timetableSchema);
