const mongoose = require('mongoose'); 

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  capacity: { type: Number },
  isLab: { type: Boolean, default: false }, // Indicates if the room is a lab
});

module.exports = mongoose.model('Classroom', classroomSchema);