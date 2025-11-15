
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the array for the instructor's schedule
const scheduleItemSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  // 24-hour format
  startTime: {
    type: String, 
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  // This is the "Base Status" for that time block
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Class', 'In Meeting', 'Busy', 'Away', 'Unavailable'],
    default: 'Available'
  }
}, { _id: false }); // _id: false makes this a cleaner sub-document

const userSchema = new Schema({
  // --- Fields for ALL Users ---
  email: {
    type: String,
    required: true,
    unique: true, // This make the ID unique on login
    trim: true
  },
  name: {
    type: String, 
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5 
  },
  role: {
    type: String,
    required: true,
    enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    default: 'STUDENT'
  },

  // --- Fields for INSTRUCTOR Only ---
  instructorStatus: {
    type: String,
    enum: ['Available', 'In Class', 'In Meeting', 'Busy', 'Away', 'Unavailable'],
    default: 'Unavailable' // Good default for new instructors
  },

  schedule: [scheduleItemSchema] // This will be an array of the items above
  
}, {
  // Adds `createdAt` and `updatedAt` timestamps automatically
  timestamps: true 
});


const User = mongoose.model('User', userSchema, 'Users'); 
module.exports = User;