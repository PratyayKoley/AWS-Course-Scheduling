const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  branch: { 
    type: String, 
    required: true 
  },
  semester: { 
    type: Number, 
    required: true 
  },
  classesPerWeek: { 
    type: Number, 
    required: true 
  },
  requiresLab: { 
    type: Boolean, 
    default: false 
  },
  isElective: { 
    type: Boolean, 
    default: false 
  },
  electiveGroup: { 
    type: String, 
    default: null 
  },
  expectedCapacity: { 
    type: Number, 
    default: 30 // Adjust as per average expected class size
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
