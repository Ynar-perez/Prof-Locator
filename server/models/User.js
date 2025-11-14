
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the array for the instructor's schedule
const scheduleItemSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: {
    type: String, // contains time i.e --> "8:00AM - 11:00AM"
    required: true
  }
});

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